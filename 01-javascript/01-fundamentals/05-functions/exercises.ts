// ============================================================================
// 05-functions: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/01-fundamentals/05-functions/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Hoisting — declaration vs expression
//
// What happens when each function is called? Does it work or error?

function exercise1() {
  // Call A: calling a function declaration before its definition
  console.log(add(2, 3));

  function add(a: number, b: number): number {
    return a + b;
  }

  // Call B: calling a function expression before its definition
  try {
    console.log(sub(5, 2));
  } catch (e) {
    console.log((e as Error).constructor.name);
  }

  const sub = function (a: number, b: number): number {
    return a - b;
  };
}

// YOUR ANSWER:
// Call A: ???
// Call B: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: Arrow function implicit return vs block body
//
// What does each function return?

function exercise2() {
  const a = (x: number) => x * 2;
  const b = (x: number) => {
    x * 2;
  };
  const c = (x: number) => {
    return x * 2;
  };

  console.log(a(5));
  console.log(b(5));
  console.log(c(5));
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Default parameters — undefined vs null vs falsy
//
// What does each call log?

function exercise3() {
  function format(value: unknown, label = "default") {
    console.log(`${label}: ${value}`);
  }

  format(42);
  format(42, undefined);
  format(42, null as unknown as string);
  format(42, "");
  format(42, "custom");
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Arrow function and `this`
//
// What does each greet() call return?

function exercise4() {
  const obj = {
    name: "Alice",
    greetArrow: () => {
      return `Hello, ${(globalThis as Record<string, unknown>).name ?? "undefined"}`;
    },
    greetRegular() {
      return `Hello, ${this.name}`;
    },
  };

  console.log(obj.greetArrow());
  console.log(obj.greetRegular());
}

// YOUR ANSWER:
// 1: ???
// 2: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Rest parameters and arguments object
//
// What does each log?

function exercise5() {
  function regular(a: unknown, b: unknown) {
    console.log(arguments.length);
  }

  const arrow = (a: unknown, b: unknown) => {
    // arguments is not defined in arrow functions at top level
    // This would cause a ReferenceError in a module/top-level context
    console.log("arrow has no own arguments");
  };

  function withRest(...args: unknown[]) {
    console.log(args.length);
    console.log(Array.isArray(args));
  }

  regular(1, 2, 3);
  arrow(1, 2, 3);
  withRest(1, 2, 3);
}

// YOUR ANSWER:
// regular: ???
// arrow: ???
// withRest length: ???
// withRest isArray: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Default parameter evaluation timing
//
// Default expressions are evaluated at call time, not definition time.

function exercise6() {
  let counter = 0;

  function getId(prefix = "id", num = ++counter) {
    return `${prefix}_${num}`;
  }

  console.log(getId());
  console.log(getId());
  console.log(getId("usr"));
  console.log(getId("usr", 100));
  console.log(counter);
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???
// 4: ???
// 5 (counter): ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Arrow function returning object literal
//
// What does each function return?

function exercise7() {
  const a = () => ({ name: "Alice" });
  const b = () => {
    name: "Bob";
  };

  console.log(a());
  console.log(b());
}

// YOUR ANSWER:
// 1: ???
// 2: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: Arrow function returning object literal
//
// This function should return an object { x, y } but returns undefined.
// Fix it WITHOUT converting to a regular function.

// BUG: Intended to return { x, y } but returns undefined.
// Fix it WITHOUT converting to a regular function.

const createPoint = (x: number, y: number): Record<string, number> | void => {
  x, y;
};

// Uncomment to test:
// console.log(createPoint(1, 2)); // Expected: { x: 1, y: 2 }
// console.log(createPoint(0, 0)); // Expected: { x: 0, y: 0 }

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: Missing return in block-body arrow
//
// This mapping should double every number, but returns [undefined, undefined, ...]
// Fix it.

function exercise9(nums: number[]): number[] {
  return nums.map((n) => {
    n * 2;
  });
}

// Uncomment to test:
// console.log(exercise9([1, 2, 3]));   // Expected: [2, 4, 6]
// console.log(exercise9([10, 20]));    // Expected: [20, 40]

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: arguments in arrow function
//
// This function is supposed to sum all its arguments, but it uses an arrow
// function which doesn't have `arguments`. Fix it using rest parameters.

const sumAll = (..._args: number[]) => {
  // BUG: arrow functions don't have `arguments`
  let total = 0;
  // Original buggy code tried: for (let i = 0; i < arguments.length; i++)
  // Fix it to properly sum all passed numbers
  return total;
};

// Uncomment to test:
// console.log(sumAll(1, 2, 3));       // Expected: 6
// console.log(sumAll(10, 20, 30, 40));// Expected: 100
// console.log(sumAll());              // Expected: 0

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: compose — right-to-left function composition
//
// compose(f, g, h)(x) should equal f(g(h(x)))
// If no functions are passed, return identity (x => x).

type UnaryFn = (arg: unknown) => unknown;

function compose(...fns: UnaryFn[]): UnaryFn {
  // YOUR CODE HERE

  return (x: unknown) => x;
}

// Uncomment to test:
// const add1 = (x: number) => x + 1;
// const double = (x: number) => x * 2;
// const square = (x: number) => x * x;
// const composed = compose(square as UnaryFn, double as UnaryFn, add1 as UnaryFn);
// console.log(composed(3));  // Expected: 64  → add1(3)=4, double(4)=8, square(8)=64
// console.log(compose()(5)); // Expected: 5   → identity

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: pipe — left-to-right function composition
//
// pipe(f, g, h)(x) should equal h(g(f(x)))
// If no functions are passed, return identity (x => x).

function pipe(...fns: UnaryFn[]): UnaryFn {
  // YOUR CODE HERE

  return (x: unknown) => x;
}

// Uncomment to test:
// const piped = pipe(
//   ((x: number) => x + 1) as UnaryFn,
//   ((x: number) => x * 2) as UnaryFn,
//   ((x: number) => x * x) as UnaryFn
// );
// console.log(piped(3));  // Expected: 64  → (3+1)=4, (4*2)=8, (8*8)=64
// console.log(pipe()(5)); // Expected: 5   → identity

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: once — function that can only be called once
//
// Subsequent calls should return the result of the first call.

function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  // YOUR CODE HERE

  return fn;
}

// Uncomment to test:
// let callCount = 0;
// const initialize = once(() => {
//   callCount++;
//   return "initialized";
// });
// console.log(initialize()); // Expected: "initialized"
// console.log(initialize()); // Expected: "initialized" (cached, fn not called again)
// console.log(initialize()); // Expected: "initialized"
// console.log(callCount);    // Expected: 1

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: memoize — cache results based on first argument
//
// Returns a new function that caches results. Uses the first argument as the
// cache key (converted to string). Only needs to handle single-argument functions.

function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  // YOUR CODE HERE

  return fn;
}

// Uncomment to test:
// let computeCount = 0;
// const expensiveSquare = memoize((n: number) => {
//   computeCount++;
//   return n * n;
// });
// console.log(expensiveSquare(4)); // Expected: 16
// console.log(expensiveSquare(4)); // Expected: 16 (cached)
// console.log(expensiveSquare(5)); // Expected: 25
// console.log(computeCount);       // Expected: 2 (4 and 5 computed, second 4 was cached)

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: curry2 — curry a function that takes exactly 2 arguments
//
// curry2(fn)(a)(b) should equal fn(a, b)
// It should also work when both args are provided: curry2(fn)(a, b)

function curry2<A, B, R>(fn: (a: A, b: B) => R): {
  (a: A, b: B): R;
  (a: A): (b: B) => R;
} {
  // YOUR CODE HERE

  return function (a: A, b?: B) {
    if (b !== undefined) return fn(a, b as B);
    return (b2: B) => fn(a, b2);
  } as { (a: A, b: B): R; (a: A): (b: B) => R };
}

// Uncomment to test:
// const curriedAdd = curry2((a: number, b: number) => a + b);
// console.log(curriedAdd(1, 2));    // Expected: 3
// console.log(curriedAdd(1)(2));    // Expected: 3
// const add10 = curriedAdd(10);
// console.log(add10(5));            // Expected: 15

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: partial — partial application
//
// partial(fn, ...presetArgs) returns a new function that prepends presetArgs
// to whatever arguments are passed later.

function partial<R>(
  fn: (...args: unknown[]) => R,
  ...presetArgs: unknown[]
): (...laterArgs: unknown[]) => R {
  // YOUR CODE HERE

  return (...laterArgs: unknown[]) => fn(...laterArgs);
}

// Uncomment to test:
// const multiply = (a: number, b: number, c: number) => a * b * c;
// const double = partial(multiply as (...args: unknown[]) => number, 2);
// console.log(double(3, 4));  // Expected: 24  → multiply(2, 3, 4)
// const triple6 = partial(multiply as (...args: unknown[]) => number, 3, 6);
// console.log(triple6(2));    // Expected: 36  → multiply(3, 6, 2)

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: debounce-like (simplified) — trailing call only
//
// Returns a function that delays invoking `fn` until `ms` milliseconds have
// passed since the last call. If called again within the window, the timer resets.
// Uses setTimeout/clearTimeout.

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  // YOUR CODE HERE

  return (..._args: Parameters<T>) => {};
}

// Uncomment to test:
// const log = debounce((msg: string) => console.log(msg), 100);
// log("a");
// log("b");
// log("c"); // Only "c" should be logged after 100ms
// setTimeout(() => console.log("--- 200ms passed ---"), 200);

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: createCounter — closure with function properties
//
// Create a function that returns a counter function. Each call to the counter
// increments and returns the count. The counter should also have:
//   - counter.reset() — resets count to 0
//   - counter.getCount() — returns current count without incrementing

interface Counter {
  (): number;
  reset: () => void;
  getCount: () => number;
}

function createCounter(start = 0): Counter {
  // YOUR CODE HERE

  const counter = () => start;
  counter.reset = () => {};
  counter.getCount = () => start;
  return counter as Counter;
}

// Uncomment to test:
// const counter = createCounter();
// console.log(counter());          // Expected: 1
// console.log(counter());          // Expected: 2
// console.log(counter());          // Expected: 3
// console.log(counter.getCount()); // Expected: 3 (no increment)
// counter.reset();
// console.log(counter());          // Expected: 1
// console.log(counter.getCount()); // Expected: 1
