# Prototypes

Prototypes are JavaScript's mechanism for inheritance. Every object has a hidden internal link to another object — its **prototype** — and property lookups follow this chain until a match is found or the chain ends at `null`.

---

## 1. `[[Prototype]]` — The Hidden Link

Every JavaScript object has an internal slot called `[[Prototype]]`. It is either another object or `null`. When you access a property on an object and it doesn't exist on the object itself, the engine follows `[[Prototype]]` to look for it on the prototype, then the prototype's prototype, and so on.

```js
const animal = { eats: true };
const rabbit = Object.create(animal);

rabbit.eats; // true — found on the prototype (animal)
rabbit.jumps; // undefined — not on rabbit, not on animal, not on Object.prototype
```

`[[Prototype]]` is **not a property** — it's an internal engine slot. You cannot access it directly via bracket or dot notation. The spec provides specific APIs to interact with it (see sections 2 and 4).

---

## 2. Accessing the Prototype

### `__proto__` (deprecated getter/setter)

Historically, `__proto__` was the way to get or set an object's prototype:

```js
const animal = { eats: true };
const rabbit = {};

rabbit.__proto__ = animal;
rabbit.eats; // true
```

`__proto__` is a **getter/setter** defined on `Object.prototype`, not a real property. It was standardized in ES2015 only for web compatibility but is explicitly **deprecated**.

**Problems with `__proto__`:**
- It's a getter/setter inherited from `Object.prototype` — objects created with `Object.create(null)` don't have it.
- Setting `__proto__` to a non-object (except `null`) is silently ignored.
- It can be a security vector (prototype pollution).

### `Object.getPrototypeOf()` / `Object.setPrototypeOf()` (recommended)

```js
const animal = { eats: true };
const rabbit = {};

Object.setPrototypeOf(rabbit, animal);
Object.getPrototypeOf(rabbit) === animal; // true
```

> **Performance warning:** `Object.setPrototypeOf()` is very slow. Engines optimize based on prototype shapes at creation time. Changing the prototype after creation deoptimizes the object. Prefer `Object.create()` to set prototypes at creation time.

---

## 3. Prototype Chain — How Property Lookup Works

When accessing `obj.prop`, the engine performs a **prototype chain walk**:

1. Check `obj` itself for an own property called `prop`.
2. If not found, check `obj.[[Prototype]]` (i.e., the prototype object).
3. Continue up the chain: prototype's prototype, and so on.
4. If the chain reaches `null` (the end), return `undefined`.

```js
const a = { x: 10 };
const b = Object.create(a);       // b.[[Prototype]] = a
const c = Object.create(b);       // c.[[Prototype]] = b

c.x;   // 10 — not on c, not on b, found on a
c.y;   // undefined — not on c, b, a, or Object.prototype
```

### Writing does NOT walk the chain

Property **reads** follow the chain. Property **writes** (assignment) always create/update an **own** property on the target object:

```js
const parent = { color: "red" };
const child = Object.create(parent);

child.color = "blue"; // creates OWN property on child — does NOT modify parent
parent.color;         // "red" — unchanged
child.color;          // "blue" — own property shadows the inherited one
```

**Exception:** If the inherited property is a setter, the setter runs instead of creating an own property.

### The `this` value in inherited methods

When an inherited method is called via `child.method()`, `this` inside the method refers to `child` (the object before the dot), **not** the prototype where the method is defined:

```js
const animal = {
  walk() {
    if (!this.isWalking) {
      this.isWalking = true; // sets on the calling object, not on animal
    }
  },
};

const rabbit = Object.create(animal);
rabbit.walk();

rabbit.isWalking; // true — own property on rabbit
animal.isWalking; // undefined — animal is unchanged
```

---

## 4. `Object.create()` — Creating Objects with a Specific Prototype

`Object.create(proto)` creates a new, empty object with `[[Prototype]]` set to `proto`:

```js
const personProto = {
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

const alice = Object.create(personProto);
alice.name = "Alice";
alice.greet(); // "Hi, I'm Alice"

Object.getPrototypeOf(alice) === personProto; // true
```

### With property descriptors

`Object.create(proto, propertyDescriptors)` also accepts a second argument:

```js
const alice = Object.create(personProto, {
  name: { value: "Alice", writable: true, enumerable: true, configurable: true },
});
```

This is verbose but gives full control over property attributes.

---

## 5. Constructor Function `prototype` Property

Every function in JavaScript has a `prototype` property (a plain object). When the function is used as a constructor with `new`, the created instance's `[[Prototype]]` is set to the constructor's `prototype` property.

```js
function Rabbit(name) {
  this.name = name;
}

Rabbit.prototype.jump = function () {
  return `${this.name} jumps!`;
};

const bunny = new Rabbit("Bunny");

bunny.jump();        // "Bunny jumps!" — found on Rabbit.prototype
bunny.name;          // "Bunny" — own property

Object.getPrototypeOf(bunny) === Rabbit.prototype; // true
```

### What `new F()` does (recap)

1. Create a new empty object.
2. Set its `[[Prototype]]` to `F.prototype`.
3. Call `F` with `this` bound to the new object.
4. Return the new object (unless `F` explicitly returns a different object).

The critical point: **`F.prototype` is just a regular property** on the function. It is not the function's own prototype — it's what gets assigned as `[[Prototype]]` to instances created by `new F()`.

```
F.prototype        → the object assigned to instances' [[Prototype]]
Object.getPrototypeOf(F)  → Function.prototype (F's own prototype, since F is a function)
```

---

## 6. Default `F.prototype = { constructor: F }`

Every function automatically gets a `prototype` property with one built-in property: `constructor`, which points back to the function itself:

```js
function Rabbit() {}

Rabbit.prototype.constructor === Rabbit; // true

const r = new Rabbit();
r.constructor === Rabbit; // true — inherited from Rabbit.prototype
```

### The `constructor` property is fragile

If you replace `F.prototype` entirely, the `constructor` link is lost:

```js
function Rabbit() {}

Rabbit.prototype = {
  jump() { return "jump!"; },
};

const r = new Rabbit();
r.constructor === Rabbit; // false — constructor is now Object
r.constructor === Object; // true — inherited from Object.prototype
```

**Fix:** Manually restore `constructor` when replacing the prototype:

```js
Rabbit.prototype = {
  constructor: Rabbit, // restore the link
  jump() { return "jump!"; },
};
```

### Why `constructor` matters

- `obj.constructor` can be used to create new instances of the same "type": `new obj.constructor(...)`.
- Frameworks and libraries sometimes rely on it for type checking.
- It's not used by the engine itself — purely a convention.

---

## 7. Native Prototypes

Built-in types in JavaScript use the same prototype mechanism:

### `Object.prototype`

The root of almost all prototype chains. Provides methods like `toString()`, `hasOwnProperty()`, `valueOf()`, etc.

```js
const obj = {};
Object.getPrototypeOf(obj) === Object.prototype; // true
obj.toString(); // "[object Object]" — inherited from Object.prototype
```

### `Array.prototype`

All arrays inherit from `Array.prototype`, which provides `push`, `map`, `filter`, `forEach`, etc.:

```js
const arr = [1, 2, 3];
Object.getPrototypeOf(arr) === Array.prototype;              // true
Object.getPrototypeOf(Array.prototype) === Object.prototype; // true

arr.map(x => x * 2); // inherited from Array.prototype
arr.toString();       // inherited from Object.prototype (overridden on Array.prototype)
```

### `Function.prototype`

All functions inherit from `Function.prototype`, which provides `call`, `apply`, `bind`:

```js
function greet() {}
Object.getPrototypeOf(greet) === Function.prototype; // true
greet.call(null); // inherited from Function.prototype
```

### `String.prototype`, `Number.prototype`, `Boolean.prototype`

Primitives are auto-boxed (wrapped in temporary objects) when you access methods on them:

```js
"hello".toUpperCase(); // "HELLO" — String.prototype.toUpperCase
(42).toFixed(2);       // "42.00" — Number.prototype.toFixed
```

### Full native prototype chain

```
[1, 2, 3]  →  Array.prototype  →  Object.prototype  →  null
"hello"    →  String.prototype →  Object.prototype  →  null
42         →  Number.prototype →  Object.prototype  →  null
function() {} → Function.prototype → Object.prototype → null
{ a: 1 }   →  Object.prototype →  null
```

---

## 8. Prototype Methods — Own vs. Inherited

### `Object.keys()` — own enumerable properties only

```js
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

Object.keys(rabbit); // ["jumps"] — only own properties
```

### `for...in` — includes inherited enumerable properties

```js
for (const key in rabbit) {
  console.log(key); // "jumps", then "eats" (inherited)
}
```

### `Object.hasOwn()` / `hasOwnProperty()` — distinguish own from inherited

```js
for (const key in rabbit) {
  if (Object.hasOwn(rabbit, key)) {
    console.log(`Own: ${key}`);      // "Own: jumps"
  } else {
    console.log(`Inherited: ${key}`); // "Inherited: eats"
  }
}
```

### `in` operator — checks own + inherited (including non-enumerable)

```js
"jumps" in rabbit;    // true — own
"eats" in rabbit;     // true — inherited
"toString" in rabbit; // true — inherited from Object.prototype (non-enumerable)
```

### Comparison table

| Method | Own | Inherited | Non-enumerable |
|--------|-----|-----------|----------------|
| `Object.keys()` | Yes | No | No |
| `Object.getOwnPropertyNames()` | Yes | No | Yes |
| `for...in` | Yes | Yes | No |
| `"key" in obj` | Yes | Yes | Yes |
| `Object.hasOwn(obj, key)` | Yes | No | Yes |

---

## 9. "Very Plain" Objects — `Object.create(null)`

Objects created with `Object.create(null)` have **no prototype** at all — their `[[Prototype]]` is `null`:

```js
const dict = Object.create(null);
dict.hello = "world";

dict.toString;        // undefined — no inherited methods
dict.hasOwnProperty;  // undefined
dict.__proto__;       // undefined — no getter/setter
"hello" in dict;      // true — 'in' still works
```

### Why use them?

- **Safe dictionaries:** No risk of key collisions with inherited methods. You can safely use `"toString"`, `"constructor"`, or `"__proto__"` as keys.
- **No prototype pollution:** Cannot be affected by modifications to `Object.prototype`.

```js
// Normal object — "__proto__" triggers the setter:
const normal = {};
normal["__proto__"] = { hacked: true };
normal.hacked;   // undefined — __proto__ setter was triggered, not a real property

// Very plain object — "__proto__" is just a regular key:
const plain = Object.create(null);
plain["__proto__"] = { hacked: true };
plain["__proto__"]; // { hacked: true } — stored as a normal property
```

> `Map` is generally preferred over `Object.create(null)` for dictionary use cases, but very-plain objects are still useful when you need an object specifically (e.g., for JSON serialization or passing to APIs that expect plain objects).

---

## 10. Prototype Chain Diagram (ASCII)

```
                            null
                              ^
                              | [[Prototype]]
                              |
                    +-----------------------+
                    |   Object.prototype    |
                    |-----------------------|
                    | toString()            |
                    | hasOwnProperty()      |
                    | valueOf()             |
                    | constructor: Object   |
                    +-----------------------+
                       ^        ^        ^
                       |        |        |
          +------------+   +----+----+   +-------------+
          |                |         |                  |
+-------------------+ +------------------+ +---------------------+
| Array.prototype   | | Function.prototype| | String.prototype    |
|-------------------| |------------------| |---------------------|
| push(), pop()     | | call(), apply()  | | toUpperCase()       |
| map(), filter()   | | bind()           | | slice(), trim()     |
| forEach()         | | constructor:     | | constructor: String |
| constructor: Array| |   Function       | +---------------------+
+-------------------+ +------------------+          ^
        ^                     ^                     |
        |                     |              (auto-boxing)
        |                     |                     |
  +-----------+      +---------------+         "hello"
  | [1, 2, 3] |      | function f(){}|
  +-----------+      +---------------+


  Constructor Function Pattern:
  ─────────────────────────────

    function Rabbit(name) { this.name = name; }
    Rabbit.prototype.jump = function() { ... };
    const r = new Rabbit("Bun");

         +--------------------+
         | Rabbit (function)  |
         |--------------------|
         | prototype ─────────────┐
         +--------------------+   |
                                  v
                   +------------------------+
                   | Rabbit.prototype       |
                   |------------------------|
                   | constructor: Rabbit    |
                   | jump: function() {...} |
                   +------------------------+
                              ^
                              | [[Prototype]]
                              |
                   +------------------------+
                   | r (instance)           |
                   |------------------------|
                   | name: "Bun"            |
                   +------------------------+
```

---

## 11. Performance — Property Lookup Cost

Property lookup walks the prototype chain. This has performance implications:

### Chain length matters

Every step in the chain is an additional lookup. Deeply nested prototype chains (3+ levels) incur measurable cost for frequently accessed properties:

```js
// Fast — own property:
obj.x; // found immediately

// Slower — inherited 3 levels up:
obj.x; // check obj → check proto1 → check proto2 → found on proto3
```

### Missing properties are worst-case

Accessing a property that doesn't exist anywhere walks the **entire** chain before returning `undefined`. This is the most expensive case.

### Engine optimizations

Modern engines (V8, SpiderMonkey) use **hidden classes** and **inline caches** to optimize repeated prototype lookups. After the first access, subsequent accesses of the same property on objects with the same shape are nearly free. However:

- Changing prototypes at runtime (`Object.setPrototypeOf`) invalidates these caches.
- Very long chains reduce the effectiveness of inline caching.

### Best practices for performance

1. **Keep chains short** — 2-3 levels is typical (instance → Constructor.prototype → Object.prototype).
2. **Don't modify prototypes after creation** — use `Object.create()` at creation time.
3. **Store frequently accessed values locally** if profiling shows prototype lookups as a bottleneck.
4. **Avoid deep `for...in`** — use `Object.keys()` for iteration (only checks own properties).

---

## 12. Common Gotchas

### `__proto__` as a property name

`__proto__` is a getter/setter on `Object.prototype`, not a regular property. Assigning to it on a normal object triggers prototype modification instead of creating a data property:

```js
const obj = {};
obj["__proto__"] = { x: 1 }; // changes obj's prototype, doesn't store a property!
obj.x; // 1

// Fix: use Object.create(null) or Map for arbitrary keys
const safe = Object.create(null);
safe["__proto__"] = { x: 1 }; // stored as a regular property
```

### Modifying native prototypes (monkey-patching)

You can add methods to `Array.prototype`, `String.prototype`, etc. — but **don't**:

```js
// DON'T do this:
Array.prototype.last = function () {
  return this[this.length - 1];
};

[1, 2, 3].last(); // 3 — works, but dangerous
```

**Why it's dangerous:**
- Name collisions with future built-in methods (e.g., `Array.prototype.flat` was a real conflict with MooTools).
- Breaks `for...in` on arrays (the added method is enumerable).
- Multiple libraries doing this can conflict with each other.

**Exception:** Polyfills that faithfully implement a spec-defined method are acceptable.

### Circular prototype chains

The engine prevents circular prototype chains — `Object.setPrototypeOf` throws a `TypeError`:

```js
const a = {};
const b = Object.create(a);

Object.setPrototypeOf(a, b); // TypeError: Cyclic __proto__ value
```

### Replacing `F.prototype` after creating instances

If you replace `F.prototype`, existing instances keep the **old** prototype. New instances get the new one:

```js
function Rabbit() {}
const old = new Rabbit();

Rabbit.prototype = { swim() { return "swim!"; } };
const fresh = new Rabbit();

old.swim;   // undefined — still linked to the original Rabbit.prototype
fresh.swim; // function — linked to the new prototype
```

### `for...in` includes inherited properties

Already covered in Section 8, but worth repeating: always use `Object.keys()` or filter with `Object.hasOwn()` when iterating if you only want own properties.

---

## 13. Best Practices

1. **Use `Object.create()` to set prototypes at creation time** — not `Object.setPrototypeOf()` after the fact.

2. **Use `Object.getPrototypeOf()` instead of `__proto__`** — `__proto__` is deprecated and doesn't work on prototype-less objects.

3. **Keep prototype chains short** — instance → Constructor.prototype → Object.prototype → null is the typical and performant pattern.

4. **Don't modify native prototypes** — except for spec-compliant polyfills.

5. **Use `Object.hasOwn()` over `hasOwnProperty()`** — it's safer (works on prototype-less objects) and clearer.

6. **Prefer `Object.keys()`/`Object.values()` over `for...in`** — avoids accidentally iterating inherited properties.

7. **Use `Object.create(null)` for dictionaries with arbitrary keys** — or better yet, use `Map`.

8. **Restore `constructor` when replacing `F.prototype`** — `F.prototype = { constructor: F, ...methods }`.

9. **Prefer ES6 classes over manual prototype manipulation** — classes are syntactic sugar over prototypes but are cleaner, less error-prone, and the modern standard.

10. **Understand prototypes even if you use classes** — classes compile down to prototypes. Debugging inheritance issues requires understanding the underlying mechanism.

---

## References

- [javascript.info — Prototypal inheritance](https://javascript.info/prototype-inheritance)
- [javascript.info — F.prototype](https://javascript.info/function-prototype)
- [javascript.info — Native prototypes](https://javascript.info/native-prototypes)
- [javascript.info — Prototype methods, objects without __proto__](https://javascript.info/prototype-methods)
- [MDN — Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN — Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [MDN — Object.getPrototypeOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)
