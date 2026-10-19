// =============================================
// AI-GENERATED PRACTICE SERVICE (Gemini)
//
// Scenario history is persisted to the database, owned by the
// user who generated it. History, and deletion, are owner-scoped.
// This content is explicitly labeled "AI-generated practice" in
// the UI and does NOT feed the scored awareness metrics — the
// model's own red flag list is unreviewed output, not an
// authoritative answer key.
// =============================================
import { v4 as uuidv4 } from 'uuid';
import { getAIService } from '../ai/ai.service.js';
import { PromptManager } from '../ai/prompt.manager.js';
import { getDb } from '../../db/connection.js';

class PhishingGeneratorService {
  #aiService;

  constructor() {
    this.#aiService = getAIService();
  }

  async generateEmail(userId, params) {
    const {
      category, target, severity = 'medium', impersonation, urgency = 7, tone = 'professional',
    } = params;

    const prompt = PromptManager.buildPhishingEmailPrompt({ category, target, severity, impersonation, urgency, tone });
    const aiResult = await this.#aiService.generateStructured(prompt);

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const db = getDb();
    db.prepare(`
      INSERT INTO ai_scenarios (
        id, user_id, category, target_context, impersonation, severity, urgency, tone,
        subject, sender_name, sender_email, body_html, red_flags_json, tactics_summary,
        severity_score, manipulation_techniques_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, category, target, impersonation, severity, urgency, tone,
      aiResult.subject, aiResult.sender?.name, aiResult.sender?.email, aiResult.body,
      JSON.stringify(aiResult.redFlags || []), aiResult.tacticsSummary || null,
      aiResult.severityScore ?? urgency, JSON.stringify(aiResult.manipulationTechniques || []), createdAt
    );

    return this.getById(userId, id);
  }

  async generateExplanation(params) {
    const { emailSubject, category, tactics = [] } = params;
    const prompt = PromptManager.buildExplanationPrompt({ emailSubject, category, tactics });
    return this.#aiService.generateStructured(prompt);
  }

  async generateVariations(baseCategory, count = 4) {
    const prompt = PromptManager.buildVariationsPrompt({ baseCategory, count });
    const result = await this.#aiService.generateStructured(prompt);
    return Array.isArray(result) ? result : result.variations || [];
  }

  getHistory(userId) {
    const db = getDb();
    return db.prepare('SELECT * FROM ai_scenarios WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId).map(toPublic);
  }

  getById(userId, id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM ai_scenarios WHERE id = ? AND user_id = ?').get(id, userId);
    return row ? toPublic(row) : null;
  }

  deleteById(userId, id) {
    const db = getDb();
    const info = db.prepare('DELETE FROM ai_scenarios WHERE id = ? AND user_id = ?').run(id, userId);
    return info.changes > 0;
  }

  clearAllHistory(userId) {
    const db = getDb();
    db.prepare('DELETE FROM ai_scenarios WHERE user_id = ?').run(userId);
    return true;
  }

  getStats(userId) {
    const db = getDb();
    const history = this.getHistory(userId);
    const categoryCounts = history.reduce((acc, sim) => {
      const cat = sim.params?.category || 'Unknown';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return {
      totalGenerated: history.length,
      categoryCounts,
      lastGeneratedAt: history[0]?.createdAt || null,
    };
  }
}

function toPublic(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    params: {
      category: row.category,
      target: row.target_context,
      impersonation: row.impersonation,
      severity: row.severity,
      urgency: row.urgency,
      tone: row.tone,
    },
    subject: row.subject,
    sender: { name: row.sender_name, email: row.sender_email },
    body: row.body_html,
    redFlags: JSON.parse(row.red_flags_json || '[]'),
    tacticsSummary: row.tactics_summary,
    severityScore: row.severity_score,
    manipulationTechniques: JSON.parse(row.manipulation_techniques_json || '[]'),
  };
}

let instance = null;
const getPhishingGeneratorService = () => {
  if (!instance) instance = new PhishingGeneratorService();
  return instance;
};

export { PhishingGeneratorService, getPhishingGeneratorService };
