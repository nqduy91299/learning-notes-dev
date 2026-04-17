# Monorepo CI

## Table of Contents
1. [Introduction](#introduction)
2. [Monorepo Challenges](#monorepo-challenges)
3. [Affected/Changed Detection](#affectedchanged-detection)
4. [Turborepo](#turborepo)
5. [Nx](#nx)
6. [Task Hashing](#task-hashing)
7. [Remote Caching](#remote-caching)
8. [Workspace Dependencies](#workspace-dependencies)
9. [CI Configuration for Monorepos](#ci-configuration-for-monorepos)
10. [Pipeline Optimization](#pipeline-optimization)
11. [Common Patterns](#common-patterns)
12. [Best Practices](#best-practices)

---

## Introduction

A **monorepo** contains multiple projects/packages in a single repository. CI for monorepos is challenging because you don't want to build and test everything when only one package changes.

```
monorepo/
├── apps/
│   ├── web/         ← Next.js app
│   ├── api/         ← Express API
│   └── mobile/      ← React Native
├── packages/
│   ├── ui/          ← Shared components
│   ├── utils/       ← Shared utilities
│   └── config/      ← Shared config
├── turbo.json
└── package.json
```

---

## Monorepo Challenges

1. **Build time** — Building everything on every commit is wasteful
2. **Test time** — Running all tests for a one-line change is slow
3. **Dependencies** — Packages depend on each other; changing `utils` affects `web` and `api`
4. **Caching** — Need intelligent caching that understands package relationships
5. **Deployment** — Different packages deploy to different targets
6. **CI minutes** — Monorepo builds consume more CI resources

---

## Affected/Changed Detection

The key optimization: only build/test what's affected by the change.

### Git-Based Detection
```bash
# Files changed between HEAD and main
git diff --name-only origin/main...HEAD
```

### Dependency-Aware Detection
If `packages/utils` changed:
- `packages/utils` itself needs testing
- `apps/web` (depends on utils) needs testing
- `apps/api` (depends on utils) needs testing
- `packages/ui` (doesn't depend on utils) can skip

```
Changed: packages/utils
         ↓ (dependency graph)
Affected: apps/web, apps/api, packages/utils
Skipped: packages/ui, packages/config, apps/mobile
```

---

## Turborepo

Turborepo is a high-performance build system for JavaScript/TypeScript monorepos.

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Key Features
- **Task hashing** — Content-based hashing for cache invalidation
- **Remote caching** — Share cache across CI and developers
- **Parallel execution** — Run independent tasks simultaneously
- **Incremental builds** — Only rebuild what changed

---

## Nx

Nx is a smart build system with first-class monorepo support.

### Key Features
- **Affected commands** — `nx affected:test` runs tests only for affected projects
- **Computation caching** — Cache task results locally and remotely
- **Task orchestration** — Dependency-aware parallel execution
- **Generators** — Code scaffolding for new packages

### Affected Command
```bash
nx affected:build --base=main --head=HEAD
nx affected:test --base=main --head=HEAD
```

---

## Task Hashing

Task hashing determines if a task's inputs have changed.

### What's Included in the Hash
1. **Source files** — Content hash of all files in the package
2. **Dependencies** — Hashes of dependent packages
3. **Environment variables** — Configured env vars
4. **Task configuration** — The task definition itself
5. **Lock file** — Package manager lock file changes

### Hash Calculation
```
hash = sha256(
  sourceFiles +
  dependencyHashes +
  envVars +
  taskConfig +
  lockfileHash
)
```

If the hash matches a cached result, skip execution and restore from cache.

---

## Remote Caching

Share task caches across CI runs and team members.

### How It Works
```
Developer A runs "turbo build"
  → Hash: abc123
  → Result cached remotely

CI runs "turbo build"
  → Hash: abc123 (same inputs)
  → Cache HIT → skip build, download cached output
```

### Providers
| Provider       | Tool       | Storage          |
|---------------|------------|-----------------|
| Vercel        | Turborepo  | Vercel servers  |
| Nx Cloud      | Nx         | Nx servers      |
| Custom        | Either     | S3, GCS, etc.   |

---

## Workspace Dependencies

### Package.json Workspaces
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Internal Dependencies
```json
// apps/web/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*"
  }
}
```

### Dependency Graph
```
apps/web → packages/ui → packages/utils
apps/api → packages/utils
apps/mobile → packages/ui
```

---

## CI Configuration for Monorepos

### GitHub Actions with Turborepo
```yaml
name: CI
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for change detection
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx turbo build test lint --filter=...[origin/main...HEAD]
```

### Filter Syntax
```bash
turbo build --filter=web          # Only web app
turbo build --filter=./apps/*     # All apps
turbo build --filter=...[HEAD^]   # Affected since last commit
```

---

## Pipeline Optimization

1. **Affected-only builds** — Only build/test changed packages
2. **Remote caching** — Skip tasks with cached results
3. **Parallel execution** — Run independent tasks simultaneously
4. **Incremental builds** — Use tool-level incremental compilation
5. **Selective deployment** — Only deploy changed apps

---

## Common Patterns

### Shared CI Workflow
```yaml
# Each package uses the same test workflow
strategy:
  matrix:
    package: ${{ fromJSON(needs.detect.outputs.affected) }}
```

### Change-Based Deployment
```yaml
# Only deploy packages that changed
- run: |
    if turbo run build --filter=web --dry-run | grep -q "web"; then
      deploy-web
    fi
```

---

## Best Practices

1. **Use change detection** — Never build everything on every commit
2. **Enable remote caching** — Saves significant CI time
3. **Define task dependencies** — `build` depends on `^build` (dependencies first)
4. **Use `fetch-depth: 0`** — Full Git history for accurate change detection
5. **Separate deployment per app** — Each app deploys independently
6. **Keep packages small** — Granular packages = more cache hits
7. **Standardize scripts** — Same `build`, `test`, `lint` scripts across packages
8. **Monitor CI times** — Track which packages are slow

---

## Key Takeaways

- Monorepo CI should only build/test affected packages
- Turborepo and Nx provide intelligent caching and task orchestration
- Task hashing enables content-based cache invalidation
- Remote caching shares results across CI runs and developers
- Dependency graphs determine what's affected by a change
- `fetch-depth: 0` is required for accurate change detection in CI
