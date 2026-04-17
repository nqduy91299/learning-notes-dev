// ============================================================================
// 03-type-aliases: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/03-type-aliases/exercises.ts
// ============================================================================
// 18 exercises: ~6 predict-output, ~4 fix-the-bug, ~8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1 — Predict the Output
// ----------------------------------------------------------------------------
// What does this print?

type Greeting = string;
type Count = number;

const greet: Greeting = "Hello";
const count: Count = 5;

// console.log(typeof greet, typeof count);

// Your prediction: ???

// ----------------------------------------------------------------------------
// Exercise 2 — Predict the Output
// ----------------------------------------------------------------------------
// What does this print?

type Status = "loading" | "success" | "error";

function describeStatus(s: Status): string {
  switch (s) {
    case "loading": return "Please wait";
    case "success": return "Done!";
    case "error":   return "Something went wrong";
  }
}

// console.log(describeStatus("success"));
// console.log(describeStatus("loading"));

// Your prediction: ???

// ----------------------------------------------------------------------------
// Exercise 3 — Predict the Output
// ----------------------------------------------------------------------------
// What does this print?

type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const mul: MathOp = (a, b) => a * b;

function apply(op: MathOp, x: number, y: number): number {
  return op(x, y);
}

// console.log(apply(add, 3, 4));
// console.log(apply(mul, 3, 4));

// Your prediction: ???

// ----------------------------------------------------------------------------
// Exercise 4 — Predict the Output
// ----------------------------------------------------------------------------
// What does this print?

type Pair<A, B> = [A, B];
type StringNum = Pair<string, number>;

const entry: StringNum = ["age", 30];

// console.log(entry[0].toUpperCase(), entry[1].toFixed(1));

// Your prediction: ???

// ----------------------------------------------------------------------------
// Exercise 5 — Predict the Output
// ----------------------------------------------------------------------------
// What does this print?

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect":   return s.width * s.height;
  }
}

// console.log(area({ kind: "rect", width: 3, height: 4 }));
// console.log(Math.round(area({ kind: "circle", radius: 1 })));

// Your prediction: ???

// ----------------------------------------------------------------------------
// Exercise 6 — Predict the Output
// ----------------------------------------------------------------------------
// What does this print?

type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge;

const p: Person = { name: "Alice", age: 30 };

// console.log(`${p.name} is ${p.age}`);

// Your prediction: ???

// ----------------------------------------------------------------------------
// Exercise 7 — Fix the Bug
// ----------------------------------------------------------------------------
// This code has a type error. Fix it so it compiles.

// type Direction = "north" | "south" | "east" | "west";
//
// function move(dir: Direction): string {
//   return `Moving ${dir}`;
// }
//
// const result7 = move("up");
// console.log(result7);

// ----------------------------------------------------------------------------
// Exercise 8 — Fix the Bug
// ----------------------------------------------------------------------------
// This code has a type error. Fix the type alias (not the usage).

// type Coordinate = [number, number];
//
// const point: Coordinate = [10, 20, 30];
// console.log(point);

// ----------------------------------------------------------------------------
// Exercise 9 — Fix the Bug
// ----------------------------------------------------------------------------
// The discriminated union switch is not exhaustive. Fix it.

// type Light = "red" | "yellow" | "green";
//
// function action(light: Light): string {
//   switch (light) {
//     case "red":    return "Stop";
//     case "green":  return "Go";
//   }
// }
//
// console.log(action("yellow"));

// ----------------------------------------------------------------------------
// Exercise 10 — Fix the Bug
// ----------------------------------------------------------------------------
// The intersection type has a conflicting property. Fix it so the type is usable.

// type ConfigA = { mode: string; retries: number };
// type ConfigB = { mode: number; timeout: number };
// type FullConfig = ConfigA & ConfigB;
//
// const cfg: FullConfig = {
//   mode: "production",
//   retries: 3,
//   timeout: 5000,
// };
// console.log(cfg.mode);

// ----------------------------------------------------------------------------
// Exercise 11 — Implement
// ----------------------------------------------------------------------------
// Create a type alias `Result<T, E>` that is a discriminated union:
//   - { ok: true; value: T }
//   - { ok: false; error: E }
// Then implement `unwrap` that returns the value or throws the error.

// type Result<T, E> = ???;
//
// function unwrap<T, E>(result: Result<T, E>): T {
//   ???
// }
//
// console.log(unwrap({ ok: true, value: 42 }));
// try { unwrap({ ok: false, error: "fail" }); } catch (e) { console.log(e); }

// ----------------------------------------------------------------------------
// Exercise 12 — Implement
// ----------------------------------------------------------------------------
// Create a type alias `Tree<T>` for a recursive tree structure:
//   { value: T; children: Tree<T>[] }
// Then implement `countNodes` that returns the total number of nodes.

// type Tree<T> = ???;
//
// function countNodes<T>(tree: Tree<T>): number {
//   ???
// }
//
// const tree12: Tree<string> = {
//   value: "root",
//   children: [
//     { value: "a", children: [] },
//     { value: "b", children: [{ value: "c", children: [] }] },
//   ],
// };
// console.log(countNodes(tree12)); // 4

// ----------------------------------------------------------------------------
// Exercise 13 — Implement
// ----------------------------------------------------------------------------
// Create a type alias `EventMap` using template literal types:
//   Given type Events = "click" | "hover" | "scroll"
//   Produce type EventMap = { onClick: () => void; onHover: () => void; onScroll: () => void }
// Then create a value of that type.

// type Events13 = "click" | "hover" | "scroll";
// type EventHandlerName = ???;
// type EventMap = ???;
//
// const handlers: EventMap = ???;
// handlers.onClick();

// ----------------------------------------------------------------------------
// Exercise 14 — Implement
// ----------------------------------------------------------------------------
// Use `typeof` and `as const` to extract a union of route paths.
// Given the ROUTES object, extract type RoutePath = "/" | "/about" | "/contact"

// const ROUTES = {
//   home: "/",
//   about: "/about",
//   contact: "/contact",
// } as const;
//
// type RoutePath = ???;
//
// function navigate(path: RoutePath): string {
//   return `Navigating to ${path}`;
// }
// console.log(navigate("/about"));

// ----------------------------------------------------------------------------
// Exercise 15 — Implement
// ----------------------------------------------------------------------------
// Create a type alias `DeepReadonly<T>` that makes all properties (and nested
// object properties) readonly.

// type DeepReadonly<T> = ???;
//
// type Nested = { a: { b: { c: number } }; d: string[] };
// const obj15: DeepReadonly<Nested> = { a: { b: { c: 1 } }, d: ["x"] };
// // obj15.a.b.c = 2;  // Should error
// // obj15.d.push("y"); // Should error
// console.log(obj15.a.b.c);

// ----------------------------------------------------------------------------
// Exercise 16 — Implement
// ----------------------------------------------------------------------------
// Implement a type-safe builder using function type aliases.
// Create type `Builder<T>` = (partial: Partial<T>) => Partial<T>
// Implement `pipe` that chains two builders.

// type Builder<T> = (partial: Partial<T>) => Partial<T>;
//
// type UserConfig = {
//   name: string;
//   age: number;
//   active: boolean;
// };
//
// function pipe<T>(b1: Builder<T>, b2: Builder<T>): Builder<T> {
//   ???
// }
//
// const setName: Builder<UserConfig> = (p) => ({ ...p, name: "Alice" });
// const setAge: Builder<UserConfig> = (p) => ({ ...p, age: 30 });
//
// const build = pipe(setName, setAge);
// console.log(build({})); // { name: "Alice", age: 30 }

// ----------------------------------------------------------------------------
// Exercise 17 — Implement
// ----------------------------------------------------------------------------
// Create a conditional type `Flatten<T>`:
//   - If T is an array of U, return U
//   - Otherwise return T
// Test with several types.

// type Flatten<T> = ???;
//
// type A17 = Flatten<string[]>;     // string
// type B17 = Flatten<number[][]>;   // number[]
// type C17 = Flatten<boolean>;      // boolean
//
// const a17: A17 = "hello";
// const b17: B17 = [1, 2, 3];
// const c17: C17 = true;
// console.log(a17, b17, c17);

// ----------------------------------------------------------------------------
// Exercise 18 — Implement
// ----------------------------------------------------------------------------
// Create a mini state machine type for an order:
//   States: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
//   Each state has specific allowed data.
// Implement `describeOrder` using exhaustive switch.

// type Order =
//   | { status: "pending"; items: string[] }
//   | { status: "confirmed"; items: string[]; confirmationId: string }
//   | { status: "shipped"; trackingNumber: string }
//   | { status: "delivered"; deliveredAt: Date }
//   | { status: "cancelled"; reason: string };
//
// function describeOrder(order: Order): string {
//   ???
// }
//
// console.log(describeOrder({ status: "pending", items: ["Book", "Pen"] }));
// console.log(describeOrder({ status: "shipped", trackingNumber: "TRK123" }));
// console.log(describeOrder({ status: "cancelled", reason: "Changed mind" }));

export {};
