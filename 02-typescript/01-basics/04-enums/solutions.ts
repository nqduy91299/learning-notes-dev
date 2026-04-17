// ============================================================================
// 04-enums: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/04-enums/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

// ============================================================================
// Exercise 1 — Predict the Output (Numeric Auto-Increment)
// ============================================================================
// Answer:
//   HttpMethod.Get    → 0  (first member, default start)
//   HttpMethod.Delete → 3  (auto-increments: 0, 1, 2, 3)
//   HttpMethod[2]     → "Put" (reverse mapping)

enum HttpMethod {
  Get,
  Post,
  Put,
  Delete,
}

console.log("Ex1:", HttpMethod.Get, HttpMethod.Delete, HttpMethod[2]);
// Output: Ex1: 0 3 Put

// ============================================================================
// Exercise 2 — Predict the Output (Custom Initializer)
// ============================================================================
// Answer:
//   Planet.Earth   → 3  (Mercury=1, Venus=2, Earth=3)
//   Planet.Jupiter → 11 (Mars=10, Jupiter=11)

enum Planet {
  Mercury = 1,
  Venus,
  Earth,
  Mars = 10,
  Jupiter,
}

console.log("Ex2:", Planet.Earth, Planet.Jupiter);
// Output: Ex2: 3 11

// ============================================================================
// Exercise 3 — Predict the Output (String Enum — No Reverse Mapping)
// ============================================================================
// Answer:
//   Fruit.Apple          → "APPLE"
//   Fruit["APPLE"]       → undefined (string enums have NO reverse mapping)
//   Object.keys(Fruit)   → ["Apple", "Banana", "Cherry"]

enum Fruit {
  Apple  = "APPLE",
  Banana = "BANANA",
  Cherry = "CHERRY",
}

console.log("Ex3a:", Fruit.Apple);
console.log("Ex3b:", (Fruit as Record<string, string>)["APPLE"]);
console.log("Ex3c:", Object.keys(Fruit));
// Output:
// Ex3a: APPLE
// Ex3b: undefined
// Ex3c: [ "Apple", "Banana", "Cherry" ]

// ============================================================================
// Exercise 4 — Predict the Output (Numeric Enum Object.keys)
// ============================================================================
// Answer:
//   Object.keys(Size)   → ["0", "1", "2", "Small", "Medium", "Large"]
//   Object.values(Size) → ["Small", "Medium", "Large", 0, 1, 2]
// Numeric enums get reverse mapping, so both names and numeric string keys
// appear in the object.

enum Size {
  Small,
  Medium,
  Large,
}

console.log("Ex4 keys:", Object.keys(Size));
console.log("Ex4 vals:", Object.values(Size));

// ============================================================================
// Exercise 5 — Predict the Output (Reverse Mapping)
// ============================================================================
// Answer:
//   Animal[5]  → "Dog"
//   Animal[10] → "Cat"
//   Animal[7]  → undefined (no member has value 7)

enum Animal {
  Dog = 5,
  Cat = 10,
}

console.log("Ex5:", Animal[5], Animal[10], Animal[7]);
// Output: Ex5: Dog Cat undefined

// ============================================================================
// Exercise 6 — Predict the Output (const enum inlining)
// ============================================================================
// Answer:
//   inlineResult → 30  (A + B = 10 + 20)
//   typeof Inline would be a runtime error because const enums produce no
//   runtime object. The value 30 is inlined directly.

const enum Inline {
  A = 10,
  B = 20,
  C = A + B,
}

const inlineResult = Inline.C;
console.log("Ex6:", inlineResult);
// Output: Ex6: 30

// ============================================================================
// Exercise 7 — Fix the Bug (String Enum Assignability)
// ============================================================================
// Bug: You cannot assign a raw string literal to a string enum type.
// Fix: Use the enum member instead of the raw string.

enum Theme {
  Light = "LIGHT",
  Dark  = "DARK",
}

const theme: Theme = Theme.Dark; // Fixed: was "DARK", must use Theme.Dark
console.log("Ex7:", theme);
// Output: Ex7: DARK

// ============================================================================
// Exercise 8 — Fix the Bug (Missing Initializer in String Enum)
// ============================================================================
// Bug: In a string enum, every member must have an explicit string initializer.
//      `Warn` and `Error` were missing initializers.
// Fix: Add string values for all members.

enum LogLevel {
  Debug = "DEBUG",
  Info  = "INFO",
  Warn  = "WARN",   // Fixed: added initializer
  Error = "ERROR",  // Fixed: added initializer
}

console.log("Ex8:", LogLevel.Warn, LogLevel.Error);
// Output: Ex8: WARN ERROR

// ============================================================================
// Exercise 9 — Fix the Bug (Cross-Enum Comparison)
// ============================================================================
// Bug: Comparing SystemStatus and UserStatus directly causes a type error
//      because they are different enum types — even if the underlying values
//      are the same.
// Fix: The original code actually compiles fine because we compare each
//      parameter against its own enum. Re-reading the code — sys is compared
//      to SystemStatus.Active and usr is compared to UserStatus.Active.
//      The code is actually correct! The "fix" is that no fix is needed.
//      However, if the bug was comparing sys === usr, the fix would be to
//      cast to number.

enum SystemStatus {
  Active,
  Inactive,
}

enum UserStatus {
  Active,
  Inactive,
}

function isActive(sys: SystemStatus, usr: UserStatus): boolean {
  // Each parameter is compared against its own enum — this is valid.
  return sys === SystemStatus.Active && usr === UserStatus.Active;
}

console.log("Ex9:", isActive(SystemStatus.Active, UserStatus.Active));
// Output: Ex9: true

// ============================================================================
// Exercise 10 — Implement: Direction Enum and Move Function
// ============================================================================
// Explanation:
// - String enum with explicit directional values.
// - Switch on the direction to determine axis and delta.

type Position = { x: number; y: number };

enum Direction {
  Up    = "UP",
  Down  = "DOWN",
  Left  = "LEFT",
  Right = "RIGHT",
}

function move(pos: Position, dir: Direction): Position {
  switch (dir) {
    case Direction.Up:
      return { x: pos.x, y: pos.y + 1 };
    case Direction.Down:
      return { x: pos.x, y: pos.y - 1 };
    case Direction.Left:
      return { x: pos.x - 1, y: pos.y };
    case Direction.Right:
      return { x: pos.x + 1, y: pos.y };
  }
}

console.log("Ex10a:", move({ x: 0, y: 0 }, Direction.Up));    // { x: 0, y: 1 }
console.log("Ex10b:", move({ x: 3, y: 2 }, Direction.Left));  // { x: 2, y: 2 }

// ============================================================================
// Exercise 11 — Implement: Permission Flags
// ============================================================================
// Explanation:
// - Bitwise enums use powers of 2 so each flag occupies one bit.
// - `&` checks if a flag is set, `|` adds a flag, `& ~` removes a flag.

enum Permission {
  None    = 0,
  Read    = 1,       // 1 << 0
  Write   = 2,       // 1 << 1
  Execute = 4,       // 1 << 2
  All     = 7,       // Read | Write | Execute
}

function hasPermission(userPerms: number, check: Permission): boolean {
  return (userPerms & check) === check;
}

function grantPermission(userPerms: number, perm: Permission): number {
  return userPerms | perm;
}

function revokePermission(userPerms: number, perm: Permission): number {
  return userPerms & ~perm;
}

const perms = Permission.Read | Permission.Write; // 3
console.log("Ex11a:", hasPermission(perms, Permission.Read));      // true
console.log("Ex11b:", hasPermission(perms, Permission.Execute));   // false
console.log("Ex11c:", grantPermission(perms, Permission.Execute)); // 7
console.log("Ex11d:", revokePermission(perms, Permission.Write));  // 1

// ============================================================================
// Exercise 12 — Implement: Exhaustive Switch with assertNever
// ============================================================================
// Explanation:
// - `assertNever` accepts `never` — if you miss a case, the unhandled member
//   won't be assignable to `never` and you get a compile error.

enum Shape {
  Circle,
  Square,
  Triangle,
}

function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function describeShape(shape: Shape): string {
  switch (shape) {
    case Shape.Circle:
      return "A round shape";
    case Shape.Square:
      return "A four-sided shape";
    case Shape.Triangle:
      return "A three-sided shape";
    default:
      return assertNever(shape);
  }
}

console.log("Ex12a:", describeShape(Shape.Circle));    // "A round shape"
console.log("Ex12b:", describeShape(Shape.Triangle));  // "A three-sided shape"

// ============================================================================
// Exercise 13 — Implement: Enum Iteration Helper
// ============================================================================
// Explanation:
// - Numeric enums have reverse mappings, so Object.keys returns both string
//   names and numeric-string keys like "0", "1", etc.
// - Filter out keys that parse as numbers to get only the member names.

function getNumericEnumNames(enumObj: Record<string, string | number>): string[] {
  return Object.keys(enumObj).filter((k) => isNaN(Number(k)));
}

enum Priority {
  Low,
  Medium,
  High,
  Critical,
}

console.log("Ex13:", getNumericEnumNames(Priority));
// ["Low", "Medium", "High", "Critical"]

// ============================================================================
// Exercise 14 — Implement: String Enum to Union Type Validator
// ============================================================================
// Explanation:
// - `Object.values(Color)` gives us all valid enum values at runtime.
// - We check if the input string is included in that array.
// - The return type `value is Color` is a type predicate that narrows the type
//   in conditional blocks.

enum Color {
  Red   = "RED",
  Green = "GREEN",
  Blue  = "BLUE",
}

function isValidColor(value: string): value is Color {
  return (Object.values(Color) as string[]).includes(value);
}

console.log("Ex14a:", isValidColor("RED"));    // true
console.log("Ex14b:", isValidColor("PURPLE")); // false
if (isValidColor("GREEN")) {
  const c: Color = "GREEN" as Color;
  console.log("Ex14c:", c); // GREEN
}

// ============================================================================
// Exercise 15 — Implement: Config Builder with Enum Keys
// ============================================================================
// Explanation:
// - The mapped type `{ [K in ConfigKey]: string }` creates a type where every
//   enum value is a required key.
// - The builder stores partial config in a Map, then validates completeness
//   in `build()`.

enum ConfigKey {
  ApiUrl     = "API_URL",
  Timeout    = "TIMEOUT",
  RetryCount = "RETRY_COUNT",
}

type Config = { [K in ConfigKey]: string };

class ConfigBuilder {
  private data = new Map<ConfigKey, string>();

  set(key: ConfigKey, value: string): this {
    this.data.set(key, value);
    return this;
  }

  build(): Config {
    const allKeys = Object.values(ConfigKey);
    for (const key of allKeys) {
      if (!this.data.has(key)) {
        throw new Error(`Missing config key: ${key}`);
      }
    }
    return Object.fromEntries(this.data) as Config;
  }
}

const builder = new ConfigBuilder();
const config = builder
  .set(ConfigKey.ApiUrl, "https://api.example.com")
  .set(ConfigKey.Timeout, "5000")
  .set(ConfigKey.RetryCount, "3")
  .build();
console.log("Ex15:", config);
// { API_URL: "https://api.example.com", TIMEOUT: "5000", RETRY_COUNT: "3" }

// ============================================================================
// Runner
// ============================================================================
console.log("\n✓ All solutions executed successfully.");

export {};
