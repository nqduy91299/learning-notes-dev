# Git Status & Log

## Table of Contents

1. [Introduction](#introduction)
2. [git status](#git-status)
3. [git log](#git-log)
4. [Reflog](#reflog)
5. [HEAD and References](#head-and-references)
6. [Searching History](#searching-history)
7. [Log Formatting](#log-formatting)
8. [Best Practices](#best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Summary](#summary)

---

## Introduction

`git status` and `git log` are your primary tools for understanding the current
state of a repository and its history. Mastering these commands — along with
reflog and HEAD references — gives you complete visibility into what has
happened, what is happening, and what will happen on your next commit.

---

## git status

### Basic Usage

```bash
git status
```

Shows three categories:
1. **Changes to be committed** (staged)
2. **Changes not staged for commit** (modified tracked files)
3. **Untracked files** (new files not yet tracked)

### Short Format

```bash
git status -s
# or
git status --short
```

Two-column output: `XY filename`
- X = index/staging status
- Y = working tree status

| Code | Meaning |
|------|---------|
| `??` | Untracked |
| `A ` | Added to index |
| `M ` | Modified in index |
| ` M` | Modified in working tree |
| `MM` | Modified in both index and working tree |
| `D ` | Deleted from index |
| ` D` | Deleted from working tree |
| `R ` | Renamed in index |

### Branch Information

```bash
git status -b
# or
git status --branch
```

Shows current branch and tracking information:
```
## main...origin/main [ahead 2, behind 1]
```

### Ignored Files

```bash
git status --ignored
```

---

## git log

### Basic Usage

```bash
# Full log
git log

# Compact one-line format
git log --oneline

# Show graph of branches
git log --graph

# Combine for visual history
git log --oneline --graph --all
```

### Filtering

```bash
# By author
git log --author="Alice"

# By date
git log --since="2024-01-01"
git log --until="2024-06-30"
git log --after="2 weeks ago"

# By commit message
git log --grep="fix"

# By file
git log -- path/to/file.ts

# By content change (pickaxe)
git log -S "functionName"

# Limit count
git log -n 5
git log -5
```

### Diff in Log

```bash
# Show patch (diff) for each commit
git log -p

# Show stat summary
git log --stat

# Show files changed
git log --name-only

# Show files with status
git log --name-status
```

### Formatting

```bash
# Pretty formats
git log --pretty=format:"%h %an %s"
git log --pretty=format:"%H %ae %ad %s" --date=short

# Common placeholders:
# %H  — full hash
# %h  — short hash
# %an — author name
# %ae — author email
# %ad — author date
# %s  — subject
# %b  — body
# %d  — ref names (branches, tags)
```

### Range Queries

```bash
# Commits in feature not in main
git log main..feature

# Commits in either but not both
git log main...feature

# Commits reachable from HEAD but not from origin/main
git log origin/main..HEAD
```

---

## Reflog

The reflog records every time HEAD changes — commits, checkouts, resets, rebases.
It's your safety net for recovering "lost" work.

### Usage

```bash
# Show HEAD reflog
git reflog

# Show reflog for a specific branch
git reflog show feature

# Reflog with dates
git reflog --date=relative
```

### Reflog Format

```
a1b2c3d HEAD@{0}: commit: Add feature
e4f5g6h HEAD@{1}: checkout: moving from main to feature
i7j8k9l HEAD@{2}: commit: Initial commit
```

### Recovery with Reflog

```bash
# Find a "lost" commit after reset
git reflog
# HEAD@{3}: commit: Important work

# Recover it
git checkout HEAD@{3}
# or
git branch recovered HEAD@{3}
```

### Reflog Expiration

Reflog entries expire after 90 days by default (30 days for unreachable commits).

```bash
# Change expiration
git config gc.reflogExpire "180 days"

# Manually expire
git reflog expire --expire=now --all
```

---

## HEAD and References

### What is HEAD?

HEAD is a pointer to the current commit. Usually it points to a branch name
(which itself points to a commit).

```
HEAD → refs/heads/main → abc123 (commit)
```

### Detached HEAD

When HEAD points directly to a commit (not a branch):

```bash
git checkout abc123  # Detached HEAD
git switch --detach abc123  # Explicit detached HEAD
```

### Reference Syntax

```
HEAD      — current commit
HEAD~1    — parent (1 generation back)
HEAD~2    — grandparent (2 generations back)
HEAD~n    — n generations back (following first parent)

HEAD^1    — first parent of HEAD
HEAD^2    — second parent (only for merge commits)
HEAD^^    — HEAD^1^1 (grandparent via first parents)

HEAD@{1}  — previous HEAD position (reflog)
HEAD@{2}  — two positions ago in reflog
```

### Combining References

```bash
# Parent of parent of HEAD
HEAD~2   # or HEAD~~  or HEAD^^

# Second parent's parent (merge commit)
HEAD^2~1

# Three commits ago from main
main~3
```

---

## Searching History

### Finding When a Bug Was Introduced

```bash
# Search for commits that added/removed a string
git log -S "buggyFunction" --oneline

# Search for commits matching a regex in diff
git log -G "pattern.*regex" --oneline

# Search commit messages
git log --grep="fix.*login" --oneline
```

### Finding Who Changed a Line

```bash
git blame file.txt
git blame -L 10,20 file.txt  # Lines 10-20
git blame -w file.txt         # Ignore whitespace
```

### Finding When a File Was Added

```bash
git log --diff-filter=A -- path/to/file.txt
```

### Diff Filters

```bash
# Only show commits that Added files
git log --diff-filter=A

# Only Modified
git log --diff-filter=M

# Only Deleted
git log --diff-filter=D

# Only Renamed
git log --diff-filter=R
```

---

## Log Formatting

### Custom Aliases

```bash
# Pretty log alias
git config --global alias.lg "log --oneline --graph --all --decorate"

# Detailed log
git config --global alias.ll "log --pretty=format:'%C(yellow)%h%Creset %C(green)%ad%Creset %s %C(blue)[%an]%Creset%C(red)%d%Creset' --date=short"
```

### Graph Visualization

```bash
git log --graph --oneline --all
```

Output:
```
* abc1234 (HEAD -> main) Merge feature
|\
| * def5678 (feature) Add feature
|/
* ghi9012 Initial commit
```

---

## Best Practices

1. **Use `git status` frequently** — before add, before commit, after operations
2. **Learn `--oneline --graph`** — quick visual overview of history
3. **Use reflog for recovery** — your safety net before destructive operations
4. **Set up log aliases** — save time with custom formats
5. **Use `-S` and `--grep`** for searching — faster than manual browsing
6. **Check `git status -s`** for scripts — machine-parseable output

---

## Common Pitfalls

### 1. Confusing ~ and ^

```
HEAD~2  = go back 2 generations (always first parent)
HEAD^2  = second parent of HEAD (only meaningful for merges)
```

### 2. Forgetting --all in log

```bash
git log          # Only shows current branch's ancestry
git log --all    # Shows all branches
```

### 3. Trusting reflog too much

Reflog is **local only** — it's not shared with remotes. Entries expire.

### 4. Ignoring detached HEAD warnings

```bash
$ git checkout abc123
Note: switching to 'abc123'.
You are in 'detached HEAD' state...
# Any commits made here will be lost unless you create a branch!
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git status` | Show working tree status |
| `git status -s` | Short format status |
| `git log` | Show commit history |
| `git log --oneline` | Compact history |
| `git log --graph --all` | Visual branch history |
| `git log --author` | Filter by author |
| `git log --since` | Filter by date |
| `git log -S "str"` | Search for string in diffs |
| `git reflog` | Show HEAD movement history |
| `git blame` | Show who changed each line |

### Key Concepts

- **Three states**: working directory, staging area, repository
- **git status** shows differences between all three states
- **git log** traverses the commit graph from HEAD backward
- **Reflog** records every HEAD movement — your undo safety net
- **HEAD~N** follows first parent N times; **HEAD^N** selects Nth parent
- **`--all`** shows all branches, not just current branch's ancestry
