# Real-World Patterns in TypeScript

> **Prerequisites**: Generics, utility types, type guards, conditional types, mapped types.
> **References**: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/),
> real-world TypeScript patterns from production codebases.

---

## Table of Contents

1. [Typing API Responses](#1-typing-api-responses)
2. [Form Validation Typing](#2-form-validation-typing)
3. [State Management Typing](#3-state-management-typing)
4. [React Component Typing Patterns](#4-react-component-typing-patterns)
5. [Builder Pattern with Fluent API](#5-builder-pattern-with-fluent-api)
6. [Error Handling Patterns](#6-error-handling-patterns)
7. [Configuration Objects](#7-configuration-objects)
8. [Event Emitter Typing](#8-event-emitter-typing)
9. [Dependency Injection Typing](#9-dependency-injection-typing)
10. [Type-Safe Routing](#10-type-safe-routing)
11. [Branded / Nominal Types](#11-branded--nominal-types)

---

## 1. Typing API Responses

### Generic Fetch Wrapper

```typescript
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

interface User { id: number; name: string; email: string; }
const user = await fetchJson<User>("/api/users/1"); // typed as User
```

**Caveat**: `as Promise<T>` is a type assertion — it does NOT validate at runtime.

### Discriminated Union Results

Wrap success/failure into a discriminated union for exhaustive handling:

```typescript
type ApiResult<T> =
  | { status: "success"; data: T; statusCode: number }
  | { status: "error"; error: string; statusCode: number };

async function apiFetch<T>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { status: "error", error: `HTTP ${res.status}`, statusCode: res.status };
    return { status: "success", data: (await res.json()) as T, statusCode: res.status };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "Unknown", statusCode: 0 };
  }
}

const result = await apiFetch<User>("/api/users/1");
if (result.status === "success") {
  console.log(result.data.name); // ✅ data is User
} else {
  console.error(result.error);   // ✅ error is string
}
```

---

## 2. Form Validation Typing

### Zod-Like Schema Typing

The core idea: derive TypeScript types from runtime schema definitions.

```typescript
type SchemaType =
  | { kind: "string" } | { kind: "number" } | { kind: "boolean" }
  | { kind: "object"; shape: Record<string, SchemaType> }
  | { kind: "array"; element: SchemaType };

type Infer<S extends SchemaType> =
  S extends { kind: "string" } ? string :
  S extends { kind: "number" } ? number :
  S extends { kind: "boolean" } ? boolean :
  S extends { kind: "array"; element: infer E extends SchemaType } ? Infer<E>[] :
  S extends { kind: "object"; shape: infer Shape extends Record<string, SchemaType> }
    ? { [K in keyof Shape]: Infer<Shape[K]> } : never;
```

### Form State Types

```typescript
interface FieldState<T> {
  value: T; error: string | null; touched: boolean; dirty: boolean;
}

type FormState<T extends object> = {
  fields: { [K in keyof T]: FieldState<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
};

// ValidationRules maps each field to type-safe validators
type ValidationRule<T> = { validate: (value: T) => boolean; message: string };
type ValidationRules<T extends object> = { [K in keyof T]?: ValidationRule<T[K]>[] };
```

---

## 3. State Management Typing

### Redux-Like Action Types

```typescript
type Action =
  | { type: "INCREMENT"; payload: number }
  | { type: "DECREMENT"; payload: number }
  | { type: "RESET" }
  | { type: "SET_NAME"; payload: string };
```

### Typed Reducers with Exhaustiveness

```typescript
interface AppState { count: number; name: string; }
type Reducer<S, A> = (state: S, action: A) => S;

const reducer: Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case "INCREMENT":  return { ...state, count: state.count + action.payload };
    case "DECREMENT":  return { ...state, count: state.count - action.payload };
    case "RESET":      return { ...state, count: 0 };
    case "SET_NAME":   return { ...state, name: action.payload };
    default:
      const _exhaustive: never = action; // compile error if a case is missing
      return state;
  }
};
```

### Typed Selectors

```typescript
type Selector<S, R> = (state: S) => R;

function createSelector<S, A, R>(
  input: Selector<S, A>, transform: (a: A) => R
): Selector<S, R> {
  return (state) => transform(input(state));
}

const selectCount: Selector<AppState, number> = (s) => s.count;
const selectDouble = createSelector(selectCount, (c) => c * 2);
```

---

## 4. React Component Typing Patterns

Conceptual patterns — applicable to React, Solid, or any component framework.

### Props, Events, Refs

```typescript
// Discriminated union props
type ModalProps =
  | { mode: "confirm"; onConfirm: () => void; onCancel: () => void }
  | { mode: "alert"; onDismiss: () => void };

// Typed event handlers
type EventHandler<E> = (event: E) => void;
interface FormHandlers {
  onChange: EventHandler<{ target: { value: string; name: string } }>;
  onSubmit: EventHandler<{ preventDefault: () => void }>;
}

// Ref pattern
interface MutableRef<T> { current: T; }
function createRef<T>(initial: T): MutableRef<T> { return { current: initial }; }
```

### Generic Component Props

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => string;
  keyExtractor: (item: T) => string | number;
  onSelect?: (item: T) => void;
}

interface Column<T> { key: keyof T; header: string; }
interface TableProps<T> { data: T[]; columns: Column<T>[]; }
```

---

## 5. Builder Pattern with Fluent API

### Basic Fluent Builder

```typescript
class QueryBuilder {
  private config = { table: "", conditions: [] as string[], orderBy: "", limit: 0 };
  constructor(table: string) { this.config.table = table; }
  where(c: string): this { this.config.conditions.push(c); return this; }
  orderBy(f: string): this { this.config.orderBy = f; return this; }
  limit(n: number): this { this.config.limit = n; return this; }
  build() { return { ...this.config }; }
}
```

### Type-Safe Builder (Tracking Required Fields)

```typescript
class RequestBuilder<Set extends string = never> {
  private config: Partial<{ url: string; method: string }> = {};

  url(url: string): RequestBuilder<Set | "url"> {
    this.config.url = url;
    return this as any;
  }
  method(m: string): RequestBuilder<Set | "method"> {
    this.config.method = m;
    return this as any;
  }
  // Only callable when both "url" and "method" are set
  build(this: RequestBuilder<"url" | "method">) {
    return this.config as { url: string; method: string };
  }
}

new RequestBuilder().url("/api").method("POST").build(); // ✅
// new RequestBuilder().method("GET").build();            // ❌ compile error
```

---

## 6. Error Handling Patterns

### Result<T, E> Type

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
function Err<E>(error: E): Result<never, E> { return { ok: false, error }; }

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
}
```

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode: number) {
    super(message);
  }
}
class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(`${resource} ${id} not found`, "NOT_FOUND", 404);
  }
}

function isAppError(e: unknown): e is AppError { return e instanceof AppError; }
```

### Chaining Results

```typescript
function mapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.ok ? Ok(fn(r.value)) : r;
}
function flatMapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  return r.ok ? fn(r.value) : r;
}
```

---

## 7. Configuration Objects

### DeepPartial

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<any> ? T[K] : DeepPartial<T[K]>
    : T[K];
};
```

### Defaults Merging

```typescript
interface AppConfig {
  server: { port: number; host: string; cors: { origins: string[]; credentials: boolean } };
  logging: { level: "debug" | "info" | "warn" | "error"; pretty: boolean };
}

function mergeConfig(defaults: AppConfig, overrides: DeepPartial<AppConfig>): AppConfig {
  return {
    server: {
      ...defaults.server, ...overrides.server,
      cors: { ...defaults.server.cors, ...overrides.server?.cors },
    },
    logging: { ...defaults.logging, ...overrides.logging },
  };
}
```

---

## 8. Event Emitter Typing

```typescript
class TypedEmitter<Events extends { [K in keyof Events]: unknown[] }> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return this;
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

interface ServerEvents {
  connection: [id: string, ip: string];
  error: [error: Error];
  close: [];
}

const server = new TypedEmitter<ServerEvents>();
server.on("connection", (id, ip) => { /* id: string, ip: string */ });
// server.emit("connection", 123); // ❌ type error
```

---

## 9. Dependency Injection Typing

### Token-Based DI Container

```typescript
class Token<T> {
  private _phantom!: T;
  constructor(public readonly name: string) {}
}

class Container {
  private bindings = new Map<Token<unknown>, () => unknown>();

  bind<T>(token: Token<T>, factory: () => T): void {
    this.bindings.set(token, factory as () => unknown);
  }
  get<T>(token: Token<T>): T {
    const factory = this.bindings.get(token);
    if (!factory) throw new Error(`No binding for ${token.name}`);
    return factory() as T;
  }
}

interface Logger { log(msg: string): void; }
const LoggerToken = new Token<Logger>("Logger");

const container = new Container();
container.bind(LoggerToken, () => ({ log: (msg: string) => console.log(msg) }));
const logger = container.get(LoggerToken); // typed as Logger ✅
```

---

## 10. Type-Safe Routing

### Extract Route Parameters with Template Literal Types

```typescript
type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

type UserParams = ExtractParams<"/users/:userId">;
// { userId: string }

type PostParams = ExtractParams<"/users/:userId/posts/:postId">;
// { userId: string } & { postId: string }

function defineRoute<P extends string>(
  path: P, handler: (params: ExtractParams<P>) => unknown
) { return { path, handler }; }

const userRoute = defineRoute("/users/:userId", (params) => {
  return params.userId; // ✅ typed as string
});
```

---

## 11. Branded / Nominal Types

TypeScript uses structural typing, so `string` is `string` everywhere. Branded
types add a phantom field to create nominal distinctions.

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function UserId(id: string): UserId { return id as UserId; }
function OrderId(id: string): OrderId { return id as OrderId; }

function getUser(id: UserId): void { /* ... */ }
const uid = UserId("usr_123");
const oid = OrderId("ord_456");
getUser(uid);   // ✅
// getUser(oid); // ❌ OrderId is not assignable to UserId
```

### Branded Numeric Types

```typescript
type Cents = Brand<number, "Cents">;
type Dollars = Brand<number, "Dollars">;

function dollarsToCents(d: Dollars): Cents {
  return Math.round((d as number) * 100) as Cents;
}

function charge(amount: Cents): void { /* ... */ }
// charge(1999);            // ❌ number is not Cents
// charge(Cents(1999));     // ✅
```

---

## Summary

| Pattern | Key Technique | Benefit |
|---------|--------------|---------|
| API Responses | Discriminated unions + generics | Safe result handling |
| Form Validation | Mapped types | Type-safe field rules |
| State Management | Discriminated union actions | Exhaustive reducers |
| Component Props | Generics + union props | Flexible components |
| Builder Pattern | Phantom type tracking | Compile-time completeness |
| Result\<T, E\> | Discriminated union | Forced error handling |
| Config Objects | DeepPartial | Safe partial overrides |
| Event Emitter | Generic event map | Typed event args |
| DI Container | Branded tokens | Type-safe resolution |
| Routing | Template literal types | Param extraction |
| Branded Types | Phantom intersection | Nominal distinction |

---

## Exercises

See `exercises.ts` for 18 hands-on exercises covering these patterns.
Run: `npx tsx 02-typescript/04-practical/02-real-world-patterns/exercises.ts`
