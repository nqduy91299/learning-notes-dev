// ============================================================================
// Template Literal Types - Exercises
// ============================================================================
// Environment: ES2022, strict mode, ESNext modules
// Run with: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// EXERCISE 1: Predict the Output (Template Literal Basics)
// ============================================================================
// What type does `Greeting` resolve to?

type Color1 = "red" | "blue";
type Size1 = "sm" | "lg";
type ClassName1 = `${Size1}-${Color1}`;

// Predict: What are ALL the members of ClassName1?
// Your answer:
//
//
//

// Uncomment to test:
// const test1a: ClassName1 = "sm-red";
// const test1b: ClassName1 = "sm-blue";
// const test1c: ClassName1 = "lg-red";
// const test1d: ClassName1 = "lg-blue";
// const test1e: ClassName1 = "md-red"; // Should this error?

// ============================================================================
// EXERCISE 2: Predict the Output (Intrinsic String Types)
// ============================================================================
// What do these types resolve to?

type A2 = Uppercase<"hello">;
type B2 = Capitalize<"hello world">;
type C2 = Uncapitalize<"Hello">;
type D2 = Lowercase<"ABC" | "DEF">;

// Predict each type:
// A2 =
// B2 =
// C2 =
// D2 =

// Uncomment to test:
// const a2: A2 = "HELLO";
// const b2: B2 = "Hello world";
// const c2: C2 = "hello";
// const d2: D2 = "abc";

// ============================================================================
// EXERCISE 3: Predict the Output (Event Handler Names)
// ============================================================================
// What type does `Handlers` resolve to?

type Events3 = "click" | "focus" | "blur";
type Handlers3 = `on${Capitalize<Events3>}`;

// Predict: What are ALL the members of Handlers3?
// Your answer:
//
//

// Uncomment to test:
// const h3a: Handlers3 = "onClick";
// const h3b: Handlers3 = "onFocus";
// const h3c: Handlers3 = "onBlur";
// const h3d: Handlers3 = "onclick"; // Should this error?

// ============================================================================
// EXERCISE 4: Predict the Output (Pattern Matching with infer)
// ============================================================================

type ExtractId4<S extends string> =
  S extends `user_${infer Id}` ? Id : never;

type R4a = ExtractId4<"user_123">;
type R4b = ExtractId4<"user_">;
type R4c = ExtractId4<"admin_123">;
type R4d = ExtractId4<"user_abc_def">;

// Predict each type:
// R4a =
// R4b =
// R4c =
// R4d =

// Uncomment to test:
// const r4a: R4a = "123";
// const r4b: R4b = "";
// const r4c: R4c = never; // How do you assign never?
// const r4d: R4d = "abc_def";

// ============================================================================
// EXERCISE 5: Predict the Output (Key Remapping)
// ============================================================================

type Getters5<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Data5 {
  name: string;
  age: number;
  active: boolean;
}

type DataGetters5 = Getters5<Data5>;

// Predict: What does DataGetters5 look like?
// Your answer:
//
//

// Uncomment to test:
// const dg5: DataGetters5 = {
//   getName: () => "Alice",
//   getAge: () => 30,
//   getActive: () => true,
// };

// ============================================================================
// EXERCISE 6: Fix the Bug (Template Literal Constraint)
// ============================================================================
// This code has a type error. Fix it so it compiles.

// type CSSValue6 = `${number}${"px" | "em" | "rem"}`;
//
// function setWidth6(value: CSSValue6): void {
//   console.log(`Setting width to ${value}`);
// }
//
// // These should work:
// setWidth6("100px");
// setWidth6("1.5em");
//
// // Fix: This line has a bug - the value doesn't match the pattern
// setWidth6("10 px");  // Bug: space before unit

// ============================================================================
// EXERCISE 7: Fix the Bug (Mapped Type with Template Literal)
// ============================================================================
// The Setters type doesn't compile. Fix the key remapping.

// interface Config7 {
//   theme: string;
//   fontSize: number;
//   darkMode: boolean;
// }
//
// // Bug: K is not constrained to string for Capitalize
// type Setters7<T> = {
//   [K in keyof T as `set${Capitalize<K>}`]: (value: T[K]) => void;
// };
//
// type ConfigSetters7 = Setters7<Config7>;

// ============================================================================
// EXERCISE 8: Fix the Bug (Recursive Template Type)
// ============================================================================
// The DotPath type doesn't handle arrays properly. Fix it.

// interface NestedData8 {
//   user: {
//     name: string;
//     address: {
//       city: string;
//       zip: string;
//     };
//   };
//   tags: string[];  // This causes issues
// }
//
// // Bug: doesn't exclude array methods from being treated as nested keys
// type DotPath8<T> = {
//   [K in keyof T & string]: T[K] extends Record<string, unknown>
//     ? K | `${K}.${DotPath8<T[K]>}`
//     : K;
// }[keyof T & string];
//
// type Paths8 = DotPath8<NestedData8>;
// // Should be: "user" | "user.name" | "user.address" | "user.address.city" | "user.address.zip" | "tags"
// // But arrays mess it up

// ============================================================================
// EXERCISE 9: Implement (Basic Template Literal Type)
// ============================================================================
// Create a type `ApiEndpoint` that only accepts strings matching "/api/..."

// type ApiEndpoint = TODO;

// Uncomment to test:
// const ep9a: ApiEndpoint = "/api/users";     // Should work
// const ep9b: ApiEndpoint = "/api/posts/123"; // Should work
// const ep9c: ApiEndpoint = "/users";         // Should error
// const ep9d: ApiEndpoint = "api/users";      // Should error

// ============================================================================
// EXERCISE 10: Implement (Event Handler Type)
// ============================================================================
// Create a type `MakeHandlers` that takes an object type and produces
// on<PropertyName>Changed handler methods.
//
// Example:
// MakeHandlers<{ name: string; age: number }>
// should produce:
// { onNameChanged: (value: string) => void; onAgeChanged: (value: number) => void }

// type MakeHandlers<T> = TODO;

// Uncomment to test:
// interface TestObj10 {
//   name: string;
//   age: number;
//   active: boolean;
// }
// type Handlers10 = MakeHandlers<TestObj10>;
// const h10: Handlers10 = {
//   onNameChanged: (value: string) => console.log(value),
//   onAgeChanged: (value: number) => console.log(value),
//   onActiveChanged: (value: boolean) => console.log(value),
// };

// ============================================================================
// EXERCISE 11: Implement (Extract Route Parameters)
// ============================================================================
// Create a type `ExtractParams` that extracts route parameter names from
// a URL pattern string.
//
// ExtractParams<"/users/:userId/posts/:postId"> = "userId" | "postId"

// type ExtractParams<S extends string> = TODO;

// Uncomment to test:
// type P11a = ExtractParams<"/users/:userId/posts/:postId">;
// const p11a: P11a = "userId";
// const p11b: P11a = "postId";
//
// type P11b = ExtractParams<"/api/:version">;
// const p11c: P11b = "version";
//
// type P11c = ExtractParams<"/static/page">;
// type Check11: P11c = never; // Should be never

// ============================================================================
// EXERCISE 12: Implement (Snake Case to Camel Case)
// ============================================================================
// Create a type that converts snake_case strings to camelCase.
//
// SnakeToCamel<"hello_world"> = "helloWorld"
// SnakeToCamel<"foo_bar_baz"> = "fooBarBaz"

// type SnakeToCamel<S extends string> = TODO;

// Uncomment to test:
// type SC12a = SnakeToCamel<"hello_world">;
// const sc12a: SC12a = "helloWorld";
//
// type SC12b = SnakeToCamel<"foo_bar_baz">;
// const sc12b: SC12b = "fooBarBaz";
//
// type SC12c = SnakeToCamel<"already">;
// const sc12c: SC12c = "already";

// ============================================================================
// EXERCISE 13: Implement (Typed CSS Class Builder)
// ============================================================================
// Create a type for a Tailwind-like spacing utility class.
// Format: "{property}-{size}" where:
//   property: "p" | "m" | "px" | "py" | "mx" | "my"
//   size: "0" | "1" | "2" | "3" | "4" | "8"

// type SpacingClass = TODO;

// Uncomment to test:
// const cls13a: SpacingClass = "p-4";
// const cls13b: SpacingClass = "mx-2";
// const cls13c: SpacingClass = "py-0";
// const cls13d: SpacingClass = "m-8";
// const cls13e: SpacingClass = "w-4";  // Should error

// ============================================================================
// EXERCISE 14: Implement (Getter/Setter Pair Generator)
// ============================================================================
// Create a type `GetterSetter<T>` that for each property K of T generates:
// - `getK(): T[K]`
// - `setK(value: T[K]): void`

// type GetterSetter<T> = TODO;

// Uncomment to test:
// interface Item14 {
//   id: number;
//   label: string;
// }
// type ItemAccess = GetterSetter<Item14>;
// const ia14: ItemAccess = {
//   getId: () => 1,
//   setId: (v: number) => {},
//   getLabel: () => "test",
//   setLabel: (v: string) => {},
// };

// ============================================================================
// EXERCISE 15: Implement (Type-Safe Query Builder)
// ============================================================================
// Create types for a simple SQL-like query builder.
//
// Requirements:
// - `Table` type: "users" | "posts" | "comments"
// - `SelectQuery<T>`: produces `SELECT * FROM ${T}` for valid tables
// - `WhereQuery<T, Col>`: produces `SELECT * FROM ${T} WHERE ${Col} = ?`
//   where Col must be a string
// - `RouteParamMap<S>`: given a route pattern, returns an object type
//   mapping each :param to string

// type Table15 = TODO;
// type SelectQuery15<T extends Table15> = TODO;
// type WhereQuery15<T extends Table15, Col extends string> = TODO;
//
// type RouteParamMap<S extends string> = TODO;
// (Hint: reuse the ExtractParams pattern from Exercise 11)

// Uncomment to test:
// const sq15: SelectQuery15<"users"> = "SELECT * FROM users";
// const wq15: WhereQuery15<"posts", "id"> = "SELECT * FROM posts WHERE id = ?";
//
// type RP15 = RouteParamMap<"/users/:userId/posts/:postId">;
// const rp15: RP15 = { userId: "123", postId: "456" };

// ============================================================================
// If you want to run quick checks, uncomment the line below:
// console.log("All exercises file compiles successfully!");
// ============================================================================

export {};
