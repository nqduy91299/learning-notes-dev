# WeakMap & WeakSet

WeakMap and WeakSet are special collection types where keys (WeakMap) or values (WeakSet) are held **weakly** — they do not prevent garbage collection. This makes them ideal for associating metadata with objects without causing memory leaks.

---

## 1. WeakMap Basics

A `WeakMap` is a collection of key-value pairs where **keys must be objects** (or registered symbols) — primitive values like strings or numbers are not allowed:

```js
const wm = new WeakMap();

const obj = { name: "Alice" };
const arr = [1, 2, 3];
const fn = () => {};

wm.set(obj, "object value");    // OK — plain object
wm.set(arr, "array value");     // OK — array is an object
wm.set(fn, "function value");   // OK — function is an object

// Registered symbols (Symbol.for) work as keys in modern engines (ES2023+):
const sym = Symbol.for("myKey");
wm.set(sym, "symbol value");    // OK — registered symbol

// Primitive keys are NOT allowed:
wm.set("hello", 1);             // TypeError: Invalid value used as weak map key
wm.set(42, 1);                  // TypeError
wm.set(true, 1);                // TypeError
wm.set(null, 1);                // TypeError
wm.set(Symbol("local"), 1);     // TypeError — unregistered symbol
```

Why only objects? Because WeakMap holds keys **weakly** — the engine needs to track whether the key is still reachable. Primitives are not garbage-collected the same way objects are (they're immutable values, not heap-allocated references), so they can't participate in weak referencing.

---

## 2. WeakMap Methods

WeakMap has only **four** methods — no `size` property, no iteration:

```js
const wm = new WeakMap();
const key = {};

// set(key, value) — adds or updates an entry, returns the WeakMap
wm.set(key, 100);

// get(key) — returns the value, or undefined if not found
wm.get(key);     // 100
wm.get({});      // undefined — different object reference

// has(key) — returns boolean
wm.has(key);     // true

// delete(key) — removes the entry, returns boolean
wm.delete(key);  // true
wm.has(key);     // false
wm.delete(key);  // false — already gone
```

What WeakMap does **NOT** have:

| Missing            | Reason                                           |
|--------------------|--------------------------------------------------|
| `size`             | Count can change at any moment due to GC          |
| `keys()`           | Cannot iterate — entries may vanish unpredictably  |
| `values()`         | Same reason                                        |
| `entries()`        | Same reason                                        |
| `forEach()`        | Same reason                                        |
| `clear()`          | Removed in ES6 final spec for security reasons     |
| `Symbol.iterator`  | WeakMap is not iterable                            |

---

## 3. Garbage Collection with WeakMap

The defining characteristic of WeakMap: if the **only** remaining reference to an object is as a WeakMap key, that object can be garbage collected — and the corresponding entry is automatically removed:

```js
const wm = new WeakMap();

let user = { name: "Alice" };
wm.set(user, { role: "admin" });

// user is accessible → entry stays in WeakMap
console.log(wm.get(user)); // { role: "admin" }

// Remove the only reference to the object:
user = null;

// Now the { name: "Alice" } object is eligible for GC.
// At some point the engine will collect it, and the WeakMap entry disappears.
// We can't observe this directly — there's no size property or iteration.
```

Compare with a regular `Map`:

```js
const map = new Map();

let user = { name: "Alice" };
map.set(user, { role: "admin" });

user = null;

// The { name: "Alice" } object is NOT garbage collected —
// the Map still holds a strong reference to it as a key.
// map.size is still 1, and we can iterate to find it.
```

This is the core memory-leak problem that WeakMap solves.

---

## 4. Why WeakMap Is Not Iterable

Garbage collection is **non-deterministic** — the engine decides when to reclaim memory, and this timing is not observable from JavaScript code. This means:

1. The number of entries in a WeakMap can change at any time without any code running.
2. Two consecutive calls to a hypothetical `wm.size` might return different values.
3. Iterating would produce unpredictable, non-reproducible results.

For these reasons, the spec deliberately omits `size`, all iterators, and `forEach`. The only operations allowed are point lookups (`get`, `has`) and mutations (`set`, `delete`).

---

## 5. Use Case: Additional Data Storage

Attach metadata to objects you don't own — the metadata is automatically cleaned up when the object is collected:

```js
// Module: visitCounter.js
const visitCounts = new WeakMap();

function countVisit(user) {
  const count = visitCounts.get(user) || 0;
  visitCounts.set(user, count + 1);
}

function getVisitCount(user) {
  return visitCounts.get(user) || 0;
}

// Usage:
let alice = { name: "Alice" };
countVisit(alice);
countVisit(alice);
countVisit(alice);
console.log(getVisitCount(alice)); // 3

// When alice is no longer needed:
alice = null;
// The visit count data is automatically cleaned up — no memory leak.
```

If we used a regular `Map`, we'd need to manually call `map.delete(alice)` before setting `alice = null`, or the user object and its count would remain in memory forever.

---

## 6. Use Case: Caching / Memoization

Cache computed results keyed by the object they were computed from. When the object is collected, the cached result goes with it:

```js
const cache = new WeakMap();

function computeExpensiveResult(obj) {
  if (cache.has(obj)) {
    console.log("Cache hit");
    return cache.get(obj);
  }

  console.log("Computing...");
  const result = /* expensive computation */ JSON.stringify(obj);
  cache.set(obj, result);
  return result;
}

let data = { x: 1, y: 2 };
computeExpensiveResult(data); // "Computing..."
computeExpensiveResult(data); // "Cache hit"

// When `data` is no longer referenced, the cached result is freed automatically.
data = null;
```

This pattern is especially useful in libraries and frameworks that process user-provided objects — you get caching without worrying about cache invalidation or memory leaks.

---

## 7. Use Case: Private Data

Store truly private state keyed by instance — external code cannot access the WeakMap:

```js
const _balance = new WeakMap();

class BankAccount {
  constructor(initialBalance) {
    _balance.set(this, initialBalance);
  }

  deposit(amount) {
    _balance.set(this, _balance.get(this) + amount);
  }

  withdraw(amount) {
    const current = _balance.get(this);
    if (amount > current) throw new Error("Insufficient funds");
    _balance.set(this, current - amount);
  }

  getBalance() {
    return _balance.get(this);
  }
}

const account = new BankAccount(100);
account.deposit(50);
console.log(account.getBalance()); // 150

// No way to access _balance from outside this module — true privacy.
// When `account` is garbage collected, the balance data is freed too.
```

> **Note:** Modern JavaScript has native private fields (`#field`). The WeakMap pattern was the standard approach before `#private` syntax was available and is still used in transpiled code.

---

## 8. WeakSet Basics

A `WeakSet` is a collection of **objects only** (like WeakMap keys) with no values. Objects are held weakly:

```js
const ws = new WeakSet();

const obj = { id: 1 };
const arr = [1, 2, 3];

// add(value) — adds an object, returns the WeakSet
ws.add(obj);
ws.add(arr);

// has(value) — returns boolean
ws.has(obj); // true
ws.has({});  // false — different reference

// delete(value) — removes the object, returns boolean
ws.delete(obj); // true
ws.has(obj);    // false

// Primitives are NOT allowed:
ws.add("hello"); // TypeError: Invalid value used in weak set
ws.add(42);      // TypeError
```

Like WeakMap, WeakSet has **no** `size`, no iteration methods, and no `forEach` — for the same GC-related reasons.

### WeakSet Methods Summary

| Method       | Returns   | Description                      |
|------------- |-----------|----------------------------------|
| `add(obj)`   | WeakSet   | Adds the object to the set       |
| `has(obj)`   | boolean   | Checks if the object is in set   |
| `delete(obj)`| boolean   | Removes the object from the set  |

---

## 9. Use Case: Tagging Objects

Mark objects as "visited" or "processed" without modifying them:

```js
const visited = new WeakSet();

function processNode(node) {
  if (visited.has(node)) {
    console.log("Already processed:", node.id);
    return;
  }

  visited.add(node);
  console.log("Processing:", node.id);
  // ... do work ...
}

let nodeA = { id: "A" };
let nodeB = { id: "B" };

processNode(nodeA); // "Processing: A"
processNode(nodeB); // "Processing: B"
processNode(nodeA); // "Already processed: A"

// When nodes are no longer referenced, they're cleaned up automatically.
nodeA = null;
nodeB = null;
```

This is particularly useful for **graph traversal** or **DOM tree walking** where you need cycle detection without risking memory leaks.

---

## 10. Use Case: Branding

Verify that an object was created by a specific constructor or factory:

```js
const branded = new WeakSet();

class SecureToken {
  constructor(value) {
    this.value = value;
    branded.add(this);
  }

  static isValid(token) {
    return branded.has(token);
  }
}

const real = new SecureToken("abc123");
const fake = { value: "abc123" };

SecureToken.isValid(real); // true
SecureToken.isValid(fake); // false — not created by constructor
```

This prevents spoofing: even if someone creates an object with the same shape, it won't pass the brand check. The WeakSet ensures that tokens are freed from the branding set when they're garbage collected.

---

## 11. WeakMap vs Map Comparison

| Feature                | `Map`                       | `WeakMap`                          |
|------------------------|-----------------------------|------------------------------------|
| Key types              | Any value                   | Objects (and registered symbols)   |
| Holds keys             | Strongly                    | Weakly                             |
| `size` property        | Yes                         | No                                 |
| Iterable               | Yes (`keys`, `values`, etc.)| No                                 |
| `forEach`              | Yes                         | No                                 |
| `clear()`              | Yes                         | No                                 |
| GC of keys             | Never (prevents GC)         | Allowed when no other refs exist   |
| Memory leaks           | Possible if keys not removed| Self-cleaning                      |
| Use case               | General key-value storage   | Metadata, caches, private data     |
| Serializable           | Yes (with custom logic)     | No (can't enumerate entries)       |

**Rule of thumb:** Use `Map` when you need to iterate, know the size, or use primitive keys. Use `WeakMap` when you're attaching auxiliary data to objects and want automatic cleanup.

---

## 12. WeakRef (Brief)

`WeakRef` (ES2021) creates a weak reference to an object — it lets you hold a reference that doesn't prevent garbage collection:

```js
let target = { data: "important" };
const ref = new WeakRef(target);

// Access the target via deref():
console.log(ref.deref());        // { data: "important" }
console.log(ref.deref()?.data);  // "important"

// After the target is collected, deref() returns undefined:
target = null;
// ... after GC runs ...
// ref.deref() → undefined
```

### Key Points

- `new WeakRef(target)` — creates a weak reference.
- `ref.deref()` — returns the target object, or `undefined` if collected.
- **Don't use WeakRef unless necessary** — the spec warns that GC behavior is engine-dependent and non-deterministic. Prefer WeakMap/WeakSet for most use cases.
- Common use: implementing caches where you want to keep objects alive only if they're used elsewhere.

```js
function makeWeakCache(compute) {
  const cache = new Map();  // string key → WeakRef

  return (key) => {
    const ref = cache.get(key);
    if (ref) {
      const cached = ref.deref();
      if (cached !== undefined) return cached;
    }

    const result = compute(key);
    cache.set(key, new WeakRef(result));
    return result;
  };
}
```

---

## 13. FinalizationRegistry (Brief)

`FinalizationRegistry` (ES2021) lets you register a callback that runs when a registered object is garbage collected:

```js
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object associated with "${heldValue}" was collected`);
  // Perform cleanup: close file handle, release resource, etc.
});

let obj = { name: "resource" };
registry.register(obj, "my-resource");
// Second argument is the "held value" — passed to the callback.

obj = null;
// Eventually, when GC collects the object:
// → "Object associated with "my-resource" was collected"
```

### API

```js
const registry = new FinalizationRegistry(callback);

// Register an object for cleanup notification:
registry.register(target, heldValue);
// heldValue is passed to callback when target is collected.

// Optionally provide an unregister token:
registry.register(target, heldValue, unregisterToken);

// Unregister to cancel the callback:
registry.unregister(unregisterToken);
```

### Caveats

- **Callbacks are not guaranteed to run** — if the program exits before GC, the callback won't fire.
- **Timing is unpredictable** — callbacks may run much later, or in batches.
- **Don't rely on it for correctness** — use it only for optimization/cleanup, never for essential logic.
- Common use: cleaning up external resources (file handles, network connections, native objects in WebAssembly).

---

## 14. When to Use: Decision Guide

```
Do you need to associate data with objects?
├── Are the keys primitives (strings, numbers)?
│   └── YES → Use Map
├── Do you need to iterate over entries or know the count?
│   └── YES → Use Map / Set
├── Do you need automatic cleanup when keys are GC'd?
│   └── YES → Use WeakMap
└── Otherwise → Use Map

Do you need a collection of unique values?
├── Are the values primitives?
│   └── YES → Use Set
├── Do you need to iterate or know the count?
│   └── YES → Use Set
├── Do you just need to "tag" or "mark" objects?
│   └── YES → Use WeakSet
└── Otherwise → Use Set
```

### Quick Reference

| Scenario                                  | Best Choice |
|-------------------------------------------|-------------|
| General key-value storage                 | `Map`       |
| Cache keyed by objects, auto-cleanup      | `WeakMap`   |
| Private data keyed by instance            | `WeakMap`   |
| Metadata on DOM elements                  | `WeakMap`   |
| Unique collection of primitives           | `Set`       |
| Unique collection, need iteration         | `Set`       |
| Tagging/marking objects (visited, etc.)   | `WeakSet`   |
| Branding (created-by check)              | `WeakSet`   |
| Weak reference to single object           | `WeakRef`   |
| Cleanup callback on GC                    | `FinalizationRegistry` |

---

## 15. Common Pitfalls

1. **Using primitives as WeakMap keys** — always results in `TypeError`. If you need string or number keys, use `Map`.

2. **Expecting deterministic GC behavior** — you cannot force or predict when entries will be collected. Don't write code that depends on specific GC timing.

3. **Using WeakMap as a general-purpose Map** — if you need `size`, iteration, or serialization, use `Map`.

4. **Forgetting that object identity matters** — `wm.set({}, 1); wm.get({})` returns `undefined` because the two `{}` are different objects.

5. **Holding extra references** — if you keep a reference to the key in another variable, array, or closure, the WeakMap entry won't be cleaned up. WeakMap only helps when the key truly becomes unreachable.

```js
const wm = new WeakMap();
const retained = [];

let obj = {};
wm.set(obj, "data");
retained.push(obj); // Extra strong reference!

obj = null;
// The object is NOT collected — `retained` still holds it.
```

---

## References

- [javascript.info — WeakMap and WeakSet](https://javascript.info/weakmap-weakset)
- [MDN — WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [MDN — WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
- [MDN — WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef)
- [MDN — FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry)
