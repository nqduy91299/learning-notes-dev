// ============================================================================
// 05-functions: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Hoisting — declaration vs expression

function solution1() {
  // Call A: function declaration — hoisted, works before definition
  console.log(add(2, 3)); // 5

  function add(a: number, b: number): number {
    return a + b;
  }

  // Call B: function expression — NOT hoisted, causes ReferenceError
  try {
    console.log(sub(5, 2));
  } catch (e) {
    console.log((e as Error).constructor.name); // "ReferenceError"
  }

  const sub = function (a: number, b: number): number {
    return a - b;
  };
}

// ANSWER:
// Call A: 5
// Call B: "ReferenceError"
//
// Explanation:
// Function declarations are hoisted — the engine processes them before code runs,
// so add() is available even above its definition.
// Function expressions (assigned to const/let/var) are NOT hoisted. Calling sub()
// before the assignment hits a ReferenceError (with const/let) or TypeError (with var).
// See README → Section 1 (Function Declarations → Hoisting) & Section 2 (NOT hoisted)

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Arrow function implicit return vs block body

function solution2() {
  const a = (x: number) => x * 2;
  const b = (x: number) => {
    x * 2;
  };
  const c = (x: number) => {
    return x * 2;
  };

  console.log(a(5)); // 10
  console.log(b(5)); // undefined
  console.log(c(5)); // 10
}

// ANSWER:
// 1: 10
// 2: undefined
// 3: 10
//
// Explanation:
// - `a` uses concise body (no {}) — the expression `x * 2` is implicitly returned.
// - `b` uses block body ({}) — `x * 2` is an expression statement, NOT returned.
//   Without an explicit `return`, the function returns undefined.
// - `c` uses block body with explicit `return` — works correctly.
// See README → Section 3 (Concise vs block body) & Section 8 (Return Values)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Default parameters — undefined vs null vs falsy

function solution3() {
  function format(value: unknown, label = "default") {
    console.log(`${label}: ${value}`);
  }

  format(42);                              // "default: 42"
  format(42, undefined);                   // "default: 42"
  format(42, null as unknown as string);   // "null: 42"
  format(42, "");                          // ": 42"
  format(42, "custom");                    // "custom: 42"
}

// ANSWER:
// 1: "default: 42"   — omitted → undefined → triggers default
// 2: "default: 42"   — explicit undefined → triggers default
// 3: "null: 42"      — null does NOT trigger default
// 4: ": 42"          — empty string does NOT trigger default
// 5: "custom: 42"    — normal argument
//
// Explanation:
// Default parameters only activate when the argument is undefined (or omitted).
// null, "", 0, false — none of these trigger the default value.
// See README → Section 5 (Default Parameters)

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Arrow function and `this`

function solution4() {
  const obj = {
    name: "Alice",
    greetArrow: () => {
      return `Hello, ${(globalThis as Record<string, unknown>).name ?? "undefined"}`;
    },
    greetRegular() {
      return `Hello, ${this.name}`;
    },
  };

  console.log(obj.greetArrow());   // "Hello, undefined"
  console.log(obj.greetRegular()); // "Hello, Alice"
}

// ANSWER:
// 1: "Hello, undefined"
// 2: "Hello, Alice"
//
// Explanation:
// - greetArrow is an arrow function. It does NOT have its own `this` — it inherits
//   `this` from the enclosing lexical scope (the module/global scope), where
//   globalThis.name is undefined.
// - greetRegular is a regular method. When called as obj.greetRegular(), `this`
//   is set to `obj`, so this.name is "Alice".
// See README → Section 4 (Arrow Functions vs Regular → No own this)
//            → Section 12 (Gotcha 4: this in arrow function as method)

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Rest parameters and arguments object

function solution5() {
  function regular(a: unknown, b: unknown) {
    console.log(arguments.length); // 3
  }

  const arrow = (a: unknown, b: unknown) => {
    console.log("arrow has no own arguments");
  };

  function withRest(...args: unknown[]) {
    console.log(args.length);        // 3
    console.log(Array.isArray(args)); // true
  }

  regular(1, 2, 3);
  arrow(1, 2, 3);
  withRest(1, 2, 3);
}

// ANSWER:
// regular: 3          — arguments.length counts ALL passed args (not just declared params)
// arrow: "arrow has no own arguments"
// withRest length: 3
// withRest isArray: true
//
// Explanation:
// - `arguments` in regular functions counts all passed arguments regardless of
//   declared parameters. We passed 3 args, so length is 3.
// - Arrow functions don't have their own `arguments` object.
// - Rest parameters (...args) collect all arguments into a real Array.
// See README → Section 6 (Rest Parameters) & Section 7 (The arguments Object)

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Default parameter evaluation timing

function solution6() {
  let counter = 0;

  function getId(prefix = "id", num = ++counter) {
    return `${prefix}_${num}`;
  }

  console.log(getId());          // "id_1"   — counter becomes 1
  console.log(getId());          // "id_2"   — counter becomes 2
  console.log(getId("usr"));     // "usr_3"  — counter becomes 3
  console.log(getId("usr", 100));// "usr_100" — num is provided, ++counter NOT called
  console.log(counter);          // 3        — only incremented 3 times
}

// ANSWER:
// 1: "id_1"
// 2: "id_2"
// 3: "usr_3"
// 4: "usr_100"
// 5: 3
//
// Explanation:
// Default parameter expressions are evaluated at call time, only when the parameter
// is undefined (or omitted). Each call without `num` evaluates ++counter.
// When num=100 is explicitly provided, the default expression is NOT evaluated,
// so counter stays at 3.
// See README → Section 5 (Default Parameters → Expressions as defaults)

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Arrow function returning object literal

function solution7() {
  const a = () => ({ name: "Alice" });
  const b = () => {
    name: "Bob";
  };

  console.log(a()); // { name: "Alice" }
  console.log(b()); // undefined
}

// ANSWER:
// 1: { name: "Alice" }
// 2: undefined
//
// Explanation:
// - `a` wraps the object literal in parentheses: () => ({ ... }). The parens
//   tell JS this is an expression (object), not a block body. Implicitly returned.
// - `b` uses {} which JS interprets as a block body. `name: "Bob"` is parsed
//   as a label statement (label `name`, expression `"Bob"`). No return → undefined.
// See README → Section 12 (Gotcha 1: Arrow function returning object literal)

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: Arrow function returning object literal

const createPoint = (x: number, y: number) => ({ x, y });

// Explanation:
// The original code used {} which was interpreted as a block body, not an object.
// Wrapping in parentheses () => ({...}) tells JS this is an object expression.
// See README → Section 12 (Gotcha 1)

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Missing return in block-body arrow

function solution9(nums: number[]): number[] {
  return nums.map((n) => n * 2);
}

// Explanation:
// The original used a block body `{ n * 2; }` without `return`, so each map
// callback returned undefined. Fix: use concise body `n => n * 2` or add `return`.
// See README → Section 12 (Gotcha 5: Missing return in block-body arrow)

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: arguments in arrow function

const sumAll = (...args: number[]) => {
  let total = 0;
  for (let i = 0; i < args.length; i++) {
    total += args[i];
  }
  return total;
};

// Explanation:
// Arrow functions don't have their own `arguments` object. The fix uses rest
// parameters (...args) which collect all arguments into a real array.
// See README → Section 7 (Not available in arrow functions)
//            → Section 12 (Gotcha 2)
//            → Section 13 (Best Practice 2: Use rest parameters over arguments)

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: compose — right-to-left function composition

type UnaryFn = (arg: unknown) => unknown;

function compose(...fns: UnaryFn[]): UnaryFn {
  if (fns.length === 0) return (x: unknown) => x;
  return (x: unknown) => fns.reduceRight((acc, fn) => fn(acc), x);
}

// Explanation:
// compose(f, g, h)(x) = f(g(h(x))) — apply functions right-to-left.
// reduceRight starts from the last function and works backward, threading the
// accumulated value through each function.
// If no functions are passed, return the identity function.
// See README → Section 9 (Callback functions — passing functions as arguments)

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: pipe — left-to-right function composition

function pipe(...fns: UnaryFn[]): UnaryFn {
  if (fns.length === 0) return (x: unknown) => x;
  return (x: unknown) => fns.reduce((acc, fn) => fn(acc), x);
}

// Explanation:
// pipe(f, g, h)(x) = h(g(f(x))) — apply functions left-to-right.
// reduce starts from the first function and works forward.
// Same as compose but in the opposite direction.
// See README → Section 9 (Callback functions)

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: once — function that can only be called once

function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let called = false;
  let result: unknown;

  return function (this: unknown, ...args: unknown[]) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  } as T;
}

// Explanation:
// Uses a closure to track whether fn has been called. On first call, stores the
// result. On subsequent calls, returns the cached result without invoking fn.
// This demonstrates closures (enclosing `called` and `result`) and the concept
// of "one function, one action" — once() is a higher-order utility.
// See README → Section 11 (One function — one action)

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: memoize — cache results based on first argument

function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<string, R>();

  return (arg: T) => {
    const key = String(arg);
    if (cache.has(key)) return cache.get(key) as R;
    const result = fn(arg);
    cache.set(key, result);
    return result;
  };
}

// Explanation:
// Uses a Map as a cache. The argument is converted to a string as the cache key.
// If the key exists, return the cached value. Otherwise, call fn, cache the result,
// and return it. This is a simplified memoize — production versions handle
// multiple arguments and use more sophisticated cache key strategies.
// Demonstrates closures (the cache persists across calls).

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: curry2 — curry a function that takes exactly 2 arguments

function curry2<A, B, R>(fn: (a: A, b: B) => R): {
  (a: A, b: B): R;
  (a: A): (b: B) => R;
} {
  return function (a: A, b?: B) {
    if (arguments.length >= 2) return fn(a, b as B);
    return (b2: B) => fn(a, b2);
  } as { (a: A, b: B): R; (a: A): (b: B) => R };
}

// Explanation:
// If both arguments are provided, call fn immediately.
// If only one argument is provided, return a new function that awaits the second.
// This is partial application via currying — a core functional programming concept.
// We check arguments.length instead of `b !== undefined` to support undefined as
// a valid second argument.
// See README → Section 9 (Callback functions)

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: partial — partial application

function partial<R>(
  fn: (...args: unknown[]) => R,
  ...presetArgs: unknown[]
): (...laterArgs: unknown[]) => R {
  return (...laterArgs: unknown[]) => fn(...presetArgs, ...laterArgs);
}

// Explanation:
// partial(fn, a, b) returns a new function that, when called with (c, d),
// invokes fn(a, b, c, d). presetArgs are captured in the closure and prepended
// to laterArgs using the spread operator.
// See README → Section 6 (Rest Parameters) — rest/spread are key here.

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: debounce-like (simplified) — trailing call only

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, ms);
  };
}

// Explanation:
// Each call clears the previous timer and sets a new one. Only after `ms`
// milliseconds of inactivity does fn actually get called. The closure captures
// timeoutId across calls. This is a common real-world use of closures and
// callbacks — often seen in search inputs, resize handlers, etc.
// See README → Section 9 (Callback functions)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: createCounter — closure with function properties

interface Counter {
  (): number;
  reset: () => void;
  getCount: () => number;
}

function createCounter(start = 0): Counter {
  let count = start;

  const counter = () => ++count;
  counter.reset = () => {
    count = start;
  };
  counter.getCount = () => count;

  return counter as Counter;
}

// Explanation:
// The closure captures `count` and `start`. Each call to counter() increments
// and returns count. reset() restores count to the original start value.
// getCount() reads without modifying. Functions in JS are objects, so we can
// attach properties (reset, getCount) directly to the function.
// Demonstrates: closures, default parameters (start = 0), and functions-as-objects.
// See README → Section 5 (Default Parameters) & Section 11 (One function — one action)

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1 ===");
solution1();

console.log("\n=== Exercise 2 ===");
solution2();

console.log("\n=== Exercise 3 ===");
solution3();

console.log("\n=== Exercise 4 ===");
solution4();

console.log("\n=== Exercise 5 ===");
solution5();

console.log("\n=== Exercise 6 ===");
solution6();

console.log("\n=== Exercise 7 ===");
solution7();

console.log("\n=== Exercise 8 ===");
console.log(createPoint(1, 2));
console.log(createPoint(0, 0));

console.log("\n=== Exercise 9 ===");
console.log(solution9([1, 2, 3]));
console.log(solution9([10, 20]));

console.log("\n=== Exercise 10 ===");
console.log(sumAll(1, 2, 3));
console.log(sumAll(10, 20, 30, 40));
console.log(sumAll());

console.log("\n=== Exercise 11 ===");
const add1 = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;
const composed = compose(square as UnaryFn, double as UnaryFn, add1 as UnaryFn);
console.log(composed(3));  // 64
console.log(compose()(5)); // 5

console.log("\n=== Exercise 12 ===");
const piped = pipe(
  add1 as UnaryFn,
  double as UnaryFn,
  square as UnaryFn
);
console.log(piped(3));  // 64
console.log(pipe()(5)); // 5

console.log("\n=== Exercise 13 ===");
let callCount = 0;
const initialize = once(() => {
  callCount++;
  return "initialized";
});
console.log(initialize());  // "initialized"
console.log(initialize());  // "initialized"
console.log(initialize());  // "initialized"
console.log(callCount);     // 1

console.log("\n=== Exercise 14 ===");
let computeCount = 0;
const expensiveSquare = memoize((n: number) => {
  computeCount++;
  return n * n;
});
console.log(expensiveSquare(4)); // 16
console.log(expensiveSquare(4)); // 16
console.log(expensiveSquare(5)); // 25
console.log(computeCount);      // 2

console.log("\n=== Exercise 15 ===");
const curriedAdd = curry2((a: number, b: number) => a + b);
console.log(curriedAdd(1, 2));   // 3
console.log(curriedAdd(1)(2));   // 3
const add10 = curriedAdd(10);
console.log(add10(5));           // 15

console.log("\n=== Exercise 16 ===");
const multiply = (a: number, b: number, c: number) => a * b * c;
const doubleM = partial(multiply as (...args: unknown[]) => number, 2);
console.log(doubleM(3, 4));     // 24
const triple6 = partial(multiply as (...args: unknown[]) => number, 3, 6);
console.log(triple6(2));        // 36

console.log("\n=== Exercise 17 ===");
const log = debounce((msg: unknown) => console.log(`debounced: ${msg}`), 100);
log("a");
log("b");
log("c"); // Only "c" should be logged after 100ms
setTimeout(() => console.log("--- 200ms passed (only 'c' should have printed) ---"), 200);

console.log("\n=== Exercise 18 ===");
const counter = createCounter();
console.log(counter());          // 1
console.log(counter());          // 2
console.log(counter());          // 3
console.log(counter.getCount()); // 3
counter.reset();
console.log(counter());          // 1
console.log(counter.getCount()); // 1
