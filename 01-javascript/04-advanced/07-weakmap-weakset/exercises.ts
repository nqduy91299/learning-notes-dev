// ============================================================================
// 07-weakmap-weakset: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/04-advanced/07-weakmap-weakset/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap key restrictions
//
// Which of these .set() calls succeed, and which throw TypeError?

function exercise1() {
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

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap — object identity matters
//
// What does each console.log print?

function exercise2() {
  const wm = new WeakMap<object, string>();

  const a = { id: 1 };
  const b = { id: 1 };

  wm.set(a, "first");
  wm.set(b, "second");

  console.log(wm.has(a));
  console.log(wm.has(b));
  console.log(wm.get(a));
  console.log(wm.get(b));
  console.log(wm.get({ id: 1 }));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap methods — set, get, has, delete
//
// What does each console.log print?

function exercise3() {
  const wm = new WeakMap<object, number>();
  const key = { name: "key" };

  console.log(wm.set(key, 10) === wm);
  console.log(wm.get(key));
  wm.set(key, 20);
  console.log(wm.get(key));
  console.log(wm.delete(key));
  console.log(wm.get(key));
  console.log(wm.delete(key));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: WeakSet basic operations
//
// What does each console.log print?

function exercise4() {
  const ws = new WeakSet<object>();

  const obj = { tag: "hello" };
  console.log(ws.add(obj) === ws);
  console.log(ws.has(obj));

  ws.add(obj); // add same object again
  console.log(ws.has(obj));

  console.log(ws.delete(obj));
  console.log(ws.has(obj));
  console.log(ws.delete(obj));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: WeakMap vs Map — reference behavior after deletion
//
// What does each console.log print?

function exercise5() {
  const map = new Map<object, string>();
  const wm = new WeakMap<object, string>();

  let user: object | null = { name: "Alice" };

  map.set(user, "map-value");
  wm.set(user, "wm-value");

  console.log(map.size);
  console.log(map.get(user));
  console.log(wm.get(user));

  // Remove our reference — but Map still holds a strong ref
  const savedRef = user;
  user = null;

  console.log(map.size);
  console.log(map.get(savedRef));
  console.log(wm.get(savedRef));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Fix the Bug ────────────────────────────────────────────────
// Topic: Wrong key type for WeakMap
//
// This code tries to use a WeakMap to cache results by user ID (a string).
// It throws a TypeError at runtime. Fix it so it works correctly,
// keeping the auto-cleanup benefit where possible.

function exercise6() {
  // BUG: This function uses string keys with WeakMap
  type User = { id: string; name: string };

  const cache = new WeakMap<object, string>();

  function getCachedGreeting(user: User): string {
    // FIX: Currently tries to use user.id (string) as key
    if (cache.has(user.id as unknown as object)) {
      return cache.get(user.id as unknown as object)!;
    }
    const greeting = `Hello, ${user.name}! (computed at ${Date.now()})`;
    cache.set(user.id as unknown as object, greeting);
    return greeting;
  }

  const alice: User = { id: "1", name: "Alice" };
  const result1 = getCachedGreeting(alice);
  const result2 = getCachedGreeting(alice);
  console.log(result1 === result2);
  console.log(result1.startsWith("Hello, Alice!"));
}

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: WeakSet — adding primitives
//
// This code tries to track "seen" values with a WeakSet, but some values
// are primitives. Fix it so it handles both objects and primitives correctly.

function exercise7() {
  // BUG: WeakSet can't hold primitives, but we try to add numbers
  const seenObjects = new WeakSet<object>();

  function hasBeenSeen(value: unknown): boolean {
    // FIX: This throws TypeError for non-object values
    return seenObjects.has(value as object);
  }

  function markSeen(value: unknown): void {
    // FIX: This throws TypeError for non-object values
    seenObjects.add(value as object);
  }

  const obj1 = { id: 1 };
  const obj2 = { id: 2 };

  markSeen(obj1);
  markSeen(42 as unknown);
  markSeen("hello" as unknown);

  console.log(hasBeenSeen(obj1));     // should print true
  console.log(hasBeenSeen(obj2));     // should print false
  console.log(hasBeenSeen(42));       // should print true
  console.log(hasBeenSeen("hello"));  // should print true
  console.log(hasBeenSeen("world"));  // should print false
}

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: WeakMap — losing the key reference
//
// The developer expected caching to work, but `getFromCache` always
// returns undefined. Find and fix the bug.

function exercise8() {
  const cache = new WeakMap<object, number>();

  function addToCache(name: string, value: number): void {
    const key = { name };
    cache.set(key, value);
  }

  function getFromCache(name: string): number | undefined {
    const key = { name };
    return cache.get(key);
  }

  addToCache("score", 100);
  console.log(getFromCache("score")); // Should print: 100
  console.log(getFromCache("score")); // Should print: 100
}

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: Visit counter using WeakMap
//
// Implement a visit counter that:
// - countVisit(user) increments the visit count for the user object
// - getVisitCount(user) returns the current count (0 if never visited)
// - Uses WeakMap so counts are cleaned up when user objects are GC'd

interface VisitCounter {
  countVisit(user: object): void;
  getVisitCount(user: object): number;
}

function createVisitCounter(): VisitCounter {
  // TODO: Implement using WeakMap
  throw new Error("Not implemented");
}

// Uncomment to test:
// const counter9 = createVisitCounter();
// const user9a = { name: "Alice" };
// const user9b = { name: "Bob" };
// counter9.countVisit(user9a);
// counter9.countVisit(user9a);
// counter9.countVisit(user9a);
// counter9.countVisit(user9b);
// console.log(counter9.getVisitCount(user9a)); // 3
// console.log(counter9.getVisitCount(user9b)); // 1
// console.log(counter9.getVisitCount({}));      // 0

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Processed items tracker using WeakSet
//
// Implement a processor that:
// - process(item) processes an item and marks it as done
// - isProcessed(item) returns true if already processed
// - process(item) should skip already-processed items (return "skipped")
// - Uses WeakSet for tracking

interface ItemProcessor {
  process(item: object): string;
  isProcessed(item: object): boolean;
}

function createItemProcessor(): ItemProcessor {
  // TODO: Implement using WeakSet
  throw new Error("Not implemented");
}

// Uncomment to test:
// const proc10 = createItemProcessor();
// const item10a = { task: "email" };
// const item10b = { task: "report" };
// console.log(proc10.process(item10a));       // "processed"
// console.log(proc10.process(item10a));       // "skipped"
// console.log(proc10.isProcessed(item10a));   // true
// console.log(proc10.isProcessed(item10b));   // false
// console.log(proc10.process(item10b));       // "processed"
// console.log(proc10.isProcessed(item10b));   // true

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Private data pattern with WeakMap
//
// Implement a Stack class that uses a WeakMap to store its internal array
// privately — no one outside should access the underlying storage.
//
// Methods: push(value), pop(), peek(), isEmpty(), size (getter)
// pop() and peek() on empty stack should throw Error("Stack is empty")

interface IStack<T> {
  push(value: T): void;
  pop(): T;
  peek(): T;
  isEmpty(): boolean;
  readonly size: number;
}

// TODO: Create a WeakMap to store private data, then implement the class
// const _stackData = ...

class PrivateStack<T> implements IStack<T> {
  constructor() {
    // TODO
    throw new Error("Not implemented");
  }

  push(_value: T): void {
    throw new Error("Not implemented");
  }

  pop(): T {
    throw new Error("Not implemented");
  }

  peek(): T {
    throw new Error("Not implemented");
  }

  isEmpty(): boolean {
    throw new Error("Not implemented");
  }

  get size(): number {
    throw new Error("Not implemented");
  }
}

// Uncomment to test:
// const stack11 = new PrivateStack<number>();
// stack11.push(10);
// stack11.push(20);
// stack11.push(30);
// console.log(stack11.peek());     // 30
// console.log(stack11.pop());      // 30
// console.log(stack11.size);       // 2
// console.log(stack11.isEmpty());  // false
// stack11.pop();
// stack11.pop();
// console.log(stack11.isEmpty());  // true
// try { stack11.pop(); } catch (e) { console.log((e as Error).message); } // "Stack is empty"

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Object memoization with WeakMap
//
// Implement a `memoizeByObject` function that:
// - Takes a function whose first argument is an object
// - Returns a memoized version that caches results keyed by the object
// - Uses WeakMap so cached entries are cleaned when objects are GC'd
// - Only considers the first argument (the object) as the cache key

function memoizeByObject<T extends object, R>(
  fn: (obj: T) => R
): (obj: T) => R {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Uncomment to test:
// let callCount12 = 0;
// function expensiveCalc(obj: { x: number; y: number }): number {
//   callCount12++;
//   return obj.x * obj.y;
// }
// const memoized12 = memoizeByObject(expensiveCalc);
// const point12 = { x: 3, y: 4 };
// console.log(memoized12(point12));  // 12
// console.log(memoized12(point12));  // 12 (cached)
// console.log(callCount12);          // 1 (only computed once)
// const point12b = { x: 3, y: 4 };
// console.log(memoized12(point12b)); // 12 (different object, recomputed)
// console.log(callCount12);          // 2

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Branding with WeakSet
//
// Implement a `Branded` factory:
// - createBranded(value) returns an object { value } and marks it as branded
// - isBranded(obj) returns true only for objects created by createBranded
// - Uses WeakSet internally

interface Branded<T> {
  value: T;
}

interface BrandedFactory {
  createBranded<T>(value: T): Branded<T>;
  isBranded(obj: object): boolean;
}

function createBrandedFactory(): BrandedFactory {
  // TODO: Implement using WeakSet
  throw new Error("Not implemented");
}

// Uncomment to test:
// const factory13 = createBrandedFactory();
// const branded13a = factory13.createBranded("hello");
// const branded13b = factory13.createBranded(42);
// const fake13 = { value: "hello" };
// console.log(factory13.isBranded(branded13a)); // true
// console.log(factory13.isBranded(branded13b)); // true
// console.log(factory13.isBranded(fake13));     // false
// console.log(branded13a.value);                // "hello"
// console.log(branded13b.value);                // 42

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Choose the right data structure
//
// Implement a DOMStyleTracker (simulated) that:
// - setStyle(element, styles) associates a style object with an element
// - getStyle(element) returns the associated styles or null
// - markDirty(element) marks an element as needing re-render
// - isDirty(element) checks if an element is dirty
// - clearDirty(element) removes the dirty mark
//
// Requirements:
// - Element metadata should not prevent GC of elements (use WeakMap)
// - Dirty tracking should not prevent GC of elements (use WeakSet)

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
  // TODO: Implement using WeakMap for styles and WeakSet for dirty tracking
  throw new Error("Not implemented");
}

// Uncomment to test:
// const tracker14 = createDOMStyleTracker();
// const div14 = { tagName: "div" };
// const span14 = { tagName: "span" };
// tracker14.setStyle(div14, { color: "red", fontSize: "16px" });
// tracker14.setStyle(span14, { color: "blue" });
// console.log(tracker14.getStyle(div14));   // { color: "red", fontSize: "16px" }
// console.log(tracker14.getStyle(span14));  // { color: "blue" }
// console.log(tracker14.getStyle({}));      // null
// tracker14.markDirty(div14);
// console.log(tracker14.isDirty(div14));    // true
// console.log(tracker14.isDirty(span14));   // false
// tracker14.clearDirty(div14);
// console.log(tracker14.isDirty(div14));    // false

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: WeakMap-based access control
//
// Implement a permission system:
// - grant(user, permission) grants a permission string to a user object
// - revoke(user, permission) revokes a specific permission
// - hasPermission(user, permission) checks if user has the permission
// - getPermissions(user) returns array of all permissions (empty if none)
//
// Use WeakMap<object, Set<string>> so permissions are cleaned up with users.

interface PermissionSystem {
  grant(user: object, permission: string): void;
  revoke(user: object, permission: string): void;
  hasPermission(user: object, permission: string): boolean;
  getPermissions(user: object): string[];
}

function createPermissionSystem(): PermissionSystem {
  // TODO: Implement using WeakMap<object, Set<string>>
  throw new Error("Not implemented");
}

// Uncomment to test:
// const perms15 = createPermissionSystem();
// const admin15 = { name: "Admin" };
// const guest15 = { name: "Guest" };
// perms15.grant(admin15, "read");
// perms15.grant(admin15, "write");
// perms15.grant(admin15, "delete");
// perms15.grant(guest15, "read");
// console.log(perms15.hasPermission(admin15, "read"));    // true
// console.log(perms15.hasPermission(admin15, "write"));   // true
// console.log(perms15.hasPermission(guest15, "write"));   // false
// console.log(perms15.getPermissions(admin15));            // ["read", "write", "delete"]
// perms15.revoke(admin15, "delete");
// console.log(perms15.getPermissions(admin15));            // ["read", "write"]
// console.log(perms15.getPermissions({}));                 // []
