# Git Bisect

## Table of Contents
1. [Introduction](#introduction)
2. [Basic Bisect](#basic-bisect)
3. [Binary Search Concept](#binary-search-concept)
4. [Bisect Workflow](#bisect-workflow)
5. [Automated Bisect](#automated-bisect)
6. [Bisect Commands](#bisect-commands)
7. [Bisect Log and Replay](#bisect-log-and-replay)
8. [Best Practices](#best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Summary](#summary)

---

## Introduction

`git bisect` uses binary search to find the commit that introduced a bug.
Given a known "good" commit and a known "bad" commit, bisect narrows down
the offending commit in O(log n) steps.

---

## Basic Bisect

```bash
git bisect start
git bisect bad              # Current commit is bad
git bisect good v1.0.0      # v1.0.0 was good

# Git checks out a commit in the middle
# Test it, then:
git bisect good  # if this commit is fine
# or
git bisect bad   # if this commit has the bug

# Repeat until git finds the first bad commit
# git bisect reset  # Return to original state
```

---

## Binary Search Concept

With 1000 commits between good and bad:
- Step 1: Test commit 500 → Bad? Range is now 1-500
- Step 2: Test commit 250 → Good? Range is now 250-500
- Step 3: Test commit 375 → Bad? Range is now 250-375
- ... approximately 10 steps total (log2(1000) ≈ 10)

---

## Bisect Workflow

```
Commits: A(good) → B → C → D → E → F → G → H(bad)

Step 1: Test D (midpoint)
  D is good → bug is in E..H
Step 2: Test F (midpoint of E..H)
  F is bad → bug is in E..F
Step 3: Test E
  E is bad → E introduced the bug!
```

---

## Automated Bisect

Instead of manually testing, provide a script:

```bash
git bisect start HEAD v1.0.0
git bisect run npm test
# or
git bisect run ./test-script.sh
```

The script must exit with:
- **0**: Good (tests pass)
- **1-124, 126-127**: Bad (tests fail)
- **125**: Skip (can't test this commit)

---

## Bisect Commands

```bash
git bisect start [bad] [good]  # Start bisecting
git bisect good [ref]          # Mark as good
git bisect bad [ref]           # Mark as bad
git bisect skip                # Skip untestable commit
git bisect reset               # End bisect, return to original
git bisect log                 # Show bisect log
git bisect replay <logfile>    # Replay a bisect session
git bisect run <cmd>           # Automated bisect
git bisect visualize           # Show remaining in gitk
```

---

## Bisect Log and Replay

```bash
# Save bisect session
git bisect log > bisect.log

# Replay on another machine
git bisect replay bisect.log
```

---

## Best Practices

1. **Have a reliable test** — manual or automated
2. **Use `bisect run`** for repeatable tests
3. **Skip unbuildable commits** with `bisect skip`
4. **Bisect on clean trees** — stash changes first
5. **Keep commits atomic** — makes bisect results meaningful

---

## Common Pitfalls

### 1. Flaky tests
If your test is unreliable, bisect gives wrong results.

### 2. Non-atomic commits
Large commits make it hard to pinpoint the exact change.

### 3. Forgetting to reset
```bash
git bisect reset  # Don't forget!
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git bisect start` | Begin bisect session |
| `git bisect good <ref>` | Mark commit as good |
| `git bisect bad <ref>` | Mark commit as bad |
| `git bisect skip` | Skip current commit |
| `git bisect reset` | End session |
| `git bisect run <script>` | Automated bisect |
| `git bisect log` | Show session log |
