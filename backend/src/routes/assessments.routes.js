// =============================================
// ASSESSMENT ROUTES
// =============================================
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  listAssessments, getAssessmentForTaking, startAttempt, submitAttempt,
  getAttemptResult, listAttemptsForUser, getLatestAssessmentAverage,
} from '../services/assessments/assessment.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const items = listAssessments();
  const withLatest = items.map((a) => {
    const attempts = listAttemptsForUser(req.user.id, a.id);
    const latest = attempts[attempts.length - 1] || null;
    return { ...a, latestAttempt: latest };
  });
  return sendSuccess(res, { assessments: withLatest }, 'Assessments retrieved');
});

router.get('/average', requireAuth, (req, res) => {
  return sendSuccess(res, getLatestAssessmentAverage(req.user.id), 'Quiz average retrieved');
});

router.get(
  '/:assessmentId',
  requireAuth,
  validateParams(z.object({ assessmentId: z.string().min(1).max(100) })),
  (req, res) => {
    const assessment = getAssessmentForTaking(req.params.assessmentId);
    if (!assessment) return sendError(res, 'Assessment not found.', 404);
    return sendSuccess(res, { assessment }, 'Assessment retrieved');
  }
);

router.post(
  '/:assessmentId/attempts',
  requireAuth,
  validateParams(z.object({ assessmentId: z.string().min(1).max(100) })),
  (req, res, next) => {
    try {
      const result = startAttempt(req.user.id, req.params.assessmentId);
      return sendSuccess(res, result, 'Attempt started', 201);
    } catch (err) {
      next(err);
    }
  }
);

const submitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.number().int().positive(),
    selectedOptionId: z.number().int().positive(),
  }).strict()).min(1).max(50),
}).strict();

router.post(
  '/attempts/:attemptId/submit',
  requireAuth,
  validateParams(z.object({ attemptId: z.coerce.number().int().positive() })),
  validateBody(submitSchema),
  (req, res, next) => {
    try {
      const result = submitAttempt(req.user.id, req.params.attemptId, req.body.answers);
      return sendSuccess(res, result, result.alreadySubmitted ? 'Attempt already submitted' : 'Attempt graded');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/attempts/:attemptId',
  requireAuth,
  validateParams(z.object({ attemptId: z.coerce.number().int().positive() })),
  (req, res, next) => {
    try {
      const result = getAttemptResult(req.user.id, req.params.attemptId);
      return sendSuccess(res, result, 'Attempt result retrieved');
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:assessmentId/attempts',
  requireAuth,
  validateParams(z.object({ assessmentId: z.string().min(1).max(100) })),
  (req, res) => {
    return sendSuccess(res, { attempts: listAttemptsForUser(req.user.id, req.params.assessmentId) }, 'Attempt history retrieved');
  }
);

export default router;
