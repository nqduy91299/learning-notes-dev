# Promises

A **Promise** is JavaScript's built-in mechanism for representing the eventual result of an asynchronous operation. Before Promises, callbacks were the only way to handle async results, leading to deep nesting ("callback hell") and fragile error handling. Promises give us a chainable, composable, error-propagating alternative.

---

## 1. What Is a Promise?

A Promise is an object that represents a value that may not be available yet. It exists in one of three **states**:

| State | Meaning | Settled? |
|-------|---------|----------|
| **pending** | Operation still in progress | No |
| **fulfilled** | Operation completed successfully with a value | Yes |
| **rejected** | Operation failed with a reason (error) | Yes |

Once a Promise is settled (fulfilled or rejected), it **cannot change state again**. This is a fundamental guarantee — a fulfilled Promise will never become rejected, and vice versa.

```js
const p = fetch("/api/data");
// p is pending immediately

// Eventually p will be either:
// - fulfilled with a Response object
// - rejected with a network error
```

A Promise that is either fulfilled or rejected is called **settled**. A settled Promise is also called **resolved** when its fate is determined (even if it's determined by being linked to another Promise that is still pending).

---

## 2. Creating Promises — `new Promise(executor)`

The `Promise` constructor takes an **executor function** that receives two callbacks: `resolve` and `reject`.

```js
const p = new Promise((resolve, reject) => {
  // Do some async work...
  const success = true;

  if (success) {
    resolve("done");  // Fulfills the promise with value "done"
  } else {
    reject(new Error("failed"));  // Rejects the promise with an error
  }
});
```

### Key rules of the executor

1. The executor runs **synchronously** (immediately when `new Promise()` is called).
2. Calling `resolve(value)` fulfills the Promise with that value.
3. Calling `reject(reason)` rejects the Promise with that reason.
4. Only the **first** call to `resolve` or `reject` matters — subsequent calls are ignored.
5. If the executor **throws**, the Promise is rejected with the thrown error.

```js
// Throwing inside executor → rejection
const p = new Promise((resolve, reject) => {
  throw new Error("oops");
});
// p is rejected with Error("oops")

// Multiple resolve/reject calls — only first counts
const p2 = new Promise((resolve, reject) => {
  resolve("first");
  resolve("second");  // Ignored
  reject("error");    // Also ignored
});
// p2 is fulfilled with "first"
```

### Resolving with another Promise

If you call `resolve(anotherPromise)`, the current Promise **adopts the state** of `anotherPromise`. It waits for `anotherPromise` to settle and then mirrors its result:

```js
const inner = new Promise(resolve => setTimeout(() => resolve(42), 1000));
const outer = new Promise(resolve => resolve(inner));

// outer is pending until inner resolves
// After 1 second, outer is fulfilled with 42
```

---

## 3. Consuming Promises — `.then`, `.catch`, `.finally`

### `.then(onFulfilled, onRejected)`

Registers callbacks for when the Promise settles. Returns a **new Promise**, enabling chaining.

```js
promise
  .then(
    value => console.log("Success:", value),    // onFulfilled
    error => console.log("Error:", error)        // onRejected (optional)
  );
```

- If `onFulfilled` returns a value, the new Promise is fulfilled with that value.
- If `onFulfilled` returns a Promise, the new Promise adopts that Promise's state.
- If `onFulfilled` throws, the new Promise is rejected with the thrown error.

### `.catch(onRejected)`

Shorthand for `.then(undefined, onRejected)`. Registers a rejection handler:

```js
promise
  .then(value => console.log(value))
  .catch(error => console.error(error));
```

`.catch` also returns a new Promise. If the catch handler returns a value (doesn't throw), the returned Promise is **fulfilled** — this is how you recover from errors.

### `.finally(onFinally)`

Runs a callback regardless of fulfillment or rejection, then **passes through** the original value or error:

```js
fetchData()
  .then(data => process(data))
  .catch(err => logError(err))
  .finally(() => hideSpinner());
```

Key properties of `.finally`:
- Receives **no arguments** (you don't know if it succeeded or failed).
- The return value is ignored (passes through the previous result), **unless** you throw or return a rejected Promise, which replaces the result with the rejection.
- Useful for cleanup logic (closing connections, hiding loaders).

---

## 4. Promise Chaining

Each `.then` returns a **new** Promise, creating a chain where each step can transform the value:

### Returning plain values

```js
new Promise(resolve => resolve(1))
  .then(val => val + 1)    // returns 2
  .then(val => val * 3)    // returns 6
  .then(val => console.log(val)); // logs 6
```

### Returning Promises

If a `.then` handler returns a Promise, the chain **waits** for it to settle before proceeding:

```js
fetch("/api/user")
  .then(response => response.json())     // returns a Promise<object>
  .then(user => fetch(`/api/posts/${user.id}`))  // returns a Promise<Response>
  .then(response => response.json())
  .then(posts => console.log(posts));
```

This is the key power of Promises: sequential async operations read like synchronous code (and `async/await` makes it even cleaner).

### The chain is a pipeline

Each `.then` creates a new Promise. The original Promise is unaffected:

```js
const p = Promise.resolve(1);
const p2 = p.then(v => v + 1);  // p2 is a NEW Promise
const p3 = p.then(v => v + 2);  // p3 is ALSO a new Promise, branching from p

// p2 → 2, p3 → 3 (they are independent branches)
```

---

## 5. Error Handling

### Errors propagate down the chain

A rejection (or thrown error) "falls through" `.then` handlers until it hits a `.catch` (or a `.then` with an `onRejected` handler):

```js
Promise.resolve(1)
  .then(val => { throw new Error("boom"); })
  .then(val => console.log("skipped"))        // Skipped!
  .then(val => console.log("also skipped"))   // Skipped!
  .catch(err => console.log(err.message));     // "boom"
```

This is analogous to `try/catch` — the error skips all the "happy path" handlers and lands in the nearest error handler.

### Recovering from errors

A `.catch` handler can return a value to "recover" and continue the chain:

```js
Promise.reject("error")
  .catch(err => "default value")    // Recovers — returns fulfilled Promise
  .then(val => console.log(val));    // "default value"
```

### Re-throwing in catch

If a `.catch` handler throws (or returns a rejected Promise), the error continues propagating:

```js
Promise.reject("error")
  .catch(err => { throw new Error("new error"); })
  .catch(err => console.log(err.message));  // "new error"
```

### Unhandled rejections

If a rejected Promise has no `.catch` handler anywhere in its chain, the runtime fires an `unhandledrejection` event (browsers) or `unhandledRejection` event (Node.js). Modern runtimes treat these as errors:

```js
// BAD: no catch handler — will trigger unhandledrejection warning
Promise.reject("oops");

// GOOD: always handle rejections
Promise.reject("oops").catch(err => console.error(err));
```

### `.catch` position matters

```js
// Catch at the END — catches errors from any preceding step
step1()
  .then(step2)
  .then(step3)
  .catch(handleError);  // Catches errors from step1, step2, OR step3

// Catch in the MIDDLE — only catches errors from steps before it
step1()
  .catch(handleStep1Error)  // Only catches step1 errors, then chain continues
  .then(step2)
  .then(step3);              // Errors from step2/step3 are unhandled!
```

---

## 6. `Promise.all` — Fail-Fast Parallel Execution

Takes an iterable of Promises and returns a single Promise that:
- **Fulfills** with an array of all results (in input order) when **all** Promises fulfill.
- **Rejects** with the reason of the **first** Promise to reject (fail-fast).

```js
const results = await Promise.all([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/comments"),
]);
// results: [Response, Response, Response]
```

### Fail-fast behavior

```js
const p = Promise.all([
  Promise.resolve(1),
  Promise.reject("error"),
  Promise.resolve(3),         // Still runs, but result is discarded
]);
// p rejects with "error"
```

If **any** Promise rejects, the entire `Promise.all` rejects immediately. The remaining Promises continue executing (they can't be cancelled), but their results are ignored.

### Non-Promise values

Non-Promise values in the iterable are treated as `Promise.resolve(value)`:

```js
const results = await Promise.all([1, Promise.resolve(2), 3]);
// results: [1, 2, 3]
```

### Empty iterable

```js
await Promise.all([]); // [] — fulfills immediately
```

---

## 7. `Promise.allSettled`

Takes an iterable of Promises and returns a single Promise that **always fulfills** (never rejects) with an array of result objects once all input Promises have settled:

```js
const results = await Promise.allSettled([
  Promise.resolve("ok"),
  Promise.reject("fail"),
  Promise.resolve(42),
]);

// results:
// [
//   { status: "fulfilled", value: "ok" },
//   { status: "rejected",  reason: "fail" },
//   { status: "fulfilled", value: 42 },
// ]
```

Use `allSettled` when you want to know the outcome of **every** Promise, regardless of whether some fail. Unlike `Promise.all`, it never short-circuits.

---

## 8. `Promise.race`

Returns a Promise that settles as soon as the **first** input Promise settles (fulfilled or rejected):

```js
const result = await Promise.race([
  new Promise(resolve => setTimeout(() => resolve("slow"), 500)),
  new Promise(resolve => setTimeout(() => resolve("fast"), 100)),
]);
// result: "fast"
```

### Common use case: timeout

```js
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}
```

### Empty iterable

```js
Promise.race([]); // Returns a forever-pending Promise!
```

---

## 9. `Promise.any`

Returns a Promise that fulfills as soon as the **first** input Promise **fulfills**. Rejects only if **all** input Promises reject, with an `AggregateError`:

```js
const result = await Promise.any([
  Promise.reject("error 1"),
  Promise.resolve("first success"),
  Promise.resolve("second success"),
]);
// result: "first success"
```

### All rejections → AggregateError

```js
try {
  await Promise.any([
    Promise.reject("err1"),
    Promise.reject("err2"),
  ]);
} catch (e) {
  console.log(e instanceof AggregateError); // true
  console.log(e.errors); // ["err1", "err2"]
}
```

### Comparison with `Promise.race`

| | `Promise.race` | `Promise.any` |
|---|---|---|
| First to settle wins? | Yes (fulfilled OR rejected) | Only first fulfilled wins |
| All reject? | Rejects with first rejection | Rejects with AggregateError |

---

## 10. `Promise.resolve` and `Promise.reject`

### `Promise.resolve(value)`

Creates an immediately-fulfilled Promise. If `value` is already a Promise, returns it unchanged (identity):

```js
Promise.resolve(42);          // Fulfilled with 42
Promise.resolve(somePromise); // Returns somePromise as-is (if it's a native Promise)
```

### `Promise.reject(reason)`

Creates an immediately-rejected Promise:

```js
Promise.reject(new Error("fail")); // Rejected with Error("fail")
```

> Unlike `resolve`, `reject` does NOT unwrap Promises. `Promise.reject(somePromise)` rejects with the Promise object as the reason.

These are useful for:
- Starting a chain: `Promise.resolve(initialValue).then(...)`
- Conditional returns: `return condition ? doAsync() : Promise.resolve(defaultValue)`
- Testing and mocking

---

## 11. Microtask Queue (Brief)

Promise callbacks (`.then`, `.catch`, `.finally`) are scheduled as **microtasks**, which have higher priority than macrotasks (`setTimeout`, `setInterval`, I/O callbacks).

```js
console.log("1 - sync");

setTimeout(() => console.log("2 - macrotask"), 0);

Promise.resolve().then(() => console.log("3 - microtask"));

console.log("4 - sync");

// Output order:
// 1 - sync
// 4 - sync
// 3 - microtask
// 2 - macrotask
```

### Why this matters

- Microtasks run **after** the current synchronous code finishes but **before** the next macrotask.
- All queued microtasks are drained before the event loop proceeds to the next macrotask.
- Chained `.then` calls each schedule a new microtask, so `Promise.resolve().then(a).then(b)` runs `a` in one microtask and `b` in the next microtask (both before any pending `setTimeout`).

> Deep dive on the event loop and microtask queue in `03-async/04-event-loop`.

---

## 12. Common Gotchas

### Gotcha 1: Forgetting to `return` in a chain

```js
// BUG: fetch result is lost — the chain doesn't wait for it
fetch("/api/data")
  .then(response => {
    response.json();       // Missing return!
  })
  .then(data => {
    console.log(data);     // undefined — not the parsed JSON
  });

// FIX:
fetch("/api/data")
  .then(response => {
    return response.json(); // Or use arrow shorthand: .then(r => r.json())
  })
  .then(data => {
    console.log(data);      // Actual parsed JSON
  });
```

This is the single most common Promise bug. If you don't `return` from a `.then` handler, the next `.then` receives `undefined`.

### Gotcha 2: `.catch` position determines what it catches

```js
// catch only handles p1 errors — p2 errors are unhandled
p1.catch(handleError).then(p2);

// catch handles both p1 and p2 errors
p1.then(p2).catch(handleError);
```

### Gotcha 3: Promise constructor antipattern

Wrapping an existing Promise in `new Promise` is unnecessary and error-prone:

```js
// BAD: Promise constructor antipattern
function fetchData() {
  return new Promise((resolve, reject) => {
    fetch("/api/data")
      .then(response => resolve(response.json()))
      .catch(error => reject(error));
  });
}

// GOOD: just return the Promise chain directly
function fetchData() {
  return fetch("/api/data").then(response => response.json());
}
```

### Gotcha 4: `then(success, error)` vs `then(success).catch(error)`

```js
// With two-argument .then: errors in onFulfilled are NOT caught by onRejected
promise.then(
  value => { throw new Error("oops"); },
  error => console.log("won't catch the above throw")
);

// With .catch: errors in the preceding .then ARE caught
promise
  .then(value => { throw new Error("oops"); })
  .catch(error => console.log("catches it:", error.message)); // "catches it: oops"
```

### Gotcha 5: Forgetting that `.then` callbacks are async

```js
let x = 0;
Promise.resolve().then(() => { x = 1; });
console.log(x); // 0 — the .then callback hasn't run yet!
```

---

## 13. Best Practices

1. **Always return in `.then` handlers** — Forgetting `return` silently breaks chains. Use arrow shorthand (`.then(v => transform(v))`) when possible to avoid this.

2. **Always end chains with `.catch`** — Unhandled rejections crash Node.js processes and pollute browser consoles. Add a catch at the end of every chain.

3. **Prefer `async/await` for complex chains** — Chains of 3+ `.then` calls are harder to read. `async/await` provides the same semantics with synchronous-looking code.

4. **Use `Promise.all` for independent concurrent operations** — Don't `await` them sequentially if they don't depend on each other.

5. **Use `Promise.allSettled` when you need all results** — When one failure shouldn't prevent you from processing other results.

6. **Avoid the Promise constructor antipattern** — Don't wrap existing Promises in `new Promise`. Only use the constructor for promisifying callback-based APIs.

7. **Reject with `Error` objects, not strings** — `reject(new Error("msg"))` gives you stack traces. `reject("msg")` does not.

8. **Be aware of microtask timing** — Promise callbacks always run asynchronously, even if the Promise is already settled. Don't assume they run synchronously.

9. **Use `Promise.race` for timeouts** — Combine your async operation with a timeout Promise to avoid hanging forever.

10. **Promisify callback APIs at the boundary** — Convert callback-based APIs to Promises once, then use Promises throughout your code.

---

## References

- [javascript.info — Promise basics](https://javascript.info/promise-basics)
- [javascript.info — Promise chaining](https://javascript.info/promise-chaining)
- [javascript.info — Error handling with promises](https://javascript.info/promise-error-handling)
- [javascript.info — Promise API](https://javascript.info/promise-api)
- [MDN — Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN — Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN — Microtasks](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)
