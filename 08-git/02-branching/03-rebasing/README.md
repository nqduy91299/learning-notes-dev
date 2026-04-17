# Git Rebasing

## Table of Contents

1. [Introduction](#introduction)
2. [What is Rebase?](#what-is-rebase)
3. [Basic Rebase](#basic-rebase)
4. [Interactive Rebase](#interactive-rebase)
5. [Rebase vs Merge](#rebase-vs-merge)
6. [The Golden Rule](#the-golden-rule)
7. [Rebase Conflicts](#rebase-conflicts)
8. [Advanced Rebase](#advanced-rebase)
9. [Rebase Onto](#rebase-onto)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Rebasing is an alternative to merging for integrating changes between branches.
Instead of creating a merge commit, rebase replays your commits on top of
another branch, creating a linear history.

---

## What is Rebase?

Rebase takes a series of commits and "replays" them on top of a different base
commit. The commits get new SHAs because their parent changes.

```
Before rebase:
main:    A --- B --- C
              \
feature:       D --- E

After `git rebase main` (from feature):
main:    A --- B --- C
                      \
feature:               D' --- E'
```

D' and E' have the same changes as D and E, but different SHAs (different parents).

---

## Basic Rebase

```bash
# Rebase current branch onto main
git switch feature
git rebase main

# This replays feature's commits on top of main's tip
```

### Step by Step

1. Git finds the common ancestor of feature and main
2. Saves the diffs for each commit on feature since that ancestor
3. Resets feature to the tip of main
4. Applies each saved diff one by one, creating new commits

---

## Interactive Rebase

Interactive rebase lets you modify commits as they are replayed.

```bash
git rebase -i HEAD~3
# Opens editor with last 3 commits

git rebase -i main
# Rebase all commits since divergence from main
```

### The Todo List

```
pick abc1234 Add login feature
pick def5678 Fix typo in login
pick ghi9012 Add login tests

# Commands:
# p, pick   = use commit
# r, reword = use commit, but edit the commit message
# e, edit   = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup  = like squash, but discard this commit's message
# d, drop   = remove commit
```

### Squash

Combine multiple commits into one:

```
pick abc1234 Add login feature
squash def5678 Fix typo in login
squash ghi9012 Add login tests
```

Result: One commit "Add login feature" with all three changes.

### Fixup

Like squash but discards the commit message:

```
pick abc1234 Add login feature
fixup def5678 Fix typo in login
```

Result: One commit with abc1234's message, including def5678's changes.

### Reword

Change a commit message without changing its content:

```
reword abc1234 Add login feature
pick def5678 Fix typo
```

### Edit

Stop at a commit to make additional changes:

```
edit abc1234 Add login feature
```

Git stops after applying this commit. You can amend it, then continue:

```bash
# Make changes
git add .
git commit --amend
git rebase --continue
```

### Drop

Remove a commit entirely:

```
pick abc1234 Add login feature
drop def5678 Temporary debug logging
pick ghi9012 Add tests
```

---

## Rebase vs Merge

### Merge

```
A --- B --- C --- M (merge commit)
       \         /
        D --- E
```

**Pros**: Preserves true history, non-destructive, safe for shared branches
**Cons**: Creates merge commits, non-linear history

### Rebase

```
A --- B --- C --- D' --- E'
```

**Pros**: Linear history, cleaner git log, easier bisect
**Cons**: Rewrites history, dangerous for shared branches

### When to Use Each

| Situation | Use |
|-----------|-----|
| Integrating feature into main | Merge (or squash merge) |
| Updating feature with latest main | Rebase |
| Cleaning up commits before PR | Interactive rebase |
| Shared/public branch | Always merge |
| Local-only branch | Rebase is fine |

---

## The Golden Rule

> **Never rebase commits that have been pushed to a shared repository.**

Because rebase creates new commits (new SHAs), anyone who has based work on
the original commits will have diverged histories. This leads to duplicate
commits and confusion.

```
# BAD: Rebasing after pushing
git push origin feature
git rebase main        # Creates new commits
git push --force       # Overwrites history — breaks others' work!
```

### Exception

`git push --force-with-lease` is safer — it refuses to push if the remote
has commits you haven't seen. But it's still risky for shared branches.

---

## Rebase Conflicts

Conflicts during rebase are resolved commit-by-commit:

```bash
$ git rebase main
CONFLICT (content): Merge conflict in file.txt
error: could not apply abc1234... Add feature

# Resolve the conflict, then:
git add file.txt
git rebase --continue

# Or abort entirely:
git rebase --abort

# Or skip this commit:
git rebase --skip
```

---

## Advanced Rebase

### Rebase Onto

Move a branch to a completely different base:

```bash
git rebase --onto newbase oldbase feature
```

```
Before:
main:    A --- B --- C
              \
feature:       D --- E --- F
                    \
sub-feature:         G --- H

# Move sub-feature from feature to main:
git rebase --onto main feature sub-feature

After:
main:    A --- B --- C --- G' --- H'
              \
feature:       D --- E --- F
```

### Autosquash

```bash
# Create fixup commits that auto-squash
git commit --fixup=abc1234
# Creates: "fixup! Original message"

# Then rebase with autosquash
git rebase -i --autosquash main
# Fixup commits are automatically placed after their targets
```

---

## Best Practices

1. **Rebase before opening a PR** — clean up your commits
2. **Never rebase shared branches** — the golden rule
3. **Use interactive rebase** to squash WIP commits
4. **Rebase frequently** — smaller rebases = fewer conflicts
5. **Use `--autosquash`** with fixup commits
6. **Always test after rebasing** — conflicts may introduce bugs

---

## Common Pitfalls

### 1. Rebasing a shared branch
```bash
# This creates new SHAs for all rebased commits
# Anyone else on this branch will have problems
```

### 2. Not resolving all conflicts
```bash
# Rebase pauses at each conflicting commit
# You must resolve and continue for EACH one
```

### 3. Force pushing to main
```bash
# NEVER do this
git push --force origin main
```

### 4. Losing commits during interactive rebase
```bash
# Accidentally dropping or reordering commits
# Use reflog to recover: git reflog
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git rebase <base>` | Rebase onto base |
| `git rebase -i HEAD~N` | Interactive rebase last N |
| `git rebase --continue` | Continue after conflict |
| `git rebase --abort` | Cancel rebase |
| `git rebase --skip` | Skip current commit |
| `git rebase --onto A B C` | Rebase C from B onto A |
| `git rebase -i --autosquash` | Auto-arrange fixup commits |

### Key Concepts

- **Rebase replays commits** on a new base, creating new SHAs
- **Interactive rebase** allows squash, fixup, reword, edit, drop
- **Golden rule**: never rebase shared/pushed commits
- **Rebase vs merge**: rebase for clean history, merge for safety
- **`--onto`** moves commits to a completely different base
- **Conflicts** are resolved one commit at a time during rebase
