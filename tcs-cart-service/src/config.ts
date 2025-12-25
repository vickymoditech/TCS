export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const SALESFORCE_CART_TTL_MS = process.env.SF_CART_TTL_MS
  ? Number(process.env.SF_CART_TTL_MS)
  : 10 // 5 * 60 * 1000; // 5 minutes by default
export const NODE_ENV = process.env.NODE_ENV || 'development';
