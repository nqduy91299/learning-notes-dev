/**
 * Space-Time Tradeoffs — Exercises
 *
 * 12 exercises exploring brute-force vs optimized approaches,
 * memoization, and identifying tradeoffs.
 *
 * Run: npx tsx exercises.ts
 */

// ============================================================================
// EXERCISE 1: Two Approaches — Find Pair with Target Difference
// ============================================================================
// Given a sorted array of distinct integers and a target difference,
// find if any pair (a, b) exists where b - a = target.
//
// Implement TWO versions:
// A) Brute force — O(n²) time, O(1) space
// B) Optimized — O(n) time, O(n) space (hash set)

function pairDiffBrute(arr: number[], target: number): [number, number] | null {
  // TODO: O(n²) time, O(1) space
  return null;
}

function pairDiffOptimized(arr: number[], target: number): [number, number] | null {
  // TODO: O(n) time, O(n) space — use a Set
  return null;
}

// ============================================================================
// EXERCISE 2: Memoization — Climbing Stairs
// ============================================================================
// You can climb 1 or 2 stairs at a time. How many distinct ways to reach step n?
//
// A) Recursive without memoization
// B) With memoization

function climbStairsNaive(n: number): number {
  // TODO: Recursive O(2^n) approach
  return 0;
}

function climbStairsMemo(n: number, cache?: Map<number, number>): number {
  // TODO: Memoized O(n) time, O(n) space approach
  return 0;
}

// ============================================================================
// EXERCISE 3: Precomputation — Range Sum Queries
// ============================================================================
// Given an array, answer multiple range sum queries efficiently.
//
// A) Naive: compute each query by iterating
// B) Optimized: precompute prefix sums

function rangeSumNaive(arr: number[], queries: [number, number][]): number[] {
  // TODO: O(n) per query, O(1) extra space
  return [];
}

function rangeSumOptimized(arr: number[], queries: [number, number][]): number[] {
  // TODO: O(n) precomputation, O(1) per query, O(n) extra space
  return [];
}

// ============================================================================
// EXERCISE 4: In-Place vs Extra Space — Remove Duplicates from Sorted Array
// ============================================================================
// A) Using extra space: return new array with duplicates removed
// B) In-place: modify the array and return the new length

function removeDupsExtraSpace(arr: number[]): number[] {
  // TODO: O(n) time, O(n) space
  return [];
}

function removeDupsInPlace(arr: number[]): number {
  // TODO: O(n) time, O(1) space — modify arr in place, return new length
  return 0;
}

// ============================================================================
// EXERCISE 5: Hash Map Tradeoff — Anagram Grouping
// ============================================================================
// Given an array of strings, group anagrams together.
//
// A) Brute force: for each pair, check if they're anagrams → O(n² * m)
// B) Optimized: use sorted string as hash key → O(n * m log m)
//
// Only implement the optimized version.

function groupAnagrams(strs: string[]): string[][] {
  // TODO: O(n * m log m) time, O(n * m) space
  // where n = number of strings, m = max string length
  return [];
}

// ============================================================================
// EXERCISE 6: Memoization — Minimum Cost Path
// ============================================================================
// Given an m×n grid of positive costs, find the minimum cost path from
// top-left to bottom-right. You can only move right or down.
//
// A) Recursive without memoization
// B) With memoization

function minCostPathNaive(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;

  function helper(r: number, c: number): number {
    // TODO: recursive approach — O(2^(m+n))
    if (r === rows - 1 && c === cols - 1) return grid[r][c];
    if (r >= rows || c >= cols) return Infinity;
    return 0; // placeholder
  }

  return helper(0, 0);
}

function minCostPathMemo(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const cache = new Map<string, number>();

  function helper(r: number, c: number): number {
    // TODO: memoized — O(m*n) time, O(m*n) space
    if (r === rows - 1 && c === cols - 1) return grid[r][c];
    if (r >= rows || c >= cols) return Infinity;
    return 0; // placeholder
  }

  return helper(0, 0);
}

// ============================================================================
// EXERCISE 7: Streaming vs Storage — Find Missing Number
// ============================================================================
// Given an array of n-1 distinct numbers from 1 to n, find the missing one.
//
// A) Using extra space: hash set
// B) Streaming approach: O(1) space using math or XOR

function missingNumberSet(arr: number[], n: number): number {
  // TODO: O(n) time, O(n) space
  return 0;
}

function missingNumberStreaming(arr: number[], n: number): number {
  // TODO: O(n) time, O(1) space — use sum formula or XOR
  return 0;
}

// ============================================================================
// EXERCISE 8: Caching — Expensive Computation Wrapper
// ============================================================================
// Create a generic memoize function that caches results of a function
// based on its arguments.

function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  // TODO: Return a memoized version of fn
  // Use JSON.stringify on args as the cache key
  return fn; // placeholder
}

// ============================================================================
// EXERCISE 9: Precomputation — Character Frequency Lookup
// ============================================================================
// Given a string, answer multiple queries of "how many times does character c
// appear in the substring from index l to r (inclusive)?"
//
// A) Naive: count each query by iterating
// B) Precompute: build a prefix frequency table

function charFreqNaive(s: string, queries: [string, number, number][]): number[] {
  // TODO: O(n) per query
  return [];
}

function charFreqOptimized(s: string, queries: [string, number, number][]): number[] {
  // TODO: O(n * alphabet_size) precomputation, O(1) per query
  // Build prefix count for each character
  return [];
}

// ============================================================================
// EXERCISE 10: Space Optimization — Fibonacci with O(1) Space
// ============================================================================
// Computing Fibonacci:
// - Recursive: O(2^n) time, O(n) space
// - Memoized: O(n) time, O(n) space
// - Iterative: O(n) time, O(1) space
//
// Implement the O(1) space version.

function fibConstantSpace(n: number): number {
  // TODO: O(n) time, O(1) space
  return 0;
}

// ============================================================================
// EXERCISE 11: Tradeoff Identification
// ============================================================================
// For each scenario, identify the tradeoff and which approach is better.
// Write your answers as comments.

// Scenario A: You need to check if usernames are taken during registration.
//   You have 10 million existing usernames.
//   Option 1: Query the database each time → O(log n) per query, no extra RAM
//   Option 2: Load all usernames into a Set in memory → O(1) per query, ~500MB RAM
//
// Which is better? Answer: ???
// Why? ???

// Scenario B: Mobile app needs to display a list of 1000 items with computed
//   derived values (e.g., formatting, calculations).
//   Option 1: Precompute all derived values on load → instant scroll, ~1MB RAM
//   Option 2: Compute on the fly as user scrolls → slight delay, minimal RAM
//
// Which is better? Answer: ???
// Why? ???

// Scenario C: Real-time log processing system handling 1TB/day of log data.
//   Option 1: Store all logs in memory for fast querying → requires >1TB RAM
//   Option 2: Stream and aggregate, keeping only summaries → ~1GB RAM, slower queries
//
// Which is better? Answer: ???
// Why? ???

// ============================================================================
// EXERCISE 12: Two Approaches — Longest Substring Without Repeating Characters
// ============================================================================
// Given a string, find the length of the longest substring without repeating chars.
//
// A) Brute force: check all substrings → O(n³) or O(n²)
// B) Sliding window with hash set → O(n) time, O(min(n, alphabet)) space

function longestUniqueSubstrBrute(s: string): number {
  // TODO: O(n²) approach — for each start, extend until duplicate found
  return 0;
}

function longestUniqueSubstrOptimized(s: string): number {
  // TODO: O(n) sliding window approach
  // Hint: use a Set or Map to track characters in current window
  return 0;
}

// ============================================================================
// TEST AREA (uncomment to test your solutions)
// ============================================================================

// console.log("=== Exercise 1: Pair Difference ===");
// console.log(pairDiffBrute([1, 3, 5, 7, 9], 4));       // e.g., [1, 5]
// console.log(pairDiffOptimized([1, 3, 5, 7, 9], 4));    // e.g., [1, 5]

// console.log("\n=== Exercise 2: Climbing Stairs ===");
// console.log(climbStairsNaive(10));   // 89
// console.log(climbStairsMemo(10));    // 89

// console.log("\n=== Exercise 3: Range Sum ===");
// const arr3 = [1, 2, 3, 4, 5];
// const queries3: [number, number][] = [[0, 2], [1, 4], [0, 4]];
// console.log(rangeSumNaive(arr3, queries3));     // [6, 14, 15]
// console.log(rangeSumOptimized(arr3, queries3)); // [6, 14, 15]

// console.log("\n=== Exercise 4: Remove Duplicates ===");
// console.log(removeDupsExtraSpace([1, 1, 2, 2, 3])); // [1, 2, 3]
// const arr4 = [1, 1, 2, 2, 3];
// const len4 = removeDupsInPlace(arr4);
// console.log(arr4.slice(0, len4)); // [1, 2, 3]

// console.log("\n=== Exercise 5: Group Anagrams ===");
// console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));

// console.log("\n=== Exercise 6: Min Cost Path ===");
// const grid = [[1,3,1],[1,5,1],[4,2,1]];
// console.log(minCostPathNaive(grid));  // 7
// console.log(minCostPathMemo(grid));   // 7

// console.log("\n=== Exercise 7: Missing Number ===");
// console.log(missingNumberSet([1, 2, 4, 5], 5));       // 3
// console.log(missingNumberStreaming([1, 2, 4, 5], 5));  // 3

// console.log("\n=== Exercise 8: Memoize ===");
// let callCount = 0;
// const expensiveAdd = memoize((a: number, b: number) => { callCount++; return a + b; });
// console.log(expensiveAdd(1, 2)); // 3
// console.log(expensiveAdd(1, 2)); // 3 (cached)
// console.log(callCount);          // 1

// console.log("\n=== Exercise 9: Char Frequency ===");
// const queries9: [string, number, number][] = [["a", 0, 4], ["b", 1, 3]];
// console.log(charFreqNaive("abacaba", queries9));     // [3, 1]
// console.log(charFreqOptimized("abacaba", queries9)); // [3, 1]

// console.log("\n=== Exercise 10: Fibonacci O(1) Space ===");
// console.log(fibConstantSpace(10)); // 55
// console.log(fibConstantSpace(0));  // 0
// console.log(fibConstantSpace(1));  // 1

// console.log("\n=== Exercise 12: Longest Unique Substring ===");
// console.log(longestUniqueSubstrBrute("abcabcbb"));     // 3
// console.log(longestUniqueSubstrOptimized("abcabcbb"));  // 3
