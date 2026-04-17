// ============================================================================
// 02-mapped-types: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/03-advanced/02-mapped-types/exercises.ts
//
// 18 exercises: 6 predict-output, 4 fix-the-bug, 8 implement
// All test code is commented out. No `any`. Must compile cleanly.
// ============================================================================

// ============================================================================
// EXERCISE 1 — Predict the Output
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

declare const ex1: Result1;

// console.log("Ex1 compiles:", true);

// YOUR PREDICTION:
// Result1 = ???

// ============================================================================
// EXERCISE 2 — Predict the Output
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

declare const ex2a: Unlocked;
declare const ex2b: Concrete;

// console.log("Ex2 compiles:", true);

// YOUR PREDICTION:
// Unlocked = ???
// Concrete = ???

// ============================================================================
// EXERCISE 3 — Predict the Output
// ============================================================================
// What does key remapping produce here?

interface Animal {
  name: string;
  legs: number;
  sound: string;
}

type Getters = {
  [K in keyof Animal as `get${Capitalize<K>}`]: () => Animal[K];
};

declare const ex3: Getters;

// console.log("Ex3 compiles:", true);

// YOUR PREDICTION:
// Getters = ???

// ============================================================================
// EXERCISE 4 — Predict the Output
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

declare const ex4: StringOnly;

// console.log("Ex4 compiles:", true);

// YOUR PREDICTION:
// StringOnly = ???

// ============================================================================
// EXERCISE 5 — Predict the Output
// ============================================================================
// Homomorphic vs non-homomorphic — do modifiers survive?

interface Strict {
  readonly a: string;
  b?: number;
}

type Homo = { [K in keyof Strict]: Strict[K] };
type NonHomo = { [K in "a" | "b"]: Strict[K] };

declare const ex5a: Homo;
declare const ex5b: NonHomo;

// console.log("Ex5 compiles:", true);

// YOUR PREDICTION:
// Homo = ???   (are modifiers preserved?)
// NonHomo = ??? (are modifiers preserved?)

// ============================================================================
// EXERCISE 6 — Predict the Output
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

declare const ex6: Action;

// console.log("Ex6 compiles:", true);

// YOUR PREDICTION:
// Action = ???

// ============================================================================
// EXERCISE 7 — Fix the Bug
// ============================================================================
// This mapped type should create setter functions, but it has a type error.
// Fix it WITHOUT changing the resulting type.

interface Profile {
  username: string;
  bio: string;
  age: number;
}

// The broken version (commented out because it won't compile):
// type Setters<T> = {
//   [K in keyof T as `set${Capitalize<K>}`]: (value: T[K]) => void;
// };
// ^ Capitalize<K> causes an error. Fix it WITHOUT changing the resulting type.

// type Setters<T> = ???

// type ProfileSetters = Setters<Profile>;

// console.log("Ex7 compiles:", true);

// ============================================================================
// EXERCISE 8 — Fix the Bug
// ============================================================================
// This tries to make a "mutable & required" type, but the syntax is wrong.
// Fix the modifier syntax.

interface Form {
  readonly name?: string;
  readonly email?: string;
  readonly age?: number;
}

// The broken version (commented out because it won't compile):
// type MutableRequired<T> = {
//   readonly -[K in keyof T]?: T[K];
// };
// ^ Something is wrong with the modifier placement.
// Fix it so that BOTH readonly and optional are REMOVED.

// type MutableRequired<T> = ???

// type EditableForm = MutableRequired<Form>;

// console.log("Ex8 compiles:", true);

// ============================================================================
// EXERCISE 9 — Fix the Bug
// ============================================================================
// This recursive DeepReadonly causes issues with arrays. Fix it so arrays
// are made readonly (ReadonlyArray) without mapping over their indices.

type DeepReadonlyBroken<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonlyBroken<T[K]>
    : T[K];
};

interface State {
  users: { name: string; scores: number[] }[];
  count: number;
}

type FrozenState = DeepReadonlyBroken<State>;

// The type "works" but arrays get their indices mapped weirdly.
// Rewrite DeepReadonly below so that arrays become ReadonlyArray<DeepReadonly<Element>>.

// type DeepReadonlyFixed<T> = ???

// console.log("Ex9 compiles:", true);

// ============================================================================
// EXERCISE 10 — Fix the Bug
// ============================================================================
// This mapped type is supposed to pick only properties of a given type V,
// but it loses the type narrowing. Fix it.

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
// Should be { name: string; email: string }

type NumberData = PickByValue<Data, number>;
// Should be { id: number; score: number }

// BUG: The test below should fail but currently compiles.
// The issue is that this line should NOT compile:
// const bugTest: StringData = { name: "ok", email: "ok", id: 5 } as StringData;
// Actually the real bug is below — uncomment to see if the types are correct.
// const testStr: StringData = { name: "a", email: "b" };
// const testNum: NumberData = { id: 1, score: 2 };

// console.log("Ex10 compiles:", true);

// ============================================================================
// EXERCISE 11 — Implement
// ============================================================================
// Implement `MyPartial<T>` that makes all properties optional.
// Do NOT use the built-in `Partial`.

// type MyPartial<T> = ???

// type TestPartial = MyPartial<{ a: string; b: number }>;
// const tp: TestPartial = {};
// const tp2: TestPartial = { a: "hello" };

// ============================================================================
// EXERCISE 12 — Implement
// ============================================================================
// Implement `MyReadonly<T>` that makes all properties readonly.
// Do NOT use the built-in `Readonly`.

// type MyReadonly<T> = ???

// interface Mutable { x: number; y: number }
// const ro: MyReadonly<Mutable> = { x: 1, y: 2 };
// ro.x = 3; // Should error

// ============================================================================
// EXERCISE 13 — Implement
// ============================================================================
// Implement `MyRecord<K, V>` that creates an object type with keys K and values V.
// Do NOT use the built-in `Record`.

// type MyRecord<K extends string | number | symbol, V> = ???

// type Roles = "admin" | "user" | "guest";
// const permissions: MyRecord<Roles, boolean> = {
//   admin: true,
//   user: true,
//   guest: false,
// };

// ============================================================================
// EXERCISE 14 — Implement
// ============================================================================
// Implement `Mutable<T>` that removes `readonly` from all properties.

// type Mutable<T> = ???

// interface Frozen { readonly a: string; readonly b: number }
// const m: Mutable<Frozen> = { a: "hi", b: 1 };
// m.a = "changed"; // Should compile

// ============================================================================
// EXERCISE 15 — Implement
// ============================================================================
// Implement `Optional<T, K>` that makes only the specified keys optional,
// leaving the rest unchanged.

// type Optional<T, K extends keyof T> = ???

// interface User { name: string; age: number; email: string }
// type TestOpt = Optional<User, "age" | "email">;
// const u1: TestOpt = { name: "Alice" };
// const u2: TestOpt = { name: "Bob", age: 30 };

// ============================================================================
// EXERCISE 16 — Implement
// ============================================================================
// Implement `DeepPartial<T>` that makes all properties optional recursively.
// Handle arrays and functions correctly (don't recurse into them).

// type DeepPartial<T> = ???

// interface Nested {
//   a: {
//     b: {
//       c: string;
//       d: number;
//     };
//     e: string;
//   };
//   f: number;
//   g: () => void;
// }
// type TestDeep = DeepPartial<Nested>;
// const d: TestDeep = { a: { b: { c: "hi" } } };

// ============================================================================
// EXERCISE 17 — Implement
// ============================================================================
// Implement `EventHandlers<T>` that takes an event map and produces handler types.
// For each key K in T, produce `on${Capitalize<K>}` with type `(event: T[K]) => void`.

// type EventHandlers<T> = ???

// interface Events {
//   click: { x: number; y: number };
//   focus: { target: string };
//   submit: { data: Record<string, string> };
// }
// type Handlers = EventHandlers<Events>;
// const h: Handlers = {
//   onClick: (e) => console.log(e.x),
//   onFocus: (e) => console.log(e.target),
//   onSubmit: (e) => console.log(e.data),
// };

// ============================================================================
// EXERCISE 18 — Implement
// ============================================================================
// Implement `Unionize<T>` that converts an object type into a union of
// single-key objects: { a: string; b: number } => { a: string } | { b: number }

// type Unionize<T> = ???

// interface AB { a: string; b: number; c: boolean }
// type Unioned = Unionize<AB>;
// const u_a: Unioned = { a: "hello" };
// const u_b: Unioned = { b: 42 };
// const u_c: Unioned = { c: true };
