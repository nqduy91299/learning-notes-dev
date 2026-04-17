// ============================================================================
// Singleton Pattern — Exercises
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output (Basic Singleton)
// ============================================================================
// What does the following code print? Write your answer before uncommenting.

class Counter {
  private static instance: Counter | null = null;
  private count = 0;

  private constructor() {}

  static getInstance(): Counter {
    if (this.instance === null) {
      this.instance = new Counter();
    }
    return this.instance;
  }

  increment(): void {
    this.count++;
  }

  getCount(): number {
    return this.count;
  }
}

// const a = Counter.getInstance();
// const b = Counter.getInstance();
// a.increment();
// a.increment();
// b.increment();
// console.log(a.getCount());
// console.log(b.getCount());
// console.log(a === b);

// Your answer:
//
//


// ============================================================================
// EXERCISE 2 — Predict the Output (Eager vs Lazy)
// ============================================================================
// What is the order of console.log outputs?

class EagerService {
  private static readonly instance: EagerService = new EagerService();
  private constructor() {
    console.log("EagerService constructed");
  }
  static getInstance(): EagerService {
    console.log("EagerService.getInstance called");
    return this.instance;
  }
}

class LazyService {
  private static instance: LazyService | null = null;
  private constructor() {
    console.log("LazyService constructed");
  }
  static getInstance(): LazyService {
    console.log("LazyService.getInstance called");
    if (this.instance === null) {
      this.instance = new LazyService();
    }
    return this.instance;
  }
}

// console.log("--- Start ---");
// const eager = EagerService.getInstance();
// console.log("--- Middle ---");
// const lazy = LazyService.getInstance();
// console.log("--- End ---");

// Your answer:
//
//


// ============================================================================
// EXERCISE 3 — Predict the Output (Inheritance Trap)
// ============================================================================
// Does this work as expected? What gets printed?

class BaseSingleton {
  private static instance: BaseSingleton | null = null;
  protected value: string;

  protected constructor(value: string) {
    this.value = value;
  }

  static getInstance(): BaseSingleton {
    if (this.instance === null) {
      this.instance = new BaseSingleton("base");
    }
    return this.instance;
  }

  getValue(): string {
    return this.value;
  }
}

// const s1 = BaseSingleton.getInstance();
// const s2 = BaseSingleton.getInstance();
// console.log(s1.getValue());
// console.log(s1 === s2);

// Your answer:
//
//


// ============================================================================
// EXERCISE 4 — Predict the Output (Reset Pattern)
// ============================================================================
// What does this print?

class ResettableSingleton {
  private static instance: ResettableSingleton | null = null;
  private data: string[] = [];

  private constructor() {}

  static getInstance(): ResettableSingleton {
    if (this.instance === null) {
      this.instance = new ResettableSingleton();
    }
    return this.instance;
  }

  static resetInstance(): void {
    this.instance = null;
  }

  add(item: string): void {
    this.data.push(item);
  }

  getAll(): readonly string[] {
    return this.data;
  }
}

// const r1 = ResettableSingleton.getInstance();
// r1.add("first");
// r1.add("second");
// console.log(r1.getAll());
//
// ResettableSingleton.resetInstance();
// const r2 = ResettableSingleton.getInstance();
// console.log(r2.getAll());
// console.log(r1 === r2);
// console.log(r1.getAll());

// Your answer:
//
//


// ============================================================================
// EXERCISE 5 — Fix the Bug (Broken Singleton)
// ============================================================================
// This singleton doesn't work — multiple instances can be created.
// Find and fix the bug. (Hint: look at the static field usage.)

class BrokenCache {
  private instance: BrokenCache | null = null;  // BUG: should be static
  private store = new Map<string, string>();

  private constructor() {}

  getInstance(): BrokenCache {  // BUG: should be static
    if (this.instance === null) {
      this.instance = new BrokenCache();
    }
    return this.instance;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  get(key: string): string | undefined {
    return this.store.get(key);
  }
}

// Fix the class above, then uncomment:
// const cache1 = BrokenCache.getInstance();
// const cache2 = BrokenCache.getInstance();
// cache1.set("name", "Alice");
// console.log(cache2.get("name")); // Should print: "Alice"
// console.log(cache1 === cache2);  // Should print: true


// ============================================================================
// EXERCISE 6 — Fix the Bug (Subclass Singleton)
// ============================================================================
// The child class always returns the parent's instance. Fix it.

class ParentSingleton {
  protected static instance: ParentSingleton | null = null;

  protected constructor(public readonly label: string) {}

  static getInstance(): ParentSingleton {
    if (this.instance === null) {
      this.instance = new ParentSingleton("parent");
    }
    return this.instance;
  }
}

class ChildSingleton extends ParentSingleton {
  // BUG: no override of getInstance, and no own `instance` field
  // The child shares ParentSingleton.instance, so if parent is created first,
  // ChildSingleton.getInstance() returns the parent instance.

  static override getInstance(): ChildSingleton {
    // Fix: ChildSingleton needs its own static instance field
    // and should create a ChildSingleton, not a ParentSingleton
    if (this.instance === null) {
      this.instance = new ChildSingleton("child");
    }
    return this.instance as ChildSingleton;
  }
}

// Uncomment to test after fixing:
// const parent = ParentSingleton.getInstance();
// const child = ChildSingleton.getInstance();
// console.log(parent.label); // Should print: "parent"
// console.log(child.label);  // Should print: "child"  (currently prints "parent")
// console.log(parent === child); // Should print: false


// ============================================================================
// EXERCISE 7 — Implement: Basic Singleton Logger
// ============================================================================
// Implement a singleton Logger class with:
// - private constructor
// - static getInstance(): Logger
// - log(message: string): void — pushes "[<timestamp>] <message>" to an internal array
// - getEntries(): readonly string[] — returns the log entries
// Use Date.now() for the timestamp.

// YOUR CODE HERE:
// class Logger {
//   ...
// }

// Uncomment to test:
// const log1 = Logger.getInstance();
// const log2 = Logger.getInstance();
// log1.log("Hello");
// log2.log("World");
// console.log(log1 === log2);          // true
// console.log(log1.getEntries().length); // 2


// ============================================================================
// EXERCISE 8 — Implement: Singleton with Configuration
// ============================================================================
// Implement a singleton AppConfig that:
// - Accepts an initial config object on first call: getInstance(initial?: ConfigData)
// - Ignores the argument on subsequent calls (already initialized)
// - Has get<K extends keyof ConfigData>(key: K): ConfigData[K]
// - Has getAll(): Readonly<ConfigData>

interface ConfigData {
  appName: string;
  version: string;
  debug: boolean;
}

// YOUR CODE HERE:
// class AppConfig {
//   ...
// }

// Uncomment to test:
// const cfg1 = AppConfig.getInstance({ appName: "MyApp", version: "1.0", debug: true });
// const cfg2 = AppConfig.getInstance(); // returns same instance, ignores no argument
// console.log(cfg1.get("appName"));     // "MyApp"
// console.log(cfg2.get("debug"));       // true
// console.log(cfg1 === cfg2);           // true


// ============================================================================
// EXERCISE 9 — Implement: Singleton Registry
// ============================================================================
// Implement a SingletonRegistry that can store and retrieve named singleton instances.
// - static register<T extends object>(name: string, factory: () => T): void
// - static resolve<T extends object>(name: string): T
// - resolve should call the factory only once per name (lazy), cache the result.
// - resolve should throw if the name was never registered.

// YOUR CODE HERE:
// class SingletonRegistry {
//   ...
// }

// Uncomment to test:
// SingletonRegistry.register("dbPool", () => ({ connections: 10 }));
// const pool1 = SingletonRegistry.resolve<{ connections: number }>("dbPool");
// const pool2 = SingletonRegistry.resolve<{ connections: number }>("dbPool");
// console.log(pool1 === pool2);        // true
// console.log(pool1.connections);      // 10


// ============================================================================
// EXERCISE 10 — Implement: Module-Level Singleton
// ============================================================================
// Create a singleton using the module pattern (no class). Export a frozen object
// that acts as an EventBus:
// - on(event: string, handler: (data: unknown) => void): void
// - emit(event: string, data: unknown): void
// - listenerCount(event: string): number
//
// Since this is a single file, simulate the module pattern with an IIFE.

// YOUR CODE HERE:
// interface EventBus {
//   on(event: string, handler: (data: unknown) => void): void;
//   emit(event: string, data: unknown): void;
//   listenerCount(event: string): number;
// }
//
// const eventBus: EventBus = (() => {
//   ...
// })();

// Uncomment to test:
// let received = "";
// eventBus.on("greet", (data) => { received = String(data); });
// eventBus.emit("greet", "hello");
// console.log(received);                    // "hello"
// console.log(eventBus.listenerCount("greet")); // 1


// ============================================================================
// EXERCISE 11 — Implement: Singleton vs Static Class
// ============================================================================
// Implement TWO versions of a MathUtils service:
//
// 1. MathUtilsSingleton — singleton class with instance methods
//    - factorial(n: number): number
//    - fibonacci(n: number): number
//
// 2. MathUtilsStatic — static class (abstract, no instantiation) with static methods
//    - static factorial(n: number): number
//    - static fibonacci(n: number): number
//
// Both should produce identical results for the same inputs.
// Think about: which is easier to mock in tests? Which is simpler?

// YOUR CODE HERE:
// class MathUtilsSingleton {
//   ...
// }
//
// abstract class MathUtilsStatic {
//   ...
// }

// Uncomment to test:
// const mu = MathUtilsSingleton.getInstance();
// console.log(mu.factorial(5));             // 120
// console.log(mu.fibonacci(7));             // 13
// console.log(MathUtilsStatic.factorial(5)); // 120
// console.log(MathUtilsStatic.fibonacci(7)); // 13


// ============================================================================
// EXERCISE 12 — Implement: Testable Singleton with DI
// ============================================================================
// The goal is to make a singleton-based service **testable**.
//
// 1. Define an interface IDatabase with:
//    - query(sql: string): string[]
//    - isConnected(): boolean
//
// 2. Implement DatabaseSingleton (implements IDatabase, singleton pattern)
//    - query returns [`Result for: ${sql}`]
//    - isConnected returns true
//
// 3. Implement UserRepository that takes IDatabase via constructor injection
//    - findAll(): string[] — calls db.query("SELECT * FROM users")
//    - isReady(): boolean  — calls db.isConnected()
//
// This demonstrates how DI decouples UserRepository from the concrete singleton,
// allowing you to pass a mock IDatabase in tests.

// YOUR CODE HERE:
// interface IDatabase { ... }
//
// class DatabaseSingleton implements IDatabase { ... }
//
// class UserRepository { ... }

// Uncomment to test:
// const db = DatabaseSingleton.getInstance();
// const repo = new UserRepository(db);
// console.log(repo.findAll());   // ["Result for: SELECT * FROM users"]
// console.log(repo.isReady());   // true
//
// // Mock test:
// const mockDb: IDatabase = {
//   query: (_sql: string) => ["mock-user"],
//   isConnected: () => false,
// };
// const testRepo = new UserRepository(mockDb);
// console.log(testRepo.findAll());  // ["mock-user"]
// console.log(testRepo.isReady());  // false
