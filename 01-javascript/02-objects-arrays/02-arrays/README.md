# Arrays in JavaScript

Arrays are ordered collections of values — the most-used data structure in JavaScript for storing and working with lists of data. Unlike many languages, JavaScript arrays are **not** fixed-size or single-type; they can hold mixed types and grow dynamically.

---

## 1. Creating Arrays

### Array literal `[]` (preferred)

```js
const fruits = ["apple", "banana", "cherry"];
const mixed = [1, "two", true, null, { x: 1 }];
const empty = [];
```

### `new Array()`

```js
const a = new Array("apple", "banana"); // ["apple", "banana"]
const b = new Array(3);                 // [ , , ] — 3 empty slots (sparse!)
const c = new Array(3, 4);              // [3, 4]
```

> **Gotcha:** `new Array(3)` creates a sparse array with 3 **empty slots**, not `[3]`. This single-number-argument trap is why the literal `[]` is preferred.

### `Array.from()` — create from iterables / array-likes

```js
Array.from("hello");          // ["h", "e", "l", "l", "o"]
Array.from({ length: 3 });    // [undefined, undefined, undefined]
Array.from({ length: 5 }, (_, i) => i * 2); // [0, 2, 4, 6, 8]

// Convert NodeList, Set, Map to array
Array.from(new Set([1, 2, 2, 3])); // [1, 2, 3]
```

The optional second argument is a **map function** applied to each element during creation.

### `Array.of()` — create from arguments (no single-number trap)

```js
Array.of(3);       // [3]     — unlike new Array(3)
Array.of(1, 2, 3); // [1, 2, 3]
```

---

## 2. Accessing Elements

### Bracket notation (index)

Arrays are zero-indexed:

```js
const arr = ["a", "b", "c", "d"];
arr[0];    // "a"
arr[2];    // "c"
arr[10];   // undefined (no error — out of bounds)
arr[-1];   // undefined (negative indices don't work like Python)
```

### `at()` — supports negative indices (ES2022)

```js
const arr = ["a", "b", "c", "d"];
arr.at(0);   // "a"
arr.at(-1);  // "d" — last element
arr.at(-2);  // "c" — second to last
```

### `length`

`length` is always **one greater** than the highest index. It's a writable property:

```js
const arr = [1, 2, 3, 4, 5];
arr.length;     // 5

arr.length = 3; // Truncates! arr is now [1, 2, 3]
arr.length = 5; // Extends with empty slots: [1, 2, 3, <2 empty items>]
arr.length = 0; // Clears the array completely
```

---

## 3. Modifying Arrays

### End operations — `push()` / `pop()`

```js
const arr = [1, 2, 3];

arr.push(4);       // returns 4 (new length); arr = [1, 2, 3, 4]
arr.push(5, 6);    // push multiple; arr = [1, 2, 3, 4, 5, 6]

arr.pop();         // returns 6 (removed element); arr = [1, 2, 3, 4, 5]
```

### Beginning operations — `unshift()` / `shift()`

```js
const arr = [1, 2, 3];

arr.unshift(0);     // returns 4 (new length); arr = [0, 1, 2, 3]
arr.unshift(-2, -1);// arr = [-2, -1, 0, 1, 2, 3]

arr.shift();        // returns -2 (removed element); arr = [-1, 0, 1, 2, 3]
```

### `splice()` — the Swiss army knife

`splice(start, deleteCount, ...items)` modifies the array in place and returns the removed elements:

```js
const arr = ["a", "b", "c", "d", "e"];

// Delete 2 elements starting at index 1
arr.splice(1, 2);           // returns ["b", "c"]; arr = ["a", "d", "e"]

// Insert without deleting (deleteCount = 0)
arr.splice(1, 0, "x", "y");// returns []; arr = ["a", "x", "y", "d", "e"]

// Replace: delete 1, insert 1
arr.splice(2, 1, "Z");     // returns ["y"]; arr = ["a", "x", "Z", "d", "e"]

// Negative index: count from end
arr.splice(-1, 1);         // returns ["e"]; arr = ["a", "x", "Z", "d"]
```

> **Note:** `splice` **mutates** the original array. For a non-mutating version, use `toSpliced()` (ES2023).

---

## 4. Finding Elements

### `indexOf()` / `lastIndexOf()` — find index of a value

```js
const arr = [1, 2, 3, 2, 1];

arr.indexOf(2);      // 1 (first occurrence)
arr.lastIndexOf(2);  // 3 (last occurrence)
arr.indexOf(99);     // -1 (not found)

// Optional second argument: start searching from index
arr.indexOf(2, 2);   // 3 (search from index 2)
```

Uses **strict equality** (`===`). Cannot find `NaN`:

```js
[NaN].indexOf(NaN);  // -1 (NaN !== NaN)
```

### `includes()` — boolean check (ES2016)

```js
[1, 2, 3].includes(2);   // true
[1, 2, 3].includes(99);  // false

// Unlike indexOf, includes CAN find NaN
[NaN].includes(NaN);     // true
```

### `find()` — first element matching a condition

```js
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

users.find(u => u.id === 2);  // { id: 2, name: "Bob" }
users.find(u => u.id === 99); // undefined
```

### `findIndex()` — index of first match

```js
users.findIndex(u => u.name === "Charlie"); // 2
users.findIndex(u => u.name === "Dave");    // -1
```

> **Deep dive:** `filter()`, `map()`, `reduce()`, and other higher-order array methods are covered in **02-05 Array Methods**.

---

## 5. Checking — `Array.isArray()`

`typeof` doesn't help with arrays (it returns `"object"`). Use `Array.isArray()`:

```js
Array.isArray([1, 2, 3]);   // true
Array.isArray("hello");     // false
Array.isArray({ length: 3 });// false

typeof [1, 2, 3];  // "object" — not useful!
```

---

## 6. Iterating

### `for` loop (classic)

```js
const arr = ["a", "b", "c"];
for (let i = 0; i < arr.length; i++) {
  console.log(i, arr[i]);
}
```

Best when you need the index or need to iterate in non-standard ways (reverse, skip, etc.).

### `for...of` (ES6)

```js
for (const item of arr) {
  console.log(item);
}
```

Clean, readable, and works with `break` / `continue`:

```js
for (const item of arr) {
  if (item === "b") break; // early exit
  console.log(item);       // only logs "a"
}
```

If you need the index with `for...of`, use `entries()`:

```js
for (const [index, value] of arr.entries()) {
  console.log(index, value);
}
```

### `forEach()`

```js
arr.forEach((item, index) => {
  console.log(index, item);
});
```

**Why `forEach` can't break:** `forEach` calls the callback for every element unconditionally. There is no way to stop early — `return` inside the callback only exits that single iteration (like `continue`, not `break`). Throwing an exception works but is an anti-pattern. If you need early exit, use `for...of` or a plain `for` loop instead.

```js
// This does NOT stop the loop:
[1, 2, 3, 4].forEach(n => {
  if (n === 3) return;  // skips 3, but continues to 4
  console.log(n);        // logs 1, 2, 4
});
```

### `for...in` — avoid for arrays

`for...in` iterates over **all enumerable properties**, including prototype properties and non-integer keys. It's designed for objects, not arrays:

```js
const arr = [10, 20, 30];
arr.extra = "oops";

for (const key in arr) {
  console.log(key); // "0", "1", "2", "extra" — includes non-index keys!
}
// Keys are strings, not numbers. Iteration order isn't guaranteed in all edge cases.
```

---

## 7. Multidimensional Arrays

JavaScript doesn't have true multidimensional arrays — you nest arrays inside arrays:

```js
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

matrix[0];      // [1, 2, 3] — first row
matrix[0][1];   // 2         — row 0, col 1
matrix[2][2];   // 9         — row 2, col 2
```

### Iterating nested arrays

```js
for (const row of matrix) {
  for (const cell of row) {
    process(cell);
  }
}
```

### Creating dynamically

```js
// 3x4 matrix filled with zeros
const rows = 3, cols = 4;
const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
```

> **Warning:** `Array(3).fill([])` creates 3 references to the **same** array. Use `Array.from()` with a callback to create independent inner arrays.

---

## 8. Array Destructuring (Brief)

Extract values from arrays into variables:

```js
const [first, second, third] = [10, 20, 30];
// first = 10, second = 20, third = 30

// Skip elements
const [a, , c] = [1, 2, 3]; // a = 1, c = 3

// Rest pattern
const [head, ...tail] = [1, 2, 3, 4];
// head = 1, tail = [2, 3, 4]

// Default values
const [x = 0, y = 0] = [42];
// x = 42, y = 0

// Swap variables
let p = 1, q = 2;
[p, q] = [q, p]; // p = 2, q = 1
```

> **Full coverage:** Destructuring patterns are covered in detail in **02-03 Destructuring**.

---

## 9. Strings and Arrays

### `split()` — string to array

```js
"hello world".split(" ");     // ["hello", "world"]
"a,b,c".split(",");           // ["a", "b", "c"]
"hello".split("");             // ["h", "e", "l", "l", "o"]
"one::two::three".split("::"); // ["one", "two", "three"]

// Limit results
"a,b,c,d".split(",", 2);      // ["a", "b"]
```

### `join()` — array to string

```js
["hello", "world"].join(" ");  // "hello world"
["a", "b", "c"].join(",");    // "a,b,c"
["a", "b", "c"].join("");     // "abc"
[1, 2, 3].join(" - ");        // "1 - 2 - 3"
[1, 2, 3].join();             // "1,2,3" (default separator is comma)
```

### `Array.from()` for strings

Handles Unicode correctly (unlike `split("")`):

```js
"hello".split("");        // ["h", "e", "l", "l", "o"]
Array.from("hello");      // ["h", "e", "l", "l", "o"]

// For emoji and multi-byte characters, Array.from is safer:
"😀🎉".split("");         // ["😀", "🎉"] — may break in older engines
Array.from("😀🎉");       // ["😀", "🎉"] — always works (iterates code points)
```

### `split` + `join` pattern — simple string transforms

```js
// Capitalize each word
"hello world".split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
// "Hello World"

// Replace all occurrences (pre-replaceAll)
"a-b-c".split("-").join("_"); // "a_b_c"
```

---

## 10. Internal Representation

Arrays in JavaScript are **objects** with integer string keys and a special `length` property:

```js
const arr = ["a", "b", "c"];

// Internally, this is similar to:
// { "0": "a", "1": "b", "2": "c", length: 3 }

typeof arr;           // "object"
Object.keys(arr);     // ["0", "1", "2"]
```

### `length` is auto-updated

`length` is always **one more than the highest numeric index**:

```js
const arr = [];
arr[100] = "x";
arr.length;   // 101 (not 1!)
```

### Arrays are optimized by engines

Although arrays are technically objects, modern engines optimize them heavily when used correctly — storing elements contiguously in memory (like real arrays). This optimization breaks if you:

- Add non-numeric properties (`arr.foo = "bar"`)
- Create holes / sparse arrays (`arr[0] = 1; arr[1000] = 2`)
- Store mixed types in the same array
- Use `delete` on elements (creates holes)

---

## 11. Performance

### `push()` / `pop()` — O(1)

Adding/removing at the **end** is fast because no other elements need to move:

```js
arr.push(x);  // O(1) — append to end
arr.pop();    // O(1) — remove from end
```

### `unshift()` / `shift()` — O(n)

Adding/removing at the **beginning** is slow because every element must be re-indexed:

```js
arr.unshift(x); // O(n) — insert at start, shift all indices +1
arr.shift();     // O(n) — remove from start, shift all indices -1
```

For an array of 1 million elements, `shift()` must update 999,999 indices. Prefer `push/pop` when possible.

### `splice()` — O(n) worst case

Depends on position: splicing near the end is faster than near the start.

### Access by index — O(1)

```js
arr[i]; // O(1) — direct access by numeric index
```

---

## 12. Common Gotchas

### Gotcha 1: `typeof []` is `"object"`

```js
typeof [];          // "object"
typeof {};          // "object"
typeof null;        // "object"

// Use Array.isArray() instead:
Array.isArray([]);  // true
Array.isArray({});  // false
```

### Gotcha 2: Comparing arrays by reference

Arrays are objects — they're compared by **reference**, not by value:

```js
[1, 2, 3] === [1, 2, 3]; // false (different objects in memory)
[1, 2, 3] == [1, 2, 3];  // false

const a = [1, 2, 3];
const b = a;              // same reference
a === b;                  // true

// To compare by value, use JSON.stringify or loop:
JSON.stringify([1, 2]) === JSON.stringify([1, 2]); // true (simple cases)
```

### Gotcha 3: Holes / sparse arrays

```js
const arr = [1, , 3];     // hole at index 1
arr[1];                    // undefined
arr.length;                // 3
1 in arr;                  // false (no property at index 1)

// Methods handle holes inconsistently:
[1, , 3].map(x => x * 2);     // [2, empty, 6] — skips the hole
[1, , 3].forEach(x => console.log(x)); // logs 1, 3 — skips hole
[1, , 3].indexOf(undefined);  // -1 — hole is not undefined
```

Avoid sparse arrays. Use `undefined` explicitly if you need a placeholder.

### Gotcha 4: `delete` vs `splice`

`delete` removes the value but leaves a hole — it doesn't shift elements or update `length`:

```js
const arr = ["a", "b", "c"];

delete arr[1];
console.log(arr);        // ["a", empty, "c"]
console.log(arr.length); // 3 (unchanged!)
console.log(arr[1]);     // undefined

// Use splice instead:
const arr2 = ["a", "b", "c"];
arr2.splice(1, 1);
console.log(arr2);       // ["a", "c"]
console.log(arr2.length);// 2
```

### Gotcha 5: `new Array(n)` creates sparse, not filled

```js
new Array(3);         // [empty × 3] — sparse, not [undefined, undefined, undefined]
new Array(3).map((_, i) => i); // [empty × 3] — map skips empty slots!

// Fix: fill first, or use Array.from
Array(3).fill(0).map((_, i) => i); // [0, 1, 2]
Array.from({ length: 3 }, (_, i) => i); // [0, 1, 2]
```

### Gotcha 6: Mutating methods return values

Some methods return the **new length** (not the array), which can be confusing:

```js
const arr = [1, 2];
const result = arr.push(3); // result = 3 (length), NOT [1, 2, 3]

// splice returns the REMOVED elements, not the modified array:
const removed = [1, 2, 3].splice(0, 1); // removed = [1]
```

---

## 13. Best Practices

1. **Use array literals `[]`** — avoid `new Array()` to prevent the single-argument trap.

2. **Use `const` for array bindings** — the binding is constant, but the array contents can still be mutated. This prevents accidental reassignment.
   ```js
   const arr = [1, 2, 3];
   arr.push(4);      // OK — mutating contents
   // arr = [5, 6];  // Error — reassigning the binding
   ```

3. **Prefer `push/pop` over `unshift/shift`** — O(1) vs O(n) performance.

4. **Use `splice` instead of `delete`** — `delete` creates holes; `splice` properly removes elements.

5. **Use `Array.isArray()`** for type checking — `typeof` returns `"object"` for arrays.

6. **Prefer `for...of` over `for...in`** for iteration — `for...in` includes non-index properties and gives string keys.

7. **Use `includes()` over `indexOf() !== -1`** for existence checks — cleaner, and handles `NaN`.

8. **Avoid sparse arrays** — they cause unexpected behavior with most array methods.

9. **Use `Array.from()` with a mapper** to generate arrays — cleaner than `new Array(n).fill().map()`.

10. **Use `at(-1)` for last element** instead of `arr[arr.length - 1]` (ES2022+).

---

## References

- [javascript.info — Arrays](https://javascript.info/array)
- [javascript.info — Array Methods](https://javascript.info/array-methods)
- [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN — Array.from()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
- [MDN — Array.prototype.at()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
- [MDN — Array.prototype.splice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
