import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cartService';

export async function createCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resp = cartService.createCart();
    return res.status(201).json(resp);
  } catch (err) {
    next(err);
  }
}

export async function getCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { cartId } = req.params;
    const resp = cartService.getCart(cartId);
    return res.status(200).json(resp);
  } catch (err) {
    next(err);
  }
}

export async function addItemsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { cartId, cartItem } = req.body;
    const resp = await cartService.addOrUpdateItems(cartId, cartItem);
    return res.status(200).json(resp);
  } catch (err) {
    next(err);
  }
}

export async function removeItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { cartId, itemId } = req.params;
    const resp = await cartService.removeItem(cartId, itemId);
    return res.status(200).json(resp);
  } catch (err) {
    next(err);
  }
}
