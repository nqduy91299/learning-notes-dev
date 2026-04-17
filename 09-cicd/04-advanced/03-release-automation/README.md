# Release Automation

## Table of Contents
1. [Introduction](#introduction)
2. [Semantic Versioning](#semantic-versioning)
3. [Conventional Commits](#conventional-commits)
4. [Version Bumping](#version-bumping)
5. [Changelog Generation](#changelog-generation)
6. [GitHub Releases](#github-releases)
7. [npm Publishing](#npm-publishing)
8. [Changesets](#changesets)
9. [Release Workflows](#release-workflows)
10. [Monorepo Releases](#monorepo-releases)
11. [Pre-releases](#pre-releases)
12. [Best Practices](#best-practices)

---

## Introduction

Release automation removes manual steps from the release process. Instead of manually updating version numbers, writing changelogs, and creating releases, automated tools handle these tasks based on commit history and conventions.

```
Commits → Analyze → Version Bump → Changelog → Tag → Release → Publish
```

---

## Semantic Versioning

### Format: MAJOR.MINOR.PATCH

```
1.2.3
│ │ └── PATCH: bug fixes (backward compatible)
│ └──── MINOR: new features (backward compatible)
└────── MAJOR: breaking changes
```

### Rules
| Change Type      | Version Bump | Example       |
|-----------------|-------------|---------------|
| Bug fix         | PATCH       | 1.2.3 → 1.2.4|
| New feature     | MINOR       | 1.2.3 → 1.3.0|
| Breaking change | MAJOR       | 1.2.3 → 2.0.0|

### Pre-release Versions
```
1.0.0-alpha.1
1.0.0-beta.1
1.0.0-rc.1
```

---

## Conventional Commits

A standardized commit message format that enables automatic versioning.

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types and Version Impact
| Type       | Description              | Version Bump |
|-----------|--------------------------|-------------|
| `fix`     | Bug fix                  | PATCH       |
| `feat`    | New feature              | MINOR       |
| `BREAKING CHANGE` | Breaking change | MAJOR       |
| `docs`    | Documentation            | None        |
| `style`   | Formatting               | None        |
| `refactor`| Code restructuring       | None        |
| `perf`    | Performance improvement  | PATCH       |
| `test`    | Adding tests             | None        |
| `chore`   | Maintenance              | None        |

### Examples
```
feat(auth): add OAuth2 login support
fix(api): handle null response from payment service
feat!: redesign user API (BREAKING CHANGE)
chore: update dependencies
```

---

## Version Bumping

### Automatic Version Determination
1. Parse all commits since last release
2. Find the highest-impact change type
3. Bump version accordingly

```
Last version: 1.2.3
Commits:
  - fix: handle edge case       → PATCH
  - feat: add dark mode         → MINOR
  - chore: update deps          → none
Result: 1.3.0 (highest is MINOR)
```

---

## Changelog Generation

### Auto-Generated Changelog
```markdown
## [1.3.0] - 2024-01-15

### Features
- add dark mode (#42)
- support multiple themes (#43)

### Bug Fixes
- handle edge case in auth (#41)
- fix memory leak in cache (#40)
```

### Tools
| Tool              | Approach           |
|------------------|--------------------|
| conventional-changelog | Commit-based |
| changesets       | Explicit changeset files |
| release-please   | Google's approach  |
| semantic-release  | Fully automated   |

---

## GitHub Releases

```yaml
- name: Create Release
  uses: actions/create-release@v1
  with:
    tag_name: v${{ steps.version.outputs.new }}
    release_name: Release v${{ steps.version.outputs.new }}
    body: ${{ steps.changelog.outputs.content }}
```

---

## npm Publishing

```yaml
- run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Publishing Checklist
1. Version bumped in package.json
2. Changelog updated
3. Tests passing
4. Build artifacts generated
5. npm publish with correct tag

---

## Release Workflows

### Fully Automated (semantic-release)
```
Push to main → Analyze commits → Bump version → Generate changelog → Create GitHub release → Publish to npm
```

### Semi-Automated (changesets)
```
Developer creates changeset → PR merged → Release PR created → Merge release PR → Publish
```

---

## Best Practices

1. **Use conventional commits** — Enables automatic versioning
2. **Automate changelog generation** — Never write changelogs manually
3. **Tag releases in Git** — `v1.2.3` tags for every release
4. **Use CI for publishing** — Never publish from local machines
5. **Test before releasing** — Full test suite must pass
6. **Use pre-releases for testing** — `1.0.0-beta.1` before stable
7. **Keep release notes meaningful** — Group by feature/fix/breaking
8. **Protect release branches** — Require approvals for release merges

---

## Key Takeaways

- Semantic versioning communicates change impact: MAJOR.MINOR.PATCH
- Conventional commits enable automatic version determination
- Changelogs should be auto-generated from commit history
- Release automation removes human error from the release process
- npm publishing should only happen from CI, never locally
- Pre-releases allow testing before stable releases
