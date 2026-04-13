// ============================================================================
// 01-callbacks: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/03-async/01-callbacks/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → find and fix the issue in the code
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Type aliases used throughout ───────────────────────────────────────────

type ErrorFirstCallback<T> = (err: Error | null, result: T | null) => void;
type VoidCallback = () => void;

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout ordering — sync vs async
//
// What is the order of the console.log output?

function exercise1(): void {
  console.log("A");
  setTimeout(() => console.log("B"), 0);
  console.log("C");
  setTimeout(() => console.log("D"), 0);
  console.log("E");
}

// YOUR ANSWER:
// Log order: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Nested setTimeout ordering
//
// What is the order of the console.log output?

function exercise2(): void {
  setTimeout(() => {
    console.log("1");
    setTimeout(() => console.log("2"), 0);
    console.log("3");
  }, 0);
  console.log("4");
}

// YOUR ANSWER:
// Log order: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Synchronous callbacks execute immediately
//
// What does each console.log print?

function exercise3(): void {
  const result: string[] = [];

  result.push("start");

  [1, 2, 3].forEach((n) => {
    result.push(`item-${n}`);
  });

  result.push("end");

  console.log(result);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Sync callback vs async callback mixed
//
// What is the order of the console.log output?

function exercise4(): void {
  console.log("1");

  [10, 20, 30].map((n) => {
    console.log(n);
    return n * 2;
  });

  setTimeout(() => console.log("2"), 0);

  console.log("3");
}

// YOUR ANSWER:
// Log order: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Losing `this` in a callback
//
// What does the console.log print?

function exercise5(): void {
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

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout with loop variable capture
//
// What does the console.log output look like?

function exercise6(): void {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
}

// YOUR ANSWER:
// Log output: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout with let vs var
//
// What does the console.log output look like?

function exercise7(): void {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
  }
}

// YOUR ANSWER:
// Log output: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Fix the Bug — Error handling ───────────────────────────────
// Topic: Missing error check in error-first callback
//
// This function simulates reading a config file. The callback usage is buggy.
// Find and fix the bug so it handles errors correctly.

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

function exercise8(path: string, callback: ErrorFirstCallback<object>): void {
  simulateReadFile(path, (_err, data) => {
    // BUG: error is not handled!
    const parsed = JSON.parse(data as string);
    callback(null, parsed);
  });
}

// Uncomment to test (should print error, not crash):
// exercise8("missing.txt", (err, result) => {
//   console.log("err:", err?.message ?? "none");
//   console.log("result:", result);
// });

// ─── Exercise 9: Fix the Bug — Callback called multiple times ──────────────
// Topic: Preventing double callback invocation
//
// This function has a bug where the callback can be called more than once.
// Fix it so the callback is called exactly once.

function exercise9(
  value: number,
  callback: ErrorFirstCallback<string>
): void {
  if (value < 0) {
    callback(new Error("Negative value"), null);
  }

  if (value > 100) {
    callback(new Error("Value too large"), null);
  }

  // BUG: this runs even after an error callback above!
  setTimeout(() => {
    callback(null, `Processed: ${value}`);
  }, 10);
}

// Uncomment to test:
// exercise9(-5, (err, result) => {
//   console.log("err:", err?.message ?? "none", "result:", result);
// });

// ─── Exercise 10: Fix the Bug — Callback hell refactor ─────────────────────
// Topic: Flatten nested callbacks using named functions
//
// Refactor this deeply nested callback code into flat named functions.
// The behavior must stay the same. Use the simulateAsync helper.

function simulateAsync(
  label: string,
  callback: ErrorFirstCallback<string>
): void {
  setTimeout(() => callback(null, `${label}-done`), 10);
}

function exercise10(callback: ErrorFirstCallback<string>): void {
  // REFACTOR: flatten this pyramid of doom into named functions
  simulateAsync("step1", (err1, r1) => {
    if (err1) { callback(err1, null); return; }
    simulateAsync("step2", (err2, r2) => {
      if (err2) { callback(err2, null); return; }
      simulateAsync("step3", (err3, r3) => {
        if (err3) { callback(err3, null); return; }
        callback(null, [r1, r2, r3].join(" → "));
      });
    });
  });
}

// Uncomment to test:
// exercise10((err, result) => {
//   console.log("err:", err?.message ?? "none");
//   console.log("result:", result);
// });

// ─── Exercise 11: Implement — asyncMap ──────────────────────────────────────
// Topic: Run an async callback-based operation on each element, collect results
//
// Given an array of items and an async function that processes each item,
// call the final callback with an array of all results (in order).
// If any operation errors, call the final callback with that error immediately.
//
// The async function signature: (item: T, cb: ErrorFirstCallback<U>) => void

function exercise11<T, U>(
  items: T[],
  asyncFn: (item: T, cb: ErrorFirstCallback<U>) => void,
  finalCallback: ErrorFirstCallback<U[]>
): void {
  // YOUR CODE HERE
  void items;
  void asyncFn;
  finalCallback(null, null);
}

// Uncomment to test:
// exercise11(
//   [1, 2, 3],
//   (n, cb) => setTimeout(() => cb(null, n * 10), Math.random() * 50),
//   (err, results) => {
//     console.log("err:", err?.message ?? "none");
//     console.log("results:", results); // [10, 20, 30]
//   }
// );

// ─── Exercise 12: Implement — asyncWaterfall ────────────────────────────────
// Topic: Run async tasks in sequence, passing each result to the next
//
// Given an initial value and an array of async functions, execute them
// in sequence. Each function receives the previous result and a callback.
// The final callback receives the last result (or first error).

type AsyncStep<T> = (input: T, cb: ErrorFirstCallback<T>) => void;

function exercise12<T>(
  initial: T,
  steps: AsyncStep<T>[],
  finalCallback: ErrorFirstCallback<T>
): void {
  // YOUR CODE HERE
  void initial;
  void steps;
  finalCallback(null, null);
}

// Uncomment to test:
// exercise12(
//   1,
//   [
//     (n, cb) => setTimeout(() => cb(null, n + 10), 10),
//     (n, cb) => setTimeout(() => cb(null, n! * 2), 10),
//     (n, cb) => setTimeout(() => cb(null, n! + 3), 10),
//   ],
//   (err, result) => {
//     console.log("err:", err?.message ?? "none");
//     console.log("result:", result); // ((1 + 10) * 2) + 3 = 25
//   }
// );

// ─── Exercise 13: Implement — asyncParallel ─────────────────────────────────
// Topic: Run multiple async tasks in parallel, collect all results
//
// Given an array of async tasks (each takes a callback), run them all
// concurrently. When all complete, call the final callback with results
// in the original order. If any task errors, call final callback with
// that error (only once).

type AsyncTask<T> = (cb: ErrorFirstCallback<T>) => void;

function exercise13<T>(
  tasks: AsyncTask<T>[],
  finalCallback: ErrorFirstCallback<T[]>
): void {
  // YOUR CODE HERE
  void tasks;
  finalCallback(null, null);
}

// Uncomment to test:
// exercise13(
//   [
//     (cb) => setTimeout(() => cb(null, "fast"), 10),
//     (cb) => setTimeout(() => cb(null, "slow"), 50),
//     (cb) => setTimeout(() => cb(null, "medium"), 30),
//   ],
//   (err, results) => {
//     console.log("err:", err?.message ?? "none");
//     console.log("results:", results); // ["fast", "slow", "medium"]
//   }
// );

// ─── Exercise 14: Implement — retry ─────────────────────────────────────────
// Topic: Retry an async operation up to N times on failure
//
// If the async operation fails, retry up to `retries` times.
// If it succeeds, call the final callback with the result immediately.
// If all retries are exhausted, call the final callback with the last error.

function exercise14<T>(
  operation: (cb: ErrorFirstCallback<T>) => void,
  retries: number,
  finalCallback: ErrorFirstCallback<T>
): void {
  // YOUR CODE HERE
  void operation;
  void retries;
  finalCallback(null, null);
}

// Uncomment to test:
// let attempt14 = 0;
// exercise14(
//   (cb) => {
//     attempt14++;
//     if (attempt14 < 3) {
//       setTimeout(() => cb(new Error(`Fail #${attempt14}`), null), 10);
//     } else {
//       setTimeout(() => cb(null, "Success on attempt " + attempt14), 10);
//     }
//   },
//   5,
//   (err, result) => {
//     console.log("err:", err?.message ?? "none");
//     console.log("result:", result); // "Success on attempt 3"
//   }
// );

// ─── Exercise 15: Implement — promisify ─────────────────────────────────────
// Topic: Convert an error-first callback function into a Promise-returning one
//
// Given a function that uses the error-first callback pattern,
// return a new function that returns a Promise instead.
// The original function signature is: (...args, callback) => void

function exercise15<TArgs extends unknown[], TResult>(
  fn: (...args: [...TArgs, ErrorFirstCallback<TResult>]) => void
): (...args: TArgs) => Promise<TResult> {
  // YOUR CODE HERE
  void fn;
  return (..._args: TArgs) => Promise.resolve(null as unknown as TResult);
}

// Uncomment to test:
// function asyncDouble(n: number, cb: ErrorFirstCallback<number>): void {
//   setTimeout(() => {
//     if (n < 0) cb(new Error("Negative!"), null);
//     else cb(null, n * 2);
//   }, 10);
// }
//
// const promiseDouble = exercise15(asyncDouble);
// promiseDouble(21).then((r) => console.log("result:", r)); // 42
// promiseDouble(-1).catch((e) => console.log("error:", e.message)); // "Negative!"
