# Git Init & Clone

## Table of Contents

1. [Introduction](#introduction)
2. [git init](#git-init)
3. [The .git Directory](#the-git-directory)
4. [git clone](#git-clone)
5. [HTTPS vs SSH](#https-vs-ssh)
6. [Bare Repositories](#bare-repositories)
7. [Shallow Clones](#shallow-clones)
8. [Template Directories](#template-directories)
9. [Reinitializing Repositories](#reinitializing-repositories)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Every Git journey begins with either `git init` (creating a new repository) or
`git clone` (copying an existing one). Understanding these foundational commands
and the structures they create is essential for working effectively with Git.

This module covers how Git initializes repositories, what the `.git` directory
contains, various cloning strategies, and when to use each approach.

---

## git init

### Basic Usage

```bash
# Initialize a new repository in the current directory
git init

# Initialize in a specific directory
git init my-project

# Initialize with a specific default branch name
git init --initial-branch=main my-project
git init -b main my-project
```

### What Happens When You Run git init

1. Git creates a `.git` subdirectory in the target folder
2. Sets up the initial directory structure for version control
3. Creates an initial HEAD reference pointing to the default branch
4. No commits exist yet — the branch is "unborn"

```bash
$ mkdir my-project && cd my-project
$ git init
Initialized empty Git repository in /path/to/my-project/.git/
$ git status
On branch main

No commits yet

nothing to commit (create copy or use "git add" first)
```

### The "Unborn" Branch State

After `git init`, you are on a branch that has no commits. The branch reference
file does not yet exist on disk. The first commit creates the branch.

```bash
$ git init fresh-repo && cd fresh-repo
$ ls .git/refs/heads/
# Empty — no branch file yet

$ git commit --allow-empty -m "Initial commit"
$ ls .git/refs/heads/
main   # Now the branch file exists
```

---

## The .git Directory

The `.git` directory is the heart of every Git repository. Understanding its
structure helps demystify how Git works internally.

### Directory Structure

```
.git/
├── HEAD            # Points to the current branch ref
├── config          # Repository-specific configuration
├── description     # Used by GitWeb (rarely modified)
├── hooks/          # Client-side and server-side hook scripts
│   ├── pre-commit.sample
│   ├── commit-msg.sample
│   └── ...
├── info/
│   └── exclude     # Local ignore patterns (not shared)
├── objects/        # Object database (blobs, trees, commits, tags)
│   ├── info/
│   └── pack/
├── refs/           # Reference pointers
│   ├── heads/      # Local branch references
│   ├── tags/       # Tag references
│   └── remotes/    # Remote-tracking references
├── index           # Staging area (binary file)
└── logs/           # Reflog entries
    ├── HEAD
    └── refs/
```

### Key Files Explained

**HEAD** — A symbolic reference that typically points to a branch:

```
ref: refs/heads/main
```

When in detached HEAD state, it contains a raw commit SHA:

```
a1b2c3d4e5f6...
```

**config** — Repository-level configuration (overrides global):

```ini
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
[remote "origin"]
    url = git@github.com:user/repo.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
    remote = origin
    merge = refs/heads/main
```

**objects/** — All Git objects stored as SHA-1 hashed files:

- **Blob**: File content
- **Tree**: Directory listing (pointers to blobs and other trees)
- **Commit**: Snapshot pointer + metadata (author, message, parent)
- **Tag**: Annotated tag object

Objects are stored in subdirectories named by the first two hex characters:

```
objects/a1/b2c3d4e5f6...  →  SHA = a1b2c3d4e5f6...
```

**refs/heads/** — Each file contains the SHA of the commit that branch points to:

```bash
$ cat .git/refs/heads/main
a1b2c3d4e5f6789...
```

**index** — The staging area, a binary file tracking what will go into the next
commit. Use `git ls-files --stage` to inspect it.

---

## git clone

### Basic Usage

```bash
# Clone a repository
git clone https://github.com/user/repo.git

# Clone into a specific directory
git clone https://github.com/user/repo.git my-folder

# Clone a specific branch
git clone --branch develop https://github.com/user/repo.git

# Clone with limited depth
git clone --depth 1 https://github.com/user/repo.git
```

### What Happens During git clone

1. Creates a new directory (or uses the specified name)
2. Runs `git init` inside it
3. Adds the source as `origin` remote
4. Fetches all branches and tags from the remote
5. Checks out the default branch (usually `main` or `master`)

This is roughly equivalent to:

```bash
mkdir repo && cd repo
git init
git remote add origin https://github.com/user/repo.git
git fetch origin
git checkout -b main origin/main
```

### Clone Options

```bash
# Clone only a single branch
git clone --single-branch --branch main <url>

# Clone with all submodules
git clone --recurse-submodules <url>

# Clone with a reference repository (for speed)
git clone --reference /path/to/local/repo <url>

# Clone into a bare repository
git clone --bare <url>

# Clone as a mirror (bare + all refs)
git clone --mirror <url>
```

---

## HTTPS vs SSH

### HTTPS Cloning

```bash
git clone https://github.com/user/repo.git
```

**Pros:**
- Works through most firewalls and proxies
- No SSH key setup required
- Simpler initial setup

**Cons:**
- Requires authentication on each push (mitigated by credential helpers)
- Token-based auth needed for GitHub (password auth deprecated)

**Credential Helpers:**

```bash
# Cache credentials in memory for 15 minutes
git config --global credential.helper cache

# Store credentials on disk (less secure)
git config --global credential.helper store

# macOS Keychain
git config --global credential.helper osxkeychain
```

### SSH Cloning

```bash
git clone git@github.com:user/repo.git
```

**Pros:**
- Key-based authentication (no passwords)
- More secure for regular use
- Seamless push/pull once configured

**Cons:**
- Requires SSH key setup
- May be blocked by corporate firewalls
- Key management overhead

**SSH Key Setup:**

```bash
# Generate an Ed25519 key (recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start ssh-agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Test connection
ssh -T git@github.com
```

---

## Bare Repositories

A bare repository has no working tree — it only contains the contents of `.git`.

```bash
# Create a bare repository
git init --bare my-project.git

# Clone as bare
git clone --bare https://github.com/user/repo.git
```

### Structure

```
my-project.git/
├── HEAD
├── config
├── objects/
├── refs/
└── ...
# No working tree files
```

### Use Cases

- **Central/shared repositories**: Servers use bare repos to receive pushes
- **Git hosting**: GitHub, GitLab store repos as bare
- **CI/CD caches**: Reference repositories for faster clones

### Key Difference

```bash
# Regular repository
$ cat .git/config
[core]
    bare = false

# Bare repository
$ cat config
[core]
    bare = true
```

You cannot `git add` or `git commit` in a bare repository because there is no
working tree.

---

## Shallow Clones

Shallow clones download only recent history, saving time and disk space.

```bash
# Clone only the latest commit
git clone --depth 1 <url>

# Clone the latest 10 commits
git clone --depth 10 <url>

# Shallow clone of a specific branch
git clone --depth 1 --branch release-v2 <url>
```

### Deepening a Shallow Clone

```bash
# Fetch more history
git fetch --deepen=50

# Convert to a full clone
git fetch --unshallow
```

### Limitations

- `git log` only shows available history
- `git blame` may stop at the shallow boundary
- Some merge operations may fail if common ancestors are missing
- `git push` may be restricted depending on server config

### Use Cases

- CI/CD pipelines (only need latest code)
- Large repositories with extensive history
- Quick one-time builds
- Reducing bandwidth in automated workflows

---

## Template Directories

Git can use template directories to initialize repositories with predefined
hooks, ignore patterns, and other configuration.

```bash
# Use a custom template
git init --template=/path/to/template my-project

# Set a global template directory
git config --global init.templateDir /path/to/template
```

### Template Structure

```
template/
├── hooks/
│   ├── pre-commit      # Will be copied to new repos
│   └── commit-msg
├── info/
│   └── exclude         # Default exclude patterns
└── description
```

---

## Reinitializing Repositories

Running `git init` in an existing repository is safe:

```bash
$ cd existing-repo
$ git init
Reinitialized existing Git repository in /path/to/existing-repo/.git/
```

This does **not** destroy any data. It can be used to:

- Pick up new templates
- Reset hooks to defaults
- Fix a corrupted `.git` directory structure

---

## Best Practices

### Repository Initialization

1. **Always create a `.gitignore`** before the first commit
2. **Set the default branch name** to avoid confusion:
   ```bash
   git config --global init.defaultBranch main
   ```
3. **Make an initial commit** immediately (even if empty):
   ```bash
   git commit --allow-empty -m "Initial commit"
   ```

### Cloning Strategy

1. **Use SSH for regular development** — set up keys once, push/pull seamlessly
2. **Use HTTPS for one-time clones** or when SSH is blocked
3. **Use shallow clones in CI/CD** to speed up pipelines
4. **Use `--recurse-submodules`** if the project uses submodules

### .gitignore

Create before first commit to avoid tracking unwanted files:

```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment files
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
```

---

## Common Pitfalls

### 1. Initializing in the Wrong Directory

```bash
# Accidentally initializing in home directory
$ cd ~
$ git init  # BAD — tracks everything in home!

# Fix: remove the .git directory
$ rm -rf .git
```

### 2. Forgetting to Set Up .gitignore

Once files are tracked, adding them to `.gitignore` won't untrack them:

```bash
# File is already tracked
$ echo "node_modules/" >> .gitignore
$ git status
# node_modules still tracked!

# Must explicitly untrack
$ git rm -r --cached node_modules/
```

### 3. Cloning with Wrong Protocol

If SSH is not configured, clone with HTTPS instead:

```bash
# This fails without SSH keys
git clone git@github.com:user/repo.git

# Use HTTPS instead
git clone https://github.com/user/repo.git
```

### 4. Working in a Bare Repository

```bash
$ git clone --bare <url>
$ cd repo.git
$ touch file.txt
$ git add file.txt
fatal: this operation must be run in a work tree
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git init` | Create a new repository |
| `git init --bare` | Create a bare repository (no working tree) |
| `git clone <url>` | Copy a remote repository |
| `git clone --depth N` | Shallow clone with N commits of history |
| `git clone --branch <b>` | Clone and checkout a specific branch |
| `git clone --bare` | Clone as a bare repository |
| `git clone --mirror` | Clone all refs (bare + all remote refs) |
| `git clone --recurse-submodules` | Clone including submodules |

### Key Concepts

- **`git init`** creates the `.git` directory structure
- **`.git`** contains all version control data (objects, refs, config)
- **`git clone`** = init + remote add + fetch + checkout
- **Bare repos** have no working tree — used for sharing
- **Shallow clones** limit history depth — useful for CI/CD
- **HTTPS** is simpler; **SSH** is better for regular development
