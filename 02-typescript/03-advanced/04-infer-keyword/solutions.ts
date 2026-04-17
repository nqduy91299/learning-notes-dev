// ============================================================================
// Infer Keyword — Solutions
// TypeScript ES2022 | Strict | ESNext Modules
// Run: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// SECTION A: Predict the Output — Answers
// ============================================================================

// ---------------------------------------------------------------------------
// Exercise 1: Basic array element inference
// ---------------------------------------------------------------------------
type UnwrapArray<T> = T extends (infer E)[] ? E : T;

type Ex1A = UnwrapArray<string[]>;              // string
type Ex1B = UnwrapArray<number>;                // number (false branch, T itself)
type Ex1C = UnwrapArray<[boolean, string]>;     // boolean | string

// Explanation:
// - string[] matches (infer E)[], so E = string
// - number doesn't match the array pattern, so we get T = number
// - [boolean, string] is a tuple which extends unknown[]. The element type
//   inferred from a tuple is the union of its members: boolean | string

type Ex1A_Answer = string;
type Ex1B_Answer = number;
type Ex1C_Answer = boolean | string;

type _Ex1A_Check = Ex1A extends Ex1A_Answer ? Ex1A_Answer extends Ex1A ? true : false : false;
type _Ex1B_Check = Ex1B extends Ex1B_Answer ? Ex1B_Answer extends Ex1B ? true : false : false;
type _Ex1C_Check = Ex1C extends Ex1C_Answer ? Ex1C_Answer extends Ex1C ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 2: Co-variant inference
// ---------------------------------------------------------------------------
type CoInfer<T> = T extends { a: infer U; b: infer U } ? U : never;

type Ex2A = CoInfer<{ a: string; b: string }>;  // string
type Ex2B = CoInfer<{ a: string; b: number }>;  // string | number

// Explanation:
// When the same type variable U is inferred in multiple co-variant positions
// (like property types), TypeScript produces a UNION of all inferred types.
// - { a: string; b: string } => U = string | string = string
// - { a: string; b: number } => U = string | number

type Ex2A_Answer = string;
type Ex2B_Answer = string | number;

type _Ex2A_Check = Ex2A extends Ex2A_Answer ? Ex2A_Answer extends Ex2A ? true : false : false;
type _Ex2B_Check = Ex2B extends Ex2B_Answer ? Ex2B_Answer extends Ex2B ? true : false : false;

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

// Explanation:
// In contra-variant positions (function parameters), same-named infer produces
// an INTERSECTION. string & "hello" = "hello" (since "hello" extends string).
type Ex3_Answer = "hello";

type _Ex3_Check = Ex3 extends Ex3_Answer ? Ex3_Answer extends Ex3 ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 4: Template literal type inference
// ---------------------------------------------------------------------------
type ParsePath<S extends string> =
  S extends `${infer A}/${infer B}` ? [A, B] : [S];

type Ex4A = ParsePath<"users/123">;   // ["users", "123"]
type Ex4B = ParsePath<"a/b/c">;       // ["a", "b/c"]
type Ex4C = ParsePath<"single">;      // ["single"]

// Explanation:
// Template literal infer matches greedily from the RIGHT for the second
// capture. So "a/b/c" splits at the FIRST "/" giving A="a" and B="b/c".
// "single" has no "/" so the false branch returns ["single"].

type Ex4A_Answer = ["users", "123"];
type Ex4B_Answer = ["a", "b/c"];
type Ex4C_Answer = ["single"];

type _Ex4A_Check = Ex4A extends Ex4A_Answer ? Ex4A_Answer extends Ex4A ? true : false : false;
type _Ex4B_Check = Ex4B extends Ex4B_Answer ? Ex4B_Answer extends Ex4B ? true : false : false;
type _Ex4C_Check = Ex4C extends Ex4C_Answer ? Ex4C_Answer extends Ex4C ? true : false : false;

// ---------------------------------------------------------------------------
// Exercise 5: Infer with constraints
// ---------------------------------------------------------------------------
type NumericFirst<T> =
  T extends readonly [infer H extends number, ...unknown[]] ? H : never;

type Ex5A = NumericFirst<[42, "a", true]>;  // 42
type Ex5B = NumericFirst<["hello", 10]>;    // never
type Ex5C = NumericFirst<[100]>;            // 100

// Explanation:
// `infer H extends number` only matches if the first element extends number.
// - [42, ...] => H = 42 (42 extends number ✓)
// - ["hello", ...] => "hello" doesn't extend number, so false branch => never
// - [100] => H = 100

type Ex5A_Answer = 42;
type Ex5B_Answer = never;
type Ex5C_Answer = 100;

type _Ex5A_Check = Ex5A extends Ex5A_Answer ? Ex5A_Answer extends Ex5A ? true : false : false;
type _Ex5B_Check = Ex5B extends Ex5B_Answer ? Ex5B_Answer extends Ex5B ? true : false : false;
type _Ex5C_Check = Ex5C extends Ex5C_Answer ? Ex5C_Answer extends Ex5C ? true : false : false;


// ============================================================================
// SECTION B: Fix the Bug — Solutions
// ============================================================================

// ---------------------------------------------------------------------------
// Exercise 6: Fix — Extract return type
// ---------------------------------------------------------------------------
// BUG: Original inferred `P` (parameters) instead of return type.
// FIX: Use `infer R` on the return position, not the parameter position.

type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never;

type Ex6A = MyReturnType<() => string>;            // string
type Ex6B = MyReturnType<(x: number) => boolean>;  // boolean

const _ex6a: Ex6A = "hello";
const _ex6b: Ex6B = true;

// Explanation:
// The original had `infer P` in the args position and returned P (the params
// tuple). We need `infer R` after the `=>` to capture the return type.

// ---------------------------------------------------------------------------
// Exercise 7: Fix — Deep promise unwrap
// ---------------------------------------------------------------------------
// BUG: Original didn't recurse — it only unwrapped one level.
// FIX: Recursively apply DeepAwaited on the inferred value.

type DeepAwaited<T> = T extends Promise<infer V> ? DeepAwaited<V> : T;

type Ex7A = DeepAwaited<Promise<Promise<Promise<number>>>>; // number
type Ex7B = DeepAwaited<Promise<string>>;                   // string
type Ex7C = DeepAwaited<boolean>;                           // boolean

const _ex7a: Ex7A = 42;
const _ex7b: Ex7B = "hello";
const _ex7c: Ex7C = true;

// Explanation:
// Without recursion, Promise<Promise<number>> only unwraps to Promise<number>.
// By calling DeepAwaited<V> instead of just V, we keep unwrapping until V is
// no longer a Promise.

// ---------------------------------------------------------------------------
// Exercise 8: Fix — Last element of tuple
// ---------------------------------------------------------------------------
// BUG: Pattern [infer L, ...unknown[]] captures the FIRST element.
// FIX: Use [...unknown[], infer L] to capture the LAST element.

type LastElement<T extends readonly unknown[]> =
  T extends readonly [...unknown[], infer L] ? L : never;

type Ex8A = LastElement<[1, 2, 3]>;       // 3
type Ex8B = LastElement<["a", "b"]>;      // "b"
type Ex8C = LastElement<[true]>;          // true

const _ex8a: Ex8A = 3;
const _ex8b: Ex8B = "b";
const _ex8c: Ex8C = true;

// Explanation:
// Variadic tuple types allow rest elements at ANY position. Placing the rest
// `...unknown[]` BEFORE `infer L` means L matches the last element.


// ============================================================================
// SECTION C: Implement — Solutions
// ============================================================================

// ---------------------------------------------------------------------------
// Exercise 9: Implement — ExtractPromiseValue
// ---------------------------------------------------------------------------
type ExtractPromiseValue<T> = T extends Promise<infer V> ? V : never;

type Ex9A = ExtractPromiseValue<Promise<string>>;   // string
type Ex9B = ExtractPromiseValue<Promise<number[]>>; // number[]
type Ex9C = ExtractPromiseValue<number>;            // never

const _ex9a: Ex9A = "test";
const _ex9b: Ex9B = [1, 2, 3];
const _ex9c: never = undefined as Ex9C;

// Explanation:
// Classic infer pattern — match Promise<infer V> and return V.
// Non-promise types don't match, so we return never.

// ---------------------------------------------------------------------------
// Exercise 10: Implement — Head and Tail
// ---------------------------------------------------------------------------
type Head<T extends readonly unknown[]> =
  T extends readonly [infer H, ...unknown[]] ? H : never;

type Tail<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer R] ? R : never;

type Ex10A = Head<[1, 2, 3]>;   // 1
type Ex10B = Tail<[1, 2, 3]>;   // [2, 3]
type Ex10C = Head<[string]>;    // string
type Ex10D = Tail<[string]>;    // []

const _ex10a: Ex10A = 1;
const _ex10b: Ex10B = [2, 3];
const _ex10c: Ex10C = "hello";
const _ex10d: Ex10D = [];

// Explanation:
// Head: infer the first element H, ignore the rest.
// Tail: ignore the first element, infer the rest R.
// For a single-element tuple, Tail returns [].

// ---------------------------------------------------------------------------
// Exercise 11: Implement — FunctionInfo
// ---------------------------------------------------------------------------
type FunctionInfo<T extends (...args: never[]) => unknown> =
  T extends (...args: infer P) => infer R
    ? { params: P; returnType: R }
    : never;

type Ex11A = FunctionInfo<(a: string, b: number) => boolean>;

const _ex11a: Ex11A = { params: ["hi", 42], returnType: false };

// Explanation:
// We use two infer declarations in the same conditional:
// - `infer P` captures the parameter tuple
// - `infer R` captures the return type
// We combine them into an object type.

// ---------------------------------------------------------------------------
// Exercise 12: Implement — SplitString
// ---------------------------------------------------------------------------
type SplitString<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...SplitString<Tail, D>]
    : [S];

type Ex12A = SplitString<"a.b.c", ".">;       // ["a", "b", "c"]
type Ex12B = SplitString<"hello", ".">;        // ["hello"]
type Ex12C = SplitString<"x-y-z-w", "-">;     // ["x", "y", "z", "w"]

const _ex12a: Ex12A = ["a", "b", "c"];
const _ex12b: Ex12B = ["hello"];
const _ex12c: Ex12C = ["x", "y", "z", "w"];

// Explanation:
// Recursive template literal pattern:
// 1. Try to match `Head` + delimiter + `Tail`
// 2. If it matches, put Head in the result and recurse on Tail
// 3. If no delimiter is found, return [S] as the base case
// "a.b.c" => Head="a", Tail="b.c" => ["a", ...SplitString<"b.c", ".">]
//   => ["a", "b", ...SplitString<"c", ".">] => ["a", "b", "c"]

// ---------------------------------------------------------------------------
// Exercise 13: Implement — ExtractRouteParams
// ---------------------------------------------------------------------------
type ExtractParamNames<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParamNames<Rest>
    : S extends `${string}:${infer Param}`
      ? Param
      : never;

type ExtractRouteParams<S extends string> =
  [ExtractParamNames<S>] extends [never]
    ? Record<string, never>
    : { [K in ExtractParamNames<S>]: string };

type Ex13A = ExtractRouteParams<"/users/:id/posts/:postId">;
type Ex13B = ExtractRouteParams<"/home">;

const _ex13a: Ex13A = { id: "123", postId: "456" };
const _ex13b: Ex13B = {} as Record<string, never>;

// Explanation:
// ExtractParamNames recursively finds segments starting with `:`.
// - "/users/:id/posts/:postId": matches first pattern with Param="id",
//   Rest="posts/:postId", then recurses to find "postId".
// - "/home": no `:` found, returns never.
// ExtractRouteParams maps each param name to string.
// We check [never] extends [never] to handle the empty case.

// ---------------------------------------------------------------------------
// Exercise 14: Implement — Reverse tuple
// ---------------------------------------------------------------------------
type Reverse<T extends readonly unknown[]> =
  T extends readonly [infer H, ...infer Tail]
    ? [...Reverse<Tail>, H]
    : [];

type Ex14A = Reverse<[1, 2, 3]>;         // [3, 2, 1]
type Ex14B = Reverse<["a", "b"]>;        // ["b", "a"]
type Ex14C = Reverse<[]>;                // []

const _ex14a: Ex14A = [3, 2, 1];
const _ex14b: Ex14B = ["b", "a"];
const _ex14c: Ex14C = [];

// Explanation:
// Classic recursive tuple reversal:
// 1. Destructure into Head and Tail
// 2. Reverse the Tail, then append Head at the end
// 3. Empty tuple is the base case
// [1, 2, 3] => [...Reverse<[2, 3]>, 1]
//           => [...[...Reverse<[3]>, 2], 1]
//           => [...[...[...Reverse<[]>, 3], 2], 1]
//           => [...[...[3], 2], 1]
//           => [...[3, 2], 1]
//           => [3, 2, 1]

// ---------------------------------------------------------------------------
// Exercise 15: Implement — DeepGet
// ---------------------------------------------------------------------------
type DeepGet<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? DeepGet<T[Key], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

type Nested = { a: { b: { c: number }; d: string } };
type Ex15A = DeepGet<Nested, "a.b.c">;   // number
type Ex15B = DeepGet<Nested, "a.d">;      // string
type Ex15C = DeepGet<Nested, "a.b">;      // { c: number }
type Ex15D = DeepGet<Nested, "a.x">;      // never

const _ex15a: Ex15A = 42;
const _ex15b: Ex15B = "hello";
const _ex15c: Ex15C = { c: 100 };

// Explanation:
// Recursive dot-path resolution:
// 1. Try to split Path at the first "." into Key and Rest
// 2. If Key is a valid key of T, recurse with T[Key] and Rest
// 3. If no "." found, check if Path itself is a key of T
// 4. Return never for invalid paths
//
// "a.b.c" on { a: { b: { c: number }; d: string } }:
//   Key="a", Rest="b.c" => DeepGet<{ b: { c: number }; d: string }, "b.c">
//   Key="b", Rest="c"   => DeepGet<{ c: number }, "c">
//   No "." in "c", "c" is keyof { c: number } => number


// ============================================================================
// Runner — Runtime verification
// ============================================================================

console.log("=== Infer Keyword — Solutions Runner ===\n");

// Exercise 1: Predict output
console.log("Exercise 1: UnwrapArray");
console.log("  Ex1A (string[]  -> string):", "string");
console.log("  Ex1B (number    -> number):", "number");
console.log("  Ex1C ([bool,str]-> bool|str):", "boolean | string");

// Exercise 2: Co-variant inference
console.log("\nExercise 2: CoInfer (co-variant)");
console.log("  Ex2A: string");
console.log("  Ex2B: string | number");

// Exercise 3: Contra-variant inference
console.log("\nExercise 3: ContraInfer (contra-variant)");
console.log('  Ex3: "hello" (string & "hello" = "hello")');

// Exercise 4: Template literal
console.log("\nExercise 4: ParsePath");
console.log('  Ex4A: ["users", "123"]');
console.log('  Ex4B: ["a", "b/c"]');
console.log('  Ex4C: ["single"]');

// Exercise 5: Infer constraints
console.log("\nExercise 5: NumericFirst (constrained infer)");
console.log("  Ex5A: 42");
console.log("  Ex5B: never");
console.log("  Ex5C: 100");

// Exercise 6-8: Bug fixes
console.log("\nExercise 6: MyReturnType =>", _ex6a, _ex6b);
console.log("Exercise 7: DeepAwaited =>", _ex7a, _ex7b, _ex7c);
console.log("Exercise 8: LastElement =>", _ex8a, _ex8b, _ex8c);

// Exercise 9: ExtractPromiseValue
console.log("\nExercise 9: ExtractPromiseValue =>", _ex9a, _ex9b);

// Exercise 10: Head and Tail
console.log("Exercise 10: Head/Tail =>", _ex10a, _ex10b, _ex10c, _ex10d);

// Exercise 11: FunctionInfo
console.log("Exercise 11: FunctionInfo =>", JSON.stringify(_ex11a));

// Exercise 12: SplitString
console.log("Exercise 12: SplitString =>", _ex12a, _ex12b, _ex12c);

// Exercise 13: ExtractRouteParams
console.log("Exercise 13: RouteParams =>", JSON.stringify(_ex13a), JSON.stringify(_ex13b));

// Exercise 14: Reverse
console.log("Exercise 14: Reverse =>", _ex14a, _ex14b, _ex14c);

// Exercise 15: DeepGet
console.log("Exercise 15: DeepGet =>", _ex15a, _ex15b, JSON.stringify(_ex15c));

console.log("\n=== All solutions compile and run successfully! ===");

export {};
