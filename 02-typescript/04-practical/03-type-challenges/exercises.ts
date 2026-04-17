// ============================================================================
// Type Challenges — Exercises
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
//
// References:
//   - https://github.com/type-challenges/type-challenges
//   - https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
//
// Instructions:
//   Replace every `never` / `unknown` placeholder with your implementation.
//   Then uncomment the Expect<Equal<...>> test lines to verify at compile time.
//   If the file compiles, your types are correct!
// ============================================================================

// ---------------------------------------------------------------------------
// Test helpers (do not modify)
// ---------------------------------------------------------------------------

type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
    ? true
    : false;

// ---------------------------------------------------------------------------
// #1 — MyPick<T, K>
// Reimplement the built-in Pick<T, K> utility type.
// It constructs a type by picking the set of properties K from T.
// ---------------------------------------------------------------------------

type MyPick<T, K> = never; // YOUR TYPE HERE

// Tests:
// type _1a = Expect<Equal<MyPick<{ a: 1; b: 2; c: 3 }, "a">, { a: 1 }>>;
// type _1b = Expect<Equal<MyPick<{ a: 1; b: 2; c: 3 }, "a" | "b">, { a: 1; b: 2 }>>;

// ---------------------------------------------------------------------------
// #2 — MyReadonly<T>
// Reimplement the built-in Readonly<T> utility type.
// It makes all properties of T readonly.
// ---------------------------------------------------------------------------

type MyReadonly<T> = never; // YOUR TYPE HERE

// Tests:
// type _2a = Expect<Equal<MyReadonly<{ a: 1; b: 2 }>, { readonly a: 1; readonly b: 2 }>>;

// ---------------------------------------------------------------------------
// #3 — TupleToObject<T>
// Given a tuple of string/number/symbol literals, produce an object type
// where each element becomes both a key and its value type.
// ---------------------------------------------------------------------------

type TupleToObject<T extends readonly (string | number | symbol)[]> = never; // YOUR TYPE HERE

// Tests:
// type _3a = Expect<Equal<TupleToObject<["a", "b", "c"]>, { a: "a"; b: "b"; c: "c" }>>;
// type _3b = Expect<Equal<TupleToObject<[1, 2, 3]>, { 1: 1; 2: 2; 3: 3 }>>;

// ---------------------------------------------------------------------------
// #4 — First<T>
// Get the first element of a tuple type. Return never for empty tuples.
// ---------------------------------------------------------------------------

type First<T extends readonly any[]> = never; // YOUR TYPE HERE

// Tests:
// type _4a = Expect<Equal<First<[3, 2, 1]>, 3>>;
// type _4b = Expect<Equal<First<[]>, never>>;
// type _4c = Expect<Equal<First<[undefined]>, undefined>>;

// ---------------------------------------------------------------------------
// #5 — Length<T>
// Get the length of a tuple type (as a numeric literal type).
// ---------------------------------------------------------------------------

type Length<T extends readonly any[]> = never; // YOUR TYPE HERE

// Tests:
// type _5a = Expect<Equal<Length<[1, 2, 3]>, 3>>;
// type _5b = Expect<Equal<Length<[]>, 0>>;
// type _5c = Expect<Equal<Length<[undefined]>, 1>>;

// ---------------------------------------------------------------------------
// #6 — MyExclude<T, U>
// Reimplement the built-in Exclude<T, U> utility type.
// Exclude from T those types that are assignable to U.
// ---------------------------------------------------------------------------

type MyExclude<T, U> = never; // YOUR TYPE HERE

// Tests:
// type _6a = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
// type _6b = Expect<Equal<MyExclude<string | number | boolean, string>, number | boolean>>;

// ---------------------------------------------------------------------------
// #7 — MyAwaited<T>
// Unwrap a Promise type. If the Promise is nested, unwrap recursively
// until you reach a non-Promise type.
// ---------------------------------------------------------------------------

type MyAwaited<T> = never; // YOUR TYPE HERE

// Tests:
// type _7a = Expect<Equal<MyAwaited<Promise<string>>, string>>;
// type _7b = Expect<Equal<MyAwaited<Promise<Promise<number>>>, number>>;
// type _7c = Expect<Equal<MyAwaited<Promise<Promise<Promise<boolean>>>>, boolean>>;

// ---------------------------------------------------------------------------
// #8 — If<C, T, F>
// Implement a type that evaluates to T when C is true, and F when C is
// false. C is constrained to boolean.
// ---------------------------------------------------------------------------

type If<C extends boolean, T, F> = never; // YOUR TYPE HERE

// Tests:
// type _8a = Expect<Equal<If<true, "a", "b">, "a">>;
// type _8b = Expect<Equal<If<false, "a", "b">, "b">>;

// ---------------------------------------------------------------------------
// #9 — Concat<T, U>
// Implement Concat that concatenates two tuple types into a new one.
// ---------------------------------------------------------------------------

type Concat<T extends readonly any[], U extends readonly any[]> = never; // YOUR TYPE HERE

// Tests:
// type _9a = Expect<Equal<Concat<[1, 2], [3, 4]>, [1, 2, 3, 4]>>;
// type _9b = Expect<Equal<Concat<[], [1]>, [1]>>;
// type _9c = Expect<Equal<Concat<[1], []>, [1]>>;

// ---------------------------------------------------------------------------
// #10 — Includes<T, U>
// Implement Includes that checks if a type U exists in a tuple T.
// Use strict equality (Equal), not just extends.
// ---------------------------------------------------------------------------

type Includes<T extends readonly any[], U> = never; // YOUR TYPE HERE

// Tests:
// type _10a = Expect<Equal<Includes<[1, 2, 3], 2>, true>>;
// type _10b = Expect<Equal<Includes<[1, 2, 3], 4>, false>>;
// type _10c = Expect<Equal<Includes<[boolean, 1, "a"], false>, false>>;
// type _10d = Expect<Equal<Includes<[true, false], boolean>, false>>;

// ---------------------------------------------------------------------------
// #11 — Push<T, U> and Unshift<T, U>
// Implement both Push (append to end) and Unshift (prepend to start).
// ---------------------------------------------------------------------------

type Push<T extends readonly any[], U> = never; // YOUR TYPE HERE
type Unshift<T extends readonly any[], U> = never; // YOUR TYPE HERE

// Tests:
// type _11a = Expect<Equal<Push<[1, 2], 3>, [1, 2, 3]>>;
// type _11b = Expect<Equal<Push<[], 1>, [1]>>;
// type _11c = Expect<Equal<Unshift<[1, 2], 0>, [0, 1, 2]>>;
// type _11d = Expect<Equal<Unshift<[], 1>, [1]>>;

// ---------------------------------------------------------------------------
// #12 — MyParameters<T>
// Reimplement the built-in Parameters<T> utility type.
// Extract the parameter types of a function type as a tuple.
// ---------------------------------------------------------------------------

type MyParameters<T extends (...args: any) => any> = never; // YOUR TYPE HERE

// Tests:
// type _12a = Expect<Equal<MyParameters<(a: string, b: number) => void>, [string, number]>>;
// type _12b = Expect<Equal<MyParameters<() => void>, []>>;

// ---------------------------------------------------------------------------
// #13 — MyReturnType<T>
// Reimplement the built-in ReturnType<T> utility type.
// Extract the return type of a function type.
// ---------------------------------------------------------------------------

type MyReturnType<T extends (...args: any) => any> = never; // YOUR TYPE HERE

// Tests:
// type _13a = Expect<Equal<MyReturnType<() => string>, string>>;
// type _13b = Expect<Equal<MyReturnType<(a: number) => boolean>, boolean>>;
// type _13c = Expect<Equal<MyReturnType<() => Promise<number>>, Promise<number>>>;

// ---------------------------------------------------------------------------
// #14 — MyOmit<T, K>
// Reimplement the built-in Omit<T, K> utility type.
// Construct a type by picking all properties from T except those in K.
// ---------------------------------------------------------------------------

type MyOmit<T, K extends keyof T> = never; // YOUR TYPE HERE

// Tests:
// type _14a = Expect<Equal<MyOmit<{ a: 1; b: 2; c: 3 }, "a">, { b: 2; c: 3 }>>;
// type _14b = Expect<Equal<MyOmit<{ a: 1; b: 2; c: 3 }, "a" | "c">, { b: 2 }>>;

// ---------------------------------------------------------------------------
// #15 — DeepReadonly<T>
// Make all properties of T (and nested objects) deeply readonly.
// ---------------------------------------------------------------------------

type DeepReadonly<T> = never; // YOUR TYPE HERE

// Tests:
// type _15input = { a: { b: { c: number } }; d: string };
// type _15expected = { readonly a: { readonly b: { readonly c: number } }; readonly d: string };
// type _15a = Expect<Equal<DeepReadonly<_15input>, _15expected>>;

// ---------------------------------------------------------------------------
// #16 — Chainable<T>
// Implement a Chainable type for a fluent option builder.
// It should have:
//   option<K, V>(key: K, value: V) => Chainable<T & { [k in K]: V }>
//   get() => T
// ---------------------------------------------------------------------------

type Chainable<T = {}> = {
  option: unknown; // YOUR TYPE HERE
  get: unknown; // YOUR TYPE HERE
};

// Tests:
// declare const config: Chainable;
// type _16result = typeof config
//   .option("name", "hello")
//   .option("age", 42)
//   .option("active", true)
//   .get;  // should be () => { name: string; age: number; active: boolean }
//
// type _16a = Expect<Equal<
//   ReturnType<typeof config.option<"name", string>["option"]<"age", number>["get"]>,
//   { name: string; age: number }
// >>;

// ---------------------------------------------------------------------------
// #17 — TupleToUnion<T>
// Convert a tuple type to a union of its element types.
// ---------------------------------------------------------------------------

type TupleToUnion<T extends readonly any[]> = never; // YOUR TYPE HERE

// Tests:
// type _17a = Expect<Equal<TupleToUnion<[1, 2, 3]>, 1 | 2 | 3>>;
// type _17b = Expect<Equal<TupleToUnion<[string, number]>, string | number>>;
// type _17c = Expect<Equal<TupleToUnion<[]>, never>>;

// ---------------------------------------------------------------------------
// #18 — Last<T>
// Get the last element of a tuple type. Return never for empty tuples.
// ---------------------------------------------------------------------------

type Last<T extends readonly any[]> = never; // YOUR TYPE HERE

// Tests:
// type _18a = Expect<Equal<Last<[1, 2, 3]>, 3>>;
// type _18b = Expect<Equal<Last<["a"]>, "a">>;
// type _18c = Expect<Equal<Last<[]>, never>>;

// ---------------------------------------------------------------------------
// #19 — Flatten<T>
// Flatten a nested tuple type into a single-level tuple.
// ---------------------------------------------------------------------------

type Flatten<T extends readonly any[]> = never; // YOUR TYPE HERE

// Tests:
// type _19a = Expect<Equal<Flatten<[1, [2, 3], [4, [5]]]>, [1, 2, 3, 4, 5]>>;
// type _19b = Expect<Equal<Flatten<[[1, 2], [3]]>, [1, 2, 3]>>;
// type _19c = Expect<Equal<Flatten<[]>, []>>;

// ---------------------------------------------------------------------------
// #20 — TrimLeft<S>
// Remove leading whitespace (spaces, tabs, newlines) from a string type.
// ---------------------------------------------------------------------------

type TrimLeft<S extends string> = never; // YOUR TYPE HERE

// Tests:
// type _20a = Expect<Equal<TrimLeft<"  hello">, "hello">>;
// type _20b = Expect<Equal<TrimLeft<"\t\n world">, "world">>;
// type _20c = Expect<Equal<TrimLeft<"no-space">, "no-space">>;
// type _20d = Expect<Equal<TrimLeft<"">, "">>;

// ---------------------------------------------------------------------------
// Runtime — file compiles successfully
// ---------------------------------------------------------------------------

console.log("exercises.ts compiles — fill in the types and uncomment tests!");
