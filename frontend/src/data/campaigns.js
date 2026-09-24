// =============================================
// SIMULATION CAMPAIGNS — DEMO SEED DATA
// Controlled academic phishing-awareness exercises (no real email is sent).
// =============================================

export const CAMPAIGN_SCENARIOS = [
  'Account Verification',
  'Password Expiry',
  'Scholarship Notification',
  'Shared Document',
  'HR / Payroll Update',
];

export const CAMPAIGN_TARGET_GROUPS = ['Students', 'Employees', 'University Staff', 'New Hires'];

export const CAMPAIGN_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const CAMPAIGN_STATUSES = ['Draft', 'Active', 'Completed'];

export const DEFAULT_CAMPAIGNS = [
  {
    id: 'campaign-microsoft-password-reset',
    name: 'Microsoft Password Reset',
    target: 'Students',
    scenario: 'Password Expiry',
    difficulty: 'Intermediate',
    status: 'Completed',
    participants: 45,
    detectionRate: 78,
    reportRate: 64,
    startDate: '2026-06-02',
    description: 'Simulated Microsoft-branded password expiry notice sent to a sample group of students.',
  },
  {
    id: 'campaign-scholarship-notification',
    name: 'Scholarship Notification',
    target: 'Students',
    scenario: 'Scholarship Notification',
    difficulty: 'Beginner',
    status: 'Completed',
    participants: 38,
    detectionRate: 69,
    reportRate: 53,
    startDate: '2026-06-16',
    description: 'Simulated scholarship award notice requesting learners "confirm" personal details via a link.',
  },
  {
    id: 'campaign-hr-benefits-update',
    name: 'HR Benefits Update',
    target: 'Employees',
    scenario: 'HR / Payroll Update',
    difficulty: 'Advanced',
    status: 'Active',
    participants: 27,
    detectionRate: 74,
    reportRate: 59,
    startDate: '2026-09-08',
    description: 'Simulated HR benefits enrollment reminder with a spoofed internal portal link.',
  },
];
