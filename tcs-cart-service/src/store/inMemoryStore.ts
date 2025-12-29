import { CartItemRequest } from '../models/cart';

/**
 * Representation of a stored cart in the in-memory store.
 */
export interface StoredCart {
  cartId: string;
  sfContextId: string;
  sfContextCreatedAt: number;
  items: CartItemRequest[];
} 

export class InMemoryStore {
  private map = new Map<string, StoredCart>();

  /**
   * Create or update a cart entry in the in-memory store.
   */
  createOrUpdateCart(
    cartId: string,
    sfContextId: string,
    items: CartItemRequest[] = [],
    sfContextCreatedAt: number = Date.now()
  ): StoredCart {
    const stored: StoredCart = { cartId, sfContextId, sfContextCreatedAt, items };
    this.map.set(cartId, stored);
    return stored;
  }

  /**
   * Retrieve the stored cart by id or null if not found.
   */
  getCart(cartId: string): StoredCart | null {
    return this.map.get(cartId) ?? null;
  }

  /**
   * Update the Salesforce context id and timestamp for a given cart.
   */
  updateContext(cartId: string, sfContextId: string, sfContextCreatedAt: number = Date.now()): StoredCart | null {
    const c = this.map.get(cartId);
    if (!c) return null;
    c.sfContextId = sfContextId;
    c.sfContextCreatedAt = sfContextCreatedAt;
    this.map.set(cartId, c);
    return c;
  }

  /**
   * Replace the item list for the specified cart.
   */
  setItems(cartId: string, items: CartItemRequest[]): StoredCart | null {
    const c = this.map.get(cartId);
    if (!c) return null;
    c.items = items;
    this.map.set(cartId, c);
    return c;
  }
}

/**
 * Shared in-memory store instance used by services and tests.
 */
export const store = new InMemoryStore();
