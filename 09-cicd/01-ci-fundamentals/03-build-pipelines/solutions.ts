// ============================================================
// Build Pipelines — Solutions
// ============================================================
// Run: npx tsx 09-cicd/01-ci-fundamentals/03-build-pipelines/solutions.ts
// ============================================================

// Solution 1
type StageStatus = 'queued' | 'running' | 'success' | 'failure' | 'cancelled';
type StageConfig = {
  name: string;
  commands: string[];
  dependsOn: string[];
  timeout?: number;
  retries?: number;
  condition?: 'always' | 'on-success' | 'on-failure';
};

const lintStage: StageConfig = {
  name: "lint",
  commands: ["npm run lint"],
  dependsOn: ["install"],
};

// Solution 2
class BuildScheduler {
  private stages: StageConfig[] = [];

  addStage(config: StageConfig): void {
    this.stages.push(config);
  }

  getExecutionPlan(): string[][] {
    const plan: string[][] = [];
    const scheduled = new Set<string>();
    const remaining = [...this.stages];

    while (remaining.length > 0) {
      const group: string[] = [];
      const canSchedule = remaining.filter(s =>
        s.dependsOn.every(d => scheduled.has(d))
      );
      if (canSchedule.length === 0 && remaining.length > 0) break; // circular
      for (const s of canSchedule) {
        group.push(s.name);
        const idx = remaining.indexOf(s);
        remaining.splice(idx, 1);
      }
      for (const n of group) scheduled.add(n);
      if (group.length > 0) plan.push(group);
    }
    return plan;
  }
}

// Solution 3
class PipelineExecutor {
  constructor(private stages: StageConfig[]) {}

  async execute(): Promise<Record<string, StageStatus>> {
    const results: Record<string, StageStatus> = {};
    const scheduler = new BuildScheduler();
    for (const s of this.stages) scheduler.addStage(s);
    const plan = scheduler.getExecutionPlan();

    for (const group of plan) {
      await Promise.all(group.map(async (name) => {
        const stage = this.stages.find(s => s.name === name)!;
        // Check deps
        if (stage.dependsOn.some(d => results[d] !== 'success')) {
          results[name] = 'cancelled';
          return;
        }
        results[name] = 'running';
        await new Promise(r => setTimeout(r, 10 * stage.commands.length));
        results[name] = name.includes('fail') ? 'failure' : 'success';
      }));
    }
    return results;
  }
}

// Solution 4
function generateCacheKey(template: string, context: Record<string, string>): string {
  return template.replace(/\{\{\s*(hash\((\w+)\)|(\w+))\s*\}\}/g, (_match, _full, hashKey, directKey) => {
    if (hashKey) {
      const val = context[hashKey] || '';
      let hash = 0;
      for (const ch of val) hash = (hash + ch.charCodeAt(0)) % 10000;
      return String(hash);
    }
    return context[directKey] || '';
  });
}

// Solution 5
function predictCacheHit(currentKey: string, restoreKeys: string[], availableKeys: string[]): string | null {
  if (availableKeys.includes(currentKey)) return currentKey;
  for (const rk of restoreKeys) {
    const match = availableKeys.find(ak => ak.startsWith(rk));
    if (match) return match;
  }
  return null;
}

// Solution 6
class ArtifactStore {
  private artifacts = new Map<string, { stage: string; data: string; uploadedAt: Date; retentionDays: number }>();

  upload(stage: string, name: string, data: string, retentionDays: number): void {
    this.artifacts.set(name, { stage, data, uploadedAt: new Date(), retentionDays });
  }

  download(name: string): string | undefined {
    return this.artifacts.get(name)?.data;
  }

  listByStage(stage: string): string[] {
    return [...this.artifacts.entries()].filter(([, v]) => v.stage === stage).map(([k]) => k);
  }

  cleanup(currentDate: Date): number {
    let removed = 0;
    for (const [name, art] of this.artifacts) {
      const expiry = new Date(art.uploadedAt.getTime() + art.retentionDays * 86400000);
      if (currentDate > expiry) {
        this.artifacts.delete(name);
        removed++;
      }
    }
    return removed;
  }
}

// Solution 7
function groupStages(stages: Array<{ name: string; dependsOn: string[] }>): string[][] {
  const plan: string[][] = [];
  const scheduled = new Set<string>();
  const remaining = [...stages];

  while (remaining.length > 0) {
    const group = remaining.filter(s => s.dependsOn.every(d => scheduled.has(d)));
    if (group.length === 0) break;
    const names = group.map(s => s.name);
    plan.push(names);
    for (const n of names) {
      scheduled.add(n);
      const idx = remaining.findIndex(s => s.name === n);
      remaining.splice(idx, 1);
    }
  }
  return plan;
}

// Solution 8
function calculateDuration(plan: string[][], durations: Record<string, number>): number {
  return plan.reduce((total, group) => {
    const maxInGroup = Math.max(...group.map(n => durations[n] || 0));
    return total + maxInGroup;
  }, 0);
}

// Solution 9
class EnvConfigBuilder {
  private variables = new Map<string, string>();
  private secretKeys = new Set<string>();

  constructor(public readonly env: 'development' | 'staging' | 'production') {}

  set(key: string, value: string): this {
    this.variables.set(key, value);
    return this;
  }

  setSecret(key: string, value: string): this {
    this.variables.set(key, value);
    this.secretKeys.add(key);
    return this;
  }

  inherit(parent: EnvConfigBuilder): this {
    const parentBuild = parent.build();
    for (const [k, v] of Object.entries(parentBuild.variables)) {
      if (!parentBuild.secrets.includes(k) && !this.variables.has(k)) {
        this.variables.set(k, v);
      }
    }
    return this;
  }

  build(): { variables: Record<string, string>; secrets: string[] } {
    const variables: Record<string, string> = {};
    for (const [k, v] of this.variables) variables[k] = v;
    return { variables, secrets: [...this.secretKeys] };
  }
}

// Solution 10
async function executeWithRetry(
  stageName: string,
  fn: () => Promise<boolean>,
  maxRetries: number
): Promise<{ success: boolean; attempts: number; stageName: string }> {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const result = await fn();
    if (result) return { success: true, attempts: attempt, stageName };
  }
  return { success: false, attempts: maxRetries + 1, stageName };
}

// Solution 11
function shouldRunStage(
  stage: { name: string; condition?: 'always' | 'on-success' | 'on-failure' },
  previousResults: Record<string, 'success' | 'failure' | 'cancelled'>
): boolean {
  const condition = stage.condition || 'on-success';
  if (condition === 'always') return true;
  const values = Object.values(previousResults);
  if (condition === 'on-failure') return values.some(v => v === 'failure');
  return values.every(v => v === 'success');
}

// Solution 12
function validatePipelineConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ["Config must be an object"] };
  }
  const c = config as Record<string, unknown>;
  if (typeof c.name !== 'string') errors.push("name must be a string");
  if (!Array.isArray(c.stages)) {
    errors.push("stages must be an array");
  } else if (c.stages.length === 0) {
    errors.push("stages must not be empty");
  } else {
    for (let i = 0; i < c.stages.length; i++) {
      const s = c.stages[i] as Record<string, unknown>;
      if (typeof s.name !== 'string') errors.push(`stages[${i}].name must be a string`);
      if (!Array.isArray(s.commands) || s.commands.length === 0)
        errors.push(`stages[${i}].commands must be a non-empty array`);
    }
  }
  return { valid: errors.length === 0, errors };
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

  console.log("\n03-build-pipelines Solutions\n");

  await test("Ex1: Stage config", () => {
    assert(lintStage.name === "lint", "name");
    assert(lintStage.dependsOn[0] === "install", "deps");
  });

  await test("Ex2: Build scheduler", () => {
    const s = new BuildScheduler();
    s.addStage({ name: "install", commands: ["npm ci"], dependsOn: [] });
    s.addStage({ name: "lint", commands: ["npm run lint"], dependsOn: ["install"] });
    s.addStage({ name: "test", commands: ["npm test"], dependsOn: ["install"] });
    s.addStage({ name: "build", commands: ["npm run build"], dependsOn: ["lint", "test"] });
    const plan = s.getExecutionPlan();
    assert(plan.length === 3, `3 groups, got ${plan.length}`);
    assert(plan[0][0] === "install", "install first");
    assert(plan[1].includes("lint") && plan[1].includes("test"), "lint+test parallel");
    assert(plan[2][0] === "build", "build last");
  });

  await test("Ex3: Pipeline executor", async () => {
    const ex = new PipelineExecutor([
      { name: "install", commands: ["cmd"], dependsOn: [] },
      { name: "test-fail", commands: ["cmd"], dependsOn: ["install"] },
      { name: "build", commands: ["cmd"], dependsOn: ["test-fail"] },
    ]);
    const results = await ex.execute();
    assert(results["install"] === "success", "install ok");
    assert(results["test-fail"] === "failure", "fail stage");
    assert(results["build"] === "cancelled", "build cancelled");
  });

  await test("Ex4: Cache key generator", () => {
    const key = generateCacheKey("npm-{{ hash(lockfile) }}", { lockfile: "abc" });
    assert(key.startsWith("npm-"), "prefix");
    assert(key === "npm-294", `expected npm-294, got ${key}`);
  });

  await test("Ex5: Cache hit predictor", () => {
    assert(predictCacheHit("npm-123", ["npm-"], ["npm-123", "npm-100"]) === "npm-123", "exact");
    assert(predictCacheHit("npm-999", ["npm-"], ["npm-123"]) === "npm-123", "prefix");
    assert(predictCacheHit("pip-1", ["pip-"], ["npm-123"]) === null, "miss");
  });

  await test("Ex6: Artifact store", () => {
    const store = new ArtifactStore();
    store.upload("build", "dist.zip", "data", 7);
    assert(store.download("dist.zip") === "data", "download");
    assert(store.listByStage("build").length === 1, "list");
  });

  await test("Ex7: Group stages", () => {
    const groups = groupStages([
      { name: "a", dependsOn: [] },
      { name: "b", dependsOn: ["a"] },
      { name: "c", dependsOn: ["a"] },
      { name: "d", dependsOn: ["b", "c"] },
    ]);
    assert(groups.length === 3, "3 groups");
    assert(groups[1].includes("b") && groups[1].includes("c"), "b,c parallel");
  });

  await test("Ex8: Duration calculator", () => {
    const dur = calculateDuration(
      [["install"], ["lint", "test"], ["build"]],
      { install: 1000, lint: 500, test: 2000, build: 1000 }
    );
    assert(dur === 4000, `expected 4000, got ${dur}`);
  });

  await test("Ex9: Env config builder", () => {
    const dev = new EnvConfigBuilder('development')
      .set("API", "http://localhost")
      .set("DEBUG", "true");
    const prod = new EnvConfigBuilder('production')
      .inherit(dev)
      .set("API", "https://api.com")
      .setSecret("DB_PASS", "secret");
    const built = prod.build();
    assert(built.variables.API === "https://api.com", "override");
    assert(built.variables.DEBUG === "true", "inherited");
    assert(built.secrets.includes("DB_PASS"), "secret tracked");
  });

  await test("Ex10: Retry handler", async () => {
    let count = 0;
    const result = await executeWithRetry("test", async () => { count++; return count >= 3; }, 3);
    assert(result.success, "succeeds");
    assert(result.attempts === 3, "3 attempts");
  });

  await test("Ex11: Conditional stage", () => {
    assert(shouldRunStage({ name: "notify", condition: "always" }, { build: "failure" }), "always runs");
    assert(!shouldRunStage({ name: "deploy" }, { build: "failure" }), "on-success default skips on failure");
    assert(shouldRunStage({ name: "alert", condition: "on-failure" }, { build: "failure" }), "on-failure runs");
  });

  await test("Ex12: Config validator", () => {
    const r1 = validatePipelineConfig({ name: "ci", stages: [{ name: "build", commands: ["make"] }] });
    assert(r1.valid, "valid config");
    const r2 = validatePipelineConfig({ stages: [] });
    assert(!r2.valid, "invalid");
    assert(r2.errors.length >= 2, "multiple errors");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
