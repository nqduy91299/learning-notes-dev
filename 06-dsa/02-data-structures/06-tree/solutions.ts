// ============================================================================
// Tree — Solutions
// Run: npx tsx 06-dsa/02-data-structures/06-tree/solutions.ts
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

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}`);
  }
}

function arrEq(a: unknown[], b: unknown[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ============================================================================
// PREDICT SOLUTIONS
// ============================================================================

function solvePredict1(): void {
  // mystery counts total nodes in the tree.
  // Tree: [1, 2, 3, null, 4] → nodes: 1, 2, 3, 4 → 4
  function mystery(node: TreeNode<number> | null): number {
    if (node === null) return 0;
    return 1 + mystery(node.left) + mystery(node.right);
  }
  const root = buildTree([1, 2, 3, null, 4, null, null]);
  const result = mystery(root);
  console.log("Predict 1:", result);
  assert(result === 4, "Predict 1 → 4");
}

function solvePredict2(): void {
  // Inorder traversal of [5, 3, 7, 1, 4]:
  //       5
  //      / \
  //     3   7
  //    / \
  //   1   4
  // Inorder: 1, 3, 4, 5, 7
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
  assert(arrEq(result, [1, 3, 4, 5, 7]), "Predict 2 → [1,3,4,5,7]");
}

function solvePredict3(): void {
  // Height (edge-count) of [1, 2, 3, 4, 5]:
  //       1
  //      / \
  //     2   3
  //    / \
  //   4   5
  // Height = 2 (edges from root to leaf 4 or 5)
  function height(node: TreeNode<number> | null): number {
    if (node === null) return -1;
    return 1 + Math.max(height(node.left), height(node.right));
  }
  const root = buildTree([1, 2, 3, 4, 5]);
  const result = height(root);
  console.log("Predict 3:", result);
  assert(result === 2, "Predict 3 → 2");
}

function solvePredict4(): void {
  // DFS level grouping of [1, 2, 3, 4, null, null, 5]:
  //       1
  //      / \
  //     2   3
  //    /     \
  //   4       5
  // levels: [[1], [2, 3], [4, 5]]
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
  assert(arrEq(levels, [[1], [2, 3], [4, 5]]), "Predict 4 → [[1],[2,3],[4,5]]");
}

function solvePredict5(): void {
  // Leaf count of [1, 2, 3, null, null, 4, 5]:
  //       1
  //      / \
  //     2   3
  //        / \
  //       4   5
  // Leaves: 2, 4, 5 → 3
  function leafCount(node: TreeNode<number> | null): number {
    if (node === null) return 0;
    if (node.left === null && node.right === null) return 1;
    return leafCount(node.left) + leafCount(node.right);
  }
  const root = buildTree([1, 2, 3, null, null, 4, 5]);
  const result = leafCount(root);
  console.log("Predict 5:", result);
  assert(result === 3, "Predict 5 → 3");
}

// ============================================================================
// FIX SOLUTIONS
// ============================================================================

function solveFix1(): void {
  // Bug: returns 0 for null, so negative values lose to 0.
  // Fix: return -Infinity for null.
  function maxValue(node: TreeNode<number> | null): number {
    if (node === null) return -Infinity;
    const leftMax = maxValue(node.left);
    const rightMax = maxValue(node.right);
    return Math.max(node.val, leftMax, rightMax);
  }

  const root = buildTree([-5, -3, -1, -10, -2]);
  const result = maxValue(root);
  console.log("Fix 1:", result);
  assert(result === -1, "Fix 1 → -1");
}

function solveFix2(): void {
  // Bug: queue.length changes during the loop because we shift and push.
  // Fix: capture size before the loop.
  function levelOrder(root: TreeNode<number> | null): number[][] {
    if (root === null) return [];
    const result: number[][] = [];
    const queue: TreeNode<number>[] = [root];

    while (queue.length > 0) {
      const size = queue.length; // FIX: capture size
      const currentLevel: number[] = [];
      for (let i = 0; i < size; i++) {
        const node = queue.shift()!;
        currentLevel.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      result.push(currentLevel);
    }
    return result;
  }

  const root = buildTree([1, 2, 3, 4, 5]);
  const result = levelOrder(root);
  console.log("Fix 2:", JSON.stringify(result));
  assert(arrEq(result, [[1], [2, 3], [4, 5]]), "Fix 2 → [[1],[2,3],[4,5]]");
}

function solveFix3(): void {
  // Bug: when one is null and other isn't, returns true instead of false.
  // Fix: return false when only one is null.
  function isSameTree(
    p: TreeNode<number> | null,
    q: TreeNode<number> | null
  ): boolean {
    if (p === null && q === null) return true;
    if (p === null || q === null) return false; // FIX: false, not true
    if (p.val !== q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
  }

  const t1 = buildTree([1, 2, 3]);
  const t2 = buildTree([1, 2, null]);
  const result = isSameTree(t1, t2);
  console.log("Fix 3:", result);
  assert(result === false, "Fix 3 → false");
}

// ============================================================================
// IMPLEMENT SOLUTIONS
// ============================================================================

// --- Implement 1: TreeNode class ---
class MyTreeNode<T> {
  val: T;
  left: MyTreeNode<T> | null;
  right: MyTreeNode<T> | null;

  constructor(val: T, left?: MyTreeNode<T> | null, right?: MyTreeNode<T> | null) {
    this.val = val;
    this.left = left ?? null;
    this.right = right ?? null;
  }
}

function solveImpl1(): void {
  const node = new MyTreeNode(10);
  assert(node.val === 10 && node.left === null && node.right === null, "Impl 1: MyTreeNode");

  const withChildren = new MyTreeNode(1, new MyTreeNode(2), new MyTreeNode(3));
  assert(withChildren.left?.val === 2 && withChildren.right?.val === 3, "Impl 1: with children");
}

// --- Implement 2: Preorder traversal ---
function preorderTraversal(root: TreeNode<number> | null): number[] {
  const result: number[] = [];

  function dfs(node: TreeNode<number> | null): void {
    if (node === null) return;
    result.push(node.val);
    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  return result;
}

function solveImpl2(): void {
  const root = buildTree([1, 2, 3, 4, 5]);
  const result = preorderTraversal(root);
  console.log("Impl 2:", result);
  assert(arrEq(result, [1, 2, 4, 5, 3]), "Impl 2: preorder");
}

// --- Implement 3: Inorder traversal ---
function inorderTraversal(root: TreeNode<number> | null): number[] {
  const result: number[] = [];

  function dfs(node: TreeNode<number> | null): void {
    if (node === null) return;
    dfs(node.left);
    result.push(node.val);
    dfs(node.right);
  }

  dfs(root);
  return result;
}

function solveImpl3(): void {
  const root = buildTree([1, 2, 3, 4, 5]);
  const result = inorderTraversal(root);
  console.log("Impl 3:", result);
  assert(arrEq(result, [4, 2, 5, 1, 3]), "Impl 3: inorder");
}

// --- Implement 4: Postorder traversal ---
function postorderTraversal(root: TreeNode<number> | null): number[] {
  const result: number[] = [];

  function dfs(node: TreeNode<number> | null): void {
    if (node === null) return;
    dfs(node.left);
    dfs(node.right);
    result.push(node.val);
  }

  dfs(root);
  return result;
}

function solveImpl4(): void {
  const root = buildTree([1, 2, 3, 4, 5]);
  const result = postorderTraversal(root);
  console.log("Impl 4:", result);
  assert(arrEq(result, [4, 5, 2, 3, 1]), "Impl 4: postorder");
}

// --- Implement 5: Level-order traversal ---
function levelOrderTraversal(root: TreeNode<number> | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode<number>[] = [root];

  while (queue.length > 0) {
    const size = queue.length;
    const level: number[] = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

function solveImpl5(): void {
  const root = buildTree([3, 9, 20, null, null, 15, 7]);
  const result = levelOrderTraversal(root);
  console.log("Impl 5:", JSON.stringify(result));
  assert(arrEq(result, [[3], [9, 20], [15, 7]]), "Impl 5: level-order");
}

// --- Implement 6: Max depth ---
function maxDepth(root: TreeNode<number> | null): number {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

function solveImpl6(): void {
  const root = buildTree([3, 9, 20, null, null, 15, 7]);
  const result = maxDepth(root);
  console.log("Impl 6:", result);
  assert(result === 3, "Impl 6: maxDepth → 3");

  assert(maxDepth(null) === 0, "Impl 6: empty → 0");
  assert(maxDepth(buildTree([1])) === 1, "Impl 6: single → 1");
}

// --- Implement 7: Invert binary tree ---
function invertTree(root: TreeNode<number> | null): TreeNode<number> | null {
  if (root === null) return null;
  const temp = root.left;
  root.left = invertTree(root.right);
  root.right = invertTree(temp);
  return root;
}

function solveImpl7(): void {
  const root = buildTree([4, 2, 7, 1, 3, 6, 9]);
  const inverted = invertTree(root);
  const result = preorderTraversal(inverted);
  console.log("Impl 7:", result);
  assert(arrEq(result, [4, 7, 9, 6, 2, 3, 1]), "Impl 7: invert tree");
}

// --- Implement 8: Is symmetric ---
function isSymmetric(root: TreeNode<number> | null): boolean {
  if (root === null) return true;

  function isMirror(
    left: TreeNode<number> | null,
    right: TreeNode<number> | null
  ): boolean {
    if (left === null && right === null) return true;
    if (left === null || right === null) return false;
    return (
      left.val === right.val &&
      isMirror(left.left, right.right) &&
      isMirror(left.right, right.left)
    );
  }

  return isMirror(root.left, root.right);
}

function solveImpl8(): void {
  const sym = buildTree([1, 2, 2, 3, 4, 4, 3]);
  const notSym = buildTree([1, 2, 2, null, 3, null, 3]);
  console.log("Impl 8a:", isSymmetric(sym));
  console.log("Impl 8b:", isSymmetric(notSym));
  assert(isSymmetric(sym) === true, "Impl 8: symmetric → true");
  assert(isSymmetric(notSym) === false, "Impl 8: not symmetric → false");
}

// --- Implement 9: Path sum ---
function hasPathSum(
  root: TreeNode<number> | null,
  targetSum: number
): boolean {
  if (root === null) return false;
  if (root.left === null && root.right === null) {
    return root.val === targetSum;
  }
  const remaining = targetSum - root.val;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}

function solveImpl9(): void {
  const root = buildTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]);
  const result = hasPathSum(root, 22);
  console.log("Impl 9:", result);
  assert(result === true, "Impl 9: path sum 22 → true");
  assert(hasPathSum(root, 100) === false, "Impl 9: path sum 100 → false");
  assert(hasPathSum(null, 0) === false, "Impl 9: null tree → false");
}

// --- Implement 10: Diameter ---
function diameterOfBinaryTree(root: TreeNode<number> | null): number {
  let maxDiameter = 0;

  function height(node: TreeNode<number> | null): number {
    if (node === null) return 0;
    const leftH = height(node.left);
    const rightH = height(node.right);
    maxDiameter = Math.max(maxDiameter, leftH + rightH);
    return 1 + Math.max(leftH, rightH);
  }

  height(root);
  return maxDiameter;
}

function solveImpl10(): void {
  const root = buildTree([1, 2, 3, 4, 5]);
  const result = diameterOfBinaryTree(root);
  console.log("Impl 10:", result);
  assert(result === 3, "Impl 10: diameter → 3");

  assert(diameterOfBinaryTree(buildTree([1, 2])) === 1, "Impl 10: two nodes → 1");
  assert(diameterOfBinaryTree(null) === 0, "Impl 10: null → 0");
}

// --- Implement 11: Count nodes ---
function countNodes(root: TreeNode<number> | null): number {
  if (root === null) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

function solveImpl11(): void {
  const root = buildTree([1, 2, 3, 4, 5, 6]);
  const result = countNodes(root);
  console.log("Impl 11:", result);
  assert(result === 6, "Impl 11: count → 6");
  assert(countNodes(null) === 0, "Impl 11: null → 0");
}

// ============================================================================
// Runner
// ============================================================================

console.log("=== PREDICT ===");
solvePredict1();
solvePredict2();
solvePredict3();
solvePredict4();
solvePredict5();

console.log("\n=== FIX ===");
solveFix1();
solveFix2();
solveFix3();

console.log("\n=== IMPLEMENT ===");
solveImpl1();
solveImpl2();
solveImpl3();
solveImpl4();
solveImpl5();
solveImpl6();
solveImpl7();
solveImpl8();
solveImpl9();
solveImpl10();
solveImpl11();

console.log("\n✅ All tree solutions executed.");
