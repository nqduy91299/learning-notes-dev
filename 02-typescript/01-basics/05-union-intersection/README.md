# Union & Intersection Types

> **TypeScript Handbook References**:
> [Unions and Intersection Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types),
> [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

## Table of Contents

1. [Union Types](#1-union-types)
2. [Narrowing Unions](#2-narrowing-unions)
3. [Discriminated Unions](#3-discriminated-unions)
4. [The `never` Type and Exhaustive Checks](#4-the-never-type-and-exhaustive-checks)
5. [Intersection Types](#5-intersection-types)
6. [Intersection with Primitives](#6-intersection-with-primitives)
7. [Union vs Intersection Mental Model](#7-union-vs-intersection-mental-model)
8. [Distributive Behavior in Conditional Types](#8-distributive-behavior-in-conditional-types)
9. [Optional Properties and Unions](#9-optional-properties-and-unions)
10. [Type Guards with Unions](#10-type-guards-with-unions)
11. [Branded / Nominal Types Using Intersections](#11-branded--nominal-types-using-intersections)
12. [Real-World Patterns](#12-real-world-patterns)

---

## 1. Union Types

A **union type** describes a value that can be one of several types. The
vertical bar `|` separates each constituent type.

```ts
type StringOrNumber = string | number;

let value: StringOrNumber;

value = "hello"; // OK
value = 42;      // OK
// value = true; // Error: Type 'boolean' is not assignable
```

### Member Access on Unions

You can only access members that are **common to all constituents**:

```ts
function printId(id: string | number) {
  // OK — both string and number have .toString()
  console.log(id.toString());

  // Error — .toUpperCase() exists only on string
  // console.log(id.toUpperCase());
}
```

This is because TypeScript must guarantee safety for *every* possible type
in the union. If you need type-specific operations, you must first **narrow**
the type (see next section).

### Union of Object Types

```ts
type Cat = { meow(): void; purr(): void };
type Dog = { bark(): void; fetch(): void };

type Pet = Cat | Dog;

function interact(pet: Pet) {
  // Error — meow() is not on Dog, bark() is not on Cat
  // pet.meow();
  // pet.bark();
}
```

You can only call methods present on **both** `Cat` and `Dog`. Since they
share none here, you need narrowing to do anything useful.

---

## 2. Narrowing Unions

**Narrowing** is the process of refining a union to a more specific type
inside a control-flow branch. TypeScript performs **control-flow analysis**
automatically.

### 2.1 `typeof` Guards

```ts
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === "number") {
    // padding is narrowed to `number`
    return " ".repeat(padding) + value;
  }
  // padding is narrowed to `string`
  return padding + value;
}
```

`typeof` works for: `"string"`, `"number"`, `"bigint"`, `"boolean"`,
`"symbol"`, `"undefined"`, `"object"`, `"function"`.

### 2.2 `instanceof` Guards

```ts
function formatDate(input: string | Date): string {
  if (input instanceof Date) {
    return input.toISOString(); // narrowed to Date
  }
  return input; // narrowed to string
}
```

### 2.3 `in` Operator Narrowing

```ts
type Fish = { swim(): void };
type Bird = { fly(): void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // narrowed to Fish
  } else {
    animal.fly();  // narrowed to Bird
  }
}
```

### 2.4 Equality Narrowing

```ts
function compare(x: string | number, y: string | boolean) {
  if (x === y) {
    // The only overlap is `string`, so both are narrowed to string
    console.log(x.toUpperCase());
    console.log(y.toUpperCase());
  }
}
```

### 2.5 Truthiness Narrowing

```ts
function printName(name: string | null | undefined) {
  if (name) {
    // narrowed to string (null and undefined are falsy)
    console.log(name.toUpperCase());
  }
}
```

Be careful: `0`, `""`, and `NaN` are also falsy, so truthiness narrowing
can accidentally exclude valid values.

---

## 3. Discriminated Unions

A **discriminated union** (also called a *tagged union*) is a pattern where
every member of the union has a **common literal property** (the
*discriminant* or *tag*) that TypeScript can use to narrow the type.

```ts
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Triangle = {
  kind: "triangle";
  base: number;
  height: number;
};

type Shape = Circle | Rectangle | Triangle;
```

### Narrowing with `switch`

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}
```

Inside each `case`, TypeScript narrows `shape` to the specific variant.

### Why Discriminated Unions?

- They are self-documenting — the `kind` field tells you what you're
  dealing with.
- TypeScript can verify **exhaustiveness** (see next section).
- They model state machines and API responses cleanly.

---

## 4. The `never` Type and Exhaustive Checks

The `never` type represents a value that should **never occur**. After
narrowing away every member of a union, the remaining type is `never`.

### The `assertNever` Pattern

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
      // If we forget a case, shape won't be `never` and TS reports an error
  }
}
```

If a new variant (e.g. `"pentagon"`) is added to `Shape` but not handled,
the `default` branch will fail to compile because `shape` is not `never` —
it's `Pentagon`. This gives you **compile-time exhaustiveness checking**.

### Exhaustive Check with `satisfies`

An alternative without a helper function:

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default: {
      const _exhaustive: never = shape;
      throw new Error(`Unhandled: ${_exhaustive}`);
    }
  }
}
```

---

## 5. Intersection Types

An **intersection type** combines multiple types into one. A value of type
`A & B` must satisfy **both** `A` and `B`.

```ts
type HasName = { name: string };
type HasAge = { age: number };

type Person = HasName & HasAge;

const alice: Person = { name: "Alice", age: 30 }; // OK
// Must have BOTH name and age
```

### Combining Interfaces

```ts
interface Printable {
  print(): void;
}

interface Loggable {
  log(): void;
}

type PrintableAndLoggable = Printable & Loggable;

const obj: PrintableAndLoggable = {
  print() { console.log("printing"); },
  log()   { console.log("logging"); },
};
```

### Property Conflicts

If both types declare the same property with **different types**, the
property type is itself an intersection:

```ts
type A = { value: string };
type B = { value: number };

type AB = A & B;
// AB["value"] is string & number, which is never
// So AB is essentially impossible to create
```

---

## 6. Intersection with Primitives

Intersecting two **incompatible primitives** yields `never`:

```ts
type Impossible = string & number; // never
```

There is no value that is simultaneously a `string` and a `number`, so the
resulting type is `never`.

However, intersecting a primitive with an **object type** is legal
(and useful for branding — see section 11):

```ts
type Tagged = string & { __tag: "special" };
// This type is structurally unrealizable at runtime,
// but useful at the type level for branding.
```

### Intersection with `unknown` and `any`

```ts
type A = string & unknown; // string  — unknown is the identity for &
type B = string & any;     // any     — any absorbs everything
type C = string & never;   // never   — never absorbs everything
```

---

## 7. Union vs Intersection Mental Model

| Concept       | Union `A \| B`              | Intersection `A & B`          |
|---------------|----------------------------|-------------------------------|
| Logic         | OR — value is A **or** B    | AND — value is A **and** B    |
| Values        | Wider set (more values)     | Narrower set (fewer values)   |
| Properties    | Only common members         | All members from both         |
| Analogy       | "Either door"               | "Both requirements"           |

### Set-Theory Perspective

Think of types as **sets of values**:

- `A | B` = the **union** of sets → any value from A or B qualifies →
  **more values**, but **fewer guaranteed properties**.
- `A & B` = the **intersection** of sets → only values in both A and B
  qualify → **fewer values**, but **more guaranteed properties**.

```ts
// Union: more values, fewer properties
type StringOrNumber = string | number;
// You can only use .toString(), .valueOf() — common to both

// Intersection: fewer values, more properties
type NamedAndAged = { name: string } & { age: number };
// You can access both .name and .age
```

This is why the property-access rules seem "backwards" at first glance:
unions give you *fewer* properties, intersections give you *more*.

---

## 8. Distributive Behavior in Conditional Types

When a **union** is passed as the checked type in a **conditional type**,
TypeScript distributes the condition over each member:

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type Result = ToArray<string | number>;
// Distributes: ToArray<string> | ToArray<number>
// = string[] | number[]
// NOT (string | number)[]
```

This is called **distributive conditional types**. Distribution happens
only when the type parameter appears **naked** (not wrapped in a tuple,
array, etc.).

### Preventing Distribution

Wrap both sides in a tuple:

```ts
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;

type Result2 = ToArrayNonDist<string | number>;
// = (string | number)[]
```

### Extracting / Excluding Union Members

```ts
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T;

type Nums = Extract<string | number | boolean, number>;
// = number

type NoStrings = Exclude<string | number | boolean, string>;
// = number | boolean
```

---

## 9. Optional Properties and Unions

There is a subtle but important difference between `T | undefined` and
an optional property `?`.

```ts
type WithUnion = {
  name: string;
  age: number | undefined;
};

type WithOptional = {
  name: string;
  age?: number;
};
```

- `age: number | undefined` — the property **must** be present, but its
  value can be `undefined`.
- `age?: number` — the property may be **entirely absent** from the
  object. When accessed, it's `number | undefined`.

```ts
const a: WithUnion = { name: "A", age: undefined }; // OK
// const b: WithUnion = { name: "B" }; // Error — age is required

const c: WithOptional = { name: "C" }; // OK
const d: WithOptional = { name: "D", age: undefined }; // OK (since TS 4.4 with exactOptionalPropertyTypes off)
```

### `exactOptionalPropertyTypes`

With the `exactOptionalPropertyTypes` compiler flag enabled:

```ts
// With exactOptionalPropertyTypes: true
const e: WithOptional = { name: "E", age: undefined };
// Error — age? means "number or missing", NOT "number | undefined"
```

### Union with `null` vs `undefined`

A common pattern for nullable fields:

```ts
type User = {
  name: string;
  email: string | null;   // explicitly nullable — present but empty
  nickname?: string;       // optional — may not exist
};
```

---

## 10. Type Guards with Unions

A **type guard** is a function whose return type is a **type predicate**
(`paramName is Type`). It tells TypeScript how to narrow within a branch.

### Custom Type Predicates

```ts
type Cat = { meow(): void; whiskers: number };
type Dog = { bark(): void; breed: string };

function isCat(pet: Cat | Dog): pet is Cat {
  return "meow" in pet;
}

function interact(pet: Cat | Dog) {
  if (isCat(pet)) {
    pet.meow();           // narrowed to Cat
    console.log(pet.whiskers);
  } else {
    pet.bark();           // narrowed to Dog
    console.log(pet.breed);
  }
}
```

### Assertion Functions

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function process(input: unknown) {
  assertIsString(input);
  // After the assertion, input is narrowed to string
  console.log(input.toUpperCase());
}
```

### Array Filtering with Type Guards

```ts
type Result = { status: "ok"; data: string } | { status: "error"; message: string };

function isOk(r: Result): r is { status: "ok"; data: string } {
  return r.status === "ok";
}

const results: Result[] = [
  { status: "ok", data: "hello" },
  { status: "error", message: "fail" },
  { status: "ok", data: "world" },
];

const successes = results.filter(isOk);
// Type: { status: "ok"; data: string }[]
console.log(successes.map(s => s.data)); // ["hello", "world"]
```

---

## 11. Branded / Nominal Types Using Intersections

TypeScript's type system is **structural**. Two types with the same shape
are interchangeable. Sometimes you want **nominal** behavior — two types
that have the same runtime representation but are **not assignable** to
each other.

### The Brand Pattern

```ts
type USD = number & { readonly __brand: unique symbol };
type EUR = number & { readonly __brand: unique symbol };

function usd(amount: number): USD {
  return amount as USD;
}

function eur(amount: number): EUR {
  return amount as EUR;
}

function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

const price = usd(9.99);
const tax = usd(0.80);
const total = addUSD(price, tax); // OK

const euros = eur(10);
// addUSD(price, euros); // Error — EUR is not assignable to USD
```

### Branded Strings

```ts
type Email = string & { readonly __brand: "Email" };
type UserId = string & { readonly __brand: "UserId" };

function validateEmail(input: string): Email {
  if (!input.includes("@")) throw new Error("Invalid email");
  return input as Email;
}

function sendEmail(to: Email, subject: string) {
  console.log(`Sending "${subject}" to ${to}`);
}

const email = validateEmail("alice@example.com");
sendEmail(email, "Hello"); // OK

// sendEmail("not-validated", "Hello"); // Error
```

### Why This Works

The brand property (`__brand`) doesn't exist at runtime. It only exists in
the type system. The `as` cast tells TypeScript to trust us. The
intersection `number & { __brand: ... }` creates a type that is a subset
of `number` but **incompatible** with plain `number` or differently-branded
numbers.

---

## 12. Real-World Patterns

### 12.1 API Response Union

```ts
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; code: number };

function handleResponse(response: ApiResponse<string[]>) {
  switch (response.status) {
    case "loading":
      console.log("Loading...");
      break;
    case "success":
      console.log("Data:", response.data);
      break;
    case "error":
      console.error(`Error ${response.code}: ${response.error}`);
      break;
  }
}
```

### 12.2 State Machine Types

```ts
type ConnectionState =
  | { state: "disconnected" }
  | { state: "connecting"; attempt: number }
  | { state: "connected"; socket: WebSocket }
  | { state: "error"; error: Error; retryAfter: number };

function transition(current: ConnectionState): string {
  switch (current.state) {
    case "disconnected":
      return "Starting connection...";
    case "connecting":
      return `Connection attempt ${current.attempt}...`;
    case "connected":
      return `Connected via ${current.socket.url}`;
    case "error":
      return `Error: ${current.error.message}. Retry in ${current.retryAfter}ms`;
  }
}
```

### 12.3 Result Type (`Success | Error`)

A common functional-programming pattern for error handling without
exceptions:

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("Division by zero");
  return ok(a / b);
}

const result = divide(10, 3);
if (result.ok) {
  console.log(result.value.toFixed(2)); // "3.33"
} else {
  console.error(result.error);
}
```

### 12.4 Event System

```ts
type AppEvent =
  | { type: "USER_LOGIN";  userId: string; timestamp: number }
  | { type: "USER_LOGOUT"; userId: string; timestamp: number }
  | { type: "PAGE_VIEW";   url: string; timestamp: number }
  | { type: "ERROR";       message: string; stack?: string; timestamp: number };

function logEvent(event: AppEvent) {
  const base = `[${new Date(event.timestamp).toISOString()}]`;
  switch (event.type) {
    case "USER_LOGIN":
      console.log(`${base} Login: ${event.userId}`);
      break;
    case "USER_LOGOUT":
      console.log(`${base} Logout: ${event.userId}`);
      break;
    case "PAGE_VIEW":
      console.log(`${base} Page view: ${event.url}`);
      break;
    case "ERROR":
      console.error(`${base} Error: ${event.message}`);
      break;
  }
}
```

### 12.5 Builder Pattern with Intersections

```ts
type WithLogging = {
  enableLogging(): void;
  log(msg: string): void;
};

type WithMetrics = {
  enableMetrics(): void;
  recordMetric(name: string, value: number): void;
};

type WithAuth = {
  authenticate(token: string): boolean;
};

// Compose capabilities
type FullService = WithLogging & WithMetrics & WithAuth;

function createService(): FullService {
  return {
    enableLogging() { console.log("Logging enabled"); },
    log(msg) { console.log(msg); },
    enableMetrics() { console.log("Metrics enabled"); },
    recordMetric(name, value) { console.log(`${name}: ${value}`); },
    authenticate(token) { return token === "secret"; },
  };
}
```

---

## Summary

| Feature                   | Syntax / Pattern                         | Use Case                          |
|---------------------------|------------------------------------------|-----------------------------------|
| Union                     | `A \| B`                                 | Value can be one of several types |
| Intersection              | `A & B`                                  | Value must satisfy all types      |
| Discriminated union       | Common literal `kind` field + `switch`   | State machines, API responses     |
| Exhaustive check          | `assertNever` / `const _: never = x`    | Catch missing cases at compile    |
| Custom type guard         | `(x): x is T => ...`                    | Complex narrowing logic           |
| Assertion function        | `asserts x is T`                         | Throw-or-narrow pattern           |
| Branded types             | `number & { __brand: ... }`             | Nominal typing for primitives     |
| Result type               | `{ ok: true; value } \| { ok: false }`  | Error handling without exceptions |
