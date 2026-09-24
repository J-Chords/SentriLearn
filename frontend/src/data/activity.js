// =============================================
// RECENT ACTIVITY — DEMO SEED DATA
// =============================================

export const DEFAULT_ACTIVITY = [
  {
    id: 'activity-1',
    icon: 'CheckCircle2',
    text: 'Completed Phishing Awareness Quiz',
    timestamp: '2026-09-22T09:15:00.000Z',
  },
  {
    id: 'activity-2',
    icon: 'Eye',
    text: 'Identified 4/5 suspicious email indicators',
    timestamp: '2026-09-21T14:40:00.000Z',
  },
  {
    id: 'activity-3',
    icon: 'BookOpen',
    text: 'Completed Password Security Lesson 2',
    timestamp: '2026-09-20T11:05:00.000Z',
  },
];

export function newActivity(icon, text) {
  return {
    id: `activity-${Date.now()}`,
    icon,
    text,
    timestamp: new Date().toISOString(),
  };
}
