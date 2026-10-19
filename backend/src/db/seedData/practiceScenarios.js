// =============================================
// REVIEWED PRACTICE BANK
//
// A small, versioned set of fictional scenarios with explicit
// expected decisions and reviewed indicator annotations. Mixes
// phishing AND legitimate examples so "report everything" is not
// a winning strategy. Ground truth is per-scenario — nothing is
// assumed true by default.
//
// All sender domains/addresses are fictional placeholders.
// =============================================

export const INDICATOR_KEYS = [
  'urgent-language',
  'suspicious-sender',
  'mismatched-domain',
  'unexpected-attachment',
  'credential-request',
  'suspicious-link',
  'unusual-grammar',
  'emotional-pressure',
];

const none = () => Object.fromEntries(INDICATOR_KEYS.map((k) => [k, false]));

export const PRACTICE_SCENARIOS_SEED = [
  {
    id: 'account-verification-phishing-1',
    category: 'Account Verification',
    targetContext: 'University',
    difficulty: 'Beginner',
    isLegitimate: false,
    subject: 'Action Required: Verify Your Student Portal Account Today',
    senderName: 'IT Service Desk',
    senderEmail: 'no-reply@studentportal-verify.com',
    body: 'Dear Student,\n\nWe detected unusual activity on your account. Your student portal access will be SUSPENDED within 24 hours unless you verify your identity immediately.\n\nTo avoid losing access to your grades, timetable and email, please confirm your username and password here: [LINK]\n\nFailure to verify today will result in permanent account suspension.\n\nIT Service Desk',
    tacticsSummary: 'Combines a false urgency deadline with a direct credential request routed through a lookalike domain.',
    manipulationTechniques: ['Urgency', 'Fear of loss of access', 'Authority impersonation'],
    indicators: { ...none(), 'urgent-language': true, 'suspicious-sender': true, 'mismatched-domain': true, 'credential-request': true, 'suspicious-link': true, 'emotional-pressure': true },
  },
  {
    id: 'password-expiry-phishing-1',
    category: 'Password Expiry',
    targetContext: 'Workplace',
    difficulty: 'Intermediate',
    isLegitimate: false,
    subject: 'Your password expires in 2 hours - update now',
    senderName: 'IT Support',
    senderEmail: 'support@company-secure-reset.net',
    body: 'Hello,\n\nOur systems show your network password will expire in 2 hours. To avoid being locked out during work hours, please update it now using the secure link below: [LINK]\n\nIf you does not update in time, you will need to contact helpdesk for manually unlock the account.\n\nThank you,\nIT Support Team',
    tacticsSummary: 'Uses a short artificial deadline plus mildly awkward phrasing typical of a rushed or translated phishing template.',
    manipulationTechniques: ['Urgency', 'Fear of lockout', 'Authority impersonation'],
    indicators: { ...none(), 'urgent-language': true, 'suspicious-sender': true, 'mismatched-domain': true, 'credential-request': true, 'suspicious-link': true, 'unusual-grammar': true, 'emotional-pressure': true },
  },
  {
    id: 'scholarship-notification-phishing-1',
    category: 'Scholarship Notification',
    targetContext: 'University',
    difficulty: 'Beginner',
    isLegitimate: false,
    subject: "Congratulations! You've Been Awarded a $2,500 Scholarship",
    senderName: 'Financial Aid Office',
    senderEmail: 'awards@scholarship-fund-alerts.org',
    body: 'Dear Student,\n\nYou have been selected to receive a $2,500 merit scholarship for this academic year.\n\nTo claim your award, please log in to the scholarship portal with your student email and password before the offer expires today: [LINK]\n\nCongratulations again on this achievement.\n\nFinancial Aid Office',
    tacticsSummary: 'Uses positive emotion (a reward) rather than fear to lower suspicion, while still requesting credentials through a spoofed domain.',
    manipulationTechniques: ['Reward framing', 'Authority impersonation', 'Same-day deadline'],
    indicators: { ...none(), 'urgent-language': true, 'suspicious-sender': true, 'mismatched-domain': true, 'credential-request': true, 'suspicious-link': true },
  },
  {
    id: 'shared-document-phishing-1',
    category: 'Shared Document',
    targetContext: 'Workplace',
    difficulty: 'Advanced',
    isLegitimate: false,
    subject: "Jordan shared 'Q3_Budget_Review.xlsx' with you",
    senderName: 'OneDrive for Business',
    senderEmail: 'notify@onedrive-share-docs.com',
    body: 'Jordan Reyes has shared a file with you on OneDrive for Business.\n\nQ3_Budget_Review.xlsx\n\nView Document: [LINK]\n\nThis link will expire in 7 days.',
    tacticsSummary: 'A subtle, low-urgency lure that relies on routine document-sharing habits rather than fear — the main tell is the sender domain.',
    manipulationTechniques: ['Routine familiarity', 'Brand impersonation'],
    indicators: { ...none(), 'suspicious-sender': true, 'mismatched-domain': true, 'credential-request': true, 'suspicious-link': true },
  },
  {
    id: 'hr-payroll-phishing-1',
    category: 'HR / Payroll Update',
    targetContext: 'Workplace',
    difficulty: 'Advanced',
    isLegitimate: false,
    subject: "Updated Direct Deposit Form - Action Needed Before Friday's Payroll Run",
    senderName: 'HR Department',
    senderEmail: 'hr-payroll@company-hrportal.info',
    body: "Hello,\n\nWe are updating our payroll records ahead of this Friday's pay run. Please open the attached form, complete your direct deposit details, and return it before Thursday 5pm to avoid a delay in your payment.\n\n[ATTACHMENT: Direct_Deposit_Update_Form.docm]\n\nHR Department",
    tacticsSummary: 'Uses a payroll deadline and an attachment requiring macros to be enabled, a common malware delivery pattern.',
    manipulationTechniques: ['Urgency', 'Financial concern', 'Authority impersonation'],
    indicators: { ...none(), 'urgent-language': true, 'suspicious-sender': true, 'mismatched-domain': true, 'unexpected-attachment': true, 'emotional-pressure': true },
  },
  {
    id: 'legit-it-newsletter',
    category: 'IT Update',
    targetContext: 'University',
    difficulty: 'Beginner',
    isLegitimate: true,
    subject: 'This Week in IT: New Wi-Fi Coverage in the Library',
    senderName: 'IT Communications',
    senderEmail: 'it-news@sentrilearn-university.edu',
    body: "Hi everyone,\n\nA quick update: we've extended Wi-Fi coverage to the third floor of the library and the outdoor study area. No action is needed on your part.\n\nAs always, our full status page is available at status.sentrilearn-university.edu if you ever have connectivity questions.\n\nThanks,\nIT Communications",
    tacticsSummary: 'A routine, low-stakes informational update from a domain consistent with the organization, with no request for action or credentials.',
    manipulationTechniques: [],
    indicators: none(),
  },
  {
    id: 'legit-password-changed',
    category: 'Password Expiry',
    targetContext: 'Workplace',
    difficulty: 'Beginner',
    isLegitimate: true,
    subject: 'Your password was changed successfully',
    senderName: 'Account Security',
    senderEmail: 'security@sentrilearn-corp.com',
    body: "Hello,\n\nThis is a confirmation that your account password was changed on this device just now. If this was you, no further action is needed.\n\nIf you did not make this change, contact your IT administrator directly using the internal helpdesk number.\n\nAccount Security",
    tacticsSummary: 'A standard confirmation notice from the real organizational domain. It informs rather than requests, and gives a safe out-of-band contact method.',
    manipulationTechniques: [],
    indicators: none(),
  },
  {
    id: 'legit-maintenance-notice',
    category: 'HR / Payroll Update',
    targetContext: 'Workplace',
    difficulty: 'Beginner',
    isLegitimate: true,
    subject: 'Scheduled Payroll System Maintenance - Saturday 10pm-2am',
    senderName: 'HR Department',
    senderEmail: 'hr@sentrilearn-corp.com',
    body: 'Hello team,\n\nThe payroll system will be offline for scheduled maintenance this Saturday from 10pm to 2am. No action is required, and this will not affect your pay date.\n\nHR Department',
    tacticsSummary: 'A plain informational notice from the correct internal domain, with no link, attachment or request for information.',
    manipulationTechniques: [],
    indicators: none(),
  },
];
