// ============================================================================
// 03-type-guards: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/03-type-guards/exercises.ts
//
// 18 exercises: ~6 predict-output, ~4 fix-the-bug, ~8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Predict Output — typeof narrowing
// What does this print?
// ----------------------------------------------------------------------------

function describeType(value: string | number | boolean): string {
  if (typeof value === "string") return `string:${value.length}`;
  if (typeof value === "number") return `number:${value.toFixed(1)}`;
  return `boolean:${value}`;
}

// console.log(describeType("hello"));
// console.log(describeType(3.14159));
// console.log(describeType(true));

// Your prediction:
//   Line 1: ???
//   Line 2: ???
//   Line 3: ???

// ----------------------------------------------------------------------------
// Exercise 2: Predict Output — truthiness narrowing
// What does this print?
// ----------------------------------------------------------------------------

function showValue(val: string | null | undefined): string {
  if (val) return `got: ${val}`;
  return "nothing";
}

// console.log(showValue("hi"));
// console.log(showValue(""));
// console.log(showValue(null));
// console.log(showValue(undefined));

// Your prediction:
//   Line 1: ???
//   Line 2: ???
//   Line 3: ???
//   Line 4: ???

// ----------------------------------------------------------------------------
// Exercise 3: Predict Output — equality narrowing
// What does this print?
// ----------------------------------------------------------------------------

function compare(x: string | number, y: string | boolean): string {
  if (x === y) {
    return x.toUpperCase();
  }
  return "not equal";
}

// console.log(compare("hello", "hello"));
// console.log(compare("hello", true));
// console.log(compare(42, "42"));

// Your prediction:
//   Line 1: ???
//   Line 2: ???
//   Line 3: ???

// ----------------------------------------------------------------------------
// Exercise 4: Predict Output — in operator
// What does this print?
// ----------------------------------------------------------------------------

interface Swimmer {
  swim(): string;
}

interface Flyer {
  fly(): string;
}

function moveAnimal(animal: Swimmer | Flyer): string {
  if ("swim" in animal) {
    return animal.swim();
  }
  return animal.fly();
}

const duck: Swimmer & Flyer = {
  swim: () => "swimming",
  fly: () => "flying",
};

const eagle: Flyer = {
  fly: () => "soaring",
};

// console.log(moveAnimal(duck));
// console.log(moveAnimal(eagle));

// Your prediction:
//   Line 1: ???
//   Line 2: ???

// ----------------------------------------------------------------------------
// Exercise 5: Predict Output — instanceof narrowing
// What does this print?
// ----------------------------------------------------------------------------

class ApiError {
  constructor(public code: number, public message: string) {}
}

class NetworkError {
  constructor(public url: string) {}
}

function describeError(err: ApiError | NetworkError): string {
  if (err instanceof ApiError) {
    return `API[${err.code}]: ${err.message}`;
  }
  return `Network: ${err.url}`;
}

// console.log(describeError(new ApiError(404, "Not Found")));
// console.log(describeError(new NetworkError("https://example.com")));

// Your prediction:
//   Line 1: ???
//   Line 2: ???

// ----------------------------------------------------------------------------
// Exercise 6: Predict Output — discriminated union
// What does this print?
// ----------------------------------------------------------------------------

type Result =
  | { status: "ok"; value: number }
  | { status: "err"; message: string };

function showResult(r: Result): string {
  switch (r.status) {
    case "ok":
      return `Value: ${r.value}`;
    case "err":
      return `Error: ${r.message}`;
  }
}

// console.log(showResult({ status: "ok", value: 42 }));
// console.log(showResult({ status: "err", message: "fail" }));

// Your prediction:
//   Line 1: ???
//   Line 2: ???

// ----------------------------------------------------------------------------
// Exercise 7: Fix the Bug — typeof null
// The function should return the number of keys for objects,
// "null" for null, or the typeof for primitives.
// Currently crashes on null input.
// ----------------------------------------------------------------------------

function classifyValue(value: string | number | object | null): string {
  if (typeof value === "object") {
    return `keys:${Object.keys(value!).length}`;
  }
  if (typeof value === "string") return "string";
  return "number";
}

// console.log(classifyValue({ a: 1, b: 2 }));  // should print: keys:2
// console.log(classifyValue(null));              // should print: null
// console.log(classifyValue("hi"));             // should print: string
// console.log(classifyValue(42));               // should print: number

// ----------------------------------------------------------------------------
// Exercise 8: Fix the Bug — lying type predicate
// The predicate claims to check for numbers but actually checks for strings.
// Fix the predicate body.
// ----------------------------------------------------------------------------

function isNumber(value: unknown): value is number {
  return typeof value === "string";
}

function doubleIt(value: unknown): number {
  if (isNumber(value)) {
    return value * 2;
  }
  return 0;
}

// console.log(doubleIt(21));   // should print: 42
// console.log(doubleIt("hi")); // should print: 0

// ----------------------------------------------------------------------------
// Exercise 9: Fix the Bug — assertion function doesn't throw
// The assertion should throw when the value is not a string,
// but it just logs and returns.
// ----------------------------------------------------------------------------

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    console.log("Not a string!");
  }
}

function shout(value: unknown): string {
  assertString(value);
  return value.toUpperCase();
}

// console.log(shout("hello")); // should print: HELLO
// console.log(shout(42));      // should throw an error

// ----------------------------------------------------------------------------
// Exercise 10: Fix the Bug — missing exhaustive check
// A new shape "triangle" was added but the function doesn't handle it.
// Add the missing case AND an exhaustive never check.
// ----------------------------------------------------------------------------

type Shape10 =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area10(shape: Shape10): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
  return 0; // Remove this and handle all cases properly
}

// console.log(area10({ kind: "circle", radius: 5 }).toFixed(2));        // 78.54
// console.log(area10({ kind: "rectangle", width: 4, height: 6 }));      // 24
// console.log(area10({ kind: "triangle", base: 10, height: 5 }));       // 25

// ----------------------------------------------------------------------------
// Exercise 11: Implement — typeof guard function
// Write a function that takes unknown and returns a formatted string.
// "string" → uppercase, "number" → toFixed(2), "boolean" → "yes"/"no",
// anything else → "unknown"
// ----------------------------------------------------------------------------

function formatUnknown(value: unknown): string {
  // TODO: implement using typeof guards
  return "";
}

// console.log(formatUnknown("hello"));    // HELLO
// console.log(formatUnknown(3.14159));    // 3.14
// console.log(formatUnknown(true));       // yes
// console.log(formatUnknown(false));      // no
// console.log(formatUnknown(null));       // unknown

// ----------------------------------------------------------------------------
// Exercise 12: Implement — isNotNullish type predicate
// Write a generic type predicate that filters out null and undefined.
// Then use it to filter an array.
// ----------------------------------------------------------------------------

// TODO: implement isNotNullish

function cleanArray<T>(arr: (T | null | undefined)[]): T[] {
  // TODO: use isNotNullish with .filter()
  return [];
}

// console.log(cleanArray([1, null, 2, undefined, 3]));     // [1, 2, 3]
// console.log(cleanArray(["a", null, "b"]));               // ["a", "b"]
// console.log(cleanArray([null, undefined]));               // []

// ----------------------------------------------------------------------------
// Exercise 13: Implement — in operator guard
// Given a union of two interfaces, write a function that returns a description.
// Use the `in` operator to narrow.
// ----------------------------------------------------------------------------

interface Car {
  make: string;
  model: string;
  drive(): string;
}

interface Boat {
  name: string;
  sail(): string;
}

function describeVehicle(vehicle: Car | Boat): string {
  // TODO: use "in" to narrow and return appropriate description
  // Car → "Car: {make} {model}"
  // Boat → "Boat: {name}"
  return "";
}

// console.log(describeVehicle({ make: "Toyota", model: "Camry", drive: () => "driving" }));
// // "Car: Toyota Camry"
// console.log(describeVehicle({ name: "Sea Breeze", sail: () => "sailing" }));
// // "Boat: Sea Breeze"

// ----------------------------------------------------------------------------
// Exercise 14: Implement — custom type predicate for validation
// Write an isValidEmail type predicate that narrows a string to a branded type.
// ----------------------------------------------------------------------------

type Email = string & { __brand: "Email" };

function isValidEmail(value: string): value is Email {
  // TODO: check that value contains "@" and "." after the "@"
  return false;
}

function sendEmail(to: Email, subject: string): string {
  return `Sending "${subject}" to ${to}`;
}

// const addr = "user@example.com";
// if (isValidEmail(addr)) {
//   console.log(sendEmail(addr, "Hello"));
//   // "Sending "Hello" to user@example.com"
// }

// ----------------------------------------------------------------------------
// Exercise 15: Implement — assertion function
// Write an assertDefined assertion function that throws if the value
// is null or undefined. Use it in processUser.
// ----------------------------------------------------------------------------

interface User15 {
  name: string;
  age: number;
}

function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  // TODO: throw if value is null or undefined
}

function processUser(user: User15 | null): string {
  assertDefined(user, "User is required");
  return `${user.name} (${user.age})`;
}

// console.log(processUser({ name: "Alice", age: 30 })); // "Alice (30)"
// try {
//   processUser(null);
// } catch (e) {
//   console.log((e as Error).message); // "User is required"
// }

// ----------------------------------------------------------------------------
// Exercise 16: Implement — discriminated union handler
// Given the event union below, write a handler that returns a description
// for each event type. Include an exhaustive never check.
// ----------------------------------------------------------------------------

type AppEvent =
  | { type: "login"; userId: string }
  | { type: "logout"; userId: string; reason: string }
  | { type: "purchase"; itemId: string; amount: number }
  | { type: "error"; code: number; message: string };

function handleEvent(event: AppEvent): string {
  // TODO: handle all event types, return a description string
  // login    → "User {userId} logged in"
  // logout   → "User {userId} logged out: {reason}"
  // purchase → "Purchase: {itemId} for ${amount}"
  // error    → "Error {code}: {message}"
  // Add exhaustive never check in default
  return "";
}

// console.log(handleEvent({ type: "login", userId: "u1" }));
// console.log(handleEvent({ type: "logout", userId: "u1", reason: "timeout" }));
// console.log(handleEvent({ type: "purchase", itemId: "item1", amount: 29.99 }));
// console.log(handleEvent({ type: "error", code: 500, message: "Server error" }));

// ----------------------------------------------------------------------------
// Exercise 17: Implement — Array.isArray guard + filter
// Write a function that normalizes input: if it's a string, wrap in array;
// if it's an array, filter out empty strings.
// ----------------------------------------------------------------------------

function normalizeStrings(input: string | string[]): string[] {
  // TODO: use Array.isArray and .filter
  return [];
}

// console.log(normalizeStrings("hello"));              // ["hello"]
// console.log(normalizeStrings(["a", "", "b", ""]));   // ["a", "b"]
// console.log(normalizeStrings([]));                    // []

// ----------------------------------------------------------------------------
// Exercise 18: Implement — safe JSON parse with type guard
// Write a generic safeJsonParse function that takes a JSON string and a
// type guard, returning the parsed value or null.
// Then write an isPoint guard for { x: number, y: number }.
// ----------------------------------------------------------------------------

interface Point {
  x: number;
  y: number;
}

function safeJsonParse<T>(json: string, guard: (value: unknown) => value is T): T | null {
  // TODO: try JSON.parse, validate with guard, return T or null
  return null;
}

function isPoint(value: unknown): value is Point {
  // TODO: validate that value is an object with numeric x and y
  return false;
}

// console.log(safeJsonParse('{"x": 1, "y": 2}', isPoint));        // { x: 1, y: 2 }
// console.log(safeJsonParse('{"x": 1}', isPoint));                 // null
// console.log(safeJsonParse('not json', isPoint));                  // null
// console.log(safeJsonParse('{"x": "a", "y": 2}', isPoint));      // null
