# Greedy Algorithms

## Table of Contents

- [What is a Greedy Algorithm?](#what-is-a-greedy-algorithm)
- [Greedy Choice Property](#greedy-choice-property)
- [Optimal Substructure](#optimal-substructure)
- [Greedy vs Dynamic Programming](#greedy-vs-dynamic-programming)
- [Proof Technique: Exchange Argument](#proof-technique-exchange-argument)
- [Common Greedy Problems](#common-greedy-problems)
- [Summary](#summary)

---

## What is a Greedy Algorithm?

A greedy algorithm builds a solution step by step, always choosing the option that
looks best **at the current moment** (locally optimal choice), hoping this leads to a
**globally optimal** solution.

Key idea: **never reconsider past choices.** Once a decision is made, it's final.

### When Greedy Works

Greedy works when a problem has both:

1. **Greedy choice property** — a locally optimal choice leads to a globally optimal solution
2. **Optimal substructure** — optimal solution contains optimal solutions to subproblems

**Warning:** Many problems look greedy-friendly but aren't. Always verify the greedy
choice property holds before using this approach.

---

## Greedy Choice Property

A problem has the greedy choice property if we can assemble a globally optimal solution
by making locally optimal (greedy) choices, without needing to reconsider earlier choices.

**Example — Activity Selection:**
Choosing the activity that finishes earliest always leads to the maximum number of
non-overlapping activities. Why? By finishing earliest, we leave maximum room for
remaining activities.

**Counter-example — 0/1 Knapsack:**
Picking the item with the best value/weight ratio doesn't always work.
Items: weights=[10, 20, 30], values=[60, 100, 120], capacity=50.
Greedy (by ratio): take item 0 (ratio=6) + item 1 (ratio=5) = 160.
Optimal: take item 1 + item 2 = 220.

---

## Optimal Substructure

After making a greedy choice, the remaining problem is a smaller instance of the
same problem. The optimal solution to the original problem includes the optimal
solution to this remaining subproblem.

For activity selection: after choosing the earliest-finishing activity, the remaining
problem is to select the maximum activities from those that start after it finishes.

---

## Greedy vs Dynamic Programming

| Aspect          | Greedy                      | Dynamic Programming          |
| --------------- | --------------------------- | ---------------------------- |
| Choices         | One choice per step         | Considers all choices        |
| Subproblems     | One subproblem remains      | Many overlapping subproblems |
| Backtracking    | Never                       | Implicit (via table)         |
| Proof required  | Greedy choice property      | Optimal substructure         |
| Speed           | Usually faster              | Usually slower               |
| Correctness     | Must prove                  | Always correct (by design)   |

### When to Use Which?

- **Greedy:** Fractional knapsack, activity selection, Huffman coding, minimum spanning tree
- **DP:** 0/1 knapsack, edit distance, LCS, coin change (arbitrary denominations)
- **Both work:** Coin change with standard denominations (1,5,10,25)

### Coin Change: Greedy vs DP

With US coins [1, 5, 10, 25]: greedy works (always pick largest coin that fits).
With arbitrary coins [1, 3, 4], amount=6: greedy picks 4+1+1=3 coins, but optimal
is 3+3=2 coins. Greedy **fails** here.

---

## Proof Technique: Exchange Argument

The **exchange argument** is the most common way to prove a greedy algorithm is correct.

### Steps:

1. Assume there exists an optimal solution OPT that differs from the greedy solution
2. Identify the first point where OPT differs from greedy
3. Show you can "exchange" OPT's choice for greedy's choice without making it worse
4. Repeat until OPT matches greedy — proving greedy is also optimal

### Example: Activity Selection

**Claim:** Choosing the activity with earliest finish time is optimal.

**Proof sketch:**
- Let OPT be an optimal solution, and let `a1` be greedy's first choice (earliest finish).
- If OPT's first activity `b1` is different, then `finish(a1) ≤ finish(b1)`.
- Replace `b1` with `a1` in OPT. Since `a1` finishes no later, all subsequent activities
  in OPT are still compatible. So this new solution has the same number of activities.
- We now have an optimal solution that agrees with greedy on the first choice.
- By induction on the remaining subproblem, greedy is optimal.

---

## Common Greedy Problems

### Activity Selection / Interval Scheduling

**Problem:** Given activities with start/end times, select the maximum number of
non-overlapping activities.

**Greedy strategy:** Sort by finish time. Always pick the next activity that finishes
earliest and doesn't overlap with the last selected activity.

```
Activities (sorted by finish):
  A: [1,3]  B: [2,5]  C: [4,7]  D: [1,8]  E: [5,9]  F: [8,10]

Select A [1,3] → skip B (overlaps) → select C [4,7] → skip D,E → select F [8,10]
Result: 3 activities (A, C, F)
```

**Time:** O(n log n) for sorting + O(n) for selection.

### Fractional Knapsack

**Problem:** Given items with weights and values, maximize value with a weight limit.
You CAN take fractions of items.

**Greedy strategy:** Sort by value/weight ratio (descending). Take as much as possible
of the highest-ratio item first.

```
Items: [(w=10,v=60,r=6), (w=20,v=100,r=5), (w=30,v=120,r=4)]
Capacity: 50

Take all of item 0: 10kg, value=60, remaining=40
Take all of item 1: 20kg, value=100, remaining=20
Take 2/3 of item 2: 20kg, value=80, remaining=0

Total value: 60 + 100 + 80 = 240
```

Note: Greedy works for fractional knapsack but NOT 0/1 knapsack.

### Huffman Coding (Concept)

**Problem:** Assign variable-length binary codes to characters to minimize total
encoding length, given character frequencies.

**Greedy strategy:** Repeatedly merge the two lowest-frequency nodes into a new node.
Build a binary tree where left=0, right=1. More frequent characters get shorter codes.

```
Frequencies: a=5, b=9, c=12, d=13, e=16, f=45

Step 1: Merge a(5)+b(9) = ab(14)
Step 2: Merge c(12)+d(13) = cd(25)
Step 3: Merge ab(14)+e(16) = abe(30)
Step 4: Merge cd(25)+abe(30) = cdabe(55)
Step 5: Merge f(45)+cdabe(55) = root(100)

Codes: f=0, c=100, d=101, a=1100, b=1101, e=111
```

This is optimal by the greedy choice property: merging least-frequent nodes pushes
them deeper in the tree (longer codes), which is correct since they appear less often.

### Jump Game

**Problem:** Given an array where each element represents the maximum jump length at
that position, determine if you can reach the last index.

**Greedy strategy:** Track the farthest reachable position. Iterate through the array;
if current index exceeds farthest reachable, return false.

```
nums = [2, 3, 1, 1, 4]
maxReach: 2 → 4 → 4 → 4 → 8   ✓ (can reach index 4)

nums = [3, 2, 1, 0, 4]
maxReach: 3 → 3 → 3 → 3 → stuck at index 3 < 4  ✗
```

**Time:** O(n), **Space:** O(1)

### Minimum Platforms

**Problem:** Given arrival and departure times of trains, find the minimum number
of platforms required so no train waits.

**Greedy strategy:** Sort arrivals and departures separately. Use two pointers to
simulate: when next event is an arrival, add a platform; when departure, remove one.

```
Arrivals:   [9:00, 9:40, 9:50, 11:00, 15:00, 18:00]
Departures: [9:10, 12:00, 11:20, 11:30, 19:00, 20:00]

Sorted arrivals:   [9:00, 9:40, 9:50, 11:00, 15:00, 18:00]
Sorted departures: [9:10, 11:20, 11:30, 12:00, 19:00, 20:00]

Walk through events:
  9:00 arr → platforms=1
  9:10 dep → platforms=0
  9:40 arr → platforms=1
  9:50 arr → platforms=2
  11:00 arr → platforms=3  ← maximum
  11:20 dep → platforms=2
  ...

Minimum platforms needed: 3
```

**Time:** O(n log n)

---

## Summary

### Greedy Algorithm Template

```
1. Sort or organize input by the greedy criterion
2. Initialize solution
3. For each element (in sorted order):
     If element is compatible with current solution:
       Add it to the solution
4. Return solution
```

### Key Takeaways

- Greedy makes locally optimal choices hoping for global optimality
- Must verify the greedy choice property — not all problems are greedy-safe
- Greedy is usually simpler and faster than DP
- The exchange argument is the standard proof technique
- Common greedy criteria: earliest finish, highest ratio, smallest cost
- When in doubt, try DP instead — it's always correct (just slower)

### Complexity Summary

| Problem              | Time         | Space  |
| -------------------- | ------------ | ------ |
| Activity Selection   | O(n log n)   | O(1)   |
| Fractional Knapsack  | O(n log n)   | O(1)   |
| Huffman Coding       | O(n log n)   | O(n)   |
| Jump Game            | O(n)         | O(1)   |
| Minimum Platforms    | O(n log n)   | O(1)   |
| Merge Intervals      | O(n log n)   | O(n)   |
