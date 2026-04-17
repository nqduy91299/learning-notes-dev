// ============================================================================
// Searching Algorithms — Exercises
// ============================================================================
// Config: ES2022, strict mode, ESNext modules. Run with `npx tsx exercises.ts`
//
// 15 exercises total:
//   - 5 predict (trace through mentally, then verify)
//   - 3 fix (buggy implementations to debug)
//   - 7 implement (write from scratch)
//
// Tests are commented out. Uncomment to verify your solutions.
// ============================================================================

// ---------------------------------------------------------------------------
// PREDICT EXERCISES (5)
// ---------------------------------------------------------------------------

// PREDICT 1: Binary Search Steps
// How many comparisons does binary search make to find target = 7?
//
// Input: [1, 3, 5, 7, 9, 11, 13, 15]
//
// Your prediction:
//   Step 1: lo=?, hi=?, mid=?, arr[mid]=? → go left/right?
//   Step 2: lo=?, hi=?, mid=?, arr[mid]=? → found?
//   Total comparisons: ???
//
// function predictBinarySteps(): void {
//   const arr = [1, 3, 5, 7, 9, 11, 13, 15];
//   const target = 7;
//   let lo = 0, hi = arr.length - 1, steps = 0;
//   while (lo <= hi) {
//     const mid = lo + Math.floor((hi - lo) / 2);
//     steps++;
//     console.log(`Step ${steps}: lo=${lo} hi=${hi} mid=${mid} arr[mid]=${arr[mid]}`);
//     if (arr[mid] === target) { console.log(`Found at index ${mid}`); break; }
//     if (arr[mid] < target) lo = mid + 1;
//     else hi = mid - 1;
//   }
// }
// predictBinarySteps();

// PREDICT 2: Lower Bound Result
// What does lowerBound return for these inputs?
//
// arr = [1, 3, 3, 5, 5, 5, 7, 9]
//
// a) lowerBound(arr, 5)  → ???
// b) lowerBound(arr, 4)  → ???
// c) lowerBound(arr, 10) → ???
// d) lowerBound(arr, 0)  → ???
//
// function predictLowerBound(): void {
//   const arr = [1, 3, 3, 5, 5, 5, 7, 9];
//   function lb(target: number): number {
//     let lo = 0, hi = arr.length;
//     while (lo < hi) {
//       const mid = lo + Math.floor((hi - lo) / 2);
//       if (arr[mid] < target) lo = mid + 1;
//       else hi = mid;
//     }
//     return lo;
//   }
//   console.log("lb(5):", lb(5), "lb(4):", lb(4), "lb(10):", lb(10), "lb(0):", lb(0));
// }
// predictLowerBound();

// PREDICT 3: Rotated Array Binary Search
// Given [4, 5, 6, 7, 0, 1, 2], searching for target = 0.
// Trace the binary search steps:
//
// Step 1: lo=0, hi=6, mid=3, arr[mid]=7
//   Left half [4,5,6,7] is sorted. Is 0 in [4..7]? → ???
//   Action: ???
//
// Your prediction for remaining steps and final result: ???
//
// (Verify by running the solution)

// PREDICT 4: Upper Bound vs Lower Bound
// arr = [2, 2, 2, 2, 2]
//
// lowerBound(arr, 2) → ???
// upperBound(arr, 2) → ???
// Count of 2s = upper - lower → ???
//
// function predictBounds(): void {
//   const arr = [2, 2, 2, 2, 2];
//   function lb(target: number): number {
//     let lo = 0, hi = arr.length;
//     while (lo < hi) {
//       const mid = lo + Math.floor((hi - lo) / 2);
//       if (arr[mid] < target) lo = mid + 1;
//       else hi = mid;
//     }
//     return lo;
//   }
//   function ub(target: number): number {
//     let lo = 0, hi = arr.length;
//     while (lo < hi) {
//       const mid = lo + Math.floor((hi - lo) / 2);
//       if (arr[mid] <= target) lo = mid + 1;
//       else hi = mid;
//     }
//     return lo;
//   }
//   console.log("lb(2):", lb(2), "ub(2):", ub(2), "count:", ub(2) - lb(2));
// }
// predictBounds();

// PREDICT 5: Peak Element Search
// arr = [1, 3, 5, 4, 2]
// Trace the binary search for peak:
//
// Step 1: lo=0, hi=4, mid=2, arr[2]=5, arr[3]=4
//   5 > 4 → peak is at mid or left → hi = mid
//   Step 2: lo=0, hi=2, mid=1, arr[1]=3, arr[2]=5
//   3 < 5 → peak is to the right → lo = mid + 1
//   Step 3: lo=2, hi=2 → return 2
//
// Is index 2 (value 5) a peak? ???

// ---------------------------------------------------------------------------
// FIX EXERCISES (3)
// ---------------------------------------------------------------------------

// FIX 1: Buggy Binary Search
// This binary search has an infinite loop for certain inputs. Find and fix the bug.
function buggyBinarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid; // BUG: something wrong here
    else hi = mid; // BUG: and here
  }

  return -1;
}

// console.log("Fix 1:", buggyBinarySearch([1, 3, 5, 7, 9], 9));
// Expected: 4 (but this may infinite loop)

// FIX 2: Buggy Lower Bound
// This lower bound returns wrong results. Find and fix the bug.
function buggyLowerBound(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1; // BUG: should this be arr.length?

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// console.log("Fix 2a:", buggyLowerBound([1, 3, 5, 7], 8));
// Expected: 4 (past end — target larger than all elements)
// Actual: ???

// FIX 3: Buggy Search in Rotated Array
// This rotated array search sometimes returns -1 when it shouldn't.
function buggyRotatedSearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;

    // Check if left half is sorted
    if (arr[lo] < arr[mid]) { // BUG: should this be <= ?
      if (target >= arr[lo] && target < arr[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else {
      if (target > arr[mid] && target <= arr[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }

  return -1;
}

// console.log("Fix 3:", buggyRotatedSearch([3, 1], 3));
// Expected: 0
// Actual: ??? (try it — the bug is in the left-sorted check)

// ---------------------------------------------------------------------------
// IMPLEMENT EXERCISES (7)
// ---------------------------------------------------------------------------

// IMPLEMENT 1: Binary Search (Iterative)
// Return the index of target, or -1 if not found.
// Time: O(log n) | Space: O(1)
function binarySearch(arr: number[], target: number): number {
  // TODO
  return -1;
}

// console.log("Impl 1a:", binarySearch([1, 3, 5, 7, 9, 11], 7));  // 3
// console.log("Impl 1b:", binarySearch([1, 3, 5, 7, 9, 11], 4));  // -1
// console.log("Impl 1c:", binarySearch([], 5));                     // -1

// IMPLEMENT 2: First and Last Occurrence
// Return [firstIndex, lastIndex] of target, or [-1, -1] if not found.
// Time: O(log n) | Space: O(1)
function searchRange(arr: number[], target: number): [number, number] {
  // TODO: Use lower bound / upper bound approach
  return [-1, -1];
}

// console.log("Impl 2a:", searchRange([5, 7, 7, 8, 8, 10], 8));   // [3, 4]
// console.log("Impl 2b:", searchRange([5, 7, 7, 8, 8, 10], 6));   // [-1, -1]
// console.log("Impl 2c:", searchRange([1, 1, 1, 1, 1], 1));        // [0, 4]

// IMPLEMENT 3: Search in Rotated Sorted Array
// Array was sorted then rotated. No duplicates. Find target index or -1.
// Time: O(log n) | Space: O(1)
function searchRotated(arr: number[], target: number): number {
  // TODO
  return -1;
}

// console.log("Impl 3a:", searchRotated([4, 5, 6, 7, 0, 1, 2], 0));  // 4
// console.log("Impl 3b:", searchRotated([4, 5, 6, 7, 0, 1, 2], 3));  // -1
// console.log("Impl 3c:", searchRotated([1], 1));                      // 0

// IMPLEMENT 4: Find Peak Element
// An element is a peak if it's greater than its neighbors.
// arr[-1] = arr[n] = -Infinity. Return ANY peak index.
// Time: O(log n) | Space: O(1)
function findPeakElement(arr: number[]): number {
  // TODO
  return -1;
}

// console.log("Impl 4a:", findPeakElement([1, 2, 3, 1]));      // 2
// console.log("Impl 4b:", findPeakElement([1, 2, 1, 3, 5, 6, 4])); // 1 or 5

// IMPLEMENT 5: Search a 2D Matrix
// Each row sorted left-right. First element of row > last of previous row.
// Time: O(log(m*n)) | Space: O(1)
function searchMatrix(matrix: number[][], target: number): boolean {
  // TODO: Treat as flattened sorted array
  return false;
}

// console.log("Impl 5a:", searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3));  // true
// console.log("Impl 5b:", searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)); // false

// IMPLEMENT 6: Minimum Ship Capacity (Binary Search on Answer)
// Ship packages in order within `days` days. Find minimum capacity.
// weights[i] can't be split. Packages must ship in order.
// Time: O(n * log(sum)) | Space: O(1)
function shipWithinDays(weights: number[], days: number): number {
  // TODO: Binary search on answer
  return 0;
}

// console.log("Impl 6a:", shipWithinDays([1,2,3,4,5,6,7,8,9,10], 5)); // 15
// console.log("Impl 6b:", shipWithinDays([3,2,2,4,1,4], 3));          // 6
// console.log("Impl 6c:", shipWithinDays([1,2,3,1,1], 4));            // 3

// IMPLEMENT 7: Recursive Binary Search
// Same as binary search but recursive. Return index or -1.
// Time: O(log n) | Space: O(log n) call stack
function binarySearchRecursive(
  arr: number[],
  target: number,
  lo?: number,
  hi?: number
): number {
  // TODO
  return -1;
}

// console.log("Impl 7a:", binarySearchRecursive([1, 3, 5, 7, 9], 5));  // 2
// console.log("Impl 7b:", binarySearchRecursive([1, 3, 5, 7, 9], 6));  // -1

// ---------------------------------------------------------------------------
// RUNNER (uncomment to test all)
// ---------------------------------------------------------------------------
// function runAll(): void {
//   console.log("=== PREDICT ===");
//   predictBinarySteps();
//   predictLowerBound();
//   predictBounds();
//
//   console.log("\n=== FIX ===");
//   console.log("Fix 1:", buggyBinarySearch([1, 3, 5, 7, 9], 9));
//   console.log("Fix 2:", buggyLowerBound([1, 3, 5, 7], 8));
//   console.log("Fix 3:", buggyRotatedSearch([3, 1], 3));
//
//   console.log("\n=== IMPLEMENT ===");
//   console.log("Impl 1:", binarySearch([1, 3, 5, 7, 9, 11], 7));
//   console.log("Impl 2:", searchRange([5, 7, 7, 8, 8, 10], 8));
//   console.log("Impl 3:", searchRotated([4, 5, 6, 7, 0, 1, 2], 0));
//   console.log("Impl 4:", findPeakElement([1, 2, 3, 1]));
//   console.log("Impl 5:", searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3));
//   console.log("Impl 6:", shipWithinDays([1,2,3,4,5,6,7,8,9,10], 5));
//   console.log("Impl 7:", binarySearchRecursive([1, 3, 5, 7, 9], 5));
// }
// runAll();

export {
  buggyBinarySearch,
  buggyLowerBound,
  buggyRotatedSearch,
  binarySearch,
  searchRange,
  searchRotated,
  findPeakElement,
  searchMatrix,
  shipWithinDays,
  binarySearchRecursive,
};
