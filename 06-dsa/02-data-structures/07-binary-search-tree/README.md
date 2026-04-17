# Binary Search Tree (BST)

## Table of Contents

- [What is a BST?](#what-is-a-bst)
- [BST Property](#bst-property)
- [Search](#search)
- [Insert](#insert)
- [Delete](#delete)
- [In-Order Traversal Gives Sorted Order](#in-order-traversal-gives-sorted-order)
- [Validate BST](#validate-bst)
- [Kth Smallest Element](#kth-smallest-element)
- [Lowest Common Ancestor (LCA)](#lowest-common-ancestor-lca)
- [Convert Sorted Array to BST](#convert-sorted-array-to-bst)
- [Degenerate BST](#degenerate-bst)
- [Self-Balancing BSTs](#self-balancing-bsts)
- [Complexity Summary](#complexity-summary)

---

## What is a BST?

A **Binary Search Tree** is a binary tree with an ordering property that makes
search, insertion, and deletion efficient. It's the foundation of many data
structures like sets, maps, and priority queues.

```
        8
       / \
      3   10
     / \    \
    1   6   14
       / \  /
      4  7 13
```

---

## BST Property

For every node in a BST:

- All values in the **left subtree** are **less than** the node's value.
- All values in the **right subtree** are **greater than** the node's value.
- Both left and right subtrees are also BSTs.

**Important nuance**: The property applies to the **entire subtree**, not just
direct children. A common mistake:

```
        5
       / \
      1   6        ← Looks valid at first glance
         / \
        3   7      ← But 3 < 5, so it violates BST property!
```

This is NOT a valid BST because 3 is in the right subtree of 5.

---

## Search

Search follows the BST property to eliminate half the tree at each step.

```typescript
function search(node: TreeNode<number> | null, target: number): TreeNode<number> | null {
  if (node === null) return null;
  if (target === node.val) return node;
  if (target < node.val) return search(node.left, target);
  return search(node.right, target);
}
```

**Iterative version** (more space-efficient):

```typescript
function searchIterative(root: TreeNode<number> | null, target: number): TreeNode<number> | null {
  let current = root;
  while (current !== null) {
    if (target === current.val) return current;
    if (target < current.val) current = current.left;
    else current = current.right;
  }
  return null;
}
```

- **Average**: O(log n) — balanced tree
- **Worst**: O(n) — degenerate/skewed tree

---

## Insert

New nodes are always inserted as **leaf nodes**. Navigate down using BST property
until you find the correct empty spot.

```typescript
function insert(root: TreeNode<number> | null, val: number): TreeNode<number> {
  if (root === null) return new TreeNode(val);
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else if (val > root.val) {
    root.right = insert(root.right, val);
  }
  // val === root.val: duplicate, skip (or handle per requirements)
  return root;
}
```

**Example**: Insert 5 into the BST:

```
Before:        8            After:        8
              / \                        / \
             3   10                     3   10
            / \                        / \
           1   6                      1   6
                                         / \
                                        5   (unchanged)
```

Wait — 5 < 6, so it goes left of 6:

```
After:        8
             / \
            3   10
           / \
          1   6
             /
            5
```

---

## Delete

Deletion is the most complex BST operation. There are **three cases**:

### Case 1: Node is a leaf (no children)

Simply remove it.

```
Delete 4:       5            →        5
               / \                   / \
              3   7                 3   7
             /
            4
```

### Case 2: Node has one child

Replace the node with its child.

```
Delete 3:       5            →        5
               / \                   / \
              3   7                 4   7
             /
            4
```

### Case 3: Node has two children

Replace the node's value with its **in-order successor** (smallest node in right
subtree) or **in-order predecessor** (largest in left subtree), then delete that
successor/predecessor.

```
Delete 3:       5                    5
               / \                  / \
              3   7       →        4   7
             / \                  /
            1   4                1
```

Here, 4 is the in-order successor of 3 (smallest in right subtree of 3).

```typescript
function deleteNode(
  root: TreeNode<number> | null,
  key: number
): TreeNode<number> | null {
  if (root === null) return null;

  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // Found the node to delete
    // Case 1 & 2: No left child or no right child
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;

    // Case 3: Two children — find in-order successor
    let successor = root.right;
    while (successor.left !== null) {
      successor = successor.left;
    }
    root.val = successor.val;
    root.right = deleteNode(root.right, successor.val);
  }
  return root;
}
```

---

## In-Order Traversal Gives Sorted Order

This is a fundamental BST property. An in-order traversal (Left → Root → Right)
of a valid BST always produces values in **ascending sorted order**.

```
BST:        5
           / \
          3   8
         / \   \
        1   4   9

Inorder: [1, 3, 4, 5, 8, 9]  ← sorted!
```

This property is used in:
- Validating a BST
- Finding kth smallest element
- Finding successor/predecessor
- Range queries

---

## Validate BST

A common mistake is checking only `left.val < node.val < right.val` for direct
children. You must check that ALL nodes in the left subtree are less than the
current node, and ALL nodes in the right subtree are greater.

**Correct approach**: Pass valid range (min, max) down the recursion.

```typescript
function isValidBST(root: TreeNode<number> | null): boolean {
  function validate(
    node: TreeNode<number> | null,
    min: number,
    max: number
  ): boolean {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    );
  }
  return validate(root, -Infinity, Infinity);
}
```

**Alternative**: Do an in-order traversal and check that each value is greater
than the previous.

```typescript
function isValidBSTInorder(root: TreeNode<number> | null): boolean {
  let prev = -Infinity;

  function inorder(node: TreeNode<number> | null): boolean {
    if (node === null) return true;
    if (!inorder(node.left)) return false;
    if (node.val <= prev) return false;
    prev = node.val;
    return inorder(node.right);
  }

  return inorder(root);
}
```

---

## Kth Smallest Element

Use in-order traversal (gives sorted order) and count to k.

```typescript
function kthSmallest(root: TreeNode<number> | null, k: number): number {
  let count = 0;
  let result = 0;

  function inorder(node: TreeNode<number> | null): void {
    if (node === null || count >= k) return;
    inorder(node.left);
    count++;
    if (count === k) {
      result = node.val;
      return;
    }
    inorder(node.right);
  }

  inorder(root);
  return result;
}
```

Time: O(H + k) where H is height. Space: O(H).

---

## Lowest Common Ancestor (LCA)

In a BST, finding the LCA is simpler than in a general binary tree because
we can use the BST property.

The LCA of nodes `p` and `q` is the **first node where the paths diverge** —
i.e., `p` and `q` are on different sides, or one of them equals the current node.

```typescript
function lowestCommonAncestor(
  root: TreeNode<number>,
  p: number,
  q: number
): TreeNode<number> {
  let current: TreeNode<number> = root;
  while (true) {
    if (p < current.val && q < current.val) {
      current = current.left!;
    } else if (p > current.val && q > current.val) {
      current = current.right!;
    } else {
      return current; // split point or one matches
    }
  }
}
```

Time: O(H). Space: O(1) iterative.

---

## Convert Sorted Array to BST

Given a sorted array, build a height-balanced BST. Pick the **middle element** as
root to ensure balance.

```typescript
function sortedArrayToBST(nums: number[]): TreeNode<number> | null {
  function build(left: number, right: number): TreeNode<number> | null {
    if (left > right) return null;
    const mid = Math.floor((left + right) / 2);
    const node = new TreeNode(nums[mid]);
    node.left = build(left, mid - 1);
    node.right = build(mid + 1, right);
    return node;
  }
  return build(0, nums.length - 1);
}
```

Time: O(n). Space: O(log n) recursion stack.

---

## Degenerate BST

When elements are inserted in sorted order, the BST degenerates into a linked list:

```
Insert: 1, 2, 3, 4, 5

1
 \
  2
   \
    3
     \
      4
       \
        5
```

All operations become O(n). This is why self-balancing BSTs exist.

---

## Self-Balancing BSTs

### AVL Tree

- Named after Adelson-Velsky and Landis.
- Maintains a **balance factor** (height difference of left and right subtrees)
  of -1, 0, or 1 for every node.
- Uses **rotations** (left, right, left-right, right-left) to rebalance after
  insertions and deletions.
- **Strictly balanced**: guarantees O(log n) for all operations.
- Better for **read-heavy** workloads (lookups are fast due to strict balance).

### Red-Black Tree

- Each node is colored **red** or **black**.
- Properties maintained:
  1. Root is black.
  2. Red nodes cannot have red children (no two consecutive reds).
  3. Every path from a node to its null descendants has the same number of black nodes.
- **Less strictly balanced** than AVL (height ≤ 2 × log₂(n+1)).
- Fewer rotations on insert/delete → better for **write-heavy** workloads.
- Used in: `std::map` (C++), `TreeMap` (Java), Linux kernel.

### Comparison

| Property | AVL | Red-Black |
|----------|-----|-----------|
| Balance strictness | Strict (±1) | Relaxed |
| Max height | ~1.44 log n | ~2 log n |
| Lookup | Faster | Slightly slower |
| Insert/Delete | More rotations | Fewer rotations |
| Use case | Read-heavy | Write-heavy |

In interviews, you rarely need to implement these. Understanding **why** they
exist and their trade-offs is sufficient.

---

## Complexity Summary

| Operation | Average | Worst (Degenerate) |
|-----------|---------|-------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| In-order traversal | O(n) | O(n) |
| Find min/max | O(log n) | O(n) |
| Validate BST | O(n) | O(n) |
| Kth smallest | O(H + k) | O(n) |
| LCA | O(H) | O(n) |
| Build from sorted array | O(n) | O(n) |

Where H = height of the tree:
- **Balanced**: H = O(log n)
- **Degenerate**: H = O(n)

---

## Common Interview Tips

1. **In-order traversal** is your best friend for BST problems — it gives sorted order.
2. **Range-based reasoning**: Use min/max bounds when validating or searching.
3. **BST search is binary search on a tree** — same halving logic.
4. **Deletion case 3** (two children) is the most asked deletion scenario.
5. If the problem says "balanced BST," all operations are O(log n).
6. **Range sum BST**: Prune subtrees — skip left if node.val ≤ low, skip right
   if node.val ≥ high.
