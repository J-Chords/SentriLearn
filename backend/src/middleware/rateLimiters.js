// =============================================
// RATE LIMITERS
// =============================================
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { sendError } from '../utils/response.util.js';

export const loginLimiter = rateLimit({
  windowMs: config.security.loginWindowMs,
  max: config.security.loginMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  // Keyed by IP + attempted email so one user's lockout doesn't block a shared IP entirely.
  keyGenerator: (req) => `${req.ip}:${(req.body?.email || '').toLowerCase()}`,
  handler: (req, res) => sendError(res, 'Too many sign-in attempts. Please wait and try again.', 429),
});

/** Per-user limiter for costly Gemini generation calls. */
const aiHits = new Map(); // userId -> [timestamps]

export function aiGenerationLimiter(req, res, next) {
  const userId = req.user.id;
  const now = Date.now();
  const windowStart = now - config.ai.generationWindowMs;

  const hits = (aiHits.get(userId) || []).filter((t) => t > windowStart);
  if (hits.length >= config.ai.generationMaxPerWindow) {
    return sendError(res, 'You have reached the AI generation limit for now. Please wait a few minutes and try again.', 429);
  }
  hits.push(now);
  aiHits.set(userId, hits);
  next();
}
