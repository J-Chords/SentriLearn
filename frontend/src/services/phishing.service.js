// =============================================
// AI-GENERATED PRACTICE SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const PhishingService = {
  status: () => api.get('/ai-scenarios/status'),
  generateEmail: (params) => api.post('/ai-scenarios/generate', params),
  generateExplanation: (params) => api.post('/ai-scenarios/explain', params),
  getHistory: () => api.get('/ai-scenarios/history'),
  getStats: () => api.get('/ai-scenarios/stats'),
  deleteHistoryItem: (id) => api.delete(`/ai-scenarios/history/${id}`),
  clearAllHistory: () => api.delete('/ai-scenarios/history'),
};
