import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const createCartSchema = Joi.object({});

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

export const validate = (schema: Joi.Schema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.method === 'GET' || req.method === 'DELETE' ? req.params : req.body;
  const { error } = schema.validate(data);
  if (error) {
    return res.status(400).json({ error: { code: 'INVALID_PAYLOAD', message: error.message } });
  }
  return next();
};
