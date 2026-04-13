// ============================================================================
// 04-classes: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/04-advanced/04-classes/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Class is syntactic sugar over prototypes
//
// What does each console.log print?

function exercise1() {
  class User {
    constructor(public name: string) {}

    sayHi() {
      return `Hi, I'm ${this.name}`;
    }
  }

  console.log(typeof User);
  console.log(User === User.prototype.constructor);
  console.log(Object.getOwnPropertyNames(User.prototype));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Class methods on prototype, not instance
//
// What does each console.log print?

function exercise2() {
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

  console.log(a.bark === b.bark);
  console.log(a.hasOwnProperty("bark"));
  console.log(a.hasOwnProperty("name"));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Static vs instance members
//
// What does each console.log print?

function exercise3() {
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

  console.log(Counter.count);
  console.log(Counter.getCount());
  console.log(a.id);
  console.log(b.id);
  console.log((a as unknown as Record<string, unknown>).count);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Private fields
//
// What does each console.log print?

function exercise4() {
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

  console.log(s.getValue());
  console.log("value" in s);
  console.log("#value" in s);

  // Note: s.#value from outside would be a SyntaxError at compile time
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: super() call order and constructor chain
//
// What does each console.log print, and in what order?

function exercise5() {
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

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Overriding methods and super.method()
//
// What does each console.log print?

function exercise6() {
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
  console.log(c.describe());
  console.log(c instanceof Circle);
  console.log(c instanceof Shape);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Class fields initialization order (parent vs child)
//
// What does console.log print?

function exercise7() {
  class Parent {
    value = "parent";

    constructor() {
      console.log(this.value);
    }
  }

  class Child extends Parent {
    value = "child";
  }

  new Child();
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Static inheritance
//
// What does each console.log print?

function exercise8() {
  class Animal {
    static planet = "Earth";

    static describe() {
      return `Lives on ${this.planet}`;
    }
  }

  class Rabbit extends Animal {
    static planet = "Mars";
  }

  console.log(Animal.describe());
  console.log(Rabbit.describe());
  console.log(Rabbit.__proto__ === Animal);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: instanceof with prototype chain
//
// What does each console.log print?

function exercise9() {
  class A {}
  class B extends A {}
  class C extends B {}

  const c = new C();

  console.log(c instanceof C);
  console.log(c instanceof B);
  console.log(c instanceof A);
  console.log(c instanceof Object);

  // Now break the chain:
  Object.setPrototypeOf(C.prototype, Object.prototype);
  console.log(c instanceof B);
  console.log(c instanceof A);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Fix the Bug ──────────────────────────────────────────────
// Topic: Missing super() call
//
// This code throws an error. Fix it so that creating a Cat works correctly.

function exercise10() {
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
      // BUG: something is missing here
      this.indoor = indoor;
    }

    describe() {
      return `${this.name} is ${this.indoor ? "an indoor" : "an outdoor"} cat with ${this.legs} legs`;
    }
  }

  // Uncomment to test:
  // const cat = new Cat("Whiskers", true);
  // console.log(cat.describe()); // Expected: "Whiskers is an indoor cat with 4 legs"
}

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Fix the Bug ──────────────────────────────────────────────
// Topic: this before super
//
// This code throws "Must call super constructor before accessing 'this'".
// Fix the constructor so it works correctly without changing the class structure.

function exercise11() {
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
      // BUG: this is accessed before super()
      this.label = `${make}-${year}`;
      super(make, year);
      this.batteryKWh = batteryKWh;
    }

    describe() {
      return `${this.label} (${this.batteryKWh} kWh)`;
    }
  }

  // Uncomment to test:
  // const car = new ElectricCar("Tesla", 2024, 100);
  // console.log(car.describe()); // Expected: "Tesla-2024 (100 kWh)"
}

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Fix the Bug ──────────────────────────────────────────────
// Topic: Lost this in callback
//
// The delayed greet loses `this` context. Fix it without changing the
// Greeter class structure (don't convert greet to an arrow function field).
// Fix it in the usage site.

function exercise12() {
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

  // BUG: `this` is lost when greet is extracted
  const greetFn = g.greet;
  console.log(greetFn()); // Expected: "Hello from Alice", but gets "Hello from undefined"
}

// Uncomment to test:
// exercise12();

// ─── Exercise 13: Fix the Bug ──────────────────────────────────────────────
// Topic: Private field access from subclass
//
// This code tries to access a private field from a subclass.
// Refactor so the subclass can read the value through a proper public accessor.

function exercise13() {
  class Base {
    #secret = 42;

    // BUG: subclass cannot access #secret directly
    // Add a way to expose it
  }

  class Child extends Base {
    reveal() {
      // BUG: Cannot access #secret from here
      // return this.#secret; // SyntaxError
      return 0; // placeholder
    }
  }

  // Uncomment to test:
  // const c = new Child();
  // console.log(c.reveal()); // Expected: 42
}

// Uncomment to test:
// exercise13();

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: EventEmitter class
//
// Implement an EventEmitter class with the following interface:
//   - on(event, handler)     — register a handler for an event
//   - off(event, handler)    — remove a specific handler for an event
//   - emit(event, ...args)   — call all handlers for an event with given args
//
// If there are no handlers for an event, emit should do nothing.
// on() should allow multiple handlers for the same event.
// off() should remove only the specified handler (by reference).

interface IEventEmitter {
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

class EventEmitter implements IEventEmitter {
  // YOUR CODE HERE

  on(_event: string, _handler: (...args: unknown[]) => void): void {
    // YOUR CODE HERE
  }

  off(_event: string, _handler: (...args: unknown[]) => void): void {
    // YOUR CODE HERE
  }

  emit(_event: string, ..._args: unknown[]): void {
    // YOUR CODE HERE
  }
}

// Uncomment to test:
// const emitter = new EventEmitter();
// const handler1 = (...args: unknown[]) => console.log("handler1:", ...args);
// const handler2 = (...args: unknown[]) => console.log("handler2:", ...args);
// emitter.on("data", handler1);
// emitter.on("data", handler2);
// emitter.emit("data", 1, 2);       // handler1: 1 2, handler2: 1 2
// emitter.off("data", handler1);
// emitter.emit("data", 3);           // handler2: 3
// emitter.emit("nonexistent", 99);   // nothing

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: LinkedList class
//
// Implement a singly-linked list with the following interface:
//   - append(value)    — add value to the end
//   - prepend(value)   — add value to the beginning
//   - toArray()        — return an array of all values (head to tail)
//   - find(predicate)  — return the first value matching predicate, or undefined
//   - size             — getter returning the number of elements
//
// Use a private #head and #size field.

interface ILinkedList<T> {
  append(value: T): void;
  prepend(value: T): void;
  toArray(): T[];
  find(predicate: (value: T) => boolean): T | undefined;
  readonly size: number;
}

class LinkedList<T> implements ILinkedList<T> {
  // YOUR CODE HERE

  append(_value: T): void {
    // YOUR CODE HERE
  }

  prepend(_value: T): void {
    // YOUR CODE HERE
  }

  toArray(): T[] {
    // YOUR CODE HERE
    return [];
  }

  find(_predicate: (value: T) => boolean): T | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  get size(): number {
    // YOUR CODE HERE
    return 0;
  }
}

// Uncomment to test:
// const list = new LinkedList<number>();
// list.append(1);
// list.append(2);
// list.append(3);
// list.prepend(0);
// console.log(list.toArray());  // Expected: [0, 1, 2, 3]
// console.log(list.size);       // Expected: 4
// console.log(list.find(v => v > 1)); // Expected: 2

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Stack class using private fields
//
// Implement a Stack with:
//   - push(value)  — add to top
//   - pop()        — remove and return top (throw Error if empty)
//   - peek()       — return top without removing (throw Error if empty)
//   - isEmpty()    — boolean
//   - size         — getter
//
// The internal storage must use a private field (#items).

interface IStack<T> {
  push(value: T): void;
  pop(): T;
  peek(): T;
  isEmpty(): boolean;
  readonly size: number;
}

class Stack<T> implements IStack<T> {
  // YOUR CODE HERE

  push(_value: T): void {
    // YOUR CODE HERE
  }

  pop(): T {
    // YOUR CODE HERE
    throw new Error("Not implemented");
  }

  peek(): T {
    // YOUR CODE HERE
    throw new Error("Not implemented");
  }

  isEmpty(): boolean {
    // YOUR CODE HERE
    return true;
  }

  get size(): number {
    // YOUR CODE HERE
    return 0;
  }
}

// Uncomment to test:
// const stack = new Stack<number>();
// stack.push(10);
// stack.push(20);
// stack.push(30);
// console.log(stack.peek());    // Expected: 30
// console.log(stack.pop());     // Expected: 30
// console.log(stack.pop());     // Expected: 20
// console.log(stack.size);      // Expected: 1
// console.log(stack.isEmpty()); // Expected: false
// stack.pop();
// console.log(stack.isEmpty()); // Expected: true
// try { stack.pop(); } catch (e) { console.log((e as Error).message); } // Expected: "Stack is empty"

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Mixin pattern
//
// Create a Timestamped mixin and a Validatable mixin, then apply both
// to a User class.
//
// Timestamped mixin adds:
//   - createdAt: Date   (set in constructor or mixin init)
//   - getAge(): number  (ms since creation)
//
// Validatable mixin adds:
//   - validate(): boolean  (returns true if all required fields are non-empty)
//   - validationErrors(): string[] (returns names of empty required fields)
//
// The User class has: name (string), email (string).
// Required fields: name, email (both must be non-empty strings to be valid).

type Constructor<T = object> = new (...args: unknown[]) => T;

// YOUR CODE HERE — define Timestamped mixin function
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date;

    constructor(...args: unknown[]) {
      super(...args);
      this.createdAt = new Date(); // placeholder — already correct
    }

    getAge(): number {
      // YOUR CODE HERE
      return 0;
    }
  };
}

// YOUR CODE HERE — define Validatable mixin function
function Validatable<TBase extends Constructor<{ name: string; email: string }>>(Base: TBase) {
  return class extends Base {
    validate(): boolean {
      // YOUR CODE HERE
      return false;
    }

    validationErrors(): string[] {
      // YOUR CODE HERE
      return [];
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

// Apply mixins:
const TimestampedValidatableUser = Validatable(Timestamped(BasicUser));

// Uncomment to test:
// const user17 = new TimestampedValidatableUser("Alice", "alice@example.com");
// console.log(user17.name);              // Expected: "Alice"
// console.log(user17.createdAt instanceof Date); // Expected: true
// console.log(user17.validate());        // Expected: true
// console.log(user17.validationErrors()); // Expected: []
//
// const bad17 = new TimestampedValidatableUser("", "");
// console.log(bad17.validate());         // Expected: false
// console.log(bad17.validationErrors()); // Expected: ["name", "email"]

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Extending built-in class
//
// Create an ExtendedArray class that extends Array and adds:
//   - first       — getter returning the first element (or undefined)
//   - last        — getter returning the last element (or undefined)
//   - unique()    — returns a NEW ExtendedArray with duplicates removed
//   - sum()       — returns the sum of all elements (assumes numbers); 0 if empty
//   - average()   — returns the average of all elements; 0 if empty
//
// IMPORTANT: unique() must return an ExtendedArray (not a plain Array),
// so that chaining like arr.unique().sum() works.

class ExtendedArray<T> extends Array<T> {
  get first(): T | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  get last(): T | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  unique(): ExtendedArray<T> {
    // YOUR CODE HERE
    return new ExtendedArray<T>();
  }

  sum(): number {
    // YOUR CODE HERE
    return 0;
  }

  average(): number {
    // YOUR CODE HERE
    return 0;
  }
}

// Uncomment to test:
// const arr = new ExtendedArray<number>(1, 2, 3, 2, 1, 4);
// console.log(arr.first);              // Expected: 1
// console.log(arr.last);               // Expected: 4
// console.log(arr.unique());           // Expected: ExtendedArray [1, 2, 3, 4]
// console.log(arr.unique() instanceof ExtendedArray); // Expected: true
// console.log(arr.sum());              // Expected: 13
// console.log(arr.average());          // Expected: 13/6 ≈ 2.1667
// console.log(arr.unique().sum());     // Expected: 10
// console.log(new ExtendedArray<number>().sum()); // Expected: 0
