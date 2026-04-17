// ============================================================
// Matrix Strategy — Solutions
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/05-matrix-strategy/solutions.ts
// ============================================================

// Solution 1
function expandMatrix(matrix: Record<string, unknown[]>): Array<Record<string, unknown>> {
  const keys = Object.keys(matrix);
  if (keys.length === 0) return [{}];
  let combos: Array<Record<string, unknown>> = [{}];
  for (const key of keys) {
    const next: Array<Record<string, unknown>> = [];
    for (const combo of combos) {
      for (const val of matrix[key]) next.push({ ...combo, [key]: val });
    }
    combos = next;
  }
  return combos;
}

// Solution 2
function applyIncludeExclude(
  combinations: Array<Record<string, unknown>>,
  include?: Array<Record<string, unknown>>,
  exclude?: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  let result = [...combinations];
  if (exclude) {
    result = result.filter(c => !exclude.some(ex => Object.entries(ex).every(([k, v]) => c[k] === v)));
  }
  if (include) result.push(...include);
  return result;
}

// Solution 3
function predictJobCount(
  matrix: Record<string, unknown[]>,
  include?: Array<Record<string, unknown>>,
  exclude?: Array<Record<string, unknown>>
): number {
  return applyIncludeExclude(expandMatrix(matrix), include, exclude).length;
}

// Solution 4
async function simulateFailFast(
  jobs: Array<{name: string; durationMs: number; willFail: boolean}>,
  failFast: boolean
): Promise<Array<{name: string; status: 'success' | 'failure' | 'cancelled'}>> {
  const results: Array<{name: string; status: 'success' | 'failure' | 'cancelled'}> = [];
  let cancelled = false;

  await Promise.all(jobs.map(async (job) => {
    await new Promise(r => setTimeout(r, job.durationMs));
    if (cancelled) { results.push({ name: job.name, status: 'cancelled' }); return; }
    if (job.willFail) {
      results.push({ name: job.name, status: 'failure' });
      if (failFast) cancelled = true;
    } else {
      results.push({ name: job.name, status: cancelled ? 'cancelled' : 'success' });
    }
  }));
  return results.sort((a, b) => jobs.findIndex(j => j.name === a.name) - jobs.findIndex(j => j.name === b.name));
}

// Solution 5
async function runWithMaxParallel<T>(tasks: Array<() => Promise<T>>, maxParallel: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let idx = 0;

  const worker = async () => {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  };

  await Promise.all(Array.from({ length: Math.min(maxParallel, tasks.length) }, () => worker()));
  return results;
}

// Solution 6
function generateDynamicMatrix(
  packages: string[],
  changedFiles: string[],
  packagePaths: Record<string, string>
): { package: string[] } {
  const changed = packages.filter(pkg => {
    const prefix = packagePaths[pkg];
    return prefix && changedFiles.some(f => f.startsWith(prefix));
  });
  return { package: changed.length > 0 ? changed : packages };
}

// Solution 7
function calculateMatrixCost(
  matrix: Record<string, unknown[]>,
  costPerMinute: number,
  estimatedMinutesPerJob: number,
  include?: Array<Record<string, unknown>>,
  exclude?: Array<Record<string, unknown>>
) {
  const totalJobs = predictJobCount(matrix, include, exclude);
  const totalMinutes = totalJobs * estimatedMinutesPerJob;
  return { totalJobs, totalMinutes, totalCost: totalMinutes * costPerMinute };
}

// Solution 8
function nameMatrixJobs(combinations: Array<Record<string, unknown>>, template: string): string[] {
  return combinations.map(combo =>
    template.replace(/\{(\w+)\}/g, (_m, key) => String(combo[key] ?? ''))
  );
}

// Solution 9
function optimizeMatrix(matrix: Record<string, unknown[]>, maxJobs: number): Record<string, unknown[]> {
  const keys = Object.keys(matrix);
  const total = keys.reduce((acc, k) => acc * matrix[k].length, 1);
  if (total <= maxJobs) return { ...matrix };

  const result: Record<string, unknown[]> = {};
  const ratio = Math.pow(maxJobs / total, 1 / keys.length);
  for (const key of keys) {
    const vals = matrix[key];
    const targetLen = Math.max(2, Math.round(vals.length * ratio));
    if (vals.length <= targetLen) { result[key] = [...vals]; continue; }
    const sampled: unknown[] = [vals[0]];
    const step = (vals.length - 1) / (targetLen - 1);
    for (let i = 1; i < targetLen - 1; i++) sampled.push(vals[Math.round(i * step)]);
    sampled.push(vals[vals.length - 1]);
    result[key] = sampled;
  }
  return result;
}

// Solution 10
function reportMatrixResults(
  results: Array<{combination: Record<string, unknown>; status: 'success' | 'failure'}>
) {
  const passed = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failure').length;
  return { passed, failed, failedCombinations: results.filter(r => r.status === 'failure').map(r => r.combination) };
}

// Solution 11
function validateMatrixConfig(config: {
  matrix?: Record<string, unknown[]>;
  include?: Array<Record<string, unknown>>;
  exclude?: Array<Record<string, unknown>>;
  failFast?: boolean;
  maxParallel?: number;
}): { valid: boolean; errors: string[]; jobCount: number } {
  const errors: string[] = [];
  if (!config.matrix && !config.include) errors.push("matrix or include is required");
  if (config.maxParallel !== undefined && config.maxParallel <= 0) errors.push("maxParallel must be > 0");
  if (config.exclude && config.matrix) {
    const matrixKeys = new Set(Object.keys(config.matrix));
    for (const ex of config.exclude) {
      for (const k of Object.keys(ex)) {
        if (!matrixKeys.has(k)) errors.push(`Exclude key '${k}' not in matrix`);
      }
    }
  }
  const jobCount = config.matrix ? predictJobCount(config.matrix, config.include, config.exclude) : (config.include?.length || 0);
  return { valid: errors.length === 0, errors, jobCount };
}

// Solution 12
function serializeMatrix(
  matrix: Record<string, unknown[]>,
  include?: Array<Record<string, unknown>>,
  exclude?: Array<Record<string, unknown>>
): string {
  const obj: Record<string, unknown> = { ...matrix };
  if (include) obj.include = include;
  if (exclude) obj.exclude = exclude;
  return JSON.stringify(obj);
}

// ============================================================
// Test Runner
// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }

async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };

  console.log("\n05-matrix-strategy Solutions\n");

  await test("Ex1: Expand matrix", () => {
    const r = expandMatrix({ node: [18, 20], os: ["ubuntu", "macos"] });
    assert(r.length === 4, `expected 4, got ${r.length}`);
  });

  await test("Ex2: Include/exclude", () => {
    const base = expandMatrix({ node: [18, 20], os: ["ubuntu", "macos"] });
    const r = applyIncludeExclude(base, [{ node: 22, os: "ubuntu" }], [{ node: 18, os: "macos" }]);
    assert(r.length === 4, `expected 4, got ${r.length}`);
  });

  await test("Ex3: Job count", () => {
    assert(predictJobCount({ a: [1, 2], b: [3, 4] }) === 4, "4 jobs");
    assert(predictJobCount({ a: [1, 2] }, [{ a: 3 }]) === 3, "with include");
  });

  await test("Ex4: Fail-fast", async () => {
    const r = await simulateFailFast([
      { name: "fast-fail", durationMs: 5, willFail: true },
      { name: "slow", durationMs: 50, willFail: false },
    ], true);
    assert(r.find(j => j.name === "fast-fail")?.status === "failure", "failed");
    assert(r.find(j => j.name === "slow")?.status === "cancelled", "cancelled");
  });

  await test("Ex5: Max parallel", async () => {
    let concurrent = 0, maxConcurrent = 0;
    const results = await runWithMaxParallel(
      Array.from({ length: 6 }, (_, i) => async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise(r => setTimeout(r, 10));
        concurrent--;
        return i;
      }), 2
    );
    assert(results.length === 6, "all completed");
    assert(maxConcurrent <= 2, `max concurrent ${maxConcurrent}`);
  });

  await test("Ex6: Dynamic matrix", () => {
    const r = generateDynamicMatrix(
      ["api", "web", "shared"],
      ["packages/api/src/index.ts"],
      { api: "packages/api/", web: "packages/web/", shared: "packages/shared/" }
    );
    assert(r.package.length === 1 && r.package[0] === "api", "only api");
  });

  await test("Ex7: Cost calculator", () => {
    const r = calculateMatrixCost({ node: [18, 20], os: ["ubuntu"] }, 0.008, 10);
    assert(r.totalJobs === 2, "2 jobs");
    assert(r.totalCost === 0.16, `cost ${r.totalCost}`);
  });

  await test("Ex8: Job namer", () => {
    const names = nameMatrixJobs([{ node: 18, os: "ubuntu" }], "Test ({node}, {os})");
    assert(names[0] === "Test (18, ubuntu)", names[0]);
  });

  await test("Ex9: Optimizer", () => {
    const r = optimizeMatrix({ a: [1, 2, 3, 4, 5], b: [1, 2, 3, 4, 5] }, 6);
    const total = r.a.length * r.b.length;
    assert(total <= 6, `optimized to ${total}`);
  });

  await test("Ex10: Result reporter", () => {
    const r = reportMatrixResults([
      { combination: { node: 18 }, status: "success" },
      { combination: { node: 20 }, status: "failure" },
    ]);
    assert(r.passed === 1 && r.failed === 1, "counts");
  });

  await test("Ex11: Config validator", () => {
    const r = validateMatrixConfig({ matrix: { node: [18, 20] } });
    assert(r.valid && r.jobCount === 2, "valid");
    const r2 = validateMatrixConfig({});
    assert(!r2.valid, "invalid without matrix");
  });

  await test("Ex12: Serializer", () => {
    const s = serializeMatrix({ node: [18, 20] });
    const parsed = JSON.parse(s);
    assert(parsed.node.length === 2, "roundtrip");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
