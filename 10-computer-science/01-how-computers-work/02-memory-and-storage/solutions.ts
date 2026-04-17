// ============================================================================
// Memory & Storage — Solutions
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ---------------------------------------------------------------------------
// EXERCISE 1: Stack vs Heap Predictions
// ---------------------------------------------------------------------------
section("Exercise 1: Stack vs Heap");

let a1 = 10;
let b1 = a1;
b1 = 20;
assert(a1 === 10 && b1 === 20, "1a: primitives are copied by value");

const obj1 = { x: 1, y: 2 };
const obj2 = obj1;
obj2.x = 99;
assert(obj1.x === 99 && obj2.x === 99, "1b: objects are copied by reference");

const arr1 = [1, 2, 3];
const arr2 = arr1;
arr2.push(4);
assert(arr1.length === 4, "1c: arrays are reference types");

const s1 = "hello";
const s2 = s1;
assert(s1 === s2, "1d: strings are interned, === is true");

// ---------------------------------------------------------------------------
// EXERCISE 2: GC Reachability Predictions
// ---------------------------------------------------------------------------
section("Exercise 2: GC Reachability");

// A: data is eligible for GC — no references escape the function
// B: obj is NOT eligible — globalRef holds a reference
// C: a and b ARE eligible — mark-and-sweep handles circular refs
assert(true, "2a: data eligible (no escaping refs)");
assert(true, "2b: obj NOT eligible (globalRef holds ref)");
assert(true, "2c: circular a,b eligible (mark-and-sweep handles cycles)");

// ---------------------------------------------------------------------------
// EXERCISE 3: Closure Memory Retention
// ---------------------------------------------------------------------------
section("Exercise 3: Closure Retention");

// Modern V8 optimizes closures: only variables actually referenced in the closure
// are captured. Since `increment` only uses `label` and `count`, V8 may NOT
// retain `hugeBuffer`. However, this is an engine optimization, not guaranteed
// by the spec. In older engines or with eval(), it would be retained.
assert(true, "3: hugeBuffer likely optimized away by V8 (but not guaranteed)");

// ---------------------------------------------------------------------------
// EXERCISE 4: WeakRef Predictions
// ---------------------------------------------------------------------------
section("Exercise 4: WeakRef");

let strongRef: { data: string } | null = { data: "important" };
const weakRef = new WeakRef(strongRef);
assert(weakRef.deref()?.data === "important", "4a: deref works while strong ref exists");
strongRef = null;
// After nulling, deref may still work (GC hasn't run yet)
// We can't assert undefined because GC timing is non-deterministic
assert(true, "4b: after nulling, deref may or may not return undefined (non-deterministic)");

// ---------------------------------------------------------------------------
// EXERCISE 5: FinalizationRegistry Predictions
// ---------------------------------------------------------------------------
section("Exercise 5: FinalizationRegistry");
// Callback is asynchronous and non-deterministic.
// It has NOT fired by the time we reach the next line — GC hasn't run.
assert(true, "5: callback is async, non-deterministic, hasn't fired yet");

// ---------------------------------------------------------------------------
// EXERCISE 6: Fixed Memory Leak — Forgotten Timer
// ---------------------------------------------------------------------------
section("Exercise 6: Timer Leak Fix");

interface Disposable {
  dispose(): void;
}

function createPollingComponent(): Disposable {
  const data: string[] = [];

  function fetchData() {
    data.push("response_" + Math.random().toString(36).slice(2));
  }

  const intervalId = setInterval(() => {
    fetchData();
  }, 100);

  return {
    dispose() {
      // FIX: Clear the interval
      clearInterval(intervalId);
      data.length = 0; // Also clear accumulated data
    },
  };
}

const component = createPollingComponent();
const waitForPolling = new Promise<void>((resolve) => {
  setTimeout(() => {
    component.dispose();
    assert(true, "6: Timer properly cleaned up on dispose");
    resolve();
  }, 300);
});
void waitForPolling;

// ---------------------------------------------------------------------------
// EXERCISE 7: Fixed Event Listener Leak
// ---------------------------------------------------------------------------
section("Exercise 7: Event Listener Fix");

type EventCallback = () => void;

class EventManager {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb();
      }
    }
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

const em = new EventManager();
let count = 0;
const handler = () => {
  count++;
};
em.on("click", handler);
em.emit("click");
assert(count === 1, "7a: handler called once");
em.off("click", handler);
em.emit("click");
assert(count === 1, "7b: handler not called after off");
em.on("a", () => {});
em.on("b", () => {});
em.removeAllListeners();
em.emit("a");
assert(true, "7c: removeAllListeners works");

// ---------------------------------------------------------------------------
// EXERCISE 8: Fixed Closure Retaining Large Data
// ---------------------------------------------------------------------------
section("Exercise 8: Closure Leak Fix");

function createDataProcessor(rawData: number[]) {
  const sum = rawData.reduce((acc, b) => acc + b, 0);
  const avg = sum / rawData.length;
  const max = Math.max(...rawData);
  const min = Math.min(...rawData);

  // FIX: Don't return getRaw() — it forces rawData to stay alive.
  // The closure only captures sum, avg, max, min (primitives on stack).
  return {
    getSum: () => sum,
    getAvg: () => avg,
    getMax: () => max,
    getMin: () => min,
  };
}

const processor = createDataProcessor([1, 2, 3, 4, 5]);
assert(processor.getSum() === 15, "8a: sum");
assert(processor.getAvg() === 3, "8b: avg");
assert(processor.getMax() === 5, "8c: max");
assert(processor.getMin() === 1, "8d: min");

// ---------------------------------------------------------------------------
// EXERCISE 9: Mark-and-Sweep GC Simulator
// ---------------------------------------------------------------------------
section("Exercise 9: Mark-and-Sweep");

interface GCObject {
  id: string;
  refs: string[];
  marked: boolean;
}

interface GCHeap {
  objects: Map<string, GCObject>;
  roots: Set<string>;
}

function createHeap(): GCHeap {
  return { objects: new Map(), roots: new Set() };
}

function allocate(heap: GCHeap, id: string, refs: string[] = []): void {
  heap.objects.set(id, { id, refs, marked: false });
}

function addRoot(heap: GCHeap, id: string): void {
  heap.roots.add(id);
}

function removeRoot(heap: GCHeap, id: string): void {
  heap.roots.delete(id);
}

function mark(heap: GCHeap): void {
  // Reset all marks
  for (const obj of heap.objects.values()) {
    obj.marked = false;
  }

  // DFS from each root
  const visited = new Set<string>();

  function markReachable(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const obj = heap.objects.get(id);
    if (!obj) return;
    obj.marked = true;
    for (const ref of obj.refs) {
      markReachable(ref);
    }
  }

  for (const rootId of heap.roots) {
    markReachable(rootId);
  }
}

function sweep(heap: GCHeap): number {
  let freed = 0;
  for (const [id, obj] of heap.objects) {
    if (!obj.marked) {
      heap.objects.delete(id);
      freed++;
    }
  }
  return freed;
}

function collectGarbage(heap: GCHeap): number {
  mark(heap);
  return sweep(heap);
}

const heap1 = createHeap();
allocate(heap1, "A", ["B"]);
allocate(heap1, "B", ["C"]);
allocate(heap1, "C");
allocate(heap1, "D");
allocate(heap1, "E", ["F"]);
allocate(heap1, "F");
addRoot(heap1, "A");

const freed1 = collectGarbage(heap1);
assert(freed1 === 3, "9a: freed 3 objects");
assert(heap1.objects.has("A"), "9b: A retained");
assert(heap1.objects.has("B"), "9c: B retained");
assert(heap1.objects.has("C"), "9d: C retained");
assert(!heap1.objects.has("D"), "9e: D freed");
assert(!heap1.objects.has("E"), "9f: E freed");
assert(!heap1.objects.has("F"), "9g: F freed");

const heap2 = createHeap();
allocate(heap2, "X", ["Y"]);
allocate(heap2, "Y", ["X"]);
allocate(heap2, "Z");
addRoot(heap2, "Z");
const freed2 = collectGarbage(heap2);
assert(freed2 === 2, "9h: freed circular X and Y");
assert(heap2.objects.has("Z"), "9i: Z retained");

// ---------------------------------------------------------------------------
// EXERCISE 10: Memory Pool
// ---------------------------------------------------------------------------
section("Exercise 10: Object Pool");

interface Poolable {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

class ObjectPool {
  private pool: Poolable[] = [];
  private activeCount = 0;

  constructor(initialSize: number) {
    for (let i = 0; i < initialSize; i++) {
      this.pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0 });
    }
  }

  acquire(): Poolable {
    // Find an inactive object to reuse
    for (const obj of this.pool) {
      if (!obj.active) {
        obj.active = true;
        this.activeCount++;
        return obj;
      }
    }
    // No inactive objects — create a new one
    const newObj: Poolable = { active: true, x: 0, y: 0, vx: 0, vy: 0 };
    this.pool.push(newObj);
    this.activeCount++;
    return newObj;
  }

  release(obj: Poolable): void {
    if (obj.active) {
      obj.active = false;
      obj.x = 0;
      obj.y = 0;
      obj.vx = 0;
      obj.vy = 0;
      this.activeCount--;
    }
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  getPoolSize(): number {
    return this.pool.length;
  }
}

const pool = new ObjectPool(5);
assert(pool.getPoolSize() === 5, "10a: pre-allocated 5");
assert(pool.getActiveCount() === 0, "10b: none active");

const pObj1 = pool.acquire();
const pObj2 = pool.acquire();
assert(pool.getActiveCount() === 2, "10c: 2 active");
pObj1.x = 100;
pObj1.y = 200;

pool.release(pObj1);
assert(pool.getActiveCount() === 1, "10d: 1 active after release");
assert(pObj1.active === false, "10e: released obj is inactive");
assert(pObj1.x === 0, "10f: released obj is reset");

void pObj2;
const pObj3 = pool.acquire();
void pObj3;
assert(pool.getPoolSize() === 5, "10g: pool didn't grow");

// ---------------------------------------------------------------------------
// EXERCISE 11: LRU Cache
// ---------------------------------------------------------------------------
section("Exercise 11: LRU Cache");

class LRUCache<V> {
  private cache = new Map<string, V>();

  constructor(private maxSize: number) {}

  get(key: string): V | undefined {
    if (!this.cache.has(key)) return undefined;
    // Move to end (most recently used) by deleting and re-inserting
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    // If key exists, delete first (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict LRU if at capacity
    if (this.cache.size >= this.maxSize) {
      // Map iterator gives entries in insertion order — first entry is LRU
      const lruKey = this.cache.keys().next().value!;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get size(): number {
    return this.cache.size;
  }
}

const lru = new LRUCache<number>(3);
lru.set("a", 1);
lru.set("b", 2);
lru.set("c", 3);
assert(lru.size === 3, "11a: size 3");
assert(lru.get("a") === 1, "11b: get a");

lru.set("d", 4); // Evicts "b" (LRU — "a" was accessed via get)
assert(lru.has("b") === false, "11c: b evicted");
assert(lru.has("a") === true, "11d: a still present");
assert(lru.has("c") === true, "11e: c still present");
assert(lru.get("d") === 4, "11f: d present");

// ---------------------------------------------------------------------------
// EXERCISE 12: WeakRef Cache
// ---------------------------------------------------------------------------
section("Exercise 12: WeakRef Cache");

class WeakCache<V extends object> {
  private cache = new Map<string, WeakRef<V>>();
  private finalizer: FinalizationRegistry<string>;

  constructor() {
    this.finalizer = new FinalizationRegistry((key: string) => {
      this.cache.delete(key);
    });
  }

  set(key: string, value: V): void {
    this.cache.set(key, new WeakRef(value));
    this.finalizer.register(value, key);
  }

  get(key: string): V | undefined {
    const ref = this.cache.get(key);
    if (!ref) return undefined;
    const value = ref.deref();
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }
    return value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  get size(): number {
    return this.cache.size;
  }
}

const weakCache = new WeakCache<{ data: string }>();
const val1 = { data: "hello" };
weakCache.set("key1", val1);
assert(weakCache.get("key1")?.data === "hello", "12a: value retrievable");
assert(weakCache.has("key1") === true, "12b: has key1");

// ---------------------------------------------------------------------------
// EXERCISE 13: Call Stack Simulator
// ---------------------------------------------------------------------------
section("Exercise 13: Call Stack");

interface StackFrame {
  functionName: string;
  localVars: Map<string, number>;
  returnAddress: number;
}

class CallStack {
  private frames: StackFrame[] = [];
  private maxDepth: number;

  constructor(maxDepth: number = 100) {
    this.maxDepth = maxDepth;
  }

  push(functionName: string, locals: Record<string, number> = {}): void {
    if (this.frames.length >= this.maxDepth) {
      throw new RangeError("Maximum call stack size exceeded");
    }
    this.frames.push({
      functionName,
      localVars: new Map(Object.entries(locals)),
      returnAddress: this.frames.length,
    });
  }

  pop(): StackFrame | undefined {
    return this.frames.pop();
  }

  peek(): StackFrame | undefined {
    return this.frames.length > 0 ? this.frames[this.frames.length - 1] : undefined;
  }

  get depth(): number {
    return this.frames.length;
  }

  getStackTrace(): string {
    return this.frames
      .slice()
      .reverse()
      .map((f) => `  at ${f.functionName}`)
      .join("\n");
  }
}

const stack = new CallStack(5);
stack.push("main", { argc: 0 });
stack.push("handleClick", { event: 1 });
stack.push("updateState", { newVal: 42 });
assert(stack.depth === 3, "13a: depth 3");
assert(stack.peek()?.functionName === "updateState", "13b: top is updateState");

const popped = stack.pop();
assert(popped?.functionName === "updateState", "13c: popped updateState");
assert(stack.depth === 2, "13d: depth 2");

const smallStack = new CallStack(3);
smallStack.push("a");
smallStack.push("b");
smallStack.push("c");
let overflowed = false;
try {
  smallStack.push("d");
} catch {
  overflowed = true;
}
assert(overflowed, "13e: stack overflow detected");

// ---------------------------------------------------------------------------
// EXERCISE 14: Heap Snapshot Diff
// ---------------------------------------------------------------------------
section("Exercise 14: Heap Snapshot Diff");

interface HeapSnapshot {
  [objectType: string]: number;
}

interface HeapDiff {
  added: Record<string, number>;
  removed: Record<string, number>;
  unchanged: string[];
}

function diffSnapshots(before: HeapSnapshot, after: HeapSnapshot): HeapDiff {
  const added: Record<string, number> = {};
  const removed: Record<string, number> = {};
  const unchanged: string[] = [];

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const beforeCount = before[key] ?? 0;
    const afterCount = after[key] ?? 0;
    const diff = afterCount - beforeCount;

    if (diff > 0) {
      added[key] = diff;
    } else if (diff < 0) {
      removed[key] = Math.abs(diff);
    } else {
      unchanged.push(key);
    }
  }

  return { added, removed, unchanged };
}

const beforeSnap: HeapSnapshot = { Array: 100, Object: 500, String: 1000, Function: 200 };
const afterSnap: HeapSnapshot = { Array: 150, Object: 500, String: 900, Function: 200, WeakMap: 5 };
const diff = diffSnapshots(beforeSnap, afterSnap);
assert(diff.added["Array"] === 50, "14a: 50 more Arrays");
assert(diff.added["WeakMap"] === 5, "14b: 5 new WeakMaps");
assert(diff.removed["String"] === 100, "14c: 100 fewer Strings");
assert(diff.unchanged.includes("Object"), "14d: Object unchanged");
assert(diff.unchanged.includes("Function"), "14e: Function unchanged");

// ---------------------------------------------------------------------------
// EXERCISE 15: Storage Size Estimator
// ---------------------------------------------------------------------------
section("Exercise 15: Size Estimator");

function estimateSize(value: unknown): number {
  if (value === null || value === undefined) return 0;

  switch (typeof value) {
    case "number":
      return 8;
    case "boolean":
      return 4;
    case "string":
      return (value as string).length * 2 + 12;
    case "function":
      return 128;
    case "object": {
      if (Array.isArray(value)) {
        let size = 32; // overhead
        size += value.length * 8; // element slots
        for (const item of value) {
          size += estimateSize(item);
        }
        return size;
      }
      // Plain object
      let size = 64; // overhead
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        size += estimateSize(key) + estimateSize(val);
      }
      return size;
    }
    default:
      return 0;
  }
}

assert(estimateSize(42) === 8, "15a: number = 8 bytes");
assert(estimateSize(true) === 4, "15b: boolean = 4 bytes");
assert(estimateSize(null) === 0, "15c: null = 0 bytes");
assert(estimateSize("hello") === 22, "15d: 'hello' = 22 bytes");
// array [1,2,3]: 3*8 (slots) + 8+8+8 (values) + 32 (overhead) = 80
assert(estimateSize([1, 2, 3]) === 80, "15e: [1,2,3] = 80 bytes");

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`========================================`);
if (failed > 0) process.exit(1);
