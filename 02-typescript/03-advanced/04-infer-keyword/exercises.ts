// ============================================================================
// Infer Keyword — Exercises
// TypeScript ES2022 | Strict | ESNext Modules
// Run: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// SECTION A: Predict the Output (5 exercises)
//
// For each exercise, predict what the resulting type will be.
// Write your answer in the `Answer` type alias, then uncomment the
// type-level assertion to check.
// ============================================================================

// ---------------------------------------------------------------------------
// Exercise 1: Basic array element inference
// ---------------------------------------------------------------------------
type UnwrapArray<T> = T extends (infer E)[] ? E : T;

type Ex1A = UnwrapArray<string[]>;
type Ex1B = UnwrapArray<number>;
type Ex1C = UnwrapArray<[boolean, string]>;

// What are Ex1A, Ex1B, and Ex1C?
// type Ex1A_Answer = ???;
// type Ex1B_Answer = ???;
// type Ex1C_Answer = ???;

// Uncomment to verify:
// type _Ex1A_Check = Ex1A extends Ex1A_Answer ? Ex1A_Answer extends Ex1A ? true : false : false;
// type _Ex1B_Check = Ex1B extends Ex1B_Answer ? Ex1B_Answer extends Ex1B ? true : false : false;
// type _Ex1C_Check = Ex1C extends Ex1C_Answer ? Ex1C_Answer extends Ex1C ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 2: Co-variant inference (same infer variable in multiple positions)
// ---------------------------------------------------------------------------
type CoInfer<T> = T extends { a: infer U; b: infer U } ? U : never;

type Ex2A = CoInfer<{ a: string; b: string }>;
type Ex2B = CoInfer<{ a: string; b: number }>;

// What are Ex2A and Ex2B?
// type Ex2A_Answer = ???;
// type Ex2B_Answer = ???;

// Uncomment to verify:
// type _Ex2A_Check = Ex2A extends Ex2A_Answer ? Ex2A_Answer extends Ex2A ? true : false : false;
// type _Ex2B_Check = Ex2B extends Ex2B_Answer ? Ex2B_Answer extends Ex2B ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 3: Contra-variant inference
// ---------------------------------------------------------------------------
type ContraInfer<T> = T extends {
  f: (x: infer U) => void;
  g: (x: infer U) => void;
} ? U : never;

type Ex3 = ContraInfer<{
  f: (x: string) => void;
  g: (x: "hello") => void;
}>;

// What is Ex3?
// type Ex3_Answer = ???;

// Uncomment to verify:
// type _Ex3_Check = Ex3 extends Ex3_Answer ? Ex3_Answer extends Ex3 ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 4: Template literal type inference
// ---------------------------------------------------------------------------
type ParsePath<S extends string> =
  S extends `${infer A}/${infer B}` ? [A, B] : [S];

type Ex4A = ParsePath<"users/123">;
type Ex4B = ParsePath<"a/b/c">;
type Ex4C = ParsePath<"single">;

// What are Ex4A, Ex4B, and Ex4C?
// type Ex4A_Answer = ???;
// type Ex4B_Answer = ???;
// type Ex4C_Answer = ???;

// Uncomment to verify:
// type _Ex4A_Check = Ex4A extends Ex4A_Answer ? Ex4A_Answer extends Ex4A ? true : false : false;
// type _Ex4B_Check = Ex4B extends Ex4B_Answer ? Ex4B_Answer extends Ex4B ? true : false : false;
// type _Ex4C_Check = Ex4C extends Ex4C_Answer ? Ex4C_Answer extends Ex4C ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 5: Infer with constraints (TS 5.x)
// ---------------------------------------------------------------------------
type NumericFirst<T> =
  T extends readonly [infer H extends number, ...unknown[]] ? H : never;

type Ex5A = NumericFirst<[42, "a", true]>;
type Ex5B = NumericFirst<["hello", 10]>;
type Ex5C = NumericFirst<[100]>;

// What are Ex5A, Ex5B, and Ex5C?
// type Ex5A_Answer = ???;
// type Ex5B_Answer = ???;
// type Ex5C_Answer = ???;

// Uncomment to verify:
// type _Ex5A_Check = Ex5A extends Ex5A_Answer ? Ex5A_Answer extends Ex5A ? true : false : false;
// type _Ex5B_Check = Ex5B extends Ex5B_Answer ? Ex5B_Answer extends Ex5B ? true : false : false;
// type _Ex5C_Check = Ex5C extends Ex5C_Answer ? Ex5C_Answer extends Ex5C ? true : false : false;


// ============================================================================
// SECTION B: Fix the Bug (3 exercises)
//
// Each exercise has a type that doesn't compile or produces wrong results.
// Fix the type definition so it works correctly.
// ============================================================================

// ---------------------------------------------------------------------------
// Exercise 6: Fix — Extract return type (currently errors)
// ---------------------------------------------------------------------------
// BUG: This type doesn't correctly handle function types.
// Fix it so MyReturnType<T> extracts the return type of a function.

// type MyReturnType<T> = T extends (...args: infer P) => unknown ? P : never;

// Expected:
// type Ex6A = MyReturnType<() => string>;        // should be: string
// type Ex6B = MyReturnType<(x: number) => boolean>; // should be: boolean

// Uncomment to verify:
// const _ex6a: Ex6A = "hello";
// const _ex6b: Ex6B = true;

// ---------------------------------------------------------------------------
// Exercise 7: Fix — Deep promise unwrap (infinite recursion issue)
// ---------------------------------------------------------------------------
// BUG: This type doesn't recursively unwrap nested promises.

// type DeepAwaited<T> = T extends Promise<infer V> ? V : T;

// Expected:
// type Ex7A = DeepAwaited<Promise<Promise<Promise<number>>>>; // should be: number
// type Ex7B = DeepAwaited<Promise<string>>;                   // should be: string
// type Ex7C = DeepAwaited<boolean>;                           // should be: boolean

// Uncomment to verify:
// const _ex7a: Ex7A = 42;
// const _ex7b: Ex7B = "hello";
// const _ex7c: Ex7C = true;

// ---------------------------------------------------------------------------
// Exercise 8: Fix — Last element of tuple (wrong pattern)
// ---------------------------------------------------------------------------
// BUG: This always returns the first element instead of the last.

// type LastElement<T extends readonly unknown[]> =
//   T extends readonly [infer L, ...unknown[]] ? L : never;

// Expected:
// type Ex8A = LastElement<[1, 2, 3]>;       // should be: 3
// type Ex8B = LastElement<["a", "b"]>;      // should be: "b"
// type Ex8C = LastElement<[true]>;          // should be: true

// Uncomment to verify:
// const _ex8a: Ex8A = 3;
// const _ex8b: Ex8B = "b";
// const _ex8c: Ex8C = true;


// ============================================================================
// SECTION C: Implement (7 exercises)
//
// Implement each type alias from scratch.
// ============================================================================

// ---------------------------------------------------------------------------
// Exercise 9: Implement — ExtractPromiseValue
// Extract the resolved type of a Promise. Non-promise types return never.
// ---------------------------------------------------------------------------

// type ExtractPromiseValue<T> = ???;

// Uncomment to verify:
// type Ex9A = ExtractPromiseValue<Promise<string>>;  // string
// type Ex9B = ExtractPromiseValue<Promise<number[]>>; // number[]
// type Ex9C = ExtractPromiseValue<number>;            // never

// const _ex9a: Ex9A = "test";
// const _ex9b: Ex9B = [1, 2, 3];
// const _ex9c: never = undefined as Ex9C;

// ---------------------------------------------------------------------------
// Exercise 10: Implement — Head and Tail
// Head<T> returns the first element; Tail<T> returns all but the first.
// ---------------------------------------------------------------------------

// type Head<T extends readonly unknown[]> = ???;
// type Tail<T extends readonly unknown[]> = ???;

// Uncomment to verify:
// type Ex10A = Head<[1, 2, 3]>;   // 1
// type Ex10B = Tail<[1, 2, 3]>;   // [2, 3]
// type Ex10C = Head<[string]>;    // string
// type Ex10D = Tail<[string]>;    // []

// const _ex10a: Ex10A = 1;
// const _ex10b: Ex10B = [2, 3];
// const _ex10c: Ex10C = "hello";
// const _ex10d: Ex10D = [];

// ---------------------------------------------------------------------------
// Exercise 11: Implement — FunctionInfo
// Given a function type, extract an object with `params` and `returnType`.
// ---------------------------------------------------------------------------

// type FunctionInfo<T extends (...args: never[]) => unknown> = ???;

// Uncomment to verify:
// type Ex11A = FunctionInfo<(a: string, b: number) => boolean>;
// Expected: { params: [a: string, b: number]; returnType: boolean }

// const _ex11a: Ex11A = { params: ["hi", 42], returnType: false };

// ---------------------------------------------------------------------------
// Exercise 12: Implement — SplitString
// Recursively split a string by a delimiter into a tuple of string literals.
// SplitString<"a.b.c", "."> should be ["a", "b", "c"]
// ---------------------------------------------------------------------------

// type SplitString<S extends string, D extends string> = ???;

// Uncomment to verify:
// type Ex12A = SplitString<"a.b.c", ".">;       // ["a", "b", "c"]
// type Ex12B = SplitString<"hello", ".">;        // ["hello"]
// type Ex12C = SplitString<"x-y-z-w", "-">;     // ["x", "y", "z", "w"]

// const _ex12a: Ex12A = ["a", "b", "c"];
// const _ex12b: Ex12B = ["hello"];
// const _ex12c: Ex12C = ["x", "y", "z", "w"];

// ---------------------------------------------------------------------------
// Exercise 13: Implement — ExtractRouteParams
// Given "/users/:id/posts/:postId", produce { id: string; postId: string }.
// ---------------------------------------------------------------------------

// type ExtractParamNames<S extends string> = ???;
// type ExtractRouteParams<S extends string> = ???;

// Uncomment to verify:
// type Ex13A = ExtractRouteParams<"/users/:id/posts/:postId">;
// Expected: { id: string; postId: string }

// type Ex13B = ExtractRouteParams<"/home">;
// Expected: {}

// const _ex13a: Ex13A = { id: "123", postId: "456" };
// const _ex13b: Ex13B = {};

// ---------------------------------------------------------------------------
// Exercise 14: Implement — Reverse tuple
// Reverse<[1, 2, 3]> should be [3, 2, 1].
// ---------------------------------------------------------------------------

// type Reverse<T extends readonly unknown[]> = ???;

// Uncomment to verify:
// type Ex14A = Reverse<[1, 2, 3]>;         // [3, 2, 1]
// type Ex14B = Reverse<["a", "b"]>;        // ["b", "a"]
// type Ex14C = Reverse<[]>;                // []

// const _ex14a: Ex14A = [3, 2, 1];
// const _ex14b: Ex14B = ["b", "a"];
// const _ex14c: Ex14C = [];

// ---------------------------------------------------------------------------
// Exercise 15: Implement — DeepGet
// Access nested object properties via a dot-separated string path.
// DeepGet<{ a: { b: { c: number } } }, "a.b.c"> should be number.
// ---------------------------------------------------------------------------

// type DeepGet<T, Path extends string> = ???;

// Uncomment to verify:
// type Nested = { a: { b: { c: number }; d: string } };
// type Ex15A = DeepGet<Nested, "a.b.c">;   // number
// type Ex15B = DeepGet<Nested, "a.d">;      // string
// type Ex15C = DeepGet<Nested, "a.b">;      // { c: number }
// type Ex15D = DeepGet<Nested, "a.x">;      // never

// const _ex15a: Ex15A = 42;
// const _ex15b: Ex15B = "hello";
// const _ex15c: Ex15C = { c: 100 };


// ============================================================================
// All exercises above should compile cleanly with no errors.
// The test code is commented out — uncomment as you solve each exercise.
// ============================================================================

export {};
