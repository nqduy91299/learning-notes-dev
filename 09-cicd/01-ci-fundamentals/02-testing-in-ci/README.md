# Testing in CI

## Table of Contents

1. [Introduction](#introduction)
2. [Test Types](#test-types)
3. [The Testing Pyramid](#the-testing-pyramid)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Test Automation in CI](#test-automation-in-ci)
8. [Test Runners](#test-runners)
9. [Code Coverage](#code-coverage)
10. [Testing in Pull Request Workflows](#testing-in-pull-request-workflows)
11. [Flaky Tests](#flaky-tests)
12. [Test Performance](#test-performance)
13. [Best Practices](#best-practices)

---

## Introduction

Testing is the **foundation** of CI/CD. Without automated tests, a CI pipeline provides limited value — you're just automating builds without verifying correctness. The goal of testing in CI is to catch bugs as early as possible, ideally before code is merged.

```
Code Change → Automated Tests → Confidence → Safe to Merge/Deploy
```

---

## Test Types

### Overview

| Test Type     | Scope          | Speed   | Reliability | Cost to Write |
|---------------|----------------|---------|-------------|---------------|
| Unit          | Single function| Fast    | High        | Low           |
| Integration   | Module/service | Medium  | Medium      | Medium        |
| End-to-End    | Full system    | Slow    | Lower       | High          |
| Smoke         | Critical paths | Fast    | High        | Low           |
| Performance   | Load/stress    | Slow    | Medium      | High          |
| Security      | Vulnerabilities| Medium  | Medium      | Medium        |

### Unit Tests

- Test a single function or class in isolation
- Mock all external dependencies
- Run in milliseconds
- Example: testing a `calculateTotal` function

### Integration Tests

- Test how modules work together
- May use real databases, APIs, or file systems
- Run in seconds
- Example: testing an API endpoint that reads from a database

### End-to-End (E2E) Tests

- Test the full application from the user's perspective
- Use a real browser (Cypress, Playwright)
- Run in seconds to minutes
- Example: testing a login flow through the UI

### Smoke Tests

- Minimal set of tests to verify basic functionality
- "Does the app start? Can users log in?"
- Run after deployment to verify health

---

## The Testing Pyramid

```
         ╱╲
        ╱ E2E╲         Few, slow, expensive
       ╱──────╲
      ╱ Integr. ╲      Some, medium speed
     ╱────────────╲
    ╱   Unit Tests  ╲   Many, fast, cheap
   ╱────────────────╲
```

The pyramid suggests:
- **Many** unit tests (base of pyramid)
- **Some** integration tests (middle)
- **Few** E2E tests (top)

### Why This Shape?

- Unit tests are **fast** → run thousands in seconds
- Unit tests are **reliable** → no network, no flakiness
- Unit tests are **cheap** → easy to write and maintain
- E2E tests are **slow** → real browser, real network
- E2E tests are **flaky** → timing issues, environment issues
- E2E tests are **expensive** → hard to write and maintain

### The Testing Trophy (Alternative)

Kent C. Dodds proposed the "testing trophy":

```
         ╱╲
        ╱ E2E╲
       ╱──────╲
      ╱ Integr. ╲     ← Most tests here
     ╱────────────╲
    ╱   Unit Tests  ╲
   ╱────────────────╲
    Static Analysis
```

This approach favors integration tests as they provide the best balance of confidence and cost.

---

## Unit Testing

### Characteristics

- Tests one unit (function, class, module) in isolation
- No I/O (no network, no filesystem, no database)
- Deterministic — same input always produces same output
- Fast — runs in milliseconds

### Example Test Structure

```typescript
// Function under test
function add(a: number, b: number): number {
  return a + b;
}

// Test cases
// test("adds two positive numbers", () => { expect(add(1, 2)).toBe(3); });
// test("adds negative numbers", () => { expect(add(-1, -2)).toBe(-3); });
// test("adds zero", () => { expect(add(0, 5)).toBe(5); });
```

### What to Unit Test

- Pure functions (no side effects)
- Data transformations
- Business logic
- Utility functions
- State machines

### What NOT to Unit Test

- Framework code (React rendering, Express routing)
- Third-party libraries
- Simple getters/setters
- Configuration files

---

## Integration Testing

### Characteristics

- Tests how components work together
- May involve real external services (databases, APIs)
- Slower than unit tests
- More realistic than unit tests

### Testing Strategies

1. **In-memory databases** — Use SQLite or in-memory MongoDB for fast DB tests
2. **Test containers** — Spin up Docker containers for real services
3. **Mock servers** — Use MSW or nock to mock HTTP APIs
4. **Fixtures** — Pre-populate test data

### CI Considerations

- Integration tests may need services (database, Redis, etc.)
- GitHub Actions supports `services` for running containers
- Tests should be isolated — each test sets up and tears down its own data

---

## End-to-End Testing

### Tools

| Tool       | Browser Engine | Language   | Key Feature          |
|------------|---------------|------------|----------------------|
| Playwright | Chromium/FF/WK| TypeScript | Multi-browser        |
| Cypress    | Chromium      | JavaScript | Developer experience |
| Selenium   | All           | Multiple   | Oldest, most mature  |
| Puppeteer  | Chromium      | JavaScript | Chrome-only, fast    |

### CI Considerations

- E2E tests need a running application
- Use `start-server-and-test` or similar tools
- Run in headless mode in CI
- Consider running E2E only on certain branches (main, release)
- Capture screenshots/videos on failure for debugging

---

## Test Automation in CI

### Typical CI Test Pipeline

```
Install Dependencies
       │
       ▼
  Run Linter ──────────────┐
       │                   │
       ▼                   ▼
  Run Unit Tests     Run Type Check
       │                   │
       ▼                   ▼
Run Integration Tests ─────┘
       │
       ▼
  Run E2E Tests (optional on PR)
       │
       ▼
  Generate Coverage Report
       │
       ▼
  Post Results to PR
```

### Test Ordering Strategy

1. **Fastest first** — Run linting and type checking first (seconds)
2. **Unit tests next** — Fast, catch most bugs
3. **Integration tests** — Medium speed, catch integration issues
4. **E2E tests last** — Slowest, catch user-facing bugs

---

## Test Runners

### Popular Test Runners

| Runner   | Language   | Key Feature               |
|----------|-----------|---------------------------|
| Jest     | JS/TS     | All-in-one, widely used   |
| Vitest   | JS/TS     | Vite-powered, fast        |
| Mocha    | JS/TS     | Flexible, modular         |
| AVA      | JS/TS     | Concurrent test execution |
| pytest   | Python    | Fixtures, parametrize     |
| JUnit    | Java      | Standard Java testing     |

### Test Runner Features

- **Watch mode** — Re-run tests on file change
- **Parallel execution** — Run tests concurrently
- **Filtering** — Run specific test files or patterns
- **Reporters** — Output in different formats (console, JUnit XML, JSON)
- **Snapshots** — Compare output against saved snapshots

---

## Code Coverage

### What is Code Coverage?

Code coverage measures what percentage of your code is executed by tests.

### Coverage Metrics

| Metric     | Description                                      |
|------------|--------------------------------------------------|
| Lines      | Percentage of lines executed                     |
| Statements | Percentage of statements executed                |
| Branches   | Percentage of if/else branches taken             |
| Functions  | Percentage of functions called                   |

### Coverage in CI

- Generate coverage reports as part of the test step
- Upload to services like Codecov, Coveralls
- Set minimum coverage thresholds (e.g., 80%)
- Fail the pipeline if coverage drops below threshold
- Show coverage diff on PRs

### Coverage Pitfalls

- **100% coverage ≠ bug-free** — Tests may not assert the right things
- **Coverage as a target** — Leads to low-quality tests written just for numbers
- **Ignoring untested paths** — Branch coverage matters more than line coverage

---

## Testing in Pull Request Workflows

### PR Testing Flow

```
Developer opens PR
       │
       ▼
CI Pipeline Triggered
       │
       ▼
Tests Run Automatically
       │
       ├── Pass → ✅ Green check on PR
       │
       └── Fail → ❌ Red X on PR
              │
              ▼
       Developer fixes, pushes again
```

### Status Checks

- CI reports status back to the PR
- Branch protection rules can require status checks to pass
- Reviewers can see test results before reviewing

### PR-Specific Testing

- Run only tests affected by changed files
- Run full test suite on main branch
- Show test coverage diff in PR comments

---

## Flaky Tests

### What Makes a Test Flaky?

A flaky test passes and fails intermittently without code changes.

### Common Causes

1. **Timing dependencies** — setTimeout, animations, network delays
2. **Shared state** — Tests depend on execution order
3. **External services** — API rate limits, network issues
4. **Race conditions** — Async operations completing in different orders
5. **Date/time** — Tests that depend on current time

### Dealing with Flaky Tests

1. **Quarantine** — Move to a separate suite, don't block CI
2. **Retry** — Re-run failed tests (masks the problem)
3. **Fix** — Investigate root cause and fix
4. **Delete** — If the test provides no value, remove it

---

## Test Performance

### Speeding Up Tests in CI

1. **Parallelism** — Run test files in parallel
2. **Sharding** — Split tests across multiple CI machines
3. **Caching** — Cache node_modules, build outputs
4. **Selective testing** — Only run tests affected by changes
5. **Faster runners** — Use faster CI machines

### Test Splitting Strategies

```
Test Suite (100 tests)
       │
  ┌────┼────┐
  ▼    ▼    ▼
Shard1 Shard2 Shard3
(34)   (33)   (33)
```

---

## Best Practices

1. **Tests must be deterministic** — Same result every run
2. **Tests must be independent** — No shared state, any order
3. **Tests must be fast** — Under 10ms for unit tests
4. **Name tests clearly** — `"should return 404 when user not found"`
5. **One assertion per test** — Easier to debug failures
6. **Don't test implementation details** — Test behavior, not internals
7. **Keep test data close to tests** — Use fixtures or factories
8. **Clean up after tests** — Reset databases, clear mocks
9. **Run tests locally before pushing** — Catch issues early
10. **Monitor test suite health** — Track flake rates, durations

---

## Key Takeaways

- The testing pyramid suggests many unit tests, fewer integration/E2E tests
- CI should run tests automatically on every code change
- Code coverage is a metric, not a goal — focus on meaningful tests
- Flaky tests erode trust in CI — quarantine or fix them
- Test performance matters — slow tests slow down the entire team
- PR workflows should require passing tests before merge

---

## Next Steps

- [Build Pipelines](../03-build-pipelines/README.md) — Putting tests into pipeline stages
