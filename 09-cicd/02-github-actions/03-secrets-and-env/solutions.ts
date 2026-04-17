// ============================================================
// Secrets and Environment Variables — Solutions
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/03-secrets-and-env/solutions.ts
// ============================================================

// Solution 1
class SecretStore {
  private secrets = new Map<string, { value: string; level: 'repo' | 'env' | 'org'; environment?: string }>();

  set(name: string, value: string, level: 'repo' | 'env' | 'org', environment?: string): void {
    const key = environment ? `${name}:${environment}` : name;
    this.secrets.set(key, { value, level, environment });
  }

  get(name: string, environment?: string): string | undefined {
    if (environment) {
      const envSecret = this.secrets.get(`${name}:${environment}`);
      if (envSecret) return envSecret.value;
    }
    const repo = this.secrets.get(name);
    if (repo && repo.level === 'repo') return repo.value;
    if (repo && repo.level === 'org') return repo.value;
    return undefined;
  }

  list(): Array<{ name: string; level: string }> {
    return [...this.secrets.entries()].map(([key, s]) => ({
      name: key.split(':')[0],
      level: s.level,
    }));
  }

  delete(name: string): boolean { return this.secrets.delete(name); }
}

// Solution 2
function maskSecrets(text: string, secrets: string[]): string {
  let result = text;
  for (const secret of secrets) {
    if (secret.length === 0) continue;
    result = result.split(secret).join('***');
    const b64 = Buffer.from(secret).toString('base64');
    result = result.split(b64).join('***');
  }
  return result;
}

// Solution 3
function resolveEnvVars(
  workflowEnv: Record<string, string>,
  jobEnv: Record<string, string>,
  stepEnv: Record<string, string>,
  githubDefaults: Record<string, string>
): Record<string, string> {
  return { ...githubDefaults, ...workflowEnv, ...jobEnv, ...stepEnv };
}

// Solution 4
function evaluateExpression(
  template: string,
  context: { github: Record<string, string>; env: Record<string, string>; secrets: Record<string, string> }
): string {
  return template.replace(/\$\{\{\s*(\w+)\.(\w+)\s*\}\}/g, (_m, ns, key) => {
    const map = context[ns as keyof typeof context];
    return map?.[key] ?? '';
  });
}

// Solution 5
function checkPermissions(
  required: Record<string, 'read' | 'write'>,
  granted: Record<string, 'read' | 'write' | 'none'>
): { allowed: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const [perm, level] of Object.entries(required)) {
    const g = granted[perm] || 'none';
    if (g === 'none') missing.push(perm);
    else if (level === 'write' && g === 'read') missing.push(perm);
  }
  return { allowed: missing.length === 0, missing };
}

// Solution 6
function calculateTokenScope(
  workflowPermissions?: Record<string, string>,
  jobPermissions?: Record<string, string>
): Record<string, string> {
  if (jobPermissions) return { ...jobPermissions };
  if (workflowPermissions) return { ...workflowPermissions };
  return { contents: 'read', metadata: 'read' };
}

// Solution 7
function canDeploy(
  environment: { requiredReviewers: string[]; branchRestrictions: string[]; waitMinutes: number },
  request: { branch: string; approvers: string[]; waitedMinutes: number }
): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (environment.branchRestrictions.length > 0 && !environment.branchRestrictions.includes(request.branch)) {
    reasons.push(`Branch '${request.branch}' not allowed`);
  }
  const missingReviewers = environment.requiredReviewers.filter(r => !request.approvers.includes(r));
  if (missingReviewers.length > 0) {
    reasons.push(`Missing approvals from: ${missingReviewers.join(', ')}`);
  }
  if (request.waitedMinutes < environment.waitMinutes) {
    reasons.push(`Must wait ${environment.waitMinutes - request.waitedMinutes} more minutes`);
  }
  return { allowed: reasons.length === 0, reasons };
}

// Solution 8
class SecretRotationTracker {
  private secrets = new Map<string, { rotationDays: number; lastRotated?: Date }>();

  constructor(private now: Date) {}

  register(name: string, rotationDays: number): void {
    this.secrets.set(name, { rotationDays, lastRotated: undefined });
  }

  recordRotation(name: string): void {
    const s = this.secrets.get(name);
    if (s) s.lastRotated = new Date(this.now);
  }

  getExpiring(withinDays: number): string[] {
    const result: string[] = [];
    for (const [name, s] of this.secrets) {
      if (!s.lastRotated) { result.push(name); continue; }
      const daysElapsed = (this.now.getTime() - s.lastRotated.getTime()) / 86400000;
      const daysUntilDue = s.rotationDays - daysElapsed;
      if (daysUntilDue <= withinDays && daysUntilDue > 0) result.push(name);
    }
    return result;
  }

  getOverdue(): string[] {
    const result: string[] = [];
    for (const [name, s] of this.secrets) {
      if (!s.lastRotated) { result.push(name); continue; }
      const daysElapsed = (this.now.getTime() - s.lastRotated.getTime()) / 86400000;
      if (daysElapsed >= s.rotationDays) result.push(name);
    }
    return result;
  }
}

// Solution 9
function selectEnvironment(
  ref: string,
  eventName: string,
  rules: Array<{ environment: string; branches: string[]; events: string[] }>
): string | null {
  for (const rule of rules) {
    if (!rule.events.includes(eventName)) continue;
    if (rule.branches.some(b => ref.includes(b))) return rule.environment;
  }
  return null;
}

// Solution 10
class SecretAuditLog {
  private log: Array<{ secretName: string; jobName: string; timestamp: Date }> = [];

  logAccess(secretName: string, jobName: string, timestamp: Date): void {
    this.log.push({ secretName, jobName, timestamp });
  }

  getAccessLog(secretName: string) {
    return this.log.filter(e => e.secretName === secretName).map(e => ({ jobName: e.jobName, timestamp: e.timestamp }));
  }

  getFrequentlyAccessed(threshold: number): string[] {
    const counts = new Map<string, number>();
    for (const e of this.log) counts.set(e.secretName, (counts.get(e.secretName) || 0) + 1);
    return [...counts.entries()].filter(([, c]) => c >= threshold).map(([n]) => n);
  }

  getSuspiciousAccess(): string[] {
    const jobSets = new Map<string, Set<string>>();
    for (const e of this.log) {
      if (!jobSets.has(e.secretName)) jobSets.set(e.secretName, new Set());
      jobSets.get(e.secretName)!.add(e.jobName);
    }
    return [...jobSets.entries()].filter(([, jobs]) => jobs.size > 3).map(([n]) => n);
  }
}

// Solution 11
function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

// Solution 12
function buildGitHubContext(
  event: { type: string; branch: string; sha: string; actor: string; repo: string; runId: number }
): Record<string, string> {
  return {
    event_name: event.type,
    ref: `refs/heads/${event.branch}`,
    sha: event.sha,
    actor: event.actor,
    repository: event.repo,
    run_id: String(event.runId),
  };
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

  console.log("\n03-secrets-and-env Solutions\n");

  await test("Ex1: Secret store", () => {
    const store = new SecretStore();
    store.set("API_KEY", "abc123", "repo");
    store.set("API_KEY", "prod-key", "env", "production");
    assert(store.get("API_KEY", "production") === "prod-key", "env override");
    assert(store.get("API_KEY") === "abc123", "repo fallback");
  });

  await test("Ex2: Secret masker", () => {
    const masked = maskSecrets("Key is abc123 and token is xyz", ["abc123", "xyz"]);
    assert(!masked.includes("abc123") && !masked.includes("xyz"), "masked");
    assert(masked.includes("***"), "has mask");
  });

  await test("Ex3: Env var resolution", () => {
    const r = resolveEnvVars({ A: "1", B: "2" }, { B: "3" }, { B: "4" }, { C: "5" });
    assert(r.A === "1" && r.B === "4" && r.C === "5", "precedence");
  });

  await test("Ex4: Expression evaluator", () => {
    const r = evaluateExpression("Deploy ${{ github.ref }} by ${{ github.actor }}", {
      github: { ref: "main", actor: "alice" }, env: {}, secrets: {},
    });
    assert(r === "Deploy main by alice", r);
  });

  await test("Ex5: Permission checker", () => {
    const r = checkPermissions({ contents: "write", issues: "read" }, { contents: "read", issues: "read" });
    assert(!r.allowed && r.missing.includes("contents"), "write > read");
  });

  await test("Ex6: Token scope", () => {
    assert(calculateTokenScope().contents === "read", "default");
    assert(calculateTokenScope({ contents: "write" }, { issues: "write" }).issues === "write", "job overrides");
  });

  await test("Ex7: Deploy protection", () => {
    const r = canDeploy(
      { requiredReviewers: ["alice"], branchRestrictions: ["main"], waitMinutes: 5 },
      { branch: "main", approvers: ["alice"], waitedMinutes: 5 }
    );
    assert(r.allowed, "should be allowed");
    const r2 = canDeploy(
      { requiredReviewers: ["alice"], branchRestrictions: ["main"], waitMinutes: 5 },
      { branch: "dev", approvers: [], waitedMinutes: 0 }
    );
    assert(!r2.allowed && r2.reasons.length === 3, "3 reasons");
  });

  await test("Ex8: Rotation tracker", () => {
    const tracker = new SecretRotationTracker(new Date("2024-06-15"));
    tracker.register("API_KEY", 30);
    assert(tracker.getOverdue().includes("API_KEY"), "never rotated = overdue");
    tracker.recordRotation("API_KEY");
    assert(!tracker.getOverdue().includes("API_KEY"), "just rotated");
  });

  await test("Ex9: Environment selector", () => {
    const env = selectEnvironment("refs/heads/main", "push", [
      { environment: "production", branches: ["main"], events: ["push"] },
      { environment: "staging", branches: ["develop"], events: ["push"] },
    ]);
    assert(env === "production", "selected prod");
  });

  await test("Ex10: Audit log", () => {
    const log = new SecretAuditLog();
    log.logAccess("KEY", "job1", new Date());
    log.logAccess("KEY", "job2", new Date());
    log.logAccess("KEY", "job3", new Date());
    log.logAccess("KEY", "job4", new Date());
    assert(log.getSuspiciousAccess().includes("KEY"), "suspicious");
    assert(log.getFrequentlyAccessed(3).includes("KEY"), "frequent");
  });

  await test("Ex11: Env file parser", () => {
    const r = parseEnvFile('# comment\nAPI_KEY=abc\nDB="hello world"\n\nDEBUG=true');
    assert(r.API_KEY === "abc", "simple");
    assert(r.DB === "hello world", "quoted");
    assert(r.DEBUG === "true", "bool");
  });

  await test("Ex12: Context builder", () => {
    const ctx = buildGitHubContext({ type: "push", branch: "main", sha: "abc", actor: "bob", repo: "o/r", runId: 1 });
    assert(ctx.ref === "refs/heads/main", "ref");
    assert(ctx.actor === "bob", "actor");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
