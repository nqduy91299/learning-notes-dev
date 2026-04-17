// ============================================================================
// Queue - Exercises (15 total: 5 predict, 3 fix, 7 implement)
// Run: npx tsx exercises.ts
// ============================================================================

// ─── PREDICT EXERCISES (5) ──────────────────────────────────────────────────

// Exercise 1: Predict - Basic Queue Operations
// What does this print?
function predict1(): void {
  const queue: number[] = [];
  queue.push(10);
  queue.push(20);
  queue.push(30);
  console.log(queue.shift());
  console.log(queue.shift());
  queue.push(40);
  console.log(queue[0]);
  console.log(queue.length);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
  // Line 3: ???
  // Line 4: ???
}

// Exercise 2: Predict - Queue Processing
// What does this print?
function predict2(): void {
  const queue: string[] = ["a", "b", "c"];
  const result: string[] = [];

  while (queue.length > 0) {
    const item = queue.shift()!;
    result.push(item);
    if (result.length < 3) {
      queue.push(item.toUpperCase());
    }
  }

  console.log(result.join(","));
  // Your prediction: ???
}

// Exercise 3: Predict - Circular Index
// What does this print?
function predict3(): void {
  const capacity = 4;
  let rear = 0;
  const indices: number[] = [];

  for (let i = 0; i < 7; i++) {
    indices.push(rear);
    rear = (rear + 1) % capacity;
  }

  console.log(indices.join(","));
  // Your prediction: ???
}

// Exercise 4: Predict - BFS Level Tracking
// What does this print?
function predict4(): void {
  const queue: Array<[number, number]> = [[1, 0]];
  const visited = new Set<number>([1]);
  const graph: Record<number, number[]> = {
    1: [2, 3],
    2: [4],
    3: [4],
    4: [],
  };
  const levels: number[] = [];

  while (queue.length > 0) {
    const [node, level] = queue.shift()!;
    levels.push(level);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, level + 1]);
      }
    }
  }

  console.log(levels.join(","));
  // Your prediction: ???
}

// Exercise 5: Predict - Two-Stack Queue Simulation
// What does this print?
function predict5(): void {
  const inStack: number[] = [];
  const outStack: number[] = [];

  // Enqueue
  inStack.push(1);
  inStack.push(2);
  inStack.push(3);

  // Dequeue: transfer to outStack
  while (inStack.length > 0) {
    outStack.push(inStack.pop()!);
  }
  console.log(outStack.pop());

  // Enqueue more
  inStack.push(4);
  inStack.push(5);

  // Dequeue from outStack (still has elements)
  console.log(outStack.pop());

  // Dequeue: outStack empty, transfer again
  console.log(outStack.length);

  // Your prediction:
  // Line 1: ???
  // Line 2: ???
  // Line 3: ???
}

// ─── FIX EXERCISES (3) ─────────────────────────────────────────────────────

// Exercise 6: Fix - Circular Queue enqueue/dequeue
// This circular queue has a bug — it overwrites data when full instead of rejecting.
class Fix6CircularQueue {
  private items: (number | undefined)[];
  private front: number = 0;
  private rear: number = 0;
  private count: number = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.items = new Array(capacity);
  }

  enqueue(val: number): boolean {
    // BUG: missing full check
    this.items[this.rear] = val;
    this.rear = (this.rear + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): number | undefined {
    if (this.count === 0) return undefined;
    const val = this.items[this.front];
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return val;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }

  get size(): number { return this.count; }
}

// Test:
// const cq = new Fix6CircularQueue(3);
// console.log(cq.enqueue(1)); // true
// console.log(cq.enqueue(2)); // true
// console.log(cq.enqueue(3)); // true
// console.log(cq.enqueue(4)); // Expected: false (queue full)
// console.log(cq.size);       // Expected: 3

// Exercise 7: Fix - Queue Using Two Stacks
// The transfer logic has a bug.
class Fix7QueueWithStacks {
  private inStack: number[] = [];
  private outStack: number[] = [];

  enqueue(val: number): void {
    this.inStack.push(val);
  }

  dequeue(): number | undefined {
    // BUG: transfers every time instead of only when outStack is empty
    while (this.inStack.length > 0) {
      this.outStack.push(this.inStack.pop()!);
    }
    return this.outStack.pop();
  }
}

// Test:
// const q = new Fix7QueueWithStacks();
// q.enqueue(1); q.enqueue(2); q.enqueue(3);
// console.log(q.dequeue()); // Expected: 1
// q.enqueue(4);
// console.log(q.dequeue()); // Expected: 2 (but buggy version may return 4)
// console.log(q.dequeue()); // Expected: 3

// Exercise 8: Fix - BFS Shortest Path
// This BFS finds shortest path length but has an off-by-one error.
function fix8ShortestPath(
  graph: Record<number, number[]>,
  start: number,
  end: number
): number {
  if (start === end) return 0;
  const queue: Array<[number, number]> = [[start, 1]]; // BUG: should start at distance 0
  const visited = new Set<number>([start]);

  while (queue.length > 0) {
    const [node, dist] = queue.shift()!;
    for (const neighbor of graph[node]) {
      if (neighbor === end) return dist; // BUG: returning wrong distance
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }

  return -1;
}

// Test:
// const g = { 1: [2, 3], 2: [4], 3: [4], 4: [] };
// console.log(fix8ShortestPath(g, 1, 4)); // Expected: 2 (1->2->4 or 1->3->4)

// ─── IMPLEMENT EXERCISES (7) ───────────────────────────────────────────────

// Exercise 9: Implement - Queue Class (Linked List)
// Implement a generic queue using a linked list with O(1) enqueue and dequeue.
interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

// TODO: Implement Queue<T>
// class Queue<T> implements IQueue<T> { ... }

// Test:
// const q = new Queue<number>();
// q.enqueue(1); q.enqueue(2); q.enqueue(3);
// console.log(q.peek()); // 1
// console.log(q.dequeue()); // 1
// console.log(q.dequeue()); // 2
// console.log(q.size); // 1

// Exercise 10: Implement - Circular Queue
// Implement a circular queue with fixed capacity.
interface ICircularQueue {
  enqueue(val: number): boolean;
  dequeue(): number | undefined;
  peek(): number | undefined;
  isEmpty(): boolean;
  isFull(): boolean;
  readonly size: number;
}

// TODO: Implement CircularQueue
// class CircularQueue implements ICircularQueue { ... }

// Test:
// const cq = new CircularQueue(3);
// cq.enqueue(1); cq.enqueue(2); cq.enqueue(3);
// console.log(cq.isFull()); // true
// console.log(cq.enqueue(4)); // false
// console.log(cq.dequeue()); // 1
// console.log(cq.enqueue(4)); // true (wraps around)
// console.log(cq.peek()); // 2

// Exercise 11: Implement - Queue with Two Stacks
// Implement a queue using two stacks with amortized O(1) dequeue.
interface IStackQueue {
  enqueue(val: number): void;
  dequeue(): number | undefined;
  peek(): number | undefined;
  isEmpty(): boolean;
}

// TODO: Implement StackQueue
// class StackQueue implements IStackQueue { ... }

// Test:
// const sq = new StackQueue();
// sq.enqueue(1); sq.enqueue(2);
// console.log(sq.dequeue()); // 1
// sq.enqueue(3);
// console.log(sq.dequeue()); // 2
// console.log(sq.dequeue()); // 3

// Exercise 12: Implement - Sliding Window Maximum
// Given an array and window size k, return the maximum value in each window.
// Use a deque (monotonic decreasing) for O(n) time.
function maxSlidingWindow(_nums: number[], _k: number): number[] {
  // TODO: Implement
  return [];
}

// Test:
// console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)); // [3,3,5,5,6,7]
// console.log(maxSlidingWindow([1], 1)); // [1]
// console.log(maxSlidingWindow([9,11], 2)); // [11]

// Exercise 13: Implement - Number of Islands (BFS)
// Given a 2D grid of '1' (land) and '0' (water), count the number of islands.
// Use BFS with a queue.
function numIslands(_grid: string[][]): number {
  // TODO: Implement using BFS
  return 0;
}

// Test:
// console.log(numIslands([
//   ["1","1","0","0","0"],
//   ["1","1","0","0","0"],
//   ["0","0","1","0","0"],
//   ["0","0","0","1","1"]
// ])); // 3

// Exercise 14: Implement - Recent Counter
// Implement a class that counts the number of recent requests within a time window.
// ping(t) adds a request at time t and returns the number of requests in [t-3000, t].
interface IRecentCounter {
  ping(t: number): number;
}

// TODO: Implement RecentCounter
// class RecentCounter implements IRecentCounter { ... }

// Test:
// const rc = new RecentCounter();
// console.log(rc.ping(1));    // 1
// console.log(rc.ping(100));  // 2
// console.log(rc.ping(3001)); // 3
// console.log(rc.ping(3002)); // 3

// Exercise 15: Implement - Simple Priority Queue
// Implement a min-priority queue (lowest priority number dequeued first).
interface IPriorityQueue<T> {
  enqueue(value: T, priority: number): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

// TODO: Implement PriorityQueue<T>
// class PriorityQueue<T> implements IPriorityQueue<T> { ... }

// Test:
// const pq = new PriorityQueue<string>();
// pq.enqueue("low", 3);
// pq.enqueue("high", 1);
// pq.enqueue("med", 2);
// console.log(pq.dequeue()); // "high"
// console.log(pq.dequeue()); // "med"
// console.log(pq.dequeue()); // "low"

// ─── Runner ────────────────────────────────────────────────────────────────

console.log("=== Queue Exercises ===\n");

console.log("--- Predict 1 ---");
predict1();

console.log("\n--- Predict 2 ---");
predict2();

console.log("\n--- Predict 3 ---");
predict3();

console.log("\n--- Predict 4 ---");
predict4();

console.log("\n--- Predict 5 ---");
predict5();

console.log("\n--- Fix 6 (broken) ---");
const cq6 = new Fix6CircularQueue(3);
console.log(cq6.enqueue(1));
console.log(cq6.enqueue(2));
console.log(cq6.enqueue(3));
console.log(cq6.enqueue(4), "expected false");
console.log("size:", cq6.size, "expected 3");

console.log("\n--- Fix 7 (broken) ---");
const q7 = new Fix7QueueWithStacks();
q7.enqueue(1); q7.enqueue(2); q7.enqueue(3);
console.log(q7.dequeue(), "expected 1");
q7.enqueue(4);
console.log(q7.dequeue(), "expected 2");
console.log(q7.dequeue(), "expected 3");

console.log("\n--- Fix 8 (broken) ---");
const g8: Record<number, number[]> = { 1: [2, 3], 2: [4], 3: [4], 4: [] };
console.log(fix8ShortestPath(g8, 1, 4), "expected 2");

console.log("\n--- Implement exercises: uncomment tests above when ready ---");
