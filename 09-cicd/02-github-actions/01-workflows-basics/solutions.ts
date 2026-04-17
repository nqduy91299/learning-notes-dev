// ============================================================
// GitHub Actions: Workflow Basics — Solutions
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/01-workflows-basics/solutions.ts
// ============================================================

// Solution 1: Types
type StepConfig = { name?: string; run?: string; uses?: string; with?: Record<string, string> };
type JobConfig = { runsOn: string; steps: StepConfig[]; needs?: string[] };
type WorkflowTrigger = { events: string[]; branches?: string[]; paths?: string[]; pathsIgnore?: string[] };
type WorkflowConfig = { name: string; on: WorkflowTrigger; jobs: Record<string, JobConfig> };

// Solution 2: Workflow Validator
function validateWorkflow(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config || typeof config !== 'object') return { valid: false, errors: ["Config must be an object"] };
  const c = config as Record<string, unknown>;
  if (typeof c.name !== 'string') errors.push("name must be a string");
  if (!c.on || typeof c.on !== 'object') errors.push("on must be an object");
  else {
    const on = c.on as Record<string, unknown>;
    if (!Array.isArray(on.events) || on.events.length === 0) errors.push("on.events must be a non-empty array");
  }
  if (!c.jobs || typeof c.jobs !== 'object' || Object.keys(c.jobs as object).length === 0) {
    errors.push("jobs must be a non-empty object");
  } else {
    for (const [jName, job] of Object.entries(c.jobs as Record<string, unknown>)) {
      const j = job as Record<string, unknown>;
      if (typeof j.runsOn !== 'string') errors.push(`jobs.${jName}.runsOn must be a string`);
      if (!Array.isArray(j.steps) || j.steps.length === 0) errors.push(`jobs.${jName}.steps must be a non-empty array`);
      else {
        for (let i = 0; i < (j.steps as unknown[]).length; i++) {
          const s = (j.steps as Record<string, unknown>[])[i];
          const hasRun = typeof s.run === 'string';
          const hasUses = typeof s.uses === 'string';
          if (!hasRun && !hasUses) errors.push(`jobs.${jName}.steps[${i}] must have run or uses`);
          if (hasRun && hasUses) errors.push(`jobs.${jName}.steps[${i}] cannot have both run and uses`);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

// Solution 3: Trigger Evaluator
function matchSimpleGlob(pattern: string, value: string): boolean {
  if (pattern === value) return true;
  if (pattern.includes('**')) {
    const prefix = pattern.replace('/**', '');
    return value.startsWith(prefix);
  }
  if (pattern.includes('*')) {
    const parts = pattern.split('*');
    const middle = value.slice(parts[0].length, parts[1].length > 0 ? value.length - parts[1].length : undefined);
    return value.startsWith(parts[0]) && value.endsWith(parts[1]) && !middle.includes('/');
  }
  return false;
}

function evaluateTrigger(trigger: WorkflowTrigger, event: { type: string; branch: string; changedFiles: string[] }): boolean {
  if (!trigger.events.includes(event.type)) return false;
  if (trigger.branches && !trigger.branches.some(b => matchSimpleGlob(b, event.branch))) return false;
  if (trigger.pathsIgnore) {
    const allIgnored = event.changedFiles.every(f => trigger.pathsIgnore!.some(p => f.startsWith(p)));
    if (allIgnored) return false;
  }
  if (trigger.paths) {
    if (!event.changedFiles.some(f => trigger.paths!.some(p => f.startsWith(p)))) return false;
  }
  return true;
}

// Solution 4: Cron Parser
function parseCron(expression: string) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error(`Invalid cron: expected 5 parts, got ${parts.length}`);
  return { minute: parts[0], hour: parts[1], dayOfMonth: parts[2], month: parts[3], dayOfWeek: parts[4] };
}

// Solution 5: Cron Schedule Matcher
function matchCronField(field: string, value: number): boolean {
  if (field === '*') return true;
  if (field.startsWith('*/')) {
    const interval = parseInt(field.slice(2), 10);
    return value % interval === 0;
  }
  return parseInt(field, 10) === value;
}

function matchesCron(expression: string, date: Date): boolean {
  const cron = parseCron(expression);
  return matchCronField(cron.minute, date.getUTCMinutes()) &&
    matchCronField(cron.hour, date.getUTCHours()) &&
    matchCronField(cron.dayOfMonth, date.getUTCDate()) &&
    matchCronField(cron.month, date.getUTCMonth() + 1) &&
    matchCronField(cron.dayOfWeek, date.getUTCDay());
}

// Solution 6: Concurrency Group Resolver
function resolveConcurrencyGroup(template: string, context: { workflow: string; ref: string; sha: string }): string {
  return template
    .replace(/\$\{\{\s*github\.workflow\s*\}\}/g, context.workflow)
    .replace(/\$\{\{\s*github\.ref\s*\}\}/g, context.ref)
    .replace(/\$\{\{\s*github\.sha\s*\}\}/g, context.sha);
}

// Solution 7: Branch Glob Matcher
function matchBranch(pattern: string, branch: string): boolean {
  if (pattern.startsWith('!')) return pattern.slice(1) !== branch;
  return matchSimpleGlob(pattern, branch);
}

// Solution 8: Path Filter Evaluator
function evaluatePathFilter(config: { paths?: string[]; pathsIgnore?: string[] }, changedFiles: string[]): boolean {
  if (config.pathsIgnore) {
    const hasNonIgnored = changedFiles.some(f => !config.pathsIgnore!.some(p => f.startsWith(p)));
    if (!hasNonIgnored) return false;
  }
  if (config.paths) {
    return changedFiles.some(f => config.paths!.some(p => f.startsWith(p)));
  }
  return true;
}

// Solution 9: Workflow Run Deduplicator
function deduplicateRuns(
  runs: Array<{ id: number; group: string; createdAt: Date; status: 'queued' | 'running' | 'completed' }>,
  cancelInProgress: boolean
): Array<{ id: number; action: 'keep' | 'cancel' }> {
  const groups = new Map<string, typeof runs>();
  for (const run of runs) {
    if (!groups.has(run.group)) groups.set(run.group, []);
    groups.get(run.group)!.push(run);
  }
  const result: Array<{ id: number; action: 'keep' | 'cancel' }> = [];
  for (const groupRuns of groups.values()) {
    groupRuns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    for (let i = 0; i < groupRuns.length; i++) {
      const run = groupRuns[i];
      if (run.status === 'completed') { result.push({ id: run.id, action: 'keep' }); continue; }
      if (i === 0) { result.push({ id: run.id, action: 'keep' }); }
      else {
        result.push({ id: run.id, action: (cancelInProgress || run.status === 'queued') ? 'cancel' : 'keep' });
      }
    }
  }
  return result.sort((a, b) => a.id - b.id);
}

// Solution 10: Workflow Input Validator
function validateInputs(
  schema: Record<string, { type: 'string' | 'boolean' | 'choice'; required?: boolean; options?: string[]; default?: string }>,
  inputs: Record<string, string>
): { valid: boolean; errors: string[]; resolved: Record<string, string> } {
  const errors: string[] = [];
  const resolved: Record<string, string> = {};
  for (const [key, def] of Object.entries(schema)) {
    let value = inputs[key];
    if (value === undefined) {
      if (def.required) { errors.push(`Input '${key}' is required`); continue; }
      value = def.default || '';
    }
    if (def.type === 'boolean' && value !== 'true' && value !== 'false') {
      errors.push(`Input '${key}' must be 'true' or 'false'`);
    }
    if (def.type === 'choice' && def.options && !def.options.includes(value)) {
      errors.push(`Input '${key}' must be one of: ${def.options.join(', ')}`);
    }
    resolved[key] = value;
  }
  return { valid: errors.length === 0, errors, resolved };
}

// Solution 11: Event Payload Simulator
function createEventPayload(
  type: 'push' | 'pull_request' | 'schedule' | 'workflow_dispatch',
  overrides?: Record<string, unknown>
): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    push: { ref: 'refs/heads/main', sha: 'abc123', commits: [] },
    pull_request: { number: 1, action: 'opened', head: { ref: 'feature', sha: 'def456' }, base: { ref: 'main' } },
    schedule: { schedule: '0 0 * * *' },
    workflow_dispatch: { inputs: {} },
  };
  return { ...defaults[type], ...overrides };
}

// Solution 12: Runner Selector
function selectRunner(
  runsOn: string | string[],
  availableRunners: Array<{ name: string; labels: string[]; status: 'online' | 'offline' }>
): string | null {
  const requiredLabels = Array.isArray(runsOn) ? runsOn : [runsOn];
  const runner = availableRunners.find(r =>
    r.status === 'online' && requiredLabels.every(l => r.labels.includes(l))
  );
  return runner?.name || null;
}

// ============================================================
// Test Runner
// ============================================================
function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };

  console.log("\n01-workflows-basics Solutions\n");

  await test("Ex1: Types compile", () => {
    const _wf: WorkflowConfig = {
      name: "CI", on: { events: ["push"] },
      jobs: { test: { runsOn: "ubuntu-latest", steps: [{ run: "echo hi" }] } }
    };
    assert(_wf.name === "CI", "ok");
  });

  await test("Ex2: Validator", () => {
    const r = validateWorkflow({ name: "CI", on: { events: ["push"] }, jobs: { t: { runsOn: "ubuntu-latest", steps: [{ run: "echo" }] } } });
    assert(r.valid, "valid");
    const r2 = validateWorkflow({ name: "CI", on: { events: [] }, jobs: {} });
    assert(!r2.valid, "invalid");
  });

  await test("Ex3: Trigger evaluator", () => {
    const t: WorkflowTrigger = { events: ["push"], branches: ["main"], paths: ["src/"] };
    assert(evaluateTrigger(t, { type: "push", branch: "main", changedFiles: ["src/x.ts"] }), "match");
    assert(!evaluateTrigger(t, { type: "push", branch: "dev", changedFiles: ["src/x.ts"] }), "branch mismatch");
  });

  await test("Ex4: Cron parser", () => {
    const c = parseCron("30 5 * * 1");
    assert(c.minute === "30" && c.hour === "5" && c.dayOfWeek === "1", "parsed");
    let threw = false;
    try { parseCron("bad"); } catch { threw = true; }
    assert(threw, "throws on invalid");
  });

  await test("Ex5: Cron matcher", () => {
    assert(matchesCron("0 0 * * *", new Date("2024-01-15T00:00:00Z")), "midnight match");
    assert(!matchesCron("0 0 * * *", new Date("2024-01-15T12:00:00Z")), "noon no match");
  });

  await test("Ex6: Concurrency group", () => {
    const r = resolveConcurrencyGroup("${{ github.workflow }}-${{ github.ref }}", { workflow: "CI", ref: "refs/heads/main", sha: "abc" });
    assert(r === "CI-refs/heads/main", r);
  });

  await test("Ex7: Branch glob", () => {
    assert(matchBranch("main", "main"), "exact");
    assert(matchBranch("feature/*", "feature/foo"), "glob");
    assert(!matchBranch("feature/*", "feature/foo/bar"), "no deep glob");
    assert(matchBranch("release/**", "release/1.0/hotfix"), "double star");
    assert(!matchBranch("!hotfix", "hotfix"), "negation");
    assert(matchBranch("!hotfix", "main"), "negation pass");
  });

  await test("Ex8: Path filter", () => {
    assert(evaluatePathFilter({ paths: ["src/"] }, ["src/x.ts"]), "match");
    assert(!evaluatePathFilter({ paths: ["src/"] }, ["docs/x.md"]), "no match");
    assert(!evaluatePathFilter({ pathsIgnore: ["docs/"] }, ["docs/x.md"]), "all ignored");
    assert(evaluatePathFilter({ pathsIgnore: ["docs/"] }, ["docs/x.md", "src/y.ts"]), "not all ignored");
  });

  await test("Ex9: Deduplicator", () => {
    const result = deduplicateRuns([
      { id: 1, group: "ci", createdAt: new Date("2024-01-01"), status: "running" },
      { id: 2, group: "ci", createdAt: new Date("2024-01-02"), status: "queued" },
    ], true);
    const r1 = result.find(r => r.id === 1)!;
    const r2 = result.find(r => r.id === 2)!;
    assert(r1.action === "cancel", "old cancelled");
    assert(r2.action === "keep", "new kept");
  });

  await test("Ex10: Input validator", () => {
    const r = validateInputs(
      { env: { type: "choice", required: true, options: ["staging", "prod"] } },
      { env: "staging" }
    );
    assert(r.valid, "valid");
    const r2 = validateInputs(
      { env: { type: "choice", required: true, options: ["staging", "prod"] } },
      {}
    );
    assert(!r2.valid, "missing required");
  });

  await test("Ex11: Event payload", () => {
    const p = createEventPayload("push");
    assert(typeof p.ref === "string", "has ref");
    const pr = createEventPayload("pull_request", { number: 42 });
    assert(pr.number === 42, "override applied");
  });

  await test("Ex12: Runner selector", () => {
    const runners = [
      { name: "r1", labels: ["self-hosted", "linux"], status: "online" as const },
      { name: "r2", labels: ["self-hosted", "macos"], status: "offline" as const },
    ];
    assert(selectRunner(["self-hosted", "linux"], runners) === "r1", "found");
    assert(selectRunner("macos", runners) === null, "offline");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
