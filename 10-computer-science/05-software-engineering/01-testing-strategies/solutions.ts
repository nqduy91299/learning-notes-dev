// ============================================================================
// TOPIC 1: Testing Strategies — Solutions
// ============================================================================
// Run: npx tsx 01-testing-strategies/solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// MINI TEST FRAMEWORK
// ============================================================================

type TestFn = () => void | Promise<void>;

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
// SOLUTION 1: Implement a simple test runner
// ============================================================================

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
  const suites: { name: string; tests: { name: string; fn: () => void }[] }[] = [];
  let currentSuite: { name: string; tests: { name: string; fn: () => void }[] } | null = null;

  return {
    describe(name: string, fn: () => void): void {
      currentSuite = { name, tests: [] };
      suites.push(currentSuite);
      fn();
      currentSuite = null;
    },

    it(name: string, fn: () => void): void {
      if (!currentSuite) throw new Error("it() must be called inside describe()");
      currentSuite.tests.push({ name, fn });
    },

    run(): SuiteResult[] {
      return suites.map((suite) => ({
        suiteName: suite.name,
        tests: suite.tests.map((t) => {
          try {
            t.fn();
            return { name: t.name, passed: true };
          } catch (e: unknown) {
            const error = e instanceof Error ? e.message : String(e);
            return { name: t.name, passed: false, error };
          }
        }),
      }));
    },
  };
}

test("Exercise 1: createTestRunner", () => {
  const runner = createTestRunner();
  runner.describe("Math", () => {
    runner.it("adds numbers", () => {
      if (1 + 1 !== 2) throw new Error("1+1 should be 2");
    });
    runner.it("fails on purpose", () => {
      throw new Error("intentional failure");
    });
  });
  const results = runner.run();
  assertEqual(results.length, 1);
  assertEqual(results[0].suiteName, "Math");
  assertEqual(results[0].tests.length, 2);
  assertEqual(results[0].tests[0].passed, true);
  assertEqual(results[0].tests[1].passed, false);
  assert(results[0].tests[1].error !== undefined, "should have error message");
});

// ============================================================================
// SOLUTION 2: Implement expect().toBe()
// ============================================================================

interface Expectation<T> {
  toBe: (expected: T) => void;
  not: {
    toBe: (expected: T) => void;
  };
}

function expect<T>(actual: T): Expectation<T> {
  return {
    toBe(expected: T): void {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    not: {
      toBe(expected: T): void {
        if (actual === expected) {
          throw new Error(`Expected value to NOT be ${JSON.stringify(expected)}`);
        }
      },
    },
  };
}

test("Exercise 2: expect().toBe()", () => {
  expect(1).toBe(1);
  expect("hello").toBe("hello");
  expect(true).not.toBe(false);
  let threw = false;
  try { expect(1).toBe(2); } catch { threw = true; }
  assert(threw, "should throw for non-equal values");
  threw = false;
  try { expect(1).not.toBe(1); } catch { threw = true; }
  assert(threw, "not.toBe should throw for equal values");
});

// ============================================================================
// SOLUTION 3: Implement expect().toEqual() (deep equality)
// ============================================================================

interface DeepExpectation<T> {
  toEqual: (expected: T) => void;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}

function expectDeep<T>(actual: T): DeepExpectation<T> {
  return {
    toEqual(expected: T): void {
      if (!deepEqual(actual, expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        );
      }
    },
  };
}

test("Exercise 3: expectDeep().toEqual()", () => {
  expectDeep({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } });
  expectDeep([1, [2, 3]]).toEqual([1, [2, 3]]);
  let threw = false;
  try { expectDeep({ a: 1 }).toEqual({ a: 2 }); } catch { threw = true; }
  assert(threw, "should throw for non-equal objects");
});

// ============================================================================
// SOLUTION 4: Implement expect().toThrow()
// ============================================================================

interface ThrowExpectation {
  toThrow: (message?: string) => void;
}

function expectFn(fn: () => void): ThrowExpectation {
  return {
    toThrow(message?: string): void {
      let threw = false;
      let errorMsg = "";
      try {
        fn();
      } catch (e: unknown) {
        threw = true;
        errorMsg = e instanceof Error ? e.message : String(e);
      }
      if (!threw) {
        throw new Error("Expected function to throw, but it did not");
      }
      if (message !== undefined && errorMsg !== message) {
        throw new Error(
          `Expected error message "${message}", got "${errorMsg}"`
        );
      }
    },
  };
}

test("Exercise 4: expectFn().toThrow()", () => {
  expectFn(() => { throw new Error("boom"); }).toThrow();
  expectFn(() => { throw new Error("boom"); }).toThrow("boom");
  let threw = false;
  try { expectFn(() => {}).toThrow(); } catch { threw = true; }
  assert(threw, "should throw when function doesn't throw");
  threw = false;
  try { expectFn(() => { throw new Error("boom"); }).toThrow("bang"); } catch { threw = true; }
  assert(threw, "should throw when message doesn't match");
});

// ============================================================================
// SOLUTION 5: Implement a mock/spy function
// ============================================================================

interface SpyFn<TArgs extends unknown[], TReturn> {
  (...args: TArgs): TReturn;
  calls: TArgs[];
  callCount: number;
  returnValue: (val: TReturn) => void;
  reset: () => void;
}

function createSpy<TArgs extends unknown[] = unknown[], TReturn = undefined>(): SpyFn<TArgs, TReturn> {
  let returnVal: TReturn = undefined as TReturn;

  const fn = function (...args: TArgs): TReturn {
    fn.calls.push(args);
    fn.callCount++;
    return returnVal;
  } as SpyFn<TArgs, TReturn>;

  fn.calls = [];
  fn.callCount = 0;

  fn.returnValue = (val: TReturn): void => {
    returnVal = val;
  };

  fn.reset = (): void => {
    fn.calls = [];
    fn.callCount = 0;
  };

  return fn;
}

test("Exercise 5: createSpy", () => {
  const spy = createSpy<[number, number], number>();
  spy.returnValue(42);
  const result = spy(1, 2);
  assertEqual(result, 42);
  assertEqual(spy.callCount, 1);
  assertEqual(spy.calls[0], [1, 2]);
  spy(3, 4);
  assertEqual(spy.callCount, 2);
  spy.reset();
  assertEqual(spy.callCount, 0);
  assertEqual(spy.calls.length, 0);
});

// ============================================================================
// SOLUTION 6: Implement expectSpy
// ============================================================================

interface SpyExpectation<TArgs extends unknown[]> {
  toHaveBeenCalled: () => void;
  toHaveBeenCalledTimes: (n: number) => void;
  toHaveBeenCalledWith: (...args: TArgs) => void;
}

function expectSpy<TArgs extends unknown[], TReturn>(
  spy: SpyFn<TArgs, TReturn>
): SpyExpectation<TArgs> {
  return {
    toHaveBeenCalled(): void {
      if (spy.callCount === 0) {
        throw new Error("Expected spy to have been called, but it was not");
      }
    },
    toHaveBeenCalledTimes(n: number): void {
      if (spy.callCount !== n) {
        throw new Error(
          `Expected spy to have been called ${n} times, but was called ${spy.callCount} times`
        );
      }
    },
    toHaveBeenCalledWith(...args: TArgs): void {
      const match = spy.calls.some(
        (call) => JSON.stringify(call) === JSON.stringify(args)
      );
      if (!match) {
        throw new Error(
          `Expected spy to have been called with ${JSON.stringify(args)}, ` +
          `but calls were: ${JSON.stringify(spy.calls)}`
        );
      }
    },
  };
}

test("Exercise 6: expectSpy", () => {
  const spy = createSpy<[string], void>();
  spy("hello");
  spy("world");
  expectSpy(spy).toHaveBeenCalled();
  expectSpy(spy).toHaveBeenCalledTimes(2);
  expectSpy(spy).toHaveBeenCalledWith("hello");
  let threw = false;
  try { expectSpy(spy).toHaveBeenCalledWith("missing"); } catch { threw = true; }
  assert(threw, "should throw when args don't match any call");
});

// ============================================================================
// SOLUTION 7: Implement a test reporter
// ============================================================================

function formatTestReport(results: SuiteResult[]): string {
  const lines: string[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of results) {
    lines.push(`Suite: ${suite.suiteName}`);
    for (const t of suite.tests) {
      if (t.passed) {
        lines.push(`  ✓ ${t.name}`);
        totalPassed++;
      } else {
        lines.push(`  ✗ ${t.name}: ${t.error ?? "unknown error"}`);
        totalFailed++;
      }
    }
  }

  lines.push("---");
  lines.push(`Total: ${totalPassed} passed, ${totalFailed} failed`);

  return lines.join("\n");
}

test("Exercise 7: formatTestReport", () => {
  const results: SuiteResult[] = [{
    suiteName: "Math",
    tests: [
      { name: "adds", passed: true },
      { name: "divides by zero", passed: false, error: "division error" },
    ],
  }];
  const report = formatTestReport(results);
  assert(report.includes("Suite: Math"), "should include suite name");
  assert(report.includes("✓ adds"), "should include passing test");
  assert(report.includes("✗ divides by zero: division error"), "should include failing test");
  assert(report.includes("Total: 1 passed, 1 failed"), "should include summary");
});

// ============================================================================
// SOLUTION 8: Write tests for Calculator
// ============================================================================

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
  const runner = createTestRunner();

  runner.describe("Calculator", () => {
    runner.it("adds two positive numbers", () => {
      const calc = new Calculator();
      if (calc.add(2, 3) !== 5) throw new Error("Expected 5");
    });

    runner.it("subtracts numbers", () => {
      const calc = new Calculator();
      if (calc.subtract(10, 4) !== 6) throw new Error("Expected 6");
    });

    runner.it("multiplies numbers", () => {
      const calc = new Calculator();
      if (calc.multiply(3, 4) !== 12) throw new Error("Expected 12");
    });

    runner.it("divides numbers", () => {
      const calc = new Calculator();
      if (calc.divide(10, 2) !== 5) throw new Error("Expected 5");
    });

    runner.it("throws on division by zero", () => {
      const calc = new Calculator();
      let threw = false;
      try { calc.divide(1, 0); } catch { threw = true; }
      if (!threw) throw new Error("Expected error for division by zero");
    });

    runner.it("handles negative numbers in addition", () => {
      const calc = new Calculator();
      if (calc.add(-5, 3) !== -2) throw new Error("Expected -2");
    });
  });

  return runner.run();
}

test("Exercise 8: writeCalculatorTests", () => {
  const results = writeCalculatorTests();
  assert(results.length > 0, "should have at least one suite");
  const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
  assert(totalTests >= 5, "should have at least 5 tests");
  const allPassed = results.every((r) => r.tests.every((t) => t.passed));
  assert(allPassed, "all tests should pass");
});

// ============================================================================
// SOLUTION 9: Implement fake timers
// ============================================================================

interface FakeTimers {
  setTimeout: (fn: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
  advanceTimersByTime: (ms: number) => void;
}

function createFakeTimers(): FakeTimers {
  let currentTime = 0;
  let nextId = 1;
  const timers = new Map<number, { fn: () => void; fireAt: number }>();

  return {
    setTimeout(fn: () => void, ms: number): number {
      const id = nextId++;
      timers.set(id, { fn, fireAt: currentTime + ms });
      return id;
    },

    clearTimeout(id: number): void {
      timers.delete(id);
    },

    advanceTimersByTime(ms: number): void {
      const targetTime = currentTime + ms;

      while (currentTime < targetTime) {
        // Find the next timer that should fire
        let earliest: { id: number; fireAt: number; fn: () => void } | null = null;

        for (const [id, timer] of timers) {
          if (timer.fireAt <= targetTime) {
            if (!earliest || timer.fireAt < earliest.fireAt) {
              earliest = { id, fireAt: timer.fireAt, fn: timer.fn };
            }
          }
        }

        if (earliest) {
          currentTime = earliest.fireAt;
          timers.delete(earliest.id);
          earliest.fn();
        } else {
          currentTime = targetTime;
        }
      }
    },
  };
}

test("Exercise 9: createFakeTimers", () => {
  const timers = createFakeTimers();
  let called = false;
  timers.setTimeout(() => { called = true; }, 1000);
  assert(!called, "should not fire before advancing");
  timers.advanceTimersByTime(500);
  assert(!called, "should not fire before timeout");
  timers.advanceTimersByTime(500);
  assert(called, "should fire after timeout");

  let cancelled = false;
  const id = timers.setTimeout(() => { cancelled = true; }, 100);
  timers.clearTimeout(id);
  timers.advanceTimersByTime(200);
  assert(!cancelled, "cleared timeout should not fire");
});

// ============================================================================
// SOLUTION 10 (PREDICT): Async behavior
// ============================================================================

function exercise10_predict(): string {
  return "Values are [1, 3] synchronously. setTimeout callback is in the macrotask queue and hasn't fired yet.";
}

test("Exercise 10: predict async behavior", () => {
  const answer = exercise10_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
  assert(
    answer.toLowerCase().includes("[1, 3]") || answer.toLowerCase().includes("1, 3"),
    "should predict that values are [1, 3] synchronously"
  );
});

// ============================================================================
// SOLUTION 11 (PREDICT): Flaky timing test
// ============================================================================

function exercise11_predict(): string {
  return "Flaky — setTimeout is not precise. The elapsed time may be 101ms, 102ms, etc. due to event loop overhead and OS scheduling. Never assert exact timing.";
}

test("Exercise 11: predict flakiness", () => {
  const answer = exercise11_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
  assert(answer.toLowerCase().includes("flaky"), "should identify as flaky");
});

// ============================================================================
// SOLUTION 12 (PREDICT): Shared state
// ============================================================================

function exercise12_predict(): string {
  return "Test B fails because shared db already has 'a' from test A, so db.length is 2 after pushing 'b', not 1.";
}

test("Exercise 12: predict shared state issue", () => {
  const answer = exercise12_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
  assert(
    answer.toLowerCase().includes("fail") || answer.toLowerCase().includes("b fails"),
    "should predict test B fails due to shared state"
  );
});

// ============================================================================
// SOLUTION 13 (PREDICT): Mock vs Spy
// ============================================================================

function exercise13_predict(): string {
  return "Result is 99. The original function does not run — the spy replaces it entirely and returns the configured returnValue.";
}

test("Exercise 13: predict mock vs spy", () => {
  const answer = exercise13_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
  assert(answer.includes("99"), "result should be 99");
  assert(
    answer.toLowerCase().includes("original") && answer.toLowerCase().includes("not"),
    "should explain original does not run"
  );
});

// ============================================================================
// SOLUTION 14 (PREDICT): Coverage vs correctness
// ============================================================================

function exercise14_predict(): string {
  return "The test has no assertion — it calls isAdult(20) but never checks the return value. 100% coverage but zero confidence. Missing assertions make coverage meaningless.";
}

test("Exercise 14: predict coverage value", () => {
  const answer = exercise14_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide an answer");
  assert(
    answer.toLowerCase().includes("assert") || answer.toLowerCase().includes("no assertion"),
    "should identify the missing assertion"
  );
});

// ============================================================================
// SOLUTION 15 (FIX): Fix the flaky test
// ============================================================================

function flakyFetchUser(): Promise<{ name: string }> {
  return new Promise((resolve) => {
    const delay = Math.random() * 100 + 50;
    setTimeout(() => resolve({ name: "Alice" }), delay);
  });
}

function fixFlakyTimingTest(): string {
  return "Remove the timing assertion entirely. The test should only verify the result (user.name === 'Alice'), not how long it took. If you must test timing, use a generous upper bound (e.g., < 500ms) or mock the timer.";
}

test("Exercise 15: fix flaky test", () => {
  const fix = fixFlakyTimingTest();
  assert(fix !== "YOUR ANSWER HERE", "must provide a fix");
  assert(
    fix.toLowerCase().includes("timing") ||
    fix.toLowerCase().includes("assert") ||
    fix.toLowerCase().includes("remove"),
    "should address the timing issue"
  );
});

// ============================================================================
// SOLUTION 16 (FIX): Fix shared mutable state
// ============================================================================

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

function fixSharedStateTests(): SuiteResult[] {
  const runner = createTestRunner();

  runner.describe("TodoList (fixed)", () => {
    // Each test creates its own instance — no shared state
    runner.it("adds item", () => {
      const todo = new TodoList();
      todo.add("test");
      if (todo.getAll().length !== 1) throw new Error("Expected 1 item");
    });

    runner.it("adds another item independently", () => {
      const todo = new TodoList();
      todo.add("test2");
      if (todo.getAll().length !== 1) throw new Error("Expected 1 item");
    });

    runner.it("completes an item", () => {
      const todo = new TodoList();
      const item = todo.add("complete me");
      todo.complete(item.id);
      const all = todo.getAll();
      if (!all[0].done) throw new Error("Expected item to be done");
    });
  });

  return runner.run();
}

test("Exercise 16: fix shared state", () => {
  const results = fixSharedStateTests();
  assert(results.length > 0, "should have results");
  const allPassed = results.every((r) => r.tests.every((t) => t.passed));
  assert(allPassed, "all fixed tests should pass");
});

// ============================================================================
// SOLUTION 17 (FIX): Fix implementation detail test
// ============================================================================

class Counter {
  private count = 0;
  increment(): void { this.count++; }
  decrement(): void { this.count--; }
  getCount(): number { return this.count; }
}

function fixImplementationTest(): SuiteResult[] {
  const runner = createTestRunner();

  runner.describe("Counter (behavioral tests)", () => {
    runner.it("starts at zero", () => {
      const c = new Counter();
      if (c.getCount() !== 0) throw new Error("Expected 0");
    });

    runner.it("increments through public API", () => {
      const c = new Counter();
      c.increment();
      if (c.getCount() !== 1) throw new Error("Expected 1");
    });

    runner.it("decrements through public API", () => {
      const c = new Counter();
      c.increment();
      c.increment();
      c.decrement();
      if (c.getCount() !== 1) throw new Error("Expected 1");
    });
  });

  return runner.run();
}

test("Exercise 17: fix implementation test", () => {
  const results = fixImplementationTest();
  assert(results.length > 0, "should have results");
  const allPassed = results.every((r) => r.tests.every((t) => t.passed));
  assert(allPassed, "behavioral tests should pass");
});

// ============================================================================
// SOLUTION 18 (FIX): Fix missing error tests
// ============================================================================

function parseJSON(input: string): unknown {
  if (typeof input !== "string") throw new TypeError("Input must be a string");
  if (input.trim() === "") throw new Error("Empty input");
  return JSON.parse(input);
}

function fixMissingErrorTests(): SuiteResult[] {
  const runner = createTestRunner();

  runner.describe("parseJSON", () => {
    runner.it("parses valid JSON object", () => {
      const result = parseJSON('{"name":"Alice"}') as Record<string, unknown>;
      if (result.name !== "Alice") throw new Error("Expected Alice");
    });

    runner.it("parses valid JSON array", () => {
      const result = parseJSON("[1,2,3]") as number[];
      if (result.length !== 3) throw new Error("Expected array of 3");
    });

    runner.it("throws on empty string", () => {
      let threw = false;
      try { parseJSON(""); } catch { threw = true; }
      if (!threw) throw new Error("Expected error for empty string");
    });

    runner.it("throws on invalid JSON", () => {
      let threw = false;
      try { parseJSON("{invalid}"); } catch { threw = true; }
      if (!threw) throw new Error("Expected error for invalid JSON");
    });

    runner.it("throws on whitespace-only string", () => {
      let threw = false;
      try { parseJSON("   "); } catch { threw = true; }
      if (!threw) throw new Error("Expected error for whitespace-only");
    });

    runner.it("parses primitive JSON values", () => {
      if (parseJSON("42") !== 42) throw new Error("Expected 42");
      if (parseJSON("true") !== true) throw new Error("Expected true");
      if (parseJSON("null") !== null) throw new Error("Expected null");
    });
  });

  return runner.run();
}

test("Exercise 18: fix missing error tests", () => {
  const results = fixMissingErrorTests();
  const totalTests = results.reduce((sum, r) => sum + r.tests.length, 0);
  assert(totalTests >= 4, "should have at least 4 tests covering different scenarios");
  const allPassed = results.every((r) => r.tests.every((t) => t.passed));
  assert(allPassed, "all error scenario tests should pass");
});

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n=== Testing Strategies — Solutions ===\n");

process.on("exit", () => {
  console.log(`\n--- Results: ${testResults.passed} passed, ${testResults.failed} failed ---`);
  if (testResults.errors.length > 0) {
    console.log("\nFailures:");
    testResults.errors.forEach((e) => console.log(`  • ${e}`));
  }
});
