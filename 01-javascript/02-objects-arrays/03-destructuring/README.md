# Destructuring

Destructuring assignment is a syntax that lets you **unpack** values from arrays or properties from objects into distinct variables. It mirrors the structure of the data on the left side of the assignment.

---

## 1. Array Destructuring

Array destructuring uses **position** to map values to variables.

### Basic syntax

```js
const [a, b, c] = [1, 2, 3];
console.log(a); // 1
console.log(b); // 2
console.log(c); // 3
```

The right side can be any iterable, not just an array literal:

```js
const [first, second] = "Hi";
console.log(first);  // "H"
console.log(second); // "i"
```

### Skipping elements with commas

Use empty commas to ignore elements you don't need:

```js
const [, , third] = [10, 20, 30];
console.log(third); // 30

const [a, , b] = [1, 2, 3];
console.log(a); // 1
console.log(b); // 3
```

### Rest element (`...rest`)

The rest element collects remaining items into a new array. It must be the **last** element:

```js
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

const [first, ...rest] = "hello";
console.log(first); // "h"
console.log(rest);  // ["e", "l", "l", "o"]
```

---

## 2. Default Values in Array Destructuring

If the array has fewer elements than variables, missing values are `undefined`. You can set defaults:

```js
const [a = 1, b = 2, c = 3] = [10, 20];
console.log(a); // 10  — from array
console.log(b); // 20  — from array
console.log(c); // 3   — default used (array has no 3rd element)
```

Defaults can be expressions or function calls — they are only evaluated when needed (lazily):

```js
function getDefault() {
  console.log("called!");
  return 42;
}

const [x = getDefault()] = [100];
// "called!" is NOT logged — x is 100, default not needed

const [y = getDefault()] = [];
// "called!" IS logged — y is 42
```

---

## 3. Swapping Variables

A classic one-liner — no temporary variable needed:

```js
let a = 1;
let b = 2;

[a, b] = [b, a];

console.log(a); // 2
console.log(b); // 1
```

Works with more than two variables:

```js
let x = 1, y = 2, z = 3;
[x, y, z] = [z, x, y];
console.log(x, y, z); // 3 1 2
```

---

## 4. Object Destructuring

Object destructuring uses **property names** to map values to variables.

### Basic syntax

```js
const user = { name: "Alice", age: 30, city: "NYC" };

const { name, age, city } = user;
console.log(name); // "Alice"
console.log(age);  // 30
console.log(city); // "NYC"
```

Order doesn't matter — matching is by property name, not position.

### Renaming with colon (`{ prop: variable }`)

The colon maps `source: target`. The left side is the property to read; the right side is the variable name:

```js
const { name: userName, age: userAge } = user;
console.log(userName); // "Alice"
console.log(userAge);  // 30
// console.log(name);  // ReferenceError — `name` was NOT declared
```

### Default values

```js
const { name, role = "user" } = { name: "Bob" };
console.log(name); // "Bob"
console.log(role); // "user" — default used
```

### Rename + default combined

```js
const { name: n, role: r = "guest" } = { name: "Eve" };
console.log(n); // "Eve"
console.log(r); // "guest"
```

---

## 5. Nested Destructuring

### Objects within objects

```js
const user = {
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "Springfield",
  },
};

const {
  name,
  address: { street, city },
} = user;

console.log(name);   // "Alice"
console.log(street); // "123 Main St"
console.log(city);   // "Springfield"
// console.log(address); // ReferenceError — `address` is NOT a variable
```

Note: `address:` is the pattern target, not a variable declaration. Only `street` and `city` are declared.

### Arrays within arrays

```js
const matrix = [[1, 2], [3, 4], [5, 6]];
const [[a, b], , [e, f]] = matrix;
console.log(a, b); // 1 2
console.log(e, f); // 5 6
```

### Mixed (objects and arrays)

```js
const data = {
  users: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
};

const {
  users: [, { name: secondUser }],
} = data;

console.log(secondUser); // "Bob"
```

---

## 6. Destructuring in Function Parameters

Destructuring is extremely useful in function signatures to create clean APIs with config objects.

### Object parameter destructuring

```js
function createUser({ name, age, role = "user" }) {
  return { name, age, role };
}

createUser({ name: "Alice", age: 30 });
// { name: "Alice", age: 30, role: "user" }
```

### Default for the whole parameter

To make the config object itself optional:

```js
function setup({ port = 3000, host = "localhost", debug = false } = {}) {
  console.log(port, host, debug);
}

setup();                    // 3000 "localhost" false
setup({ port: 8080 });     // 8080 "localhost" false
```

The `= {}` ensures the function works even when called with no arguments. Without it, calling `setup()` would throw because you can't destructure `undefined`.

### Array parameter destructuring

```js
function head([first, ...rest]) {
  return { first, rest };
}

head([10, 20, 30]); // { first: 10, rest: [20, 30] }
```

---

## 7. Computed Property Names in Destructuring

You can use dynamic (computed) property names with bracket notation:

```js
const key = "name";
const { [key]: value } = { name: "Alice" };
console.log(value); // "Alice"
```

The rename (`: value`) is **required** when using computed property names — you can't use `[key]` alone as a variable name.

```js
const fields = ["name", "age"];
const person = { name: "Bob", age: 25 };

const extracted = {};
for (const field of fields) {
  const { [field]: val } = person;
  extracted[field] = val;
}
// extracted: { name: "Bob", age: 25 }
```

---

## 8. Destructuring from Iterables

Array destructuring works on **any iterable**, not just arrays — because it calls `Symbol.iterator` under the hood.

### Strings

```js
const [a, b, c] = "Hey";
console.log(a, b, c); // "H" "e" "y"
```

### Maps

```js
const map = new Map([
  ["name", "Alice"],
  ["age", 30],
]);

const [[key1, val1], [key2, val2]] = map;
console.log(key1, val1); // "name" "Alice"
console.log(key2, val2); // "age" 30
```

### Sets

```js
const [first, second] = new Set([10, 20, 30]);
console.log(first);  // 10
console.log(second); // 20
```

### Custom iterables

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true, value: undefined };
      },
    };
  },
};

const [a, b, c] = range;
console.log(a, b, c); // 1 2 3
```

---

## 9. The Rest Pattern in Objects

The object rest pattern collects remaining **own enumerable** properties into a new object:

```js
const { a, b, ...rest } = { a: 1, b: 2, c: 3, d: 4 };
console.log(a);    // 1
console.log(b);    // 2
console.log(rest); // { c: 3, d: 4 }
```

This is commonly used to separate known properties from "everything else":

```js
function processRequest({ method, url, ...options }) {
  console.log(method); // "GET"
  console.log(url);    // "/api"
  console.log(options); // { headers: {...}, timeout: 5000 }
}

processRequest({
  method: "GET",
  url: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});
```

**Key difference from array rest:** Object rest creates a **shallow copy** of the remaining properties (like `Object.assign`), and it does **not** copy prototype properties.

---

## 10. Destructuring Gotcha — Parentheses for Object Destructuring

When destructuring into **already-declared** variables without `let`/`const`/`var`, you must wrap the whole expression in parentheses:

```js
let a, b;

// ❌ WRONG — JavaScript parses `{a, b}` as a block statement
// {a, b} = { a: 1, b: 2 }; // SyntaxError

// ✅ CORRECT — parentheses force expression parsing
({ a, b } = { a: 1, b: 2 });
console.log(a); // 1
console.log(b); // 2
```

This happens because `{` at the start of a statement is parsed as a **block**, not an object pattern. Wrapping in `()` makes it an expression statement.

This also applies in contexts like:

```js
let obj = {};
({ a: obj.x, b: obj.y } = { a: 1, b: 2 });
console.log(obj); // { x: 1, y: 2 }
```

---

## 11. Common Gotchas

### Gotcha 1: `undefined` vs `null` for defaults

Default values are only used when the value is **`undefined`** — not `null`, `0`, `""`, or `false`:

```js
const { a = 10 } = { a: undefined }; // a → 10 (default used)
const { b = 10 } = { b: null };      // b → null (default NOT used!)
const { c = 10 } = { c: 0 };         // c → 0 (default NOT used!)
const { d = 10 } = { d: "" };        // d → "" (default NOT used!)
const { e = 10 } = { e: false };     // e → false (default NOT used!)
```

Same behavior for arrays:

```js
const [x = 5] = [null];      // x → null (not 5!)
const [y = 5] = [undefined];  // y → 5
```

### Gotcha 2: Nested destructuring with `undefined` access

If a nested property's parent is `undefined` or `null`, destructuring throws:

```js
const { address: { city } } = { address: undefined };
// TypeError: Cannot destructure property 'city' of undefined

const { config: { debug } } = {};
// TypeError: Cannot destructure property 'debug' of undefined
```

**Fix:** Use default values at the parent level:

```js
const { address: { city } = {} } = { address: undefined };
console.log(city); // undefined (safe!)

const { config: { debug = false } = {} } = {};
console.log(debug); // false
```

### Gotcha 3: Destructuring doesn't coerce primitives (except to object wrappers)

When you destructure a primitive, it's temporarily wrapped in its object wrapper:

```js
const { length } = "hello";
console.log(length); // 5 — String.prototype.length

const { toFixed } = 42;
console.log(typeof toFixed); // "function" — Number.prototype.toFixed
```

But you **cannot** destructure `null` or `undefined` — they have no object wrapper:

```js
const { a } = null;      // TypeError
const { b } = undefined;  // TypeError
```

---

## 12. Best Practices

1. **Prefer `const` with destructuring** — since you're creating new bindings, `const` makes intent clear and prevents reassignment.

2. **Use defaults liberally** — especially in function parameters. They make your API resilient and self-documenting.

3. **Don't over-nest** — deeply nested destructuring is hard to read. If nesting is more than 2 levels deep, consider extracting intermediate variables.

   ```js
   // Hard to read:
   const { a: { b: { c: { d } } } } = obj;

   // Better:
   const { a } = obj;
   const { d } = a.b.c;
   ```

4. **Use rest to exclude properties** — a clean way to omit keys from an object (alternative to `delete`):

   ```js
   const { password, ...safeUser } = user;
   // safeUser has everything except password
   ```

5. **Add defaults for nested destructuring** — always provide `= {}` for optional nested objects to avoid TypeErrors.

6. **Be careful with `null`** — remember that `null` does NOT trigger defaults. Use nullish coalescing (`??`) if you need to handle both `null` and `undefined`.

7. **Use renaming to avoid conflicts** — when property names clash with existing variables or reserved words:

   ```js
   const { class: className, for: htmlFor } = element.attributes;
   ```

8. **Destructure in function parameters** — it's cleaner than accessing `options.x`, `options.y` throughout the function body.

---

## References

- [javascript.info — Destructuring assignment](https://javascript.info/destructuring-assignment)
- [MDN — Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN — Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN — Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
