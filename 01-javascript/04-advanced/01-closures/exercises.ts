// ============================================================================
// Closures — Exercises (18 total)
// ============================================================================
// Categories:
//   A. Predict the output (1-6)
//   B. Fix the bug (7-9)
//   C. Implement (10-18)
//
// Rules:
//   - No `any` casts.
//   - Implementation exercises have placeholder return values — fill them in.
//   - Run with: npx tsx exercises.ts
// ============================================================================

// ---------------------------------------------------------------------------
// A. PREDICT THE OUTPUT
// ---------------------------------------------------------------------------

// Exercise 1: Closure variable capture
// What does this print?
function exercise1(): void {
  let x = 10;
  const getX = (): number => x;
  x = 20;
  console.log("Exercise 1:", getX());
}

// Exercise 2: Shared closure
// What does this print?
function exercise2(): void {
  function makeOps(): { inc: () => number; get: () => number } {
    let count = 0;
    return {
      inc: () => ++count,
      get: () => count,
    };
  }
  const ops = makeOps();
  ops.inc();
  ops.inc();
  ops.inc();
  console.log("Exercise 2:", ops.get());
}

// Exercise 3: Separate closures
// What does this print?
function exercise3(): void {
  function makeCounter(): () => number {
    let count = 0;
    return () => count++;
  }
  const a = makeCounter();
  const b = makeCounter();
  a();
  a();
  a();
  b();
  console.log("Exercise 3: a =", a(), "b =", b());
}

// Exercise 4: Closure over function parameter
// What does this print?
function exercise4(): void {
  function greet(greeting: string): (name: string) => string {
    return (name) => `${greeting}, ${name}!`;
  }
  const hello = greet("Hello");
  const hi = greet("Hi");
  console.log("Exercise 4:", hello("Alice"), "|", hi("Bob"));
}

// Exercise 5: Closure and setTimeout (let)
// What does this print after 50ms?
function exercise5(): void {
  const results: number[] = [];
  for (let i = 0; i < 4; i++) {
    setTimeout(() => results.push(i), 10);
  }
  setTimeout(() => console.log("Exercise 5:", results.join(", ")), 50);
}

// Exercise 6: Nested closures — scope chain
// What does this print?
function exercise6(): void {
  const a = 1;
  function outer(): () => () => number {
    const b = 2;
    return function middle(): () => number {
      const c = 3;
      return function inner(): number {
        return a + b + c;
      };
    };
  }
  console.log("Exercise 6:", outer()()());
}

// ---------------------------------------------------------------------------
// B. FIX THE BUG
// ---------------------------------------------------------------------------

// Exercise 7: var in a loop — classic stale closure
// Expected: prints "0, 1, 2, 3, 4" but currently prints "5, 5, 5, 5, 5"
// Fix it WITHOUT changing `var` to `let`.
function exercise7(): void {
  const fns: (() => number)[] = [];
  for (var i = 0; i < 5; i++) {
    // BUG: all closures share the same `i`
    fns.push(function () {
      return i;
    });
  }
  console.log("Exercise 7:", fns.map((f) => f()).join(", "));
}

// Exercise 8: Stale closure in accumulator
// Expected: each call to `add` should accumulate, but `getTotal` is stale.
// Fix the bug.
function exercise8(): void {
  function createAccumulator(): {
    add: (n: number) => void;
    getTotal: () => number;
  } {
    let total = 0;
    // BUG: getTotal captures initial value instead of live binding
    const snapshot = total;
    return {
      add: (n: number) => {
        total += n;
      },
      getTotal: () => snapshot, // <-- stale!
    };
  }
  const acc = createAccumulator();
  acc.add(5);
  acc.add(10);
  acc.add(3);
  console.log("Exercise 8:", acc.getTotal(), "(expected 18)");
}

// Exercise 9: Loop index for async callbacks
// Expected output: "item-0 item-1 item-2"
// Currently outputs: "item-3 item-3 item-3"
// Fix it.
function exercise9(): Promise<void> {
  return new Promise((resolve) => {
    const items = ["a", "b", "c"];
    const results: string[] = [];
    for (var idx = 0; idx < items.length; idx++) {
      // BUG: closure captures shared `idx`
      setTimeout(() => {
        results.push(`item-${idx}`);
        if (results.length === items.length) {
          console.log("Exercise 9:", results.join(" "));
          resolve();
        }
      }, 10);
    }
  });
}

// ---------------------------------------------------------------------------
// C. IMPLEMENT
// ---------------------------------------------------------------------------

// Exercise 10: createCounter
// Returns an object with `increment`, `decrement`, and `getCount` methods.
// Starts at `initial` (default 0).
function createCounter(
  initial: number = 0
): {
  increment: () => number;
  decrement: () => number;
  getCount: () => number;
} {
  // TODO: implement
  void initial;
  return {
    increment: () => 0,
    decrement: () => 0,
    getCount: () => 0,
  };
}

// Exercise 11: makeAdder
// Returns a function that adds `x` to its argument.
function makeAdder(x: number): (y: number) => number {
  // TODO: implement
  void x;
  return (_y) => 0;
}

// Exercise 12: once
// Returns a wrapper that calls `fn` at most once. Subsequent calls return the
// first result.
function once<T extends (...args: never[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  // TODO: implement
  void fn;
  return ((..._args: Parameters<T>): ReturnType<T> => {
    return undefined as ReturnType<T>;
  }) as (...args: Parameters<T>) => ReturnType<T>;
}

// Exercise 13: memoize (single-arg, primitive keys)
// Caches results keyed by the stringified argument.
function memoize<A, R>(fn: (arg: A) => R): (arg: A) => R {
  // TODO: implement
  void fn;
  return (_arg: A): R => {
    return undefined as unknown as R;
  };
}

// Exercise 14: createPrivateStore
// Returns `get(key)` and `set(key, value)` with no direct access to storage.
function createPrivateStore(): {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
} {
  // TODO: implement
  return {
    get: (_key) => undefined,
    set: (_key, _value) => {},
  };
}

// Exercise 15: bankAccount
// `deposit(n)`, `withdraw(n)` (throws if insufficient), `getBalance()`.
function bankAccount(
  initial: number = 0
): {
  deposit: (amount: number) => number;
  withdraw: (amount: number) => number;
  getBalance: () => number;
} {
  // TODO: implement
  void initial;
  return {
    deposit: (_amount) => 0,
    withdraw: (_amount) => 0,
    getBalance: () => 0,
  };
}

// Exercise 16: createMultiplier
// Factory that returns a multiplier function.
function createMultiplier(factor: number): (n: number) => number {
  // TODO: implement
  void factor;
  return (_n) => 0;
}

// Exercise 17: createLogger
// Logs messages and keeps a history. Returns `log(msg)` and `getHistory()`.
function createLogger(prefix: string): {
  log: (msg: string) => void;
  getHistory: () => string[];
} {
  // TODO: implement
  void prefix;
  return {
    log: (_msg) => {},
    getHistory: () => [],
  };
}

// Exercise 18: createRangeIterator
// Returns an iterator-protocol object over [start, end] (inclusive).
function createRangeIterator(
  start: number,
  end: number
): { next: () => { value: number | undefined; done: boolean } } {
  // TODO: implement
  void start;
  void end;
  return {
    next: () => ({ value: undefined, done: true }),
  };
}

// ============================================================================
// Runner
// ============================================================================
async function main(): Promise<void> {
  console.log("=== A. Predict the Output ===\n");
  exercise1();
  exercise2();
  exercise3();
  exercise4();
  exercise5();
  exercise6();

  console.log("\n=== B. Fix the Bug ===\n");
  exercise7();
  exercise8();
  await exercise9();

  console.log("\n=== C. Implement (placeholder returns — fill them in!) ===\n");

  // 10: createCounter
  const ctr = createCounter(5);
  console.log(
    "Exercise 10: inc =",
    ctr.increment(),
    "inc =",
    ctr.increment(),
    "dec =",
    ctr.decrement(),
    "get =",
    ctr.getCount()
  );

  // 11: makeAdder
  const add5 = makeAdder(5);
  console.log("Exercise 11:", add5(3), add5(-1));

  // 12: once
  let callCount = 0;
  const onceFn = once((x: number) => {
    callCount++;
    return x * 2;
  });
  console.log("Exercise 12:", onceFn(5), onceFn(99), "calls:", callCount);

  // 13: memoize
  let computeCount = 0;
  const slowSquare = memoize((n: number) => {
    computeCount++;
    return n * n;
  });
  slowSquare(4);
  slowSquare(4);
  slowSquare(5);
  console.log(
    "Exercise 13: 4^2 =",
    slowSquare(4),
    "5^2 =",
    slowSquare(5),
    "computations:",
    computeCount
  );

  // 14: createPrivateStore
  const store = createPrivateStore();
  store.set("secret", 42);
  store.set("name", "Alice");
  console.log(
    "Exercise 14:",
    store.get("secret"),
    store.get("name"),
    store.get("missing")
  );

  // 15: bankAccount
  const acct = bankAccount(100);
  acct.deposit(50);
  acct.withdraw(30);
  console.log("Exercise 15: balance =", acct.getBalance());
  try {
    acct.withdraw(200);
  } catch (e) {
    console.log("Exercise 15: withdraw error caught:", (e as Error).message);
  }

  // 16: createMultiplier
  const double = createMultiplier(2);
  const triple = createMultiplier(3);
  console.log("Exercise 16:", double(7), triple(7));

  // 17: createLogger
  const logger = createLogger("[APP]");
  logger.log("started");
  logger.log("loaded");
  console.log("Exercise 17:", logger.getHistory());

  // 18: createRangeIterator
  const iter = createRangeIterator(1, 4);
  const rangeResults: number[] = [];
  let step = iter.next();
  while (!step.done) {
    rangeResults.push(step.value as number);
    step = iter.next();
  }
  console.log("Exercise 18:", rangeResults.join(", "));
}

main();
