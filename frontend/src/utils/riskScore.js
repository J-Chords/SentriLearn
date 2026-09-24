// =============================================
// CYBERSECURITY AWARENESS SCORING
//
// Overall score = weighted blend of four inputs (each 0-100):
//   30% Assessment Performance
//   30% Phishing Detection
//   25% Training Completion
//   15% Reporting Behaviour
// =============================================

export const SCORE_WEIGHTS = {
  assessment: 0.3,
  phishingDetection: 0.3,
  trainingCompletion: 0.25,
  reportingBehaviour: 0.15,
};

export function calculateAwarenessScore({
  assessmentAvg = 0,
  phishingDetection = 0,
  trainingCompletion = 0,
  reportingBehaviour = 0,
}) {
  const raw =
    assessmentAvg * SCORE_WEIGHTS.assessment +
    phishingDetection * SCORE_WEIGHTS.phishingDetection +
    trainingCompletion * SCORE_WEIGHTS.trainingCompletion +
    reportingBehaviour * SCORE_WEIGHTS.reportingBehaviour;

  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getRiskLevel(score) {
  if (score >= 70) return { level: 'low', label: 'Low Risk' };
  if (score >= 40) return { level: 'medium', label: 'Medium Risk' };
  return { level: 'high', label: 'High Risk' };
}

/** Maps a risk level onto the existing severity badge/color system. */
export function riskBadgeVariant(level) {
  if (level === 'low') return 'low';
  if (level === 'medium') return 'medium';
  return 'critical';
}

export function awarenessLevelLabel(percentage) {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 75) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Needs Improvement';
}
