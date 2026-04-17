// ============================================================================
// 05-union-intersection: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/05-union-intersection/exercises.ts
//
// 18 exercises — ~6 predict-output, ~4 fix-the-bug, ~8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1 — Predict Output (Union narrowing with typeof)
// ----------------------------------------------------------------------------
// What does this print?

function describe(value: string | number): string {
  if (typeof value === "string") {
    return `String of length ${value.length}`;
  }
  return `Number doubled: ${value * 2}`;
}

// console.log(describe("hello"));
// console.log(describe(7));

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???

// ----------------------------------------------------------------------------
// Exercise 2 — Predict Output (Equality narrowing)
// ----------------------------------------------------------------------------
// What does this print?

function same(a: string | number, b: string | boolean): string {
  if (a === b) {
    return a.toUpperCase();
  }
  return "different";
}

// console.log(same("yes", "yes"));
// console.log(same(42, true));
// console.log(same("no", false));

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???
// Line 3: ???

// ----------------------------------------------------------------------------
// Exercise 3 — Predict Output (Discriminated union switch)
// ----------------------------------------------------------------------------

type Light = { state: "green" } | { state: "yellow" } | { state: "red"; camera: boolean };

function action(light: Light): string {
  switch (light.state) {
    case "green":  return "GO";
    case "yellow": return "SLOW";
    case "red":    return light.camera ? "STOP (camera)" : "STOP";
  }
}

// console.log(action({ state: "green" }));
// console.log(action({ state: "red", camera: true }));
// console.log(action({ state: "red", camera: false }));

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???
// Line 3: ???

// ----------------------------------------------------------------------------
// Exercise 4 — Predict Output (Intersection property merging)
// ----------------------------------------------------------------------------

type WithName = { name: string; greet(): string };
type WithAge = { age: number; greet(): string };

type NameAndAge = WithName & WithAge;

const person: NameAndAge = {
  name: "Alice",
  age: 30,
  greet() { return `${this.name}, age ${this.age}`; },
};

// console.log(person.greet());
// console.log("name" in person && "age" in person);

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???

// ----------------------------------------------------------------------------
// Exercise 5 — Predict Output (Union of arrays)
// ----------------------------------------------------------------------------

function first(arr: string[] | number[]): string | number {
  return arr[0];
}

// console.log(first(["a", "b", "c"]));
// console.log(first([10, 20, 30]));

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???

// ----------------------------------------------------------------------------
// Exercise 6 — Predict Output (never in intersections)
// ----------------------------------------------------------------------------

type StringAndNumber = string & number;

function impossible(x: StringAndNumber): string {
  return `Got: ${x}`;
}

// This function can never be called with a valid argument.
// console.log("StringAndNumber is:", "never");

// YOUR PREDICTION:
// What is StringAndNumber resolved to? ???

// ----------------------------------------------------------------------------
// Exercise 7 — Fix the Bug (Cannot access property on union)
// ----------------------------------------------------------------------------
// The function should return the area but doesn't compile.

type Circle7 = { kind: "circle"; radius: number };
type Rect7 = { kind: "rect"; width: number; height: number };
type Shape7 = Circle7 | Rect7;

function getArea7(shape: Shape7): number {
  // BUG: accessing shape.radius without narrowing
  // return shape.radius * Math.PI;

  // FIX IT: narrow properly and return the correct area for both shapes
  return 0; // placeholder
}

// console.log(getArea7({ kind: "circle", radius: 5 }));
// console.log(getArea7({ kind: "rect", width: 4, height: 6 }));

// ----------------------------------------------------------------------------
// Exercise 8 — Fix the Bug (Missing exhaustive check)
// ----------------------------------------------------------------------------
// A new shape "triangle" was added but the switch doesn't handle it.
// Add the missing case AND an exhaustive check so future additions cause
// a compile error.

type Triangle8 = { kind: "triangle"; base: number; height: number };
type Shape8 = Circle7 | Rect7 | Triangle8;

function getArea8(shape: Shape8): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    // BUG: missing case "triangle"
    // BUG: no exhaustive check
  }
  return 0; // placeholder — remove when fixed
}

// console.log(getArea8({ kind: "triangle", base: 10, height: 5 }));

// ----------------------------------------------------------------------------
// Exercise 9 — Fix the Bug (Incorrect type guard)
// ----------------------------------------------------------------------------
// The type guard is wrong — it checks for the wrong property.

type Fish9 = { swim(): string };
type Bird9 = { fly(): string };

function isFish(animal: Fish9 | Bird9): animal is Fish9 {
  // BUG: checking for "fly" but claiming it's a Fish
  return "fly" in animal;
}

function move9(animal: Fish9 | Bird9): string {
  if (isFish(animal)) {
    return animal.swim();
  }
  return animal.fly();
}

// console.log(move9({ swim: () => "swimming" }));

// ----------------------------------------------------------------------------
// Exercise 10 — Fix the Bug (Optional vs union undefined)
// ----------------------------------------------------------------------------
// The intent is that `middleName` must always be provided as a key,
// but its value can be undefined. Fix the type so the commented-out
// line causes an error but the others don't.

type Name10 = {
  first: string;
  last: string;
  middleName?: string; // BUG: should be required but allow undefined
};

const validA: Name10 = { first: "A", last: "B", middleName: undefined };
const validB: Name10 = { first: "A", last: "B", middleName: "C" };
// The next line should NOT compile after the fix (missing middleName key):
const invalid10: Name10 = { first: "A", last: "B" };

// ----------------------------------------------------------------------------
// Exercise 11 — Implement (formatInput)
// ----------------------------------------------------------------------------
// Implement a function that accepts string | number | boolean and returns:
//   string  → the string in UPPERCASE
//   number  → the number as a fixed 2-decimal string (e.g. "3.14")
//   boolean → "YES" or "NO"

function formatInput(input: string | number | boolean): string {
  // YOUR CODE HERE
  return ""; // placeholder
}

// console.log(formatInput("hello"));     // "HELLO"
// console.log(formatInput(3.14159));      // "3.14"
// console.log(formatInput(true));         // "YES"
// console.log(formatInput(false));        // "NO"

// ----------------------------------------------------------------------------
// Exercise 12 — Implement (unwrapResult)
// ----------------------------------------------------------------------------
// Given a Result type, implement `unwrapResult` that returns the value
// on success or throws the error message on failure.

type Success<T> = { ok: true; value: T };
type Failure = { ok: false; error: string };
type Result12<T> = Success<T> | Failure;

function unwrapResult<T>(result: Result12<T>): T {
  // YOUR CODE HERE
  return undefined as T; // placeholder
}

// console.log(unwrapResult({ ok: true, value: 42 }));
// try { unwrapResult({ ok: false, error: "boom" }); } catch (e) { console.log(e); }

// ----------------------------------------------------------------------------
// Exercise 13 — Implement (merge two objects using intersection)
// ----------------------------------------------------------------------------
// Implement a generic function that merges two objects into one.
// The return type should be the intersection of both input types.

function merge<A extends object, B extends object>(a: A, b: B): A & B {
  // YOUR CODE HERE
  return {} as A & B; // placeholder
}

// const merged = merge({ name: "Alice" }, { age: 30 });
// console.log(merged.name, merged.age); // "Alice" 30

// ----------------------------------------------------------------------------
// Exercise 14 — Implement (type guard isNonNull)
// ----------------------------------------------------------------------------
// Implement a type guard that removes null and undefined from a type.
// It should work as a filter callback: arr.filter(isNonNull)

function isNonNull<T>(value: T): value is NonNullable<T> {
  // YOUR CODE HERE
  return true; // placeholder
}

// const data: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];
// const clean: string[] = data.filter(isNonNull);
// console.log(clean); // ["a", "b", "c"]

// ----------------------------------------------------------------------------
// Exercise 15 — Implement (discriminated union action handler)
// ----------------------------------------------------------------------------
// Define the Action type and implement the reducer. Each action should have
// a `type` discriminant.
//
// Actions:
//   "INCREMENT"               → count + 1
//   "DECREMENT"               → count - 1
//   "RESET"                   → count = 0
//   "SET" with payload number → count = payload

type State15 = { count: number };

// Define Action type here:
type Action15 = { type: "TODO" }; // placeholder — replace with proper discriminated union

function reducer(state: State15, action: Action15): State15 {
  // YOUR CODE HERE — use switch with exhaustive check
  return state; // placeholder
}

// console.log(reducer({ count: 5 }, { type: "INCREMENT" }));
// console.log(reducer({ count: 5 }, { type: "DECREMENT" }));
// console.log(reducer({ count: 5 }, { type: "RESET" }));
// console.log(reducer({ count: 5 }, { type: "SET", payload: 100 }));

// ----------------------------------------------------------------------------
// Exercise 16 — Implement (branded type for PositiveNumber)
// ----------------------------------------------------------------------------
// Create a branded type `PositiveNumber` that ensures a number is positive.
// Implement a constructor function `toPositive` that validates and brands.
// Implement `addPositive` that only accepts PositiveNumber values.

// Define PositiveNumber branded type here:
type PositiveNumber = number; // placeholder — add brand

function toPositive(n: number): PositiveNumber {
  // YOUR CODE HERE — throw if not positive
  return n as PositiveNumber; // placeholder
}

function addPositive(a: PositiveNumber, b: PositiveNumber): PositiveNumber {
  // YOUR CODE HERE
  return 0 as PositiveNumber; // placeholder
}

// console.log(addPositive(toPositive(3), toPositive(7))); // 10
// try { toPositive(-5); } catch (e) { console.log(e); }

// ----------------------------------------------------------------------------
// Exercise 17 — Implement (API response handler with all states)
// ----------------------------------------------------------------------------
// Implement fetchUser that returns an ApiResponse and renderUser that
// handles all states (loading, success, error) and returns a string.

type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type User = { id: number; name: string; email: string };

function renderUser(response: ApiResponse<User>): string {
  // YOUR CODE HERE — handle all three states, add exhaustive check
  return ""; // placeholder
}

// console.log(renderUser({ status: "loading" }));
// console.log(renderUser({ status: "success", data: { id: 1, name: "Alice", email: "a@b.com" } }));
// console.log(renderUser({ status: "error", error: "Not found" }));

// ----------------------------------------------------------------------------
// Exercise 18 — Implement (flatMap for Result type)
// ----------------------------------------------------------------------------
// Implement `flatMap` for the Result12 type. If the result is ok,
// apply the function. If it's a failure, propagate the error.

function flatMap<T, U>(
  result: Result12<T>,
  fn: (value: T) => Result12<U>,
): Result12<U> {
  // YOUR CODE HERE
  return { ok: false, error: "not implemented" }; // placeholder
}

// const parseNumber = (s: string): Result12<number> => {
//   const n = Number(s);
//   return isNaN(n) ? { ok: false, error: `"${s}" is not a number` } : { ok: true, value: n };
// };
// const double = (n: number): Result12<number> => ({ ok: true, value: n * 2 });
//
// console.log(flatMap(parseNumber("21"), double));          // { ok: true, value: 42 }
// console.log(flatMap(parseNumber("abc"), double));         // { ok: false, error: '"abc" is not a number' }
// console.log(flatMap({ ok: false, error: "prior" }, double)); // { ok: false, error: "prior" }

export {};
