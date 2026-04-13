// ============================================================================
// 05-array-methods: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/02-objects-arrays/05-array-methods/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Default sort behavior (string gotcha)
//
// What does the console.log print?

function exercise1() {
  const nums = [10, 9, 80, 1, 21];
  const result = nums.sort();
  console.log(result);
  console.log(result === nums);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: sort() mutates the original
//
// What does each console.log print?

function exercise2() {
  const original = [3, 1, 2];
  const sorted = original.toSorted((a, b) => a - b);
  console.log(original);
  console.log(sorted);
  console.log(original === sorted);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: reduce without initial value edge cases
//
// What does each expression evaluate to?

function exercise3() {
  console.log([5].reduce((a, b) => a + b));
  console.log([1, 2, 3].reduce((a, b) => a + b));

  try {
    console.log(([] as number[]).reduce((a, b) => a + b));
  } catch (e) {
    console.log("TypeError");
  }

  console.log(([] as number[]).reduce((a, b) => a + b, 0));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: map vs forEach return values
//
// What does each console.log print?

function exercise4() {
  const mapResult = [1, 2, 3].map(n => n * 2);
  const forEachResult = [1, 2, 3].forEach(n => n * 2);

  console.log(mapResult);
  console.log(forEachResult);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: forEach cannot break
//
// What numbers are logged?

function exercise5() {
  const logged: number[] = [];

  [1, 2, 3, 4, 5].forEach(n => {
    if (n === 3) return;
    logged.push(n);
  });

  console.log(logged);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: indexOf vs includes with NaN
//
// What does each console.log print?

function exercise6() {
  const arr = [1, NaN, 3, undefined, null];

  console.log(arr.indexOf(NaN));
  console.log(arr.includes(NaN));
  console.log(arr.indexOf(undefined));
  console.log(arr.includes(undefined));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: filter + map chain
//
// What is the final result?

function exercise7() {
  const words = ["hello", "world", "hi", "hey", "howdy"];

  const result = words
    .filter(w => w.startsWith("h"))
    .map(w => w.toUpperCase())
    .sort();

  console.log(result);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: flatMap behavior
//
// What does each console.log print?

function exercise8() {
  const result1 = [[1, 2], [3, 4], [5]].flatMap(x => x);
  const result2 = [[1, [2]], [3]].flatMap(x => x);
  const result3 = [1, 2, 3].flatMap(n => n % 2 === 0 ? [] : [n, n * 10]);

  console.log(result1);
  console.log(result2);
  console.log(result3);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: some and every with empty arrays
//
// What does each console.log print?

function exercise9() {
  console.log(([] as number[]).some(n => n > 0));
  console.log(([] as number[]).every(n => n > 0));
  console.log([1, 2, 3].some(n => n > 2));
  console.log([1, 2, 3].every(n => n > 0));
  console.log([1, 2, 3].every(n => n > 2));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: slice vs splice
//
// What does each console.log print?

function exercise10() {
  const arr = [0, 1, 2, 3, 4, 5];
  const sliced = arr.slice(1, 4);
  console.log(sliced);
  console.log(arr);

  const removed = arr.splice(1, 2);
  console.log(removed);
  console.log(arr);
}

// YOUR ANSWER:
// Log 1 (sliced):  ???
// Log 2 (arr after slice): ???
// Log 3 (removed): ???
// Log 4 (arr after splice): ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: reduce building an object
//
// What is the result?

function exercise11() {
  const pairs: [string, number][] = [
    ["a", 1],
    ["b", 2],
    ["a", 3],
  ];

  const result = pairs.reduce<Record<string, number>>((acc, [key, val]) => {
    acc[key] = (acc[key] ?? 0) + val;
    return acc;
  }, {});

  console.log(result);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: flat with different depths
//
// What does each console.log print?

function exercise12() {
  const nested = [1, [2, [3, [4, [5]]]]];

  console.log(nested.flat());
  console.log(nested.flat(2));
  console.log(nested.flat(Infinity));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise12();

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: with() and toSpliced() (ES2023)
//
// What does each console.log print?

function exercise13() {
  const arr = ["a", "b", "c", "d"];

  const r1 = arr.with(1, "X");
  console.log(r1);
  console.log(arr);

  const r2 = arr.toSpliced(1, 2, "Y");
  console.log(r2);
  console.log(arr);
}

// YOUR ANSWER:
// Log 1 (r1):  ???
// Log 2 (arr): ???
// Log 3 (r2):  ???
// Log 4 (arr): ???

// Uncomment to test:
// exercise13();

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: unique — remove duplicates
//
// Return a new array with duplicate values removed (preserve first occurrence order).
// Do NOT use Set.

function exercise14<T>(arr: T[]): T[] {
  // YOUR CODE HERE
  return [];
}

// Uncomment to test:
// console.log(exercise14([1, 2, 3, 2, 1, 4])); // [1, 2, 3, 4]
// console.log(exercise14(["a", "b", "a", "c"])); // ["a", "b", "c"]
// console.log(exercise14([])); // []

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: groupBy — group array elements by a key function
//
// Return an object where keys are the result of the key function
// and values are arrays of elements with that key.

function exercise15<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// console.log(exercise15([1, 2, 3, 4, 5, 6], n => n % 2 === 0 ? "even" : "odd"));
// // { odd: [1, 3, 5], even: [2, 4, 6] }
// console.log(exercise15(["apple", "avocado", "banana", "cherry"], w => w[0]));
// // { a: ["apple", "avocado"], b: ["banana"], c: ["cherry"] }

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: chunk — split array into fixed-size groups
//
// Split the array into sub-arrays of the given size.
// The last chunk may be smaller.

function exercise16<T>(arr: T[], size: number): T[][] {
  // YOUR CODE HERE
  return [];
}

// Uncomment to test:
// console.log(exercise16([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]
// console.log(exercise16([1, 2, 3, 4], 2));     // [[1, 2], [3, 4]]
// console.log(exercise16([1, 2, 3], 5));         // [[1, 2, 3]]
// console.log(exercise16([], 3));                // []

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: zip — combine corresponding elements from multiple arrays
//
// Takes two arrays and returns an array of pairs.
// If arrays have different lengths, stop at the shorter one.

function exercise17<A, B>(a: A[], b: B[]): [A, B][] {
  // YOUR CODE HERE
  return [];
}

// Uncomment to test:
// console.log(exercise17([1, 2, 3], ["a", "b", "c"])); // [[1, "a"], [2, "b"], [3, "c"]]
// console.log(exercise17([1, 2], ["a", "b", "c"]));     // [[1, "a"], [2, "b"]]
// console.log(exercise17([], [1, 2]));                   // []

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: partition — split array by predicate
//
// Returns a tuple of two arrays: [passed, failed]
// where `passed` contains elements where predicate is true,
// and `failed` contains the rest.

function exercise18<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  // YOUR CODE HERE
  return [[], []];
}

// Uncomment to test:
// console.log(exercise18([1, 2, 3, 4, 5], n => n % 2 === 0)); // [[2, 4], [1, 3, 5]]
// console.log(exercise18(["cat", "dog", "catfish"], s => s.startsWith("cat")));
// // [["cat", "catfish"], ["dog"]]

// ─── Exercise 19: Implement ─────────────────────────────────────────────────
// Topic: pipe — chain transformations using reduce
//
// Given an initial value and an array of transform functions,
// apply them in sequence (left to right) and return the final result.

function exercise19<T>(initial: T, fns: ((val: T) => T)[]): T {
  // YOUR CODE HERE
  return initial;
}

// Uncomment to test:
// const result19 = exercise19(
//   "  Hello, World!  ",
//   [
//     (s: string) => s.trim(),
//     (s: string) => s.toLowerCase(),
//     (s: string) => s.replace(/\s+/g, "-"),
//   ]
// );
// console.log(result19); // "hello,-world!"

// ─── Exercise 20: Implement ─────────────────────────────────────────────────
// Topic: deepFlat — recursively flatten to arbitrary depth
//
// Implement your own version of Array.flat(Infinity) using reduce.
// The input is a nested array structure. Return a flat number array.

type NestedArray = (number | NestedArray)[];

function exercise20(arr: NestedArray): number[] {
  // YOUR CODE HERE
  return [];
}

// Uncomment to test:
// console.log(exercise20([1, [2, [3, [4]], 5]])); // [1, 2, 3, 4, 5]
// console.log(exercise20([[1, 2], [3, [4, [5, [6]]]]])); // [1, 2, 3, 4, 5, 6]
// console.log(exercise20([])); // []
// console.log(exercise20([1, 2, 3])); // [1, 2, 3]
