// =============================================
// API SERVICE - CENTRALIZED HTTP CLIENT
//
// Cookie-session based auth (withCredentials) + CSRF double-submit
// header. The CSRF token is fetched once on load and refreshed
// whenever the backend issues a new one (e.g. on login, since the
// session is regenerated then).
// =============================================
import axios from 'axios';

let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // 60s for AI generation
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((request) => {
  if (csrfToken && !['get', 'head', 'options'].includes(request.method)) {
    request.headers['X-CSRF-Token'] = csrfToken;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const wrapped = new Error(message);
    wrapped.statusCode = error.response?.status;
    wrapped.details = error.response?.data?.details;
    return Promise.reject(wrapped);
  }
);

/** Establishes an (anonymous, if needed) session and fetches a fresh CSRF token. */
export async function initCsrf() {
  const res = await apiClient.get('/auth/csrf');
  setCsrfToken(res.data.csrfToken);
  return res.data.csrfToken;
}

export default apiClient;
