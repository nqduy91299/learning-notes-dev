# Async/Await

`async/await` is syntactic sugar over Promises that lets you write asynchronous code in a synchronous-looking style. It was introduced in ES2017 and has become the dominant pattern for handling async operations in modern JavaScript.

---

## 1. Async Functions — Always Return a Promise

The `async` keyword before a function has two effects:

1. **Makes the function always return a promise.** Non-promise return values are automatically wrapped in `Promise.resolve()`.
2. **Allows `await` to be used inside it.**

```js
async function greet() {
  return "hello";
}

greet().then(console.log); // "hello"

// Equivalent to:
function greet() {
  return Promise.resolve("hello");
}
```

### Explicitly returning a promise

If you return a promise from an async function, it is **not double-wrapped** — it is adopted (unwrapped then re-wrapped):

```js
async function fetchData() {
  return Promise.resolve(42);
}

fetchData().then(console.log); // 42 (not Promise { 42 })
```

### Async function expressions and arrows

```js
const fn1 = async function () {
  return 1;
};

const fn2 = async () => {
  return 2;
};

// Async methods in objects/classes
class Api {
  async fetchUser(id: number) {
    // ...
  }
}
```

---

## 2. The `await` Keyword — Pause and Unwrap

`await` pauses execution of the async function until the promise settles, then returns the **resolved value**. If the promise rejects, `await` throws the rejection reason.

```js
async function demo() {
  const result = await Promise.resolve("done");
  console.log(result); // "done"
}
```

### How it works

1. `await` suspends the async function (not the entire thread — the event loop continues).
2. When the promise settles, execution resumes.
3. The resolved value is returned from the `await` expression.
4. If the promise rejects, an exception is thrown at the `await` line.

```js
async function fetchUser() {
  const response = await fetch("/api/user");    // pauses here
  const user = await response.json();           // pauses here
  return user;                                   // resumes, returns
}
```

### `await` with non-promise values

`await` on a non-promise value simply returns it immediately (wrapped in `Promise.resolve` under the hood):

```js
async function demo() {
  const x = await 42;
  console.log(x); // 42
}
```

### `await` accepts thenables

Any object with a `.then()` method works with `await`:

```js
const thenable = {
  then(resolve) {
    setTimeout(() => resolve("thenable result"), 100);
  },
};

async function demo() {
  const result = await thenable;
  console.log(result); // "thenable result"
}
```

### `await` can only be used inside `async` functions (or at top-level in modules)

```js
function broken() {
  const data = await fetch("/api"); // SyntaxError!
}
```

---

## 3. Error Handling with `try/catch`

A rejected promise throws when `await`ed. Use `try/catch` just like synchronous error handling:

```js
async function fetchData() {
  try {
    const response = await fetch("https://invalid-url.example");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
```

### `await` rejection === `throw`

These two are equivalent:

```js
async function a() {
  await Promise.reject(new Error("fail"));
}

async function b() {
  throw new Error("fail");
}
```

### Catching specific errors

```js
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network error");
    } else {
      console.error("Other error:", error.message);
    }
  }
}
```

### Falling back to `.catch()`

If you don't want `try/catch`, you can use `.catch()` on the returned promise:

```js
async function riskyOperation() {
  const data = await fetch("/api/data");
  return data.json();
}

riskyOperation().catch(err => console.error("Caught:", err));
```

### Multiple `try/catch` blocks for granular handling

```js
async function processData() {
  let rawData;
  try {
    rawData = await fetchData();
  } catch (err) {
    console.error("Fetch failed, using cached data");
    rawData = getCachedData();
  }

  try {
    const result = await transform(rawData);
    await save(result);
  } catch (err) {
    console.error("Processing failed:", err);
  }
}
```

---

## 4. Parallel Execution with `Promise.all` + `await`

When you have multiple independent async operations, run them in parallel with `Promise.all`:

```js
async function loadDashboard(userId) {
  const [user, posts, notifications] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchNotifications(userId),
  ]);

  return { user, posts, notifications };
}
```

### Error behavior

`Promise.all` rejects as soon as **any** promise rejects. The error propagates to the `await`:

```js
async function loadAll() {
  try {
    const results = await Promise.all([
      fetchA(), // succeeds
      fetchB(), // rejects with Error("B failed")
      fetchC(), // succeeds — but result is discarded
    ]);
  } catch (error) {
    console.error(error.message); // "B failed"
  }
}
```

### `Promise.allSettled` for fault-tolerant parallel execution

If you want all results regardless of individual failures:

```js
async function loadAllSafe() {
  const results = await Promise.allSettled([
    fetchA(),
    fetchB(),
    fetchC(),
  ]);

  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("Success:", result.value);
    } else {
      console.error("Failed:", result.reason);
    }
  }
}
```

---

## 5. Sequential vs Parallel — Common Mistake

### The mistake: `await` in sequence when parallel is possible

```js
// BAD — sequential! Each await waits for the previous to finish.
async function slow() {
  const a = await fetchA(); // waits ~1s
  const b = await fetchB(); // waits ~1s after a
  const c = await fetchC(); // waits ~1s after b
  return [a, b, c];          // total: ~3s
}
```

### The fix: start all promises first, then await

```js
// GOOD — parallel! All three start immediately.
async function fast() {
  const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC(),
  ]);
  return [a, b, c]; // total: ~1s (max of the three)
}
```

### Alternative: start promises, then await individually

This gives you parallel execution while still naming each variable:

```js
async function fast() {
  const promiseA = fetchA(); // starts immediately
  const promiseB = fetchB(); // starts immediately
  const promiseC = fetchC(); // starts immediately

  const a = await promiseA;
  const b = await promiseB;
  const c = await promiseC;

  return [a, b, c];
}
```

> Note: if `promiseA` rejects, `promiseB` and `promiseC` become unhandled rejections unless you also handle them. Prefer `Promise.all` which handles this correctly.

---

## 6. `await` in `for...of` Loops — Sequential by Design

`for...of` with `await` processes items **one at a time**, which is correct when each iteration depends on the previous:

```js
async function processSequentially(urls) {
  const results = [];
  for (const url of urls) {
    const response = await fetch(url);   // waits for each one
    const data = await response.json();
    results.push(data);
  }
  return results;
}
```

### When sequential is correct

- Each request depends on the result of the previous one.
- Rate-limiting: you don't want to overwhelm the server.
- Processing order matters and you need to maintain it strictly.

### When you actually want parallel

If the iterations are independent, use `Promise.all` with `map`:

```js
async function processParallel(urls) {
  const results = await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      return response.json();
    })
  );
  return results;
}
```

---

## 7. Top-Level `await` (ES Modules)

In ES modules (files with `import`/`export` or `type="module"`), you can use `await` at the top level without wrapping in an async function:

```js
// module.js (ES module)
const response = await fetch("/api/config");
export const config = await response.json();
```

### Behavior

- The module's evaluation pauses at each `await`.
- Any module that `import`s this module will wait until it finishes.
- This is useful for initialization logic (loading config, database connections, etc.).

### Fallback: Async IIFE

For non-module scripts or older environments:

```js
(async () => {
  const data = await fetchSomething();
  console.log(data);
})();
```

---

## 8. Async Iteration — `for await...of`

`for await...of` iterates over **async iterables** — objects that produce promises one at a time:

```js
async function* generateNumbers() {
  yield 1;
  yield 2;
  await new Promise(resolve => setTimeout(resolve, 100));
  yield 3;
}

async function consume() {
  for await (const num of generateNumbers()) {
    console.log(num); // 1, 2, 3 (with a pause before 3)
  }
}
```

### Iterating over streams (Node.js)

```js
import { createReadStream } from "fs";

async function readFile(path) {
  const stream = createReadStream(path, { encoding: "utf-8" });
  for await (const chunk of stream) {
    console.log(chunk);
  }
}
```

### `for await...of` with regular iterables of promises

You can also use `for await...of` with an array of promises (they are awaited one by one, in order):

```js
const promises = [
  fetch("/api/1").then(r => r.json()),
  fetch("/api/2").then(r => r.json()),
  fetch("/api/3").then(r => r.json()),
];

for await (const result of promises) {
  console.log(result); // results in order, as each resolves
}
```

---

## 9. Combining with Promise Methods

`async/await` works seamlessly with all Promise static methods:

### `Promise.all` — all must succeed

```js
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### `Promise.allSettled` — wait for all, regardless of outcome

```js
const results = await Promise.allSettled([fetchA(), fetchB()]);
// [{status: "fulfilled", value: ...}, {status: "rejected", reason: ...}]
```

### `Promise.race` — first to settle (fulfill or reject)

```js
const fastest = await Promise.race([fetchA(), fetchB()]);
```

### `Promise.any` — first to fulfill (ignores rejections unless all reject)

```js
const first = await Promise.any([fetchA(), fetchB()]);
// Throws AggregateError if ALL reject
```

### Practical: timeout pattern with `Promise.race`

```js
async function fetchWithTimeout(url, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
  return Promise.race([fetch(url), timeout]);
}
```

---

## 10. Common Gotchas

### Gotcha 1: Forgetting `await`

```js
async function broken() {
  const data = fetch("/api/data"); // Missing await! data is a Promise, not a Response
  console.log(data); // Promise { <pending> }
}
```

### Gotcha 2: `await` inside `forEach` does NOT work

`forEach` doesn't await the callbacks — it fires them all synchronously and returns `undefined`:

```js
// BAD — all fetches fire in parallel, forEach returns immediately
async function broken(urls) {
  urls.forEach(async (url) => {
    const data = await fetch(url); // each callback awaits independently
    console.log(data);             // but the outer function doesn't wait
  });
  console.log("done"); // prints BEFORE any fetch completes!
}

// FIX — use for...of for sequential:
async function fixed(urls) {
  for (const url of urls) {
    const data = await fetch(url);
    console.log(data);
  }
  console.log("done"); // prints AFTER all fetches
}

// FIX — use Promise.all + map for parallel:
async function fixedParallel(urls) {
  await Promise.all(urls.map(async (url) => {
    const data = await fetch(url);
    console.log(data);
  }));
  console.log("done"); // prints AFTER all fetches
}
```

### Gotcha 3: Sequential when parallel is intended

```js
// BAD — two independent requests run sequentially
const user = await fetchUser();
const posts = await fetchPosts();

// GOOD — run in parallel
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
```

### Gotcha 4: Swallowing errors silently

```js
// BAD — error disappears, function returns undefined
async function swallowError() {
  try {
    return await riskyOperation();
  } catch (err) {
    // silently swallowed — no log, no rethrow
  }
}

// GOOD — at minimum, log and rethrow
async function handleError() {
  try {
    return await riskyOperation();
  } catch (err) {
    console.error("Operation failed:", err);
    throw err; // rethrow so caller knows it failed
  }
}
```

### Gotcha 5: `return` vs `return await` in try/catch

```js
async function noAwait() {
  try {
    return riskyAsyncFn(); // catch block won't catch rejection!
  } catch (err) {
    console.error(err); // never reached
  }
}

async function withAwait() {
  try {
    return await riskyAsyncFn(); // catch block WILL catch rejection
  } catch (err) {
    console.error(err); // works as expected
  }
}
```

Without `await`, the promise is returned directly to the caller, bypassing the local `try/catch`. Use `return await` inside `try/catch` blocks.

### Gotcha 6: Unhandled rejections from fire-and-forget

```js
// BAD — if saveToDB rejects, it's an unhandled rejection
async function handler(request) {
  saveToDB(request); // no await, no .catch()
  return "accepted";
}

// GOOD — handle the error even if you don't await
async function handler(request) {
  saveToDB(request).catch(err => console.error("Save failed:", err));
  return "accepted";
}
```

---

## 11. Best Practices

1. **Prefer `async/await` over `.then()` chains** — More readable, easier to debug, and natural error handling with `try/catch`.

2. **Always handle errors** — Use `try/catch` or `.catch()` on the caller side. Never let rejections go unhandled.

3. **Use `Promise.all` for independent operations** — Don't sequentially `await` things that can run in parallel.

4. **Use `for...of` for sequential async loops** — Never use `forEach` with async callbacks.

5. **Use `return await` inside `try/catch`** — Plain `return` of a promise bypasses the catch block.

6. **Add timeouts to network operations** — Use `Promise.race` with a timeout promise to prevent hanging.

7. **Be careful with fire-and-forget** — If you intentionally don't await, add `.catch()` to prevent unhandled rejections.

8. **Keep async functions focused** — Each async function should do one logical operation. Compose smaller async functions rather than writing one giant one.

9. **Use `Promise.allSettled` when partial failure is acceptable** — When you need all results regardless of individual failures.

10. **Prefer top-level `await` in modules** — Cleaner than wrapping in async IIFE. Supported in modern Node.js and browsers.

---

## References

- [javascript.info — Async/await](https://javascript.info/async-await)
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN — await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [MDN — for-await...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
- [MDN — Using promises (async/await section)](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises#async_and_await)
