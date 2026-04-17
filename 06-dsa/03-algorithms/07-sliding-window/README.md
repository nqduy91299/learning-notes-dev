# Sliding Window

## Table of Contents

- [What is the Sliding Window Technique?](#what-is-the-sliding-window-technique)
- [Fixed-Size Window](#fixed-size-window)
- [Variable-Size Window](#variable-size-window)
- [Two-Pointer Technique](#two-pointer-technique)
- [Window State Tracking](#window-state-tracking)
- [Common Problems](#common-problems)
- [Summary](#summary)

---

## What is the Sliding Window Technique?

The sliding window technique maintains a **window** (contiguous subarray/substring)
that slides across the input, avoiding redundant computation by reusing results from
the previous window position.

Instead of recomputing everything for each possible subarray (O(n²) or worse), we
**incrementally update** by adding the new element entering the window and removing
the element leaving — achieving O(n) in most cases.

### When to Use Sliding Window

- Problems involving **contiguous subarrays or substrings**
- Finding max/min/count/condition over all subarrays of a certain property
- Keywords: "subarray", "substring", "contiguous", "window", "consecutive"

### Two Types

1. **Fixed-size window:** Window size is given (e.g., "subarray of size k")
2. **Variable-size window:** Window size changes based on a condition (e.g., "smallest
   subarray with sum ≥ target")

---

## Fixed-Size Window

The window has a constant size `k`. Slide it one position at a time.

### Template

```typescript
function fixedWindow(arr: number[], k: number): number {
    // Compute initial window
    let windowSum = 0;
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    let maxSum = windowSum;

    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum += arr[i];       // Add new element (entering window)
        windowSum -= arr[i - k];   // Remove old element (leaving window)
        maxSum = Math.max(maxSum, windowSum);
    }

    return maxSum;
}
```

### Example: Max Sum Subarray of Size K

```
arr = [2, 1, 5, 1, 3, 2], k = 3

Window [2,1,5] sum=8
Window [1,5,1] sum=7  (add 1, remove 2)
Window [5,1,3] sum=9  (add 3, remove 1)  ← maximum
Window [1,3,2] sum=6  (add 2, remove 5)

Answer: 9
```

**Time:** O(n), **Space:** O(1)
Compare with brute force O(n*k) — sliding window reuses the sum.

---

## Variable-Size Window

The window expands and shrinks based on a condition. Typically uses two pointers:
`left` and `right`.

### Shrink/Expand Pattern

```typescript
function variableWindow(arr: number[], condition): result {
    let left = 0;
    let result = initial;
    let windowState = initial;

    for (let right = 0; right < arr.length; right++) {
        // EXPAND: add arr[right] to window state
        windowState = update(windowState, arr[right]);

        // SHRINK: while window is invalid, remove from left
        while (!isValid(windowState)) {
            windowState = remove(windowState, arr[left]);
            left++;
        }

        // UPDATE: window [left..right] is valid, update result
        result = best(result, right - left + 1);
    }

    return result;
}
```

### Key Insight

The `right` pointer expands the window to explore new elements. The `left` pointer
shrinks it to maintain validity. Both pointers only move forward, so the total work
across all iterations is O(n), not O(n²).

### Example: Smallest Subarray with Sum ≥ Target

```
arr = [2, 3, 1, 2, 4, 3], target = 7

right=0: [2] sum=2
right=1: [2,3] sum=5
right=2: [2,3,1] sum=6
right=3: [2,3,1,2] sum=8 ≥ 7 → len=4
  shrink: [3,1,2] sum=6 < 7 → stop
right=4: [3,1,2,4] sum=10 ≥ 7 → len=4
  shrink: [1,2,4] sum=7 ≥ 7 → len=3
  shrink: [2,4] sum=6 < 7 → stop
right=5: [2,4,3] sum=9 ≥ 7 → len=3
  shrink: [4,3] sum=7 ≥ 7 → len=2  ← minimum
  shrink: [3] sum=3 < 7 → stop

Answer: 2
```

---

## Two-Pointer Technique

Sliding window is a specialization of the two-pointer technique. While two pointers
can work on sorted arrays (converging from both ends), sliding window specifically
uses two pointers moving in the **same direction** to define a window.

### Two Pointers vs Sliding Window

| Two Pointers                          | Sliding Window                      |
| ------------------------------------- | ----------------------------------- |
| Can converge from both ends           | Both move left to right             |
| Works on sorted arrays often          | Works on any sequential data        |
| e.g., two sum in sorted array         | e.g., longest substring             |
| No "window" concept needed            | Maintains a window of elements      |

### When Left Pointer Moves

The left pointer advances when:
- The window becomes **invalid** (sum exceeds limit, too many distinct chars, etc.)
- We want to find the **minimum** valid window
- A constraint is violated

### When Right Pointer Moves

The right pointer advances on every iteration — it explores new elements to include.

---

## Window State Tracking

Many sliding window problems require tracking the state of elements within the window.

### Hash Map / Frequency Counter

Track character/element frequencies within the window.

```typescript
const freq = new Map<string, number>();

// Add element to window
freq.set(ch, (freq.get(ch) ?? 0) + 1);

// Remove element from window
const count = freq.get(ch)! - 1;
if (count === 0) freq.delete(ch);
else freq.set(ch, count);
```

**Use cases:**
- Count distinct elements in window
- Check if window contains all required characters
- Track character frequencies for anagram detection

### Counter / Satisfied Conditions

Track how many conditions are currently satisfied.

```typescript
let satisfied = 0;  // number of characters meeting the requirement

// When adding a character
freq.set(ch, (freq.get(ch) ?? 0) + 1);
if (freq.get(ch) === required.get(ch)) satisfied++;

// When removing a character
if (freq.get(ch) === required.get(ch)) satisfied--;
freq.set(ch, freq.get(ch)! - 1);
```

This avoids re-checking all conditions when the window changes — O(1) per update
instead of O(k) where k is the number of distinct required characters.

---

## Common Problems

### Max Sum Subarray of Size K (Fixed Window)

Already covered above. Time: O(n), Space: O(1).

### Longest Substring Without Repeating Characters

**Problem:** Find the length of the longest substring with all unique characters.

**Strategy:** Variable window. Expand right. When a duplicate is found, shrink left
past the previous occurrence of that character.

```
s = "abcabcbb"

Window "a" → "ab" → "abc" (len=3) → "abca" has dup 'a'
  shrink to "bca" → "bcab" has dup 'b'
  shrink to "cab" → "cabc" has dup 'c'
  shrink to "abc" → "abcb" has dup 'b'
  shrink to "cb" → "cbb" has dup 'b'
  shrink to "b"

Max length: 3 ("abc")
```

**Time:** O(n), **Space:** O(min(n, alphabet size))

### Minimum Window Substring

**Problem:** Find the smallest substring of `s` containing all characters of `t`.

**Strategy:** Variable window. Expand until all chars of `t` are covered, then shrink
to find minimum. Track with frequency maps and a "satisfied" counter.

```
s = "ADOBECODEBANC", t = "ABC"

Expand until A,B,C all present: "ADOBEC" (len=6)
Shrink: "DOBEC" missing A → stop
Continue: "DOBECODEBA" → shrink to "CODEBA" (len=6) → "ODEBA" missing C
Continue: "ODEBANC" → shrink to "BANC" (len=4) ← minimum

Answer: "BANC"
```

**Time:** O(n + m), **Space:** O(m) where m = t.length

### Longest Repeating Character Replacement

**Problem:** Given a string and integer k, find the longest substring where you can
replace at most k characters to make all characters the same.

**Strategy:** Track the most frequent character in the window. If
`windowSize - maxFreq > k`, the window is invalid — shrink from left.

```
s = "AABABBA", k = 1

Key insight: valid window when (window size - count of most frequent char) ≤ k
This means we need at most k replacements.

Window "A" → "AA" → "AAB" (3-2=1 ≤ 1 ✓) → "AABA" (4-3=1 ≤ 1 ✓)
→ "AABAB" (5-3=2 > 1 ✗) → shrink → "ABAB" (4-2=2 > 1 ✗) → shrink → "BAB"
→ "BABB" (4-3=1 ≤ 1 ✓) → "BABBA" (5-3=2 > 1 ✗) → shrink → "ABBA" (4-3=1 ≤ 1 ✓)

Max length: 4 ("AABA" or "ABBA")
```

**Time:** O(n), **Space:** O(1) (26 letters)

### Fruit Into Baskets

**Problem:** Given a row of fruit trees (array), pick fruits into 2 baskets. Each
basket holds only one type. Find the maximum number of fruits (longest subarray
with at most 2 distinct values).

This is equivalent to: **longest subarray with at most k distinct elements** (k=2).

**Strategy:** Variable window with a frequency map. When distinct count exceeds 2,
shrink from left.

```
fruits = [1, 2, 3, 2, 2]

[1] → [1,2] (2 types) → [1,2,3] (3 types, shrink)
→ [2,3] → [2,3,2] (2 types) → [2,3,2,2] (2 types, len=4)

Answer: 4
```

**Time:** O(n), **Space:** O(1) (at most 3 entries in map)

---

## Summary

### Choosing the Right Approach

```
Is the window size fixed?
├─ YES → Fixed-size window template
│        (compute initial window, slide by add/remove)
└─ NO  → Variable-size window template
         (expand right, shrink left when invalid)

What state do you need to track?
├─ Sum/count → Simple variable
├─ Frequencies → Hash map
├─ Distinct count → Hash map + size
└─ Condition satisfaction → Counter pattern
```

### Templates Summary

**Fixed window:** Initialize window of size k, then slide.
**Variable window (find maximum):** Expand right, shrink left when invalid, track max.
**Variable window (find minimum):** Expand right until valid, shrink left while valid, track min.

### Complexity

| Problem                          | Time   | Space          |
| -------------------------------- | ------ | -------------- |
| Max sum subarray (size k)        | O(n)   | O(1)           |
| Longest substring no repeat      | O(n)   | O(min(n,Σ))    |
| Minimum size subarray sum        | O(n)   | O(1)           |
| Fruit into baskets               | O(n)   | O(1)           |
| Longest repeating char replace   | O(n)   | O(1)           |
| Minimum window substring         | O(n+m) | O(m)           |

Where Σ = alphabet size, m = pattern length.

### Key Takeaways

- Sliding window converts O(n²) brute force into O(n) by reusing computation
- Fixed-size: add new, remove old, update result
- Variable-size: expand to explore, shrink to maintain validity
- State tracking with hash maps enables complex window conditions
- Both pointers move forward only → total O(n) operations
- Look for keywords: "contiguous", "subarray", "substring", "window"
