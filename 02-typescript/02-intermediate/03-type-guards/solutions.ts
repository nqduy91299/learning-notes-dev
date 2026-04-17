// ============================================================================
// 03-type-guards: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/03-type-guards/solutions.ts
// ============================================================================

console.log("=== Exercise 1: typeof narrowing ===");

function describeType(value: string | number | boolean): string {
  if (typeof value === "string") return `string:${value.length}`;
  if (typeof value === "number") return `number:${value.toFixed(1)}`;
  return `boolean:${value}`;
}

console.log(describeType("hello"));   // "string:5"
console.log(describeType(3.14159));   // "number:3.1"
console.log(describeType(true));      // "boolean:true"

// Explanation: typeof narrows the union in each branch.
// "hello".length is 5; (3.14159).toFixed(1) is "3.1"; true becomes "true".

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 2: truthiness narrowing ===");

function showValue(val: string | null | undefined): string {
  if (val) return `got: ${val}`;
  return "nothing";
}

console.log(showValue("hi"));        // "got: hi"
console.log(showValue(""));          // "nothing"  (empty string is falsy!)
console.log(showValue(null));         // "nothing"
console.log(showValue(undefined));    // "nothing"

// Explanation: The truthiness check removes null/undefined but ALSO
// filters out "" (empty string) since it's falsy.

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 3: equality narrowing ===");

function compare(x: string | number, y: string | boolean): string {
  if (x === y) {
    return x.toUpperCase();
  }
  return "not equal";
}

console.log(compare("hello", "hello")); // "HELLO"
console.log(compare("hello", true));     // "not equal"
console.log(compare(42, "42"));          // "not equal" (strict equality, different types)

// Explanation: === requires same type and value. Only the first call has
// both operands as "hello". 42 === "42" is false (number vs string).

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 4: in operator ===");

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

console.log(moveAnimal(duck));   // "swimming"  (duck has swim, so first branch)
console.log(moveAnimal(eagle));  // "soaring"

// Explanation: "swim" in duck is true, so it calls swim().
// eagle doesn't have swim, so it falls to the else branch.

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 5: instanceof narrowing ===");

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

console.log(describeError(new ApiError(404, "Not Found")));
// "API[404]: Not Found"
console.log(describeError(new NetworkError("https://example.com")));
// "Network: https://example.com"

// Explanation: instanceof checks the prototype chain and narrows accordingly.

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 6: discriminated union ===");

type Result6 =
  | { status: "ok"; value: number }
  | { status: "err"; message: string };

function showResult(r: Result6): string {
  switch (r.status) {
    case "ok":
      return `Value: ${r.value}`;
    case "err":
      return `Error: ${r.message}`;
  }
}

console.log(showResult({ status: "ok", value: 42 }));       // "Value: 42"
console.log(showResult({ status: "err", message: "fail" })); // "Error: fail"

// Explanation: The discriminant "status" narrows to the correct variant.

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 7: Fix — typeof null ===");

// Bug: typeof null === "object", so null falls into the object branch
// and Object.keys(null) crashes.
// Fix: Check for null before checking typeof === "object".

function classifyValue(value: string | number | object | null): string {
  if (value === null) return "null";
  if (typeof value === "object") {
    return `keys:${Object.keys(value).length}`;
  }
  if (typeof value === "string") return "string";
  return "number";
}

console.log(classifyValue({ a: 1, b: 2 }));  // "keys:2"
console.log(classifyValue(null));              // "null"
console.log(classifyValue("hi"));             // "string"
console.log(classifyValue(42));               // "number"

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 8: Fix — lying type predicate ===");

// Bug: The predicate body checked typeof === "string" but claimed `value is number`.
// Fix: Check typeof === "number".

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function doubleIt(value: unknown): number {
  if (isNumber(value)) {
    return value * 2;
  }
  return 0;
}

console.log(doubleIt(21));    // 42
console.log(doubleIt("hi"));  // 0

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 9: Fix — assertion function doesn't throw ===");

// Bug: The assertion logged but didn't throw on failure.
// Fix: Throw an error when the condition is not met.

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Not a string!");
  }
}

function shout(value: unknown): string {
  assertString(value);
  return value.toUpperCase();
}

console.log(shout("hello")); // "HELLO"
try {
  shout(42);
} catch (e) {
  console.log((e as Error).message); // "Not a string!"
}

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 10: Fix — missing exhaustive check ===");

// Bug: "triangle" case was missing. The function returned 0 as fallback.
// Fix: Add triangle case and exhaustive never check.

type Shape10 =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function area10(shape: Shape10): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
  }
}

console.log(area10({ kind: "circle", radius: 5 }).toFixed(2));   // "78.54"
console.log(area10({ kind: "rectangle", width: 4, height: 6 })); // 24
console.log(area10({ kind: "triangle", base: 10, height: 5 }));  // 25

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 11: formatUnknown ===");

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value.toUpperCase();
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return "unknown";
}

// Explanation: Chain typeof guards from most specific to catch-all.

console.log(formatUnknown("hello"));   // "HELLO"
console.log(formatUnknown(3.14159));   // "3.14"
console.log(formatUnknown(true));      // "yes"
console.log(formatUnknown(false));     // "no"
console.log(formatUnknown(null));      // "unknown"

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 12: isNotNullish + cleanArray ===");

function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}

// Explanation: `value != null` is true when value is neither null nor undefined
// (loose equality). The generic predicate preserves the element type T.

function cleanArray<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter(isNotNullish);
}

console.log(cleanArray([1, null, 2, undefined, 3]));  // [1, 2, 3]
console.log(cleanArray(["a", null, "b"]));             // ["a", "b"]
console.log(cleanArray([null, undefined]));             // []

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 13: in operator guard ===");

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
  if ("make" in vehicle) {
    return `Car: ${vehicle.make} ${vehicle.model}`;
  }
  return `Boat: ${vehicle.name}`;
}

// Explanation: "make" only exists on Car, so `in` narrows to Car.
// The else branch is automatically Boat.

console.log(describeVehicle({ make: "Toyota", model: "Camry", drive: () => "driving" }));
// "Car: Toyota Camry"
console.log(describeVehicle({ name: "Sea Breeze", sail: () => "sailing" }));
// "Boat: Sea Breeze"

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 14: isValidEmail branded type ===");

type Email = string & { __brand: "Email" };

function isValidEmail(value: string): value is Email {
  const atIndex = value.indexOf("@");
  return atIndex > 0 && value.indexOf(".", atIndex) > atIndex;
}

// Explanation: We check that "@" exists (not at position 0) and that
// there's a "." somewhere after the "@". The predicate narrows string
// to the branded Email type.

function sendEmail(to: Email, subject: string): string {
  return `Sending "${subject}" to ${to}`;
}

const addr = "user@example.com";
if (isValidEmail(addr)) {
  console.log(sendEmail(addr, "Hello"));
  // "Sending "Hello" to user@example.com"
}

const bad = "not-an-email";
if (isValidEmail(bad)) {
  console.log("should not reach");
} else {
  console.log(`"${bad}" is not a valid email`);
}

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 15: assertDefined ===");

interface User15 {
  name: string;
  age: number;
}

function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(msg ?? "Value is null or undefined");
  }
}

// Explanation: The assertion throws on null/undefined. After the call,
// TypeScript narrows the type to T (removes null | undefined).

function processUser(user: User15 | null): string {
  assertDefined(user, "User is required");
  return `${user.name} (${user.age})`;
}

console.log(processUser({ name: "Alice", age: 30 })); // "Alice (30)"
try {
  processUser(null);
} catch (e) {
  console.log((e as Error).message); // "User is required"
}

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 16: discriminated union handler ===");

type AppEvent =
  | { type: "login"; userId: string }
  | { type: "logout"; userId: string; reason: string }
  | { type: "purchase"; itemId: string; amount: number }
  | { type: "error"; code: number; message: string };

function handleEvent(event: AppEvent): string {
  switch (event.type) {
    case "login":
      return `User ${event.userId} logged in`;
    case "logout":
      return `User ${event.userId} logged out: ${event.reason}`;
    case "purchase":
      return `Purchase: ${event.itemId} for $${event.amount}`;
    case "error":
      return `Error ${event.code}: ${event.message}`;
    default: {
      const _exhaustive: never = event;
      throw new Error(`Unhandled event: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

// Explanation: Each case narrows to the specific event variant.
// The default branch assigns to never for exhaustive checking.

console.log(handleEvent({ type: "login", userId: "u1" }));
// "User u1 logged in"
console.log(handleEvent({ type: "logout", userId: "u1", reason: "timeout" }));
// "User u1 logged out: timeout"
console.log(handleEvent({ type: "purchase", itemId: "item1", amount: 29.99 }));
// "Purchase: item1 for $29.99"
console.log(handleEvent({ type: "error", code: 500, message: "Server error" }));
// "Error 500: Server error"

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 17: Array.isArray + filter ===");

function normalizeStrings(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.filter((s) => s.length > 0);
  }
  return [input];
}

// Explanation: Array.isArray narrows to string[]. Then we filter out
// empty strings with a simple length check.

console.log(normalizeStrings("hello"));             // ["hello"]
console.log(normalizeStrings(["a", "", "b", ""]));  // ["a", "b"]
console.log(normalizeStrings([]));                   // []

// ----------------------------------------------------------------------------
console.log("\n=== Exercise 18: safeJsonParse + isPoint ===");

interface Point {
  x: number;
  y: number;
}

function safeJsonParse<T>(json: string, guard: (value: unknown) => value is T): T | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Explanation: We parse as unknown, then use the provided type guard to
// validate. If parsing fails or the guard returns false, we return null.

function isPoint(value: unknown): value is Point {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Point).x === "number" &&
    typeof (value as Point).y === "number"
  );
}

// Explanation: Multi-step narrowing — check object, non-null, then
// verify both x and y are numbers.

console.log(safeJsonParse('{"x": 1, "y": 2}', isPoint));      // { x: 1, y: 2 }
console.log(safeJsonParse('{"x": 1}', isPoint));               // null
console.log(safeJsonParse('not json', isPoint));                // null
console.log(safeJsonParse('{"x": "a", "y": 2}', isPoint));    // null

// ============================================================================
console.log("\n=== All solutions complete ===");
