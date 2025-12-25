# TCS Cart Service

A small backend-only cart microservice written in **Node.js + TypeScript + Express**.

This service implements a temporary cart backed by an in-memory store and a Salesforce test-double. It demonstrates handling of cart lifecycle, item validation, replaying items when the external (Salesforce) context expires, and a background sweeper that removes expired Salesforce contexts.

---

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration / Environment](#configuration--environment)
- [Running with Docker](#running-with-docker)
- [API](#api)
  - [Create Cart](#create-cart)
  - [Get Cart](#get-cart)
  - [Add / Update Items](#add--update-items)
  - [Remove Item](#remove-item)
- [Data Models](#data-models)
- [Tests](#tests)
- [Project Structure](#project-structure)
- [Notes & Behavior](#notes--behavior)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- In-memory cart store (no external DB)
- Salesforce test-double with TTL-based expiry and automatic replay logic
- Background sweeper that clears expired Salesforce contexts
- Request validation with **Joi**
- OpenAPI / Swagger UI served at `/docs`
- Unit tests with **Jest**

---

## Quick Start
Prerequisites: Node.js 18+ and npm.

1. Install dependencies

```bash
npm install
```

2. Run in development (auto-reload)

```bash
npm run dev
```

3. Build and run (production)

```bash
npm run build
npm start
```

The server listens on `PORT` (default `3000`).

Open the API docs at http://localhost:3000/docs

---

## Configuration / Environment
The service reads a few environment variables (defaults are shown):

- `PORT` — port to bind (default: `3000`)
- `NODE_ENV` — `development` | `production` (default: `development`)
- `SF_CART_TTL_MS` — **TTL in milliseconds** for Salesforce cart contexts (default: `10` in code; useful for short tests). The application exposes this value as `SALESFORCE_CART_TTL_MS` internally.

Example `.env` (create in your dev environment)

```env
PORT=3000
NODE_ENV=development
SF_CART_TTL_MS=300000 # 5 minutes
```

> Note: In the repository `src/config.ts` the exported constant is `SALESFORCE_CART_TTL_MS` and it reads from `process.env.SF_CART_TTL_MS`.

---

## Running with Docker
Build the image:

```bash
docker build -t tcs-cart-service .
```

Run the container (expose port 3000):

```bash
docker run -p 3000:3000 --env SF_CART_TTL_MS=300000 tcs-cart-service
```

---

## API
Base path: `/api`

All responses are JSON. The API surface matches the OpenAPI spec in `src/swagger.yaml` and is viewable at `/docs`.

### Create Cart
- Method: `POST`
- Path: `/api/cart`
- Response: `201` with `CartResponse`

Example:

```bash
curl -X POST http://localhost:3000/api/cart
```

### Get Cart
- Method: `GET`
- Path: `/api/cart/{cartId}`
- Response: `200` with `CartResponse`

Example:

```bash
curl http://localhost:3000/api/cart/<cartId>
```

### Add / Update Items
- Method: `POST`
- Path: `/api/cart/items`
- Body:
  - `cartId` (string) — required
  - `cartItem` (array) — required; each item: `{ itemId, qty }`
- Response: `200` with `CartResponse`. Invalid items (e.g., not found, out of stock, invalid qty) appear in `invalidItem` array.

Example:

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"cartId":"<cartId>","cartItem":[{"itemId":"p-1","qty":2}]}'
```

### Remove Item
- Method: `DELETE`
- Path: `/api/cart/{cartId}/items/{itemId}`
- Response: `200` with `CartResponse`

Example:

```bash
curl -X DELETE http://localhost:3000/api/cart/<cartId>/items/p-1
```

---

## Data Models
See `src/models/cart.ts` and `src/swagger.yaml` for the canonical definitions.

- CartItemRequest: `{ itemId: string, qty: number }`
- CartItemResponse: `{ itemId, name, qty, price, total }`
- InvalidCartItem: `{ itemId, reason }`
- CartResponse: `{ cartId, cartItem: CartItemResponse[], invalidItem: InvalidCartItem[], basketTotal }
`

---

## Tests
Run unit tests with Jest:

```bash
npm test
```

You can run a single test file:

```bash
npx jest tests/cartService.test.ts --watch
```

The project includes tests in the `tests/` folder (`cartService.test.ts`, `cartSweeper.test.ts`).

---

## Project Structure
Key folders/files:

- `src/` — application source
  - `index.ts` — server bootstrap
  - `app.ts` — express app
  - `routes/` — route definitions (`cart.ts`)
  - `controllers/` — request handlers
  - `services/` — business logic (`cartService.ts`, `catalogService.ts`)
  - `store/` — simple in-memory store
  - `integrations/` — Salesforce double and sweeper
  - `middleware/` — validation and error handling
  - `swagger.yaml` — OpenAPI spec
- `tests/` — unit tests
- `Dockerfile` — image build
- `package.json` — scripts: `dev`, `build`, `start`, `test`, `lint`, `format`

---

## Notes & Behavior
- The Salesforce client in `src/integrations/` is a **test-double** that keeps a list of contexts in memory. Each context has a creation timestamp; contexts older than `SF_CART_TTL_MS` are considered expired.
- When a Salesforce context expires during an operation, the service creates a new context and **replays** existing items to the new context to preserve user state.
- A background sweeper (`startSweeper`) runs every minute by default and deletes expired contexts; you can manually invoke a sweep in tests via `sweepOnce()`.
- The default `SF_CART_TTL_MS` in code is relatively short (useful for tests); set a suitable value (e.g., 5 minutes = `300000`) in production via environment variable.

---

## Contributing
Contributions are welcome. Please open issues or PRs to propose changes.

- Code style: ESLint + Prettier
- Format code before committing: `npm run format`
- Run lint: `npm run lint`

---

## License
This project is provided under the repository LICENSE.


---

If you'd like, I can also add examples of request/response payloads to the README or update the `SF_CART_TTL_MS` default in `src/config.ts` to a more realistic production default (e.g., 300000 ms).

