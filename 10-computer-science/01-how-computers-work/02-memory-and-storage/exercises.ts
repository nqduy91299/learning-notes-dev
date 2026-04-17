// ============================================================================
// Memory & Storage — Exercises
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 15 exercises: 5 predict, 3 fix (memory leak bugs), 7 implement
// ============================================================================

// ---------------------------------------------------------------------------
// EXERCISE 1 (Predict): Stack vs Heap — Primitive Copying
// ---------------------------------------------------------------------------
// Predict the output of each console.log WITHOUT running the code.

function exercise1() {
  let a = 10;
  let b = a;
  b = 20;
  // Prediction: a = ???, b = ???
  // console.log("1a:", a, b);

  const obj1 = { x: 1, y: 2 };
  const obj2 = obj1;
  obj2.x = 99;
  // Prediction: obj1.x = ???, obj2.x = ???
  // console.log("1b:", obj1.x, obj2.x);

  const arr1 = [1, 2, 3];
  const arr2 = arr1;
  arr2.push(4);
  // Prediction: arr1.length = ???
  // console.log("1c:", arr1.length);

  const s1 = "hello";
  const s2 = s1;
  // Prediction: s1 === s2 → ???
  // console.log("1d:", s1 === s2);
}
exercise1();

// ---------------------------------------------------------------------------
// EXERCISE 2 (Predict): Garbage Collection Reachability
// ---------------------------------------------------------------------------
// For each scenario, predict whether the object will be garbage collected.
// Write your predictions as comments.

function exercise2() {
  // Scenario A
  function scenarioA() {
    const data = { big: new Array(10000).fill("x") };
    return data.big.length;
    // After return, is `data` eligible for GC? Prediction: ???
  }
  scenarioA();

  // Scenario B
  let globalRef: { value: number } | null = null;
  function scenarioB() {
    const obj = { value: 42 };
    globalRef = obj;
    // After return, is `obj` eligible for GC? Prediction: ???
  }
  scenarioB();

  // Scenario C
  function scenarioC() {
    const a: Record<string, unknown> = { name: "a" };
    const b: Record<string, unknown> = { name: "b" };
    a.ref = b;
    b.ref = a;
    // After return (no external refs), are a and b eligible for GC? Prediction: ???
  }
  scenarioC();

  // Clean up
  globalRef = null;
}
exercise2();

// ---------------------------------------------------------------------------
// EXERCISE 3 (Predict): Closure Memory Retention
// ---------------------------------------------------------------------------
// Predict which variables the closure retains.

function exercise3() {
  function createCounter() {
    const label = "Counter";
    const hugeBuffer = new Array(1_000_000).fill(0);
    let count = 0;

    return {
      increment() {
        count++;
        return `${label}: ${count}`;
      },
    };
  }

  const counter = createCounter();
  counter.increment();

  // Prediction: Is `hugeBuffer` retained in memory? Why or why not?
  // (Hint: modern engines may optimize closures to only capture used variables)
  // console.log("3:", counter.increment());
}
exercise3();

// ---------------------------------------------------------------------------
// EXERCISE 4 (Predict): WeakRef and GC
// ---------------------------------------------------------------------------
// Predict behavior of WeakRef. Note: GC timing is non-deterministic,
// so we reason about what CAN happen, not exact timing.

function exercise4() {
  let strongRef: { data: string } | null = { data: "important" };
  const weakRef = new WeakRef(strongRef);

  // Prediction 1: weakRef.deref() right now → ???
  // console.log("4a:", weakRef.deref()?.data);

  strongRef = null;
  // Prediction 2: weakRef.deref() after nulling strong ref → ???
  // (It COULD be collected, but GC hasn't necessarily run yet)
  // console.log("4b:", weakRef.deref()?.data);

  // Prediction 3: After GC runs, weakRef.deref() → ???
  // console.log("4c: After GC, weakRef.deref() will eventually return undefined");
}
exercise4();

// ---------------------------------------------------------------------------
// EXERCISE 5 (Predict): FinalizationRegistry
// ---------------------------------------------------------------------------
// Predict the general behavior pattern.

function exercise5() {
  const registry = new FinalizationRegistry((heldValue: string) => {
    // Prediction: When does this callback fire?
    // Is it synchronous or asynchronous?
    // Is the timing guaranteed?
    console.log(`5: Object with label "${heldValue}" was garbage collected`);
  });

  let obj: object | null = { data: "temp" };
  registry.register(obj, "myObject");

  obj = null;
  // Prediction: Has the callback fired yet? Why or why not?
  // console.log("5: Callback has NOT fired yet — GC is asynchronous and non-deterministic");
}
exercise5();

// ---------------------------------------------------------------------------
// EXERCISE 6 (Fix): Memory Leak — Forgotten Timer
// ---------------------------------------------------------------------------
// This component simulates a UI component that polls an API.
// It has a memory leak. Find and fix it.

interface Disposable {
  dispose(): void;
}

function createPollingComponent(): Disposable {
  const data: string[] = [];

  // Simulate fetching data
  function fetchData() {
    data.push("response_" + Math.random().toString(36).slice(2));
  }

  // BUG: Timer is never cleaned up
  const intervalId = setInterval(() => {
    fetchData();
    // In a real component, this would update the UI
  }, 100);

  void intervalId; // suppress unused warning — part of the bug

  return {
    dispose() {
      // FIX THIS: Clean up the timer
      // Currently does nothing, so the interval runs forever
      // and `data` array grows without bound
    },
  };
}

// Test (uncomment after fixing):
// const component = createPollingComponent();
// setTimeout(() => {
//   component.dispose();
//   console.log("6: Component disposed — timer should be cleared");
// }, 500);

// ---------------------------------------------------------------------------
// EXERCISE 7 (Fix): Memory Leak — Event Listener Accumulation
// ---------------------------------------------------------------------------
// This function adds event listeners but never removes them.
// Each call adds ANOTHER listener, and old listeners keep closures alive.

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

  // BUG: No way to remove listeners! This causes a leak when
  // "components" add listeners but never clean them up.
  // FIX: Implement `off` and `removeAllListeners`

  off(event: string, callback: EventCallback): void {
    // YOUR FIX HERE
  }

  removeAllListeners(event?: string): void {
    // YOUR FIX HERE
  }
}

// Tests (uncomment after fixing):
// const em = new EventManager();
// let count = 0;
// const handler = () => { count++; };
// em.on("click", handler);
// em.emit("click");
// console.assert(count === 1, "7a: handler called once");
// em.off("click", handler);
// em.emit("click");
// console.assert(count === 1, "7b: handler not called after off");
// em.on("a", () => {});
// em.on("b", () => {});
// em.removeAllListeners();
// em.emit("a");
// console.log("7: Event listener memory leak fixed");

// ---------------------------------------------------------------------------
// EXERCISE 8 (Fix): Memory Leak — Closure Retaining Large Data
// ---------------------------------------------------------------------------
// This function processes data and returns a summary function.
// The closure unnecessarily retains the large raw data.

function createDataProcessor(rawData: number[]) {
  // Process the data
  const sum = rawData.reduce((a, b) => a + b, 0);
  const avg = sum / rawData.length;
  const max = Math.max(...rawData);
  const min = Math.min(...rawData);

  // BUG: The returned object's closures capture the entire scope,
  // which includes `rawData` (potentially huge).
  // FIX: Ensure rawData can be garbage collected after processing.

  return {
    getSum: () => sum,
    getAvg: () => avg,
    getMax: () => max,
    getMin: () => min,
    // BUG: This method forces `rawData` to stay alive
    getRaw: () => rawData,
  };
}

// Tests (uncomment after fixing):
// const processor = createDataProcessor([1, 2, 3, 4, 5]);
// console.assert(processor.getSum() === 15, "8a: sum");
// console.assert(processor.getAvg() === 3, "8b: avg");
// console.assert(processor.getMax() === 5, "8c: max");
// console.assert(processor.getMin() === 1, "8d: min");
// After fix: getRaw should be removed or rawData should be nulled
// console.log("8: Closure memory leak fixed");

// ---------------------------------------------------------------------------
// EXERCISE 9 (Implement): Simple Mark-and-Sweep GC Simulator
// ---------------------------------------------------------------------------
// Simulate a mark-and-sweep garbage collector.
// Objects have an id and references to other objects.

interface GCObject {
  id: string;
  refs: string[];   // IDs of objects this one references
  marked: boolean;
}

interface GCHeap {
  objects: Map<string, GCObject>;
  roots: Set<string>;  // IDs reachable from roots (e.g., global scope)
}

// Create a new heap
function createHeap(): GCHeap {
  return {
    objects: new Map(),
    roots: new Set(),
  };
}

// Allocate an object on the heap
function allocate(heap: GCHeap, id: string, refs: string[] = []): void {
  heap.objects.set(id, { id, refs, marked: false });
}

// Add a root reference
function addRoot(heap: GCHeap, id: string): void {
  heap.roots.add(id);
}

// Remove a root reference
function removeRoot(heap: GCHeap, id: string): void {
  heap.roots.delete(id);
}

// IMPLEMENT: Mark phase — starting from roots, mark all reachable objects
function mark(heap: GCHeap): void {
  // YOUR CODE HERE
  // 1. Reset all marks to false
  // 2. For each root, recursively mark all reachable objects
}

// IMPLEMENT: Sweep phase — remove all unmarked objects, return count of freed objects
function sweep(heap: GCHeap): number {
  // YOUR CODE HERE
  // Delete all objects that are not marked
  // Return count of objects removed
  return 0;
}

// IMPLEMENT: Run a full GC cycle (mark + sweep), return count of freed objects
function collectGarbage(heap: GCHeap): number {
  // YOUR CODE HERE
  return 0;
}

// Tests:
// const heap = createHeap();
// allocate(heap, "A", ["B"]);
// allocate(heap, "B", ["C"]);
// allocate(heap, "C");
// allocate(heap, "D");        // unreachable
// allocate(heap, "E", ["F"]); // E and F unreachable
// allocate(heap, "F");
// addRoot(heap, "A");
//
// const freed = collectGarbage(heap);
// console.assert(freed === 3, "9a: freed 3 objects (D, E, F)");
// console.assert(heap.objects.has("A"), "9b: A retained");
// console.assert(heap.objects.has("B"), "9c: B retained");
// console.assert(heap.objects.has("C"), "9d: C retained");
// console.assert(!heap.objects.has("D"), "9e: D freed");
// console.assert(!heap.objects.has("E"), "9f: E freed");
// console.assert(!heap.objects.has("F"), "9g: F freed");
//
// // Test circular references are handled
// const heap2 = createHeap();
// allocate(heap2, "X", ["Y"]);
// allocate(heap2, "Y", ["X"]); // circular
// allocate(heap2, "Z");
// addRoot(heap2, "Z");
// const freed2 = collectGarbage(heap2);
// console.assert(freed2 === 2, "9h: freed circular X and Y");
// console.assert(heap2.objects.has("Z"), "9i: Z retained");
// console.log("9: Mark-and-sweep simulator working");

// ---------------------------------------------------------------------------
// EXERCISE 10 (Implement): Memory Pool
// ---------------------------------------------------------------------------
// Implement a simple object pool that reuses objects instead of allocating new ones.
// This is a common pattern in games and animations to reduce GC pressure.

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

  constructor(private initialSize: number) {
    // IMPLEMENT: Pre-allocate `initialSize` objects
    // YOUR CODE HERE
  }

  // IMPLEMENT: Get an object from the pool (reuse inactive, or create new if needed)
  acquire(): Poolable {
    // YOUR CODE HERE
    return { active: true, x: 0, y: 0, vx: 0, vy: 0 };
  }

  // IMPLEMENT: Return an object to the pool
  release(obj: Poolable): void {
    // YOUR CODE HERE
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  getPoolSize(): number {
    return this.pool.length;
  }
}

// Tests:
// const pool = new ObjectPool(5);
// console.assert(pool.getPoolSize() === 5, "10a: pre-allocated 5");
// console.assert(pool.getActiveCount() === 0, "10b: none active");
//
// const obj1 = pool.acquire();
// const obj2 = pool.acquire();
// console.assert(pool.getActiveCount() === 2, "10c: 2 active");
// obj1.x = 100;
// obj1.y = 200;
//
// pool.release(obj1);
// console.assert(pool.getActiveCount() === 1, "10d: 1 active after release");
// console.assert(obj1.active === false, "10e: released obj is inactive");
// console.assert(obj1.x === 0, "10f: released obj is reset");
//
// const obj3 = pool.acquire(); // Should reuse obj1's slot
// console.assert(pool.getPoolSize() === 5, "10g: pool didn't grow");
// console.log("10: Object pool working");

// ---------------------------------------------------------------------------
// EXERCISE 11 (Implement): LRU Cache
// ---------------------------------------------------------------------------
// Implement a Least Recently Used cache with a max size.
// When the cache is full and a new item is added, evict the least recently used item.

class LRUCache<V> {
  private cache = new Map<string, V>();

  constructor(private maxSize: number) {}

  // IMPLEMENT: Get a value (and mark it as recently used)
  get(key: string): V | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  // IMPLEMENT: Set a value (evict LRU if at capacity)
  set(key: string, value: V): void {
    // YOUR CODE HERE
  }

  // IMPLEMENT: Check if key exists
  has(key: string): boolean {
    // YOUR CODE HERE
    return false;
  }

  get size(): number {
    return this.cache.size;
  }
}

// Tests:
// const lru = new LRUCache<number>(3);
// lru.set("a", 1);
// lru.set("b", 2);
// lru.set("c", 3);
// console.assert(lru.size === 3, "11a: size 3");
// console.assert(lru.get("a") === 1, "11b: get a");
//
// lru.set("d", 4); // Should evict "b" (LRU — "a" was accessed via get)
// console.assert(lru.has("b") === false, "11c: b evicted");
// console.assert(lru.has("a") === true, "11d: a still present");
// console.assert(lru.has("c") === true, "11e: c still present");
// console.assert(lru.get("d") === 4, "11f: d present");
// console.log("11: LRU cache working");

// ---------------------------------------------------------------------------
// EXERCISE 12 (Implement): WeakRef Cache
// ---------------------------------------------------------------------------
// Implement a cache that holds values via WeakRef, allowing GC to collect
// entries when memory is needed. This simulates a real pattern for image/data caching.

class WeakCache<V extends object> {
  private cache = new Map<string, WeakRef<V>>();
  private finalizer: FinalizationRegistry<string>;

  constructor() {
    // IMPLEMENT: Set up FinalizationRegistry to clean up map entries
    // when their values are garbage collected
    this.finalizer = new FinalizationRegistry((key: string) => {
      // YOUR CODE HERE
    });
  }

  // IMPLEMENT: Store a value (wrapped in WeakRef)
  set(key: string, value: V): void {
    // YOUR CODE HERE
  }

  // IMPLEMENT: Retrieve a value (may return undefined if GC collected it)
  get(key: string): V | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  get size(): number {
    return this.cache.size;
  }
}

// Tests (note: GC behavior is non-deterministic, so we can only test basic functionality):
// const weakCache = new WeakCache<{ data: string }>();
// const val1 = { data: "hello" };
// weakCache.set("key1", val1);
// console.assert(weakCache.get("key1")?.data === "hello", "12a: value retrievable");
// console.assert(weakCache.has("key1") === true, "12b: has key1");
// console.log("12: WeakRef cache working");

// ---------------------------------------------------------------------------
// EXERCISE 13 (Implement): Stack Simulator
// ---------------------------------------------------------------------------
// Simulate a call stack to understand stack frames and overflow.

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

  // IMPLEMENT: Push a new stack frame
  push(functionName: string, locals: Record<string, number> = {}): void {
    // YOUR CODE HERE
    // Throw RangeError("Maximum call stack size exceeded") if at max depth
  }

  // IMPLEMENT: Pop the top stack frame
  pop(): StackFrame | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  // IMPLEMENT: Get the current (top) frame
  peek(): StackFrame | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  get depth(): number {
    return this.frames.length;
  }

  // Get a string representation of the call stack (like a stack trace)
  getStackTrace(): string {
    return this.frames
      .slice()
      .reverse()
      .map((f, i) => `  at ${f.functionName}`)
      .join("\n");
  }
}

// Tests:
// const stack = new CallStack(5);
// stack.push("main", { argc: 0 });
// stack.push("handleClick", { event: 1 });
// stack.push("updateState", { newVal: 42 });
// console.assert(stack.depth === 3, "13a: depth 3");
// console.assert(stack.peek()?.functionName === "updateState", "13b: top is updateState");
//
// const popped = stack.pop();
// console.assert(popped?.functionName === "updateState", "13c: popped updateState");
// console.assert(stack.depth === 2, "13d: depth 2");
//
// // Test stack overflow
// const smallStack = new CallStack(3);
// smallStack.push("a");
// smallStack.push("b");
// smallStack.push("c");
// let overflowed = false;
// try { smallStack.push("d"); } catch (e) { overflowed = true; }
// console.assert(overflowed, "13e: stack overflow detected");
// console.log("13: Call stack simulator working");

// ---------------------------------------------------------------------------
// EXERCISE 14 (Implement): Heap Snapshot Diff
// ---------------------------------------------------------------------------
// Given two "heap snapshots" (maps of object type → count), compute the diff.

interface HeapSnapshot {
  [objectType: string]: number;
}

interface HeapDiff {
  added: Record<string, number>;    // types that increased
  removed: Record<string, number>;  // types that decreased
  unchanged: string[];               // types with same count
}

function diffSnapshots(before: HeapSnapshot, after: HeapSnapshot): HeapDiff {
  // YOUR CODE HERE
  // Compare before and after, categorize each object type
  return { added: {}, removed: {}, unchanged: [] };
}

// Tests:
// const before: HeapSnapshot = { Array: 100, Object: 500, String: 1000, Function: 200 };
// const after: HeapSnapshot = { Array: 150, Object: 500, String: 900, Function: 200, WeakMap: 5 };
// const diff = diffSnapshots(before, after);
// console.assert(diff.added["Array"] === 50, "14a: 50 more Arrays");
// console.assert(diff.added["WeakMap"] === 5, "14b: 5 new WeakMaps");
// console.assert(diff.removed["String"] === 100, "14c: 100 fewer Strings");
// console.assert(diff.unchanged.includes("Object"), "14d: Object unchanged");
// console.assert(diff.unchanged.includes("Function"), "14e: Function unchanged");
// console.log("14: Heap snapshot diff working");

// ---------------------------------------------------------------------------
// EXERCISE 15 (Implement): Storage Size Estimator
// ---------------------------------------------------------------------------
// Estimate the memory size of JavaScript values.
// This is approximate — real engines have overhead for headers, alignment, etc.

function estimateSize(value: unknown): number {
  // YOUR CODE HERE
  // Rules:
  // - number: 8 bytes (64-bit float)
  // - boolean: 4 bytes
  // - string: 2 bytes per character (UTF-16) + 12 bytes overhead
  // - null/undefined: 0 bytes (tags, not real allocations)
  // - array: 8 bytes per element slot + estimateSize of each element + 32 bytes overhead
  // - object: 64 bytes overhead + for each key: estimateSize(key) + estimateSize(value)
  // - function: 128 bytes (approximate)
  return 0;
}

// Tests:
// console.assert(estimateSize(42) === 8, "15a: number = 8 bytes");
// console.assert(estimateSize(true) === 4, "15b: boolean = 4 bytes");
// console.assert(estimateSize(null) === 0, "15c: null = 0 bytes");
// console.assert(estimateSize("hello") === 22, "15d: 'hello' = 5*2 + 12 = 22 bytes");
// console.assert(estimateSize([1, 2, 3]) === 8 * 3 + 8 + 8 + 8 + 32, "15e: array");
// // array: 3 slots * 8 + estimateSize(1) + estimateSize(2) + estimateSize(3) + 32 overhead
// // = 24 + 8 + 8 + 8 + 32 = 80
// console.log("15: Size estimator working");

// ---------------------------------------------------------------------------
// Compile check
// ---------------------------------------------------------------------------
console.log("exercises.ts compiled successfully — uncomment tests to verify your solutions.");
