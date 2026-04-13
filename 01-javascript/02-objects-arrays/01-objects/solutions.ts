// ============================================================================
// 01-objects: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Object creation and reference

function solution1() {
  const a = { x: 1 };
  const b = a;
  b.x = 2;

  console.log(a.x);     // 2
  console.log(a === b);  // true
}

// ANSWER:
// Log 1: 2
// Log 2: true
//
// Explanation:
// Objects are stored by reference. `const b = a` copies the reference, not
// the object. Both `a` and `b` point to the same object in memory, so
// changing `b.x` also changes `a.x`. `a === b` is true because they hold
// the same reference.
// See README → Section 9: Object References and Copying

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Property order

function solution2() {
  const obj: Record<string, string> = {};
  obj["b"] = "B";
  obj["1"] = "one";
  obj["a"] = "A";
  obj["2"] = "two";

  console.log(Object.keys(obj)); // ["1", "2", "b", "a"]
}

// ANSWER:
// Log 1: ["1", "2", "b", "a"]
//
// Explanation:
// Integer-like keys ("1", "2") come first, sorted numerically.
// Non-integer string keys ("b", "a") follow in insertion order.
// Even though "b" was added first, integer keys always sort to the front.
// See README → Section 6: Property Order

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Property existence checks

function solution3() {
  const user: Record<string, unknown> = { name: "Alice", age: undefined };

  console.log("name" in user);           // true
  console.log("age" in user);            // true
  console.log(user.age !== undefined);   // false
  console.log("email" in user);          // false
}

// ANSWER:
// Log 1: true
// Log 2: true
// Log 3: false
// Log 4: false
//
// Explanation:
// The `in` operator checks if a property EXISTS, regardless of its value.
// `age` exists with value `undefined`, so `"age" in user` is true.
// But `user.age !== undefined` is false because the value IS undefined.
// This is why `in` is more reliable than checking against undefined.
// See README → Section 4: Property Existence Checks

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Shallow copy with spread

function solution4() {
  const original = { name: "Alice", scores: [90, 85] };
  const copy = { ...original };

  copy.name = "Bob";
  copy.scores.push(100);

  console.log(original.name);   // "Alice"
  console.log(original.scores); // [90, 85, 100]
  console.log(copy.name);       // "Bob"
}

// ANSWER:
// Log 1: "Alice"
// Log 2: [90, 85, 100]
// Log 3: "Bob"
//
// Explanation:
// Spread creates a SHALLOW copy. Primitive values (like `name`) are copied
// by value, so changing `copy.name` doesn't affect `original.name`.
// But `scores` is an array (object) — only the reference is copied. Both
// `original.scores` and `copy.scores` point to the same array, so pushing
// to one affects both.
// See README → Section 9: Shallow copy

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Object.freeze (shallow)

function solution5() {
  const config = Object.freeze({
    host: "localhost",
    db: { port: 5432 },
  });

  config.host = "remote";
  config.db.port = 3306;

  console.log(config.host);    // "localhost"
  console.log(config.db.port); // 3306
}

// ANSWER:
// Log 1: "localhost"
// Log 2: 3306
//
// Explanation:
// Object.freeze is SHALLOW. Top-level properties (like `host`) cannot be
// changed — the assignment silently fails. But nested objects (like `db`)
// are NOT frozen. `config.db` is still a mutable reference, so
// `config.db.port = 3306` works.
// See README → Section 11: Object.freeze/seal

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: "this" in methods

function solution6() {
  const user = {
    name: "Alice",
    greet() {
      return `Hi, I'm ${this.name}`;
    },
  };

  console.log(user.greet());  // "Hi, I'm Alice"

  const greetFn = user.greet;
  console.log(greetFn());     // "Hi, I'm undefined"
}

// ANSWER:
// Log 1: "Hi, I'm Alice"
// Log 2: "Hi, I'm undefined"
//
// Explanation:
// When called as `user.greet()`, `this` refers to `user`, so `this.name`
// is "Alice". When the method is extracted to a variable and called as a
// standalone function, `this` becomes `globalThis` (or `undefined` in
// strict mode). Since `globalThis.name` is typically `undefined`, we get
// "Hi, I'm undefined".
// See README → Section 8: "this" in Methods

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Constructor functions and new

function solution7() {
  function Car(this: { brand: string; speed: number }, brand: string) {
    this.brand = brand;
    this.speed = 0;
  }

  const car = new (Car as unknown as new (brand: string) => { brand: string; speed: number })("Toyota");

  console.log(car.brand);       // "Toyota"
  console.log(car.speed);       // 0
  console.log(car instanceof (Car as unknown as new (...args: unknown[]) => unknown)); // true
}

// ANSWER:
// Log 1: "Toyota"
// Log 2: 0
// Log 3: true
//
// Explanation:
// `new Car("Toyota")` does 4 things:
// 1. Creates a new empty object
// 2. Sets its [[Prototype]] to Car.prototype
// 3. Runs Car with `this` bound to the new object (sets brand & speed)
// 4. Returns the new object (since Car doesn't explicitly return an object)
// `instanceof` checks the prototype chain — car's prototype is Car.prototype.
// See README → Section 12: Constructor Functions and new

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: delete operator

function solution8() {
  const user: Record<string, unknown> = { name: "Alice", age: 30 };

  console.log(delete user.age);  // true
  console.log(user.age);         // undefined
  console.log("age" in user);    // false
  console.log(Object.keys(user)); // ["name"]
}

// ANSWER:
// Log 1: true
// Log 2: undefined
// Log 3: false
// Log 4: ["name"]
//
// Explanation:
// `delete` removes the property entirely from the object and returns true.
// After deletion, accessing `user.age` returns `undefined` (property doesn't
// exist), `"age" in user` is false, and Object.keys no longer includes it.
// See README → Section 5: Deleting Properties

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Object.keys/values/entries

function solution9() {
  const obj = { a: 1, b: 2, c: 3 };

  console.log(Object.keys(obj));     // ["a", "b", "c"]
  console.log(Object.values(obj));   // [1, 2, 3]
  console.log(Object.entries(obj).length); // 3
}

// ANSWER:
// Log 1: ["a", "b", "c"]
// Log 2: [1, 2, 3]
// Log 3: 3
//
// Explanation:
// Object.keys returns an array of own enumerable string keys.
// Object.values returns an array of the corresponding values.
// Object.entries returns an array of [key, value] pairs — 3 properties means
// length 3.
// See README → Section 10: Object.keys/values/entries

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Object equality

function solution10() {
  const a = { x: 1 };
  const b = { x: 1 };
  const c = a;

  console.log(a === b);  // false
  console.log(a === c);  // true
  console.log(JSON.stringify(a) === JSON.stringify(b)); // true
}

// ANSWER:
// Log 1: false
// Log 2: true
// Log 3: true
//
// Explanation:
// `a` and `b` are different objects in memory (different references), so
// `a === b` is false even though they have identical contents. `c` is the
// same reference as `a`, so `a === c` is true. JSON.stringify converts both
// to the string '{"x":1}', which are equal. Note: JSON comparison is fragile
// (key order matters, can't handle circular refs, drops functions).
// See README → Section 14: Common Gotchas → Reference vs. value

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Optional chaining

function solution11() {
  const user: {
    address?: { street?: string; zip?: string };
    getEmail?: () => string;
  } = {
    address: { street: "123 Main" },
  };

  console.log(user.address?.street);    // "123 Main"
  console.log(user.address?.zip);       // undefined
  console.log(user.getEmail?.());       // undefined
  console.log((user as Record<string, unknown>).contact?.toString()); // undefined
}

// ANSWER:
// Log 1: "123 Main"
// Log 2: undefined
// Log 3: undefined
// Log 4: undefined
//
// Explanation:
// Optional chaining `?.` short-circuits to `undefined` if the left side is
// null/undefined. `address` exists so `.street` resolves normally. `zip`
// doesn't exist on address, so it returns undefined. `getEmail` doesn't
// exist, so `?.()` returns undefined instead of throwing. `contact` doesn't
// exist, so `?.toString()` short-circuits to undefined.
// See README → Section 4: Optional chaining

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Property shorthand and computed properties

function solution12() {
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
  // { name: "Alice", age: 30, role: "admin", roleLevel: 5 }
}

// ANSWER:
// Log 1: { name: "Alice", age: 30, role: "admin", roleLevel: 5 }
//
// Explanation:
// Property shorthand: `name` becomes `name: "Alice"`, `age` becomes `age: 30`.
// Computed property `[key]` evaluates `key` ("role") as the property name.
// Template literal `${key}Level` computes to "roleLevel".
// See README → Section 2: Computed property names & Section 3: Property Shorthand

// ─── Exercise 13: Fix the Bug ──────────────────────────────────────────────
// Topic: Deep copy issue

interface UserProfile {
  name: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
  tags: string[];
}

function solution13(profile: UserProfile): UserProfile {
  return structuredClone(profile); // FIX: use structuredClone instead of spread
}

// Explanation:
// The spread operator `{ ...profile }` creates a shallow copy. The `settings`
// object and `tags` array are still shared references. `structuredClone`
// creates a true deep copy — all nested objects are independently cloned.
// See README → Section 9: Deep copy — structuredClone

// ─── Exercise 14: Fix the Bug ──────────────────────────────────────────────
// Topic: for...in includes inherited properties

function solution14(obj: Record<string, unknown>): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) { // FIX: filter to own properties only
      keys.push(key);
    }
  }
  return keys;
}

// Explanation:
// `for...in` iterates over ALL enumerable properties, including inherited
// ones from the prototype chain. Adding `Object.hasOwn(obj, key)` filters
// to only own properties. Alternatively, you could just use `Object.keys(obj)`.
// See README → Section 14: Common Gotchas → for...in includes inherited properties

// ─── Exercise 15: Fix the Bug ──────────────────────────────────────────────
// Topic: Object.freeze is shallow

function solution15<T extends Record<string, unknown>>(obj: T): Readonly<T> {
  Object.freeze(obj);

  for (const value of Object.values(obj)) {
    if (value !== null && typeof value === "object") {
      solution15(value as Record<string, unknown>); // FIX: recursively freeze nested objects
    }
  }

  return obj;
}

// Explanation:
// Object.freeze only freezes the top-level properties. Nested objects remain
// mutable. To truly deep-freeze, we recursively walk all values and freeze
// any that are objects. We check `typeof value === "object"` and exclude
// `null` (since `typeof null === "object"` is a JS quirk).
// See README → Section 11: Object.freeze/seal → "Both are shallow"

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Object.keys/values/entries transformation

function solution16(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value.toUpperCase()])
  );
}

// Explanation:
// 1. Object.entries converts { name: "alice" } to [["name", "alice"]]
// 2. .map transforms each [key, value] pair, uppercasing the value
// 3. Object.fromEntries converts the array of pairs back to an object
// This is the standard pattern for transforming object values.
// See README → Section 10: Common patterns

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Merging objects with defaults

interface Options {
  theme: string;
  font: {
    size: number;
    family: string;
  };
  debug: boolean;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function solution17(defaults: Options, overrides: Partial<DeepPartial<Options>>): Options {
  return {
    ...defaults,
    ...overrides,
    font: {
      ...defaults.font,
      ...(overrides.font ?? {}),
    },
  };
}

// Explanation:
// A simple spread `{ ...defaults, ...overrides }` would entirely replace
// the `font` object if overrides contains a `font` key — losing any
// defaults for unspecified font properties. We need to merge nested objects
// separately: spread defaults.font first, then overrides.font on top.
// We use `?? {}` to handle the case where overrides.font is undefined.
// Neither input is mutated because spread creates new objects.
// See README → Section 9: Shallow copy & Section 15: Best Practices

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Constructor function + prototype pattern

interface Counter {
  value: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  toString: () => string;
}

function solution18(start: number, step: number): Counter {
  const initial = start;

  return {
    value: start,
    increment() {
      this.value += step;
    },
    decrement() {
      this.value -= step;
    },
    reset() {
      this.value = initial;
    },
    toString() {
      return `Counter(${this.value})`;
    },
  };
}

// Explanation:
// We use a factory function that returns an object with methods. `start`
// and `step` are captured via closure. We store the initial value separately
// so `reset` can restore it. Methods use `this.value` to access the current
// count on the returned object. The `toString` method uses a template literal
// to format the output. This is the module/factory pattern — an alternative
// to constructor functions with `new`.
// See README → Section 7: Object Methods & Section 12: Constructor Functions

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Object reference ===");
solution1();

console.log("\n=== Exercise 2: Property order ===");
solution2();

console.log("\n=== Exercise 3: Property existence ===");
solution3();

console.log("\n=== Exercise 4: Shallow copy ===");
solution4();

console.log("\n=== Exercise 5: Object.freeze (shallow) ===");
solution5();

console.log("\n=== Exercise 6: this in methods ===");
solution6();

console.log("\n=== Exercise 7: Constructor and new ===");
solution7();

console.log("\n=== Exercise 8: delete operator ===");
solution8();

console.log("\n=== Exercise 9: Object.keys/values/entries ===");
solution9();

console.log("\n=== Exercise 10: Object equality ===");
solution10();

console.log("\n=== Exercise 11: Optional chaining ===");
solution11();

console.log("\n=== Exercise 12: Shorthand & computed ===");
solution12();

console.log("\n=== Exercise 13: Fix deep copy ===");
const original13: UserProfile = {
  name: "Alice",
  settings: { theme: "dark", notifications: true },
  tags: ["admin", "active"],
};
const copy13 = solution13(original13);
copy13.settings.theme = "light";
copy13.tags.push("modified");
console.log(original13.settings.theme); // "dark"
console.log(original13.tags);           // ["admin", "active"]

console.log("\n=== Exercise 14: Fix for...in ===");
const parent14 = { inherited: true };
const child14 = Object.create(parent14) as Record<string, unknown>;
child14.own1 = "a";
child14.own2 = "b";
console.log(solution14(child14)); // ["own1", "own2"]

console.log("\n=== Exercise 15: Fix deep freeze ===");
const settings15 = solution15({
  theme: "dark",
  db: { host: "localhost", port: 5432 },
  features: { logging: { enabled: true, level: "info" } },
});
(settings15.db as Record<string, unknown>).port = 9999;
console.log(settings15.db.port);  // 5432
(settings15.features.logging as Record<string, unknown>).level = "debug";
console.log(settings15.features.logging.level); // "info"

console.log("\n=== Exercise 16: Uppercase values ===");
console.log(solution16({ name: "alice", city: "nyc" }));
// { name: "ALICE", city: "NYC" }
console.log(solution16({}));
// {}

console.log("\n=== Exercise 17: Merge with defaults ===");
const defaults17: Options = { theme: "light", font: { size: 14, family: "Arial" }, debug: false };
const overrides17 = { theme: "dark", font: { size: 18 } };
const result17 = solution17(defaults17, overrides17);
console.log(result17);
// { theme: "dark", font: { size: 18, family: "Arial" }, debug: false }
console.log(defaults17.font.size); // 14 (not mutated)

console.log("\n=== Exercise 18: Counter factory ===");
const counter18 = solution18(10, 3);
console.log(counter18.value);      // 10
counter18.increment();
counter18.increment();
console.log(counter18.value);      // 16
counter18.decrement();
console.log(counter18.value);      // 13
counter18.reset();
console.log(counter18.value);      // 10
console.log(counter18.toString()); // "Counter(10)"
