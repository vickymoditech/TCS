import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cartService';

/**
 * Handler to create a new cart. Returns 201 with the created cart response.
 */
export async function createCartHandler(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const resp = cartService.createCart();
    return res.status(201).json(resp);
  } catch (err) {
    next(err);
    // If next returns, provide a fallback response type, though next(err) typically short-circuits
    throw err;
  }
} 

/**
 * Handler to return a cart by id. Responds with 200 and the enriched cart.
 */
export async function getCartHandler(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { cartId } = req.params;
    const resp = cartService.getCart(cartId);
    return res.status(200).json(resp);
  } catch (err) {
    next(err);
    throw err;
  }
}

/**
 * Handler to add or update items in a cart. Accepts the { cartId, cartItem } body.
 */
export async function addItemsHandler(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { cartId, cartItem } = req.body;
    const resp = await cartService.addOrUpdateItems(cartId, cartItem);
    return res.status(200).json(resp);
  } catch (err) {
    next(err);
    throw err;
  }
}

/**
 * Handler to remove an item from a cart using path params {cartId, itemId}.
 */
export async function removeItemHandler(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { cartId, itemId } = req.params;
    const resp = await cartService.removeItem(cartId, itemId);
    return res.status(200).json(resp);
  } catch (err) {
    next(err);
    throw err;
  }
} 
