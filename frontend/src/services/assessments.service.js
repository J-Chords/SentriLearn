// =============================================
// ASSESSMENT SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const AssessmentService = {
  list: () => api.get('/assessments'),
  get: (id) => api.get(`/assessments/${encodeURIComponent(id)}`),
  startAttempt: (id) => api.post(`/assessments/${encodeURIComponent(id)}/attempts`),
  submitAttempt: (attemptId, answers) => api.post(`/assessments/attempts/${attemptId}/submit`, { answers }),
  getAttempt: (attemptId) => api.get(`/assessments/attempts/${attemptId}`),
  getAttemptHistory: (id) => api.get(`/assessments/${encodeURIComponent(id)}/attempts`),
};
