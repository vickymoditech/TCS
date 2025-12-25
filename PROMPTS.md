# PROMPTS.md

This file documents the exact prompts used with Claude Code to generate and refine the implementation for the Backend Cart Service.

The goal was to guide the AI using clear, deterministic specifications and then iteratively correct and align the output with real-world backend and microservice practices.

---

## Prompt 1 - Initial Architecture and API Design

**Prompt given to Claude Code:**

```
You are a backend engineer.

Using the following specifications, generate a Node.js (TypeScript) backend service.
Read the architecture and API contracts carefully and implement the service accordingly.

SPEC-A:
<PASTE FULL CONTENT OF SPEC-A-architecture.md HERE>

SPEC-B:
<PASTE FULL CONTENT OF SPEC-B-api.md HERE>

Constraints:
- Node.js 20+
- TypeScript
- Minimal HTTP framework
- No database
- In-memory state only
- No real Salesforce calls
- Implement SalesforceCartClient as a test double
- Write clean, readable, production-style code
- Focus on correctness over polish
```

**Result:**
- Generated initial project structure
- Created controllers, services, and in-memory store
- Implemented SalesforceCartClient test double

**Action Taken:**
- Accepted overall structure
- Reviewed for clarity and correctness

---

## Prompt 2 - Refinement for Microservice Design

**Prompt given to Claude Code:**

```
Refine the implementation to follow real backend microservice practices.

Requirements:
- Separate Controller, Service, Store, and Salesforce integration layers
- Ensure Salesforce logic is fully isolated
- Add global error handling
- Add request validation using Joi
- Ensure no Salesforce-specific errors leak to API consumers
```

**Result:**
- Improved separation of concerns
- Added validation and global error handling

**Action Taken:**
- Accepted changes
- Minor naming adjustments were made manually

---

## Prompt 3 - Salesforce Expiry and Retry Logic

**Prompt given to Claude Code:**

```
Update the Cart Service to properly handle Salesforce cart context expiry.

Rules:
- Salesforce cart contexts expire after a fixed number of operations
- On expiry:
  - Create a new Salesforce cart context
  - Replay all existing cart items
  - Retry the failed operation automatically
- Client must never see Salesforce expiry errors
```

**Result:**
- Implemented retry and recovery logic
- Salesforce expiry handled transparently

**Action Taken:**
- Accepted logic
- Simplified replay strategy for clarity

---

## Prompt 4 - Partial Success and invalidItems Support

**Prompt given to Claude Code:**

```
Update the API behavior to support partial success for item operations.

Requirements:
- Requests may contain multiple items
- Valid items should be processed successfully
- Invalid items should not fail the entire request
- Invalid items must be returned in an invalidItems array with itemId and errorMessage
- Cart response must always return full cart state
```

**Result:**
- API responses updated to include invalidItems
- Cart responses enriched with item-level error reporting

**Action Taken:**
- Accepted response structure
- Updated SPEC-A and SPEC-B to align with this behavior

---

## Notes

- All prompts were intentionally written in simple, explicit language to avoid ambiguity.
- Claude Code output was reviewed after each step.
- Manual edits were limited to naming consistency and alignment with real-world backend practices.
- The final implementation closely follows the provided specifications without additional assumptions.
