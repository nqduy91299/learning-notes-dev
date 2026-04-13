// ============================================================================
// 06-proxy-reflect: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/04-advanced/06-proxy-reflect/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Basic proxy — empty handler is a transparent pass-through
//
// What does each console.log print?

function exercise1() {
  const target = { a: 1, b: 2 };
  const proxy = new Proxy(target, {});

  proxy.c = 3;

  console.log(proxy.a);
  console.log(proxy.c);
  console.log(target.c);
  console.log(proxy === target);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: get trap — intercepting property reads
//
// What does each console.log print?

function exercise2() {
  const handler: ProxyHandler<Record<string, number>> = {
    get(target, prop, _receiver) {
      const key = String(prop);
      return Object.hasOwn(target, key) ? target[key] : -1;
    },
  };

  const scores = new Proxy<Record<string, number>>({ alice: 90, bob: 85 }, handler);

  console.log(scores.alice);
  console.log(scores.bob);
  console.log(scores.charlie);
  console.log(scores.toString);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: set trap — must return boolean
//
// What does each console.log print? Does anything throw?

function exercise3() {
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
  console.log(obj.name);

  obj.count = 42;
  console.log(obj.count);

  try {
    obj.empty = "";
  } catch (e) {
    console.log((e as Error).message);
  }
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: has trap — intercepting the `in` operator
//
// What does each console.log print?

function exercise4() {
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

  console.log("name" in proxy);
  console.log("_secret" in proxy);
  console.log("age" in proxy);
  console.log("missing" in proxy);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Reflect.get vs direct access — receiver matters for getters
//
// What does each console.log print?

function exercise5() {
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

  console.log(child.value);
  console.log(wrongChild.value);
  console.log(correctChild.value);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Revocable proxy
//
// What does each console.log print?

function exercise6() {
  const target = { x: 1, y: 2 };
  const { proxy, revoke } = Proxy.revocable(target, {});

  console.log(proxy.x);
  console.log(proxy.y);

  revoke();

  try {
    console.log(proxy.x);
  } catch (e) {
    console.log("Revoked!");
  }

  console.log(target.x);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: set trap must return true/false
//
// This proxy validates that "age" must be a positive integer. But the set
// trap forgets to return a value for valid assignments. Fix it.

function exercise7() {
  const handler: ProxyHandler<Record<string, unknown>> = {
    set(target, prop, value, _receiver) {
      if (prop === "age") {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
          throw new TypeError("age must be a non-negative integer");
        }
      }
      target[String(prop)] = value;
      // BUG: missing return value
    },
  };

  const _person = new Proxy<Record<string, unknown>>({}, handler);

  // Uncomment to test:
  // _person.age = 25;
  // console.log(_person.age); // Expected: 25
  // _person.name = "Alice";
  // console.log(_person.name); // Expected: "Alice"
  // try {
  //   _person.age = -5;
  // } catch (e) {
  //   console.log((e as Error).message); // Expected: "age must be a non-negative integer"
  // }
}

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: ownKeys trap — Object.keys needs getOwnPropertyDescriptor
//
// This proxy hides underscore-prefixed keys. `ownKeys` is defined but
// `Object.keys()` still returns nothing because `getOwnPropertyDescriptor`
// is missing. Fix it.

function exercise8() {
  const target = { name: "Alice", _secret: 42, age: 30 };

  const handler: ProxyHandler<typeof target> = {
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(
        (key) => typeof key !== "string" || !key.startsWith("_")
      );
    },
    // BUG: Missing getOwnPropertyDescriptor trap
    // Object.keys() calls getOwnPropertyDescriptor for each key from ownKeys
    // to check enumerability. Without forwarding it, keys appear non-existent.
  };

  const _proxy = new Proxy(target, handler);

  // Uncomment to test:
  // console.log(Object.keys(_proxy)); // Expected: ["name", "age"]
}

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Proxy with Map — internal slots issue
//
// This proxy wraps a Map but calling .set() throws a TypeError because
// Map methods require `this` to be the actual Map. Fix the get trap.

function exercise9() {
  const map = new Map<string, number>();

  const proxy = new Proxy(map, {
    get(target, prop, _receiver) {
      // BUG: returned function's `this` won't be the real Map
      return Reflect.get(target, prop);
    },
  });

  // Uncomment to test:
  // proxy.set("a", 1);
  // proxy.set("b", 2);
  // console.log(proxy.get("a")); // Expected: 1
  // console.log(proxy.size);     // Expected: 2
}

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: apply trap — wrong Reflect call
//
// This proxy wraps a function to log calls but uses the wrong Reflect method.
// Fix the apply trap so it correctly forwards the call.

function exercise10() {
  function multiply(a: number, b: number): number {
    return a * b;
  }

  const _logged = new Proxy(multiply, {
    apply(_target, _thisArg, argsList) {
      console.log(`multiply called with: ${argsList}`);
      // BUG: should use Reflect.apply, not call target directly with wrong args
      return _target(argsList as unknown as number, undefined as unknown as number);
    },
  });

  // Uncomment to test:
  // console.log(_logged(3, 4)); // Expected log: "multiply called with: 3,4"
  //                             // Expected return: 12
}

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Validation proxy with type schema
//
// Create a function `createTypedProxy` that takes an object and a schema
// mapping property names to expected `typeof` strings. The proxy should:
//   - Throw TypeError on set if the value doesn't match the schema type
//   - Allow properties not in the schema to be set freely
//   - Forward get/set properly using Reflect

function createTypedProxy<T extends Record<string, unknown>>(
  _target: T,
  _schema: Partial<Record<keyof T, string>>
): T {
  // YOUR CODE HERE
  return _target; // placeholder
}

// Uncomment to test:
// const typed = createTypedProxy(
//   { name: "Alice", age: 30, active: true },
//   { name: "string", age: "number", active: "boolean" }
// );
// typed.name = "Bob";     // OK
// console.log(typed.name); // "Bob"
// typed.age = 31;          // OK
// console.log(typed.age);  // 31
// try {
//   typed.age = "old" as unknown as number;
// } catch (e) {
//   console.log((e as Error).message); // "age must be number, got string"
// }
// try {
//   typed.active = 0 as unknown as boolean;
// } catch (e) {
//   console.log((e as Error).message); // "active must be boolean, got number"
// }

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Default value proxy
//
// Create a function `withDefaults` that returns a proxy. When a property
// is accessed and the target has `undefined` for that key (or the key is
// missing), return the corresponding value from the defaults object.

function withDefaults<T extends Record<string, unknown>>(
  _target: Partial<T>,
  _defaults: T
): T {
  // YOUR CODE HERE
  return _target as T; // placeholder
}

// Uncomment to test:
// const config = withDefaults(
//   { host: "localhost" } as Partial<{ host: string; port: number; debug: boolean }>,
//   { host: "0.0.0.0", port: 3000, debug: false }
// );
// console.log(config.host);  // "localhost" (from target)
// console.log(config.port);  // 3000 (from defaults)
// console.log(config.debug); // false (from defaults)

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Negative array indexing
//
// Create a function `negativeArray` that wraps an array in a proxy
// supporting negative indices. arr[-1] returns the last element, etc.

function negativeArray<T>(_arr: T[]): T[] {
  // YOUR CODE HERE
  return _arr; // placeholder
}

// Uncomment to test:
// const nArr = negativeArray([10, 20, 30, 40, 50]);
// console.log(nArr[-1]); // 50
// console.log(nArr[-2]); // 40
// console.log(nArr[0]);  // 10
// console.log(nArr[2]);  // 30
// console.log(nArr.length); // 5

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Logging proxy that traces property access and method calls
//
// Create a function `createLogger` that wraps an object. It should:
//   - Log "GET <prop>" on property reads (non-function values)
//   - Log "CALL <prop>(<args>)" on method calls
//   - Log "SET <prop> = <value>" on property writes
//   - Use an array `logs` to collect log strings (don't console.log)
//   - Return { proxy, logs }

function createLogger<T extends Record<string, unknown>>(
  _target: T
): { proxy: T; logs: string[] } {
  // YOUR CODE HERE
  return { proxy: _target, logs: [] }; // placeholder
}

// Uncomment to test:
// const obj14 = { x: 1, y: 2, add(a: number, b: number) { return a + b; } };
// const { proxy: p14, logs: logs14 } = createLogger(obj14);
// p14.x;
// p14.y;
// (p14 as Record<string, unknown>).z = 3;
// (p14.add as (a: number, b: number) => number)(10, 20);
// console.log(logs14);
// // Expected: ["GET x", "GET y", "SET z = 3", "CALL add(10,20)"]

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Private property hiding proxy
//
// Create a function `hidePrivate` that returns a proxy which:
//   - Hides properties starting with "_" from: `in` operator, Object.keys,
//     property access (returns undefined), and iteration
//   - Does NOT prevent setting _ properties (allow writes)

function hidePrivate<T extends Record<string, unknown>>(_target: T): T {
  // YOUR CODE HERE
  return _target; // placeholder
}

// Uncomment to test:
// const obj15 = hidePrivate({ name: "Alice", _secret: 42, _id: 1, age: 30 });
// console.log(obj15.name);          // "Alice"
// console.log(obj15._secret);       // undefined
// console.log("name" in obj15);     // true
// console.log("_secret" in obj15);  // false
// console.log(Object.keys(obj15));  // ["name", "age"]
// (obj15 as Record<string, unknown>)._newPrivate = "hidden";
// console.log(obj15._newPrivate);   // undefined (still hidden on read)

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: apply trap — memoize wrapper
//
// Create a function `memoize` that wraps a function with a Proxy using
// the apply trap. It should cache results based on JSON.stringify of args.

function memoize<TArgs extends unknown[], TResult>(
  _fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  // YOUR CODE HERE
  return _fn; // placeholder
}

// Uncomment to test:
// let callCount = 0;
// function expensiveAdd(a: number, b: number): number {
//   callCount++;
//   return a + b;
// }
// const memoizedAdd = memoize(expensiveAdd);
// console.log(memoizedAdd(1, 2)); // 3
// console.log(memoizedAdd(1, 2)); // 3 (cached)
// console.log(memoizedAdd(3, 4)); // 7
// console.log(memoizedAdd(3, 4)); // 7 (cached)
// console.log(callCount);         // 2 (only 2 actual calls)

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Observable object with Proxy
//
// Create `makeObservable` that returns a proxy with an `onChange` method.
// `onChange(callback)` registers a callback called whenever any property
// is set. The callback receives (prop, newValue, oldValue).

interface Observable<T> {
  onChange(callback: (prop: string, newValue: unknown, oldValue: unknown) => void): void;
}

function makeObservable<T extends Record<string, unknown>>(
  _target: T
): T & Observable<T> {
  // YOUR CODE HERE
  return _target as T & Observable<T>; // placeholder
}

// Uncomment to test:
// const obj17 = makeObservable({ x: 1, y: 2 });
// const changes17: string[] = [];
// obj17.onChange((prop, newVal, oldVal) => {
//   changes17.push(`${prop}: ${oldVal} -> ${newVal}`);
// });
// obj17.x = 10;
// obj17.y = 20;
// obj17.x = 30;
// console.log(changes17);
// // Expected: ["x: 1 -> 10", "y: 2 -> 20", "x: 10 -> 30"]

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Revocable access with timeout
//
// Create `createTemporaryAccess` that returns a proxy to the given object.
// The proxy auto-revokes after `ms` milliseconds. Also return a manual
// `revoke` function and an `isRevoked` function.

interface TemporaryAccess<T> {
  proxy: T;
  revoke: () => void;
  isRevoked: () => boolean;
}

function createTemporaryAccess<T extends object>(
  _target: T,
  _ms: number
): TemporaryAccess<T> {
  // YOUR CODE HERE
  return {
    proxy: _target,
    revoke: () => {},
    isRevoked: () => false,
  }; // placeholder
}

// Uncomment to test:
// const { proxy: temp18, revoke: rev18, isRevoked: check18 } = createTemporaryAccess(
//   { secret: 42 },
//   100
// );
// console.log(temp18.secret);  // 42
// console.log(check18());      // false
// rev18();
// console.log(check18());      // true
// try {
//   console.log(temp18.secret);
// } catch {
//   console.log("Access revoked!");
// }
// // Expected output:
// // 42
// // false
// // true
// // "Access revoked!"
