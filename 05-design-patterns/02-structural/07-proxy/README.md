# Proxy Pattern

> **Reference**: [Refactoring.Guru - Proxy](https://refactoring.guru/design-patterns/proxy)

## Intent

**Proxy** is a structural design pattern that provides a substitute or placeholder for
another object. A proxy controls access to the original object, allowing you to perform
something either before or after the request gets through to the original object.

## Problem

You have a heavyweight object (e.g., a database connection, a large file, a remote service)
that consumes significant resources. You don't always need it, but you can't easily modify
it — it might be part of a third-party library, or changing it would violate the single
responsibility principle.

You need to add behavior like lazy initialization, access control, logging, or caching
without modifying the original object.

## Solution

Create a proxy class with the same interface as the original service object. The proxy
holds a reference to the service and delegates work to it, adding behavior before or
after delegation.

```
Client  --->  Proxy  --->  RealService
              (same interface as RealService)
```

Since the proxy implements the same interface, it can be substituted anywhere the real
service is expected — the client doesn't know the difference.

## Types of Proxy

### 1. Virtual Proxy (Lazy Loading)

Defers creation of an expensive object until it's actually needed. The proxy creates
the real object on first access.

### 2. Protection Proxy (Access Control)

Controls access based on credentials or permissions. The proxy checks authorization
before forwarding the request.

### 3. Logging Proxy

Records all requests before forwarding them to the real service. Useful for auditing
and debugging.

### 4. Caching Proxy

Stores results of expensive operations and returns cached results for identical requests.
Manages cache lifecycle (TTL, invalidation).

### 5. Remote Proxy

Represents an object in a different address space (e.g., different server). The proxy
handles network communication, serialization, and error handling transparently.

### 6. Smart Reference Proxy

Performs additional actions when an object is accessed — reference counting, thread
safety checks, lazy loading of related data.

## Structure

```
┌──────────────────────────────────────────────────┐
│              ServiceInterface                     │
│  + operation(): Result                           │
└─────────────┬────────────────────┬───────────────┘
              │                    │
              ▼                    ▼
┌──────────────────────┐  ┌──────────────────────┐
│      RealService     │  │        Proxy         │
│  + operation(): Res  │  │  - service: Service  │
└──────────────────────┘  │  + operation(): Res  │
                          │    // pre-processing │
                          │    // delegate       │
                          │    // post-process   │
                          └──────────────────────┘
```

### Participants

1. **Service Interface** — declares the interface shared by proxy and real service,
   making them interchangeable.

2. **Real Service** — the actual object that does the work.

3. **Proxy** — holds a reference to the real service. Controls access by adding
   behavior before/after delegation. Usually manages the service's lifecycle.

4. **Client** — works with services and proxies via the same interface.

## Implementation in TypeScript

### Virtual Proxy (Lazy Loading)

```typescript
interface Database {
  query(sql: string): string[];
}

class HeavyDatabase implements Database {
  constructor() {
    // Simulate expensive initialization
    console.log("Database: Heavy initialization...");
  }

  query(sql: string): string[] {
    return [`Result for: ${sql}`];
  }
}

class LazyDatabaseProxy implements Database {
  private db: HeavyDatabase | null = null;

  private getDb(): HeavyDatabase {
    if (!this.db) {
      this.db = new HeavyDatabase();
    }
    return this.db;
  }

  query(sql: string): string[] {
    return this.getDb().query(sql);
  }
}
```

### Protection Proxy

```typescript
interface FileSystem {
  read(path: string): string;
  write(path: string, data: string): void;
}

class RealFileSystem implements FileSystem {
  read(path: string): string { return `contents of ${path}`; }
  write(path: string, data: string): void { /* writes */ }
}

class ProtectedFileSystem implements FileSystem {
  constructor(
    private fs: RealFileSystem,
    private role: "admin" | "viewer"
  ) {}

  read(path: string): string {
    return this.fs.read(path);
  }

  write(path: string, data: string): void {
    if (this.role !== "admin") {
      throw new Error("Access denied: write requires admin role");
    }
    this.fs.write(path, data);
  }
}
```

### Caching Proxy

```typescript
interface ApiService {
  fetch(endpoint: string): string;
}

class RealApiService implements ApiService {
  fetch(endpoint: string): string {
    return `Data from ${endpoint}`;
  }
}

class CachingApiProxy implements ApiService {
  private cache = new Map<string, { data: string; expiry: number }>();

  constructor(
    private service: RealApiService,
    private ttlMs: number = 60_000
  ) {}

  fetch(endpoint: string): string {
    const cached = this.cache.get(endpoint);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    const data = this.service.fetch(endpoint);
    this.cache.set(endpoint, { data, expiry: Date.now() + this.ttlMs });
    return data;
  }
}
```

## Proxy Pattern vs JavaScript Proxy API

TypeScript/JavaScript has a built-in `Proxy` object that can intercept fundamental
operations on objects (get, set, apply, etc.). While related in concept, they differ:

| Aspect               | Design Pattern Proxy             | JS Proxy API                      |
|----------------------|----------------------------------|-----------------------------------|
| **Level**            | Class-level, interface-based     | Object-level, meta-programming   |
| **Type safety**      | Full TypeScript support          | Harder to type correctly          |
| **Scope**            | Specific methods                 | Any property/operation            |
| **Intent**           | Controlled delegation            | Dynamic interception              |
| **Implementation**   | Class with same interface        | `new Proxy(target, handler)`      |
| **Use case**         | Business logic patterns          | Reactive systems, ORMs, testing   |

```typescript
// JS Proxy API example
const handler: ProxyHandler<Record<string, number>> = {
  get(target, prop: string) {
    console.log(`Accessing ${prop}`);
    return target[prop] ?? 0;
  },
  set(target, prop: string, value: number) {
    console.log(`Setting ${prop} = ${value}`);
    target[prop] = value;
    return true;
  },
};

const data = new Proxy<Record<string, number>>({}, handler);
data.x = 10;     // logs "Setting x = 10"
console.log(data.x); // logs "Accessing x", then 10
```

The design pattern proxy is preferred when you want type-safe, explicit, testable code.
The JS Proxy API is powerful for dynamic scenarios like reactive state management,
validation layers, and mock objects.

## When to Use

- **Lazy initialization** — defer expensive object creation until needed
- **Access control** — restrict operations based on credentials
- **Logging/monitoring** — track all requests to an object
- **Caching** — store results of expensive operations
- **Remote access** — represent remote objects locally
- **Smart references** — reference counting, thread safety

## When NOT to Use

- The real object is cheap to create and doesn't need access control
- Adding a proxy would add unnecessary complexity for simple objects
- Performance-critical paths where the proxy overhead matters

## Pros and Cons

### Pros

- **Control without modification** — add behavior without changing the real service
- **Lifecycle management** — proxy manages creation and destruction of service
- **Transparency** — client doesn't know it's using a proxy
- **Open/Closed Principle** — introduce new proxies without changing service or clients
- **Single Responsibility** — separate concerns (caching, logging, access) from business logic

### Cons

- **Added complexity** — more classes and indirection
- **Response delay** — extra layer of processing
- **Maintenance** — proxy must stay in sync with service interface changes

## Real-World Examples

### 1. Lazy Loading Images

Web browsers use proxy-like behavior for images — showing a placeholder while the
actual image loads. The `<img>` element acts as a proxy: it knows the dimensions and
can render a placeholder, then swaps in the real image when loaded.

### 2. Access Control Middleware

Express.js middleware like `authMiddleware` acts as a protection proxy — it intercepts
requests, checks authentication tokens, and either forwards to the real handler or
returns a 401/403 response.

### 3. Caching Proxy (Redis/CDN)

A CDN sits between clients and origin servers, caching responses. It implements the
same HTTP interface — clients don't know they're hitting a cache. Redis is often used
as a caching proxy in front of databases.

### 4. Logging Proxy (API Gateway)

API gateways (Kong, AWS API Gateway) act as logging proxies — they intercept all API
requests, log them, apply rate limiting, and forward to backend services.

### 5. ORM Lazy Loading

ORMs use virtual proxies for related entities. When you load a `User`, its `posts`
relation isn't loaded until you access it. The ORM creates a proxy that loads the
related data on first access.

### 6. JavaScript Proxy for Reactivity

Vue.js 3 uses the JavaScript `Proxy` API to make state reactive. When you access or
modify reactive state, the Proxy handler triggers dependency tracking and re-renders.

## Relations with Other Patterns

- **Adapter vs Proxy**: Adapter changes the interface; Proxy keeps the same interface.
- **Decorator vs Proxy**: Similar structure, different intent. Decorator adds
  responsibilities. Proxy controls access. Decorator composition is controlled by
  the client; Proxy manages lifecycle internally.
- **Facade vs Proxy**: Facade simplifies a complex subsystem with a new interface.
  Proxy has the same interface as the service and controls access to it.

## Key Takeaways

1. Proxy provides a substitute with the same interface as the real object
2. Different proxy types serve different purposes: lazy, protection, caching, logging
3. The client should be unaware it's using a proxy
4. TypeScript interfaces make the pattern clean and type-safe
5. Don't confuse the design pattern with JavaScript's built-in `Proxy` API — they're
   related concepts but different tools

## Further Reading

- [Refactoring.Guru - Proxy](https://refactoring.guru/design-patterns/proxy)
- *Design Patterns: Elements of Reusable Object-Oriented Software* — GoF
- *Head First Design Patterns* — Freeman & Robson
- [MDN - JavaScript Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
