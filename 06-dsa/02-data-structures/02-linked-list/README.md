# Linked Lists

## Table of Contents

1. [Overview](#overview)
2. [Node Structure](#node-structure)
3. [Singly Linked List](#singly-linked-list)
4. [Doubly Linked List](#doubly-linked-list)
5. [Operations and Complexity](#operations-and-complexity)
6. [Comparison Table](#comparison-table)
7. [Fast/Slow Pointer Technique](#fastslow-pointer-technique)
8. [Cycle Detection (Floyd's Algorithm)](#cycle-detection-floyds-algorithm)
9. [Finding the Middle Node](#finding-the-middle-node)
10. [Reversing a Linked List](#reversing-a-linked-list)
11. [Dummy Head Technique](#dummy-head-technique)
12. [Common Patterns](#common-patterns)

---

## Overview

A **linked list** is a linear data structure where elements (nodes) are stored in
non-contiguous memory. Each node contains data and a pointer (reference) to the next
node, forming a chain.

Unlike arrays, linked lists:
- Do **not** provide O(1) random access
- **Do** provide O(1) insertion/deletion at known positions
- Use **extra memory** for pointers
- Have **no cache locality** (nodes scattered in memory)

Linked lists are foundational for understanding pointers, recursion, and more complex
structures like trees, graphs, and hash table chaining.

---

## Node Structure

### Singly Linked List Node

Each node stores a value and a reference to the next node:

```typescript
class ListNode<T> {
  val: T;
  next: ListNode<T> | null;

  constructor(val: T, next: ListNode<T> | null = null) {
    this.val = val;
    this.next = next;
  }
}
```

```
+-------+------+    +-------+------+    +-------+------+
| val:1 | next-+--->| val:2 | next-+--->| val:3 | null |
+-------+------+    +-------+------+    +-------+------+
```

### Doubly Linked List Node

Each node stores value, next reference, AND previous reference:

```typescript
class DoublyListNode<T> {
  val: T;
  prev: DoublyListNode<T> | null;
  next: DoublyListNode<T> | null;

  constructor(
    val: T,
    prev: DoublyListNode<T> | null = null,
    next: DoublyListNode<T> | null = null,
  ) {
    this.val = val;
    this.prev = prev;
    this.next = next;
  }
}
```

```
       +------+-------+------+    +------+-------+------+
null<--+ prev | val:1 | next-+--->| prev | val:2 | next-+-->null
       +------+-------+------+    +------+-------+------+
                                    |
                                    v (prev points back)
```

---

## Singly Linked List

### Traversal

Visit every node from head to tail:

```typescript
function traverse<T>(head: ListNode<T> | null): void {
  let current = head;
  while (current !== null) {
    console.log(current.val);
    current = current.next;
  }
}
```

**Time**: O(n). **Space**: O(1).

### Insertion

#### At Head (Prepend) - O(1)

```typescript
function insertAtHead<T>(head: ListNode<T> | null, val: T): ListNode<T> {
  const newNode = new ListNode(val);
  newNode.next = head;
  return newNode; // new head
}
```

#### At Tail (Append) - O(n)

Must traverse to the end first:

```typescript
function insertAtTail<T>(head: ListNode<T> | null, val: T): ListNode<T> {
  const newNode = new ListNode(val);
  if (head === null) return newNode;

  let current = head;
  while (current.next !== null) {
    current = current.next;
  }
  current.next = newNode;
  return head;
}
```

With a **tail pointer**, append becomes O(1).

#### At Position - O(n)

```typescript
function insertAt<T>(
  head: ListNode<T> | null,
  val: T,
  position: number,
): ListNode<T> {
  if (position === 0) return insertAtHead(head, val);

  let current = head;
  for (let i = 0; i < position - 1 && current !== null; i++) {
    current = current.next;
  }

  if (current === null) throw new Error("Position out of bounds");

  const newNode = new ListNode(val);
  newNode.next = current.next;
  current.next = newNode;
  return head!;
}
```

### Deletion

#### Delete Head - O(1)

```typescript
function deleteHead<T>(head: ListNode<T> | null): ListNode<T> | null {
  if (head === null) return null;
  return head.next;
}
```

#### Delete by Value - O(n)

```typescript
function deleteByValue<T>(head: ListNode<T> | null, val: T): ListNode<T> | null {
  if (head === null) return null;
  if (head.val === val) return head.next;

  let current = head;
  while (current.next !== null) {
    if (current.next.val === val) {
      current.next = current.next.next;
      return head;
    }
    current = current.next;
  }
  return head;
}
```

### Search - O(n)

```typescript
function search<T>(head: ListNode<T> | null, val: T): boolean {
  let current = head;
  while (current !== null) {
    if (current.val === val) return true;
    current = current.next;
  }
  return false;
}
```

---

## Doubly Linked List

A doubly linked list allows traversal in both directions and O(1) deletion
when you have a reference to the node.

### Advantages Over Singly Linked

- **O(1) deletion** given a node reference (no need to find predecessor)
- **Backward traversal** is possible
- **O(1) tail operations** (pop from end)

### Disadvantages

- **Extra memory** for `prev` pointer (2x pointer overhead)
- **More complex** insertion/deletion logic (update both prev and next)

### Insertion at Head

```typescript
function dllInsertHead<T>(
  head: DoublyListNode<T> | null,
  val: T,
): DoublyListNode<T> {
  const newNode = new DoublyListNode(val);
  if (head !== null) {
    newNode.next = head;
    head.prev = newNode;
  }
  return newNode;
}
```

### Deletion of a Given Node

```typescript
function dllDeleteNode<T>(
  head: DoublyListNode<T> | null,
  node: DoublyListNode<T>,
): DoublyListNode<T> | null {
  if (node.prev !== null) {
    node.prev.next = node.next;
  } else {
    head = node.next; // deleting head
  }

  if (node.next !== null) {
    node.next.prev = node.prev;
  }

  return head;
}
```

---

## Operations and Complexity

| Operation                  | Singly Linked | Doubly Linked |
|----------------------------|---------------|---------------|
| Access by index            | O(n)          | O(n)          |
| Search                     | O(n)          | O(n)          |
| Insert at head             | O(1)          | O(1)          |
| Insert at tail (no ptr)    | O(n)          | O(n)          |
| Insert at tail (with ptr)  | O(1)          | O(1)          |
| Insert after given node    | O(1)          | O(1)          |
| Delete head                | O(1)          | O(1)          |
| Delete tail (no ptr)       | O(n)          | O(n)*         |
| Delete tail (with ptr)     | O(n)**        | O(1)          |
| Delete given node          | O(n)***       | O(1)          |
| Space per node             | data + 1 ptr  | data + 2 ptrs |

```
*   Still O(n) for doubly if you don't have a tail pointer
**  O(n) for singly even with tail pointer (need predecessor)
*** O(n) for singly because you need the predecessor
```

---

## Comparison Table

### Linked List vs Array

| Feature              | Array           | Singly Linked   | Doubly Linked   |
|----------------------|-----------------|-----------------|-----------------|
| Random access        | O(1)            | O(n)            | O(n)            |
| Insert at beginning  | O(n)            | O(1)            | O(1)            |
| Insert at end        | O(1) amortized  | O(1) w/ tail    | O(1) w/ tail    |
| Insert at middle     | O(n)            | O(1)*           | O(1)*           |
| Delete at beginning  | O(n)            | O(1)            | O(1)            |
| Delete at end        | O(1)            | O(n)            | O(1) w/ tail    |
| Delete at middle     | O(n)            | O(n)            | O(1)*           |
| Memory overhead      | None            | 1 ptr/node      | 2 ptrs/node     |
| Cache performance    | Excellent       | Poor            | Poor            |
| Memory allocation    | Contiguous      | Per node        | Per node        |

```
* Assuming you already have a reference to the position
```

### When to Use Linked Lists

**Use linked lists when:**
- Frequent insertions/deletions at the beginning
- You don't know the size in advance and want to avoid resize overhead
- You need O(1) deletion given a node reference (doubly linked)
- Implementing other data structures (stacks, queues, LRU cache)

**Don't use linked lists when:**
- You need random access by index
- Cache performance is critical
- Memory is constrained (pointer overhead)
- You primarily iterate sequentially (arrays are faster due to cache)

---

## Fast/Slow Pointer Technique

The **fast/slow pointer** (also called **tortoise and hare**) technique uses two
pointers that traverse at different speeds. This is one of the most important
linked list patterns.

### Core Idea

- **Slow pointer**: moves 1 step at a time
- **Fast pointer**: moves 2 steps at a time

### Applications

1. **Cycle detection** (Floyd's algorithm)
2. **Finding the middle** of a linked list
3. **Finding the start** of a cycle
4. **Detecting if list length is even/odd**

---

## Cycle Detection (Floyd's Algorithm)

### Problem

Determine if a linked list contains a cycle (a node's next points to a previous node).

### Algorithm

1. Initialize slow and fast pointers to head.
2. Move slow by 1, fast by 2.
3. If fast reaches null, no cycle.
4. If slow === fast, cycle exists.

```typescript
function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) return true;
  }

  return false;
}
```

**Time**: O(n). **Space**: O(1).

### Why It Works

If there's a cycle of length C, once both pointers are in the cycle, the fast
pointer closes the gap by 1 node per step. They must meet within C steps.

### Finding the Cycle Start

After detecting a cycle, reset one pointer to head. Move both one step at a time.
They meet at the cycle start.

```typescript
function detectCycleStart<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow = head;
  let fast = head;

  // Phase 1: Detect cycle
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) break;
  }

  if (fast === null || fast.next === null) return null;

  // Phase 2: Find start
  slow = head;
  while (slow !== fast) {
    slow = slow!.next;
    fast = fast!.next;
  }

  return slow;
}
```

### Mathematical Proof

Let:
- `a` = distance from head to cycle start
- `b` = distance from cycle start to meeting point
- `C` = cycle length

When they meet: slow traveled `a + b`, fast traveled `a + b + kC` for some k.
Since fast travels 2x: `2(a + b) = a + b + kC` => `a + b = kC` => `a = kC - b`.

Starting from head (distance `a` to cycle start) and from meeting point
(distance `C - b` to cycle start), both reach cycle start at the same time since
`a = kC - b = (k-1)C + (C - b)`.

---

## Finding the Middle Node

### Problem

Find the middle node of a linked list in a single pass.

### Algorithm

Use fast/slow pointers. When fast reaches the end, slow is at the middle.

```typescript
function findMiddle<T>(head: ListNode<T> | null): ListNode<T> | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
  }

  return slow;
}
```

For even-length lists, this returns the second of the two middle nodes.
To get the first middle node, check `fast.next?.next` instead.

**Time**: O(n). **Space**: O(1).

---

## Reversing a Linked List

Reversing a linked list is one of the most frequently asked interview questions.

### Iterative Approach

Maintain three pointers: `prev`, `current`, `next`.

```typescript
function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let current = head;

  while (current !== null) {
    const next = current.next;  // save next
    current.next = prev;        // reverse pointer
    prev = current;             // advance prev
    current = next;             // advance current
  }

  return prev; // new head
}
```

**Visualization:**

```
Step 0: null    1 -> 2 -> 3 -> null
        prev   curr

Step 1: null <- 1    2 -> 3 -> null
               prev curr

Step 2: null <- 1 <- 2    3 -> null
                    prev  curr

Step 3: null <- 1 <- 2 <- 3
                          prev  curr(null)
```

**Time**: O(n). **Space**: O(1).

### Recursive Approach

```typescript
function reverseListRecursive<T>(head: ListNode<T> | null): ListNode<T> | null {
  if (head === null || head.next === null) return head;

  const newHead = reverseListRecursive(head.next);
  head.next.next = head;  // make next node point back to us
  head.next = null;       // remove our forward pointer

  return newHead;
}
```

**Time**: O(n). **Space**: O(n) due to call stack.

### Partial Reverse (Between Positions)

Reverse only nodes from position `left` to `right`:

```typescript
function reverseBetween<T>(
  head: ListNode<T> | null,
  left: number,
  right: number,
): ListNode<T> | null {
  if (head === null || left === right) return head;

  const dummy = new ListNode<T>(0 as T);
  dummy.next = head;
  let prev: ListNode<T> = dummy;

  // Move to node before `left`
  for (let i = 1; i < left; i++) {
    prev = prev.next!;
  }

  const start = prev.next!;
  let then = start.next;

  // Reverse from left to right
  for (let i = 0; i < right - left; i++) {
    start.next = then!.next;
    then!.next = prev.next;
    prev.next = then;
    then = start.next;
  }

  return dummy.next;
}
```

---

## Dummy Head Technique

A **dummy head** (sentinel node) simplifies edge cases where the head itself might
be removed or changed.

### Problem Without Dummy Head

When deleting nodes, the head might change, requiring special-case code:

```typescript
// Without dummy: verbose and error-prone
function removeElements_noDummy<T>(
  head: ListNode<T> | null,
  val: T,
): ListNode<T> | null {
  // Handle head removal
  while (head !== null && head.val === val) {
    head = head.next;
  }

  let current = head;
  while (current !== null && current.next !== null) {
    if (current.next.val === val) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }

  return head;
}
```

### With Dummy Head

```typescript
// With dummy: cleaner and uniform logic
function removeElements<T>(
  head: ListNode<T> | null,
  val: T,
): ListNode<T> | null {
  const dummy = new ListNode<T>(0 as T);
  dummy.next = head;

  let current: ListNode<T> = dummy;
  while (current.next !== null) {
    if (current.next.val === val) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }

  return dummy.next;
}
```

### When to Use Dummy Head

- Deleting nodes (head might be deleted)
- Merging two lists (unknown which head comes first)
- Partitioning a list
- Any operation where the head of the result is unknown beforehand

---

## Common Patterns

### 1. Runner Technique

Use two pointers at different speeds or starting positions to solve problems:

- **Same speed, different start**: find nth from end (start one pointer n steps ahead)
- **Different speed**: find middle, detect cycle

### 2. Merge Pattern

Merge two sorted linked lists by comparing heads and choosing the smaller:

```typescript
function mergeTwoLists<T>(
  l1: ListNode<T> | null,
  l2: ListNode<T> | null,
): ListNode<T> | null {
  const dummy = new ListNode<T>(0 as T);
  let tail: ListNode<T> = dummy;

  while (l1 !== null && l2 !== null) {
    if ((l1.val as number) <= (l2.val as number)) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }

  tail.next = l1 ?? l2;
  return dummy.next;
}
```

### 3. In-Place Reversal Pattern

Instead of using extra space, reverse pointers directly. Used in:
- Reverse entire list
- Reverse k-group
- Palindrome check (reverse second half)

### 4. Copy with Random Pointer

When nodes have extra pointers (like a random pointer), use a hash map to map
original nodes to copies, then wire up the pointers.

### 5. Recursive Thinking

Many linked list problems have elegant recursive solutions:

```
// Recursive structure of a linked list:
// A linked list is either:
//   - null (empty)
//   - A node followed by a linked list (node.next)
```

This maps naturally to recursive functions:

```typescript
function lengthRecursive<T>(head: ListNode<T> | null): number {
  if (head === null) return 0;
  return 1 + lengthRecursive(head.next);
}
```

### 6. Two-Pass vs One-Pass

Some problems seem to require knowing the length first (two passes), but can be
solved in one pass with clever pointer manipulation:

| Problem               | Two-Pass           | One-Pass              |
|-----------------------|--------------------|-----------------------|
| Find middle           | Count, go to n/2   | Fast/slow pointers    |
| Nth from end          | Count, go to n-k   | Two pointers, gap n   |
| Palindrome check      | Count, compare     | Reverse second half   |

---

## Summary

Key takeaways for linked lists:

1. **Know your node types**: singly (1 pointer) vs doubly (2 pointers)
2. **Master pointer manipulation**: drawing diagrams helps enormously
3. **Use dummy heads** to avoid edge cases with head node
4. **Fast/slow pointers** solve cycle, middle, and nth-from-end problems
5. **Reversal** is a fundamental building block for many problems
6. **Think recursively**: linked lists have natural recursive structure
7. **Understand tradeoffs**: linked lists beat arrays for insert/delete at known
   positions but lose on access and cache performance

Practice these patterns until pointer manipulation becomes second nature. Most
linked list interview problems combine 2-3 of these techniques.
