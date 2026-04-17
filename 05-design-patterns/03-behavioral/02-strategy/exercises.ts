// =============================================================================
// Strategy Pattern — Exercises
// =============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 12 exercises: 4 predict output, 2 fix bugs, 6 implement
// All tests are commented out. Uncomment to verify your solutions.
// =============================================================================

// ─── Shared Utilities ────────────────────────────────────────────────────────

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg}\n  expected: ${e}\n  actual:   ${a}`);
}

// =============================================================================
// EXERCISE 1 — Predict Output (Basic Strategy Dispatch)
// =============================================================================
// What does the following code print? Write your answer before running.

interface MathStrategy {
  execute(a: number, b: number): number;
}

class AddStrategy implements MathStrategy {
  execute(a: number, b: number): number { return a + b; }
}

class MultiplyStrategy implements MathStrategy {
  execute(a: number, b: number): number { return a * b; }
}

class Calculator {
  constructor(private strategy: MathStrategy) {}
  setStrategy(s: MathStrategy): void { this.strategy = s; }
  calculate(a: number, b: number): number { return this.strategy.execute(a, b); }
}

function exercise1(): void {
  const calc = new Calculator(new AddStrategy());
  const r1 = calc.calculate(3, 4);
  calc.setStrategy(new MultiplyStrategy());
  const r2 = calc.calculate(3, 4);
  calc.setStrategy(new AddStrategy());
  const r3 = calc.calculate(r1, r2);
  console.log(`Ex1: ${r1}, ${r2}, ${r3}`);
}

// Your prediction: _______________
// exercise1();

// =============================================================================
// EXERCISE 2 — Predict Output (Function-Based Strategy)
// =============================================================================

type Formatter = (s: string) => string;

class TextProcessor {
  constructor(private format: Formatter) {}
  setFormat(f: Formatter): void { this.format = f; }
  process(text: string): string { return this.format(text); }
}

function exercise2(): void {
  const upper: Formatter = (s) => s.toUpperCase();
  const snakeCase: Formatter = (s) => s.toLowerCase().replace(/\s+/g, "_");
  const repeat: Formatter = (s) => `${s}${s}`;

  const tp = new TextProcessor(upper);
  const a = tp.process("hello");
  tp.setFormat(snakeCase);
  const b = tp.process("Hello World");
  tp.setFormat(repeat);
  const c = tp.process("ab");
  console.log(`Ex2: ${a}, ${b}, ${c}`);
}

// Your prediction: _______________
// exercise2();

// =============================================================================
// EXERCISE 3 — Predict Output (Strategy with State)
// =============================================================================

interface CountStrategy {
  count(text: string): number;
}

class WordCount implements CountStrategy {
  count(text: string): number {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  }
}

class CharCount implements CountStrategy {
  count(text: string): number {
    return text.length;
  }
}

class UniqueWordCount implements CountStrategy {
  count(text: string): number {
    if (text.trim() === "") return 0;
    return new Set(text.trim().toLowerCase().split(/\s+/)).size;
  }
}

function exercise3(): void {
  const strategies: CountStrategy[] = [
    new WordCount(),
    new CharCount(),
    new UniqueWordCount(),
  ];
  const text = "the cat sat on the mat";
  const results = strategies.map((s) => s.count(text));
  console.log(`Ex3: ${results.join(", ")}`);
}

// Your prediction: _______________
// exercise3();

// =============================================================================
// EXERCISE 4 — Predict Output (Strategy Registry)
// =============================================================================

class StrategyRegistry<T> {
  private map = new Map<string, T>();
  register(name: string, strategy: T): this { this.map.set(name, strategy); return this; }
  get(name: string): T {
    const s = this.map.get(name);
    if (!s) throw new Error(`Unknown: ${name}`);
    return s;
  }
  names(): string[] { return [...this.map.keys()]; }
}

function exercise4(): void {
  type Op = (a: number, b: number) => number;
  const reg = new StrategyRegistry<Op>();
  reg.register("add", (a, b) => a + b)
     .register("mul", (a, b) => a * b)
     .register("add", (a, b) => a + b + 1); // re-register "add"

  const r1 = reg.get("add")(10, 5);
  const r2 = reg.get("mul")(10, 5);
  console.log(`Ex4: ${r1}, ${r2}, names=[${reg.names().join(",")}]`);
}

// Your prediction: _______________
// exercise4();

// =============================================================================
// EXERCISE 5 — Fix the Bug (Broken Strategy Swap)
// =============================================================================
// The DiscountCalculator should apply the current strategy to the price.
// But it always returns the original price. Find and fix the bug.

interface DiscountStrategy {
  apply(price: number): number;
}

class NoDiscount implements DiscountStrategy {
  apply(price: number): number { return price; }
}

class PercentDiscount implements DiscountStrategy {
  constructor(private percent: number) {}
  apply(price: number): number { return price * (1 - this.percent / 100); }
}

class FixedDiscount implements DiscountStrategy {
  constructor(private amount: number) {}
  apply(price: number): number { return Math.max(0, price - this.amount); }
}

class DiscountCalculator {
  private strategy: DiscountStrategy;

  constructor(strategy: DiscountStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: DiscountStrategy): void {
    // BUG: Something is wrong here
    strategy = this.strategy;
  }

  calculate(price: number): number {
    return this.strategy.apply(price);
  }
}

function exercise5(): void {
  const calc = new DiscountCalculator(new NoDiscount());
  calc.setStrategy(new PercentDiscount(20));
  const r1 = calc.calculate(100);

  calc.setStrategy(new FixedDiscount(15));
  const r2 = calc.calculate(100);

  console.log(`Ex5: ${r1}, ${r2}`);
  // assertEq(r1, 80, "20% off 100");
  // assertEq(r2, 85, "15 off 100");
}

// exercise5();

// =============================================================================
// EXERCISE 6 — Fix the Bug (Missing Return in Strategy)
// =============================================================================
// The Serializer should serialize data to different formats.
// JSON works, but CSV produces `undefined`. Find and fix the bug.

interface SerializationStrategy {
  serialize(data: Record<string, string>[]): string;
}

class JsonStrategy implements SerializationStrategy {
  serialize(data: Record<string, string>[]): string {
    return JSON.stringify(data);
  }
}

class CsvStrategy implements SerializationStrategy {
  serialize(data: Record<string, string>[]): string {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const headerLine = headers.join(",");
    const rows = data.map((row) => {
      // BUG: something wrong in the line below
      headers.map((h) => row[h] ?? "").join(",");
    });
    `${headerLine}\n${rows.join("\n")}`;
  }
}

class Serializer {
  constructor(private strategy: SerializationStrategy) {}
  setStrategy(s: SerializationStrategy): void { this.strategy = s; }
  run(data: Record<string, string>[]): string { return this.strategy.run(data); }
}

function exercise6(): void {
  const data = [
    { name: "Alice", age: "30" },
    { name: "Bob", age: "25" },
  ];

  const serializer = new Serializer(new JsonStrategy());
  const json = serializer.run(data);

  serializer.setStrategy(new CsvStrategy());
  const csv = serializer.run(data);

  console.log(`Ex6 JSON: ${json}`);
  console.log(`Ex6 CSV:\n${csv}`);
  // assertEq(csv, "name,age\nAlice,30\nBob,25", "CSV output");
}

// exercise6();

// =============================================================================
// EXERCISE 7 — Implement (Sorting Strategy)
// =============================================================================
// Implement a SortContext class that uses interchangeable sorting strategies.
//
// Requirements:
// - Interface `SortStrategy<T>` with method `sort(items: T[], compare: (a: T, b: T) => number): T[]`
// - Class `BubbleSortStrategy<T>` implementing bubble sort
// - Class `SelectionSortStrategy<T>` implementing selection sort
// - Class `SortContext<T>` with constructor(strategy), setStrategy(s), sort(items, compare)
// - sort() must NOT mutate the input array

// YOUR CODE HERE

function exercise7(): void {
  // const ctx = new SortContext(new BubbleSortStrategy<number>());
  // const data = [5, 2, 8, 1, 9, 3];
  // const compare = (a: number, b: number) => a - b;
  //
  // const r1 = ctx.sort(data, compare);
  // assertEq(r1, [1, 2, 3, 5, 8, 9], "bubble sort");
  // assertEq(data, [5, 2, 8, 1, 9, 3], "original not mutated");
  //
  // ctx.setStrategy(new SelectionSortStrategy<number>());
  // const r2 = ctx.sort(data, compare);
  // assertEq(r2, [1, 2, 3, 5, 8, 9], "selection sort");
  //
  // console.log("Ex7: PASSED");
}

// exercise7();

// =============================================================================
// EXERCISE 8 — Implement (Validation Strategy)
// =============================================================================
// Implement a form validation system using the Strategy pattern.
//
// Requirements:
// - Interface `Validator` with method `validate(value: string): ValidationResult`
// - Type `ValidationResult = { valid: boolean; errors: string[] }`
// - Class `RequiredValidator` — fails if value is empty/whitespace
// - Class `MinLengthValidator` — constructor(min: number), fails if too short
// - Class `PatternValidator` — constructor(pattern: RegExp, message: string)
// - Class `CompositeValidator` — constructor(validators: Validator[]), runs all and
//   aggregates errors (valid only if ALL pass)

// YOUR CODE HERE

function exercise8(): void {
  // const emailValidator = new CompositeValidator([
  //   new RequiredValidator(),
  //   new MinLengthValidator(5),
  //   new PatternValidator(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  // ]);
  //
  // const r1 = emailValidator.validate("");
  // assert(!r1.valid, "empty should fail");
  // assert(r1.errors.length >= 1, "should have errors");
  //
  // const r2 = emailValidator.validate("ab");
  // assert(!r2.valid, "too short");
  //
  // const r3 = emailValidator.validate("test@example.com");
  // assert(r3.valid, "valid email");
  // assertEq(r3.errors, [], "no errors");
  //
  // const r4 = emailValidator.validate("notanemail");
  // assert(!r4.valid, "not an email");
  //
  // console.log("Ex8: PASSED");
}

// exercise8();

// =============================================================================
// EXERCISE 9 — Implement (Pricing Strategy)
// =============================================================================
// Implement a pricing system for an e-commerce platform.
//
// Requirements:
// - Interface `PricingStrategy` with method `calculatePrice(basePrice: number, quantity: number): number`
// - Class `RegularPricing` — price * quantity
// - Class `BulkPricing` — 10% off if quantity >= 10, 20% off if >= 50
// - Class `PremiumPricing` — always 15% off, plus free shipping (subtract 5.99 flat)
//   Result must be >= 0.
// - Class `ShoppingCart` with constructor(strategy), setStrategy(s),
//   getTotal(basePrice, quantity)

// YOUR CODE HERE

function exercise9(): void {
  // const cart = new ShoppingCart(new RegularPricing());
  // assertEq(cart.getTotal(10, 5), 50, "regular 10*5");
  //
  // cart.setStrategy(new BulkPricing());
  // assertEq(cart.getTotal(10, 10), 90, "bulk 10*10 -> 10% off");
  // assertEq(cart.getTotal(10, 50), 400, "bulk 10*50 -> 20% off");
  // assertEq(cart.getTotal(10, 5), 50, "bulk <10 no discount");
  //
  // cart.setStrategy(new PremiumPricing());
  // assertEq(cart.getTotal(10, 5), 36.51, "premium 10*5 -> 15% off - 5.99");
  // assertEq(cart.getTotal(1, 1), 0, "premium min 0");
  //
  // console.log("Ex9: PASSED");
}

// exercise9();

// =============================================================================
// EXERCISE 10 — Implement (Text Search Strategy)
// =============================================================================
// Implement a text search system with different matching strategies.
//
// Requirements:
// - Interface `SearchStrategy` with method `search(text: string, query: string): SearchResult[]`
// - Type `SearchResult = { index: number; match: string }`
// - Class `ExactMatchStrategy` — finds all exact (case-sensitive) occurrences
// - Class `CaseInsensitiveStrategy` — finds all case-insensitive occurrences
// - Class `RegexSearchStrategy` — treats query as a regex pattern, finds all matches
// - Class `SearchEngine` with constructor(strategy), setStrategy(s), search(text, query)

// YOUR CODE HERE

function exercise10(): void {
  // const engine = new SearchEngine(new ExactMatchStrategy());
  // const text = "The Cat sat on the cat mat";
  //
  // const r1 = engine.search(text, "cat");
  // assertEq(r1.length, 1, "exact: 1 match");
  // assertEq(r1[0].index, 19, "exact: correct index");
  //
  // engine.setStrategy(new CaseInsensitiveStrategy());
  // const r2 = engine.search(text, "cat");
  // assertEq(r2.length, 2, "case-insensitive: 2 matches");
  //
  // engine.setStrategy(new RegexSearchStrategy());
  // const r3 = engine.search(text, "\\b[Cc]at\\b");
  // assertEq(r3.length, 2, "regex: 2 matches");
  //
  // console.log("Ex10: PASSED");
}

// exercise10();

// =============================================================================
// EXERCISE 11 — Implement (Retry Strategy)
// =============================================================================
// Implement a retry mechanism with different backoff strategies.
//
// Requirements:
// - Interface `BackoffStrategy` with method `getDelay(attempt: number): number`
//   (attempt is 1-based)
// - Class `FixedBackoff` — constructor(delayMs: number), always returns delayMs
// - Class `LinearBackoff` — constructor(baseMs: number), returns baseMs * attempt
// - Class `ExponentialBackoff` — constructor(baseMs: number), returns baseMs * 2^(attempt-1)
//   (attempt 1 → baseMs, attempt 2 → baseMs*2, attempt 3 → baseMs*4, etc.)
// - Class `RetryExecutor` with:
//   - constructor(strategy: BackoffStrategy, maxRetries: number)
//   - async execute<T>(fn: () => Promise<T>): Promise<T>
//     Calls fn, if it throws retry up to maxRetries times using the backoff strategy.
//     For testing: instead of actual delay, collect delays in a `delays: number[]` property.
//     If all retries exhausted, throw the last error.

// YOUR CODE HERE

function exercise11(): void {
  // (async () => {
  //   let callCount = 0;
  //   const failTwice = async (): Promise<string> => {
  //     callCount++;
  //     if (callCount <= 2) throw new Error(`Fail #${callCount}`);
  //     return "success";
  //   };
  //
  //   const executor = new RetryExecutor(new ExponentialBackoff(100), 3);
  //   const result = await executor.execute(failTwice);
  //   assertEq(result, "success", "should succeed on 3rd try");
  //   assertEq(executor.delays, [100, 200], "exponential delays");
  //
  //   // Test max retries exceeded
  //   const alwaysFails = async (): Promise<string> => { throw new Error("nope"); };
  //   const executor2 = new RetryExecutor(new FixedBackoff(50), 2);
  //   try {
  //     await executor2.execute(alwaysFails);
  //     assert(false, "should have thrown");
  //   } catch (e) {
  //     assert((e as Error).message === "nope", "correct error");
  //     assertEq(executor2.delays, [50, 50], "fixed delays");
  //   }
  //
  //   console.log("Ex11: PASSED");
  // })();
}

// exercise11();

// =============================================================================
// EXERCISE 12 — Implement (Logging Strategy with Functional Approach)
// =============================================================================
// Implement a logger using function-based strategies (no classes for strategies).
//
// Requirements:
// - Type `LogLevel = "debug" | "info" | "warn" | "error"`
// - Type `LogEntry = { level: LogLevel; message: string; timestamp: Date }`
// - Type `LoggingStrategy = (entry: LogEntry) => string`
// - Implement these strategy functions:
//   - `plainTextLog` — returns `[LEVEL] message`
//   - `jsonLog` — returns JSON.stringify of { level, message, timestamp: ISO string }
//   - `coloredLog` — returns `\x1b[COLORm[LEVEL]\x1b[0m message`
//     Colors: debug=36(cyan), info=32(green), warn=33(yellow), error=31(red)
// - Class `Logger`:
//   - constructor(strategy: LoggingStrategy)
//   - setStrategy(s: LoggingStrategy): void
//   - log(level: LogLevel, message: string): string — creates a LogEntry and returns
//     the formatted string (use a fixed date for testability: new Date("2025-01-01T00:00:00Z"))
//   - Convenience methods: debug(msg), info(msg), warn(msg), error(msg) — call log()

// YOUR CODE HERE

function exercise12(): void {
  // const logger = new Logger(plainTextLog);
  //
  // const r1 = logger.info("server started");
  // assertEq(r1, "[INFO] server started", "plain text");
  //
  // logger.setStrategy(jsonLog);
  // const r2 = logger.error("disk full");
  // const parsed = JSON.parse(r2);
  // assertEq(parsed.level, "error", "json level");
  // assertEq(parsed.message, "disk full", "json message");
  //
  // logger.setStrategy(coloredLog);
  // const r3 = logger.warn("low memory");
  // assert(r3.includes("\x1b[33m"), "yellow for warn");
  // assert(r3.includes("[WARN]"), "contains level");
  //
  // console.log("Ex12: PASSED");
}

// exercise12();

// =============================================================================
// Run all exercises (uncomment as you complete them)
// =============================================================================
// exercise1();
// exercise2();
// exercise3();
// exercise4();
// exercise5();
// exercise6();
// exercise7();
// exercise8();
// exercise9();
// exercise10();
// exercise11();
// exercise12();
