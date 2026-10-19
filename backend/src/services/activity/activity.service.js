// =============================================
// ACTIVITY / AUDIT LOG
// =============================================
import { getDb } from '../../db/connection.js';

export function logActivity(userId, type, message) {
  const db = getDb();
  db.prepare('INSERT INTO activity_events (user_id, type, message, created_at) VALUES (?, ?, ?, ?)')
    .run(userId, type, message, new Date().toISOString());
}

export function getActivityForUser(userId, limit = 10) {
  const db = getDb();
  return db.prepare(
    'SELECT id, type, message, created_at as createdAt FROM activity_events WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(userId, limit);
}

/** Recent activity across all learners, for the admin dashboard. */
export function getRecentPlatformActivity(limit = 10) {
  const db = getDb();
  return db.prepare(`
    SELECT ae.id, ae.type, ae.message, ae.created_at as createdAt, u.name as userName
    FROM activity_events ae
    JOIN users u ON u.id = ae.user_id
    WHERE u.role = 'learner'
    ORDER BY ae.created_at DESC
    LIMIT ?
  `).all(limit);
}
