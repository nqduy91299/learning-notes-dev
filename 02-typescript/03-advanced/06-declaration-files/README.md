# Declaration Files in TypeScript

## Table of Contents

1. [What Are Declaration Files (.d.ts)?](#what-are-declaration-files-dts)
2. [When and Why Are They Needed?](#when-and-why-are-they-needed)
3. [The `declare` Keyword](#the-declare-keyword)
4. [Ambient Declarations](#ambient-declarations)
5. [Triple-Slash Directives](#triple-slash-directives)
6. [Module Declarations (`declare module`)](#module-declarations-declare-module)
7. [Global Augmentation (`declare global`)](#global-augmentation-declare-global)
8. [Module Augmentation](#module-augmentation)
9. [DefinitelyTyped and @types Packages](#definitelytyped-and-types-packages)
10. [Writing .d.ts Files for JavaScript Libraries](#writing-dts-files-for-javascript-libraries)
11. [Declaration Merging](#declaration-merging)
12. [Namespace Merging](#namespace-merging)
13. [Generating .d.ts from TypeScript Code](#generating-dts-from-typescript-code)
14. [typeRoots and types Configuration](#typeroots-and-types-configuration)
15. [Best Practices](#best-practices)

---

## What Are Declaration Files (.d.ts)?

Declaration files are TypeScript files that contain **only type information** and no
runtime code. They have the `.d.ts` extension and describe the shape of JavaScript
code to the TypeScript compiler without producing any JavaScript output.

```typescript
// math-utils.d.ts — a declaration file
declare function add(a: number, b: number): number;
declare function subtract(a: number, b: number): number;
declare const PI: number;
```

Key characteristics:

- They contain **no implementation**, only type signatures
- They produce **no JavaScript output** when compiled
- They use the `declare` keyword to describe values that exist at runtime
- They act as a bridge between untyped JavaScript and TypeScript's type system

Think of `.d.ts` files as "header files" — they tell TypeScript what exists and what
types things have, without defining the actual behavior.

---

## When and Why Are They Needed?

Declaration files are needed in several scenarios:

### 1. Using JavaScript Libraries Without Types

When you import a JS library that has no TypeScript support, the compiler has no
idea what types the exports have. A `.d.ts` file fills that gap.

### 2. Publishing TypeScript Libraries

When you compile a `.ts` library to `.js` for distribution, you generate `.d.ts`
files so consumers get type information without needing your source.

### 3. Describing Global Variables

Browser APIs, Node.js globals, or variables injected by a script tag (e.g.,
`google.maps`) need ambient declarations so TypeScript knows they exist.

### 4. Extending Existing Types

You can augment modules or global scope to add properties that plugins or
middleware inject at runtime.

### 5. Typing Legacy Code

Large JavaScript codebases being gradually migrated to TypeScript use `.d.ts`
files to type existing JS modules without rewriting them.

---

## The `declare` Keyword

The `declare` keyword tells TypeScript: "this thing exists at runtime, trust me,
but I'm not defining it here." It creates **ambient declarations** — type-only
descriptions of runtime values.

### Declaring Variables

```typescript
// Some global variable exists (e.g., injected by a <script> tag)
declare const API_URL: string;
declare let currentUser: { name: string; id: number };
declare var DEBUG: boolean; // var = global scope in .d.ts
```

### Declaring Functions

```typescript
declare function fetch(url: string, init?: RequestInit): Promise<Response>;

// Overloaded function
declare function createElement(tag: "div"): HTMLDivElement;
declare function createElement(tag: "span"): HTMLSpanElement;
declare function createElement(tag: string): HTMLElement;
```

### Declaring Classes

```typescript
declare class EventEmitter {
  on(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): boolean;
  removeAllListeners(event?: string): this;
}
```

### Declaring Modules

```typescript
declare module "lodash" {
  export function chunk<T>(array: T[], size: number): T[][];
  export function compact<T>(array: (T | null | undefined | false | 0 | "")[]): T[];
}
```

### Declaring Namespaces

```typescript
declare namespace Express {
  interface Request {
    user?: { id: string; role: string };
  }
}
```

---

## Ambient Declarations

Ambient declarations describe entities that exist in the runtime environment but
are not defined in the current TypeScript compilation. Everything in a `.d.ts` file
is ambient by default.

In a regular `.ts` file, you use `declare` to create ambient declarations:

```typescript
// In a .ts file — tells TS this exists at runtime
declare const __dirname: string;
declare const __filename: string;

// Ambient enum — values exist at runtime
declare enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

Important rules:

- Ambient declarations **cannot have initializers** (no `= value`)
- Ambient function declarations **cannot have bodies**
- Ambient class declarations **cannot have method implementations**
- A file with only `declare` statements and no imports/exports is treated as a
  **global script**, making its declarations available everywhere

---

## Triple-Slash Directives

Triple-slash directives are single-line comments at the top of a file that serve
as compiler instructions. They must appear before any statements.

### `/// <reference path="..." />`

References another declaration file. Used before ES modules were common:

```typescript
/// <reference path="./global.d.ts" />
/// <reference path="./utils.d.ts" />

declare function processData(data: GlobalData): UtilResult;
```

### `/// <reference types="..." />`

References an `@types` package or type package by name:

```typescript
/// <reference types="node" />
/// <reference types="jest" />

// Now Node.js and Jest types are available
```

### `/// <reference lib="..." />`

References a built-in lib declaration:

```typescript
/// <reference lib="es2022" />
/// <reference lib="dom" />
```

**Modern alternative:** In most projects, `tsconfig.json` handles these via
`compilerOptions.types` and `compilerOptions.lib`. Triple-slash directives are
mainly needed in `.d.ts` files or special scenarios.

---

## Module Declarations (`declare module`)

`declare module` lets you describe the shape of a module that TypeScript can't
find types for.

### Typing an Untyped npm Package

```typescript
// If "image-resize" has no types:
declare module "image-resize" {
  interface ResizeOptions {
    width: number;
    height: number;
    quality?: number;
  }

  export function resize(path: string, options: ResizeOptions): Promise<Buffer>;
  export function getInfo(path: string): Promise<{ width: number; height: number }>;
}
```

### Wildcard Module Declarations

For non-code imports like CSS, images, or JSON:

```typescript
// Allow importing .css files
declare module "*.css" {
  const classes: Record<string, string>;
  export default classes;
}

// Allow importing .png files
declare module "*.png" {
  const src: string;
  export default src;
}

// Allow importing .svg as React components
declare module "*.svg" {
  const content: string;
  export default content;
}
```

### Shorthand Module Declarations

When you just want to silence errors without full typing:

```typescript
// All imports from this module will be typed as `any`
declare module "some-untyped-lib";
```

This is a quick fix but sacrifices all type safety. Prefer full declarations.

---

## Global Augmentation (`declare global`)

Inside a module file (a file with `import` or `export`), you can use
`declare global` to add declarations to the global scope.

### Adding Properties to `globalThis`

```typescript
export {}; // Makes this a module

declare global {
  var APP_VERSION: string;
  var IS_PRODUCTION: boolean;

  function logMetric(name: string, value: number): void;
}

// Now these are available globally without import
console.log(APP_VERSION);
```

### Extending Built-in Interfaces

```typescript
export {};

declare global {
  interface Array<T> {
    toShuffled(): T[];
  }

  interface String {
    toTitleCase(): string;
  }

  interface Window {
    analytics: {
      track(event: string, data: Record<string, unknown>): void;
    };
  }
}
```

### Adding to `process.env`

```typescript
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
}
```

**Important:** `declare global` only works in module files (files with at least
one `import` or `export` statement). In a non-module `.d.ts` file, everything
is already global.

---

## Module Augmentation

Module augmentation lets you add new declarations to an existing module from
a separate file. This is how you extend third-party libraries with additional
types.

### Extending a Third-Party Module

```typescript
// Augment Express with custom properties
import { Request } from "express";

declare module "express" {
  interface Request {
    userId?: string;
    sessionId?: string;
  }
}

// Now Request has userId and sessionId
function handler(req: Request) {
  console.log(req.userId); // OK
}
```

### How It Works

1. TypeScript uses **declaration merging** — when two declarations share the
   same name, their members are combined
2. The `declare module "x"` block must appear in a module file (with imports
   or exports) to be treated as augmentation rather than replacement
3. You can add new properties to interfaces, but you **cannot override**
   existing types or remove members
4. You **cannot** add new top-level exports via augmentation in all cases —
   this is a limitation

### Augmenting Default Exports

You can augment the default export's type if it's an interface or class:

```typescript
import dayjs from "dayjs";

declare module "dayjs" {
  interface Dayjs {
    toCustomFormat(): string;
  }
}
```

---

## DefinitelyTyped and @types Packages

[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) is a
massive repository of community-maintained declaration files for JavaScript
packages that don't ship their own types.

### How It Works

- Types are published to npm under the `@types` scope
- `@types/lodash` provides types for `lodash`
- `@types/express` provides types for `express`

### Installing Type Packages

```bash
npm install --save-dev @types/lodash
npm install --save-dev @types/express
npm install --save-dev @types/node
```

### Automatic Type Acquisition

By default, TypeScript automatically includes `@types` packages found in
`node_modules/@types`. You can control this with `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

When `types` is specified, **only** listed packages are included. Omit it
to include everything in `@types`.

### Package Bundled Types

Many modern packages ship their own `.d.ts` files and don't need `@types`:

```json
// package.json of a typed library
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

Check for a `types` or `typings` field in `package.json` to know if a
library ships its own declarations.

---

## Writing .d.ts Files for JavaScript Libraries

When you need to type a library that has no types available:

### Step 1: Identify the API Surface

```javascript
// The JS library (math-helpers.js)
exports.add = (a, b) => a + b;
exports.multiply = (a, b) => a * b;
exports.PI = 3.14159;
exports.createCalculator = (precision) => ({
  round: (n) => Number(n.toFixed(precision)),
});
```

### Step 2: Write the Declaration File

```typescript
// math-helpers.d.ts
export declare function add(a: number, b: number): number;
export declare function multiply(a: number, b: number): number;
export declare const PI: number;

interface Calculator {
  round(n: number): number;
}

export declare function createCalculator(precision: number): Calculator;
```

### Step 3: Handling Different Module Formats

For CommonJS default export patterns:

```typescript
// For: module.exports = function myLib() { ... }
declare function myLib(options: MyLibOptions): MyLibInstance;

interface MyLibOptions {
  debug?: boolean;
}

interface MyLibInstance {
  start(): void;
  stop(): void;
}

export = myLib;
```

### Tips for Writing Declarations

- Start with the public API only — don't type internals
- Use `unknown` instead of `any` where possible
- Use generics for functions that preserve input types
- Use overloads for functions with multiple call signatures
- Add JSDoc comments for documentation

---

## Declaration Merging

Declaration merging is TypeScript's process of combining multiple declarations
with the same name into a single definition. This is fundamental to how `.d.ts`
files and module augmentation work.

### Interface Merging

The most common form — two interfaces with the same name merge their members:

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// Result: User has both name and age
const user: User = { name: "Alice", age: 30 };
```

### Rules for Interface Merging

- Non-function members must be unique, or must have identical types
- Function members become overloads (later declarations have higher priority)
- Generic interfaces merge only if they have identical type parameters

```typescript
interface Document {
  createElement(tag: string): HTMLElement;
}

interface Document {
  createElement(tag: "div"): HTMLDivElement;
  createElement(tag: "span"): HTMLSpanElement;
}

// Resulting overload order:
// 1. createElement(tag: "div"): HTMLDivElement     (from later declaration)
// 2. createElement(tag: "span"): HTMLSpanElement   (from later declaration)
// 3. createElement(tag: string): HTMLElement        (from earlier declaration)
```

### What Can Merge With What

| Declaration    | Namespace | Class | Function | Enum | Interface | Type Alias |
|----------------|-----------|-------|----------|------|-----------|------------|
| **Namespace**  | Yes       | Yes   | Yes      | Yes  | -         | -          |
| **Class**      | Yes       | No    | -        | No   | Yes       | No         |
| **Function**   | Yes       | -     | No       | -    | -         | -          |
| **Enum**       | Yes       | No    | -        | Yes  | -         | -          |
| **Interface**  | -         | Yes   | -        | -    | Yes       | -          |
| **Type Alias** | -         | No    | -        | -    | -         | No         |

Type aliases **never merge**. Defining the same type alias twice is an error.

---

## Namespace Merging

Namespaces can merge with other namespaces, classes, functions, and enums to
create rich combined declarations.

### Namespace + Function

Adds static properties to a function:

```typescript
function buildUrl(path: string): string {
  return buildUrl.baseUrl + path;
}

namespace buildUrl {
  export let baseUrl: string = "https://api.example.com";
  export function withQuery(path: string, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();
    return buildUrl(path) + "?" + query;
  }
}

buildUrl("/users");                              // function call
buildUrl.baseUrl;                                // namespace property
buildUrl.withQuery("/search", { q: "hello" });   // namespace function
```

### Namespace + Class

Adds static members or inner types to a class:

```typescript
class Validator {
  validate(input: string): boolean {
    return input.length > 0;
  }
}

namespace Validator {
  export interface Options {
    strict: boolean;
    maxLength: number;
  }

  export function create(options: Options): Validator {
    return new Validator();
  }
}

const opts: Validator.Options = { strict: true, maxLength: 100 };
const v = Validator.create(opts);
```

### Namespace + Enum

Adds additional members to an enum:

```typescript
enum Color {
  Red,
  Green,
  Blue,
}

namespace Color {
  export function fromHex(hex: string): Color {
    // parsing logic
    return Color.Red;
  }
}

Color.fromHex("#ff0000"); // namespace function
Color.Red;                // enum member
```

---

## Generating .d.ts from TypeScript Code

When publishing a TypeScript library, you generate `.d.ts` files so JavaScript
consumers get type information.

### Using the Compiler

```json
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist/types",
    "emitDeclarationOnly": false,
    "outDir": "./dist"
  }
}
```

Key options:

| Option                | Purpose                                         |
|-----------------------|-------------------------------------------------|
| `declaration`         | Generate `.d.ts` files alongside `.js` files    |
| `declarationDir`      | Output directory for `.d.ts` files              |
| `emitDeclarationOnly` | Only emit `.d.ts`, no `.js` (useful with bundlers) |
| `declarationMap`      | Generate `.d.ts.map` for IDE "go to definition" |

### Running Generation

```bash
npx tsc --declaration --emitDeclarationOnly
```

### Package.json Setup for Published Libraries

```json
{
  "name": "my-library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

---

## typeRoots and types Configuration

These `tsconfig.json` options control which declaration files TypeScript includes
automatically.

### `typeRoots`

Specifies directories to search for type packages. Default: `["node_modules/@types"]`.

```json
{
  "compilerOptions": {
    "typeRoots": [
      "./custom-types",
      "./node_modules/@types"
    ]
  }
}
```

When `typeRoots` is set, **only** the specified directories are searched. If you
override it, include `node_modules/@types` explicitly if you still want `@types`
packages.

### `types`

Specifies which packages from `typeRoots` to include. By default, all packages
in `typeRoots` directories are included.

```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

When `types` is set, **only** listed packages are included. This prevents
unwanted global type pollution.

### When to Use Each

| Scenario                                | Use                  |
|-----------------------------------------|----------------------|
| Custom type directory                   | `typeRoots`          |
| Limit which @types are auto-included    | `types`              |
| Project has conflicting global types    | `types` to pick one  |
| Monorepo with shared types              | `typeRoots`          |

### Important Notes

- `types` affects **auto-inclusion** only. Explicit `import` always works
  regardless of `types` config.
- Both options only affect global declarations. Module declarations (with
  `export`) are resolved by module resolution, not `types`/`typeRoots`.

---

## Best Practices

### Do

- Use `unknown` over `any` in declaration files
- Provide generics where the library preserves types
- Use overloads for functions with multiple signatures
- Include JSDoc comments for documentation
- Test your declarations by writing code that uses them
- Use `export =` for CommonJS modules that use `module.exports =`
- Generate declarations from source when possible (`declaration: true`)

### Don't

- Don't use `any` as a shortcut — it defeats the purpose
- Don't declare things as `Function` — use proper signatures
- Don't put implementation code in `.d.ts` files
- Don't use `/// <reference>` when `import` works
- Don't forget `export {}` when using `declare global` in a `.ts` file
- Don't confuse module augmentation (in module files) with module declaration
  (in script files)

### Debugging Tips

- If augmentation doesn't work, check that the file has an `import` or `export`
- If global types aren't visible, check that the file is a script (no imports/exports)
  or uses `declare global`
- Use `tsc --listFiles` to see which declaration files are being included
- Use `tsc --traceResolution` to debug module resolution issues

---

## References

- [TypeScript Handbook: Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [TypeScript Handbook: Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [DefinitelyTyped Repository](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [TypeScript: Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [TypeScript tsconfig: types and typeRoots](https://www.typescriptlang.org/tsconfig#types)
