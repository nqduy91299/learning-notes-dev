// ============================================================================
// 04-enums: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/04-enums/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Instructions:
//   - Predict-output → write your answer in the PREDICT comment, then uncomment
//     the console.log to verify.
//   - Fix-the-bug    → uncomment the code, fix the error, make it compile.
//   - Implement      → write the code to satisfy the requirements & tests.
//
// All test code is commented out. Uncomment to verify your solutions.
// Do NOT use `any`.
// ============================================================================

// ============================================================================
// Exercise 1 — Predict the Output (Numeric Auto-Increment)
// ============================================================================
// What does each console.log print?

enum HttpMethod {
  Get,
  Post,
  Put,
  Delete,
}

// PREDICT:
// console.log(HttpMethod.Get)     → ???
// console.log(HttpMethod.Delete)  → ???
// console.log(HttpMethod[2])      → ???

// Uncomment to verify:
// console.log("Ex1:", HttpMethod.Get, HttpMethod.Delete, HttpMethod[2]);

// ============================================================================
// Exercise 2 — Predict the Output (Custom Initializer)
// ============================================================================

enum Planet {
  Mercury = 1,
  Venus,
  Earth,
  Mars = 10,
  Jupiter,
}

// PREDICT:
// console.log(Planet.Earth)    → ???
// console.log(Planet.Jupiter)  → ???

// Uncomment to verify:
// console.log("Ex2:", Planet.Earth, Planet.Jupiter);

// ============================================================================
// Exercise 3 — Predict the Output (String Enum — No Reverse Mapping)
// ============================================================================

enum Fruit {
  Apple  = "APPLE",
  Banana = "BANANA",
  Cherry = "CHERRY",
}

// PREDICT:
// console.log(Fruit.Apple)        → ???
// console.log(Fruit["APPLE"])     → ???   (hint: string enums)
// console.log(Object.keys(Fruit)) → ???

// Uncomment to verify:
// console.log("Ex3a:", Fruit.Apple);
// console.log("Ex3b:", (Fruit as Record<string, string>)["APPLE"]);
// console.log("Ex3c:", Object.keys(Fruit));

// ============================================================================
// Exercise 4 — Predict the Output (Numeric Enum Object.keys)
// ============================================================================

enum Size {
  Small,
  Medium,
  Large,
}

// PREDICT:
// console.log(Object.keys(Size))   → ???
// console.log(Object.values(Size)) → ???

// Uncomment to verify:
// console.log("Ex4 keys:", Object.keys(Size));
// console.log("Ex4 vals:", Object.values(Size));

// ============================================================================
// Exercise 5 — Predict the Output (Reverse Mapping)
// ============================================================================

enum Animal {
  Dog = 5,
  Cat = 10,
}

// PREDICT:
// console.log(Animal[5])  → ???
// console.log(Animal[10]) → ???
// console.log(Animal[7])  → ???

// Uncomment to verify:
// console.log("Ex5:", Animal[5], Animal[10], Animal[7]);

// ============================================================================
// Exercise 6 — Predict the Output (const enum inlining)
// ============================================================================

const enum Inline {
  A = 10,
  B = 20,
  C = A + B,
}

const inlineResult = Inline.C;

// PREDICT:
// console.log(inlineResult)      → ???
// console.log(typeof Inline)     → ??? (trick question — will this even work?)

// Uncomment to verify:
// console.log("Ex6:", inlineResult);
// Note: `typeof Inline` would error at runtime because const enums have no
// runtime object. The line below is intentionally commented out.
// console.log(typeof Inline);

// ============================================================================
// Exercise 7 — Fix the Bug (String Enum Assignability)
// ============================================================================
// The code below has a type error. Fix it so it compiles and `theme` has the
// value `"DARK"`.

// enum Theme {
//   Light = "LIGHT",
//   Dark  = "DARK",
// }
//
// const theme: Theme = "DARK";
// console.log("Ex7:", theme);

// ============================================================================
// Exercise 8 — Fix the Bug (Missing Initializer in String Enum)
// ============================================================================
// Fix the enum so it compiles. Every member should have a meaningful string
// value matching its name in UPPER_SNAKE_CASE.

// enum LogLevel {
//   Debug = "DEBUG",
//   Info  = "INFO",
//   Warn,
//   Error,
// }
//
// console.log("Ex8:", LogLevel.Warn, LogLevel.Error);

// ============================================================================
// Exercise 9 — Fix the Bug (Cross-Enum Comparison)
// ============================================================================
// The comparison below causes a compile error. Fix it so the function correctly
// returns true when the status represents "active" from either source.

// enum SystemStatus {
//   Active,
//   Inactive,
// }
//
// enum UserStatus {
//   Active,
//   Inactive,
// }
//
// function isActive(sys: SystemStatus, usr: UserStatus): boolean {
//   return sys === SystemStatus.Active && usr === UserStatus.Active;
// }
//
// console.log("Ex9:", isActive(SystemStatus.Active, UserStatus.Active));

// ============================================================================
// Exercise 10 — Implement: Direction Enum and Move Function
// ============================================================================
// 1. Create a string enum `Direction` with members: Up, Down, Left, Right
//    (values "UP", "DOWN", "LEFT", "RIGHT").
// 2. Implement `move(pos, dir)` that returns a new position after moving 1 step.
//    Position is { x: number; y: number }.
//    Up → y+1, Down → y-1, Left → x-1, Right → x+1.

// type Position = { x: number; y: number };
// Your code here...

// Tests:
// console.log("Ex10a:", move({ x: 0, y: 0 }, Direction.Up));    // { x: 0, y: 1 }
// console.log("Ex10b:", move({ x: 3, y: 2 }, Direction.Left));  // { x: 2, y: 2 }

// ============================================================================
// Exercise 11 — Implement: Permission Flags
// ============================================================================
// 1. Create a numeric enum `Permission` with bitwise flag members:
//    None=0, Read=1, Write=2, Execute=4, All=7.
// 2. Implement `hasPermission(userPerms: number, check: Permission): boolean`.
// 3. Implement `grantPermission(userPerms: number, perm: Permission): number`.
// 4. Implement `revokePermission(userPerms: number, perm: Permission): number`.

// Your code here...

// Tests:
// const perms = Permission.Read | Permission.Write; // 3
// console.log("Ex11a:", hasPermission(perms, Permission.Read));     // true
// console.log("Ex11b:", hasPermission(perms, Permission.Execute));  // false
// console.log("Ex11c:", grantPermission(perms, Permission.Execute)); // 7
// console.log("Ex11d:", revokePermission(perms, Permission.Write));  // 1

// ============================================================================
// Exercise 12 — Implement: Exhaustive Switch with assertNever
// ============================================================================
// 1. Create a numeric enum `Shape` with Circle, Square, Triangle.
// 2. Implement `describeShape(shape: Shape): string` using a switch with
//    exhaustive checking via an `assertNever` helper.
//    Circle → "A round shape", Square → "A four-sided shape",
//    Triangle → "A three-sided shape".

// Your code here...

// Tests:
// console.log("Ex12a:", describeShape(Shape.Circle));    // "A round shape"
// console.log("Ex12b:", describeShape(Shape.Triangle));  // "A three-sided shape"

// ============================================================================
// Exercise 13 — Implement: Enum Iteration Helper
// ============================================================================
// Write a function `getNumericEnumNames` that takes a numeric enum object and
// returns only the string keys (excluding the reverse-mapped numeric keys).
// Signature: (enumObj: Record<string, string | number>) => string[]

// Your code here...

// Tests:
// enum Priority { Low, Medium, High, Critical }
// console.log("Ex13:", getNumericEnumNames(Priority));
// // ["Low", "Medium", "High", "Critical"]

// ============================================================================
// Exercise 14 — Implement: String Enum to Union Type Validator
// ============================================================================
// Given the enum below, implement `isValidColor(value: string): value is Color`
// that checks whether an arbitrary string is a valid Color enum value.

// enum Color {
//   Red   = "RED",
//   Green = "GREEN",
//   Blue  = "BLUE",
// }
//
// function isValidColor(value: string): value is Color {
//   // Your code here...
// }

// Tests:
// console.log("Ex14a:", isValidColor("RED"));    // true
// console.log("Ex14b:", isValidColor("PURPLE")); // false
// if (isValidColor("GREEN")) {
//   const c: Color = "GREEN" as Color;
//   console.log("Ex14c:", c);
// }

// ============================================================================
// Exercise 15 — Implement: Config Builder with Enum Keys
// ============================================================================
// 1. Create a string enum `ConfigKey` with members:
//    ApiUrl = "API_URL", Timeout = "TIMEOUT", RetryCount = "RETRY_COUNT"
// 2. Create a type `Config` that maps every ConfigKey to a string value.
//    (Hint: use a mapped type with `in`.)
// 3. Implement a class `ConfigBuilder` with:
//    - `set(key: ConfigKey, value: string): this`
//    - `build(): Config` (throws if any key is missing)

// Your code here...

// Tests:
// const builder = new ConfigBuilder();
// const config = builder
//   .set(ConfigKey.ApiUrl, "https://api.example.com")
//   .set(ConfigKey.Timeout, "5000")
//   .set(ConfigKey.RetryCount, "3")
//   .build();
// console.log("Ex15:", config);
// // { API_URL: "https://api.example.com", TIMEOUT: "5000", RETRY_COUNT: "3" }

export {};
