# Arrays & Strings

## Table of Contents

1. [Array Fundamentals](#array-fundamentals)
2. [Memory Layout](#memory-layout)
3. [Time Complexity Overview](#time-complexity-overview)
4. [Dynamic Arrays](#dynamic-arrays)
5. [Two Pointer Technique](#two-pointer-technique)
6. [Sliding Window Technique](#sliding-window-technique)
7. [Prefix Sum Technique](#prefix-sum-technique)
8. [String Manipulation](#string-manipulation)
9. [Common Array Patterns](#common-array-patterns)
10. [Matrix Operations](#matrix-operations)
11. [Arrays vs Other Structures](#arrays-vs-other-structures)

---

## Array Fundamentals

An **array** is a contiguous block of memory that stores elements of the same type sequentially.
Because elements are laid out one after another in memory, any element can be accessed in
constant time using its index.

### Why O(1) Access?

The address of any element can be computed directly:

```
address(arr[i]) = baseAddress + i * elementSize
```

No traversal is needed. The CPU computes the memory address with a single arithmetic
operation, making random access extremely fast.

### Why O(n) Insert/Delete?

Inserting or deleting at an arbitrary position requires shifting all subsequent elements
to maintain contiguity:

```
Original:  [1, 2, 3, 4, 5]
Insert 9 at index 2:
Step 1:    [1, 2, _, 3, 4, 5]   // shift 3,4,5 right
Step 2:    [1, 2, 9, 3, 4, 5]   // place 9
```

In the worst case (inserting at index 0), all n elements must move, giving O(n).

### Key Properties

| Property            | Value                        |
|---------------------|------------------------------|
| Access by index     | O(1)                         |
| Search (unsorted)   | O(n)                         |
| Search (sorted)     | O(log n) via binary search   |
| Insert at end       | O(1) amortized (dynamic)     |
| Insert at beginning | O(n)                         |
| Insert at middle    | O(n)                         |
| Delete at end       | O(1)                         |
| Delete at beginning | O(n)                         |
| Delete at middle    | O(n)                         |
| Space               | O(n)                         |

---

## Memory Layout

### Contiguous Memory

Arrays store elements in adjacent memory locations. This is critical for performance
because modern CPUs load data in **cache lines** (typically 64 bytes). When you access
`arr[0]`, the CPU loads nearby memory into cache, so accessing `arr[1]`, `arr[2]`, etc.
is extremely fast (cache hit).

```
Memory Address:  0x100  0x104  0x108  0x10C  0x110
Array Content:   [  10  |  20  |  30  |  40  |  50  ]
Index:              0      1      2      3      4
```

### JavaScript Arrays Are Special

JavaScript "arrays" are actually objects with integer keys under the hood. V8 optimizes
them into two modes:

1. **Packed (SMI/Double/Elements)**: When arrays contain only integers or doubles with no
   holes, V8 stores them as true contiguous arrays for performance.
2. **Holey**: When arrays have gaps (`[1, , 3]`), V8 falls back to a dictionary-like
   representation, which is slower.
3. **Dictionary mode**: Very sparse arrays become hash tables internally.

**Best practice**: Initialize arrays without holes and avoid deleting elements with
`delete arr[i]` (use `splice` instead).

### TypedArrays

For true contiguous memory in JavaScript, use `TypedArray`:

```typescript
const buffer = new ArrayBuffer(16);     // 16 bytes of raw memory
const int32View = new Int32Array(buffer); // view as 4 x 32-bit integers
int32View[0] = 42;
```

TypedArrays guarantee contiguous memory and fixed element sizes, making them suitable
for performance-critical numerical work.

---

## Time Complexity Overview

### Common Operations Cheat Sheet

```
Operation              | Array    | Dynamic Array | Linked List
-----------------------|----------|---------------|------------
Access by index        | O(1)     | O(1)          | O(n)
Push (end)             | N/A      | O(1)*         | O(1)**
Pop (end)              | N/A      | O(1)          | O(n)***
Unshift (beginning)    | O(n)     | O(n)          | O(1)
Shift (beginning)      | O(n)     | O(n)          | O(1)
Insert at middle       | O(n)     | O(n)          | O(1)****
Search                 | O(n)     | O(n)          | O(n)

*  amortized
** with tail pointer
*** singly linked; O(1) for doubly linked
**** after reaching the position
```

---

## Dynamic Arrays

A **dynamic array** (like JavaScript's `Array`, C++'s `std::vector`, Java's `ArrayList`)
automatically resizes when it runs out of capacity.

### How Resizing Works

1. Array starts with some initial capacity (e.g., 4).
2. When a push exceeds capacity, allocate a new array of **2x** the current capacity.
3. Copy all existing elements to the new array.
4. Add the new element.
5. Free the old array.

### Amortized O(1) Push

Although a single push can cost O(n) when resizing occurs, resizing happens
exponentially less often. The amortized cost per push is O(1).

**Proof sketch (aggregate method)**:

Starting from capacity 1, after n pushes the total copy cost is:

```
1 + 2 + 4 + 8 + ... + n ≈ 2n
```

Total work for n pushes = n (for placing) + 2n (for copying) = 3n.
Amortized cost per push = 3n / n = O(1).

### Growth Factor Tradeoffs

| Growth Factor | Memory Waste | Copy Frequency |
|---------------|-------------|----------------|
| 2x            | Up to 50%   | Less frequent  |
| 1.5x          | Up to 33%   | More frequent  |
| 1.25x         | Up to 20%   | Most frequent  |

Most implementations use 1.5x or 2x. JavaScript engines typically use 1.5x.

### Implementing a Simple Dynamic Array

```typescript
class DynamicArray<T> {
  private data: (T | undefined)[];
  private count: number;

  constructor(private capacity: number = 4) {
    this.data = new Array(capacity);
    this.count = 0;
  }

  push(value: T): void {
    if (this.count === this.capacity) {
      this.resize(this.capacity * 2);
    }
    this.data[this.count] = value;
    this.count++;
  }

  get(index: number): T {
    if (index < 0 || index >= this.count) throw new RangeError("Index out of bounds");
    return this.data[index] as T;
  }

  get length(): number {
    return this.count;
  }

  private resize(newCapacity: number): void {
    const newData = new Array(newCapacity);
    for (let i = 0; i < this.count; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
    this.capacity = newCapacity;
  }
}
```

---

## Two Pointer Technique

The **two pointer** technique uses two indices that move through an array to solve
problems in O(n) time that might otherwise require O(n^2).

### Variants

#### 1. Opposite-Direction Pointers

Pointers start at opposite ends and move toward each other.

**Use cases**: palindrome check, two-sum on sorted arrays, container with most water.

```
[1, 2, 3, 4, 5, 6, 7]
 ^                    ^
 left              right
```

```typescript
function twoSumSorted(arr: number[], target: number): [number, number] | null {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}
```

#### 2. Same-Direction Pointers (Fast/Slow)

Both pointers start at the beginning; one moves faster.

**Use cases**: remove duplicates, partition array, linked list cycle detection.

```
[1, 1, 2, 2, 3, 4, 4]
 s
 f
```

```typescript
function removeDuplicatesSorted(nums: number[]): number {
  if (nums.length === 0) return 0;
  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}
```

#### 3. Equi-Directional with Gap

Two pointers maintain a fixed or variable gap.

**Use cases**: sliding window problems (see next section).

### When to Use Two Pointers

- Array is **sorted** or has some ordering property
- You need to find a **pair** satisfying a condition
- You need to **partition** elements in-place
- Problem involves **comparing elements** from both ends

---

## Sliding Window Technique

The **sliding window** technique maintains a window (subarray) that "slides" across
the array, updating the result incrementally.

### Fixed-Size Window

Window size is known in advance.

```typescript
function maxSumSubarray(arr: number[], k: number): number {
  let windowSum = 0;

  // Initialize first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;

  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // add new element, remove old
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}
```

**Time**: O(n) instead of O(n*k) brute force.

### Variable-Size Window

Window expands and contracts based on a condition.

```typescript
function minSubarrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}
```

### Sliding Window Template

```
1. Initialize window boundaries (left = 0)
2. Expand window (move right pointer)
3. Update window state (add element)
4. While window violates constraint:
   a. Update result if needed
   b. Shrink window (move left pointer)
   c. Update window state (remove element)
5. Update result if needed
```

### Common Sliding Window Problems

| Problem                              | Window Type | Key Insight                    |
|--------------------------------------|-------------|--------------------------------|
| Max sum subarray of size k           | Fixed       | Add new, subtract old          |
| Longest substring without repeating  | Variable    | Shrink when duplicate found    |
| Minimum window substring             | Variable    | Shrink when all chars covered  |
| Fruits into baskets                  | Variable    | Shrink when > 2 types          |

---

## Prefix Sum Technique

A **prefix sum** array stores cumulative sums, enabling O(1) range sum queries after
O(n) preprocessing.

### Building a Prefix Sum

```
Original:   [2, 4, 1, 3, 5]
Prefix Sum: [0, 2, 6, 7, 10, 15]
             ^-- prefix[0] = 0 (sentinel)
```

```typescript
function buildPrefixSum(arr: number[]): number[] {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
  }
  return prefix;
}

// Sum of arr[left..right] inclusive
function rangeSum(prefix: number[], left: number, right: number): number {
  return prefix[right + 1] - prefix[left];
}
```

### Why It Works

```
sum(arr[2..4]) = sum(arr[0..4]) - sum(arr[0..1])
               = prefix[5] - prefix[2]
               = 15 - 6
               = 9
```

### 2D Prefix Sum

For matrix range sum queries, extend to 2D using inclusion-exclusion:

```
prefix[i][j] = matrix[i-1][j-1]
             + prefix[i-1][j]
             + prefix[i][j-1]
             - prefix[i-1][j-1]
```

### Applications

- Range sum queries (immutable array)
- Subarray sum equals K (prefix sum + hash map)
- Count of subarrays with sum in range
- Equilibrium index (prefix sum from both ends)

---

## String Manipulation

### String Immutability in JavaScript

Strings in JavaScript (and TypeScript) are **immutable**. Every "modification" creates
a new string:

```typescript
let s = "hello";
s[0] = "H";      // silently fails; s is still "hello"
s = "H" + s.slice(1); // creates a NEW string "Hello"
```

**Implication**: Concatenating strings in a loop is O(n^2) in the worst case because
each concatenation creates a new string and copies all previous characters.

```typescript
// BAD: O(n^2)
let result = "";
for (let i = 0; i < n; i++) {
  result += char; // copies entire result each time
}

// GOOD: O(n)
const parts: string[] = [];
for (let i = 0; i < n; i++) {
  parts.push(char);
}
const result = parts.join("");
```

### StringBuilder Concept

JavaScript doesn't have a built-in `StringBuilder` class like Java/C#. The idiomatic
approach is to collect parts in an array and `join` at the end:

```typescript
class StringBuilder {
  private parts: string[] = [];

  append(s: string): this {
    this.parts.push(s);
    return this;
  }

  toString(): string {
    return this.parts.join("");
  }
}
```

### Character Frequency Counting

A fundamental string technique using a map or fixed-size array:

```typescript
function charFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}

// For lowercase ASCII only (faster):
function charFrequencyArray(s: string): number[] {
  const freq = new Array(26).fill(0);
  for (const ch of s) {
    freq[ch.charCodeAt(0) - 97]++;
  }
  return freq;
}
```

### Common String Operations and Complexity

| Operation                  | Complexity |
|----------------------------|-----------|
| `s.length`                 | O(1)      |
| `s[i]` / `s.charAt(i)`    | O(1)      |
| `s.slice(i, j)`           | O(j - i)  |
| `s + t`                   | O(n + m)  |
| `s.indexOf(t)`            | O(n * m)  |
| `s.split(delim)`          | O(n)      |
| `s.replace(regex, repl)`  | O(n)      |

---

## Common Array Patterns

### 1. In-Place Reversal

Reverse an array without extra space using two pointers:

```typescript
function reverseInPlace<T>(arr: T[]): void {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
}
```

### 2. Partitioning (Lomuto Scheme)

Rearrange elements around a pivot: elements < pivot come first, then elements >= pivot.

```typescript
function partition(arr: number[], pivotVal: number): number {
  let boundary = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivotVal) {
      [arr[boundary], arr[i]] = [arr[i], arr[boundary]];
      boundary++;
    }
  }
  return boundary;
}
```

### 3. Dutch National Flag (3-Way Partition)

Partition array into three groups: less than, equal to, greater than pivot.
Uses three pointers: `low`, `mid`, `high`.

```typescript
function dutchNationalFlag(arr: number[], pivot: number): void {
  let low = 0;
  let mid = 0;
  let high = arr.length - 1;

  while (mid <= high) {
    if (arr[mid] < pivot) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low++;
      mid++;
    } else if (arr[mid] === pivot) {
      mid++;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high--;
    }
  }
}
```

**Application**: Sort an array of 0s, 1s, and 2s in O(n) time, O(1) space.

### 4. Kadane's Algorithm (Maximum Subarray Sum)

```typescript
function maxSubarraySum(arr: number[]): number {
  let maxSoFar = arr[0];
  let maxEndingHere = arr[0];

  for (let i = 1; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }

  return maxSoFar;
}
```

### 5. Boyer-Moore Voting Algorithm (Majority Element)

Find the element appearing more than n/2 times:

```typescript
function majorityElement(nums: number[]): number {
  let candidate = nums[0];
  let count = 1;

  for (let i = 1; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i];
      count = 1;
    } else if (nums[i] === candidate) {
      count++;
    } else {
      count--;
    }
  }

  return candidate;
}
```

---

## Matrix Operations

### 2D Array Representation

A matrix is represented as an array of arrays:

```typescript
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
// matrix[row][col]
```

### Traversal Patterns

#### Row-Major (Standard)
```typescript
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    // process matrix[r][c]
  }
}
```

#### Column-Major
```typescript
for (let c = 0; c < cols; c++) {
  for (let r = 0; r < rows; r++) {
    // process matrix[r][c]
  }
}
```

#### Diagonal Traversal
```typescript
// Main diagonal
for (let i = 0; i < n; i++) {
  // process matrix[i][i]
}

// Anti-diagonal
for (let i = 0; i < n; i++) {
  // process matrix[i][n - 1 - i]
}
```

#### Spiral Traversal
```typescript
function spiralOrder(matrix: number[][]): number[] {
  const result: number[] = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
      left++;
    }
  }
  return result;
}
```

### Rotate Matrix 90 Degrees Clockwise

Two-step approach: transpose then reverse each row.

```typescript
function rotate90(matrix: number[][]): void {
  const n = matrix.length;

  // Transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }

  // Reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}
```

### Search in Sorted Matrix

If each row and column is sorted, use staircase search from top-right:

```typescript
function searchMatrix(matrix: number[][], target: number): boolean {
  let row = 0;
  let col = matrix[0].length - 1;

  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) return true;
    if (matrix[row][col] > target) col--;
    else row++;
  }

  return false;
}
```

**Time**: O(m + n) where m = rows, n = cols.

---

## Arrays vs Other Structures

### When to Use Arrays

- **Random access** is needed frequently
- **Iteration** over all elements is the primary operation
- Data size is known or grows primarily at the end
- **Cache performance** matters (contiguous memory)
- You need **sorting** capabilities

### When NOT to Use Arrays

| Need                        | Better Alternative    | Why                              |
|-----------------------------|-----------------------|----------------------------------|
| Frequent insert/delete head | Linked List / Deque   | O(1) vs O(n)                     |
| Key-value lookup            | Hash Map              | O(1) vs O(n)                     |
| Unique elements + lookup    | Set                   | O(1) lookup vs O(n)              |
| Priority-based retrieval    | Heap / Priority Queue | O(log n) vs O(n)                 |
| LIFO access                 | Stack (array-backed)  | Arrays work fine here            |
| FIFO access                 | Queue / Deque         | O(1) dequeue vs O(n) shift       |
| Sorted + dynamic insert     | BST / Sorted Set      | O(log n) insert vs O(n)          |
| Hierarchical data           | Tree                  | Natural recursive structure      |
| Relationship data           | Graph                 | Adjacency list/matrix            |

### JavaScript-Specific Guidance

- Use `Array` for general-purpose lists; V8 optimizes well
- Use `TypedArray` for numerical/binary data
- Use `Map` instead of object for dynamic key-value pairs
- Use `Set` for uniqueness checks
- Avoid `Array.prototype.shift()` in hot loops (O(n) each call)
- Prefer `for` loops over `.forEach()` in performance-critical code

---

## Summary

Arrays and strings are the most fundamental data structures. Mastering them requires
understanding:

1. **Memory model**: contiguous layout, cache efficiency, dynamic resizing
2. **Core techniques**: two pointers, sliding window, prefix sum
3. **String handling**: immutability awareness, builder pattern
4. **Patterns**: in-place modification, partitioning, frequency counting
5. **Tradeoffs**: when arrays excel vs when to pick alternatives

These concepts form the foundation for nearly every other data structure and algorithm
topic. Most interview problems begin with arrays/strings before progressing to more
complex structures.
