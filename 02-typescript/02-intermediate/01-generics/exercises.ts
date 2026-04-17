// ============================================================================
// 01-generics: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/01-generics/exercises.ts
//
// 18 exercises: ~6 predict-output, ~4 fix-the-bug, ~8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output
// ============================================================================
// What does TypeScript infer for each variable's type? What is logged?

function identity<T>(arg: T): T {
  return arg;
}

const ex1a = identity("hello");
const ex1b = identity(42);
const ex1c = identity(true);

// console.log("Ex1:", typeof ex1a, typeof ex1b, typeof ex1c);

// YOUR PREDICTION:
// ex1a type: ???
// ex1b type: ???
// ex1c type: ???
// Output: ???

// ============================================================================
// EXERCISE 2 — Predict the Output
// ============================================================================
// What type does TypeScript infer for `result`? What is logged?

function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const ex2a = firstElement([10, 20, 30]);
const ex2b = firstElement<string>([]);
const ex2c = firstElement(["a", 1, true]);

// console.log("Ex2:", ex2a, ex2b, ex2c);

// YOUR PREDICTION:
// ex2a type: ???, value: ???
// ex2b type: ???, value: ???
// ex2c type: ???, value: ???

// ============================================================================
// EXERCISE 3 — Predict the Output
// ============================================================================
// What happens with generic constraints?

function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

const ex3a = getLength("hello");
const ex3b = getLength([1, 2, 3]);
const ex3c = getLength({ length: 42, name: "test" });

// console.log("Ex3:", ex3a, ex3b, ex3c);

// YOUR PREDICTION:
// ex3a: ???
// ex3b: ???
// ex3c: ???

// ============================================================================
// EXERCISE 4 — Predict the Output
// ============================================================================
// What does keyof constraint do here?

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Alice", age: 30, active: true };
const ex4a = getProperty(person, "name");
const ex4b = getProperty(person, "age");
const ex4c = getProperty(person, "active");

// console.log("Ex4:", ex4a, ex4b, ex4c);

// YOUR PREDICTION:
// ex4a type: ???, value: ???
// ex4b type: ???, value: ???
// ex4c type: ???, value: ???

// ============================================================================
// EXERCISE 5 — Predict the Output
// ============================================================================
// What type does `merge` return?

function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b } as T & U;
}

const ex5 = merge({ name: "Alice" }, { age: 30 });

// console.log("Ex5:", ex5.name, ex5.age);

// YOUR PREDICTION:
// ex5 type: ???
// Output: ???

// ============================================================================
// EXERCISE 6 — Predict the Output
// ============================================================================
// Default type parameters

interface Container<T = string> {
  value: T;
}

const ex6a: Container = { value: "hello" };
const ex6b: Container<number> = { value: 42 };

// console.log("Ex6:", ex6a.value, ex6b.value);

// YOUR PREDICTION:
// ex6a.value type: ???
// ex6b.value type: ???
// Output: ???

// ============================================================================
// EXERCISE 7 — Fix the Bug
// ============================================================================
// This function should return the longer of two values that have a `.length`.
// Fix the type errors.

// function longest<T>(a: T, b: T): T {
//   if (a.length >= b.length) {
//     return a;
//   }
//   return b;
// }
// const longerArray = longest([1, 2, 3], [4, 5]);
// const longerString = longest("alice", "bob");

// ============================================================================
// EXERCISE 8 — Fix the Bug
// ============================================================================
// This generic Stack class has a bug. Fix it so it compiles and works.

// class Stack<T> {
//   private items: T[] = [];
//
//   push(item: T): void {
//     this.items.push(item);
//   }
//
//   pop(): T {
//     if (this.items.length === 0) {
//       return null;  // BUG: null is not assignable to T
//     }
//     return this.items.pop();
//   }
//
//   peek(): T {
//     return this.items[this.items.length - 1];
//   }
// }

// ============================================================================
// EXERCISE 9 — Fix the Bug
// ============================================================================
// This function is supposed to create a typed Map from key-value pairs.
// Fix the type errors.

// function createMap<K, V>(entries: [K, V][]): Map<K, V> {
//   const map = new Map();  // BUG: Map type not specified
//   for (const entry of entries) {
//     map.set(entry[0], entry[1]);
//   }
//   return map;
// }
// const userMap = createMap<string, number>([["alice", 1], ["bob", 2]]);

// ============================================================================
// EXERCISE 10 — Fix the Bug
// ============================================================================
// This function tries to constrain K to keys of T, but has an error.

// function pluck<T, K>(items: T[], key: K): T[K][] {
//   return items.map(item => item[key]);
// }
// const users = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }];
// const names = pluck(users, "name");

// ============================================================================
// EXERCISE 11 — Implement
// ============================================================================
// Implement a generic `reverseArray` function that takes an array of T
// and returns a new array with elements in reverse order.
// Do NOT mutate the original array.

// function reverseArray<...>(...): ... {
//   // your code here
// }

// Test (uncomment to verify):
// console.log("Ex11:", reverseArray([1, 2, 3]));           // [3, 2, 1]
// console.log("Ex11:", reverseArray(["a", "b", "c"]));     // ["c", "b", "a"]

// ============================================================================
// EXERCISE 12 — Implement
// ============================================================================
// Implement a generic `filterByType` function.
// Given an array of mixed types and a type guard function,
// return only the elements that pass the guard.

// function filterByType<T, S extends T>(
//   arr: T[],
//   guard: (item: T) => item is S
// ): S[] {
//   // your code here
// }

// Test (uncomment to verify):
// const mixed: (string | number)[] = [1, "a", 2, "b", 3];
// const strings = filterByType(mixed, (x): x is string => typeof x === "string");
// console.log("Ex12:", strings); // ["a", "b"]

// ============================================================================
// EXERCISE 13 — Implement
// ============================================================================
// Implement a generic `groupBy` function.
// Given an array and a key-extraction function, return a Record grouping items.

// function groupBy<T, K extends string>(
//   items: T[],
//   keyFn: (item: T) => K
// ): Record<string, T[]> {
//   // your code here
// }

// Test (uncomment to verify):
// const people = [
//   { name: "Alice", dept: "eng" },
//   { name: "Bob", dept: "eng" },
//   { name: "Charlie", dept: "sales" },
// ];
// const byDept = groupBy(people, (p) => p.dept);
// console.log("Ex13:", JSON.stringify(byDept));

// ============================================================================
// EXERCISE 14 — Implement
// ============================================================================
// Implement a generic `memoize` function.
// It should cache results based on the string representation of arguments.
// Only needs to work with functions that take serializable arguments.

// function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
//   // your code here
// }

// Test (uncomment to verify):
// let callCount = 0;
// const add = memoize((a: number, b: number): number => {
//   callCount++;
//   return a + b;
// });
// console.log("Ex14:", add(1, 2)); // 3
// console.log("Ex14:", add(1, 2)); // 3 (cached)
// console.log("Ex14: callCount =", callCount); // 1

// ============================================================================
// EXERCISE 15 — Implement
// ============================================================================
// Implement a generic `Result` type and constructor functions.
// Result<T, E> is either { ok: true; value: T } or { ok: false; error: E }.

// type Result<T, E = Error> = ???;
//
// function ok<T>(value: T): Result<T, never> {
//   // your code here
// }
//
// function err<E>(error: E): Result<never, E> {
//   // your code here
// }
//
// function unwrap<T, E>(result: Result<T, E>): T {
//   // your code here — throw if error
// }

// Test (uncomment to verify):
// const success = ok(42);
// const failure = err(new Error("oops"));
// console.log("Ex15:", unwrap(success));  // 42
// try { unwrap(failure); } catch (e) { console.log("Ex15: caught", (e as Error).message); }

// ============================================================================
// EXERCISE 16 — Implement
// ============================================================================
// Implement a generic `EventEmitter` class with type-safe events.

// interface EventMap {
//   [event: string]: unknown[];
// }
//
// class TypedEmitter<T extends EventMap> {
//   // Implement: on, emit, off
// }

// Test (uncomment to verify):
// type AppEvents = {
//   login: [username: string];
//   error: [code: number, message: string];
//   logout: [];
// };
// const emitter = new TypedEmitter<AppEvents>();
// emitter.on("login", (username) => console.log("Ex16: login", username));
// emitter.on("error", (code, msg) => console.log("Ex16: error", code, msg));
// emitter.emit("login", "Alice");
// emitter.emit("error", 404, "Not Found");

// ============================================================================
// EXERCISE 17 — Implement
// ============================================================================
// Implement generic utility types from scratch (no using the built-in ones).

// type MyPartial<T> = ???;
// type MyRequired<T> = ???;
// type MyPick<T, K extends keyof T> = ???;
// type MyOmit<T, K extends keyof T> = ???;

// Test (uncomment to verify):
// interface Todo {
//   title: string;
//   description: string;
//   done: boolean;
// }
// const partial: MyPartial<Todo> = { title: "test" };
// const picked: MyPick<Todo, "title" | "done"> = { title: "test", done: false };
// const omitted: MyOmit<Todo, "description"> = { title: "test", done: false };
// console.log("Ex17:", partial, picked, omitted);

// ============================================================================
// EXERCISE 18 — Implement
// ============================================================================
// Implement a generic `Builder` class that constructs objects step by step.
// Each `.set(key, value)` call should return a new Builder with the updated type,
// and `.build()` should return the final object.

// class Builder<T extends Record<string, unknown> = {}> {
//   // your code here
// }

// Test (uncomment to verify):
// const user = new Builder()
//   .set("name", "Alice")
//   .set("age", 30)
//   .set("active", true)
//   .build();
// console.log("Ex18:", user); // { name: "Alice", age: 30, active: true }

// ============================================================================
// END OF EXERCISES
// ============================================================================

console.log("exercises.ts compiled and ran successfully (all tests commented out).");
