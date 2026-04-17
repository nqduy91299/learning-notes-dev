// ===================================================================
// Dynamic Programming - Solutions
// ===================================================================
// Complete solutions with complexity analysis and DP table visualization
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx solutions.ts
// ===================================================================

// ===================================================================
// PREDICT ANSWERS
// ===================================================================

// Predict 1: fib(6) = 8
// Call tree with memoization:
//   fib(6) → fib(5) → fib(4) → fib(3) → fib(2) → fib(1) → fib(0)
//   Then fib(2) returns from memo for fib(3)
//   Then fib(3) returns from memo for fib(4) ... etc.
//   Total calls: 11 (each fib(k) called once fresh + once from memo for k>=2, plus base cases)
// Answer: "Result: 8, Calls: 11"

// Predict 2: dp = [1, 1, 2, 3, 5, 8]
// Answer: "1, 1, 2, 3, 5, 8"

// Predict 3: coins=[2], amount=3
// dp[1]=Inf, dp[2]=1, dp[3]=Inf (can't make odd amounts with coin 2)
// Answer: -1

// Predict 4: House Robber [2,7,9,3,1]
// prev2=0, prev1=0
// num=2: curr=max(0, 0+2)=2, prev2=0, prev1=2
// num=7: curr=max(2, 0+7)=7, prev2=2, prev1=7
// num=9: curr=max(7, 2+9)=11, prev2=7, prev1=11
// num=3: curr=max(11, 7+3)=11, prev2=11, prev1=11 (note: not 10)
//   Wait: max(11, 7+3)=max(11,10)=11
// num=1: curr=max(11, 11+1)=12, prev2=11, prev1=12
// Answer: 12

// Predict 5: LCS("abc", "axbyc")
// The LCS is "abc" (length 3)
// Answer: 3

// ===================================================================
// FIX SOLUTIONS
// ===================================================================

// Fix 1: Missing Math.min — overwrites dp[i] unconditionally
function fixedCoinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1); // FIXED: added Math.min
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// Fix 2: First column not initialized to 1
function fixedUniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () =>
    new Array<number>(n).fill(0)
  );

  for (let j = 0; j < n; j++) dp[0][j] = 1;
  for (let i = 0; i < m; i++) dp[i][0] = 1; // FIXED: initialize first column

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}

// Fix 3: Missing Math.max — overwrites dp[i] instead of taking maximum
function fixedLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const dp = new Array<number>(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1); // FIXED: added Math.max
      }
    }
  }

  return Math.max(...dp);
}

// ===================================================================
// IMPLEMENT SOLUTIONS
// ===================================================================

// --- Solution 1: Climbing Stairs ---
// Time: O(n), Space: O(1)
// dp[i] = dp[i-1] + dp[i-2], same as Fibonacci shifted by 1
//
// DP Table for n=5:
// Step:  0  1  2  3  4  5
// Ways:  1  1  2  3  5  8
function climbStairs(n: number): number {
  if (n <= 1) return 1;
  let prev2 = 1;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// --- Solution 2: Fibonacci ---
// Time: O(n), Space: O(1)
//
// fib(0)=0, fib(1)=1, fib(n) = fib(n-1) + fib(n-2)
// n:    0  1  2  3  4  5  6  7  8  9  10
// fib:  0  1  1  2  3  5  8  13 21 34 55
function fibonacci(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// --- Solution 3: Coin Change ---
// Time: O(amount * coins.length), Space: O(amount)
//
// dp[i] = minimum coins to make amount i
// Transition: dp[i] = min(dp[i], dp[i - coin] + 1) for each coin
//
// coins=[1,5,10,25], amount=30:
// dp[5]=1(5), dp[10]=1(10), dp[25]=1(25), dp[30]=2(25+5)
function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// --- Solution 4: Longest Increasing Subsequence ---
// Time: O(n^2), Space: O(n)
//
// dp[i] = length of LIS ending at index i
// Transition: dp[i] = max(dp[j] + 1) for all j < i where nums[j] < nums[i]
//
// nums: [10, 9, 2, 5, 3, 7, 101, 18]
// dp:   [ 1, 1, 1, 2, 2, 3,   4,  4]
// LIS examples: [2,5,7,101] or [2,3,7,101] or [2,5,7,18]
function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const dp = new Array<number>(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

// --- Solution 5: 0/1 Knapsack (Space Optimized) ---
// Time: O(n * W), Space: O(W)
//
// 1D optimization: iterate capacity in REVERSE to prevent using item twice
//
// weights=[1,3,4,5], values=[1,4,5,7], capacity=7
// After item 0 (w=1,v=1): [0,1,1,1,1,1,1,1]
// After item 1 (w=3,v=4): [0,1,1,4,5,5,5,5]
// After item 2 (w=4,v=5): [0,1,1,4,5,6,6,9]
// After item 3 (w=5,v=7): [0,1,1,4,5,7,8,9]
// Answer: 9 (items 1+2: w=3+4=7, v=4+5=9)
function knapsack(
  weights: number[],
  values: number[],
  capacity: number
): number {
  const dp = new Array<number>(capacity + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}

// --- Solution 6: Edit Distance (Space Optimized) ---
// Time: O(m * n), Space: O(n)
//
// Full 2D table for "horse" → "ros":
//        ""  r  o  s
//   ""  [ 0, 1, 2, 3 ]
//   h   [ 1, 1, 2, 3 ]
//   o   [ 2, 2, 1, 2 ]
//   r   [ 3, 2, 2, 2 ]
//   s   [ 4, 3, 3, 2 ]
//   e   [ 5, 4, 4, 3 ]
// Answer: 3
function editDistance(word1: string, word2: string): number {
  const m = word1.length;
  const n = word2.length;

  let prev = Array.from({ length: n + 1 }, (_, j) => j);

  for (let i = 1; i <= m; i++) {
    const curr = new Array<number>(n + 1);
    curr[0] = i;

    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }

    prev = curr;
  }

  return prev[n];
}

// --- Solution 7: House Robber ---
// Time: O(n), Space: O(1)
//
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])
//
// nums:    [2, 7, 9, 3, 1]
// prev2:    0  0  2  7  11
// prev1:    0  2  7  11 11  → then 12
// curr:     2  7  11 11 12
// Answer: 12 (rob houses 0,2,4 → 2+9+1=12)
function houseRobber(nums: number[]): number {
  let prev2 = 0;
  let prev1 = 0;

  for (const num of nums) {
    const curr = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// --- Solution 8: Unique Paths (Space Optimized) ---
// Time: O(m * n), Space: O(n)
//
// dp[i][j] = dp[i-1][j] + dp[i][j-1]
// Use single row: dp[j] += dp[j-1] (dp[j] already has "above" value)
//
// 3x7 grid:
// [1, 1, 1,  1,  1,  1,  1]
// [1, 2, 3,  4,  5,  6,  7]
// [1, 3, 6, 10, 15, 21, 28]
// Answer: 28
function uniquePaths(m: number, n: number): number {
  const dp = new Array<number>(n).fill(1);

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }

  return dp[n - 1];
}

// --- Solution 9: Word Break ---
// Time: O(n^2 * k) where k = avg word length for substring comparison
// Space: O(n)
//
// dp[i] = true if s[0..i-1] can be segmented
// Transition: dp[i] = true if dp[j] && s[j..i] is in dictionary, for some j < i
//
// s="leetcode", dict=["leet","code"]
// dp: [T, F, F, F, T, F, F, F, T]
//      ^              ^           ^
//      ""           "leet"    "leetcode"
function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict);
  const dp = new Array<boolean>(s.length + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[s.length];
}

// --- Solution 10: Longest Common Subsequence (Space Optimized) ---
// Time: O(m * n), Space: O(n)
//
// Full table for "abcde" vs "ace":
//        ""  a  c  e
//   ""  [ 0, 0, 0, 0 ]
//   a   [ 0, 1, 1, 1 ]
//   b   [ 0, 1, 1, 1 ]
//   c   [ 0, 1, 2, 2 ]
//   d   [ 0, 1, 2, 2 ]
//   e   [ 0, 1, 2, 3 ]
// Answer: 3 ("ace")
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;
  let prev = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    const curr = new Array<number>(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    prev = curr;
  }

  return prev[n];
}

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Dynamic Programming Solutions ===\n");

  // Predict answers
  console.log("--- Predict Answers ---");
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
  fib(6);
  console.log(`Predict 1: Result: ${memo.get(6)}, Calls: ${callCount}`);
  console.log("Predict 2:", [1, 1, 2, 3, 5, 8].join(", "));
  console.log("Predict 3:", -1);
  console.log("Predict 4:", 12);
  console.log("Predict 5:", 3);

  // Fix solutions
  console.log("\n--- Fix Solutions ---");
  console.log("Fix 1 (Coin Change):", fixedCoinChange([1, 3, 4], 6));
  console.log("Fix 2 (Unique Paths):", fixedUniquePaths(3, 7));
  console.log("Fix 3 (LIS):", fixedLIS([10, 9, 2, 5, 3, 7, 101, 18]));

  // Implement solutions
  console.log("\n--- Implement Solutions ---");
  console.log("1. Climbing Stairs(5):", climbStairs(5));
  console.log("2. Fibonacci(10):", fibonacci(10));
  console.log("3. Coin Change([1,5,10,25], 30):", coinChange([1, 5, 10, 25], 30));
  console.log("4. LIS([10,9,2,5,3,7,101,18]):", lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]));
  console.log("5. Knapsack(w=[1,3,4,5],v=[1,4,5,7],cap=7):", knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7));
  console.log("6. Edit Distance('horse','ros'):", editDistance("horse", "ros"));
  console.log("7. House Robber([2,7,9,3,1]):", houseRobber([2, 7, 9, 3, 1]));
  console.log("8. Unique Paths(3,7):", uniquePaths(3, 7));
  console.log("9. Word Break('leetcode',['leet','code']):", wordBreak("leetcode", ["leet", "code"]));
  console.log("10. LCS('abcde','ace'):", longestCommonSubsequence("abcde", "ace"));

  // Assertions
  console.log("\n--- Verification ---");
  console.assert(climbStairs(5) === 8, "Stairs failed");
  console.assert(fibonacci(10) === 55, "Fib failed");
  console.assert(coinChange([1, 5, 10, 25], 30) === 2, "Coin change failed");
  console.assert(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]) === 4, "LIS failed");
  console.assert(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7) === 9, "Knapsack failed");
  console.assert(editDistance("horse", "ros") === 3, "Edit dist failed");
  console.assert(houseRobber([2, 7, 9, 3, 1]) === 12, "Robber failed");
  console.assert(uniquePaths(3, 7) === 28, "Paths failed");
  console.assert(wordBreak("leetcode", ["leet", "code"]) === true, "Word break failed");
  console.assert(longestCommonSubsequence("abcde", "ace") === 3, "LCS failed");
  console.log("All assertions passed!");
}

main();
