# Singleton Pattern

> **References**: [Refactoring Guru – Singleton](https://refactoring.guru/design-patterns/singleton) | *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), pp. 127-136

## Table of Contents

- [Intent](#intent)
- [Problem It Solves](#problem-it-solves)
- [Structure](#structure)
- [Implementation in TypeScript](#implementation-in-typescript)
  - [Classic Singleton](#classic-singleton)
  - [Lazy vs Eager Initialization](#lazy-vs-eager-initialization)
  - [Module-Level Singleton](#module-level-singleton)
  - [Singleton with Closures](#singleton-with-closures)
- [Thread Safety](#thread-safety)
- [Pros and Cons](#pros-and-cons)
- [When to Use](#when-to-use)
- [When to Avoid](#when-to-avoid)
- [Relationship with Other Patterns](#relationship-with-other-patterns)
- [Testing Difficulties](#testing-difficulties)

---

## Intent

**Singleton** is a creational design pattern that ensures a class has only **one instance**
and provides a **global point of access** to it.

The two key responsibilities are:

1. **Guarantee a single instance** — prevent other code from creating additional instances.
2. **Provide global access** — offer a well-known access point so any part of the system
   can reach that instance without passing it around explicitly.

---

## Problem It Solves

Some resources should exist exactly once in a running application:

- **Database connection pools** — opening multiple pools wastes connections and memory.
- **Configuration managers** — a single source of truth avoids conflicting settings.
- **Logging services** — one logger ensures consistent output and file handles.
- **Caches / registries** — duplicated caches defeat their purpose.

Without the Singleton pattern you rely on conventions ("just don't create a second one"),
which are fragile and hard to enforce across a large codebase.

A global variable partially solves the access problem but does **not** prevent anyone from
overwriting or re-instantiating the object. Singleton encapsulates both guarantees in the
class itself.

---

## Structure

```
┌──────────────────────────────────┐
│           Singleton              │
├──────────────────────────────────┤
│ - static instance: Singleton     │
│ - data: ...                      │
├──────────────────────────────────┤
│ - constructor()                  │  ← private: prevents external `new`
│ + static getInstance(): Singleton│  ← creates or returns the sole instance
│ + businessMethod(): void         │
└──────────────────────────────────┘
```

**Participants**:

| Role       | Description                                              |
|------------|----------------------------------------------------------|
| Singleton  | Declares a static `getInstance()` method and a private constructor. Stores the unique instance in a private static field. |
| Client     | Accesses the singleton exclusively through `getInstance()`. |

**Collaborations**:

1. Client calls `Singleton.getInstance()`.
2. On first call, the class creates and stores the instance.
3. On subsequent calls, it returns the existing instance.

---

## Implementation in TypeScript

### Classic Singleton

The textbook approach: private constructor + static `getInstance()`.

```typescript
class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;

  // Private constructor prevents `new DatabaseConnection()` from outside
  private constructor(
    private readonly host: string,
    private readonly port: number
  ) {}

  static getInstance(): DatabaseConnection {
    if (this.instance === null) {
      this.instance = new DatabaseConnection("localhost", 5432);
    }
    return this.instance;
  }

  query(sql: string): string {
    return `[${this.host}:${this.port}] Executing: ${sql}`;
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true
```

Key points:

- The constructor is `private`, so `new DatabaseConnection(...)` is a compile-time error
  outside the class.
- `getInstance()` is the sole factory; it lazily creates the instance on first call.
- Every subsequent call returns the **same** reference.

---

### Lazy vs Eager Initialization

**Lazy initialization** (shown above): the instance is created only when `getInstance()`
is first called. This is the default approach and defers resource allocation until needed.

```typescript
class LazySingleton {
  private static instance: LazySingleton | null = null;

  private constructor() {
    console.log("LazySingleton created");
  }

  static getInstance(): LazySingleton {
    if (this.instance === null) {
      this.instance = new LazySingleton();
    }
    return this.instance;
  }
}
// Instance is NOT created until getInstance() is called.
```

**Eager initialization**: the instance is created when the class is loaded (i.e., when
the module is first imported). Simpler, but the cost is paid upfront.

```typescript
class EagerSingleton {
  // Created immediately when this module is imported
  private static readonly instance: EagerSingleton = new EagerSingleton();

  private constructor() {
    console.log("EagerSingleton created");
  }

  static getInstance(): EagerSingleton {
    return this.instance;
  }
}
```

In JavaScript/TypeScript the distinction matters less than in Java (no class-loader
surprises), but lazy is still preferred when initialization is expensive.

---

### Module-Level Singleton

ES modules are evaluated **once** and cached. Every subsequent `import` receives the
same module namespace object. This means a plain exported object is already a singleton:

```typescript
// config.ts
interface AppConfig {
  apiUrl: string;
  debug: boolean;
}

const config: AppConfig = {
  apiUrl: "https://api.example.com",
  debug: false,
};

export default config;
```

```typescript
// a.ts
import config from "./config.js";
config.debug = true;

// b.ts
import config from "./config.js";
console.log(config.debug); // true — same object
```

This is the **idiomatic** singleton in TypeScript/JavaScript projects. It requires no
class ceremony at all. Use the class-based approach only when you need:

- Lazy initialization with control over *when* the instance is created.
- Polymorphism (subclass the singleton).
- A `resetInstance()` for testing.

---

### Singleton with Closures

A closure-based approach hides the instance without relying on `private` access modifiers:

```typescript
interface Logger {
  log(message: string): void;
  getHistory(): readonly string[];
}

const createLogger = (() => {
  let instance: Logger | null = null;

  return (): Logger => {
    if (instance !== null) {
      return instance;
    }

    const history: string[] = [];

    instance = {
      log(message: string): void {
        const entry = `[${new Date().toISOString()}] ${message}`;
        history.push(entry);
        console.log(entry);
      },
      getHistory(): readonly string[] {
        return history;
      },
    };

    return instance;
  };
})();

const logger1 = createLogger();
const logger2 = createLogger();
console.log(logger1 === logger2); // true
```

The IIFE closes over `instance`; no external code can access or replace it.

---

## Thread Safety

Traditional multi-threaded languages (Java, C++) must guard against two threads
simultaneously entering the `if (instance === null)` check and creating two instances.
Solutions include synchronized blocks, double-checked locking, or eager initialization.

**JavaScript is single-threaded** (event-loop model), so this race condition cannot occur
in normal code. However, be aware of edge cases:

- **Web Workers / Worker Threads (Node.js)**: each worker runs its own JS context with
  its own module cache. A singleton in one worker is *not* shared with another.
- **Multiple realms** (iframes, `vm.createContext`): each realm has its own set of
  global objects and module caches.

Within a single JS execution context, you never need locks or synchronization for
singleton creation.

---

## Pros and Cons

### Pros

| Advantage                        | Details                                                   |
|----------------------------------|-----------------------------------------------------------|
| Controlled access to sole instance | The class encapsulates the instance, so it controls how and when clients access it. |
| Reduced namespace pollution       | Better than global variables — encapsulated within a class or module. |
| Lazy allocation                   | Instance creation can be deferred until first use.        |
| Permits subclassing               | The `getInstance()` method can return a subclass instance (see Registry of Singletons). |
| Easily replaced by module pattern | In JS/TS you can start with a module-level singleton and upgrade to a class later. |

### Cons

| Disadvantage                     | Details                                                   |
|----------------------------------|-----------------------------------------------------------|
| Hidden dependencies              | Classes that call `Singleton.getInstance()` have an implicit dependency, invisible in their constructor signatures. |
| Violates Single Responsibility   | The class manages its own lifecycle *and* its business logic. |
| Difficult to test                | Global state carries over between tests (see [Testing Difficulties](#testing-difficulties)). |
| Tight coupling                   | Clients are coupled to the concrete singleton class, not an abstraction. |
| Concurrency in multi-context     | Not truly global across workers or iframes.               |

---

## When to Use

- A shared resource must exist exactly once (DB pool, config, logging).
- You need stricter control than a module export (lazy init, reset, subclassing).
- Migrating legacy code that already relies on global state — wrapping it in a
  singleton is an incremental improvement.

## When to Avoid

- When you can use **dependency injection** instead. DI makes dependencies explicit,
  testable, and swappable.
- When the "single instance" requirement is artificial. If two instances would work
  fine, singleton adds unnecessary complexity.
- In library code consumed by others — forcing a singleton on consumers limits their
  flexibility.
- When you find yourself adding `resetInstance()` just for tests — that is a code
  smell suggesting DI would be better.

---

## Relationship with Other Patterns

| Pattern             | Relationship                                                                           |
|---------------------|----------------------------------------------------------------------------------------|
| **Abstract Factory** | Often implemented as a singleton — the factory is a shared service.                   |
| **Builder**          | A builder can be a singleton if it is stateless and reusable.                         |
| **Prototype**        | Opposite philosophy — prototype creates many copies; singleton ensures exactly one.   |
| **Facade**           | A facade is frequently a singleton, providing a single simplified interface.          |
| **State**            | State objects are often singletons (flyweight-like) since they carry no per-context data. |
| **Monostate (Borg)** | Alternative: all instances share state via static fields, but multiple instances can exist. |

---

## Testing Difficulties

Singletons introduce **global mutable state**, the enemy of isolated, repeatable tests.

### Problem 1: State Leaks Between Tests

```typescript
// Test A sets debug mode
AppConfig.getInstance().debug = true;

// Test B assumes default state — FAILS
expect(AppConfig.getInstance().debug).toBe(false); // still true!
```

### Problem 2: Cannot Substitute a Mock

Because client code calls `Singleton.getInstance()` directly, you cannot easily inject
a mock or stub.

### Mitigations

1. **`resetInstance()` method** — add a static method that nulls the instance. Call it
   in `beforeEach`. Downside: it exists only for tests and pollutes the production API.

   ```typescript
   class Config {
     private static instance: Config | null = null;

     static getInstance(): Config {
       if (!this.instance) this.instance = new Config();
       return this.instance;
     }

     /** @internal — for testing only */
     static resetInstance(): void {
       this.instance = null;
     }
   }
   ```

2. **Dependency Injection** — pass the singleton as a constructor parameter. The class
   no longer knows it is dealing with a singleton, and tests can pass a fake.

   ```typescript
   interface ILogger {
     log(msg: string): void;
   }

   class UserService {
     constructor(private readonly logger: ILogger) {}

     createUser(name: string): void {
       this.logger.log(`Creating user: ${name}`);
     }
   }

   // Production: new UserService(Logger.getInstance())
   // Test:       new UserService(mockLogger)
   ```

3. **Module mocking** (Jest `jest.mock`, Vitest `vi.mock`) — replace the module export.
   Works for module-level singletons but couples tests to the module system.

**Best practice**: Prefer dependency injection. Use singletons at the **composition
root** (entry point) and pass them down as dependencies. This gives you the "single
instance" guarantee *without* the testing headaches.

---

## Summary

The Singleton pattern is one of the simplest GoF patterns to understand but one of
the most controversial to apply. In TypeScript / JavaScript:

- **Module-level exports** are the idiomatic singleton — prefer them by default.
- **Class-based singletons** add value when you need lazy init, polymorphism, or
  lifecycle control.
- **Always consider DI** as an alternative that preserves testability.
- Be mindful of multiple execution contexts (workers, iframes) where "singleton"
  does not mean "globally unique".

Use singletons sparingly, and when you do, keep them at the edges of your architecture
rather than deep inside business logic.
