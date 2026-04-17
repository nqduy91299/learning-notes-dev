// ============================================================================
// 02-real-world-patterns: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/04-practical/02-real-world-patterns/exercises.ts
//
// 18 exercises: 5 predict-output, 4 fix-the-bug, 9 implement
// All test code is commented out. Must compile cleanly.
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output
// ============================================================================
// What does `result` narrow to in each branch? What is logged?

type ApiResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function processResult(result: ApiResult<number>): string {
  if (result.status === "success") {
    return `Value: ${result.data * 2}`;
  } else {
    return `Error: ${result.error}`;
  }
}

const ex1a = processResult({ status: "success", data: 21 });
const ex1b = processResult({ status: "error", error: "not found" });

// console.log("Ex1:", ex1a, "|", ex1b);

// YOUR PREDICTION:
// ex1a: ???
// ex1b: ???

// ============================================================================
// EXERCISE 2 — Predict the Output
// ============================================================================
// What does TypeScript infer for the mapped type?

type FieldState<T> = { value: T; error: string | null };

type FormFields<T extends object> = {
  [K in keyof T]: FieldState<T[K]>;
};

interface LoginData {
  email: string;
  age: number;
}

type LoginFields = FormFields<LoginData>;

// Describe the shape of LoginFields:
// LoginFields = ???

const ex2: LoginFields = {
  email: { value: "test@test.com", error: null },
  age: { value: 25, error: null },
};

// console.log("Ex2:", ex2.email.value, ex2.age.value);

// YOUR PREDICTION:
// LoginFields shape: ???
// Output: ???

// ============================================================================
// EXERCISE 3 — Predict the Output
// ============================================================================
// What happens with the exhaustiveness check?

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

// console.log("Ex3:", ex3a, ex3b, ex3c);

// YOUR PREDICTION:
// ex3a: ???
// ex3b: ???
// ex3c: ???

// ============================================================================
// EXERCISE 4 — Predict the Output
// ============================================================================
// What does the branded type prevent?

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

// console.log("Ex4:", ex4);
// console.log("Ex4 typeof:", typeof uid);

// What would happen with greetUser(oid)? (don't uncomment — it won't compile)
// What is typeof uid at runtime?

// YOUR PREDICTION:
// ex4: ???
// typeof uid at runtime: ???
// greetUser(oid) would: ???

// ============================================================================
// EXERCISE 5 — Predict the Output
// ============================================================================
// What does the Result type narrow to?

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

// console.log("Ex5:", showResult(ex5a), "|", showResult(ex5b));

// YOUR PREDICTION:
// ex5a: ???
// ex5b: ???
// Output: ???

// ============================================================================
// EXERCISE 6 — Fix the Bug
// ============================================================================
// This typed event emitter has a bug. Fix it so it compiles.

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

// BUG: The listener parameters below are wrong. Fix the `on` calls.
chat.on("message", (sender: string, text: string) => {
  void sender; void text;
});

// FIX THIS: wrong parameter count/types
// chat.on("join", (username: number) => {  // <-- wrong type
//   void username;
// });

// YOUR FIX:
chat.on("join", (username: string) => {
  void username;
});

// ============================================================================
// EXERCISE 7 — Fix the Bug
// ============================================================================
// The DeepPartial type doesn't handle arrays correctly.
// Fix DeepPartialBroken so arrays are not recursed into.

type DeepPartialBroken<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartialBroken<T[K]> : T[K];
};

// Fixed version:
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<any> // FIX: add this check
      ? T[K]
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

// This should work — origins should accept string[], not DeepPartial<string[]>
const partialConfig: DeepPartial<ServerConfig> = {
  cors: {
    origins: ["http://localhost:3000"],
  },
};

void partialConfig;

// ============================================================================
// EXERCISE 8 — Fix the Bug
// ============================================================================
// The builder's build() should only be callable when url AND method are set.
// Currently it compiles even without setting url. Fix the build() signature.

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

  // FIX: constrain `this` so build() only works when url & method are set
  build(this: RequestBuilder<"url" | "method">): { url: string; method: string } {
    return { url: this._url!, method: this._method! };
  }
}

// This should compile:
const reqOk = new RequestBuilder().url("/api").method("GET").build();
void reqOk;

// These should NOT compile (don't uncomment):
// const reqBad1 = new RequestBuilder().method("GET").build(); // missing url
// const reqBad2 = new RequestBuilder().url("/api").build();   // missing method

// ============================================================================
// EXERCISE 9 — Fix the Bug
// ============================================================================
// The Container's get() returns the wrong type. Fix it.

class Token<T> {
  // The _phantom field ensures each Token<T> is structurally distinct
  private _phantom!: T;
  constructor(public readonly name: string) {}
}

class Container {
  private bindings = new Map<Token<unknown>, () => unknown>();

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, factory as () => unknown);
  }

  // FIX: The return type should be T, not unknown
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

const logger = ctr.get(LoggerToken); // Should be Logger, not unknown
void logger;

// ============================================================================
// EXERCISE 10 — Implement
// ============================================================================
// Implement a generic Ok() and Err() constructor for Result<T, E>.
// They should return properly typed Result values.

type ResultType<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function Ok<T>(value: T): ResultType<T, never> {
  // TODO: implement
  return undefined as any;
}

function Err<E>(error: E): ResultType<never, E> {
  // TODO: implement
  return undefined as any;
}

// TEST (uncomment to verify):
// const r1: ResultType<number, string> = Ok(42);
// const r2: ResultType<number, string> = Err("failed");
// console.log("Ex10:", r1, r2);

// ============================================================================
// EXERCISE 11 — Implement
// ============================================================================
// Implement mapResult: if ok, apply fn to value; if error, pass through.

function mapResult<T, U, E>(
  result: ResultType<T, E>,
  fn: (value: T) => U
): ResultType<U, E> {
  // TODO: implement
  return undefined as any;
}

// TEST (uncomment to verify):
// const r = Ok(5);
// const doubled = mapResult(r, (n) => n * 2);
// const errR = Err("oops");
// const mapped = mapResult(errR, (n: number) => n * 2);
// console.log("Ex11:", doubled, mapped);

// ============================================================================
// EXERCISE 12 — Implement
// ============================================================================
// Implement a type-safe event emitter with on(), off(), and emit().

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
    // TODO: implement
  }

  off<K extends keyof AppEvents>(
    event: K,
    handler: (...args: AppEvents[K]) => void
  ): void {
    // TODO: implement
  }

  emit<K extends keyof AppEvents>(event: K, ...args: AppEvents[K]): void {
    // TODO: implement
  }
}

// TEST (uncomment to verify):
// const emitter = new AppEmitter();
// const handler = (userId: string, ts: number) => console.log("Login:", userId, ts);
// emitter.on("login", handler);
// emitter.emit("login", "user_1", Date.now());
// emitter.off("login", handler);
// emitter.emit("login", "user_2", Date.now()); // no output

// ============================================================================
// EXERCISE 13 — Implement
// ============================================================================
// Implement ValidationRules<T> that maps each field to an array of rules,
// where each rule's `validate` receives the correct field type.

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type ValidationRules<T extends object> = {
  // TODO: implement the mapped type
  [K in keyof T]?: ValidationRule<T[K]>[];
};

interface SignupForm {
  username: string;
  age: number;
  email: string;
}

// TEST: This should compile with correct types (uncomment to verify):
// const signupRules: ValidationRules<SignupForm> = {
//   username: [
//     { validate: (v) => v.length >= 3, message: "Too short" },
//   ],
//   age: [
//     { validate: (v) => v >= 18, message: "Must be 18+" },
//   ],
//   email: [
//     { validate: (v) => v.includes("@"), message: "Invalid email" },
//   ],
// };
// console.log("Ex13: compiles");

// ============================================================================
// EXERCISE 14 — Implement
// ============================================================================
// Implement a type-safe selector system. Create `createSelector` that
// composes two selectors.

interface State {
  users: { id: string; name: string }[];
  currentUserId: string | null;
}

type Selector<S, R> = (state: S) => R;

function createSelector<S, A, R>(
  inputSelector: Selector<S, A>,
  transform: (input: A) => R
): Selector<S, R> {
  // TODO: implement
  return undefined as any;
}

// TEST (uncomment to verify):
// const selectUsers: Selector<State, State["users"]> = (s) => s.users;
// const selectUserCount = createSelector(selectUsers, (users) => users.length);
// const testState: State = {
//   users: [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }],
//   currentUserId: "1",
// };
// console.log("Ex14:", selectUserCount(testState)); // 2

// ============================================================================
// EXERCISE 15 — Implement
// ============================================================================
// Implement branded types for Currency. Create Cents and Dollars brands,
// plus conversion functions.

type Branded<T, B extends string> = T & { readonly __brand: B };

type Cents = Branded<number, "Cents">;
type Dollars = Branded<number, "Dollars">;

function cents(amount: number): Cents {
  // TODO: implement (round to integer)
  return undefined as any;
}

function dollars(amount: number): Dollars {
  // TODO: implement
  return undefined as any;
}

function dollarsToCents(d: Dollars): Cents {
  // TODO: implement
  return undefined as any;
}

function centsToDollars(c: Cents): Dollars {
  // TODO: implement
  return undefined as any;
}

// TEST (uncomment to verify):
// const price = dollars(19.99);
// const priceInCents = dollarsToCents(price);
// const backToDollars = centsToDollars(priceInCents);
// console.log("Ex15:", price, priceInCents, backToDollars);
// Expected: 19.99, 1999, 19.99

// ============================================================================
// EXERCISE 16 — Implement
// ============================================================================
// Implement a fluent QueryBuilder with where(), orderBy(), limit(), and build().

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
    // TODO: implement
    return undefined as any;
  }

  orderBy(field: string): this {
    // TODO: implement
    return undefined as any;
  }

  limit(n: number): this {
    // TODO: implement
    return undefined as any;
  }

  build(): QueryConfig {
    // TODO: implement — return a copy of config
    return undefined as any;
  }
}

// TEST (uncomment to verify):
// const query = new QueryBuilder("users")
//   .where("age > 18")
//   .where("active = true")
//   .orderBy("name")
//   .limit(10)
//   .build();
// console.log("Ex16:", query);

// ============================================================================
// EXERCISE 17 — Implement
// ============================================================================
// Implement ExtractParams<Path> that extracts route parameters from a path
// string like "/users/:userId/posts/:postId".

type ExtractParams<Path extends string> =
  // TODO: implement using template literal types
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Record<Param, string> & ExtractParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Record<Param, string>
      : {};

// Verify your implementation:
type _TestParams1 = ExtractParams<"/users/:userId">;
// Should be { userId: string }

type _TestParams2 = ExtractParams<"/users/:userId/posts/:postId">;
// Should be { userId: string } & { postId: string }

// Runtime helper to test:
function defineRoute<P extends string>(
  _path: P,
  handler: (params: ExtractParams<P>) => string
): (params: ExtractParams<P>) => string {
  return handler;
}

// TEST (uncomment to verify):
// const userRoute = defineRoute("/users/:userId", (params) => {
//   return `User: ${params.userId}`;
// });
// const postRoute = defineRoute("/users/:userId/posts/:postId", (params) => {
//   return `User: ${params.userId}, Post: ${params.postId}`;
// });
// console.log("Ex17:", userRoute({ userId: "123" } as any));

// ============================================================================
// EXERCISE 18 — Implement
// ============================================================================
// Implement a generic PaginatedResponse<T> type and a function that creates
// a paginated result from an array.

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
  // TODO: implement
  // - slice the correct page from allItems
  // - calculate total, hasNext, hasPrev
  return undefined as any;
}

// TEST (uncomment to verify):
// const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
// const page1 = paginate(items, 1, 10);
// const page3 = paginate(items, 3, 10);
// console.log("Ex18 page1:", page1.items.length, page1.hasNext, page1.hasPrev);
// console.log("Ex18 page3:", page3.items.length, page3.hasNext, page3.hasPrev);
// Expected: 10 true false / 5 false true
