// ============================================================================
// 01-generics: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/01-generics/solutions.ts
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output (Solution)
// ============================================================================
// TypeScript infers the literal or widened type from the argument.

function identity<T>(arg: T): T {
  return arg;
}

const ex1a = identity("hello"); // type: string (widened from "hello")
const ex1b = identity(42);      // type: number (widened from 42)
const ex1c = identity(true);    // type: boolean (widened from true)

console.log("Ex1:", typeof ex1a, typeof ex1b, typeof ex1c);
// Output: Ex1: string number boolean
//
// Explanation: TypeScript infers T from the argument. `typeof` at runtime
// returns the JavaScript type string. The TS types are `string`, `number`,
// and `boolean` respectively (or `true` as a literal type for ex1c, depending
// on context, but `typeof` at runtime always says "boolean").

// ============================================================================
// EXERCISE 2 — Predict the Output (Solution)
// ============================================================================

function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const ex2a = firstElement([10, 20, 30]);        // type: number | undefined, value: 10
const ex2b = firstElement<string>([]);           // type: string | undefined, value: undefined
const ex2c = firstElement(["a", 1, true]);       // type: string | number | boolean | undefined, value: "a"

console.log("Ex2:", ex2a, ex2b, ex2c);
// Output: Ex2: 10 undefined a
//
// Explanation:
// - ex2a: T = number, first element is 10
// - ex2b: T explicitly string, empty array → undefined
// - ex2c: T = string | number | boolean (union of element types), first is "a"

// ============================================================================
// EXERCISE 3 — Predict the Output (Solution)
// ============================================================================

function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

const ex3a = getLength("hello");                          // 5
const ex3b = getLength([1, 2, 3]);                        // 3
const ex3c = getLength({ length: 42, name: "test" });     // 42

console.log("Ex3:", ex3a, ex3b, ex3c);
// Output: Ex3: 5 3 42
//
// Explanation: The constraint `{ length: number }` is satisfied by strings,
// arrays, and any object with a numeric `length` property.

// ============================================================================
// EXERCISE 4 — Predict the Output (Solution)
// ============================================================================

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30, active: true };
const ex4a = getProperty(person, "name");    // type: string, value: "Alice"
const ex4b = getProperty(person, "age");     // type: number, value: 30
const ex4c = getProperty(person, "active");  // type: boolean, value: true

console.log("Ex4:", ex4a, ex4b, ex4c);
// Output: Ex4: Alice 30 true
//
// Explanation: K extends keyof T ensures only valid keys are accepted.
// T[K] is the indexed access type — the type of the property at key K.

// ============================================================================
// EXERCISE 5 — Predict the Output (Solution)
// ============================================================================

function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b } as T & U;
}

const ex5 = merge({ name: "Alice" }, { age: 30 });
// type: { name: string } & { age: number }
// Which simplifies to { name: string; age: number }

console.log("Ex5:", ex5.name, ex5.age);
// Output: Ex5: Alice 30

// ============================================================================
// EXERCISE 6 — Predict the Output (Solution)
// ============================================================================

interface Container<T = string> {
  value: T;
}

const ex6a: Container = { value: "hello" };     // T defaults to string
const ex6b: Container<number> = { value: 42 };  // T = number

console.log("Ex6:", ex6a.value, ex6b.value);
// Output: Ex6: hello 42
//
// Explanation: When no type argument is provided, the default `string` is used.

// ============================================================================
// EXERCISE 7 — Fix the Bug (Solution)
// ============================================================================
// Bug: T is unconstrained, so `.length` is not available.
// Fix: Add constraint `T extends { length: number }`.

function longest<T extends { length: number }>(a: T, b: T): T {
  if (a.length >= b.length) {
    return a;
  }
  return b;
}

const longerArray = longest([1, 2, 3], [4, 5]);
const longerString = longest("alice", "bob");

console.log("Ex7:", longerArray, longerString);
// Output: Ex7: [ 1, 2, 3 ] alice

// ============================================================================
// EXERCISE 8 — Fix the Bug (Solution)
// ============================================================================
// Bug 1: pop() returns T but could return null — need T | undefined
// Bug 2: peek() should also return T | undefined
// Bug 3: Array.pop() returns T | undefined, not T

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    if (this.items.length === 0) {
      return undefined; // FIX: return undefined instead of null
    }
    return this.items.pop(); // FIX: return type matches T | undefined
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
console.log("Ex8:", stack.pop(), stack.peek(), stack.pop(), stack.pop());
// Output: Ex8: 2 1 1 undefined

// ============================================================================
// EXERCISE 9 — Fix the Bug (Solution)
// ============================================================================
// Bug: `new Map()` doesn't preserve the generic types.
// Fix: `new Map<K, V>()`.

function createMap<K, V>(entries: [K, V][]): Map<K, V> {
  const map = new Map<K, V>(); // FIX: specify type arguments
  for (const entry of entries) {
    map.set(entry[0], entry[1]);
  }
  return map;
}

const userMap = createMap<string, number>([["alice", 1], ["bob", 2]]);
console.log("Ex9:", userMap.get("alice"), userMap.get("bob"));
// Output: Ex9: 1 2

// ============================================================================
// EXERCISE 10 — Fix the Bug (Solution)
// ============================================================================
// Bug: K is not constrained to keys of T, so T[K] is invalid.
// Fix: Add `K extends keyof T`.

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }];
const names = pluck(users, "name");
console.log("Ex10:", names);
// Output: Ex10: [ 'Alice', 'Bob' ]

// ============================================================================
// EXERCISE 11 — Implement (Solution)
// ============================================================================
// Generic reverseArray without mutation.

function reverseArray<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

console.log("Ex11:", reverseArray([1, 2, 3]));
console.log("Ex11:", reverseArray(["a", "b", "c"]));
// Output: Ex11: [ 3, 2, 1 ]
// Output: Ex11: [ 'c', 'b', 'a' ]
//
// Explanation: We spread into a new array to avoid mutating the original,
// then call `.reverse()` on the copy. The generic T preserves the element type.

// ============================================================================
// EXERCISE 12 — Implement (Solution)
// ============================================================================
// filterByType using a type guard.

function filterByType<T, S extends T>(
  arr: T[],
  guard: (item: T) => item is S
): S[] {
  return arr.filter(guard);
}

const mixed: (string | number)[] = [1, "a", 2, "b", 3];
const strings = filterByType(mixed, (x): x is string => typeof x === "string");
console.log("Ex12:", strings);
// Output: Ex12: [ 'a', 'b' ]
//
// Explanation: `Array.filter` with a type guard narrows the return type.
// Our wrapper makes this pattern explicit with the S extends T constraint.

// ============================================================================
// EXERCISE 13 — Implement (Solution)
// ============================================================================
// groupBy with generic key extraction.

function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}

const people = [
  { name: "Alice", dept: "eng" },
  { name: "Bob", dept: "eng" },
  { name: "Charlie", dept: "sales" },
];
const byDept = groupBy(people, (p) => p.dept);
console.log("Ex13:", JSON.stringify(byDept));
// Output: Ex13: {"eng":[{"name":"Alice","dept":"eng"},{"name":"Bob","dept":"eng"}],"sales":[{"name":"Charlie","dept":"sales"}]}

// ============================================================================
// EXERCISE 14 — Implement (Solution)
// ============================================================================
// Memoize using JSON.stringify for cache keys.

function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
  const cache = new Map<string, unknown>();
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...(args as Parameters<T>));
    cache.set(key, result);
    return result;
  }) as T;
}

let callCount = 0;
const add = memoize((a: number, b: number): number => {
  callCount++;
  return a + b;
});
console.log("Ex14:", add(1, 2));            // 3
console.log("Ex14:", add(1, 2));            // 3 (cached)
console.log("Ex14: callCount =", callCount); // 1
//
// Explanation: We use JSON.stringify on the args array to create a cache key.
// The cast `as T` is needed because TypeScript can't verify the wrapper has
// the same signature as the original. This is a common pattern in practice.

// ============================================================================
// EXERCISE 15 — Implement (Solution)
// ============================================================================
// Result type with ok/err constructors and unwrap.

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

const success = ok(42);
const failure = err(new Error("oops"));
console.log("Ex15:", unwrap(success)); // 42
try {
  unwrap(failure);
} catch (e) {
  console.log("Ex15: caught", (e as Error).message); // caught oops
}
//
// Explanation: Using `never` in the unused position makes Result<T, never>
// assignable to Result<T, E> for any E. This is because `never` is the
// bottom type — it's assignable to every type.

// ============================================================================
// EXERCISE 16 — Implement (Solution)
// ============================================================================
// Type-safe EventEmitter.

interface EventMap {
  [event: string]: unknown[];
}

class TypedEmitter<T extends EventMap> {
  private listeners = new Map<keyof T, Function[]>();

  on<K extends keyof T & string>(
    event: K,
    listener: (...args: T[K]) => void
  ): void {
    const fns = this.listeners.get(event) ?? [];
    fns.push(listener);
    this.listeners.set(event, fns);
  }

  emit<K extends keyof T & string>(event: K, ...args: T[K]): void {
    const fns = this.listeners.get(event) ?? [];
    fns.forEach((fn) => fn(...args));
  }

  off<K extends keyof T & string>(
    event: K,
    listener: (...args: T[K]) => void
  ): void {
    const fns = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      fns.filter((fn) => fn !== listener)
    );
  }
}

type AppEvents = {
  login: [username: string];
  error: [code: number, message: string];
  logout: [];
};

const emitter = new TypedEmitter<AppEvents>();
emitter.on("login", (username) => console.log("Ex16: login", username));
emitter.on("error", (code, msg) => console.log("Ex16: error", code, msg));
emitter.emit("login", "Alice");
emitter.emit("error", 404, "Not Found");
// Output:
// Ex16: login Alice
// Ex16: error 404 Not Found
//
// Explanation: The event map type `T` maps event names to tuples of argument
// types. The `K extends keyof T & string` constraint ensures only valid event
// names are accepted. `T[K]` gives the argument tuple for that event.

// ============================================================================
// EXERCISE 17 — Implement (Solution)
// ============================================================================
// Utility types from scratch.

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

interface Todo {
  title: string;
  description: string;
  done: boolean;
}

const partial: MyPartial<Todo> = { title: "test" };
const picked: MyPick<Todo, "title" | "done"> = { title: "test", done: false };
const omitted: MyOmit<Todo, "description"> = { title: "test", done: false };
console.log("Ex17:", partial, picked, omitted);
// Output: Ex17: { title: 'test' } { title: 'test', done: false } { title: 'test', done: false }
//
// Explanation:
// - MyPartial: mapped type with `?` modifier makes all properties optional
// - MyRequired: `-?` removes optionality
// - MyPick: iterate over only the keys in K
// - MyOmit: uses key remapping (`as`) — if P extends K, remap to `never`
//   (which removes it), otherwise keep the key

// ============================================================================
// EXERCISE 18 — Implement (Solution)
// ============================================================================
// Type-safe Builder pattern.

class Builder<T extends Record<string, unknown> = Record<string, never>> {
  private data: T;

  constructor(data?: T) {
    this.data = (data ?? {}) as T;
  }

  set<K extends string, V>(
    key: K,
    value: V
  ): Builder<T & Record<K, V>> {
    const newData = { ...this.data, [key]: value } as T & Record<K, V>;
    return new Builder(newData);
  }

  build(): T {
    return { ...this.data };
  }
}

const user = new Builder()
  .set("name", "Alice")
  .set("age", 30)
  .set("active", true)
  .build();

console.log("Ex18:", user);
// Output: Ex18: { name: 'Alice', age: 30, active: true }
//
// Explanation: Each `.set()` returns a NEW Builder with an expanded type
// (T & Record<K, V>). This means the type grows with each call:
//   Builder<{}>
//   → Builder<{ name: string }>
//   → Builder<{ name: string } & { age: number }>
//   → Builder<{ name: string } & { age: number } & { active: boolean }>
// The `.build()` method returns the accumulated type.

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n============================================");
console.log("All 18 solutions ran successfully!");
console.log("============================================");
