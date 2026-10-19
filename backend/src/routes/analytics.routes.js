// =============================================
// ANALYTICS ROUTES
// =============================================
import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { getLearnerSnapshot, getAdminAnalytics } from '../services/analytics/analytics.service.js';
import { sendSuccess } from '../utils/response.util.js';

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  return sendSuccess(res, getLearnerSnapshot(req.user.id), 'Learner snapshot retrieved');
});

router.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
  return sendSuccess(res, getAdminAnalytics(), 'Admin analytics retrieved');
});

export default router;
