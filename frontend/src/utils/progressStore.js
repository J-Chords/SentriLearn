// =============================================
// LEARNER PROGRESS STORE
//
// Single source of truth for training progress, assessment
// results, phishing-detection stats and reporting behaviour.
// All awareness/risk scoring flows through utils/riskScore.js
// so the number is calculated once and reused everywhere.
// =============================================
import { STORAGE_KEYS, readStorage, writeStorage, ensureSeeded } from './storage.js';
import { TRAINING_MODULES } from '../data/trainingModules.js';
import { ASSESSMENTS } from '../data/assessments.js';
import { DEFAULT_ACTIVITY, newActivity } from '../data/activity.js';
import { calculateAwarenessScore, getRiskLevel } from './riskScore.js';

/* ---------------------------------------------------------
 * Default seed state — mirrors the module list shown on the
 * learner dashboard: two modules completed, one at 70%, one
 * at 40%, two not started yet.
 * ------------------------------------------------------- */
const DEFAULT_MODULE_PROGRESS = {
  'intro-to-cybersecurity': { percent: 100, completedLessonIds: ['what-is-cybersecurity', 'common-cyber-threats', 'cia-triad', 'building-safe-habits'] },
  'phishing-awareness': { percent: 100, completedLessonIds: ['what-is-phishing', 'common-warning-signs', 'suspicious-links-domains', 'fake-login-pages', 'reporting-suspicious-messages'] },
  'password-security': { percent: 70, completedLessonIds: [] },
  'social-engineering': { percent: 40, completedLessonIds: [] },
  'safe-browsing': { percent: 0, completedLessonIds: [] },
  'email-security': { percent: 0, completedLessonIds: [] },
};

const DEFAULT_ASSESSMENT_RESULTS = {
  'phishing-awareness': {
    score: 8,
    total: 10,
    percentage: 80,
    completedAt: '2026-09-22T09:15:00.000Z',
    answers: { 1: 2, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1, 7: 0, 8: 1, 9: 1, 10: 1 },
  },
};

const DEFAULT_SIMULATION_STATS = {
  scenariosRun: 5,
  indicatorsShown: 20,
  indicatorsIdentified: 16,
  reportedAsPhishing: 3,
};

const DEFAULT_REPORTS = [];

/* ---------------------------------------------------------
 * Seeding
 * ------------------------------------------------------- */
export function seedDefaults() {
  ensureSeeded(STORAGE_KEYS.MODULE_PROGRESS, DEFAULT_MODULE_PROGRESS);
  ensureSeeded(STORAGE_KEYS.ASSESSMENT_RESULTS, DEFAULT_ASSESSMENT_RESULTS);
  ensureSeeded(STORAGE_KEYS.SIMULATION_STATS, DEFAULT_SIMULATION_STATS);
  ensureSeeded(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
  ensureSeeded(STORAGE_KEYS.CAMPAIGNS, null); // seeded separately by data/campaigns.js consumer
  ensureSeeded(STORAGE_KEYS.ACTIVITY, DEFAULT_ACTIVITY);
}

/* ---------------------------------------------------------
 * Module progress
 * ------------------------------------------------------- */
export function getModuleProgress() {
  return readStorage(STORAGE_KEYS.MODULE_PROGRESS, DEFAULT_MODULE_PROGRESS);
}

export function getModuleProgressFor(moduleId) {
  const all = getModuleProgress();
  return all[moduleId] || { percent: 0, completedLessonIds: [] };
}

export function toggleLessonComplete(moduleId, lessonId) {
  const all = getModuleProgress();
  const mod = TRAINING_MODULES.find((m) => m.id === moduleId);
  const totalLessons = mod?.lessons?.length || 1;
  const current = all[moduleId] || { percent: 0, completedLessonIds: [] };

  const isDone = current.completedLessonIds.includes(lessonId);
  const completedLessonIds = isDone
    ? current.completedLessonIds.filter((id) => id !== lessonId)
    : [...current.completedLessonIds, lessonId];

  const percent = Math.round((completedLessonIds.length / totalLessons) * 100);
  const updated = { ...all, [moduleId]: { percent, completedLessonIds } };
  writeStorage(STORAGE_KEYS.MODULE_PROGRESS, updated);

  if (percent === 100 && !isDone) {
    addActivity('BookOpen', `Completed ${mod?.title || 'training module'}`);
  }

  return updated[moduleId];
}

export function moduleStatus(percent) {
  if (percent >= 100) return 'completed';
  if (percent > 0) return 'in_progress';
  return 'not_started';
}

export function getTrainingCompletionPercent() {
  const all = getModuleProgress();
  const percents = TRAINING_MODULES.map((m) => all[m.id]?.percent ?? 0);
  if (percents.length === 0) return 0;
  return Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length);
}

export function getModulesCompletedCount() {
  const all = getModuleProgress();
  return TRAINING_MODULES.filter((m) => (all[m.id]?.percent ?? 0) >= 100).length;
}

/* ---------------------------------------------------------
 * Assessment results
 * ------------------------------------------------------- */
export function getAssessmentResults() {
  return readStorage(STORAGE_KEYS.ASSESSMENT_RESULTS, DEFAULT_ASSESSMENT_RESULTS);
}

export function getAssessmentResultFor(assessmentId) {
  return getAssessmentResults()[assessmentId] || null;
}

export function saveAssessmentResult(assessmentId, result) {
  const all = getAssessmentResults();
  const updated = { ...all, [assessmentId]: result };
  writeStorage(STORAGE_KEYS.ASSESSMENT_RESULTS, updated);

  const assessment = ASSESSMENTS.find((a) => a.id === assessmentId);
  addActivity('ClipboardCheck', `Completed ${assessment?.title || 'an assessment'} — scored ${result.percentage}%`);
  return updated;
}

export function getQuizAverage() {
  const all = getAssessmentResults();
  const attempts = Object.values(all);
  if (attempts.length === 0) return 0;
  return Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
}

/* ---------------------------------------------------------
 * Phishing simulation stats (Simulation Lab)
 * ------------------------------------------------------- */
export function getSimulationStats() {
  return readStorage(STORAGE_KEYS.SIMULATION_STATS, DEFAULT_SIMULATION_STATS);
}

export function recordSimulationCheck({ shown, identified }) {
  const stats = getSimulationStats();
  const updated = {
    ...stats,
    scenariosRun: stats.scenariosRun + 1,
    indicatorsShown: stats.indicatorsShown + shown,
    indicatorsIdentified: stats.indicatorsIdentified + identified,
  };
  writeStorage(STORAGE_KEYS.SIMULATION_STATS, updated);
  addActivity('Eye', `Identified ${identified}/${shown} suspicious email indicators`);
  return updated;
}

export function recordSimulationReported() {
  const stats = getSimulationStats();
  const updated = { ...stats, reportedAsPhishing: stats.reportedAsPhishing + 1 };
  writeStorage(STORAGE_KEYS.SIMULATION_STATS, updated);
  return updated;
}

export function getPhishingDetectionPercent() {
  const stats = getSimulationStats();
  if (stats.indicatorsShown === 0) return 0;
  return Math.round((stats.indicatorsIdentified / stats.indicatorsShown) * 100);
}

/* ---------------------------------------------------------
 * Reporting behaviour (Report Phishing page + simulation reports)
 * ------------------------------------------------------- */
export function getReports() {
  return readStorage(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
}

export function submitReport(report) {
  const all = getReports();
  const updated = [{ id: `report-${Date.now()}`, submittedAt: new Date().toISOString(), ...report }, ...all];
  writeStorage(STORAGE_KEYS.REPORTS, updated);
  addActivity('Flag', 'Submitted a suspicious message report');
  return updated;
}

export function getReportingBehaviourPercent() {
  const reportsCount = getReports().length;
  const simReports = getSimulationStats().reportedAsPhishing;
  const base = 70;
  return Math.max(0, Math.min(100, base + (reportsCount + simReports) * 2));
}

/* ---------------------------------------------------------
 * Recent activity
 * ------------------------------------------------------- */
export function getActivity() {
  return readStorage(STORAGE_KEYS.ACTIVITY, DEFAULT_ACTIVITY);
}

export function addActivity(icon, text) {
  const all = getActivity();
  const updated = [newActivity(icon, text), ...all].slice(0, 20);
  writeStorage(STORAGE_KEYS.ACTIVITY, updated);
  return updated;
}

/* ---------------------------------------------------------
 * Aggregate awareness score — the single source of truth used
 * by the learner dashboard, progress page and admin analytics.
 * ------------------------------------------------------- */
export function getAwarenessSnapshot() {
  const trainingCompletion = getTrainingCompletionPercent();
  const assessmentAvg = getQuizAverage();
  const phishingDetection = getPhishingDetectionPercent();
  const reportingBehaviour = getReportingBehaviourPercent();

  const score = calculateAwarenessScore({
    assessmentAvg,
    phishingDetection,
    trainingCompletion,
    reportingBehaviour,
  });
  const risk = getRiskLevel(score);

  return {
    score,
    risk,
    trainingCompletion,
    assessmentAvg,
    phishingDetection,
    reportingBehaviour,
    modulesCompleted: getModulesCompletedCount(),
    totalModules: TRAINING_MODULES.length,
  };
}
