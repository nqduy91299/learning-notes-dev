// ============================================================================
// 05-function-overloads: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/02-intermediate/05-function-overloads/solutions.ts
// ============================================================================


// ----------------------------------------------------------------------------
// Exercise 1 — Solution
// ----------------------------------------------------------------------------
// Both ex1a and ex1b have compile-time type `string`.
// Both overloads return `string`, so regardless of which overload matches,
// the result is always `string`.

function toStr(value: number): string;
function toStr(value: boolean): string;
function toStr(value: number | boolean): string {
  return String(value);
}

const ex1a = toStr(42);    // type: string, value: "42"
const ex1b = toStr(true);  // type: string, value: "true"

console.log("Ex1:", typeof ex1a, typeof ex1b);
// Output: Ex1: string string


// ----------------------------------------------------------------------------
// Exercise 2 — Solution
// ----------------------------------------------------------------------------
// TypeScript selects the first overload: combine(string, string): string
// Compile-time type: string. Runtime value: "hello world"

function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: string | number, b: string | number): string | number {
  if (typeof a === "string" && typeof b === "string") return a + b;
  if (typeof a === "number" && typeof b === "number") return a + b;
  return String(a) + String(b);
}

const ex2 = combine("hello", " world");
console.log("Ex2:", ex2);
// Output: Ex2: hello world


// ----------------------------------------------------------------------------
// Exercise 3 — Solution
// ----------------------------------------------------------------------------
// identity(100) matches the second overload: identity(x: number): number
// Compile-time type: number. Runtime value: 100.

function identity(x: string): string;
function identity(x: number): number;
function identity(x: string | number): string | number {
  return x;
}

const ex3 = identity(100);
console.log("Ex3:", ex3);
// Output: Ex3: 100


// ----------------------------------------------------------------------------
// Exercise 4 — Solution
// ----------------------------------------------------------------------------
// Overload resolution is TOP-TO-BOTTOM. The first overload is:
//   parse(input: unknown): string
// Since `"a,b,c"` is assignable to `unknown`, the FIRST overload matches.
// Compile-time type of ex4 is `string` (NOT string[]).
// At runtime it actually returns ["a","b","c"] but TS doesn't know that.
// This demonstrates why ordering overloads correctly is critical.

function parse(input: unknown): string;
function parse(input: string): string[];
function parse(input: unknown): string | string[] {
  if (typeof input === "string") return input.split(",");
  return String(input);
}

const ex4 = parse("a,b,c");
console.log("Ex4:", ex4);
// Output: Ex4: [ 'a', 'b', 'c' ]  (runtime is array, but TS thinks it's string)


// ----------------------------------------------------------------------------
// Exercise 5 — Solution
// ----------------------------------------------------------------------------
// ex5a: convert("hello") matches first overload → type is `number`, value is 5
// ex5b: convert(999) matches second overload → type is `string`, value is "999"

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
console.log("Ex5:", ex5a, ex5b);
// Output: Ex5: 5 999


// ----------------------------------------------------------------------------
// Exercise 6 — Solution
// ----------------------------------------------------------------------------
// Bug: implementation parameter was `x: number` — too narrow for the string
// overload. Fix: widen to `x: number | string`.

function double(x: number): number;
function double(x: string): string;
function double(x: number | string): number | string {
  if (typeof x === "number") return x * 2;
  return x.repeat(2);
}

console.log("Ex6:", double(5), double("ab"));
// Output: Ex6: 10 abab


// ----------------------------------------------------------------------------
// Exercise 7 — Solution
// ----------------------------------------------------------------------------
// Bug: the `unknown` overload was listed first, so it caught everything.
// Fix: put the most specific overloads first.

function describe(value: number): "number";
function describe(value: string): "string";
function describe(value: unknown): string;
function describe(value: unknown): string {
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return "other";
}

const ex7 = describe(42);  // type: "number"
console.log("Ex7:", ex7);
// Output: Ex7: number


// ----------------------------------------------------------------------------
// Exercise 8 — Solution
// ----------------------------------------------------------------------------
// Bug: implementation return type was `string` but the second overload returns
// `string[]`. Fix: widen to `string | string[]`.

function stringify(value: number): string;
function stringify(value: number[]): string[];
function stringify(value: number | number[]): string | string[] {
  if (Array.isArray(value)) return value.map(String);
  return String(value);
}

console.log("Ex8:", stringify(1), stringify([1, 2]));
// Output: Ex8: 1 [ '1', '2' ]


// ----------------------------------------------------------------------------
// Exercise 9 — Solution
// ----------------------------------------------------------------------------
// Overloaded function with different return types based on input type.

function makeArray(input: string): string[];
function makeArray(input: number): number[];
function makeArray(input: string | number): string[] | number[] {
  if (typeof input === "string") return input.split("");
  return [input];
}

console.log("Ex9:", makeArray("abc"), makeArray(7));
// Output: Ex9: [ 'a', 'b', 'c' ] [ 7 ]


// ----------------------------------------------------------------------------
// Exercise 10 — Solution
// ----------------------------------------------------------------------------
// Two overloads for different array element types.

function flatten(arr: number[][]): number[];
function flatten(arr: string[][]): string[];
function flatten(arr: (number | string)[][]): (number | string)[] {
  return arr.reduce<(number | string)[]>((acc, cur) => acc.concat(cur), []);
}

console.log("Ex10:", flatten([[1, 2], [3]]), flatten([["a"], ["b", "c"]]));
// Output: Ex10: [ 1, 2, 3 ] [ 'a', 'b', 'c' ]


// ----------------------------------------------------------------------------
// Exercise 11 — Solution
// ----------------------------------------------------------------------------
// Generic class with overloaded get method.

class Container<T> {
  private items: T[];

  constructor(items: T[]) {
    this.items = [...items];
  }

  get(index: number): T;
  get(): T[];
  get(index?: number): T | T[] {
    if (index !== undefined) return this.items[index];
    return [...this.items];
  }
}

const c = new Container([10, 20, 30]);
console.log("Ex11:", c.get(1), c.get());
// Output: Ex11: 20 [ 10, 20, 30 ]


// ----------------------------------------------------------------------------
// Exercise 12 — Solution
// ----------------------------------------------------------------------------
// Overloads based on a literal string argument that determines the rest of
// the parameter list and return type.

interface ClickEvent {
  type: "click";
  x: number;
  y: number;
}

interface KeypressEvent {
  type: "keypress";
  key: string;
}

function createEvent(type: "click", x: number, y: number): ClickEvent;
function createEvent(type: "keypress", key: string): KeypressEvent;
function createEvent(
  type: "click" | "keypress",
  xOrKey: number | string,
  y?: number
): ClickEvent | KeypressEvent {
  if (type === "click") {
    return { type: "click", x: xOrKey as number, y: y! };
  }
  return { type: "keypress", key: xOrKey as string };
}

console.log("Ex12:", createEvent("click", 10, 20), createEvent("keypress", "Enter"));
// Output: Ex12: { type: 'click', x: 10, y: 20 } { type: 'keypress', key: 'Enter' }


// ----------------------------------------------------------------------------
// Exercise 13 — Solution
// ----------------------------------------------------------------------------
// Constructor overloads on a generic class.

class Pair<T, U> {
  first: T;
  second: U;

  constructor(first: T, second: U);
  constructor(tuple: [T, U]);
  constructor(firstOrTuple: T | [T, U], second?: U) {
    if (Array.isArray(firstOrTuple)) {
      this.first = firstOrTuple[0];
      this.second = firstOrTuple[1];
    } else {
      this.first = firstOrTuple;
      this.second = second!;
    }
  }
}

const p1 = new Pair("hello", 42);
const p2 = new Pair<string, number>(["world", 99]);
console.log("Ex13:", p1.first, p1.second, p2.first, p2.second);
// Output: Ex13: hello 42 world 99


// ----------------------------------------------------------------------------
// Exercise 14 — Solution
// ----------------------------------------------------------------------------
// Generic overloads with keyof constraints. Single key returns the value,
// array of keys returns a sub-object.

function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K
): T[K];
function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K>;
function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keyOrKeys: K | K[]
): T[K] | Pick<T, K> {
  if (Array.isArray(keyOrKeys)) {
    const result = {} as Pick<T, K>;
    for (const k of keyOrKeys) {
      result[k] = obj[k];
    }
    return result;
  }
  return obj[keyOrKeys];
}

const user = { name: "Alice", age: 30, email: "a@b.c" };
console.log("Ex14:", pick(user, "name"), pick(user, ["name", "age"]));
// Output: Ex14: Alice { name: 'Alice', age: 30 }


// ----------------------------------------------------------------------------
// Exercise 15 — Solution
// ----------------------------------------------------------------------------
// Three overloads: string, number, and string[]. Each applies the callback
// to the value (mapping over elements for the array variant).

function transform(value: string, fn: (s: string) => string): string;
function transform(value: number, fn: (n: number) => number): number;
function transform(value: string[], fn: (s: string) => string): string[];
function transform(
  value: string | number | string[],
  fn: ((s: string) => string) | ((n: number) => number)
): string | number | string[] {
  if (Array.isArray(value)) {
    return value.map(fn as (s: string) => string);
  }
  if (typeof value === "string") {
    return (fn as (s: string) => string)(value);
  }
  return (fn as (n: number) => number)(value);
}

console.log(
  "Ex15:",
  transform("hello", (s) => s.toUpperCase()),
  transform(5, (n) => n * 3),
  transform(["a", "b"], (s) => s + "!")
);
// Output: Ex15: HELLO 15 [ 'a!', 'b!' ]


// ============================================================================
// Runner
// ============================================================================
console.log("\n✓ All solutions executed successfully.");
