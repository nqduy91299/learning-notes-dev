// ============================================================================
// 02-prototypes: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/04-advanced/02-prototypes/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Prototype chain lookup
//
// What does each console.log print?

function exercise1(): void {
  const animal = { eats: true, walks: true };
  const rabbit = Object.create(animal);
  rabbit.jumps = true;

  console.log(rabbit.jumps);
  console.log(rabbit.eats);
  console.log(rabbit.swims);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Writing does NOT walk the chain
//
// What does each console.log print?

function exercise2(): void {
  const parent = { color: "red", count: 0 };
  const child = Object.create(parent);

  child.color = "blue";
  child.count = parent.count + 1;

  console.log(parent.color);
  console.log(child.color);
  console.log(parent.count);
  console.log(child.count);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: hasOwnProperty vs in
//
// What does each console.log print?

function exercise3(): void {
  const base = { type: "base" };
  const derived = Object.create(base);
  derived.name = "derived";

  console.log(Object.hasOwn(derived, "name"));
  console.log(Object.hasOwn(derived, "type"));
  console.log("name" in derived);
  console.log("type" in derived);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: for...in with prototype chain
//
// What does console.log print?

function exercise4(): void {
  const animal = { eats: true };
  const rabbit = Object.create(animal);
  rabbit.jumps = true;

  const ownKeys: string[] = [];
  const allKeys: string[] = [];

  for (const key in rabbit) {
    allKeys.push(key);
    if (Object.hasOwn(rabbit, key)) {
      ownKeys.push(key);
    }
  }

  console.log(ownKeys);
  console.log(allKeys);
  console.log(Object.keys(rabbit));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Constructor function prototype
//
// What does each console.log print?

function exercise5(): void {
  function Dog(this: { name: string }, name: string) {
    this.name = name;
  }

  const DogConstructor = Dog as unknown as new (name: string) => { name: string };

  Dog.prototype.bark = function (this: { name: string }) {
    return `${this.name} says woof!`;
  };

  const rex = new DogConstructor("Rex");

  console.log(rex.name);
  console.log((rex as Record<string, unknown>).bark);
  console.log(Object.getPrototypeOf(rex) === Dog.prototype);
  console.log(Object.hasOwn(rex, "name"));
  console.log(Object.hasOwn(rex, "bark"));
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
// Topic: Default constructor property
//
// What does each console.log print?

function exercise6(): void {
  function Cat(this: { name: string }, name: string) {
    this.name = name;
  }

  const CatConstructor = Cat as unknown as new (name: string) => { name: string; constructor: Function };

  const whiskers = new CatConstructor("Whiskers");

  console.log(whiskers.constructor === Cat);
  console.log(Cat.prototype.constructor === Cat);
  console.log(Object.hasOwn(whiskers, "constructor"));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Replacing F.prototype loses constructor
//
// What does each console.log print?

function exercise7(): void {
  function Bird(this: { name: string }, name: string) {
    this.name = name;
  }

  Bird.prototype = {
    fly() {
      return `${(this as { name: string }).name} flies!`;
    },
  };

  const BirdConstructor = Bird as unknown as new (name: string) => { name: string; constructor: Function };

  const eagle = new BirdConstructor("Eagle");

  console.log(eagle.constructor === Bird);
  console.log(eagle.constructor === Object);
  console.log(Object.getPrototypeOf(eagle) === Bird.prototype);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Native prototypes chain
//
// What does each console.log print?

function exercise8(): void {
  const arr = [1, 2, 3];

  console.log(Object.getPrototypeOf(arr) === Array.prototype);
  console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype);
  console.log(Object.getPrototypeOf(Object.prototype));
  console.log(typeof arr.map);
  console.log(typeof arr.hasOwnProperty);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Object.create(null) — very plain objects
//
// What does each console.log print?

function exercise9(): void {
  const dict = Object.create(null) as Record<string, unknown>;
  dict["name"] = "Alice";
  dict["__proto__"] = "not a prototype";

  console.log(dict["name"]);
  console.log(dict["__proto__"]);
  console.log(Object.getPrototypeOf(dict));
  console.log("toString" in dict);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: this in inherited methods
//
// What does each console.log print?

function exercise10(): void {
  const calculator = {
    value: 0,
    add(this: { value: number }, n: number) {
      this.value += n;
      return this;
    },
  };

  const myCalc = Object.create(calculator) as typeof calculator;
  myCalc.value = 10;

  myCalc.add(5).add(3);

  console.log(myCalc.value);
  console.log(calculator.value);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Lost constructor after prototype replacement
//
// After replacing Vehicle.prototype, the constructor link is broken.
// Fix it so that `car.constructor === Vehicle` is true.

interface VehicleInstance {
  type: string;
  constructor: Function;
  drive(): string;
  honk(): string;
}

function exercise11(): VehicleInstance {
  function Vehicle(this: VehicleInstance, type: string) {
    this.type = type;
  }

  // BUG: replacing prototype loses the constructor property
  Vehicle.prototype = {
    drive(this: VehicleInstance) {
      return `${this.type} is driving`;
    },
    honk(this: VehicleInstance) {
      return "Beep!";
    },
  };

  const VehicleConstructor = Vehicle as unknown as new (type: string) => VehicleInstance;
  return new VehicleConstructor("Car");
}

// Uncomment to test:
// const car11 = exercise11();
// console.log(car11.constructor === (exercise11 as unknown as { Vehicle: Function }).Vehicle);
// Expected: true (currently false)
// console.log(car11.drive()); // "Car is driving"
// console.log(car11.honk()); // "Beep!"

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Prototype pollution via __proto__
//
// This function stores user data in a plain object. An attacker can inject
// "__proto__" as a key and pollute the prototype chain.
// Fix it so arbitrary keys (including "__proto__") are safely stored.

function exercise12(): Record<string, string> {
  const store: Record<string, string> = {};

  function setItem(key: string, value: string): void {
    store[key] = value;
  }

  function getItem(key: string): string | undefined {
    return store[key];
  }

  setItem("name", "Alice");
  setItem("__proto__", "hacked");
  setItem("constructor", "oops");

  // These should all return correct values
  const result: Record<string, string> = {};
  result.name = getItem("name") ?? "MISSING";
  result.proto = getItem("__proto__") ?? "MISSING";
  result.ctor = getItem("constructor") ?? "MISSING";

  return result;
}

// Uncomment to test:
// const result12 = exercise12();
// console.log(result12.name);  // Expected: "Alice"
// console.log(result12.proto); // Expected: "hacked"
// console.log(result12.ctor);  // Expected: "oops"

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: for...in iterating inherited properties in "extend" pattern
//
// This function should copy only OWN enumerable properties from source to
// target, but currently it also copies inherited properties. Fix it.

function exercise13<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
): T {
  for (const key in source) {
    (target as Record<string, unknown>)[key] = source[key];
  }
  return target;
}

// Uncomment to test:
// const proto13 = { inherited: "should not copy" };
// const src13 = Object.create(proto13) as Record<string, unknown>;
// src13.own1 = "a";
// src13.own2 = "b";
// const target13 = {};
// exercise13(target13, src13);
// console.log(target13); // Expected: { own1: "a", own2: "b" } (no "inherited")

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: Replacing prototype after instance creation
//
// The code expects `old.greet()` to work, but it doesn't because the
// prototype was replaced after `old` was created. Fix it so that
// methods are ADDED to the existing prototype instead of replacing it.

interface Greeter {
  name: string;
  greet(): string;
  farewell(): string;
}

function exercise14(): { old: Greeter; fresh: Greeter } {
  function Person(this: Greeter, name: string) {
    this.name = name;
  }

  const PersonConstructor = Person as unknown as new (name: string) => Greeter;

  const old = new PersonConstructor("Alice");

  // BUG: this replaces the prototype — old instances lose access
  Person.prototype = {
    greet(this: Greeter) {
      return `Hi, I'm ${this.name}`;
    },
    farewell(this: Greeter) {
      return `Bye from ${this.name}`;
    },
  };

  const fresh = new PersonConstructor("Bob");

  return { old, fresh };
}

// Uncomment to test:
// const { old: old14, fresh: fresh14 } = exercise14();
// console.log(fresh14.greet());   // Expected: "Hi, I'm Bob"
// console.log(old14.greet());     // Expected: "Hi, I'm Alice" (currently throws!)
// console.log(old14.farewell());  // Expected: "Bye from Alice"

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Object.create polyfill
//
// Implement a simplified version of Object.create that:
// - Takes a prototype object (or null)
// - Returns a new empty object with [[Prototype]] set to the given prototype
//
// Do NOT use Object.create, Object.setPrototypeOf, or __proto__.
// Hint: use a constructor function and the `new` operator.

function exercise15(proto: object | null): object {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// const protoObj = { greet() { return "hello"; } };
// const instance15 = exercise15(protoObj) as { greet(): string };
// console.log(instance15.greet());                           // Expected: "hello"
// console.log(Object.getPrototypeOf(instance15) === protoObj); // Expected: true
// const nullProto = exercise15(null);
// console.log(Object.getPrototypeOf(nullProto));             // Expected: null

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Manual instanceof check
//
// Implement a function that mimics the `instanceof` operator.
// It should check whether `proto` appears anywhere in the
// prototype chain of `obj`.
//
// Do NOT use the `instanceof` operator itself.

function exercise16(obj: unknown, proto: object): boolean {
  // YOUR CODE HERE
  return false;
}

// Uncomment to test:
// console.log(exercise16([], Array.prototype));           // Expected: true
// console.log(exercise16([], Object.prototype));          // Expected: true
// console.log(exercise16({}, Array.prototype));           // Expected: false
// console.log(exercise16("hello", String.prototype));     // Expected: false (primitives)
// console.log(exercise16(Object.create(null), Object.prototype)); // Expected: false

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Mixin pattern
//
// Implement a mixin function that copies all own enumerable methods from
// a mixin object into a target's prototype. This allows multiple objects
// to share behavior without class inheritance.
//
// Requirements:
// - Only copy own enumerable properties from the mixin
// - Don't overwrite properties that already exist on the target prototype
// - Return the target prototype for chaining

function exercise17(
  targetProto: Record<string, unknown>,
  mixin: Record<string, unknown>,
): Record<string, unknown> {
  // YOUR CODE HERE
  return targetProto;
}

// Uncomment to test:
// const Serializable = {
//   serialize(this: Record<string, unknown>) {
//     return JSON.stringify(this);
//   },
// };
//
// const Validatable = {
//   validate(this: { isValid?: boolean }) {
//     return this.isValid === true;
//   },
// };
//
// function User(this: { name: string; isValid: boolean }, name: string) {
//   this.name = name;
//   this.isValid = true;
// }
//
// exercise17(User.prototype as Record<string, unknown>, Serializable);
// exercise17(User.prototype as Record<string, unknown>, Validatable);
//
// const UserConstructor = User as unknown as new (name: string) => {
//   name: string;
//   isValid: boolean;
//   serialize(): string;
//   validate(): boolean;
// };
// const u17 = new UserConstructor("Alice");
// console.log(u17.serialize());  // Expected: '{"name":"Alice","isValid":true}'
// console.log(u17.validate());   // Expected: true

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Prototypal inheritance chain builder
//
// Implement a function `createChain` that takes an array of objects and
// builds a prototype chain from them. The first object in the array should
// be the most derived (bottom of the chain), and the last should be closest
// to `null`.
//
// Example: createChain([c, b, a]) produces:
//   c → b → a → Object.prototype → null
//
// Requirements:
// - Each object's [[Prototype]] should be the next object in the array
// - The last object's [[Prototype]] should be Object.prototype (default)
// - Return the first object (the most derived)
// - Don't mutate the original objects' own properties
//
// You MAY use Object.create and Object.assign for this exercise.

function exercise18(objects: Record<string, unknown>[]): Record<string, unknown> {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// const base18 = { type: "base", describe() { return (this as Record<string, unknown>).type; } };
// const mid18 = { level: "mid", greet() { return `Hello from ${(this as Record<string, unknown>).level}`; } };
// const top18 = { name: "top" };
//
// const chain18 = exercise18([top18, mid18, base18]);
// console.log(chain18.name);                                       // Expected: "top"
// console.log((chain18 as Record<string, Function>).greet());      // Expected: "Hello from mid"
// console.log((chain18 as Record<string, Function>).describe());   // Expected: "base"
// console.log(Object.hasOwn(chain18, "name"));                     // Expected: true
// console.log(Object.hasOwn(chain18, "greet"));                    // Expected: false
// console.log(Object.getPrototypeOf(Object.getPrototypeOf(chain18)) === Object.getPrototypeOf(Object.getPrototypeOf(chain18))); // true

export {
  exercise1,
  exercise2,
  exercise3,
  exercise4,
  exercise5,
  exercise6,
  exercise7,
  exercise8,
  exercise9,
  exercise10,
  exercise11,
  exercise12,
  exercise13,
  exercise14,
  exercise15,
  exercise16,
  exercise17,
  exercise18,
};
