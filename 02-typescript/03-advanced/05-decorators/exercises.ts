// ============================================================================
// 05-decorators: Exercises
// ============================================================================
// Run:  npx tsx --tsconfig 02-typescript/03-advanced/05-decorators/tsconfig.json 02-typescript/03-advanced/05-decorators/exercises.ts
//
// 15 exercises: 5 predict-output, 3 fix-the-bug, 7 implement
// All test code is commented out. No `any`. Must compile cleanly.
// Local tsconfig.json enables experimentalDecorators + emitDecoratorMetadata.
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output
// ============================================================================
// What is the evaluation and execution order of these decorator factories?

function alpha() {
  console.log("alpha(): evaluated");
  return function (
    _target: object,
    _key: string,
    _descriptor: PropertyDescriptor
  ) {
    console.log("alpha(): called");
  };
}

function beta() {
  console.log("beta(): evaluated");
  return function (
    _target: object,
    _key: string,
    _descriptor: PropertyDescriptor
  ) {
    console.log("beta(): called");
  };
}

class Ex1 {
  @alpha()
  @beta()
  method() {}
}

// YOUR PREDICTION (4 lines of output):
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// ============================================================================
// EXERCISE 2 — Predict the Output
// ============================================================================
// What order do decorators on different members execute?

function track(label: string) {
  return function (_target: object, _key: string) {
    console.log(`track: ${label}`);
  };
}

function trackMethod(label: string) {
  return function (
    _target: object,
    _key: string,
    _descriptor: PropertyDescriptor
  ) {
    console.log(`trackMethod: ${label}`);
  };
}

function trackClass(label: string) {
  return function (_constructor: Function) {
    console.log(`trackClass: ${label}`);
  };
}

@trackClass("MyClass")
class Ex2 {
  @track("propA")
  propA!: string;

  @trackMethod("methodB")
  methodB() {}

  @track("propC")
  propC!: number;
}

// YOUR PREDICTION (4 lines of output):
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// ============================================================================
// EXERCISE 3 — Predict the Output
// ============================================================================
// What does the class decorator that returns a new constructor do?

function addGreeting(constructor: Function) {
  constructor.prototype.greet = function () {
    return `Hello from ${(this as Record<string, unknown>).name}`;
  };
}

@addGreeting
class Ex3Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const ex3 = new Ex3Person("Alice");

// console.log(ex3.name);
// console.log((ex3 as Record<string, unknown> & { greet(): string }).greet());

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???

// ============================================================================
// EXERCISE 4 — Predict the Output
// ============================================================================
// Parameter decorators: what indices are recorded and in what order?

const ex4Params = new Map<string, number[]>();

function recordParam(
  _target: object,
  methodName: string,
  paramIndex: number
): void {
  const existing = ex4Params.get(methodName) ?? [];
  existing.push(paramIndex);
  ex4Params.set(methodName, existing);
}

class Ex4Service {
  process(
    @recordParam first: string,
    @recordParam second: number,
    @recordParam third: boolean
  ) {
    return { first, second, third };
  }
}

// console.log(ex4Params.get("process"));

// YOUR PREDICTION:
// Output: ???
// (Hint: parameter decorators execute right-to-left)

// ============================================================================
// EXERCISE 5 — Predict the Output
// ============================================================================
// What happens when a class decorator replaces the constructor?

function withId(constructor: typeof Ex5Base) {
  return class extends constructor {
    id = Math.floor(Math.random() * 1000);
  };
}

@withId
class Ex5Base {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const ex5a = new Ex5Base("test");
const ex5b = new Ex5Base("test");

// console.log("name" in ex5a);
// console.log("id" in ex5a);
// console.log(ex5a === ex5b);

// YOUR PREDICTION:
// Line 1: ???
// Line 2: ???
// Line 3: ???

// ============================================================================
// EXERCISE 6 — Fix the Bug
// ============================================================================
// This logging decorator loses `this` context. Fix it.

function logCall(
  _target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = (...args: unknown[]) => {
    console.log(`Calling ${propertyKey}`);
    // BUG: `this` is wrong here
    return original.apply(undefined, args);
  };
}

class Ex6Greeter {
  prefix = "Hi";

  @logCall
  greet(name: string): string {
    return `${this.prefix}, ${name}!`;
  }
}

// const ex6 = new Ex6Greeter();
// console.log(ex6.greet("World")); // Should print "Hi, World!" but crashes

// ============================================================================
// EXERCISE 7 — Fix the Bug
// ============================================================================
// This decorator factory is missing the return. Fix it so it works as a factory.

function maxLength(max: number) {
  // BUG: This function should return a decorator, but it doesn't.
  function decorator(
    _target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]) {
      for (const arg of args) {
        if (typeof arg === "string" && arg.length > max) {
          throw new Error(`${propertyKey}: string exceeds max length ${max}`);
        }
      }
      return original.apply(this, args);
    };
  }
  // FIX HERE
}

class Ex7Form {
  // @maxLength(10)  // Uncomment after fixing
  setTitle(title: string) {
    console.log("Title:", title);
  }
}

// const ex7 = new Ex7Form();
// ex7.setTitle("Short");          // Should work
// ex7.setTitle("This is way too long for the limit");  // Should throw

// ============================================================================
// EXERCISE 8 — Fix the Bug
// ============================================================================
// This sealed decorator prevents adding properties, but the test shows
// it's not actually sealing. Find and fix the bug.

function sealClass(constructor: Function) {
  // BUG: Only sealing the constructor, not the prototype
  Object.seal(constructor);
}

@sealClass
class Ex8Config {
  version = "1.0";
}

// Test: try adding to prototype — should fail if properly sealed
// (Ex8Config.prototype as Record<string, unknown>).newProp = "oops";
// console.log((Ex8Config.prototype as Record<string, unknown>).newProp);
// Expected: throws or newProp is undefined (sealed)

// ============================================================================
// EXERCISE 9 — Implement: Method Timer Decorator
// ============================================================================
// Create a decorator `@timed` that logs how long a method takes to execute.
// It should log: "<methodName> executed in <time>ms"
// Use `performance.now()` for timing.

// function timed( ... ) { ... }

class Ex9Math {
  // @timed
  heavyComputation(n: number): number {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += i;
    return sum;
  }
}

// const ex9 = new Ex9Math();
// ex9.heavyComputation(1_000_000);
// Should log something like: "heavyComputation executed in 2.34ms"

// ============================================================================
// EXERCISE 10 — Implement: Readonly Property Decorator
// ============================================================================
// Create a method decorator `@readonly` that makes a method non-writable.
// After applying, attempting to reassign the method should throw in strict mode
// (or silently fail).

// function readonly( ... ) { ... }

class Ex10Service {
  // @readonly
  criticalMethod(): string {
    return "do not override me";
  }
}

// const ex10 = new Ex10Service();
// console.log(ex10.criticalMethod()); // "do not override me"
// (ex10 as Record<string, unknown>).criticalMethod = () => "hacked";
// console.log(ex10.criticalMethod()); // Should still be "do not override me"

// ============================================================================
// EXERCISE 11 — Implement: Retry Decorator Factory
// ============================================================================
// Create a decorator factory `@retry(n)` that retries a method up to `n` times
// if it throws an error. After all retries fail, re-throw the last error.

// function retry(times: number) { ... }

class Ex11Api {
  private attempts = 0;

  // @retry(3)
  unstableCall(): string {
    this.attempts++;
    if (this.attempts < 3) {
      throw new Error(`Attempt ${this.attempts} failed`);
    }
    return "success";
  }

  getAttempts(): number {
    return this.attempts;
  }
}

// const ex11 = new Ex11Api();
// console.log(ex11.unstableCall());   // "success"
// console.log(ex11.getAttempts());    // 3

// ============================================================================
// EXERCISE 12 — Implement: Property Collector Decorator
// ============================================================================
// Create a property decorator `@field` that collects all decorated property names
// into a static list on the class. Also create a helper `getFields(target)`
// that returns the list.

// const fieldRegistry = new Map<Function, string[]>();
// function field( ... ) { ... }
// function getFields(target: Function): string[] { ... }

class Ex12Model {
  // @field
  name!: string;

  // @field
  email!: string;

  // @field
  age!: number;

  undecorated = "skip";
}

// console.log(getFields(Ex12Model)); // ["name", "email", "age"]

// ============================================================================
// EXERCISE 13 — Implement: Memoize Decorator
// ============================================================================
// Create a `@memoize` method decorator that caches results based on arguments.
// Use `JSON.stringify(args)` as the cache key.

// function memoize( ... ) { ... }

class Ex13Calc {
  callCount = 0;

  // @memoize
  expensiveAdd(a: number, b: number): number {
    this.callCount++;
    return a + b;
  }
}

// const ex13 = new Ex13Calc();
// console.log(ex13.expensiveAdd(1, 2)); // 3
// console.log(ex13.expensiveAdd(1, 2)); // 3 (cached)
// console.log(ex13.expensiveAdd(3, 4)); // 7
// console.log(ex13.callCount);          // 2 (not 3)

// ============================================================================
// EXERCISE 14 — Implement: Deprecation Warning Decorator
// ============================================================================
// Create `@deprecated(message?)` that logs a warning the FIRST time a method
// is called: "DEPRECATED: <methodName> — <message>"
// Subsequent calls should NOT log again.

// function deprecated(message?: string) { ... }

class Ex14Legacy {
  // @deprecated("Use newMethod instead")
  oldMethod(): string {
    return "old result";
  }

  // @deprecated()
  anotherOld(): string {
    return "another old result";
  }

  newMethod(): string {
    return "new result";
  }
}

// const ex14 = new Ex14Legacy();
// ex14.oldMethod();    // Logs: "DEPRECATED: oldMethod — Use newMethod instead"
// ex14.oldMethod();    // No log (already warned)
// ex14.anotherOld();   // Logs: "DEPRECATED: anotherOld — "

// ============================================================================
// EXERCISE 15 — Implement: Full Validation System
// ============================================================================
// Build a mini validation system with:
// 1. `@validateMethod` — method decorator that checks params marked with @required
// 2. `@required` — parameter decorator that marks a param as required (non-null/undefined)
//
// When a validated method is called, throw if any @required parameter is
// null or undefined.

// const requiredParamsMap = new Map<string, number[]>();
// function required( ... ) { ... }
// function validateMethod( ... ) { ... }

class Ex15UserService {
  // @validateMethod
  createUser(
    /* @required */ name: string,
    /* @required */ email: string,
    bio?: string
  ): Record<string, unknown> {
    return { name, email, bio };
  }
}

// const ex15 = new Ex15UserService();
// console.log(ex15.createUser("Alice", "alice@test.com"));
// // { name: "Alice", email: "alice@test.com", bio: undefined }
//
// console.log(ex15.createUser(null as unknown as string, "test@test.com"));
// // Should throw: "Required parameter at index 0 of createUser is null/undefined"
