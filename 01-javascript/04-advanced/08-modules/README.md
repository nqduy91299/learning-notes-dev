# Modules — Deep Dive

> JavaScript started without a module system. This section covers the full
> evolution from script tags to ES Modules, plus every nuance you need for
> production code.

Sources: [javascript.info — Modules](https://javascript.info/modules) |
[MDN — import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) |
[MDN — export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) |
[MDN — import()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) |
[MDN — import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)

---

## 1. What Are Modules?

A **module** is a file that encapsulates code — variables, functions, classes —
and explicitly declares what it exposes (exports) and what it consumes (imports).

### 1.1 The Historical Path

| Era | Approach | Description |
|-----|----------|-------------|
| Early web | `<script>` tags | Everything in the global scope. Order-dependent. Name collisions. |
| ~2005 | IIFE / Revealing Module | Closures to create private scope. Manual wiring. |
| ~2009 | CommonJS (Node.js) | `require()` / `module.exports`. Synchronous. File-based. |
| ~2011 | AMD (RequireJS) | `define()` / `require()`. Asynchronous. Browser-oriented. |
| ~2012 | UMD | Wrapper that supports both CommonJS and AMD. |
| 2015 | **ES Modules** (ES2015) | `import` / `export`. Static syntax. The standard. |

### 1.2 Why Do We Need Modules?

1. **Encapsulation** — hide implementation, expose only the public API.
2. **Namespace isolation** — no global pollution.
3. **Explicit dependencies** — imports make the dependency graph visible.
4. **Reusability** — import the same module from multiple consumers.
5. **Tooling** — static syntax enables tree-shaking, bundling, type checking.

---

## 2. ES Module Basics

### 2.1 In the Browser

```html
<script type="module" src="app.js"></script>
```

| Feature | Classic Script | Module |
|---------|---------------|--------|
| Default mode | Sloppy | **Strict** |
| Top-level `this` | `window` | `undefined` |
| Top-level vars | Global | **Module-scoped** |
| Execution | Immediate | **Deferred** |
| Loaded multiple times? | Yes | **Once** (cached) |

### 2.2 In Node.js

Use `.mjs` extension, or set `"type": "module"` in `package.json`, or use a
loader like `tsx`.

---

## 3. Named Exports

Named exports let you export multiple values from a module. Each export has a
name that importers must use (or alias).

### 3.1 Inline Export

```js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Vector {
  constructor(x, y) { this.x = x; this.y = y; }
}
```

### 3.2 Export List

```js
const PI = 3.14159;
function add(a, b) { return a + b; }
export { PI, add };
```

Both styles are equivalent. The export-list style keeps all exports visible in
one place.

### 3.3 Renaming on Export

```js
export { add as sum, PI as pi };
```

---

## 4. Named Imports

```js
import { PI, add } from "./math.js";
import { add as sum } from "./math.js";   // aliasing

sum(2, 3); // 5
```

Imports are **read-only** — `PI = 3` throws TypeError. However, if the
exporting module mutates its own variable, you see the update (live bindings).

---

## 5. Default Exports

Each module can have **one** default export. Importers choose the name freely.

```js
// Exporting
export default function log(msg) { console.log(`[LOG] ${msg}`); }

// Importing — no braces, any name works
import log from "./logger.js";
import MyLogger from "./logger.js";  // same thing
```

### 5.3 Default Export Under the Hood

`export default` is sugar for a named export called `default`:

```js
export default function log() { /* ... */ }
// equivalent to: export { log as default };

import log from "./logger.js";
// equivalent to: import { default as log } from "./logger.js";
```

---

## 6. Mixed Exports

A module can combine named and default exports:

```js
export default class HttpClient { get(url) { /* ... */ } }
export const BASE_URL = "https://api.example.com";

// Importing both:
import HttpClient, { BASE_URL } from "./http.js";
```

---

## 7. Re-Exports

Re-exports aggregate modules without executing their code locally.

### 7.1 Selective Re-Export

```js
// index.js (barrel file)
export { add, subtract } from "./math.js";
export { default as Logger } from "./logger.js";
```

### 7.2 Wildcard Re-Export

```js
export * from "./math.js";
```

**Caveat:** `export *` does **not** re-export the default export. You must
re-export it explicitly:

```js
export * from "./math.js";
export { default } from "./math.js";
```

### 7.3 Re-Export with Rename

```js
export { add as sum } from "./math.js";
```

### 7.4 Barrel Files

A **barrel file** (usually `index.js`) re-exports from multiple sub-modules:

```
utils/
  ├── string.js
  ├── array.js
  └── index.js    ← barrel
```

```js
// utils/index.js
export * from "./string.js";
export * from "./array.js";
```

Consumers import from one place: `import { capitalize, flatten } from "./utils/index.js";`

**Warning:** Barrel files can hurt tree-shaking — every re-exported module gets
evaluated when the barrel is imported.

---

## 8. Namespace Imports (`import *`)

Import everything as a single namespace object:

```js
import * as math from "./math.js";
math.add(1, 2);     // 3
math.PI;             // 3.14159
math.default;        // the default export (if any)
```

Useful when a module has many exports and you want clear provenance, or to avoid
name collisions. The namespace is a **live, read-only** Module Namespace object.

---

## 9. Dynamic Import — `import()`

### 9.1 Syntax and Basics

`import()` is a function-like expression (not a function) that returns a
**Promise** resolving to the module's namespace object:

```js
const module = await import("./math.js");
console.log(module.add(2, 3));    // 5
console.log(module.default);      // default export (if any)
```

### 9.2 Use Cases

#### Lazy Loading

```js
button.addEventListener("click", async () => {
  const { Chart } = await import("./chart.js");
  const chart = new Chart(canvas);
  chart.render(data);
});
```

#### Conditional Loading

```js
if (locale !== "en") {
  const translator = await import(`./i18n/${locale}.js`);
}
```

### 9.3 Error Handling

```js
try {
  const mod = await import("./optional-feature.js");
} catch (err) { console.warn("Not available:", err.message); }
```

### 9.4 `import()` vs Static `import`

| Feature | Static `import` | Dynamic `import()` |
|---------|-----------------|-------------------|
| Syntax | Declaration | Expression (returns Promise) |
| When evaluated | Before execution (hoisted) | At runtime, on demand |
| Tree-shakeable | Yes | No (opaque to bundlers) |
| Module specifier | Must be string literal | Can be any expression |
| Use case | Regular dependencies | Lazy/conditional loading |

---

## 10. `import.meta`

An object containing metadata about the current module (ESM only).

### 10.1 `import.meta.url`

```js
console.log(import.meta.url);
// Node:    "file:///home/user/project/src/app.js"
// Browser: "https://example.com/src/app.js"

// Common pattern — resolve a path relative to this module:
const configPath = new URL("./config.json", import.meta.url);
```

### 10.2 `import.meta.resolve`

Returns the resolved URL for a specifier without loading the module:

```js
const resolved = import.meta.resolve("./utils.js");
// "file:///home/user/project/src/utils.js"
```

---

## 11. Module Execution — Singleton Behavior

A module's top-level code executes **exactly once**, on the first import.
Subsequent imports receive the **same** instance.

```js
// counter.js
console.log("counter.js loaded");  // printed only once
let count = 0;
export function increment() { count++; }
export function getCount() { return count; }

// a.js — import { increment } from "./counter.js";  → prints "counter.js loaded"
// b.js — import { getCount } from "./counter.js";   → does NOT print again
// b.js: getCount() → 1 (sees a's increment!)
```

This makes modules ideal for shared state: configs, caches, registries.

---

## 12. Module Scope

Each module has its own top-level scope. Variables are **not** added to
`globalThis` — even `var` at the top level stays module-scoped:

```js
// module-a.js
const secret = 42;
var alsoPrivate = "hello";

// module-b.js
console.log(typeof secret);      // "undefined"
console.log(typeof alsoPrivate); // "undefined"
```

---

## 13. Live Bindings

ES Module exports are **live bindings** — references to the variable in the
exporting module, not copies of its value.

```js
// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import { count, increment } from "./counter.js";
console.log(count);  // 0
increment();
console.log(count);  // 1  ← updated value visible!
```

This differs from CommonJS, where `require()` returns a **copy** of the value.

**How it works:** `export let count` creates a getter that always reads the
current value. The import `{ count }` is bound to that getter.

**Read-only:** You cannot assign to an imported binding (`count = 99` throws
TypeError). Only the exporting module can modify its own exports.

---

## 14. Circular Dependencies

Circular dependencies occur when module A imports from module B, and module B
imports from module A.

### 14.1 How ESM Handles Circular Dependencies

ES Modules use three phases: **parsing** (build module graph), **instantiation**
(create bindings), **evaluation** (execute code top-to-bottom).

```js
// a.js (entry point)
import { bValue } from "./b.js";
export const aValue = "A";
console.log("a.js:", bValue);    // "B"

// b.js
import { aValue } from "./a.js";
export const bValue = "B";
console.log("b.js:", aValue);    // undefined! (a.js hasn't finished evaluating)
```

When `b.js` runs, `aValue` has been **instantiated** (binding exists) but not
yet **evaluated** (`const aValue = "A"` hasn't run), so it reads `undefined`.

### 14.2 Avoiding Circular Dependency Problems

1. **Move shared code to a third module** that both A and B import.
2. **Use function calls** instead of top-level value access — by the time the
   function is called, both modules will have been fully evaluated.
3. **Restructure** to break the cycle.

### 14.3 CommonJS Circular Dependencies

CommonJS returns the **partially loaded** `module.exports` when a cycle is
detected. The result is similar — incomplete objects and surprise `undefined`
values — but the mechanism differs (snapshot copies vs live bindings).

---

## 15. CommonJS vs ES Modules

| Feature | CommonJS (`require`) | ES Modules (`import`) |
|---------|--------------------|-----------------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | **Synchronous** | **Asynchronous** (can be sync in some runtimes) |
| Evaluation | **Dynamic** — `require()` can be called anywhere | **Static** — `import` declarations are hoisted |
| Bindings | **Copy** of the value at require time | **Live bindings** (references) |
| Conditional loading | `if (x) require("y")` | Use `import()` for dynamic |
| Tree-shaking | Difficult (dynamic structure) | Easy (static structure) |
| `this` at top level | `exports` object | `undefined` |
| File extensions | `.js`, `.cjs` | `.js` (with `"type": "module"`), `.mjs` |
| Default in Node | Yes (historical) | Requires opt-in |
| Circular deps | Partial exports object | Live bindings (may be uninitialized) |

### 15.1 Interoperability

ESM can import CommonJS (the CJS `module.exports` becomes the default export).
CommonJS cannot use static `import` — use `await import("./mod.mjs")` instead.

---

## 16. Top-Level Await (ES2022)

`await` at the top level of a module (not inside any function):

```js
const response = await fetch("/api/config");
export const config = await response.json();
```

- The module becomes **async** — importers wait for it to resolve.
- Propagates up the dependency graph.
- Only works in **modules** (not classic scripts or CJS).
- Use sparingly — blocks dependent module evaluation.

### Use Cases

```js
export const db = await connect("mongodb://localhost/mydb");

export const renderer = supportsWebGPU
  ? await import("./webgpu-renderer.js")
  : await import("./canvas-renderer.js");
```

---

## 17. Module Patterns

### 17.1 Barrel Files

Re-export from sub-modules (covered in section 7.4). **Pros:** Clean imports.
**Cons:** Can defeat tree-shaking.

### 17.2 Service Modules (Singleton)

Leverage module singleton behavior for shared state:

```js
// cache.js
const store = new Map();
export function get(key) { return store.get(key); }
export function set(key, value) { store.set(key, value); }
```

Every consumer shares the same `store` Map.

### 17.3 Dependency Injection via Modules

Use module-scoped variables with setter functions to swap implementations
(e.g., for testing):

```js
// services.js
let _logger = console;

export function setLogger(logger) { _logger = logger; }
export function getLogger() { return _logger; }
```

```js
// In tests
import { setLogger } from "./services.js";
setLogger(mockLogger);
```

### 17.4 Configuration Module

```js
export default Object.freeze({
  apiUrl: process.env.API_URL || "http://localhost:3000",
  debug: process.env.NODE_ENV !== "production",
});
```

### 17.5 Plugin / Registry Pattern

```js
const plugins = new Map();
export function register(name, plugin) {
  if (plugins.has(name)) throw new Error(`"${name}" already registered`);
  plugins.set(name, plugin);
}
export function get(name) { return plugins.get(name); }
```

### 17.6 Facade Module

A simplified interface over several complex sub-modules — consumers import one
clean API without knowing the internal wiring.

---

## 18. Quick Reference

```js
// --- Imports ---
import defaultExport from "module";
import { named } from "module";
import { named as alias } from "module";
import defaultExport, { named } from "module";
import * as ns from "module";
import "module";                          // side-effect only
const mod = await import("module");       // dynamic

// --- Exports ---
export const x = 1;
export function fn() {}
export default expression;
export { x, y, z };
export { x as alias };
export { x } from "module";              // re-export
export * from "module";                   // re-export all named
export { default } from "module";        // re-export default
```

---

## 19. Best Practices

1. **Prefer named exports** — enables tree-shaking and searchable names.
2. **Keep modules focused** — one module, one responsibility.
3. **Avoid side effects in modules** — pure-export modules are easier to
   tree-shake and test.
4. **Be careful with barrel files** — can bundle unused code.
5. **Use dynamic `import()` for optional features** — lazy-load what you can.
6. **Avoid circular dependencies** — restructure or use a third module.
7. **Use `import.meta.url` for file paths** — `__dirname`/`__filename` don't
   exist in ESM.
8. **Be explicit about file extensions** — Node ESM requires `.js`/`.mjs`.
9. **Prefer static imports** — better tooling, type checking, optimization.
