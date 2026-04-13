// ============================================================================
// Closures — Solutions (18 exercises)
// ============================================================================
// Run with: npx tsx solutions.ts
// ============================================================================

// ---------------------------------------------------------------------------
// A. PREDICT THE OUTPUT — Answers
// ---------------------------------------------------------------------------

// Exercise 1: Closure variable capture
// Answer: 20 — closures read the *live* binding, not a snapshot.
function exercise1(): void {
  let x = 10;
  const getX = (): number => x;
  x = 20;
  console.log("Exercise 1:", getX()); // 20
}

// Exercise 2: Shared closure
// Answer: 3 — inc and get share the same Lexical Environment.
function exercise2(): void {
  function makeOps(): { inc: () => number; get: () => number } {
    let count = 0;
    return {
      inc: () => ++count,
      get: () => count,
    };
  }
  const ops = makeOps();
  ops.inc(); // 1
  ops.inc(); // 2
  ops.inc(); // 3
  console.log("Exercise 2:", ops.get()); // 3
}

// Exercise 3: Separate closures
// Answer: a = 3, b = 1 — each makeCounter() call creates its own environment.
//   a() called 3 times → count was 0,1,2 (returned 0,1,2), now count=3
//   b() called 1 time  → count was 0 (returned 0), now count=1
//   a() returns 3 (current count, then increments to 4)
//   b() returns 1 (current count, then increments to 2)
function exercise3(): void {
  function makeCounter(): () => number {
    let count = 0;
    return () => count++;
  }
  const a = makeCounter();
  const b = makeCounter();
  a(); // 0
  a(); // 1
  a(); // 2
  b(); // 0
  console.log("Exercise 3: a =", a(), "b =", b()); // a = 3, b = 1
}

// Exercise 4: Closure over function parameter
// Answer: "Hello, Alice! | Hi, Bob!"
// Each call to greet() creates a separate closure with its own `greeting`.
function exercise4(): void {
  function greet(greeting: string): (name: string) => string {
    return (name) => `${greeting}, ${name}!`;
  }
  const hello = greet("Hello");
  const hi = greet("Hi");
  console.log("Exercise 4:", hello("Alice"), "|", hi("Bob"));
}

// Exercise 5: Closure and setTimeout (let)
// Answer: "0, 1, 2, 3"
// `let` in a for-loop creates a new binding per iteration.
function exercise5(): void {
  const results: number[] = [];
  for (let i = 0; i < 4; i++) {
    setTimeout(() => results.push(i), 10);
  }
  setTimeout(() => console.log("Exercise 5:", results.join(", ")), 50);
}

// Exercise 6: Nested closures — scope chain
// Answer: 6 — inner() traverses the scope chain: c=3 (middle), b=2 (outer), a=1 (module).
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
  console.log("Exercise 6:", outer()()()); // 6
}

// ---------------------------------------------------------------------------
// B. FIX THE BUG — Solutions
// ---------------------------------------------------------------------------

// Exercise 7: var in a loop — fix with IIFE
// Wrap in an IIFE to capture the current value of `i`.
function exercise7(): void {
  const fns: (() => number)[] = [];
  for (var i = 0; i < 5; i++) {
    fns.push(
      (function (captured: number) {
        return function () {
          return captured;
        };
      })(i)
    );
  }
  console.log("Exercise 7:", fns.map((f) => f()).join(", ")); // 0, 1, 2, 3, 4
}

// Exercise 8: Stale closure in accumulator — fix by reading `total` directly
function exercise8(): void {
  function createAccumulator(): {
    add: (n: number) => void;
    getTotal: () => number;
  } {
    let total = 0;
    return {
      add: (n: number) => {
        total += n;
      },
      getTotal: () => total, // FIX: reference the live binding, not a snapshot
    };
  }
  const acc = createAccumulator();
  acc.add(5);
  acc.add(10);
  acc.add(3);
  console.log("Exercise 8:", acc.getTotal(), "(expected 18)"); // 18
}

// Exercise 9: Loop index for async callbacks — fix with IIFE
function exercise9(): Promise<void> {
  return new Promise((resolve) => {
    const items = ["a", "b", "c"];
    const results: string[] = [];
    for (var idx = 0; idx < items.length; idx++) {
      (function (capturedIdx: number) {
        setTimeout(() => {
          results.push(`item-${capturedIdx}`);
          if (results.length === items.length) {
            console.log("Exercise 9:", results.join(" ")); // item-0 item-1 item-2
            resolve();
          }
        }, 10);
      })(idx);
    }
  });
}

// ---------------------------------------------------------------------------
// C. IMPLEMENT — Solutions
// ---------------------------------------------------------------------------

// Exercise 10: createCounter
function createCounter(
  initial: number = 0
): {
  increment: () => number;
  decrement: () => number;
  getCount: () => number;
} {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

// Exercise 11: makeAdder
function makeAdder(x: number): (y: number) => number {
  return (y) => x + y;
}

// Exercise 12: once
function once<T extends (...args: never[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  let called = false;
  let result: ReturnType<T>;
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      called = true;
      result = fn(...args) as ReturnType<T>;
    }
    return result;
  }) as (...args: Parameters<T>) => ReturnType<T>;
}

// Exercise 13: memoize (single-arg, primitive keys)
function memoize<A, R>(fn: (arg: A) => R): (arg: A) => R {
  const cache = new Map<string, R>();
  return (arg: A): R => {
    const key = String(arg);
    if (cache.has(key)) {
      return cache.get(key) as R;
    }
    const result = fn(arg);
    cache.set(key, result);
    return result;
  };
}

// Exercise 14: createPrivateStore
function createPrivateStore(): {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
} {
  const storage = new Map<string, unknown>();
  return {
    get: (key) => storage.get(key),
    set: (key, value) => {
      storage.set(key, value);
    },
  };
}

// Exercise 15: bankAccount
function bankAccount(
  initial: number = 0
): {
  deposit: (amount: number) => number;
  withdraw: (amount: number) => number;
  getBalance: () => number;
} {
  let balance = initial;
  return {
    deposit: (amount) => {
      if (amount <= 0) throw new Error("Amount must be positive");
      balance += amount;
      return balance;
    },
    withdraw: (amount) => {
      if (amount <= 0) throw new Error("Amount must be positive");
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance: () => balance,
  };
}

// Exercise 16: createMultiplier
function createMultiplier(factor: number): (n: number) => number {
  return (n) => n * factor;
}

// Exercise 17: createLogger
function createLogger(prefix: string): {
  log: (msg: string) => void;
  getHistory: () => string[];
} {
  const history: string[] = [];
  return {
    log: (msg) => {
      const entry = `${prefix} ${msg}`;
      console.log(entry);
      history.push(entry);
    },
    getHistory: () => [...history],
  };
}

// Exercise 18: createRangeIterator
function createRangeIterator(
  start: number,
  end: number
): { next: () => { value: number | undefined; done: boolean } } {
  let current = start;
  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

// ============================================================================
// Runner — validates all solutions
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.log(`  FAIL: ${label}`);
  }
}

async function main(): Promise<void> {
  console.log("=== A. Predict the Output ===\n");
  exercise1(); // 20
  exercise2(); // 3
  exercise3(); // a = 3, b = 1
  exercise4(); // Hello, Alice! | Hi, Bob!
  exercise5(); // 0, 1, 2, 3 (async)
  exercise6(); // 6

  console.log("\n=== B. Fix the Bug ===\n");
  exercise7(); // 0, 1, 2, 3, 4
  exercise8(); // 18
  await exercise9(); // item-0 item-1 item-2

  console.log("\n=== C. Implement — Validating Solutions ===\n");

  // Exercise 10: createCounter
  {
    const ctr = createCounter(5);
    assert(ctr.increment() === 6, "10: increment from 5 → 6");
    assert(ctr.increment() === 7, "10: increment → 7");
    assert(ctr.decrement() === 6, "10: decrement → 6");
    assert(ctr.getCount() === 6, "10: getCount → 6");

    const ctr2 = createCounter();
    assert(ctr2.getCount() === 0, "10: default initial → 0");
    assert(ctr2.increment() === 1, "10: default inc → 1");
  }

  // Exercise 11: makeAdder
  {
    const add5 = makeAdder(5);
    const add10 = makeAdder(10);
    assert(add5(3) === 8, "11: add5(3) → 8");
    assert(add5(-1) === 4, "11: add5(-1) → 4");
    assert(add10(2) === 12, "11: add10(2) → 12");
    // Independence
    assert(add5(0) === 5, "11: add5(0) → 5 (independent)");
  }

  // Exercise 12: once
  {
    let callCount = 0;
    const onceFn = once((x: number) => {
      callCount++;
      return x * 2;
    });
    assert(onceFn(5) === 10, "12: first call → 10");
    assert(onceFn(99) === 10, "12: second call → still 10");
    assert(onceFn(0) === 10, "12: third call → still 10");
    assert(callCount === 1, "12: fn called exactly once");
  }

  // Exercise 13: memoize
  {
    let computeCount = 0;
    const slowSquare = memoize((n: number) => {
      computeCount++;
      return n * n;
    });
    assert(slowSquare(4) === 16, "13: square(4) → 16");
    assert(slowSquare(4) === 16, "13: cached square(4) → 16");
    assert(slowSquare(5) === 25, "13: square(5) → 25");
    assert(slowSquare(5) === 25, "13: cached square(5) → 25");
    assert(computeCount === 2, "13: only 2 actual computations");
  }

  // Exercise 14: createPrivateStore
  {
    const store = createPrivateStore();
    store.set("secret", 42);
    store.set("name", "Alice");
    assert(store.get("secret") === 42, "14: get secret → 42");
    assert(store.get("name") === "Alice", '14: get name → "Alice"');
    assert(store.get("missing") === undefined, "14: missing key → undefined");
    store.set("secret", 100);
    assert(store.get("secret") === 100, "14: overwrite secret → 100");
  }

  // Exercise 15: bankAccount
  {
    const acct = bankAccount(100);
    assert(acct.getBalance() === 100, "15: initial balance 100");
    assert(acct.deposit(50) === 150, "15: deposit 50 → 150");
    assert(acct.withdraw(30) === 120, "15: withdraw 30 → 120");
    assert(acct.getBalance() === 120, "15: getBalance → 120");

    let threwError = false;
    try {
      acct.withdraw(200);
    } catch {
      threwError = true;
    }
    assert(threwError, "15: withdraw > balance throws");
    assert(acct.getBalance() === 120, "15: balance unchanged after failed withdraw");
  }

  // Exercise 16: createMultiplier
  {
    const double = createMultiplier(2);
    const triple = createMultiplier(3);
    assert(double(7) === 14, "16: double(7) → 14");
    assert(triple(7) === 21, "16: triple(7) → 21");
    assert(double(0) === 0, "16: double(0) → 0");
    assert(createMultiplier(-1)(5) === -5, "16: negate(5) → -5");
  }

  // Exercise 17: createLogger
  {
    // Suppress console.log during test
    const originalLog = console.log;
    const logged: string[] = [];
    console.log = (...args: unknown[]) => {
      logged.push(args.join(" "));
    };

    const logger = createLogger("[APP]");
    logger.log("started");
    logger.log("loaded");
    const history = logger.getHistory();

    console.log = originalLog; // restore

    assert(history.length === 2, "17: history has 2 entries");
    assert(history[0] === "[APP] started", '17: first entry "[APP] started"');
    assert(history[1] === "[APP] loaded", '17: second entry "[APP] loaded"');

    // Verify getHistory returns a copy
    history.push("hacked");
    assert(logger.getHistory().length === 2, "17: getHistory returns a copy");
  }

  // Exercise 18: createRangeIterator
  {
    const iter = createRangeIterator(1, 4);
    const values: number[] = [];
    let step = iter.next();
    while (!step.done) {
      values.push(step.value as number);
      step = iter.next();
    }
    assert(
      values.join(",") === "1,2,3,4",
      "18: range(1,4) → [1,2,3,4]"
    );
    assert(step.done === true, "18: done after exhaustion");
    assert(step.value === undefined, "18: value undefined when done");

    // Empty range
    const empty = createRangeIterator(5, 3);
    const first = empty.next();
    assert(first.done === true, "18: empty range (5,3) is immediately done");
  }

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

main();
