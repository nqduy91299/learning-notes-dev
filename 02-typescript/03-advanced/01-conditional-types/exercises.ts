/**
 * Conditional Types - Exercises
 *
 * 18 exercises covering:
 *   - 6 predict-the-output (exercises 1-6)
 *   - 4 fix-the-bug (exercises 7-10)
 *   - 8 implement (exercises 11-18)
 *
 * Configuration: ES2022, strict mode, ESNext modules
 * Run with: npx tsx exercises.ts
 *
 * Rules:
 *   - No `any` type allowed
 *   - All test code is commented out
 *   - Must compile cleanly with strict mode
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
// PREDICT THE OUTPUT - Exercises 1-6
//
// For each exercise, determine what the resulting type will be.
// Write your answer as a type alias `Answer_N`, then uncomment the check.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Basic Conditional Type
//
// What is the result of this conditional type?
// ----------------------------------------------------------------------------

type IsNumber<T> = T extends number ? "yes" : "no";

type Ex1 = IsNumber<42>;

// TODO: Replace `unknown` with your predicted type
type Answer_1 = unknown;

// Uncomment to check:
// type Check_1 = Expect<Equal<Ex1, Answer_1>>;

// ----------------------------------------------------------------------------
// Exercise 2: Distribution over Unions
//
// What happens when a union type is passed to a distributive conditional?
// ----------------------------------------------------------------------------

type ToArray<T> = T extends unknown ? T[] : never;

type Ex2 = ToArray<string | number>;

// TODO: Replace `unknown` with your predicted type
type Answer_2 = unknown;

// Uncomment to check:
// type Check_2 = Expect<Equal<Ex2, Answer_2>>;

// ----------------------------------------------------------------------------
// Exercise 3: never and Distribution
//
// What happens when `never` is passed to a distributive conditional type?
// ----------------------------------------------------------------------------

type Wrap<T> = T extends unknown ? { value: T } : never;

type Ex3 = Wrap<never>;

// TODO: Replace `unknown` with your predicted type
type Answer_3 = unknown;

// Uncomment to check:
// type Check_3 = Expect<Equal<Ex3, Answer_3>>;

// ----------------------------------------------------------------------------
// Exercise 4: Preventing Distribution with Tuple Wrapping
//
// What is the result when distribution is prevented?
// ----------------------------------------------------------------------------

type IsStringDist<T> = T extends string ? true : false;
type IsStringNoDist<T> = [T] extends [string] ? true : false;

type Ex4a = IsStringDist<string | number>;
type Ex4b = IsStringNoDist<string | number>;

// TODO: Replace `unknown` with your predicted types
type Answer_4a = unknown;
type Answer_4b = unknown;

// Uncomment to check:
// type Check_4a = Expect<Equal<Ex4a, Answer_4a>>;
// type Check_4b = Expect<Equal<Ex4b, Answer_4b>>;

// ----------------------------------------------------------------------------
// Exercise 5: boolean Distribution
//
// Remember: boolean = true | false. What happens with distribution?
// ----------------------------------------------------------------------------

type CheckTrue<T> = T extends true ? "truthy" : "falsy";

type Ex5 = CheckTrue<boolean>;

// TODO: Replace `unknown` with your predicted type
type Answer_5 = unknown;

// Uncomment to check:
// type Check_5 = Expect<Equal<Ex5, Answer_5>>;

// ----------------------------------------------------------------------------
// Exercise 6: Nested Conditional with infer
//
// What type does this resolve to?
// ----------------------------------------------------------------------------

type UnwrapOnce<T> = T extends Promise<infer U> ? U : T;

type Ex6a = UnwrapOnce<Promise<string>>;
type Ex6b = UnwrapOnce<Promise<Promise<number>>>;
type Ex6c = UnwrapOnce<boolean>;

// TODO: Replace `unknown` with your predicted types
type Answer_6a = unknown;
type Answer_6b = unknown;
type Answer_6c = unknown;

// Uncomment to check:
// type Check_6a = Expect<Equal<Ex6a, Answer_6a>>;
// type Check_6b = Expect<Equal<Ex6b, Answer_6b>>;
// type Check_6c = Expect<Equal<Ex6c, Answer_6c>>;

// ============================================================================
// FIX THE BUG - Exercises 7-10
//
// Each exercise has a type that doesn't work as intended.
// Fix the type definition so the checks pass.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 7: IsNever
//
// This type should return `true` when T is `never`, and `false` otherwise.
// Currently it doesn't work for `never`.
// ----------------------------------------------------------------------------

type IsNever<T> = T extends never ? true : false;

// Uncomment to check:
// type Check_7a = Expect<Equal<IsNever<never>, true>>;
// type Check_7b = Expect<Equal<IsNever<string>, false>>;
// type Check_7c = Expect<Equal<IsNever<undefined>, false>>;

// ----------------------------------------------------------------------------
// Exercise 8: NonDistributive IsArray
//
// This type should check if the ENTIRE type T is an array type.
// For union inputs like `string | number[]`, it should return false
// (since the whole union is not an array), but currently it distributes.
// ----------------------------------------------------------------------------

type IsArray<T> = T extends unknown[] ? true : false;

// Uncomment to check:
// type Check_8a = Expect<Equal<IsArray<string[]>, true>>;
// type Check_8b = Expect<Equal<IsArray<string | number[]>, false>>;
// type Check_8c = Expect<Equal<IsArray<number>, false>>;

// ----------------------------------------------------------------------------
// Exercise 9: Extract String Keys
//
// This type should extract only the keys of T whose values are strings.
// The current implementation has a bug in the conditional logic.
// ----------------------------------------------------------------------------

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? never : K;
}[keyof T];

// Uncomment to check:
// type Check_9a = Expect<Equal<StringKeys<{ name: string; age: number; email: string }>, "name" | "email">>;
// type Check_9b = Expect<Equal<StringKeys<{ count: number }>, never>>;

// ----------------------------------------------------------------------------
// Exercise 10: Safe Return Type
//
// This type should extract the return type of a function.
// For non-function types, it should return `never`.
// Currently it has a constraint error.
// ----------------------------------------------------------------------------

type SafeReturnType<T extends (...args: never[]) => unknown> =
  T extends (...args: never[]) => infer R ? R : never;

// Uncomment to check (the third one currently causes a compile error):
// type Check_10a = Expect<Equal<SafeReturnType<() => string>, string>>;
// type Check_10b = Expect<Equal<SafeReturnType<(x: number) => boolean>, boolean>>;
// type Check_10c = Expect<Equal<SafeReturnType<string>, never>>;

// ============================================================================
// IMPLEMENT - Exercises 11-18
//
// Implement each type alias to make the checks pass.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 11: MyExclude
//
// Implement Exclude<T, U> from scratch.
// It should remove from T all members assignable to U.
// ----------------------------------------------------------------------------

type MyExclude<T, U> = unknown; // TODO: implement

// Uncomment to check:
// type Check_11a = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
// type Check_11b = Expect<Equal<MyExclude<string | number | boolean, string>, number | boolean>>;
// type Check_11c = Expect<Equal<MyExclude<"a" | "b", "a" | "b">, never>>;

// ----------------------------------------------------------------------------
// Exercise 12: MyExtract
//
// Implement Extract<T, U> from scratch.
// It should keep only the members of T that are assignable to U.
// ----------------------------------------------------------------------------

type MyExtract<T, U> = unknown; // TODO: implement

// Uncomment to check:
// type Check_12a = Expect<Equal<MyExtract<"a" | "b" | "c", "a" | "c">, "a" | "c">>;
// type Check_12b = Expect<Equal<MyExtract<string | number, number>, number>>;
// type Check_12c = Expect<Equal<MyExtract<"a" | "b", "c">, never>>;

// ----------------------------------------------------------------------------
// Exercise 13: MyNonNullable
//
// Implement NonNullable<T> from scratch.
// It should remove null and undefined from T.
// ----------------------------------------------------------------------------

type MyNonNullable<T> = unknown; // TODO: implement

// Uncomment to check:
// type Check_13a = Expect<Equal<MyNonNullable<string | null>, string>>;
// type Check_13b = Expect<Equal<MyNonNullable<number | undefined | null>, number>>;
// type Check_13c = Expect<Equal<MyNonNullable<null | undefined>, never>>;

// ----------------------------------------------------------------------------
// Exercise 14: MyReturnType
//
// Implement ReturnType<T> from scratch.
// It should extract the return type of a function type.
// For non-function types, return never.
// ----------------------------------------------------------------------------

type MyReturnType<T> = unknown; // TODO: implement

// Uncomment to check:
// type Check_14a = Expect<Equal<MyReturnType<() => string>, string>>;
// type Check_14b = Expect<Equal<MyReturnType<(x: number, y: string) => boolean>, boolean>>;
// type Check_14c = Expect<Equal<MyReturnType<() => void>, void>>;
// type Check_14d = Expect<Equal<MyReturnType<string>, never>>;

// ----------------------------------------------------------------------------
// Exercise 15: DeepAwaited
//
// Implement a type that recursively unwraps Promise types.
// Promise<Promise<Promise<string>>> should resolve to string.
// Non-promise types should be returned as-is.
// ----------------------------------------------------------------------------

type DeepAwaited<T> = unknown; // TODO: implement

// Uncomment to check:
// type Check_15a = Expect<Equal<DeepAwaited<Promise<string>>, string>>;
// type Check_15b = Expect<Equal<DeepAwaited<Promise<Promise<number>>>, number>>;
// type Check_15c = Expect<Equal<DeepAwaited<Promise<Promise<Promise<boolean>>>>, boolean>>;
// type Check_15d = Expect<Equal<DeepAwaited<string>, string>>;

// ----------------------------------------------------------------------------
// Exercise 16: Flatten (one level)
//
// Implement a type that extracts the element type from an array.
// If T is not an array, return T unchanged.
// Should work with readonly arrays and tuples.
// ----------------------------------------------------------------------------

type Flatten<T> = unknown; // TODO: implement

// Uncomment to check:
// type Check_16a = Expect<Equal<Flatten<number[]>, number>>;
// type Check_16b = Expect<Equal<Flatten<string[][]>, string[]>>;
// type Check_16c = Expect<Equal<Flatten<boolean>, boolean>>;
// type Check_16d = Expect<Equal<Flatten<readonly number[]>, number>>;

// ----------------------------------------------------------------------------
// Exercise 17: FunctionInfo
//
// Implement a type that extracts both the parameter types and return type
// of a function into an object type.
// For non-functions, return { params: never; return: never }.
// ----------------------------------------------------------------------------

type FunctionInfo<T> = unknown; // TODO: implement

// Uncomment to check:
// type Check_17a = Expect<Equal<
//   FunctionInfo<(a: string, b: number) => boolean>,
//   { params: [a: string, b: number]; return: boolean }
// >>;
// type Check_17b = Expect<Equal<
//   FunctionInfo<() => void>,
//   { params: []; return: void }
// >>;
// type Check_17c = Expect<Equal<
//   FunctionInfo<string>,
//   { params: never; return: never }
// >>;

// ----------------------------------------------------------------------------
// Exercise 18: PickByType
//
// Implement a type that picks only the properties of T
// whose values are assignable to ValueType.
// ----------------------------------------------------------------------------

type PickByType<T, ValueType> = unknown; // TODO: implement

// Uncomment to check:
// type Check_18a = Expect<Equal<
//   PickByType<{ name: string; age: number; active: boolean; email: string }, string>,
//   { name: string; email: string }
// >>;
// type Check_18b = Expect<Equal<
//   PickByType<{ a: number; b: string; c: number }, number>,
//   { a: number; c: number }
// >>;
// type Check_18c = Expect<Equal<
//   PickByType<{ x: string; y: string }, number>,
//   {}
// >>;

// ============================================================================
// Main
// ============================================================================

console.log("=== Conditional Types - Exercises ===");
console.log("");
console.log("Instructions:");
console.log("  1. For exercises 1-6:  Predict the output type and replace `unknown`");
console.log("  2. For exercises 7-10: Fix the buggy type definition");
console.log("  3. For exercises 11-18: Implement the type from scratch");
console.log("  4. Uncomment the `Check_*` lines to verify your answers");
console.log("");
console.log("If this file compiles cleanly with all checks uncommented,");
console.log("all exercises are solved correctly!");
console.log("");
console.log("Run with: npx tsx exercises.ts");
