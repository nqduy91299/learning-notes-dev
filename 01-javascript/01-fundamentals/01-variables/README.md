# Variables in JavaScript

## Variable Declarations

JavaScript has three keywords for declaring variables:

```js
var name = "Alice"; // function-scoped, hoisted, redeclarable
let age = 30; // block-scoped, TDZ, not redeclarable
const PI = 3.14159; // block-scoped, TDZ, not redeclarable, not reassignable
```

---

## `var` vs `let` vs `const`

| Feature               | `var`                         | `let`                     | `const`                   |
| --------------------- | ----------------------------- | ------------------------- | ------------------------- |
| Scope                 | Function (or global)          | Block                     | Block                     |
| Hoisted?              | Yes (initialized `undefined`) | Yes (uninitialized — TDZ) | Yes (uninitialized — TDZ) |
| Reassignable?         | Yes                           | Yes                       | No                        |
| Redeclarable?         | Yes (same scope)              | No                        | No                        |
| TDZ?                  | No                            | Yes                       | Yes                       |
| Attaches to `window`? | Yes (global scope)            | No                        | No                        |

### `var` and the Global Object (`globalThis`)

In non-module scripts, `var` at the top level creates a property on the global object (`window` in browsers, `globalThis` universally). `let` and `const` do not:

```js
var a = 1;
let b = 2;
const c = 3;

console.log(globalThis.a); // 1
console.log(globalThis.b); // undefined
console.log(globalThis.c); // undefined
```

This is another reason to avoid `var` — polluting the global object can cause name collisions with browser APIs or third-party libraries.

---

## Declaration vs Initialization

These terms come up often when discussing hoisting and TDZ. Be precise:

```js
let x = 42;
//  ↑   ↑
//  |   └── initializer (assigns a value)
//  └────── declaration (creates the variable)
```

- `var` and `let` can be declared without an initializer — the value defaults to `undefined`
- `const` **must** have an initializer — otherwise it's a `SyntaxError`:

```js
let a; // OK — a is undefined
var b; // OK — b is undefined
const c; // SyntaxError: Missing initializer in const declaration
const c = 1; // OK
```

---

## Hoisting

All three declarations are hoisted (the engine knows they exist before execution), but they behave differently:

### `var` — hoisted and initialized as `undefined`

```js
console.log(x); // undefined (no error!)
var x = 5;
console.log(x); // 5
```

The engine interprets this as:

```js
var x; // declaration hoisted, initialized to undefined
console.log(x); // undefined
x = 5; // assignment stays in place
console.log(x); // 5
```

### `let` / `const` — hoisted but NOT initialized

```js
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

The declaration is hoisted, but accessing it before the declaration line throws a `ReferenceError`. The variable exists in the scope, but it's in the **Temporal Dead Zone**.

### `var` hoisting from unreachable code

`var` declarations are hoisted even from code that **never executes**:

```js
function sayHi() {
    phrase = "Hello";

    if (false) {
        var phrase; // never runs, but still hoisted!
    }

    console.log(phrase); // "Hello"
}
```

The engine hoists `var phrase` to the top of the function regardless of the `if (false)` block. This does not apply to `let`/`const`.

---

## Temporal Dead Zone (TDZ)

The TDZ is the region between the start of a scope and the line where a `let`/`const` variable is declared. During this zone, the variable exists but cannot be accessed.

```js
{
    // --- TDZ for `message` starts here ---
    console.log(message); // ReferenceError
    // --- TDZ for `message` ends here ---
    let message = "hello";
    console.log(message); // "hello"
}
```

**Why does TDZ exist?** It catches bugs. Accessing a variable before it's declared is almost always a mistake. `var` silently gives you `undefined`, which leads to hard-to-find bugs.

### TDZ in `typeof`

```js
console.log(typeof undeclared); // "undefined" (no error for undeclared variables)
console.log(typeof tdzVariable); // ReferenceError!
let tdzVariable = 42;
```

This is one of the few cases where `typeof` can throw.

---

## Scope Rules

### `var` — function scope

`var` is scoped to the nearest **function** (or global if not in a function). It ignores block boundaries:

```js
function example() {
    if (true) {
        var x = 10;
    }
    console.log(x); // 10 — var escapes the if-block
}
```

### `let` / `const` — block scope

`let` and `const` are scoped to the nearest **block** (`{}`):

```js
function example() {
    if (true) {
        let x = 10;
    }
    console.log(x); // ReferenceError — x is not defined
}
```

### Module scope

In ES modules (files using `import`/`export`), top-level declarations are scoped to the **module**, not the global object. This applies to `var`, `let`, and `const`:

```js
// module-a.js
var x = 1; // NOT on globalThis — scoped to this module
let y = 2; // same
export const z = 3;

// module-b.js
console.log(x); // ReferenceError — x is not shared across modules
```

> In classic `<script>` tags (non-module), top-level `var` does attach to `window`. In `<script type="module">`, it does not.

### Classic `var`-in-loop gotcha

```js
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (all reference the same `i`, which is 3 after the loop)
```

Fix with `let`:

```js
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 (each iteration gets its own `i`)
```

`let` creates a **new binding per iteration**. `var` shares a single binding across all iterations.

---

## `const` Deep Dive

`const` makes the **binding** immutable, not the **value**.

```js
const name = "Alice";
name = "Bob"; // TypeError: Assignment to constant variable

const user = { name: "Alice" };
user.name = "Bob"; // OK — mutating the object, not reassigning the binding
user = {}; // TypeError — reassigning the binding

const arr = [1, 2, 3];
arr.push(4); // OK — [1, 2, 3, 4]
arr = [5, 6]; // TypeError
```

### Making values truly immutable

```js
const config = Object.freeze({ debug: true, version: "1.0" });
config.debug = false; // Silently fails (or throws in strict mode)
console.log(config.debug); // true
```

> `Object.freeze` is shallow. Nested objects are **not** frozen. Use a deep-freeze utility for nested structures.

---

## Naming Conventions

### Valid identifiers

- Must start with a letter, `_`, or `$`
- Can contain letters, digits, `_`, `$`
- Case-sensitive (`name` !== `Name`)
- Cannot be a reserved word (`let`, `class`, `return`, etc.)

```js
let _private = 1;      // valid
let $element = 2;      // valid
let camelCase = 3;     // valid — preferred style
let PascalCase = 4;    // valid — used for classes/constructors
let 2fast = 5;         // SyntaxError — cannot start with digit
```

### Conventions

| Style              | Use for                                 |
| ------------------ | --------------------------------------- |
| `camelCase`        | Variables, functions, methods           |
| `PascalCase`       | Classes, constructors, components       |
| `UPPER_SNAKE_CASE` | True constants (known at write-time)    |
| `_prefixed`        | Private-by-convention (older codebases) |

### When to use `UPPER_CASE` for constants

Use `UPPER_SNAKE_CASE` only for values **known before execution** (hard-coded). For constants that are **computed at runtime**, use regular `camelCase`:

```js
const COLOR_RED = "#F00"; // UPPER_CASE — hard-coded, known at write-time
const MAX_RETRIES = 3; // UPPER_CASE — hard-coded

const pageLoadTime = getTime(); // camelCase — computed at runtime
const apiResponse = fetch(url); // camelCase — runtime value
```

Both are `const` (the binding won't change), but the convention signals **intent**: uppercase means "this is a hard-coded alias I defined for readability."

### Name things right

Variable naming is one of the most important skills in programming. Good rules:

- **Use human-readable names** — `userName` over `u`, `shoppingCart` over `sc`
- **Avoid generic names** — `data`, `value`, `item`, `info` say nothing unless the context makes them obvious
- **Be descriptive and concise** — `currentUser` not `currentVisitorToOurWebsite`
- **Agree on terms with your team** — if a site visitor is a "user", use `currentUser` everywhere, not `currentVisitor` in some places
- **Don't reuse variables** for different purposes — create a new one instead. Modern minifiers handle this well

---

## Common Gotchas

### 1. Accidental globals

```js
// Sloppy mode (no "use strict")
function oops() {
    message = "hello"; // No declaration keyword — creates a global variable!
}
oops();
console.log(message); // "hello" — leaked to global scope

// Strict mode
("use strict");
function oopsStrict() {
    message = "hello"; // ReferenceError: message is not defined
}
```

Fix: always use `let`/`const`. Enable `"use strict"` (or use ES modules, which are strict by default) to catch these errors.

### 2. `const` without an initializer

```js
const x; // SyntaxError: Missing initializer in const declaration
```

Unlike `let` and `var`, `const` requires a value at declaration. This is because `const` forbids reassignment — an uninitialized `const` would be permanently `undefined`, which is almost certainly a bug.

### 2. `var` in loops (already covered above)

### 3. `const` doesn't mean immutable value

```js
const arr = [1, 2, 3];
arr.push(4); // This works! const protects the binding, not the contents.
```

### 4. TDZ in `switch` blocks

All `case` clauses share the same block scope:

```js
switch (action) {
    case "A":
        let x = 1; // declared here
        break;
    case "B":
        let x = 2; // SyntaxError: 'x' has already been declared
        break;
}
```

Fix: wrap each case in its own block:

```js
switch (action) {
    case "A": {
        let x = 1;
        break;
    }
    case "B": {
        let x = 2;
        break;
    }
}
```

### 5. Redeclaring `var` silently succeeds

```js
var x = 1;
var x = 2; // No error — x is now 2
```

With `let` or `const`, this is a `SyntaxError`.

---

## IIFE (Historical)

Before `let` and `const` existed, `var`'s lack of block scope was a real problem. Developers invented **Immediately Invoked Function Expressions (IIFE)** to create private scopes:

```js
// The problem: var has no block scope
{
    var secret = 42;
}
console.log(secret); // 42 — leaked!

// The old solution: IIFE
(function () {
    var secret = 42;
    // secret is scoped to this function
})();
console.log(secret); // ReferenceError — properly contained
```

Common IIFE patterns:

```js
(function () {
    /* ... */
})(); // parentheses around function
(function () {
    /* ... */
})(); // parentheses around the whole thing
!(function () {
    /* ... */
})(); // using ! operator
+(function () {
    /* ... */
})(); // using + operator
```

> **You don't need IIFE in modern JavaScript.** `let` and `const` provide block scoping natively. But you'll see IIFE in older codebases, bundler output, and legacy libraries — understanding why they exist helps you read and migrate old code.

---

## Best Practices

1. **Default to `const`** — use it unless you know you'll reassign
2. **Use `let` for reassignment** — loop counters, accumulators, swaps
3. **Never use `var`** — it has no advantages over `let`/`const` in modern JS
4. **Declare at the top of the scope** — makes TDZ obvious, improves readability
5. **One declaration per line** — easier to read, easier diffs
6. **Use `"use strict"`** — catches accidental globals and other silent errors

```js
// Preferred
const name = "Alice";
const age = 30;
let score = 0;

// Avoid
var name = "Alice",
    age = 30,
    score = 0;
```
