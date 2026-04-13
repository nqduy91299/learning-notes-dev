// ============================================================================
// 03-operators: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/01-fundamentals/03-operators/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Arithmetic with string coercion
//
// What does each expression evaluate to?

function exercise1() {
  console.log("" + 1 + 0);
  console.log("" - 1 + 0);
  console.log(true + false);
  console.log("2" * "3");
  console.log(4 + 5 + "px");
  console.log("$" + 4 + 5);
  console.log("4" - 2);
  console.log("4px" - 2);
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
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Comparison operators and coercion
//
// What does each comparison return?

function exercise2() {
  console.log(5 > 4);
  console.log("2" > "12");
  console.log(undefined == null);
  console.log(undefined === null);
  console.log(null == 0);
  console.log(null >= 0);
  console.log(undefined > 0);
  console.log(undefined == 0);
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
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: == vs === with type coercion
//
// What does each expression evaluate to?

function exercise3() {
  console.log(0 == false);
  console.log(0 === false);
  console.log("" == false);
  console.log("" === false);
  console.log("0" == false);
  console.log("0" === false);
  console.log(null == undefined);
  console.log(null === undefined);
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
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Logical operators — short-circuit and return values
//
// Remember: || returns the first TRUTHY value, && returns the first FALSY value.
// They return the ORIGINAL value, not true/false.

function exercise4() {
  console.log(1 || 0);
  console.log(null || 1);
  console.log(null || 0 || undefined);
  console.log(1 && 0);
  console.log(1 && 5);
  console.log(null && 5);
  console.log(1 && 2 && null && 3);
  console.log(1 && 2 && 3);
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
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Logical operator precedence (! > && > ||)
//
// Evaluate carefully, respecting operator precedence.

function exercise5() {
  console.log(null || 2 && 3 || 4);
  console.log(!!"non-empty");
  console.log(!!"");
  console.log(!null);
  console.log(-1 || 0);
  console.log(-1 && 0);
  console.log(null || -1 && 1);
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
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: ?? vs || — the critical difference
//
// Pay close attention to how 0, "", and false are treated.

function exercise6() {
  const height = 0;
  const title = "";
  const enabled = false;

  console.log(height || 100);
  console.log(height ?? 100);
  console.log(title || "Untitled");
  console.log(title ?? "Untitled");
  console.log(enabled || true);
  console.log(enabled ?? true);
  console.log(null ?? "default");
  console.log(undefined ?? "default");
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
// Topic: Optional chaining (?.)
//
// What does each expression evaluate to?

function exercise7() {
  const user: { address?: { street?: string }; greet?: () => string } = {};
  const nullUser = null;

  console.log(user?.address?.street);
  console.log((nullUser as { name?: string } | null)?.name);
  console.log(user.greet?.());
  console.log(user?.["address"]?.["street"]);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Unary plus and typeof
//
// What does each expression evaluate to?

function exercise8() {
  console.log(+true);
  console.log(+"");
  console.log(+null);
  console.log(+undefined);
  console.log(+"42");
  console.log(+"hello");
  console.log(typeof null);
  console.log(typeof undefined);
  console.log(typeof NaN);
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
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Increment/decrement prefix vs postfix
//
// What are the final values of all variables?

function exercise9() {
  let a = 1, b = 1;
  const c = ++a;
  const d = b++;

  console.log(a);
  console.log(b);
  console.log(c);
  console.log(d);
}

// YOUR ANSWER:
// a: ???
// b: ???
// c: ???
// d: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Ternary operator and comma operator
//
// What does each expression evaluate to?

function exercise10() {
  const age = 16;
  console.log(age >= 18 ? "adult" : "minor");

  const x = (1 + 2, 3 + 4);
  console.log(x);

  // What about without parentheses?
  let y;
  y = 1 + 2, 3 + 4;
  console.log(y);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Short-circuit side effects
//
// Which console.log calls actually execute?

function exercise11() {
  let count = 0;

  true || (count += 1);
  console.log("A:", count);

  false || (count += 1);
  console.log("B:", count);

  true && (count += 1);
  console.log("C:", count);

  false && (count += 1);
  console.log("D:", count);

  null ?? (count += 1);
  console.log("E:", count);

  0 ?? (count += 1);
  console.log("F:", count);
}

// YOUR ANSWER:
// A: ???
// B: ???
// C: ???
// D: ???
// E: ???
// F: ???

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Incorrect equality check
//
// This function should return true only when the value is either null
// or undefined. Currently it has false positives.

function exercise12(value: unknown): boolean {
  // BUG: using == 0 doesn't work — fix the comparison
  return value == 0;
}

// Uncomment to test:
// console.log(exercise12(null));      // Expected: true
// console.log(exercise12(undefined)); // Expected: true
// console.log(exercise12(0));         // Expected: false
// console.log(exercise12(""));        // Expected: false
// console.log(exercise12(false));     // Expected: false

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: || vs ?? for default values
//
// This function provides a default port number, but it incorrectly
// treats port 0 as missing. Fix it so that 0 is a valid port.

function exercise13(port: number | null | undefined): number {
  // BUG: || treats 0 as falsy — fix it
  return port || 3000;
}

// Uncomment to test:
// console.log(exercise13(8080));      // Expected: 8080
// console.log(exercise13(0));         // Expected: 0
// console.log(exercise13(null));      // Expected: 3000
// console.log(exercise13(undefined)); // Expected: 3000

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: String comparison gotcha
//
// This function compares two numeric strings, but it's doing string
// comparison instead of numeric comparison. Fix it.

function exercise14(a: string, b: string): number {
  // BUG: compares strings lexicographically, not numerically
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

// Uncomment to test:
// console.log(exercise14("2", "12"));   // Expected: -1 (2 < 12 numerically)
// console.log(exercise14("9", "10"));   // Expected: -1 (9 < 10 numerically)
// console.log(exercise14("5", "5"));    // Expected: 0
// console.log(exercise14("20", "3"));   // Expected: 1  (20 > 3 numerically)

// ─── Exercise 15: Fix the Bug ───────────────────────────────────────────────
// Topic: Optional chaining missing
//
// This function crashes when user or nested properties are null/undefined.
// Fix it using optional chaining so it returns undefined instead of throwing.

interface UserProfile {
  address?: {
    city?: string;
  };
  getFullName?: () => string;
  tags?: string[];
}

function exercise15(user: UserProfile | null | undefined): string | undefined {
  // BUG: crashes when user, address, or getFullName is null/undefined
  // @ts-expect-error — intentional bug for exercise
  return user.address.city || user.getFullName() || user.tags[0];
}

// Uncomment to test:
// console.log(exercise15({ address: { city: "NYC" } }));    // Expected: "NYC"
// console.log(exercise15(null));                              // Expected: undefined
// console.log(exercise15({}));                                // Expected: undefined
// console.log(exercise15({ getFullName: () => "Alice" }));   // Expected: "Alice"

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Safe property accessor using ?.
//
// Write a function that safely accesses a deeply nested property from
// an object using a dot-separated path string.
//
// Example: safeGet({ a: { b: { c: 42 } } }, "a.b.c") → 42
//          safeGet({ a: { b: null } }, "a.b.c") → undefined
//          safeGet(null, "a.b") → undefined

function exercise16(obj: unknown, path: string): unknown {
  // YOUR CODE HERE

  return undefined;
}

// Uncomment to test:
// console.log(exercise16({ a: { b: { c: 42 } } }, "a.b.c"));     // Expected: 42
// console.log(exercise16({ a: { b: { c: 0 } } }, "a.b.c"));      // Expected: 0
// console.log(exercise16({ a: { b: null } }, "a.b.c"));           // Expected: undefined
// console.log(exercise16(null, "a.b"));                            // Expected: undefined
// console.log(exercise16({ a: 1 }, "a.b.c"));                     // Expected: undefined
// console.log(exercise16({ x: [1, 2, 3] }, "x"));                 // Expected: [1,2,3]

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Expression evaluator
//
// Write a function that evaluates simple two-operand math expressions
// given as a string. Support: +, -, *, /, %, **
//
// Example: evaluate("10 + 5") → 15
//          evaluate("2 ** 8") → 256
//
// Return NaN for invalid operators.

function exercise17(expression: string): number {
  // YOUR CODE HERE

  return NaN;
}

// Uncomment to test:
// console.log(exercise17("10 + 5"));    // Expected: 15
// console.log(exercise17("10 - 3"));    // Expected: 7
// console.log(exercise17("4 * 6"));     // Expected: 24
// console.log(exercise17("15 / 4"));    // Expected: 3.75
// console.log(exercise17("10 % 3"));    // Expected: 1
// console.log(exercise17("2 ** 8"));    // Expected: 256
// console.log(exercise17("5 ^ 2"));     // Expected: NaN (invalid operator)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Custom nullish-aware default function
//
// Write a function `withDefaults` that takes an object and a defaults object.
// For each key in defaults, if the original object's value is null or undefined
// (NOT 0, "", or false), fill in the default. Return a new object.
//
// This is essentially ?? applied per-property.

function exercise18(
  obj: Record<string, unknown>,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  // YOUR CODE HERE

  return {};
}

// Uncomment to test:
// console.log(exercise18(
//   { name: "Alice", age: 0, title: "", active: false, score: null },
//   { name: "Unknown", age: 25, title: "Untitled", active: true, score: 100, role: "user" }
// ));
// Expected: {
//   name: "Alice",    — kept (not null/undefined)
//   age: 0,           — kept (0 is not null/undefined)
//   title: "",        — kept ("" is not null/undefined)
//   active: false,    — kept (false is not null/undefined)
//   score: 100,       — filled (was null)
//   role: "user"      — filled (was undefined/missing)
// }
