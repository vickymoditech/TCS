export interface CartItemRequest {
  itemId: string;
  qty: number;
}

export interface CartItemResponse {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface InvalidCartItem {
  itemId: string;
  reason: string;
}

export interface CartResponse {
  cartId: string;
  cartItem: CartItemResponse[];
  invalidItem: InvalidCartItem[];
  basketTotal: number;
}
