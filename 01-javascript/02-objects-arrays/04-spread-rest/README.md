# Spread & Rest

The spread (`...`) and rest (`...`) operators share the same syntax but serve opposite purposes: **spread** expands elements, **rest** collects them. Understanding the difference depends entirely on context.

---

## 1. Rest Parameters (`...args`)

Rest parameters collect all remaining function arguments into a **real array**.

```js
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);    // 6
sum(10, 20);     // 30
```

### Must be the last parameter

The rest parameter gathers everything that's "left over" after named parameters:

```js
function log(level, ...messages) {
  messages.forEach(msg => console.log(`[${level}]`, msg));
}

log("INFO", "Server started", "Port 3000");
// [INFO] Server started
// [INFO] Port 3000
```

Placing `...rest` anywhere but last is a **SyntaxError**:

```js
function bad(...rest, last) {} // SyntaxError: Rest parameter must be last formal parameter
```

### Rest gives you the `.length` minus named params

```js
function example(a, b, ...rest) {
  console.log(rest.length);
}

example(1, 2, 3, 4, 5); // 3  (rest = [3, 4, 5])
example(1, 2);           // 0  (rest = [])
```

---

## 2. Rest vs `arguments`

Before rest parameters existed, `arguments` was the only way to access all function arguments. They differ significantly:

| Feature | Rest (`...args`) | `arguments` |
|---------|-----------------|-------------|
| Type | Real `Array` | Array-like object |
| Array methods | `.map()`, `.filter()`, etc. | None — must convert first |
| Arrow functions | Works | **Not available** |
| Named params | Collects only the "rest" | Contains **all** arguments |
| Destructuring | Supported | Not supported |

```js
// arguments is array-like, not a real array
function oldWay() {
  console.log(arguments[0]);      // 1
  console.log(arguments.length);  // 3
  // arguments.map(x => x * 2);  // TypeError: arguments.map is not a function
  const arr = Array.from(arguments); // must convert
  console.log(arr.map(x => x * 2)); // [2, 4, 6]
}
oldWay(1, 2, 3);

// Rest gives a real array directly
function newWay(...args) {
  console.log(args.map(x => x * 2)); // [2, 4, 6]
}
newWay(1, 2, 3);
```

### Arrow functions do NOT have `arguments`

```js
const arrow = () => {
  console.log(arguments); // ReferenceError (or captures outer `arguments`)
};

// Use rest parameters instead:
const arrowFixed = (...args) => {
  console.log(args); // works!
};
```

---

## 3. Spread in Arrays

Spread **expands** an iterable into individual elements. In array literals, it inserts elements:

```js
const nums = [1, 2, 3];
const more = [...nums, 4, 5]; // [1, 2, 3, 4, 5]
```

### Combining arrays

```js
const front = [1, 2];
const back = [3, 4];
const combined = [...front, ...back]; // [1, 2, 3, 4]

// Equivalent to: front.concat(back), but more readable and flexible
const withMiddle = [...front, 99, ...back]; // [1, 2, 99, 3, 4]
```

### Converting iterables to arrays

Spread works on any iterable (Set, Map, generator, NodeList, etc.):

```js
const set = new Set([1, 2, 2, 3]);
const unique = [...set]; // [1, 2, 3]

const map = new Map([["a", 1], ["b", 2]]);
const entries = [...map]; // [["a", 1], ["b", 2]]
```

---

## 4. Spread in Objects

Spread in object literals copies own enumerable properties:

```js
const base = { a: 1, b: 2 };
const extended = { ...base, c: 3 }; // { a: 1, b: 2, c: 3 }
```

### Merging objects — later properties overwrite

```js
const defaults = { theme: "light", lang: "en", debug: false };
const userPrefs = { theme: "dark", debug: true };

const config = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "en", debug: true }
// userPrefs overwrites matching keys from defaults
```

Order matters — the **last** spread wins for duplicate keys:

```js
const a = { x: 1, y: 2 };
const b = { y: 3, z: 4 };

console.log({ ...a, ...b }); // { x: 1, y: 3, z: 4 }  — b.y overwrites a.y
console.log({ ...b, ...a }); // { x: 1, y: 2, z: 4 }  — a.y overwrites b.y
```

### Spread does not copy prototype, non-enumerable, or inherited properties

```js
class Dog {
  bark() { return "Woof!"; }
}

const d = new Dog();
d.name = "Rex";

const copy = { ...d };
console.log(copy.name); // "Rex"
console.log(copy.bark); // undefined — prototype method not copied
```

---

## 5. Shallow Copy

Spread creates a **shallow copy** — top-level properties are copied by value for primitives, but nested objects/arrays are copied **by reference**.

```js
const original = {
  name: "Alice",
  scores: [90, 85, 92],
  address: { city: "NYC" },
};

const copy = { ...original };

// Top-level primitive — independent
copy.name = "Bob";
console.log(original.name); // "Alice" — unaffected

// Nested object — SHARED reference!
copy.address.city = "LA";
console.log(original.address.city); // "LA" — both changed!

copy.scores.push(100);
console.log(original.scores); // [90, 85, 92, 100] — both changed!
```

Same applies to arrays:

```js
const matrix = [[1, 2], [3, 4]];
const shallowCopy = [...matrix];

shallowCopy[0].push(99);
console.log(matrix[0]); // [1, 2, 99] — inner array is shared
```

---

## 6. Deep Copy

For true independence of nested structures, use `structuredClone()` (available in all modern environments):

```js
const original = {
  name: "Alice",
  scores: [90, 85, 92],
  address: { city: "NYC" },
};

const deep = structuredClone(original);

deep.address.city = "LA";
console.log(original.address.city); // "NYC" — unaffected!

deep.scores.push(100);
console.log(original.scores); // [90, 85, 92] — unaffected!
```

### `structuredClone` vs spread vs `JSON.parse(JSON.stringify())`

| Method | Deep? | Functions? | `undefined`? | Circular refs? | Performance |
|--------|-------|------------|-------------|---------------|-------------|
| `{...obj}` / `[...arr]` | No (shallow) | Copies refs | Yes | N/A | Fast |
| `JSON.parse(JSON.stringify())` | Yes | **Lost** | **Lost** | **Throws** | Slow |
| `structuredClone()` | Yes | **Throws** | Yes | Yes | Moderate |

> `structuredClone` cannot clone functions, DOM nodes, or `Error` objects. For those cases, use a library like Lodash's `_.cloneDeep()`.

---

## 7. Spread in Function Calls

Spread passes array elements as individual arguments to a function:

```js
const numbers = [3, 1, 4, 1, 5, 9];

Math.max(...numbers);   // 9
Math.min(...numbers);   // 1

// Equivalent to: Math.max(3, 1, 4, 1, 5, 9)
```

### Before spread, we used `.apply()`

```js
// Old way
Math.max.apply(null, numbers); // 9

// New way — much cleaner
Math.max(...numbers); // 9
```

### Multiple spreads in one call

```js
const first = [1, 2];
const second = [3, 4];

console.log(Math.max(...first, ...second, 99)); // 99
```

### Spread with `new`

Spread works with the `new` keyword (`.apply()` doesn't):

```js
const dateParts = [2024, 0, 15]; // Jan 15, 2024
const date = new Date(...dateParts);
```

---

## 8. Spread with Strings

Strings are iterable, so spread splits them into individual characters:

```js
const chars = [..."hello"];
// ["h", "e", "l", "l", "o"]

const word = [..."café"];
// ["c", "a", "f", "é"]  — handles multi-byte characters correctly
```

This works because spread uses the string's `Symbol.iterator`, which iterates over Unicode code points (not UTF-16 code units like `str.split("")`).

```js
// Emoji handling:
const emoji = [..."👋🌍"];
// ["👋", "🌍"]  — spread handles surrogate pairs correctly

"👋🌍".split(""); // ["�", "�", "�", "�"] — broken!
```

### Practical uses

```js
// Count unique characters
const unique = [...new Set("mississippi")]; // ["m", "i", "s", "p"]

// Reverse a string (handles Unicode)
const reversed = [..."hello"].reverse().join(""); // "olleh"
```

---

## 9. Object Rest in Destructuring

Rest can collect remaining properties during object destructuring:

```js
const user = { name: "Alice", age: 30, role: "admin", active: true };

const { name, ...rest } = user;
// name = "Alice"
// rest = { age: 30, role: "admin", active: true }
```

### Useful for omitting properties

```js
// Remove `password` from user object
const fullUser = { id: 1, name: "Alice", password: "secret123" };
const { password, ...safeUser } = fullUser;
// safeUser = { id: 1, name: "Alice" }
```

### Array rest in destructuring

```js
const [first, second, ...remaining] = [1, 2, 3, 4, 5];
// first = 1, second = 2, remaining = [3, 4, 5]
```

### Nested destructuring with rest

```js
const data = { a: 1, b: { c: 2, d: 3, e: 4 } };
const { a, b: { c, ...bRest } } = data;
// a = 1, c = 2, bRest = { d: 3, e: 4 }
```

---

## 10. Common Gotchas

### Gotcha 1: Shallow copy trap

The most common mistake — assuming spread makes a deep copy:

```js
const config = {
  server: { port: 3000, host: "localhost" },
};

const newConfig = { ...config };
newConfig.server.port = 8080;
console.log(config.server.port); // 8080 — original changed!
```

**Fix:** Use `structuredClone()` for nested data, or spread at every level:

```js
const newConfig = {
  ...config,
  server: { ...config.server, port: 8080 },
};
```

### Gotcha 2: Spread order matters for overwriting

```js
// WRONG — defaults overwrite user values
const config = { ...userPrefs, ...defaults };

// RIGHT — user values overwrite defaults
const config = { ...defaults, ...userPrefs };
```

### Gotcha 3: Spreading non-iterables in arrays

Spread in arrays requires an iterable. Non-iterables throw:

```js
const num = 42;
// [...num];  // TypeError: num is not iterable

// Objects are not iterable:
const obj = { a: 1 };
// [...obj];  // TypeError: obj is not iterable

// But objects CAN be spread in object literals:
const copy = { ...obj }; // { a: 1 } — works!
```

### Gotcha 4: Spreading `null` and `undefined`

```js
// In object spread — silently ignored
const a = { ...null, ...undefined, x: 1 };
// { x: 1 }  — no error

// In array spread — throws
// [...null];      // TypeError: null is not iterable
// [...undefined]; // TypeError: undefined is not iterable
```

### Gotcha 5: Rest must be last in destructuring

```js
// const { ...rest, name } = obj;  // SyntaxError
const { name, ...rest } = obj;     // correct
```

### Gotcha 6: Spread only copies own enumerable properties

```js
const proto = { inherited: true };
const obj = Object.create(proto);
obj.own = true;

const copy = { ...obj };
console.log(copy.own);       // true
console.log(copy.inherited); // undefined — prototype not copied
```

---

## 11. Best Practices

1. **Prefer rest parameters over `arguments`** — rest gives a real array, works in arrow functions, and is more explicit about intent.

2. **Use spread for immutable updates** — especially in React/Redux state:
   ```js
   const newState = { ...state, count: state.count + 1 };
   const newItems = [...items, newItem];
   ```

3. **Remember: spread is shallow** — always use `structuredClone()` for nested data that must be independent.

4. **Spread order = override order** — put defaults first, overrides last:
   ```js
   const config = { ...defaults, ...userPrefs };
   ```

5. **Use rest destructuring to omit properties** — cleaner than `delete`:
   ```js
   const { unwanted, ...clean } = obj;
   ```

6. **Prefer spread over `Object.assign()`** — spread is more readable and doesn't mutate:
   ```js
   // Object.assign mutates the first argument
   Object.assign(target, source); // target is mutated

   // Spread always creates a new object
   const result = { ...target, ...source }; // target is untouched
   ```

7. **Use spread for converting iterables** — cleaner than `Array.from()` for simple cases:
   ```js
   [...set]        // Set → Array
   [...map.keys()] // Map keys → Array
   [..."string"]   // String → char Array
   ```

8. **Use `Array.from()` when you need a mapping function** — it's more efficient than spread + map:
   ```js
   Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]
   ```

---

## References

- [javascript.info — Rest parameters and spread syntax](https://javascript.info/rest-parameters-spread)
- [MDN — Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN — Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [MDN — Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN — structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
