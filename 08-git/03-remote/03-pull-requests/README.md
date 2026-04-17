# Git Pull Requests

## Table of Contents
1. [Introduction](#introduction)
2. [PR Workflow](#pr-workflow)
3. [Code Review](#code-review)
4. [Draft PRs](#draft-prs)
5. [PR Templates](#pr-templates)
6. [Merge Strategies](#merge-strategies)
7. [Squash and Merge](#squash-and-merge)
8. [Rebase and Merge](#rebase-and-merge)
9. [Merge Commit](#merge-commit)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)
12. [Common Pitfalls](#common-pitfalls)
13. [Summary](#summary)

---

## Introduction

Pull Requests (PRs) — called Merge Requests (MRs) on GitLab — are a collaboration
feature built on top of Git branching. They provide a structured way to propose,
review, discuss, and merge changes.

Note: PRs are not a Git feature — they're a platform feature (GitHub, GitLab,
Bitbucket). But understanding how they interact with Git merging is essential.

---

## PR Workflow

### Basic Flow

1. Create a feature branch
2. Make commits on the feature branch
3. Push the branch to the remote
4. Open a Pull Request
5. Code review and discussion
6. CI/CD checks pass
7. Merge the PR
8. Delete the feature branch

```bash
git switch -c feature/user-auth
# ... make changes ...
git add . && git commit -m "feat: Add user authentication"
git push -u origin feature/user-auth
# Open PR on GitHub/GitLab
```

---

## Code Review

### What Reviewers Look For

- **Correctness**: Does the code work as intended?
- **Design**: Is the architecture sound?
- **Style**: Does it follow project conventions?
- **Tests**: Are there adequate tests?
- **Documentation**: Is it documented?
- **Security**: Any vulnerabilities?
- **Performance**: Any bottlenecks?

### Review Actions

- **Approve**: Changes look good
- **Request Changes**: Issues that must be fixed
- **Comment**: General feedback, no block

---

## Draft PRs

Draft PRs signal "work in progress" — they can't be merged until marked ready.

### Use Cases

- Early feedback on approach before finishing
- CI/CD verification while developing
- Visibility into ongoing work
- Pair programming coordination

---

## PR Templates

Create `.github/pull_request_template.md`:

```markdown
## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
<!-- How was this tested? -->

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
```

---

## Merge Strategies

### Three Options on GitHub

1. **Create a merge commit** — preserves all commits + merge commit
2. **Squash and merge** — combines all commits into one
3. **Rebase and merge** — replays commits on base (no merge commit)

### Comparison

| Strategy | History | Use When |
|----------|---------|----------|
| Merge commit | Branch topology preserved | Want full history |
| Squash | One clean commit | Messy branch history |
| Rebase | Linear, individual commits | Clean commits already |

---

## Squash and Merge

Combines all PR commits into a single commit on the base branch.

```
Before (feature has 5 commits):
main:    A --- B
                \
feature:         C --- D --- E --- F --- G

After squash merge:
main:    A --- B --- S (single squashed commit)
```

### Pros
- Clean history — one commit per feature
- Bad commit messages don't pollute main

### Cons
- Loses individual commit history
- Harder to bisect within a feature
- Author information consolidated

---

## Rebase and Merge

Replays PR commits individually on top of the base branch.

```
Before:
main:    A --- B
                \
feature:         C --- D --- E

After rebase merge:
main:    A --- B --- C' --- D' --- E'
```

### Pros
- Linear history
- Individual commits preserved
- No merge commits

### Cons
- Commits get new SHAs
- Requires clean commit history

---

## Merge Commit

Creates a merge commit that joins the two branch histories.

```
Before:
main:    A --- B --- F
                \
feature:         C --- D --- E

After merge commit:
main:    A --- B --- F --- M
                \         /
feature:         C --- D --- E
```

### Pros
- Preserves complete history
- Easy to revert entire feature (`git revert -m 1 M`)
- Branch topology visible in graph

### Cons
- More complex history
- Merge commits add noise for some workflows

---

## CI/CD Integration

### Required Checks

- Unit tests pass
- Integration tests pass
- Linter/formatter check
- Build succeeds
- Code coverage threshold met
- Security scan passes

### Branch Protection Rules

- Require PR reviews before merging
- Require status checks to pass
- Require up-to-date branch
- Restrict who can push to main
- Require signed commits

---

## Best Practices

1. **Keep PRs small** — easier to review, less risk
2. **One concern per PR** — don't mix features and refactoring
3. **Write descriptive titles and descriptions**
4. **Respond to reviews promptly**
5. **Use draft PRs** for early feedback
6. **Update branch before merging** — avoid stale merges
7. **Delete branches after merge** — keep repo clean

---

## Common Pitfalls

### 1. Large PRs
Large PRs get superficial reviews. Split into smaller, focused PRs.

### 2. Not updating before merge
Merging a stale branch can introduce subtle bugs.

### 3. Merge conflicts after approval
Always rebase/update after the last review before merging.

### 4. Choosing wrong merge strategy
- Use squash for WIP-heavy branches
- Use rebase for clean commit histories
- Use merge commits when topology matters

---

## Summary

| Concept | Description |
|---------|-------------|
| PR/MR | Structured proposal to merge a branch |
| Draft PR | Work-in-progress, can't be merged |
| Squash merge | All commits → one commit |
| Rebase merge | Replay commits linearly |
| Merge commit | Preserve branch topology |
| Branch protection | Rules that gate merging |
| PR template | Standardized description format |

### Key Concepts

- PRs are a **platform feature**, not a Git command
- Three merge strategies: **merge commit**, **squash**, **rebase**
- **Squash** is best for messy branches, **rebase** for clean ones
- **Branch protection** enforces quality gates
- Keep PRs **small and focused** for better reviews
