// ============================================================================
// 08-modules: Solutions (18 exercises)
// ============================================================================
// Run with: npx tsx 01-javascript/04-advanced/08-modules/solutions.ts
// ============================================================================

// ---------------------------------------------------------------------------
// A. PREDICT THE OUTPUT — Answers
// ---------------------------------------------------------------------------

// Exercise 1: Module execution order
// Answer: "logger loaded", "utils loaded", "main loaded", "Hello Alice"
// Explanation: Modules evaluate depth-first. logger.js (deepest dep) runs first,
// then utils.js, then main.js body, then greet() is called.

// Exercise 2: Singleton behavior
// Answer: "counter init" (once), then 3
// Explanation: counter.js loads once and is shared. a.js increments 3 times,
// b.js's showCount() reads the same count → 3.

// Exercise 3: Live bindings
// Answer: "A: 1", "B: 42". (value = 100 would throw TypeError — read-only)
// Explanation: Exports are live references. setValue(42) modifies the binding,
// and the import sees the update. Direct assignment is not allowed.

// Exercise 4: Default export identity
// Answer: "modified by a"
// Explanation: Both a.js and b.js import the SAME object reference (singleton).
// a.js mutates obj.name, b.js sees the change.

// Exercise 5: export * and default
// Answer: Error — `add` is undefined. `export *` does NOT re-export defaults.
// PI works fine (3.14). Fix: `export { default as add } from "./math.js"`.

// Exercise 6: Top-level await and execution order
// Answer: "slow: start", (100ms pause), "slow: end", "main: before import",
//         "main: after import", "data: done"
// Explanation: Static imports are hoisted. slow.js must fully evaluate (including
// its top-level await) before main.js body runs. The "before import" line appears
// after slow.js finishes because all imports resolve before any module code runs.

// Exercise 7: Circular dependency
// Answer: "b.js sees aValue: undefined", "a.js sees bValue: B"
// Explanation: a.js triggers b.js evaluation. b.js reads aValue but a.js hasn't
// finished evaluating — binding exists but is uninitialized → undefined.
// b.js finishes, then a.js resumes and reads bValue ("B").


// ---------------------------------------------------------------------------
// B. FIX THE BUG — Solutions
// ---------------------------------------------------------------------------

// Exercise 8: Fix the broken module pattern
// Bug: increment and decrement declare LOCAL `count` variables with `let`,
// shadowing the outer `count`. They should modify the outer `count` instead.
function exercise8_createCounter(): {
  increment: () => void;
  decrement: () => void;
  getCount: () => number;
} {
  let count = 0;
  return {
    increment() {
      count += 1; // FIX: modify outer `count`, not a local shadow
    },
    decrement() {
      count -= 1; // FIX: modify outer `count`, not a local shadow
    },
    getCount() {
      return count;
    },
  };
}

// Exercise 9: Fix the barrel re-export simulation
// Bug: The barrel doesn't include the default export. `export *` skips defaults.
// Fix: Explicitly re-export the default.
function exercise9_modules(): {
  stringUtils: { capitalize: (s: string) => string; trim: (s: string) => string };
  barrel: {
    capitalize: (s: string) => string;
    trim: (s: string) => string;
    defaultExport: (s: string) => string;
  };
} {
  const stringUtils = {
    capitalize: (s: string): string => s.charAt(0).toUpperCase() + s.slice(1),
    trim: (s: string): string => s.trim(),
    default: (s: string): string => s.toLowerCase(),
  };

  // FIX: Explicitly include the default export in the barrel
  const barrel = {
    capitalize: stringUtils.capitalize,
    trim: stringUtils.trim,
    defaultExport: stringUtils.default, // FIX: map default to a named export
  };

  return { stringUtils, barrel };
}

// Exercise 10: Fix the singleton violation
// Bug: getConfig creates a new object on every call.
// Fix: Cache the config on first call, return the cached version after.
function exercise10_makeGetConfig(): () => { debug: boolean; apiUrl: string } {
  // FIX: Create the config once in the closure (simulating module-level execution)
  let cached: { debug: boolean; apiUrl: string } | null = null;

  function getConfig(): { debug: boolean; apiUrl: string } {
    if (cached === null) {
      cached = {
        debug: true,
        apiUrl: "https://api.example.com",
      };
    }
    return cached;
  }
  return getConfig;
}


// ---------------------------------------------------------------------------
// C. IMPLEMENT — Solutions
// ---------------------------------------------------------------------------

// Exercise 11: Temperature module simulator
// Simulates a module with named exports, a default export, and private state.
function exercise11_temperatureModule(): {
  celsiusToFahrenheit: (c: number) => number;
  fahrenheitToCelsius: (f: number) => number;
  getConversionCount: () => number;
  default: (value: number, unit: "C" | "F") => string;
} {
  // Private state (not exported — like a module-scoped variable)
  let conversionCount = 0;

  // Named exports
  function celsiusToFahrenheit(c: number): number {
    conversionCount++;
    return c * 9 / 5 + 32;
  }

  function fahrenheitToCelsius(f: number): number {
    conversionCount++;
    return (f - 32) * 5 / 9;
  }

  function getConversionCount(): number {
    return conversionCount;
  }

  // Default export
  function formatTemp(value: number, unit: "C" | "F"): string {
    return `${value}°${unit}`;
  }

  return {
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    getConversionCount,
    default: formatTemp,
  };
}

// Exercise 12: Math namespace (simulating import * as math)
// A frozen object mimicking a Module Namespace Exotic Object.
function exercise12_mathNamespace(): Readonly<{
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
  PI: number;
  E: number;
}> {
  return Object.freeze({
    add: (a: number, b: number): number => a + b,
    subtract: (a: number, b: number): number => a - b,
    multiply: (a: number, b: number): number => a * b,
    divide: (a: number, b: number): number => a / b,
    PI: Math.PI,
    E: Math.E,
  });
}

// Exercise 13: Live bindings simulation
// Uses Object.defineProperty with a getter (live) and a setter that throws.
function exercise13_liveBindings(): {
  readonly value: number;
  setValue: (v: number) => void;
} {
  let internal = 0;

  const module = {} as { readonly value: number; setValue: (v: number) => void };

  Object.defineProperty(module, "value", {
    get() {
      return internal;
    },
    set() {
      throw new TypeError("Assignment to constant variable.");
    },
    enumerable: true,
    configurable: false,
  });

  module.setValue = (v: number): void => {
    internal = v;
  };

  return module;
}

// Exercise 14: Mini module system (AMD-style)
// Modules are lazily evaluated on first require and cached (singleton).
function exercise14_moduleRegistry(): MiniModuleSystem {
  const definitions = new Map<string, {
    deps: string[];
    factory: (...args: Record<string, unknown>[]) => Record<string, unknown>;
  }>();
  const cache = new Map<string, Record<string, unknown>>();

  function define(
    name: string, deps: string[],
    factory: (...args: Record<string, unknown>[]) => Record<string, unknown>
  ): void {
    definitions.set(name, { deps, factory });
  }

  function require(name: string): Record<string, unknown> {
    if (cache.has(name)) return cache.get(name)!;
    const definition = definitions.get(name);
    if (!definition) throw new Error(`Module "${name}" is not defined`);
    const resolvedDeps = definition.deps.map((dep) => require(dep));
    const exports = definition.factory(...resolvedDeps);
    cache.set(name, exports);
    return exports;
  }

  return { define, require };
}

interface MiniModuleSystem {
  define: (
    name: string,
    deps: string[],
    factory: (...args: Record<string, unknown>[]) => Record<string, unknown>
  ) => void;
  require: (name: string) => Record<string, unknown>;
}

// Exercise 15: Barrel file simulation
// Aggregates named exports, maps default → mathDefault, excludes _private.
type SubModule = Record<string, unknown>;

function exercise15_barrel(): SubModule {
  const mathModule: SubModule = {
    add: (a: number, b: number) => a + b,
    subtract: (a: number, b: number) => a - b,
    default: (a: number, b: number) => a * b,
    _internal: () => "secret",
  };

  const stringModule: SubModule = {
    capitalize: (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)),
    reverse: (s: string) => s.split("").reverse().join(""),
    _helper: () => "private",
  };

  const arrayModule: SubModule = {
    flatten: (arr: unknown[][]) => arr.reduce<unknown[]>((a, b) => [...a, ...b], []),
    unique: (arr: unknown[]) => [...new Set(arr)],
  };

  const barrel: SubModule = {};

  function reExportNamed(source: SubModule): void {
    for (const key of Object.keys(source)) {
      if (key !== "default" && !key.startsWith("_")) barrel[key] = source[key];
    }
  }

  reExportNamed(mathModule);
  reExportNamed(stringModule);
  reExportNamed(arrayModule);
  barrel["mathDefault"] = mathModule["default"];
  return barrel;
}

// Exercise 16: Lazy import with caching
// First call invokes the loader and caches the Promise.
// Subsequent calls return the same cached Promise.
function exercise16_lazyImport<T>(loader: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | null = null;

  return (): Promise<T> => {
    if (cached === null) {
      cached = loader();
    }
    return cached;
  };
}

// Exercise 17: DI container — singleton factory pattern
interface DIContainer {
  register: (name: string, factory: () => unknown) => void;
  resolve: (name: string) => unknown;
  reset: () => void;
}

function exercise17_diContainer(): DIContainer {
  const factories = new Map<string, () => unknown>();
  let instances = new Map<string, unknown>();

  return {
    register(name, factory) { factories.set(name, factory); },
    resolve(name) {
      if (instances.has(name)) return instances.get(name);
      const factory = factories.get(name);
      if (!factory) throw new Error(`Service "${name}" is not registered`);
      const instance = factory();
      instances.set(name, instance);
      return instance;
    },
    reset() { instances = new Map<string, unknown>(); },
  };
}

// Exercise 18: Plugin registry — ordered, unique by name
interface Plugin {
  name: string;
  init: () => string;
}
interface PluginRegistry {
  register: (plugin: Plugin) => void;
  initialize: () => string[];
  get: (name: string) => Plugin | undefined;
  list: () => string[];
}

function exercise18_pluginRegistry(): PluginRegistry {
  const plugins = new Map<string, Plugin>();
  const order: string[] = [];

  return {
    register(plugin) {
      if (plugins.has(plugin.name)) throw new Error(`Plugin "${plugin.name}" already registered`);
      plugins.set(plugin.name, plugin);
      order.push(plugin.name);
    },
    initialize: () => order.map((name) => plugins.get(name)!.init()),
    get: (name) => plugins.get(name),
    list: () => [...order],
  };
}


// ---------------------------------------------------------------------------
// RUNNER — Tests with assertions
// ---------------------------------------------------------------------------

function main(): void {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string): void {
    if (condition) {
      passed++;
      console.log(`  ✓ ${label}`);
    } else {
      failed++;
      console.log(`  ✗ ${label}`);
    }
  }

  console.log("\n--- Exercise 1-7: Predict the Output (see comments above) ---");
  console.log("  (Answers are in the comments at the top of this file)");

  // Exercise 8: Fix the broken counter
  console.log("\n--- Exercise 8: Fix the broken counter ---");
  {
    const counter = exercise8_createCounter();
    counter.increment();
    counter.increment();
    counter.increment();
    counter.decrement();
    assert(counter.getCount() === 2, "8: after 3 increments and 1 decrement → 2");
    counter.decrement();
    counter.decrement();
    assert(counter.getCount() === 0, "8: after 2 more decrements → 0");
  }

  // Exercise 9: Fix the barrel re-export
  console.log("\n--- Exercise 9: Fix the barrel ---");
  {
    const { stringUtils, barrel } = exercise9_modules();
    assert(barrel.capitalize("hello") === "Hello", '9: capitalize("hello") → "Hello"');
    assert(barrel.trim("  hi  ") === "hi", '9: trim("  hi  ") → "hi"');
    assert(barrel.defaultExport("WORLD") === "world", '9: defaultExport("WORLD") → "world"');
    assert(barrel.defaultExport === stringUtils.default, "9: defaultExport is same ref");
  }

  // Exercise 10: Fix the singleton
  console.log("\n--- Exercise 10: Singleton config ---");
  {
    const getConfig = exercise10_makeGetConfig();
    const c1 = getConfig();
    const c2 = getConfig();
    assert(c1 === c2, "10: returns same reference");
    assert(c1.debug === true, "10: debug is true");
    assert(c1.apiUrl === "https://api.example.com", "10: apiUrl correct");
  }

  // Exercise 11: Temperature module
  console.log("\n--- Exercise 11: Temperature module ---");
  {
    const mod = exercise11_temperatureModule();
    assert(mod.celsiusToFahrenheit(0) === 32, "11: 0°C → 32°F");
    assert(mod.celsiusToFahrenheit(100) === 212, "11: 100°C → 212°F");
    const fToC = mod.fahrenheitToCelsius(32);
    assert(Math.abs(fToC - 0) < 0.001, "11: 32°F → 0°C");
    assert(mod.getConversionCount() === 3, "11: 3 conversions counted");
    assert(mod.default(72, "F") === "72°F", '11: format 72°F → "72°F"');
    assert(mod.default(22, "C") === "22°C", '11: format 22°C → "22°C"');
  }

  // Exercise 12: Math namespace
  console.log("\n--- Exercise 12: Math namespace ---");
  {
    const math = exercise12_mathNamespace();
    assert(math.add(2, 3) === 5, "12: add(2,3) → 5");
    assert(math.subtract(10, 4) === 6, "12: subtract(10,4) → 6");
    assert(math.multiply(3, 7) === 21, "12: multiply(3,7) → 21");
    assert(math.divide(10, 4) === 2.5, "12: divide(10,4) → 2.5");
    assert(math.divide(1, 0) === Infinity, "12: divide(1,0) → Infinity");
    assert(math.PI === Math.PI, "12: PI matches Math.PI");
    assert(math.E === Math.E, "12: E matches Math.E");
    assert(Object.isFrozen(math), "12: namespace is frozen");
  }

  // Exercise 13: Live bindings
  console.log("\n--- Exercise 13: Live bindings ---");
  {
    const bindings = exercise13_liveBindings();
    assert(bindings.value === 0, "13: initial value is 0");
    bindings.setValue(42);
    assert(bindings.value === 42, "13: after setValue(42), value is 42");
    bindings.setValue(-1);
    assert(bindings.value === -1, "13: after setValue(-1), value is -1");

    // Verify read-only: assigning should throw TypeError
    let threw = false;
    try {
      (bindings as Record<string, unknown>).value = 999;
    } catch (e) {
      if (e instanceof TypeError) threw = true;
    }
    assert(threw, "13: assigning to value throws TypeError");
    assert(bindings.value === -1, "13: value unchanged after failed assignment");
  }

  // Exercise 14: Module registry
  console.log("\n--- Exercise 14: Module registry ---");
  {
    const sys = exercise14_moduleRegistry();

    // Define modules
    sys.define("math", [], () => ({
      add: (a: number, b: number) => a + b,
      multiply: (a: number, b: number) => a * b,
    }));

    sys.define("utils", ["math"], (mathMod) => ({
      doubleAdd: (a: number, b: number) =>
        (mathMod.multiply as (a: number, b: number) => number)(
          (mathMod.add as (a: number, b: number) => number)(a, b),
          2
        ),
    }));

    sys.define("app", ["math", "utils"], (mathMod, utilsMod) => ({
      result1: (mathMod.add as (a: number, b: number) => number)(2, 3),
      result2: (utilsMod.doubleAdd as (a: number, b: number) => number)(2, 3),
    }));

    const app = sys.require("app");
    assert(app.result1 === 5, "14: app.result1 → 5 (math.add(2,3))");
    assert(app.result2 === 10, "14: app.result2 → 10 (utils.doubleAdd(2,3))");

    // Singleton: requiring again returns same object
    const app2 = sys.require("app");
    assert(app === app2, "14: require returns cached instance (singleton)");

    // Unknown module throws
    let threw = false;
    try {
      sys.require("nonexistent");
    } catch {
      threw = true;
    }
    assert(threw, "14: requiring unknown module throws");
  }

  // Exercise 15: Barrel file
  console.log("\n--- Exercise 15: Barrel file ---");
  {
    const barrel = exercise15_barrel();
    assert((barrel.add as (a: number, b: number) => number)(2, 3) === 5, "15: add(2,3) → 5");
    assert((barrel.subtract as (a: number, b: number) => number)(10, 4) === 6, "15: subtract(10,4) → 6");
    assert((barrel.mathDefault as (a: number, b: number) => number)(3, 4) === 12, "15: mathDefault(3,4) → 12");
    assert((barrel.capitalize as (s: string) => string)("hello") === "Hello", '15: capitalize("hello") → "Hello"');
    assert((barrel.reverse as (s: string) => string)("abc") === "cba", '15: reverse("abc") → "cba"');
    assert(typeof barrel.flatten === "function", "15: flatten is a function");
    assert(typeof barrel.unique === "function", "15: unique is a function");
    assert(!("_internal" in barrel), "15: _internal excluded");
    assert(!("_helper" in barrel), "15: _helper excluded");
    assert(!("default" in barrel), "15: raw 'default' excluded");
  }

  // Exercise 16: Lazy import
  console.log("\n--- Exercise 16: Lazy import ---");
  {
    let loadCount = 0;
    const lazyMod = exercise16_lazyImport(async () => { loadCount++; return { value: 42 }; });
    const p1 = lazyMod();
    const p2 = lazyMod();
    assert(p1 === p2, "16: second call returns same Promise");
    void p1.then((m) => {
      assert(m.value === 42, "16: loaded module has value 42");
      assert(loadCount === 1, "16: loader called exactly once");
      void lazyMod().then((m3) => {
        assert(m === m3, "16: third call returns same cached result");
        assert(loadCount === 1, "16: loader still called only once");
      });
    });
  }

  // Exercise 17: DI Container
  console.log("\n--- Exercise 17: DI Container ---");
  {
    const container = exercise17_diContainer();
    let createCount = 0;
    container.register("logger", () => { createCount++; return { log: (msg: string) => `[LOG] ${msg}` }; });
    container.register("db", () => { createCount++; return { query: (sql: string) => `result: ${sql}` }; });

    const logger1 = container.resolve("logger") as { log: (msg: string) => string };
    const logger2 = container.resolve("logger") as { log: (msg: string) => string };
    assert(logger1 === logger2, "17: resolve returns same instance (singleton)");
    assert(createCount === 1, "17: factory called once for logger");
    assert(logger1.log("test") === "[LOG] test", '17: logger.log works');

    const db = container.resolve("db") as { query: (sql: string) => string };
    assert(createCount === 2, "17: factory called once for db");
    assert(db.query("SELECT 1") === "result: SELECT 1", "17: db.query works");

    container.reset();
    const logger3 = container.resolve("logger");
    assert(logger3 !== logger1, "17: after reset, new instance");
    assert(createCount === 3, "17: factory called again after reset");

    let threw = false;
    try { container.resolve("nonexistent"); } catch { threw = true; }
    assert(threw, "17: resolving unknown service throws");
  }

  // Exercise 18: Plugin registry
  console.log("\n--- Exercise 18: Plugin registry ---");
  {
    const registry = exercise18_pluginRegistry();
    registry.register({ name: "auth", init: () => "auth initialized" });
    registry.register({ name: "cache", init: () => "cache initialized" });
    registry.register({ name: "logger", init: () => "logger initialized" });

    const results = registry.initialize();
    assert(results.length === 3, "18: 3 init results");
    assert(results[0] === "auth initialized", "18: first is auth");
    assert(results[1] === "cache initialized", "18: second is cache");
    assert(results[2] === "logger initialized", "18: third is logger");

    assert(registry.get("auth")?.name === "auth", "18: get('auth') works");
    assert(registry.get("nonexistent") === undefined, "18: get unknown → undefined");
    assert(registry.list().join(",") === "auth,cache,logger", "18: list in order");

    let threw = false;
    try { registry.register({ name: "auth", init: () => "dup" }); } catch (e) {
      if (e instanceof Error && e.message.includes("auth")) threw = true;
    }
    assert(threw, "18: duplicate registration throws");

    const names = registry.list();
    names.push("hacked");
    assert(registry.list().length === 3, "18: list() returns a copy");
  }

  // Summary
  // Wait for async tests (exercise 16)
  setTimeout(() => {
    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
    if (failed > 0) {
      process.exit(1);
    }
  }, 200);
}

main();
