// ===================================================================
// Sliding Window - Solutions
// ===================================================================
// Complete solutions with complexity analysis
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx solutions.ts
// ===================================================================

// ===================================================================
// PREDICT ANSWERS
// ===================================================================

// Predict 1: Fixed Window Sum
// arr=[2,1,5,1,3,2], k=3
// Initial: 2+1+5=8
// Slide: +1-2=7, +3-1=9, +2-5=6
// Max: 9
// Answer: "Max sum: 9"

// Predict 2: Longest Unique Substring
// s="abcabcbb"
// a→ab→abc(3)→dup a, left=1→bca(3)→dup b, left=2→cab(3)
// →dup c, left=3→abc(3)→dup b, left=4→cb(2)→dup b, left=5→b(1)
// Max: 3
// Answer: "Max length: 3"

// Predict 3: Variable Window Shrink Count
// arr=[2,3,1,2,4,3], target=7
// right=3: sum=8≥7, shrink(left=0→1, sum=6), shrinks=1
// right=4: sum=10≥7, shrink(left=1→2, sum=7), shrinks=2
//          sum=7≥7, shrink(left=2→3, sum=6), shrinks=3
// right=5: sum=9≥7, shrink(left=3→4, sum=7), shrinks=4
//          sum=7≥7, shrink(left=4→5, sum=3), shrinks=5
// Answer: "Shrinks: 5"

// Predict 4: Window Frequency Map (≤2 distinct)
// s="aababc"
// a(1)→aa(2)→aab(3, 2 distinct)→aaba(4, 2 distinct)→aabab(5, 2 distinct)
// →aababc(6, 3 distinct)→shrink: ababc(5,3)→babc(4,3)→abc(3,3)→bc(2,2)
// Max: 5 ("aabab")
// Answer: "Max length with ≤2 distinct: 5"

// ===================================================================
// FIX SOLUTIONS
// ===================================================================

// Fix 1: Should subtract arr[i - k], not arr[i - k + 1]
function fixedMaxSumSubarray(arr: number[], k: number): number {
  if (arr.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // FIXED
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// Fix 2: Should be right - left + 1 (inclusive length)
function fixedMinSubarrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLen = nums.length + 1;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1); // FIXED
      sum -= nums[left];
      left++;
    }
  }

  return minLen === nums.length + 1 ? 0 : minLen;
}

// ===================================================================
// IMPLEMENT SOLUTIONS
// ===================================================================

// --- Solution 1: Max Sum Subarray of Size K ---
// Time: O(n), Space: O(1)
//
// arr=[2,1,5,1,3,2], k=3
// Window sums: 8, 7, 9, 6
// Answer: 9
function maxSumSubarray(arr: number[], k: number): number {
  if (arr.length < k) return 0;

  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// --- Solution 2: Longest Substring Without Repeating Characters ---
// Time: O(n), Space: O(min(n, alphabet))
//
// Use a map to store last seen index of each character.
// When duplicate found, jump left pointer past previous occurrence.
//
// "abcabcbb":
// right=0 'a': seen={a:0}, len=1
// right=1 'b': seen={a:0,b:1}, len=2
// right=2 'c': seen={a:0,b:1,c:2}, len=3
// right=3 'a': dup, left=1, seen={a:3,b:1,c:2}, len=3
// right=4 'b': dup, left=2, len=3
// right=5 'c': dup, left=3, len=3
// right=6 'b': dup, left=5, len=2
// right=7 'b': dup, left=7, len=1
// Answer: 3
function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    if (lastSeen.has(s[right]) && lastSeen.get(s[right])! >= left) {
      left = lastSeen.get(s[right])! + 1;
    }
    lastSeen.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// --- Solution 3: Minimum Size Subarray Sum ---
// Time: O(n), Space: O(1)
//
// Variable window: expand right, shrink left while sum ≥ target.
//
// target=7, nums=[2,3,1,2,4,3]
// [2,3,1,2]=8 → shrink [3,1,2]=6 → expand [3,1,2,4]=10
// → shrink [1,2,4]=7 → shrink [2,4]=6 → expand [2,4,3]=9
// → shrink [4,3]=7 → shrink [3]=3
// Min length: 2 (either [4,3] or [1,2,4]... actually [4,3]=2)
function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

// --- Solution 4: Fruit Into Baskets ---
// Time: O(n), Space: O(1)
//
// Longest subarray with at most 2 distinct values.
// Use frequency map, shrink when distinct > 2.
//
// fruits=[1,2,3,2,2]
// [1](1 type)→[1,2](2)→[1,2,3](3, shrink)→[2,3](2)→[2,3,2](2)→[2,3,2,2](2)
// Max: 4
function totalFruit(fruits: number[]): number {
  const freq = new Map<number, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < fruits.length; right++) {
    freq.set(fruits[right], (freq.get(fruits[right]) ?? 0) + 1);

    while (freq.size > 2) {
      const leftFruit = fruits[left];
      const count = freq.get(leftFruit)! - 1;
      if (count === 0) freq.delete(leftFruit);
      else freq.set(leftFruit, count);
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// --- Solution 5: Longest Repeating Character Replacement ---
// Time: O(n), Space: O(1)
//
// Window is valid when: windowSize - maxFreq <= k
// (we need to replace windowSize - maxFreq characters)
//
// "AABABBA", k=1
// Track maxFreq in window. When window invalid, shrink.
// Note: maxFreq doesn't need to be decremented on shrink —
// we only care about windows at least as large as current best.
function characterReplacement(s: string, k: number): number {
  const freq = new Array<number>(26).fill(0);
  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const idx = s.charCodeAt(right) - 65; // 'A' = 65
    freq[idx]++;
    maxFreq = Math.max(maxFreq, freq[idx]);

    while (right - left + 1 - maxFreq > k) {
      freq[s.charCodeAt(left) - 65]--;
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// --- Solution 6: Minimum Window Substring ---
// Time: O(n + m), Space: O(m)
//
// Strategy:
// 1. Count required characters from t
// 2. Expand window right to include characters
// 3. When all chars satisfied, shrink from left to minimize
// 4. Track minimum window
//
// s="ADOBECODEBANC", t="ABC"
// Need: A=1, B=1, C=1
// Expand to "ADOBEC" (all present) → shrink "DOBEC" (missing A)
// Continue expanding... eventually find "BANC" (len=4) ← minimum
function minWindow(s: string, t: string): string {
  if (t.length > s.length) return "";

  const required = new Map<string, number>();
  for (const ch of t) {
    required.set(ch, (required.get(ch) ?? 0) + 1);
  }

  const windowFreq = new Map<string, number>();
  let satisfied = 0;
  const needed = required.size;

  let left = 0;
  let minLen = Infinity;
  let minStart = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    windowFreq.set(ch, (windowFreq.get(ch) ?? 0) + 1);

    if (required.has(ch) && windowFreq.get(ch) === required.get(ch)) {
      satisfied++;
    }

    while (satisfied === needed) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }

      const leftCh = s[left];
      if (required.has(leftCh) && windowFreq.get(leftCh) === required.get(leftCh)) {
        satisfied--;
      }
      windowFreq.set(leftCh, windowFreq.get(leftCh)! - 1);
      left++;
    }
  }

  return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Sliding Window Solutions ===\n");

  // Predict verification
  console.log("--- Predict Verification ---");
  console.log("Predict 1: Max sum: 9");
  console.log("Predict 2: Max length: 3");
  console.log("Predict 3: Shrinks: 5");
  console.log("Predict 4: Max length with ≤2 distinct: 5");

  // Fix verification
  console.log("\n--- Fix Verification ---");
  console.log("Fix 1:", fixedMaxSumSubarray([2, 1, 5, 1, 3, 2], 3));
  console.log("Fix 2:", fixedMinSubarrayLen(7, [2, 3, 1, 2, 4, 3]));

  // Implement verification
  console.log("\n--- Implement Solutions ---");
  console.log("1. Max Sum k=3:", maxSumSubarray([2, 1, 5, 1, 3, 2], 3));
  console.log("2. Longest Unique:", lengthOfLongestSubstring("abcabcbb"));
  console.log("3. Min Subarray Sum:", minSubArrayLen(7, [2, 3, 1, 2, 4, 3]));
  console.log("4. Fruit Baskets:", totalFruit([1, 2, 3, 2, 2]));
  console.log("5. Char Replace:", characterReplacement("AABABBA", 1));
  console.log("6. Min Window:", minWindow("ADOBECODEBANC", "ABC"));

  // Assertions
  console.log("\n--- Verification ---");
  console.assert(maxSumSubarray([2, 1, 5, 1, 3, 2], 3) === 9, "MaxSum failed");
  console.assert(maxSumSubarray([2, 3, 4, 1, 5], 2) === 7, "MaxSum 2 failed");

  console.assert(lengthOfLongestSubstring("abcabcbb") === 3, "Longest 1 failed");
  console.assert(lengthOfLongestSubstring("bbbbb") === 1, "Longest 2 failed");
  console.assert(lengthOfLongestSubstring("pwwkew") === 3, "Longest 3 failed");
  console.assert(lengthOfLongestSubstring("") === 0, "Longest empty failed");

  console.assert(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]) === 2, "MinSub 1 failed");
  console.assert(minSubArrayLen(4, [1, 4, 4]) === 1, "MinSub 2 failed");
  console.assert(minSubArrayLen(11, [1, 1, 1, 1, 1]) === 0, "MinSub 3 failed");

  console.assert(totalFruit([1, 2, 1]) === 3, "Fruit 1 failed");
  console.assert(totalFruit([0, 1, 2, 2]) === 3, "Fruit 2 failed");
  console.assert(totalFruit([1, 2, 3, 2, 2]) === 4, "Fruit 3 failed");
  console.assert(totalFruit([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]) === 5, "Fruit 4 failed");

  console.assert(characterReplacement("ABAB", 2) === 4, "CharReplace 1 failed");
  console.assert(characterReplacement("AABABBA", 1) === 4, "CharReplace 2 failed");

  console.assert(minWindow("ADOBECODEBANC", "ABC") === "BANC", "MinWindow 1 failed");
  console.assert(minWindow("a", "a") === "a", "MinWindow 2 failed");
  console.assert(minWindow("a", "aa") === "", "MinWindow 3 failed");

  console.log("All assertions passed!");
}

main();
