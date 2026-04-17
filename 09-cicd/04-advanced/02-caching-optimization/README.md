# Caching and Optimization

## Table of Contents
1. [Introduction](#introduction)
2. [CI Caching Fundamentals](#ci-caching-fundamentals)
3. [Node Modules Caching](#node-modules-caching)
4. [Build Output Caching](#build-output-caching)
5. [Docker Layer Caching](#docker-layer-caching)
6. [Cache Keys and Strategies](#cache-keys-and-strategies)
7. [Parallelism](#parallelism)
8. [Test Suite Splitting](#test-suite-splitting)
9. [Incremental Builds](#incremental-builds)
10. [GitHub Actions Caching](#github-actions-caching)
11. [Measuring Pipeline Performance](#measuring-pipeline-performance)
12. [Best Practices](#best-practices)

---

## Introduction

CI pipelines should be fast. Slow pipelines reduce developer productivity, delay feedback, and increase costs. The two main optimization strategies are **caching** (avoid repeating work) and **parallelism** (do work simultaneously).

Target: CI pipeline under 10 minutes for most projects.

---

## CI Caching Fundamentals

### What to Cache

| Item               | Key Based On           | Size     | Time Saved |
|-------------------|------------------------|----------|------------|
| node_modules      | package-lock.json hash | 100-500MB| 30-60s     |
| .next/cache       | Source file hashes     | 50-200MB | 10-30s     |
| Docker layers     | Dockerfile + context   | Varies   | 1-5min     |
| Playwright browsers| Package version       | ~200MB   | 30-60s     |
| Turbo cache       | Task input hashes      | Varies   | Varies     |

### Cache Lifecycle
```
Build N:   Compute key → Cache MISS → Run task → Save cache
Build N+1: Compute key → Cache HIT  → Restore → Skip task
Build N+2: Compute key → Cache MISS (key changed) → Run → Save
```

---

## Node Modules Caching

```yaml
- uses: actions/cache@v4
  with:
    path: node_modules
    key: node-modules-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      node-modules-
```

### Alternative: Setup Node with Cache
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm  # Automatically caches npm global cache
```

---

## Cache Keys and Strategies

### Exact Match
```
key: deps-${{ hashFiles('**/package-lock.json') }}
```
Only restores if lockfile hash matches exactly.

### Prefix Fallback
```
key: deps-${{ hashFiles('**/package-lock.json') }}
restore-keys: |
  deps-
```
Falls back to most recent cache starting with `deps-`.

### Multi-Factor Keys
```
key: deps-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts') }}
```
Include OS, deps, and source hashes for build caches.

---

## Parallelism

### Job-Level Parallelism
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  typecheck:
    runs-on: ubuntu-latest
  # All three run simultaneously
```

### Test Parallelism
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx jest --shard=${{ matrix.shard }}/4
```

---

## Test Suite Splitting

### By File Count
```
100 test files ÷ 4 shards = 25 files per shard
```

### By Duration (Optimal)
```
Shard 1: slow-test-1.ts (30s) + fast-test-3.ts (5s) = 35s
Shard 2: slow-test-2.ts (25s) + fast-test-4.ts (10s) = 35s
```

### Tools
- **Jest**: `--shard=1/4`
- **Playwright**: `--shard=1/4`
- **Vitest**: `--shard=1/4`

---

## Incremental Builds

### TypeScript
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### Next.js
```
.next/cache/  ← Persisted between builds
```

### Turbo
```
turbo build  ← Skips packages with unchanged inputs
```

---

## Measuring Pipeline Performance

### Key Metrics
| Metric               | Target    | Description                    |
|---------------------|-----------|-------------------------------|
| Total duration      | < 10 min  | End-to-end pipeline time      |
| Cache hit rate      | > 80%     | Percentage of cached tasks     |
| Flake rate          | < 1%      | Tests that pass/fail randomly  |
| Queue time          | < 2 min   | Time waiting for a runner      |

---

## Best Practices

1. **Cache aggressively** — Dependencies, build outputs, browsers
2. **Use prefix restore keys** — Partial cache is better than no cache
3. **Parallelize independent stages** — Lint, test, typecheck simultaneously
4. **Split large test suites** — Use sharding across runners
5. **Enable incremental builds** — TypeScript, Next.js, Turbo
6. **Measure and monitor** — Track pipeline duration trends
7. **Clean stale caches** — Caches have storage limits
8. **Use native caching features** — setup-node cache, Docker buildx cache

---

## Key Takeaways

- Caching avoids repeating expensive operations (npm install, builds)
- Cache keys should be based on input hashes (lockfile, source files)
- Parallelism runs independent tasks simultaneously
- Test sharding splits tests across multiple machines
- Incremental builds only recompile changed files
- Target: CI pipeline under 10 minutes with >80% cache hit rate
