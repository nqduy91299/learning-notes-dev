// ===================================================================
// Sliding Window - Exercises
// ===================================================================
// 12 exercises: 4 predict, 2 fix, 6 implement
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx exercises.ts
// ===================================================================

// ===================================================================
// PREDICT EXERCISES (4)
// ===================================================================

// --- Predict 1: Fixed Window Sum ---
function predictFixedWindow(): void {
  const arr = [2, 1, 5, 1, 3, 2];
  const k = 3;

  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  console.log(`Max sum: ${maxSum}`);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictFixedWindow();

// --- Predict 2: Longest Unique Substring ---
function predictLongestUnique(): void {
  const s = "abcabcbb";
  const seen = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right])! >= left) {
      left = seen.get(s[right])! + 1;
    }
    seen.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  console.log(`Max length: ${maxLen}`);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictLongestUnique();

// --- Predict 3: Variable Window Shrink Count ---
function predictShrinkCount(): void {
  const arr = [2, 3, 1, 2, 4, 3];
  const target = 7;
  let left = 0;
  let sum = 0;
  let shrinks = 0;

  for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    while (sum >= target) {
      sum -= arr[left];
      left++;
      shrinks++;
    }
  }

  console.log(`Shrinks: ${shrinks}`);
}
// PREDICT: How many times does the left pointer advance?
// YOUR ANSWER:
//
// predictShrinkCount();

// --- Predict 4: Window Frequency Map ---
function predictFreqMap(): void {
  const s = "aababc";
  const freq = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    freq.set(s[right], (freq.get(s[right]) ?? 0) + 1);

    while (freq.size > 2) {
      const leftChar = s[left];
      freq.set(leftChar, freq.get(leftChar)! - 1);
      if (freq.get(leftChar) === 0) freq.delete(leftChar);
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  console.log(`Max length with ≤2 distinct: ${maxLen}`);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictFreqMap();

// ===================================================================
// FIX EXERCISES (2)
// ===================================================================

// --- Fix 1: Max Sum Subarray of Size K ---
// BUG: Off-by-one in window sliding
function fixMaxSumSubarray(arr: number[], k: number): number {
  if (arr.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k + 1]; // BUG: should be arr[i - k]
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// TEST (commented):
// console.assert(fixMaxSumSubarray([2, 1, 5, 1, 3, 2], 3) === 9, "Fix 1a failed");
// console.assert(fixMaxSumSubarray([2, 3, 4, 1, 5], 2) === 7, "Fix 1b failed");

// --- Fix 2: Minimum Size Subarray Sum ---
// BUG: Wrong result tracking
function fixMinSubarrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLen = nums.length + 1;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLen = right - left; // BUG: should be right - left + 1
      sum -= nums[left];
      left++;
    }
  }

  return minLen === nums.length + 1 ? 0 : minLen;
}

// TEST (commented):
// console.assert(fixMinSubarrayLen(7, [2, 3, 1, 2, 4, 3]) === 2, "Fix 2a failed");
// console.assert(fixMinSubarrayLen(4, [1, 4, 4]) === 1, "Fix 2b failed");
// console.assert(fixMinSubarrayLen(11, [1, 1, 1, 1]) === 0, "Fix 2c failed");

// ===================================================================
// IMPLEMENT EXERCISES (6)
// ===================================================================

// --- Implement 1: Max Sum Subarray of Size K (Fixed Window) ---
// Given an array and integer k, find the maximum sum of any
// contiguous subarray of size k.
// Time: O(n), Space: O(1)
function maxSumSubarray(arr: number[], k: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(maxSumSubarray([2, 1, 5, 1, 3, 2], 3) === 9, "Impl 1a failed");
// console.assert(maxSumSubarray([2, 3, 4, 1, 5], 2) === 7, "Impl 1b failed");
// console.assert(maxSumSubarray([1], 1) === 1, "Impl 1c failed");

// --- Implement 2: Longest Substring Without Repeating Characters ---
// Return the length of the longest substring with all unique characters.
// Time: O(n), Space: O(min(n, alphabet))
function lengthOfLongestSubstring(s: string): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(lengthOfLongestSubstring("abcabcbb") === 3, "Impl 2a failed");
// console.assert(lengthOfLongestSubstring("bbbbb") === 1, "Impl 2b failed");
// console.assert(lengthOfLongestSubstring("pwwkew") === 3, "Impl 2c failed");
// console.assert(lengthOfLongestSubstring("") === 0, "Impl 2d failed");

// --- Implement 3: Minimum Size Subarray Sum ---
// Find the minimal length of a contiguous subarray with sum ≥ target.
// Return 0 if no such subarray exists.
// Time: O(n), Space: O(1)
function minSubArrayLen(target: number, nums: number[]): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]) === 2, "Impl 3a failed");
// console.assert(minSubArrayLen(4, [1, 4, 4]) === 1, "Impl 3b failed");
// console.assert(minSubArrayLen(11, [1, 1, 1, 1, 1]) === 0, "Impl 3c failed");

// --- Implement 4: Fruit Into Baskets ---
// Given an array of fruit types, find the longest subarray with at most
// 2 distinct values (you have 2 baskets, each holds one type).
// Time: O(n), Space: O(1)
function totalFruit(fruits: number[]): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(totalFruit([1, 2, 1]) === 3, "Impl 4a failed");
// console.assert(totalFruit([0, 1, 2, 2]) === 3, "Impl 4b failed");
// console.assert(totalFruit([1, 2, 3, 2, 2]) === 4, "Impl 4c failed");
// console.assert(totalFruit([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]) === 5, "Impl 4d failed");

// --- Implement 5: Longest Repeating Character Replacement ---
// Given a string and integer k, find the longest substring where you
// can replace at most k characters to make all characters the same.
// Time: O(n), Space: O(1)
function characterReplacement(s: string, k: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(characterReplacement("ABAB", 2) === 4, "Impl 5a failed");
// console.assert(characterReplacement("AABABBA", 1) === 4, "Impl 5b failed");

// --- Implement 6: Minimum Window Substring ---
// Given strings s and t, find the minimum window in s that contains
// all characters of t (including duplicates). Return "" if no such window.
// Time: O(n + m), Space: O(m)
function minWindow(s: string, t: string): string {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(minWindow("ADOBECODEBANC", "ABC") === "BANC", "Impl 6a failed");
// console.assert(minWindow("a", "a") === "a", "Impl 6b failed");
// console.assert(minWindow("a", "aa") === "", "Impl 6c failed");

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Sliding Window Exercises ===\n");

  console.log("--- Predict Exercises ---");
  console.log("Uncomment each predict function call and compare with your answer.\n");

  console.log("--- Fix Exercises ---");
  console.log("Fix the bugs and uncomment the tests to verify.\n");

  console.log("--- Implement Exercises ---");
  console.log("Implement each function and uncomment the tests to verify.\n");

  // Uncomment to run:
  // predictFixedWindow();
  // predictLongestUnique();
  // predictShrinkCount();
  // predictFreqMap();

  // console.log("Fix 1:", fixMaxSumSubarray([2, 1, 5, 1, 3, 2], 3));
  // console.log("Fix 2:", fixMinSubarrayLen(7, [2, 3, 1, 2, 4, 3]));

  // console.log("Impl 1:", maxSumSubarray([2, 1, 5, 1, 3, 2], 3));
  // console.log("Impl 2:", lengthOfLongestSubstring("abcabcbb"));
  // console.log("Impl 3:", minSubArrayLen(7, [2, 3, 1, 2, 4, 3]));
  // console.log("Impl 4:", totalFruit([1, 2, 3, 2, 2]));
  // console.log("Impl 5:", characterReplacement("AABABBA", 1));
  // console.log("Impl 6:", minWindow("ADOBECODEBANC", "ABC"));
}

main();
