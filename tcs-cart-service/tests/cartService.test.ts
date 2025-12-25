import { CartService } from '../src/services/cartService';

describe('CartService basic flows', () => {
  it('creates a cart and adds valid and invalid items', async () => {
    const cs = new CartService();
    const cart = cs.createCart();
    expect(cart.cartItem.length).toBe(0);

    const resp = await cs.addOrUpdateItems(cart.cartId, [
      { itemId: 'ITEM_1', qty: 2 },
      { itemId: 'INVALID', qty: 1 },
    ]);

    // ITEM_1 should be present, INVALID should be in invalidItem
    expect(resp.cartItem.find((i) => i.itemId === 'ITEM_1')).toBeDefined();
    expect(resp.invalidItem.length).toBeGreaterThan(0);
  });

  it('recovers from Salesforce expiry by replaying items', async () => {
    const cs = new CartService();
    const cart = cs.createCart();

    // add initial item
    await cs.addOrUpdateItems(cart.cartId, [{ itemId: 'ITEM_1', qty: 1 }]);

    // wait for expiry
    await new Promise((r) => setTimeout(r, 20));

    // adding a second item should trigger expiry handling and replay
    const resp = await cs.addOrUpdateItems(cart.cartId, [{ itemId: 'ITEM_2', qty: 2 }]);

    expect(resp.cartItem.find((i) => i.itemId === 'ITEM_1')).toBeDefined();
    expect(resp.cartItem.find((i) => i.itemId === 'ITEM_2')).toBeDefined();
  });

  it('removes an item even if Salesforce context expires', async () => {
    const cs = new CartService();
    const cart = cs.createCart();

    await cs.addOrUpdateItems(cart.cartId, [
      { itemId: 'ITEM_1', qty: 1 },
      { itemId: 'ITEM_2', qty: 1 },
    ]);

    // expire
    await new Promise((r) => setTimeout(r, 20));

    // remove ITEM_1 should succeed
    const resp = await cs.removeItem(cart.cartId, 'ITEM_1');

    expect(resp.cartItem.find((i) => i.itemId === 'ITEM_1')).toBeUndefined();
    expect(resp.cartItem.find((i) => i.itemId === 'ITEM_2')).toBeDefined();
  });
});
