// =============================================
// CURRICULUM SEED CONTENT (versioned, server-authoritative)
// Ported from the accepted frontend content.
// =============================================

export const MODULES_SEED = [
  {
    id: 'intro-to-cybersecurity',
    title: 'Introduction to Cybersecurity',
    description: 'Understand what cybersecurity means and why it matters for students and employees alike.',
    icon: 'ShieldCheck',
    durationLabel: '8 minutes',
    lessons: [
      {
        id: 'what-is-cybersecurity',
        title: 'What is Cybersecurity?',
        body: [
          'Cybersecurity is the practice of protecting devices, networks, accounts and data from unauthorized access, damage or theft.',
          'For students and employees, it is less about firewalls and more about everyday habits: the links you click, the passwords you reuse, and the messages you trust.',
        ],
        keyTakeaways: [
          "Cybersecurity is everyone's responsibility, not just the IT department's.",
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
    durationLabel: '10 minutes',
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
          "When unsure, type the organization's website address directly instead of clicking.",
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
          "Use your organization's official reporting channel (or the Report Phishing tool in this platform) rather than replying to or forwarding the suspicious message.",
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
    durationLabel: '9 minutes',
    lessons: [
      {
        id: 'why-weak-passwords-fail',
        title: 'Why Weak Passwords Fail',
        body: [
          'Short passwords and common words can be guessed or cracked in seconds using automated tools. Reusing the same password across multiple sites means one breach can compromise every account that shares it.',
        ],
        keyTakeaways: ['Length and uniqueness matter more than complexity alone.', 'Password reuse turns one breach into many.'],
      },
      {
        id: 'creating-strong-passphrases',
        title: 'Creating Strong Passphrases',
        body: [
          'A passphrase made of several unrelated words is easier to remember and harder to crack than a short, complex-looking password. Aim for at least 14 characters.',
        ],
        keyTakeaways: ['Longer passphrases beat short "complex" passwords.', 'Avoid personal information like birthdays or pet names.'],
      },
      {
        id: 'password-managers',
        title: 'Password Managers',
        body: ['A password manager generates and stores a unique, strong password for every account, so you only need to remember one master password.'],
        keyTakeaways: ['Password managers make unique passwords practical at scale.', 'Never store passwords in an unencrypted document or note.'],
      },
      {
        id: 'multi-factor-authentication',
        title: 'Multi-Factor Authentication',
        body: ['Multi-factor authentication (MFA) adds a second verification step — a code, app prompt, or hardware key — so a stolen password alone is not enough to access your account.'],
        keyTakeaways: ['Enable MFA wherever it is offered, especially for email and financial accounts.', 'App-based or hardware MFA is stronger than SMS codes.'],
      },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: 'Recognize the psychological tactics attackers use to manipulate people into bypassing security.',
    icon: 'Users',
    durationLabel: '9 minutes',
    lessons: [
      {
        id: 'what-is-social-engineering',
        title: 'What is Social Engineering?',
        body: ['Social engineering is the manipulation of people, rather than systems, to gain unauthorized access or information. Phishing is one form; others include pretexting, tailgating, and baiting.'],
        keyTakeaways: ['Attackers target human trust, not just software vulnerabilities.', 'Social engineering can happen over email, phone, in person, or on social media.'],
      },
      {
        id: 'pretexting-and-impersonation',
        title: 'Pretexting and Impersonation',
        body: ['Pretexting involves inventing a believable scenario — posing as IT support, a new colleague, or a vendor — to convince you to share information or grant access.'],
        keyTakeaways: ['Verify identity through an independent channel before acting on unusual requests.', 'A plausible story is not the same as a verified identity.'],
      },
      {
        id: 'emotional-manipulation-tactics',
        title: 'Emotional Manipulation Tactics',
        body: ['Urgency, fear, curiosity, and authority are the four levers attackers pull most often. A message that triggers a strong emotional reaction deserves a second, calmer look.'],
        keyTakeaways: ['Strong emotional pressure is itself a warning sign.', 'Pause before responding to messages that demand immediate action.'],
      },
      {
        id: 'defending-against-social-engineering',
        title: 'Defending Against Social Engineering',
        body: ['Build a habit of independent verification: call back using a known number, confirm with a colleague in person, or check with your security team before granting access or sharing sensitive information.'],
        keyTakeaways: ['Independent verification defeats most social engineering attempts.', 'It is always acceptable to slow down and confirm a request.'],
      },
    ],
  },
  {
    id: 'safe-browsing',
    title: 'Safe Browsing',
    description: 'Practice safe habits while browsing the web, downloading files, and using public networks.',
    icon: 'Globe',
    durationLabel: '8 minutes',
    lessons: [
      {
        id: 'recognising-secure-websites',
        title: 'Recognising Secure Websites',
        body: ['Look for HTTPS and a padlock icon before entering any personal information. This confirms the connection is encrypted — it does not guarantee the site itself is trustworthy, so still check the domain carefully.'],
        keyTakeaways: ['HTTPS protects data in transit, but does not verify site legitimacy.', 'Always double-check the domain name for subtle misspellings.'],
      },
      {
        id: 'safe-downloading-practices',
        title: 'Safe Downloading Practices',
        body: ['Only download software and files from official sources. Pirated software and "free" tool bundles are common malware delivery methods.'],
        keyTakeaways: ['Stick to official app stores and vendor websites.', 'Be cautious of unexpected file attachments, even from known contacts.'],
      },
      {
        id: 'public-wifi-risks',
        title: 'Public Wi-Fi Risks',
        body: ['Public Wi-Fi networks can expose your traffic to eavesdroppers. Avoid accessing sensitive accounts on public networks, or use a trusted VPN when you must.'],
        keyTakeaways: ['Treat public Wi-Fi as untrusted by default.', 'A VPN adds a layer of protection on open networks.'],
      },
      {
        id: 'browser-security-hygiene',
        title: 'Browser Security Hygiene',
        body: ['Keep your browser updated, review extension permissions periodically, and clear saved data on shared or public computers.'],
        keyTakeaways: ['Outdated browsers are a common entry point for attackers.', 'Review browser extensions the same way you would a new app.'],
      },
    ],
  },
  {
    id: 'email-security',
    title: 'Email Security',
    description: 'Go deeper on email-specific risks, including business email compromise and everyday habits.',
    icon: 'Inbox',
    durationLabel: '9 minutes',
    lessons: [
      {
        id: 'email-authentication-basics',
        title: 'Email Authentication Basics',
        body: ['Technologies like SPF, DKIM and DMARC help mail servers verify that a message really came from the domain it claims to. Organizations use these to reduce spoofed email, though they are not visible to the average reader.'],
        keyTakeaways: ['Email spoofing is technically easy without these protections in place.', 'You cannot see authentication results directly, so visual inspection still matters.'],
      },
      {
        id: 'attachments-and-malware',
        title: 'Attachments and Malware',
        body: ['Malicious attachments often disguise themselves as invoices, resumes, or shipping documents. Enabling macros in an unexpected document is one of the most common ways malware spreads.'],
        keyTakeaways: ['Never enable macros in a document from an unverified source.', 'Unexpected attachments deserve independent verification before opening.'],
      },
      {
        id: 'business-email-compromise',
        title: 'Business Email Compromise',
        body: ['Business Email Compromise (BEC) targets organizations by impersonating executives or vendors to request urgent wire transfers or sensitive data, often without any malicious link or attachment at all.'],
        keyTakeaways: ['BEC attacks can be pure text with no obvious technical red flags.', 'Always verify financial or data requests through a separate channel.'],
      },
      {
        id: 'everyday-email-habits',
        title: 'Everyday Email Habits',
        body: ['Keep personal and work email separate, avoid publicly posting your email address, and periodically review which apps have access to your inbox.'],
        keyTakeaways: ['Good hygiene reduces how often you appear on attacker target lists.', 'Review connected app permissions on your email account regularly.'],
      },
    ],
  },
];

export const ASSESSMENTS_SEED = [
  {
    id: 'phishing-awareness',
    title: 'Phishing Awareness Assessment',
    description: 'Test your ability to recognize phishing attempts and respond safely.',
    icon: 'Mail',
    questions: [
      { skill: 'Recognising urgency', question: 'You receive an unexpected email saying your Microsoft account will be disabled today unless you click a link. What should you do first?', options: ['Click immediately', 'Reply with your password', 'Verify the request through an official website or trusted support channel', 'Forward the email to colleagues'], correctIndex: 2, explanation: 'Urgent deadlines are a classic pressure tactic. Always verify through an official channel instead of acting on the message directly.' },
      { skill: 'Suspicious sender identification', question: 'An email from "support@micro-soft-help.com" claims to be from Microsoft. What is the biggest red flag?', options: ['The email has a signature block', "The domain does not match Microsoft's real domain", 'The email was sent in the morning', "The email includes your name"], correctIndex: 1, explanation: 'Lookalike domains are one of the most reliable indicators of a spoofed sender.' },
      { skill: 'URL inspection', question: 'Before clicking a link in an email, what is the safest first step?', options: ['Click it quickly to see where it goes', 'Hover over the link to preview the real destination URL', 'Forward it to IT and click it yourself anyway', 'Copy and paste it into a search engine'], correctIndex: 1, explanation: 'Hovering reveals the true destination without exposing you to any risk.' },
      { skill: 'Recognising urgency', question: 'Which phrase is most likely to appear in a phishing email designed to pressure quick action?', options: ['"No rush, whenever you have time"', '"Your account will be permanently closed in 2 hours"', '"Thank you for your recent purchase"', '"Here is the newsletter you subscribed to"'], correctIndex: 1, explanation: 'Extreme time pressure is a manufactured tactic meant to shortcut careful thinking.' },
      { skill: 'Credential request awareness', question: 'A legitimate company asks you to "confirm your password" by replying to an email. This is:', options: ['Normal account security practice', 'A major red flag — legitimate companies never ask for passwords this way', 'Only suspicious if the email has spelling errors', 'Safe if the company name is spelled correctly'], correctIndex: 1, explanation: 'No legitimate organization will ever ask you to send your password by email.' },
      { skill: 'Suspicious sender identification', question: 'What does a mismatch between the "display name" and the actual email address usually indicate?', options: ['A formatting bug in the email client', 'The sender may be spoofing their identity', 'The message was sent from a mobile device', 'Nothing — this is completely normal'], correctIndex: 1, explanation: 'Attackers often set a trustworthy display name while using an unrelated underlying address.' },
      { skill: 'Reporting procedures', question: 'You suspect an email is phishing. What is the best next step?', options: ['Delete it and say nothing', 'Reply asking "is this real?"', "Report it using your organization's official reporting channel", 'Forward it to a few coworkers to ask their opinion'], correctIndex: 2, explanation: 'Formal reporting channels can alert others and trigger a coordinated response.' },
      { skill: 'URL inspection', question: 'A shortened link (e.g. bit.ly/xyz123) is sent in an unsolicited message. What should you do?', options: ['Click it since shortened links are always safe', 'Treat it with extra caution since the real destination is hidden', 'Assume it is safe if the message looks professional', 'Share it with friends to check if it works'], correctIndex: 1, explanation: 'Shortened URLs conceal the destination, making them a common phishing tool.' },
      { skill: 'Credential request awareness', question: 'You land on a login page after clicking an email link, and it looks identical to your real portal. What should you check first?', options: ['Whether the page uses the company logo', 'The exact domain name in the address bar', 'Whether the page loads quickly', 'Whether the page has a "Remember Me" checkbox'], correctIndex: 1, explanation: 'Visual design can be copied perfectly — the domain is the one thing attackers cannot fake convincingly.' },
      { skill: 'Reporting procedures', question: 'Why is reporting phishing attempts important, even if you did not fall for them?', options: ['It is not important if you did not click anything', 'It helps security teams warn others and block the campaign faster', 'It only matters for large organizations', 'Reporting is only useful after a breach has occurred'], correctIndex: 1, explanation: 'Early reports allow defenders to warn others before more people are targeted.' },
    ],
  },
  {
    id: 'password-security',
    title: 'Password Security Assessment',
    description: 'Check your understanding of strong passwords and multi-factor authentication.',
    icon: 'KeyRound',
    questions: [
      { skill: 'Password strength', question: 'Which of the following makes a password strongest?', options: ['Using "Password123"', 'A long, unique passphrase of unrelated words', "Your pet's name and birth year", 'The same password used on every site'], correctIndex: 1, explanation: 'Length and uniqueness matter far more than complexity gimmicks.' },
      { skill: 'Password reuse', question: 'Why is reusing the same password across multiple sites risky?', options: ['It is not risky if the password is long', 'One breached site can expose access to every other account using it', 'Reuse improves memorability with no downside', 'It only matters for banking sites'], correctIndex: 1, explanation: 'A single leaked password can cascade into many compromised accounts.' },
      { skill: 'Multi-factor authentication', question: 'What does multi-factor authentication (MFA) add to your login?', options: ['Nothing, it just slows down login', 'A second verification step beyond your password', 'A stronger password requirement', 'Automatic password rotation'], correctIndex: 1, explanation: 'MFA requires a second proof of identity, so a stolen password alone is not enough.' },
      { skill: 'Password managers', question: 'What is the main benefit of using a password manager?', options: ['It remembers your birthday', 'It generates and stores unique strong passwords for every account', 'It removes the need for any password at all', 'It shares your passwords with your contacts'], correctIndex: 1, explanation: 'Password managers make unique, strong passwords practical across all your accounts.' },
      { skill: 'Password reuse', question: 'You get a notification that a website you use was breached. What should you do?', options: ["Ignore it, since it wasn't your fault", 'Change your password there and anywhere else you reused it', 'Wait to see if anything bad happens', 'Only worry if you get a suspicious email'], correctIndex: 1, explanation: 'Immediate password rotation limits the damage of a breach, especially where passwords were reused.' },
      { skill: 'Multi-factor authentication', question: 'Which MFA method is generally considered strongest?', options: ['SMS text codes', 'App-based authenticator or hardware security key', 'Security questions like "mother\'s maiden name"', 'No MFA, just a strong password'], correctIndex: 1, explanation: 'App-based or hardware MFA resists interception better than SMS codes.' },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering Assessment',
    description: 'Evaluate how well you can spot manipulation tactics used by attackers.',
    icon: 'Users',
    questions: [
      { skill: 'Impersonation awareness', question: 'A caller claims to be from "IT Support" and asks for your password to "fix an issue." What should you do?', options: ['Give it to them since they said IT', 'Refuse and verify their identity through a known internal channel', 'Give a slightly wrong password to test them', 'Ask them to email you instead'], correctIndex: 1, explanation: 'Legitimate IT support never needs your actual password to resolve an issue.' },
      { skill: 'Emotional manipulation', question: 'Which emotional tactic is most commonly used in social engineering attacks?', options: ['Boredom', 'Urgency and fear', 'Indifference', 'Curiosity about the weather'], correctIndex: 1, explanation: 'Urgency and fear push people to act before thinking carefully.' },
      { skill: 'Impersonation awareness', question: 'What is "pretexting" in social engineering?', options: ['A type of malware', 'Inventing a false scenario to gain trust or access', 'A firewall configuration', 'A type of encryption'], correctIndex: 1, explanation: 'Pretexting relies on a believable but false story to manipulate the target.' },
      { skill: 'Verification habits', question: 'A "vendor" emails asking you to update their banking details for future payments. Best response?', options: ['Update it immediately to avoid delay', 'Call the vendor using a known, previously verified number to confirm', 'Reply to the email asking for confirmation', 'Ignore it completely'], correctIndex: 1, explanation: 'Independent verification through a trusted, previously known channel defeats most BEC-style scams.' },
      { skill: 'Emotional manipulation', question: 'Someone claiming to be a company executive urgently demands a wire transfer before a "big meeting." This is most likely:', options: ['A normal business request', 'A social engineering / BEC attempt using authority and urgency', 'Something only IT needs to worry about', 'Safe if the email signature looks right'], correctIndex: 1, explanation: 'Authority plus urgency is a textbook Business Email Compromise pattern.' },
      { skill: 'Verification habits', question: 'What is the best general defense against social engineering?', options: ['Trusting anyone who sounds confident', 'Independently verifying unusual requests before acting', 'Responding as fast as possible', 'Assuming internal emails are always safe'], correctIndex: 1, explanation: 'Slowing down to verify independently defeats the vast majority of social engineering attempts.' },
    ],
  },
  {
    id: 'safe-browsing',
    title: 'Safe Browsing Assessment',
    description: 'Test your knowledge of safe web browsing, downloads, and public network risks.',
    icon: 'Globe',
    questions: [
      { skill: 'Secure connections', question: "What does the padlock icon in your browser's address bar indicate?", options: ['The site is guaranteed trustworthy', 'The connection is encrypted (HTTPS)', 'The site has no ads', 'The site is owned by a large company'], correctIndex: 1, explanation: "HTTPS protects data in transit but does not itself vouch for the site's legitimacy." },
      { skill: 'Safe downloads', question: 'Where should you download software from to stay safe?', options: ['Any site that appears first in search results', 'Official vendor websites or app stores', 'Torrent or "cracked software" sites', 'Links shared in random pop-ups'], correctIndex: 1, explanation: 'Official sources are vetted; third-party bundles are a common malware vector.' },
      { skill: 'Public network risks', question: 'Why is public Wi-Fi risky for sensitive activity like banking?', options: ['It is not risky at all', 'Traffic can potentially be intercepted by others on the network', 'Public Wi-Fi is always password protected', 'It only affects mobile devices'], correctIndex: 1, explanation: 'Open networks make it easier for attackers to intercept unprotected traffic.' },
      { skill: 'Browser hygiene', question: 'Why should you keep your browser updated?', options: ["Updates only change the browser's appearance", 'Updates patch known security vulnerabilities', 'Updates are only needed once a year', 'It has no effect on security'], correctIndex: 1, explanation: 'Browser updates frequently patch vulnerabilities attackers actively exploit.' },
      { skill: 'Secure connections', question: 'A website has HTTPS but the domain is "paypa1-secure-login.com". Is it safe?', options: ['Yes, HTTPS means it is always safe', 'No — the domain is a lookalike despite having HTTPS', 'Yes, because it mentions "secure"', 'Only unsafe if it asks for a password'], correctIndex: 1, explanation: 'HTTPS is easy for attackers to obtain too — always check the actual domain.' },
      { skill: 'Public network risks', question: 'What is a good practice when you must use sensitive accounts on public Wi-Fi?', options: ['Use a trusted VPN', 'Turn off your antivirus first', 'Use the same password everywhere for consistency', 'Disable HTTPS to load pages faster'], correctIndex: 0, explanation: 'A trusted VPN encrypts your traffic even on untrusted public networks.' },
    ],
  },
];
