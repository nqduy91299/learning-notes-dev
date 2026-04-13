// ============================================================================
// 03-destructuring: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Basic array destructuring with skipping

function solution1() {
  const colors = ["red", "green", "blue", "yellow", "purple"];
  const [first, , third, ...remaining] = colors;

  console.log(first);     // "red"
  console.log(third);     // "blue"
  console.log(remaining); // ["yellow", "purple"]
}

// ANSWER:
// Log 1: "red"
// Log 2: "blue"
// Log 3: ["yellow", "purple"]
//
// Explanation:
// `first` gets index 0 ("red"). The comma `, ,` skips index 1 ("green").
// `third` gets index 2 ("blue"). `...remaining` collects the rest: indices 3-4.
// See README → Section 1: Array Destructuring → Skipping elements & Rest element

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Default values — undefined vs null

function solution2() {
  const [a = 10, b = 20, c = 30] = [1, undefined, null];

  console.log(a); // 1
  console.log(b); // 20
  console.log(c); // null
}

// ANSWER:
// Log 1: 1
// Log 2: 20
// Log 3: null
//
// Explanation:
// `a` is 1 — the array value exists, so the default is unused.
// `b` is 20 — `undefined` triggers the default value.
// `c` is null — `null` does NOT trigger defaults! Only `undefined` does.
// See README → Section 11: Common Gotchas → Gotcha 1: undefined vs null

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Object destructuring with rename and default

function solution3() {
  const config = { host: "localhost", port: 8080 };
  const { host: h, port: p, protocol: proto = "https" } = config;

  console.log(h);     // "localhost"
  console.log(p);     // 8080
  console.log(proto); // "https"

  try {
    // @ts-expect-error — checking runtime behavior
    console.log(host);
  } catch {
    console.log("host is not defined"); // "host is not defined"
  }
}

// ANSWER:
// Log 1: "localhost"
// Log 2: 8080
// Log 3: "https"
// Log 4: "host is not defined"
//
// Explanation:
// `host: h` reads property `host` but creates variable `h` — `host` is NOT declared.
// `port: p` similarly creates `p`. `protocol: proto = "https"` uses the default
// because `config` has no `protocol` property (→ undefined → default applies).
// See README → Section 4: Object Destructuring → Renaming & Defaults

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Nested destructuring

function solution4() {
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

  console.log(name);  // "Alice"
  console.log(first); // 95
  console.log(rest);  // [87, 92]

  try {
    // @ts-expect-error — checking runtime behavior
    console.log(user);
  } catch {
    console.log("user is not defined"); // "user is not defined"
  }
}

// ANSWER:
// Log 1: "Alice"
// Log 2: 95
// Log 3: [87, 92]
// Log 4: "user is not defined"
//
// Explanation:
// `user:` is a pattern target, not a variable — only `name`, `first`, and `rest`
// are declared. Similarly `scores:` is a pattern target leading into array
// destructuring. `first` gets scores[0], `...rest` gets [scores[1], scores[2]].
// See README → Section 5: Nested Destructuring → Mixed

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Swapping variables

function solution5() {
  let x = "hello";
  let y = "world";
  let z = "!";

  [x, y, z] = [z, x, y];

  console.log(x); // "!"
  console.log(y); // "hello"
  console.log(z); // "world"
}

// ANSWER:
// Log 1: "!"
// Log 2: "hello"
// Log 3: "world"
//
// Explanation:
// The right side `[z, x, y]` is evaluated first using the ORIGINAL values:
// ["!", "hello", "world"]. Then these are assigned positionally to [x, y, z].
// See README → Section 3: Swapping Variables

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Object rest pattern

function solution6() {
  const product = { id: 1, name: "Widget", price: 9.99, stock: 100, category: "tools" };
  const { id, name, ...details } = product;

  console.log(id);                   // 1
  console.log(name);                 // "Widget"
  console.log(Object.keys(details)); // ["price", "stock", "category"]
  console.log(details.price);        // 9.99
}

// ANSWER:
// Log 1: 1
// Log 2: "Widget"
// Log 3: ["price", "stock", "category"]
// Log 4: 9.99
//
// Explanation:
// `id` and `name` are extracted. `...details` collects all remaining own
// enumerable properties into a new object: { price: 9.99, stock: 100, category: "tools" }.
// See README → Section 9: The Rest Pattern in Objects

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Destructuring from a string (iterable)

function solution7() {
  const [a, b, ...rest] = "Hello";

  console.log(a);           // "H"
  console.log(b);           // "e"
  console.log(rest);        // ["l", "l", "o"]
  console.log(rest.length); // 3
}

// ANSWER:
// Log 1: "H"
// Log 2: "e"
// Log 3: ["l", "l", "o"]
// Log 4: 3
//
// Explanation:
// Array destructuring works on any iterable. Strings are iterable character by
// character. `a` = "H", `b` = "e", `...rest` collects remaining chars as an array.
// See README → Section 8: Destructuring from Iterables → Strings

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Computed property names in destructuring

function solution8() {
  const field = "email";
  const data = { email: "alice@example.com", name: "Alice" };

  const { [field]: emailValue, name: userName } = data;

  console.log(emailValue); // "alice@example.com"
  console.log(userName);   // "Alice"
}

// ANSWER:
// Log 1: "alice@example.com"
// Log 2: "Alice"
//
// Explanation:
// `[field]` evaluates to `"email"`, so it reads `data.email` and assigns it
// to the variable `emailValue`. The rename (`: emailValue`) is required with
// computed property names — `[field]` alone can't be a variable name.
// See README → Section 7: Computed Property Names in Destructuring

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Nested defaults to prevent TypeError

function solution9() {
  const obj: { a?: { b?: number } } = {};

  const { a: { b = 42 } = {} } = obj;

  console.log(b); // 42
}

// ANSWER:
// Log 1: 42
//
// Explanation:
// `obj.a` is `undefined`, so the default `= {}` kicks in for the nested pattern.
// Then `{}.b` is `undefined`, so the default `= 42` is used.
// Without `= {}`, destructuring `undefined` would throw TypeError.
// See README → Section 11: Common Gotchas → Gotcha 2: Nested undefined access

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: Parentheses gotcha — object destructuring without declaration

function solution10() {
  let a: number, b: number;

  ({ a, b } = { a: 100, b: 200 });

  console.log(a); // 100
  console.log(b); // 200
}

// ANSWER:
// Log 1: 100
// Log 2: 200
//
// Explanation:
// Without the wrapping `()`, JS would parse `{a, b}` as a block statement.
// The parentheses force it to be treated as an expression (destructuring assignment).
// See README → Section 10: Destructuring Gotcha — Parentheses

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Destructuring from Map entries

function solution11() {
  const map = new Map<string, number>([
    ["x", 10],
    ["y", 20],
    ["z", 30],
  ]);

  const [[k1, v1], , [k3, v3]] = map;

  console.log(k1, v1); // "x" 10
  console.log(k3, v3); // "z" 30
}

// ANSWER:
// Log 1: "x" 10
// Log 2: "z" 30
//
// Explanation:
// Maps are iterable — each iteration yields a [key, value] pair. We destructure
// the first entry into [k1, v1], skip the second (["y", 20]), and destructure
// the third into [k3, v3]. Nested array destructuring handles each pair.
// See README → Section 8: Destructuring from Iterables → Maps

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Default value evaluation is lazy

function solution12() {
  let callCount = 0;

  function getDefault() {
    callCount++;
    return "default";
  }

  const [a = getDefault(), b = getDefault()] = ["provided"];

  console.log(a);         // "provided"
  console.log(b);         // "default"
  console.log(callCount); // 1
}

// ANSWER:
// Log 1: "provided"
// Log 2: "default"
// Log 3: 1
//
// Explanation:
// `a` gets "provided" from the array, so `getDefault()` is NOT called for `a`.
// `b` is `undefined` (no index 1 in the array), so `getDefault()` IS called once.
// Defaults are lazily evaluated — only when the value is `undefined`.
// See README → Section 2: Default Values in Array Destructuring

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: Nested destructuring TypeError

interface DbConfig {
  database?: {
    host?: string;
    port?: number;
  };
  logging?: boolean;
}

function solution13(config: DbConfig): string {
  const {
    database: { host = "localhost", port = 5432 } = {},  // FIX: added `= {}` default for database
    logging = false,                                     // FIX: added default for logging
  } = config;

  return `${host}:${port} (logging: ${logging})`;
}

// Explanation:
// When `config.database` is `undefined`, trying to destructure `{ host, port }`
// from `undefined` throws TypeError. Adding `= {}` as a default for the `database`
// pattern means: "if database is undefined, treat it as {}". Then `host` and `port`
// each have their own defaults.
// `logging` also needed a default since it might not be provided.
// See README → Section 11: Common Gotchas → Gotcha 2: Nested undefined access

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: Destructuring function params without default for whole object

function solution14({
  greeting = "Hello",
  name = "World",
}: {
  greeting?: string;
  name?: string;
} = {}): string {  // FIX: added `= {}` default for the entire parameter
  return `${greeting}, ${name}!`;
}

// Explanation:
// The function destructures its first parameter, but there was no default for
// the parameter itself. Calling `solution14()` passes `undefined`, and you can't
// destructure `undefined`. Adding `= {}` means: "if no argument is passed,
// use an empty object, then apply the individual field defaults."
// See README → Section 6: Destructuring in Function Parameters → Default for whole parameter

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Extract and rename with rest

function solution15(input: Record<string, unknown>): {
  id: unknown;
  version: unknown;
  data: Record<string, unknown>;
} {
  const { _id: id, __v: version, ...data } = input;

  return { id, version, data };
}

// Explanation:
// `_id: id` reads the `_id` property and assigns it to a variable named `id`.
// `__v: version` similarly renames `__v` to `version`.
// `...data` collects everything that wasn't explicitly destructured.
// This is a common pattern for transforming database documents (e.g., MongoDB)
// into cleaner API shapes.
// See README → Section 4: Object Destructuring → Renaming & Section 9: Rest pattern

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Deep pluck — nested destructuring in a function

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

function solution16(response: ApiResponse): UserProfile {
  const {
    data: {
      user: {
        id,
        details: {
          firstName,
          lastName,
          contact: { email, phone = "N/A" },
        },
        roles: [primaryRole],
      },
    },
  } = response;

  return {
    id,
    fullName: `${firstName} ${lastName}`,
    email,
    phone,
    primaryRole,
  };
}

// Explanation:
// This showcases deeply nested destructuring:
// - We reach through `data.user` to extract `id`.
// - Then into `details` for `firstName`, `lastName`.
// - Then into `contact` for `email` and `phone` (with default "N/A").
// - Array destructuring `[primaryRole]` grabs the first role.
// None of the intermediate path names (data, user, details, contact, roles)
// become variables — only the leaf names are declared.
// See README → Section 5: Nested Destructuring

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Config merger using destructuring

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

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function solution17(partial: DeepPartial<AppConfig>): AppConfig {
  const {
    server: {
      host = "localhost",
      port = 3000,
      ssl = false,
    } = {},
    database: {
      url = "mongodb://localhost:27017",
      pool = 5,
    } = {},
    features: {
      darkMode = false,
      notifications = true,
    } = {},
  } = partial;

  return {
    server: { host, port, ssl },
    database: { url, pool },
    features: { darkMode, notifications },
  };
}

// Explanation:
// Each top-level section (`server`, `database`, `features`) defaults to `{}`
// if not provided, preventing TypeError. Each nested field has its own default.
// This pattern is a clean way to implement "defaults merging" purely with
// destructuring, without needing Object.assign or spread.
// See README → Section 6: Destructuring in Function Parameters &
// Section 11: Gotcha 2: Nested undefined access

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Destructuring-based object transformer

function solution18<T extends Record<string, unknown>>(
  items: T[],
  keys: (keyof T & string)[],
): Partial<T>[] {
  return items.map((item) => {
    const result: Partial<T> = {};
    for (const key of keys) {
      const { [key]: value } = item;
      (result as Record<string, unknown>)[key] = value;
    }
    return result;
  });
}

// Explanation:
// For each item, we loop over the requested keys and use computed property
// name destructuring `{ [key]: value }` to extract each value. This is a
// practical use of computed property destructuring from Section 7.
// The result is a "pick" operation — selecting only specified keys from each object.
// See README → Section 7: Computed Property Names in Destructuring

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: Array destructuring with skipping ===");
solution1();

console.log("\n=== Exercise 2: Default values — undefined vs null ===");
solution2();

console.log("\n=== Exercise 3: Object destructuring with rename ===");
solution3();

console.log("\n=== Exercise 4: Nested destructuring ===");
solution4();

console.log("\n=== Exercise 5: Swapping variables ===");
solution5();

console.log("\n=== Exercise 6: Object rest pattern ===");
solution6();

console.log("\n=== Exercise 7: Destructuring from a string ===");
solution7();

console.log("\n=== Exercise 8: Computed property names ===");
solution8();

console.log("\n=== Exercise 9: Nested defaults ===");
solution9();

console.log("\n=== Exercise 10: Parentheses gotcha ===");
solution10();

console.log("\n=== Exercise 11: Map destructuring ===");
solution11();

console.log("\n=== Exercise 12: Lazy default evaluation ===");
solution12();

console.log("\n=== Exercise 13: Fix nested destructuring ===");
console.log(solution13({}));
console.log(solution13({ database: { host: "db.example.com" } }));
console.log(solution13({ database: { host: "prod", port: 3306 }, logging: true }));

console.log("\n=== Exercise 14: Fix missing param default ===");
console.log(solution14({}));
console.log(solution14({ name: "Alice" }));
console.log(solution14());

console.log("\n=== Exercise 15: Extract and rename with rest ===");
console.log(solution15({ _id: "abc", __v: 3, name: "Alice", age: 30 }));
console.log(solution15({ _id: 1, __v: 0 }));

console.log("\n=== Exercise 16: Deep pluck ===");
const apiResponse: ApiResponse = {
  status: 200,
  data: {
    user: {
      id: 42,
      details: {
        firstName: "Alice",
        lastName: "Smith",
        contact: {
          email: "alice@example.com",
          phone: "555-1234",
        },
      },
      roles: ["admin", "editor"],
    },
  },
};
console.log(solution16(apiResponse));

const minimalResponse: ApiResponse = {
  status: 200,
  data: {
    user: {
      id: 99,
      details: {
        firstName: "Bob",
        lastName: "Jones",
        contact: { email: "bob@test.com" },
      },
      roles: ["viewer"],
    },
  },
};
console.log(solution16(minimalResponse));

console.log("\n=== Exercise 17: Config merger ===");
console.log(JSON.stringify(solution17({}), null, 2));
console.log(JSON.stringify(solution17({
  server: { port: 8080, ssl: true },
  features: { darkMode: true },
}), null, 2));

console.log("\n=== Exercise 18: Object transformer ===");
const people = [
  { name: "Alice", age: 30, city: "NYC", job: "engineer" },
  { name: "Bob", age: 25, city: "LA", job: "designer" },
  { name: "Charlie", age: 35, city: "SF", job: "manager" },
];
console.log(solution18(people, ["name", "city"]));
console.log(solution18(people, ["age"]));
