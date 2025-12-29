import { v4 as uuidv4 } from 'uuid';
import { CartItemRequest, CartItemResponse, InvalidCartItem, CartResponse } from '../models/cart';
import { store } from '../store/inMemoryStore';
import { SalesforceService } from '../integrations/salesforceService';
import { CatalogService } from './catalogService';
import { INVALID_ITEM_REASONS } from '../constants';

/**
 * Error thrown when a cart cannot be found.
 */
export class CartNotFoundError extends Error {}

/**
 * Error thrown on business validation failures (e.g., invalid quantities).
 */
export class ValidationError extends Error {}

/**
 * Service responsible for cart business logic and synchronization with Salesforce.
 * It validates items, coordinates add/remove operations with Salesforce, and
 * performs recovery when Salesforce contexts expire.
 */
export class CartService {
  private sfService: SalesforceService;

  /**
   * Create a new CartService and initialize its Salesforce integration instance.
   */
  constructor() {
    this.sfService = new SalesforceService();
  }

  /**
   * Create a new cart, initialize a Salesforce context for it, and persist the
   * initial empty cart in the store. Returns an enriched cart response.
   */
  createCart(): CartResponse {
    const cartId = uuidv4();
    const ctx = this.sfService.createContext();
    // record context creation timestamp so sweeper can expire the cart
    store.createOrUpdateCart(cartId, ctx, [], Date.now());
    return this.buildCartResponse(cartId);
  }

  /**
   * Return the enriched cart response for the given cartId.
   * Throws CartNotFoundError when no cart is present.
   */
  getCart(cartId: string): CartResponse {
    const s = store.getCart(cartId);
    if (!s) throw new CartNotFoundError('Cart not found');
    return this.buildCartResponse(cartId);
  }

  /**
   * Add or update multiple items for the provided cartId.
   * - Validates each item against the product catalog
   * - Attempts to add each valid item to Salesforce and updates local store
   * - If the Salesforce context has expired, it will create a new context,
   *   replay existing items, and retry the failed operation
   * Returns an enriched cart response and a list of invalid items (if any).
   */
  async addOrUpdateItems(cartId: string, items: CartItemRequest[]): Promise<CartResponse> {
    const s = store.getCart(cartId);
    if (!s) throw new CartNotFoundError('Cart not found');

    const invalid: InvalidCartItem[] = [];
    const validItems: CartItemRequest[] = [];

    // Validate items at business level
    for (const it of items) {
      if (!it.itemId || typeof it.qty !== 'number' || it.qty <= 0) {
        invalid.push({ itemId: it.itemId ?? 'UNKNOWN', reason: INVALID_ITEM_REASONS.INVALID_QUANTITY });
        continue;
      }
      const prod = CatalogService.find(it.itemId);
      if (!prod) {
        invalid.push({ itemId: it.itemId, reason: INVALID_ITEM_REASONS.ITEM_NOT_FOUND });
        continue;
      }
      if (!prod.inStock) {
        invalid.push({ itemId: it.itemId, reason: INVALID_ITEM_REASONS.OUT_OF_STOCK });
        continue;
      }
      if (!prod.eligible) {
        invalid.push({ itemId: it.itemId, reason: INVALID_ITEM_REASONS.ITEM_NOT_ELIGIBLE });
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
                invalid.push({ itemId: existing.itemId, reason: INVALID_ITEM_REASONS.REPLAY_FAILED });
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

  /**
   * Remove an item from the cart and mirror the removal to Salesforce. Handles
   * Salesforce context expiry by creating a new context and replaying existing
   * items before retrying the removal.
   */
  async removeItem(cartId: string, itemId: string): Promise<CartResponse> {
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

  /**
   * Enrich stored cart items with catalog information and compute totals.
   * This is a private helper used to construct the API response shape.
   */
  private buildCartResponse(cartId: string, invalid: InvalidCartItem[] = []): CartResponse {
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
