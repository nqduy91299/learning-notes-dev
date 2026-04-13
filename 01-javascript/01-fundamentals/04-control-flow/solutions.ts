// ============================================================================
// 04-control-flow: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: switch fall-through

function solution1() {
  const fruit = "banana";
  switch (fruit) {
    case "apple":
      console.log("apple");
    case "banana":
      console.log("banana");   // ← matched here
    case "cherry":
      console.log("cherry");   // ← falls through
    default:
      console.log("default");  // ← falls through
  }
}

// ANSWER:
// 1: "banana"
// 2: "cherry"
// 3: "default"
//
// Explanation:
// "banana" matches case "banana". Because there is no `break`, execution
// falls through every subsequent case (including default) without checking
// their conditions.
// See README → 2. switch Statement → Fall-through

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: switch with strict equality

function solution2() {
  const value = "2";
  // In the exercise, case 2 (number) is compared against value "2" (string).
  // switch uses ===, so "2" !== 2 → first case skipped.
  // Here we just show what actually runs:
  switch (value) {
    case "2":
      console.log("string two"); // ← matches
      break;
    default:
      console.log("no match");
  }
}

// ANSWER:
// "string two"
//
// Explanation:
// switch uses === (strict equality). "2" !== 2 (different types), so the
// first case is skipped. "2" === "2" matches the second case.
// See README → 2. switch Statement → Strict comparison

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: for loop execution order

function solution3() {
  for (let i = 0; i < 3; i++) {
    console.log(i); // 0, 1, 2
  }
  // console.log(i); → ReferenceError: i is not defined
}

// ANSWER:
// Logs: 0, 1, 2
// The commented-out line would throw ReferenceError because `let i` is
// scoped to the for loop block.
//
// Explanation:
// The for loop runs: init (i=0) → check (0<3 → true) → body → step (i++)
// → check (1<3) → body → step → check (2<3) → body → step → check (3<3 → false) → stop.
// `let` in the initializer is block-scoped to the loop.
// See README → 4. for Loop → Variable scope

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: while loop with prefix vs postfix increment

function solution4() {
  console.log("--- prefix ---");
  let a = 0;
  while (++a < 3) {
    console.log(a); // 1, 2
  }

  console.log("--- postfix ---");
  let b = 0;
  while (b++ < 3) {
    console.log(b); // 1, 2, 3
  }
}

// ANSWER:
// prefix:  1, 2
// postfix: 1, 2, 3
//
// Explanation:
// Prefix (++a): increments FIRST, then the new value is used in the comparison.
//   a=0 → ++a → a=1, 1<3 → log 1. a=1 → ++a → a=2, 2<3 → log 2.
//   a=2 → ++a → a=3, 3<3 → false, stop.
// Postfix (b++): the OLD value is used in the comparison, then increments.
//   b=0, 0<3 → true, b becomes 1 → log 1. b=1, 1<3 → true, b becomes 2 → log 2.
//   b=2, 2<3 → true, b becomes 3 → log 3. b=3, 3<3 → false, stop.
// See README → 5. while Loop → Prefix vs postfix in condition

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: for...in vs for...of on an array

function solution5() {
  const arr = [10, 20, 30];

  console.log("--- for...in ---");
  for (const key in arr) {
    console.log(typeof key, key); // "string" "0", "string" "1", "string" "2"
  }

  console.log("--- for...of ---");
  for (const val of arr) {
    console.log(typeof val, val); // "number" 10, "number" 20, "number" 30
  }
}

// ANSWER:
// for...in logs:
//   "string" "0"
//   "string" "1"
//   "string" "2"
// for...of logs:
//   "number" 10
//   "number" 20
//   "number" 30
//
// Explanation:
// for...in iterates over enumerable property KEYS (always strings).
// for...of iterates over iterable VALUES (the actual array elements).
// See README → 7. for...of and 8. for...in

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: for...in with extra properties on array

function solution6() {
  const arr: number[] & { sum?: number } = [1, 2, 3];
  arr.sum = 6;

  const result: string[] = [];
  for (const key in arr) {
    result.push(key);
  }
  console.log(result); // ["0", "1", "2", "sum"]
}

// ANSWER:
// ["0", "1", "2", "sum"]
//
// Explanation:
// for...in iterates over ALL enumerable string-keyed properties, including
// non-index properties like "sum". This is why for...in should not be used
// on arrays — it picks up extra properties.
// See README → 8. for...in → Why to avoid on arrays

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: labeled break

function solution7() {
  const result: string[] = [];

  outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) break outer;
      result.push(`${i},${j}`);
    }
  }

  console.log(result); // ["0,0", "0,1", "0,2", "1,0"]
}

// ANSWER:
// ["0,0", "0,1", "0,2", "1,0"]
//
// Explanation:
// The labeled break exits the OUTER loop entirely when i=1 and j=1.
// i=0: j runs 0,1,2 → pushes "0,0", "0,1", "0,2".
// i=1: j=0 → pushes "1,0". j=1 → break outer → done.
// See README → 9. break and continue → Labeled statements

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: labeled continue

function solution8() {
  const result: string[] = [];

  outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j === 1) continue outer;
      result.push(`${i},${j}`);
    }
  }

  console.log(result); // ["0,0", "1,0", "2,0"]
}

// ANSWER:
// ["0,0", "1,0", "2,0"]
//
// Explanation:
// When j === 1, `continue outer` skips to the next iteration of the OUTER
// loop (increments i). So for each i, only j=0 is ever pushed — j never
// reaches 2.
// See README → 9. break and continue → Labeled statements

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: do...while runs at least once

function solution9() {
  let count = 10;

  do {
    console.log(count); // 10
    count++;
  } while (count < 3);

  console.log("final:", count); // "final:" 11
}

// ANSWER:
// 10
// "final:" 11
//
// Explanation:
// do...while always executes the body at least once before checking the
// condition. count starts at 10, body logs 10, increments to 11.
// Then checks 11 < 3 → false → loop stops.
// See README → 6. do...while Loop

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: for...of on a string and a Map

function solution10() {
  console.log("--- string ---");
  const chars: string[] = [];
  for (const ch of "Hi!") {
    chars.push(ch);
  }
  console.log(chars); // ["H", "i", "!"]

  console.log("--- Map ---");
  const map = new Map<string, number>([["x", 1], ["y", 2]]);
  for (const entry of map) {
    console.log(entry); // ["x", 1] then ["y", 2]
  }
}

// ANSWER:
// string: ["H", "i", "!"]
// Map:    ["x", 1] then ["y", 2]
//
// Explanation:
// for...of iterates over any iterable. Strings yield individual characters.
// Maps yield [key, value] tuples in insertion order.
// See README → 7. for...of

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Missing break in switch

function solution11(dayNum: number): string {
  let result: string;

  switch (dayNum) {
    case 0:
      result = "Sunday";
      break;               // FIX: added break to every case
    case 1:
      result = "Monday";
      break;
    case 2:
      result = "Tuesday";
      break;
    case 3:
      result = "Wednesday";
      break;
    case 4:
      result = "Thursday";
      break;
    case 5:
      result = "Friday";
      break;
    case 6:
      result = "Saturday";
      break;
    default:
      result = "Unknown day";
  }

  return result;
}

// Explanation:
// Without break, every case falls through. Passing 0 would assign "Sunday",
// then immediately overwrite with "Monday", "Tuesday", ... all the way to
// "Unknown day". Adding break after each case fixes this.
// See README → 2. switch Statement → Fall-through
// See README → 10. Common Gotchas → Switch fall-through

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Off-by-one error

function solution12(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) { // FIX: changed < to <=
    sum += i;
  }
  return sum;
}

// Explanation:
// The original used `i < n`, which stops at n-1. Since we want "1 to n
// inclusive", the condition must be `i <= n`.
// For n=5: 1+2+3+4 = 10 (bug) vs 1+2+3+4+5 = 15 (fixed).
// See README → 10. Common Gotchas → Off-by-one errors

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: for...in on array gives wrong results

function solution13(arr: number[]): number[] {
  const result: number[] = [];
  for (const val of arr) {        // FIX: changed for...in to for...of
    result.push(val * 2);
  }
  return result;
}

// Explanation:
// for...in gives string KEYS ("0", "1", "2"), not values. Multiplying
// a string key by 2 coerces it to a number: "0"*2=0, "1"*2=2, "2"*2=4 —
// giving [0, 2, 4] instead of [2, 4, 6]. Using for...of gives the actual
// numeric values.
// See README → 8. for...in → Why to avoid on arrays
// See README → 10. Common Gotchas → for...in on arrays

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: FizzBuzz

function solution14(n: number): string[] {
  const result: string[] = [];

  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      result.push("FizzBuzz");
    } else if (i % 3 === 0) {
      result.push("Fizz");
    } else if (i % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(String(i));
    }
  }

  return result;
}

// Explanation:
// Check divisible-by-15 first (both 3 and 5), otherwise we'd match 3 or 5
// individually before checking both. Uses if/else if chain with modulo.
// See README → 1. if / else if / else, 4. for Loop

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Finding an element in nested arrays (using labeled break)

function solution15(matrix: number[][], target: number): [number, number] {
  let result: [number, number] = [-1, -1];

  search: for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === target) {
        result = [i, j];
        break search;
      }
    }
  }

  return result;
}

// Explanation:
// We use a labeled break (`break search`) to exit both loops as soon as
// the target is found. Without the label, break would only exit the inner
// loop, and the outer loop would continue needlessly.
// See README → 9. break and continue → Labeled statements

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Matrix traversal — collect diagonal elements

function solution16(matrix: number[][]): number[] {
  const result: number[] = [];

  for (let i = 0; i < matrix.length; i++) {
    result.push(matrix[i][i]);
  }

  return result;
}

// Explanation:
// The main diagonal of an n×n matrix consists of elements where row === col,
// i.e., matrix[0][0], matrix[1][1], matrix[2][2], etc. A single for loop
// with index i accesses matrix[i][i].
// See README → 4. for Loop

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Convert switch to object lookup

function solution17(code: number): string {
  const statusMap: Record<number, string> = {
    200: "OK",
    201: "Created",
    301: "Moved Permanently",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  };

  return statusMap[code] ?? "Unknown status";
}

// Explanation:
// An object lookup replaces the switch entirely. We index into the object
// with the code. If the key doesn't exist, the result is undefined, and the
// nullish coalescing operator (??) provides the fallback "Unknown status".
// This pattern is cleaner, avoids fall-through bugs, and is easier to maintain.
// See README → 11. Best Practices → Convert switch to object lookup

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Collecting unique values with for...of and a Set

function solution18(arr: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }

  return result;
}

// Explanation:
// We iterate with for...of (which gives values, not keys). A Set tracks
// items we've already seen. On first encounter, we add to both the Set
// and the result array. Duplicates are skipped because seen.has() returns
// true for them.
// See README → 7. for...of

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
console.log(solution11(0));   // "Sunday"
console.log(solution11(3));   // "Wednesday"
console.log(solution11(6));   // "Saturday"
console.log(solution11(7));   // "Unknown day"

console.log("\n=== Exercise 12 ===");
console.log(solution12(5));   // 15
console.log(solution12(1));   // 1
console.log(solution12(10));  // 55

console.log("\n=== Exercise 13 ===");
console.log(solution13([1, 2, 3]));     // [2, 4, 6]
console.log(solution13([10, 20, 30]));  // [20, 40, 60]

console.log("\n=== Exercise 14 ===");
console.log(solution14(15));
console.log(solution14(5));

console.log("\n=== Exercise 15 ===");
const testMatrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
console.log(solution15(testMatrix, 5));   // [1, 1]
console.log(solution15(testMatrix, 9));   // [2, 2]
console.log(solution15(testMatrix, 10));  // [-1, -1]

console.log("\n=== Exercise 16 ===");
console.log(solution16([[1,2,3],[4,5,6],[7,8,9]])); // [1, 5, 9]
console.log(solution16([[1,2],[3,4]]));              // [1, 4]
console.log(solution16([[42]]));                     // [42]

console.log("\n=== Exercise 17 ===");
console.log(solution17(200));  // "OK"
console.log(solution17(404));  // "Not Found"
console.log(solution17(500));  // "Internal Server Error"
console.log(solution17(999));  // "Unknown status"

console.log("\n=== Exercise 18 ===");
console.log(solution18(["a", "b", "a", "c", "b", "d"])); // ["a", "b", "c", "d"]
console.log(solution18(["x", "x", "x"]));                 // ["x"]
console.log(solution18([]));                               // []
