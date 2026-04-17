# Chain of Responsibility Pattern

> **Behavioral Design Pattern**
> Reference: [refactoring.guru/design-patterns/chain-of-responsibility](https://refactoring.guru/design-patterns/chain-of-responsibility)

---

## Intent

**Chain of Responsibility** lets you pass requests along a chain of handlers. Upon receiving
a request, each handler decides either to process the request or to pass it to the next
handler in the chain.

Also known as: **CoR**, **Chain of Command**

---

## The Problem

You're building an online ordering system. Over time, you add sequential checks:

1. **Authentication** — is the user logged in?
2. **Authorization** — does the user have permission?
3. **Validation** — is the request data valid?
4. **Rate limiting** — has the user exceeded request limits?
5. **Caching** — is there a cached response?

Without Chain of Responsibility, these checks become deeply nested conditionals in a
single monolithic function. Adding, removing, or reordering checks requires modifying
this fragile code. Reusing individual checks across different endpoints is nearly impossible.

### What we want

- Each check is a **standalone, reusable object**
- Checks are linked into a **configurable chain**
- Each check can **short-circuit** the chain (stop processing)
- New checks can be added **without modifying existing code** (Open/Closed Principle)
- The **order of execution** is easily configurable

---

## Structure

```
┌──────────────────────────────────┐
│         <<interface>>            │
│           Handler                │
├──────────────────────────────────┤
│ + setNext(handler: Handler)      │
│ + handle(request: Request)       │
└──────────┬───────────────────────┘
           │ implements
┌──────────▼───────────────────────┐
│        BaseHandler               │
├──────────────────────────────────┤
│ - nextHandler: Handler | null    │
│ + setNext(handler): Handler      │  ◄── returns handler for chaining
│ + handle(request): Result        │  ◄── delegates to next if not handled
└──────────┬───────────────────────┘
           │ extends
     ┌─────┴──────┬──────────────┐
     ▼            ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Handler  │ │ Handler  │ │ Handler  │
│    A     │ │    B     │ │    C     │
└──────────┘ └──────────┘ └──────────┘
```

### Participants

| Role                | Responsibility                                                    |
| ------------------- | ----------------------------------------------------------------- |
| **Handler**          | Interface declaring `handle()` and optionally `setNext()`        |
| **BaseHandler**      | Optional abstract class with next-handler wiring and delegation  |
| **ConcreteHandler**  | Contains actual processing logic; decides to handle or pass on   |
| **Client**           | Composes the chain and sends requests to the first handler       |

---

## Chain Construction

Chains can be built in several ways:

### 1. Fluent chaining via `setNext()` returning the next handler

```typescript
const chain = handlerA;
handlerA.setNext(handlerB).setNext(handlerC);
chain.handle(request);
```

### 2. Builder / factory function

```typescript
function buildChain(...handlers: Handler[]): Handler {
  for (let i = 0; i < handlers.length - 1; i++) {
    handlers[i].setNext(handlers[i + 1]);
  }
  return handlers[0];
}
```

### 3. Constructor injection

```typescript
const c = new HandlerC(null);
const b = new HandlerB(c);
const a = new HandlerA(b);
a.handle(request);
```

---

## Implementation in TypeScript

```typescript
interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(request: T): T | null;
}

abstract class BaseHandler<T> implements Handler<T> {
  private nextHandler: Handler<T> | null = null;

  setNext(handler: Handler<T>): Handler<T> {
    this.nextHandler = handler;
    return handler; // enables chaining
  }

  handle(request: T): T | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

interface Request {
  userId: string;
  token: string;
  body: string;
}

class AuthHandler extends BaseHandler<Request> {
  handle(request: Request): Request | null {
    if (!request.token) {
      console.log("Auth: No token — rejected");
      return null; // short-circuit
    }
    console.log("Auth: Token valid");
    return super.handle(request); // pass to next
  }
}

class ValidationHandler extends BaseHandler<Request> {
  handle(request: Request): Request | null {
    if (!request.body) {
      console.log("Validation: Empty body — rejected");
      return null;
    }
    console.log("Validation: Body OK");
    return super.handle(request);
  }
}

// Usage
const auth = new AuthHandler();
const validation = new ValidationHandler();
auth.setNext(validation);

auth.handle({ userId: "1", token: "abc", body: "data" });
// Auth: Token valid → Validation: Body OK
```

---

## Middleware Analogy

Chain of Responsibility is the pattern behind **middleware** in web frameworks.

### Express.js

```typescript
app.use((req, res, next) => {
  // authenticate
  if (!req.headers.authorization) return res.status(401).send("Unauthorized");
  next(); // pass to next handler
});

app.use((req, res, next) => {
  // validate
  if (!req.body) return res.status(400).send("Bad Request");
  next();
});

app.get("/orders", (req, res) => {
  res.json({ orders: [] });
});
```

Each middleware is a handler. Calling `next()` passes to the next handler.
Not calling `next()` short-circuits the chain.

### Next.js Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (!request.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next(); // continue chain
}
```

### Key parallel

| CoR Concept           | Middleware Equivalent          |
| --------------------- | ----------------------------- |
| Handler               | Middleware function            |
| `handle(request)`     | `(req, res, next) => {}`      |
| `super.handle()`      | `next()`                      |
| Return null           | `res.send()` without `next()` |
| Chain construction    | `app.use()` registration      |

---

## When to Use

1. **Processing pipelines** — requests pass through multiple independent checks
2. **Multiple handlers, unknown at compile time** — chain is configured dynamically
3. **Order matters** — handlers must execute in a specific sequence
4. **Short-circuiting** — some conditions should stop further processing
5. **Decoupling sender from receiver** — the requester doesn't know which handler processes it
6. **Event bubbling** — DOM events, GUI component hierarchies
7. **Approval workflows** — manager → director → VP → CEO

---

## Pros and Cons

### Pros

- **Single Responsibility Principle** — each handler has one job
- **Open/Closed Principle** — add new handlers without modifying existing ones
- **Configurable order** — chain can be assembled differently per context
- **Decoupling** — sender doesn't know (or care) which handler processes the request
- **Short-circuit support** — stop processing early when appropriate

### Cons

- **Unhandled requests** — a request may reach the end of the chain without being processed
- **Debugging difficulty** — tracing which handler did what requires logging
- **Performance** — long chains add overhead
- **Implicit flow** — harder to understand than explicit conditional logic for simple cases

---

## Real-World Examples

### 1. Authentication Pipeline

```
RateLimiter → IPFilter → TokenValidator → RoleChecker → RequestHandler
```

Each step can reject the request. If all pass, the request reaches the actual handler.

### 2. Request Validation

Form validation chains: required field check → type check → range check → business rule check.
Each validator either passes or returns an error.

### 3. Logging Levels

```
ErrorLogger → WarningLogger → InfoLogger → DebugLogger
```

Each logger checks if the severity matches. If not, it passes to the next.
This is how logging frameworks like log4j work internally.

### 4. Event Bubbling (DOM)

```
Button → Form → Panel → Dialog → Window
```

A click event on a button propagates up through parent containers. Each element
can handle the event or let it bubble up. Calling `stopPropagation()` is short-circuiting.

### 5. Exception Handling

Try/catch blocks form an implicit chain. If one catch block can't handle an exception,
it re-throws to the next enclosing handler.

### 6. Approval Workflows

Purchase approval: if amount < $100, manager approves. If < $1000, director approves.
Otherwise, VP approves. Each level either handles or escalates.

---

## Two Variants of the Pattern

### Variant 1: Process-and-Forward (Pipeline)

Every handler processes the request AND passes it along. All handlers execute.
Example: logging middleware, request enrichment.

### Variant 2: Handle-or-Forward (Exclusive)

Only one handler processes the request. Once handled, the chain stops.
Example: event handling, exception handling, approval workflows.

---

## Related Patterns

- **Decorator** — similar structure (recursive wrapping) but decorators extend behavior
  while CoR handlers can short-circuit
- **Command** — CoR handlers can be implemented as Command objects
- **Composite** — chains can be extracted from composite tree structures (event bubbling)
- **Mediator** — alternative to CoR where a central object routes requests instead of a chain
- **Observer** — another way to connect senders and receivers, but with broadcast semantics

---

## Key Takeaways

1. Chain of Responsibility **decouples senders from receivers**
2. Handlers are **linked sequentially** — each decides to handle or delegate
3. The pattern supports both **pipeline** (all handle) and **exclusive** (first match) variants
4. **Middleware** in Express/Next.js is the most common real-world incarnation
5. Always consider what happens when **no handler** processes the request
6. Use **base handler classes** to eliminate boilerplate wiring code
