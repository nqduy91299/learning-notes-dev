// ===================================================================
// Greedy Algorithms - Exercises
// ===================================================================
// 12 exercises: 4 predict, 2 fix, 6 implement
// Config: ES2022, strict mode, ESNext modules
// Run: npx tsx exercises.ts
// ===================================================================

// ===================================================================
// PREDICT EXERCISES (4)
// ===================================================================

// --- Predict 1: Activity Selection ---
function predictActivitySelection(): void {
  const activities: [number, number][] = [
    [1, 3], [2, 5], [4, 7], [1, 8], [5, 9], [8, 10],
  ];
  activities.sort((a, b) => a[1] - b[1]);

  const selected: [number, number][] = [activities[0]];
  let lastEnd = activities[0][1];

  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= lastEnd) {
      selected.push(activities[i]);
      lastEnd = activities[i][1];
    }
  }

  console.log("Count:", selected.length);
  console.log("Selected:", selected.map(a => `[${a[0]},${a[1]}]`).join(" "));
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictActivitySelection();

// --- Predict 2: Jump Game ---
function predictJumpGame(): void {
  const nums = [2, 3, 1, 1, 4];
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) {
      console.log(false);
      return;
    }
    maxReach = Math.max(maxReach, i + nums[i]);
  }

  console.log(true);
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictJumpGame();

// --- Predict 3: Greedy Coin Change ---
function predictGreedyCoin(): void {
  const coins = [1, 3, 4];
  const amount = 6;
  let remaining = amount;
  let count = 0;

  const sorted = [...coins].sort((a, b) => b - a);
  for (const coin of sorted) {
    while (remaining >= coin) {
      remaining -= coin;
      count++;
    }
  }

  console.log(`Coins used: ${count}`);
  // Is this optimal? The DP answer for coins=[1,3,4], amount=6 is 2 (3+3).
}
// PREDICT: What is logged? Is the greedy result optimal?
// YOUR ANSWER:
//
// predictGreedyCoin();

// --- Predict 4: Merge Intervals Overlap Check ---
function predictMergeOverlap(): void {
  const intervals: [number, number][] = [[1, 3], [2, 6], [8, 10], [15, 18]];
  intervals.sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push(intervals[i]);
    }
  }

  console.log(merged.length);
  console.log(merged.map(m => `[${m[0]},${m[1]}]`).join(" "));
}
// PREDICT: What is logged?
// YOUR ANSWER:
//
// predictMergeOverlap();

// ===================================================================
// FIX EXERCISES (2)
// ===================================================================

// --- Fix 1: Jump Game II (minimum jumps) ---
// BUG: Returns wrong number of jumps
function fixJumpGameII(nums: number[]): number {
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length; i++) { // BUG: should be i < nums.length - 1
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }

  return jumps;
}

// TEST (commented):
// console.assert(fixJumpGameII([2, 3, 1, 1, 4]) === 2, "Fix 1a failed");
// console.assert(fixJumpGameII([2, 3, 0, 1, 4]) === 2, "Fix 1b failed");

// --- Fix 2: Non-overlapping Intervals (minimum removals) ---
// BUG: Wrong sorting criterion
function fixEraseOverlapIntervals(intervals: number[][]): number {
  if (intervals.length === 0) return 0;
  intervals.sort((a, b) => a[0] - b[0]); // BUG: should sort by end time a[1] - b[1]

  let count = 0;
  let lastEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < lastEnd) {
      count++;
      lastEnd = Math.min(lastEnd, intervals[i][1]);
    } else {
      lastEnd = intervals[i][1];
    }
  }

  return count;
}

// TEST (commented):
// console.assert(fixEraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]) === 1, "Fix 2a failed");
// console.assert(fixEraseOverlapIntervals([[1,2],[1,2],[1,2]]) === 2, "Fix 2b failed");

// ===================================================================
// IMPLEMENT EXERCISES (6)
// ===================================================================

// --- Implement 1: Activity Selection ---
// Given activities as [start, end] pairs, return the maximum number
// of non-overlapping activities.
// Time: O(n log n), Space: O(1) (excluding output)
function activitySelection(activities: [number, number][]): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(activitySelection([[1,3],[2,5],[4,7],[1,8],[5,9],[8,10]]) === 3, "Impl 1a failed");
// console.assert(activitySelection([[1,2],[3,4],[0,6],[5,7],[8,9],[5,9]]) === 4, "Impl 1b failed");

// --- Implement 2: Jump Game ---
// Given an array where each element is the max jump length at that position,
// return true if you can reach the last index.
// Time: O(n), Space: O(1)
function canJump(nums: number[]): boolean {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(canJump([2, 3, 1, 1, 4]) === true, "Impl 2a failed");
// console.assert(canJump([3, 2, 1, 0, 4]) === false, "Impl 2b failed");
// console.assert(canJump([0]) === true, "Impl 2c failed");

// --- Implement 3: Minimum Coins (Greedy — standard denominations only) ---
// Given standard US coin denominations [1, 5, 10, 25] and an amount,
// return the minimum number of coins AND the coins used.
// Time: O(n) where n = number of denominations, Space: O(1)
function minimumCoinsGreedy(amount: number): { count: number; coins: number[] } {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// const r1 = minimumCoinsGreedy(41);
// console.assert(r1.count === 4, "Impl 3a failed"); // 25+10+5+1
// const r2 = minimumCoinsGreedy(30);
// console.assert(r2.count === 2, "Impl 3b failed"); // 25+5

// --- Implement 4: Merge Intervals ---
// Given an array of intervals, merge all overlapping intervals.
// Time: O(n log n), Space: O(n)
function mergeIntervals(intervals: number[][]): number[][] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// const m1 = mergeIntervals([[1,3],[2,6],[8,10],[15,18]]);
// console.assert(m1.length === 3, "Impl 4a failed");
// const m2 = mergeIntervals([[1,4],[4,5]]);
// console.assert(m2.length === 1, "Impl 4b failed");

// --- Implement 5: Non-overlapping Intervals ---
// Return the minimum number of intervals to remove so that the
// remaining intervals don't overlap.
// Time: O(n log n), Space: O(1)
function eraseOverlapIntervals(intervals: number[][]): number {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// console.assert(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]) === 1, "Impl 5a failed");
// console.assert(eraseOverlapIntervals([[1,2],[1,2],[1,2]]) === 2, "Impl 5b failed");
// console.assert(eraseOverlapIntervals([[1,2],[2,3]]) === 0, "Impl 5c failed");

// --- Implement 6: Partition Labels ---
// Given a string, partition it into as many parts as possible so that
// each letter appears in at most one part. Return the sizes of the parts.
// Time: O(n), Space: O(1) (26 letters)
function partitionLabels(s: string): number[] {
  // YOUR CODE HERE
  throw new Error("Not implemented");
}

// TEST (commented):
// const p1 = partitionLabels("ababcbacadefegdehijhklij");
// console.assert(p1[0] === 9 && p1[1] === 7 && p1[2] === 8, "Impl 6a failed");
// const p2 = partitionLabels("eccbbbbdec");
// console.assert(p2[0] === 10, "Impl 6b failed");

// ===================================================================
// Runner
// ===================================================================
function main(): void {
  console.log("=== Greedy Algorithms Exercises ===\n");

  console.log("--- Predict Exercises ---");
  console.log("Uncomment each predict function call and compare with your answer.\n");

  console.log("--- Fix Exercises ---");
  console.log("Fix the bugs and uncomment the tests to verify.\n");

  console.log("--- Implement Exercises ---");
  console.log("Implement each function and uncomment the tests to verify.\n");

  // Uncomment to run:
  // predictActivitySelection();
  // predictJumpGame();
  // predictGreedyCoin();
  // predictMergeOverlap();

  // console.log("Fix 1:", fixJumpGameII([2, 3, 1, 1, 4]));
  // console.log("Fix 2:", fixEraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]));

  // console.log("Impl 1:", activitySelection([[1,3],[2,5],[4,7],[1,8],[5,9],[8,10]]));
  // console.log("Impl 2:", canJump([2, 3, 1, 1, 4]));
  // console.log("Impl 3:", minimumCoinsGreedy(41));
  // console.log("Impl 4:", mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));
  // console.log("Impl 5:", eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]));
  // console.log("Impl 6:", partitionLabels("ababcbacadefegdehijhklij"));
}

main();
