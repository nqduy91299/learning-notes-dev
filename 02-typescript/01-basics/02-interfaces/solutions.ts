// ============================================================================
// 02-interfaces: Solutions
// ============================================================================
// Run:  npx tsx 02-typescript/01-basics/02-interfaces/solutions.ts
// ============================================================================

console.log("=== 02-interfaces: Solutions ===\n");

// ----------------------------------------------------------------------------
// Exercise 1 — Predict the Output (Interface Basics)
// ----------------------------------------------------------------------------
// ANSWER: "Widget: $9.99"
// Explanation: The `widget` object has an extra property `inStock`, but since
// it's passed via a variable (not a literal), excess property checking doesn't
// apply. Structural typing means it satisfies `Product` because it has `name`
// and `price`.

interface Product {
  name: string;
  price: number;
}

function formatProduct(p: Product): string {
  return `${p.name}: $${p.price.toFixed(2)}`;
}

const widget = { name: "Widget", price: 9.99, inStock: true };
console.log("Ex1:", formatProduct(widget));
// Output: Ex1: Widget: $9.99

// ----------------------------------------------------------------------------
// Exercise 2 — Predict the Output (Optional Properties)
// ----------------------------------------------------------------------------
// ANSWER:
//   Ex2a: "Hello, Dr. Alice!"
//   Ex2b: "Hello, Bob!"
// Explanation: When `title` is present, it's prepended with a space. When
// omitted, the optional property is `undefined`, so the ternary picks "".

interface Greeting {
  name: string;
  title?: string;
}

function greet(g: Greeting): string {
  const prefix = g.title ? `${g.title} ` : "";
  return `Hello, ${prefix}${g.name}!`;
}

console.log("Ex2a:", greet({ name: "Alice", title: "Dr." }));
console.log("Ex2b:", greet({ name: "Bob" }));

// ----------------------------------------------------------------------------
// Exercise 3 — Predict the Output (Readonly)
// ----------------------------------------------------------------------------
// ANSWER: Compiles and prints "#111"
// Explanation: `readonly` is shallow. You can't reassign `settings.colors` to
// a new object, but you CAN mutate properties of the nested object.

interface Settings {
  readonly theme: string;
  readonly colors: { primary: string; secondary: string };
}

const settings: Settings = {
  theme: "dark",
  colors: { primary: "#000", secondary: "#333" },
};

settings.colors.primary = "#111";
console.log("Ex3:", settings.colors.primary);
// Output: Ex3: #111

// ----------------------------------------------------------------------------
// Exercise 4 — Predict the Output (Index Signatures)
// ----------------------------------------------------------------------------
// ANSWER: 115 85 undefined
// Explanation: Alice starts at 100, gets +15 = 115. Bob is 85. Charlie was
// never set, so accessing it returns undefined (index signatures allow any
// string key).

interface ScoreBoard {
  [player: string]: number;
}

const scores: ScoreBoard = {};
scores["Alice"] = 100;
scores["Bob"] = 85;
scores["Alice"] = scores["Alice"] + 15;
console.log("Ex4:", scores["Alice"], scores["Bob"], scores["Charlie"]);
// Output: Ex4: 115 85 undefined

// ----------------------------------------------------------------------------
// Exercise 5 — Predict the Output (Declaration Merging)
// ----------------------------------------------------------------------------
// ANSWER: "localhost:8080 debug=true"
// Explanation: Three `Config` declarations merge into one interface with all
// three properties: host, port, debug. The object satisfies the merged shape.

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

console.log("Ex5:", `${serverConfig.host}:${serverConfig.port} debug=${serverConfig.debug}`);
// Output: Ex5: localhost:8080 debug=true

// ----------------------------------------------------------------------------
// Exercise 6 — Predict the Output (Excess Property Checking)
// ----------------------------------------------------------------------------
// ANSWER: Call A does NOT compile — excess property `height` on object literal.
//         Call B compiles fine — "blue box, 30px"
// Explanation: Excess property checking only applies to object literals
// assigned directly to a typed parameter. Passing via a variable skips it.

interface Options {
  color: string;
  width: number;
}

// Call A would fail: { color: "red", width: 50, height: 100 } has excess `height`
// Call B works:
const optsB = { color: "blue", width: 30, height: 200 };
const resultB = (function createBox(opts: Options) {
  return `${opts.color} box, ${opts.width}px`;
})(optsB);

console.log("Ex6:", resultB);
// Output: Ex6: blue box, 30px

// ----------------------------------------------------------------------------
// Exercise 7 — Fix the Bug (Missing Properties)
// ----------------------------------------------------------------------------
// Fix: add the missing `state` and `country` properties.

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const myAddress: Address = {
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zip: "62704",
  country: "US",
};

console.log("Ex7:", myAddress.city, myAddress.state);
// Output: Ex7: Springfield IL

// ----------------------------------------------------------------------------
// Exercise 8 — Fix the Bug (Index Signature Compatibility)
// ----------------------------------------------------------------------------
// Fix: widen the index signature to `string | number` so `id: number` is
// compatible.

interface Metadata {
  id: number;
  name: string;
  [key: string]: string | number;
}

const meta: Metadata = { id: 1, name: "test", tag: "important" };
console.log("Ex8:", meta.id, meta.name, meta.tag);
// Output: Ex8: 1 test important

// ----------------------------------------------------------------------------
// Exercise 9 — Fix the Bug (Extending with Conflict)
// ----------------------------------------------------------------------------
// Fix: `id` in Derived must be a subtype of `string | number`. Changed from
// `boolean` to `string` (which narrows `string | number`).

interface Base {
  id: string | number;
  label: string;
}

interface Derived extends Base {
  id: string; // narrowed from string | number — valid
  priority: number;
}

const item: Derived = { id: "abc", label: "Test", priority: 1 };
console.log("Ex9:", item.id, item.label, item.priority);
// Output: Ex9: abc Test 1

// ----------------------------------------------------------------------------
// Exercise 10 — Fix the Bug (Class Implements)
// ----------------------------------------------------------------------------
// Fix: add the missing `serialize()` method.

interface Cacheable {
  readonly key: string;
  ttl: number;
  isExpired(): boolean;
  serialize(): string;
}

class CacheEntry implements Cacheable {
  readonly key: string;
  ttl: number;
  private createdAt: number;

  constructor(key: string, ttl: number) {
    this.key = key;
    this.ttl = ttl;
    this.createdAt = Date.now();
  }

  isExpired(): boolean {
    return Date.now() - this.createdAt > this.ttl;
  }

  serialize(): string {
    return JSON.stringify({ key: this.key, ttl: this.ttl, createdAt: this.createdAt });
  }
}

const entry = new CacheEntry("user:1", 60000);
console.log("Ex10:", entry.key, entry.isExpired(), entry.serialize());

// ----------------------------------------------------------------------------
// Exercise 11 — Implement (Basic Interface)
// ----------------------------------------------------------------------------

interface Vehicle {
  make: string;
  model: string;
  year: number;
  describe(): string;
}

const car: Vehicle = {
  make: "Toyota",
  model: "Camry",
  year: 2023,
  describe() {
    return `${this.year} ${this.make} ${this.model}`;
  },
};

console.log("Ex11:", car.describe());
// Output: Ex11: 2023 Toyota Camry

// ----------------------------------------------------------------------------
// Exercise 12 — Implement (Optional + Readonly)
// ----------------------------------------------------------------------------

interface BlogPost {
  readonly id: number;
  title: string;
  content: string;
  tags?: string[];
  publishedAt?: Date;
}

function summarize(post: BlogPost): string {
  if (post.tags && post.tags.length > 0) {
    return `${post.title} (${post.tags.length} tags)`;
  }
  return `${post.title} (no tags)`;
}

const post: BlogPost = { id: 1, title: "Hello World", content: "...", tags: ["ts", "intro"] };
const draft: BlogPost = { id: 2, title: "Draft", content: "..." };
console.log("Ex12:", summarize(post), "|", summarize(draft));
// Output: Ex12: Hello World (2 tags) | Draft (no tags)

// ----------------------------------------------------------------------------
// Exercise 13 — Implement (Index Signature)
// ----------------------------------------------------------------------------

interface CSSStyles {
  [key: string]: string;
}

function toStyleString(styles: CSSStyles): string {
  return Object.entries(styles)
    .map(([prop, val]) => `${prop}: ${val}`)
    .join("; ");
}

const styles: CSSStyles = { color: "red", "font-size": "14px", display: "flex" };
console.log("Ex13:", toStyleString(styles));
// Output: Ex13: color: red; font-size: 14px; display: flex

// ----------------------------------------------------------------------------
// Exercise 14 — Implement (Extending Interfaces)
// ----------------------------------------------------------------------------

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt?: Date;
  isDeleted(): boolean;
}

interface DatabaseRecord extends Timestamped, SoftDeletable {
  id: string;
}

interface UserRecord extends DatabaseRecord {
  name: string;
  email: string;
}

const now = new Date();
const user: UserRecord = {
  id: "u-001",
  name: "Alice",
  email: "alice@example.com",
  createdAt: now,
  updatedAt: now,
  isDeleted() {
    return this.deletedAt !== undefined;
  },
};

console.log("Ex14:", user.id, user.name, user.isDeleted());
// Output: Ex14: u-001 Alice false

// ----------------------------------------------------------------------------
// Exercise 15 — Implement (Declaration Merging)
// ----------------------------------------------------------------------------

interface AppEvent {
  type: string;
  timestamp: Date;
}

interface AppEvent {
  payload?: unknown;
  source: string;
}

const event: AppEvent = {
  type: "click",
  timestamp: new Date(),
  source: "button#submit",
};

console.log("Ex15:", event.type, event.source, event.timestamp instanceof Date);
// Output: Ex15: click button#submit true

// ----------------------------------------------------------------------------
// Exercise 16 — Implement (Function Interface)
// ----------------------------------------------------------------------------

interface Predicate<T> {
  (value: T): boolean;
}

const isPositive: Predicate<number> = (value) => value > 0;
const isNonEmpty: Predicate<string> = (value) => value.length > 0;

console.log("Ex16:", isPositive(5), isPositive(-1), isNonEmpty("hi"), isNonEmpty(""));
// Output: Ex16: true false true false

// ----------------------------------------------------------------------------
// Exercise 17 — Implement (Hybrid Type)
// ----------------------------------------------------------------------------

type LogLevel = "info" | "warn" | "error";

interface Logger {
  (message: string): void;
  level: LogLevel;
  setLevel(level: LogLevel): void;
}

function createLogger(): Logger {
  const logger = function (message: string) {
    console.log(`[${logger.level.toUpperCase()}] ${message}`);
  } as Logger;

  logger.level = "info";
  logger.setLevel = function (level: LogLevel) {
    logger.level = level;
  };

  return logger;
}

const logger = createLogger();
logger("hello");
logger.setLevel("error");
logger("something broke");
console.log("Ex17: see output above");

// ----------------------------------------------------------------------------
// Exercise 18 — Implement (Generic Interface)
// ----------------------------------------------------------------------------

interface Stack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  readonly size: number;
}

class ArrayStack<T> implements Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items.length > 0 ? this.items[this.items.length - 1] : undefined;
  }

  get size(): number {
    return this.items.length;
  }
}

const numStack: Stack<number> = new ArrayStack<number>();
numStack.push(10);
numStack.push(20);
numStack.push(30);
console.log("Ex18:", numStack.peek(), numStack.size);
numStack.pop();
console.log("Ex18:", numStack.peek(), numStack.size);

// ============================================================================
console.log("\n=== All exercises complete ===");

export {};
