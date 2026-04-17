# Type Challenges: Type-Level Programming Exercises

## Introduction

Type-level programming treats TypeScript's type system as a small functional
programming language. Instead of computing values at runtime you compute
**types** at compile time. The [type-challenges](https://github.com/type-challenges/type-challenges)
repository popularized this idea by collecting hundreds of exercises that
range from easy utility-type reimplementations to mind-bending recursive
type puzzles.

Working through these challenges builds deep intuition for:

- Generic constraints and inference
- Conditional types and distributive behaviour
- Mapped types and key remapping
- Template literal types and string manipulation
- Recursive type aliases

This module contains 20 hand-picked exercises (easy to hard) in
`exercises.ts` with full solutions and explanations in `solutions.ts`.

> **References**
>
> - <https://github.com/type-challenges/type-challenges>
> - [TypeScript Handbook — Type Manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

---

## Key Techniques Recap

### 1. Conditional Types

```ts
type IsString<T> = T extends string ? true : false;
```

Conditional types follow the pattern `T extends U ? X : Y`. When `T` is a
**naked type parameter** fed a union, the conditional *distributes* over
each union member:

```ts
type R = IsString<string | number>; // true | false
```

To suppress distribution wrap both sides in a tuple:

```ts
type IsStringStrict<T> = [T] extends [string] ? true : false;
```

### 2. The `infer` Keyword

`infer` introduces a new type variable inside a conditional's `extends`
clause:

```ts
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never;
```

You can infer in many positions: function parameters, tuple elements,
template literal segments, and even recursive structures.

### 3. Mapped Types

Mapped types iterate over keys to produce a new object type:

```ts
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

Key remapping with `as` lets you filter or rename keys:

```ts
type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
```

### 4. Template Literal Types

String manipulation at the type level:

```ts
type Greeting<N extends string> = `Hello, ${N}!`;
type R = Greeting<"world">; // "Hello, world!"
```

Built-in intrinsics: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`.

### 5. Recursive Types

TypeScript allows (with limits) recursive type aliases. This is essential
for challenges like `DeepReadonly`, `Flatten`, or deep path types:

```ts
type Flatten<T> = T extends [infer Head, ...infer Tail]
  ? Head extends any[]
    ? [...Flatten<Head>, ...Flatten<Tail>]
    : [Head, ...Flatten<Tail>]
  : T;
```

The compiler imposes a recursion depth limit (~50 levels in practice).

---

## Common Building Blocks

Many challenges reuse a handful of helper types. Understanding these is
essential before tackling harder problems.

### `IsEqual<X, Y>`

The gold-standard equality check (used by type-challenges itself):

```ts
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2)
    ? true
    : false;
```

This works by comparing the *assignability of two generic conditional
type instantiations*. It correctly distinguishes `any` from `unknown`,
`never` from other types, and optional vs required properties.

### `IsNever<T>`

`never` is the empty union, so bare conditional types never execute:

```ts
type IsNever<T> = [T] extends [never] ? true : false;
```

Wrapping in a tuple prevents distribution and lets us detect `never`.

### `TupleToUnion<T>`

Convert a tuple type to a union of its element types:

```ts
type TupleToUnion<T extends readonly any[]> = T[number];
```

### `UnionToTuple` (concept)

Converting a union back to a tuple is notoriously tricky. It relies on
**union-to-intersection** via contra-variant positions and
**function overload inference**:

```ts
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never;

type LastOfUnion<U> =
  UnionToIntersection<U extends any ? () => U : never> extends () => infer R
    ? R
    : never;

type UnionToTuple<U, Last = LastOfUnion<U>> =
  [U] extends [never]
    ? []
    : [...UnionToTuple<Exclude<U, Last>>, Last];
```

> **Warning**: Union ordering is *not* guaranteed by TypeScript so the
> resulting tuple order is implementation-defined. Avoid depending on it
> in production code.

---

## Tips for Solving Type Challenges

1. **Start with the simplest case.** Write the type that handles only the
   happy path first, then generalise.

2. **Think in pattern matching.** Conditional types with `infer` are
   analogous to destructuring in a `match` expression. Ask yourself:
   *What shape does the input have?*

3. **Draw the recursion.** For recursive types write out the first two or
   three expansion steps by hand to verify the base and recursive cases.

4. **Watch out for distribution.** If a conditional type behaves
   unexpectedly with unions, check whether you need to wrap in `[T]`.

5. **Use `extends` constraints generously.** `T extends readonly any[]`
   ensures you can index with `[number]` or spread. Constraints both
   document intent and unlock type operations.

6. **Test with edge cases.** Always check `never`, `any`, `unknown`,
   empty tuples `[]`, and single-element unions.

7. **Read the compiler errors.** TypeScript's error messages for
   type-level code can be cryptic, but they often reveal exactly which
   branch of a conditional was taken.

8. **Simplify with helper types.** Extract sub-problems into named helper
   types. A 10-line single type is much harder to debug than three
   3-line types composed together.

---

## Project Setup

### tsconfig.json (conceptual)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  }
}
```

### Running

```bash
# Check exercises compile (they should, with placeholders)
npx tsx exercises.ts

# Check solutions compile and run the success message
npx tsx solutions.ts
```

No runtime test runner is needed. All assertions are **compile-time only**
via the `Expect<Equal<...>>` pattern. If a type is wrong the file simply
won't compile.

---

## Exercise List

| #  | Name              | Difficulty | Key Concept                        |
|----|-------------------|------------|------------------------------------|
| 1  | MyPick            | Easy       | Mapped types, keyof                |
| 2  | MyReadonly         | Easy       | Mapped types, readonly modifier    |
| 3  | TupleToObject     | Easy       | Indexed access, mapped types       |
| 4  | First             | Easy       | Conditional types, tuple indexing  |
| 5  | Length            | Easy       | Tuple `["length"]`                 |
| 6  | MyExclude         | Easy       | Distributive conditional types     |
| 7  | Awaited           | Medium     | Recursive conditional, infer       |
| 8  | If                | Easy       | Conditional types, boolean extends |
| 9  | Concat            | Easy       | Variadic tuple types               |
| 10 | Includes          | Medium     | Recursive tuple scan, Equal        |
| 11 | Push / Unshift    | Easy       | Variadic tuple types               |
| 12 | MyParameters      | Easy       | infer in function params           |
| 13 | MyReturnType      | Easy       | infer in return position           |
| 14 | MyOmit            | Medium     | Mapped types, key filtering        |
| 15 | DeepReadonly       | Medium     | Recursive mapped types             |
| 16 | Chainable         | Hard       | Interface merging, generics        |
| 17 | TupleToUnion      | Easy       | Indexed access `T[number]`         |
| 18 | Last              | Easy       | infer with rest elements           |
| 19 | Flatten           | Medium     | Recursive tuple spreading          |
| 20 | TrimLeft          | Medium     | Template literal types, recursion  |

---

## Further Reading

- [TypeScript Handbook — Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook — Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Handbook — Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [type-challenges GitHub](https://github.com/type-challenges/type-challenges)
- [TypeScript Deep Dive — Advanced Types](https://basarat.gitbook.io/typescript/type-system)
- [Matt Pocock's Total TypeScript](https://www.totaltypescript.com/)

---

## Summary

Type-level programming is a skill that compounds. The first few challenges
feel awkward, but after a dozen you start to see recurring patterns:
*infer + conditional* for extraction, *mapped types + as* for
transformation, and *recursion + spreads* for structural manipulation.

Work through `exercises.ts` at your own pace. When stuck, peek at a single
hint rather than the full solution. The goal is to build the mental model,
not to memorise answers.

Good luck!
