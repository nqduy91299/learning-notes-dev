// ============================================================================
// 04-event-loop: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
//
// Run:  npx tsx 01-javascript/03-async/04-event-loop/solutions.ts
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Promise.then vs setTimeout — basic ordering

function solution1(): void {
  console.log(1);                                // sync → 1
  setTimeout(() => console.log(2), 0);           // macrotask
  Promise.resolve().then(() => console.log(3));   // microtask
  console.log(4);                                // sync → 4
}

// ANSWER: 1, 4, 3, 2
//
// Explanation:
// Sync code runs first: 1, 4.
// Then microtasks drain: 3 (Promise.then).
// Then the macrotask runs: 2 (setTimeout).
// See README → Section 6: Event Loop Algorithm

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Multiple microtasks and macrotasks

function solution2(): void {
  setTimeout(() => console.log(1), 0);            // macrotask #1
  setTimeout(() => console.log(2), 0);            // macrotask #2
  Promise.resolve().then(() => console.log(3));   // microtask #1
  Promise.resolve().then(() => console.log(4));   // microtask #2
  console.log(5);                                 // sync
}

// ANSWER: 5, 3, 4, 1, 2
//
// Explanation:
// Sync: 5.
// Drain microtasks: 3, 4 (all microtasks before any macrotask).
// Macrotask #1: 1. Drain microtasks (none).
// Macrotask #2: 2.
// See README → Section 5: Microtask Queue & Section 6: Event Loop Algorithm

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Nested microtasks — drain behavior

function solution3(): void {
  console.log(1);                                 // sync → 1

  Promise.resolve().then(() => {
    console.log(2);                               // microtask #1
    Promise.resolve().then(() => console.log(3)); // nested microtask
  });

  Promise.resolve().then(() => console.log(4));   // microtask #2

  setTimeout(() => console.log(5), 0);            // macrotask

  console.log(6);                                 // sync → 6
}

// ANSWER: 1, 6, 2, 4, 3, 5
//
// Explanation:
// Sync: 1, 6.
// Microtask #1 runs: prints 2, schedules nested microtask (3).
// Microtask #2 runs: prints 4.
// Nested microtask runs (queue not empty yet): prints 3.
// Microtask queue now empty → macrotask: prints 5.
// See README → Section 5: Key property (drain behavior)

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Promise constructor is synchronous

function solution4(): void {
  console.log("A");                               // sync → A

  new Promise<void>((resolve) => {
    console.log("B");                             // sync (executor is sync!) → B
    resolve();
    console.log("C");                             // sync (resolve doesn't stop execution) → C
  }).then(() => {
    console.log("D");                             // microtask
  });

  console.log("E");                               // sync → E
}

// ANSWER: A, B, C, E, D
//
// Explanation:
// The Promise constructor executor runs synchronously: A, B, C.
// resolve() marks the promise as fulfilled but doesn't exit the executor.
// After the executor, "E" runs synchronously.
// Then the microtask queue drains: D.
// See README → Section 12: Gotcha 4

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: async/await execution order

async function solution5Inner(): Promise<void> {
  console.log(1);                                 // sync — runs when called
  await Promise.resolve();                        // yields here
  console.log(2);                                 // microtask (continuation)
}

function solution5(): void {
  console.log(3);                                 // sync → 3
  solution5Inner();                               // enters function, prints 1, then yields at await
  console.log(4);                                 // sync → 4
}

// ANSWER: 3, 1, 4, 2
//
// Explanation:
// 3 prints synchronously.
// solution5Inner() is called — 1 prints synchronously.
// `await` yields control. Everything after await becomes a microtask.
// Back in solution5: 4 prints synchronously.
// Microtask drains: 2 prints.
// See README → Section 7: Example 3 (async/await)

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: queueMicrotask ordering

function solution6(): void {
  console.log("A");                               // sync → A

  queueMicrotask(() => {
    console.log("B");                             // microtask #1
  });

  Promise.resolve().then(() => console.log("C")); // microtask #2

  setTimeout(() => console.log("D"), 0);          // macrotask

  queueMicrotask(() => {
    console.log("E");                             // microtask #3
  });

  console.log("F");                               // sync → F
}

// ANSWER: A, F, B, C, E, D
//
// Explanation:
// Sync: A, F.
// Microtasks drain in order they were queued: B, C, E.
// queueMicrotask and Promise.resolve().then go into the same microtask queue.
// Then macrotask: D.
// See README → Section 8: queueMicrotask()

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout inside Promise.then

function solution7(): void {
  setTimeout(() => console.log(1), 0);            // macrotask #1

  Promise.resolve().then(() => {
    console.log(2);                               // microtask #1
    setTimeout(() => console.log(3), 0);          // macrotask #3 (added during microtask)
  });

  Promise.resolve().then(() => console.log(4));   // microtask #2

  setTimeout(() => console.log(5), 0);            // macrotask #2

  console.log(6);                                 // sync → 6
}

// ANSWER: 6, 2, 4, 1, 5, 3
//
// Explanation:
// Sync: 6.
// Drain microtasks: 2 (which schedules setTimeout for 3), then 4.
// Macrotask queue now: [1, 5, 3].
// Execute macrotask #1: 1. Drain microtasks (none).
// Execute macrotask #2: 5. Drain microtasks (none).
// Execute macrotask #3: 3.
// See README → Section 7: Example 2

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Chained .then() vs multiple .then() on same promise

function solution8(): void {
  const p = Promise.resolve();

  p.then(() => {
    console.log("A");                             // microtask #1
  }).then(() => {
    console.log("B");                             // microtask #3 (chained — only queued after A resolves)
  });

  p.then(() => {
    console.log("C");                             // microtask #2
  });

  console.log("D");                               // sync → D
}

// ANSWER: D, A, C, B
//
// Explanation:
// Sync: D.
// p is already resolved, so both .then callbacks are queued immediately.
// Microtask #1 (A's handler) and microtask #2 (C's handler) are queued.
// BUT B's handler is chained on the *result* of `p.then(() => A)`, which
// is a new promise. That new promise only resolves when A's handler completes.
// So A runs → its result promise resolves → B is queued.
// Meanwhile C was already in the queue.
// Order: A, C, B.
// See README → Section 12: Gotcha 5

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: async/await with setTimeout

async function solution9(): Promise<void> {
  console.log(1);                                 // sync → 1
  setTimeout(() => console.log(2), 0);            // macrotask #1

  await delay(0);                                 // yields — resumes after setTimeout(resolve, 0)
  console.log(3);                                 // microtask after macrotask for delay resolves

  setTimeout(() => console.log(4), 0);            // macrotask #3
  await Promise.resolve();                        // yields — resumes as microtask
  console.log(5);                                 // microtask
}

// ANSWER: 1, 2, 3, 5, 4
//
// Explanation:
// 1 prints synchronously.
// setTimeout(log 2) is queued as macrotask #1.
// `await delay(0)` — delay(0) creates a setTimeout(resolve, 0) macrotask. Yields.
// Call stack empty → drain microtasks (none) → macrotask #1 runs: prints 2.
// Next macrotask: delay's setTimeout fires → promise resolves → queues microtask.
// Drain microtasks: continuation runs → prints 3.
// setTimeout(log 4) is queued as macrotask #3.
// `await Promise.resolve()` yields, continuation is a microtask.
// Drain microtasks: prints 5.
// Next macrotask: prints 4.
// See README → Section 12: Gotcha 3

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Microtask scheduling from within a macrotask

function solution10(): void {
  setTimeout(() => {
    console.log(1);                               // macrotask #1
    Promise.resolve().then(() => console.log(2)); // microtask (within macrotask #1)
  }, 0);

  setTimeout(() => {
    console.log(3);                               // macrotask #2
    Promise.resolve().then(() => console.log(4)); // microtask (within macrotask #2)
  }, 0);

  Promise.resolve().then(() => console.log(5));   // microtask

  console.log(6);                                 // sync → 6
}

// ANSWER: 6, 5, 1, 2, 3, 4
//
// Explanation:
// Sync: 6.
// Drain microtasks: 5.
// Macrotask #1: prints 1, schedules microtask for 2.
// Drain microtasks: 2.
// Macrotask #2: prints 3, schedules microtask for 4.
// Drain microtasks: 4.
// Key: microtasks created during a macrotask are drained BEFORE the next macrotask.
// See README → Section 6: Event Loop Algorithm (step 2)

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Complex nesting — promises inside promises inside setTimeout

function solution11(): void {
  console.log(1);                                 // sync → 1

  setTimeout(() => {
    console.log(2);                               // macrotask #1
    Promise.resolve().then(() => {
      console.log(3);                             // microtask within macrotask #1
      queueMicrotask(() => console.log(4));       // nested microtask
    });
  }, 0);

  Promise.resolve().then(() => {
    console.log(5);                               // microtask #1
    setTimeout(() => console.log(6), 0);          // macrotask #2 (scheduled from microtask)
    Promise.resolve().then(() => console.log(7)); // nested microtask
  });

  console.log(8);                                 // sync → 8
}

// ANSWER: 1, 8, 5, 7, 2, 3, 4, 6
//
// Explanation:
// Sync: 1, 8.
// Drain microtasks: 5 (schedules setTimeout for 6, schedules micro for 7).
// Continue draining: 7.
// Microtask queue empty.
// Macrotask queue: [setTimeout log 2, setTimeout log 6].
// Macrotask #1: prints 2. Schedules micro for 3.
// Drain microtasks: 3. Schedules micro for 4.
// Continue draining: 4.
// Macrotask #2: prints 6.
// See README → Section 7 & Section 11 (diagram)

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Multiple awaits in sequence

async function solution12(): Promise<void> {
  console.log("A");                               // sync → A

  await Promise.resolve();
  console.log("B");                               // microtask #1

  await Promise.resolve();
  console.log("C");                               // microtask #2 (queued after B runs)

  await Promise.resolve();
  console.log("D");                               // microtask #3 (queued after C runs)
}

function solution12Runner(): void {
  solution12();
  console.log("E");                               // sync → E
}

// ANSWER: A, E, B, C, D
//
// Explanation:
// A prints synchronously.
// First await yields — rest of function becomes a microtask chain.
// Back to caller: E prints synchronously.
// Drain microtasks: B prints (first await continuation).
// B's continuation hits second await → C is queued as microtask.
// Drain: C prints. Third await → D queued.
// Drain: D prints.
// Each `await` creates ONE microtask boundary, and they chain sequentially.
// See README → Section 12: Gotcha 3

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Custom microtask scheduler

function solution13(callback: (items: string[]) => void): (item: string) => void {
  let queue: string[] = [];
  let scheduled = false;

  return (item: string) => {
    queue.push(item);

    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => {
        const batch = queue;
        queue = [];
        scheduled = false;
        callback(batch);
      });
    }
  };
}

// Explanation:
// We accumulate items into a queue. On the first call, we schedule a
// microtask to flush the queue. Subsequent synchronous calls just append
// to the queue without scheduling again (the `scheduled` flag prevents
// duplicate microtasks). When the microtask fires, it grabs the accumulated
// items, resets the queue and flag, and calls the callback.
// See README → Section 8: queueMicrotask

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Sequential async task queue

interface TaskQueue {
  enqueue<T>(task: () => Promise<T>): Promise<T>;
}

function solution14(): TaskQueue {
  let chain: Promise<unknown> = Promise.resolve();

  return {
    enqueue<T>(task: () => Promise<T>): Promise<T> {
      const result = chain.then(() => task());
      // Update chain to wait for this task, but swallow errors so the
      // chain itself never rejects (individual callers get their own errors)
      chain = result.then(() => undefined, () => undefined);
      return result;
    },
  };
}

// Explanation:
// We maintain a promise `chain` that represents the completion of all
// previous tasks. Each new task is chained via `.then()`, so it only
// starts when the previous one finishes. The caller receives a promise
// for their specific task's result. We swallow errors on the chain to
// prevent one task's failure from breaking subsequent tasks.
// See README → Section 5 (microtask queue / promise chaining)

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Event loop simulation

interface EventLoopSim {
  runSync(label: string): void;
  addMicrotask(label: string): void;
  addMacrotask(label: string): void;
  run(): string[];
}

function solution15(): EventLoopSim {
  const syncTasks: string[] = [];
  const microtaskQueue: string[] = [];
  const macrotaskQueue: string[] = [];

  return {
    runSync(label: string) {
      syncTasks.push(label);
    },
    addMicrotask(label: string) {
      microtaskQueue.push(label);
    },
    addMacrotask(label: string) {
      macrotaskQueue.push(label);
    },
    run(): string[] {
      const log: string[] = [];

      // Step 1: Execute all sync tasks (the "script" macrotask)
      while (syncTasks.length > 0) {
        log.push(syncTasks.shift()!);
      }

      // Step 2: Drain all microtasks
      while (microtaskQueue.length > 0) {
        log.push(microtaskQueue.shift()!);
      }

      // Step 3: Process macrotasks one at a time, draining microtasks after each
      while (macrotaskQueue.length > 0) {
        log.push(macrotaskQueue.shift()!);

        // Drain microtasks after each macrotask
        while (microtaskQueue.length > 0) {
          log.push(microtaskQueue.shift()!);
        }
      }

      return log;
    },
  };
}

// Explanation:
// This simulates the event loop algorithm from README Section 6:
// 1. Execute the current macrotask (here: all sync tasks = the script)
// 2. Drain all microtasks
// 3. Pick one macrotask → execute → drain microtasks → repeat
// This is a simplified model — real microtasks can schedule more microtasks
// and macrotasks can schedule microtasks, but this captures the core algorithm.

// ============================================================================
// Runner — executes all solutions and verifies output order
// ============================================================================

async function runAll(): Promise<void> {
  console.log("=== Exercise 1: Promise.then vs setTimeout ===");
  console.log("Expected: 1, 4, 3, 2");
  solution1();
  await delay(50);

  console.log("\n=== Exercise 2: Multiple microtasks and macrotasks ===");
  console.log("Expected: 5, 3, 4, 1, 2");
  solution2();
  await delay(50);

  console.log("\n=== Exercise 3: Nested microtasks — drain behavior ===");
  console.log("Expected: 1, 6, 2, 4, 3, 5");
  solution3();
  await delay(50);

  console.log("\n=== Exercise 4: Promise constructor is synchronous ===");
  console.log("Expected: A, B, C, E, D");
  solution4();
  await delay(50);

  console.log("\n=== Exercise 5: async/await execution order ===");
  console.log("Expected: 3, 1, 4, 2");
  solution5();
  await delay(50);

  console.log("\n=== Exercise 6: queueMicrotask ordering ===");
  console.log("Expected: A, F, B, C, E, D");
  solution6();
  await delay(50);

  console.log("\n=== Exercise 7: setTimeout inside Promise.then ===");
  console.log("Expected: 6, 2, 4, 1, 5, 3");
  solution7();
  await delay(50);

  console.log("\n=== Exercise 8: Chained .then vs multiple .then ===");
  console.log("Expected: D, A, C, B");
  solution8();
  await delay(50);

  console.log("\n=== Exercise 9: async/await with setTimeout ===");
  console.log("Expected: 1, 2, 3, 5, 4");
  await solution9();
  await delay(50);

  console.log("\n=== Exercise 10: Microtasks within macrotasks ===");
  console.log("Expected: 6, 5, 1, 2, 3, 4");
  solution10();
  await delay(50);

  console.log("\n=== Exercise 11: Complex nesting ===");
  console.log("Expected: 1, 8, 5, 7, 2, 3, 4, 6");
  solution11();
  await delay(50);

  console.log("\n=== Exercise 12: Multiple awaits ===");
  console.log("Expected: A, E, B, C, D");
  solution12Runner();
  await delay(50);

  console.log("\n=== Exercise 13: microBatch ===");
  const flush = solution13((items) => console.log("flushed:", items));
  flush("a");
  flush("b");
  flush("c");
  console.log("(items queued, microtask pending...)");
  await delay(10);
  // Second batch in a new macrotask
  flush("d");
  flush("e");
  await delay(10);
  console.log("Expected: flushed: ['a','b','c'] then flushed: ['d','e']");

  console.log("\n=== Exercise 14: Sequential task queue ===");
  const queue = solution14();

  queue.enqueue(async () => {
    console.log("task 1 start");
    await delay(50);
    console.log("task 1 end");
    return "result 1";
  }).then((r) => console.log("got:", r));

  queue.enqueue(async () => {
    console.log("task 2 start");
    await delay(30);
    console.log("task 2 end");
    return "result 2";
  }).then((r) => console.log("got:", r));

  queue.enqueue(async () => {
    console.log("task 3 start");
    await delay(10);
    console.log("task 3 end");
    return "result 3";
  }).then((r) => console.log("got:", r));

  await delay(200);
  console.log("Expected: tasks run sequentially — 1 start/end, 2 start/end, 3 start/end");

  console.log("\n=== Exercise 15: Event loop simulation ===");
  const sim = solution15();
  sim.runSync("sync1");
  sim.addMicrotask("micro1");
  sim.addMacrotask("macro1");
  sim.runSync("sync2");
  sim.addMicrotask("micro2");
  sim.addMacrotask("macro2");
  const result = sim.run();
  console.log("Result:", result);
  console.log("Expected: ['sync1', 'sync2', 'micro1', 'micro2', 'macro1', 'macro2']");

  const match = JSON.stringify(result) ===
    JSON.stringify(["sync1", "sync2", "micro1", "micro2", "macro1", "macro2"]);
  console.log(match ? "PASS" : "FAIL");
}

runAll();
