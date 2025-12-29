import { Router } from 'express';
import {
  createCartHandler,
  getCartHandler,
  addItemsHandler,
  removeItemHandler,
} from '../controllers/cartController';
import { validate, createCartSchema, addItemsSchema } from '../middleware/validation';

const router = Router();

/**
 * Cart-related routes mounted under /api in the main router.
 */
router.post('/cart', validate(createCartSchema), createCartHandler);
router.get('/cart/:cartId', getCartHandler);
router.post('/cart/items', validate(addItemsSchema), addItemsHandler);
router.delete('/cart/:cartId/items/:itemId', removeItemHandler);

export default router; 
