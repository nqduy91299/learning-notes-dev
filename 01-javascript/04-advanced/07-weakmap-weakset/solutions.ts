// ============================================================================
// 07-weakmap-weakset: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap key restrictions

function solution1() {
  const wm = new WeakMap();

  const results: string[] = [];

  try { wm.set({}, "plain object"); results.push("obj: OK"); }
  catch { results.push("obj: TypeError"); }

  try { wm.set([] as object, "array"); results.push("arr: OK"); }
  catch { results.push("arr: TypeError"); }

  try { wm.set((() => {}) as object, "function"); results.push("fn: OK"); }
  catch { results.push("fn: TypeError"); }

  try { (wm as WeakMap<object, string>).set(null as unknown as object, "null"); results.push("null: OK"); }
  catch { results.push("null: TypeError"); }

  try { (wm as WeakMap<object, string>).set(42 as unknown as object, "number"); results.push("num: OK"); }
  catch { results.push("num: TypeError"); }

  try { (wm as WeakMap<object, string>).set("hello" as unknown as object, "string"); results.push("str: OK"); }
  catch { results.push("str: TypeError"); }

  for (const r of results) console.log(r);
}

// ANSWER:
// Log 1: "obj: OK"
// Log 2: "arr: OK"
// Log 3: "fn: OK"
// Log 4: "null: TypeError"
// Log 5: "num: TypeError"
// Log 6: "str: TypeError"
//
// Explanation:
// WeakMap keys must be objects (or registered symbols). Plain objects, arrays,
// and functions are all objects — they work fine. null, numbers, and strings
// are primitives — they throw TypeError.
// See README → Section 1: WeakMap Basics

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap — object identity matters

function solution2() {
  const wm = new WeakMap<object, string>();

  const a = { id: 1 };
  const b = { id: 1 };

  wm.set(a, "first");
  wm.set(b, "second");

  console.log(wm.has(a));          // true
  console.log(wm.has(b));          // true
  console.log(wm.get(a));          // "first"
  console.log(wm.get(b));          // "second"
  console.log(wm.get({ id: 1 })); // undefined
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: "first"
// Log 4: "second"
// Log 5: undefined
//
// Explanation:
// WeakMap uses object identity (reference equality), not structural equality.
// `a` and `b` look identical but are different objects in memory, so they
// are separate keys. `{ id: 1 }` in the get() call creates yet another
// different object, which has no entry in the WeakMap.
// See README → Section 15: Common Pitfalls (point 4)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap methods — set, get, has, delete

function solution3() {
  const wm = new WeakMap<object, number>();
  const key = { name: "key" };

  console.log(wm.set(key, 10) === wm); // true
  console.log(wm.get(key));            // 10
  wm.set(key, 20);
  console.log(wm.get(key));            // 20
  console.log(wm.delete(key));         // true
  console.log(wm.get(key));            // undefined
  console.log(wm.delete(key));         // false
}

// ANSWER:
// Log 1: true
// Log 2: 10
// Log 3: 20
// Log 4: true
// Log 5: undefined
// Log 6: false
//
// Explanation:
// - `set()` returns the WeakMap itself (for chaining), so `=== wm` is true.
// - `set()` with an existing key overwrites the value (10 → 20).
// - `delete()` returns true if the key existed, false otherwise.
// - After delete, `get()` returns undefined.
// See README → Section 2: WeakMap Methods

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: WeakSet basic operations

function solution4() {
  const ws = new WeakSet<object>();

  const obj = { tag: "hello" };
  console.log(ws.add(obj) === ws);  // true
  console.log(ws.has(obj));         // true

  ws.add(obj); // add same object again — no effect (it's a set)
  console.log(ws.has(obj));         // true

  console.log(ws.delete(obj));      // true
  console.log(ws.has(obj));         // false
  console.log(ws.delete(obj));      // false
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: true
// Log 4: true
// Log 5: false
// Log 6: false
//
// Explanation:
// - `add()` returns the WeakSet itself (for chaining).
// - Adding the same object twice has no effect — it's already in the set.
// - `delete()` returns true if the object was in the set, false if not.
// - After deletion, `has()` returns false.
// See README → Section 8: WeakSet Basics

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap vs Map — reference behavior after deletion

function solution5() {
  const map = new Map<object, string>();
  const wm = new WeakMap<object, string>();

  let user: object | null = { name: "Alice" };

  map.set(user, "map-value");
  wm.set(user, "wm-value");

  console.log(map.size);           // 1
  console.log(map.get(user));      // "map-value"
  console.log(wm.get(user));       // "wm-value"

  // We save the reference before nulling user
  const savedRef = user;
  user = null;

  console.log(map.size);           // 1
  console.log(map.get(savedRef));  // "map-value"
  console.log(wm.get(savedRef));   // "wm-value"
}

// ANSWER:
// Log 1: 1
// Log 2: "map-value"
// Log 3: "wm-value"
// Log 4: 1
// Log 5: "map-value"
// Log 6: "wm-value"
//
// Explanation:
// Setting `user = null` removes one reference, but `savedRef` still points
// to the same object. Both Map and WeakMap still have the entry because
// the object is still reachable via `savedRef`. The object won't be GC'd
// until ALL references (including `savedRef`, the Map key, etc.) are gone.
// The key difference is: Map keeps the object alive even if savedRef were
// also nulled, while WeakMap would allow GC in that case.
// See README → Section 3: Garbage Collection with WeakMap

// ─── Exercise 6: Fix the Bug ────────────────────────────────────────────────
// Topic: Wrong key type for WeakMap

function solution6() {
  // FIX: Use the user object itself as the key, not user.id (a string).
  // WeakMap keys must be objects — strings throw TypeError.
  type User = { id: string; name: string };

  const cache = new WeakMap<User, string>();

  function getCachedGreeting(user: User): string {
    if (cache.has(user)) {
      return cache.get(user)!;
    }
    const greeting = `Hello, ${user.name}! (computed at ${Date.now()})`;
    cache.set(user, greeting);
    return greeting;
  }

  const alice: User = { id: "1", name: "Alice" };
  const result1 = getCachedGreeting(alice);
  const result2 = getCachedGreeting(alice);
  console.log(result1 === result2);              // true
  console.log(result1.startsWith("Hello, Alice!")); // true
}

// Explanation:
// The bug was using `user.id` (a string) as the WeakMap key. Strings are
// primitives and throw TypeError. The fix is to use the `user` object itself
// as the key. This works because we pass the same object reference, so
// the second call finds the cached entry.
// See README → Section 1: WeakMap Basics

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: WeakSet — adding primitives

function solution7() {
  // FIX: Use WeakSet for objects and a regular Set for primitives.
  // WeakSet cannot hold primitives, so we need a separate collection.
  const seenObjects = new WeakSet<object>();
  const seenPrimitives = new Set<unknown>();

  function hasBeenSeen(value: unknown): boolean {
    if (typeof value === "object" && value !== null) {
      return seenObjects.has(value);
    }
    return seenPrimitives.has(value);
  }

  function markSeen(value: unknown): void {
    if (typeof value === "object" && value !== null) {
      seenObjects.add(value);
    } else {
      seenPrimitives.add(value);
    }
  }

  const obj1 = { id: 1 };
  const obj2 = { id: 2 };

  markSeen(obj1);
  markSeen(42);
  markSeen("hello");

  console.log(hasBeenSeen(obj1));     // true
  console.log(hasBeenSeen(obj2));     // false
  console.log(hasBeenSeen(42));       // true
  console.log(hasBeenSeen("hello"));  // true
  console.log(hasBeenSeen("world"));  // false
}

// Explanation:
// WeakSet only accepts objects. The fix uses two data structures: a WeakSet
// for objects (so they can be GC'd) and a regular Set for primitive values.
// We check the type at runtime to route values to the correct collection.
// See README → Section 8: WeakSet Basics

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: WeakMap — losing the key reference

function solution8() {
  // FIX: Store a Map from name → key object, so we can look up the same
  // object reference later. The bug was that each call to addToCache and
  // getFromCache created a NEW { name } object — different reference.
  const cache = new WeakMap<object, number>();
  const keyMap = new Map<string, object>();

  function getOrCreateKey(name: string): object {
    if (!keyMap.has(name)) {
      keyMap.set(name, { name });
    }
    return keyMap.get(name)!;
  }

  function addToCache(name: string, value: number): void {
    const key = getOrCreateKey(name);
    cache.set(key, value);
  }

  function getFromCache(name: string): number | undefined {
    const key = keyMap.get(name);
    if (!key) return undefined;
    return cache.get(key);
  }

  addToCache("score", 100);
  console.log(getFromCache("score")); // 100
  console.log(getFromCache("score")); // 100
}

// Explanation:
// The original code created `{ name }` in both addToCache and getFromCache.
// Even though the objects have the same contents, they are different object
// references — so the WeakMap lookup always failed. The fix stores a
// persistent mapping from string name to key object, ensuring the same
// reference is used for both set and get operations.
// See README → Section 15: Common Pitfalls (point 4)

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: Visit counter using WeakMap

interface VisitCounter {
  countVisit(user: object): void;
  getVisitCount(user: object): number;
}

function createVisitCounter(): VisitCounter {
  const counts = new WeakMap<object, number>();

  return {
    countVisit(user: object): void {
      const current = counts.get(user) || 0;
      counts.set(user, current + 1);
    },
    getVisitCount(user: object): number {
      return counts.get(user) || 0;
    },
  };
}

// Explanation:
// We use a WeakMap<object, number> to store visit counts keyed by user object.
// countVisit reads the current count (defaulting to 0) and increments it.
// getVisitCount returns the stored count (defaulting to 0).
// When a user object is no longer referenced elsewhere, the WeakMap entry
// is automatically eligible for garbage collection.
// See README → Section 5: Use Case — Additional Data Storage

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Processed items tracker using WeakSet

interface ItemProcessor {
  process(item: object): string;
  isProcessed(item: object): boolean;
}

function createItemProcessor(): ItemProcessor {
  const processed = new WeakSet<object>();

  return {
    process(item: object): string {
      if (processed.has(item)) {
        return "skipped";
      }
      processed.add(item);
      return "processed";
    },
    isProcessed(item: object): boolean {
      return processed.has(item);
    },
  };
}

// Explanation:
// A WeakSet is perfect for tracking "has this been processed" — it's a
// boolean association (in-the-set or not). process() checks if the item
// is already tracked, returns "skipped" if so, otherwise adds it and
// returns "processed". The WeakSet ensures no memory leak.
// See README → Section 9: Use Case — Tagging Objects

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Private data pattern with WeakMap

interface IStack<T> {
  push(value: T): void;
  pop(): T;
  peek(): T;
  isEmpty(): boolean;
  readonly size: number;
}

const _stackData = new WeakMap<object, unknown[]>();

class PrivateStack<T> implements IStack<T> {
  constructor() {
    _stackData.set(this, []);
  }

  push(value: T): void {
    const data = _stackData.get(this) as T[];
    data.push(value);
  }

  pop(): T {
    const data = _stackData.get(this) as T[];
    if (data.length === 0) throw new Error("Stack is empty");
    return data.pop() as T;
  }

  peek(): T {
    const data = _stackData.get(this) as T[];
    if (data.length === 0) throw new Error("Stack is empty");
    return data[data.length - 1];
  }

  isEmpty(): boolean {
    const data = _stackData.get(this) as T[];
    return data.length === 0;
  }

  get size(): number {
    const data = _stackData.get(this) as T[];
    return data.length;
  }
}

// Explanation:
// The WeakMap `_stackData` maps each PrivateStack instance (`this`) to its
// internal array. External code cannot access the array — it's not a
// property on the instance, and the WeakMap variable is module-scoped.
// When a PrivateStack instance is GC'd, the WeakMap entry and its array
// are cleaned up automatically.
// See README → Section 7: Use Case — Private Data

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Object memoization with WeakMap

function memoizeByObject<T extends object, R>(
  fn: (obj: T) => R
): (obj: T) => R {
  const cache = new WeakMap<T, R>();

  return (obj: T): R => {
    if (cache.has(obj)) {
      return cache.get(obj) as R;
    }
    const result = fn(obj);
    cache.set(obj, result);
    return result;
  };
}

// Explanation:
// We create a WeakMap that maps input objects to their computed results.
// On each call, we first check if the object already has a cached result.
// If so, we return it immediately (no recomputation). If not, we call the
// original function, store the result, and return it. Because the cache
// uses a WeakMap, entries are automatically cleaned when the key object
// is garbage collected — no cache invalidation needed.
// See README → Section 6: Use Case — Caching / Memoization

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Branding with WeakSet

interface Branded<T> {
  value: T;
}

interface BrandedFactory {
  createBranded<T>(value: T): Branded<T>;
  isBranded(obj: object): boolean;
}

function createBrandedFactory(): BrandedFactory {
  const brandedSet = new WeakSet<object>();

  return {
    createBranded<T>(value: T): Branded<T> {
      const obj: Branded<T> = { value };
      brandedSet.add(obj);
      return obj;
    },
    isBranded(obj: object): boolean {
      return brandedSet.has(obj);
    },
  };
}

// Explanation:
// The WeakSet `brandedSet` tracks all objects created by `createBranded`.
// `isBranded` simply checks membership. External code can't forge a branded
// object because it doesn't have access to the WeakSet. When a branded
// object is garbage collected, it's automatically removed from the set.
// See README → Section 10: Use Case — Branding

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Choose the right data structure

interface StyleMap {
  [property: string]: string;
}

interface DOMStyleTracker {
  setStyle(element: object, styles: StyleMap): void;
  getStyle(element: object): StyleMap | null;
  markDirty(element: object): void;
  isDirty(element: object): boolean;
  clearDirty(element: object): void;
}

function createDOMStyleTracker(): DOMStyleTracker {
  const styles = new WeakMap<object, StyleMap>();
  const dirty = new WeakSet<object>();

  return {
    setStyle(element: object, styleObj: StyleMap): void {
      styles.set(element, styleObj);
    },
    getStyle(element: object): StyleMap | null {
      return styles.get(element) ?? null;
    },
    markDirty(element: object): void {
      dirty.add(element);
    },
    isDirty(element: object): boolean {
      return dirty.has(element);
    },
    clearDirty(element: object): void {
      dirty.delete(element);
    },
  };
}

// Explanation:
// This combines both WeakMap and WeakSet in one practical pattern:
// - WeakMap<object, StyleMap> stores style data associated with elements.
// - WeakSet<object> tracks which elements are "dirty" (need re-render).
// Both collections hold element references weakly, so if an element is
// removed from the DOM and no other references exist, both the style data
// and dirty flag are automatically cleaned up.
// See README → Section 14: When to Use — Decision Guide

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: WeakMap-based access control

interface PermissionSystem {
  grant(user: object, permission: string): void;
  revoke(user: object, permission: string): void;
  hasPermission(user: object, permission: string): boolean;
  getPermissions(user: object): string[];
}

function createPermissionSystem(): PermissionSystem {
  const permissions = new WeakMap<object, Set<string>>();

  function getOrCreate(user: object): Set<string> {
    if (!permissions.has(user)) {
      permissions.set(user, new Set<string>());
    }
    return permissions.get(user)!;
  }

  return {
    grant(user: object, permission: string): void {
      getOrCreate(user).add(permission);
    },
    revoke(user: object, permission: string): void {
      const perms = permissions.get(user);
      if (perms) {
        perms.delete(permission);
      }
    },
    hasPermission(user: object, permission: string): boolean {
      const perms = permissions.get(user);
      return perms ? perms.has(permission) : false;
    },
    getPermissions(user: object): string[] {
      const perms = permissions.get(user);
      return perms ? [...perms] : [];
    },
  };
}

// Explanation:
// We use WeakMap<object, Set<string>> — each user object maps to a Set of
// permission strings. The WeakMap ensures that when a user object is GC'd,
// their permissions are freed too. getOrCreate() lazily initializes the Set
// on first grant. getPermissions() spreads the Set into an array copy.
// See README → Section 5: Use Case — Additional Data Storage

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: WeakMap key restrictions ===");
solution1();

console.log("\n=== Exercise 2: Object identity matters ===");
solution2();

console.log("\n=== Exercise 3: WeakMap methods ===");
solution3();

console.log("\n=== Exercise 4: WeakSet basic operations ===");
solution4();

console.log("\n=== Exercise 5: WeakMap vs Map references ===");
solution5();

console.log("\n=== Exercise 6: Fix wrong key type ===");
solution6();

console.log("\n=== Exercise 7: Fix primitives in WeakSet ===");
solution7();

console.log("\n=== Exercise 8: Fix lost key reference ===");
solution8();

console.log("\n=== Exercise 9: Visit counter ===");
const counter9 = createVisitCounter();
const user9a = { name: "Alice" };
const user9b = { name: "Bob" };
counter9.countVisit(user9a);
counter9.countVisit(user9a);
counter9.countVisit(user9a);
counter9.countVisit(user9b);
console.log(counter9.getVisitCount(user9a)); // 3
console.log(counter9.getVisitCount(user9b)); // 1
console.log(counter9.getVisitCount({}));      // 0

console.log("\n=== Exercise 10: Processed items tracker ===");
const proc10 = createItemProcessor();
const item10a = { task: "email" };
const item10b = { task: "report" };
console.log(proc10.process(item10a));       // "processed"
console.log(proc10.process(item10a));       // "skipped"
console.log(proc10.isProcessed(item10a));   // true
console.log(proc10.isProcessed(item10b));   // false
console.log(proc10.process(item10b));       // "processed"
console.log(proc10.isProcessed(item10b));   // true

console.log("\n=== Exercise 11: Private stack ===");
const stack11 = new PrivateStack<number>();
stack11.push(10);
stack11.push(20);
stack11.push(30);
console.log(stack11.peek());     // 30
console.log(stack11.pop());      // 30
console.log(stack11.size);       // 2
console.log(stack11.isEmpty());  // false
stack11.pop();
stack11.pop();
console.log(stack11.isEmpty());  // true
try { stack11.pop(); } catch (e) { console.log((e as Error).message); } // "Stack is empty"

console.log("\n=== Exercise 12: Memoize by object ===");
let callCount12 = 0;
function expensiveCalc(obj: { x: number; y: number }): number {
  callCount12++;
  return obj.x * obj.y;
}
const memoized12 = memoizeByObject(expensiveCalc);
const point12 = { x: 3, y: 4 };
console.log(memoized12(point12));  // 12
console.log(memoized12(point12));  // 12 (cached)
console.log(callCount12);          // 1 (only computed once)
const point12b = { x: 3, y: 4 };
console.log(memoized12(point12b)); // 12 (different object, recomputed)
console.log(callCount12);          // 2

console.log("\n=== Exercise 13: Branding ===");
const factory13 = createBrandedFactory();
const branded13a = factory13.createBranded("hello");
const branded13b = factory13.createBranded(42);
const fake13 = { value: "hello" };
console.log(factory13.isBranded(branded13a)); // true
console.log(factory13.isBranded(branded13b)); // true
console.log(factory13.isBranded(fake13));     // false
console.log(branded13a.value);                // "hello"
console.log(branded13b.value);                // 42

console.log("\n=== Exercise 14: DOM style tracker ===");
const tracker14 = createDOMStyleTracker();
const div14 = { tagName: "div" };
const span14 = { tagName: "span" };
tracker14.setStyle(div14, { color: "red", fontSize: "16px" });
tracker14.setStyle(span14, { color: "blue" });
console.log(tracker14.getStyle(div14));   // { color: "red", fontSize: "16px" }
console.log(tracker14.getStyle(span14));  // { color: "blue" }
console.log(tracker14.getStyle({}));      // null
tracker14.markDirty(div14);
console.log(tracker14.isDirty(div14));    // true
console.log(tracker14.isDirty(span14));   // false
tracker14.clearDirty(div14);
console.log(tracker14.isDirty(div14));    // false

console.log("\n=== Exercise 15: Permission system ===");
const perms15 = createPermissionSystem();
const admin15 = { name: "Admin" };
const guest15 = { name: "Guest" };
perms15.grant(admin15, "read");
perms15.grant(admin15, "write");
perms15.grant(admin15, "delete");
perms15.grant(guest15, "read");
console.log(perms15.hasPermission(admin15, "read"));    // true
console.log(perms15.hasPermission(admin15, "write"));   // true
console.log(perms15.hasPermission(guest15, "write"));   // false
console.log(perms15.getPermissions(admin15));            // ["read", "write", "delete"]
perms15.revoke(admin15, "delete");
console.log(perms15.getPermissions(admin15));            // ["read", "write"]
console.log(perms15.getPermissions({}));                 // []
