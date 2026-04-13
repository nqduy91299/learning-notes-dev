// ============================================================================
// 01-objects: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/02-objects-arrays/01-objects/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Object creation and reference
//
// What does each console.log print?

function exercise1() {
  const a = { x: 1 };
  const b = a;
  b.x = 2;

  console.log(a.x);
  console.log(a === b);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Property order
//
// What does console.log print?

function exercise2() {
  const obj: Record<string, string> = {};
  obj["b"] = "B";
  obj["1"] = "one";
  obj["a"] = "A";
  obj["2"] = "two";

  console.log(Object.keys(obj));
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Property existence checks
//
// What does each console.log print?

function exercise3() {
  const user: Record<string, unknown> = { name: "Alice", age: undefined };

  console.log("name" in user);
  console.log("age" in user);
  console.log(user.age !== undefined);
  console.log("email" in user);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Shallow copy with spread
//
// What does each console.log print?

function exercise4() {
  const original = { name: "Alice", scores: [90, 85] };
  const copy = { ...original };

  copy.name = "Bob";
  copy.scores.push(100);

  console.log(original.name);
  console.log(original.scores);
  console.log(copy.name);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Object.freeze (shallow)
//
// What does each console.log print?

function exercise5() {
  const config = Object.freeze({
    host: "localhost",
    db: { port: 5432 },
  });

  config.host = "remote";
  config.db.port = 3306;

  console.log(config.host);
  console.log(config.db.port);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: "this" in methods
//
// What does each console.log print?

function exercise6() {
  const user = {
    name: "Alice",
    greet() {
      return `Hi, I'm ${this.name}`;
    },
  };

  console.log(user.greet());

  const greetFn = user.greet;
  console.log(greetFn());
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Constructor functions and new
//
// What does each console.log print?

function exercise7() {
  function Car(this: { brand: string; speed: number }, brand: string) {
    this.brand = brand;
    this.speed = 0;
  }

  const car = new (Car as unknown as new (brand: string) => { brand: string; speed: number })("Toyota");

  console.log(car.brand);
  console.log(car.speed);
  console.log(car instanceof (Car as unknown as new (...args: unknown[]) => unknown));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: delete operator
//
// What does each console.log print?

function exercise8() {
  const user: Record<string, unknown> = { name: "Alice", age: 30 };

  console.log(delete user.age);
  console.log(user.age);
  console.log("age" in user);
  console.log(Object.keys(user));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Object.keys/values/entries
//
// What does each console.log print?

function exercise9() {
  const obj = { a: 1, b: 2, c: 3 };

  console.log(Object.keys(obj));
  console.log(Object.values(obj));
  console.log(Object.entries(obj).length);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Object equality
//
// What does each console.log print?

function exercise10() {
  const a = { x: 1 };
  const b = { x: 1 };
  const c = a;

  console.log(a === b);
  console.log(a === c);
  console.log(JSON.stringify(a) === JSON.stringify(b));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Optional chaining
//
// What does each console.log print?

function exercise11() {
  const user: {
    address?: { street?: string; zip?: string };
    getEmail?: () => string;
  } = {
    address: { street: "123 Main" },
  };

  console.log(user.address?.street);
  console.log(user.address?.zip);
  console.log(user.getEmail?.());
  console.log((user as Record<string, unknown>).contact?.toString());
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Property shorthand and computed properties
//
// What does console.log print?

function exercise12() {
  const key = "role";
  const name = "Alice";
  const age = 30;

  const user = {
    name,
    age,
    [key]: "admin",
    [`${key}Level`]: 5,
  };

  console.log(user);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise12();

// ─── Exercise 13: Fix the Bug ──────────────────────────────────────────────
// Topic: Deep copy issue
//
// The function should create a completely independent copy of the input.
// Currently, modifying the returned copy also modifies the original.
// Fix it using structuredClone.

interface UserProfile {
  name: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
  tags: string[];
}

function exercise13(profile: UserProfile): UserProfile {
  const copy = { ...profile };
  return copy;
}

// Uncomment to test:
// const original13: UserProfile = {
//   name: "Alice",
//   settings: { theme: "dark", notifications: true },
//   tags: ["admin", "active"],
// };
// const copy13 = exercise13(original13);
// copy13.settings.theme = "light";
// copy13.tags.push("modified");
// console.log(original13.settings.theme); // Expected: "dark"
// console.log(original13.tags);           // Expected: ["admin", "active"]

// ─── Exercise 14: Fix the Bug ──────────────────────────────────────────────
// Topic: for...in includes inherited properties
//
// This function should return an array of only the object's OWN keys.
// Currently it also includes inherited keys. Fix it.

function exercise14(obj: Record<string, unknown>): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    keys.push(key);
  }
  return keys;
}

// Uncomment to test:
// const parent = { inherited: true };
// const child = Object.create(parent) as Record<string, unknown>;
// child.own1 = "a";
// child.own2 = "b";
// console.log(exercise14(child)); // Expected: ["own1", "own2"]

// ─── Exercise 15: Fix the Bug ──────────────────────────────────────────────
// Topic: Object.freeze is shallow
//
// This function should deep-freeze an object so that NO nested property
// can be modified. The current implementation only shallow-freezes.
// Fix it to recursively freeze all nested objects.

function exercise15<T extends Record<string, unknown>>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

// Uncomment to test:
// const settings = exercise15({
//   theme: "dark",
//   db: { host: "localhost", port: 5432 },
//   features: { logging: { enabled: true, level: "info" } },
// });
// (settings.db as Record<string, unknown>).port = 9999;
// console.log(settings.db.port);  // Expected: 5432
// (settings.features.logging as Record<string, unknown>).level = "debug";
// console.log(settings.features.logging.level); // Expected: "info"

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Object.keys/values/entries transformation
//
// Implement a function that takes an object with string values and returns
// a new object with all values uppercased.
// Example: { name: "alice", city: "nyc" } → { name: "ALICE", city: "NYC" }
//
// Use Object.entries and Object.fromEntries.

function exercise16(obj: Record<string, string>): Record<string, string> {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// console.log(exercise16({ name: "alice", city: "nyc" }));
// Expected: { name: "ALICE", city: "NYC" }
// console.log(exercise16({}));
// Expected: {}

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Merging objects with defaults
//
// Implement a function that merges user-provided options with defaults.
// User options should override defaults. Neither input should be mutated.
// Nested objects should be merged (not replaced entirely).
//
// Example:
//   defaults: { theme: "light", font: { size: 14, family: "Arial" } }
//   overrides: { theme: "dark", font: { size: 18 } }
//   result: { theme: "dark", font: { size: 18, family: "Arial" } }

interface Options {
  theme: string;
  font: {
    size: number;
    family: string;
  };
  debug: boolean;
}

function exercise17(defaults: Options, overrides: Partial<DeepPartial<Options>>): Options {
  // YOUR CODE HERE
  return { ...defaults };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// Uncomment to test:
// const defaults17: Options = { theme: "light", font: { size: 14, family: "Arial" }, debug: false };
// const overrides17 = { theme: "dark", font: { size: 18 } };
// const result17 = exercise17(defaults17, overrides17);
// console.log(result17);
// Expected: { theme: "dark", font: { size: 18, family: "Arial" }, debug: false }
// console.log(defaults17.font.size); // Expected: 14 (not mutated)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Constructor function + prototype pattern
//
// Create a constructor function `createCounter` that returns an object with:
//   - value: number        — current count (starts at `start` parameter)
//   - increment(): void    — adds `step` to value
//   - decrement(): void    — subtracts `step` from value
//   - reset(): void        — resets value back to the original `start`
//   - toString(): string   — returns "Counter(value)"
//
// Do NOT use classes. Use a plain factory function that returns an object.

interface Counter {
  value: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  toString: () => string;
}

function exercise18(start: number, step: number): Counter {
  // YOUR CODE HERE
  return {
    value: 0,
    increment() {},
    decrement() {},
    reset() {},
    toString() {
      return "";
    },
  };
}

// Uncomment to test:
// const counter = exercise18(10, 3);
// console.log(counter.value);      // Expected: 10
// counter.increment();
// counter.increment();
// console.log(counter.value);      // Expected: 16
// counter.decrement();
// console.log(counter.value);      // Expected: 13
// counter.reset();
// console.log(counter.value);      // Expected: 10
// console.log(counter.toString()); // Expected: "Counter(10)"
