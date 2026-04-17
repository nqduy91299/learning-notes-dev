// ============================================================
// Reusable Workflows — Solutions
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/04-reusable-workflows/solutions.ts
// ============================================================

// Solution 1
type WorkflowInput = { name: string; type: 'string' | 'number' | 'boolean'; required: boolean; default?: string };
type WorkflowSecret = { name: string; required: boolean };
type WorkflowOutput = { name: string; value: string };
type ReusableWorkflow = { name: string; inputs: WorkflowInput[]; secrets: WorkflowSecret[]; outputs: WorkflowOutput[]; jobs: string[] };

// Solution 2
class WorkflowComposer {
  private jobs: Array<{name: string; type: 'reusable' | 'direct'; ref?: string; inputs?: Record<string,string>; secrets?: 'inherit' | Record<string,string>; steps?: string[]; needs: string[]}> = [];

  addReusableWorkflow(name: string, ref: string, inputs?: Record<string,string>, secrets?: 'inherit' | Record<string,string>): void {
    this.jobs.push({ name, type: 'reusable', ref, inputs, secrets, needs: [] });
  }

  addDirectJob(name: string, steps: string[], needs?: string[]): void {
    this.jobs.push({ name, type: 'direct', steps, needs: needs || [] });
  }

  compose() {
    const names = new Set(this.jobs.map(j => j.name));
    for (const j of this.jobs) {
      for (const n of j.needs) {
        if (!names.has(n)) throw new Error(`Unknown dependency: ${n}`);
      }
    }
    return { jobs: this.jobs.map(j => ({ name: j.name, type: j.type, needs: j.needs })) };
  }
}

// Solution 3
function validateWorkflowInputs(
  schema: WorkflowInput[],
  provided: Record<string, string>
): { valid: boolean; errors: string[]; resolved: Record<string, string | number | boolean> } {
  const errors: string[] = [];
  const resolved: Record<string, string | number | boolean> = {};
  for (const input of schema) {
    let raw = provided[input.name];
    if (raw === undefined) {
      if (input.required) { errors.push(`Input '${input.name}' is required`); continue; }
      raw = input.default || '';
    }
    if (input.type === 'boolean') resolved[input.name] = raw === 'true';
    else if (input.type === 'number') {
      const n = Number(raw);
      if (isNaN(n)) errors.push(`Input '${input.name}' must be a number`);
      else resolved[input.name] = n;
    }
    else resolved[input.name] = raw;
  }
  return { valid: errors.length === 0, errors, resolved };
}

// Solution 4
class CompositeActionBuilder {
  private _inputs: Array<{name: string; required?: boolean; default?: string}> = [];
  private _outputs: Array<{name: string; value: string}> = [];
  private _steps: Array<{name: string; run?: string; uses?: string}> = [];

  input(name: string, opts: {required?: boolean; default?: string}): this {
    this._inputs.push({ name, ...opts });
    return this;
  }
  output(name: string, valueExpr: string): this {
    this._outputs.push({ name, value: valueExpr });
    return this;
  }
  step(config: {name: string; run?: string; uses?: string}): this {
    this._steps.push(config);
    return this;
  }
  build() {
    return {
      inputs: Object.fromEntries(this._inputs.map(i => [i.name, { required: i.required ?? false, default: i.default }])),
      outputs: Object.fromEntries(this._outputs.map(o => [o.name, { value: o.value }])),
      runs: { using: 'composite', steps: this._steps.map(s => ({ name: s.name, ...(s.run ? { run: s.run, shell: 'bash' } : { uses: s.uses }) })) },
    };
  }
}

// Solution 5
function resolveActionVersion(
  ref: string,
  versions: Array<{tag: string; sha: string; date: Date}>
): { tag: string; sha: string } | null {
  // Exact SHA
  if (/^[0-9a-f]{40}$/.test(ref)) {
    const v = versions.find(v => v.sha === ref);
    return v ? { tag: v.tag, sha: v.sha } : null;
  }
  // Exact tag
  const exact = versions.find(v => v.tag === ref);
  if (exact) return { tag: exact.tag, sha: exact.sha };
  // Major version: "v4" matches latest "v4.*"
  if (/^v\d+$/.test(ref)) {
    const matching = versions.filter(v => v.tag.startsWith(ref + '.') || v.tag === ref)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return matching.length > 0 ? { tag: matching[0].tag, sha: matching[0].sha } : null;
  }
  return null;
}

// Solution 6
function resolveSecrets(
  mode: 'inherit' | Record<string, string>,
  callerSecrets: Record<string, string>,
  requiredSecrets: string[]
): { resolved: Record<string, string>; missing: string[] } {
  const resolved = mode === 'inherit' ? { ...callerSecrets } : { ...mode };
  const missing = requiredSecrets.filter(s => !(s in resolved));
  return { resolved, missing };
}

// Solution 7
function validateCallChain(
  workflows: Record<string, { calls: string[] }>,
  maxDepth: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const visited = new Set<string>();

  const check = (name: string, depth: number, path: Set<string>) => {
    if (path.has(name)) { errors.push(`Circular call: ${name}`); return; }
    if (depth > maxDepth) { errors.push(`Max depth ${maxDepth} exceeded at ${name}`); return; }
    if (visited.has(name)) return;
    path.add(name);
    const wf = workflows[name];
    if (wf) for (const call of wf.calls) check(call, depth + 1, new Set(path));
    visited.add(name);
  };

  for (const name of Object.keys(workflows)) check(name, 0, new Set());
  return { valid: errors.length === 0, errors };
}

// Solution 8
class ActionMarketplace {
  private actions: Array<{name: string; author: string; description: string; stars: number; verified: boolean}> = [];

  publish(action: {name: string; author: string; description: string; stars: number; verified: boolean}): void {
    this.actions.push(action);
  }

  search(query: string) {
    const q = query.toLowerCase();
    return this.actions
      .filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
      .sort((a, b) => b.stars - a.stars)
      .map(a => ({ name: a.name, author: a.author, stars: a.stars }));
  }

  getVerified() {
    return this.actions.filter(a => a.verified)
      .sort((a, b) => b.stars - a.stars)
      .map(a => ({ name: a.name, author: a.author, stars: a.stars }));
  }
}

// Solution 9
function mergeWorkflowOutputs(
  workflows: Array<{ name: string; outputs: Record<string, string> }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const wf of workflows) {
    for (const [key, val] of Object.entries(wf.outputs)) {
      result[`${wf.name}.${key}`] = val;
    }
  }
  return result;
}

// Solution 10
function buildActionDependencyGraph(
  steps: Array<{name: string; uses?: string; needs?: string[]}>
): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  for (const step of steps) {
    const deps: string[] = [...(step.needs || [])];
    if (step.uses) deps.push(step.uses);
    graph[step.name] = deps;
  }
  return graph;
}

// Solution 11
function renderWorkflowTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key) => {
    if (!(key in variables)) throw new Error(`Variable '${key}' not provided`);
    return variables[key];
  });
}

// Solution 12
function countTotalSteps(
  actions: Record<string, { steps: number; uses: string[] }>,
  entryAction: string
): number {
  const visited = new Set<string>();
  const count = (name: string): number => {
    if (visited.has(name)) return 0;
    visited.add(name);
    const action = actions[name];
    if (!action) return 0;
    let total = action.steps;
    for (const dep of action.uses) total += count(dep);
    return total;
  };
  return count(entryAction);
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

  console.log("\n04-reusable-workflows Solutions\n");

  await test("Ex1: Types", () => {
    const _wf: ReusableWorkflow = { name: "ci", inputs: [], secrets: [], outputs: [], jobs: ["build"] };
    assert(_wf.name === "ci", "ok");
  });

  await test("Ex2: Composer", () => {
    const c = new WorkflowComposer();
    c.addReusableWorkflow("ci", "./ci.yml");
    c.addDirectJob("deploy", ["deploy"], ["ci"]);
    const result = c.compose();
    assert(result.jobs.length === 2, "2 jobs");
  });

  await test("Ex3: Input validator", () => {
    const r = validateWorkflowInputs(
      [{ name: "debug", type: "boolean", required: false, default: "false" }, { name: "count", type: "number", required: true }],
      { count: "5" }
    );
    assert(r.valid, "valid");
    assert(r.resolved.debug === false, "default bool");
    assert(r.resolved.count === 5, "number coercion");
  });

  await test("Ex4: Composite builder", () => {
    const action = new CompositeActionBuilder()
      .input("node-version", { default: "20" })
      .step({ name: "Install", run: "npm ci" })
      .output("path", "dist")
      .build();
    assert(action.runs.using === "composite", "composite");
    assert(action.runs.steps.length === 1, "1 step");
  });

  await test("Ex5: Version resolver", () => {
    const versions = [
      { tag: "v4.0.0", sha: "aaa", date: new Date("2024-01-01") },
      { tag: "v4.1.0", sha: "bbb", date: new Date("2024-06-01") },
      { tag: "v3.0.0", sha: "ccc", date: new Date("2023-01-01") },
    ];
    assert(resolveActionVersion("v4", versions)?.sha === "bbb", "major version");
    assert(resolveActionVersion("v4.0.0", versions)?.sha === "aaa", "exact");
    assert(resolveActionVersion("aaa", [...versions].map(v => ({ ...v, sha: v.sha.padEnd(40, '0') }))) === null, "short sha");
  });

  await test("Ex6: Secret resolver", () => {
    const r = resolveSecrets("inherit", { A: "1", B: "2" }, ["A", "C"]);
    assert(r.resolved.A === "1", "inherited");
    assert(r.missing.includes("C"), "missing");
  });

  await test("Ex7: Call chain validator", () => {
    const r = validateCallChain({ a: { calls: ["b"] }, b: { calls: ["a"] } }, 4);
    assert(!r.valid, "circular");
  });

  await test("Ex8: Marketplace", () => {
    const m = new ActionMarketplace();
    m.publish({ name: "checkout", author: "github", description: "Checkout repo", stars: 1000, verified: true });
    m.publish({ name: "setup-node", author: "github", description: "Setup Node", stars: 500, verified: true });
    assert(m.search("node").length === 1, "search");
    assert(m.getVerified().length === 2, "verified");
  });

  await test("Ex9: Output merger", () => {
    const r = mergeWorkflowOutputs([
      { name: "ci", outputs: { status: "success" } },
      { name: "build", outputs: { path: "dist" } },
    ]);
    assert(r["ci.status"] === "success", "prefixed");
  });

  await test("Ex10: Dependency graph", () => {
    const g = buildActionDependencyGraph([
      { name: "setup", uses: "actions/setup-node" },
      { name: "build", needs: ["setup"] },
    ]);
    assert(g.setup.includes("actions/setup-node"), "uses dep");
    assert(g.build.includes("setup"), "needs dep");
  });

  await test("Ex11: Template engine", () => {
    assert(renderWorkflowTemplate("Deploy to {{env}}", { env: "prod" }) === "Deploy to prod", "rendered");
    let threw = false;
    try { renderWorkflowTemplate("{{missing}}", {}); } catch { threw = true; }
    assert(threw, "throws on missing");
  });

  await test("Ex12: Step counter", () => {
    const count = countTotalSteps({
      main: { steps: 3, uses: ["helper"] },
      helper: { steps: 2, uses: [] },
    }, "main");
    assert(count === 5, `expected 5, got ${count}`);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
