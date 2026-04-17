# Git Cherry-Pick

## Table of Contents

1. [Introduction](#introduction)
2. [What is Cherry-Pick?](#what-is-cherry-pick)
3. [Basic Usage](#basic-usage)
4. [Cherry-Pick Range](#cherry-pick-range)
5. [Handling Conflicts](#handling-conflicts)
6. [When to Use Cherry-Pick](#when-to-use-cherry-pick)
7. [Cherry-Pick Options](#cherry-pick-options)
8. [Cherry-Pick Internals](#cherry-pick-internals)
9. [Alternatives to Cherry-Pick](#alternatives-to-cherry-pick)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Cherry-pick allows you to apply the changes from a specific commit onto your
current branch. Unlike merge or rebase which operate on entire branches,
cherry-pick targets individual commits.

---

## What is Cherry-Pick?

Cherry-pick takes the diff introduced by a commit and applies it as a new
commit on the current branch.

```
Before:
main:    A --- B --- C
              \
feature:       D --- E --- F

After `git cherry-pick E` (on main):
main:    A --- B --- C --- E'
              \
feature:       D --- E --- F
```

E' has the same changes as E but a different SHA (different parent).

---

## Basic Usage

```bash
# Cherry-pick a single commit
git cherry-pick abc123

# Cherry-pick without committing (stage changes only)
git cherry-pick --no-commit abc123
# or
git cherry-pick -n abc123

# Cherry-pick with a custom commit message
git cherry-pick abc123
# Then amend: git commit --amend -m "Custom message"
```

---

## Cherry-Pick Range

```bash
# Cherry-pick a range of commits (exclusive start, inclusive end)
git cherry-pick A..B
# Applies commits after A up to and including B

# Cherry-pick multiple specific commits
git cherry-pick abc123 def456 ghi789

# Cherry-pick from oldest to newest (inclusive both)
git cherry-pick A^..B
```

### Range Notation

```
A..B = commits reachable from B but not from A
A^..B = A inclusive through B
```

---

## Handling Conflicts

Cherry-pick can cause conflicts when the changes depend on context that
doesn't exist on the current branch.

```bash
$ git cherry-pick abc123
error: could not apply abc123... Commit message
hint: after resolving the conflicts, mark the corrected paths
hint: with 'git add <paths>' and run 'git cherry-pick --continue'

# Resolve conflicts, then:
git add <resolved-files>
git cherry-pick --continue

# Or abort:
git cherry-pick --abort

# Or skip this commit:
git cherry-pick --skip
```

---

## When to Use Cherry-Pick

### Good Use Cases

1. **Hotfixes**: Apply a bugfix from develop to a release branch
2. **Backporting**: Port a fix to an older version branch
3. **Recovering commits**: Grab a commit from a deleted branch
4. **Selective features**: Apply specific commits from a long-running branch

### Bad Use Cases

1. **Syncing branches**: Use merge or rebase instead
2. **Moving entire branches**: Cherry-pick creates duplicates
3. **Regular workflow**: Overuse leads to duplicate commits

---

## Cherry-Pick Options

```bash
# Record the original commit SHA in the new commit message
git cherry-pick -x abc123
# Adds: "(cherry picked from commit abc123...)"

# Edit the commit message before committing
git cherry-pick -e abc123

# Apply to index only (don't commit)
git cherry-pick -n abc123

# Use mainline parent for merge commits
git cherry-pick -m 1 abc123
# -m 1 = use first parent as mainline
```

### Cherry-Picking Merge Commits

Merge commits have multiple parents. You must specify which parent is the
"mainline" (the branch you consider as the base):

```bash
# For a merge commit M with parents P1 (main) and P2 (feature):
git cherry-pick -m 1 M  # Apply changes that feature brought in
git cherry-pick -m 2 M  # Apply changes that main brought in
```

---

## Cherry-Pick Internals

How cherry-pick works internally:

1. Compute the diff between the commit and its parent
2. Apply that diff to the current HEAD
3. Create a new commit with the same message (and optionally `-x` reference)

This is essentially:
```bash
git diff PARENT..COMMIT | git apply
git commit -c COMMIT
```

---

## Alternatives to Cherry-Pick

| Need | Alternative |
|------|-------------|
| Bring in all branch changes | `git merge` |
| Rewrite branch onto new base | `git rebase` |
| Apply a patch file | `git apply` or `git am` |
| Move commits between branches | Interactive rebase |

---

## Best Practices

1. **Use `-x` flag** to track cherry-pick origin
2. **Cherry-pick as few commits as possible** — prefer merge/rebase
3. **Test after cherry-picking** — context differences may cause issues
4. **Document cherry-picks** — note which commits were cherry-picked and why
5. **Avoid cherry-picking merge commits** unless necessary

---

## Common Pitfalls

### 1. Duplicate Commits

Cherry-pick creates a new commit with the same changes. If you later merge
the original branch, you get duplicate changes.

### 2. Missing Context

The cherry-picked commit may depend on changes from earlier commits that
aren't on the current branch.

### 3. Empty Cherry-Pick

If the changes from the commit already exist on the current branch:
```bash
$ git cherry-pick abc123
# The previous cherry-pick is now empty, possibly due to conflict resolution.
```

### 4. Forgetting -m for Merge Commits

```bash
$ git cherry-pick merge-commit-sha
error: commit is a merge but no -m option was given.
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git cherry-pick <sha>` | Apply commit's changes |
| `git cherry-pick A..B` | Apply range of commits |
| `git cherry-pick -n <sha>` | Apply without committing |
| `git cherry-pick -x <sha>` | Record origin in message |
| `git cherry-pick -m 1 <sha>` | Cherry-pick merge commit |
| `git cherry-pick --continue` | Continue after conflict |
| `git cherry-pick --abort` | Cancel cherry-pick |
| `git cherry-pick --skip` | Skip current commit |

### Key Concepts

- **Cherry-pick** applies a single commit's diff to the current branch
- Creates a **new commit** with a different SHA
- Use **`-x`** to record the source commit reference
- **Range** `A..B` is exclusive of A, inclusive of B
- **Merge commits** require `-m` to specify mainline parent
- Overuse leads to **duplicate commits** — prefer merge or rebase
