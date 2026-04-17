# Infer Keyword in TypeScript

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Syntax](#basic-syntax)
3. [Infer in Function Types](#infer-in-function-types)
4. [Infer in Arrays and Tuples](#infer-in-arrays-and-tuples)
5. [Infer in Template Literal Types](#infer-in-template-literal-types)
6. [Promise Unwrapping](#promise-unwrapping)
7. [Multiple Infer in One Conditional](#multiple-infer-in-one-conditional)
8. [Recursive Infer Patterns](#recursive-infer-patterns)
9. [Infer Constraints (TypeScript 5.x)](#infer-constraints-typescript-5x)
10. [Rebuilding Built-in Utility Types](#rebuilding-built-in-utility-types)
11. [Practical Patterns](#practical-patterns)
12. [References](#references)

---

## Introduction

The `infer` keyword lets you **extract** (or "capture") a type from within a
conditional type. It only appears inside the `extends` clause of a conditional
type and introduces a new type variable that TypeScript resolves for you.

Think of it as pattern matching for types: you describe a shape and mark the
parts you want to pull out with `infer`.

```ts
type ElementOf<T> = T extends (infer E)[] ? E : never;

type A = ElementOf<string[]>;  // string
type B = ElementOf<number[]>;  // number
type C = ElementOf<boolean>;   // never — doesn't match the pattern
```

---

## Basic Syntax

### The Conditional Type Foundation

Every use of `infer` lives inside a conditional type:

```ts
type Condition<T> = T extends SomePattern<infer U> ? U : Fallback;
```

- `T extends SomePattern<infer U>` — if `T` matches the pattern, bind the
  matched piece to `U`.
- The **true branch** (`U`) can use the inferred variable.
- The **false branch** (`Fallback`) cannot — `U` is not in scope there.

### Rules

1. `infer` can only appear in the **extends clause** of a conditional type.
2. The inferred variable is only available in the **true branch**.
3. You can have multiple `infer` declarations in the same conditional.
4. If TypeScript can't determine a unique type for the variable, it falls back
   to its constraint (or `unknown`).

```ts
// WRONG — infer outside conditional type
// type Bad = infer T;  // Error

// CORRECT
type Unbox<T> = T extends { value: infer V } ? V : T;
```

### Simple Extraction Example

```ts
type UnwrapArray<T> = T extends Array<infer E> ? E : T;

type X = UnwrapArray<string[]>;    // string
type Y = UnwrapArray<number>;      // number (false branch)
```

---

## Infer in Function Types

### Extracting the Return Type

```ts
type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never;

type R1 = MyReturnType<() => string>;           // string
type R2 = MyReturnType<(x: number) => boolean>; // boolean
type R3 = MyReturnType<string>;                 // never
```

This is exactly how the built-in `ReturnType<T>` works.

### Extracting Parameter Types

```ts
type MyParameters<T> = T extends (...args: infer P) => unknown ? P : never;

type P1 = MyParameters<(a: string, b: number) => void>;
// [a: string, b: number]

type P2 = MyParameters<() => void>;
// []
```

### Extracting the First Parameter

```ts
type FirstParam<T> = T extends (first: infer F, ...rest: unknown[]) => unknown
  ? F
  : never;

type F1 = FirstParam<(a: string, b: number) => void>; // string
```

### Extracting the `this` Parameter

```ts
type ThisParam<T> = T extends (this: infer U, ...args: never[]) => unknown
  ? U
  : unknown;

function greet(this: { name: string }) {
  return `Hello, ${this.name}`;
}

type G = ThisParam<typeof greet>; // { name: string }
```

---

## Infer in Arrays and Tuples

### First and Rest of a Tuple

```ts
type First<T extends readonly unknown[]> =
  T extends readonly [infer H, ...unknown[]] ? H : never;

type Last<T extends readonly unknown[]> =
  T extends readonly [...unknown[], infer L] ? L : never;

type Tail<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer R] ? R : never;

type A = First<[1, 2, 3]>;  // 1
type B = Last<[1, 2, 3]>;   // 3
type C = Tail<[1, 2, 3]>;   // [2, 3]
```

### Extracting Element Type from Arrays

```ts
type Flatten<T> = T extends readonly (infer E)[] ? E : T;

type F = Flatten<string[][]>; // string[] (one level)
```

### Extracting from Nested Tuples

```ts
type SecondElement<T> =
  T extends readonly [unknown, infer S, ...unknown[]] ? S : never;

type S = SecondElement<["a", "b", "c"]>; // "b"
```

---

## Infer in Template Literal Types

One of the most powerful uses of `infer` is parsing string literal types.

### Basic String Splitting

```ts
type Split<S extends string> =
  S extends `${infer Head}/${infer Tail}` ? [Head, Tail] : [S];

type R1 = Split<"a/b/c">;  // ["a", "b/c"]
type R2 = Split<"hello">;  // ["hello"]
```

### Extracting Parts of a Path

```ts
type ExtractExt<F extends string> =
  F extends `${string}.${infer Ext}` ? Ext : never;

type E1 = ExtractExt<"app.ts">;       // "ts"
type E2 = ExtractExt<"archive.tar.gz">; // "tar.gz"
```

Note: `infer` is **greedy from the left** for the `${string}` part and captures
as little as possible. The first `${string}` matches minimally when followed by
a literal, so `"archive.tar.gz"` gives `"tar.gz"` because the first `${string}`
matches `"archive"`.

### Trim Whitespace

```ts
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;

type TrimRight<S extends string> =
  S extends `${infer Rest} ` ? TrimRight<Rest> : S;

type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type T = Trim<"  hello  ">; // "hello"
```

### Replacing Substrings

```ts
type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Before}${From}${infer After}`
  ? `${Before}${To}${After}`
  : S;

type R = Replace<"hello world", "world", "TypeScript">;
// "hello TypeScript"
```

---

## Promise Unwrapping

### Single Level

```ts
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;

type A = UnwrapPromise<Promise<string>>;           // string
type B = UnwrapPromise<Promise<Promise<number>>>;  // Promise<number>
type C = UnwrapPromise<number>;                    // number
```

### Deep Unwrap (Recursive)

```ts
type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T;

type D = Awaited<Promise<Promise<Promise<boolean>>>>; // boolean
```

This is essentially how the built-in `Awaited<T>` (TS 4.5+) works.

### Unwrapping PromiseLike

```ts
type UnwrapThenable<T> =
  T extends PromiseLike<infer V> ? UnwrapThenable<V> : T;

type E = UnwrapThenable<PromiseLike<string>>; // string
```

---

## Multiple Infer in One Conditional

You can use multiple `infer` declarations in a single `extends` clause:

```ts
type Swap<T> = T extends [infer A, infer B] ? [B, A] : T;

type S = Swap<[string, number]>; // [number, string]
```

### Extracting Key-Value from an Object

```ts
type EntryOf<T> = T extends Record<infer K, infer V>
  ? [K, V]
  : never;

type KV = EntryOf<{ name: string; age: number }>;
// [string, string | number]  — K and V are widened unions
```

### Extracting Map Generics

```ts
type MapTypes<T> = T extends Map<infer K, infer V> ? { key: K; value: V } : never;

type M = MapTypes<Map<string, number>>;
// { key: string; value: number }
```

### Co-variant vs. Contra-variant Inference

When the same type variable is inferred in multiple positions:

- **Co-variant** positions (return types) produce a **union**.
- **Contra-variant** positions (parameter types) produce an **intersection**.

```ts
type CoVariant<T> = T extends { a: infer U; b: infer U } ? U : never;
type CV = CoVariant<{ a: string; b: number }>; // string | number

type ContraVariant<T> = T extends {
  f: (x: infer U) => void;
  g: (x: infer U) => void;
} ? U : never;
type CT = ContraVariant<{ f: (x: string) => void; g: (x: number) => void }>;
// string & number  (i.e. never)
```

---

## Recursive Infer Patterns

### Deep Flatten

```ts
type DeepFlatten<T> = T extends readonly (infer E)[]
  ? DeepFlatten<E>
  : T;

type F = DeepFlatten<number[][][]>; // number
```

### Recursive String Split

```ts
type SplitAll<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...SplitAll<Tail, D>]
    : [S];

type Parts = SplitAll<"a.b.c.d", ".">; // ["a", "b", "c", "d"]
```

### Reversing a Tuple

```ts
type Reverse<T extends readonly unknown[]> =
  T extends readonly [infer H, ...infer Tail]
    ? [...Reverse<Tail>, H]
    : [];

type R = Reverse<[1, 2, 3]>; // [3, 2, 1]
```

### Converting a Union to an Intersection (Advanced)

```ts
type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends
    (k: infer I) => void ? I : never;

type I = UnionToIntersection<{ a: 1 } | { b: 2 }>;
// { a: 1 } & { b: 2 }
```

This leverages the contra-variant inference behavior.

---

## Infer Constraints (TypeScript 5.x)

TypeScript 4.7+ introduced the ability to add constraints directly on `infer`:

```ts
infer T extends SomeType
```

This narrows the inferred type to only match if it extends `SomeType`. It is
especially useful to ensure the inferred type is usable immediately.

### Before (Without Constraints)

```ts
type OldGetString<T> = T extends { value: infer V }
  ? V extends string
    ? V
    : never
  : never;
```

### After (With Constraints)

```ts
type GetString<T> = T extends { value: infer V extends string } ? V : never;

type A = GetString<{ value: "hello" }>; // "hello"
type B = GetString<{ value: 42 }>;      // never
```

### Extracting Specific Kinds

```ts
type NumberKeys<T> = keyof T extends infer K extends string
  ? K
  : never;

// Ensure inferred element is a specific type
type FirstNumber<T> =
  T extends readonly [infer H extends number, ...unknown[]] ? H : never;

type N = FirstNumber<[42, "a", true]>; // 42
type X = FirstNumber<["a", 2, true]>;  // never — "a" doesn't extend number
```

### Template Literal with Constraints

```ts
type ParseInt<S> = S extends `${infer N extends number}` ? N : never;

type A = ParseInt<"42">;    // 42 (the number literal type!)
type B = ParseInt<"hello">; // never
```

This is incredibly powerful: it converts string literal types to number literal
types at the type level.

---

## Rebuilding Built-in Utility Types

Understanding `infer` lets you rebuild TypeScript's built-in conditional types.

### ReturnType

```ts
type MyReturnType<T extends (...args: never[]) => unknown> =
  T extends (...args: never[]) => infer R ? R : never;
```

### Parameters

```ts
type MyParameters<T extends (...args: never[]) => unknown> =
  T extends (...args: infer P) => unknown ? P : never;
```

### ConstructorParameters

```ts
type MyConstructorParameters<T extends abstract new (...args: never[]) => unknown> =
  T extends abstract new (...args: infer P) => unknown ? P : never;

class User {
  constructor(public name: string, public age: number) {}
}

type CP = MyConstructorParameters<typeof User>; // [name: string, age: number]
```

### InstanceType

```ts
type MyInstanceType<T extends abstract new (...args: never[]) => unknown> =
  T extends abstract new (...args: never[]) => infer R ? R : never;

type U = MyInstanceType<typeof User>; // User
```

### Awaited (Simplified)

```ts
type MyAwaited<T> =
  T extends null | undefined ? T :
  T extends object & { then(onfulfilled: infer F, ...args: infer _): unknown }
    ? F extends (value: infer V, ...args: infer _) => unknown
      ? MyAwaited<V>
      : never
    : T;
```

---

## Practical Patterns

### Extracting Route Parameters

Given a route pattern like `"/users/:id/posts/:postId"`, extract the parameter
names as a union type:

```ts
type ExtractParams<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : S extends `${string}:${infer Param}`
      ? Param
      : never;

type RouteParams = ExtractParams<"/users/:id/posts/:postId">;
// "id" | "postId"

// Build a typed params object
type ParamsObject<S extends string> = {
  [K in ExtractParams<S>]: string;
};

type UserPostParams = ParamsObject<"/users/:id/posts/:postId">;
// { id: string; postId: string }
```

### JSON Schema Type Extraction

Map a JSON-schema-like descriptor to TypeScript types:

```ts
interface SchemaString { type: "string" }
interface SchemaNumber { type: "number" }
interface SchemaBoolean { type: "boolean" }
interface SchemaObject<P extends Record<string, SchemaType>> {
  type: "object";
  properties: P;
}
interface SchemaArray<I extends SchemaType> {
  type: "array";
  items: I;
}

type SchemaType =
  | SchemaString
  | SchemaNumber
  | SchemaBoolean
  | SchemaObject<Record<string, SchemaType>>
  | SchemaArray<SchemaType>;

type Resolve<T extends SchemaType> =
  T extends SchemaString ? string :
  T extends SchemaNumber ? number :
  T extends SchemaBoolean ? boolean :
  T extends SchemaArray<infer I> ? Resolve<I>[] :
  T extends SchemaObject<infer P> ? { [K in keyof P]: Resolve<P[K] & SchemaType> } :
  never;

// Usage
type UserSchema = SchemaObject<{
  name: SchemaString;
  age: SchemaNumber;
  active: SchemaBoolean;
}>;

type UserType = Resolve<UserSchema>;
// { name: string; age: number; active: boolean }
```

### Event Emitter Type Extraction

```ts
type EventMap = {
  click: [x: number, y: number];
  change: [value: string];
  load: [];
};

type EventHandler<T extends Record<string, unknown[]>> = {
  on<K extends keyof T>(
    event: K,
    handler: (...args: T[K]) => void
  ): void;
};

// Extract the handler type for a specific event
type HandlerFor<T, E extends string> =
  T extends { on(event: E, handler: infer H): void } ? H : never;

type ClickHandler = HandlerFor<EventHandler<EventMap>, "click">;
// (x: number, y: number) => void
```

### Deep Property Access

```ts
type Get<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? Get<T[Key], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

type Nested = { a: { b: { c: number } } };

type C = Get<Nested, "a.b.c">; // number
type B = Get<Nested, "a.b">;   // { c: number }
```

---

## Summary

| Pattern | Use Case |
|---|---|
| `T extends (infer E)[]` | Extract array element type |
| `T extends (...args: infer P) => infer R` | Extract function params/return |
| `T extends Promise<infer V>` | Unwrap Promise |
| `` T extends `${infer A}.${infer B}` `` | Parse string literal types |
| `T extends [infer H, ...infer T]` | Destructure tuples |
| `infer T extends U` (TS 5.x) | Constrained inference |
| Recursive conditionals with `infer` | Deep flatten, split, etc. |

### Key Takeaways

1. `infer` is **pattern matching** for types.
2. It only works inside `extends` in a conditional type.
3. The inferred variable is only available in the **true branch**.
4. Multiple `infer` with the same name: co-variant = union, contra-variant = intersection.
5. TS 5.x constraints (`infer T extends U`) eliminate nested conditionals.
6. Recursive patterns with `infer` enable deep type transformations.

---

## References

- [TypeScript Handbook - Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook - Inferring Within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)
- [TypeScript 4.7 Release Notes - `extends` Constraints on `infer`](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#extends-constraints-on-infer-type-variables)
- Config: `ES2022`, `strict`, `ESNext` modules
- Run with: `npx tsx exercises.ts` / `npx tsx solutions.ts`
