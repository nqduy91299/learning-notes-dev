// ============================================================================
// 01-callbacks: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
//
// Run:  npx tsx 01-javascript/03-async/01-callbacks/solutions.ts
// ============================================================================

// ─── Type aliases used throughout ───────────────────────────────────────────

type ErrorFirstCallback<T> = (err: Error | null, result: T | null) => void;
type VoidCallback = () => void;

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// We run exercises sequentially so async output doesn't interleave
async function runAll(): Promise<void> {
  console.log("=== Exercise 1: setTimeout ordering ===");
  solution1();
  await delay(50);

  console.log("\n=== Exercise 2: Nested setTimeout ordering ===");
  solution2();
  await delay(50);

  console.log("\n=== Exercise 3: Synchronous callbacks ===");
  solution3();

  console.log("\n=== Exercise 4: Sync + async mixed ===");
  solution4();
  await delay(50);

  console.log("\n=== Exercise 5: Losing `this` ===");
  solution5();

  console.log("\n=== Exercise 6: var + setTimeout ===");
  solution6();
  await delay(50);

  console.log("\n=== Exercise 7: let + setTimeout ===");
  solution7();
  await delay(50);

  console.log("\n=== Exercise 8: Fix — error handling ===");
  await new Promise<void>((resolve) => {
    solution8("missing.txt", (err, result) => {
      console.log("err:", err?.message ?? "none");
      console.log("result:", result);
      resolve();
    });
  });

  console.log("\n=== Exercise 8b: Fix — success case ===");
  await new Promise<void>((resolve) => {
    solution8("config.json", (err, result) => {
      console.log("err:", err?.message ?? "none");
      console.log("result:", result);
      resolve();
    });
  });

  console.log("\n=== Exercise 9: Fix — double callback ===");
  await new Promise<void>((resolve) => {
    solution9(-5, (err, result) => {
      console.log("err:", err?.message ?? "none", "result:", result);
      resolve();
    });
  });

  console.log("\n=== Exercise 10: Fix — callback hell refactor ===");
  await new Promise<void>((resolve) => {
    solution10((err, result) => {
      console.log("err:", err?.message ?? "none");
      console.log("result:", result);
      resolve();
    });
  });

  console.log("\n=== Exercise 11: asyncMap ===");
  await new Promise<void>((resolve) => {
    solution11(
      [1, 2, 3],
      (n, cb) => setTimeout(() => cb(null, n * 10), Math.random() * 50),
      (err, results) => {
        console.log("err:", err?.message ?? "none");
        console.log("results:", results);
        resolve();
      }
    );
  });

  console.log("\n=== Exercise 11b: asyncMap with error ===");
  await new Promise<void>((resolve) => {
    solution11(
      [1, 2, 3],
      (n, cb) => {
        if (n === 2) setTimeout(() => cb(new Error("Boom at 2"), null), 10);
        else setTimeout(() => cb(null, n * 10), 10);
      },
      (err, results) => {
        console.log("err:", err?.message ?? "none");
        console.log("results:", results);
        resolve();
      }
    );
  });

  console.log("\n=== Exercise 12: asyncWaterfall ===");
  await new Promise<void>((resolve) => {
    solution12(
      1,
      [
        (n, cb) => setTimeout(() => cb(null, n + 10), 10),
        (n, cb) => setTimeout(() => cb(null, n! * 2), 10),
        (n, cb) => setTimeout(() => cb(null, n! + 3), 10),
      ],
      (err, result) => {
        console.log("err:", err?.message ?? "none");
        console.log("result:", result); // ((1 + 10) * 2) + 3 = 25
        resolve();
      }
    );
  });

  console.log("\n=== Exercise 13: asyncParallel ===");
  await new Promise<void>((resolve) => {
    solution13(
      [
        (cb) => setTimeout(() => cb(null, "fast"), 10),
        (cb) => setTimeout(() => cb(null, "slow"), 50),
        (cb) => setTimeout(() => cb(null, "medium"), 30),
      ],
      (err, results) => {
        console.log("err:", err?.message ?? "none");
        console.log("results:", results);
        resolve();
      }
    );
  });

  console.log("\n=== Exercise 14: retry ===");
  await new Promise<void>((resolve) => {
    let attempt14 = 0;
    solution14(
      (cb) => {
        attempt14++;
        if (attempt14 < 3) {
          setTimeout(() => cb(new Error(`Fail #${attempt14}`), null), 10);
        } else {
          setTimeout(() => cb(null, "Success on attempt " + attempt14), 10);
        }
      },
      5,
      (err, result) => {
        console.log("err:", err?.message ?? "none");
        console.log("result:", result);
        resolve();
      }
    );
  });

  console.log("\n=== Exercise 14b: retry — all fail ===");
  await new Promise<void>((resolve) => {
    let attempt14b = 0;
    solution14(
      (cb) => {
        attempt14b++;
        setTimeout(() => cb(new Error(`Fail #${attempt14b}`), null), 10);
      },
      3,
      (err, result) => {
        console.log("err:", err?.message ?? "none");
        console.log("result:", result);
        resolve();
      }
    );
  });

  console.log("\n=== Exercise 15: promisify ===");
  function asyncDouble(n: number, cb: ErrorFirstCallback<number>): void {
    setTimeout(() => {
      if (n < 0) cb(new Error("Negative!"), null);
      else cb(null, n * 2);
    }, 10);
  }

  const promiseDouble = solution15(asyncDouble);
  const r15a = await promiseDouble(21);
  console.log("promiseDouble(21):", r15a); // 42

  try {
    await promiseDouble(-1);
  } catch (e) {
    console.log("promiseDouble(-1) error:", (e as Error).message); // "Negative!"
  }

  console.log("\n=== All solutions verified! ===");
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout ordering — sync vs async

function solution1(): void {
  console.log("A");
  setTimeout(() => console.log("B"), 0);
  console.log("C");
  setTimeout(() => console.log("D"), 0);
  console.log("E");
}

// ANSWER:
// Log order: A, C, E, B, D
//
// Explanation:
// All synchronous code runs first (A, C, E). setTimeout callbacks — even with
// delay 0 — are placed on the task queue and only run after the call stack
// clears. B and D execute in the order they were scheduled.
// See README → Section 3: Asynchronous Callbacks → setTimeout

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Nested setTimeout ordering

function solution2(): void {
  setTimeout(() => {
    console.log("1");
    setTimeout(() => console.log("2"), 0);
    console.log("3");
  }, 0);
  console.log("4");
}

// ANSWER:
// Log order: 4, 1, 3, 2
//
// Explanation:
// Synchronous "4" runs first. Then the outer setTimeout fires, logging "1".
// The inner setTimeout is scheduled (goes to task queue). "3" logs synchronously
// within the outer callback. Finally, the inner setTimeout fires, logging "2".
// See README → Section 3: Asynchronous Callbacks → setTimeout

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Synchronous callbacks execute immediately

function solution3(): void {
  const result: string[] = [];

  result.push("start");

  [1, 2, 3].forEach((n) => {
    result.push(`item-${n}`);
  });

  result.push("end");

  console.log(result);
}

// ANSWER:
// Log 1: ["start", "item-1", "item-2", "item-3", "end"]
//
// Explanation:
// forEach is synchronous — the callback runs immediately for each element
// before forEach returns. So "start" is pushed, then all items, then "end",
// all in a single synchronous flow.
// See README → Section 2: Synchronous Callbacks

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Sync callback vs async callback mixed

function solution4(): void {
  console.log("1");

  [10, 20, 30].map((n) => {
    console.log(n);
    return n * 2;
  });

  setTimeout(() => console.log("2"), 0);

  console.log("3");
}

// ANSWER:
// Log order: 1, 10, 20, 30, 3, 2
//
// Explanation:
// "1" logs first. map is synchronous — its callback logs 10, 20, 30 immediately.
// setTimeout schedules "2" on the task queue. "3" logs synchronously.
// After the call stack clears, "2" fires from the task queue.
// See README → Section 2 (sync) and Section 3 (async)

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Losing `this` in a callback

function solution5(): void {
  const counter = {
    count: 0,
    increment() {
      this.count++;
    },
  };

  const fns = [counter.increment, counter.increment, counter.increment];
  fns.forEach((fn) => fn());

  console.log(counter.count);
}

// ANSWER:
// Log 1: 0
//
// Explanation:
// When counter.increment is stored in the fns array, the method reference
// is detached from the counter object. Calling fn() invokes it as a plain
// function — `this` is undefined (strict mode), so `this.count++` either
// throws silently or increments a different (global/undefined) property.
// counter.count remains 0.
// See README → Section 8: Common Gotchas → Gotcha 1: Losing `this`

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout with loop variable capture (var)

function solution6(): void {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
}

// ANSWER:
// Log output: 3, 3, 3
//
// Explanation:
// `var` is function-scoped, not block-scoped. By the time the setTimeout
// callbacks run, the loop has finished and `i` is 3. All three callbacks
// close over the same `i` variable. This is a classic closure gotcha.
// See README → Section 8: Common Gotchas

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout with let vs var

function solution7(): void {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
}

// ANSWER:
// Log output: 0, 1, 2
//
// Explanation:
// `let` is block-scoped — each loop iteration creates a new `i` binding.
// Each setTimeout callback captures its own copy of `i`, so they log
// 0, 1, 2 as expected. This is the standard fix for the var closure gotcha.
// See README → Section 8: Common Gotchas

// ─── Exercise 8: Fix the Bug — Error handling ───────────────────────────────
// Topic: Missing error check in error-first callback

function simulateReadFile(
  path: string,
  callback: ErrorFirstCallback<string>
): void {
  setTimeout(() => {
    if (path === "missing.txt") {
      callback(new Error("File not found: " + path), null);
    } else {
      callback(null, '{"port": 3000}');
    }
  }, 10);
}

function solution8(
  path: string,
  callback: ErrorFirstCallback<object>
): void {
  simulateReadFile(path, (err, data) => {
    // FIX: check err first before using data
    if (err) {
      callback(err, null);
      return;
    }
    try {
      const parsed = JSON.parse(data as string);
      callback(null, parsed);
    } catch (parseErr) {
      callback(parseErr as Error, null);
    }
  });
}

// Explanation:
// The original code ignored `err` and immediately tried JSON.parse(data).
// When the file is missing, `data` is null → JSON.parse(null) throws.
// Fix: (1) Check err first, return early. (2) Wrap JSON.parse in try/catch
// to handle malformed data.
// See README → Section 4: Error-First Callback Convention → Rule 3

// ─── Exercise 9: Fix the Bug — Double callback ─────────────────────────────
// Topic: Preventing double callback invocation

function solution9(
  value: number,
  callback: ErrorFirstCallback<string>
): void {
  if (value < 0) {
    return callback(new Error("Negative value"), null);
    // FIX: `return` prevents further execution
  }

  if (value > 100) {
    return callback(new Error("Value too large"), null);
    // FIX: `return` prevents further execution
  }

  setTimeout(() => {
    callback(null, `Processed: ${value}`);
  }, 10);
}

// Explanation:
// The original code called callback(error) but didn't return, so execution
// continued to the setTimeout which called callback again. Fix: use
// `return callback(...)` to exit the function immediately after calling
// the error callback.
// See README → Section 8: Common Gotchas → Gotcha 3: Multiple calls

// ─── Exercise 10: Fix the Bug — Callback hell refactor ─────────────────────
// Topic: Flatten nested callbacks using named functions

function simulateAsync(
  label: string,
  callback: ErrorFirstCallback<string>
): void {
  setTimeout(() => callback(null, `${label}-done`), 10);
}

function solution10(finalCallback: ErrorFirstCallback<string>): void {
  // REFACTORED: flat named functions instead of nested callbacks

  function onStep1(err: Error | null, r1: string | null): void {
    if (err) return finalCallback(err, null);
    simulateAsync("step2", (err2, r2) => onStep2(err2, r1!, r2));
  }

  function onStep2(
    err: Error | null,
    r1: string,
    r2: string | null
  ): void {
    if (err) return finalCallback(err, null);
    simulateAsync("step3", (err3, r3) => onStep3(err3, r1, r2!, r3));
  }

  function onStep3(
    err: Error | null,
    r1: string,
    r2: string,
    r3: string | null
  ): void {
    if (err) return finalCallback(err, null);
    finalCallback(null, [r1, r2, r3].join(" → "));
  }

  simulateAsync("step1", onStep1);
}

// Explanation:
// The original had 3 levels of nesting (pyramid of doom). By extracting
// each step into a named function, the code reads linearly while maintaining
// the same sequential behavior. Each function handles its error and passes
// accumulated results forward.
// See README → Section 5: Callback Hell → Partial mitigation: named functions

// ─── Exercise 11: Implement — asyncMap ──────────────────────────────────────
// Topic: Run an async callback-based operation on each element, collect results

function solution11<T, U>(
  items: T[],
  asyncFn: (item: T, cb: ErrorFirstCallback<U>) => void,
  finalCallback: ErrorFirstCallback<U[]>
): void {
  if (items.length === 0) {
    return finalCallback(null, []);
  }

  const results: (U | null)[] = new Array(items.length).fill(null);
  let completed = 0;
  let hasErrored = false;

  items.forEach((item, index) => {
    asyncFn(item, (err, result) => {
      if (hasErrored) return;

      if (err) {
        hasErrored = true;
        return finalCallback(err, null);
      }

      results[index] = result;
      completed++;

      if (completed === items.length) {
        finalCallback(null, results as U[]);
      }
    });
  });
}

// Explanation:
// Launch all async operations in parallel. Use an index-based results array
// to maintain order regardless of completion order. Track completed count.
// On error, set a flag to ignore subsequent completions and call finalCallback
// with the error. This mirrors how Promise.all works, but with callbacks.
// See README → Section 6: Inversion of Control (we must guard against double calls)

// ─── Exercise 12: Implement — asyncWaterfall ────────────────────────────────
// Topic: Run async tasks in sequence, passing each result to the next

type AsyncStep<T> = (input: T, cb: ErrorFirstCallback<T>) => void;

function solution12<T>(
  initial: T,
  steps: AsyncStep<T>[],
  finalCallback: ErrorFirstCallback<T>
): void {
  function runStep(index: number, currentValue: T): void {
    if (index >= steps.length) {
      return finalCallback(null, currentValue);
    }

    steps[index](currentValue, (err, result) => {
      if (err) return finalCallback(err, null);
      runStep(index + 1, result as T);
    });
  }

  runStep(0, initial);
}

// Explanation:
// Recursive approach: each step receives the current value, calls the async
// function, and on success passes the result to the next step. On error,
// short-circuit to finalCallback. This is the "waterfall" pattern used in
// libraries like async.js.
// See README → Section 5: Callback Hell (this is the structured solution)

// ─── Exercise 13: Implement — asyncParallel ─────────────────────────────────
// Topic: Run multiple async tasks in parallel, collect all results

type AsyncTask<T> = (cb: ErrorFirstCallback<T>) => void;

function solution13<T>(
  tasks: AsyncTask<T>[],
  finalCallback: ErrorFirstCallback<T[]>
): void {
  if (tasks.length === 0) {
    return finalCallback(null, []);
  }

  const results: (T | null)[] = new Array(tasks.length).fill(null);
  let completed = 0;
  let hasErrored = false;

  tasks.forEach((task, index) => {
    task((err, result) => {
      if (hasErrored) return;

      if (err) {
        hasErrored = true;
        return finalCallback(err, null);
      }

      results[index] = result;
      completed++;

      if (completed === tasks.length) {
        finalCallback(null, results as T[]);
      }
    });
  });
}

// Explanation:
// Similar to asyncMap but each task is a standalone function (no input item).
// All tasks start immediately (parallel). Results array preserves order via
// index. The hasErrored flag ensures finalCallback is called at most once.
// See README → Section 6: Inversion of Control (guard against multiple calls)

// ─── Exercise 14: Implement — retry ─────────────────────────────────────────
// Topic: Retry an async operation up to N times on failure

function solution14<T>(
  operation: (cb: ErrorFirstCallback<T>) => void,
  retries: number,
  finalCallback: ErrorFirstCallback<T>
): void {
  function attempt(remaining: number): void {
    operation((err, result) => {
      if (!err) {
        return finalCallback(null, result);
      }

      if (remaining <= 0) {
        return finalCallback(err, null);
      }

      attempt(remaining - 1);
    });
  }

  attempt(retries);
}

// Explanation:
// Recursive retry: run the operation, on success return immediately.
// On error, decrement remaining retries and try again. When retries are
// exhausted, propagate the last error. This pattern is common in network
// request libraries and resilient service clients.
// See README → Section 4: Error-First Callback Convention

// ─── Exercise 15: Implement — promisify ─────────────────────────────────────
// Topic: Convert an error-first callback function into a Promise-returning one

function solution15<TArgs extends unknown[], TResult>(
  fn: (...args: [...TArgs, ErrorFirstCallback<TResult>]) => void
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs): Promise<TResult> => {
    return new Promise<TResult>((resolve, reject) => {
      const callback: ErrorFirstCallback<TResult> = (err, result) => {
        if (err) reject(err);
        else resolve(result as TResult);
      };

      fn(...args, callback);
    });
  };
}

// Explanation:
// The returned function creates a new Promise. Inside the Promise executor,
// we construct an error-first callback that either rejects or resolves.
// We then call the original function with the original arguments plus our
// callback. This is exactly how Node.js util.promisify works internally.
// See README → Section 7: Why Callbacks Led to Promises

// ============================================================================
// Run all solutions:
// ============================================================================

runAll();
