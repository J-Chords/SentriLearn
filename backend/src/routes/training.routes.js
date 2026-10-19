// =============================================
// TRAINING ROUTES
// =============================================
import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateParams } from '../middleware/validate.js';
import { getModulesWithProgressForUser, computeTrainingSummary, completeLesson } from '../services/training/training.service.js';
import { sendSuccess } from '../utils/response.util.js';

const router = express.Router();

router.get('/modules', requireAuth, (req, res) => {
  return sendSuccess(res, { modules: getModulesWithProgressForUser(req.user.id) }, 'Modules retrieved');
});

router.get('/summary', requireAuth, (req, res) => {
  return sendSuccess(res, computeTrainingSummary(req.user.id), 'Training summary retrieved');
});

router.post(
  '/lessons/:lessonId/complete',
  requireAuth,
  validateParams(z.object({ lessonId: z.string().min(1).max(100) })),
  (req, res, next) => {
    try {
      const result = completeLesson(req.user.id, req.params.lessonId);
      return sendSuccess(res, result, result.alreadyCompleted ? 'Lesson already completed' : 'Lesson marked complete');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
