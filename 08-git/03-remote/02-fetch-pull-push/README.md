# Git Fetch, Pull & Push

## Table of Contents
1. [Introduction](#introduction)
2. [git fetch](#git-fetch)
3. [git pull](#git-pull)
4. [git push](#git-push)
5. [Tracking Branches](#tracking-branches)
6. [Upstream Configuration](#upstream-configuration)
7. [push.default](#pushdefault)
8. [Force Push](#force-push)
9. [Pull Strategies](#pull-strategies)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Fetch, pull, and push are the commands that synchronize your local repository
with remotes. Understanding how each works — and the differences between them —
is essential for collaborative Git workflows.

---

## git fetch

Fetch downloads objects and refs from a remote without modifying your working
directory or local branches.

```bash
git fetch origin             # Fetch all branches from origin
git fetch origin main        # Fetch only main
git fetch --all              # Fetch from all remotes
git fetch --prune            # Remove stale remote-tracking refs
git fetch --tags             # Fetch all tags
```

### What Fetch Does

1. Contacts the remote repository
2. Downloads new commits, trees, and blobs
3. Updates remote-tracking branches (e.g., `origin/main`)
4. Does NOT modify local branches or working directory

```
Before fetch:
  local main:    A → B → C
  origin/main:   A → B → C
  remote main:   A → B → C → D → E

After fetch:
  local main:    A → B → C          (unchanged!)
  origin/main:   A → B → C → D → E  (updated)
  remote main:   A → B → C → D → E
```

---

## git pull

Pull is essentially `git fetch` + `git merge` (or `git rebase`).

```bash
git pull                     # Fetch + merge from tracking branch
git pull origin main         # Fetch + merge origin/main
git pull --rebase            # Fetch + rebase instead of merge
git pull --rebase=interactive # Fetch + interactive rebase
git pull --ff-only           # Only pull if fast-forward possible
```

### Pull = Fetch + Merge

```bash
git pull origin main
# Is equivalent to:
git fetch origin main
git merge origin/main
```

### Pull with Rebase

```bash
git pull --rebase origin main
# Is equivalent to:
git fetch origin main
git rebase origin/main
```

---

## git push

Push uploads local commits to a remote repository.

```bash
git push                     # Push current branch to upstream
git push origin main         # Push main to origin
git push -u origin feature   # Push and set upstream tracking
git push --all               # Push all branches
git push --tags              # Push all tags
git push origin --delete feat # Delete remote branch
```

### What Push Does

1. Sends local commits to the remote
2. Updates the remote branch ref
3. Fails if the remote has commits you don't have (non-fast-forward)

---

## Tracking Branches

A local branch can "track" a remote branch:

```bash
# Set tracking when pushing
git push -u origin feature

# Set tracking manually
git branch --set-upstream-to=origin/main main

# Check tracking info
git branch -vv
```

With tracking configured, `git pull` and `git push` work without arguments.

---

## Upstream Configuration

```bash
# See upstream for current branch
git rev-parse --abbrev-ref @{upstream}

# Set upstream
git branch -u origin/main

# Unset upstream
git branch --unset-upstream
```

---

## push.default

Controls what `git push` does when no refspec is given:

```bash
# Push only the current branch (recommended)
git config --global push.default current

# Push current branch to its upstream (default since Git 2.0)
git config --global push.default simple

# Push all branches with matching names
git config --global push.default matching
```

| Setting | Behavior |
|---------|----------|
| `simple` | Push current branch to upstream (default) |
| `current` | Push current branch to same name on remote |
| `matching` | Push all branches with matching remote names |
| `upstream` | Push current branch to its tracked upstream |
| `nothing` | Don't push anything without explicit refspec |

---

## Force Push

```bash
# Force push (overwrites remote — DANGEROUS)
git push --force
git push -f

# Safer: only force if remote hasn't changed since last fetch
git push --force-with-lease
```

### When Force Push is Needed

- After rebasing a branch that was already pushed
- After amending a pushed commit
- After `git reset` on a pushed branch

### Dangers of Force Push

- Overwrites remote history
- Breaks other developers' local branches
- Can lose commits permanently

---

## Pull Strategies

```bash
# Configure default pull behavior
git config --global pull.rebase true     # Always rebase on pull
git config --global pull.rebase false    # Always merge on pull
git config --global pull.ff only         # Only fast-forward
```

### When to Use Each

| Strategy | When |
|----------|------|
| Merge (default) | Preserving exact branch history matters |
| Rebase | Want clean linear history |
| FF-only | Only accept if no divergence |

---

## Best Practices

1. **Fetch before push** — see what changed on remote
2. **Use `--force-with-lease`** instead of `--force`
3. **Set up tracking** with `-u` on first push
4. **Use `pull --rebase`** for cleaner history
5. **Never force push to main/master** without team agreement
6. **Fetch with `--prune`** to clean stale refs

---

## Common Pitfalls

### 1. Pull creates unexpected merge commits
```bash
# Use rebase instead
git pull --rebase
# Or configure globally
git config --global pull.rebase true
```

### 2. Push rejected (non-fast-forward)
```bash
# Someone pushed before you
git pull --rebase  # Rebase your work on top
git push           # Now it works
```

### 3. Force pushing to shared branches
```bash
# NEVER do this without team coordination
git push --force origin main  # Breaks everyone's work
```

### 4. Forgetting to push tags
```bash
git push           # Doesn't push tags!
git push --tags    # Must push tags separately
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git fetch` | Download without merging |
| `git pull` | Fetch + merge |
| `git pull --rebase` | Fetch + rebase |
| `git push` | Upload commits |
| `git push -u origin <b>` | Push + set tracking |
| `git push --force-with-lease` | Safe force push |
| `git push --delete origin <b>` | Delete remote branch |

### Key Concepts

- **Fetch** updates remote-tracking branches only
- **Pull** = fetch + merge (or rebase)
- **Push** requires fast-forward (or force)
- **Tracking** links local branch to remote branch
- **`--force-with-lease`** is safer than `--force`
- **`pull.rebase true`** avoids unnecessary merge commits
