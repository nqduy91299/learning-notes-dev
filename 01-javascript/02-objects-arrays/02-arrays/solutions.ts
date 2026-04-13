// ============================================================================
// 02-arrays: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Array creation — new Array() single-argument trap

function solution1() {
  const a = new Array(3);
  const b = new Array(3, 4);
  const c = Array.of(3);

  console.log(a.length); // 3
  console.log(a[0]);     // undefined
  console.log(b);        // [3, 4]
  console.log(c);        // [3]
}

// ANSWER:
// a.length: 3
// a[0]:     undefined
// b:        [3, 4]
// c:        [3]
//
// Explanation:
// new Array(3) with a single number creates a sparse array with 3 empty slots
// (not [3]). Accessing any slot returns undefined, but the slots don't actually
// exist (0 in a → false). new Array(3, 4) with multiple args creates [3, 4].
// Array.of(3) always treats arguments as elements, avoiding the single-arg trap.
// See README → Section 1 (new Array(), Array.of())

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: push/pop return values

function solution2() {
  const arr = [10, 20];
  const pushResult = arr.push(30, 40);
  console.log(pushResult); // 4
  console.log(arr);        // [10, 20, 30, 40]

  const popResult = arr.pop();
  console.log(popResult);  // 40
  console.log(arr);        // [10, 20, 30]
}

// ANSWER:
// pushResult: 4
// arr after push: [10, 20, 30, 40]
// popResult: 40
// arr after pop: [10, 20, 30]
//
// Explanation:
// push() returns the new length (not the array). Here we started with 2 elements
// and pushed 2 more, so the new length is 4.
// pop() returns the removed element (the last one), which is 40.
// See README → Section 3 (End operations) & Section 12 (Gotcha 6)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: splice — delete, insert, replace

function solution3() {
  const arr = ["a", "b", "c", "d", "e"];

  const removed = arr.splice(1, 2);
  console.log(removed); // ["b", "c"]
  console.log(arr);     // ["a", "d", "e"]

  arr.splice(1, 0, "x", "y");
  console.log(arr);     // ["a", "x", "y", "d", "e"]
}

// ANSWER:
// removed:          ["b", "c"]
// arr after delete: ["a", "d", "e"]
// arr after insert: ["a", "x", "y", "d", "e"]
//
// Explanation:
// splice(1, 2) starts at index 1, deletes 2 elements ("b", "c"), returns them.
// splice(1, 0, "x", "y") starts at index 1, deletes 0, inserts "x" and "y".
// splice always returns the array of removed elements (empty array if none removed).
// See README → Section 3 (splice)

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: indexOf vs includes with NaN, and reference equality

function solution4() {
  const arr = [1, NaN, 3, undefined, null];

  console.log(arr.indexOf(NaN));      // -1
  console.log(arr.includes(NaN));     // true
  console.log(arr.indexOf(undefined));// 3
  console.log(arr.includes(null));    // true

  const obj = { x: 1 };
  const arr2 = [{ x: 1 }];
  console.log(arr2.includes(obj));    // false

  const arr3 = [obj];
  console.log(arr3.includes(obj));    // true
}

// ANSWER:
// indexOf(NaN):      -1
// includes(NaN):     true
// indexOf(undefined): 3
// includes(null):    true
// arr2.includes(obj): false
// arr3.includes(obj): true
//
// Explanation:
// indexOf uses strict equality (===), and NaN !== NaN, so it can't find NaN.
// includes uses SameValueZero algorithm, which treats NaN as equal to NaN.
// arr2 contains a DIFFERENT object {x:1} — same shape but different reference.
// arr3 contains the exact same obj reference, so includes finds it.
// See README → Section 4 (indexOf vs includes) & Section 12 (Gotcha 2)

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Array comparison — reference vs value

function solution5() {
  console.log([1, 2] === [1, 2]); // false
  console.log([] === []);          // false
  console.log([] == false);        // true

  const a = [1, 2, 3];
  const b = a;
  b.push(4);
  console.log(a.length); // 4
  console.log(a === b);  // true
}

// ANSWER:
// [1,2] === [1,2]: false
// [] === []:       false
// [] == false:     true
// a.length:        4
// a === b:         true
//
// Explanation:
// Each array literal creates a new object in memory, so === compares references
// (different objects → false). [] == false is true because of type coercion:
// [] → "" → 0, false → 0, so 0 == 0 is true.
// a and b point to the same array. Mutating via b also affects a.
// See README → Section 12 (Gotcha 2)

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: delete vs splice — holes in arrays

function solution6() {
  const arr1 = ["a", "b", "c", "d"];
  delete arr1[1];
  console.log(arr1.length); // 4
  console.log(arr1[1]);     // undefined
  console.log(1 in arr1);   // false

  const arr2 = ["a", "b", "c", "d"];
  arr2.splice(1, 1);
  console.log(arr2.length); // 3
  console.log(arr2[1]);     // "c"
}

// ANSWER:
// arr1.length after delete: 4
// arr1[1]:                  undefined
// 1 in arr1:                false
// arr2.length after splice: 3
// arr2[1]:                  "c"
//
// Explanation:
// delete removes the property but doesn't update length or shift elements —
// it creates a "hole". The index 1 no longer exists (1 in arr1 → false),
// but accessing it returns undefined (like any missing property).
// splice properly removes the element, shifts subsequent elements down,
// and updates length.
// See README → Section 12 (Gotcha 4: delete vs splice)

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: forEach can't break — return only skips one iteration

function solution7() {
  const result: number[] = [];

  [1, 2, 3, 4, 5].forEach((n) => {
    if (n === 3) return;
    result.push(n);
  });

  console.log(result); // [1, 2, 4, 5]
}

// ANSWER:
// result: [1, 2, 4, 5]
//
// Explanation:
// return inside forEach's callback only exits that single iteration — it acts
// like "continue", not "break". So n=3 is skipped, but 4 and 5 still run.
// forEach has no mechanism for early termination. Use for...of if you need break.
// See README → Section 6 (forEach — why forEach can't break)

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Sparse arrays — new Array(n) and map behavior

function solution8() {
  const a = new Array(3);
  console.log(a.length); // 3
  console.log(0 in a);   // false

  const b = a.map((_, i) => i);
  console.log(b);        // [empty × 3]

  const c = Array.from({ length: 3 }, (_, i) => i);
  console.log(c);        // [0, 1, 2]
}

// ANSWER:
// a.length:  3
// 0 in a:    false
// b:         [empty × 3]  (sparse — map skips empty slots)
// c:         [0, 1, 2]
//
// Explanation:
// new Array(3) creates a sparse array with no actual elements — the indices
// don't exist (0 in a → false). map() skips empty slots entirely, so b is
// also sparse. Array.from() treats the length property and creates real
// undefined entries, which the callback can transform to 0, 1, 2.
// See README → Section 12 (Gotcha 5: new Array(n) creates sparse)

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Multidimensional arrays — fill() reference trap

function solution9() {
  const grid = Array(3).fill([0, 0]);
  grid[0][1] = 99;

  console.log(grid[0]);             // [0, 99]
  console.log(grid[1]);             // [0, 99]
  console.log(grid[0] === grid[1]); // true
}

// ANSWER:
// grid[0]: [0, 99]
// grid[1]: [0, 99]
// grid[0] === grid[1]: true
//
// Explanation:
// fill([0, 0]) fills all 3 slots with the SAME array reference.
// Modifying grid[0][1] also affects grid[1][1] and grid[2][1] because they
// all point to the same inner array. Use Array.from() with a callback to
// create independent inner arrays.
// See README → Section 7 (Warning about Array(3).fill([]))

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: at() negative indexing and length auto-update

function solution10() {
  const arr = ["a", "b", "c"];

  console.log(arr.at(-1));  // "c"
  console.log(arr.at(-3));  // "a"
  console.log(arr[-1]);     // undefined

  arr[10] = "z";
  console.log(arr.length);  // 11
}

// ANSWER:
// at(-1):     "c"
// at(-3):     "a"
// arr[-1]:    undefined
// arr.length: 11
//
// Explanation:
// at() supports negative indices: at(-1) = at(length - 1) = at(2) = "c".
// Bracket notation with negative numbers doesn't work — arr[-1] looks for a
// property named "-1", which doesn't exist → undefined.
// Setting arr[10] = "z" creates a sparse array. length auto-updates to
// highest_index + 1 = 11, with holes at indices 3-9.
// See README → Section 2 (at(), length) & Section 10 (length is auto-updated)

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Removing elements — delete creates holes

function removeAtIndex(arr: string[], index: number): string[] {
  arr.splice(index, 1);
  return arr;
}

// Explanation:
// delete removes the property but doesn't shift elements or update length,
// leaving a hole. splice(index, 1) properly removes the element, shifts
// subsequent elements down, and decrements length by 1.
// See README → Section 12 (Gotcha 4: delete vs splice)

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Generating a filled 2D array without the reference trap

function createGrid(rows: number, cols: number, fill: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

// Explanation:
// Array(rows).fill(Array(cols).fill(fill)) creates ONE inner array and fills
// all rows with the SAME reference. Array.from() with a callback invokes the
// arrow function for each row, creating a NEW inner array each time.
// See README → Section 7 (Creating dynamically / Warning about fill)

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Array.from — generate a range

function range(start: number, end: number, step = 1): number[] {
  const length = Math.floor((end - start) / step) + 1;
  return Array.from({ length }, (_, i) => start + i * step);
}

// Explanation:
// We calculate how many elements fit in the range, then use Array.from with
// a mapping function to generate each value. The formula start + i * step
// produces values: start, start+step, start+2*step, ...
// Array.from({ length: n }, fn) creates an array of n elements using fn.
// See README → Section 1 (Array.from) & Section 13 (Best Practice 9)

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: push/pop/splice — rotate array

function rotate<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return arr;
  const steps = n % arr.length;
  if (steps === 0) return arr;

  const tail = arr.splice(arr.length - steps, steps);
  arr.unshift(...tail);
  return arr;
}

// Explanation:
// Rotating right by n means the last n elements move to the front.
// n % arr.length handles cases where n > arr.length (e.g., rotating [1,2,3]
// by 5 is the same as rotating by 2).
// splice removes the last `steps` elements, then unshift prepends them.
// This mutates in place and returns the same array reference.
// See README → Section 3 (splice, unshift) & Section 11 (Performance)

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: find/findIndex — first duplicate

function firstDuplicate(arr: number[]): number | undefined {
  for (let i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) !== i) {
      return arr[i];
    }
  }
  return undefined;
}

// Explanation:
// For each element, indexOf returns the FIRST occurrence of that value.
// If indexOf(arr[i]) !== i, then arr[i] appeared earlier — it's a duplicate.
// We return the first such element found during our left-to-right scan.
// Time complexity: O(n²) due to indexOf inside a loop. A Set-based approach
// would be O(n) — covered in 02-05 Array Methods.
// See README → Section 4 (indexOf)

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: splice — remove all occurrences in place

function removeAll<T>(arr: T[], value: T): T[] {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

// Explanation:
// We iterate backwards to avoid index-shifting issues. When we splice at
// index i, elements after i shift left — but since we're moving left too,
// we've already processed those elements. Iterating forward would skip
// elements after a splice.
// Returns the same array reference (mutated in place).
// See README → Section 3 (splice) & Section 11 (Performance — splice is O(n))

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: split/join — simple CSV parser

function parseCSV(csv: string): string[][] {
  if (csv.trim() === "") return [];

  return csv
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.split(",").map((cell) => cell.trim()));
}

// Explanation:
// 1. Split the string by newlines to get rows.
// 2. Filter out empty lines (after trimming whitespace).
// 3. For each row, split by comma to get cells, then trim each cell.
// This uses the split/join string↔array conversion pattern.
// See README → Section 9 (split, join)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Multidimensional arrays — flatten one level

function flatten(arr: unknown[]): unknown[] {
  const result: unknown[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}

// Explanation:
// For each element: if it's an array, spread its elements into result
// (flattening one level). If it's not an array, push it directly.
// Array.isArray() is used for the type check (typeof would return "object").
// This only flattens one level — [3, [4, 5]] becomes 3, [4, 5] (not 3, 4, 5).
// See README → Section 5 (Array.isArray) & Section 7 (Multidimensional arrays)

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
console.log(removeAtIndex(["a", "b", "c", "d"], 1)); // ["a", "c", "d"]
console.log(removeAtIndex(["x", "y", "z"], 0));       // ["y", "z"]

console.log("\n=== Exercise 12 ===");
const grid12 = createGrid(3, 3, 0);
grid12[0][0] = 99;
console.log(grid12[0]); // [99, 0, 0]
console.log(grid12[1]); // [0, 0, 0]

console.log("\n=== Exercise 13 ===");
console.log(range(1, 5));        // [1, 2, 3, 4, 5]
console.log(range(0, 10, 3));    // [0, 3, 6, 9]
console.log(range(1, 10, 2));    // [1, 3, 5, 7, 9]
console.log(range(5, 5));        // [5]

console.log("\n=== Exercise 14 ===");
console.log(rotate([1, 2, 3, 4, 5], 2));   // [4, 5, 1, 2, 3]
console.log(rotate([1, 2, 3], 0));          // [1, 2, 3]
console.log(rotate([1, 2, 3], 3));          // [1, 2, 3]
console.log(rotate([1, 2, 3], 5));          // [2, 3, 1]

console.log("\n=== Exercise 15 ===");
console.log(firstDuplicate([2, 1, 3, 5, 3, 2]));  // 3
console.log(firstDuplicate([1, 2, 3, 4]));         // undefined
console.log(firstDuplicate([1, 1]));                // 1
console.log(firstDuplicate([]));                    // undefined

console.log("\n=== Exercise 16 ===");
const a16 = [1, 2, 3, 2, 4, 2, 5];
console.log(removeAll(a16, 2));                    // [1, 3, 4, 5]
console.log(a16);                                  // [1, 3, 4, 5]
console.log(removeAll(["a", "b", "a"], "a"));      // ["b"]
console.log(removeAll([1, 2, 3], 99));             // [1, 2, 3]

console.log("\n=== Exercise 17 ===");
console.log(parseCSV("name,age,city\nAlice,30,NYC\nBob,25,LA"));
// [["name", "age", "city"], ["Alice", "30", "NYC"], ["Bob", "25", "LA"]]
console.log(parseCSV(" a , b \n c , d "));
// [["a", "b"], ["c", "d"]]
console.log(parseCSV(""));
// []

console.log("\n=== Exercise 18 ===");
console.log(flatten([[1, 2], [3, 4], [5]]));         // [1, 2, 3, 4, 5]
console.log(flatten([[1, 2], [3, [4, 5]], 6]));       // [1, 2, 3, [4, 5], 6]
console.log(flatten([]));                             // []
console.log(flatten([1, 2, 3]));                      // [1, 2, 3]
console.log(flatten([[], [], []]));                   // []
