// =============================================
// CYBERSECURITY AWARENESS ASSESSMENTS — QUIZ CONTENT
//
// Each question carries a `skill` tag used to summarize
// strengths / areas to improve after grading.
// =============================================

export const ASSESSMENTS = [
  {
    id: 'phishing-awareness',
    title: 'Phishing Awareness Assessment',
    description: 'Test your ability to recognize phishing attempts and respond safely.',
    icon: 'Mail',
    questions: [
      {
        id: 1,
        skill: 'Recognising urgency',
        question:
          'You receive an unexpected email saying your Microsoft account will be disabled today unless you click a link. What should you do first?',
        options: [
          'Click immediately',
          'Reply with your password',
          'Verify the request through an official website or trusted support channel',
          'Forward the email to colleagues',
        ],
        correctIndex: 2,
        explanation:
          'Urgent deadlines are a classic pressure tactic. Always verify through an official channel instead of acting on the message directly.',
      },
      {
        id: 2,
        skill: 'Suspicious sender identification',
        question:
          'An email from "support@micro-soft-help.com" claims to be from Microsoft. What is the biggest red flag?',
        options: [
          'The email has a signature block',
          'The domain does not match Microsoft\'s real domain',
          'The email was sent in the morning',
          'The email includes your name',
        ],
        correctIndex: 1,
        explanation:
          'Lookalike domains are one of the most reliable indicators of a spoofed sender.',
      },
      {
        id: 3,
        skill: 'URL inspection',
        question: 'Before clicking a link in an email, what is the safest first step?',
        options: [
          'Click it quickly to see where it goes',
          'Hover over the link to preview the real destination URL',
          'Forward it to IT and click it yourself anyway',
          'Copy and paste it into a search engine',
        ],
        correctIndex: 1,
        explanation: 'Hovering reveals the true destination without exposing you to any risk.',
      },
      {
        id: 4,
        skill: 'Recognising urgency',
        question:
          'Which phrase is most likely to appear in a phishing email designed to pressure quick action?',
        options: [
          '"No rush, whenever you have time"',
          '"Your account will be permanently closed in 2 hours"',
          '"Thank you for your recent purchase"',
          '"Here is the newsletter you subscribed to"',
        ],
        correctIndex: 1,
        explanation: 'Extreme time pressure is a manufactured tactic meant to shortcut careful thinking.',
      },
      {
        id: 5,
        skill: 'Credential request awareness',
        question: 'A legitimate company asks you to "confirm your password" by replying to an email. This is:',
        options: [
          'Normal account security practice',
          'A major red flag — legitimate companies never ask for passwords this way',
          'Only suspicious if the email has spelling errors',
          'Safe if the company name is spelled correctly',
        ],
        correctIndex: 1,
        explanation: 'No legitimate organization will ever ask you to send your password by email.',
      },
      {
        id: 6,
        skill: 'Suspicious sender identification',
        question: 'What does a mismatch between the "display name" and the actual email address usually indicate?',
        options: [
          'A formatting bug in the email client',
          'The sender may be spoofing their identity',
          'The message was sent from a mobile device',
          'Nothing — this is completely normal',
        ],
        correctIndex: 1,
        explanation: 'Attackers often set a trustworthy display name while using an unrelated underlying address.',
      },
      {
        id: 7,
        skill: 'Reporting procedures',
        question: 'You suspect an email is phishing. What is the best next step?',
        options: [
          'Delete it and say nothing',
          'Reply asking "is this real?"',
          'Report it using your organization\'s official reporting channel',
          'Forward it to a few coworkers to ask their opinion',
        ],
        correctIndex: 2,
        explanation: 'Formal reporting channels can alert others and trigger a coordinated response.',
      },
      {
        id: 8,
        skill: 'URL inspection',
        question: 'A shortened link (e.g. bit.ly/xyz123) is sent in an unsolicited message. What should you do?',
        options: [
          'Click it since shortened links are always safe',
          'Treat it with extra caution since the real destination is hidden',
          'Assume it is safe if the message looks professional',
          'Share it with friends to check if it works',
        ],
        correctIndex: 1,
        explanation: 'Shortened URLs conceal the destination, making them a common phishing tool.',
      },
      {
        id: 9,
        skill: 'Credential request awareness',
        question: 'You land on a login page after clicking an email link, and it looks identical to your real portal. What should you check first?',
        options: [
          'Whether the page uses the company logo',
          'The exact domain name in the address bar',
          'Whether the page loads quickly',
          'Whether the page has a "Remember Me" checkbox',
        ],
        correctIndex: 1,
        explanation: 'Visual design can be copied perfectly — the domain is the one thing attackers cannot fake convincingly.',
      },
      {
        id: 10,
        skill: 'Reporting procedures',
        question: 'Why is reporting phishing attempts important, even if you did not fall for them?',
        options: [
          'It is not important if you did not click anything',
          'It helps security teams warn others and block the campaign faster',
          'It only matters for large organizations',
          'Reporting is only useful after a breach has occurred',
        ],
        correctIndex: 1,
        explanation: 'Early reports allow defenders to warn others before more people are targeted.',
      },
    ],
  },
  {
    id: 'password-security',
    title: 'Password Security Assessment',
    description: 'Check your understanding of strong passwords and multi-factor authentication.',
    icon: 'KeyRound',
    questions: [
      {
        id: 1,
        skill: 'Password strength',
        question: 'Which of the following makes a password strongest?',
        options: ['Using "Password123"', 'A long, unique passphrase of unrelated words', 'Your pet\'s name and birth year', 'The same password used on every site'],
        correctIndex: 1,
        explanation: 'Length and uniqueness matter far more than complexity gimmicks.',
      },
      {
        id: 2,
        skill: 'Password reuse',
        question: 'Why is reusing the same password across multiple sites risky?',
        options: ['It is not risky if the password is long', 'One breached site can expose access to every other account using it', 'Reuse improves memorability with no downside', 'It only matters for banking sites'],
        correctIndex: 1,
        explanation: 'A single leaked password can cascade into many compromised accounts.',
      },
      {
        id: 3,
        skill: 'Multi-factor authentication',
        question: 'What does multi-factor authentication (MFA) add to your login?',
        options: ['Nothing, it just slows down login', 'A second verification step beyond your password', 'A stronger password requirement', 'Automatic password rotation'],
        correctIndex: 1,
        explanation: 'MFA requires a second proof of identity, so a stolen password alone is not enough.',
      },
      {
        id: 4,
        skill: 'Password managers',
        question: 'What is the main benefit of using a password manager?',
        options: ['It remembers your birthday', 'It generates and stores unique strong passwords for every account', 'It removes the need for any password at all', 'It shares your passwords with your contacts'],
        correctIndex: 1,
        explanation: 'Password managers make unique, strong passwords practical across all your accounts.',
      },
      {
        id: 5,
        skill: 'Password reuse',
        question: 'You get a notification that a website you use was breached. What should you do?',
        options: ['Ignore it, since it wasn\'t your fault', 'Change your password there and anywhere else you reused it', 'Wait to see if anything bad happens', 'Only worry if you get a suspicious email'],
        correctIndex: 1,
        explanation: 'Immediate password rotation limits the damage of a breach, especially where passwords were reused.',
      },
      {
        id: 6,
        skill: 'Multi-factor authentication',
        question: 'Which MFA method is generally considered strongest?',
        options: ['SMS text codes', 'App-based authenticator or hardware security key', 'Security questions like "mother\'s maiden name"', 'No MFA, just a strong password'],
        correctIndex: 1,
        explanation: 'App-based or hardware MFA resists interception better than SMS codes.',
      },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering Assessment',
    description: 'Evaluate how well you can spot manipulation tactics used by attackers.',
    icon: 'Users',
    questions: [
      {
        id: 1,
        skill: 'Impersonation awareness',
        question: 'A caller claims to be from "IT Support" and asks for your password to "fix an issue." What should you do?',
        options: ['Give it to them since they said IT', 'Refuse and verify their identity through a known internal channel', 'Give a slightly wrong password to test them', 'Ask them to email you instead'],
        correctIndex: 1,
        explanation: 'Legitimate IT support never needs your actual password to resolve an issue.',
      },
      {
        id: 2,
        skill: 'Emotional manipulation',
        question: 'Which emotional tactic is most commonly used in social engineering attacks?',
        options: ['Boredom', 'Urgency and fear', 'Indifference', 'Curiosity about the weather'],
        correctIndex: 1,
        explanation: 'Urgency and fear push people to act before thinking carefully.',
      },
      {
        id: 3,
        skill: 'Impersonation awareness',
        question: 'What is "pretexting" in social engineering?',
        options: ['A type of malware', 'Inventing a false scenario to gain trust or access', 'A firewall configuration', 'A type of encryption'],
        correctIndex: 1,
        explanation: 'Pretexting relies on a believable but false story to manipulate the target.',
      },
      {
        id: 4,
        skill: 'Verification habits',
        question: 'A "vendor" emails asking you to update their banking details for future payments. Best response?',
        options: ['Update it immediately to avoid delay', 'Call the vendor using a known, previously verified number to confirm', 'Reply to the email asking for confirmation', 'Ignore it completely'],
        correctIndex: 1,
        explanation: 'Independent verification through a trusted, previously known channel defeats most BEC-style scams.',
      },
      {
        id: 5,
        skill: 'Emotional manipulation',
        question: 'Someone claiming to be a company executive urgently demands a wire transfer before a "big meeting." This is most likely:',
        options: ['A normal business request', 'A social engineering / BEC attempt using authority and urgency', 'Something only IT needs to worry about', 'Safe if the email signature looks right'],
        correctIndex: 1,
        explanation: 'Authority plus urgency is a textbook Business Email Compromise pattern.',
      },
      {
        id: 6,
        skill: 'Verification habits',
        question: 'What is the best general defense against social engineering?',
        options: ['Trusting anyone who sounds confident', 'Independently verifying unusual requests before acting', 'Responding as fast as possible', 'Assuming internal emails are always safe'],
        correctIndex: 1,
        explanation: 'Slowing down to verify independently defeats the vast majority of social engineering attempts.',
      },
    ],
  },
  {
    id: 'safe-browsing',
    title: 'Safe Browsing Assessment',
    description: 'Test your knowledge of safe web browsing, downloads, and public network risks.',
    icon: 'Globe',
    questions: [
      {
        id: 1,
        skill: 'Secure connections',
        question: 'What does the padlock icon in your browser\'s address bar indicate?',
        options: ['The site is guaranteed trustworthy', 'The connection is encrypted (HTTPS)', 'The site has no ads', 'The site is owned by a large company'],
        correctIndex: 1,
        explanation: 'HTTPS protects data in transit but does not itself vouch for the site\'s legitimacy.',
      },
      {
        id: 2,
        skill: 'Safe downloads',
        question: 'Where should you download software from to stay safe?',
        options: ['Any site that appears first in search results', 'Official vendor websites or app stores', 'Torrent or "cracked software" sites', 'Links shared in random pop-ups'],
        correctIndex: 1,
        explanation: 'Official sources are vetted; third-party bundles are a common malware vector.',
      },
      {
        id: 3,
        skill: 'Public network risks',
        question: 'Why is public Wi-Fi risky for sensitive activity like banking?',
        options: ['It is not risky at all', 'Traffic can potentially be intercepted by others on the network', 'Public Wi-Fi is always password protected', 'It only affects mobile devices'],
        correctIndex: 1,
        explanation: 'Open networks make it easier for attackers to intercept unprotected traffic.',
      },
      {
        id: 4,
        skill: 'Browser hygiene',
        question: 'Why should you keep your browser updated?',
        options: ['Updates only change the browser\'s appearance', 'Updates patch known security vulnerabilities', 'Updates are only needed once a year', 'It has no effect on security'],
        correctIndex: 1,
        explanation: 'Browser updates frequently patch vulnerabilities attackers actively exploit.',
      },
      {
        id: 5,
        skill: 'Secure connections',
        question: 'A website has HTTPS but the domain is "paypa1-secure-login.com". Is it safe?',
        options: ['Yes, HTTPS means it is always safe', 'No — the domain is a lookalike despite having HTTPS', 'Yes, because it mentions "secure"', 'Only unsafe if it asks for a password'],
        correctIndex: 1,
        explanation: 'HTTPS is easy for attackers to obtain too — always check the actual domain.',
      },
      {
        id: 6,
        skill: 'Public network risks',
        question: 'What is a good practice when you must use sensitive accounts on public Wi-Fi?',
        options: ['Use a trusted VPN', 'Turn off your antivirus first', 'Use the same password everywhere for consistency', 'Disable HTTPS to load pages faster'],
        correctIndex: 0,
        explanation: 'A trusted VPN encrypts your traffic even on untrusted public networks.',
      },
    ],
  },
];

export function getAssessmentById(assessmentId) {
  return ASSESSMENTS.find((a) => a.id === assessmentId) || null;
}
