import Joi from 'joi';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ERROR_CODES } from '../constants';

/**
 * Schema for creating an empty cart (no body required).
 */
export const createCartSchema = Joi.object({});

/**
 * Schema for adding items to a cart.
 */
export const addItemsSchema = Joi.object({
  cartId: Joi.string().required(),
  cartItem: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(),
        qty: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

/**
 * Middleware factory that validates either req.params (for GET/DELETE)
 * or req.body (for POST) against the provided Joi schema and returns a
 * 400 with a structured error when validation fails.
 */
export const validate = (schema: Joi.Schema): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.method === 'GET' || req.method === 'DELETE' ? req.params : req.body;
  const { error } = schema.validate(data);
  if (error) {
    return res.status(400).json({ error: { code: ERROR_CODES.INVALID_PAYLOAD, message: error.message } });
  }
  return next();
};
