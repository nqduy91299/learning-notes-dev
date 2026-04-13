// ============================================================================
// The `this` Keyword — 18 Exercises — SOLUTIONS
// ============================================================================
// Run:  npx tsx solutions.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

function section(title: string): void {
  console.log(`\n── ${title} ──`);
}

(async () => {  // async IIFE wrapper for top-level await support

// ============================================================================
// SECTION A — Predict the Output
// ============================================================================
section("A · Predict the Output");

// ---------------------------------------------------------------------------
// Exercise 1: Basic method call
// ---------------------------------------------------------------------------
// user.greet() — implicit binding, this === user
{
  const user = {
    name: "Alice",
    greet() {
      return this.name;
    },
  };

  const result = user.greet();
  const expected: string = "Alice";
  assert(result === expected, "Ex 1 — basic method call");
}

// ---------------------------------------------------------------------------
// Exercise 2: Extracted method
// ---------------------------------------------------------------------------
// const fn = user.greet; fn() — standalone call in strict mode → this is undefined
// The ?. guard returns "no-this"
{
  const user = {
    name: "Bob",
    greet() {
      return this?.name ?? "no-this";
    },
  };

  const fn = user.greet;
  const result = fn();
  const expected: string = "no-this";
  assert(result === expected, "Ex 2 — extracted method");
}

// ---------------------------------------------------------------------------
// Exercise 3: Arrow function inside method
// ---------------------------------------------------------------------------
// team.getGreeter() — implicit binding sets this = team inside getGreeter.
// The arrow fn inherits that this, so it returns "Dev".
{
  const team = {
    name: "Dev",
    getGreeter() {
      return () => this.name;
    },
  };

  const greeter = team.getGreeter();
  const result = greeter();
  const expected: string = "Dev";
  assert(result === expected, "Ex 3 — arrow inside method");
}

// ---------------------------------------------------------------------------
// Exercise 4: Regular function inside method
// ---------------------------------------------------------------------------
// A regular function returned from getGreeter and called standalone.
// The inner function uses "use strict", so this is undefined.
// typeof undefined === "undefined"
{
  const team = {
    name: "Dev",
    getGreeter() {
      return function () {
        "use strict";
        return typeof this;
      };
    },
  };

  const greeter = team.getGreeter();
  const result = greeter();
  const expected: string = "undefined";
  assert(result === expected, "Ex 4 — regular fn inside method (strict)");
}

// ---------------------------------------------------------------------------
// Exercise 5: call with explicit context
// ---------------------------------------------------------------------------
// identify.call(admin) → this = admin → returns "admin"
{
  function identify(this: { role: string }) {
    return this.role;
  }

  const admin = { role: "admin" };
  const result = identify.call(admin);
  const expected: string = "admin";
  assert(result === expected, "Ex 5 — call with explicit context");
}

// ---------------------------------------------------------------------------
// Exercise 6: apply with arg array
// ---------------------------------------------------------------------------
// sum.apply(ctx, [3, 7]) → this.base + 3 + 7 = 10 + 3 + 7 = 20
{
  function sum(this: { base: number }, a: number, b: number) {
    return this.base + a + b;
  }

  const ctx = { base: 10 };
  const result = sum.apply(ctx, [3, 7]);
  const expected: number = 20;
  assert(result === expected, "Ex 6 — apply with arg array");
}

// ---------------------------------------------------------------------------
// Exercise 7: bind returns a new function, first bind wins
// ---------------------------------------------------------------------------
// bind only works once — the second bind has no effect on this
{
  function getName(this: { name: string }) {
    return this.name;
  }

  const bound1 = getName.bind({ name: "John" });
  const bound2 = bound1.bind({ name: "Ann" });
  const result = bound2();
  const expected: string = "John";
  assert(result === expected, "Ex 7 — bind only works once");
}

// ---------------------------------------------------------------------------
// Exercise 8: `new` binding
// ---------------------------------------------------------------------------
// new Gadget("phone") → this.type = "phone"
{
  function Gadget(this: { type: string }, type: string) {
    this.type = type;
  }

  const g = new (Gadget as unknown as new (t: string) => { type: string })("phone");
  const result = g.type;
  const expected: string = "phone";
  assert(result === expected, "Ex 8 — new binding");
}

// ---------------------------------------------------------------------------
// Exercise 9: `new` overrides bind
// ---------------------------------------------------------------------------
// new takes precedence over bind — this is the newly created object
// So this.value = 42 (the argument), not 999 (the bound context)
{
  function Maker(this: { value: number }, v: number) {
    this.value = v;
  }
  const BoundMaker = (Maker as Function).bind({ value: 999 });
  const obj = new BoundMaker(42) as { value: number };
  const result = obj.value;
  const expected: number = 42;
  assert(result === expected, "Ex 9 — new overrides bind");
}

// ---------------------------------------------------------------------------
// Exercise 10: Nested functions — arrow vs regular
// ---------------------------------------------------------------------------
// outer.getVal() → implicit binding → this = outer inside getVal
// arrowFn inherits that this → returns 100
{
  const outer = {
    val: 100,
    getVal() {
      const arrowFn = () => this.val;
      return arrowFn();
    },
  };

  const result = outer.getVal();
  const expected: number = 100;
  assert(result === expected, "Ex 10 — nested arrow inherits this");
}

// ---------------------------------------------------------------------------
// Exercise 11: setTimeout simulation (extracted method)
// ---------------------------------------------------------------------------
// Extracted method called standalone in strict mode → this is undefined
// The ?. guard returns "no-time"
{
  const clock = {
    time: "12:00",
    getTime() {
      return this?.time ?? "no-time";
    },
  };

  const extracted = clock.getTime;
  const result = extracted();
  const expected: string = "no-time";
  assert(result === expected, "Ex 11 — setTimeout loses this");
}

// ---------------------------------------------------------------------------
// Exercise 12: setTimeout fixed with bind
// ---------------------------------------------------------------------------
// bind(clock) permanently fixes this to clock
{
  const clock = {
    time: "12:00",
    getTime() {
      return this.time;
    },
  };

  const bound = clock.getTime.bind(clock);
  const result = bound();
  const expected: string = "12:00";
  assert(result === expected, "Ex 12 — setTimeout fixed with bind");
}

// ---------------------------------------------------------------------------
// Exercise 13: Method on prototype chain
// ---------------------------------------------------------------------------
// child.identify() — implicit binding → this = child → this.id = 7
// The method is defined on `base` but `this` follows the calling object.
{
  const base = {
    identify() {
      return (this as Record<string, unknown>).id;
    },
  };

  const child = Object.create(base) as { id: number; identify(): unknown };
  child.id = 7;
  const result = child.identify();
  const expected: number = 7;
  assert(result === expected, "Ex 13 — this follows the calling object, not definition");
}

// ---------------------------------------------------------------------------
// Exercise 14: Arrow function ignores call/apply/bind
// ---------------------------------------------------------------------------
// The arrow is created inside obj.getArrow(), so it captures this = obj.
// call/apply/bind cannot override an arrow's this — it always returns "fixed".
{
  const obj = {
    name: "fixed",
    getArrow() {
      return () => this.name;
    },
  };

  const arrow = obj.getArrow(); // arrow's this is permanently obj

  const result1 = arrow.call({ name: "X" });
  const result2 = arrow.apply({ name: "Y" });
  const result3 = arrow.bind({ name: "Z" })();

  const expected: string = "fixed";
  assert(
    result1 === expected && result2 === expected && result3 === expected,
    "Ex 14 — arrow ignores call/apply/bind"
  );
}

// ============================================================================
// SECTION B — Fix the Bug
// ============================================================================
section("B · Fix the Bug");

// ---------------------------------------------------------------------------
// Exercise 15: Lost `this` in callback — SOLUTION
// ---------------------------------------------------------------------------
// Fix: use an arrow function in forEach so it inherits `this` from incrementAll
{
  class Counter {
    count = 0;

    incrementAll(items: number[]) {
      // SOLUTION: arrow function inherits `this` from the method
      items.forEach((_item) => {
        this.count++;
      });
    }
  }

  const c = new Counter();
  c.incrementAll([1, 2, 3]);
  assert(c.count === 3, "Ex 15 — fix lost this in forEach callback");
}

// ---------------------------------------------------------------------------
// Exercise 16: Class method passed as callback — SOLUTION
// ---------------------------------------------------------------------------
// Fix: bind the method before passing, or use an arrow wrapper
{
  function execute(fn: (msg: string) => string): string {
    return fn("hello");
  }

  class Logger {
    prefix = "LOG";

    log(msg: string): string {
      return `[${this.prefix}] ${msg}`;
    }
  }

  const logger = new Logger();
  // SOLUTION: bind the method to preserve `this`
  const result = execute(logger.log.bind(logger));
  assert(result === "[LOG] hello", "Ex 16 — fix class method as callback");
}

// ---------------------------------------------------------------------------
// Exercise 17: `this` in nested regular function — SOLUTION
// ---------------------------------------------------------------------------
// Fix: convert nested function to arrow function
{
  const calculator = {
    values: [1, 2, 3, 4],
    sumAll(): number {
      // SOLUTION: use arrow function to inherit `this` from sumAll
      const helper = () => {
        return this.values.reduce((a, b) => a + b, 0);
      };
      return helper();
    },
  };

  assert(calculator.sumAll() === 10, "Ex 17 — fix nested function this");
}

// ============================================================================
// SECTION C — Implement
// ============================================================================
section("C · Implement");

// ---------------------------------------------------------------------------
// Exercise 18: Custom bind polyfill — SOLUTION
// ---------------------------------------------------------------------------
// Core idea: return a closure that calls fn.apply(context, [...boundArgs, ...callArgs])
{
  function myBind<T, A extends unknown[], B extends unknown[], R>(
    fn: (this: T, ...args: [...A, ...B]) => R,
    context: T,
    ...boundArgs: A
  ): (...args: B) => R {
    return function (...callArgs: B): R {
      return fn.apply(context, [...boundArgs, ...callArgs] as [...A, ...B]);
    };
  }

  function greet(this: { name: string }, greeting: string, punctuation: string) {
    return `${greeting}, ${this.name}${punctuation}`;
  }

  const boundGreet = myBind(greet, { name: "Alice" }, "Hello");
  assert(boundGreet("!") === "Hello, Alice!", "Ex 18a — myBind basic");
  assert(boundGreet("?") === "Hello, Alice?", "Ex 18b — myBind partial args");

  function add(this: { base: number }, a: number, b: number) {
    return this.base + a + b;
  }
  const boundAdd = myBind(add, { base: 10 }, 5);
  assert(boundAdd(3) === 18, "Ex 18c — myBind with numbers");
}

// ---------------------------------------------------------------------------
// Exercise 19: Debounce that preserves `this` — SOLUTION
// ---------------------------------------------------------------------------
// Core idea: clearTimeout on each call, schedule new setTimeout with arrow
// function so `this` and `arguments` are captured from the wrapper.
{
  function debounce<T, A extends unknown[]>(
    fn: (this: T, ...args: A) => void,
    ms: number
  ): (this: T, ...args: A) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function (this: T, ...args: A) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, ms);
    };
  }

  let callCount = 0;
  let lastArgs: number[] = [];

  const obj = {
    scale: 2,
    process(a: number, b: number) {
      callCount++;
      lastArgs = [a * this.scale, b * this.scale];
    },
  };

  const debounced = debounce(obj.process, 50);

  // Simulate rapid calls — only last one should fire
  debounced.call(obj, 1, 2);
  debounced.call(obj, 3, 4);
  debounced.call(obj, 5, 6); // this is the last call → should fire with (5,6)

  await new Promise((r) => setTimeout(r, 100));

  assert(callCount === 1, "Ex 19a — debounce fires once");
  assert(
    lastArgs[0] === 10 && lastArgs[1] === 12,
    "Ex 19b — debounce preserves this and uses last args"
  );
}

// ---------------------------------------------------------------------------
// Exercise 20: Method borrowing — SOLUTION
// ---------------------------------------------------------------------------
// Core idea: source[methodName].call(target, ...args)
{
  function borrowMethod<
    S extends Record<string, (...args: never[]) => unknown>,
    K extends keyof S,
  >(
    source: S,
    methodName: K,
    target: ThisParameterType<S[K]> extends unknown ? Record<string, unknown> : ThisParameterType<S[K]>,
    ...args: Parameters<S[K]>
  ): ReturnType<S[K]> {
    return source[methodName].apply(target, args) as ReturnType<S[K]>;
  }

  const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
  const result = borrowMethod(
    Array.prototype as unknown as { join: (sep?: string) => string },
    "join",
    arrayLike,
    "-"
  );
  assert(result === "a-b-c", "Ex 20a — borrow Array.prototype.join");

  const src = {
    greet(this: { name: string }, greeting: string) {
      return `${greeting}, ${this.name}`;
    },
  };
  const target = { name: "World" };
  const result2 = borrowMethod(src, "greet", target, "Hello");
  assert(result2 === "Hello, World", "Ex 20b — borrow custom method");
}

// ============================================================================
// Summary
// ============================================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log(`${"=".repeat(50)}\n`);

if (failed > 0) process.exit(1);

})(); // end async IIFE
