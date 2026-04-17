# Type Annotations

> **Refs**: [TS Handbook – Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) · [MDN – JS Data Structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)

## Table of Contents

1. [What Are Type Annotations](#1-what-are-type-annotations)
2. [Primitive Types](#2-primitive-types)
3. [Special Types](#3-special-types)
4. [Arrays](#4-arrays)
5. [Tuples](#5-tuples)
6. [Object Types](#6-object-types)
7. [Function Types](#7-function-types)
8. [Arrow Function Type Annotations](#8-arrow-function-type-annotations)
9. [Type Assertions](#9-type-assertions)
10. [Literal Types](#10-literal-types)
11. [typeof in Type Position](#11-typeof-in-type-position)
12. [Type Inference](#12-type-inference)
13. [null and undefined](#13-null-and-undefined)
14. [Template Literal Types](#14-template-literal-types)

---

## 1. What Are Type Annotations

Type annotations explicitly declare a binding's type using `identifier: Type` syntax.

```typescript
let username: string = "Alice";   // explicit annotation
let city = "Tokyo";               // inferred as string — annotation unnecessary
```

**When to annotate**: function parameters (always), return types (recommended for APIs),
uninitialized variables, ambiguous expressions.
**When not to**: simple initialized variables — inference handles them.

```typescript
// Necessary — parameters are never inferred from the body
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Necessary — no initializer
let result: number;
```

---

## 2. Primitive Types

```typescript
// string
let firstName: string = "Alice";
let greeting: string = `Hello, ${firstName}`;

// number — no int/float distinction; includes Infinity and NaN
let age: number = 30;
let hex: number = 0xff;

// boolean
let isReady: boolean = true;

// bigint — separate from number, cannot mix in arithmetic (requires ES2020+)
let huge: bigint = 100n;

// symbol — each Symbol() is unique
let id: symbol = Symbol("id");
const MY_KEY: unique symbol = Symbol("MY_KEY"); // unique symbol for const only
```

---

## 3. Special Types

### any — disables type checking (avoid)

```typescript
let x: any = 42;
x = "hello";
x.anything(); // no error — dangerous
```

### unknown — type-safe alternative, requires narrowing

```typescript
let val: unknown = 42;
// val.toFixed(); // Error
if (typeof val === "number") val.toFixed(2); // OK after narrowing
```

### never — values that never occur

```typescript
function throwError(msg: string): never { throw new Error(msg); }

// Exhaustiveness checking:
type Dir = "N" | "S";
function go(d: Dir) {
  switch (d) {
    case "N": return;
    case "S": return;
    default: const _: never = d; // compile error if a case is missing
  }
}
```

### void, undefined, null

```typescript
function log(msg: string): void { console.log(msg); }

let u: undefined = undefined;
let n: null = null;
// With strictNullChecks, null/undefined are NOT assignable to other types
let name: string | null = null; // must use union explicitly
```

---

## 4. Arrays

```typescript
let nums: number[] = [1, 2, 3];           // bracket syntax (preferred)
let strs: Array<string> = ["a", "b"];      // generic syntax (equivalent)
let matrix: number[][] = [[1, 2], [3, 4]];
let mixed: (string | number)[] = [1, "two"];

// Readonly — removes push, pop, splice, etc.
let ids: readonly number[] = [1, 2, 3];
let names: ReadonlyArray<string> = ["Alice"];
```

---

## 5. Tuples

Fixed-length arrays with per-position types.

```typescript
let pair: [string, number] = ["Alice", 30];
let name: string = pair[0];  // typed correctly per position

// Labeled (documentation only, no runtime effect)
type UserEntry = [name: string, age: number, active: boolean];

// Optional elements (must be trailing)
type Point = [x: number, y: number, z?: number];
let p2: Point = [1, 2];
let p3: Point = [1, 2, 3];

// Rest elements
type Row = [string, ...number[]];
let data: Row = ["scores", 90, 85, 92];

// Readonly
let pt: readonly [number, number] = [10, 20];
```

---

## 6. Object Types

```typescript
// Inline
function printUser(user: { name: string; age: number }): void {
  console.log(`${user.name} is ${user.age}`);
}

// Optional properties — type becomes T | undefined
function connect(cfg: { host: string; port?: number }): void {
  const port = cfg.port ?? 3000;
}

// Readonly
function process(user: { readonly id: number; name: string }): void {
  // user.id = 1; // Error
}

// Index signatures
let scores: { [key: string]: number } = { math: 90 };
```

**Excess property checks**: object literals are checked for extra properties;
assigning through a variable bypasses this check.

---

## 7. Function Types

```typescript
// Parameters must always be annotated
function add(a: number, b: number): number { return a + b; }

// Return type can be inferred but explicit is recommended for APIs
function divide(a: number, b: number) { return a / b; } // inferred: number

// Optional and default parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

// Rest parameters
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Function type expressions
type MathOp = (a: number, b: number) => number;
const sub: MathOp = (a, b) => a - b;
```

### void vs undefined return

A callback typed `() => void` is allowed to return any value (return is ignored).
A function *declared* with `: void` cannot return a value.

```typescript
type Cb = () => void;
const fn: Cb = () => 42;    // OK — callback, return ignored
const r: void = fn();       // r is void at compile time, 42 at runtime

function work(): void {
  // return 42; // Error — declared void, cannot return value
}
```

---

## 8. Arrow Function Type Annotations

```typescript
const double = (n: number): number => n * 2;

// Object literal return requires parens
const makeUser = (name: string): { name: string } => ({ name });

// Generic arrow function
const identity = <T>(value: T): T => value;

// Contextual typing from a type alias — no need to annotate params
type Predicate = (value: number) => boolean;
const isPositive: Predicate = (value) => value > 0;
```

---

## 9. Type Assertions

Compile-time only — no runtime conversion.

```typescript
// `as` syntax (preferred)
const input = document.getElementById("name") as HTMLInputElement;

// Angle-bracket syntax (cannot use in .tsx)
const el = <HTMLInputElement>document.getElementById("name");

// Assertions must be "reasonable" — use double-assert for forced casts
// let x = "hello" as number;           // Error
let x = "hello" as unknown as number;   // Compiles (dangerous)
```

### const assertions

`as const` → deeply readonly, literal types preserved.

```typescript
const config = { host: "localhost", port: 3000 } as const;
// Type: { readonly host: "localhost"; readonly port: 3000 }
```

### Non-null assertion (`!`)

```typescript
function len(s: string | null): number {
  return s!.length; // asserts s is not null — prefer proper checks
}
```

---

## 10. Literal Types

```typescript
let dir: "north" | "south" | "east" | "west" = "north";
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
```

### Literal inference and widening

```typescript
const m = "GET";    // type: "GET" (const → literal)
let m2 = "GET";     // type: string (let → widened)

// Fixes for passing to a literal parameter:
let m3 = "GET" as const;                          // literal via as const
let m4: "GET" | "POST" = "GET";                   // literal via annotation
const m5 = "GET";                                  // literal via const
```

### `as const` on arrays/objects

```typescript
const COLORS = ["red", "green", "blue"] as const;
type Color = (typeof COLORS)[number]; // "red" | "green" | "blue"
```

---

## 11. typeof in Type Position

```typescript
const cfg = { host: "localhost", port: 3000, debug: false };
type Config = typeof cfg; // { host: string; port: number; debug: boolean }

function add(a: number, b: number) { return a + b; }
type AddFn = typeof add; // (a: number, b: number) => number

// Combined with as const
const STATUSES = ["active", "pending"] as const;
type Status = (typeof STATUSES)[number]; // "active" | "pending"
```

`typeof` only works on identifiers and their properties, not on expressions.

---

## 12. Type Inference

```typescript
let x = 10;              // number
let arr = [1, "a", true]; // (string | number | boolean)[]
```

### Contextual typing

```typescript
["a", "b"].forEach((s) => {
  console.log(s.toUpperCase()); // s inferred as string from context
});
```

### Guidelines

| Situation | Annotate? |
|-----------|-----------|
| Variable with literal initializer | No |
| Function parameter | Always |
| Return type (public API) | Recommended |
| Uninitialized variable | Always |
| Empty array `[]` | Yes |
| Callback params with context | No |

---

## 13. null and undefined

### strictNullChecks (enabled by `strict: true`)

`null` and `undefined` are not assignable to other types without explicit union.

### Optional chaining (`?.`)

```typescript
type User = { address?: { city: string; zip?: string } };
function getZip(u: User): string | undefined {
  return u.address?.zip;
}
```

### Nullish coalescing (`??`)

```typescript
function port(p: number | null): number { return p ?? 3000; }
port(0);    // 0 — unlike ||, ?? only triggers on null/undefined
```

### Narrowing with control flow

```typescript
function fmt(name: string | null): string {
  if (name === null) return "Anonymous";
  return name.toUpperCase(); // narrowed to string
}
```

---

## 14. Template Literal Types

```typescript
type Greeting = `Hello, ${string}`;
let g: Greeting = "Hello, Alice"; // OK

type Color = "red" | "green";
type Size = "sm" | "lg";
type Class = `${Size}-${Color}`; // "sm-red" | "sm-green" | "lg-red" | "lg-green"

type Event = "click" | "focus";
type Handler = `on${Capitalize<Event>}`; // "onClick" | "onFocus"
```

Intrinsic string types: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`.

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Annotations | `identifier: Type` — use when inference isn't enough |
| Primitives | `string`, `number`, `boolean`, `bigint`, `symbol` |
| `any` / `unknown` | Avoid `any`; use `unknown` + narrowing |
| `never` / `void` | `never` = impossible; `void` = no return value |
| Arrays | `T[]`, `readonly T[]` |
| Tuples | `[T, U]`, labeled, optional, rest elements |
| Objects | Inline `{ k: T }`, optional `?`, `readonly` |
| Functions | Always annotate params; return type recommended |
| Assertions | `as T`, `as const`, `!` (use sparingly) |
| Literals | Exact values as types; `const` / `as const` for narrowing |
| Inference | Let TS infer simple cases; annotate for clarity |
| Null safety | `?.`, `??`, control flow narrowing |

---

**Next**: [02-type-aliases-and-interfaces](../02-type-aliases-and-interfaces/)
