// ============================================================================
// 02-prototypes: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Prototype chain lookup

function solution1(): void {
  const animal = { eats: true, walks: true };
  const rabbit = Object.create(animal);
  rabbit.jumps = true;

  console.log(rabbit.jumps);  // true
  console.log(rabbit.eats);   // true
  console.log(rabbit.swims);  // undefined
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: undefined
//
// Explanation:
// `rabbit.jumps` is an own property → found immediately.
// `rabbit.eats` is not on rabbit, so the engine walks to rabbit's prototype
// (animal), where it finds `eats: true`.
// `rabbit.swims` is not on rabbit or animal or Object.prototype → undefined.
// See README → Section 3: Prototype Chain — How Property Lookup Works

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Writing does NOT walk the chain

function solution2(): void {
  const parent = { color: "red", count: 0 };
  const child = Object.create(parent);

  child.color = "blue";
  child.count = parent.count + 1;

  console.log(parent.color); // "red"
  console.log(child.color);  // "blue"
  console.log(parent.count); // 0
  console.log(child.count);  // 1
}

// ANSWER:
// Log 1: "red"
// Log 2: "blue"
// Log 3: 0
// Log 4: 1
//
// Explanation:
// Writing to a property always creates/updates an OWN property on the target
// object. `child.color = "blue"` creates an own `color` on child (shadowing
// parent's "red"). `parent.count` reads 0 from parent, then `child.count = 1`
// creates an own property on child. Parent is never modified.
// See README → Section 3: Writing does NOT walk the chain

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: hasOwnProperty vs in

function solution3(): void {
  const base = { type: "base" };
  const derived = Object.create(base);
  derived.name = "derived";

  console.log(Object.hasOwn(derived, "name")); // true
  console.log(Object.hasOwn(derived, "type")); // false
  console.log("name" in derived);              // true
  console.log("type" in derived);              // true
}

// ANSWER:
// Log 1: true
// Log 2: false
// Log 3: true
// Log 4: true
//
// Explanation:
// `Object.hasOwn` checks only own properties. "name" is own → true.
// "type" is inherited from base → hasOwn returns false.
// The `in` operator checks the entire prototype chain, so both "name"
// and "type" return true.
// See README → Section 8: Prototype Methods — Own vs. Inherited

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: for...in with prototype chain

function solution4(): void {
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

  console.log(ownKeys);             // ["jumps"]
  console.log(allKeys);             // ["jumps", "eats"]
  console.log(Object.keys(rabbit)); // ["jumps"]
}

// ANSWER:
// Log 1: ["jumps"]
// Log 2: ["jumps", "eats"]
// Log 3: ["jumps"]
//
// Explanation:
// `for...in` iterates ALL enumerable properties including inherited ones.
// Own keys: only "jumps". All keys: "jumps" (own) + "eats" (inherited).
// `Object.keys()` returns only own enumerable string keys, same as ownKeys.
// See README → Section 8: for...in — includes inherited enumerable properties

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Constructor function prototype

function solution5(): void {
  function Dog(this: { name: string }, name: string) {
    this.name = name;
  }

  const DogConstructor = Dog as unknown as new (name: string) => { name: string };

  Dog.prototype.bark = function (this: { name: string }) {
    return `${this.name} says woof!`;
  };

  const rex = new DogConstructor("Rex");

  console.log(rex.name);                                      // "Rex"
  console.log((rex as Record<string, unknown>).bark);          // [Function: bark]
  console.log(Object.getPrototypeOf(rex) === Dog.prototype);   // true
  console.log(Object.hasOwn(rex, "name"));                     // true
  console.log(Object.hasOwn(rex, "bark"));                     // false
}

// ANSWER:
// Log 1: "Rex"
// Log 2: [Function: bark]
// Log 3: true
// Log 4: true
// Log 5: false
//
// Explanation:
// `new DogConstructor("Rex")` creates an object with `name` as an own property
// and [[Prototype]] set to Dog.prototype. `bark` lives on Dog.prototype, not
// on the instance — so `hasOwn(rex, "bark")` is false, but `rex.bark` finds
// it via the prototype chain. Accessing a function property without calling
// it returns the function reference itself.
// See README → Section 5: Constructor Function prototype Property

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Default constructor property

function solution6(): void {
  function Cat(this: { name: string }, name: string) {
    this.name = name;
  }

  const CatConstructor = Cat as unknown as new (name: string) => { name: string; constructor: Function };

  const whiskers = new CatConstructor("Whiskers");

  console.log(whiskers.constructor === Cat);           // true
  console.log(Cat.prototype.constructor === Cat);       // true
  console.log(Object.hasOwn(whiskers, "constructor")); // false
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: false
//
// Explanation:
// By default, `Cat.prototype = { constructor: Cat }`. When we access
// `whiskers.constructor`, it's not an own property of whiskers — it's
// inherited from Cat.prototype. So `hasOwn` returns false, but the value
// is Cat because it's found via the prototype chain.
// See README → Section 6: Default F.prototype = { constructor: F }

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Replacing F.prototype loses constructor

function solution7(): void {
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

  console.log(eagle.constructor === Bird);                     // false
  console.log(eagle.constructor === Object);                   // true
  console.log(Object.getPrototypeOf(eagle) === Bird.prototype); // true
}

// ANSWER:
// Log 1: false
// Log 2: true
// Log 3: true
//
// Explanation:
// We replaced `Bird.prototype` with a new plain object `{ fly() {...} }`.
// This new object was created as an object literal, so its prototype is
// Object.prototype. It does NOT have a `constructor` property of its own.
// When we access `eagle.constructor`, it walks up: eagle → Bird.prototype
// (no constructor) → Object.prototype.constructor → Object. So
// `eagle.constructor === Object` is true.
// See README → Section 6: The constructor property is fragile

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Native prototypes chain

function solution8(): void {
  const arr = [1, 2, 3];

  console.log(Object.getPrototypeOf(arr) === Array.prototype);              // true
  console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype); // true
  console.log(Object.getPrototypeOf(Object.prototype));                     // null
  console.log(typeof arr.map);                                              // "function"
  console.log(typeof arr.hasOwnProperty);                                   // "function"
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: null
// Log 4: "function"
// Log 5: "function"
//
// Explanation:
// Arrays follow the chain: arr → Array.prototype → Object.prototype → null.
// `arr.map` is found on Array.prototype. `arr.hasOwnProperty` is found on
// Object.prototype (two steps up the chain). Object.prototype's prototype
// is null — the end of every chain.
// See README → Section 7: Native Prototypes

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Object.create(null) — very plain objects

function solution9(): void {
  const dict = Object.create(null) as Record<string, unknown>;
  dict["name"] = "Alice";
  dict["__proto__"] = "not a prototype";

  console.log(dict["name"]);                // "Alice"
  console.log(dict["__proto__"]);           // "not a prototype"
  console.log(Object.getPrototypeOf(dict)); // null
  console.log("toString" in dict);          // false
}

// ANSWER:
// Log 1: "Alice"
// Log 2: "not a prototype"
// Log 3: null
// Log 4: false
//
// Explanation:
// `Object.create(null)` creates an object with NO prototype. There is no
// `__proto__` getter/setter (that lives on Object.prototype, which this
// object doesn't inherit from). So `dict["__proto__"]` is stored as a
// regular property with value "not a prototype". The prototype remains null.
// `toString` is not inherited because there's no Object.prototype in the chain.
// See README → Section 9: "Very Plain" Objects

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: this in inherited methods

function solution10(): void {
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

  console.log(myCalc.value);      // 18
  console.log(calculator.value);  // 0
}

// ANSWER:
// Log 1: 18
// Log 2: 0
//
// Explanation:
// `myCalc.add(5)` calls the inherited `add` method, but `this` is `myCalc`
// (the object before the dot). So `this.value += 5` modifies myCalc.value
// (10 + 5 = 15). It returns `this` (myCalc), so `.add(3)` again modifies
// myCalc.value (15 + 3 = 18). calculator.value is never touched.
// See README → Section 3: The this value in inherited methods

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Lost constructor after prototype replacement

interface VehicleInstance {
  type: string;
  constructor: Function;
  drive(): string;
  honk(): string;
}

function solution11(): VehicleInstance {
  function Vehicle(this: VehicleInstance, type: string) {
    this.type = type;
  }

  // FIX: add constructor: Vehicle to the replacement object
  Vehicle.prototype = {
    constructor: Vehicle,
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

// Explanation:
// When you replace F.prototype entirely, the default `constructor` property
// is lost. The fix is to include `constructor: Vehicle` in the new prototype
// object. This restores the link so `instance.constructor === Vehicle` is true.
// See README → Section 6: Fix — Manually restore constructor

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Prototype pollution via __proto__

function solution12(): Record<string, string> {
  // FIX: use Object.create(null) for a safe dictionary
  const store = Object.create(null) as Record<string, string>;

  function setItem(key: string, value: string): void {
    store[key] = value;
  }

  function getItem(key: string): string | undefined {
    return store[key];
  }

  setItem("name", "Alice");
  setItem("__proto__", "hacked");
  setItem("constructor", "oops");

  const result: Record<string, string> = {};
  result.name = getItem("name") ?? "MISSING";
  result.proto = getItem("__proto__") ?? "MISSING";
  result.ctor = getItem("constructor") ?? "MISSING";

  return result;
}

// Explanation:
// With a regular `{}`, assigning to `store["__proto__"]` triggers the
// __proto__ setter inherited from Object.prototype, which tries to change
// the prototype instead of storing a value. Using `Object.create(null)`
// creates an object with no prototype, so `__proto__` is just a regular key.
// Similarly, "constructor" is safely stored without conflicting with
// Object.prototype.constructor.
// See README → Section 9: "Very Plain" Objects & Section 12: __proto__ as a property name

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: for...in iterating inherited properties

function solution13<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
): T {
  for (const key in source) {
    // FIX: only copy own properties
    if (Object.hasOwn(source, key)) {
      (target as Record<string, unknown>)[key] = source[key];
    }
  }
  return target;
}

// Explanation:
// `for...in` iterates all enumerable properties including inherited ones.
// Without the `Object.hasOwn` guard, inherited properties from source's
// prototype chain are also copied to target. The fix filters to own
// properties only. An alternative would be `Object.keys(source).forEach(...)`.
// See README → Section 8: for...in — includes inherited enumerable properties

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: Replacing prototype after instance creation

interface Greeter {
  name: string;
  greet(): string;
  farewell(): string;
}

function solution14(): { old: Greeter; fresh: Greeter } {
  function Person(this: Greeter, name: string) {
    this.name = name;
  }

  const PersonConstructor = Person as unknown as new (name: string) => Greeter;

  const old = new PersonConstructor("Alice");

  // FIX: add methods to the EXISTING prototype instead of replacing it
  Person.prototype.greet = function (this: Greeter) {
    return `Hi, I'm ${this.name}`;
  };
  Person.prototype.farewell = function (this: Greeter) {
    return `Bye from ${this.name}`;
  };

  const fresh = new PersonConstructor("Bob");

  return { old, fresh };
}

// Explanation:
// Replacing `Person.prototype` with a new object breaks existing instances
// because they still reference the OLD prototype. The fix is to add methods
// to the existing prototype object using `Person.prototype.methodName = ...`.
// Both old and new instances share the same prototype object, so both see
// the new methods.
// See README → Section 12: Replacing F.prototype after creating instances

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Object.create polyfill

function solution15(proto: object | null): object {
  function Temp() {}

  if (proto === null) {
    // For null prototype, we need to use a different approach
    // since setting Temp.prototype to null would make instances
    // inherit from Object.prototype (the default)
    const obj = new Temp();
    Object.setPrototypeOf(obj, null); // allowed here as a fallback for null case
    return obj;
  }

  Temp.prototype = proto;
  return new (Temp as unknown as new () => object)();
}

// Explanation:
// The classic Object.create polyfill creates a temporary constructor function,
// sets its `prototype` property to the desired proto object, then calls
// `new Temp()`. The new operator sets the instance's [[Prototype]] to
// Temp.prototype (which is our desired proto). For the null case, we need
// a special approach since setting prototype to null on a constructor doesn't
// work the same way.
// See README → Section 4: Object.create() & Section 5: What new F() does

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Manual instanceof check

function solution16(obj: unknown, proto: object): boolean {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return false;
  }

  let current: object | null = Object.getPrototypeOf(obj);

  while (current !== null) {
    if (current === proto) {
      return true;
    }
    current = Object.getPrototypeOf(current);
  }

  return false;
}

// Explanation:
// `instanceof` checks whether a given object appears anywhere in the
// prototype chain. We start at obj's immediate prototype and walk up
// the chain using Object.getPrototypeOf. If we find a match, return true.
// If we reach null (end of chain), return false. Primitives are not
// objects and always return false.
// See README → Section 3: Prototype Chain & Section 7: Native Prototypes

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Mixin pattern

function solution17(
  targetProto: Record<string, unknown>,
  mixin: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(mixin)) {
    if (!Object.hasOwn(targetProto, key)) {
      targetProto[key] = mixin[key];
    }
  }
  return targetProto;
}

// Explanation:
// We iterate only the mixin's own enumerable keys (using Object.keys, which
// excludes inherited properties). For each key, we check if it already exists
// on targetProto — if not, we copy it over. This prevents overwriting existing
// methods. The mixin pattern allows sharing behavior between unrelated objects
// without forming a prototype chain between them.
// See README → Section 8: Object.keys — own enumerable only

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Prototypal inheritance chain builder

function solution18(objects: Record<string, unknown>[]): Record<string, unknown> {
  if (objects.length === 0) {
    return {};
  }

  // Build from the end (most ancestral) to the beginning (most derived)
  // Start with the last object — its prototype is Object.prototype (default)
  let current = Object.create(Object.prototype) as Record<string, unknown>;
  Object.assign(current, objects[objects.length - 1]);

  // Walk backwards, creating each level with the previous as prototype
  for (let i = objects.length - 2; i >= 0; i--) {
    const next = Object.create(current) as Record<string, unknown>;
    Object.assign(next, objects[i]);
    current = next;
  }

  return current;
}

// Explanation:
// We build the chain from the bottom up. The last object in the array
// becomes the base (closest to Object.prototype). For each subsequent
// object moving toward the front, we create a new object whose prototype
// is the previous one, then copy the own properties onto it using
// Object.assign. This produces: objects[0] → objects[1] → ... → objects[n-1]
// → Object.prototype → null.
// See README → Section 3: Prototype Chain & Section 4: Object.create()

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Prototype chain lookup ===");
solution1();

console.log("\n=== Exercise 2: Writing does NOT walk the chain ===");
solution2();

console.log("\n=== Exercise 3: hasOwnProperty vs in ===");
solution3();

console.log("\n=== Exercise 4: for...in with prototype chain ===");
solution4();

console.log("\n=== Exercise 5: Constructor function prototype ===");
solution5();

console.log("\n=== Exercise 6: Default constructor property ===");
solution6();

console.log("\n=== Exercise 7: Replacing F.prototype loses constructor ===");
solution7();

console.log("\n=== Exercise 8: Native prototypes chain ===");
solution8();

console.log("\n=== Exercise 9: Object.create(null) — very plain objects ===");
solution9();

console.log("\n=== Exercise 10: this in inherited methods ===");
solution10();

console.log("\n=== Exercise 11: Fix lost constructor ===");
const car11 = solution11();
console.log(car11.constructor === car11.constructor); // sanity check
console.log(car11.drive()); // "Car is driving"
console.log(car11.honk());  // "Beep!"

console.log("\n=== Exercise 12: Fix prototype pollution ===");
const result12 = solution12();
console.log(result12.name);  // "Alice"
console.log(result12.proto); // "hacked"
console.log(result12.ctor);  // "oops"

console.log("\n=== Exercise 13: Fix for...in inherited copy ===");
const proto13 = { inherited: "should not copy" };
const src13 = Object.create(proto13) as Record<string, unknown>;
src13.own1 = "a";
src13.own2 = "b";
const target13: Record<string, unknown> = {};
solution13(target13, src13);
console.log(target13); // { own1: "a", own2: "b" }

console.log("\n=== Exercise 14: Fix prototype replacement ===");
const { old: old14, fresh: fresh14 } = solution14();
console.log(fresh14.greet());   // "Hi, I'm Bob"
console.log(old14.greet());     // "Hi, I'm Alice"
console.log(old14.farewell());  // "Bye from Alice"

console.log("\n=== Exercise 15: Object.create polyfill ===");
const protoObj15 = { greet() { return "hello"; } };
const instance15 = solution15(protoObj15) as { greet(): string };
console.log(instance15.greet());                             // "hello"
console.log(Object.getPrototypeOf(instance15) === protoObj15); // true
const nullProto15 = solution15(null);
console.log(Object.getPrototypeOf(nullProto15));             // null

console.log("\n=== Exercise 16: Manual instanceof ===");
console.log(solution16([], Array.prototype));               // true
console.log(solution16([], Object.prototype));              // true
console.log(solution16({}, Array.prototype));               // false
console.log(solution16("hello", String.prototype));         // false
console.log(solution16(Object.create(null), Object.prototype)); // false

console.log("\n=== Exercise 17: Mixin pattern ===");
const Serializable = {
  serialize(this: Record<string, unknown>) {
    return JSON.stringify(this);
  },
};

const Validatable = {
  validate(this: { isValid?: boolean }) {
    return this.isValid === true;
  },
};

function User17(this: { name: string; isValid: boolean }, name: string) {
  this.name = name;
  this.isValid = true;
}

solution17(User17.prototype as Record<string, unknown>, Serializable);
solution17(User17.prototype as Record<string, unknown>, Validatable);

const User17Constructor = User17 as unknown as new (name: string) => {
  name: string;
  isValid: boolean;
  serialize(): string;
  validate(): boolean;
};
const u17 = new User17Constructor("Alice");
console.log(u17.serialize());  // '{"name":"Alice","isValid":true}'
console.log(u17.validate());   // true

console.log("\n=== Exercise 18: Prototypal chain builder ===");
const base18 = { type: "base", describe() { return (this as Record<string, unknown>).type; } };
const mid18 = { level: "mid", greet() { return `Hello from ${(this as Record<string, unknown>).level}`; } };
const top18 = { name: "top" };

const chain18 = solution18([top18, mid18, base18]);
console.log(chain18.name);                                     // "top"
console.log((chain18 as Record<string, Function>).greet());    // "Hello from mid"
console.log((chain18 as Record<string, Function>).describe()); // "base"
console.log(Object.hasOwn(chain18, "name"));                   // true
console.log(Object.hasOwn(chain18, "greet"));                  // false
