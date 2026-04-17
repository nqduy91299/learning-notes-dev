# Recursion

## Table of Contents

1. [What is Recursion](#what-is-recursion)
2. [Base Case and Recursive Case](#base-case-and-recursive-case)
3. [Call Stack Visualization](#call-stack-visualization)
4. [Stack Overflow](#stack-overflow)
5. [Classic Examples](#classic-examples)
   - [Factorial](#factorial)
   - [Fibonacci](#fibonacci)
6. [Recursion vs Iteration](#recursion-vs-iteration)
7. [Tail Recursion](#tail-recursion)
8. [Recursive Thinking](#recursive-thinking)
9. [Common Recursive Patterns](#common-recursive-patterns)
   - [Tree Traversal](#tree-traversal)
   - [Divide and Conquer](#divide-and-conquer)
   - [Generating Subsets and Permutations](#generating-subsets-and-permutations)
10. [Memoization](#memoization)
11. [Key Takeaways](#key-takeaways)

---

## What is Recursion

Recursion is a technique where a function calls itself to solve a problem by
breaking it into smaller instances of the same problem. Every recursive function
has two essential parts:

1. **Base case** — the simplest instance, answered directly without recursion.
2. **Recursive case** — reduces the problem and calls itself with a smaller input.

```typescript
function countdown(n: number): void {
  if (n <= 0) return;       // base case
  console.log(n);
  countdown(n - 1);          // recursive case
}
```

Recursion is not magic — it's just a function calling itself. The key is that each
call works on a **smaller** problem, eventually reaching the base case.

---

## Base Case and Recursive Case

### Base Case

The stopping condition. Without it, recursion never terminates.

**Common base cases**:
- `n === 0` or `n === 1` (numeric problems)
- `arr.length === 0` (empty collection)
- `node === null` (tree/linked list end)
- `lo > hi` (search space exhausted)

### Recursive Case

Must make progress toward the base case. Common patterns:
- `f(n)` calls `f(n - 1)` — linear reduction
- `f(n)` calls `f(n / 2)` — logarithmic reduction (binary search)
- `f(n)` calls `f(n - 1)` twice — exponential branching (fibonacci naive)
- `f(arr)` calls `f(arr.slice(0, mid))` and `f(arr.slice(mid))` — divide and conquer

### The Trust

When writing recursive functions, **trust that the recursive call works correctly
for the smaller input**. Focus on:
1. What is the base case?
2. How do I reduce the problem?
3. How do I combine the result of the recursive call?

---

## Call Stack Visualization

Each recursive call adds a **stack frame** to the call stack:

```
factorial(4)
  → 4 * factorial(3)
    → 3 * factorial(2)
      → 2 * factorial(1)
        → return 1          ← base case
      → return 2 * 1 = 2
    → return 3 * 2 = 6
  → return 4 * 6 = 24
```

Stack frames at the deepest point:
```
| factorial(1) |  ← top of stack (currently executing)
| factorial(2) |
| factorial(3) |
| factorial(4) |  ← bottom of stack (first call)
|______________|
```

Each frame holds its own local variables and return address. When a function
returns, its frame is popped off the stack.

**Stack depth** = maximum number of frames on the stack at any point.
For `factorial(n)`, stack depth = n.

---

## Stack Overflow

The call stack has a limited size (typically ~10,000–25,000 frames in JS engines).
Exceeding it causes a **RangeError: Maximum call stack size exceeded**.

```typescript
// This will crash for large n:
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
// factorial(100000) → RangeError
```

**How to avoid**:
1. Ensure base case is reachable (no infinite recursion).
2. Convert to iteration for deep recursion.
3. Use memoization to reduce redundant calls.
4. Increase input limits awareness.

**JavaScript's stack limit** varies by engine:
- V8 (Chrome/Node): ~10,000–15,000 frames
- SpiderMonkey (Firefox): ~10,000 frames
- JavaScriptCore (Safari): ~25,000 frames

---

## Classic Examples

### Factorial

```
n! = n × (n-1) × (n-2) × ... × 1
0! = 1 (by definition)
```

```typescript
function factorial(n: number): number {
  if (n <= 1) return 1;        // base case
  return n * factorial(n - 1);  // recursive case
}
```

**Trace**: `factorial(5) = 5 * 4 * 3 * 2 * 1 = 120`
**Complexity**: O(n) time, O(n) space (call stack)

### Fibonacci

```
fib(0) = 0, fib(1) = 1
fib(n) = fib(n-1) + fib(n-2)
```

**Naive recursive** (exponential time!):
```typescript
function fib(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return fib(n - 1) + fib(n - 2);
}
```

**Call tree for fib(5)**:
```
                fib(5)
              /        \
          fib(4)        fib(3)
         /     \        /    \
      fib(3)  fib(2)  fib(2) fib(1)
      /   \    /  \    /  \
   fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
   / \
fib(1) fib(0)
```

The same subproblems are computed many times. `fib(3)` is computed twice,
`fib(2)` three times. This leads to O(2^n) time complexity.

**Fix**: Use memoization (see [Memoization](#memoization) section).

---

## Recursion vs Iteration

Every recursive function can be converted to iteration (and vice versa). The
question is which is clearer and more efficient.

| Aspect          | Recursion                    | Iteration              |
| --------------- | ---------------------------- | ---------------------- |
| Clarity         | Often cleaner for trees/DAGs | Cleaner for linear     |
| Stack usage     | O(depth) implicit stack      | O(1) or explicit stack |
| Performance     | Function call overhead       | Generally faster       |
| Stack overflow  | Risk for deep recursion      | No risk                |
| State mgmt      | Via parameters/returns       | Via variables/stack    |

### When recursion is better

- **Tree traversals** — natural recursive structure
- **Divide and conquer** — merge sort, quicksort
- **Backtracking** — subsets, permutations, N-queens
- **Graph DFS** — cleaner than explicit stack for many problems

### When iteration is better

- **Linear sequences** — factorial, fibonacci, linked list traversal
- **Deep recursion** — avoid stack overflow
- **Performance-critical** — no function call overhead
- **Tail-recursive patterns** — JS doesn't optimize these anyway

### Conversion example: Factorial

```typescript
// Recursive
function factorialRec(n: number): number {
  if (n <= 1) return 1;
  return n * factorialRec(n - 1);
}

// Iterative
function factorialIter(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

---

## Tail Recursion

A function is **tail-recursive** if the recursive call is the very last operation —
no computation is done after the call returns.

```typescript
// NOT tail-recursive: multiplication happens AFTER the recursive call returns
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // must multiply after return
}

// Tail-recursive: recursive call IS the last operation
function factorialTail(n: number, acc: number = 1): number {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc); // nothing after this call
}
```

### Why it matters (in theory)

A compiler can optimize tail calls by reusing the current stack frame instead of
creating a new one. This converts recursion to iteration under the hood, using O(1)
stack space.

### JavaScript reality

**Tail Call Optimization (TCO) is NOT implemented in most JS engines.**

- ES2015 specification includes TCO.
- Only **Safari/JavaScriptCore** implements it.
- **V8 (Chrome/Node) does NOT** — they removed their implementation.
- **SpiderMonkey (Firefox) does NOT**.

**Practical advice**: Don't rely on TCO in JavaScript. If you need deep recursion,
convert to iteration manually.

---

## Recursive Thinking

### How to approach a recursive problem

1. **Identify the base case(s)**: What's the simplest input? What should it return?
2. **Identify the recursive case**: How can you reduce the problem?
3. **Trust the recursion**: Assume the recursive call returns the correct result
   for the smaller input. How do you use that to solve the current problem?
4. **Verify termination**: Does every recursive call make progress toward the base case?

### Example: Sum of array

```
sum([1, 2, 3, 4])
= 1 + sum([2, 3, 4])       ← first element + sum of rest
= 1 + 2 + sum([3, 4])
= 1 + 2 + 3 + sum([4])
= 1 + 2 + 3 + 4 + sum([])
= 1 + 2 + 3 + 4 + 0         ← base case: empty array = 0
= 10
```

### Example: Reverse a string

```
reverse("hello")
= reverse("ello") + "h"    ← reverse rest + first char at end
= reverse("llo") + "e" + "h"
= reverse("lo") + "l" + "e" + "h"
= reverse("o") + "l" + "l" + "e" + "h"
= "o" + "l" + "l" + "e" + "h"  ← base case: single char
= "olleh"
```

---

## Common Recursive Patterns

### Tree Traversal

Trees are inherently recursive: each node has subtrees that are also trees.

```typescript
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// Inorder: left → root → right
function inorder(node: TreeNode | null): number[] {
  if (node === null) return [];
  return [...inorder(node.left), node.val, ...inorder(node.right)];
}

// Tree height
function height(node: TreeNode | null): number {
  if (node === null) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}
```

### Divide and Conquer

Split problem → solve subproblems recursively → combine results.

**Examples**: Merge sort, quicksort, binary search, closest pair of points.

```typescript
// Maximum subarray sum (divide and conquer approach)
function maxSubarrayDC(arr: number[], lo: number, hi: number): number {
  if (lo === hi) return arr[lo];

  const mid = Math.floor((lo + hi) / 2);
  const leftMax = maxSubarrayDC(arr, lo, mid);
  const rightMax = maxSubarrayDC(arr, mid + 1, hi);

  // Max crossing sum
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) { sum += arr[i]; leftSum = Math.max(leftSum, sum); }
  let rightSum = -Infinity;
  sum = 0;
  for (let i = mid + 1; i <= hi; i++) { sum += arr[i]; rightSum = Math.max(rightSum, sum); }

  return Math.max(leftMax, rightMax, leftSum + rightSum);
}
```

### Generating Subsets and Permutations

**Subsets** (power set): For each element, choose to include or exclude it.

```
subsets([1, 2, 3]):
  Include 1: [1] + subsets([2, 3])
  Exclude 1: [] + subsets([2, 3])
  ...
  Result: [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
```

**Permutations**: For each position, try every remaining element.

```
permutations([1, 2, 3]):
  Fix 1 at pos 0: [1] + permutations([2, 3])
  Fix 2 at pos 0: [2] + permutations([1, 3])
  Fix 3 at pos 0: [3] + permutations([1, 2])
  ...
```

These are **backtracking** patterns — a form of recursion where you explore all
possibilities by making a choice, recursing, then undoing the choice.

---

## Memoization

**Memoization** caches the results of expensive function calls to avoid redundant
computation. It's the key optimization for recursive functions with overlapping
subproblems.

### Fibonacci with Memoization

```typescript
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (memo.has(n)) return memo.get(n)!;

  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}
```

**Before memoization**: O(2^n) time — exponential explosion.
**After memoization**: O(n) time — each subproblem computed once.

### When to memoize

Memoization helps when:
1. **Overlapping subproblems** — same inputs are computed multiple times.
2. **Optimal substructure** — the optimal solution uses optimal sub-solutions.

These are the hallmarks of **dynamic programming** problems. Memoization is
"top-down DP" — start from the original problem and cache as you go.

### Generic memoization wrapper

```typescript
function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
): (...args: Args) => R {
  const cache = new Map<string, R>();
  return (...args: Args): R => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

---

## Key Takeaways

1. **Every recursion needs a base case** that's reachable. Missing or unreachable
   base cases cause infinite recursion and stack overflow.

2. **Trust the recursion**. When writing recursive functions, assume the recursive
   call works correctly for the smaller input. Focus on how to combine the result.

3. **Recursion uses the call stack** for state management. Each frame holds local
   variables. Deep recursion risks stack overflow in JavaScript (~10K–15K frames).

4. **Tail recursion** is not optimized in V8/SpiderMonkey. Don't rely on it.
   Convert deep recursion to iteration manually.

5. **Memoization** eliminates redundant computation in recursive functions with
   overlapping subproblems. It transforms exponential time to polynomial.

6. **Common recursive patterns**: tree traversal, divide and conquer, backtracking
   (subsets, permutations), and dynamic programming.

7. **Recursion vs iteration** is a tradeoff. Use recursion when the problem has
   natural recursive structure (trees, D&C, backtracking). Use iteration for
   linear problems and when stack depth is a concern.

8. **Recursive thinking**: identify base case, identify reduction step, trust the
   recursive call, verify termination.
