// =============================================
// AUTH SERVICE — password hashing & user records
// =============================================
import argon2 from 'argon2';
import { getDb, isUniqueConstraintError } from '../../db/connection.js';

// OWASP-recommended baseline for Argon2id (2024 cheat sheet: m>=19 MiB, t=2, p=1).
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    learnerCategory: row.learner_category,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    // Seed/demo accounts use the @sentrilearn.local convention — see docs/IMPLEMENTATION_STATUS.md.
    isDemoAccount: row.email.endsWith('@sentrilearn.local'),
  };
}

export function findUserByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
}

export function findUserById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function listUsers({ role } = {}) {
  const db = getDb();
  if (role) return db.prepare('SELECT * FROM users WHERE role = ? ORDER BY created_at DESC').all(role);
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

export async function createUser({ email, password, name, role, learnerCategory = null }) {
  const db = getDb();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const info = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, learner_category, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `).run(normalizedEmail, passwordHash, name, role, role === 'learner' ? learnerCategory : null, now, now);
    return findUserById(info.lastInsertRowid);
  } catch (err) {
    if (isUniqueConstraintError(err, 'users.email')) {
      const conflict = new Error('An account with this email already exists.');
      conflict.statusCode = 409;
      conflict.expose = true;
      throw conflict;
    }
    throw err;
  }
}

export function setUserActive(userId, isActive) {
  const db = getDb();
  db.prepare('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?')
    .run(isActive ? 1 : 0, new Date().toISOString(), userId);
  return findUserById(userId);
}
