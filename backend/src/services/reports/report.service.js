// =============================================
// PRACTICE PHISHING REPORT SERVICE
// =============================================
import { getDb } from '../../db/connection.js';
import { logActivity } from '../activity/activity.service.js';

export function createReport(userId, { messageType, reasons, notes }) {
  const db = getDb();
  const now = new Date().toISOString();
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO reports (user_id, message_type, reasons_json, notes, status, created_at)
    VALUES (?, ?, ?, ?, 'received', ?)
  `).run(userId, messageType, JSON.stringify(reasons), notes || null, now);

  logActivity(userId, 'report.submitted', 'Submitted a suspicious message report');
  return getReportById(lastInsertRowid);
}

function toPublicReport(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.userName,
    messageType: row.message_type,
    reasons: JSON.parse(row.reasons_json),
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  };
}

export function getReportById(id) {
  const db = getDb();
  const row = db.prepare(`
    SELECT r.*, u.name as userName FROM reports r JOIN users u ON u.id = r.user_id WHERE r.id = ?
  `).get(id);
  return row ? toPublicReport(row) : null;
}

export function listReportsForUser(userId) {
  const db = getDb();
  return db.prepare(`
    SELECT r.*, u.name as userName FROM reports r JOIN users u ON u.id = r.user_id
    WHERE r.user_id = ? ORDER BY r.created_at DESC
  `).all(userId).map(toPublicReport);
}

export function listAllReports() {
  const db = getDb();
  return db.prepare(`
    SELECT r.*, u.name as userName FROM reports r JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `).all().map(toPublicReport);
}

export function updateReportStatus(adminId, reportId, status) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
  if (!existing) {
    const err = new Error('Report not found.');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  db.prepare('UPDATE reports SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?')
    .run(status, adminId, new Date().toISOString(), reportId);
  logActivity(adminId, 'report.reviewed', `Marked report #${reportId} as ${status}`);
  return getReportById(reportId);
}
