// ============================================================
// Monitoring & Rollback — Solutions
// ============================================================
// Run: npx tsx 09-cicd/04-advanced/04-monitoring-rollback/solutions.ts
// ============================================================

// Solution 1
class HealthChecker {
  private checks: Array<{name: string; fn: () => Promise<boolean>}> = [];
  addCheck(name: string, fn: () => Promise<boolean>) { this.checks.push({ name, fn }); }
  async check() {
    const results: Record<string, boolean> = {};
    for (const c of this.checks) { try { results[c.name] = await c.fn(); } catch { results[c.name] = false; } }
    const values = Object.values(results);
    const passing = values.filter(Boolean).length;
    const status = passing === values.length ? 'healthy' : passing > 0 ? 'degraded' : 'unhealthy';
    return { status: status as 'healthy'|'degraded'|'unhealthy', checks: results };
  }
}

// Solution 2
class MetricCollector {
  private data: Array<{metric: string; value: number; timestamp: Date}> = [];
  record(metric: string, value: number, timestamp?: Date) { this.data.push({ metric, value, timestamp: timestamp || new Date() }); }
  private getWindow(metric: string, windowMs: number) {
    const cutoff = Date.now() - windowMs;
    return this.data.filter(d => d.metric === metric && d.timestamp.getTime() >= cutoff);
  }
  getAverage(metric: string, windowMs: number) {
    const w = this.getWindow(metric, windowMs);
    return w.length > 0 ? w.reduce((a, d) => a + d.value, 0) / w.length : 0;
  }
  getP95(metric: string, windowMs: number) {
    const w = this.getWindow(metric, windowMs).map(d => d.value).sort((a, b) => a - b);
    return w.length > 0 ? w[Math.floor(w.length * 0.95)] : 0;
  }
  getRate(metric: string, windowMs: number) {
    return this.getWindow(metric, windowMs).length / (windowMs / 1000);
  }
}

// Solution 3
function shouldRollback(metrics: { errorRate: number; p95Latency: number; healthChecksPassing: boolean; thresholds: { maxErrorRate: number; maxLatency: number } }) {
  const reasons: string[] = [];
  if (metrics.errorRate > metrics.thresholds.maxErrorRate) reasons.push(`Error rate ${metrics.errorRate}% exceeds ${metrics.thresholds.maxErrorRate}%`);
  if (metrics.p95Latency > metrics.thresholds.maxLatency) reasons.push(`P95 latency ${metrics.p95Latency}ms exceeds ${metrics.thresholds.maxLatency}ms`);
  if (!metrics.healthChecksPassing) reasons.push('Health checks failing');
  return { rollback: reasons.length > 0, reasons };
}

// Solution 4
class BlueGreenDeployment {
  private envs: Record<'blue'|'green', string> = { blue: 'v0', green: '' };
  private active: 'blue'|'green' = 'blue';
  deploy(version: string) { const target = this.active === 'blue' ? 'green' : 'blue'; this.envs[target] = version; return target; }
  swap() { this.active = this.active === 'blue' ? 'green' : 'blue'; return this.active; }
  rollback() { return this.swap(); }
  getActive() { return { env: this.active, version: this.envs[this.active] }; }
  getStandby() { const s = this.active === 'blue' ? 'green' : 'blue'; return { env: s as 'blue'|'green', version: this.envs[s as 'blue'|'green'] }; }
}

// Solution 5
class CanaryRelease {
  private phases: number[] = [];
  private currentPhase = 0;
  private version = '';
  private rolledBack = false;
  start(newVersion: string, phases: number[]) { this.version = newVersion; this.phases = phases; this.currentPhase = 0; this.rolledBack = false; }
  getCurrentPhase() { return { phase: this.currentPhase, trafficPercent: this.rolledBack ? 0 : (this.phases[this.currentPhase] || 0), version: this.version }; }
  advance() { if (this.currentPhase >= this.phases.length - 1) return false; this.currentPhase++; return true; }
  rollback() { this.rolledBack = true; }
  getTrafficSplit() { const canary = this.rolledBack ? 0 : (this.phases[this.currentPhase] || 0); return { stable: 100 - canary, canary }; }
}

// Solution 6
class FeatureFlagManager {
  private flags = new Map<string, boolean>();
  create(name: string, defaultEnabled: boolean) { this.flags.set(name, defaultEnabled); }
  isEnabled(name: string, context?: { userId?: string; percentage?: number }) {
    const base = this.flags.get(name);
    if (base === undefined) return false;
    if (!base) return false;
    if (context?.percentage !== undefined && context.userId) {
      let hash = 0; for (const c of context.userId) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
      return (hash % 100) < context.percentage;
    }
    return base;
  }
  enable(name: string) { this.flags.set(name, true); }
  disable(name: string) { this.flags.set(name, false); }
  listFlags() { return [...this.flags.entries()].map(([name, enabled]) => ({ name, enabled })); }
}

// Solution 7
function classifySeverity(incident: { usersAffected: number; totalUsers: number; serviceDown: boolean; dataLoss: boolean; revenueImpact: boolean }) {
  if (incident.serviceDown || incident.dataLoss) return { severity: 'SEV1' as const, responseTime: '15 minutes' };
  if (incident.revenueImpact || incident.usersAffected / incident.totalUsers > 0.5) return { severity: 'SEV2' as const, responseTime: '30 minutes' };
  if (incident.usersAffected / incident.totalUsers > 0.1) return { severity: 'SEV3' as const, responseTime: '2 hours' };
  return { severity: 'SEV4' as const, responseTime: 'Next sprint' };
}

// Solution 8
class AlertManager {
  private rules: Array<{name: string; condition: (v: number) => boolean; severity: string}> = [];
  private active = new Map<string, {severity: string; triggeredAt: Date}>();
  addRule(name: string, condition: (value: number) => boolean, severity: string) { this.rules.push({ name, condition, severity }); }
  evaluate(metric: string, value: number) {
    const triggered: Array<{rule: string; severity: string}> = [];
    for (const rule of this.rules) {
      if (rule.condition(value)) { triggered.push({ rule: rule.name, severity: rule.severity }); if (!this.active.has(rule.name)) this.active.set(rule.name, { severity: rule.severity, triggeredAt: new Date() }); }
    }
    return triggered;
  }
  getActiveAlerts() { return [...this.active.entries()].map(([rule, a]) => ({ rule, severity: a.severity, triggeredAt: a.triggeredAt })); }
  acknowledge(rule: string) { this.active.delete(rule); }
}

// Solution 9
function buildTimeline(events: Array<{time: Date; event: string; actor: string}>): string {
  return [...events].sort((a, b) => a.time.getTime() - b.time.getTime())
    .map(e => `[${e.time.toISOString().slice(11, 16)}] ${e.event} (by ${e.actor})`).join('\n');
}

// Solution 10
function generateRollbackPlan(deployment: { type: string; currentVersion: string; previousVersion: string; hasDatabaseMigration: boolean }) {
  const steps: string[] = [];
  let risk: 'low'|'medium'|'high' = 'low';
  let time = '< 1 minute';
  if (deployment.type === 'blue-green') { steps.push('Switch load balancer to standby environment', `Verify ${deployment.previousVersion} is serving traffic`); }
  else if (deployment.type === 'canary') { steps.push('Set canary traffic to 0%', 'Remove canary deployment'); time = '< 5 minutes'; }
  else { steps.push(`Redeploy ${deployment.previousVersion}`, 'Verify deployment health'); time = '5-10 minutes'; risk = 'medium'; }
  if (deployment.hasDatabaseMigration) { steps.push('Run reverse database migration'); risk = 'high'; time = '10-30 minutes'; }
  steps.push('Verify health checks passing', 'Notify team of rollback');
  return { steps, estimatedTime: time, risk };
}

// Solution 11
function checkSLO(metrics: Array<{timestamp: Date; value: number}>, target: number, windowDays: number) {
  const cutoff = Date.now() - windowDays * 86400000;
  const windowMetrics = metrics.filter(m => m.timestamp.getTime() >= cutoff);
  const total = windowMetrics.length;
  const passing = windowMetrics.filter(m => m.value >= 1).length; // value >= 1 means "up"
  const current = total > 0 ? (passing / total) * 100 : 100;
  const budget = current - target;
  const status = budget > 0.5 ? 'ok' : budget > 0 ? 'warning' : 'critical';
  return { current: Math.round(current * 100) / 100, target, budget: Math.round(budget * 100) / 100, status: status as 'ok'|'warning'|'critical' };
}

// Solution 12
function generatePostMortem(incident: { title: string; severity: string; duration: number; impact: string; rootCause: string; timeline: Array<{time: string; event: string}>; actionItems: Array<{task: string; owner: string; priority: string}> }): string {
  let md = `# Post-Mortem: ${incident.title}\n\n`;
  md += `**Severity:** ${incident.severity} | **Duration:** ${incident.duration} minutes\n\n`;
  md += `## Impact\n${incident.impact}\n\n`;
  md += `## Root Cause\n${incident.rootCause}\n\n`;
  md += `## Timeline\n${incident.timeline.map(e => `- **${e.time}** — ${e.event}`).join('\n')}\n\n`;
  md += `## Action Items\n${incident.actionItems.map(a => `- [${a.priority.toUpperCase()}] ${a.task} (${a.owner})`).join('\n')}\n`;
  return md;
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n04-monitoring-rollback Solutions\n");

  await test("Ex1: Health checker", async () => {
    const hc = new HealthChecker();
    hc.addCheck("db", async () => true); hc.addCheck("cache", async () => false);
    const r = await hc.check();
    assert(r.status === "degraded", r.status);
  });
  await test("Ex2: Metric collector", () => {
    const mc = new MetricCollector();
    mc.record("latency", 100); mc.record("latency", 200); mc.record("latency", 300);
    assert(mc.getAverage("latency", 60000) === 200, "avg");
  });
  await test("Ex3: Rollback decision", () => {
    const r = shouldRollback({ errorRate: 5, p95Latency: 200, healthChecksPassing: true, thresholds: { maxErrorRate: 1, maxLatency: 500 } });
    assert(r.rollback && r.reasons.length === 1, "should rollback for error rate");
  });
  await test("Ex4: Blue-green", () => {
    const bg = new BlueGreenDeployment();
    assert(bg.getActive().env === "blue", "starts blue");
    bg.deploy("v2"); bg.swap();
    assert(bg.getActive().env === "green" && bg.getActive().version === "v2", "swapped");
    bg.rollback();
    assert(bg.getActive().env === "blue", "rolled back");
  });
  await test("Ex5: Canary", () => {
    const cr = new CanaryRelease();
    cr.start("v2", [5, 25, 50, 100]);
    assert(cr.getTrafficSplit().canary === 5, "5%");
    cr.advance();
    assert(cr.getTrafficSplit().canary === 25, "25%");
    cr.rollback();
    assert(cr.getTrafficSplit().canary === 0, "rolled back");
  });
  await test("Ex6: Feature flags", () => {
    const ff = new FeatureFlagManager();
    ff.create("dark-mode", false);
    assert(!ff.isEnabled("dark-mode"), "disabled");
    ff.enable("dark-mode");
    assert(ff.isEnabled("dark-mode"), "enabled");
    ff.disable("dark-mode");
    assert(!ff.isEnabled("dark-mode"), "disabled again");
  });
  await test("Ex7: Severity classifier", () => {
    assert(classifySeverity({ usersAffected: 1000, totalUsers: 1000, serviceDown: true, dataLoss: false, revenueImpact: true }).severity === "SEV1", "sev1");
    assert(classifySeverity({ usersAffected: 10, totalUsers: 10000, serviceDown: false, dataLoss: false, revenueImpact: false }).severity === "SEV4", "sev4");
  });
  await test("Ex8: Alert manager", () => {
    const am = new AlertManager();
    am.addRule("high-error", v => v > 5, "critical");
    const alerts = am.evaluate("error_rate", 10);
    assert(alerts.length === 1 && alerts[0].severity === "critical", "triggered");
    am.acknowledge("high-error");
    assert(am.getActiveAlerts().length === 0, "acknowledged");
  });
  await test("Ex9: Timeline", () => {
    const tl = buildTimeline([
      { time: new Date("2024-01-01T10:30:00Z"), event: "Alert fired", actor: "system" },
      { time: new Date("2024-01-01T10:00:00Z"), event: "Deploy started", actor: "alice" },
    ]);
    assert(tl.startsWith("[10:00]"), "sorted by time");
  });
  await test("Ex10: Rollback plan", () => {
    const p = generateRollbackPlan({ type: "blue-green", currentVersion: "v2", previousVersion: "v1", hasDatabaseMigration: false });
    assert(p.risk === "low" && p.steps.length >= 2, "plan generated");
    const p2 = generateRollbackPlan({ type: "direct", currentVersion: "v2", previousVersion: "v1", hasDatabaseMigration: true });
    assert(p2.risk === "high", "high risk with migration");
  });
  await test("Ex11: SLO monitor", () => {
    const now = Date.now();
    const metrics = Array.from({ length: 1000 }, (_, i) => ({ timestamp: new Date(now - i * 60000), value: i === 0 ? 0 : 1 }));
    const r = checkSLO(metrics, 99.9, 1);
    assert(r.current >= 99 && r.current <= 100, `current ${r.current}`);
  });
  await test("Ex12: Post-mortem", () => {
    const pm = generatePostMortem({
      title: "API Outage", severity: "SEV1", duration: 45, impact: "All users affected",
      rootCause: "Database connection pool exhausted",
      timeline: [{ time: "10:00", event: "Alert fired" }],
      actionItems: [{ task: "Add connection pool monitoring", owner: "alice", priority: "high" }],
    });
    assert(pm.includes("# Post-Mortem") && pm.includes("SEV1"), "formatted");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
