# CPU & Execution

## Why This Matters for Frontend Developers

Understanding how the CPU executes code explains why certain JavaScript patterns are fast
and others are slow. V8's JIT compiler, hidden classes, and inline caches directly affect
your app's performance. Knowing about GPU compositing explains why `transform` animations
are smooth but `width` animations cause jank.

---

## Table of Contents

1. [What the CPU Does](#1-what-the-cpu-does)
2. [Clock Speed and GHz](#2-clock-speed-and-ghz)
3. [Multi-Core and Web Workers](#3-multi-core-and-web-workers)
4. [Instruction Pipelining](#4-instruction-pipelining)
5. [JIT Compilation in V8](#5-jit-compilation-in-v8)
6. [V8 Optimization Details](#6-v8-optimization-details)
7. [GPU and Rendering](#7-gpu-and-rendering)
8. [WebAssembly (WASM)](#8-webassembly-wasm)

---

## 1. What the CPU Does

The CPU executes instructions in a simple loop called the **fetch-decode-execute cycle**:

1. **Fetch**: Read the next instruction from memory (pointed to by the program counter)
2. **Decode**: Figure out what the instruction means (add? compare? jump?)
3. **Execute**: Perform the operation (use the ALU for math, access memory, etc.)
4. **Store**: Write the result back to a register or memory
5. Increment the program counter and repeat

Every program — including your JavaScript — ultimately runs as a sequence of these
machine instructions. V8 compiles your JS into machine code that the CPU can execute
through this cycle.

### Registers

The CPU has a small number of extremely fast storage locations called **registers** (typically
16–32 on modern x86-64 CPUs). Operations happen between registers:

```
// Conceptual machine code for: let x = a + b
LOAD  R1, [address_of_a]    // Fetch: load a into register 1
LOAD  R2, [address_of_b]    // Fetch: load b into register 2
ADD   R3, R1, R2            // Execute: R3 = R1 + R2
STORE [address_of_x], R3    // Store: write result to memory
```

---

## 2. Clock Speed and GHz

The CPU's clock generates a regular pulse that synchronizes all operations. **Clock speed**
(measured in GHz) indicates how many billion cycles per second the CPU can perform.

- **1 GHz** = 1 billion cycles per second
- **3.5 GHz** = 3.5 billion cycles per second

A simple instruction (register-to-register add) takes 1 cycle. A memory access might take
100+ cycles (if it misses all caches).

### Why Clock Speed Isn't Everything

- **Instructions per cycle (IPC)**: Modern CPUs execute multiple instructions per cycle
  (superscalar execution)
- **Pipeline depth**: More stages = higher clock speed potential but worse penalty for
  mispredictions
- **Cache efficiency**: A 3 GHz CPU with cache hits beats a 4 GHz CPU with cache misses

### Frontend Relevance

When performance.now() shows a function taking 16ms (one frame at 60fps), that's roughly
**56 billion clock cycles** on a 3.5 GHz CPU. Even "slow" JavaScript runs through billions
of CPU operations per frame — the bottleneck is usually memory access patterns, not raw
computation.

---

## 3. Multi-Core and Web Workers

Modern CPUs have 4–16+ cores, each capable of executing instructions independently. But
JavaScript is **single-threaded** — your main thread runs on one core.

### The Problem

```
CPU: [Core 1: JS main thread] [Core 2: idle] [Core 3: idle] [Core 4: idle]
```

Heavy computation on the main thread blocks rendering — the user sees jank or a frozen UI.

### The Solution: Web Workers

```typescript
// main.ts
const worker = new Worker("worker.ts");
worker.postMessage({ type: "process", data: largeArray });
worker.onmessage = (e) => {
  console.log("Result:", e.data);
};

// worker.ts
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};
```

Web Workers run on separate cores:
```
CPU: [Core 1: JS main thread] [Core 2: Worker 1] [Core 3: Worker 2] [Core 4: idle]
```

### SharedArrayBuffer

For sharing memory between workers (avoiding the cost of structured cloning):

```typescript
const shared = new SharedArrayBuffer(1024);
const view = new Int32Array(shared);

// Both main thread and worker can read/write the same memory
// Use Atomics for thread-safe operations
Atomics.store(view, 0, 42);
Atomics.load(view, 0); // 42
```

### When to Use Workers

- Image processing (canvas pixel manipulation)
- Data parsing (large JSON, CSV)
- Encryption/hashing
- Complex calculations (pathfinding, physics)
- **Not for**: DOM access (workers can't touch the DOM)

---

## 4. Instruction Pipelining

Instead of completing one instruction before starting the next, CPUs overlap them:

```
Without pipeline:
  Fetch1 → Decode1 → Execute1 → Fetch2 → Decode2 → Execute2

With pipeline:
  Fetch1 → Decode1 → Execute1
           Fetch2 → Decode2 → Execute2
                    Fetch3 → Decode3 → Execute3
```

This means the CPU can complete one instruction per cycle even though each takes 3+ stages.

### Branch Prediction

The pipeline breaks when the CPU encounters a conditional branch (`if`, `switch`, loop
conditions) — it doesn't know which path to take until the condition is evaluated.

**Solution: Branch prediction.** The CPU guesses which branch will be taken based on
history and starts executing speculatively. If the guess is wrong, it must flush the
pipeline and restart — a **branch misprediction penalty** of ~15–20 cycles.

```typescript
// Predictable branch (mostly true) — CPU predicts well
for (let i = 0; i < 1000000; i++) {
  if (i < 999999) {  // true 99.9999% of the time
    doWork();
  }
}

// Unpredictable branch — CPU mispredicts ~50% of the time
for (let i = 0; i < data.length; i++) {
  if (data[i] > threshold) {  // random distribution
    doWork();
  }
}

// Sorting the data first makes branches predictable!
data.sort((a, b) => a - b);
// Now: all values below threshold come first, then all above
// Branch predictor can easily learn this pattern
```

### Speculative Execution

The CPU's speculative execution was the basis for the **Spectre** vulnerability (2018),
which could leak data from other processes. This led to browsers:
- Reducing `performance.now()` precision
- Isolating sites in separate processes (Site Isolation)
- Disabling `SharedArrayBuffer` (re-enabled with COOP/COEP headers)

---

## 5. JIT Compilation in V8

V8 (Chrome, Node.js) doesn't just "interpret" JavaScript. It uses **Just-In-Time (JIT)
compilation** to generate optimized machine code at runtime.

### The Pipeline

```
Source Code → Parser → AST → Ignition (bytecode) → Sparkplug → TurboFan (optimized code)
```

1. **Parser**: Reads JS source, produces Abstract Syntax Tree (AST)
2. **Ignition** (interpreter): Compiles AST to bytecode, executes it immediately.
   Collects type feedback — what types do variables actually hold at runtime?
3. **Sparkplug** (baseline compiler): Quick compilation of bytecode to machine code.
   No optimization, but faster than interpreting.
4. **TurboFan** (optimizing compiler): Uses type feedback to generate highly optimized
   machine code. Assumes types are stable.

### Why JIT Matters

```typescript
function add(a, b) {
  return a + b;
}

// First calls: Ignition interprets, collects feedback
add(1, 2);     // feedback: a=number, b=number
add(3, 4);     // feedback: still numbers
add(5, 6);     // feedback: still numbers

// TurboFan compiles optimized version assuming (number, number)
// Generates machine code equivalent to a single CPU ADD instruction

// But then:
add("hello", " world");  // DEOPTIMIZATION!
// Types changed! TurboFan's assumptions are invalid.
// Falls back to Ignition, recompiles with more general code.
```

### Lazy Parsing

V8 doesn't parse all code upfront. Functions that aren't called immediately are
**lazily parsed** — only their syntax is validated, not fully compiled. This speeds
up initial page load.

```typescript
// Eagerly parsed (called immediately)
(function() { /* ... */ })();

// Lazily parsed (only parsed when called)
function rarelyUsed() {
  // Not compiled until someone calls rarelyUsed()
}
```

---

## 6. V8 Optimization Details

### Hidden Classes (Maps)

V8 assigns a "hidden class" (internally called a "Map") to every object, describing its
shape (what properties it has and where they are in memory).

```typescript
// Both objects get the SAME hidden class because they have the same shape
const a = { x: 1, y: 2 };
const b = { x: 3, y: 4 };
// Hidden class: Map{ x: offset 0, y: offset 1 }

// This creates a DIFFERENT hidden class
const c = { y: 2, x: 1 };
// Different property order → different hidden class!

// This is why you should always initialize properties in the same order.
```

### Hidden Class Transitions

```typescript
function Point(x, y) {
  this.x = x;   // Hidden class transitions: {} → {x}
  this.y = y;    // Hidden class transitions: {x} → {x, y}
}

const p1 = new Point(1, 2);  // Shape: {x, y}
const p2 = new Point(3, 4);  // Same shape: {x, y} — shares hidden class!

// BAD: Adding property later creates a new transition
p1.z = 5;  // Shape: {x, y, z} — p1 now has different hidden class than p2
```

### Inline Caches (ICs)

When V8 sees a property access like `obj.x`, it records the hidden class and the offset.
Next time it sees the same access with the same hidden class, it goes directly to the
memory offset — no lookup needed.

```typescript
function getX(obj) {
  return obj.x;  // IC: if hidden class is Map_A, x is at offset 0
}

// Monomorphic: always same shape → fastest
getX({ x: 1, y: 2 });
getX({ x: 3, y: 4 });

// Polymorphic: 2–4 shapes → still okay
getX({ x: 1 });
getX({ x: 1, y: 2 });

// Megamorphic: many shapes → slow, falls back to dictionary lookup
getX({ x: 1, a: 2 });
getX({ x: 1, b: 2 });
getX({ x: 1, c: 2 });
getX({ x: 1, d: 2 });
getX({ x: 1, e: 2 });
```

### Deoptimization

When TurboFan's assumptions are violated, it **deoptimizes** — throws away the optimized
code and falls back to interpreted bytecode.

Common deoptimization triggers:
- **Type change**: Function parameter changes from number to string
- **Shape change**: Object gets a new property that wasn't in the hidden class
- **Prototype change**: Modifying an object's prototype after optimization
- **Arguments object**: Using `arguments` in certain ways
- **try-catch**: Older V8 versions couldn't optimize functions with try-catch (fixed now)

### Performance Tips

```typescript
// GOOD: Consistent object shapes
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// BAD: Optional properties create different shapes
function createPoint(x: number, y: number, z?: number) {
  const p: Record<string, number> = { x, y };
  if (z !== undefined) p.z = z;  // Different shape!
  return p;
}

// GOOD: Always initialize all properties (use default values)
function createPointFixed(x: number, y: number, z: number = 0) {
  return { x, y, z };  // Always same shape
}
```

---

## 7. GPU and Rendering

### The Browser Rendering Pipeline

```
DOM + CSSOM → Layout → Paint → Composite
```

1. **Layout**: Calculate position and size of every element (CPU)
2. **Paint**: Fill in pixels — colors, text, images, shadows (CPU)
3. **Composite**: Combine painted layers, apply transforms (GPU)

### Why CSS Transforms Are Fast

Properties like `transform` and `opacity` only affect the **composite** step. The GPU
handles compositing on a separate thread, so the main thread stays free.

```css
/* SLOW: triggers layout + paint + composite */
.animate-slow {
  animation: move 1s;
}
@keyframes move {
  to { left: 100px; width: 200px; }  /* Layout thrashing! */
}

/* FAST: only triggers composite */
.animate-fast {
  animation: move 1s;
  will-change: transform;
}
@keyframes move {
  to { transform: translateX(100px) scaleX(2); }  /* GPU compositing only */
}
```

### Layout Thrashing

Reading layout properties forces the browser to synchronously recalculate layout:

```typescript
// BAD: Layout thrashing — forces layout recalc on every iteration
for (const el of elements) {
  const height = el.offsetHeight;     // Forces layout
  el.style.height = height * 2 + "px"; // Invalidates layout
  // Next offsetHeight read forces ANOTHER layout
}

// GOOD: Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight);  // One layout
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + "px";            // Batched writes
});
// One layout recalculation at the end
```

### Properties and Their Cost

| Composite only (cheap) | Paint + Composite | Layout + Paint + Composite (expensive) |
|------------------------|-------------------|----------------------------------------|
| `transform`            | `color`           | `width`, `height`                     |
| `opacity`              | `background`      | `margin`, `padding`                   |
| `filter`               | `box-shadow`      | `top`, `left`, `right`, `bottom`      |
|                        | `border-radius`   | `font-size`, `display`                |

---

## 8. WebAssembly (WASM)

WebAssembly is a binary instruction format that runs in the browser at near-native speed.
It's not a replacement for JavaScript — it's a complement for performance-critical code.

### When to Use WASM

- **CPU-intensive computation**: Image/video processing, physics, cryptography
- **Porting existing code**: C/C++/Rust codebases compiled to WASM
- **Consistent performance**: No JIT warmup, no deoptimization surprises
- **Real examples**: Figma (C++→WASM), Google Earth, AutoCAD, Photoshop

### When NOT to Use WASM

- DOM manipulation (must call through JS)
- Simple CRUD apps (JS is fast enough)
- When startup time matters more than execution speed (WASM modules take time to compile)

### Example

```typescript
// Load and run a WASM module
const response = await fetch("module.wasm");
const buffer = await response.arrayBuffer();
const module = await WebAssembly.instantiate(buffer, {
  env: {
    log: (n: number) => console.log(n),
  },
});

const { add, fibonacci } = module.instance.exports as {
  add: (a: number, b: number) => number;
  fibonacci: (n: number) => number;
};

add(1, 2);        // 3 — runs as native machine code
fibonacci(40);     // Much faster than JS for large n
```

---

## Key Takeaways

1. **Fetch-decode-execute** is the fundamental CPU cycle — everything runs through it.
2. **JavaScript is single-threaded** — use Web Workers for CPU-intensive work.
3. **V8's JIT compiler** optimizes code based on runtime type information — keep types
   consistent for best performance.
4. **Hidden classes** mean object shape matters — initialize all properties in constructors,
   always in the same order.
5. **Inline caches** make monomorphic code (same shape) much faster than megamorphic.
6. **CSS transforms and opacity** are GPU-composited — use them for animations instead of
   layout-triggering properties.
7. **Layout thrashing** kills performance — batch DOM reads and writes.
8. **WASM** is for CPU-intensive work where JS isn't fast enough, not a general replacement.

---

## Further Reading

- [V8 Blog: How V8 Optimizes](https://v8.dev/blog)
- [Chrome DevTools: Rendering Performance](https://developer.chrome.com/docs/devtools/rendering/performance/)
- [CSS Triggers](https://csstriggers.com)
- [WebAssembly.org](https://webassembly.org)
- [Spectre Explained](https://spectreattack.com)
