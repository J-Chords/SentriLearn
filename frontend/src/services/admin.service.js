// =============================================
// ADMIN USER MANAGEMENT SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const AdminService = {
  listLearners: () => api.get('/admin/users'),
  createLearner: (payload) => api.post('/admin/users', payload),
  setLearnerActive: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
};
