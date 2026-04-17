// ============================================================================
// Sorting Algorithms — Solutions
// ============================================================================
// Config: ES2022, strict mode, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ---------------------------------------------------------------------------
// FIX 1: Buggy Bubble Sort — FIXED
// BUG: Inner loop should go to `result.length - 1 - i` to avoid out-of-bounds
//      access and to skip already-sorted tail elements.
// Complexity: O(n^2) time | O(1) space
// ---------------------------------------------------------------------------
function bubbleSortFixed(arr: number[]): number[] {
  const result = [...arr];
  for (let i = 0; i < result.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < result.length - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return result;
}

// ---------------------------------------------------------------------------
// FIX 2: Buggy Merge — FIXED
// BUG: The left-remainder loop pushed `left[j]` instead of `left[i]`.
// Complexity: O(n) time | O(n) space
// ---------------------------------------------------------------------------
function mergeFixed(left: number[], right: number[]): number[] {
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

  while (i < left.length) {
    result.push(left[i]); // FIX: was left[j]
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// FIX 3: Buggy Counting Sort — FIXED
// BUG: Inner loop condition was `j < count[j]` instead of `j < count[i]`.
// Complexity: O(n + k) time | O(n + k) space
// ---------------------------------------------------------------------------
function countingSortFixed(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const max = Math.max(...arr);
  const count = new Array<number>(max + 1).fill(0);

  for (const num of arr) {
    count[num]++;
  }

  const result: number[] = [];
  for (let i = 0; i < count.length; i++) {
    for (let j = 0; j < count[i]; j++) { // FIX: was count[j]
      result.push(i);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 1: Bubble Sort (with early exit)
// Complexity: O(n^2) worst/avg, O(n) best | O(1) space
// ---------------------------------------------------------------------------
function bubbleSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // O(n) best case: already sorted
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 2: Selection Sort
// Complexity: O(n^2) always | O(1) space
// ---------------------------------------------------------------------------
function selectionSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (result[j] < result[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [result[i], result[minIdx]] = [result[minIdx], result[i]];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 3: Insertion Sort
// Complexity: O(n^2) worst/avg, O(n) best | O(1) space
// ---------------------------------------------------------------------------
function insertionSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;

  for (let i = 1; i < n; i++) {
    const key = result[i];
    let j = i - 1;
    while (j >= 0 && result[j] > key) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = key;
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 4: Merge Sort
// Complexity: O(n log n) always | O(n) space
// ---------------------------------------------------------------------------
function merge(left: number[], right: number[]): number[] {
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

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

// ---------------------------------------------------------------------------
// IMPLEMENT 5: Quick Sort (Lomuto Partition)
// Complexity: O(n log n) avg, O(n^2) worst | O(log n) space (call stack)
// ---------------------------------------------------------------------------
function quickSort(arr: number[]): number[] {
  const result = [...arr];

  function partition(lo: number, hi: number): number {
    const pivot = result[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (result[j] <= pivot) {
        [result[i], result[j]] = [result[j], result[i]];
        i++;
      }
    }
    [result[i], result[hi]] = [result[hi], result[i]];
    return i;
  }

  function qsort(lo: number, hi: number): void {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    qsort(lo, p - 1);
    qsort(p + 1, hi);
  }

  qsort(0, result.length - 1);
  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 6: Counting Sort
// Complexity: O(n + k) time | O(n + k) space
// ---------------------------------------------------------------------------
function countingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const max = Math.max(...arr);
  const count = new Array<number>(max + 1).fill(0);

  for (const num of arr) {
    count[num]++;
  }

  const result: number[] = [];
  for (let i = 0; i < count.length; i++) {
    for (let j = 0; j < count[i]; j++) {
      result.push(i);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 7: Radix Sort (LSD)
// Complexity: O(d * (n + k)) time | O(n + k) space
// ---------------------------------------------------------------------------
function radixSort(arr: number[]): number[] {
  if (arr.length === 0) return [];

  const result = [...arr];
  const max = Math.max(...result);

  // Process each digit position using counting sort
  let exp = 1; // 1, 10, 100, ...
  while (Math.floor(max / exp) > 0) {
    const output = new Array<number>(result.length);
    const count = new Array<number>(10).fill(0);

    // Count occurrences of each digit
    for (let i = 0; i < result.length; i++) {
      const digit = Math.floor(result[i] / exp) % 10;
      count[digit]++;
    }

    // Prefix sums
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    // Build output (traverse right-to-left for stability)
    for (let i = result.length - 1; i >= 0; i--) {
      const digit = Math.floor(result[i] / exp) % 10;
      count[digit]--;
      output[count[digit]] = result[i];
    }

    // Copy back
    for (let i = 0; i < result.length; i++) {
      result[i] = output[i];
    }

    exp *= 10;
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 8: Stable Sort By Age
// Uses merge sort to guarantee stability.
// Complexity: O(n log n) time | O(n) space
// ---------------------------------------------------------------------------
interface Person {
  name: string;
  age: number;
}

function stableSortByAge(people: Person[]): Person[] {
  if (people.length <= 1) return [...people];

  const mid = Math.floor(people.length / 2);
  const left = stableSortByAge(people.slice(0, mid));
  const right = stableSortByAge(people.slice(mid));

  const result: Person[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i].age <= right[j].age) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 9: Quicksort with Three-Way Partition (Dutch National Flag)
// Complexity: O(n log n) avg, O(n) for all-equal | O(log n) space
// ---------------------------------------------------------------------------
function quickSort3Way(arr: number[]): number[] {
  const result = [...arr];

  function sort3Way(lo: number, hi: number): void {
    if (lo >= hi) return;

    const pivot = result[lo];
    let lt = lo;  // result[lo..lt-1]  < pivot
    let i = lo;   // result[lt..i-1]  == pivot
    let gt = hi;  // result[gt+1..hi]  > pivot

    while (i <= gt) {
      if (result[i] < pivot) {
        [result[lt], result[i]] = [result[i], result[lt]];
        lt++;
        i++;
      } else if (result[i] > pivot) {
        [result[i], result[gt]] = [result[gt], result[i]];
        gt--;
      } else {
        i++;
      }
    }

    // result[lt..gt] are all equal to pivot — skip them
    sort3Way(lo, lt - 1);
    sort3Way(gt + 1, hi);
  }

  sort3Way(0, result.length - 1);
  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 10: Generic Merge Sort with Comparator
// Complexity: O(n log n) time | O(n) space
// ---------------------------------------------------------------------------
type Comparator<T> = (a: T, b: T) => number;

function mergeSortWith<T>(arr: T[], compare: Comparator<T>): T[] {
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSortWith(arr.slice(0, mid), compare);
  const right = mergeSortWith(arr.slice(mid), compare);

  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// RUNNER
// ---------------------------------------------------------------------------
function runAll(): void {
  console.log("=== FIX SOLUTIONS ===");
  console.log("Fix 1 (Bubble):", bubbleSortFixed([5, 3, 8, 1, 2]));
  console.log("Fix 2 (Merge):", mergeFixed([1, 3, 5], [2, 4, 6]));
  console.log("Fix 3 (Counting):", countingSortFixed([4, 2, 2, 8, 3, 3, 1]));

  console.log("\n=== PREDICT ANSWERS ===");
  // P1: Bubble passes on [1, 2, 5, 3, 4]
  console.log("P1: Pass 1 → [1, 2, 3, 4, 5], Pass 2 → no swaps → exit. Total: 2 passes");
  // P2: Selection swaps on [3, 1, 4, 1, 5]
  console.log("P2: 3 swaps. [1, 1, 3, 4, 5] (swap 3↔1, 1↔4→already positioned after first, then 4↔3)");
  // P3: Insertion comparisons on [5, 4, 3, 2, 1]
  console.log("P3: 1 + 2 + 3 + 4 = 10 comparisons");
  // P4: Merge sort merges on [8, 3, 5, 1]
  console.log("P4: 3 merges: merge(8,3)→[3,8], merge(5,1)→[1,5], merge([3,8],[1,5])→[1,3,5,8]");
  // P5: Lomuto partition of [3, 7, 2, 8, 1, 5] pivot=5
  console.log("P5: [3, 2, 1, 5, 7, 8], pivot index = 3");

  console.log("\n=== IMPLEMENT SOLUTIONS ===");
  console.log("Impl 1 (Bubble):", bubbleSort([64, 34, 25, 12, 22, 11, 90]));
  console.log("Impl 2 (Selection):", selectionSort([64, 25, 12, 22, 11]));
  console.log("Impl 3 (Insertion):", insertionSort([12, 11, 13, 5, 6]));
  console.log("Impl 4 (Merge):", mergeSort([38, 27, 43, 3, 9, 82, 10]));
  console.log("Impl 5 (Quick):", quickSort([10, 7, 8, 9, 1, 5]));
  console.log("Impl 6 (Counting):", countingSort([4, 2, 2, 8, 3, 3, 1]));
  console.log("Impl 7 (Radix):", radixSort([170, 45, 75, 90, 802, 24, 2, 66]));

  const people: Person[] = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 30 },
    { name: "Diana", age: 25 },
  ];
  console.log("Impl 8 (Stable):", stableSortByAge(people).map(p => `${p.name}(${p.age})`));

  console.log("Impl 9 (3-Way):", quickSort3Way([4, 2, 4, 1, 4, 3, 4, 2]));

  const objects = [
    { name: "Charlie", age: 30 },
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 },
  ];
  console.log("Impl 10 (Generic):", mergeSortWith(
    objects,
    (a, b) => a.age - b.age || a.name.localeCompare(b.name)
  ));
}

runAll();
