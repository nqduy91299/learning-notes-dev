/**
 * Big-O Notation — Solutions
 *
 * Run: npx tsx solutions.ts
 */

// ============================================================================
// EXERCISE 1: Predict the Complexity — ANSWERS
// ============================================================================

function mystery1(n: number): number {
  let count = 0;
  for (let i = 1; i < n; i *= 2) {
    count++;
  }
  return count;
}
// Answer: O(log n) — i doubles each iteration, so it takes log₂(n) steps

function mystery2(n: number): number {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      count++;
    }
  }
  return count;
}
// Answer: O(n²)
// Inner loop runs: n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 = O(n²)

function mystery3(n: number): number {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 100; j++) {
      count++;
    }
  }
  return count;
}
// Answer: O(n) — inner loop is constant (100 iterations regardless of n)

// ============================================================================
// EXERCISE 2: Predict the Complexity — Recursion — ANSWERS
// ============================================================================

function mysteryRec1(n: number): number {
  if (n <= 1) return 1;
  return mysteryRec1(n - 1) + mysteryRec1(n - 1);
}
// Answer: O(2^n) — two recursive calls, each reducing n by 1

function mysteryRec2(n: number): number {
  if (n <= 1) return 1;
  return mysteryRec2(Math.floor(n / 2)) + 1;
}
// Answer: O(log n) — one recursive call, halving n each time

function mysteryRec3(n: number): number {
  if (n <= 1) return 1;
  return mysteryRec3(n - 1) + n;
}
// Answer: O(n) — one recursive call, reducing n by 1

// ============================================================================
// EXERCISE 3: Matrix Processing — ANSWER
// ============================================================================
// Time: O(n³) — three nested loops each running n times
// Space: O(1) — only uses a fixed number of variables

// ============================================================================
// EXERCISE 4: Two Sum Linear — O(n)
// ============================================================================

function twoSumLinear(nums: number[], target: number): [number, number] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const prevIndex = seen.get(complement);
    if (prevIndex !== undefined) {
      return [prevIndex, i];
    }
    seen.set(nums[i], i);
  }
  return [-1, -1];
}
// Time: O(n) — single pass through the array
// Space: O(n) — hash map stores up to n elements

// ============================================================================
// EXERCISE 5: Find Rotation Point — O(log n)
// ============================================================================

function findRotationPoint(arr: number[]): number {
  if (arr.length === 0) return 0;
  if (arr[0] <= arr[arr.length - 1]) return 0; // not rotated

  let lo = 0;
  let hi = arr.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] > arr[hi]) {
      // min is in the right half
      lo = mid + 1;
    } else {
      // min is in the left half (including mid)
      hi = mid;
    }
  }
  return lo;
}
// Time: O(log n) — binary search halving the range each step
// Space: O(1)

// ============================================================================
// EXERCISE 6: Maximum Subarray Sum — O(n) (Kadane's)
// ============================================================================

function maxSubarraySum(arr: number[]): number {
  let maxSoFar = arr[0];
  let maxEndingHere = arr[0];

  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }

  return maxSoFar;
}
// Time: O(n) — single pass
// Space: O(1) — two variables

// ============================================================================
// EXERCISE 7: Contains Duplicate — Fixed to O(n)
// ============================================================================

function containsDuplicate(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}
// Time: O(n) — single pass, Set.has is O(1) average
// Space: O(n) — Set stores up to n elements

// ============================================================================
// EXERCISE 8: Count Inversions — O(n log n)
// ============================================================================

function countInversions(arr: number[]): number {
  const temp = arr.slice();
  return mergeSortCount(temp, 0, temp.length - 1);
}

function mergeSortCount(arr: number[], lo: number, hi: number): number {
  if (lo >= hi) return 0;

  const mid = Math.floor((lo + hi) / 2);
  let count = 0;
  count += mergeSortCount(arr, lo, mid);
  count += mergeSortCount(arr, mid + 1, hi);
  count += mergeCount(arr, lo, mid, hi);
  return count;
}

function mergeCount(arr: number[], lo: number, mid: number, hi: number): number {
  const left = arr.slice(lo, mid + 1);
  const right = arr.slice(mid + 1, hi + 1);
  let i = 0;
  let j = 0;
  let k = lo;
  let inversions = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      arr[k++] = left[i++];
    } else {
      // All remaining elements in left are greater than right[j]
      inversions += left.length - i;
      arr[k++] = right[j++];
    }
  }

  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];

  return inversions;
}
// Time: O(n log n) — merge sort with counting during merge
// Space: O(n) — temporary arrays during merge

// ============================================================================
// EXERCISE 9: Dutch National Flag — O(n) time, O(1) space
// ============================================================================

function dutchNationalFlag(arr: number[]): void {
  let low = 0;
  let mid = 0;
  let high = arr.length - 1;

  while (mid <= high) {
    if (arr[mid] === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low++;
      mid++;
    } else if (arr[mid] === 1) {
      mid++;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high--;
    }
  }
}
// Time: O(n) — each element is visited at most twice
// Space: O(1) — three pointers

// ============================================================================
// EXERCISE 10: Substring Search
// ============================================================================

function naiveSubstringSearch(text: string, pattern: string): number {
  if (pattern.length === 0) return 0;
  if (pattern.length > text.length) return -1;

  for (let i = 0; i <= text.length - pattern.length; i++) {
    let match = true;
    for (let j = 0; j < pattern.length; j++) {
      if (text[i + j] !== pattern[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}
// Time: O(n*m) worst case, where n = text length, m = pattern length

function optimizedSubstringSearch(text: string, pattern: string): number {
  if (pattern.length === 0) return 0;
  if (pattern.length > text.length) return -1;

  // Rabin-Karp rolling hash approach
  const BASE = 31;
  const MOD = 1_000_000_007;
  const m = pattern.length;

  // Compute hash of pattern and first window
  let patternHash = 0;
  let windowHash = 0;
  let basePow = 1; // BASE^(m-1) mod MOD

  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * BASE + pattern.charCodeAt(i)) % MOD;
    windowHash = (windowHash * BASE + text.charCodeAt(i)) % MOD;
    if (i > 0) basePow = (basePow * BASE) % MOD;
  }

  for (let i = 0; i <= text.length - m; i++) {
    if (windowHash === patternHash) {
      // Verify character by character to avoid hash collision false positives
      let match = true;
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (match) return i;
    }

    // Slide the window
    if (i < text.length - m) {
      windowHash =
        ((windowHash - text.charCodeAt(i) * basePow % MOD + MOD) * BASE +
          text.charCodeAt(i + m)) %
        MOD;
    }
  }
  return -1;
}
// Time: O(n + m) average case, O(n*m) worst case (many hash collisions)

// ============================================================================
// EXERCISE 11: Space Complexity — ANSWERS
// ============================================================================

// spaceEx1: O(n) — result array grows linearly with n
// spaceEx2: O(n) — recursive call stack grows to depth n
// spaceEx3: O(n²) — n×n matrix

// ============================================================================
// EXERCISE 12: Merge Sorted Arrays — O(n + m)
// ============================================================================

function mergeSortedArrays(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i++]);
    } else {
      result.push(b[j++]);
    }
  }

  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);

  return result;
}
// Time: O(n + m)
// Space: O(n + m) for the result

// ============================================================================
// EXERCISE 13: Three Sum Exists — O(n²)
// ============================================================================

function threeSumExists(arr: number[]): boolean {
  const sorted = arr.slice().sort((a, b) => a - b);
  const n = sorted.length;

  for (let i = 0; i < n - 2; i++) {
    let lo = i + 1;
    let hi = n - 1;

    while (lo < hi) {
      const sum = sorted[i] + sorted[lo] + sorted[hi];
      if (sum === 0) return true;
      if (sum < 0) lo++;
      else hi--;
    }
  }

  return false;
}
// Time: O(n²) — O(n log n) sort + O(n) two-pointer for each of O(n) elements
// Space: O(n) for the sorted copy (or O(log n) if sorting in-place)

// ============================================================================
// EXERCISE 14: First Unique Character — O(n)
// ============================================================================

function firstUniqueChar(s: string): number {
  const freq = new Map<string, number>();

  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }

  for (let i = 0; i < s.length; i++) {
    if (freq.get(s[i]) === 1) return i;
  }

  return -1;
}
// Time: O(n) — two passes through the string
// Space: O(k) where k = alphabet size (bounded constant for ASCII/Unicode)

// ============================================================================
// EXERCISE 15: Flatten Nested Array — Optimized
// ============================================================================

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
// Hidden cost: concat creates a new array each time, copying all elements.
// If the array is deeply nested or has many elements, each concat copies
// all previously accumulated elements. This can lead to O(n²) total work
// where n is the total number of elements.

function flattenOptimized(arr: NestedArray): number[] {
  const result: number[] = [];
  flattenHelper(arr, result);
  return result;
}

function flattenHelper(arr: NestedArray, result: number[]): void {
  for (const item of arr) {
    if (Array.isArray(item)) {
      flattenHelper(item as NestedArray, result);
    } else {
      result.push(item);
    }
  }
}
// Time: O(n) where n = total number of elements (each visited once)
// Space: O(d) for recursion stack where d = max nesting depth, plus O(n) for result

// ============================================================================
// EXERCISE 16: Product Except Self — O(n)
// ============================================================================

function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array<number>(n);

  // First pass: prefix products
  result[0] = 1;
  for (let i = 1; i < n; i++) {
    result[i] = result[i - 1] * nums[i - 1];
  }

  // Second pass: multiply by suffix products
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}
// Time: O(n) — two passes
// Space: O(n) for the result (O(1) extra beyond the output)
// Explanation:
//   After first pass, result[i] = product of all elements before i
//   After second pass, result[i] = (product before i) × (product after i)

// ============================================================================
// EXERCISE 17: MinStack — All operations O(1)
// ============================================================================

class MinStack {
  private stack: number[] = [];
  private mins: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    if (this.mins.length === 0 || val <= this.mins[this.mins.length - 1]) {
      this.mins.push(val);
    }
  }

  pop(): number | undefined {
    const val = this.stack.pop();
    if (val !== undefined && val === this.mins[this.mins.length - 1]) {
      this.mins.pop();
    }
    return val;
  }

  getMin(): number | undefined {
    return this.mins[this.mins.length - 1];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}
// Time: O(1) for all operations
// Space: O(n) worst case for the mins stack (all elements are decreasing)
// Key insight: we maintain a parallel stack that only records new minimums.
// When we pop a value that equals the current min, we also pop from mins.

// ============================================================================
// EXERCISE 18: Master Theorem — ANSWERS
// ============================================================================
// a) T(n) = 2T(n/2) + O(n)   → a=2, b=2, d=1 → log₂(2)=1=d → Case 2 → O(n log n)
// b) T(n) = 4T(n/2) + O(n)   → a=4, b=2, d=1 → log₂(4)=2>d → Case 1 → O(n²)
// c) T(n) = T(n/2) + O(n)    → a=1, b=2, d=1 → log₂(1)=0<d → Case 3 → O(n)
// d) T(n) = 2T(n/2) + O(n²)  → a=2, b=2, d=2 → log₂(2)=1<d → Case 3 → O(n²)
// e) T(n) = 8T(n/2) + O(n²)  → a=8, b=2, d=2 → log₂(8)=3>d → Case 1 → O(n³)
// f) T(n) = 3T(n/3) + O(n)   → a=3, b=3, d=1 → log₃(3)=1=d → Case 2 → O(n log n)

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
  console.log("=== Exercise 1: Predict Complexity ===");
  assert(mystery1(16) === 4, "mystery1(16) = 4 (log₂16 = 4)");
  assert(mystery2(5) === 15, "mystery2(5) = 15 (5+4+3+2+1)");
  assert(mystery3(5) === 500, "mystery3(5) = 500 (5×100)");

  console.log("\n=== Exercise 2: Recursive Complexity ===");
  assert(mysteryRec1(5) === 16, "mysteryRec1(5) = 16 (2^4)");
  assert(mysteryRec2(16) === 5, "mysteryRec2(16) = 5 (log₂16 + 1)");
  assert(mysteryRec3(5) === 15, "mysteryRec3(5) = 15 (5+4+3+2+1)");

  console.log("\n=== Exercise 4: Two Sum Linear ===");
  assert(arraysEqual(twoSumLinear([2, 7, 11, 15], 9), [0, 1]), "[2,7,11,15] target=9 → [0,1]");
  assert(arraysEqual(twoSumLinear([3, 3], 6), [0, 1]), "[3,3] target=6 → [0,1]");
  assert(arraysEqual(twoSumLinear([1, 2, 3], 7), [-1, -1]), "[1,2,3] target=7 → [-1,-1]");

  console.log("\n=== Exercise 5: Find Rotation Point ===");
  assert(findRotationPoint([4, 5, 6, 7, 1, 2, 3]) === 4, "rotated at index 4");
  assert(findRotationPoint([1, 2, 3, 4, 5]) === 0, "not rotated → 0");
  assert(findRotationPoint([2, 1]) === 1, "[2,1] → index 1");

  console.log("\n=== Exercise 6: Max Subarray Sum ===");
  assert(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) === 6, "classic example → 6");
  assert(maxSubarraySum([1]) === 1, "single element → 1");
  assert(maxSubarraySum([-1, -2, -3]) === -1, "all negative → -1");

  console.log("\n=== Exercise 7: Contains Duplicate ===");
  assert(containsDuplicate([1, 2, 3, 1]) === true, "[1,2,3,1] → true");
  assert(containsDuplicate([1, 2, 3, 4]) === false, "[1,2,3,4] → false");
  assert(containsDuplicate([]) === false, "[] → false");

  console.log("\n=== Exercise 8: Count Inversions ===");
  assert(countInversions([2, 4, 1, 3, 5]) === 3, "[2,4,1,3,5] → 3");
  assert(countInversions([5, 4, 3, 2, 1]) === 10, "[5,4,3,2,1] → 10");
  assert(countInversions([1, 2, 3]) === 0, "[1,2,3] → 0");

  console.log("\n=== Exercise 9: Dutch National Flag ===");
  const dnf1 = [2, 0, 1, 2, 0, 1];
  dutchNationalFlag(dnf1);
  assert(arraysEqual(dnf1, [0, 0, 1, 1, 2, 2]), "[2,0,1,2,0,1] → sorted");
  const dnf2 = [0];
  dutchNationalFlag(dnf2);
  assert(arraysEqual(dnf2, [0]), "[0] → [0]");

  console.log("\n=== Exercise 10: Substring Search ===");
  assert(naiveSubstringSearch("hello world", "world") === 6, "naive: 'world' at 6");
  assert(naiveSubstringSearch("hello", "xyz") === -1, "naive: not found → -1");
  assert(optimizedSubstringSearch("hello world", "world") === 6, "optimized: 'world' at 6");
  assert(optimizedSubstringSearch("hello", "xyz") === -1, "optimized: not found → -1");
  assert(optimizedSubstringSearch("aaaa", "aa") === 0, "optimized: overlapping → 0");

  console.log("\n=== Exercise 12: Merge Sorted Arrays ===");
  assert(arraysEqual(mergeSortedArrays([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]), "merge [1,3,5] + [2,4,6]");
  assert(arraysEqual(mergeSortedArrays([], [1, 2]), [1, 2]), "merge [] + [1,2]");
  assert(arraysEqual(mergeSortedArrays([1], []), [1]), "merge [1] + []");

  console.log("\n=== Exercise 13: Three Sum Exists ===");
  assert(threeSumExists([-1, 0, 1, 2]) === true, "[-1,0,1,2] → true");
  assert(threeSumExists([1, 2, 3, 4]) === false, "[1,2,3,4] → false");
  assert(threeSumExists([0, 0, 0]) === true, "[0,0,0] → true");

  console.log("\n=== Exercise 14: First Unique Char ===");
  assert(firstUniqueChar("leetcode") === 0, "'leetcode' → 0");
  assert(firstUniqueChar("loveleetcode") === 2, "'loveleetcode' → 2");
  assert(firstUniqueChar("aabb") === -1, "'aabb' → -1");

  console.log("\n=== Exercise 15: Flatten ===");
  assert(arraysEqual(flattenOptimized([1, [2, [3, 4]], 5]), [1, 2, 3, 4, 5]), "nested flatten");
  assert(arraysEqual(flattenOptimized([1, 2, 3]), [1, 2, 3]), "flat array");
  assert(arraysEqual(flattenOptimized([]), []), "empty array");

  console.log("\n=== Exercise 16: Product Except Self ===");
  assert(arraysEqual(productExceptSelf([1, 2, 3, 4]), [24, 12, 8, 6]), "[1,2,3,4] → [24,12,8,6]");
  assert(arraysEqual(productExceptSelf([2, 3]), [3, 2]), "[2,3] → [3,2]");

  console.log("\n=== Exercise 17: MinStack ===");
  const ms = new MinStack();
  ms.push(5);
  ms.push(2);
  ms.push(7);
  ms.push(1);
  assert(ms.getMin() === 1, "min after push 5,2,7,1 → 1");
  ms.pop();
  assert(ms.getMin() === 2, "min after pop 1 → 2");
  ms.pop();
  assert(ms.getMin() === 2, "min after pop 7 → 2");
  ms.pop();
  assert(ms.getMin() === 5, "min after pop 2 → 5");
  assert(ms.isEmpty() === false, "not empty yet");
  ms.pop();
  assert(ms.isEmpty() === true, "empty after final pop");

  console.log("\n=== Exercise 18: Master Theorem ===");
  console.log("  a) T(n) = 2T(n/2) + O(n)  → O(n log n)  [merge sort]");
  console.log("  b) T(n) = 4T(n/2) + O(n)  → O(n²)       [Case 1]");
  console.log("  c) T(n) = T(n/2) + O(n)   → O(n)         [Case 3]");
  console.log("  d) T(n) = 2T(n/2) + O(n²) → O(n²)        [Case 3]");
  console.log("  e) T(n) = 8T(n/2) + O(n²) → O(n³)        [Case 1]");
  console.log("  f) T(n) = 3T(n/3) + O(n)  → O(n log n)   [Case 2]");

  console.log("\nAll tests complete!");
}

run();
