# Searching Algorithms

## Table of Contents

1. [Overview](#overview)
2. [Linear Search](#linear-search)
3. [Binary Search](#binary-search)
   - [Iterative Implementation](#iterative-implementation)
   - [Recursive Implementation](#recursive-implementation)
4. [Binary Search Variants](#binary-search-variants)
   - [Lower Bound (First >= target)](#lower-bound)
   - [Upper Bound (First > target)](#upper-bound)
   - [First Occurrence](#first-occurrence)
   - [Last Occurrence](#last-occurrence)
5. [Binary Search on Answer](#binary-search-on-answer)
   - [Minimize Maximum](#minimize-maximum)
   - [Ship Packages (Capacity Problem)](#ship-packages)
6. [Search in Rotated Sorted Array](#search-in-rotated-sorted-array)
7. [Other Search Problems](#other-search-problems)
   - [Find Peak Element](#find-peak-element)
   - [Search in 2D Matrix](#search-in-2d-matrix)
8. [DFS and BFS Recap](#dfs-and-bfs-recap)
9. [Key Takeaways](#key-takeaways)

---

## Overview

Searching is the process of finding a target element (or determining its absence)
within a data structure. The efficiency of search depends heavily on:

- **Data structure**: array, tree, graph, hash table
- **Data ordering**: sorted vs unsorted
- **Search type**: exact match, range, closest, existence

The two fundamental array search techniques are **linear search** (O(n)) and
**binary search** (O(log n)). Binary search requires sorted data but is
dramatically faster for large inputs.

---

## Linear Search

**Idea**: Check every element one by one until found or exhausted.

```typescript
function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
```

**Properties**:
- Time: O(n) worst/average, O(1) best
- Space: O(1)
- Works on unsorted data
- Works on any iterable (linked lists, streams)

**When to use**:
- Small arrays (n < ~30)
- Unsorted data that you only search once
- When maintaining sort order is too expensive

---

## Binary Search

**Idea**: For a sorted array, compare the target with the middle element. If they're
not equal, eliminate the half where the target cannot be.

### Key Insight

Each comparison eliminates half the remaining elements:
```
n → n/2 → n/4 → n/8 → ... → 1
```
This takes log2(n) steps. For n = 1,000,000 that's only ~20 comparisons.

### Iterative Implementation

```typescript
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // avoids overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return -1; // not found
}
```

### Recursive Implementation

```typescript
function binarySearchRec(
  arr: number[],
  target: number,
  lo: number,
  hi: number
): number {
  if (lo > hi) return -1;

  const mid = lo + Math.floor((hi - lo) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRec(arr, target, mid + 1, hi);
  return binarySearchRec(arr, target, lo, mid - 1);
}
```

**Properties**:
- Time: O(log n)
- Space: O(1) iterative, O(log n) recursive (call stack)
- Requires sorted input

### Common Bugs

1. **Integer overflow**: `(lo + hi) / 2` can overflow. Use `lo + (hi - lo) / 2`.
   (Not an issue in JS with safe integers, but important in other languages.)
2. **Off-by-one**: `lo <= hi` vs `lo < hi` — depends on the variant.
3. **Infinite loop**: Forgetting `+ 1` or `- 1` when updating lo/hi.
4. **Wrong mid calculation**: `Math.floor` vs `Math.ceil` matters for some variants.

---

## Binary Search Variants

These are the most practically useful binary search patterns. Mastering them
unlocks a wide range of problems.

### Lower Bound

Find the **first index** where `arr[index] >= target`.
Equivalent to: "where would target be inserted to keep the array sorted?"

```typescript
function lowerBound(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length; // NOTE: hi = length, not length - 1

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  return lo; // lo === hi at this point
}
```

**Key pattern**: `lo < hi` (not `<=`), `hi = mid` (not `mid - 1`).

### Upper Bound

Find the **first index** where `arr[index] > target`.

```typescript
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
```

The only difference from lower bound: `<=` instead of `<` in the comparison.

### First Occurrence

Find the first index of `target` in a sorted array (may have duplicates).

```typescript
function firstOccurrence(arr: number[], target: number): number {
  const idx = lowerBound(arr, target);
  if (idx < arr.length && arr[idx] === target) return idx;
  return -1;
}
```

### Last Occurrence

Find the last index of `target` in a sorted array.

```typescript
function lastOccurrence(arr: number[], target: number): number {
  const idx = upperBound(arr, target) - 1;
  if (idx >= 0 && arr[idx] === target) return idx;
  return -1;
}
```

### Count of Target

```typescript
function countOccurrences(arr: number[], target: number): number {
  return upperBound(arr, target) - lowerBound(arr, target);
}
```

---

## Binary Search on Answer

One of the most powerful binary search patterns. Instead of searching in an array,
you binary search on the **answer space**.

**Pattern**:
1. Define a range of possible answers [lo, hi].
2. For each candidate answer (mid), check if it's feasible.
3. Binary search to find the optimal (minimum/maximum) feasible answer.

### Minimize Maximum

**Problem**: Split an array into k subarrays to minimize the maximum subarray sum.

The answer space is [max(arr), sum(arr)]:
- Minimum possible max-sum = largest single element (k = n)
- Maximum possible max-sum = total sum (k = 1)

```typescript
function canSplit(arr: number[], k: number, maxSum: number): boolean {
  let count = 1;
  let currentSum = 0;
  for (const num of arr) {
    if (currentSum + num > maxSum) {
      count++;
      currentSum = num;
      if (count > k) return false;
    } else {
      currentSum += num;
    }
  }
  return true;
}
```

Binary search on the answer: if `canSplit(mid)` is true, try smaller. Otherwise,
try larger.

### Ship Packages

**Problem** (LeetCode 1011): Given package weights and D days, find the minimum
ship capacity to ship all packages in order within D days.

Same pattern: binary search on capacity. For each candidate capacity, greedily
check if all packages can be shipped within D days.

```
weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5
Answer space: [10, 55]  (max weight to total weight)
Binary search → minimum capacity = 15
```

---

## Search in Rotated Sorted Array

A sorted array that has been rotated (e.g., [4, 5, 6, 7, 0, 1, 2]) can still be
searched in O(log n) with modified binary search.

**Key insight**: At least one half of the array around `mid` is always sorted.

```
[4, 5, 6, 7, 0, 1, 2]
         mid
Left half [4, 5, 6] — sorted
Right half [0, 1, 2] — sorted

If target is in the sorted half's range → search there
Otherwise → search the other half
```

**Algorithm**:
1. Find mid.
2. Determine which half is sorted (compare arr[lo] with arr[mid]).
3. Check if target is within the sorted half's range.
4. Narrow search accordingly.

**Edge cases**:
- Duplicates make it O(n) worst case (can't determine sorted half).
- Single-element array.
- No rotation (already sorted).

---

## Other Search Problems

### Find Peak Element

A peak is an element greater than its neighbors. In an array where
`arr[-1] = arr[n] = -infinity`, at least one peak always exists.

**Binary search approach**:
- If `arr[mid] < arr[mid + 1]`, a peak must exist to the right → `lo = mid + 1`.
- Otherwise, a peak must exist at mid or to the left → `hi = mid`.

Time: O(log n).

### Search in 2D Matrix

For an m×n matrix where:
- Each row is sorted left to right
- First element of each row > last element of previous row

Treat it as a flattened sorted array of length m*n:
- `row = Math.floor(index / n)`
- `col = index % n`

Standard binary search on index [0, m*n - 1]. Time: O(log(m*n)).

---

## DFS and BFS Recap

While linear and binary search operate on arrays, **DFS** and **BFS** are the
fundamental search algorithms for **trees and graphs**.

### Depth-First Search (DFS)

- Explores as deep as possible before backtracking.
- Implemented with recursion (implicit stack) or explicit stack.
- Time: O(V + E), Space: O(V)
- Use cases: path finding, cycle detection, topological sort, tree traversals.

```
    1
   / \
  2   3
 / \
4   5

DFS order: 1 → 2 → 4 → 5 → 3
```

### Breadth-First Search (BFS)

- Explores all neighbors at current depth before going deeper.
- Implemented with a queue.
- Time: O(V + E), Space: O(V)
- Use cases: shortest path (unweighted), level-order traversal.

```
BFS order: 1 → 2 → 3 → 4 → 5
```

### When to Choose

| Criteria                     | DFS          | BFS            |
| ---------------------------- | ------------ | -------------- |
| Shortest path (unweighted)   | No           | Yes            |
| Memory for wide graphs       | Better       | Worse (O(width)) |
| Memory for deep graphs       | Worse (O(depth)) | Better     |
| Detect cycles                | Yes          | Yes            |
| Topological sort             | Yes          | Yes (Kahn's)   |
| Level-order traversal        | No           | Yes            |
| Path existence               | Yes          | Yes            |

---

## Key Takeaways

1. **Binary search requires sorted data**. Always verify the precondition.

2. **The lower/upper bound pattern** is more useful than exact-match binary search.
   Most real problems use these variants.

3. **Binary search on answer** is a powerful technique that applies to optimization
   problems: "find the minimum X such that condition is satisfiable."

4. **Off-by-one errors** are the #1 source of bugs in binary search. Be deliberate
   about `lo < hi` vs `lo <= hi` and `mid` vs `mid ± 1`.

5. **Use `lo + Math.floor((hi - lo) / 2)`** to calculate mid. It's a good habit
   even in JavaScript where integer overflow isn't a concern.

6. **Rotated array search** is a classic interview problem. The key insight is that
   one half is always sorted.

7. **DFS and BFS** are the search algorithms for graphs and trees. DFS for deep
   exploration, BFS for shortest paths and level-order.

8. **Linear search is not always bad**. For small inputs, unsorted data, or
   one-time lookups, it's perfectly appropriate.
