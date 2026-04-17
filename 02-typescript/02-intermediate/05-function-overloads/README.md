# Function Overloads in TypeScript

## Table of Contents

1. [What Are Function Overloads](#1-what-are-function-overloads)
2. [Overload Signatures vs Implementation Signature](#2-overload-signatures-vs-implementation-signature)
3. [Writing Good Overloads](#3-writing-good-overloads)
4. [Overload Resolution](#4-overload-resolution)
5. [When to Use Overloads vs Unions](#5-when-to-use-overloads-vs-unions)
6. [Method Overloads](#6-method-overloads)
7. [Constructor Overloads](#7-constructor-overloads)
8. [Generic Overloads](#8-generic-overloads)
9. [The `this` Parameter in Overloads](#9-the-this-parameter-in-overloads)
10. [Common Patterns](#10-common-patterns)
11. [Pitfalls](#11-pitfalls)
12. [Alternatives to Overloads](#12-alternatives-to-overloads)

---

## 1. What Are Function Overloads

Function overloads let you declare **multiple call signatures** for a single function.
The function can then accept different combinations of parameter types and return
different types depending on how it is called.

In many languages overloads mean separate function bodies. In TypeScript there is
only **one implementation** — the overload signatures exist purely for the type
checker and documentation.

```ts
// Two overload signatures
function greet(name: string): string;
function greet(names: string[]): string[];

// One implementation signature + body
function greet(input: string | string[]): string | string[] {
  if (typeof input === "string") {
    return `Hello, ${input}!`;
  }
  return input.map((n) => `Hello, ${n}!`);
}

const single = greet("Alice");   // string
const multi = greet(["A", "B"]); // string[]
```

Key idea: callers see the overload signatures, never the implementation signature.

---

## 2. Overload Signatures vs Implementation Signature

An overloaded function has two kinds of signature:

| Kind | Visible to callers? | Has a body? |
|------|---------------------|-------------|
| Overload signature | Yes | No |
| Implementation signature | **No** | Yes |

```ts
function toDate(timestamp: number): Date;
function toDate(dateStr: string): Date;
// Implementation signature — NOT callable directly with its full union
function toDate(input: number | string): Date {
  if (typeof input === "number") {
    return new Date(input);
  }
  return new Date(input);
}

toDate(123456789);   // OK — matches first overload
toDate("2024-01-01"); // OK — matches second overload
// toDate(true);      // Error — no overload matches
```

The implementation signature **must** be compatible with every overload signature,
but callers cannot invoke the function using the implementation signature's wider
union type directly. Each call must match one of the declared overload signatures.

```ts
function example(a: string): string;
function example(a: number): number;
function example(a: string | number): string | number {
  return a;
}

// This is NOT allowed even though the implementation accepts it:
// const val: string | number = "hi";
// example(val); // Error — no overload matches `string | number`
```

---

## 3. Writing Good Overloads

### Rule: the implementation must be compatible with all overloads

Every overload's parameter types must be assignable to the implementation's
parameter types, and every overload's return type must be assignable to the
implementation's return type.

```ts
// ✅ Correct — implementation covers both overloads
function len(s: string): number;
function len(arr: unknown[]): number;
function len(x: string | unknown[]): number {
  return x.length;
}
```

```ts
// ❌ Wrong — implementation parameter is too narrow
function len(s: string): number;
function len(arr: unknown[]): number;
// @ts-expect-error — `string` doesn't cover `unknown[]`
function len(x: string): number {
  return x.length;
}
```

### Rule: keep overloads minimal

Each overload should represent a genuinely distinct call pattern. If two overloads
differ only slightly, consider whether a union parameter would be simpler.

### Rule: prefer fewer overloads with clearer types

```ts
// Excessive — four overloads for what is really one pattern
function pad(s: string, n: number): string;
function pad(s: string, n: number, char: string): string;
function pad(s: string, n: number, char: string, direction: "left"): string;
function pad(s: string, n: number, char: string, direction: "right"): string;

// Better — use optional params and a union
function pad(
  s: string,
  n: number,
  char?: string,
  direction?: "left" | "right"
): string;
```

---

## 4. Overload Resolution

TypeScript resolves overloads **top to bottom** and picks the **first** matching
signature. Order matters.

```ts
function format(value: string): string;   // #1
function format(value: number): string;   // #2
function format(value: boolean): string;  // #3
function format(value: string | number | boolean): string {
  return String(value);
}

format("hi");  // matches #1
format(42);    // matches #2
format(true);  // matches #3
```

### Ordering pitfall

If a broader signature appears before a narrower one, the narrow overload is
unreachable:

```ts
function process(input: unknown): string;  // Too broad — catches everything
function process(input: number): number;   // ⚠️ Never reached
function process(input: unknown): string | number {
  if (typeof input === "number") return input * 2;
  return String(input);
}

const r = process(42); // TypeScript sees `string`, not `number`!
```

**Always list the most specific overloads first.**

---

## 5. When to Use Overloads vs Unions

The TypeScript Handbook recommends: **prefer union parameters when possible**.

### When unions are better

If every overload takes the same number of parameters and returns the same type,
a union parameter is simpler:

```ts
// Overloaded — unnecessarily complex
function getLength(s: string): number;
function getLength(arr: unknown[]): number;
function getLength(x: string | unknown[]): number {
  return x.length;
}

// Simpler union — same behavior, less code
function getLength(x: string | unknown[]): number {
  return x.length;
}
```

With the union version, callers can pass `string | unknown[]` directly — which
is impossible with overloads.

### When overloads are necessary

Overloads are the right tool when the **return type depends on the input type**:

```ts
function parse(input: string): string[];
function parse(input: string[]): string[][];
function parse(input: string | string[]): string[] | string[][] {
  if (typeof input === "string") {
    return input.split(",");
  }
  return input.map((s) => s.split(","));
}

const a = parse("a,b");       // string[]
const b = parse(["a,b", "c"]); // string[][]
```

Without overloads, the caller would get `string[] | string[][]` and need to
narrow the return type themselves.

---

## 6. Method Overloads

Overloads work in classes and interfaces the same way.

### Class method overloads

```ts
class Formatter {
  format(value: string): string;
  format(value: number): string;
  format(value: string | number): string {
    return `[${String(value)}]`;
  }
}

const f = new Formatter();
f.format("hello"); // string
f.format(42);      // string
```

### Interface method overloads

```ts
interface StringUtils {
  reverse(s: string): string;
  reverse(arr: string[]): string[];
}

const utils: StringUtils = {
  reverse(input: string | string[]): string | string[] {
    if (typeof input === "string") {
      return input.split("").reverse().join("");
    }
    return [...input].reverse();
  },
};
```

### Abstract method overloads

```ts
abstract class Parser {
  abstract parse(raw: string): object;
  abstract parse(raw: Buffer): object;
}
```

---

## 7. Constructor Overloads

Class constructors can be overloaded just like methods:

```ts
class Point {
  x: number;
  y: number;

  constructor(x: number, y: number);
  constructor(coords: [number, number]);
  constructor(xOrCoords: number | [number, number], y?: number) {
    if (Array.isArray(xOrCoords)) {
      this.x = xOrCoords[0];
      this.y = xOrCoords[1];
    } else {
      this.x = xOrCoords;
      this.y = y!;
    }
  }
}

const p1 = new Point(1, 2);
const p2 = new Point([3, 4]);
```

Constructor overloads are common in wrapper classes and factory-like patterns
where the class can be initialized from different shapes of data.

---

## 8. Generic Overloads

Overload signatures can have their own type parameters:

```ts
function first(arr: string[]): string;
function first(arr: number[]): number;
function first<T>(arr: T[]): T;
function first<T>(arr: T[]): T {
  return arr[0];
}
```

A more practical example — returning different types based on a generic
constraint:

```ts
function wrap<T extends string>(value: T): { text: T };
function wrap<T extends number>(value: T): { num: T };
function wrap<T extends string | number>(
  value: T
): { text: T } | { num: T } {
  if (typeof value === "string") {
    return { text: value } as { text: T };
  }
  return { num: value } as { num: T };
}

const a = wrap("hi");  // { text: "hi" }
const b = wrap(42);    // { num: 42 }
```

Note: generic overloads can get complex quickly. Often a conditional return type
is a cleaner alternative (see section 12).

---

## 9. The `this` Parameter in Overloads

TypeScript allows a special `this` parameter in function signatures. It can be
combined with overloads:

```ts
interface EventEmitter {
  on(this: EventEmitter, event: "click", handler: (x: number, y: number) => void): void;
  on(this: EventEmitter, event: "keypress", handler: (key: string) => void): void;
  on(this: EventEmitter, event: string, handler: (...args: unknown[]) => void): void;
}
```

The `this` parameter is erased at runtime — it only constrains the calling
context for the type checker.

```ts
class Button implements EventEmitter {
  on(event: "click", handler: (x: number, y: number) => void): void;
  on(event: "keypress", handler: (key: string) => void): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  on(event: string, handler: (...args: unknown[]) => void): void {
    // register handler...
  }
}

const btn = new Button();
btn.on("click", (x, y) => console.log(x, y));       // x: number, y: number
btn.on("keypress", (key) => console.log(key));        // key: string
```

---

## 10. Common Patterns

### Pattern 1: different return type based on input type

```ts
function toArray(value: string): string[];
function toArray(value: number): number[];
function toArray(value: string | number): string[] | number[] {
  if (typeof value === "string") return value.split("");
  return [value];
}
```

### Pattern 2: different return type based on a literal argument

```ts
function createElement(tag: "a"): HTMLAnchorElement;
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: string): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}
```

### Pattern 3: optional parameters that change the return type

```ts
function fetchUser(id: number): Promise<User>;
function fetchUser(id: number, withPosts: true): Promise<UserWithPosts>;
function fetchUser(
  id: number,
  withPosts?: boolean
): Promise<User | UserWithPosts> {
  // ...
}

interface User { name: string }
interface UserWithPosts extends User { posts: string[] }
```

### Pattern 4: callback shape depends on options

```ts
function readFile(path: string, encoding: "utf8"): string;
function readFile(path: string): Buffer;
function readFile(path: string, encoding?: string): string | Buffer {
  // ...
}
```

---

## 11. Pitfalls

### Pitfall 1: too many overloads

More than 3-4 overloads is usually a code smell. Consider alternative designs
like an options object, conditional types, or generics.

### Pitfall 2: implementation signature visible to callers

A common mistake is assuming callers can use the implementation signature:

```ts
function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: number | string, b: number | string): number | string {
  // ...
}

// Error — no overload matches (number, string)
// add(1, "two");
```

### Pitfall 3: incorrect ordering

As shown in section 4, always put specific overloads before general ones.

### Pitfall 4: incompatible implementation

```ts
function double(x: number): number;
function double(x: string): string;
// The implementation must accept ALL overload parameter types
// and return ALL overload return types.
function double(x: number | string): number | string {
  if (typeof x === "number") return x * 2;
  return x.repeat(2);
}
```

### Pitfall 5: overloads with rest parameters

Be careful mixing rest parameters with overloads — the implementation must
handle all possible argument shapes:

```ts
function log(message: string): void;
function log(message: string, ...data: unknown[]): void;
function log(message: string, ...data: unknown[]): void {
  console.log(message, ...data);
}
```

---

## 12. Alternatives to Overloads

### Alternative 1: conditional return types

Instead of multiple overloads, use a conditional type:

```ts
type DoubleReturn<T> = T extends string ? string : number;

function double<T extends string | number>(x: T): DoubleReturn<T>;
function double(x: string | number): string | number {
  if (typeof x === "string") return x.repeat(2);
  return x * 2;
}

const a = double("hi"); // string
const b = double(42);   // number
```

This scales better than listing every combination as an overload.

### Alternative 2: discriminated union as parameter

Instead of overloading, accept a tagged union:

```ts
type CreateRequest =
  | { kind: "user"; name: string }
  | { kind: "post"; title: string; body: string };

function create(req: CreateRequest): string {
  switch (req.kind) {
    case "user":
      return `Created user: ${req.name}`;
    case "post":
      return `Created post: ${req.title}`;
  }
}
```

### Alternative 3: options object

```ts
interface FetchOptions {
  id: number;
  withPosts?: boolean;
  withComments?: boolean;
}

function fetchUser(options: FetchOptions): Promise<User> {
  // ...
}
```

### When to pick which

| Approach | Best for |
|----------|----------|
| Overloads | Return type varies by input type; wrapping existing JS APIs |
| Conditional types | Same pattern but many type combinations |
| Discriminated unions | Different data shapes, same function |
| Options object | Many optional configuration flags |

---

## Summary

- Overloads = multiple **call signatures**, one **implementation**.
- The implementation signature is **not visible** to callers.
- TypeScript resolves overloads **top-to-bottom** — put specific signatures first.
- **Prefer unions** over overloads when the return type is the same.
- Use overloads when the **return type depends on the input type**.
- For complex mappings, consider **conditional return types** instead.

---

## References

- [TypeScript Handbook — More on Functions: Function Overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
