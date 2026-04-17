// ============================================================================
// Singleton Pattern — Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ============================================================================
// SOLUTION 1 — Predict the Output (Basic Singleton)
// ============================================================================
// Answer:
//   3
//   3
//   true
//
// Explanation: `a` and `b` are the SAME object. a.increment() twice + b.increment()
// once = 3 total. Both getCount() calls return 3 because there is only one Counter.

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

function runExercise1(): void {
  console.log("=== Exercise 1 ===");
  const a = Counter.getInstance();
  const b = Counter.getInstance();
  a.increment();
  a.increment();
  b.increment();
  console.log(a.getCount()); // 3
  console.log(b.getCount()); // 3
  console.log(a === b);      // true
}

// ============================================================================
// SOLUTION 2 — Predict the Output (Eager vs Lazy)
// ============================================================================
// Answer:
//   EagerService constructed       ← class field initializer runs at class definition
//   --- Start ---
//   EagerService.getInstance called
//   --- Middle ---
//   LazyService.getInstance called
//   LazyService constructed         ← constructed inside getInstance
//   --- End ---
//
// Explanation: EagerService's static field initializer runs when the class declaration
// is evaluated (top-level). LazyService is only constructed when getInstance() is
// called for the first time.

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

function runExercise2(): void {
  console.log("\n=== Exercise 2 ===");
  console.log("--- Start ---");
  const _eager = EagerService.getInstance();
  console.log("--- Middle ---");
  const _lazy = LazyService.getInstance();
  console.log("--- End ---");
}

// ============================================================================
// SOLUTION 3 — Predict the Output (Inheritance Trap)
// ============================================================================
// Answer:
//   base
//   true
//
// Explanation: BaseSingleton.getInstance() creates a BaseSingleton with value "base".
// The second call returns the same instance. This is straightforward — the "trap"
// becomes apparent when you try to use subclasses (see Exercise 6).

class BaseSingleton {
  protected static instance: BaseSingleton | null = null;
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

function runExercise3(): void {
  console.log("\n=== Exercise 3 ===");
  const s1 = BaseSingleton.getInstance();
  const s2 = BaseSingleton.getInstance();
  console.log(s1.getValue()); // "base"
  console.log(s1 === s2);     // true
}

// ============================================================================
// SOLUTION 4 — Predict the Output (Reset Pattern)
// ============================================================================
// Answer:
//   [ "first", "second" ]
//   []
//   false
//   [ "first", "second" ]
//
// Explanation: After resetInstance(), getInstance() creates a NEW instance (r2).
// r2 has an empty data array. r1 still references the OLD instance with its data
// intact. r1 !== r2 because they are different objects.

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

function runExercise4(): void {
  console.log("\n=== Exercise 4 ===");
  const r1 = ResettableSingleton.getInstance();
  r1.add("first");
  r1.add("second");
  console.log(r1.getAll()); // ["first", "second"]

  ResettableSingleton.resetInstance();
  const r2 = ResettableSingleton.getInstance();
  console.log(r2.getAll());   // []
  console.log(r1 === r2);     // false
  console.log(r1.getAll());   // ["first", "second"] — old instance still alive
}

// ============================================================================
// SOLUTION 5 — Fix the Bug (Broken Singleton)
// ============================================================================
// Bug: `instance` was not static, and `getInstance` was not static.
// Without `static`, every object would have its own `instance` field and you
// couldn't call `BrokenCache.getInstance()` — it's an instance method.

class FixedCache {
  private static instance: FixedCache | null = null; // FIX: added static
  private store = new Map<string, string>();

  private constructor() {}

  static getInstance(): FixedCache { // FIX: added static
    if (this.instance === null) {
      this.instance = new FixedCache();
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

function runExercise5(): void {
  console.log("\n=== Exercise 5 ===");
  const cache1 = FixedCache.getInstance();
  const cache2 = FixedCache.getInstance();
  cache1.set("name", "Alice");
  console.log(cache2.get("name")); // "Alice"
  console.log(cache1 === cache2);  // true
}

// ============================================================================
// SOLUTION 6 — Fix the Bug (Subclass Singleton)
// ============================================================================
// Bug: ChildSingleton shared ParentSingleton's static `instance` field.
// If ParentSingleton.getInstance() was called first, the parent instance was
// cached in `instance`, and ChildSingleton.getInstance() would return it.
//
// Fix: Each subclass needs its own static instance field. In TypeScript, when
// a subclass declares its own static field with the same name, it shadows the
// parent's field. The `this` in a static method refers to the class on which
// the method was called, so `this.instance` correctly refers to each class's
// own field.

class ParentSingleton2 {
  protected static instance: ParentSingleton2 | null = null;

  protected constructor(public readonly label: string) {}

  static getInstance(): ParentSingleton2 {
    if (this.instance === null) {
      this.instance = new ParentSingleton2("parent");
    }
    return this.instance;
  }
}

class ChildSingleton2 extends ParentSingleton2 {
  // FIX: Declare own static instance to shadow the parent's
  protected static override instance: ChildSingleton2 | null = null;

  static override getInstance(): ChildSingleton2 {
    if (this.instance === null) {
      this.instance = new ChildSingleton2("child");
    }
    return this.instance as ChildSingleton2;
  }
}

function runExercise6(): void {
  console.log("\n=== Exercise 6 ===");
  const parent = ParentSingleton2.getInstance();
  const child = ChildSingleton2.getInstance();
  console.log(parent.label);      // "parent"
  console.log(child.label);       // "child"
  console.log(parent === child);  // false
}

// ============================================================================
// SOLUTION 7 — Implement: Basic Singleton Logger
// ============================================================================
// A straightforward singleton with a private array for log entries.

class Logger {
  private static instance: Logger | null = null;
  private entries: string[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (this.instance === null) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  log(message: string): void {
    this.entries.push(`[${Date.now()}] ${message}`);
  }

  getEntries(): readonly string[] {
    return this.entries;
  }
}

function runExercise7(): void {
  console.log("\n=== Exercise 7 ===");
  const log1 = Logger.getInstance();
  const log2 = Logger.getInstance();
  log1.log("Hello");
  log2.log("World");
  console.log(log1 === log2);           // true
  console.log(log1.getEntries().length); // 2
  console.log(log1.getEntries());
}

// ============================================================================
// SOLUTION 8 — Implement: Singleton with Configuration
// ============================================================================
// The getInstance method optionally accepts initial config on first call.
// Subsequent calls ignore the argument.

interface ConfigData {
  appName: string;
  version: string;
  debug: boolean;
}

class AppConfig {
  private static instance: AppConfig | null = null;
  private readonly data: ConfigData;

  private constructor(initial: ConfigData) {
    this.data = { ...initial };
  }

  static getInstance(initial?: ConfigData): AppConfig {
    if (this.instance === null) {
      if (initial === undefined) {
        throw new Error(
          "AppConfig must be initialized with config data on first call"
        );
      }
      this.instance = new AppConfig(initial);
    }
    return this.instance;
  }

  get<K extends keyof ConfigData>(key: K): ConfigData[K] {
    return this.data[key];
  }

  getAll(): Readonly<ConfigData> {
    return { ...this.data };
  }
}

function runExercise8(): void {
  console.log("\n=== Exercise 8 ===");
  const cfg1 = AppConfig.getInstance({
    appName: "MyApp",
    version: "1.0",
    debug: true,
  });
  const cfg2 = AppConfig.getInstance(); // same instance
  console.log(cfg1.get("appName")); // "MyApp"
  console.log(cfg2.get("debug"));   // true
  console.log(cfg1 === cfg2);       // true
  console.log(cfg1.getAll());
}

// ============================================================================
// SOLUTION 9 — Implement: Singleton Registry
// ============================================================================
// A registry that maps string names to factory functions. Each factory is called
// at most once; the result is cached.

class SingletonRegistry {
  private static factories = new Map<string, () => object>();
  private static instances = new Map<string, object>();

  // Prevent instantiation
  private constructor() {}

  static register<T extends object>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  static resolve<T extends object>(name: string): T {
    // Return cached instance if available
    const existing = this.instances.get(name);
    if (existing !== undefined) {
      return existing as T;
    }

    // Look up factory
    const factory = this.factories.get(name);
    if (factory === undefined) {
      throw new Error(`No factory registered for "${name}"`);
    }

    // Create, cache, and return
    const instance = factory() as T;
    this.instances.set(name, instance);
    return instance;
  }
}

function runExercise9(): void {
  console.log("\n=== Exercise 9 ===");
  SingletonRegistry.register("dbPool", () => ({ connections: 10 }));
  const pool1 = SingletonRegistry.resolve<{ connections: number }>("dbPool");
  const pool2 = SingletonRegistry.resolve<{ connections: number }>("dbPool");
  console.log(pool1 === pool2);   // true
  console.log(pool1.connections); // 10

  // Demonstrate error on unregistered name
  try {
    SingletonRegistry.resolve("unknown");
  } catch (e) {
    console.log((e as Error).message); // 'No factory registered for "unknown"'
  }
}

// ============================================================================
// SOLUTION 10 — Implement: Module-Level Singleton (IIFE EventBus)
// ============================================================================
// Using an IIFE to close over the handlers map. The returned object is frozen
// to prevent mutation of the singleton interface (though internal state can
// still change via closures).

interface EventBus {
  on(event: string, handler: (data: unknown) => void): void;
  emit(event: string, data: unknown): void;
  listenerCount(event: string): number;
}

const eventBus: EventBus = (() => {
  const handlers = new Map<string, Array<(data: unknown) => void>>();

  return Object.freeze({
    on(event: string, handler: (data: unknown) => void): void {
      const list = handlers.get(event);
      if (list) {
        list.push(handler);
      } else {
        handlers.set(event, [handler]);
      }
    },

    emit(event: string, data: unknown): void {
      const list = handlers.get(event);
      if (list) {
        for (const handler of list) {
          handler(data);
        }
      }
    },

    listenerCount(event: string): number {
      return handlers.get(event)?.length ?? 0;
    },
  });
})();

function runExercise10(): void {
  console.log("\n=== Exercise 10 ===");
  let received = "";
  eventBus.on("greet", (data) => {
    received = String(data);
  });
  eventBus.emit("greet", "hello");
  console.log(received);                        // "hello"
  console.log(eventBus.listenerCount("greet")); // 1

  // Demonstrate it's the same object (frozen, cannot add properties)
  console.log(Object.isFrozen(eventBus));       // true
}

// ============================================================================
// SOLUTION 11 — Implement: Singleton vs Static Class
// ============================================================================
// Two approaches compared. The singleton version can implement an interface
// and be injected/mocked. The static version is simpler but harder to mock.

class MathUtilsSingleton {
  private static instance: MathUtilsSingleton | null = null;

  private constructor() {}

  static getInstance(): MathUtilsSingleton {
    if (this.instance === null) {
      this.instance = new MathUtilsSingleton();
    }
    return this.instance;
  }

  factorial(n: number): number {
    if (n < 0) throw new Error("Negative input");
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  fibonacci(n: number): number {
    if (n < 0) throw new Error("Negative input");
    if (n <= 1) return n;
    let a = 0;
    let b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }
}

abstract class MathUtilsStatic {
  // `abstract` class + private constructor = cannot instantiate
  private constructor() {}

  static factorial(n: number): number {
    if (n < 0) throw new Error("Negative input");
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static fibonacci(n: number): number {
    if (n < 0) throw new Error("Negative input");
    if (n <= 1) return n;
    let a = 0;
    let b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }
}

function runExercise11(): void {
  console.log("\n=== Exercise 11 ===");
  const mu = MathUtilsSingleton.getInstance();
  console.log(mu.factorial(5));              // 120
  console.log(mu.fibonacci(7));              // 13
  console.log(MathUtilsStatic.factorial(5)); // 120
  console.log(MathUtilsStatic.fibonacci(7)); // 13
}

// ============================================================================
// SOLUTION 12 — Implement: Testable Singleton with DI
// ============================================================================
// The key insight: UserRepository depends on the IDatabase *interface*, not the
// concrete DatabaseSingleton class. This allows injecting mocks for testing.

interface IDatabase {
  query(sql: string): string[];
  isConnected(): boolean;
}

class DatabaseSingleton implements IDatabase {
  private static instance: DatabaseSingleton | null = null;

  private constructor() {}

  static getInstance(): DatabaseSingleton {
    if (this.instance === null) {
      this.instance = new DatabaseSingleton();
    }
    return this.instance;
  }

  query(sql: string): string[] {
    return [`Result for: ${sql}`];
  }

  isConnected(): boolean {
    return true;
  }
}

class UserRepository {
  constructor(private readonly db: IDatabase) {}

  findAll(): string[] {
    return this.db.query("SELECT * FROM users");
  }

  isReady(): boolean {
    return this.db.isConnected();
  }
}

function runExercise12(): void {
  console.log("\n=== Exercise 12 ===");

  // Production usage — inject the singleton
  const db = DatabaseSingleton.getInstance();
  const repo = new UserRepository(db);
  console.log(repo.findAll());  // ["Result for: SELECT * FROM users"]
  console.log(repo.isReady());  // true

  // Test usage — inject a mock
  const mockDb: IDatabase = {
    query: (_sql: string) => ["mock-user"],
    isConnected: () => false,
  };
  const testRepo = new UserRepository(mockDb);
  console.log(testRepo.findAll());  // ["mock-user"]
  console.log(testRepo.isReady());  // false
}

// ============================================================================
// Runner
// ============================================================================

function main(): void {
  console.log("Singleton Pattern — Solutions\n");

  runExercise1();
  runExercise2();
  runExercise3();
  runExercise4();
  runExercise5();
  runExercise6();
  runExercise7();
  runExercise8();
  runExercise9();
  runExercise10();
  runExercise11();
  runExercise12();

  console.log("\n✓ All exercises completed.");
}

main();
