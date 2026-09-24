// =============================================
// PHISHING INDICATOR ANALYSIS
//
// Every simulation generated in the Phishing Simulation Lab is,
// by construction, a spoofed/fake message — so some indicators
// (suspicious sender, mismatched domain) are always present.
// Others are detected heuristically from the generated content
// so the "Check My Analysis" exercise has a real ground truth
// to grade the learner's selections against.
// =============================================

export const WARNING_INDICATORS = [
  { id: 'urgent-language', label: 'Urgent language' },
  { id: 'suspicious-sender', label: 'Suspicious sender' },
  { id: 'mismatched-domain', label: 'Mismatched domain' },
  { id: 'unexpected-attachment', label: 'Unexpected attachment' },
  { id: 'credential-request', label: 'Credential request' },
  { id: 'suspicious-link', label: 'Suspicious link' },
  { id: 'unusual-grammar', label: 'Unusual grammar' },
  { id: 'emotional-pressure', label: 'Emotional pressure' },
];

const URGENCY_WORDS = /\b(urgent|immediately|right away|today|24 hours|act now|expires?|deadline)\b/i;
const CREDENTIAL_WORDS = /\b(password|login|log in|sign in|verify your account|confirm your identity|credentials|update your details)\b/i;
const ATTACHMENT_WORDS = /\b(attachment|attached|invoice\.pdf|document attached|see attached)\b/i;
const PRESSURE_WORDS = /\b(suspended|disabled|penalty|locked|risk losing|failure to act|terminated)\b/i;
const LINK_TOKEN = /\[(?:LINK|MALICIOUS_LINK)\]/i;

export function analyzeSimulationIndicators(simulation) {
  const text = `${simulation?.subject || ''} ${simulation?.body || ''}`;
  const urgency = simulation?.params?.urgency ?? 5;
  const severity = simulation?.params?.severity ?? 'medium';

  return {
    'urgent-language': urgency >= 6 || URGENCY_WORDS.test(text),
    'suspicious-sender': true,
    'mismatched-domain': true,
    'unexpected-attachment': ATTACHMENT_WORDS.test(text),
    'credential-request': CREDENTIAL_WORDS.test(text),
    'suspicious-link': LINK_TOKEN.test(text),
    'unusual-grammar': false,
    'emotional-pressure': urgency >= 7 || severity === 'high' || severity === 'critical' || PRESSURE_WORDS.test(text),
  };
}
