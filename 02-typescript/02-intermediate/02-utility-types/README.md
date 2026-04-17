# Utility Types

TypeScript ships with a collection of **utility types** that transform existing
types into new ones. They are built on mapped types, conditional types, and
template literal types — all features of the type system itself. Understanding
them deeply means you can read their implementations, compose them, and build
your own.

> **Reference**: [TypeScript Handbook — Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

## Table of Contents

1. [Partial\<T\>](#1-partialt)
2. [Required\<T\>](#2-requiredt)
3. [Readonly\<T\>](#3-readonlyt)
4. [Record\<K, T\>](#4-recordk-t)
5. [Pick\<T, K\>](#5-pickt-k)
6. [Omit\<T, K\>](#6-omitt-k)
7. [Exclude\<T, U\>](#7-excludet-u)
8. [Extract\<T, U\>](#8-extractt-u)
9. [NonNullable\<T\>](#9-nonnullablet)
10. [Parameters\<T\>](#10-parameterst)
11. [ReturnType\<T\>](#11-returntypet)
12. [ConstructorParameters\<T\>](#12-constructorparameterst)
13. [InstanceType\<T\>](#13-instancetypet)
14. [Awaited\<T\>](#14-awaitedt)
15. [ThisParameterType\<T\> and OmitThisParameter\<T\>](#15-thisparametertypet-and-omitthisparametert)
16. [String Manipulation Types](#16-string-manipulation-types)
17. [Combining Utility Types](#17-combining-utility-types)
18. [Building Your Own Utility Types](#18-building-your-own-utility-types)

---

## 1. Partial\<T\>

`Partial<T>` makes every property of `T` optional.

### Built-in implementation

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

This is a **mapped type**: it iterates over every key `P` in `keyof T` and
re-declares the property with the `?` modifier.

### Example

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

function updateUser(id: number, patch: Partial<User>): void {
  // patch.name is string | undefined
  // patch.email is string | undefined
  console.log(`Updating user ${id}`, patch);
}

updateUser(1, { name: "Alice" }); // OK — email not required
```

### When to use

- **Patch / update functions** where only some fields are provided.
- **Builder patterns** that accumulate fields over time.

---

## 2. Required\<T\>

The opposite of `Partial`: every property becomes required, removing `?`.

### Built-in implementation

```ts
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

The `-?` syntax *removes* the optional modifier.

### Example

```ts
interface Config {
  host?: string;
  port?: number;
  ssl?: boolean;
}

// All fields are now mandatory
type ResolvedConfig = Required<Config>;

const config: ResolvedConfig = {
  host: "localhost",
  port: 3000,
  ssl: false,
};
```

### When to use

- Ensuring a fully-resolved configuration after merging defaults.
- Asserting that optional fields have been populated before use.

---

## 3. Readonly\<T\>

Marks every property as `readonly`.

### Built-in implementation

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

### Example

```ts
interface Point {
  x: number;
  y: number;
}

const origin: Readonly<Point> = { x: 0, y: 0 };
// origin.x = 1; // Error: Cannot assign to 'x' because it is a read-only property
```

> **Note**: `Readonly` is shallow. Nested objects remain mutable unless you
> apply it recursively (see [DeepReadonly](#18-building-your-own-utility-types)).

---

## 4. Record\<K, T\>

Constructs an object type whose keys are `K` and whose values are `T`.

### Built-in implementation

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

`keyof any` resolves to `string | number | symbol` — any valid key type.

### Example

```ts
type Role = "admin" | "editor" | "viewer";

interface Permissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

const rolePermissions: Record<Role, Permissions> = {
  admin:  { read: true,  write: true,  delete: true },
  editor: { read: true,  write: true,  delete: false },
  viewer: { read: true,  write: false, delete: false },
};
```

### When to use

- Look-up tables keyed by a known union of strings.
- Dictionaries where you want a consistent value shape.

---

## 5. Pick\<T, K\>

Selects a subset of properties from `T`.

### Built-in implementation

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

### Example

```ts
interface Article {
  id: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

type ArticlePreview = Pick<Article, "id" | "title">;
// { id: number; title: string }
```

### When to use

- Creating DTO / view-model types from domain models.
- Narrowing function parameters to only the fields they need.

---

## 6. Omit\<T, K\>

The complement of `Pick` — removes specified keys.

### Built-in implementation

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

Note that it composes `Pick` and `Exclude` internally.

### Example

```ts
interface Article {
  id: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

type CreateArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt">;
// { title: string; body: string }
```

### When to use

- Deriving "creation" or "input" types from full entity types.
- Removing internal / computed fields before exposing an API type.

---

## 7. Exclude\<T, U\>

Works on **union types**. Removes from `T` all members that are assignable to `U`.

### Built-in implementation

```ts
type Exclude<T, U> = T extends U ? never : T;
```

This relies on **distributive conditional types**: when `T` is a union, the
conditional distributes over each member independently.

### Example

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ReadOnlyMethod = Exclude<HttpMethod, "POST" | "PUT" | "DELETE" | "PATCH">;
// "GET"
```

---

## 8. Extract\<T, U\>

The opposite of `Exclude`: keeps only the members of `T` assignable to `U`.

### Built-in implementation

```ts
type Extract<T, U> = T extends U ? T : never;
```

### Example

```ts
type AllEvents = "click" | "scroll" | "mousemove" | "keydown" | "keyup";
type KeyEvents = Extract<AllEvents, `key${string}`>;
// "keydown" | "keyup"
```

This also works with non-string unions:

```ts
type Primitives = string | number | boolean | null | undefined;
type Serializable = Extract<Primitives, string | number | boolean>;
// string | number | boolean
```

---

## 9. NonNullable\<T\>

Removes `null` and `undefined` from a type.

### Built-in implementation

```ts
type NonNullable<T> = T & {};
```

(Older versions used `T extends null | undefined ? never : T`.)

### Example

```ts
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// string
```

### When to use

- After a runtime null-check when you want to reflect the narrowed type.
- Cleaning up types returned by external libraries.

---

## 10. Parameters\<T\>

Extracts the parameter types of a function as a **tuple**.

### Built-in implementation

```ts
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
```

### Example

```ts
function createUser(name: string, age: number, admin: boolean) {
  return { name, age, admin };
}

type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number, admin: boolean]

// Access individual parameter types:
type FirstParam = CreateUserParams[0]; // string
```

### When to use

- Writing wrappers / decorators around existing functions.
- Generating test-helper signatures automatically.

---

## 11. ReturnType\<T\>

Extracts the return type of a function.

### Built-in implementation

```ts
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

### Example

```ts
function fetchUsers() {
  return [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
}

type Users = ReturnType<typeof fetchUsers>;
// { id: number; name: string }[]
```

### When to use

- Deriving types from functions without duplicating their return shape.
- Typing variables that store the result of a function call.

---

## 12. ConstructorParameters\<T\>

Like `Parameters`, but for constructor functions (classes).

### Built-in implementation

```ts
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;
```

### Example

```ts
class HttpClient {
  constructor(
    public baseUrl: string,
    public timeout: number,
  ) {}
}

type HttpClientArgs = ConstructorParameters<typeof HttpClient>;
// [baseUrl: string, timeout: number]
```

---

## 13. InstanceType\<T\>

Extracts the instance type from a constructor function.

### Built-in implementation

```ts
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;
```

### Example

```ts
class Logger {
  log(msg: string) {
    console.log(msg);
  }
}

type LoggerInstance = InstanceType<typeof Logger>;
// Logger

function createInstance<T extends new (...args: any[]) => any>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}

const logger = createInstance(Logger); // Logger
```

---

## 14. Awaited\<T\>

Recursively unwraps `Promise` (and *thenable*) types.

### Built-in implementation (simplified)

```ts
type Awaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
    ? F extends (value: infer V, ...args: infer _) => any
      ? Awaited<V>   // recursive unwrap
      : never
    : T;
```

### Example

```ts
type A = Awaited<Promise<string>>;              // string
type B = Awaited<Promise<Promise<number>>>;     // number  (recursive!)
type C = Awaited<boolean | Promise<boolean>>;   // boolean
```

### When to use

- Typing the resolved value of deeply-nested or chained promises.
- Used internally by `Promise.all`, `Promise.race`, etc.

---

## 15. ThisParameterType\<T\> and OmitThisParameter\<T\>

### ThisParameterType

Extracts the type of the `this` parameter if one is declared.

```ts
function toHex(this: number) {
  return this.toString(16);
}

type T = ThisParameterType<typeof toHex>; // number
```

### OmitThisParameter

Returns a function type with `this` removed — useful when you need to `.bind()`
a method and want the resulting signature.

```ts
type BoundToHex = OmitThisParameter<typeof toHex>;
// () => string

const bound: BoundToHex = toHex.bind(255);
console.log(bound()); // "ff"
```

---

## 16. String Manipulation Types

TypeScript provides four intrinsic (compiler-implemented) string types:

| Type                 | Effect                                |
|----------------------|---------------------------------------|
| `Uppercase<S>`       | `"hello"` → `"HELLO"`                |
| `Lowercase<S>`       | `"HELLO"` → `"hello"`                |
| `Capitalize<S>`      | `"hello"` → `"Hello"`                |
| `Uncapitalize<S>`    | `"Hello"` → `"hello"`                |

### Example

```ts
type Env = "development" | "staging" | "production";
type EnvUpper = Uppercase<Env>;
// "DEVELOPMENT" | "STAGING" | "PRODUCTION"

type EventName = "click" | "scroll";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onScroll"
```

These are particularly powerful when combined with **template literal types**
for type-safe event systems, CSS-in-JS property names, and similar patterns.

### Practical pattern: type-safe event emitter

```ts
type EventMap = {
  userCreated: { id: number; name: string };
  orderPlaced: { orderId: string; total: number };
};

type OnHandler<T extends string> = `on${Capitalize<T>}`;

type Handlers = {
  [K in keyof EventMap as OnHandler<K & string>]: (payload: EventMap[K]) => void;
};

// Handlers = {
//   onUserCreated: (payload: { id: number; name: string }) => void;
//   onOrderPlaced: (payload: { orderId: string; total: number }) => void;
// }
```

---

## 17. Combining Utility Types

The real power comes from **composing** these types together.

### Partial + Pick: make only some fields optional

```ts
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type UserUpdate = PartialPick<User, "email" | "age">;
// { id: number; name: string; email?: string; age?: number }
```

### Required + Pick: make only some fields required

```ts
type RequiredPick<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

interface FormData {
  name?: string;
  email?: string;
  age?: number;
}

type ValidatedForm = RequiredPick<FormData, "name" | "email">;
// { name: string; email: string; age?: number }
```

### Readonly + Omit: immutable subset

```ts
type ImmutableEntity<T, K extends keyof T> = Readonly<Pick<T, K>> &
  Omit<T, K>;

type UserWithImmutableId = ImmutableEntity<User, "id">;
// { readonly id: number; name: string; email: string; age: number }
```

### Record + Pick: type-safe index

```ts
type StatusCode = 200 | 301 | 404 | 500;
type StatusInfo = Pick<Response, "statusText"> & { description: string };
type StatusMap = Record<StatusCode, StatusInfo>;
```

---

## 18. Building Your Own Utility Types

### DeepPartial

Recursively makes every nested property optional:

```ts
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface NestedConfig {
  db: {
    host: string;
    port: number;
    credentials: {
      user: string;
      password: string;
    };
  };
  server: {
    port: number;
  };
}

type PatchConfig = DeepPartial<NestedConfig>;
// db?.host?, db?.port?, db?.credentials?.user?, etc.

const patch: PatchConfig = {
  db: { credentials: { user: "admin" } }, // OK
};
```

### DeepReadonly

```ts
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;
```

### Mutable (remove readonly)

```ts
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

const point: Mutable<Readonly<{ x: number; y: number }>> = { x: 0, y: 0 };
point.x = 5; // OK
```

### Nullable / Optional union helpers

```ts
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;
```

### PickByType — pick properties whose values extend a target type

```ts
type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface Mixed {
  id: number;
  name: string;
  active: boolean;
  score: number;
}

type NumericFields = PickByType<Mixed, number>;
// { id: number; score: number }
```

### OmitByType

```ts
type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

type NonNumeric = OmitByType<Mixed, number>;
// { name: string; active: boolean }
```

### RequireAtLeastOne

```ts
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
```

### ExclusiveUnion (XOR)

```ts
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

// Either { a: string } or { b: number }, never both
type Either = XOR<{ a: string }, { b: number }>;
```

---

## Summary

| Utility                     | Category              | Purpose                                 |
|-----------------------------|-----------------------|-----------------------------------------|
| `Partial<T>`               | Mapped modifier       | Make all props optional                 |
| `Required<T>`              | Mapped modifier       | Make all props required                 |
| `Readonly<T>`              | Mapped modifier       | Make all props readonly                 |
| `Record<K, T>`             | Mapped constructor    | Build object type from keys + values    |
| `Pick<T, K>`               | Mapped selector       | Keep subset of props                    |
| `Omit<T, K>`               | Mapped selector       | Remove subset of props                  |
| `Exclude<T, U>`            | Conditional (union)   | Remove union members                    |
| `Extract<T, U>`            | Conditional (union)   | Keep union members                      |
| `NonNullable<T>`           | Conditional (union)   | Remove null/undefined                   |
| `Parameters<T>`            | Conditional (infer)   | Function param tuple                    |
| `ReturnType<T>`            | Conditional (infer)   | Function return type                    |
| `ConstructorParameters<T>` | Conditional (infer)   | Constructor param tuple                 |
| `InstanceType<T>`          | Conditional (infer)   | Class instance type                     |
| `Awaited<T>`               | Conditional (recurse) | Unwrap Promise                          |
| `ThisParameterType<T>`     | Conditional (infer)   | Extract `this` type                     |
| `OmitThisParameter<T>`     | Conditional (infer)   | Remove `this` from fn signature         |
| `Uppercase<S>`             | Intrinsic string      | Uppercase string literal                |
| `Lowercase<S>`             | Intrinsic string      | Lowercase string literal                |
| `Capitalize<S>`            | Intrinsic string      | Capitalize first letter                 |
| `Uncapitalize<S>`          | Intrinsic string      | Uncapitalize first letter               |

Understanding these types — especially their implementations — gives you a
strong foundation for advanced TypeScript patterns like branded types,
type-state machines, and fully type-safe API layers.
