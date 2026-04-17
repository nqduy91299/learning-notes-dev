// ============================================================================
// Queue - Solutions
// Run: npx tsx solutions.ts
// ============================================================================

// ─── PREDICT SOLUTIONS ─────────────────────────────────────────────────────

// Solution 1: Basic Queue Operations
function solvePrediction1(): void {
  console.log("--- Predict 1 ---");
  const queue: number[] = [];
  queue.push(10);   // [10]
  queue.push(20);   // [10, 20]
  queue.push(30);   // [10, 20, 30]
  console.log(queue.shift());  // 10 (front)
  console.log(queue.shift());  // 20
  queue.push(40);              // [30, 40]
  console.log(queue[0]);       // 30 (front)
  console.log(queue.length);   // 2
  // Answer: 10, 20, 30, 2
}

// Solution 2: Queue Processing
function solvePrediction2(): void {
  console.log("\n--- Predict 2 ---");
  const queue: string[] = ["a", "b", "c"];
  const result: string[] = [];
  // Iteration 1: dequeue "a", result=["a"], result.length<3 -> enqueue "A", queue=["b","c","A"]
  // Iteration 2: dequeue "b", result=["a","b"], result.length<3 -> enqueue "B", queue=["c","A","B"]
  // Iteration 3: dequeue "c", result=["a","b","c"], result.length>=3 -> no enqueue, queue=["A","B"]
  // Iteration 4: dequeue "A", result=["a","b","c","A"], no enqueue, queue=["B"]
  // Iteration 5: dequeue "B", result=["a","b","c","A","B"], queue=[]
  while (queue.length > 0) {
    const item = queue.shift()!;
    result.push(item);
    if (result.length < 3) {
      queue.push(item.toUpperCase());
    }
  }
  console.log(result.join(","));
  // Answer: "a,b,c,A,B"
}

// Solution 3: Circular Index
function solvePrediction3(): void {
  console.log("\n--- Predict 3 ---");
  // capacity=4, rear wraps: 0,1,2,3,0,1,2
  const capacity = 4;
  let rear = 0;
  const indices: number[] = [];
  for (let i = 0; i < 7; i++) {
    indices.push(rear);
    rear = (rear + 1) % capacity;
  }
  console.log(indices.join(","));
  // Answer: "0,1,2,3,0,1,2"
}

// Solution 4: BFS Level Tracking
function solvePrediction4(): void {
  console.log("\n--- Predict 4 ---");
  const queue: Array<[number, number]> = [[1, 0]];
  const visited = new Set<number>([1]);
  const graph: Record<number, number[]> = { 1: [2, 3], 2: [4], 3: [4], 4: [] };
  const levels: number[] = [];
  // Process 1 (level 0): add 2(1), 3(1)
  // Process 2 (level 1): add 4(2)
  // Process 3 (level 1): 4 already visited
  // Process 4 (level 2): no neighbors
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
  // Answer: "0,1,1,2"
}

// Solution 5: Two-Stack Queue Simulation
function solvePrediction5(): void {
  console.log("\n--- Predict 5 ---");
  const inStack: number[] = [];
  const outStack: number[] = [];

  inStack.push(1); inStack.push(2); inStack.push(3); // inStack=[1,2,3]
  while (inStack.length > 0) {
    outStack.push(inStack.pop()!); // outStack=[3,2,1]
  }
  console.log(outStack.pop());  // 1 (FIFO order!)

  inStack.push(4); inStack.push(5); // inStack=[4,5], outStack=[3,2]
  console.log(outStack.pop());  // 2

  console.log(outStack.length); // 1 (still has 3)
  // Answer: 1, 2, 1
}

// ─── FIX SOLUTIONS ─────────────────────────────────────────────────────────

// Solution 6: Fix - Circular Queue
// BUG: Missing full check in enqueue.
// FIX: Add `if (this.count === this.capacity) return false;`
class Fix6CircularQueueSolution {
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
    if (this.count === this.capacity) return false; // FIX: check full
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

  isFull(): boolean { return this.count === this.capacity; }
  get size(): number { return this.count; }
}

// Solution 7: Fix - Queue Using Two Stacks
// BUG: Transfers from inStack every time, breaking order if outStack has elements.
// FIX: Only transfer when outStack is empty.
class Fix7QueueWithStacksSolution {
  private inStack: number[] = [];
  private outStack: number[] = [];

  enqueue(val: number): void {
    this.inStack.push(val);
  }

  dequeue(): number | undefined {
    if (this.outStack.length === 0) { // FIX: only transfer when outStack empty
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop()!);
      }
    }
    return this.outStack.pop();
  }
}

// Solution 8: Fix - BFS Shortest Path
// BUG: Starting distance at 1 and returning dist instead of dist+1.
// FIX: Start at 0 and return dist+1 when neighbor === end.
function fix8ShortestPathSolution(
  graph: Record<number, number[]>,
  start: number,
  end: number
): number {
  if (start === end) return 0;
  const queue: Array<[number, number]> = [[start, 0]]; // FIX: start at 0
  const visited = new Set<number>([start]);

  while (queue.length > 0) {
    const [node, dist] = queue.shift()!;
    for (const neighbor of graph[node]) {
      if (neighbor === end) return dist + 1; // FIX: dist + 1
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }

  return -1;
}

// ─── IMPLEMENT SOLUTIONS ───────────────────────────────────────────────────

// Solution 9: Queue Class (Linked List)
interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

class Queue<T> implements IQueue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private count: number = 0;

  enqueue(item: T): void {
    const node: QueueNode<T> = { value: item, next: null };
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.count++;
  }

  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const val = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.count--;
    return val;
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  isEmpty(): boolean { return this.count === 0; }
  get size(): number { return this.count; }
}

// Solution 10: Circular Queue
interface ICircularQueue {
  enqueue(val: number): boolean;
  dequeue(): number | undefined;
  peek(): number | undefined;
  isEmpty(): boolean;
  isFull(): boolean;
  readonly size: number;
}

class CircularQueue implements ICircularQueue {
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
    if (this.count === this.capacity) return false;
    this.items[this.rear] = val;
    this.rear = (this.rear + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): number | undefined {
    if (this.count === 0) return undefined;
    const val = this.items[this.front];
    this.items[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return val;
  }

  peek(): number | undefined {
    if (this.count === 0) return undefined;
    return this.items[this.front];
  }

  isEmpty(): boolean { return this.count === 0; }
  isFull(): boolean { return this.count === this.capacity; }
  get size(): number { return this.count; }
}

// Solution 11: Queue with Two Stacks
interface IStackQueue {
  enqueue(val: number): void;
  dequeue(): number | undefined;
  peek(): number | undefined;
  isEmpty(): boolean;
}

class StackQueue implements IStackQueue {
  private inStack: number[] = [];
  private outStack: number[] = [];

  enqueue(val: number): void {
    this.inStack.push(val);
  }

  private transfer(): void {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop()!);
      }
    }
  }

  dequeue(): number | undefined {
    this.transfer();
    return this.outStack.pop();
  }

  peek(): number | undefined {
    this.transfer();
    return this.outStack[this.outStack.length - 1];
  }

  isEmpty(): boolean {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
}

// Solution 12: Sliding Window Maximum
function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // stores indices, front has max

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside the window
    while (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }

    // Remove indices of elements smaller than current (they'll never be max)
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // Start recording results once we have a full window
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}

// Solution 13: Number of Islands (BFS)
function numIslands(grid: string[][]): number {
  if (grid.length === 0) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  const directions: Array<[number, number]> = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        // BFS to mark all connected land
        const queue: Array<[number, number]> = [[r, c]];
        grid[r][c] = "0"; // mark visited

        while (queue.length > 0) {
          const [cr, cc] = queue.shift()!;
          for (const [dr, dc] of directions) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
              grid[nr][nc] = "0";
              queue.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  return count;
}

// Solution 14: Recent Counter
interface IRecentCounter {
  ping(t: number): number;
}

class RecentCounter implements IRecentCounter {
  private queue: number[] = [];

  ping(t: number): number {
    this.queue.push(t);
    while (this.queue[0] < t - 3000) {
      this.queue.shift();
    }
    return this.queue.length;
  }
}

// Solution 15: Simple Priority Queue
interface IPriorityQueue<T> {
  enqueue(value: T, priority: number): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

class PriorityQueue<T> implements IPriorityQueue<T> {
  private items: Array<{ value: T; priority: number }> = [];

  enqueue(value: T, priority: number): void {
    const entry = { value, priority };
    // Insert in sorted position (ascending by priority)
    let i = this.items.length - 1;
    while (i >= 0 && this.items[i].priority > priority) {
      i--;
    }
    this.items.splice(i + 1, 0, entry);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  peek(): T | undefined {
    return this.items[0]?.value;
  }

  isEmpty(): boolean { return this.items.length === 0; }
  get size(): number { return this.items.length; }
}

// ─── Test Runner ───────────────────────────────────────────────────────────

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`  FAIL: ${msg}`);
  } else {
    console.log(`  PASS: ${msg}`);
  }
}

function runAllTests(): void {
  console.log("=== Queue Solutions ===\n");

  // Predictions
  solvePrediction1();
  solvePrediction2();
  solvePrediction3();
  solvePrediction4();
  solvePrediction5();

  // Fix 6
  console.log("\n--- Fix 6 Solution ---");
  const cq6 = new Fix6CircularQueueSolution(3);
  assert(cq6.enqueue(1) === true, "enqueue 1");
  assert(cq6.enqueue(2) === true, "enqueue 2");
  assert(cq6.enqueue(3) === true, "enqueue 3");
  assert(cq6.enqueue(4) === false, "enqueue 4 rejected (full)");
  assert(cq6.size === 3, "size is 3");

  // Fix 7
  console.log("\n--- Fix 7 Solution ---");
  const q7 = new Fix7QueueWithStacksSolution();
  q7.enqueue(1); q7.enqueue(2); q7.enqueue(3);
  assert(q7.dequeue() === 1, "dequeue 1");
  q7.enqueue(4);
  assert(q7.dequeue() === 2, "dequeue 2");
  assert(q7.dequeue() === 3, "dequeue 3");
  assert(q7.dequeue() === 4, "dequeue 4");

  // Fix 8
  console.log("\n--- Fix 8 Solution ---");
  const g8: Record<number, number[]> = { 1: [2, 3], 2: [4], 3: [4], 4: [] };
  assert(fix8ShortestPathSolution(g8, 1, 4) === 2, "shortest path 1->4 is 2");
  assert(fix8ShortestPathSolution(g8, 1, 1) === 0, "same node distance 0");

  // Solution 9: Queue
  console.log("\n--- Solution 9: Queue Class ---");
  const q9 = new Queue<number>();
  q9.enqueue(1); q9.enqueue(2); q9.enqueue(3);
  assert(q9.peek() === 1, "peek is 1");
  assert(q9.dequeue() === 1, "dequeue 1");
  assert(q9.dequeue() === 2, "dequeue 2");
  assert(q9.size === 1, "size is 1");
  assert(!q9.isEmpty(), "not empty");
  q9.dequeue();
  assert(q9.isEmpty(), "empty");

  // Solution 10: Circular Queue
  console.log("\n--- Solution 10: Circular Queue ---");
  const cq10 = new CircularQueue(3);
  cq10.enqueue(1); cq10.enqueue(2); cq10.enqueue(3);
  assert(cq10.isFull(), "full");
  assert(cq10.enqueue(4) === false, "reject when full");
  assert(cq10.dequeue() === 1, "dequeue 1");
  assert(cq10.enqueue(4) === true, "enqueue after dequeue (wrap)");
  assert(cq10.peek() === 2, "peek is 2");

  // Solution 11: StackQueue
  console.log("\n--- Solution 11: Stack Queue ---");
  const sq = new StackQueue();
  sq.enqueue(1); sq.enqueue(2);
  assert(sq.dequeue() === 1, "dequeue 1");
  sq.enqueue(3);
  assert(sq.dequeue() === 2, "dequeue 2");
  assert(sq.dequeue() === 3, "dequeue 3");
  assert(sq.isEmpty(), "empty");

  // Solution 12: Sliding Window Maximum
  console.log("\n--- Solution 12: Sliding Window Maximum ---");
  assert(
    JSON.stringify(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)) ===
    JSON.stringify([3, 3, 5, 5, 6, 7]),
    "sliding window example 1"
  );
  assert(
    JSON.stringify(maxSlidingWindow([1], 1)) === JSON.stringify([1]),
    "single element"
  );
  assert(
    JSON.stringify(maxSlidingWindow([9, 11], 2)) === JSON.stringify([11]),
    "two elements"
  );

  // Solution 13: Number of Islands
  console.log("\n--- Solution 13: Number of Islands ---");
  assert(
    numIslands([
      ["1", "1", "0", "0", "0"],
      ["1", "1", "0", "0", "0"],
      ["0", "0", "1", "0", "0"],
      ["0", "0", "0", "1", "1"],
    ]) === 3,
    "3 islands"
  );
  assert(numIslands([["1", "0"], ["0", "1"]]) === 2, "2 islands diagonal");
  assert(numIslands([["0"]]) === 0, "no islands");

  // Solution 14: Recent Counter
  console.log("\n--- Solution 14: Recent Counter ---");
  const rc = new RecentCounter();
  assert(rc.ping(1) === 1, "ping(1)=1");
  assert(rc.ping(100) === 2, "ping(100)=2");
  assert(rc.ping(3001) === 3, "ping(3001)=3");
  assert(rc.ping(3002) === 3, "ping(3002)=3");

  // Solution 15: Priority Queue
  console.log("\n--- Solution 15: Priority Queue ---");
  const pq = new PriorityQueue<string>();
  pq.enqueue("low", 3);
  pq.enqueue("high", 1);
  pq.enqueue("med", 2);
  assert(pq.dequeue() === "high", "highest priority first");
  assert(pq.dequeue() === "med", "medium next");
  assert(pq.dequeue() === "low", "low last");
  assert(pq.isEmpty(), "empty after all dequeued");

  console.log("\n=== All tests complete ===");
}

runAllTests();
