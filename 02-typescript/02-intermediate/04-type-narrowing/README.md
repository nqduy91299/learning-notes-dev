# Type Narrowing

> **TypeScript Handbook Reference**: [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

Type narrowing is the process by which TypeScript refines a broad type into a more
specific one within a conditional block. The compiler performs **control flow analysis**
to track how types change as your code branches — so you get precise types without
writing a single cast.

---

## Table of Contents

1. [Control Flow Analysis](#1-control-flow-analysis)
2. [Assignment Narrowing](#2-assignment-narrowing)
3. [typeof Narrowing](#3-typeof-narrowing)
4. [Truthiness Narrowing](#4-truthiness-narrowing)
5. [Equality Narrowing](#5-equality-narrowing)
6. [The `in` Operator Narrowing](#6-the-in-operator-narrowing)
7. [instanceof Narrowing](#7-instanceof-narrowing)
8. [Discriminated Union Narrowing](#8-discriminated-union-narrowing)
9. [Control Flow and Closures](#9-control-flow-and-closures)
10. [Type Assertions vs Narrowing](#10-type-assertions-vs-narrowing)
11. [The `never` Type](#11-the-never-type)
12. [Using the `satisfies` Operator](#12-using-the-satisfies-operator)
13. [Narrowing with Array Methods](#13-narrowing-with-array-methods)
14. [Common Narrowing Patterns](#14-common-narrowing-patterns)

---

## 1. Control Flow Analysis

TypeScript's compiler walks through every possible path your code can take. When it
encounters a conditional check that constrains a type, it **narrows** the type in the
branch where the check is true and often narrows to the opposite in the `else` branch.

```typescript
function example(value: string | number) {
  // Here `value` is `string | number`

  if (typeof value === "string") {
    // TS knows `value` is `string` here
    console.log(value.toUpperCase());
  } else {
    // TS knows `value` is `number` here
    console.log(value.toFixed(2));
  }
}
```

Key points:

- Narrowing only applies **within the scope** of the conditional branch.
- After the `if/else` block, the type reverts to the original union (unless one
  branch returns/throws).
- Early returns are a powerful pattern — once a branch returns, the rest of the
  function body sees the narrowed type.

```typescript
function printLength(value: string | null) {
  if (value === null) {
    console.log("No value");
    return; // early return — below this, `value` is `string`
  }

  // `value` is `string` here — no need for an else
  console.log(value.length);
}
```

---

## 2. Assignment Narrowing

When you assign a value to a variable declared with a union type, TypeScript narrows
the variable's type to match the assigned value — but only until the next assignment.

```typescript
let x: string | number;

x = "hello";
// x is `string` here
console.log(x.toUpperCase());

x = 42;
// x is `number` here
console.log(x.toFixed(2));
```

This also works with `const` declarations, where the type is narrowed to a
**literal type**:

```typescript
const greeting = "hello"; // type is `"hello"`, not `string`
```

Important: assignment narrowing respects the **declared type**. You can always
reassign back to any member of the original union:

```typescript
let value: string | number = "hello";
// value is `string`
value = 10;
// value is `number` — perfectly legal
```

---

## 3. `typeof` Narrowing

The `typeof` operator returns one of these strings at runtime:

| Expression          | Result        |
|---------------------|---------------|
| `typeof "abc"`      | `"string"`    |
| `typeof 42`         | `"number"`    |
| `typeof 42n`        | `"bigint"`    |
| `typeof true`       | `"boolean"`   |
| `typeof undefined`  | `"undefined"` |
| `typeof Symbol()`   | `"symbol"`    |
| `typeof {}`         | `"object"`    |
| `typeof (() => {})` | `"function"`  |
| `typeof null`       | `"object"`    |

TypeScript understands all of these and narrows accordingly:

```typescript
function process(value: string | number | boolean | undefined) {
  if (typeof value === "string") {
    // value: string
    return value.trim();
  }
  if (typeof value === "number") {
    // value: number
    return value * 2;
  }
  if (typeof value === "boolean") {
    // value: boolean
    return !value;
  }
  // value: undefined
  return "nothing";
}
```

**Watch out for `null`**: `typeof null === "object"`, so a `typeof` check for
`"object"` will **not** exclude `null`. You need an explicit null check first:

```typescript
function describe(value: string | object | null) {
  if (typeof value === "object") {
    // value is `object | null` — null NOT excluded!
    if (value !== null) {
      // value is `object`
      console.log(Object.keys(value));
    }
  }
}
```

---

## 4. Truthiness Narrowing

JavaScript considers the following values **falsy**:

- `false`
- `0`, `-0`, `0n`
- `""` (empty string)
- `null`
- `undefined`
- `NaN`

Everything else is **truthy**. TypeScript uses truthiness checks to narrow types:

```typescript
function greet(name: string | null) {
  if (name) {
    // name is `string` (null has been excluded)
    console.log(`Hello, ${name}`);
  }
}
```

### The Empty String Pitfall

Truthiness narrowing removes `null` and `undefined`, but it **also** removes other
falsy values like `""`, `0`, and `false`. This is a common source of bugs:

```typescript
function printName(name: string | null) {
  if (name) {
    console.log(name);
  } else {
    // This branch catches BOTH null AND "" (empty string)
    console.log("Anonymous");
  }
}

// Maybe you wanted to allow empty strings?
// Use an explicit null check instead:
function printNameSafe(name: string | null) {
  if (name !== null) {
    console.log(name); // name is `string`, including ""
  } else {
    console.log("Anonymous");
  }
}
```

Double-boolean negation (`!!`) is a common pattern to convert a value to a boolean,
but TypeScript can narrow with a bare truthiness check — `!!` is unnecessary for
narrowing purposes.

---

## 5. Equality Narrowing

TypeScript narrows types when you compare values with `===`, `!==`, `==`, and `!=`.

### Strict Equality (`===` / `!==`)

When two variables share only one type in common, a strict equality check narrows
both sides to that shared type:

```typescript
function compare(a: string | number, b: string | boolean) {
  if (a === b) {
    // The only type in common is `string`
    // a: string, b: string
    console.log(a.toUpperCase(), b.toUpperCase());
  }
}
```

### Loose Equality (`==` / `!=`)

Loose equality with `null` is particularly useful — `== null` matches **both**
`null` and `undefined`, which is often exactly what you want:

```typescript
function process(value: string | null | undefined) {
  if (value != null) {
    // value is `string` — both null and undefined excluded
    console.log(value.trim());
  }
}
```

This is one of the few cases where `==` / `!=` is actually recommended over `===`.

---

## 6. The `in` Operator Narrowing

The `in` operator checks whether an object has a property with the given name.
TypeScript uses this to narrow union types:

```typescript
interface Fish {
  swim: () => void;
}

interface Bird {
  fly: () => void;
}

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    // animal: Fish
    animal.swim();
  } else {
    // animal: Bird
    animal.fly();
  }
}
```

This works because TypeScript knows that if the `"swim"` property exists, the
value must be the type that declares it.

The `in` operator also works with optional properties, but be aware that the
narrowing may be less precise:

```typescript
interface A {
  shared: string;
  onlyA?: number;
}

interface B {
  shared: string;
  onlyB?: boolean;
}

function handle(value: A | B) {
  if ("onlyA" in value) {
    // value: A (TS narrows to the type that declares `onlyA`)
    console.log(value.onlyA);
  }
}
```

---

## 7. `instanceof` Narrowing

The `instanceof` operator checks the prototype chain. TypeScript narrows the type
accordingly:

```typescript
function formatDate(value: string | Date) {
  if (value instanceof Date) {
    // value: Date
    return value.toISOString();
  }
  // value: string
  return value;
}
```

This works with any class, including custom ones:

```typescript
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function handleError(error: Error) {
  if (error instanceof ApiError) {
    // error: ApiError
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
  } else {
    console.log(error.message);
  }
}
```

**Limitation**: `instanceof` does not work with interfaces or type aliases because
they don't exist at runtime. Use `in` or discriminated unions instead.

---

## 8. Discriminated Union Narrowing

A **discriminated union** is a union of object types that share a common property
(the **discriminant**) with a literal type. This is one of the most important
patterns in TypeScript.

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape: Circle
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // shape: Rectangle
      return shape.width * shape.height;
    case "triangle":
      // shape: Triangle
      return (shape.base * shape.height) / 2;
  }
}
```

The discriminant property (`kind`) must be a **literal type** — a specific string,
number, or boolean value. TypeScript checks which literal matches and narrows the
entire object type.

### Why This Pattern Is Powerful

- The compiler enforces exhaustive handling (see [section 11](#11-the-never-type)).
- Adding a new variant to the union causes compile errors everywhere the switch
  doesn't handle the new case.
- It works purely at the type level — no runtime overhead compared to class hierarchies.

### Multiple Discriminants

You can use multiple properties as discriminants:

```typescript
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "keypress"; key: string }
  | { type: "scroll"; direction: "up" | "down" };

function handleEvent(event: Event) {
  if (event.type === "click") {
    console.log(event.x, event.y);
  } else if (event.type === "keypress") {
    console.log(event.key);
  } else {
    console.log(event.direction);
  }
}
```

---

## 9. Control Flow and Closures

A critical caveat: narrowing does **not** persist inside closures (callbacks,
arrow functions) created after the narrowing check. TypeScript cannot guarantee
that the callback runs immediately — it might run later when the variable has
changed.

```typescript
function example(value: string | number) {
  if (typeof value === "string") {
    // value is `string` here

    setTimeout(() => {
      // value is still `string` here because the parameter can't be reassigned
      console.log(value.toUpperCase());
    }, 100);
  }
}
```

However, with `let` variables, narrowing **is** lost inside closures:

```typescript
function problem() {
  let value: string | number = "hello";
  // value is `string` here

  const fn = () => {
    // value is `string | number` — narrowing lost!
    // TypeScript knows `fn` might be called after `value` is reassigned.
    console.log(value);
  };

  value = 42; // proves TS was right to widen
  fn(); // logs 42
}
```

**Fix**: capture the narrowed value in a `const`:

```typescript
function fixed() {
  let value: string | number = "hello";

  const captured = value;
  // captured: string (narrowed via assignment)

  const fn = () => {
    // captured is still `string` — it's const and can't change
    console.log(captured.toUpperCase());
  };

  value = 42;
  fn(); // logs "HELLO"
}
```

---

## 10. Type Assertions vs Narrowing

Type narrowing is **safe** — the compiler verifies the type guard at the type level.
Type assertions (`as`) are **unsafe** — you're telling the compiler to trust you.

```typescript
// Safe: narrowing
function safe(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase(); // TS verified this is safe
  }
  return "";
}

// Unsafe: assertion
function unsafe(value: unknown) {
  return (value as string).toUpperCase(); // might crash at runtime!
}
```

### When Assertions Are Needed

Sometimes you know more than the compiler. Assertions are acceptable when:

1. **DOM APIs** return overly broad types:
   ```typescript
   const input = document.getElementById("email") as HTMLInputElement;
   input.value = "test@example.com";
   ```

2. **External data** that you've already validated elsewhere:
   ```typescript
   interface Config {
     port: number;
     host: string;
   }
   // After JSON.parse + validation
   const config = JSON.parse(raw) as Config;
   ```

3. **Test code** where you intentionally pass partial data.

### Prefer Type Predicates Over Assertions

Instead of scattering `as` throughout your code, write **user-defined type guards**:

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: unknown) {
  if (isString(value)) {
    // value: string — safe narrowing, no assertion needed
    console.log(value.toUpperCase());
  }
}
```

---

## 11. The `never` Type

The `never` type represents values that **should never occur**. After all members of
a union have been narrowed away, the remaining type is `never`.

### Reachability Analysis

TypeScript uses `never` to detect unreachable code:

```typescript
function fail(message: string): never {
  throw new Error(message);
}

function example(value: string | number) {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    return value;
  }
  // value is `never` here — all possibilities exhausted
}
```

### Exhaustive Checks

The most powerful use of `never` is ensuring you handle every case in a
discriminated union:

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    default:
      return assertNever(shape);
      // If you add a new shape variant and forget to handle it,
      // `shape` won't be `never` and this line won't compile.
  }
}
```

If you later add `{ kind: "triangle"; ... }` to the `Shape` union but forget to
add a `case "triangle"` branch, the compiler will report an error at the
`assertNever(shape)` call because `shape` would be the triangle type, not `never`.

---

## 12. Using the `satisfies` Operator

The `satisfies` operator (TypeScript 4.9+) validates that an expression matches a
type **without widening** the inferred type. This is useful when you want type
checking but also want to preserve narrow literal types.

```typescript
type Color = "red" | "green" | "blue";
type ColorMap = Record<string, Color | [number, number, number]>;

// With `satisfies`, TS validates the structure but keeps the narrow types
const palette = {
  red: [255, 0, 0],
  green: "#00ff00", // Error! "#00ff00" is not a Color or RGB tuple
  blue: "blue",
} satisfies ColorMap;

// Without satisfies (using annotation):
const palette2: ColorMap = {
  red: [255, 0, 0],
  green: "green",
  blue: "blue",
};
// palette2.red is `Color | [number, number, number]` — widened!
// palette.red would be `[number, number, number]` — precise!
```

### `satisfies` and Narrowing

Because `satisfies` preserves narrow types, you get better narrowing downstream:

```typescript
type Route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
};

const routes = {
  home: { path: "/", method: "GET" },
  create: { path: "/create", method: "POST" },
} satisfies Record<string, Route>;

// routes.home.method is "GET" (not "GET" | "POST" | "PUT" | "DELETE")
// This precision enables better narrowing in consuming code.
```

---

## 13. Narrowing with Array Methods

Array methods like `filter` and `find` return broad types by default. Type
predicates help narrow the results.

### `filter` Without a Type Predicate

```typescript
const values: (string | null)[] = ["hello", null, "world", null];

const strings = values.filter((v) => v !== null);
// strings: (string | null)[] — not narrowed!
```

### `filter` With a Type Predicate

```typescript
const strings2 = values.filter((v): v is string => v !== null);
// strings2: string[] — correctly narrowed
```

### `find` With a Type Predicate

```typescript
interface Dog { kind: "dog"; bark: () => void }
interface Cat { kind: "cat"; meow: () => void }
type Animal = Dog | Cat;

const animals: Animal[] = [
  { kind: "dog", bark: () => console.log("Woof") },
  { kind: "cat", meow: () => console.log("Meow") },
];

const dog = animals.find((a): a is Dog => a.kind === "dog");
// dog: Dog | undefined
if (dog) {
  dog.bark(); // correctly narrowed to Dog
}
```

### Reusable Type Guard Functions

```typescript
function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

const cleaned = ["a", null, "b", undefined, "c"].filter(isNonNull);
// cleaned: string[]
```

---

## 14. Common Narrowing Patterns

### Null Checks

```typescript
function process(value: string | null | undefined) {
  // Pattern 1: strict null check
  if (value !== null && value !== undefined) {
    console.log(value.trim());
  }

  // Pattern 2: loose null check (preferred)
  if (value != null) {
    console.log(value.trim());
  }

  // Pattern 3: truthiness (beware of "")
  if (value) {
    console.log(value.trim());
  }
}
```

### Optional Chaining + Narrowing

Optional chaining (`?.`) does **not** narrow types by itself, but combining it with
a check does:

```typescript
interface User {
  name: string;
  address?: {
    street: string;
    city: string;
  };
}

function getCity(user: User): string {
  // Optional chaining returns `string | undefined`
  const city = user.address?.city;

  if (city !== undefined) {
    // city: string — narrowed
    return city;
  }
  return "Unknown";
}
```

### Assertion Functions

TypeScript supports **assertion functions** that narrow types when they don't throw:

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function process(value: unknown) {
  assertIsString(value);
  // value: string — narrowed by the assertion function
  console.log(value.toUpperCase());
}
```

Assertion functions are useful for:
- Validation at boundaries (API inputs, config files)
- Replacing repeated `if + throw` patterns
- Building reusable validation libraries

### Combining Multiple Narrowing Techniques

```typescript
interface ApiSuccess {
  status: "success";
  data: unknown;
}
interface ApiError {
  status: "error";
  message: string;
}
type ApiResponse = ApiSuccess | ApiError;

function handleResponse(response: ApiResponse) {
  // Discriminated union narrowing
  if (response.status === "error") {
    console.error(response.message);
    return;
  }

  // response: ApiSuccess (via early return)
  const { data } = response;

  // typeof narrowing on the extracted data
  if (typeof data === "string") {
    console.log(data.toUpperCase());
  } else if (Array.isArray(data)) {
    console.log(data.length);
  }
}
```

### Record Narrowing with `Object.hasOwn`

```typescript
function getProperty(obj: Record<string, unknown>, key: string): string {
  if (Object.hasOwn(obj, key)) {
    const value = obj[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return "default";
}
```

---

## Summary

| Technique                | Narrows by                      | Works at runtime? |
|--------------------------|---------------------------------|-------------------|
| `typeof`                 | Primitive type                  | Yes               |
| Truthiness               | Removes `null`/`undefined`/falsy| Yes               |
| `===` / `!==`            | Exact value or type overlap     | Yes               |
| `==` / `!=` null         | Removes `null` and `undefined`  | Yes               |
| `in`                     | Property existence              | Yes               |
| `instanceof`             | Prototype chain                 | Yes               |
| Discriminated union      | Literal discriminant property   | Yes               |
| Type predicate           | Custom logic (`x is T`)         | Yes               |
| Assertion function       | Custom logic (`asserts x is T`) | Yes               |
| Assignment               | Assigned value                  | N/A               |
| `satisfies`              | Validates without widening      | No (compile only) |

**Rules of thumb**:
1. Prefer narrowing over type assertions — it's safer.
2. Use discriminated unions for complex object hierarchies.
3. Write reusable type predicate functions for repeated patterns.
4. Use `assertNever` for exhaustive switch statements.
5. Be careful with truthiness narrowing and falsy values like `""` and `0`.
6. Remember that narrowing doesn't persist in closures over `let` variables.
