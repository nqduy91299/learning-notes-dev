// ============================================================================
// 03-async-await: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/03-async/03-async-await/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → find and fix the issue in the code
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
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
//
// What does each console.log print?

async function exercise1() {
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

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Execution order with await
//
// What is the order of the logged numbers?

async function exercise2() {
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

// YOUR ANSWER:
// Order: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: try/catch with async — what gets caught?
//
// What does each console.log print?

async function exercise3() {
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

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Promise.all rejection behavior
//
// What does the console.log print?

async function exercise4() {
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

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: return vs return await in try/catch
//
// What does each function's caller see?

async function exercise5() {
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

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: await with non-promise values
//
// What does each console.log print?

async function exercise6() {
  const a = await 42;
  const b = await "hello";
  const c = await null;
  const d = await undefined;

  console.log(a, b, c, d);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Promise.allSettled with async/await
//
// What does the console.log print?

async function exercise7() {
  const results = await Promise.allSettled([
    delayValue(50, "success"),
    delayReject(50, "failure"),
  ]);

  const output = results.map(r =>
    r.status === "fulfilled" ? r.value : r.reason.message
  );

  console.log(output);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Execution order — microtasks vs macrotasks
//
// What order are the numbers logged?

async function exercise8() {
  console.log(1);

  setTimeout(() => console.log(2), 0);

  await Promise.resolve();
  console.log(3);

  setTimeout(() => console.log(4), 0);

  await Promise.resolve();
  console.log(5);
}

// YOUR ANSWER:
// Order: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Sequential → Parallel
//
// This function fetches three independent values sequentially.
// Fix it to run them in parallel so total time is ~100ms, not ~300ms.

async function exercise9(): Promise<[string, string, string]> {
  const a = await delayValue(100, "alpha");
  const b = await delayValue(100, "beta");
  const c = await delayValue(100, "gamma");
  return [a, b, c];
}

// Uncomment to test:
// (async () => {
//   const start = Date.now();
//   const result = await exercise9();
//   const elapsed = Date.now() - start;
//   console.log(result);
//   console.log(`Elapsed: ${elapsed}ms (should be ~100ms, not ~300ms)`);
// })();

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: forEach with await (doesn't work)
//
// This function should process URLs one at a time in order.
// Currently it doesn't wait for each fetch to complete. Fix it.

async function exercise10(urls: string[]): Promise<string[]> {
  const results: string[] = [];

  urls.forEach(async (url) => {
    const value = await delayValue(50, `data-from-${url}`);
    results.push(value);
  });

  return results;
}

// Uncomment to test:
// (async () => {
//   const result = await exercise10(["a", "b", "c"]);
//   console.log(result); // Should be ["data-from-a", "data-from-b", "data-from-c"]
// })();

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Missing error handling
//
// This function silently swallows errors. Fix it so the caller
// receives the error (rethrow after logging).

async function exercise11(shouldFail: boolean): Promise<string> {
  try {
    if (shouldFail) {
      throw new Error("something went wrong");
    }
    return "success";
  } catch (err) {
    console.log("Error occurred:", (err as Error).message);
    // Bug: error is swallowed — function returns undefined
  }
  return ""; // placeholder to satisfy compiler
}

// Uncomment to test:
// (async () => {
//   try {
//     await exercise11(true);
//     console.log("Should not reach here");
//   } catch (err) {
//     console.log("Caller caught:", (err as Error).message);
//   }
// })();

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Forgetting await — subtle timing bug
//
// This function should return the transformed data, but it returns
// a pending promise instead. Fix it.

async function exercise12(): Promise<number> {
  async function fetchNumber(): Promise<number> {
    return delayValue(50, 10);
  }

  async function doubleIt(n: number): Promise<number> {
    return delayValue(50, n * 2);
  }

  const num = fetchNumber();        // Bug here
  const result = doubleIt(num as unknown as number);  // Bug here
  return result as unknown as number;
}

// Uncomment to test:
// (async () => {
//   const val = await exercise12();
//   console.log(val); // Should be 20
//   console.log(typeof val); // Should be "number"
// })();

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: fetchWithRetry — retry a failing async operation
//
// Call `fn()`. If it rejects, retry up to `retries` times.
// If all attempts fail, throw the last error.
// Optional: wait `delayMs` between retries.

async function exercise13<T>(
  fn: () => Promise<T>,
  retries: number,
  delayMs: number = 0,
): Promise<T> {
  // YOUR CODE HERE
  return undefined as T; // placeholder
}

// Uncomment to test:
// (async () => {
//   let attempt = 0;
//   const result = await exercise13(
//     async () => {
//       attempt++;
//       if (attempt < 3) throw new Error(`attempt ${attempt}`);
//       return "success on attempt 3";
//     },
//     5,
//     50,
//   );
//   console.log(result); // "success on attempt 3"
//
//   try {
//     await exercise13(async () => { throw new Error("always fails"); }, 2, 0);
//   } catch (err) {
//     console.log((err as Error).message); // "always fails"
//   }
// })();

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: parallelMap — map over array with async fn, all in parallel
//
// Apply an async transform to each element in parallel.
// Return results in the same order as the input array.

async function exercise14<T, U>(
  items: T[],
  fn: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  // YOUR CODE HERE
  return []; // placeholder
}

// Uncomment to test:
// (async () => {
//   const result = await exercise14(
//     [1, 2, 3],
//     async (n, i) => {
//       await delay(100 - i * 30);
//       return n * 10;
//     }
//   );
//   console.log(result); // [10, 20, 30]
// })();

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: asyncPipe — compose async functions left to right
//
// Given an array of async transform functions, return a single async function
// that applies them in sequence (left to right), passing output of each
// as input to the next.

function exercise15<T>(...fns: ((val: T) => Promise<T>)[]): (input: T) => Promise<T> {
  // YOUR CODE HERE
  return async (input: T) => input; // placeholder
}

// Uncomment to test:
// (async () => {
//   const pipeline = exercise15<number>(
//     async (n) => { await delay(10); return n + 1; },
//     async (n) => { await delay(10); return n * 2; },
//     async (n) => { await delay(10); return n + 10; },
//   );
//   const result = await pipeline(5);
//   console.log(result); // (5 + 1) * 2 + 10 = 22
// })();

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: rateLimiter — run async tasks with max concurrency
//
// Given an array of async task functions and a concurrency limit,
// run at most `limit` tasks at the same time. Return all results
// in the same order as the input.

async function exercise16<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  // YOUR CODE HERE
  return []; // placeholder
}

// Uncomment to test:
// (async () => {
//   let running = 0;
//   let maxRunning = 0;
//
//   const tasks = [50, 150, 100, 80, 120].map((ms, i) => async () => {
//     running++;
//     maxRunning = Math.max(maxRunning, running);
//     await delay(ms);
//     running--;
//     return `task-${i}`;
//   });
//
//   const results = await exercise16(tasks, 2);
//   console.log(results); // ["task-0", "task-1", "task-2", "task-3", "task-4"]
//   console.log(`Max concurrent: ${maxRunning} (limit was 2)`);
// })();

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: timeout wrapper — reject if operation takes too long
//
// Wrap an async operation with a timeout. If the operation doesn't
// complete within `ms` milliseconds, reject with a TimeoutError.

class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

async function exercise17<T>(
  fn: () => Promise<T>,
  ms: number,
): Promise<T> {
  // YOUR CODE HERE
  return undefined as T; // placeholder
}

// Uncomment to test:
// (async () => {
//   const fast = await exercise17(() => delayValue(50, "fast"), 200);
//   console.log(fast); // "fast"
//
//   try {
//     await exercise17(() => delayValue(500, "slow"), 100);
//   } catch (err) {
//     console.log(err instanceof TimeoutError); // true
//     console.log((err as Error).message); // "Operation timed out after 100ms"
//   }
// })();

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: asyncReduce — sequential async reduce
//
// Like Array.reduce, but the reducer function is async.
// Each step must complete before the next begins.

async function exercise18<T, U>(
  items: T[],
  reducer: (accumulator: U, item: T, index: number) => Promise<U>,
  initial: U,
): Promise<U> {
  // YOUR CODE HERE
  return initial; // placeholder
}

// Uncomment to test:
// (async () => {
//   const result = await exercise18(
//     [1, 2, 3, 4],
//     async (acc, n) => {
//       await delay(10);
//       return acc + n;
//     },
//     0,
//   );
//   console.log(result); // 10
//
//   const result2 = await exercise18(
//     ["a", "b", "c"],
//     async (acc, s, i) => {
//       await delay(10);
//       return { ...acc, [s]: i };
//     },
//     {} as Record<string, number>,
//   );
//   console.log(result2); // { a: 0, b: 1, c: 2 }
// })();
