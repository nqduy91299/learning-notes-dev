/**
 * Space-Time Tradeoffs — Solutions
 *
 * Run: npx tsx solutions.ts
 */

// ============================================================================
// EXERCISE 1: Find Pair with Target Difference
// ============================================================================

function pairDiffBrute(arr: number[], target: number): [number, number] | null {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] - arr[i] === target) return [arr[i], arr[j]];
      if (arr[i] - arr[j] === target) return [arr[j], arr[i]];
    }
  }
  return null;
}
// Time: O(n²), Space: O(1)

function pairDiffOptimized(arr: number[], target: number): [number, number] | null {
  const seen = new Set<number>();
  for (const num of arr) {
    // If num - x = target, then x = num - target
    // If x - num = target, then x = num + target
    if (seen.has(num - target)) return [num - target, num];
    if (seen.has(num + target)) return [num, num + target];
    seen.add(num);
  }
  return null;
}
// Time: O(n), Space: O(n)
// Tradeoff: hash set uses O(n) space but eliminates the inner loop

// ============================================================================
// EXERCISE 2: Climbing Stairs
// ============================================================================

function climbStairsNaive(n: number): number {
  if (n <= 1) return 1;
  return climbStairsNaive(n - 1) + climbStairsNaive(n - 2);
}
// Time: O(2^n) — binary recursion tree
// Space: O(n) — call stack depth

function climbStairsMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return 1;
  if (cache.has(n)) return cache.get(n)!;
  const result = climbStairsMemo(n - 1, cache) + climbStairsMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}
// Time: O(n) — each subproblem computed once
// Space: O(n) — cache + call stack
// Tradeoff: O(n) extra space eliminates exponential recomputation

// ============================================================================
// EXERCISE 3: Range Sum Queries
// ============================================================================

function rangeSumNaive(arr: number[], queries: [number, number][]): number[] {
  return queries.map(([l, r]) => {
    let sum = 0;
    for (let i = l; i <= r; i++) {
      sum += arr[i];
    }
    return sum;
  });
}
// Time: O(n * q) where q = number of queries
// Space: O(q) for results only

function rangeSumOptimized(arr: number[], queries: [number, number][]): number[] {
  // Build prefix sum array
  const prefix: number[] = [0];
  for (const num of arr) {
    prefix.push(prefix[prefix.length - 1] + num);
  }

  // Answer each query in O(1)
  return queries.map(([l, r]) => prefix[r + 1] - prefix[l]);
}
// Time: O(n + q) — O(n) precomputation + O(1) per query
// Space: O(n) for prefix array
// Tradeoff: O(n) extra space makes each query O(1) instead of O(n)

// ============================================================================
// EXERCISE 4: Remove Duplicates from Sorted Array
// ============================================================================

function removeDupsExtraSpace(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const result: number[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1]) {
      result.push(arr[i]);
    }
  }
  return result;
}
// Time: O(n), Space: O(n) for the new array

function removeDupsInPlace(arr: number[]): number {
  if (arr.length === 0) return 0;
  let writeIdx = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1]) {
      arr[writeIdx] = arr[i];
      writeIdx++;
    }
  }
  return writeIdx;
}
// Time: O(n), Space: O(1)
// Tradeoff: in-place version saves O(n) space but mutates the input

// ============================================================================
// EXERCISE 5: Anagram Grouping
// ============================================================================

function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const s of strs) {
    const key = s.split("").sort().join("");
    const group = groups.get(key);
    if (group) {
      group.push(s);
    } else {
      groups.set(key, [s]);
    }
  }

  return Array.from(groups.values());
}
// Time: O(n * m log m) where n = number of strings, m = max string length
// Space: O(n * m) for the hash map
// Tradeoff: hash map allows O(1) group lookup vs O(n) brute-force comparison

// ============================================================================
// EXERCISE 6: Minimum Cost Path
// ============================================================================

function minCostPathNaive(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;

  function helper(r: number, c: number): number {
    if (r === rows - 1 && c === cols - 1) return grid[r][c];
    if (r >= rows || c >= cols) return Infinity;
    const right = helper(r, c + 1);
    const down = helper(r + 1, c);
    return grid[r][c] + Math.min(right, down);
  }

  return helper(0, 0);
}
// Time: O(2^(m+n)) — each cell branches into 2 calls
// Space: O(m+n) — recursion depth

function minCostPathMemo(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const cache = new Map<string, number>();

  function helper(r: number, c: number): number {
    if (r === rows - 1 && c === cols - 1) return grid[r][c];
    if (r >= rows || c >= cols) return Infinity;

    const key = `${r},${c}`;
    if (cache.has(key)) return cache.get(key)!;

    const right = helper(r, c + 1);
    const down = helper(r + 1, c);
    const result = grid[r][c] + Math.min(right, down);
    cache.set(key, result);
    return result;
  }

  return helper(0, 0);
}
// Time: O(m*n) — each cell computed once
// Space: O(m*n) — cache + recursion stack O(m+n)
// Tradeoff: O(m*n) space eliminates exponential recomputation

// ============================================================================
// EXERCISE 7: Find Missing Number
// ============================================================================

function missingNumberSet(arr: number[], n: number): number {
  const present = new Set(arr);
  for (let i = 1; i <= n; i++) {
    if (!present.has(i)) return i;
  }
  return -1; // should not reach here
}
// Time: O(n), Space: O(n)

function missingNumberStreaming(arr: number[], n: number): number {
  // Sum formula: expected sum = n*(n+1)/2
  const expectedSum = (n * (n + 1)) / 2;
  let actualSum = 0;
  for (const num of arr) {
    actualSum += num;
  }
  return expectedSum - actualSum;
}
// Time: O(n), Space: O(1)
// Tradeoff: math-based approach uses O(1) space vs O(n) for the Set
// Alternative O(1) space: XOR all numbers 1..n with all elements of arr

// ============================================================================
// EXERCISE 8: Generic Memoize
// ============================================================================

function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  const cache = new Map<string, TResult>();
  return (...args: TArgs): TResult => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
// Time: O(1) for cache hits (amortized), O(serialization cost) for key generation
// Space: O(number of unique argument combinations)
// Tradeoff: unbounded cache growth — in production, use an LRU cache

// ============================================================================
// EXERCISE 9: Character Frequency Lookup
// ============================================================================

function charFreqNaive(s: string, queries: [string, number, number][]): number[] {
  return queries.map(([ch, l, r]) => {
    let count = 0;
    for (let i = l; i <= r; i++) {
      if (s[i] === ch) count++;
    }
    return count;
  });
}
// Time: O(n * q) where q = number of queries
// Space: O(q) for results

function charFreqOptimized(s: string, queries: [string, number, number][]): number[] {
  // Build prefix frequency table for each character
  const prefixFreq = new Map<string, number[]>();

  // Initialize: find all unique characters
  const chars = new Set(s);
  for (const ch of chars) {
    const counts = new Array<number>(s.length + 1).fill(0);
    for (let i = 0; i < s.length; i++) {
      counts[i + 1] = counts[i] + (s[i] === ch ? 1 : 0);
    }
    prefixFreq.set(ch, counts);
  }

  return queries.map(([ch, l, r]) => {
    const counts = prefixFreq.get(ch);
    if (!counts) return 0;
    return counts[r + 1] - counts[l];
  });
}
// Time: O(n * k + q) where k = unique chars, q = queries
// Space: O(n * k) for prefix tables
// Tradeoff: O(n * k) space precomputation makes each query O(1)

// ============================================================================
// EXERCISE 10: Fibonacci with O(1) Space
// ============================================================================

function fibConstantSpace(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  let prev2 = 0;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
// Time: O(n), Space: O(1)
// Tradeoff: we only need the last 2 values, not the entire table.
// This is a common DP space optimization: when the recurrence only depends
// on a fixed number of previous values, we can reduce O(n) space to O(1).

// ============================================================================
// EXERCISE 11: Tradeoff Identification — ANSWERS
// ============================================================================

// Scenario A: Database query vs in-memory Set for username lookup
//   Answer: Depends on scale and infrastructure.
//   - If you have the RAM (~500MB is modest for a server): use the Set.
//     O(1) lookups at registration time give a better user experience.
//   - If memory is tight or you need consistency with concurrent writes:
//     use the database with a unique index (O(log n) is still fast).
//   - Hybrid: use a Bloom filter (~50MB, allows false positives) as a
//     first check, then hit the DB only when the Bloom filter says "maybe taken."

// Scenario B: Precompute vs compute-on-fly for 1000 mobile list items
//   Answer: Precompute (Option 1).
//   - 1000 items with derived values is trivial memory (~1MB).
//   - Smooth scrolling is critical for mobile UX.
//   - The compute cost is paid once on load, not repeatedly during scroll.

// Scenario C: In-memory vs streaming for 1TB/day log processing
//   Answer: Stream and aggregate (Option 2).
//   - 1TB+ of RAM is extremely expensive and impractical.
//   - Streaming with aggregation is the standard approach for log processing.
//   - Use specialized tools (Kafka, Flink) designed for this pattern.
//   - Store aggregates in a database for queries.

// ============================================================================
// EXERCISE 12: Longest Substring Without Repeating Characters
// ============================================================================

function longestUniqueSubstrBrute(s: string): number {
  let maxLen = 0;

  for (let i = 0; i < s.length; i++) {
    const seen = new Set<string>();
    let j = i;
    while (j < s.length && !seen.has(s[j])) {
      seen.add(s[j]);
      j++;
    }
    maxLen = Math.max(maxLen, j - i);
  }

  return maxLen;
}
// Time: O(n²) — for each start position, extend until duplicate
// Space: O(min(n, alphabet size))

function longestUniqueSubstrOptimized(s: string): number {
  const lastSeen = new Map<string, number>();
  let maxLen = 0;
  let start = 0;

  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    const prevIndex = lastSeen.get(ch);

    if (prevIndex !== undefined && prevIndex >= start) {
      // Shrink window: move start past the previous occurrence
      start = prevIndex + 1;
    }

    lastSeen.set(ch, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }

  return maxLen;
}
// Time: O(n) — single pass with sliding window
// Space: O(min(n, alphabet size)) for the Map
// Tradeoff: the Map tracks character positions to allow O(1) window adjustment.
// Instead of re-scanning for duplicates (O(n) inner loop), we jump directly
// to the correct position.

// ============================================================================
// RUNNER
// ============================================================================

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
  } else {
    console.log(`  PASS: ${message}`);
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function run(): void {
  console.log("=== Exercise 1: Pair Difference ===");
  const pd1 = pairDiffBrute([1, 3, 5, 7, 9], 4);
  assert(pd1 !== null && pd1[1] - pd1[0] === 4, "brute: found pair with diff 4");
  const pd2 = pairDiffOptimized([1, 3, 5, 7, 9], 4);
  assert(pd2 !== null && pd2[1] - pd2[0] === 4, "optimized: found pair with diff 4");
  assert(pairDiffBrute([1, 2, 3], 10) === null, "brute: no pair → null");
  assert(pairDiffOptimized([1, 2, 3], 10) === null, "optimized: no pair → null");

  console.log("\n=== Exercise 2: Climbing Stairs ===");
  assert(climbStairsNaive(1) === 1, "naive: 1 step → 1 way");
  assert(climbStairsNaive(5) === 8, "naive: 5 steps → 8 ways");
  assert(climbStairsNaive(10) === 89, "naive: 10 steps → 89 ways");
  assert(climbStairsMemo(1) === 1, "memo: 1 step → 1 way");
  assert(climbStairsMemo(5) === 8, "memo: 5 steps → 8 ways");
  assert(climbStairsMemo(10) === 89, "memo: 10 steps → 89 ways");
  assert(climbStairsMemo(40) === 165580141, "memo: 40 steps (fast!)");

  console.log("\n=== Exercise 3: Range Sum ===");
  const arr3 = [1, 2, 3, 4, 5];
  const queries3: [number, number][] = [[0, 2], [1, 4], [0, 4]];
  assert(arraysEqual(rangeSumNaive(arr3, queries3), [6, 14, 15]), "naive range sums");
  assert(arraysEqual(rangeSumOptimized(arr3, queries3), [6, 14, 15]), "optimized range sums");

  console.log("\n=== Exercise 4: Remove Duplicates ===");
  assert(arraysEqual(removeDupsExtraSpace([1, 1, 2, 2, 3]), [1, 2, 3]), "extra space: [1,1,2,2,3]");
  assert(arraysEqual(removeDupsExtraSpace([]), []), "extra space: empty");
  const arr4 = [1, 1, 2, 2, 3, 3, 4];
  const len4 = removeDupsInPlace(arr4);
  assert(len4 === 4, "in-place: length = 4");
  assert(arraysEqual(arr4.slice(0, len4), [1, 2, 3, 4]), "in-place: correct values");

  console.log("\n=== Exercise 5: Group Anagrams ===");
  const groups = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  assert(groups.length === 3, "3 anagram groups");
  const sorted = groups.map((g) => g.sort().join(",")).sort();
  assert(sorted[0] === "ate,eat,tea", "group 1: ate,eat,tea");
  assert(sorted[1] === "bat", "group 2: bat");
  assert(sorted[2] === "nat,tan", "group 3: nat,tan");

  console.log("\n=== Exercise 6: Min Cost Path ===");
  const grid1 = [
    [1, 3, 1],
    [1, 5, 1],
    [4, 2, 1],
  ];
  assert(minCostPathNaive(grid1) === 7, "naive: grid1 → 7");
  assert(minCostPathMemo(grid1) === 7, "memo: grid1 → 7");
  const grid2 = [[1, 2], [3, 4]];
  assert(minCostPathNaive(grid2) === 7, "naive: grid2 → 7");
  assert(minCostPathMemo(grid2) === 7, "memo: grid2 → 7");

  console.log("\n=== Exercise 7: Missing Number ===");
  assert(missingNumberSet([1, 2, 4, 5], 5) === 3, "set: missing 3");
  assert(missingNumberStreaming([1, 2, 4, 5], 5) === 3, "streaming: missing 3");
  assert(missingNumberSet([2, 3], 3) === 1, "set: missing 1");
  assert(missingNumberStreaming([2, 3], 3) === 1, "streaming: missing 1");

  console.log("\n=== Exercise 8: Memoize ===");
  let callCount = 0;
  const expensiveAdd = memoize((a: number, b: number) => {
    callCount++;
    return a + b;
  });
  assert(expensiveAdd(1, 2) === 3, "memoize: first call returns 3");
  assert(expensiveAdd(1, 2) === 3, "memoize: cached call returns 3");
  assert(callCount === 1, "memoize: function called only once");
  assert(expensiveAdd(3, 4) === 7, "memoize: different args → 7");
  assert(callCount === 2, "memoize: new args → second call");

  console.log("\n=== Exercise 9: Char Frequency ===");
  const queries9: [string, number, number][] = [
    ["a", 0, 4],
    ["b", 1, 3],
    ["a", 0, 6],
  ];
  assert(arraysEqual(charFreqNaive("abacaba", queries9), [3, 1, 4]), "naive char freq");
  assert(arraysEqual(charFreqOptimized("abacaba", queries9), [3, 1, 4]), "optimized char freq");

  console.log("\n=== Exercise 10: Fibonacci O(1) Space ===");
  assert(fibConstantSpace(0) === 0, "fib(0) = 0");
  assert(fibConstantSpace(1) === 1, "fib(1) = 1");
  assert(fibConstantSpace(10) === 55, "fib(10) = 55");
  assert(fibConstantSpace(20) === 6765, "fib(20) = 6765");

  console.log("\n=== Exercise 12: Longest Unique Substring ===");
  assert(longestUniqueSubstrBrute("abcabcbb") === 3, "brute: abcabcbb → 3");
  assert(longestUniqueSubstrBrute("bbbbb") === 1, "brute: bbbbb → 1");
  assert(longestUniqueSubstrBrute("") === 0, "brute: empty → 0");
  assert(longestUniqueSubstrOptimized("abcabcbb") === 3, "optimized: abcabcbb → 3");
  assert(longestUniqueSubstrOptimized("bbbbb") === 1, "optimized: bbbbb → 1");
  assert(longestUniqueSubstrOptimized("pwwkew") === 3, "optimized: pwwkew → 3");
  assert(longestUniqueSubstrOptimized("") === 0, "optimized: empty → 0");

  console.log("\nAll tests complete!");
}

run();
