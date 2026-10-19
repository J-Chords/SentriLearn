// =============================================
// AUTH MIDDLEWARE — session resolution, role & ownership checks
// =============================================
import { findUserById, toPublicUser } from '../services/auth/auth.service.js';
import { sendError } from '../utils/response.util.js';

/**
 * Resolves the current user from the session on EVERY request (not just
 * at login), so a disabled account is rejected on its very next call.
 */
export function requireAuth(req, res, next) {
  const sessionUserId = req.session?.user?.id;
  if (!sessionUserId) {
    return sendError(res, 'Authentication required.', 401);
  }

  const row = findUserById(sessionUserId);
  if (!row || !row.is_active) {
    req.session.destroy(() => {});
    return sendError(res, 'This account is no longer active. Contact your administrator.', 401);
  }

  req.user = toPublicUser(row);
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Authentication required.', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
}

/** Blocks a learner from acting on another learner's record; admins pass through. */
export function requireOwnerOrAdmin(getOwnerId) {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next();
    const ownerId = getOwnerId(req);
    if (ownerId !== req.user.id) {
      return sendError(res, 'You do not have permission to access this record.', 403);
    }
    next();
  };
}
