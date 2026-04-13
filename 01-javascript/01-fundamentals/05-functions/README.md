# Functions in JavaScript

Functions are the main building blocks of a program. They allow code to be called many times without repetition. JavaScript offers three ways to create functions: **declarations**, **expressions**, and **arrow functions**.

---

## 1. Function Declarations

A function declaration uses the `function` keyword followed by a name, parameters, and a body:

```js
function greet(name) {
  return `Hello, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
```

### Hoisting

Function declarations are **hoisted** — they are processed before the code runs, so you can call them before the declaration appears in the source:

```js
sayHi(); // Works! "Hi!"

function sayHi() {
  console.log("Hi!");
}
```

This works because the JavaScript engine scans for all function declarations during the initialization phase and creates them before executing any code.

> **Block scope (strict mode):** In strict mode, a function declaration inside a block `{}` is only visible within that block.

---

## 2. Function Expressions

A function expression creates a function as part of an expression, typically by assigning it to a variable:

```js
const greet = function(name) {
  return `Hello, ${name}!`;
};

greet("Bob"); // "Hello, Bob!"
```

### NOT hoisted

Function expressions are created when execution reaches them. Calling one before its definition causes a `ReferenceError`:

```js
sayHi("John"); // ReferenceError: Cannot access 'sayHi' before initialization

const sayHi = function(name) {
  console.log(`Hello, ${name}`);
};
```

### Named function expressions

You can give a function expression a name. The name is only accessible inside the function itself (useful for recursion and debugging):

```js
const factorial = function fac(n) {
  return n < 2 ? 1 : n * fac(n - 1);
};

factorial(5); // 120
// fac(5);    // ReferenceError — fac is not accessible outside
```

### Semicolons

Function declarations don't need a trailing `;` because they are statements. Function expressions are typically part of an assignment statement (`let f = ...;`), so the `;` follows the assignment, not the function.

---

## 3. Arrow Functions

Arrow functions provide a shorter syntax for function expressions. Introduced in ES6.

### Syntax variations

```js
// Multiple parameters, block body
const add = (a, b) => {
  return a + b;
};

// Multiple parameters, concise body (implicit return)
const sum = (a, b) => a + b;

// Single parameter — parentheses optional
const double = n => n * 2;

// No parameters — parentheses required
const greet = () => "Hello!";
```

### Concise vs block body

- **Concise body** (no `{}`): the expression after `=>` is implicitly returned.
- **Block body** (with `{}`): you must use an explicit `return` statement, or the function returns `undefined`.

```js
const implicit = (x) => x * 2;     // returns x * 2
const explicit = (x) => { x * 2 }; // returns undefined! (missing return)
```

---

## 4. Arrow Functions vs Regular Functions

Arrow functions are not just shorter syntax — they behave differently in several important ways:

| Feature            | Regular function          | Arrow function            |
|--------------------|---------------------------|---------------------------|
| Own `this`         | Yes (depends on call-site)| No (inherits from enclosing scope) |
| `arguments` object | Yes                       | No                        |
| Can use `new`      | Yes (constructors)        | No (`TypeError`)          |
| Has `prototype`    | Yes                       | No                        |
| `super` binding    | Own binding               | Inherits from enclosing   |

### No own `this`

Arrow functions capture `this` from their surrounding lexical scope at creation time:

```js
function Timer() {
  this.seconds = 0;

  // Arrow function inherits `this` from Timer
  setInterval(() => {
    this.seconds++; // `this` refers to the Timer instance
  }, 1000);
}

// With a regular function, `this` would be the global object (or undefined in strict mode):
function TimerBroken() {
  this.seconds = 0;
  setInterval(function() {
    this.seconds++; // `this` is NOT the TimerBroken instance!
  }, 1000);
}
```

### No `arguments` object

```js
function regular() {
  console.log(arguments); // [Arguments] { '0': 1, '1': 2, '2': 3 }
}
regular(1, 2, 3);

const arrow = () => {
  // console.log(arguments); // ReferenceError (or inherits from enclosing function)
};
```

### Cannot be used as constructors

```js
const Foo = () => {};
// new Foo(); // TypeError: Foo is not a constructor
```

---

## 5. Default Parameters

Default values are used when an argument is `undefined` (or omitted):

```js
function greet(name = "World") {
  return `Hello, ${name}!`;
}

greet();          // "Hello, World!"   — undefined triggers default
greet(undefined); // "Hello, World!"   — undefined triggers default
greet(null);      // "Hello, null!"    — null does NOT trigger default
greet("");        // "Hello, !"        — empty string does NOT trigger default
greet(0);         // "Hello, 0!"       — 0 does NOT trigger default
```

### Expressions as defaults

Default values are evaluated at call time, only when needed:

```js
function createId(prefix = "id", num = Math.random()) {
  return `${prefix}_${num}`;
}

createId();       // "id_0.7231..." — Math.random() called
createId("usr");  // "usr_0.4812..." — Math.random() called again (new value)
```

### Later parameters can reference earlier ones

```js
function greet(name, greeting = `Hello, ${name}`) {
  return greeting;
}

greet("Alice"); // "Hello, Alice"
```

---

## 6. Rest Parameters (`...args`)

Rest parameters collect all remaining arguments into a real array:

```js
function sum(first, ...rest) {
  let total = first;
  for (const num of rest) {
    total += num;
  }
  return total;
}

sum(1, 2, 3, 4); // 10 — first=1, rest=[2, 3, 4]
```

Rules:
- The rest parameter must be the **last** parameter.
- There can only be **one** rest parameter per function.
- `rest` is a real `Array` (unlike `arguments`).

```js
function logAll(...args) {
  console.log(Array.isArray(args)); // true
  console.log(args.length);
}
```

---

## 7. The `arguments` Object

Available in regular functions (not arrow functions). It's an **array-like** object containing all passed arguments:

```js
function showArgs() {
  console.log(arguments.length);  // number of arguments
  console.log(arguments[0]);      // first argument
  // arguments.map(...)           // TypeError — not a real array!
}

showArgs("a", "b", "c"); // length: 3, first: "a"
```

### Converting to a real array

```js
function example() {
  const args = Array.from(arguments);
  // or: const args = [...arguments];
  return args.map(x => x.toUpperCase());
}
```

### Not available in arrow functions

Arrow functions do not have their own `arguments`. If used inside a regular function, they inherit the outer function's `arguments`:

```js
function outer() {
  const inner = () => {
    console.log(arguments); // inherits from outer()
  };
  inner();
}
outer(1, 2, 3); // [Arguments] { '0': 1, '1': 2, '2': 3 }
```

> **Best practice:** Prefer rest parameters (`...args`) over `arguments`. Rest params give you a real array and work in arrow functions.

---

## 8. Return Values

### Implicit `undefined`

A function without a `return` statement (or with a bare `return`) returns `undefined`:

```js
function noReturn() {
  // no return
}

function bareReturn() {
  return;
}

noReturn();   // undefined
bareReturn(); // undefined
```

### Arrow function implicit return

Arrow functions with a concise body (no `{}`) automatically return the expression:

```js
const double = n => n * 2;  // returns n * 2
double(5); // 10
```

But with curly braces, you must use `return`:

```js
const double = n => { n * 2 };  // returns undefined!
const fix    = n => { return n * 2 };  // returns n * 2
```

### Newline after `return`

JavaScript inserts a semicolon after `return` if followed by a newline. This silently breaks your code:

```js
function broken() {
  return        // ← JS inserts semicolon here → return;
    { key: 42 };  // this is unreachable
}
broken(); // undefined!

// Fix: start the expression on the same line, or use parentheses
function fixed() {
  return (
    { key: 42 }
  );
}
fixed(); // { key: 42 }
```

---

## 9. Callback Functions

A callback is a function passed as an argument to another function, to be "called back" later:

```js
function ask(question, onYes, onNo) {
  if (confirm(question)) onYes();
  else onNo();
}

ask(
  "Do you agree?",
  () => console.log("You agreed."),
  () => console.log("You canceled.")
);
```

Callbacks are foundational to JavaScript — used in event listeners, array methods, timers, promises, and more:

```js
[1, 2, 3].map(n => n * 2);           // [2, 4, 6]
setTimeout(() => console.log("!"), 1000);
button.addEventListener("click", () => { /* ... */ });
```

---

## 10. Function Naming

Functions are actions, so names should typically start with a **verb**:

| Prefix     | Meaning                        | Example            |
|------------|--------------------------------|--------------------|
| `get...`   | Return a value                 | `getUser()`        |
| `calc...`  | Calculate and return a result  | `calcTotal()`      |
| `create...`| Create and return something    | `createForm()`     |
| `check...` | Check and return a boolean     | `checkPermission()`|
| `show...`  | Display something              | `showMessage()`    |
| `is...`    | Return a boolean (state check) | `isEmpty()`        |
| `has...`   | Return a boolean (presence)    | `hasAccess()`      |
| `validate.`| Validate input                 | `validateEmail()`  |

A function name should clearly describe what it does. Reading a call like `checkPermission(user)` should immediately tell you what's happening.

---

## 11. One Function — One Action

A function should do exactly what its name suggests, and nothing more:

- `getAge()` should **not** display an alert (side effect — it should only *get*).
- `createForm()` should **not** add the form to the document (it should only *create and return*).
- `checkPermission()` should **not** show a "granted/denied" message (it should only *check and return*).

If a function does too much, split it into smaller functions. Small functions are easier to test, debug, and reason about. Their very existence serves as documentation.

---

## 12. Common Gotchas

### Gotcha 1: Arrow function returning object literal

Parentheses are needed because `{}` is interpreted as a block body, not an object:

```js
const getObj = () => { name: "Alice" };   // undefined! (label syntax, no return)
const fix    = () => ({ name: "Alice" }); // { name: "Alice" } (wrapped in parens)
```

### Gotcha 2: `arguments` in arrow functions

Arrow functions don't have their own `arguments`. Using it either throws a `ReferenceError` or (if inside a regular function) accesses the outer function's `arguments`:

```js
const fn = () => {
  console.log(arguments); // ReferenceError or inherits from outer
};
// Fix: use rest parameters
const fn = (...args) => {
  console.log(args); // real array
};
```

### Gotcha 3: Hoisting difference

```js
// Works — function declarations are hoisted
console.log(add(1, 2)); // 3
function add(a, b) { return a + b; }

// Fails — function expressions are NOT hoisted
console.log(sub(3, 1)); // ReferenceError
const sub = function(a, b) { return a - b; };
```

### Gotcha 4: `this` in arrow function as method

```js
const obj = {
  name: "Alice",
  greet: () => {
    return `Hello, ${this.name}`; // `this` is NOT obj — it's the enclosing scope
  },
};
obj.greet(); // "Hello, undefined"

// Fix: use a regular function for methods
const obj2 = {
  name: "Alice",
  greet() {
    return `Hello, ${this.name}`;
  },
};
obj2.greet(); // "Hello, Alice"
```

### Gotcha 5: Missing return in block-body arrow

```js
const nums = [1, 2, 3];
const doubled = nums.map(n => { n * 2 });  // [undefined, undefined, undefined]
const fixed   = nums.map(n => n * 2);       // [2, 4, 6]
```

---

## 13. Best Practices

1. **Prefer arrow functions for callbacks** — shorter, no `this` surprises
   ```js
   arr.map(item => item.name);        // good
   arr.map(function(item) { return item.name; }); // verbose
   ```

2. **Use rest parameters over `arguments`** — real array, works in arrow functions
   ```js
   function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }
   ```

3. **Use meaningful verb-based names** — `getUserData()`, not `data()` or `process()`

4. **One function, one action** — keep functions small and focused

5. **Use default parameters** instead of manual `undefined` checks
   ```js
   function greet(name = "World") { ... }  // good
   function greet(name) { name = name || "World"; ... } // old pattern, falsy pitfalls
   ```

6. **Wrap object literals** in parentheses when returning from arrow functions
   ```js
   const make = () => ({ key: "value" });
   ```

7. **Use function declarations** for top-level/named functions (hoisting benefit, readability). Use arrow functions for inline callbacks.

---

## References

- [javascript.info — Functions](https://javascript.info/function-basics)
- [javascript.info — Function Expressions](https://javascript.info/function-expressions)
- [javascript.info — Arrow Functions, the Basics](https://javascript.info/arrow-functions-basics)
- [MDN — Functions Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN — Arrow Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [MDN — Default Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN — Rest Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
