// =============================================
// ZOD-BASED REQUEST VALIDATION
//
// Schemas use `.strict()` so any unexpected/forbidden field in the
// payload causes a 400 rather than being silently accepted.
// =============================================
import { sendError } from '../utils/response.util.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 'Validation failed.', 400, result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })));
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return sendError(res, 'Invalid request parameters.', 400, result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })));
    }
    req.params = { ...req.params, ...result.data };
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return sendError(res, 'Invalid query parameters.', 400, result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })));
    }
    req.validatedQuery = result.data;
    next();
  };
}
