import { RequestHandler } from 'express';
import { log } from '../utils/logger';
import { ERROR_CODES, MESSAGES } from '../constants';
import { API_TOKEN } from '../config';

/**
 * API authentication middleware.
 *
 * Behavior:
 * - Skips checks when NODE_ENV === 'test' to avoid interfering with tests.
 * - If no API token is configured (process.env.API_TOKEN is falsy), it logs a
 *   warning and allows requests (useful for local/dev).
 * - Otherwise, validates an incoming token from either the `x-api-token`
 *   header or the `Authorization: Bearer <token>` header and rejects with 401
 *   on mismatch.
 */
export const authMiddleware: RequestHandler = (req, res, next) => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'test') return next();

  const apiToken = API_TOKEN;
  if (!apiToken) {
    log.warn('API token not configured, skipping auth checks');
    return next();
  }

  const headerToken =
    (req.headers['x-api-key'] as string | undefined) ||
    (typeof req.headers.authorization === 'string' ? req.headers.authorization.split(' ')[1] : undefined);

  if (headerToken && headerToken === apiToken) return next();

  return res.status(401).json({ error: { code: ERROR_CODES.UNAUTHORIZED, message: MESSAGES.INVALID_API_TOKEN } });
};