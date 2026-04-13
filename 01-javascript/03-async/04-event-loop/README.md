# Event Loop

The event loop is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It coordinates the execution of synchronous code, microtasks (Promises), and macrotasks (setTimeout, I/O) in a precise, deterministic order.

---

## 1. Single-Threaded Nature of JavaScript

JavaScript has **one thread of execution** per agent (per tab/worker). There is one call stack, one heap, and one event loop. Code cannot be interrupted mid-execution by another piece of JavaScript code — this is the **"run-to-completion"** guarantee.

```js
let i = 0;
i += 1;
console.log(i); // 1 — no other JS code can run between these lines
```

This means:
- No race conditions between synchronous operations
- No need for mutexes or locks for single-agent code
- Long-running synchronous code **blocks everything** — rendering, user events, timers

> In Node.js, the single-threaded model applies to JavaScript execution, but I/O operations (file system, network) are delegated to the OS or a thread pool (libuv).

---

## 2. The Call Stack

The call stack (execution context stack) is a **LIFO** (Last In, First Out) data structure that tracks which function is currently executing and where to return when it finishes.

### How it works

1. When a function is **called**, a new frame (execution context) is **pushed** onto the stack.
2. The frame contains local variables, parameters, and a return address.
3. When the function **returns**, its frame is **popped** off the stack.
4. Execution resumes in the caller.

```js
function multiply(a, b) {
  return a * b;           // 3. executes, pops off
}

function square(n) {
  return multiply(n, n);  // 2. calls multiply, pushes new frame
}

function printSquare(n) {
  const result = square(n); // 1. calls square, pushes new frame
  console.log(result);
}

printSquare(4); // pushes printSquare → square → multiply → pops back
```

Stack at deepest point:

```
┌─────────────────┐
│  multiply(4, 4) │  ← top (currently executing)
├─────────────────┤
│  square(4)      │
├─────────────────┤
│  printSquare(4) │
├─────────────────┤
│  <global>       │  ← bottom (entry point)
└─────────────────┘
```

### Stack overflow

If the stack grows too large (e.g., infinite recursion), the engine throws a `RangeError: Maximum call stack size exceeded`.

```js
function recurse() {
  recurse(); // never returns — stack keeps growing
}
recurse(); // RangeError: Maximum call stack size exceeded
```

---

## 3. Web APIs / Node APIs

The JavaScript engine itself (V8, SpiderMonkey, JavaScriptCore) provides only the language core — objects, functions, the call stack, etc. **Asynchronous capabilities** are provided by the **host environment**:

| Environment | Provides |
|-------------|----------|
| Browser (Web APIs) | `setTimeout`, `setInterval`, `fetch`, DOM events, `requestAnimationFrame`, `MutationObserver`, `XMLHttpRequest` |
| Node.js | `setTimeout`, `setInterval`, `fs.readFile`, `http.get`, `process.nextTick`, I/O via libuv |

When you call `setTimeout(callback, 1000)`:
1. The engine hands the timer off to the **Web API / Node API** layer.
2. JavaScript execution continues immediately (non-blocking).
3. After the delay, the host environment places the callback into the appropriate **task queue**.
4. The event loop picks it up when the call stack is empty.

```js
console.log("start");

setTimeout(() => {
  console.log("timer");  // handled by Web API, queued as macrotask
}, 0);

console.log("end");

// Output: "start", "end", "timer"
```

---

## 4. The Task Queue (Macrotask Queue)

The **macrotask queue** (or simply "task queue") holds callbacks from:

- `setTimeout` / `setInterval`
- I/O operations (Node.js)
- UI rendering events (browser)
- `setImmediate` (Node.js)
- `MessageChannel` / `postMessage`
- User interaction events (click, keypress) — dispatched as tasks

Each iteration of the event loop processes **one** macrotask from the queue (the oldest one), then moves on to drain all microtasks.

```js
setTimeout(() => console.log("macro 1"), 0);
setTimeout(() => console.log("macro 2"), 0);

// These are queued as two separate macrotasks.
// Between each one, the engine drains all microtasks.
```

> The browser has a minimum delay for nested `setTimeout` — after 5 nested calls, the minimum delay is clamped to 4ms, even if you specify 0.

---

## 5. The Microtask Queue

The **microtask queue** holds callbacks from:

- `Promise.then()` / `.catch()` / `.finally()` handlers
- `queueMicrotask(callback)`
- `MutationObserver` callbacks (browser)
- `process.nextTick()` (Node.js — technically its own queue, drained before other microtasks)
- `await` continuations (everything after `await` in an async function)

Microtasks have **higher priority** than macrotasks. After each task (or after the main script finishes), the engine **drains the entire microtask queue** before doing anything else.

```js
// Promise.then creates a microtask
Promise.resolve().then(() => console.log("microtask"));

// setTimeout creates a macrotask
setTimeout(() => console.log("macrotask"), 0);

console.log("sync");

// Output: "sync", "microtask", "macrotask"
```

### Key property

If a microtask schedules another microtask, that new microtask runs **before** any macrotask. The queue is drained completely.

```js
Promise.resolve().then(() => {
  console.log("micro 1");
  Promise.resolve().then(() => console.log("micro 2"));
});

setTimeout(() => console.log("macro"), 0);

// Output: "micro 1", "micro 2", "macro"
// micro 2 runs before macro because the microtask queue is drained fully
```

---

## 6. Event Loop Algorithm

The event loop is an infinite loop that follows this algorithm:

```
1. Execute the current macrotask (initially: the <script> itself)
2. When the call stack is empty, drain ALL microtasks:
   a. While the microtask queue is not empty:
      - Dequeue the oldest microtask
      - Execute it (push onto call stack, run to completion)
      - If it created new microtasks, they are added to the queue
        and will be processed in this same drain cycle
3. Render updates (browser only — if needed):
   - requestAnimationFrame callbacks run here
   - Style calculation, layout, paint
4. Dequeue ONE macrotask from the task queue (the oldest)
5. Go to step 2
```

### Simplified pseudocode

```
while (true) {
  // Step 1: pick one macrotask
  const task = macrotaskQueue.dequeue();
  execute(task);

  // Step 2: drain all microtasks
  while (microtaskQueue.isNotEmpty()) {
    const microtask = microtaskQueue.dequeue();
    execute(microtask);
  }

  // Step 3: render if needed (browser)
  if (needsRender()) {
    runRequestAnimationFrameCallbacks();
    render();
  }
}
```

---

## 7. Execution Order Examples

### Example 1: Promise vs setTimeout

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
```

**Output: `1, 4, 3, 2`**

Step by step:
1. `console.log("1")` — sync, executes immediately → prints `1`
2. `setTimeout(...)` — callback goes to macrotask queue
3. `Promise.resolve().then(...)` — callback goes to microtask queue
4. `console.log("4")` — sync, executes immediately → prints `4`
5. Call stack empty → drain microtasks → prints `3`
6. Pick next macrotask → prints `2`

### Example 2: Nested promises and setTimeout

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => {
  console.log("3");
  Promise.resolve().then(() => console.log("4"));
});

Promise.resolve().then(() => console.log("5"));

setTimeout(() => console.log("6"), 0);

console.log("7");
```

**Output: `1, 7, 3, 5, 4, 2, 6`**

Step by step:
1. Sync: `1`, `7`
2. Microtask queue has: `[log 3 + schedule 4]`, `[log 5]`
3. Run first microtask → prints `3`, schedules microtask for `4`
4. Run second microtask → prints `5`
5. Microtask queue now has: `[log 4]` (newly added)
6. Run it → prints `4`
7. Microtask queue empty → pick macrotask → prints `2`
8. Drain microtasks (none) → pick macrotask → prints `6`

### Example 3: async/await

```js
async function foo() {
  console.log("foo start");
  await Promise.resolve();
  console.log("foo end");    // this is a microtask (continuation after await)
}

console.log("start");
foo();
console.log("end");
```

**Output: `start, foo start, end, foo end`**

`await` splits the function: everything after `await` is scheduled as a microtask.

---

## 8. queueMicrotask()

`queueMicrotask(callback)` explicitly adds a callback to the microtask queue. It's the cleanest way to schedule a microtask without creating a Promise.

```js
console.log("A");

queueMicrotask(() => {
  console.log("B");
});

console.log("C");

// Output: A, C, B
```

### When to use it

- When you need code to run asynchronously but **before** any macrotasks
- When you need to batch/defer work within the same "tick"
- Useful for libraries that need to guarantee execution order

### Difference from Promise.resolve().then()

Functionally equivalent for scheduling, but `queueMicrotask` is more explicit and avoids creating an unnecessary Promise object:

```js
// These behave the same regarding scheduling:
queueMicrotask(() => console.log("micro"));
Promise.resolve().then(() => console.log("micro"));
```

---

## 9. Starvation — Infinite Microtasks Block Macrotasks

Because the microtask queue is **fully drained** before any macrotask runs, an infinite stream of microtasks will **starve** macrotasks indefinitely:

```js
// WARNING: This blocks forever — no macrotask will ever run
function infiniteMicrotasks() {
  queueMicrotask(infiniteMicrotasks);
}

infiniteMicrotasks();

// This setTimeout callback will NEVER execute:
setTimeout(() => console.log("I will never run"), 0);
```

This is equivalent to an infinite synchronous loop from the event loop's perspective — the browser will freeze, rendering won't happen, user events won't be processed.

### Contrast with macrotask recursion

Recursive `setTimeout` does **not** cause starvation because each call is a separate macrotask with microtask-drain and render cycles in between:

```js
// This is safe — allows other tasks and rendering between each iteration
function loop() {
  // do work...
  setTimeout(loop, 0);
}
loop();
```

---

## 10. requestAnimationFrame (rAF)

`requestAnimationFrame(callback)` is a browser API that schedules a callback to run **before the next repaint**, typically at ~60fps (every ~16.7ms).

### Where rAF fits in the event loop

```
... macrotask → drain microtasks → rAF callbacks → render/paint → next macrotask ...
```

rAF runs **after** all microtasks have been drained, but **before** the browser paints. This makes it ideal for visual updates and animations.

```js
setTimeout(() => console.log("macrotask"), 0);

requestAnimationFrame(() => console.log("rAF"));

Promise.resolve().then(() => console.log("microtask"));

// Typical order: "microtask", "rAF", "macrotask"
// (but rAF timing depends on the browser's render cycle — it may vary)
```

### Key points

- rAF callbacks are **not** microtasks or macrotasks — they're their own category
- Multiple rAF callbacks queued in the same frame run together before that frame's paint
- If the tab is inactive, browsers typically pause rAF callbacks to save resources
- rAF is the preferred way to do smooth animations (over `setInterval`)

---

## 11. Event Loop Diagram

```
 ┌──────────────────────────────────────────────────────┐
 │                      CALL STACK                      │
 │  (executes synchronous code, one frame at a time)    │
 │  ┌────────────┐                                      │
 │  │ function() │  ← currently executing               │
 │  ├────────────┤                                      │
 │  │ function() │                                      │
 │  ├────────────┤                                      │
 │  │  <script>  │                                      │
 │  └────────────┘                                      │
 └────────────────────────┬─────────────────────────────┘
                          │
            when call stack is empty
                          │
                          ▼
 ┌──────────────────────────────────────────────────────┐
 │               MICROTASK QUEUE                        │
 │  (Promise.then, queueMicrotask, await, Mutation­Obs) │
 │                                                      │
 │   [micro1] → [micro2] → [micro3] → ...              │
 │                                                      │
 │   ⚠ Drain ALL before anything else.                  │
 │     New microtasks added during drain are also run.  │
 └────────────────────────┬─────────────────────────────┘
                          │
              when microtask queue empty
                          │
                          ▼
 ┌──────────────────────────────────────────────────────┐
 │            RENDER (browser only)                     │
 │  requestAnimationFrame → Style → Layout → Paint      │
 └────────────────────────┬─────────────────────────────┘
                          │
                          ▼
 ┌──────────────────────────────────────────────────────┐
 │              MACROTASK QUEUE                         │
 │  (setTimeout, setInterval, I/O, UI events)           │
 │                                                      │
 │   [task1] → [task2] → [task3] → ...                  │
 │                                                      │
 │   Pick ONE oldest task, execute it,                  │
 │   then go back to draining microtasks.               │
 └──────────────────────────────────────────────────────┘

            ▲                              │
            │         EVENT LOOP           │
            └──────── (repeats) ───────────┘
```

### Execution flow summary

```
<script>  ──→  drain microtasks  ──→  render?  ──→  1 macrotask
                                                         │
              drain microtasks  ←────────────────────────┘
                     │
                  render?  ──→  1 macrotask  ──→  ...
```

---

## 12. Common Gotchas

### Gotcha 1: `setTimeout(fn, 0)` is not immediate

`setTimeout(fn, 0)` does **not** run `fn` immediately. It schedules it as a macrotask, which runs only after:
1. The current synchronous code completes
2. All microtasks drain

```js
setTimeout(() => console.log("timeout"), 0);
console.log("sync");

// Output: "sync", "timeout" — not the other way around
```

Additionally, nested `setTimeout` calls (5+ deep) get clamped to a minimum 4ms delay.

### Gotcha 2: `Promise.resolve().then()` runs before `setTimeout`

Microtasks always run before the next macrotask:

```js
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));

// Output: "promise", "timeout" — always, deterministically
```

### Gotcha 3: `async/await` creates microtasks

Everything after `await` is a continuation scheduled as a microtask:

```js
async function foo() {
  console.log("A");
  await null;
  console.log("B");  // microtask — runs before any setTimeout
}

foo();
setTimeout(() => console.log("C"), 0);
console.log("D");

// Output: A, D, B, C
```

### Gotcha 4: Microtasks in a Promise constructor run synchronously

The executor function passed to `new Promise()` runs **synchronously**:

```js
console.log("1");

new Promise((resolve) => {
  console.log("2");  // sync — runs immediately!
  resolve();
}).then(() => {
  console.log("3");  // microtask
});

console.log("4");

// Output: 1, 2, 4, 3
```

### Gotcha 5: Multiple `.then()` on the same promise

Handlers attached to the **same** resolved promise are queued as separate microtasks in order:

```js
const p = Promise.resolve();

p.then(() => console.log("A"));
p.then(() => console.log("B"));
p.then(() => console.log("C"));

// Output: A, B, C — all run in the same microtask drain cycle
```

### Gotcha 6: Blocking the event loop with synchronous code

A long synchronous operation blocks everything — microtasks, macrotasks, and rendering:

```js
setTimeout(() => console.log("timer"), 0);

// Blocks for ~2 seconds — timer callback waits
for (let i = 0; i < 2e9; i++) {}

console.log("done");
// Output: "done" (after ~2s), "timer" (immediately after)
```

---

## 13. Best Practices

1. **Never block the main thread** — break CPU-heavy work into chunks using `setTimeout`, `requestIdleCallback`, or Web Workers.

2. **Understand the priority order** — sync > microtasks > render > macrotasks. Design your code accordingly.

3. **Use `queueMicrotask` for deferred sync-like work** — when you need code to run "right after" the current execution but asynchronously.

4. **Prefer `requestAnimationFrame` for animations** — it syncs with the browser's repaint cycle and pauses in background tabs.

5. **Avoid microtask starvation** — never recursively schedule microtasks without a termination condition.

6. **Use Web Workers for CPU-intensive tasks** — they run in a separate thread with their own event loop and don't block the main thread.

7. **Keep callbacks short** — whether macrotask or microtask, long-running callbacks block the loop and degrade responsiveness.

8. **Split heavy work with `setTimeout`** — this yields control to the event loop between chunks, allowing rendering and user interaction:

   ```js
   function processChunk(items, index) {
     const CHUNK_SIZE = 100;
     const end = Math.min(index + CHUNK_SIZE, items.length);
     for (let i = index; i < end; i++) {
       // process items[i]
     }
     if (end < items.length) {
       setTimeout(() => processChunk(items, end), 0);
     }
   }
   ```

9. **Remember: the Promise constructor is synchronous** — only `.then`/`.catch`/`.finally` handlers are microtasks.

10. **Test execution order explicitly** — when mixing `async/await`, Promises, and timers, verify the actual order rather than guessing.

---

## References

- [javascript.info — Event loop: microtasks and macrotasks](https://javascript.info/event-loop)
- [javascript.info — Microtasks](https://javascript.info/microtask-queue)
- [MDN — JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)
- [MDN — queueMicrotask()](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)
- [MDN — In depth: Microtasks and the JavaScript runtime environment](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)
- [HTML Spec — Event Loop Processing Model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
