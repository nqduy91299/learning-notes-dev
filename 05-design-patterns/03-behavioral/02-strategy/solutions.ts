// =============================================================================
// Strategy Pattern — Solutions
// =============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// =============================================================================

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg}\n  expected: ${e}\n  actual:   ${a}`);
}

// =============================================================================
// EXERCISE 1 — Predict Output
// =============================================================================
// Answer: Ex1: 7, 12, 19
//
// calc starts with AddStrategy: 3 + 4 = 7
// switches to MultiplyStrategy: 3 * 4 = 12
// switches back to AddStrategy: 7 + 12 = 19

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
  assertEq(r1, 7, "r1");
  assertEq(r2, 12, "r2");
  assertEq(r3, 19, "r3");
}

// =============================================================================
// EXERCISE 2 — Predict Output
// =============================================================================
// Answer: Ex2: HELLO, hello_world, abab
//
// upper("hello") → "HELLO"
// snakeCase("Hello World") → "hello_world"
// repeat("ab") → "abab"

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
  assertEq(a, "HELLO", "a");
  assertEq(b, "hello_world", "b");
  assertEq(c, "abab", "c");
}

// =============================================================================
// EXERCISE 3 — Predict Output
// =============================================================================
// Answer: Ex3: 6, 22, 5
//
// "the cat sat on the mat" → 6 words, 22 chars, 5 unique words (the,cat,sat,on,mat)

interface CountStrategy {
  count(text: string): number;
}

class WordCount implements CountStrategy {
  count(text: string): number {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  }
}

class CharCount implements CountStrategy {
  count(text: string): number { return text.length; }
}

class UniqueWordCount implements CountStrategy {
  count(text: string): number {
    if (text.trim() === "") return 0;
    return new Set(text.trim().toLowerCase().split(/\s+/)).size;
  }
}

function exercise3(): void {
  const strategies: CountStrategy[] = [new WordCount(), new CharCount(), new UniqueWordCount()];
  const text = "the cat sat on the mat";
  const results = strategies.map((s) => s.count(text));
  console.log(`Ex3: ${results.join(", ")}`);
  assertEq(results, [6, 22, 5], "counts");
}

// =============================================================================
// EXERCISE 4 — Predict Output
// =============================================================================
// Answer: Ex4: 16, 50, names=[add,mul]
//
// "add" is re-registered with (a, b) => a + b + 1, so 10 + 5 + 1 = 16
// "mul": 10 * 5 = 50
// Map keys: add, mul (re-registration doesn't duplicate)

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
     .register("add", (a, b) => a + b + 1);

  const r1 = reg.get("add")(10, 5);
  const r2 = reg.get("mul")(10, 5);
  console.log(`Ex4: ${r1}, ${r2}, names=[${reg.names().join(",")}]`);
  assertEq(r1, 16, "r1");
  assertEq(r2, 50, "r2");
}

// =============================================================================
// EXERCISE 5 — Fix the Bug
// =============================================================================
// Bug: In setStrategy, the assignment is reversed: `strategy = this.strategy`
// should be `this.strategy = strategy`

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
  constructor(strategy: DiscountStrategy) { this.strategy = strategy; }
  setStrategy(strategy: DiscountStrategy): void {
    this.strategy = strategy; // FIX: was `strategy = this.strategy`
  }
  calculate(price: number): number { return this.strategy.apply(price); }
}

function exercise5(): void {
  const calc = new DiscountCalculator(new NoDiscount());
  calc.setStrategy(new PercentDiscount(20));
  const r1 = calc.calculate(100);
  calc.setStrategy(new FixedDiscount(15));
  const r2 = calc.calculate(100);
  console.log(`Ex5: ${r1}, ${r2}`);
  assertEq(r1, 80, "20% off 100");
  assertEq(r2, 85, "15 off 100");
}

// =============================================================================
// EXERCISE 6 — Fix the Bug
// =============================================================================
// Bugs:
// 1. CsvStrategy.serialize: `rows` map callback missing `return` keyword
// 2. CsvStrategy.serialize: missing `return` before template literal
// 3. Serializer.run calls `this.strategy.run` but the method is named `serialize`

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
      return headers.map((h) => row[h] ?? "").join(","); // FIX: added return
    });
    return `${headerLine}\n${rows.join("\n")}`; // FIX: added return
  }
}

class Serializer {
  constructor(private strategy: SerializationStrategy) {}
  setStrategy(s: SerializationStrategy): void { this.strategy = s; }
  run(data: Record<string, string>[]): string {
    return this.strategy.serialize(data); // FIX: was this.strategy.run
  }
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
  assertEq(csv, "name,age\nAlice,30\nBob,25", "CSV output");
}

// =============================================================================
// EXERCISE 7 — Sorting Strategy
// =============================================================================

interface SortStrategy<T> {
  sort(items: T[], compare: (a: T, b: T) => number): T[];
}

class BubbleSortStrategy<T> implements SortStrategy<T> {
  sort(items: T[], compare: (a: T, b: T) => number): T[] {
    const arr = [...items];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (compare(arr[j], arr[j + 1]) > 0) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

class SelectionSortStrategy<T> implements SortStrategy<T> {
  sort(items: T[], compare: (a: T, b: T) => number): T[] {
    const arr = [...items];
    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (compare(arr[j], arr[minIdx]) < 0) minIdx = j;
      }
      if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
  }
}

class SortContext<T> {
  constructor(private strategy: SortStrategy<T>) {}
  setStrategy(s: SortStrategy<T>): void { this.strategy = s; }
  sort(items: T[], compare: (a: T, b: T) => number): T[] {
    return this.strategy.sort(items, compare);
  }
}

function exercise7(): void {
  const ctx = new SortContext(new BubbleSortStrategy<number>());
  const data = [5, 2, 8, 1, 9, 3];
  const compare = (a: number, b: number) => a - b;

  const r1 = ctx.sort(data, compare);
  assertEq(r1, [1, 2, 3, 5, 8, 9], "bubble sort");
  assertEq(data, [5, 2, 8, 1, 9, 3], "original not mutated");

  ctx.setStrategy(new SelectionSortStrategy<number>());
  const r2 = ctx.sort(data, compare);
  assertEq(r2, [1, 2, 3, 5, 8, 9], "selection sort");

  console.log("Ex7: PASSED");
}

// =============================================================================
// EXERCISE 8 — Validation Strategy
// =============================================================================

type ValidationResult = { valid: boolean; errors: string[] };

interface Validator {
  validate(value: string): ValidationResult;
}

class RequiredValidator implements Validator {
  validate(value: string): ValidationResult {
    if (value.trim() === "") return { valid: false, errors: ["Value is required"] };
    return { valid: true, errors: [] };
  }
}

class MinLengthValidator implements Validator {
  constructor(private min: number) {}
  validate(value: string): ValidationResult {
    if (value.length < this.min)
      return { valid: false, errors: [`Minimum length is ${this.min}`] };
    return { valid: true, errors: [] };
  }
}

class PatternValidator implements Validator {
  constructor(private pattern: RegExp, private message: string) {}
  validate(value: string): ValidationResult {
    if (!this.pattern.test(value))
      return { valid: false, errors: [this.message] };
    return { valid: true, errors: [] };
  }
}

class CompositeValidator implements Validator {
  constructor(private validators: Validator[]) {}
  validate(value: string): ValidationResult {
    const allErrors: string[] = [];
    for (const v of this.validators) {
      const result = v.validate(value);
      allErrors.push(...result.errors);
    }
    return { valid: allErrors.length === 0, errors: allErrors };
  }
}

function exercise8(): void {
  const emailValidator = new CompositeValidator([
    new RequiredValidator(),
    new MinLengthValidator(5),
    new PatternValidator(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
  ]);

  const r1 = emailValidator.validate("");
  assert(!r1.valid, "empty should fail");
  assert(r1.errors.length >= 1, "should have errors");

  const r2 = emailValidator.validate("ab");
  assert(!r2.valid, "too short");

  const r3 = emailValidator.validate("test@example.com");
  assert(r3.valid, "valid email");
  assertEq(r3.errors, [], "no errors");

  const r4 = emailValidator.validate("notanemail");
  assert(!r4.valid, "not an email");

  console.log("Ex8: PASSED");
}

// =============================================================================
// EXERCISE 9 — Pricing Strategy
// =============================================================================

interface PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number;
}

class RegularPricing implements PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number {
    return basePrice * quantity;
  }
}

class BulkPricing implements PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number {
    const total = basePrice * quantity;
    if (quantity >= 50) return total * 0.8;
    if (quantity >= 10) return total * 0.9;
    return total;
  }
}

class PremiumPricing implements PricingStrategy {
  calculatePrice(basePrice: number, quantity: number): number {
    const total = basePrice * quantity * 0.85 - 5.99;
    return Math.max(0, Math.round(total * 100) / 100);
  }
}

class ShoppingCart {
  constructor(private strategy: PricingStrategy) {}
  setStrategy(s: PricingStrategy): void { this.strategy = s; }
  getTotal(basePrice: number, quantity: number): number {
    return this.strategy.calculatePrice(basePrice, quantity);
  }
}

function exercise9(): void {
  const cart = new ShoppingCart(new RegularPricing());
  assertEq(cart.getTotal(10, 5), 50, "regular 10*5");

  cart.setStrategy(new BulkPricing());
  assertEq(cart.getTotal(10, 10), 90, "bulk 10*10 -> 10% off");
  assertEq(cart.getTotal(10, 50), 400, "bulk 10*50 -> 20% off");
  assertEq(cart.getTotal(10, 5), 50, "bulk <10 no discount");

  cart.setStrategy(new PremiumPricing());
  assertEq(cart.getTotal(10, 5), 36.51, "premium 10*5 -> 15% off - 5.99");
  assertEq(cart.getTotal(1, 1), 0, "premium min 0");

  console.log("Ex9: PASSED");
}

// =============================================================================
// EXERCISE 10 — Text Search Strategy
// =============================================================================

type SearchResult = { index: number; match: string };

interface SearchStrategy {
  search(text: string, query: string): SearchResult[];
}

class ExactMatchStrategy implements SearchStrategy {
  search(text: string, query: string): SearchResult[] {
    const results: SearchResult[] = [];
    let pos = 0;
    while (true) {
      const idx = text.indexOf(query, pos);
      if (idx === -1) break;
      results.push({ index: idx, match: query });
      pos = idx + 1;
    }
    return results;
  }
}

class CaseInsensitiveStrategy implements SearchStrategy {
  search(text: string, query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let pos = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerQuery, pos);
      if (idx === -1) break;
      results.push({ index: idx, match: text.slice(idx, idx + query.length) });
      pos = idx + 1;
    }
    return results;
  }
}

class RegexSearchStrategy implements SearchStrategy {
  search(text: string, query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const regex = new RegExp(query, "g");
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      results.push({ index: m.index, match: m[0] });
    }
    return results;
  }
}

class SearchEngine {
  constructor(private strategy: SearchStrategy) {}
  setStrategy(s: SearchStrategy): void { this.strategy = s; }
  search(text: string, query: string): SearchResult[] {
    return this.strategy.search(text, query);
  }
}

function exercise10(): void {
  const engine = new SearchEngine(new ExactMatchStrategy());
  const text = "The Cat sat on the cat mat";

  const r1 = engine.search(text, "cat");
  assertEq(r1.length, 1, "exact: 1 match");
  assertEq(r1[0].index, 19, "exact: correct index");

  engine.setStrategy(new CaseInsensitiveStrategy());
  const r2 = engine.search(text, "cat");
  assertEq(r2.length, 2, "case-insensitive: 2 matches");

  engine.setStrategy(new RegexSearchStrategy());
  const r3 = engine.search(text, "\\b[Cc]at\\b");
  assertEq(r3.length, 2, "regex: 2 matches");

  console.log("Ex10: PASSED");
}

// =============================================================================
// EXERCISE 11 — Retry Strategy
// =============================================================================

interface BackoffStrategy {
  getDelay(attempt: number): number;
}

class FixedBackoff implements BackoffStrategy {
  constructor(private delayMs: number) {}
  getDelay(_attempt: number): number { return this.delayMs; }
}

class LinearBackoff implements BackoffStrategy {
  constructor(private baseMs: number) {}
  getDelay(attempt: number): number { return this.baseMs * attempt; }
}

class ExponentialBackoff implements BackoffStrategy {
  constructor(private baseMs: number) {}
  getDelay(attempt: number): number { return this.baseMs * Math.pow(2, attempt - 1); }
}

class RetryExecutor {
  delays: number[] = [];
  constructor(private strategy: BackoffStrategy, private maxRetries: number) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.delays = [];
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e as Error;
        if (attempt < this.maxRetries) {
          const delay = this.strategy.getDelay(attempt + 1);
          this.delays.push(delay);
          // In production: await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    throw lastError;
  }
}

async function exercise11(): Promise<void> {
  let callCount = 0;
  const failTwice = async (): Promise<string> => {
    callCount++;
    if (callCount <= 2) throw new Error(`Fail #${callCount}`);
    return "success";
  };

  const executor = new RetryExecutor(new ExponentialBackoff(100), 3);
  const result = await executor.execute(failTwice);
  assertEq(result, "success", "should succeed on 3rd try");
  assertEq(executor.delays, [100, 200], "exponential delays");

  const alwaysFails = async (): Promise<string> => { throw new Error("nope"); };
  const executor2 = new RetryExecutor(new FixedBackoff(50), 2);
  try {
    await executor2.execute(alwaysFails);
    assert(false, "should have thrown");
  } catch (e) {
    assert((e as Error).message === "nope", "correct error");
    assertEq(executor2.delays, [50, 50], "fixed delays");
  }

  console.log("Ex11: PASSED");
}

// =============================================================================
// EXERCISE 12 — Logging Strategy (Functional)
// =============================================================================

type LogLevel = "debug" | "info" | "warn" | "error";
type LogEntry = { level: LogLevel; message: string; timestamp: Date };
type LoggingStrategy = (entry: LogEntry) => string;

const plainTextLog: LoggingStrategy = (entry) =>
  `[${entry.level.toUpperCase()}] ${entry.message}`;

const jsonLog: LoggingStrategy = (entry) =>
  JSON.stringify({
    level: entry.level,
    message: entry.message,
    timestamp: entry.timestamp.toISOString(),
  });

const coloredLog: LoggingStrategy = (entry) => {
  const colors: Record<LogLevel, number> = { debug: 36, info: 32, warn: 33, error: 31 };
  const code = colors[entry.level];
  return `\x1b[${code}m[${entry.level.toUpperCase()}]\x1b[0m ${entry.message}`;
};

class Logger {
  constructor(private strategy: LoggingStrategy) {}
  setStrategy(s: LoggingStrategy): void { this.strategy = s; }

  log(level: LogLevel, message: string): string {
    const entry: LogEntry = { level, message, timestamp: new Date("2025-01-01T00:00:00Z") };
    return this.strategy(entry);
  }

  debug(msg: string): string { return this.log("debug", msg); }
  info(msg: string): string { return this.log("info", msg); }
  warn(msg: string): string { return this.log("warn", msg); }
  error(msg: string): string { return this.log("error", msg); }
}

function exercise12(): void {
  const logger = new Logger(plainTextLog);

  const r1 = logger.info("server started");
  assertEq(r1, "[INFO] server started", "plain text");

  logger.setStrategy(jsonLog);
  const r2 = logger.error("disk full");
  const parsed = JSON.parse(r2);
  assertEq(parsed.level, "error", "json level");
  assertEq(parsed.message, "disk full", "json message");

  logger.setStrategy(coloredLog);
  const r3 = logger.warn("low memory");
  assert(r3.includes("\x1b[33m"), "yellow for warn");
  assert(r3.includes("[WARN]"), "contains level");

  console.log("Ex12: PASSED");
}

// =============================================================================
// Runner
// =============================================================================

async function main(): Promise<void> {
  console.log("=== Strategy Pattern — Solutions ===\n");

  const syncExercises = [
    exercise1, exercise2, exercise3, exercise4,
    exercise5, exercise6, exercise7, exercise8,
    exercise9, exercise10, exercise12,
  ];

  for (const ex of syncExercises) {
    try {
      ex();
    } catch (e) {
      console.error(`FAILED: ${(e as Error).message}`);
    }
  }

  // Async exercise
  try {
    await exercise11();
  } catch (e) {
    console.error(`FAILED: ${(e as Error).message}`);
  }

  console.log("\n=== All exercises complete ===");
}

main();
