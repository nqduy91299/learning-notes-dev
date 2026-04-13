// ============================================================================
// 02-promises: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/03-async/02-promises/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → find and fix the issue in the code
//   - "Implement"           → write the function body (placeholder returns provided)
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Basic then chain order + microtask timing
//
// What is the order of the logged numbers?

function exercise1(): void {
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

// YOUR ANSWER:
// Order: ???

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: then chain — value propagation
//
// What does each .then receive?

function exercise2(): Promise<void> {
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

// YOUR ANSWER:
// Log A: ???
// Log B: ???
// Log C: ???
// Log D: ???

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Error propagation through a chain
//
// Which handlers run? What is logged?

function exercise3(): Promise<void> {
  return Promise.resolve(1)
    .then(val => {
      console.log("A:", val);
      throw new Error("boom");
    })
    .then(val => {
      console.log("B:", val); // Does this run?
    })
    .catch(err => {
      console.log("C:", (err as Error).message);
      return 42;
    })
    .then(val => {
      console.log("D:", val);
    });
}

// YOUR ANSWER:
// Logs: ???

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Promise.all with a rejection
//
// What is the result?

function exercise4(): Promise<void> {
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

// YOUR ANSWER:
// Log: ???

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Promise.allSettled
//
// What is the shape of the results array?

function exercise5(): Promise<void> {
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

// YOUR ANSWER:
// Logs: ???

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Promise.race behavior
//
// Which Promise wins the race?

function exercise6(): Promise<void> {
  return Promise.race([
    new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
    new Promise(resolve => setTimeout(() => resolve("fast"), 50)),
    new Promise((_, reject) => setTimeout(() => reject("error"), 100)),
  ])
    .then(val => console.log("Winner:", val))
    .catch(err => console.log("Error:", err));
}

// YOUR ANSWER:
// Log: ???

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Promise.race — rejection wins
//
// What happens when the rejection is fastest?

function exercise7(): Promise<void> {
  return Promise.race([
    new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
    new Promise((_, reject) => setTimeout(() => reject("fast error"), 50)),
  ])
    .then(val => console.log("Winner:", val))
    .catch(err => console.log("Error:", err));
}

// YOUR ANSWER:
// Log: ???

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Promise.any — first fulfillment wins
//
// What is the result?

function exercise8(): Promise<void> {
  return Promise.any([
    Promise.reject("err1"),
    new Promise(resolve => setTimeout(() => resolve("slow"), 200)),
    new Promise(resolve => setTimeout(() => resolve("fast"), 50)),
  ])
    .then(val => console.log("First success:", val))
    .catch(err => console.log("All failed:", err));
}

// YOUR ANSWER:
// Log: ???

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: finally passthrough
//
// What value does the final .then receive?

function exercise9(): Promise<void> {
  return Promise.resolve("hello")
    .finally(() => {
      console.log("A: cleanup");
      return "ignored";
    })
    .then(val => {
      console.log("B:", val);
    });
}

// YOUR ANSWER:
// Log A: ???
// Log B: ???

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Microtask queue vs setTimeout
//
// What is the exact output order?

function exercise10(): void {
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

// YOUR ANSWER:
// Order: ???

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Missing return in chain
//
// This function should fetch a user, then fetch their posts, then return
// the posts. But it always resolves with undefined. Fix it.

function exercise11(userId: number): Promise<string[]> {
  return getUser(userId)
    .then(user => {
      getUserPosts(user.id);           // BUG: what's wrong here?
    })
    .then(posts => {
      return posts as string[];
    });
}

// Helpers (do not modify):
function getUser(id: number): Promise<{ id: number; name: string }> {
  return Promise.resolve({ id, name: `User ${id}` });
}
function getUserPosts(userId: number): Promise<string[]> {
  return Promise.resolve([`Post 1 by ${userId}`, `Post 2 by ${userId}`]);
}

// YOUR FIX: ???

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Unhandled rejection
//
// This code silently swallows errors. The caller never knows it failed.
// Fix it so the error propagates to the caller.

function exercise12(): Promise<string> {
  return fetchData()
    .catch(err => {
      console.error("Logging error:", err);
      // BUG: error is swallowed here — catch returns undefined
    })
    .then(data => {
      return `Processed: ${data}`;
    });
}

// Helper (do not modify):
function fetchData(): Promise<string> {
  return Promise.reject(new Error("network error"));
}

// YOUR FIX: ???

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: promisify — convert a callback-based function to return a Promise
//
// Given a function that takes (arg, callback) where callback is (err, result),
// return a new function that takes arg and returns a Promise.

function exercise13<TArg, TResult>(
  fn: (arg: TArg, callback: (err: Error | null, result: TResult) => void) => void
): (arg: TArg) => Promise<TResult> {
  // YOUR CODE HERE
  return (_arg: TArg) => Promise.reject(new Error("not implemented"));
}

// Test helper (do not modify):
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
// Topic: delay — create a Promise that resolves after ms milliseconds
//
// delay(ms) should return a Promise that resolves with undefined after ms.
// delay(ms, value) should return a Promise that resolves with that value.

function exercise14(ms: number): Promise<void>;
function exercise14<T>(ms: number, value: T): Promise<T>;
function exercise14<T>(ms: number, value?: T): Promise<T | void> {
  // YOUR CODE HERE
  return Promise.resolve();
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: retry — retry an async operation up to N times
//
// Call fn(). If it rejects, retry up to `retries` additional times.
// If all attempts fail, reject with the last error.

function exercise15<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  // YOUR CODE HERE
  return Promise.reject(new Error("not implemented"));
}

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: timeout wrapper — reject if a Promise takes too long
//
// Return a Promise that resolves/rejects with the input Promise's result,
// but rejects with Error("Timeout") if it doesn't settle within ms.

function exercise16<T>(promise: Promise<T>, ms: number): Promise<T> {
  // YOUR CODE HERE
  return Promise.reject(new Error("not implemented"));
}

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: sequential execution — run async functions in order
//
// Given an array of functions that each return a Promise,
// execute them sequentially (not in parallel) and return an array of results.

function exercise17<T>(fns: (() => Promise<T>)[]): Promise<T[]> {
  // YOUR CODE HERE
  return Promise.resolve([]);
}

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: parallel with concurrency limit
//
// Like Promise.all, but only run at most `limit` Promises concurrently.
// tasks is an array of functions that return Promises.
// Return results in the original order.

function exercise18<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  // YOUR CODE HERE
  return Promise.resolve([]);
}
