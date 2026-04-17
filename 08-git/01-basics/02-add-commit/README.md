# Git Add & Commit

## Table of Contents

1. [Introduction](#introduction)
2. [The Staging Area](#the-staging-area)
3. [git add](#git-add)
4. [git commit](#git-commit)
5. [Commit Messages](#commit-messages)
6. [Amending Commits](#amending-commits)
7. [Atomic Commits](#atomic-commits)
8. [The Index Internals](#the-index-internals)
9. [Interactive Staging](#interactive-staging)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

The staging area (also called the "index") is one of Git's most distinctive
features. It sits between the working directory and the repository, acting as
a preparation area for your next commit. Understanding the add-commit workflow
is fundamental to using Git effectively.

---

## The Staging Area

### Three-Tree Architecture

Git manages three "trees" of file state:

```
Working Directory  →  Staging Area (Index)  →  Repository (HEAD)
     (edit)             (git add)               (git commit)
```

**Working Directory**: Your actual files on disk.

**Staging Area (Index)**: A snapshot of what will go into the next commit.
Stored in `.git/index` as a binary file.

**Repository (HEAD)**: The last committed snapshot.

### Why a Staging Area?

The staging area enables:

1. **Partial commits**: Stage only some changes from a file
2. **Review before commit**: Inspect what will be committed
3. **Atomic commits**: Group related changes together
4. **Workflow flexibility**: Work on multiple things, commit separately

### Visualizing the Three Trees

```
         Working Dir       Index          HEAD
         ──────────       ─────         ────────
File A:  [modified]  →  [staged]   →  [committed]
File B:  [modified]      [clean]       [committed]
File C:  [new file]     [not tracked]  [not present]
```

After `git add A`: A is staged, ready to commit.
After `git commit`: Index matches HEAD for staged files.

---

## git add

### Basic Commands

```bash
# Stage a specific file
git add file.txt

# Stage multiple files
git add file1.txt file2.txt

# Stage all changes in current directory (recursively)
git add .

# Stage all changes in the entire working tree
git add -A
# or equivalently
git add --all

# Stage only tracked files (no new files)
git add -u
# or
git add --update
```

### git add . vs git add -A

```bash
# In the root of the repository, these are equivalent:
git add .
git add -A

# BUT in a subdirectory:
git add .    # Only stages changes in current directory and below
git add -A   # Stages all changes in the entire working tree
```

### Interactive Staging: git add -p

The `-p` (patch) flag lets you stage parts of files interactively:

```bash
git add -p
# or for a specific file
git add -p file.txt
```

Git shows each change "hunk" and prompts:

```
Stage this hunk [y,n,q,a,d,s,e,?]?
```

| Key | Action |
|-----|--------|
| `y` | Stage this hunk |
| `n` | Skip this hunk |
| `q` | Quit (don't stage remaining) |
| `a` | Stage this and all remaining hunks in this file |
| `d` | Don't stage this or remaining hunks in this file |
| `s` | Split into smaller hunks |
| `e` | Manually edit the hunk |

### Staging Deleted and Renamed Files

```bash
# Stage a deletion
git add deleted-file.txt
# or
git rm deleted-file.txt

# Stage a rename (Git detects it automatically)
git mv old-name.txt new-name.txt
# This is equivalent to:
mv old-name.txt new-name.txt
git add new-name.txt
git rm old-name.txt
```

### Unstaging Files

```bash
# Unstage a file (keep changes in working directory)
git restore --staged file.txt
# or (older syntax)
git reset HEAD file.txt
```

---

## git commit

### Basic Usage

```bash
# Commit with inline message
git commit -m "Add user authentication"

# Commit with editor (opens configured editor)
git commit

# Commit with multi-line message inline
git commit -m "Subject line" -m "Body paragraph"
```

### Commit and Add Shortcuts

```bash
# Stage all tracked modified files AND commit (skip `git add`)
git commit -a -m "Fix all the things"
# or
git commit -am "Fix all the things"
# NOTE: This does NOT add untracked (new) files!
```

### Empty Commits

```bash
# Create a commit with no changes (useful for triggering CI)
git commit --allow-empty -m "Trigger CI build"
```

### Verbose Commit

```bash
# Show diff in the commit editor
git commit -v
# or
git commit --verbose
```

---

## Commit Messages

### Conventional Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

### The Seven Rules

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood ("Add feature" not "Added feature")
6. Wrap the body at 72 characters
7. Use the body to explain *what* and *why*, not *how*

### Good Examples

```
feat(auth): Add JWT token refresh mechanism

The existing token system did not handle expiration gracefully.
Users were logged out without warning when tokens expired.

This adds automatic token refresh 5 minutes before expiration,
with a fallback to re-authentication if refresh fails.

Closes #142
```

```
fix(api): Prevent race condition in batch processing

Multiple requests could modify the same batch simultaneously,
leading to corrupted data. Add mutex lock around batch updates.
```

### Bad Examples

```
# Too vague
fixed stuff

# Past tense
Added new feature

# No context
update

# Way too long
Added a new feature that allows users to track their metrics and export them to CSV and JSON and also PDF
```

---

## Amending Commits

### git commit --amend

```bash
# Amend the last commit message
git commit --amend -m "Better commit message"

# Amend by adding more staged changes to the last commit
git add forgotten-file.txt
git commit --amend --no-edit
```

### Important Caveats

- **Amending rewrites history** — the commit SHA changes
- **Never amend commits that have been pushed** to a shared branch
- Amending creates a new commit object; the old one becomes unreachable

```
Before amend:
A --- B --- C (HEAD, main)

After amend (changing C):
A --- B --- C' (HEAD, main)
          \
           C  (orphaned, still in reflog)
```

---

## Atomic Commits

### What is an Atomic Commit?

An atomic commit contains exactly one logical change:

- One bug fix
- One feature addition
- One refactoring step

### Why Atomic Commits Matter

1. **Easy to review**: Each commit tells one story
2. **Easy to revert**: Undo one change without affecting others
3. **Easy to cherry-pick**: Move individual changes between branches
4. **Better git bisect**: Find exactly which change introduced a bug
5. **Clean history**: The project timeline is readable

### Examples

**Bad** — Multiple unrelated changes in one commit:

```
commit: Fix login bug, update README, refactor database, add tests
```

**Good** — Separate atomic commits:

```
commit 1: fix(auth): Validate email format before login attempt
commit 2: docs: Update API section of README
commit 3: refactor(db): Extract connection pooling to separate module
commit 4: test(auth): Add integration tests for login flow
```

### Workflow for Atomic Commits

```bash
# Make multiple changes, but stage them separately
git add src/auth/login.ts
git commit -m "fix(auth): Validate email format before login"

git add README.md
git commit -m "docs: Update API section of README"

# Use interactive staging to split changes within a file
git add -p src/database.ts
git commit -m "refactor(db): Extract connection pooling"
```

---

## The Index Internals

### Inspecting the Staging Area

```bash
# Show all files in the index
git ls-files

# Show staged files with their blob SHAs
git ls-files --stage

# Show differences between index and HEAD
git diff --cached

# Show differences between working directory and index
git diff
```

### Index File Format

The `.git/index` file is binary and contains:

- File paths being tracked
- File metadata (timestamps, size, mode)
- Blob SHA-1 for each file's content
- Flags and extended flags

### How git add Works Internally

1. Computes SHA-1 hash of the file content
2. Stores the content as a blob object in `.git/objects/`
3. Updates the index entry for that file path with the new SHA

```bash
$ echo "Hello" > test.txt
$ git add test.txt
$ git ls-files --stage
100644 ce013625030ba8dba906f756967f9e9ca394464a 0	test.txt
#      ^ blob SHA                                     ^ file path
```

---

## Interactive Staging

### git add -i

Full interactive mode with a menu:

```bash
$ git add -i
           staged     unstaged path
  1:    unchanged        +1/-0 file1.txt
  2:    unchanged        +3/-1 file2.txt

*** Commands ***
  1: status   2: update   3: revert   4: add untracked
  5: patch    6: diff     7: quit     8: help
What now>
```

### Splitting Hunks

When `git add -p` shows a large hunk, press `s` to split it:

```diff
@@ -1,10 +1,10 @@
 line 1
-old line 2
+new line 2
 line 3
 line 4
 line 5
-old line 6
+new line 6
 line 7
```

Pressing `s` splits this into two hunks so you can stage each independently.

---

## Best Practices

### Staging Workflow

1. **Review before staging**: `git diff` to see all changes
2. **Stage intentionally**: Use `git add -p` for partial staging
3. **Verify staging**: `git diff --cached` to review what's staged
4. **Commit atomically**: One logical change per commit
5. **Write good messages**: Follow the conventional format

### Pre-commit Checklist

- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Check diff: `git diff --cached`
- [ ] Write descriptive commit message
- [ ] Ensure commit is atomic

### Configuration

```bash
# Set your preferred editor for commit messages
git config --global core.editor "code --wait"

# Set up commit template
git config --global commit.template ~/.gitmessage

# Enable verbose mode by default
git config --global commit.verbose true
```

---

## Common Pitfalls

### 1. Committing without staging

```bash
$ git commit -m "Update file"
# nothing to commit, working tree clean
# (if no changes are staged)
```

### 2. Using -a with new files

```bash
$ touch new-file.txt
$ git commit -am "Add new file"
# new-file.txt is NOT included — it's untracked
# Must explicitly: git add new-file.txt
```

### 3. Forgetting to stage all parts of a change

```bash
# Modified both the source and the test
$ git add src/feature.ts
$ git commit -m "Add feature"
# Oops — test file not included!
```

### 4. Amending pushed commits

```bash
$ git push origin main
$ git commit --amend  # DANGER: creates diverged history
# Now requires force push, which can break others' work
```

### 5. Large unfocused commits

```bash
# Days of work in one commit — impossible to review or bisect
$ git add .
$ git commit -m "Done with sprint work"
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git add <file>` | Stage specific file |
| `git add .` | Stage all changes in current dir |
| `git add -A` | Stage all changes everywhere |
| `git add -u` | Stage modified/deleted tracked files |
| `git add -p` | Interactive patch staging |
| `git commit -m "msg"` | Commit with message |
| `git commit -a` | Stage tracked + commit |
| `git commit --amend` | Modify last commit |
| `git commit -v` | Show diff in editor |
| `git restore --staged <f>` | Unstage a file |
| `git diff` | Working dir vs index |
| `git diff --cached` | Index vs HEAD |

### Key Concepts

- **Staging area** separates "changed" from "ready to commit"
- **`git add -p`** enables partial file staging for atomic commits
- **`git commit -a`** skips staging but ignores untracked files
- **`--amend`** rewrites history — never amend pushed commits
- **Atomic commits** contain exactly one logical change
- **Commit messages** should be imperative, concise, and descriptive
