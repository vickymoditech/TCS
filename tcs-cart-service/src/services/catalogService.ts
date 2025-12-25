// Simple in-memory product catalog used for enrichment and validation

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

export const CatalogService = {
  find(itemId: string) {
    return PRODUCTS.find((p) => p.itemId === itemId) ?? null;
  },
};
