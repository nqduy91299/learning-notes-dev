// ============================================================================
// Heap — Exercises (15 total: 5 predict, 3 fix, 7 implement)
// Run: npx tsx 06-dsa/02-data-structures/08-heap/exercises.ts
// ============================================================================

// ============================================================================
// PREDICT EXERCISES (5) — What does this code output?
// ============================================================================

// --- Predict 1 ---
// What does this print?
function predict1(): void {
  const heap = [1, 3, 2, 7, 5];
  const parentOf3 = Math.floor((1 - 1) / 2);
  const leftChildOf0 = 2 * 0 + 1;
  const rightChildOf0 = 2 * 0 + 2;
  console.log("Predict 1:", `parent of index 1: ${parentOf3}, left child of 0: ${leftChildOf0}, right child of 0: ${rightChildOf0}`);
  console.log("Predict 1 values:", heap[parentOf3], heap[leftChildOf0], heap[rightChildOf0]);
}
// Your prediction: ???

// --- Predict 2 ---
// What does this print?
function predict2(): void {
  function siftUp(heap: number[], index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[index] >= heap[parent]) break;
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      index = parent;
    }
  }

  const heap = [1, 3, 2, 7, 5];
  heap.push(0);
  siftUp(heap, heap.length - 1);
  console.log("Predict 2:", heap);
}
// Your prediction: ???

// --- Predict 3 ---
// What does this print?
function predict3(): void {
  function siftDown(heap: number[], index: number, size: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < size && heap[left] < heap[smallest]) smallest = left;
      if (right < size && heap[right] < heap[smallest]) smallest = right;
      if (smallest === index) break;
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
      index = smallest;
    }
  }

  const heap = [1, 3, 2, 7, 5];
  // Extract min: replace root with last, sift down
  const min = heap[0];
  heap[0] = heap.pop()!;
  siftDown(heap, 0, heap.length);
  console.log("Predict 3:", `min=${min}, heap=${JSON.stringify(heap)}`);
}
// Your prediction: ???

// --- Predict 4 ---
// What does this print?
function predict4(): void {
  // Build max-heap from [4, 1, 3, 2, 5]
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

  const arr = [4, 1, 3, 2, 5];
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    siftDownMax(arr, i, arr.length);
  }
  console.log("Predict 4:", arr);
  // Hint: root should be 5 (max element)
}
// Your prediction: ???

// --- Predict 5 ---
// What does this print?
function predict5(): void {
  // Simulating extracting 3 elements from a min-heap
  class SimpleMinHeap {
    private data: number[];
    constructor(arr: number[]) {
      this.data = [...arr];
      for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i--) {
        this.siftDown(i);
      }
    }
    extractMin(): number {
      const min = this.data[0];
      this.data[0] = this.data[this.data.length - 1];
      this.data.pop();
      if (this.data.length > 0) this.siftDown(0);
      return min;
    }
    private siftDown(index: number): void {
      while (true) {
        let smallest = index;
        const l = 2 * index + 1;
        const r = 2 * index + 2;
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l;
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r;
        if (smallest === index) break;
        [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
        index = smallest;
      }
    }
  }

  const heap = new SimpleMinHeap([8, 3, 5, 1, 9, 2]);
  const results: number[] = [];
  results.push(heap.extractMin());
  results.push(heap.extractMin());
  results.push(heap.extractMin());
  console.log("Predict 5:", results);
}
// Your prediction: ???

// ============================================================================
// FIX EXERCISES (3) — Find and fix the bug(s)
// ============================================================================

// --- Fix 1 ---
// This min-heap sift up has a bug — it creates a max-heap instead.
function fix1_siftUp(heap: number[], index: number): void {
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (heap[index] <= heap[parent]) break; // BUG: wrong comparison
    [heap[index], heap[parent]] = [heap[parent], heap[index]];
    index = parent;
  }
}

// Test:
// const heap = [1, 3, 2];
// heap.push(0);
// fix1_siftUp(heap, 3);
// console.log("Fix 1:", heap); // Expected: [0, 3, 2, 1] (0 should bubble to root)

// --- Fix 2 ---
// This extract min doesn't handle the single-element case properly.
class Fix2MinHeap {
  heap: number[] = [];

  insert(val: number): void {
    this.heap.push(val);
    this.siftUp(this.heap.length - 1);
  }

  extractMin(): number {
    if (this.heap.length === 0) throw new Error("Empty");
    const min = this.heap[0];
    // BUG: doesn't check if heap becomes empty after pop
    this.heap[0] = this.heap.pop()!;
    this.siftDown(0);
    return min;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index] >= this.heap[parent]) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
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

// Test:
// const h = new Fix2MinHeap();
// h.insert(5);
// console.log("Fix 2:", h.extractMin()); // Expected: 5 (and heap should be empty)
// console.log("Fix 2 heap:", h.heap); // Expected: []

// --- Fix 3 ---
// This heap sort produces descending order instead of ascending.
function fix3_heapSort(arr: number[]): void {
  const n = arr.length;

  // Build min-heap (BUG: should build max-heap for ascending sort)
  function siftDown(index: number, size: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < size && arr[left] < arr[smallest]) smallest = left;
      if (right < size && arr[right] < arr[smallest]) smallest = right;
      if (smallest === index) break;
      [arr[index], arr[smallest]] = [arr[smallest], arr[index]];
      index = smallest;
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(i, n);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    siftDown(0, i);
  }
}

// Test:
// const arr = [5, 3, 8, 1, 2];
// fix3_heapSort(arr);
// console.log("Fix 3:", arr); // Expected: [1, 2, 3, 5, 8] (ascending)

// ============================================================================
// IMPLEMENT EXERCISES (7)
// ============================================================================

// --- Implement 1 ---
// Implement a MinHeap class with insert, extractMin, and peek.
class MinHeap {
  private heap: number[] = [];

  insert(_val: number): void {
    // TODO: implement
  }

  extractMin(): number {
    // TODO: implement
    throw new Error("Not implemented");
  }

  peek(): number {
    // TODO: implement
    throw new Error("Not implemented");
  }

  size(): number {
    return this.heap.length;
  }

  toArray(): number[] {
    return [...this.heap];
  }
}

// Test:
// const h = new MinHeap();
// h.insert(5); h.insert(3); h.insert(7); h.insert(1);
// console.log("Impl 1 peek:", h.peek()); // 1
// console.log("Impl 1 extract:", h.extractMin()); // 1
// console.log("Impl 1 extract:", h.extractMin()); // 3
// console.log("Impl 1 size:", h.size()); // 2

// --- Implement 2 ---
// Implement heap sort (ascending order, in-place).
function heapSort(_arr: number[]): void {
  // TODO: implement
}

// Test:
// const arr = [5, 3, 8, 1, 2, 9, 4];
// heapSort(arr);
// console.log("Impl 2:", arr); // [1, 2, 3, 4, 5, 8, 9]

// --- Implement 3 ---
// Find the kth largest element in an unsorted array.
// Use a min-heap of size k.
function findKthLargest(_nums: number[], _k: number): number {
  // TODO: implement
  return -1;
}

// Test:
// console.log("Impl 3a:", findKthLargest([3, 2, 1, 5, 6, 4], 2)); // 5
// console.log("Impl 3b:", findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)); // 4

// --- Implement 4 ---
// Merge k sorted arrays into one sorted array.
// Use a min-heap to always pick the smallest element.
function mergeKSortedArrays(_arrays: number[][]): number[] {
  // TODO: implement
  return [];
}

// Test:
// console.log("Impl 4:", mergeKSortedArrays([[1, 4, 7], [2, 5, 8], [3, 6, 9]]));
// Expected: [1, 2, 3, 4, 5, 6, 7, 8, 9]

// --- Implement 5 ---
// Given an array of numbers, return the top K most frequent elements.
function topKFrequent(_nums: number[], _k: number): number[] {
  // TODO: implement
  return [];
}

// Test:
// console.log("Impl 5a:", topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
// console.log("Impl 5b:", topKFrequent([1], 1)); // [1]

// --- Implement 6 ---
// Implement a MaxHeap class with insert, extractMax, and peek.
class MaxHeap {
  private heap: number[] = [];

  insert(_val: number): void {
    // TODO: implement
  }

  extractMax(): number {
    // TODO: implement
    throw new Error("Not implemented");
  }

  peek(): number {
    // TODO: implement
    throw new Error("Not implemented");
  }

  size(): number {
    return this.heap.length;
  }
}

// Test:
// const mh = new MaxHeap();
// mh.insert(3); mh.insert(7); mh.insert(1); mh.insert(5);
// console.log("Impl 6 peek:", mh.peek()); // 7
// console.log("Impl 6 extract:", mh.extractMax()); // 7
// console.log("Impl 6 extract:", mh.extractMax()); // 5

// --- Implement 7 ---
// Sort a nearly sorted (k-sorted) array where each element is at most k
// positions away from its sorted position.
function sortNearlySorted(_arr: number[], _k: number): number[] {
  // TODO: implement using a min-heap of size k+1
  return [];
}

// Test:
// console.log("Impl 7:", sortNearlySorted([3, 2, 1, 5, 4, 7, 6, 8], 2));
// Expected: [1, 2, 3, 4, 5, 6, 7, 8]

// ============================================================================
// Runner — uncomment to test
// ============================================================================

// predict1();
// predict2();
// predict3();
// predict4();
// predict5();

export {
  MinHeap,
  MaxHeap,
  heapSort,
  findKthLargest,
  mergeKSortedArrays,
  topKFrequent,
  sortNearlySorted,
};
