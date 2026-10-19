// =============================================
// SQLITE-BACKED SESSION STORE
// Implements the express-session Store interface directly on
// top of the app's node:sqlite connection (no separate driver).
// =============================================
import session from 'express-session';
import { getDb } from '../../db/connection.js';

const { Store } = session;

export class SqliteSessionStore extends Store {
  #db;

  constructor() {
    super();
    this.#db = getDb();
  }

  get(sid, callback) {
    try {
      const row = this.#db.prepare('SELECT data, expires_at FROM sessions WHERE sid = ?').get(sid);
      if (!row) return callback(null, null);
      if (row.expires_at < Date.now()) {
        this.destroy(sid, () => callback(null, null));
        return;
      }
      callback(null, JSON.parse(row.data));
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sessionData, callback) {
    try {
      const expiresAt = sessionData.cookie?.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + 2 * 60 * 60 * 1000;
      const userId = sessionData.user?.id ?? null;
      const now = new Date().toISOString();

      this.#db.prepare(`
        INSERT INTO sessions (sid, user_id, data, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET
          user_id = excluded.user_id,
          data = excluded.data,
          expires_at = excluded.expires_at
      `).run(sid, userId, JSON.stringify(sessionData), expiresAt, now);

      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid, callback) {
    try {
      this.#db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }

  touch(sid, sessionData, callback) {
    try {
      const expiresAt = sessionData.cookie?.expires
        ? new Date(sessionData.cookie.expires).getTime()
        : Date.now() + 2 * 60 * 60 * 1000;
      this.#db.prepare('UPDATE sessions SET expires_at = ? WHERE sid = ?').run(expiresAt, sid);
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }

  /** Deletes every session belonging to a user — used when an account is disabled. */
  destroyAllForUser(userId) {
    this.#db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  }

  /** Housekeeping: removes expired rows. Safe to call periodically. */
  clearExpired() {
    this.#db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  }
}

let storeInstance = null;
export function getSessionStore() {
  if (!storeInstance) storeInstance = new SqliteSessionStore();
  return storeInstance;
}
