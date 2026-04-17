// ============================================================================
// 02-mapped-types: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/03-advanced/02-mapped-types/solutions.ts
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output (Solution)
// ============================================================================
// What type does `Result` resolve to?

interface Todo {
  title: string;
  completed: boolean;
  priority: number;
}

type Result1 = {
  [K in keyof Todo]: Todo[K] | null;
};

const ex1: Result1 = { title: "Learn TS", completed: false, priority: 1 };
console.log("Ex1:", ex1);
// Output: Ex1: { title: 'Learn TS', completed: false, priority: 1 }
//
// Result1 = {
//   title: string | null;
//   completed: boolean | null;
//   priority: number | null;
// }
//
// Explanation: The mapped type iterates over each key of Todo and unions the
// original value type with `null`. Each property can now hold its original
// type or null.

// ============================================================================
// EXERCISE 2 — Predict the Output (Solution)
// ============================================================================
// What happens to the modifiers?

interface Config {
  readonly host: string;
  readonly port: number;
  debug?: boolean;
}

type Unlocked = {
  -readonly [K in keyof Config]: Config[K];
};

type Concrete = {
  [K in keyof Config]-?: Config[K];
};

const ex2a: Unlocked = { host: "localhost", port: 3000, debug: true };
ex2a.host = "changed"; // OK — readonly removed

const ex2b: Concrete = { host: "localhost", port: 3000, debug: false };

console.log("Ex2:", ex2a, ex2b);
// Output: Ex2: { host: 'changed', port: 3000, debug: true } { host: 'localhost', port: 3000, debug: false }
//
// Unlocked = { host: string; port: number; debug?: boolean }
//   — readonly removed, but optional on debug is preserved (homomorphic)
//
// Concrete = { readonly host: string; readonly port: number; debug: boolean }
//   — optional removed, but readonly on host/port is preserved
//
// Explanation: `-readonly` removes only readonly. `-?` removes only optional.
// Each modifier manipulation is independent.

// ============================================================================
// EXERCISE 3 — Predict the Output (Solution)
// ============================================================================
// What does key remapping produce?

interface Animal {
  name: string;
  legs: number;
  sound: string;
}

type Getters = {
  [K in keyof Animal as `get${Capitalize<K>}`]: () => Animal[K];
};

const ex3: Getters = {
  getName: () => "Dog",
  getLegs: () => 4,
  getSound: () => "Woof",
};

console.log("Ex3:", ex3.getName(), ex3.getLegs(), ex3.getSound());
// Output: Ex3: Dog 4 Woof
//
// Getters = {
//   getName: () => string;
//   getLegs: () => number;
//   getSound: () => string;
// }
//
// Explanation: The `as` clause remaps each key K to `get${Capitalize<K>}`.
// Since all keys of Animal are strings, `Capitalize<K>` works directly.

// ============================================================================
// EXERCISE 4 — Predict the Output (Solution)
// ============================================================================
// Which keys survive the filter?

interface Mixed {
  id: number;
  name: string;
  tags: string[];
  active: boolean;
  label: string;
}

type StringOnly = {
  [K in keyof Mixed as Mixed[K] extends string ? K : never]: Mixed[K];
};

const ex4: StringOnly = { name: "test", label: "Tag" };

console.log("Ex4:", ex4);
// Output: Ex4: { name: 'test', label: 'Tag' }
//
// StringOnly = { name: string; label: string }
//
// Explanation: Only `name` and `label` have type `string`. `id` is number,
// `tags` is string[] (not string), and `active` is boolean. Keys mapped
// to `never` are excluded from the result.

// ============================================================================
// EXERCISE 5 — Predict the Output (Solution)
// ============================================================================
// Homomorphic vs non-homomorphic — do modifiers survive?

interface Strict {
  readonly a: string;
  b?: number;
}

type Homo = { [K in keyof Strict]: Strict[K] };
type NonHomo = { [K in "a" | "b"]: Strict[K] };

const ex5a: Homo = { a: "hello" };
// ex5a.a = "nope";  // Error: readonly preserved

const ex5b: NonHomo = { a: "hello", b: 42 };
ex5b.a = "changed"; // OK: readonly NOT preserved

console.log("Ex5:", ex5a, ex5b);
// Output: Ex5: { a: 'hello' } { a: 'changed', b: 42 }
//
// Homo = { readonly a: string; b?: number }     — modifiers PRESERVED
// NonHomo = { a: string; b: number | undefined } — modifiers LOST
//
// Explanation: `[K in keyof T]` is "homomorphic" — TypeScript preserves
// readonly and optional modifiers. `[K in "a" | "b"]` is non-homomorphic
// — the keys don't come from keyof, so modifiers are not preserved.
// Note: `b` in NonHomo becomes `number | undefined` (the optional's
// undefined stays in the type, but the property itself is required).

// ============================================================================
// EXERCISE 6 — Predict the Output (Solution)
// ============================================================================
// What union does ActionMap produce?

type ActionMap<T> = {
  [K in keyof T]: { type: K; payload: T[K] };
}[keyof T];

interface Payloads {
  add: string;
  remove: number;
  clear: undefined;
}

type Action = ActionMap<Payloads>;

const ex6a: Action = { type: "add", payload: "item" };
const ex6b: Action = { type: "remove", payload: 42 };
const ex6c: Action = { type: "clear", payload: undefined };

console.log("Ex6:", ex6a, ex6b, ex6c);
// Output: Ex6: { type: 'add', payload: 'item' } { type: 'remove', payload: 42 } { type: 'clear', payload: undefined }
//
// Action =
//   | { type: "add"; payload: string }
//   | { type: "remove"; payload: number }
//   | { type: "clear"; payload: undefined }
//
// Explanation: The mapped type creates an object with one property per key,
// each containing { type: K; payload: T[K] }. The `[keyof T]` indexed access
// at the end extracts the values as a union — producing a discriminated union.

// ============================================================================
// EXERCISE 7 — Fix the Bug (Solution)
// ============================================================================
// The issue: `Capitalize` requires a `string` argument, but `keyof T` can
// be `string | number | symbol`. Fix: intersect K with string.

interface Profile {
  username: string;
  bio: string;
  age: number;
}

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
  //                                   ^^^^^^^^ Fix: `string & K` instead of just `K`
};

type ProfileSetters = Setters<Profile>;

const ex7: ProfileSetters = {
  setUsername: (v) => console.log(v),
  setBio: (v) => console.log(v),
  setAge: (v) => console.log(v),
};
ex7.setUsername("alice");
console.log("Ex7: compiles and runs");
//
// Explanation: `keyof T` includes `string | number | symbol`. `Capitalize`
// only accepts strings. `string & K` narrows K to just the string keys.
// Number and symbol keys are filtered out (intersection with string = never).

// ============================================================================
// EXERCISE 8 — Fix the Bug (Solution)
// ============================================================================
// The original had incorrect modifier placement. The `-readonly` and `-?`
// must be placed correctly around the mapping variable.

interface Form {
  readonly name?: string;
  readonly email?: string;
  readonly age?: number;
}

type MutableRequired<T> = {
  -readonly [K in keyof T]-?: T[K];
};

type EditableForm = MutableRequired<Form>;

const ex8: EditableForm = { name: "Alice", email: "a@b.com", age: 30 };
ex8.name = "Bob"; // OK: both readonly and optional removed

console.log("Ex8:", ex8);
// Output: Ex8: { name: 'Bob', email: 'a@b.com', age: 30 }
//
// Explanation: The syntax is:
//   -readonly [K in keyof T]-?: T[K]
// `-readonly` goes before the `[`, `-?` goes after `]`.
// The original had `readonly -[K in keyof T]?:` which is invalid.

// ============================================================================
// EXERCISE 9 — Fix the Bug (Solution)
// ============================================================================
// The original DeepReadonly maps over array indices. Fix: detect arrays
// first and wrap them in ReadonlyArray.

interface State {
  users: { name: string; scores: number[] }[];
  count: number;
}

type DeepReadonlyFixed<T> = T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepReadonlyFixed<U>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonlyFixed<T[K]> }
    : T;

type FrozenState = DeepReadonlyFixed<State>;

const ex9: FrozenState = {
  users: [{ name: "Alice", scores: [100, 95] }],
  count: 1,
};
// ex9.count = 2;            // Error: readonly
// ex9.users.push({...});    // Error: ReadonlyArray
// ex9.users[0].name = "x";  // Error: readonly

console.log("Ex9:", ex9);
// Output: Ex9: { users: [ { name: 'Alice', scores: [100, 95] } ], count: 1 }
//
// Explanation: By checking `T extends ReadonlyArray<infer U>` BEFORE the
// generic object check, arrays are converted to ReadonlyArray<DeepReadonly<U>>
// instead of having their indices mapped as regular properties.

// ============================================================================
// EXERCISE 10 — Fix the Bug (Solution)
// ============================================================================
// The original PickByValue was actually correct! The "bug" was in the test
// setup. Let's verify the types are correct.

type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface Data {
  id: number;
  name: string;
  email: string;
  active: boolean;
  score: number;
}

type StringData = PickByValue<Data, string>;
type NumberData = PickByValue<Data, number>;

const testStr: StringData = { name: "a", email: "b" };
const testNum: NumberData = { id: 1, score: 2 };

console.log("Ex10:", testStr, testNum);
// Output: Ex10: { name: 'a', email: 'b' } { id: 1, score: 2 }
//
// StringData = { name: string; email: string }
// NumberData = { id: number; score: number }
//
// Explanation: The PickByValue implementation using key remapping with `as`
// and a conditional that maps non-matching keys to `never` is correct.
// The key insight: when the `as` clause evaluates to `never`, that key
// is entirely omitted from the resulting type.

// ============================================================================
// EXERCISE 11 — Implement MyPartial (Solution)
// ============================================================================

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type TestPartial = MyPartial<{ a: string; b: number }>;
const tp: TestPartial = {};
const tp2: TestPartial = { a: "hello" };

console.log("Ex11:", tp, tp2);
// Output: Ex11: {} { a: 'hello' }
//
// Explanation: Adding `?` after `]` makes every property optional.
// This is exactly how the built-in `Partial<T>` is implemented.
// Being homomorphic (`keyof T`), it preserves existing readonly modifiers.

// ============================================================================
// EXERCISE 12 — Implement MyReadonly (Solution)
// ============================================================================

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

interface MutablePoint {
  x: number;
  y: number;
}
const ro: MyReadonly<MutablePoint> = { x: 1, y: 2 };
// ro.x = 3; // Error: Cannot assign to 'x' because it is a read-only property

console.log("Ex12:", ro);
// Output: Ex12: { x: 1, y: 2 }
//
// Explanation: Adding `readonly` before `[` makes every property readonly.
// This is exactly how the built-in `Readonly<T>` is implemented.

// ============================================================================
// EXERCISE 13 — Implement MyRecord (Solution)
// ============================================================================

type MyRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

type Roles = "admin" | "user" | "guest";
const permissions: MyRecord<Roles, boolean> = {
  admin: true,
  user: true,
  guest: false,
};

console.log("Ex13:", permissions);
// Output: Ex13: { admin: true, user: true, guest: false }
//
// Explanation: Instead of mapping over `keyof T`, we map over the key union K
// directly. Each key in K gets value type V. This is non-homomorphic since
// the keys don't come from keyof of some type parameter.

// ============================================================================
// EXERCISE 14 — Implement Mutable (Solution)
// ============================================================================

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface Frozen {
  readonly a: string;
  readonly b: number;
}
const m: Mutable<Frozen> = { a: "hi", b: 1 };
m.a = "changed"; // OK: readonly removed

console.log("Ex14:", m);
// Output: Ex14: { a: 'changed', b: 1 }
//
// Explanation: The `-readonly` modifier removes the readonly constraint
// from every property. This is the inverse of `Readonly<T>`.

// ============================================================================
// EXERCISE 15 — Implement Optional (Solution)
// ============================================================================

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Alternative pure mapped-type implementation:
// type Optional<T, K extends keyof T> = {
//   [P in keyof T as P extends K ? never : P]: T[P];
// } & {
//   [P in K]?: T[P];
// };

interface User {
  name: string;
  age: number;
  email: string;
}
type TestOpt = Optional<User, "age" | "email">;
const u1: TestOpt = { name: "Alice" };
const u2: TestOpt = { name: "Bob", age: 30 };

console.log("Ex15:", u1, u2);
// Output: Ex15: { name: 'Alice' } { name: 'Bob', age: 30 }
//
// Explanation: We split T into two parts:
// 1. `Omit<T, K>` — all keys except K, unchanged (required)
// 2. `Partial<Pick<T, K>>` — only keys in K, made optional
// The intersection `&` merges them back together.

// ============================================================================
// EXERCISE 16 — Implement DeepPartial (Solution)
// ============================================================================

type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

interface Nested {
  a: {
    b: {
      c: string;
      d: number;
    };
    e: string;
  };
  f: number;
  g: () => void;
}

type TestDeep = DeepPartial<Nested>;
const d: TestDeep = { a: { b: { c: "hi" } } };

console.log("Ex16:", d);
// Output: Ex16: { a: { b: { c: 'hi' } } }
//
// Explanation: We check multiple cases:
// 1. Functions — return as-is (don't recurse)
// 2. Arrays — recurse into the element type
// 3. Objects — make all properties optional and recurse into values
// 4. Primitives — return as-is
// The conditional checks happen OUTSIDE the mapped type to handle
// arrays and functions before we try to map over their keys.

// ============================================================================
// EXERCISE 17 — Implement EventHandlers (Solution)
// ============================================================================

type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (event: T[K]) => void;
};

interface Events {
  click: { x: number; y: number };
  focus: { target: string };
  submit: { data: Record<string, string> };
}

type Handlers = EventHandlers<Events>;

const h: Handlers = {
  onClick: (e) => console.log(e.x, e.y),
  onFocus: (e) => console.log(e.target),
  onSubmit: (e) => console.log(e.data),
};

h.onClick({ x: 10, y: 20 });
h.onFocus({ target: "input" });
h.onSubmit({ data: { name: "test" } });
console.log("Ex17: handlers invoked");
// Output:
// 10 20
// input
// { name: 'test' }
// Ex17: handlers invoked
//
// Explanation: Key remapping with `as` transforms each key K into
// `on${Capitalize<string & K>}`. The `string & K` narrows K to string keys.
// The value type is a callback receiving T[K] (the event data type).

// ============================================================================
// EXERCISE 18 — Implement Unionize (Solution)
// ============================================================================

type Unionize<T> = {
  [K in keyof T]: { [P in K]: T[P] };
}[keyof T];

// Alternative (equivalent):
// type Unionize<T> = {
//   [K in keyof T]: Pick<T, K>;
// }[keyof T];

interface AB {
  a: string;
  b: number;
  c: boolean;
}

type Unioned = Unionize<AB>;

const u_a: Unioned = { a: "hello" };
const u_b: Unioned = { b: 42 };
const u_c: Unioned = { c: true };

console.log("Ex18:", u_a, u_b, u_c);
// Output: Ex18: { a: 'hello' } { b: 42 } { c: true }
//
// Unioned = { a: string } | { b: number } | { c: boolean }
//
// Explanation: The mapped type creates, for each key K, a single-key object
// `{ [P in K]: T[P] }`. The `[keyof T]` indexed access extracts all these
// single-key objects as a union. This is the same "distribute into union"
// pattern used in ActionMap (Exercise 6), but wrapping each entry in
// a single-property object instead of a { type, payload } shape.

// ============================================================================
// Runner
// ============================================================================
console.log("\n========================================");
console.log("All 18 solutions executed successfully!");
console.log("========================================");
