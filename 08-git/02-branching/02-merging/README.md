# Git Merging

## Table of Contents

1. [Introduction](#introduction)
2. [Fast-Forward Merge](#fast-forward-merge)
3. [Three-Way Merge](#three-way-merge)
4. [Merge Conflicts](#merge-conflicts)
5. [Conflict Resolution](#conflict-resolution)
6. [Merge Strategies](#merge-strategies)
7. [git merge --no-ff](#git-merge---no-ff)
8. [Merge Commit Anatomy](#merge-commit-anatomy)
9. [Aborting and Undoing Merges](#aborting-and-undoing-merges)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Merging is how you integrate changes from one branch into another. Git supports
several merge strategies, with the two most common being fast-forward merges
and three-way merges. Understanding when each occurs and how to handle conflicts
is crucial for collaborative development.

---

## Fast-Forward Merge

A fast-forward merge occurs when there is a direct linear path from the current
branch to the target branch. Git simply moves the branch pointer forward.

```
Before merge:
main:    A --- B
                \
feature:         C --- D

After `git merge feature` (fast-forward):
main:    A --- B --- C --- D  ← main moved here
                              ← feature still here
```

### When Does Fast-Forward Happen?

When the current branch has no new commits since the feature branch was created.
The current branch tip is an ancestor of the branch being merged.

```bash
git switch main
git merge feature
# Updating abc123..def456
# Fast-forward
#  file.txt | 2 ++
#  1 file changed, 2 insertions(+)
```

**Key**: No merge commit is created. History stays linear.

---

## Three-Way Merge

When both branches have diverged (both have new commits), Git performs a
three-way merge using:

1. **Base**: The common ancestor of both branches
2. **Ours**: The current branch tip
3. **Theirs**: The branch being merged

```
Before:
main:    A --- B --- E
                \
feature:         C --- D

After `git merge feature`:
main:    A --- B --- E --- M  (merge commit)
                \         /
feature:         C --- D
```

### The Merge Commit

A merge commit has **two parents**:
- First parent: the branch you were on (main → E)
- Second parent: the branch you merged (feature → D)

```bash
$ git log --oneline
abc1234 Merge branch 'feature' into main
def5678 E - main work
ghi9012 D - feature work
...
```

---

## Merge Conflicts

Conflicts occur when both branches modify the same part of the same file.

### What Causes Conflicts?

- Same line changed in both branches
- File deleted in one branch, modified in another
- File renamed differently in each branch

### Conflict Markers

```
<<<<<<< HEAD
content from current branch (ours)
=======
content from merged branch (theirs)
>>>>>>> feature
```

### Detecting Conflicts

```bash
$ git merge feature
Auto-merging file.txt
CONFLICT (content): Merge conflict in file.txt
Automatic merge failed; fix conflicts and then commit the result.
```

---

## Conflict Resolution

### Manual Resolution

1. Open conflicted files
2. Find conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Choose which content to keep (or combine)
4. Remove the conflict markers
5. Stage and commit

```bash
# After resolving conflicts
git add file.txt
git commit  # Creates the merge commit
```

### Using Merge Tools

```bash
git mergetool
# Opens configured merge tool for each conflicted file
```

### Choosing a Side

```bash
# Keep our version for all conflicts in a file
git checkout --ours file.txt

# Keep their version
git checkout --theirs file.txt

# After choosing, stage the file
git add file.txt
```

---

## Merge Strategies

### Recursive (default for two branches)

The default strategy. Handles renames and criss-cross merges.

```bash
git merge -s recursive feature
```

### Ort (default in Git 2.33+)

Replacement for recursive. Faster, cleaner code, same results.

```bash
git merge -s ort feature
```

### Octopus (default for 3+ branches)

Merges multiple branches at once. Cannot handle conflicts.

```bash
git merge feature1 feature2 feature3
```

### Ours

Keeps everything from the current branch. Discards all changes from the
merged branch. Creates a merge commit but the tree matches HEAD.

```bash
git merge -s ours feature
# "Merges" feature but keeps main's content entirely
```

### Subtree

For merging repositories that are subdirectories of each other.

---

## git merge --no-ff

Forces a merge commit even when fast-forward is possible.

```bash
git merge --no-ff feature
```

```
Without --no-ff (fast-forward):
main:    A --- B --- C --- D

With --no-ff:
main:    A --- B --------- M
                \         /
feature:         C --- D
```

### Why Use --no-ff?

- Preserves the fact that a feature branch existed
- Makes it easy to revert an entire feature (`git revert -m 1 M`)
- Creates a clear merge topology in the graph
- Common requirement in team workflows

---

## Merge Commit Anatomy

```bash
$ git cat-file -p abc123
tree def456...
parent aaa111...    # First parent (branch you were on)
parent bbb222...    # Second parent (branch you merged)
author Alice <alice@example.com> 1704067200 +0000
committer Alice <alice@example.com> 1704067200 +0000

Merge branch 'feature' into main
```

### First Parent Convention

The first parent is always the branch you were on. This matters for:
- `git log --first-parent` (shows only the main line)
- `git revert -m 1` (revert keeping the first parent)

---

## Aborting and Undoing Merges

### Abort an In-Progress Merge

```bash
# During a conflicted merge
git merge --abort
# Restores to pre-merge state
```

### Undo a Completed Merge

```bash
# If not pushed yet — reset
git reset --hard HEAD~1

# If already pushed — revert
git revert -m 1 HEAD
# -m 1 means keep the first parent (main line)
```

---

## Best Practices

1. **Merge frequently** — smaller merges = fewer conflicts
2. **Use `--no-ff` for features** — preserve branch topology
3. **Resolve conflicts carefully** — test after resolving
4. **Don't merge into feature branches from main too often** — consider rebase
5. **Use descriptive merge messages** — explain why, not just what
6. **Run tests after merging** — conflicts may be "resolved" but broken

---

## Common Pitfalls

### 1. Merge conflicts in generated files
```bash
# Add generated files to .gitignore
# Never resolve conflicts in lock files manually
# Delete and regenerate: rm package-lock.json && npm install
```

### 2. Losing work during conflict resolution
```bash
# Always commit before merging
git stash  # or git commit
git merge feature
```

### 3. Merging the wrong direction
```bash
# Wanted to merge main INTO feature, but did the opposite
git switch feature
git merge main  # Correct: bring main's changes into feature
```

### 4. Forgetting --no-ff
```bash
# Set as default for a branch
git config branch.main.mergeoptions "--no-ff"
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git merge <branch>` | Merge branch into current |
| `git merge --no-ff` | Force merge commit |
| `git merge --abort` | Cancel merge in progress |
| `git merge -s ours` | Merge but keep our content |
| `git checkout --ours <f>` | Resolve conflict with our version |
| `git checkout --theirs <f>` | Resolve conflict with their version |
| `git mergetool` | Open merge tool |
| `git log --first-parent` | Follow only first parents |

### Key Concepts

- **Fast-forward**: Linear path, no merge commit, pointer moves forward
- **Three-way merge**: Diverged branches, uses common ancestor, creates merge commit
- **Conflict markers**: `<<<<<<<`, `=======`, `>>>>>>>` delimit conflicting content
- **--no-ff**: Forces merge commit to preserve branch history
- **Merge commit**: Has two parents — first is "ours", second is "theirs"
- **`--abort`**: Safely cancel a conflicted merge
