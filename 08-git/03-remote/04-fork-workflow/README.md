# Git Fork Workflow

## Table of Contents
1. [Introduction](#introduction)
2. [Forking Model](#forking-model)
3. [Upstream Remote](#upstream-remote)
4. [Keeping Fork in Sync](#keeping-fork-in-sync)
5. [Contributing to OSS](#contributing-to-oss)
6. [Signed Commits](#signed-commits)
7. [Fork vs Clone](#fork-vs-clone)
8. [Best Practices](#best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Summary](#summary)

---

## Introduction

The fork workflow is the standard model for contributing to open-source projects.
Instead of pushing directly to the original repository, you create a personal
copy (fork), make changes there, and propose changes via pull requests.

---

## Forking Model

```
Original Repo (upstream)        Your Fork (origin)         Local
github.com/org/repo      →   github.com/you/repo    →   ~/dev/repo
                              (Fork button)               (git clone)
```

### Flow

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Add upstream** remote pointing to original
4. **Create branch** for your changes
5. **Push** to your fork
6. **Open PR** from your fork to the original

---

## Upstream Remote

```bash
# After cloning your fork
git remote add upstream https://github.com/original/repo.git

# Verify
git remote -v
# origin    git@github.com:you/repo.git (fetch)
# origin    git@github.com:you/repo.git (push)
# upstream  https://github.com/original/repo.git (fetch)
# upstream  https://github.com/original/repo.git (push)
```

---

## Keeping Fork in Sync

```bash
# Fetch upstream changes
git fetch upstream

# Update local main
git switch main
git merge upstream/main
# or
git rebase upstream/main

# Push updated main to your fork
git push origin main
```

### One-liner Sync

```bash
git pull upstream main && git push origin main
```

---

## Contributing to OSS

### Step-by-Step

```bash
# 1. Fork on GitHub (web UI)

# 2. Clone your fork
git clone git@github.com:you/repo.git
cd repo

# 3. Add upstream
git remote add upstream https://github.com/original/repo.git

# 4. Create feature branch
git switch -c fix/typo-in-readme

# 5. Make changes, commit
git add . && git commit -m "fix: Correct typo in README"

# 6. Push to your fork
git push -u origin fix/typo-in-readme

# 7. Open PR on GitHub (from your fork to upstream)
```

### Contributing Guidelines

Most projects have a `CONTRIBUTING.md` file. Common requirements:
- Sign CLA (Contributor License Agreement)
- Follow code style guidelines
- Include tests
- Sign commits with GPG
- Reference issue numbers

---

## Signed Commits

### Why Sign Commits?

- **Verify identity**: Prove you authored the commit
- **Required by many OSS projects**: Trust chain
- **GitHub shows "Verified" badge**: Visual trust indicator

### GPG Setup

```bash
# Generate GPG key
gpg --full-generate-key

# List keys
gpg --list-secret-keys --keyid-format=long

# Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Sign a commit
git commit -S -m "Signed commit"

# Verify signatures
git log --show-signature
```

### SSH Signing (Git 2.34+)

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

---

## Fork vs Clone

| | Fork | Clone |
|--|------|-------|
| Creates new repo? | Yes (on server) | No (local copy) |
| Push access? | Your fork only | Depends on permissions |
| Use case | Contributing to others' repos | Working on your own repos |
| Linked to original? | On platform level | Via remotes |

---

## Best Practices

1. **Always work on feature branches**, never on main
2. **Sync frequently** with upstream to avoid divergence
3. **Sign commits** for OSS contributions
4. **Read CONTRIBUTING.md** before submitting PRs
5. **Reference issues** in commit messages and PRs
6. **Keep fork's main clean** — only sync with upstream

---

## Common Pitfalls

### 1. Committing directly to fork's main
```bash
# Always branch from main
git switch main
git pull upstream main
git switch -c feature/my-change
```

### 2. Forgetting to sync with upstream
Your fork becomes stale, leading to merge conflicts in PRs.

### 3. Pushing to upstream instead of origin
```bash
git push origin feature  # Correct: push to YOUR fork
git push upstream feature  # Wrong: push to original (will fail)
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `git remote add upstream <url>` | Add original repo remote |
| `git fetch upstream` | Get upstream changes |
| `git merge upstream/main` | Update local main |
| `git push origin main` | Sync fork's main |
| `git commit -S` | Sign commit with GPG |
| `git log --show-signature` | Verify signatures |

### Key Concepts

- **Fork** = server-side copy of a repository
- **upstream** = conventional name for the original repo
- **Sync regularly** to keep fork up to date
- **Feature branches** keep fork's main clean
- **Signed commits** verify author identity
