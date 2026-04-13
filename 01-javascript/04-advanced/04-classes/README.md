# Classes

Classes are syntactic sugar over JavaScript's existing prototype-based inheritance. They provide a cleaner, more familiar syntax for creating objects and managing inheritance, while the underlying mechanism remains prototypal.

---

## 1. Class Syntax

A class is declared with the `class` keyword. Under the hood, it creates a function whose body is the `constructor` method, with other methods added to its `prototype`:

```js
class User {
  constructor(name) {
    this.name = name;
  }

  sayHi() {
    return `Hi, I'm ${this.name}`;
  }
}

const user = new User("Alice");
user.sayHi(); // "Hi, I'm Alice"
```

What `class User { ... }` actually does:

1. Creates a function named `User` (code taken from `constructor`).
2. Stores class methods (`sayHi`) in `User.prototype`.

```js
typeof User;                          // "function"
User === User.prototype.constructor;  // true
User.prototype.sayHi;                 // [Function: sayHi]
Object.getOwnPropertyNames(User.prototype); // ["constructor", "sayHi"]
```

---

## 2. Constructor Method

The `constructor` method is a special method called automatically when `new ClassName()` is invoked. It initializes instance properties:

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const p = new Point(3, 4);
p.x; // 3
p.y; // 4
```

**Rules:**
- A class can have only **one** `constructor` method.
- If omitted, an empty `constructor() {}` is used by default.
- The constructor cannot be called without `new` — `Point(3, 4)` throws a `TypeError`.

---

## 3. Class Methods (Added to Prototype)

Methods defined in a class body are placed on `ClassName.prototype`, **not** on each instance. All instances share the same method reference via the prototype chain:

```js
class Dog {
  constructor(name) {
    this.name = name;
  }

  bark() {
    return `${this.name} says woof!`;
  }
}

const a = new Dog("Rex");
const b = new Dog("Buddy");

a.bark === b.bark;                    // true — same function on prototype
a.hasOwnProperty("bark");            // false — not on instance
Dog.prototype.hasOwnProperty("bark"); // true — on prototype
```

---

## 4. Class vs Function Constructor Comparison

Classes and constructor functions produce equivalent prototype chains, but classes add important guardrails:

```js
// Function constructor equivalent:
function User(name) {
  this.name = name;
}
User.prototype.sayHi = function () {
  return `Hi, I'm ${this.name}`;
};
```

| Feature | Function constructor | `class` |
|---------|---------------------|---------|
| `typeof` | `"function"` | `"function"` |
| Methods on prototype | Yes (manual) | Yes (automatic) |
| Must use `new` | No (fails silently) | Yes (throws `TypeError`) |
| Methods enumerable | Yes | **No** |
| Automatic strict mode | No | Yes |
| Hoisted | Yes (declaration) | **No** |
| `[[IsClassConstructor]]` | No | Yes |

> Classes are more than pure syntactic sugar — they enforce `new`, set methods as non-enumerable, and enable strict mode automatically.

---

## 5. Class Expressions

Classes can be assigned to variables, passed as arguments, or returned from functions — just like function expressions:

```js
// Anonymous class expression
const User = class {
  sayHi() {
    return "Hello";
  }
};

// Named class expression — name visible only inside class body
const MyClass = class InternalName {
  getName() {
    return InternalName.name; // "InternalName"
  }
};

// Dynamic class creation
function makeClass(greeting) {
  return class {
    greet() {
      return greeting;
    }
  };
}

const Greeter = makeClass("Hello!");
new Greeter().greet(); // "Hello!"
```

---

## 6. Getters and Setters

Classes support `get` and `set` accessors, which are defined on the prototype via property descriptors:

```js
class User {
  constructor(name) {
    this.name = name; // triggers the setter
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (value.length < 2) {
      throw new Error("Name too short");
    }
    this._name = value;
  }
}

const user = new User("Alice");
user.name;          // "Alice" (getter)
user.name = "Bob";  // (setter)
user.name = "A";    // Error: Name too short
```

Getters and setters are installed on `User.prototype` as accessor property descriptors, not as own properties of each instance.

---

## 7. Computed Method Names

Use bracket notation `[expression]` to define method names dynamically:

```js
const method = "greet";

class User {
  ["say" + "Hi"]() {
    return "Hello";
  }

  [method]() {
    return "Hi there";
  }

  [Symbol.iterator]() {
    // makes instances iterable
  }
}

new User().sayHi(); // "Hello"
new User().greet(); // "Hi there"
```

This mirrors the computed property syntax in object literals.

---

## 8. Class Fields (Public Instance Fields)

Class fields declare properties directly on each **instance**, not on the prototype:

```js
class Counter {
  count = 0; // class field — set on each instance

  increment() {
    this.count++;
  }
}

const c = new Counter();
c.count;                        // 0
c.hasOwnProperty("count");     // true — own property
Counter.prototype.count;        // undefined — NOT on prototype
```

### Bound methods via arrow function fields

Class fields with arrow functions solve the "losing `this`" problem because arrow functions capture `this` from the enclosing scope (the constructor):

```js
class Button {
  constructor(label) {
    this.label = label;
  }

  // Arrow function field — `this` always refers to the instance
  click = () => {
    return `Clicked: ${this.label}`;
  };
}

const btn = new Button("Submit");
const { click } = btn;
click(); // "Clicked: Submit" — `this` is preserved
```

**Trade-off:** Each instance gets its own copy of the function (not shared via prototype), which uses more memory.

---

## 9. Private Fields and Methods (`#private`)

Prefix a field or method name with `#` to make it truly private — accessible only within the class body:

```js
class BankAccount {
  #balance = 0; // private field

  constructor(initial) {
    this.#balance = initial;
  }

  #validate(amount) { // private method
    if (amount <= 0) throw new Error("Invalid amount");
  }

  deposit(amount) {
    this.#validate(amount);
    this.#balance += amount;
  }

  get balance() {
    return this.#balance;
  }
}

const account = new BankAccount(100);
account.deposit(50);
account.balance;          // 150
// account.#balance;      // SyntaxError — not accessible outside
// account.#validate(10); // SyntaxError — not accessible outside
```

**Key rules:**
- Private fields **must** be declared in the class body (cannot be created dynamically).
- Private names do not conflict with public names — `#name` and `name` can coexist.
- Private fields are **not** inherited — subclasses cannot access them directly.
- Cannot use bracket notation: `this["#field"]` does not work.

### Protected convention (`_underscore`)

JavaScript has no language-level `protected` keyword. By convention, a leading underscore signals "internal, don't touch from outside":

```js
class CoffeeMachine {
  _waterAmount = 0; // protected by convention

  set waterAmount(value) {
    if (value < 0) value = 0;
    this._waterAmount = value;
  }

  get waterAmount() {
    return this._waterAmount;
  }
}
```

Unlike `#private`, `_protected` fields **are** accessible from subclasses and from outside — the underscore is just a signal.

---

## 10. Static Methods and Properties

`static` members belong to the class constructor itself, not to instances:

```js
class MathUtils {
  static PI = 3.14159;

  static square(x) {
    return x * x;
  }
}

MathUtils.PI;          // 3.14159
MathUtils.square(5);   // 25

const m = new MathUtils();
// m.square(5);        // TypeError — not on instances
// m.PI;               // undefined
```

### Common use cases

- **Factory methods:** `Article.createTodays()` — alternative constructors.
- **Comparison functions:** `Article.compare(a, b)` — class-level utilities.
- **Configuration/constants:** `Config.MAX_RETRIES = 3`.

### Static members are inherited

```js
class Animal {
  static planet = "Earth";

  static compare(a, b) {
    return a.name.localeCompare(b.name);
  }
}

class Rabbit extends Animal {}

Rabbit.planet;  // "Earth" — inherited
Rabbit.compare; // [Function: compare] — inherited
```

This works because `extends` sets **two** prototype links:
1. `Rabbit.prototype.__proto__ === Animal.prototype` (for instance methods).
2. `Rabbit.__proto__ === Animal` (for static members).

---

## 11. Inheritance with `extends`

The `extends` keyword creates a subclass. It sets up the prototype chain so the child class inherits both instance methods and static members:

```js
class Animal {
  constructor(name) {
    this.name = name;
    this.speed = 0;
  }

  run(speed) {
    this.speed = speed;
    return `${this.name} runs at ${this.speed}`;
  }
}

class Rabbit extends Animal {
  hide() {
    return `${this.name} hides!`;
  }
}

const r = new Rabbit("Bunny");
r.run(10);  // "Bunny runs at 10" — inherited from Animal
r.hide();   // "Bunny hides!" — own method
```

Prototype chain after `extends`:
```
r  →  Rabbit.prototype  →  Animal.prototype  →  Object.prototype  →  null
```

### Extending expressions

`extends` accepts any expression that evaluates to a constructor:

```js
function makeBase(greeting) {
  return class {
    greet() { return greeting; }
  };
}

class Derived extends makeBase("Hello") {}
new Derived().greet(); // "Hello"
```

---

## 12. `super` — In Constructor and Methods

### `super()` in constructor

A derived class **must** call `super()` in its constructor before using `this`. This invokes the parent constructor to initialize the inherited portion of the object:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Rabbit extends Animal {
  constructor(name, earLength) {
    super(name); // MUST be called before `this`
    this.earLength = earLength;
  }
}

const r = new Rabbit("Bunny", 10);
r.name;      // "Bunny"
r.earLength; // 10
```

**Why is `super()` required?** A derived constructor has an internal `[[ConstructorKind]]: "derived"` flag. Unlike regular constructors, it does **not** create `this` automatically — it expects the parent constructor to do that via `super()`.

If no constructor is defined in a subclass, a default is generated:
```js
constructor(...args) {
  super(...args);
}
```

### `super.method()` in methods

Call the parent's version of a method:

```js
class Animal {
  stop() {
    return `${this.name} stands still`;
  }
}

class Rabbit extends Animal {
  stop() {
    const parentResult = super.stop(); // call Animal's stop
    return `${parentResult} and hides`;
  }
}

new Rabbit("Bunny").stop(); // "Bunny stands still and hides"
```

> Arrow functions do **not** have their own `super` — they use `super` from the enclosing method. This is why `setTimeout(() => super.stop(), 1000)` works inside a method.

---

## 13. Overriding Methods

When a child class defines a method with the same name as the parent, the child's version takes precedence:

```js
class Shape {
  area() {
    return 0;
  }

  describe() {
    return `Area: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() { // overrides Shape.area
    return Math.PI * this.radius ** 2;
  }
}

new Circle(5).describe(); // "Area: 78.539..." — uses Circle's area()
```

### Overriding class fields — a tricky note

Class fields and methods behave differently when overridden and accessed from the parent constructor:

```js
class Animal {
  name = "animal";

  constructor() {
    console.log(this.name);
  }
}

class Rabbit extends Animal {
  name = "rabbit";
}

new Animal();  // "animal"
new Rabbit(); // "animal" (!) — parent field used, not child's
```

This happens because:
- For base classes, fields are initialized **before** the constructor runs.
- For derived classes, fields are initialized **after** `super()` returns.

So when `Animal`'s constructor runs during `new Rabbit()`, the `Rabbit` field `name = "rabbit"` hasn't been set yet. Methods do **not** have this problem because they are on the prototype and resolved dynamically.

---

## 14. `instanceof` Operator

Checks if an object's prototype chain contains `Constructor.prototype`:

```js
class Animal {}
class Rabbit extends Animal {}

const r = new Rabbit();

r instanceof Rabbit; // true
r instanceof Animal; // true
r instanceof Object; // true
```

### How it works

`obj instanceof Constructor` walks up `obj.__proto__` chain, checking if any link `=== Constructor.prototype`.

### Custom behavior with `Symbol.hasInstance`

```js
class EvenChecker {
  static [Symbol.hasInstance](value) {
    return typeof value === "number" && value % 2 === 0;
  }
}

4 instanceof EvenChecker;  // true
5 instanceof EvenChecker;  // false
```

### `isPrototypeOf` alternative

```js
Animal.prototype.isPrototypeOf(r); // true — equivalent to instanceof
```

---

## 15. Mixins Pattern

JavaScript only supports single inheritance. To compose behavior from multiple sources, use the **mixin** pattern — copying methods to a class's prototype with `Object.assign`:

```js
const Serializable = {
  serialize() {
    return JSON.stringify(this);
  },

  toJSON() {
    return { ...this };
  },
};

const EventEmitting = {
  on(event, handler) {
    if (!this._handlers) this._handlers = {};
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(handler);
  },

  emit(event, ...args) {
    if (this._handlers?.[event]) {
      this._handlers[event].forEach((h) => h(...args));
    }
  },
};

class User {
  constructor(name) {
    this.name = name;
  }
}

// "Mix in" methods from multiple sources:
Object.assign(User.prototype, Serializable, EventEmitting);

const user = new User("Alice");
user.serialize();              // '{"name":"Alice"}'
user.on("login", () => {});    // works
```

**Caution:** Mixins can cause name collisions if multiple mixins define methods with the same name. There's no language-level conflict resolution.

---

## 16. Common Gotchas

### Class methods are not enumerable

```js
class User {
  sayHi() {}
}

for (const key in new User()) {
  console.log(key); // nothing — sayHi is non-enumerable
}
```

This is different from constructor functions where `User.prototype.sayHi = function() {}` creates an **enumerable** property.

### `this` in callbacks loses class context

```js
class Button {
  constructor(label) {
    this.label = label;
  }

  click() {
    return `Clicked: ${this.label}`;
  }
}

const btn = new Button("OK");
const fn = btn.click;
fn(); // TypeError or "Clicked: undefined" — `this` is lost

// Fixes:
// 1. Bind in constructor: this.click = this.click.bind(this);
// 2. Arrow function field: click = () => { ... };
// 3. Wrapper: setTimeout(() => btn.click(), 100);
```

### No hoisting

```js
const u = new User(); // ReferenceError: Cannot access 'User' before initialization

class User {}
```

Unlike function declarations, class declarations are **not** hoisted (they are in the temporal dead zone until the declaration is reached).

### Calling `super` — rules

- `super()` must be called in a derived constructor **before** any `this` access.
- `super.method()` can be called in any method.
- Arrow functions inherit `super` from the surrounding method.
- A regular (non-method) function does **not** have `super`.

### Forgetting `new`

```js
class User {
  constructor(name) { this.name = name; }
}

User("Alice"); // TypeError: Class constructor User cannot be invoked without 'new'
```

---

## 17. Best Practices

1. **Prefer `class` over constructor functions** — cleaner syntax, built-in strict mode, non-enumerable methods, enforced `new`.

2. **Keep constructors minimal** — only assign properties. Avoid side effects or heavy logic in constructors.

3. **Use `#private` for true encapsulation** — prefer `#field` over `_field` convention when you need enforcement.

4. **Use arrow function fields sparingly** — they solve `this` binding but create per-instance copies. Use `.bind()` in the constructor or arrow wrappers at call sites when memory matters.

5. **Always call `super()` first in derived constructors** — before any `this` access.

6. **Favor composition over deep inheritance** — deep class hierarchies are fragile. Prefer mixins or composition patterns for shared behavior.

7. **Use `static` for utility methods** — factory methods, comparators, and constants that belong to the class, not instances.

8. **Don't override class fields expecting polymorphic behavior in constructors** — use methods or getters instead, since field initialization order differs from method resolution.

9. **Be careful with method extraction** — `const fn = obj.method; fn()` loses `this`. Bind or wrap as needed.

10. **Use `instanceof` carefully** — it checks the prototype chain, which can break across realms (iframes) or after manual prototype manipulation.

---

## References

- [javascript.info — Class basic syntax](https://javascript.info/class)
- [javascript.info — Class inheritance](https://javascript.info/class-inheritance)
- [javascript.info — Static properties and methods](https://javascript.info/static-properties-methods)
- [javascript.info — Private and protected properties and methods](https://javascript.info/private-protected-properties-methods)
- [MDN — Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN — extends](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends)
- [MDN — Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [MDN — static](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)
- [MDN — instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
