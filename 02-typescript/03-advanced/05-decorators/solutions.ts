// ============================================================================
// 05-decorators: Solutions
// ============================================================================
// Run:  npx tsx --tsconfig 02-typescript/03-advanced/05-decorators/tsconfig.json 02-typescript/03-advanced/05-decorators/solutions.ts
// ============================================================================

console.log("=== EXERCISE 1 — Predict the Output ===");

// Decorator factories evaluate top-to-bottom, decorators execute bottom-to-top.

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

class Sol1 {
  @alpha()
  @beta()
  method() {}
}

// Output:
// alpha(): evaluated
// beta(): evaluated
// beta(): called
// alpha(): called
//
// Explanation: Factories (the outer calls) evaluate top-to-bottom.
// The resulting decorator functions execute bottom-to-top (like function composition).

console.log("\n=== EXERCISE 2 — Predict the Output ===");

// Member decorators execute in declaration order, class decorator last.

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
class Sol2 {
  @track("propA")
  propA!: string;

  @trackMethod("methodB")
  methodB() {}

  @track("propC")
  propC!: number;
}

// Output:
// track: propA
// trackMethod: methodB
// track: propC
// trackClass: MyClass
//
// Explanation: Instance member decorators run in declaration order (propA, methodB,
// propC). The class decorator runs last.

console.log("\n=== EXERCISE 3 — Predict the Output ===");

// Modifying the prototype adds methods to all instances.

function addGreeting(constructor: Function) {
  constructor.prototype.greet = function () {
    return `Hello from ${(this as Record<string, unknown>).name}`;
  };
}

@addGreeting
class Sol3Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const sol3 = new Sol3Person("Alice");

console.log(sol3.name);
console.log((sol3 as Record<string, unknown> & { greet(): string }).greet());

// Output:
// Alice
// Hello from Alice
//
// Explanation: The class decorator adds `greet` to the prototype. At runtime,
// `this.name` refers to the instance's `name` property.

console.log("\n=== EXERCISE 4 — Predict the Output ===");

// Parameter decorators execute right-to-left (highest index first).

const sol4Params = new Map<string, number[]>();

function recordParam(
  _target: object,
  methodName: string,
  paramIndex: number
): void {
  const existing = sol4Params.get(methodName) ?? [];
  existing.push(paramIndex);
  sol4Params.set(methodName, existing);
}

class Sol4Service {
  process(
    @recordParam first: string,
    @recordParam second: number,
    @recordParam third: boolean
  ) {
    return { first, second, third };
  }
}

void Sol4Service;
console.log(sol4Params.get("process"));

// Output: [2, 1, 0]
//
// Explanation: Parameter decorators execute right-to-left. The third parameter
// (index 2) is decorated first, then second (index 1), then first (index 0).

console.log("\n=== EXERCISE 5 — Predict the Output ===");

// A class decorator that returns a new class replaces the original constructor.

function withId(constructor: typeof Sol5Base) {
  return class extends constructor {
    id = Math.floor(Math.random() * 1000);
  };
}

@withId
class Sol5Base {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const sol5a = new Sol5Base("test");
const sol5b = new Sol5Base("test");

console.log("name" in sol5a);
console.log("id" in sol5a);
console.log(sol5a === sol5b);

// Output:
// true
// true
// false
//
// Explanation: The decorator extends the class, adding `id`. Both instances have
// `name` and `id`. They are different objects, so `===` is false.

console.log("\n=== EXERCISE 6 — Fix the Bug ===");

// FIX: Use a regular function expression instead of arrow function,
// so `this` refers to the class instance.

function logCallFixed(
  _target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  // FIX: arrow function replaced with regular function
  descriptor.value = function (...args: unknown[]) {
    console.log(`Calling ${propertyKey}`);
    return original.apply(this, args);
  };
}

class Sol6Greeter {
  prefix = "Hi";

  @logCallFixed
  greet(name: string): string {
    return `${this.prefix}, ${name}!`;
  }
}

const sol6 = new Sol6Greeter();
console.log(sol6.greet("World"));

// Output:
// Calling greet
// Hi, World!
//
// Explanation: Arrow functions capture `this` from the enclosing scope (the
// decorator function itself, not the instance). A regular `function` expression
// gets `this` from the call site, which is the class instance.

console.log("\n=== EXERCISE 7 — Fix the Bug ===");

// FIX: The factory must return the inner decorator function.

function maxLength(max: number) {
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
  return decorator; // FIX: was missing
}

class Sol7Form {
  @maxLength(10)
  setTitle(title: string) {
    console.log("Title:", title);
  }
}

const sol7 = new Sol7Form();
sol7.setTitle("Short");
try {
  sol7.setTitle("This is way too long for the limit");
} catch (e) {
  console.log("Caught:", (e as Error).message);
}

// Output:
// Title: Short
// Caught: setTitle: string exceeds max length 10

console.log("\n=== EXERCISE 8 — Fix the Bug ===");

// FIX: Must also seal the prototype.

function sealClassFixed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype); // FIX: was missing
}

@sealClassFixed
class Sol8Config {
  version = "1.0";
}

try {
  (Sol8Config.prototype as Record<string, unknown>).newProp = "oops";
  console.log("No error — seal did not work");
} catch {
  console.log("Correctly threw — prototype is sealed");
}

// Output: Correctly threw — prototype is sealed
//
// Explanation: `Object.seal` prevents adding new properties. The original only
// sealed the constructor function, not its prototype. Adding
// `Object.seal(constructor.prototype)` completes the seal.

console.log("\n=== EXERCISE 9 — Implement: Method Timer Decorator ===");

function timed(
  _target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]) {
    const start = performance.now();
    const result = original.apply(this, args);
    const elapsed = performance.now() - start;
    console.log(`${propertyKey} executed in ${elapsed.toFixed(2)}ms`);
    return result;
  };
}

class Sol9Math {
  @timed
  heavyComputation(n: number): number {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += i;
    return sum;
  }
}

const sol9 = new Sol9Math();
const sol9Result = sol9.heavyComputation(1_000_000);
console.log("Result:", sol9Result);

// Output (times vary):
// heavyComputation executed in X.XXms
// Result: 499999500000

console.log("\n=== EXERCISE 10 — Implement: Readonly Method Decorator ===");

function readonly(
  _target: object,
  _propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  descriptor.writable = false;
}

class Sol10Service {
  @readonly
  criticalMethod(): string {
    return "do not override me";
  }
}

const sol10 = new Sol10Service();
console.log(sol10.criticalMethod());

try {
  (sol10 as Record<string, unknown>).criticalMethod = () => "hacked";
  console.log("No error — readonly did not work");
} catch {
  console.log("Correctly threw — method is readonly");
}

// Output:
// do not override me
// Correctly threw — method is readonly
//
// Explanation: Setting `descriptor.writable = false` makes the property
// non-writable. In strict mode, assigning to it throws a TypeError.

console.log("\n=== EXERCISE 11 — Implement: Retry Decorator Factory ===");

function retry(times: number) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]) {
      let lastError: unknown;
      for (let i = 0; i < times; i++) {
        try {
          return original.apply(this, args);
        } catch (e) {
          lastError = e;
        }
      }
      throw lastError;
    };
  };
}

class Sol11Api {
  private attempts = 0;

  @retry(3)
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

const sol11 = new Sol11Api();
console.log(sol11.unstableCall());
console.log("Attempts:", sol11.getAttempts());

// Output:
// success
// Attempts: 3
//
// Explanation: The decorator wraps the original method in a loop. Attempts 1 and 2
// throw, attempt 3 succeeds. The `this` context is preserved via `.apply(this, ...)`.

console.log("\n=== EXERCISE 12 — Implement: Property Collector ===");

const fieldRegistry = new Map<Function, string[]>();

function field(target: object, propertyKey: string): void {
  const constructor = target.constructor;
  const existing = fieldRegistry.get(constructor) ?? [];
  existing.push(propertyKey);
  fieldRegistry.set(constructor, existing);
}

function getFields(target: Function): string[] {
  return fieldRegistry.get(target) ?? [];
}

class Sol12Model {
  @field
  name!: string;

  @field
  email!: string;

  @field
  age!: number;

  undecorated = "skip";
}

console.log(getFields(Sol12Model));

// Output: ["name", "email", "age"]
//
// Explanation: Each `@field` decorator fires on the prototype, and we look up
// `target.constructor` to get the class. We store the property names in a Map
// keyed by the constructor. `undecorated` is not in the list.

console.log("\n=== EXERCISE 13 — Implement: Memoize Decorator ===");

function memoize(
  _target: object,
  _propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  const cache = new Map<string, unknown>();

  descriptor.value = function (...args: unknown[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

class Sol13Calc {
  callCount = 0;

  @memoize
  expensiveAdd(a: number, b: number): number {
    this.callCount++;
    return a + b;
  }
}

const sol13 = new Sol13Calc();
console.log(sol13.expensiveAdd(1, 2)); // 3
console.log(sol13.expensiveAdd(1, 2)); // 3 (cached)
console.log(sol13.expensiveAdd(3, 4)); // 7
console.log("callCount:", sol13.callCount); // 2

// Output:
// 3
// 3
// 7
// callCount: 2
//
// Explanation: The cache key is `JSON.stringify(args)`. The second call with (1,2)
// hits the cache. The call with (3,4) is a cache miss. So the original function
// is only called twice.

console.log("\n=== EXERCISE 14 — Implement: Deprecation Warning ===");

function deprecated(message?: string) {
  return function (
    _target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): void {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    let warned = false;

    descriptor.value = function (...args: unknown[]) {
      if (!warned) {
        console.log(
          `DEPRECATED: ${propertyKey} — ${message ?? ""}`
        );
        warned = true;
      }
      return original.apply(this, args);
    };
  };
}

class Sol14Legacy {
  @deprecated("Use newMethod instead")
  oldMethod(): string {
    return "old result";
  }

  @deprecated()
  anotherOld(): string {
    return "another old result";
  }

  newMethod(): string {
    return "new result";
  }
}

const sol14 = new Sol14Legacy();
console.log(sol14.oldMethod());    // warns + "old result"
console.log(sol14.oldMethod());    // no warn + "old result"
console.log(sol14.anotherOld());   // warns + "another old result"

// Output:
// DEPRECATED: oldMethod — Use newMethod instead
// old result
// old result
// DEPRECATED: anotherOld —
// another old result
//
// Explanation: A closure variable `warned` tracks whether the warning has been
// shown. Each decorated method gets its own closure, so `warned` is independent
// per method.

console.log("\n=== EXERCISE 15 — Implement: Validation System ===");

// Parameter decorator: records which parameter indices are required.
// Method decorator: checks those indices at call time.

const requiredParamsMap = new Map<string, number[]>();

function required(
  _target: object,
  methodName: string,
  paramIndex: number
): void {
  const existing = requiredParamsMap.get(methodName) ?? [];
  existing.push(paramIndex);
  requiredParamsMap.set(methodName, existing);
}

function validateMethod(
  _target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]) {
    const indices = requiredParamsMap.get(propertyKey) ?? [];
    for (const idx of indices) {
      if (args[idx] === null || args[idx] === undefined) {
        throw new Error(
          `Required parameter at index ${idx} of ${propertyKey} is null/undefined`
        );
      }
    }
    return original.apply(this, args);
  };
}

class Sol15UserService {
  @validateMethod
  createUser(
    @required name: string,
    @required email: string,
    bio?: string
  ): Record<string, unknown> {
    return { name, email, bio };
  }
}

const sol15 = new Sol15UserService();
console.log(sol15.createUser("Alice", "alice@test.com"));

try {
  sol15.createUser(null as unknown as string, "test@test.com");
} catch (e) {
  console.log("Caught:", (e as Error).message);
}

try {
  sol15.createUser("Bob", undefined as unknown as string);
} catch (e) {
  console.log("Caught:", (e as Error).message);
}

// Output:
// { name: 'Alice', email: 'alice@test.com', bio: undefined }
// Caught: Required parameter at index 0 of createUser is null/undefined
// Caught: Required parameter at index 1 of createUser is null/undefined
//
// Explanation: `@required` is a parameter decorator that records indices in a Map.
// `@validateMethod` is a method decorator that wraps the original function and
// checks all recorded required-param indices before calling through. Parameter
// decorators run right-to-left but that doesn't affect the indices stored.
// The method decorator MUST be listed above the parameters (it decorates the
// method itself), and parameter decorators run before the method decorator.

console.log("\n=== All solutions complete ===");
