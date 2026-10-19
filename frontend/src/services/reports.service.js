// =============================================
// REPORT SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const ReportService = {
  submit: (payload) => api.post('/reports', payload),
  listMine: () => api.get('/reports/mine'),
  listAll: () => api.get('/reports'),
  updateStatus: (id, status) => api.patch(`/reports/${id}/status`, { status }),
};
