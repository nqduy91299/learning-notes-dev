// ============================================================================
// 03-type-aliases: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/03-type-aliases/solutions.ts
// ============================================================================

console.log("=== Exercise 1 ===");
// Predict: typeof returns the runtime type, not the alias name.
// Type aliases are erased at compile time.
type Greeting = string;
type Count = number;

const greet: Greeting = "Hello";
const count: Count = 5;

console.log(typeof greet, typeof count);
// Output: string number

console.log("\n=== Exercise 2 ===");
// Predict: The switch is exhaustive — every Status case returns a string.
type Status = "loading" | "success" | "error";

function describeStatus(s: Status): string {
  switch (s) {
    case "loading": return "Please wait";
    case "success": return "Done!";
    case "error":   return "Something went wrong";
  }
}

console.log(describeStatus("success"));
console.log(describeStatus("loading"));
// Output:
// Done!
// Please wait

console.log("\n=== Exercise 3 ===");
// Predict: apply calls the function with the given arguments.
type MathOp = (a: number, b: number) => number;

const add: MathOp = (a, b) => a + b;
const mul: MathOp = (a, b) => a * b;

function apply(op: MathOp, x: number, y: number): number {
  return op(x, y);
}

console.log(apply(add, 3, 4));
console.log(apply(mul, 3, 4));
// Output:
// 7
// 12

console.log("\n=== Exercise 4 ===");
// Predict: Tuple elements preserve their types — string methods on [0],
// number methods on [1].
type Pair<A, B> = [A, B];
type StringNum = Pair<string, number>;

const entry: StringNum = ["age", 30];

console.log(entry[0].toUpperCase(), entry[1].toFixed(1));
// Output: AGE 30.0

console.log("\n=== Exercise 5 ===");
// Predict: Discriminated union narrowing in switch.
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect":   return s.width * s.height;
  }
}

console.log(area({ kind: "rect", width: 3, height: 4 }));
console.log(Math.round(area({ kind: "circle", radius: 1 })));
// Output:
// 12
// 3

console.log("\n=== Exercise 6 ===");
// Predict: Intersection merges both object types.
type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge;

const p: Person = { name: "Alice", age: 30 };

console.log(`${p.name} is ${p.age}`);
// Output: Alice is 30

console.log("\n=== Exercise 7 ===");
// Fix: "up" is not in the Direction union. Change it to a valid direction.
type Direction = "north" | "south" | "east" | "west";

function move(dir: Direction): string {
  return `Moving ${dir}`;
}

const result7 = move("north"); // Fixed: "up" -> "north"
console.log(result7);
// Output: Moving north

console.log("\n=== Exercise 8 ===");
// Fix: Coordinate is [number, number] (2 elements) but 3 values are assigned.
// Change the type to accept 3 elements.
type Coordinate = [number, number, number]; // Fixed: added third element

const point: Coordinate = [10, 20, 30];
console.log(point);
// Output: [ 10, 20, 30 ]

console.log("\n=== Exercise 9 ===");
// Fix: The "yellow" case is missing from the switch.
type Light = "red" | "yellow" | "green";

function action(light: Light): string {
  switch (light) {
    case "red":    return "Stop";
    case "yellow": return "Caution"; // Fixed: added missing case
    case "green":  return "Go";
  }
}

console.log(action("yellow"));
// Output: Caution

console.log("\n=== Exercise 10 ===");
// Fix: Both ConfigA and ConfigB have `mode` with incompatible types
// (string & number = never). Fix by making both use the same type.
type ConfigA = { mode: string; retries: number };
type ConfigB = { mode: string; timeout: number }; // Fixed: number -> string

type FullConfig = ConfigA & ConfigB;

const cfg: FullConfig = {
  mode: "production",
  retries: 3,
  timeout: 5000,
};
console.log(cfg.mode);
// Output: production

console.log("\n=== Exercise 11 ===");
// Implement: Result<T, E> discriminated union with unwrap.
// The `ok` field serves as the discriminant for narrowing.
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

console.log(unwrap({ ok: true, value: 42 }));
try {
  unwrap({ ok: false, error: "fail" });
} catch (e) {
  console.log(e);
}
// Output:
// 42
// fail

console.log("\n=== Exercise 12 ===");
// Implement: Recursive Tree<T> type with countNodes.
// Each node counts as 1, plus all children recursively.
type Tree<T> = {
  value: T;
  children: Tree<T>[];
};

function countNodes<T>(tree: Tree<T>): number {
  return 1 + tree.children.reduce(
    (sum, child) => sum + countNodes(child),
    0
  );
}

const tree12: Tree<string> = {
  value: "root",
  children: [
    { value: "a", children: [] },
    { value: "b", children: [{ value: "c", children: [] }] },
  ],
};
console.log(countNodes(tree12));
// Output: 4

console.log("\n=== Exercise 13 ===");
// Implement: Template literal types to build event handler names and a mapped type.
// `on${Capitalize<E>}` transforms "click" -> "onClick", etc.
type Events13 = "click" | "hover" | "scroll";
type EventHandlerName = `on${Capitalize<Events13>}`;
type EventMap = {
  [K in EventHandlerName]: () => void;
};

const handlers: EventMap = {
  onClick:  () => console.log("clicked"),
  onHover:  () => console.log("hovered"),
  onScroll: () => console.log("scrolled"),
};
handlers.onClick();
// Output: clicked

console.log("\n=== Exercise 14 ===");
// Implement: Use typeof + as const + indexed access to extract route paths.
// (typeof ROUTES)[keyof typeof ROUTES] gives the union of all values.
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
} as const;

type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

function navigate(path: RoutePath): string {
  return `Navigating to ${path}`;
}
console.log(navigate("/about"));
// Output: Navigating to /about

console.log("\n=== Exercise 15 ===");
// Implement: DeepReadonly<T> recursively applies readonly.
// For arrays, we use ReadonlyArray. For objects, we recurse into properties.
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type Nested = { a: { b: { c: number } }; d: string[] };
const obj15: DeepReadonly<Nested> = { a: { b: { c: 1 } }, d: ["x"] };
// obj15.a.b.c = 2;   // Error: Cannot assign to 'c'
// obj15.d.push("y"); // Error: Property 'push' does not exist on ReadonlyArray
console.log(obj15.a.b.c);
// Output: 1

console.log("\n=== Exercise 16 ===");
// Implement: pipe chains two Builder functions.
// The second builder receives the result of the first.
type Builder<T> = (partial: Partial<T>) => Partial<T>;

type UserConfig = {
  name: string;
  age: number;
  active: boolean;
};

function pipe<T>(b1: Builder<T>, b2: Builder<T>): Builder<T> {
  return (partial) => b2(b1(partial));
}

const setName: Builder<UserConfig> = (p) => ({ ...p, name: "Alice" });
const setAge: Builder<UserConfig> = (p) => ({ ...p, age: 30 });

const build = pipe(setName, setAge);
console.log(build({}));
// Output: { name: 'Alice', age: 30 }

console.log("\n=== Exercise 17 ===");
// Implement: Flatten<T> uses a conditional type with `infer` to unwrap one
// layer of array nesting.
type Flatten<T> = T extends (infer U)[] ? U : T;

type A17 = Flatten<string[]>;     // string
type B17 = Flatten<number[][]>;   // number[]
type C17 = Flatten<boolean>;      // boolean

const a17: A17 = "hello";
const b17: B17 = [1, 2, 3];
const c17: C17 = true;
console.log(a17, b17, c17);
// Output: hello [ 1, 2, 3 ] true

console.log("\n=== Exercise 18 ===");
// Implement: Exhaustive switch on discriminated union for order states.
// The `never` default ensures all cases are covered at compile time.
type Order =
  | { status: "pending"; items: string[] }
  | { status: "confirmed"; items: string[]; confirmationId: string }
  | { status: "shipped"; trackingNumber: string }
  | { status: "delivered"; deliveredAt: Date }
  | { status: "cancelled"; reason: string };

function describeOrder(order: Order): string {
  switch (order.status) {
    case "pending":
      return `Order pending with ${order.items.length} item(s): ${order.items.join(", ")}`;
    case "confirmed":
      return `Order confirmed (ID: ${order.confirmationId}) with ${order.items.length} item(s)`;
    case "shipped":
      return `Order shipped — tracking: ${order.trackingNumber}`;
    case "delivered":
      return `Order delivered at ${order.deliveredAt.toISOString()}`;
    case "cancelled":
      return `Order cancelled: ${order.reason}`;
    default: {
      const _exhaustive: never = order;
      return _exhaustive;
    }
  }
}

console.log(describeOrder({ status: "pending", items: ["Book", "Pen"] }));
console.log(describeOrder({ status: "shipped", trackingNumber: "TRK123" }));
console.log(describeOrder({ status: "cancelled", reason: "Changed mind" }));
// Output:
// Order pending with 2 item(s): Book, Pen
// Order shipped — tracking: TRK123
// Order cancelled: Changed mind

console.log("\n=== All exercises complete! ===");

export {};
