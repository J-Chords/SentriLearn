// =============================================
// ADMIN USER MANAGEMENT ROUTES
// =============================================
import express from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createUser, listUsers, toPublicUser, setUserActive, findUserById } from '../services/auth/auth.service.js';
import { getSessionStore } from '../services/session/sqliteSessionStore.js';
import { logActivity } from '../services/activity/activity.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

const router = express.Router();

router.get('/users', requireAuth, requireRole('admin'), (req, res) => {
  return sendSuccess(res, { users: listUsers({ role: 'learner' }).map(toPublicUser) }, 'Learners retrieved');
});

const createLearnerSchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(120),
  learnerCategory: z.enum(['student', 'employee', 'both']),
}).strict();

/**
 * Admin-created learner accounts. A random temporary password is
 * generated and returned ONCE in the response — it is never logged
 * or stored in plaintext. The admin is responsible for relaying it
 * to the learner out of band.
 */
router.post('/users', requireAuth, requireRole('admin'), validateBody(createLearnerSchema), async (req, res, next) => {
  try {
    const temporaryPassword = crypto.randomBytes(9).toString('base64url');
    const user = await createUser({ ...req.body, password: temporaryPassword, role: 'learner' });
    logActivity(req.user.id, 'admin.user_created', `Created learner account for ${user.email}`);
    return sendSuccess(res, { user: toPublicUser(user), temporaryPassword }, 'Learner account created', 201);
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/users/:id/status',
  requireAuth,
  requireRole('admin'),
  validateParams(z.object({ id: z.coerce.number().int().positive() })),
  validateBody(z.object({ isActive: z.boolean() }).strict()),
  (req, res) => {
    const target = findUserById(req.params.id);
    if (!target || target.role !== 'learner') return sendError(res, 'Learner account not found.', 404);

    const updated = setUserActive(req.params.id, req.body.isActive);
    if (!req.body.isActive) {
      getSessionStore().destroyAllForUser(req.params.id); // enforce disablement on next request AND kill any live session immediately
    }
    logActivity(req.user.id, 'admin.user_status_changed', `${req.body.isActive ? 'Enabled' : 'Disabled'} account for ${target.email}`);
    return sendSuccess(res, { user: toPublicUser(updated) }, 'Account status updated');
  }
);

export default router;
