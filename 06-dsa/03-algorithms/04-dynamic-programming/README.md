# Dynamic Programming

## Table of Contents

- [What is Dynamic Programming?](#what-is-dynamic-programming)
- [Key Properties](#key-properties)
- [Top-Down vs Bottom-Up](#top-down-vs-bottom-up)
- [1D Dynamic Programming](#1d-dynamic-programming)
- [2D Dynamic Programming](#2d-dynamic-programming)
- [State Transition](#state-transition)
- [Space Optimization](#space-optimization)
- [Common Patterns Classification](#common-patterns-classification)
- [Summary](#summary)

---

## What is Dynamic Programming?

Dynamic Programming (DP) is an algorithmic technique for solving optimization problems by
breaking them down into simpler subproblems and storing their solutions to avoid redundant
computation. It's not a specific algorithm but a **problem-solving paradigm**.

The term was coined by Richard Bellman in the 1950s. Despite the name, it has nothing to do
with "programming" in the coding sense — it refers to "programming" in the mathematical
optimization sense (like linear programming).

### When to Use DP

A problem is a good candidate for DP when it has two key properties:

1. **Overlapping subproblems** — the same subproblems are solved multiple times
2. **Optimal substructure** — an optimal solution can be constructed from optimal solutions
   of its subproblems

If a problem only has optimal substructure but NOT overlapping subproblems, divide and
conquer is usually the better approach (e.g., merge sort).

### DP vs Other Techniques

| Technique          | Overlapping Subproblems | Optimal Substructure | Approach         |
| ------------------ | ----------------------- | -------------------- | ---------------- |
| Brute Force        | Recomputes all          | N/A                  | Try everything   |
| Divide & Conquer   | No (independent)        | Yes                  | Split & merge    |
| Dynamic Programming| Yes (stores results)    | Yes                  | Build from sub   |
| Greedy             | N/A                     | Yes                  | Local optimum    |

---

## Key Properties

### Overlapping Subproblems

A problem has overlapping subproblems when the recursive solution revisits the same
subproblems repeatedly. Consider Fibonacci:

```
                    fib(5)
                   /      \
              fib(4)      fib(3)      <-- fib(3) computed twice
             /     \      /    \
         fib(3)  fib(2) fib(2) fib(1) <-- fib(2) computed three times
        /    \
    fib(2) fib(1)
```

Without memoization, `fib(n)` has exponential time complexity O(2^n) because it
recomputes the same values. With DP, each subproblem is solved exactly once: O(n).

### Optimal Substructure

A problem has optimal substructure when the optimal solution to the problem contains
optimal solutions to its subproblems.

**Example: Shortest Path**
If the shortest path from A to C goes through B, then the sub-path from A to B must
also be the shortest path from A to B. If it weren't, we could replace it with a
shorter one and get a shorter total path — contradiction.

**Counter-example: Longest Simple Path**
The longest simple path from A to C through B does NOT necessarily contain the longest
simple path from A to B, because path constraints (no revisiting nodes) create
dependencies between subproblems.

---

## Top-Down vs Bottom-Up

There are two approaches to implementing DP:

### Top-Down (Memoization)

Start with the original problem and recursively break it down. Cache results of
subproblems as you go.

```
function fib(n, memo = {}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
```

**Characteristics:**
- Natural recursive structure — often easier to write
- Only solves subproblems that are actually needed (lazy evaluation)
- Has recursion overhead (call stack)
- Risk of stack overflow for large inputs
- Good when you don't need all subproblems

### Bottom-Up (Tabulation)

Start with the smallest subproblems and iteratively build up to the solution.
Use a table (array) to store results.

```
function fib(n):
    dp = array of size n+1
    dp[0] = 0, dp[1] = 1
    for i from 2 to n:
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
```

**Characteristics:**
- Iterative — no recursion overhead
- No risk of stack overflow
- Solves all subproblems (even unnecessary ones)
- Often easier to optimize space
- Usually slightly faster due to no function call overhead

### Comparison

| Aspect           | Top-Down (Memo)        | Bottom-Up (Tab)         |
| ---------------- | ---------------------- | ----------------------- |
| Implementation   | Recursive + cache      | Iterative + table       |
| Subproblems      | Only needed ones       | All of them             |
| Stack            | Can overflow           | No risk                 |
| Space optimize   | Harder                 | Easier                  |
| Code clarity     | More intuitive         | Requires ordering       |
| Performance      | Slight overhead        | Slightly faster         |

**Rule of thumb:** Start with top-down (easier to derive), convert to bottom-up if you
need better performance or space optimization.

---

## 1D Dynamic Programming

In 1D DP, the state depends on a single variable (usually an index or amount).

### Climbing Stairs

**Problem:** You can climb 1 or 2 steps at a time. How many distinct ways to reach step n?

**State:** `dp[i]` = number of ways to reach step `i`
**Transition:** `dp[i] = dp[i-1] + dp[i-2]`
**Base cases:** `dp[0] = 1, dp[1] = 1`

```
Step:    0  1  2  3  4  5
Ways:    1  1  2  3  5  8

dp[3] = dp[2] + dp[1] = 2 + 1 = 3
  (take 1 step from step 2) + (take 2 steps from step 1)
```

This is essentially Fibonacci! Time: O(n), Space: O(n) → O(1) with optimization.

### House Robber

**Problem:** Given an array of house values, find the maximum amount you can rob without
robbing two adjacent houses.

**State:** `dp[i]` = max amount robbing from houses `0..i`
**Transition:** `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`
  - Skip house `i`: take `dp[i-1]`
  - Rob house `i`: take `dp[i-2] + nums[i]` (can't rob i-1)

```
Houses: [2, 7, 9, 3, 1]

dp[0] = 2
dp[1] = max(2, 7) = 7
dp[2] = max(7, 2+9) = 11
dp[3] = max(11, 7+3) = 11
dp[4] = max(11, 11+1) = 12

Answer: 12 (rob houses 0, 2, 4 → 2+9+1=12)
```

### Coin Change

**Problem:** Given coins of different denominations and a target amount, find the minimum
number of coins needed.

**State:** `dp[i]` = min coins to make amount `i`
**Transition:** `dp[i] = min(dp[i - coin] + 1)` for each coin where `coin <= i`
**Base case:** `dp[0] = 0`

```
Coins: [1, 3, 4], Amount: 6

dp: [0, 1, 2, 1, 1, 2, 2]

dp[0] = 0
dp[1] = dp[0]+1 = 1          (use coin 1)
dp[2] = dp[1]+1 = 2          (use coin 1)
dp[3] = min(dp[2]+1, dp[0]+1) = 1  (use coin 3)
dp[4] = min(dp[3]+1, dp[1]+1, dp[0]+1) = 1  (use coin 4)
dp[5] = min(dp[4]+1, dp[2]+1, dp[1]+1) = 2  (use coin 4+1 or 1+4)
dp[6] = min(dp[5]+1, dp[3]+1, dp[2]+1) = 2  (use coin 3+3)
```

---

## 2D Dynamic Programming

In 2D DP, the state depends on two variables (e.g., two indices, index + capacity).

### Longest Common Subsequence (LCS)

**Problem:** Find the length of the longest subsequence common to two strings.

**State:** `dp[i][j]` = LCS length of `s1[0..i-1]` and `s2[0..j-1]`
**Transition:**
- If `s1[i-1] === s2[j-1]`: `dp[i][j] = dp[i-1][j-1] + 1`
- Else: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

```
     ""  a  c  e
""  [ 0, 0, 0, 0 ]
a   [ 0, 1, 1, 1 ]
b   [ 0, 1, 1, 1 ]
c   [ 0, 1, 2, 2 ]
d   [ 0, 1, 2, 2 ]
e   [ 0, 1, 2, 3 ]

LCS("abcde", "ace") = 3  → "ace"
```

### Edit Distance (Levenshtein Distance)

**Problem:** Find minimum number of operations (insert, delete, replace) to convert
one string to another.

**State:** `dp[i][j]` = min edits to convert `s1[0..i-1]` to `s2[0..j-1]`
**Transition:**
- If `s1[i-1] === s2[j-1]`: `dp[i][j] = dp[i-1][j-1]` (no operation)
- Else: `dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])`
  - `dp[i-1][j-1]` + 1: replace
  - `dp[i-1][j]` + 1: delete from s1
  - `dp[i][j-1]` + 1: insert into s1

```
       ""  s  a  t
""   [ 0,  1, 2, 3 ]
s    [ 1,  0, 1, 2 ]
i    [ 2,  1, 1, 2 ]
t    [ 3,  2, 2, 1 ]

edit_distance("sit", "sat") = 1  (replace 'i' with 'a')
```

### 0/1 Knapsack

**Problem:** Given items with weights and values, maximize total value without exceeding
capacity. Each item can be taken at most once.

**State:** `dp[i][w]` = max value using items `0..i-1` with capacity `w`
**Transition:**
- Don't take item `i`: `dp[i][w] = dp[i-1][w]`
- Take item `i` (if `weight[i] <= w`): `dp[i][w] = dp[i-1][w - weight[i]] + value[i]`
- `dp[i][w] = max(don't take, take)`

```
Items: weights=[1,3,4,5], values=[1,4,5,7], capacity=7

       Cap: 0  1  2  3  4  5  6  7
Item 0:   [ 0, 1, 1, 1, 1, 1, 1, 1 ]
Item 1:   [ 0, 1, 1, 4, 5, 5, 5, 5 ]
Item 2:   [ 0, 1, 1, 4, 5, 6, 6, 9 ]
Item 3:   [ 0, 1, 1, 4, 5, 7, 8, 9 ]

Max value = 9 (items 1+2: weight=3+4=7, value=4+5=9)
```

---

## State Transition

The most critical step in solving a DP problem is defining the **state** and the
**transition** (recurrence relation).

### Framework for Defining DP State

1. **Identify what changes** — What variables define the current position in the problem?
2. **Define the state** — What does `dp[i]` (or `dp[i][j]`) represent?
3. **Find the transition** — How does the current state relate to previous states?
4. **Identify base cases** — What are the smallest subproblems with known answers?
5. **Determine the answer** — Where in the DP table is the final answer?

### Common State Definitions

| Pattern                 | State Definition                          | Example          |
| ----------------------- | ----------------------------------------- | ---------------- |
| Linear sequence         | `dp[i]` = answer for `arr[0..i]`          | House Robber     |
| Target building         | `dp[i]` = answer for target value `i`     | Coin Change      |
| Two sequences           | `dp[i][j]` = answer for `s1[0..i], s2[0..j]` | Edit Distance |
| Index + constraint      | `dp[i][w]` = answer at index `i` with `w` | Knapsack         |
| Interval                | `dp[i][j]` = answer for interval `[i..j]` | Matrix Chain     |

### Tips for Finding Transitions

- **Think about the last step.** What was the last decision/action before reaching
  state `dp[i]`?
- **Enumerate choices.** At each state, what choices do you have? The transition
  combines all possible choices.
- **Draw small examples.** Fill in a DP table by hand to see the pattern.

---

## Space Optimization

Many DP solutions can be optimized to use less space by observing that the current
state only depends on a limited number of previous states.

### 1D → O(1): Rolling Variables

When `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`:

```
// Before: O(n) space
dp = new Array(n+1)
dp[0] = 0; dp[1] = 1;
for (i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2]

// After: O(1) space
prev2 = 0; prev1 = 1;
for (i = 2; i <= n; i++) {
    curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
}
```

### 2D → 1D: Row Compression

When each row only depends on the previous row:

```
// Before: O(n*W) space for knapsack
dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])

// After: O(W) space — iterate w in REVERSE to avoid overwriting
dp = new Array(W+1).fill(0)
for each item i:
    for w from W down to weight[i]:
        dp[w] = max(dp[w], dp[w-weight[i]] + value[i])
```

**Why reverse?** When iterating forward, `dp[w - weight[i]]` may have already been
updated for the current item, effectively allowing the item to be used multiple times
(unbounded knapsack). Reverse iteration ensures we use values from the previous row.

### 2D → Two 1D Arrays

When you need both current and previous rows but not older rows:

```
prev = new Array(cols).fill(0)
curr = new Array(cols).fill(0)
for each row:
    // fill curr using prev
    [prev, curr] = [curr, prev]  // swap references
```

---

## Common Patterns Classification

### Pattern 1: Fibonacci-like

The current state depends on a fixed number of previous states.

**Examples:** Fibonacci, Climbing Stairs, House Robber, Decode Ways
**Template:** `dp[i] = f(dp[i-1], dp[i-2], ...)`
**Space:** Usually optimizable to O(1)

### Pattern 2: Target Building / Partition

Build up to a target value from given elements.

**Examples:** Coin Change, Subset Sum, Partition Equal Subset Sum, Target Sum
**Template:** `dp[target] = f(dp[target - element])` for each element
**Key insight:** Iterate over elements, then over targets (or vice versa depending on
whether order matters)

### Pattern 3: Two Sequence Alignment

Compare or align two sequences character by character.

**Examples:** LCS, Edit Distance, Interleaving String, Regular Expression Matching
**Template:** `dp[i][j]` comparing `s1[0..i-1]` with `s2[0..j-1]`
**Space:** Usually optimizable to O(min(m, n))

### Pattern 4: Interval / Range

Solve for ranges of increasing size.

**Examples:** Matrix Chain Multiplication, Burst Balloons, Palindrome Partitioning
**Template:** `dp[i][j] = optimize over all k in [i..j]`
**Iteration:** By length of interval, from small to large

### Pattern 5: Decision Making

At each step, choose from several options affecting future states.

**Examples:** Best Time to Buy/Sell Stock (with cooldown/fee), 0/1 Knapsack
**Template:** `dp[i][state] = best outcome at index i with given state`
**Key insight:** The "state" captures constraints (holding stock, cooldown, etc.)

### Pattern 6: String DP

Problems involving strings where substring/subsequence properties matter.

**Examples:** Word Break, Palindrome Partitioning, Distinct Subsequences
**Template:** Often `dp[i]` = property of `s[0..i-1]`, checking all valid splits

### Pattern 7: Grid / Path

Navigate a grid from one corner to another.

**Examples:** Unique Paths, Minimum Path Sum, Dungeon Game
**Template:** `dp[i][j] = f(dp[i-1][j], dp[i][j-1])`
**Space:** Often optimizable to O(cols)

---

## Summary

### Problem-Solving Checklist

1. **Recognize DP applicability** — overlapping subproblems + optimal substructure?
2. **Define the state clearly** — what does `dp[i]` or `dp[i][j]` represent?
3. **Write the recurrence** — how does current state relate to previous states?
4. **Identify base cases** — smallest subproblems with trivial answers?
5. **Choose approach** — top-down or bottom-up?
6. **Implement and verify** — test with small examples, fill table by hand
7. **Optimize space** — can you reduce from 2D to 1D, or 1D to O(1)?

### Complexity Guide

| Problem               | Time       | Space (Optimized) |
| ---------------------- | ---------- | ----------------- |
| Fibonacci / Stairs     | O(n)       | O(1)              |
| House Robber           | O(n)       | O(1)              |
| Coin Change            | O(n * m)   | O(n)              |
| LIS                    | O(n^2)     | O(n)              |
| LCS                    | O(m * n)   | O(min(m,n))       |
| Edit Distance          | O(m * n)   | O(min(m,n))       |
| 0/1 Knapsack           | O(n * W)   | O(W)              |
| Unique Paths           | O(m * n)   | O(n)              |
| Word Break             | O(n^2)     | O(n)              |

Where `n` = input size, `m` = number of coins/second string length, `W` = capacity.

### Key Takeaways

- DP trades space for time by storing solutions to subproblems
- Start with brute force recursion, add memoization, then convert to tabulation
- The hardest part is defining the state and recurrence — practice this skill
- Space optimization is a separate step; get correctness first
- Most DP problems fall into recognizable patterns — learn to classify them
- When stuck, ask: "What was the last decision made?" to find the transition
