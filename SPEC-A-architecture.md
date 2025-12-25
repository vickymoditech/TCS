# SPEC-A: Backend Cart Service Architecture

## Purpose

Build a backend microservice that manages a telecom shopping cart using a non-persistent Salesforce cart context.
Salesforce cart contexts are temporary and can expire. This service must handle Salesforce failures internally and always return a stable and predictable API response to its consumers.
This is a backend-only service. Frontend, BFF, and UI concerns are out of scope.

---

## High-Level Overview

This service owns the cart lifecycle and cart state.
It orchestrates cart operations, enriches cart responses, and hides Salesforce-specific behavior from API consumers.
The service follows a simple layered microservice architecture with clear separation of concerns.

---

## Architectural Layers

### 1. Controller Layer (HTTP Layer)

Implement REST controllers that:

- Expose cart-related endpoints
- Validate request payloads using Joi middleware
- Log request method, path, response status, and timestamp
- Call service-layer methods
- Do not contain business logic
- Return consistent success and error responses

---

### 2. Cart Service (Business Layer)

Implement a Cart Service that:

- Owns cart lifecycle and business rules
- Coordinates cart operations across internal services
- Maintains cart consistency
- Enriches cart responses with:
  - Item name
  - Price
  - Item total
  - Basket total
- Supports partial success for item operations:
  - Valid items are added to the cart
  - Invalid items are returned in an `invalidItems` array
  - Requests do not fail due to item-level errors
- Handles Salesforce cart context expiry by:
  - Creating a new Salesforce cart context
  - Replaying all existing cart items
  - Retrying the failed operation automatically
- Ensures Salesforce-specific errors never reach API consumers

This is the core decision-making layer of the system.

---

### 3. Salesforce Integration Layer

#### SalesforceService

- Acts as an integration adapter
- Contains no business logic
- Delegates all operations to a Salesforce client
- Exposes simple methods such as:
  - createContext
  - addItem
  - removeItem
  - getCart

#### SalesforceCartClient (Test Double)

- Simulates Salesforce cart behavior
- Creates temporary cart contexts
- Expires a cart context after a fixed number of operations
- Throws a deterministic error when a context expires
- Does not persist data

Salesforce logic must be fully isolated from the Cart Service.

---

### 4. Store Service (State Management Layer)

Implement a Store Service that:

- Stores cart state in memory
- Uses cartId as the key
- Stores:
  - Salesforce cart context ID
  - Cart items
- Overrides existing state silently
- Contains no business logic
- Is designed to be replaceable with Redis or another distributed cache in production

---

## Data Flow

1. Client sends a request to create a cart.
2. Cart Service creates a Salesforce cart context and stores cart state in memory.
3. Client performs cart operations using cartId.
4. Cart Service forwards operations to SalesforceService.
5. If Salesforce context expires:
   - Cart Service creates a new context.
   - Replays all stored cart items.
   - Retries the failed operation.
6. If item-level issues occur:
   - Valid items are processed
   - Invalid items are collected in `invalidItems`
7. Client receives a successful response with full cart state and item-level errors if any.

---

## Validation Strategy

- All incoming requests are validated using Joi middleware.
- Services assume validated input.
- Invalid payloads result in HTTP 400 responses.
- Item-level business validation errors are reported via `invalidItems`.

---

## Error Handling Strategy

- Salesforce cart expiry is handled internally and retried automatically.
- Domain errors (e.g., cart not found) return appropriate 4xx responses.
- Item-level failures do not fail the entire request.
- Unexpected system failures return HTTP 500 responses.
- Salesforce-specific errors must never be returned to API consumers.
- A global error handler must format all error responses consistently.

---

## Scalability and Future Evolution

This implementation uses in-memory state to meet the constraints of the exercise.

In a production environment:
- In-memory state would be replaced with a distributed cache (e.g., Redis)
- The service would be horizontally scaled behind a load balancer
- Salesforce calls would be protected using rate limiting, circuit breakers, or async processing
- The Salesforce integration layer could be extracted into a standalone service without changing business logic

---

## Architectural Principles

- Backend microservice design
- Clear separation of concerns
- Deterministic and testable behavior
- Partial success support for item operations
- Small and cohesive components
- Runtime state only
