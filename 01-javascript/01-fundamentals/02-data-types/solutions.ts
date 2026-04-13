// ============================================================================
// 02-data-types: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: typeof operator

function solution1() {
  console.log(typeof 42);              // "number"
  console.log(typeof "hello");         // "string"
  console.log(typeof true);            // "boolean"
  console.log(typeof undefined);       // "undefined"
  console.log(typeof null);            // "object"
  console.log(typeof Symbol("id"));    // "symbol"
  console.log(typeof 10n);             // "bigint"
  console.log(typeof {});              // "object"
  console.log(typeof []);              // "object"
  console.log(typeof function () {});  // "function"
}

// ANSWER:
// 1: "number"     2: "string"   3: "boolean"   4: "undefined"
// 5: "object"     6: "symbol"   7: "bigint"    8: "object"
// 9: "object"     10: "function"
//
// Explanation:
// - typeof null is "object" — a historical bug from JS's first implementation.
// - typeof [] is "object" — arrays are objects in JS. Use Array.isArray() to check.
// - typeof function(){} is "function" — a special case. Functions are objects,
//   but typeof gives them special treatment.
// See README → The typeof Operator

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: NaN behavior

function solution2() {
  console.log(NaN === NaN);            // false
  console.log(typeof NaN);             // "number"
  console.log(NaN + 1);               // NaN
  console.log(NaN ** 0);              // 1
  console.log(isNaN("hello"));        // true
  console.log(Number.isNaN("hello")); // false
}

// ANSWER:
// 1: false   2: "number"   3: NaN   4: 1   5: true   6: false
//
// Explanation:
// - NaN is the only value not equal to itself (NaN === NaN is false).
// - typeof NaN is "number" — NaN belongs to the number type.
// - NaN is sticky — any math with NaN returns NaN. Exception: NaN ** 0 is 1.
// - Global isNaN() coerces its argument to a number first. "hello" → NaN → true.
// - Number.isNaN() does NOT coerce. "hello" is a string, not NaN → false.
// See README → Number → NaN is sticky and self-unequal

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: String conversion with +

function solution3() {
  console.log("5" + 3);       // "53"
  console.log(3 + "5");       // "35"
  console.log("5" - 3);       // 2
  console.log("5" * "2");     // 10
  console.log("hello" - 1);   // NaN
  console.log(1 + 2 + "3");   // "33"
  console.log("3" + 2 + 1);   // "321"
}

// ANSWER:
// 1: "53"   2: "35"   3: 2   4: 10   5: NaN   6: "33"   7: "321"
//
// Explanation:
// - The + operator with a string triggers STRING concatenation (not addition).
// - The -, *, / operators ALWAYS trigger numeric conversion.
// - "hello" can't convert to a number → NaN. NaN - 1 → NaN.
// - 1 + 2 + "3": left-to-right → 3 + "3" → "33" (number first, then string)
// - "3" + 2 + 1: left-to-right → "32" + 1 → "321" (string first, all concat)
// See README → Type Coercion → Common Gotchas → "+ is overloaded"

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Numeric conversion

function solution4() {
  console.log(Number("123"));      // 123
  console.log(Number("  456  "));  // 456
  console.log(Number(""));         // 0
  console.log(Number(" "));        // 0
  console.log(Number("123abc"));   // NaN
  console.log(Number(true));       // 1
  console.log(Number(false));      // 0
  console.log(Number(null));       // 0
  console.log(Number(undefined));  // NaN
}

// ANSWER:
// 1: 123   2: 456   3: 0   4: 0   5: NaN   6: 1   7: 0   8: 0   9: NaN
//
// Explanation:
// - Whitespace is trimmed. Empty/whitespace-only string → 0.
// - "123abc" has non-numeric chars → NaN.
// - true → 1, false → 0.
// - null → 0, but undefined → NaN (important difference!).
// See README → Type Coercion → Numeric conversion table

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Falsy values and Boolean conversion

function solution5() {
  console.log(Boolean(0));         // false
  console.log(Boolean(""));        // false
  console.log(Boolean("0"));       // true
  console.log(Boolean(" "));       // true
  console.log(Boolean(null));      // false
  console.log(Boolean(undefined)); // false
  console.log(Boolean(NaN));       // false
  console.log(Boolean([]));        // true
  console.log(Boolean({}));        // true
  console.log(Boolean("false"));   // true
}

// ANSWER:
// 1: false  2: false  3: true  4: true  5: false
// 6: false  7: false  8: true  9: true  10: true
//
// Explanation:
// The 7 falsy values: false, 0, -0, 0n, "", null, undefined, NaN.
// EVERYTHING else is truthy, including:
//   - "0" (non-empty string!)
//   - " " (non-empty string!)
//   - "false" (non-empty string!)
//   - [] (empty array — it's an object, all objects are truthy)
//   - {} (empty object — same reason)
// See README → Boolean conversion

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: null vs undefined

function solution6() {
  console.log(null == undefined);   // true
  console.log(null === undefined);  // false
  console.log(null == 0);           // false
  console.log(undefined == 0);      // false
  console.log(Number(null));        // 0
  console.log(Number(undefined));   // NaN
  console.log(typeof null);         // "object"
  console.log(typeof undefined);    // "undefined"
}

// ANSWER:
// 1: true   2: false   3: false   4: false
// 5: 0      6: NaN     7: "object"   8: "undefined"
//
// Explanation:
// - null == undefined is true — they are loosely equal to each other and nothing else.
// - null === undefined is false — different types (strict equality).
// - null == 0 and undefined == 0 are both false — null/undefined don't coerce
//   in loose equality except to each other.
// - But Number(null) is 0, Number(undefined) is NaN (explicit conversion differs!).
// - typeof null is "object" (the famous bug).
// See README → null vs undefined table

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Default parameters with null vs undefined

function greet(name = "World") {
  console.log(`Hello, ${name}!`);
}

function solution7() {
  greet();              // "Hello, World!"
  greet(undefined);     // "Hello, World!"
  greet(null);          // "Hello, null!"
  greet("");            // "Hello, !"
  greet(0 as any);      // "Hello, 0!"
}

// ANSWER:
// 1: "Hello, World!"   — no argument → undefined → triggers default
// 2: "Hello, World!"   — undefined explicitly → triggers default
// 3: "Hello, null!"    — null does NOT trigger default!
// 4: "Hello, !"        — empty string does NOT trigger default
// 5: "Hello, 0!"       — 0 does NOT trigger default
//
// Explanation:
// Default parameters only activate when the argument is `undefined` (or missing).
// null, "", 0, false — none of these trigger the default.
// See README → null vs undefined → Default params row

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Loose equality with coercion

function solution8() {
  console.log(0 == false);    // true
  console.log("" == false);   // true
  console.log("0" == false);  // true
  console.log("" == 0);       // true
  console.log([] == false);   // true
  console.log([] == 0);       // true
  console.log("" == []);      // true
}

// ANSWER:
// All true!
//
// Explanation (coercion chains):
// 0 == false       → 0 == 0           → true
// "" == false      → 0 == 0           → true (both coerce to numbers)
// "0" == false     → "0" == 0 → 0 == 0 → true
// "" == 0          → 0 == 0           → true
// [] == false      → "" == false → 0 == 0 → true ([] → "" → 0)
// [] == 0          → "" == 0 → 0 == 0 → true
// "" == []         → "" == "" → true ([] → "")
//
// This is why === is strongly preferred over ==!
// See README → Best Practices → "Use === over =="

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Checking for null

function solution9(value: unknown): boolean {
  return value === null; // FIX: use strict equality, not typeof
}

// Explanation:
// The original used typeof === "object" && !value, which could also match
// other falsy-but-object values in edge cases (and is just unnecessarily complex).
// The correct and simplest check for null is strict equality: value === null.
// See README → typeof null === "object" — the famous bug

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: Safe NaN check

function solution10(value: unknown): boolean {
  return Number.isNaN(value); // FIX: use Number.isNaN instead of global isNaN
}

// Explanation:
// Global isNaN() first coerces the argument to a number:
//   isNaN("hello") → isNaN(NaN) → true (false positive!)
// Number.isNaN() does NOT coerce. It only returns true if the value is
// literally NaN (and is of type number).
// See README → Best Practices → "Use Number.isNaN() over isNaN()"

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Type identification

function solution11(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
  // typeof handles: "number", "string", "boolean", "undefined",
  //                 "symbol", "bigint", "function", "object"
}

// Explanation:
// 1. Check null first — typeof null is "object", which is wrong.
// 2. Check Array.isArray() — typeof [] is "object", which isn't specific enough.
// 3. typeof handles everything else correctly, including "function".
// See README → Type Checking Techniques

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Type coercion table

function solution12(
  value: unknown
): { string: string; number: number; boolean: boolean } {
  return {
    string: String(value),
    number: Number(value),
    boolean: Boolean(value),
  };
}

// Explanation:
// String(), Number(), and Boolean() are the explicit conversion functions.
// They follow the conversion rules from the README:
// - String(null) → "null", String(undefined) → "undefined"
// - Number("") → 0, Number(null) → 0, Number(undefined) → NaN
// - Boolean("") → false, Boolean(0) → false, Boolean(null) → false
// See README → Type Coercion

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Counting falsy values

function solution13(values: unknown[]): number {
  return values.filter((v) => !v).length;
}

// Explanation:
// The ! operator coerces to boolean and negates. Falsy values become true
// after negation, so they pass the filter. We count how many pass.
// Alternatively: values.filter(v => !Boolean(v)).length
// See README → Boolean conversion → Falsy values

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Safe numeric parsing

function solution14(input: string, defaultValue: number): number {
  const trimmed = input.trim();
  const num = Number(trimmed);
  return Number.isNaN(num) ? defaultValue : num;
}

// Explanation:
// 1. Trim whitespace (Number already does this, but trimming makes intent clear)
// 2. Convert with Number() — returns NaN for invalid strings
// 3. Use Number.isNaN() to check — NOT isNaN() (which coerces and gives false positives)
// 4. Note: Number("") is 0, which is a valid number, so it returns 0 not the default.
// See README → Numeric conversion table + Best Practices

// ─── Exercise 15: Predict the Output ────────────────────────────────────────
// Topic: Template literal expressions

function solution15() {
  const name = "Ilya";

  console.log(`hello ${1}`);           // "hello 1"
  console.log(`hello ${"name"}`);      // "hello name"
  console.log(`hello ${name}`);        // "hello Ilya"
  console.log(`result: ${2 + 3}`);     // "result: 5"
  console.log(`${typeof null}`);       // "object"
}

// ANSWER:
// 1: "hello 1"       — the expression 1 is evaluated and embedded
// 2: "hello name"    — "name" is a string literal, not the variable!
// 3: "hello Ilya"    — name is the variable, evaluates to "Ilya"
// 4: "result: 5"     — the expression 2+3 is evaluated first
// 5: "object"        — typeof null is "object"
//
// See README → String → Template literals
// Also from javascript.info tasks: "String quotes"

// ─── Exercise 16: Predict the Output ────────────────────────────────────────
// Topic: String immutability

function solution16() {
  let str = "Hello";
  (str as any)[0] = "h";
  console.log(str);       // "Hello"

  const arr = [1, 2, 3];
  arr[0] = 99;
  console.log(arr);       // [99, 2, 3]
}

// ANSWER:
// Log 1: "Hello"     — strings are immutable, character assignment is ignored
// Log 2: [99, 2, 3]  — arrays are mutable objects, element assignment works
//
// Explanation:
// Strings are primitives and immutable. You cannot change individual characters.
// The assignment silently fails in sloppy mode (would throw in strict mode).
// Arrays are objects and fully mutable.
// See README → String → String immutability

// ─── Exercise 17: Predict the Output ────────────────────────────────────────
// Topic: BigInt and Number interaction

function solution17() {
  console.log(typeof 42n);    // "bigint"
  console.log(42n === 42);    // false
  console.log(42n == 42);     // true
  // 42n + 1 → TypeError: Cannot mix BigInt and other types
}

// ANSWER:
// 1: "bigint"   2: false   3: true   4: TypeError
//
// Explanation:
// - typeof 42n is "bigint" — BigInt is its own primitive type.
// - 42n === 42 is false — strict equality, different types.
// - 42n == 42 is true — loose equality coerces and compares values.
// - 42n + 1 throws TypeError — JS does not allow implicit BigInt/Number mixing.
//   You must explicitly convert: 42n + BigInt(1) or Number(42n) + 1.
// See README → BigInt

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Primitive vs object

function solution18(value: unknown): boolean {
  if (value === null) return true; // null is primitive but typeof null is "object"
  const t = typeof value;
  return t !== "object" && t !== "function";
}

// Explanation:
// Primitives: number, string, boolean, undefined, null, symbol, bigint.
// Everything else is an object (including arrays, functions, dates, etc.).
// We check typeof — if it's "object" or "function", it's not primitive.
// Special case: null is primitive but typeof null is "object", so handle it first.
// See README → The 8 Data Types table

// ─── Exercise 19: Predict the Output ────────────────────────────────────────
// Topic: Tricky coercion chain

function solution19() {
  console.log([] + []);       // ""
  console.log([] + {});       // "[object Object]"
  console.log({} + []);       // "[object Object]"
  console.log(true + true);   // 2
  console.log(true + false);  // 1
  console.log([] == ![]);     // true
}

// ANSWER:
// 1: ""                  — both arrays → "" via toString(), "" + "" = ""
// 2: "[object Object]"   — [] → "", {} → "[object Object]", concatenated
// 3: "[object Object]"   — same as above (in expression context)
// 4: 2                   — true → 1, 1 + 1 = 2
// 5: 1                   — true → 1, false → 0, 1 + 0 = 1
// 6: true                — ![] is false ([] is truthy), then [] == false
//                           → "" == false → 0 == 0 → true
//
// Explanation:
// When + is used with objects, they're converted to primitives via toString():
//   [].toString() → ""
//   ({}).toString() → "[object Object]"
// When + is used with booleans (no strings involved), they convert to numbers.
// [] == ![] is the classic JS gotcha:
//   ![] → false (because [] is truthy, ! negates it)
//   [] == false → coercion chain → "" == 0 → 0 == 0 → true
// See README → Common Gotchas

// ─── Exercise 20: Implement ─────────────────────────────────────────────────
// Topic: Object.is vs ===

function solution20(pairs: [unknown, unknown][]): [unknown, unknown][] {
  return pairs.filter(([a, b]) => Object.is(a, b) !== (a === b));
}

// Explanation:
// Object.is() differs from === in exactly two cases:
//   1. NaN: Object.is(NaN, NaN) is true, but NaN === NaN is false.
//   2. ±0:  Object.is(+0, -0) is false, but +0 === -0 is true.
// We filter for pairs where the two methods disagree.
// See README → Number → +0 and -0, and NaN is sticky and self-unequal

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1 ===");
solution1();

console.log("\n=== Exercise 2 ===");
solution2();

console.log("\n=== Exercise 3 ===");
solution3();

console.log("\n=== Exercise 4 ===");
solution4();

console.log("\n=== Exercise 5 ===");
solution5();

console.log("\n=== Exercise 6 ===");
solution6();

console.log("\n=== Exercise 7 ===");
solution7();

console.log("\n=== Exercise 8 ===");
solution8();

console.log("\n=== Exercise 9 ===");
console.log(solution9(null));
console.log(solution9(undefined));
console.log(solution9(0));
console.log(solution9(""));
console.log(solution9({}));

console.log("\n=== Exercise 10 ===");
console.log(solution10(NaN));
console.log(solution10(42));
console.log(solution10("hello"));
console.log(solution10(undefined));
console.log(solution10("123"));

console.log("\n=== Exercise 11 ===");
console.log(solution11(42));
console.log(solution11("hello"));
console.log(solution11(true));
console.log(solution11(undefined));
console.log(solution11(null));
console.log(solution11(Symbol("x")));
console.log(solution11(10n));
console.log(solution11([1, 2, 3]));
console.log(solution11({ a: 1 }));
console.log(solution11(() => {}));
console.log(solution11(new Date()));

console.log("\n=== Exercise 12 ===");
console.log(solution12("5"));
console.log(solution12(0));
console.log(solution12(null));
console.log(solution12(undefined));
console.log(solution12(""));
console.log(solution12("hello"));

console.log("\n=== Exercise 13 ===");
console.log(solution13([0, 1, "", "hello", null, undefined, NaN, true, false]));
console.log(solution13([[], {}, "0", " ", -1]));
console.log(solution13([]));

console.log("\n=== Exercise 14 ===");
console.log(solution14("42", 0));
console.log(solution14("  3.14  ", 0));
console.log(solution14("hello", -1));
console.log(solution14("", 0));
console.log(solution14("  ", 0));
console.log(solution14("12abc", -1));

console.log("\n=== Exercise 15 ===");
solution15();

console.log("\n=== Exercise 16 ===");
solution16();

console.log("\n=== Exercise 17 ===");
solution17();

console.log("\n=== Exercise 18 ===");
console.log(solution18(42));
console.log(solution18("hello"));
console.log(solution18(null));
console.log(solution18(undefined));
console.log(solution18(Symbol("x")));
console.log(solution18(10n));
console.log(solution18({}));
console.log(solution18([]));
console.log(solution18(() => {}));

console.log("\n=== Exercise 19 ===");
solution19();

console.log("\n=== Exercise 20 ===");
console.log(
  solution20([
    [NaN, NaN],
    [0, -0],
    [1, 1],
    [null, undefined],
    ["a", "a"],
    [+0, -0],
  ])
);
