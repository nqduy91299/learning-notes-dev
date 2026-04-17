// ============================================================================
// Template Literal Types - Solutions
// ============================================================================
// Environment: ES2022, strict mode, ESNext modules
// Run with: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// EXERCISE 1 SOLUTION: Predict the Output (Template Literal Basics)
// ============================================================================
// ClassName1 = "sm-red" | "sm-blue" | "lg-red" | "lg-blue"
// Template literals distribute across unions, producing the cross product.
// 2 sizes × 2 colors = 4 members.

type Color1 = "red" | "blue";
type Size1 = "sm" | "lg";
type ClassName1 = `${Size1}-${Color1}`;

const test1a: ClassName1 = "sm-red";
const test1b: ClassName1 = "sm-blue";
const test1c: ClassName1 = "lg-red";
const test1d: ClassName1 = "lg-blue";
// const test1e: ClassName1 = "md-red"; // Error: "md-red" not in the union

console.log("Exercise 1:", test1a, test1b, test1c, test1d);

// ============================================================================
// EXERCISE 2 SOLUTION: Predict the Output (Intrinsic String Types)
// ============================================================================
// A2 = "HELLO"           - Uppercase converts all characters
// B2 = "Hello world"     - Capitalize only uppercases the FIRST character
// C2 = "hello"           - Uncapitalize only lowercases the FIRST character
// D2 = "abc" | "def"     - Lowercase distributes across the union

type A2 = Uppercase<"hello">;
type B2 = Capitalize<"hello world">;
type C2 = Uncapitalize<"Hello">;
type D2 = Lowercase<"ABC" | "DEF">;

const a2: A2 = "HELLO";
const b2: B2 = "Hello world";  // Note: only first char is capitalized
const c2: C2 = "hello";
const d2a: D2 = "abc";
const d2b: D2 = "def";

console.log("Exercise 2:", a2, b2, c2, d2a, d2b);

// ============================================================================
// EXERCISE 3 SOLUTION: Predict the Output (Event Handler Names)
// ============================================================================
// Handlers3 = "onClick" | "onFocus" | "onBlur"
// Capitalize transforms the first letter of each union member,
// then the template literal prepends "on".

type Events3 = "click" | "focus" | "blur";
type Handlers3 = `on${Capitalize<Events3>}`;

const h3a: Handlers3 = "onClick";
const h3b: Handlers3 = "onFocus";
const h3c: Handlers3 = "onBlur";
// const h3d: Handlers3 = "onclick"; // Error: must be "onClick" (capital C)

console.log("Exercise 3:", h3a, h3b, h3c);

// ============================================================================
// EXERCISE 4 SOLUTION: Predict the Output (Pattern Matching with infer)
// ============================================================================
// R4a = "123"       - matches "user_123", infers "123"
// R4b = ""          - matches "user_", infers "" (empty string)
// R4c = never       - "admin_123" doesn't match "user_${infer Id}"
// R4d = "abc_def"   - matches "user_abc_def", infers "abc_def" (greedy match)

type ExtractId4<S extends string> =
  S extends `user_${infer Id}` ? Id : never;

type R4a = ExtractId4<"user_123">;
type R4b = ExtractId4<"user_">;
type R4c = ExtractId4<"admin_123">;
type R4d = ExtractId4<"user_abc_def">;

const r4a: R4a = "123";
const r4b: R4b = "";
// R4c is never - cannot assign a value to never
const r4d: R4d = "abc_def";

console.log("Exercise 4:", r4a, `"${r4b}"`, r4d);
console.log("  R4c is never (admin_123 doesn't match user_ prefix)");

// ============================================================================
// EXERCISE 5 SOLUTION: Predict the Output (Key Remapping)
// ============================================================================
// DataGetters5 = {
//   getName: () => string;
//   getAge: () => number;
//   getActive: () => boolean;
// }
// The `as` clause remaps each key K to `get${Capitalize<K>}`.
// `string & K` is needed because keyof can include symbol/number keys.

type Getters5<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Data5 {
  name: string;
  age: number;
  active: boolean;
}

type DataGetters5 = Getters5<Data5>;

const dg5: DataGetters5 = {
  getName: () => "Alice",
  getAge: () => 30,
  getActive: () => true,
};

console.log("Exercise 5:", dg5.getName(), dg5.getAge(), dg5.getActive());

// ============================================================================
// EXERCISE 6 SOLUTION: Fix the Bug (Template Literal Constraint)
// ============================================================================
// Bug: "10 px" has a space before the unit, which doesn't match the pattern.
// Fix: Remove the space so it becomes "10px".

type CSSValue6 = `${number}${"px" | "em" | "rem"}`;

function setWidth6(value: CSSValue6): void {
  console.log(`Setting width to ${value}`);
}

setWidth6("100px");
setWidth6("1.5em");
setWidth6("10px");  // Fixed: removed space before "px"

console.log("Exercise 6: Fixed - removed space in '10 px' -> '10px'");

// ============================================================================
// EXERCISE 7 SOLUTION: Fix the Bug (Mapped Type with Template Literal)
// ============================================================================
// Bug: `Capitalize<K>` requires K to be a string, but `keyof T` can include
// symbols and numbers. Fix: intersect K with `string` using `string & K`.

interface Config7 {
  theme: string;
  fontSize: number;
  darkMode: boolean;
}

// Fixed: K -> string & K inside Capitalize
type Setters7<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type ConfigSetters7 = Setters7<Config7>;

const cs7: ConfigSetters7 = {
  setTheme: (v: string) => console.log("theme:", v),
  setFontSize: (v: number) => console.log("fontSize:", v),
  setDarkMode: (v: boolean) => console.log("darkMode:", v),
};

cs7.setTheme("dark");
cs7.setFontSize(16);
cs7.setDarkMode(true);
console.log("Exercise 7: Fixed - used `string & K` for Capitalize constraint");

// ============================================================================
// EXERCISE 8 SOLUTION: Fix the Bug (Recursive Template Type)
// ============================================================================
// Bug: `string[]` extends `Record<string, unknown>` because arrays are objects.
// Fix: Exclude arrays by checking `T[K] extends unknown[]` first.

interface NestedData8 {
  user: {
    name: string;
    address: {
      city: string;
      zip: string;
    };
  };
  tags: string[];
}

// Fixed: added array check before the Record check
type DotPath8<T> = {
  [K in keyof T & string]: T[K] extends unknown[]
    ? K  // Arrays are treated as leaf nodes
    : T[K] extends Record<string, unknown>
      ? K | `${K}.${DotPath8<T[K]>}`
      : K;
}[keyof T & string];

type Paths8 = DotPath8<NestedData8>;

const path8a: Paths8 = "user";
const path8b: Paths8 = "user.name";
const path8c: Paths8 = "user.address";
const path8d: Paths8 = "user.address.city";
const path8e: Paths8 = "user.address.zip";
const path8f: Paths8 = "tags";

console.log("Exercise 8:", path8a, path8b, path8c, path8d, path8e, path8f);

// ============================================================================
// EXERCISE 9 SOLUTION: Implement (Basic Template Literal Type)
// ============================================================================
// ApiEndpoint must match strings starting with "/api/"

type ApiEndpoint = `/api/${string}`;

const ep9a: ApiEndpoint = "/api/users";
const ep9b: ApiEndpoint = "/api/posts/123";
// const ep9c: ApiEndpoint = "/users";     // Error
// const ep9d: ApiEndpoint = "api/users";  // Error

console.log("Exercise 9:", ep9a, ep9b);

// ============================================================================
// EXERCISE 10 SOLUTION: Implement (Event Handler Type)
// ============================================================================
// Use key remapping with `as` to create on<Key>Changed handlers.

type MakeHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Changed`]: (value: T[K]) => void;
};

interface TestObj10 {
  name: string;
  age: number;
  active: boolean;
}

type Handlers10 = MakeHandlers<TestObj10>;

const h10: Handlers10 = {
  onNameChanged: (value: string) => console.log("name:", value),
  onAgeChanged: (value: number) => console.log("age:", value),
  onActiveChanged: (value: boolean) => console.log("active:", value),
};

h10.onNameChanged("Bob");
h10.onAgeChanged(25);
h10.onActiveChanged(false);
console.log("Exercise 10: MakeHandlers working");

// ============================================================================
// EXERCISE 11 SOLUTION: Implement (Extract Route Parameters)
// ============================================================================
// Recursively match `:paramName` segments in the route string.

type ExtractParams<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : S extends `${string}:${infer Param}`
      ? Param
      : never;

type P11a = ExtractParams<"/users/:userId/posts/:postId">;
const p11a: P11a = "userId";
const p11b: P11a = "postId";

type P11b = ExtractParams<"/api/:version">;
const p11c: P11b = "version";

type P11c = ExtractParams<"/static/page">;
// P11c is never — no parameters in the route

console.log("Exercise 11:", p11a, p11b, p11c);

// ============================================================================
// EXERCISE 12 SOLUTION: Implement (Snake Case to Camel Case)
// ============================================================================
// Recursively find underscores, capitalize the next segment, and continue.

type SnakeToCamel<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamel<Tail>>}`
    : S;

type SC12a = SnakeToCamel<"hello_world">;
const sc12a: SC12a = "helloWorld";

type SC12b = SnakeToCamel<"foo_bar_baz">;
const sc12b: SC12b = "fooBarBaz";

type SC12c = SnakeToCamel<"already">;
const sc12c: SC12c = "already";

console.log("Exercise 12:", sc12a, sc12b, sc12c);

// ============================================================================
// EXERCISE 13 SOLUTION: Implement (Typed CSS Class Builder)
// ============================================================================
// Combine spacing property and size unions in a template literal.

type SpacingProperty = "p" | "m" | "px" | "py" | "mx" | "my";
type SpacingSize = "0" | "1" | "2" | "3" | "4" | "8";
type SpacingClass = `${SpacingProperty}-${SpacingSize}`;

const cls13a: SpacingClass = "p-4";
const cls13b: SpacingClass = "mx-2";
const cls13c: SpacingClass = "py-0";
const cls13d: SpacingClass = "m-8";
// const cls13e: SpacingClass = "w-4";  // Error: "w" not in SpacingProperty

console.log("Exercise 13:", cls13a, cls13b, cls13c, cls13d);
// Total members: 6 properties × 6 sizes = 36 class names

// ============================================================================
// EXERCISE 14 SOLUTION: Implement (Getter/Setter Pair Generator)
// ============================================================================
// Use two mapped types with key remapping and intersect them.

type GetterSetter<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Item14 {
  id: number;
  label: string;
}

type ItemAccess = GetterSetter<Item14>;

const ia14: ItemAccess = {
  getId: () => 1,
  setId: (_v: number) => {},
  getLabel: () => "test",
  setLabel: (_v: string) => {},
};

console.log("Exercise 14:", ia14.getId(), ia14.getLabel());

// ============================================================================
// EXERCISE 15 SOLUTION: Implement (Type-Safe Query Builder)
// ============================================================================
// Combine template literals for SQL patterns and route parameter extraction.

type Table15 = "users" | "posts" | "comments";

type SelectQuery15<T extends Table15> = `SELECT * FROM ${T}`;

type WhereQuery15<T extends Table15, Col extends string> =
  `SELECT * FROM ${T} WHERE ${Col} = ?`;

// Reuse ExtractParams from Exercise 11
type ExtractParams15<S extends string> =
  S extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams15<`/${Rest}`>
    : S extends `${string}:${infer Param}`
      ? Param
      : never;

type RouteParamMap<S extends string> = {
  [K in ExtractParams15<S>]: string;
};

const sq15: SelectQuery15<"users"> = "SELECT * FROM users";
const wq15: WhereQuery15<"posts", "id"> = "SELECT * FROM posts WHERE id = ?";

type RP15 = RouteParamMap<"/users/:userId/posts/:postId">;
const rp15: RP15 = { userId: "123", postId: "456" };

console.log("Exercise 15:", sq15, "|", wq15);
console.log("  Route params:", rp15);

// ============================================================================
// Runner
// ============================================================================

console.log("\n============================================");
console.log("All 15 exercises solved successfully!");
console.log("============================================");
console.log("\nKey takeaways:");
console.log("1. Template literals distribute across unions (cross product)");
console.log("2. Capitalize/Uppercase/Lowercase/Uncapitalize are compiler intrinsics");
console.log("3. Pattern matching with `infer` enables string parsing at type level");
console.log("4. Key remapping (`as` clause) + template literals = powerful object transforms");
console.log("5. Watch out for arrays extending Record<string, unknown> in recursive types");

export {};
