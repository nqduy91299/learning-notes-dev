// ============================================================================
// 02-promises: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Basic then chain order + microtask timing

function solution1(): void {
  console.log(1);

  Promise.resolve().then(() => {
    console.log(2);
  });

  console.log(3);

  Promise.resolve().then(() => {
    console.log(4);
  });

  console.log(5);
}

// ANSWER:
// Order: 1, 3, 5, 2, 4
//
// Explanation:
// Synchronous code (1, 3, 5) runs first. Promise.resolve().then() callbacks
// are microtasks — they queue up and run after all synchronous code completes,
// in the order they were scheduled (2, then 4).
// See README → Section 11: Microtask Queue

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: then chain — value propagation

function solution2(): Promise<void> {
  return Promise.resolve(10)
    .then(val => {
      console.log("A:", val);
      return val + 5;
    })
    .then(val => {
      console.log("B:", val);
      return val * 2;
    })
    .then(val => {
      console.log("C:", val);
    })
    .then(val => {
      console.log("D:", val);
    });
}

// ANSWER:
// Log A: A: 10
// Log B: B: 15
// Log C: C: 30
// Log D: D: undefined
//
// Explanation:
// Each .then receives the return value of the previous .then handler.
// A receives 10 (the initial value), returns 15.
// B receives 15, returns 30.
// C receives 30, but doesn't return anything (implicit undefined).
// D receives undefined because C had no return statement.
// See README → Section 4: Promise Chaining → Returning plain values

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Error propagation through a chain

function solution3(): Promise<void> {
  return Promise.resolve(1)
    .then(val => {
      console.log("A:", val);
      throw new Error("boom");
    })
    .then(val => {
      console.log("B:", val);
    })
    .catch(err => {
      console.log("C:", (err as Error).message);
      return 42;
    })
    .then(val => {
      console.log("D:", val);
    });
}

// ANSWER:
// Logs: A: 1, C: boom, D: 42
//
// Explanation:
// A logs 1, then throws. The error skips B (no error handler) and propagates
// to the .catch. C logs "boom" and returns 42 — this RECOVERS the chain.
// The returned 42 fulfills the Promise from .catch, so D receives 42.
// See README → Section 5: Error Handling → Errors propagate down the chain
// See README → Section 5: Error Handling → Recovering from errors

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Promise.all with a rejection

function solution4(): Promise<void> {
  return Promise.all([
    Promise.resolve(1),
    Promise.reject("fail"),
    Promise.resolve(3),
  ])
    .then(results => {
      console.log("Results:", results);
    })
    .catch(err => {
      console.log("Error:", err);
    });
}

// ANSWER:
// Log: Error: fail
//
// Explanation:
// Promise.all is fail-fast. The second Promise rejects with "fail",
// so the entire Promise.all rejects immediately with that reason.
// The .then is skipped and the .catch runs.
// See README → Section 6: Promise.all → Fail-fast behavior

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Promise.allSettled

function solution5(): Promise<void> {
  return Promise.allSettled([
    Promise.resolve("ok"),
    Promise.reject("fail"),
    Promise.resolve(42),
  ]).then(results => {
    results.forEach(r => {
      if (r.status === "fulfilled") {
        console.log("fulfilled:", r.value);
      } else {
        console.log("rejected:", r.reason);
      }
    });
  });
}

// ANSWER:
// fulfilled: ok
// rejected: fail
// fulfilled: 42
//
// Explanation:
// Promise.allSettled waits for ALL Promises to settle and reports each
// result with { status, value } or { status, reason }. It never rejects.
// See README → Section 7: Promise.allSettled

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Promise.race behavior

function solution6(): Promise<void> {
  return Promise.race([
    new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
    new Promise(resolve => setTimeout(() => resolve("fast"), 50)),
    new Promise((_, reject) => setTimeout(() => reject("error"), 100)),
  ])
    .then(val => console.log("Winner:", val))
    .catch(err => console.log("Error:", err));
}

// ANSWER:
// Log: Winner: fast
//
// Explanation:
// Promise.race settles with the first Promise to settle. The "fast" Promise
// resolves at 50ms, before the rejection at 100ms and "slow" at 200ms.
// See README → Section 8: Promise.race

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Promise.race — rejection wins

function solution7(): Promise<void> {
  return Promise.race([
    new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
    new Promise((_, reject) => setTimeout(() => reject("fast error"), 50)),
  ])
    .then(val => console.log("Winner:", val))
    .catch(err => console.log("Error:", err));
}

// ANSWER:
// Log: Error: fast error
//
// Explanation:
// The rejection at 50ms settles before the resolve at 200ms.
// Promise.race doesn't distinguish between fulfillment and rejection —
// whichever settles first wins. Since the rejection is first, the
// race Promise rejects.
// See README → Section 8: Promise.race

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Promise.any — first fulfillment wins

function solution8(): Promise<void> {
  return Promise.any([
    Promise.reject("err1"),
    new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
    new Promise(resolve => setTimeout(() => resolve("fast"), 50)),
  ])
    .then(val => console.log("First success:", val))
    .catch(err => console.log("All failed:", err));
}

// ANSWER:
// Log: First success: fast
//
// Explanation:
// Promise.any ignores rejections and waits for the first FULFILLMENT.
// The immediate rejection ("err1") is ignored. "fast" fulfills at 50ms
// before "slow" at 200ms, so "fast" is the winner.
// See README → Section 9: Promise.any

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: finally passthrough

function solution9(): Promise<void> {
  return Promise.resolve("hello")
    .finally(() => {
      console.log("A: cleanup");
      return "ignored";
    })
    .then(val => {
      console.log("B:", val);
    });
}

// ANSWER:
// Log A: A: cleanup
// Log B: B: hello
//
// Explanation:
// .finally() runs its callback but passes through the original value.
// The return value "ignored" is discarded. The .then after .finally
// receives the original value "hello".
// See README → Section 3: .finally

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Microtask queue vs setTimeout

function solution10(): void {
  setTimeout(() => console.log("A"), 0);

  Promise.resolve()
    .then(() => {
      console.log("B");
      return Promise.resolve();
    })
    .then(() => console.log("C"));

  Promise.resolve().then(() => console.log("D"));

  console.log("E");
}

// ANSWER:
// Order: E, B, D, C, A
//
// Explanation:
// 1. "E" — synchronous, runs immediately.
// 2. "B" — first microtask in the queue (scheduled before D's microtask
//    in code order? No — both are scheduled synchronously, but the first
//    .then from the first chain and the .then from the second chain are
//    both queued. They run in order: B first, then D).
// 3. "D" — second microtask queued at the same level.
// 4. "C" — B's .then returned Promise.resolve(), so C is scheduled as a
//    new microtask after B and D have run. The extra Promise.resolve()
//    return adds a microtask tick.
// 5. "A" — setTimeout is a macrotask, runs after all microtasks are drained.
// See README → Section 11: Microtask Queue

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Missing return in chain

function getUser(id: number): Promise<{ id: number; name: string }> {
  return Promise.resolve({ id, name: `User ${id}` });
}
function getUserPosts(userId: number): Promise<string[]> {
  return Promise.resolve([`Post 1 by ${userId}`, `Post 2 by ${userId}`]);
}

function solution11(userId: number): Promise<string[]> {
  return getUser(userId)
    .then(user => {
      return getUserPosts(user.id); // FIX: added `return`
    })
    .then(posts => {
      return posts;
    });
}

// Explanation:
// Without `return`, the Promise from getUserPosts is created but not chained.
// The .then handler returns undefined implicitly, so the next .then receives
// undefined instead of the posts array.
// See README → Section 12: Common Gotchas → Gotcha 1: Forgetting to return

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Unhandled rejection — error swallowed by catch

function fetchData(): Promise<string> {
  return Promise.reject(new Error("network error"));
}

function solution12(): Promise<string> {
  return fetchData()
    .catch(err => {
      console.error("Logging error:", err);
      throw err; // FIX: re-throw to propagate the error to the caller
    })
    .then(data => {
      return `Processed: ${data}`;
    });
}

// Explanation:
// The original .catch logged the error but returned undefined (implicit return),
// which RECOVERS the chain. The .then after .catch would receive undefined
// and produce "Processed: undefined" — silently hiding the error.
// By re-throwing, the error propagates so the caller can handle it.
// See README → Section 5: Error Handling → Re-throwing in catch

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: promisify

function solution13<TArg, TResult>(
  fn: (arg: TArg, callback: (err: Error | null, result: TResult) => void) => void
): (arg: TArg) => Promise<TResult> {
  return (arg: TArg) => {
    return new Promise<TResult>((resolve, reject) => {
      fn(arg, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Explanation:
// This is the one legitimate use of the Promise constructor — wrapping a
// callback-based API. We call the original function with our own callback
// that routes err → reject and result → resolve.
// See README → Section 2: Creating Promises
// See README → Section 13: Best Practices → Promisify callback APIs

// Helper for testing:
function readFileCb(
  path: string,
  callback: (err: Error | null, data: string) => void
): void {
  if (path === "good.txt") {
    setTimeout(() => callback(null, "file contents"), 10);
  } else {
    setTimeout(() => callback(new Error("ENOENT"), ""), 10);
  }
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: delay

function solution14(ms: number): Promise<void>;
function solution14<T>(ms: number, value: T): Promise<T>;
function solution14<T>(ms: number, value?: T): Promise<T | void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

// Explanation:
// Wraps setTimeout in a Promise. The resolve callback is invoked after
// the specified delay. If a value is provided, it becomes the fulfillment
// value; otherwise the Promise resolves with undefined (void).
// See README → Section 2: Creating Promises

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: retry

function solution15<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  return fn().catch(err => {
    if (retries <= 0) {
      throw err;
    }
    return solution15(fn, retries - 1);
  });
}

// Explanation:
// Call fn(). If it succeeds, the Promise fulfills and .catch is skipped.
// If it fails, .catch fires. If retries remain, recurse with retries - 1.
// If no retries left, re-throw the error so it propagates to the caller.
// This uses Promise chaining recursively — each retry is a new chain link.
// See README → Section 5: Error Handling → Re-throwing in catch

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: timeout wrapper

function solution16<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeout]);
}

// Explanation:
// Create a timeout Promise that rejects after ms milliseconds.
// Promise.race returns whichever settles first: if the input Promise
// resolves before the timeout, we get its value. If the timeout fires
// first, we get the rejection.
// See README → Section 8: Promise.race → Common use case: timeout

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: sequential execution

function solution17<T>(fns: (() => Promise<T>)[]): Promise<T[]> {
  return fns.reduce<Promise<T[]>>(
    (chain, fn) =>
      chain.then(results =>
        fn().then(result => [...results, result])
      ),
    Promise.resolve([])
  );
}

// Explanation:
// Use reduce to build a Promise chain. Start with Promise.resolve([]).
// For each function, wait for the previous chain to complete, then call
// the next function and append its result. Each fn() only starts after
// the previous one completes — this ensures sequential execution.
// See README → Section 4: Promise Chaining → Returning Promises

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: parallel with concurrency limit

function solution18<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const results: T[] = new Array(tasks.length);
    let nextIndex = 0;
    let completedCount = 0;
    let hasRejected = false;

    if (tasks.length === 0) {
      resolve([]);
      return;
    }

    function runNext(): void {
      if (hasRejected) return;
      if (nextIndex >= tasks.length) return;

      const index = nextIndex++;
      tasks[index]()
        .then(result => {
          if (hasRejected) return;
          results[index] = result;
          completedCount++;

          if (completedCount === tasks.length) {
            resolve(results);
          } else {
            runNext();
          }
        })
        .catch(err => {
          if (!hasRejected) {
            hasRejected = true;
            reject(err);
          }
        });
    }

    const initialBatch = Math.min(limit, tasks.length);
    for (let i = 0; i < initialBatch; i++) {
      runNext();
    }
  });
}

// Explanation:
// Maintain a pool of up to `limit` concurrent Promises. When one completes,
// start the next task from the queue. Track results by index to preserve
// order. Once all tasks complete, resolve with the results array.
// If any task rejects, reject the entire operation (fail-fast, like Promise.all).
// This is the Promise constructor's legitimate use — orchestrating complex
// async control flow that can't be expressed as a simple chain.
// See README → Section 6: Promise.all (for the fail-fast concept)

// ============================================================================
// Runner
// ============================================================================

async function runAll(): Promise<void> {
  console.log("=== Exercise 1: Microtask timing ===");
  solution1();
  // Need to flush microtasks before next exercise
  await new Promise(resolve => setTimeout(resolve, 0));

  console.log("\n=== Exercise 2: Value propagation ===");
  await solution2();

  console.log("\n=== Exercise 3: Error propagation ===");
  await solution3();

  console.log("\n=== Exercise 4: Promise.all rejection ===");
  await solution4();

  console.log("\n=== Exercise 5: Promise.allSettled ===");
  await solution5();

  console.log("\n=== Exercise 6: Promise.race ===");
  await solution6();

  console.log("\n=== Exercise 7: Promise.race — rejection wins ===");
  await solution7();

  console.log("\n=== Exercise 8: Promise.any ===");
  await solution8();

  console.log("\n=== Exercise 9: finally passthrough ===");
  await solution9();

  console.log("\n=== Exercise 10: Microtasks vs setTimeout ===");
  solution10();
  await new Promise(resolve => setTimeout(resolve, 50));

  console.log("\n=== Exercise 11: Fix missing return ===");
  const posts = await solution11(1);
  console.log("Posts:", posts);

  console.log("\n=== Exercise 12: Fix swallowed error ===");
  try {
    await solution12();
  } catch (err) {
    console.log("Caller caught:", (err as Error).message);
  }

  console.log("\n=== Exercise 13: promisify ===");
  const readFile = solution13(readFileCb);
  console.log("Good:", await readFile("good.txt"));
  try {
    await readFile("bad.txt");
  } catch (err) {
    console.log("Bad:", (err as Error).message);
  }

  console.log("\n=== Exercise 14: delay ===");
  const start14 = Date.now();
  await solution14(100);
  console.log(`Void delay: ~${Date.now() - start14}ms`);
  const val14 = await solution14(50, "hello");
  console.log("Value delay:", val14);

  console.log("\n=== Exercise 15: retry ===");
  let attempt = 0;
  const flakyFn = (): Promise<string> => {
    attempt++;
    if (attempt < 3) return Promise.reject(new Error(`fail #${attempt}`));
    return Promise.resolve("success on attempt 3");
  };
  console.log(await solution15(flakyFn, 5));

  attempt = 0;
  try {
    await solution15(() => {
      attempt++;
      return Promise.reject(new Error(`fail #${attempt}`));
    }, 2);
  } catch (err) {
    console.log("Exhausted retries:", (err as Error).message);
  }

  console.log("\n=== Exercise 16: timeout ===");
  const fast16 = solution14(50, "fast result");
  console.log(await solution16(fast16, 200));
  const slow16 = solution14(500, "slow result");
  try {
    await solution16(slow16, 100);
  } catch (err) {
    console.log("Timed out:", (err as Error).message);
  }

  console.log("\n=== Exercise 17: sequential execution ===");
  const start17 = Date.now();
  const tasks17 = [
    () => solution14(50, "A"),
    () => solution14(50, "B"),
    () => solution14(50, "C"),
  ];
  const results17 = await solution17(tasks17);
  console.log("Results:", results17);
  console.log(`Sequential time: ~${Date.now() - start17}ms (should be ~150ms)`);

  console.log("\n=== Exercise 18: parallel with limit ===");
  const start18 = Date.now();
  const tasks18 = [
    () => solution14(100, "A"),
    () => solution14(100, "B"),
    () => solution14(100, "C"),
    () => solution14(100, "D"),
    () => solution14(100, "E"),
  ];
  const results18 = await solution18(tasks18, 2);
  console.log("Results:", results18);
  console.log(`Limited parallel time: ~${Date.now() - start18}ms (should be ~300ms, not ~100ms or ~500ms)`);

  // Test with empty array
  const empty18 = await solution18([], 3);
  console.log("Empty:", empty18);
}

runAll().catch(console.error);
