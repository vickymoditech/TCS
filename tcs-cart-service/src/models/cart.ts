import { InvalidItemReason } from '../constants';

/**
 * Request shape when adding/updating an item in the cart.
 */
export interface CartItemRequest {
  itemId: string;
  qty: number;
}

/**
 * API response shape for an individual cart item (enriched by the catalog).
 */
export interface CartItemResponse {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

/**
 * Structure representing an invalid item and the reason it was rejected.
 */
export interface InvalidCartItem {
  itemId: string;
  reason: InvalidItemReason;
}

/**
 * API response shape for the cart.
 */
export interface CartResponse {
  cartId: string;
  cartItem: CartItemResponse[];
  invalidItem: InvalidCartItem[];
  basketTotal: number;
} 
