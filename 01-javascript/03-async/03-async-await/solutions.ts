// ============================================================================
// 03-async-await: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function delayValue<T>(ms: number, value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

function delayReject(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: async functions always return a promise

async function solution1() {
  async function getValue() {
    return 42;
  }

  const result = getValue();
  console.log(typeof result);
  console.log(result instanceof Promise);

  const value = await getValue();
  console.log(typeof value);
  console.log(value);
}

// ANSWER:
// Log 1: "object"
// Log 2: true
// Log 3: "number"
// Log 4: 42
//
// Explanation:
// An async function ALWAYS returns a promise, even if you return a plain value.
// Before awaiting, `result` is a Promise object (typeof "object").
// After awaiting, the promise unwraps to the number 42.
// See README → Section 1: Async Functions

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Execution order with await

async function solution2() {
  console.log(1);

  const p = (async () => {
    console.log(2);
    await delay(0);
    console.log(3);
  })();

  console.log(4);
  await p;
  console.log(5);
}

// ANSWER:
// Order: 1, 2, 4, 3, 5
//
// Explanation:
// - Log 1: synchronous, runs first.
// - The async IIFE starts synchronously, so log 2 runs immediately.
// - `await delay(0)` suspends the IIFE — control returns to the caller.
// - Log 4: runs synchronously in the outer function.
// - `await p` suspends the outer function, waiting for the IIFE to complete.
// - The IIFE resumes after the setTimeout(0) callback: log 3.
// - The outer function resumes: log 5.
// See README → Section 2: The await Keyword

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: try/catch with async — what gets caught?

async function solution3() {
  async function mayFail(shouldFail: boolean): Promise<string> {
    if (shouldFail) throw new Error("boom");
    return "ok";
  }

  try {
    const a = await mayFail(false);
    console.log(a);
    const b = await mayFail(true);
    console.log(b);
  } catch (err) {
    console.log((err as Error).message);
  }

  console.log("after");
}

// ANSWER:
// Log 1: "ok"
// Log 2: "boom"
// Log 3: "after"
//
// Explanation:
// First call succeeds → logs "ok".
// Second call throws → await converts it to an exception → catch runs → logs "boom".
// The second console.log(b) is NEVER reached because the throw jumps to catch.
// Execution continues after try/catch → logs "after".
// See README → Section 3: Error Handling with try/catch

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Promise.all rejection behavior

async function solution4() {
  try {
    const results = await Promise.all([
      delayValue(100, "a"),
      delayReject(50, "fail-b"),
      delayValue(200, "c"),
    ]);
    console.log(results);
  } catch (err) {
    console.log((err as Error).message);
  }
}

// ANSWER:
// Log 1: "fail-b"
//
// Explanation:
// Promise.all rejects as soon as ANY promise rejects.
// The second promise rejects at 50ms with "fail-b".
// Even though the other promises would succeed, Promise.all short-circuits.
// The results array is never created — the catch block runs instead.
// See README → Section 4: Parallel Execution with Promise.all

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: return vs return await in try/catch

async function solution5() {
  async function withoutAwait(): Promise<string> {
    try {
      return Promise.reject(new Error("oops"));
    } catch (err) {
      return "caught";
    }
  }

  async function withAwait(): Promise<string> {
    try {
      return await Promise.reject(new Error("oops"));
    } catch (err) {
      return "caught";
    }
  }

  try {
    const a = await withoutAwait();
    console.log("a:", a);
  } catch (err) {
    console.log("a threw:", (err as Error).message);
  }

  const b = await withAwait();
  console.log("b:", b);
}

// ANSWER:
// Log 1: "a threw: oops"
// Log 2: "b: caught"
//
// Explanation:
// `withoutAwait`: `return Promise.reject(...)` passes the rejected promise
// directly to the caller WITHOUT awaiting — the local catch never triggers.
// The caller's try/catch catches it.
//
// `withAwait`: `return await Promise.reject(...)` awaits the rejection INSIDE
// the function, which throws in the try block, so the local catch triggers
// and returns "caught".
// See README → Section 10: Common Gotchas → Gotcha 5

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: await with non-promise values

async function solution6() {
  const a = await 42;
  const b = await "hello";
  const c = await null;
  const d = await undefined;

  console.log(a, b, c, d);
}

// ANSWER:
// Log 1: 42 "hello" null undefined
//
// Explanation:
// `await` on a non-promise value wraps it in Promise.resolve() and
// immediately resolves, returning the value as-is.
// See README → Section 2: await with non-promise values

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Promise.allSettled with async/await

async function solution7() {
  const results = await Promise.allSettled([
    delayValue(50, "success"),
    delayReject(50, "failure"),
  ]);

  const output = results.map(r =>
    r.status === "fulfilled" ? r.value : r.reason.message
  );

  console.log(output);
}

// ANSWER:
// Log 1: ["success", "failure"]
//
// Explanation:
// Promise.allSettled NEVER rejects. It waits for all promises to settle and
// returns an array of { status, value/reason } objects.
// The first promise fulfills with "success", the second rejects with Error("failure").
// We extract value or reason.message respectively.
// See README → Section 9: Combining with Promise Methods

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Execution order — microtasks vs macrotasks

async function solution8() {
  console.log(1);

  setTimeout(() => console.log(2), 0);

  await Promise.resolve();
  console.log(3);

  setTimeout(() => console.log(4), 0);

  await Promise.resolve();
  console.log(5);
}

// ANSWER:
// Order: 1, 3, 5, 2, 4
//
// Explanation:
// - Log 1: synchronous.
// - setTimeout(log 2, 0): queued as macrotask.
// - `await Promise.resolve()`: yields to microtask queue, then resumes.
// - Log 3: runs as microtask continuation (before any macrotasks).
// - setTimeout(log 4, 0): queued as macrotask.
// - `await Promise.resolve()`: yields again, resumes as microtask.
// - Log 5: runs as microtask continuation.
// - Macrotask queue runs: log 2, then log 4.
// See README → Section 2: The await Keyword (microtask scheduling)

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Sequential → Parallel

async function solution9(): Promise<[string, string, string]> {
  const [a, b, c] = await Promise.all([
    delayValue(100, "alpha"),
    delayValue(100, "beta"),
    delayValue(100, "gamma"),
  ]);
  return [a, b, c];
}

// Explanation:
// The original code awaited each promise sequentially (3 × 100ms = ~300ms).
// Using Promise.all starts all three in parallel, so total is ~100ms.
// See README → Section 5: Sequential vs Parallel

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: forEach with await (doesn't work)

async function solution10(urls: string[]): Promise<string[]> {
  const results: string[] = [];

  for (const url of urls) {
    const value = await delayValue(50, `data-from-${url}`);
    results.push(value);
  }

  return results;
}

// Explanation:
// forEach fires all callbacks synchronously and ignores their return values
// (including promises). The outer function returns before any awaits complete.
// Fix: use for...of which properly respects await on each iteration.
// See README → Section 10: Common Gotchas → Gotcha 2

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Missing error handling — rethrow after logging

async function solution11(shouldFail: boolean): Promise<string> {
  try {
    if (shouldFail) {
      throw new Error("something went wrong");
    }
    return "success";
  } catch (err) {
    console.log("Error occurred:", (err as Error).message);
    throw err; // FIX: rethrow so the caller knows it failed
  }
}

// Explanation:
// The original code caught the error and logged it, but never rethrew.
// This meant the function returned undefined instead of propagating the error.
// Adding `throw err` after logging ensures the caller can handle the error.
// See README → Section 10: Common Gotchas → Gotcha 4

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Forgetting await — subtle timing bug

async function solution12(): Promise<number> {
  async function fetchNumber(): Promise<number> {
    return delayValue(50, 10);
  }

  async function doubleIt(n: number): Promise<number> {
    return delayValue(50, n * 2);
  }

  const num = await fetchNumber();      // FIX: added await
  const result = await doubleIt(num);   // FIX: added await
  return result;
}

// Explanation:
// Without await, `num` was a Promise<number>, not a number.
// Passing a Promise to doubleIt resulted in NaN (Promise * 2 = NaN).
// Adding await unwraps the promise to the actual number value.
// See README → Section 10: Common Gotchas → Gotcha 1

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: fetchWithRetry

async function solution13<T>(
  fn: () => Promise<T>,
  retries: number,
  delayMs: number = 0,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries && delayMs > 0) {
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

// Explanation:
// We loop retries + 1 times (1 initial attempt + retries).
// On each attempt we try calling fn(). If it succeeds, we return immediately.
// If it fails, we save the error and optionally wait before retrying.
// If all attempts fail, we throw the last error.
// See README → Section 3: Error Handling & Section 6: await in for...of

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: parallelMap

async function solution14<T, U>(
  items: T[],
  fn: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  return Promise.all(items.map((item, index) => fn(item, index)));
}

// Explanation:
// items.map() creates an array of promises (one per item), all started immediately.
// Promise.all waits for all of them and preserves order.
// See README → Section 4: Parallel Execution with Promise.all

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: asyncPipe

function solution15<T>(...fns: ((val: T) => Promise<T>)[]): (input: T) => Promise<T> {
  return async (input: T) => {
    let result = input;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

// Explanation:
// Returns a new async function that chains all the given async functions
// sequentially using for...of with await. Each function's output becomes
// the next function's input. This is the async version of pipe/compose.
// See README → Section 6: await in for...of Loops

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: rateLimiter

async function solution16<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      results[index] = await tasks[index]();
    }
  }

  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(limit, tasks.length); i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}

// Explanation:
// We create `limit` workers that each pull from a shared index.
// Each worker runs tasks sequentially from the shared queue.
// Multiple workers run concurrently via Promise.all, giving us
// at most `limit` concurrent tasks. Results are stored by original index.
// See README → Section 4: Parallel Execution & Section 6: for...of Loops

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: timeout wrapper

class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

async function solution17<T>(
  fn: () => Promise<T>,
  ms: number,
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  return Promise.race([fn(), timeout]);
}

// Explanation:
// We create a timeout promise that rejects after `ms` milliseconds.
// Promise.race returns the first promise to settle. If fn() completes
// before the timeout, its result is returned. If the timeout fires first,
// the TimeoutError is thrown.
// See README → Section 9: Combining with Promise Methods (Promise.race)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: asyncReduce

async function solution18<T, U>(
  items: T[],
  reducer: (accumulator: U, item: T, index: number) => Promise<U>,
  initial: U,
): Promise<U> {
  let accumulator = initial;
  for (let i = 0; i < items.length; i++) {
    accumulator = await reducer(accumulator, items[i], i);
  }
  return accumulator;
}

// Explanation:
// We iterate sequentially with a for loop, awaiting each reducer call.
// Each step must complete before the next begins (sequential by design).
// This is the async equivalent of Array.prototype.reduce.
// See README → Section 6: await in for...of Loops

// ============================================================================
// Run all solutions to verify:
// ============================================================================

(async () => {
  console.log("=== Exercise 1: async always returns promise ===");
  await solution1();

  console.log("\n=== Exercise 2: Execution order with await ===");
  await solution2();

  console.log("\n=== Exercise 3: try/catch with async ===");
  await solution3();

  console.log("\n=== Exercise 4: Promise.all rejection ===");
  await solution4();

  console.log("\n=== Exercise 5: return vs return await ===");
  await solution5();

  console.log("\n=== Exercise 6: await non-promise values ===");
  await solution6();

  console.log("\n=== Exercise 7: Promise.allSettled ===");
  await solution7();

  console.log("\n=== Exercise 8: Microtasks vs macrotasks ===");
  await solution8();
  // Need to wait for setTimeout callbacks to flush
  await delay(100);

  console.log("\n=== Exercise 9: Sequential → Parallel (fix) ===");
  {
    const start = Date.now();
    const result = await solution9();
    const elapsed = Date.now() - start;
    console.log(result);
    console.log(`Elapsed: ${elapsed}ms (should be ~100ms)`);
  }

  console.log("\n=== Exercise 10: forEach → for...of (fix) ===");
  {
    const result = await solution10(["a", "b", "c"]);
    console.log(result); // ["data-from-a", "data-from-b", "data-from-c"]
  }

  console.log("\n=== Exercise 11: Rethrow after logging (fix) ===");
  try {
    await solution11(true);
    console.log("Should not reach here");
  } catch (err) {
    console.log("Caller caught:", (err as Error).message);
  }

  console.log("\n=== Exercise 12: Forgetting await (fix) ===");
  {
    const val = await solution12();
    console.log(val);          // 20
    console.log(typeof val);   // "number"
  }

  console.log("\n=== Exercise 13: fetchWithRetry ===");
  {
    let attempt = 0;
    const result = await solution13(
      async () => {
        attempt++;
        if (attempt < 3) throw new Error(`attempt ${attempt}`);
        return "success on attempt 3";
      },
      5,
      50,
    );
    console.log(result); // "success on attempt 3"

    try {
      await solution13(async () => { throw new Error("always fails"); }, 2, 0);
    } catch (err) {
      console.log((err as Error).message); // "always fails"
    }
  }

  console.log("\n=== Exercise 14: parallelMap ===");
  {
    const result = await solution14(
      [1, 2, 3],
      async (n, i) => {
        await delay(100 - i * 30);
        return n * 10;
      },
    );
    console.log(result); // [10, 20, 30]
  }

  console.log("\n=== Exercise 15: asyncPipe ===");
  {
    const pipeline = solution15<number>(
      async (n) => { await delay(10); return n + 1; },
      async (n) => { await delay(10); return n * 2; },
      async (n) => { await delay(10); return n + 10; },
    );
    const result = await pipeline(5);
    console.log(result); // 22
  }

  console.log("\n=== Exercise 16: rateLimiter ===");
  {
    let running = 0;
    let maxRunning = 0;

    const tasks = [50, 150, 100, 80, 120].map((ms, i) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await delay(ms);
      running--;
      return `task-${i}`;
    });

    const results = await solution16(tasks, 2);
    console.log(results); // ["task-0", "task-1", "task-2", "task-3", "task-4"]
    console.log(`Max concurrent: ${maxRunning} (limit was 2)`);
  }

  console.log("\n=== Exercise 17: timeout wrapper ===");
  {
    const fast = await solution17(() => delayValue(50, "fast"), 200);
    console.log(fast); // "fast"

    try {
      await solution17(() => delayValue(500, "slow"), 100);
    } catch (err) {
      console.log(err instanceof TimeoutError); // true
      console.log((err as Error).message); // "Operation timed out after 100ms"
    }
  }

  console.log("\n=== Exercise 18: asyncReduce ===");
  {
    const result = await solution18(
      [1, 2, 3, 4],
      async (acc, n) => {
        await delay(10);
        return acc + n;
      },
      0,
    );
    console.log(result); // 10

    const result2 = await solution18(
      ["a", "b", "c"],
      async (acc, s, i) => {
        await delay(10);
        return { ...acc, [s]: i };
      },
      {} as Record<string, number>,
    );
    console.log(result2); // { a: 0, b: 1, c: 2 }
  }

  console.log("\n=== All solutions verified! ===");
})();
