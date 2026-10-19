// =============================================
// AUTH ROUTES
// =============================================
import express from 'express';
import { z } from 'zod';
import { config } from '../config/index.js';
import { findUserByEmail, verifyPassword, toPublicUser } from '../services/auth/auth.service.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { generateCsrfToken } from '../middleware/csrf.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import { logActivity } from '../services/activity/activity.service.js';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
  rememberMe: z.boolean().optional().default(false),
}).strict();

// GET /api/auth/csrf — establishes an anonymous session (if needed) and issues a CSRF token.
router.get('/csrf', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  return sendSuccess(res, { csrfToken }, 'CSRF token issued');
});

router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const row = findUserByEmail(email);

    // Generic message either way — never reveal whether the email exists.
    const genericFailure = () => sendError(res, 'Invalid email or password.', 401);

    if (!row || !row.is_active) return genericFailure();
    const validPassword = await verifyPassword(row.password_hash, password);
    if (!validPassword) return genericFailure();

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.user = { id: row.id, role: row.role };
      if (rememberMe) {
        req.session.cookie.maxAge = config.security.rememberMeTtlMs;
      } else {
        req.session.cookie.expires = false; // browser-session cookie
        req.session.cookie.maxAge = config.security.sessionTtlMs; // server-side ceiling still enforced by the store
      }

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        const csrfToken = generateCsrfToken(req, res, { overwrite: true });
        logActivity(row.id, 'auth.login', 'Signed in');
        return sendSuccess(res, { user: toPublicUser(row), csrfToken }, 'Signed in');
      });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, (req, res, next) => {
  const userId = req.user.id;
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sentrilearn.sid');
    logActivity(userId, 'auth.logout', 'Signed out');
    return sendSuccess(res, null, 'Signed out');
  });
});

router.get('/me', requireAuth, (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Current user');
});

export default router;
