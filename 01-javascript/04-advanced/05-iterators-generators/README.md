# Iterators & Generators

Iterators and generators are two closely related protocols that enable custom iteration behavior in JavaScript. The **iterable protocol** lets any object define how it should be iterated (e.g., with `for...of`), while **generators** provide a concise syntax for creating iterators using `function*` and `yield`.

---

## 1. The Iterable Protocol

An object is **iterable** if it implements the `@@iterator` method — that is, it (or its prototype chain) has a property keyed by `Symbol.iterator` that returns an **iterator**.

An **iterator** is any object with a `next()` method that returns a **result object** with two properties:

| Property | Type      | Description                                    |
| -------- | --------- | ---------------------------------------------- |
| `value`  | any       | The next value in the sequence                 |
| `done`   | `boolean` | `true` if the sequence is exhausted            |

```js
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

const iterator = iterable[Symbol.iterator]();
iterator.next(); // { value: 0, done: false }
iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: undefined, done: true }
```

**Key rules:**

- `done: false` can be omitted (defaults to `false` when absent, though explicit is preferred).
- Once `done: true` is returned, all subsequent calls should also return `done: true`.
- The `value` in the final `{ done: true }` result is the **return value** of the iterator — it is ignored by `for...of` but accessible via manual `.next()` calls.

---

## 2. Built-in Iterables

Many built-in JavaScript types implement `Symbol.iterator` out of the box:

| Type         | Iterates over                     |
| ------------ | --------------------------------- |
| `String`     | Unicode code points (characters)  |
| `Array`      | Elements by index                 |
| `Map`        | `[key, value]` entries            |
| `Set`        | Values in insertion order         |
| `TypedArray` | Elements by index                 |
| `arguments`  | Function arguments                |
| `NodeList`   | DOM nodes                         |

```js
// String iteration — handles multi-byte characters correctly
for (const char of "Hi! 😊") {
  console.log(char);
}
// "H", "i", "!", " ", "😊"  (emoji is one iteration, not two)

// Map iteration
const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}
// "a" 1
// "b" 2

// Set iteration
const set = new Set([10, 20, 30]);
for (const val of set) {
  console.log(val);
}
// 10, 20, 30
```

**Plain objects are NOT iterable by default.** `for...of` on a plain object throws a `TypeError`. You must implement `Symbol.iterator` yourself (see Section 4).

---

## 3. The `for...of` Loop

`for...of` is the primary consumer of iterables. Under the hood it:

1. Calls `obj[Symbol.iterator]()` to get an iterator.
2. Repeatedly calls `iterator.next()`.
3. Uses the `value` from each result where `done` is `false`.
4. Stops when `done` is `true`.

```js
const arr = ["a", "b", "c"];

for (const item of arr) {
  console.log(item);
}
// "a", "b", "c"
```

### `break` and `return` — Early Termination

When a `for...of` loop exits early (via `break`, `return`, or `throw`), JavaScript calls `iterator.return()` if it exists. This gives the iterator a chance to clean up resources:

```js
const resource = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return i < 100
          ? { value: i++, done: false }
          : { value: undefined, done: true };
      },
      return() {
        console.log("Cleanup! Iterator closed.");
        return { value: undefined, done: true };
      },
    };
  },
};

for (const val of resource) {
  if (val === 2) break;
  console.log(val);
}
// 0
// 1
// "Cleanup! Iterator closed."
```

### `for...of` vs `for...in`

| Feature       | `for...of`                 | `for...in`                        |
| ------------- | -------------------------- | --------------------------------- |
| Iterates over | Values (via iterable)      | Enumerable property **keys**      |
| Works on      | Iterables (Array, Map,...) | Any object                        |
| Order         | Defined by iterator        | Not guaranteed for integer keys   |

---

## 4. Making Custom Iterables

Any object can become iterable by implementing `Symbol.iterator`:

```js
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

for (const num of range) {
  console.log(num);
}
// 1, 2, 3, 4, 5

// Also works with spread and destructuring:
console.log([...range]);       // [1, 2, 3, 4, 5]
const [a, b] = range;         // a = 1, b = 2
```

Each call to `[Symbol.iterator]()` creates a **fresh** iterator. This means you can iterate the same object multiple times:

```js
[...range]; // [1, 2, 3, 4, 5]  — fresh iterator
[...range]; // [1, 2, 3, 4, 5]  — another fresh iterator
```

---

## 5. Iterators That Are Also Iterables

A common pattern is for the iterator itself to implement `Symbol.iterator` by returning `this`. This makes the iterator usable directly in `for...of`:

```js
function createCounter(max) {
  let count = 0;

  return {
    next() {
      if (count < max) {
        return { value: count++, done: false };
      }
      return { value: undefined, done: true };
    },

    [Symbol.iterator]() {
      return this; // the iterator IS the iterable
    },
  };
}

const counter = createCounter(3);

for (const val of counter) {
  console.log(val);
}
// 0, 1, 2
```

**Caveat:** Because the iterator returns itself, iterating it a second time yields nothing — the internal state is already exhausted. This is how generators behave by default.

---

## 6. Infinite Iterators

Iterators don't need to terminate. An infinite iterator never returns `done: true`:

```js
const naturals = {
  [Symbol.iterator]() {
    let n = 1;
    return {
      next() {
        return { value: n++, done: false };
      },
    };
  },
};

// DANGER: for (const n of naturals) { ... } would loop forever!
// Always use break or take a finite slice:

const first10 = [];
for (const n of naturals) {
  if (n > 10) break;
  first10.push(n);
}
console.log(first10); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

Infinite iterators are common in lazy evaluation and stream processing.

---

## 7. The Spread Operator and Destructuring with Iterables

The spread operator (`...`) and destructuring both consume iterables:

```js
// Spread into array
const chars = [..."hello"];
console.log(chars); // ["h", "e", "l", "l", "o"]

// Spread a Set to de-duplicate
const unique = [...new Set([1, 2, 2, 3, 3])];
console.log(unique); // [1, 2, 3]

// Destructuring with rest
const [first, second, ...rest] = new Set([10, 20, 30, 40, 50]);
console.log(first);  // 10
console.log(second); // 20
console.log(rest);   // [30, 40, 50]
```

Spread consumes the **entire** iterable. Be careful with infinite iterators — spreading an infinite iterator will hang or crash.

---

## 8. `Array.from()` with Iterables and Array-likes

`Array.from()` creates an array from:

1. **Iterables** — anything with `Symbol.iterator`.
2. **Array-likes** — objects with a `length` property and indexed elements.

```js
// From an iterable
const set = new Set([1, 2, 3]);
Array.from(set); // [1, 2, 3]

// From an array-like
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
Array.from(arrayLike); // ["a", "b", "c"]

// With a mapping function (second argument)
Array.from({ length: 5 }, (_, i) => i * i);
// [0, 1, 4, 9, 16]
```

**Array-like vs Iterable:** An array-like has `length` and numeric indices but no `Symbol.iterator`. An iterable has `Symbol.iterator` but may not have `length`. `Array.from()` handles both.

---

## 9. Generator Functions

A **generator function** is declared with `function*` (note the asterisk). When called, it returns a **generator object** — an iterator that you control by calling `next()`:

```js
function* generateSequence() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generateSequence();

gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

**How it works:**

1. Calling `generateSequence()` does NOT execute the function body. It creates a suspended generator object.
2. Each `gen.next()` runs the function until the next `yield`, then pauses.
3. The `yield` expression produces the value to the caller.
4. When the function returns (or reaches the end), `done` becomes `true`.

### Return value

If the generator has a `return` statement, that value appears in the final result:

```js
function* withReturn() {
  yield 1;
  yield 2;
  return 3; // return value
}

const g = withReturn();
g.next(); // { value: 1, done: false }
g.next(); // { value: 2, done: false }
g.next(); // { value: 3, done: true }  ← return value, done is true
g.next(); // { value: undefined, done: true }
```

**Important:** `for...of` ignores the return value (the `{ done: true }` result). So only `yield` values are iterated.

### Syntax variants

```js
function* gen() { }     // function declaration
const gen = function*() { };  // function expression

// Method in an object
const obj = {
  *gen() { yield 1; },
};

// Method in a class
class MyClass {
  *gen() { yield 1; }
}
```

---

## 10. Generator as Iterable

Generator objects implement both the iterator protocol (`next()`) and the iterable protocol (`Symbol.iterator` returns `this`). This means they work directly in `for...of`:

```js
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take first 8 Fibonacci numbers
const fibs = [];
for (const n of fibonacci()) {
  if (fibs.length >= 8) break;
  fibs.push(n);
}
console.log(fibs); // [0, 1, 1, 2, 3, 5, 8, 13]
```

Generators make implementing `Symbol.iterator` much simpler:

```js
const range = {
  from: 1,
  to: 5,

  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  },
};

console.log([...range]); // [1, 2, 3, 4, 5]
```

Compare this with the manual iterator from Section 4 — the generator version is much more concise.

---

## 11. Generator Composition — `yield*`

The `yield*` expression delegates to another iterable or generator, yielding each of its values in sequence:

```js
function* letters() {
  yield "a";
  yield "b";
  yield "c";
}

function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

function* combined() {
  yield* letters();
  yield* numbers();
}

console.log([...combined()]); // ["a", "b", "c", 1, 2, 3]
```

`yield*` works with any iterable, not just generators:

```js
function* spreadArray() {
  yield* [10, 20];
  yield* "hi";
  yield* new Set([30, 40]);
}

console.log([...spreadArray()]); // [10, 20, "h", "i", 30, 40]
```

### Return value of `yield*`

The `yield*` expression evaluates to the **return value** of the delegated generator:

```js
function* inner() {
  yield "x";
  yield "y";
  return "INNER_DONE";
}

function* outer() {
  const result = yield* inner();
  console.log("inner returned:", result);
  yield "z";
}

console.log([...outer()]);
// inner returned: INNER_DONE
// ["x", "y", "z"]
```

Note that `"INNER_DONE"` is the return value of `inner()`, not a yielded value — it does not appear in the spread array.

---

## 12. Generators as Data Consumers — `next(value)`

Generators are two-way channels. The argument passed to `next(value)` becomes the result of the `yield` expression inside the generator:

```js
function* conversation() {
  const name = yield "What is your name?";
  const age = yield `Hello ${name}! How old are you?`;
  return `${name} is ${age} years old.`;
}

const talk = conversation();

talk.next();           // { value: "What is your name?", done: false }
talk.next("Alice");    // { value: "Hello Alice! How old are you?", done: false }
talk.next(30);         // { value: "Alice is 30 years old.", done: true }
```

**How it works step by step:**

1. `talk.next()` — runs until `yield "What is your name?"`, produces `"What is your name?"`. The first `next()` call's argument is always **ignored** (there is no `yield` waiting to receive it).
2. `talk.next("Alice")` — `"Alice"` becomes the result of the first `yield`, so `name = "Alice"`. Runs until the next `yield`.
3. `talk.next(30)` — `30` becomes the result of the second `yield`, so `age = 30`. The function returns.

This pattern is powerful for building stateful parsers, coroutines, and cooperative multitasking.

---

## 13. `generator.return()` and `generator.throw()`

### `generator.return(value)`

Forces the generator to finish, as if a `return value` statement was executed at the current `yield`:

```js
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
g.next();          // { value: 1, done: false }
g.return("end");   // { value: "end", done: true }
g.next();          // { value: undefined, done: true } — generator is done
```

If the generator has a `try...finally` block, the `finally` still runs:

```js
function* withFinally() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log("Cleanup!");
  }
}

const g2 = withFinally();
g2.next();       // { value: 1, done: false }
g2.return("x");  // "Cleanup!" → { value: "x", done: true }
```

### `generator.throw(error)`

Throws an error **inside** the generator at the point of the current `yield`. If the generator catches it, execution continues:

```js
function* resilient() {
  let result;
  try {
    result = yield "first";
  } catch (e) {
    console.log("Caught:", e.message);
    result = "recovered";
  }
  yield result;
}

const g3 = resilient();
g3.next();                             // { value: "first", done: false }
g3.throw(new Error("oops"));           // Caught: oops → { value: "recovered", done: false }
g3.next();                             // { value: undefined, done: true }
```

If the generator does NOT catch the error, it propagates out to the caller.

---

## 14. Async Iterables — `Symbol.asyncIterator`

The **async iterable protocol** is the async counterpart of `Symbol.iterator`. An object is async iterable if it has a `Symbol.asyncIterator` method that returns an **async iterator** — an object whose `next()` returns a **Promise** resolving to `{ value, done }`.

```js
const asyncRange = {
  from: 1,
  to: 3,

  [Symbol.asyncIterator]() {
    let current = this.from;
    const last = this.to;

    return {
      async next() {
        // Simulate async delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

// Must be inside an async context
(async () => {
  for await (const num of asyncRange) {
    console.log(num);
  }
})();
// 1, 2, 3  (each after ~100ms)
```

### `for await...of`

The `for await...of` loop is the async version of `for...of`:

1. Calls `obj[Symbol.asyncIterator]()`.
2. Calls `next()` and **awaits** the returned promise.
3. Uses `value` when `done` is `false`.
4. Stops when `done` is `true`.

**Important:** `for await...of` can only be used inside an `async` function (or at the top level of a module with top-level await).

`for await...of` also works with synchronous iterables — it wraps each value in a promise automatically. This is useful when an array contains promises:

```js
const promises = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
];

for await (const val of promises) {
  console.log(val); // 1, 2, 3
}
```

---

## 15. Async Generators

An **async generator** combines `async function` with `function*`:

```js
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();

    if (data.items.length === 0) return;

    yield data.items;
    page++;
  }
}

// Usage
(async () => {
  for await (const items of fetchPages("https://api.example.com/data")) {
    console.log(`Got ${items.length} items`);
  }
})();
```

Async generators:

- Use `async function*` syntax.
- Can use both `yield` and `await`.
- Return an **async iterator** (consumed by `for await...of`).
- Can `yield` plain values or promises (promises are automatically awaited by the consumer).

### Async `yield*`

In an async generator, `yield*` can delegate to other **async iterables**:

```js
async function* source1() {
  yield 1;
  yield 2;
}

async function* source2() {
  yield 3;
  yield 4;
}

async function* merged() {
  yield* source1();
  yield* source2();
}
```

---

## 16. Practical Use Cases

### Lazy Evaluation

Process large datasets without loading everything into memory:

```js
function* lazyMap(iterable, fn) {
  for (const item of iterable) {
    yield fn(item);
  }
}

function* lazyFilter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// Pipeline: generate → filter → map → take
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

function* take(iterable, count) {
  let i = 0;
  for (const item of iterable) {
    if (i >= count) return;
    yield item;
    i++;
  }
}

const evens = lazyFilter(naturals(), (n) => n % 2 === 0);
const doubled = lazyMap(evens, (n) => n * 2);
const first5 = take(doubled, 5);

console.log([...first5]); // [4, 8, 12, 16, 20]
```

### Paginated API Fetching

```js
async function* paginatedFetch(baseUrl) {
  let cursor = null;

  while (true) {
    const url = cursor ? `${baseUrl}?cursor=${cursor}` : baseUrl;
    const res = await fetch(url);
    const data = await res.json();

    yield* data.results;

    if (!data.nextCursor) break;
    cursor = data.nextCursor;
  }
}

// Consumer doesn't know about pagination
(async () => {
  for await (const item of paginatedFetch("/api/items")) {
    process(item);
  }
})();
```

### Unique ID Generator

```js
function* idGenerator(prefix = "id") {
  let counter = 0;
  while (true) {
    yield `${prefix}_${counter++}`;
  }
}

const gen = idGenerator("user");
gen.next().value; // "user_0"
gen.next().value; // "user_1"
gen.next().value; // "user_2"
```

### Data Pipeline / Streaming

```js
// Producer: reads chunks
async function* readChunks(reader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}

// Transform: decode chunks to lines
async function* toLines(chunks) {
  let buffer = "";
  for await (const chunk of chunks) {
    buffer += new TextDecoder().decode(chunk);
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete last line
    yield* lines;
  }
  if (buffer) yield buffer;
}
```

### Cooperative Multitasking / State Machines

Generators naturally model state machines since each `yield` represents a state transition:

```js
function* trafficLight() {
  while (true) {
    yield "green";
    yield "yellow";
    yield "red";
  }
}

const light = trafficLight();
light.next().value; // "green"
light.next().value; // "yellow"
light.next().value; // "red"
light.next().value; // "green" (cycles)
```

---

## Quick Reference

| Concept                 | Syntax / API                                       |
| ----------------------- | -------------------------------------------------- |
| Make iterable           | `obj[Symbol.iterator]() → { next() }`             |
| Iterator result         | `{ value: any, done: boolean }`                    |
| Generator function      | `function* name() { yield value; }`                |
| Delegation              | `yield* otherIterable`                             |
| Send value in           | `gen.next(value)` → resumes yield with `value`     |
| Early finish            | `gen.return(value)`                                |
| Throw error in          | `gen.throw(error)`                                 |
| Async iterable          | `obj[Symbol.asyncIterator]() → { async next() }`  |
| Async generator         | `async function* name() { yield await ...; }`      |
| Consume iterable        | `for...of`, `[...iter]`, `Array.from(iter)`        |
| Consume async iterable  | `for await...of`                                   |

---

## References

- [javascript.info — Iterables](https://javascript.info/iterable)
- [javascript.info — Generators](https://javascript.info/generators)
- [MDN — Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
- [MDN — Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [MDN — for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- [MDN — Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)
- [MDN — Symbol.asyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator)
