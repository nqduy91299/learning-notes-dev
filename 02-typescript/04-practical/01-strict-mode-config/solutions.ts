// ============================================================================
// Strict Mode Config - Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: strictNullChecks — Nullable parameter
// ----------------------------------------------------------------------------
// Key insight: Under strictNullChecks, you must narrow `null` before using
// the value as a string. A simple ternary or null check suffices.

function getLength(value: string | null): number {
  if (value === null) {
    return 0;
  }
  return value.length;
}

console.log("=== Exercise 1: strictNullChecks — Nullable parameter ===");
console.log(getLength("hello")); // 5
console.log(getLength(null));    // 0

// ----------------------------------------------------------------------------
// Exercise 2: strictNullChecks — Optional chaining
// ----------------------------------------------------------------------------
// Key insight: Optional chaining (?.) short-circuits to `undefined` if any
// part of the chain is nullish. The nullish coalescing operator (??) provides
// a fallback.

interface Address {
  city: string;
  zip: string;
}

interface UserProfile {
  name: string;
  address?: Address;
}

function getUserCity(user: UserProfile | null): string {
  return user?.address?.city ?? "Unknown";
}

console.log("\n=== Exercise 2: strictNullChecks — Optional chaining ===");
console.log(getUserCity({ name: "Alice", address: { city: "NYC", zip: "10001" } })); // "NYC"
console.log(getUserCity({ name: "Bob" }));  // "Unknown"
console.log(getUserCity(null));             // "Unknown"

// ----------------------------------------------------------------------------
// Exercise 3: noImplicitAny — Typed parameters
// ----------------------------------------------------------------------------
// Key insight: Under noImplicitAny, every parameter that can't be inferred
// must have an explicit type annotation. The return type is inferred as
// `number` from the implementation, but being explicit is good practice.

function sumAll(numbers: number[]): number {
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

console.log("\n=== Exercise 3: noImplicitAny — Typed parameters ===");
console.log(sumAll([1, 2, 3, 4])); // 10

// ----------------------------------------------------------------------------
// Exercise 4: strictPropertyInitialization — Class properties
// ----------------------------------------------------------------------------
// Key insight: Every class property must be initialized in the constructor
// or at the declaration site. Optional properties use `?` to allow undefined.

class Employee {
  id: number;
  name: string;
  email?: string;          // Optional — may be undefined
  department: string;

  constructor(id: number, name: string, department: string) {
    this.id = id;
    this.name = name;
    this.department = department;
  }
}

console.log("\n=== Exercise 4: strictPropertyInitialization ===");
const emp = new Employee(1, "Alice", "Engineering");
console.log(emp); // Employee { id: 1, name: 'Alice', email: undefined, department: 'Engineering' }

// ----------------------------------------------------------------------------
// Exercise 5: useUnknownInCatchVariables — Safe error handling
// ----------------------------------------------------------------------------
// Key insight: Under useUnknownInCatchVariables, the catch variable is `unknown`.
// You must narrow it (e.g., with instanceof) before accessing properties.

function safeParseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: String(err) };
  }
}

console.log("\n=== Exercise 5: useUnknownInCatchVariables ===");
console.log(safeParseJson('{"a":1}'));   // { a: 1 }
console.log(safeParseJson('invalid'));   // { error: "..." }

// ----------------------------------------------------------------------------
// Exercise 6: strictFunctionTypes — Callback types
// ----------------------------------------------------------------------------
// Key insight: Under strictFunctionTypes, a callback typed as
// `(input: string) => string` cannot accept a function with a wider parameter
// type. The implementation simply maps over the array.

type StringProcessor = (input: string) => string;

function processItems(items: string[], processor: StringProcessor): string[] {
  return items.map(processor);
}

console.log("\n=== Exercise 6: strictFunctionTypes — Callback types ===");
const upper: StringProcessor = (s: string) => s.toUpperCase();
console.log(processItems(["hello", "world"], upper)); // ["HELLO", "WORLD"]

// This would error under strictFunctionTypes:
// const badProcessor = (input: unknown) => String(input);
// processItems(["hello"], badProcessor); // Error

// ----------------------------------------------------------------------------
// Exercise 7: strictBindCallApply — Typed bind
// ----------------------------------------------------------------------------
// Key insight: Under strictBindCallApply, `.bind()` preserves the types of
// the original function. Binding the first argument to 2 produces a function
// that takes one number and returns a number.

function multiply(a: number, b: number): number {
  return a * b;
}

const double = multiply.bind(null, 2);

console.log("\n=== Exercise 7: strictBindCallApply — Typed bind ===");
console.log(double(5));  // 10
console.log(double(12)); // 24

// This would error:
// double("5"); // Error: Argument of type 'string' is not assignable to 'number'

// ----------------------------------------------------------------------------
// Exercise 8: noImplicitThis — Explicit this parameter
// ----------------------------------------------------------------------------
// Key insight: Arrow functions capture `this` from their enclosing scope,
// avoiding the implicit `this` problem. Alternatively, you can use a closure
// pattern that doesn't rely on `this` at all.

function createCounter(initial: number) {
  let count = initial;
  return {
    increment: () => {
      count++;
    },
    getCount: () => count,
  };
}

console.log("\n=== Exercise 8: noImplicitThis ===");
const counter = createCounter(0);
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2

// ----------------------------------------------------------------------------
// Exercise 9: noUncheckedIndexedAccess — Safe array access
// ----------------------------------------------------------------------------
// Key insight: Under noUncheckedIndexedAccess, array index access returns
// `T | undefined`. You must check for undefined before using the value.

function firstElement<T>(arr: T[], defaultValue: T): T {
  const first = arr[0];
  return first !== undefined ? first : defaultValue;
}

console.log("\n=== Exercise 9: noUncheckedIndexedAccess ===");
console.log(firstElement([10, 20, 30], 0));   // 10
console.log(firstElement([], 0));              // 0
console.log(firstElement(["a", "b"], "x"));   // "a"

// Note: This implementation treats an actual `undefined` element the same as
// a missing element. For arrays that legitimately contain `undefined`, you'd
// need to check `arr.length > 0` instead.

// ----------------------------------------------------------------------------
// Exercise 10: noImplicitReturns — All paths return
// ----------------------------------------------------------------------------
// Key insight: Under noImplicitReturns, every code path through a function
// with a return type must explicitly return a value. Using if/else chains
// or a final return ensures this.

function describeScore(score: number): string {
  if (score >= 90) {
    return "Excellent";
  } else if (score >= 70) {
    return "Good";
  } else if (score >= 50) {
    return "Average";
  } else {
    return "Needs Improvement";
  }
}

console.log("\n=== Exercise 10: noImplicitReturns ===");
console.log(describeScore(95));  // "Excellent"
console.log(describeScore(75));  // "Good"
console.log(describeScore(55));  // "Average"
console.log(describeScore(30));  // "Needs Improvement"

// ----------------------------------------------------------------------------
// Exercise 11: noFallthroughCasesInSwitch — Proper switch
// ----------------------------------------------------------------------------
// Key insight: Under noFallthroughCasesInSwitch, every non-empty case must
// end with break, return, or throw. Empty cases (for grouping) are allowed.

function httpStatusText(code: number): string {
  switch (code) {
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 400:
      return "Bad Request";
    case 404:
      return "Not Found";
    case 500:
      return "Internal Server Error";
    default:
      return "Unknown";
  }
}

console.log("\n=== Exercise 11: noFallthroughCasesInSwitch ===");
console.log(httpStatusText(200)); // "OK"
console.log(httpStatusText(404)); // "Not Found"
console.log(httpStatusText(999)); // "Unknown"

// ----------------------------------------------------------------------------
// Exercise 12: noImplicitOverride — Override keyword
// ----------------------------------------------------------------------------
// Key insight: Under noImplicitOverride, any method that overrides a base
// class method must be marked with the `override` keyword. This makes the
// override relationship explicit and catches errors when base methods are
// renamed.

class Animal {
  speak(): string {
    return "...";
  }
  move(): string {
    return "moving";
  }
}

class Dog extends Animal {
  override speak(): string {
    return "Woof!";
  }
}

console.log("\n=== Exercise 12: noImplicitOverride ===");
const dog = new Dog();
console.log(dog.speak()); // "Woof!"
console.log(dog.move());  // "moving"

// This would error: overriding a method that doesn't exist in base
// class Cat extends Animal {
//   override purr(): string { return "purr"; }
//   // Error: This member cannot have an 'override' modifier because
//   // it is not declared in the base class 'Animal'.
// }

// ----------------------------------------------------------------------------
// Exercise 13: exactOptionalPropertyTypes — Missing vs undefined
// ----------------------------------------------------------------------------
// Key insight: Under exactOptionalPropertyTypes, an optional property `x?: T`
// means the property can be ABSENT, but if present it must be of type T.
// Setting it to `undefined` explicitly is NOT allowed.

interface Profile {
  name: string;
  nickname?: string;
}

const profileWithoutNickname: Profile = { name: "Alice" };
const profileWithNickname: Profile = { name: "Bob", nickname: "Bobby" };

console.log("\n=== Exercise 13: exactOptionalPropertyTypes ===");
console.log(profileWithoutNickname); // { name: "Alice" }
console.log(profileWithNickname);    // { name: "Bob", nickname: "Bobby" }

// This would error under exactOptionalPropertyTypes:
// const bad: Profile = { name: "Eve", nickname: undefined };
// Error: Type 'undefined' is not assignable to type 'string'.

// ----------------------------------------------------------------------------
// Exercise 14: Strict mode — Type-safe Map wrapper
// ----------------------------------------------------------------------------
// Key insight: Combining multiple strict checks — property initialization,
// null checks on Map.get(), and proper generics. The private map must be
// initialized at the declaration site or in the constructor.

class TypedMap<T> {
  private map: Map<string, T> = new Map();

  get(key: string): T | undefined {
    return this.map.get(key);
  }

  getOrDefault(key: string, defaultValue: T): T {
    const value = this.map.get(key);
    return value !== undefined ? value : defaultValue;
  }

  set(key: string, value: T): void {
    this.map.set(key, value);
  }
}

console.log("\n=== Exercise 14: Type-safe Map wrapper ===");
const m = new TypedMap<number>();
m.set("a", 1);
console.log(m.get("a"));              // 1
console.log(m.get("b"));              // undefined
console.log(m.getOrDefault("b", 0));  // 0

// ----------------------------------------------------------------------------
// Exercise 15: Migration — Convert loose function to strict
// ----------------------------------------------------------------------------
// Key insight: The loose version has multiple strict violations:
// - No parameter types (noImplicitAny)
// - Implicit return of undefined when url is falsy (noImplicitReturns)
// - Accessing err.message on unknown catch variable (useUnknownInCatchVariables)
// - Nullable return (strictNullChecks)
//
// The strict version explicitly types everything, ensures all paths return
// a value, and narrows the catch variable.

interface FetchOptions {
  body?: string;
  transform?: (data: FetchResult) => FetchResult;
}

interface FetchResult {
  url: string;
  data: string | undefined;
  timestamp: number;
}

function fetchData(url: string | null, options?: FetchOptions): FetchResult | null {
  try {
    if (!url) {
      return null;  // Explicit null instead of implicit undefined
    }
    const result: FetchResult = {
      url,
      data: options?.body,
      timestamp: Date.now(),
    };
    if (options?.transform) {
      return options.transform(result);
    }
    return result;
  } catch (err: unknown) {
    // Narrow unknown to Error before accessing .message
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(String(err));
    }
    return null;
  }
}

console.log("\n=== Exercise 15: Migration to strict ===");
console.log(fetchData("https://example.com"));
console.log(fetchData(null));
console.log(fetchData("https://example.com", { body: "hello" }));
console.log(fetchData("https://example.com", {
  transform: (data) => ({ ...data, url: data.url + "/transformed" }),
}));

// ============================================================================
// Runner Summary
// ============================================================================

console.log("\n=== All solutions executed successfully ===");
console.log("Strict flags demonstrated:");
console.log("  1. strictNullChecks");
console.log("  2. strictNullChecks (optional chaining)");
console.log("  3. noImplicitAny");
console.log("  4. strictPropertyInitialization");
console.log("  5. useUnknownInCatchVariables");
console.log("  6. strictFunctionTypes");
console.log("  7. strictBindCallApply");
console.log("  8. noImplicitThis");
console.log("  9. noUncheckedIndexedAccess");
console.log(" 10. noImplicitReturns");
console.log(" 11. noFallthroughCasesInSwitch");
console.log(" 12. noImplicitOverride");
console.log(" 13. exactOptionalPropertyTypes");
console.log(" 14. Combined strict (TypedMap)");
console.log(" 15. Migration from loose to strict");
