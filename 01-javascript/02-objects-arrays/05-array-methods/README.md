# Array Methods

Arrays are JavaScript's most-used data structure, and the built-in methods are the primary way to transform, search, filter, and aggregate data. Mastering these methods is essential for writing concise, readable, and functional-style JavaScript.

---

## 1. Transforming — `map`, `flatMap`

### `map(callback)` — returns a new array

Calls `callback` on every element and returns a **new array** of the results. The original array is untouched.

```js
const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2); // [2, 4, 6]
console.log(nums); // [1, 2, 3] — unchanged
```

**Callback signature:** `(element, index, array) => newValue`

```js
const users = [{ name: "Alice" }, { name: "Bob" }];
const names = users.map(u => u.name); // ["Alice", "Bob"]
```

> `map` always returns an array of the **same length**. If you want to both transform and filter, use `flatMap` or chain `filter().map()`.

### `flatMap(callback)` — map + flatten one level

Equivalent to `map().flat(1)`, but more efficient — maps each element and flattens the result by one level:

```js
const sentences = ["hello world", "foo bar"];
const words = sentences.flatMap(s => s.split(" ")); // ["hello", "world", "foo", "bar"]

// Useful for filtering + mapping in one pass:
const nums = [1, 2, 3, 4, 5];
const evenDoubled = nums.flatMap(n => n % 2 === 0 ? [n * 2] : []);
// [4, 8] — return [] to "skip", [value] to include
```

---

## 2. Filtering — `filter`

### `filter(callback)` — returns a new array of matches

Returns a **new array** containing only elements where `callback` returns a truthy value:

```js
const nums = [1, 2, 3, 4, 5];
const evens = nums.filter(n => n % 2 === 0); // [2, 4]
```

**Callback signature:** `(element, index, array) => boolean`

```js
const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
  { name: "Charlie", active: true },
];
const active = users.filter(u => u.active);
// [{ name: "Alice", active: true }, { name: "Charlie", active: true }]
```

> `filter` can return an empty array if nothing matches. It never mutates the original.

---

## 3. Reducing — `reduce`, `reduceRight`

### `reduce(callback, initialValue)` — the accumulator pattern

Reduces an array to a **single value** by running an accumulator function across all elements, left to right:

```js
const nums = [1, 2, 3, 4];
const sum = nums.reduce((acc, curr) => acc + curr, 0); // 10
```

**Callback signature:** `(accumulator, currentValue, index, array) => nextAccumulator`

### Initial value importance

```js
// Without initial value — first element is used as accumulator
[1, 2, 3].reduce((a, b) => a + b);     // 6 (starts with acc=1, curr=2)

// DANGER: empty array without initial value throws TypeError!
[].reduce((a, b) => a + b);            // TypeError!
[].reduce((a, b) => a + b, 0);         // 0 — safe with initial value

// Single element, no initial value — returns element without calling callback
[5].reduce((a, b) => a + b);           // 5
```

**Always provide an initial value** unless you have a specific reason not to and can guarantee the array is non-empty.

### Building objects with reduce

```js
const fruits = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const counts = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
// { apple: 3, banana: 2, cherry: 1 }
```

### `reduceRight` — same as reduce, right to left

```js
const nested = [[1, 2], [3, 4], [5, 6]];
const flattened = nested.reduceRight((acc, curr) => acc.concat(curr), [] as number[]);
// [5, 6, 3, 4, 1, 2]
```

---

## 4. Searching — `find`, `findIndex`, `findLast`, `findLastIndex`, `indexOf`, `lastIndexOf`, `includes`

### `find(callback)` / `findIndex(callback)` — first match

```js
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

users.find(u => u.id === 2);       // { id: 2, name: "Bob" }
users.find(u => u.id === 99);      // undefined
users.findIndex(u => u.id === 2);  // 1
users.findIndex(u => u.id === 99); // -1
```

### `findLast(callback)` / `findLastIndex(callback)` — last match (ES2023)

Searches from the end of the array:

```js
const nums = [1, 2, 3, 4, 5, 4, 3];
nums.findLast(n => n > 3);         // 4 (the second 4, at index 5)
nums.findLastIndex(n => n > 3);    // 5
```

### `indexOf` / `lastIndexOf` — by value (strict equality)

```js
const arr = [1, 2, 3, 2, 1];
arr.indexOf(2);      // 1   (first occurrence)
arr.lastIndexOf(2);  // 3   (last occurrence)
arr.indexOf(99);     // -1  (not found)

// Optional second arg: start position
arr.indexOf(2, 2);   // 3   (starts searching at index 2)
```

> `indexOf` uses **strict equality** (`===`). It cannot find `NaN`:
> ```js
> [NaN].indexOf(NaN);  // -1 — NaN !== NaN
> [NaN].includes(NaN); // true — includes uses SameValueZero
> ```

### `includes(value)` — boolean existence check

```js
[1, 2, 3].includes(2);   // true
[1, 2, 3].includes(99);  // false
[NaN].includes(NaN);      // true (uses SameValueZero algorithm)
```

---

## 5. Testing — `some`, `every`

### `some(callback)` — at least one matches

Returns `true` if **at least one** element satisfies the test. Short-circuits on first truthy return:

```js
[1, 2, 3, 4].some(n => n > 3);  // true
[1, 2, 3].some(n => n > 5);     // false
[].some(() => true);              // false (vacuously)
```

### `every(callback)` — all match

Returns `true` if **every** element satisfies the test. Short-circuits on first falsy return:

```js
[2, 4, 6].every(n => n % 2 === 0);  // true
[2, 4, 5].every(n => n % 2 === 0);  // false
[].every(() => false);                // true (vacuous truth)
```

> Empty array edge cases: `[].some(fn)` is always `false`, `[].every(fn)` is always `true`.

---

## 6. Sorting — `sort`, `toSorted`

### `sort(comparator?)` — mutates the original!

```js
const arr = [3, 1, 2];
arr.sort();
console.log(arr); // [1, 2, 3] — arr is MUTATED
```

### The default string sort gotcha

**Without a comparator, `sort` converts elements to strings and sorts lexicographically:**

```js
[10, 9, 80, 1].sort();     // [1, 10, 80, 9] — string comparison!
[10, 9, 80, 1].sort((a, b) => a - b); // [1, 9, 10, 80] — numeric sort
```

This is one of the most common JavaScript gotchas.

### Comparator function

The comparator receives two elements `(a, b)` and should return:
- **Negative** → `a` comes first
- **Zero** → order unchanged
- **Positive** → `b` comes first

```js
// Ascending numeric
[3, 1, 2].sort((a, b) => a - b); // [1, 2, 3]

// Descending numeric
[3, 1, 2].sort((a, b) => b - a); // [3, 2, 1]

// Alphabetical (locale-aware)
["banana", "apple", "cherry"].sort((a, b) => a.localeCompare(b));

// Sort objects by property
const users = [{ age: 30 }, { age: 20 }, { age: 25 }];
users.sort((a, b) => a.age - b.age); // sorted by age ascending
```

### `toSorted(comparator?)` — immutable sort (ES2023)

Returns a **new sorted array** without mutating the original:

```js
const nums = [3, 1, 2];
const sorted = nums.toSorted((a, b) => a - b);
console.log(sorted); // [1, 2, 3]
console.log(nums);   // [3, 1, 2] — unchanged
```

---

## 7. Flattening — `flat`, `flatMap`

### `flat(depth)` — flatten nested arrays

```js
[1, [2, 3], [4, [5]]].flat();    // [1, 2, 3, 4, [5]] — default depth 1
[1, [2, [3, [4]]]].flat(2);      // [1, 2, 3, [4]]    — depth 2
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]    — fully flat
```

### `flat` removes empty slots

```js
[1, , 3, , 5].flat(); // [1, 3, 5]
```

### `flatMap` — map + flat(1)

See Section 1 for `flatMap` details. It only flattens **one level** (equivalent to `map().flat(1)`).

---

## 8. Combining — `concat`, spread

### `concat(...arrays)` — returns new array

```js
const a = [1, 2];
const b = [3, 4];
const c = a.concat(b);       // [1, 2, 3, 4]
const d = a.concat(b, [5]);  // [1, 2, 3, 4, 5]
console.log(a); // [1, 2] — unchanged
```

### Spread alternative (preferred)

```js
const combined = [...a, ...b]; // [1, 2, 3, 4]
const withExtra = [...a, 99, ...b]; // [1, 2, 99, 3, 4]
```

> Spread is generally preferred for readability. `concat` has the advantage of accepting non-array values directly: `[1].concat(2, 3)` → `[1, 2, 3]`.

---

## 9. Slicing & Splicing — `slice`, `splice`, `toSpliced`

### `slice(start?, end?)` — immutable, returns a subarray

Returns a **shallow copy** of a portion of the array. Does **not** mutate the original.

```js
const arr = [0, 1, 2, 3, 4];
arr.slice(1, 3);  // [1, 2]       — from index 1, up to (not including) 3
arr.slice(2);     // [2, 3, 4]    — from index 2 to end
arr.slice(-2);    // [3, 4]       — last 2 elements
arr.slice();      // [0, 1, 2, 3, 4] — shallow copy of entire array
```

### `splice(start, deleteCount?, ...items)` — mutates! add/remove in place

```js
const arr = [0, 1, 2, 3, 4];

// Remove 2 elements starting at index 1
const removed = arr.splice(1, 2); // removed: [1, 2], arr: [0, 3, 4]

// Insert at index 1 without removing
arr.splice(1, 0, "a", "b"); // arr: [0, "a", "b", 3, 4]

// Replace: remove 1, insert 1
arr.splice(2, 1, "X"); // arr: [0, "a", "X", 3, 4]
```

### `toSpliced(start, deleteCount?, ...items)` — immutable splice (ES2023)

Returns a new array with the splice applied, without mutating the original:

```js
const arr = [0, 1, 2, 3, 4];
const result = arr.toSpliced(1, 2, "a", "b"); // [0, "a", "b", 3, 4]
console.log(arr); // [0, 1, 2, 3, 4] — unchanged
```

---

## 10. Iterating — `forEach`, `for...of`

### `forEach(callback)` — execute for each element

```js
[1, 2, 3].forEach((val, idx) => {
  console.log(`${idx}: ${val}`);
});
// 0: 1
// 1: 2
// 2: 3
```

**Important limitations:**
- Returns `undefined` — cannot chain after it
- **Cannot `break` or `return` early** — `return` inside `forEach` only skips the current iteration
- Cannot use `await` meaningfully (doesn't pause between iterations)

### `for...of` — generally preferred

```js
for (const val of [1, 2, 3]) {
  if (val === 2) break; // can break!
  console.log(val);
}
// 1
```

Use `for...of` when you need:
- `break` / `continue`
- `await` inside the loop
- Better debugging experience (step-through)

Use `forEach` for simple side effects where breaking isn't needed.

---

## 11. Converting — `join`, `Array.from`, `Array.of`, `keys`/`values`/`entries`

### `join(separator?)` — array → string

```js
["a", "b", "c"].join("-");  // "a-b-c"
["a", "b", "c"].join("");   // "abc"
["a", "b", "c"].join();     // "a,b,c" (default comma)
[1, null, undefined, 2].join("-"); // "1---2" (null/undefined → empty)
```

### `Array.from(iterable, mapFn?)` — convert iterable/array-like to array

```js
Array.from("hello");           // ["h", "e", "l", "l", "o"]
Array.from({ length: 3 });     // [undefined, undefined, undefined]
Array.from({ length: 5 }, (_, i) => i);     // [0, 1, 2, 3, 4]
Array.from({ length: 5 }, (_, i) => i * 2); // [0, 2, 4, 6, 8]

// From a Set (deduplication)
Array.from(new Set([1, 2, 2, 3])); // [1, 2, 3]

// From NodeList (DOM)
Array.from(document.querySelectorAll("div"));
```

### `Array.of(...values)` — create array from arguments

```js
Array.of(1, 2, 3);  // [1, 2, 3]
Array.of(5);         // [5] — compare with Array(5) which creates 5 empty slots!
```

### `keys()`, `values()`, `entries()` — iterators

```js
const arr = ["a", "b", "c"];

[...arr.keys()];    // [0, 1, 2]
[...arr.values()];  // ["a", "b", "c"]
[...arr.entries()]; // [[0, "a"], [1, "b"], [2, "c"]]

for (const [index, value] of arr.entries()) {
  console.log(`${index}: ${value}`);
}
```

---

## 12. Immutable Alternatives (ES2023+)

ES2023 introduced copy-on-write versions of mutating methods:

| Mutating | Immutable (ES2023) | Returns |
|----------|-------------------|---------|
| `sort()` | `toSorted()` | New sorted array |
| `reverse()` | `toReversed()` | New reversed array |
| `splice()` | `toSpliced()` | New array with splice applied |
| `arr[i] = val` | `with(index, value)` | New array with element replaced |

### `toReversed()` — immutable reverse

```js
const arr = [1, 2, 3];
const rev = arr.toReversed(); // [3, 2, 1]
console.log(arr); // [1, 2, 3] — unchanged
```

### `with(index, value)` — immutable element replacement

```js
const arr = ["a", "b", "c"];
const updated = arr.with(1, "X"); // ["a", "X", "c"]
console.log(arr); // ["a", "b", "c"] — unchanged

// Negative index
arr.with(-1, "Z"); // ["a", "b", "Z"]
```

These are especially useful in React/Redux/immutable state patterns where you must avoid mutation.

---

## 13. Method Chaining

Array methods that return arrays can be chained together, enabling a pipeline-style flow:

```js
const transactions = [
  { type: "credit", amount: 100 },
  { type: "debit", amount: 50 },
  { type: "credit", amount: 200 },
  { type: "debit", amount: 75 },
  { type: "credit", amount: 30 },
];

const totalCredits = transactions
  .filter(t => t.type === "credit")   // keep credits
  .map(t => t.amount)                  // extract amounts
  .reduce((sum, a) => sum + a, 0);     // sum them

console.log(totalCredits); // 330
```

### Chaining performance consideration

Each chained method creates an intermediate array. For very large arrays, consider using a single `reduce` or a `for` loop:

```js
// Single-pass equivalent (more performant, less readable)
const totalCredits2 = transactions.reduce(
  (sum, t) => t.type === "credit" ? sum + t.amount : sum,
  0
);
```

For most cases the chained version is perfectly fine — optimize only when profiling shows it matters.

---

## 14. Common Gotchas

### Gotcha 1: `sort()` mutates the original array

```js
const original = [3, 1, 2];
const sorted = original.sort();
console.log(original); // [1, 2, 3] — mutated!
console.log(sorted === original); // true — same reference!

// Fix: copy first
const safeSorted = [...original].sort();
// Or use toSorted() (ES2023)
```

### Gotcha 2: Default `sort()` is lexicographic

```js
[10, 9, 80].sort();              // [10, 80, 9] — string comparison!
[10, 9, 80].sort((a, b) => a - b); // [9, 10, 80] — correct
```

### Gotcha 3: `reduce` without initial value on empty array

```js
[].reduce((a, b) => a + b); // TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0); // 0 — safe
```

### Gotcha 4: `forEach` cannot break

```js
[1, 2, 3].forEach(n => {
  if (n === 2) return; // only skips current iteration, doesn't break
  console.log(n);
});
// Logs: 1, 3 — "return" doesn't stop forEach
```

Use `for...of` or `some`/`every` if you need early termination:

```js
[1, 2, 3].some(n => {
  if (n === 2) return true; // stops iteration
  console.log(n);
  return false;
});
// Logs: 1 — then stops
```

### Gotcha 5: `map` on sparse arrays preserves holes

```js
const sparse = [1, , 3];
sparse.map(x => x * 2); // [2, empty, 6] — hole preserved
```

### Gotcha 6: `indexOf` can't find `NaN`

```js
[NaN].indexOf(NaN);  // -1
[NaN].includes(NaN); // true — use includes for NaN checks
```

---

## 15. Cheat Sheet — Mutating vs Non-Mutating

### Non-mutating (return new array or value)

| Method | Returns | Purpose |
|--------|---------|---------|
| `map(fn)` | `T[]` | Transform each element |
| `flatMap(fn)` | `T[]` | Map + flatten 1 level |
| `filter(fn)` | `T[]` | Keep matching elements |
| `reduce(fn, init)` | `T` | Accumulate to single value |
| `reduceRight(fn, init)` | `T` | Reduce from right |
| `find(fn)` | `T \| undefined` | First match |
| `findIndex(fn)` | `number` | Index of first match |
| `findLast(fn)` | `T \| undefined` | Last match |
| `findLastIndex(fn)` | `number` | Index of last match |
| `indexOf(val)` | `number` | First index of value |
| `lastIndexOf(val)` | `number` | Last index of value |
| `includes(val)` | `boolean` | Contains value? |
| `some(fn)` | `boolean` | At least one match? |
| `every(fn)` | `boolean` | All match? |
| `flat(depth)` | `T[]` | Flatten nested arrays |
| `concat(...arr)` | `T[]` | Merge arrays |
| `slice(start, end)` | `T[]` | Extract subarray |
| `join(sep)` | `string` | Array → string |
| `keys()` | `Iterator` | Index iterator |
| `values()` | `Iterator` | Value iterator |
| `entries()` | `Iterator` | [index, value] iterator |
| `toSorted(fn)` | `T[]` | Immutable sort (ES2023) |
| `toReversed()` | `T[]` | Immutable reverse (ES2023) |
| `toSpliced(...)` | `T[]` | Immutable splice (ES2023) |
| `with(i, val)` | `T[]` | Immutable element replace (ES2023) |
| `Array.from(iter)` | `T[]` | Create from iterable |
| `Array.of(...vals)` | `T[]` | Create from values |

### Mutating (modify the original array)

| Method | Returns | Purpose |
|--------|---------|---------|
| `sort(fn)` | `T[]` (same ref) | Sort in place |
| `reverse()` | `T[]` (same ref) | Reverse in place |
| `splice(i, n, ...items)` | `T[]` (removed) | Add/remove elements |
| `push(...items)` | `number` (new length) | Add to end |
| `pop()` | `T \| undefined` | Remove from end |
| `shift()` | `T \| undefined` | Remove from start |
| `unshift(...items)` | `number` (new length) | Add to start |
| `fill(val, start, end)` | `T[]` (same ref) | Fill with value |
| `copyWithin(target, start, end)` | `T[]` (same ref) | Copy within array |

---

## 16. Best Practices

1. **Prefer immutable methods** — Use `map`, `filter`, `reduce`, `toSorted`, `toReversed` over mutating alternatives. Immutability reduces bugs and is required in React/Redux state management.

2. **Always pass a comparator to `sort`** — Never rely on default lexicographic sorting for numbers or complex types.

3. **Always provide an initial value to `reduce`** — Prevents `TypeError` on empty arrays and makes the return type unambiguous.

4. **Use `for...of` over `forEach` when you need control flow** — `break`, `continue`, `await`, and `return` work naturally in `for...of`.

5. **Use `includes` for existence checks, not `indexOf`** — More readable and handles `NaN` correctly.

6. **Use `find`/`findIndex` for objects, `indexOf`/`includes` for primitives** — `indexOf` uses strict equality, so it doesn't work for object references you don't already have.

7. **Chain methods for readability, but don't over-chain** — Chains of 3-4 methods are fine. Beyond that, consider naming intermediate results.

8. **Use `flatMap` for filter+map in one pass** — Return `[]` to skip, `[value]` to include.

9. **Copy before sorting if you need the original** — `[...arr].sort(fn)` or `arr.toSorted(fn)`.

10. **Use `Array.from({ length: n }, fn)` for array generation** — Cleaner than `new Array(n).fill(null).map(fn)`.

---

## References

- [javascript.info — Array methods](https://javascript.info/array-methods)
- [MDN — Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN — Change Array by copy (ES2023)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods)
