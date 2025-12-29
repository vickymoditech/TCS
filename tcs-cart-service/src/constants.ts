/** Centralized project constants for error codes and messages */

export const ERROR_CODES = {
  CART_NOT_FOUND: 'CART_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export const MESSAGES = {
  SALESFORCE_CART_EXPIRED: 'Salesforce cart context expired',
  INVALID_API_TOKEN: 'Invalid API token',
  UNEXPECTED_ERROR: 'Unexpected error',
} as const;

export const INVALID_ITEM_REASONS = {
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  ITEM_NOT_ELIGIBLE: 'ITEM_NOT_ELIGIBLE',
  REPLAY_FAILED: 'REPLAY_FAILED',
} as const;

export type InvalidItemReason = typeof INVALID_ITEM_REASONS[keyof typeof INVALID_ITEM_REASONS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type MessageKey = typeof MESSAGES[keyof typeof MESSAGES];
