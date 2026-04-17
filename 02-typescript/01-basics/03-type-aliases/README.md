# Type Aliases in TypeScript

## Table of Contents

1. [The `type` Keyword](#1-the-type-keyword)
2. [Aliasing Primitives, Unions, and Intersections](#2-aliasing-primitives-unions-and-intersections)
3. [Object Type Aliases vs Interfaces](#3-object-type-aliases-vs-interfaces)
4. [Function Type Aliases](#4-function-type-aliases)
5. [Tuple Type Aliases](#5-tuple-type-aliases)
6. [Union Type Aliases](#6-union-type-aliases)
7. [Discriminated Unions](#7-discriminated-unions)
8. [Intersection Types](#8-intersection-types)
9. [Type Alias vs Interface — Full Comparison](#9-type-alias-vs-interface--full-comparison)
10. [Recursive Type Aliases](#10-recursive-type-aliases)
11. [Conditional Type Aliases (Basic)](#11-conditional-type-aliases-basic)
12. [Template Literal Type Aliases](#12-template-literal-type-aliases)
13. [Extracting and Reusing Types](#13-extracting-and-reusing-types)

---

## 1. The `type` Keyword

A **type alias** gives a name to any type. It does not create a new type — it is
simply a name that refers to an existing type expression.

```typescript
type Age = number;
type Name = string;
type IsActive = boolean;
```

### Syntax

```typescript
type AliasName = TypeExpression;
```

The `type` keyword introduces the alias. The right-hand side can be **any valid
TypeScript type**: a primitive, an object shape, a union, a function signature,
a tuple, a conditional type, and more.

### Key Points

- Type aliases are **resolved at compile time** — they produce no runtime code.
- They are **block-scoped** like `let` and `const`.
- You cannot redeclare a type alias in the same scope.

```typescript
type ID = string;
// type ID = number; // Error: Duplicate identifier 'ID'
```

### Generic Type Aliases

Type aliases support generics:

```typescript
type Container<T> = { value: T };
type Pair<A, B> = [A, B];

const box: Container<number> = { value: 42 };
const entry: Pair<string, number> = ["age", 30];
```

---

## 2. Aliasing Primitives, Unions, and Intersections

### Primitive Aliases

```typescript
type Seconds = number;
type Username = string;
type Flag = boolean;
```

These are useful for **documentation** and **intent**. `Seconds` communicates
meaning that `number` alone does not.

### Union Aliases

```typescript
type StringOrNumber = string | number;
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Nullish<T> = T | null | undefined;
```

### Intersection Aliases

```typescript
type WithId = { id: string };
type WithTimestamp = { createdAt: Date };
type Entity = WithId & WithTimestamp;

// Entity is { id: string; createdAt: Date }
```

Intersections combine multiple types into one that has **all** the members.

---

## 3. Object Type Aliases vs Interfaces

Both can describe object shapes. The syntax differs slightly.

### Type Alias

```typescript
type UserType = {
  name: string;
  age: number;
  email?: string;
};
```

### Interface

```typescript
interface UserInterface {
  name: string;
  age: number;
  email?: string;
}
```

### Key Differences

| Feature                  | `type`           | `interface`       |
|--------------------------|------------------|-------------------|
| Syntax                   | `= { ... }`     | `{ ... }`         |
| Declaration merging      | No               | Yes               |
| `extends`                | No (use `&`)     | Yes               |
| Can alias primitives     | Yes              | No                |
| Can alias unions/tuples  | Yes              | No                |
| Computed properties      | Yes              | No                |
| `implements`             | Yes              | Yes               |

### Extending

```typescript
// Interface extends interface
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// Type alias extends via intersection
type AnimalType = { name: string };
type DogType = AnimalType & { breed: string };

// Interface extends type alias
interface Cat extends AnimalType {
  indoor: boolean;
}

// Type alias intersects interface
type Bird = Animal & { wingspan: number };
```

### Declaration Merging (interfaces only)

```typescript
interface Config {
  debug: boolean;
}
interface Config {
  verbose: boolean;
}
// Config is now { debug: boolean; verbose: boolean }
```

Type aliases **cannot** be merged:

```typescript
type Settings = { debug: boolean };
// type Settings = { verbose: boolean }; // Error: Duplicate identifier
```

---

## 4. Function Type Aliases

Function type aliases describe a callable signature.

### Basic Syntax

```typescript
type Formatter = (input: string) => string;
type Comparator<T> = (a: T, b: T) => number;
type Predicate<T> = (item: T) => boolean;
type AsyncFetcher<T> = (url: string) => Promise<T>;
```

### Using Function Type Aliases

```typescript
type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const multiply: MathOp = (a, b) => a * b;

function apply(op: MathOp, x: number, y: number): number {
  return op(x, y);
}

console.log(apply(add, 3, 4));      // 7
console.log(apply(multiply, 3, 4)); // 12
```

### Call Signatures vs Arrow Syntax

```typescript
// Arrow syntax (most common)
type Greet = (name: string) => string;

// Object type with call signature (supports overloads)
type GreetOverloaded = {
  (name: string): string;
  (first: string, last: string): string;
};
```

### Construct Signatures

```typescript
type Constructor<T> = new (...args: unknown[]) => T;
```

---

## 5. Tuple Type Aliases

Tuples are fixed-length arrays where each position has a specific type.

```typescript
type Point2D = [number, number];
type Point3D = [number, number, number];
type Entry = [string, number];
type NamedColor = [name: string, r: number, g: number, b: number];
```

### Labeled Tuples

TypeScript supports **labels** for documentation:

```typescript
type Range = [start: number, end: number];

function clamp(value: number, [start, end]: Range): number {
  return Math.min(Math.max(value, start), end);
}
```

### Optional and Rest Elements

```typescript
type FlexiblePoint = [number, number, number?];
type StringList = [string, ...string[]];
type HeadAndTail<T> = [T, ...T[]];
```

### Readonly Tuples

```typescript
type ReadonlyPair = readonly [string, number];

const pair: ReadonlyPair = ["hello", 42];
// pair[0] = "world"; // Error: Cannot assign to '0'
// pair.push(1);       // Error: Property 'push' does not exist
```

---

## 6. Union Type Aliases

Union types allow a value to be **one of several types**.

### String Literal Unions

```typescript
type Status = "loading" | "success" | "error";
type Direction = "north" | "south" | "east" | "west";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type LogLevel = "debug" | "info" | "warn" | "error";
```

### Numeric Literal Unions

```typescript
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type HttpSuccessCode = 200 | 201 | 204;
```

### Mixed Unions

```typescript
type Identifier = string | number;
type Padding = number | string;

function pad(value: string, padding: Padding): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + value;
  }
  return padding + value;
}
```

### Boolean-like Unions

```typescript
type Toggle = "on" | "off";
type Tristate = true | false | null;
```

### Narrowing Unions

TypeScript narrows unions through **type guards**:

```typescript
type Shape = { kind: "circle"; radius: number }
            | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}
```

---

## 7. Discriminated Unions

A **discriminated union** (also called a **tagged union**) is a union of object
types that share a common literal field — the **discriminant**.

### Pattern

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

The `ok` field is the discriminant. TypeScript uses it to narrow the type.

### Exhaustive Switch

```typescript
type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET"; payload: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    case "RESET":
      return action.payload;
  }
}
```

Because all cases are handled and each returns, TypeScript infers the return
type as `number` with no `undefined`.

### Exhaustiveness Checking with `never`

```typescript
type Color = "red" | "green" | "blue";

function toHex(color: Color): string {
  switch (color) {
    case "red":   return "#ff0000";
    case "green": return "#00ff00";
    case "blue":  return "#0000ff";
    default: {
      const _exhaustive: never = color;
      return _exhaustive;
    }
  }
}
```

If a new variant is added to `Color` but the switch is not updated, TypeScript
will produce a compile error at the `never` assignment.

### Real-World Example: API Response

```typescript
type ApiResponse<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function renderResponse<T>(response: ApiResponse<T>): string {
  switch (response.status) {
    case "idle":
      return "Waiting...";
    case "loading":
      return "Loading...";
    case "success":
      return `Data: ${JSON.stringify(response.data)}`;
    case "error":
      return `Error: ${response.message}`;
  }
}
```

---

## 8. Intersection Types

Intersection types combine multiple types with the `&` operator. The resulting
type has **all** members of every constituent type.

### Combining Object Types

```typescript
type HasName = { name: string };
type HasAge = { age: number };
type HasEmail = { email: string };

type Person = HasName & HasAge;
type ContactablePerson = Person & HasEmail;

const person: ContactablePerson = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
};
```

### Intersection with Primitives

Intersecting incompatible primitives produces `never`:

```typescript
type Impossible = string & number; // never
```

### Practical Use: Mixins

```typescript
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type SoftDeletable = {
  deletedAt: Date | null;
  isDeleted: boolean;
};

type BaseEntity = {
  id: string;
};

type FullEntity = BaseEntity & Timestamped & SoftDeletable;
```

### Intersection vs Union

| Aspect         | Union (`\|`)             | Intersection (`&`)           |
|----------------|--------------------------|------------------------------|
| Meaning        | One of the types         | All of the types combined    |
| Access members | Only shared members      | All members from all types   |
| Assignability  | Any constituent suffices | Must satisfy all constituents |

### Conflicting Properties

When two types have the same property with different types, the intersection
produces the **intersection** of those property types:

```typescript
type A = { x: string; y: number };
type B = { x: number; z: boolean };
type AB = A & B;
// AB.x is string & number = never
// AB.y is number
// AB.z is boolean
```

This is usually a bug. Be careful when intersecting types with overlapping keys.

---

## 9. Type Alias vs Interface — Full Comparison

### When to Use `type`

- Aliasing primitives: `type ID = string`
- Union types: `type Status = "a" | "b"`
- Tuple types: `type Pair = [string, number]`
- Function types: `type Fn = () => void`
- Mapped types, conditional types, template literal types
- When you need a type that cannot be expressed as an interface

### When to Use `interface`

- Object shapes that may need to be **extended** or **merged**
- Public API surfaces where consumers might augment declarations
- Class contracts (`implements`)
- When you want declaration merging (e.g., augmenting third-party types)

### Side-by-Side

```typescript
// ---------- Type Alias ----------
type PointT = {
  x: number;
  y: number;
};

type LabeledPointT = PointT & { label: string };

type ToStringT = (value: unknown) => string;

type StatusT = "active" | "inactive";

type TreeT<T> = {
  value: T;
  children: TreeT<T>[];
};

// ---------- Interface ----------
interface PointI {
  x: number;
  y: number;
}

interface LabeledPointI extends PointI {
  label: string;
}

// No direct equivalent for union or function alias
// interface StatusI = "active" | "inactive"; // Not possible
```

### Performance Note

The TypeScript compiler can **cache** interface types by name. Deeply nested
intersections of type aliases can sometimes be slower for the compiler to
resolve than equivalent `extends` chains with interfaces. For most codebases
this difference is negligible.

---

## 10. Recursive Type Aliases

Type aliases can reference themselves, enabling recursive data structures.

### Tree

```typescript
type Tree<T> = {
  value: T;
  children: Tree<T>[];
};

const tree: Tree<string> = {
  value: "root",
  children: [
    { value: "child1", children: [] },
    {
      value: "child2",
      children: [
        { value: "grandchild", children: [] },
      ],
    },
  ],
};
```

### Linked List

```typescript
type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

const list: LinkedList<number> = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};
```

### JSON Type

```typescript
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

const data: Json = {
  name: "Alice",
  scores: [100, 95, 88],
  active: true,
  address: { city: "NYC", zip: null },
};
```

### Recursive Depth Limits

TypeScript enforces a depth limit on recursive type instantiation. Deeply nested
recursion (especially with conditional types) may hit limits:

```typescript
// This works fine for practical depths
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

---

## 11. Conditional Type Aliases (Basic)

Conditional types follow the syntax:

```typescript
type Result = A extends B ? TrueType : FalseType;
```

### Basic Examples

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false
```

### Extracting Types

```typescript
type ElementType<T> = T extends (infer U)[] ? U : never;

type X = ElementType<string[]>;  // string
type Y = ElementType<number[]>;  // number
type Z = ElementType<boolean>;   // never
```

### Distributive Conditional Types

When `T` is a **naked type parameter** in `T extends ...`, unions are
distributed:

```typescript
type ToArray<T> = T extends unknown ? T[] : never;

type R = ToArray<string | number>;
// = (string extends unknown ? string[] : never)
//   | (number extends unknown ? number[] : never)
// = string[] | number[]
```

To prevent distribution, wrap in a tuple:

```typescript
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type R2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### Exclude and Extract (built-in)

```typescript
type T1 = Exclude<"a" | "b" | "c", "a">;       // "b" | "c"
type T2 = Extract<"a" | "b" | "c", "a" | "d">; // "a"
```

These are defined using conditional types:

```typescript
// Built-in definitions:
// type Exclude<T, U> = T extends U ? never : T;
// type Extract<T, U> = T extends U ? T : never;
```

---

## 12. Template Literal Type Aliases

Template literal types construct string literal types using template syntax.

### Basic Usage

```typescript
type EventName = `on${string}`;

const a: EventName = "onClick";   // OK
const b: EventName = "onHover";   // OK
// const c: EventName = "click";  // Error
```

### Combining Literal Unions

```typescript
type Color = "red" | "blue";
type Size = "small" | "large";
type ColorSize = `${Color}-${Size}`;
// "red-small" | "red-large" | "blue-small" | "blue-large"
```

### CSS Unit Type

```typescript
type CSSUnit = "px" | "em" | "rem" | "%";
type CSSValue = `${number}${CSSUnit}`;

const width: CSSValue = "100px";   // OK
const height: CSSValue = "2.5em";  // OK
// const bad: CSSValue = "100";    // Error
```

### Event Handler Pattern

```typescript
type DOMEvent = "click" | "focus" | "blur" | "input";
type EventHandler = `on${Capitalize<DOMEvent>}`;
// "onClick" | "onFocus" | "onBlur" | "onInput"
```

### Built-in String Manipulation Types

```typescript
type Upper = Uppercase<"hello">;     // "HELLO"
type Lower = Lowercase<"HELLO">;     // "hello"
type Cap   = Capitalize<"hello">;    // "Hello"
type Uncap = Uncapitalize<"Hello">;  // "hello"
```

---

## 13. Extracting and Reusing Types

TypeScript provides operators to **derive** types from existing values and types.

### `typeof` — Type from a Value

```typescript
const config = {
  host: "localhost",
  port: 3000,
  debug: false,
};

type Config = typeof config;
// { host: string; port: number; debug: boolean }
```

Combine with `as const` for literal types:

```typescript
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
} as const;

type Routes = typeof ROUTES;
// { readonly home: "/"; readonly about: "/about"; readonly contact: "/contact" }
```

### `keyof` — Keys of a Type

```typescript
type Config = { host: string; port: number; debug: boolean };
type ConfigKey = keyof Config; // "host" | "port" | "debug"
```

### Indexed Access Types

```typescript
type Config = { host: string; port: number; debug: boolean };

type HostType = Config["host"];           // string
type PortOrDebug = Config["port" | "debug"]; // number | boolean
type AllValues = Config[keyof Config];    // string | number | boolean
```

### Extracting Array Element Type

```typescript
const roles = ["admin", "editor", "viewer"] as const;
type Role = (typeof roles)[number]; // "admin" | "editor" | "viewer"
```

### Extracting Function Return Type

```typescript
function fetchUser() {
  return { id: 1, name: "Alice", active: true };
}

type User = ReturnType<typeof fetchUser>;
// { id: number; name: string; active: boolean }
```

### Extracting Function Parameters

```typescript
function createUser(name: string, age: number, active: boolean) {
  return { name, age, active };
}

type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number, active: boolean]
```

### Combining Techniques

```typescript
const EVENTS = ["click", "hover", "scroll"] as const;
type EventName = (typeof EVENTS)[number]; // "click" | "hover" | "scroll"
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onHover" | "onScroll"

type EventHandlerMap = {
  [K in EventHandler]: () => void;
};
// { onClick: () => void; onHover: () => void; onScroll: () => void }
```

---

## Summary

| Concept                   | Example                                              |
|---------------------------|------------------------------------------------------|
| Basic alias               | `type ID = string`                                   |
| Object alias              | `type User = { name: string }`                       |
| Function alias            | `type Fn = (x: number) => string`                    |
| Tuple alias               | `type Pair = [string, number]`                       |
| Union alias               | `type Status = "a" \| "b"`                           |
| Discriminated union       | `{ kind: "circle"; r: number } \| { kind: "rect" }` |
| Intersection              | `type AB = A & B`                                    |
| Recursive alias           | `type Tree<T> = { value: T; children: Tree<T>[] }`  |
| Conditional alias         | `type IsStr<T> = T extends string ? true : false`    |
| Template literal alias    | `` type Ev = `on${string}` ``                        |
| `typeof`                  | `type C = typeof config`                             |
| `keyof`                   | `type K = keyof User`                                |
| Indexed access            | `type V = User["name"]`                              |

---

## References

- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook — Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)
- [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook — Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook — Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
