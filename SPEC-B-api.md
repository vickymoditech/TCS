# SPEC-B: Cart Service API Contracts

## Base URL

All endpoints are served under:

/api

---

## Data Models

### CartItemRequest

```json
{
  "itemId": "string",
  "qty": 1
}
```

Rules:
- itemId is required
- qty must be greater than 0

---

### CartItemResponse

```json
{
  "itemId": "string",
  "name": "string",
  "qty": 1,
  "price": 10,
  "total": 10
}
```

---

### InvalidCartItem

```json
{
  "itemId": "string",
  "reason": "string"
}
```

Examples of reason:
- ITEM_NOT_FOUND
- ITEM_NOT_ELIGIBLE
- OUT_OF_STOCK
- INVALID_QUANTITY

---

### CartRequest

```json
{
  "cartId": "string",
  "cartItem": [CartItemRequest]
}
```

---

### CartResponse

```json
{
  "cartId": "string",
  "cartItem": [CartItemResponse],
  "invalidItem": [InvalidCartItem],
  "basketTotal": 100
}
```

Rules:
- basketTotal = sum of all valid item totals
- invalidItem contains items that could not be added or updated

---

## Endpoints

---

### Create Cart

Creates a new cart and a new Salesforce cart context.

**POST** `/api/cart`

Response (201):

```json
{
  "cartId": "string",
  "cartItem": [],
  "invalidItem": [],
  "basketTotal": 0
}
```

---

### Get Cart

Returns current cart details.

**GET** `/api/cart/{cartId}`

Response (200):

```json
{
  "cartId": "string",
  "cartItem": [
    {
      "itemId": "string",
      "name": "string",
      "qty": 2,
      "price": 10,
      "total": 20
    }
  ],
  "invalidItem": [],
  "basketTotal": 10
}
```

Error (404):

```json
{
  "error": {
    "code": "CART_NOT_FOUND",
    "message": "Cart not found"
  }
}
```

---

### Add / Update Cart Items

Adds or updates items in the cart.

**POST** `/api/cart/items`

Request body:

```json
{
  "cartId": "string",
  "cartItem": [
    {
      "itemId": "string",
      "qty": 2
    }
  ]
}
```

Response (200):

```json
{
  "cartId": "string",
  "cartItem": [
    {
      "itemId": "string",
      "name": "string",
      "qty": 2,
      "price": 10,
      "total": 20
    }
  ],
  "invalidItem": [
    {
      "itemId": "INVALID_123",
      "reason": "ITEM_NOT_FOUND"
    }
  ],
  "basketTotal": 20
}
```

Rules:
- Valid items are processed and included in cartItem
- Invalid items are returned in invalidItem
- Request succeeds even if some items are invalid

---

### Remove Item from Cart

Removes an item from the cart.

**DELETE** `/api/cart/{cartId}/items/{itemId}`

Response (200):

```json
{
  "cartId": "string",
  "cartItem": [],
  "invalidItem": [],
  "basketTotal": 0
}
```

---

## Salesforce Cart Expiry Handling

- Salesforce cart context may expire during any operation.
- When expiry happens:
  - Create a new Salesforce cart context
  - Replay all existing cart items
  - Retry the failed operation
- API must return a successful response.
- Salesforce errors must not be exposed to clients.

---

## Error Handling

- 400 for validation errors (payload format issues only)
- 404 when cartId does not exist
- 500 for unexpected system errors
- Business-level item errors must be returned in invalidItem
- Salesforce-specific errors must be handled internally

---

## General Rules

- cartId is required for all endpoints except Create Cart
- No authentication or authorization
- No database usage
- In-memory state only
- Consistent JSON responses
