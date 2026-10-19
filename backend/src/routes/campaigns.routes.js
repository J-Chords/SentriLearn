// =============================================
// CAMPAIGN ROUTES — admin-managed, learner-assigned
// =============================================
import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createCampaign, listCampaignsForAdmin, listCampaignsForLearner, getCampaignDetail,
  activateCampaign, completeCampaign, archiveCampaign,
} from '../services/campaigns/campaign.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

const router = express.Router();

// Learner: campaigns assigned to me.
router.get('/mine', requireAuth, (req, res) => {
  return sendSuccess(res, { campaigns: listCampaignsForLearner(req.user.id) }, 'Assigned campaigns retrieved');
});

// Admin: full management view.
router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  return sendSuccess(res, { campaigns: listCampaignsForAdmin() }, 'Campaigns retrieved');
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(150),
  targetCategory: z.enum(['student', 'employee', 'both']),
  difficulty: z.string().trim().min(1).max(40),
  description: z.string().trim().max(1000).optional(),
  startDate: z.string().trim().max(20).optional(),
  scenarioIds: z.array(z.string().min(1).max(100)).min(1).max(20),
}).strict();

router.post('/', requireAuth, requireRole('admin'), validateBody(createSchema), (req, res, next) => {
  try {
    const campaign = createCampaign(req.user.id, req.body);
    return sendSuccess(res, { campaign }, 'Campaign created', 201);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validateParams(z.object({ id: z.coerce.number().int().positive() })),
  (req, res) => {
    const campaign = getCampaignDetail(req.params.id);
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    return sendSuccess(res, { campaign }, 'Campaign retrieved');
  }
);

router.post(
  '/:id/activate',
  requireAuth,
  requireRole('admin'),
  validateParams(z.object({ id: z.coerce.number().int().positive() })),
  (req, res, next) => {
    try {
      const campaign = activateCampaign(req.user.id, req.params.id);
      return sendSuccess(res, { campaign }, 'Campaign activated');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/complete',
  requireAuth,
  requireRole('admin'),
  validateParams(z.object({ id: z.coerce.number().int().positive() })),
  (req, res, next) => {
    try {
      const campaign = completeCampaign(req.user.id, req.params.id);
      return sendSuccess(res, { campaign }, 'Campaign marked completed');
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/archive',
  requireAuth,
  requireRole('admin'),
  validateParams(z.object({ id: z.coerce.number().int().positive() })),
  (req, res, next) => {
    try {
      const campaign = archiveCampaign(req.user.id, req.params.id);
      return sendSuccess(res, { campaign }, 'Campaign archived');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
