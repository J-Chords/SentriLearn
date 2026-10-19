// =============================================
// CENTRALIZED CONFIGURATION MODULE
// =============================================
import 'dotenv/config';

const isDev = (process.env.NODE_ENV || 'development') !== 'production';

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev,
  },
  ai: {
    googleApiKey: process.env.GOOGLE_API_KEY || null,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    enabled: Boolean(process.env.GOOGLE_API_KEY),
    // Per-user rate limit for costly generation calls.
    generationWindowMs: parseInt(process.env.AI_GENERATION_WINDOW_MS, 10) || 10 * 60 * 1000,
    generationMaxPerWindow: parseInt(process.env.AI_GENERATION_MAX_PER_WINDOW, 10) || 8,
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  db: {
    path: process.env.DATABASE_PATH || 'data/sentrilearn.sqlite',
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || (isDev ? 'dev-only-insecure-session-secret-change-me' : null),
    csrfSecret: process.env.CSRF_SECRET || (isDev ? 'dev-only-insecure-csrf-secret-change-me' : null),
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    // "Remember Me" off: session-length cookie capped at this TTL.
    sessionTtlMs: parseInt(process.env.SESSION_TTL_MS, 10) || 2 * 60 * 60 * 1000, // 2 hours
    // "Remember Me" on: persistent cookie capped at this TTL.
    rememberMeTtlMs: parseInt(process.env.REMEMBER_ME_TTL_MS, 10) || 30 * 24 * 60 * 60 * 1000, // 30 days
    loginWindowMs: parseInt(process.env.LOGIN_RATE_WINDOW_MS, 10) || 15 * 60 * 1000,
    loginMaxAttempts: parseInt(process.env.LOGIN_RATE_MAX_ATTEMPTS, 10) || 10,
  },
};

/**
 * Validates required environment configuration at startup.
 * The Gemini/AI provider is intentionally NOT required — the app
 * must boot and serve auth/training/assessments/reviewed-practice
 * even when no AI key is configured (see ai.enabled).
 */
const validateConfig = () => {
  const missing = [];
  if (!config.security.sessionSecret) missing.push('SESSION_SECRET');
  if (!config.security.csrfSecret) missing.push('CSRF_SECRET');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Set these in backend/.env before starting the server.'
    );
  }

  if (!config.ai.enabled) {
    console.warn(
      '[config] GOOGLE_API_KEY is not set — AI-generated practice will report as unavailable. ' +
      'All other features (auth, training, assessments, reviewed practice) work normally.'
    );
  }

  if (config.server.nodeEnv === 'production') {
    const insecureDefaults = [
      config.security.sessionSecret?.startsWith('dev-only'),
      config.security.csrfSecret?.startsWith('dev-only'),
    ];
    if (insecureDefaults.some(Boolean)) {
      throw new Error('Refusing to start in production with a dev-only default secret. Set SESSION_SECRET and CSRF_SECRET.');
    }
  }
};

export { config, validateConfig };
