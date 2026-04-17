// ============================================================================
// Searching Algorithms — Solutions
// ============================================================================
// Config: ES2022, strict mode, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ---------------------------------------------------------------------------
// FIX 1: Buggy Binary Search — FIXED
// BUG: `lo = mid` and `hi = mid` cause infinite loop when mid == lo.
// FIX: Use `lo = mid + 1` and `hi = mid - 1`.
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function binarySearchFixed(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1; // FIX: was `mid`
    else hi = mid - 1; // FIX: was `mid`
  }

  return -1;
}

// ---------------------------------------------------------------------------
// FIX 2: Buggy Lower Bound — FIXED
// BUG: `hi = arr.length - 1` means we can never return arr.length (for targets
//       larger than all elements).
// FIX: `hi = arr.length`
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function lowerBoundFixed(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length; // FIX: was arr.length - 1

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// ---------------------------------------------------------------------------
// FIX 3: Buggy Rotated Array Search — FIXED
// BUG: `arr[lo] < arr[mid]` fails when lo == mid (2-element subarray).
//       Need `arr[lo] <= arr[mid]` to handle the case where left half is
//       a single element.
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function rotatedSearchFixed(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;

    if (arr[lo] <= arr[mid]) { // FIX: was strictly <
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

// ---------------------------------------------------------------------------
// IMPLEMENT 1: Binary Search (Iterative)
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1;
}

// ---------------------------------------------------------------------------
// Helper: Lower Bound and Upper Bound
// ---------------------------------------------------------------------------
function lowerBound(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

function upperBound(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 2: First and Last Occurrence
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function searchRange(arr: number[], target: number): [number, number] {
  const first = lowerBound(arr, target);
  if (first >= arr.length || arr[first] !== target) return [-1, -1];

  const last = upperBound(arr, target) - 1;
  return [first, last];
}

// ---------------------------------------------------------------------------
// IMPLEMENT 3: Search in Rotated Sorted Array
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function searchRotated(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;

    // Determine which half is sorted
    if (arr[lo] <= arr[mid]) {
      // Left half is sorted
      if (target >= arr[lo] && target < arr[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else {
      // Right half is sorted
      if (target > arr[mid] && target <= arr[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }

  return -1;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 4: Find Peak Element
// Complexity: O(log n) time | O(1) space
// ---------------------------------------------------------------------------
function findPeakElement(arr: number[]): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < arr[mid + 1]) {
      lo = mid + 1; // Peak is to the right
    } else {
      hi = mid; // Peak is at mid or to the left
    }
  }

  return lo; // lo === hi
}

// ---------------------------------------------------------------------------
// IMPLEMENT 5: Search a 2D Matrix
// Complexity: O(log(m*n)) time | O(1) space
// ---------------------------------------------------------------------------
function searchMatrix(matrix: number[][], target: number): boolean {
  if (matrix.length === 0 || matrix[0].length === 0) return false;

  const m = matrix.length;
  const n = matrix[0].length;
  let lo = 0;
  let hi = m * n - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const val = matrix[row][col];

    if (val === target) return true;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return false;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 6: Minimum Ship Capacity (Binary Search on Answer)
// Complexity: O(n * log(sum)) time | O(1) space
// ---------------------------------------------------------------------------
function shipWithinDays(weights: number[], days: number): number {
  let lo = Math.max(...weights); // min capacity = heaviest package
  let hi = weights.reduce((sum, w) => sum + w, 0); // max capacity = all in one day

  function canShip(capacity: number): boolean {
    let daysNeeded = 1;
    let currentLoad = 0;

    for (const w of weights) {
      if (currentLoad + w > capacity) {
        daysNeeded++;
        currentLoad = w;
        if (daysNeeded > days) return false;
      } else {
        currentLoad += w;
      }
    }

    return true;
  }

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (canShip(mid)) {
      hi = mid; // Try smaller capacity
    } else {
      lo = mid + 1; // Need more capacity
    }
  }

  return lo;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 7: Recursive Binary Search
// Complexity: O(log n) time | O(log n) space (call stack)
// ---------------------------------------------------------------------------
function binarySearchRecursive(
  arr: number[],
  target: number,
  lo: number = 0,
  hi: number = arr.length - 1
): number {
  if (lo > hi) return -1;

  const mid = lo + Math.floor((hi - lo) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, hi);
  return binarySearchRecursive(arr, target, lo, mid - 1);
}

// ---------------------------------------------------------------------------
// RUNNER
// ---------------------------------------------------------------------------
function runAll(): void {
  console.log("=== FIX SOLUTIONS ===");
  console.log("Fix 1:", binarySearchFixed([1, 3, 5, 7, 9], 9));
  console.log("Fix 2a:", lowerBoundFixed([1, 3, 5, 7], 8));
  console.log("Fix 2b:", lowerBoundFixed([1, 3, 5, 7], 5));
  console.log("Fix 3:", rotatedSearchFixed([3, 1], 3));

  console.log("\n=== PREDICT ANSWERS ===");
  console.log("P1: [1,3,5,7,9,11,13,15] target=7 → mid=3(7) found in 2 steps");
  console.log("    Step 1: lo=0 hi=7 mid=3 arr[3]=7 → found!");
  console.log("    Actually just 1 comparison to find it.");
  console.log("P2: lb(5)=3, lb(4)=3, lb(10)=8, lb(0)=0");
  console.log("P3: Rotated [4,5,6,7,0,1,2] target=0:");
  console.log("    Step 1: mid=3(7), left sorted [4..7], 0 not in [4,7] → go right");
  console.log("    Step 2: lo=4 hi=6 mid=5(1), left sorted [0,1], 0 in [0,1) → go left");
  console.log("    Step 3: lo=4 hi=4 mid=4(0) → found at index 4");
  console.log("P4: lb(2)=0, ub(2)=5, count=5");
  console.log("P5: Peak at index 2 (value 5). Yes, 5 > 3 and 5 > 4.");

  console.log("\n=== IMPLEMENT SOLUTIONS ===");
  console.log("Impl 1a:", binarySearch([1, 3, 5, 7, 9, 11], 7));
  console.log("Impl 1b:", binarySearch([1, 3, 5, 7, 9, 11], 4));
  console.log("Impl 1c:", binarySearch([], 5));

  console.log("Impl 2a:", searchRange([5, 7, 7, 8, 8, 10], 8));
  console.log("Impl 2b:", searchRange([5, 7, 7, 8, 8, 10], 6));
  console.log("Impl 2c:", searchRange([1, 1, 1, 1, 1], 1));

  console.log("Impl 3a:", searchRotated([4, 5, 6, 7, 0, 1, 2], 0));
  console.log("Impl 3b:", searchRotated([4, 5, 6, 7, 0, 1, 2], 3));
  console.log("Impl 3c:", searchRotated([1], 1));

  console.log("Impl 4a:", findPeakElement([1, 2, 3, 1]));
  console.log("Impl 4b:", findPeakElement([1, 2, 1, 3, 5, 6, 4]));

  console.log("Impl 5a:", searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3));
  console.log("Impl 5b:", searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13));

  console.log("Impl 6a:", shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5));
  console.log("Impl 6b:", shipWithinDays([3, 2, 2, 4, 1, 4], 3));
  console.log("Impl 6c:", shipWithinDays([1, 2, 3, 1, 1], 4));

  console.log("Impl 7a:", binarySearchRecursive([1, 3, 5, 7, 9], 5));
  console.log("Impl 7b:", binarySearchRecursive([1, 3, 5, 7, 9], 6));
}

runAll();
