# Generics in TypeScript

> **Prerequisites**: Basic TypeScript types, interfaces, type aliases, union types.
> **Reference**: [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

## Table of Contents

1. [Why Generics](#1-why-generics)
2. [Generic Functions](#2-generic-functions)
3. [Generic Type Inference](#3-generic-type-inference)
4. [Multiple Type Parameters](#4-multiple-type-parameters)
5. [Generic Constraints](#5-generic-constraints)
6. [Using Type Parameters in Constraints](#6-using-type-parameters-in-constraints)
7. [Generic Classes](#7-generic-classes)
8. [Generic Interfaces](#8-generic-interfaces)
9. [Default Type Parameters](#9-default-type-parameters)
10. [Generic Type Aliases](#10-generic-type-aliases)
11. [The `keyof` Constraint Pattern](#11-the-keyof-constraint-pattern)
12. [Generic Utility Patterns](#12-generic-utility-patterns)
13. [Variance](#13-variance)
14. [Common Mistakes](#14-common-mistakes)

---

## 1. Why Generics

### The Problem with `any`

Consider a function that returns the first element of an array:

```typescript
function firstElement(arr: any[]): any {
  return arr[0];
}

const n = firstElement([1, 2, 3]);   // type: any
const s = firstElement(["a", "b"]);  // type: any
```

The function works, but the return type is `any`. We've lost the **type relationship**
between the input and output. The caller knows they passed `number[]`, but TypeScript
has forgotten that fact by the time the value comes back.

This leads to real bugs:

```typescript
const n = firstElement([1, 2, 3]);
n.toUpperCase(); // No compile error — but crashes at runtime!
```

### The Goal: Preserve Type Relationships

We want to tell TypeScript: "the return type depends on the input type." That's exactly
what generics do. They let you write code that works with **many types** while still
preserving **type safety**.

```typescript
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = firstElement([1, 2, 3]);   // type: number | undefined
const s = firstElement(["a", "b"]);  // type: string | undefined
```

Now TypeScript tracks the relationship: `T[]` in → `T` out.

### Generics vs. Overloads vs. Union Types

| Approach | Preserves relationship? | Scales to new types? |
|----------|------------------------|---------------------|
| `any` | No | Yes |
| Union types | Partially | No (must list all) |
| Overloads | Yes | No (must list all) |
| **Generics** | **Yes** | **Yes** |

Generics are the only approach that both preserves the input-output type relationship
and scales to types that don't exist yet.

---

## 2. Generic Functions

A generic function declares one or more **type parameters** in angle brackets before
the parameter list:

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

`T` is a **type variable** — a placeholder that gets filled in when the function is
called. By convention, single uppercase letters are used: `T`, `U`, `K`, `V`.

You can call a generic function in two ways:

```typescript
// 1. Explicit type argument
const a = identity<string>("hello"); // T = string

// 2. Let TypeScript infer T (preferred when possible)
const b = identity(42);             // T = number (inferred)
```

### Arrow Function Syntax

```typescript
const identity = <T>(arg: T): T => arg;
```

> **Note**: In `.tsx` files, `<T>` can be confused with JSX. Use `<T,>` or
> `<T extends unknown>` as a workaround.

### Generic Function Type

You can describe the type of a generic function:

```typescript
type IdentityFn = <T>(arg: T) => T;

const myIdentity: IdentityFn = (arg) => arg;
```

Notice the `<T>` is on the **function type**, not on the alias. This means every
call site can provide a different `T`.

---

## 3. Generic Type Inference

TypeScript infers type arguments from the **values** you pass:

```typescript
function wrap<T>(value: T): { value: T } {
  return { value };
}

const w = wrap(42);
// TypeScript infers T = number
// w has type { value: number }
```

### Inference from Multiple Arguments

When multiple parameters use the same type variable, TypeScript finds the **best
common type**:

```typescript
function pair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

pair(1, 2);       // T = number
pair("a", "b");   // T = string
pair(1, "a");     // T = string | number
```

### When Inference Fails

Sometimes TypeScript infers a type that's too narrow or too wide. You can help it
with explicit type arguments:

```typescript
function createArray<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}

// Without annotation, T = "" (string literal type in some contexts)
const arr = createArray<string>(3, "");
```

### Inference with Return Type Context

TypeScript can also infer from the **expected return type** (contextual typing):

```typescript
function parse<T>(json: string): T {
  return JSON.parse(json);
}

// T inferred from the variable's type annotation
const user: { name: string } = parse('{"name":"Alice"}');
```

> **Warning**: This pattern is unsafe — `JSON.parse` returns `any` and there's no
> runtime validation. Prefer using a validation library like `zod`.

---

## 4. Multiple Type Parameters

Functions can have more than one type parameter:

```typescript
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const lengths = map(["hello", "world"], (s) => s.length);
// T = string, U = number
// lengths: number[]
```

### Practical Example: Object Transformation

```typescript
function mapValues<T, U>(
  obj: Record<string, T>,
  fn: (value: T) => U
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const key in obj) {
    result[key] = fn(obj[key]);
  }
  return result;
}

const prices = { apple: 1.5, banana: 0.75 };
const formatted = mapValues(prices, (p) => `$${p.toFixed(2)}`);
// { apple: "$1.50", banana: "$0.75" }
```

### Rule of Thumb

Each type parameter should appear **at least twice** in the signature. If it only
appears once, it's not relating anything — you probably don't need a generic:

```typescript
// BAD: T only appears once — no relationship being captured
function greet<T extends string>(name: T): string {
  return `Hello, ${name}`;
}

// GOOD: just use the concrete type
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

---

## 5. Generic Constraints

By default, a type parameter can be **any type**. Constraints let you require that
`T` has certain properties using the `extends` keyword:

```typescript
function logLength<T extends { length: number }>(arg: T): T {
  console.log(arg.length); // OK — T is guaranteed to have .length
  return arg;
}

logLength("hello");     // OK: string has .length
logLength([1, 2, 3]);   // OK: array has .length
logLength({ length: 5, name: "test" }); // OK
logLength(42);           // ERROR: number has no .length
```

### Constraining to a Specific Interface

```typescript
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

interface User extends HasId {
  name: string;
}

const users: User[] = [{ id: 1, name: "Alice" }];
const user = findById(users, 1);
// user is User | undefined — the full type is preserved
```

The key benefit: `findById` returns `T` (the full input type), not just `HasId`.
The constraint is the **minimum** requirement; the actual type can be richer.

### Constraining to Primitive Types

```typescript
function add<T extends number | string>(a: T, b: T): T extends number ? number : string {
  return (a as any) + b;
}
```

> This pattern gets complex quickly. Prefer overloads for a small set of primitive types.

---

## 6. Using Type Parameters in Constraints

A type parameter can be constrained **by another type parameter**:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };

getProperty(user, "name"); // OK, returns string
getProperty(user, "age");  // OK, returns number
getProperty(user, "email"); // ERROR: "email" is not in keyof typeof user
```

Here, `K extends keyof T` means:
- `K` must be one of the keys of `T`
- The return type `T[K]` is the **indexed access type** — the type of `T` at key `K`

### Nested Constraint Example

```typescript
function setProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): void {
  obj[key] = value;
}

const config = { host: "localhost", port: 8080 };
setProperty(config, "port", 3000);     // OK
setProperty(config, "port", "3000");   // ERROR: string not assignable to number
```

This ensures type-safe property access and assignment.

---

## 7. Generic Classes

Classes can have type parameters just like functions:

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push(2);
numStack.pop(); // number | undefined

const strStack = new Stack<string>();
strStack.push("hello");
strStack.push(42); // ERROR: number not assignable to string
```

### Generic Class with Constraints

```typescript
class SortedList<T extends { compareTo(other: T): number }> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
    this.items.sort((a, b) => a.compareTo(b));
  }

  getAll(): T[] {
    return [...this.items];
  }
}
```

### Static Members Cannot Reference Type Parameters

```typescript
class Box<T> {
  static defaultValue: T; // ERROR: static members cannot reference type parameters
  value: T;

  constructor(value: T) {
    this.value = value;
  }
}
```

This is because static members are shared across all instances, but each instance
can have a different `T`.

---

## 8. Generic Interfaces

Interfaces can also be generic:

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}
```

### Implementing a Generic Interface

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

class InMemoryUserRepo implements Repository<User> {
  private store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.store.values());
  }

  async save(entity: User): Promise<User> {
    this.store.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
```

### Generic Interface with Method-Level Type Parameters

```typescript
interface Converter {
  convert<T, U>(input: T, transform: (val: T) => U): U;
}
```

Here `<T, U>` belongs to the **method**, not the interface. Each call to `convert`
can use different types.

### Interface-Level vs. Method-Level Type Parameters

```typescript
// Interface-level: T is fixed when the interface is used
interface Container<T> {
  get(): T;
  set(value: T): void;
}

// Method-level: T is chosen at each call
interface Serializer {
  serialize<T>(value: T): string;
  deserialize<T>(json: string): T;
}
```

---

## 9. Default Type Parameters

Type parameters can have defaults, similar to default function arguments:

```typescript
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
}

// Use the default
const res1: ApiResponse = { data: "anything", status: 200, message: "OK" };

// Override the default
const res2: ApiResponse<User> = {
  data: { id: "1", name: "Alice", email: "a@b.com" },
  status: 200,
  message: "OK",
};
```

### Default with Constraint

A default must satisfy the constraint:

```typescript
interface Paginated<T extends object = Record<string, unknown>> {
  items: T[];
  page: number;
  totalPages: number;
}
```

### Ordering: Defaults Must Come Last

Like function parameters, defaulted type parameters must come after non-defaulted ones:

```typescript
// OK
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ERROR: required type parameter after optional
type Bad<T = string, U> = [T, U];
```

### Practical Use: Event Emitter

```typescript
class EventEmitter<TEvents extends Record<string, unknown[]> = Record<string, unknown[]>> {
  private listeners = new Map<string, Function[]>();

  on<K extends keyof TEvents & string>(
    event: K,
    listener: (...args: TEvents[K]) => void
  ): void {
    const fns = this.listeners.get(event) ?? [];
    fns.push(listener);
    this.listeners.set(event, fns);
  }

  emit<K extends keyof TEvents & string>(event: K, ...args: TEvents[K]): void {
    const fns = this.listeners.get(event) ?? [];
    fns.forEach((fn) => fn(...args));
  }
}

// Typed events
type AppEvents = {
  login: [user: string];
  error: [code: number, message: string];
};

const emitter = new EventEmitter<AppEvents>();
emitter.on("login", (user) => console.log(user));      // user: string
emitter.on("error", (code, msg) => console.log(code));  // code: number
emitter.emit("login", "Alice");
emitter.emit("error", 404, "Not Found");
```

---

## 10. Generic Type Aliases

Type aliases can be generic too:

```typescript
type Pair<T> = [T, T];

const nums: Pair<number> = [1, 2];
const strs: Pair<string> = ["a", "b"];
```

### Common Patterns

```typescript
// Nullable wrapper
type Nullable<T> = T | null;

// Async result
type AsyncResult<T> = Promise<{ data: T; error: null } | { data: null; error: Error }>;

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Tree structure
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};
```

### Recursive Type Aliases

Generic type aliases can reference themselves — useful for tree-like data:

```typescript
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};
```

---

## 11. The `keyof` Constraint Pattern

The `keyof` operator produces a union of an object type's keys. Combined with generics,
it enables type-safe dynamic property access:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

### Pluck: Extract Multiple Properties

```typescript
function pluck<T, K extends keyof T>(obj: T, keys: K[]): T[K][] {
  return keys.map((key) => obj[key]);
}

const user = { name: "Alice", age: 30, email: "alice@test.com" };
const values = pluck(user, ["name", "email"]);
// type: (string)[] — since both name and email are string
```

### Pick-Like Function

```typescript
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const subset = pick(user, ["name", "age"]);
// type: Pick<User, "name" | "age"> = { name: string; age: number }
```

### Index Signatures and `keyof`

```typescript
type Dict = { [key: string]: number };
type DictKeys = keyof Dict; // string | number
// (number because JS coerces numeric keys to strings)

type StrictDict = Record<string, number>;
type StrictKeys = keyof StrictDict; // string
```

---

## 12. Generic Utility Patterns

TypeScript ships built-in utilities like `Partial`, `Required`, `Pick`, `Omit`, etc.
Understanding how they're built helps you write your own.

### Building `Partial` from Scratch

```typescript
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
```

This uses a **mapped type**: iterate over each key `K` of `T`, and make it optional
(`?`), keeping the same value type `T[K]`.

### Building `Pick`

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

### Building `Readonly`

```typescript
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};
```

### Building `Record`

```typescript
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};
```

### A Custom Utility: `Optional`

Make specific keys optional while keeping the rest required:

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: string;
  name: string;
  email: string;
}

type CreateUserInput = Optional<User, "id">;
// { name: string; email: string; id?: string }
```

### A Custom Utility: `RequireAtLeastOne`

```typescript
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
```

> These advanced mapped types combine generics with conditional types and mapped type
> modifiers. The key insight is that generics provide the "parameterization" and mapped
> types provide the "iteration."

---

## 13. Variance

Variance describes how subtype relationships between **container types** relate to
subtype relationships between their **type arguments**.

### Covariance (Output Position)

A type is **covariant** in `T` when it only **produces** (returns) values of type `T`:

```typescript
interface Producer<out T> {
  get(): T;
}
```

If `Dog extends Animal`, then `Producer<Dog>` is assignable to `Producer<Animal>`.
This is intuitive — if I can produce a Dog, I can produce an Animal.

### Contravariance (Input Position)

A type is **contravariant** in `T` when it only **consumes** (accepts) values of type `T`:

```typescript
interface Consumer<in T> {
  accept(value: T): void;
}
```

If `Dog extends Animal`, then `Consumer<Animal>` is assignable to `Consumer<Dog>`.
This is the reverse! If I can consume any Animal, I can certainly consume a Dog.

### Invariance (Both Positions)

When `T` appears in **both** input and output positions, the type is **invariant**:

```typescript
interface Box<T> {
  get(): T;
  set(value: T): void;
}
```

`Box<Dog>` is NOT assignable to `Box<Animal>` and vice versa (in strict mode).

### Practical Impact

```typescript
class Animal {
  name = "animal";
}
class Dog extends Animal {
  breed = "unknown";
}

// Function parameter types are contravariant (in strict mode)
type Handler<T> = (value: T) => void;

const handleAnimal: Handler<Animal> = (a) => console.log(a.name);
const handleDog: Handler<Dog> = handleAnimal; // OK: contravariant

// Return types are covariant
type Factory<T> = () => T;

const makeDog: Factory<Dog> = () => new Dog();
const makeAnimal: Factory<Animal> = makeDog; // OK: covariant
```

### TypeScript 4.7+ Variance Annotations

You can explicitly annotate variance with `in` and `out`:

```typescript
interface ReadonlyBox<out T> {  // covariant
  get(): T;
}

interface WriteOnlyBox<in T> {  // contravariant
  set(value: T): void;
}

interface MutableBox<in out T> {  // invariant
  get(): T;
  set(value: T): void;
}
```

These annotations don't change behavior — they're documentation and a compile-time
check that the variance you declared matches how `T` is actually used.

---

## 14. Common Mistakes

### Mistake 1: Unnecessary Generics

```typescript
// BAD: T is only used once — adds complexity for no benefit
function greet<T extends string>(name: T): string {
  return `Hello, ${name}`;
}

// GOOD
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

**Rule**: If a type parameter only appears once in the function signature, you
probably don't need it.

### Mistake 2: Over-Constraining

```typescript
// BAD: forces callers to pass the exact type { name: string }
function getName<T extends { name: string }>(obj: T): string {
  return obj.name;
}

// The generic is fine here IF you return T (preserving the full type).
// But if you only return string, you don't need the generic:
function getName(obj: { name: string }): string {
  return obj.name;
}
```

### Mistake 3: Using `any` as a Type Argument

```typescript
// BAD: defeats the purpose of generics
const nums = new Stack<any>();

// GOOD: be specific
const nums = new Stack<number>();

// If you truly don't know the type, use unknown
const data = new Stack<unknown>();
```

### Mistake 4: Confusing Interface-Level and Method-Level Type Parameters

```typescript
// This means every instance of Processor works with ONE type
interface Processor<T> {
  process(item: T): T;
}

// This means each call to process can use a DIFFERENT type
interface Processor {
  process<T>(item: T): T;
}
```

These are very different designs — pick the right one for your use case.

### Mistake 5: Forgetting Constraints When Accessing Properties

```typescript
// BAD: T might not have .length
function logLength<T>(arg: T): void {
  console.log(arg.length); // ERROR
}

// GOOD: constrain T
function logLength<T extends { length: number }>(arg: T): void {
  console.log(arg.length); // OK
}
```

### Mistake 6: Creating Overly Complex Generic Types

```typescript
// If your type signature looks like this, reconsider your design:
type ComplexType<
  T extends Record<string, unknown>,
  K extends keyof T,
  V extends T[K],
  R extends Partial<Pick<T, K>>
> = /* ... */;
```

Complex generic types are hard to read, hard to debug, and often have surprising
edge cases. Keep it simple unless complexity is genuinely needed.

### When NOT to Use Generics

- The type parameter appears only once in the signature
- You're working with a fixed, small set of types (use unions or overloads)
- The generic adds complexity but no actual type safety benefit
- The types are so complex that error messages become unreadable

---

## Summary

| Concept | Syntax | Purpose |
|---------|--------|---------|
| Generic function | `function f<T>(x: T): T` | Parameterize over types |
| Multiple params | `<T, U>` | Relate multiple types |
| Constraint | `T extends Shape` | Require minimum structure |
| keyof constraint | `K extends keyof T` | Type-safe property access |
| Generic class | `class C<T>` | Parameterized data structures |
| Generic interface | `interface I<T>` | Parameterized contracts |
| Default param | `<T = string>` | Convenient defaults |
| Type alias | `type A<T> = ...` | Reusable parameterized types |
| Mapped type | `{ [K in keyof T]: ... }` | Transform object types |
| Variance | `in`, `out` | Control subtype relationships |

---

## Further Reading

- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
