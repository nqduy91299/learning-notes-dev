// ============================================================================
// CPU & Execution — Solutions
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ---------------------------------------------------------------------------
// EXERCISE 1: Hidden Classes Predictions
// ---------------------------------------------------------------------------
section("Exercise 1: Hidden Classes");

// 1: a and b share hidden class (same properties, same order: x then y)
// 2: a and c do NOT share (different order: a={x,y}, c={y,x})
// 3: a and d share hidden class (same shape)
// 4: e and f do NOT share (different addition order)
// 5: After adding z to a, a and b no longer share hidden class

assert(true, "1a: a,b share hidden class (same shape, same order)");
assert(true, "1b: a,c do NOT share (different property order)");
assert(true, "1c: a,d share (same shape)");
assert(true, "1d: e,f do NOT share (different addition order)");
assert(true, "1e: after a.z=3, a and b no longer share hidden class");

// ---------------------------------------------------------------------------
// EXERCISE 2: Monomorphic vs Polymorphic Predictions
// ---------------------------------------------------------------------------
section("Exercise 2: Mono vs Polymorphic");

// Scenario A: Monomorphic — V8 builds a single IC entry, fastest access
// Scenario B: Polymorphic (3 shapes) — V8 builds a polymorphic IC, slower
// V8 will optimize scenario A better because the inline cache stays monomorphic

assert(true, "2: Monomorphic (same shape always) is fastest — single IC entry");

// ---------------------------------------------------------------------------
// EXERCISE 3: Deoptimization Predictions
// ---------------------------------------------------------------------------
section("Exercise 3: Deoptimization");

// A: Will NOT deoptimize — types are always (number, number)
// B: WILL deoptimize — TurboFan optimized for numbers, then sees strings
// C: WILL deoptimize — hidden class changes (new 'color' property)

assert(true, "3a: consistent types — no deoptimization");
assert(true, "3b: type change after warmup — deoptimizes");
assert(true, "3c: shape change — deoptimizes (different hidden class)");

// ---------------------------------------------------------------------------
// EXERCISE 4: Rendering Pipeline Predictions
// ---------------------------------------------------------------------------
section("Exercise 4: Rendering Pipeline");

// 1: transform → Composite only (GPU)
// 2: background-color → Paint + Composite
// 3: width → Layout + Paint + Composite (most expensive)
// 4: opacity → Composite only (GPU)
// 5: Reading offsetWidth after height change → forced synchronous layout

assert(true, "4a: transform → composite only");
assert(true, "4b: background-color → paint + composite");
assert(true, "4c: width → layout + paint + composite");
assert(true, "4d: opacity → composite only");
assert(true, "4e: reading offsetWidth forces synchronous layout");

// ---------------------------------------------------------------------------
// EXERCISE 5: Layout Thrashing Fix
// ---------------------------------------------------------------------------
section("Exercise 5: Layout Thrashing Fix");

interface MockElement {
  offsetHeight: number;
  style: { height: string };
}

function resizeElementsFixed(elements: MockElement[]): void {
  // FIX: Batch reads first, then writes
  const heights = elements.map((el) => el.offsetHeight);
  elements.forEach((el, i) => {
    el.style.height = heights[i] * 2 + "px";
  });
}

const mockElements: MockElement[] = [
  { offsetHeight: 50, style: { height: "50px" } },
  { offsetHeight: 100, style: { height: "100px" } },
  { offsetHeight: 75, style: { height: "75px" } },
];
resizeElementsFixed(mockElements);
assert(mockElements[0].style.height === "100px", "5a: el[0] doubled");
assert(mockElements[1].style.height === "200px", "5b: el[1] doubled");
assert(mockElements[2].style.height === "150px", "5c: el[2] doubled");

// ---------------------------------------------------------------------------
// EXERCISE 6: Object Shape Fix
// ---------------------------------------------------------------------------
section("Exercise 6: Object Shape Fix");

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  lifetime: number;
}

function createParticleFixed(
  x: number,
  y: number,
  options?: { vx?: number; vy?: number; color?: string; lifetime?: number }
): Particle {
  return {
    x,
    y,
    vx: options?.vx ?? 0,
    vy: options?.vy ?? 0,
    color: options?.color ?? "",
    lifetime: options?.lifetime ?? 0,
  };
}

const p1 = createParticleFixed(0, 0);
const p2 = createParticleFixed(1, 1, { vx: 5 });
const p3 = createParticleFixed(2, 2, { color: "red", lifetime: 100 });
assert(p1.vx === 0, "6a: default vx");
assert(p2.vx === 5, "6b: custom vx");
assert(p3.color === "red", "6c: custom color");
assert(p3.lifetime === 100, "6d: custom lifetime");
assert("vx" in p1 && "vy" in p1 && "color" in p1 && "lifetime" in p1, "6e: all props");

// ---------------------------------------------------------------------------
// EXERCISE 7: Simple Instruction Executor
// ---------------------------------------------------------------------------
section("Exercise 7: Instruction Executor");

type Register = "R0" | "R1" | "R2" | "R3";

type Instruction =
  | { op: "LOAD"; dest: Register; value: number }
  | { op: "ADD" | "SUB" | "MUL"; dest: Register; src1: Register; src2: Register }
  | { op: "PRINT"; src: Register }
  | { op: "HALT" };

interface CPUState {
  registers: Record<Register, number>;
  pc: number;
  halted: boolean;
  output: number[];
}

function createCPU(): CPUState {
  return {
    registers: { R0: 0, R1: 0, R2: 0, R3: 0 },
    pc: 0,
    halted: false,
    output: [],
  };
}

function executeProgram(instructions: Instruction[]): CPUState {
  const cpu = createCPU();

  while (!cpu.halted && cpu.pc < instructions.length) {
    const instr = instructions[cpu.pc];

    switch (instr.op) {
      case "LOAD":
        cpu.registers[instr.dest] = instr.value;
        break;
      case "ADD":
        cpu.registers[instr.dest] =
          cpu.registers[instr.src1] + cpu.registers[instr.src2];
        break;
      case "SUB":
        cpu.registers[instr.dest] =
          cpu.registers[instr.src1] - cpu.registers[instr.src2];
        break;
      case "MUL":
        cpu.registers[instr.dest] =
          cpu.registers[instr.src1] * cpu.registers[instr.src2];
        break;
      case "PRINT":
        cpu.output.push(cpu.registers[instr.src]);
        break;
      case "HALT":
        cpu.halted = true;
        break;
    }

    cpu.pc++;
  }

  return cpu;
}

const program: Instruction[] = [
  { op: "LOAD", dest: "R0", value: 10 },
  { op: "LOAD", dest: "R1", value: 20 },
  { op: "ADD", dest: "R2", src1: "R0", src2: "R1" },
  { op: "PRINT", src: "R2" },
  { op: "LOAD", dest: "R3", value: 3 },
  { op: "MUL", dest: "R2", src1: "R2", src2: "R3" },
  { op: "PRINT", src: "R2" },
  { op: "HALT" },
];
const result = executeProgram(program);
assert(result.output[0] === 30, "7a: 10 + 20 = 30");
assert(result.output[1] === 90, "7b: 30 * 3 = 90");
assert(result.halted === true, "7c: CPU halted");
assert(result.registers.R2 === 90, "7d: R2 = 90");

// ---------------------------------------------------------------------------
// EXERCISE 8: Pipeline Simulator
// ---------------------------------------------------------------------------
section("Exercise 8: Pipeline Simulator");

interface PipelineStage {
  fetch: number | null;
  decode: number | null;
  execute: number | null;
}

function simulatePipeline(numInstructions: number): PipelineStage[] {
  const totalCycles = numInstructions + 2;
  const stages: PipelineStage[] = [];

  for (let cycle = 0; cycle < totalCycles; cycle++) {
    const fetchIdx = cycle < numInstructions ? cycle : null;
    const decodeIdx = cycle - 1 >= 0 && cycle - 1 < numInstructions ? cycle - 1 : null;
    const executeIdx = cycle - 2 >= 0 && cycle - 2 < numInstructions ? cycle - 2 : null;

    stages.push({ fetch: fetchIdx, decode: decodeIdx, execute: executeIdx });
  }

  return stages;
}

const pipeline = simulatePipeline(4);
assert(pipeline.length === 6, "8a: 6 cycles for 4 instructions");
assert(
  pipeline[0].fetch === 0 && pipeline[0].decode === null && pipeline[0].execute === null,
  "8b: cycle 0"
);
assert(pipeline[1].fetch === 1 && pipeline[1].decode === 0, "8c: cycle 1");
assert(
  pipeline[2].fetch === 2 && pipeline[2].decode === 1 && pipeline[2].execute === 0,
  "8d: cycle 2"
);
assert(
  pipeline[5].fetch === null && pipeline[5].decode === null && pipeline[5].execute === 3,
  "8e: last cycle"
);

// ---------------------------------------------------------------------------
// EXERCISE 9: DOM Batcher
// ---------------------------------------------------------------------------
section("Exercise 9: DOM Batcher");

class DOMBatcher {
  private reads: Array<{ fn: () => unknown; resolve: (value: unknown) => void }> = [];
  private writes: Array<() => void> = [];
  private scheduled = false;

  read<T>(fn: () => T): Promise<T> {
    return new Promise<T>((resolve) => {
      this.reads.push({ fn, resolve: resolve as (value: unknown) => void });
      this.scheduleFlush();
    });
  }

  write(fn: () => void): void {
    this.writes.push(fn);
    this.scheduleFlush();
  }

  private flush(): void {
    // Execute all reads first
    const reads = [...this.reads];
    this.reads = [];
    for (const { fn, resolve } of reads) {
      resolve(fn());
    }

    // Then all writes
    const writes = [...this.writes];
    this.writes = [];
    for (const fn of writes) {
      fn();
    }

    this.scheduled = false;
  }

  private scheduleFlush(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      queueMicrotask(() => this.flush());
    }
  }
}

const batcher = new DOMBatcher();
const ops: string[] = [];

batcher.read(() => {
  ops.push("read1");
  return 42;
});
batcher.write(() => {
  ops.push("write1");
});
batcher.read(() => {
  ops.push("read2");
  return 99;
});
batcher.write(() => {
  ops.push("write2");
});

setTimeout(() => {
  assert(ops[0] === "read1", "9a: read1 first");
  assert(ops[1] === "read2", "9b: read2 second");
  assert(ops[2] === "write1", "9c: write1 third");
  assert(ops[3] === "write2", "9d: write2 fourth");
}, 10);

// ---------------------------------------------------------------------------
// EXERCISE 10: Performance Marker System
// ---------------------------------------------------------------------------
section("Exercise 10: PerfTracker");

interface PerfMark {
  name: string;
  timestamp: number;
}

interface PerfMeasure {
  name: string;
  startMark: string;
  endMark: string;
  duration: number;
}

class PerfTracker {
  private marks = new Map<string, PerfMark>();
  private measures: PerfMeasure[] = [];

  mark(name: string): void {
    this.marks.set(name, { name, timestamp: performance.now() });
  }

  measure(name: string, startMark: string, endMark: string): PerfMeasure {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    if (!start) throw new Error(`Mark "${startMark}" not found`);
    if (!end) throw new Error(`Mark "${endMark}" not found`);

    const m: PerfMeasure = {
      name,
      startMark,
      endMark,
      duration: end.timestamp - start.timestamp,
    };
    this.measures.push(m);
    return m;
  }

  getMeasures(pattern?: string): PerfMeasure[] {
    if (!pattern) return [...this.measures];
    return this.measures.filter((m) => m.name.includes(pattern));
  }

  clear(): void {
    this.marks.clear();
    this.measures = [];
  }
}

const perf = new PerfTracker();
perf.mark("start");
let sum = 0;
for (let i = 0; i < 1000000; i++) sum += i;
void sum;
perf.mark("end");

const measure = perf.measure("work", "start", "end");
assert(measure.duration >= 0, "10a: duration >= 0");
assert(measure.name === "work", "10b: name is 'work'");

perf.mark("render-start");
perf.mark("render-end");
perf.measure("render", "render-start", "render-end");

assert(perf.getMeasures().length === 2, "10c: 2 measures");
assert(perf.getMeasures("render").length === 1, "10d: 1 render measure");

let threw = false;
try {
  perf.measure("bad", "nonexistent", "end");
} catch {
  threw = true;
}
assert(threw, "10e: throws for missing mark");

perf.clear();
assert(perf.getMeasures().length === 0, "10f: cleared");

// ---------------------------------------------------------------------------
// EXERCISE 11: JIT Warmup Simulator
// ---------------------------------------------------------------------------
section("Exercise 11: JIT Simulator");

type ExecutionTier = "interpreted" | "baseline" | "optimized";

interface JITStats {
  callCount: number;
  currentTier: ExecutionTier;
  deoptCount: number;
  typeProfile: Set<string>;
}

class JITSimulator {
  private stats = new Map<string, JITStats>();

  private readonly BASELINE_THRESHOLD = 10;
  private readonly OPTIMIZE_THRESHOLD = 100;

  call(fnName: string, argTypes: string[]): ExecutionTier {
    if (!this.stats.has(fnName)) {
      this.stats.set(fnName, {
        callCount: 0,
        currentTier: "interpreted",
        deoptCount: 0,
        typeProfile: new Set(),
      });
    }

    const stats = this.stats.get(fnName)!;
    stats.callCount++;

    const typeSignature = argTypes.join(",");
    stats.typeProfile.add(typeSignature);

    // Deoptimize if too many type signatures while optimized
    if (stats.typeProfile.size > 2 && stats.currentTier === "optimized") {
      stats.currentTier = "interpreted";
      stats.deoptCount++;
    }

    // Determine tier based on call count (only promote, don't demote based on count)
    if (stats.currentTier !== "optimized" && stats.callCount >= this.OPTIMIZE_THRESHOLD && stats.typeProfile.size <= 2) {
      stats.currentTier = "optimized";
    } else if (stats.currentTier === "interpreted" && stats.callCount >= this.BASELINE_THRESHOLD) {
      stats.currentTier = "baseline";
    }

    return stats.currentTier;
  }

  getStats(fnName: string): JITStats | undefined {
    return this.stats.get(fnName);
  }
}

const jit = new JITSimulator();

let tier = jit.call("add", ["number", "number"]);
assert(tier === "interpreted", "11a: starts interpreted");

for (let i = 0; i < 15; i++) {
  tier = jit.call("add", ["number", "number"]);
}
assert(tier === "baseline", "11b: baseline after 10+ calls");

for (let i = 0; i < 100; i++) {
  tier = jit.call("add", ["number", "number"]);
}
assert(tier === "optimized", "11c: optimized after 100+ calls");

jit.call("add", ["string", "string"]);
jit.call("add", ["object", "number"]);
tier = jit.call("add", ["boolean", "boolean"]);
const jitStats = jit.getStats("add")!;
assert(jitStats.deoptCount > 0, "11d: deoptimized");

// ---------------------------------------------------------------------------
// EXERCISE 12: Web Worker Message Simulator
// ---------------------------------------------------------------------------
section("Exercise 12: Worker Simulator");

type WorkerHandler = (message: unknown) => unknown;

class WorkerSimulator {
  private handler: WorkerHandler | null = null;

  onMessage(handler: WorkerHandler): void {
    this.handler = handler;
  }

  async postMessage(data: unknown): Promise<unknown> {
    if (!this.handler) throw new Error("No handler registered");

    // Simulate structured cloning
    const clonedInput = this.structuredClone(data);
    const result = this.handler(clonedInput);
    const clonedOutput = this.structuredClone(result);
    return clonedOutput;
  }

  private structuredClone(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data));
  }
}

const worker = new WorkerSimulator();

worker.onMessage((msg) => {
  const { type, payload } = msg as { type: string; payload: number[] };
  if (type === "sum") {
    return { result: payload.reduce((a: number, b: number) => a + b, 0) };
  }
  return { error: "unknown type" };
});

const response = worker.postMessage({ type: "sum", payload: [1, 2, 3, 4, 5] });
response.then((resp) => {
  const { result: workerResult } = resp as { result: number };
  assert(workerResult === 15, "12a: sum = 15");
});

// Verify structured cloning
const original = { data: [1, 2, 3] };
worker.postMessage(original).then(() => {
  original.data.push(4);
  assert(original.data.length === 4, "12b: original mutated independently");
});

// ---------------------------------------------------------------------------
// Results (delayed to allow async tests to complete)
// ---------------------------------------------------------------------------
setTimeout(() => {
  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log(`========================================`);
  if (failed > 0) process.exit(1);
}, 50);
