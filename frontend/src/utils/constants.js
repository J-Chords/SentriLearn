// =============================================
// PHISHING SIMULATION LAB — SCENARIO CONSTANTS
//
// These map onto the existing backend contract
// (category / target / impersonation / severity / urgency / tone)
// without requiring any backend changes.
// =============================================

export const SCENARIO_TYPES = [
  'Account Verification',
  'Password Expiry',
  'Scholarship Notification',
  'Shared Document',
  'HR / Payroll Update',
];

export const TARGET_CONTEXTS = ['University', 'Workplace', 'Personal'];

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

/** Scenario type → who the simulation impersonates (backend `impersonation` field). */
export const IMPERSONATION_BY_SCENARIO = {
  'Account Verification': 'Microsoft / Google',
  'Password Expiry': 'IT Support Team',
  'Scholarship Notification': 'University Financial Aid Office',
  'Shared Document': 'Cloud Storage Provider',
  'HR / Payroll Update': 'HR Department',
};

/** Difficulty → backend severity/urgency/tone parameters. */
export const DIFFICULTY_TO_PARAMS = {
  Beginner: { severity: 'low', urgency: 4, tone: 'friendly' },
  Intermediate: { severity: 'medium', urgency: 6, tone: 'professional' },
  Advanced: { severity: 'high', urgency: 9, tone: 'urgent' },
};
