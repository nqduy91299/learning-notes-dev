# Git Diff & Show

## Table of Contents

1. [Introduction](#introduction)
2. [git diff](#git-diff)
3. [Diff Between States](#diff-between-states)
4. [git show](#git-show)
5. [Diff Output Format](#diff-output-format)
6. [Hunks](#hunks)
7. [Diff Options](#diff-options)
8. [Comparing Branches and Commits](#comparing-branches-and-commits)
9. [External Diff Tools](#external-diff-tools)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Understanding diffs is essential for code review, debugging, and version control
mastery. `git diff` shows the exact line-by-line changes between different states
of your files, while `git show` displays the contents and changes of specific
commits or objects.

---

## git diff

### The Three Comparisons

```
Working Directory ←──git diff──→ Staging Area (Index)
Staging Area      ←──git diff --cached──→ Last Commit (HEAD)
Working Directory ←──git diff HEAD──→ Last Commit (HEAD)
```

### Basic Usage

```bash
# Working directory vs staging area (unstaged changes)
git diff

# Staging area vs last commit (staged changes)
git diff --cached
# or
git diff --staged

# Working directory vs last commit (all uncommitted changes)
git diff HEAD

# Specific file
git diff path/to/file.ts

# Between two commits
git diff abc123 def456

# Between two branches
git diff main feature
git diff main..feature
```

---

## Diff Between States

### Unstaged Changes

```bash
$ echo "modified content" > file.txt
$ git diff
```

Shows what you've changed but haven't staged yet.

### Staged Changes

```bash
$ git add file.txt
$ git diff --cached
```

Shows what's staged and will go into the next commit.

### All Uncommitted Changes

```bash
$ git diff HEAD
```

Shows everything that differs from the last commit (both staged and unstaged).

### Between Commits

```bash
# Between two specific commits
git diff abc123..def456

# Between a commit and HEAD
git diff abc123..HEAD

# Changes introduced by the last commit
git diff HEAD~1..HEAD
# or simply
git diff HEAD~1
```

---

## git show

### Viewing Commits

```bash
# Show the most recent commit
git show

# Show a specific commit
git show abc123

# Show only the diff (no metadata)
git show --stat abc123

# Show specific file at a commit
git show abc123:path/to/file.ts
```

### Viewing Other Objects

```bash
# Show a tag
git show v1.0.0

# Show a tree (directory listing at a commit)
git show abc123:src/

# Show a blob (file content at a commit)
git show abc123:README.md
```

### Output Format

```
commit abc123def456...
Author: Alice <alice@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Add user authentication

diff --git a/src/auth.ts b/src/auth.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/auth.ts
@@ -0,0 +1,15 @@
+export function login(user: string, pass: string) {
+  // implementation
+}
```

---

## Diff Output Format

### Unified Diff Format

```diff
diff --git a/file.txt b/file.txt
index abc1234..def5678 100644
--- a/file.txt
+++ b/file.txt
@@ -1,7 +1,7 @@
 line 1 (context)
 line 2 (context)
-old line 3 (removed)
+new line 3 (added)
 line 4 (context)
 line 5 (context)
```

### Header Breakdown

| Line | Meaning |
|------|---------|
| `diff --git a/file b/file` | Files being compared |
| `index abc..def 100644` | Blob SHAs and file mode |
| `--- a/file.txt` | Original file |
| `+++ b/file.txt` | Modified file |
| `@@ -1,7 +1,7 @@` | Hunk header (line ranges) |

### Line Prefixes

| Prefix | Meaning |
|--------|---------|
| ` ` (space) | Context line (unchanged) |
| `-` | Removed line |
| `+` | Added line |
| `\` | No newline at end of file |

---

## Hunks

### Hunk Headers

```
@@ -start,count +start,count @@ optional function context
```

- `-start,count`: Starting line and number of lines in the original
- `+start,count`: Starting line and number of lines in the modified

Example:
```
@@ -10,6 +10,8 @@ function processData() {
```
This hunk starts at line 10 in both files. Original has 6 lines, modified has 8.

### Multiple Hunks

A diff can have multiple hunks when changes are in different parts of the file:

```diff
@@ -1,5 +1,5 @@
 header
-old title
+new title
 description

@@ -20,5 +20,6 @@
 existing code
+new line added
 more code
```

### Context Lines

By default, git shows 3 lines of context around each change. Adjust with `-U`:

```bash
git diff -U5        # 5 lines of context
git diff -U0        # No context (only changed lines)
git diff -U10       # 10 lines of context
```

---

## Diff Options

### Stat and Summary

```bash
# File-level summary (insertions/deletions per file)
git diff --stat

# Even more compact
git diff --shortstat

# Just file names
git diff --name-only

# Names with status indicators
git diff --name-status
```

### Word Diff

```bash
# Show word-level changes (inline)
git diff --word-diff

# Color only (no +/- markers)
git diff --word-diff=color

# Custom word delimiter
git diff --word-diff-regex="[a-zA-Z]+"
```

### Ignoring Changes

```bash
# Ignore whitespace changes
git diff -w
# or
git diff --ignore-all-space

# Ignore changes in amount of whitespace
git diff -b

# Ignore blank lines
git diff --ignore-blank-lines

# Detect moves/copies
git diff -M    # Detect renames
git diff -C    # Detect copies
```

### Binary Files

```bash
# Show binary files changed (no diff content)
git diff --stat  # Shows "Bin 1234 -> 5678 bytes"

# Use textconv for diffable binary formats
git config diff.pdf.textconv "pdftotext"
```

---

## Comparing Branches and Commits

### Two-dot vs Three-dot

```bash
# Two-dot: diff between tips of two branches
git diff main..feature
# What changed between the tip of main and tip of feature

# Three-dot: diff since branches diverged
git diff main...feature
# What changed on feature since it branched off main
```

### Visual Representation

```
main:    A --- B --- C
              \
feature:       D --- E

git diff main..feature   = diff between C and E
git diff main...feature  = diff between B and E (changes on feature only)
```

### Practical Usage

```bash
# What will a merge bring in?
git diff main...feature

# What's different between branches right now?
git diff main..feature

# What changed in my last commit?
git diff HEAD~1

# What will I push?
git diff origin/main..HEAD
```

---

## External Diff Tools

### Configuration

```bash
# Set up a diff tool
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

# Use the tool
git difftool
git difftool HEAD~1
```

### Common Tools

```bash
# VS Code
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

# vimdiff
git config --global diff.tool vimdiff
```

---

## Best Practices

1. **Always review diffs before committing**: `git diff --cached`
2. **Use `--stat` for overview**: Quick summary before detailed diff
3. **Use `--word-diff` for prose**: Better for documentation changes
4. **Use three-dot for PRs**: Shows only what the branch added
5. **Ignore whitespace when needed**: `-w` flag avoids noise
6. **Set up a diff tool**: Visual tools help for complex diffs

---

## Common Pitfalls

### 1. Confusing diff directions

```bash
git diff         # Working vs staged (NOT vs committed)
git diff --cached # Staged vs committed
git diff HEAD    # Working vs committed (both staged and unstaged)
```

### 2. Forgetting about staged changes

After `git add`, `git diff` shows nothing for that file.
Use `git diff --cached` to see staged changes.

### 3. Two-dot vs three-dot confusion

In `git diff`, the dots mean the opposite of what they mean in `git log`:
- `git log A..B` = commits in B not in A
- `git diff A..B` = diff between A and B (same as `git diff A B`)

### 4. Large binary diffs

Binary files produce unhelpful diffs. Use `--stat` or configure textconv.

---

## Summary

| Command | Purpose |
|---------|---------|
| `git diff` | Working dir vs staging |
| `git diff --cached` | Staging vs HEAD |
| `git diff HEAD` | Working dir vs HEAD |
| `git diff A..B` | Between two refs |
| `git diff A...B` | Changes since divergence |
| `git show <ref>` | Show commit details + diff |
| `git show <ref>:<path>` | Show file at specific commit |
| `git diff --stat` | Summary of changes |
| `git diff --word-diff` | Word-level changes |
| `git diff -w` | Ignore whitespace |
| `git diff -U<n>` | Set context lines |

### Key Concepts

- **Three comparisons**: working↔staged, staged↔HEAD, working↔HEAD
- **Unified diff format**: `---`/`+++` headers, `-`/`+` line prefixes
- **Hunks**: Sections of changes with `@@` headers showing line ranges
- **Two-dot** diffs between tips; **three-dot** diffs since divergence
- **`git show`** displays commit details including the diff it introduced
