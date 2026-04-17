# Git Reset & Revert

## Table of Contents
1. [Introduction](#introduction)
2. [git reset](#git-reset)
3. [Reset Modes](#reset-modes)
4. [git revert](#git-revert)
5. [Reset vs Revert](#reset-vs-revert)
6. [When to Use Each](#when-to-use-each)
7. [Recovering from Mistakes](#recovering-from-mistakes)
8. [Best Practices](#best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Summary](#summary)

---

## Introduction

Both `git reset` and `git revert` undo changes, but they work fundamentally
differently. Reset moves the branch pointer backward (rewriting history),
while revert creates a new commit that undoes changes (preserving history).

---

## git reset

Reset moves the current branch pointer to a different commit and optionally
modifies the staging area and working directory.

```bash
git reset --soft HEAD~1    # Move pointer, keep staged + working
git reset --mixed HEAD~1   # Move pointer, unstage, keep working (default)
git reset --hard HEAD~1    # Move pointer, unstage, discard working
git reset HEAD~1           # Same as --mixed (default)
```

---

## Reset Modes

### --soft

Moves HEAD to the target commit. Staging area and working directory unchanged.

```
Before: HEAD → C, staged = C's files, working = C's files
After --soft HEAD~1: HEAD → B, staged = C's files, working = C's files
```

Use case: Undo a commit but keep all changes staged for recommitting.

### --mixed (default)

Moves HEAD and resets staging area to match. Working directory unchanged.

```
Before: HEAD → C, staged = C's files, working = modified
After --mixed HEAD~1: HEAD → B, staged = B's files, working = modified
```

Use case: Undo a commit and unstage changes, keeping them in working directory.

### --hard

Moves HEAD, resets staging, AND resets working directory. **Destructive**.

```
Before: HEAD → C, staged = C's files, working = modified
After --hard HEAD~1: HEAD → B, staged = B's files, working = B's files
```

Use case: Completely discard everything and go back to a known state.

### Comparison Table

| Mode | HEAD | Staging | Working Dir |
|------|------|---------|-------------|
| `--soft` | Moves | Unchanged | Unchanged |
| `--mixed` | Moves | Reset to target | Unchanged |
| `--hard` | Moves | Reset to target | Reset to target |

---

## git revert

Revert creates a NEW commit that undoes the changes from a specific commit.

```bash
git revert HEAD          # Revert the latest commit
git revert abc123        # Revert a specific commit
git revert HEAD~3..HEAD  # Revert a range
git revert -n abc123     # Revert without committing (stage only)
```

```
Before: A → B → C (HEAD)
After revert C: A → B → C → C' (C' undoes C's changes)
```

### Reverting Merge Commits

```bash
git revert -m 1 <merge-commit>
# -m 1 means keep the first parent (mainline)
```

---

## Reset vs Revert

| | Reset | Revert |
|--|-------|--------|
| Modifies history | Yes (moves branch pointer) | No (adds new commit) |
| Safe for pushed commits | No | Yes |
| Creates new commit | No | Yes |
| Can undo multiple commits | Yes (move to any point) | Yes (one at a time or range) |
| Working dir changes | Depends on mode | Only if conflict |
| Collaborative safety | Dangerous for shared branches | Safe for shared branches |

---

## When to Use Each

### Use Reset When:
- Undoing local, unpushed commits
- Reorganizing commits before pushing
- Cleaning up staging area
- Starting fresh from a known state

### Use Revert When:
- Undoing pushed/shared commits
- Need to preserve history
- Working on shared branches
- Need audit trail of what was undone

---

## Recovering from Mistakes

### After --hard reset
```bash
# Find the lost commit
git reflog
# HEAD@{1}: commit: Important work

# Recover
git reset --hard HEAD@{1}
# or create a branch
git branch recovered HEAD@{1}
```

### After accidental revert
```bash
# Revert the revert
git revert <revert-commit-sha>
```

---

## Best Practices

1. **Use revert for shared branches** — never reset pushed commits
2. **Use reflog before --hard** — know you can recover
3. **Prefer --soft** when you want to recommit differently
4. **Use --mixed (default)** to unstage and rework changes
5. **Verify with git log** after any reset/revert

---

## Common Pitfalls

### 1. Resetting pushed commits
Others have your commits — resetting requires force push, breaking their work.

### 2. --hard without backup
`git reset --hard` is destructive. Always check `git stash` or `git reflog` first.

### 3. Reverting the wrong commit
Double-check the SHA before reverting. Use `git show <sha>` to verify.

---

## Summary

| Command | Purpose |
|---------|---------|
| `git reset --soft HEAD~1` | Undo commit, keep staged |
| `git reset --mixed HEAD~1` | Undo commit, unstage |
| `git reset --hard HEAD~1` | Undo commit, discard all |
| `git revert <sha>` | New commit undoing changes |
| `git revert -m 1 <merge>` | Revert merge commit |
| `git revert -n <sha>` | Revert without committing |
| `git reflog` | Find lost commits after reset |
