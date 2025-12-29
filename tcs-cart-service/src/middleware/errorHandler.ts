import { Request, Response, NextFunction } from 'express';
import { CartNotFoundError, ValidationError } from '../services/cartService';
import { ERROR_CODES, MESSAGES } from '../constants';

/**
 * Global error handler that maps known domain errors to structured HTTP
 * responses and returns a 500 for unexpected failures.
 */
export function globalErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CartNotFoundError) {
    return res.status(404).json({ error: { code: ERROR_CODES.CART_NOT_FOUND, message: err.message } });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: { code: ERROR_CODES.VALIDATION_ERROR, message: err.message } });
  }
  // fallback
  console.error(err);
  return res.status(500).json({ error: { code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: MESSAGES.UNEXPECTED_ERROR } });
} 
