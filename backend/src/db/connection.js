// =============================================
// SQLITE CONNECTION (Node core `node:sqlite`)
//
// Single-file, single-process SQLite database for this bounded
// academic application. WAL mode + foreign keys are enabled on
// every connection open.
// =============================================
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '../..');

export function resolveDatabasePath() {
  const configured = config.db.path;
  return path.isAbsolute(configured) ? configured : path.join(BACKEND_ROOT, configured);
}

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const dbPath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  dbInstance = new DatabaseSync(dbPath);
  dbInstance.exec('PRAGMA journal_mode = WAL');
  dbInstance.exec('PRAGMA foreign_keys = ON');
  dbInstance.exec('PRAGMA busy_timeout = 5000');
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/** Runs `fn` inside a BEGIN IMMEDIATE / COMMIT transaction, rolling back on error. */
export function withTransaction(fn) {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn(db);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch { /* ignore rollback failure */ }
    throw err;
  }
}

export function isUniqueConstraintError(err, columnHint) {
  return err?.code === 'ERR_SQLITE_ERROR'
    && /UNIQUE constraint failed/.test(err.message)
    && (!columnHint || err.message.includes(columnHint));
}
