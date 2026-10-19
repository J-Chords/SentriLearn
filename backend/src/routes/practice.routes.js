// =============================================
// REVIEWED PRACTICE ROUTES
// =============================================
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  listPracticeScenarios, getPracticeScenario, submitPracticeAttempt,
  getDecisionAccuracy, getReportingRate, listAttemptsForUser, INDICATOR_LABELS,
} from '../services/practice/practice.service.js';
import { isUserAssignedToCampaign, campaignIncludesScenario, isCampaignActive } from '../services/campaigns/campaign.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

const router = express.Router();

router.get('/indicators', requireAuth, (req, res) => {
  return sendSuccess(res, { indicators: Object.entries(INDICATOR_LABELS).map(([key, label]) => ({ key, label })) }, 'Indicators retrieved');
});

router.get('/scenarios', requireAuth, (req, res) => {
  return sendSuccess(res, { scenarios: listPracticeScenarios() }, 'Reviewed scenarios retrieved');
});

router.get(
  '/scenarios/:scenarioId',
  requireAuth,
  validateParams(z.object({ scenarioId: z.string().min(1).max(100) })),
  (req, res) => {
    const scenario = getPracticeScenario(req.params.scenarioId);
    if (!scenario) return sendError(res, 'Scenario not found.', 404);
    return sendSuccess(res, { scenario }, 'Scenario retrieved');
  }
);

const submitSchema = z.object({
  selectedIndicators: z.array(z.string().min(1).max(60)).max(20),
  decision: z.enum(['phishing', 'legitimate']),
  campaignId: z.number().int().positive().optional(),
}).strict();

router.post(
  '/scenarios/:scenarioId/attempts',
  requireAuth,
  validateParams(z.object({ scenarioId: z.string().min(1).max(100) })),
  validateBody(submitSchema),
  (req, res, next) => {
    try {
      const { selectedIndicators, decision, campaignId } = req.body;

      if (campaignId) {
        if (!isUserAssignedToCampaign(campaignId, req.user.id)) {
          return sendError(res, 'You are not assigned to this campaign.', 403);
        }
        if (!campaignIncludesScenario(campaignId, req.params.scenarioId)) {
          return sendError(res, 'This scenario is not part of the given campaign.', 400);
        }
        if (!isCampaignActive(campaignId)) {
          return sendError(res, 'This campaign is not currently active.', 400);
        }
      }

      const result = submitPracticeAttempt(req.user.id, req.params.scenarioId, { selectedIndicators, decision }, campaignId || null);
      return sendSuccess(res, result, 'Attempt recorded', 201);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/summary', requireAuth, (req, res) => {
  return sendSuccess(res, {
    decisionAccuracy: getDecisionAccuracy(req.user.id),
    reportingRate: getReportingRate(req.user.id),
  }, 'Practice summary retrieved');
});

router.get('/history', requireAuth, (req, res) => {
  return sendSuccess(res, { attempts: listAttemptsForUser(req.user.id) }, 'Practice history retrieved');
});

export default router;
