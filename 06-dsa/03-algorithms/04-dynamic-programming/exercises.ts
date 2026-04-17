// ===================================================================
// Dynamic Programming - Exercises
// ===================================================================
// 18 exercises: 5 predict, 3 fix, 10 implement
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx exercises.ts
// ===================================================================

// ===================================================================
// PREDICT EXERCISES (5)
// What will be logged?
// ===================================================================

// --- Predict 1: Fibonacci Memoization ---
function predictFib(): void {
  const memo = new Map<number, number>();
  let callCount = 0;

  function fib(n: number): number {
    callCount++;
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n)!;
    const result = fib(n - 1) + fib(n - 2);
    memo.set(n, result);
    return result;
  }

  const result = fib(6);
  console.log(`Result: ${result}, Calls: ${callCount}`);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictFib();

// --- Predict 2: Climbing Stairs Table ---
function predictStairs(): void {
  const dp: number[] = [1, 1];
  for (let i = 2; i <= 5; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  console.log(dp.join(", "));
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictStairs();

// --- Predict 3: Coin Change Edge Case ---
function predictCoinChange(): void {
  const coins = [2];
  const amount = 3;
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  console.log(dp[amount] === Infinity ? -1 : dp[amount]);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictCoinChange();

// --- Predict 4: House Robber Rolling Variables ---
function predictRobber(): void {
  const nums = [2, 7, 9, 3, 1];
  let prev2 = 0;
  let prev1 = 0;

  for (const num of nums) {
    const curr = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = curr;
  }

  console.log(prev1);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictRobber();

// --- Predict 5: LCS Length ---
function predictLCS(): void {
  const s1 = "abc";
  const s2 = "axbyc";
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  console.log(dp[m][n]);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictLCS();

// ===================================================================
// FIX EXERCISES (3)
// Each function has a bug. Find and fix it.
// ===================================================================

// --- Fix 1: Coin Change (minimum coins) ---
// BUG: Returns wrong answer for some inputs
function fixCoinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = dp[i - coin] + 1; // BUG: should be Math.min(dp[i], dp[i - coin] + 1)
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// TEST (commented):
// console.assert(fixCoinChange([1, 3, 4], 6) === 2, "Fix 1 failed"); // 3+3=6
// console.assert(fixCoinChange([2], 3) === -1, "Fix 1 edge case failed");

// --- Fix 2: Unique Paths ---
// BUG: Off-by-one error in grid initialization
function fixUniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () =>
    new Array<number>(n).fill(0)
  );

  // BUG: should fill first row AND first column with 1
  for (let j = 0; j < n; j++) dp[0][j] = 1;

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}

// TEST (commented):
// console.assert(fixUniquePaths(3, 7) === 28, "Fix 2 failed");
// console.assert(fixUniquePaths(3, 2) === 3, "Fix 2 case 2 failed");

// --- Fix 3: Longest Increasing Subsequence ---
// BUG: Wrong comparison direction
function fixLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const dp = new Array<number>(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = dp[j] + 1; // BUG: should be Math.max(dp[i], dp[j] + 1)
      }
    }
  }

  return Math.max(...dp);
}

// TEST (commented):
// console.assert(fixLIS([10, 9, 2, 5, 3, 7, 101, 18]) === 4, "Fix 3 failed");
// console.assert(fixLIS([0, 1, 0, 3, 2, 3]) === 4, "Fix 3 case 2 failed");

// ===================================================================
// IMPLEMENT EXERCISES (10)
// ===================================================================

// --- Implement 1: Climbing Stairs ---
// Given n steps, you can climb 1 or 2 steps at a time.
// Return the number of distinct ways to reach the top.
// Time: O(n), Space: O(1)
function climbStairs(n: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(climbStairs(2) === 2, "Impl 1a failed");
// console.assert(climbStairs(3) === 3, "Impl 1b failed");
// console.assert(climbStairs(5) === 8, "Impl 1c failed");

// --- Implement 2: Fibonacci (Bottom-Up, O(1) space) ---
// Return the nth Fibonacci number. fib(0)=0, fib(1)=1.
function fibonacci(n: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(fibonacci(0) === 0, "Impl 2a failed");
// console.assert(fibonacci(10) === 55, "Impl 2b failed");
// console.assert(fibonacci(20) === 6765, "Impl 2c failed");

// --- Implement 3: Coin Change (minimum coins) ---
// Given coin denominations and a target amount, return the fewest
// number of coins needed. Return -1 if not possible.
// Time: O(amount * coins.length), Space: O(amount)
function coinChange(coins: number[], amount: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(coinChange([1, 5, 10, 25], 30) === 2, "Impl 3a failed"); // 25+5
// console.assert(coinChange([2], 3) === -1, "Impl 3b failed");
// console.assert(coinChange([1], 0) === 0, "Impl 3c failed");

// --- Implement 4: Longest Increasing Subsequence ---
// Return the length of the longest strictly increasing subsequence.
// Time: O(n^2), Space: O(n)
function lengthOfLIS(nums: number[]): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]) === 4, "Impl 4a failed");
// console.assert(lengthOfLIS([0, 1, 0, 3, 2, 3]) === 4, "Impl 4b failed");
// console.assert(lengthOfLIS([7, 7, 7, 7]) === 1, "Impl 4c failed");

// --- Implement 5: 0/1 Knapsack ---
// Given items with weights and values, and a capacity W, return
// the maximum value achievable without exceeding capacity.
// Each item can be used at most once.
// Time: O(n * W), Space: O(W) (use 1D optimization)
function knapsack(
  weights: number[],
  values: number[],
  capacity: number
): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7) === 9, "Impl 5a failed");
// console.assert(knapsack([2, 3, 4], [3, 4, 5], 5) === 7, "Impl 5b failed");
// console.assert(knapsack([10], [100], 5) === 0, "Impl 5c failed");

// --- Implement 6: Edit Distance ---
// Given two strings, return the minimum number of operations
// (insert, delete, replace) to convert word1 to word2.
// Time: O(m * n), Space: O(n)
function editDistance(word1: string, word2: string): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(editDistance("horse", "ros") === 3, "Impl 6a failed");
// console.assert(editDistance("intention", "execution") === 5, "Impl 6b failed");
// console.assert(editDistance("", "abc") === 3, "Impl 6c failed");

// --- Implement 7: House Robber ---
// Given an array of non-negative integers representing money in each house,
// return the maximum you can rob without robbing two adjacent houses.
// Time: O(n), Space: O(1)
function houseRobber(nums: number[]): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(houseRobber([1, 2, 3, 1]) === 4, "Impl 7a failed");
// console.assert(houseRobber([2, 7, 9, 3, 1]) === 12, "Impl 7b failed");
// console.assert(houseRobber([2, 1, 1, 2]) === 4, "Impl 7c failed");

// --- Implement 8: Unique Paths ---
// A robot is at top-left of an m x n grid. It can only move right or down.
// Return the number of unique paths to bottom-right.
// Time: O(m * n), Space: O(n)
function uniquePaths(m: number, n: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(uniquePaths(3, 7) === 28, "Impl 8a failed");
// console.assert(uniquePaths(3, 2) === 3, "Impl 8b failed");
// console.assert(uniquePaths(1, 1) === 1, "Impl 8c failed");

// --- Implement 9: Word Break ---
// Given a string s and a dictionary of words, return true if s can be
// segmented into space-separated words from the dictionary.
// Time: O(n^2), Space: O(n)
function wordBreak(s: string, wordDict: string[]): boolean {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(wordBreak("leetcode", ["leet", "code"]) === true, "Impl 9a failed");
// console.assert(wordBreak("applepenapple", ["apple", "pen"]) === true, "Impl 9b failed");
// console.assert(wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]) === false, "Impl 9c failed");

// --- Implement 10: Longest Common Subsequence ---
// Given two strings, return the length of their longest common subsequence.
// Time: O(m * n), Space: O(n)
function longestCommonSubsequence(text1: string, text2: string): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(longestCommonSubsequence("abcde", "ace") === 3, "Impl 10a failed");
// console.assert(longestCommonSubsequence("abc", "abc") === 3, "Impl 10b failed");
// console.assert(longestCommonSubsequence("abc", "def") === 0, "Impl 10c failed");

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Dynamic Programming Exercises ===\n");

  console.log("--- Predict Exercises ---");
  console.log("Uncomment each predict function call and compare with your answer.\n");

  console.log("--- Fix Exercises ---");
  console.log("Fix the bugs and uncomment the tests to verify.\n");

  console.log("--- Implement Exercises ---");
  console.log("Implement each function and uncomment the tests to verify.\n");

  // Uncomment to run predict exercises:
  // predictFib();
  // predictStairs();
  // predictCoinChange();
  // predictRobber();
  // predictLCS();

  // Uncomment to test fix exercises after fixing:
  // console.log("Fix 1 (Coin Change):", fixCoinChange([1, 3, 4], 6));
  // console.log("Fix 2 (Unique Paths):", fixUniquePaths(3, 7));
  // console.log("Fix 3 (LIS):", fixLIS([10, 9, 2, 5, 3, 7, 101, 18]));

  // Uncomment to test implementations:
  // console.log("Impl 1 (Stairs):", climbStairs(5));
  // console.log("Impl 2 (Fib):", fibonacci(10));
  // console.log("Impl 3 (Coin Change):", coinChange([1, 5, 10, 25], 30));
  // console.log("Impl 4 (LIS):", lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]));
  // console.log("Impl 5 (Knapsack):", knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7));
  // console.log("Impl 6 (Edit Dist):", editDistance("horse", "ros"));
  // console.log("Impl 7 (Robber):", houseRobber([2, 7, 9, 3, 1]));
  // console.log("Impl 8 (Paths):", uniquePaths(3, 7));
  // console.log("Impl 9 (Word Break):", wordBreak("leetcode", ["leet", "code"]));
  // console.log("Impl 10 (LCS):", longestCommonSubsequence("abcde", "ace"));
}

main();
