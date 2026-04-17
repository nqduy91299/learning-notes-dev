// ============================================================================
// CPU & Execution — Exercises
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 12 exercises: 4 predict, 2 fix, 6 implement
// ============================================================================

// ---------------------------------------------------------------------------
// EXERCISE 1 (Predict): Hidden Classes / Object Shapes
// ---------------------------------------------------------------------------
// V8 assigns hidden classes based on object shape. Predict which objects
// share the same hidden class.

function exercise1() {
  const a = { x: 1, y: 2 };
  const b = { x: 3, y: 4 };
  const c = { y: 1, x: 2 };
  const d = { x: 5, y: 6 };

  // Prediction 1: Do `a` and `b` share the same hidden class? → ???
  // Prediction 2: Do `a` and `c` share the same hidden class? → ???
  // Prediction 3: Do `a` and `d` share the same hidden class? → ???

  const e: Record<string, number> = {};
  e.x = 1;
  e.y = 2;

  const f: Record<string, number> = {};
  f.y = 1;
  f.x = 2;

  // Prediction 4: Do `e` and `f` share the same hidden class? → ???
  // (Hint: property addition ORDER matters for hidden class transitions)

  // Prediction 5: Does adding a property to `a` later affect `b`?
  (a as Record<string, number>).z = 3;
  // After this, do `a` and `b` share the same hidden class? → ???
}
exercise1();

// ---------------------------------------------------------------------------
// EXERCISE 2 (Predict): Monomorphic vs Polymorphic Performance
// ---------------------------------------------------------------------------
// V8's inline caches work best when the same code sees the same object shapes.

function exercise2() {
  function getX(obj: { x: number; [key: string]: number }): number {
    return obj.x;
  }

  // Scenario A: Monomorphic — always same shape
  const monoResults: number[] = [];
  for (let i = 0; i < 1000; i++) {
    monoResults.push(getX({ x: i, y: i }));
  }

  // Scenario B: Polymorphic — 3 different shapes
  const polyResults: number[] = [];
  for (let i = 0; i < 1000; i++) {
    if (i % 3 === 0) polyResults.push(getX({ x: i, y: i }));
    else if (i % 3 === 1) polyResults.push(getX({ x: i, y: i, z: i }));
    else polyResults.push(getX({ x: i }));
  }

  // Prediction: Which scenario will V8 optimize better? Why?
  // What kind of inline cache state will each scenario produce?

  void monoResults;
  void polyResults;
}
exercise2();

// ---------------------------------------------------------------------------
// EXERCISE 3 (Predict): Deoptimization Triggers
// ---------------------------------------------------------------------------
// Predict which of these functions will cause V8 to deoptimize.

function exercise3() {
  // Function A: Consistent types
  function addNumbers(a: number, b: number): number {
    return a + b;
  }
  for (let i = 0; i < 10000; i++) {
    addNumbers(i, i + 1);
  }
  // Prediction: Will this deoptimize? → ???

  // Function B: Type change after warmup
  function addAnything(a: number | string, b: number | string): number | string {
    return (a as number) + (b as number);
  }
  for (let i = 0; i < 10000; i++) {
    addAnything(i, i + 1);  // All numbers during warmup
  }
  addAnything("hello", " world");  // Suddenly strings!
  // Prediction: Will this deoptimize? → ???

  // Function C: Changing object shape
  function getArea(rect: { width: number; height: number; [key: string]: unknown }): number {
    return rect.width * rect.height;
  }
  for (let i = 0; i < 10000; i++) {
    getArea({ width: i, height: i });
  }
  getArea({ width: 5, height: 10, color: "red" });  // New property!
  // Prediction: Will this deoptimize? → ???
}
exercise3();

// ---------------------------------------------------------------------------
// EXERCISE 4 (Predict): Rendering Pipeline
// ---------------------------------------------------------------------------
// Predict which CSS property changes trigger which pipeline stages.
// Layout → Paint → Composite

// Prediction 1: Changing `transform: translateX(100px)` triggers which stages?
// → ???

// Prediction 2: Changing `background-color: red` triggers which stages?
// → ???

// Prediction 3: Changing `width: 200px` triggers which stages?
// → ???

// Prediction 4: Changing `opacity: 0.5` triggers which stages?
// → ???

// Prediction 5: Reading `offsetWidth` after changing `height` — what happens?
// → ???

// ---------------------------------------------------------------------------
// EXERCISE 5 (Fix): Layout Thrashing
// ---------------------------------------------------------------------------
// This code reads and writes to the DOM in an interleaved pattern, causing
// forced synchronous layouts on every iteration. Fix it.

interface MockElement {
  offsetHeight: number;
  style: { height: string };
}

function resizeElements(elements: MockElement[]): void {
  // BUG: Layout thrashing — each read forces a relayout after the previous write
  for (const el of elements) {
    const currentHeight = el.offsetHeight;         // READ: forces layout
    el.style.height = (currentHeight * 2) + "px";  // WRITE: invalidates layout
  }
}

// FIX: Batch all reads first, then all writes

function resizeElementsFixed(elements: MockElement[]): void {
  // YOUR FIX HERE
  for (const el of elements) {
    const currentHeight = el.offsetHeight;
    el.style.height = (currentHeight * 2) + "px";
  }
}

// Tests:
// const mockElements: MockElement[] = [
//   { offsetHeight: 50, style: { height: "50px" } },
//   { offsetHeight: 100, style: { height: "100px" } },
//   { offsetHeight: 75, style: { height: "75px" } },
// ];
// resizeElementsFixed(mockElements);
// console.assert(mockElements[0].style.height === "100px", "5a: el[0] doubled");
// console.assert(mockElements[1].style.height === "200px", "5b: el[1] doubled");
// console.assert(mockElements[2].style.height === "150px", "5c: el[2] doubled");
// console.log("5: Layout thrashing fixed");

// ---------------------------------------------------------------------------
// EXERCISE 6 (Fix): Object Shape Polymorphism
// ---------------------------------------------------------------------------
// This factory creates objects with inconsistent shapes, causing megamorphic
// inline caches. Fix it so all objects have the same hidden class.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  lifetime: number;
}

function createParticle(
  x: number,
  y: number,
  options?: { vx?: number; vy?: number; color?: string; lifetime?: number }
): Particle {
  // BUG: Conditional property assignment creates different hidden classes
  const p: Partial<Particle> = { x, y };
  if (options?.vx !== undefined) p.vx = options.vx;
  if (options?.vy !== undefined) p.vy = options.vy;
  if (options?.color) p.color = options.color;
  if (options?.lifetime) p.lifetime = options.lifetime;
  return p as Particle;
}

// FIX: Always create objects with ALL properties, use defaults

function createParticleFixed(
  x: number,
  y: number,
  options?: { vx?: number; vy?: number; color?: string; lifetime?: number }
): Particle {
  // YOUR FIX HERE
  return { x, y, vx: 0, vy: 0, color: "", lifetime: 0 };
}

// Tests:
// const p1 = createParticleFixed(0, 0);
// const p2 = createParticleFixed(1, 1, { vx: 5 });
// const p3 = createParticleFixed(2, 2, { color: "red", lifetime: 100 });
// console.assert(p1.vx === 0, "6a: default vx");
// console.assert(p2.vx === 5, "6b: custom vx");
// console.assert(p3.color === "red", "6c: custom color");
// console.assert(p3.lifetime === 100, "6d: custom lifetime");
// // All should have same properties in same order → same hidden class
// console.assert("vx" in p1 && "vy" in p1 && "color" in p1 && "lifetime" in p1, "6e: all props present");
// console.log("6: Object shape fixed");

// ---------------------------------------------------------------------------
// EXERCISE 7 (Implement): Simple Instruction Executor
// ---------------------------------------------------------------------------
// Implement a simple virtual CPU that executes a set of instructions.
// Registers: R0–R3 (4 general-purpose registers)
// Instructions:
//   LOAD  Rx, value   — Load immediate value into register
//   ADD   Rx, Ry, Rz  — Rx = Ry + Rz
//   SUB   Rx, Ry, Rz  — Rx = Ry - Rz
//   MUL   Rx, Ry, Rz  — Rx = Ry * Rz
//   PRINT Rx           — Output register value
//   HALT               — Stop execution

type Register = "R0" | "R1" | "R2" | "R3";

type Instruction =
  | { op: "LOAD"; dest: Register; value: number }
  | { op: "ADD" | "SUB" | "MUL"; dest: Register; src1: Register; src2: Register }
  | { op: "PRINT"; src: Register }
  | { op: "HALT" };

interface CPUState {
  registers: Record<Register, number>;
  pc: number; // program counter
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

  // YOUR CODE HERE
  // Implement the fetch-decode-execute cycle:
  // 1. While not halted and pc < instructions.length:
  // 2. Fetch instruction at pc
  // 3. Decode and execute it
  // 4. Increment pc

  return cpu;
}

// Tests:
// const program: Instruction[] = [
//   { op: "LOAD", dest: "R0", value: 10 },
//   { op: "LOAD", dest: "R1", value: 20 },
//   { op: "ADD", dest: "R2", src1: "R0", src2: "R1" },
//   { op: "PRINT", src: "R2" },
//   { op: "LOAD", dest: "R3", value: 3 },
//   { op: "MUL", dest: "R2", src1: "R2", src2: "R3" },
//   { op: "PRINT", src: "R2" },
//   { op: "HALT" },
// ];
// const result = executeProgram(program);
// console.assert(result.output[0] === 30, "7a: 10 + 20 = 30");
// console.assert(result.output[1] === 90, "7b: 30 * 3 = 90");
// console.assert(result.halted === true, "7c: CPU halted");
// console.assert(result.registers.R2 === 90, "7d: R2 = 90");
// console.log("7: Instruction executor working");

// ---------------------------------------------------------------------------
// EXERCISE 8 (Implement): Pipeline Simulator
// ---------------------------------------------------------------------------
// Simulate a 3-stage instruction pipeline (Fetch, Decode, Execute).
// Show which instructions are in which stage at each clock cycle.

interface PipelineStage {
  fetch: number | null;    // instruction index being fetched
  decode: number | null;   // instruction index being decoded
  execute: number | null;  // instruction index being executed
}

function simulatePipeline(numInstructions: number): PipelineStage[] {
  // YOUR CODE HERE
  // Return an array of pipeline states, one per clock cycle.
  // With 3 stages, processing N instructions takes N + 2 cycles.
  //
  // Cycle 0: Fetch I0
  // Cycle 1: Fetch I1, Decode I0
  // Cycle 2: Fetch I2, Decode I1, Execute I0
  // Cycle 3: Fetch I3, Decode I2, Execute I1
  // ...
  // Cycle N+1: Decode I(N-1), Execute I(N-2)
  // Cycle N+2: Execute I(N-1)

  return [];
}

// Tests:
// const pipeline = simulatePipeline(4);
// // 4 instructions need 6 cycles (4 + 2)
// console.assert(pipeline.length === 6, "8a: 6 cycles for 4 instructions");
// console.assert(pipeline[0].fetch === 0 && pipeline[0].decode === null && pipeline[0].execute === null, "8b: cycle 0");
// console.assert(pipeline[1].fetch === 1 && pipeline[1].decode === 0, "8c: cycle 1");
// console.assert(pipeline[2].fetch === 2 && pipeline[2].decode === 1 && pipeline[2].execute === 0, "8d: cycle 2");
// console.assert(pipeline[5].fetch === null && pipeline[5].decode === null && pipeline[5].execute === 3, "8e: last cycle");
// console.log("8: Pipeline simulator working");

// ---------------------------------------------------------------------------
// EXERCISE 9 (Implement): Batch DOM Operations
// ---------------------------------------------------------------------------
// Implement a batching system that groups DOM reads and writes to avoid
// layout thrashing. This simulates the pattern used by libraries like FastDOM.

type DOMOperation = {
  type: "read";
  fn: () => unknown;
  result?: unknown;
} | {
  type: "write";
  fn: () => void;
};

class DOMBatcher {
  private reads: Array<{ fn: () => unknown; resolve: (value: unknown) => void }> = [];
  private writes: Array<() => void> = [];
  private scheduled = false;

  // IMPLEMENT: Schedule a read operation, return a promise for the result
  read<T>(fn: () => T): Promise<T> {
    // YOUR CODE HERE
    return Promise.resolve(fn());
  }

  // IMPLEMENT: Schedule a write operation
  write(fn: () => void): void {
    // YOUR CODE HERE
    fn();
  }

  // IMPLEMENT: Flush all batched operations (reads first, then writes)
  private flush(): void {
    // YOUR CODE HERE
    // 1. Execute all reads
    // 2. Execute all writes
    // 3. Reset scheduled flag
  }

  private scheduleFlush(): void {
    if (!this.scheduled) {
      this.scheduled = true;
      // Use microtask to batch operations within the same synchronous block
      queueMicrotask(() => this.flush());
    }
  }
}

// Tests:
// const batcher = new DOMBatcher();
// const ops: string[] = [];
//
// batcher.read(() => { ops.push("read1"); return 42; });
// batcher.write(() => { ops.push("write1"); });
// batcher.read(() => { ops.push("read2"); return 99; });
// batcher.write(() => { ops.push("write2"); });
//
// // Operations haven't run yet (batched)
// await new Promise(r => queueMicrotask(r));
// await new Promise(r => queueMicrotask(r)); // double flush to ensure completion
//
// // Reads should execute before writes
// console.assert(ops[0] === "read1", "9a: read1 first");
// console.assert(ops[1] === "read2", "9b: read2 second");
// console.assert(ops[2] === "write1", "9c: write1 third");
// console.assert(ops[3] === "write2", "9d: write2 fourth");
// console.log("9: DOM batcher working");

// ---------------------------------------------------------------------------
// EXERCISE 10 (Implement): Performance Marker System
// ---------------------------------------------------------------------------
// Implement a performance measurement system using high-resolution timing.
// This simulates the User Timing API (performance.mark/measure).

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
  private marks: Map<string, PerfMark> = new Map();
  private measures: PerfMeasure[] = [];
  private startTime = performance.now();

  // IMPLEMENT: Record a named timestamp
  mark(name: string): void {
    // YOUR CODE HERE
  }

  // IMPLEMENT: Measure duration between two marks
  measure(name: string, startMark: string, endMark: string): PerfMeasure {
    // YOUR CODE HERE
    // Throw Error if either mark doesn't exist
    return { name, startMark, endMark, duration: 0 };
  }

  // IMPLEMENT: Get all measures, optionally filtered by name pattern
  getMeasures(pattern?: string): PerfMeasure[] {
    // YOUR CODE HERE
    return [];
  }

  // IMPLEMENT: Clear all marks and measures
  clear(): void {
    // YOUR CODE HERE
  }
}

// Tests:
// const perf = new PerfTracker();
// perf.mark("start");
// // Simulate work
// let sum = 0;
// for (let i = 0; i < 1000000; i++) sum += i;
// perf.mark("end");
//
// const measure = perf.measure("work", "start", "end");
// console.assert(measure.duration > 0, "10a: duration > 0");
// console.assert(measure.name === "work", "10b: name is 'work'");
//
// perf.mark("render-start");
// perf.mark("render-end");
// perf.measure("render", "render-start", "render-end");
//
// const allMeasures = perf.getMeasures();
// console.assert(allMeasures.length === 2, "10c: 2 measures");
//
// const renderMeasures = perf.getMeasures("render");
// console.assert(renderMeasures.length === 1, "10d: 1 render measure");
//
// let threw = false;
// try { perf.measure("bad", "nonexistent", "end"); } catch { threw = true; }
// console.assert(threw, "10e: throws for missing mark");
//
// perf.clear();
// console.assert(perf.getMeasures().length === 0, "10f: cleared");
// console.log("10: PerfTracker working");

// ---------------------------------------------------------------------------
// EXERCISE 11 (Implement): JIT Warmup Simulator
// ---------------------------------------------------------------------------
// Simulate the concept of JIT warmup: a function starts slow (interpreted),
// gets faster after repeated calls (compiled), and may deoptimize if types change.

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

  // IMPLEMENT: Record a function call with the types of its arguments
  call(fnName: string, argTypes: string[]): ExecutionTier {
    // YOUR CODE HERE
    // 1. Get or create stats for this function
    // 2. Increment call count
    // 3. Add argument type signature to the type profile
    // 4. If type profile has > 2 entries and tier is "optimized", deoptimize
    // 5. Determine tier based on call count thresholds
    // 6. Return current tier
    return "interpreted";
  }

  getStats(fnName: string): JITStats | undefined {
    return this.stats.get(fnName);
  }
}

// Tests:
// const jit = new JITSimulator();
//
// // Cold start — interpreted
// let tier = jit.call("add", ["number", "number"]);
// console.assert(tier === "interpreted", "11a: starts interpreted");
//
// // Warmup to baseline
// for (let i = 0; i < 15; i++) {
//   tier = jit.call("add", ["number", "number"]);
// }
// console.assert(tier === "baseline", "11b: baseline after 10+ calls");
//
// // Warmup to optimized
// for (let i = 0; i < 100; i++) {
//   tier = jit.call("add", ["number", "number"]);
// }
// console.assert(tier === "optimized", "11c: optimized after 100+ calls");
//
// // Deoptimize by changing types
// jit.call("add", ["string", "string"]);
// jit.call("add", ["object", "number"]);
// tier = jit.call("add", ["boolean", "boolean"]);
// const stats = jit.getStats("add")!;
// console.assert(stats.deoptCount > 0, "11d: deoptimized");
// console.log("11: JIT simulator working");

// ---------------------------------------------------------------------------
// EXERCISE 12 (Implement): Web Worker Message Simulator
// ---------------------------------------------------------------------------
// Simulate the Web Worker messaging pattern with structured cloning.
// Real Workers use postMessage/onmessage — we simulate the async message passing.

type WorkerHandler = (message: unknown) => unknown;

class WorkerSimulator {
  private handler: WorkerHandler | null = null;
  private messageQueue: Array<{
    data: unknown;
    resolve: (value: unknown) => void;
  }> = [];

  // IMPLEMENT: Register the worker's message handler
  onMessage(handler: WorkerHandler): void {
    // YOUR CODE HERE
  }

  // IMPLEMENT: Send a message to the worker and get a response
  // Must simulate structured cloning (deep copy) of the message
  async postMessage(data: unknown): Promise<unknown> {
    // YOUR CODE HERE
    // 1. Deep clone the data (simulate structured cloning)
    // 2. Pass cloned data to the handler
    // 3. Deep clone the response
    // 4. Return the cloned response
    return undefined;
  }

  // Simulate structured cloning (deep copy using JSON for simplicity)
  private structuredClone(data: unknown): unknown {
    return JSON.parse(JSON.stringify(data));
  }
}

// Tests:
// const worker = new WorkerSimulator();
//
// worker.onMessage((msg) => {
//   const { type, payload } = msg as { type: string; payload: number[] };
//   if (type === "sum") {
//     return { result: payload.reduce((a, b) => a + b, 0) };
//   }
//   return { error: "unknown type" };
// });
//
// const response = await worker.postMessage({ type: "sum", payload: [1, 2, 3, 4, 5] });
// const { result } = response as { result: number };
// console.assert(result === 15, "12a: sum = 15");
//
// // Verify structured cloning (mutation shouldn't affect original)
// const original = { data: [1, 2, 3] };
// const resp = await worker.postMessage(original);
// original.data.push(4);
// // The worker received a clone, so original mutation doesn't affect it
// console.log("12: Worker simulator working");

// ---------------------------------------------------------------------------
// Compile check
// ---------------------------------------------------------------------------
console.log("exercises.ts compiled successfully — uncomment tests to verify your solutions.");
