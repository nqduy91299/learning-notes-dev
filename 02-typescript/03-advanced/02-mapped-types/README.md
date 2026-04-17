# Mapped Types in TypeScript

> **Prerequisites**: Generics, `keyof`, indexed access types, conditional types basics.
> **Reference**: [TypeScript Handbook — Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)

---

## Table of Contents

1. [What Are Mapped Types?](#1-what-are-mapped-types)
2. [Basic Syntax](#2-basic-syntax)
3. [Mapping Over `keyof`](#3-mapping-over-keyof)
4. [Modifier Manipulation](#4-modifier-manipulation)
5. [Key Remapping with `as`](#5-key-remapping-with-as)
6. [Filtering Keys](#6-filtering-keys)
7. [Rebuilding Built-in Utility Types](#7-rebuilding-built-in-utility-types)
8. [Record Implementation](#8-record-implementation)
9. [Template Literal Keys](#9-template-literal-keys)
10. [Combining with Conditional Types](#10-combining-with-conditional-types)
11. [Recursive Mapped Types](#11-recursive-mapped-types)
12. [Practical Patterns](#12-practical-patterns)
13. [Common Mistakes](#13-common-mistakes)

---

## 1. What Are Mapped Types?

A **mapped type** iterates over a set of keys to produce a new object type — like
a `for...in` loop at the type level:

```typescript
// JavaScript runtime
for (const key in source) { result[key] = transform(source[key]); }

// TypeScript type level
type Mapped<T> = { [K in keyof T]: Transform<T[K]> };
```

Without mapped types you'd repeat every property by hand. Mapped types keep your
types **DRY** and **in sync** with the types they derive from.

---

## 2. Basic Syntax

```typescript
type MappedType = {
  [K in Keys]: ValueType;
};
```

- `K` — type variable bound to each key in turn
- `Keys` — a union of string literal types (or `string | number | symbol`)
- `ValueType` — the type assigned to each property

```typescript
type Flags = { [K in "a" | "b" | "c"]: boolean };
// { a: boolean; b: boolean; c: boolean }

type AllStrings<Keys extends string> = { [K in Keys]: string };
type AB = AllStrings<"a" | "b">; // { a: string; b: string }
```

---

## 3. Mapping Over `keyof`

The most common pattern maps over the keys of an existing type. `T[K]` (an
**indexed access type**) gives you the type of property `K` in `T`:

```typescript
type Clone<T> = { [K in keyof T]: T[K] };
```

When you map over `keyof T`, TypeScript **preserves** `readonly` and `?` modifiers.
This is called a **homomorphic** mapped type:

```typescript
interface Config { readonly host: string; port?: number }
type Cloned = Clone<Config>;
// { readonly host: string; port?: number }  — modifiers preserved
```

---

## 4. Modifier Manipulation

Add or remove `readonly` and `?` using `+` / `-` prefixes:

```typescript
// Add readonly (+ is default and can be omitted)
type Locked<T>   = { +readonly [K in keyof T]: T[K] };

// Add optional
type Relaxed<T>  = { [K in keyof T]+?: T[K] };

// Remove readonly
type Mutable<T>  = { -readonly [K in keyof T]: T[K] };

// Remove optional (make required)
type Concrete<T> = { [K in keyof T]-?: T[K] };

// Both at once
type MutableRequired<T> = { -readonly [K in keyof T]-?: T[K] };
```

### How `-?` Handles `undefined`

`-?` removes optionality but does **not** strip explicit `undefined`:

```typescript
interface Ex { a?: string; b?: string | undefined; c: string | undefined }
type Req = { [K in keyof Ex]-?: Ex[K] };
// { a: string;  b: string | undefined;  c: string | undefined }
//   ^ undefined from ? removed    ^ explicit undefined kept
```

---

## 5. Key Remapping with `as`

Transform keys during mapping (TS 4.1+):

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Point { x: number; y: number }
type PointSetters = Setters<Point>;
// { setX: (value: number) => void; setY: (value: number) => void }
```

**Why `string & K`?** — `keyof T` can be `string | number | symbol`, but
`Capitalize` only accepts `string`. The intersection narrows `K` to string keys.

---

## 6. Filtering Keys

Remap a key to `never` to exclude it:

```typescript
// Keep only string-valued properties
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed { name: string; age: number; label: string; active: boolean }
type OnlyStrings = StringProps<Mixed>; // { name: string; label: string }
```

### Filter by Key Name

```typescript
type PublicProps<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

interface Internal { _id: number; _secret: string; name: string; email: string }
type Public = PublicProps<Internal>; // { name: string; email: string }
```

### Combined Filter + Transform

```typescript
type DataGetters<T> = {
  [K in keyof T as T[K] extends Function
    ? never
    : `get${Capitalize<string & K>}`]: () => T[K];
};
```

---

## 7. Rebuilding Built-in Utility Types

```typescript
type MyPartial<T>  = { [K in keyof T]?: T[K] };
type MyRequired<T> = { [K in keyof T]-?: T[K] };
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};
// Alternative: { [P in Exclude<keyof T, K>]: T[P] }
```

---

## 8. Record Implementation

```typescript
type MyRecord<K extends string | number | symbol, V> = { [P in K]: V };
```

```typescript
type Roles = "admin" | "editor" | "viewer";
type Permissions = Record<Roles, boolean>;
// { admin: boolean; editor: boolean; viewer: boolean }
```

**Record vs. index signature**: `Record<"a" | "b", number>` enforces exactly
`{ a: number; b: number }`, while `{ [key: string]: number }` allows any string key.

---

## 9. Template Literal Keys

Template literal types + mapped types generate computed property names:

```typescript
type EventConfig<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    newValue: T[K], oldValue: T[K],
  ) => void;
};

interface FormData { username: string; email: string; age: number }
type FormEvents = EventConfig<FormData>;
// { onUsernameChange: ...; onEmailChange: ...; onAgeChange: ... }
```

### Prefixed Keys

```typescript
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};
type DataFields = Prefixed<{ name: string; age: number }, "data">;
// { dataName: string; dataAge: number }
```

---

## 10. Combining with Conditional Types

### Nullable Properties

```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

### Extract Keys by Value Type

```typescript
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

interface API { baseUrl: string; fetch(): void; post(): void }
type Fns = FunctionKeys<API>; // "fetch" | "post"
```

### Conditional Value Transformation

```typescript
type Boxed<T> = {
  [K in keyof T]: T[K] extends string
    ? { value: T[K]; format: "text" }
    : T[K] extends number
      ? { value: T[K]; format: "number" }
      : { value: T[K]; format: "other" };
};
```

---

## 11. Recursive Mapped Types

### DeepPartial

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepPartial<T[K]>
    : T[K];
};
```

### DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K];
};
```

### Handling Arrays

Arrays are objects, so naive recursion maps over their indices. Handle explicitly:

```typescript
type DeepPartialSafe<T> = T extends (infer U)[]
  ? DeepPartialSafe<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartialSafe<T[K]> }
    : T;
```

---

## 12. Practical Patterns

### Form Validation Errors

```typescript
type ValidationErrors<T> = { [K in keyof T]?: string[] };
```

### API Response Wrapper

```typescript
type APIResponse<T> = {
  [K in keyof T]: { data: T[K]; loading: boolean; error: string | null };
};
```

### Event Emitter Typing

```typescript
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (event: T[K]) => void;
};
```

### Mapped Discriminated Unions

```typescript
type ActionMap<T> = {
  [K in keyof T]: { type: K; payload: T[K] };
}[keyof T];

interface Payloads { increment: number; reset: undefined; setName: string }
type Action = ActionMap<Payloads>;
// { type: "increment"; payload: number } | { type: "reset"; ... } | ...
```

### Builder Pattern Types

```typescript
type Builder<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => Builder<T>;
} & { build(): T };
```

### Immutable State Updates

```typescript
type Update<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer _> ? T[K] : Update<T[K]>
    : T[K];
};
```

---

## 13. Common Mistakes

### Mistake 1: Forgetting `string & K`

```typescript
// ❌ Error: K might be number or symbol
type Bad<T> = { [K in keyof T as `get${Capitalize<K>}`]: T[K] };

// ✅ Narrow to string
type Good<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: T[K] };
```

### Mistake 2: Infinite Recursion

```typescript
// ❌ No base case
type Bad<T> = { readonly [K in keyof T]: Bad<T[K]> };

// ✅ Stop at primitives and functions
type Good<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : Good<T[K]>
    : T[K];
};
```

### Mistake 3: Homomorphic vs Non-Homomorphic

`[K in keyof T]` preserves modifiers. `[K in SomeOtherUnion]` does **not**:

```typescript
interface Cfg { readonly host: string; port?: number }

type A = { [K in keyof Cfg]: Cfg[K] };     // readonly + optional preserved
type Keys = keyof Cfg;
type B = { [K in Keys]: Cfg[K] };           // modifiers LOST
```

### Mistake 4: Partial for Specific Keys

```typescript
// ❌ Makes ALL keys optional
type AllOptional<T> = { [K in keyof T]?: T[K] };

// ✅ Make only specific keys optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

---

## Summary

| Concept                 | Syntax                                               |
|-------------------------|------------------------------------------------------|
| Basic mapped type       | `{ [K in keyof T]: T[K] }`                          |
| Add readonly            | `{ readonly [K in keyof T]: T[K] }`                 |
| Remove readonly         | `{ -readonly [K in keyof T]: T[K] }`                |
| Add optional            | `{ [K in keyof T]?: T[K] }`                         |
| Remove optional         | `{ [K in keyof T]-?: T[K] }`                        |
| Key remapping           | `{ [K in keyof T as NewKey]: T[K] }`                |
| Filter keys             | `{ [K in keyof T as Cond ? K : never]: T[K] }`      |
| Record                  | `{ [K in Keys]: Value }`                             |
| Template literal keys   | `{ [K in keyof T as \`prefix${K}\`]: T[K] }`        |
| Conditional values      | `{ [K in keyof T]: T[K] extends X ? A : B }`        |
| Recursive (DeepPartial) | `{ [K in keyof T]?: ... extends object ? Deep<> : T[K] }` |
