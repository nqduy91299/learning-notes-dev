# Testing Strategies

## Table of Contents

- [The Testing Pyramid](#the-testing-pyramid)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Test Doubles](#test-doubles)
- [Code Coverage](#code-coverage)
- [Testing React Components](#testing-react-components)
- [Snapshot Testing](#snapshot-testing)
- [Testing Async Code](#testing-async-code)
- [Testing Error Scenarios](#testing-error-scenarios)
- [Test Naming Conventions](#test-naming-conventions)
- [When NOT to Test](#when-not-to-test)
- [Testing in CI](#testing-in-ci)
- [Flaky Tests](#flaky-tests)

---

## The Testing Pyramid

The testing pyramid is a model that describes the ideal distribution of tests in a
software project. It was introduced by Mike Cohn and remains one of the most useful
mental models for test strategy.

```
        /  E2E  \          Few, slow, expensive
       /----------\
      / Integration \      Moderate number
     /----------------\
    /    Unit Tests     \  Many, fast, cheap
   /____________________\
```

### Layers

| Layer       | Speed   | Cost    | Confidence | Quantity |
|-------------|---------|---------|------------|----------|
| Unit        | Fast    | Low     | Low-Med    | Many     |
| Integration | Medium  | Medium  | Medium     | Some     |
| E2E         | Slow    | High    | High       | Few      |

The key insight: **unit tests form the base**. They are fast, cheap to write, and give
you rapid feedback. As you move up the pyramid, tests become slower and more expensive,
but they verify that pieces actually work together.

### The "Ice Cream Cone" Anti-Pattern

Many teams accidentally invert the pyramid — lots of E2E tests, few unit tests. This
leads to slow CI pipelines, flaky tests, and painful debugging.

```
   ____________________
  \    E2E (too many)  /
   \------------------/
    \  Integration   /
     \--------------/
      \   Unit     /       <-- too few
       \__________/
```

---

## Unit Testing

A unit test verifies a **single unit of behavior** in isolation. In frontend code, a
"unit" is typically a function, a hook, or a small module.

### What to Test

- **Pure functions**: Given input X, expect output Y
- **Edge cases**: Empty arrays, null inputs, boundary values
- **Business logic**: Calculations, transformations, validations
- **State transitions**: Redux reducers, state machines

### What NOT to Unit Test

- Third-party library internals
- Simple getters/setters with no logic
- Framework-generated boilerplate

### The Arrange-Act-Assert Pattern

Every well-structured test follows this three-phase pattern:

```typescript
// Arrange — set up the test scenario
const calculator = new Calculator();
const a = 10;
const b = 5;

// Act — perform the action being tested
const result = calculator.add(a, b);

// Assert — verify the outcome
expect(result).toBe(15);
```

### Isolation

Unit tests must be **isolated**. Each test should:

- Not depend on other tests' execution order
- Not share mutable state
- Not make network requests
- Not touch the filesystem
- Not depend on system time (unless mocked)

```typescript
// BAD: Tests share state
let counter = 0;

test("increment", () => {
  counter++;
  expect(counter).toBe(1);
});

test("increment again", () => {
  counter++;
  expect(counter).toBe(2); // Fails if first test doesn't run
});

// GOOD: Each test owns its state
test("increment", () => {
  let counter = 0;
  counter++;
  expect(counter).toBe(1);
});
```

---

## Integration Testing

Integration tests verify that **multiple units work correctly together**. They test
the boundaries between modules — the contracts, data flow, and side effects.

### What Integration Tests Cover

- Module A calling Module B and getting the right result
- API request/response cycles
- Database queries returning expected data
- Component trees rendering with real child components

### API Testing Example (Conceptual)

```typescript
// Integration test: UserService + API layer
test("fetching user profile returns formatted data", async () => {
  // Uses a real (or test) API server, not mocks
  const service = new UserService(testApiClient);
  const profile = await service.getProfile("user-123");

  expect(profile.displayName).toBe("Jane Doe");
  expect(profile.avatarUrl).toMatch(/^https:\/\//);
});
```

### When to Use Integration Tests

- Verifying request/response contracts between client and server
- Ensuring database migrations don't break queries
- Validating that component composition works (parent + child)
- Checking that event handlers fire and update state correctly

---

## End-to-End Testing

E2E tests simulate **real user behavior** through the full application stack — browser,
frontend, API, database, everything.

### Tools

| Tool       | Language   | Key Feature                    |
|------------|------------|--------------------------------|
| Playwright | TS/JS      | Multi-browser, auto-waiting    |
| Cypress    | JS         | Time-travel debugging          |
| Puppeteer  | JS         | Chrome DevTools Protocol       |

### What to E2E Test

Focus on **critical user journeys**:

- Sign up / sign in flow
- Checkout / payment flow
- Core CRUD operations
- Navigation between major sections

### Example (Playwright-style pseudocode)

```typescript
test("user can add item to cart and checkout", async ({ page }) => {
  await page.goto("/products");
  await page.click('[data-testid="product-1"]');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="cart-icon"]');

  await expect(page.locator(".cart-count")).toHaveText("1");

  await page.click('[data-testid="checkout-btn"]');
  await expect(page).toHaveURL(/\/checkout/);
});
```

### E2E Test Best Practices

- Use `data-testid` attributes instead of CSS selectors
- Keep E2E tests short — verify one journey per test
- Run E2E tests against a staging environment, not production
- Accept that E2E tests are slower — don't run them on every commit

---

## Test-Driven Development (TDD)

TDD is a development methodology where you write tests **before** writing implementation
code. It follows a strict cycle:

### The Red-Green-Refactor Cycle

```
  1. RED     — Write a failing test
       |
  2. GREEN   — Write the minimum code to pass
       |
  3. REFACTOR — Clean up without changing behavior
       |
       └──→ Back to 1
```

### TDD Example

```typescript
// Step 1: RED — Write a failing test
test("fizzbuzz returns 'Fizz' for multiples of 3", () => {
  expect(fizzbuzz(3)).toBe("Fizz");
  expect(fizzbuzz(9)).toBe("Fizz");
});

// Step 2: GREEN — Minimum code to pass
function fizzbuzz(n: number): string {
  if (n % 3 === 0) return "Fizz";
  return String(n);
}

// Step 3: REFACTOR — (nothing to clean up yet, add next test)
```

### Benefits of TDD

- Forces you to think about the interface before the implementation
- Produces high test coverage naturally
- Catches regressions immediately
- Results in smaller, more focused functions

### When TDD Works Best

- Well-defined business logic (validators, calculators, parsers)
- Bug fixes (write a test that reproduces the bug first)
- Library/utility code

### When TDD Is Less Practical

- Exploratory prototyping where requirements are unclear
- UI layout work (visual, not behavioral)
- One-off scripts

---

## Test Doubles

Test doubles are objects that stand in for real dependencies during testing. There are
four common types, and understanding the differences matters.

### Mock

A mock is a **pre-programmed object** with expectations about how it will be called.

```typescript
const mockSendEmail = mock<SendEmailFn>();
mockSendEmail.mockReturnValue(Promise.resolve(true));

await registerUser("alice@example.com");

expect(mockSendEmail).toHaveBeenCalledWith("alice@example.com", "Welcome!");
```

Use mocks when you need to **verify interactions** — that a function was called with
specific arguments.

### Stub

A stub provides **canned answers** to calls. Unlike mocks, stubs don't verify that
they were called — they just return data.

```typescript
const stubUserRepo = {
  findById: () => ({ id: "1", name: "Alice" }),
};

const user = await getUser(stubUserRepo, "1");
expect(user.name).toBe("Alice");
```

### Spy

A spy wraps a **real function** and records calls to it, while still executing the
original logic.

```typescript
const spy = createSpy(console, "log");
console.log("hello");

expect(spy.calls.length).toBe(1);
expect(spy.calls[0][0]).toBe("hello");
// console.log still actually ran
```

### Fake

A fake is a **working implementation** that takes a shortcut. For example, an in-memory
database instead of a real one.

```typescript
class FakeUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
}
```

### Quick Reference

| Double | Has Logic? | Verifies Calls? | Use Case                    |
|--------|-----------|------------------|-----------------------------|
| Mock   | No        | Yes              | Verify interactions         |
| Stub   | No        | No               | Provide canned data         |
| Spy    | Yes       | Yes              | Observe real behavior       |
| Fake   | Yes       | No               | Lightweight replacement     |

---

## Code Coverage

Code coverage measures how much of your code is executed during tests.

### Types of Coverage

- **Line coverage**: What percentage of lines were executed?
- **Branch coverage**: Were both sides of every `if/else` executed?
- **Function coverage**: Was every function called at least once?

### Why 100% Coverage Isn't the Goal

```typescript
// This function has 100% line coverage with one test:
function add(a: number, b: number): number {
  return a + b;
}
test("add", () => expect(add(1, 2)).toBe(3)); // 100% coverage!

// But does it handle overflow? NaN? Infinity?
// Coverage says "tested" — but is it really?
```

100% coverage creates a **false sense of security**. It tells you what code ran, not
whether the behavior is correct. A test that calls a function without asserting
anything contributes to coverage but catches zero bugs.

### Practical Coverage Targets

| Context            | Target    | Notes                             |
|--------------------|-----------|-----------------------------------|
| Utility libraries  | 90-100%   | Pure functions, easy to test      |
| Business logic     | 80-90%    | Critical paths must be covered    |
| UI components      | 60-80%    | Test behavior, not layout         |
| Glue code          | 40-60%    | Integration tests cover these     |

---

## Testing React Components

When testing React components, **test behavior, not implementation**.

### What to Test

- Does the component render the correct output for given props?
- Do user interactions (click, type, submit) produce the right result?
- Does the component show/hide elements based on state?
- Are callbacks called with the correct arguments?

### What NOT to Test

- Internal state values directly
- Component instance methods
- CSS class names (unless they drive behavior)
- Render count

### Example

```typescript
// BAD: Testing implementation
test("sets isOpen state to true", () => {
  const wrapper = shallow(<Dropdown />);
  wrapper.instance().setState({ isOpen: true });
  expect(wrapper.state("isOpen")).toBe(true);
});

// GOOD: Testing behavior
test("opens dropdown when trigger is clicked", () => {
  render(<Dropdown />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("listbox")).toBeVisible();
});
```

---

## Snapshot Testing

Snapshot testing captures the rendered output of a component and compares it against
a stored "snapshot" file on subsequent runs.

### How It Works

1. First run: test renders component, serializes output, saves to `.snap` file
2. Subsequent runs: compare current output to saved snapshot
3. If different: test fails, developer reviews the diff

### Pros

- Easy to set up — one line of code
- Catches unexpected UI changes
- Good for large, stable components

### Cons

- **Snapshot blindness**: Developers auto-approve changes without reviewing
- **Brittle**: Any change (even formatting) breaks the test
- **Large diffs**: Hard to review meaningful changes in big snapshots
- **False confidence**: Passing snapshot doesn't mean correct behavior

### When to Use

- Serializable data structures (API responses, config objects)
- Stable components that rarely change
- As a complement to behavioral tests, never as a replacement

---

## Testing Async Code

Async code requires special handling in tests.

### Patterns

```typescript
// 1. async/await (preferred)
test("fetches user data", async () => {
  const user = await fetchUser("123");
  expect(user.name).toBe("Alice");
});

// 2. Testing rejected promises
test("throws on invalid ID", async () => {
  await expect(fetchUser("invalid")).rejects.toThrow("Not found");
});

// 3. Testing timers
test("debounce waits before calling", () => {
  jest.useFakeTimers();
  const fn = jest.fn();
  const debounced = debounce(fn, 300);

  debounced();
  expect(fn).not.toHaveBeenCalled();

  jest.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
});
```

### Common Pitfalls

- Forgetting to `await` — test passes but assertion never runs
- Not cleaning up timers or subscriptions
- Race conditions between test setup and async operations

---

## Testing Error Scenarios

Don't just test the happy path. Error scenarios often contain the most critical bugs.

### What to Test

- Invalid input handling
- Network failure responses
- Timeout behavior
- Boundary conditions (empty arrays, max values)
- Permission/authorization failures

```typescript
test("shows error message on network failure", async () => {
  mockFetch.mockRejectedValue(new Error("Network error"));

  render(<UserProfile userId="123" />);

  await waitFor(() => {
    expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
  });
});
```

---

## Test Naming Conventions

Good test names are documentation. They describe **what** is being tested and **what
should happen**.

### Format: `[unit] [scenario] [expected result]`

```typescript
// GOOD
test("formatCurrency returns $0.00 for zero input", () => {});
test("validateEmail rejects strings without @ symbol", () => {});
test("CartTotal displays free shipping for orders over $50", () => {});

// BAD
test("test 1", () => {});
test("it works", () => {});
test("formatCurrency", () => {});
```

### describe Blocks for Grouping

```typescript
describe("ShoppingCart", () => {
  describe("addItem", () => {
    test("adds new item to empty cart", () => {});
    test("increments quantity for existing item", () => {});
    test("throws for negative quantity", () => {});
  });

  describe("removeItem", () => {
    test("removes item from cart", () => {});
    test("does nothing if item not in cart", () => {});
  });
});
```

---

## When NOT to Test

Testing everything is not pragmatic. Skip tests for:

- **Trivial code**: Simple property access, one-line wrappers
- **Third-party code**: Trust that lodash, React, etc. test themselves
- **Type-only assertions**: TypeScript already enforces types at compile time
- **One-off scripts**: Migration scripts, data fixes you'll run once
- **Generated code**: GraphQL codegen, Prisma client, etc.

The question to ask: **"If this breaks, will my tests catch it?"** versus **"Is the
cost of writing and maintaining this test worth the confidence it gives me?"**

---

## Testing in CI

### Running Tests on Pull Requests

Every PR should trigger a test run. A typical CI pipeline:

```
PR opened → lint → type-check → unit tests → integration tests → e2e tests → deploy preview
```

### Parallel Tests

Large test suites benefit from parallelization:

- **File-level parallelism**: Run different test files on different workers
- **CI-level parallelism**: Split tests across multiple CI machines
- **Sharding**: Divide test suite into N shards, run each on a separate machine

```yaml
# Example: GitHub Actions matrix for test sharding
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npx jest --shard=${{ matrix.shard }}/4
```

### Test Reporting

- Generate JUnit XML reports for CI integration
- Track test duration trends — alert on slowdowns
- Require passing tests before merge (branch protection)

---

## Flaky Tests

A flaky test is one that **passes and fails intermittently** without code changes.
Flaky tests erode team trust in the test suite.

### Common Causes

1. **Timing dependencies**: Hardcoded `setTimeout` or `sleep` instead of waiting for
   conditions
2. **Shared mutable state**: Tests modify global state without cleanup
3. **Network dependencies**: Tests hit real APIs that are sometimes slow/down
4. **Non-deterministic data**: Using `Math.random()`, `Date.now()`, or UUIDs
5. **Test order dependency**: Test B passes only if Test A runs first
6. **Resource leaks**: Open handles, unclosed connections

### Solutions

| Cause               | Fix                                          |
|---------------------|----------------------------------------------|
| Timing              | Use `waitFor`, polling, or event-based waits |
| Shared state        | Reset state in `beforeEach` / `afterEach`    |
| Network             | Mock external APIs                           |
| Non-deterministic   | Seed random values, freeze time              |
| Order dependency    | Make each test self-contained                |
| Resource leaks      | Add proper cleanup in `afterEach`            |

### Quarantine Strategy

When a flaky test is found:
1. Mark it as `skip` or move to a quarantine suite
2. Create a ticket to fix it
3. Don't let it block PRs in the meantime
4. Fix the root cause — don't just retry

---

## Summary

- Build tests from the bottom up: many unit tests, fewer integration, fewest E2E
- Follow Arrange-Act-Assert for clear test structure
- Use the right test double for the job (mock ≠ stub ≠ spy ≠ fake)
- TDD is powerful for well-defined logic — red, green, refactor
- Coverage is a metric, not a goal — aim for confidence, not numbers
- Test behavior, not implementation (especially in React)
- Name tests clearly — they're documentation
- Fix flaky tests immediately — they're worse than no tests
- Run tests in CI on every PR — automate the safety net
