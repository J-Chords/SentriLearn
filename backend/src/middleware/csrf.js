// =============================================
// CSRF PROTECTION — double-submit cookie pattern
//
// Bound to the express-session identifier. The frontend fetches a
// token from GET /api/auth/csrf (which also establishes a session
// cookie for anonymous visitors) and sends it back on every
// mutating request via the X-CSRF-Token header.
// =============================================
import { doubleCsrf } from 'csrf-csrf';
import { randomUUID } from 'node:crypto';
import { config } from '../config/index.js';

const { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError } = doubleCsrf({
  getSecret: () => config.security.csrfSecret,
  getSessionIdentifier: (req) => {
    // Force session creation for anonymous visitors so the CSRF token
    // has something stable to bind to before login.
    if (!req.session.anonId) req.session.anonId = randomUUID();
    return String(req.session.id);
  },
  cookieName: config.server.isDev ? 'sentrilearn.csrf' : '__Host-sentrilearn.csrf',
  cookieOptions: {
    sameSite: 'lax',
    secure: !config.server.isDev,
    path: '/',
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError };
