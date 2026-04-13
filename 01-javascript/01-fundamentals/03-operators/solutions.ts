// ============================================================================
// 03-operators: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Arithmetic with string coercion

function solution1() {
  console.log("" + 1 + 0);     // "10"
  console.log("" - 1 + 0);     // -1
  console.log(true + false);    // 1
  console.log("2" * "3");       // 6
  console.log(4 + 5 + "px");   // "9px"
  console.log("$" + 4 + 5);    // "$45"
  console.log("4" - 2);        // 2
  console.log("4px" - 2);      // NaN
}

// ANSWER:
// 1: "10"   2: -1   3: 1   4: 6   5: "9px"   6: "$45"   7: 2   8: NaN
//
// Explanation:
// - ""+1 → "1", then "1"+0 → "10" (string concatenation with +)
// - ""-1 → -1 (subtraction always converts to number), -1+0 → -1
// - true → 1, false → 0, 1+0 = 1 (no strings, so numeric addition)
// - Both strings convert to numbers for *: 2*3 = 6
// - 4+5 = 9 (both numbers), then 9+"px" → "9px"
// - "$"+4 → "$4" (string first), then "$4"+5 → "$45"
// - "4"-2 → 4-2 = 2 (subtraction forces numeric)
// - "4px" → NaN (can't convert), NaN-2 → NaN
// See README → Section 1 (Arithmetic) and Section 11 (Gotcha #4)

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Comparison operators and coercion

function solution2() {
  console.log(5 > 4);             // true
  console.log("2" > "12");        // true
  console.log(undefined == null);  // true
  console.log(undefined === null); // false
  console.log(null == 0);          // false
  console.log(null >= 0);          // true
  console.log(undefined > 0);      // false
  console.log(undefined == 0);     // false
}

// ANSWER:
// 1: true   2: true   3: true   4: false   5: false   6: true   7: false   8: false
//
// Explanation:
// - "2" > "12": STRING comparison — "2" (U+0032) > "1" (U+0031) at first char
// - undefined == null: special rule — they are loosely equal to each other only
// - undefined === null: different types → false
// - null == 0: null only == undefined, not 0
// - null >= 0: comparison converts null → 0, 0 >= 0 → true
// - undefined > 0: undefined → NaN, any comparison with NaN → false
// - undefined == 0: undefined only == null
// See README → Section 3 (Comparison) and Section 11 (Gotcha #3)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: == vs === with type coercion

function solution3() {
  console.log(0 == false);         // true
  console.log(0 === false);        // false
  console.log("" == false);        // true
  console.log("" === false);       // false
  console.log("0" == false);       // true
  console.log("0" === false);      // false
  console.log(null == undefined);  // true
  console.log(null === undefined); // false
}

// ANSWER:
// 1: true   2: false   3: true   4: false   5: true   6: false   7: true   8: false
//
// Explanation:
// == converts types: 0==false → 0==0 → true; ""==false → 0==0 → true;
// "0"==false → "0"==0 → 0==0 → true
// === never converts: different types → always false
// null == undefined → true (special rule); null === undefined → false (different types)
// See README → Section 3 (== vs ===)

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Logical operators — short-circuit and return values

function solution4() {
  console.log(1 || 0);                  // 1
  console.log(null || 1);               // 1
  console.log(null || 0 || undefined);  // undefined
  console.log(1 && 0);                  // 0
  console.log(1 && 5);                  // 5
  console.log(null && 5);               // null
  console.log(1 && 2 && null && 3);     // null
  console.log(1 && 2 && 3);             // 3
}

// ANSWER:
// 1: 1   2: 1   3: undefined   4: 0   5: 5   6: null   7: null   8: 3
//
// Explanation:
// || returns first TRUTHY value, or last value if all falsy:
//   1||0 → 1 (truthy); null||0||undefined → undefined (all falsy, returns last)
// && returns first FALSY value, or last value if all truthy:
//   1&&0 → 0 (first falsy); 1&&2&&3 → 3 (all truthy, returns last)
// See README → Section 4 (Logical Operators)

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Logical operator precedence (! > && > ||)

function solution5() {
  console.log(null || 2 && 3 || 4);   // 3
  console.log(!!"non-empty");          // true
  console.log(!!"");                    // false
  console.log(!null);                   // true
  console.log(-1 || 0);                // -1
  console.log(-1 && 0);                // 0
  console.log(null || -1 && 1);        // 1
}

// ANSWER:
// 1: 3   2: true   3: false   4: true   5: -1   6: 0   7: 1
//
// Explanation:
// 1: && before || → null || (2&&3) || 4 → null || 3 || 4 → 3
// 2: !! converts to boolean: "non-empty" is truthy → true
// 3: "" is falsy → !!"" → false
// 4: null is falsy → !null → true
// 5: -1 is truthy → -1 || 0 → -1
// 6: -1 is truthy → &&  checks next → 0 is falsy → returns 0
// 7: && before || → null || (-1 && 1) → null || 1 → 1
// See README → Section 4 (Precedence: ! > && > ||)

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: ?? vs || — the critical difference

function solution6() {
  const height = 0;
  const title = "";
  const enabled = false;

  console.log(height || 100);        // 100
  console.log(height ?? 100);        // 0
  console.log(title || "Untitled");  // "Untitled"
  console.log(title ?? "Untitled");  // ""
  console.log(enabled || true);      // true
  console.log(enabled ?? true);      // false
  console.log(null ?? "default");    // "default"
  console.log(undefined ?? "default"); // "default"
}

// ANSWER:
// 1: 100   2: 0   3: "Untitled"   4: ""   5: true   6: false   7: "default"   8: "default"
//
// Explanation:
// || treats 0, "", and false as falsy → falls through to right operand
// ?? only treats null and undefined as "nullish" → keeps 0, "", and false
// This is the most important practical difference between || and ??
// See README → Section 5 (Nullish Coalescing)

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Optional chaining (?.)

function solution7() {
  const user: { address?: { street?: string }; greet?: () => string } = {};
  const nullUser = null;

  console.log(user?.address?.street);                              // undefined
  console.log((nullUser as { name?: string } | null)?.name);       // undefined
  console.log(user.greet?.());                                     // undefined
  console.log(user?.["address"]?.["street"]);                      // undefined
}

// ANSWER:
// 1: undefined   2: undefined   3: undefined   4: undefined
//
// Explanation:
// - user.address is undefined → ?. stops, returns undefined
// - nullUser is null → ?. stops, returns undefined
// - user.greet is undefined → ?.() doesn't call, returns undefined
// - bracket notation ?.[] works the same as ?.
// Without ?., accessing .street on undefined would throw TypeError.
// See README → Section 6 (Optional Chaining)

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Unary plus and typeof

function solution8() {
  console.log(+true);        // 1
  console.log(+"");          // 0
  console.log(+null);        // 0
  console.log(+undefined);   // NaN
  console.log(+"42");        // 42
  console.log(+"hello");     // NaN
  console.log(typeof null);       // "object"
  console.log(typeof undefined);  // "undefined"
  console.log(typeof NaN);        // "number"
}

// ANSWER:
// 1: 1   2: 0   3: 0   4: NaN   5: 42   6: NaN   7: "object"   8: "undefined"   9: "number"
//
// Explanation:
// Unary + is equivalent to Number(): true→1, ""→0, null→0, undefined→NaN
// typeof null → "object" (historical bug)
// typeof NaN → "number" (NaN belongs to the number type)
// See README → Section 7 (Unary Operators)

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Increment/decrement prefix vs postfix

function solution9() {
  let a = 1, b = 1;
  const c = ++a;   // prefix: increments a to 2, returns 2
  const d = b++;   // postfix: returns 1 (old value), then increments b to 2

  console.log(a);  // 2
  console.log(b);  // 2
  console.log(c);  // 2
  console.log(d);  // 1
}

// ANSWER:
// a: 2   b: 2   c: 2   d: 1
//
// Explanation:
// ++a (prefix): increment first, then return → a becomes 2, c gets 2
// b++ (postfix): return first, then increment → d gets 1 (old value), b becomes 2
// See README → Section 1 (Increment / Decrement)

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Ternary operator and comma operator

function solution10() {
  const age = 16;
  console.log(age >= 18 ? "adult" : "minor");  // "minor"

  const x = (1 + 2, 3 + 4);
  console.log(x);  // 7

  let y;
  y = 1 + 2, 3 + 4;
  console.log(y);  // 3
}

// ANSWER:
// 1: "minor"   2: 7   3: 3
//
// Explanation:
// 1: 16 >= 18 is false → "minor"
// 2: Comma inside parens: evaluates 1+2 (discarded), then 3+4 → 7
// 3: Without parens: comma has lower precedence than =
//    so it's (y = 1+2), (3+4) — y gets 3, the 7 is discarded
// See README → Section 8 (Ternary) and Section 9 (Comma)

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Short-circuit side effects

function solution11() {
  let count = 0;

  true || (count += 1);     // short-circuits — count stays 0
  console.log("A:", count); // A: 0

  false || (count += 1);    // doesn't short-circuit — count becomes 1
  console.log("B:", count); // B: 1

  true && (count += 1);     // doesn't short-circuit — count becomes 2
  console.log("C:", count); // C: 2

  false && (count += 1);    // short-circuits — count stays 2
  console.log("D:", count); // D: 2

  null ?? (count += 1);     // null is nullish → right side runs — count becomes 3
  console.log("E:", count); // E: 3

  0 ?? (count += 1);        // 0 is NOT nullish → short-circuits — count stays 3
  console.log("F:", count); // F: 3
}

// ANSWER:
// A: 0   B: 1   C: 2   D: 2   E: 3   F: 3
//
// Explanation:
// || short-circuits on TRUTHY left side (skips right)
// && short-circuits on FALSY left side (skips right)
// ?? short-circuits on NON-NULLISH left side (skips right) — 0 is NOT nullish!
// See README → Section 4 (Short-circuit) and Section 5 (?? vs ||)

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Incorrect equality check

function solution12(value: unknown): boolean {
  return value == null; // FIX: == null matches both null and undefined (and ONLY those)
}

// Explanation:
// The original used value == 0, which matches many falsy values (0, "", false, null).
// value == null is the one case where loose equality is actually useful:
// it matches both null and undefined, and NOTHING else.
// See README → Section 3 (null and undefined comparisons)

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: || vs ?? for default values

function solution13(port: number | null | undefined): number {
  return port ?? 3000; // FIX: ?? keeps 0 as a valid value
}

// Explanation:
// || treats 0 as falsy → 0 || 3000 → 3000 (wrong!)
// ?? only treats null/undefined as "empty" → 0 ?? 3000 → 0 (correct!)
// See README → Section 5 (Nullish Coalescing) and Section 11 (Gotcha #2)

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: String comparison gotcha

function solution14(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);
  if (numA > numB) return 1;
  if (numA < numB) return -1;
  return 0;
}

// Explanation:
// Comparing strings with > and < does lexicographic (dictionary) comparison:
// "2" > "12" → true (compares "2" vs "1" at first character)
// Converting to Number first gives correct numeric comparison.
// See README → Section 3 (String comparison) and Section 11 (Gotcha #3)

// ─── Exercise 15: Fix the Bug ───────────────────────────────────────────────
// Topic: Optional chaining missing

interface UserProfile {
  address?: {
    city?: string;
  };
  getFullName?: () => string;
  tags?: string[];
}

function solution15(user: UserProfile | null | undefined): string | undefined {
  return user?.address?.city || user?.getFullName?.() || user?.tags?.[0];
}

// Explanation:
// The original code crashed because it accessed properties on null/undefined:
//   user.address.city → TypeError if user is null
//   user.getFullName() → TypeError if getFullName is undefined
//   user.tags[0] → TypeError if tags is undefined
// Optional chaining ?. safely returns undefined at each step.
// Note: ?.() for method calls, ?.[0] for bracket notation.
// See README → Section 6 (Optional Chaining — Three forms)

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Safe property accessor using ?.

function solution16(obj: unknown, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

// Explanation:
// We split the path by "." and traverse the object one key at a time.
// At each step, we check if current is null or undefined (using == null,
// which matches both). This mimics ?. behavior — if any intermediate
// value is nullish, we bail out with undefined.
// See README → Section 6 (Optional Chaining) and Section 12 (Best Practices #3)

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Expression evaluator

function solution17(expression: string): number {
  const parts = expression.split(" ");
  const left = Number(parts[0]);
  const operator = parts[1];
  const right = Number(parts[2]);

  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
    case "%": return left % right;
    case "**": return left ** right;
    default: return NaN;
  }
}

// Explanation:
// We split on spaces and parse the two operands as numbers.
// A switch statement dispatches to the correct arithmetic operation.
// Unknown operators return NaN.
// See README → Section 1 (Arithmetic Operators)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Custom nullish-aware default function

function solution18(
  obj: Record<string, unknown>,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...obj };
  for (const key of Object.keys(defaults)) {
    result[key] = result[key] ?? defaults[key];
  }
  return result;
}

// Explanation:
// We spread the original object, then iterate over default keys.
// For each key, we use ?? to fill in the default ONLY if the current
// value is null or undefined. This preserves 0, "", and false.
// This is exactly the per-property equivalent of the ?? operator.
// See README → Section 5 (Nullish Coalescing) and Section 12 (Best Practices #2)

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
solution9();

console.log("\n=== Exercise 10 ===");
solution10();

console.log("\n=== Exercise 11 ===");
solution11();

console.log("\n=== Exercise 12 ===");
console.log(solution12(null));       // true
console.log(solution12(undefined));  // true
console.log(solution12(0));          // false
console.log(solution12(""));         // false
console.log(solution12(false));      // false

console.log("\n=== Exercise 13 ===");
console.log(solution13(8080));       // 8080
console.log(solution13(0));          // 0
console.log(solution13(null));       // 3000
console.log(solution13(undefined));  // 3000

console.log("\n=== Exercise 14 ===");
console.log(solution14("2", "12"));  // -1
console.log(solution14("9", "10"));  // -1
console.log(solution14("5", "5"));   // 0
console.log(solution14("20", "3"));  // 1

console.log("\n=== Exercise 15 ===");
console.log(solution15({ address: { city: "NYC" } }));     // "NYC"
console.log(solution15(null));                               // undefined
console.log(solution15({}));                                 // undefined
console.log(solution15({ getFullName: () => "Alice" }));    // "Alice"

console.log("\n=== Exercise 16 ===");
console.log(solution16({ a: { b: { c: 42 } } }, "a.b.c"));  // 42
console.log(solution16({ a: { b: { c: 0 } } }, "a.b.c"));   // 0
console.log(solution16({ a: { b: null } }, "a.b.c"));        // undefined
console.log(solution16(null, "a.b"));                         // undefined
console.log(solution16({ a: 1 }, "a.b.c"));                  // undefined
console.log(solution16({ x: [1, 2, 3] }, "x"));              // [1, 2, 3]

console.log("\n=== Exercise 17 ===");
console.log(solution17("10 + 5"));   // 15
console.log(solution17("10 - 3"));   // 7
console.log(solution17("4 * 6"));    // 24
console.log(solution17("15 / 4"));   // 3.75
console.log(solution17("10 % 3"));   // 1
console.log(solution17("2 ** 8"));   // 256
console.log(solution17("5 ^ 2"));    // NaN

console.log("\n=== Exercise 18 ===");
console.log(solution18(
  { name: "Alice", age: 0, title: "", active: false, score: null },
  { name: "Unknown", age: 25, title: "Untitled", active: true, score: 100, role: "user" }
));
