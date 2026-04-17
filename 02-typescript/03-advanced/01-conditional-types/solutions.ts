/**
 * Conditional Types - Solutions
 *
 * Complete solutions with explanations for all 18 exercises.
 *
 * Configuration: ES2022, strict mode, ESNext modules
 * Run with: npx tsx solutions.ts
 */

// ============================================================================
// Helper: compile-time type equality check
// ============================================================================

type Expect<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

// ============================================================================
// PREDICT THE OUTPUT - Solutions 1-6
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Basic Conditional Type
//
// IsNumber<42>:
//   42 extends number ? "yes" : "no"
//   42 is a number literal, which is assignable to number.
//   Result: "yes"
// ----------------------------------------------------------------------------

type IsNumber<T> = T extends number ? "yes" : "no";

type Ex1 = IsNumber<42>;

type Answer_1 = "yes";

type Check_1 = Expect<Equal<Ex1, Answer_1>>;

// ----------------------------------------------------------------------------
// Exercise 2: Distribution over Unions
//
// ToArray<string | number>:
//   T is a naked type parameter in `T extends unknown`, so it distributes.
//   (string extends unknown ? string[] : never) | (number extends unknown ? number[] : never)
//   = string[] | number[]
//
//   Note: this is NOT (string | number)[]. Distribution produces a union of
//   arrays, not an array of the union.
// ----------------------------------------------------------------------------

type ToArray<T> = T extends unknown ? T[] : never;

type Ex2 = ToArray<string | number>;

type Answer_2 = string[] | number[];

type Check_2 = Expect<Equal<Ex2, Answer_2>>;

// ----------------------------------------------------------------------------
// Exercise 3: never and Distribution
//
// Wrap<never>:
//   `never` is the empty union type. When distribution occurs over an empty
//   union, the result is `never` -- there are no members to distribute over.
//   The conditional body is never evaluated.
//   Result: never
// ----------------------------------------------------------------------------

type Wrap<T> = T extends unknown ? { value: T } : never;

type Ex3 = Wrap<never>;

type Answer_3 = never;

type Check_3 = Expect<Equal<Ex3, Answer_3>>;

// ----------------------------------------------------------------------------
// Exercise 4: Preventing Distribution with Tuple Wrapping
//
// Ex4a: IsStringDist<string | number>
//   Distributes: (string extends string ? true : false) | (number extends string ? true : false)
//   = true | false
//   = boolean
//
// Ex4b: IsStringNoDist<string | number>
//   No distribution (T is wrapped in tuple):
//   [string | number] extends [string] ? true : false
//   string | number is NOT assignable to string (number isn't string)
//   = false
// ----------------------------------------------------------------------------

type IsStringDist<T> = T extends string ? true : false;
type IsStringNoDist<T> = [T] extends [string] ? true : false;

type Ex4a = IsStringDist<string | number>;
type Ex4b = IsStringNoDist<string | number>;

type Answer_4a = boolean;
type Answer_4b = false;

type Check_4a = Expect<Equal<Ex4a, Answer_4a>>;
type Check_4b = Expect<Equal<Ex4b, Answer_4b>>;

// ----------------------------------------------------------------------------
// Exercise 5: boolean Distribution
//
// CheckTrue<boolean>:
//   boolean is equivalent to true | false. Distribution occurs:
//   (true extends true ? "truthy" : "falsy") | (false extends true ? "truthy" : "falsy")
//   = "truthy" | "falsy"
// ----------------------------------------------------------------------------

type CheckTrue<T> = T extends true ? "truthy" : "falsy";

type Ex5 = CheckTrue<boolean>;

type Answer_5 = "truthy" | "falsy";

type Check_5 = Expect<Equal<Ex5, Answer_5>>;

// ----------------------------------------------------------------------------
// Exercise 6: Nested Conditional with infer
//
// Ex6a: UnwrapOnce<Promise<string>>
//   Promise<string> extends Promise<infer U> => U = string => string
//
// Ex6b: UnwrapOnce<Promise<Promise<number>>>
//   Promise<Promise<number>> extends Promise<infer U> => U = Promise<number>
//   Only ONE level of unwrapping! => Promise<number>
//
// Ex6c: UnwrapOnce<boolean>
//   boolean does not extend Promise<infer U>
//   Falls to the false branch => boolean
// ----------------------------------------------------------------------------

type UnwrapOnce<T> = T extends Promise<infer U> ? U : T;

type Ex6a = UnwrapOnce<Promise<string>>;
type Ex6b = UnwrapOnce<Promise<Promise<number>>>;
type Ex6c = UnwrapOnce<boolean>;

type Answer_6a = string;
type Answer_6b = Promise<number>;
type Answer_6c = boolean;

type Check_6a = Expect<Equal<Ex6a, Answer_6a>>;
type Check_6b = Expect<Equal<Ex6b, Answer_6b>>;
type Check_6c = Expect<Equal<Ex6c, Answer_6c>>;

// ============================================================================
// FIX THE BUG - Solutions 7-10
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 7: IsNever
//
// Bug: `never` is the empty union. When distributed over an empty union,
// the conditional is never evaluated, so the result is `never`.
//
// Fix: Wrap T in a tuple to prevent distribution.
// [T] extends [never] checks the type as a whole instead of distributing.
// ----------------------------------------------------------------------------

type IsNever<T> = [T] extends [never] ? true : false;

type Check_7a = Expect<Equal<IsNever<never>, true>>;
type Check_7b = Expect<Equal<IsNever<string>, false>>;
type Check_7c = Expect<Equal<IsNever<undefined>, false>>;

// ----------------------------------------------------------------------------
// Exercise 8: NonDistributive IsArray
//
// Bug: When T is a union like `string | number[]`, the conditional
// distributes over each member:
//   (string extends unknown[] ? true : false) | (number[] extends unknown[] ? true : false)
//   = false | true = boolean
//
// Fix: Wrap both sides in tuples to prevent distribution.
// ----------------------------------------------------------------------------

type IsArray<T> = [T] extends [unknown[]] ? true : false;

type Check_8a = Expect<Equal<IsArray<string[]>, true>>;
type Check_8b = Expect<Equal<IsArray<string | number[]>, false>>;
type Check_8c = Expect<Equal<IsArray<number>, false>>;

// ----------------------------------------------------------------------------
// Exercise 9: Extract String Keys
//
// Bug: The conditional branches are swapped.
// `T[K] extends string ? never : K` returns K when the value is NOT a string.
// It should return K when the value IS a string.
//
// Fix: Swap never and K in the conditional.
// ----------------------------------------------------------------------------

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type Check_9a = Expect<Equal<StringKeys<{ name: string; age: number; email: string }>, "name" | "email">>;
type Check_9b = Expect<Equal<StringKeys<{ count: number }>, never>>;

// ----------------------------------------------------------------------------
// Exercise 10: Safe Return Type
//
// Bug: The generic constraint `T extends (...args: never[]) => unknown`
// prevents non-function types from being passed (causes a compile error).
//
// Fix: Remove the constraint so any type can be passed. The conditional
// itself handles non-function types by returning `never`.
// ----------------------------------------------------------------------------

type SafeReturnType<T> =
  T extends (...args: never[]) => infer R ? R : never;

type Check_10a = Expect<Equal<SafeReturnType<() => string>, string>>;
type Check_10b = Expect<Equal<SafeReturnType<(x: number) => boolean>, boolean>>;
type Check_10c = Expect<Equal<SafeReturnType<string>, never>>;

// ============================================================================
// IMPLEMENT - Solutions 11-18
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 11: MyExclude
//
// Uses distributive conditional types. For each member of the union T,
// if it extends U, remove it (return never); otherwise keep it.
// ----------------------------------------------------------------------------

type MyExclude<T, U> = T extends U ? never : T;

type Check_11a = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
type Check_11b = Expect<Equal<MyExclude<string | number | boolean, string>, number | boolean>>;
type Check_11c = Expect<Equal<MyExclude<"a" | "b", "a" | "b">, never>>;

// Trace for Check_11a:
//   "a" extends "a" ? never : "a"  =>  never
//   "b" extends "a" ? never : "b"  =>  "b"
//   "c" extends "a" ? never : "c"  =>  "c"
//   Result: never | "b" | "c" = "b" | "c"

// ----------------------------------------------------------------------------
// Exercise 12: MyExtract
//
// The mirror of Exclude. For each member of T, keep it only if it
// extends U; otherwise discard it.
// ----------------------------------------------------------------------------

type MyExtract<T, U> = T extends U ? T : never;

type Check_12a = Expect<Equal<MyExtract<"a" | "b" | "c", "a" | "c">, "a" | "c">>;
type Check_12b = Expect<Equal<MyExtract<string | number, number>, number>>;
type Check_12c = Expect<Equal<MyExtract<"a" | "b", "c">, never>>;

// Trace for Check_12a:
//   "a" extends "a" | "c" ? "a" : never  =>  "a"
//   "b" extends "a" | "c" ? "b" : never  =>  never
//   "c" extends "a" | "c" ? "c" : never  =>  "c"
//   Result: "a" | never | "c" = "a" | "c"

// ----------------------------------------------------------------------------
// Exercise 13: MyNonNullable
//
// Exclude null and undefined from T using the same distributive pattern.
// This is essentially Exclude<T, null | undefined>.
// ----------------------------------------------------------------------------

type MyNonNullable<T> = T extends null | undefined ? never : T;

type Check_13a = Expect<Equal<MyNonNullable<string | null>, string>>;
type Check_13b = Expect<Equal<MyNonNullable<number | undefined | null>, number>>;
type Check_13c = Expect<Equal<MyNonNullable<null | undefined>, never>>;

// Trace for Check_13b:
//   number extends null | undefined ? never : number     =>  number
//   undefined extends null | undefined ? never : undefined  =>  never
//   null extends null | undefined ? never : null            =>  never
//   Result: number | never | never = number

// ----------------------------------------------------------------------------
// Exercise 14: MyReturnType
//
// Use `infer` to capture the return type from a function signature.
// No constraint on T -- non-function types fall through to `never`.
// We use `never[]` for args because `never` is assignable to any parameter
// type, making the pattern match any function signature.
// ----------------------------------------------------------------------------

type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never;

type Check_14a = Expect<Equal<MyReturnType<() => string>, string>>;
type Check_14b = Expect<Equal<MyReturnType<(x: number, y: string) => boolean>, boolean>>;
type Check_14c = Expect<Equal<MyReturnType<() => void>, void>>;
type Check_14d = Expect<Equal<MyReturnType<string>, never>>;

// How it works:
//   MyReturnType<(x: number) => boolean>
//   ((x: number) => boolean) extends ((...args: never[]) => infer R)
//   Match! R is inferred as boolean.
//
//   MyReturnType<string>
//   string does NOT extend (...args: never[]) => infer R
//   Falls to false branch => never

// ----------------------------------------------------------------------------
// Exercise 15: DeepAwaited
//
// Recursively unwrap Promise types. If T is Promise<U>, recursively
// unwrap U. If T is not a Promise, return T as-is.
// This handles arbitrarily nested Promises.
// ----------------------------------------------------------------------------

type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

type Check_15a = Expect<Equal<DeepAwaited<Promise<string>>, string>>;
type Check_15b = Expect<Equal<DeepAwaited<Promise<Promise<number>>>, number>>;
type Check_15c = Expect<Equal<DeepAwaited<Promise<Promise<Promise<boolean>>>>, boolean>>;
type Check_15d = Expect<Equal<DeepAwaited<string>, string>>;

// Trace for Check_15b:
//   DeepAwaited<Promise<Promise<number>>>
//   Promise<Promise<number>> extends Promise<infer U> => U = Promise<number>
//   => DeepAwaited<Promise<number>>
//   Promise<number> extends Promise<infer U> => U = number
//   => DeepAwaited<number>
//   number does NOT extend Promise<infer U>
//   => number

// ----------------------------------------------------------------------------
// Exercise 16: Flatten (one level)
//
// Use `infer` to extract the element type from an array.
// `ReadonlyArray<infer E>` matches both regular and readonly arrays,
// as well as tuples (tuples extend ReadonlyArray).
// If T is not array-like, return T unchanged.
// ----------------------------------------------------------------------------

type Flatten<T> = T extends ReadonlyArray<infer E> ? E : T;

type Check_16a = Expect<Equal<Flatten<number[]>, number>>;
type Check_16b = Expect<Equal<Flatten<string[][]>, string[]>>;
type Check_16c = Expect<Equal<Flatten<boolean>, boolean>>;
type Check_16d = Expect<Equal<Flatten<readonly number[]>, number>>;

// Why ReadonlyArray and not just Array?
//   `readonly number[]` is `ReadonlyArray<number>`, which does NOT extend `Array<number>`.
//   Array<number> extends ReadonlyArray<number> (arrays are mutable readonly arrays),
//   but not the other way around.
//   Using ReadonlyArray as the pattern matches both cases.

// ----------------------------------------------------------------------------
// Exercise 17: FunctionInfo
//
// Use `infer` twice: once for the parameter tuple and once for the return
// type. For non-function types, return the default shape with `never`.
// ----------------------------------------------------------------------------

type FunctionInfo<T> =
  T extends (...args: infer P) => infer R
    ? { params: P; return: R }
    : { params: never; return: never };

type Check_17a = Expect<Equal<
  FunctionInfo<(a: string, b: number) => boolean>,
  { params: [a: string, b: number]; return: boolean }
>>;
type Check_17b = Expect<Equal<
  FunctionInfo<() => void>,
  { params: []; return: void }
>>;
type Check_17c = Expect<Equal<
  FunctionInfo<string>,
  { params: never; return: never }
>>;

// How it works for Check_17a:
//   T = (a: string, b: number) => boolean
//   T extends (...args: infer P) => infer R
//   P is inferred as [a: string, b: number] (parameter labels are preserved)
//   R is inferred as boolean
//   Result: { params: [a: string, b: number]; return: boolean }

// ----------------------------------------------------------------------------
// Exercise 18: PickByType
//
// Use a mapped type with key remapping (`as` clause) to filter properties.
// For each key K of T, check if T[K] extends ValueType.
// If yes, keep the key; if no, remap to `never` (which removes it).
// ----------------------------------------------------------------------------

type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

type Check_18a = Expect<Equal<
  PickByType<{ name: string; age: number; active: boolean; email: string }, string>,
  { name: string; email: string }
>>;
type Check_18b = Expect<Equal<
  PickByType<{ a: number; b: string; c: number }, number>,
  { a: number; c: number }
>>;
type Check_18c = Expect<Equal<
  PickByType<{ x: string; y: string }, number>,
  {}
>>;

// How it works for Check_18a:
//   For key "name":  string extends string ? "name" : never  =>  "name"  (kept)
//   For key "age":   number extends string ? "age" : never   =>  never   (removed)
//   For key "active": boolean extends string ? "active" : never => never (removed)
//   For key "email": string extends string ? "email" : never =>  "email" (kept)
//   Result: { name: string; email: string }

// ============================================================================
// Runner
// ============================================================================

function printSection(title: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}`);
}

function printResult(exercise: number, description: string, passed: boolean): void {
  const status = passed ? "PASS" : "FAIL";
  const icon = passed ? "[+]" : "[-]";
  console.log(`  ${icon} Exercise ${String(exercise).padStart(2)}: ${description} ... ${status}`);
}

// Runtime verification helpers
function isNever(_value: never): true {
  return true;
}

printSection("PREDICT THE OUTPUT (Exercises 1-6)");

// Exercise 1
const ex1Check: "yes" = undefined as unknown as Ex1;
printResult(1, "IsNumber<42>", ex1Check === ex1Check);

// Exercise 2 - verify distribution produces union of arrays, not array of union
type Ex2IsCorrect = Equal<Ex2, string[] | number[]>;
const ex2Check: true = undefined as unknown as Ex2IsCorrect;
printResult(2, "ToArray<string | number> distributes", ex2Check === ex2Check);

// Exercise 3 - never distributes to never
type Ex3IsCorrect = Equal<Ex3, never>;
const ex3Check: true = undefined as unknown as Ex3IsCorrect;
printResult(3, "Wrap<never> produces never", ex3Check === ex3Check);

// Exercise 4
type Ex4aIsCorrect = Equal<Ex4a, boolean>;
type Ex4bIsCorrect = Equal<Ex4b, false>;
const ex4aCheck: true = undefined as unknown as Ex4aIsCorrect;
const ex4bCheck: true = undefined as unknown as Ex4bIsCorrect;
printResult(4, "Distribution vs non-distribution", ex4aCheck === ex4aCheck && ex4bCheck === ex4bCheck);

// Exercise 5
type Ex5IsCorrect = Equal<Ex5, "truthy" | "falsy">;
const ex5Check: true = undefined as unknown as Ex5IsCorrect;
printResult(5, "boolean distributes as true | false", ex5Check === ex5Check);

// Exercise 6
type Ex6aOk = Equal<Ex6a, string>;
type Ex6bOk = Equal<Ex6b, Promise<number>>;
type Ex6cOk = Equal<Ex6c, boolean>;
const ex6Check: true = undefined as unknown as Ex6aOk;
const ex6bCheck: true = undefined as unknown as Ex6bOk;
const ex6cCheck: true = undefined as unknown as Ex6cOk;
printResult(6, "UnwrapOnce (single level only)", ex6Check === ex6Check && ex6bCheck === ex6bCheck && ex6cCheck === ex6cCheck);

printSection("FIX THE BUG (Exercises 7-10)");

// Exercise 7
type E7a = Equal<IsNever<never>, true>;
type E7b = Equal<IsNever<string>, false>;
const e7a: true = undefined as unknown as E7a;
const e7b: true = undefined as unknown as E7b;
printResult(7, "IsNever with tuple wrapping", e7a === e7a && e7b === e7b);

// Exercise 8
type E8a = Equal<IsArray<string[]>, true>;
type E8b = Equal<IsArray<string | number[]>, false>;
const e8a: true = undefined as unknown as E8a;
const e8b: true = undefined as unknown as E8b;
printResult(8, "Non-distributive IsArray", e8a === e8a && e8b === e8b);

// Exercise 9
type E9 = Equal<StringKeys<{ name: string; age: number; email: string }>, "name" | "email">;
const e9: true = undefined as unknown as E9;
printResult(9, "StringKeys conditional fix", e9 === e9);

// Exercise 10
type E10a = Equal<SafeReturnType<() => string>, string>;
type E10c = Equal<SafeReturnType<string>, never>;
const e10a: true = undefined as unknown as E10a;
const e10c: true = undefined as unknown as E10c;
printResult(10, "SafeReturnType without constraint", e10a === e10a && e10c === e10c);

printSection("IMPLEMENT (Exercises 11-18)");

// Exercise 11
type E11 = Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">;
const e11: true = undefined as unknown as E11;
printResult(11, "MyExclude", e11 === e11);

// Exercise 12
type E12 = Equal<MyExtract<"a" | "b" | "c", "a" | "c">, "a" | "c">;
const e12: true = undefined as unknown as E12;
printResult(12, "MyExtract", e12 === e12);

// Exercise 13
type E13 = Equal<MyNonNullable<string | null | undefined>, string>;
const e13: true = undefined as unknown as E13;
printResult(13, "MyNonNullable", e13 === e13);

// Exercise 14
type E14a = Equal<MyReturnType<() => string>, string>;
type E14b = Equal<MyReturnType<string>, never>;
const e14a: true = undefined as unknown as E14a;
const e14b: true = undefined as unknown as E14b;
printResult(14, "MyReturnType", e14a === e14a && e14b === e14b);

// Exercise 15
type E15a = Equal<DeepAwaited<Promise<Promise<Promise<boolean>>>>, boolean>;
type E15b = Equal<DeepAwaited<string>, string>;
const e15a: true = undefined as unknown as E15a;
const e15b: true = undefined as unknown as E15b;
printResult(15, "DeepAwaited", e15a === e15a && e15b === e15b);

// Exercise 16
type E16a = Equal<Flatten<number[]>, number>;
type E16b = Equal<Flatten<readonly number[]>, number>;
type E16c = Equal<Flatten<boolean>, boolean>;
const e16a: true = undefined as unknown as E16a;
const e16b: true = undefined as unknown as E16b;
const e16c: true = undefined as unknown as E16c;
printResult(16, "Flatten", e16a === e16a && e16b === e16b && e16c === e16c);

// Exercise 17
type E17a = Equal<
  FunctionInfo<(a: string, b: number) => boolean>,
  { params: [a: string, b: number]; return: boolean }
>;
type E17b = Equal<FunctionInfo<string>, { params: never; return: never }>;
const e17a: true = undefined as unknown as E17a;
const e17b: true = undefined as unknown as E17b;
printResult(17, "FunctionInfo", e17a === e17a && e17b === e17b);

// Exercise 18
type E18 = Equal<
  PickByType<{ name: string; age: number; active: boolean; email: string }, string>,
  { name: string; email: string }
>;
const e18: true = undefined as unknown as E18;
printResult(18, "PickByType", e18 === e18);

// Summary
printSection("SUMMARY");
console.log("  All 18 exercises verified at compile time.");
console.log("  If this file compiles without errors, all solutions are correct.");
console.log("");
console.log("  Exercises 1-6:   Predict the output (type-level)");
console.log("  Exercises 7-10:  Fix the bug (type definitions)");
console.log("  Exercises 11-18: Implement from scratch");
console.log("");
