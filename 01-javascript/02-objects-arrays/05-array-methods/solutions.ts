// ============================================================================
// 05-array-methods: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Default sort behavior (string gotcha)

function solution1() {
  const nums = [10, 9, 80, 1, 21];
  const result = nums.sort();
  console.log(result);
  console.log(result === nums);
}

// ANSWER:
// Log 1: [1, 10, 21, 80, 9]
// Log 2: true
//
// Explanation:
// Without a comparator, sort() converts elements to strings and sorts
// lexicographically: "1" < "10" < "21" < "80" < "9". Also, sort() mutates
// and returns the SAME array reference, so result === nums is true.
// See README → Section 6: Sorting → Default string sort gotcha

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: sort() mutates vs toSorted()

function solution2() {
  const original = [3, 1, 2];
  const sorted = original.toSorted((a, b) => a - b);
  console.log(original);
  console.log(sorted);
  console.log(original === sorted);
}

// ANSWER:
// Log 1: [3, 1, 2]
// Log 2: [1, 2, 3]
// Log 3: false
//
// Explanation:
// toSorted() (ES2023) returns a NEW sorted array without mutating the original.
// The original stays [3, 1, 2] and the two references are different objects.
// See README → Section 6: Sorting → toSorted

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: reduce without initial value edge cases

function solution3() {
  console.log([5].reduce((a, b) => a + b));
  console.log([1, 2, 3].reduce((a, b) => a + b));

  try {
    console.log(([] as number[]).reduce((a, b) => a + b));
  } catch (e) {
    console.log("TypeError");
  }

  console.log(([] as number[]).reduce((a, b) => a + b, 0));
}

// ANSWER:
// Log 1: 5
// Log 2: 6
// Log 3: TypeError
// Log 4: 0
//
// Explanation:
// - Single-element array with no initial value: returns the element without
//   calling the callback.
// - [1,2,3]: starts with acc=1, curr=2 → 3, then acc=3, curr=3 → 6.
// - Empty array with no initial value: throws TypeError.
// - Empty array WITH initial value: returns the initial value (0).
// See README → Section 3: Reducing → Initial value importance

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: map vs forEach return values

function solution4() {
  const mapResult = [1, 2, 3].map(n => n * 2);
  const forEachResult = [1, 2, 3].forEach(n => n * 2);

  console.log(mapResult);
  console.log(forEachResult);
}

// ANSWER:
// Log 1: [2, 4, 6]
// Log 2: undefined
//
// Explanation:
// map() returns a new array of transformed values. forEach() always returns
// undefined — it's designed for side effects, not producing values.
// See README → Section 10: Iterating → forEach returns undefined

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: forEach cannot break

function solution5() {
  const logged: number[] = [];

  [1, 2, 3, 4, 5].forEach(n => {
    if (n === 3) return;
    logged.push(n);
  });

  console.log(logged);
}

// ANSWER:
// Log 1: [1, 2, 4, 5]
//
// Explanation:
// `return` inside forEach only exits the current callback invocation — it does
// NOT break out of forEach. So n=3 is skipped, but 4 and 5 are still processed.
// See README → Section 14: Common Gotchas → Gotcha 4: forEach can't break

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: indexOf vs includes with NaN

function solution6() {
  const arr = [1, NaN, 3, undefined, null];

  console.log(arr.indexOf(NaN));
  console.log(arr.includes(NaN));
  console.log(arr.indexOf(undefined));
  console.log(arr.includes(undefined));
}

// ANSWER:
// Log 1: -1
// Log 2: true
// Log 3: 3
// Log 4: true
//
// Explanation:
// indexOf uses strict equality (===). Since NaN !== NaN, indexOf can't find it.
// includes uses the SameValueZero algorithm which treats NaN === NaN.
// Both methods find undefined and null normally via their respective algorithms.
// See README → Section 4: Searching → indexOf can't find NaN

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: filter + map chain

function solution7() {
  const words = ["hello", "world", "hi", "hey", "howdy"];

  const result = words
    .filter(w => w.startsWith("h"))
    .map(w => w.toUpperCase())
    .sort();

  console.log(result);
}

// ANSWER:
// Log 1: ["HELLO", "HEY", "HI", "HOWDY"]
//
// Explanation:
// 1. filter: keeps words starting with "h" → ["hello", "hi", "hey", "howdy"]
// 2. map: uppercase → ["HELLO", "HI", "HEY", "HOWDY"]
// 3. sort: default lexicographic sort on strings →
//    "HELLO" < "HEY" < "HI" < "HOWDY" (compared char by char)
// See README → Section 13: Method Chaining

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: flatMap behavior

function solution8() {
  const result1 = [[1, 2], [3, 4], [5]].flatMap(x => x);
  const result2 = [[1, [2]], [3]].flatMap(x => x);
  const result3 = [1, 2, 3].flatMap(n => n % 2 === 0 ? [] : [n, n * 10]);

  console.log(result1);
  console.log(result2);
  console.log(result3);
}

// ANSWER:
// Log 1: [1, 2, 3, 4, 5]
// Log 2: [1, [2], 3]
// Log 3: [1, 10, 3, 30]
//
// Explanation:
// flatMap maps then flattens by exactly ONE level:
// - result1: each sub-array is spread out → [1,2,3,4,5]
// - result2: flattens one level only → [1, [2], 3] (inner [2] stays)
// - result3: even numbers return [] (removed), odd return [n, n*10] (expanded)
// See README → Section 1: Transforming → flatMap

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: some and every with empty arrays

function solution9() {
  console.log(([] as number[]).some(n => n > 0));
  console.log(([] as number[]).every(n => n > 0));
  console.log([1, 2, 3].some(n => n > 2));
  console.log([1, 2, 3].every(n => n > 0));
  console.log([1, 2, 3].every(n => n > 2));
}

// ANSWER:
// Log 1: false
// Log 2: true
// Log 3: true
// Log 4: true
// Log 5: false
//
// Explanation:
// - [].some() → false: no element exists to satisfy the condition
// - [].every() → true: "vacuous truth" — all zero elements satisfy any condition
// - [1,2,3].some(>2) → true: 3 satisfies it
// - [1,2,3].every(>0) → true: all three are positive
// - [1,2,3].every(>2) → false: 1 and 2 fail
// See README → Section 5: Testing → Empty array edge cases

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: slice vs splice

function solution10() {
  const arr = [0, 1, 2, 3, 4, 5];
  const sliced = arr.slice(1, 4);
  console.log(sliced);
  console.log(arr);

  const removed = arr.splice(1, 2);
  console.log(removed);
  console.log(arr);
}

// ANSWER:
// Log 1 (sliced):  [1, 2, 3]
// Log 2 (arr after slice): [0, 1, 2, 3, 4, 5]
// Log 3 (removed): [1, 2]
// Log 4 (arr after splice): [0, 3, 4, 5]
//
// Explanation:
// slice(1, 4) returns elements at indices 1,2,3 without mutating.
// splice(1, 2) removes 2 elements starting at index 1, mutating the array.
// After splice, arr is missing elements 1 and 2.
// See README → Section 9: Slicing & Splicing

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: reduce building an object

function solution11() {
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

// ANSWER:
// Log 1: { a: 4, b: 2 }
//
// Explanation:
// First pair ["a", 1]: acc.a = 0 + 1 = 1
// Second pair ["b", 2]: acc.b = 0 + 2 = 2
// Third pair ["a", 3]: acc.a = 1 + 3 = 4
// See README → Section 3: Reducing → Building objects with reduce

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: flat with different depths

function solution12() {
  const nested = [1, [2, [3, [4, [5]]]]];

  console.log(nested.flat());
  console.log(nested.flat(2));
  console.log(nested.flat(Infinity));
}

// ANSWER:
// Log 1: [1, 2, [3, [4, [5]]]]
// Log 2: [1, 2, 3, [4, [5]]]
// Log 3: [1, 2, 3, 4, 5]
//
// Explanation:
// flat() defaults to depth 1 — flattens one level of nesting.
// flat(2) flattens two levels deep.
// flat(Infinity) recursively flattens all levels.
// See README → Section 7: Flattening

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: with() and toSpliced() (ES2023)

function solution13() {
  const arr = ["a", "b", "c", "d"];

  const r1 = arr.with(1, "X");
  console.log(r1);
  console.log(arr);

  const r2 = arr.toSpliced(1, 2, "Y");
  console.log(r2);
  console.log(arr);
}

// ANSWER:
// Log 1 (r1):  ["a", "X", "c", "d"]
// Log 2 (arr): ["a", "b", "c", "d"]
// Log 3 (r2):  ["a", "Y", "d"]
// Log 4 (arr): ["a", "b", "c", "d"]
//
// Explanation:
// with(1, "X") returns a NEW array with index 1 replaced — original unchanged.
// toSpliced(1, 2, "Y") returns a NEW array with 2 elements removed at index 1
// and "Y" inserted — removes "b" and "c", inserts "Y". Original unchanged.
// See README → Section 12: Immutable Alternatives (ES2023+)

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: unique — remove duplicates

function solution14<T>(arr: T[]): T[] {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// Explanation:
// indexOf returns the FIRST index of a value. If the current index doesn't
// match the first index, it's a duplicate. filter keeps only first occurrences.
// Time complexity: O(n²) — for O(n) performance, use Set or a Map-based approach.
// See README → Section 2: Filtering

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: groupBy — group array elements by key function

function solution15<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

// Explanation:
// Classic reduce pattern for building an object. For each item, compute its key
// via keyFn, initialize the array if needed, then push the item.
// Note: Object.groupBy() exists natively in ES2024, but implementing it
// yourself solidifies the reduce-to-object pattern.
// See README → Section 3: Reducing → Building objects with reduce

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: chunk — split array into fixed-size groups

function solution16<T>(arr: T[], size: number): T[][] {
  return Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size)
  );
}

// Explanation:
// We calculate how many chunks we need: ceil(length / size).
// Array.from with a mapFn creates each chunk using slice, which extracts
// a sub-array from [i*size, i*size+size). Slice handles the last chunk
// gracefully if it's smaller than size.
// See README → Section 11: Converting → Array.from & Section 9: slice

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: zip — combine corresponding elements

function solution17<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length);
  return Array.from({ length }, (_, i) => [a[i], b[i]] as [A, B]);
}

// Explanation:
// Use the shorter length to avoid out-of-bounds access.
// Array.from with a mapFn creates pairs by indexing into both arrays.
// See README → Section 11: Converting → Array.from

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: partition — split array by predicate

function solution18<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  return arr.reduce<[T[], T[]]>(
    (acc, item) => {
      acc[predicate(item) ? 0 : 1].push(item);
      return acc;
    },
    [[], []]
  );
}

// Explanation:
// Single-pass reduce with a tuple accumulator [passed, failed].
// For each item, push to index 0 (passed) if predicate is true,
// index 1 (failed) otherwise. More efficient than two filter calls.
// See README → Section 3: Reducing

// ─── Exercise 19: Implement ─────────────────────────────────────────────────
// Topic: pipe — chain transformations using reduce

function solution19<T>(initial: T, fns: ((val: T) => T)[]): T {
  return fns.reduce((val, fn) => fn(val), initial);
}

// Explanation:
// This is the quintessential reduce use case: the accumulator starts as the
// initial value, and each function in the array transforms it. The result of
// each function becomes the accumulator for the next.
// This is the "pipe" or "compose left-to-right" pattern.
// See README → Section 3: Reducing

// ─── Exercise 20: Implement ─────────────────────────────────────────────────
// Topic: deepFlat — recursively flatten to arbitrary depth

type NestedArray = (number | NestedArray)[];

function solution20(arr: NestedArray): number[] {
  return arr.reduce<number[]>(
    (acc, item) =>
      acc.concat(Array.isArray(item) ? solution20(item) : [item]),
    []
  );
}

// Explanation:
// For each element, check if it's an array. If so, recursively flatten it
// and concat the result. If it's a number, wrap in [item] and concat.
// This mirrors how Array.prototype.flat(Infinity) works internally.
// See README → Section 7: Flattening & Section 3: Reducing

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Default sort (string gotcha) ===");
solution1();

console.log("\n=== Exercise 2: toSorted (immutable) ===");
solution2();

console.log("\n=== Exercise 3: reduce without initial value ===");
solution3();

console.log("\n=== Exercise 4: map vs forEach return ===");
solution4();

console.log("\n=== Exercise 5: forEach cannot break ===");
solution5();

console.log("\n=== Exercise 6: indexOf vs includes (NaN) ===");
solution6();

console.log("\n=== Exercise 7: filter + map chain ===");
solution7();

console.log("\n=== Exercise 8: flatMap behavior ===");
solution8();

console.log("\n=== Exercise 9: some/every empty arrays ===");
solution9();

console.log("\n=== Exercise 10: slice vs splice ===");
solution10();

console.log("\n=== Exercise 11: reduce building object ===");
solution11();

console.log("\n=== Exercise 12: flat depths ===");
solution12();

console.log("\n=== Exercise 13: with() and toSpliced() ===");
solution13();

console.log("\n=== Exercise 14: unique ===");
console.log(solution14([1, 2, 3, 2, 1, 4]));   // [1, 2, 3, 4]
console.log(solution14(["a", "b", "a", "c"]));  // ["a", "b", "c"]
console.log(solution14([]));                      // []

console.log("\n=== Exercise 15: groupBy ===");
console.log(solution15([1, 2, 3, 4, 5, 6], n => n % 2 === 0 ? "even" : "odd"));
// { odd: [1, 3, 5], even: [2, 4, 6] }
console.log(solution15(["apple", "avocado", "banana", "cherry"], w => w[0]));
// { a: ["apple", "avocado"], b: ["banana"], c: ["cherry"] }

console.log("\n=== Exercise 16: chunk ===");
console.log(solution16([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]
console.log(solution16([1, 2, 3, 4], 2));     // [[1, 2], [3, 4]]
console.log(solution16([1, 2, 3], 5));         // [[1, 2, 3]]
console.log(solution16([], 3));                // []

console.log("\n=== Exercise 17: zip ===");
console.log(solution17([1, 2, 3], ["a", "b", "c"])); // [[1,"a"],[2,"b"],[3,"c"]]
console.log(solution17([1, 2], ["a", "b", "c"]));     // [[1,"a"],[2,"b"]]
console.log(solution17([], [1, 2]));                   // []

console.log("\n=== Exercise 18: partition ===");
console.log(solution18([1, 2, 3, 4, 5], n => n % 2 === 0)); // [[2,4],[1,3,5]]
console.log(solution18(["cat", "dog", "catfish"], s => s.startsWith("cat")));
// [["cat","catfish"],["dog"]]

console.log("\n=== Exercise 19: pipe ===");
const result19 = solution19(
  "  Hello, World!  ",
  [
    (s: string) => s.trim(),
    (s: string) => s.toLowerCase(),
    (s: string) => s.replace(/\s+/g, "-"),
  ]
);
console.log(result19); // "hello,-world!"

console.log("\n=== Exercise 20: deepFlat ===");
console.log(solution20([1, [2, [3, [4]], 5]]));         // [1, 2, 3, 4, 5]
console.log(solution20([[1, 2], [3, [4, [5, [6]]]]]));  // [1, 2, 3, 4, 5, 6]
console.log(solution20([]));                              // []
console.log(solution20([1, 2, 3]));                       // [1, 2, 3]
