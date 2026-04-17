# Heap

## Table of Contents

- [What is a Heap?](#what-is-a-heap)
- [Heap Property](#heap-property)
- [Array Representation](#array-representation)
- [Parent/Child Index Formulas](#parentchild-index-formulas)
- [Core Operations](#core-operations)
- [Heapify: Sift Up and Sift Down](#heapify-sift-up-and-sift-down)
- [Build Heap](#build-heap)
- [Insert](#insert)
- [Extract Min/Max](#extract-minmax)
- [Peek](#peek)
- [Heap Sort](#heap-sort)
- [Priority Queue](#priority-queue)
- [Top-K Problems](#top-k-problems)
- [Median of Stream](#median-of-stream)
- [Complexity Summary](#complexity-summary)

---

## What is a Heap?

A **heap** is a specialized **complete binary tree** that satisfies the **heap
property**. It's most commonly used to implement **priority queues** — where you
need fast access to the minimum or maximum element.

Unlike a BST, a heap does NOT maintain a sorted order among siblings. It only
guarantees the relationship between parent and child.

---

## Heap Property

### Min-Heap

Every parent node is **less than or equal to** its children.
The **minimum** element is always at the root.

```
        1
       / \
      3   2
     / \
    7   5
```

### Max-Heap

Every parent node is **greater than or equal to** its children.
The **maximum** element is always at the root.

```
        9
       / \
      7   6
     / \
    3   5
```

**Key point**: Heaps are **not** fully sorted. They only guarantee the root is
the min (or max). The rest of the tree has no particular order among siblings.

---

## Array Representation

Since a heap is a **complete binary tree**, it can be stored efficiently in an
array with **no gaps** — no need for pointers.

```
Tree:       1
           / \
          3   2
         / \
        7   5

Array: [1, 3, 2, 7, 5]
Index:  0  1  2  3  4
```

The tree structure is implicitly defined by the array indices.

---

## Parent/Child Index Formulas

For a node at index `i` (0-indexed):

| Relationship | Formula |
|-------------|---------|
| **Parent** | `Math.floor((i - 1) / 2)` |
| **Left child** | `2 * i + 1` |
| **Right child** | `2 * i + 2` |

**Example** (index 1, value 3):
- Parent: `Math.floor((1-1)/2) = 0` → value 1 ✓
- Left child: `2*1+1 = 3` → value 7 ✓
- Right child: `2*1+2 = 4` → value 5 ✓

For **1-indexed** arrays (some textbooks):
- Parent: `Math.floor(i / 2)`
- Left child: `2 * i`
- Right child: `2 * i + 1`

We'll use **0-indexed** throughout this document.

---

## Core Operations

| Operation | Time | Description |
|-----------|------|-------------|
| `peek()` | O(1) | View the min/max without removing |
| `insert(val)` | O(log n) | Add a new element |
| `extractMin/Max()` | O(log n) | Remove and return the min/max |
| `buildHeap(arr)` | O(n) | Build a heap from an unsorted array |
| `heapSort(arr)` | O(n log n) | Sort using a heap |

---

## Heapify: Sift Up and Sift Down

These are the two fundamental operations that maintain the heap property.

### Sift Up (Bubble Up)

Used after **insertion**. The new element is placed at the end and "bubbles up"
to its correct position.

```typescript
// Min-heap sift up
function siftUp(heap: number[], index: number): void {
  while (index > 0) {
    const parentIdx = Math.floor((index - 1) / 2);
    if (heap[index] >= heap[parentIdx]) break; // heap property satisfied
    // Swap with parent
    [heap[index], heap[parentIdx]] = [heap[parentIdx], heap[index]];
    index = parentIdx;
  }
}
```

**Visualization** — Insert 0 into min-heap `[1, 3, 2, 7, 5]`:

```
Step 0: [1, 3, 2, 7, 5, 0]   ← 0 added at end (index 5)
         parent of 5 is 2 (index 2), 0 < 2 → swap

Step 1: [1, 3, 0, 7, 5, 2]   ← 0 now at index 2
         parent of 2 is 0 (index 0), 0 < 1 → swap

Step 2: [0, 3, 1, 7, 5, 2]   ← 0 at root. Done!
```

### Sift Down (Bubble Down)

Used after **extraction**. The last element replaces the root and "sinks down"
to its correct position.

```typescript
// Min-heap sift down
function siftDown(heap: number[], index: number, size: number): void {
  while (true) {
    let smallest = index;
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (left < size && heap[left] < heap[smallest]) {
      smallest = left;
    }
    if (right < size && heap[right] < heap[smallest]) {
      smallest = right;
    }
    if (smallest === index) break; // heap property satisfied

    [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
    index = smallest;
  }
}
```

**Visualization** — Extract min from `[1, 3, 2, 7, 5]`:

```
Step 0: Replace root with last: [5, 3, 2, 7]
         compare 5 with children: left=3, right=2. Smallest=2 → swap

Step 1: [2, 3, 5, 7]
         index=2, left=5 (index 5, out of bounds). Done!

Result: extracted 1, heap is [2, 3, 5, 7]
```

---

## Build Heap

### Naive approach: Insert one by one → O(n log n)

Insert each element and sift up.

### Optimal approach: Heapify bottom-up → O(n)

Start from the last non-leaf node and sift down each node. This is O(n) because
most nodes are near the bottom and need minimal sifting.

```typescript
function buildHeap(arr: number[]): void {
  const n = arr.length;
  // Start from last non-leaf node
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }
}
```

**Why O(n)?** Mathematical proof:
- Nodes at height `h` need at most `h` swaps.
- There are at most `n / 2^(h+1)` nodes at height `h`.
- Total work: Σ (n / 2^(h+1)) × h for h from 0 to log n = O(n).

The key insight: half the nodes are leaves (height 0, zero work), a quarter are
at height 1 (one swap max), etc.

---

## Insert

1. Add the new element at the **end** of the array.
2. **Sift up** to restore the heap property.

```typescript
class MinHeap {
  private heap: number[] = [];

  insert(val: number): void {
    this.heap.push(val);
    this.siftUp(this.heap.length - 1);
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index] >= this.heap[parentIdx]) break;
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }
}
```

Time: O(log n) — at most the height of the tree.

---

## Extract Min/Max

1. Save the root (min/max).
2. Move the **last element** to the root.
3. Remove the last element.
4. **Sift down** from the root to restore the heap property.

```typescript
class MinHeap {
  private heap: number[] = [];

  extractMin(): number {
    if (this.heap.length === 0) throw new Error("Heap is empty");
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  private siftDown(index: number): void {
    const size = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < size && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < size && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
```

Time: O(log n).

---

## Peek

Return the root element without removing it.

```typescript
peek(): number {
  if (this.heap.length === 0) throw new Error("Heap is empty");
  return this.heap[0];
}
```

Time: O(1).

---

## Heap Sort

Use a heap to sort an array **in-place**.

### Algorithm (using max-heap for ascending order):

1. **Build a max-heap** from the array — O(n).
2. Repeatedly **extract max**: swap root with last unsorted element, reduce
   heap size, sift down — O(n log n).

```typescript
function heapSort(arr: number[]): void {
  const n = arr.length;

  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDownMax(arr, i, n);
  }

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; // Move max to end
    siftDownMax(arr, 0, i);               // Restore heap on reduced array
  }
}

function siftDownMax(arr: number[], index: number, size: number): void {
  while (true) {
    let largest = index;
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    if (left < size && arr[left] > arr[largest]) largest = left;
    if (right < size && arr[right] > arr[largest]) largest = right;
    if (largest === index) break;
    [arr[index], arr[largest]] = [arr[largest], arr[index]];
    index = largest;
  }
}
```

| Property | Value |
|----------|-------|
| Time | O(n log n) — always |
| Space | O(1) — in-place |
| Stable | No |
| In-place | Yes |

Heap sort is not as cache-friendly as quicksort, so it's rarely the default
choice despite its O(n log n) worst case.

---

## Priority Queue

A **priority queue** is an abstract data type where each element has a priority.
Elements with higher priority are dequeued first. A heap is the standard
implementation.

```typescript
interface PriorityQueueItem<T> {
  value: T;
  priority: number;
}

class PriorityQueue<T> {
  private heap: PriorityQueueItem<T>[] = [];

  enqueue(value: T, priority: number): void {
    this.heap.push({ value, priority });
    this.siftUp(this.heap.length - 1);
  }

  dequeue(): T {
    if (this.heap.length === 0) throw new Error("Queue is empty");
    const item = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return item.value;
  }

  private siftUp(index: number): void { /* same pattern, compare .priority */ }
  private siftDown(index: number): void { /* same pattern, compare .priority */ }
}
```

**Use cases**: Dijkstra's algorithm, task scheduling, event-driven simulation,
merge k sorted lists.

---

## Top-K Problems

### Kth Largest Element

Use a **min-heap of size k**. After processing all elements, the root is the
kth largest.

```typescript
function findKthLargest(nums: number[], k: number): number {
  // Use a min-heap of size k
  const heap = new MinHeap();
  for (const num of nums) {
    heap.insert(num);
    if (heap.size() > k) {
      heap.extractMin(); // Remove smallest, keeping k largest
    }
  }
  return heap.peek(); // Root = kth largest
}
```

Time: O(n log k). Space: O(k).

**Why min-heap for kth largest?** The min-heap of size k keeps the k largest
elements. The smallest among them (the root) is the kth largest.

### Top K Frequent Elements

1. Count frequencies with a map.
2. Use a min-heap of size k on frequencies.

---

## Median of Stream

Maintain **two heaps**:
- **Max-heap** for the lower half (gives quick access to max of lower half).
- **Min-heap** for the upper half (gives quick access to min of upper half).

```
Stream: 1, 5, 3, 8, 2

After 1:  maxHeap=[1]  minHeap=[]       median=1
After 5:  maxHeap=[1]  minHeap=[5]      median=(1+5)/2=3
After 3:  maxHeap=[1,3] → max=[3,1]  minHeap=[5]  median=3
After 8:  maxHeap=[3,1]  minHeap=[5,8]  median=(3+5)/2=4
After 2:  maxHeap=[3,2,1] minHeap=[5,8] median=3
```

**Rules**:
- Both heaps should differ in size by at most 1.
- All elements in max-heap ≤ all elements in min-heap.
- Insert: add to appropriate heap, rebalance if needed.
- Median: if equal size → average of two tops; if unequal → top of larger heap.

Time: O(log n) per insert, O(1) for median.

---

## Complexity Summary

| Operation | Time | Space |
|-----------|------|-------|
| Build heap | O(n) | O(1) in-place |
| Insert | O(log n) | O(1) |
| Extract min/max | O(log n) | O(1) |
| Peek | O(1) | O(1) |
| Heap sort | O(n log n) | O(1) |
| Find kth largest | O(n log k) | O(k) |
| Median of stream (per op) | O(log n) | O(n) |
| Merge k sorted arrays | O(N log k) | O(k) |

Where:
- `n` = number of elements in the heap
- `k` = number of top elements or number of arrays
- `N` = total number of elements across all arrays

---

## When to Use a Heap

| Problem Pattern | Heap Type |
|----------------|-----------|
| Kth largest element | Min-heap of size k |
| Kth smallest element | Max-heap of size k |
| Merge k sorted lists | Min-heap of size k |
| Running median | Max-heap + min-heap |
| Task scheduling by priority | Min-heap (or max-heap) |
| Dijkstra's shortest path | Min-heap |
| Top K frequent | Min-heap of size k |
| Sort nearly sorted array | Min-heap of size k |
