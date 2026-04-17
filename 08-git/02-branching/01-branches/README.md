# Git Branches

## Table of Contents

1. [Introduction](#introduction)
2. [What Are Branches?](#what-are-branches)
3. [Branch Operations](#branch-operations)
4. [HEAD](#head)
5. [Detached HEAD](#detached-head)
6. [Branch Naming Conventions](#branch-naming-conventions)
7. [Switching Branches](#switching-branches)
8. [Branch Internals](#branch-internals)
9. [Tracking Branches](#tracking-branches)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Branches are one of Git's most powerful features. Unlike other version control
systems where branching is expensive, Git branches are lightweight — they're
simply pointers to commits. This makes branching and merging fast, easy, and
a core part of the Git workflow.

---

## What Are Branches?

A branch in Git is just a movable pointer to a commit. When you create a
branch, Git creates a new pointer — it doesn't copy any files.

```
main:    A --- B --- C  ← main points here
                      \
feature:               D --- E  ← feature points here
```

### Internally

A branch is a file in `.git/refs/heads/` containing a commit SHA:

```bash
$ cat .git/refs/heads/main
a1b2c3d4e5f6789...

$ cat .git/refs/heads/feature
f9e8d7c6b5a4321...
```

When you make a new commit, the current branch pointer automatically moves
forward to the new commit.

---

## Branch Operations

### Creating Branches

```bash
# Create a branch (don't switch to it)
git branch feature

# Create and switch in one command
git checkout -b feature
# or (newer syntax)
git switch -c feature

# Create branch from a specific commit
git branch hotfix abc123

# Create branch from a remote branch
git branch feature origin/feature
```

### Listing Branches

```bash
# List local branches
git branch

# List remote branches
git branch -r

# List all branches
git branch -a

# List with last commit info
git branch -v

# List branches merged into current
git branch --merged

# List branches not merged
git branch --no-merged
```

### Deleting Branches

```bash
# Delete a merged branch
git branch -d feature

# Force delete (even if not merged)
git branch -D feature

# Delete a remote branch
git push origin --delete feature
```

### Renaming Branches

```bash
# Rename current branch
git branch -m new-name

# Rename a specific branch
git branch -m old-name new-name
```

---

## HEAD

HEAD is a special pointer that tells Git which branch (or commit) you're
currently on.

### Normal HEAD (attached)

```
HEAD → refs/heads/main → commit C
```

`.git/HEAD` contains:
```
ref: refs/heads/main
```

### How HEAD Moves

When you commit, HEAD doesn't move — the branch it points to moves:

```
Before commit:
HEAD → main → C

After commit:
HEAD → main → D (new commit, parent is C)
```

When you switch branches, HEAD moves to the new branch:

```bash
git switch feature
# HEAD now → refs/heads/feature → E
```

---

## Detached HEAD

When HEAD points directly to a commit instead of a branch, you're in
"detached HEAD" state.

### How to Enter Detached HEAD

```bash
# Checkout a specific commit
git checkout abc123

# Checkout a tag
git checkout v1.0.0

# Checkout a remote branch directly
git checkout origin/main
```

### Dangers

Any commits made in detached HEAD are "orphaned" when you switch away:

```bash
$ git checkout abc123
$ echo "work" > file.txt && git add . && git commit -m "work"
# Created commit xyz789 in detached HEAD

$ git switch main
# xyz789 is now unreachable! (only in reflog)
```

### Recovery

```bash
# Create a branch at the detached commit
git branch rescue-branch

# Or, if you already switched away
git branch rescue-branch xyz789
# Find xyz789 with: git reflog
```

---

## Branch Naming Conventions

### Common Patterns

```
feature/user-authentication
feature/JIRA-123-add-login
bugfix/fix-memory-leak
hotfix/security-patch
release/v2.1.0
chore/update-dependencies
docs/api-documentation
```

### Rules

- No spaces (use hyphens or slashes)
- No special characters: `~`, `^`, `:`, `\`, `?`, `*`, `[`
- Cannot start with `-`
- Cannot end with `.lock`
- Cannot contain `..` or `@{`
- Case-sensitive on Linux, case-insensitive on macOS/Windows

### Git Flow Convention

```
main (or master)     — production code
develop              — integration branch
feature/*            — new features
release/*            — release preparation
hotfix/*             — production fixes
```

### GitHub Flow (simpler)

```
main                 — always deployable
feature-branches     — short-lived, merge via PR
```

---

## Switching Branches

### checkout vs switch

```bash
# Old way (overloaded command)
git checkout feature
git checkout -b new-feature

# New way (dedicated commands, Git 2.23+)
git switch feature
git switch -c new-feature
```

`git switch` is preferred because `git checkout` does too many things
(switch branches, restore files, create branches, detach HEAD).

### Switching with Uncommitted Changes

```bash
$ git switch feature
error: Your local changes to the following files would be overwritten...
```

Options:
1. Commit your changes first
2. Stash your changes: `git stash`
3. Force switch (discard changes): `git switch -f feature`

### Switching Back

```bash
# Switch to previous branch
git switch -
# Same as
git checkout -
```

---

## Branch Internals

### Packed Refs

For performance, Git can "pack" refs into a single file:

```bash
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled
abc123 refs/heads/main
def456 refs/heads/feature
ghi789 refs/tags/v1.0.0
```

### How a Commit Updates the Branch

1. Git creates the new commit object
2. Sets its parent to the current HEAD commit
3. Updates the branch ref file to point to the new commit SHA
4. HEAD still points to the branch (which now points to new commit)

```
Before:
HEAD → main → abc123

Commit happens:

1. New commit def456 created (parent: abc123)
2. .git/refs/heads/main updated: abc123 → def456

After:
HEAD → main → def456
```

---

## Tracking Branches

### What Are Tracking Branches?

Local branches can "track" remote branches to know their relationship:

```bash
# Set up tracking
git branch --set-upstream-to=origin/main main

# Or when pushing for the first time
git push -u origin feature
```

### Viewing Tracking Info

```bash
git branch -vv
# * main     abc1234 [origin/main: ahead 2] Latest commit
#   feature  def5678 [origin/feature] Feature work
```

### Ahead/Behind

```
origin/main:  A --- B --- C
local main:   A --- B --- C --- D --- E

main is "ahead 2" of origin/main
```

---

## Best Practices

1. **Branch early and often** — branches are cheap
2. **Use descriptive names** — `feature/user-auth` not `branch1`
3. **Delete merged branches** — keep the branch list clean
4. **Don't commit directly to main** — use feature branches
5. **Keep branches short-lived** — merge frequently to avoid drift
6. **Use `git switch`** over `git checkout` — clearer intent

---

## Common Pitfalls

### 1. Working on the wrong branch
```bash
# Always check before committing
git branch  # or git status
```

### 2. Forgetting to create a branch
```bash
# Made commits on main by accident
git branch feature  # create branch at current commit
git reset --hard HEAD~3  # move main back (if not pushed!)
git switch feature  # continue work on feature
```

### 3. Case sensitivity issues
```bash
# On macOS: Feature and feature are the same!
git branch Feature  # might conflict with existing 'feature'
```

### 4. Deleting unmerged branches
```bash
git branch -d feature  # Refuses if not merged
git branch -D feature  # Forces delete — data may be lost
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git branch` | List branches |
| `git branch <name>` | Create branch |
| `git branch -d <name>` | Delete merged branch |
| `git branch -D <name>` | Force delete branch |
| `git branch -m <new>` | Rename current branch |
| `git switch <name>` | Switch to branch |
| `git switch -c <name>` | Create and switch |
| `git switch -` | Switch to previous branch |
| `git branch -a` | List all branches |
| `git branch -vv` | Show tracking info |

### Key Concepts

- **Branches are pointers** to commits — creating one is O(1)
- **HEAD** points to the current branch (or directly to a commit)
- **Detached HEAD** means HEAD points to a commit, not a branch
- **Tracking branches** link local branches to remote counterparts
- **`git switch`** is the modern, safer way to change branches
