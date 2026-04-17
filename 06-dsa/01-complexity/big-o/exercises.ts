/**
 * Big-O Notation — Exercises
 *
 * 18 exercises covering complexity analysis, optimization, and implementation
 * with specific time/space constraints.
 *
 * Run: npx tsx exercises.ts
 */

// ============================================================================
// EXERCISE 1: Predict the Complexity
// ============================================================================
// What is the time complexity of each function?
// Write your answers as comments.

function mystery1(n: number): number {
  let count = 0;
  for (let i = 1; i < n; i *= 2) {
    count++;
  }
  return count;
}
// Your answer: O(???)

function mystery2(n: number): number {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      count++;
    }
  }
  return count;
}
// Your answer: O(???)

function mystery3(n: number): number {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 100; j++) {
      count++;
    }
  }
  return count;
}
// Your answer: O(???)

// ============================================================================
// EXERCISE 2: Predict the Complexity — Recursion
// ============================================================================
// What is the time complexity of each recursive function?

function mysteryRec1(n: number): number {
  if (n <= 1) return 1;
  return mysteryRec1(n - 1) + mysteryRec1(n - 1);
}
// Your answer: O(???)

function mysteryRec2(n: number): number {
  if (n <= 1) return 1;
  return mysteryRec2(Math.floor(n / 2)) + 1;
}
// Your answer: O(???)

function mysteryRec3(n: number): number {
  if (n <= 1) return 1;
  return mysteryRec3(n - 1) + n;
}
// Your answer: O(???)

// ============================================================================
// EXERCISE 3: What's the Complexity of This Real Code?
// ============================================================================
// Analyze the following function that processes a 2D matrix.

function processMatrix(matrix: number[][]): number {
  const n = matrix.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        sum += matrix[i][j] * matrix[j][k];
      }
    }
  }
  return sum;
}
// Time complexity: O(???)
// Space complexity: O(???)

// ============================================================================
// EXERCISE 4: Implement O(n) — Two Sum (Unsorted)
// ============================================================================
// Given an array of numbers and a target sum, return the indices of two numbers
// that add up to the target. Must be O(n) time.
// Return [-1, -1] if no pair exists.

function twoSumLinear(nums: number[], target: number): [number, number] {
  // TODO: Implement with O(n) time complexity
  // Hint: Use a hash map
  return [-1, -1];
}

// ============================================================================
// EXERCISE 5: Implement O(log n) — Find Rotation Point
// ============================================================================
// Given a sorted array that has been rotated (e.g., [4,5,6,7,1,2,3]),
// find the index of the minimum element in O(log n) time.
// The array has no duplicates.

function findRotationPoint(arr: number[]): number {
  // TODO: Implement with O(log n) time complexity
  // Hint: Modified binary search
  return 0;
}

// ============================================================================
// EXERCISE 6: Implement O(n) — Maximum Subarray Sum (Kadane's Algorithm)
// ============================================================================
// Find the contiguous subarray with the largest sum.
// Return the sum. The array will have at least one element.

function maxSubarraySum(arr: number[]): number {
  // TODO: Implement with O(n) time and O(1) space
  return 0;
}

// ============================================================================
// EXERCISE 7: Fix from O(n²) to O(n) — Contains Duplicate
// ============================================================================
// The following function checks if an array contains duplicates.
// It currently runs in O(n²). Fix it to run in O(n).

function containsDuplicate(arr: number[]): boolean {
  // CURRENT O(n²) IMPLEMENTATION — FIX THIS:
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

// ============================================================================
// EXERCISE 8: Fix from O(n²) to O(n log n) — Count Inversions
// ============================================================================
// An inversion is a pair (i, j) where i < j but arr[i] > arr[j].
// The brute-force approach is O(n²). Implement in O(n log n).
// Hint: Modified merge sort.

function countInversions(arr: number[]): number {
  // TODO: Implement with O(n log n) time
  // Hint: During merge sort, count inversions when merging
  return 0;
}

// ============================================================================
// EXERCISE 9: Implement O(1) Space — Dutch National Flag
// ============================================================================
// Given an array containing only 0s, 1s, and 2s, sort it in-place.
// Must be O(n) time and O(1) space. Do not use Array.sort().

function dutchNationalFlag(arr: number[]): void {
  // TODO: Implement with O(n) time and O(1) space
  // Hint: Three-pointer approach (low, mid, high)
}

// ============================================================================
// EXERCISE 10: Compare Algorithms — String Matching
// ============================================================================
// Implement two versions of substring search:
// Version A: Naive approach
// Version B: Optimized approach using a rolling hash or early termination
// Both should return the starting index of the first occurrence, or -1.

function naiveSubstringSearch(text: string, pattern: string): number {
  // TODO: Implement naive O(n*m) approach
  return -1;
}

function optimizedSubstringSearch(text: string, pattern: string): number {
  // TODO: Implement with better average-case performance
  // Hint: You can use a rolling hash (Rabin-Karp) or
  //       add an early-exit check on first/last character
  return -1;
}

// ============================================================================
// EXERCISE 11: Predict Space Complexity
// ============================================================================
// What is the SPACE complexity of each function?

function spaceEx1(n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(i * i);
  }
  return result;
}
// Space complexity: O(???)

function spaceEx2(n: number): number {
  if (n <= 0) return 0;
  return n + spaceEx2(n - 1);
}
// Space complexity: O(???) (consider the call stack)

function spaceEx3(n: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix.push(new Array(n).fill(0));
  }
  return matrix;
}
// Space complexity: O(???)

// ============================================================================
// EXERCISE 12: Implement O(n) — Merge Two Sorted Arrays
// ============================================================================
// Merge two sorted arrays into one sorted array.
// Must be O(n + m) time where n and m are the lengths of the arrays.

function mergeSortedArrays(a: number[], b: number[]): number[] {
  // TODO: Implement with O(n + m) time
  return [];
}

// ============================================================================
// EXERCISE 13: Fix from O(n³) to O(n²) — Three Sum Check
// ============================================================================
// Given an array, determine if any three elements sum to zero.
// The naive approach uses three nested loops (O(n³)).
// Optimize to O(n²).

function threeSumExists(arr: number[]): boolean {
  // TODO: Implement with O(n²) time
  // Hint: Sort first, then use two pointers for each fixed element
  return false;
}

// ============================================================================
// EXERCISE 14: Implement O(n) — First Unique Character
// ============================================================================
// Given a string, find the index of the first non-repeating character.
// Return -1 if all characters repeat. Must be O(n) time.

function firstUniqueChar(s: string): number {
  // TODO: Implement with O(n) time
  return -1;
}

// ============================================================================
// EXERCISE 15: Analyze and Optimize — Flatten Nested Array
// ============================================================================
// The following function flattens a nested array structure.
// What is its time complexity? Can you identify the hidden cost?

type NestedArray = (number | NestedArray)[];

function flattenNaive(arr: NestedArray): number[] {
  let result: number[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result = result.concat(flattenNaive(item as NestedArray));
    } else {
      result.push(item);
    }
  }
  return result;
}
// What is the hidden cost? Answer: ???
// Hint: Think about what concat does.

// TODO: Write an optimized version
function flattenOptimized(arr: NestedArray): number[] {
  // Hint: Use a helper with a shared result array
  return [];
}

// ============================================================================
// EXERCISE 16: Implement O(n) — Product of Array Except Self
// ============================================================================
// Given an array, return a new array where each element is the product of all
// elements except the one at that index.
// Must be O(n) time. Do NOT use division.

function productExceptSelf(nums: number[]): number[] {
  // TODO: Implement with O(n) time
  // Hint: Use prefix and suffix products
  return [];
}

// ============================================================================
// EXERCISE 17: Amortized Analysis — Design a MinStack
// ============================================================================
// Implement a stack that supports push, pop, and getMin — all in O(1) time.
// getMin returns the minimum element currently in the stack.

class MinStack {
  // TODO: Choose your internal data structures

  push(_val: number): void {
    // TODO
  }

  pop(): number | undefined {
    // TODO
    return undefined;
  }

  getMin(): number | undefined {
    // TODO: Must be O(1)
    return undefined;
  }

  isEmpty(): boolean {
    // TODO
    return true;
  }
}

// ============================================================================
// EXERCISE 18: Master Theorem — Predict Complexity of Recurrences
// ============================================================================
// For each recurrence relation, predict the time complexity using the
// Master Theorem: T(n) = a * T(n/b) + O(n^d)
//
// Case 1: d < log_b(a) → O(n^(log_b(a)))
// Case 2: d = log_b(a) → O(n^d * log n)
// Case 3: d > log_b(a) → O(n^d)

// a) T(n) = 2T(n/2) + O(n)       → a=2, b=2, d=1 → Answer: ???
// b) T(n) = 4T(n/2) + O(n)       → a=4, b=2, d=1 → Answer: ???
// c) T(n) = T(n/2) + O(n)        → a=1, b=2, d=1 → Answer: ???
// d) T(n) = 2T(n/2) + O(n²)      → a=2, b=2, d=2 → Answer: ???
// e) T(n) = 8T(n/2) + O(n²)      → a=8, b=2, d=2 → Answer: ???
// f) T(n) = 3T(n/3) + O(n)       → a=3, b=3, d=1 → Answer: ???

// ============================================================================
// TEST AREA (uncomment to test your solutions)
// ============================================================================

// console.log("=== Exercise 1: Predict Complexity ===");
// console.log("mystery1(16):", mystery1(16));
// console.log("mystery2(5):", mystery2(5));
// console.log("mystery3(5):", mystery3(5));

// console.log("\n=== Exercise 2: Recursive Complexity ===");
// console.log("mysteryRec1(5):", mysteryRec1(5));
// console.log("mysteryRec2(16):", mysteryRec2(16));
// console.log("mysteryRec3(5):", mysteryRec3(5));

// console.log("\n=== Exercise 4: Two Sum Linear ===");
// console.log(twoSumLinear([2, 7, 11, 15], 9)); // [0, 1]
// console.log(twoSumLinear([3, 3], 6));          // [0, 1]
// console.log(twoSumLinear([1, 2, 3], 7));       // [-1, -1]

// console.log("\n=== Exercise 5: Find Rotation Point ===");
// console.log(findRotationPoint([4, 5, 6, 7, 1, 2, 3])); // 4
// console.log(findRotationPoint([1, 2, 3, 4, 5]));        // 0
// console.log(findRotationPoint([2, 1]));                  // 1

// console.log("\n=== Exercise 6: Max Subarray Sum ===");
// console.log(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
// console.log(maxSubarraySum([1]));                                // 1
// console.log(maxSubarraySum([-1, -2, -3]));                      // -1

// console.log("\n=== Exercise 7: Contains Duplicate ===");
// console.log(containsDuplicate([1, 2, 3, 1])); // true
// console.log(containsDuplicate([1, 2, 3, 4])); // false

// console.log("\n=== Exercise 8: Count Inversions ===");
// console.log(countInversions([2, 4, 1, 3, 5])); // 3
// console.log(countInversions([5, 4, 3, 2, 1])); // 10
// console.log(countInversions([1, 2, 3]));        // 0

// console.log("\n=== Exercise 9: Dutch National Flag ===");
// const dnf1 = [2, 0, 1, 2, 0, 1];
// dutchNationalFlag(dnf1);
// console.log(dnf1); // [0, 0, 1, 1, 2, 2]

// console.log("\n=== Exercise 10: Substring Search ===");
// console.log(naiveSubstringSearch("hello world", "world")); // 6
// console.log(optimizedSubstringSearch("hello world", "world")); // 6

// console.log("\n=== Exercise 12: Merge Sorted Arrays ===");
// console.log(mergeSortedArrays([1, 3, 5], [2, 4, 6])); // [1,2,3,4,5,6]

// console.log("\n=== Exercise 13: Three Sum Exists ===");
// console.log(threeSumExists([-1, 0, 1, 2]));  // true (-1+0+1=0)
// console.log(threeSumExists([1, 2, 3, 4]));    // false

// console.log("\n=== Exercise 14: First Unique Char ===");
// console.log(firstUniqueChar("leetcode"));    // 0
// console.log(firstUniqueChar("aabb"));        // -1

// console.log("\n=== Exercise 15: Flatten ===");
// console.log(flattenOptimized([1, [2, [3, 4]], 5])); // [1,2,3,4,5]

// console.log("\n=== Exercise 16: Product Except Self ===");
// console.log(productExceptSelf([1, 2, 3, 4])); // [24,12,8,6]

// console.log("\n=== Exercise 17: MinStack ===");
// const ms = new MinStack();
// ms.push(5); ms.push(2); ms.push(7); ms.push(1);
// console.log(ms.getMin()); // 1
// ms.pop();
// console.log(ms.getMin()); // 2
