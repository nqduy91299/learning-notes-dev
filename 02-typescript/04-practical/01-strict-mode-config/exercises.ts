// ============================================================================
// Strict Mode Config - Exercises
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
//
// Each exercise targets a specific strict-mode flag or config concept.
// All test code is commented out. Uncomment to verify your solutions.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: strictNullChecks — Nullable parameter
// ----------------------------------------------------------------------------
// Write a function `getLength` that accepts a `string | null` parameter
// and returns the string's length, or 0 if null.

// export function getLength(value: string | null): number {
//   // TODO: implement
// }

// console.log(getLength("hello")); // 5
// console.log(getLength(null));    // 0

// ----------------------------------------------------------------------------
// Exercise 2: strictNullChecks — Optional chaining
// ----------------------------------------------------------------------------
// Given the types below, write `getUserCity` that safely accesses
// the user's city, returning "Unknown" if any part of the chain is missing.

interface Address {
  city: string;
  zip: string;
}

interface UserProfile {
  name: string;
  address?: Address;
}

// export function getUserCity(user: UserProfile | null): string {
//   // TODO: implement
// }

// console.log(getUserCity({ name: "Alice", address: { city: "NYC", zip: "10001" } })); // "NYC"
// console.log(getUserCity({ name: "Bob" }));  // "Unknown"
// console.log(getUserCity(null));             // "Unknown"

// ----------------------------------------------------------------------------
// Exercise 3: noImplicitAny — Typed parameters
// ----------------------------------------------------------------------------
// The function below would error under noImplicitAny because parameters
// have no type annotations. Add proper types so it compiles under strict mode.
// The function should sum all numbers in an array.

// export function sumAll(numbers) {
//   let total = 0;
//   for (const n of numbers) {
//     total += n;
//   }
//   return total;
// }

// console.log(sumAll([1, 2, 3, 4])); // 10

// ----------------------------------------------------------------------------
// Exercise 4: strictPropertyInitialization — Class properties
// ----------------------------------------------------------------------------
// Fix this class so it compiles under strict mode. All properties must be
// properly initialized. `email` should be optional.

// class Employee {
//   id: number;
//   name: string;
//   email: string;
//   department: string;
//
//   constructor(id: number, name: string, department: string) {
//     this.id = id;
//     this.name = name;
//     this.department = department;
//   }
// }

// ----------------------------------------------------------------------------
// Exercise 5: useUnknownInCatchVariables — Safe error handling
// ----------------------------------------------------------------------------
// Write a function `safeParseJson` that parses a JSON string and returns
// the result. If parsing fails, return an object { error: string } with
// the error message. Handle the `unknown` catch variable properly.

// export function safeParseJson(input: string): unknown {
//   // TODO: implement
// }

// console.log(safeParseJson('{"a":1}'));   // { a: 1 }
// console.log(safeParseJson('invalid'));   // { error: "..." }

// ----------------------------------------------------------------------------
// Exercise 6: strictFunctionTypes — Callback types
// ----------------------------------------------------------------------------
// The type `StringProcessor` expects a callback that handles strings.
// Write a function `processItems` that accepts an array of strings and
// a StringProcessor callback, applying it to each item and returning results.
// The key constraint: the callback must accept exactly `string`, not a wider type.

type StringProcessor = (input: string) => string;

// export function processItems(items: string[], processor: StringProcessor): string[] {
//   // TODO: implement
// }

// const upper: StringProcessor = (s: string) => s.toUpperCase();
// console.log(processItems(["hello", "world"], upper)); // ["HELLO", "WORLD"]

// ----------------------------------------------------------------------------
// Exercise 7: strictBindCallApply — Typed bind
// ----------------------------------------------------------------------------
// Given the function below, use `.bind()` to create a new function `double`
// that always multiplies by 2. The result should be properly typed.

function multiply(a: number, b: number): number {
  return a * b;
}

// export const double = // TODO: use multiply.bind(...)

// console.log(double(5));  // 10
// console.log(double(12)); // 24

// ----------------------------------------------------------------------------
// Exercise 8: noImplicitThis — Explicit this parameter
// ----------------------------------------------------------------------------
// Write a function `createCounter` that returns an object with `count`,
// `increment`, and `getCount` methods. Use arrow functions or explicit
// `this` typing to avoid implicit `this` errors.

// export function createCounter(initial: number) {
//   // TODO: implement — return { count, increment, getCount }
// }

// const counter = createCounter(0);
// counter.increment();
// counter.increment();
// console.log(counter.getCount()); // 2

// ----------------------------------------------------------------------------
// Exercise 9: noUncheckedIndexedAccess — Safe array access
// ----------------------------------------------------------------------------
// Write a function `firstElement` that returns the first element of an array
// or a default value if the array is empty. Handle the case where the index
// access returns `T | undefined`.

// export function firstElement<T>(arr: T[], defaultValue: T): T {
//   // TODO: implement
// }

// console.log(firstElement([10, 20, 30], 0));   // 10
// console.log(firstElement([], 0));              // 0
// console.log(firstElement(["a", "b"], "x"));   // "a"

// ----------------------------------------------------------------------------
// Exercise 10: noImplicitReturns — All paths return
// ----------------------------------------------------------------------------
// Write a function `describeScore` that takes a number 0-100 and returns
// a string grade. All code paths must return a value.
// 90+ => "Excellent", 70+ => "Good", 50+ => "Average", below 50 => "Needs Improvement"

// export function describeScore(score: number): string {
//   // TODO: implement
// }

// console.log(describeScore(95));  // "Excellent"
// console.log(describeScore(75));  // "Good"
// console.log(describeScore(55));  // "Average"
// console.log(describeScore(30));  // "Needs Improvement"

// ----------------------------------------------------------------------------
// Exercise 11: noFallthroughCasesInSwitch — Proper switch
// ----------------------------------------------------------------------------
// Write a function `httpStatusText` using a switch statement that returns
// a description for HTTP status codes. No fall-through allowed.
// 200 => "OK", 201 => "Created", 400 => "Bad Request",
// 404 => "Not Found", 500 => "Internal Server Error", default => "Unknown"

// export function httpStatusText(code: number): string {
//   // TODO: implement with switch
// }

// console.log(httpStatusText(200)); // "OK"
// console.log(httpStatusText(404)); // "Not Found"
// console.log(httpStatusText(999)); // "Unknown"

// ----------------------------------------------------------------------------
// Exercise 12: noImplicitOverride — Override keyword
// ----------------------------------------------------------------------------
// Fix the derived class so it compiles under noImplicitOverride.
// The `speak` method overrides the base class method.

// class Animal {
//   speak(): string {
//     return "...";
//   }
//   move(): string {
//     return "moving";
//   }
// }

// class Dog extends Animal {
//   speak(): string {
//     return "Woof!";
//   }
// }

// ----------------------------------------------------------------------------
// Exercise 13: exactOptionalPropertyTypes — Missing vs undefined
// ----------------------------------------------------------------------------
// Given the interface below, create two valid objects:
// one where `nickname` is absent, and one where it has a string value.
// Under exactOptionalPropertyTypes, you CANNOT set nickname to undefined.

interface Profile {
  name: string;
  nickname?: string;
}

// export const profileWithoutNickname: Profile = // TODO
// export const profileWithNickname: Profile = // TODO

// console.log(profileWithoutNickname); // { name: "Alice" }
// console.log(profileWithNickname);    // { name: "Bob", nickname: "Bobby" }

// ----------------------------------------------------------------------------
// Exercise 14: Strict mode — Type-safe Map wrapper
// ----------------------------------------------------------------------------
// Implement a `TypedMap` class that wraps a `Map<string, T>` and provides
// a `get` method that returns `T | undefined` (strict null checks),
// a `getOrDefault` method that returns `T` (must handle undefined),
// and a `set` method. All properties must be initialized.

// export class TypedMap<T> {
//   // TODO: implement
//   // - private map property (initialized)
//   // - get(key: string): T | undefined
//   // - getOrDefault(key: string, defaultValue: T): T
//   // - set(key: string, value: T): void
// }

// const m = new TypedMap<number>();
// m.set("a", 1);
// console.log(m.get("a"));              // 1
// console.log(m.get("b"));              // undefined
// console.log(m.getOrDefault("b", 0));  // 0

// ----------------------------------------------------------------------------
// Exercise 15: Migration — Convert loose function to strict
// ----------------------------------------------------------------------------
// The following function is written in a loose style. Rewrite it so it
// compiles under full strict mode: proper types, null handling, no implicit
// any, all paths return, and safe catch variables.
//
// Original loose version:
// function fetchData(url, options) {
//   try {
//     if (!url) {
//       return;
//     }
//     const result = { url, data: options?.body, timestamp: Date.now() };
//     if (options?.transform) {
//       return options.transform(result);
//     }
//     return result;
//   } catch (err) {
//     console.error(err.message);
//     return null;
//   }
// }

interface FetchOptions {
  body?: string;
  transform?: (data: FetchResult) => FetchResult;
}

interface FetchResult {
  url: string;
  data: string | undefined;
  timestamp: number;
}

// export function fetchData(url: string | null, options?: FetchOptions): FetchResult | null {
//   // TODO: implement strict version
// }

// console.log(fetchData("https://example.com"));
// console.log(fetchData(null));
// console.log(fetchData("https://example.com", { body: "hello" }));

// ============================================================================
// End of exercises
// ============================================================================

export {};

console.log("exercises.ts loaded successfully (all tests commented out)");
