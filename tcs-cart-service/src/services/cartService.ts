import { v4 as uuidv4 } from 'uuid';
import { CartItemRequest, CartItemResponse, InvalidCartItem, CartResponse } from '../models/cart';
import { store } from '../store/inMemoryStore';
import { SalesforceService } from '../integrations/salesforceService';
import { CatalogService } from './catalogService';

export class CartNotFoundError extends Error {}
export class ValidationError extends Error {}

export class CartService {
  private sfService: SalesforceService;

  constructor() {
    this.sfService = new SalesforceService();
  }

  createCart() {
    const cartId = uuidv4();
    const ctx = this.sfService.createContext();
    // record context creation timestamp so sweeper can expire the cart
    store.createOrUpdateCart(cartId, ctx, [], Date.now());
    return this.buildCartResponse(cartId);
  }

  getCart(cartId: string) {
    const s = store.getCart(cartId);
    if (!s) throw new CartNotFoundError('Cart not found');
    return this.buildCartResponse(cartId);
  }

  async addOrUpdateItems(cartId: string, items: CartItemRequest[]) {
    const s = store.getCart(cartId);
    if (!s) throw new CartNotFoundError('Cart not found');

    const invalid: InvalidCartItem[] = [];
    const validItems: CartItemRequest[] = [];

    // Validate items at business level
    for (const it of items) {
      if (!it.itemId || typeof it.qty !== 'number' || it.qty <= 0) {
        invalid.push({ itemId: it.itemId ?? 'UNKNOWN', reason: 'INVALID_QUANTITY' });
        continue;
      }
      const prod = CatalogService.find(it.itemId);
      if (!prod) {
        invalid.push({ itemId: it.itemId, reason: 'ITEM_NOT_FOUND' });
        continue;
      }
      if (!prod.inStock) {
        invalid.push({ itemId: it.itemId, reason: 'OUT_OF_STOCK' });
        continue;
      }
      if (!prod.eligible) {
        invalid.push({ itemId: it.itemId, reason: 'ITEM_NOT_ELIGIBLE' });
        continue;
      }
      validItems.push(it);
    }

    // Process valid items against Salesforce with expiry handling
    try {
      for (const it of validItems) {
        try {
          this.sfService.addItem(s.sfContextId, it);
        } catch (err) {
          if (SalesforceService.isExpiredError(err)) {
            // Recover: create new context, replay, retry current
            const newCtx = this.sfService.createContext();
            // replay
            for (const existing of s.items) {
              try {
                this.sfService.addItem(newCtx, existing);
              } catch (replayErr) {
                // if replay fails for some existing item, mark as invalid but continue
                invalid.push({ itemId: existing.itemId, reason: 'REPLAY_FAILED' });
              }
            }
            // update store context (record new context timestamp)
            store.updateContext(cartId, newCtx, Date.now());
            s.sfContextId = newCtx;
            s.sfContextCreatedAt = Date.now();
            // retry failed add
            this.sfService.addItem(s.sfContextId, it);
          } else {
            throw err;
          }
        }

        // update local stored items (override if exists)
        const idx = s.items.findIndex((x) => x.itemId === it.itemId);
        if (idx === -1) s.items.push(it);
        else s.items[idx].qty = it.qty;
      }

      // persist items
      store.setItems(cartId, s.items);

      return this.buildCartResponse(cartId, invalid);
    } catch (err) {
      // unexpected
      throw err;
    }
  }

  async removeItem(cartId: string, itemId: string) {
    const s = store.getCart(cartId);
    if (!s) throw new CartNotFoundError('Cart not found');

    try {
      try {
        this.sfService.removeItem(s.sfContextId, itemId);
      } catch (err) {
        if (SalesforceService.isExpiredError(err)) {
          // create new context and replay
          const newCtx = this.sfService.createContext();
          for (const existing of s.items) {
            if (existing.itemId === itemId) continue; // we'll remove after replay
            try {
              this.sfService.addItem(newCtx, existing);
            } catch (replayErr) {
              // log and continue; treat as item invalid at replay
            }
          }
          store.updateContext(cartId, newCtx, Date.now());
          s.sfContextId = newCtx;
          s.sfContextCreatedAt = Date.now();
          // now try remove on new context
          this.sfService.removeItem(s.sfContextId, itemId);
        } else throw err;
      }

      s.items = s.items.filter((i) => i.itemId !== itemId);
      store.setItems(cartId, s.items);
      return this.buildCartResponse(cartId);
    } catch (err) {
      throw err;
    }
  }

  private buildCartResponse(cartId: string, invalid: InvalidCartItem[] = []) {
    const s = store.getCart(cartId)!;
    const enriched = s.items.map((it) => {
      const prod = CatalogService.find(it.itemId)!;
      const total = prod.price * it.qty;
      return {
        itemId: it.itemId,
        name: prod.name,
        qty: it.qty,
        price: prod.price,
        total,
      } as CartItemResponse;
    });
    const basketTotal = enriched.reduce((acc, x) => acc + x.total, 0);
    const resp: CartResponse = {
      cartId,
      cartItem: enriched,
      invalidItem: invalid,
      basketTotal,
    };
    return resp;
  }
}

export const cartService = new CartService();
