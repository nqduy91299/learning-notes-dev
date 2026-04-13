// ============================================================================
// 08-modules: Exercises (18 total)
// ============================================================================
// Categories:
//   A. Predict the output (1-7)
//   B. Fix the bug (8-10)
//   C. Implement (11-18)
//
// IMPORTANT: Since all exercises run in a single file, we CANNOT use actual
// import/export statements. Instead:
//   - Predict-output exercises describe module scenarios in comments
//   - Implement exercises simulate module patterns using closures and objects
//   - Dynamic import() is used only where it works in a single-file context
//
// Rules:
//   - No `any` casts.
//   - Implementation exercises have placeholder return values — fill them in.
//   - Run with: npx tsx 01-javascript/04-advanced/08-modules/exercises.ts
// ============================================================================

// ---------------------------------------------------------------------------
// A. PREDICT THE OUTPUT
// ---------------------------------------------------------------------------

// Exercise 1: Module execution order
// Consider these three modules. What is the console output when main.js runs?
//
//   // logger.js
//   console.log("logger loaded");
//   export function log(msg) { console.log(msg); }
//
//   // utils.js
//   import { log } from "./logger.js";
//   console.log("utils loaded");
//   export function greet(name) { log("Hello " + name); }
//
//   // main.js
//   import { greet } from "./utils.js";
//   console.log("main loaded");
//   greet("Alice");
//
// Your answer: ___________________________________________________________

// Exercise 2: Singleton behavior
// Consider this scenario. What does main.js print?
//
//   // counter.js
//   console.log("counter init");
//   let count = 0;
//   export function increment() { count++; }
//   export function getCount() { return count; }
//
//   // a.js
//   import { increment } from "./counter.js";
//   increment();
//   increment();
//   increment();
//
//   // b.js
//   import { getCount } from "./counter.js";
//   export function showCount() { return getCount(); }
//
//   // main.js
//   import "./a.js";
//   import { showCount } from "./b.js";
//   console.log(showCount());
//
// Your answer: ___________________________________________________________

// Exercise 3: Live bindings
// What does main.js print?
//
//   // state.js
//   export let value = 1;
//   export function setValue(v) { value = v; }
//
//   // main.js
//   import { value, setValue } from "./state.js";
//   console.log("A:", value);
//   setValue(42);
//   console.log("B:", value);
//   // value = 100;   // Would this work? Why or why not?
//
// Your answer: ___________________________________________________________

// Exercise 4: Default export identity
// What does this print?
//
//   // thing.js
//   export default { name: "original" };
//
//   // a.js
//   import obj from "./thing.js";
//   obj.name = "modified by a";
//
//   // b.js
//   import obj from "./thing.js";
//   console.log(obj.name);
//
//   // main.js
//   import "./a.js";
//   import "./b.js";
//
// Your answer: ___________________________________________________________

// Exercise 5: export * and default
// Given these modules, does main.js work? What happens?
//
//   // math.js
//   export const PI = 3.14;
//   export default function add(a, b) { return a + b; }
//
//   // index.js (barrel)
//   export * from "./math.js";
//   // Note: no explicit re-export of default
//
//   // main.js
//   import add, { PI } from "./index.js";
//   console.log(PI);
//   console.log(add(2, 3));
//
// Your answer: ___________________________________________________________

// Exercise 6: Top-level await and execution order
// What is the output order?
//
//   // slow.js
//   console.log("slow: start");
//   const data = await new Promise(resolve =>
//     setTimeout(() => resolve("done"), 100)
//   );
//   console.log("slow: end");
//   export { data };
//
//   // main.js
//   console.log("main: before import");
//   import { data } from "./slow.js";
//   console.log("main: after import");
//   console.log("data:", data);
//
// Your answer: ___________________________________________________________

// Exercise 7: Circular dependency
// What does running a.js print? (Assume a.js is the entry point)
//
//   // a.js
//   import { bValue } from "./b.js";
//   export const aValue = "A";
//   console.log("a.js sees bValue:", bValue);
//
//   // b.js
//   import { aValue } from "./a.js";
//   export const bValue = "B";
//   console.log("b.js sees aValue:", aValue);
//
// Your answer: ___________________________________________________________


// ---------------------------------------------------------------------------
// B. FIX THE BUG
// ---------------------------------------------------------------------------

// Exercise 8: Fix the broken module pattern
// This simulated module is supposed to provide a counter with private state.
// But it has a bug — calling getCount() always returns 0.
// Fix it WITHOUT changing the function signatures.
function exercise8_createCounter(): {
  increment: () => void;
  decrement: () => void;
  getCount: () => number;
} {
  let count = 0;
  return {
    increment() {
      let count = 1; // BUG: something's wrong here
    },
    decrement() {
      let count = -1; // BUG: something's wrong here
    },
    getCount() {
      return count;
    },
  };
}

// Exercise 9: Fix the barrel re-export simulation
// This simulates a barrel file that re-exports from sub-modules.
// But the types don't line up — the barrel loses the 'default' export.
// Fix the barrel so it includes the default.
function exercise9_modules(): {
  stringUtils: { capitalize: (s: string) => string; trim: (s: string) => string };
  barrel: {
    capitalize: (s: string) => string;
    trim: (s: string) => string;
    defaultExport: (s: string) => string;
  };
} {
  // Simulated "stringUtils" module
  const stringUtils = {
    capitalize: (s: string): string => s.charAt(0).toUpperCase() + s.slice(1),
    trim: (s: string): string => s.trim(),
    default: (s: string): string => s.toLowerCase(),
  };

  // Simulated barrel — BUG: export * doesn't include default
  const barrel = {
    capitalize: stringUtils.capitalize,
    trim: stringUtils.trim,
    // BUG: defaultExport is missing!
    defaultExport: undefined as unknown as (s: string) => string,
  };

  return { stringUtils, barrel };
}

// Exercise 10: Fix the singleton violation
// This factory is supposed to behave like a module (execute once, return same instance).
// But each call creates a new instance. Fix it so it returns the same config every time.
function exercise10_makeGetConfig(): () => { debug: boolean; apiUrl: string } {
  // BUG: This should return the same object every time, but it doesn't
  function getConfig(): { debug: boolean; apiUrl: string } {
    const config = {
      debug: true,
      apiUrl: "https://api.example.com",
    };
    return config;
  }
  return getConfig;
}


// ---------------------------------------------------------------------------
// C. IMPLEMENT
// ---------------------------------------------------------------------------

// Exercise 11: Implement a module simulator
// Create a function that simulates the ES Module pattern:
// - Private internal state (not directly accessible)
// - Named exports (multiple)
// - A default export
// The module should be a "temperature converter" with:
//   Named exports: celsiusToFahrenheit(c), fahrenheitToCelsius(f), getConversionCount()
//   Default export: a function that formats a temp string like "72°F" or "22°C"
// getConversionCount returns how many times either conversion function was called.
function exercise11_temperatureModule(): {
  celsiusToFahrenheit: (c: number) => number;
  fahrenheitToCelsius: (f: number) => number;
  getConversionCount: () => number;
  default: (value: number, unit: "C" | "F") => string;
} {
  // YOUR CODE HERE
  return {
    celsiusToFahrenheit: (_c: number) => 0,
    fahrenheitToCelsius: (_f: number) => 0,
    getConversionCount: () => 0,
    default: (_value: number, _unit: "C" | "F") => "",
  };
}

// Exercise 12: Implement namespace import simulation
// Simulate `import * as math from "./math.js"` by creating a frozen namespace object.
// The namespace should contain: add, subtract, multiply, divide, PI, E
// Dividing by zero should return Infinity (standard JS behavior).
// The returned object must be frozen (Object.isFrozen returns true).
function exercise12_mathNamespace(): Readonly<{
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
  PI: number;
  E: number;
}> {
  // YOUR CODE HERE
  return Object.freeze({
    add: (_a: number, _b: number) => 0,
    subtract: (_a: number, _b: number) => 0,
    multiply: (_a: number, _b: number) => 0,
    divide: (_a: number, _b: number) => 0,
    PI: 0,
    E: 0,
  });
}

// Exercise 13: Implement live bindings simulation
// Simulate ES Module live bindings using getters.
// Create an object that exports `value` and `setValue`.
// Reading `obj.value` should always return the current value (live binding).
// `obj.setValue(v)` updates the internal value.
// Directly assigning `obj.value = x` should throw a TypeError (read-only binding).
function exercise13_liveBindings(): {
  readonly value: number;
  setValue: (v: number) => void;
} {
  // YOUR CODE HERE
  // Hint: Use Object.defineProperty or a getter/setter
  return { value: 0, setValue: (_v: number) => {} };
}

// Exercise 14: Implement a module registry / loader
// Build a mini module system with:
//   define(name, deps, factory) — registers a module with dependencies
//   require(name) — returns the module's exports (evaluates lazily on first require)
// The factory function receives the resolved dependency exports as arguments
// and returns the module's exports.
// Modules should only be evaluated once (singleton).
interface MiniModuleSystem {
  define: (
    name: string,
    deps: string[],
    factory: (...args: Record<string, unknown>[]) => Record<string, unknown>
  ) => void;
  require: (name: string) => Record<string, unknown>;
}

function exercise14_moduleRegistry(): MiniModuleSystem {
  // YOUR CODE HERE
  return {
    define: (_name, _deps, _factory) => {},
    require: (_name) => ({}),
  };
}

// Exercise 15: Implement barrel file simulation
// Given three "sub-module" factories, create a barrel that aggregates them.
// The barrel should:
//   - Include all named exports from each sub-module
//   - Include the default from mathModule as "mathDefault"
//   - NOT include internal/private members (anything starting with _)
type SubModule = Record<string, unknown>;

function exercise15_barrel(): SubModule {
  // These simulate three sub-modules
  const mathModule: SubModule = {
    add: (a: number, b: number) => a + b,
    subtract: (a: number, b: number) => a - b,
    default: (a: number, b: number) => a * b, // default export
    _internal: () => "secret",                 // private — do NOT re-export
  };

  const stringModule: SubModule = {
    capitalize: (s: string) => (s.charAt(0).toUpperCase() + s.slice(1)),
    reverse: (s: string) => s.split("").reverse().join(""),
    _helper: () => "private",                  // private — do NOT re-export
  };

  const arrayModule: SubModule = {
    flatten: (arr: unknown[][]) => arr.reduce<unknown[]>((a, b) => [...a, ...b], []),
    unique: (arr: unknown[]) => [...new Set(arr)],
  };

  // YOUR CODE HERE — create and return the barrel
  return {};
}

// Exercise 16: Implement dynamic import simulation with lazy loading
// Create a system where modules are loaded lazily (only when first requested).
// lazyImport(loader) returns a function that:
//   - On first call, invokes loader() (which returns a Promise<T>)
//   - Caches the result
//   - On subsequent calls, returns the cached Promise (does NOT call loader again)
function exercise16_lazyImport<T>(loader: () => Promise<T>): () => Promise<T> {
  // YOUR CODE HERE
  return () => loader();
}

// Exercise 17: Implement a dependency injection container (service module pattern)
// Create a container where services can be registered and resolved.
//   register(name, factory) — registers a service factory
//   resolve(name) — creates/returns the service (singleton — only created once)
//   reset() — clears all cached instances (but keeps registrations)
interface DIContainer {
  register: (name: string, factory: () => unknown) => void;
  resolve: (name: string) => unknown;
  reset: () => void;
}

function exercise17_diContainer(): DIContainer {
  // YOUR CODE HERE
  return {
    register: (_name, _factory) => {},
    resolve: (_name) => undefined,
    reset: () => {},
  };
}

// Exercise 18: Implement a plugin system (registry pattern)
// Create a plugin registry where:
//   register(plugin) — adds a plugin. Plugin has { name: string, init: () => string }
//   initialize() — calls init() on all registered plugins (in order), returns results
//   get(name) — returns a specific plugin or undefined
//   list() — returns array of all plugin names
// Registering a plugin with a duplicate name should throw an Error.
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
  // YOUR CODE HERE
  return {
    register: (_plugin) => {},
    initialize: () => [],
    get: (_name) => undefined,
    list: () => [],
  };
}


// ---------------------------------------------------------------------------
// RUNNER (all test calls commented out — uncomment to test)
// ---------------------------------------------------------------------------

function main(): void {
  // Exercise 1-7: Predict-output exercises — check your answers in solutions.ts

  // // Exercise 8: Fix the broken counter
  // const counter8 = exercise8_createCounter();
  // counter8.increment();
  // counter8.increment();
  // counter8.increment();
  // counter8.decrement();
  // console.log("Exercise 8:", counter8.getCount());

  // // Exercise 9: Fix the barrel
  // const { barrel } = exercise9_modules();
  // console.log("Exercise 9:", barrel.capitalize("hello"), barrel.defaultExport("WORLD"));

  // // Exercise 10: Fix the singleton
  // const getConfig = exercise10_makeGetConfig();
  // const config1 = getConfig();
  // const config2 = getConfig();
  // console.log("Exercise 10: same ref?", config1 === config2);

  // // Exercise 11: Temperature module
  // const tempMod = exercise11_temperatureModule();
  // console.log("Exercise 11:",
  //   tempMod.celsiusToFahrenheit(100),
  //   tempMod.fahrenheitToCelsius(32),
  //   tempMod.getConversionCount(),
  //   tempMod.default(72, "F")
  // );

  // // Exercise 12: Math namespace
  // const math = exercise12_mathNamespace();
  // console.log("Exercise 12:", math.add(2, 3), math.PI, Object.isFrozen(math));

  // // Exercise 13: Live bindings
  // const bindings = exercise13_liveBindings();
  // console.log("Exercise 13:", bindings.value);
  // bindings.setValue(42);
  // console.log("Exercise 13:", bindings.value);

  // // Exercise 14: Module registry
  // const sys = exercise14_moduleRegistry();
  // sys.define("math", [], () => ({ add: (a: number, b: number) => a + b }));
  // sys.define("app", ["math"], (mathMod) => ({
  //   result: (mathMod.add as (a: number, b: number) => number)(2, 3),
  // }));
  // console.log("Exercise 14:", sys.require("app"));

  // // Exercise 15: Barrel file
  // const barrel15 = exercise15_barrel();
  // console.log("Exercise 15:",
  //   Object.keys(barrel15).sort().join(", "),
  //   "has _internal?", "_internal" in barrel15
  // );

  // // Exercise 16: Lazy import
  // let loadCount = 0;
  // const lazyMod = exercise16_lazyImport(async () => {
  //   loadCount++;
  //   return { value: 42 };
  // });
  // lazyMod().then(m => {
  //   console.log("Exercise 16: first load:", m, "loadCount:", loadCount);
  //   return lazyMod();
  // }).then(m => {
  //   console.log("Exercise 16: second load:", m, "loadCount:", loadCount);
  // });

  // // Exercise 17: DI Container
  // const container = exercise17_diContainer();
  // container.register("logger", () => ({ log: (msg: string) => msg }));
  // const logger1 = container.resolve("logger");
  // const logger2 = container.resolve("logger");
  // console.log("Exercise 17: same ref?", logger1 === logger2);

  // // Exercise 18: Plugin registry
  // const registry = exercise18_pluginRegistry();
  // registry.register({ name: "auth", init: () => "auth initialized" });
  // registry.register({ name: "cache", init: () => "cache initialized" });
  // console.log("Exercise 18:", registry.initialize(), registry.list());
}

main();
