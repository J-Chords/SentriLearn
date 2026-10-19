// =============================================
// PRACTICE PHISHING REPORT ROUTES
// =============================================
import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createReport, listReportsForUser, listAllReports, updateReportStatus } from '../services/reports/report.service.js';
import { sendSuccess } from '../utils/response.util.js';

const router = express.Router();

const REASONS = ['Suspicious sender', 'Urgent request', 'Credential request', 'Suspicious link', 'Unexpected attachment', 'Other'];
const MESSAGE_TYPES = ['Email', 'SMS', 'Messaging App', 'Social Media', 'Other'];

const createSchema = z.object({
  messageType: z.enum(MESSAGE_TYPES),
  reasons: z.array(z.enum(REASONS)).min(1).max(REASONS.length),
  notes: z.string().trim().max(1000).optional(),
}).strict();

router.post('/', requireAuth, validateBody(createSchema), (req, res) => {
  const report = createReport(req.user.id, req.body);
  return sendSuccess(res, { report }, 'Report submitted', 201);
});

router.get('/mine', requireAuth, (req, res) => {
  return sendSuccess(res, { reports: listReportsForUser(req.user.id) }, 'Your reports retrieved');
});

router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  return sendSuccess(res, { reports: listAllReports() }, 'All reports retrieved');
});

const statusSchema = z.object({ status: z.enum(['received', 'reviewed', 'closed']) }).strict();

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('admin'),
  validateParams(z.object({ id: z.coerce.number().int().positive() })),
  validateBody(statusSchema),
  (req, res, next) => {
    try {
      const report = updateReportStatus(req.user.id, req.params.id, req.body.status);
      return sendSuccess(res, { report }, 'Report status updated');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
