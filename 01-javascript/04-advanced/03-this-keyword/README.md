# The `this` Keyword in JavaScript

> **Sources**: [javascript.info — Object methods](https://javascript.info/object-methods) | [javascript.info — call/apply decorators](https://javascript.info/call-apply-decorators) | [javascript.info — Function binding](https://javascript.info/bind) | [MDN — this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)

---

## 1. What Is `this`?

`this` is a special keyword that refers to the **context** in which a piece of code runs. Unlike most other languages where `this` is bound at definition time, in JavaScript **`this` is determined by _how_ a function is called** (runtime binding), not where it is defined.

```ts
function greet() {
  console.log(this.name);
}

const alice = { name: "Alice", greet };
const bob   = { name: "Bob",   greet };

alice.greet(); // "Alice"  — this is alice
bob.greet();   // "Bob"    — this is bob
```

Think of `this` as a hidden parameter that the language passes to a function when it is invoked. The four binding rules below describe how that parameter is filled in.

---

## 2. Default Binding

When a function is called as a **standalone invocation** (not attached to any object), the default rule applies:

| Mode | `this` value |
|------|-------------|
| **Sloppy (non-strict)** | The global object (`globalThis` / `window` / `global`) |
| **Strict mode** | `undefined` |

```ts
function showThis() {
  "use strict";
  console.log(this); // undefined
}

showThis(); // standalone call → default binding
```

In non-strict mode `this` undergoes **this-substitution**: `undefined` and `null` are replaced with `globalThis`, and primitives are wrapped in their object form.

---

## 3. Implicit Binding

When a function is called **as a method of an object** (`obj.method()`), `this` is set to the object **before the dot**.

```ts
const user = {
  name: "John",
  sayHi() {
    console.log(this.name); // "John"
  },
};

user.sayHi(); // implicit binding → this === user
```

Only the **immediate** caller matters — for chained property access like `a.b.method()`, `this` is `b`, not `a`.

---

## 4. Explicit Binding — `call`, `apply`, `bind`

You can **manually set** `this` using three built-in methods on every function:

### `call` and `apply`

Both invoke the function immediately with a specified `this`:

```ts
function say(phrase: string) {
  console.log(`${this.name}: ${phrase}`);
}

const user = { name: "John" };

say.call(user, "Hello");       // "John: Hello"
say.apply(user, ["Hello"]);    // "John: Hello"
```

- `call(context, arg1, arg2, …)` — arguments listed individually
- `apply(context, [arg1, arg2, …])` — arguments as an array-like

### `bind`

Returns a **new function** with `this` permanently fixed:

```ts
const boundSay = say.bind(user);
boundSay("Hi"); // "John: Hi" — always uses user as this

// bind is permanent — re-binding has no effect
const rebound = boundSay.bind({ name: "Ann" });
rebound("Hey"); // "John: Hey" — still John
```

`bind` can also **partially apply** arguments:

```ts
function mul(a: number, b: number) { return a * b; }
const double = mul.bind(null, 2);
double(5); // 10
```

---

## 5. `new` Binding

When a function is called with `new`, JavaScript:

1. Creates a fresh empty object
2. Sets `this` to that new object
3. Executes the constructor body
4. Returns `this` (unless the constructor explicitly returns a non-primitive)

```ts
function User(name: string) {
  // this = {} (implicitly)
  this.name = name;
  // return this (implicitly)
}

const u = new User("Alice"); // u.name === "Alice"
```

If the constructor returns a non-primitive object, that object replaces the default `this`:

```ts
function C() {
  this.a = 37;
  return { a: 38 }; // overrides the new object
}
new C().a; // 38
```

---

## 6. Arrow Functions — No Own `this`

Arrow functions **do not have their own `this`**. They **inherit** `this` from the enclosing lexical scope at the time they are **defined** (not called).

```ts
const team = {
  name: "Dev",
  members: ["Alice", "Bob"],
  print() {
    // 'this' here is team (method call)
    this.members.forEach((m) => {
      // arrow inherits 'this' from print()
      console.log(`${this.name}: ${m}`);
    });
  },
};

team.print();
// "Dev: Alice"
// "Dev: Bob"
```

Key consequences:
- `call`, `apply`, `bind` **cannot** change an arrow function's `this`
- Arrow functions **cannot** be used as constructors (`new` throws)
- Arrow functions are ideal for callbacks where you want to preserve the outer `this`

---

## 7. Binding Precedence

When multiple rules could apply, they are resolved in this order (highest wins):

```
1. new binding              → this = newly created object
2. Explicit binding         → call / apply / bind
3. Implicit binding         → obj.method()
4. Default binding          → globalThis or undefined
```

Special cases:
- `new` with `bind`: `new` wins — `this` is the new object, not the bound context
- Arrow functions: lexical `this` is **never** overridden by any of the above

---

## 8. Losing `this`

The most common pitfall: **extracting a method** from an object separates it from its context.

```ts
const user = {
  name: "John",
  sayHi() {
    console.log(`Hello, ${this.name}!`);
  },
};

// Extracting the method
const fn = user.sayHi;
fn(); // "Hello, undefined!" (strict: TypeError)

// Passing as callback
setTimeout(user.sayHi, 1000); // "Hello, undefined!"

// Array method callback
[1, 2].forEach(user.sayHi); // loses this
```

Why it happens: `user.sayHi` evaluates to a plain function reference. When that reference is called without `obj.`, the implicit binding is gone.

---

## 9. Fixing Lost `this`

### Solution A: `bind`

```ts
setTimeout(user.sayHi.bind(user), 1000); // "Hello, John!"
```

### Solution B: Arrow function wrapper

```ts
setTimeout(() => user.sayHi(), 1000); // "Hello, John!"
```

**Trade-off**: The arrow wrapper reads `user` at call time — if `user` is reassigned before the timer fires, you get the new value. `bind` captures the reference at bind time.

### Solution C: Bind in the constructor (classes)

```ts
class Logger {
  name = "Logger";
  constructor() {
    this.log = this.log.bind(this);
  }
  log() {
    console.log(this.name);
  }
}
```

### Solution D: Arrow function as class field

```ts
class Logger {
  name = "Logger";
  log = () => {
    console.log(this.name); // always this instance
  };
}
```

Note: each instance gets its own copy of the method (higher memory), and the method is not on the prototype.

---

## 10. `call` vs `apply` vs `bind` — Comparison Table

| Feature | `call` | `apply` | `bind` |
|---------|--------|---------|--------|
| **Invokes immediately?** | Yes | Yes | No (returns new function) |
| **Arguments format** | `fn.call(ctx, a, b)` | `fn.apply(ctx, [a, b])` | `fn.bind(ctx, a, b)` |
| **Returns** | Function's return value | Function's return value | New bound function |
| **Partial application?** | No | No | Yes (pre-fill args) |
| **Re-bindable?** | N/A | N/A | No (first bind wins) |
| **Works on arrows?** | Ignores `thisArg` | Ignores `thisArg` | Ignores `thisArg` |
| **Common use** | Invoke with context, method borrowing | Invoke with arg array, `Math.max.apply` | Callbacks, partial functions, setTimeout |

### Method Borrowing

A powerful pattern using `call`/`apply` — borrow a method from one object and run it on another:

```ts
function hash() {
  // arguments is array-like, not a real array
  return [].join.call(arguments); // borrow Array.prototype.join
}
hash(1, 2, 3); // "1,2,3"
```

---

## 11. Common Gotchas

### Gotcha 1: `this` in Callbacks

```ts
class Button {
  label = "Click me";
  handleClick() {
    console.log(this.label); // undefined if not bound!
  }
}
const btn = new Button();
// Simulated event handler — method passed as plain function ref
someElement.addEventListener("click", btn.handleClick); // lost this!
someElement.addEventListener("click", btn.handleClick.bind(btn)); // fixed
```

### Gotcha 2: `this` in Nested Functions

```ts
const obj = {
  value: 42,
  getValue() {
    function inner() {
      return this.value; // 'this' is undefined (strict) or globalThis
    }
    return inner(); // standalone call — default binding
  },
};

// Fix: use arrow function for inner
const obj2 = {
  value: 42,
  getValue() {
    const inner = () => this.value; // inherits this from getValue
    return inner(); // 42
  },
};
```

### Gotcha 3: `this` in Event Handlers (DOM)

When a regular function is used as a DOM event handler, `this` is bound to the **DOM element** the listener is attached to:

```ts
button.addEventListener("click", function () {
  console.log(this); // the <button> element
});

button.addEventListener("click", () => {
  console.log(this); // enclosing scope's this (NOT the button)
});
```

### Gotcha 4: Method Shorthand vs Arrow in Object Literals

```ts
const counter = {
  count: 0,
  // Correct — method shorthand has proper 'this'
  increment() {
    this.count++;
  },
  // Wrong — arrow inherits 'this' from surrounding scope (module/global)
  decrement: () => {
    this.count--; // 'this' is NOT counter!
  },
};
```

### Gotcha 5: `this` in Object Literal During Construction

```ts
function makeUser() {
  return {
    name: "John",
    ref: this, // 'this' is from makeUser's call context, NOT the object
  };
}
// Fix: use a method instead
function makeUser2() {
  return {
    name: "John",
    ref() {
      return this; // now 'this' is the object (when called as obj.ref())
    },
  };
}
```

### Gotcha 6: `bind` Only Works Once

```ts
function f() { return this.name; }
const g = f.bind({ name: "John" });
const h = g.bind({ name: "Ann" }); // no effect!
h(); // "John"
```

### Gotcha 7: Bound Function Loses Properties

```ts
function sayHi() { console.log(this.name); }
sayHi.test = 5;
const bound = sayHi.bind({ name: "John" });
console.log(bound.test); // undefined — bound is a new exotic object
```

---

## 12. Best Practices

1. **Use arrow functions for callbacks** that need the enclosing `this` (event handlers, `setTimeout`, array methods)
2. **Use method shorthand** (`method() {}`) in object literals, never arrow functions for methods
3. **Bind in the constructor** or use arrow class fields when passing methods as callbacks
4. **Prefer `bind`** over manual `const self = this` — it's clearer and less error-prone
5. **Use strict mode** — it surfaces `this` bugs as `TypeError` instead of silently using `globalThis`
6. **Avoid re-binding** — `bind` only works once; design accordingly
7. **Be explicit** — if a function depends on `this`, document it or use TypeScript's `this` parameter type
8. **Use `call`/`apply` for method borrowing** — e.g., `Array.prototype.slice.call(arguments)`
9. **Prefer rest parameters** (`...args`) over `arguments` — they work with arrow functions and are real arrays
10. **Test method extraction** — whenever you pass `obj.method` somewhere, verify `this` is correct
