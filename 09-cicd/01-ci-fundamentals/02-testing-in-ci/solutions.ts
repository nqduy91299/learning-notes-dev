// ============================================================
// Testing in CI — Solutions
// ============================================================
// Run: npx tsx 09-cicd/01-ci-fundamentals/02-testing-in-ci/solutions.ts
// ============================================================

// Solution 1: Test Result Type
type TestStatus = 'pass' | 'fail' | 'skip' | 'error';
type TestResult = { name: string; status: TestStatus; durationMs: number; error?: string };
type TestSuiteResult = { suiteName: string; results: TestResult[]; totalDurationMs: number };

// Solution 2: Test Runner Simulator
class TestRunner {
  private tests: Array<{ name: string; fn: () => void | Promise<void>; skip: boolean }> = [];

  addTest(name: string, fn: () => void | Promise<void>): void {
    this.tests.push({ name, fn, skip: false });
  }

  skip(name: string, _fn: () => void): void {
    this.tests.push({ name, fn: _fn, skip: true });
  }

  async run(): Promise<TestSuiteResult> {
    const start = Date.now();
    const results: TestResult[] = [];
    for (const t of this.tests) {
      if (t.skip) {
        results.push({ name: t.name, status: 'skip', durationMs: 0 });
        continue;
      }
      const tStart = Date.now();
      try {
        await t.fn();
        results.push({ name: t.name, status: 'pass', durationMs: Date.now() - tStart });
      } catch (e) {
        results.push({
          name: t.name,
          status: 'fail',
          durationMs: Date.now() - tStart,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    return { suiteName: "default", results, totalDurationMs: Date.now() - start };
  }
}

// Solution 3: Test Suite Summary
function summarize(result: TestSuiteResult) {
  const total = result.results.length;
  const passed = result.results.filter(r => r.status === 'pass').length;
  const failed = result.results.filter(r => r.status === 'fail').length;
  const skipped = result.results.filter(r => r.status === 'skip').length;
  const errors = result.results.filter(r => r.status === 'error').length;
  const nonSkipped = total - skipped;
  const passRate = nonSkipped > 0 ? passed / nonSkipped : 0;
  return { total, passed, failed, skipped, errors, passRate };
}

// Solution 4: Code Coverage Calculator
function calculateCoverage(
  totalLines: number, coveredLines: number,
  totalBranches: number, coveredBranches: number,
  totalFunctions: number, coveredFunctions: number
) {
  const line = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
  const branch = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
  const func = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;
  return { line, branch, function: func, overall: (line + branch + func) / 3 };
}

// Solution 5: Coverage Threshold Checker
function checkThresholds(
  coverage: { line: number; branch: number; function: number },
  thresholds: { line: number; branch: number; function: number }
) {
  const failures: string[] = [];
  if (coverage.line < thresholds.line)
    failures.push(`Line coverage ${coverage.line}% is below threshold ${thresholds.line}%`);
  if (coverage.branch < thresholds.branch)
    failures.push(`Branch coverage ${coverage.branch}% is below threshold ${thresholds.branch}%`);
  if (coverage.function < thresholds.function)
    failures.push(`Function coverage ${coverage.function}% is below threshold ${thresholds.function}%`);
  return { passed: failures.length === 0, failures };
}

// Solution 6: Test Dependency Orderer
function orderTests(tests: Array<{ name: string; dependsOn: string[] }>): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const map = new Map(tests.map(t => [t.name, t]));

  const visit = (name: string) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw new Error(`Circular dependency involving ${name}`);
    visiting.add(name);
    const t = map.get(name);
    if (t) for (const dep of t.dependsOn) visit(dep);
    visiting.delete(name);
    visited.add(name);
    result.push(name);
  };

  for (const t of tests) visit(t.name);
  return result;
}

// Solution 7: Flaky Test Detector
function detectFlakyTests(history: Array<{ name: string; results: Array<'pass' | 'fail'> }>): string[] {
  return history
    .filter(h => h.results.includes('pass') && h.results.includes('fail'))
    .map(h => h.name);
}

// Solution 8: Test Shard Distributor
function distributeTests(
  tests: Array<{ name: string; estimatedDurationMs: number }>,
  shardCount: number
): Array<Array<{ name: string; estimatedDurationMs: number }>> {
  const shards: Array<Array<{ name: string; estimatedDurationMs: number }>> = Array.from({ length: shardCount }, () => []);
  const shardTimes = new Array(shardCount).fill(0);
  // Sort by duration descending for better distribution
  const sorted = [...tests].sort((a, b) => b.estimatedDurationMs - a.estimatedDurationMs);
  for (const test of sorted) {
    const minIdx = shardTimes.indexOf(Math.min(...shardTimes));
    shards[minIdx].push(test);
    shardTimes[minIdx] += test.estimatedDurationMs;
  }
  return shards;
}

// Solution 9: Test Output Formatter
function formatTestResults(result: TestSuiteResult, format: 'console' | 'json' | 'junit'): string {
  if (format === 'json') return JSON.stringify(result);
  if (format === 'console') {
    const lines = result.results.map(r =>
      r.status === 'pass' ? `✓ ${r.name} (${r.durationMs}ms)` :
      r.status === 'skip' ? `○ ${r.name} (skipped)` :
      `✗ ${r.name} (${r.durationMs}ms): ${r.error || 'unknown error'}`
    );
    const s = summarize(result);
    lines.push(`\n${s.passed} passed, ${s.failed} failed, ${s.skipped} skipped`);
    return lines.join('\n');
  }
  // junit
  const cases = result.results.map(r => {
    if (r.status === 'pass') return `  <testcase name="${r.name}" time="${r.durationMs / 1000}" />`;
    if (r.status === 'skip') return `  <testcase name="${r.name}"><skipped /></testcase>`;
    return `  <testcase name="${r.name}" time="${r.durationMs / 1000}"><failure message="${r.error || ''}" /></testcase>`;
  });
  return `<testsuite name="${result.suiteName}" tests="${result.results.length}">\n${cases.join('\n')}\n</testsuite>`;
}

// Solution 10: Test Impact Analyzer
function getAffectedTests(
  moduleTests: Record<string, string[]>,
  dependencies: Record<string, string[]>,
  changedFiles: string[]
): string[] {
  const affectedModules = new Set<string>(changedFiles);
  // Propagate: if a module depends on a changed module, it's affected
  let changed = true;
  while (changed) {
    changed = false;
    for (const [mod, deps] of Object.entries(dependencies)) {
      if (!affectedModules.has(mod) && deps.some(d => affectedModules.has(d))) {
        affectedModules.add(mod);
        changed = true;
      }
    }
  }
  const tests = new Set<string>();
  for (const mod of affectedModules) {
    if (moduleTests[mod]) moduleTests[mod].forEach(t => tests.add(t));
  }
  return [...tests];
}

// Solution 11: Assertion Library
class AssertionError extends Error {
  constructor(msg: string) { super(msg); this.name = 'AssertionError'; }
}

function expect(value: unknown) {
  return {
    toBe(expected: unknown) {
      if (value !== expected) throw new AssertionError(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(value) !== JSON.stringify(expected))
        throw new AssertionError(`Expected deep equal ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
    },
    toContain(item: unknown) {
      if (typeof value === 'string' && typeof item === 'string') {
        if (!value.includes(item)) throw new AssertionError(`Expected "${value}" to contain "${item}"`);
      } else if (Array.isArray(value)) {
        if (!value.includes(item)) throw new AssertionError(`Expected array to contain ${JSON.stringify(item)}`);
      } else {
        throw new AssertionError(`toContain requires string or array`);
      }
    },
    toThrow() {
      if (typeof value !== 'function') throw new AssertionError(`Expected a function`);
      try { (value as () => void)(); } catch { return; }
      throw new AssertionError(`Expected function to throw`);
    },
  };
}

// Solution 12: Mock Function Creator
function createMock() {
  const calls: unknown[][] = [];
  let retVal: unknown = undefined;
  const mock = (...args: unknown[]) => {
    calls.push(args);
    return retVal;
  };
  Object.defineProperty(mock, 'calls', { get: () => calls });
  Object.defineProperty(mock, 'callCount', { get: () => calls.length });
  (mock as Record<string, unknown>).returnValue = (val: unknown) => { retVal = val; };
  return mock as ((...args: unknown[]) => unknown) & { calls: unknown[][]; returnValue: (val: unknown) => void; callCount: number };
}

// ============================================================
// Test Runner
// ============================================================
function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

async function runTests() {
  let passed = 0;
  let failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };

  console.log("\n02-testing-in-ci Solutions\n");

  await test("Ex1: Types exist", () => {
    const r: TestResult = { name: "t", status: "pass", durationMs: 0 };
    assert(r.status === "pass", "type works");
  });

  await test("Ex2: Test runner", async () => {
    const runner = new TestRunner();
    runner.addTest("passes", () => {});
    runner.addTest("fails", () => { throw new Error("oops"); });
    runner.skip("skipped", () => {});
    const result = await runner.run();
    assert(result.results.length === 3, "3 tests");
    assert(result.results[0].status === "pass", "first passes");
    assert(result.results[1].status === "fail", "second fails");
    assert(result.results[2].status === "skip", "third skipped");
  });

  await test("Ex3: Summarize", () => {
    const s = summarize({ suiteName: "s", results: [
      { name: "a", status: "pass", durationMs: 1 },
      { name: "b", status: "fail", durationMs: 1, error: "e" },
      { name: "c", status: "skip", durationMs: 0 },
    ], totalDurationMs: 2 });
    assert(s.total === 3 && s.passed === 1 && s.failed === 1 && s.skipped === 1, "counts");
    assert(s.passRate === 0.5, "passRate");
  });

  await test("Ex4: Coverage calculator", () => {
    const c = calculateCoverage(100, 80, 50, 40, 20, 18);
    assert(c.line === 80, "line");
    assert(c.branch === 80, "branch");
    assert(c.function === 90, "function");
  });

  await test("Ex5: Threshold checker", () => {
    const r = checkThresholds({ line: 75, branch: 80, function: 90 }, { line: 80, branch: 70, function: 85 });
    assert(!r.passed, "should fail");
    assert(r.failures.length === 1, "one failure");
    assert(r.failures[0].includes("Line"), "line failure");
  });

  await test("Ex6: Test ordering", () => {
    const order = orderTests([
      { name: "test-profile", dependsOn: ["test-login"] },
      { name: "test-login", dependsOn: ["test-signup"] },
      { name: "test-signup", dependsOn: [] },
    ]);
    assert(order[0] === "test-signup", "signup first");
    assert(order[1] === "test-login", "login second");
    assert(order[2] === "test-profile", "profile third");
  });

  await test("Ex7: Flaky test detector", () => {
    const flaky = detectFlakyTests([
      { name: "stable", results: ["pass", "pass", "pass"] },
      { name: "flaky", results: ["pass", "fail", "pass"] },
      { name: "broken", results: ["fail", "fail"] },
    ]);
    assert(flaky.length === 1 && flaky[0] === "flaky", "detects flaky");
  });

  await test("Ex8: Shard distributor", () => {
    const shards = distributeTests([
      { name: "a", estimatedDurationMs: 100 },
      { name: "b", estimatedDurationMs: 200 },
      { name: "c", estimatedDurationMs: 150 },
      { name: "d", estimatedDurationMs: 50 },
    ], 2);
    assert(shards.length === 2, "2 shards");
    const totalAll = shards.reduce((sum, s) => sum + s.reduce((a, t) => a + t.estimatedDurationMs, 0), 0);
    assert(totalAll === 500, "all tests distributed");
  });

  await test("Ex9: Output formatter", () => {
    const result: TestSuiteResult = { suiteName: "s", results: [
      { name: "a", status: "pass", durationMs: 5 },
    ], totalDurationMs: 5 };
    assert(formatTestResults(result, 'console').includes("✓ a"), "console format");
    assert(formatTestResults(result, 'json').includes('"suiteName"'), "json format");
    assert(formatTestResults(result, 'junit').includes("<testcase"), "junit format");
  });

  await test("Ex10: Impact analyzer", () => {
    const tests = getAffectedTests(
      { "src/auth.ts": ["test-auth"], "src/api.ts": ["test-api"], "src/db.ts": ["test-db"] },
      { "src/auth.ts": [], "src/api.ts": ["src/auth.ts"], "src/db.ts": [] },
      ["src/auth.ts"]
    );
    assert(tests.includes("test-auth"), "direct");
    assert(tests.includes("test-api"), "transitive");
    assert(!tests.includes("test-db"), "unrelated");
  });

  await test("Ex11: Assertion library", () => {
    expect(1).toBe(1);
    expect([1, 2]).toEqual([1, 2]);
    expect("hello").toContain("ell");
    expect([1, 2, 3]).toContain(2);
    expect(() => { throw new Error(); }).toThrow();
    let threw = false;
    try { expect(1).toBe(2); } catch { threw = true; }
    assert(threw, "should throw on mismatch");
  });

  await test("Ex12: Mock function", () => {
    const mock = createMock();
    mock.returnValue(42);
    const result = mock(1, 2);
    assert(result === 42, "returns configured value");
    assert(mock.callCount === 1, "tracks calls");
    assert(mock.calls[0][0] === 1, "tracks args");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
