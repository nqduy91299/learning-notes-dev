// ============================================================================
// EXERCISES: Processes & Threads
// Config: ES2022, strict, ESNext modules. Run with `npx tsx`.
// ============================================================================

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface Process {
  pid: number;
  name: string;
  state: "ready" | "running" | "blocked" | "terminated";
  burstTime: number; // total CPU time needed
  remainingTime: number;
  priority: number; // lower number = higher priority
}

interface SchedulerResult {
  timeline: Array<{ pid: number; name: string; startTime: number; endTime: number }>;
  averageWaitTime: number;
  averageTurnaroundTime: number;
}

interface WorkerMessage {
  type: string;
  payload: unknown;
}

interface WorkerResponse {
  type: string;
  result: unknown;
  workerId: number;
}

interface TaskResult {
  taskId: number;
  result: unknown;
  workerId: number;
}

interface Task {
  id: number;
  work: () => unknown;
}

interface ThreadPoolStats {
  totalTasks: number;
  completedTasks: number;
  activeWorkers: number;
  queuedTasks: number;
}

interface MemoryRegion {
  name: string;
  size: number;
  shared: boolean;
}

interface ProcessMemoryLayout {
  pid: number;
  regions: MemoryRegion[];
  totalMemory: number;
}

interface TaskRunnerConfig {
  maxConcurrent: number;
  timeout: number;
}

interface TaskRunnerResult {
  completed: TaskResult[];
  failed: Array<{ taskId: number; error: string }>;
  totalTime: number;
}

// ============================================================================
// EXERCISE 1 (Predict): Process State Transitions
// ============================================================================
// What will be the sequence of states for this process?
// Write your prediction, then check against the solution.

function exercise1_processStates(): string[] {
  // A process goes through these events in order:
  // 1. Created and added to ready queue
  // 2. Scheduler picks it to run
  // 3. It requests I/O (disk read)
  // 4. I/O completes
  // 5. Scheduler picks it again
  // 6. It finishes execution

  // Return the sequence of states as an array of strings.
  // Possible states: "new", "ready", "running", "blocked", "terminated"

  // YOUR PREDICTION HERE:
  return [];
}

// console.log("Exercise 1:", exercise1_processStates());
// Expected: ["new", "ready", "running", "blocked", "ready", "running", "terminated"]

// ============================================================================
// EXERCISE 2 (Implement): Round-Robin Scheduler
// ============================================================================
// Implement a round-robin CPU scheduler.
// - Each process gets `quantum` ms of CPU time per turn.
// - If a process finishes within its quantum, it's done.
// - If not, it goes to the back of the ready queue.
// - Track the execution timeline and compute average wait/turnaround times.

function exercise2_roundRobinScheduler(
  processes: Process[],
  quantum: number
): SchedulerResult {
  // YOUR IMPLEMENTATION HERE
  return {
    timeline: [],
    averageWaitTime: 0,
    averageTurnaroundTime: 0,
  };
}

// const procs2: Process[] = [
//   { pid: 1, name: "P1", state: "ready", burstTime: 10, remainingTime: 10, priority: 1 },
//   { pid: 2, name: "P2", state: "ready", burstTime: 4, remainingTime: 4, priority: 2 },
//   { pid: 3, name: "P3", state: "ready", burstTime: 6, remainingTime: 6, priority: 3 },
// ];
// const result2 = exercise2_roundRobinScheduler(procs2, 4);
// console.log("Exercise 2 timeline:", result2.timeline);
// Expected timeline entries (quantum=4):
// P1: 0-4, P2: 4-8, P3: 8-12, P1: 12-16, P3: 16-18, P1: 18-20
// averageWaitTime: (10 + 4 + 10) / 3 = 8
// averageTurnaroundTime: (20 + 8 + 18) / 3 ≈ 15.33

// ============================================================================
// EXERCISE 3 (Predict): Thread vs Process Memory
// ============================================================================
// Two threads in the same process each increment a shared counter 1000 times.
// Without synchronization, what is the range of possible final values?

function exercise3_predictSharedCounter(): { min: number; max: number } {
  // Two threads each do: counter++ (which is load, increment, store)
  // 1000 times each. No locks.
  // What is the minimum and maximum possible final value of counter?

  // YOUR PREDICTION HERE:
  return { min: 0, max: 0 };
}

// console.log("Exercise 3:", exercise3_predictSharedCounter());
// Expected: { min: 2, max: 2000 }
// min=2: worst case, almost every increment is lost except the last from each thread
// max=2000: best case, no interleaving — one thread finishes, then the other

// ============================================================================
// EXERCISE 4 (Implement): postMessage Communication Simulator
// ============================================================================
// Simulate the Web Worker postMessage pattern.
// - MainThread sends messages to WorkerThread
// - WorkerThread processes them and responds
// - Communication is async (use callbacks)
// - Messages are "cloned" (deep copied, no shared references)

class SimulatedWorker {
  private messageHandler: ((msg: WorkerMessage) => void) | null = null;
  private responseHandler: ((resp: WorkerResponse) => void) | null = null;
  private workerId: number;

  constructor(workerId: number) {
    this.workerId = workerId;
  }

  // Set the handler that processes incoming messages (like self.onmessage)
  onMessage(handler: (msg: WorkerMessage) => void): void {
    this.messageHandler = handler;
  }

  // Set the handler for responses back to main thread (like worker.onmessage)
  onResponse(handler: (resp: WorkerResponse) => void): void {
    this.responseHandler = handler;
  }

  // Send a message TO the worker (like worker.postMessage)
  // Must deep-clone the message (structured clone simulation)
  postMessage(msg: WorkerMessage): void {
    // YOUR IMPLEMENTATION HERE
    // 1. Deep clone the message (simulate structured clone)
    // 2. Call the message handler asynchronously (simulate thread boundary)
  }

  // Called by the worker to send a response back
  // Must deep-clone the response
  respond(result: unknown): void {
    // YOUR IMPLEMENTATION HERE
  }

  getWorkerId(): number {
    return this.workerId;
  }
}

// const worker4 = new SimulatedWorker(1);
// worker4.onMessage((msg) => {
//   if (msg.type === "square") {
//     const num = msg.payload as number;
//     worker4.respond(num * num);
//   }
// });
// worker4.onResponse((resp) => {
//   console.log(`Worker ${resp.workerId} result:`, resp.result);
// });
// worker4.postMessage({ type: "square", payload: 5 });
// Expected output (async): Worker 1 result: 25

// ============================================================================
// EXERCISE 5 (Predict): Context Switch Cost
// ============================================================================
// A system runs 3 processes with a round-robin scheduler (quantum = 5ms).
// Each context switch costs 0.5ms.
// Process A needs 8ms, B needs 3ms, C needs 12ms.
// What is the total wall-clock time to complete ALL processes?

function exercise5_predictTotalTime(): number {
  // YOUR PREDICTION HERE:
  return 0;
}

// console.log("Exercise 5:", exercise5_predictTotalTime());
// Schedule: A(5ms) -> switch(0.5) -> B(3ms) -> switch(0.5) -> C(5ms) -> switch(0.5)
//        -> A(3ms) -> switch(0.5) -> C(5ms) -> switch(0.5) -> C(2ms)
// Total: 5 + 0.5 + 3 + 0.5 + 5 + 0.5 + 3 + 0.5 + 5 + 0.5 + 2 = 25.5ms
// Expected: 25.5

// ============================================================================
// EXERCISE 6 (Fix): Broken Process Scheduler
// ============================================================================
// This priority scheduler has bugs. Fix them.

function exercise6_priorityScheduler(processes: Process[]): SchedulerResult {
  const timeline: SchedulerResult["timeline"] = [];
  const queue = [...processes];
  let currentTime = 0;

  while (queue.length > 0) {
    // Bug 1: Should pick HIGHEST priority (lowest number), but doesn't sort correctly
    queue.sort((a, b) => b.priority - a.priority);

    const current = queue.shift()!;

    // Bug 2: Uses burstTime instead of remainingTime
    timeline.push({
      pid: current.pid,
      name: current.name,
      startTime: currentTime,
      endTime: currentTime + current.burstTime,
    });

    // Bug 3: Doesn't update currentTime correctly
    currentTime = current.burstTime;

    current.state = "terminated";
  }

  // Bug 4: Wrong turnaround time calculation
  const avgTurnaround =
    timeline.reduce((sum, t) => sum + t.startTime, 0) / timeline.length;

  return {
    timeline,
    averageWaitTime: 0,
    averageTurnaroundTime: avgTurnaround,
  };
}

// const procs6: Process[] = [
//   { pid: 1, name: "P1", state: "ready", burstTime: 6, remainingTime: 6, priority: 3 },
//   { pid: 2, name: "P2", state: "ready", burstTime: 2, remainingTime: 2, priority: 1 },
//   { pid: 3, name: "P3", state: "ready", burstTime: 4, remainingTime: 4, priority: 2 },
// ];
// console.log("Exercise 6:", exercise6_priorityScheduler(procs6));
// Expected timeline: P2(0-2), P3(2-6), P1(6-12)
// avgWait: (0 + 2 + 6) / 3 ≈ 2.67
// avgTurnaround: (2 + 6 + 12) / 3 ≈ 6.67

// ============================================================================
// EXERCISE 7 (Implement): Thread Pool
// ============================================================================
// Implement a thread pool that manages a fixed number of "worker threads".
// - Pool has N workers
// - Tasks are queued if all workers are busy
// - Workers pick up tasks from the queue when free

class ThreadPool {
  private poolSize: number;
  private taskQueue: Task[];
  private activeWorkers: number;
  private completedTasks: TaskResult[];
  private onComplete: ((result: TaskResult) => void) | null;

  constructor(poolSize: number) {
    this.poolSize = poolSize;
    this.taskQueue = [];
    this.activeWorkers = 0;
    this.completedTasks = [];
    this.onComplete = null;
  }

  // Submit a task to the pool
  submit(task: Task): void {
    // YOUR IMPLEMENTATION HERE
    // If a worker is free, run immediately
    // Otherwise, queue the task
  }

  // Set a callback for task completion
  onTaskComplete(callback: (result: TaskResult) => void): void {
    this.onComplete = callback;
  }

  getStats(): ThreadPoolStats {
    // YOUR IMPLEMENTATION HERE
    return {
      totalTasks: 0,
      completedTasks: 0,
      activeWorkers: 0,
      queuedTasks: 0,
    };
  }

  private processNext(): void {
    // YOUR IMPLEMENTATION HERE
  }
}

// const pool7 = new ThreadPool(2);
// pool7.onTaskComplete((result) => console.log("Completed:", result));
// pool7.submit({ id: 1, work: () => "result1" });
// pool7.submit({ id: 2, work: () => "result2" });
// pool7.submit({ id: 3, work: () => "result3" }); // queued
// console.log("Exercise 7:", pool7.getStats());
// Expected stats: { totalTasks: 3, completedTasks: 0, activeWorkers: 2, queuedTasks: 1 }

// ============================================================================
// EXERCISE 8 (Predict): Browser Process Architecture
// ============================================================================
// You open Chrome and navigate to 3 different sites. One tab has an iframe
// from a 4th origin. How many renderer processes exist (minimum)?

function exercise8_predictRendererProcesses(): number {
  // Sites: siteA.com, siteB.com, siteC.com
  // siteA.com embeds an iframe from siteD.com
  // With site isolation enabled, how many renderer processes?

  // YOUR PREDICTION HERE:
  return 0;
}

// console.log("Exercise 8:", exercise8_predictRendererProcesses());
// Expected: 4 (one per origin: siteA, siteB, siteC, siteD)

// ============================================================================
// EXERCISE 9 (Implement): Process Memory Layout Calculator
// ============================================================================
// Calculate the memory layout for processes that may share libraries.
// Shared libraries count once for the system but appear in each process.

function exercise9_calculateMemory(
  processes: ProcessMemoryLayout[]
): {
  perProcess: Array<{ pid: number; reportedMemory: number; uniqueMemory: number }>;
  totalSystemMemory: number;
  sharedMemorySavings: number;
} {
  // YOUR IMPLEMENTATION HERE
  // - reportedMemory: sum of all regions for a process
  // - uniqueMemory: sum of non-shared regions
  // - totalSystemMemory: sum of all unique memory + shared counted once
  // - sharedMemorySavings: how much memory saved by sharing

  return {
    perProcess: [],
    totalSystemMemory: 0,
    sharedMemorySavings: 0,
  };
}

// const procs9: ProcessMemoryLayout[] = [
//   { pid: 1, regions: [
//     { name: "heap", size: 100, shared: false },
//     { name: "libc", size: 50, shared: true },
//     { name: "libssl", size: 30, shared: true },
//   ], totalMemory: 180 },
//   { pid: 2, regions: [
//     { name: "heap", size: 200, shared: false },
//     { name: "libc", size: 50, shared: true },
//   ], totalMemory: 250 },
// ];
// console.log("Exercise 9:", exercise9_calculateMemory(procs9));
// Expected: totalSystemMemory = 100 + 200 + 50 + 30 = 380 (shared libs counted once)
// sharedMemorySavings = 50 (one duplicate libc)

// ============================================================================
// EXERCISE 10 (Fix): Worker Message Handler
// ============================================================================
// This simulated worker message handler has bugs. Fix them.

type MessagePayload = { action: string; data: number[] };

function exercise10_handleWorkerMessages(
  messages: WorkerMessage[]
): WorkerResponse[] {
  const responses: WorkerResponse[] = [];

  for (const msg of messages) {
    const payload = msg.payload as MessagePayload;

    // Bug 1: Missing type check — payload could be null
    const action = payload.action;

    // Bug 2: Doesn't handle unknown actions
    if (action === "sum") {
      const sum = payload.data.reduce((a, b) => a + b);
      responses.push({ type: "result", result: sum, workerId: 0 });
    }
    if (action === "max") {
      // Bug 3: Math.max with empty array returns -Infinity
      const max = Math.max(...payload.data);
      responses.push({ type: "result", result: max, workerId: 0 });
    }
  }

  return responses;
}

// const messages10: WorkerMessage[] = [
//   { type: "compute", payload: { action: "sum", data: [1, 2, 3] } },
//   { type: "compute", payload: null },
//   { type: "compute", payload: { action: "unknown", data: [1] } },
//   { type: "compute", payload: { action: "max", data: [] } },
//   { type: "compute", payload: { action: "max", data: [5, 3, 8] } },
// ];
// console.log("Exercise 10:", exercise10_handleWorkerMessages(messages10));
// Expected: [
//   { type: "result", result: 6, workerId: 0 },
//   { type: "error", result: "invalid payload", workerId: 0 },
//   { type: "error", result: "unknown action: unknown", workerId: 0 },
//   { type: "error", result: "empty data array", workerId: 0 },
//   { type: "result", result: 8, workerId: 0 },
// ]

// ============================================================================
// EXERCISE 11 (Implement): Transferable Object Simulation
// ============================================================================
// Simulate the transferable objects pattern:
// When a buffer is "transferred", the sender loses access (buffer becomes empty).

class TransferableBuffer {
  private data: number[];
  private transferred: boolean;

  constructor(data: number[]) {
    this.data = [...data];
    this.transferred = false;
  }

  getData(): number[] {
    // YOUR IMPLEMENTATION HERE
    // Should throw if buffer has been transferred
    return [];
  }

  getByteLength(): number {
    // YOUR IMPLEMENTATION HERE
    return 0;
  }

  // Transfer ownership — returns the data and empties this buffer
  transfer(): number[] {
    // YOUR IMPLEMENTATION HERE
    return [];
  }
}

function exercise11_simulateTransfer(
  source: TransferableBuffer
): { sourceLength: number; targetData: number[] } {
  const targetData = source.transfer();
  const sourceLength = source.getByteLength();
  return { sourceLength, targetData };
}

// const buf11 = new TransferableBuffer([1, 2, 3, 4, 5]);
// console.log("Before transfer:", buf11.getByteLength()); // 5
// const result11 = exercise11_simulateTransfer(buf11);
// console.log("Exercise 11:", result11);
// Expected: { sourceLength: 0, targetData: [1, 2, 3, 4, 5] }
// buf11.getData() should throw "Buffer has been transferred"

// ============================================================================
// EXERCISE 12 (Predict): Event Order with Workers
// ============================================================================
// Predict the order of console.log outputs.

function exercise12_predictEventOrder(): string[] {
  // Consider this code running in a browser:
  //
  // console.log("1: main start");
  // const worker = new Worker("worker.js");
  //
  // worker.postMessage("hello");
  // console.log("2: after postMessage");
  //
  // worker.onmessage = (e) => {
  //   console.log("3: received from worker:", e.data);
  // };
  //
  // Promise.resolve().then(() => {
  //   console.log("4: microtask");
  // });
  //
  // setTimeout(() => {
  //   console.log("5: timeout");
  // }, 0);
  //
  // console.log("6: main end");
  //
  // // worker.js:
  // // self.onmessage = (e) => {
  // //   self.postMessage("world");
  // // };

  // In what order do the logs appear?
  // YOUR PREDICTION HERE:
  return [];
}

// console.log("Exercise 12:", exercise12_predictEventOrder());
// Expected: ["1: main start", "2: after postMessage", "6: main end",
//            "4: microtask", "5: timeout", "3: received from worker: world"]
// Note: worker response comes after timeout because worker startup + IPC has latency

// ============================================================================
// EXERCISE 13 (Implement): Task Runner with Worker Simulation
// ============================================================================
// Implement a task runner that simulates running tasks on workers with:
// - Configurable concurrency limit
// - Timeout per task
// - Results collection

class TaskRunner {
  private config: TaskRunnerConfig;

  constructor(config: TaskRunnerConfig) {
    this.config = config;
  }

  async run(
    tasks: Array<{ id: number; work: () => Promise<unknown>; estimatedMs: number }>
  ): Promise<TaskRunnerResult> {
    // YOUR IMPLEMENTATION HERE
    // - Run up to maxConcurrent tasks simultaneously
    // - If a task exceeds timeout, mark it as failed
    // - Return completed and failed results with total time

    return {
      completed: [],
      failed: [],
      totalTime: 0,
    };
  }
}

// const runner13 = new TaskRunner({ maxConcurrent: 2, timeout: 100 });
// const tasks13 = [
//   { id: 1, work: async () => { await delay(10); return "fast"; }, estimatedMs: 10 },
//   { id: 2, work: async () => { await delay(200); return "slow"; }, estimatedMs: 200 },
//   { id: 3, work: async () => { await delay(20); return "medium"; }, estimatedMs: 20 },
// ];
// runner13.run(tasks13).then(result => console.log("Exercise 13:", result));
// Expected: completed has tasks 1 and 3, failed has task 2 (timeout)

// ============================================================================
// EXERCISE 14 (Fix): Process Isolation Simulation
// ============================================================================
// This code tries to simulate process isolation but has bugs.

interface SimProcess {
  pid: number;
  memory: Map<string, unknown>;
}

function exercise14_createProcess(pid: number): SimProcess {
  return {
    pid,
    memory: new Map(),
  };
}

function exercise14_writeMemory(proc: SimProcess, key: string, value: unknown): void {
  proc.memory.set(key, value);
}

function exercise14_readFromOtherProcess(
  reader: SimProcess,
  target: SimProcess,
  key: string
): unknown {
  // Bug: This allows direct memory access between processes!
  // In a real OS, this would be forbidden.
  // Fix: throw an error indicating memory access violation
  return target.memory.get(key);
}

function exercise14_interProcessCommunication(
  sender: SimProcess,
  receiver: SimProcess,
  key: string
): unknown {
  // Bug: Should use "IPC" — copy the value, not pass reference
  const value = sender.memory.get(key);
  return value;
}

// const procA = exercise14_createProcess(1);
// const procB = exercise14_createProcess(2);
// exercise14_writeMemory(procA, "secret", [1, 2, 3]);
//
// Should throw: "Memory access violation: process 2 cannot read memory of process 1"
// try {
//   exercise14_readFromOtherProcess(procB, procA, "secret");
// } catch (e) { console.log(e); }
//
// IPC should return a deep copy:
// const received = exercise14_interProcessCommunication(procA, procB, "secret");
// procA's "secret" and received should NOT be the same reference

// ============================================================================
// EXERCISE 15 (Implement): Priority Queue for Scheduler
// ============================================================================
// Implement a min-heap priority queue for process scheduling.
// Lower priority number = higher priority (runs first).

class ProcessPriorityQueue {
  private heap: Process[];

  constructor() {
    this.heap = [];
  }

  enqueue(process: Process): void {
    // YOUR IMPLEMENTATION HERE
  }

  dequeue(): Process | undefined {
    // YOUR IMPLEMENTATION HERE
    return undefined;
  }

  peek(): Process | undefined {
    // YOUR IMPLEMENTATION HERE
    return undefined;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }
}

// const pq = new ProcessPriorityQueue();
// pq.enqueue({ pid: 1, name: "Low", state: "ready", burstTime: 5, remainingTime: 5, priority: 10 });
// pq.enqueue({ pid: 2, name: "High", state: "ready", burstTime: 3, remainingTime: 3, priority: 1 });
// pq.enqueue({ pid: 3, name: "Med", state: "ready", burstTime: 4, remainingTime: 4, priority: 5 });
// console.log("Exercise 15:", pq.dequeue()?.name); // "High"
// console.log("Exercise 15:", pq.dequeue()?.name); // "Med"
// console.log("Exercise 15:", pq.dequeue()?.name); // "Low"

export {
  exercise1_processStates,
  exercise2_roundRobinScheduler,
  exercise3_predictSharedCounter,
  SimulatedWorker,
  exercise5_predictTotalTime,
  exercise6_priorityScheduler,
  ThreadPool,
  exercise8_predictRendererProcesses,
  exercise9_calculateMemory,
  exercise10_handleWorkerMessages,
  TransferableBuffer,
  exercise11_simulateTransfer,
  exercise12_predictEventOrder,
  TaskRunner,
  exercise14_createProcess,
  exercise14_writeMemory,
  exercise14_readFromOtherProcess,
  exercise14_interProcessCommunication,
  ProcessPriorityQueue,
};

export type {
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
};
