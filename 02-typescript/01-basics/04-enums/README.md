# 04 — Enums

> **TypeScript Handbook reference**: [Enums](https://www.typescriptlang.org/docs/handbook/enums.html)

Enums let you define a set of named constants. TypeScript provides both numeric
and string-based enums. Under the hood they compile to plain JavaScript objects,
which means they exist at runtime — unlike most TypeScript constructs that are
erased after compilation.

---

## Table of Contents

1. [Numeric Enums](#1-numeric-enums)
2. [String Enums](#2-string-enums)
3. [Heterogeneous Enums](#3-heterogeneous-enums)
4. [Computed and Constant Members](#4-computed-and-constant-members)
5. [Reverse Mapping](#5-reverse-mapping)
6. [const Enums](#6-const-enums)
7. [Ambient Enums](#7-ambient-enums)
8. [Enum Member Types](#8-enum-member-types)
9. [Enums as Union Types](#9-enums-as-union-types)
10. [Enums at Runtime](#10-enums-at-runtime)
11. [Enums vs Union of Literals](#11-enums-vs-union-of-literals)
12. [When to Use Enums vs Alternatives](#12-when-to-use-enums-vs-alternatives)
13. [Bitwise / Flag Enums](#13-bitwise--flag-enums)
14. [Common Pitfalls](#14-common-pitfalls)

---

## 1. Numeric Enums

By default, enum members are auto-incrementing numbers starting from `0`.

```ts
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}

const move: Direction = Direction.Up; // 0
```

### Custom initializers

You can set any member's value. Subsequent members auto-increment from there.

```ts
enum StatusCode {
  OK = 200,
  Created,        // 201
  Accepted,       // 202
  BadRequest = 400,
  Unauthorized,   // 401
  NotFound = 404,
}
```

Members without initializers must come after members with numeric initializers
(or be the first member).

```ts
enum Mixed {
  A = getSomeValue(), // computed
  B,                  // ERROR — B needs an initializer because A is computed
}
```

---

## 2. String Enums

Every member must be explicitly initialized with a string literal (or another
string enum member).

```ts
enum Color {
  Red   = "RED",
  Green = "GREEN",
  Blue  = "BLUE",
}

const c: Color = Color.Red; // "RED"
```

Advantages over numeric enums:

- **Readable at runtime** — log output shows `"RED"` instead of `0`.
- **No accidental collision** — every value is unique and intentional.
- **No reverse mapping overhead** — the compiled object is smaller.

String enums do **not** auto-increment, so every member needs a value.

```ts
enum LogLevel {
  Debug = "DEBUG",
  Info  = "INFO",
  Warn,            // ERROR — string enums require explicit values
}
```

---

## 3. Heterogeneous Enums

TypeScript technically allows mixing string and numeric members:

```ts
enum BooleanLike {
  No  = 0,
  Yes = "YES",
}
```

This is **discouraged**. It makes the enum harder to reason about — you lose
auto-increment for numeric members and reverse mapping becomes partial. Prefer
using either all-numeric or all-string members.

---

## 4. Computed and Constant Members

Enum members are classified as **constant** or **computed**.

### Constant members

A member is constant if its value can be fully resolved at compile time:

| Rule | Example |
|------|---------|
| First member with no initializer | `enum E { X }` → `0` |
| No initializer, previous member is a numeric constant | `enum E { A = 1, B }` → `B = 2` |
| Numeric literal | `enum E { A = 42 }` |
| String literal | `enum E { A = "hello" }` |
| Unary `+`, `-`, `~` on a constant | `enum E { A = -1 }` |
| Binary `+`, `-`, `*`, `/`, `%`, `<<`, `>>`, `>>>`, `&`, `\|`, `^` with constant operands | `enum E { A = 1 << 2 }` |

### Computed members

Anything else is computed — the value is determined at runtime:

```ts
function getLen(s: string): number {
  return s.length;
}

enum FileAccess {
  None,                       // constant: 0
  Read    = 1 << 1,           // constant: 2
  Write   = 1 << 2,           // constant: 4
  ReadWrite = Read | Write,   // constant: 6
  Computed  = getLen("abc"),   // computed: 3 (at runtime)
}
```

Constant members are inlined by the compiler when possible. Computed members
generate a function call in the emitted JavaScript.

---

## 5. Reverse Mapping

**Numeric** enums get a reverse mapping: the compiled object maps both
`name → value` **and** `value → name`.

```ts
enum Status {
  Active = 1,
  Inactive = 2,
}

console.log(Status.Active);   // 1
console.log(Status[1]);       // "Active"  ← reverse mapping
```

Compiled output (simplified):

```js
var Status;
(function (Status) {
  Status[Status["Active"] = 1] = "Active";
  Status[Status["Inactive"] = 2] = "Inactive";
})(Status || (Status = {}));
```

**String enums do NOT get reverse mapping.** The compiled object only contains
the `name → value` direction:

```ts
enum Color {
  Red = "RED",
}

console.log(Color.Red);     // "RED"
console.log(Color["RED"]);  // undefined (no reverse mapping)
```

---

## 6. const Enums

Prefixing an enum with `const` tells the compiler to **inline** every usage and
**not emit** a runtime object.

```ts
const enum Flags {
  None  = 0,
  Bold  = 1,
  Italic = 2,
}

const style = Flags.Bold | Flags.Italic;
// Compiles to: const style = 1 | 2;
```

No `Flags` object exists at runtime. This means:

- You **cannot** iterate over a const enum (`Object.keys(Flags)` — error).
- You **cannot** use reverse mapping.
- You **cannot** use computed members.

### `--preserveConstEnums`

With this compiler flag, the runtime object **is** emitted (for debugging or
interop), but usages are still inlined.

### When to use

Use `const enum` when you want zero-cost enum abstraction — the values are
embedded directly into the call site. Avoid in libraries that will be consumed
by other projects (the inlining happens in the declaring project, not the
consuming one — this can cause version mismatch issues).

---

## 7. Ambient Enums

`declare enum` describes the shape of an enum that already exists at runtime
(e.g., provided by a JavaScript library).

```ts
declare enum ExternalStatus {
  OK = 200,
  NotFound = 404,
}
```

No code is emitted for `declare enum`. The compiler trusts that the runtime
object will be available.

Key difference from `const enum`:

| | `const enum` | `declare enum` |
|---|---|---|
| Runtime object emitted? | No (unless `--preserveConstEnums`) | No (assumed to exist externally) |
| Usages inlined? | Yes | Only if member is constant |
| Computed members allowed? | No | Yes (treated as computed) |

You can also combine them: `declare const enum` — no runtime object, all usages
inlined, and the compiler does not emit anything.

---

## 8. Enum Member Types

Each enum member becomes its own type when the member is constant:

```ts
enum ShapeKind {
  Circle,
  Square,
}

interface Circle {
  kind: ShapeKind.Circle; // type is specifically ShapeKind.Circle, not number
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}

// This errors — kind must be ShapeKind.Circle
const c: Circle = {
  kind: ShapeKind.Square, // ERROR
  radius: 10,
};
```

This is powerful for discriminated unions (see next section).

---

## 9. Enums as Union Types

An enum with all-constant members acts as a **union of its member types**. This
enables exhaustive narrowing:

```ts
enum Suit {
  Hearts,
  Diamonds,
  Clubs,
  Spades,
}

function colorOf(suit: Suit): string {
  switch (suit) {
    case Suit.Hearts:
    case Suit.Diamonds:
      return "red";
    case Suit.Clubs:
    case Suit.Spades:
      return "black";
  }
  // No default needed — TypeScript knows all cases are covered
  // (with --strictNullChecks and --noImplicitReturns)
}
```

### Exhaustiveness checking

Use the `never` trick to get a compile-time error if a new member is added but
not handled:

```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function suitName(suit: Suit): string {
  switch (suit) {
    case Suit.Hearts:   return "Hearts";
    case Suit.Diamonds: return "Diamonds";
    case Suit.Clubs:    return "Clubs";
    case Suit.Spades:   return "Spades";
    default:            return assertNever(suit);
  }
}
```

If you later add `Suit.Jokers`, the `default` branch will error because `suit`
is no longer assignable to `never`.

---

## 10. Enums at Runtime

Enums (non-const) compile to real JavaScript objects:

```ts
enum Role {
  Admin  = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER",
}

// These work at runtime:
console.log(typeof Role);           // "object"
console.log(Object.keys(Role));     // ["Admin", "Editor", "Viewer"]
console.log(Object.values(Role));   // ["ADMIN", "EDITOR", "VIEWER"]
```

For **numeric** enums, `Object.keys` returns both names and reverse-mapped
numeric keys:

```ts
enum Priority {
  Low,    // 0
  Medium, // 1
  High,   // 2
}

console.log(Object.keys(Priority));
// ["0", "1", "2", "Low", "Medium", "High"]
```

To get only the names of a numeric enum:

```ts
const names = Object.keys(Priority).filter(k => isNaN(Number(k)));
// ["Low", "Medium", "High"]
```

### Passing enums to functions

Because enums are objects, you can pass them around:

```ts
function printEnum(e: Record<string, string | number>): void {
  for (const [key, value] of Object.entries(e)) {
    console.log(`${key} = ${value}`);
  }
}

printEnum(Role);
```

---

## 11. Enums vs Union of Literals

You can often achieve the same compile-time safety with a union type:

```ts
// Enum approach
enum Direction {
  Up    = "UP",
  Down  = "DOWN",
  Left  = "LEFT",
  Right = "RIGHT",
}

// Union approach
type Direction2 = "UP" | "DOWN" | "LEFT" | "RIGHT";
```

### Comparison

| Aspect | `enum` | Union of literals |
|--------|--------|-------------------|
| Runtime object | Yes (non-const) | No |
| Iterable | Yes (`Object.keys`) | No |
| Refactorable | Rename member, value stays | Find-and-replace strings |
| Bundle size | Adds code | Zero cost |
| Reverse mapping | Numeric only | N/A |
| Interop (JS consumers) | Works fine | Works fine |
| IDE autocomplete | `Direction.` shows members | Shows literal strings |

### Recommendation

- Use **union of string literals** for simple, small sets — especially in
  application code where you control all consumers.
- Use **string enums** when you need a runtime object (iteration, serialization
  lookup) or when the set is large.
- Use **numeric enums** when you need bitwise flags or when you need reverse
  mapping.

---

## 12. When to Use Enums vs Alternatives

### `as const` objects

```ts
const Direction = {
  Up:    "UP",
  Down:  "DOWN",
  Left:  "LEFT",
  Right: "RIGHT",
} as const;

type Direction = (typeof Direction)[keyof typeof Direction];
// "UP" | "DOWN" | "LEFT" | "RIGHT"
```

This gives you:

- A runtime object (like enums).
- A union type (like string unions).
- No enum-specific quirks (reverse mapping, numeric assignability).

This pattern is increasingly popular and avoids some of the pitfalls below.

### Decision guide

```
Need bitwise flags?
  → numeric enum

Need to iterate member names/values at runtime?
  → string enum or `as const` object

Just need a set of known string values?
  → union of string literals

Want both a runtime object AND a type?
  → `as const` object (or string enum)

Working in a library consumed by JS?
  → `as const` object (avoids enum transpilation issues)
```

---

## 13. Bitwise / Flag Enums

Numeric enums work well as bitmask flags:

```ts
enum Permission {
  None    = 0,
  Read    = 1 << 0,  // 1
  Write   = 1 << 1,  // 2
  Execute = 1 << 2,  // 4
  All     = Read | Write | Execute, // 7
}

// Combine flags
let perms: number = Permission.Read | Permission.Write; // 3

// Check a flag
const canRead  = (perms & Permission.Read) !== 0;  // true
const canExec  = (perms & Permission.Execute) !== 0; // false

// Add a flag
perms |= Permission.Execute; // 7

// Remove a flag
perms &= ~Permission.Write; // 5
```

### Helper functions

```ts
function hasFlag(value: number, flag: Permission): boolean {
  return (value & flag) === flag;
}

function addFlag(value: number, flag: Permission): number {
  return value | flag;
}

function removeFlag(value: number, flag: Permission): number {
  return value & ~flag;
}

console.log(hasFlag(Permission.All, Permission.Read));  // true
```

---

## 14. Common Pitfalls

### Pitfall 1: Numeric enums accept any number

```ts
enum Status {
  Active,
  Inactive,
}

// No error! Any number is assignable to a numeric enum.
const s: Status = 999;
```

This is a known weakness. String enums do **not** have this problem — only the
defined string values are assignable.

### Pitfall 2: Comparing enums from different declarations

```ts
enum StatusA { Active }
enum StatusB { Active }

// ERROR: This comparison appears to be unintentional because the
// types 'StatusA' and 'StatusB' have no overlap.
if (StatusA.Active === StatusB.Active) {}
```

Even though both are `0` at runtime, TypeScript treats them as distinct types.

### Pitfall 3: `const enum` and `isolatedModules`

When `isolatedModules` is enabled (required by Babel, esbuild, swc), the
compiler cannot inline const enums from other files because it processes files
in isolation. You'll get an error unless you use `--preserveConstEnums`.

### Pitfall 4: String enum values are not assignable

```ts
enum Color {
  Red = "RED",
}

// ERROR: Type '"RED"' is not assignable to type 'Color'.
const c: Color = "RED";
```

You must use the enum member (`Color.Red`), not the raw string. This is
intentional — it forces consumers through the enum namespace. If this is
annoying, consider a union of string literals instead.

### Pitfall 5: Forgetting that `Object.keys` includes reverse mappings

For numeric enums, `Object.keys()` returns both the names **and** the numeric
string keys. Always filter if you only want names:

```ts
enum Priority { Low, Medium, High }

// Wrong — includes "0", "1", "2"
Object.keys(Priority).forEach(k => console.log(k));

// Correct — only "Low", "Medium", "High"
Object.keys(Priority)
  .filter(k => isNaN(Number(k)))
  .forEach(k => console.log(k));
```

---

## Summary

| Feature | Numeric Enum | String Enum | const Enum | Union Type | `as const` Object |
|---------|:---:|:---:|:---:|:---:|:---:|
| Runtime object | ✓ | ✓ | ✗ | ✗ | ✓ |
| Auto-increment | ✓ | ✗ | ✓ (numeric) | ✗ | ✗ |
| Reverse mapping | ✓ | ✗ | ✗ | ✗ | ✗ |
| Iterable at runtime | ✓ | ✓ | ✗ | ✗ | ✓ |
| Inlined by compiler | ✗ | ✗ | ✓ | N/A | N/A |
| Zero bundle cost | ✗ | ✗ | ✓ | ✓ | ~✓ |
| Bitwise flags | ✓ | ✗ | ✓ | ✗ | ✗ |

---

## Further Reading

- [TypeScript Handbook — Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript Playground](https://www.typescriptlang.org/play) — experiment with enum compilation output
- [Are TypeScript enums worth it?](https://www.youtube.com/watch?v=jjMbPt_H3RQ) — Matt Pocock
