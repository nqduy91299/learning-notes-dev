// ============================================================================
// Binary Search Tree — Exercises (15 total: 5 predict, 3 fix, 7 implement)
// Run: npx tsx 06-dsa/02-data-structures/07-binary-search-tree/exercises.ts
// ============================================================================

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

function buildTree(values: (number | null)[]): TreeNode<number> | null {
  if (values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue: TreeNode<number>[] = [root];
  let i = 1;
  while (i < values.length && queue.length > 0) {
    const node = queue.shift()!;
    if (i < values.length && values[i] !== null) {
      node.left = new TreeNode(values[i] as number);
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] !== null) {
      node.right = new TreeNode(values[i] as number);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function inorderCollect(node: TreeNode<number> | null, result: number[] = []): number[] {
  if (node === null) return result;
  inorderCollect(node.left, result);
  result.push(node.val);
  inorderCollect(node.right, result);
  return result;
}

// ============================================================================
// PREDICT EXERCISES (5) — What does this code output?
// ============================================================================

// --- Predict 1 ---
// What does this print?
function predict1(): void {
  function search(node: TreeNode<number> | null, target: number): boolean {
    if (node === null) return false;
    if (target === node.val) return true;
    if (target < node.val) return search(node.left, target);
    return search(node.right, target);
  }

  //       5
  //      / \
  //     3   8
  //    / \
  //   1   4
  const root = buildTree([5, 3, 8, 1, 4]);
  console.log("Predict 1a:", search(root, 4));
  console.log("Predict 1b:", search(root, 6));
}
// Your prediction: ???

// --- Predict 2 ---
// What does this print?
function predict2(): void {
  function insertBST(root: TreeNode<number> | null, val: number): TreeNode<number> {
    if (root === null) return new TreeNode(val);
    if (val < root.val) root.left = insertBST(root.left, val);
    else if (val > root.val) root.right = insertBST(root.right, val);
    return root;
  }

  let root: TreeNode<number> | null = null;
  for (const val of [5, 3, 7, 1, 4]) {
    root = insertBST(root, val);
  }
  console.log("Predict 2:", inorderCollect(root));
}
// Your prediction: ???

// --- Predict 3 ---
// What does this print?
function predict3(): void {
  function findMin(node: TreeNode<number>): number {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current.val;
  }

  const root = buildTree([10, 5, 15, 2, 7, null, 20]);
  console.log("Predict 3:", findMin(root!));
}
// Your prediction: ???

// --- Predict 4 ---
// What does this print? Is this tree a valid BST?
function predict4(): void {
  function isValidBST(
    node: TreeNode<number> | null,
    min: number,
    max: number
  ): boolean {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
  }

  //       5
  //      / \
  //     1   6
  //        / \
  //       3   7     ← 3 is in right subtree of 5, but 3 < 5!
  const root = buildTree([5, 1, 6, null, null, 3, 7]);
  console.log("Predict 4:", isValidBST(root, -Infinity, Infinity));
}
// Your prediction: ???

// --- Predict 5 ---
// What does this print?
function predict5(): void {
  function countInRange(
    node: TreeNode<number> | null,
    low: number,
    high: number
  ): number {
    if (node === null) return 0;
    if (node.val < low) return countInRange(node.right, low, high);
    if (node.val > high) return countInRange(node.left, low, high);
    return 1 + countInRange(node.left, low, high) + countInRange(node.right, low, high);
  }

  //       8
  //      / \
  //     3   10
  //    / \    \
  //   1   6   14
  const root = buildTree([8, 3, 10, 1, 6, null, 14]);
  console.log("Predict 5:", countInRange(root, 3, 10));
}
// Your prediction: ???

// ============================================================================
// FIX EXERCISES (3) — Find and fix the bug(s)
// ============================================================================

// --- Fix 1 ---
// This BST insert should not add duplicates, but it does.
function fix1_insert(
  root: TreeNode<number> | null,
  val: number
): TreeNode<number> {
  if (root === null) return new TreeNode(val);
  if (val < root.val) {
    root.left = fix1_insert(root.left, val);
  } else { // BUG: should be else if (val > root.val)
    root.right = fix1_insert(root.right, val);
  }
  return root;
}

// Test:
// let root: TreeNode<number> | null = null;
// root = fix1_insert(root, 5);
// root = fix1_insert(root, 3);
// root = fix1_insert(root, 5); // duplicate!
// console.log("Fix 1:", inorderCollect(root)); // Expected: [3, 5] (no duplicate 5)

// --- Fix 2 ---
// This validates BST by only checking direct children — which is WRONG.
function fix2_isValidBST(node: TreeNode<number> | null): boolean {
  if (node === null) return true;
  // BUG: only checks direct children, not entire subtree bounds
  if (node.left !== null && node.left.val >= node.val) return false;
  if (node.right !== null && node.right.val <= node.val) return false;
  return fix2_isValidBST(node.left) && fix2_isValidBST(node.right);
}

// Test:
// const root = buildTree([5, 1, 6, null, null, 3, 7]);
// console.log("Fix 2:", fix2_isValidBST(root)); // Expected: false (3 < 5 but in right subtree)

// --- Fix 3 ---
// This delete function doesn't handle the two-children case properly.
function fix3_deleteNode(
  root: TreeNode<number> | null,
  key: number
): TreeNode<number> | null {
  if (root === null) return null;

  if (key < root.val) {
    root.left = fix3_deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = fix3_deleteNode(root.right, key);
  } else {
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;

    // Two children: find in-order successor
    let successor = root.right;
    while (successor.left !== null) {
      successor = successor.left;
    }
    root.val = successor.val;
    // BUG: should delete successor from right subtree
    root.left = fix3_deleteNode(root.left, successor.val);
  }
  return root;
}

// Test:
// const root = buildTree([5, 3, 7, 2, 4, 6, 8]);
// fix3_deleteNode(root, 5);
// console.log("Fix 3:", inorderCollect(root)); // Expected: [2, 3, 4, 6, 7, 8]

// ============================================================================
// IMPLEMENT EXERCISES (7)
// ============================================================================

// --- Implement 1 ---
// Implement a BST class with insert, search, and delete methods.
class BST {
  root: TreeNode<number> | null = null;

  insert(_val: number): void {
    // TODO: implement
  }

  search(_val: number): boolean {
    // TODO: implement
    return false;
  }

  delete(_val: number): void {
    // TODO: implement
  }

  inorder(): number[] {
    const result: number[] = [];
    function traverse(node: TreeNode<number> | null): void {
      if (node === null) return;
      traverse(node.left);
      result.push(node.val);
      traverse(node.right);
    }
    traverse(this.root);
    return result;
  }
}

// Test:
// const bst = new BST();
// for (const v of [5, 3, 7, 1, 4, 6, 8]) bst.insert(v);
// console.log("Impl 1 inorder:", bst.inorder()); // [1, 3, 4, 5, 6, 7, 8]
// console.log("Impl 1 search 4:", bst.search(4)); // true
// console.log("Impl 1 search 9:", bst.search(9)); // false
// bst.delete(3);
// console.log("Impl 1 after delete 3:", bst.inorder()); // [1, 4, 5, 6, 7, 8]

// --- Implement 2 ---
// Validate if a binary tree is a valid BST.
function isValidBST(root: TreeNode<number> | null): boolean {
  // TODO: implement
  return false;
}

// Test:
// console.log("Impl 2a:", isValidBST(buildTree([2, 1, 3]))); // true
// console.log("Impl 2b:", isValidBST(buildTree([5, 1, 4, null, null, 3, 6]))); // false

// --- Implement 3 ---
// Find the kth smallest element in a BST (1-indexed).
function kthSmallest(_root: TreeNode<number> | null, _k: number): number {
  // TODO: implement
  return -1;
}

// Test:
// const root = buildTree([5, 3, 7, 1, 4]);
// console.log("Impl 3:", kthSmallest(root, 3)); // 4

// --- Implement 4 ---
// Find the lowest common ancestor of two nodes in a BST.
// Both p and q are guaranteed to exist in the BST.
function lowestCommonAncestor(
  _root: TreeNode<number>,
  _p: number,
  _q: number
): number {
  // TODO: implement
  return -1;
}

// Test:
// const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])!;
// console.log("Impl 4a:", lowestCommonAncestor(root, 2, 8)); // 6
// console.log("Impl 4b:", lowestCommonAncestor(root, 2, 4)); // 2

// --- Implement 5 ---
// Convert a sorted array to a height-balanced BST.
function sortedArrayToBST(_nums: number[]): TreeNode<number> | null {
  // TODO: implement
  return null;
}

// Test:
// const bst = sortedArrayToBST([-10, -3, 0, 5, 9]);
// console.log("Impl 5:", inorderCollect(bst)); // [-10, -3, 0, 5, 9]

// --- Implement 6 ---
// Given a BST and a range [low, high], return the sum of all node values
// within the range (inclusive).
function rangeSumBST(
  _root: TreeNode<number> | null,
  _low: number,
  _high: number
): number {
  // TODO: implement
  return 0;
}

// Test:
// const root = buildTree([10, 5, 15, 3, 7, null, 18]);
// console.log("Impl 6:", rangeSumBST(root, 7, 15)); // 32 (7 + 10 + 15)

// --- Implement 7 ---
// Given a BST, find the minimum absolute difference between values of any
// two nodes.
function minDiffInBST(_root: TreeNode<number> | null): number {
  // TODO: implement
  return Infinity;
}

// Test:
// const root = buildTree([4, 2, 6, 1, 3]);
// console.log("Impl 7:", minDiffInBST(root)); // 1 (between 1&2, 2&3, or 3&4)

// ============================================================================
// Runner — uncomment to test
// ============================================================================

// predict1();
// predict2();
// predict3();
// predict4();
// predict5();

export {
  TreeNode,
  buildTree,
  inorderCollect,
  BST,
  isValidBST,
  kthSmallest,
  lowestCommonAncestor,
  sortedArrayToBST,
  rangeSumBST,
  minDiffInBST,
};
