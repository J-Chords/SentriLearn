// =============================================
// ANALYTICS SERVICE — per-learner snapshot & admin aggregates
//
// Every number here is derived from stored records. Nothing is
// hard-coded. Missing data renders as "unavailable", never as a
// misleading zero.
// =============================================
import { getDb } from '../../db/connection.js';
import { computeTrainingSummary } from '../training/training.service.js';
import { getLatestAssessmentAverage } from '../assessments/assessment.service.js';
import { getDecisionAccuracy, getReportingRate } from '../practice/practice.service.js';
import { calculateAwarenessScore } from '../scoring/awarenessScore.service.js';
import { getActivityForUser, getRecentPlatformActivity } from '../activity/activity.service.js';

export function getLearnerSnapshot(userId) {
  const training = computeTrainingSummary(userId);
  const assessment = getLatestAssessmentAverage(userId);
  const decisionAccuracy = getDecisionAccuracy(userId);
  const reportingRate = getReportingRate(userId);
  const awareness = calculateAwarenessScore({ assessment, decisionAccuracy, trainingCompletion: training, reportingRate });

  return {
    training,
    assessment,
    decisionAccuracy,
    reportingRate,
    awareness,
    recentActivity: getActivityForUser(userId, 8),
  };
}

function activeLearners(db) {
  return db.prepare("SELECT * FROM users WHERE role = 'learner' AND is_active = 1").all();
}

export function getAdminAnalytics() {
  const db = getDb();
  const learners = activeLearners(db);
  const totalLearners = learners.length;

  const perLearner = learners.map((u) => ({ user: u, snapshot: getLearnerSnapshot(u.id) }));

  // Lesson completion: aggregate completed / eligible across every active learner.
  const totalCompletedLessons = perLearner.reduce((s, p) => s + p.snapshot.training.completedLessons, 0);
  const totalEligibleLessons = perLearner.reduce((s, p) => s + p.snapshot.training.totalLessons, 0);
  const trainingCompletionPercent = totalEligibleLessons === 0 ? 0 : Math.round((totalCompletedLessons / totalEligibleLessons) * 100);

  // Latest assessment performance: average across learners who have attempted at least one.
  const assessed = perLearner.filter((p) => p.snapshot.assessment.available);
  const averageAssessmentScore = assessed.length === 0 ? null : Math.round(
    assessed.reduce((s, p) => s + p.snapshot.assessment.average, 0) / assessed.length
  );

  // Reviewed-practice decision accuracy, aggregate.
  const withPractice = perLearner.filter((p) => p.snapshot.decisionAccuracy.available);
  const averageDecisionAccuracy = withPractice.length === 0 ? null : Math.round(
    withPractice.reduce((s, p) => s + p.snapshot.decisionAccuracy.accuracy, 0) / withPractice.length
  );

  // Practice reporting rate, aggregate.
  const withReportable = perLearner.filter((p) => p.snapshot.reportingRate.available);
  const averageReportingRate = withReportable.length === 0 ? null : Math.round(
    withReportable.reduce((s, p) => s + p.snapshot.reportingRate.rate, 0) / withReportable.length
  );

  // Risk distribution — only over ASSESSED learners (awareness.available).
  const assessedLearners = perLearner.filter((p) => p.snapshot.awareness.available);
  const unassessedCount = totalLearners - assessedLearners.length;
  const riskCounts = { low: 0, medium: 0, high: 0 };
  assessedLearners.forEach((p) => { riskCounts[p.snapshot.awareness.riskLevel] += 1; });
  const riskDistribution = ['low', 'medium', 'high'].map((level) => ({
    level,
    count: riskCounts[level],
    percent: assessedLearners.length === 0 ? 0 : Math.round((riskCounts[level] / assessedLearners.length) * 100),
  }));

  // Per-module training performance (average completion % across learners).
  const moduleAgg = {};
  perLearner.forEach((p) => {
    p.snapshot.training.perModule.forEach((m) => {
      if (!moduleAgg[m.id]) moduleAgg[m.id] = { title: m.title, sum: 0, count: 0 };
      moduleAgg[m.id].sum += m.percent;
      moduleAgg[m.id].count += 1;
    });
  });
  const trainingPerformance = Object.values(moduleAgg).map((m) => ({
    module: m.title,
    percent: m.count === 0 ? 0 : Math.round(m.sum / m.count),
  }));

  // Reports overview.
  const reportCounts = db.prepare("SELECT status, COUNT(*) as c FROM reports GROUP BY status").all();
  const reportsByStatus = { received: 0, reviewed: 0, closed: 0 };
  reportCounts.forEach((r) => { reportsByStatus[r.status] = r.c; });

  // Campaign overview.
  const campaigns = db.prepare('SELECT * FROM campaigns').all();
  const campaignPerformance = campaigns.map((c) => {
    const assignments = db.prepare('SELECT COUNT(*) as c FROM campaign_assignments WHERE campaign_id = ?').get(c.id).c;
    const completions = db.prepare('SELECT COUNT(DISTINCT user_id) as c FROM campaign_scenario_completions WHERE campaign_id = ?').get(c.id).c;
    const decisions = db.prepare(`
      SELECT pa.decision_correct as ok
      FROM campaign_scenario_completions csc
      JOIN practice_attempts pa ON pa.id = csc.practice_attempt_id
      WHERE csc.campaign_id = ?
    `).all(c.id);
    const detectionRate = decisions.length === 0 ? null : Math.round((decisions.filter((d) => d.ok).length / decisions.length) * 100);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      targetCategory: c.target_category,
      assignedCount: assignments,
      completedCount: completions,
      detectionRate,
    };
  });

  // Per-learner table.
  const learnerTable = perLearner.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    category: p.user.learner_category,
    isDemoAccount: p.user.email.endsWith('@sentrilearn.local'),
    awarenessAvailable: p.snapshot.awareness.available,
    awarenessScore: p.snapshot.awareness.score,
    riskLevel: p.snapshot.awareness.riskLevel,
  }));

  return {
    totalLearners,
    // Surfaces to the UI so it can render an explicit "includes demo data" label
    // rather than silently blending seeded demo accounts into real figures.
    includesDemoAccounts: learnerTable.some((l) => l.isDemoAccount),
    trainingCompletionPercent,
    averageAssessmentScore,
    averageDecisionAccuracy,
    averageReportingRate,
    riskDistribution,
    unassessedCount,
    trainingPerformance,
    campaignPerformance,
    reportsByStatus,
    learnerTable,
    recentActivity: getRecentPlatformActivity(10),
  };
}
