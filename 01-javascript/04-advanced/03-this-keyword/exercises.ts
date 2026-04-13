// ============================================================================
// The `this` Keyword — 18 Exercises
// ============================================================================
// Instructions:
//   - For "Predict the output" exercises: fill in the EXPECTED string/value.
//   - For "Fix the bug" exercises: modify the code so the test passes.
//   - For "Implement" exercises: write the function body (no `any` casts).
//
// Run:  npx tsx exercises.ts
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
{
  const user = {
    name: "Alice",
    greet() {
      return this.name;
    },
  };

  const result = user.greet();
  const expected: string = "TODO"; // ← Replace with your prediction
  assert(result === expected, "Ex 1 — basic method call");
}

// ---------------------------------------------------------------------------
// Exercise 2: Extracted method (strict mode — tsx runs in strict by default)
// ---------------------------------------------------------------------------
{
  const user = {
    name: "Bob",
    greet() {
      return this?.name ?? "no-this";
    },
  };

  const fn = user.greet;
  const result = fn();
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 2 — extracted method");
}

// ---------------------------------------------------------------------------
// Exercise 3: Arrow function inside method
// ---------------------------------------------------------------------------
{
  const team = {
    name: "Dev",
    getGreeter() {
      return () => this.name;
    },
  };

  const greeter = team.getGreeter();
  const result = greeter();
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 3 — arrow inside method");
}

// ---------------------------------------------------------------------------
// Exercise 4: Regular function inside method (strict mode)
// ---------------------------------------------------------------------------
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
  const expected: string = "TODO"; // ← predict (typeof result)
  assert(result === expected, "Ex 4 — regular fn inside method (strict)");
}

// ---------------------------------------------------------------------------
// Exercise 5: call with explicit context
// ---------------------------------------------------------------------------
{
  function identify(this: { role: string }) {
    return this.role;
  }

  const admin = { role: "admin" };
  const result = identify.call(admin);
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 5 — call with explicit context");
}

// ---------------------------------------------------------------------------
// Exercise 6: apply with arg array
// ---------------------------------------------------------------------------
{
  function sum(this: { base: number }, a: number, b: number) {
    return this.base + a + b;
  }

  const ctx = { base: 10 };
  const result = sum.apply(ctx, [3, 7]);
  const expected: number = -1; // ← predict (replace -1)
  assert(result === expected, "Ex 6 — apply with arg array");
}

// ---------------------------------------------------------------------------
// Exercise 7: bind returns a new function, first bind wins
// ---------------------------------------------------------------------------
{
  function getName(this: { name: string }) {
    return this.name;
  }

  const bound1 = getName.bind({ name: "John" });
  const bound2 = bound1.bind({ name: "Ann" });
  const result = bound2();
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 7 — bind only works once");
}

// ---------------------------------------------------------------------------
// Exercise 8: `new` binding
// ---------------------------------------------------------------------------
{
  function Gadget(this: { type: string }, type: string) {
    this.type = type;
  }

  const g = new (Gadget as unknown as new (t: string) => { type: string })("phone");
  const result = g.type;
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 8 — new binding");
}

// ---------------------------------------------------------------------------
// Exercise 9: `new` overrides bind
// ---------------------------------------------------------------------------
{
  function Maker(this: { value: number }, v: number) {
    this.value = v;
  }
  const BoundMaker = (Maker as Function).bind({ value: 999 });
  const obj = new BoundMaker(42) as { value: number };
  const result = obj.value;
  const expected: number = -1; // ← predict (replace -1)
  assert(result === expected, "Ex 9 — new overrides bind");
}

// ---------------------------------------------------------------------------
// Exercise 10: Nested functions — arrow vs regular
// ---------------------------------------------------------------------------
{
  const outer = {
    val: 100,
    getVal() {
      const arrowFn = () => this.val;
      return arrowFn();
    },
  };

  const result = outer.getVal();
  const expected: number = -1; // ← predict (replace -1)
  assert(result === expected, "Ex 10 — nested arrow inherits this");
}

// ---------------------------------------------------------------------------
// Exercise 11: setTimeout simulation (extracted method)
// ---------------------------------------------------------------------------
{
  const clock = {
    time: "12:00",
    getTime() {
      return this?.time ?? "no-time";
    },
  };

  // Simulate what setTimeout does: extract then call
  const extracted = clock.getTime;
  const result = extracted();
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 11 — setTimeout loses this");
}

// ---------------------------------------------------------------------------
// Exercise 12: setTimeout fixed with bind
// ---------------------------------------------------------------------------
{
  const clock = {
    time: "12:00",
    getTime() {
      return this.time;
    },
  };

  const bound = clock.getTime.bind(clock);
  const result = bound();
  const expected: string = "TODO"; // ← predict
  assert(result === expected, "Ex 12 — setTimeout fixed with bind");
}

// ---------------------------------------------------------------------------
// Exercise 13: Method on prototype chain
// ---------------------------------------------------------------------------
{
  const base = {
    identify() {
      return (this as Record<string, unknown>).id;
    },
  };

  const child = Object.create(base) as { id: number; identify(): unknown };
  child.id = 7;
  const result = child.identify();
  const expected: number = -1; // ← predict (replace -1)
  assert(result === expected, "Ex 13 — this follows the calling object, not definition");
}

// ---------------------------------------------------------------------------
// Exercise 14: Arrow function ignores call/apply/bind
// ---------------------------------------------------------------------------
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

  // All three should be the same — predict that value
  const expected: string = "TODO"; // ← predict
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
// Exercise 15: Lost `this` in callback
// ---------------------------------------------------------------------------
// The Counter class tracks a count. `incrementAll` should bump the count
// for each item, but `this` is lost inside the forEach callback.
// FIX the forEach line so `this.count` works. Do NOT change the class shape.
// ---------------------------------------------------------------------------
{
  class Counter {
    count = 0;

    incrementAll(items: number[]) {
      items.forEach(function (this: undefined, _item) {
        // BUG: `this` is undefined here
        // (this as unknown as Counter).count++;
        // ↑ Uncomment and fix so it actually works
      });
    }
  }

  const c = new Counter();
  c.incrementAll([1, 2, 3]);
  assert(c.count === 3, "Ex 15 — fix lost this in forEach callback");
}

// ---------------------------------------------------------------------------
// Exercise 16: Class method passed as callback
// ---------------------------------------------------------------------------
// `Logger.log` is passed to `execute`, but loses its `this`.
// Fix it so that `Logger.log` always prints the correct `prefix`.
// You may ONLY change the Logger class — do NOT change `execute`.
// ---------------------------------------------------------------------------
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
  // BUG: passing logger.log loses `this`
  // const result = execute(logger.log);
  const result = "TODO"; // ← Replace this with the fixed `execute(...)` call
  assert(result === "[LOG] hello", "Ex 16 — fix class method as callback");
}

// ---------------------------------------------------------------------------
// Exercise 17: `this` in nested regular function
// ---------------------------------------------------------------------------
// `calculator.sumAll` uses a nested helper that needs `this.values`.
// Fix it without changing the method signature.
// ---------------------------------------------------------------------------
{
  const calculator = {
    values: [1, 2, 3, 4],
    sumAll(): number {
      // BUG: nested function loses `this`
      function helper(this: unknown) {
        // return (this as typeof calculator).values.reduce((a, b) => a + b, 0);
        return 0; // ← Fix this
      }
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
// Exercise 18: Custom bind polyfill
// ---------------------------------------------------------------------------
// Implement `myBind` that works like Function.prototype.bind.
// Requirements:
//   - Returns a new function with `this` fixed to `context`
//   - Supports partial application (pre-filled args)
//   - Passes additional call-time args after the bound args
//   - No `any` casts
// ---------------------------------------------------------------------------
{
  function myBind<T, A extends unknown[], B extends unknown[], R>(
    fn: (this: T, ...args: [...A, ...B]) => R,
    context: T,
    ...boundArgs: A
  ): (...args: B) => R {
    // TODO: implement
    return (() => undefined) as unknown as (...args: B) => R;
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
// Exercise 19: Debounce that preserves `this`
// ---------------------------------------------------------------------------
// Implement `debounce(fn, ms)` that:
//   - Delays invocation until `ms` after the last call
//   - Preserves `this` from the call site
//   - Passes all arguments to `fn`
//   - Returns void (fire-and-forget style)
// ---------------------------------------------------------------------------
{
  function debounce<T, A extends unknown[]>(
    fn: (this: T, ...args: A) => void,
    ms: number
  ): (this: T, ...args: A) => void {
    // TODO: implement
    return function (this: T, ..._args: A) {
      // placeholder
    };
  }

  // Test: only the last call within the window should fire
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

  // Simulate rapid calls
  debounced.call(obj, 1, 2);
  debounced.call(obj, 3, 4);
  debounced.call(obj, 5, 6);

  await new Promise((r) => setTimeout(r, 100));

  assert(callCount === 1, "Ex 19a — debounce fires once");
  assert(
    lastArgs[0] === 10 && lastArgs[1] === 12,
    "Ex 19b — debounce preserves this and uses last args"
  );
}

// ---------------------------------------------------------------------------
// Exercise 20: Method borrowing
// ---------------------------------------------------------------------------
// Implement `borrowMethod` that takes a method from `source` and calls it
// in the context of `target` with the given args, returning the result.
// No `any` casts.
// ---------------------------------------------------------------------------
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
    // TODO: implement
    return undefined as ReturnType<S[K]>;
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
