# Strict Mode Config

## Overview

TypeScript's strict mode is a collection of compiler flags that enforce stronger type
checking. Understanding these flags — and the broader `tsconfig.json` configuration —
is essential for writing safe, maintainable TypeScript.

This module covers:

- The structure of `tsconfig.json`
- Every flag enabled by `strict: true`
- Additional safety flags beyond strict
- Module resolution and path mapping
- Project references and incremental compilation
- Migration strategies from JavaScript to strict TypeScript

---

## Running the Exercises

```bash
# Run exercises (all test code is commented out)
npx tsx exercises.ts

# Run solutions
npx tsx solutions.ts
```

---

## 1. tsconfig.json Structure

A `tsconfig.json` file lives at the root of a TypeScript project and controls how the
compiler behaves. It has several top-level properties:

```jsonc
{
  "compilerOptions": {
    // Type checking, module resolution, output, etc.
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
  "extends": "./tsconfig.base.json",
  "references": [{ "path": "./packages/core" }]
}
```

### Key Top-Level Fields

| Field              | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `compilerOptions`  | The bulk of configuration — type checking, output, etc.  |
| `include`          | Glob patterns for files to include                       |
| `exclude`          | Glob patterns for files to exclude                       |
| `files`            | Explicit list of files (overrides include/exclude)       |
| `extends`          | Inherit from another tsconfig                            |
| `references`       | Project references for monorepo setups                   |

### Extending Configs

You can create a base config and extend it:

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

// tsconfig.json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

---

## 2. The `strict` Flag

Setting `"strict": true` enables **all** of the following flags at once:

```jsonc
{
  "compilerOptions": {
    "strict": true
    // Equivalent to enabling ALL of the following:
    // "strictNullChecks": true,
    // "strictFunctionTypes": true,
    // "strictBindCallApply": true,
    // "strictPropertyInitialization": true,
    // "noImplicitAny": true,
    // "noImplicitThis": true,
    // "alwaysStrict": true,
    // "useUnknownInCatchVariables": true
  }
}
```

You can enable `strict` and then selectively **disable** individual flags:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "strictPropertyInitialization": false  // opt out of this one
  }
}
```

### 2.1 strictNullChecks

Without this flag, `null` and `undefined` are assignable to every type. With it
enabled, they are only assignable to `void`, their own types, and `unknown`.

```typescript
// strictNullChecks: true
let name: string = "Alice";
name = null;      // Error: Type 'null' is not assignable to type 'string'
name = undefined; // Error: Type 'undefined' is not assignable to type 'string'

// You must explicitly allow null/undefined:
let maybeName: string | null = null; // OK
```

This is widely considered the **single most important** strict flag. It catches an
enormous class of runtime errors — the "billion dollar mistake" of null references.

#### Narrowing with strictNullChecks

```typescript
function greet(name: string | null): string {
  // Must narrow before using as string
  if (name === null) {
    return "Hello, stranger!";
  }
  return `Hello, ${name.toUpperCase()}!`; // OK — name is string here
}
```

### 2.2 strictFunctionTypes

Enables **contravariant** checking of function parameter types. Without it, function
parameters are checked **bivariantly** (unsound).

```typescript
type Handler = (event: MouseEvent) => void;

// strictFunctionTypes: true
const handler: Handler = (event: Event) => {
  // Error: Type '(event: Event) => void' is not assignable to type 'Handler'.
  // 'Event' is not assignable to 'MouseEvent'.
  console.log(event);
};
```

This matters for callbacks. A function expecting a `MouseEvent` should not accept a
handler that only knows about `Event`, because the caller will pass a `MouseEvent`
and the handler might miss mouse-specific properties.

**Exception**: Method declarations (`method(x: T)`) are still checked bivariantly.
Only function properties (`method: (x: T) => void`) get contravariant checking.

### 2.3 strictBindCallApply

Ensures that `bind`, `call`, and `apply` are type-checked correctly.

```typescript
function multiply(a: number, b: number): number {
  return a * b;
}

// strictBindCallApply: true
multiply.call(undefined, "5", 2);
// Error: Argument of type 'string' is not assignable to parameter of type 'number'.

const bound = multiply.bind(undefined, 10);
bound(5);    // OK — returns 50
bound("5");  // Error
```

### 2.4 strictPropertyInitialization

Class properties must be initialized in the constructor or at declaration.

```typescript
class User {
  name: string;  // Error: Property 'name' has no initializer
  age: number;

  constructor(name: string) {
    this.name = name;
    // Error: Property 'age' is not assigned in the constructor
  }
}

// Fix options:
class UserFixed {
  name: string;
  age: number = 0;               // Default value
  email?: string;                 // Optional — can be undefined
  nickname!: string;              // Definite assignment assertion (use sparingly)

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
```

The `!` (definite assignment assertion) tells TypeScript "trust me, this will be
assigned before use." Use it only when you genuinely know initialization happens
outside the constructor (e.g., via a framework).

### 2.5 noImplicitAny

Raises an error when TypeScript cannot infer a type and would fall back to `any`.

```typescript
// noImplicitAny: true
function process(data) {
  //              ^^^^
  // Error: Parameter 'data' implicitly has an 'any' type.
  return data.length;
}

// Fix: add explicit type
function processFixed(data: string): number {
  return data.length;
}
```

This flag forces you to be explicit about types wherever inference falls short,
preventing `any` from silently spreading through your codebase.

### 2.6 noImplicitThis

Errors when `this` has an implicit `any` type.

```typescript
// noImplicitThis: true
class Timer {
  seconds = 0;

  start() {
    setInterval(function () {
      this.seconds++;
      // Error: 'this' implicitly has type 'any' because it does not have a type annotation.
    }, 1000);
  }

  // Fix: use arrow function
  startFixed() {
    setInterval(() => {
      this.seconds++; // OK — arrow function captures outer 'this'
    }, 1000);
  }
}
```

You can also use an explicit `this` parameter:

```typescript
function handleClick(this: HTMLButtonElement, event: Event) {
  this.disabled = true; // OK — 'this' is typed
}
```

### 2.7 alwaysStrict

Emits `"use strict"` at the top of every output file and parses in strict mode.
This enables JavaScript's strict mode, which catches silent errors like assigning
to undeclared variables.

With ES modules (`"module": "ESNext"`), files are automatically in strict mode,
so this flag is redundant but harmless.

### 2.8 useUnknownInCatchVariables

Added in TypeScript 4.4. Makes caught errors typed as `unknown` instead of `any`.

```typescript
// useUnknownInCatchVariables: true
try {
  throw new Error("fail");
} catch (err) {
  // err is 'unknown', not 'any'
  console.log(err.message);
  // Error: 'err' is of type 'unknown'.

  // Must narrow:
  if (err instanceof Error) {
    console.log(err.message); // OK
  }
}
```

This is important because anything can be thrown in JavaScript — not just `Error`
objects. A `throw "oops"` or `throw 42` would break `err.message`.

---

## 3. Additional Important Flags

These flags are **not** enabled by `strict: true` but are highly recommended.

### 3.1 noUncheckedIndexedAccess

Adds `undefined` to the type of every index access.

```typescript
// noUncheckedIndexedAccess: true
const scores: number[] = [90, 85, 77];
const first: number = scores[0];
// Error: Type 'number | undefined' is not assignable to type 'number'.

// Must handle:
const first2 = scores[0];
if (first2 !== undefined) {
  console.log(first2.toFixed(2)); // OK
}

// Also applies to objects with index signatures:
const config: Record<string, string> = { host: "localhost" };
const host: string = config["host"];
// Error: Type 'string | undefined' is not assignable to type 'string'.
```

This catches a very common source of runtime errors — accessing an array index
or object key that might not exist.

### 3.2 exactOptionalPropertyTypes

Differentiates between `undefined` as a value and a missing property.

```typescript
// exactOptionalPropertyTypes: true
interface Settings {
  theme?: "light" | "dark";
}

const settings: Settings = { theme: undefined };
// Error: Type 'undefined' is not assignable to type '"light" | "dark"'.
// With exactOptionalPropertyTypes, optional means "missing" not "undefined".

const settingsOk: Settings = {}; // OK — property is absent
```

This matters when you use `"key" in obj` or `Object.keys()` — an explicitly set
`undefined` value and a missing key behave differently.

### 3.3 noImplicitReturns

Errors when a function with a return type has code paths that don't return.

```typescript
// noImplicitReturns: true
function getLabel(code: number): string {
  if (code === 1) {
    return "one";
  }
  // Error: Not all code paths return a value.
}
```

### 3.4 noFallthroughCasesInSwitch

Prevents fall-through in `switch` cases that have code.

```typescript
// noFallthroughCasesInSwitch: true
function handle(action: string): void {
  switch (action) {
    case "start":
      console.log("starting");
      // Error: Fallthrough case in switch.
    case "stop":
      console.log("stopping");
      break;
  }
}
```

Empty cases can still fall through (intentional grouping):

```typescript
switch (action) {
  case "start":
  case "begin":  // OK — empty fall-through
    console.log("starting");
    break;
}
```

### 3.5 noImplicitOverride

Requires the `override` keyword when overriding base class methods.

```typescript
// noImplicitOverride: true
class Base {
  greet() { return "hello"; }
}

class Derived extends Base {
  greet() { return "hi"; }
  // Error: This member must have an 'override' modifier because it
  // overrides a member in the base class 'Base'.
}

class DerivedFixed extends Base {
  override greet() { return "hi"; } // OK
}
```

This catches cases where a base class method is renamed and subclasses silently
stop overriding it.

---

## 4. Module Resolution Options

### 4.1 target

The ECMAScript version for emitted JavaScript.

| Value     | Features available                           |
| --------- | -------------------------------------------- |
| `ES5`     | No arrow functions, no `class`, no `async`   |
| `ES2015`  | Classes, arrow functions, Promises            |
| `ES2020`  | Optional chaining, nullish coalescing         |
| `ES2022`  | Top-level await, class fields, `cause` in Error |
| `ESNext`  | Latest — moves with each TS release          |

`ES2022` is a solid default for Node.js 18+ projects.

### 4.2 module

Determines the module system for emitted code.

| Value          | Output format                              |
| -------------- | ------------------------------------------ |
| `CommonJS`     | `require()` / `module.exports`             |
| `ESNext`       | `import` / `export`                        |
| `Node16`       | Hybrid — respects `package.json` `"type"`  |
| `NodeNext`     | Same as Node16, follows Node.js releases   |
| `Preserve`     | Keep imports as-is (TS 5.4+)               |

For modern projects, `ESNext` or `NodeNext` are recommended.

### 4.3 moduleResolution

How TypeScript resolves `import` specifiers to files.

| Value      | Behavior                                              |
| ---------- | ----------------------------------------------------- |
| `node`     | Classic Node.js algorithm (CJS-style)                 |
| `node16`   | Node.js 16+ algorithm (respects `exports` in pkg.json)|
| `nodenext` | Same as node16, follows Node.js releases              |
| `bundler`  | For use with bundlers (Vite, webpack, esbuild)        |

`bundler` is appropriate when a bundler handles resolution. `nodenext` is for
direct Node.js execution.

---

## 5. Path Mapping

### 5.1 baseUrl and paths

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@utils/*": ["./src/utils/*"],
      "@models/*": ["./src/models/*"]
    }
  }
}
```

With this config:

```typescript
// Instead of:
import { User } from "../../../models/user";

// You can write:
import { User } from "@models/user";
```

**Important**: `paths` only affects TypeScript's type resolution. You still need
a runtime resolver (e.g., `tsconfig-paths`, bundler aliases, or Node.js
`--experimental-specifier-resolution`).

### 5.2 rootDir and rootDirs

- `rootDir` — The root directory of source files. Affects output structure in `outDir`.
- `rootDirs` — Treat multiple directories as one virtual root (useful for generated code).

```jsonc
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

---

## 6. Project References

For monorepos or large codebases, project references allow you to split your
codebase into smaller TypeScript projects that reference each other.

### 6.1 Setup

```jsonc
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,      // Required for referenced projects
    "declaration": true,    // Required by composite
    "declarationMap": true, // Enables go-to-definition across projects
    "outDir": "./dist"
  },
  "include": ["src"]
}

// packages/app/tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist"
  },
  "references": [
    { "path": "../core" }
  ],
  "include": ["src"]
}

// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

### 6.2 Building

```bash
# Build all projects in dependency order
tsc --build

# Build with verbose output
tsc --build --verbose

# Clean build artifacts
tsc --build --clean
```

### 6.3 composite Flag

When `composite: true` is set:

- `declaration` must be `true`
- All source files must be matched by `include` or listed in `files`
- TypeScript generates `.tsbuildinfo` files for incremental builds

---

## 7. Incremental Compilation

```jsonc
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

TypeScript saves a `.tsbuildinfo` file that records which files have changed.
On subsequent compilations, only changed files (and their dependents) are
recompiled. This can dramatically speed up builds.

For project references, incremental is automatic when `composite: true`.

---

## 8. Migration Strategy: JavaScript to Strict TypeScript

### Phase 1: Add TypeScript with No Checking

```jsonc
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

Rename files from `.js` to `.ts` one at a time. Everything compiles because
strict checks are off.

### Phase 2: Enable checkJs

```jsonc
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,     // Now JS files are type-checked
    "strict": false
  }
}
```

Fix errors in JS files using JSDoc annotations or by converting to `.ts`.

### Phase 3: Enable Strict Flags Incrementally

Enable one flag at a time and fix errors before moving to the next:

```jsonc
// Round 1
{ "noImplicitAny": true }

// Round 2
{ "noImplicitAny": true, "strictNullChecks": true }

// Round 3
{ "noImplicitAny": true, "strictNullChecks": true, "strictFunctionTypes": true }

// ... continue until all flags are on, then switch to:
{ "strict": true }
```

### Phase 4: Enable Additional Flags

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitOverride": true
}
```

### Tips for Migration

1. **Use `// @ts-expect-error`** for known issues you'll fix later — it errors
   when the suppressed error is fixed, so you won't forget.
2. **Avoid `// @ts-ignore`** — it silently suppresses errors forever.
3. **Use `@ts-check` / `@ts-nocheck`** per-file to control checking granularity.
4. **Start with leaf modules** — files with no imports from your codebase.
5. **Track progress** — count remaining `any` types and `@ts-expect-error` comments.

---

## 9. Recommended Strict Config

A solid starting config for a modern Node.js project:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## References

- [TypeScript tsconfig Reference](https://www.typescriptlang.org/tsconfig)
- [TypeScript Strict Mode](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#strictness)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Incremental Compilation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#faster-subsequent-builds-with-the---incremental-flag)
