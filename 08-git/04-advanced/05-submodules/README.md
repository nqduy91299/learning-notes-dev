# Git Submodules

## Table of Contents
1. [Introduction](#introduction)
2. [Adding Submodules](#adding-submodules)
3. [.gitmodules File](#gitmodules-file)
4. [Updating Submodules](#updating-submodules)
5. [Initializing Submodules](#initializing-submodules)
6. [Recursive Clone](#recursive-clone)
7. [Submodule vs Subtree](#submodule-vs-subtree)
8. [When to Use Submodules](#when-to-use-submodules)
9. [Removing Submodules](#removing-submodules)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Git submodules allow you to include one Git repository inside another as a
subdirectory. The parent repository tracks a specific commit of the submodule,
not its contents directly.

---

## Adding Submodules

```bash
git submodule add https://github.com/lib/awesome-lib.git libs/awesome-lib
git commit -m "Add awesome-lib submodule"
```

This creates:
1. A `.gitmodules` file with the submodule configuration
2. An entry in `.git/config`
3. The submodule directory with the repository contents
4. A special entry in the index (gitlink) pointing to the submodule's commit

---

## .gitmodules File

```ini
[submodule "libs/awesome-lib"]
    path = libs/awesome-lib
    url = https://github.com/lib/awesome-lib.git
    branch = main
```

This file IS tracked by Git and shared with collaborators.

---

## Updating Submodules

```bash
# Update to the commit recorded in the parent
git submodule update

# Update to latest on the tracked branch
git submodule update --remote

# Update all submodules recursively
git submodule update --init --recursive

# Pull latest in submodule
cd libs/awesome-lib
git pull origin main
cd ../..
git add libs/awesome-lib
git commit -m "Update awesome-lib to latest"
```

---

## Initializing Submodules

After cloning a repo with submodules:

```bash
# Method 1: Two steps
git submodule init
git submodule update

# Method 2: One step
git submodule update --init

# Method 3: During clone
git clone --recurse-submodules <url>
```

---

## Recursive Clone

```bash
git clone --recurse-submodules <url>
# or after clone:
git submodule update --init --recursive
```

---

## Submodule vs Subtree

| | Submodule | Subtree |
|--|-----------|---------|
| Storage | Reference (gitlink) | Full copy in tree |
| Update | Explicit update needed | Merge/pull |
| Complexity | Higher | Lower |
| Offline | Need to fetch separately | Already in repo |
| History | Separate | Merged into parent |

### git subtree

```bash
# Add subtree
git subtree add --prefix=libs/awesome-lib <url> main --squash

# Pull updates
git subtree pull --prefix=libs/awesome-lib <url> main --squash
```

---

## When to Use Submodules

**Good Use Cases:**
- Shared libraries used across multiple projects
- Third-party dependencies pinned to specific versions
- Monorepo with independently versioned components
- Projects with different access permissions

**Bad Use Cases:**
- Simple project dependencies (use package manager instead)
- Tightly coupled code that changes together
- When team is unfamiliar with submodules

---

## Removing Submodules

```bash
# 1. Deinit the submodule
git submodule deinit libs/awesome-lib

# 2. Remove from .git/modules
rm -rf .git/modules/libs/awesome-lib

# 3. Remove the directory and index entry
git rm libs/awesome-lib

# 4. Commit
git commit -m "Remove awesome-lib submodule"
```

---

## Best Practices

1. **Use `--recurse-submodules`** when cloning
2. **Pin submodules to specific commits** for reproducibility
3. **Document submodule setup** in README
4. **Use `git submodule foreach`** for batch operations
5. **Consider subtree** if team struggles with submodules

---

## Common Pitfalls

### 1. Forgetting to init submodules
```bash
# Empty submodule directories after clone
git submodule update --init --recursive
```

### 2. Detached HEAD in submodules
Submodules check out a specific commit, not a branch.

### 3. Uncommitted submodule changes
```bash
git status  # Shows "modified: libs/awesome-lib (new commits)"
git add libs/awesome-lib && git commit
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git submodule add <url> <path>` | Add submodule |
| `git submodule init` | Initialize config |
| `git submodule update` | Checkout recorded commit |
| `git submodule update --remote` | Update to latest |
| `git submodule update --init --recursive` | Full init + update |
| `git clone --recurse-submodules` | Clone with submodules |
| `git submodule foreach <cmd>` | Run command in each |
| `git submodule deinit <path>` | Unregister submodule |
