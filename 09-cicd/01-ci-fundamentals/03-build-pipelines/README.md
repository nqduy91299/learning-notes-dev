# Build Pipelines

## Table of Contents

1. [Introduction](#introduction)
2. [Build Pipeline Stages](#build-pipeline-stages)
3. [Install Stage](#install-stage)
4. [Lint & Format Stage](#lint--format-stage)
5. [Test Stage](#test-stage)
6. [Build Stage](#build-stage)
7. [Deploy Stage](#deploy-stage)
8. [Artifacts](#artifacts)
9. [Caching](#caching)
10. [Parallelism](#parallelism)
11. [Environments](#environments)
12. [Pipeline Patterns](#pipeline-patterns)
13. [Best Practices](#best-practices)

---

## Introduction

A build pipeline is an automated sequence of stages that transforms source code into a deployable artifact. Each stage performs a specific task, and the pipeline fails fast if any stage fails.

```
Source → Install → Lint → Test → Build → Deploy
```

The goal is **repeatability**: the same code, same pipeline, same result — every time.

---

## Build Pipeline Stages

### Stage Lifecycle

Each stage goes through these states:

```
queued → running → success | failure | cancelled
```

### Stage Configuration

A stage typically has:
- **Name** — Human-readable identifier
- **Commands** — Shell commands to execute
- **Dependencies** — Other stages that must complete first
- **Conditions** — When to run (always, on success, on failure)
- **Timeout** — Maximum execution time
- **Retry** — Number of retry attempts on failure
- **Environment** — Variables and secrets available

### Execution Model

```
           ┌──────┐
           │Source │
           └──┬───┘
              │
           ┌──▼───┐
           │Install│
           └──┬───┘
              │
        ┌─────┴─────┐
        ▼            ▼
    ┌──────┐    ┌──────┐
    │ Lint │    │ Test │     ← Parallel
    └──┬───┘    └──┬───┘
        └─────┬─────┘
              ▼
           ┌──────┐
           │Build │
           └──┬───┘
              │
           ┌──▼───┐
           │Deploy│
           └──────┘
```

---

## Install Stage

### Purpose

Install all project dependencies required for subsequent stages.

### Best Practices

1. **Use lockfiles** — `npm ci` instead of `npm install`
2. **Cache dependencies** — Avoid re-downloading every build
3. **Frozen lockfile** — Ensure CI uses exact versions from lockfile
4. **Separate install from build** — Clearer pipeline structure

### Cache Keys

```
cache-key: node-modules-{{ hash("package-lock.json") }}
```

If `package-lock.json` hasn't changed, restore from cache instead of installing.

### Common Install Commands

| Package Manager | Install Command       | Lockfile             |
|----------------|----------------------|----------------------|
| npm            | `npm ci`             | package-lock.json    |
| yarn           | `yarn install --frozen-lockfile` | yarn.lock   |
| pnpm           | `pnpm install --frozen-lockfile` | pnpm-lock.yaml |
| bun            | `bun install --frozen-lockfile`  | bun.lockb    |

---

## Lint & Format Stage

### Purpose

Enforce code quality and consistency before tests run.

### Tools

| Tool      | Purpose              |
|-----------|---------------------|
| ESLint    | JavaScript/TypeScript linting |
| Prettier  | Code formatting      |
| Stylelint | CSS linting          |
| commitlint| Commit message linting|

### Why Lint Before Test?

- Linting is **fast** (seconds)
- Catches syntax errors before running tests
- Fails fast — no point running tests if code style is wrong

### Auto-fix in CI?

Generally **no**. CI should only check, not modify. Auto-fixing in CI:
- Creates unexpected commits
- Masks developer mistakes
- Makes it unclear who authored the fix

---

## Test Stage

### Purpose

Run automated tests to verify code correctness.

### Test Execution Order

1. **Unit tests first** — Fast, catch most bugs
2. **Integration tests** — Medium speed
3. **E2E tests** — Slowest, run last (or in separate pipeline)

### Parallel Test Execution

```
Test Stage
├── Shard 1: tests/a-m/**
├── Shard 2: tests/n-z/**
└── Shard 3: tests/integration/**
```

### Test Reports

- Generate JUnit XML for CI integration
- Upload coverage reports
- Post results as PR comments

---

## Build Stage

### Purpose

Compile source code into deployable artifacts.

### Common Build Steps

| Framework | Build Command      | Output Directory |
|-----------|-------------------|-----------------|
| Next.js   | `next build`      | `.next/`        |
| Vite      | `vite build`      | `dist/`         |
| TypeScript| `tsc`             | `dist/`         |
| Docker    | `docker build`    | Image           |

### Build Optimization

1. **Incremental builds** — Only rebuild changed files
2. **Build caching** — Cache intermediate build artifacts
3. **Tree shaking** — Remove unused code from bundles
4. **Minification** — Reduce file sizes for production

### Build Artifacts

Artifacts are the outputs of the build stage:
- Compiled JavaScript files
- Static HTML/CSS/JS bundles
- Docker images
- Compiled binaries

---

## Deploy Stage

### Purpose

Deploy the built artifact to a target environment.

### Deployment Targets

| Target      | Description                          |
|-------------|--------------------------------------|
| Development | Developer testing environment        |
| Staging     | Pre-production, mirrors production   |
| Production  | Live user-facing environment         |
| Preview     | Per-PR temporary deployment          |

### Deployment Strategies

1. **Direct deploy** — Replace old version with new version
2. **Blue-green** — Run two identical environments, switch traffic
3. **Canary** — Gradually route traffic to new version
4. **Rolling** — Update instances one at a time

---

## Artifacts

### What are Build Artifacts?

Build artifacts are files produced by CI that need to be:
- Passed between pipeline stages
- Stored for deployment
- Archived for auditing

### Artifact Types

| Type           | Example                    | Storage        |
|----------------|----------------------------|----------------|
| Build output   | `dist/`, `.next/`         | Artifact store |
| Docker image   | `myapp:v1.2.3`            | Container registry |
| Test reports   | `junit.xml`, `coverage/`  | CI artifacts   |
| Logs           | Build logs, test output   | CI storage     |

### Artifact Retention

- Production artifacts: Keep for rollback (30-90 days)
- Test reports: Keep for analysis (7-30 days)
- Preview artifacts: Delete when PR is closed

---

## Caching

### Why Cache?

Caching avoids repeating expensive operations:

| Operation          | Without Cache | With Cache |
|-------------------|--------------|------------|
| `npm ci`          | 30-60s       | 2-5s       |
| TypeScript build  | 20-40s       | 5-10s      |
| Docker image      | 2-5min       | 10-30s     |

### Cache Key Strategies

```
// Exact match: restore only if hash matches
key: npm-{{ hash("package-lock.json") }}

// Prefix fallback: use latest matching cache
restore-keys:
  - npm-{{ hash("package-lock.json") }}
  - npm-
```

### What to Cache

1. **node_modules** — Keyed on lockfile hash
2. **Build cache** — `.next/cache`, `dist/`, `.turbo`
3. **Docker layers** — Layer-by-layer caching
4. **Test cache** — Playwright browsers, Jest cache

---

## Parallelism

### Types of Parallelism

1. **Stage parallelism** — Run independent stages simultaneously
2. **Job parallelism** — Run the same stage on multiple machines
3. **Test parallelism** — Run tests concurrently within a job

### Stage Parallelism Example

```
           Install
              │
        ┌─────┴─────┐
        │            │
      Lint         Test        ← These run in parallel
        │            │
        └─────┬─────┘
              │
            Build
```

### Job Parallelism (Matrix)

```
Test Job
├── Node 18 + Ubuntu
├── Node 20 + Ubuntu
├── Node 18 + macOS
└── Node 20 + macOS
```

---

## Environments

### Environment Hierarchy

```
Development → Staging → Production
    │             │          │
  Feature     Pre-release   Users
  testing     testing
```

### Environment Configuration

Each environment has:
- **Variables** — API URLs, feature flags
- **Secrets** — API keys, database credentials
- **Protection rules** — Required reviewers, wait timers
- **Deployment branch** — Which branches can deploy

### Environment Variables by Stage

| Variable      | Development        | Staging            | Production         |
|---------------|--------------------|--------------------|-------------------|
| `API_URL`     | `localhost:3000`   | `staging.api.com`  | `api.com`         |
| `DEBUG`       | `true`             | `true`             | `false`           |
| `LOG_LEVEL`   | `debug`            | `info`             | `warn`            |

---

## Pipeline Patterns

### Fan-out / Fan-in

```
        ┌── Test A ──┐
Install ├── Test B ──┤ Build
        └── Test C ──┘
```

### Diamond

```
        ┌── Lint ──┐
Install ┤          ├── Build ── Deploy
        └── Test ──┘
```

### Sequential

```
Install → Lint → Test → Build → Deploy
```

### Conditional

```
Install → Test → Build ──┬── Deploy (if main)
                         └── Preview (if PR)
```

---

## Best Practices

1. **Pipeline as code** — Define pipelines in version-controlled files
2. **Fail fast** — Run quickest checks first
3. **Cache aggressively** — But invalidate correctly
4. **Parallelize where possible** — Independent stages run simultaneously
5. **Keep stages focused** — One responsibility per stage
6. **Use timeouts** — Prevent hung builds from blocking the queue
7. **Clean up resources** — Delete temporary environments, old artifacts
8. **Monitor pipeline metrics** — Track build times, success rates
9. **Use consistent environments** — Docker ensures reproducibility
10. **Document your pipeline** — New team members need to understand it

---

## Key Takeaways

- Build pipelines automate the path from code to deployment
- Stages: install → lint → test → build → deploy
- Caching and parallelism are key to fast pipelines
- Artifacts pass data between stages and store deployable outputs
- Environments (dev/staging/prod) have different configs and protections
- Pipeline patterns (fan-out, diamond, conditional) solve different needs

---

## Next Steps

- [Workflow Basics](../../02-github-actions/01-workflows-basics/README.md) — Implementing pipelines in GitHub Actions
