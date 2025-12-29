import { v4 as uuidv4 } from 'uuid';
import { MESSAGES } from '../constants';

/**
 * Error thrown by the simulated Salesforce client when a context is missing/expired.
 */
export class SalesforceCartExpiredError extends Error {
  constructor(message: string = MESSAGES.SALESFORCE_CART_EXPIRED) {
    super(message);
  }
}

/**
 * Internal representation of a Salesforce cart context stored in-memory for tests.
 */
export interface SFItem { itemId: string; qty: number }

export interface SFContext {
  id: string;
  createdAt: number;
  items: SFItem[];
} 

/**
 * Lightweight in-memory simulation of a remote Salesforce cart service.
 * Tests and the CartService use this client to simulate add/remove operations
 * and to exercise expiry logic.
 */
export class SalesforceCartClient {
  private contexts = new Map<string, SFContext>();

  /**
   * Create a new Salesforce context id for a cart.
   */
  createContext(): string {
    const id = uuidv4();
    const ctx: SFContext = { id, createdAt: Date.now(), items: [] };
    this.contexts.set(id, ctx);
    return id;
  }

  /**
   * Add or update an item in the specified context, throwing when the
   * context is not found (simulates an expired server-side context).
   */
  addItem(contextId: string, item: SFItem): SFItem[] {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new SalesforceCartExpiredError();
    const idx = ctx.items.findIndex((i) => i.itemId === item.itemId);
    if (idx === -1) ctx.items.push({ ...item });
    else ctx.items[idx].qty = item.qty;
    return ctx.items;
  }

  /**
   * Remove an item from the specified context or throw if context is expired.
   */
  removeItem(contextId: string, itemId: string): SFItem[] {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new SalesforceCartExpiredError();
    ctx.items = ctx.items.filter((i) => i.itemId !== itemId);
    return ctx.items;
  }

  /**
   * Return the items for a context (or throw when expired).
   */
  getCart(contextId: string): SFItem[] {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new SalesforceCartExpiredError();
    return ctx.items;
  }

  /**
   * Delete a context and return whether it existed.
   */
  deleteCart(contextId: string): boolean {
    return this.contexts.delete(contextId);
  }

  /**
   * Helper used by the sweeper to list all contexts.
   */
  listAll(): SFContext[] {
    return Array.from(this.contexts.values());
  }
}

/**
 * Shared client instance used by service code and tests.
 */
export const salesforceClient = new SalesforceCartClient();