# Backtracking

## Table of Contents

- [What is Backtracking?](#what-is-backtracking)
- [Decision Tree Visualization](#decision-tree-visualization)
- [Pruning](#pruning)
- [Backtracking Template](#backtracking-template)
- [Classic Problems](#classic-problems)
- [Constraint Satisfaction](#constraint-satisfaction)
- [Summary](#summary)

---

## What is Backtracking?

Backtracking is an algorithmic technique that builds a solution **incrementally**, one
piece at a time, and **abandons** a candidate ("backtracks") as soon as it determines
the candidate cannot lead to a valid solution.

Think of it as exploring a maze: you go down a path, and if you hit a dead end, you
go back to the last fork and try a different direction.

### Key Characteristics

- **Exhaustive search** with early termination (pruning)
- Explores all potential solutions in a **depth-first** manner
- Uses **recursion** to explore choices and undo them
- More efficient than brute force because it prunes invalid branches

### When to Use Backtracking

- Generate all possible configurations (permutations, combinations, subsets)
- Find one or all solutions satisfying constraints (N-Queens, Sudoku)
- Problems where the solution space is a tree/graph of choices

---

## Decision Tree Visualization

Every backtracking problem can be visualized as a **decision tree** where:
- Each **node** represents a partial solution (current state)
- Each **edge** represents a choice
- **Leaf nodes** are complete solutions or dead ends

### Example: Subsets of {1, 2, 3}

```
                        []
                  /      |      \
               [1]      [2]     [3]
              /   \      |
           [1,2] [1,3] [2,3]
            |
         [1,2,3]

All subsets: [], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]
```

### Example: Permutations of {1, 2, 3}

```
                         []
                /         |         \
             [1]         [2]        [3]
            /   \       /   \      /   \
         [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]
          |      |     |     |     |      |
       [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1]
```

The depth of the tree = number of choices to make.
The branching factor = number of options at each choice.

---

## Pruning

Pruning is the key optimization in backtracking. It eliminates branches of the
decision tree that cannot lead to valid solutions, avoiding unnecessary exploration.

### Types of Pruning

1. **Constraint pruning:** Skip choices that violate problem constraints
   - N-Queens: don't place a queen where it attacks another
   - Sudoku: don't place a number that's already in the row/column/box

2. **Bound pruning:** Skip choices where the best possible outcome is worse than
   a known solution
   - Combination sum: if current sum already exceeds target, stop

3. **Symmetry pruning:** Skip choices that would produce duplicate solutions
   - Start from index `i+1` for combinations (not 0) to avoid duplicates
   - Sort input and skip consecutive duplicates

### Impact of Pruning

Without pruning: explore all `n!` permutations or `2^n` subsets.
With good pruning: can reduce exponential search to practical times.
N-Queens without pruning: `n^n` placements. With pruning: dramatically fewer.

---

## Backtracking Template

Most backtracking problems follow this template:

```typescript
function backtrack(state, choices, result) {
    // Base case: found a valid complete solution
    if (isComplete(state)) {
        result.push(copy(state));
        return;
    }

    for (const choice of choices) {
        // Pruning: skip invalid choices
        if (!isValid(state, choice)) continue;

        // Make choice
        state.push(choice);    // or modify state

        // Recurse with updated state
        backtrack(state, updatedChoices, result);

        // Undo choice (backtrack)
        state.pop();           // or restore state
    }
}
```

### The Three Steps

1. **Choose:** Pick an option from available choices
2. **Explore:** Recursively solve the smaller problem
3. **Unchoose:** Undo the choice (backtrack) to try other options

The "unchoose" step is what distinguishes backtracking from plain recursion.

---

## Classic Problems

### Permutations

Generate all possible orderings of a collection.

**Approach:** At each position, try every unused element.
**State:** Current permutation being built + used elements.
**Base case:** Permutation length equals input length.

```
Input: [1, 2, 3]
Decision: at each level, choose an unused number

Level 0: choose 1 → Level 1: choose 2 → Level 2: choose 3 → [1,2,3]
                                          backtrack
                              choose 3 → Level 2: choose 2 → [1,3,2]
         backtrack
         choose 2 → choose 1 → choose 3 → [2,1,3]
                     choose 3 → choose 1 → [2,3,1]
         ...

Result: [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]
Total: 3! = 6 permutations
```

### Combinations

Select k items from n without regard to order.

**Approach:** At each step, decide whether to include the current element or not.
Use a start index to avoid duplicates (only consider elements after current).
**Base case:** Selected k items.

```
C(4, 2) — choose 2 from {1,2,3,4}:
Start with 1: [1,2], [1,3], [1,4]
Start with 2: [2,3], [2,4]
Start with 3: [3,4]

Result: [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]
Total: C(4,2) = 6
```

### Subsets (Power Set)

Generate all possible subsets.

**Approach:** For each element, choose to include or exclude it.
**Base case:** Processed all elements.

```
Input: [1, 2, 3]
Each element: include or exclude (2 choices each)

[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]
Total: 2^3 = 8 subsets
```

### N-Queens

Place N queens on an N×N board so no two queens attack each other.

**Approach:** Place queens row by row. For each row, try each column.
**Pruning:** Check column, diagonal, and anti-diagonal conflicts.
**State:** Column placement for each row.

```
4-Queens solution:

. Q . .     . . Q .
. . . Q     Q . . .
Q . . .     . . . Q
. . Q .     . Q . .

Row 0: try col 0,1,2,3
  Col 1: place queen → Row 1: try cols
    Col 3: place → Row 2: try cols
      Col 0: place → Row 3: try cols
        Col 2: place → SOLUTION FOUND: [1,3,0,2]
```

### Sudoku Solver (Concept)

Fill a 9×9 grid so each row, column, and 3×3 box contains digits 1-9.

**Approach:** Find next empty cell, try digits 1-9.
**Pruning:** Check row, column, and box constraints before placing.
**Base case:** No empty cells remain.

This is a classic **constraint satisfaction problem** (CSP). Backtracking with
constraint propagation is the standard approach.

### Word Search

Given a 2D grid and a word, determine if the word exists in the grid by
following adjacent cells (up/down/left/right), each cell used at most once.

**Approach:** Start DFS from each cell matching the first letter.
**State:** Current position + index in word + visited cells.
**Pruning:** Stop if cell is out of bounds, already visited, or doesn't match.

---

## Constraint Satisfaction

Backtracking is the foundation of **constraint satisfaction problems (CSPs)** where:
- You have **variables** with **domains** (possible values)
- **Constraints** restrict which combinations of values are allowed
- Goal: find an assignment satisfying all constraints

### CSP Examples

| Problem     | Variables          | Domains    | Constraints                    |
| ----------- | ------------------ | ---------- | ------------------------------ |
| N-Queens    | Row placement      | 0..N-1     | No same col/diagonal           |
| Sudoku      | Empty cells        | 1..9       | Unique in row/col/box          |
| Graph Color | Node colors        | k colors   | Adjacent nodes differ          |
| Crossword   | Word placements    | Word list  | Intersecting letters match     |

### Optimization Techniques for CSPs

1. **Variable ordering:** Choose the variable with fewest legal values first
   (Minimum Remaining Values / MRV heuristic)
2. **Value ordering:** Try values most likely to succeed first
   (Least Constraining Value heuristic)
3. **Constraint propagation:** When assigning a value, reduce domains of
   related variables (Arc Consistency / AC-3)

---

## Summary

### Backtracking Checklist

1. **Define the state** — what does a partial solution look like?
2. **Identify choices** — what options are available at each step?
3. **Define constraints** — when is a choice invalid (pruning)?
4. **Define base case** — when is a solution complete?
5. **Implement choose → explore → unchoose** pattern

### Complexity

| Problem          | Time Complexity     | Space      |
| ---------------- | ------------------- | ---------- |
| Permutations     | O(n! × n)           | O(n)       |
| Combinations     | O(C(n,k) × k)       | O(k)       |
| Subsets          | O(2^n × n)          | O(n)       |
| N-Queens         | O(n!)               | O(n)       |
| Sudoku           | O(9^(empty cells))  | O(1)       |
| Word Search      | O(m×n × 4^L)        | O(L)       |

Where L = word length, m×n = grid dimensions.

### Key Takeaways

- Backtracking = DFS + pruning on a decision tree
- The template is: choose → explore → unchoose
- Pruning is critical — without it, backtracking degenerates to brute force
- Most problems involve generating permutations, combinations, or subsets
- State management (making and undoing choices) must be correct
- Sorting input often helps with pruning duplicates
