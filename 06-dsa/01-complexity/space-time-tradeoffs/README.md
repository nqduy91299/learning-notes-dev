# Space-Time Tradeoffs

## Table of Contents

1. [Introduction](#introduction)
2. [Trading Space for Time](#trading-space-for-time)
3. [Trading Time for Space](#trading-time-for-space)
4. [When to Optimize for Time vs Space](#when-to-optimize-for-time-vs-space)
5. [Practical Decision Making](#practical-decision-making)

---

## Introduction

The space-time tradeoff is a fundamental concept in computer science: you can often
make an algorithm **faster by using more memory**, or make it **use less memory by
doing more computation**.

Almost every optimization decision involves this tradeoff:

| Approach            | Time       | Space      | Example                  |
| ------------------- | ---------- | ---------- | ------------------------ |
| Brute force         | Slow       | Minimal    | Recompute everything     |
| Precomputation      | Fast       | More       | Lookup tables            |
| Caching/Memoization | Fast (avg) | More       | Store computed results   |
| Streaming           | Slower     | Minimal    | Process one item at a time|
| In-place            | Same/Slower| Minimal    | Modify input directly    |

The right choice depends on your constraints: available memory, latency requirements,
input size, and how often the computation runs.

---

## Trading Space for Time

The most common direction: **use extra memory to speed things up**.

### Hash Tables for Fast Lookup

The classic example. Converting O(n) linear search to O(1) lookup by storing data
in a hash map.

```typescript
// O(n) — scan every time
function findUserLinear(users: { id: number; name: string }[], id: number): string | undefined {
  for (const user of users) {
    if (user.id === id) return user.name;
  }
  return undefined;
}

// O(1) average — build index once, lookup instantly
function buildUserIndex(users: { id: number; name: string }[]): Map<number, string> {
  const index = new Map<number, string>();
  for (const user of users) {
    index.set(user.id, user.name);
  }
  return index;
}
// Tradeoff: O(n) extra space, but all subsequent lookups are O(1)
```

### Caching / Memoization

Store results of expensive computations so you never recompute the same thing twice.

```typescript
// Without memoization: O(2^n) — exponential
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// With memoization: O(n) time, O(n) space
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}
```

Memoization is a **space-for-time tradeoff**: we store O(n) results to avoid
O(2^n) redundant computations.

### Precomputation

Compute answers in advance and store them in a table.

**Prefix sums** — answer range-sum queries in O(1) after O(n) preprocessing:

```typescript
// Without precomputation: each range sum query is O(n)
function rangeSumNaive(arr: number[], l: number, r: number): number {
  let sum = 0;
  for (let i = l; i <= r; i++) sum += arr[i];
  return sum;
}

// With precomputation: O(n) setup, O(1) per query
function buildPrefixSum(arr: number[]): number[] {
  const prefix: number[] = [0];
  for (const num of arr) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  return prefix;
}

function rangeSumFast(prefix: number[], l: number, r: number): number {
  return prefix[r + 1] - prefix[l];
}
```

**Lookup tables** — precompute results for all possible inputs:

```typescript
// Precompute population count for all 16-bit values
const popCountTable = new Uint8Array(65536);
for (let i = 1; i < 65536; i++) {
  popCountTable[i] = popCountTable[i >> 1] + (i & 1);
}

function popCount32(n: number): number {
  return popCountTable[n & 0xffff] + popCountTable[(n >> 16) & 0xffff];
}
// 64KB of space for O(1) bit counting
```

### Dynamic Programming

DP is fundamentally a space-time tradeoff: store solutions to subproblems to
avoid recomputing them.

```typescript
// Longest Common Subsequence
// Without DP: O(2^n) — enumerate all subsequences
// With DP: O(n*m) time, O(n*m) space
function lcs(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}
```

### Bloom Filters

A probabilistic data structure: uses very little space to answer "is this
element in the set?" with possible false positives but no false negatives.

- Space: much less than a hash set
- Time: O(k) per query where k = number of hash functions (constant)
- Tradeoff: you accept a small probability of false positives

Used in: spell checkers, network routers, database query optimization.

---

## Trading Time for Space

Less common but important when memory is constrained.

### Streaming Algorithms

Process data in a single pass with O(1) or O(log n) space, even when the input
is too large to fit in memory.

```typescript
// Finding the majority element — Boyer-Moore Voting Algorithm
// O(n) time, O(1) space
function majorityElement(arr: number[]): number {
  let candidate = arr[0];
  let count = 1;

  for (let i = 1; i < arr.length; i++) {
    if (count === 0) {
      candidate = arr[i];
      count = 1;
    } else if (arr[i] === candidate) {
      count++;
    } else {
      count--;
    }
  }
  return candidate; // assumes majority element exists
}
```

Compare with the hash map approach that uses O(n) space.

### In-Place Algorithms

Modify the input array instead of creating new data structures.

```typescript
// Reverse array — O(n) time, O(1) space
function reverseInPlace(arr: number[]): void {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++;
    hi--;
  }
}

// Rotate array by k positions — O(n) time, O(1) space
function rotateInPlace(arr: number[], k: number): void {
  const n = arr.length;
  k = k % n;
  reverse(arr, 0, n - 1);
  reverse(arr, 0, k - 1);
  reverse(arr, k, n - 1);
}

function reverse(arr: number[], lo: number, hi: number): void {
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++;
    hi--;
  }
}
```

### Recomputation Instead of Storage

Sometimes it's cheaper to recompute a value than to store it.

```typescript
// Instead of storing a precomputed matrix, compute on the fly
function getMatrixValue(i: number, j: number): number {
  return i * j; // Pascal's triangle, multiplication table, etc.
}
// O(1) space instead of O(n²), but must compute each access
```

### Compression

Trade CPU time (for compression/decompression) to reduce memory usage:

- Run-length encoding
- Dictionary compression
- Delta encoding for time series

---

## When to Optimize for Time vs Space

### Optimize for Time When:

1. **Latency matters** — user-facing applications, real-time systems
2. **The computation runs frequently** — a lookup called millions of times
3. **Memory is cheap relative to compute** — most modern servers
4. **The data fits comfortably in memory** — no risk of OOM
5. **You're CPU-bound** — profiling shows the bottleneck is computation

### Optimize for Space When:

1. **Memory is limited** — embedded systems, mobile devices, browser tabs
2. **Data is too large for RAM** — processing terabytes of logs
3. **Memory cost is significant** — cloud billing per GB of RAM
4. **Cache efficiency matters** — smaller data structures fit in L1/L2 cache
5. **You're memory-bound** — profiling shows cache misses are the bottleneck

### The Cache Efficiency Factor

Sometimes **using less space actually makes code faster** because it fits in
CPU cache:

```
L1 cache access:  ~1 ns
L2 cache access:  ~4 ns
L3 cache access:  ~10 ns
RAM access:       ~100 ns
```

A compact array that fits in L1 cache can be faster than a hash map that
causes cache misses, even though the hash map has better Big-O complexity.

This is why `Array.includes()` on small arrays (< 50 elements) can outperform
`Set.has()` in practice despite being O(n) vs O(1).

---

## Practical Decision Making

### Framework for Choosing

Ask these questions in order:

1. **Does it meet the performance requirement?**
   If the simple solution is fast enough, stop. Don't optimize prematurely.

2. **What's the bottleneck?**
   Profile first. Is it CPU, memory, I/O, or network?

3. **What are the constraints?**
   Max memory available? Latency budget? Input size range?

4. **What's the access pattern?**
   - Many repeated queries → precompute / cache
   - Single pass over data → streaming
   - Random access → hash table
   - Sequential access → arrays

5. **What's the cost of being wrong?**
   - Can you use a probabilistic approach (Bloom filter)?
   - Can you accept approximate answers?

### Common Patterns Summary

| Problem Pattern                  | Space-for-Time Solution          | Time-for-Space Solution      |
| -------------------------------- | -------------------------------- | ---------------------------- |
| Repeated lookups                 | Hash map / index                 | Linear scan each time        |
| Overlapping subproblems          | Memoization / DP table           | Recompute each time          |
| Range queries                    | Prefix sums / segment tree       | Sum the range each query     |
| Duplicate detection              | Hash set                         | Sort + scan or nested loops  |
| Frequency counting               | Hash map                         | Sort + count runs            |
| Graph shortest path              | BFS with visited set             | Iterative deepening DFS      |
| String matching                  | Suffix array / trie              | Naive character comparison   |

### Real-World Examples

**DNS caching**: Your browser caches DNS lookups. Space: a few KB. Time saved:
50-200ms per uncached lookup. Massive win.

**Database indexes**: A B-tree index on a column uses extra disk space but turns
O(n) table scans into O(log n) lookups.

**React useMemo/useCallback**: Cache computed values or function references to
avoid re-renders. Space: trivial. Time saved: potentially significant in
render-heavy components.

**CDN edge caching**: Copies of content stored worldwide. Enormous space cost,
but latency drops from 200ms to 20ms.

---

## Summary

- Most optimizations trade space for time (hash maps, caching, precomputation)
- Trading time for space matters in memory-constrained environments
- Always profile before optimizing — know your actual bottleneck
- Consider cache effects: smaller data can be faster even with worse Big-O
- The right tradeoff depends on your specific constraints and access patterns
- When in doubt, prefer the simpler solution until measurements show it's insufficient
