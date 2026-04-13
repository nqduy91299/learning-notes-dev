// ============================================================================
// 04-spread-rest: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/02-objects-arrays/04-spread-rest/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Rest parameters basics
//
// What does each console.log print?

function exercise1() {
  function gather(first: string, ...rest: string[]) {
    console.log(first);
    console.log(rest);
    console.log(rest.length);
  }

  gather("a", "b", "c", "d");
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Spread in function calls
//
// What does each console.log print?

function exercise2() {
  const numbers = [5, 2, 8, 1, 9];
  console.log(Math.max(...numbers));
  console.log(Math.min(...numbers));

  const parts = [3, 7];
  console.log(Math.max(1, ...parts, 10, ...numbers));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Spread in arrays
//
// What does each console.log print?

function exercise3() {
  const a = [1, 2];
  const b = [3, 4];

  const c = [...a, ...b];
  const d = [...b, 0, ...a];
  const e = [..."hello"];

  console.log(c);
  console.log(d);
  console.log(e);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Spread in objects — override order
//
// What does each console.log print?

function exercise4() {
  const defaults = { color: "red", size: "medium", bold: false };
  const custom = { size: "large", bold: true };

  const result1 = { ...defaults, ...custom };
  const result2 = { ...custom, ...defaults };

  console.log(result1);
  console.log(result2);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Shallow copy trap
//
// What does each console.log print?

function exercise5() {
  const original = { name: "Alice", scores: [10, 20] };
  const copy = { ...original };

  copy.name = "Bob";
  copy.scores.push(30);

  console.log(original.name);
  console.log(original.scores);
  console.log(copy.name);
  console.log(copy.scores);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Object rest in destructuring
//
// What does each console.log print?

function exercise6() {
  const user = { id: 1, name: "Alice", role: "admin", active: true };

  const { id, ...profile } = user;

  console.log(id);
  console.log(profile);
  console.log("id" in profile);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Array rest in destructuring
//
// What does each console.log print?

function exercise7() {
  const [first, , third, ...rest] = [10, 20, 30, 40, 50, 60];

  console.log(first);
  console.log(third);
  console.log(rest);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Spreading null/undefined in objects vs arrays
//
// What happens for each operation?

function exercise8() {
  const obj = { ...null, ...undefined, x: 1 };
  console.log(obj);

  try {
    const arr = [...(null as unknown as number[])];
    console.log(arr);
  } catch (e) {
    console.log("Error:", (e as Error).message);
  }
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Spread with strings and Set
//
// What does each console.log print?

function exercise9() {
  const chars = [..."spread"];
  console.log(chars);

  const unique = [...new Set("mississippi")];
  console.log(unique);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Spread creates a new reference
//
// What does each console.log print?

function exercise10() {
  const arr1 = [1, 2, 3];
  const arr2 = [...arr1];
  const arr3 = arr1;

  arr2.push(4);
  arr3.push(5);

  console.log(arr1);
  console.log(arr2);
  console.log(arr3);
  console.log(arr1 === arr3);
  console.log(arr1 === arr2);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Shallow copy mutation
//
// The function is supposed to add a tag to a user without modifying the original.
// But it mutates the original user's tags. Fix it.

interface User {
  name: string;
  tags: string[];
}

function exercise11(user: User, newTag: string): User {
  const updated = { ...user };
  updated.tags.push(newTag);
  return updated;
}

// Uncomment to test:
// const user11 = { name: "Alice", tags: ["admin"] };
// const updated11 = exercise11(user11, "editor");
// console.log(user11.tags);    // Expected: ["admin"]         (should NOT be mutated)
// console.log(updated11.tags); // Expected: ["admin", "editor"]

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Spread order for defaults
//
// This function merges user options with defaults. But the defaults
// are overwriting the user's values. Fix the order.

interface Options {
  theme: string;
  fontSize: number;
  showLineNumbers: boolean;
}

function exercise12(userOptions: Partial<Options>): Options {
  const defaults: Options = { theme: "light", fontSize: 14, showLineNumbers: true };

  return { ...userOptions, ...defaults };
}

// Uncomment to test:
// console.log(exercise12({ theme: "dark", fontSize: 18 }));
// Expected: { theme: "dark", fontSize: 18, showLineNumbers: true }

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: Deep copy needed
//
// This function is supposed to create an independent copy of a config.
// But nested changes still affect the original. Fix it using structuredClone.

interface Config {
  app: string;
  server: { host: string; port: number };
  features: string[];
}

function exercise13(config: Config): Config {
  return { ...config };
}

// Uncomment to test:
// const config13: Config = {
//   app: "MyApp",
//   server: { host: "localhost", port: 3000 },
//   features: ["auth", "logging"],
// };
// const copy13 = exercise13(config13);
// copy13.server.port = 8080;
// copy13.features.push("caching");
// console.log(config13.server.port);  // Expected: 3000 (not 8080)
// console.log(config13.features);     // Expected: ["auth", "logging"] (not 3 items)

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Rest parameters
//
// Implement a function that takes a separator string and any number of
// additional string arguments, then joins them with the separator.
//
// Example: joinWith("-", "a", "b", "c") → "a-b-c"
// Example: joinWith(", ", "hello", "world") → "hello, world"
// Example: joinWith("-") → ""

function exercise14(separator: string, ...parts: string[]): string {
  // YOUR CODE HERE
  return "";
}

// Uncomment to test:
// console.log(exercise14("-", "a", "b", "c"));       // Expected: "a-b-c"
// console.log(exercise14(", ", "hello", "world"));    // Expected: "hello, world"
// console.log(exercise14("-"));                       // Expected: ""

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Object spread for immutable update
//
// Implement a function that takes a user object and an object of updates,
// and returns a NEW user object with the updates applied.
// The original user must not be mutated.
// If updates contains nested objects, they should be deeply independent
// from the original (use structuredClone for nested data).

interface UserProfile {
  name: string;
  age: number;
  address: {
    city: string;
    zip: string;
  };
}

function exercise15(
  user: UserProfile,
  updates: Partial<UserProfile>
): UserProfile {
  // YOUR CODE HERE
  return { ...user };
}

// Uncomment to test:
// const user15: UserProfile = {
//   name: "Alice",
//   age: 30,
//   address: { city: "NYC", zip: "10001" },
// };
// const updated15 = exercise15(user15, { name: "Bob", address: { city: "LA", zip: "90001" } });
// console.log(updated15);
// Expected: { name: "Bob", age: 30, address: { city: "LA", zip: "90001" } }
// console.log(user15.name);          // Expected: "Alice" (unchanged)
// console.log(user15.address.city);  // Expected: "NYC" (unchanged)
// updated15.address.zip = "99999";
// console.log(user15.address.zip);   // Expected: "10001" (unchanged — deep independence)

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Rest destructuring to omit keys
//
// Implement a function that takes an object and an array of keys to omit.
// Return a new object without those keys.
//
// Example: omitKeys({ a: 1, b: 2, c: 3 }, ["b"]) → { a: 1, c: 3 }

function exercise16<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// console.log(exercise16({ a: 1, b: 2, c: 3 }, ["b"]));
// Expected: { a: 1, c: 3 }
// console.log(exercise16({ name: "Alice", password: "secret", role: "admin" }, ["password"]));
// Expected: { name: "Alice", role: "admin" }
// console.log(exercise16({ x: 10, y: 20, z: 30 }, ["x", "z"]));
// Expected: { y: 20 }

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Merge multiple objects with spread
//
// Implement a function that merges any number of objects into one.
// Later objects override earlier ones for duplicate keys.
// Return a new object (no mutation).
//
// Example: mergeAll({ a: 1 }, { b: 2 }, { a: 3, c: 4 }) → { a: 3, b: 2, c: 4 }

function exercise17(
  ...objects: Record<string, unknown>[]
): Record<string, unknown> {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// console.log(exercise17({ a: 1 }, { b: 2 }, { a: 3, c: 4 }));
// Expected: { a: 3, b: 2, c: 4 }
// console.log(exercise17({ x: 1 }, { x: 2 }, { x: 3 }));
// Expected: { x: 3 }
// console.log(exercise17());
// Expected: {}

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Collect and redistribute with rest/spread
//
// Implement a function `groupBy` that takes a key and any number of objects.
// It groups them by the value of the given key.
//
// Example:
//   groupBy("role",
//     { name: "Alice", role: "admin" },
//     { name: "Bob", role: "user" },
//     { name: "Charlie", role: "admin" },
//   )
//   → { admin: [{ name: "Alice", role: "admin" }, { name: "Charlie", role: "admin" }],
//       user: [{ name: "Bob", role: "user" }] }

function exercise18(
  key: string,
  ...items: Record<string, unknown>[]
): Record<string, Record<string, unknown>[]> {
  // YOUR CODE HERE
  return {};
}

// Uncomment to test:
// console.log(exercise18("role",
//   { name: "Alice", role: "admin" },
//   { name: "Bob", role: "user" },
//   { name: "Charlie", role: "admin" },
// ));
// Expected: {
//   admin: [{ name: "Alice", role: "admin" }, { name: "Charlie", role: "admin" }],
//   user:  [{ name: "Bob", role: "user" }]
// }
// console.log(exercise18("type",
//   { id: 1, type: "A" },
//   { id: 2, type: "B" },
//   { id: 3, type: "A" },
// ));
// Expected: {
//   A: [{ id: 1, type: "A" }, { id: 3, type: "A" }],
//   B: [{ id: 2, type: "B" }]
// }
