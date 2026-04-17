// ============================================================================
// Recursion — Solutions
// ============================================================================
// Config: ES2022, strict mode, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ---------------------------------------------------------------------------
// FIX 1: Buggy Fibonacci — FIXED
// BUG: `fib(0)` returned 1 instead of 0.
// FIX: `if (n === 0) return 0`
// Complexity: O(2^n) time | O(n) space (call stack)
// ---------------------------------------------------------------------------
function fibFixed(n: number): number {
  if (n === 0) return 0; // FIX: was return 1
  if (n === 1) return 1;
  return fibFixed(n - 1) + fibFixed(n - 2);
}

// ---------------------------------------------------------------------------
// FIX 2: Buggy Flatten — FIXED
// BUG: Used `result.push(...)` instead of `result.push(...flatten(item))`.
//      push() adds the whole array as a single element; spread pushes each element.
// Complexity: O(n) time | O(d) space where d = max depth
// ---------------------------------------------------------------------------
function flattenFixed(arr: unknown[]): unknown[] {
  const result: unknown[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flattenFixed(item)); // FIX: spread the results
    } else {
      result.push(item);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// FIX 3: Buggy Power — FIXED
// BUG 1: Odd exponent case used `buggyPower(base, exp)` — no reduction!
// BUG 2: Even case computed `power(base, exp/2)` twice — inefficient but not
//         incorrect. Store in variable for O(log n).
// FIX: `base * power(base, exp - 1)` for odd case.
// Complexity: O(log n) time | O(log n) space
// ---------------------------------------------------------------------------
function powerFixed(base: number, exp: number): number {
  if (exp === 0) return 1;
  if (exp % 2 === 0) {
    const half = powerFixed(base, exp / 2);
    return half * half; // FIX: compute once, multiply
  }
  return base * powerFixed(base, exp - 1); // FIX: was `exp` (no reduction)
}

// ---------------------------------------------------------------------------
// IMPLEMENT 1: Factorial
// Complexity: O(n) time | O(n) space (call stack)
// ---------------------------------------------------------------------------
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ---------------------------------------------------------------------------
// IMPLEMENT 2: Fibonacci with Memoization
// Complexity: O(n) time | O(n) space
// ---------------------------------------------------------------------------
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (memo.has(n)) return memo.get(n)!;

  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 3: Power Function (Fast Exponentiation)
// Complexity: O(log n) time | O(log n) space
// ---------------------------------------------------------------------------
function power(base: number, exp: number): number {
  // Handle negative exponents
  if (exp < 0) {
    return 1 / power(base, -exp);
  }

  // Base cases
  if (exp === 0) return 1;
  if (exp === 1) return base;

  // Even exponent: x^n = (x^(n/2))^2
  if (exp % 2 === 0) {
    const half = power(base, exp / 2);
    return half * half;
  }

  // Odd exponent: x^n = x * x^(n-1)
  return base * power(base, exp - 1);
}

// ---------------------------------------------------------------------------
// IMPLEMENT 4: Flatten Nested Array
// Complexity: O(n) time | O(d) space where d = max nesting depth
// ---------------------------------------------------------------------------
function flatten(arr: unknown[]): unknown[] {
  const result: unknown[] = [];

  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 5: Deep Clone
// Complexity: O(n) time | O(n) space where n = total number of values
// ---------------------------------------------------------------------------
type Cloneable = string | number | boolean | null | undefined | CloneableArray | CloneableObject;
interface CloneableArray extends Array<Cloneable> {}
interface CloneableObject { [key: string]: Cloneable }

function deepClone(value: Cloneable): Cloneable {
  // Primitives and null — return directly
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  // Arrays
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  // Objects
  const result: CloneableObject = {};
  for (const key of Object.keys(value)) {
    result[key] = deepClone((value as CloneableObject)[key]);
  }
  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 6: Generate All Subsets (Backtracking)
// Complexity: O(2^n * n) time | O(2^n * n) space
// ---------------------------------------------------------------------------
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    result.push([...current]); // snapshot current subset

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);       // choose
      backtrack(i + 1, current);   // explore
      current.pop();               // un-choose (backtrack)
    }
  }

  backtrack(0, []);
  return result;
}

// ---------------------------------------------------------------------------
// IMPLEMENT 7: Tower of Hanoi
// Complexity: O(2^n) time (2^n - 1 moves) | O(n) space (call stack)
//
// Algorithm:
//   1. Move n-1 disks from source to auxiliary (using target as temp).
//   2. Move the largest disk from source to target.
//   3. Move n-1 disks from auxiliary to target (using source as temp).
// ---------------------------------------------------------------------------
function towerOfHanoi(
  n: number,
  source: string,
  target: string,
  auxiliary: string
): Array<[string, string]> {
  const moves: Array<[string, string]> = [];

  function solve(
    disks: number,
    from: string,
    to: string,
    aux: string
  ): void {
    if (disks === 0) return;

    // Move n-1 disks from source to auxiliary
    solve(disks - 1, from, aux, to);

    // Move largest disk to target
    moves.push([from, to]);

    // Move n-1 disks from auxiliary to target
    solve(disks - 1, aux, to, from);
  }

  solve(n, source, target, auxiliary);
  return moves;
}

// ---------------------------------------------------------------------------
// BONUS: Recursive String Reversal
// Complexity: O(n^2) time (due to string slicing) | O(n) space
// ---------------------------------------------------------------------------
function reverseString(s: string): string {
  if (s.length <= 1) return s;
  return reverseString(s.slice(1)) + s[0];
}

// ---------------------------------------------------------------------------
// BONUS: Generate Permutations
// Complexity: O(n! * n) time | O(n! * n) space
// ---------------------------------------------------------------------------
function permutations(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(current: number[], remaining: number[]): void {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      const next = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      backtrack(current, next);
      current.pop();
    }
  }

  backtrack([], nums);
  return result;
}

// ---------------------------------------------------------------------------
// RUNNER
// ---------------------------------------------------------------------------
function runAll(): void {
  console.log("=== FIX SOLUTIONS ===");
  console.log("Fix 1 (Fib):", [0, 1, 2, 3, 4, 5, 6].map(fibFixed));
  console.log("Fix 2 (Flatten):", flattenFixed([1, [2, [3, 4], 5], 6]));
  console.log("Fix 3 (Power):", powerFixed(2, 10));

  console.log("\n=== PREDICT ANSWERS ===");
  console.log("P1: factorial(5) stack depth = 5. Returns: 1→2→6→24→120");
  console.log("P2: fib(6) = 8, total calls = 25");
  console.log("P3: Processing: 10, 20, 30. Return value: 60");
  console.log("P4: power(2,5): 4 multiplications. Result: 32");
  console.log("    2*power(2,4) → half=power(2,2) → half=power(2,1) → 2*power(2,0)=2");
  console.log("    power(2,1)=2, power(2,2)=4, power(2,4)=16, power(2,5)=32");
  console.log("P5: Subsets of [1,2,3]: [], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]");

  console.log("\n=== IMPLEMENT SOLUTIONS ===");
  console.log("Impl 1a:", factorial(0));
  console.log("Impl 1b:", factorial(1));
  console.log("Impl 1c:", factorial(5));
  console.log("Impl 1d:", factorial(10));

  console.log("Impl 2a:", fibMemo(0));
  console.log("Impl 2b:", fibMemo(1));
  console.log("Impl 2c:", fibMemo(10));
  console.log("Impl 2d:", fibMemo(40));

  console.log("Impl 3a:", power(2, 10));
  console.log("Impl 3b:", power(3, 0));
  console.log("Impl 3c:", power(2, -3));
  console.log("Impl 3d:", power(5, 3));

  console.log("Impl 4a:", flatten([1, [2, [3, [4]], 5]]));
  console.log("Impl 4b:", flatten([[1, 2], [3, [4, [5, [6]]]]]));
  console.log("Impl 4c:", flatten([]));

  const original = { a: 1, b: { c: [1, 2, { d: 3 }] } };
  const cloned = deepClone(original as Cloneable) as CloneableObject;
  console.log("Impl 5a:", JSON.stringify(cloned));
  console.log("Impl 5b: Not same ref:", cloned !== original);

  console.log("Impl 6:", subsets([1, 2, 3]));

  console.log("Impl 7a:", towerOfHanoi(2, "A", "C", "B"));
  console.log("Impl 7b:", towerOfHanoi(3, "A", "C", "B"));
  console.log("Impl 7b moves:", towerOfHanoi(3, "A", "C", "B").length);

  console.log("\n=== BONUS ===");
  console.log("Reverse:", reverseString("hello"));
  console.log("Permutations:", permutations([1, 2, 3]));
}

runAll();
