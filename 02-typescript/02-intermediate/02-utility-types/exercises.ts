// ============================================================================
// 02-utility-types: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/02-utility-types/exercises.ts
//
// Mix: ~6 predict-output, ~4 fix-the-bug, ~8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ---------------------------------------------------------------------------
// Shared types used across exercises
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isAdmin: boolean;
}

interface Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NestedConfig {
  db: {
    host: string;
    port: number;
    credentials: {
      user: string;
      password: string;
    };
  };
  server: {
    port: number;
    ssl: boolean;
  };
}

// ============================================================================
// EXERCISE 1 — Predict the Output (Partial)
// ============================================================================
// What does TypeScript infer for `PatchUser`?
// Write your answer as a comment, then uncomment the test to verify.

type PatchUser = Partial<User>;

// Question: Which of these assignments will compile?
// const a: PatchUser = {};
// const b: PatchUser = { id: 1 };
// const c: PatchUser = { id: 1, unknown: true };
// const d: PatchUser = { name: "Alice", age: 30 };

// --- Test ---
// console.log("Exercise 1: Predict the Output (Partial)");
// const a: PatchUser = {};                          // compiles? ___
// const b: PatchUser = { id: 1 };                   // compiles? ___
// const d: PatchUser = { name: "Alice", age: 30 };  // compiles? ___
// console.log("a:", a, "b:", b, "d:", d);

// ============================================================================
// EXERCISE 2 — Predict the Output (Pick & Omit)
// ============================================================================
// What are the keys of PostPreview and CreatePostInput?

type PostPreview = Pick<Post, "id" | "title" | "tags">;
type CreatePostInput = Omit<Post, "id" | "createdAt" | "updatedAt">;

// --- Test ---
// console.log("Exercise 2: Predict the Output (Pick & Omit)");
// const preview: PostPreview = { id: 1, title: "Hello", tags: ["ts"] };
// const input: CreatePostInput = {
//   title: "Hello",
//   body: "World",
//   authorId: 1,
//   tags: ["ts"],
// };
// console.log("preview:", preview);
// console.log("input:", input);

// ============================================================================
// EXERCISE 3 — Predict the Output (Exclude & Extract)
// ============================================================================

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type SafeMethod = Extract<HttpMethod, "GET" | "HEAD" | "OPTIONS">;
type MutatingMethod = Exclude<HttpMethod, "GET">;

// Question: What are the resulting union members of SafeMethod and MutatingMethod?

// --- Test ---
// console.log("Exercise 3: Predict the Output (Exclude & Extract)");
// const safe: SafeMethod = "GET";
// const mutating: MutatingMethod = "POST";
// console.log("safe:", safe, "mutating:", mutating);
// // SafeMethod = ___
// // MutatingMethod = ___

// ============================================================================
// EXERCISE 4 — Predict the Output (Record)
// ============================================================================

type Status = "pending" | "active" | "disabled";
type StatusInfo = Record<Status, { label: string; color: string }>;

// Question: Is the following valid? Which keys are required?

// --- Test ---
// console.log("Exercise 4: Predict the Output (Record)");
// const info: StatusInfo = {
//   pending:  { label: "Pending",  color: "yellow" },
//   active:   { label: "Active",   color: "green"  },
//   disabled: { label: "Disabled", color: "gray"   },
// };
// console.log("info:", info);
// // All three keys required? ___

// ============================================================================
// EXERCISE 5 — Predict the Output (Parameters & ReturnType)
// ============================================================================

function createPost(title: string, body: string, tags: string[]): Post {
  return {
    id: Math.random(),
    title,
    body,
    authorId: 0,
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

type CreatePostParams = Parameters<typeof createPost>;
type CreatePostReturn = ReturnType<typeof createPost>;

// Question: What is CreatePostParams? What is CreatePostReturn?

// --- Test ---
// console.log("Exercise 5: Predict the Output (Parameters & ReturnType)");
// const params: CreatePostParams = ["Hello", "World", ["ts"]];
// const ret: CreatePostReturn = createPost(...params);
// console.log("params:", params, "ret:", ret);
// // CreatePostParams = ___
// // CreatePostReturn = ___

// ============================================================================
// EXERCISE 6 — Predict the Output (Awaited)
// ============================================================================

type NestedPromise = Promise<Promise<Promise<string>>>;
type Resolved = Awaited<NestedPromise>;

type MixedAwaited = Awaited<number | Promise<string>>;

// Question: What are `Resolved` and `MixedAwaited`?

// --- Test ---
// console.log("Exercise 6: Predict the Output (Awaited)");
// const r: Resolved = "hello";
// const m: MixedAwaited = "hello";
// console.log("Resolved:", r, "MixedAwaited:", m);
// // Resolved = ___
// // MixedAwaited = ___

// ============================================================================
// EXERCISE 7 — Fix the Bug (Readonly assignment)
// ============================================================================
// The code below has a type error. Fix it WITHOUT removing the Readonly.

type ImmutablePoint = Readonly<{ x: number; y: number }>;

function movePoint(_p: ImmutablePoint, dx: number, dy: number): ImmutablePoint {
  // BUG: attempting to mutate readonly properties
  // p.x += dx;
  // p.y += dy;
  // return p;

  // FIX: return a new object instead
  // (uncomment and fix)
  void _p;
  void dx;
  void dy;
  return { x: 0, y: 0 }; // placeholder
}

// --- Test ---
// console.log("Exercise 7: Fix the Bug (Readonly assignment)");
// const p = movePoint({ x: 1, y: 2 }, 3, 4);
// console.log("moved:", p); // should be { x: 4, y: 6 }

// ============================================================================
// EXERCISE 8 — Fix the Bug (Pick with wrong keys)
// ============================================================================
// Fix the type error so that the code compiles.

// BUG: "username" is not a key of User
// type UserSummary = Pick<User, "id" | "username">;

// FIX: use the correct key
type UserSummary = Pick<User, "id" | "name">; // placeholder — fix the key

// --- Test ---
// console.log("Exercise 8: Fix the Bug (Pick with wrong keys)");
// const summary: UserSummary = { id: 1, name: "Alice" };
// console.log("summary:", summary);

// ============================================================================
// EXERCISE 9 — Fix the Bug (Record missing key)
// ============================================================================
// The code below has a type error. Fix it.

type Severity = "low" | "medium" | "high" | "critical";

// BUG: Record<Severity, string> requires all four keys
// const severityLabels: Record<Severity, string> = {
//   low: "Low",
//   medium: "Medium",
//   high: "High",
//   // missing "critical"
// };

// FIX: add the missing key or change the type
const severityLabels: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical", // placeholder — provide the fix
};

// --- Test ---
// console.log("Exercise 9: Fix the Bug (Record missing key)");
// console.log("labels:", severityLabels);

// ============================================================================
// EXERCISE 10 — Fix the Bug (Required on nested optional)
// ============================================================================
// The developer expected all nested fields to become required, but Required
// is shallow. Fix the type so that credentials fields are also required.

interface PartialDbConfig {
  host?: string;
  port?: number;
  credentials?: {
    user?: string;
    password?: string;
  };
}

// BUG: Required<PartialDbConfig> makes top-level keys required
// but credentials.user and credentials.password remain optional.

// FIX: define a fully-required version manually or use a DeepRequired type
type FullDbConfig = Required<PartialDbConfig> & {
  credentials: Required<NonNullable<PartialDbConfig["credentials"]>>;
};

// --- Test ---
// console.log("Exercise 10: Fix the Bug (Required on nested optional)");
// const db: FullDbConfig = {
//   host: "localhost",
//   port: 5432,
//   credentials: { user: "admin", password: "secret" },
// };
// console.log("db:", db);

// ============================================================================
// EXERCISE 11 — Implement: updateUser with Partial
// ============================================================================
// Implement a function that merges a partial update into a User object.
// Return a new User (do not mutate the original).

function updateUser(_user: User, _patch: Partial<User>): User {
  // TODO: implement
  void _user;
  void _patch;
  return undefined as never;
}

// --- Test ---
// console.log("Exercise 11: Implement updateUser");
// const original: User = { id: 1, name: "Alice", email: "a@b.com", age: 30, isAdmin: false };
// const updated = updateUser(original, { name: "Bob", age: 31 });
// console.log("updated:", updated);
// console.assert(updated.name === "Bob");
// console.assert(updated.age === 31);
// console.assert(updated.email === "a@b.com");
// console.assert(original.name === "Alice"); // original unchanged

// ============================================================================
// EXERCISE 12 — Implement: createLookup with Record
// ============================================================================
// Given an array of objects with an `id` field, return a Record keyed by id.

function createLookup<T extends { id: number }>(_items: T[]): Record<number, T> {
  // TODO: implement
  void _items;
  return undefined as never;
}

// --- Test ---
// console.log("Exercise 12: Implement createLookup");
// const users = [
//   { id: 1, name: "Alice" },
//   { id: 2, name: "Bob" },
//   { id: 3, name: "Charlie" },
// ];
// const lookup = createLookup(users);
// console.log("lookup:", lookup);
// console.assert(lookup[1].name === "Alice");
// console.assert(lookup[3].name === "Charlie");

// ============================================================================
// EXERCISE 13 — Implement: pick function
// ============================================================================
// Implement a runtime `pick` function that mirrors Pick<T, K>.

function pick<T extends object, K extends keyof T>(_obj: T, _keys: K[]): Pick<T, K> {
  // TODO: implement
  void _obj;
  void _keys;
  return undefined as never;
}

// --- Test ---
// console.log("Exercise 13: Implement pick");
// const user: User = { id: 1, name: "Alice", email: "a@b.com", age: 30, isAdmin: false };
// const picked = pick(user, ["id", "name"]);
// console.log("picked:", picked);
// console.assert(picked.id === 1);
// console.assert(picked.name === "Alice");
// console.assert(!("email" in picked));

// ============================================================================
// EXERCISE 14 — Implement: omit function
// ============================================================================
// Implement a runtime `omit` function that mirrors Omit<T, K>.

function omit<T extends object, K extends keyof T>(_obj: T, _keys: K[]): Omit<T, K> {
  // TODO: implement
  void _obj;
  void _keys;
  return undefined as never;
}

// --- Test ---
// console.log("Exercise 14: Implement omit");
// const user14: User = { id: 1, name: "Alice", email: "a@b.com", age: 30, isAdmin: false };
// const omitted = omit(user14, ["email", "isAdmin"]);
// console.log("omitted:", omitted);
// console.assert(omitted.id === 1);
// console.assert(!("email" in omitted));

// ============================================================================
// EXERCISE 15 — Implement: DeepPartial type
// ============================================================================
// Define a DeepPartial<T> that recursively makes all properties optional.
// Then use it to type-check a partial config.

// TODO: define DeepPartial<T>
type DeepPartial<T> = unknown; // replace `unknown`

// --- Test ---
// console.log("Exercise 15: Implement DeepPartial");
// const partialConfig: DeepPartial<NestedConfig> = {
//   db: {
//     credentials: { user: "admin" },
//   },
// };
// console.log("partialConfig:", partialConfig);

// ============================================================================
// EXERCISE 16 — Implement: DeepReadonly type
// ============================================================================
// Define a DeepReadonly<T> that recursively makes all properties readonly.

// TODO: define DeepReadonly<T>
type DeepReadonly<T> = unknown; // replace `unknown`

// --- Test ---
// console.log("Exercise 16: Implement DeepReadonly");
// const frozen: DeepReadonly<NestedConfig> = {
//   db: { host: "localhost", port: 5432, credentials: { user: "a", password: "b" } },
//   server: { port: 3000, ssl: true },
// };
// // frozen.db.host = "x";  // should error
// // frozen.server.ssl = false;  // should error
// console.log("frozen:", frozen);

// ============================================================================
// EXERCISE 17 — Implement: PickByType utility type
// ============================================================================
// Create a type PickByType<T, V> that picks only properties whose value
// type extends V.

// TODO: define PickByType<T, V>
type PickByType<T, V> = unknown; // replace `unknown`

// --- Test ---
// console.log("Exercise 17: Implement PickByType");
// type NumericUser = PickByType<User, number>;
// // should be { id: number; age: number }
// const numericUser: NumericUser = { id: 1, age: 25 };
// console.log("numericUser:", numericUser);

// ============================================================================
// EXERCISE 18 — Implement: type-safe event emitter types
// ============================================================================
// Given an EventMap, create:
// 1. EventNames — union of all event names
// 2. HandlerMap — maps `on${Capitalize<EventName>}` to handler functions
// 3. A typed `emit` function signature

interface AppEvents {
  userCreated: { id: number; name: string };
  orderPlaced: { orderId: string; total: number };
  pageViewed: { url: string; timestamp: number };
}

// TODO: define EventNames
type EventNames = unknown; // replace

// TODO: define HandlerMap
type HandlerMap = unknown; // replace

// TODO: define emit signature
type EmitFn = unknown; // replace

// --- Test ---
// console.log("Exercise 18: Implement event emitter types");
// const handlers: HandlerMap = {
//   onUserCreated: (payload) => console.log("user:", payload.id),
//   onOrderPlaced: (payload) => console.log("order:", payload.orderId),
//   onPageViewed: (payload) => console.log("page:", payload.url),
// };
// console.log("handlers defined:", Object.keys(handlers));

// ============================================================================
// End of exercises
// ============================================================================
console.log("exercises.ts loaded (all tests commented out).");
