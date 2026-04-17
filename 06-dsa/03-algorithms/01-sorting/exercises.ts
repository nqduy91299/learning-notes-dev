// ============================================================================
// Sorting Algorithms — Exercises
// ============================================================================
// Config: ES2022, strict mode, ESNext modules. Run with `npx tsx exercises.ts`
//
// 18 exercises total:
//   - 5 predict (trace through mentally, then verify)
//   - 3 fix (buggy implementations to debug)
//   - 10 implement (write from scratch)
//
// Tests are commented out. Uncomment to verify your solutions.
// ============================================================================

// ---------------------------------------------------------------------------
// PREDICT EXERCISES (5)
// ---------------------------------------------------------------------------

// PREDICT 1: Bubble Sort Pass Count
// How many passes does an optimized bubble sort (with early exit) make on this
// input before it stops? What is the array state after each pass?
//
// Input: [1, 2, 5, 3, 4]
//
// Your prediction:
//   Pass 1 result: ???
//   Pass 2 result: ???
//   Total passes:  ???
//
// function predictBubblePasses(): void {
//   const arr = [1, 2, 5, 3, 4];
//   let passes = 0;
//   for (let i = 0; i < arr.length - 1; i++) {
//     let swapped = false;
//     for (let j = 0; j < arr.length - 1 - i; j++) {
//       if (arr[j] > arr[j + 1]) {
//         [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
//         swapped = true;
//       }
//     }
//     passes++;
//     console.log(`Pass ${passes}:`, [...arr]);
//     if (!swapped) break;
//   }
//   console.log(`Total passes: ${passes}`);
// }
// predictBubblePasses();

// PREDICT 2: Selection Sort Swap Count
// How many swaps does selection sort perform on this input?
//
// Input: [3, 1, 4, 1, 5]
//
// Your prediction:
//   Total swaps: ???
//   Final array: ???
//
// function predictSelectionSwaps(): void {
//   const arr = [3, 1, 4, 1, 5];
//   let swaps = 0;
//   for (let i = 0; i < arr.length - 1; i++) {
//     let minIdx = i;
//     for (let j = i + 1; j < arr.length; j++) {
//       if (arr[j] < arr[minIdx]) minIdx = j;
//     }
//     if (minIdx !== i) {
//       [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
//       swaps++;
//     }
//   }
//   console.log(`Swaps: ${swaps}, Result:`, arr);
// }
// predictSelectionSwaps();

// PREDICT 3: Insertion Sort Comparisons
// How many comparisons does insertion sort make on this input?
//
// Input: [5, 4, 3, 2, 1]  (worst case — reverse sorted)
//
// Your prediction:
//   Comparisons: ???
//
// function predictInsertionComparisons(): void {
//   const arr = [5, 4, 3, 2, 1];
//   let comparisons = 0;
//   for (let i = 1; i < arr.length; i++) {
//     const key = arr[i];
//     let j = i - 1;
//     while (j >= 0) {
//       comparisons++;
//       if (arr[j] > key) {
//         arr[j + 1] = arr[j];
//         j--;
//       } else {
//         break;
//       }
//     }
//     arr[j + 1] = key;
//   }
//   console.log(`Comparisons: ${comparisons}, Result:`, arr);
// }
// predictInsertionComparisons();

// PREDICT 4: Merge Sort Merge Operations
// How many merge operations occur when merge-sorting [8, 3, 5, 1]?
// Draw the recursion tree and count merges.
//
// Your prediction:
//   Number of merges: ???
//   Merge sequence: ???
//
// (Trace through the divide-and-conquer tree manually)

// PREDICT 5: Quicksort with Lomuto Partition
// Using Lomuto partition (pivot = last element), trace one partition step:
//
// Input: [3, 7, 2, 8, 1, 5]
// Pivot = 5
//
// Your prediction:
//   Array after partition: ???
//   Pivot final index: ???
//
// function predictLomutoPartition(): void {
//   const arr = [3, 7, 2, 8, 1, 5];
//   const pivot = arr[5];
//   let i = 0;
//   for (let j = 0; j < 5; j++) {
//     if (arr[j] <= pivot) {
//       [arr[i], arr[j]] = [arr[j], arr[i]];
//       i++;
//     }
//   }
//   [arr[i], arr[5]] = [arr[5], arr[i]];
//   console.log(`After partition:`, arr, `Pivot index: ${i}`);
// }
// predictLomutoPartition();

// ---------------------------------------------------------------------------
// FIX EXERCISES (3)
// ---------------------------------------------------------------------------

// FIX 1: Buggy Bubble Sort
// This bubble sort doesn't produce correct results. Find and fix the bug.
function buggyBubbleSort(arr: number[]): number[] {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length; j++) {
      // BUG: something is wrong with the loop bounds or comparison
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}

// console.log("Fix 1:", buggyBubbleSort([5, 3, 8, 1, 2]));
// Expected: [1, 2, 3, 5, 8]

// FIX 2: Buggy Merge Function
// The merge step has a bug. Find and fix it.
function buggyMerge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // BUG: remaining elements are not handled correctly
  while (i < left.length) {
    result.push(left[j]); // Something wrong here
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

// console.log("Fix 2:", buggyMerge([1, 3, 5], [2, 4, 6]));
// Expected: [1, 2, 3, 4, 5, 6]

// FIX 3: Buggy Counting Sort
// This counting sort produces wrong output. Find and fix the bug.
function buggyCountingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const max = Math.max(...arr);
  const count = new Array<number>(max + 1).fill(0);

  for (const num of arr) {
    count[num]++;
  }

  const result: number[] = [];
  for (let i = 0; i < count.length; i++) {
    // BUG: each value should appear count[i] times
    for (let j = 0; j < count[j]; j++) {
      result.push(i);
    }
  }

  return result;
}

// console.log("Fix 3:", buggyCountingSort([4, 2, 2, 8, 3, 3, 1]));
// Expected: [1, 2, 2, 3, 3, 4, 8]

// ---------------------------------------------------------------------------
// IMPLEMENT EXERCISES (10)
// ---------------------------------------------------------------------------

// IMPLEMENT 1: Bubble Sort (with early exit optimization)
// Time: O(n^2) worst, O(n) best | Space: O(1)
function bubbleSort(arr: number[]): number[] {
  // TODO: Implement bubble sort with swap-check optimization
  return arr;
}

// console.log("Impl 1:", bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// Expected: [11, 12, 22, 25, 34, 64, 90]

// IMPLEMENT 2: Selection Sort
// Time: O(n^2) | Space: O(1)
function selectionSort(arr: number[]): number[] {
  // TODO: Implement selection sort
  return arr;
}

// console.log("Impl 2:", selectionSort([64, 25, 12, 22, 11]));
// Expected: [11, 12, 22, 25, 64]

// IMPLEMENT 3: Insertion Sort
// Time: O(n^2) worst, O(n) best | Space: O(1)
function insertionSort(arr: number[]): number[] {
  // TODO: Implement insertion sort
  return arr;
}

// console.log("Impl 3:", insertionSort([12, 11, 13, 5, 6]));
// Expected: [5, 6, 11, 12, 13]

// IMPLEMENT 4: Merge Sort
// Time: O(n log n) | Space: O(n)
function mergeSort(arr: number[]): number[] {
  // TODO: Implement merge sort (recursive, with merge helper)
  return arr;
}

// console.log("Impl 4:", mergeSort([38, 27, 43, 3, 9, 82, 10]));
// Expected: [3, 9, 10, 27, 38, 43, 82]

// IMPLEMENT 5: Quick Sort (Lomuto Partition)
// Time: O(n log n) avg, O(n^2) worst | Space: O(log n) avg
function quickSort(arr: number[]): number[] {
  // TODO: Implement quicksort with Lomuto partition scheme
  // Use last element as pivot
  return arr;
}

// console.log("Impl 5:", quickSort([10, 7, 8, 9, 1, 5]));
// Expected: [1, 5, 7, 8, 9, 10]

// IMPLEMENT 6: Counting Sort
// Time: O(n + k) | Space: O(n + k) where k = max value
function countingSort(arr: number[]): number[] {
  // TODO: Implement counting sort for non-negative integers
  return arr;
}

// console.log("Impl 6:", countingSort([4, 2, 2, 8, 3, 3, 1]));
// Expected: [1, 2, 2, 3, 3, 4, 8]

// IMPLEMENT 7: Radix Sort (LSD)
// Time: O(d * (n + k)) | Space: O(n + k) where d = digits, k = base
function radixSort(arr: number[]): number[] {
  // TODO: Implement LSD radix sort for non-negative integers
  // Use counting sort as subroutine for each digit
  return arr;
}

// console.log("Impl 7:", radixSort([170, 45, 75, 90, 802, 24, 2, 66]));
// Expected: [2, 24, 45, 66, 75, 90, 170, 802]

// IMPLEMENT 8: Sort Stability Test
// Given an array of objects, sort by `age` using a stable sort.
// Objects with the same age must keep their original relative order.
interface Person {
  name: string;
  age: number;
}

function stableSortByAge(people: Person[]): Person[] {
  // TODO: Use merge sort (or any stable sort) to sort by age
  // Do NOT use Array.sort — implement the stable sort yourself
  return people;
}

// const people: Person[] = [
//   { name: "Alice", age: 30 },
//   { name: "Bob", age: 25 },
//   { name: "Charlie", age: 30 },
//   { name: "Diana", age: 25 },
// ];
// console.log("Impl 8:", stableSortByAge(people));
// Expected: [Bob(25), Diana(25), Alice(30), Charlie(30)]
// Bob before Diana, Alice before Charlie (original order preserved)

// IMPLEMENT 9: Quicksort with Three-Way Partition
// Handles arrays with many duplicates efficiently.
// Time: O(n log n) avg, O(n) for all-equal | Space: O(log n)
function quickSort3Way(arr: number[]): number[] {
  // TODO: Implement quicksort with Dutch National Flag partitioning
  return arr;
}

// console.log("Impl 9:", quickSort3Way([4, 2, 4, 1, 4, 3, 4, 2]));
// Expected: [1, 2, 2, 3, 4, 4, 4, 4]

// IMPLEMENT 10: Custom Comparator Sort
// Implement merge sort that accepts a comparator function.
// The comparator follows the same contract as Array.sort:
//   negative → a before b, zero → preserve order, positive → b before a
type Comparator<T> = (a: T, b: T) => number;

function mergeSortWith<T>(arr: T[], compare: Comparator<T>): T[] {
  // TODO: Implement merge sort using the provided comparator
  return arr;
}

// console.log("Impl 10:", mergeSortWith(
//   [{ name: "Charlie", age: 30 }, { name: "Alice", age: 25 }, { name: "Bob", age: 30 }],
//   (a, b) => a.age - b.age || a.name.localeCompare(b.name)
// ));
// Expected: sorted by age ascending, then name alphabetically for ties

// ---------------------------------------------------------------------------
// RUNNER (uncomment to test all)
// ---------------------------------------------------------------------------
// function runAll(): void {
//   console.log("=== PREDICT ===");
//   predictBubblePasses();
//   predictSelectionSwaps();
//   predictInsertionComparisons();
//   predictLomutoPartition();
//
//   console.log("\n=== FIX ===");
//   console.log("Fix 1:", buggyBubbleSort([5, 3, 8, 1, 2]));
//   console.log("Fix 2:", buggyMerge([1, 3, 5], [2, 4, 6]));
//   console.log("Fix 3:", buggyCountingSort([4, 2, 2, 8, 3, 3, 1]));
//
//   console.log("\n=== IMPLEMENT ===");
//   console.log("Impl 1:", bubbleSort([64, 34, 25, 12, 22, 11, 90]));
//   console.log("Impl 2:", selectionSort([64, 25, 12, 22, 11]));
//   console.log("Impl 3:", insertionSort([12, 11, 13, 5, 6]));
//   console.log("Impl 4:", mergeSort([38, 27, 43, 3, 9, 82, 10]));
//   console.log("Impl 5:", quickSort([10, 7, 8, 9, 1, 5]));
//   console.log("Impl 6:", countingSort([4, 2, 2, 8, 3, 3, 1]));
//   console.log("Impl 7:", radixSort([170, 45, 75, 90, 802, 24, 2, 66]));
//   console.log("Impl 8:", stableSortByAge([
//     { name: "Alice", age: 30 },
//     { name: "Bob", age: 25 },
//     { name: "Charlie", age: 30 },
//     { name: "Diana", age: 25 },
//   ]));
//   console.log("Impl 9:", quickSort3Way([4, 2, 4, 1, 4, 3, 4, 2]));
//   console.log("Impl 10:", mergeSortWith(
//     [{ name: "Charlie", age: 30 }, { name: "Alice", age: 25 }, { name: "Bob", age: 30 }],
//     (a, b) => a.age - b.age || a.name.localeCompare(b.name)
//   ));
// }
// runAll();

export {
  buggyBubbleSort,
  buggyMerge,
  buggyCountingSort,
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  countingSort,
  radixSort,
  stableSortByAge,
  quickSort3Way,
  mergeSortWith,
};
export type { Person, Comparator };
