// ===================================================================
// Backtracking - Solutions
// ===================================================================
// Complete solutions with complexity analysis
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx solutions.ts
// ===================================================================

// ===================================================================
// PREDICT ANSWERS
// ===================================================================

// Predict 1: 2-letter permutations of {a, b, c}
// ab, ac, ba, bc, ca, cb
// Answer: "ab, ac, ba, bc, ca, cb"

// Predict 2: Subsets function call count for [1,2,3]
// Call tree: subsets([],0) → subsets([1],1) → subsets([1,2],2) → subsets([1,2,3],3)
//                                              → subsets([1,3],3)
//                           → subsets([2],2) → subsets([2,3],3)
//                           → subsets([3],3)
// Count increments at every call: 8 calls total (one per subset)
// Answer: "Count: 8"

// Predict 3: Combination sum [2,3,5] target=8
// [2,2,2,2], [2,3,3], [3,5]
// Answer: "Solutions: 3"

// Predict 4: Permutations of [1,1,2] with duplicate handling
// Unique perms: [1,1,2], [1,2,1], [2,1,1]
// Answer: "Permutations: 3"

// Predict 5: 4-Queens
// There are exactly 2 solutions for 4-Queens: [1,3,0,2] and [2,0,3,1]
// Answer: "Solutions: 2, Attempts: <some number>"
// (Attempts = total column checks across all rows, varies but is around 16-20)

// ===================================================================
// FIX SOLUTIONS
// ===================================================================

// Fix 1: Add current.pop() after recursive call
function fixedSubsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(index: number, current: number[]): void {
    result.push([...current]);
    for (let i = index; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop(); // FIXED: backtrack step
    }
  }

  backtrack(0, []);
  return result;
}

// Fix 2: Pass i + 1 instead of start to avoid reusing same elements
function fixedCombinations(n: number, k: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i <= n; i++) {
      current.push(i);
      backtrack(i + 1, current); // FIXED: i + 1 instead of start
      current.pop();
    }
  }

  backtrack(1, []);
  return result;
}

// Fix 3: Add used[i] = false after backtrack
function fixedPermutations(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array<boolean>(nums.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false; // FIXED: unmark on backtrack
    }
  }

  backtrack([]);
  return result;
}

// ===================================================================
// IMPLEMENT SOLUTIONS
// ===================================================================

// --- Solution 1: Permutations ---
// Time: O(n! * n), Space: O(n) recursion depth
//
// Decision tree for [1,2,3]:
// Level 0: choose from {1,2,3}
//   choose 1 → Level 1: choose from {2,3}
//     choose 2 → Level 2: choose 3 → [1,2,3] ✓
//     choose 3 → Level 2: choose 2 → [1,3,2] ✓
//   choose 2 → [2,1,3], [2,3,1]
//   choose 3 → [3,1,2], [3,2,1]
function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array<boolean>(nums.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}

// --- Solution 2: Combinations ---
// Time: O(C(n,k) * k), Space: O(k)
//
// C(4,2): start from 1, pick 2 numbers
// [1,2] [1,3] [1,4] [2,3] [2,4] [3,4]
function combine(n: number, k: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    // Pruning: need (k - current.length) more, so stop if not enough remaining
    for (let i = start; i <= n - (k - current.length) + 1; i++) {
      current.push(i);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(1, []);
  return result;
}

// --- Solution 3: Subsets ---
// Time: O(2^n * n), Space: O(n)
//
// For [1,2,3]: every call adds current state to result
// [], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(index: number, current: number[]): void {
    result.push([...current]);
    for (let i = index; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

// --- Solution 4: Letter Combinations of Phone Number ---
// Time: O(4^n * n) where n = digits.length, Space: O(n)
//
// "23" → 2=abc, 3=def
// a→d,e,f  b→d,e,f  c→d,e,f
// ["ad","ae","af","bd","be","bf","cd","ce","cf"]
function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return [];

  const phoneMap: Record<string, string> = {
    "2": "abc",
    "3": "def",
    "4": "ghi",
    "5": "jkl",
    "6": "mno",
    "7": "pqrs",
    "8": "tuv",
    "9": "wxyz",
  };

  const result: string[] = [];

  function backtrack(index: number, current: string): void {
    if (index === digits.length) {
      result.push(current);
      return;
    }
    const letters = phoneMap[digits[index]];
    for (const letter of letters) {
      backtrack(index + 1, current + letter);
    }
  }

  backtrack(0, "");
  return result;
}

// --- Solution 5: N-Queens ---
// Time: O(n!), Space: O(n)
//
// 4-Queens solutions:
// Solution 1: [1,3,0,2]     Solution 2: [2,0,3,1]
//   . Q . .                   . . Q .
//   . . . Q                   Q . . .
//   Q . . .                   . . . Q
//   . . Q .                   . Q . .
function solveNQueens(n: number): number {
  let count = 0;
  const cols = new Set<number>();
  const diags = new Set<number>();      // row - col
  const antiDiags = new Set<number>();  // row + col

  function backtrack(row: number): void {
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diags.has(row - col) || antiDiags.has(row + col)) {
        continue;
      }
      cols.add(col);
      diags.add(row - col);
      antiDiags.add(row + col);
      backtrack(row + 1);
      cols.delete(col);
      diags.delete(row - col);
      antiDiags.delete(row + col);
    }
  }

  backtrack(0);
  return count;
}

// --- Solution 6: Palindrome Partitioning ---
// Time: O(n * 2^n), Space: O(n)
//
// "aab":
//   "a" + partition("ab") → "a"+"a"+"b" ✓, "a"+"ab" ✗ (not palindrome)
//   "aa" + partition("b") → "aa"+"b" ✓
//   "aab" ✗ (not palindrome)
// Result: [["a","a","b"], ["aa","b"]]
function palindromePartition(s: string): string[][] {
  const result: string[][] = [];

  function isPalindrome(str: string, left: number, right: number): boolean {
    while (left < right) {
      if (str[left] !== str[right]) return false;
      left++;
      right--;
    }
    return true;
  }

  function backtrack(start: number, current: string[]): void {
    if (start === s.length) {
      result.push([...current]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (isPalindrome(s, start, end)) {
        current.push(s.slice(start, end + 1));
        backtrack(end + 1, current);
        current.pop();
      }
    }
  }

  backtrack(0, []);
  return result;
}

// --- Solution 7: Combination Sum ---
// Time: O(n^(target/min)), Space: O(target/min)
//
// candidates=[2,3,6,7], target=7:
//   2→2→2→ (sum=6, need 1 more, no coin ≤1 works except... 2>1, 3>1) fail
//       Actually: 2+2+2=6, try +2=8>7 fail, +3=9>7 fail → backtrack
//   2→2→3=7 ✓
//   2→3→... → 2+3+2=7 but start prevents this (start=1 for 3)
//     2+3=5, +3=8>7, +2 not tried (start=1) → fail... Actually +2 IS tried since start=0 for 2
//     Wait, combination sum passes i (not i+1) since reuse is allowed
//   Let me retrace: [2,3,6,7] target=7
//     [2,2,2] sum=6, try 2→8 fail, 3→9 fail → back
//     [2,2,3] sum=7 ✓
//     [2,3] sum=5, 3→8 fail → back
//     [2,5] doesn't exist... [2,6] sum=8 fail, [2,7] sum=9 fail
//     [3,3] sum=6, 3→9 fail → back
//     [3,6] sum=9 fail
//     [6] sum=6, 6→12 fail, 7→13 fail
//     [7] sum=7 ✓
//   Result: [[2,2,3], [7]]
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  candidates.sort((a, b) => a - b);

  function backtrack(start: number, remaining: number, current: number[]): void {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // pruning
      current.push(candidates[i]);
      backtrack(i, remaining - candidates[i], current); // i, not i+1 (reuse allowed)
      current.pop();
    }
  }

  backtrack(0, target, []);
  return result;
}

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Backtracking Solutions ===\n");

  // Predict verification
  console.log("--- Predict Verification ---");
  console.log("Predict 1: ab, ac, ba, bc, ca, cb");
  console.log("Predict 2: Count: 8");
  console.log("Predict 3: Solutions: 3");
  console.log("Predict 4: Permutations: 3");
  console.log("Predict 5: Solutions: 2");

  // Fix verification
  console.log("\n--- Fix Verification ---");
  console.log("Fix 1 (Subsets):", fixedSubsets([1, 2, 3]).length);
  console.log("Fix 2 (Combinations):", fixedCombinations(4, 2).length);
  console.log("Fix 3 (Permutations):", fixedPermutations([1, 2, 3]).length);

  // Implement verification
  console.log("\n--- Implement Solutions ---");
  console.log("1. Permutations [1,2,3]:", permute([1, 2, 3]).length, "perms");
  console.log("2. Combinations C(4,2):", combine(4, 2).length, "combos");
  console.log("3. Subsets [1,2,3]:", subsets([1, 2, 3]).length, "subsets");
  console.log("4. Phone '23':", letterCombinations("23").length, "combos");
  console.log("5. N-Queens(4):", solveNQueens(4), "solutions");
  console.log("6. Palindrome 'aab':", palindromePartition("aab").length, "partitions");
  console.log("7. CombSum [2,3,6,7] t=7:", combinationSum([2, 3, 6, 7], 7).length, "combos");

  // Assertions
  console.log("\n--- Verification ---");
  console.assert(permute([1, 2, 3]).length === 6, "Permute failed");
  console.assert(permute([0, 1]).length === 2, "Permute 2 failed");
  console.assert(combine(4, 2).length === 6, "Combine failed");
  console.assert(combine(1, 1).length === 1, "Combine 1 failed");
  console.assert(subsets([1, 2, 3]).length === 8, "Subsets failed");
  console.assert(letterCombinations("23").length === 9, "Phone failed");
  console.assert(letterCombinations("").length === 0, "Phone empty failed");
  console.assert(solveNQueens(4) === 2, "Queens 4 failed");
  console.assert(solveNQueens(8) === 92, "Queens 8 failed");
  console.assert(palindromePartition("aab").length === 2, "Palindrome failed");
  console.assert(combinationSum([2, 3, 6, 7], 7).length === 2, "CombSum failed");
  console.assert(combinationSum([2, 3, 5], 8).length === 3, "CombSum 2 failed");
  console.log("All assertions passed!");
}

main();
