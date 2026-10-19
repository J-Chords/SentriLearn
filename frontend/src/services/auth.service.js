// =============================================
// AUTH SERVICE - FRONTEND API LAYER
// =============================================
import api, { setCsrfToken } from './api.service.js';

export const AuthService = {
  login: async (email, password, rememberMe) => {
    const res = await api.post('/auth/login', { email, password, rememberMe });
    setCsrfToken(res.data.csrfToken);
    return res.data.user;
  },
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};
