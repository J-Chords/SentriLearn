// =============================================
// TEST ENVIRONMENT SETUP
//
// Imported FIRST (before app.js or any db module) by every test
// file. Points the whole app at an isolated, disposable SQLite
// file so tests never touch backend/data/sentrilearn.sqlite.
// =============================================
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = path.join(__dirname, '..', '..', 'data', `test-${process.pid}-${Date.now()}.sqlite`);

for (const suffix of ['', '-wal', '-shm']) {
  const p = TEST_DB_PATH + suffix;
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = TEST_DB_PATH;
process.env.PORT = process.env.TEST_PORT || '5099';
process.env.SESSION_SECRET = 'test-only-session-secret-not-for-production-use-0000';
process.env.CSRF_SECRET = 'test-only-csrf-secret-not-for-production-use-11111111';
process.env.FRONTEND_URL = `http://localhost:${process.env.PORT}`;
process.env.LOGIN_RATE_MAX_ATTEMPTS = '1000'; // don't let the rate limiter interfere with test volume
process.env.RATE_LIMIT_MAX_REQUESTS = '10000';
// AI intentionally disabled for tests. IMPORTANT: we set this to an empty
// string rather than deleting it — `dotenv/config` (imported later, inside
// config/index.js) only fills in keys that are ABSENT from process.env, so
// deleting it here would let dotenv silently reload the real key from
// backend/.env and fire a real paid Gemini request during automated tests.
process.env.GOOGLE_API_KEY = '';

export const BASE_URL = `http://localhost:${process.env.PORT}`;
export { TEST_DB_PATH };

export function cleanupTestDb() {
  for (const suffix of ['', '-wal', '-shm']) {
    const p = TEST_DB_PATH + suffix;
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      // Best-effort: a lingering OS-level file lock just leaves a temp file
      // behind under backend/data/ — it is never the real dev database and
      // is safe to delete manually later. Never fail the test run over this.
    }
  }
}
