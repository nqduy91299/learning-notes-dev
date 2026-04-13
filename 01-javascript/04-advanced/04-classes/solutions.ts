// ============================================================================
// 04-classes: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Class is syntactic sugar over prototypes

function solution1() {
  class User {
    constructor(public name: string) {}

    sayHi() {
      return `Hi, I'm ${this.name}`;
    }
  }

  console.log(typeof User);                              // "function"
  console.log(User === User.prototype.constructor);      // true
  console.log(Object.getOwnPropertyNames(User.prototype)); // ["constructor", "sayHi"]
}

// ANSWER:
// Log 1: "function"
// Log 2: true
// Log 3: ["constructor", "sayHi"]
//
// Explanation:
// A class declaration creates a function (the constructor). The class itself
// IS its constructor: `User === User.prototype.constructor`. All methods
// defined in the class body are placed on `User.prototype`, so
// getOwnPropertyNames returns ["constructor", "sayHi"].
// See README → Section 1: Class Syntax

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Class methods on prototype, not instance

function solution2() {
  class Dog {
    name: string;

    constructor(name: string) {
      this.name = name;
    }

    bark() {
      return `${this.name} says woof!`;
    }
  }

  const a = new Dog("Rex");
  const b = new Dog("Buddy");

  console.log(a.bark === b.bark);        // true
  console.log(a.hasOwnProperty("bark")); // false
  console.log(a.hasOwnProperty("name")); // true
}

// ANSWER:
// Log 1: true
// Log 2: false
// Log 3: true
//
// Explanation:
// Class methods like `bark` are stored on `Dog.prototype`, shared by all
// instances — so `a.bark === b.bark` is true. `bark` is NOT an own property
// of any instance. But `name` is assigned in the constructor via `this.name`,
// so it IS an own property of each instance.
// See README → Section 3: Class Methods (Added to Prototype)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Static vs instance members

function solution3() {
  class Counter {
    static count = 0;
    id: number;

    constructor() {
      Counter.count++;
      this.id = Counter.count;
    }

    static getCount() {
      return Counter.count;
    }
  }

  const a = new Counter();
  const b = new Counter();
  const c = new Counter();

  console.log(Counter.count);     // 3
  console.log(Counter.getCount()); // 3
  console.log(a.id);               // 1
  console.log(b.id);               // 2
  console.log((a as unknown as Record<string, unknown>).count); // undefined
}

// ANSWER:
// Log 1: 3
// Log 2: 3
// Log 3: 1
// Log 4: 2
// Log 5: undefined
//
// Explanation:
// `static count` lives on the Counter constructor, not on instances. Each
// `new Counter()` increments `Counter.count` and captures the current count
// as the instance's `id`. After 3 constructions, count is 3. Accessing
// `a.count` returns undefined because static properties are not on instances.
// See README → Section 10: Static Methods and Properties

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Private fields

function solution4() {
  class Secret {
    #value: string;

    constructor(val: string) {
      this.#value = val;
    }

    getValue() {
      return this.#value;
    }
  }

  const s = new Secret("hidden");

  console.log(s.getValue());  // "hidden"
  console.log("value" in s);  // false
  console.log("#value" in s); // false
}

// ANSWER:
// Log 1: "hidden"
// Log 2: false
// Log 3: false
//
// Explanation:
// Private fields with # are accessible only inside the class body via
// `this.#value`. The `getValue()` method can access it. `"value" in s`
// checks for a public property named "value", which doesn't exist — false.
// `"#value" in s` is also false: the string "#value" is just a regular
// property name lookup, not the private field. The ergonomic brand check
// (`#value in obj`) uses the actual `#field` token and can only be used
// inside the class body, not via a string.
// See README → Section 9: Private Fields and Methods

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: super() call order and constructor chain

function solution5() {
  class Animal {
    type: string;

    constructor() {
      this.type = "animal";
      console.log("Animal constructor");
    }
  }

  class Dog extends Animal {
    breed: string;

    constructor(breed: string) {
      console.log("Dog before super");
      super();
      console.log("Dog after super");
      this.breed = breed;
    }
  }

  const d = new Dog("Labrador");
  console.log(d.type);
  console.log(d.breed);
}

// ANSWER:
// Log 1: "Dog before super"
// Log 2: "Animal constructor"
// Log 3: "Dog after super"
// Log 4: "animal"
// Log 5: "Labrador"
//
// Explanation:
// The Dog constructor runs first, logging "Dog before super". Then `super()`
// calls Animal's constructor, which sets `this.type` and logs "Animal
// constructor". Control returns to Dog's constructor, logging "Dog after super",
// then sets `this.breed`. The `console.log` before super() is allowed — only
// `this` access before super() is forbidden.
// See README → Section 12: super — In Constructor and Methods

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Overriding methods and super.method()

function solution6() {
  class Shape {
    describe() {
      return "I am a shape";
    }
  }

  class Circle extends Shape {
    radius: number;

    constructor(radius: number) {
      super();
      this.radius = radius;
    }

    describe() {
      return `${super.describe()} — specifically a circle with radius ${this.radius}`;
    }
  }

  const c = new Circle(5);
  console.log(c.describe());       // "I am a shape — specifically a circle with radius 5"
  console.log(c instanceof Circle); // true
  console.log(c instanceof Shape);  // true
}

// ANSWER:
// Log 1: "I am a shape — specifically a circle with radius 5"
// Log 2: true
// Log 3: true
//
// Explanation:
// Circle overrides `describe()` but calls `super.describe()` to get the
// parent's result, then appends its own info. `instanceof` walks the prototype
// chain: c → Circle.prototype → Shape.prototype, so both checks are true.
// See README → Section 13: Overriding Methods & Section 14: instanceof

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Class fields initialization order (parent vs child)

function solution7() {
  class Parent {
    value = "parent";

    constructor() {
      console.log(this.value); // "parent"
    }
  }

  class Child extends Parent {
    value = "child";
  }

  new Child();
}

// ANSWER:
// Log 1: "parent"
//
// Explanation:
// This is a subtle gotcha. For the base class (Parent), fields are initialized
// BEFORE the constructor runs. For the derived class (Child), fields are
// initialized AFTER super() returns. When `new Child()` is called, the
// auto-generated constructor calls `super()`, which runs Parent's constructor.
// At that point, Parent's field `value = "parent"` is already set, but
// Child's field `value = "child"` hasn't been initialized yet. So the log
// shows "parent". After Parent's constructor finishes, Child's field
// overwrites it to "child".
// See README → Section 13: Overriding class fields — a tricky note

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Static inheritance

function solution8() {
  class Animal {
    static planet = "Earth";

    static describe() {
      return `Lives on ${this.planet}`;
    }
  }

  class Rabbit extends Animal {
    static planet = "Mars";
  }

  console.log(Animal.describe()); // "Lives on Earth"
  console.log(Rabbit.describe()); // "Lives on Mars"
  console.log(Rabbit.__proto__ === Animal); // true
}

// ANSWER:
// Log 1: "Lives on Earth"
// Log 2: "Lives on Mars"
// Log 3: true
//
// Explanation:
// Static methods and properties are inherited. `Rabbit.describe()` is
// inherited from Animal, but `this` inside static methods refers to the
// class it was called on. `Animal.describe()` → `this` is Animal → planet
// is "Earth". `Rabbit.describe()` → `this` is Rabbit → Rabbit has its own
// static `planet = "Mars"`. `extends` sets `Rabbit.__proto__ = Animal`.
// See README → Section 10: Static members are inherited

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: instanceof with prototype chain

function solution9() {
  class A {}
  class B extends A {}
  class C extends B {}

  const c = new C();

  console.log(c instanceof C);      // true
  console.log(c instanceof B);      // true
  console.log(c instanceof A);      // true
  console.log(c instanceof Object); // true

  // Now break the chain:
  Object.setPrototypeOf(C.prototype, Object.prototype);
  console.log(c instanceof B);      // false
  console.log(c instanceof A);      // false
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: true
// Log 4: true
// Log 5: false
// Log 6: false
//
// Explanation:
// Initially c's chain: c → C.prototype → B.prototype → A.prototype → Object.prototype.
// So c is an instance of all four. After setPrototypeOf(C.prototype, Object.prototype),
// the chain becomes: c → C.prototype → Object.prototype. B.prototype and
// A.prototype are no longer in the chain, so instanceof returns false for both.
// See README → Section 14: instanceof Operator

// ─── Exercise 10: Fix the Bug ──────────────────────────────────────────────
// Topic: Missing super() call

function solution10() {
  class Animal {
    name: string;
    legs: number;

    constructor(name: string, legs: number) {
      this.name = name;
      this.legs = legs;
    }
  }

  class Cat extends Animal {
    indoor: boolean;

    constructor(name: string, indoor: boolean) {
      super(name, 4); // FIX: call super() before using this
      this.indoor = indoor;
    }

    describe() {
      return `${this.name} is ${this.indoor ? "an indoor" : "an outdoor"} cat with ${this.legs} legs`;
    }
  }

  const cat = new Cat("Whiskers", true);
  console.log(cat.describe()); // "Whiskers is an indoor cat with 4 legs"
}

// Explanation:
// A derived class constructor MUST call super() before accessing `this`.
// The original code was missing super(), which caused a ReferenceError.
// We call `super(name, 4)` to initialize Animal's name and legs (cats
// always have 4 legs), then set `this.indoor`.
// See README → Section 12: super() in constructor

// ─── Exercise 11: Fix the Bug ──────────────────────────────────────────────
// Topic: this before super

function solution11() {
  class Vehicle {
    make: string;
    year: number;

    constructor(make: string, year: number) {
      this.make = make;
      this.year = year;
    }
  }

  class ElectricCar extends Vehicle {
    batteryKWh: number;
    label: string;

    constructor(make: string, year: number, batteryKWh: number) {
      super(make, year); // FIX: call super() BEFORE accessing this
      this.label = `${make}-${year}`; // FIX: moved after super()
      this.batteryKWh = batteryKWh;
    }

    describe() {
      return `${this.label} (${this.batteryKWh} kWh)`;
    }
  }

  const car = new ElectricCar("Tesla", 2024, 100);
  console.log(car.describe()); // "Tesla-2024 (100 kWh)"
}

// Explanation:
// In derived constructors, `this` cannot be accessed before calling super().
// The fix is to move `super(make, year)` before any `this.xxx = ...` line.
// Note: we can still use the constructor parameters (`make`, `year`) before
// super — just not `this`.
// See README → Section 16: Common Gotchas → Calling super — rules

// ─── Exercise 12: Fix the Bug ──────────────────────────────────────────────
// Topic: Lost this in callback

function solution12() {
  class Greeter {
    name: string;

    constructor(name: string) {
      this.name = name;
    }

    greet() {
      return `Hello from ${this.name}`;
    }
  }

  const g = new Greeter("Alice");

  // FIX: bind the method to the instance
  const greetFn = g.greet.bind(g);
  console.log(greetFn()); // "Hello from Alice"
}

// Explanation:
// When a method is extracted from an object (`const fn = obj.method`), the
// `this` context is lost. Calling `fn()` without an object context makes
// `this` undefined (strict mode) or globalThis. Using `.bind(g)` creates
// a new function with `this` permanently bound to `g`.
// See README → Section 16: Common Gotchas → this in callbacks loses class context

// ─── Exercise 13: Fix the Bug ──────────────────────────────────────────────
// Topic: Private field access from subclass

function solution13() {
  class Base {
    #secret = 42;

    // FIX: expose via a protected getter method
    get secret(): number {
      return this.#secret;
    }
  }

  class Child extends Base {
    reveal() {
      return this.secret; // FIX: use the public getter instead of #secret
    }
  }

  const c = new Child();
  console.log(c.reveal()); // 42
}

// Explanation:
// Private fields (#) are strictly class-scoped — subclasses cannot access
// them directly. The fix is to add a public (or conventionally "protected")
// getter in the base class. The subclass calls `this.secret` (the getter),
// which internally accesses `this.#secret`.
// See README → Section 9: Private Fields and Methods

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: EventEmitter class

interface IEventEmitter {
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

class EventEmitter implements IEventEmitter {
  #handlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, []);
    }
    this.#handlers.get(event)!.push(handler);
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.#handlers.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const handlers = this.#handlers.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      handler(...args);
    }
  }
}

// Explanation:
// We use a private Map to store arrays of handlers keyed by event name.
// `on` adds to the array, `off` removes by reference (indexOf + splice),
// `emit` iterates and calls each handler with the provided args.
// Using a Map instead of a plain object avoids prototype pollution.
// See README → Section 9: Private Fields & Section 3: Class Methods

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: LinkedList class

interface ILinkedList<T> {
  append(value: T): void;
  prepend(value: T): void;
  toArray(): T[];
  find(predicate: (value: T) => boolean): T | undefined;
  readonly size: number;
}

interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

class LinkedList<T> implements ILinkedList<T> {
  #head: ListNode<T> | null = null;
  #size = 0;

  append(value: T): void {
    const node: ListNode<T> = { value, next: null };
    if (!this.#head) {
      this.#head = node;
    } else {
      let current = this.#head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.#size++;
  }

  prepend(value: T): void {
    const node: ListNode<T> = { value, next: this.#head };
    this.#head = node;
    this.#size++;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.#head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  find(predicate: (value: T) => boolean): T | undefined {
    let current = this.#head;
    while (current) {
      if (predicate(current.value)) {
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  get size(): number {
    return this.#size;
  }
}

// Explanation:
// A singly-linked list where each node has a `value` and a `next` pointer.
// `#head` points to the first node, `#size` tracks element count. `append`
// walks to the tail and links a new node. `prepend` makes the new node
// the head. `toArray` iterates and collects values. `find` iterates
// until the predicate matches. Both fields are private for encapsulation.
// See README → Section 9: Private Fields & Section 2: Constructor Method

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Stack class using private fields

interface IStack<T> {
  push(value: T): void;
  pop(): T;
  peek(): T;
  isEmpty(): boolean;
  readonly size: number;
}

class Stack<T> implements IStack<T> {
  #items: T[] = [];

  push(value: T): void {
    this.#items.push(value);
  }

  pop(): T {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.#items.pop()!;
  }

  peek(): T {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.#items[this.#items.length - 1];
  }

  isEmpty(): boolean {
    return this.#items.length === 0;
  }

  get size(): number {
    return this.#items.length;
  }
}

// Explanation:
// A stack is a LIFO (last-in, first-out) data structure. We use a private
// array `#items` as the backing store. `push` adds to the end, `pop` removes
// from the end. Both `pop` and `peek` throw if the stack is empty.
// The `size` getter delegates to the array's length.
// See README → Section 9: Private Fields

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Mixin pattern

type Constructor<T = object> = new (...args: unknown[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date;

    constructor(...args: unknown[]) {
      super(...args);
      this.createdAt = new Date();
    }

    getAge(): number {
      return Date.now() - this.createdAt.getTime();
    }
  };
}

function Validatable<TBase extends Constructor<{ name: string; email: string }>>(Base: TBase) {
  return class extends Base {
    validate(): boolean {
      return this.name.length > 0 && this.email.length > 0;
    }

    validationErrors(): string[] {
      const errors: string[] = [];
      if (!this.name) errors.push("name");
      if (!this.email) errors.push("email");
      return errors;
    }
  };
}

class BasicUser {
  name: string;
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}

const TimestampedValidatableUser = Validatable(Timestamped(BasicUser));

// Explanation:
// Mixins are functions that take a base class and return a new class extending
// it with additional behavior. `Timestamped` adds `createdAt` and `getAge()`.
// `Validatable` adds `validate()` and `validationErrors()`. We compose them:
// Validatable(Timestamped(BasicUser)) creates a class chain:
// ValidatableClass → TimestampedClass → BasicUser.
// See README → Section 15: Mixins Pattern

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Extending built-in class

class ExtendedArray<T> extends Array<T> {
  get first(): T | undefined {
    return this[0];
  }

  get last(): T | undefined {
    return this[this.length - 1];
  }

  unique(): ExtendedArray<T> {
    return ExtendedArray.from(new Set(this)) as ExtendedArray<T>;
  }

  sum(): number {
    return this.reduce((acc, val) => acc + (val as unknown as number), 0);
  }

  average(): number {
    if (this.length === 0) return 0;
    return this.sum() / this.length;
  }
}

// Explanation:
// Extending Array gives us all built-in array methods. `first` and `last`
// are getters for index 0 and length-1. `unique()` uses a Set to deduplicate,
// then `ExtendedArray.from()` to convert back (important: this returns an
// ExtendedArray, not a plain Array, enabling chaining). `sum()` uses reduce.
// `average()` divides sum by length, returning 0 for empty arrays.
// See README → Section 11: Inheritance with extends

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Class is a function ===");
solution1();

console.log("\n=== Exercise 2: Methods on prototype ===");
solution2();

console.log("\n=== Exercise 3: Static vs instance ===");
solution3();

console.log("\n=== Exercise 4: Private fields ===");
solution4();

console.log("\n=== Exercise 5: super() call order ===");
solution5();

console.log("\n=== Exercise 6: Override + super.method() ===");
solution6();

console.log("\n=== Exercise 7: Field init order ===");
solution7();

console.log("\n=== Exercise 8: Static inheritance ===");
solution8();

console.log("\n=== Exercise 9: instanceof + prototype mutation ===");
solution9();

console.log("\n=== Exercise 10: Fix missing super() ===");
solution10();

console.log("\n=== Exercise 11: Fix this before super ===");
solution11();

console.log("\n=== Exercise 12: Fix lost this ===");
solution12();

console.log("\n=== Exercise 13: Fix private access from subclass ===");
solution13();

console.log("\n=== Exercise 14: EventEmitter ===");
const emitter14 = new EventEmitter();
const handler14a = (...args: unknown[]) => console.log("handler1:", ...args);
const handler14b = (...args: unknown[]) => console.log("handler2:", ...args);
emitter14.on("data", handler14a);
emitter14.on("data", handler14b);
emitter14.emit("data", 1, 2);
emitter14.off("data", handler14a);
emitter14.emit("data", 3);
emitter14.emit("nonexistent", 99);

console.log("\n=== Exercise 15: LinkedList ===");
const list15 = new LinkedList<number>();
list15.append(1);
list15.append(2);
list15.append(3);
list15.prepend(0);
console.log(list15.toArray());                   // [0, 1, 2, 3]
console.log(list15.size);                        // 4
console.log(list15.find((v) => v > 1));          // 2

console.log("\n=== Exercise 16: Stack ===");
const stack16 = new Stack<number>();
stack16.push(10);
stack16.push(20);
stack16.push(30);
console.log(stack16.peek());    // 30
console.log(stack16.pop());     // 30
console.log(stack16.pop());     // 20
console.log(stack16.size);      // 1
console.log(stack16.isEmpty()); // false
stack16.pop();
console.log(stack16.isEmpty()); // true
try { stack16.pop(); } catch (e) { console.log((e as Error).message); } // "Stack is empty"

console.log("\n=== Exercise 17: Mixins ===");
const user17 = new TimestampedValidatableUser("Alice", "alice@example.com");
console.log(user17.name);                        // "Alice"
console.log(user17.createdAt instanceof Date);    // true
console.log(user17.validate());                   // true
console.log(user17.validationErrors());           // []
const bad17 = new TimestampedValidatableUser("", "");
console.log(bad17.validate());                    // false
console.log(bad17.validationErrors());            // ["name", "email"]

console.log("\n=== Exercise 18: ExtendedArray ===");
const arr18 = new ExtendedArray<number>(1, 2, 3, 2, 1, 4);
console.log(arr18.first);                         // 1
console.log(arr18.last);                          // 4
console.log(arr18.unique());                       // ExtendedArray [1, 2, 3, 4]
console.log(arr18.unique() instanceof ExtendedArray); // true
console.log(arr18.sum());                          // 13
console.log(arr18.average());                      // ~2.1667
console.log(arr18.unique().sum());                 // 10
console.log(new ExtendedArray<number>().sum());    // 0
