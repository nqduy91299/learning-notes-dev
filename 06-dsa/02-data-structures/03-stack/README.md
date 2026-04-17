# Stack

## Overview

A **stack** is a linear data structure that follows the **Last In, First Out (LIFO)** principle.
The last element added to the stack is the first one to be removed. Think of a stack of plates:
you add plates to the top and remove plates from the top.

## LIFO Concept

```
Push 10    Push 20    Push 30    Pop (30)   Pop (20)
                      ┌────┐
             ┌────┐   │ 30 │   ┌────┐
┌────┐       │ 20 │   │ 20 │   │ 20 │     ┌────┐
│ 10 │       │ 10 │   │ 10 │   │ 10 │     │ 10 │
└────┘       └────┘   └────┘   └────┘     └────┘
```

The key constraint: **you can only access the top element**. There is no random access to
elements in the middle of the stack.

## Core Operations

| Operation | Description                        | Time Complexity |
|-----------|------------------------------------|-----------------|
| `push`    | Add element to the top             | O(1)            |
| `pop`     | Remove and return the top element  | O(1)            |
| `peek`    | View the top element without removing | O(1)         |
| `isEmpty` | Check if the stack is empty        | O(1)            |
| `size`    | Get the number of elements         | O(1)            |

All core operations are **O(1)** — this is what makes stacks so efficient.

## Implementation Approaches

### Array-Based Stack

The simplest approach: use an array where `push` appends to the end and `pop` removes from
the end.

```typescript
class ArrayStack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}
```

**Pros:**
- Simple implementation
- Cache-friendly (contiguous memory)
- Built-in dynamic resizing in JavaScript

**Cons:**
- Occasional O(n) resize when the internal array grows (amortized O(1))
- Wastes memory if the stack shrinks significantly

### Linked-List-Based Stack

Each node points to the one below it. Push and pop operate on the head.

```typescript
interface StackNode<T> {
  value: T;
  next: StackNode<T> | null;
}

class LinkedStack<T> {
  private head: StackNode<T> | null = null;
  private count: number = 0;

  push(item: T): void {
    this.head = { value: item, next: this.head };
    this.count++;
  }

  pop(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    this.count--;
    return value;
  }

  peek(): T | undefined {
    return this.head?.value;
  }

  isEmpty(): boolean {
    return this.head === null;
  }

  get size(): number {
    return this.count;
  }
}
```

**Pros:**
- Truly O(1) push/pop every time (no resize)
- Memory usage scales exactly with the number of elements

**Cons:**
- More memory per element (node + pointer overhead)
- Not cache-friendly (scattered memory allocation)

### Which to Choose?

In practice, **array-based stacks** are preferred in most situations because JavaScript arrays
handle resizing automatically and the cache locality benefits outweigh the occasional resize
cost. Use linked-list-based stacks when you need **guaranteed O(1)** per operation (e.g.,
real-time systems).

## The Call Stack

Every programming language uses a stack internally to manage function calls — the **call stack**.

```typescript
function a() {
  console.log("a start");
  b();
  console.log("a end");
}

function b() {
  console.log("b start");
  c();
  console.log("b end");
}

function c() {
  console.log("c");
}

a();
// Call stack grows: [a] -> [a, b] -> [a, b, c]
// Call stack shrinks: [a, b] -> [a] -> []
```

When a function is called, a new **stack frame** is pushed onto the call stack containing
its local variables, parameters, and return address. When the function returns, its frame
is popped.

**Stack overflow** occurs when the call stack exceeds its maximum size, typically from
unbounded recursion.

## Monotonic Stack

A **monotonic stack** maintains elements in either strictly increasing or strictly decreasing
order from bottom to top. It is a powerful technique for problems involving "next greater/smaller
element."

### Monotonic Decreasing Stack (for Next Greater Element)

```
Array: [2, 1, 2, 4, 3]

Processing right to left, maintaining a stack of "future" elements:

i=4: stack=[]       → result[4]=-1,  push 3   stack=[3]
i=3: stack=[3]      → pop 3 (3<4),   result[3]=-1, push 4  stack=[4]
i=2: stack=[4]      → result[2]=4,   push 2   stack=[4,2]
i=1: stack=[4,2]    → pop 2 (2>=2),  result[1]=4,  push 1  stack=[4,1]
i=0: stack=[4,1]    → pop 1 (1<2),   result[0]=4,  push 2  stack=[4,2]

Result: [4, 4, 4, -1, -1]
```

The key insight: we pop elements from the stack that are **not useful** anymore (they can
never be the "next greater" for any remaining element). This gives us O(n) total time
because each element is pushed and popped at most once.

### Alternative: Processing Left to Right

```typescript
function nextGreaterElement(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(-1);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  return result;
}
```

## Common Stack Problems

### 1. Balanced Parentheses

**Problem:** Given a string containing `(`, `)`, `{`, `}`, `[`, `]`, determine if the
input string has balanced brackets.

**Approach:** Push opening brackets onto the stack. When encountering a closing bracket,
check if the top of the stack is the matching opening bracket. If the stack is empty at the
end, the string is valid.

**Time:** O(n) | **Space:** O(n)

```typescript
function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
  }

  return stack.length === 0;
}
```

### 2. Expression Evaluation (Reverse Polish Notation)

**Problem:** Evaluate an expression in postfix notation like `["2","1","+","3","*"]` → 9.

**Approach:** Push numbers onto the stack. When encountering an operator, pop two operands,
apply the operator, and push the result.

**Time:** O(n) | **Space:** O(n)

### 3. Min Stack

**Problem:** Design a stack that supports push, pop, peek, and retrieving the minimum
element in O(1) time.

**Approach:** Maintain a second stack that tracks the minimum at each level. When pushing
a value, also push `Math.min(value, currentMin)` onto the min stack.

```typescript
class MinStack {
  private stack: number[] = [];
  private mins: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const min = this.mins.length === 0 ? val : Math.min(val, this.mins[this.mins.length - 1]);
    this.mins.push(min);
  }

  pop(): void {
    this.stack.pop();
    this.mins.pop();
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.mins[this.mins.length - 1];
  }
}
```

### 4. Next Greater Element

See the **Monotonic Stack** section above. This pattern applies to many variations:
- Next greater element to the right
- Next smaller element to the left
- Daily temperatures (how many days until a warmer day)

### 5. Daily Temperatures

**Problem:** Given daily temperatures, return an array where `result[i]` is the number of
days you have to wait for a warmer temperature. If there is no future warmer day, put 0.

**Approach:** Use a monotonic decreasing stack storing indices. When the current temperature
is greater than the temperature at the stack's top index, pop and compute the difference.

**Time:** O(n) | **Space:** O(n)

## When to Use a Stack

- **Matching/nesting problems:** parentheses, HTML tags, nested structures
- **Reversal problems:** reverse a string, undo operations
- **Expression parsing:** infix to postfix, postfix evaluation
- **Backtracking:** DFS traversal (iterative), maze solving
- **Monotonic patterns:** next greater/smaller element, stock span, histogram area
- **Function call simulation:** converting recursion to iteration

## Complexity Summary

| Implementation | Push | Pop  | Peek | Space |
|---------------|------|------|------|-------|
| Array-based   | O(1)*| O(1) | O(1) | O(n)  |
| Linked-list   | O(1) | O(1) | O(1) | O(n)  |

*Amortized O(1) for array-based due to occasional resizing.

## Key Takeaways

1. Stacks enforce LIFO ordering — last in, first out.
2. All core operations (push, pop, peek) are O(1).
3. Array-based implementation is preferred in most practical situations.
4. The monotonic stack is a powerful technique — learn to recognize when elements need to be
   processed in order with a "next greater/smaller" relationship.
5. If a problem involves nesting, matching, or reversal, think stack first.
6. Converting recursive algorithms to iterative ones often involves an explicit stack.
