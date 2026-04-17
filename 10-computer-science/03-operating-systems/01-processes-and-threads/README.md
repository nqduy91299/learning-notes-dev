# Processes & Threads

## Table of Contents

- [What Is a Process?](#what-is-a-process)
- [What Is a Thread?](#what-is-a-thread)
- [Process vs Thread Comparison](#process-vs-thread-comparison)
- [Context Switching](#context-switching)
- [CPU Scheduling](#cpu-scheduling)
- [How Browsers Use Processes](#how-browsers-use-processes)
- [Web Workers](#web-workers)
- [SharedArrayBuffer and Atomics](#sharedarraybuffer-and-atomics)
- [Node.js: Processes and Signals](#nodejs-processes-and-signals)
- [Node.js: child_process](#nodejs-child_process)
- [Key Takeaways for Frontend Developers](#key-takeaways-for-frontend-developers)

---

## What Is a Process?

A **process** is a running instance of a program. When you double-click an app or run
`node server.js`, the operating system creates a process.

Every process gets:

| Resource               | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **PID**                | A unique Process ID assigned by the OS                     |
| **Memory space**       | Its own virtual address space — heap, stack, code, data    |
| **File descriptors**   | Handles to open files, sockets, pipes                      |
| **Security context**   | User ID, permissions                                       |
| **Program counter**    | Tracks which instruction is executing next                 |

The critical property: **processes are isolated from each other**. One process cannot
directly read or write another process's memory. This is enforced by the OS via hardware
(the MMU — Memory Management Unit).

```
Process A (PID 1234)          Process B (PID 5678)
┌─────────────────────┐       ┌─────────────────────┐
│  Code               │       │  Code               │
│  Stack              │       │  Stack              │
│  Heap               │       │  Heap               │
│  File descriptors   │       │  File descriptors   │
└─────────────────────┘       └─────────────────────┘
        ▲                             ▲
        │         OS Kernel           │
        └─────────────────────────────┘
         Memory isolation enforced
```

### Why This Matters for Frontend

When a tab crashes in Chrome, other tabs survive. That's process isolation at work.
When your Node.js server throws an unhandled exception, only that process dies — the OS
cleans up its memory automatically.

---

## What Is a Thread?

A **thread** is a unit of execution *within* a process. Every process has at least one
thread (the "main thread"). Additional threads share the same memory space as their
parent process.

Threads within the same process share:
- Heap memory
- Code segment
- File descriptors
- Global variables

Threads have their **own**:
- Stack (local variables, function call chain)
- Program counter
- Register state

```
Process (PID 1234)
┌──────────────────────────────────────┐
│  Shared: Heap, Code, File descs      │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Thread 1 │  │ Thread 2 │  ...    │
│  │ (stack)  │  │ (stack)  │         │
│  │ (PC)     │  │ (PC)     │         │
│  └──────────┘  └──────────┘         │
└──────────────────────────────────────┘
```

Because threads share memory, they can communicate cheaply — just read/write to the same
variable. But this is also the source of **race conditions** and the need for locks,
mutexes, and other synchronization primitives.

---

## Process vs Thread Comparison

| Aspect              | Process                          | Thread                           |
| ------------------- | -------------------------------- | -------------------------------- |
| Memory              | Own address space                | Shared with other threads        |
| Creation cost       | Expensive (copy memory, FDs)     | Cheap (share existing resources) |
| Communication       | IPC (pipes, sockets, shared mem) | Direct memory access             |
| Isolation           | Strong — crash doesn't spread    | Weak — one bad thread kills all  |
| Context switch cost | Higher (TLB flush, page tables)  | Lower (same address space)       |
| Security            | OS-enforced boundaries           | No protection between threads    |
| Example             | Chrome tab                       | Web Worker (conceptually)        |

### The Trade-off

- **Need safety?** Use processes. A rogue process can't corrupt your other processes.
- **Need speed?** Use threads. Shared memory avoids expensive copying.

Modern architectures use **both**: Chrome uses processes for tab isolation and threads
within each process for rendering, compositing, and I/O.

---

## Context Switching

When the OS switches the CPU from running one process/thread to another, it performs a
**context switch**:

1. Save the current process's CPU registers, program counter, stack pointer
2. Save memory mappings (page table base register)
3. Load the new process's saved state
4. Resume execution

### Why It's Expensive

For **process switches**:
- The TLB (Translation Lookaside Buffer) must be flushed — cached virtual-to-physical
  address mappings become invalid
- CPU caches (L1, L2) become cold — the new process uses different memory
- Page table register must be updated

For **thread switches** (within the same process):
- No TLB flush needed (same address space)
- CPU caches are more likely to stay warm
- Still need to save/restore registers

**Real numbers**: A context switch costs roughly 1-10 microseconds on modern hardware.
That sounds small, but at thousands of switches per second, it adds up. This is why
blocking the main thread in a browser is so harmful — the OS can't context-switch you
out of a single-threaded event loop voluntarily. JavaScript must *yield* cooperatively.

---

## CPU Scheduling

The OS **scheduler** decides which process/thread gets CPU time. Two fundamental
strategies:

### Round-Robin

Each process gets a fixed time slice (quantum), typically 1-10ms. After the quantum
expires, the OS preempts the process and moves to the next one in the queue.

```
Time →
┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐
│ P1 ││ P2 ││ P3 ││ P1 ││ P2 ││ P3 │
└────┘└────┘└────┘└────┘└────┘└────┘
  4ms   4ms   4ms   4ms   4ms   4ms
```

Fair, but doesn't account for priority.

### Priority Scheduling

Each process has a priority. Higher-priority processes run first. The OS may use
techniques like **aging** (gradually boosting the priority of starved processes) to
prevent starvation.

```
Priority queue:
  High:   [Audio process, Input handler]
  Medium: [Browser renderer, Node.js server]
  Low:    [Background indexer, Update checker]
```

### Connection to the Browser

The browser's **task queue** is a user-space scheduler on top of the OS scheduler.
When you `setTimeout(fn, 0)`, you're not talking to the OS — you're enqueuing a task
in the browser's own scheduling system. The browser then decides when to run it,
interleaving rendering, input handling, and your JavaScript tasks.

---

## How Browsers Use Processes

Modern browsers (especially Chromium-based) are **multi-process architectures**.

### Chrome's Process Model

```
┌─────────────────────────────────────────────────────┐
│                  Browser Process                     │
│  (UI, bookmarks, navigation, network requests)       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Renderer     │  │ Renderer     │  ...            │
│  │ Process      │  │ Process      │                 │
│  │ (tab/site)   │  │ (tab/site)   │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ GPU Process  │  │ Network      │                 │
│  │              │  │ Process      │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ Plugin       │  │ Utility      │                 │
│  │ Process      │  │ Process      │                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

| Process          | Role                                                       |
| ---------------- | ---------------------------------------------------------- |
| **Browser**      | Chrome UI, navigation bar, bookmarks, coordinates others   |
| **Renderer**     | Runs JS, parses HTML/CSS, paints — one per site (approx.)  |
| **GPU**          | Compositing, WebGL, hardware-accelerated CSS                |
| **Network**      | All HTTP requests, DNS resolution, TLS handshakes          |
| **Plugin**       | Flash (deprecated), PDF viewer                             |
| **Utility**      | Audio, video decoding                                      |

### Site Isolation

Since Chrome 67, each **site** (not just tab) gets its own renderer process. If you have
`example.com` embedded as an iframe inside `mysite.com`, they run in separate processes.
This prevents Spectre-style side-channel attacks where one site reads another's memory.

**Cost**: More memory usage. Each renderer process uses ~30-80MB. This is why Chrome
is known for high memory consumption — it's the price of security.

---

## Web Workers

Web Workers let you run JavaScript in a **background thread** (conceptually — the
browser may implement them as separate threads or even processes).

### Key Characteristics

```typescript
// Main thread
const worker = new Worker('worker.js');

worker.postMessage({ type: 'compute', data: largeArray });

worker.onmessage = (event) => {
  console.log('Result:', event.data);
};

// worker.js
self.onmessage = (event) => {
  const result = heavyComputation(event.data);
  self.postMessage(result);
};
```

**What Workers CAN do**: CPU-intensive computation, fetch API, IndexedDB, WebSocket,
`setTimeout`/`setInterval`, `importScripts`.

**What Workers CANNOT do**: Access the DOM, access `window`, access `document`,
use `alert()`/`confirm()`, access the parent's variables directly.

### Communication: postMessage

Workers communicate via **structured clone** — data is serialized, copied, and
deserialized. For large data, this copying can be expensive.

**Transferable objects** solve this: you can *transfer* ownership of an ArrayBuffer
to a worker. The original thread loses access (it becomes zero-length), and the worker
gets it with zero copying cost.

```typescript
// Transfer an ArrayBuffer (zero-copy)
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
worker.postMessage(buffer, [buffer]);
// buffer.byteLength is now 0 — ownership transferred
```

### Types of Workers

| Type              | Scope         | Use case                              |
| ----------------- | ------------- | ------------------------------------- |
| **Dedicated**     | One page      | Heavy computation for a single page   |
| **Shared**        | Multiple pages| Shared state across tabs (same origin)|
| **Service Worker**| Origin-wide   | Offline caching, push notifications   |

---

## SharedArrayBuffer and Atomics

`SharedArrayBuffer` provides **true shared memory** between the main thread and workers.
Unlike `postMessage`, no copying occurs — both threads read/write the same memory.

```typescript
// Main thread
const sab = new SharedArrayBuffer(1024);
const view = new Int32Array(sab);
view[0] = 42;

worker.postMessage(sab); // Worker gets the SAME memory

// Worker
self.onmessage = (event) => {
  const view = new Int32Array(event.data);
  console.log(view[0]); // 42 — same memory!
};
```

### Atomics

Because two threads accessing the same memory can cause race conditions, the `Atomics`
API provides atomic operations:

```typescript
Atomics.add(view, 0, 5);        // Atomically add 5 to view[0]
Atomics.load(view, 0);          // Atomically read view[0]
Atomics.store(view, 0, 100);    // Atomically write 100 to view[0]
Atomics.compareExchange(view, 0, 100, 200); // CAS operation
Atomics.wait(view, 0, 100);     // Block until view[0] !== 100
Atomics.notify(view, 0, 1);     // Wake one waiter
```

### Security Note

`SharedArrayBuffer` was disabled in all browsers after the Spectre vulnerability
(January 2018). It was re-enabled with requirements:
- Page must be served with `Cross-Origin-Opener-Policy: same-origin`
- Page must be served with `Cross-Origin-Embedder-Policy: require-corp`

---

## Node.js: Processes and Signals

### process.exit

```typescript
process.exit(0);  // Success
process.exit(1);  // General error

// Better: let the event loop drain
process.exitCode = 1;
// Node will exit with code 1 when the event loop empties
```

### Signals

```typescript
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

// SIGINT = Ctrl+C
process.on('SIGINT', () => {
  console.log('Caught interrupt signal');
  process.exit(0);
});
```

Common signals:
- `SIGTERM` — Polite "please terminate" (sent by `kill <pid>`)
- `SIGINT` — Interrupt (Ctrl+C)
- `SIGKILL` — Forceful kill (cannot be caught — OS kills immediately)
- `SIGHUP` — Terminal closed

---

## Node.js: child_process

Node.js can spawn child processes:

```typescript
import { exec, spawn, fork } from 'child_process';

// exec — runs a shell command, buffers output
exec('ls -la', (error, stdout, stderr) => {
  console.log(stdout);
});

// spawn — streams output, no shell by default
const child = spawn('node', ['script.js']);
child.stdout.on('data', (data) => console.log(data.toString()));

// fork — spawns a Node.js process with IPC channel
const worker = fork('worker.js');
worker.send({ type: 'start' });
worker.on('message', (msg) => console.log(msg));
```

| Method  | Shell | Output    | IPC | Best for                       |
| ------- | ----- | --------- | --- | ------------------------------ |
| `exec`  | Yes   | Buffered  | No  | Short shell commands           |
| `spawn` | No    | Streamed  | No  | Long-running processes         |
| `fork`  | No    | Streamed  | Yes | Node.js worker processes       |

---

## Key Takeaways for Frontend Developers

1. **Your browser tab is a process.** When it crashes, other tabs survive. This isolation
   costs memory but provides security and stability.

2. **JavaScript runs on a single thread** (main thread). Web Workers give you additional
   threads, but they can't touch the DOM.

3. **postMessage copies data** (structured clone). For large data transfers, use
   transferable objects or SharedArrayBuffer.

4. **Context switching is not free.** Every time the OS switches processes, caches go
   cold. Minimize unnecessary timer-based callbacks.

5. **Site isolation protects you.** Cross-origin iframes run in separate processes,
   preventing Spectre-style memory reads.

6. **Node.js child processes** are real OS processes. `fork()` gives you IPC for free.

7. **SharedArrayBuffer + Atomics** enable true shared-memory parallelism in JS, but
   require specific security headers (COOP/COEP).
