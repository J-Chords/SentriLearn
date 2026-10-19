// =============================================
// AI-GENERATED PRACTICE ROUTES (Gemini)
//
// Labeled "AI-generated practice" in the UI. Owner-scoped history
// and deletion. Rate-limited per user since generation is costly.
// Does not feed the scored awareness metrics.
// =============================================
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { aiGenerationLimiter } from '../middleware/rateLimiters.js';
import { getPhishingGeneratorService } from '../services/phishing/phishing.generator.service.js';
import { getAIService } from '../services/ai/ai.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

const router = express.Router();

router.get('/status', requireAuth, (req, res) => {
  return sendSuccess(res, getAIService().getProviderInfo(), 'AI provider status');
});

const generateSchema = z.object({
  category: z.string().trim().min(1).max(80),
  target: z.string().trim().min(1).max(80),
  impersonation: z.string().trim().min(1).max(80),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  urgency: z.number().int().min(1).max(10).optional(),
  tone: z.string().trim().max(40).optional(),
}).strict();

router.post('/generate', requireAuth, aiGenerationLimiter, validateBody(generateSchema), async (req, res, next) => {
  try {
    const service = getPhishingGeneratorService();
    const simulation = await service.generateEmail(req.user.id, req.body);
    return sendSuccess(res, simulation, 'AI-generated practice scenario created', 201);
  } catch (err) {
    next(err);
  }
});

const explainSchema = z.object({
  emailSubject: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(80),
  tactics: z.array(z.string().max(120)).max(20).optional().default([]),
}).strict();

router.post('/explain', requireAuth, aiGenerationLimiter, validateBody(explainSchema), async (req, res, next) => {
  try {
    const service = getPhishingGeneratorService();
    const explanation = await service.generateExplanation(req.body);
    return sendSuccess(res, explanation, 'Explanation generated');
  } catch (err) {
    next(err);
  }
});

router.get('/history', requireAuth, (req, res) => {
  const service = getPhishingGeneratorService();
  return sendSuccess(res, service.getHistory(req.user.id), 'History retrieved');
});

router.get('/stats', requireAuth, (req, res) => {
  const service = getPhishingGeneratorService();
  return sendSuccess(res, service.getStats(req.user.id), 'Stats retrieved');
});

router.delete(
  '/history/:id',
  requireAuth,
  validateParams(z.object({ id: z.string().min(1).max(100) })),
  (req, res) => {
    const service = getPhishingGeneratorService();
    const deleted = service.deleteById(req.user.id, req.params.id);
    if (!deleted) return sendError(res, 'Scenario not found or already removed.', 404);
    return sendSuccess(res, null, 'Scenario removed');
  }
);

router.delete('/history', requireAuth, (req, res) => {
  const service = getPhishingGeneratorService();
  service.clearAllHistory(req.user.id);
  return sendSuccess(res, null, 'History cleared');
});

export default router;
