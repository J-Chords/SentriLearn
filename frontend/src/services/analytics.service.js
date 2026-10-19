// =============================================
// ANALYTICS SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const AnalyticsService = {
  getMine: () => api.get('/analytics/me'),
  getAdmin: () => api.get('/analytics/admin'),
};
