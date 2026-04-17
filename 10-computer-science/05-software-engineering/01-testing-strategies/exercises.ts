// ============================================================================
// TOPIC 1: Testing Strategies — Exercises
// ============================================================================
// Run: npx tsx 01-testing-strategies/exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// MINI TEST FRAMEWORK (for verifying exercises)
// ============================================================================

type TestFn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: TestFn;
}

const testResults: { passed: number; failed: number; errors: string[] } = {
  passed: 0,
  failed: 0,
  errors: [],
};

function test(name: string, fn: TestFn): void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then(() => {
          testResults.passed++;
          console.log(`  ✓ ${name}`);
        })
        .catch((e: unknown) => {
          testResults.failed++;
          const msg = e instanceof Error ? e.message : String(e);
          testResults.errors.push(`${name}: ${msg}`);
          console.log(`  ✗ ${name}: ${msg}`);
        });
    } else {
      testResults.passed++;
      console.log(`  ✓ ${name}`);
    }
  } catch (e: unknown) {
    testResults.failed++;
    const msg = e instanceof Error ? e.message : String(e);
    testResults.errors.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}: ${msg}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, label = ""): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label ? label + ": " : ""}Expected ${e}, got ${a}`);
  }
}

// ============================================================================
// EXERCISE 1: Implement a simple test runner (describe + it)
// Difficulty: ★★★
// Topics: Test framework internals
// ============================================================================
// Implement `createTestRunner` that returns `describe` and `it` functions.
// - `describe(name, fn)` groups tests under a suite name
// - `it(name, fn)` registers a test case
// - `run()` executes all tests and returns results
//
// interface SuiteResult {
//   suiteName: string;
//   tests: { name: string; passed: boolean; error?: string }[];
// }

interface SuiteResult {
  suiteName: string;
  tests: { name: string; passed: boolean; error?: string }[];
}

interface TestRunner {
  describe: (name: string, fn: () => void) => void;
  it: (name: string, fn: () => void) => void;
  run: () => SuiteResult[];
}

function createTestRunner(): TestRunner {
  // YOUR CODE HERE
  return undefined as unknown as TestRunner;
}

// Tests:
// test("Exercise 1: createTestRunner", () => {
//   const runner = createTestRunner();
//   runner.describe("Math", () => {
//     runner.it("adds numbers", () => {
//       if (1 + 1 !== 2) throw new Error("1+1 should be 2");
//     });
//     runner.it("fails on purpose", () => {
//       throw new Error("intentional failure");
//     });
//   });
//   const results = runner.run();
//   assertEqual(results.length, 1);
//   assertEqual(results[0].suiteName, "Math");
//   assertEqual(results[0].tests.length, 2);
//   assertEqual(results[0].tests[0].passed, true);
//   assertEqual(results[0].tests[1].passed, false);
//   assert(results[0].tests[1].error !== undefined, "should have error message");
// });

// ============================================================================
// EXERCISE 2: Implement expect().toBe()
// Difficulty: ★★
// Topics: Assertion library design
// ============================================================================
// Implement an `expect` function that returns an object with:
// - `toBe(expected)`: strict equality check (===)
// - `not.toBe(expected)`: negated strict equality

interface Expectation<T> {
  toBe: (expected: T) => void;
  not: {
    toBe: (expected: T) => void;
  };
}

function expect<T>(actual: T): Expectation<T> {
  // YOUR CODE HERE
  return undefined as unknown as Expectation<T>;
}

// Tests:
// test("Exercise 2: expect().toBe()", () => {
//   expect(1).toBe(1);
//   expect("hello").toBe("hello");
//   expect(true).not.toBe(false);
//   let threw = false;
//   try { expect(1).toBe(2); } catch { threw = true; }
//   assert(threw, "should throw for non-equal values");
//   threw = false;
//   try { expect(1).not.toBe(1); } catch { threw = true; }
//   assert(threw, "not.toBe should throw for equal values");
// });

// ============================================================================
// EXERCISE 3: Implement expect().toEqual() (deep equality)
// Difficulty: ★★★
// Topics: Deep comparison, recursion
// ============================================================================
// Implement `toEqual` that does deep structural equality for objects and arrays.

interface DeepExpectation<T> {
  toEqual: (expected: T) => void;
}

function expectDeep<T>(actual: T): DeepExpectation<T> {
  // YOUR CODE HERE
  return undefined as unknown as DeepExpectation<T>;
}

// Tests:
// test("Exercise 3: expectDeep().toEqual()", () => {
//   expectDeep({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } });
//   expectDeep([1, [2, 3]]).toEqual([1, [2, 3]]);
//   let threw = false;
//   try { expectDeep({ a: 1 }).toEqual({ a: 2 }); } catch { threw = true; }
//   assert(threw, "should throw for non-equal objects");
// });

// ============================================================================
// EXERCISE 4: Implement expect().toThrow()
// Difficulty: ★★
// Topics: Error assertion
// ============================================================================
// Implement a function that asserts another function throws an error.
// Optionally match the error message.

interface ThrowExpectation {
  toThrow: (message?: string) => void;
}

function expectFn(fn: () => void): ThrowExpectation {
  // YOUR CODE HERE
  return undefined as unknown as ThrowExpectation;
}

// Tests:
// test("Exercise 4: expectFn().toThrow()", () => {
//   expectFn(() => { throw new Error("boom"); }).toThrow();
//   expectFn(() => { throw new Error("boom"); }).toThrow("boom");
//   let threw = false;
//   try { expectFn(() => {}).toThrow(); } catch { threw = true; }
//   assert(threw, "should throw when function doesn't throw");
//   threw = false;
//   try { expectFn(() => { throw new Error("boom"); }).toThrow("bang"); } catch { threw = true; }
//   assert(threw, "should throw when message doesn't match");
// });

// ============================================================================
// EXERCISE 5: Implement a mock/spy function
// Difficulty: ★★★★
// Topics: Test doubles, call recording
// ============================================================================
// Implement `createSpy` that returns a function tracking its calls.
// - `.calls`: array of argument arrays
// - `.callCount`: number of times called
// - `.returnValue(val)`: configure what spy returns
// - `.reset()`: clear call history

interface SpyFn<TArgs extends unknown[], TReturn> {
  (...args: TArgs): TReturn;
  calls: TArgs[];
  callCount: number;
  returnValue: (val: TReturn) => void;
  reset: () => void;
}

function createSpy<TArgs extends unknown[] = unknown[], TReturn = undefined>(): SpyFn<TArgs, TReturn> {
  // YOUR CODE HERE
  return undefined as unknown as SpyFn<TArgs, TReturn>;
}

// Tests:
// test("Exercise 5: createSpy", () => {
//   const spy = createSpy<[number, number], number>();
//   spy.returnValue(42);
//   const result = spy(1, 2);
//   assertEqual(result, 42);
//   assertEqual(spy.callCount, 1);
//   assertEqual(spy.calls[0], [1, 2]);
//   spy(3, 4);
//   assertEqual(spy.callCount, 2);
//   spy.reset();
//   assertEqual(spy.callCount, 0);
//   assertEqual(spy.calls.length, 0);
// });

// ============================================================================
// EXERCISE 6: Implement expect().toHaveBeenCalled()
// Difficulty: ★★★
// Topics: Mock assertions
// ============================================================================
// Implement `expectSpy` that checks spy call state:
// - `toHaveBeenCalled()`: called at least once
// - `toHaveBeenCalledTimes(n)`: called exactly n times
// - `toHaveBeenCalledWith(...args)`: at least one call matched these args

interface SpyExpectation<TArgs extends unknown[]> {
  toHaveBeenCalled: () => void;
  toHaveBeenCalledTimes: (n: number) => void;
  toHaveBeenCalledWith: (...args: TArgs) => void;
}

function expectSpy<TArgs extends unknown[], TReturn>(
  spy: SpyFn<TArgs, TReturn>
): SpyExpectation<TArgs> {
  // YOUR CODE HERE
  return undefined as unknown as SpyExpectation<TArgs>;
}

// Tests:
// test("Exercise 6: expectSpy", () => {
//   const spy = createSpy<[string], void>();
//   spy("hello");
//   spy("world");
//   expectSpy(spy).toHaveBeenCalled();
//   expectSpy(spy).toHaveBeenCalledTimes(2);
//   expectSpy(spy).toHaveBeenCalledWith("hello");
//   let threw = false;
//   try { expectSpy(spy).toHaveBeenCalledWith("missing"); } catch { threw = true; }
//   assert(threw, "should throw when args don't match any call");
// });

// ============================================================================
// EXERCISE 7: Implement a test reporter
// Difficulty: ★★★
// Topics: Formatting test output
// ============================================================================
// Implement `formatTestReport` that takes SuiteResult[] and returns a string.
// Format:
//   Suite: <name>
//     ✓ <passing test name>
//     ✗ <failing test name>: <error>
//   ---
//   Total: X passed, Y failed

function formatTestReport(results: SuiteResult[]): string {
  // YOUR CODE HERE
  return "";
}

// Tests:
// test("Exercise 7: formatTestReport", () => {
//   const results: SuiteResult[] = [{
//     suiteName: "Math",
//     tests: [
//       { name: "adds", passed: true },
//       { name: "divides by zero", passed: false, error: "division error" },
//     ],
//   }];
//   const report = formatTestReport(results);
//   assert(report.includes("Suite: Math"), "should include suite name");
//   assert(report.includes("✓ adds"), "should include passing test");
//   assert(report.includes("✗ divides by zero: division error"), "should include failing test");
//   assert(report.includes("Total: 1 passed, 1 failed"), "should include summary");
// });

// ============================================================================
// EXERCISE 8: Write tests for a calculator using the custom framework
// Difficulty: ★★
// Topics: Writing effective tests
// ============================================================================
// Given this Calculator class, write at least 5 test cases using
// the runner from Exercise 1. Return the SuiteResult[].

class Calculator {
  add(a: number, b: number): number { return a + b; }
  subtract(a: number, b: number): number { return a - b; }
  multiply(a: number, b: number): number { return a * b; }
  divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
}

function writeCalculatorTests(): SuiteResult[] {
  // YOUR CODE HERE — use createTestRunner (once implemented)
  return [];
}

// Tests:
// test("Exercise 8: writeCalculatorTests", () => {
//   const results = writeCalculatorTests();
//   assert(results.length > 0, "should have at least one suite");
//   const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
//   assert(totalTests >= 5, "should have at least 5 tests");
//   const allPassed = results.every(r => r.tests.every(t => t.passed));
//   assert(allPassed, "all tests should pass");
// });

// ============================================================================
// EXERCISE 9: Implement a fake timer
// Difficulty: ★★★★
// Topics: Timer mocking, controlling time
// ============================================================================
// Implement `createFakeTimers` that provides:
// - `setTimeout(fn, ms)` — registers a callback
// - `advanceTimersByTime(ms)` — advances the clock and fires due callbacks
// - `clearTimeout(id)` — cancels a timeout

interface FakeTimers {
  setTimeout: (fn: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
  advanceTimersByTime: (ms: number) => void;
}

function createFakeTimers(): FakeTimers {
  // YOUR CODE HERE
  return undefined as unknown as FakeTimers;
}

// Tests:
// test("Exercise 9: createFakeTimers", () => {
//   const timers = createFakeTimers();
//   let called = false;
//   timers.setTimeout(() => { called = true; }, 1000);
//   assert(!called, "should not fire before advancing");
//   timers.advanceTimersByTime(500);
//   assert(!called, "should not fire before timeout");
//   timers.advanceTimersByTime(500);
//   assert(called, "should fire after timeout");
//
//   let cancelled = false;
//   const id = timers.setTimeout(() => { cancelled = true; }, 100);
//   timers.clearTimeout(id);
//   timers.advanceTimersByTime(200);
//   assert(!cancelled, "cleared timeout should not fire");
// });

// ============================================================================
// EXERCISE 10 (PREDICT): What does this test output?
// Difficulty: ★★
// ============================================================================
// Predict the output. Does the test pass or fail, and why?

function exercise10_predict(): string {
  const values: number[] = [];
  const push = (v: number) => values.push(v);

  push(1);
  setTimeout(() => push(2), 0);
  push(3);

  // If we assert immediately: values === [1, 3] or [1, 2, 3]?
  // YOUR ANSWER: "pass" or "fail", and explain in the string
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 10: predict async behavior", () => {
//   const answer = exercise10_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
//   // Values immediately after synchronous execution: [1, 3]
//   // setTimeout callback hasn't fired yet (it's in the macrotask queue)
//   assert(
//     answer.toLowerCase().includes("[1, 3]") || answer.toLowerCase().includes("1, 3"),
//     "should predict that values are [1, 3] synchronously"
//   );
// });

// ============================================================================
// EXERCISE 11 (PREDICT): Will this test be flaky?
// Difficulty: ★★
// ============================================================================

function exercise11_predict(): string {
  // Consider this test:
  // test("timing test", async () => {
  //   const start = Date.now();
  //   await new Promise(resolve => setTimeout(resolve, 100));
  //   const elapsed = Date.now() - start;
  //   assert(elapsed === 100, "should take exactly 100ms");
  // });
  //
  // Will it be flaky? Why or why not?
  // YOUR ANSWER: "flaky" or "not flaky" + explanation
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 11: predict flakiness", () => {
//   const answer = exercise11_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
//   assert(answer.toLowerCase().includes("flaky"), "should identify as flaky");
// });

// ============================================================================
// EXERCISE 12 (PREDICT): What happens with shared state?
// Difficulty: ★★
// ============================================================================

function exercise12_predict(): string {
  // Consider these tests running in order:
  // const db: string[] = [];
  // test("test A", () => { db.push("a"); assertEqual(db.length, 1); });
  // test("test B", () => { db.push("b"); assertEqual(db.length, 1); });
  //
  // What happens?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 12: predict shared state issue", () => {
//   const answer = exercise12_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
//   assert(
//     answer.toLowerCase().includes("fail") || answer.toLowerCase().includes("b fails"),
//     "should predict test B fails due to shared state"
//   );
// });

// ============================================================================
// EXERCISE 13 (PREDICT): Mock vs Spy behavior
// Difficulty: ★★★
// ============================================================================

function exercise13_predict(): string {
  // Given:
  // const original = (x: number) => x * 2;
  // const spy = createSpy(); // from Exercise 5
  // spy.returnValue(99);
  //
  // const result = spy(5);
  //
  // Q: What is `result`? Does the original function run?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 13: predict mock vs spy", () => {
//   const answer = exercise13_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
//   assert(answer.includes("99"), "result should be 99");
//   assert(
//     answer.toLowerCase().includes("original") && answer.toLowerCase().includes("not"),
//     "should explain original does not run"
//   );
// });

// ============================================================================
// EXERCISE 14 (PREDICT): Coverage vs correctness
// Difficulty: ★★
// ============================================================================

function exercise14_predict(): string {
  // This function:
  // function isAdult(age: number): boolean { return age >= 18; }
  //
  // This test gives 100% coverage:
  // test("isAdult", () => { isAdult(20); });
  //
  // Is this test valuable? What's missing?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 14: predict coverage value", () => {
//   const answer = exercise14_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
//   assert(
//     answer.toLowerCase().includes("assert") || answer.toLowerCase().includes("no assertion"),
//     "should identify the missing assertion"
//   );
// });

// ============================================================================
// EXERCISE 15 (FIX): Fix the flaky test
// Difficulty: ★★
// Topics: Flaky tests, timing
// ============================================================================
// This test is flaky because it depends on exact timing.
// Fix it to be reliable.

function flakyFetchUser(): Promise<{ name: string }> {
  return new Promise((resolve) => {
    const delay = Math.random() * 100 + 50; // 50-150ms
    setTimeout(() => resolve({ name: "Alice" }), delay);
  });
}

// BROKEN TEST:
// test("fetches user quickly", async () => {
//   const start = Date.now();
//   const user = await flakyFetchUser();
//   const elapsed = Date.now() - start;
//   assert(elapsed < 100, "should complete in under 100ms"); // FLAKY!
//   assertEqual(user.name, "Alice");
// });

function fixFlakyTimingTest(): string {
  // Describe how you'd fix this test (return the fix as a string description)
  // YOUR CODE HERE
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 15: fix flaky test", () => {
//   const fix = fixFlakyTimingTest();
//   assert(fix !== "YOUR ANSWER HERE", "must provide a fix");
//   assert(
//     fix.toLowerCase().includes("timing") ||
//     fix.toLowerCase().includes("assert") ||
//     fix.toLowerCase().includes("remove"),
//     "should address the timing issue"
//   );
// });

// ============================================================================
// EXERCISE 16 (FIX): Fix test with shared mutable state
// Difficulty: ★★
// Topics: Test isolation
// ============================================================================
// These tests fail intermittently because of shared state. Fix them.

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

class TodoList {
  private items: TodoItem[] = [];
  private nextId = 1;

  add(text: string): TodoItem {
    const item = { id: this.nextId++, text, done: false };
    this.items.push(item);
    return item;
  }

  complete(id: number): void {
    const item = this.items.find((i) => i.id === id);
    if (item) item.done = true;
  }

  getAll(): TodoItem[] {
    return [...this.items];
  }
}

// BROKEN: shared instance
// const sharedTodo = new TodoList();
// test("adds item", () => {
//   sharedTodo.add("test");
//   assertEqual(sharedTodo.getAll().length, 1);
// });
// test("adds another item", () => {
//   sharedTodo.add("test2");
//   assertEqual(sharedTodo.getAll().length, 1); // FAILS — has 2 items!
// });

function fixSharedStateTests(): SuiteResult[] {
  // Fix the tests above so they don't share state. Return SuiteResult[].
  // YOUR CODE HERE
  return [];
}

// Tests:
// test("Exercise 16: fix shared state", () => {
//   const results = fixSharedStateTests();
//   assert(results.length > 0, "should have results");
//   const allPassed = results.every(r => r.tests.every(t => t.passed));
//   assert(allPassed, "all fixed tests should pass");
// });

// ============================================================================
// EXERCISE 17 (FIX): Fix test that tests implementation details
// Difficulty: ★★
// Topics: Testing behavior vs implementation
// ============================================================================
// This test is brittle because it checks internal state.
// Rewrite it to test behavior instead.

class Counter {
  private count = 0;
  increment(): void { this.count++; }
  decrement(): void { this.count--; }
  getCount(): number { return this.count; }
}

// BROKEN (testing internal state):
// test("increment changes internal count", () => {
//   const c = new Counter();
//   c.increment();
//   assertEqual((c as Record<string, unknown>)["count"], 1); // accessing private!
// });

function fixImplementationTest(): SuiteResult[] {
  // Rewrite the test to check behavior through the public API.
  // YOUR CODE HERE
  return [];
}

// Tests:
// test("Exercise 17: fix implementation test", () => {
//   const results = fixImplementationTest();
//   assert(results.length > 0, "should have results");
//   const allPassed = results.every(r => r.tests.every(t => t.passed));
//   assert(allPassed, "behavioral tests should pass");
// });

// ============================================================================
// EXERCISE 18 (FIX): Fix a test with missing error handling
// Difficulty: ★★
// Topics: Testing error paths
// ============================================================================
// This test only tests the happy path. Add error scenario tests.

function parseJSON(input: string): unknown {
  if (typeof input !== "string") throw new TypeError("Input must be a string");
  if (input.trim() === "") throw new Error("Empty input");
  return JSON.parse(input);
}

function fixMissingErrorTests(): SuiteResult[] {
  // Write tests that cover: valid JSON, invalid JSON, empty string, edge cases.
  // YOUR CODE HERE
  return [];
}

// Tests:
// test("Exercise 18: fix missing error tests", () => {
//   const results = fixMissingErrorTests();
//   const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
//   assert(totalTests >= 4, "should have at least 4 tests covering different scenarios");
//   const allPassed = results.every(r => r.tests.every(t => t.passed));
//   assert(allPassed, "all error scenario tests should pass");
// });

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n=== Testing Strategies — Exercises ===\n");
console.log("All exercises are set up with test stubs.");
console.log("Uncomment the test blocks to verify your solutions.");
console.log("Implement each function replacing 'YOUR CODE HERE'.\n");

export {
  createTestRunner,
  expect,
  expectDeep,
  expectFn,
  createSpy,
  expectSpy,
  formatTestReport,
  writeCalculatorTests,
  createFakeTimers,
  exercise10_predict,
  exercise11_predict,
  exercise12_predict,
  exercise13_predict,
  exercise14_predict,
  fixFlakyTimingTest,
  fixSharedStateTests,
  fixImplementationTest,
  fixMissingErrorTests,
};
