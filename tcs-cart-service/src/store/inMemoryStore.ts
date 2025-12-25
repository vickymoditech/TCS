import { CartItemRequest } from '../models/cart';

export interface StoredCart {
  cartId: string;
  sfContextId: string;
  sfContextCreatedAt: number;
  items: CartItemRequest[];
}

export class InMemoryStore {
  private map = new Map<string, StoredCart>();

  createOrUpdateCart(
    cartId: string,
    sfContextId: string,
    items: CartItemRequest[] = [],
    sfContextCreatedAt: number = Date.now()
  ) {
    const stored: StoredCart = { cartId, sfContextId, sfContextCreatedAt, items };
    this.map.set(cartId, stored);
    return stored;
  }

  getCart(cartId: string) {
    return this.map.get(cartId) ?? null;
  }

  updateContext(cartId: string, sfContextId: string, sfContextCreatedAt: number = Date.now()) {
    const c = this.map.get(cartId);
    if (!c) return null;
    c.sfContextId = sfContextId;
    c.sfContextCreatedAt = sfContextCreatedAt;
    this.map.set(cartId, c);
    return c;
  }

  setItems(cartId: string, items: CartItemRequest[]) {
    const c = this.map.get(cartId);
    if (!c) return null;
    c.items = items;
    this.map.set(cartId, c);
    return c;
  }
}

export const store = new InMemoryStore();
