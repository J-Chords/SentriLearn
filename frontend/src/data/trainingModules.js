// =============================================
// CYBERSECURITY AWARENESS TRAINING — MODULE CONTENT
// =============================================

export const TRAINING_MODULES = [
  {
    id: 'intro-to-cybersecurity',
    title: 'Introduction to Cybersecurity',
    description: 'Understand what cybersecurity means and why it matters for students and employees alike.',
    icon: 'ShieldCheck',
    duration: '8 minutes',
    lessons: [
      {
        id: 'what-is-cybersecurity',
        title: 'What is Cybersecurity?',
        body: [
          'Cybersecurity is the practice of protecting devices, networks, accounts and data from unauthorized access, damage or theft.',
          'For students and employees, it is less about firewalls and more about everyday habits: the links you click, the passwords you reuse, and the messages you trust.',
        ],
        keyTakeaways: [
          'Cybersecurity is everyone\'s responsibility, not just the IT department\'s.',
          'Most successful attacks target people, not just technology.',
        ],
      },
      {
        id: 'common-cyber-threats',
        title: 'Common Cyber Threats',
        body: [
          'The most common threats you will encounter are phishing emails, malware-laden downloads, weak or reused passwords, and social engineering phone calls or messages.',
          'Attackers rely on volume — sending thousands of messages hoping a small percentage of people respond without thinking.',
        ],
        keyTakeaways: [
          'Phishing is the leading cause of data breaches worldwide.',
          'Attacks are automated and untargeted more often than personalized.',
        ],
      },
      {
        id: 'cia-triad',
        title: 'The CIA Triad',
        body: [
          'Confidentiality, Integrity and Availability form the foundation of information security. Confidentiality means only authorized people can see data. Integrity means data has not been tampered with. Availability means systems are accessible when needed.',
          'Every safety habit you build — strong passwords, cautious clicking, reporting suspicious activity — supports one or more of these three principles.',
        ],
        keyTakeaways: [
          'Confidentiality, Integrity, Availability = the CIA Triad.',
          'Every security control maps back to protecting one of these three properties.',
        ],
      },
      {
        id: 'building-safe-habits',
        title: 'Building Safe Habits',
        body: [
          'Small daily habits compound into strong protection: pausing before clicking links, verifying unexpected requests, locking your screen, and reporting anything that feels off.',
          'This training platform will walk through each of these habits in more depth across the following modules.',
        ],
        keyTakeaways: [
          'Consistency matters more than perfection.',
          'When in doubt, verify through a separate trusted channel.',
        ],
      },
    ],
  },
  {
    id: 'phishing-awareness',
    title: 'Phishing Awareness',
    description: 'Learn how attackers use deceptive messages and fake websites to steal credentials and data.',
    icon: 'Mail',
    duration: '10 minutes',
    lessons: [
      {
        id: 'what-is-phishing',
        title: 'Lesson 1: What is Phishing?',
        body: [
          'Phishing is a social engineering attack where criminals impersonate a trusted source — a bank, a university, a colleague — to trick you into revealing sensitive information or installing malware.',
          'It typically arrives as email, but can also come through SMS (smishing), phone calls (vishing), or chat apps.',
        ],
        keyTakeaways: [
          'Phishing relies on impersonation and deception, not technical hacking.',
          'The goal is usually to steal credentials, payment details, or install malware.',
        ],
      },
      {
        id: 'common-warning-signs',
        title: 'Lesson 2: Common Warning Signs',
        body: [
          'Watch for urgent or threatening language ("your account will be disabled today"), generic greetings, spelling and grammar mistakes, and requests that bypass normal procedures.',
          'Attackers create artificial time pressure because rushed decisions skip careful verification.',
        ],
        keyTakeaways: [
          'Urgency and fear are the most common manipulation tactics.',
          'Legitimate organizations rarely demand immediate action via email.',
        ],
      },
      {
        id: 'suspicious-links-domains',
        title: 'Lesson 3: Suspicious Links and Domains',
        body: [
          'Before clicking, hover over a link to preview its real destination. Look closely at the domain — attackers use lookalike domains such as "micros0ft-support.com" or extra subdomains to appear legitimate.',
          'Shortened URLs (bit.ly, tinyurl) can hide the true destination entirely, so treat them with extra caution in unsolicited messages.',
        ],
        keyTakeaways: [
          'Always check the actual domain, not just the display text.',
          'When unsure, type the organization\'s website address directly instead of clicking.',
        ],
      },
      {
        id: 'fake-login-pages',
        title: 'Lesson 4: Fake Login Pages',
        body: [
          'Phishing links often lead to pixel-perfect replicas of real login pages designed purely to capture your username and password.',
          'Check the address bar carefully, look for HTTPS, and never enter credentials on a page you reached by clicking a link in an unexpected message.',
        ],
        keyTakeaways: [
          'A convincing design does not mean a page is legitimate.',
          'Bookmark important login pages and use them instead of email links.',
        ],
      },
      {
        id: 'reporting-suspicious-messages',
        title: 'Lesson 5: Reporting Suspicious Messages',
        body: [
          'Reporting suspicious messages helps protect the wider community — your report can trigger a warning before others fall victim to the same campaign.',
          'Use your organization\'s official reporting channel (or the Report Phishing tool in this platform) rather than replying to or forwarding the suspicious message.',
        ],
        keyTakeaways: [
          'Reporting is a proactive defense, not an overreaction.',
          'Never forward a suspicious message to colleagues informally — report it instead.',
        ],
      },
    ],
  },
  {
    id: 'password-security',
    title: 'Password Security',
    description: 'Build strong, unique passwords and understand why multi-factor authentication matters.',
    icon: 'KeyRound',
    duration: '9 minutes',
    lessons: [
      {
        id: 'why-weak-passwords-fail',
        title: 'Why Weak Passwords Fail',
        body: [
          'Short passwords and common words can be guessed or cracked in seconds using automated tools. Reusing the same password across multiple sites means one breach can compromise every account that shares it.',
        ],
        keyTakeaways: [
          'Length and uniqueness matter more than complexity alone.',
          'Password reuse turns one breach into many.',
        ],
      },
      {
        id: 'creating-strong-passphrases',
        title: 'Creating Strong Passphrases',
        body: [
          'A passphrase made of several unrelated words is easier to remember and harder to crack than a short, complex-looking password. Aim for at least 14 characters.',
        ],
        keyTakeaways: [
          'Longer passphrases beat short "complex" passwords.',
          'Avoid personal information like birthdays or pet names.',
        ],
      },
      {
        id: 'password-managers',
        title: 'Password Managers',
        body: [
          'A password manager generates and stores a unique, strong password for every account, so you only need to remember one master password.',
        ],
        keyTakeaways: [
          'Password managers make unique passwords practical at scale.',
          'Never store passwords in an unencrypted document or note.',
        ],
      },
      {
        id: 'multi-factor-authentication',
        title: 'Multi-Factor Authentication',
        body: [
          'Multi-factor authentication (MFA) adds a second verification step — a code, app prompt, or hardware key — so a stolen password alone is not enough to access your account.',
        ],
        keyTakeaways: [
          'Enable MFA wherever it is offered, especially for email and financial accounts.',
          'App-based or hardware MFA is stronger than SMS codes.',
        ],
      },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: 'Recognize the psychological tactics attackers use to manipulate people into bypassing security.',
    icon: 'Users',
    duration: '9 minutes',
    lessons: [
      {
        id: 'what-is-social-engineering',
        title: 'What is Social Engineering?',
        body: [
          'Social engineering is the manipulation of people, rather than systems, to gain unauthorized access or information. Phishing is one form; others include pretexting, tailgating, and baiting.',
        ],
        keyTakeaways: [
          'Attackers target human trust, not just software vulnerabilities.',
          'Social engineering can happen over email, phone, in person, or on social media.',
        ],
      },
      {
        id: 'pretexting-and-impersonation',
        title: 'Pretexting and Impersonation',
        body: [
          'Pretexting involves inventing a believable scenario — posing as IT support, a new colleague, or a vendor — to convince you to share information or grant access.',
        ],
        keyTakeaways: [
          'Verify identity through an independent channel before acting on unusual requests.',
          'A plausible story is not the same as a verified identity.',
        ],
      },
      {
        id: 'emotional-manipulation-tactics',
        title: 'Emotional Manipulation Tactics',
        body: [
          'Urgency, fear, curiosity, and authority are the four levers attackers pull most often. A message that triggers a strong emotional reaction deserves a second, calmer look.',
        ],
        keyTakeaways: [
          'Strong emotional pressure is itself a warning sign.',
          'Pause before responding to messages that demand immediate action.',
        ],
      },
      {
        id: 'defending-against-social-engineering',
        title: 'Defending Against Social Engineering',
        body: [
          'Build a habit of independent verification: call back using a known number, confirm with a colleague in person, or check with your security team before granting access or sharing sensitive information.',
        ],
        keyTakeaways: [
          'Independent verification defeats most social engineering attempts.',
          'It is always acceptable to slow down and confirm a request.',
        ],
      },
    ],
  },
  {
    id: 'safe-browsing',
    title: 'Safe Browsing',
    description: 'Practice safe habits while browsing the web, downloading files, and using public networks.',
    icon: 'Globe',
    duration: '8 minutes',
    lessons: [
      {
        id: 'recognising-secure-websites',
        title: 'Recognising Secure Websites',
        body: [
          'Look for HTTPS and a padlock icon before entering any personal information. This confirms the connection is encrypted — it does not guarantee the site itself is trustworthy, so still check the domain carefully.',
        ],
        keyTakeaways: [
          'HTTPS protects data in transit, but does not verify site legitimacy.',
          'Always double-check the domain name for subtle misspellings.',
        ],
      },
      {
        id: 'safe-downloading-practices',
        title: 'Safe Downloading Practices',
        body: [
          'Only download software and files from official sources. Pirated software and "free" tool bundles are common malware delivery methods.',
        ],
        keyTakeaways: [
          'Stick to official app stores and vendor websites.',
          'Be cautious of unexpected file attachments, even from known contacts.',
        ],
      },
      {
        id: 'public-wifi-risks',
        title: 'Public Wi-Fi Risks',
        body: [
          'Public Wi-Fi networks can expose your traffic to eavesdroppers. Avoid accessing sensitive accounts on public networks, or use a trusted VPN when you must.',
        ],
        keyTakeaways: [
          'Treat public Wi-Fi as untrusted by default.',
          'A VPN adds a layer of protection on open networks.',
        ],
      },
      {
        id: 'browser-security-hygiene',
        title: 'Browser Security Hygiene',
        body: [
          'Keep your browser updated, review extension permissions periodically, and clear saved data on shared or public computers.',
        ],
        keyTakeaways: [
          'Outdated browsers are a common entry point for attackers.',
          'Review browser extensions the same way you would a new app.',
        ],
      },
    ],
  },
  {
    id: 'email-security',
    title: 'Email Security',
    description: 'Go deeper on email-specific risks, including business email compromise and everyday habits.',
    icon: 'Inbox',
    duration: '9 minutes',
    lessons: [
      {
        id: 'email-authentication-basics',
        title: 'Email Authentication Basics',
        body: [
          'Technologies like SPF, DKIM and DMARC help mail servers verify that a message really came from the domain it claims to. Organizations use these to reduce spoofed email, though they are not visible to the average reader.',
        ],
        keyTakeaways: [
          'Email spoofing is technically easy without these protections in place.',
          'You cannot see authentication results directly, so visual inspection still matters.',
        ],
      },
      {
        id: 'attachments-and-malware',
        title: 'Attachments and Malware',
        body: [
          'Malicious attachments often disguise themselves as invoices, resumes, or shipping documents. Enabling macros in an unexpected document is one of the most common ways malware spreads.',
        ],
        keyTakeaways: [
          'Never enable macros in a document from an unverified source.',
          'Unexpected attachments deserve independent verification before opening.',
        ],
      },
      {
        id: 'business-email-compromise',
        title: 'Business Email Compromise',
        body: [
          'Business Email Compromise (BEC) targets organizations by impersonating executives or vendors to request urgent wire transfers or sensitive data, often without any malicious link or attachment at all.',
        ],
        keyTakeaways: [
          'BEC attacks can be pure text with no obvious technical red flags.',
          'Always verify financial or data requests through a separate channel.',
        ],
      },
      {
        id: 'everyday-email-habits',
        title: 'Everyday Email Habits',
        body: [
          'Keep personal and work email separate, avoid publicly posting your email address, and periodically review which apps have access to your inbox.',
        ],
        keyTakeaways: [
          'Good hygiene reduces how often you appear on attacker target lists.',
          'Review connected app permissions on your email account regularly.',
        ],
      },
    ],
  },
];

export function getModuleById(moduleId) {
  return TRAINING_MODULES.find((m) => m.id === moduleId) || null;
}
