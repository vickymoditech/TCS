import { salesforceClient } from '../src/integrations/salesforceClient';
import { sweepOnce } from '../src/integrations/saleforceSweeper';
import { SalesforceService } from '../src/integrations/salesforceService';

describe('Cart sweeper', () => {
  it('removes carts after TTL', async () => {
    const cart = new SalesforceService();
    const contextId = cart.createContext();

    cart.addItem(contextId, { itemId: 'ITEM_1', qty: 1 });

    // wait for expiry
    await new Promise((r) => setTimeout(r, 20));

    const removed = sweepOnce();
    expect(removed).toContain(contextId);

    expect(() => salesforceClient.getCart(contextId)).toThrow();
  });
});