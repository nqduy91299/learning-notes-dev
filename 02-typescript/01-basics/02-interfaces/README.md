# Interfaces

> **TypeScript Handbook Reference**: [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)

Interfaces are one of TypeScript's core tools for defining the **shape** of data.
They describe the structure that objects, functions, and classes must conform to —
acting as contracts that enable type-safe code without prescribing implementation.

---

## Table of Contents

1. [Interface Basics](#1-interface-basics)
2. [Optional Properties](#2-optional-properties)
3. [Readonly Properties](#3-readonly-properties)
4. [Index Signatures](#4-index-signatures)
5. [Extending Interfaces](#5-extending-interfaces)
6. [Intersection with Interfaces](#6-intersection-with-interfaces)
7. [Interfaces vs Type Aliases](#7-interfaces-vs-type-aliases)
8. [Declaration Merging](#8-declaration-merging)
9. [Function Interfaces](#9-function-interfaces)
10. [Construct Signatures](#10-construct-signatures)
11. [Hybrid Types](#11-hybrid-types)
12. [Interface for Class Implementation](#12-interface-for-class-implementation)
13. [Excess Property Checking](#13-excess-property-checking)
14. [Generic Interfaces](#14-generic-interfaces)

---

## 1. Interface Basics

An interface declares a named object type. Any object that satisfies the shape is
assignable to a variable of that interface type — no explicit `implements` needed
for plain objects.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const alice: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};
```

TypeScript uses **structural typing** (duck typing). If an object has all the
required properties with compatible types, it satisfies the interface:

```typescript
function greet(user: User): string {
  return `Hello, ${user.name}`;
}

// Works — the object structurally matches User
const bob = { id: 2, name: "Bob", email: "bob@example.com", age: 30 };
greet(bob); // OK — extra properties are fine when passed via variable
```

### Key points

- Interfaces describe **shape**, not identity.
- Property names and types must match exactly.
- Missing required properties cause compile errors.
- Extra properties are allowed when assigned via a variable (see §13 for caveats).

---

## 2. Optional Properties

Mark a property as optional with `?`. The type becomes `T | undefined`.

```typescript
interface Config {
  host: string;
  port: number;
  ssl?: boolean;       // optional — boolean | undefined
  timeout?: number;    // optional — number | undefined
}

const devConfig: Config = {
  host: "localhost",
  port: 3000,
  // ssl and timeout omitted — perfectly valid
};

const prodConfig: Config = {
  host: "api.example.com",
  port: 443,
  ssl: true,
  timeout: 5000,
};
```

### Accessing optional properties safely

```typescript
function getTimeout(config: Config): number {
  // Narrowing with nullish coalescing
  return config.timeout ?? 30_000;
}

// Or with optional chaining in nested cases
interface AppConfig {
  db?: {
    host?: string;
    port?: number;
  };
}

function getDbHost(cfg: AppConfig): string {
  return cfg.db?.host ?? "localhost";
}
```

---

## 3. Readonly Properties

The `readonly` modifier prevents reassignment after initialization.

```typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const origin: Point = { x: 0, y: 0 };
// origin.x = 5; // Error: Cannot assign to 'x' because it is a read-only property
```

### `readonly` is shallow

```typescript
interface UserProfile {
  readonly name: string;
  readonly address: {
    street: string;
    city: string;
  };
}

const profile: UserProfile = {
  name: "Alice",
  address: { street: "123 Main St", city: "Springfield" },
};

// profile.name = "Bob";              // Error — readonly
profile.address.city = "Shelbyville"; // OK — nested object is mutable!
```

### ReadonlyArray

TypeScript provides `ReadonlyArray<T>` (or `readonly T[]`) for immutable arrays:

```typescript
interface Inventory {
  readonly items: ReadonlyArray<string>;
}

const inv: Inventory = { items: ["sword", "shield"] };
// inv.items.push("potion"); // Error — push does not exist on ReadonlyArray
// inv.items[0] = "axe";     // Error — index signature is readonly

// You can still create a new array
const newItems: readonly string[] = [...inv.items, "potion"];
```

### `Readonly<T>` utility type

```typescript
interface MutableUser {
  id: number;
  name: string;
}

type FrozenUser = Readonly<MutableUser>;
// Equivalent to: { readonly id: number; readonly name: string; }
```

---

## 4. Index Signatures

Index signatures let you describe objects with dynamic keys.

```typescript
interface StringMap {
  [key: string]: string;
}

const env: StringMap = {
  NODE_ENV: "production",
  PORT: "3000",
};

env["DATABASE_URL"] = "postgres://..."; // OK
// env["COUNT"] = 42;                   // Error — value must be string
```

### Numeric index signatures

```typescript
interface NumberList {
  [index: number]: string;
}

const colors: NumberList = ["red", "green", "blue"]; // arrays satisfy this
```

### Mixing known and dynamic properties

When you combine known properties with an index signature, the known properties
must be compatible with the index signature's type:

```typescript
interface HttpHeaders {
  "Content-Type": string;
  Authorization: string;
  [header: string]: string; // all values must be string
}

// This would NOT work:
// interface BadHeaders {
//   "Content-Length": number;    // Error — not assignable to string
//   [header: string]: string;
// }
```

### Using a union in the index signature

```typescript
interface FlexibleMap {
  id: number;
  name: string;
  [key: string]: string | number; // union must cover all known property types
}

const item: FlexibleMap = {
  id: 1,
  name: "Widget",
  weight: 2.5,
  color: "red",
};
```

---

## 5. Extending Interfaces

Use `extends` to inherit properties from one or more interfaces.

### Single inheritance

```typescript
interface Animal {
  name: string;
  sound(): string;
}

interface Dog extends Animal {
  breed: string;
  fetch(): void;
}

const rex: Dog = {
  name: "Rex",
  breed: "German Shepherd",
  sound() { return "Woof!"; },
  fetch() { console.log(`${this.name} fetches the ball`); },
};
```

### Multiple inheritance

```typescript
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

interface Entity extends Serializable, Loggable {
  id: number;
  name: string;
}

const entity: Entity = {
  id: 1,
  name: "Test Entity",
  serialize() { return JSON.stringify({ id: this.id, name: this.name }); },
  log() { console.log(`Entity(${this.id}): ${this.name}`); },
};
```

### Overriding inherited properties

A child interface can **narrow** (but not widen) an inherited property type:

```typescript
interface Base {
  value: string | number;
}

interface Derived extends Base {
  value: string; // OK — string is narrower than string | number
}

// interface Bad extends Base {
//   value: boolean; // Error — boolean is not assignable to string | number
// }
```

---

## 6. Intersection with Interfaces

The `&` (intersection) operator combines types. It works with interfaces too:

```typescript
interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

type Person = HasName & HasAge;

const person: Person = { name: "Alice", age: 30 };
```

### Intersection vs Extends — conflict handling

The key behavioral difference appears when properties conflict:

```typescript
interface A {
  value: string;
}

interface B {
  value: number;
}

// Intersection: value becomes string & number = never
type AB = A & B;
// const ab: AB = { value: ??? }; // impossible — no value is both string & number

// Extends: compile error
// interface C extends A, B {} // Error — 'value' types are incompatible
```

With `extends`, conflicting properties cause an **immediate compile error** (good —
you see the problem early). With `&`, the property silently becomes `never`
(dangerous — you only discover the problem when you try to use the type).

---

## 7. Interfaces vs Type Aliases

Both `interface` and `type` can describe object shapes. Here are the differences:

| Feature                  | `interface`               | `type`                    |
|--------------------------|---------------------------|---------------------------|
| Object shapes            | Yes                       | Yes                       |
| `extends`                | Yes                       | No (use `&`)              |
| `implements`             | Yes                       | Yes (with object types)   |
| Declaration merging      | Yes                       | No                        |
| Union types              | No                        | Yes                       |
| Mapped types             | No                        | Yes                       |
| Primitives / tuples      | No                        | Yes                       |
| Computed properties      | No                        | Yes                       |

### When to use `interface`

- Defining the shape of objects, especially in public APIs.
- When you need **declaration merging** (e.g., augmenting third-party types).
- When using `extends` for clear inheritance hierarchies.

### When to use `type`

- Unions: `type Result = Success | Failure`
- Primitives: `type ID = string | number`
- Tuples: `type Pair = [string, number]`
- Mapped / conditional types.
- Complex compositions.

```typescript
// Interface — good for object shapes
interface UserDTO {
  id: number;
  name: string;
  email: string;
}

// Type — necessary for unions
type ApiResponse = { status: "ok"; data: UserDTO } | { status: "error"; message: string };

// Type — necessary for mapped types
type Partial<T> = { [K in keyof T]?: T[K] };
```

### General guideline

> Use `interface` for object shapes and `type` for everything else.
> — TypeScript Handbook recommendation

---

## 8. Declaration Merging

When two `interface` declarations share the same name in the same scope,
TypeScript **merges** them into a single interface:

```typescript
interface Window {
  title: string;
}

interface Window {
  appVersion: string;
}

// Merged result:
// interface Window {
//   title: string;
//   appVersion: string;
// }

const win: Window = {
  title: "My App",
  appVersion: "1.0.0",
};
```

### Practical use: augmenting third-party types

```typescript
// Augmenting Express Request (in a .d.ts file)
declare namespace Express {
  interface Request {
    userId?: string;
    sessionId?: string;
  }
}
```

### Rules for declaration merging

1. Non-function members must have **identical types** if they share a name.
2. Function members with the same name are treated as **overloads**.
3. Later declarations take **higher priority** for overload ordering.

```typescript
interface Box {
  height: number;
  width: number;
}

interface Box {
  height: number; // OK — same type
  scale: number;
  // width: string; // Error — would conflict with existing 'width: number'
}
```

### `type` does NOT merge

```typescript
// type Foo = { a: string };
// type Foo = { b: number }; // Error: Duplicate identifier 'Foo'
```

---

## 9. Function Interfaces

Interfaces can describe callable signatures:

```typescript
interface Comparator<T> {
  (a: T, b: T): number;
}

const numSort: Comparator<number> = (a, b) => a - b;
const strSort: Comparator<string> = (a, b) => a.localeCompare(b);

console.log([3, 1, 2].sort(numSort));       // [1, 2, 3]
console.log(["c", "a", "b"].sort(strSort)); // ["a", "b", "c"]
```

### Multiple call signatures (overloads)

```typescript
interface Formatter {
  (value: number): string;
  (value: Date): string;
}

const format: Formatter = (value: number | Date): string => {
  if (typeof value === "number") return value.toFixed(2);
  return value.toISOString();
};
```

### Callable with properties

See §11 (Hybrid Types) for combining call signatures with properties.

---

## 10. Construct Signatures

A construct signature describes something that can be called with `new`:

```typescript
interface ClockConstructor {
  new (hour: number, minute: number): ClockInstance;
}

interface ClockInstance {
  tick(): void;
}

function createClock(
  Ctor: ClockConstructor,
  hour: number,
  minute: number
): ClockInstance {
  return new Ctor(hour, minute);
}

class DigitalClock implements ClockInstance {
  constructor(public hour: number, public minute: number) {}
  tick() {
    console.log(`${this.hour}:${String(this.minute).padStart(2, "0")}`);
  }
}

const clock = createClock(DigitalClock, 12, 30);
clock.tick(); // "12:30"
```

### Combined call and construct signature

```typescript
interface DateConstructor {
  new (): Date;
  new (value: number): Date;
  (): string; // calling without new returns a string
}
```

---

## 11. Hybrid Types

An interface can describe an object that is **both callable and has properties**:

```typescript
interface Counter {
  (): number;        // callable — returns current count
  count: number;     // property
  reset(): void;     // method
}

function createCounter(initial: number = 0): Counter {
  const fn = function () {
    return fn.count++;
  } as Counter;

  fn.count = initial;
  fn.reset = function () {
    fn.count = initial;
  };

  return fn;
}

const counter = createCounter(1);
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3
counter.reset();
console.log(counter());  // 1
```

### Real-world example: Axios-like interface

```typescript
interface HttpClient {
  (config: { url: string; method: string }): Promise<unknown>;
  get(url: string): Promise<unknown>;
  post(url: string, body: unknown): Promise<unknown>;
  defaults: {
    baseUrl: string;
    timeout: number;
  };
}
```

---

## 12. Interface for Class Implementation

Classes can `implements` one or more interfaces. The class must provide all
properties and methods declared in the interface.

```typescript
interface Printable {
  toString(): string;
  print(): void;
}

interface Identifiable {
  readonly id: string;
}

class Document implements Printable, Identifiable {
  readonly id: string;
  constructor(id: string, private content: string) {
    this.id = id;
  }

  toString(): string {
    return `Document(${this.id}): ${this.content}`;
  }

  print(): void {
    console.log(this.toString());
  }
}
```

### Important: `implements` is a structural check only

`implements` does NOT change the type of the class — it only verifies conformance.
The class can have additional members beyond what the interface requires.

```typescript
interface Runnable {
  run(): void;
}

class Task implements Runnable {
  name: string;                // extra property — fine
  constructor(name: string) {
    this.name = name;
  }
  run(): void {
    console.log(`Running: ${this.name}`);
  }
}
```

### Interfaces don't provide implementation

Unlike abstract classes, interfaces contain no logic — only type declarations:

```typescript
// Abstract class — CAN have implementation
abstract class BaseLogger {
  abstract log(msg: string): void;
  info(msg: string) { this.log(`[INFO] ${msg}`); } // implementation provided
}

// Interface — CANNOT have implementation
interface Logger {
  log(msg: string): void;
  // info(msg: string) { ... } // Not allowed
}
```

---

## 13. Excess Property Checking

TypeScript applies **extra scrutiny** when you assign an object literal directly
to a typed variable. This catches typos and unintended properties.

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig) {
  return {
    color: config.color ?? "white",
    area: (config.width ?? 10) ** 2,
  };
}

// Error: 'colour' does not exist in type 'SquareConfig'. Did you mean 'color'?
// createSquare({ colour: "red", width: 100 });

// OK — correct spelling
createSquare({ color: "red", width: 100 });
```

### Why only object literals?

TypeScript assumes that when you write a literal directly, you intend every
property. Extra properties are likely bugs. When you pass a variable, the extra
properties might be intentional.

### Workarounds (when extra properties are legitimate)

**1. Assign to a variable first:**

```typescript
const opts = { colour: "red", width: 100 };
createSquare(opts); // No error — excess checking skipped
```

**2. Use a type assertion:**

```typescript
createSquare({ colour: "red", width: 100 } as SquareConfig);
```

**3. Add an index signature:**

```typescript
interface FlexibleSquareConfig {
  color?: string;
  width?: number;
  [key: string]: unknown;
}
```

### Best practice

Excess property checking is a **feature**, not a nuisance. Don't routinely
suppress it — it catches real bugs. Only use workarounds when you have a genuine
reason for extra properties.

---

## 14. Generic Interfaces

Interfaces can accept type parameters, making them reusable across types.

```typescript
interface Repository<T> {
  getById(id: string): T | undefined;
  getAll(): T[];
  save(entity: T): void;
  delete(id: string): boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

class InMemoryUserRepo implements Repository<User> {
  private store = new Map<string, User>();

  getById(id: string): User | undefined {
    return this.store.get(id);
  }
  getAll(): User[] {
    return [...this.store.values()];
  }
  save(entity: User): void {
    this.store.set(entity.id, entity);
  }
  delete(id: string): boolean {
    return this.store.delete(id);
  }
}
```

### Multiple type parameters

```typescript
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}

const pair: KeyValuePair<string, number> = { key: "age", value: 30 };
```

### Default type parameters

```typescript
interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  timestamp: Date;
}

// T defaults to unknown
const raw: ApiResponse = { status: 200, data: "hello", timestamp: new Date() };

// T specified as User
const userResp: ApiResponse<User> = {
  status: 200,
  data: { id: "1", name: "Alice", email: "a@b.com" },
  timestamp: new Date(),
};
```

### Constrained type parameters

```typescript
interface Identifiable {
  id: string;
}

interface CrudService<T extends Identifiable> {
  findById(id: string): T | undefined;
  save(entity: T): void;
}
```

Here `T` must have an `id: string` property — any type without it will cause a
compile error when used with `CrudService`.

---

## Summary

| Concept                  | Key Takeaway                                                |
|--------------------------|-------------------------------------------------------------|
| Basics                   | Interfaces describe object shapes via structural typing     |
| Optional (`?`)           | Property becomes `T \| undefined`                           |
| Readonly                 | Prevents reassignment; shallow only                         |
| Index signatures         | Dynamic keys; all values must match the signature type      |
| `extends`                | Inherit and narrow properties; multi-inheritance supported   |
| `&` intersection         | Combines types; conflicts silently become `never`           |
| vs Type Aliases          | Use `interface` for objects, `type` for unions/primitives   |
| Declaration merging      | Same-name interfaces auto-merge; `type` cannot              |
| Function interfaces      | Callable signatures, overloads                              |
| Construct signatures     | `new ()` syntax for constructor types                       |
| Hybrid types             | Callable objects with properties                            |
| `implements`             | Class conformance check; no implementation provided         |
| Excess property checking | Literal-only strictness; catches typos                      |
| Generics                 | Parameterized interfaces; constraints and defaults          |

---

## Further Reading

- [TypeScript Handbook — Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbook — Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces)
- [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
