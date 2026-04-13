// ============================================================================
// 04-spread-rest: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Rest parameters basics

function solution1() {
  function gather(first: string, ...rest: string[]) {
    console.log(first);       // "a"
    console.log(rest);        // ["b", "c", "d"]
    console.log(rest.length); // 3
  }

  gather("a", "b", "c", "d");
}

// ANSWER:
// Log 1: "a"
// Log 2: ["b", "c", "d"]
// Log 3: 3
//
// Explanation:
// `first` captures the first argument. `...rest` collects all remaining
// arguments into a real array. 4 args total - 1 named = 3 in rest.
// See README → Section 1: Rest Parameters

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Spread in function calls

function solution2() {
  const numbers = [5, 2, 8, 1, 9];
  console.log(Math.max(...numbers));                   // 9
  console.log(Math.min(...numbers));                   // 1
  console.log(Math.max(1, ...[3, 7], 10, ...numbers)); // 10
}

// ANSWER:
// Log 1: 9
// Log 2: 1
// Log 3: 10
//
// Explanation:
// Spread expands the array into individual arguments.
// Math.max(...numbers) → Math.max(5, 2, 8, 1, 9) → 9.
// The third call: Math.max(1, 3, 7, 10, 5, 2, 8, 1, 9) → 10.
// See README → Section 7: Spread in Function Calls

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Spread in arrays

function solution3() {
  const a = [1, 2];
  const b = [3, 4];

  const c = [...a, ...b];
  const d = [...b, 0, ...a];
  const e = [..."hello"];

  console.log(c); // [1, 2, 3, 4]
  console.log(d); // [3, 4, 0, 1, 2]
  console.log(e); // ["h", "e", "l", "l", "o"]
}

// ANSWER:
// Log 1: [1, 2, 3, 4]
// Log 2: [3, 4, 0, 1, 2]
// Log 3: ["h", "e", "l", "l", "o"]
//
// Explanation:
// Spread in array literals inserts each element. String spread uses
// the string iterator, splitting into individual characters.
// See README → Section 3: Spread in Arrays & Section 8: Spread with Strings

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Spread in objects — override order

function solution4() {
  const defaults = { color: "red", size: "medium", bold: false };
  const custom = { size: "large", bold: true };

  const result1 = { ...defaults, ...custom };
  const result2 = { ...custom, ...defaults };

  console.log(result1); // { color: "red", size: "large", bold: true }
  console.log(result2); // { size: "medium", bold: false, color: "red" }
}

// ANSWER:
// Log 1: { color: "red", size: "large", bold: true }
// Log 2: { size: "medium", bold: false, color: "red" }
//
// Explanation:
// Later properties overwrite earlier ones with the same key.
// result1: defaults spread first, then custom overwrites `size` and `bold`.
// result2: custom spread first, then defaults overwrites `size` and `bold` back.
// See README → Section 4: Spread in Objects

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Shallow copy trap

function solution5() {
  const original = { name: "Alice", scores: [10, 20] };
  const copy = { ...original };

  copy.name = "Bob";
  copy.scores.push(30);

  console.log(original.name);   // "Alice"
  console.log(original.scores); // [10, 20, 30]
  console.log(copy.name);       // "Bob"
  console.log(copy.scores);     // [10, 20, 30]
}

// ANSWER:
// Log 1: "Alice"
// Log 2: [10, 20, 30]
// Log 3: "Bob"
// Log 4: [10, 20, 30]
//
// Explanation:
// Spread creates a shallow copy. `name` is a primitive, so it's independent.
// `scores` is an array (object reference) — both original and copy point to
// the same array in memory. Pushing to one affects both.
// See README → Section 5: Shallow Copy

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Object rest in destructuring

function solution6() {
  const user = { id: 1, name: "Alice", role: "admin", active: true };

  const { id, ...profile } = user;

  console.log(id);              // 1
  console.log(profile);         // { name: "Alice", role: "admin", active: true }
  console.log("id" in profile); // false
}

// ANSWER:
// Log 1: 1
// Log 2: { name: "Alice", role: "admin", active: true }
// Log 3: false
//
// Explanation:
// `id` is extracted as its own variable. `...profile` collects all remaining
// properties into a new object. The `id` key is NOT included in `profile`.
// See README → Section 9: Object Rest in Destructuring

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Array rest in destructuring

function solution7() {
  const [first, , third, ...rest] = [10, 20, 30, 40, 50, 60];

  console.log(first); // 10
  console.log(third);  // 30
  console.log(rest);   // [40, 50, 60]
}

// ANSWER:
// Log 1: 10
// Log 2: 30
// Log 3: [40, 50, 60]
//
// Explanation:
// `first` gets index 0 (10). The empty slot `, ,` skips index 1 (20).
// `third` gets index 2 (30). `...rest` collects indices 3, 4, 5 → [40, 50, 60].
// See README → Section 9: Array rest in destructuring

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Spreading null/undefined in objects vs arrays

function solution8() {
  const obj = { ...null, ...undefined, x: 1 };
  console.log(obj); // { x: 1 }

  try {
    const arr = [...(null as unknown as number[])];
    console.log(arr);
  } catch (e) {
    console.log("Error:", (e as Error).message); // "Error: null is not iterable ..."
  }
}

// ANSWER:
// Log 1: { x: 1 }
// Log 2: "Error: null is not iterable ..." (TypeError message varies by engine)
//
// Explanation:
// In object spread, null and undefined are silently ignored — no error.
// In array spread, the value must be iterable. null is not iterable → TypeError.
// See README → Section 10: Common Gotchas → Gotcha 4

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Spread with strings and Set

function solution9() {
  const chars = [..."spread"];
  console.log(chars); // ["s", "p", "r", "e", "a", "d"]

  const unique = [...new Set("mississippi")];
  console.log(unique); // ["m", "i", "s", "p"]
}

// ANSWER:
// Log 1: ["s", "p", "r", "e", "a", "d"]
// Log 2: ["m", "i", "s", "p"]
//
// Explanation:
// Spreading a string uses its iterator to produce individual characters.
// `new Set("mississippi")` keeps only unique characters in insertion order,
// then spread converts the Set to an array.
// See README → Section 8: Spread with Strings

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Spread creates a new reference

function solution10() {
  const arr1 = [1, 2, 3];
  const arr2 = [...arr1];
  const arr3 = arr1;

  arr2.push(4);
  arr3.push(5);

  console.log(arr1);          // [1, 2, 3, 5]
  console.log(arr2);          // [1, 2, 3, 4]
  console.log(arr3);          // [1, 2, 3, 5]
  console.log(arr1 === arr3); // true
  console.log(arr1 === arr2); // false
}

// ANSWER:
// Log 1: [1, 2, 3, 5]
// Log 2: [1, 2, 3, 4]
// Log 3: [1, 2, 3, 5]
// Log 4: true
// Log 5: false
//
// Explanation:
// `arr2 = [...arr1]` creates a NEW array — separate reference.
// `arr3 = arr1` is just another reference to the SAME array.
// Pushing to arr3 also pushes to arr1 (same object). arr2 is independent.
// `===` checks reference identity, not content.
// See README → Section 5: Shallow Copy

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Shallow copy mutation

interface User {
  name: string;
  tags: string[];
}

function solution11(user: User, newTag: string): User {
  const updated = { ...user, tags: [...user.tags, newTag] }; // FIX: spread tags into new array
  return updated;
}

// Explanation:
// The original code spread the user object (shallow copy) then mutated
// `updated.tags` with `.push()`. Since `tags` is an array (reference type),
// both `updated` and the original share the same array.
// Fix: create a new tags array with `[...user.tags, newTag]` to avoid mutation.
// See README → Section 5: Shallow Copy & Section 10: Gotcha 1

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Spread order for defaults

interface Options {
  theme: string;
  fontSize: number;
  showLineNumbers: boolean;
}

function solution12(userOptions: Partial<Options>): Options {
  const defaults: Options = { theme: "light", fontSize: 14, showLineNumbers: true };

  return { ...defaults, ...userOptions }; // FIX: defaults first, user overrides last
}

// Explanation:
// The original had `{ ...userOptions, ...defaults }` — defaults came LAST,
// so they overwrote user values. In spread, later keys win.
// Fix: put defaults first and userOptions last so user values override defaults.
// See README → Section 4: Spread in Objects & Section 10: Gotcha 2

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: Deep copy needed

interface Config {
  app: string;
  server: { host: string; port: number };
  features: string[];
}

function solution13(config: Config): Config {
  return structuredClone(config); // FIX: use structuredClone for deep copy
}

// Explanation:
// Spread (`{ ...config }`) creates a shallow copy. The `server` object and
// `features` array are still shared references. `structuredClone()` creates
// a fully independent deep copy where nested objects are also duplicated.
// See README → Section 6: Deep Copy

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Rest parameters

function solution14(separator: string, ...parts: string[]): string {
  return parts.join(separator);
}

// Explanation:
// `...parts` collects all arguments after `separator` into a real array.
// Array.prototype.join() concatenates them with the separator between each.
// If no parts are passed, `parts` is `[]` and `[].join(...)` returns `""`.
// See README → Section 1: Rest Parameters

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Object spread for immutable update

interface UserProfile {
  name: string;
  age: number;
  address: {
    city: string;
    zip: string;
  };
}

function solution15(
  user: UserProfile,
  updates: Partial<UserProfile>
): UserProfile {
  const base = structuredClone(user);
  return { ...base, ...updates };
}

// Explanation:
// We first deep-clone the original user to ensure full independence of nested
// objects. Then we spread updates on top so they override matching keys.
// This way, `user.address` remains untouched even if `updates.address` is set,
// and any later mutations to the returned object won't affect the original.
// See README → Section 5: Shallow Copy & Section 6: Deep Copy

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Rest destructuring to omit keys

function solution16<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  const keysToOmit = new Set(keys);

  for (const [key, value] of Object.entries(obj)) {
    if (!keysToOmit.has(key)) {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}

// Explanation:
// We iterate over all entries of the object and include only those whose key
// is NOT in the omit set. Using a Set for O(1) lookups is efficient.
// A pure destructuring approach with `...rest` only works for statically-known
// keys, so we use a loop for the dynamic case.
// See README → Section 9: Object Rest in Destructuring

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Merge multiple objects with spread

function solution17(
  ...objects: Record<string, unknown>[]
): Record<string, unknown> {
  let result: Record<string, unknown> = {};
  for (const obj of objects) {
    result = { ...result, ...obj };
  }
  return result;
}

// Explanation:
// We iterate over all provided objects and spread each one into the result.
// Later objects' keys overwrite earlier ones, matching the described behavior.
// An alternative one-liner: `Object.assign({}, ...objects)`.
// See README → Section 4: Spread in Objects

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Collect and redistribute with rest/spread

function solution18(
  key: string,
  ...items: Record<string, unknown>[]
): Record<string, Record<string, unknown>[]> {
  const groups: Record<string, Record<string, unknown>[]> = {};

  for (const item of items) {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  }

  return groups;
}

// Explanation:
// The function uses rest parameters to collect any number of items.
// For each item, it reads the value at the given `key`, converts to string
// (for use as an object key), and pushes the item into the appropriate group.
// This pattern of rest + iteration is common in utility functions.
// See README → Section 1: Rest Parameters

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Rest parameters basics ===");
solution1();

console.log("\n=== Exercise 2: Spread in function calls ===");
solution2();

console.log("\n=== Exercise 3: Spread in arrays ===");
solution3();

console.log("\n=== Exercise 4: Spread in objects — override order ===");
solution4();

console.log("\n=== Exercise 5: Shallow copy trap ===");
solution5();

console.log("\n=== Exercise 6: Object rest in destructuring ===");
solution6();

console.log("\n=== Exercise 7: Array rest in destructuring ===");
solution7();

console.log("\n=== Exercise 8: Spreading null/undefined ===");
solution8();

console.log("\n=== Exercise 9: Spread with strings and Set ===");
solution9();

console.log("\n=== Exercise 10: Spread creates a new reference ===");
solution10();

console.log("\n=== Exercise 11: Fix shallow copy mutation ===");
const user11 = { name: "Alice", tags: ["admin"] };
const updated11 = solution11(user11, "editor");
console.log(user11.tags);    // ["admin"]
console.log(updated11.tags); // ["admin", "editor"]

console.log("\n=== Exercise 12: Fix spread order ===");
console.log(solution12({ theme: "dark", fontSize: 18 }));
// { theme: "dark", fontSize: 18, showLineNumbers: true }

console.log("\n=== Exercise 13: Fix deep copy ===");
const config13: Config = {
  app: "MyApp",
  server: { host: "localhost", port: 3000 },
  features: ["auth", "logging"],
};
const copy13 = solution13(config13);
copy13.server.port = 8080;
copy13.features.push("caching");
console.log(config13.server.port); // 3000
console.log(config13.features);    // ["auth", "logging"]

console.log("\n=== Exercise 14: joinWith ===");
console.log(solution14("-", "a", "b", "c"));       // "a-b-c"
console.log(solution14(", ", "hello", "world"));    // "hello, world"
console.log(solution14("-"));                       // ""

console.log("\n=== Exercise 15: Immutable user update ===");
const user15: UserProfile = {
  name: "Alice",
  age: 30,
  address: { city: "NYC", zip: "10001" },
};
const updated15 = solution15(user15, { name: "Bob", address: { city: "LA", zip: "90001" } });
console.log(updated15);
// { name: "Bob", age: 30, address: { city: "LA", zip: "90001" } }
console.log(user15.name);         // "Alice"
console.log(user15.address.city); // "NYC"
updated15.address.zip = "99999";
console.log(user15.address.zip);  // "10001"

console.log("\n=== Exercise 16: omitKeys ===");
console.log(solution16({ a: 1, b: 2, c: 3 }, ["b"]));
// { a: 1, c: 3 }
console.log(solution16({ name: "Alice", password: "secret", role: "admin" }, ["password"]));
// { name: "Alice", role: "admin" }
console.log(solution16({ x: 10, y: 20, z: 30 }, ["x", "z"]));
// { y: 20 }

console.log("\n=== Exercise 17: mergeAll ===");
console.log(solution17({ a: 1 }, { b: 2 }, { a: 3, c: 4 }));
// { a: 3, b: 2, c: 4 }
console.log(solution17({ x: 1 }, { x: 2 }, { x: 3 }));
// { x: 3 }
console.log(solution17());
// {}

console.log("\n=== Exercise 18: groupBy ===");
console.log(solution18("role",
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
  { name: "Charlie", role: "admin" },
));
// { admin: [...], user: [...] }
console.log(solution18("type",
  { id: 1, type: "A" },
  { id: 2, type: "B" },
  { id: 3, type: "A" },
));
// { A: [...], B: [...] }
