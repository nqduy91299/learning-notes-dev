# Conditional Types in TypeScript

## Table of Contents

1. [Introduction](#introduction)
2. [The `extends` Keyword in Type Position](#the-extends-keyword-in-type-position)
3. [Conditional Type Syntax](#conditional-type-syntax)
4. [Conditional Types with Generics](#conditional-types-with-generics)
5. [Distributive Conditional Types](#distributive-conditional-types)
6. [Preventing Distribution](#preventing-distribution)
7. [The `infer` Keyword](#the-infer-keyword)
8. [Nested Conditional Types](#nested-conditional-types)
9. [Built-in Utility Types Using Conditional Types](#built-in-utility-types-using-conditional-types)
10. [Practical Patterns](#practical-patterns)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)
13. [References](#references)

---

## Introduction

Conditional types are one of the most powerful features in TypeScript's type system.
They let you express **non-uniform type mappings** -- types that depend on a condition
evaluated at compile time. Think of them as ternary expressions (`? :`) but operating
on types rather than values.

Conditional types were introduced in TypeScript 2.8 and form the foundation of many
built-in utility types such as `Exclude`, `Extract`, `NonNullable`, `ReturnType`,
and `Parameters`.

### Prerequisites

- Familiarity with TypeScript generics
- Understanding of union and intersection types
- Basic knowledge of the `extends` keyword for interfaces/classes

### What You Will Learn

- How to write conditional type expressions
- How distribution over unions works (and how to prevent it)
- How to use `infer` to extract types from structures
- How to build real-world utility types from scratch

---

## The `extends` Keyword in Type Position

Before diving into conditional types, it is essential to understand what `extends`
means when used in a **type position** (as opposed to class inheritance).

### `extends` in Classes

In a class context, `extends` means "inherits from":

```typescript
class Animal {
  name: string = "";
}

class Dog extends Animal {
  bark() {
    console.log("Woof!");
  }
}
```

### `extends` in Generics (Constraints)

In a generic context, `extends` constrains a type parameter:

```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");     // OK -- string has .length
getLength([1, 2, 3]);   // OK -- array has .length
// getLength(42);        // Error -- number has no .length
```

### `extends` as a Type-Level Test

In a conditional type, `extends` acts as a **subtype check**. It asks:
"Is type `T` assignable to type `U`?"

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
type C = IsString<string>;   // true
```

The key insight: `T extends U` evaluates to `true` when every value of type `T`
is also a valid value of type `U`. This is the **assignability** relationship.

### Assignability Examples

| Expression                    | Result  | Reason                                  |
| ----------------------------- | ------- | --------------------------------------- |
| `"hello" extends string`      | `true`  | Literal is assignable to its base type  |
| `string extends "hello"`      | `false` | Not every string is `"hello"`           |
| `Dog extends Animal`          | `true`  | Subtype is assignable to supertype      |
| `Animal extends Dog`          | `false` | Supertype lacks subtype members         |
| `string extends string`       | `true`  | A type is assignable to itself          |
| `never extends string`        | `true`  | `never` is assignable to everything     |
| `string extends unknown`      | `true`  | Everything is assignable to `unknown`   |

---

## Conditional Type Syntax

The basic syntax mirrors a ternary expression:

```
T extends U ? X : Y
```

- **`T`** -- the type being checked
- **`U`** -- the type being checked against
- **`X`** -- the type returned if `T extends U` is true (the "true branch")
- **`Y`** -- the type returned if `T extends U` is false (the "false branch")

### Simple Examples

```typescript
// Check if a type is an array
type IsArray<T> = T extends unknown[] ? true : false;

type R1 = IsArray<number[]>;    // true
type R2 = IsArray<string>;      // false
type R3 = IsArray<[1, 2, 3]>;   // true (tuples extend arrays)

// Return different types based on input
type StringOrNumber<T> = T extends string ? string : number;

type R4 = StringOrNumber<"hello">;  // string
type R5 = StringOrNumber<42>;       // number
```

### Type Aliases vs Inline

Conditional types can be used inline, but are most commonly defined as type aliases:

```typescript
// Inline (less readable)
function process<T>(value: T): T extends string ? string : number {
  // Implementation requires type assertion
  return (typeof value === "string" ? value.toUpperCase() : 42) as
    T extends string ? string : number;
}

// Type alias (preferred)
type ProcessResult<T> = T extends string ? string : number;
```

> **Note**: Using conditional types as function return types often requires type
> assertions inside the function body, because TypeScript cannot narrow generic
> type parameters through control flow analysis.

---

## Conditional Types with Generics

Conditional types become truly powerful when combined with generics. The type
parameter acts as a variable that gets resolved when the generic is instantiated.

### Generic Conditional Type Patterns

```typescript
// Flatten nested arrays by one level
type Flatten<T> = T extends Array<infer U> ? U : T;

type R1 = Flatten<number[]>;      // number
type R2 = Flatten<string[][]>;    // string[]
type R3 = Flatten<boolean>;       // boolean (not an array, returned as-is)

// Wrap a type in a Promise only if it isn't already one
type EnsurePromise<T> = T extends Promise<unknown> ? T : Promise<T>;

type R4 = EnsurePromise<string>;           // Promise<string>
type R5 = EnsurePromise<Promise<number>>;  // Promise<number>
```

### Constraining the Generic Parameter

You can combine `extends` constraints on the generic itself with conditional types:

```typescript
type MessageOf<T extends { message: unknown }> =
  T extends { message: infer M } ? M : never;

interface Email {
  message: string;
}

interface Alert {
  message: number;
}

type EmailMessage = MessageOf<Email>;  // string
type AlertMessage = MessageOf<Alert>;  // number
```

A more flexible version that doesn't require the constraint:

```typescript
type MessageOf2<T> = T extends { message: infer M } ? M : never;

type R6 = MessageOf2<Email>;   // string
type R7 = MessageOf2<number>;  // never (number has no `message`)
```

---

## Distributive Conditional Types

This is one of the most important (and initially confusing) aspects of conditional
types. When a conditional type acts on a **naked type parameter** and that parameter
is instantiated with a **union type**, the conditional type is **distributed** over
each member of the union.

### The Distribution Rule

Given:

```typescript
type ToArray<T> = T extends unknown ? T[] : never;
```

When `T` is a union:

```typescript
type R = ToArray<string | number>;
```

TypeScript does NOT evaluate this as:

```
(string | number) extends unknown ? (string | number)[] : never
// Would give: (string | number)[]
```

Instead, it **distributes** -- applying the conditional to each union member:

```
(string extends unknown ? string[] : never) |
(number extends unknown ? number[] : never)
// Gives: string[] | number[]
```

### Distribution in Action

```typescript
type ToArray<T> = T extends unknown ? T[] : never;

type R1 = ToArray<string | number>;  // string[] | number[]
type R2 = ToArray<string>;           // string[]
type R3 = ToArray<never>;            // never (empty union distributes to never)
```

### What "Naked" Means

Distribution only happens when the type parameter appears **naked** (unwrapped)
in the `extends` clause. If the type parameter is wrapped in any type constructor,
distribution does not occur.

```typescript
// Naked -- distributes
type D1<T> = T extends string ? "yes" : "no";

// Not naked -- does NOT distribute
type D2<T> = [T] extends [string] ? "yes" : "no";

type R1 = D1<string | number>;  // "yes" | "no"
type R2 = D2<string | number>;  // "no"
```

In `D1`, `T` is naked so each member of the union is checked individually.
In `D2`, `T` is wrapped in a tuple `[T]`, so the entire union is checked at once.

### Why Distribution Matters

Distribution is what makes utility types like `Exclude` and `Extract` work:

```typescript
type Exclude<T, U> = T extends U ? never : T;

type R = Exclude<"a" | "b" | "c", "a">;
// Distributes:
//   ("a" extends "a" ? never : "a") |
//   ("b" extends "a" ? never : "b") |
//   ("c" extends "a" ? never : "c")
// = never | "b" | "c"
// = "b" | "c"
```

---

## Preventing Distribution

Sometimes you want to check the **entire union** rather than distributing. You can
prevent distribution by wrapping both sides of the `extends` clause in a tuple.

### The `[T] extends [U]` Pattern

```typescript
// Distributive version
type IsStringDist<T> = T extends string ? true : false;

// Non-distributive version
type IsStringNoDist<T> = [T] extends [string] ? true : false;

type R1 = IsStringDist<string | number>;    // true | false = boolean
type R2 = IsStringNoDist<string | number>;  // false
```

### Practical Use Case: Checking for `never`

One of the most common uses of non-distributive conditionals is checking for `never`.
Because `never` is the empty union, distribution over it produces `never` directly:

```typescript
// BROKEN: always returns never when T is never
type IsNeverBad<T> = T extends never ? true : false;
type R1 = IsNeverBad<never>;  // never (not true!)

// CORRECT: wrap to prevent distribution
type IsNever<T> = [T] extends [never] ? true : false;
type R2 = IsNever<never>;     // true
type R3 = IsNever<string>;    // false
```

### Practical Use Case: Checking for Exact Union

```typescript
type IsExactlyStringOrNumber<T> =
  [T] extends [string | number]
    ? [string | number] extends [T]
      ? true
      : false
    : false;

type R1 = IsExactlyStringOrNumber<string | number>;  // true
type R2 = IsExactlyStringOrNumber<string>;            // false
```

---

## The `infer` Keyword

The `infer` keyword lets you **declare a type variable** within the `extends` clause
of a conditional type. TypeScript will infer what that variable should be based on
the structure of the type being checked.

### Basic Syntax

```typescript
type ElementType<T> = T extends Array<infer E> ? E : T;

type R1 = ElementType<number[]>;    // number
type R2 = ElementType<string[]>;    // string
type R3 = ElementType<boolean>;     // boolean (not an array)
```

Here `infer E` says: "If `T` is an array, figure out what the element type `E` is
and return it."

### Inferring Function Types

```typescript
// Infer the return type of a function
type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never;

type R1 = MyReturnType<() => string>;              // string
type R2 = MyReturnType<(x: number) => boolean>;    // boolean
type R3 = MyReturnType<string>;                    // never

// Infer the parameter types
type MyParameters<T> = T extends (...args: infer P) => unknown ? P : never;

type R4 = MyParameters<(a: string, b: number) => void>;  // [a: string, b: number]
```

### Inferring from Complex Structures

```typescript
// Infer the resolved type of a Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type R1 = UnwrapPromise<Promise<string>>;  // string
type R2 = UnwrapPromise<number>;           // number

// Infer parts of a string literal type
type FirstChar<T> = T extends `${infer F}${string}` ? F : never;

type R3 = FirstChar<"hello">;  // "h"
type R4 = FirstChar<"">;       // never

// Infer from object shapes
type GetProperty<T, K extends string> =
  T extends Record<K, infer V> ? V : never;

type R5 = GetProperty<{ name: string; age: number }, "name">;  // string
```

### Multiple `infer` Positions

You can use `infer` multiple times in a single conditional:

```typescript
type FirstAndLast<T> =
  T extends [infer F, ...unknown[], infer L]
    ? { first: F; last: L }
    : never;

type R1 = FirstAndLast<[1, 2, 3]>;        // { first: 1; last: 3 }
type R2 = FirstAndLast<["a", "b"]>;        // { first: "a"; last: "b" }
type R3 = FirstAndLast<[1]>;               // never (need at least 2 elements)
```

### `infer` with Constraints (TypeScript 4.7+)

You can add an `extends` constraint to an `infer` clause:

```typescript
type FirstString<T> =
  T extends [infer F extends string, ...unknown[]] ? F : never;

type R1 = FirstString<["hello", 42]>;   // "hello"
type R2 = FirstString<[42, "hello"]>;   // never (first element isn't string)
```

---

## Nested Conditional Types

Conditional types can be nested to create multi-branch type logic:

```typescript
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type R1 = TypeName<string>;       // "string"
type R2 = TypeName<number[]>;     // "object"
type R3 = TypeName<() => void>;   // "function"
type R4 = TypeName<undefined>;    // "undefined"
```

### Nested `infer` with Recursive Unwrapping

```typescript
// Deeply unwrap nested Promises
type DeepUnwrapPromise<T> =
  T extends Promise<infer U>
    ? DeepUnwrapPromise<U>
    : T;

type R1 = DeepUnwrapPromise<Promise<Promise<Promise<string>>>>;  // string
type R2 = DeepUnwrapPromise<Promise<number>>;                    // number
type R3 = DeepUnwrapPromise<string>;                             // string
```

### Multi-Level Pattern Matching

```typescript
type ParseValue<T> =
  T extends `${infer N extends number}`
    ? N
    : T extends "true" | "false"
      ? boolean
      : T extends "null"
        ? null
        : string;

type R1 = ParseValue<"42">;     // 42
type R2 = ParseValue<"true">;   // boolean
type R3 = ParseValue<"null">;   // null
type R4 = ParseValue<"hello">;  // string
```

---

## Built-in Utility Types Using Conditional Types

TypeScript ships with several utility types built on conditional types. Understanding
how they work helps you build your own.

### `Exclude<T, U>`

Removes from `T` all members assignable to `U`:

```typescript
// Implementation
type MyExclude<T, U> = T extends U ? never : T;

type R1 = MyExclude<"a" | "b" | "c", "a">;           // "b" | "c"
type R2 = MyExclude<string | number | boolean, string>; // number | boolean
```

Distribution trace for `R1`:

```
"a" extends "a" ? never : "a"  =>  never
"b" extends "a" ? never : "b"  =>  "b"
"c" extends "a" ? never : "c"  =>  "c"
Result: never | "b" | "c" = "b" | "c"
```

### `Extract<T, U>`

Keeps only the members of `T` that are assignable to `U`:

```typescript
// Implementation
type MyExtract<T, U> = T extends U ? T : never;

type R1 = MyExtract<"a" | "b" | "c", "a" | "c">;  // "a" | "c"
type R2 = MyExtract<string | number | (() => void), Function>;  // () => void
```

### `NonNullable<T>`

Removes `null` and `undefined` from `T`:

```typescript
// Implementation
type MyNonNullable<T> = T extends null | undefined ? never : T;

type R1 = MyNonNullable<string | null | undefined>;  // string
type R2 = MyNonNullable<number | null>;               // number
type R3 = MyNonNullable<null | undefined>;            // never
```

### `ReturnType<T>`

Extracts the return type of a function type:

```typescript
// Implementation
type MyReturnType<T extends (...args: never[]) => unknown> =
  T extends (...args: never[]) => infer R ? R : never;

type R1 = MyReturnType<() => string>;           // string
type R2 = MyReturnType<(x: number) => void>;    // void
```

### `Parameters<T>`

Extracts the parameter types of a function as a tuple:

```typescript
// Implementation
type MyParameters<T extends (...args: never[]) => unknown> =
  T extends (...args: infer P) => unknown ? P : never;

type R1 = MyParameters<(a: string, b: number) => void>;  // [a: string, b: number]
```

### `InstanceType<T>`

Extracts the instance type of a constructor function:

```typescript
// Implementation
type MyInstanceType<T extends abstract new (...args: unknown[]) => unknown> =
  T extends abstract new (...args: unknown[]) => infer R ? R : never;

class Foo {
  x = 10;
}
type R1 = MyInstanceType<typeof Foo>;  // Foo
```

---

## Practical Patterns

### Pattern 1: Unwrapping Promises (Deep)

```typescript
type Awaited<T> =
  T extends null | undefined ? T :
  T extends object & { then(onfulfilled: infer F, ...args: unknown[]): unknown }
    ? F extends (value: infer V, ...args: unknown[]) => unknown
      ? Awaited<V>
      : never
    : T;

type R1 = Awaited<Promise<string>>;                    // string
type R2 = Awaited<Promise<Promise<number>>>;           // number
type R3 = Awaited<string>;                             // string
```

> This is a simplified version of TypeScript's built-in `Awaited<T>` type.

### Pattern 2: Extracting Array Element Types

```typescript
type ElementOf<T> = T extends ReadonlyArray<infer E> ? E : never;

type R1 = ElementOf<number[]>;             // number
type R2 = ElementOf<readonly string[]>;    // string
type R3 = ElementOf<[1, 2, 3]>;           // 1 | 2 | 3
```

### Pattern 3: Function Return Types with Overloads

```typescript
// For overloaded functions, ReturnType gives the return type of the LAST overload
declare function overloaded(x: string): string;
declare function overloaded(x: number): number;

type R = ReturnType<typeof overloaded>;  // number (last overload)
```

### Pattern 4: Recursive Flattening

```typescript
type DeepFlatten<T> =
  T extends ReadonlyArray<infer E>
    ? DeepFlatten<E>
    : T;

type R1 = DeepFlatten<number[][][]>;   // number
type R2 = DeepFlatten<string[]>;       // string
type R3 = DeepFlatten<boolean>;        // boolean
```

### Pattern 5: Conditional Object Property Types

```typescript
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

interface Person {
  name: string;
  age: number;
  email: string;
  active: boolean;
}

type StringProps = PickByType<Person, string>;
// { name: string; email: string }
```

### Pattern 6: Template Literal Type Parsing

```typescript
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

type R1 = Split<"a.b.c", ".">;      // ["a", "b", "c"]
type R2 = Split<"hello", ".">;      // ["hello"]
type R3 = Split<"a-b-c-d", "-">;    // ["a", "b", "c", "d"]
```

### Pattern 7: Discriminated Union Handlers

```typescript
type EventMap = {
  click: { x: number; y: number };
  keypress: { key: string };
  scroll: { top: number };
};

type EventHandler<T extends keyof EventMap> =
  (event: EventMap[T]) => void;

type ClickHandler = EventHandler<"click">;
// (event: { x: number; y: number }) => void
```

### Pattern 8: Mutually Exclusive Properties

```typescript
type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};

type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);

type CashPayment = { cash: number };
type CardPayment = { card: string; cvv: string };

type Payment = XOR<CashPayment, CardPayment>;

// Valid:
const p1: Payment = { cash: 100 };
const p2: Payment = { card: "1234", cvv: "123" };
// Invalid:
// const p3: Payment = { cash: 100, card: "1234", cvv: "123" };
```

---

## Common Pitfalls

### Pitfall 1: Unexpected Distribution with `never`

```typescript
type Test<T> = T extends string ? "yes" : "no";

// never is the empty union, so distribution yields never
type R = Test<never>;  // never (NOT "yes" or "no")
```

Fix: use `[T] extends [string]` if you need to handle `never`.

### Pitfall 2: Boolean is a Union

```typescript
type Test<T> = T extends true ? "yes" : "no";

// boolean = true | false, so it distributes!
type R = Test<boolean>;  // "yes" | "no"
```

### Pitfall 3: Conditional Return Types in Functions

```typescript
// This compiles but is awkward to implement:
function toArray<T>(value: T): T extends unknown[] ? T : T[] {
  // TypeScript can't narrow T here
  return (Array.isArray(value) ? value : [value]) as
    T extends unknown[] ? T : T[];
}
```

The function body requires a cast because TypeScript doesn't narrow generic
parameters through conditional types.

### Pitfall 4: `any` Matches Both Branches

```typescript
type Test<T> = T extends string ? "yes" : "no";

type R = Test<any>;  // "yes" | "no" (both branches!)
```

`any` is both assignable to and from every type, so it satisfies both branches
of a conditional type.

### Pitfall 5: Order Matters in Nested Conditionals

```typescript
// This won't work as expected for `never[]`:
type Check<T> =
  T extends never[] ? "never array" :
  T extends unknown[] ? "array" :
  "other";

// never[] extends unknown[] is true, but the first check
// also matches because never[] extends never[] is true.
// The result depends on which check comes first.
type R = Check<never[]>;  // "never array" (first match wins)
```

---

## Summary

| Concept                     | Syntax                                    | Key Behavior                            |
| --------------------------- | ----------------------------------------- | --------------------------------------- |
| Basic conditional           | `T extends U ? X : Y`                     | Type-level ternary                      |
| Distributive                | `T extends U ? X : Y` (T is naked)        | Applies per union member                |
| Non-distributive            | `[T] extends [U] ? X : Y`                 | Checks whole type at once               |
| Infer                       | `T extends Array<infer E> ? E : T`        | Extracts inner type                     |
| Nested                      | Chain of `? ... : ... extends ... ? ...`   | Multi-branch type logic                 |
| `never` behavior            | Distribution over empty union = `never`    | Wrap in tuple to avoid                  |

### Quick Reference: Built-in Conditional Utility Types

| Utility Type      | Definition                                              |
| ----------------- | ------------------------------------------------------- |
| `Exclude<T, U>`   | `T extends U ? never : T`                               |
| `Extract<T, U>`   | `T extends U ? T : never`                               |
| `NonNullable<T>`  | `T extends null \| undefined ? never : T`               |
| `ReturnType<T>`   | `T extends (...args: never[]) => infer R ? R : never`   |
| `Parameters<T>`   | `T extends (...args: infer P) => unknown ? P : never`   |
| `Awaited<T>`      | Recursively unwraps Promise-like types                   |

### When to Use Conditional Types

- **Mapping input types to output types** in generic functions
- **Filtering union members** (Exclude, Extract patterns)
- **Extracting nested types** (element types, return types, promise values)
- **Type-level pattern matching** on structure, literals, or template strings
- **Building composable utility types** for your domain

### When NOT to Use Conditional Types

- When a simple generic constraint suffices
- When function overloads provide clearer API surfaces
- When the conditional logic is so deeply nested it becomes unreadable
- When runtime behavior doesn't actually vary by type

---

## References

- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript 2.8 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

> **Configuration**: ES2022 target, strict mode, ESNext modules
>
> **Run exercises**: `npx tsx exercises.ts`
>
> **Run solutions**: `npx tsx solutions.ts`
