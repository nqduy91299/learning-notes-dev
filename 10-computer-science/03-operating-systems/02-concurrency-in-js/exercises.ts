// ============================================================================
// EXERCISES: Concurrency in JavaScript
// Config: ES2022, strict, ESNext modules. Run with `npx tsx`.
// ============================================================================

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface TaskItem {
  id: number;
  name: string;
  duration: number; // simulated ms
}

interface SchedulerTask {
  id: number;
  priority: "high" | "normal" | "low";
  work: () => Promise<unknown>;
}

interface ChunkResult {
  processedCount: number;
  chunks: number;
  totalTime: number;
}

interface CancellableOperation<T> {
  promise: Promise<T>;
  cancel: () => void;
}

interface RaceConditionResult {
  expected: number;
  actual: number;
  hasRace: boolean;
}

interface EventLoopSnapshot {
  callStack: string[];
  microtaskQueue: string[];
  taskQueue: string[];
  log: string[];
}

interface CooperativeTask {
  id: number;
  totalWork: number;
  workPerYield: number;
  completed: number;
}

type TaskStatus = "pending" | "running" | "completed" | "cancelled" | "failed";

interface ManagedTask {
  id: number;
  status: TaskStatus;
  result?: unknown;
  error?: string;
}

// ============================================================================
// EXERCISE 1 (Predict): Basic Event Loop Order
// ============================================================================
// Predict the output order of these console.log statements.

function exercise1_predictOrder(): string[] {
  // Consider this code:
  //
  // console.log("A");
  // setTimeout(() => console.log("B"), 0);
  // Promise.resolve().then(() => console.log("C"));
  // queueMicrotask(() => console.log("D"));
  // console.log("E");

  // YOUR PREDICTION: Return the letters in order
  return [];
}

// console.log("Exercise 1:", exercise1_predictOrder());
// Expected: ["A", "E", "C", "D", "B"]

// ============================================================================
// EXERCISE 2 (Predict): Nested Microtasks
// ============================================================================
// Predict the output order.

function exercise2_predictNested(): string[] {
  // Consider this code:
  //
  // console.log("1");
  // setTimeout(() => {
  //   console.log("2");
  //   Promise.resolve().then(() => console.log("3"));
  // }, 0);
  // Promise.resolve().then(() => {
  //   console.log("4");
  //   queueMicrotask(() => console.log("5"));
  // });
  // Promise.resolve().then(() => console.log("6"));
  // console.log("7");

  // YOUR PREDICTION:
  return [];
}

// console.log("Exercise 2:", exercise2_predictNested());
// Expected: ["1", "7", "4", "6", "5", "2", "3"]

// ============================================================================
// EXERCISE 3 (Predict): Promise.resolve vs new Promise
// ============================================================================

function exercise3_predictPromises(): string[] {
  // Consider:
  //
  // console.log("A");
  // new Promise((resolve) => {
  //   console.log("B");
  //   resolve(undefined);
  //   console.log("C");
  // }).then(() => console.log("D"));
  // console.log("E");

  // YOUR PREDICTION:
  return [];
}

// console.log("Exercise 3:", exercise3_predictPromises());
// Expected: ["A", "B", "C", "E", "D"]
// Promise constructor body is synchronous! resolve() doesn't stop execution.

// ============================================================================
// EXERCISE 4 (Predict): Async/Await Desugaring
// ============================================================================

function exercise4_predictAsync(): string[] {
  // Consider:
  //
  // async function foo() {
  //   console.log("1");
  //   await Promise.resolve();
  //   console.log("2");
  // }
  //
  // console.log("3");
  // foo();
  // console.log("4");

  // YOUR PREDICTION:
  return [];
}

// console.log("Exercise 4:", exercise4_predictAsync());
// Expected: ["3", "1", "4", "2"]
// await yields — everything after `await` is a microtask

// ============================================================================
// EXERCISE 5 (Predict): setTimeout Ordering
// ============================================================================

function exercise5_predictTimeouts(): string[] {
  // Consider:
  //
  // setTimeout(() => console.log("A"), 10);
  // setTimeout(() => console.log("B"), 0);
  // setTimeout(() => {
  //   console.log("C");
  //   setTimeout(() => console.log("D"), 0);
  // }, 0);
  // Promise.resolve().then(() => {
  //   console.log("E");
  //   setTimeout(() => console.log("F"), 0);
  // });
  // console.log("G");

  // YOUR PREDICTION:
  return [];
}

// console.log("Exercise 5:", exercise5_predictTimeouts());
// Expected: ["G", "E", "B", "C", "F", "D", "A"]
// G(sync) → E(microtask) → B(timer 0) → C(timer 0) → F(timer 0, queued by E)
// → D(timer 0, queued by C) → A(timer 10)

// ============================================================================
// EXERCISE 6 (Predict): Microtask Flooding
// ============================================================================

function exercise6_predictFlooding(): string[] {
  // Consider:
  //
  // setTimeout(() => console.log("timeout"), 0);
  //
  // let count = 0;
  // function flood(): void {
  //   if (count < 3) {
  //     count++;
  //     console.log("micro " + count);
  //     queueMicrotask(flood);
  //   }
  // }
  // queueMicrotask(flood);
  // console.log("sync");

  // YOUR PREDICTION:
  return [];
}

// console.log("Exercise 6:", exercise6_predictFlooding());
// Expected: ["sync", "micro 1", "micro 2", "micro 3", "timeout"]
// All microtasks drain before the timeout task runs

// ============================================================================
// EXERCISE 7 (Implement): Task Chunker
// ============================================================================
// Implement a function that processes items in chunks, yielding to the
// main thread between chunks to prevent blocking.

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exercise7_chunkProcessor(
  items: number[],
  chunkSize: number,
  processItem: (item: number) => number
): Promise<ChunkResult> {
  // YOUR IMPLEMENTATION:
  // 1. Process items in chunks of `chunkSize`
  // 2. After each chunk, yield to the main thread (use setTimeout 0)
  // 3. Return the total processed count, number of chunks, and total time

  return {
    processedCount: 0,
    chunks: 0,
    totalTime: 0,
  };
}

// const items7 = Array.from({ length: 100 }, (_, i) => i);
// exercise7_chunkProcessor(items7, 10, (x) => x * 2).then((result) => {
//   console.log("Exercise 7:", result);
// });
// Expected: { processedCount: 100, chunks: 10, totalTime: <varies> }

// ============================================================================
// EXERCISE 8 (Implement): Cooperative Scheduler
// ============================================================================
// Implement a cooperative scheduler that runs tasks based on priority.
// High priority tasks run first. Tasks must yield periodically.

class CooperativeScheduler {
  private tasks: SchedulerTask[];
  private results: Map<number, unknown>;

  constructor() {
    this.tasks = [];
    this.results = new Map();
  }

  schedule(task: SchedulerTask): void {
    // YOUR IMPLEMENTATION:
    // Add task, maintaining priority order (high > normal > low)
  }

  async runAll(): Promise<Map<number, unknown>> {
    // YOUR IMPLEMENTATION:
    // Run all tasks in priority order
    // Yield between each task (setTimeout 0)
    return this.results;
  }

  getResults(): Map<number, unknown> {
    return new Map(this.results);
  }
}

// const sched8 = new CooperativeScheduler();
// sched8.schedule({ id: 1, priority: "low", work: async () => "low result" });
// sched8.schedule({ id: 2, priority: "high", work: async () => "high result" });
// sched8.schedule({ id: 3, priority: "normal", work: async () => "normal result" });
// sched8.runAll().then((results) => {
//   console.log("Exercise 8:", [...results.entries()]);
// });
// Expected execution order: high(2), normal(3), low(1)

// ============================================================================
// EXERCISE 9 (Fix): Race Condition in Counter
// ============================================================================
// This async counter has a race condition. Fix it.

class BrokenAsyncCounter {
  private count: number = 0;

  async increment(): Promise<void> {
    const current = this.count;
    await delay(1); // Simulate async work
    this.count = current + 1;
    // Bug: Between reading `current` and writing `this.count`,
    // another increment() could have run
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

// const counter9 = new BrokenAsyncCounter();
// counter9.incrementMultiple(10).then((result) => {
//   console.log("Exercise 9:", result);
//   // Bug: result is 1 (all read 0, all write 1)
//   // Expected after fix: 10
// });

// ============================================================================
// EXERCISE 10 (Fix): Stale Closure
// ============================================================================
// This simulated search has a stale closure / race condition. Fix it.

interface SearchResult {
  query: string;
  results: string[];
}

class BrokenSearch {
  private currentResults: SearchResult | null = null;

  async search(query: string): Promise<void> {
    // Simulate network delay — shorter queries take longer (more results)
    const networkDelay = query.length < 3 ? 50 : 10;
    await delay(networkDelay);

    // Bug: A slow response for "ab" overwrites fast response for "abc"
    this.currentResults = {
      query,
      results: [`Result for "${query}"`],
    };
  }

  getCurrentResults(): SearchResult | null {
    return this.currentResults;
  }
}

// const search10 = new BrokenSearch();
// search10.search("ab");    // slow — takes 50ms
// search10.search("abc");   // fast — takes 10ms
// setTimeout(() => {
//   console.log("Exercise 10:", search10.getCurrentResults());
//   // Bug: shows "ab" results even though "abc" was searched last
//   // Expected after fix: shows "abc" results
// }, 100);

// ============================================================================
// EXERCISE 11 (Implement): Cancellable Async Operation
// ============================================================================
// Implement a function that creates a cancellable async operation.

function exercise11_cancellable<T>(
  asyncFn: (signal: AbortSignal) => Promise<T>
): CancellableOperation<T> {
  // YOUR IMPLEMENTATION:
  // 1. Create an AbortController
  // 2. Run the async function with the signal
  // 3. Return both the promise and a cancel function

  return {
    promise: Promise.reject(new Error("not implemented")),
    cancel: () => {},
  };
}

// const op11 = exercise11_cancellable(async (signal) => {
//   await delay(100);
//   if (signal.aborted) throw new DOMException("Aborted", "AbortError");
//   return "completed";
// });
// setTimeout(() => op11.cancel(), 50); // Cancel before completion
// op11.promise.catch((e) => console.log("Exercise 11:", e.message));
// Expected: "Aborted"

// ============================================================================
// EXERCISE 12 (Implement): Event Loop Simulator
// ============================================================================
// Implement a simplified event loop simulator that demonstrates task and
// microtask queue ordering.

class EventLoopSimulator {
  private taskQueue: Array<{ name: string; fn: () => void }>;
  private microtaskQueue: Array<{ name: string; fn: () => void }>;
  private log: string[];

  constructor() {
    this.taskQueue = [];
    this.microtaskQueue = [];
    this.log = [];
  }

  // Simulate setTimeout
  addTask(name: string, fn: () => void): void {
    // YOUR IMPLEMENTATION
  }

  // Simulate queueMicrotask
  addMicrotask(name: string, fn: () => void): void {
    // YOUR IMPLEMENTATION
  }

  // Simulate synchronous console.log
  logSync(message: string): void {
    this.log.push(message);
  }

  // Run one full iteration of the event loop
  tick(): void {
    // YOUR IMPLEMENTATION:
    // 1. Run one task from the task queue
    // 2. Drain all microtasks (including newly added ones)
  }

  // Run until both queues are empty
  runAll(): string[] {
    // YOUR IMPLEMENTATION
    return [];
  }

  getLog(): string[] {
    return [...this.log];
  }
}

// const sim12 = new EventLoopSimulator();
// sim12.logSync("sync 1");
// sim12.addTask("timeout", () => {
//   sim12.logSync("task 1");
//   sim12.addMicrotask("inner-micro", () => sim12.logSync("micro from task"));
// });
// sim12.addMicrotask("micro1", () => sim12.logSync("micro 1"));
// sim12.addMicrotask("micro2", () => sim12.logSync("micro 2"));
// sim12.logSync("sync 2");
// console.log("Exercise 12:", sim12.runAll());
// Expected: ["sync 1", "sync 2", "micro 1", "micro 2", "task 1", "micro from task"]

// ============================================================================
// EXERCISE 13 (Fix): Missing Await Causes Race
// ============================================================================
// Fix this function that has a subtle missing-await bug.

async function exercise13_processSequentially(
  items: number[]
): Promise<number[]> {
  const results: number[] = [];

  // Bug: forEach doesn't await — all async operations fire simultaneously
  items.forEach(async (item) => {
    const result = await delay(item).then(() => item * 2);
    results.push(result);
  });

  return results; // Returns immediately — results is still empty!
}

// exercise13_processSequentially([30, 10, 20]).then((result) => {
//   console.log("Exercise 13:", result);
//   // Bug: [] (empty array)
//   // Expected after fix: [60, 20, 40] (processed sequentially)
// });

// ============================================================================
// EXERCISE 14 (Fix): Incorrect AbortController Usage
// ============================================================================
// This code reuses an AbortController incorrectly. Fix it.

async function exercise14_fetchMultiple(
  urls: string[]
): Promise<Array<{ url: string; status: string }>> {
  const controller = new AbortController();
  const results: Array<{ url: string; status: string }> = [];

  for (const url of urls) {
    try {
      // Bug: If first request is aborted, the same (already aborted)
      // controller is used for subsequent requests
      await simulatedFetch(url, controller.signal);
      results.push({ url, status: "success" });
    } catch {
      controller.abort(); // Aborts ALL future requests too!
      results.push({ url, status: "failed" });
    }
  }

  return results;
}

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

// exercise14_fetchMultiple(["/api/a", "/api/fail", "/api/b"]).then((result) => {
//   console.log("Exercise 14:", result);
//   // Bug: [success, failed, failed] — /api/b fails because controller is aborted
//   // Expected: [success, failed, success] — each request independent
// });

// ============================================================================
// EXERCISE 15 (Implement): Async Mutex
// ============================================================================
// Implement a mutex (mutual exclusion lock) for async operations.
// This prevents race conditions when multiple async operations access shared state.

class AsyncMutex {
  private locked: boolean;
  private waitQueue: Array<() => void>;

  constructor() {
    this.locked = false;
    this.waitQueue = [];
  }

  async acquire(): Promise<void> {
    // YOUR IMPLEMENTATION:
    // If unlocked, lock it immediately
    // If locked, wait until it's released
  }

  release(): void {
    // YOUR IMPLEMENTATION:
    // Unlock and wake the next waiter
  }

  isLocked(): boolean {
    return this.locked;
  }
}

// const mutex15 = new AsyncMutex();
// let sharedValue = 0;
// async function safeIncrement(): Promise<void> {
//   await mutex15.acquire();
//   const current = sharedValue;
//   await delay(1);
//   sharedValue = current + 1;
//   mutex15.release();
// }
// Promise.all([safeIncrement(), safeIncrement(), safeIncrement()]).then(() => {
//   console.log("Exercise 15:", sharedValue); // Expected: 3
// });

// ============================================================================
// EXERCISE 16 (Implement): Promise.allSettled Polyfill
// ============================================================================

type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

function exercise16_allSettled<T>(
  promises: Promise<T>[]
): Promise<SettledResult<T>[]> {
  // YOUR IMPLEMENTATION:
  // Like Promise.allSettled — waits for all promises to settle
  // Never rejects

  return Promise.resolve([]);
}

// exercise16_allSettled([
//   Promise.resolve(1),
//   Promise.reject("error"),
//   Promise.resolve(3),
// ]).then((results) => {
//   console.log("Exercise 16:", results);
// });
// Expected: [
//   { status: "fulfilled", value: 1 },
//   { status: "rejected", reason: "error" },
//   { status: "fulfilled", value: 3 },
// ]

// ============================================================================
// EXERCISE 17 (Implement): Debounced Async Function
// ============================================================================
// Implement a debounce that works with async functions.
// If called again before the delay, cancel the previous invocation.

function exercise17_asyncDebounce<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  delayMs: number
): (...args: TArgs) => Promise<TReturn | undefined> {
  // YOUR IMPLEMENTATION:
  // 1. On each call, reset the timer
  // 2. Only execute when the timer completes
  // 3. Return undefined if debounced (superseded by a newer call)

  return async (..._args: TArgs): Promise<TReturn | undefined> => {
    return undefined;
  };
}

// const debouncedSearch = exercise17_asyncDebounce(
//   async (query: string) => `Results for ${query}`,
//   50
// );
// debouncedSearch("a");   // debounced
// debouncedSearch("ab");  // debounced
// debouncedSearch("abc").then((r) => console.log("Exercise 17:", r));
// Expected (after 50ms): "Results for abc"

// ============================================================================
// EXERCISE 18 (Implement): Structured Concurrency — Task Group
// ============================================================================
// Implement a TaskGroup that runs async tasks with:
// - Concurrency limit
// - Automatic cancellation on first error (optional)
// - Results collection

class TaskGroup {
  private maxConcurrency: number;
  private cancelOnError: boolean;
  private tasks: Array<{ id: number; fn: (signal: AbortSignal) => Promise<unknown> }>;

  constructor(options: { maxConcurrency: number; cancelOnError: boolean }) {
    this.maxConcurrency = options.maxConcurrency;
    this.cancelOnError = options.cancelOnError;
    this.tasks = [];
  }

  add(id: number, fn: (signal: AbortSignal) => Promise<unknown>): void {
    this.tasks.push({ id, fn });
  }

  async run(): Promise<ManagedTask[]> {
    // YOUR IMPLEMENTATION:
    // 1. Run tasks with concurrency limit
    // 2. If cancelOnError is true, abort remaining tasks on first error
    // 3. Return status for all tasks

    return [];
  }
}

// const group18 = new TaskGroup({ maxConcurrency: 2, cancelOnError: true });
// group18.add(1, async () => { await delay(10); return "ok"; });
// group18.add(2, async () => { await delay(5); throw new Error("fail"); });
// group18.add(3, async () => { await delay(20); return "ok"; });
// group18.run().then((results) => {
//   console.log("Exercise 18:", results);
// });
// Expected: task 1 completed, task 2 failed, task 3 cancelled

export {
  exercise1_predictOrder,
  exercise2_predictNested,
  exercise3_predictPromises,
  exercise4_predictAsync,
  exercise5_predictTimeouts,
  exercise6_predictFlooding,
  exercise7_chunkProcessor,
  CooperativeScheduler,
  BrokenAsyncCounter,
  BrokenSearch,
  exercise11_cancellable,
  EventLoopSimulator,
  exercise13_processSequentially,
  exercise14_fetchMultiple,
  AsyncMutex,
  exercise16_allSettled,
  exercise17_asyncDebounce,
  TaskGroup,
  delay,
  simulatedFetch,
};

export type {
  TaskItem,
  SchedulerTask,
  ChunkResult,
  CancellableOperation,
  RaceConditionResult,
  EventLoopSnapshot,
  CooperativeTask,
  TaskStatus,
  ManagedTask,
  SearchResult,
  SettledResult,
};
