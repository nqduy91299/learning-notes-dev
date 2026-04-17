// ============================================================================
// Arrays & Strings - Exercises
// ============================================================================
// 18 exercises: 4 predict-output, 4 fix-the-bug, 10 implement
// All test code is commented out. No `any` types. Must compile with strict TS.
// Run with: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// PREDICT THE OUTPUT (Exercises 1-4)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Array Mutation and References
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise1_predict(): void {
  const a = [1, 2, 3, 4, 5];
  const b = a;
  b[0] = 99;
  const c = a.slice();
  c[1] = 88;

  console.log(a[0]); // ???
  console.log(a[1]); // ???
  console.log(c[0]); // ???
}

// Your answer:
// a[0] = ???
// a[1] = ???
// c[0] = ???

// ----------------------------------------------------------------------------
// Exercise 2: String Immutability
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise2_predict(): void {
  let s = "hello";
  const t = s;
  s += " world";

  console.log(t);        // ???
  console.log(s.length); // ???

  const arr = s.split("");
  arr[0] = "H";
  console.log(s[0]);           // ???
  console.log(arr.join("")); // ???
}

// Your answer:
// t = ???
// s.length = ???
// s[0] = ???
// arr.join("") = ???

// ----------------------------------------------------------------------------
// Exercise 3: Splice vs Slice
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise3_predict(): void {
  const nums = [10, 20, 30, 40, 50];
  const sliced = nums.slice(1, 3);
  const spliced = nums.splice(1, 2, 99);

  console.log(sliced);  // ???
  console.log(spliced); // ???
  console.log(nums);    // ???
}

// Your answer:
// sliced = ???
// spliced = ???
// nums = ???

// ----------------------------------------------------------------------------
// Exercise 4: Array Methods Chaining
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise4_predict(): void {
  const result = [1, 2, 3, 4, 5]
    .filter((x) => x % 2 !== 0)
    .map((x) => x * x)
    .reduce((acc, x) => acc + x, 0);

  console.log(result); // ???

  const arr = [3, 1, 4, 1, 5];
  const sorted = [...arr].sort((a, b) => a - b);
  console.log(arr[0]);    // ???
  console.log(sorted[0]); // ???
}

// Your answer:
// result = ???
// arr[0] = ???
// sorted[0] = ???

// ============================================================================
// FIX THE BUG (Exercises 5-8)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 5: Two Sum - Fix the bug
// Should return indices of two numbers that add up to target.
// Bug: returns wrong results or crashes.
// ----------------------------------------------------------------------------
function exercise5_twoSumBuggy(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();
  for (let i = 0; i <= nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return null;
}

// Test (commented out):
// console.log(exercise5_twoSumBuggy([2, 7, 11, 15], 9)); // should be [0, 1]

// ----------------------------------------------------------------------------
// Exercise 6: Reverse String In-Place - Fix the bug
// Should reverse the array of characters in place.
// Bug: doesn't fully reverse.
// ----------------------------------------------------------------------------
function exercise6_reverseBuggy(s: string[]): void {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    left++;
    // missing right decrement
  }
}

// Test (commented out):
// const chars = ["h", "e", "l", "l", "o"];
// exercise6_reverseBuggy(chars);
// console.log(chars); // should be ["o", "l", "l", "e", "h"]

// ----------------------------------------------------------------------------
// Exercise 7: Max Subarray Sum (Sliding Window) - Fix the bug
// Should return max sum of k consecutive elements.
// Bug: off-by-one or wrong window update.
// ----------------------------------------------------------------------------
function exercise7_maxSumBuggy(arr: number[], k: number): number {
  if (arr.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k + 1]; // Bug: wrong element subtracted
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// Test (commented out):
// console.log(exercise7_maxSumBuggy([1, 4, 2, 10, 23, 3, 1, 0, 20], 4)); // should be 39

// ----------------------------------------------------------------------------
// Exercise 8: String Compression - Fix the bug
// "aabcccccaaa" => "a2b1c5a3"
// Bug: produces wrong output.
// ----------------------------------------------------------------------------
function exercise8_compressBuggy(s: string): string {
  if (s.length === 0) return s;

  const parts: string[] = [];
  let count = 1;

  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      count++;
    } else {
      parts.push(s[i] + String(count)); // Bug: should be s[i-1], not s[i]
      count = 1;
    }
  }
  // Bug: missing the last group

  return parts.join("");
}

// Test (commented out):
// console.log(exercise8_compressBuggy("aabcccccaaa")); // should be "a2b1c5a3"

// ============================================================================
// IMPLEMENT (Exercises 9-18)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 9: Valid Palindrome
// Given a string, determine if it's a palindrome considering only alphanumeric
// characters and ignoring case.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function exercise9_isPalindrome(s: string): boolean {
  // TODO: Implement using two pointers
  return false;
}

// Test (commented out):
// console.log(exercise9_isPalindrome("A man, a plan, a canal: Panama")); // true
// console.log(exercise9_isPalindrome("race a car")); // false
// console.log(exercise9_isPalindrome("")); // true

// ----------------------------------------------------------------------------
// Exercise 10: Container With Most Water
// Given array of heights, find two lines that form a container holding most water.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function exercise10_maxArea(height: number[]): number {
  // TODO: Implement using two pointers (opposite direction)
  return 0;
}

// Test (commented out):
// console.log(exercise10_maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49

// ----------------------------------------------------------------------------
// Exercise 11: Prefix Sum - Range Sum Query
// Build a class that preprocesses an array and answers range sum queries in O(1).
// ----------------------------------------------------------------------------
class exercise11_NumArray {
  private prefix: number[];

  constructor(nums: number[]) {
    // TODO: Build prefix sum array
    this.prefix = [];
  }

  sumRange(left: number, right: number): number {
    // TODO: Return sum of nums[left..right] inclusive
    return 0;
  }
}

// Test (commented out):
// const numArr = new exercise11_NumArray([-2, 0, 3, -5, 2, -1]);
// console.log(numArr.sumRange(0, 2)); // 1
// console.log(numArr.sumRange(2, 5)); // -1
// console.log(numArr.sumRange(0, 5)); // -3

// ----------------------------------------------------------------------------
// Exercise 12: Remove Duplicates from Sorted Array
// Remove duplicates in-place from sorted array, return new length.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function exercise12_removeDuplicates(nums: number[]): number {
  // TODO: Implement using two pointers (same direction)
  return 0;
}

// Test (commented out):
// const arr12 = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
// const len12 = exercise12_removeDuplicates(arr12);
// console.log(len12); // 5
// console.log(arr12.slice(0, len12)); // [0, 1, 2, 3, 4]

// ----------------------------------------------------------------------------
// Exercise 13: Rotate Array
// Rotate array to the right by k steps. In-place, O(1) extra space.
// Use the "three reverses" technique.
// ----------------------------------------------------------------------------
function exercise13_rotate(nums: number[], k: number): void {
  // TODO: Implement using three reverses
}

// Test (commented out):
// const arr13 = [1, 2, 3, 4, 5, 6, 7];
// exercise13_rotate(arr13, 3);
// console.log(arr13); // [5, 6, 7, 1, 2, 3, 4]

// ----------------------------------------------------------------------------
// Exercise 14: Anagram Check
// Return true if t is an anagram of s. Use character frequency counting.
// Time: O(n), Space: O(1) (fixed alphabet)
// ----------------------------------------------------------------------------
function exercise14_isAnagram(s: string, t: string): boolean {
  // TODO: Implement using frequency array or map
  return false;
}

// Test (commented out):
// console.log(exercise14_isAnagram("anagram", "nagaram")); // true
// console.log(exercise14_isAnagram("rat", "car")); // false
// console.log(exercise14_isAnagram("listen", "silent")); // true

// ----------------------------------------------------------------------------
// Exercise 15: Two Sum (Hash Map Approach)
// Return indices of two numbers that add up to target.
// Time: O(n), Space: O(n)
// ----------------------------------------------------------------------------
function exercise15_twoSum(nums: number[], target: number): [number, number] | null {
  // TODO: Implement using a hash map (single pass)
  return null;
}

// Test (commented out):
// console.log(exercise15_twoSum([2, 7, 11, 15], 9)); // [0, 1]
// console.log(exercise15_twoSum([3, 2, 4], 6)); // [1, 2]
// console.log(exercise15_twoSum([1, 2, 3], 10)); // null

// ----------------------------------------------------------------------------
// Exercise 16: Sliding Window - Longest Substring Without Repeating Characters
// Time: O(n), Space: O(min(n, alphabet_size))
// ----------------------------------------------------------------------------
function exercise16_lengthOfLongestSubstring(s: string): number {
  // TODO: Implement using sliding window + set/map
  return 0;
}

// Test (commented out):
// console.log(exercise16_lengthOfLongestSubstring("abcabcbb")); // 3
// console.log(exercise16_lengthOfLongestSubstring("bbbbb")); // 1
// console.log(exercise16_lengthOfLongestSubstring("pwwkew")); // 3
// console.log(exercise16_lengthOfLongestSubstring("")); // 0

// ----------------------------------------------------------------------------
// Exercise 17: Move Zeroes
// Move all 0's to end while maintaining relative order of non-zero elements.
// In-place. Time: O(n), Space: O(1).
// ----------------------------------------------------------------------------
function exercise17_moveZeroes(nums: number[]): void {
  // TODO: Implement using two pointers (partitioning)
}

// Test (commented out):
// const arr17 = [0, 1, 0, 3, 12];
// exercise17_moveZeroes(arr17);
// console.log(arr17); // [1, 3, 12, 0, 0]

// ----------------------------------------------------------------------------
// Exercise 18: Product of Array Except Self
// Return array where result[i] = product of all elements except nums[i].
// Time: O(n), Space: O(1) (output array doesn't count)
// Do NOT use division.
// ----------------------------------------------------------------------------
function exercise18_productExceptSelf(nums: number[]): number[] {
  // TODO: Implement using left and right prefix products
  return [];
}

// Test (commented out):
// console.log(exercise18_productExceptSelf([1, 2, 3, 4])); // [24, 12, 8, 6]
// console.log(exercise18_productExceptSelf([-1, 1, 0, -3, 3])); // [0, 0, 9, 0, 0]

// ============================================================================
// Suppress unused warnings
// ============================================================================
void exercise1_predict;
void exercise2_predict;
void exercise3_predict;
void exercise4_predict;
void exercise5_twoSumBuggy;
void exercise6_reverseBuggy;
void exercise7_maxSumBuggy;
void exercise8_compressBuggy;
void exercise9_isPalindrome;
void exercise10_maxArea;
void exercise11_NumArray;
void exercise12_removeDuplicates;
void exercise13_rotate;
void exercise14_isAnagram;
void exercise15_twoSum;
void exercise16_lengthOfLongestSubstring;
void exercise17_moveZeroes;
void exercise18_productExceptSelf;

console.log("Arrays & Strings exercises loaded. Uncomment tests to run.");
