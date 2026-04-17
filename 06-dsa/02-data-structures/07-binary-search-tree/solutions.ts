// ============================================================================
// Binary Search Tree — Solutions
// Run: npx tsx 06-dsa/02-data-structures/07-binary-search-tree/solutions.ts
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
  // search(root, 4) → true (4 exists: 5→3→4)
  // search(root, 6) → false (6 not in tree)
  function search(node: TreeNode<number> | null, target: number): boolean {
    if (node === null) return false;
    if (target === node.val) return true;
    if (target < node.val) return search(node.left, target);
    return search(node.right, target);
  }
  const root = buildTree([5, 3, 8, 1, 4]);
  const a = search(root, 4);
  const b = search(root, 6);
  console.log("Predict 1a:", a, "Predict 1b:", b);
  assert(a === true, "Predict 1a → true");
  assert(b === false, "Predict 1b → false");
}

function solvePredict2(): void {
  // Insert 5,3,7,1,4 → inorder: [1,3,4,5,7]
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
  const result = inorderCollect(root);
  console.log("Predict 2:", result);
  assert(arrEq(result, [1, 3, 4, 5, 7]), "Predict 2 → [1,3,4,5,7]");
}

function solvePredict3(): void {
  // findMin goes all the way left: 10→5→2 → 2
  function findMin(node: TreeNode<number>): number {
    let current = node;
    while (current.left !== null) current = current.left;
    return current.val;
  }
  const root = buildTree([10, 5, 15, 2, 7, null, 20])!;
  const result = findMin(root);
  console.log("Predict 3:", result);
  assert(result === 2, "Predict 3 → 2");
}

function solvePredict4(): void {
  // Tree: [5, 1, 6, null, null, 3, 7]
  // 3 is in right subtree of 5, but 3 < 5 → invalid BST
  // When validating node 3: min=5, max=6 → 3 <= 5 → false
  function isValidBST(node: TreeNode<number> | null, min: number, max: number): boolean {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
  }
  const root = buildTree([5, 1, 6, null, null, 3, 7]);
  const result = isValidBST(root, -Infinity, Infinity);
  console.log("Predict 4:", result);
  assert(result === false, "Predict 4 → false");
}

function solvePredict5(): void {
  // countInRange with [3, 10] on tree [8,3,10,1,6,null,14]
  // Nodes in range: 3, 6, 8, 10 → 4
  function countInRange(node: TreeNode<number> | null, low: number, high: number): number {
    if (node === null) return 0;
    if (node.val < low) return countInRange(node.right, low, high);
    if (node.val > high) return countInRange(node.left, low, high);
    return 1 + countInRange(node.left, low, high) + countInRange(node.right, low, high);
  }
  const root = buildTree([8, 3, 10, 1, 6, null, 14]);
  const result = countInRange(root, 3, 10);
  console.log("Predict 5:", result);
  assert(result === 4, "Predict 5 → 4");
}

// ============================================================================
// FIX SOLUTIONS
// ============================================================================

function solveFix1(): void {
  // Bug: `else` catches val === root.val, inserting duplicates to the right.
  // Fix: use `else if (val > root.val)`.
  function fixedInsert(root: TreeNode<number> | null, val: number): TreeNode<number> {
    if (root === null) return new TreeNode(val);
    if (val < root.val) {
      root.left = fixedInsert(root.left, val);
    } else if (val > root.val) { // FIX: else if instead of else
      root.right = fixedInsert(root.right, val);
    }
    // val === root.val: do nothing (skip duplicate)
    return root;
  }

  let root: TreeNode<number> | null = null;
  root = fixedInsert(root, 5);
  root = fixedInsert(root, 3);
  root = fixedInsert(root, 5); // duplicate
  const result = inorderCollect(root);
  console.log("Fix 1:", result);
  assert(arrEq(result, [3, 5]), "Fix 1 → [3, 5] (no duplicate)");
}

function solveFix2(): void {
  // Bug: only checks direct children, not subtree bounds.
  // Fix: pass min/max range.
  function isValidBST(
    node: TreeNode<number> | null,
    min: number = -Infinity,
    max: number = Infinity
  ): boolean {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
  }

  const root = buildTree([5, 1, 6, null, null, 3, 7]);
  const result = isValidBST(root);
  console.log("Fix 2:", result);
  assert(result === false, "Fix 2 → false");
}

function solveFix3(): void {
  // Bug: deletes successor from left subtree instead of right.
  // Fix: root.right = deleteNode(root.right, successor.val)
  function deleteNode(root: TreeNode<number> | null, key: number): TreeNode<number> | null {
    if (root === null) return null;
    if (key < root.val) {
      root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
      root.right = deleteNode(root.right, key);
    } else {
      if (root.left === null) return root.right;
      if (root.right === null) return root.left;
      let successor = root.right;
      while (successor.left !== null) successor = successor.left;
      root.val = successor.val;
      root.right = deleteNode(root.right, successor.val); // FIX: right, not left
    }
    return root;
  }

  const root = buildTree([5, 3, 7, 2, 4, 6, 8]);
  deleteNode(root, 5);
  const result = inorderCollect(root);
  console.log("Fix 3:", result);
  assert(arrEq(result, [2, 3, 4, 6, 7, 8]), "Fix 3 → [2,3,4,6,7,8]");
}

// ============================================================================
// IMPLEMENT SOLUTIONS
// ============================================================================

// --- Implement 1: BST class ---
class BST {
  root: TreeNode<number> | null = null;

  insert(val: number): void {
    this.root = this._insert(this.root, val);
  }

  private _insert(node: TreeNode<number> | null, val: number): TreeNode<number> {
    if (node === null) return new TreeNode(val);
    if (val < node.val) node.left = this._insert(node.left, val);
    else if (val > node.val) node.right = this._insert(node.right, val);
    return node;
  }

  search(val: number): boolean {
    let current = this.root;
    while (current !== null) {
      if (val === current.val) return true;
      if (val < current.val) current = current.left;
      else current = current.right;
    }
    return false;
  }

  delete(val: number): void {
    this.root = this._delete(this.root, val);
  }

  private _delete(node: TreeNode<number> | null, val: number): TreeNode<number> | null {
    if (node === null) return null;
    if (val < node.val) {
      node.left = this._delete(node.left, val);
    } else if (val > node.val) {
      node.right = this._delete(node.right, val);
    } else {
      if (node.left === null) return node.right;
      if (node.right === null) return node.left;
      let successor = node.right;
      while (successor.left !== null) successor = successor.left;
      node.val = successor.val;
      node.right = this._delete(node.right, successor.val);
    }
    return node;
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

function solveImpl1(): void {
  const bst = new BST();
  for (const v of [5, 3, 7, 1, 4, 6, 8]) bst.insert(v);
  assert(arrEq(bst.inorder(), [1, 3, 4, 5, 6, 7, 8]), "Impl 1: inorder");
  assert(bst.search(4) === true, "Impl 1: search 4 → true");
  assert(bst.search(9) === false, "Impl 1: search 9 → false");
  bst.delete(3);
  assert(arrEq(bst.inorder(), [1, 4, 5, 6, 7, 8]), "Impl 1: after delete 3");
  bst.delete(5);
  assert(arrEq(bst.inorder(), [1, 4, 6, 7, 8]), "Impl 1: after delete 5 (root)");
}

// --- Implement 2: Validate BST ---
function isValidBST(root: TreeNode<number> | null): boolean {
  function validate(node: TreeNode<number> | null, min: number, max: number): boolean {
    if (node === null) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
  }
  return validate(root, -Infinity, Infinity);
}

function solveImpl2(): void {
  assert(isValidBST(buildTree([2, 1, 3])) === true, "Impl 2: [2,1,3] → true");
  assert(isValidBST(buildTree([5, 1, 4, null, null, 3, 6])) === false, "Impl 2: invalid → false");
  assert(isValidBST(null) === true, "Impl 2: null → true");
  assert(isValidBST(buildTree([1])) === true, "Impl 2: single → true");
}

// --- Implement 3: Kth smallest ---
function kthSmallest(root: TreeNode<number> | null, k: number): number {
  let count = 0;
  let result = -1;

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

function solveImpl3(): void {
  const root = buildTree([5, 3, 7, 1, 4]);
  assert(kthSmallest(root, 1) === 1, "Impl 3: k=1 → 1");
  assert(kthSmallest(root, 3) === 4, "Impl 3: k=3 → 4");
  assert(kthSmallest(root, 5) === 7, "Impl 3: k=5 → 7");
}

// --- Implement 4: Lowest Common Ancestor ---
function lowestCommonAncestor(root: TreeNode<number>, p: number, q: number): number {
  let current: TreeNode<number> = root;
  while (true) {
    if (p < current.val && q < current.val) {
      current = current.left!;
    } else if (p > current.val && q > current.val) {
      current = current.right!;
    } else {
      return current.val;
    }
  }
}

function solveImpl4(): void {
  const root = buildTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])!;
  assert(lowestCommonAncestor(root, 2, 8) === 6, "Impl 4: LCA(2,8) → 6");
  assert(lowestCommonAncestor(root, 2, 4) === 2, "Impl 4: LCA(2,4) → 2");
  assert(lowestCommonAncestor(root, 3, 5) === 4, "Impl 4: LCA(3,5) → 4");
}

// --- Implement 5: Sorted array to BST ---
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

function solveImpl5(): void {
  const bst = sortedArrayToBST([-10, -3, 0, 5, 9]);
  const result = inorderCollect(bst);
  assert(arrEq(result, [-10, -3, 0, 5, 9]), "Impl 5: inorder preserved");
  // Check it's balanced: root should be 0 (middle)
  assert(bst?.val === 0, "Impl 5: root is middle element");
}

// --- Implement 6: Range sum BST ---
function rangeSumBST(root: TreeNode<number> | null, low: number, high: number): number {
  if (root === null) return 0;
  if (root.val < low) return rangeSumBST(root.right, low, high);
  if (root.val > high) return rangeSumBST(root.left, low, high);
  return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}

function solveImpl6(): void {
  const root = buildTree([10, 5, 15, 3, 7, null, 18]);
  assert(rangeSumBST(root, 7, 15) === 32, "Impl 6: range [7,15] → 32");
  assert(rangeSumBST(root, 3, 7) === 15, "Impl 6: range [3,7] → 15");
  assert(rangeSumBST(null, 1, 10) === 0, "Impl 6: null → 0");
}

// --- Implement 7: Min diff in BST ---
function minDiffInBST(root: TreeNode<number> | null): number {
  let prev = -Infinity;
  let minDiff = Infinity;

  function inorder(node: TreeNode<number> | null): void {
    if (node === null) return;
    inorder(node.left);
    minDiff = Math.min(minDiff, node.val - prev);
    prev = node.val;
    inorder(node.right);
  }

  inorder(root);
  return minDiff;
}

function solveImpl7(): void {
  const root = buildTree([4, 2, 6, 1, 3]);
  assert(minDiffInBST(root) === 1, "Impl 7: min diff → 1");

  const root2 = buildTree([10, 5, 20]);
  assert(minDiffInBST(root2) === 5, "Impl 7: [10,5,20] → 5");
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

console.log("\n✅ All BST solutions executed.");
