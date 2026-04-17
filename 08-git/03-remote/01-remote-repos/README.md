# Git Remote Repositories

## Table of Contents
1. [Introduction](#introduction)
2. [Remotes Concept](#remotes-concept)
3. [Managing Remotes](#managing-remotes)
4. [Origin Convention](#origin-convention)
5. [Multiple Remotes](#multiple-remotes)
6. [Remote URLs](#remote-urls)
7. [Remote-Tracking Branches](#remote-tracking-branches)
8. [Inspecting Remotes](#inspecting-remotes)
9. [Best Practices](#best-practices)
10. [Common Pitfalls](#common-pitfalls)
11. [Summary](#summary)

---

## Introduction

Remotes are references to other copies of your repository, typically on servers
like GitHub, GitLab, or Bitbucket. They enable collaboration by providing a
shared point for synchronizing work.

---

## Remotes Concept

A remote is a named URL pointing to another Git repository. Git stores remote
configuration in `.git/config`:

```ini
[remote "origin"]
    url = git@github.com:user/repo.git
    fetch = +refs/heads/*:refs/remotes/origin/*
```

The **fetch refspec** (`+refs/heads/*:refs/remotes/origin/*`) maps remote
branches to local remote-tracking branches.

---

## Managing Remotes

### Adding Remotes

```bash
git remote add origin https://github.com/user/repo.git
git remote add upstream https://github.com/original/repo.git
```

### Removing and Renaming

```bash
git remote remove upstream
git remote rename origin github
```

### Listing Remotes

```bash
git remote          # Names only
git remote -v       # Names and URLs (fetch + push)
```

Output:
```
origin  git@github.com:user/repo.git (fetch)
origin  git@github.com:user/repo.git (push)
```

### Changing URLs

```bash
git remote set-url origin https://github.com/user/new-repo.git
git remote get-url origin
```

---

## Origin Convention

`origin` is the conventional name for the primary remote — the one you cloned
from. It's not special to Git; it's just a widely followed convention.

```bash
git clone https://github.com/user/repo.git
# Automatically creates remote named "origin"
```

---

## Multiple Remotes

Common in fork-based workflows:

```bash
# Your fork
git remote add origin git@github.com:you/repo.git

# The original repository
git remote add upstream git@github.com:original/repo.git
```

### Use Cases for Multiple Remotes

1. **Fork workflow**: origin = your fork, upstream = original
2. **Deploy targets**: origin = GitHub, production = deploy server
3. **Mirror**: origin = primary, backup = secondary server

---

## Remote URLs

```bash
# HTTPS
https://github.com/user/repo.git

# SSH
git@github.com:user/repo.git

# Local path
/path/to/repo.git

# File protocol
file:///path/to/repo.git

# Git protocol (read-only, no auth)
git://github.com/user/repo.git
```

### Different URLs for Fetch and Push

```bash
git remote set-url --push origin git@github.com:user/repo.git
# Fetch via HTTPS, push via SSH
```

---

## Remote-Tracking Branches

Remote-tracking branches are local references that track the state of branches
on remotes. They update when you fetch.

```bash
# Format: <remote>/<branch>
origin/main
origin/develop
upstream/main
```

These are **read-only bookmarks** — you cannot commit to them directly.

```bash
# List remote-tracking branches
git branch -r

# See what a remote branch points to
git rev-parse origin/main
```

---

## Inspecting Remotes

```bash
# Detailed remote info
git remote show origin
```

Output:
```
* remote origin
  Fetch URL: git@github.com:user/repo.git
  Push  URL: git@github.com:user/repo.git
  HEAD branch: main
  Remote branches:
    develop tracked
    main    tracked
  Local branches configured for 'git pull':
    main merges with remote main
  Local refs configured for 'git push':
    main pushes to main (up to date)
```

---

## Best Practices

1. **Use `origin` for your primary remote** — follow convention
2. **Use `upstream` for the original repo** in fork workflows
3. **Prefer SSH for regular development** — no password prompts
4. **Use `-v` flag** to verify remote URLs
5. **Prune stale branches**: `git remote prune origin`

---

## Common Pitfalls

### 1. Wrong remote URL
```bash
git remote -v  # Always verify
git remote set-url origin <correct-url>
```

### 2. Forgetting to add upstream
```bash
# In fork workflow, always set up upstream
git remote add upstream <original-repo-url>
```

### 3. Stale remote-tracking branches
```bash
# Remote branch was deleted but local ref remains
git remote prune origin
# or
git fetch --prune
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git remote add <name> <url>` | Add a remote |
| `git remote remove <name>` | Remove a remote |
| `git remote rename <old> <new>` | Rename a remote |
| `git remote -v` | List remotes with URLs |
| `git remote show <name>` | Detailed remote info |
| `git remote set-url <name> <url>` | Change remote URL |
| `git remote prune <name>` | Remove stale refs |

### Key Concepts

- **Remote** = named reference to another repository
- **`origin`** = conventional name for primary remote
- **Remote-tracking branches** = local read-only copies of remote branch state
- **Fetch refspec** maps remote refs to local remote-tracking refs
- **Multiple remotes** enable fork workflows and deploy targets
