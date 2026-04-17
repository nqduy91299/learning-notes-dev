# Template Literal Types in TypeScript

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Syntax](#basic-syntax)
3. [String Unions in Template Literals](#string-unions-in-template-literals)
4. [Intrinsic String Manipulation Types](#intrinsic-string-manipulation-types)
5. [Pattern Matching with Template Literals](#pattern-matching-with-template-literals)
6. [Key Remapping with Template Literals](#key-remapping-with-template-literals)
7. [Event Handler Pattern](#event-handler-pattern)
8. [CSS-like Type Patterns](#css-like-type-patterns)
9. [Combining with Mapped Types](#combining-with-mapped-types)
10. [Practical Patterns](#practical-patterns)
11. [Summary](#summary)

---

## Introduction

Template literal types build on string literal types and allow you to construct
new string literal types by combining other types inside template literal syntax.
They use the same backtick syntax as JavaScript template literals but operate
entirely at the type level.

Introduced in TypeScript 4.1, template literal types enable precise string typing
that was previously impossible without manual enumeration.

```typescript
type Greeting = `hello ${string}`;
// Matches any string starting with "hello "

const a: Greeting = "hello world";   // OK
const b: Greeting = "goodbye world"; // Error
```

**Environment setup:**

- **Target:** ES2022
- **Module:** ESNext
- **Strict mode:** enabled
- **Run with:** `npx tsx <filename>.ts`

---

## Basic Syntax

Template literal types wrap type expressions inside `${}` within backtick strings.

### Literal Interpolation

```typescript
type World = "world";
type Hello = `hello ${World}`;
// type Hello = "hello world"
```

The result is a new string literal type formed by concatenation.

### Using Primitive Types

```typescript
type Id = `user_${number}`;
// Matches "user_0", "user_42", "user_3.14", etc.

type HexColor = `#${string}`;
// Matches any string starting with "#"

type BoolStr = `${boolean}`;
// type BoolStr = "true" | "false"
```

Only `string`, `number`, `bigint`, `boolean`, `null`, and `undefined` can
appear inside template literal type placeholders.

### Multiple Placeholders

```typescript
type Coordinate = `${number},${number}`;
// Matches "0,0", "3.5,10", etc.

type Path = `/${string}/${string}`;
// Matches "/users/123", "/api/data", etc.
```

---

## String Unions in Template Literals

When a union type is used in a template literal, TypeScript distributes the
template across every member of the union, producing a **combinatorial explosion**
of all possible combinations.

### Basic Distribution

```typescript
type Color = "red" | "green" | "blue";
type CssColor = `color-${Color}`;
// type CssColor = "color-red" | "color-green" | "color-blue"
```

### Cross Product of Unions

```typescript
type Vertical = "top" | "bottom";
type Horizontal = "left" | "right";

type Position = `${Vertical}-${Horizontal}`;
// type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right"
```

This produces `|Vertical| * |Horizontal|` = 4 members.

### Triple Cross Product

```typescript
type Size = "sm" | "md" | "lg";
type Color = "red" | "blue";
type Variant = "solid" | "outline";

type ClassName = `${Size}-${Color}-${Variant}`;
// 3 * 2 * 2 = 12 possible string literals
```

### Caveat: Type Explosion

Be cautious with large unions. If each union has N members and you combine K
unions, the result has N^K members. TypeScript enforces limits on this and will
error if the resulting union exceeds ~100,000 members.

```typescript
// DON'T do this:
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
// type ThreeDigit = `${Digit}${Digit}${Digit}`; // 1000 members - works but expensive
// type FourDigit = `${Digit}${Digit}${Digit}${Digit}`; // 10000 members - slow
```

---

## Intrinsic String Manipulation Types

TypeScript provides four built-in utility types for transforming string literal
types. These are implemented directly in the compiler (not in userland).

### `Uppercase<S>`

Converts every character to uppercase.

```typescript
type Loud = Uppercase<"hello">;
// type Loud = "HELLO"

type Shouting = Uppercase<"hello" | "world">;
// type Shouting = "HELLO" | "WORLD"
```

### `Lowercase<S>`

Converts every character to lowercase.

```typescript
type Quiet = Lowercase<"HELLO">;
// type Quiet = "hello"
```

### `Capitalize<S>`

Converts the first character to uppercase.

```typescript
type Cap = Capitalize<"hello">;
// type Cap = "Hello"
```

### `Uncapitalize<S>`

Converts the first character to lowercase.

```typescript
type Uncap = Uncapitalize<"Hello">;
// type Uncap = "hello"
```

### Combining Intrinsics with Template Literals

```typescript
type EventName = "click" | "focus" | "blur";
type Handler = `on${Capitalize<EventName>}`;
// type Handler = "onClick" | "onFocus" | "onBlur"
```

### Using with `string`

When applied to the broad `string` type, intrinsic types produce branded
subtypes:

```typescript
type UpperString = Uppercase<string>;
// type UpperString = Uppercase<string> (a special subtype of string)

const x: UpperString = "HELLO" as Uppercase<string>;
```

---

## Pattern Matching with Template Literals

Template literal types can be used with conditional types and `infer` to extract
parts of string types.

### Extracting Substrings

```typescript
type ExtractId<S extends string> =
  S extends `user_${infer Id}` ? Id : never;

type A = ExtractId<"user_123">;  // "123"
type B = ExtractId<"admin_456">; // never
```

### Splitting Strings

```typescript
type FirstPart<S extends string> =
  S extends `${infer First}-${infer _Rest}` ? First : S;

type X = FirstPart<"hello-world">; // "hello"
type Y = FirstPart<"nodelimiter">;  // "nodelimiter"
```

### Extracting Multiple Parts

```typescript
type ParseRoute<S extends string> =
  S extends `/${infer Segment}/${infer Rest}`
    ? [Segment, ...ParseRoute<`/${Rest}`>]
    : S extends `/${infer Segment}`
      ? [Segment]
      : [];

type Route = ParseRoute<"/api/users/123">;
// type Route = ["api", "users", "123"]
```

### Checking Prefixes and Suffixes

```typescript
type StartsWith<S extends string, Prefix extends string> =
  S extends `${Prefix}${string}` ? true : false;

type EndsWith<S extends string, Suffix extends string> =
  S extends `${string}${Suffix}` ? true : false;

type A = StartsWith<"hello world", "hello">; // true
type B = EndsWith<"hello world", "world">;    // true
```

---

## Key Remapping with Template Literals

TypeScript 4.1 introduced key remapping in mapped types via the `as` clause.
Combined with template literal types, this enables powerful object type
transformations.

### Renaming Keys

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

### Filtering Keys by Pattern

```typescript
type OnlyStrings<T> = {
  [K in keyof T as K extends `${string}Id` ? K : never]: T[K];
};

interface Record {
  userId: string;
  name: string;
  orderId: string;
  total: number;
}

type IdFields = OnlyStrings<Record>;
// { userId: string; orderId: string }
```

### Generating Multiple Keys per Property

```typescript
type GetSet<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};
```

---

## Event Handler Pattern

One of the most common uses of template literal types is modeling event-based
APIs.

### Basic Event Emitter

```typescript
type EventMap = {
  click: { x: number; y: number };
  focus: { target: string };
  blur: { target: string };
};

type EventHandler<T extends keyof EventMap> = `on${Capitalize<T>}`;

type ClickHandler = EventHandler<"click">; // "onClick"
```

### Typed Event Emitter Class

```typescript
type EventCallback<T> = (event: T) => void;

declare class TypedEmitter<Events extends Record<string, unknown>> {
  on<K extends string & keyof Events>(
    event: K,
    callback: EventCallback<Events[K]>
  ): void;

  emit<K extends string & keyof Events>(
    event: K,
    payload: Events[K]
  ): void;
}
```

### DOM-style `on*` Properties

```typescript
type DOMEvents = "click" | "mouseover" | "keydown" | "scroll";

type DOMHandlers = {
  [K in DOMEvents as `on${Capitalize<K>}`]: (event: Event) => void;
};
// {
//   onClick: (event: Event) => void;
//   onMouseover: (event: Event) => void;
//   onKeydown: (event: Event) => void;
//   onScroll: (event: Event) => void;
// }
```

### Watching Property Changes

A pattern popularized by Vue and other frameworks:

```typescript
type PropWatcher<T> = {
  [K in string & keyof T as `on${Capitalize<K>}Changed`]: (
    oldValue: T[K],
    newValue: T[K]
  ) => void;
};

interface Config {
  theme: string;
  fontSize: number;
}

type ConfigWatcher = PropWatcher<Config>;
// {
//   onThemeChanged: (oldValue: string, newValue: string) => void;
//   onFontSizeChanged: (oldValue: number, newValue: number) => void;
// }
```

---

## CSS-like Type Patterns

Template literal types are well-suited for modeling CSS-related string patterns.

### CSS Units

```typescript
type CSSUnit = "px" | "em" | "rem" | "vh" | "vw" | "%";
type CSSLength = `${number}${CSSUnit}`;

const width: CSSLength = "100px";    // OK
const height: CSSLength = "50vh";    // OK
// const bad: CSSLength = "100";     // Error
```

### CSS Colors

```typescript
type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "a" | "b" | "c" | "d" | "e" | "f"
  | "A" | "B" | "C" | "D" | "E" | "F";

// Short hex color (too many combinations for full 6-digit)
type ShortHex = `#${HexDigit}${HexDigit}${HexDigit}`;

const color: ShortHex = "#f0a"; // OK
```

### CSS Class Names

```typescript
type Breakpoint = "sm" | "md" | "lg" | "xl";
type Spacing = "0" | "1" | "2" | "4" | "8";

type PaddingClass = `p-${Spacing}` | `p${("x" | "y" | "t" | "b" | "l" | "r")}-${Spacing}`;
type ResponsivePadding = `${Breakpoint}:${PaddingClass}`;

const cls: ResponsivePadding = "md:px-4"; // OK
```

### CSS Custom Properties

```typescript
type CSSVar = `--${string}`;
type CSSVarRef = `var(${CSSVar})`;

const myVar: CSSVar = "--primary-color";     // OK
const ref: CSSVarRef = "var(--primary-color)"; // OK
```

---

## Combining with Mapped Types

Template literal types truly shine when combined with mapped types and
conditional types.

### Prefixed Object

```typescript
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
};

interface User {
  id: number;
  name: string;
}

type PrefixedUser = Prefixed<User, "user">;
// { user_id: number; user_name: string }
```

### Snake_case to camelCase (simplified)

```typescript
type SnakeToCamel<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
    : S;

type A = SnakeToCamel<"hello_world">;       // "helloWorld"
type B = SnakeToCamel<"foo_bar_baz">;       // "fooBarBaz"
type C = SnakeToCamel<"no_underscores_here">; // "noUnderscoresHere"
```

### CamelCase to kebab-case

```typescript
type CamelToKebab<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Capitalize<First>
      ? `-${Lowercase<First>}${CamelToKebab<Rest>}`
      : `${First}${CamelToKebab<Rest>}`
    : S;

type X = CamelToKebab<"backgroundColor">; // "-background-color" (needs trim)
```

### Deep Key Paths

```typescript
type KeyPath<T, Prefix extends string = ""> = {
  [K in string & keyof T]:
    T[K] extends Record<string, unknown>
      ? KeyPath<T[K], `${Prefix}${K}.`>
      : `${Prefix}${K}`;
}[string & keyof T];

interface Settings {
  display: {
    theme: string;
    fontSize: number;
  };
  audio: {
    volume: number;
  };
}

type SettingPath = KeyPath<Settings>;
// "display.theme" | "display.fontSize" | "audio.volume"
```

---

## Practical Patterns

### API Route Typing

```typescript
type Method = "GET" | "POST" | "PUT" | "DELETE";

type ApiRoute = `/api/${string}`;

type TypedRoute<M extends Method, P extends string> = {
  method: M;
  path: P & ApiRoute;
};

// Route parameter extraction
type ExtractParams<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : S extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<"/api/users/:userId/posts/:postId">;
// type Params = "userId" | "postId"

type RouteParams<S extends string> = {
  [K in ExtractParams<S>]: string;
};

type UserPostParams = RouteParams<"/api/users/:userId/posts/:postId">;
// { userId: string; postId: string }
```

### Event System Typing

```typescript
type EventDef = Record<string, Record<string, unknown>>;

type TypedEventSystem<Events extends EventDef> = {
  on<E extends keyof Events & string>(
    event: E,
    handler: (payload: Events[E]) => void
  ): void;
  off<E extends keyof Events & string>(
    event: E,
    handler: (payload: Events[E]) => void
  ): void;
  emit<E extends keyof Events & string>(
    event: E,
    payload: Events[E]
  ): void;
} & {
  [E in keyof Events & string as `on${Capitalize<E>}`]: (
    handler: (payload: Events[E]) => void
  ) => void;
};
```

### SQL-like Query Builder Types

```typescript
type Table = "users" | "posts" | "comments";
type SelectQuery = `SELECT ${string} FROM ${Table}`;
type WhereClause = `WHERE ${string}`;
type FullQuery = `${SelectQuery}` | `${SelectQuery} ${WhereClause}`;

const q1: FullQuery = "SELECT * FROM users";
const q2: FullQuery = "SELECT id, name FROM posts WHERE id = 1";
```

### Environment Variable Typing

```typescript
type EnvPrefix = "NEXT_PUBLIC" | "REACT_APP" | "VITE";
type EnvVar = `${EnvPrefix}_${Uppercase<string>}`;

function getEnv(key: EnvVar): string | undefined {
  return process.env[key];
}

// getEnv("NEXT_PUBLIC_API_URL"); // OK
// getEnv("SECRET_KEY");          // Error - wrong prefix
```

### JSON Path Typing

```typescript
type JsonPrimitive = string | number | boolean | null;

type DotPath<T> = T extends JsonPrimitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends JsonPrimitive
        ? K
        : K | `${K}.${DotPath<T[K]>}`;
    }[keyof T & string];
```

---

## Summary

| Feature | Syntax | Use Case |
|---|---|---|
| Basic template | `` `hello ${Type}` `` | String construction |
| Union distribution | `` `${A \| B}` `` | Combinatorial types |
| `Uppercase<S>` | Built-in | String transformation |
| `Lowercase<S>` | Built-in | String transformation |
| `Capitalize<S>` | Built-in | First char upper |
| `Uncapitalize<S>` | Built-in | First char lower |
| Pattern matching | `` S extends `${infer X}` `` | String parsing |
| Key remapping | `as` clause in mapped types | Object reshaping |

### Key Takeaways

1. Template literal types enable **compile-time string manipulation** that
   catches errors before runtime.

2. Union types **distribute** through template literals, creating cross products.
   Be mindful of combinatorial explosion.

3. The four **intrinsic** string manipulation types (`Uppercase`, `Lowercase`,
   `Capitalize`, `Uncapitalize`) are compiler primitives -- fast and reliable.

4. Combined with `infer`, template literals enable **pattern matching** on
   string types -- parsing routes, extracting parameters, and more.

5. **Key remapping** (`as` clause) with template literals transforms object
   shapes -- generating getters, setters, event handlers, etc.

6. Practical applications include **API route typing**, **event systems**,
   **CSS utilities**, and **configuration validation**.

### References

- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [TypeScript 4.1 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html)

### Running the Exercises

```bash
# Run exercises (after uncommenting test code)
npx tsx exercises.ts

# Run solutions
npx tsx solutions.ts
```
