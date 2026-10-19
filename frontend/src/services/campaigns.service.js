// =============================================
// CAMPAIGN SERVICE - FRONTEND API LAYER
// =============================================
import api from './api.service.js';

export const CampaignService = {
  listMine: () => api.get('/campaigns/mine'),
  listAll: () => api.get('/campaigns'),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (payload) => api.post('/campaigns', payload),
  activate: (id) => api.post(`/campaigns/${id}/activate`),
  complete: (id) => api.post(`/campaigns/${id}/complete`),
  archive: (id) => api.post(`/campaigns/${id}/archive`),
};
