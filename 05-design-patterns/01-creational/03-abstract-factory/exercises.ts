// ============================================================================
// Abstract Factory Pattern - Exercises (15 exercises)
// ============================================================================
// Config: ES2022, strict, ESNext modules | Run: npx tsx exercises.ts
//
// Instructions:
// - Exercises 1-5: Predict what the code outputs before uncommenting tests.
// - Exercises 6-8: Find and fix the bug in the implementation.
// - Exercises 9-15: Implement the TODO sections to complete the pattern.
//
// Rules:
// - No `any` type usage
// - All test code is commented out - uncomment to verify
// - All code must compile as-is with `npx tsx exercises.ts`
// ============================================================================

// ─── Shared Types ────────────────────────────────────────────────────────────
interface Button { render(): string; onClick(handler: () => void): void; }
interface Checkbox { render(): string; isChecked(): boolean; toggle(): void; }

// ============================================================================
// EXERCISE 1: Predict the Output (1/5)
// ============================================================================
class BtnA implements Button {
  render(): string { return "BtnA"; }
  onClick(handler: () => void): void { handler(); }
}
class BtnB implements Button {
  render(): string { return "BtnB"; }
  onClick(handler: () => void): void { handler(); }
}
interface SimpleFactory { createButton(): Button; }
class FactoryA implements SimpleFactory { createButton(): Button { return new BtnA(); } }
class FactoryB implements SimpleFactory { createButton(): Button { return new BtnB(); } }
function useFactory(f: SimpleFactory): string { return f.createButton().render(); }

// YOUR PREDICTION: ???
// console.log(useFactory(new FactoryA()));
// console.log(useFactory(new FactoryB()));

// ============================================================================
// EXERCISE 2: Predict the Output (2/5)
// ============================================================================
class LightBtn implements Button {
  render(): string { return "light-button"; }
  onClick(_h: () => void): void {}
}
class DarkBtn implements Button {
  render(): string { return "dark-button"; }
  onClick(_h: () => void): void {}
}
class DarkCb implements Checkbox {
  private checked = true;
  render(): string { return "dark-checkbox"; }
  isChecked(): boolean { return this.checked; }
  toggle(): void { this.checked = !this.checked; }
}
interface ThemeFactory { createButton(): Button; createCheckbox(): Checkbox; }
class DarkFactory implements ThemeFactory {
  createButton(): Button { return new DarkBtn(); }
  createCheckbox(): Checkbox { return new DarkCb(); }
}

// YOUR PREDICTION: ???
// const f2 = new DarkFactory();
// const btn2 = f2.createButton();
// const cb2 = f2.createCheckbox();
// console.log(btn2.render());
// console.log(cb2.isChecked());
// cb2.toggle();
// console.log(cb2.isChecked());

// ============================================================================
// EXERCISE 3: Predict the Output (3/5)
// ============================================================================
class ProductX {
  constructor(public readonly id: number) {}
  describe(): string { return `X-${this.id}`; }
}
class ProductY {
  constructor(public readonly id: number) {}
  describe(): string { return `Y-${this.id}`; }
}
class CountingFactory {
  private count = 0;
  createX(): ProductX { return new ProductX(++this.count); }
  createY(): ProductY { return new ProductY(++this.count); }
}

// YOUR PREDICTION: ???
// const cf = new CountingFactory();
// console.log(cf.createX().describe());
// console.log(cf.createY().describe());
// console.log(cf.createX().describe());
// console.log(cf.createX() === cf.createX());

// ============================================================================
// EXERCISE 4: Predict the Output (4/5)
// ============================================================================
interface Logger { log(msg: string): string; }
interface Formatter { format(data: string): string; }
interface LogFactory { createLogger(): Logger; createFormatter(): Formatter; }

class PlainLogger implements Logger { log(msg: string): string { return `LOG: ${msg}`; } }
class PlainFmt implements Formatter { format(d: string): string { return `DATA: ${d}`; } }
class JsonLogger implements Logger { log(msg: string): string { return JSON.stringify({ msg }); } }
class JsonFmt implements Formatter { format(d: string): string { return JSON.stringify({ d }); } }

class PlainLogFactory implements LogFactory {
  createLogger(): Logger { return new PlainLogger(); }
  createFormatter(): Formatter { return new PlainFmt(); }
}
class JsonLogFactory implements LogFactory {
  createLogger(): Logger { return new JsonLogger(); }
  createFormatter(): Formatter { return new JsonFmt(); }
}
function processLog(factory: LogFactory, msg: string): string {
  return factory.createLogger().log(factory.createFormatter().format(msg));
}

// YOUR PREDICTION: ???
// console.log(processLog(new PlainLogFactory(), "hello"));
// console.log(processLog(new JsonLogFactory(), "hello"));

// ============================================================================
// EXERCISE 5: Predict the Output (5/5)
// ============================================================================
class WidgetAlpha {
  constructor(private label: string) {}
  clone(): WidgetAlpha { return new WidgetAlpha(this.label); }
  name(): string { return `Alpha(${this.label})`; }
}
class ProtoFactory {
  constructor(private proto: WidgetAlpha) {}
  create(): WidgetAlpha { return this.proto.clone(); }
}

// YOUR PREDICTION: ???
// const pf = new ProtoFactory(new WidgetAlpha("shared"));
// const a1 = pf.create();
// const a2 = pf.create();
// console.log(a1.name());
// console.log(a1 === a2);
// console.log(a1.name() === a2.name());

// ============================================================================
// EXERCISE 6: Fix the Bug (1/3)
// ============================================================================
// Bug: SuccessNotificationFactory mixes success title with error body.

interface NTitle { render(): string; }
interface NBody { render(): string; }
interface NFactory { createTitle(): NTitle; createBody(): NBody; }

class SuccessTitle implements NTitle { render(): string { return "[SUCCESS]"; } }
class SuccessBody implements NBody { render(): string { return "Operation completed."; } }
class ErrorTitle implements NTitle { render(): string { return "[ERROR]"; } }
class ErrorBody implements NBody { render(): string { return "An error occurred."; } }

class SuccessNFactory implements NFactory {
  createTitle(): NTitle { return new SuccessTitle(); }
  createBody(): NBody { return new ErrorBody(); } // <-- Fix this line
}

// console.log(`${new SuccessNFactory().createTitle().render()} ${new SuccessNFactory().createBody().render()}`);
// Expected: "[SUCCESS] Operation completed."

// ============================================================================
// EXERCISE 7: Fix the Bug (2/3)
// ============================================================================
// Bug: get() always returns undefined because keys are stored as-is but
// retrieved with toLowerCase().

class FactoryRegistry<T> {
  private map: Map<string, T> = new Map();
  register(name: string, factory: T): void { this.map.set(name, factory); }
  get(name: string): T | undefined { return this.map.get(name.toLowerCase()); } // Fix
}

// const reg = new FactoryRegistry<string>();
// reg.register("Material", "mat-factory");
// console.log(reg.get("Material")); // undefined! Should be "mat-factory"

// ============================================================================
// EXERCISE 8: Fix the Bug (3/3)
// ============================================================================
// Bug: CachingFactory creates new instances every time instead of caching.

interface CachedProduct { id(): string; }

class CachedButton implements CachedProduct {
  private static counter = 0;
  private readonly _id: string;
  constructor() { this._id = `btn-${++CachedButton.counter}`; }
  id(): string { return this._id; }
}

class CachingFactory {
  private cache: Map<string, CachedProduct> = new Map();
  createButton(): CachedProduct {
    // BUG: Always creates new. Should check cache first.
    const btn = new CachedButton();
    this.cache.set("button", btn);
    return btn;
  }
}

// const cF = new CachingFactory();
// const b1 = cF.createButton();
// const b2 = cF.createButton();
// console.log(b1.id(), b2.id()); // Should both be "btn-1"
// console.log(b1 === b2);        // Should be true

// ============================================================================
// EXERCISE 9: Implement - Cross-Platform Widgets (1/7)
// ============================================================================
// Products: Window_ (render() => "WinWindow: {title}" / "MacWindow: {title}")
//           Scrollbar (render() => "WinScroll({size}px)" / "MacScroll({size}px)")

interface Window_ { render(): string; }
interface Scrollbar { render(): string; }
interface PlatformFactory {
  createWindow(title: string): Window_;
  createScrollbar(size: number): Scrollbar;
}

// TODO: Implement WindowsWindow, MacWindow, WindowsScrollbar, MacScrollbar
// TODO: Implement WindowsPlatformFactory, MacPlatformFactory

// const wf: PlatformFactory = new WindowsPlatformFactory();
// console.log(wf.createWindow("Hi").render());     // "WinWindow: Hi"
// console.log(wf.createScrollbar(10).render());     // "WinScroll(10px)"

// ============================================================================
// EXERCISE 10: Implement - Database Provider (2/7)
// ============================================================================
// Connection.connect() => "Connected to PostgreSQL" / "Connected to MySQL"
// Query.execute(sql) => "PG: {sql}" / "MySQL: {sql}"

interface Connection { connect(): string; }
interface Query { execute(sql: string): string; }
interface DatabaseFactory { createConnection(): Connection; createQuery(): Query; }

// TODO: Implement PostgresConnection, PostgresQuery, PostgresFactory
// TODO: Implement MySQLConnection, MySQLQuery, MySQLFactory

// ============================================================================
// EXERCISE 11: Implement - Document Export (3/7)
// ============================================================================
// HTMLHeader.render("Hi") => "<h1>Hi</h1>"    MarkdownHeader.render("Hi") => "# Hi"
// HTMLPara.render("Hi")   => "<p>Hi</p>"      MarkdownPara.render("Hi")   => "Hi\n"

interface Header { render(text: string): string; }
interface Paragraph { render(text: string): string; }
interface DocFactory { createHeader(): Header; createParagraph(): Paragraph; }

// TODO: Implement HTMLHeader, HTMLParagraph, HTMLDocFactory
// TODO: Implement MarkdownHeader, MarkdownParagraph, MarkdownDocFactory

// ============================================================================
// EXERCISE 12: Implement - Config-based Factory Selection (4/7)
// ============================================================================
// 4 combos: LightWeb, LightMobile, DarkWeb, DarkMobile
// Button.label() => "{Theme}{Platform}-Btn", Icon.symbol() => "{Theme}{Platform}-Icon"

interface AppConfig { theme: "light" | "dark"; platform: "web" | "mobile"; }
interface AppButton { label(): string; }
interface AppIcon { symbol(): string; }
interface AppUIFactory { createButton(): AppButton; createIcon(): AppIcon; }

// TODO: Implement 4 factories + getAppFactory(config: AppConfig): AppUIFactory

// ============================================================================
// EXERCISE 13: Implement - Generic Abstract Factory (5/7)
// ============================================================================
interface GenericFactory<P1, P2> { createFirst(): P1; createSecond(): P2; }

// TODO: StringNumberFactory (createFirst => "hello", createSecond => 42)
// TODO: ArrayBoolFactory (createFirst => ["a","b"], createSecond => true)

// ============================================================================
// EXERCISE 14: Implement - Refactor to Abstract Factory (6/7)
// ============================================================================
// Refactor scattered services into a proper Abstract Factory.

interface EmailService { send(to: string, body: string): string; }
interface SMSService { send(to: string, body: string): string; }

class ProdEmail implements EmailService {
  send(to: string, body: string): string { return `Email to ${to}: ${body}`; }
}
class ProdSMS implements SMSService {
  send(to: string, body: string): string { return `SMS to ${to}: ${body}`; }
}
class MockEmail implements EmailService {
  send(to: string, body: string): string { return `[MOCK] Email to ${to}: ${body}`; }
}
class MockSMS implements SMSService {
  send(to: string, body: string): string { return `[MOCK] SMS to ${to}: ${body}`; }
}

// TODO: MessagingFactory interface + ProductionMessagingFactory + MockMessagingFactory
// TODO: getMessagingFactory(env: "production" | "test"): MessagingFactory

// Test:
// const prodF = getMessagingFactory("production");
// console.log(prodF.createEmail().send("a@b.com", "hi")); // "Email to a@b.com: hi"
// console.log(prodF.createSMS().send("123", "hey"));       // "SMS to 123: hey"
// const testF = getMessagingFactory("test");
// console.log(testF.createEmail().send("a@b.com", "hi"));  // "[MOCK] Email to a@b.com: hi"
// console.log(testF.createSMS().send("123", "hey"));        // "[MOCK] SMS to 123: hey"

// ============================================================================
// EXERCISE 15: Implement - Complete Report App (7/7)
// ============================================================================
// Simple:  Title "Report: {t}", Table "A | B\n1 | 2", Footer "--- {f} ---"
// Fancy:   Title "=== {t} ===", Table "[ A | B ]\n[ 1 | 2 ]", Footer "*** {f} ***"
// generateReport(factory, title, headers, rows, footer) joins with "\n"

interface RTitle { render(text: string): string; }
interface RTable { render(headers: string[], rows: string[][]): string; }
interface RFooter { render(text: string): string; }
interface ReportFactory { createTitle(): RTitle; createTable(): RTable; createFooter(): RFooter; }

// TODO: Implement Simple + Fancy products and factories
// TODO: Implement generateReport function

// Test (Simple):
// const rf: ReportFactory = new SimpleReportFactory();
// console.log(generateReport(rf, "Sales", ["Q1","Q2"], [["100","200"]], "End"));
// Expected output:
// Report: Sales
// Q1 | Q2
// 100 | 200
// --- End ---

// Test (Fancy):
// const ff: ReportFactory = new FancyReportFactory();
// console.log(generateReport(ff, "Sales", ["Q1","Q2"], [["100","200"],["300","400"]], "End"));
// Expected output:
// === Sales ===
// [ Q1 | Q2 ]
// [ 100 | 200 ]
// [ 300 | 400 ]
// *** End ***

// Test (multiple rows):
// const rf2: ReportFactory = new SimpleReportFactory();
// console.log(generateReport(rf2, "Q", ["A","B","C"], [["1","2","3"],["4","5","6"]], "Done"));
// Expected output:
// Report: Q
// A | B | C
// 1 | 2 | 3
// 4 | 5 | 6
// --- Done ---

export {};
