// ============================================================
// CI/CD Fundamentals: What is CI/CD? — Solutions
// ============================================================
// Run: npx tsx 09-cicd/01-ci-fundamentals/01-what-is-ci-cd/solutions.ts
// ============================================================

// Solution 1: Pipeline Stage Type
export type PipelineStatus = 'pending' | 'running' | 'success' | 'failure' | 'skipped' | 'cancelled';

export type PipelineStage = {
  name: string;
  status: PipelineStatus;
  commands: string[];
  dependsOn: string[];
  timeoutMs?: number;
  manualApproval?: boolean;
  estimatedDurationMs?: number;
};

export const lintStage: PipelineStage = {
  name: "lint",
  status: "pending",
  commands: ["npm run lint"],
  dependsOn: ["install"],
};

// Solution 2: Pipeline Class
export class Pipeline {
  private stages: PipelineStage[] = [];

  constructor(public readonly name: string) {}

  addStage(stage: PipelineStage): void {
    this.stages.push(stage);
  }

  getStages(): PipelineStage[] {
    return [...this.stages];
  }

  getStage(name: string): PipelineStage | undefined {
    return this.stages.find(s => s.name === name);
  }

  getExecutionOrder(): string[] {
    const stageNames = new Set(this.stages.map(s => s.name));
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string): boolean => {
      if (visiting.has(name)) return false; // cycle
      if (visited.has(name)) return true;
      visiting.add(name);
      const stage = this.stages.find(s => s.name === name);
      if (!stage) return false;
      for (const dep of stage.dependsOn) {
        if (!stageNames.has(dep)) continue; // skip missing
        if (!visit(dep)) return false;
      }
      visiting.delete(name);
      visited.add(name);
      result.push(name);
      return true;
    };

    for (const stage of this.stages) {
      if (!visited.has(stage.name)) {
        visit(stage.name);
      }
    }
    return result;
  }
}

// Solution 3: Pipeline Status
export function getPipelineStatus(stages: PipelineStage[]): PipelineStatus {
  if (stages.some(s => s.status === 'failure')) return 'failure';
  if (stages.some(s => s.status === 'cancelled')) return 'cancelled';
  if (stages.some(s => s.status === 'running')) return 'running';
  if (stages.every(s => s.status === 'success' || s.status === 'skipped')) return 'success';
  return 'pending';
}

// Solution 4: Stage Dependency Validator
export function validateDependencies(stages: PipelineStage[]): string[] {
  const errors: string[] = [];
  const stageNames = new Set(stages.map(s => s.name));

  for (const stage of stages) {
    for (const dep of stage.dependsOn) {
      if (!stageNames.has(dep)) {
        errors.push(`Stage '${stage.name}' depends on unknown stage '${dep}'`);
      }
    }
  }

  // Check cycles using DFS
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const stageMap = new Map(stages.map(s => [s.name, s]));

  const hasCycle = (name: string): boolean => {
    if (visiting.has(name)) return true;
    if (visited.has(name)) return false;
    visiting.add(name);
    const stage = stageMap.get(name);
    if (stage) {
      for (const dep of stage.dependsOn) {
        if (stageNames.has(dep) && hasCycle(dep)) {
          errors.push(`Circular dependency detected involving stage '${name}'`);
          return true;
        }
      }
    }
    visiting.delete(name);
    visited.add(name);
    return false;
  };

  for (const stage of stages) {
    if (!visited.has(stage.name)) {
      hasCycle(stage.name);
    }
  }

  return errors;
}

// Solution 5: Pipeline Duration Estimator
export function estimatePipelineDuration(
  stages: Array<{ name: string; dependsOn: string[]; estimatedDurationMs: number }>
): number {
  const endTimes = new Map<string, number>();

  const getEndTime = (name: string): number => {
    if (endTimes.has(name)) return endTimes.get(name)!;
    const stage = stages.find(s => s.name === name);
    if (!stage) return 0;
    const startTime = stage.dependsOn.length > 0
      ? Math.max(...stage.dependsOn.map(d => getEndTime(d)))
      : 0;
    const end = startTime + stage.estimatedDurationMs;
    endTimes.set(name, end);
    return end;
  };

  return Math.max(...stages.map(s => getEndTime(s.name)), 0);
}

// Solution 6: CI vs CD Classifier
type ClassifiableStage = {
  name: string;
  commands: string[];
  dependsOn: string[];
  manualApproval?: boolean;
};

export function classifyPipeline(stages: ClassifiableStage[]): 'ci-only' | 'continuous-delivery' | 'continuous-deployment' {
  const deployStages = stages.filter(s => s.name.toLowerCase().includes('deploy'));
  if (deployStages.length === 0) return 'ci-only';
  if (deployStages.some(s => s.manualApproval)) return 'continuous-delivery';
  return 'continuous-deployment';
}

// Solution 7: Build Trigger Matcher
type TriggerConfig = {
  branches?: string[];
  events: Array<'push' | 'pull_request' | 'schedule' | 'manual'>;
  paths?: string[];
};

type GitEvent = {
  type: 'push' | 'pull_request' | 'schedule' | 'manual';
  branch: string;
  changedFiles: string[];
};

function matchGlob(pattern: string, value: string): boolean {
  const parts = pattern.split('*');
  if (parts.length === 1) return pattern === value;
  if (parts.length === 2) {
    return value.startsWith(parts[0]) && value.endsWith(parts[1]) && !value.slice(parts[0].length, value.length - (parts[1].length || undefined)).includes('/');
  }
  return false;
}

export function shouldTrigger(trigger: TriggerConfig, event: GitEvent): boolean {
  if (!trigger.events.includes(event.type)) return false;
  if (trigger.branches) {
    const branchMatch = trigger.branches.some(b => matchGlob(b, event.branch));
    if (!branchMatch) return false;
  }
  if (trigger.paths) {
    const pathMatch = event.changedFiles.some(f =>
      trigger.paths!.some(p => f.startsWith(p))
    );
    if (!pathMatch) return false;
  }
  return true;
}

// Solution 8: Pipeline Retry Logic
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries: number, delayMs: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries) await delay(delayMs);
    }
  }
  throw lastError;
}

// Solution 9: Artifact Manager
export class ArtifactManager {
  private artifacts = new Map<string, { data: string; uploadedAt: Date; metadata?: Record<string, string> }>();

  upload(name: string, data: string, metadata?: Record<string, string>): void {
    this.artifacts.set(name, { data, uploadedAt: new Date(), metadata });
  }

  download(name: string): string | undefined {
    return this.artifacts.get(name)?.data;
  }

  list(): Array<{ name: string; size: number; uploadedAt: Date; metadata?: Record<string, string> }> {
    return Array.from(this.artifacts.entries()).map(([name, a]) => ({
      name,
      size: a.data.length,
      uploadedAt: a.uploadedAt,
      metadata: a.metadata,
    }));
  }

  delete(name: string): boolean {
    return this.artifacts.delete(name);
  }

  getTotalSize(): number {
    let total = 0;
    for (const a of this.artifacts.values()) total += a.data.length;
    return total;
  }
}

// Solution 10: Pipeline Event Emitter
export class PipelineEventEmitter {
  private listeners = new Map<string, Array<(...args: unknown[]) => void>>();

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: unknown[]): void {
    const cbs = this.listeners.get(event);
    if (cbs) cbs.forEach(cb => cb(...args));
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    const cbs = this.listeners.get(event);
    if (cbs) {
      this.listeners.set(event, cbs.filter(cb => cb !== callback));
    }
  }
}

// Solution 11: Environment Config Resolver
export function resolveConfig(
  base: Record<string, string>,
  overrides: Record<string, Record<string, string>>,
  env: string
): Record<string, string> {
  return { ...base, ...(overrides[env] || {}) };
}

// Solution 12: Pipeline Step Output Parser
export function parseStepOutput(output: string): {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
} {
  const lines = output.split('\n');
  const result = { exitCode: 1, stdout: "", stderr: "", durationMs: 0 };
  for (const line of lines) {
    if (line.startsWith('EXIT:')) result.exitCode = parseInt(line.slice(5), 10);
    else if (line.startsWith('STDOUT:')) result.stdout = line.slice(7);
    else if (line.startsWith('STDERR:')) result.stderr = line.slice(7);
    else if (line.startsWith('DURATION:')) result.durationMs = parseInt(line.slice(9), 10);
  }
  return result;
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
  const test = (name: string, fn: () => void | Promise<void>) => {
    return Promise.resolve()
      .then(() => fn())
      .then(() => { passed++; console.log(`  ✓ ${name}`); })
      .catch(e => { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); });
  };

  console.log("\n01-what-is-ci-cd Solutions\n");

  await test("Ex1: PipelineStage type", () => {
    assert(lintStage.name === "lint", "name should be lint");
    assert(lintStage.status === "pending", "status should be pending");
    assert(lintStage.dependsOn[0] === "install", "should depend on install");
  });

  await test("Ex2: Pipeline class", () => {
    const p = new Pipeline("test");
    p.addStage({ name: "install", status: "pending", commands: ["npm ci"], dependsOn: [] });
    p.addStage({ name: "lint", status: "pending", commands: ["npm run lint"], dependsOn: ["install"] });
    p.addStage({ name: "test", status: "pending", commands: ["npm test"], dependsOn: ["install"] });
    p.addStage({ name: "build", status: "pending", commands: ["npm run build"], dependsOn: ["lint", "test"] });
    const order = p.getExecutionOrder();
    assert(order.indexOf("install") < order.indexOf("lint"), "install before lint");
    assert(order.indexOf("install") < order.indexOf("test"), "install before test");
    assert(order.indexOf("lint") < order.indexOf("build"), "lint before build");
  });

  await test("Ex3: Pipeline status", () => {
    assert(getPipelineStatus([{ name: "a", status: "success", commands: [], dependsOn: [] }]) === "success", "all success");
    assert(getPipelineStatus([
      { name: "a", status: "success", commands: [], dependsOn: [] },
      { name: "b", status: "failure", commands: [], dependsOn: [] },
    ]) === "failure", "any failure");
    assert(getPipelineStatus([
      { name: "a", status: "running", commands: [], dependsOn: [] },
    ]) === "running", "running");
    assert(getPipelineStatus([
      { name: "a", status: "pending", commands: [], dependsOn: [] },
    ]) === "pending", "pending");
  });

  await test("Ex4: Validate dependencies", () => {
    const errors = validateDependencies([
      { name: "build", status: "pending", commands: [], dependsOn: ["nonexistent"] },
    ]);
    assert(errors.some(e => e.includes("unknown stage 'nonexistent'")), "should detect missing dep");
  });

  await test("Ex5: Pipeline duration estimator", () => {
    const dur = estimatePipelineDuration([
      { name: "install", dependsOn: [], estimatedDurationMs: 1000 },
      { name: "lint", dependsOn: ["install"], estimatedDurationMs: 500 },
      { name: "test", dependsOn: ["install"], estimatedDurationMs: 2000 },
      { name: "build", dependsOn: ["lint", "test"], estimatedDurationMs: 1000 },
    ]);
    // Critical path: install(1000) → test(2000) → build(1000) = 4000
    assert(dur === 4000, `Expected 4000, got ${dur}`);
  });

  await test("Ex6: Classify pipeline", () => {
    assert(classifyPipeline([{ name: "lint", commands: [], dependsOn: [] }]) === "ci-only", "no deploy = ci-only");
    assert(classifyPipeline([{ name: "deploy", commands: [], dependsOn: [], manualApproval: true }]) === "continuous-delivery", "manual = delivery");
    assert(classifyPipeline([{ name: "deploy", commands: [], dependsOn: [] }]) === "continuous-deployment", "auto = deployment");
  });

  await test("Ex7: Trigger matcher", () => {
    const trigger: TriggerConfig = { events: ["push"], branches: ["main", "feature/*"], paths: ["src/"] };
    assert(shouldTrigger(trigger, { type: "push", branch: "main", changedFiles: ["src/index.ts"] }), "should match");
    assert(!shouldTrigger(trigger, { type: "push", branch: "main", changedFiles: ["docs/readme.md"] }), "path mismatch");
    assert(!shouldTrigger(trigger, { type: "pull_request", branch: "main", changedFiles: ["src/index.ts"] }), "event mismatch");
    assert(shouldTrigger(trigger, { type: "push", branch: "feature/foo", changedFiles: ["src/x.ts"] }), "glob match");
  });

  await test("Ex8: Retry logic", async () => {
    let attempts = 0;
    const result = await runWithRetry(async () => {
      attempts++;
      if (attempts < 3) throw new Error("fail");
      return "ok";
    }, 3, 1);
    assert(result === "ok", "should succeed on 3rd attempt");
    assert(attempts === 3, "should have tried 3 times");
  });

  await test("Ex9: Artifact manager", () => {
    const am = new ArtifactManager();
    am.upload("build.zip", "binary-data-here", { version: "1.0" });
    assert(am.download("build.zip") === "binary-data-here", "download");
    assert(am.list().length === 1, "list");
    assert(am.getTotalSize() === 16, "size");
    assert(am.delete("build.zip"), "delete");
    assert(am.list().length === 0, "empty after delete");
  });

  await test("Ex10: Event emitter", () => {
    const emitter = new PipelineEventEmitter();
    let called = false;
    const cb = () => { called = true; };
    emitter.on("stage:start", cb);
    emitter.emit("stage:start");
    assert(called, "callback should be called");
    called = false;
    emitter.off("stage:start", cb);
    emitter.emit("stage:start");
    assert(!called, "callback should not be called after off");
  });

  await test("Ex11: Config resolver", () => {
    const result = resolveConfig(
      { API: "http://localhost", DEBUG: "true" },
      { production: { API: "https://api.com", DEBUG: "false" } },
      "production"
    );
    assert(result.API === "https://api.com", "override applied");
    assert(result.DEBUG === "false", "debug overridden");
  });

  await test("Ex12: Step output parser", () => {
    const result = parseStepOutput("EXIT:0\nSTDOUT:hello world\nSTDERR:\nDURATION:1234");
    assert(result.exitCode === 0, "exit code");
    assert(result.stdout === "hello world", "stdout");
    assert(result.durationMs === 1234, "duration");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
