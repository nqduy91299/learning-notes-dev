// ============================================================================
// 02-interfaces: Exercises
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/02-interfaces/exercises.ts
//
// 18 exercises covering TypeScript interfaces.
// Mix: ~6 predict-output, ~4 fix-the-bug, ~8 implement
//
// Instructions:
// - Predict-output: write your answer in the ANSWER comment, then uncomment
//   the test code to verify.
// - Fix-the-bug: find and fix the compile/runtime error.
// - Implement: write code that satisfies the requirements.
//
// All test code is commented out. Uncomment to verify your solutions.
// No `any` allowed. Must compile cleanly with strict mode.
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1 — Predict the Output (Interface Basics)
// ----------------------------------------------------------------------------
// What does the following code print?

interface Product {
  name: string;
  price: number;
}

function formatProduct(p: Product): string {
  return `${p.name}: $${p.price.toFixed(2)}`;
}

const widget = { name: "Widget", price: 9.99, inStock: true };

// ANSWER: ???

// console.log("Ex1:", formatProduct(widget));

// ----------------------------------------------------------------------------
// Exercise 2 — Predict the Output (Optional Properties)
// ----------------------------------------------------------------------------
// What does this print?

interface Greeting {
  name: string;
  title?: string;
}

function greet(g: Greeting): string {
  const prefix = g.title ? `${g.title} ` : "";
  return `Hello, ${prefix}${g.name}!`;
}

// ANSWER: ???

// console.log("Ex2a:", greet({ name: "Alice", title: "Dr." }));
// console.log("Ex2b:", greet({ name: "Bob" }));

// ----------------------------------------------------------------------------
// Exercise 3 — Predict the Output (Readonly)
// ----------------------------------------------------------------------------
// Does this compile? If yes, what does it print? If no, what's the error?

interface Settings {
  readonly theme: string;
  readonly colors: { primary: string; secondary: string };
}

const settings: Settings = {
  theme: "dark",
  colors: { primary: "#000", secondary: "#333" },
};

settings.colors.primary = "#111";

// ANSWER: ???

// console.log("Ex3:", settings.colors.primary);

// ----------------------------------------------------------------------------
// Exercise 4 — Predict the Output (Index Signatures)
// ----------------------------------------------------------------------------
// What does this print?

interface ScoreBoard {
  [player: string]: number;
}

const scores: ScoreBoard = {};
scores["Alice"] = 100;
scores["Bob"] = 85;
scores["Alice"] = scores["Alice"] + 15;

// ANSWER: ???

// console.log("Ex4:", scores["Alice"], scores["Bob"], scores["Charlie"]);

// ----------------------------------------------------------------------------
// Exercise 5 — Predict the Output (Declaration Merging)
// ----------------------------------------------------------------------------
// What does the merged interface look like? Does the code compile and what
// does it print?

interface Config {
  host: string;
}

interface Config {
  port: number;
}

interface Config {
  debug: boolean;
}

const serverConfig: Config = {
  host: "localhost",
  port: 8080,
  debug: true,
};

// ANSWER: ???

// console.log("Ex5:", `${serverConfig.host}:${serverConfig.port} debug=${serverConfig.debug}`);

// ----------------------------------------------------------------------------
// Exercise 6 — Predict the Output (Excess Property Checking)
// ----------------------------------------------------------------------------
// Which of these two calls compiles? What happens with each?

interface Options {
  color: string;
  width: number;
}

// Call A:
// const resultA = (function createBox(opts: Options) {
//   return `${opts.color} box, ${opts.width}px`;
// })({ color: "red", width: 50, height: 100 });  // literal

// Call B:
const optsB = { color: "blue", width: 30, height: 200 };
// const resultB = (function createBox(opts: Options) {
//   return `${opts.color} box, ${opts.width}px`;
// })(optsB);  // variable

// ANSWER: ???

// console.log("Ex6:", resultB);

// ----------------------------------------------------------------------------
// Exercise 7 — Fix the Bug (Missing Properties)
// ----------------------------------------------------------------------------
// This code has a compile error. Fix the object literal so it satisfies the
// interface without changing the interface.

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// TODO: Fix this object
// const myAddress: Address = {
//   street: "123 Main St",
//   city: "Springfield",
//   zip: "62704",
// };

// console.log("Ex7:", myAddress.city, myAddress.state);

// ----------------------------------------------------------------------------
// Exercise 8 — Fix the Bug (Index Signature Compatibility)
// ----------------------------------------------------------------------------
// This interface won't compile. Fix it so that it has both known properties
// and an index signature.

// TODO: Fix this interface
// interface Metadata {
//   id: number;
//   name: string;
//   [key: string]: string;
// }

// const meta: Metadata = { id: 1, name: "test", tag: "important" };
// console.log("Ex8:", meta.id, meta.name, meta.tag);

// ----------------------------------------------------------------------------
// Exercise 9 — Fix the Bug (Extending with Conflict)
// ----------------------------------------------------------------------------
// This code won't compile because of a type conflict in extends.
// Fix Derived so it properly extends Base.

interface Base {
  id: string | number;
  label: string;
}

// TODO: Fix this
// interface Derived extends Base {
//   id: boolean;
//   priority: number;
// }

// const item: Derived = { id: "abc", label: "Test", priority: 1 };
// console.log("Ex9:", item.id, item.label, item.priority);

// ----------------------------------------------------------------------------
// Exercise 10 — Fix the Bug (Class Implements)
// ----------------------------------------------------------------------------
// The class claims to implement the interface but is missing a method.
// Fix the class (don't change the interface).

interface Cacheable {
  readonly key: string;
  ttl: number;
  isExpired(): boolean;
  serialize(): string;
}

// TODO: Fix this class
// class CacheEntry implements Cacheable {
//   readonly key: string;
//   ttl: number;
//   private createdAt: number;
//
//   constructor(key: string, ttl: number) {
//     this.key = key;
//     this.ttl = ttl;
//     this.createdAt = Date.now();
//   }
//
//   isExpired(): boolean {
//     return Date.now() - this.createdAt > this.ttl;
//   }
// }

// const entry = new CacheEntry("user:1", 60000);
// console.log("Ex10:", entry.key, entry.isExpired(), entry.serialize());

// ----------------------------------------------------------------------------
// Exercise 11 — Implement (Basic Interface)
// ----------------------------------------------------------------------------
// Define an interface `Vehicle` with:
//   - make: string
//   - model: string
//   - year: number
//   - describe(): string  (returns "year make model")
// Create an object that satisfies it.

// TODO: Implement here

// const car: Vehicle = ???;
// console.log("Ex11:", car.describe());

// ----------------------------------------------------------------------------
// Exercise 12 — Implement (Optional + Readonly)
// ----------------------------------------------------------------------------
// Define an interface `BlogPost` with:
//   - readonly id: number
//   - title: string
//   - content: string
//   - tags?: string[]
//   - publishedAt?: Date
// Write a function `summarize(post: BlogPost): string` that returns:
//   "title (N tags)" if tags exist, or "title (no tags)" otherwise.

// TODO: Implement here

// const post: BlogPost = { id: 1, title: "Hello World", content: "...", tags: ["ts", "intro"] };
// const draft: BlogPost = { id: 2, title: "Draft", content: "..." };
// console.log("Ex12:", summarize(post), "|", summarize(draft));

// ----------------------------------------------------------------------------
// Exercise 13 — Implement (Index Signature)
// ----------------------------------------------------------------------------
// Define an interface `CSSStyles` with:
//   - An index signature for string keys mapping to string values
// Write a function `toStyleString(styles: CSSStyles): string` that converts
// the object to a CSS-style string like "color: red; font-size: 14px;"

// TODO: Implement here

// const styles: CSSStyles = { color: "red", "font-size": "14px", display: "flex" };
// console.log("Ex13:", toStyleString(styles));

// ----------------------------------------------------------------------------
// Exercise 14 — Implement (Extending Interfaces)
// ----------------------------------------------------------------------------
// Define:
//   interface Timestamped { createdAt: Date; updatedAt: Date }
//   interface SoftDeletable { deletedAt?: Date; isDeleted(): boolean }
//   interface DatabaseRecord extends Timestamped, SoftDeletable { id: string }
// Create a `UserRecord` type/interface that extends `DatabaseRecord` and adds:
//   - name: string
//   - email: string
// Create an object satisfying `UserRecord`.

// TODO: Implement here

// const user: UserRecord = ???;
// console.log("Ex14:", user.id, user.name, user.isDeleted());

// ----------------------------------------------------------------------------
// Exercise 15 — Implement (Declaration Merging)
// ----------------------------------------------------------------------------
// Declare an interface `AppEvent` with { type: string; timestamp: Date }.
// Then use declaration merging to add { payload?: unknown; source: string }.
// Create an object satisfying the merged interface.

// TODO: Implement here

// const event: AppEvent = ???;
// console.log("Ex15:", event.type, event.source, event.timestamp);

// ----------------------------------------------------------------------------
// Exercise 16 — Implement (Function Interface)
// ----------------------------------------------------------------------------
// Define an interface `Predicate<T>` with a callable signature:
//   (value: T) => boolean
// Write two predicates: isPositive (for numbers) and isNonEmpty (for strings).

// TODO: Implement here

// const isPositive: Predicate<number> = ???;
// const isNonEmpty: Predicate<string> = ???;
// console.log("Ex16:", isPositive(5), isPositive(-1), isNonEmpty("hi"), isNonEmpty(""));

// ----------------------------------------------------------------------------
// Exercise 17 — Implement (Hybrid Type)
// ----------------------------------------------------------------------------
// Create a hybrid interface `Logger` that is:
//   - Callable: (message: string) => void  (logs with current level)
//   - Has property: level ("info" | "warn" | "error")
//   - Has method: setLevel(level: "info" | "warn" | "error"): void
// Implement a factory function `createLogger(): Logger`.

// TODO: Implement here

// const logger = createLogger();
// logger("hello");           // prints "[INFO] hello"
// logger.setLevel("error");
// logger("something broke"); // prints "[ERROR] something broke"
// console.log("Ex17: see output above");

// ----------------------------------------------------------------------------
// Exercise 18 — Implement (Generic Interface)
// ----------------------------------------------------------------------------
// Define a generic interface `Stack<T>` with:
//   - push(item: T): void
//   - pop(): T | undefined
//   - peek(): T | undefined
//   - readonly size: number
// Implement a class `ArrayStack<T>` that implements `Stack<T>`.

// TODO: Implement here

// const numStack: Stack<number> = new ArrayStack<number>();
// numStack.push(10);
// numStack.push(20);
// numStack.push(30);
// console.log("Ex18:", numStack.peek(), numStack.size);  // 30 3
// numStack.pop();
// console.log("Ex18:", numStack.peek(), numStack.size);  // 20 2

export {};
