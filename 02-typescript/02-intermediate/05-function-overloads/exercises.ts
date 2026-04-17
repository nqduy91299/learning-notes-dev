// ============================================================================
// 05-function-overloads: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/05-function-overloads/exercises.ts
//
// 15 exercises covering function overloads in TypeScript.
// Mix: ~5 predict-output, ~3 fix-the-bug, ~7 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================


// ----------------------------------------------------------------------------
// Exercise 1 — Predict the Output
// ----------------------------------------------------------------------------
// What does TypeScript infer for `a` and `b`?

function toStr(value: number): string;
function toStr(value: boolean): string;
function toStr(value: number | boolean): string {
  return String(value);
}

const ex1a = toStr(42);
const ex1b = toStr(true);

// console.log("Ex1:", typeof ex1a, typeof ex1b);
// Question: What are the compile-time types of ex1a and ex1b?
// Your answer:


// ----------------------------------------------------------------------------
// Exercise 2 — Predict the Output
// ----------------------------------------------------------------------------
// Which overload does TypeScript select?

function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: string | number, b: string | number): string | number {
  if (typeof a === "string" && typeof b === "string") return a + b;
  if (typeof a === "number" && typeof b === "number") return a + b;
  return String(a) + String(b);
}

const ex2 = combine("hello", " world");

// console.log("Ex2:", ex2);
// Question: What is the compile-time type and runtime value of ex2?
// Your answer:


// ----------------------------------------------------------------------------
// Exercise 3 — Predict the Output
// ----------------------------------------------------------------------------
// Does this compile? If so, what is the type of `result`?

function identity(x: string): string;
function identity(x: number): number;
function identity(x: string | number): string | number {
  return x;
}

const ex3 = identity(100);

// console.log("Ex3:", ex3);
// Question: What is the compile-time type of ex3?
// Your answer:


// ----------------------------------------------------------------------------
// Exercise 4 — Predict the Output
// ----------------------------------------------------------------------------
// Overload resolution is top-to-bottom. What type does TS infer for `result`?

function parse(input: unknown): string;
function parse(input: string): string[];
function parse(input: unknown): string | string[] {
  if (typeof input === "string") return input.split(",");
  return String(input);
}

const ex4 = parse("a,b,c");

// console.log("Ex4:", ex4);
// Question: What is the COMPILE-TIME type of ex4? (Careful — order matters!)
// Your answer:


// ----------------------------------------------------------------------------
// Exercise 5 — Predict the Output
// ----------------------------------------------------------------------------
// What happens with class method overloads?

class Converter {
  convert(val: string): number;
  convert(val: number): string;
  convert(val: string | number): string | number {
    if (typeof val === "string") return val.length;
    return String(val);
  }
}

const conv = new Converter();
const ex5a = conv.convert("hello");
const ex5b = conv.convert(999);

// console.log("Ex5:", ex5a, ex5b);
// Question: What are the compile-time types of ex5a and ex5b?
// Your answer:


// ----------------------------------------------------------------------------
// Exercise 6 — Fix the Bug
// ----------------------------------------------------------------------------
// This code has a compile error. Fix it so both overloads work correctly.

// function double(x: number): number;
// function double(x: string): string;
// function double(x: number): number | string {
//   if (typeof x === "number") return x * 2;
//   return (x as string).repeat(2);
// }

// Uncomment and fix above, then uncomment below:
// console.log("Ex6:", double(5), double("ab"));


// ----------------------------------------------------------------------------
// Exercise 7 — Fix the Bug
// ----------------------------------------------------------------------------
// The overloads are in the wrong order — a specific overload is shadowed.
// Fix the ordering so that `result` has the correct type.

// function describe(value: unknown): string;
// function describe(value: number): "number";
// function describe(value: string): "string";
// function describe(value: unknown): string {
//   if (typeof value === "number") return "number";
//   if (typeof value === "string") return "string";
//   return "other";
// }

// const ex7 = describe(42);
// Uncomment and fix above so that `ex7` is typed as "number", not string.
// console.log("Ex7:", ex7);


// ----------------------------------------------------------------------------
// Exercise 8 — Fix the Bug
// ----------------------------------------------------------------------------
// The implementation signature's return type is too narrow. Fix it.

// function stringify(value: number): string;
// function stringify(value: number[]): string[];
// function stringify(value: number | number[]): string {
//   if (Array.isArray(value)) return value.map(String);
//   return String(value);
// }

// Uncomment and fix above, then uncomment below:
// console.log("Ex8:", stringify(1), stringify([1, 2]));


// ----------------------------------------------------------------------------
// Exercise 9 — Implement
// ----------------------------------------------------------------------------
// Create an overloaded function `makeArray` that:
//   - Given a string, returns string[]  (split by each character)
//   - Given a number, returns number[]  (array with just that number)

// function makeArray ...

// console.log("Ex9:", makeArray("abc"), makeArray(7));
// Expected: ["a","b","c"]  [7]


// ----------------------------------------------------------------------------
// Exercise 10 — Implement
// ----------------------------------------------------------------------------
// Create an overloaded function `flatten` that:
//   - Given a number[][], returns number[]
//   - Given a string[][], returns string[]

// function flatten ...

// console.log("Ex10:", flatten([[1,2],[3]]), flatten([["a"],["b","c"]]));
// Expected: [1,2,3]  ["a","b","c"]


// ----------------------------------------------------------------------------
// Exercise 11 — Implement
// ----------------------------------------------------------------------------
// Create a class `Container` with an overloaded `get` method:
//   - get(index: number): T              — returns item at index
//   - get(): T[]                          — returns all items
// The class should be generic: Container<T>
// Constructor takes an initial T[].

// class Container<T> { ... }

// const c = new Container([10, 20, 30]);
// console.log("Ex11:", c.get(1), c.get());
// Expected: 20  [10, 20, 30]


// ----------------------------------------------------------------------------
// Exercise 12 — Implement
// ----------------------------------------------------------------------------
// Create an overloaded function `createEvent` that:
//   - ("click", x: number, y: number) => { type: "click"; x: number; y: number }
//   - ("keypress", key: string) => { type: "keypress"; key: string }

// function createEvent ...

// console.log("Ex12:", createEvent("click", 10, 20), createEvent("keypress", "Enter"));


// ----------------------------------------------------------------------------
// Exercise 13 — Implement
// ----------------------------------------------------------------------------
// Create a class `Pair` with constructor overloads:
//   - constructor(first: T, second: U)
//   - constructor(tuple: [T, U])
// The class stores `first: T` and `second: U`.

// class Pair<T, U> { ... }

// const p1 = new Pair("hello", 42);
// const p2 = new Pair<string, number>(["world", 99]);
// console.log("Ex13:", p1.first, p1.second, p2.first, p2.second);


// ----------------------------------------------------------------------------
// Exercise 14 — Implement
// ----------------------------------------------------------------------------
// Create an overloaded function `pick` that:
//   - pick(obj: T, key: K) => T[K]              — single key returns value
//   - pick(obj: T, keys: K[]) => Pick<T, K>     — array of keys returns sub-object
// Use generics with proper constraints.

// function pick ...

// const user = { name: "Alice", age: 30, email: "a@b.c" };
// console.log("Ex14:", pick(user, "name"), pick(user, ["name", "age"]));
// Expected: "Alice"  { name: "Alice", age: 30 }


// ----------------------------------------------------------------------------
// Exercise 15 — Implement
// ----------------------------------------------------------------------------
// Create an overloaded function `transform` that:
//   - (value: string, fn: (s: string) => string): string
//   - (value: number, fn: (n: number) => number): number
//   - (value: string[], fn: (s: string) => string): string[]
// Each variant applies the function to the value (or each element for arrays).

// function transform ...

// console.log("Ex15:",
//   transform("hello", s => s.toUpperCase()),
//   transform(5, n => n * 3),
//   transform(["a", "b"], s => s + "!")
// );
// Expected: "HELLO"  15  ["a!", "b!"]
