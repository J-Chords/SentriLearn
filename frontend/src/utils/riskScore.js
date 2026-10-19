// =============================================
// RISK DISPLAY HELPERS
//
// Scoring itself is computed server-side (see backend
// docs/IMPLEMENTATION_STATUS.md) — this file only maps a risk
// level onto the existing badge/color system for display.
// =============================================

export function riskBadgeVariant(level) {
  if (level === 'low') return 'low';
  if (level === 'medium') return 'medium';
  if (level === 'high') return 'critical';
  return 'ghost'; // null/unassessed
}

export function awarenessLevelLabel(percentage) {
  if (percentage == null) return 'Not yet assessed';
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 75) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Needs Improvement';
}
