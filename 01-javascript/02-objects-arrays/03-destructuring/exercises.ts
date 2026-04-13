// ============================================================================
// 03-destructuring: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/02-objects-arrays/03-destructuring/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Basic array destructuring with skipping
//
// What does each console.log print?

function exercise1() {
  const colors = ["red", "green", "blue", "yellow", "purple"];
  const [first, , third, ...remaining] = colors;

  console.log(first);
  console.log(third);
  console.log(remaining);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Default values — undefined vs null
//
// What does each console.log print?

function exercise2() {
  const [a = 10, b = 20, c = 30] = [1, undefined, null];

  console.log(a);
  console.log(b);
  console.log(c);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Object destructuring with rename and default
//
// What does each console.log print?

function exercise3() {
  const config = { host: "localhost", port: 8080 };
  const { host: h, port: p, protocol: proto = "https" } = config;

  console.log(h);
  console.log(p);
  console.log(proto);

  try {
    // @ts-expect-error — checking runtime behavior
    console.log(host);
  } catch {
    console.log("host is not defined");
  }
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Nested destructuring
//
// What does each console.log print?

function exercise4() {
  const data = {
    user: {
      name: "Alice",
      scores: [95, 87, 92],
    },
  };

  const {
    user: {
      name,
      scores: [first, ...rest],
    },
  } = data;

  console.log(name);
  console.log(first);
  console.log(rest);

  try {
    // @ts-expect-error — checking runtime behavior
    console.log(user);
  } catch {
    console.log("user is not defined");
  }
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Swapping variables
//
// What does each console.log print?

function exercise5() {
  let x = "hello";
  let y = "world";
  let z = "!";

  [x, y, z] = [z, x, y];

  console.log(x);
  console.log(y);
  console.log(z);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Object rest pattern
//
// What does each console.log print?

function exercise6() {
  const product = { id: 1, name: "Widget", price: 9.99, stock: 100, category: "tools" };
  const { id, name, ...details } = product;

  console.log(id);
  console.log(name);
  console.log(Object.keys(details));
  console.log(details.price);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Destructuring from a string (iterable)
//
// What does each console.log print?

function exercise7() {
  const [a, b, ...rest] = "Hello";

  console.log(a);
  console.log(b);
  console.log(rest);
  console.log(rest.length);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Computed property names in destructuring
//
// What does each console.log print?

function exercise8() {
  const field = "email";
  const data = { email: "alice@example.com", name: "Alice" };

  const { [field]: emailValue, name: userName } = data;

  console.log(emailValue);
  console.log(userName);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Nested defaults to prevent TypeError
//
// What does each console.log print?

function exercise9() {
  const obj: { a?: { b?: number } } = {};

  // Without default at parent level — this would throw:
  // const { a: { b } } = obj; // TypeError!

  // With default:
  const { a: { b = 42 } = {} } = obj;

  console.log(b);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Parentheses gotcha — object destructuring without declaration
//
// What does each console.log print?

function exercise10() {
  let a: number, b: number;

  ({ a, b } = { a: 100, b: 200 });

  console.log(a);
  console.log(b);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Destructuring from Map entries
//
// What does each console.log print?

function exercise11() {
  const map = new Map<string, number>([
    ["x", 10],
    ["y", 20],
    ["z", 30],
  ]);

  const [[k1, v1], , [k3, v3]] = map;

  console.log(k1, v1);
  console.log(k3, v3);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Default value evaluation is lazy
//
// What does each console.log print, and in what order?

function exercise12() {
  let callCount = 0;

  function getDefault() {
    callCount++;
    return "default";
  }

  const [a = getDefault(), b = getDefault()] = ["provided"];

  console.log(a);
  console.log(b);
  console.log(callCount);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise12();

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: Nested destructuring TypeError
//
// This function crashes when `config.database` is not provided.
// Fix it so it safely destructures with sensible defaults.
// Do NOT change the function signature or return type.

interface DbConfig {
  database?: {
    host?: string;
    port?: number;
  };
  logging?: boolean;
}

function exercise13(config: DbConfig): string {
  const {
    database: { host, port },
    logging,
  } = config;

  return `${host}:${port} (logging: ${logging})`;
}

// Uncomment to test:
// console.log(exercise13({}));
// Expected: "localhost:5432 (logging: false)"
// console.log(exercise13({ database: { host: "db.example.com" } }));
// Expected: "db.example.com:5432 (logging: false)"
// console.log(exercise13({ database: { host: "prod", port: 3306 }, logging: true }));
// Expected: "prod:3306 (logging: true)"

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: Destructuring function params without default for whole object
//
// This function crashes when called with no arguments.
// Fix it so calling `exercise14()` returns the default greeting.
// Do NOT change the return type.

function exercise14({
  greeting = "Hello",
  name = "World",
}: {
  greeting?: string;
  name?: string;
}): string {
  return `${greeting}, ${name}!`;
}

// Uncomment to test:
// console.log(exercise14({}));                     // Expected: "Hello, World!"
// console.log(exercise14({ name: "Alice" }));      // Expected: "Hello, Alice!"
// console.log(exercise14());                       // Expected: "Hello, World!" — currently CRASHES

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Extract and rename with rest
//
// Given an object, extract the `_id` property as `id`, the `__v` property
// as `version`, and collect ALL remaining properties into `data`.
// Return { id, version, data }.

function exercise15(input: Record<string, unknown>): {
  id: unknown;
  version: unknown;
  data: Record<string, unknown>;
} {
  // YOUR CODE HERE

  return { id: undefined, version: undefined, data: {} };
}

// Uncomment to test:
// console.log(exercise15({ _id: "abc", __v: 3, name: "Alice", age: 30 }));
// Expected: { id: "abc", version: 3, data: { name: "Alice", age: 30 } }
// console.log(exercise15({ _id: 1, __v: 0 }));
// Expected: { id: 1, version: 0, data: {} }

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Deep pluck — nested destructuring in a function
//
// Implement a function that takes an API response object and returns
// a simplified user profile. Use destructuring (including nested) to
// extract all the needed fields.

interface ApiResponse {
  status: number;
  data: {
    user: {
      id: number;
      details: {
        firstName: string;
        lastName: string;
        contact: {
          email: string;
          phone?: string;
        };
      };
      roles: string[];
    };
  };
}

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  primaryRole: string;
}

function exercise16(response: ApiResponse): UserProfile {
  // YOUR CODE HERE — use destructuring to extract fields

  return {
    id: 0,
    fullName: "",
    email: "",
    phone: "",
    primaryRole: "",
  };
}

// Uncomment to test:
// const apiResponse: ApiResponse = {
//   status: 200,
//   data: {
//     user: {
//       id: 42,
//       details: {
//         firstName: "Alice",
//         lastName: "Smith",
//         contact: {
//           email: "alice@example.com",
//           phone: "555-1234",
//         },
//       },
//       roles: ["admin", "editor"],
//     },
//   },
// };
// console.log(exercise16(apiResponse));
// Expected: { id: 42, fullName: "Alice Smith", email: "alice@example.com", phone: "555-1234", primaryRole: "admin" }
//
// const minimalResponse: ApiResponse = {
//   status: 200,
//   data: {
//     user: {
//       id: 99,
//       details: {
//         firstName: "Bob",
//         lastName: "Jones",
//         contact: { email: "bob@test.com" },
//       },
//       roles: ["viewer"],
//     },
//   },
// };
// console.log(exercise16(minimalResponse));
// Expected: { id: 99, fullName: "Bob Jones", email: "bob@test.com", phone: "N/A", primaryRole: "viewer" }

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Config merger using destructuring
//
// Implement a function that takes partial config and returns a full config
// with defaults applied. Use destructuring with defaults in the implementation.
// The returned object must always have ALL fields.

interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: boolean;
  };
  database: {
    url: string;
    pool: number;
  };
  features: {
    darkMode: boolean;
    notifications: boolean;
  };
}

// DeepPartial helper — all fields optional recursively
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function exercise17(partial: DeepPartial<AppConfig>): AppConfig {
  // YOUR CODE HERE — use destructuring with defaults

  return {
    server: { host: "", port: 0, ssl: false },
    database: { url: "", pool: 0 },
    features: { darkMode: false, notifications: false },
  };
}

// Uncomment to test:
// console.log(exercise17({}));
// Expected: {
//   server: { host: "localhost", port: 3000, ssl: false },
//   database: { url: "mongodb://localhost:27017", pool: 5 },
//   features: { darkMode: false, notifications: true }
// }
// console.log(exercise17({ server: { port: 8080, ssl: true }, features: { darkMode: true } }));
// Expected: {
//   server: { host: "localhost", port: 8080, ssl: true },
//   database: { url: "mongodb://localhost:27017", pool: 5 },
//   features: { darkMode: true, notifications: true }
// }

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Destructuring-based object transformer
//
// Implement a function that takes an array of objects and a list of keys
// to pick. For each object, return a new object containing only those keys.
// Use destructuring (computed property names) in your solution.

function exercise18<T extends Record<string, unknown>>(
  items: T[],
  keys: (keyof T & string)[],
): Partial<T>[] {
  // YOUR CODE HERE

  return items.map(() => ({}));
}

// Uncomment to test:
// const people = [
//   { name: "Alice", age: 30, city: "NYC", job: "engineer" },
//   { name: "Bob", age: 25, city: "LA", job: "designer" },
//   { name: "Charlie", age: 35, city: "SF", job: "manager" },
// ];
// console.log(exercise18(people, ["name", "city"]));
// Expected: [{ name: "Alice", city: "NYC" }, { name: "Bob", city: "LA" }, { name: "Charlie", city: "SF" }]
// console.log(exercise18(people, ["age"]));
// Expected: [{ age: 30 }, { age: 25 }, { age: 35 }]
