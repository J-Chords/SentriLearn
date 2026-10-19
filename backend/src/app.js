// =============================================
// APPLICATION ENTRY POINT
// =============================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config/index.js';
import { runMigrations } from './db/migrate.js';
import { seedCurriculum } from './db/seedCurriculum.js';
import { getSessionStore } from './services/session/sqliteSessionStore.js';
import { doubleCsrfProtection } from './middleware/csrf.js';
import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

validateConfig();
runMigrations();
seedCurriculum();

const app = express();
app.set('trust proxy', 1);

// ---- Security Middleware ----
app.use(helmet());
app.use(
  cors({
    origin: config.cors.frontendUrl, // exact origin only — never a wildcard, credentials require it
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  })
);

// ---- Global Rate Limiting ----
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api', limiter);

// ---- Request Parsing ----
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- Sessions ----
const sessionStore = getSessionStore();
app.use(session({
  name: 'sentrilearn.sid',
  secret: config.security.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: !config.server.isDev,
    domain: config.security.cookieDomain,
    maxAge: config.security.sessionTtlMs,
  },
}));

// Periodic housekeeping of expired session rows (dev-friendly interval).
setInterval(() => sessionStore.clearExpired(), 15 * 60 * 1000).unref();

// ---- CSRF (double-submit cookie, bound to the session) ----
app.use(doubleCsrfProtection);

// ---- Logging ----
app.use(morgan(config.server.isDev ? 'dev' : 'combined'));

// ---- Routes ----
app.use('/api', router);

// ---- Error Handling ----
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.server.port, () => {
  if (config.server.nodeEnv === 'test') return; // keep automated test output clean
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║        SENTRILEARN BACKEND ONLINE          ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Port      : ${String(config.server.port).padEnd(31)}║`);
  console.log(`║  Mode      : ${config.server.nodeEnv.padEnd(31)}║`);
  console.log(`║  Database  : ${config.db.path.padEnd(31)}║`);
  console.log(`║  AI (Gemini): ${(config.ai.enabled ? 'enabled' : 'disabled — no API key set').padEnd(30)}║`);
  console.log('╚════════════════════════════════════════════╝\n');
});

export default app;
export { server };
