// ============================================================================
// SOLUTIONS: Concurrency in JavaScript
// Config: ES2022, strict, ESNext modules. Run with `npx tsx`.
// ============================================================================

import type {
  SchedulerTask,
  ChunkResult,
  CancellableOperation,
  ManagedTask,
  SearchResult,
  SettledResult,
} from "./exercises.js";

// ============================================================================
// Utility
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// ============================================================================
// SOLUTION 1: Basic Event Loop Order
// ============================================================================

function solution1_predictOrder(): string[] {
  // Sync: A, E
  // Microtasks: C (Promise.then), D (queueMicrotask)
  // Tasks: B (setTimeout)
  return ["A", "E", "C", "D", "B"];
}

// ============================================================================
// SOLUTION 2: Nested Microtasks
// ============================================================================

function solution2_predictNested(): string[] {
  // Sync: 1, 7
  // Microtasks: 4 (first .then), 6 (second .then) — then 5 (queued by 4)
  // Tasks: 2 (setTimeout) — then microtask 3 (queued by 2)
  return ["1", "7", "4", "6", "5", "2", "3"];
}

// ============================================================================
// SOLUTION 3: Promise.resolve vs new Promise
// ============================================================================

function solution3_predictPromises(): string[] {
  // new Promise() constructor body is sync: B, C execute immediately
  // resolve() doesn't stop execution — C still runs
  // D runs as microtask after sync code
  return ["A", "B", "C", "E", "D"];
}

// ============================================================================
// SOLUTION 4: Async/Await Desugaring
// ============================================================================

function solution4_predictAsync(): string[] {
  // 3 (sync), foo() starts: 1 (sync in foo), await yields, 4 (sync), 2 (microtask)
  return ["3", "1", "4", "2"];
}

// ============================================================================
// SOLUTION 5: setTimeout Ordering
// ============================================================================

function solution5_predictTimeouts(): string[] {
  // G (sync) → E (microtask, queues F as timeout) →
  // B (timer 0, first) → C (timer 0, second, queues D) →
  // F (timer 0, queued by E) → D (timer 0, queued by C) → A (timer 10)
  return ["G", "E", "B", "C", "F", "D", "A"];
}

// ============================================================================
// SOLUTION 6: Microtask Flooding
// ============================================================================

function solution6_predictFlooding(): string[] {
  // sync → all microtasks drain (micro 1, 2, 3) → timeout
  return ["sync", "micro 1", "micro 2", "micro 3", "timeout"];
}

// ============================================================================
// SOLUTION 7: Task Chunker
// ============================================================================

async function solution7_chunkProcessor(
  items: number[],
  chunkSize: number,
  processItem: (item: number) => number
): Promise<ChunkResult> {
  const start = Date.now();
  let processedCount = 0;
  let chunks = 0;

  for (let i = 0; i < items.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, items.length);
    for (let j = i; j < end; j++) {
      processItem(items[j]);
      processedCount++;
    }
    chunks++;

    if (end < items.length) {
      await yieldToMain();
    }
  }

  return {
    processedCount,
    chunks,
    totalTime: Date.now() - start,
  };
}

// ============================================================================
// SOLUTION 8: Cooperative Scheduler
// ============================================================================

class SolutionCooperativeScheduler {
  private tasks: SchedulerTask[];
  private results: Map<number, unknown>;

  constructor() {
    this.tasks = [];
    this.results = new Map();
  }

  private priorityValue(p: "high" | "normal" | "low"): number {
    return p === "high" ? 0 : p === "normal" ? 1 : 2;
  }

  schedule(task: SchedulerTask): void {
    this.tasks.push(task);
    this.tasks.sort(
      (a, b) => this.priorityValue(a.priority) - this.priorityValue(b.priority)
    );
  }

  async runAll(): Promise<Map<number, unknown>> {
    for (const task of this.tasks) {
      const result = await task.work();
      this.results.set(task.id, result);
      await yieldToMain();
    }
    return new Map(this.results);
  }

  getResults(): Map<number, unknown> {
    return new Map(this.results);
  }
}

// ============================================================================
// SOLUTION 9: Fixed Async Counter
// ============================================================================

class FixedAsyncCounter {
  private count: number = 0;
  private mutex: SolutionAsyncMutex;

  constructor() {
    this.mutex = new SolutionAsyncMutex();
  }

  async increment(): Promise<void> {
    await this.mutex.acquire();
    try {
      const current = this.count;
      await delay(1);
      this.count = current + 1;
    } finally {
      this.mutex.release();
    }
  }

  async incrementMultiple(times: number): Promise<number> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < times; i++) {
      promises.push(this.increment());
    }
    await Promise.all(promises);
    return this.count;
  }

  getCount(): number {
    return this.count;
  }
}

// ============================================================================
// SOLUTION 10: Fixed Search (handles stale responses)
// ============================================================================

class FixedSearch {
  private currentResults: SearchResult | null = null;
  private latestQuery: string = "";

  async search(query: string): Promise<void> {
    this.latestQuery = query;
    const networkDelay = query.length < 3 ? 50 : 10;
    await delay(networkDelay);

    // Only update if this is still the latest query
    if (query === this.latestQuery) {
      this.currentResults = {
        query,
        results: [`Result for "${query}"`],
      };
    }
  }

  getCurrentResults(): SearchResult | null {
    return this.currentResults;
  }
}

// ============================================================================
// SOLUTION 11: Cancellable Async Operation
// ============================================================================

function solution11_cancellable<T>(
  asyncFn: (signal: AbortSignal) => Promise<T>
): CancellableOperation<T> {
  const controller = new AbortController();

  const promise = asyncFn(controller.signal);

  return {
    promise,
    cancel: () => controller.abort(),
  };
}

// ============================================================================
// SOLUTION 12: Event Loop Simulator
// ============================================================================

class SolutionEventLoopSimulator {
  private taskQueue: Array<{ name: string; fn: () => void }>;
  private microtaskQueue: Array<{ name: string; fn: () => void }>;
  private log: string[];

  constructor() {
    this.taskQueue = [];
    this.microtaskQueue = [];
    this.log = [];
  }

  addTask(name: string, fn: () => void): void {
    this.taskQueue.push({ name, fn });
  }

  addMicrotask(name: string, fn: () => void): void {
    this.microtaskQueue.push({ name, fn });
  }

  logSync(message: string): void {
    this.log.push(message);
  }

  tick(): void {
    // 1. Run one task
    if (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      task.fn();
    }

    // 2. Drain all microtasks (including newly added)
    while (this.microtaskQueue.length > 0) {
      const micro = this.microtaskQueue.shift()!;
      micro.fn();
    }
  }

  runAll(): string[] {
    // First drain any initial microtasks (simulating sync code already ran)
    while (this.microtaskQueue.length > 0) {
      const micro = this.microtaskQueue.shift()!;
      micro.fn();
    }

    // Then process tasks
    while (this.taskQueue.length > 0) {
      this.tick();
    }

    return [...this.log];
  }

  getLog(): string[] {
    return [...this.log];
  }
}

// ============================================================================
// SOLUTION 13: Fixed Sequential Processing
// ============================================================================

async function solution13_processSequentially(
  items: number[]
): Promise<number[]> {
  const results: number[] = [];

  // Fix: Use for...of with await instead of forEach
  for (const item of items) {
    const result = await delay(item).then(() => item * 2);
    results.push(result);
  }

  return results;
}

// ============================================================================
// SOLUTION 14: Fixed Fetch Multiple
// ============================================================================

async function simulatedFetch(
  url: string,
  signal: AbortSignal
): Promise<string> {
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  await delay(10);
  if (url.includes("fail")) {
    throw new Error("Network error");
  }
  return `Response from ${url}`;
}

async function solution14_fetchMultiple(
  urls: string[]
): Promise<Array<{ url: string; status: string }>> {
  const results: Array<{ url: string; status: string }> = [];

  for (const url of urls) {
    // Fix: Create a NEW controller for each request
    const controller = new AbortController();
    try {
      await simulatedFetch(url, controller.signal);
      results.push({ url, status: "success" });
    } catch {
      // Only abort THIS request, not future ones
      controller.abort();
      results.push({ url, status: "failed" });
    }
  }

  return results;
}

// ============================================================================
// SOLUTION 15: Async Mutex
// ============================================================================

class SolutionAsyncMutex {
  private locked: boolean;
  private waitQueue: Array<() => void>;

  constructor() {
    this.locked = false;
    this.waitQueue = [];
  }

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    // Wait until released
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      // Wake next waiter (stays locked)
      const next = this.waitQueue.shift()!;
      next();
    } else {
      this.locked = false;
    }
  }

  isLocked(): boolean {
    return this.locked;
  }
}

// ============================================================================
// SOLUTION 16: Promise.allSettled Polyfill
// ============================================================================

function solution16_allSettled<T>(
  promises: Promise<T>[]
): Promise<SettledResult<T>[]> {
  return Promise.all(
    promises.map((p) =>
      p
        .then(
          (value): SettledResult<T> => ({ status: "fulfilled", value })
        )
        .catch(
          (reason): SettledResult<T> => ({ status: "rejected", reason })
        )
    )
  );
}

// ============================================================================
// SOLUTION 17: Debounced Async Function
// ============================================================================

function solution17_asyncDebounce<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  delayMs: number
): (...args: TArgs) => Promise<TReturn | undefined> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentReject: ((reason: string) => void) | null = null;

  return (...args: TArgs): Promise<TReturn | undefined> => {
    // Cancel previous
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (currentReject) {
      currentReject("debounced");
    }

    return new Promise<TReturn | undefined>((resolve, reject) => {
      currentReject = () => resolve(undefined);

      timeoutId = setTimeout(async () => {
        currentReject = null;
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delayMs);
    });
  };
}

// ============================================================================
// SOLUTION 18: Structured Concurrency — Task Group
// ============================================================================

class SolutionTaskGroup {
  private maxConcurrency: number;
  private cancelOnError: boolean;
  private tasks: Array<{
    id: number;
    fn: (signal: AbortSignal) => Promise<unknown>;
  }>;

  constructor(options: { maxConcurrency: number; cancelOnError: boolean }) {
    this.maxConcurrency = options.maxConcurrency;
    this.cancelOnError = options.cancelOnError;
    this.tasks = [];
  }

  add(id: number, fn: (signal: AbortSignal) => Promise<unknown>): void {
    this.tasks.push({ id, fn });
  }

  async run(): Promise<ManagedTask[]> {
    const controller = new AbortController();
    const results: ManagedTask[] = this.tasks.map((t) => ({
      id: t.id,
      status: "pending" as const,
    }));

    const executing = new Set<Promise<void>>();

    for (let i = 0; i < this.tasks.length; i++) {
      if (controller.signal.aborted) {
        results[i].status = "cancelled";
        continue;
      }

      const task = this.tasks[i];
      const index = i;

      const taskPromise = (async () => {
        results[index].status = "running";
        try {
          if (controller.signal.aborted) {
            results[index].status = "cancelled";
            return;
          }
          const result = await task.fn(controller.signal);
          if (controller.signal.aborted && results[index].status === "running") {
            results[index].status = "cancelled";
          } else {
            results[index].status = "completed";
            results[index].result = result;
          }
        } catch (err) {
          if (controller.signal.aborted && results[index].status !== "running") {
            results[index].status = "cancelled";
          } else {
            results[index].status = "failed";
            results[index].error =
              err instanceof Error ? err.message : String(err);
            if (this.cancelOnError) {
              controller.abort();
            }
          }
        }
      })();

      executing.add(taskPromise);
      taskPromise.then(() => executing.delete(taskPromise));

      if (executing.size >= this.maxConcurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    // Mark any remaining pending tasks as cancelled if abort was triggered
    for (const result of results) {
      if (result.status === "pending") {
        result.status = "cancelled";
      }
    }

    return results;
  }
}

// ============================================================================
// RUNNER
// ============================================================================

async function runAllSolutions(): Promise<void> {
  console.log("=== SOLUTION 1: Basic Event Loop ===");
  console.log(solution1_predictOrder());

  console.log("\n=== SOLUTION 2: Nested Microtasks ===");
  console.log(solution2_predictNested());

  console.log("\n=== SOLUTION 3: Promise Constructor ===");
  console.log(solution3_predictPromises());

  console.log("\n=== SOLUTION 4: Async/Await ===");
  console.log(solution4_predictAsync());

  console.log("\n=== SOLUTION 5: setTimeout Ordering ===");
  console.log(solution5_predictTimeouts());

  console.log("\n=== SOLUTION 6: Microtask Flooding ===");
  console.log(solution6_predictFlooding());

  console.log("\n=== SOLUTION 7: Task Chunker ===");
  const items7 = Array.from({ length: 100 }, (_, i) => i);
  const result7 = await solution7_chunkProcessor(items7, 10, (x) => x * 2);
  console.log(result7);

  console.log("\n=== SOLUTION 8: Cooperative Scheduler ===");
  const sched8 = new SolutionCooperativeScheduler();
  sched8.schedule({ id: 1, priority: "low", work: async () => "low result" });
  sched8.schedule({
    id: 2,
    priority: "high",
    work: async () => "high result",
  });
  sched8.schedule({
    id: 3,
    priority: "normal",
    work: async () => "normal result",
  });
  const results8 = await sched8.runAll();
  console.log([...results8.entries()]);

  console.log("\n=== SOLUTION 9: Fixed Async Counter ===");
  const counter9 = new FixedAsyncCounter();
  const count9 = await counter9.incrementMultiple(5);
  console.log("Count:", count9);

  console.log("\n=== SOLUTION 10: Fixed Search ===");
  const search10 = new FixedSearch();
  search10.search("ab");
  search10.search("abc");
  await delay(100);
  console.log(search10.getCurrentResults());

  console.log("\n=== SOLUTION 11: Cancellable ===");
  const op11 = solution11_cancellable(async (signal) => {
    await delay(100);
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    return "completed";
  });
  setTimeout(() => op11.cancel(), 50);
  try {
    await op11.promise;
  } catch (e) {
    console.log("Cancelled:", (e as Error).message);
  }

  console.log("\n=== SOLUTION 12: Event Loop Simulator ===");
  const sim12 = new SolutionEventLoopSimulator();
  sim12.logSync("sync 1");
  sim12.addTask("timeout", () => {
    sim12.logSync("task 1");
    sim12.addMicrotask("inner-micro", () => sim12.logSync("micro from task"));
  });
  sim12.addMicrotask("micro1", () => sim12.logSync("micro 1"));
  sim12.addMicrotask("micro2", () => sim12.logSync("micro 2"));
  sim12.logSync("sync 2");
  console.log(sim12.runAll());

  console.log("\n=== SOLUTION 13: Sequential Processing ===");
  const result13 = await solution13_processSequentially([30, 10, 20]);
  console.log(result13);

  console.log("\n=== SOLUTION 14: Fixed Fetch Multiple ===");
  const result14 = await solution14_fetchMultiple([
    "/api/a",
    "/api/fail",
    "/api/b",
  ]);
  console.log(result14);

  console.log("\n=== SOLUTION 15: Async Mutex ===");
  const mutex15 = new SolutionAsyncMutex();
  let sharedValue = 0;
  async function safeIncrement(): Promise<void> {
    await mutex15.acquire();
    const current = sharedValue;
    await delay(1);
    sharedValue = current + 1;
    mutex15.release();
  }
  await Promise.all([safeIncrement(), safeIncrement(), safeIncrement()]);
  console.log("Shared value:", sharedValue);

  console.log("\n=== SOLUTION 16: allSettled Polyfill ===");
  const result16 = await solution16_allSettled([
    Promise.resolve(1),
    Promise.reject("error"),
    Promise.resolve(3),
  ]);
  console.log(result16);

  console.log("\n=== SOLUTION 17: Async Debounce ===");
  const debouncedSearch = solution17_asyncDebounce(
    async (query: string) => `Results for ${query}`,
    50
  );
  debouncedSearch("a");
  debouncedSearch("ab");
  const result17 = await debouncedSearch("abc");
  console.log(result17);

  console.log("\n=== SOLUTION 18: Task Group ===");
  const group18 = new SolutionTaskGroup({
    maxConcurrency: 2,
    cancelOnError: true,
  });
  group18.add(1, async () => {
    await delay(10);
    return "ok";
  });
  group18.add(2, async () => {
    await delay(5);
    throw new Error("fail");
  });
  group18.add(3, async () => {
    await delay(20);
    return "ok";
  });
  const result18 = await group18.run();
  console.log(result18);
}

runAllSolutions().catch(console.error);
