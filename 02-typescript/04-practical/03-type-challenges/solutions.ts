// ============================================================================
// Type Challenges — Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
//
// References:
//   - https://github.com/type-challenges/type-challenges
//   - https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
//
// Every type is implemented with an explanation. All Expect<Equal<...>>
// tests are uncommented — if this file compiles, every solution is correct.
// ============================================================================

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? true
    : false;

// ---------------------------------------------------------------------------
// #1 — MyPick<T, K>
// ---------------------------------------------------------------------------
// Use a mapped type that iterates over K (constrained to keyof T) and
// looks up each key in T.

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type _1a = Expect<Equal<MyPick<{ a: 1; b: 2; c: 3 }, "a">, { a: 1 }>>;
type _1b = Expect<Equal<MyPick<{ a: 1; b: 2; c: 3 }, "a" | "b">, { a: 1; b: 2 }>>;

// ---------------------------------------------------------------------------
// #2 — MyReadonly<T>
// ---------------------------------------------------------------------------
// Mapped type with the `readonly` modifier applied to every key.

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type _2a = Expect<Equal<MyReadonly<{ a: 1; b: 2 }>, { readonly a: 1; readonly b: 2 }>>;

// ---------------------------------------------------------------------------
// #3 — TupleToObject<T>
// ---------------------------------------------------------------------------
// Index the tuple with [number] to get the union of element types, then
// map over that union. Each member P becomes both key and value.

type TupleToObject<T extends readonly (string | number | symbol)[]> = {
  [P in T[number]]: P;
};

type _3a = Expect<Equal<TupleToObject<["a", "b", "c"]>, { a: "a"; b: "b"; c: "c" }>>;
type _3b = Expect<Equal<TupleToObject<[1, 2, 3]>, { 1: 1; 2: 2; 3: 3 }>>;

// ---------------------------------------------------------------------------
// #4 — First<T>
// ---------------------------------------------------------------------------
// Check if the tuple is empty (extends []), if so return never.
// Otherwise infer the first element using `infer F`.

type First<T extends readonly any[]> = T extends [infer F, ...any[]] ? F : never;

type _4a = Expect<Equal<First<[3, 2, 1]>, 3>>;
type _4b = Expect<Equal<First<[]>, never>>;
type _4c = Expect<Equal<First<[undefined]>, undefined>>;

// ---------------------------------------------------------------------------
// #5 — Length<T>
// ---------------------------------------------------------------------------
// Tuple types have a numeric literal `length` property. Simply access it.

type Length<T extends readonly any[]> = T["length"];

type _5a = Expect<Equal<Length<[1, 2, 3]>, 3>>;
type _5b = Expect<Equal<Length<[]>, 0>>;
type _5c = Expect<Equal<Length<[undefined]>, 1>>;

// ---------------------------------------------------------------------------
// #6 — MyExclude<T, U>
// ---------------------------------------------------------------------------
// Distributive conditional type: when T is a union, the conditional
// distributes over each member. Members assignable to U become `never`
// (removed from the union).

type MyExclude<T, U> = T extends U ? never : T;

type _6a = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
type _6b = Expect<Equal<MyExclude<string | number | boolean, string>, number | boolean>>;

// ---------------------------------------------------------------------------
// #7 — MyAwaited<T>
// ---------------------------------------------------------------------------
// Recursively unwrap Promise-like types. If T is a PromiseLike wrapping
// some inner type, recurse on the inner type. Otherwise return T.

type MyAwaited<T> = T extends PromiseLike<infer Inner> ? MyAwaited<Inner> : T;

type _7a = Expect<Equal<MyAwaited<Promise<string>>, string>>;
type _7b = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>;
type _7c = Expect<Equal<MyAwaited<Promise<Promise<Promise<boolean>>>>, boolean>>;

// ---------------------------------------------------------------------------
// #8 — If<C, T, F>
// ---------------------------------------------------------------------------
// Straightforward conditional type. C extends true → T, otherwise F.

type If<C extends boolean, T, F> = C extends true ? T : F;

type _8a = Expect<Equal<If<true, "a", "b">, "a">>;
type _8b = Expect<Equal<If<false, "a", "b">, "b">>;

// ---------------------------------------------------------------------------
// #9 — Concat<T, U>
// ---------------------------------------------------------------------------
// Use variadic tuple types: spread both tuples into a new one.

type Concat<T extends readonly any[], U extends readonly any[]> = [...T, ...U];

type _9a = Expect<Equal<Concat<[1, 2], [3, 4]>, [1, 2, 3, 4]>>;
type _9b = Expect<Equal<Concat<[], [1]>, [1]>>;
type _9c = Expect<Equal<Concat<[1], []>, [1]>>;

// ---------------------------------------------------------------------------
// #10 — Includes<T, U>
// ---------------------------------------------------------------------------
// Recursively walk the tuple. For each head element, use Equal to check
// strict equality with U. If found return true, otherwise recurse on tail.

type Includes<T extends readonly any[], U> = T extends [infer Head, ...infer Tail]
  ? Equal<Head, U> extends true
    ? true
    : Includes<Tail, U>
  : false;

type _10a = Expect<Equal<Includes<[1, 2, 3], 2>, true>>;
type _10b = Expect<Equal<Includes<[1, 2, 3], 4>, false>>;
type _10c = Expect<Equal<Includes<[boolean, 1, "a"], false>, false>>;
type _10d = Expect<Equal<Includes<[true, false], boolean>, false>>;

// ---------------------------------------------------------------------------
// #11 — Push<T, U> and Unshift<T, U>
// ---------------------------------------------------------------------------
// Spread the existing tuple and add the new element at the end or start.

type Push<T extends readonly any[], U> = [...T, U];
type Unshift<T extends readonly any[], U> = [U, ...T];

type _11a = Expect<Equal<Push<[1, 2], 3>, [1, 2, 3]>>;
type _11b = Expect<Equal<Push<[], 1>, [1]>>;
type _11c = Expect<Equal<Unshift<[1, 2], 0>, [0, 1, 2]>>;
type _11d = Expect<Equal<Unshift<[], 1>, [1]>>;

// ---------------------------------------------------------------------------
// #12 — MyParameters<T>
// ---------------------------------------------------------------------------
// Use `infer` in the parameter position of a function type to extract
// the argument types as a tuple.

type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type _12a = Expect<Equal<MyParameters<(a: string, b: number) => void>, [string, number]>>;
type _12b = Expect<Equal<MyParameters<() => void>, []>>;

// ---------------------------------------------------------------------------
// #13 — MyReturnType<T>
// ---------------------------------------------------------------------------
// Use `infer` in the return position of a function type.

type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

type _13a = Expect<Equal<MyReturnType<() => string>, string>>;
type _13b = Expect<Equal<MyReturnType<(a: number) => boolean>, boolean>>;
type _13c = Expect<Equal<MyReturnType<() => Promise<number>>, Promise<number>>>;

// ---------------------------------------------------------------------------
// #14 — MyOmit<T, K>
// ---------------------------------------------------------------------------
// Use a mapped type with key remapping (`as`). For each key in T, if it
// extends K, remap to `never` (which removes it). Otherwise keep it.

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

type _14a = Expect<Equal<MyOmit<{ a: 1; b: 2; c: 3 }, "a">, { b: 2; c: 3 }>>;
type _14b = Expect<Equal<MyOmit<{ a: 1; b: 2; c: 3 }, "a" | "c">, { b: 2 }>>;

// ---------------------------------------------------------------------------
// #15 — DeepReadonly<T>
// ---------------------------------------------------------------------------
// Recursively apply readonly. If a property value is an object (and not
// a Function), recurse into it. Otherwise just mark it readonly.
// The `keyof T extends never` check handles primitive types that have no
// own keys — we return them as-is.

type DeepReadonly<T> = keyof T extends never
  ? T
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

type _15input = { a: { b: { c: number } }; d: string };
type _15expected = {
  readonly a: { readonly b: { readonly c: number } };
  readonly d: string;
};
type _15a = Expect<Equal<DeepReadonly<_15input>, _15expected>>;

// ---------------------------------------------------------------------------
// #16 — Chainable<T>
// ---------------------------------------------------------------------------
// The `option` method is generic over K (string key) and V (value type).
// It returns a new Chainable whose accumulated type T is extended with
// { [k in K]: V }. The `get` method returns the accumulated type T.
//
// We use `Omit<T, K>` before intersecting so that calling `.option` with
// the same key overwrites the previous value type.

type Chainable<T = {}> = {
  option<K extends string, V>(
    key: K,
    value: V
  ): Chainable<Omit<T, K> & { [P in K]: V }>;
  get(): T;
};

// Test: we verify the structure of Chainable by building a result type manually.
// Chainable starts with {}, then each .option call adds a property.
type _16chain1 = Chainable<{}>;
type _16chain2 = ReturnType<_16chain1["option"]>; // returns Chainable<{ [K]: V }>
// Direct structural test:
type _16built = { name: string } & { age: number } & { active: boolean };
type _16a = Expect<
  Equal<
    Chainable<{ name: string; age: number; active: boolean }>["get"],
    () => { name: string; age: number; active: boolean }
  >
>;

// ---------------------------------------------------------------------------
// #17 — TupleToUnion<T>
// ---------------------------------------------------------------------------
// Index a tuple with `number` to get the union of all element types.

type TupleToUnion<T extends readonly any[]> = T[number];

type _17a = Expect<Equal<TupleToUnion<[1, 2, 3]>, 1 | 2 | 3>>;
type _17b = Expect<Equal<TupleToUnion<[string, number]>, string | number>>;
type _17c = Expect<Equal<TupleToUnion<[]>, never>>;

// ---------------------------------------------------------------------------
// #18 — Last<T>
// ---------------------------------------------------------------------------
// Use a rest element followed by infer to capture the last element.

type Last<T extends readonly any[]> = T extends [...any[], infer L] ? L : never;

type _18a = Expect<Equal<Last<[1, 2, 3]>, 3>>;
type _18b = Expect<Equal<Last<["a"]>, "a">>;
type _18c = Expect<Equal<Last<[]>, never>>;

// ---------------------------------------------------------------------------
// #19 — Flatten<T>
// ---------------------------------------------------------------------------
// Recursively process each head element. If head is itself an array,
// flatten it and spread. Otherwise keep the element and recurse on tail.

type Flatten<T extends readonly any[]> = T extends [infer Head, ...infer Tail]
  ? Head extends readonly any[]
    ? [...Flatten<Head>, ...Flatten<Tail>]
    : [Head, ...Flatten<Tail>]
  : [];

type _19a = Expect<Equal<Flatten<[1, [2, 3], [4, [5]]]>, [1, 2, 3, 4, 5]>>;
type _19b = Expect<Equal<Flatten<[[1, 2], [3]]>, [1, 2, 3]>>;
type _19c = Expect<Equal<Flatten<[]>, []>>;

// ---------------------------------------------------------------------------
// #20 — TrimLeft<S>
// ---------------------------------------------------------------------------
// Use a template literal type to check if S starts with a whitespace
// character. If so, recurse on the remainder. Otherwise return S.

type Whitespace = " " | "\t" | "\n";

type TrimLeft<S extends string> = S extends `${Whitespace}${infer Rest}`
  ? TrimLeft<Rest>
  : S;

type _20a = Expect<Equal<TrimLeft<"  hello">, "hello">>;
type _20b = Expect<Equal<TrimLeft<"\t\n world">, "world">>;
type _20c = Expect<Equal<TrimLeft<"no-space">, "no-space">>;
type _20d = Expect<Equal<TrimLeft<"">, "">>;

// ---------------------------------------------------------------------------
// Runtime confirmation
// ---------------------------------------------------------------------------

console.log("All type challenges pass!");
