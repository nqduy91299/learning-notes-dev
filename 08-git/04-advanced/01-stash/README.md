# Git Stash

## Table of Contents
1. [Introduction](#introduction)
2. [Basic Stashing](#basic-stashing)
3. [Stash with Message](#stash-with-message)
4. [Managing the Stash Stack](#managing-the-stash-stack)
5. [Stash Untracked Files](#stash-untracked-files)
6. [Stash Specific Files](#stash-specific-files)
7. [Stash Internals](#stash-internals)
8. [Advanced Usage](#advanced-usage)
9. [Best Practices](#best-practices)
10. [Common Pitfalls](#common-pitfalls)
11. [Summary](#summary)

---

## Introduction

`git stash` temporarily saves your uncommitted changes so you can work on
something else, then come back to your work later. It works like a stack —
last in, first out (LIFO).

---

## Basic Stashing

```bash
# Save current changes to stash
git stash
# or
git stash push

# Restore most recent stash
git stash pop

# Apply stash without removing from stack
git stash apply

# Apply a specific stash
git stash apply stash@{2}
```

### What Gets Stashed

By default, `git stash` saves:
- Staged changes (index)
- Unstaged changes to tracked files
- Does NOT save untracked or ignored files

---

## Stash with Message

```bash
git stash push -m "WIP: user authentication"
git stash push -m "Halfway through refactoring"
```

This makes it easier to identify stashes later:
```
$ git stash list
stash@{0}: On feature: WIP: user authentication
stash@{1}: On main: Halfway through refactoring
```

---

## Managing the Stash Stack

```bash
# List all stashes
git stash list

# Show contents of most recent stash
git stash show
git stash show -p  # Show patch (diff)

# Show specific stash
git stash show stash@{1}

# Drop a specific stash
git stash drop stash@{1}

# Clear all stashes
git stash clear
```

### Pop vs Apply

- **`pop`**: Applies stash AND removes it from the stack
- **`apply`**: Applies stash but KEEPS it on the stack

```bash
git stash pop       # Apply + remove
git stash apply     # Apply + keep
```

---

## Stash Untracked Files

```bash
# Include untracked files
git stash push --include-untracked
# or
git stash push -u

# Include even ignored files
git stash push --all
# or
git stash push -a
```

---

## Stash Specific Files

```bash
# Stash only specific files
git stash push path/to/file1.ts path/to/file2.ts

# Stash with message and specific files
git stash push -m "Partial stash" -- src/auth.ts

# Interactive stash (like git add -p)
git stash push -p
```

---

## Stash Internals

A stash is stored as a special merge commit with two or three parents:
1. The HEAD commit when stash was created
2. A commit representing the index state
3. (Optional) A commit for untracked files

Stashes are stored in `.git/refs/stash` and the reflog.

---

## Advanced Usage

### Creating a Branch from Stash

```bash
git stash branch new-branch stash@{0}
# Creates branch from commit where stash was made
# Applies stash and drops it if successful
```

### Stash and Switch

```bash
# Common workflow: quick switch
git stash
git switch other-branch
# ... do work ...
git switch original-branch
git stash pop
```

---

## Best Practices

1. **Use messages** — `git stash push -m "description"`
2. **Don't use stash for long-term storage** — commit instead
3. **Pop, don't just apply** — keep the stack clean
4. **Stash before switching branches** if changes conflict
5. **Use `stash -u`** when you have important untracked files

---

## Common Pitfalls

### 1. Stash conflicts on pop
```bash
$ git stash pop
# CONFLICT! Stash is NOT dropped
# Resolve conflicts, then manually: git stash drop
```

### 2. Forgetting stashed work
```bash
git stash list  # Check periodically!
```

### 3. Stashing when you should commit
If the work is significant, make a WIP commit instead.

---

## Summary

| Command | Purpose |
|---------|---------|
| `git stash` | Save changes to stash |
| `git stash pop` | Apply + remove top stash |
| `git stash apply` | Apply top stash (keep it) |
| `git stash list` | List all stashes |
| `git stash show -p` | Show stash diff |
| `git stash drop` | Remove a stash entry |
| `git stash clear` | Remove all stashes |
| `git stash push -m "msg"` | Stash with message |
| `git stash push -u` | Include untracked files |
| `git stash push -p` | Interactive stash |
| `git stash branch <name>` | Create branch from stash |
