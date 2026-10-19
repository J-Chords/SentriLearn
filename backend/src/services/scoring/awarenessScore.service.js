// =============================================
// AWARENESS SCORE — single source of truth
//
// 30% latest assessment performance
// 30% reviewed-practice decision accuracy
// 25% lesson completion
// 15% appropriate reporting of reportable practice scenarios
//
// Any component that is genuinely unavailable (no attempts yet) is
// EXCLUDED and the remaining weights are redistributed proportionally,
// rather than being silently treated as a zero/poor score. If every
// component is unavailable, the whole score is "Not yet assessed".
//
// Risk bands (Low >=70, Medium >=40, High <40) are project-defined
// educational indicators, not a validated prediction of compromise.
// =============================================

export const SCORE_WEIGHTS = {
  assessment: 0.30,
  decisionAccuracy: 0.30,
  trainingCompletion: 0.25,
  reportingRate: 0.15,
};

/**
 * @param {object} inputs
 * @param {{available:boolean, average:number|null}} inputs.assessment
 * @param {{available:boolean, accuracy:number|null}} inputs.decisionAccuracy
 * @param {{trainingCompletionPercent:number, completedLessons:number}} inputs.trainingCompletion
 * @param {{available:boolean, rate:number|null}} inputs.reportingRate
 */
export function calculateAwarenessScore({ assessment, decisionAccuracy, trainingCompletion, reportingRate }) {
  // A learner who has done absolutely nothing yet (zero lessons AND no
  // assessment/practice/report activity) should read as "Not yet assessed",
  // not as a 0%/High Risk score. Training only counts once at least one
  // lesson is done, OR the learner has engaged with some other component.
  const otherActivityAvailable = assessment.available || decisionAccuracy.available || reportingRate.available;
  const trainingAvailable = trainingCompletion.completedLessons > 0 || otherActivityAvailable;

  const components = [
    { key: 'assessment', weight: SCORE_WEIGHTS.assessment, available: assessment.available, value: assessment.average },
    { key: 'decisionAccuracy', weight: SCORE_WEIGHTS.decisionAccuracy, available: decisionAccuracy.available, value: decisionAccuracy.accuracy },
    { key: 'trainingCompletion', weight: SCORE_WEIGHTS.trainingCompletion, available: trainingAvailable, value: trainingCompletion.trainingCompletionPercent },
    { key: 'reportingRate', weight: SCORE_WEIGHTS.reportingRate, available: reportingRate.available, value: reportingRate.rate },
  ];

  const availableComponents = components.filter((c) => c.available);
  if (availableComponents.length === 0) {
    return { available: false, score: null, riskLevel: null, riskLabel: 'Not yet assessed', componentsUsed: [] };
  }

  const totalWeight = availableComponents.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = availableComponents.reduce((sum, c) => sum + c.value * c.weight, 0);
  const score = Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight)));

  const riskLevel = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high';
  const riskLabel = riskLevel === 'low' ? 'Low Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'High Risk';

  return { available: true, score, riskLevel, riskLabel, componentsUsed: availableComponents.map((c) => c.key) };
}
