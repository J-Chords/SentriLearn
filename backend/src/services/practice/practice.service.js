// =============================================
// REVIEWED PRACTICE SERVICE
//
// Ground truth (is_legitimate + indicator presence) is never sent
// to the client before a decision is submitted. Only the FIRST
// attempt per scenario counts toward the scored awareness metrics;
// later retries remain available as ungraded practice.
// =============================================
import { getDb, withTransaction } from '../../db/connection.js';
import { logActivity } from '../activity/activity.service.js';

function currentVersion(db, scenarioId) {
  const row = db.prepare('SELECT version FROM practice_scenarios WHERE id = ?').get(scenarioId);
  return row?.version || 1;
}

export function listPracticeScenarios() {
  const db = getDb();
  return db.prepare('SELECT * FROM practice_scenarios WHERE is_active = 1').all().map(toPublicScenario);
}

export function getPracticeScenario(scenarioId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM practice_scenarios WHERE id = ? AND is_active = 1').get(scenarioId);
  return row ? toPublicScenario(row) : null;
}

function toPublicScenario(row) {
  return {
    id: row.id,
    version: row.version,
    category: row.category,
    targetContext: row.target_context,
    difficulty: row.difficulty,
    subject: row.subject,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    body: row.body_html,
    // NOTE: is_legitimate and indicator ground truth are intentionally omitted.
  };
}

export const INDICATOR_LABELS = {
  'urgent-language': 'Urgent language',
  'suspicious-sender': 'Suspicious sender',
  'mismatched-domain': 'Mismatched domain',
  'unexpected-attachment': 'Unexpected attachment',
  'credential-request': 'Credential request',
  'suspicious-link': 'Suspicious link',
  'unusual-grammar': 'Unusual grammar',
  'emotional-pressure': 'Emotional pressure',
};

export function submitPracticeAttempt(userId, scenarioId, { selectedIndicators, decision }, campaignId = null) {
  const db = getDb();
  const scenario = db.prepare('SELECT * FROM practice_scenarios WHERE id = ? AND is_active = 1').get(scenarioId);
  if (!scenario) {
    const err = new Error('Scenario not found.');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const groundTruth = db.prepare('SELECT indicator_key, is_present FROM practice_scenario_indicators WHERE scenario_id = ?').all(scenarioId);
  const truthMap = Object.fromEntries(groundTruth.map((g) => [g.indicator_key, Boolean(g.is_present)]));
  const actualPositives = Object.keys(truthMap).filter((k) => truthMap[k]);

  const invalidKeys = selectedIndicators.filter((k) => !(k in truthMap));
  if (invalidKeys.length > 0) {
    const err = new Error(`Unknown indicator key(s): ${invalidKeys.join(', ')}`);
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  const correctlyIdentified = actualPositives.filter((k) => selectedIndicators.includes(k));
  const missed = actualPositives.filter((k) => !selectedIndicators.includes(k));
  const falsePositives = selectedIndicators.filter((k) => !truthMap[k]);

  const correctDecision = scenario.is_legitimate ? 'legitimate' : 'phishing';
  const decisionCorrect = decision === correctDecision;

  const isFirstAttempt = !db.prepare('SELECT 1 FROM practice_attempts WHERE user_id = ? AND scenario_id = ?').get(userId, scenarioId);
  const now = new Date().toISOString();

  const attemptId = withTransaction(() => {
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO practice_attempts (
        user_id, scenario_id, scenario_version, selected_indicators_json, decision, decision_correct,
        indicator_correct_count, indicator_total_positive, is_first_attempt, campaign_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, scenarioId, scenario.version, JSON.stringify(selectedIndicators), decision, decisionCorrect ? 1 : 0,
      correctlyIdentified.length, actualPositives.length, isFirstAttempt ? 1 : 0, campaignId, now
    );

    if (campaignId) {
      db.prepare(`
        INSERT INTO campaign_scenario_completions (campaign_id, user_id, scenario_id, practice_attempt_id, completed_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(campaign_id, user_id, scenario_id) DO NOTHING
      `).run(campaignId, userId, scenarioId, lastInsertRowid, now);
    }

    return lastInsertRowid;
  });

  logActivity(userId, 'practice.checked', `Identified ${correctlyIdentified.length}/${actualPositives.length} suspicious indicators`);
  if (decision === 'phishing') {
    logActivity(userId, 'practice.reported', 'Reported a practice scenario as phishing');
  }

  return {
    attemptId,
    isFirstAttempt,
    decision,
    correctDecision,
    decisionCorrect,
    isLegitimate: Boolean(scenario.is_legitimate),
    indicators: {
      correctlyIdentified: correctlyIdentified.map((k) => ({ key: k, label: INDICATOR_LABELS[k] })),
      missed: missed.map((k) => ({ key: k, label: INDICATOR_LABELS[k] })),
      falsePositives: falsePositives.map((k) => ({ key: k, label: INDICATOR_LABELS[k] })),
      totalPositive: actualPositives.length,
    },
    tacticsSummary: scenario.tactics_summary,
    manipulationTechniques: JSON.parse(scenario.manipulation_techniques_json || '[]'),
  };
}

/** "Reviewed-practice decision accuracy" (30% weight) — first attempts only. */
export function getDecisionAccuracy(userId) {
  const db = getDb();
  const rows = db.prepare('SELECT decision_correct as ok FROM practice_attempts WHERE user_id = ? AND is_first_attempt = 1').all(userId);
  if (rows.length === 0) return { available: false, accuracy: null, attemptedCount: 0 };
  const correct = rows.filter((r) => r.ok).length;
  return { available: true, accuracy: Math.round((correct / rows.length) * 100), attemptedCount: rows.length };
}

/**
 * "Appropriate reporting of reportable practice scenarios" (15% weight) —
 * among first attempts on scenarios that ARE phishing, how many were reported.
 */
export function getReportingRate(userId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT pa.decision as decision
    FROM practice_attempts pa
    JOIN practice_scenarios ps ON ps.id = pa.scenario_id
    WHERE pa.user_id = ? AND pa.is_first_attempt = 1 AND ps.is_legitimate = 0
  `).all(userId);
  if (rows.length === 0) return { available: false, rate: null, eligibleCount: 0 };
  const reported = rows.filter((r) => r.decision === 'phishing').length;
  return { available: true, rate: Math.round((reported / rows.length) * 100), eligibleCount: rows.length };
}

export function listAttemptsForUser(userId) {
  const db = getDb();
  return db.prepare(`
    SELECT pa.id, pa.scenario_id as scenarioId, ps.subject, pa.decision, pa.decision_correct as decisionCorrect,
           pa.is_first_attempt as isFirstAttempt, pa.created_at as createdAt
    FROM practice_attempts pa
    JOIN practice_scenarios ps ON ps.id = pa.scenario_id
    WHERE pa.user_id = ?
    ORDER BY pa.created_at DESC
  `).all(userId);
}
