// ============================================================================
// 02-data-types: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/01-fundamentals/02-data-types/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: typeof operator
//
// What does typeof return for each value?

function exercise1() {
  console.log(typeof 42);
  console.log(typeof "hello");
  console.log(typeof true);
  console.log(typeof undefined);
  console.log(typeof null);
  console.log(typeof Symbol("id"));
  console.log(typeof 10n);
  console.log(typeof {});
  console.log(typeof []);
  console.log(typeof function () {});
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???
// 7: ???
// 8: ???
// 9: ???
// 10: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: NaN behavior
//
// What does each expression evaluate to?

function exercise2() {
  console.log(NaN === NaN);
  console.log(typeof NaN);
  console.log(NaN + 1);
  console.log(NaN ** 0);
  console.log(isNaN("hello"));
  console.log(Number.isNaN("hello"));
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: String conversion with +
//
// What does each expression evaluate to?

function exercise3() {
  console.log("5" + 3);
  console.log(3 + "5");
  console.log("5" - 3);
  console.log("5" * "2");
  console.log("hello" - 1);
  console.log(1 + 2 + "3");
  console.log("3" + 2 + 1);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???
// 7: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Numeric conversion
//
// What does Number() return for each value?

function exercise4() {
  console.log(Number("123"));
  console.log(Number("  456  "));
  console.log(Number(""));
  console.log(Number(" "));
  console.log(Number("123abc"));
  console.log(Number(true));
  console.log(Number(false));
  console.log(Number(null));
  console.log(Number(undefined));
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???
// 7: ???
// 8: ???
// 9: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Falsy values and Boolean conversion
//
// Which of these are falsy? Predict true/false for each.

function exercise5() {
  console.log(Boolean(0));
  console.log(Boolean(""));
  console.log(Boolean("0"));
  console.log(Boolean(" "));
  console.log(Boolean(null));
  console.log(Boolean(undefined));
  console.log(Boolean(NaN));
  console.log(Boolean([]));
  console.log(Boolean({}));
  console.log(Boolean("false"));
}

// YOUR ANSWER:
// 1:  ???
// 2:  ???
// 3:  ???
// 4:  ???
// 5:  ???
// 6:  ???
// 7:  ???
// 8:  ???
// 9:  ???
// 10: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: null vs undefined
//
// What does each expression evaluate to?

function exercise6() {
  console.log(null == undefined);
  console.log(null === undefined);
  console.log(null == 0);
  console.log(undefined == 0);
  console.log(Number(null));
  console.log(Number(undefined));
  console.log(typeof null);
  console.log(typeof undefined);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???
// 7: ???
// 8: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Default parameters with null vs undefined
//
// What does each call log?

function greet(name = "World") {
  console.log(`Hello, ${name}!`);
}

function exercise7() {
  greet();
  greet(undefined);
  greet(null);
  greet("");
  greet(0);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Loose equality with coercion
//
// What does each comparison return?

function exercise8() {
  console.log(0 == false);
  console.log("" == false);
  console.log("0" == false);
  console.log("" == 0);
  console.log([] == false);
  console.log([] == 0);
  console.log("" == []);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???
// 7: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Checking for null
//
// This function is supposed to return true only when the input is null.
// But it has a bug — it also returns true for other values.
// Fix the type check.

function exercise9(value: unknown): boolean {
  return typeof value === "object" && !value;
}

// Uncomment to test:
// console.log(exercise9(null));      // Expected: true
// console.log(exercise9(undefined)); // Expected: false
// console.log(exercise9(0));         // Expected: false
// console.log(exercise9(""));        // Expected: false
// console.log(exercise9({}));        // Expected: false

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: Safe NaN check
//
// This function checks if a value is NaN, but the global isNaN()
// gives false positives. Fix it to only return true for actual NaN.

function exercise10(value: unknown): boolean {
  return isNaN(value as number);
}

// Uncomment to test:
// console.log(exercise10(NaN));       // Expected: true
// console.log(exercise10(42));        // Expected: false
// console.log(exercise10("hello"));   // Expected: false (not NaN, it's a string!)
// console.log(exercise10(undefined)); // Expected: false
// console.log(exercise10("123"));     // Expected: false

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Type identification
//
// Write a function that returns a precise type string for any value:
//   - "number", "string", "boolean", "undefined", "symbol", "bigint"
//   - "null"     (not "object"!)
//   - "array"    (not "object"!)
//   - "function" (not "object"!)
//   - "object"   (for plain objects and everything else)

function exercise11(value: unknown): string {
  // YOUR CODE HERE

  return "";
}

// Uncomment to test:
// console.log(exercise11(42));            // Expected: "number"
// console.log(exercise11("hello"));       // Expected: "string"
// console.log(exercise11(true));          // Expected: "boolean"
// console.log(exercise11(undefined));     // Expected: "undefined"
// console.log(exercise11(null));          // Expected: "null"
// console.log(exercise11(Symbol("x")));   // Expected: "symbol"
// console.log(exercise11(10n));           // Expected: "bigint"
// console.log(exercise11([1, 2, 3]));     // Expected: "array"
// console.log(exercise11({ a: 1 }));      // Expected: "object"
// console.log(exercise11(() => {}));       // Expected: "function"
// console.log(exercise11(new Date()));     // Expected: "object"

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Type coercion table
//
// Write a function that takes any value and returns an object showing
// what it converts to as a string, number, and boolean:
//
// Example: coercionTable("5") → { string: "5", number: 5, boolean: true }

function exercise12(
  value: unknown
): { string: string; number: number; boolean: boolean } {
  // YOUR CODE HERE

  return { string: "", number: 0, boolean: false };
}

// Uncomment to test:
// console.log(exercise12("5"));       // { string: "5", number: 5, boolean: true }
// console.log(exercise12(0));         // { string: "0", number: 0, boolean: false }
// console.log(exercise12(null));      // { string: "null", number: 0, boolean: false }
// console.log(exercise12(undefined)); // { string: "undefined", number: NaN, boolean: false }
// console.log(exercise12(""));        // { string: "", number: 0, boolean: false }
// console.log(exercise12("hello"));   // { string: "hello", number: NaN, boolean: true }

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Counting falsy values
//
// Given an array of mixed values, return the count of falsy values.
// Remember: the 7 falsy values are false, 0, -0, 0n, "", null, undefined, NaN.

function exercise13(values: unknown[]): number {
  // YOUR CODE HERE

  return 0;
}

// Uncomment to test:
// console.log(exercise13([0, 1, "", "hello", null, undefined, NaN, true, false]));
// Expected: 6 (0, "", null, undefined, NaN, false)
// console.log(exercise13([[], {}, "0", " ", -1]));
// Expected: 0 (all truthy!)
// console.log(exercise13([]));
// Expected: 0

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Safe numeric parsing
//
// Write a function that converts a string to a number safely.
//   - If the string is a valid number, return the number.
//   - If it's not valid (NaN), return the provided default value.
//   - Trim whitespace before checking.

function exercise14(input: string, defaultValue: number): number {
  // YOUR CODE HERE

  return 0;
}

// Uncomment to test:
// console.log(exercise14("42", 0));         // Expected: 42
// console.log(exercise14("  3.14  ", 0));   // Expected: 3.14
// console.log(exercise14("hello", -1));     // Expected: -1
// console.log(exercise14("", 0));           // Expected: 0 (empty string → 0, which is valid)
// console.log(exercise14("  ", 0));         // Expected: 0 (whitespace → 0)
// console.log(exercise14("12abc", -1));     // Expected: -1

// ─── Exercise 15: Predict the Output ────────────────────────────────────────
// Topic: Template literal expressions
//
// What does each template literal produce?

function exercise15() {
  const name = "Ilya";

  console.log(`hello ${1}`);
  console.log(`hello ${"name"}`);
  console.log(`hello ${name}`);
  console.log(`result: ${2 + 3}`);
  console.log(`${typeof null}`);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???

// Uncomment to test:
// exercise15();

// ─── Exercise 16: Predict the Output ────────────────────────────────────────
// Topic: String immutability
//
// What is logged?

function exercise16() {
  let str = "Hello";
  (str as any)[0] = "h";
  console.log(str);

  const arr = [1, 2, 3];
  arr[0] = 99;
  console.log(arr);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise16();

// ─── Exercise 17: Predict the Output ────────────────────────────────────────
// Topic: BigInt and Number interaction
//
// What happens with each expression?

function exercise17() {
  console.log(typeof 42n);
  console.log(42n === 42);
  console.log(42n == 42);
  // console.log(42n + 1); // What would this do? (don't uncomment — predict!)
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4 (42n + 1): ???

// Uncomment to test (lines 1-3 only):
// exercise17();

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Primitive vs object
//
// Write a function that returns true if a value is a primitive,
// false if it's an object (including arrays, functions, etc.)
//
// Remember: there are 7 primitive types: number, string, boolean,
// null, undefined, symbol, bigint.

function exercise18(value: unknown): boolean {
  // YOUR CODE HERE

  return false;
}

// Uncomment to test:
// console.log(exercise18(42));           // Expected: true
// console.log(exercise18("hello"));      // Expected: true
// console.log(exercise18(null));         // Expected: true
// console.log(exercise18(undefined));    // Expected: true
// console.log(exercise18(Symbol("x")));  // Expected: true
// console.log(exercise18(10n));          // Expected: true
// console.log(exercise18({}));           // Expected: false
// console.log(exercise18([]));           // Expected: false
// console.log(exercise18(() => {}));     // Expected: false

// ─── Exercise 19: Predict the Output ────────────────────────────────────────
// Topic: Tricky coercion chain
//
// Evaluate step by step. What is the final result?

function exercise19() {
  console.log([] + []);
  console.log([] + {});
  console.log({} + []);
  console.log(true + true);
  console.log(true + false);
  console.log([] == ![]);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???
// 6: ???

// Uncomment to test:
// exercise19();

// ─── Exercise 20: Implement ─────────────────────────────────────────────────
// Topic: Object.is vs ===
//
// Write a function that returns an array of differences between
// Object.is() and === for a list of value pairs.
// Return only the pairs where Object.is and === disagree.
//
// Example: findDifferences([[NaN, NaN], [0, -0], [1, 1]])
//   → [[NaN, NaN], [0, -0]]
// Because:
//   NaN === NaN is false, but Object.is(NaN, NaN) is true
//   0 === -0 is true, but Object.is(0, -0) is false

function exercise20(pairs: [unknown, unknown][]): [unknown, unknown][] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(exercise20([
//   [NaN, NaN],
//   [0, -0],
//   [1, 1],
//   [null, undefined],
//   ["a", "a"],
//   [+0, -0],
// ]));
// Expected: [[NaN, NaN], [0, -0], [+0, -0]]
