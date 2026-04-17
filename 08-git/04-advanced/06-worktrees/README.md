# Git Worktrees

## Overview

Git worktrees allow you to have **multiple working directories** attached to a
single repository. Instead of stashing or committing half-finished work to
switch branches, you create a new worktree — a separate directory that shares
the same `.git` object database but has its own working tree and index.

```
repo/                    <-- main worktree (branch: main)
repo-hotfix/             <-- linked worktree (branch: hotfix/critical-bug)
repo-feature/            <-- linked worktree (branch: feature/new-ui)
```

All three directories point to the **same repository**. Commits made in any
worktree are visible to the others because they share the object store.

---

## Core Concepts

### Main Worktree vs Linked Worktrees

Every repository has exactly one **main worktree** — the directory where you
originally cloned or initialized the repo. Any additional worktrees created
with `git worktree add` are **linked worktrees**.

| Property              | Main Worktree           | Linked Worktree              |
| --------------------- | ----------------------- | ---------------------------- |
| Created by            | `git init` / `git clone`| `git worktree add`           |
| Contains `.git/`      | Yes (full directory)    | No (`.git` is a file)        |
| Can be removed        | No                      | Yes (`git worktree remove`)  |
| Shares object store   | Is the object store     | Points to main's store       |

In a linked worktree, the `.git` file contains a single line:

```
gitdir: /path/to/main/repo/.git/worktrees/<name>
```

### The Lock on Branches

A critical constraint: **the same branch cannot be checked out in two worktrees
simultaneously**. If `main` is checked out in the main worktree, you cannot
check it out in a linked worktree. This prevents conflicting index states.

```bash
# In main worktree, "main" branch is active
$ git worktree add ../hotfix main
fatal: 'main' is already checked out at '/path/to/repo'
```

You can work around this with detached HEAD or by creating a new branch:

```bash
git worktree add ../hotfix -b hotfix/fix-123 main
```

---

## Commands

### `git worktree add`

Create a new linked worktree.

```bash
# Create worktree with a new branch based on HEAD
git worktree add ../feature-x -b feature/x

# Create worktree on existing branch
git worktree add ../review-pr feature/someone-elses-pr

# Create worktree in detached HEAD state at a tag
git worktree add --detach ../release-check v2.1.0

# Create worktree at a specific commit
git worktree add ../bisect-work -b bisect-session abc1234
```

### `git worktree list`

Show all worktrees (main + linked).

```bash
$ git worktree list
/home/user/project         abc1234 [main]
/home/user/project-hotfix  def5678 [hotfix/critical]
/home/user/project-review  789abcd [feature/pr-42]
```

Add `--porcelain` for machine-readable output:

```bash
$ git worktree list --porcelain
worktree /home/user/project
HEAD abc1234abc1234abc1234abc1234abc1234abc123
branch refs/heads/main

worktree /home/user/project-hotfix
HEAD def5678def5678def5678def5678def5678def567
branch refs/heads/hotfix/critical
```

### `git worktree remove`

Remove a linked worktree. The working directory must be clean (no untracked or
modified files) unless `--force` is used.

```bash
git worktree remove ../feature-x

# Force removal even with uncommitted changes
git worktree remove --force ../feature-x
```

### `git worktree prune`

Clean up stale worktree metadata. If you manually delete a linked worktree's
directory (e.g., `rm -rf ../feature-x`), the main repo still has references to
it. `prune` removes those dangling references.

```bash
git worktree prune

# Dry run — see what would be pruned
git worktree prune --dry-run
```

### `git worktree lock` / `unlock`

Prevent a worktree from being pruned (useful for worktrees on removable media
or network drives that might be temporarily unavailable).

```bash
git worktree lock ../feature-x --reason "on external drive"
git worktree unlock ../feature-x
```

---

## Use Cases

### 1. Reviewing Pull Requests Without Losing Context

You're deep in a feature branch. A teammate asks you to review their PR. Instead
of stashing everything:

```bash
git worktree add ../review-pr-42 origin/feature/pr-42
cd ../review-pr-42
# review, test, comment
cd ../main-repo
git worktree remove ../review-pr-42
```

Your original working directory is completely untouched.

### 2. Hotfixes on Production

An urgent bug is reported. Your current branch has a half-day of uncommitted
work:

```bash
git worktree add ../hotfix -b hotfix/urgent-bug main
cd ../hotfix
# fix the bug, commit, push
cd ../main-repo
git worktree remove ../hotfix
```

### 3. Parallel Development

Work on multiple features simultaneously without constant branch switching:

```bash
git worktree add ../feature-a -b feature/a
git worktree add ../feature-b -b feature/b
# Open each in separate IDE windows
```

### 4. Testing Different Branches Side-by-Side

Compare behavior across branches by running both simultaneously:

```bash
git worktree add ../staging origin/staging
# Run main on port 3000, staging on port 3001
```

### 5. Running Long Builds or Test Suites

Start a build in one worktree and keep coding in another:

```bash
git worktree add ../build-test -b test-build
cd ../build-test && make all &
cd ../main-repo
# keep working
```

---

## Bare Repo + Worktrees Pattern

A popular workflow uses a **bare clone** as the central repo, with all work
happening in linked worktrees. This avoids having a "main" working directory
that you might accidentally modify.

```bash
# Clone as bare
git clone --bare git@github.com:user/project.git project.git

cd project.git

# Create worktrees for each branch you work on
git worktree add ../project-main main
git worktree add ../project-dev develop
git worktree add ../project-feature -b feature/new-thing develop
```

Directory layout:

```
project.git/           <-- bare repo (no working tree)
project-main/          <-- worktree on main
project-dev/           <-- worktree on develop
project-feature/       <-- worktree on feature/new-thing
```

Benefits:
- No temptation to work directly in the "main" repo
- Clean separation between repo metadata and working directories
- Easy to add/remove worktrees without affecting the core repo

### Configuring fetch for bare repos

Bare clones don't fetch remote branches by default. Fix this:

```bash
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin
```

---

## Limitations and Gotchas

### Branch Lock

As mentioned, no two worktrees can share a branch. This is enforced even for
branches that track the same remote branch.

### Submodules

Submodules in linked worktrees can be tricky. Each worktree needs its own
submodule checkout. Run `git submodule update --init` in each new worktree.

### Hooks

Git hooks are shared across all worktrees (they live in the main `.git/hooks`
directory). A hook that assumes a specific working directory layout may break
in linked worktrees.

### IDE Integration

Some IDEs may not fully understand worktrees. They might show incorrect branch
info or fail to detect that two open windows share the same repository.

### Disk Space

Worktrees share the object store but each has its own copy of the working tree
files. Large repos will use significant disk space per worktree.

---

## Cleanup Best Practices

1. **Remove worktrees when done** — don't let stale worktrees accumulate.
2. **Use `prune` periodically** — especially if you sometimes `rm -rf`
   worktree directories manually.
3. **Check `git worktree list`** — before creating new worktrees to see what
   already exists.
4. **Use meaningful paths** — `../project-hotfix-123` is better than `../tmp`.

```bash
# Full cleanup routine
git worktree list                  # see what exists
git worktree remove ../old-feature # remove cleanly
git worktree prune --dry-run       # check for stale refs
git worktree prune                 # clean them up
```

---

## Quick Reference

| Command                              | Description                            |
| ------------------------------------ | -------------------------------------- |
| `git worktree add <path> <branch>`   | Create linked worktree                 |
| `git worktree add <path> -b <new>`   | Create worktree with new branch        |
| `git worktree add --detach <path>`   | Create worktree in detached HEAD       |
| `git worktree list`                  | List all worktrees                     |
| `git worktree list --porcelain`      | Machine-readable list                  |
| `git worktree remove <path>`         | Remove a linked worktree               |
| `git worktree remove --force <path>` | Force remove (dirty working tree)      |
| `git worktree prune`                 | Remove stale worktree references       |
| `git worktree lock <path>`           | Prevent worktree from being pruned     |
| `git worktree unlock <path>`         | Allow worktree to be pruned again      |

---

## Further Reading

- `git help worktree`
- [Git Documentation — git-worktree](https://git-scm.com/docs/git-worktree)
- [Bare repo + worktrees workflow](https://morgan.cugeez.com/blog/worktrees-with-bare-repo)
