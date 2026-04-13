# Objects

Objects are the fundamental building block for complex data in JavaScript. They store keyed collections of values and provide the backbone for nearly every non-primitive structure in the language.

---

## 1. Object Creation

### Object literal `{}`

The most common and preferred way to create objects:

```js
const user = {
  name: "Alice",
  age: 30,
};
```

### `new Object()`

Constructor syntax — functionally identical to `{}` but more verbose:

```js
const user = new Object();
user.name = "Alice";
user.age = 30;
```

### `Object.create(proto)`

Creates an object with a specified prototype. Useful for inheritance patterns:

```js
const personProto = {
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

const alice = Object.create(personProto);
alice.name = "Alice";
alice.greet(); // "Hi, I'm Alice"

// Create an object with NO prototype (truly empty):
const bare = Object.create(null); // no toString, hasOwnProperty, etc.
```

> **Best practice:** Use `{}` for everyday objects. Reserve `Object.create()` for when you need explicit prototype control.

---

## 2. Properties — Access and Assignment

### Dot notation

```js
const user = { name: "Alice", age: 30 };

user.name;        // "Alice" — reading
user.age = 31;    // writing
user.email = "a@b.com"; // adding new property
```

Dot notation requires a **valid identifier** as the key — no spaces, no starting with a digit, no reserved punctuation.

### Bracket notation

```js
user["name"];           // "Alice"
user["full name"] = "Alice Smith"; // keys with spaces

const key = "age";
user[key];              // 30 — dynamic key access
```

Bracket notation accepts **any string or Symbol** and allows computed/dynamic keys.

### Computed property names (ES2015)

Use brackets inside an object literal to compute a key at creation time:

```js
const field = "color";
const obj = {
  [field]: "blue",               // { color: "blue" }
  [`${field}Code`]: "#0000FF",   // { colorCode: "#0000FF" }
};
```

---

## 3. Property Shorthand

When a variable name matches the desired key, use shorthand:

```js
const name = "Alice";
const age = 30;

// Longhand:
const user = { name: name, age: age };

// Shorthand (ES2015):
const user2 = { name, age };
// { name: "Alice", age: 30 }
```

This is extremely common in function return values and module exports.

---

## 4. Property Existence Checks

### The `in` operator

Checks if a property exists in the object **or its prototype chain**:

```js
const user = { name: "Alice", age: undefined };

"name" in user;  // true
"age" in user;   // true  — property exists even though value is undefined
"email" in user; // false
```

### `hasOwnProperty()`

Checks only **own** properties (not inherited):

```js
const obj = Object.create({ inherited: true });
obj.own = true;

obj.hasOwnProperty("own");       // true
obj.hasOwnProperty("inherited"); // false
"inherited" in obj;              // true — in checks prototype chain
```

> **Safer alternative:** `Object.hasOwn(obj, "key")` (ES2022) — works even if `hasOwnProperty` has been overridden or the object was created with `Object.create(null)`.

### Optional chaining `?.` (ES2020)

Safely access deeply nested properties without checking each level:

```js
const user = {
  address: {
    street: "123 Main St",
  },
};

user.address?.street;       // "123 Main St"
user.address?.zip;          // undefined (not an error)
user.contact?.email;        // undefined (contact doesn't exist)
user.contact?.email?.length; // undefined (short-circuits)

// Also works with methods and bracket notation:
user.greet?.();             // undefined if greet doesn't exist (no error)
user.address?.["zip"];      // undefined
```

**Key rules:**
- `?.` short-circuits: if the left side is `null` or `undefined`, evaluation stops and returns `undefined`.
- Use `?.` for reading/calling, never on the left side of assignment.
- Don't overuse it — only use where a value legitimately might not exist.

### Comparing existence checks

| Technique | Checks prototype? | Handles `undefined` values? | Safe on `null` objects? |
|-----------|-------------------|----------------------------|------------------------|
| `"key" in obj` | Yes | Yes | No |
| `obj.hasOwnProperty("key")` | No | Yes | No |
| `Object.hasOwn(obj, "key")` | No | Yes | Yes |
| `obj.key !== undefined` | Yes | **No** (false negative) | No |
| `obj?.key` | Yes | Partial (returns `undefined`) | Yes |

---

## 5. Deleting Properties

The `delete` operator removes a property from an object:

```js
const user = { name: "Alice", age: 30 };

delete user.age;
console.log(user); // { name: "Alice" }

// Returns true on success (or if property didn't exist):
delete user.nonexistent; // true

// Cannot delete non-configurable properties:
delete Object.prototype; // false (strict mode: TypeError)
```

> `delete` only removes **own** properties. It does not affect prototype chain properties.

---

## 6. Property Order

Object property iteration order follows specific rules (since ES2015):

1. **Integer-like keys** (e.g., `"1"`, `"2"`, `"49"`) — sorted **numerically** in ascending order.
2. **String keys** (non-integer) — in **insertion order**.
3. **Symbol keys** — in **insertion order** (after all string keys).

```js
const obj = {
  b: 2,
  1: "one",
  a: 1,
  2: "two",
};

Object.keys(obj); // ["1", "2", "b", "a"]
// Integer keys 1, 2 come first (sorted), then "b", "a" in insertion order
```

> **Trick:** To preserve insertion order for numeric-looking keys, prefix with a non-digit character (e.g., `"+49"` instead of `"49"`).

---

## 7. Object Methods

A **method** is a function stored as an object property:

```js
const user = {
  name: "Alice",

  // Method (function expression):
  sayHi: function () {
    return `Hi, I'm ${this.name}`;
  },

  // Method shorthand (ES2015 — preferred):
  sayBye() {
    return `Bye from ${this.name}`;
  },
};

user.sayHi();  // "Hi, I'm Alice"
user.sayBye(); // "Bye from Alice"
```

Method shorthand is cleaner and is the standard convention in modern JavaScript.

---

## 8. `this` in Methods (Brief)

When a method is called as `obj.method()`, `this` refers to `obj`:

```js
const user = {
  name: "Alice",
  greet() {
    return `Hi, I'm ${this.name}`; // this === user
  },
};

user.greet(); // "Hi, I'm Alice"
```

**Critical:** `this` is determined at **call time**, not definition time:

```js
const greet = user.greet;
greet(); // "Hi, I'm undefined" — `this` is now globalThis (or undefined in strict mode)

const other = { name: "Bob", greet: user.greet };
other.greet(); // "Hi, I'm Bob" — `this` is `other`
```

> **Arrow functions** do not have their own `this` — they inherit `this` from the enclosing lexical scope.

> **Deep dive:** `this`, `call`, `bind`, `apply`, and arrow function behavior are covered in **Chapter 04-03: this keyword**.

---

## 9. Object References and Copying

### Objects are stored and copied by reference

A variable holding an object stores a **reference** (pointer) to it, not the object itself:

```js
const a = { name: "Alice" };
const b = a;       // b points to the SAME object

b.name = "Bob";
console.log(a.name); // "Bob" — a and b reference the same object

console.log(a === b); // true — same reference
```

Primitives are copied by value; objects are copied by reference. This is the single most important distinction.

### Shallow copy — `Object.assign()` and spread

```js
const original = { name: "Alice", scores: [90, 85] };

// Object.assign:
const copy1 = Object.assign({}, original);

// Spread operator (preferred):
const copy2 = { ...original };

copy2.name = "Bob";
console.log(original.name); // "Alice" — primitive was copied

copy2.scores.push(100);
console.log(original.scores); // [90, 85, 100] — nested array is SHARED!
```

**Shallow copy** only copies the top-level properties. Nested objects/arrays still share the same reference.

### Deep copy — `structuredClone()` (ES2022)

```js
const original = {
  name: "Alice",
  address: { city: "NYC" },
  scores: [90, 85],
};

const deep = structuredClone(original);

deep.address.city = "LA";
console.log(original.address.city); // "NYC" — fully independent

deep.scores.push(100);
console.log(original.scores); // [90, 85] — fully independent
```

**`structuredClone` limitations:**
- Cannot clone functions, DOM nodes, or `Error` objects.
- Cannot clone objects with prototype chains (result has `Object.prototype`).
- Handles circular references correctly.

### Comparison of copy methods

| Method | Depth | Handles circular refs? | Clones functions? |
|--------|-------|----------------------|-------------------|
| `=` (assignment) | Reference only | N/A | N/A |
| `{ ...obj }` / `Object.assign` | Shallow (1 level) | No | Copies reference |
| `structuredClone()` | Deep | Yes | No |
| `JSON.parse(JSON.stringify())` | Deep | No (throws) | No (drops them) |

---

## 10. `Object.keys()`, `Object.values()`, `Object.entries()`

These static methods return arrays of an object's **own enumerable string-keyed** properties:

```js
const user = { name: "Alice", age: 30, role: "admin" };

Object.keys(user);    // ["name", "age", "role"]
Object.values(user);  // ["Alice", 30, "admin"]
Object.entries(user);  // [["name", "Alice"], ["age", 30], ["role", "admin"]]
```

### Common patterns

```js
// Iterate key-value pairs:
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}

// Transform values:
const doubled = Object.fromEntries(
  Object.entries({ a: 1, b: 2 }).map(([k, v]) => [k, v * 2])
);
// { a: 2, b: 4 }

// Count properties:
Object.keys(user).length; // 3
```

> `for...in` also iterates properties but includes **inherited enumerable** properties. Prefer `Object.keys()` to avoid surprises.

---

## 11. `Object.freeze()` / `Object.seal()`

### `Object.freeze(obj)`

Makes an object **fully immutable** (shallow):
- Cannot add, remove, or modify properties.
- All properties become non-writable and non-configurable.

```js
const config = Object.freeze({ host: "localhost", port: 3000 });

config.port = 8080;     // silently fails (strict mode: TypeError)
config.debug = true;    // silently fails
delete config.host;     // silently fails

Object.isFrozen(config); // true
```

### `Object.seal(obj)`

Prevents adding/removing properties, but allows **modifying existing** values:

```js
const user = Object.seal({ name: "Alice", age: 30 });

user.age = 31;          // OK — modifying existing property
user.email = "a@b.com"; // silently fails — can't add
delete user.name;       // silently fails — can't remove

Object.isSealed(user); // true
```

### Comparison

| Capability | Normal object | `Object.seal()` | `Object.freeze()` |
|-----------|--------------|-----------------|-------------------|
| Read properties | Yes | Yes | Yes |
| Modify existing | Yes | Yes | **No** |
| Add new | Yes | **No** | **No** |
| Delete | Yes | **No** | **No** |
| Reconfigure | Yes | **No** | **No** |

> Both are **shallow** — nested objects are not affected. To deep-freeze, you'd need to recursively freeze each nested object.

---

## 12. Constructor Functions and `new`

Constructor functions are the pre-class pattern for creating multiple objects with shared structure:

```js
function User(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function () {
    return `Hi, I'm ${this.name}`;
  };
}

const alice = new User("Alice", 30);
const bob = new User("Bob", 25);
```

### Naming convention

Constructor functions start with a **capital letter** — this is a universal convention signaling "call me with `new`".

### What `new` does (4 steps)

When you call `new User("Alice", 30)`:

1. **Create** — A new empty object is created: `{}`.
2. **Link** — The object's `[[Prototype]]` is set to `User.prototype`.
3. **Bind** — The constructor runs with `this` bound to the new object.
4. **Return** — If the constructor doesn't explicitly return an object, the new object is returned.

```js
// Conceptual equivalent of `new User("Alice", 30)`:
const obj = {};                          // Step 1
Object.setPrototypeOf(obj, User.prototype); // Step 2
const result = User.call(obj, "Alice", 30); // Step 3
// If result is an object, return result; otherwise return obj  // Step 4
```

### Return value override

If a constructor explicitly returns an **object**, that object replaces the default `this`:

```js
function Strange() {
  this.a = 1;
  return { b: 2 }; // overrides the default return
}

new Strange(); // { b: 2 } — `a` is lost
```

Returning a **primitive** is ignored — `this` is returned as normal.

---

## 13. Property Descriptors (Brief)

Every property has hidden attributes beyond its value:

```js
const user = { name: "Alice" };

Object.getOwnPropertyDescriptor(user, "name");
// {
//   value: "Alice",
//   writable: true,       — can the value be changed?
//   enumerable: true,     — does it show in for...in / Object.keys?
//   configurable: true    — can the descriptor be changed / property deleted?
// }
```

### `Object.defineProperty()`

Define or modify a property with fine-grained control:

```js
Object.defineProperty(user, "id", {
  value: 1,
  writable: false,      // read-only
  enumerable: false,    // hidden from Object.keys, for...in
  configurable: false,  // cannot be deleted or reconfigured
});

user.id = 2;           // silently fails (strict mode: TypeError)
Object.keys(user);     // ["name"] — "id" is not enumerable
delete user.id;        // false — not configurable
```

### `Object.defineProperties()`

Define multiple properties at once:

```js
Object.defineProperties(user, {
  email: { value: "a@b.com", writable: true, enumerable: true, configurable: true },
  role:  { value: "admin", writable: false, enumerable: true, configurable: false },
});
```

> Properties created via `Object.defineProperty` default to `false` for writable, enumerable, and configurable. Properties created via assignment or literal default to `true` for all three.

---

## 14. Common Gotchas

### Reference vs. value

```js
const a = { x: 1 };
const b = { x: 1 };
console.log(a === b); // false — different references, despite identical contents

const c = a;
console.log(a === c); // true — same reference
```

There's no built-in deep equality check. To compare by value, you need a library or manual recursive comparison.

### Property order surprises

```js
const obj = {};
obj["2"] = "two";
obj["1"] = "one";
obj["b"] = "bee";
obj["a"] = "ay";

Object.keys(obj); // ["1", "2", "b", "a"] — not insertion order for numeric keys!
```

### `typeof null`

```js
typeof null; // "object" — a legacy bug, null is NOT an object
```

Always check for `null` explicitly before treating a value as an object.

### `for...in` includes inherited properties

```js
const parent = { inherited: true };
const child = Object.create(parent);
child.own = true;

for (const key in child) {
  console.log(key); // "own", then "inherited"
}

// Fix: use Object.keys() or filter with hasOwnProperty
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key); // only "own"
  }
}
```

### Mutating shared references

```js
function addRole(user) {
  user.role = "admin"; // mutates the original object!
  return user;
}

const alice = { name: "Alice" };
addRole(alice);
console.log(alice.role); // "admin" — was mutated
```

---

## 15. Best Practices

1. **Use object literals `{}`** — cleaner and faster than `new Object()`.

2. **Use `const` for object bindings** — you can still modify properties; `const` prevents reassigning the variable.

3. **Use shorthand syntax** — property shorthand and method shorthand improve readability.

4. **Use optional chaining `?.`** — for accessing potentially missing nested properties. Don't overuse it on values that should always exist.

5. **Use `Object.hasOwn()` over `hasOwnProperty()`** — safer and works with `Object.create(null)`.

6. **Prefer `Object.keys/values/entries` over `for...in`** — avoids inherited property surprises.

7. **Be explicit about copy depth** — use spread for shallow copies, `structuredClone` for deep copies. Document your intent.

8. **Freeze configuration objects** — use `Object.freeze()` for objects that should never change.

9. **Don't rely on property order for logic** — even though order is well-defined in the spec, code that depends on iteration order is fragile.

10. **Avoid mutating arguments** — if a function receives an object, clone it if you need to modify it. This prevents unexpected side effects.

---

## References

- [javascript.info — Objects](https://javascript.info/object)
- [javascript.info — Object references and copying](https://javascript.info/object-copy)
- [javascript.info — Object methods, "this"](https://javascript.info/object-methods)
- [javascript.info — Optional chaining](https://javascript.info/optional-chaining)
- [javascript.info — Constructor, operator "new"](https://javascript.info/constructor-new)
- [MDN — Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN — Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
- [MDN — Property descriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
