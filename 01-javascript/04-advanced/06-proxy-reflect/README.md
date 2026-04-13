# Proxy & Reflect

Proxy and Reflect are ES6 metaprogramming features that let you intercept and customize fundamental object operations. A Proxy wraps a target object and lets you define custom behavior for operations like property access, assignment, enumeration, and function invocation. Reflect provides a clean API that mirrors every Proxy trap, enabling proper forwarding of intercepted operations.

---

## 1. The Proxy Concept

A Proxy creates a wrapper around an object (the **target**) that intercepts operations through a **handler** object containing **traps** — methods that correspond to fundamental object operations:

```js
const target = { name: "Alice", age: 30 };

const handler = {
  get(target, property, receiver) {
    console.log(`Reading ${String(property)}`);
    return Reflect.get(target, property, receiver);
  },
};

const proxy = new Proxy(target, handler);
proxy.name; // logs "Reading name", returns "Alice"
```

When you interact with the proxy, the engine calls the corresponding trap if defined. If the trap is not defined, the operation is forwarded directly to the target — the proxy becomes transparent.

**Key mental model:** A proxy is not a copy of the target. It is a separate object that delegates to the target. The proxy and target are different objects with different identities.

---

## 2. `new Proxy(target, handler)`

```js
const proxy = new Proxy(target, handler);
```

- **target** — any object (including arrays, functions, other proxies). This is the object being wrapped.
- **handler** — a plain object whose properties are **traps**. Each trap is a function that intercepts a specific operation.

An empty handler creates a transparent pass-through proxy:

```js
const target = { x: 1 };
const proxy = new Proxy(target, {});

proxy.x;     // 1 — forwarded directly to target
proxy.x = 2; // sets target.x to 2
target.x;    // 2
```

The proxy forwards all operations to target unchanged because no traps are defined.

---

## 3. Common Traps

### 3.1 `get(target, property, receiver)`

Intercepts property reads, including `proxy[prop]`, `proxy.prop`, and `Reflect.get()`:

```js
const handler = {
  get(target, prop, receiver) {
    if (prop in target) {
      return target[prop];
    }
    return `Property "${String(prop)}" not found`;
  },
};

const proxy = new Proxy({ a: 1 }, handler);
proxy.a;    // 1
proxy.b;    // 'Property "b" not found'
```

- `property` is a string or Symbol.
- `receiver` is the object that was originally accessed (usually the proxy itself, but matters for inherited properties).

### 3.2 `set(target, property, value, receiver)`

Intercepts property writes. **Must return a boolean** — `true` if the assignment succeeded, `false` to indicate failure (throws `TypeError` in strict mode):

```js
const handler = {
  set(target, prop, value, receiver) {
    if (typeof value !== "number") {
      throw new TypeError(`${String(prop)} must be a number`);
    }
    return Reflect.set(target, prop, value, receiver);
  },
};

const proxy = new Proxy({}, handler);
proxy.age = 25;     // OK
proxy.age = "old";  // TypeError: age must be a number
```

### 3.3 `has(target, property)`

Intercepts the `in` operator:

```js
const handler = {
  has(target, prop) {
    if (String(prop).startsWith("_")) {
      return false; // hide "private" properties
    }
    return prop in target;
  },
};

const proxy = new Proxy({ _secret: 42, name: "Alice" }, handler);
"_secret" in proxy; // false (hidden)
"name" in proxy;    // true
```

### 3.4 `deleteProperty(target, property)`

Intercepts the `delete` operator. Must return a boolean:

```js
const handler = {
  deleteProperty(target, prop) {
    if (String(prop).startsWith("_")) {
      throw new Error(`Cannot delete private property "${String(prop)}"`);
    }
    return Reflect.deleteProperty(target, prop);
  },
};

const proxy = new Proxy({ _id: 1, name: "Alice" }, handler);
delete proxy.name;  // true — deleted
delete proxy._id;   // Error: Cannot delete private property "_id"
```

### 3.5 `ownKeys(target)`

Intercepts `Object.keys()`, `Object.getOwnPropertyNames()`, `Object.getOwnPropertySymbols()`, and `for...in`:

```js
const handler = {
  ownKeys(target) {
    return Object.keys(target).filter((key) => !key.startsWith("_"));
  },
};

const proxy = new Proxy({ name: "Alice", _secret: 42, age: 30 }, handler);
Object.keys(proxy); // ["name", "age"] — _secret is hidden
```

### 3.6 `getOwnPropertyDescriptor(target, property)`

Intercepts `Object.getOwnPropertyDescriptor()`. This trap is often needed alongside `ownKeys` because `Object.keys()` calls `getOwnPropertyDescriptor` for each key returned by `ownKeys` to check if the property is enumerable:

```js
const handler = {
  ownKeys(target) {
    return Object.keys(target).filter((key) => !key.startsWith("_"));
  },
  getOwnPropertyDescriptor(target, prop) {
    return Object.getOwnPropertyDescriptor(target, prop);
  },
};
```

Without the `getOwnPropertyDescriptor` trap, `Object.keys()` may not work correctly with a custom `ownKeys` trap.

---

## 4. Trap Invariants

Proxy traps must follow certain **invariants** — rules enforced by the engine to maintain consistency. Violating them throws a `TypeError`:

| Trap | Invariant |
|------|-----------|
| `get` | Cannot report a value different from the target's own non-writable, non-configurable property |
| `set` | Cannot successfully set a non-writable, non-configurable property to a different value |
| `has` | Cannot report a non-configurable own property as non-existent |
| `has` | Cannot report an own property as non-existent if the target is not extensible |
| `deleteProperty` | Cannot report a non-configurable own property as deleted |
| `ownKeys` | Must include all non-configurable own keys of the target |
| `getOwnPropertyDescriptor` | Must return an object (not undefined) for non-configurable own properties |

```js
const target = {};
Object.defineProperty(target, "locked", {
  value: 42,
  writable: false,
  configurable: false,
});

const proxy = new Proxy(target, {
  get(target, prop) {
    if (prop === "locked") return 99; // try to lie about the value
    return Reflect.get(target, prop);
  },
});

proxy.locked; // TypeError! Cannot report different value for non-configurable property
```

Invariants ensure that proxy cannot completely break the language's guarantees about object behavior.

---

## 5. The `apply` Trap — Proxying Function Calls

When the target is a function, the `apply` trap intercepts function calls and `Function.prototype.apply`/`call`:

```js
function sum(a, b) {
  return a + b;
}

const proxy = new Proxy(sum, {
  apply(target, thisArg, argsList) {
    console.log(`Called with args: ${argsList}`);
    return Reflect.apply(target, thisArg, argsList);
  },
});

proxy(1, 2);          // logs "Called with args: 1,2", returns 3
proxy.call(null, 3, 4); // logs "Called with args: 3,4", returns 7
```

### Practical use: timing decorator

```js
function delay(fn, ms) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(Reflect.apply(target, thisArg, args)), ms);
      });
    },
  });
}

const delayedSum = delay(sum, 1000);
await delayedSum(1, 2); // resolves to 3 after 1 second
```

---

## 6. The `construct` Trap — Proxying `new`

Intercepts the `new` operator. The target must be a constructor:

```js
class User {
  constructor(name) {
    this.name = name;
  }
}

const TrackedUser = new Proxy(User, {
  construct(target, args, newTarget) {
    console.log(`Creating instance with args: ${args}`);
    const instance = Reflect.construct(target, args, newTarget);
    instance.createdAt = new Date();
    return instance;
  },
});

const user = new TrackedUser("Alice");
// logs "Creating instance with args: Alice"
user.name;      // "Alice"
user.createdAt; // Date object
```

- `target` — the constructor being proxied.
- `args` — the array of arguments passed to `new`.
- `newTarget` — the constructor that `new` was originally called on (important for subclassing).

The `construct` trap **must return an object** (not a primitive).

---

## 7. The Reflect API

`Reflect` is a built-in object that provides methods mirroring every Proxy trap. It is **not** a constructor (you cannot `new Reflect()`).

| Proxy Trap | Reflect Method |
|------------|---------------|
| `get` | `Reflect.get(target, prop, receiver)` |
| `set` | `Reflect.set(target, prop, value, receiver)` |
| `has` | `Reflect.has(target, prop)` |
| `deleteProperty` | `Reflect.deleteProperty(target, prop)` |
| `ownKeys` | `Reflect.ownKeys(target)` |
| `getOwnPropertyDescriptor` | `Reflect.getOwnPropertyDescriptor(target, prop)` |
| `defineProperty` | `Reflect.defineProperty(target, prop, descriptor)` |
| `getPrototypeOf` | `Reflect.getPrototypeOf(target)` |
| `setPrototypeOf` | `Reflect.setPrototypeOf(target, proto)` |
| `isExtensible` | `Reflect.isExtensible(target)` |
| `preventExtensions` | `Reflect.preventExtensions(target)` |
| `apply` | `Reflect.apply(target, thisArg, args)` |
| `construct` | `Reflect.construct(target, args, newTarget)` |

### Using Reflect for default forwarding

The simplest trap implementation is forwarding with Reflect:

```js
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // custom logic here...
    return Reflect.get(target, prop, receiver); // proper forwarding
  },

  set(target, prop, value, receiver) {
    // custom logic here...
    return Reflect.set(target, prop, value, receiver); // returns boolean
  },
});
```

Each Reflect method has exactly the same signature as its corresponding Proxy trap, making forwarding trivial.

---

## 8. Why Use Reflect

### 8.1 Correct `this` / receiver forwarding

Consider an object with getters and inheritance:

```js
const parent = {
  _name: "parent",
  get name() {
    return this._name; // `this` should be the receiver
  },
};

const child = Object.create(parent);
child._name = "child";
```

If you write a proxy trap using `target[prop]` instead of `Reflect.get(target, prop, receiver)`:

```js
// WRONG — loses receiver context
const proxy = new Proxy(parent, {
  get(target, prop, receiver) {
    return target[prop]; // `this` in getter will be `target`, not `receiver`
  },
});

const childProxy = Object.create(proxy);
childProxy._name = "child";
childProxy.name; // "parent" — WRONG! Should be "child"
```

```js
// CORRECT — passes receiver
const proxy = new Proxy(parent, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver); // getter's `this` = receiver
  },
});

const childProxy = Object.create(proxy);
childProxy._name = "child";
childProxy.name; // "child" — correct!
```

### 8.2 Boolean return values

`Reflect.set()` and `Reflect.deleteProperty()` return booleans indicating success, which is exactly what the `set` and `deleteProperty` traps must return:

```js
const handler = {
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver); // returns true/false
  },
};
```

Without Reflect, you'd need `target[prop] = value; return true;` — and you lose the ability to detect when assignment silently fails (e.g., non-writable property in non-strict mode).

### 8.3 Cleaner alternative to Object methods

Several `Object.*` methods have Reflect equivalents with better behavior:

```js
// Object.defineProperty throws on failure:
try {
  Object.defineProperty(obj, "x", { value: 1 });
} catch (e) { /* handle */ }

// Reflect.defineProperty returns boolean:
if (!Reflect.defineProperty(obj, "x", { value: 1 })) {
  // handle failure
}
```

---

## 9. Revocable Proxies

`Proxy.revocable()` creates a proxy that can be "turned off" later:

```js
const target = { name: "Alice" };
const { proxy, revoke } = Proxy.revocable(target, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },
});

proxy.name;  // "Alice" — works normally
revoke();    // disable the proxy
proxy.name;  // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

### Use cases

- **Temporary access:** Grant an API consumer access to an object, then revoke it when their session ends.
- **Security:** Ensure no references to sensitive data remain after cleanup.
- **Resource management:** Revoke access when the underlying resource is released.

```js
function createTemporaryAccess(data, timeoutMs) {
  const { proxy, revoke } = Proxy.revocable(data, {});
  setTimeout(revoke, timeoutMs); // auto-revoke after timeout
  return proxy;
}

const temp = createTemporaryAccess({ secret: 42 }, 5000);
temp.secret; // 42
// After 5 seconds: temp.secret → TypeError
```

Once revoked, the proxy is permanently disconnected from the target. There is no way to "un-revoke" it.

---

## 10. Practical Patterns

### 10.1 Validation Proxy

Enforce type constraints on property assignment:

```js
function createValidated(target, schema) {
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      if (prop in schema) {
        const expectedType = schema[prop];
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

const user = createValidated(
  { name: "Alice", age: 30 },
  { name: "string", age: "number" }
);

user.name = "Bob";    // OK
user.age = "thirty";  // TypeError: age must be number, got string
```

### 10.2 Observable Object

Notify listeners when properties change:

```js
function makeObservable(target) {
  const listeners = new Map();

  const proxy = new Proxy(target, {
    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      const result = Reflect.set(target, prop, value, receiver);
      if (result && oldValue !== value) {
        const handlers = listeners.get(prop);
        if (handlers) {
          handlers.forEach((fn) => fn(value, oldValue, prop));
        }
      }
      return result;
    },
  });

  proxy.observe = function (prop, handler) {
    if (!listeners.has(prop)) listeners.set(prop, []);
    listeners.get(prop).push(handler);
  };

  return proxy;
}

const obj = makeObservable({ x: 1, y: 2 });
obj.observe("x", (newVal, oldVal) => {
  console.log(`x changed from ${oldVal} to ${newVal}`);
});
obj.x = 10; // logs "x changed from 1 to 10"
```

### 10.3 Default Values

Return defaults for missing properties instead of `undefined`:

```js
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (value !== undefined) return value;
      return prop in defaults ? defaults[prop] : undefined;
    },
  });
}

const config = withDefaults(
  { host: "localhost" },
  { host: "0.0.0.0", port: 3000, debug: false }
);

config.host;  // "localhost" (from target)
config.port;  // 3000 (from defaults)
config.debug; // false (from defaults)
config.other; // undefined
```

### 10.4 Logging / Tracing Proxy

Log all property accesses and method calls:

```js
function createLogger(target, label) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return new Proxy(value, {
          apply(fn, thisArg, args) {
            console.log(`[${label}] ${String(prop)}(${args.join(", ")})`);
            return Reflect.apply(fn, thisArg, args);
          },
        });
      }
      console.log(`[${label}] get ${String(prop)} → ${value}`);
      return value;
    },
    set(target, prop, value, receiver) {
      console.log(`[${label}] set ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    },
  });
}
```

### 10.5 Private Property Hiding

Filter underscore-prefixed properties from enumeration:

```js
const handler = {
  has(target, prop) {
    if (typeof prop === "string" && prop.startsWith("_")) return false;
    return Reflect.has(target, prop);
  },
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(
      (key) => typeof key !== "string" || !key.startsWith("_")
    );
  },
  get(target, prop, receiver) {
    if (typeof prop === "string" && prop.startsWith("_")) return undefined;
    return Reflect.get(target, prop, receiver);
  },
};

const obj = new Proxy({ name: "Alice", _secret: 42 }, handler);
Object.keys(obj);     // ["name"]
"_secret" in obj;     // false
obj._secret;          // undefined
```

### 10.6 Negative Array Indexing

Support Python-style negative indices:

```js
function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (!Number.isNaN(index) && index < 0) {
        return Reflect.get(target, String(target.length + index), receiver);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

const arr = negativeArray([10, 20, 30, 40, 50]);
arr[-1]; // 50
arr[-2]; // 40
arr[0];  // 10
```

---

## 11. Performance Considerations

Proxy operations have overhead compared to direct property access:

- **Each intercepted operation** goes through an extra function call (the trap).
- Proxies are **not transparently optimizable** by V8's hidden classes / inline caches — property access on proxies is slower.
- Wrapping every object in a proxy in a hot loop is a performance anti-pattern.

### When NOT to use proxies

- **Hot paths** — inner loops that run millions of times per second.
- **Simple validation** — if a setter or constructor check suffices, use that.
- **When a class with getters/setters works** — proxies are for dynamic/unknown property names.

### When proxies shine

- **Dynamic property interception** — when you don't know which properties will be accessed.
- **Framework/library internals** — Vue 3 reactivity, MobX observables, ORMs.
- **Development tools** — logging, debugging, access control.

As a rule: **use proxies for metaprogramming, not for general application logic**.

---

## 12. Proxy Limitations

### 12.1 Internal Slots

Some built-in objects use **internal slots** (like `[[MapData]]`, `[[SetData]]`, `[[DateValue]]`) that are accessed directly on the object, bypassing the proxy:

```js
const map = new Map();
const proxy = new Proxy(map, {});
proxy.set("key", "value"); // TypeError: Method Map.prototype.set called on incompatible receiver
```

The `Map.prototype.set` method accesses `this.[[MapData]]`, which exists on the original `map` object but not on the proxy. The fix is to bind methods to the target:

```js
const map = new Map();
const proxy = new Proxy(map, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function") {
      return value.bind(target); // bind to the real Map
    }
    return value;
  },
});

proxy.set("key", "value"); // works
proxy.get("key");          // "value"
```

The same issue affects `Set`, `Date`, `Promise`, and any object with internal slots.

### 12.2 Private Fields (`#`)

Private class fields also use internal slots. A proxy cannot access private fields of its target:

```js
class User {
  #name;
  constructor(name) {
    this.#name = name;
  }
  getName() {
    return this.#name;
  }
}

const user = new User("Alice");
const proxy = new Proxy(user, {});
proxy.getName(); // TypeError: Cannot read private member #name from an object
                 // whose class did not declare it
```

The fix is the same — bind methods to the target:

```js
const proxy = new Proxy(user, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function") {
      return value.bind(target);
    }
    return value;
  },
});

proxy.getName(); // "Alice"
```

### 12.3 Identity Issues

A proxy is a different object from its target:

```js
const target = {};
const proxy = new Proxy(target, {});

target === proxy;        // false
Set.prototype.has.call(new Set([target]), proxy); // false
```

This can cause issues with:
- WeakMap/WeakSet lookups (proxy and target are different keys).
- `===` identity checks.
- Internal algorithms that compare object identity.

### 12.4 No Way to Detect a Proxy

There is no standard API to check if an object is a Proxy. `typeof proxy` returns the same as `typeof target`. `proxy instanceof Proxy` does not work. This is by design — proxies are meant to be transparent.

---

## References

- [javascript.info — Proxy and Reflect](https://javascript.info/proxy)
- [MDN — Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN — Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [MDN — Proxy handler traps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy)
- [MDN — Meta programming](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Meta_programming)
