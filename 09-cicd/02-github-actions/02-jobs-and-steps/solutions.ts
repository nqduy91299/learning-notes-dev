// ============================================================
// Jobs and Steps — Solutions
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/02-jobs-and-steps/solutions.ts
// ============================================================

// Solution 1
type Job = { name: string; needs: string[]; steps: string[]; runsOn: string };

// Solution 2
function resolveJobOrder(jobs: Job[]): string[][] {
  const plan: string[][] = [];
  const scheduled = new Set<string>();
  const remaining = [...jobs];
  const names = new Set(jobs.map(j => j.name));

  while (remaining.length > 0) {
    const group = remaining.filter(j => j.needs.every(d => scheduled.has(d) || !names.has(d)));
    if (group.length === 0) throw new Error("Circular dependency");
    const groupNames = group.map(j => j.name);
    plan.push(groupNames);
    for (const n of groupNames) {
      scheduled.add(n);
      remaining.splice(remaining.findIndex(j => j.name === n), 1);
    }
  }
  return plan;
}

// Solution 3
class JobExecutor {
  constructor(private jobs: Job[]) {}

  async execute(): Promise<Record<string, 'success' | 'failure' | 'skipped' | 'cancelled'>> {
    const results: Record<string, 'success' | 'failure' | 'skipped' | 'cancelled'> = {};
    const plan = resolveJobOrder(this.jobs);

    for (const group of plan) {
      await Promise.all(group.map(async (name) => {
        const job = this.jobs.find(j => j.name === name)!;
        if (job.needs.some(d => results[d] === 'failure' || results[d] === 'cancelled')) {
          results[name] = 'skipped';
          return;
        }
        await new Promise(r => setTimeout(r, 5 * job.steps.length));
        results[name] = name.includes('fail') ? 'failure' : 'success';
      }));
    }
    return results;
  }
}

// Solution 4
class StepOutputManager {
  private outputs = new Map<string, Map<string, string>>();
  private envVars = new Map<string, string>();

  setOutput(stepId: string, key: string, value: string): void {
    if (!this.outputs.has(stepId)) this.outputs.set(stepId, new Map());
    this.outputs.get(stepId)!.set(key, value);
  }

  getOutput(stepId: string, key: string): string | undefined {
    return this.outputs.get(stepId)?.get(key);
  }

  setEnv(key: string, value: string): void { this.envVars.set(key, value); }
  getEnv(key: string): string | undefined { return this.envVars.get(key); }

  resolveExpression(expr: string): string {
    return expr.replace(/\$\{\{\s*steps\.(\w+)\.outputs\.(\w+)\s*\}\}/g, (_m, stepId, key) => {
      return this.getOutput(stepId, key) || '';
    }).replace(/\$\{\{\s*env\.(\w+)\s*\}\}/g, (_m, key) => {
      return this.getEnv(key) || '';
    });
  }
}

// Solution 5
class ArtifactTransfer {
  private artifacts = new Map<string, { uploadedBy: string; files: string[] }>();

  upload(jobName: string, artifactName: string, files: string[]): void {
    this.artifacts.set(artifactName, { uploadedBy: jobName, files: [...files] });
  }

  download(artifactName: string): string[] | undefined {
    return this.artifacts.get(artifactName)?.files;
  }

  listArtifacts() {
    return [...this.artifacts.entries()].map(([name, a]) => ({ name, uploadedBy: a.uploadedBy, files: a.files }));
  }

  cleanup(artifactName: string): boolean { return this.artifacts.delete(artifactName); }
}

// Solution 6
class ServiceManager {
  private services = new Map<string, { image: string; ports: Array<{host: number; container: number}>; env: Record<string, string> }>();

  addService(name: string, image: string, ports: Array<{host: number; container: number}>, env?: Record<string, string>): void {
    this.services.set(name, { image, ports, env: env || {} });
  }

  getConnectionString(name: string): string {
    const s = this.services.get(name);
    if (!s) throw new Error(`Service ${name} not found`);
    const proto = s.image.split(':')[0];
    return `${proto}://localhost:${s.ports[0]?.host || 0}`;
  }

  healthCheck(name: string): boolean { return this.services.has(name); }

  listServices() {
    return [...this.services.entries()].map(([name, s]) => ({
      name, image: s.image, status: 'running' as const
    }));
  }
}

// Solution 7
function evaluateCondition(
  expression: string,
  context: { github: Record<string, string>; needs: Record<string, { result: string }> }
): boolean {
  const trimmed = expression.trim();
  if (trimmed === 'success()') {
    return Object.values(context.needs).every(n => n.result === 'success');
  }
  if (trimmed === 'failure()') {
    return Object.values(context.needs).some(n => n.result === 'failure');
  }

  // Handle && and ||
  if (trimmed.includes('&&')) {
    return trimmed.split('&&').every(part => evaluateCondition(part, context));
  }
  if (trimmed.includes('||')) {
    return trimmed.split('||').some(part => evaluateCondition(part, context));
  }

  // Handle comparisons: X == 'Y'
  const match = trimmed.match(/^([\w.]+)\s*==\s*'([^']*)'$/);
  if (match) {
    const [, path, expected] = match;
    const parts = path.split('.');
    if (parts[0] === 'github') return context.github[parts.slice(1).join('.')] === expected;
    if (parts[0] === 'needs') return context.needs[parts[1]]?.result === expected;
  }
  return false;
}

// Solution 8
function estimateWorkflowDuration(jobs: Array<{name: string; needs: string[]; estimatedMinutes: number}>): number {
  const endTimes = new Map<string, number>();
  const getEnd = (name: string): number => {
    if (endTimes.has(name)) return endTimes.get(name)!;
    const job = jobs.find(j => j.name === name)!;
    const start = job.needs.length > 0 ? Math.max(...job.needs.map(n => getEnd(n))) : 0;
    const end = start + job.estimatedMinutes;
    endTimes.set(name, end);
    return end;
  };
  return Math.max(...jobs.map(j => getEnd(j.name)), 0);
}

// Solution 9
function generateMatrixJobs(
  matrix: Record<string, unknown[]>,
  include?: Array<Record<string, unknown>>,
  exclude?: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  const keys = Object.keys(matrix);
  let combos: Array<Record<string, unknown>> = [{}];
  for (const key of keys) {
    const newCombos: Array<Record<string, unknown>> = [];
    for (const combo of combos) {
      for (const val of matrix[key]) {
        newCombos.push({ ...combo, [key]: val });
      }
    }
    combos = newCombos;
  }
  if (exclude) {
    combos = combos.filter(c => !exclude.some(ex =>
      Object.entries(ex).every(([k, v]) => c[k] === v)
    ));
  }
  if (include) combos.push(...include);
  return combos;
}

// Solution 10
function chainJobOutputs(
  jobs: Array<{ name: string; needs: string[]; outputs: Record<string, string> }>,
  targetJob: string,
  outputKey: string
): string | undefined {
  const job = jobs.find(j => j.name === targetJob);
  if (!job) return undefined;
  if (job.outputs[outputKey] !== undefined) return job.outputs[outputKey];
  for (const dep of job.needs) {
    const val = chainJobOutputs(jobs, dep, outputKey);
    if (val !== undefined) return val;
  }
  return undefined;
}

// Solution 11
function visualizeWorkflow(jobs: Array<{name: string; needs: string[]}>): string {
  const plan = resolveJobOrder(jobs.map(j => ({ ...j, steps: [], runsOn: '' })));
  return plan.map((group, i) => `Group ${i + 1}: [${group.join(', ')}]`).join(' → ');
}

// Solution 12
async function retryStep(
  name: string,
  fn: () => Promise<void>,
  options: { maxRetries: number; continueOnError: boolean }
): Promise<{ name: string; status: 'success' | 'failure'; attempts: number }> {
  for (let attempt = 1; attempt <= options.maxRetries + 1; attempt++) {
    try {
      await fn();
      return { name, status: 'success', attempts: attempt };
    } catch {
      if (attempt > options.maxRetries) {
        return { name, status: options.continueOnError ? 'success' : 'failure', attempts: attempt };
      }
    }
  }
  return { name, status: 'failure', attempts: options.maxRetries + 1 };
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

  console.log("\n02-jobs-and-steps Solutions\n");

  await test("Ex2: Topological sort", () => {
    const plan = resolveJobOrder([
      { name: "lint", needs: [], steps: ["lint"], runsOn: "ubuntu" },
      { name: "test", needs: [], steps: ["test"], runsOn: "ubuntu" },
      { name: "build", needs: ["lint", "test"], steps: ["build"], runsOn: "ubuntu" },
      { name: "deploy", needs: ["build"], steps: ["deploy"], runsOn: "ubuntu" },
    ]);
    assert(plan[0].includes("lint") && plan[0].includes("test"), "parallel first");
    assert(plan[1][0] === "build", "build second");
    assert(plan[2][0] === "deploy", "deploy third");
  });

  await test("Ex3: Job executor", async () => {
    const ex = new JobExecutor([
      { name: "test-fail", needs: [], steps: ["s1"], runsOn: "ubuntu" },
      { name: "build", needs: ["test-fail"], steps: ["s1"], runsOn: "ubuntu" },
    ]);
    const r = await ex.execute();
    assert(r["test-fail"] === "failure", "fail");
    assert(r["build"] === "skipped", "skipped");
  });

  await test("Ex4: Step outputs", () => {
    const m = new StepOutputManager();
    m.setOutput("ver", "version", "1.2.3");
    m.setEnv("NODE_ENV", "prod");
    assert(m.resolveExpression("v${{ steps.ver.outputs.version }}") === "v1.2.3", "step output");
    assert(m.resolveExpression("${{ env.NODE_ENV }}") === "prod", "env");
  });

  await test("Ex5: Artifact transfer", () => {
    const a = new ArtifactTransfer();
    a.upload("build", "dist", ["index.js", "style.css"]);
    assert(a.download("dist")?.length === 2, "download");
    assert(a.listArtifacts().length === 1, "list");
  });

  await test("Ex6: Service manager", () => {
    const s = new ServiceManager();
    s.addService("pg", "postgres:15", [{ host: 5432, container: 5432 }]);
    assert(s.getConnectionString("pg") === "postgres://localhost:5432", "connection");
    assert(s.healthCheck("pg"), "healthy");
  });

  await test("Ex7: Conditional evaluator", () => {
    const ctx = { github: { ref: "refs/heads/main" }, needs: { build: { result: "success" } } };
    assert(evaluateCondition("github.ref == 'refs/heads/main'", ctx), "match");
    assert(evaluateCondition("success()", ctx), "success");
    assert(!evaluateCondition("failure()", ctx), "not failure");
  });

  await test("Ex8: Duration estimator", () => {
    const dur = estimateWorkflowDuration([
      { name: "lint", needs: [], estimatedMinutes: 2 },
      { name: "test", needs: [], estimatedMinutes: 5 },
      { name: "build", needs: ["lint", "test"], estimatedMinutes: 3 },
    ]);
    assert(dur === 8, `expected 8, got ${dur}`);
  });

  await test("Ex9: Matrix generator", () => {
    const jobs = generateMatrixJobs(
      { node: [18, 20], os: ["ubuntu", "macos"] },
      undefined,
      [{ node: 18, os: "macos" }]
    );
    assert(jobs.length === 3, `expected 3, got ${jobs.length}`);
  });

  await test("Ex10: Output chain", () => {
    const val = chainJobOutputs(
      [
        { name: "ver", needs: [], outputs: { version: "2.0.0" } },
        { name: "build", needs: ["ver"], outputs: {} },
      ],
      "build", "version"
    );
    assert(val === "2.0.0", "found via chain");
  });

  await test("Ex11: Visualizer", () => {
    const viz = visualizeWorkflow([
      { name: "lint", needs: [] },
      { name: "test", needs: [] },
      { name: "build", needs: ["lint", "test"] },
    ]);
    assert(viz.includes("Group 1") && viz.includes("Group 2"), "has groups");
  });

  await test("Ex12: Retry step", async () => {
    let count = 0;
    const r = await retryStep("flaky", async () => { count++; if (count < 3) throw new Error("fail"); }, { maxRetries: 3, continueOnError: false });
    assert(r.status === "success" && r.attempts === 3, "retried ok");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
