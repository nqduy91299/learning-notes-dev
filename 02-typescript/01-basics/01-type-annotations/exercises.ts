// ============================================================================
// 01-type-annotations: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/01-type-annotations/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 18 exercises covering type annotations fundamentals
// ============================================================================

// Exercise 1: Predict the Output (Primitive Inference)
// ----------------------------------------------------------------------------
// What types does TypeScript infer for each variable?
// What is printed to the console?

const ex1_a = 42;
const ex1_b = "hello";
let ex1_c = true;
let ex1_d = 3.14;

// console.log("Exercise 1:");
// console.log(typeof ex1_a, typeof ex1_b, typeof ex1_c, typeof ex1_d);
// console.log(ex1_a, ex1_b, ex1_c, ex1_d);
// Predict: What are the inferred types of ex1_a, ex1_b, ex1_c, ex1_d?
// Hint: const vs let affects literal type inference.


// Exercise 2: Predict the Output (Array Inference)
// ----------------------------------------------------------------------------
// What type does TypeScript infer for each array?

const ex2_a = [1, 2, 3];
const ex2_b = [1, "two", true];
const ex2_c = [] as number[];
const ex2_d = [1, 2, 3] as const;

// console.log("Exercise 2:");
// console.log(ex2_a.length, ex2_b.length, ex2_c.length, ex2_d.length);
// Predict: What is the inferred type of ex2_a? ex2_b? ex2_d?
// Hint: as const produces a readonly tuple with literal types.


// Exercise 3: Predict the Output (Literal Types)
// ----------------------------------------------------------------------------
// What happens with literal type widening?

const ex3_method = "GET";
let ex3_status = "active";
const ex3_port = 8080;
let ex3_retries = 3;

// console.log("Exercise 3:");
// console.log(ex3_method, ex3_status, ex3_port, ex3_retries);
// Predict: What is the type of ex3_method? ex3_status? ex3_port? ex3_retries?
// Which are literal types and which are widened?


// Exercise 4: Predict the Output (void vs undefined)
// ----------------------------------------------------------------------------
// What does this code produce?

type VoidCallback = () => void;

const ex4_fn: VoidCallback = () => {
  return 42;
};

const ex4_result = ex4_fn();

// console.log("Exercise 4:");
// console.log(ex4_result);
// console.log(typeof ex4_result);
// Predict: What is ex4_result at runtime? What is its compile-time type?


// Exercise 5: Predict the Output (unknown narrowing)
// ----------------------------------------------------------------------------
// Trace the control flow.

function ex5_process(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return "unknown value";
}

// console.log("Exercise 5:");
// console.log(ex5_process("hello"));
// console.log(ex5_process(3.14159));
// console.log(ex5_process(true));
// Predict the three outputs.


// Exercise 6: Predict the Output (Tuple Access)
// ----------------------------------------------------------------------------
// What types and values do we get from tuple access?

const ex6_tuple: [string, number, boolean] = ["Alice", 30, true];
const ex6_name = ex6_tuple[0];
const ex6_age = ex6_tuple[1];
const ex6_rest = ex6_tuple.slice(1);

// console.log("Exercise 6:");
// console.log(ex6_name, typeof ex6_name);
// console.log(ex6_age, typeof ex6_age);
// console.log(ex6_rest);
// Predict: What is the type of ex6_name? ex6_age? ex6_rest?


// Exercise 7: Fix the Bug (Missing Type Annotations)
// ----------------------------------------------------------------------------
// The following function has type errors. Add proper type annotations to fix it.
// Do not change the logic.

function ex7_createUser(name: string, age: number, email: string) {
  return {
    name,
    age,
    email,
    createdAt: new Date(),
  };
}

// FIX: Add a return type annotation to the function above.
// Then uncomment the test:
// console.log("Exercise 7:");
// const ex7_user = ex7_createUser("Alice", 30, "alice@example.com");
// console.log(ex7_user);


// Exercise 8: Fix the Bug (Strict Null Checks)
// ----------------------------------------------------------------------------
// This code has errors under strictNullChecks. Fix them without using `any` or `!`.

function ex8_getFirstChar(input: string | null): string {
  // BUG: input might be null
  // return input.charAt(0);

  // FIX: Add a null check and return a default or the first char.
  return ""; // Replace this line with your fix
}

// console.log("Exercise 8:");
// console.log(ex8_getFirstChar("hello"));
// console.log(ex8_getFirstChar(null));
// console.log(ex8_getFirstChar(""));


// Exercise 9: Fix the Bug (Type Assertion Misuse)
// ----------------------------------------------------------------------------
// This code compiles but will crash at runtime. Fix it properly.

interface Ex9_Config {
  host: string;
  port: number;
  debug: boolean;
}

// BUG: The assertion hides the fact that `debug` is missing
// const ex9_config = { host: "localhost", port: 3000 } as Ex9_Config;

// FIX: Create a properly typed config object (no assertion needed)
const ex9_config: Ex9_Config = {
  host: "localhost",
  port: 3000,
  debug: false,
};

// console.log("Exercise 9:");
// console.log(ex9_config.debug);


// Exercise 10: Fix the Bug (Literal Type Widening)
// ----------------------------------------------------------------------------
// This function expects a literal type but receives a widened string.
// Fix the calling code without changing the function signature.

function ex10_setDirection(direction: "north" | "south" | "east" | "west"): string {
  return `Heading ${direction}`;
}

// BUG: `dir` is inferred as `string`, not a literal type
// let ex10_dir = "north";
// const ex10_result = ex10_setDirection(ex10_dir); // Error

// FIX: Change the declaration of ex10_dir so it works.
// Provide at least two different valid fixes.
// Fix 1:
const ex10_dir_fix1 = "north" as const;

// Fix 2:
const ex10_dir_fix2: "north" | "south" | "east" | "west" = "north";

// console.log("Exercise 10:");
// console.log(ex10_setDirection(ex10_dir_fix1));
// console.log(ex10_setDirection(ex10_dir_fix2));


// Exercise 11: Implement (Typed Function)
// ----------------------------------------------------------------------------
// Implement a function `ex11_sum` that takes a readonly array of numbers
// and returns their sum. Annotate all types explicitly.

function ex11_sum(numbers: readonly number[]): number {
  // YOUR IMPLEMENTATION HERE
  return 0; // Replace this
}

// console.log("Exercise 11:");
// console.log(ex11_sum([1, 2, 3, 4, 5]));  // Expected: 15
// console.log(ex11_sum([]));                 // Expected: 0
// console.log(ex11_sum([10, -5, 3]));        // Expected: 8


// Exercise 12: Implement (Object Type)
// ----------------------------------------------------------------------------
// Define a type `Ex12_Product` with the following shape:
//   - id: number (readonly)
//   - name: string
//   - price: number
//   - tags: readonly string[]
//   - description: string (optional)
//
// Then implement `ex12_createProduct` that accepts name, price, and optional
// description, auto-generates an id, and returns a Product with an empty tags array.

type Ex12_Product = {
  // YOUR TYPE HERE
  readonly id: number;
  name: string;
  price: number;
  tags: readonly string[];
  description?: string;
};

function ex12_createProduct(
  name: string,
  price: number,
  description?: string
): Ex12_Product {
  // YOUR IMPLEMENTATION HERE
  return { id: 0, name: "", price: 0, tags: [] }; // Replace this
}

// console.log("Exercise 12:");
// console.log(ex12_createProduct("Widget", 9.99));
// console.log(ex12_createProduct("Gadget", 19.99, "A cool gadget"));


// Exercise 13: Implement (Tuple Return)
// ----------------------------------------------------------------------------
// Implement `ex13_divide` that takes two numbers and returns a tuple of
// [quotient: number, remainder: number]. Use labeled tuple types.

type Ex13_DivResult = [quotient: number, remainder: number];

function ex13_divide(dividend: number, divisor: number): Ex13_DivResult {
  // YOUR IMPLEMENTATION HERE
  return [0, 0]; // Replace this
}

// console.log("Exercise 13:");
// console.log(ex13_divide(17, 5));  // Expected: [3, 2]
// console.log(ex13_divide(10, 3));  // Expected: [3, 1]
// console.log(ex13_divide(8, 4));   // Expected: [2, 0]


// Exercise 14: Implement (Type Guard with unknown)
// ----------------------------------------------------------------------------
// Implement `ex14_parseNumber` that takes an `unknown` value and returns:
//   - The number if the value is already a number
//   - The parsed number if the value is a string that can be parsed
//   - null otherwise
// Do not use `any`.

function ex14_parseNumber(value: unknown): number | null {
  // YOUR IMPLEMENTATION HERE
  return null; // Replace this
}

// console.log("Exercise 14:");
// console.log(ex14_parseNumber(42));         // Expected: 42
// console.log(ex14_parseNumber("3.14"));     // Expected: 3.14
// console.log(ex14_parseNumber("hello"));    // Expected: null
// console.log(ex14_parseNumber(true));       // Expected: null
// console.log(ex14_parseNumber(""));         // Expected: null


// Exercise 15: Implement (const Assertion and typeof)
// ----------------------------------------------------------------------------
// Create a configuration object using `as const`, then derive a type from it.

const EX15_ROLES = ["admin", "editor", "viewer"] as const;

// Derive a type `Ex15_Role` that equals "admin" | "editor" | "viewer"
// using typeof and indexed access types.
type Ex15_Role = (typeof EX15_ROLES)[number]; // Replace `unknown` with the correct type expression

function ex15_hasPermission(role: Ex15_Role, action: string): boolean {
  // YOUR IMPLEMENTATION HERE
  // admin can do anything, editor can "read" and "write", viewer can only "read"
  return false; // Replace this
}

// console.log("Exercise 15:");
// console.log(ex15_hasPermission("admin", "delete"));  // Expected: true
// console.log(ex15_hasPermission("editor", "write"));  // Expected: true
// console.log(ex15_hasPermission("editor", "delete")); // Expected: false
// console.log(ex15_hasPermission("viewer", "read"));   // Expected: true
// console.log(ex15_hasPermission("viewer", "write"));  // Expected: false


// Exercise 16: Implement (Exhaustive Switch with never)
// ----------------------------------------------------------------------------
// Implement `ex16_describeShape` using a switch statement.
// Use the `never` type to ensure exhaustiveness.

type Ex16_Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function ex16_describeShape(shape: Ex16_Shape): string {
  // YOUR IMPLEMENTATION HERE
  // Return a description like "Circle with radius 5"
  // Use an exhaustive switch with a `never` check in the default case.
  return ""; // Replace this
}

// console.log("Exercise 16:");
// console.log(ex16_describeShape({ kind: "circle", radius: 5 }));
// console.log(ex16_describeShape({ kind: "rectangle", width: 10, height: 20 }));
// console.log(ex16_describeShape({ kind: "triangle", base: 6, height: 8 }));


// Exercise 17: Implement (Function Types and Callbacks)
// ----------------------------------------------------------------------------
// Define a function type `Ex17_Transformer<T>` and implement `ex17_mapArray`.

type Ex17_Transformer<T, U> = (item: T, index: number) => U;

function ex17_mapArray<T, U>(
  items: readonly T[],
  transformer: Ex17_Transformer<T, U>
): U[] {
  // YOUR IMPLEMENTATION HERE
  // Do NOT use Array.prototype.map — implement with a for loop.
  return []; // Replace this
}

// console.log("Exercise 17:");
// console.log(ex17_mapArray([1, 2, 3], (n) => n * 2));           // Expected: [2, 4, 6]
// console.log(ex17_mapArray(["a", "b"], (s, i) => `${i}:${s}`)); // Expected: ["0:a", "1:b"]
// console.log(ex17_mapArray([], (x) => x));                       // Expected: []


// Exercise 18: Implement (Readonly Object and Optional Chaining)
// ----------------------------------------------------------------------------
// Implement a function that safely extracts a nested value from a config object.

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
  // Return the database pool max value, or -1 if any part of the path is missing.
  // Use optional chaining and nullish coalescing. Do not use `any` or `!`.
  return -1; // Replace this
}

function ex18_hasFeature(config: Ex18_AppConfig, feature: string): boolean {
  // Return true if the feature exists in the features array.
  // Handle the case where features is undefined.
  return false; // Replace this
}

// console.log("Exercise 18:");
// const ex18_fullConfig: Ex18_AppConfig = {
//   server: { host: "localhost", port: 3000 },
//   database: {
//     connectionString: "postgres://localhost/db",
//     pool: { min: 2, max: 10 },
//   },
//   features: ["auth", "logging", "cache"],
// };
// const ex18_minConfig: Ex18_AppConfig = {
//   server: { host: "localhost", port: 3000 },
// };
// console.log(ex18_getPoolMax(ex18_fullConfig));              // Expected: 10
// console.log(ex18_getPoolMax(ex18_minConfig));               // Expected: -1
// console.log(ex18_hasFeature(ex18_fullConfig, "auth"));      // Expected: true
// console.log(ex18_hasFeature(ex18_fullConfig, "graphql"));   // Expected: false
// console.log(ex18_hasFeature(ex18_minConfig, "auth"));       // Expected: false

console.log("All exercises loaded. Uncomment test code to run individual exercises.");
