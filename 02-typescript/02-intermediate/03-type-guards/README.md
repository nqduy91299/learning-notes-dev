# Type Guards

> **TypeScript Handbook Reference**: [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Table of Contents

1. [What Are Type Guards](#1-what-are-type-guards)
2. [typeof Guards](#2-typeof-guards)
3. [Truthiness Guards](#3-truthiness-guards)
4. [Equality Guards](#4-equality-guards)
5. [in Operator Guard](#5-in-operator-guard)
6. [instanceof Guard](#6-instanceof-guard)
7. [Custom Type Predicates](#7-custom-type-predicates)
8. [Assertion Functions](#8-assertion-functions)
9. [Discriminated Unions + Type Guards](#9-discriminated-unions--type-guards)
10. [Array Type Guards](#10-array-type-guards)
11. [Narrowing with never](#11-narrowing-with-never)
12. [Common Patterns](#12-common-patterns)
13. [Pitfalls](#13-pitfalls)

---

## 1. What Are Type Guards

A **type guard** is any expression that performs a runtime check and allows TypeScript
to **narrow** a variable's type within a conditional block. TypeScript's control flow
analysis tracks these checks and refines the type automatically.

Without type guards, union types force you to treat a value as the broadest possible
type. With type guards, you get precise types inside each branch:

```typescript
function process(value: string | number) {
  // Here, value is string | number — can't call .toUpperCase() or .toFixed()

  if (typeof value === "string") {
    // TypeScript narrows: value is string
    console.log(value.toUpperCase());
  } else {
    // TypeScript narrows: value is number
    console.log(value.toFixed(2));
  }
}
```

Type guards come in several forms:

| Guard Type          | Syntax Example                        | Narrows Based On        |
| ------------------- | ------------------------------------- | ----------------------- |
| `typeof`            | `typeof x === "string"`              | JS primitive types      |
| Truthiness          | `if (x)`                             | Removes null/undefined  |
| Equality            | `x === "hello"`                      | Literal or shared types |
| `in`                | `"name" in obj`                      | Property existence      |
| `instanceof`        | `x instanceof Date`                  | Prototype chain         |
| Type predicate      | `function isFoo(x): x is Foo`       | Custom logic            |
| Assertion function  | `function assert(x): asserts x is T`| Throws or narrows       |

---

## 2. typeof Guards

The `typeof` operator returns a string at runtime. TypeScript recognizes these
checks and narrows accordingly.

### Recognized typeof strings

TypeScript narrows on these `typeof` results:

- `"string"`
- `"number"`
- `"bigint"`
- `"boolean"`
- `"symbol"`
- `"undefined"`
- `"object"`
- `"function"`

```typescript
function describe(value: unknown): string {
  if (typeof value === "string") {
    return `String of length ${value.length}`;
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }
  if (typeof value === "function") {
    return `Function: ${value.name}`;
  }
  return "something else";
}
```

### typeof null caveat

`typeof null` returns `"object"` in JavaScript. This is a long-standing bug.
TypeScript does **not** narrow out `null` with `typeof x === "object"`:

```typescript
function example(value: string | null | object) {
  if (typeof value === "object") {
    // value is null | object — NOT just object!
    // You need an additional null check:
    if (value !== null) {
      // Now value is object
    }
  }
}
```

### typeof in switch statements

```typescript
function formatValue(value: string | number | boolean): string {
  switch (typeof value) {
    case "string":
      return value.toUpperCase(); // value: string
    case "number":
      return value.toFixed(2);    // value: number
    case "boolean":
      return String(value);       // value: boolean
  }
}
```

---

## 3. Truthiness Guards

JavaScript coerces values to boolean in conditionals. The **falsy** values are:
`0`, `0n`, `NaN`, `""`, `null`, `undefined`, and `false`.

TypeScript uses truthiness checks to narrow out `null` and `undefined`:

```typescript
function printName(name: string | null | undefined) {
  if (name) {
    // name is string (null and undefined removed)
    console.log(name.toUpperCase());
  }
}
```

### Be careful with valid falsy values

Truthiness narrowing removes **all** falsy values, not just nullish ones:

```typescript
function printCount(count: number | null) {
  if (count) {
    // count is number — but 0 is falsy!
    // This branch skips count === 0
    console.log(count);
  }
}

// Safer approach: explicit null check
function printCountSafe(count: number | null) {
  if (count !== null) {
    // count is number — includes 0
    console.log(count);
  }
}
```

### Double-boolean negation

The `!!` pattern and `Boolean()` also trigger narrowing:

```typescript
function process(value: string | undefined) {
  if (Boolean(value)) {
    // Note: TypeScript does NOT narrow here with Boolean()
    // value is still string | undefined
  }

  if (!!value) {
    // Same: TypeScript may not narrow here in all versions
    // Prefer direct truthiness check: if (value)
  }

  if (value) {
    // This narrows correctly: value is string
    console.log(value.length);
  }
}
```

---

## 4. Equality Guards

TypeScript narrows types when you compare values with `===`, `!==`, `==`, or `!=`.

### Strict equality (===, !==)

```typescript
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // x and y must both be string (the only overlapping type)
    console.log(x.toUpperCase());
    console.log(y.toUpperCase());
  }
}
```

### Checking against specific values

```typescript
function handleStatus(status: "success" | "error" | "pending") {
  if (status === "success") {
    // status: "success"
  } else if (status === "error") {
    // status: "error"
  } else {
    // status: "pending"
  }
}
```

### Loose equality with null (== null)

`== null` checks for both `null` **and** `undefined`. This is one of the few
places where loose equality is idiomatic in TypeScript:

```typescript
function process(value: string | null | undefined) {
  if (value == null) {
    // value is null | undefined
    return;
  }
  // value is string
  console.log(value.toUpperCase());
}
```

### != null narrows out both null and undefined

```typescript
function getName(name: string | null | undefined): string {
  if (name != null) {
    // name is string — both null and undefined removed
    return name;
  }
  return "anonymous";
}
```

---

## 5. in Operator Guard

The `in` operator checks if a property exists on an object at runtime.
TypeScript narrows the type to union members that have that property.

```typescript
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
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

### in with optional properties

If a property is optional on one type and required on another, `in` still
narrows, but the result includes both types that could have the property:

```typescript
interface Human {
  name: string;
  swim?: () => void;
}

interface Fish {
  swim: () => void;
}

function doSomething(entity: Human | Fish) {
  if ("name" in entity) {
    // entity: Human (only Human has 'name')
    console.log(entity.name);
  }

  if ("swim" in entity) {
    // entity: Human | Fish (both could have 'swim')
    entity.swim(); // OK — TypeScript knows swim exists here
  }
}
```

### in with unknown objects

```typescript
function hasMessage(obj: unknown): obj is { message: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "message" in obj &&
    typeof (obj as Record<string, unknown>).message === "string"
  );
}
```

---

## 6. instanceof Guard

The `instanceof` operator checks the prototype chain. TypeScript narrows the
type accordingly:

```typescript
function formatDate(value: string | Date): string {
  if (value instanceof Date) {
    // value: Date
    return value.toISOString();
  }
  // value: string
  return value;
}
```

### With custom classes

```typescript
class HttpError {
  constructor(public status: number, public message: string) {}
}

class ValidationError {
  constructor(public field: string, public message: string) {}
}

function handleError(error: HttpError | ValidationError) {
  if (error instanceof HttpError) {
    console.log(`HTTP ${error.status}: ${error.message}`);
  } else {
    console.log(`Validation error on ${error.field}: ${error.message}`);
  }
}
```

### instanceof limitations

`instanceof` does **not** work with:

- TypeScript interfaces (they don't exist at runtime)
- Type aliases
- Objects created via `Object.create()` without the proper prototype

```typescript
interface Serializable {
  serialize(): string;
}

function save(obj: unknown) {
  // ERROR: 'Serializable' only refers to a type
  // if (obj instanceof Serializable) { }

  // Use 'in' or a type predicate instead:
  if (typeof obj === "object" && obj !== null && "serialize" in obj) {
    (obj as Serializable).serialize();
  }
}
```

---

## 7. Custom Type Predicates

A **type predicate** is a return type of the form `paramName is Type`. The
function returns a boolean, and when it returns `true`, TypeScript narrows
the parameter to the specified type.

```typescript
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return "swim" in pet;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // pet: Fish
  } else {
    pet.fly();  // pet: Bird
  }
}
```

### Narrowing from unknown

Type predicates are especially useful for validating external data:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as User).id === "number" &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  );
}

function processData(data: unknown) {
  if (isUser(data)) {
    // data: User
    console.log(data.name, data.email);
  }
}
```

### Predicates with this

Class methods can use `this is Type`:

```typescript
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  isCat(): this is Cat {
    return this instanceof Cat;
  }
}

class Cat extends Animal {
  meow() {
    console.log("Meow!");
  }
}

function petAnimal(animal: Animal) {
  if (animal.isCat()) {
    animal.meow(); // animal: Cat
  }
}
```

### Generic type predicates

```typescript
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const values: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];
const defined: string[] = values.filter(isDefined);
// defined: string[] — no null or undefined
```

---

## 8. Assertion Functions

An **assertion function** throws an error if a condition is not met. When it
returns normally, TypeScript narrows the type for subsequent code.

### asserts condition

```typescript
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

function processValue(value: string | null) {
  assert(value !== null, "value must not be null");
  // After assertion: value is string
  console.log(value.toUpperCase());
}
```

### asserts x is Type

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function greet(input: unknown) {
  assertIsString(input);
  // After assertion: input is string
  console.log(`Hello, ${input.toUpperCase()}`);
}
```

### Assertion functions vs type predicates

| Feature            | Type Predicate (`is`) | Assertion (`asserts`) |
| ------------------ | --------------------- | --------------------- |
| Returns            | `boolean`             | `void` (or throws)    |
| Usage              | In `if` conditions    | Standalone statement  |
| On failure         | Returns `false`       | Throws an error       |
| Narrowing scope    | Inside `if` block     | Rest of the block     |

```typescript
// Type predicate — caller decides what to do
function isNumber(x: unknown): x is number {
  return typeof x === "number";
}

// Assertion — function decides (throw or continue)
function assertNumber(x: unknown): asserts x is number {
  if (typeof x !== "number") throw new Error("Not a number");
}

function demo(val: unknown) {
  // Predicate: narrowing inside if
  if (isNumber(val)) {
    val.toFixed(2);
  }

  // Assertion: narrowing after the call
  assertNumber(val);
  val.toFixed(2);
}
```

---

## 9. Discriminated Unions + Type Guards

A **discriminated union** has a common literal property (the "discriminant" or "tag")
across all union members. Type guards on the tag narrow to the specific variant.

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

### Multiple discriminants

You can check multiple tags:

```typescript
interface SuccessResponse {
  status: "success";
  data: unknown;
}

interface ErrorResponse {
  status: "error";
  code: number;
  message: string;
}

interface LoadingResponse {
  status: "loading";
}

type ApiResponse = SuccessResponse | ErrorResponse | LoadingResponse;

function handleResponse(response: ApiResponse) {
  if (response.status === "error") {
    // response: ErrorResponse
    console.log(`Error ${response.code}: ${response.message}`);
  }
}
```

### Custom predicates for discriminated unions

```typescript
function isErrorResponse(r: ApiResponse): r is ErrorResponse {
  return r.status === "error";
}

function process(response: ApiResponse) {
  if (isErrorResponse(response)) {
    console.log(response.code);
  }
}
```

---

## 10. Array Type Guards

### Array.isArray()

TypeScript recognizes `Array.isArray()` as a type guard:

```typescript
function flatten(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    // value: string[]
    return value;
  }
  // value: string
  return [value];
}
```

### Filtering arrays with type predicates

The `.filter()` method accepts a type predicate to narrow the resulting array:

```typescript
const mixed: (string | null)[] = ["a", null, "b", null, "c"];

// Without predicate: result is (string | null)[]
const withoutPredicate = mixed.filter((x) => x !== null);

// With predicate: result is string[]
const withPredicate = mixed.filter((x): x is string => x !== null);
```

### Generic non-null filter

```typescript
function isNotNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

const numbers: (number | null)[] = [1, null, 2, null, 3];
const clean: number[] = numbers.filter(isNotNull);
```

### Array.isArray with readonly arrays

```typescript
function process(input: string | readonly string[]) {
  if (Array.isArray(input)) {
    // input: readonly string[] (Array.isArray works with readonly)
    input.forEach((s) => console.log(s));
  }
}
```

---

## 11. Narrowing with never

When all union members have been eliminated, TypeScript assigns the type `never`.
This enables **exhaustive checking**.

### Exhaustive switch with never

```typescript
type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default: {
      // If all cases are covered, shape is never
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${_exhaustive}`);
    }
  }
}
```

### Helper function for exhaustive checks

```typescript
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function getLabel(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return "Circle";
    case "rectangle":
      return "Rectangle";
    case "triangle":
      return "Triangle";
    default:
      return assertNever(shape);
  }
}
```

### Why this matters

If you add a new variant to the union but forget to handle it:

```typescript
interface Pentagon {
  kind: "pentagon";
  side: number;
}

type ShapeV2 = Circle | Rectangle | Triangle | Pentagon;

function areaV2(shape: ShapeV2): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // ERROR: Type 'Pentagon' is not assignable to type 'never'
      const _exhaustive: never = shape;
      throw new Error(`Unhandled: ${_exhaustive}`);
  }
}
```

The compiler catches the missing case.

---

## 12. Common Patterns

### isNotNull filter utility

```typescript
function isNotNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

// Usage
const ids: (number | null)[] = [1, null, 2, null, 3];
const validIds: number[] = ids.filter(isNotNull); // [1, 2, 3]
```

### Type-safe event handlers

```typescript
interface ClickEvent {
  type: "click";
  x: number;
  y: number;
}

interface KeyEvent {
  type: "key";
  key: string;
  code: number;
}

interface ResizeEvent {
  type: "resize";
  width: number;
  height: number;
}

type AppEvent = ClickEvent | KeyEvent | ResizeEvent;

type EventHandler<T extends AppEvent["type"]> = (
  event: Extract<AppEvent, { type: T }>
) => void;

const handlers: { [K in AppEvent["type"]]?: EventHandler<K> } = {
  click: (event) => console.log(`Clicked at ${event.x}, ${event.y}`),
  key: (event) => console.log(`Key pressed: ${event.key}`),
};

function dispatch(event: AppEvent) {
  switch (event.type) {
    case "click":
      handlers.click?.(event);
      break;
    case "key":
      handlers.key?.(event);
      break;
    case "resize":
      handlers.resize?.(event);
      break;
  }
}
```

### Safe JSON parsing

```typescript
function safeJsonParse<T>(
  json: string,
  guard: (value: unknown) => value is T
): T | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

interface Config {
  port: number;
  host: string;
}

function isConfig(value: unknown): value is Config {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Config).port === "number" &&
    typeof (value as Config).host === "string"
  );
}

const config = safeJsonParse('{"port": 3000, "host": "localhost"}', isConfig);
// config: Config | null
```

### Narrowing in callbacks

```typescript
interface Task {
  id: number;
  title: string;
  completedAt?: Date;
}

function getCompletedTasks(tasks: Task[]): (Task & { completedAt: Date })[] {
  return tasks.filter(
    (task): task is Task & { completedAt: Date } =>
      task.completedAt !== undefined
  );
}
```

### Multi-step narrowing

```typescript
function processInput(input: unknown): string {
  if (typeof input !== "object") return String(input);
  if (input === null) return "null";
  if (!("message" in input)) return "no message";
  if (typeof (input as { message: unknown }).message !== "string") {
    return "message is not a string";
  }
  return (input as { message: string }).message;
}
```

---

## 13. Pitfalls

### Lying type predicates

TypeScript **trusts** your type predicate. If the implementation is wrong,
you get incorrect narrowing with no compiler error:

```typescript
// DANGEROUS: this predicate lies!
function isString(value: unknown): value is string {
  return typeof value === "number"; // Bug: checking number, claiming string
}

const val: unknown = 42;
if (isString(val)) {
  // TypeScript thinks val is string, but it's actually 42
  console.log(val.toUpperCase()); // Runtime error!
}
```

**Rule**: Always ensure the predicate body actually validates the claimed type.

### Assertion functions and side effects

Assertion functions must always throw on failure. If they silently return,
TypeScript will still narrow the type:

```typescript
// DANGEROUS: doesn't throw on failure
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") {
    console.log("not a string"); // Should throw!
  }
}

const v: unknown = 123;
assertString(v); // Doesn't throw
v.toUpperCase(); // Runtime error!
```

### typeof on wrapped primitives

```typescript
const boxed = new String("hello");
console.log(typeof boxed); // "object", not "string"!

// typeof guard won't catch boxed primitives
function isStr(x: unknown): boolean {
  return typeof x === "string"; // false for new String("hello")
}
```

### Narrowing doesn't survive callbacks

```typescript
function example(value: string | null) {
  if (value !== null) {
    // value is string here
    setTimeout(() => {
      // TypeScript still considers value as string here in this case,
      // but if value were let-bound and mutated, it might not narrow.
    }, 100);
  }
}

function gotcha(getValue: () => string | null) {
  const value = getValue();
  if (value !== null) {
    // value is string
    doSomethingLater(() => {
      // value is still string (it's const)
      // But if we called getValue() again, no guarantee
    });
  }
}

function doSomethingLater(fn: () => void) {
  fn();
}
```

### Overly broad in checks

```typescript
interface Cat {
  meow(): void;
  name: string;
}

interface Dog {
  bark(): void;
  name: string;
}

function isCat(animal: Cat | Dog): boolean {
  // BAD: both Cat and Dog have 'name'
  return "name" in animal; // Always true!
}

// GOOD: check a distinguishing property
function isCatCorrect(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}
```

---

## Summary

| Technique               | Best For                                  |
| ----------------------- | ----------------------------------------- |
| `typeof`                | Primitives (string, number, boolean, etc) |
| Truthiness              | Quick null/undefined removal              |
| `===` / `!==`           | Literal types, specific values            |
| `== null`               | Checking null + undefined together        |
| `in`                    | Object property checks                    |
| `instanceof`            | Class instances                           |
| Type predicates         | Complex/reusable narrowing logic          |
| Assertion functions     | Fail-fast validation                      |
| Discriminated unions    | Tagged object variants                    |
| `Array.isArray()`       | Array vs non-array                        |
| Exhaustive `never`      | Ensuring all cases handled                |

**Key principles**:

1. Prefer built-in guards (`typeof`, `instanceof`, `in`) when they suffice
2. Use type predicates for reusable, complex narrowing
3. Use assertion functions for fail-fast validation
4. Always add exhaustive checks for discriminated unions
5. Never trust your own type predicates — test them thoroughly
6. Be aware of falsy values when using truthiness guards
