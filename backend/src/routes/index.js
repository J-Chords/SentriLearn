// =============================================
// ROUTES INDEX - CENTRAL ROUTE REGISTRY
// =============================================
import express from 'express';
import { sendSuccess } from '../utils/response.util.js';
import { getAIService } from '../services/ai/ai.service.js';

import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import trainingRoutes from './training.routes.js';
import assessmentsRoutes from './assessments.routes.js';
import practiceRoutes from './practice.routes.js';
import aiScenariosRoutes from './aiScenarios.routes.js';
import campaignsRoutes from './campaigns.routes.js';
import reportsRoutes from './reports.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    uptime: process.uptime(),
    aiProvider: getAIService().getProviderInfo(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/training', trainingRoutes);
router.use('/assessments', assessmentsRoutes);
router.use('/practice', practiceRoutes);
router.use('/ai-scenarios', aiScenariosRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/reports', reportsRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
