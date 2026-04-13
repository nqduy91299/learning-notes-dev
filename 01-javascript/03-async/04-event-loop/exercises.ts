// ============================================================================
// 04-event-loop: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/03-async/04-event-loop/exercises.ts
//
// Instructions:
//   - "Predict the output" → write the console.log order in YOUR ANSWER
//   - "Implement"          → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Promise.then vs setTimeout — basic ordering
//
// What order do the numbers print?

function exercise1(): void {
  console.log(1);
  setTimeout(() => console.log(2), 0);
  Promise.resolve().then(() => console.log(3));
  console.log(4);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Multiple microtasks and macrotasks
//
// What order do the numbers print?

function exercise2(): void {
  setTimeout(() => console.log(1), 0);
  setTimeout(() => console.log(2), 0);
  Promise.resolve().then(() => console.log(3));
  Promise.resolve().then(() => console.log(4));
  console.log(5);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Nested microtasks — drain behavior
//
// What order do the numbers print?

function exercise3(): void {
  console.log(1);

  Promise.resolve().then(() => {
    console.log(2);
    Promise.resolve().then(() => console.log(3));
  });

  Promise.resolve().then(() => console.log(4));

  setTimeout(() => console.log(5), 0);

  console.log(6);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Promise constructor is synchronous
//
// What order do the letters print?

function exercise4(): void {
  console.log("A");

  new Promise<void>((resolve) => {
    console.log("B");
    resolve();
    console.log("C");
  }).then(() => {
    console.log("D");
  });

  console.log("E");
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: async/await execution order
//
// What order do the numbers print?

async function exercise5Inner(): Promise<void> {
  console.log(1);
  await Promise.resolve();
  console.log(2);
}

function exercise5(): void {
  console.log(3);
  exercise5Inner();
  console.log(4);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: queueMicrotask ordering
//
// What order do the letters print?

function exercise6(): void {
  console.log("A");

  queueMicrotask(() => {
    console.log("B");
  });

  Promise.resolve().then(() => console.log("C"));

  setTimeout(() => console.log("D"), 0);

  queueMicrotask(() => {
    console.log("E");
  });

  console.log("F");
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: setTimeout inside Promise.then
//
// What order do the numbers print?

function exercise7(): void {
  setTimeout(() => console.log(1), 0);

  Promise.resolve().then(() => {
    console.log(2);
    setTimeout(() => console.log(3), 0);
  });

  Promise.resolve().then(() => console.log(4));

  setTimeout(() => console.log(5), 0);

  console.log(6);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Chained .then() vs multiple .then() on same promise
//
// What order do the letters print?

function exercise8(): void {
  const p = Promise.resolve();

  p.then(() => {
    console.log("A");
  }).then(() => {
    console.log("B");
  });

  p.then(() => {
    console.log("C");
  });

  console.log("D");
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: async/await with setTimeout
//
// What order do the numbers print?

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exercise9(): Promise<void> {
  console.log(1);
  setTimeout(() => console.log(2), 0);

  await delay(0);
  console.log(3);

  setTimeout(() => console.log(4), 0);
  await Promise.resolve();
  console.log(5);
}

// YOUR ANSWER (tricky — think carefully about when each await resumes):
// Output order: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Microtask scheduling from within a macrotask
//
// What order do the numbers print?

function exercise10(): void {
  setTimeout(() => {
    console.log(1);
    Promise.resolve().then(() => console.log(2));
  }, 0);

  setTimeout(() => {
    console.log(3);
    Promise.resolve().then(() => console.log(4));
  }, 0);

  Promise.resolve().then(() => console.log(5));

  console.log(6);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Complex nesting — promises inside promises inside setTimeout
//
// What order do the numbers print?

function exercise11(): void {
  console.log(1);

  setTimeout(() => {
    console.log(2);
    Promise.resolve().then(() => {
      console.log(3);
      queueMicrotask(() => console.log(4));
    });
  }, 0);

  Promise.resolve().then(() => {
    console.log(5);
    setTimeout(() => console.log(6), 0);
    Promise.resolve().then(() => console.log(7));
  });

  console.log(8);
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Multiple awaits in sequence
//
// What order do the letters print?

async function exercise12(): Promise<void> {
  console.log("A");

  await Promise.resolve();
  console.log("B");

  await Promise.resolve();
  console.log("C");

  await Promise.resolve();
  console.log("D");
}

// What if we call it and log after?
function exercise12Runner(): void {
  exercise12();
  console.log("E");
}

// YOUR ANSWER:
// Output order: ???

// Uncomment to test:
// exercise12Runner();

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Custom microtask scheduler
//
// Implement `microBatch` — a function that accepts a callback and batches
// all calls made synchronously into a single microtask execution.
//
// Usage:
//   const flush = microBatch((items: string[]) => {
//     console.log("flushed:", items);
//   });
//
//   flush("a");  // does not call callback yet
//   flush("b");  // does not call callback yet
//   flush("c");  // does not call callback yet
//   // ... after current sync code completes, callback is called once:
//   // "flushed: ['a', 'b', 'c']"
//
// After the microtask fires, subsequent calls start a new batch:
//   // (later, in another macrotask)
//   flush("d");
//   flush("e");
//   // → "flushed: ['d', 'e']"

function microBatch(callback: (items: string[]) => void): (item: string) => void {
  // YOUR CODE HERE

  return (_item: string) => {};
}

// Uncomment to test:
// const flush = microBatch((items) => console.log("flushed:", items));
// flush("a");
// flush("b");
// flush("c");
// setTimeout(() => {
//   flush("d");
//   flush("e");
// }, 10);

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Sequential async task queue
//
// Implement a task queue that:
// - Accepts async tasks (functions returning promises)
// - Runs them sequentially (one at a time), in the order they were added
// - Returns a promise that resolves with the task's result
//
// interface TaskQueue {
//   enqueue<T>(task: () => Promise<T>): Promise<T>;
// }

interface TaskQueue {
  enqueue<T>(task: () => Promise<T>): Promise<T>;
}

function createTaskQueue(): TaskQueue {
  // YOUR CODE HERE

  return {
    enqueue<T>(_task: () => Promise<T>): Promise<T> {
      return Promise.resolve(undefined as T);
    },
  };
}

// Uncomment to test:
// const queue = createTaskQueue();
//
// queue.enqueue(async () => {
//   console.log("task 1 start");
//   await delay(50);
//   console.log("task 1 end");
//   return "result 1";
// }).then((r) => console.log("got:", r));
//
// queue.enqueue(async () => {
//   console.log("task 2 start");
//   await delay(30);
//   console.log("task 2 end");
//   return "result 2";
// }).then((r) => console.log("got:", r));
//
// queue.enqueue(async () => {
//   console.log("task 3 start");
//   await delay(10);
//   console.log("task 3 end");
//   return "result 3";
// }).then((r) => console.log("got:", r));

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Event loop simulation
//
// Implement a simplified event loop simulator with a call stack, microtask
// queue, and macrotask queue. This is a conceptual exercise — no real
// async code, just simulating the scheduling algorithm.
//
// interface EventLoopSim {
//   runSync(label: string): void;         — add a sync task (logs immediately)
//   addMicrotask(label: string): void;    — queue a microtask
//   addMacrotask(label: string): void;    — queue a macrotask
//   run(): string[];                      — execute everything, return log order
// }
//
// The `run()` method should:
// 1. Execute all sync tasks first (in order added)
// 2. Drain all microtasks (in order added)
// 3. Execute one macrotask, then drain microtasks again
// 4. Repeat until both queues are empty
// 5. Return an array of labels in execution order

interface EventLoopSim {
  runSync(label: string): void;
  addMicrotask(label: string): void;
  addMacrotask(label: string): void;
  run(): string[];
}

function createEventLoopSim(): EventLoopSim {
  // YOUR CODE HERE

  return {
    runSync(_label: string) {},
    addMicrotask(_label: string) {},
    addMacrotask(_label: string) {},
    run(): string[] {
      return [];
    },
  };
}

// Uncomment to test:
// const sim = createEventLoopSim();
// sim.runSync("sync1");
// sim.addMicrotask("micro1");
// sim.addMacrotask("macro1");
// sim.runSync("sync2");
// sim.addMicrotask("micro2");
// sim.addMacrotask("macro2");
// console.log(sim.run());
// Expected: ["sync1", "sync2", "micro1", "micro2", "macro1", "macro2"]

export {};
