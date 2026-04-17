# GitHub Actions: Matrix Strategy

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Matrix](#basic-matrix)
3. [Multi-Dimensional Matrix](#multi-dimensional-matrix)
4. [Include and Exclude](#include-and-exclude)
5. [Fail-Fast](#fail-fast)
6. [Max Parallel](#max-parallel)
7. [Dynamic Matrix](#dynamic-matrix)
8. [Matrix with Reusable Workflows](#matrix-with-reusable-workflows)
9. [Common Patterns](#common-patterns)
10. [Performance Considerations](#performance-considerations)
11. [Best Practices](#best-practices)

---

## Introduction

The matrix strategy lets you run a job with multiple configurations automatically. Instead of writing separate jobs for each Node.js version or OS, you define a matrix and GitHub Actions creates a job for each combination.

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
# Creates 6 jobs: 3 versions × 2 operating systems
```

---

## Basic Matrix

### Single Dimension

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

This creates 3 jobs, one for each Node.js version.

### Accessing Matrix Values

Use `${{ matrix.KEY }}` to access the current combination's value:

```yaml
- run: echo "Testing on Node ${{ matrix.node-version }}"
```

---

## Multi-Dimensional Matrix

### Two Dimensions

```yaml
strategy:
  matrix:
    node: [18, 20]
    os: [ubuntu-latest, windows-latest]
runs-on: ${{ matrix.os }}
```

Creates 4 jobs (2 × 2):
| Job | node | os              |
|-----|------|-----------------|
| 1   | 18   | ubuntu-latest   |
| 2   | 18   | windows-latest  |
| 3   | 20   | ubuntu-latest   |
| 4   | 20   | windows-latest  |

### Three Dimensions

```yaml
strategy:
  matrix:
    node: [18, 20]
    os: [ubuntu-latest, macos-latest]
    bundler: [webpack, vite]
```

Creates 8 jobs (2 × 2 × 2). Be careful with combinatorial explosion.

---

## Include and Exclude

### Exclude Combinations

Remove specific combinations from the matrix:

```yaml
strategy:
  matrix:
    node: [18, 20]
    os: [ubuntu-latest, macos-latest, windows-latest]
    exclude:
      - node: 18
        os: macos-latest    # Skip Node 18 on macOS
```

### Include Additional Combinations

Add extra combinations or properties:

```yaml
strategy:
  matrix:
    node: [18, 20]
    os: [ubuntu-latest]
    include:
      # Add a specific combination
      - node: 22
        os: ubuntu-latest
        experimental: true
      # Add properties to existing combinations
      - node: 18
        npm-version: 9
```

### Include-Only Matrix

You can use `include` without a base matrix:

```yaml
strategy:
  matrix:
    include:
      - name: "Unit Tests"
        command: "npm run test:unit"
      - name: "Integration Tests"
        command: "npm run test:integration"
      - name: "E2E Tests"
        command: "npm run test:e2e"
```

---

## Fail-Fast

By default, if any matrix job fails, all other running jobs are cancelled.

```yaml
strategy:
  fail-fast: true      # Default: cancel all if one fails
  matrix:
    node: [18, 20, 22]
```

### Disable Fail-Fast

```yaml
strategy:
  fail-fast: false     # Continue all jobs even if one fails
  matrix:
    node: [18, 20, 22]
```

### When to Disable

- **Testing compatibility** — Want to know ALL failures, not just the first
- **Independent tests** — Jobs don't depend on each other
- **Release testing** — Need complete compatibility matrix

---

## Max Parallel

Limit concurrent matrix jobs:

```yaml
strategy:
  max-parallel: 2      # Only 2 matrix jobs run at a time
  matrix:
    node: [18, 20, 22]
```

### Use Cases

- Rate-limited APIs or services
- Shared resources (databases, deploy targets)
- Cost control for self-hosted runners

---

## Dynamic Matrix

Generate matrix values dynamically from a previous job.

```yaml
jobs:
  generate:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          # Generate matrix from changed packages
          echo 'matrix={"package":["api","web","shared"]}' >> "$GITHUB_OUTPUT"

  test:
    needs: generate
    strategy:
      matrix: ${{ fromJSON(needs.generate.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing ${{ matrix.package }}"
```

### Dynamic Matrix from Files

```yaml
- id: set-matrix
  run: |
    # Read packages from workspace config
    PACKAGES=$(ls packages/ | jq -R -s -c 'split("\n")[:-1]')
    echo "matrix={\"package\":$PACKAGES}" >> "$GITHUB_OUTPUT"
```

---

## Matrix with Reusable Workflows

```yaml
jobs:
  test:
    strategy:
      matrix:
        environment: [staging, production]
    uses: ./.github/workflows/deploy.yml
    with:
      environment: ${{ matrix.environment }}
    secrets: inherit
```

---

## Common Patterns

### Cross-Platform Testing

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node: [18, 20]
runs-on: ${{ matrix.os }}
```

### Testing Multiple Package Managers

```yaml
strategy:
  matrix:
    include:
      - pm: npm
        install: npm ci
        test: npm test
      - pm: pnpm
        install: pnpm install --frozen-lockfile
        test: pnpm test
```

### Database Compatibility

```yaml
strategy:
  matrix:
    db:
      - { engine: postgres, version: "15", port: 5432 }
      - { engine: postgres, version: "16", port: 5432 }
      - { engine: mysql, version: "8", port: 3306 }
```

### Conditional Matrix Jobs

```yaml
strategy:
  matrix:
    include:
      - target: staging
        deploy: true
      - target: production
        deploy: ${{ github.ref == 'refs/heads/main' }}
```

---

## Performance Considerations

### Job Count Impact

| Matrix Dimensions | Values Each | Total Jobs |
|------------------|------------|------------|
| 1                | 3          | 3          |
| 2                | 3          | 9          |
| 3                | 3          | 27         |
| 2                | 5          | 25         |
| 3                | 4          | 64         |

### Optimization Strategies

1. **Reduce dimensions** — Only test critical combinations
2. **Use `exclude`** — Remove unnecessary combinations
3. **Use `max-parallel`** — Control concurrency
4. **Use `fail-fast`** — Stop early on failure
5. **Dynamic matrix** — Only test affected packages

---

## Best Practices

1. **Keep matrices small** — Test critical combinations, not all permutations
2. **Use `fail-fast: false` for compatibility testing** — See all failures
3. **Use `include` for named configurations** — Clearer than multi-dimensional
4. **Dynamic matrices for monorepos** — Only test changed packages
5. **Set `max-parallel` for rate-limited resources**
6. **Use matrix values in job names** — `name: Test (${{ matrix.node }}, ${{ matrix.os }})`
7. **Consider cost** — Each matrix job uses CI minutes

---

## Key Takeaways

- Matrix strategy creates multiple jobs from combinations of values
- `include` adds extra combinations; `exclude` removes specific ones
- `fail-fast` (default true) cancels all jobs if one fails
- `max-parallel` limits concurrent matrix jobs
- Dynamic matrices generate values at runtime from prior jobs
- Combinatorial explosion is the main risk — keep matrices focused
- Matrix expansion follows: base combinations - excludes + includes
