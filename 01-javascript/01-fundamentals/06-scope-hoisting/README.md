# Scope & Hoisting

Scope controls **where** variables are accessible. Hoisting controls **when** they become available during execution. Together, they form the foundation of JavaScript's variable resolution system.

---

## 1. What is Scope?

**Scope** is the region of code where a variable, function, or expression can be referenced. If an identifier isn't in the current scope, it's unavailable.

JavaScript has the following kinds of scopes:

| Scope Type | Created By | `var` | `let`/`const` |
|------------|-----------|-------|---------------|
| Global scope | Top-level code (scripts) | Yes | Yes |
| Module scope | ES modules | Yes | Yes |
| Function scope | Function declaration/expression | Yes | Yes |
| Block scope | `{}`, `if`, `for`, `while`, `switch` | **No** | Yes |

---

## 2. Global Scope

Variables declared at the top level (outside any function or block) live in the **global scope** and are accessible everywhere in the script.

```js
const appName = "MyApp"; // global scope

function greet() {
  console.log(appName); // accessible here
}

if (true) {
  console.log(appName); // accessible here too
}
```

### `var` attaches to `globalThis`

In browser scripts (non-module), `var` declarations and function declarations at the top level become properties of the global object (`window` / `globalThis`). `let` and `const` do not.

```js
var gVar = 5;
let gLet = 10;

console.log(globalThis.gVar); // 5
console.log(globalThis.gLet); // undefined — not attached
```

> In Node.js modules and ES modules, even `var` doesn't attach to `globalThis` because the code runs in module scope, not global scope.

---

## 3. Function Scope

`var` is **function-scoped** — it's visible throughout the entire function it's declared in, regardless of blocks.

```js
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 — var ignores block boundaries
}

example();
console.log(x); // ReferenceError — var IS limited by functions
```

`var` pierces through `if`, `for`, `while`, and other block statements, but **not** through function boundaries.

```js
for (var i = 0; i < 3; i++) {
  // ...
}
console.log(i); // 3 — i leaked out of the for block
```

---

## 4. Block Scope

`let` and `const` are **block-scoped** — they exist only within the nearest enclosing `{}`.

```js
{
  let a = 1;
  const b = 2;
  console.log(a, b); // 1 2
}
console.log(a); // ReferenceError: a is not defined
console.log(b); // ReferenceError: b is not defined
```

Block scope applies to `if`, `for`, `while`, `switch`, and standalone `{}` blocks:

```js
if (true) {
  let scoped = "only here";
}
console.log(scoped); // ReferenceError

for (let i = 0; i < 3; i++) {
  // each iteration gets its own `i`
}
console.log(i); // ReferenceError
```

> `for (let i = ...)` creates a **new binding of `i` for each iteration**. This is critical for closures in loops (see Section 12).

---

## 5. Lexical Scope (Static Scope)

JavaScript uses **lexical scoping** (also called static scoping): the scope of a variable is determined by its position in the source code at **write-time**, not at **runtime**.

Inner functions can access variables from their outer (enclosing) functions:

```js
function outer() {
  const message = "hello";

  function inner() {
    console.log(message); // "hello" — resolved from outer scope
  }

  inner();
}
```

The key insight: it doesn't matter **where** a function is called — it matters **where** it was **defined**.

```js
function makeGreeter() {
  const name = "Pete";
  return function () {
    console.log(name);
  };
}

const name = "John";
const greeter = makeGreeter();
greeter(); // "Pete" — not "John", because lexical scope follows definition
```

---

## 6. Lexical Environment (The Internal Mechanism)

Every execution context (script, function call, block) has an associated **Lexical Environment** — a spec-level object with two parts:

```
┌─────────────────────────────────────┐
│       Lexical Environment           │
├─────────────────────────────────────┤
│  Environment Record                 │
│  ┌───────────────────────────────┐  │
│  │ variable1: value1             │  │
│  │ variable2: value2             │  │
│  │ ...                           │  │
│  └───────────────────────────────┘  │
│                                     │
│  [[OuterEnv]] ──────────────────────┼──→ (parent Lexical Environment)
└─────────────────────────────────────┘
```

1. **Environment Record** — stores all local variables, function declarations, and parameters as properties.
2. **`[[OuterEnv]]` reference** — points to the lexical environment of the enclosing scope. The global environment's outer reference is `null`.

### How it works step by step

```js
let phrase = "Hello";

function say(name) {
  console.log(`${phrase}, ${name}`);
}

say("John"); // "Hello, John"
```

When `say("John")` executes:
1. A **new Lexical Environment** is created for the call with `{ name: "John" }`.
2. Its `[[OuterEnv]]` points to the **global Lexical Environment** containing `{ phrase: "Hello", say: function }`.
3. When `phrase` is needed, the engine searches the local environment first, doesn't find it, follows `[[OuterEnv]]` to global, and finds `"Hello"`.

### Function declarations are instantly initialized

When a Lexical Environment is created, **Function Declarations** are immediately available (fully initialized). This is why you can call a function before its declaration line.

`let`/`const` variables start in an **"uninitialized"** state until their declaration is reached (see TDZ, Section 9).

---

## 7. Scope Chain

When the engine needs to resolve a variable, it walks the **scope chain** — a linked list of Lexical Environments from innermost to outermost:

```
inner env  →  outer env  →  ...  →  global env  →  null
```

```js
const a = "global";

function outer() {
  const b = "outer";

  function middle() {
    const c = "middle";

    function inner() {
      console.log(a); // found in global env
      console.log(b); // found in outer env
      console.log(c); // found in middle env
      console.log(d); // ReferenceError — not found anywhere
    }

    inner();
  }

  middle();
}
```

**Lookup rules:**
1. Search the current Environment Record.
2. If not found, follow `[[OuterEnv]]` to the parent and search there.
3. Repeat until reaching the global environment.
4. If still not found: `ReferenceError` in strict mode; in sloppy mode, assignment creates a global variable (accidental global).

---

## 8. Hoisting

**Hoisting** is the behavior where declarations appear to be moved to the top of their scope before code execution. In reality, during the **creation phase**, the engine registers all declarations in the Environment Record — but different declarations are initialized differently.

### Hoisting behavior by declaration type

| Declaration | Hoisted? | Initialized to | Usable before declaration? |
|------------|----------|----------------|---------------------------|
| `var` | Yes | `undefined` | Yes (value is `undefined`) |
| `let` | Yes (registered) | Uninitialized (TDZ) | No — `ReferenceError` |
| `const` | Yes (registered) | Uninitialized (TDZ) | No — `ReferenceError` |
| `function` declaration | Yes | **Fully initialized** | Yes — fully callable |
| `function` expression | Follows `var`/`let`/`const` rules | Depends on keyword | Depends on keyword |
| `class` | Yes (registered) | Uninitialized (TDZ) | No — `ReferenceError` |

### `var` hoisting

The declaration is hoisted, but the **assignment stays in place**:

```js
console.log(x); // undefined (not ReferenceError!)
var x = 5;
console.log(x); // 5

// Equivalent to:
var x;            // declaration hoisted
console.log(x);  // undefined
x = 5;           // assignment stays
console.log(x);  // 5
```

### Function declaration hoisting

Function declarations are **fully hoisted** — both the name and the body:

```js
greet(); // "Hello!" — works before declaration

function greet() {
  console.log("Hello!");
}
```

### Function expression — NOT hoisted as a function

```js
greet(); // TypeError: greet is not a function

var greet = function () {
  console.log("Hello!");
};

// With var, `greet` is hoisted as undefined, so calling it throws TypeError.
// With let/const, `greet` would be in TDZ, so you'd get ReferenceError.
```

### `let`/`const` — the Temporal Dead Zone (see next section)

```js
console.log(x); // ReferenceError: Cannot access 'x' before initialization
let x = 10;
```

---

## 9. Temporal Dead Zone (TDZ)

The **TDZ** is the region from the start of a scope to the point where a `let`, `const`, or `class` declaration is reached. During this zone, the variable exists in the Environment Record (it's been registered/hoisted) but is in an **uninitialized** state — any access throws a `ReferenceError`.

```js
{
  // TDZ for `x` starts here ──────────────┐
  console.log(x); // ReferenceError        │
  //                                        │ TDZ
  let x = 10;  // TDZ ends here ───────────┘
  console.log(x); // 10
}
```

### Why does TDZ exist?

TDZ proves that `let`/`const` **are** hoisted (just not initialized). Without hoisting, the inner `x` wouldn't shadow the outer `x`, and the first `console.log` would read the outer scope:

```js
const x = "outer";
{
  console.log(x); // ReferenceError — NOT "outer"!
  const x = "inner"; // This declaration's hoisting causes the TDZ
}
```

The engine knows about the inner `x` from the start of the block, so it shadows the outer `x` immediately — but it's uninitialized, hence the error.

### TDZ applies to

- `let` declarations
- `const` declarations
- `class` declarations
- Default parameter values (can't reference a later parameter)

```js
// TDZ in default parameters:
function foo(a = b, b = 1) {} // ReferenceError: Cannot access 'b' before initialization
foo();
```

---

## 10. Variable Shadowing

When an inner scope declares a variable with the same name as one in an outer scope, the inner variable **shadows** (hides) the outer one:

```js
const x = "outer";

function example() {
  const x = "inner"; // shadows the outer x
  console.log(x);    // "inner"
}

example();
console.log(x); // "outer" — outer x is unaffected
```

### `var` can shadow `let`, but not vice versa

```js
function test() {
  let x = 1;
  if (true) {
    let x = 2; // OK — different block scope, shadows outer let
    console.log(x); // 2
  }
  console.log(x); // 1
}
```

### Shadowing pitfall

Accidentally shadowing can cause hard-to-find bugs:

```js
let count = 0;

function increment() {
  let count = 0; // oops — shadows the outer count!
  count++;
  console.log(count); // always 1
}

increment();
increment();
console.log(count); // still 0 — outer count was never touched
```

---

## 11. Closures (Brief Intro)

A **closure** is a function bundled together with references to its surrounding lexical environment. In JavaScript, **every function is a closure** — it automatically remembers the Lexical Environment where it was created via the hidden `[[Environment]]` property.

```js
function makeCounter() {
  let count = 0;

  return function () {
    return count++; // accesses `count` from outer scope
  };
}

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2
// `count` persists because the returned function holds a reference to its lexical environment
```

Each call to `makeCounter()` creates a **new** Lexical Environment with its own `count`:

```js
const counter1 = makeCounter();
const counter2 = makeCounter();

counter1(); // 0
counter1(); // 1
counter2(); // 0 — independent!
```

> **Deep dive on closure patterns** (practical uses, data privacy, partial application, pitfalls, memory considerations) is covered in **Chapter 04-01: Closures**.

---

## 12. Common Gotchas

### Gotcha 1: `var` in loops

Because `var` is function-scoped, all iterations of a loop share the **same** variable:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 3, 3, 3 — not 0, 1, 2!
// All closures reference the same `i`, which is 3 after the loop
```

**Fix:** Use `let`, which creates a new binding per iteration:

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 0, 1, 2
```

### Gotcha 2: TDZ and `typeof`

Normally `typeof` returns `"undefined"` for undeclared variables, but it throws for TDZ variables:

```js
console.log(typeof undeclaredVar); // "undefined" — safe

console.log(typeof myLet); // ReferenceError!
let myLet = 10;
```

### Gotcha 3: Function declarations inside blocks

Function declarations inside blocks (`if`, `for`, etc.) have **inconsistent behavior** across environments. The behavior is non-standard in sloppy mode:

```js
// Non-standard behavior — avoid this pattern!
if (true) {
  function foo() {
    return "a";
  }
} else {
  function foo() {
    return "b";
  }
}
// The result of foo() varies by engine and strict/sloppy mode
```

**Best practice:** Use function expressions inside blocks instead:

```js
let foo;
if (true) {
  foo = function () { return "a"; };
} else {
  foo = function () { return "b"; };
}
```

### Gotcha 4: Accidental globals

Assigning to an undeclared variable in sloppy mode creates a global variable:

```js
function oops() {
  accidental = "I'm global now!"; // no let/const/var — creates global!
}
oops();
console.log(accidental); // "I'm global now!"
```

Use `"use strict"` or ES modules to catch this as a `ReferenceError`.

---

## 13. Best Practices

1. **Avoid `var`** — use `const` by default, `let` when reassignment is needed. `var`'s function-scoping and hoisting cause bugs.

2. **Minimize global scope** — keep the global namespace clean. Use modules, IIFEs, or block scoping to limit visibility.

3. **Declare variables at the top of their scope** — even though `let`/`const` have TDZ protection, declaring at the top improves readability and avoids confusion.

4. **Use `const` by default** — makes intent clear and prevents accidental reassignment.

5. **Use `let` in loops** — especially when closures are involved (`for` loops with callbacks/timers).

6. **Use strict mode or ES modules** — prevents accidental globals and enables consistent block-scoped function declarations.

7. **Don't shadow variables unnecessarily** — if you reuse a name, make sure it's intentional.

---

## References

- [javascript.info — Variable scope, closure](https://javascript.info/closure)
- [javascript.info — The old "var"](https://javascript.info/var)
- [javascript.info — Global object](https://javascript.info/global-object)
- [MDN — Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [MDN — Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [MDN — Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
