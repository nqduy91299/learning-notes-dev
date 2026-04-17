// ============================================================================
// Decorator Pattern — Solutions
// Config: ES2022, strict mode, ESNext modules | Run: npx tsx solutions.ts
// ============================================================================

// --- Shared Types ---
interface Logger { log(message: string): string; }
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

// === SOLUTION 1 =============================================================
// Chain: UpperCase → Timestamp → Console
// UpperCase.log("hello") → wrappee.log("HELLO")
// Timestamp.log("HELLO") → wrappee.log("[TIME] HELLO")
// Console.log("[TIME] HELLO") → "[TIME] HELLO"
// Output: [TIME] HELLO
function solution1(): void {
  console.log("=== Solution 1 ===");
  const logger: Logger = new UpperCaseDecorator(new TimestampDecorator(new ConsoleLogger()));
  console.log(logger.log("hello")); // [TIME] HELLO
}

// === SOLUTION 2 =============================================================
// Chain: Star → Prefix → Base
// Star.process("hi") → super.process("*hi*") which is Prefix.process("*hi*")
//   Prefix.process("*hi*") → super.process("[*hi*]") → Base returns "[*hi*]"
//   Prefix returns "([*hi*])"
// Star returns "#([*hi*])#"
interface Processor { process(data: string): string; }
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
function solution2(): void {
  console.log("=== Solution 2 ===");
  const proc: Processor = new StarDecorator(new PrefixDecorator(new BaseProcessor()));
  console.log(proc.process("hi")); // #([*hi*])#
}

// === SOLUTION 3 =============================================================
// Three TimestampDecorators stacked — each prepends [TIME].
// Output: [TIME] [TIME] [TIME] x
function solution3(): void {
  console.log("=== Solution 3 ===");
  let logger: Logger = new ConsoleLogger();
  logger = new TimestampDecorator(logger);
  logger = new TimestampDecorator(logger);
  logger = new TimestampDecorator(logger);
  console.log(logger.log("x")); // [TIME] [TIME] [TIME] x
}

// === SOLUTION 4 =============================================================
// A: Timestamp → UpperCase → Console
//    Timestamp.log("test") → UpperCase.log("[TIME] test") → Console("[TIME] TEST")
// B: UpperCase → Timestamp → Console
//    UpperCase.log("test") → Timestamp.log("TEST") → Console("[TIME] TEST")
// Both produce "[TIME] TEST" — in this specific case the order doesn't matter
// because uppercase applies to everything passed through it.
function solution4(): void {
  console.log("=== Solution 4 ===");
  const a: Logger = new TimestampDecorator(new UpperCaseDecorator(new ConsoleLogger()));
  const b: Logger = new UpperCaseDecorator(new TimestampDecorator(new ConsoleLogger()));
  console.log("A:", a.log("test")); // A: [TIME] TEST
  console.log("B:", b.log("test")); // B: [TIME] TEST
}

// === SOLUTION 5 =============================================================
// Bold wraps Italic wraps Underline wraps PlainText
// Each calls super.transform first, then wraps the result.
// Inner to outer: "hello" → "<u>hello</u>" → "<i><u>hello</u></i>" → "<b><i><u>hello</u></i></b>"
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
function solution5(): void {
  console.log("=== Solution 5 ===");
  const text: TextTransformer = new BoldDecorator(
    new ItalicDecorator(new UnderlineDecorator(new PlainText()))
  );
  console.log(text.transform("hello")); // <b><i><u>hello</u></i></b>
}

// === SOLUTION 6 =============================================================
// Bug: UrgentDecorator didn't delegate to wrappee.
// Fix: Call super.send() with the modified message.
interface Messenger { send(msg: string): string; }
class BasicMessenger implements Messenger {
  send(msg: string): string { return `Sent: ${msg}`; }
}
class MessengerDecorator implements Messenger {
  constructor(protected wrappee: Messenger) {}
  send(msg: string): string { return this.wrappee.send(msg); }
}
class UrgentDecoratorFixed extends MessengerDecorator {
  send(msg: string): string { return super.send(`URGENT: ${msg}`); }
}
function solution6(): void {
  console.log("=== Solution 6 ===");
  const m: Messenger = new UrgentDecoratorFixed(new BasicMessenger());
  console.log(m.send("hello")); // Sent: URGENT: hello
}

// === SOLUTION 7 =============================================================
// Bug: SanitizerDecorator.sanitize() returned `input` directly.
// Fix: return this.wrappee.sanitize(input) so the chain is connected.
interface Sanitizer { sanitize(input: string): string; }
class NoOpSanitizer implements Sanitizer {
  sanitize(input: string): string { return input; }
}
class SanitizerDecoratorFixed implements Sanitizer {
  constructor(protected wrappee: Sanitizer) {}
  sanitize(input: string): string { return this.wrappee.sanitize(input); }
}
class TrimDecoratorFixed extends SanitizerDecoratorFixed {
  sanitize(input: string): string { return super.sanitize(input.trim()); }
}
class LowerCaseDecoratorFixed extends SanitizerDecoratorFixed {
  sanitize(input: string): string { return super.sanitize(input.toLowerCase()); }
}
function solution7(): void {
  console.log("=== Solution 7 ===");
  const s: Sanitizer = new TrimDecoratorFixed(new LowerCaseDecoratorFixed(new NoOpSanitizer()));
  console.log(`"${s.sanitize("  Hello World  ")}"`); // "hello world"
}

// === SOLUTION 8 =============================================================
// Bug: SyrupDecorator didn't accept wrappee in constructor.
// Fix: Add wrappee parameter and pass it to super().
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
class MilkDecoratorFixed extends CoffeeDecorator {
  constructor(wrappee: Coffee, private milkType: string) { super(wrappee); }
  cost(): number { return super.cost() + 0.5; }
  description(): string { return `${super.description()}, ${this.milkType} milk`; }
}
class SyrupDecoratorFixed extends CoffeeDecorator {
  constructor(wrappee: Coffee, private flavor: string) { super(wrappee); }
  cost(): number { return super.cost() + 0.75; }
  description(): string { return `${super.description()}, ${this.flavor} syrup`; }
}
function solution8(): void {
  console.log("=== Solution 8 ===");
  let c: Coffee = new SimpleCoffee();
  c = new MilkDecoratorFixed(c, "oat");
  c = new SyrupDecoratorFixed(c, "vanilla");
  console.log(c.cost(), c.description()); // 3.25 Simple coffee, oat milk, vanilla syrup
}

// === SOLUTION 9 — Number Formatter ==========================================
interface NumberFormatter { format(n: number): string; }
class BasicFormatter implements NumberFormatter {
  format(n: number): string { return n.toString(); }
}
class FormatterDecorator implements NumberFormatter {
  constructor(protected wrappee: NumberFormatter) {}
  format(n: number): string { return this.wrappee.format(n); }
}
class DecimalDecorator extends FormatterDecorator {
  format(n: number): string {
    const result = super.format(n);
    return parseFloat(result).toFixed(2);
  }
}
class ThousandsSeparatorDecorator extends FormatterDecorator {
  format(n: number): string {
    const result = super.format(n);
    const [intPart, decPart] = result.split(".");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  }
}
class CurrencyDecorator extends FormatterDecorator {
  constructor(wrappee: NumberFormatter, private symbol: string) { super(wrappee); }
  format(n: number): string { return `${this.symbol}${super.format(n)}`; }
}
function solution9(): void {
  console.log("=== Solution 9 ===");
  const fmt: NumberFormatter = new CurrencyDecorator(
    new ThousandsSeparatorDecorator(new DecimalDecorator(new BasicFormatter())), "$"
  );
  console.log(fmt.format(1234567.8)); // $1,234,567.80
  console.log(fmt.format(42));         // $42.00
  console.log(fmt.format(0.5));        // $0.50
}

// === SOLUTION 10 — Text Stream ==============================================
interface Stream { write(data: string): string; read(): string; }
class MemoryStream implements Stream {
  private data: string = "";
  write(data: string): string { this.data = data; return data; }
  read(): string { return this.data; }
}
class StreamDecorator implements Stream {
  constructor(protected wrappee: Stream) {}
  write(data: string): string { return this.wrappee.write(data); }
  read(): string { return this.wrappee.read(); }
}
class Base64Decorator extends StreamDecorator {
  write(data: string): string { return super.write(btoa(data)); }
  read(): string { return atob(super.read()); }
}
class ReverseDecorator extends StreamDecorator {
  write(data: string): string { return super.write(data.split("").reverse().join("")); }
  read(): string { return super.read().split("").reverse().join(""); }
}
function solution10(): void {
  console.log("=== Solution 10 ===");
  const stream: Stream = new ReverseDecorator(new Base64Decorator(new MemoryStream()));
  stream.write("Hello");
  console.log(stream.read()); // Hello
}

// === SOLUTION 11 — Validator Chain ==========================================
interface ValidationResult { valid: boolean; errors: string[]; }
interface Validator { validate(value: string): ValidationResult; }
class AlwaysValidValidator implements Validator {
  validate(_value: string): ValidationResult { return { valid: true, errors: [] }; }
}
class ValidatorDecorator implements Validator {
  constructor(protected wrappee: Validator) {}
  validate(value: string): ValidationResult { return this.wrappee.validate(value); }
}
class MinLengthValidator extends ValidatorDecorator {
  constructor(wrappee: Validator, private min: number) { super(wrappee); }
  validate(value: string): ValidationResult {
    const result = super.validate(value);
    if (value.length < this.min) { result.valid = false; result.errors.push(`Min length ${this.min}`); }
    return result;
  }
}
class MaxLengthValidator extends ValidatorDecorator {
  constructor(wrappee: Validator, private max: number) { super(wrappee); }
  validate(value: string): ValidationResult {
    const result = super.validate(value);
    if (value.length > this.max) { result.valid = false; result.errors.push(`Max length ${this.max}`); }
    return result;
  }
}
class PatternValidator extends ValidatorDecorator {
  constructor(wrappee: Validator, private pattern: RegExp, private errorMsg: string) { super(wrappee); }
  validate(value: string): ValidationResult {
    const result = super.validate(value);
    if (!this.pattern.test(value)) { result.valid = false; result.errors.push(this.errorMsg); }
    return result;
  }
}
function solution11(): void {
  console.log("=== Solution 11 ===");
  const v: Validator = new PatternValidator(
    new MinLengthValidator(new MaxLengthValidator(new AlwaysValidValidator(), 20), 3),
    /^[a-zA-Z]+$/, "Only letters allowed"
  );
  console.log(v.validate("ab"));          // { valid: false, errors: ["Min length 3"] }
  console.log(v.validate("hello"));        // { valid: true, errors: [] }
  console.log(v.validate("hello123"));     // { valid: false, errors: ["Only letters allowed"] }
  console.log(v.validate("a".repeat(25))); // { valid: false, errors: ["Max length 20"] }
}

// === SOLUTION 12 — HTTP Client ==============================================
interface HttpClient { fetch(url: string): Promise<string>; }
class SimpleHttpClient implements HttpClient {
  async fetch(url: string): Promise<string> { return `Response from ${url}`; }
}
class HttpClientDecorator implements HttpClient {
  constructor(protected wrappee: HttpClient) {}
  async fetch(url: string): Promise<string> { return this.wrappee.fetch(url); }
}
class RetryDecorator extends HttpClientDecorator {
  constructor(wrappee: HttpClient, private maxRetries: number) { super(wrappee); }
  async fetch(url: string): Promise<string> {
    let lastError: Error | undefined;
    for (let i = 0; i <= this.maxRetries; i++) {
      try { return await super.fetch(url); }
      catch (e) { lastError = e as Error; console.log(`Retry ${i + 1}/${this.maxRetries}`); }
    }
    throw lastError;
  }
}
class CacheDecorator extends HttpClientDecorator {
  private cache = new Map<string, string>();
  async fetch(url: string): Promise<string> {
    if (this.cache.has(url)) { console.log(`[Cache hit] ${url}`); return this.cache.get(url)!; }
    const result = await super.fetch(url);
    this.cache.set(url, result);
    return result;
  }
}
function solution12(): void {
  console.log("=== Solution 12 ===");
  const client: HttpClient = new CacheDecorator(new RetryDecorator(new SimpleHttpClient(), 3));
  client.fetch("/api/data").then((r) => {
    console.log(r);
    client.fetch("/api/data").then((r2) => console.log(r2));
  });
}

// === SOLUTION 13 — Function-Based Decorators ================================
type MathOp = (a: number, b: number) => number;

function withLogging(op: MathOp): MathOp {
  return (a, b) => { const r = op(a, b); console.log(`  log: (${a}, ${b}) => ${r}`); return r; };
}
function withClamping(op: MathOp, min: number, max: number): MathOp {
  return (a, b) => Math.min(max, Math.max(min, op(a, b)));
}
function withRounding(op: MathOp, decimals: number): MathOp {
  return (a, b) => { const f = 10 ** decimals; return Math.round(op(a, b) * f) / f; };
}
function solution13(): void {
  console.log("=== Solution 13 ===");
  const add: MathOp = (a, b) => a + b;
  const enhanced = withLogging(withClamping(withRounding(add, 2), 0, 100));
  console.log(enhanced(33.3333, 66.6666)); // 100
  console.log(enhanced(50, 60));            // 100
}

// === SOLUTION 14 — Event Bus ================================================
interface EventBus {
  on(event: string, handler: (data: string) => string): void;
  emit(event: string, data: string): string[];
}
class SimpleEventBus implements EventBus {
  private handlers = new Map<string, Array<(data: string) => string>>();
  on(event: string, handler: (data: string) => string): void {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }
  emit(event: string, data: string): string[] {
    return (this.handlers.get(event) ?? []).map((h) => h(data));
  }
}
class EventBusDecorator implements EventBus {
  constructor(protected wrappee: EventBus) {}
  on(event: string, handler: (data: string) => string): void { this.wrappee.on(event, handler); }
  emit(event: string, data: string): string[] { return this.wrappee.emit(event, data); }
}
class FilterDecorator extends EventBusDecorator {
  constructor(wrappee: EventBus, private predicate: (event: string, data: string) => boolean) {
    super(wrappee);
  }
  emit(event: string, data: string): string[] {
    return this.predicate(event, data) ? super.emit(event, data) : [];
  }
}
class TransformDecorator extends EventBusDecorator {
  constructor(wrappee: EventBus, private transformer: (event: string, data: string) => string) {
    super(wrappee);
  }
  emit(event: string, data: string): string[] {
    return super.emit(event, this.transformer(event, data));
  }
}
function solution14(): void {
  console.log("=== Solution 14 ===");
  const bus: EventBus = new TransformDecorator(
    new FilterDecorator(new SimpleEventBus(), (_e, d) => d.length > 0),
    (_e, d) => d.toUpperCase()
  );
  bus.on("greet", (d) => `Hello, ${d}`);
  console.log(bus.emit("greet", "world")); // ["Hello, WORLD"]
  console.log(bus.emit("greet", ""));       // []
}

// === SOLUTION 15 — Document Store ===========================================
interface DocumentStore {
  read(id: string): string | null;
  write(id: string, content: string): void;
  list(): string[];
}
class InMemoryDocumentStore implements DocumentStore {
  private docs = new Map<string, string>();
  read(id: string): string | null { return this.docs.get(id) ?? null; }
  write(id: string, content: string): void { this.docs.set(id, content); }
  list(): string[] { return Array.from(this.docs.keys()); }
}
class DocumentStoreDecorator implements DocumentStore {
  constructor(protected wrappee: DocumentStore) {}
  read(id: string): string | null { return this.wrappee.read(id); }
  write(id: string, content: string): void { this.wrappee.write(id, content); }
  list(): string[] { return this.wrappee.list(); }
}
class ReadOnlyDecorator extends DocumentStoreDecorator {
  write(_id: string, _content: string): void { throw new Error("Store is read-only"); }
}
class AuditDecorator extends DocumentStoreDecorator {
  private auditLog: string[] = [];
  getAuditLog(): string[] { return [...this.auditLog]; }
  read(id: string): string | null { this.auditLog.push(`read:${id}`); return super.read(id); }
  write(id: string, content: string): void { this.auditLog.push(`write:${id}`); super.write(id, content); }
  list(): string[] { this.auditLog.push("list"); return super.list(); }
}
class EncryptedDecorator extends DocumentStoreDecorator {
  constructor(wrappee: DocumentStore, private shift: number) { super(wrappee); }
  private caesar(text: string, shift: number): string {
    return text.split("").map((ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + shift + 26) % 26) + 65);
      if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + shift + 26) % 26) + 97);
      return ch;
    }).join("");
  }
  write(id: string, content: string): void { super.write(id, this.caesar(content, this.shift)); }
  read(id: string): string | null {
    const d = super.read(id);
    return d === null ? null : this.caesar(d, -this.shift);
  }
}
function solution15(): void {
  console.log("=== Solution 15 ===");
  const store = new InMemoryDocumentStore();
  const audited = new AuditDecorator(store);
  audited.write("doc1", "Hello World"); audited.read("doc1"); audited.list();
  console.log(audited.getAuditLog()); // ["write:doc1", "read:doc1", "list"]
  const ro: DocumentStore = new ReadOnlyDecorator(store);
  console.log(ro.read("doc1")); // Hello World
  try { ro.write("doc2", "fail"); } catch (e) { console.log((e as Error).message); }
  const enc = new EncryptedDecorator(store, 3);
  enc.write("secret", "abc");
  console.log(store.read("secret"));   // def
  console.log(enc.read("secret"));     // abc
}

// === RUNNER ==================================================================
async function main(): Promise<void> {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   Decorator Pattern — Solutions Runner   ║");
  console.log("╚══════════════════════════════════════════╝\n");
  solution1();  console.log();
  solution2();  console.log();
  solution3();  console.log();
  solution4();  console.log();
  solution5();  console.log();
  solution6();  console.log();
  solution7();  console.log();
  solution8();  console.log();
  solution9();  console.log();
  solution10(); console.log();
  solution11(); console.log();
  solution12();
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log();
  solution13(); console.log();
  solution14(); console.log();
  solution15();
}

main();
export {};
