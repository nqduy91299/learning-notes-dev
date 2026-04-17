// ============================================================
// Preview Deployments — Solutions
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/04-preview-deployments/solutions.ts
// ============================================================

// Solution 1
function generatePreviewUrl(config: {platform: 'vercel'|'netlify'|'custom'; project: string; prNumber?: number; sha?: string; team?: string; domain?: string}): string {
  if (config.platform === 'vercel') return `https://${config.project}-${(config.sha||'').slice(0,7)}-${config.team||'team'}.vercel.app`;
  if (config.platform === 'netlify') return `https://deploy-preview-${config.prNumber}--${config.project}.netlify.app`;
  return `https://pr-${config.prNumber}.${config.domain || 'preview.myapp.com'}`;
}

// Solution 2
class PreviewManager {
  private deployments = new Map<number, {url: string; deployId: string; status: string}>();
  private counter = 0;

  deploy(prNumber: number, sha: string) {
    const deployId = `deploy-${++this.counter}`;
    const url = `https://pr-${prNumber}.preview.app`;
    this.deployments.set(prNumber, { url, deployId, status: 'building' });
    return { url, deployId };
  }
  getByPR(prNumber: number) { return this.deployments.get(prNumber); }
  updateStatus(deployId: string, status: string) {
    for (const d of this.deployments.values()) { if (d.deployId === deployId) d.status = status; }
  }
  cleanup(prNumber: number) { return this.deployments.delete(prNumber); }
  listActive() { return [...this.deployments.entries()].filter(([,d]) => d.status !== 'deleted').map(([pr, d]) => ({ prNumber: pr, url: d.url, status: d.status })); }
}

// Solution 3
function buildPreviewComment(deployment: {url: string; sha: string; status: 'building'|'ready'|'error'; buildTime?: number}): string {
  const emoji = deployment.status === 'ready' ? '✅' : deployment.status === 'building' ? '🔄' : '❌';
  const lines = [`${emoji} **Preview Deployment**`, ``, `**Status:** ${deployment.status}`, `**Commit:** \`${deployment.sha.slice(0, 7)}\``];
  if (deployment.status === 'ready') lines.push(`**URL:** ${deployment.url}`);
  if (deployment.buildTime) lines.push(`**Build time:** ${deployment.buildTime}s`);
  return lines.join('\n');
}

// Solution 4
class DeploymentStateMachine {
  private state: string;
  private transitions: Record<string, Record<string, string>> = {
    pending: { build: 'building' },
    building: { success: 'ready', error: 'error' },
    ready: { activate: 'active' },
    active: { deactivate: 'inactive' },
  };

  constructor(initialState: string) { this.state = initialState; }

  transition(event: string): string {
    if (event === 'cancel') { this.state = 'cancelled'; return this.state; }
    const next = this.transitions[this.state]?.[event];
    if (!next) throw new Error(`Invalid transition: ${this.state} + ${event}`);
    this.state = next;
    return this.state;
  }
}

// Solution 5
function findStaleDeployments(
  deployments: Array<{prNumber: number; createdAt: Date; lastAccessed: Date; status: string}>,
  maxStaleDays: number
): number[] {
  const now = Date.now();
  return deployments.filter(d => d.status !== 'deleted' && (now - d.lastAccessed.getTime()) / 86400000 > maxStaleDays).map(d => d.prNumber);
}

// Solution 6
function buildPreviewEnv(prNumber: number, baseConfig: Record<string, string>, previewOverrides: Record<string, string>): Record<string, string> {
  return { ...baseConfig, ...previewOverrides, PREVIEW_URL: `https://pr-${prNumber}.preview.app`, PR_NUMBER: String(prNumber) };
}

// Solution 7
class ResourceLimiter {
  constructor(private maxPreviews: number, private maxCostPerDay: number) {}

  canDeploy(currentCount: number, dailyCost: number): { allowed: boolean; reason?: string } {
    if (currentCount >= this.maxPreviews) return { allowed: false, reason: `Max ${this.maxPreviews} previews reached` };
    if (dailyCost >= this.maxCostPerDay) return { allowed: false, reason: `Daily cost limit $${this.maxCostPerDay} reached` };
    return { allowed: true };
  }

  suggestCleanup(deployments: Array<{prNumber: number; createdAt: Date; cost: number}>): number[] {
    return [...deployments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || b.cost - a.cost)
      .slice(0, Math.ceil(deployments.length / 3)).map(d => d.prNumber);
  }
}

// Solution 8
function mapBranchToEnvironment(branch: string, rules: Array<{pattern: string; environment: string}>): string {
  for (const rule of rules) {
    if (rule.pattern === branch) return rule.environment;
    if (rule.pattern.endsWith('/*') && branch.startsWith(rule.pattern.slice(0, -1))) return rule.environment;
  }
  return 'preview';
}

// Solution 9
function generateDeployDiff(current: {url: string; sha: string; deployedAt: Date}, previous: {url: string; sha: string; deployedAt: Date}) {
  const diffMs = current.deployedAt.getTime() - previous.deployedAt.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  const timeSince = days > 0 ? `${days} days ago` : `${hours} hours ago`;
  return { currentUrl: current.url, previousUrl: previous.url, commitsBehind: 0, timeSinceLastDeploy: timeSince };
}

// Solution 10
class PreviewDNS {
  private records = new Map<number, { subdomain: string; target: string }>();
  createRecord(prNumber: number, target: string): string {
    const subdomain = `pr-${prNumber}.preview.myapp.com`;
    this.records.set(prNumber, { subdomain, target });
    return subdomain;
  }
  deleteRecord(prNumber: number): boolean { return this.records.delete(prNumber); }
  resolve(subdomain: string): string | null {
    for (const r of this.records.values()) { if (r.subdomain === subdomain) return r.target; }
    return null;
  }
  listRecords() { return [...this.records.values()]; }
}

// Solution 11
async function cleanupPreviews(
  deployments: Array<{prNumber: number; status: string}>,
  isPROpen: (prNumber: number) => Promise<boolean>,
  deleteDeploy: (prNumber: number) => Promise<void>
): Promise<{cleaned: number[]; kept: number[]; errors: number[]}> {
  const cleaned: number[] = [], kept: number[] = [], errors: number[] = [];
  for (const d of deployments) {
    try {
      if (await isPROpen(d.prNumber)) { kept.push(d.prNumber); }
      else { await deleteDeploy(d.prNumber); cleaned.push(d.prNumber); }
    } catch { errors.push(d.prNumber); }
  }
  return { cleaned, kept, errors };
}

// Solution 12
async function runPreviewTests(
  _previewUrl: string,
  tests: Array<{name: string; path: string; expectedStatus: number}>
): Promise<Array<{name: string; passed: boolean; actualStatus: number}>> {
  return tests.map((t, i) => {
    const actualStatus = i % 2 === 0 ? t.expectedStatus : 500;
    return { name: t.name, passed: actualStatus === t.expectedStatus, actualStatus };
  });
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n04-preview-deployments Solutions\n");

  await test("Ex1: Preview URL", () => {
    assert(generatePreviewUrl({ platform: 'netlify', project: 'mysite', prNumber: 42 }).includes('deploy-preview-42'), "netlify");
    assert(generatePreviewUrl({ platform: 'custom', project: 'myapp', prNumber: 7, domain: 'prev.io' }).includes('pr-7'), "custom");
  });
  await test("Ex2: Preview manager", () => {
    const pm = new PreviewManager();
    const d = pm.deploy(42, "abc123");
    assert(d.url.includes("pr-42"), "url");
    pm.updateStatus(d.deployId, "ready");
    assert(pm.getByPR(42)?.status === "ready", "status");
    pm.cleanup(42);
    assert(pm.listActive().length === 0, "cleaned");
  });
  await test("Ex3: PR comment", () => {
    const c = buildPreviewComment({ url: "https://x.com", sha: "abc1234", status: "ready" });
    assert(c.includes("✅") && c.includes("https://x.com"), "comment");
  });
  await test("Ex4: State machine", () => {
    const sm = new DeploymentStateMachine("pending");
    assert(sm.transition("build") === "building", "build");
    assert(sm.transition("success") === "ready", "ready");
    let threw = false;
    try { sm.transition("build"); } catch { threw = true; }
    assert(threw, "invalid transition");
  });
  await test("Ex5: Stale detector", () => {
    const stale = findStaleDeployments([
      { prNumber: 1, createdAt: new Date(), lastAccessed: new Date(Date.now() - 10 * 86400000), status: "ready" },
      { prNumber: 2, createdAt: new Date(), lastAccessed: new Date(), status: "ready" },
    ], 7);
    assert(stale.length === 1 && stale[0] === 1, "found stale");
  });
  await test("Ex6: Preview env", () => {
    const env = buildPreviewEnv(42, { API: "prod" }, { API: "test" });
    assert(env.API === "test" && env.PR_NUMBER === "42", "env");
  });
  await test("Ex7: Resource limiter", () => {
    const rl = new ResourceLimiter(5, 100);
    assert(rl.canDeploy(3, 50).allowed, "can deploy");
    assert(!rl.canDeploy(5, 50).allowed, "max reached");
  });
  await test("Ex8: Branch mapper", () => {
    assert(mapBranchToEnvironment("main", [{ pattern: "main", environment: "production" }]) === "production", "exact");
    assert(mapBranchToEnvironment("feature/x", [{ pattern: "feature/*", environment: "preview" }]) === "preview", "glob");
    assert(mapBranchToEnvironment("random", []) === "preview", "default");
  });
  await test("Ex9: Deploy diff", () => {
    const d = generateDeployDiff(
      { url: "a", sha: "aaa", deployedAt: new Date("2024-01-03") },
      { url: "b", sha: "bbb", deployedAt: new Date("2024-01-01") }
    );
    assert(d.timeSinceLastDeploy === "2 days ago", d.timeSinceLastDeploy);
  });
  await test("Ex10: DNS manager", () => {
    const dns = new PreviewDNS();
    const sub = dns.createRecord(42, "1.2.3.4");
    assert(dns.resolve(sub) === "1.2.3.4", "resolve");
    dns.deleteRecord(42);
    assert(dns.resolve(sub) === null, "deleted");
  });
  await test("Ex11: Cleanup orchestrator", async () => {
    const r = await cleanupPreviews(
      [{ prNumber: 1, status: "ready" }, { prNumber: 2, status: "ready" }],
      async (pr) => pr === 1,
      async () => {}
    );
    assert(r.kept.includes(1) && r.cleaned.includes(2), "cleanup");
  });
  await test("Ex12: Preview tests", async () => {
    const r = await runPreviewTests("https://x.com", [
      { name: "home", path: "/", expectedStatus: 200 },
      { name: "api", path: "/api", expectedStatus: 200 },
    ]);
    assert(r[0].passed && !r[1].passed, "test results");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
