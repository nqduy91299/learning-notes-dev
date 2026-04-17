# Big-O Notation

## Table of Contents

1. [What is Big-O Notation?](#what-is-big-o-notation)
2. [Why Complexity Matters](#why-complexity-matters)
3. [Common Time Complexities](#common-time-complexities)
4. [Comparing Growth Rates](#comparing-growth-rates)
5. [Best, Average, and Worst Case](#best-average-and-worst-case)
6. [Big-Omega and Big-Theta](#big-omega-and-big-theta)
7. [Amortized Analysis](#amortized-analysis)
8. [Space Complexity](#space-complexity)
9. [Common Data Structure Operation Complexities](#common-data-structure-operation-complexities)
10. [How to Analyze Code](#how-to-analyze-code)

---

## What is Big-O Notation?

Big-O notation is a mathematical notation used to describe the **upper bound** of an
algorithm's growth rate. It tells us how the runtime or space requirements of an algorithm
scale as the input size grows toward infinity.

Formally, we say `f(n) = O(g(n))` if there exist positive constants `c` and `n₀` such that:

```
f(n) ≤ c * g(n)  for all n ≥ n₀
```

In practical terms, Big-O answers the question: **"As my input gets arbitrarily large,
how does the number of operations grow?"**

Key principles:

- **Drop constants**: `O(2n)` simplifies to `O(n)`
- **Drop lower-order terms**: `O(n² + n)` simplifies to `O(n²)`
- **Focus on the dominant term**: the term that grows fastest wins
- **Worst-case by default**: unless stated otherwise, Big-O describes worst case

### A Simple Example

```typescript
// This function is O(n) — it visits each element once
function sum(arr: number[]): number {
  let total = 0;
  for (const num of arr) {
    total += num;
  }
  return total;
}
```

Even if we add a constant operation before the loop, it's still `O(n)`:

```typescript
function sumPlusOne(arr: number[]): number {
  let total = 0;        // O(1)
  console.log("start"); // O(1)
  for (const num of arr) {
    total += num;        // O(n) total
  }
  return total;          // O(1)
}
// Total: O(1) + O(1) + O(n) + O(1) = O(n)
```

---

## Why Complexity Matters

Consider searching for an element in a sorted array of 1 billion elements:

| Algorithm       | Complexity | Operations (approx) | Time @ 1 billion ops/sec |
| --------------- | ---------- | ------------------- | ------------------------ |
| Linear search   | O(n)       | 1,000,000,000       | ~1 second                |
| Binary search   | O(log n)   | ~30                 | ~30 nanoseconds          |

The difference between O(n) and O(log n) at scale is the difference between
**1 second and 30 nanoseconds** — a factor of ~33 million.

### Why not just benchmark?

Benchmarks measure actual wall-clock time on specific hardware with a specific input.
Big-O gives us **hardware-independent**, **input-size-independent** understanding of
how an algorithm scales. Both are valuable:

- **Big-O**: for algorithm design decisions and comparing approaches
- **Benchmarks**: for measuring real-world performance with actual data

---

## Common Time Complexities

### O(1) — Constant Time

The number of operations does not depend on input size.

```typescript
function getFirst(arr: number[]): number | undefined {
  return arr[0];
}

function hashMapLookup(map: Map<string, number>, key: string): number | undefined {
  return map.get(key); // Average case O(1)
}
```

Examples: array index access, hash table lookup (average), stack push/pop,
checking if a number is even/odd.

### O(log n) — Logarithmic Time

The input is **halved** (or reduced by a constant factor) at each step. The base
of the logarithm doesn't matter in Big-O because `log_a(n) = log_b(n) / log_b(a)`,
and `1/log_b(a)` is a constant we drop.

```typescript
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

Examples: binary search, balanced BST lookup, exponentiation by squaring.

### O(n) — Linear Time

We visit each element a constant number of times.

```typescript
function findMax(arr: number[]): number {
  let max = -Infinity;
  for (const num of arr) {
    if (num > max) max = num;
  }
  return max;
}
```

Examples: linear search, iterating an array, counting elements, finding min/max.

### O(n log n) — Linearithmic Time

Common in efficient sorting algorithms. Typically arises when we divide the problem
in half (log n levels) and do O(n) work at each level.

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++]);
    else result.push(b[j++]);
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}
```

Examples: merge sort, heap sort, quicksort (average case), many divide-and-conquer algorithms.

### O(n²) — Quadratic Time

Usually involves nested iteration over the input.

```typescript
function bubbleSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}
```

Examples: bubble sort, selection sort, insertion sort (worst case), checking all pairs.

### O(2^n) — Exponential Time

The number of operations doubles with each additional input element. Typically arises
in brute-force solutions to combinatorial problems.

```typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generates all subsets of an array
function allSubsets<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];
  const [first, ...rest] = arr;
  const subsetsWithoutFirst = allSubsets(rest);
  const subsetsWithFirst = subsetsWithoutFirst.map((s) => [first, ...s]);
  return [...subsetsWithoutFirst, ...subsetsWithFirst];
}
```

Examples: naive Fibonacci, power set generation, brute-force subset problems.

### O(n!) — Factorial Time

Grows astronomically fast. Arises when generating all permutations.

```typescript
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}
```

Examples: generating all permutations, brute-force traveling salesman, brute-force
solutions to NP-hard problems.

| n   | O(n!) operations      |
| --- | --------------------- |
| 5   | 120                   |
| 10  | 3,628,800             |
| 15  | 1,307,674,368,000     |
| 20  | 2,432,902,008,176,640,000 |

---

## Comparing Growth Rates

From slowest to fastest growing:

```
O(1) < O(log n) < O(√n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2^n) < O(n!)
```

### Growth rate comparison table

| n       | O(1) | O(log n) | O(n)    | O(n log n) | O(n²)          | O(2^n)          |
| ------- | ---- | -------- | ------- | ---------- | -------------- | --------------- |
| 10      | 1    | 3.3      | 10      | 33         | 100            | 1,024           |
| 100     | 1    | 6.6      | 100     | 664        | 10,000         | 1.27 × 10³⁰    |
| 1,000   | 1    | 10       | 1,000   | 9,966      | 1,000,000      | too large       |
| 10,000  | 1    | 13.3     | 10,000  | 132,877    | 100,000,000    | too large       |
| 100,000 | 1    | 16.6     | 100,000 | 1,660,964  | 10,000,000,000 | too large       |

### Practical input size limits

Given ~10^8 operations per second as a rough guide:

| Complexity | Max feasible n (in ~1 second) |
| ---------- | ----------------------------- |
| O(n)       | ~100,000,000                  |
| O(n log n) | ~5,000,000                    |
| O(n²)      | ~10,000                       |
| O(n³)      | ~500                          |
| O(2^n)     | ~25                           |
| O(n!)      | ~12                           |

---

## Best, Average, and Worst Case

Big-O is often used to describe the **worst case**, but algorithms can behave
differently depending on the input:

### Linear Search Example

```typescript
function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
```

- **Best case**: O(1) — target is the first element
- **Average case**: O(n/2) = O(n) — target is somewhere in the middle
- **Worst case**: O(n) — target is the last element or not present

### Quicksort Example

- **Best case**: O(n log n) — pivot always splits evenly
- **Average case**: O(n log n) — random pivots tend to split reasonably
- **Worst case**: O(n²) — pivot is always the smallest or largest element

This is why quicksort uses **randomized pivots** in practice — to make the worst
case astronomically unlikely.

---

## Big-Omega and Big-Theta

### Big-Omega (Ω) — Lower Bound

`f(n) = Ω(g(n))` means `f(n)` grows **at least as fast** as `g(n)`.

Formally: there exist positive constants `c` and `n₀` such that
`f(n) ≥ c * g(n)` for all `n ≥ n₀`.

Example: Any comparison-based sorting algorithm is `Ω(n log n)` — you cannot
sort faster than `n log n` comparisons in the worst case.

### Big-Theta (Θ) — Tight Bound

`f(n) = Θ(g(n))` means `f(n)` grows **at the same rate** as `g(n)`.

Formally: `f(n) = O(g(n))` AND `f(n) = Ω(g(n))`.

Example: Merge sort is `Θ(n log n)` — it's both O(n log n) and Ω(n log n)
in the worst case.

### Summary

| Notation | Meaning     | Analogy |
| -------- | ----------- | ------- |
| O(g(n))  | Upper bound | ≤       |
| Ω(g(n))  | Lower bound | ≥       |
| Θ(g(n))  | Tight bound | =       |

In practice, most engineers say "Big-O" when they really mean "Big-Theta" (tight bound).
This is technically imprecise but universally understood.

---

## Amortized Analysis

Amortized analysis looks at the **average cost per operation** over a sequence of
operations, even if individual operations may be expensive.

### Dynamic Array (ArrayList) Example

When a dynamic array is full and you push a new element, it doubles its capacity
and copies all elements — an O(n) operation. But this happens rarely.

```
Push #1:  capacity 1 → 2,  copy 1 element
Push #3:  capacity 2 → 4,  copy 2 elements
Push #5:  capacity 4 → 8,  copy 4 elements
Push #9:  capacity 8 → 16, copy 8 elements
Push #17: capacity 16 → 32, copy 16 elements
```

Total copies after n pushes: `1 + 2 + 4 + 8 + ... + n/2 = n - 1`

So n pushes cost O(n) total work for copying, meaning each push costs
**O(n) / n = O(1) amortized**.

### Why This Matters

JavaScript's `Array.push()` is O(1) amortized. If you see it in a loop:

```typescript
const result: number[] = [];
for (let i = 0; i < n; i++) {
  result.push(i); // O(1) amortized
}
// Total: O(n), not O(n²)
```

Other examples of amortized O(1):
- Hash table insertion (with resizing)
- Splay tree operations (amortized O(log n))

---

## Space Complexity

Space complexity measures **how much additional memory** an algorithm uses relative
to input size. We typically measure **auxiliary space** (extra space beyond the input).

### Examples

```typescript
// O(1) space — only uses a fixed number of variables
function sumArray(arr: number[]): number {
  let sum = 0;
  for (const n of arr) sum += n;
  return sum;
}

// O(n) space — creates a new array of the same size
function doubleAll(arr: number[]): number[] {
  return arr.map((n) => n * 2);
}

// O(n) space — recursive call stack grows to depth n
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// O(log n) space — recursive binary search uses log n stack frames
function binarySearchRecursive(
  arr: number[],
  target: number,
  lo: number,
  hi: number
): number {
  if (lo > hi) return -1;
  const mid = Math.floor((lo + hi) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) return binarySearchRecursive(arr, target, mid + 1, hi);
  return binarySearchRecursive(arr, target, lo, mid - 1);
}
```

### Common Space Complexities

| Pattern                        | Space     |
| ------------------------------ | --------- |
| Fixed variables                | O(1)      |
| Hash map of input elements     | O(n)      |
| 2D matrix                      | O(n²)    |
| Recursion depth d              | O(d)      |
| Merge sort                     | O(n)      |
| Quicksort (in-place)           | O(log n)  |
| BFS/DFS visited set            | O(n)      |

---

## Common Data Structure Operation Complexities

### Arrays

| Operation          | Time      | Notes                  |
| ------------------ | --------- | ---------------------- |
| Access by index    | O(1)      |                        |
| Search (unsorted)  | O(n)      |                        |
| Search (sorted)    | O(log n)  | Binary search          |
| Insert at end      | O(1)*     | Amortized              |
| Insert at start    | O(n)      | Shift all elements     |
| Delete at end      | O(1)      |                        |
| Delete at start    | O(n)      | Shift all elements     |

### Linked List (with tail pointer)

| Operation             | Time | Notes                   |
| --------------------- | ---- | ----------------------- |
| Access by index       | O(n) |                         |
| Search                | O(n) |                         |
| Insert at head        | O(1) |                         |
| Insert at tail        | O(1) | With tail pointer       |
| Delete at head        | O(1) |                         |
| Delete at tail        | O(n) | Singly linked; O(1) DLL|

### Hash Table (average case)

| Operation | Time | Worst Case |
| --------- | ---- | ---------- |
| Search    | O(1) | O(n)       |
| Insert    | O(1) | O(n)       |
| Delete    | O(1) | O(n)       |

### Binary Search Tree (balanced)

| Operation | Time      | Unbalanced Worst |
| --------- | --------- | ---------------- |
| Search    | O(log n)  | O(n)             |
| Insert    | O(log n)  | O(n)             |
| Delete    | O(log n)  | O(n)             |

### Heap (Binary)

| Operation  | Time      |
| ---------- | --------- |
| Find min   | O(1)      |
| Insert     | O(log n)  |
| Delete min | O(log n)  |
| Build heap | O(n)      |

---

## How to Analyze Code

### Rule 1: Sequential Statements — Add

```typescript
function example(arr: number[]): void {
  // Block A: O(n)
  for (const x of arr) { /* ... */ }

  // Block B: O(n²)
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) { /* ... */ }
  }
}
// Total: O(n) + O(n²) = O(n²)
```

### Rule 2: Nested Loops — Multiply

```typescript
function nested(n: number): void {
  for (let i = 0; i < n; i++) {       // O(n)
    for (let j = 0; j < n; j++) {     // × O(n)
      console.log(i, j);              // O(1)
    }
  }
}
// Total: O(n) × O(n) = O(n²)
```

### Rule 3: Dependent Inner Loops — Sum Carefully

```typescript
function triangular(n: number): void {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      // inner runs: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²)
    }
  }
}
```

### Rule 4: Halving — Logarithmic

```typescript
function halving(n: number): void {
  let i = n;
  while (i > 1) {
    i = Math.floor(i / 2); // halving → O(log n) iterations
  }
}
```

### Rule 5: Recursion — Use the Recurrence Relation

For `T(n) = a * T(n/b) + O(n^d)`, apply the **Master Theorem**:

- If `d < log_b(a)`: T(n) = O(n^(log_b(a)))
- If `d = log_b(a)`: T(n) = O(n^d * log n)
- If `d > log_b(a)`: T(n) = O(n^d)

**Merge sort**: `T(n) = 2T(n/2) + O(n)` → a=2, b=2, d=1 → d = log₂(2) = 1
→ Case 2 → T(n) = O(n log n)

**Binary search**: `T(n) = T(n/2) + O(1)` → a=1, b=2, d=0 → d = log₂(1) = 0
→ Case 2 → T(n) = O(log n)

### Rule 6: Multiple Inputs — Keep Separate Variables

```typescript
function printPairs(a: number[], b: number[]): void {
  for (const x of a) {       // O(a)
    for (const y of b) {     // × O(b)
      console.log(x, y);
    }
  }
}
// Total: O(a × b), NOT O(n²) unless a = b = n
```

### Common Traps

1. **String concatenation in a loop**: Building a string with `+=` in a loop is
   O(n²) because strings are immutable — each concatenation creates a new string.
   Use `Array.join()` instead.

2. **Array.includes() in a loop**: `includes` is O(n), so using it inside an O(n)
   loop gives O(n²). Use a `Set` for O(1) lookups.

3. **Slice inside recursion**: `arr.slice()` is O(n), so passing slices in recursive
   calls can add an O(n) factor. Pass indices instead.

4. **Object.keys().length**: This is O(n) to compute. If you need frequent size
   checks, track the count separately or use a `Map` with `.size`.

---

## Summary

- Big-O describes **how an algorithm scales** with input size
- Focus on the **dominant term** and **drop constants**
- Know the common complexities and their practical limits
- Analyze code by examining **loops, recursion, and data structure operations**
- Consider **both time and space** complexity
- Use **amortized analysis** for operations that are occasionally expensive
- Always ask: **"What happens when n doubles?"**

| If n doubles... | O(1)  | O(log n) | O(n) | O(n log n) | O(n²) | O(2^n)    |
| --------------- | ----- | -------- | ---- | ---------- | ------ | --------- |
| Operations      | same  | +1       | 2x   | ~2x        | 4x     | squared   |
