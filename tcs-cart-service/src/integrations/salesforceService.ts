import { salesforceClient, SalesforceCartExpiredError, SFItem } from './salesforceClient';

/**
 * Thin adapter around the Salesforce client. Kept to separate integration
 * concerns from higher-level business logic in CartService.
 */
export class SalesforceService {

  /** Create a new Salesforce context id. */
  createContext(): string {
    return salesforceClient.createContext();
  }

  /** Proxy to add an item. */
  addItem(contextId: string, item: SFItem): SFItem[] {
    return salesforceClient.addItem(contextId, item);
  }

  /** Proxy to remove an item. */
  removeItem(contextId: string, itemId: string): SFItem[] {
    return salesforceClient.removeItem(contextId, itemId);
  }

  /** Proxy to read a cart by context id. */
  getCart(contextId: string): SFItem[] {
    return salesforceClient.getCart(contextId);
  }

  /**
   * Helper to detect whether an error represents an expired Salesforce context.
   */
  static isExpiredError(err: unknown): err is SalesforceCartExpiredError {
    return err instanceof SalesforceCartExpiredError;
  }
} 
