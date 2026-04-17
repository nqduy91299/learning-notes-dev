// ============================================================================
// Heap — Solutions
// Run: npx tsx 06-dsa/02-data-structures/08-heap/solutions.ts
// ============================================================================

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}`);
  }
}

function arrEq(a: unknown[], b: unknown[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ============================================================================
// PREDICT SOLUTIONS
// ============================================================================

function solvePredict1(): void {
  // parent of index 1: 0, left child of 0: 1, right child of 0: 2
  // values: heap[0]=1, heap[1]=3, heap[2]=2
  const heap = [1, 3, 2, 7, 5];
  const parentOf1 = Math.floor((1 - 1) / 2); // 0
  const leftOf0 = 2 * 0 + 1; // 1
  const rightOf0 = 2 * 0 + 2; // 2
  console.log("Predict 1:", `parent of index 1: ${parentOf1}, left child of 0: ${leftOf0}, right child of 0: ${rightOf0}`);
  console.log("Predict 1 values:", heap[parentOf1], heap[leftOf0], heap[rightOf0]);
  assert(parentOf1 === 0 && leftOf0 === 1 && rightOf0 === 2, "Predict 1: indices correct");
  assert(heap[parentOf1] === 1 && heap[leftOf0] === 3 && heap[rightOf0] === 2, "Predict 1: values correct");
}

function solvePredict2(): void {
  // Insert 0 into [1,3,2,7,5]:
  // [1,3,2,7,5,0] → sift up: 0 at index 5, parent=2(val 2), swap → [1,3,0,7,5,2]
  // 0 at index 2, parent=0(val 1), swap → [0,3,1,7,5,2]
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
  assert(arrEq(heap, [0, 3, 1, 7, 5, 2]), "Predict 2 → [0,3,1,7,5,2]");
}

function solvePredict3(): void {
  // Extract min from [1,3,2,7,5]:
  // min=1, replace root with 5 → [5,3,2,7]
  // sift down: 5 vs children 3,2 → swap with 2 → [2,3,5,7]
  // index=2, no children in range → done
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
  const min = heap[0];
  heap[0] = heap.pop()!;
  siftDown(heap, 0, heap.length);
  console.log("Predict 3:", `min=${min}, heap=${JSON.stringify(heap)}`);
  assert(min === 1, "Predict 3: min=1");
  assert(arrEq(heap, [2, 3, 5, 7]), "Predict 3: heap=[2,3,5,7]");
}

function solvePredict4(): void {
  // Build max-heap from [4,1,3,2,5]
  // Start from index 1 (last non-leaf = floor(5/2)-1 = 1)
  // i=1: node=1, children=2,5 → largest=5(idx 4) → swap → [4,5,3,2,1]
  // i=0: node=4, children=5,3 → largest=5(idx 1) → swap → [5,4,3,2,1]
  //   continue: idx 1, children=2,1 → 4>2,4>1 → done
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
  assert(arr[0] === 5, "Predict 4: root is 5 (max)");
  assert(arrEq(arr, [5, 4, 3, 2, 1]), "Predict 4 → [5,4,3,2,1]");
}

function solvePredict5(): void {
  // Build min-heap from [8,3,5,1,9,2], extract 3 times → [1, 2, 3]
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
  assert(arrEq(results, [1, 2, 3]), "Predict 5 → [1,2,3]");
}

// ============================================================================
// FIX SOLUTIONS
// ============================================================================

function solveFix1(): void {
  // Bug: comparison was >= (max-heap logic). Fix: use >= for BREAK condition
  // in min-heap, meaning break when heap[index] >= parent (already in place).
  // The original had: if (heap[index] <= heap[parent]) break — this breaks when
  // child is SMALLER, which is the opposite of what min-heap wants.
  // Fix: if (heap[index] >= heap[parent]) break;
  function siftUp(heap: number[], index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[index] >= heap[parent]) break; // FIX: >= not <=
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      index = parent;
    }
  }
  const heap = [1, 3, 2];
  heap.push(0);
  siftUp(heap, 3);
  console.log("Fix 1:", heap);
  assert(heap[0] === 0, "Fix 1: 0 bubbled to root");
}

function solveFix2(): void {
  // Bug: when heap has 1 element, pop removes it, then heap[0] = undefined.
  // Fix: check if heap is empty after pop.
  class FixedMinHeap {
    heap: number[] = [];

    insert(val: number): void {
      this.heap.push(val);
      this.siftUp(this.heap.length - 1);
    }

    extractMin(): number {
      if (this.heap.length === 0) throw new Error("Empty");
      const min = this.heap[0];
      const last = this.heap.pop()!; // FIX: store popped value
      if (this.heap.length > 0) {    // FIX: only reassign if heap not empty
        this.heap[0] = last;
        this.siftDown(0);
      }
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

  const h = new FixedMinHeap();
  h.insert(5);
  const result = h.extractMin();
  console.log("Fix 2:", result, "heap:", h.heap);
  assert(result === 5, "Fix 2: extracted 5");
  assert(h.heap.length === 0, "Fix 2: heap is empty");
}

function solveFix3(): void {
  // Bug: uses min-heap sift down (< comparison), which builds a min-heap.
  // Swapping min to end gives descending order.
  // Fix: use max-heap sift down (> comparison) for ascending sort.
  function heapSort(arr: number[]): void {
    const n = arr.length;

    function siftDownMax(index: number, size: number): void {
      while (true) {
        let largest = index;
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        if (left < size && arr[left] > arr[largest]) largest = left;   // FIX: > not <
        if (right < size && arr[right] > arr[largest]) largest = right; // FIX: > not <
        if (largest === index) break;
        [arr[index], arr[largest]] = [arr[largest], arr[index]];
        index = largest;
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDownMax(i, n);
    }
    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      siftDownMax(0, i);
    }
  }

  const arr = [5, 3, 8, 1, 2];
  heapSort(arr);
  console.log("Fix 3:", arr);
  assert(arrEq(arr, [1, 2, 3, 5, 8]), "Fix 3 → [1,2,3,5,8]");
}

// ============================================================================
// IMPLEMENT SOLUTIONS
// ============================================================================

// --- Implement 1: MinHeap class ---
class MinHeap {
  private heap: number[] = [];

  insert(val: number): void {
    this.heap.push(val);
    this.siftUp(this.heap.length - 1);
  }

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

  peek(): number {
    if (this.heap.length === 0) throw new Error("Heap is empty");
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  toArray(): number[] {
    return [...this.heap];
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

function solveImpl1(): void {
  const h = new MinHeap();
  h.insert(5); h.insert(3); h.insert(7); h.insert(1);
  assert(h.peek() === 1, "Impl 1: peek → 1");
  assert(h.extractMin() === 1, "Impl 1: extract → 1");
  assert(h.extractMin() === 3, "Impl 1: extract → 3");
  assert(h.size() === 2, "Impl 1: size → 2");
  assert(h.extractMin() === 5, "Impl 1: extract → 5");
  assert(h.extractMin() === 7, "Impl 1: extract → 7");
  assert(h.size() === 0, "Impl 1: empty");
}

// --- Implement 2: Heap sort ---
function heapSort(arr: number[]): void {
  const n = arr.length;

  function siftDownMax(index: number, size: number): void {
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

  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDownMax(i, n);
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    siftDownMax(0, i);
  }
}

function solveImpl2(): void {
  const arr = [5, 3, 8, 1, 2, 9, 4];
  heapSort(arr);
  console.log("Impl 2:", arr);
  assert(arrEq(arr, [1, 2, 3, 4, 5, 8, 9]), "Impl 2: heap sort");

  const arr2 = [1];
  heapSort(arr2);
  assert(arrEq(arr2, [1]), "Impl 2: single element");

  const arr3: number[] = [];
  heapSort(arr3);
  assert(arrEq(arr3, []), "Impl 2: empty array");
}

// --- Implement 3: Kth largest ---
function findKthLargest(nums: number[], k: number): number {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.insert(num);
    if (heap.size() > k) {
      heap.extractMin();
    }
  }
  return heap.peek();
}

function solveImpl3(): void {
  assert(findKthLargest([3, 2, 1, 5, 6, 4], 2) === 5, "Impl 3: kth=2 → 5");
  assert(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) === 4, "Impl 3: kth=4 → 4");
  assert(findKthLargest([1], 1) === 1, "Impl 3: single → 1");
}

// --- Implement 4: Merge k sorted arrays ---
function mergeKSortedArrays(arrays: number[][]): number[] {
  // Use a min-heap storing {value, arrayIndex, elementIndex}
  // For simplicity, use our MinHeap with encoded values
  // Better approach: custom heap with tuples
  const result: number[] = [];
  const heap: { val: number; arrIdx: number; elemIdx: number }[] = [];

  // Helper: sift up for custom heap
  function siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[index].val >= heap[parent].val) break;
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      index = parent;
    }
  }

  function siftDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < heap.length && heap[left].val < heap[smallest].val) smallest = left;
      if (right < heap.length && heap[right].val < heap[smallest].val) smallest = right;
      if (smallest === index) break;
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
      index = smallest;
    }
  }

  // Initialize: push first element of each array
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) {
      heap.push({ val: arrays[i][0], arrIdx: i, elemIdx: 0 });
      siftUp(heap.length - 1);
    }
  }

  while (heap.length > 0) {
    // Extract min
    const min = heap[0];
    result.push(min.val);

    const nextElemIdx = min.elemIdx + 1;
    if (nextElemIdx < arrays[min.arrIdx].length) {
      heap[0] = { val: arrays[min.arrIdx][nextElemIdx], arrIdx: min.arrIdx, elemIdx: nextElemIdx };
    } else {
      heap[0] = heap[heap.length - 1];
      heap.pop();
    }
    if (heap.length > 0) siftDown(0);
  }

  return result;
}

function solveImpl4(): void {
  const result = mergeKSortedArrays([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  console.log("Impl 4:", result);
  assert(arrEq(result, [1, 2, 3, 4, 5, 6, 7, 8, 9]), "Impl 4: merge 3 arrays");

  assert(arrEq(mergeKSortedArrays([]), []), "Impl 4: empty");
  assert(arrEq(mergeKSortedArrays([[1, 2, 3]]), [1, 2, 3]), "Impl 4: single array");
}

// --- Implement 5: Top K frequent elements ---
function topKFrequent(nums: number[], k: number): number[] {
  // Count frequencies
  const freq = new Map<number, number>();
  for (const num of nums) {
    freq.set(num, (freq.get(num) ?? 0) + 1);
  }

  // Use min-heap of size k on frequencies
  // Store [frequency, number] pairs
  const heap: [number, number][] = []; // [freq, num]

  function siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (heap[index][0] >= heap[parent][0]) break;
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      index = parent;
    }
  }

  function siftDown(index: number): void {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;
      if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;
      if (smallest === index) break;
      [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
      index = smallest;
    }
  }

  for (const [num, count] of freq) {
    heap.push([count, num]);
    siftUp(heap.length - 1);
    if (heap.length > k) {
      // Extract min
      heap[0] = heap[heap.length - 1];
      heap.pop();
      if (heap.length > 0) siftDown(0);
    }
  }

  return heap.map(([_, num]) => num).sort((a, b) => {
    // Sort by frequency descending for consistent output
    return (freq.get(b) ?? 0) - (freq.get(a) ?? 0);
  });
}

function solveImpl5(): void {
  const r1 = topKFrequent([1, 1, 1, 2, 2, 3], 2);
  console.log("Impl 5:", r1);
  assert(r1.includes(1) && r1.includes(2) && r1.length === 2, "Impl 5: top 2 frequent");

  const r2 = topKFrequent([1], 1);
  assert(arrEq(r2, [1]), "Impl 5: single → [1]");
}

// --- Implement 6: MaxHeap ---
class MaxHeap {
  private heap: number[] = [];

  insert(val: number): void {
    this.heap.push(val);
    this.siftUp(this.heap.length - 1);
  }

  extractMax(): number {
    if (this.heap.length === 0) throw new Error("Heap is empty");
    const max = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return max;
  }

  peek(): number {
    if (this.heap.length === 0) throw new Error("Heap is empty");
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index] <= this.heap[parent]) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  private siftDown(index: number): void {
    const size = this.heap.length;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < size && this.heap[left] > this.heap[largest]) largest = left;
      if (right < size && this.heap[right] > this.heap[largest]) largest = right;
      if (largest === index) break;
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

function solveImpl6(): void {
  const mh = new MaxHeap();
  mh.insert(3); mh.insert(7); mh.insert(1); mh.insert(5);
  assert(mh.peek() === 7, "Impl 6: peek → 7");
  assert(mh.extractMax() === 7, "Impl 6: extract → 7");
  assert(mh.extractMax() === 5, "Impl 6: extract → 5");
  assert(mh.extractMax() === 3, "Impl 6: extract → 3");
  assert(mh.extractMax() === 1, "Impl 6: extract → 1");
  assert(mh.size() === 0, "Impl 6: empty");
}

// --- Implement 7: Sort nearly sorted array ---
function sortNearlySorted(arr: number[], k: number): number[] {
  const heap = new MinHeap();
  const result: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    heap.insert(arr[i]);
    if (heap.size() > k + 1) {
      result.push(heap.extractMin());
    }
  }

  while (heap.size() > 0) {
    result.push(heap.extractMin());
  }

  return result;
}

function solveImpl7(): void {
  const result = sortNearlySorted([3, 2, 1, 5, 4, 7, 6, 8], 2);
  console.log("Impl 7:", result);
  assert(arrEq(result, [1, 2, 3, 4, 5, 6, 7, 8]), "Impl 7: nearly sorted");

  assert(arrEq(sortNearlySorted([1], 1), [1]), "Impl 7: single");
}

// ============================================================================
// Runner
// ============================================================================

console.log("=== PREDICT ===");
solvePredict1();
solvePredict2();
solvePredict3();
solvePredict4();
solvePredict5();

console.log("\n=== FIX ===");
solveFix1();
solveFix2();
solveFix3();

console.log("\n=== IMPLEMENT ===");
solveImpl1();
solveImpl2();
solveImpl3();
solveImpl4();
solveImpl5();
solveImpl6();
solveImpl7();

console.log("\n✅ All heap solutions executed.");
