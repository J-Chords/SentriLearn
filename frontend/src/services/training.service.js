// =============================================
// TRAINING SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const TrainingService = {
  getModules: () => api.get('/training/modules'),
  getSummary: () => api.get('/training/summary'),
  completeLesson: (lessonId) => api.post(`/training/lessons/${encodeURIComponent(lessonId)}/complete`),
};
