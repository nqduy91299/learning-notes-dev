# Tree

## Table of Contents

- [What is a Tree?](#what-is-a-tree)
- [Tree Terminology](#tree-terminology)
- [Binary Tree](#binary-tree)
- [Types of Binary Trees](#types-of-binary-trees)
- [Tree Traversal](#tree-traversal)
- [Depth-First Search (DFS)](#depth-first-search-dfs)
- [Breadth-First Search (BFS)](#breadth-first-search-bfs)
- [Recursive vs Iterative Traversal](#recursive-vs-iterative-traversal)
- [Tree Height and Depth](#tree-height-and-depth)
- [Diameter of a Tree](#diameter-of-a-tree)
- [Path Sum](#path-sum)
- [Common Patterns](#common-patterns)
- [Complexity Summary](#complexity-summary)

---

## What is a Tree?

A **tree** is a hierarchical, non-linear data structure consisting of nodes connected
by edges. Unlike arrays, linked lists, stacks, and queues (which are linear), trees
represent hierarchical relationships — such as file systems, HTML DOM, or
organizational charts.

A tree with `n` nodes always has exactly `n - 1` edges.

```
        1           ← root
       / \
      2   3         ← internal nodes
     / \   \
    4   5   6       ← leaves (4, 5, 6)
```

---

## Tree Terminology

| Term | Definition |
|------|-----------|
| **Root** | The topmost node with no parent. Every tree has exactly one root. |
| **Node** | An element in the tree containing a value and references to children. |
| **Edge** | The link/connection between a parent node and a child node. |
| **Leaf** | A node with no children (also called an external node). |
| **Internal node** | A node with at least one child. |
| **Parent** | The node directly above a given node. |
| **Child** | A node directly below a given node. |
| **Sibling** | Nodes sharing the same parent. |
| **Subtree** | A node and all its descendants form a subtree. |
| **Depth** | Number of edges from the root to a given node. Root has depth 0. |
| **Height** | Number of edges on the longest path from a node down to a leaf. |
| **Level** | All nodes at the same depth. Level = depth (0-indexed) or depth+1 (1-indexed). |
| **Degree** | Number of children a node has. |
| **Path** | A sequence of nodes connected by edges from one node to another. |
| **Ancestor** | Any node on the path from a given node up to the root. |
| **Descendant** | Any node reachable by going downward from a given node. |

### Example with annotations

```
        A          depth=0, height=3, level=0
       / \
      B   C        depth=1, height=1 (B), height=2 (C)
     / \   \
    D   E   F      depth=2
             \
              G    depth=3, leaf, height=0
```

- **Root**: A
- **Leaves**: D, E, G
- **Height of tree**: 3 (longest path: A → C → F → G)
- **Depth of G**: 3
- **Siblings**: B and C; D and E
- **Subtree rooted at C**: C → F → G

---

## Binary Tree

A **binary tree** is a tree where each node has **at most 2 children**, referred to
as the **left child** and the **right child**.

```typescript
class TreeNode<T> {
  val: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;

  constructor(val: T, left?: TreeNode<T> | null, right?: TreeNode<T> | null) {
    this.val = val;
    this.left = left ?? null;
    this.right = right ?? null;
  }
}
```

Binary trees are the most commonly tested tree structure in interviews.

---

## Types of Binary Trees

### Full Binary Tree

Every node has **0 or 2** children. No node has only one child.

```
        1
       / \
      2   3
     / \
    4   5
```

### Complete Binary Tree

All levels are fully filled **except possibly the last**, which is filled from
**left to right**.

```
        1
       / \
      2   3
     / \  /
    4  5  6
```

- Used in heaps.
- Can be efficiently stored in an array.

### Perfect Binary Tree

All internal nodes have exactly 2 children, and **all leaves are at the same level**.

```
        1
       / \
      2   3
     / \ / \
    4  5 6  7
```

- A perfect binary tree of height `h` has `2^(h+1) - 1` nodes.
- Number of leaves = `2^h`.
- Number of internal nodes = `2^h - 1`.

### Degenerate (Skewed) Tree

Each node has at most one child — essentially a linked list.

```
    1
     \
      2
       \
        3
         \
          4
```

- All operations degrade to O(n).

### Balanced Binary Tree

A tree where the height difference between left and right subtrees of **every** node
is at most 1. Ensures O(log n) operations.

---

## Tree Traversal

Traversal means visiting every node in the tree exactly once. There are two main
strategies: **Depth-First Search (DFS)** and **Breadth-First Search (BFS)**.

---

## Depth-First Search (DFS)

DFS explores as deep as possible before backtracking. There are three orderings:

### Preorder: Root → Left → Right

Visit the current node **before** its children.

```
Tree:       1
           / \
          2   3
         / \
        4   5

Preorder: [1, 2, 4, 5, 3]
```

```typescript
// Recursive
function preorder<T>(node: TreeNode<T> | null, result: T[] = []): T[] {
  if (node === null) return result;
  result.push(node.val);        // visit root
  preorder(node.left, result);  // traverse left
  preorder(node.right, result); // traverse right
  return result;
}

// Iterative (using stack)
function preorderIterative<T>(root: TreeNode<T> | null): T[] {
  if (root === null) return [];
  const result: T[] = [];
  const stack: TreeNode<T>[] = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.val);
    // Push right first so left is processed first (LIFO)
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return result;
}
```

**Use cases**: Create a copy of the tree, serialize a tree, prefix expression.

### Inorder: Left → Root → Right

Visit the current node **between** its children.

```
Tree:       1
           / \
          2   3
         / \
        4   5

Inorder: [4, 2, 5, 1, 3]
```

```typescript
// Recursive
function inorder<T>(node: TreeNode<T> | null, result: T[] = []): T[] {
  if (node === null) return result;
  inorder(node.left, result);   // traverse left
  result.push(node.val);        // visit root
  inorder(node.right, result);  // traverse right
  return result;
}

// Iterative
function inorderIterative<T>(root: TreeNode<T> | null): T[] {
  const result: T[] = [];
  const stack: TreeNode<T>[] = [];
  let current = root;

  while (current !== null || stack.length > 0) {
    // Go as far left as possible
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop()!;
    result.push(current.val);
    current = current.right;
  }
  return result;
}
```

**Use cases**: BST gives sorted order, infix expression evaluation.

### Postorder: Left → Right → Root

Visit the current node **after** its children.

```
Tree:       1
           / \
          2   3
         / \
        4   5

Postorder: [4, 5, 2, 3, 1]
```

```typescript
// Recursive
function postorder<T>(node: TreeNode<T> | null, result: T[] = []): T[] {
  if (node === null) return result;
  postorder(node.left, result);  // traverse left
  postorder(node.right, result); // traverse right
  result.push(node.val);         // visit root
  return result;
}

// Iterative (using two stacks or modified preorder)
function postorderIterative<T>(root: TreeNode<T> | null): T[] {
  if (root === null) return [];
  const result: T[] = [];
  const stack: TreeNode<T>[] = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.val);
    // Push left first, then right (reversed preorder)
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return result.reverse(); // Reverse to get postorder
}
```

**Use cases**: Delete a tree, postfix expression, calculate directory sizes.

### Mnemonic

| Traversal | Order | "Pre/In/Post" refers to when root is visited |
|-----------|-------|----------------------------------------------|
| Preorder | **Root** → L → R | Root is visited **first** |
| Inorder | L → **Root** → R | Root is visited **in the middle** |
| Postorder | L → R → **Root** | Root is visited **last** |

---

## Breadth-First Search (BFS)

### Level-Order Traversal

Visit nodes **level by level**, from left to right. Uses a **queue**.

```
Tree:       1
           / \
          2   3
         / \   \
        4   5   6

Level-order: [1, 2, 3, 4, 5, 6]
Level-by-level: [[1], [2, 3], [4, 5, 6]]
```

```typescript
function levelOrder<T>(root: TreeNode<T> | null): T[][] {
  if (root === null) return [];
  const result: T[][] = [];
  const queue: TreeNode<T>[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: T[] = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}
```

**Key insight**: Capture `queue.length` at the start of each level to know how
many nodes belong to the current level.

**Use cases**: Level-order print, finding minimum depth, right-side view,
zigzag traversal.

---

## Recursive vs Iterative Traversal

| Aspect | Recursive | Iterative |
|--------|-----------|-----------|
| **Code** | Cleaner, more intuitive | More verbose |
| **Space** | O(h) call stack | O(h) explicit stack |
| **Stack overflow** | Risk on deep trees | No risk |
| **Performance** | Function call overhead | Slightly faster |
| **Preferred** | Most interview problems | When stack depth is a concern |

In practice, recursive solutions are almost always acceptable in interviews.
The iterative versions are worth knowing for follow-up questions.

---

## Tree Height and Depth

### Height of a tree

The **height** is the number of edges on the longest path from the root to a leaf.
Equivalently, it's the maximum depth of any node.

```typescript
function treeHeight<T>(node: TreeNode<T> | null): number {
  if (node === null) return -1; // -1 for edge count, 0 for node count
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}
```

### Max depth (LeetCode convention)

LeetCode defines max depth as the number of **nodes** on the longest root-to-leaf
path (i.e., height + 1 when counting edges).

```typescript
function maxDepth<T>(node: TreeNode<T> | null): number {
  if (node === null) return 0;
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}
```

---

## Diameter of a Tree

The **diameter** (or width) of a binary tree is the length of the **longest path
between any two nodes**. This path may or may not pass through the root.

```
        1
       / \
      2   3
     / \
    4   5

Diameter = 3 (path: 4 → 2 → 1 → 3 or 5 → 2 → 1 → 3)
```

```typescript
function diameterOfBinaryTree<T>(root: TreeNode<T> | null): number {
  let maxDiameter = 0;

  function height(node: TreeNode<T> | null): number {
    if (node === null) return 0;
    const leftH = height(node.left);
    const rightH = height(node.right);
    // Update diameter: path through this node
    maxDiameter = Math.max(maxDiameter, leftH + rightH);
    return 1 + Math.max(leftH, rightH);
  }

  height(root);
  return maxDiameter;
}
```

**Key insight**: At each node, the longest path through that node is
`leftHeight + rightHeight`. Track the global maximum.

---

## Path Sum

Given a binary tree and a target sum, determine if there exists a root-to-leaf
path where the values sum to the target.

```typescript
function hasPathSum<T extends number>(
  node: TreeNode<T> | null,
  targetSum: number
): boolean {
  if (node === null) return false;
  // Leaf node: check if remaining sum equals node value
  if (node.left === null && node.right === null) {
    return node.val === targetSum;
  }
  const remaining = targetSum - node.val;
  return hasPathSum(node.left, remaining) || hasPathSum(node.right, remaining);
}
```

**Important**: A leaf is a node with **no children**. Don't terminate early at
null nodes or you'll get false positives.

---

## Common Patterns

### Pattern 1: Recursive DFS (Most Common)

The majority of tree problems follow this template:

```typescript
function solve(node: TreeNode<number> | null): ReturnType {
  // Base case
  if (node === null) return baseValue;

  // Recurse on children
  const leftResult = solve(node.left);
  const rightResult = solve(node.right);

  // Combine results
  return combine(node.val, leftResult, rightResult);
}
```

**Examples**: max depth, is balanced, is symmetric, path sum, diameter.

### Pattern 2: DFS with Global Variable

Some problems need to track a global state while traversing:

```typescript
function solve(root: TreeNode<number> | null): number {
  let globalResult = 0;

  function dfs(node: TreeNode<number> | null): number {
    if (node === null) return 0;
    const left = dfs(node.left);
    const right = dfs(node.right);
    globalResult = Math.max(globalResult, left + right); // update global
    return 1 + Math.max(left, right);                    // return to parent
  }

  dfs(root);
  return globalResult;
}
```

**Examples**: diameter, max path sum, longest univalue path.

### Pattern 3: BFS with Queue

Used when you need level-by-level processing:

```typescript
function solve(root: TreeNode<number> | null): Result {
  if (root === null) return defaultResult;
  const queue: TreeNode<number>[] = [root];

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      // process node
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return result;
}
```

**Examples**: level-order traversal, right-side view, minimum depth, zigzag.

### Pattern 4: Build Tree from Traversals

Reconstruct a tree from preorder + inorder (or inorder + postorder):

- **Preorder**: First element is always the root.
- **Inorder**: Elements left of root form left subtree, right form right subtree.
- Use a hashmap for O(1) index lookup in inorder array.

### Pattern 5: Top-Down vs Bottom-Up

- **Top-down** (preorder-style): Pass information from parent to child via
  parameters. Example: checking if a path sum exists.
- **Bottom-up** (postorder-style): Return information from children to parent.
  Example: computing height, checking balance.

---

## Complexity Summary

| Operation | Time | Space |
|-----------|------|-------|
| DFS traversal (pre/in/post) | O(n) | O(h) — call stack |
| BFS / level-order | O(n) | O(w) — max width |
| Max depth | O(n) | O(h) |
| Diameter | O(n) | O(h) |
| Path sum | O(n) | O(h) |
| Invert tree | O(n) | O(h) |
| Is symmetric | O(n) | O(h) |
| Count nodes (general) | O(n) | O(h) |
| Count nodes (complete tree) | O(log²n) | O(log n) |

Where:
- `n` = number of nodes
- `h` = height of tree (log n for balanced, n for skewed)
- `w` = maximum width of any level (up to n/2 for last level of complete tree)

---

## Quick Reference: When to Use What

| Situation | Approach |
|-----------|----------|
| Need sorted order from BST | Inorder DFS |
| Need to process level by level | BFS with queue |
| Need to compute height/depth | Bottom-up DFS |
| Need to pass info downward | Top-down DFS with params |
| Need global optimum across paths | DFS + global variable |
| Need to serialize/copy tree | Preorder DFS |
| Need to delete tree safely | Postorder DFS |
