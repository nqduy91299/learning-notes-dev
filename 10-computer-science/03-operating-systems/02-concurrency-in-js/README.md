# Concurrency in JavaScript

## Table of Contents

- [Concurrency vs Parallelism](#concurrency-vs-parallelism)
- [The Event Loop Deep Dive](#the-event-loop-deep-dive)
- [Microtask Queue vs Task Queue](#microtask-queue-vs-task-queue)
- [requestAnimationFrame Timing](#requestanimationframe-timing)
- [requestIdleCallback](#requestidlecallback)
- [Long Tasks and Blocking](#long-tasks-and-blocking)
- [Strategies to Avoid Blocking](#strategies-to-avoid-blocking)
- [Race Conditions in JavaScript](#race-conditions-in-javascript)
- [Deadlock Concept](#deadlock-concept)
- [Cooperative vs Preemptive Scheduling](#cooperative-vs-preemptive-scheduling)
- [AbortController for Cancellation](#abortcontroller-for-cancellation)
- [Structured Concurrency Patterns](#structured-concurrency-patterns)
- [Key Takeaways](#key-takeaways)

---

## Concurrency vs Parallelism

These terms are frequently confused but fundamentally different:

**Concurrency**: Multiple tasks make progress over the same time period. They may not
execute simultaneously — they interleave. A single-core CPU running multiple processes
via context switching is concurrent but not parallel.

**Parallelism**: Multiple tasks execute at the exact same instant. Requires multiple
CPU cores (or hardware threads). Web Workers enable parallelism in JavaScript.

```
Concurrency (single core):
┌─ Task A ─┐┌─ Task B ─┐┌─ Task A ─┐┌─ Task B ─┐
Time →

Parallelism (multi core):
Core 1: ┌──────── Task A ────────┐
Core 2: ┌──────── Task B ────────┐
Time →
```

**JavaScript's main thread is concurrent but not parallel.** It handles many things
(user events, network callbacks, timers, rendering) by interleaving them via the event
loop. True parallelism requires Web Workers or Node.js worker threads.

---

## The Event Loop Deep Dive

The event loop is the core execution model of JavaScript in both browsers and Node.js.

### Components

```
┌──────────────────────────────────────────────┐
│                  Call Stack                    │
│  (Synchronous execution — one frame at a time)│
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              Microtask Queue                  │
│  Promise.then, queueMicrotask, MutationObs.  │
└──────────────────┬───────────────────────────┘
                   │ (drained completely)
                   ▼
┌──────────────────────────────────────────────┐
│              Render Steps (browser)           │
│  rAF callbacks → Style → Layout → Paint      │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              Task Queue (Macrotask)           │
│  setTimeout, setInterval, I/O, UI events     │
└──────────────────────────────────────────────┘
```

### One Iteration of the Event Loop

1. **Pick one task** from the task queue (e.g., a setTimeout callback)
2. **Execute it** — push frames onto the call stack, run until stack is empty
3. **Drain the microtask queue** — run ALL pending microtasks. If a microtask enqueues
   another microtask, that runs too. The queue must be fully empty before proceeding.
4. **Render** (if it's time — usually every ~16.6ms for 60fps):
   - Run `requestAnimationFrame` callbacks
   - Recalculate styles
   - Layout
   - Paint
5. **Repeat**

### The Heap

The heap is where objects are allocated. It's unstructured memory managed by the garbage
collector. The event loop doesn't directly interact with the heap — it's just where
your data lives.

---

## Microtask Queue vs Task Queue

This distinction is critical for understanding execution order.

### Microtasks (Higher Priority)

- `Promise.then()` / `Promise.catch()` / `Promise.finally()`
- `queueMicrotask()`
- `MutationObserver` callbacks
- `await` continuations (desugared to `.then()`)

### Tasks / Macrotasks (Lower Priority)

- `setTimeout()` / `setInterval()`
- `setImmediate()` (Node.js)
- I/O callbacks
- UI rendering events (click, scroll, etc.)
- `MessageChannel`

### Execution Order Example

```typescript
console.log("1: sync");

setTimeout(() => console.log("2: timeout"), 0);

Promise.resolve().then(() => console.log("3: microtask"));

queueMicrotask(() => console.log("4: queueMicrotask"));

console.log("5: sync");

// Output:
// 1: sync
// 5: sync
// 3: microtask
// 4: queueMicrotask
// 2: timeout
```

Why? Synchronous code runs first (call stack). Then microtasks drain. Then the next
task (setTimeout) runs.

### Microtask Starvation

Because the microtask queue must drain completely before the next task or render step,
you can starve the browser:

```typescript
// DON'T DO THIS — infinite microtask loop blocks everything
function evil(): void {
  queueMicrotask(evil);
}
evil(); // Browser freezes — no rendering, no tasks, nothing
```

This is worse than an infinite `while` loop in one respect: with a `while` loop, the
browser eventually shows "page unresponsive." With microtask starvation, the page may
appear frozen without the prompt.

---

## requestAnimationFrame Timing

`requestAnimationFrame` (rAF) runs before the browser paints the next frame.

```typescript
requestAnimationFrame((timestamp) => {
  // timestamp = performance.now() at the start of this frame
  // Runs right before style/layout/paint
  element.style.transform = `translateX(${x}px)`;
});
```

### Where rAF Sits in the Event Loop

```
[Task] → [Microtasks] → [rAF callbacks] → [Style/Layout/Paint] → [next Task]
```

Key behaviors:
- rAF callbacks run **once per frame** (not per event loop iteration)
- Multiple rAF callbacks registered in the same frame all run in the same batch
- rAF callbacks registered *inside* a rAF callback run in the **next** frame
- rAF is paused when the tab is not visible (`document.hidden === true`)

### rAF vs setTimeout for Animation

```typescript
// Bad: setTimeout doesn't sync with display refresh
setTimeout(() => moveElement(), 16); // ~60fps but drifts

// Good: rAF syncs with display refresh
requestAnimationFrame(() => moveElement()); // Exactly aligned with vsync
```

---

## requestIdleCallback

`requestIdleCallback` runs when the browser is idle — after rendering and before the
next frame needs to start.

```typescript
requestIdleCallback((deadline) => {
  // deadline.timeRemaining() tells you how many ms you have
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift()!);
  }

  // If there are remaining tasks, schedule another idle callback
  if (tasks.length > 0) {
    requestIdleCallback(processRemainingTasks);
  }
});
```

### Frame Budget

At 60fps, each frame has ~16.6ms. The browser needs time for:
- JavaScript execution
- Style calculation
- Layout
- Paint
- Compositing

If JS finishes in 10ms, there are ~6ms of idle time. `requestIdleCallback` uses this.

```
Frame (16.6ms):
┌─────────┬───────┬──────┬─────┬──────────┐
│   JS    │ Style │Layout│Paint│  Idle    │
│  10ms   │  2ms  │ 1ms  │ 1ms│  2.6ms   │
└─────────┴───────┴──────┴─────┴──────────┘
                                     ↑
                            requestIdleCallback
```

### Caveats

- Not guaranteed to run — if the browser is always busy, your callback may never fire
- Use the `timeout` option to set a deadline: `requestIdleCallback(fn, { timeout: 1000 })`
- Not available in all browsers (Safari added it in 2024 behind a flag, unflagged in
  Safari 18.4)
- Don't perform DOM mutations in `requestIdleCallback` — it runs after paint

---

## Long Tasks and Blocking

A **long task** is any task that takes more than **50ms**. This threshold comes from
the RAIL performance model:

- **Response**: Handle user input within 100ms
- If a task takes 50ms, the remaining 50ms is available for the browser to process
  input and respond within the 100ms budget

### Total Blocking Time (TBT)

TBT measures the total time that long tasks block the main thread between First
Contentful Paint and Time to Interactive.

```
Task 1: 30ms (ok)
Task 2: 80ms → blocking time = 80 - 50 = 30ms
Task 3: 20ms (ok)
Task 4: 120ms → blocking time = 120 - 50 = 70ms

TBT = 30 + 70 = 100ms
```

### Why This Matters

When a long task runs:
- User clicks are not processed (feels unresponsive)
- Animations jank (dropped frames)
- Input fields don't update
- Scroll feels laggy

---

## Strategies to Avoid Blocking

### 1. Chunking with setTimeout

Break work into chunks, yielding between each:

```typescript
function processLargeArray(items: string[]): void {
  const CHUNK_SIZE = 100;
  let index = 0;

  function processChunk(): void {
    const end = Math.min(index + CHUNK_SIZE, items.length);
    for (; index < end; index++) {
      heavyProcess(items[index]);
    }
    if (index < items.length) {
      setTimeout(processChunk, 0); // yield to main thread
    }
  }

  processChunk();
}
```

### 2. requestIdleCallback for Low-Priority Work

```typescript
function processInBackground(items: string[]): void {
  let index = 0;

  requestIdleCallback(function process(deadline) {
    while (deadline.timeRemaining() > 1 && index < items.length) {
      heavyProcess(items[index++]);
    }
    if (index < items.length) {
      requestIdleCallback(process);
    }
  });
}
```

### 3. Yielding to the Main Thread

The `scheduler.yield()` proposal (available in Chrome):

```typescript
async function processItems(items: string[]): Promise<void> {
  for (const item of items) {
    heavyProcess(item);
    // Yield to let the browser handle pending events
    await scheduler.yield();
  }
}
```

Before `scheduler.yield`, a common pattern:

```typescript
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processItems(items: string[]): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    heavyProcess(items[i]);
    if (i % 10 === 0) {
      await yieldToMain();
    }
  }
}
```

### 4. Web Workers for CPU-Intensive Work

Move heavy computation off the main thread entirely:

```typescript
// Main thread
const worker = new Worker('compute-worker.js');
worker.postMessage(largeDataSet);
worker.onmessage = (e) => updateUI(e.data);
```

---

## Race Conditions in JavaScript

"JavaScript is single-threaded, so there are no race conditions." **This is wrong.**

While you won't get corrupted memory from concurrent writes (no true threads on main
thread), you absolutely get **logical race conditions** from async operations.

### Example 1: Async State Updates

```typescript
let count = 0;

async function increment(): Promise<void> {
  const current = count;        // Read
  await someAsyncOperation();    // Yield — other code can run!
  count = current + 1;           // Write with stale value
}

// Both read count=0, both write count=1 instead of count=2
increment();
increment();
```

### Example 2: Stale Closures in React

```typescript
function SearchComponent() {
  const [results, setResults] = useState([]);

  async function search(query: string) {
    const data = await fetch(`/api?q=${query}`);
    const json = await data.json();
    setResults(json); // Race: slow query might resolve AFTER fast query
  }

  // User types "ab" then "abc"
  // "ab" request sent first, "abc" sent second
  // If "abc" resolves first and "ab" resolves second,
  // results show "ab" results even though the query is "abc"
}
```

Fix: Use an abort controller or check if the query is still current.

### Example 3: Check-then-Act

```typescript
async function transferMoney(from: Account, to: Account, amount: number) {
  if (from.balance >= amount) {     // CHECK
    await debit(from, amount);       // ACT (yield point)
    await credit(to, amount);        // Another yield point
  }
  // Between CHECK and ACT, another transfer could have drained the account
}
```

---

## Deadlock Concept

A deadlock occurs when two or more operations are each waiting for the other to
complete, so neither can proceed.

In single-threaded JavaScript, traditional deadlocks are impossible — there's only one
thread, so it can't be simultaneously waiting for two things. However:

### SharedArrayBuffer Deadlocks

With `Atomics.wait()`, you can create real deadlocks:

```typescript
// Worker A
Atomics.wait(sharedView, 0, 0); // Wait for index 0 to change
Atomics.store(sharedView, 1, 1); // Then update index 1

// Worker B
Atomics.wait(sharedView, 1, 0); // Wait for index 1 to change
Atomics.store(sharedView, 0, 1); // Then update index 0

// Deadlock: A waits for 0, B waits for 1, neither can proceed
```

### Logical Deadlocks

```typescript
// Circular dependency in async initialization
const serviceA = createService({ dependency: serviceB });
const serviceB = createService({ dependency: serviceA });
// Both await the other to initialize — logical deadlock
```

---

## Cooperative vs Preemptive Scheduling

### Preemptive (OS-level)

The OS can forcibly interrupt a running process/thread at any time and switch to another.
The interrupted code has no say in the matter.

### Cooperative (JavaScript's model)

JavaScript tasks run to completion. The runtime cannot interrupt a running function
midway to run another task. Code must **voluntarily yield** (by returning, awaiting,
or using setTimeout).

```typescript
// This blocks everything — no cooperation
while (true) {
  doWork(); // Never yields
}

// This cooperates
async function process(): Promise<void> {
  while (hasWork()) {
    doChunk();
    await yieldToMain(); // Voluntarily yields
  }
}
```

### Implications

1. No function can be "interrupted" mid-execution (between `await` points)
2. Synchronous code between `await` points is atomic
3. The programmer is responsible for not hogging the thread
4. A single bad actor (infinite loop) freezes everything

---

## AbortController for Cancellation

`AbortController` is the standard cancellation mechanism in modern JavaScript.

```typescript
const controller = new AbortController();
const { signal } = controller;

// Pass signal to fetch
fetch('/api/data', { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request cancelled');
    }
  });

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);
```

### Custom Cancellable Operations

```typescript
async function cancellableProcess(
  items: string[],
  signal: AbortSignal
): Promise<string[]> {
  const results: string[] = [];

  for (const item of items) {
    if (signal.aborted) {
      throw new DOMException('Operation cancelled', 'AbortError');
    }
    results.push(await processItem(item));
  }

  return results;
}

// Using AbortSignal.timeout (modern)
const results = await cancellableProcess(items, AbortSignal.timeout(5000));
```

### Composing Signals

```typescript
// AbortSignal.any — abort if ANY signal fires (Chrome 116+)
const userCancel = new AbortController();
const timeout = AbortSignal.timeout(5000);

fetch('/api', { signal: AbortSignal.any([userCancel.signal, timeout]) });
```

---

## Structured Concurrency Patterns

Structured concurrency ensures that concurrent operations have a clear lifecycle —
they start together, finish together, and errors propagate predictably.

### Promise.all — All Must Succeed

```typescript
const [users, posts, comments] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments(),
]);
// If any fails, all results are lost
```

### Promise.allSettled — Get All Results

```typescript
const results = await Promise.allSettled([
  fetchUsers(),
  fetchPosts(),
  fetchComments(),
]);
// results: [{ status: 'fulfilled', value }, { status: 'rejected', reason }, ...]
```

### Promise.race — First to Finish

```typescript
const result = await Promise.race([
  fetchFromServer(),
  timeout(5000),
]);
```

### Promise.any — First Success

```typescript
const fastest = await Promise.any([
  fetchFromCDN1(),
  fetchFromCDN2(),
  fetchFromCDN3(),
]);
// Returns first successful result. Only rejects if ALL fail.
```

### Pattern: Cancellation on First Result

```typescript
async function fetchWithFallback(urls: string[]): Promise<Response> {
  const controller = new AbortController();

  try {
    const result = await Promise.any(
      urls.map(url => fetch(url, { signal: controller.signal }))
    );
    controller.abort(); // Cancel remaining requests
    return result;
  } catch {
    throw new Error('All requests failed');
  }
}
```

---

## Key Takeaways

1. **JavaScript is concurrent, not parallel** (on the main thread). The event loop
   interleaves tasks but never runs two simultaneously.

2. **Microtasks always drain before the next task.** `Promise.then` runs before
   `setTimeout`, always. Microtask starvation is a real risk.

3. **50ms is the long task threshold.** Keep tasks under 50ms to stay responsive.
   Break work into chunks or use Web Workers.

4. **Race conditions exist in JS.** Any `await` is a yield point where other code
   can change shared state. Treat `await` like a context switch.

5. **rAF runs before paint, requestIdleCallback runs after.** Use rAF for visual
   updates, requestIdleCallback for background housekeeping.

6. **AbortController is the standard cancellation API.** Use it for fetch, custom
   async operations, and timeouts.

7. **Cooperative scheduling means your code must yield voluntarily.** The runtime
   will not rescue you from a blocking loop.

8. **`scheduler.yield()`** is the modern way to yield to the main thread. Until it's
   widely available, use `setTimeout(resolve, 0)`.
