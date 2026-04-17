// ============================================================================
// Arrays & Strings - Solutions
// ============================================================================
// Complete solutions with complexity analysis for all 18 exercises.
// Run with: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// PREDICT THE OUTPUT - Answers
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Array Mutation and References
// ----------------------------------------------------------------------------
function solution1_predict(): void {
  const a = [1, 2, 3, 4, 5];
  const b = a;        // b is a REFERENCE to the same array
  b[0] = 99;          // mutates the shared array
  const c = a.slice(); // c is a SHALLOW COPY
  c[1] = 88;          // only mutates c, not a

  console.log(a[0]); // 99 (mutated via b)
  console.log(a[1]); // 2  (c is a separate copy)
  console.log(c[0]); // 99 (copied from a after b mutated it)
}
// Answer: 99, 2, 99

// ----------------------------------------------------------------------------
// Exercise 2: String Immutability
// ----------------------------------------------------------------------------
function solution2_predict(): void {
  let s = "hello";
  const t = s;         // t points to "hello"; strings are immutable primitives
  s += " world";       // s now points to NEW string "hello world"; t unchanged

  console.log(t);        // "hello"
  console.log(s.length); // 11

  const arr = s.split("");
  arr[0] = "H";
  console.log(s[0]);          // "h" (original string unchanged)
  console.log(arr.join("")); // "Hello world"
}
// Answer: "hello", 11, "h", "Hello world"

// ----------------------------------------------------------------------------
// Exercise 3: Splice vs Slice
// ----------------------------------------------------------------------------
function solution3_predict(): void {
  const nums = [10, 20, 30, 40, 50];
  const sliced = nums.slice(1, 3);    // [20, 30] - does NOT mutate nums
  const spliced = nums.splice(1, 2, 99); // removes nums[1..2], inserts 99

  console.log(sliced);  // [20, 30]
  console.log(spliced); // [20, 30] (removed elements)
  console.log(nums);    // [10, 99, 40, 50]
}
// Answer: [20,30], [20,30], [10,99,40,50]

// ----------------------------------------------------------------------------
// Exercise 4: Array Methods Chaining
// ----------------------------------------------------------------------------
function solution4_predict(): void {
  const result = [1, 2, 3, 4, 5]
    .filter((x) => x % 2 !== 0) // [1, 3, 5]
    .map((x) => x * x)          // [1, 9, 25]
    .reduce((acc, x) => acc + x, 0); // 35

  console.log(result); // 35

  const arr = [3, 1, 4, 1, 5];
  const sorted = [...arr].sort((a, b) => a - b); // spread creates copy
  console.log(arr[0]);    // 3 (original unchanged)
  console.log(sorted[0]); // 1
}
// Answer: 35, 3, 1

// ============================================================================
// FIX THE BUG - Solutions
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 5: Two Sum - Fixed
// Bug: loop condition was i <= nums.length (off by one, accesses undefined)
// Fix: i < nums.length
// Time: O(n), Space: O(n)
// ----------------------------------------------------------------------------
function solution5_twoSum(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) { // FIX: < instead of <=
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return null;
}

// ----------------------------------------------------------------------------
// Exercise 6: Reverse String In-Place - Fixed
// Bug: missing right-- in the while loop, causing infinite loop
// Fix: add right--
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution6_reverse(s: string[]): void {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--; // FIX: was missing
  }
}

// ----------------------------------------------------------------------------
// Exercise 7: Max Subarray Sum (Sliding Window) - Fixed
// Bug: subtracted arr[i - k + 1] instead of arr[i - k]
// Fix: subtract arr[i - k] to remove the element leaving the window
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution7_maxSum(arr: number[], k: number): number {
  if (arr.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // FIX: i - k, not i - k + 1
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// ----------------------------------------------------------------------------
// Exercise 8: String Compression - Fixed
// Bug 1: pushed s[i] instead of s[i-1] when character changes
// Bug 2: never pushed the last group of characters
// Time: O(n), Space: O(n)
// ----------------------------------------------------------------------------
function solution8_compress(s: string): string {
  if (s.length === 0) return s;

  const parts: string[] = [];
  let count = 1;

  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      count++;
    } else {
      parts.push(s[i - 1] + String(count)); // FIX: s[i-1], not s[i]
      count = 1;
    }
  }
  parts.push(s[s.length - 1] + String(count)); // FIX: push last group

  return parts.join("");
}

// ============================================================================
// IMPLEMENT - Solutions
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 9: Valid Palindrome
// Approach: Two pointers from both ends, skip non-alphanumeric, compare lowercase.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution9_isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;

  const isAlphaNum = (c: string): boolean => {
    const code = c.charCodeAt(0);
    return (
      (code >= 48 && code <= 57) ||  // 0-9
      (code >= 65 && code <= 90) ||  // A-Z
      (code >= 97 && code <= 122)    // a-z
    );
  };

  while (left < right) {
    while (left < right && !isAlphaNum(s[left])) left++;
    while (left < right && !isAlphaNum(s[right])) right--;

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// ----------------------------------------------------------------------------
// Exercise 10: Container With Most Water
// Approach: Two pointers from both ends. Move the shorter line inward because
// moving the taller one can never increase the area (width decreases and
// height is bounded by the shorter line).
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution10_maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxArea = Math.max(maxArea, width * h);

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxArea;
}

// ----------------------------------------------------------------------------
// Exercise 11: Prefix Sum - Range Sum Query
// Approach: Build prefix[i] = sum of nums[0..i-1]. prefix[0] = 0 (sentinel).
// sumRange(l, r) = prefix[r+1] - prefix[l].
// Time: O(n) build, O(1) query. Space: O(n).
// ----------------------------------------------------------------------------
class Solution11_NumArray {
  private prefix: number[];

  constructor(nums: number[]) {
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  sumRange(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// ----------------------------------------------------------------------------
// Exercise 12: Remove Duplicates from Sorted Array
// Approach: Slow pointer marks the position of the last unique element.
// Fast pointer scans through the array.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution12_removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}

// ----------------------------------------------------------------------------
// Exercise 13: Rotate Array
// Approach: Three reverses.
// [1,2,3,4,5,6,7] k=3
// Step 1: Reverse all     -> [7,6,5,4,3,2,1]
// Step 2: Reverse [0,k-1] -> [5,6,7,4,3,2,1]
// Step 3: Reverse [k,n-1] -> [5,6,7,1,2,3,4]
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution13_rotate(nums: number[], k: number): void {
  const n = nums.length;
  k = k % n; // handle k > n
  if (k === 0) return;

  const reverse = (arr: number[], start: number, end: number): void => {
    while (start < end) {
      [arr[start], arr[end]] = [arr[end], arr[start]];
      start++;
      end--;
    }
  };

  reverse(nums, 0, n - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, n - 1);
}

// ----------------------------------------------------------------------------
// Exercise 14: Anagram Check
// Approach: Count character frequencies. If both strings have the same
// frequencies for every character, they are anagrams.
// Time: O(n), Space: O(1) - fixed 26-letter alphabet
// ----------------------------------------------------------------------------
function solution14_isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const freq = new Array(26).fill(0);
  const aCode = "a".charCodeAt(0);

  for (let i = 0; i < s.length; i++) {
    freq[s.charCodeAt(i) - aCode]++;
    freq[t.charCodeAt(i) - aCode]--;
  }

  return freq.every((count) => count === 0);
}

// ----------------------------------------------------------------------------
// Exercise 15: Two Sum (Hash Map)
// Approach: Single pass. For each number, check if (target - num) exists in
// the map. If yes, return both indices. Otherwise, store current num and index.
// Time: O(n), Space: O(n)
// ----------------------------------------------------------------------------
function solution15_twoSum(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return null;
}

// ----------------------------------------------------------------------------
// Exercise 16: Longest Substring Without Repeating Characters
// Approach: Sliding window. Maintain a set of characters in the current window.
// Expand right; if duplicate found, shrink from left until no duplicate.
// Time: O(n), Space: O(min(n, alphabet_size))
// ----------------------------------------------------------------------------
function solution16_lengthOfLongestSubstring(s: string): number {
  const charIndex = new Map<string, number>();
  let maxLen = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (charIndex.has(ch) && charIndex.get(ch)! >= left) {
      left = charIndex.get(ch)! + 1;
    }
    charIndex.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// ----------------------------------------------------------------------------
// Exercise 17: Move Zeroes
// Approach: Two pointers. `insertPos` tracks where the next non-zero should go.
// Scan with `i`, swap non-zero to `insertPos`, increment `insertPos`.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution17_moveZeroes(nums: number[]): void {
  let insertPos = 0;

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[insertPos], nums[i]] = [nums[i], nums[insertPos]];
      insertPos++;
    }
  }
}

// ----------------------------------------------------------------------------
// Exercise 18: Product of Array Except Self
// Approach: Two passes.
// Pass 1 (left to right): result[i] = product of all elements to the left of i.
// Pass 2 (right to left): multiply result[i] by product of all elements to the right.
// Time: O(n), Space: O(1) extra (output array doesn't count)
// ----------------------------------------------------------------------------
function solution18_productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array<number>(n);

  // Left pass: result[i] = product of nums[0..i-1]
  result[0] = 1;
  for (let i = 1; i < n; i++) {
    result[i] = result[i - 1] * nums[i - 1];
  }

  // Right pass: multiply by product of nums[i+1..n-1]
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
  }

  return result;
}

// ============================================================================
// Runner
// ============================================================================
function runAllSolutions(): void {
  console.log("=".repeat(60));
  console.log("Arrays & Strings - Solutions Runner");
  console.log("=".repeat(60));

  // Predict output
  console.log("\n--- Exercise 1: Array Mutation ---");
  solution1_predict();

  console.log("\n--- Exercise 2: String Immutability ---");
  solution2_predict();

  console.log("\n--- Exercise 3: Splice vs Slice ---");
  solution3_predict();

  console.log("\n--- Exercise 4: Method Chaining ---");
  solution4_predict();

  // Fix the bug
  console.log("\n--- Exercise 5: Two Sum (Fixed) ---");
  console.log(solution5_twoSum([2, 7, 11, 15], 9));  // [0, 1]
  console.log(solution5_twoSum([3, 2, 4], 6));        // [1, 2]
  console.log(solution5_twoSum([1, 2, 3], 100));      // null

  console.log("\n--- Exercise 6: Reverse String (Fixed) ---");
  const chars6 = ["h", "e", "l", "l", "o"];
  solution6_reverse(chars6);
  console.log(chars6); // ["o", "l", "l", "e", "h"]

  console.log("\n--- Exercise 7: Max Subarray Sum (Fixed) ---");
  console.log(solution7_maxSum([1, 4, 2, 10, 23, 3, 1, 0, 20], 4)); // 39

  console.log("\n--- Exercise 8: String Compression (Fixed) ---");
  console.log(solution8_compress("aabcccccaaa")); // a2b1c5a3
  console.log(solution8_compress("abc"));          // a1b1c1
  console.log(solution8_compress(""));             // ""

  // Implement
  console.log("\n--- Exercise 9: Valid Palindrome ---");
  console.log(solution9_isPalindrome("A man, a plan, a canal: Panama")); // true
  console.log(solution9_isPalindrome("race a car"));                      // false
  console.log(solution9_isPalindrome(""));                                // true

  console.log("\n--- Exercise 10: Container With Most Water ---");
  console.log(solution10_maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
  console.log(solution10_maxArea([1, 1]));                         // 1

  console.log("\n--- Exercise 11: Range Sum Query ---");
  const numArr = new Solution11_NumArray([-2, 0, 3, -5, 2, -1]);
  console.log(numArr.sumRange(0, 2)); // 1
  console.log(numArr.sumRange(2, 5)); // -1
  console.log(numArr.sumRange(0, 5)); // -3

  console.log("\n--- Exercise 12: Remove Duplicates ---");
  const arr12 = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
  const len12 = solution12_removeDuplicates(arr12);
  console.log(len12, arr12.slice(0, len12)); // 5 [0, 1, 2, 3, 4]

  console.log("\n--- Exercise 13: Rotate Array ---");
  const arr13 = [1, 2, 3, 4, 5, 6, 7];
  solution13_rotate(arr13, 3);
  console.log(arr13); // [5, 6, 7, 1, 2, 3, 4]

  console.log("\n--- Exercise 14: Anagram Check ---");
  console.log(solution14_isAnagram("anagram", "nagaram")); // true
  console.log(solution14_isAnagram("rat", "car"));         // false
  console.log(solution14_isAnagram("listen", "silent"));   // true

  console.log("\n--- Exercise 15: Two Sum (HashMap) ---");
  console.log(solution15_twoSum([2, 7, 11, 15], 9)); // [0, 1]
  console.log(solution15_twoSum([3, 2, 4], 6));       // [1, 2]
  console.log(solution15_twoSum([1, 2, 3], 10));       // null

  console.log("\n--- Exercise 16: Longest Substring ---");
  console.log(solution16_lengthOfLongestSubstring("abcabcbb")); // 3
  console.log(solution16_lengthOfLongestSubstring("bbbbb"));    // 1
  console.log(solution16_lengthOfLongestSubstring("pwwkew"));   // 3
  console.log(solution16_lengthOfLongestSubstring(""));         // 0

  console.log("\n--- Exercise 17: Move Zeroes ---");
  const arr17 = [0, 1, 0, 3, 12];
  solution17_moveZeroes(arr17);
  console.log(arr17); // [1, 3, 12, 0, 0]

  console.log("\n--- Exercise 18: Product Except Self ---");
  console.log(solution18_productExceptSelf([1, 2, 3, 4]));        // [24, 12, 8, 6]
  console.log(solution18_productExceptSelf([-1, 1, 0, -3, 3]));   // [0, 0, 9, 0, 0]

  console.log("\n" + "=".repeat(60));
  console.log("All solutions executed successfully!");
  console.log("=".repeat(60));
}

runAllSolutions();
