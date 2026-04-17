// ============================================================
// Declaration Files - Solutions
// ============================================================
// Config: ES2022, strict, ESNext modules
// Run: npx tsx solutions.ts
// ============================================================

// ============================================================
// Exercise 1 - Solution (Interface Merging)
// ============================================================
// All three Config interfaces merge into one with: debug, host, port
// Object.keys returns them in insertion order, sorted alphabetically: debug, host, port

interface Config {
  host: string;
}

interface Config {
  port: number;
}

interface Config {
  host: string;
  debug: boolean;
}

const config: Config = { host: "localhost", port: 3000, debug: true };
console.log("Exercise 1:", Object.keys(config).sort().join(", "));
// Output: "debug, host, port"
// Explanation: All three interface declarations merge. The duplicate `host: string`
// is allowed because it has the identical type. The merged interface requires all
// three unique properties.

// ============================================================
// Exercise 2 - Solution (Function Overload Merging)
// ============================================================

interface Parser {
  parse(input: string): string[];
}

interface Parser {
  parse(input: number): number[];
  parse(input: boolean): boolean[];
}

console.log("Exercise 2: Later interface's overloads have higher priority");
// Overload resolution order:
// 1. parse(input: number): number[]     — from later interface, first in its block
// 2. parse(input: boolean): boolean[]   — from later interface, second in its block
// 3. parse(input: string): string[]     — from earlier interface
//
// Explanation: When interfaces merge, later declarations' function members are
// placed before earlier ones. Within a single interface, order is preserved.

// ============================================================
// Exercise 3 - Solution (Namespace + Function Merging)
// ============================================================

function greet(name: string): string {
  return `Hello, ${name}!`;
}

namespace greet {
  export const defaultName = "World";
  export function loud(name: string): string {
    return greet(name).toUpperCase();
  }
}

console.log("Exercise 3:", greet(greet.defaultName));
console.log("Exercise 3:", greet.loud("TypeScript"));
// Output:
//   "Hello, World!"
//   "HELLO, TYPESCRIPT!"
// Explanation: The namespace merges with the function, adding `defaultName` and
// `loud` as properties. `greet.loud` calls `greet()` which is the original function.

// ============================================================
// Exercise 4 - Solution (Namespace + Enum Merging)
// ============================================================

enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

namespace Status {
  export function isActive(status: Status): boolean {
    return status === Status.Active;
  }
}

console.log("Exercise 4:", Status.isActive(Status.Active));
console.log("Exercise 4:", Status.isActive(Status.Inactive));
// Output:
//   true
//   false
// Explanation: The namespace adds the `isActive` function to the Status enum object.
// Enum members and namespace exports coexist on the same object.

// ============================================================
// Exercise 5 - Solution (Namespace + Class Merging)
// ============================================================

class Serializer {
  serialize(data: unknown): string {
    return JSON.stringify(data);
  }
}

namespace Serializer {
  export interface Options {
    pretty: boolean;
    maxDepth: number;
  }

  export function withOptions(opts: Options): Serializer {
    return new Serializer();
  }
}

const opts: Serializer.Options = { pretty: true, maxDepth: 3 };
const s = Serializer.withOptions(opts);
console.log("Exercise 5:", typeof Serializer.withOptions);
console.log("Exercise 5:", s instanceof Serializer);
// Output:
//   "function"
//   true
// Explanation: `Serializer.withOptions` is a function (from the namespace).
// It returns `new Serializer()`, so `instanceof` is true. The namespace also
// exports the `Options` interface as `Serializer.Options` (a type-only export).

// ============================================================
// Exercise 6 - Solution (Declaration Merging Order)
// ============================================================

interface MergeTest {
  a: string;
}

interface MergeTest {
  b: number;
}

interface MergeTest {
  c: boolean;
}

const mergeObj: MergeTest = { a: "hello", b: 42, c: true };
console.log("Exercise 6:", JSON.stringify(mergeObj));
// Output: {"a":"hello","b":42,"c":true}
// Explanation: All three interfaces merge. The object literal defines keys in
// the order given, and JSON.stringify preserves insertion order.

// ============================================================
// Exercise 7 - Solution (Incomplete Interface Merge)
// ============================================================
// Fix: Add the missing `legs` property.

interface Animal {
  name: string;
  sound: string;
}

interface Animal {
  legs: number;
}

const dog: Animal = { name: "Rex", sound: "Woof", legs: 4 };
console.log("Exercise 7:", `${dog.name} has ${dog.legs} legs and says ${dog.sound}`);
// Explanation: The merged Animal interface requires name, sound, AND legs.
// The original object was missing `legs: number`.

// ============================================================
// Exercise 8 - Solution (Namespace Merge Access)
// ============================================================
// The code actually works as-is because the namespace merges with the class,
// and `new Logger()` inside the namespace refers to the class constructor.
// The @ts-expect-error was the bug — remove it.

class Logger {
  log(msg: string): void {
    console.log(`[LOG] ${msg}`);
  }
}

namespace Logger {
  export function create(): Logger {
    // Fix: Remove @ts-expect-error — this is valid.
    // In a namespace merged with a class, the class constructor is accessible.
    return new Logger();
  }
}

const logger = Logger.create();
console.log("Exercise 8:", logger instanceof Logger);
// Output: true
// Explanation: When a namespace merges with a class, code inside the namespace
// can use `new Logger()` because it resolves to the class constructor. The
// The ts-expect-error directive was suppressing a non-existent error, which
// itself caused an error ("Unused directive").

// ============================================================
// Exercise 9 - Solution (Conflicting Merge)
// ============================================================
// Fix: Both declarations of `port` must have the same type (number).

interface ServerConfig {
  port: number;
  hostname: string;
}

interface ServerConfig {
  port: number; // Must match the type in the first declaration
  ssl: boolean;
}

const serverConfig: ServerConfig = { port: 3000, hostname: "localhost", ssl: true };
console.log(
  "Exercise 9:",
  `Server at ${serverConfig.hostname}:${serverConfig.port}, SSL: ${serverConfig.ssl}`
);
// Explanation: When merging interfaces, non-function members with the same name
// must have identical types. If one says `port: number` and the other says
// `port: string`, TypeScript reports a conflict error.

// ============================================================
// Exercise 10 - Solution (Namespace + Function Pattern)
// ============================================================

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

namespace formatCurrency {
  export let currency = "USD";
  export function withEuro(amount: number): string {
    return `${amount.toFixed(2)} EUR`;
  }
}

console.log("Exercise 10:", formatCurrency(42.5));
console.log("Exercise 10:", formatCurrency.currency);
console.log("Exercise 10:", formatCurrency.withEuro(42.5));
// Output:
//   "$42.50"
//   "USD"
//   "42.50 EUR"
// Explanation: The namespace merges with the function, adding `currency` and
// `withEuro` as properties on the function object. This is a common pattern
// for functions with configuration or utility sub-methods.

// ============================================================
// Exercise 11 - Solution (Declaration Merging for Plugin System)
// ============================================================

interface PluginRegistry {
  core: { version: string };
}

interface PluginRegistry {
  auth: { login(): string };
}

interface PluginRegistry {
  cache: { get(key: string): string | null };
}

const registry: PluginRegistry = {
  core: { version: "1.0.0" },
  auth: {
    login() {
      return "logged-in";
    },
  },
  cache: {
    get(key: string): string | null {
      return key === "test" ? "cached-value" : null;
    },
  },
};

console.log("Exercise 11:", registry.core.version);
console.log("Exercise 11:", registry.auth.login());
console.log("Exercise 11:", registry.cache.get("test"));
// Output:
//   "1.0.0"
//   "logged-in"
//   "cached-value"
// Explanation: Three separate interface declarations merge into one that requires
// all three plugin properties. This pattern is used in real plugin systems where
// each plugin augments a central registry interface.

// ============================================================
// Exercise 12 - Solution (Namespace + Class Inner Types)
// ============================================================

class HttpClient {
  request(url: string, opts: HttpClient.RequestOptions): HttpClient.Response {
    return {
      status: 200,
      body: `Response from ${url} [${opts.method}]`,
    };
  }
}

namespace HttpClient {
  export interface RequestOptions {
    method: string;
    headers?: Record<string, string>;
  }

  export interface Response {
    status: number;
    body: string;
  }
}

const client = new HttpClient();
const resp = client.request("https://api.example.com", { method: "GET" });
console.log("Exercise 12:", resp.status, resp.body);
// Output: 200 Response from https://api.example.com [GET]
// Explanation: The namespace adds inner type definitions (RequestOptions, Response)
// that are accessed as HttpClient.RequestOptions and HttpClient.Response. This
// keeps related types scoped under the class name.

// ============================================================
// Exercise 13 - Solution (Namespace + Enum Utility)
// ============================================================

enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

namespace LogLevel {
  const map: Record<string, LogLevel> = {
    debug: LogLevel.Debug,
    info: LogLevel.Info,
    warn: LogLevel.Warn,
    error: LogLevel.Error,
  };

  const reverseMap: Record<number, string> = {
    [LogLevel.Debug]: "debug",
    [LogLevel.Info]: "info",
    [LogLevel.Warn]: "warn",
    [LogLevel.Error]: "error",
  };

  export function fromString(level: string): LogLevel {
    return map[level.toLowerCase()] ?? LogLevel.Info;
  }

  export function toString(level: LogLevel): string {
    return reverseMap[level] ?? "info";
  }
}

console.log("Exercise 13:", LogLevel.fromString("error"));
console.log("Exercise 13:", LogLevel.toString(LogLevel.Debug));
console.log("Exercise 13:", LogLevel.fromString("unknown"));
// Output:
//   3
//   "debug"
//   1
// Explanation: The namespace adds utility functions to the enum object. `fromString`
// parses a string to an enum value (defaulting to Info), and `toString` converts
// an enum value back to its lowercase name.

// ============================================================
// Exercise 14 - Solution (Merged Interface with Overloads)
// ============================================================

interface Converter {
  convert(value: string): number;
}

interface Converter {
  convert(value: number): string;
}

function createConverter(): Converter {
  return {
    convert(value: string | number): string | number {
      if (typeof value === "string") {
        return Number(value);
      }
      return String(value);
    },
  } as Converter;
}

const converter = createConverter();
console.log("Exercise 14:", converter.convert("42"));
console.log("Exercise 14:", converter.convert(42));
console.log("Exercise 14:", typeof converter.convert("42"));
console.log("Exercise 14:", typeof converter.convert(42));
// Output:
//   42
//   "42"
//   "number"
//   "string"
// Explanation: The two Converter interfaces merge, creating overloaded `convert`.
// The implementation uses a union type internally and narrows with typeof. We use
// `as Converter` because the implementation signature is wider than either overload.

// ============================================================
// Exercise 15 - Solution (declare global simulation)
// ============================================================

declare global {
  interface Array<T> {
    sum(): number;
  }
}

Array.prototype.sum = function (): number {
  return this.reduce((acc: number, val: number) => acc + val, 0);
};

const nums = [1, 2, 3, 4, 5];
console.log("Exercise 15:", nums.sum());
// Output: 15
// Explanation: `declare global` inside a module file lets us augment the global
// `Array` interface with a new method. We then implement it on Array.prototype.
// This is the same pattern libraries like dayjs or mongoose use to extend built-ins.

// ============================================================
// Runner
// ============================================================
console.log("\n--- All exercises completed ---");

export {};
