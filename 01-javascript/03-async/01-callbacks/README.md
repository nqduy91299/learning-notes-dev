# Callbacks

A **callback** is a function passed as an argument to another function, to be "called back" at a later time. Callbacks are the foundational mechanism for asynchronous programming in JavaScript — understanding them deeply is essential before moving to Promises and async/await.

---

## 1. What Are Callbacks?

A callback is simply a function you hand to another function so it can invoke it when appropriate:

```js
function greet(name, callback) {
  console.log("Hello, " + name);
  callback();
}

greet("Alice", function () {
  console.log("Greeting complete!");
});
// "Hello, Alice"
// "Greeting complete!"
```

The term "callback" describes the **role** of the function, not anything special about its syntax. Any function can be a callback — arrow functions, function expressions, named functions, or method references.

**Key insight:** When you pass a function as an argument, you're passing a *reference* — it isn't executed immediately. The receiving function decides *when* and *how* to call it.

---

## 2. Synchronous Callbacks

Synchronous callbacks are invoked **immediately** during the execution of the function that receives them. The outer function does not return until the callback has finished.

### `forEach` — execute for each element

```js
[1, 2, 3].forEach((n) => {
  console.log(n);
});
// 1, 2, 3 — all logged before forEach returns
```

### `map` — transform each element

```js
const doubled = [1, 2, 3].map((n) => n * 2);
// [2, 4, 6] — callback runs synchronously for each element
```

### `sort` comparator

```js
const nums = [3, 1, 2];
nums.sort((a, b) => a - b);
// [1, 2, 3] — comparator is called synchronously during sort
```

### `filter`, `reduce`, `find`, `every`, `some`

All of these accept synchronous callbacks. The callback is invoked once per element (or until early termination for `find`/`some`/`every`), and the method returns only after all invocations are complete.

```js
const evens = [1, 2, 3, 4].filter((n) => n % 2 === 0); // [2, 4]
const sum = [1, 2, 3].reduce((acc, n) => acc + n, 0); // 6
```

> Synchronous callbacks are conceptually simple — the code runs top-to-bottom, in order.

---

## 3. Asynchronous Callbacks

Asynchronous callbacks are **not** invoked immediately. They are scheduled to run *later* — after a timer expires, an event fires, an I/O operation completes, etc. The function that receives the callback returns *before* the callback executes.

### `setTimeout` / `setInterval`

```js
console.log("before");
setTimeout(() => {
  console.log("inside timeout"); // runs LATER, after the timer
}, 1000);
console.log("after");

// Output:
// "before"
// "after"
// "inside timeout"  (after ~1000ms)
```

Even with a delay of `0`, `setTimeout` is still asynchronous — the callback is placed on the task queue and runs after the current call stack clears:

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
// "1", "3", "2"
```

### Event listeners (browser)

```js
document.getElementById("btn").addEventListener("click", function () {
  console.log("Button clicked!"); // runs when the user clicks — not now
});
```

The callback is registered now, but executed later when the event fires. You have no control over *when* (or if) the user clicks.

### File reading (Node.js)

```js
const fs = require("fs");

fs.readFile("/path/to/file", "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read:", err);
    return;
  }
  console.log(data);
});
console.log("This logs BEFORE the file content");
```

### Network requests (XMLHttpRequest)

```js
function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error("Failed to load " + src));
  document.head.append(script);
}
```

This pattern — from [javascript.info](https://javascript.info/callbacks) — demonstrates how callbacks handle asynchronous loading with success/error paths.

---

## 4. Error-First Callback Convention (Node.js Style)

Node.js established the **error-first callback** (also called "errback") convention: the first parameter of the callback is reserved for an error object. If the operation succeeds, the first argument is `null` or `undefined`.

```js
function readConfig(path, callback) {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      callback(err, null); // pass the error
      return;
    }
    try {
      const config = JSON.parse(data);
      callback(null, config); // pass the result
    } catch (parseErr) {
      callback(parseErr, null);
    }
  });
}

// Usage:
readConfig("config.json", (err, config) => {
  if (err) {
    console.error("Failed:", err.message);
    return;
  }
  console.log("Config loaded:", config);
});
```

### Rules of the convention

1. **First argument is always `err`** — `null`/`undefined` if no error, an `Error` object if something went wrong.
2. **Subsequent arguments are success data** — only meaningful when `err` is falsy.
3. **Check `err` first** — always handle the error case before using the data.
4. **Call the callback exactly once** — never call it zero times (caller hangs) or more than once (double execution bugs).

This pattern is used by virtually all core Node.js APIs (`fs.readFile`, `http.get`, `child_process.exec`, etc.) and was the standard before Promises.

---

## 5. Callback Hell / Pyramid of Doom

When asynchronous operations depend on each other, callbacks nest deeper and deeper, creating what's known as **callback hell** or the **pyramid of doom**:

```js
loadScript("1.js", function (err, script) {
  if (err) {
    handleError(err);
    return;
  }
  loadScript("2.js", function (err, script) {
    if (err) {
      handleError(err);
      return;
    }
    loadScript("3.js", function (err, script) {
      if (err) {
        handleError(err);
        return;
      }
      // ...all scripts loaded, continue
    });
  });
});
```

**Problems with this pattern:**

- **Readability:** Code grows horizontally, making it hard to follow the logical flow.
- **Error handling:** Each level must independently check for errors — it's easy to forget one.
- **Maintainability:** Adding a step in the middle requires re-indenting everything below.
- **Variable scoping:** Deeply nested closures can accidentally shadow variables.

### Partial mitigation: named functions

You can flatten the pyramid by extracting named functions:

```js
function step1(err, script) {
  if (err) return handleError(err);
  loadScript("2.js", step2);
}

function step2(err, script) {
  if (err) return handleError(err);
  loadScript("3.js", step3);
}

function step3(err, script) {
  if (err) return handleError(err);
  // done
}

loadScript("1.js", step1);
```

This is more readable but still suffers from the fundamental issues of inversion of control and fragmented flow. This is one reason Promises were invented.

---

## 6. Inversion of Control Problem

When you pass a callback to a third-party function, **you hand over control** of when and how your code runs. You are trusting the receiving function to:

- Call the callback **exactly once** (not zero, not multiple times)
- Call it with the **correct arguments**
- Call it at the **right time** (not too early, not synchronously when you expect async)
- **Not swallow errors** that occur in the callback

```js
// You trust thirdPartyApi to call your callback correctly
thirdPartyApi.process(data, (err, result) => {
  // What if this gets called twice?
  // What if it never gets called?
  // What if it's called synchronously?
  updateDatabase(result);
});
```

**This is "inversion of control"** — instead of *you* controlling when your continuation code runs, you've inverted that control to someone else.

**Real-world bugs caused by this:**
- Payment processing callback fires twice → customer charged twice
- Callback never fires → UI hangs indefinitely with a loading spinner
- Callback fires synchronously → race condition with code that expected async execution

Promises solve this by giving control back to the caller via a `.then()` chain that is guaranteed to resolve or reject exactly once.

---

## 7. Why Callbacks Led to Promises

Callbacks have fundamental limitations that motivated the creation of Promises:

| Problem with Callbacks | How Promises Solve It |
|---|---|
| Callback hell / nesting | `.then()` chaining flattens the structure |
| Error handling at every level | Single `.catch()` handles errors from entire chain |
| Inversion of control | Promise resolves/rejects once — caller controls flow |
| No standardized API | Promises/A+ specification provides guarantees |
| Hard to compose | `Promise.all()`, `Promise.race()`, etc. |
| Sync/async ambiguity | Promises are always async (microtask queue) |
| Can't return values from async | `.then()` receives the resolved value |

```js
// Callback style
loadScript("1.js", (err, script) => {
  if (err) return handleError(err);
  loadScript("2.js", (err, script) => {
    if (err) return handleError(err);
    loadScript("3.js", (err, script) => {
      if (err) return handleError(err);
      // done
    });
  });
});

// Promise style (same logic, flat structure)
loadScript("1.js")
  .then(() => loadScript("2.js"))
  .then(() => loadScript("3.js"))
  .catch(handleError);
```

> Callbacks are not "bad" — they are the right tool for simple, single-level async (event listeners, `setTimeout`). But for sequential/parallel async workflows, Promises and async/await are strictly superior.

---

## 8. Common Gotchas

### Gotcha 1: Losing `this` when passing a method as a callback

```js
const user = {
  name: "Alice",
  greet() {
    console.log("Hello, " + this.name);
  },
};

setTimeout(user.greet, 100); // "Hello, undefined" — `this` is lost!

// Fixes:
setTimeout(() => user.greet(), 100); // arrow wrapper preserves `this`
setTimeout(user.greet.bind(user), 100); // explicit bind
```

When you pass `user.greet` as a callback, you're passing the **function reference** — the `user` context is not attached. The receiving function calls it as a plain function, so `this` is `undefined` (strict mode) or `globalThis`.

### Gotcha 2: Error handling — forgetting to check `err`

```js
fs.readFile("data.json", "utf8", (err, data) => {
  // BUG: forgot to check err!
  const parsed = JSON.parse(data); // data might be undefined → crash
});
```

Always check `err` first. A forgotten error check is one of the most common callback bugs.

### Gotcha 3: Calling the callback multiple times

```js
function fetchData(callback) {
  try {
    const result = riskyOperation();
    callback(null, result);
  } catch (err) {
    callback(err, null);
  }
  callback(null, "done"); // BUG: called again after catch!
}
```

Guard against this with a `called` flag or by using `return callback(...)`:

```js
function fetchData(callback) {
  try {
    const result = riskyOperation();
    return callback(null, result); // return prevents further execution
  } catch (err) {
    return callback(err, null);
  }
}
```

### Gotcha 4: Sync callback treated as async (Zalgo)

```js
function getData(key, callback) {
  if (cache[key]) {
    callback(cache[key]); // SYNC — called immediately
  } else {
    db.fetch(key, (data) => {
      cache[key] = data;
      callback(data); // ASYNC — called later
    });
  }
}
```

This is the "releasing Zalgo" anti-pattern — the callback is sometimes sync, sometimes async. Callers cannot reason about execution order. Fix by always being async:

```js
function getData(key, callback) {
  if (cache[key]) {
    setTimeout(() => callback(cache[key]), 0); // always async
  } else {
    db.fetch(key, (data) => {
      cache[key] = data;
      callback(data);
    });
  }
}
```

### Gotcha 5: Exception in callback crashes the caller

```js
function doWork(callback) {
  // ... do some work ...
  callback(null, result);
  // If callback throws, this function crashes too!
  cleanupResources(); // never reached
}
```

With callbacks, an exception in the callback propagates up into the calling function's stack. Promises isolate errors — a throw in `.then()` rejects the promise instead of crashing the caller.

---

## 9. Best Practices

1. **Always check errors first** — In error-first callbacks, handle `err` before touching data. Use early `return` to avoid else-nesting.

2. **Call the callback exactly once** — Use `return callback(...)` to prevent accidentally calling it again later in the function.

3. **Be consistently async** — If a function sometimes calls its callback synchronously and sometimes asynchronously, always wrap the sync path in `setTimeout` or `process.nextTick` to maintain consistent behavior.

4. **Name your callbacks** — Instead of anonymous inline functions, use named functions for better stack traces and readability.

5. **Keep nesting shallow** — Extract sequential steps into named functions. If nesting exceeds 2-3 levels, consider refactoring to Promises.

6. **Don't mix callbacks and Promises** — Pick one style per API. If you inherit a callback API, wrap it with a promisify utility.

7. **Use `bind` or arrow functions for `this`** — When passing methods as callbacks, explicitly bind the context.

8. **Document callback signatures** — Make it clear what arguments the callback receives and in what order (especially for error-first patterns).

9. **Use `try/catch` around the callback invocation** — In library code, consider wrapping callback invocations to prevent user errors from crashing your internals:

   ```js
   function safeInvoke(callback, err, data) {
     try {
       callback(err, data);
     } catch (e) {
       console.error("Callback threw:", e);
     }
   }
   ```

10. **Prefer Promises for new code** — Callbacks are still appropriate for simple event handlers and `setTimeout`, but for anything involving sequential async operations, use Promises or async/await.

---

## References

- [javascript.info — Introduction: callbacks](https://javascript.info/callbacks)
- [javascript.info — Introduction to browser events](https://javascript.info/introduction-browser-events)
- [MDN — Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)
- [MDN — Using Promises (motivation from callbacks)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Node.js — Error-first callbacks](https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks)
