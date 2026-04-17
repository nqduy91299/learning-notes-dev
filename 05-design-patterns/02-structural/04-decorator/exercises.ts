// ============================================================================
// Decorator Pattern — Exercises (15 exercises)
// ============================================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx exercises.ts
//
// 5 predict-output exercises  (1–5)
// 3 fix-the-bug exercises     (6–8)
// 7 implement exercises        (9–15)
//
// All test code is commented out. No `any` types.
// Uncomment the function calls to test your answers.
// ============================================================================

// --- Shared Types ---
interface Logger {
  log(message: string): string;
}
class ConsoleLogger implements Logger {
  log(message: string): string { return message; }
}
class LoggerDecorator implements Logger {
  constructor(protected wrappee: Logger) {}
  log(message: string): string { return this.wrappee.log(message); }
}
class TimestampDecorator extends LoggerDecorator {
  log(message: string): string { return this.wrappee.log(`[TIME] ${message}`); }
}
class UpperCaseDecorator extends LoggerDecorator {
  log(message: string): string { return this.wrappee.log(message.toUpperCase()); }
}

// === EXERCISE 1 — Predict the Output ========================================
// What does the following code print? Follow the decorator chain carefully.
function exercise1(): void {
  const logger: Logger = new UpperCaseDecorator(
    new TimestampDecorator(new ConsoleLogger())
  );
  console.log(logger.log("hello"));
}
// exercise1();
// YOUR PREDICTION:

// === EXERCISE 2 — Predict the Output ========================================
// What happens when decorators execute code both before AND after delegation?
interface Processor {
  process(data: string): string;
}
class BaseProcessor implements Processor {
  process(data: string): string { return data; }
}
class ProcessorDecorator implements Processor {
  constructor(protected wrappee: Processor) {}
  process(data: string): string { return this.wrappee.process(data); }
}
class PrefixDecorator extends ProcessorDecorator {
  process(data: string): string {
    const result = super.process(`[${data}]`);
    return `(${result})`;
  }
}
class StarDecorator extends ProcessorDecorator {
  process(data: string): string {
    const result = super.process(`*${data}*`);
    return `#${result}#`;
  }
}
function exercise2(): void {
  const proc: Processor = new StarDecorator(new PrefixDecorator(new BaseProcessor()));
  console.log(proc.process("hi"));
}
// exercise2();
// YOUR PREDICTION:

// === EXERCISE 3 — Predict the Output ========================================
// What happens when the same decorator is applied multiple times?
function exercise3(): void {
  let logger: Logger = new ConsoleLogger();
  logger = new TimestampDecorator(logger);
  logger = new TimestampDecorator(logger);
  logger = new TimestampDecorator(logger);
  console.log(logger.log("x"));
}
// exercise3();
// YOUR PREDICTION:

// === EXERCISE 4 — Predict the Output ========================================
// Decorator order matters. What's the difference here?
function exercise4(): void {
  const a: Logger = new TimestampDecorator(new UpperCaseDecorator(new ConsoleLogger()));
  const b: Logger = new UpperCaseDecorator(new TimestampDecorator(new ConsoleLogger()));
  console.log("A:", a.log("test"));
  console.log("B:", b.log("test"));
}
// exercise4();
// YOUR PREDICTION:

// === EXERCISE 5 — Predict the Output ========================================
interface TextTransformer { transform(text: string): string; }
class PlainText implements TextTransformer {
  transform(text: string): string { return text; }
}
class TextDecorator implements TextTransformer {
  constructor(protected wrappee: TextTransformer) {}
  transform(text: string): string { return this.wrappee.transform(text); }
}
class BoldDecorator extends TextDecorator {
  transform(text: string): string { return `<b>${super.transform(text)}</b>`; }
}
class ItalicDecorator extends TextDecorator {
  transform(text: string): string { return `<i>${super.transform(text)}</i>`; }
}
class UnderlineDecorator extends TextDecorator {
  transform(text: string): string { return `<u>${super.transform(text)}</u>`; }
}
function exercise5(): void {
  const text: TextTransformer = new BoldDecorator(
    new ItalicDecorator(new UnderlineDecorator(new PlainText()))
  );
  console.log(text.transform("hello"));
}
// exercise5();
// YOUR PREDICTION:

// === EXERCISE 6 — Fix the Bug ===============================================
// The decorator should add a prefix, but it's not delegating correctly.
interface Messenger { send(msg: string): string; }
class BasicMessenger implements Messenger {
  send(msg: string): string { return `Sent: ${msg}`; }
}
class MessengerDecorator implements Messenger {
  constructor(protected wrappee: Messenger) {}
  send(msg: string): string { return this.wrappee.send(msg); }
}
class UrgentDecorator extends MessengerDecorator {
  send(msg: string): string {
    // BUG: Should delegate to wrappee but doesn't
    return `URGENT: ${msg}`;
  }
}
function exercise6(): void {
  const messenger: Messenger = new UrgentDecorator(new BasicMessenger());
  // Expected: "Sent: URGENT: hello" | Actual: "URGENT: hello"
  console.log(messenger.send("hello"));
}
// exercise6();

// === EXERCISE 7 — Fix the Bug ===============================================
// The decorator chain should apply both transformations, but only one works.
interface Sanitizer { sanitize(input: string): string; }
class NoOpSanitizer implements Sanitizer {
  sanitize(input: string): string { return input; }
}
class SanitizerDecorator implements Sanitizer {
  constructor(protected wrappee: Sanitizer) {}
  sanitize(input: string): string {
    // BUG: Not delegating to wrappee
    return input;
  }
}
class TrimDecorator extends SanitizerDecorator {
  sanitize(input: string): string { return super.sanitize(input.trim()); }
}
class LowerCaseDecorator extends SanitizerDecorator {
  sanitize(input: string): string { return super.sanitize(input.toLowerCase()); }
}
function exercise7(): void {
  const sanitizer: Sanitizer = new TrimDecorator(new LowerCaseDecorator(new NoOpSanitizer()));
  // Expected: "hello world" | Actual: "Hello World" (trim works but lowercase doesn't)
  console.log(`"${sanitizer.sanitize("  Hello World  ")}"`);
}
// exercise7();

// === EXERCISE 8 — Fix the Bug ===============================================
// The cost calculator should stack costs, but SyrupDecorator is broken.
interface Coffee { cost(): number; description(): string; }
class SimpleCoffee implements Coffee {
  cost(): number { return 2; }
  description(): string { return "Simple coffee"; }
}
class CoffeeDecorator implements Coffee {
  constructor(protected wrappee: Coffee) {}
  cost(): number { return this.wrappee.cost(); }
  description(): string { return this.wrappee.description(); }
}
class MilkDecorator extends CoffeeDecorator {
  constructor(wrappee: Coffee, private milkType: string) { super(wrappee); }
  cost(): number { return super.cost() + 0.5; }
  description(): string { return `${super.description()}, ${this.milkType} milk`; }
}
class SyrupDecorator extends CoffeeDecorator {
  // BUG: wrappee is not being passed to parent
  constructor(private flavor: string) {
    super(undefined as unknown as Coffee);
  }
  cost(): number { return super.cost() + 0.75; }
  description(): string { return `${super.description()}, ${this.flavor} syrup`; }
}
function exercise8(): void {
  let coffee: Coffee = new SimpleCoffee();
  coffee = new MilkDecorator(coffee, "oat");
  coffee = new SyrupDecorator("vanilla"); // BUG: not passing coffee
  // Expected: 3.25 and "Simple coffee, oat milk, vanilla syrup"
  console.log(coffee.cost(), coffee.description());
}
// exercise8();

// === EXERCISE 9 — Implement =================================================
// Number formatter decorator system:
// - NumberFormatter interface with format(n: number): string
// - BasicFormatter: returns n.toString()
// - FormatterDecorator: base decorator
// - ThousandsSeparatorDecorator: adds commas (1000 -> "1,000")
// - CurrencyDecorator: prepends currency symbol (constructor takes symbol)
// - DecimalDecorator: ensures exactly 2 decimal places
interface NumberFormatter { format(n: number): string; }
// YOUR IMPLEMENTATION HERE
function exercise9(): void {
  // const fmt: NumberFormatter = new CurrencyDecorator(
  //   new ThousandsSeparatorDecorator(new DecimalDecorator(new BasicFormatter())), "$"
  // );
  // console.log(fmt.format(1234567.8));  // "$1,234,567.80"
  // console.log(fmt.format(42));          // "$42.00"
}
// exercise9();

// === EXERCISE 10 — Implement ================================================
// Text stream decorator system:
// - Stream interface with write(data: string): string and read(): string
// - MemoryStream: stores data in a private field
// - StreamDecorator: base decorator
// - Base64Decorator: encodes on write (btoa), decodes on read (atob)
// - ReverseDecorator: reverses string on write, reverses on read
interface Stream { write(data: string): string; read(): string; }
// YOUR IMPLEMENTATION HERE
function exercise10(): void {
  // const stream: Stream = new ReverseDecorator(new Base64Decorator(new MemoryStream()));
  // stream.write("Hello");
  // console.log(stream.read()); // "Hello"
}
// exercise10();

// === EXERCISE 11 — Implement ================================================
// Validator decorator chain. Each decorator aggregates errors from the chain.
// - Validator with validate(value: string): { valid: boolean; errors: string[] }
// - AlwaysValidValidator: returns { valid: true, errors: [] }
// - ValidatorDecorator: base decorator
// - MinLengthValidator(wrappee, min): checks value.length >= min
// - MaxLengthValidator(wrappee, max): checks value.length <= max
// - PatternValidator(wrappee, regex, errorMsg): checks regex.test(value)
interface ValidationResult { valid: boolean; errors: string[]; }
interface Validator { validate(value: string): ValidationResult; }
// YOUR IMPLEMENTATION HERE
function exercise11(): void {
  // const v: Validator = new PatternValidator(
  //   new MinLengthValidator(new MaxLengthValidator(new AlwaysValidValidator(), 20), 3),
  //   /^[a-zA-Z]+$/, "Only letters allowed"
  // );
  // console.log(v.validate("ab"));         // { valid: false, errors: ["Min length 3"] }
  // console.log(v.validate("hello"));       // { valid: true, errors: [] }
  // console.log(v.validate("hello123"));    // { valid: false, errors: ["Only letters allowed"] }
}
// exercise11();

// === EXERCISE 12 — Implement ================================================
// HTTP client with retry/cache decorators:
// - HttpClient with fetch(url: string): Promise<string>
// - SimpleHttpClient: returns `Response from ${url}`
// - HttpClientDecorator: base decorator
// - RetryDecorator(wrappee, maxRetries): retries on failure
// - CacheDecorator: caches results by URL
interface HttpClient { fetch(url: string): Promise<string>; }
// YOUR IMPLEMENTATION HERE
function exercise12(): void {
  // const client: HttpClient = new CacheDecorator(new RetryDecorator(new SimpleHttpClient(), 3));
  // client.fetch("/api/data").then(console.log);
}
// exercise12();

// === EXERCISE 13 — Implement ================================================
// Function-based decorators (no classes):
// - MathOp type: (a: number, b: number) => number
// - withLogging(op): logs inputs/output, returns MathOp
// - withClamping(op, min, max): clamps result
// - withRounding(op, decimals): rounds result
type MathOp = (a: number, b: number) => number;
// YOUR IMPLEMENTATION HERE
function exercise13(): void {
  // const add: MathOp = (a, b) => a + b;
  // const enhanced = withLogging(withClamping(withRounding(add, 2), 0, 100));
  // console.log(enhanced(33.3333, 66.6666));
}
// exercise13();

// === EXERCISE 14 — Implement ================================================
// Event bus with decorator middleware:
// - EventBus with on(event, handler) and emit(event, data): string[]
// - SimpleEventBus: stores handlers, emit calls matching handlers
// - EventBusDecorator: base decorator
// - FilterDecorator(wrappee, predicate): only emits if predicate returns true
// - TransformDecorator(wrappee, transformer): transforms data before emitting
interface EventBus {
  on(event: string, handler: (data: string) => string): void;
  emit(event: string, data: string): string[];
}
// YOUR IMPLEMENTATION HERE
function exercise14(): void {
  // const bus: EventBus = new TransformDecorator(
  //   new FilterDecorator(new SimpleEventBus(), (_e, d) => d.length > 0),
  //   (_e, d) => d.toUpperCase()
  // );
  // bus.on("greet", (d) => `Hello, ${d}`);
  // console.log(bus.emit("greet", "world")); // ["Hello, WORLD"]
  // console.log(bus.emit("greet", ""));       // []
}
// exercise14();

// === EXERCISE 15 — Implement ================================================
// Document store with permission decorators:
// - DocumentStore: read(id): string|null, write(id, content): void, list(): string[]
// - InMemoryDocumentStore: stores docs in a Map
// - DocumentStoreDecorator: base decorator
// - ReadOnlyDecorator: allows read/list, throws on write
// - AuditDecorator: records ops in audit log, getAuditLog(): string[]
// - EncryptedDecorator(wrappee, shift): Caesar cipher on write, unshift on read
interface DocumentStore {
  read(id: string): string | null;
  write(id: string, content: string): void;
  list(): string[];
}
// YOUR IMPLEMENTATION HERE
function exercise15(): void {
  // const store = new InMemoryDocumentStore();
  // const audited = new AuditDecorator(store);
  // audited.write("doc1", "Hello"); audited.read("doc1"); audited.list();
  // console.log(audited.getAuditLog()); // ["write:doc1", "read:doc1", "list"]
  // const ro: DocumentStore = new ReadOnlyDecorator(store);
  // try { ro.write("x", "y"); } catch (e) { console.log((e as Error).message); }
  // const enc = new EncryptedDecorator(store, 3);
  // enc.write("s", "abc");
  // console.log(store.read("s"));   // "def"
  // console.log(enc.read("s"));     // "abc"
}
// exercise15();

export {};
