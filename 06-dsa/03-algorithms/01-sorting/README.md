# Sorting Algorithms

## Table of Contents

1. [Overview](#overview)
2. [Why Sorting Matters](#why-sorting-matters)
3. [Classification of Sorting Algorithms](#classification-of-sorting-algorithms)
4. [Comparison-Based Sorting](#comparison-based-sorting)
   - [Bubble Sort](#bubble-sort)
   - [Selection Sort](#selection-sort)
   - [Insertion Sort](#insertion-sort)
   - [Merge Sort](#merge-sort)
   - [Quick Sort](#quick-sort)
5. [Non-Comparison Sorting](#non-comparison-sorting)
   - [Counting Sort](#counting-sort)
   - [Radix Sort](#radix-sort)
6. [Stability in Sorting](#stability-in-sorting)
7. [In-Place vs Not In-Place](#in-place-vs-not-in-place)
8. [Complexity Comparison Table](#complexity-comparison-table)
9. [Divide and Conquer: Merge Sort Deep Dive](#divide-and-conquer-merge-sort-deep-dive)
10. [Quicksort Deep Dive: Pivot Selection and Partition](#quicksort-deep-dive-pivot-selection-and-partition)
11. [When to Use Which Algorithm](#when-to-use-which-algorithm)
12. [JavaScript Array.sort Behavior (TimSort)](#javascript-arraysort-behavior-timsort)
13. [Key Takeaways](#key-takeaways)

---

## Overview

Sorting is the process of rearranging elements in a collection (array, list) into a
defined order — typically ascending or descending. It is one of the most fundamental
operations in computer science because:

- Many algorithms require sorted input to work correctly (e.g., binary search).
- Sorting enables efficient duplicate detection, merging, and range queries.
- Understanding sorting is a gateway to understanding algorithm design paradigms
  like divide and conquer, greedy approaches, and complexity analysis.

---

## Why Sorting Matters

1. **Enables binary search** — O(log n) lookup instead of O(n).
2. **Simplifies problems** — finding duplicates, closest pairs, medians.
3. **Database operations** — ORDER BY, indexing, merge joins.
4. **Preprocessing step** — many greedy and DP algorithms need sorted input.
5. **Interview staple** — sorting questions test algorithmic thinking.

---

## Classification of Sorting Algorithms

### By mechanism

| Type               | How it works                          | Examples                    |
| ------------------ | ------------------------------------- | --------------------------- |
| Comparison-based   | Compares pairs of elements            | Bubble, Selection, Merge, Quick |
| Non-comparison     | Uses element properties (digits, counts) | Counting, Radix, Bucket    |

### By space usage

| Type      | Extra space | Examples                        |
| --------- | ----------- | ------------------------------- |
| In-place  | O(1)        | Bubble, Selection, Insertion, Quick (typical) |
| Not in-place | O(n)+   | Merge, Counting, Radix         |

### By stability

| Type    | Equal elements keep original order? | Examples                    |
| ------- | ----------------------------------- | --------------------------- |
| Stable  | Yes                                 | Bubble, Insertion, Merge, Counting |
| Unstable | No                                 | Selection, Quick (typical)  |

---

## Comparison-Based Sorting

The theoretical lower bound for comparison-based sorting is **O(n log n)**. No
comparison-based algorithm can do better in the worst case. This is provable via
decision tree analysis.

### Bubble Sort

**Idea**: Repeatedly swap adjacent elements if they are in the wrong order. After
each pass, the largest unsorted element "bubbles" to its correct position.

```
Pass 1: [5, 3, 8, 1] -> [3, 5, 1, 8]  (8 bubbled to end)
Pass 2: [3, 5, 1, 8] -> [3, 1, 5, 8]  (5 bubbled)
Pass 3: [3, 1, 5, 8] -> [1, 3, 5, 8]  (3 bubbled)
```

**Properties**:
- Time: O(n^2) worst/average, O(n) best (already sorted, with optimization)
- Space: O(1)
- Stable: Yes
- Optimization: If no swaps in a pass, array is sorted — exit early.

**When useful**: Almost never in practice. Educational value only. The early-exit
optimization makes it decent for nearly-sorted data, but insertion sort is better.

### Selection Sort

**Idea**: Find the minimum element in the unsorted portion and swap it into position.

```
[64, 25, 12, 22] -> find min (12), swap with pos 0
[12, 25, 64, 22] -> find min (22), swap with pos 1
[12, 22, 64, 25] -> find min (25), swap with pos 2
[12, 22, 25, 64] -> done
```

**Properties**:
- Time: O(n^2) always (no best-case optimization)
- Space: O(1)
- Stable: No (the swap can displace equal elements)
- Always makes exactly n-1 swaps — good when writes are expensive.

### Insertion Sort

**Idea**: Build a sorted portion one element at a time. Take the next unsorted element
and insert it into its correct position within the sorted portion.

```
[5, |3, 8, 1]  -> insert 3: [3, 5, |8, 1]
[3, 5, |8, 1]  -> insert 8: [3, 5, 8, |1]
[3, 5, 8, |1]  -> insert 1: [1, 3, 5, 8]
```

**Properties**:
- Time: O(n^2) worst/average, O(n) best (already sorted)
- Space: O(1)
- Stable: Yes
- Adaptive: Runs in O(n + d) where d = number of inversions.

**When useful**:
- Small arrays (n < ~20) — overhead of merge/quick not worth it.
- Nearly sorted data — very fast due to adaptivity.
- Online sorting — can sort as data arrives.
- Used as the base case in hybrid sorts (TimSort, IntroSort).

### Merge Sort

**Idea**: Divide the array in half, recursively sort each half, then merge the two
sorted halves.

```
[38, 27, 43, 3, 9, 82, 10]
        /                \
[38, 27, 43, 3]    [9, 82, 10]
   /        \         /      \
[38, 27]  [43, 3]  [9, 82]  [10]
 /   \     /   \    /   \      |
[38] [27] [43] [3] [9] [82]  [10]
 \   /     \   /    \   /      |
[27, 38]  [3, 43]  [9, 82]  [10]
   \        /         \      /
[3, 27, 38, 43]    [9, 10, 82]
        \                /
[3, 9, 10, 27, 38, 43, 82]
```

**Properties**:
- Time: O(n log n) always
- Space: O(n) for the temporary merge arrays
- Stable: Yes
- Not in-place (standard implementation)
- Parallelizable — the two halves can be sorted independently

### Quick Sort

**Idea**: Pick a "pivot" element, partition the array so elements less than pivot are
on the left and greater are on the right, then recursively sort each partition.

```
pivot = 4: [3, 6, 8, 10, 1, 2, 1]
partition:  [3, 1, 2, 1] [4] [6, 8, 10]
recurse on each side...
```

**Properties**:
- Time: O(n log n) average, O(n^2) worst (bad pivot selection)
- Space: O(log n) average (call stack), O(n) worst
- Unstable (standard implementation)
- In-place (standard implementation)
- Cache-friendly — sequential memory access patterns

---

## Non-Comparison Sorting

These algorithms break the O(n log n) barrier by not comparing elements directly.
They exploit the structure of the data (integer values, digit representation).

### Counting Sort

**Idea**: Count occurrences of each value, then reconstruct the sorted array from
the counts.

```
Input:  [4, 2, 2, 8, 3, 3, 1]
Range:  1..8
Counts: [0, 1, 2, 2, 1, 0, 0, 0, 1]  (index = value, value = count)
Output: [1, 2, 2, 3, 3, 4, 8]
```

**Properties**:
- Time: O(n + k) where k = range of values
- Space: O(n + k)
- Stable: Yes (with proper implementation using prefix sums)
- Only works with non-negative integers (or needs offset adjustment)
- Impractical when k >> n

### Radix Sort

**Idea**: Sort by each digit (or byte) from least significant to most significant,
using a stable sort (usually counting sort) as the subroutine.

```
Input: [170, 45, 75, 90, 802, 24, 2, 66]

Sort by ones digit:  [170, 90, 802, 2, 24, 45, 75, 66]
Sort by tens digit:  [802, 2, 24, 45, 66, 170, 75, 90]
Sort by hundreds:    [2, 24, 45, 66, 75, 90, 170, 802]
```

**Properties**:
- Time: O(d * (n + k)) where d = number of digits, k = base (usually 10)
- Space: O(n + k)
- Stable: Yes (relies on stable subroutine)
- Works well when d is small (numbers have limited range)

---

## Stability in Sorting

A sorting algorithm is **stable** if elements with equal keys maintain their
relative order from the original array.

**Why it matters**: When sorting by multiple criteria (e.g., sort by name, then by
age), stability ensures the secondary sort order is preserved.

```
Original: [(Alice, 30), (Bob, 25), (Charlie, 30)]

Stable sort by age:   [(Bob, 25), (Alice, 30), (Charlie, 30)]
                       Alice still before Charlie ✓

Unstable sort by age: [(Bob, 25), (Charlie, 30), (Alice, 30)]
                       Charlie before Alice — original order lost ✗
```

**Stable algorithms**: Bubble sort, Insertion sort, Merge sort, Counting sort, TimSort
**Unstable algorithms**: Selection sort, Quick sort (standard), Heap sort

---

## In-Place vs Not In-Place

**In-place**: Uses O(1) extra space (not counting the input itself and call stack).
- Bubble, Selection, Insertion, Quick (standard)

**Not in-place**: Requires O(n) or more extra space.
- Merge sort (O(n) auxiliary array)
- Counting sort (O(n + k))
- Radix sort (O(n + k))

Note: Some implementations of merge sort are in-place but significantly more complex
and slower in practice.

---

## Complexity Comparison Table

| Algorithm      | Best       | Average    | Worst      | Space   | Stable | In-Place |
| -------------- | ---------- | ---------- | ---------- | ------- | ------ | -------- |
| Bubble Sort    | O(n)       | O(n^2)     | O(n^2)     | O(1)    | Yes    | Yes      |
| Selection Sort | O(n^2)     | O(n^2)     | O(n^2)     | O(1)    | No     | Yes      |
| Insertion Sort | O(n)       | O(n^2)     | O(n^2)     | O(1)    | Yes    | Yes      |
| Merge Sort     | O(n log n) | O(n log n) | O(n log n) | O(n)    | Yes    | No       |
| Quick Sort     | O(n log n) | O(n log n) | O(n^2)     | O(log n)| No     | Yes      |
| Counting Sort  | O(n + k)   | O(n + k)   | O(n + k)   | O(n+k)  | Yes    | No       |
| Radix Sort     | O(d(n+k))  | O(d(n+k))  | O(d(n+k))  | O(n+k)  | Yes    | No       |
| TimSort        | O(n)       | O(n log n) | O(n log n) | O(n)    | Yes    | No       |

---

## Divide and Conquer: Merge Sort Deep Dive

Merge sort is the classic example of **divide and conquer**:

1. **Divide**: Split the array into two halves.
2. **Conquer**: Recursively sort each half.
3. **Combine**: Merge the two sorted halves.

### The Merge Procedure

The merge step is the heart of the algorithm. Given two sorted arrays, produce
one sorted array:

```
left  = [1, 3, 5]
right = [2, 4, 6]

Compare front elements:
  1 < 2 → take 1  → result: [1]
  3 > 2 → take 2  → result: [1, 2]
  3 < 4 → take 3  → result: [1, 2, 3]
  5 > 4 → take 4  → result: [1, 2, 3, 4]
  5 < 6 → take 5  → result: [1, 2, 3, 4, 5]
  take 6           → result: [1, 2, 3, 4, 5, 6]
```

Each merge is O(n) for the combined length. There are O(log n) levels of recursion.
Total: O(n log n).

### Recurrence Relation

```
T(n) = 2T(n/2) + O(n)
```

By the Master Theorem (case 2): T(n) = O(n log n).

### Merge Sort Characteristics

- **Guaranteed O(n log n)** — no worst-case degradation.
- Preferred for **linked lists** (no random access needed, merge is O(1) space).
- Preferred for **external sorting** (data doesn't fit in memory).
- The extra O(n) space is the main drawback for arrays.

---

## Quicksort Deep Dive: Pivot Selection and Partition

### Pivot Selection Strategies

The pivot choice determines quicksort's performance:

| Strategy             | Description                        | Worst case trigger        |
| -------------------- | ---------------------------------- | ------------------------- |
| First element        | Always pick arr[0]                 | Already sorted input      |
| Last element         | Always pick arr[n-1]               | Already sorted input      |
| Random               | Pick a random element              | Extremely unlikely O(n^2) |
| Median-of-three      | Median of first, middle, last      | Engineered adversarial    |

**Median-of-three** is the most common practical choice. It avoids the worst case
for sorted/reverse-sorted input while adding minimal overhead.

### Lomuto Partition Scheme

```
partition(arr, lo, hi):
  pivot = arr[hi]
  i = lo
  for j = lo to hi - 1:
    if arr[j] <= pivot:
      swap(arr[i], arr[j])
      i++
  swap(arr[i], arr[hi])
  return i
```

- Simple to implement
- Pivot ends up at index i
- Elements [lo..i-1] <= pivot, elements [i+1..hi] > pivot
- Degrades on arrays with many duplicates (all equal → O(n^2))

### Hoare Partition Scheme

```
partition(arr, lo, hi):
  pivot = arr[lo]
  i = lo - 1
  j = hi + 1
  while true:
    do i++ while arr[i] < pivot
    do j-- while arr[j] > pivot
    if i >= j: return j
    swap(arr[i], arr[j])
```

- Two pointers moving toward each other
- ~3x fewer swaps than Lomuto on average
- Slightly harder to implement correctly
- Better handling of duplicates

### Three-Way Partition (Dutch National Flag)

For arrays with many duplicate keys:

```
partition(arr, lo, hi):
  pivot = arr[lo]
  lt = lo      // arr[lo..lt-1]  < pivot
  i  = lo      // arr[lt..i-1]  == pivot
  gt = hi      // arr[gt+1..hi]  > pivot
  while i <= gt:
    if arr[i] < pivot:   swap(arr[lt], arr[i]); lt++; i++
    elif arr[i] > pivot: swap(arr[i], arr[gt]); gt--
    else:                i++
```

This ensures equal elements are never recursed into, giving O(n) for all-equal input.

---

## When to Use Which Algorithm

| Scenario                          | Best choice        | Why                              |
| --------------------------------- | ------------------ | -------------------------------- |
| Small array (n < 20)              | Insertion sort     | Low overhead, cache-friendly     |
| Nearly sorted data                | Insertion sort     | O(n + d) where d = inversions    |
| General purpose (arrays)          | Quick sort / TimSort | Fast in practice              |
| Guaranteed O(n log n)             | Merge sort         | No worst-case degradation        |
| Linked list sorting               | Merge sort         | O(1) space merge, no random access needed |
| External sorting (disk)           | Merge sort         | Sequential access, mergeable     |
| Integer keys, small range         | Counting sort      | O(n + k), linear time           |
| Integer keys, larger range        | Radix sort         | O(d * n), still linear in n     |
| Stability required                | Merge / Insertion  | Both are stable                  |
| Memory-constrained                | Quick / Insertion  | In-place                        |
| Strings                           | Radix sort (MSD)   | Can exploit common prefixes      |

---

## JavaScript Array.sort Behavior (TimSort)

### What V8 Uses

Since V8 v7.0 (Chrome 70, Node 10+), `Array.prototype.sort` uses **TimSort** — a
hybrid sorting algorithm derived from merge sort and insertion sort, designed by
Tim Peters in 2002 for Python.

### How TimSort Works

1. **Find natural runs** — scan the array for already-sorted subsequences.
2. **Extend short runs** using insertion sort to a minimum run length (minrun).
3. **Merge runs** using a merge procedure with a stack-based strategy that ensures
   balanced merges (similar to merge sort, but adaptive).

### TimSort Properties

- **Adaptive**: O(n) for already sorted data, O(n log n) worst case.
- **Stable**: Yes — equal elements maintain their order.
- **Space**: O(n) for the temporary merge buffer.
- **Optimized for real-world data** which often has pre-existing order.

### JavaScript sort Gotchas

```typescript
// Default sort converts elements to strings!
[10, 9, 8, 1, 2, 3].sort();
// Result: [1, 10, 2, 3, 8, 9]  — lexicographic order!

// Always provide a comparator for numbers:
[10, 9, 8, 1, 2, 3].sort((a, b) => a - b);
// Result: [1, 2, 3, 8, 9, 10]

// Comparator contract:
// Return negative → a before b
// Return 0       → preserve original order (stable)
// Return positive → b before a
```

### Comparator Pitfalls

```typescript
// WRONG: boolean coercion
arr.sort((a, b) => a > b);  // Returns true/false, not -1/0/1

// WRONG: subtraction overflow with extreme values
// a - b can overflow for very large/small numbers

// RIGHT:
arr.sort((a, b) => a - b);  // ascending
arr.sort((a, b) => b - a);  // descending

// For strings:
arr.sort((a, b) => a.localeCompare(b));
```

### Sorting Objects

```typescript
interface Student {
  name: string;
  grade: number;
}

const students: Student[] = [
  { name: "Alice", grade: 90 },
  { name: "Bob", grade: 85 },
  { name: "Charlie", grade: 90 },
];

// Sort by grade descending, then by name ascending (stable sort preserves name order)
students.sort((a, b) => {
  if (a.grade !== b.grade) return b.grade - a.grade;
  return a.localeCompare(b.name);
});
```

---

## Key Takeaways

1. **O(n log n) is the lower bound** for comparison-based sorting. Merge sort and
   quick sort achieve this (quick sort on average).

2. **Merge sort guarantees O(n log n)** but costs O(n) space. Quick sort is in-place
   but can degrade to O(n^2) with bad pivots.

3. **Insertion sort wins for small/nearly-sorted data**. This is why hybrid algorithms
   like TimSort use it as a subroutine.

4. **Non-comparison sorts (counting, radix) can be O(n)** when applicable, but have
   constraints on input types and ranges.

5. **Stability matters** when sorting by multiple keys. JavaScript's `Array.sort` is
   stable (guaranteed since ES2019 / V8 7.0).

6. **Always provide a comparator** to `Array.sort` for non-string data. The default
   behavior converts to strings.

7. **Know the tradeoffs**: time vs space, stability, adaptivity, cache behavior.
   There is no single "best" sorting algorithm — it depends on the context.

8. **Quick sort is fastest in practice** for random data due to cache locality and
   low constant factors, despite merge sort's theoretical guarantees.

9. **Three-way partition** solves quicksort's duplicate problem.

10. **TimSort is the industry standard** — used in V8, Python, Java, Rust, Swift.
    It's what you get when you call `.sort()` in modern JavaScript.
