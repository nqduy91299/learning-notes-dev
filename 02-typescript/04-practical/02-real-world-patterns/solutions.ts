// ============================================================================
// 02-real-world-patterns: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/04-practical/02-real-world-patterns/solutions.ts
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output (Solution)
// ============================================================================
// The discriminated union narrows `result` in each branch.

type ApiResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function processResult(result: ApiResult<number>): string {
  if (result.status === "success") {
    // Narrowed to { status: "success"; data: number }
    return `Value: ${result.data * 2}`;
  } else {
    // Narrowed to { status: "error"; error: string }
    return `Error: ${result.error}`;
  }
}

const ex1a = processResult({ status: "success", data: 21 });
const ex1b = processResult({ status: "error", error: "not found" });

console.log("Ex1:", ex1a, "|", ex1b);
// Output: Ex1: Value: 42 | Error: not found
//
// Explanation: The discriminant `status` narrows the union. In the "success"
// branch, `result.data` is `number`. In the "error" branch, `result.error`
// is `string`. This is the core pattern for typed API responses.

// ============================================================================
// EXERCISE 2 — Predict the Output (Solution)
// ============================================================================

type FieldState<T> = { value: T; error: string | null };

type FormFields<T extends object> = {
  [K in keyof T]: FieldState<T[K]>;
};

interface LoginData {
  email: string;
  age: number;
}

type LoginFields = FormFields<LoginData>;
// Expands to:
// {
//   email: FieldState<string>;  → { value: string; error: string | null }
//   age: FieldState<number>;    → { value: number; error: string | null }
// }

const ex2: LoginFields = {
  email: { value: "test@test.com", error: null },
  age: { value: 25, error: null },
};

console.log("Ex2:", ex2.email.value, ex2.age.value);
// Output: Ex2: test@test.com 25
//
// Explanation: The mapped type iterates over each key of LoginData and wraps
// the value type in FieldState<T>. This is the foundation of typed form systems.

// ============================================================================
// EXERCISE 3 — Predict the Output (Solution)
// ============================================================================

type Action =
  | { type: "ADD"; payload: number }
  | { type: "SUBTRACT"; payload: number }
  | { type: "RESET" };

function reduce(state: number, action: Action): number {
  switch (action.type) {
    case "ADD":
      return state + action.payload;
    case "SUBTRACT":
      return state - action.payload;
    case "RESET":
      return 0;
    default:
      const _exhaustive: never = action;
      return state;
  }
}

const ex3a = reduce(10, { type: "ADD", payload: 5 });
const ex3b = reduce(ex3a, { type: "SUBTRACT", payload: 3 });
const ex3c = reduce(ex3b, { type: "RESET" });

console.log("Ex3:", ex3a, ex3b, ex3c);
// Output: Ex3: 15 12 0
//
// Explanation:
// - 10 + 5 = 15
// - 15 - 3 = 12
// - RESET → 0
// The `never` assignment in default ensures all cases are handled.
// If you add a new action type without a case, TypeScript will error.

// ============================================================================
// EXERCISE 4 — Predict the Output (Solution)
// ============================================================================

type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function makeUserId(id: string): UserId {
  return id as UserId;
}
function makeOrderId(id: string): OrderId {
  return id as OrderId;
}

function greetUser(id: UserId): string {
  return `Hello user ${id}`;
}

const uid = makeUserId("u_1");
const oid = makeOrderId("o_1");

const ex4 = greetUser(uid);

console.log("Ex4:", ex4);
console.log("Ex4 typeof:", typeof uid);
// Output:
// Ex4: Hello user u_1
// Ex4 typeof: string
//
// Explanation:
// - At runtime, uid is just a string. The __brand field is phantom (type-level only).
// - typeof uid → "string" because the brand doesn't exist at runtime.
// - greetUser(oid) would fail to compile because OrderId is not assignable to UserId.
//   The __brand field differs: "OrderId" vs "UserId".

// ============================================================================
// EXERCISE 5 — Predict the Output (Solution)
// ============================================================================

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}

const ex5a = divide(10, 2);
const ex5b = divide(10, 0);

function showResult(r: Result<number>): string {
  return r.ok ? `Result: ${r.value}` : `Error: ${r.error}`;
}

console.log("Ex5:", showResult(ex5a), "|", showResult(ex5b));
// Output: Ex5: Result: 5 | Error: Division by zero
//
// Explanation: The Result type forces the caller to check `ok` before accessing
// `value` or `error`. This is the TypeScript equivalent of Rust's Result<T, E>.

// ============================================================================
// EXERCISE 6 — Fix the Bug (Solution)
// ============================================================================
// The original bug was passing (username: number) instead of (username: string)
// for the "join" event. The fix is to match the event map signature.

type EventMap = { [key: string]: unknown[] };

class TypedEmitter<Events extends { [K in keyof Events]: unknown[] }> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(
    event: K,
    listener: (...args: Events[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

interface ChatEvents {
  message: [sender: string, text: string];
  join: [username: string];
  leave: [username: string];
}

const chat = new TypedEmitter<ChatEvents>();

chat.on("message", (sender: string, text: string) => {
  void sender; void text;
});

// FIX: parameter must be string, not number — matching ChatEvents["join"]
chat.on("join", (username: string) => {
  void username;
});

console.log("Ex6: compiles correctly");
// Explanation: The event map defines join as [username: string]. Passing
// (username: number) violates the listener signature constraint.

// ============================================================================
// EXERCISE 7 — Fix the Bug (Solution)
// ============================================================================
// DeepPartial must not recurse into arrays, otherwise string[] becomes
// a weird partial type.

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<any>
      ? T[K]                  // arrays pass through unchanged
      : DeepPartial<T[K]>
    : T[K];
};

interface ServerConfig {
  port: number;
  cors: {
    origins: string[];
    credentials: boolean;
  };
}

const partialConfig: DeepPartial<ServerConfig> = {
  cors: {
    origins: ["http://localhost:3000"],
  },
};

console.log("Ex7:", JSON.stringify(partialConfig));
// Explanation: Without the Array check, DeepPartial<string[]> would make
// each index optional and add undefined to the element type, breaking
// normal array usage. The fix checks Array<any> before recursing.

// ============================================================================
// EXERCISE 8 — Fix the Bug (Solution)
// ============================================================================
// The `this` parameter in build() constrains which instances can call it.

class RequestBuilder<Set extends string = never> {
  private _url?: string;
  private _method?: string;

  url(url: string): RequestBuilder<Set | "url"> {
    this._url = url;
    return this as unknown as RequestBuilder<Set | "url">;
  }

  method(method: string): RequestBuilder<Set | "method"> {
    this._method = method;
    return this as unknown as RequestBuilder<Set | "method">;
  }

  // The `this` constraint means build() is only callable on
  // RequestBuilder<"url" | "method"> (or a superset)
  build(this: RequestBuilder<"url" | "method">): { url: string; method: string } {
    return { url: this._url!, method: this._method! };
  }
}

const reqOk = new RequestBuilder().url("/api").method("GET").build();
console.log("Ex8:", reqOk);
// Output: Ex8: { url: '/api', method: 'GET' }
//
// Explanation: TypeScript's `this` parameter lets you restrict which
// type of `this` a method accepts. After calling .url() and .method(),
// the type becomes RequestBuilder<"url" | "method">, satisfying the
// constraint. Missing either call leaves the type parameter incomplete.

// ============================================================================
// EXERCISE 9 — Fix the Bug (Solution)
// ============================================================================
// The Container.get() must cast the factory result back to T.

class Token<T> {
  private _phantom!: T;
  constructor(public readonly name: string) {}
}

class Container {
  private bindings = new Map<Token<unknown>, () => unknown>();

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, factory as () => unknown);
  }

  // The `as T` cast is safe because bind() enforces the factory matches the token
  get<T>(token: Token<T>): T {
    const factory = this.bindings.get(token);
    if (!factory) throw new Error(`No binding for ${token.name}`);
    return factory() as T;
  }
}

interface Logger {
  log(msg: string): void;
}

const LoggerToken = new Token<Logger>("Logger");
const ctr = new Container();
ctr.bind(LoggerToken, () => ({ log: (msg: string) => console.log(msg) }));

const logger = ctr.get(LoggerToken); // Logger ✅
console.log("Ex9: Logger type is correct");
logger.log("Ex9: DI container works");
// Explanation: The Map stores () => unknown internally, but get<T>() casts
// back to T. This is safe because bind<T>() ensures type alignment.

// ============================================================================
// EXERCISE 10 — Implement (Solution)
// ============================================================================
// Ok() and Err() constructors for Result<T, E>.

type ResultType<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function Ok<T>(value: T): ResultType<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): ResultType<never, E> {
  return { ok: false, error };
}

const r10a: ResultType<number, string> = Ok(42);
const r10b: ResultType<number, string> = Err("failed");
console.log("Ex10:", r10a, r10b);
// Output: Ex10: { ok: true, value: 42 } { ok: false, error: 'failed' }
//
// Explanation: Ok returns ResultType<T, never> and Err returns ResultType<never, E>.
// `never` is the bottom type — it's assignable to any type, so Ok(42) can be
// assigned to ResultType<number, string> because never extends string.

// ============================================================================
// EXERCISE 11 — Implement (Solution)
// ============================================================================
// mapResult transforms the value if ok, passes through errors unchanged.

function mapResult<T, U, E>(
  result: ResultType<T, E>,
  fn: (value: T) => U
): ResultType<U, E> {
  if (result.ok) {
    return Ok(fn(result.value));
  }
  return result; // error passes through, type narrows to { ok: false; error: E }
}

const r11ok = Ok(5);
const r11doubled = mapResult(r11ok, (n) => n * 2);
const r11err = Err("oops");
const r11mapped = mapResult(r11err, (n: number) => n * 2);
console.log("Ex11:", r11doubled, r11mapped);
// Output: Ex11: { ok: true, value: 10 } { ok: false, error: 'oops' }
//
// Explanation: This is the functor map for Result. The error case short-circuits
// without calling fn. The types flow naturally — if result.ok is false, the
// return type's T becomes U but the actual value is still the error.

// ============================================================================
// EXERCISE 12 — Implement (Solution)
// ============================================================================
// Type-safe event emitter with on(), off(), and emit().

type AppEvents = {
  login: [userId: string, timestamp: number];
  logout: [userId: string];
  error: [error: Error];
};

class AppEmitter {
  private handlers = new Map<string, Set<Function>>();

  on<K extends keyof AppEvents>(
    event: K,
    handler: (...args: AppEvents[K]) => void
  ): void {
    const key = event as string;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler);
  }

  off<K extends keyof AppEvents>(
    event: K,
    handler: (...args: AppEvents[K]) => void
  ): void {
    const key = event as string;
    this.handlers.get(key)?.delete(handler);
  }

  emit<K extends keyof AppEvents>(event: K, ...args: AppEvents[K]): void {
    const key = event as string;
    this.handlers.get(key)?.forEach((fn) => fn(...args));
  }
}

const emitter12 = new AppEmitter();
const loginHandler = (userId: string, ts: number) =>
  console.log("  Login:", userId, "at", ts);
emitter12.on("login", loginHandler);
console.log("Ex12 (with handler):");
emitter12.emit("login", "user_1", 1000);
emitter12.off("login", loginHandler);
console.log("Ex12 (after off):");
emitter12.emit("login", "user_2", 2000); // no output
// Output:
// Ex12 (with handler):
//   Login: user_1 at 1000
// Ex12 (after off):
//
// Explanation: The event map AppEvents constrains both the event name and
// the argument types. on() and emit() use the same K to ensure type safety.

// ============================================================================
// EXERCISE 13 — Implement (Solution)
// ============================================================================
// ValidationRules maps each key of T to an array of rules typed to that field.

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type ValidationRules<T extends object> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

interface SignupForm {
  username: string;
  age: number;
  email: string;
}

const signupRules: ValidationRules<SignupForm> = {
  username: [
    { validate: (v) => v.length >= 3, message: "Too short" },
  ],
  age: [
    { validate: (v) => v >= 18, message: "Must be 18+" },
  ],
  email: [
    { validate: (v) => v.includes("@"), message: "Invalid email" },
  ],
};

// Validate helper
function validate<T extends Record<string, unknown>>(
  data: T,
  rules: ValidationRules<T>
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const key of Object.keys(rules) as (keyof T & string)[]) {
    const fieldRules = rules[key];
    if (!fieldRules) continue;
    const fieldErrors: string[] = [];
    for (const rule of fieldRules) {
      if (!rule.validate(data[key] as any)) {
        fieldErrors.push(rule.message);
      }
    }
    if (fieldErrors.length) errors[key] = fieldErrors;
  }
  return errors;
}

const errors13 = validate(
  { username: "ab", age: 16, email: "bad" },
  signupRules
);
console.log("Ex13:", errors13);
// Output: Ex13: { username: [ 'Too short' ], age: [ 'Must be 18+' ], email: [ 'Invalid email' ] }
//
// Explanation: The mapped type [K in keyof T]? iterates each field.
// ValidationRule<T[K]> ensures the validate function receives the correct type.

// ============================================================================
// EXERCISE 14 — Implement (Solution)
// ============================================================================
// createSelector composes an input selector with a transform function.

interface State {
  users: { id: string; name: string }[];
  currentUserId: string | null;
}

type Selector<S, R> = (state: S) => R;

function createSelector<S, A, R>(
  inputSelector: Selector<S, A>,
  transform: (input: A) => R
): Selector<S, R> {
  return (state: S) => transform(inputSelector(state));
}

const selectUsers: Selector<State, State["users"]> = (s) => s.users;
const selectUserCount = createSelector(selectUsers, (users) => users.length);
const selectCurrentId: Selector<State, string | null> = (s) => s.currentUserId;

const selectCurrentUser = createSelector(
  // Combine two pieces of state
  (s: State) => ({ users: s.users, id: s.currentUserId }),
  ({ users, id }) => (id ? users.find((u) => u.id === id) ?? null : null)
);

const testState14: State = {
  users: [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ],
  currentUserId: "1",
};

console.log("Ex14:", selectUserCount(testState14), selectCurrentUser(testState14));
// Output: Ex14: 2 { id: '1', name: 'Alice' }
//
// Explanation: createSelector simply composes: state → inputSelector → transform.
// This is a simplified version of reselect's createSelector. A full version
// would add memoization and multiple input selectors.

// ============================================================================
// EXERCISE 15 — Implement (Solution)
// ============================================================================
// Branded types for currency safety.

type Branded<T, B extends string> = T & { readonly __brand: B };

type Cents = Branded<number, "Cents">;
type Dollars = Branded<number, "Dollars">;

function cents(amount: number): Cents {
  return Math.round(amount) as Cents;
}

function dollars(amount: number): Dollars {
  return amount as Dollars;
}

function dollarsToCents(d: Dollars): Cents {
  return Math.round((d as number) * 100) as Cents;
}

function centsToDollars(c: Cents): Dollars {
  return ((c as number) / 100) as Dollars;
}

const price15 = dollars(19.99);
const priceInCents15 = dollarsToCents(price15);
const backToDollars15 = centsToDollars(priceInCents15);
console.log("Ex15:", price15, priceInCents15, backToDollars15);
// Output: Ex15: 19.99 1999 19.99
//
// Explanation: The brand exists only at the type level. At runtime these are
// plain numbers. `as Cents` and `as Dollars` are the only assertions needed —
// they're safe because we control the construction. The brand prevents
// accidentally passing Cents where Dollars is expected and vice versa.

// ============================================================================
// EXERCISE 16 — Implement (Solution)
// ============================================================================
// Fluent QueryBuilder using method chaining with `this` return type.

interface QueryConfig {
  table: string;
  conditions: string[];
  orderBy?: string;
  limit?: number;
}

class QueryBuilder {
  private config: QueryConfig;

  constructor(table: string) {
    this.config = { table, conditions: [] };
  }

  where(condition: string): this {
    this.config.conditions.push(condition);
    return this;
  }

  orderBy(field: string): this {
    this.config.orderBy = field;
    return this;
  }

  limit(n: number): this {
    this.config.limit = n;
    return this;
  }

  build(): QueryConfig {
    return { ...this.config, conditions: [...this.config.conditions] };
  }
}

const query16 = new QueryBuilder("users")
  .where("age > 18")
  .where("active = true")
  .orderBy("name")
  .limit(10)
  .build();

console.log("Ex16:", query16);
// Output: Ex16: { table: 'users', conditions: [ 'age > 18', 'active = true' ], orderBy: 'name', limit: 10 }
//
// Explanation: Each method returns `this`, enabling method chaining.
// The return type `this` (not `QueryBuilder`) is important — it preserves
// the concrete type if someone extends QueryBuilder. build() returns a copy
// to prevent mutation of the builder's internal state.

// ============================================================================
// EXERCISE 17 — Implement (Solution)
// ============================================================================
// Template literal type extraction for route parameters.

type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Record<Param, string> & ExtractParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Record<Param, string>
      : {};

// Verification:
type _TestParams1 = ExtractParams<"/users/:userId">;
// { userId: string }

type _TestParams2 = ExtractParams<"/users/:userId/posts/:postId">;
// Record<"userId", string> & Record<"postId", string>
// effectively { userId: string; postId: string }

function defineRoute<P extends string>(
  _path: P,
  handler: (params: ExtractParams<P>) => string
): (params: ExtractParams<P>) => string {
  return handler;
}

const userRoute17 = defineRoute("/users/:userId", (params) => {
  return `User: ${params.userId}`;
});

const postRoute17 = defineRoute("/users/:userId/posts/:postId", (params) => {
  return `User: ${params.userId}, Post: ${params.postId}`;
});

console.log("Ex17:", userRoute17({ userId: "123" } as any));
console.log("Ex17:", postRoute17({ userId: "1", postId: "42" } as any));
// Output:
// Ex17: User: 123
// Ex17: User: 1, Post: 42
//
// Explanation: The recursive conditional type peels off one `:param` at a time.
// - First branch: matches `:Param/Rest` — extracts Param, recurses on Rest
// - Second branch: matches `:Param` at the end — base case
// - Third branch: no more params — returns {}
// The `&` intersection merges all extracted params into one object type.

// ============================================================================
// EXERCISE 18 — Implement (Solution)
// ============================================================================
// Generic pagination function.

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function paginate<T>(
  allItems: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const total = allItems.length;
  const start = (page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);
  return {
    items,
    total,
    page,
    pageSize,
    hasNext: start + pageSize < total,
    hasPrev: page > 1,
  };
}

const items18 = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
const page1 = paginate(items18, 1, 10);
const page2 = paginate(items18, 2, 10);
const page3 = paginate(items18, 3, 10);

console.log("Ex18 page1:", page1.items.length, "hasNext:", page1.hasNext, "hasPrev:", page1.hasPrev);
console.log("Ex18 page2:", page2.items.length, "hasNext:", page2.hasNext, "hasPrev:", page2.hasPrev);
console.log("Ex18 page3:", page3.items.length, "hasNext:", page3.hasNext, "hasPrev:", page3.hasPrev);
// Output:
// Ex18 page1: 10 hasNext: true hasPrev: false
// Ex18 page2: 10 hasNext: true hasPrev: true
// Ex18 page3: 5 hasNext: false hasPrev: true
//
// Explanation: Standard pagination logic:
// - start index = (page - 1) * pageSize
// - slice from start to start + pageSize
// - hasNext: there are more items beyond this page
// - hasPrev: page > 1
// The generic T flows from allItems through to PaginatedResponse<T>.

// ============================================================================
// Runner Summary
// ============================================================================
console.log("\n========================================");
console.log("All 18 exercises completed successfully!");
console.log("========================================");
console.log("  5 predict-output (Ex 1-5)");
console.log("  4 fix-the-bug    (Ex 6-9)");
console.log("  9 implement      (Ex 10-18)");
console.log("========================================");
