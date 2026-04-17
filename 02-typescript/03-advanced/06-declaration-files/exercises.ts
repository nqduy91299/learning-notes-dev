// ============================================================
// Declaration Files - Exercises
// ============================================================
// Config: ES2022, strict, ESNext modules
// Run: npx tsx exercises.ts
// ============================================================

// ============================================================
// Exercise 1 - Predict the Output (Interface Merging)
// ============================================================
// What does this print?

interface Config {
  host: string;
}

interface Config {
  port: number;
}

interface Config {
  host: string; // duplicate with same type is OK
  debug: boolean;
}

const config: Config = { host: "localhost", port: 3000, debug: true };
// console.log(Object.keys(config).sort().join(", "));

// Your prediction:

// ============================================================
// Exercise 2 - Predict the Output (Function Overload Merging)
// ============================================================
// What does this print?

interface Parser {
  parse(input: string): string[];
}

interface Parser {
  parse(input: number): number[];
  parse(input: boolean): boolean[];
}

// The merged interface has overloads. Later declarations come first.
// What is the order of overloads?
// console.log("Later interface's overloads have higher priority");

// Your prediction of the overload resolution order:
// 1.
// 2.
// 3.

// ============================================================
// Exercise 3 - Predict the Output (Namespace + Function Merging)
// ============================================================
// What does this print?

function greet(name: string): string {
  return `Hello, ${name}!`;
}

namespace greet {
  export const defaultName = "World";
  export function loud(name: string): string {
    return greet(name).toUpperCase();
  }
}

// console.log(greet(greet.defaultName));
// console.log(greet.loud("TypeScript"));

// Your prediction:

// ============================================================
// Exercise 4 - Predict the Output (Namespace + Enum Merging)
// ============================================================
// What does this print?

enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

namespace Status {
  export function isActive(status: Status): boolean {
    return status === Status.Active;
  }
}

// console.log(Status.isActive(Status.Active));
// console.log(Status.isActive(Status.Inactive));

// Your prediction:

// ============================================================
// Exercise 5 - Predict the Output (Namespace + Class Merging)
// ============================================================
// What does this print?

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
// console.log(typeof Serializer.withOptions);
// console.log(s instanceof Serializer);

// Your prediction:

// ============================================================
// Exercise 6 - Predict the Output (Declaration Merging Order)
// ============================================================
// What does this print?

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
// console.log(JSON.stringify(mergeObj));

// Your prediction:

// ============================================================
// Exercise 7 - Fix the Bug (Incomplete Interface Merge)
// ============================================================
// The code below should compile, but there's a type error.
// Fix the object literal so it satisfies the merged interface.

interface Animal {
  name: string;
  sound: string;
}

interface Animal {
  legs: number;
}

// FIX: This object is missing a required property
// const dog: Animal = { name: "Rex", sound: "Woof" };
// console.log(`${dog.name} has ${dog.legs} legs and says ${dog.sound}`);

// ============================================================
// Exercise 8 - Fix the Bug (Namespace Merge Access)
// ============================================================
// The namespace function can't access the class constructor.
// Fix the namespace function so it works correctly.

class Logger {
  log(msg: string): void {
    console.log(`[LOG] ${msg}`);
  }
}

namespace Logger {
  // FIX: This function should create and return a Logger instance
  // but something about the return type or construction is wrong
  export function create(): Logger {
    const _l = undefined;
    return _l as unknown as Logger; // FIX THIS: should return a new Logger instance properly
  }
}

// const logger = Logger.create();
// console.log(logger instanceof Logger);

// ============================================================
// Exercise 9 - Fix the Bug (Conflicting Merge)
// ============================================================
// Two interfaces declare the same non-function property with different types.
// Fix so they merge correctly.

interface ServerConfig {
  port: number;
  hostname: string;
}

// FIX: This interface has a conflicting property type with the one above.
// Change it so both interfaces merge without error.
interface ServerConfig {
  // port was `string` here which conflicts — fix it
  port: number;
  ssl: boolean;
}

// const serverConfig: ServerConfig = { port: 3000, hostname: "localhost", ssl: true };
// console.log(`Server at ${serverConfig.hostname}:${serverConfig.port}, SSL: ${serverConfig.ssl}`);

// ============================================================
// Exercise 10 - Implement (Namespace + Function Pattern)
// ============================================================
// Create a function `formatCurrency` that formats a number as "$X.XX".
// Then create a namespace `formatCurrency` with:
//   - a `currency` property (string, default "USD")
//   - a `withEuro` function that formats as "X.XX EUR"

// YOUR CODE HERE

// console.log(formatCurrency(42.5));          // "$42.50"
// console.log(formatCurrency.currency);       // "USD"
// console.log(formatCurrency.withEuro(42.5)); // "42.50 EUR"

// ============================================================
// Exercise 11 - Implement (Declaration Merging for Plugin System)
// ============================================================
// Create a plugin system using interface merging.
// 1. Define interface `PluginRegistry` with a property `core: { version: string }`
// 2. Define another `PluginRegistry` that adds `auth: { login(): string }`
// 3. Define another `PluginRegistry` that adds `cache: { get(key: string): string | null }`
// 4. Create a `registry` object satisfying the full merged interface

// YOUR CODE HERE

// console.log(registry.core.version);
// console.log(registry.auth.login());
// console.log(registry.cache.get("test"));

// ============================================================
// Exercise 12 - Implement (Namespace + Class Inner Types)
// ============================================================
// Create a class `HttpClient` with a method `request(url: string, opts: HttpClient.RequestOptions): HttpClient.Response`
// In the namespace `HttpClient`, define:
//   - interface `RequestOptions` with `method: string` and `headers?: Record<string, string>`
//   - interface `Response` with `status: number`, `body: string`

// YOUR CODE HERE

// const client = new HttpClient();
// const resp = client.request("https://api.example.com", { method: "GET" });
// console.log(resp.status, resp.body);

// ============================================================
// Exercise 13 - Implement (Namespace + Enum Utility)
// ============================================================
// Create an enum `LogLevel` with members: Debug=0, Info=1, Warn=2, Error=3
// Create a namespace `LogLevel` with:
//   - `fromString(level: string): LogLevel` that maps "debug"->Debug, "info"->Info, etc. (default: Info)
//   - `toString(level: LogLevel): string` that returns the lowercase string name

// YOUR CODE HERE

// console.log(LogLevel.fromString("error"));      // 3
// console.log(LogLevel.toString(LogLevel.Debug));  // "debug"
// console.log(LogLevel.fromString("unknown"));     // 1 (default Info)

// ============================================================
// Exercise 14 - Implement (Merged Interface with Overloads)
// ============================================================
// Create a merged interface `Converter` with overloaded `convert` method:
// First interface: convert(value: string): number
// Second interface: convert(value: number): string
// Implement a function `createConverter` that returns a Converter.

// YOUR CODE HERE

// const converter = createConverter();
// console.log(converter.convert("42"));    // 42
// console.log(converter.convert(42));      // "42"
// console.log(typeof converter.convert("42")); // "number"
// console.log(typeof converter.convert(42));   // "string"

// ============================================================
// Exercise 15 - Implement (declare global simulation)
// ============================================================
// Using `declare global`, extend the built-in `Array` interface to include
// a `sum()` method that returns number (only for number arrays conceptually).
// Then implement it on Array.prototype and demonstrate it works.

// YOUR CODE HERE

// const nums = [1, 2, 3, 4, 5];
// console.log(nums.sum()); // 15

export {};
