// ===================================================================
// Backtracking - Exercises
// ===================================================================
// 15 exercises: 5 predict, 3 fix, 7 implement
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx exercises.ts
// ===================================================================

// ===================================================================
// PREDICT EXERCISES (5)
// ===================================================================

// --- Predict 1: Simple Backtrack Pattern ---
function predictBacktrack(): void {
  const result: string[] = [];

  function backtrack(path: string, choices: string[]): void {
    if (path.length === 2) {
      result.push(path);
      return;
    }
    for (const ch of choices) {
      backtrack(path + ch, choices.filter(c => c !== ch));
    }
  }

  backtrack("", ["a", "b", "c"]);
  console.log(result.join(", "));
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictBacktrack();

// --- Predict 2: Subsets Count ---
function predictSubsetsCount(): void {
  let count = 0;

  function subsets(nums: number[], index: number, current: number[]): void {
    count++;
    for (let i = index; i < nums.length; i++) {
      current.push(nums[i]);
      subsets(nums, i + 1, current);
      current.pop();
    }
  }

  subsets([1, 2, 3], 0, []);
  console.log(`Count: ${count}`);
}
// PREDICT: How many times is the function called (count)?
// YOUR ANSWER:
//
// predictSubsetsCount();

// --- Predict 3: Combination Sum Paths ---
function predictCombinationPaths(): void {
  const result: number[][] = [];

  function combine(
    candidates: number[],
    target: number,
    start: number,
    path: number[]
  ): void {
    if (target === 0) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > target) break;
      path.push(candidates[i]);
      combine(candidates, target - candidates[i], i, path);
      path.pop();
    }
  }

  combine([2, 3, 5], 8, 0, []);
  console.log("Solutions:", result.length);
}
// PREDICT: How many solutions?
// YOUR ANSWER:
//
// predictCombinationPaths();

// --- Predict 4: Permutation with Duplicates ---
function predictPermDups(): void {
  const result: number[][] = [];

  function permute(nums: number[], path: number[], used: boolean[]): void {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      path.push(nums[i]);
      permute(nums, path, used);
      path.pop();
      used[i] = false;
    }
  }

  const nums = [1, 1, 2];
  nums.sort((a, b) => a - b);
  permute(nums, [], new Array(nums.length).fill(false));
  console.log("Permutations:", result.length);
}
// PREDICT: How many unique permutations?
// YOUR ANSWER:
//
// predictPermDups();

// --- Predict 5: N-Queens Pruning ---
function predictQueensPrune(): void {
  let attempts = 0;

  function solve(
    n: number,
    row: number,
    cols: Set<number>,
    diags: Set<number>,
    antiDiags: Set<number>
  ): number {
    if (row === n) return 1;
    let count = 0;
    for (let col = 0; col < n; col++) {
      attempts++;
      if (cols.has(col) || diags.has(row - col) || antiDiags.has(row + col)) continue;
      cols.add(col);
      diags.add(row - col);
      antiDiags.add(row + col);
      count += solve(n, row + 1, cols, diags, antiDiags);
      cols.delete(col);
      diags.delete(row - col);
      antiDiags.delete(row + col);
    }
    return count;
  }

  const solutions = solve(4, 0, new Set(), new Set(), new Set());
  console.log(`Solutions: ${solutions}, Attempts: ${attempts}`);
}
// PREDICT: How many solutions for 4-Queens? (Attempts is bonus)
// YOUR ANSWER:
//
// predictQueensPrune();

// ===================================================================
// FIX EXERCISES (3)
// ===================================================================

// --- Fix 1: Subsets (missing backtrack step) ---
function fixSubsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(index: number, current: number[]): void {
    result.push([...current]);

    for (let i = index; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      // BUG: missing current.pop() — the backtrack step
    }
  }

  backtrack(0, []);
  return result;
}

// TEST (commented):
// const s = fixSubsets([1, 2, 3]);
// console.assert(s.length === 8, `Fix 1 failed: got ${s.length}`);

// --- Fix 2: Combinations (wrong start index) ---
function fixCombinations(n: number, k: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }

    for (let i = start; i <= n; i++) {
      current.push(i);
      backtrack(start, current); // BUG: should be backtrack(i + 1, current)
      current.pop();
    }
  }

  backtrack(1, []);
  return result;
}

// TEST (commented):
// const c = fixCombinations(4, 2);
// console.assert(c.length === 6, `Fix 2 failed: got ${c.length}`);

// --- Fix 3: Permutations (incorrect used tracking) ---
function fixPermutations(nums: number[]): number[][] {
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
      // BUG: missing used[i] = false — must unmark when backtracking
    }
  }

  backtrack([]);
  return result;
}

// TEST (commented):
// const p = fixPermutations([1, 2, 3]);
// console.assert(p.length === 6, `Fix 3 failed: got ${p.length}`);

// ===================================================================
// IMPLEMENT EXERCISES (7)
// ===================================================================

// --- Implement 1: Generate All Permutations ---
// Given an array of distinct integers, return all possible permutations.
// Time: O(n! * n), Space: O(n)
function permute(nums: number[]): number[][] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(permute([1, 2, 3]).length === 6, "Impl 1a failed");
// console.assert(permute([0, 1]).length === 2, "Impl 1b failed");
// console.assert(permute([1]).length === 1, "Impl 1c failed");

// --- Implement 2: Generate All Combinations ---
// Return all combinations of k numbers from 1..n.
// Time: O(C(n,k) * k), Space: O(k)
function combine(n: number, k: number): number[][] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(combine(4, 2).length === 6, "Impl 2a failed");
// console.assert(combine(1, 1).length === 1, "Impl 2b failed");

// --- Implement 3: Generate All Subsets ---
// Given an array of distinct integers, return all possible subsets.
// Time: O(2^n * n), Space: O(n)
function subsets(nums: number[]): number[][] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(subsets([1, 2, 3]).length === 8, "Impl 3a failed");
// console.assert(subsets([0]).length === 2, "Impl 3b failed");

// --- Implement 4: Letter Combinations of Phone Number ---
// Given a string of digits 2-9, return all possible letter combinations.
// Mapping: 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz
// Time: O(4^n * n), Space: O(n)
function letterCombinations(digits: string): string[] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(letterCombinations("23").length === 9, "Impl 4a failed");
// console.assert(letterCombinations("").length === 0, "Impl 4b failed");
// console.assert(letterCombinations("2").length === 3, "Impl 4c failed");

// --- Implement 5: N-Queens ---
// Place n queens on an n×n board so no two attack each other.
// Return the number of distinct solutions.
// Time: O(n!), Space: O(n)
function solveNQueens(n: number): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(solveNQueens(4) === 2, "Impl 5a failed");
// console.assert(solveNQueens(1) === 1, "Impl 5b failed");
// console.assert(solveNQueens(8) === 92, "Impl 5c failed");

// --- Implement 6: Palindrome Partitioning ---
// Given a string, partition it so every substring is a palindrome.
// Return all possible palindrome partitionings.
// Time: O(n * 2^n), Space: O(n)
function palindromePartition(s: string): string[][] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// const pp1 = palindromePartition("aab");
// console.assert(pp1.length === 2, "Impl 6a failed"); // [["a","a","b"],["aa","b"]]
// const pp2 = palindromePartition("a");
// console.assert(pp2.length === 1, "Impl 6b failed");

// --- Implement 7: Combination Sum ---
// Given candidates (no duplicates) and a target, find all unique combinations
// where candidates sum to target. Each candidate can be used unlimited times.
// Time: O(n^(target/min)), Space: O(target/min)
function combinationSum(candidates: number[], target: number): number[][] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// const cs1 = combinationSum([2, 3, 6, 7], 7);
// console.assert(cs1.length === 2, "Impl 7a failed"); // [[2,2,3],[7]]
// const cs2 = combinationSum([2, 3, 5], 8);
// console.assert(cs2.length === 3, "Impl 7b failed"); // [[2,2,2,2],[2,3,3],[3,5]]

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Backtracking Exercises ===\n");

  console.log("--- Predict Exercises ---");
  console.log("Uncomment each predict function call and compare with your answer.\n");

  console.log("--- Fix Exercises ---");
  console.log("Fix the bugs and uncomment the tests to verify.\n");

  console.log("--- Implement Exercises ---");
  console.log("Implement each function and uncomment the tests to verify.\n");

  // Uncomment to run:
  // predictBacktrack();
  // predictSubsetsCount();
  // predictCombinationPaths();
  // predictPermDups();
  // predictQueensPrune();

  // console.log("Fix 1:", fixSubsets([1, 2, 3]).length);
  // console.log("Fix 2:", fixCombinations(4, 2).length);
  // console.log("Fix 3:", fixPermutations([1, 2, 3]).length);

  // console.log("Impl 1:", permute([1, 2, 3]).length);
  // console.log("Impl 2:", combine(4, 2).length);
  // console.log("Impl 3:", subsets([1, 2, 3]).length);
  // console.log("Impl 4:", letterCombinations("23").length);
  // console.log("Impl 5:", solveNQueens(4));
  // console.log("Impl 6:", palindromePartition("aab").length);
  // console.log("Impl 7:", combinationSum([2, 3, 6, 7], 7).length);
}

main();
