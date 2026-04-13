// ============================================================================
// 02-arrays: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/02-objects-arrays/02-arrays/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Array creation — new Array() single-argument trap
//
// What does each expression evaluate to?

function exercise1() {
  const a = new Array(3);
  const b = new Array(3, 4);
  const c = Array.of(3);

  console.log(a.length);
  console.log(a[0]);
  console.log(b);
  console.log(c);
}

// YOUR ANSWER:
// a.length: ???
// a[0]:     ???
// b:        ???
// c:        ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: push/pop return values
//
// What does each console.log print?

function exercise2() {
  const arr = [10, 20];
  const pushResult = arr.push(30, 40);
  console.log(pushResult);
  console.log(arr);

  const popResult = arr.pop();
  console.log(popResult);
  console.log(arr);
}

// YOUR ANSWER:
// pushResult: ???
// arr after push: ???
// popResult: ???
// arr after pop: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: splice — delete, insert, replace
//
// What is arr after each splice call?

function exercise3() {
  const arr = ["a", "b", "c", "d", "e"];

  const removed = arr.splice(1, 2);
  console.log(removed);
  console.log(arr);

  arr.splice(1, 0, "x", "y");
  console.log(arr);
}

// YOUR ANSWER:
// removed:          ???
// arr after delete: ???
// arr after insert: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: indexOf vs includes with NaN, and reference equality
//
// What does each expression return?

function exercise4() {
  const arr = [1, NaN, 3, undefined, null];

  console.log(arr.indexOf(NaN));
  console.log(arr.includes(NaN));
  console.log(arr.indexOf(undefined));
  console.log(arr.includes(null));

  const obj = { x: 1 };
  const arr2 = [{ x: 1 }];
  console.log(arr2.includes(obj));

  const arr3 = [obj];
  console.log(arr3.includes(obj));
}

// YOUR ANSWER:
// indexOf(NaN):      ???
// includes(NaN):     ???
// indexOf(undefined): ???
// includes(null):    ???
// arr2.includes(obj): ???
// arr3.includes(obj): ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Array comparison — reference vs value
//
// What does each comparison evaluate to?

function exercise5() {
  console.log([1, 2] === [1, 2]);
  console.log([] === []);
  console.log([] == false);

  const a = [1, 2, 3];
  const b = a;
  b.push(4);
  console.log(a.length);
  console.log(a === b);
}

// YOUR ANSWER:
// [1,2] === [1,2]: ???
// [] === []:       ???
// [] == false:     ???
// a.length:        ???
// a === b:         ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: delete vs splice — holes in arrays
//
// What does the array look like after delete? After splice?

function exercise6() {
  const arr1 = ["a", "b", "c", "d"];
  delete arr1[1];
  console.log(arr1.length);
  console.log(arr1[1]);
  console.log(1 in arr1);

  const arr2 = ["a", "b", "c", "d"];
  arr2.splice(1, 1);
  console.log(arr2.length);
  console.log(arr2[1]);
}

// YOUR ANSWER:
// arr1.length after delete: ???
// arr1[1]:                  ???
// 1 in arr1:                ???
// arr2.length after splice: ???
// arr2[1]:                  ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: forEach can't break — return only skips one iteration
//
// What gets logged?

function exercise7() {
  const result: number[] = [];

  [1, 2, 3, 4, 5].forEach((n) => {
    if (n === 3) return;
    result.push(n);
  });

  console.log(result);
}

// YOUR ANSWER:
// result: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Sparse arrays — new Array(n) and map behavior
//
// What does each expression produce?

function exercise8() {
  const a = new Array(3);
  console.log(a.length);
  console.log(0 in a);

  const b = a.map((_, i) => i);
  console.log(b);

  const c = Array.from({ length: 3 }, (_, i) => i);
  console.log(c);
}

// YOUR ANSWER:
// a.length:  ???
// 0 in a:    ???
// b:         ???
// c:         ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Multidimensional arrays — fill() reference trap
//
// Are the inner arrays independent?

function exercise9() {
  const grid = Array(3).fill([0, 0]);
  grid[0][1] = 99;

  console.log(grid[0]);
  console.log(grid[1]);
  console.log(grid[0] === grid[1]);
}

// YOUR ANSWER:
// grid[0]: ???
// grid[1]: ???
// grid[0] === grid[1]: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: at() negative indexing and length auto-update
//
// What does each line log?

function exercise10() {
  const arr = ["a", "b", "c"];

  console.log(arr.at(-1));
  console.log(arr.at(-3));
  console.log(arr[-1]);

  arr[10] = "z";
  console.log(arr.length);
}

// YOUR ANSWER:
// at(-1):     ???
// at(-3):     ???
// arr[-1]:    ???
// arr.length: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Removing elements — delete creates holes
//
// This function should remove the element at the given index and return
// the modified array with no holes. Currently it uses `delete`.

function removeAtIndex(arr: string[], index: number): string[] {
  delete arr[index];
  return arr;
}

// Uncomment to test:
// console.log(removeAtIndex(["a", "b", "c", "d"], 1)); // Expected: ["a", "c", "d"]
// console.log(removeAtIndex(["x", "y", "z"], 0));       // Expected: ["y", "z"]

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Generating a filled 2D array without the reference trap
//
// This function should create a rows×cols grid filled with a value.
// Currently all rows are the same reference.

function createGrid(rows: number, cols: number, fill: number): number[][] {
  return Array(rows).fill(Array(cols).fill(fill));
}

// Uncomment to test:
// const grid = createGrid(3, 3, 0);
// grid[0][0] = 99;
// console.log(grid[0]); // Expected: [99, 0, 0]
// console.log(grid[1]); // Expected: [0, 0, 0]  (independent row)

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Array.from — generate a range
//
// Return an array of numbers from `start` to `end` (inclusive) with the given step.
// Example: range(1, 10, 2) → [1, 3, 5, 7, 9]

function range(start: number, end: number, step = 1): number[] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(range(1, 5));        // Expected: [1, 2, 3, 4, 5]
// console.log(range(0, 10, 3));    // Expected: [0, 3, 6, 9]
// console.log(range(1, 10, 2));    // Expected: [1, 3, 5, 7, 9]
// console.log(range(5, 5));        // Expected: [5]

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: push/pop/splice — rotate array
//
// Rotate the array to the right by `n` positions (in place).
// Example: rotate([1, 2, 3, 4, 5], 2) → [4, 5, 1, 2, 3]
// Must handle n > arr.length and n = 0.

function rotate<T>(arr: T[], n: number): T[] {
  // YOUR CODE HERE

  return arr;
}

// Uncomment to test:
// console.log(rotate([1, 2, 3, 4, 5], 2));   // Expected: [4, 5, 1, 2, 3]
// console.log(rotate([1, 2, 3], 0));          // Expected: [1, 2, 3]
// console.log(rotate([1, 2, 3], 3));          // Expected: [1, 2, 3]
// console.log(rotate([1, 2, 3], 5));          // Expected: [2, 3, 1]

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: find/findIndex — first duplicate
//
// Return the first element that appears more than once in the array.
// Return undefined if there are no duplicates.
// Use indexOf/findIndex — do NOT use Map/Set (that's covered in array methods).

function firstDuplicate(arr: number[]): number | undefined {
  // YOUR CODE HERE

  return undefined;
}

// Uncomment to test:
// console.log(firstDuplicate([2, 1, 3, 5, 3, 2]));  // Expected: 3
// console.log(firstDuplicate([1, 2, 3, 4]));         // Expected: undefined
// console.log(firstDuplicate([1, 1]));                // Expected: 1
// console.log(firstDuplicate([]));                    // Expected: undefined

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: splice — remove all occurrences in place
//
// Remove all occurrences of `value` from the array in place (mutate it).
// Return the same array reference.

function removeAll<T>(arr: T[], value: T): T[] {
  // YOUR CODE HERE

  return arr;
}

// Uncomment to test:
// const a16 = [1, 2, 3, 2, 4, 2, 5];
// console.log(removeAll(a16, 2));                    // Expected: [1, 3, 4, 5]
// console.log(a16);                                  // Expected: [1, 3, 4, 5] (same ref)
// console.log(removeAll(["a", "b", "a"], "a"));      // Expected: ["b"]
// console.log(removeAll([1, 2, 3], 99));             // Expected: [1, 2, 3]

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: split/join — simple CSV parser
//
// Parse a CSV string into a 2D array of strings.
// Each line is separated by "\n", each value by ",".
// Trim whitespace from each cell. Skip empty lines.

function parseCSV(csv: string): string[][] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(parseCSV("name,age,city\nAlice,30,NYC\nBob,25,LA"));
// Expected: [["name", "age", "city"], ["Alice", "30", "NYC"], ["Bob", "25", "LA"]]
// console.log(parseCSV(" a , b \n c , d "));
// Expected: [["a", "b"], ["c", "d"]]
// console.log(parseCSV(""));
// Expected: []

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Multidimensional arrays — flatten one level
//
// Flatten a nested array by one level. Do NOT use Array.prototype.flat().
// Use basic iteration (for/for...of) and push/spread.
// Example: flatten([[1, 2], [3, [4, 5]], 6]) → [1, 2, 3, [4, 5], 6]

function flatten(arr: unknown[]): unknown[] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(flatten([[1, 2], [3, 4], [5]]));         // Expected: [1, 2, 3, 4, 5]
// console.log(flatten([[1, 2], [3, [4, 5]], 6]));       // Expected: [1, 2, 3, [4, 5], 6]
// console.log(flatten([]));                             // Expected: []
// console.log(flatten([1, 2, 3]));                      // Expected: [1, 2, 3]
// console.log(flatten([[], [], []]));                   // Expected: []
