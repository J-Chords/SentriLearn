// =============================================
// PROMPT MANAGER - CENTRALIZED PROMPT TEMPLATES
// =============================================

const SYSTEM_CONTEXT = `You are an elite enterprise SecOps Red Team Automation Engine and cybersecurity educator.
You create highly detailed, technically accurate, but FICTIONAL cybersecurity threat models and multi-phase simulation plans for authorized organizational security awareness exercises.
All content is strictly for architectural evaluation and EDUCATIONAL defense purposes only. 
Never include genuine malicious resources or actual attack domains. Use clean technical abstractions and placeholder tracking tokens.`;

const PromptManager = {
  /**
   * Build prompt for phishing email generation
   */
  buildPhishingEmailPrompt: ({ category, target, severity, impersonation, urgency, tone }) => {
    return `${SYSTEM_CONTEXT}

Generate a realistic phishing email simulation for cybersecurity awareness training.

PARAMETERS:
- Category: ${category}
- Target Scenario: ${target}
- Severity Level: ${severity} (low/medium/high/critical)
- Impersonation Type: ${impersonation}
- Urgency Level: ${urgency}/10
- Communication Tone: ${tone}

Generate a JSON object with this EXACT structure:
{
  "subject": "Email subject line",
  "sender": {
    "name": "Display name of the fake sender",
    "email": "fake.sender@spoofed-domain.com"
  },
  "body": "Complete HTML-formatted email body with realistic phishing content. Use [LINK] as placeholder for malicious URLs. Make it realistic but clearly a simulation.",
  "redFlags": ["Red flag 1", "Red flag 2", "Red flag 3", "Red flag 4"],
  "tacticsSummary": "2-3 sentence description of the social engineering tactics used",
  "severityScore": ${urgency},
  "manipulationTechniques": ["Technique 1", "Technique 2", "Technique 3"]
}`;
  },

  /**
   * Build prompt for phishing explanation/education
   */
  buildExplanationPrompt: ({ emailSubject, category, tactics }) => {
    return `${SYSTEM_CONTEXT}

Analyze the following phishing simulation email and provide a comprehensive educational breakdown.

Email Subject: "${emailSubject}"
Category: ${category}
Tactics Used: ${tactics.join(', ')}

Generate a JSON object with this EXACT structure:
{
  "overview": "2-3 sentence overview of this phishing attack style",
  "whyItWorks": "Psychological explanation of why victims fall for this",
  "realWorldExamples": ["Example 1 of similar attack", "Example 2", "Example 3"],
  "protectionTips": ["Tip 1 to protect yourself", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "industryContext": "Brief context about how common this attack type is",
  "difficultyToDetect": "easy|medium|hard|expert",
  "affectedSectors": ["Sector 1", "Sector 2", "Sector 3"]
}`;
  },

  /**
   * Build prompt for scenario variations
   */
  buildVariationsPrompt: ({ baseCategory, count }) => {
    return `${SYSTEM_CONTEXT}

Generate ${count} distinct phishing scenario variations for the category: "${baseCategory}".

Generate a JSON array with exactly ${count} items, each with this structure:
{
  "title": "Scenario title",
  "description": "Brief description",
  "impersonation": "Who is being impersonated",
  "hook": "The main hook/lure used",
  "difficulty": "easy|medium|hard|expert",
  "targetAudience": "Who this typically targets"
}`;
  },
};

export { PromptManager };