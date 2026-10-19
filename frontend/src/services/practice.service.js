// =============================================
// REVIEWED PRACTICE SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const PracticeService = {
  getIndicators: () => api.get('/practice/indicators'),
  getScenarios: () => api.get('/practice/scenarios'),
  getScenario: (id) => api.get(`/practice/scenarios/${encodeURIComponent(id)}`),
  submitAttempt: (scenarioId, payload) => api.post(`/practice/scenarios/${encodeURIComponent(scenarioId)}/attempts`, payload),
  getSummary: () => api.get('/practice/summary'),
  getHistory: () => api.get('/practice/history'),
};
