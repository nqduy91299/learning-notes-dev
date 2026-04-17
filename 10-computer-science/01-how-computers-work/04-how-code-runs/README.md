# How Code Runs

## Why This Matters for Frontend Developers

Every line of JavaScript you write goes through a complex journey before it executes in the
browser. Understanding this journey — from source code to AST to bytecode to machine code —
explains why build tools exist, how tree shaking works, why source maps are necessary, and
how module systems load differently. This knowledge makes you effective at configuring build
pipelines and debugging production issues.

---

## Table of Contents

1. [Compilation vs Interpretation](#1-compilation-vs-interpretation)
2. [How JavaScript Code Runs](#2-how-javascript-code-runs)
3. [Abstract Syntax Trees (AST)](#3-abstract-syntax-trees-ast)
4. [Transpilation](#4-transpilation)
5. [Bundling](#5-bundling)
6. [Tree Shaking](#6-tree-shaking)
7. [Minification and Compression](#7-minification-and-compression)
8. [Source Maps](#8-source-maps)
9. [Module Systems](#9-module-systems)

---

## 1. Compilation vs Interpretation

There are three main strategies for running code:

### Compiled Languages (C, C++, Rust, Go)

Source code is translated to machine code **ahead of time** (AOT) by a compiler. The output
is a native binary that runs directly on the CPU.

```
Source Code → Compiler → Machine Code (binary) → CPU executes
```

- **Pros**: Maximum performance, errors caught at compile time
- **Cons**: Must compile for each target platform, slower development cycle

### Interpreted Languages (Python, Ruby, older JS)

An interpreter reads and executes source code **line by line** at runtime.

```
Source Code → Interpreter reads line → Executes immediately → Next line
```

- **Pros**: Fast development cycle, platform-independent
- **Cons**: Slower execution (no optimization passes)

### JIT-Compiled Languages (JavaScript, Java, C#)

A hybrid approach: code starts interpreted, then frequently-executed paths are compiled
to machine code **at runtime**.

```
Source Code → Parser → Bytecode → Interpreter executes
                                       ↓ (hot paths detected)
                              JIT Compiler → Optimized Machine Code
```

- **Pros**: Near-native performance for hot code, fast startup
- **Cons**: Warmup time, unpredictable optimization/deoptimization

### Where JavaScript Fits

Modern JavaScript engines (V8, SpiderMonkey, JavaScriptCore) all use JIT compilation.
JavaScript is neither purely interpreted nor purely compiled — it's both, dynamically
switching between interpretation and compilation based on runtime behavior.

---

## 2. How JavaScript Code Runs

When the browser encounters a `<script>` tag or a module, this is what happens:

### Step 1: Download

The browser downloads the JavaScript file over the network. This is why bundle size
matters — larger files take longer to download, especially on slow connections.

### Step 2: Parsing

The parser reads the source code character by character and produces an **Abstract Syntax
Tree (AST)**. This involves two sub-steps:

**Lexical analysis (tokenization)**: Breaks source code into tokens.

```
const x = 42 + y;
↓
[CONST] [IDENTIFIER:"x"] [EQUALS] [NUMBER:42] [PLUS] [IDENTIFIER:"y"] [SEMICOLON]
```

**Syntactic analysis (parsing)**: Organizes tokens into a tree structure according to
grammar rules.

### Step 3: Bytecode Generation

The AST is compiled to **bytecode** — a compact, low-level representation that the
interpreter can execute efficiently. Bytecode is not machine code — it's an intermediate
format specific to the engine.

### Step 4: Execution

The bytecode interpreter (V8's Ignition) executes the bytecode while collecting **type
feedback** — recording what types of values each operation actually sees at runtime.

### Step 5: Optimization (Maybe)

If a function is called many times with consistent types, the JIT compiler (V8's TurboFan)
compiles it to optimized machine code using the collected type feedback.

```
Source → Tokens → AST → Bytecode → [Ignition interprets]
                                          ↓ (hot + stable types)
                                    [TurboFan optimizes] → Machine Code
                                          ↓ (types change)
                                    [Deoptimize back to bytecode]
```

---

## 3. Abstract Syntax Trees (AST)

An AST is a tree representation of the syntactic structure of source code. Each node in the
tree represents a construct in the language.

### Example

```javascript
const sum = a + b;
```

Becomes:

```
VariableDeclaration (const)
└── VariableDeclarator
    ├── Identifier: "sum"
    └── BinaryExpression (+)
        ├── Identifier: "a"
        └── Identifier: "b"
```

### Why ASTs Matter for Frontend

**Linters (ESLint)**: Walk the AST to find patterns that indicate bugs or style violations.
ESLint rules are functions that receive AST nodes and report problems.

```javascript
// ESLint rule: no-unused-vars
// Walks AST looking for Identifier nodes that are declared but never referenced
```

**Formatters (Prettier)**: Parse code to AST, then re-print it with consistent formatting.
The AST preserves meaning while discarding original formatting.

**Babel**: Parses code to AST, transforms nodes (e.g., convert JSX to `createElement` calls),
then generates new code from the modified AST.

```
JSX: <div className="x">Hello</div>
  ↓ Parse to AST
  ↓ Transform JSXElement nodes
  ↓ Generate code
JS: React.createElement("div", { className: "x" }, "Hello")
```

**TypeScript compiler**: Parses to its own AST, performs type checking against the AST,
then emits JavaScript (stripping type annotations from the AST).

### AST Explorer

The tool at [astexplorer.net](https://astexplorer.net) lets you paste code and see the
resulting AST interactively. It supports multiple parsers (Babel, TypeScript, ESLint, etc.).

---

## 4. Transpilation

**Transpilation** = translation between languages at the same level of abstraction (as
opposed to compilation which goes from high-level to low-level).

### Babel

Transforms modern JavaScript to older JavaScript for browser compatibility.

```javascript
// Input (ES2020)
const result = obj?.deeply?.nested?.value ?? "default";

// Output (ES5)
var _obj$deeply, _obj$deeply$nested;
var result =
  (_obj$deeply = obj) === null || _obj$deeply === void 0
    ? void 0
    : (_obj$deeply$nested = _obj$deeply.deeply) === null ||
      _obj$deeply$nested === void 0
    ? void 0
    : _obj$deeply$nested.nested === null
    ? void 0
    : _obj$deeply$nested.nested.value;
var result2 = result !== null && result !== void 0 ? result : "default";
```

### TypeScript Compiler (tsc)

Strips type annotations and transpiles TypeScript-specific syntax to JavaScript. Importantly,
**tsc performs type checking** but the emitted JavaScript doesn't include any runtime type
information.

```typescript
// Input (TypeScript)
interface User { name: string; age: number; }
const greet = (user: User): string => `Hello, ${user.name}!`;

// Output (JavaScript)
const greet = (user) => `Hello, ${user.name}!`;
```

### Why We Transpile

1. **Browser compatibility**: Use modern syntax while supporting older browsers
2. **Type checking**: TypeScript catches errors at build time
3. **JSX**: React's JSX isn't valid JavaScript — Babel/SWC transforms it
4. **Language features**: Decorators, pipeline operator, etc. before browser support
5. **Custom syntax**: Styled-components, GraphQL template literals

---

## 5. Bundling

Bundlers combine many source files into one or more output files for the browser.

### Why Bundling Exists

Without bundling, a React app with 500 components would require 500+ HTTP requests.
Even with HTTP/2 multiplexing, there's overhead per request. Bundling combines these
into a handful of optimized files.

### Major Bundlers

**Webpack** (2014): The most configurable bundler. Uses loaders and plugins for everything.
Slow for large projects but extremely flexible. Configuration-heavy.

**Rollup** (2015): Designed for libraries. First bundler to implement tree shaking. Outputs
cleaner code than Webpack. Good for npm packages.

**esbuild** (2020): Written in Go, 10–100x faster than Webpack/Rollup. Used as a
transformer in other tools (Vite). Limited plugin API.

**Vite** (2020): Uses esbuild for dev (fast HMR) and Rollup for production builds. The
modern default for new projects. Dev server serves unbundled ES modules.

### What Bundlers Do

1. **Resolve imports**: Follow `import`/`require` to build a dependency graph
2. **Transform**: Apply loaders/plugins (TypeScript → JS, SCSS → CSS, etc.)
3. **Bundle**: Combine modules into chunks
4. **Code split**: Separate vendor code, route-based chunks, dynamic imports
5. **Optimize**: Tree shake, minify, generate source maps

### Code Splitting

```typescript
// Static import — included in main bundle
import { Header } from "./Header";

// Dynamic import — creates a separate chunk, loaded on demand
const AdminPanel = lazy(() => import("./AdminPanel"));

// Route-based splitting
const routes = [
  { path: "/", component: () => import("./pages/Home") },
  { path: "/about", component: () => import("./pages/About") },
];
```

---

## 6. Tree Shaking

Tree shaking is **dead code elimination** for ES modules. It removes exported code that
is never imported anywhere.

### How It Works

```typescript
// math.ts
export function add(a: number, b: number) { return a + b; }
export function subtract(a: number, b: number) { return a - b; }
export function multiply(a: number, b: number) { return a * b; }
export function divide(a: number, b: number) { return a / b; }

// app.ts
import { add } from "./math";
console.log(add(1, 2));
```

After tree shaking, only `add` is included in the bundle. `subtract`, `multiply`, and
`divide` are eliminated.

### Requirements for Tree Shaking

**ES modules are required.** CommonJS `require()` is dynamic and can't be statically
analyzed:

```javascript
// ESM: statically analyzable — bundler knows exactly what's imported
import { add } from "./math";

// CommonJS: NOT statically analyzable — could import anything
const math = require("./math");
const fn = math[someVariable]; // what's used? Can't know at build time
```

**The `sideEffects` flag** in `package.json` tells the bundler whether modules have
side effects (code that runs on import, even without exports):

```json
{
  "sideEffects": false
}
```

This tells the bundler: "if nothing is imported from a module, the entire module can be
safely removed." Without this flag, the bundler must assume every module might have side
effects and can't be eliminated.

```json
{
  "sideEffects": ["*.css", "./src/polyfills.ts"]
}
```

### Common Tree Shaking Failures

```typescript
// BAD: Re-exporting everything prevents tree shaking
export * from "./utils";  // Bundler may not be able to trace through

// BAD: Classes are hard to tree shake (methods might have side effects)
export class MathUtils {
  static add(a: number, b: number) { return a + b; }
  static subtract(a: number, b: number) { return a - b; }
}
// Even if only add() is used, the whole class may be included

// GOOD: Named function exports are tree-shakeable
export function add(a: number, b: number) { return a + b; }
export function subtract(a: number, b: number) { return a - b; }
```

---

## 7. Minification and Compression

### Minification

Reduces code size by removing unnecessary characters and shortening identifiers.

**What minifiers do:**
- Remove whitespace and comments
- Shorten variable/function names (`calculateTotalPrice` → `a`)
- Simplify expressions (`true` → `!0`, `undefined` → `void 0`)
- Remove dead code (unreachable `if` branches)
- Inline simple functions

```javascript
// Before minification (1,247 bytes)
function calculateTotalPrice(items, taxRate) {
  // Calculate the sum of all item prices
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * taxRate;
  return subtotal + tax;
}

// After minification (~100 bytes)
function a(t,r){let e=0;for(const n of t)e+=n.price*n.quantity;return e+e*r}
```

**Major minifiers:**
- **Terser**: The standard JS minifier (used by Webpack, Rollup)
- **esbuild**: Built-in minification, extremely fast
- **SWC**: Rust-based, very fast (used by Next.js)

### Compression

After minification, the server compresses files before sending them over the network.

**Gzip**: The standard. Supported by all browsers. ~70% compression ratio for text.

**Brotli** (`br`): Google's newer algorithm. ~20% better than gzip for text. Supported
by all modern browsers. Slower to compress but faster to decompress.

```
Original:     500 KB
Minified:     200 KB (60% reduction)
Gzipped:       60 KB (70% compression)
Brotli:        48 KB (76% compression)
```

The browser sends `Accept-Encoding: gzip, br` and the server responds with the compressed
version. Decompression happens transparently.

---

## 8. Source Maps

Source maps connect minified/transpiled code back to the original source, enabling
debugging in production.

### How They Work

A source map is a JSON file (`.map`) that contains mappings from positions in the generated
file to positions in the original source files.

```javascript
// Generated file (bundle.min.js) — last line:
//# sourceMappingURL=bundle.min.js.map
```

```json
// bundle.min.js.map
{
  "version": 3,
  "sources": ["src/utils.ts", "src/app.ts"],
  "names": ["calculateTotal", "items", "subtotal"],
  "mappings": "AAAA,SAASA,EAAiBC,..."
}
```

### The Mappings Format

The `mappings` field uses **VLQ (Variable-Length Quantity) encoded** segments separated by
commas (within a line) and semicolons (between lines). Each segment encodes:

1. Column in generated file
2. Index into `sources` array
3. Line in original source
4. Column in original source
5. (Optional) Index into `names` array

### Source Map Workflow

```
TypeScript sources → tsc/Babel → JavaScript → Terser → minified.js + minified.js.map
                                                                         ↓
Browser DevTools loads .map file → Shows original TypeScript in Sources panel
                                → Stack traces show original file:line
```

### Configuration

```javascript
// Webpack
module.exports = {
  devtool: "source-map",          // Full source maps (production)
  devtool: "eval-source-map",     // Fast rebuild (development)
  devtool: "hidden-source-map",   // Source map generated but not referenced
};

// Vite
export default {
  build: {
    sourcemap: true,     // Generate source maps
  },
};
```

### Security Consideration

Source maps expose your original source code. Options:
- **Don't ship them**: Generate for internal use only
- **Restrict access**: Serve `.map` files only to authenticated users
- **Upload to error tracking**: Sentry/DataDog can use them server-side
- **`hidden-source-map`**: Generates the file but doesn't add the `//# sourceMappingURL`
  comment, so browsers won't load it automatically

---

## 9. Module Systems

### CommonJS (CJS)

Node.js's original module system. **Synchronous** loading.

```javascript
// Exporting
module.exports = { add, subtract };
// or
exports.add = function(a, b) { return a + b; };

// Importing
const { add } = require("./math");
const fs = require("fs");
```

**Characteristics:**
- `require()` is a function call — can be dynamic and conditional
- Modules are loaded **synchronously** (blocking)
- Exports are **copies** (primitive values won't update)
- `require()` results are **cached** — module code runs once
- Can't be statically analyzed → no tree shaking

### ES Modules (ESM)

The standard module system, native in browsers and modern Node.js.

```javascript
// Exporting
export function add(a, b) { return a + b; }
export default class Calculator { }

// Importing
import { add } from "./math.js";
import Calculator from "./math.js";
import * as math from "./math.js";
```

**Characteristics:**
- `import`/`export` are **declarations**, not function calls
- Statically analyzable → **tree shaking works**
- Imports are **live bindings** (reference the original, not copies)
- Loaded **asynchronously** in browsers
- Module code runs in **strict mode** by default
- Top-level `await` is supported

### Loading Differences

```html
<!-- Classic script: blocks parsing, no modules -->
<script src="app.js"></script>

<!-- Module script: deferred by default, supports import/export -->
<script type="module" src="app.js"></script>

<!-- Dynamic import: loads on demand, returns Promise -->
<script>
  const module = await import("./heavy-feature.js");
</script>
```

### CJS vs ESM in Practice

```javascript
// CJS: dynamic, conditional imports are fine
if (process.env.NODE_ENV === "test") {
  const mock = require("./mock-db");
}

// ESM: imports must be top-level (static)
import { db } from "./db.js";  // Always imported

// ESM: use dynamic import() for conditional loading
if (needsFeature) {
  const { feature } = await import("./feature.js");
}
```

### Live Bindings vs Copies

```javascript
// counter.mjs (ESM)
export let count = 0;
export function increment() { count++; }

// app.mjs (ESM)
import { count, increment } from "./counter.mjs";
console.log(count);  // 0
increment();
console.log(count);  // 1 — live binding sees the update!

// counter.cjs (CJS)
let count = 0;
module.exports = { count, increment() { count++; } };

// app.cjs (CJS)
const { count, increment } = require("./counter.cjs");
console.log(count);  // 0
increment();
console.log(count);  // 0 — STILL 0! It's a copy, not a live binding.
```

---

## Key Takeaways

1. **JavaScript is JIT-compiled** — parsed → AST → bytecode → interpreted → selectively
   compiled to machine code at runtime.
2. **ASTs are the foundation** of linters, formatters, transpilers, and bundlers.
3. **Transpilation** (Babel, TypeScript) converts modern/typed code to compatible JS.
4. **Bundlers** resolve dependencies, transform code, and produce optimized output files.
5. **Tree shaking** requires ES modules and `sideEffects: false` — prefer named exports
   over classes for shakability.
6. **Minification + compression** can reduce bundle size by 90%+.
7. **Source maps** connect production code to original sources — essential for debugging.
8. **ESM > CJS** for frontend: static analysis, tree shaking, live bindings, async loading.

---

## Further Reading

- [AST Explorer](https://astexplorer.net)
- [V8 Blog: Parsing JavaScript](https://v8.dev/blog/preparser)
- [Webpack Concepts](https://webpack.js.org/concepts/)
- [Rollup Tree Shaking](https://rollupjs.org/introduction/#tree-shaking)
- [Source Maps Revision 3 Proposal](https://sourcemaps.info/spec.html)
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
