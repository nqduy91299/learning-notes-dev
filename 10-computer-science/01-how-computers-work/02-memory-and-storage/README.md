# Memory & Storage

## Why This Matters for Frontend Developers

Memory management is not "someone else's problem" in JavaScript. Understanding how memory
works explains why your SPA gets slow after hours of use, why certain patterns cause memory
leaks, and how to use DevTools to diagnose performance issues. The concepts of stack vs heap
map directly to how JavaScript handles primitives vs objects.

---

## Table of Contents

1. [RAM vs Storage](#1-ram-vs-storage)
2. [Stack vs Heap](#2-stack-vs-heap)
3. [Memory Allocation in JavaScript](#3-memory-allocation-in-javascript)
4. [Garbage Collection](#4-garbage-collection)
5. [Memory Leaks in JavaScript](#5-memory-leaks-in-javascript)
6. [Browser Memory Tools](#6-browser-memory-tools)
7. [Cache Hierarchy](#7-cache-hierarchy)
8. [Web Storage Limits](#8-web-storage-limits)

---

## 1. RAM vs Storage

| Aspect        | RAM (Memory)                      | Storage (Disk)                  |
|---------------|-----------------------------------|---------------------------------|
| Speed         | ~100 ns access                    | SSD: ~100 μs, HDD: ~10 ms     |
| Persistence   | Volatile (lost on power off)      | Persistent                     |
| Size          | 8–64 GB typical                   | 256 GB – 4 TB typical         |
| Cost          | ~$3–5/GB                          | SSD: ~$0.10/GB                |
| Purpose       | Active data being processed       | Long-term data storage         |

### Frontend Connection

When a user opens your web app, the browser loads HTML, CSS, JS, and images **from storage
(or network) into RAM**. The JavaScript heap, DOM tree, and render tree all live in RAM.
When RAM runs low, the browser may:

- Kill background tabs (Chrome's tab discarding)
- Trigger more aggressive garbage collection (causing jank)
- Crash the tab entirely

This is why bundle size and memory efficiency matter — you're competing with every other
tab for the user's RAM.

---

## 2. Stack vs Heap

These are two regions of RAM used for different purposes.

### The Stack

- **Fixed-size**, fast, LIFO (Last In, First Out)
- Stores **function call frames**: local variables, arguments, return addresses
- Automatically cleaned up when a function returns
- Very fast allocation/deallocation (just move the stack pointer)

### The Heap

- **Dynamic-size**, slower, unstructured
- Stores **objects, arrays, closures** — anything with dynamic size
- Requires garbage collection to clean up
- Fragmentation can occur over time

### JavaScript Mapping

```typescript
// Stack: primitives and references
function example() {
  const x = 42;          // x (number) → stored on stack
  const s = "hello";     // s (string ref) → stack points to string pool
  const obj = { a: 1 };  // obj (reference) → stack; { a: 1 } → heap
  const arr = [1, 2, 3]; // arr (reference) → stack; [1,2,3] → heap
}
// When example() returns, stack frame is popped.
// The objects on the heap remain until GC collects them.
```

### Why This Matters

```typescript
// Primitives are copied by value (stack copy)
let a = 5;
let b = a;
b = 10;
console.log(a); // 5 — independent copy

// Objects are copied by reference (stack holds pointer to same heap object)
let obj1 = { x: 1 };
let obj2 = obj1;
obj2.x = 99;
console.log(obj1.x); // 99 — same object!
```

This is the most fundamental behavior difference in JavaScript and it stems directly from
stack vs heap memory layout.

---

## 3. Memory Allocation in JavaScript

JavaScript handles memory allocation automatically. You never call `malloc()` or `free()`.
The engine allocates memory when you create values and (hopefully) frees it when those
values are no longer needed.

### Allocation Happens When You:

- Create a variable: `const x = 42;`
- Create an object: `const obj = { key: "value" };`
- Create a function: `function foo() {}` (functions are objects)
- Call a function: creates a new stack frame
- Concatenate strings: `"hello" + " " + "world"` creates new strings
- Add to arrays/objects: `arr.push(item)` may trigger reallocation

### Hidden Allocations

```typescript
// Each of these allocates memory you might not expect:
const doubled = arr.map(x => x * 2);    // new array + closure
const filtered = arr.filter(x => x > 0); // new array + closure
const str = `Hello ${name}`;             // new string
const { a, ...rest } = obj;              // new object for rest
const merged = { ...obj1, ...obj2 };     // new object
```

### Memory Lifecycle

1. **Allocate** — the engine reserves memory
2. **Use** — read and write to the allocated memory
3. **Release** — the engine determines memory is no longer needed and frees it

Step 3 is where garbage collection comes in — and where things can go wrong.

---

## 4. Garbage Collection

### Mark-and-Sweep (Modern Standard)

The primary GC algorithm used by V8 (Chrome, Node.js), SpiderMonkey (Firefox), and
JavaScriptCore (Safari).

**How it works:**

1. **Mark phase**: Starting from "roots" (global object, currently executing function's
   local variables, etc.), traverse all reachable objects and mark them as "alive"
2. **Sweep phase**: Scan the entire heap and free any objects not marked as alive

```
Roots: [global, stack frames, ...]
  │
  ├──→ Object A ──→ Object B
  │         │
  │         └──→ Object C
  │
  └──→ Object D

Object E (unreachable — will be swept)
Object F ──→ Object G (both unreachable — both swept, even though F→G)
```

### Generational GC in V8

V8 divides the heap into generations based on the observation that **most objects die young**:

**Young Generation (Nursery)**
- Small (1–8 MB), collected frequently
- Uses **Scavenge** algorithm (semi-space copying)
- Two halves: "from-space" and "to-space"
- Live objects are copied from-space → to-space; from-space is discarded
- Very fast because most young objects are already dead

**Old Generation**
- Large, collected less frequently
- Objects that survived two scavenges are promoted here
- Uses **Mark-Sweep** and **Mark-Compact** algorithms
- Mark-Compact moves live objects together to eliminate fragmentation

**Why this matters for frontend:**
- Short-lived objects (event handler allocations, temporary arrays from `.map()`) are cheap
- Long-lived objects (app state, cached data, module-level variables) go to old generation
- Frequent major GC pauses cause **jank** — dropped frames, unresponsive UI

### Reference Counting (Historical)

Older GC approach: each object tracks how many references point to it. When count hits 0,
free the memory.

**Fatal flaw: circular references**

```typescript
function leakyOldBrowser() {
  const a: Record<string, unknown> = {};
  const b: Record<string, unknown> = {};
  a.ref = b;  // a references b → b.count = 1
  b.ref = a;  // b references a → a.count = 1
  // Function returns: local refs removed
  // But a.count = 1 (from b.ref) and b.count = 1 (from a.ref)
  // Neither reaches 0 → MEMORY LEAK
}
```

Modern mark-and-sweep handles this correctly because neither `a` nor `b` is reachable
from roots after the function returns. This was a real problem in IE6/IE7 with DOM↔JS
circular references.

---

## 5. Memory Leaks in JavaScript

A memory leak occurs when memory that is no longer needed is not released. In JavaScript,
this means objects remain reachable (from the GC's perspective) even though the application
no longer uses them.

### Common Cause 1: Forgotten Timers

```typescript
// BAD: The interval keeps `hugeData` alive forever
function startPolling() {
  const hugeData = new Array(1_000_000).fill("x");

  setInterval(() => {
    // This closure captures `hugeData`
    console.log(hugeData.length);
  }, 1000);
}
startPolling();
// The interval is never cleared, so the closure lives forever,
// keeping `hugeData` in memory.

// FIX: Store the interval ID and clear it when done
function startPollingFixed() {
  const hugeData = new Array(1_000_000).fill("x");
  const intervalId = setInterval(() => {
    console.log(hugeData.length);
  }, 1000);

  // Clean up when component unmounts / page navigates
  return () => clearInterval(intervalId);
}
```

### Common Cause 2: Detached DOM Nodes

```typescript
// BAD: Removed from DOM but still referenced in JS
let detachedNode: HTMLElement | null = null;

function createNode() {
  const el = document.createElement("div");
  el.innerHTML = "<p>Lots of content...</p>".repeat(1000);
  document.body.appendChild(el);
  detachedNode = el;  // JS reference keeps it alive
}

function removeNode() {
  if (detachedNode) {
    detachedNode.remove();  // Removed from DOM tree
    // But detachedNode still holds a reference!
    // The entire subtree stays in memory.
  }
}

// FIX: Null out the reference
function removeNodeFixed() {
  if (detachedNode) {
    detachedNode.remove();
    detachedNode = null;  // Allow GC to collect
  }
}
```

### Common Cause 3: Closures Holding References

```typescript
// BAD: Closure captures more than needed
function processData() {
  const hugeArray = new Array(1_000_000).fill(0);
  const summary = hugeArray.reduce((a, b) => a + b, 0);

  return function getSummary() {
    // Only needs `summary`, but the closure scope may keep `hugeArray` alive
    // (depends on engine optimization)
    return summary;
  };
}

// FIX: Null out large data after use
function processDataFixed() {
  let hugeArray: number[] | null = new Array(1_000_000).fill(0);
  const summary = hugeArray.reduce((a, b) => a + b, 0);
  hugeArray = null;  // Explicitly release

  return function getSummary() {
    return summary;
  };
}
```

### Common Cause 4: Global Variables

```typescript
// BAD: Accidental global (no declaration keyword)
function handler() {
  // @ts-ignore — this creates a global in non-strict mode
  leakedData = new Array(1_000_000).fill("x");
}

// BAD: Intentional global cache with no size limit
(globalThis as Record<string, unknown>).cache = {};
function addToCache(key: string, value: unknown) {
  ((globalThis as Record<string, unknown>).cache as Record<string, unknown>)[key] = value;
  // Cache grows forever!
}
```

### Common Cause 5: Event Listeners Not Removed

```typescript
// BAD: Adding listeners without cleanup
class Component {
  private handler = () => { /* uses this.data */ };
  private data = new Array(100_000).fill("x");

  mount() {
    window.addEventListener("resize", this.handler);
  }

  unmount() {
    // Forgot to removeEventListener!
    // The listener closure keeps `this` (and this.data) alive
  }
}

// FIX: Always pair addEventListener with removeEventListener
class ComponentFixed {
  private handler = () => { /* uses this.data */ };
  private data = new Array(100_000).fill("x");

  mount() {
    window.addEventListener("resize", this.handler);
  }

  unmount() {
    window.removeEventListener("resize", this.handler);
  }
}
```

---

## 6. Browser Memory Tools

### Chrome DevTools Memory Tab

**Heap Snapshot**: Captures a snapshot of all objects in memory at a point in time.

1. Open DevTools → Memory tab
2. Select "Heap snapshot" and click "Take snapshot"
3. Sort by "Retained Size" to find the biggest memory consumers
4. Compare two snapshots to find leaks: take snapshot → perform action → take another
   → use "Comparison" view

**Allocation Timeline**: Records allocations over time.

1. Select "Allocation instrumentation on timeline"
2. Perform actions in your app
3. Blue bars = allocations that are still alive; gray = collected
4. Persistent blue bars after actions complete indicate potential leaks

**Allocation Sampling**: Lower overhead profiling for production-like conditions.

### Key Metrics

- **Shallow Size**: Memory the object itself uses (not counting referenced objects)
- **Retained Size**: Total memory that would be freed if this object were collected
  (includes all objects only reachable through this one)
- **Distance**: Shortest path from GC roots to the object

### Performance Tab

The Performance tab shows GC pauses as yellow blocks in the timeline:
- **Minor GC**: Young generation collection (~1–5 ms)
- **Major GC**: Full heap collection (~10–100+ ms, causes jank)

### Task Manager

Chrome's built-in Task Manager (Shift+Esc) shows per-tab memory usage:
- **Memory footprint**: Total memory used
- **JavaScript memory**: Heap size (live size in parentheses)

Watch the live size over time — if it only goes up, you have a leak.

---

## 7. Cache Hierarchy

Modern CPUs have a hierarchy of increasingly larger but slower memory:

```
CPU Registers (< 1 ns)
    ↓
L1 Cache (~1 ns, 64 KB per core)
    ↓
L2 Cache (~4 ns, 256 KB per core)
    ↓
L3 Cache (~12 ns, 8–64 MB shared)
    ↓
RAM (~100 ns, 8–64 GB)
    ↓
SSD (~100,000 ns)
    ↓
HDD (~10,000,000 ns)
```

### Why Data Locality Matters

When the CPU reads one byte from RAM, it actually loads an entire **cache line** (64 bytes)
into L1 cache. If your next access is nearby, it's a **cache hit** (fast). If it's far
away, it's a **cache miss** (slow — must fetch from a lower level).

### Frontend Relevance

**TypedArrays vs regular arrays:**

```typescript
// Cache-friendly: TypedArray stores data contiguously
const positions = new Float32Array(30000); // 30000 floats in continuous memory
for (let i = 0; i < positions.length; i++) {
  positions[i] *= 2;  // Sequential access → cache hits
}

// Less cache-friendly: regular array of objects
const objects = Array.from({ length: 10000 }, (_, i) => ({
  x: i, y: i, z: i,
}));
// Objects scattered across heap → more cache misses
```

This is why WebGL, Canvas, and Web Audio use TypedArrays — the performance difference
from cache-friendly access patterns can be 10x or more for numerical workloads.

**Struct of Arrays vs Array of Structs:**

```typescript
// Array of Structs (AoS) — common in JS, less cache-friendly
const particles = [
  { x: 0, y: 0, vx: 1, vy: 1, color: 0xff0000 },
  { x: 1, y: 1, vx: 2, vy: 2, color: 0x00ff00 },
  // ...
];

// Struct of Arrays (SoA) — cache-friendly for batch operations
const particlesSoA = {
  x: new Float32Array(1000),
  y: new Float32Array(1000),
  vx: new Float32Array(1000),
  vy: new Float32Array(1000),
  color: new Uint32Array(1000),
};
// Updating all x positions: sequential memory access → fast
```

---

## 8. Web Storage Limits

| Storage                 | Limit            | Persistence       | Scope            |
|-------------------------|------------------|--------------------|------------------|
| `localStorage`          | ~5 MB per origin | Until cleared      | Per origin       |
| `sessionStorage`        | ~5 MB per origin | Until tab closes   | Per tab          |
| `IndexedDB`             | Dynamic*         | Until cleared      | Per origin       |
| `Cache API`             | Dynamic*         | Until cleared      | Per origin       |
| Cookies                 | ~4 KB per cookie | Configurable       | Per domain+path  |

*Dynamic = browser allocates based on available disk space, typically up to 50% of free
disk space per origin, with a minimum of several hundred MB.

### localStorage Gotchas

```typescript
// It's synchronous and blocks the main thread
localStorage.setItem("key", JSON.stringify(hugeObject));
// This blocks! On a slow device with a full localStorage, this is noticeable.

// 5 MB is for the TOTAL of all keys+values, in UTF-16
// So actual character limit is ~2.5 million characters (2 bytes per char in UTF-16)

// It throws when full
try {
  localStorage.setItem("key", "x".repeat(10_000_000));
} catch (e) {
  // QuotaExceededError
}
```

### IndexedDB for Larger Data

When you need to store more than 5 MB of structured data client-side (offline cache,
large datasets, file storage), use IndexedDB. It's asynchronous, supports transactions,
and can store much more data.

```typescript
// IndexedDB is async and won't block the main thread
const request = indexedDB.open("myDB", 1);
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction("store", "readwrite");
  tx.objectStore("store").put({ id: 1, data: largeBlob });
};
```

---

## Key Takeaways

1. **Stack = fast, automatic, for primitives and references.** Heap = dynamic, GC-managed,
   for objects.
2. **Garbage collection is not free** — major GC pauses cause jank. Minimize allocations
   in hot paths (animations, scroll handlers).
3. **Memory leaks are real in JavaScript** — forgotten timers, detached DOM nodes,
   closures, and event listeners are the usual suspects.
4. **Use DevTools Memory tab** to diagnose leaks: heap snapshots, allocation timeline,
   and comparison view.
5. **Data locality matters** — TypedArrays and sequential access patterns are dramatically
   faster for numerical workloads.
6. **localStorage is synchronous and limited** — use IndexedDB for anything beyond
   simple key-value preferences.

---

## Further Reading

- [Chrome DevTools Memory Panel Docs](https://developer.chrome.com/docs/devtools/memory-problems/)
- [V8 Blog: Trash Talk (GC deep dive)](https://v8.dev/blog/trash-talk)
- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [Web Storage API Limits](https://web.dev/storage-for-the-web/)
