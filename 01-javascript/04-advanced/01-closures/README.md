# Closures — Deep Dive

> Scope fundamentals were covered in `01-javascript/01-fundamentals/01-06-scope`.
> This section goes deeper into **how** closures actually work at the engine level
> and the patterns/pitfalls that follow.

Sources: [javascript.info — Variable scope, closure](https://javascript.info/closure) |
[MDN — Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)

---

## 1. What Is a Closure?

A **closure** is the combination of a function **bundled together** with references to
its surrounding state — the **lexical environment** in which it was declared.

```js
function makeGreeter(greeting) {
  // `greeting` lives in makeGreeter's Lexical Environment
  return function (name) {
    // This inner function is a closure — it "closes over" `greeting`
    return `${greeting}, ${name}!`;
  };
}

const hello = makeGreeter("Hello");
hello("Alice"); // "Hello, Alice!"
hello("Bob");   // "Hello, Bob!"
```

In JavaScript **every** function is a closure (with one exception: functions created
via `new Function(...)` have their `[[Environment]]` set to the global scope, not
the enclosing one).

---

## 2. Lexical Environment Recap

Every running function, code block `{ }`, and the script as a whole have an
internal object called a **Lexical Environment**. It has two parts:

| Part | Description |
|------|-------------|
| **Environment Record** | An object that stores all local variables (and `this`, function declarations, etc.) as properties. |
| **`[[OuterEnv]]`** (spec: `outer`) | A reference to the Lexical Environment of the enclosing scope. The global environment's outer reference is `null`. |

### Variable lifecycle inside a Lexical Environment

1. When execution enters a block/function, all `let`/`const` bindings are known
   but **uninitialized** (the "Temporal Dead Zone").
2. The binding becomes available when execution reaches the declaration.
3. `var` declarations are hoisted and initialized to `undefined` at the start of
   the function (or global) scope — they ignore block boundaries.
4. **Function Declarations** are fully initialized at the moment the Lexical
   Environment is created (hoisted with their body).

```js
function demo() {
  // console.log(x); // ReferenceError — TDZ
  let x = 10;
  console.log(x); // 10
}
```

---

## 3. How Closures Work — Step by Step

### The `makeCounter` example (from javascript.info)

```js
function makeCounter() {
  let count = 0;

  return function () {
    return count++;
  };
}

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2
```

**Step-by-step:**

1. **`makeCounter()` is called.** A new Lexical Environment is created:
   ```
   makeCounter LexEnv: { count: 0 }  -->  outer: global LexEnv
   ```

2. **The inner function is created.** It receives a hidden property
   `[[Environment]]` that points to the current Lexical Environment
   (`{ count: 0 }`).

3. **`makeCounter` returns.** Normally `{ count: 0 }` would be garbage-collected,
   but the returned function still references it via `[[Environment]]`, so it
   stays alive.

4. **`counter()` is called.** A new (empty) Lexical Environment is created for
   the call. Its `[[OuterEnv]]` is taken from `counter.[[Environment]]`
   = `{ count: 0 }`.

5. **Variable lookup:** The engine searches for `count` — not in the local
   environment (empty), so it follows `[[OuterEnv]]` and finds `count` in the
   `makeCounter` environment. It reads `0`, then increments it to `1`.

6. **Next call:** Same process — `count` is now `1`, returns `1`, increments to `2`.

> **Key insight:** The variable is updated *in the Lexical Environment where it
> lives*, not copied. All closures that share the same environment see the same
> mutable binding.

---

## 4. Practical Uses

### 4.1 Data Privacy / Encapsulation

```js
function createPerson(name) {
  let _age = 0; // truly private — not on any object
  return {
    getName: () => name,
    getAge: () => _age,
    birthday: () => { _age++; },
  };
}

const p = createPerson("Alice");
p.birthday();
p.getAge(); // 1
// p._age   → undefined (private!)
```

### 4.2 Factory Functions

```js
function createMultiplier(factor) {
  return (n) => n * factor;
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
double(5); // 10
triple(5); // 15
```

### 4.3 Partial Application

```js
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs);
}
const add = (a, b) => a + b;
const add10 = partial(add, 10);
add10(5); // 15
```

### 4.4 Event Handlers

```js
function setupButton(buttonId, message) {
  // `message` is captured by the handler closure
  document.getElementById(buttonId).addEventListener("click", () => {
    alert(message);
  });
}
```

### 4.5 Iterators

```js
function range(start, end) {
  let current = start;
  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}
const it = range(1, 3);
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }
```

---

## 5. Closures in Loops — The Classic `var` Problem

### The bug

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 (NOT 0, 1, 2)
```

**Why?** `var` is function-scoped (or global). All three arrow functions close
over the **same** `i`. By the time the timeouts fire, the loop has finished and
`i === 3`.

### Fix 1: Use `let` (block-scoped)

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2
// `let` creates a *new* binding of `i` for each loop iteration.
```

### Fix 2: IIFE (pre-ES6 pattern)

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Each IIFE creates its own scope with `j` = current `i`.
```

---

## 6. IIFE as a Historical Closure Pattern

Before `let`/`const` and ES modules, the **Immediately Invoked Function
Expression** was the primary way to create private scope:

```js
const myLib = (function () {
  let privateState = 0;

  function privateHelper() {
    return privateState++;
  }

  return {
    next: () => privateHelper(),
    reset: () => { privateState = 0; },
  };
})();

myLib.next();  // 0
myLib.next();  // 1
myLib.reset();
myLib.next();  // 0
```

Today, ES modules and block-scoped `let`/`const` have largely replaced IIFEs,
but you'll still see them in legacy code and UMD bundles.

---

## 7. Closure and Memory

### Why closures can retain memory

A closure's `[[Environment]]` keeps the **entire** Lexical Environment object
alive as long as the closure itself is reachable. This means **all** variables
declared in that scope are retained, not just the ones the closure actually uses.

```js
function heavy() {
  const bigArray = new Array(1_000_000).fill("x");
  const small = 42;

  return () => small; // only uses `small`, but `bigArray` may also be retained
}

const fn = heavy();
// `bigArray` *may* stay in memory (engine-dependent — see below)
```

### V8 optimization

Modern engines like V8 analyze which outer variables a closure actually
references. If `bigArray` is never used by any surviving closure, V8 can
garbage-collect it even though it was in the same scope. However, if you use
`eval()` inside the closure, the engine cannot optimize, and **everything** is
retained.

### Releasing closures

```js
let fn = heavy();
fn = null; // now the closure is unreachable → GC can collect the entire environment
```

**Rule of thumb:** If a closure is long-lived (event handler, timer, cached
function), make sure it doesn't inadvertently keep large objects alive.

---

## 8. Stale Closures

A **stale closure** captures a variable at a point in time and never sees
subsequent updates.

### Classic example

```js
function createStale() {
  let value = "initial";

  const getCached = () => value; // captures current binding

  value = "updated";
  return getCached;
}

createStale()(); // "updated" — NOT stale here because it's the same binding
```

The real danger is when the closure captures a **copy** (primitive snapshot) or
when the environment is re-created but the old closure is still used:

### React `useEffect` gotcha (preview)

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // always 0 — stale closure!
      // `count` is the value from the render when the effect was created
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps → effect never re-runs → closure never refreshed
}
```

**Fix:** Include `count` in the dependency array, or use a ref to hold the
mutable latest value:

```jsx
const countRef = useRef(count);
countRef.current = count; // update ref every render

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // always fresh
  }, 1000);
  return () => clearInterval(id);
}, []);
```

---

## 9. Module Pattern Using Closures

Before ES modules, the module pattern was the standard encapsulation technique:

```js
const BankAccount = (function () {
  // Private shared utility
  function validate(amount) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid amount");
    }
  }

  // Factory (public API)
  return function createAccount(owner, initial = 0) {
    let balance = initial;
    const history = [];

    return {
      deposit(amount) {
        validate(amount);
        balance += amount;
        history.push({ type: "deposit", amount });
      },
      withdraw(amount) {
        validate(amount);
        if (amount > balance) throw new Error("Insufficient funds");
        balance -= amount;
        history.push({ type: "withdraw", amount });
      },
      getBalance: () => balance,
      getHistory: () => [...history], // return copy
      getOwner: () => owner,
    };
  };
})();

const acct = BankAccount("Alice", 100);
acct.deposit(50);
acct.getBalance(); // 150
// acct.balance → undefined (private!)
```

---

## 10. Common Gotchas

### 10.1 `var` in loops (covered in section 5)

All closures share one binding. Use `let` or an IIFE.

### 10.2 Shared mutable state

```js
function makeTwo() {
  let shared = 0;
  const inc = () => ++shared;
  const dec = () => --shared;
  return { inc, dec };
}

const { inc, dec } = makeTwo();
inc(); // 1
inc(); // 2
dec(); // 1 — both functions mutate the same `shared`
```

This is a feature (data privacy), but be careful: if you expect independent
state, you need **separate** closure scopes.

### 10.3 Memory leaks with closures holding DOM references

```js
function setupHandler(element) {
  const heavyData = loadLargeDataset(); // captured in closure

  element.addEventListener("click", () => {
    process(heavyData);
  });

  // Even if `element` is removed from the DOM, if the listener is not removed,
  // both the closure AND `heavyData` remain in memory.
}
```

**Fix:** Remove event listeners when elements are removed, or use
`{ once: true }` / `AbortController`.

### 10.4 Accidental closure over loop variable in async code

```js
const urls = ["/a", "/b", "/c"];

// Bug: if `var` were used instead of `const`/`let`
for (const url of urls) {
  fetch(url).then(() => console.log(url)); // safe with const/let
}
```

---

## 11. Best Practices

1. **Prefer `let`/`const` over `var`** — eliminates the loop-closure class of
   bugs entirely.

2. **Keep closures lean** — avoid capturing large objects you don't need. Extract
   only the values you require before creating the closure.

3. **Clean up long-lived closures** — remove event listeners, clear intervals/
   timeouts, and nullify references when done.

4. **Be explicit about shared vs. separate state** — if two closures should be
   independent, create them from separate function calls.

5. **Avoid `eval` inside closures** — it prevents the engine from optimizing away
   unused captured variables.

6. **Use the module pattern (or ES modules) for encapsulation** — closures are
   the mechanism, modules are the ergonomic API.

7. **Watch for stale closures in React** — always verify your `useEffect` /
   `useCallback` / `useMemo` dependency arrays.

8. **Name your closures** when debugging — named function expressions show up in
   stack traces:
   ```js
   const counter = makeCounter();
   // Better:
   return function increment() { return count++; };
   // Worse:
   return function () { return count++; };
   ```

9. **Test closure behavior** — write unit tests that verify state isolation
   between independent closure instances.

10. **Document captured variables** — when a closure captures non-obvious outer
    state, leave a comment explaining what is captured and why.
