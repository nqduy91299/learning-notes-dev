// ============================================================================
// 06-proxy-reflect: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Basic proxy — empty handler is a transparent pass-through

function solution1() {
  const target = { a: 1, b: 2 };
  const proxy = new Proxy(target, {});

  proxy.c = 3;

  console.log(proxy.a);          // 1
  console.log(proxy.c);          // 3
  console.log(target.c);         // 3
  console.log(proxy === target); // false
}

// ANSWER:
// Log 1: 1
// Log 2: 3
// Log 3: 3
// Log 4: false
//
// Explanation:
// An empty handler ({}) creates a transparent pass-through proxy. All operations
// are forwarded directly to the target. Setting `proxy.c = 3` actually sets
// `target.c = 3`. But the proxy is a different object from the target, so
// `proxy === target` is false.
// See README → Section 2: new Proxy(target, handler)

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: get trap — intercepting property reads

function solution2() {
  const handler: ProxyHandler<Record<string, number>> = {
    get(target, prop, _receiver) {
      const key = String(prop);
      return Object.hasOwn(target, key) ? target[key] : -1;
    },
  };

  const scores = new Proxy<Record<string, number>>({ alice: 90, bob: 85 }, handler);

  console.log(scores.alice);    // 90
  console.log(scores.bob);      // 85
  console.log(scores.charlie);  // -1
  console.log(scores.toString); // -1
}

// ANSWER:
// Log 1: 90
// Log 2: 85
// Log 3: -1
// Log 4: -1
//
// Explanation:
// The get trap intercepts ALL property reads. It uses `Object.hasOwn(target, key)`
// to check only own properties of the target. "alice" and "bob" are own
// properties, so their values (90, 85) are returned. "charlie" and "toString"
// are NOT own properties of the target (toString is inherited from
// Object.prototype, but hasOwn ignores the prototype chain), so -1 is returned.
// Note: if we had used `key in target` instead, toString would have been found
// on the prototype chain and the result would differ.
// See README → Section 3.1: get trap

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: set trap — must return boolean

function solution3() {
  const handler: ProxyHandler<Record<string, unknown>> = {
    set(target, prop, value, _receiver) {
      if (typeof value === "string" && value.length === 0) {
        throw new TypeError("Cannot assign empty string");
      }
      target[String(prop)] = value;
      return true;
    },
  };

  const obj = new Proxy<Record<string, unknown>>({}, handler);

  obj.name = "Alice";
  console.log(obj.name);       // "Alice"

  obj.count = 42;
  console.log(obj.count);      // 42

  try {
    obj.empty = "";
  } catch (e) {
    console.log((e as Error).message); // "Cannot assign empty string"
  }
}

// ANSWER:
// Log 1: "Alice"
// Log 2: 42
// Log 3: "Cannot assign empty string"
//
// Explanation:
// The set trap explicitly throws a TypeError when an empty string is assigned.
// This is the standard pattern for validation proxies — throw on invalid input
// rather than relying on `return false` (which only throws in strict mode).
// Non-empty strings and numbers pass through and the trap returns `true`.
// See README → Section 3.2: set trap

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: has trap — intercepting the `in` operator

function solution4() {
  const target = { name: "Alice", _secret: 42, age: 30 };

  const handler: ProxyHandler<typeof target> = {
    has(target, prop) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        return false;
      }
      return Reflect.has(target, prop);
    },
  };

  const proxy = new Proxy(target, handler);

  console.log("name" in proxy);    // true
  console.log("_secret" in proxy); // false
  console.log("age" in proxy);     // true
  console.log("missing" in proxy); // false
}

// ANSWER:
// Log 1: true
// Log 2: false
// Log 3: true
// Log 4: false
//
// Explanation:
// The `has` trap intercepts the `in` operator. It hides any property whose
// name starts with "_" by returning false. "name" and "age" are normal
// properties — Reflect.has finds them on the target. "_secret" is hidden
// by the startsWith("_") check. "missing" doesn't exist at all.
// See README → Section 3.3: has trap

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Reflect.get vs direct access — receiver matters for getters

function solution5() {
  const parent = {
    _value: 10,
    get value(): number {
      return this._value;
    },
  };

  const child = Object.create(parent);
  child._value = 20;

  // Proxy on parent with WRONG forwarding (no receiver)
  const wrongProxy = new Proxy(parent, {
    get(target, prop, _receiver) {
      return (target as Record<string | symbol, unknown>)[prop];
    },
  });

  // Proxy on parent with CORRECT forwarding (with receiver)
  const correctProxy = new Proxy(parent, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
  });

  const wrongChild = Object.create(wrongProxy);
  wrongChild._value = 20;

  const correctChild = Object.create(correctProxy);
  correctChild._value = 20;

  console.log(child.value);        // 20
  console.log(wrongChild.value);   // 10
  console.log(correctChild.value); // 20
}

// ANSWER:
// Log 1: 20
// Log 2: 10
// Log 3: 20
//
// Explanation:
// This demonstrates why Reflect.get with the receiver parameter is critical.
//
// Log 1: `child.value` triggers the getter on parent. `this` inside the getter
// is `child` (normal prototype chain behavior), so it returns `child._value` = 20.
//
// Log 2: `wrongChild.value` → the prototype chain goes through wrongProxy →
// triggers the get trap. The trap does `target[prop]` where target is `parent`.
// This triggers the getter with `this = parent` (not wrongChild!), so it
// returns `parent._value` = 10. The receiver (wrongChild) is ignored.
//
// Log 3: `correctChild.value` → triggers the get trap. The trap does
// `Reflect.get(target, prop, receiver)` where receiver is `correctChild`.
// The getter runs with `this = correctChild`, returning `correctChild._value` = 20.
//
// See README → Section 8.1: Correct this / receiver forwarding

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Revocable proxy

function solution6() {
  const target = { x: 1, y: 2 };
  const { proxy, revoke } = Proxy.revocable(target, {});

  console.log(proxy.x);   // 1
  console.log(proxy.y);   // 2

  revoke();

  try {
    console.log(proxy.x);
  } catch (e) {
    console.log("Revoked!"); // "Revoked!"
  }

  console.log(target.x);  // 1
}

// ANSWER:
// Log 1: 1
// Log 2: 2
// Log 3: "Revoked!"
// Log 4: 1
//
// Explanation:
// Proxy.revocable creates a proxy with a revoke function. Before revocation,
// the proxy works normally (pass-through with empty handler). After revoke(),
// ANY operation on the proxy throws a TypeError. But the original target is
// unaffected — it's still a normal object. Revocation only disconnects the
// proxy from the target.
// See README → Section 9: Revocable Proxies

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: set trap must return true/false

function solution7() {
  const handler: ProxyHandler<Record<string, unknown>> = {
    set(target, prop, value, _receiver) {
      if (prop === "age") {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
          throw new TypeError("age must be a non-negative integer");
        }
      }
      target[String(prop)] = value;
      return true; // FIX: added return true
    },
  };

  const person = new Proxy<Record<string, unknown>>({}, handler);

  person.age = 25;
  console.log(person.age); // 25
  person.name = "Alice";
  console.log(person.name); // "Alice"
  try {
    person.age = -5;
  } catch (e) {
    console.log((e as Error).message); // "age must be a non-negative integer"
  }
}

// Explanation:
// The set trap MUST return a boolean. If it returns undefined (no return
// statement), that's falsy, which in strict mode causes a TypeError on every
// assignment — even valid ones. The fix is `return true` after the assignment.
// See README → Section 3.2: set trap

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: ownKeys trap — Object.keys needs getOwnPropertyDescriptor

function solution8() {
  const target = { name: "Alice", _secret: 42, age: 30 };

  const handler: ProxyHandler<typeof target> = {
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        (key) => typeof key !== "string" || !key.startsWith("_")
      );
    },
    // FIX: add getOwnPropertyDescriptor trap to forward descriptors
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  };

  const proxy = new Proxy(target, handler);

  console.log(Object.keys(proxy)); // ["name", "age"]
}

// Explanation:
// Object.keys() internally calls [[OwnPropertyKeys]] (the ownKeys trap) to
// get the list of keys, then for each key calls [[GetOwnProperty]] (the
// getOwnPropertyDescriptor trap) to check if the property is enumerable.
// Without the getOwnPropertyDescriptor trap being properly forwarded,
// Object.keys() may fail or return an empty array. The fix is to add the
// getOwnPropertyDescriptor trap that forwards to Reflect.
// See README → Section 3.5 & 3.6: ownKeys and getOwnPropertyDescriptor

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Proxy with Map — internal slots issue

function solution9() {
  const map = new Map<string, number>();

  const proxy = new Proxy(map, {
    get(target, prop, _receiver) {
      const value = Reflect.get(target, prop);
      // FIX: bind functions to the real target so they can access [[MapData]]
      if (typeof value === "function") {
        return (value as Function).bind(target);
      }
      return value;
    },
  });

  proxy.set("a", 1);
  proxy.set("b", 2);
  console.log(proxy.get("a")); // 1
  console.log(proxy.size);     // 2
}

// Explanation:
// Map, Set, Date, and other built-ins use internal slots (like [[MapData]])
// that are only accessible on the actual object, not through a proxy. When
// map.set is called with `this` being the proxy, it can't find [[MapData]]
// and throws a TypeError. The fix is to bind method functions to the real
// target so `this` inside the method is the actual Map.
// See README → Section 12.1: Internal Slots

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: apply trap — wrong Reflect call

function solution10() {
  function multiply(a: number, b: number): number {
    return a * b;
  }

  const logged = new Proxy(multiply, {
    apply(target, thisArg, argsList) {
      console.log(`multiply called with: ${argsList}`);
      // FIX: use Reflect.apply to properly forward the call
      return Reflect.apply(target, thisArg, argsList);
    },
  });

  console.log(logged(3, 4)); // logs "multiply called with: 3,4", returns 12
}

// Explanation:
// The original code tried `_target(argsList, undefined)` — passing the entire
// array as the first argument and undefined as the second. This gives NaN
// because [3,4] * undefined = NaN. The correct approach is Reflect.apply
// which spreads the argsList properly as individual arguments.
// See README → Section 5: The apply Trap & Section 7: Reflect API

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Validation proxy with type schema

function createTypedProxy<T extends Record<string, unknown>>(
  target: T,
  schema: Partial<Record<keyof T, string>>
): T {
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      const key = prop as keyof T;
      if (key in schema) {
        const expectedType = schema[key];
        if (typeof value !== expectedType) {
          throw new TypeError(
            `${String(prop)} must be ${expectedType}, got ${typeof value}`
          );
        }
      }
      return Reflect.set(target, prop, value, receiver);
    },
  });
}

// Explanation:
// The set trap checks if the property has a schema entry. If so, it compares
// `typeof value` with the expected type string. On mismatch, it throws a
// TypeError. Properties not in the schema pass through freely. We use
// Reflect.set for proper forwarding with the receiver.
// See README → Section 10.1: Validation Proxy

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Default value proxy

function withDefaults<T extends Record<string, unknown>>(
  target: Partial<T>,
  defaults: T
): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (value !== undefined) return value;
      const key = prop as keyof T;
      return key in defaults ? defaults[key] : undefined;
    },
  }) as T;
}

// Explanation:
// The get trap first tries to read from the target. If the value is undefined
// (either missing key or explicitly undefined), it falls back to the defaults
// object. This lets you provide sparse config objects that fill in gaps from
// a complete defaults object.
// See README → Section 10.3: Default Values

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Negative array indexing

function negativeArray<T>(arr: T[]): T[] {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (!Number.isNaN(index) && index < 0) {
        const realIndex = String(target.length + index);
        return Reflect.get(target, realIndex, receiver);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

// Explanation:
// The get trap checks if the property is a negative number. If so, it
// converts it to a positive index by adding the array length. arr[-1]
// becomes arr[arr.length - 1] (the last element). Non-numeric properties
// (like "length", "push", etc.) pass through unchanged via Reflect.get.
// See README → Section 10.6: Negative Array Indexing

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Logging proxy that traces property access and method calls

function createLogger<T extends Record<string, unknown>>(
  target: T
): { proxy: T; logs: string[] } {
  const logs: string[] = [];

  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return new Proxy(value as Function, {
          apply(fn, thisArg, argsList) {
            logs.push(`CALL ${String(prop)}(${argsList.join(",")})`);
            return Reflect.apply(fn, thisArg, argsList);
          },
        });
      }
      logs.push(`GET ${String(prop)}`);
      return value;
    },
    set(target, prop, value, receiver) {
      logs.push(`SET ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    },
  }) as T;

  return { proxy, logs };
}

// Explanation:
// The get trap checks if the accessed value is a function. If so, it returns
// a new Proxy wrapping that function with an apply trap that logs the call.
// For non-function values, it logs a GET entry. The set trap logs SET entries.
// All logs are pushed to a shared array returned alongside the proxy.
// See README → Section 10.4: Logging / Tracing Proxy & Section 5: apply trap

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Private property hiding proxy

function hidePrivate<T extends Record<string, unknown>>(target: T): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        return undefined;
      }
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        return false;
      }
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        (key) => typeof key !== "string" || !key.startsWith("_")
      );
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        return undefined;
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  }) as T;
}

// Explanation:
// Four traps work together to hide _ properties:
// - get: returns undefined for _ properties
// - has: returns false for _ properties (in operator)
// - ownKeys: filters out _ keys from Object.keys() and for...in
// - getOwnPropertyDescriptor: returns undefined for _ properties so
//   Object.keys() doesn't see them after ownKeys returns the filtered list
// Writes are still allowed because the set trap is not intercepted.
// See README → Section 10.5: Private Property Hiding

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: apply trap — memoize wrapper

function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  const cache = new Map<string, TResult>();

  return new Proxy(fn, {
    apply(target, thisArg, argsList) {
      const key = JSON.stringify(argsList);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      const result = Reflect.apply(target, thisArg, argsList) as TResult;
      cache.set(key, result);
      return result;
    },
  });
}

// Explanation:
// The apply trap intercepts every function call. It serializes the arguments
// with JSON.stringify as a cache key. If the key exists in the cache, the
// cached result is returned without calling the original function. Otherwise,
// Reflect.apply forwards the call, and the result is stored in the cache.
// See README → Section 5: The apply Trap & Section 7: Reflect API

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Observable object with Proxy

interface Observable<T> {
  onChange(callback: (prop: string, newValue: unknown, oldValue: unknown) => void): void;
}

function makeObservable<T extends Record<string, unknown>>(
  target: T
): T & Observable<T> {
  const listeners: Array<(prop: string, newValue: unknown, oldValue: unknown) => void> = [];

  return new Proxy(target, {
    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      const result = Reflect.set(target, prop, value, receiver);
      if (result && prop !== "onChange") {
        for (const listener of listeners) {
          listener(String(prop), value, oldValue);
        }
      }
      return result;
    },
    get(target, prop, receiver) {
      if (prop === "onChange") {
        return (callback: (prop: string, newValue: unknown, oldValue: unknown) => void) => {
          listeners.push(callback);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as T & Observable<T>;
}

// Explanation:
// The proxy adds an "onChange" virtual method via the get trap. When accessed,
// it returns a function that pushes the callback to a listeners array. The set
// trap captures the old value before writing, then after a successful write,
// notifies all registered listeners with (prop, newValue, oldValue).
// See README → Section 10.2: Observable Object

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Revocable access with timeout

interface TemporaryAccess<T> {
  proxy: T;
  revoke: () => void;
  isRevoked: () => boolean;
}

function createTemporaryAccess<T extends object>(
  target: T,
  ms: number
): TemporaryAccess<T> {
  let revoked = false;
  const { proxy, revoke: internalRevoke } = Proxy.revocable(target, {});

  const revoke = () => {
    if (!revoked) {
      revoked = true;
      internalRevoke();
    }
  };

  const timer = setTimeout(revoke, ms);
  // Prevent timer from keeping Node alive if manually revoked early
  if (typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }

  return {
    proxy,
    revoke,
    isRevoked: () => revoked,
  };
}

// Explanation:
// Proxy.revocable creates a proxy with a revoke function. We wrap the revoke
// function to also set a `revoked` flag, and schedule a setTimeout to auto-
// revoke after `ms` milliseconds. The isRevoked function checks the flag.
// After revocation, any operation on the proxy throws a TypeError. The
// original target is unaffected.
// See README → Section 9: Revocable Proxies

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Empty handler pass-through ===");
solution1();

console.log("\n=== Exercise 2: get trap with default values ===");
solution2();

console.log("\n=== Exercise 3: set trap returning boolean ===");
solution3();

console.log("\n=== Exercise 4: has trap hiding _ properties ===");
solution4();

console.log("\n=== Exercise 5: Reflect.get receiver forwarding ===");
solution5();

console.log("\n=== Exercise 6: Revocable proxy ===");
solution6();

console.log("\n=== Exercise 7: Fix set trap return value ===");
solution7();

console.log("\n=== Exercise 8: Fix ownKeys + getOwnPropertyDescriptor ===");
solution8();

console.log("\n=== Exercise 9: Fix Proxy with Map ===");
solution9();

console.log("\n=== Exercise 10: Fix apply trap ===");
solution10();

console.log("\n=== Exercise 11: Validation proxy ===");
const typed = createTypedProxy(
  { name: "Alice", age: 30, active: true },
  { name: "string", age: "number", active: "boolean" }
);
typed.name = "Bob";
console.log(typed.name);    // "Bob"
typed.age = 31;
console.log(typed.age);     // 31
try {
  typed.age = "old" as unknown as number;
} catch (e) {
  console.log((e as Error).message); // "age must be number, got string"
}
try {
  typed.active = 0 as unknown as boolean;
} catch (e) {
  console.log((e as Error).message); // "active must be boolean, got number"
}

console.log("\n=== Exercise 12: Default values proxy ===");
const config = withDefaults(
  { host: "localhost" } as Partial<{ host: string; port: number; debug: boolean }>,
  { host: "0.0.0.0", port: 3000, debug: false }
);
console.log(config.host);  // "localhost"
console.log(config.port);  // 3000
console.log(config.debug); // false

console.log("\n=== Exercise 13: Negative array indexing ===");
const nArr = negativeArray([10, 20, 30, 40, 50]);
console.log(nArr[-1]);      // 50
console.log(nArr[-2]);      // 40
console.log(nArr[0]);       // 10
console.log(nArr[2]);       // 30
console.log(nArr.length);   // 5

console.log("\n=== Exercise 14: Logging proxy ===");
const obj14 = { x: 1, y: 2, add(a: number, b: number) { return a + b; } };
const { proxy: p14, logs: logs14 } = createLogger(obj14);
p14.x;
p14.y;
(p14 as Record<string, unknown>).z = 3;
(p14.add as (a: number, b: number) => number)(10, 20);
console.log(logs14);
// ["GET x", "GET y", "SET z = 3", "CALL add(10,20)"]

console.log("\n=== Exercise 15: Private property hiding ===");
const obj15 = hidePrivate({ name: "Alice", _secret: 42, _id: 1, age: 30 });
console.log(obj15.name);          // "Alice"
console.log(obj15._secret);       // undefined
console.log("name" in obj15);     // true
console.log("_secret" in obj15);  // false
console.log(Object.keys(obj15));  // ["name", "age"]
(obj15 as Record<string, unknown>)._newPrivate = "hidden";
console.log(obj15._newPrivate);   // undefined (hidden on read)

console.log("\n=== Exercise 16: Memoize with apply trap ===");
let callCount16 = 0;
function expensiveAdd(a: number, b: number): number {
  callCount16++;
  return a + b;
}
const memoizedAdd = memoize(expensiveAdd);
console.log(memoizedAdd(1, 2)); // 3
console.log(memoizedAdd(1, 2)); // 3 (cached)
console.log(memoizedAdd(3, 4)); // 7
console.log(memoizedAdd(3, 4)); // 7 (cached)
console.log(callCount16);       // 2

console.log("\n=== Exercise 17: Observable object ===");
const obj17 = makeObservable({ x: 1, y: 2 });
const changes17: string[] = [];
obj17.onChange((prop, newVal, oldVal) => {
  changes17.push(`${prop}: ${oldVal} -> ${newVal}`);
});
obj17.x = 10;
obj17.y = 20;
obj17.x = 30;
console.log(changes17);
// ["x: 1 -> 10", "y: 2 -> 20", "x: 10 -> 30"]

console.log("\n=== Exercise 18: Temporary access ===");
const { proxy: temp18, revoke: rev18, isRevoked: check18 } = createTemporaryAccess(
  { secret: 42 },
  100
);
console.log(temp18.secret);  // 42
console.log(check18());      // false
rev18();
console.log(check18());      // true
try {
  console.log(temp18.secret);
} catch {
  console.log("Access revoked!");
}
