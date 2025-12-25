import { v4 as uuidv4 } from 'uuid';

export class SalesforceCartExpiredError extends Error {}

interface SFContext {
  id: string;
  createdAt: number;
  items: { itemId: string; qty: number }[];
}

export class SalesforceCartClient {
  private contexts = new Map<string, SFContext>();

  createContext() {
    const id = uuidv4();
    const ctx: SFContext = { id, createdAt: Date.now(), items: [] };
    this.contexts.set(id, ctx);
    return id;
  }

  addItem(contextId: string, item: { itemId: string; qty: number }) {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new SalesforceCartExpiredError('Salesforce cart context expired');
    const idx = ctx.items.findIndex((i) => i.itemId === item.itemId);
    if (idx === -1) ctx.items.push({ ...item });
    else ctx.items[idx].qty = item.qty;
    return ctx.items;
  }

  removeItem(contextId: string, itemId: string) {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new SalesforceCartExpiredError('Salesforce cart context expired');
    ctx.items = ctx.items.filter((i) => i.itemId !== itemId);
    return ctx.items;
  }

  getCart(contextId: string) {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new SalesforceCartExpiredError('Salesforce cart context expired');
    return ctx.items;
  }

  deleteCart(contextId: string) {
    return this.contexts.delete(contextId);
  }

  listAll() {
    return Array.from(this.contexts.values());
  }
}

export const salesforceClient = new SalesforceCartClient();