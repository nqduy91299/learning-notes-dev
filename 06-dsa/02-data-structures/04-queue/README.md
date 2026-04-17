# Queue

## Overview

A **queue** is a linear data structure that follows the **First In, First Out (FIFO)** principle.
The first element added is the first one to be removed — like a line of people waiting at a
counter.

## FIFO Concept

```
Enqueue: add to back          Dequeue: remove from front

  front                back
  ┌────┬────┬────┬────┐
  │ 10 │ 20 │ 30 │ 40 │  ← enqueue(40)
  └────┴────┴────┴────┘
  ↑ dequeue() returns 10
```

Elements enter from the **back** (rear/tail) and exit from the **front** (head).

## Core Operations

| Operation   | Description                           | Time Complexity |
|-------------|---------------------------------------|-----------------|
| `enqueue`   | Add element to the back               | O(1)            |
| `dequeue`   | Remove and return the front element   | O(1)*           |
| `peek`      | View the front element without removing | O(1)          |
| `isEmpty`   | Check if the queue is empty           | O(1)            |
| `size`      | Get the number of elements            | O(1)            |

*O(1) for linked-list. Array-based naive dequeue is O(n) due to shifting — solved by circular
buffer.

## Implementation Approaches

### Array-Based Queue (Naive)

Using `Array.shift()` for dequeue is O(n) because all elements must be shifted forward.

```typescript
// DON'T DO THIS for performance-critical code
class NaiveQueue<T> {
  private items: T[] = [];

  enqueue(item: T): void { this.items.push(item); }       // O(1)
  dequeue(): T | undefined { return this.items.shift(); }  // O(n)!
}
```

### Circular Queue (Array-Based, Fixed Size)

Uses a fixed-size array with `front` and `rear` pointers that wrap around.

```typescript
class CircularQueue<T> {
  private items: (T | undefined)[];
  private front: number = 0;
  private rear: number = 0;
  private count: number = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.items = new Array<T | undefined>(capacity);
  }

  enqueue(item: T): boolean {
    if (this.count === this.capacity) return false;
    this.items[this.rear] = item;
    this.rear = (this.rear + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined;
    const item = this.items[this.front];
    this.items[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return item;
  }

  peek(): T | undefined {
    if (this.count === 0) return undefined;
    return this.items[this.front];
  }

  get size(): number { return this.count; }
  isEmpty(): boolean { return this.count === 0; }
  isFull(): boolean { return this.count === this.capacity; }
}
```

**Key insight:** The modulo operator `%` handles wrapping. When `rear` reaches the end of the
array, it wraps to index 0.

```
Capacity = 5, after several enqueues and dequeues:

Index:  0    1    2    3    4
       [  ] [30] [40] [50] [  ]
             ↑              ↑
           front           rear
```

### Linked-List-Based Queue

Truly O(1) for both enqueue and dequeue, no capacity limit.

```typescript
interface QueueNode<T> {
  value: T;
  next: QueueNode<T> | null;
}

class LinkedQueue<T> {
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
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.count--;
    return value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  get size(): number { return this.count; }
  isEmpty(): boolean { return this.head === null; }
}
```

### Which to Choose?

| Use Case | Best Choice |
|----------|-------------|
| Known max capacity, performance-critical | Circular queue |
| Unknown size, general purpose | Linked-list queue |
| Quick prototyping, small data | Array with shift() |

## Deque (Double-Ended Queue)

A **deque** allows insertion and removal from **both** ends in O(1).

```
  ← addFront    removeFront →
     ┌────┬────┬────┬────┐
     │ 10 │ 20 │ 30 │ 40 │
     └────┴────┴────┴────┘
  ← removeBack     addBack →
```

Operations: `addFront`, `addBack`, `removeFront`, `removeBack`, `peekFront`, `peekBack`.

A deque can simulate both a stack (use one end only) and a queue (add at one end, remove from
the other).

### JavaScript Implementation

JavaScript doesn't have a built-in deque. A simple approach uses a doubly-linked list. For
competitive programming or quick solutions, you can use an array (accepting O(n) for
`unshift`/`shift`) or an object with numeric keys:

```typescript
class Deque<T> {
  private data: Map<number, T> = new Map();
  private frontIdx: number = 0;
  private backIdx: number = -1;

  addBack(item: T): void {
    this.backIdx++;
    this.data.set(this.backIdx, item);
  }

  addFront(item: T): void {
    this.frontIdx--;
    this.data.set(this.frontIdx, item);
  }

  removeFront(): T | undefined {
    if (this.isEmpty()) return undefined;
    const val = this.data.get(this.frontIdx);
    this.data.delete(this.frontIdx);
    this.frontIdx++;
    return val;
  }

  removeBack(): T | undefined {
    if (this.isEmpty()) return undefined;
    const val = this.data.get(this.backIdx);
    this.data.delete(this.backIdx);
    this.backIdx--;
    return val;
  }

  peekFront(): T | undefined { return this.data.get(this.frontIdx); }
  peekBack(): T | undefined { return this.data.get(this.backIdx); }
  isEmpty(): boolean { return this.data.size === 0; }
  get size(): number { return this.data.size; }
}
```

## Priority Queue

A **priority queue** dequeues elements based on priority rather than insertion order. It is
typically implemented with a **heap** (covered separately), but the concept connects to queues.

- **Min-priority queue:** smallest element dequeued first
- **Max-priority queue:** largest element dequeued first

Simple array-based version (O(n) enqueue or O(n) dequeue):

```typescript
class SimplePriorityQueue<T> {
  private items: Array<{ value: T; priority: number }> = [];

  enqueue(value: T, priority: number): void {
    this.items.push({ value, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }
}
```

A proper heap-based priority queue gives O(log n) for both operations.

## BFS Connection

Queues are the backbone of **Breadth-First Search (BFS)**. BFS explores nodes level by level
using a queue to track which nodes to visit next.

```typescript
function bfsLevelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}
```

## Common Queue Problems

### 1. Implement Queue Using Two Stacks

Use one stack for enqueue and another for dequeue. When the dequeue stack is empty, transfer
all elements from the enqueue stack (reversing the order).

**Amortized O(1)** per operation — each element is moved at most once.

### 2. Sliding Window Maximum

Given an array and window size k, find the maximum in each window position. Use a **deque**
(monotonic decreasing) that stores indices. Remove elements outside the window from the front
and elements smaller than the current from the back.

**Time:** O(n) | **Space:** O(k)

### 3. Task Scheduler

Given tasks with cooldown periods, find the minimum intervals needed. Use a queue to track
tasks on cooldown and a max-heap (or sorted structure) for available tasks.

## When to Use a Queue

- **BFS traversal:** graphs, trees, shortest path in unweighted graphs
- **Level-order processing:** tree levels, multi-source BFS
- **Scheduling:** task scheduling, round-robin, print queue
- **Buffering:** message queues, event loops, stream processing
- **Sliding window:** with deque for maintaining window constraints

## Complexity Summary

| Implementation | Enqueue | Dequeue | Peek | Space |
|---------------|---------|---------|------|-------|
| Naive array   | O(1)    | O(n)    | O(1) | O(n)  |
| Circular array| O(1)    | O(1)    | O(1) | O(n)  |
| Linked list   | O(1)    | O(1)    | O(1) | O(n)  |

## Key Takeaways

1. Queues enforce FIFO ordering — first in, first out.
2. Avoid `Array.shift()` in performance-critical code — it's O(n).
3. Circular queues solve the array-based dequeue problem with O(1) operations.
4. A deque is a generalized queue allowing O(1) operations at both ends.
5. BFS is the canonical algorithm that uses a queue.
6. The "implement queue with two stacks" pattern demonstrates amortized analysis.
7. Monotonic deques are powerful for sliding window problems.
