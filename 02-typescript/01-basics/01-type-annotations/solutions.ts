// ============================================================================
// 01-type-annotations: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/01-type-annotations/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Complete solutions with explanations
// ============================================================================


// ─── Exercise 1: Predict the Output (Primitive Inference) ───────────────────

const ex1_a = 42;        // Type: 42 (literal type — const narrows to exact value)
const ex1_b = "hello";   // Type: "hello" (literal type)
let ex1_c = true;        // Type: boolean (let widens to the base type)
let ex1_d = 3.14;        // Type: number (let widens to the base type)

console.log("Exercise 1:");
console.log(typeof ex1_a, typeof ex1_b, typeof ex1_c, typeof ex1_d);
console.log(ex1_a, ex1_b, ex1_c, ex1_d);
// Explanation:
// `const` declarations with literal values get literal types (42, "hello").
// `let` declarations widen to the base type (boolean, number) because
// the variable can be reassigned.
// Runtime typeof returns: "number", "string", "boolean", "number"
// Values: 42, "hello", true, 3.14


// ─── Exercise 2: Predict the Output (Array Inference) ───────────────────────

const ex2_a = [1, 2, 3];              // Type: number[]
const ex2_b = [1, "two", true];       // Type: (string | number | boolean)[]
const ex2_c = [] as number[];         // Type: number[]
const ex2_d = [1, 2, 3] as const;    // Type: readonly [1, 2, 3]

console.log("\nExercise 2:");
console.log(ex2_a.length, ex2_b.length, ex2_c.length, ex2_d.length);
// Output: 3 3 0 3
// Explanation:
// ex2_a: inferred as number[] — homogeneous array.
// ex2_b: inferred as (string | number | boolean)[] — union of all element types.
// ex2_c: explicitly typed as number[], currently empty.
// ex2_d: `as const` produces a readonly tuple with literal types readonly [1, 2, 3].
// The length values are simply the number of elements at initialization.


// ─── Exercise 3: Predict the Output (Literal Types) ────────────────────────

const ex3_method = "GET";     // Type: "GET" (literal — const)
let ex3_status = "active";    // Type: string (widened — let)
const ex3_port = 8080;        // Type: 8080 (literal — const)
let ex3_retries = 3;          // Type: number (widened — let)

console.log("\nExercise 3:");
console.log(ex3_method, ex3_status, ex3_port, ex3_retries);
// Output: GET active 8080 3
// Explanation:
// const + literal value = literal type ("GET", 8080).
// let + literal value = widened type (string, number).
// Runtime values are identical regardless of the type-level difference.


// ─── Exercise 4: Predict the Output (void vs undefined) ────────────────────

type VoidCallback = () => void;

const ex4_fn: VoidCallback = () => {
  return 42;
};

const ex4_result = ex4_fn();

console.log("\nExercise 4:");
console.log(ex4_result);
console.log(typeof ex4_result);
// Output: 42
//         number
// Explanation:
// When a function type has a `void` return in a callback position (like a type alias),
// implementations are allowed to return any value — the return is just "ignored"
// at the type level. The compile-time type of ex4_result is `void`, but at runtime
// the value 42 is actually returned and accessible. This is a deliberate design
// choice to allow callbacks like Array.forEach to accept functions that return values.


// ─── Exercise 5: Predict the Output (unknown narrowing) ────────────────────

function ex5_process(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return "unknown value";
}

console.log("\nExercise 5:");
console.log(ex5_process("hello"));    // "HELLO"
console.log(ex5_process(3.14159));    // "3.14"
console.log(ex5_process(true));       // "unknown value"
// Explanation:
// "hello" is a string → toUpperCase() → "HELLO"
// 3.14159 is a number → toFixed(2) → "3.14"
// true is a boolean → neither string nor number check passes → "unknown value"
// The `unknown` type forces us to narrow before using the value, which is
// exactly the type-safe behavior we want.


// ─── Exercise 6: Predict the Output (Tuple Access) ─────────────────────────

const ex6_tuple: [string, number, boolean] = ["Alice", 30, true];
const ex6_name = ex6_tuple[0];        // Type: string
const ex6_age = ex6_tuple[1];         // Type: number
const ex6_rest = ex6_tuple.slice(1);  // Type: (string | number | boolean)[]

console.log("\nExercise 6:");
console.log(ex6_name, typeof ex6_name);   // "Alice" "string"
console.log(ex6_age, typeof ex6_age);     // 30 "number"
console.log(ex6_rest);                     // [30, true]
// Explanation:
// Indexing a tuple with a literal index gives the exact positional type.
// ex6_tuple[0] → string, ex6_tuple[1] → number.
// .slice() returns a regular array, not a tuple, so the type is the union
// of all element types: (string | number | boolean)[].
// At runtime, slice(1) returns [30, true].


// ─── Exercise 7: Fix the Bug (Missing Type Annotations) ────────────────────

// Explanation:
// The function already has parameter annotations. The fix is to add an explicit
// return type annotation. While inference handles this correctly, the exercise
// asks for explicit annotation as good practice.

interface Ex7_User {
  name: string;
  age: number;
  email: string;
  createdAt: Date;
}

function ex7_createUser(name: string, age: number, email: string): Ex7_User {
  return {
    name,
    age,
    email,
    createdAt: new Date(),
  };
}

console.log("\nExercise 7:");
const ex7_user = ex7_createUser("Alice", 30, "alice@example.com");
console.log(ex7_user);
// Explanation:
// Adding a return type annotation serves as documentation and catches
// errors if the implementation drifts from the intended shape. If we
// later forget to include `createdAt`, the compiler will catch it.


// ─── Exercise 8: Fix the Bug (Strict Null Checks) ──────────────────────────

function ex8_getFirstChar(input: string | null): string {
  if (input === null || input.length === 0) {
    return "";
  }
  return input.charAt(0);
}

console.log("\nExercise 8:");
console.log(ex8_getFirstChar("hello"));  // "h"
console.log(ex8_getFirstChar(null));     // ""
console.log(ex8_getFirstChar(""));       // ""
// Explanation:
// Under strictNullChecks, `input` could be `null`, so we cannot call
// methods on it without checking first. The null check narrows the type
// to `string`, making `.charAt(0)` safe. We also handle empty strings
// as an edge case, returning "" instead of trying charAt on an empty string.


// ─── Exercise 9: Fix the Bug (Type Assertion Misuse) ────────────────────────

interface Ex9_Config {
  host: string;
  port: number;
  debug: boolean;
}

// Explanation:
// The bug was using `as Ex9_Config` to force an incomplete object to pass
// type checking. The assertion hides the missing `debug` property.
// The fix is to use a type annotation (`: Ex9_Config`) instead of an assertion,
// which forces you to provide all required properties.

const ex9_config: Ex9_Config = {
  host: "localhost",
  port: 3000,
  debug: false,
};

console.log("\nExercise 9:");
console.log(ex9_config.debug); // false
// Explanation:
// Type annotations (`const x: T = {...}`) enforce that the object satisfies
// all required properties. Type assertions (`{...} as T`) bypass this check.
// Always prefer annotations over assertions when constructing objects.


// ─── Exercise 10: Fix the Bug (Literal Type Widening) ───────────────────────

function ex10_setDirection(direction: "north" | "south" | "east" | "west"): string {
  return `Heading ${direction}`;
}

// Fix 1: Use `as const` to prevent widening
const ex10_dir_fix1 = "north" as const;

// Fix 2: Use an explicit literal type annotation
const ex10_dir_fix2: "north" | "south" | "east" | "west" = "north";

// Fix 3 (bonus): Use const declaration (const already narrows to literal)
const ex10_dir_fix3 = "north";

console.log("\nExercise 10:");
console.log(ex10_setDirection(ex10_dir_fix1)); // "Heading north"
console.log(ex10_setDirection(ex10_dir_fix2)); // "Heading north"
console.log(ex10_setDirection(ex10_dir_fix3)); // "Heading north"
// Explanation:
// `let x = "north"` infers type `string`, which is too wide for the parameter.
// Fix 1: `as const` narrows to the literal type "north".
// Fix 2: Explicit annotation restricts to the union.
// Fix 3: `const` declaration already narrows to literal "north" (simplest fix).


// ─── Exercise 11: Implement (Typed Function) ───────────────────────────────

function ex11_sum(numbers: readonly number[]): number {
  let total: number = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

console.log("\nExercise 11:");
console.log(ex11_sum([1, 2, 3, 4, 5]));  // 15
console.log(ex11_sum([]));                 // 0
console.log(ex11_sum([10, -5, 3]));        // 8
// Explanation:
// The parameter is `readonly number[]`, meaning the function promises not to
// mutate the input array. The implementation uses a simple for-of loop.
// `reduce` would also work: numbers.reduce((a, b) => a + b, 0)


// ─── Exercise 12: Implement (Object Type) ──────────────────────────────────

type Ex12_Product = {
  readonly id: number;
  name: string;
  price: number;
  tags: readonly string[];
  description?: string;
};

let ex12_nextId = 1;

function ex12_createProduct(
  name: string,
  price: number,
  description?: string
): Ex12_Product {
  const product: Ex12_Product = {
    id: ex12_nextId++,
    name,
    price,
    tags: [],
    ...(description !== undefined ? { description } : {}),
  };
  return product;
}

console.log("\nExercise 12:");
console.log(ex12_createProduct("Widget", 9.99));
console.log(ex12_createProduct("Gadget", 19.99, "A cool gadget"));
// Explanation:
// - `readonly id` prevents external reassignment of the id after creation.
// - `tags: readonly string[]` prevents mutations like push/pop on the array.
// - `description?` is optional — we only include it if provided.
// - We use a module-level counter for auto-incrementing IDs.


// ─── Exercise 13: Implement (Tuple Return) ─────────────────────────────────

type Ex13_DivResult = [quotient: number, remainder: number];

function ex13_divide(dividend: number, divisor: number): Ex13_DivResult {
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return [quotient, remainder];
}

console.log("\nExercise 13:");
console.log(ex13_divide(17, 5));  // [3, 2]
console.log(ex13_divide(10, 3));  // [3, 1]
console.log(ex13_divide(8, 4));   // [2, 0]
// Explanation:
// Labeled tuples `[quotient: number, remainder: number]` provide
// documentation for what each position means, but have no runtime effect.
// Math.floor gives integer division, % gives the remainder.


// ─── Exercise 14: Implement (Type Guard with unknown) ───────────────────────

function ex14_parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
}

console.log("\nExercise 14:");
console.log(ex14_parseNumber(42));         // 42
console.log(ex14_parseNumber("3.14"));     // 3.14
console.log(ex14_parseNumber("hello"));    // null
console.log(ex14_parseNumber(true));       // null
console.log(ex14_parseNumber(""));         // null
// Explanation:
// We use `typeof` to narrow `unknown` before operating on it.
// For strings, we first check it's non-empty (after trimming), then
// parse with Number(). Number("") returns 0, which would be incorrect,
// so we exclude empty strings. Number.isNaN catches unparseable strings.
// We never use `any` — only `unknown` with proper narrowing.


// ─── Exercise 15: Implement (const Assertion and typeof) ────────────────────

const EX15_ROLES = ["admin", "editor", "viewer"] as const;

// Explanation:
// `typeof EX15_ROLES` gives `readonly ["admin", "editor", "viewer"]`.
// Indexing with `[number]` extracts the union of all element types:
// "admin" | "editor" | "viewer".
type Ex15_Role = (typeof EX15_ROLES)[number];

function ex15_hasPermission(role: Ex15_Role, action: string): boolean {
  switch (role) {
    case "admin":
      return true;
    case "editor":
      return action === "read" || action === "write";
    case "viewer":
      return action === "read";
    default:
      return false;
  }
}

console.log("\nExercise 15:");
console.log(ex15_hasPermission("admin", "delete"));  // true
console.log(ex15_hasPermission("editor", "write"));  // true
console.log(ex15_hasPermission("editor", "delete")); // false
console.log(ex15_hasPermission("viewer", "read"));   // true
console.log(ex15_hasPermission("viewer", "write"));  // false
// Explanation:
// `as const` on the array makes it a readonly tuple of literal types.
// `(typeof X)[number]` is the standard pattern for extracting a union
// type from a const array. This keeps the source of truth in the runtime
// array, and the type is derived from it — no duplication.


// ─── Exercise 16: Implement (Exhaustive Switch with never) ──────────────────

type Ex16_Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function ex16_describeShape(shape: Ex16_Shape): string {
  switch (shape.kind) {
    case "circle":
      return `Circle with radius ${shape.radius}`;
    case "rectangle":
      return `Rectangle ${shape.width}x${shape.height}`;
    case "triangle":
      return `Triangle with base ${shape.base} and height ${shape.height}`;
    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

console.log("\nExercise 16:");
console.log(ex16_describeShape({ kind: "circle", radius: 5 }));
console.log(ex16_describeShape({ kind: "rectangle", width: 10, height: 20 }));
console.log(ex16_describeShape({ kind: "triangle", base: 6, height: 8 }));
// Output:
// Circle with radius 5
// Rectangle 10x20
// Triangle with base 6 and height 8
// Explanation:
// The `never` assignment in the default case ensures exhaustiveness.
// If a new shape kind is added to Ex16_Shape but not handled in the switch,
// the `shape` variable will NOT be `never` in the default branch, causing
// a compile error. This is a common pattern for exhaustive discriminated unions.


// ─── Exercise 17: Implement (Function Types and Callbacks) ──────────────────

type Ex17_Transformer<T, U> = (item: T, index: number) => U;

function ex17_mapArray<T, U>(
  items: readonly T[],
  transformer: Ex17_Transformer<T, U>
): U[] {
  const result: U[] = [];
  for (let i = 0; i < items.length; i++) {
    result.push(transformer(items[i], i));
  }
  return result;
}

console.log("\nExercise 17:");
console.log(ex17_mapArray([1, 2, 3], (n) => n * 2));           // [2, 4, 6]
console.log(ex17_mapArray(["a", "b"], (s, i) => `${i}:${s}`)); // ["0:a", "1:b"]
console.log(ex17_mapArray([], (x) => x));                       // []
// Explanation:
// The generic function `ex17_mapArray<T, U>` transforms each element of type T
// into type U using the transformer callback. TypeScript infers T and U from
// the arguments: for [1,2,3] with (n) => n*2, T=number, U=number.
// For ["a","b"] with (s,i) => `${i}:${s}`, T=string, U=string.
// Contextual typing infers the callback parameter types from Ex17_Transformer.


// ─── Exercise 18: Implement (Readonly Object and Optional Chaining) ─────────

interface Ex18_AppConfig {
  readonly server: {
    readonly host: string;
    readonly port: number;
  };
  readonly database?: {
    readonly connectionString: string;
    readonly pool?: {
      readonly min: number;
      readonly max: number;
    };
  };
  readonly features?: readonly string[];
}

function ex18_getPoolMax(config: Ex18_AppConfig): number {
  return config.database?.pool?.max ?? -1;
}

function ex18_hasFeature(config: Ex18_AppConfig, feature: string): boolean {
  return config.features?.includes(feature) ?? false;
}

console.log("\nExercise 18:");
const ex18_fullConfig: Ex18_AppConfig = {
  server: { host: "localhost", port: 3000 },
  database: {
    connectionString: "postgres://localhost/db",
    pool: { min: 2, max: 10 },
  },
  features: ["auth", "logging", "cache"],
};
const ex18_minConfig: Ex18_AppConfig = {
  server: { host: "localhost", port: 3000 },
};
console.log(ex18_getPoolMax(ex18_fullConfig));              // 10
console.log(ex18_getPoolMax(ex18_minConfig));               // -1
console.log(ex18_hasFeature(ex18_fullConfig, "auth"));      // true
console.log(ex18_hasFeature(ex18_fullConfig, "graphql"));   // false
console.log(ex18_hasFeature(ex18_minConfig, "auth"));       // false
// Explanation:
// Optional chaining (`?.`) short-circuits to `undefined` when any part of the
// chain is null/undefined. Nullish coalescing (`??`) provides the fallback.
// `config.database?.pool?.max ?? -1`:
//   - If database is undefined → undefined ?? -1 → -1
//   - If pool is undefined → undefined ?? -1 → -1
//   - If both exist → max value (10)
// `config.features?.includes(feature) ?? false`:
//   - If features is undefined → undefined ?? false → false
//   - If features exists → boolean result of includes()


// ============================================================================
// Runner Summary
// ============================================================================
console.log("\n" + "=".repeat(60));
console.log("All 18 exercises completed successfully.");
console.log("=".repeat(60));
