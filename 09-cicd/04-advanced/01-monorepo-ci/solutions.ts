// ============================================================
// Monorepo CI — Solutions
// ============================================================
// Run: npx tsx 09-cicd/04-advanced/01-monorepo-ci/solutions.ts
// ============================================================

// Solution 1
class DependencyGraph {
  private deps = new Map<string, string[]>();
  addPackage(name: string, dependencies: string[]) { this.deps.set(name, dependencies); }
  getDependencies(name: string) { return this.deps.get(name) || []; }
  getDependents(name: string) { return [...this.deps.entries()].filter(([,d]) => d.includes(name)).map(([n]) => n); }
  getTransitiveDependents(name: string): string[] {
    const result = new Set<string>();
    const visit = (n: string) => { for (const dep of this.getDependents(n)) { if (!result.has(dep)) { result.add(dep); visit(dep); } } };
    visit(name);
    return [...result];
  }
}

// Solution 2
function getAffectedPackages(graph: Record<string, string[]>, changedFiles: string[], packagePaths: Record<string, string>): string[] {
  const directlyChanged = new Set<string>();
  for (const [pkg, path] of Object.entries(packagePaths)) {
    if (changedFiles.some(f => f.startsWith(path))) directlyChanged.add(pkg);
  }
  const affected = new Set(directlyChanged);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [pkg, deps] of Object.entries(graph)) {
      if (!affected.has(pkg) && deps.some(d => affected.has(d))) { affected.add(pkg); changed = true; }
    }
  }
  return [...affected];
}

// Solution 3
function calculateTaskHash(packageName: string, sourceHash: string, depHashes: Record<string, string>, envVars: Record<string, string>, taskConfig: string): string {
  const input = [packageName, sourceHash, ...Object.values(depHashes).sort(), ...Object.entries(envVars).map(([k,v]) => `${k}=${v}`).sort(), taskConfig].join(':');
  let hash = 0;
  for (const ch of input) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

// Solution 4
class RemoteCache {
  private cache = new Map<string, string>();
  private stats = { hits: 0, misses: 0, stored: 0 };
  store(hash: string, output: string) { this.cache.set(hash, output); this.stats.stored++; }
  retrieve(hash: string): string | null {
    if (this.cache.has(hash)) { this.stats.hits++; return this.cache.get(hash)!; }
    this.stats.misses++; return null;
  }
  has(hash: string) { return this.cache.has(hash); }
  getStats() { return { ...this.stats }; }
}

// Solution 5
function scheduleTasks(packages: string[], taskDeps: Record<string, string[]>, packageDeps: Record<string, string[]>): string[][] {
  const allTasks = new Map<string, string[]>();
  const tasks = Object.keys(taskDeps);
  for (const pkg of packages) {
    for (const task of tasks) {
      const id = `${pkg}#${task}`;
      const deps: string[] = [];
      for (const td of (taskDeps[task] || [])) {
        if (td.startsWith('^')) { const t = td.slice(1); for (const d of (packageDeps[pkg] || [])) deps.push(`${d}#${t}`); }
        else deps.push(`${pkg}#${td}`);
      }
      allTasks.set(id, deps);
    }
  }
  const plan: string[][] = [];
  const scheduled = new Set<string>();
  const remaining = [...allTasks.keys()];
  while (remaining.length > 0) {
    const group = remaining.filter(id => (allTasks.get(id) || []).every(d => scheduled.has(d) || !allTasks.has(d)));
    if (group.length === 0) break;
    plan.push(group);
    for (const id of group) { scheduled.add(id); remaining.splice(remaining.indexOf(id), 1); }
  }
  return plan;
}

// Solution 6
function analyzeWorkspaces(packages: Record<string, { dependencies: Record<string, string> }>, internalPrefix: string) {
  const internalDeps: Record<string, string[]> = {};
  const externalDeps: Record<string, string[]> = {};
  const allPkgs = Object.keys(packages);
  for (const [name, pkg] of Object.entries(packages)) {
    internalDeps[name] = [];
    externalDeps[name] = [];
    for (const dep of Object.keys(pkg.dependencies)) {
      if (dep.startsWith(internalPrefix)) internalDeps[name].push(dep);
      else externalDeps[name].push(dep);
    }
  }
  const hasDependent = new Set(Object.values(internalDeps).flat());
  const orphans = allPkgs.filter(p => !hasDependent.has(p) && (internalDeps[p]?.length || 0) === 0);
  return { internalDeps, externalDeps, orphans };
}

// Solution 7
function parseFilter(filter: string): { packages: string[]; scope: 'all' | 'affected' | 'specific'; since?: string } {
  if (filter.startsWith('...[')) {
    const since = filter.match(/\.\.\.\[(.+)\]/)?.[1];
    return { packages: [], scope: 'affected', since };
  }
  if (filter.includes('*')) return { packages: [], scope: 'all' };
  return { packages: [filter], scope: 'specific' };
}

// Solution 8
function resolveBuildOrder(packages: Record<string, string[]>): string[][] {
  const plan: string[][] = [];
  const built = new Set<string>();
  const remaining = Object.keys(packages);
  while (remaining.length > 0) {
    const group = remaining.filter(p => (packages[p] || []).every(d => built.has(d)));
    if (group.length === 0) break;
    plan.push(group);
    for (const p of group) { built.add(p); remaining.splice(remaining.indexOf(p), 1); }
  }
  return plan;
}

// Solution 9
function estimateCITime(affected: string[], taskDurations: Record<string, number>, cachedPackages: string[], parallelism: number): number {
  const uncached = affected.filter(p => !cachedPackages.includes(p));
  const durations = uncached.map(p => taskDurations[p] || 0).sort((a, b) => b - a);
  const workers = new Array(parallelism).fill(0);
  for (const d of durations) { const minIdx = workers.indexOf(Math.min(...workers)); workers[minIdx] += d; }
  return Math.max(...workers, 0);
}

// Solution 10
function detectChanges(diffOutput: string, packagePaths: Record<string, string>): string[] {
  const files = diffOutput.split('\n').filter(Boolean);
  const changed = new Set<string>();
  for (const [pkg, path] of Object.entries(packagePaths)) {
    if (files.some(f => f.startsWith(path))) changed.add(pkg);
  }
  return [...changed];
}

// Solution 11
function validateMonorepoConfig(config: { workspaces?: string[]; packages: Record<string, { path: string; dependencies?: string[] }> }) {
  const errors: string[] = [];
  if (!config.workspaces?.length) errors.push("workspaces must be defined");
  const names = new Set(Object.keys(config.packages));
  for (const [name, pkg] of Object.entries(config.packages)) {
    for (const dep of (pkg.dependencies || [])) {
      if (!names.has(dep)) errors.push(`${name} depends on unknown package ${dep}`);
    }
  }
  // Simple cycle check
  const visited = new Set<string>(); const visiting = new Set<string>();
  const hasCycle = (name: string): boolean => {
    if (visiting.has(name)) return true;
    if (visited.has(name)) return false;
    visiting.add(name);
    for (const dep of (config.packages[name]?.dependencies || [])) { if (hasCycle(dep)) return true; }
    visiting.delete(name); visited.add(name); return false;
  };
  for (const name of names) { if (hasCycle(name)) { errors.push("Circular dependency detected"); break; } }
  return { valid: errors.length === 0, errors };
}

// Solution 12
function planDeployments(affected: string[], deployTargets: Record<string, { type: 'vercel' | 'docker' | 'npm'; environment: string }>) {
  return affected.filter(p => deployTargets[p]).map(p => ({ package: p, type: deployTargets[p].type, environment: deployTargets[p].environment }));
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n01-monorepo-ci Solutions\n");

  await test("Ex1: Dependency graph", () => {
    const g = new DependencyGraph();
    g.addPackage("web", ["ui", "utils"]); g.addPackage("ui", ["utils"]); g.addPackage("utils", []);
    assert(g.getDependents("utils").includes("web") && g.getDependents("utils").includes("ui"), "dependents");
    assert(g.getTransitiveDependents("utils").includes("web"), "transitive");
  });
  await test("Ex2: Affected packages", () => {
    const r = getAffectedPackages({ web: ["utils"], api: ["utils"], ui: [] }, ["packages/utils/index.ts"], { web: "apps/web/", api: "apps/api/", utils: "packages/utils/", ui: "packages/ui/" });
    assert(r.includes("utils") && r.includes("web") && r.includes("api") && !r.includes("ui"), "affected");
  });
  await test("Ex3: Task hash", () => {
    const h1 = calculateTaskHash("web", "aaa", {}, {}, "build");
    const h2 = calculateTaskHash("web", "bbb", {}, {}, "build");
    assert(h1 !== h2, "different hashes");
  });
  await test("Ex4: Remote cache", () => {
    const c = new RemoteCache(); c.store("abc", "output"); assert(c.retrieve("abc") === "output", "hit");
    assert(c.retrieve("xyz") === null, "miss"); assert(c.getStats().hits === 1, "stats");
  });
  await test("Ex5: Task scheduler", () => {
    const plan = scheduleTasks(["web", "utils"], { build: ["^build"], test: ["build"] }, { web: ["utils"], utils: [] });
    assert(plan.length > 0, "has groups");
  });
  await test("Ex6: Workspace analyzer", () => {
    const r = analyzeWorkspaces({ "@org/web": { dependencies: { "@org/ui": "*", react: "18" } }, "@org/ui": { dependencies: { react: "18" } } }, "@org/");
    assert(r.internalDeps["@org/web"].includes("@org/ui"), "internal");
    assert(r.externalDeps["@org/web"].includes("react"), "external");
  });
  await test("Ex7: Filter parser", () => {
    assert(parseFilter("web").scope === "specific", "specific");
    assert(parseFilter("...[main]").scope === "affected", "affected");
  });
  await test("Ex8: Build order", () => {
    const order = resolveBuildOrder({ web: ["ui"], ui: ["utils"], utils: [] });
    assert(order[0][0] === "utils", "utils first");
  });
  await test("Ex9: CI time estimate", () => {
    const t = estimateCITime(["a", "b", "c"], { a: 100, b: 200, c: 150 }, ["a"], 2);
    assert(t === 200, `expected 200, got ${t}`);
  });
  await test("Ex10: Change detection", () => {
    const r = detectChanges("packages/utils/index.ts\napps/web/page.tsx", { utils: "packages/utils/", web: "apps/web/" });
    assert(r.includes("utils") && r.includes("web"), "detected");
  });
  await test("Ex11: Config validator", () => {
    assert(validateMonorepoConfig({ workspaces: ["packages/*"], packages: { a: { path: "a", dependencies: ["b"] }, b: { path: "b" } } }).valid, "valid");
  });
  await test("Ex12: Deploy planner", () => {
    const r = planDeployments(["web", "utils"], { web: { type: "vercel", environment: "prod" } });
    assert(r.length === 1 && r[0].package === "web", "only deployable");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
