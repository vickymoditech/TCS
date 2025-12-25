import { salesforceClient, SalesforceCartExpiredError } from './salesforceClient';

// Thin adapter - no business logic here; errors bubble up for CartService to handle
export class SalesforceService {

  createContext() {
    return salesforceClient.createContext();
  }

  addItem(contextId: string, item: { itemId: string; qty: number }) {
    return salesforceClient.addItem(contextId, item);
  }

  removeItem(contextId: string, itemId: string) {
    return salesforceClient.removeItem(contextId, itemId);
  }

  getCart(contextId: string) {
    return salesforceClient.getCart(contextId);
  }

  static isExpiredError(err: unknown) {
    return err instanceof SalesforceCartExpiredError;
  }
}
