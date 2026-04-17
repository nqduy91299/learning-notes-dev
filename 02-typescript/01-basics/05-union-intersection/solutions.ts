// ============================================================================
// 05-union-intersection: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/05-union-intersection/solutions.ts
// ============================================================================

// ============================================================================
// Helpers
// ============================================================================

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`);
  }
}

function assert(condition: boolean, msg = "Assertion failed") {
  if (!condition) throw new Error(msg);
}

function assertEqual<T>(actual: T, expected: T, label = "") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label} Expected ${e}, got ${a}`);
}

// ============================================================================
// Exercise 1 — Predict Output (Union narrowing with typeof)
// ============================================================================
// Answer:
//   describe("hello") → "String of length 5"
//   describe(7)       → "Number doubled: 14"
//
// Explanation: typeof narrows `value` to string or number in each branch.

function describe(value: string | number): string {
  if (typeof value === "string") {
    return `String of length ${value.length}`;
  }
  return `Number doubled: ${value * 2}`;
}

// ============================================================================
// Exercise 2 — Predict Output (Equality narrowing)
// ============================================================================
// Answer:
//   same("yes", "yes") → "YES"
//   same(42, true)      → "different"
//   same("no", false)   → "different"
//
// Explanation: `a === b` can only be true when both are strings (the only
// overlapping type). 42 !== true and "no" !== false with strict equality.

function same(a: string | number, b: string | boolean): string {
  if (a === b) {
    return a.toUpperCase();
  }
  return "different";
}

// ============================================================================
// Exercise 3 — Predict Output (Discriminated union switch)
// ============================================================================
// Answer:
//   action({ state: "green" })              → "GO"
//   action({ state: "red", camera: true })  → "STOP (camera)"
//   action({ state: "red", camera: false }) → "STOP"

type Light = { state: "green" } | { state: "yellow" } | { state: "red"; camera: boolean };

function action(light: Light): string {
  switch (light.state) {
    case "green":  return "GO";
    case "yellow": return "SLOW";
    case "red":    return light.camera ? "STOP (camera)" : "STOP";
  }
}

// ============================================================================
// Exercise 4 — Predict Output (Intersection property merging)
// ============================================================================
// Answer:
//   person.greet()                       → "Alice, age 30"
//   "name" in person && "age" in person  → true
//
// Explanation: The intersection merges both types. greet() must satisfy
// both signatures (they're identical here). All properties are available.

type WithName = { name: string; greet(): string };
type WithAge = { age: number; greet(): string };
type NameAndAge = WithName & WithAge;

const person: NameAndAge = {
  name: "Alice",
  age: 30,
  greet() { return `${this.name}, age ${this.age}`; },
};

// ============================================================================
// Exercise 5 — Predict Output (Union of arrays)
// ============================================================================
// Answer:
//   first(["a", "b", "c"]) → "a"
//   first([10, 20, 30])    → 10

function first(arr: string[] | number[]): string | number {
  return arr[0];
}

// ============================================================================
// Exercise 6 — Predict Output (never in intersections)
// ============================================================================
// Answer: StringAndNumber resolves to `never`.
// `string & number` has no possible values — no value is both a string
// and a number simultaneously.

type StringAndNumber = string & number; // never

// ============================================================================
// Exercise 7 — Fix the Bug (Cannot access property on union)
// ============================================================================
// Fix: Use the discriminant `kind` to narrow before accessing properties.

type Circle7 = { kind: "circle"; radius: number };
type Rect7 = { kind: "rect"; width: number; height: number };
type Shape7 = Circle7 | Rect7;

function getArea7(shape: Shape7): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}

// ============================================================================
// Exercise 8 — Fix the Bug (Missing exhaustive check)
// ============================================================================
// Fix: Add the triangle case and an assertNever default.

type Triangle8 = { kind: "triangle"; base: number; height: number };
type Shape8 = Circle7 | Rect7 | Triangle8;

function getArea8(shape: Shape8): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
  }
}

// ============================================================================
// Exercise 9 — Fix the Bug (Incorrect type guard)
// ============================================================================
// Fix: Check for "swim" instead of "fly" to correctly identify Fish.

type Fish9 = { swim(): string };
type Bird9 = { fly(): string };

function isFish(animal: Fish9 | Bird9): animal is Fish9 {
  return "swim" in animal; // was "fly" — wrong property
}

function move9(animal: Fish9 | Bird9): string {
  if (isFish(animal)) {
    return animal.swim();
  }
  return animal.fly();
}

// ============================================================================
// Exercise 10 — Fix the Bug (Optional vs union undefined)
// ============================================================================
// Fix: Change `middleName?: string` to `middleName: string | undefined`
// so the key must always be present.

type Name10 = {
  first: string;
  last: string;
  middleName: string | undefined; // required key, value can be undefined
};

const validA: Name10 = { first: "A", last: "B", middleName: undefined };
const validB: Name10 = { first: "A", last: "B", middleName: "C" };
// After the fix, the following would NOT compile:
// const invalid10: Name10 = { first: "A", last: "B" }; // Error: missing middleName

// ============================================================================
// Exercise 11 — Implement (formatInput)
// ============================================================================

function formatInput(input: string | number | boolean): string {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  if (typeof input === "number") {
    return input.toFixed(2);
  }
  // narrowed to boolean
  return input ? "YES" : "NO";
}

// ============================================================================
// Exercise 12 — Implement (unwrapResult)
// ============================================================================

type Success<T> = { ok: true; value: T };
type Failure = { ok: false; error: string };
type Result12<T> = Success<T> | Failure;

function unwrapResult<T>(result: Result12<T>): T {
  if (result.ok) {
    return result.value;
  }
  throw new Error(result.error);
}

// ============================================================================
// Exercise 13 — Implement (merge two objects using intersection)
// ============================================================================

function merge<A extends object, B extends object>(a: A, b: B): A & B {
  return { ...a, ...b } as A & B;
}

// ============================================================================
// Exercise 14 — Implement (type guard isNonNull)
// ============================================================================

function isNonNull<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

// ============================================================================
// Exercise 15 — Implement (discriminated union action handler)
// ============================================================================

type State15 = { count: number };

type Action15 =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" }
  | { type: "SET"; payload: number };

function reducer(state: State15, action: Action15): State15 {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
    case "SET":
      return { count: action.payload };
    default:
      return assertNever(action);
  }
}

// ============================================================================
// Exercise 16 — Implement (branded type for PositiveNumber)
// ============================================================================

type PositiveNumber = number & { readonly __brand: "PositiveNumber" };

function toPositive(n: number): PositiveNumber {
  if (n <= 0) {
    throw new Error(`Expected positive number, got ${n}`);
  }
  return n as PositiveNumber;
}

function addPositive(a: PositiveNumber, b: PositiveNumber): PositiveNumber {
  return (a + b) as PositiveNumber;
}

// ============================================================================
// Exercise 17 — Implement (API response handler with all states)
// ============================================================================

type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type User = { id: number; name: string; email: string };

function renderUser(response: ApiResponse<User>): string {
  switch (response.status) {
    case "loading":
      return "Loading...";
    case "success":
      return `User: ${response.data.name} (${response.data.email})`;
    case "error":
      return `Error: ${response.error}`;
    default:
      return assertNever(response);
  }
}

// ============================================================================
// Exercise 18 — Implement (flatMap for Result type)
// ============================================================================

function flatMap<T, U>(
  result: Result12<T>,
  fn: (value: T) => Result12<U>,
): Result12<U> {
  if (result.ok) {
    return fn(result.value);
  }
  return result; // propagate the error
}

// ============================================================================
// Runner
// ============================================================================

console.log("\n=== Exercise 1: typeof narrowing ===");
test("string input", () => assertEqual(describe("hello"), "String of length 5"));
test("number input", () => assertEqual(describe(7), "Number doubled: 14"));

console.log("\n=== Exercise 2: equality narrowing ===");
test("same strings", () => assertEqual(same("yes", "yes"), "YES"));
test("number vs boolean", () => assertEqual(same(42, true), "different"));
test("string vs boolean", () => assertEqual(same("no", false), "different"));

console.log("\n=== Exercise 3: discriminated union ===");
test("green", () => assertEqual(action({ state: "green" }), "GO"));
test("red with camera", () => assertEqual(action({ state: "red", camera: true }), "STOP (camera)"));
test("red no camera", () => assertEqual(action({ state: "red", camera: false }), "STOP"));

console.log("\n=== Exercise 4: intersection merging ===");
test("greet", () => assertEqual(person.greet(), "Alice, age 30"));
test("has both props", () => assert("name" in person && "age" in person));

console.log("\n=== Exercise 5: union of arrays ===");
test("string array", () => assertEqual(first(["a", "b", "c"]), "a"));
test("number array", () => assertEqual(first([10, 20, 30]), 10));

console.log("\n=== Exercise 6: never intersection ===");
test("string & number = never", () => {
  // We can't test never at runtime, just verify the concept
  const isNever: StringAndNumber extends never ? true : false = true;
  assert(isNever === true);
});

console.log("\n=== Exercise 7: narrowing fix ===");
test("circle area", () => {
  const a = getArea7({ kind: "circle", radius: 5 });
  assertEqual(Math.round(a * 100) / 100, 78.54);
});
test("rect area", () => assertEqual(getArea7({ kind: "rect", width: 4, height: 6 }), 24));

console.log("\n=== Exercise 8: exhaustive check ===");
test("triangle area", () => assertEqual(getArea8({ kind: "triangle", base: 10, height: 5 }), 25));
test("circle still works", () => {
  const a = getArea8({ kind: "circle", radius: 1 });
  assertEqual(Math.round(a * 10000) / 10000, 3.1416);
});

console.log("\n=== Exercise 9: type guard fix ===");
test("fish swims", () => assertEqual(move9({ swim: () => "swimming" }), "swimming"));
test("bird flies", () => assertEqual(move9({ fly: () => "flying" }), "flying"));

console.log("\n=== Exercise 10: optional vs union undefined ===");
test("valid with undefined", () => assert(validA.middleName === undefined));
test("valid with value", () => assertEqual(validB.middleName, "C"));

console.log("\n=== Exercise 11: formatInput ===");
test("string", () => assertEqual(formatInput("hello"), "HELLO"));
test("number", () => assertEqual(formatInput(3.14159), "3.14"));
test("true", () => assertEqual(formatInput(true), "YES"));
test("false", () => assertEqual(formatInput(false), "NO"));

console.log("\n=== Exercise 12: unwrapResult ===");
test("unwrap success", () => assertEqual(unwrapResult({ ok: true, value: 42 }), 42));
test("unwrap failure throws", () => {
  try {
    unwrapResult({ ok: false, error: "boom" });
    assert(false, "should have thrown");
  } catch (e) {
    assert(e instanceof Error && e.message === "boom");
  }
});

console.log("\n=== Exercise 13: merge ===");
test("merge objects", () => {
  const m = merge({ name: "Alice" }, { age: 30 });
  assertEqual(m.name, "Alice");
  assertEqual(m.age, 30);
});

console.log("\n=== Exercise 14: isNonNull ===");
test("filters nullish", () => {
  const data: (string | null | undefined)[] = ["a", null, "b", undefined, "c"];
  const clean: string[] = data.filter(isNonNull);
  assertEqual(clean, ["a", "b", "c"]);
});

console.log("\n=== Exercise 15: reducer ===");
test("increment", () => assertEqual(reducer({ count: 5 }, { type: "INCREMENT" }), { count: 6 }));
test("decrement", () => assertEqual(reducer({ count: 5 }, { type: "DECREMENT" }), { count: 4 }));
test("reset", () => assertEqual(reducer({ count: 5 }, { type: "RESET" }), { count: 0 }));
test("set", () => assertEqual(reducer({ count: 5 }, { type: "SET", payload: 100 }), { count: 100 }));

console.log("\n=== Exercise 16: branded PositiveNumber ===");
test("add positives", () => {
  const sum = addPositive(toPositive(3), toPositive(7));
  assertEqual(sum as number, 10);
});
test("reject negative", () => {
  try {
    toPositive(-5);
    assert(false, "should have thrown");
  } catch (e) {
    assert(e instanceof Error);
  }
});

console.log("\n=== Exercise 17: renderUser ===");
test("loading", () => assertEqual(renderUser({ status: "loading" }), "Loading..."));
test("success", () => {
  const r = renderUser({ status: "success", data: { id: 1, name: "Alice", email: "a@b.com" } });
  assertEqual(r, "User: Alice (a@b.com)");
});
test("error", () => assertEqual(renderUser({ status: "error", error: "Not found" }), "Error: Not found"));

console.log("\n=== Exercise 18: flatMap ===");
test("flatMap success chain", () => {
  const parseNumber = (s: string): Result12<number> => {
    const n = Number(s);
    return isNaN(n) ? { ok: false, error: `"${s}" is not a number` } : { ok: true, value: n };
  };
  const double = (n: number): Result12<number> => ({ ok: true, value: n * 2 });

  assertEqual(flatMap(parseNumber("21"), double), { ok: true, value: 42 });
  assertEqual(flatMap(parseNumber("abc"), double), { ok: false, error: '"abc" is not a number' });
  assertEqual(flatMap({ ok: false, error: "prior" } as Result12<number>, double), { ok: false, error: "prior" });
});

console.log("\n✅ All exercises verified!\n");

export {};
