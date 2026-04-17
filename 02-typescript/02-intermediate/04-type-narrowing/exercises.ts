// ============================================================================
// 04-type-narrowing: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/04-type-narrowing/exercises.ts
//
// 18 exercises: ~6 predict-output, ~4 fix-the-bug, ~8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Predict the Output — typeof narrowing
// ----------------------------------------------------------------------------
// What does this function return for each call?
// predict("hello")  → ?
// predict(42)       → ?
// predict(true)     → ?

function predict(value: string | number | boolean): string {
  if (typeof value === "string") {
    return `string:${value.length}`;
  } else if (typeof value === "number") {
    return `number:${value.toFixed(1)}`;
  } else {
    return `boolean:${value}`;
  }
}

// console.log(predict("hello"));
// console.log(predict(42));
// console.log(predict(true));

// ----------------------------------------------------------------------------
// Exercise 2: Predict the Output — truthiness narrowing
// ----------------------------------------------------------------------------
// What does this function return for each call?
// truthyCheck("")     → ?
// truthyCheck(null)   → ?
// truthyCheck("hi")   → ?
// truthyCheck(0)      → ?

function truthyCheck(value: string | number | null): string {
  if (value) {
    return `truthy:${value}`;
  }
  return `falsy`;
}

// console.log(truthyCheck(""));
// console.log(truthyCheck(null));
// console.log(truthyCheck("hi"));
// console.log(truthyCheck(0));

// ----------------------------------------------------------------------------
// Exercise 3: Predict the Output — equality narrowing
// ----------------------------------------------------------------------------
// What does this function return?

function equalityNarrow(a: string | number, b: string | boolean): string {
  if (a === b) {
    return a.toUpperCase();
  }
  return "no match";
}

// console.log(equalityNarrow("hello", "hello"));
// console.log(equalityNarrow(42, true));
// console.log(equalityNarrow("hi", false));

// ----------------------------------------------------------------------------
// Exercise 4: Predict the Output — discriminated union
// ----------------------------------------------------------------------------

type Notification =
  | { type: "email"; subject: string }
  | { type: "sms"; phoneNumber: string }
  | { type: "push"; title: string };

function describeNotification(n: Notification): string {
  switch (n.type) {
    case "email":
      return `Email: ${n.subject}`;
    case "sms":
      return `SMS to ${n.phoneNumber}`;
    case "push":
      return `Push: ${n.title}`;
  }
}

// console.log(describeNotification({ type: "email", subject: "Hello" }));
// console.log(describeNotification({ type: "sms", phoneNumber: "+1234" }));
// console.log(describeNotification({ type: "push", title: "Update" }));

// ----------------------------------------------------------------------------
// Exercise 5: Predict the Output — assignment narrowing
// ----------------------------------------------------------------------------

function assignmentNarrow(): string[] {
  const results: string[] = [];
  let value: string | number;

  value = "hello";
  results.push(typeof value);

  value = 100;
  results.push(typeof value);

  value = "world";
  results.push(typeof value);

  return results;
}

// console.log(assignmentNarrow());

// ----------------------------------------------------------------------------
// Exercise 6: Predict the Output — instanceof narrowing
// ----------------------------------------------------------------------------

class Dog {
  bark() {
    return "Woof!";
  }
}

class Cat {
  meow() {
    return "Meow!";
  }
}

function whatSound(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    return animal.bark();
  }
  return animal.meow();
}

// console.log(whatSound(new Dog()));
// console.log(whatSound(new Cat()));

// ----------------------------------------------------------------------------
// Exercise 7: Fix the Bug — null check with typeof
// ----------------------------------------------------------------------------
// This function should return the length of a string or -1 for null.
// But it has a bug. Fix it without using type assertions.

function stringLength(value: string | null): number {
  if (typeof value === "object") {
    // BUG: typeof null === "object"!
    return -1;
  }
  return value.length;
}

// console.log(stringLength("hello")); // expected: 5
// console.log(stringLength(null));    // expected: -1

// ----------------------------------------------------------------------------
// Exercise 8: Fix the Bug — truthiness and empty string
// ----------------------------------------------------------------------------
// This function should return the trimmed name, or "Anonymous" ONLY for
// null/undefined. Empty string "" should be returned as-is.
// Fix the bug.

function formatName(name: string | null | undefined): string {
  if (name) {
    return name.trim();
  }
  return "Anonymous";
}

// console.log(formatName("  Alice  ")); // expected: "Alice"
// console.log(formatName(null));        // expected: "Anonymous"
// console.log(formatName(undefined));   // expected: "Anonymous"
// console.log(formatName(""));          // expected: "" (BUG: currently returns "Anonymous")

// ----------------------------------------------------------------------------
// Exercise 9: Fix the Bug — narrowing in closure
// ----------------------------------------------------------------------------
// This function creates processors for each item. The narrowing is lost
// inside the closure. Fix it.

function createProcessors(items: (string | number)[]): (() => string)[] {
  const processors: (() => string)[] = [];

  for (let item of items) {
    if (typeof item === "string") {
      processors.push(() => `string:${(item as string).toUpperCase()}`);
    } else {
      processors.push(() => `number:${(item as number).toFixed(2)}`);
    }
  }

  return processors;
}

// const procs = createProcessors(["hello", 42, "world"]);
// console.log(procs.map(p => p()));
// expected: ["string:HELLO", "number:42.00", "string:WORLD"]

// ----------------------------------------------------------------------------
// Exercise 10: Fix the Bug — incomplete exhaustive check
// ----------------------------------------------------------------------------
// A new "webhook" type was added but the handler wasn't updated.
// Fix the handler to cover all cases and keep the exhaustive check.

type AlertChannel =
  | { kind: "email"; address: string }
  | { kind: "slack"; channel: string }
  | { kind: "webhook"; url: string };

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function routeAlert(channel: AlertChannel): string {
  switch (channel.kind) {
    case "email":
      return `Sending to ${channel.address}`;
    case "slack":
      return `Posting to #${channel.channel}`;
    // @ts-expect-error — FIX: add the missing case for "webhook"
    default:
      return assertNever(channel);
  }
}

// console.log(routeAlert({ kind: "email", address: "a@b.com" }));
// console.log(routeAlert({ kind: "slack", channel: "alerts" }));
// console.log(routeAlert({ kind: "webhook", url: "https://example.com" }));

// ----------------------------------------------------------------------------
// Exercise 11: Implement — type predicate function
// ----------------------------------------------------------------------------
// Implement `isString` as a user-defined type guard.

function isString(value: unknown): value is string {
  // TODO: implement
  return false;
}

// console.log(isString("hello")); // true
// console.log(isString(42));      // false

// ----------------------------------------------------------------------------
// Exercise 12: Implement — filter nulls with type predicate
// ----------------------------------------------------------------------------
// Implement `filterNulls` that removes null and undefined from an array.
// The return type should be T[] (no nulls).

function filterNulls<T>(arr: (T | null | undefined)[]): T[] {
  // TODO: implement using .filter() with a type predicate callback
  return [] as T[];
}

// console.log(filterNulls([1, null, 2, undefined, 3])); // [1, 2, 3]
// console.log(filterNulls(["a", null, "b"]));           // ["a", "b"]

// ----------------------------------------------------------------------------
// Exercise 13: Implement — discriminated union area calculator
// ----------------------------------------------------------------------------
// Implement `calculateArea` for all shape types. Use an exhaustive check.

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function calculateArea(shape: Shape): number {
  // TODO: implement with switch + exhaustive check
  return 0;
}

// console.log(calculateArea({ kind: "circle", radius: 5 }));           // ~78.54
// console.log(calculateArea({ kind: "rectangle", width: 4, height: 6 })); // 24
// console.log(calculateArea({ kind: "triangle", base: 10, height: 3 }));  // 15

// ----------------------------------------------------------------------------
// Exercise 14: Implement — assertion function
// ----------------------------------------------------------------------------
// Implement `assertDefined` that throws if the value is null or undefined.

function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  // TODO: implement
}

// const val: string | null = "hello";
// assertDefined(val, "val must be defined");
// console.log(val.toUpperCase()); // "HELLO" — TS knows val is string after assertion

// ----------------------------------------------------------------------------
// Exercise 15: Implement — in-operator narrowing
// ----------------------------------------------------------------------------
// Given a union of API response types, implement a handler using `in` narrowing.

interface SuccessResponse {
  data: string[];
  total: number;
}

interface ErrorResponse {
  error: string;
  code: number;
}

interface LoadingResponse {
  progress: number;
}

type ApiResponse = SuccessResponse | ErrorResponse | LoadingResponse;

function handleResponse(response: ApiResponse): string {
  // TODO: use `in` operator to narrow and return:
  //   SuccessResponse → "Data: <total> items"
  //   ErrorResponse   → "Error <code>: <error>"
  //   LoadingResponse → "Loading: <progress>%"
  return "";
}

// console.log(handleResponse({ data: ["a", "b"], total: 2 }));
// console.log(handleResponse({ error: "Not found", code: 404 }));
// console.log(handleResponse({ progress: 75 }));

// ----------------------------------------------------------------------------
// Exercise 16: Implement — type-safe event handler
// ----------------------------------------------------------------------------
// Implement a type-safe event handler using discriminated unions.

type AppEvent =
  | { type: "LOGIN"; username: string; timestamp: number }
  | { type: "LOGOUT"; username: string; timestamp: number }
  | { type: "PURCHASE"; item: string; amount: number; timestamp: number }
  | { type: "ERROR"; message: string; severity: "low" | "medium" | "high" };

function processEvent(event: AppEvent): string {
  // TODO: handle all event types. Return a descriptive string for each.
  // LOGIN    → "User <username> logged in"
  // LOGOUT   → "User <username> logged out"
  // PURCHASE → "Purchase: <item> for $<amount>"
  // ERROR    → "[<SEVERITY>] <message>"
  return "";
}

// console.log(processEvent({ type: "LOGIN", username: "alice", timestamp: 1 }));
// console.log(processEvent({ type: "PURCHASE", item: "Book", amount: 29.99, timestamp: 2 }));
// console.log(processEvent({ type: "ERROR", message: "Disk full", severity: "high" }));

// ----------------------------------------------------------------------------
// Exercise 17: Implement — smart type guard for objects
// ----------------------------------------------------------------------------
// Implement `hasProperty` that checks if an object has a given property
// and narrows the type accordingly.

function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  // TODO: implement
  return false;
}

// const obj: object = { name: "Alice", age: 30 };
// if (hasProperty(obj, "name")) {
//   console.log(obj.name); // TS knows obj has `name`
// }

// ----------------------------------------------------------------------------
// Exercise 18: Implement — parse and narrow unknown data
// ----------------------------------------------------------------------------
// Implement `parseUser` that takes `unknown` input and either returns
// a validated User object or null. Use narrowing — no type assertions.

interface User {
  name: string;
  age: number;
  email: string;
}

function parseUser(input: unknown): User | null {
  // TODO: validate that input is an object with the right shape
  // Use typeof, in, and other narrowing techniques — no `as`!
  return null;
}

// console.log(parseUser({ name: "Alice", age: 30, email: "a@b.com" }));
// console.log(parseUser({ name: "Bob" }));
// console.log(parseUser("not an object"));
// console.log(parseUser(null));

// ============================================================================
// End of exercises
// ============================================================================
export {};
