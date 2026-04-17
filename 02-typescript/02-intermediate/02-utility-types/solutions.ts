// ============================================================================
// 02-utility-types: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/02-utility-types/solutions.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Shared types
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
// Helpers
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

// ============================================================================
// EXERCISE 1 — Predict the Output (Partial)
// ============================================================================
// Partial<User> makes every property optional.
// a: {}                          — compiles ✓ (all optional, empty is fine)
// b: { id: 1 }                   — compiles ✓
// c: { id: 1, unknown: true }    — does NOT compile (excess property check)
// d: { name: "Alice", age: 30 }  — compiles ✓

console.log("\n--- Exercise 1: Partial ---");
type PatchUser = Partial<User>;
const a: PatchUser = {};
const b: PatchUser = { id: 1 };
const d: PatchUser = { name: "Alice", age: 30 };
assert(Object.keys(a).length === 0, "empty object is valid Partial<User>");
assert(b.id === 1, "single field is valid");
assert(d.name === "Alice", "multiple fields valid");

// ============================================================================
// EXERCISE 2 — Predict the Output (Pick & Omit)
// ============================================================================
// PostPreview has keys: id, title, tags
// CreatePostInput has keys: title, body, authorId, tags

console.log("\n--- Exercise 2: Pick & Omit ---");
type PostPreview = Pick<Post, "id" | "title" | "tags">;
type CreatePostInput = Omit<Post, "id" | "createdAt" | "updatedAt">;

const preview: PostPreview = { id: 1, title: "Hello", tags: ["ts"] };
const input: CreatePostInput = {
  title: "Hello",
  body: "World",
  authorId: 1,
  tags: ["ts"],
};
assert(Object.keys(preview).length === 3, "PostPreview has 3 keys");
assert(Object.keys(input).length === 4, "CreatePostInput has 4 keys");

// ============================================================================
// EXERCISE 3 — Predict the Output (Exclude & Extract)
// ============================================================================
// SafeMethod = "GET" (only "GET" is in both unions)
// MutatingMethod = "POST" | "PUT" | "DELETE" | "PATCH"

console.log("\n--- Exercise 3: Exclude & Extract ---");
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type SafeMethod = Extract<HttpMethod, "GET" | "HEAD" | "OPTIONS">;
type MutatingMethod = Exclude<HttpMethod, "GET">;

const safe: SafeMethod = "GET";
const mutating: MutatingMethod = "POST";
assert(safe === "GET", "SafeMethod = 'GET'");
assert(mutating === "POST", "MutatingMethod includes 'POST'");

// ============================================================================
// EXERCISE 4 — Predict the Output (Record)
// ============================================================================
// Yes, all three keys are required when using Record<Status, ...>.

console.log("\n--- Exercise 4: Record ---");
type Status = "pending" | "active" | "disabled";
type StatusInfo = Record<Status, { label: string; color: string }>;

const info: StatusInfo = {
  pending:  { label: "Pending",  color: "yellow" },
  active:   { label: "Active",   color: "green"  },
  disabled: { label: "Disabled", color: "gray"   },
};
assert(Object.keys(info).length === 3, "all three keys required in Record");

// ============================================================================
// EXERCISE 5 — Predict the Output (Parameters & ReturnType)
// ============================================================================
// CreatePostParams = [title: string, body: string, tags: string[]]
// CreatePostReturn = Post

console.log("\n--- Exercise 5: Parameters & ReturnType ---");
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

const params: CreatePostParams = ["Hello", "World", ["ts"]];
const ret: CreatePostReturn = createPost(...params);
assert(params.length === 3, "CreatePostParams is a 3-tuple");
assert(typeof ret.id === "number", "CreatePostReturn is Post");

// ============================================================================
// EXERCISE 6 — Predict the Output (Awaited)
// ============================================================================
// Resolved = string (recursively unwrapped)
// MixedAwaited = string | number

console.log("\n--- Exercise 6: Awaited ---");
type NestedPromise = Promise<Promise<Promise<string>>>;
type Resolved = Awaited<NestedPromise>;
type MixedAwaited = Awaited<number | Promise<string>>;

const r: Resolved = "hello";
const m: MixedAwaited = 42; // number is valid for string | number
assert(r === "hello", "Resolved = string");
assert(m === 42, "MixedAwaited = string | number");

// ============================================================================
// EXERCISE 7 — Fix the Bug (Readonly assignment)
// ============================================================================
// Solution: return a new object instead of mutating.

console.log("\n--- Exercise 7: Readonly Fix ---");
type ImmutablePoint = Readonly<{ x: number; y: number }>;

function movePoint(p: ImmutablePoint, dx: number, dy: number): ImmutablePoint {
  // Cannot mutate p.x or p.y — create a new object
  return { x: p.x + dx, y: p.y + dy };
}

const p7 = movePoint({ x: 1, y: 2 }, 3, 4);
assert(p7.x === 4, "moved x = 4");
assert(p7.y === 6, "moved y = 6");

// ============================================================================
// EXERCISE 8 — Fix the Bug (Pick with wrong keys)
// ============================================================================
// "username" is not a key of User — the correct key is "name".

console.log("\n--- Exercise 8: Pick Fix ---");
type UserSummary = Pick<User, "id" | "name">;

const summary: UserSummary = { id: 1, name: "Alice" };
assert(summary.id === 1, "summary.id = 1");
assert(summary.name === "Alice", "summary.name = Alice");

// ============================================================================
// EXERCISE 9 — Fix the Bug (Record missing key)
// ============================================================================
// Record<Severity, string> requires all four keys. Add "critical".

console.log("\n--- Exercise 9: Record Fix ---");
type Severity = "low" | "medium" | "high" | "critical";

const severityLabels: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};
assert(severityLabels.critical === "Critical", "critical key present");

// ============================================================================
// EXERCISE 10 — Fix the Bug (Required on nested optional)
// ============================================================================
// Required<T> is shallow. For nested required-ness we explicitly
// override the nested type.

console.log("\n--- Exercise 10: Nested Required Fix ---");
interface PartialDbConfig {
  host?: string;
  port?: number;
  credentials?: {
    user?: string;
    password?: string;
  };
}

type FullDbConfig = Required<PartialDbConfig> & {
  credentials: Required<NonNullable<PartialDbConfig["credentials"]>>;
};

const db: FullDbConfig = {
  host: "localhost",
  port: 5432,
  credentials: { user: "admin", password: "secret" },
};
assert(db.credentials.user === "admin", "nested user is required");
assert(db.credentials.password === "secret", "nested password is required");

// ============================================================================
// EXERCISE 11 — Implement: updateUser with Partial
// ============================================================================
// Use object spread to merge the patch into the user.

console.log("\n--- Exercise 11: updateUser ---");
function updateUser(user: User, patch: Partial<User>): User {
  return { ...user, ...patch };
}

const original: User = {
  id: 1,
  name: "Alice",
  email: "a@b.com",
  age: 30,
  isAdmin: false,
};
const updated = updateUser(original, { name: "Bob", age: 31 });
assert(updated.name === "Bob", "name updated");
assert(updated.age === 31, "age updated");
assert(updated.email === "a@b.com", "email unchanged");
assert(original.name === "Alice", "original unchanged");

// ============================================================================
// EXERCISE 12 — Implement: createLookup with Record
// ============================================================================
// Reduce the array into a Record keyed by id.

console.log("\n--- Exercise 12: createLookup ---");
function createLookup<T extends { id: number }>(items: T[]): Record<number, T> {
  const result: Record<number, T> = {};
  for (const item of items) {
    result[item.id] = item;
  }
  return result;
}

const users12 = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];
const lookup = createLookup(users12);
assert(lookup[1].name === "Alice", "lookup[1] = Alice");
assert(lookup[3].name === "Charlie", "lookup[3] = Charlie");

// ============================================================================
// EXERCISE 13 — Implement: pick function
// ============================================================================
// Iterate over the keys array, copy matching properties.

console.log("\n--- Exercise 13: pick ---");
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user13: User = { id: 1, name: "Alice", email: "a@b.com", age: 30, isAdmin: false };
const picked = pick(user13, ["id", "name"]);
assert(picked.id === 1, "picked.id = 1");
assert(picked.name === "Alice", "picked.name = Alice");
assert(!("email" in picked), "email not in picked");

// ============================================================================
// EXERCISE 14 — Implement: omit function
// ============================================================================
// Copy all properties except the ones in the keys array.

console.log("\n--- Exercise 14: omit ---");
function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

const user14: User = { id: 1, name: "Alice", email: "a@b.com", age: 30, isAdmin: false };
const omitted = omit(user14, ["email", "isAdmin"]);
assert(omitted.id === 1, "omitted.id = 1");
assert(!("email" in omitted), "email not in omitted");
assert(!("isAdmin" in omitted), "isAdmin not in omitted");

// ============================================================================
// EXERCISE 15 — Implement: DeepPartial type
// ============================================================================
// Recursively apply Partial using a conditional mapped type.

console.log("\n--- Exercise 15: DeepPartial ---");
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

const partialConfig: DeepPartial<NestedConfig> = {
  db: {
    credentials: { user: "admin" },
  },
};
assert(partialConfig.db?.credentials?.user === "admin", "deep partial works");
assert(partialConfig.db?.host === undefined, "omitted fields are undefined");

// ============================================================================
// EXERCISE 16 — Implement: DeepReadonly type
// ============================================================================
// Recursively apply readonly. Exclude functions from recursion.

console.log("\n--- Exercise 16: DeepReadonly ---");
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

const frozen: DeepReadonly<NestedConfig> = {
  db: { host: "localhost", port: 5432, credentials: { user: "a", password: "b" } },
  server: { port: 3000, ssl: true },
};
// frozen.db.host = "x";          // TS Error ✓
// frozen.server.ssl = false;     // TS Error ✓
assert(frozen.db.host === "localhost", "DeepReadonly compiles and works");

// ============================================================================
// EXERCISE 17 — Implement: PickByType utility type
// ============================================================================
// Use key remapping (`as`) to filter keys based on value type.

console.log("\n--- Exercise 17: PickByType ---");
type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type NumericUser = PickByType<User, number>;
// { id: number; age: number }
const numericUser: NumericUser = { id: 1, age: 25 };
assert(numericUser.id === 1, "PickByType keeps id");
assert(numericUser.age === 25, "PickByType keeps age");
assert(!("name" in numericUser), "PickByType excludes name");

// ============================================================================
// EXERCISE 18 — Implement: type-safe event emitter types
// ============================================================================
// Use template literal types + key remapping.

console.log("\n--- Exercise 18: Event Emitter Types ---");
interface AppEvents {
  userCreated: { id: number; name: string };
  orderPlaced: { orderId: string; total: number };
  pageViewed: { url: string; timestamp: number };
}

// Union of all event names
type EventNames = keyof AppEvents;
// "userCreated" | "orderPlaced" | "pageViewed"

// Handler map: on${Capitalize<name>} -> (payload) => void
type HandlerMap = {
  [K in keyof AppEvents as `on${Capitalize<K & string>}`]: (
    payload: AppEvents[K],
  ) => void;
};
// {
//   onUserCreated: (payload: { id: number; name: string }) => void;
//   onOrderPlaced: (payload: { orderId: string; total: number }) => void;
//   onPageViewed: (payload: { url: string; timestamp: number }) => void;
// }

// Typed emit function
type EmitFn = <K extends keyof AppEvents>(event: K, payload: AppEvents[K]) => void;

const handlers: HandlerMap = {
  onUserCreated: (payload) => console.log("  user:", payload.id, payload.name),
  onOrderPlaced: (payload) => console.log("  order:", payload.orderId, payload.total),
  onPageViewed: (payload) => console.log("  page:", payload.url),
};

const emit: EmitFn = (event, payload) => {
  const handlerName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}` as keyof HandlerMap;
  const handler = handlers[handlerName] as (payload: AppEvents[typeof event]) => void;
  handler(payload);
};

emit("userCreated", { id: 1, name: "Alice" });
assert(typeof handlers.onUserCreated === "function", "onUserCreated defined");
assert(typeof handlers.onOrderPlaced === "function", "onOrderPlaced defined");
assert(typeof handlers.onPageViewed === "function", "onPageViewed defined");

// ============================================================================
// Summary
// ============================================================================
console.log("\n==========================================");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("==========================================");

if (failed > 0) {
  process.exit(1);
}
