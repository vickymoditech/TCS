/**
 * Product model stored in the in-memory catalog.
 */
interface Product {
  itemId: string;
  name: string;
  price: number;
  inStock: boolean;
  eligible: boolean;
}

const PRODUCTS: Product[] = [
  { itemId: 'ITEM_1', name: 'Super SIM', price: 10, inStock: true, eligible: true },
  { itemId: 'ITEM_2', name: 'Data Pack 1GB', price: 5, inStock: true, eligible: true },
  { itemId: 'ITEM_3', name: 'Premium Plan', price: 30, inStock: false, eligible: true },
];

/**
 * Simple in-memory product catalog used for enrichment and validation.
 */
export const CatalogService = {
  /**
   * Find a product by itemId or return null when not present.
   */
  find(itemId: string): Product | null {
    return PRODUCTS.find((p) => p.itemId === itemId) ?? null;
  },
};
