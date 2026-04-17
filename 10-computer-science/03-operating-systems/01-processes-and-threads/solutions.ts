// ============================================================================
// SOLUTIONS: Processes & Threads
// Config: ES2022, strict, ESNext modules. Run with `npx tsx`.
// ============================================================================

import type {
  Process,
  SchedulerResult,
  WorkerMessage,
  WorkerResponse,
  TaskResult,
  Task,
  ThreadPoolStats,
  MemoryRegion,
  ProcessMemoryLayout,
  TaskRunnerConfig,
  TaskRunnerResult,
  SimProcess,
} from "./exercises.js";

// ============================================================================
// SOLUTION 1: Process State Transitions
// ============================================================================

function solution1_processStates(): string[] {
  return [
    "new",        // 1. Created
    "ready",      // added to ready queue
    "running",    // 2. Scheduler picks it
    "blocked",    // 3. Requests I/O
    "ready",      // 4. I/O completes
    "running",    // 5. Scheduler picks it again
    "terminated", // 6. Finishes execution
  ];
}

// ============================================================================
// SOLUTION 2: Round-Robin Scheduler
// ============================================================================

function solution2_roundRobinScheduler(
  processes: Process[],
  quantum: number
): SchedulerResult {
  const timeline: SchedulerResult["timeline"] = [];
  const queue: Process[] = processes.map((p) => ({ ...p }));
  const arrivals = new Map<number, number>(); // pid -> arrival time (0 for all)
  const completions = new Map<number, number>(); // pid -> completion time

  for (const p of queue) {
    arrivals.set(p.pid, 0);
  }

  let currentTime = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const execTime = Math.min(quantum, current.remainingTime);

    timeline.push({
      pid: current.pid,
      name: current.name,
      startTime: currentTime,
      endTime: currentTime + execTime,
    });

    currentTime += execTime;
    current.remainingTime -= execTime;

    if (current.remainingTime > 0) {
      current.state = "ready";
      queue.push(current);
    } else {
      current.state = "terminated";
      completions.set(current.pid, currentTime);
    }
  }

  // Calculate averages
  let totalWait = 0;
  let totalTurnaround = 0;

  for (const p of processes) {
    const arrival = arrivals.get(p.pid)!;
    const completion = completions.get(p.pid)!;
    const turnaround = completion - arrival;
    const wait = turnaround - p.burstTime;
    totalWait += wait;
    totalTurnaround += turnaround;
  }

  return {
    timeline,
    averageWaitTime: totalWait / processes.length,
    averageTurnaroundTime: totalTurnaround / processes.length,
  };
}

// ============================================================================
// SOLUTION 3: Thread vs Process Memory
// ============================================================================

function solution3_predictSharedCounter(): { min: number; max: number } {
  // Two threads each increment 1000 times.
  // counter++ is: load, add 1, store (3 operations, not atomic)
  //
  // Maximum (2000): No interleaving — runs sequentially.
  // Minimum (2): Worst case — both threads load 0, store 1 repeatedly,
  // except the very last increment from each thread lands.
  // Actually the true minimum is 2 because:
  // Thread A loads 0, Thread B runs 999 increments (counter=999),
  // Thread A stores 1, Thread A runs 999 more (counter=1000),
  // ... but the worst case with perfect interleaving gives 2.
  return { min: 2, max: 2000 };
}

// ============================================================================
// SOLUTION 4: postMessage Communication Simulator
// ============================================================================

class SolutionSimulatedWorker {
  private messageHandler: ((msg: WorkerMessage) => void) | null = null;
  private responseHandler: ((resp: WorkerResponse) => void) | null = null;
  private workerId: number;

  constructor(workerId: number) {
    this.workerId = workerId;
  }

  onMessage(handler: (msg: WorkerMessage) => void): void {
    this.messageHandler = handler;
  }

  onResponse(handler: (resp: WorkerResponse) => void): void {
    this.responseHandler = handler;
  }

  postMessage(msg: WorkerMessage): void {
    // Deep clone to simulate structured clone
    const cloned = JSON.parse(JSON.stringify(msg)) as WorkerMessage;
    // Async to simulate thread boundary
    queueMicrotask(() => {
      if (this.messageHandler) {
        this.messageHandler(cloned);
      }
    });
  }

  respond(result: unknown): void {
    const clonedResult = JSON.parse(JSON.stringify(result)) as unknown;
    queueMicrotask(() => {
      if (this.responseHandler) {
        this.responseHandler({
          type: "result",
          result: clonedResult,
          workerId: this.workerId,
        });
      }
    });
  }

  getWorkerId(): number {
    return this.workerId;
  }
}

// ============================================================================
// SOLUTION 5: Context Switch Cost
// ============================================================================

function solution5_predictTotalTime(): number {
  // A=8ms, B=3ms, C=12ms, quantum=5ms, switch=0.5ms
  // A runs 5ms (remaining 3) -> switch 0.5
  // B runs 3ms (done)         -> switch 0.5
  // C runs 5ms (remaining 7)  -> switch 0.5
  // A runs 3ms (done)         -> switch 0.5
  // C runs 5ms (remaining 2)  -> switch 0.5
  // C runs 2ms (done)
  // Total: 5+0.5+3+0.5+5+0.5+3+0.5+5+0.5+2 = 25.5
  return 25.5;
}

// ============================================================================
// SOLUTION 6: Fixed Priority Scheduler
// ============================================================================

function solution6_priorityScheduler(processes: Process[]): SchedulerResult {
  const timeline: SchedulerResult["timeline"] = [];
  const queue = processes.map((p) => ({ ...p }));
  let currentTime = 0;

  while (queue.length > 0) {
    // Fix 1: Sort ascending (lower number = higher priority)
    queue.sort((a, b) => a.priority - b.priority);

    const current = queue.shift()!;

    // Fix 2: Use remainingTime
    timeline.push({
      pid: current.pid,
      name: current.name,
      startTime: currentTime,
      endTime: currentTime + current.remainingTime,
    });

    // Fix 3: Add to currentTime, not assign
    currentTime += current.remainingTime;

    current.state = "terminated";
  }

  // Fix 4: Turnaround = endTime (completion) for each process
  const avgTurnaround =
    timeline.reduce((sum, t) => sum + t.endTime, 0) / timeline.length;

  const avgWait =
    timeline.reduce((sum, t) => sum + t.startTime, 0) / timeline.length;

  return {
    timeline,
    averageWaitTime: avgWait,
    averageTurnaroundTime: avgTurnaround,
  };
}

// ============================================================================
// SOLUTION 7: Thread Pool
// ============================================================================

class SolutionThreadPool {
  private poolSize: number;
  private taskQueue: Task[];
  private activeWorkers: number;
  private completedTasks: TaskResult[];
  private totalSubmitted: number;
  private onComplete: ((result: TaskResult) => void) | null;

  constructor(poolSize: number) {
    this.poolSize = poolSize;
    this.taskQueue = [];
    this.activeWorkers = 0;
    this.completedTasks = [];
    this.totalSubmitted = 0;
    this.onComplete = null;
  }

  submit(task: Task): void {
    this.totalSubmitted++;
    if (this.activeWorkers < this.poolSize) {
      this.executeTask(task);
    } else {
      this.taskQueue.push(task);
    }
  }

  onTaskComplete(callback: (result: TaskResult) => void): void {
    this.onComplete = callback;
  }

  getStats(): ThreadPoolStats {
    return {
      totalTasks: this.totalSubmitted,
      completedTasks: this.completedTasks.length,
      activeWorkers: this.activeWorkers,
      queuedTasks: this.taskQueue.length,
    };
  }

  private executeTask(task: Task): void {
    this.activeWorkers++;
    const workerId = this.activeWorkers;

    // Simulate async execution
    queueMicrotask(() => {
      const result = task.work();
      const taskResult: TaskResult = {
        taskId: task.id,
        result,
        workerId,
      };
      this.completedTasks.push(taskResult);
      this.activeWorkers--;

      if (this.onComplete) {
        this.onComplete(taskResult);
      }

      this.processNext();
    });
  }

  private processNext(): void {
    if (this.taskQueue.length > 0 && this.activeWorkers < this.poolSize) {
      const next = this.taskQueue.shift()!;
      this.executeTask(next);
    }
  }
}

// ============================================================================
// SOLUTION 8: Browser Process Architecture
// ============================================================================

function solution8_predictRendererProcesses(): number {
  // siteA.com -> 1 renderer
  // siteB.com -> 1 renderer
  // siteC.com -> 1 renderer
  // siteD.com (iframe in siteA) -> 1 renderer (site isolation)
  return 4;
}

// ============================================================================
// SOLUTION 9: Process Memory Layout Calculator
// ============================================================================

function solution9_calculateMemory(
  processes: ProcessMemoryLayout[]
): {
  perProcess: Array<{ pid: number; reportedMemory: number; uniqueMemory: number }>;
  totalSystemMemory: number;
  sharedMemorySavings: number;
} {
  const seenShared = new Map<string, number>(); // name -> size
  let totalUnique = 0;
  let totalSharedDuplicates = 0;

  const perProcess = processes.map((proc) => {
    let reported = 0;
    let unique = 0;

    for (const region of proc.regions) {
      reported += region.size;
      if (!region.shared) {
        unique += region.size;
      }
    }

    return { pid: proc.pid, reportedMemory: reported, uniqueMemory: unique };
  });

  // Calculate total system memory (shared counted once)
  for (const proc of processes) {
    for (const region of proc.regions) {
      if (region.shared) {
        if (!seenShared.has(region.name)) {
          seenShared.set(region.name, region.size);
        } else {
          totalSharedDuplicates += region.size;
        }
      } else {
        totalUnique += region.size;
      }
    }
  }

  let totalSharedOnce = 0;
  for (const size of seenShared.values()) {
    totalSharedOnce += size;
  }

  return {
    perProcess,
    totalSystemMemory: totalUnique + totalSharedOnce,
    sharedMemorySavings: totalSharedDuplicates,
  };
}

// ============================================================================
// SOLUTION 10: Fixed Worker Message Handler
// ============================================================================

type MessagePayload = { action: string; data: number[] };

function solution10_handleWorkerMessages(
  messages: WorkerMessage[]
): WorkerResponse[] {
  const responses: WorkerResponse[] = [];

  for (const msg of messages) {
    // Fix 1: Null check
    if (msg.payload === null || msg.payload === undefined) {
      responses.push({ type: "error", result: "invalid payload", workerId: 0 });
      continue;
    }

    const payload = msg.payload as MessagePayload;
    const action = payload.action;

    if (action === "sum") {
      const sum = payload.data.reduce((a, b) => a + b, 0);
      responses.push({ type: "result", result: sum, workerId: 0 });
    } else if (action === "max") {
      // Fix 3: Handle empty array
      if (payload.data.length === 0) {
        responses.push({ type: "error", result: "empty data array", workerId: 0 });
      } else {
        const max = Math.max(...payload.data);
        responses.push({ type: "result", result: max, workerId: 0 });
      }
    } else {
      // Fix 2: Handle unknown actions
      responses.push({
        type: "error",
        result: `unknown action: ${action}`,
        workerId: 0,
      });
    }
  }

  return responses;
}

// ============================================================================
// SOLUTION 11: Transferable Object Simulation
// ============================================================================

class SolutionTransferableBuffer {
  private data: number[];
  private transferred: boolean;

  constructor(data: number[]) {
    this.data = [...data];
    this.transferred = false;
  }

  getData(): number[] {
    if (this.transferred) {
      throw new Error("Buffer has been transferred");
    }
    return [...this.data];
  }

  getByteLength(): number {
    if (this.transferred) {
      return 0;
    }
    return this.data.length;
  }

  transfer(): number[] {
    if (this.transferred) {
      throw new Error("Buffer has already been transferred");
    }
    const result = this.data;
    this.data = [];
    this.transferred = true;
    return result;
  }
}

function solution11_simulateTransfer(
  source: SolutionTransferableBuffer
): { sourceLength: number; targetData: number[] } {
  const targetData = source.transfer();
  const sourceLength = source.getByteLength();
  return { sourceLength, targetData };
}

// ============================================================================
// SOLUTION 12: Event Order with Workers
// ============================================================================

function solution12_predictEventOrder(): string[] {
  return [
    "1: main start",
    "2: after postMessage",
    "6: main end",
    "4: microtask",
    "5: timeout",
    "3: received from worker: world",
  ];
}

// ============================================================================
// SOLUTION 13: Task Runner with Worker Simulation
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class SolutionTaskRunner {
  private config: TaskRunnerConfig;

  constructor(config: TaskRunnerConfig) {
    this.config = config;
  }

  async run(
    tasks: Array<{ id: number; work: () => Promise<unknown>; estimatedMs: number }>
  ): Promise<TaskRunnerResult> {
    const startTime = Date.now();
    const completed: TaskResult[] = [];
    const failed: Array<{ taskId: number; error: string }> = [];
    let workerIdCounter = 0;

    // Process tasks with concurrency limit
    const executing = new Set<Promise<void>>();

    for (const task of tasks) {
      const workerId = ++workerIdCounter;

      const taskPromise = (async () => {
        try {
          const result = await Promise.race([
            task.work(),
            delay(this.config.timeout).then(() => {
              throw new Error("timeout");
            }),
          ]);
          completed.push({ taskId: task.id, result, workerId });
        } catch (err) {
          failed.push({
            taskId: task.id,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();

      executing.add(taskPromise);
      taskPromise.then(() => executing.delete(taskPromise));

      if (executing.size >= this.config.maxConcurrent) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    return {
      completed,
      failed,
      totalTime: Date.now() - startTime,
    };
  }
}

// ============================================================================
// SOLUTION 14: Fixed Process Isolation
// ============================================================================

function solution14_createProcess(pid: number): SimProcess {
  return {
    pid,
    memory: new Map(),
  };
}

function solution14_writeMemory(
  proc: SimProcess,
  key: string,
  value: unknown
): void {
  proc.memory.set(key, value);
}

function solution14_readFromOtherProcess(
  reader: SimProcess,
  target: SimProcess,
  key: string
): unknown {
  // Fix: Throw memory access violation
  throw new Error(
    `Memory access violation: process ${reader.pid} cannot read memory of process ${target.pid}`
  );
}

function solution14_interProcessCommunication(
  sender: SimProcess,
  _receiver: SimProcess,
  key: string
): unknown {
  // Fix: Deep copy the value (simulate IPC serialization)
  const value = sender.memory.get(key);
  if (value === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value)) as unknown;
}

// ============================================================================
// SOLUTION 15: Priority Queue for Scheduler
// ============================================================================

class SolutionProcessPriorityQueue {
  private heap: Process[];

  constructor() {
    this.heap = [];
  }

  enqueue(process: Process): void {
    this.heap.push(process);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): Process | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  peek(): Process | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority <= this.heap[index].priority) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

// ============================================================================
// RUNNER
// ============================================================================

function runAllSolutions(): void {
  console.log("=== SOLUTION 1: Process State Transitions ===");
  console.log(solution1_processStates());

  console.log("\n=== SOLUTION 2: Round-Robin Scheduler ===");
  const procs2: Process[] = [
    { pid: 1, name: "P1", state: "ready", burstTime: 10, remainingTime: 10, priority: 1 },
    { pid: 2, name: "P2", state: "ready", burstTime: 4, remainingTime: 4, priority: 2 },
    { pid: 3, name: "P3", state: "ready", burstTime: 6, remainingTime: 6, priority: 3 },
  ];
  const result2 = solution2_roundRobinScheduler(procs2, 4);
  console.log("Timeline:", result2.timeline);
  console.log("Avg wait:", result2.averageWaitTime);
  console.log("Avg turnaround:", result2.averageTurnaroundTime);

  console.log("\n=== SOLUTION 3: Shared Counter Prediction ===");
  console.log(solution3_predictSharedCounter());

  console.log("\n=== SOLUTION 4: postMessage Simulator ===");
  const worker4 = new SolutionSimulatedWorker(1);
  worker4.onMessage((msg) => {
    if (msg.type === "square") {
      const num = msg.payload as number;
      worker4.respond(num * num);
    }
  });
  worker4.onResponse((resp) => {
    console.log(`Worker ${resp.workerId} result:`, resp.result);
  });
  worker4.postMessage({ type: "square", payload: 5 });

  console.log("\n=== SOLUTION 5: Context Switch Cost ===");
  console.log(solution5_predictTotalTime());

  console.log("\n=== SOLUTION 6: Fixed Priority Scheduler ===");
  const procs6: Process[] = [
    { pid: 1, name: "P1", state: "ready", burstTime: 6, remainingTime: 6, priority: 3 },
    { pid: 2, name: "P2", state: "ready", burstTime: 2, remainingTime: 2, priority: 1 },
    { pid: 3, name: "P3", state: "ready", burstTime: 4, remainingTime: 4, priority: 2 },
  ];
  console.log(solution6_priorityScheduler(procs6));

  console.log("\n=== SOLUTION 7: Thread Pool ===");
  const pool7 = new SolutionThreadPool(2);
  pool7.onTaskComplete((result) => console.log("Completed:", result));
  pool7.submit({ id: 1, work: () => "result1" });
  pool7.submit({ id: 2, work: () => "result2" });
  pool7.submit({ id: 3, work: () => "result3" });
  console.log("Stats:", pool7.getStats());

  console.log("\n=== SOLUTION 8: Renderer Processes ===");
  console.log(solution8_predictRendererProcesses());

  console.log("\n=== SOLUTION 9: Memory Layout ===");
  const procs9: ProcessMemoryLayout[] = [
    {
      pid: 1,
      regions: [
        { name: "heap", size: 100, shared: false },
        { name: "libc", size: 50, shared: true },
        { name: "libssl", size: 30, shared: true },
      ],
      totalMemory: 180,
    },
    {
      pid: 2,
      regions: [
        { name: "heap", size: 200, shared: false },
        { name: "libc", size: 50, shared: true },
      ],
      totalMemory: 250,
    },
  ];
  console.log(solution9_calculateMemory(procs9));

  console.log("\n=== SOLUTION 10: Fixed Worker Message Handler ===");
  const messages10: WorkerMessage[] = [
    { type: "compute", payload: { action: "sum", data: [1, 2, 3] } },
    { type: "compute", payload: null },
    { type: "compute", payload: { action: "unknown", data: [1] } },
    { type: "compute", payload: { action: "max", data: [] } },
    { type: "compute", payload: { action: "max", data: [5, 3, 8] } },
  ];
  console.log(solution10_handleWorkerMessages(messages10));

  console.log("\n=== SOLUTION 11: Transferable Buffer ===");
  const buf11 = new SolutionTransferableBuffer([1, 2, 3, 4, 5]);
  console.log("Before transfer:", buf11.getByteLength());
  const result11 = solution11_simulateTransfer(buf11);
  console.log(result11);
  try {
    buf11.getData();
  } catch (e) {
    console.log("After transfer getData():", (e as Error).message);
  }

  console.log("\n=== SOLUTION 12: Event Order ===");
  console.log(solution12_predictEventOrder());

  console.log("\n=== SOLUTION 13: Task Runner ===");
  const runner13 = new SolutionTaskRunner({ maxConcurrent: 2, timeout: 100 });
  runner13
    .run([
      { id: 1, work: async () => { await delay(10); return "fast"; }, estimatedMs: 10 },
      { id: 2, work: async () => { await delay(200); return "slow"; }, estimatedMs: 200 },
      { id: 3, work: async () => { await delay(20); return "medium"; }, estimatedMs: 20 },
    ])
    .then((result) => console.log("Task runner result:", result));

  console.log("\n=== SOLUTION 14: Process Isolation ===");
  const procA = solution14_createProcess(1);
  const procB = solution14_createProcess(2);
  solution14_writeMemory(procA, "secret", [1, 2, 3]);
  try {
    solution14_readFromOtherProcess(procB, procA, "secret");
  } catch (e) {
    console.log((e as Error).message);
  }
  const received = solution14_interProcessCommunication(procA, procB, "secret");
  const original = procA.memory.get("secret");
  console.log("Same reference?", received === original); // false

  console.log("\n=== SOLUTION 15: Priority Queue ===");
  const pq = new SolutionProcessPriorityQueue();
  pq.enqueue({ pid: 1, name: "Low", state: "ready", burstTime: 5, remainingTime: 5, priority: 10 });
  pq.enqueue({ pid: 2, name: "High", state: "ready", burstTime: 3, remainingTime: 3, priority: 1 });
  pq.enqueue({ pid: 3, name: "Med", state: "ready", burstTime: 4, remainingTime: 4, priority: 5 });
  console.log(pq.dequeue()?.name); // High
  console.log(pq.dequeue()?.name); // Med
  console.log(pq.dequeue()?.name); // Low
}

runAllSolutions();
