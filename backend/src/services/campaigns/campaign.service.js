// =============================================
// CAMPAIGN SERVICE
//
// Assignment policy: membership is SNAPSHOTTED at activation time.
// A learner who joins or changes category after activation is not
// retroactively added to that campaign. Re-activation is not
// possible (a campaign moves draft -> active -> completed/archived).
// =============================================
import { getDb, withTransaction } from '../../db/connection.js';
import { logActivity } from '../activity/activity.service.js';

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  err.expose = true;
  return err;
}
function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  err.expose = true;
  return err;
}

export function isUserAssignedToCampaign(campaignId, userId) {
  const db = getDb();
  return Boolean(db.prepare('SELECT 1 FROM campaign_assignments WHERE campaign_id = ? AND user_id = ?').get(campaignId, userId));
}

export function campaignIncludesScenario(campaignId, scenarioId) {
  const db = getDb();
  return Boolean(db.prepare('SELECT 1 FROM campaign_scenarios WHERE campaign_id = ? AND scenario_id = ?').get(campaignId, scenarioId));
}

export function isCampaignActive(campaignId) {
  const db = getDb();
  const row = db.prepare('SELECT status FROM campaigns WHERE id = ?').get(campaignId);
  return row?.status === 'active';
}

export function createCampaign(adminId, { name, targetCategory, difficulty, description, startDate, scenarioIds }) {
  const db = getDb();
  const validScenarios = scenarioIds.length > 0
    ? db.prepare(`SELECT id FROM practice_scenarios WHERE id IN (${scenarioIds.map(() => '?').join(',')}) AND is_active = 1`).all(...scenarioIds)
    : [];
  if (validScenarios.length !== scenarioIds.length) {
    throw badRequest('One or more selected scenarios do not exist.');
  }

  return withTransaction(() => {
    const now = new Date().toISOString();
    const { lastInsertRowid: id } = db.prepare(`
      INSERT INTO campaigns (name, target_category, difficulty, description, status, start_date, created_by, created_at)
      VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)
    `).run(name, targetCategory, difficulty, description || null, startDate || null, adminId, now);

    const insertScenario = db.prepare('INSERT INTO campaign_scenarios (campaign_id, scenario_id) VALUES (?, ?)');
    scenarioIds.forEach((sid) => insertScenario.run(id, sid));

    return getCampaignDetail(id);
  });
}

export function getCampaignDetail(campaignId) {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) return null;

  const scenarios = db.prepare(`
    SELECT ps.id, ps.subject, ps.category, ps.difficulty
    FROM campaign_scenarios cs JOIN practice_scenarios ps ON ps.id = cs.scenario_id
    WHERE cs.campaign_id = ?
  `).all(campaignId);

  const assignedCount = db.prepare('SELECT COUNT(*) as c FROM campaign_assignments WHERE campaign_id = ?').get(campaignId).c;
  const completedLearnerCount = db.prepare(
    'SELECT COUNT(DISTINCT user_id) as c FROM campaign_scenario_completions WHERE campaign_id = ?'
  ).get(campaignId).c;

  const decisions = db.prepare(`
    SELECT pa.decision_correct as ok
    FROM campaign_scenario_completions csc
    JOIN practice_attempts pa ON pa.id = csc.practice_attempt_id
    WHERE csc.campaign_id = ?
  `).all(campaignId);
  const detectionRate = decisions.length === 0 ? null : Math.round((decisions.filter((d) => d.ok).length / decisions.length) * 100);

  const reportedCount = db.prepare(`
    SELECT COUNT(*) as c
    FROM campaign_scenario_completions csc
    JOIN practice_attempts pa ON pa.id = csc.practice_attempt_id
    WHERE csc.campaign_id = ? AND pa.decision = 'phishing'
  `).get(campaignId).c;
  const reportRate = decisions.length === 0 ? null : Math.round((reportedCount / decisions.length) * 100);

  return {
    id: campaign.id,
    name: campaign.name,
    targetCategory: campaign.target_category,
    difficulty: campaign.difficulty,
    description: campaign.description,
    status: campaign.status,
    startDate: campaign.start_date,
    createdAt: campaign.created_at,
    activatedAt: campaign.activated_at,
    completedAt: campaign.completed_at,
    archivedAt: campaign.archived_at,
    scenarios,
    assignedCount,
    completedLearnerCount,
    detectionRate,
    reportRate,
  };
}

export function listCampaignsForAdmin() {
  const db = getDb();
  const ids = db.prepare('SELECT id FROM campaigns ORDER BY created_at DESC').all().map((r) => r.id);
  return ids.map(getCampaignDetail);
}

export function listCampaignsForLearner(userId) {
  const db = getDb();
  const ids = db.prepare(`
    SELECT campaign_id FROM campaign_assignments WHERE user_id = ?
    ORDER BY assigned_at DESC
  `).all(userId).map((r) => r.campaign_id);

  return ids.map((id) => {
    const detail = getCampaignDetail(id);
    const completedScenarioIds = new Set(
      db.prepare('SELECT scenario_id FROM campaign_scenario_completions WHERE campaign_id = ? AND user_id = ?').all(id, userId)
        .map((r) => r.scenario_id)
    );
    return {
      ...detail,
      scenarios: detail.scenarios.map((s) => ({ ...s, completed: completedScenarioIds.has(s.id) })),
      myProgress: {
        completed: detail.scenarios.filter((s) => completedScenarioIds.has(s.id)).length,
        total: detail.scenarios.length,
      },
    };
  });
}

export function activateCampaign(adminId, campaignId) {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) throw notFound('Campaign not found.');
  if (campaign.status !== 'draft') throw badRequest('Only a draft campaign can be activated.');

  const scenarioCount = db.prepare('SELECT COUNT(*) as c FROM campaign_scenarios WHERE campaign_id = ?').get(campaignId).c;
  if (scenarioCount === 0) throw badRequest('Cannot activate a campaign without at least one reviewed scenario.');

  const recipients = db.prepare(`
    SELECT id FROM users
    WHERE role = 'learner' AND is_active = 1
      AND (? = 'both' OR learner_category = ? OR learner_category = 'both')
  `).all(campaign.target_category, campaign.target_category);

  if (recipients.length === 0) throw badRequest('Cannot activate a campaign with no matching learners.');

  return withTransaction(() => {
    const now = new Date().toISOString();
    const insertAssignment = db.prepare(`
      INSERT INTO campaign_assignments (campaign_id, user_id, assigned_at) VALUES (?, ?, ?)
      ON CONFLICT(campaign_id, user_id) DO NOTHING
    `);
    recipients.forEach((r) => insertAssignment.run(campaignId, r.id, now));

    db.prepare("UPDATE campaigns SET status = 'active', activated_at = ? WHERE id = ?").run(now, campaignId);
    logActivity(adminId, 'campaign.activated', `Activated campaign "${campaign.name}" for ${recipients.length} learner(s)`);
    return getCampaignDetail(campaignId);
  });
}

export function completeCampaign(adminId, campaignId) {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) throw notFound('Campaign not found.');
  if (campaign.status !== 'active') throw badRequest('Only an active campaign can be marked completed.');

  db.prepare("UPDATE campaigns SET status = 'completed', completed_at = ? WHERE id = ?").run(new Date().toISOString(), campaignId);
  logActivity(adminId, 'campaign.completed', `Marked campaign "${campaign.name}" as completed`);
  return getCampaignDetail(campaignId);
}

export function archiveCampaign(adminId, campaignId) {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) throw notFound('Campaign not found.');
  if (campaign.status === 'archived') throw badRequest('Campaign is already archived.');

  db.prepare("UPDATE campaigns SET status = 'archived', archived_at = ? WHERE id = ?").run(new Date().toISOString(), campaignId);
  logActivity(adminId, 'campaign.archived', `Archived campaign "${campaign.name}"`);
  return getCampaignDetail(campaignId);
}
