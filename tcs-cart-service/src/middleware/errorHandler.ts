import { Request, Response, NextFunction } from 'express';
import { CartNotFoundError, ValidationError } from '../services/cartService';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof CartNotFoundError) {
    return res.status(404).json({ error: { code: 'CART_NOT_FOUND', message: err.message } });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
  // fallback
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' } });
}
