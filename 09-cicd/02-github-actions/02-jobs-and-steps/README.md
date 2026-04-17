# GitHub Actions: Jobs and Steps

## Table of Contents

1. [Introduction](#introduction)
2. [Jobs Overview](#jobs-overview)
3. [Steps Overview](#steps-overview)
4. [Uses vs Run](#uses-vs-run)
5. [Job Dependencies (needs)](#job-dependencies-needs)
6. [Job Outputs](#job-outputs)
7. [Artifacts](#artifacts)
8. [Services](#services)
9. [Job Matrix](#job-matrix)
10. [Conditional Execution](#conditional-execution)
11. [Step Outputs and Environment](#step-outputs-and-environment)
12. [Best Practices](#best-practices)

---

## Introduction

In GitHub Actions, **jobs** are the top-level units of work within a workflow. Each job contains **steps** — individual tasks that run sequentially on the same runner. Jobs run in parallel by default, but can depend on each other using the `needs` keyword.

```
Workflow
├── Job A (runs on ubuntu)
│   ├── Step 1: Checkout code
│   ├── Step 2: Install deps
│   └── Step 3: Run tests
├── Job B (runs on ubuntu, needs: A)
│   ├── Step 1: Checkout code
│   └── Step 2: Build
└── Job C (runs on ubuntu, needs: B)
    └── Step 1: Deploy
```

---

## Jobs Overview

### Job Configuration

```yaml
jobs:
  build:
    name: Build Application       # Display name in UI
    runs-on: ubuntu-latest        # Runner
    timeout-minutes: 30           # Max execution time
    continue-on-error: false      # Fail workflow if job fails
    if: github.ref == 'refs/heads/main'  # Conditional
    needs: [lint, test]           # Dependencies
    env:                          # Job-level env vars
      NODE_ENV: production
    outputs:                      # Expose outputs to other jobs
      version: ${{ steps.ver.outputs.version }}
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
```

### Job Properties

| Property            | Description                                  |
|--------------------|----------------------------------------------|
| `runs-on`          | Runner label (required)                      |
| `needs`            | Jobs that must complete first                |
| `if`               | Conditional expression                       |
| `steps`            | List of steps (required)                     |
| `env`              | Environment variables                        |
| `timeout-minutes`  | Maximum runtime (default: 360)               |
| `continue-on-error`| Don't fail workflow if this job fails        |
| `outputs`          | Values to pass to dependent jobs             |
| `services`         | Docker containers for the job                |
| `strategy`         | Matrix strategy for multiple configurations  |

---

## Steps Overview

Steps are individual tasks within a job. They run sequentially in the order defined.

```yaml
steps:
  - name: Checkout                # Display name
    uses: actions/checkout@v4     # Use an action
    with:                         # Action inputs
      fetch-depth: 0

  - name: Install
    run: npm ci                   # Run a shell command
    working-directory: ./app      # Working directory
    shell: bash                   # Shell to use

  - name: Test
    run: npm test
    env:                          # Step-level env vars
      CI: true
    continue-on-error: true       # Don't fail job if step fails
    timeout-minutes: 10           # Step timeout
    if: success()                 # Conditional
```

---

## Uses vs Run

### `uses` — Run an Action

Actions are reusable units of code. They can be:

```yaml
# GitHub Marketplace action
- uses: actions/checkout@v4

# Action with inputs
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm

# Action from another repo
- uses: owner/repo@v1

# Local action from same repo
- uses: ./.github/actions/my-action

# Docker action
- uses: docker://node:20-alpine
```

### `run` — Execute Shell Commands

```yaml
# Single command
- run: npm test

# Multi-line commands
- run: |
    echo "Building..."
    npm ci
    npm run build

# Custom shell
- run: |
    Write-Host "Hello from PowerShell"
  shell: pwsh
```

### When to Use Each

| Use `uses` when...              | Use `run` when...              |
|---------------------------------|-------------------------------|
| Action exists on Marketplace    | Running simple shell commands |
| Complex setup logic needed      | Project-specific commands     |
| Need cross-platform support     | One-off scripts               |
| Want version pinning            | Combining multiple commands   |

---

## Job Dependencies (needs)

By default, jobs run in parallel. Use `needs` to create dependencies.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    steps: [...]

  build:
    needs: [lint, test]           # Waits for both
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: build                  # Waits for build
    runs-on: ubuntu-latest
    steps: [...]
```

### Execution Graph

```
lint ──┐
       ├──▶ build ──▶ deploy
test ──┘
```

### Accessing Dependent Job Status

```yaml
deploy:
  needs: build
  if: needs.build.result == 'success'
```

### Job Result Values

| Result      | Description                                |
|-------------|-------------------------------------------|
| `success`   | All steps completed successfully           |
| `failure`   | At least one step failed                   |
| `cancelled` | Job was cancelled                          |
| `skipped`   | Job was skipped (condition not met)        |

---

## Job Outputs

Pass data between jobs using outputs.

### Setting an Output

```yaml
jobs:
  version:
    runs-on: ubuntu-latest
    outputs:
      semver: ${{ steps.get-version.outputs.version }}
    steps:
      - id: get-version
        run: echo "version=1.2.3" >> "$GITHUB_OUTPUT"
```

### Consuming an Output

```yaml
  deploy:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying version ${{ needs.version.outputs.semver }}"
```

---

## Artifacts

Artifacts persist data between jobs and after the workflow completes.

### Upload Artifact

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7
```

### Download Artifact

```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

### Use Cases

- Pass build output from build job to deploy job
- Save test reports for debugging
- Archive build artifacts for release

---

## Services

Run Docker containers alongside your job (e.g., databases).

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```

---

## Job Matrix

Run a job with multiple configurations.

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
        os: [ubuntu-latest, macos-latest]
      fail-fast: false
      max-parallel: 4
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```

This creates 6 jobs (3 Node versions × 2 OS).

---

## Conditional Execution

### Job-Level Conditions

```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

### Step-Level Conditions

```yaml
- run: echo "Deploy failed!"
  if: failure()
```

### Status Functions

| Function    | Description                              |
|-------------|------------------------------------------|
| `success()` | Previous steps all succeeded (default)   |
| `failure()` | Any previous step failed                 |
| `always()`  | Always run (even if cancelled)           |
| `cancelled()`| Workflow was cancelled                  |

---

## Step Outputs and Environment

### Setting Outputs

```yaml
- id: my-step
  run: echo "result=hello" >> "$GITHUB_OUTPUT"

- run: echo "${{ steps.my-step.outputs.result }}"
```

### Setting Environment Variables

```yaml
- run: echo "MY_VAR=value" >> "$GITHUB_ENV"
- run: echo "$MY_VAR"    # Available in subsequent steps
```

### Adding to PATH

```yaml
- run: echo "/custom/bin" >> "$GITHUB_PATH"
```

---

## Best Practices

1. **Name your steps** — `- name: Install dependencies` is much clearer in logs
2. **Use timeouts** — Prevent runaway jobs from burning CI minutes
3. **Minimize job count** — Each job has overhead (checkout, setup)
4. **Use artifacts wisely** — Only upload what downstream jobs need
5. **Pin action versions** — `@v4` at minimum, SHA for security-critical
6. **Use `needs` for correctness** — Don't rely on implicit ordering
7. **Leverage `continue-on-error`** — For non-critical checks
8. **Keep steps focused** — One task per step for clear logs

---

## Key Takeaways

- Jobs run in parallel by default; use `needs` for ordering
- Steps run sequentially within a job
- `uses` for reusable actions; `run` for shell commands
- Job outputs and artifacts pass data between jobs
- Services provide Docker containers (databases, caches)
- Conditional execution with `if` and status functions
- Job dependency resolution is essentially topological sort
