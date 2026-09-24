// =============================================
// ADMIN ANALYTICS — ORGANIZATION-WIDE DEMO DATA
//
// Aggregate, org-wide figures. There is no multi-user backend,
// so these represent a realistic demo cohort for screenshots.
// Campaign performance instead reuses the same localStorage
// campaigns data shown on the Simulation Campaigns page.
// =============================================

export const ORG_OVERVIEW = {
  totalLearners: 125,
  trainingCompletion: 78,
  averageAwarenessScore: 74,
  phishingReportRate: 64,
  phishingClickRate: 21,
};

export const RISK_DISTRIBUTION = [
  { level: 'low', label: 'Low Risk', percent: 63 },
  { level: 'medium', label: 'Medium Risk', percent: 27 },
  { level: 'high', label: 'High Risk', percent: 10 },
];

export const TRAINING_PERFORMANCE = [
  { module: 'Phishing Awareness', percent: 82 },
  { module: 'Password Security', percent: 76 },
  { module: 'Social Engineering', percent: 69 },
  { module: 'Safe Browsing', percent: 79 },
  { module: 'Email Security', percent: 73 },
];

export const LEARNER_PERFORMANCE = [
  { name: 'Alex Morgan', group: 'Students', score: 92, risk: 'low' },
  { name: 'Priya Nair', group: 'Employees', score: 88, risk: 'low' },
  { name: 'Daniel Osei', group: 'Students', score: 74, risk: 'low' },
  { name: 'Sara Chen', group: 'Employees', score: 61, risk: 'medium' },
  { name: 'Marcus Webb', group: 'Students', score: 52, risk: 'medium' },
  { name: 'Layla Haddad', group: 'Employees', score: 38, risk: 'high' },
];
