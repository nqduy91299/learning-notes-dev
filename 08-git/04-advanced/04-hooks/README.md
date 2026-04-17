# Git Hooks

## Table of Contents
1. [Introduction](#introduction)
2. [Client-Side Hooks](#client-side-hooks)
3. [Server-Side Hooks](#server-side-hooks)
4. [pre-commit Hook](#pre-commit-hook)
5. [commit-msg Hook](#commit-msg-hook)
6. [pre-push Hook](#pre-push-hook)
7. [Husky](#husky)
8. [lint-staged](#lint-staged)
9. [Practical Examples](#practical-examples)
10. [Best Practices](#best-practices)
11. [Common Pitfalls](#common-pitfalls)
12. [Summary](#summary)

---

## Introduction

Git hooks are scripts that run automatically at certain points in the Git
workflow. They let you automate tasks like linting, testing, and validating
commit messages. Hooks live in `.git/hooks/` and are not tracked by Git
(unless using tools like Husky).

---

## Client-Side Hooks

Triggered by operations like committing and merging.

| Hook | Trigger | Use Case |
|------|---------|----------|
| `pre-commit` | Before commit is created | Lint, format, test |
| `prepare-commit-msg` | Before editor opens | Modify default message |
| `commit-msg` | After message is entered | Validate message format |
| `post-commit` | After commit completes | Notifications |
| `pre-rebase` | Before rebase starts | Prevent rebase on certain branches |
| `pre-push` | Before push | Run tests |
| `post-checkout` | After checkout | Rebuild, clean |
| `post-merge` | After merge | Install dependencies |

---

## Server-Side Hooks

Run on the server receiving pushes.

| Hook | Trigger | Use Case |
|------|---------|----------|
| `pre-receive` | Before accepting push | Enforce policies |
| `update` | Per-branch before update | Branch-specific rules |
| `post-receive` | After push completes | Deploy, notify |

---

## pre-commit Hook

Runs before a commit is created. Exit with non-zero to abort.

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linter
npm run lint
if [ $? -ne 0 ]; then
    echo "Lint failed. Fix errors before committing."
    exit 1
fi

# Run type check
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "Type check failed."
    exit 1
fi
```

---

## commit-msg Hook

Validates the commit message. Receives the message file path as argument.

```bash
#!/bin/sh
# .git/hooks/commit-msg

MSG=$(cat "$1")
PATTERN="^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,72}$"

if ! echo "$MSG" | head -1 | grep -qE "$PATTERN"; then
    echo "Invalid commit message format."
    echo "Expected: type(scope): description"
    exit 1
fi
```

---

## pre-push Hook

Runs before push. Can prevent pushing broken code.

```bash
#!/bin/sh
# .git/hooks/pre-push

npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Push aborted."
    exit 1
fi
```

---

## Husky

Husky makes Git hooks easy to manage and share in a project.

```bash
# Install
npm install -D husky
npx husky init

# Add a pre-commit hook
echo "npm test" > .husky/pre-commit
```

### Modern Husky (v9+)

```
.husky/
├── pre-commit
├── commit-msg
└── pre-push
```

---

## lint-staged

Runs linters only on staged files (fast!).

```bash
npm install -D lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.css": "prettier --write"
  }
}
```

Combined with Husky:
```bash
echo "npx lint-staged" > .husky/pre-commit
```

---

## Practical Examples

### Auto-format on Commit
```json
{
  "lint-staged": { "*.{ts,tsx}": "prettier --write" }
}
```

### Prevent Commits to Main
```bash
#!/bin/sh
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "main" ]; then
    echo "Cannot commit directly to main!"
    exit 1
fi
```

### Require Issue Reference
```bash
#!/bin/sh
MSG=$(cat "$1")
if ! echo "$MSG" | grep -qE "#[0-9]+"; then
    echo "Commit must reference an issue (#123)"
    exit 1
fi
```

---

## Best Practices

1. **Use Husky** to share hooks via the repo
2. **Use lint-staged** for fast pre-commit checks
3. **Keep hooks fast** — slow hooks frustrate developers
4. **Don't block on long tests** in pre-commit; use pre-push
5. **Allow bypassing** with `--no-verify` for emergencies

---

## Common Pitfalls

### 1. Hooks not executable
```bash
chmod +x .git/hooks/pre-commit
```

### 2. Hooks not shared
`.git/hooks/` is not tracked. Use Husky or `core.hooksPath`.

### 3. Slow hooks
Don't run full test suite in pre-commit. Use lint-staged + pre-push.

---

## Summary

| Hook | When | Purpose |
|------|------|---------|
| `pre-commit` | Before commit | Lint, format |
| `commit-msg` | After message entered | Validate message |
| `pre-push` | Before push | Run tests |
| `post-merge` | After merge | Install deps |
| `pre-receive` | Server: before accept | Enforce policies |

### Key Concepts

- Hooks are **scripts** in `.git/hooks/` (or managed by Husky)
- **Exit 0** = success, **non-zero** = abort the operation
- **Client-side** hooks run locally; **server-side** on the remote
- **Husky** + **lint-staged** is the standard modern setup
- `--no-verify` bypasses client-side hooks
