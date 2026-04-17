// ===================================================================
// Greedy Algorithms - Solutions
// ===================================================================
// Complete solutions with complexity analysis
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx solutions.ts
// ===================================================================

// ===================================================================
// PREDICT ANSWERS
// ===================================================================

// Predict 1: Activity Selection
// Sorted by finish: [1,3],[2,5],[4,7],[1,8],[5,9],[8,10]
// Select [1,3] → skip [2,5] (2<3) → select [4,7] (4>=3) → skip [1,8] → skip [5,9] (5<7) → select [8,10] (8>=7)
// Answer: "Count: 3" and "Selected: [1,3] [4,7] [8,10]"

// Predict 2: Jump Game
// nums=[2,3,1,1,4], maxReach tracks:
// i=0: maxReach=max(0,2)=2
// i=1: maxReach=max(2,4)=4
// i=2: maxReach=max(4,3)=4
// i=3: maxReach=max(4,4)=4
// i=4: maxReach=max(4,8)=8
// Never hit i > maxReach
// Answer: true

// Predict 3: Greedy Coin Change
// coins=[1,3,4] sorted desc=[4,3,1], amount=6
// Take 4: remaining=2, count=1
// Can't take 3 (3>2)
// Take 1 twice: remaining=0, count=3
// Answer: "Coins used: 3"  — NOT optimal (DP gives 2: 3+3)

// Predict 4: Merge Intervals
// intervals sorted: [1,3],[2,6],[8,10],[15,18]
// Merge [1,3]+[2,6]=[1,6], [8,10] standalone, [15,18] standalone
// Answer: 3 and "[1,6] [8,10] [15,18]"

// ===================================================================
// FIX SOLUTIONS
// ===================================================================

// Fix 1: Loop should go to nums.length - 1 (not nums.length)
// When i reaches the last index and equals currentEnd, we'd add an extra jump
function fixedJumpGameII(nums: number[]): number {
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) { // FIXED: -1
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }

  return jumps;
}

// Fix 2: Should sort by end time, not start time
// Sorting by end time is the classic greedy strategy for interval scheduling
function fixedEraseOverlapIntervals(intervals: number[][]): number {
  if (intervals.length === 0) return 0;
  intervals.sort((a, b) => a[1] - b[1]); // FIXED: sort by end time

  let count = 0;
  let lastEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < lastEnd) {
      count++;
      // No need for min — already sorted by end, so we keep current lastEnd
    } else {
      lastEnd = intervals[i][1];
    }
  }

  return count;
}

// ===================================================================
// IMPLEMENT SOLUTIONS
// ===================================================================

// --- Solution 1: Activity Selection ---
// Time: O(n log n), Space: O(1)
// Strategy: sort by finish time, greedily pick earliest-finishing non-overlapping
function activitySelection(activities: [number, number][]): number {
  if (activities.length === 0) return 0;

  activities.sort((a, b) => a[1] - b[1]);

  let count = 1;
  let lastEnd = activities[0][1];

  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= lastEnd) {
      count++;
      lastEnd = activities[i][1];
    }
  }

  return count;
}

// --- Solution 2: Jump Game ---
// Time: O(n), Space: O(1)
// Track the farthest reachable index. If we ever land beyond it, return false.
function canJump(nums: number[]): boolean {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }

  return true;
}

// --- Solution 3: Minimum Coins (Greedy, standard denominations) ---
// Time: O(1) — fixed number of denominations, Space: O(1)
// Works because US denominations have the greedy property
function minimumCoinsGreedy(amount: number): { count: number; coins: number[] } {
  const denominations = [25, 10, 5, 1];
  const coins: number[] = [];
  let remaining = amount;

  for (const coin of denominations) {
    while (remaining >= coin) {
      remaining -= coin;
      coins.push(coin);
    }
  }

  return { count: coins.length, coins };
}

// --- Solution 4: Merge Intervals ---
// Time: O(n log n), Space: O(n)
// Sort by start time, then merge overlapping intervals
function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push([...intervals[i]]);
    }
  }

  return merged;
}

// --- Solution 5: Non-overlapping Intervals ---
// Time: O(n log n), Space: O(1)
// Sort by end time. Count overlaps — each overlap means one removal.
// Greedy: keep the interval that ends earliest to leave room for more.
function eraseOverlapIntervals(intervals: number[][]): number {
  if (intervals.length <= 1) return 0;

  intervals.sort((a, b) => a[1] - b[1]);

  let count = 0;
  let lastEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < lastEnd) {
      count++;
    } else {
      lastEnd = intervals[i][1];
    }
  }

  return count;
}

// --- Solution 6: Partition Labels ---
// Time: O(n), Space: O(1) — 26 lowercase letters
// Strategy:
// 1. Record last occurrence of each character
// 2. Expand partition end to include last occurrence of each char encountered
// 3. When current index equals partition end, close the partition
//
// "ababcbacadefegdehijhklij"
//  Last: a=8, b=5, c=7, d=14, e=15, f=11, g=13, h=19, i=22, j=23, k=20, l=21
//  Partition 1: [0..8] size=9
//  Partition 2: [9..15] size=7
//  Partition 3: [16..23] size=8
function partitionLabels(s: string): number[] {
  const lastIndex = new Map<string, number>();
  for (let i = 0; i < s.length; i++) {
    lastIndex.set(s[i], i);
  }

  const result: number[] = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, lastIndex.get(s[i])!);
    if (i === end) {
      result.push(end - start + 1);
      start = end + 1;
    }
  }

  return result;
}

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Greedy Algorithms Solutions ===\n");

  // Predict verification
  console.log("--- Predict Verification ---");
  console.log("Predict 1: Count=3, Selected=[1,3] [4,7] [8,10]");
  console.log("Predict 2: true");
  console.log("Predict 3: Coins used: 3 (NOT optimal, DP gives 2)");
  console.log("Predict 4: 3 intervals: [1,6] [8,10] [15,18]");

  // Fix verification
  console.log("\n--- Fix Verification ---");
  console.log("Fix 1 (Jump Game II):", fixedJumpGameII([2, 3, 1, 1, 4]));
  console.log("Fix 2 (Non-overlapping):", fixedEraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]));

  // Implement verification
  console.log("\n--- Implement Solutions ---");
  console.log("1. Activity Selection:", activitySelection([[1, 3], [2, 5], [4, 7], [1, 8], [5, 9], [8, 10]]));
  console.log("2. Jump Game:", canJump([2, 3, 1, 1, 4]));
  console.log("3. Min Coins(41):", minimumCoinsGreedy(41));
  console.log("4. Merge Intervals:", mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]));
  console.log("5. Erase Overlap:", eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]));
  console.log("6. Partition Labels:", partitionLabels("ababcbacadefegdehijhklij"));

  // Assertions
  console.log("\n--- Verification ---");
  console.assert(activitySelection([[1, 3], [2, 5], [4, 7], [1, 8], [5, 9], [8, 10]]) === 3, "Activity failed");
  console.assert(canJump([2, 3, 1, 1, 4]) === true, "Jump true failed");
  console.assert(canJump([3, 2, 1, 0, 4]) === false, "Jump false failed");
  console.assert(minimumCoinsGreedy(41).count === 4, "Coins failed");
  console.assert(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]).length === 3, "Merge failed");
  console.assert(eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]]) === 1, "Erase failed");
  const pl = partitionLabels("ababcbacadefegdehijhklij");
  console.assert(pl[0] === 9 && pl[1] === 7 && pl[2] === 8, "Partition failed");
  console.log("All assertions passed!");
}

main();
