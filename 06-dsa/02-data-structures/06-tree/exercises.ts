// ============================================================================
// Tree — Exercises (18 total: 5 predict, 3 fix, 10 implement)
// Run: npx tsx 06-dsa/02-data-structures/06-tree/exercises.ts
// ============================================================================

// --- TreeNode class (provided) ---

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

// --- Helper to build trees from arrays (null = no node) ---

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

// ============================================================================
// PREDICT EXERCISES (5) — What does this code output?
// ============================================================================

// --- Predict 1 ---
// What does this print?
function predict1(): void {
  function mystery(node: TreeNode<number> | null): number {
    if (node === null) return 0;
    return 1 + mystery(node.left) + mystery(node.right);
  }

  const root = buildTree([1, 2, 3, null, 4, null, null]);
  console.log("Predict 1:", mystery(root));
}
// Your prediction: ???

// --- Predict 2 ---
// What does this print?
function predict2(): void {
  const result: number[] = [];

  function traverse(node: TreeNode<number> | null): void {
    if (node === null) return;
    traverse(node.left);
    result.push(node.val);
    traverse(node.right);
  }

  const root = buildTree([5, 3, 7, 1, 4]);
  traverse(root);
  console.log("Predict 2:", result);
}
// Your prediction: ???

// --- Predict 3 ---
// What does this print?
function predict3(): void {
  function height(node: TreeNode<number> | null): number {
    if (node === null) return -1;
    return 1 + Math.max(height(node.left), height(node.right));
  }

  const root = buildTree([1, 2, 3, 4, 5]);
  console.log("Predict 3:", height(root));
}
// Your prediction: ???

// --- Predict 4 ---
// What does this print?
function predict4(): void {
  const levels: number[][] = [];

  function dfs(node: TreeNode<number> | null, depth: number): void {
    if (node === null) return;
    if (levels.length === depth) levels.push([]);
    levels[depth].push(node.val);
    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }

  const root = buildTree([1, 2, 3, 4, null, null, 5]);
  dfs(root, 0);
  console.log("Predict 4:", JSON.stringify(levels));
}
// Your prediction: ???

// --- Predict 5 ---
// What does this print?
function predict5(): void {
  function leafCount(node: TreeNode<number> | null): number {
    if (node === null) return 0;
    if (node.left === null && node.right === null) return 1;
    return leafCount(node.left) + leafCount(node.right);
  }

  const root = buildTree([1, 2, 3, null, null, 4, 5]);
  console.log("Predict 5:", leafCount(root));
}
// Your prediction: ???

// ============================================================================
// FIX EXERCISES (3) — Find and fix the bug(s)
// ============================================================================

// --- Fix 1 ---
// This should return the maximum value in the tree, but it doesn't work.
function fix1_maxValue(node: TreeNode<number> | null): number {
  if (node === null) return 0; // BUG
  const leftMax = fix1_maxValue(node.left);
  const rightMax = fix1_maxValue(node.right);
  return Math.max(node.val, leftMax, rightMax);
}

// Test:
// const root = buildTree([-5, -3, -1, -10, -2]);
// console.log("Fix 1:", fix1_maxValue(root)); // Expected: -1

// --- Fix 2 ---
// This should do level-order traversal but gives wrong results.
function fix2_levelOrder(root: TreeNode<number> | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode<number>[] = [root];

  while (queue.length > 0) {
    const currentLevel: number[] = [];
    for (let i = 0; i < queue.length; i++) { // BUG
      const node = queue.shift()!;
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}

// Test:
// const root = buildTree([1, 2, 3, 4, 5]);
// console.log("Fix 2:", JSON.stringify(fix2_levelOrder(root)));
// Expected: [[1],[2,3],[4,5]]

// --- Fix 3 ---
// This should check if two trees are identical, but it has a logic error.
function fix3_isSameTree(
  p: TreeNode<number> | null,
  q: TreeNode<number> | null
): boolean {
  if (p === null && q === null) return true;
  if (p === null || q === null) return true; // BUG
  if (p.val !== q.val) return false;
  return fix3_isSameTree(p.left, q.left) && fix3_isSameTree(p.right, q.right);
}

// Test:
// const t1 = buildTree([1, 2, 3]);
// const t2 = buildTree([1, 2, null]);
// console.log("Fix 3:", fix3_isSameTree(t1, t2)); // Expected: false

// ============================================================================
// IMPLEMENT EXERCISES (10)
// ============================================================================

// --- Implement 1 ---
// Implement a TreeNode class with val, left, right properties.
// Already provided above — implement your own version here for practice.

class MyTreeNode<T> {
  // TODO: implement
  val!: T;
  left!: MyTreeNode<T> | null;
  right!: MyTreeNode<T> | null;
}

// Test:
// const node = new MyTreeNode(10);
// console.log(node.val === 10, node.left === null, node.right === null);

// --- Implement 2 ---
// Preorder traversal (recursive). Return array of values.
function preorderTraversal(root: TreeNode<number> | null): number[] {
  // TODO: implement
  return [];
}

// Test:
// const root = buildTree([1, 2, 3, 4, 5]);
// console.log("Impl 2:", preorderTraversal(root)); // [1, 2, 4, 5, 3]

// --- Implement 3 ---
// Inorder traversal (recursive). Return array of values.
function inorderTraversal(root: TreeNode<number> | null): number[] {
  // TODO: implement
  return [];
}

// Test:
// const root = buildTree([1, 2, 3, 4, 5]);
// console.log("Impl 3:", inorderTraversal(root)); // [4, 2, 5, 1, 3]

// --- Implement 4 ---
// Postorder traversal (recursive). Return array of values.
function postorderTraversal(root: TreeNode<number> | null): number[] {
  // TODO: implement
  return [];
}

// Test:
// const root = buildTree([1, 2, 3, 4, 5]);
// console.log("Impl 4:", postorderTraversal(root)); // [4, 5, 2, 3, 1]

// --- Implement 5 ---
// Level-order traversal. Return array of arrays (each inner array = one level).
function levelOrderTraversal(root: TreeNode<number> | null): number[][] {
  // TODO: implement
  return [];
}

// Test:
// const root = buildTree([3, 9, 20, null, null, 15, 7]);
// console.log("Impl 5:", JSON.stringify(levelOrderTraversal(root)));
// Expected: [[3],[9,20],[15,7]]

// --- Implement 6 ---
// Return the maximum depth of a binary tree (number of nodes on longest
// root-to-leaf path).
function maxDepth(root: TreeNode<number> | null): number {
  // TODO: implement
  return 0;
}

// Test:
// const root = buildTree([3, 9, 20, null, null, 15, 7]);
// console.log("Impl 6:", maxDepth(root)); // 3

// --- Implement 7 ---
// Invert a binary tree (mirror it). Return the root.
function invertTree(root: TreeNode<number> | null): TreeNode<number> | null {
  // TODO: implement
  return root;
}

// Test:
// const root = buildTree([4, 2, 7, 1, 3, 6, 9]);
// const inverted = invertTree(root);
// console.log("Impl 7:", preorderTraversal(inverted)); // [4, 7, 9, 6, 2, 3, 1]

// --- Implement 8 ---
// Check if a binary tree is symmetric (mirror of itself).
function isSymmetric(root: TreeNode<number> | null): boolean {
  // TODO: implement
  return false;
}

// Test:
// const sym = buildTree([1, 2, 2, 3, 4, 4, 3]);
// const notSym = buildTree([1, 2, 2, null, 3, null, 3]);
// console.log("Impl 8a:", isSymmetric(sym));    // true
// console.log("Impl 8b:", isSymmetric(notSym)); // false

// --- Implement 9 ---
// Given a binary tree and a target sum, return true if there is a root-to-leaf
// path where values sum to target.
function hasPathSum(
  root: TreeNode<number> | null,
  targetSum: number
): boolean {
  // TODO: implement
  return false;
}

// Test:
// const root = buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
// console.log("Impl 9:", hasPathSum(root, 22)); // true (5→4→11→2)

// --- Implement 10 ---
// Return the diameter of the binary tree (longest path between any two nodes,
// measured in number of edges).
function diameterOfBinaryTree(root: TreeNode<number> | null): number {
  // TODO: implement
  return 0;
}

// Test:
// const root = buildTree([1, 2, 3, 4, 5]);
// console.log("Impl 10:", diameterOfBinaryTree(root)); // 3

// --- Implement 11 (Bonus) ---
// Count total number of nodes in a binary tree.
function countNodes(root: TreeNode<number> | null): number {
  // TODO: implement
  return 0;
}

// Test:
// const root = buildTree([1, 2, 3, 4, 5, 6]);
// console.log("Impl 11:", countNodes(root)); // 6

// ============================================================================
// Runner — uncomment to test
// ============================================================================

// predict1();
// predict2();
// predict3();
// predict4();
// predict5();

// console.log("Fix 1:", fix1_maxValue(buildTree([-5, -3, -1, -10, -2])));
// console.log("Fix 2:", JSON.stringify(fix2_levelOrder(buildTree([1, 2, 3, 4, 5]))));
// console.log("Fix 3:", fix3_isSameTree(buildTree([1, 2, 3]), buildTree([1, 2, null])));

export {
  TreeNode,
  buildTree,
  MyTreeNode,
  preorderTraversal,
  inorderTraversal,
  postorderTraversal,
  levelOrderTraversal,
  maxDepth,
  invertTree,
  isSymmetric,
  hasPathSum,
  diameterOfBinaryTree,
  countNodes,
};
