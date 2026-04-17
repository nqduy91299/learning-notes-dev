// ============================================================================
// Abstract Factory Pattern - Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules | Run: npx tsx solutions.ts
// ============================================================================

// ─── Shared Types ────────────────────────────────────────────────────────────
interface Button { render(): string; onClick(handler: () => void): void; }
interface Checkbox { render(): string; isChecked(): boolean; toggle(): void; }

// ============================================================================
// SOLUTION 1 — Output: "BtnA" then "BtnB"
// Each factory creates its own Button variant; render() returns variant name.
// ============================================================================
class BtnA implements Button { render() { return "BtnA"; } onClick(h: () => void) { h(); } }
class BtnB implements Button { render() { return "BtnB"; } onClick(h: () => void) { h(); } }
interface SimpleFactory { createButton(): Button; }
class FactoryA implements SimpleFactory { createButton() { return new BtnA(); } }
class FactoryB implements SimpleFactory { createButton() { return new BtnB(); } }
function useFactory(f: SimpleFactory): string { return f.createButton().render(); }

console.log("=== Ex 1 ===");
console.log(useFactory(new FactoryA())); // BtnA
console.log(useFactory(new FactoryB())); // BtnB

// ============================================================================
// SOLUTION 2 — Output: "dark-button", true, false
// DarkCb starts checked=true; toggle flips to false.
// ============================================================================
class DarkBtn implements Button { render() { return "dark-button"; } onClick(_h: () => void) {} }
class DarkCb implements Checkbox {
  private checked = true;
  render() { return "dark-checkbox"; }
  isChecked() { return this.checked; }
  toggle() { this.checked = !this.checked; }
}
interface ThemeFactory { createButton(): Button; createCheckbox(): Checkbox; }
class DarkFactory implements ThemeFactory {
  createButton() { return new DarkBtn(); }
  createCheckbox() { return new DarkCb(); }
}

console.log("\n=== Ex 2 ===");
const f2 = new DarkFactory();
console.log(f2.createButton().render());          // dark-button
const cb2 = f2.createCheckbox();
console.log(cb2.isChecked());                     // true
cb2.toggle();
console.log(cb2.isChecked());                     // false

// ============================================================================
// SOLUTION 3 — Output: X-1, Y-2, X-3, false
// Shared counter across createX/createY. Each call = new object (===false).
// ============================================================================
class ProductX { constructor(public readonly id: number) {} describe() { return `X-${this.id}`; } }
class ProductY { constructor(public readonly id: number) {} describe() { return `Y-${this.id}`; } }
class CountingFactory {
  private count = 0;
  createX() { return new ProductX(++this.count); }
  createY() { return new ProductY(++this.count); }
}

console.log("\n=== Ex 3 ===");
const cf = new CountingFactory();
console.log(cf.createX().describe()); // X-1
console.log(cf.createY().describe()); // Y-2
console.log(cf.createX().describe()); // X-3
console.log(cf.createX() === cf.createX()); // false

// ============================================================================
// SOLUTION 4 — Output: "LOG: DATA: hello", '{"msg":"{\"d\":\"hello\"}"}'
// Plain wraps with prefix strings; JSON double-serializes.
// ============================================================================
interface Logger { log(msg: string): string; }
interface Formatter { format(data: string): string; }
interface LogFactory { createLogger(): Logger; createFormatter(): Formatter; }
class PlainLogger implements Logger { log(m: string) { return `LOG: ${m}`; } }
class PlainFmt implements Formatter { format(d: string) { return `DATA: ${d}`; } }
class JsonLogger implements Logger { log(m: string) { return JSON.stringify({ msg: m }); } }
class JsonFmt implements Formatter { format(d: string) { return JSON.stringify({ d }); } }
class PlainLogFactory implements LogFactory {
  createLogger() { return new PlainLogger(); } createFormatter() { return new PlainFmt(); }
}
class JsonLogFactory implements LogFactory {
  createLogger() { return new JsonLogger(); } createFormatter() { return new JsonFmt(); }
}
function processLog(f: LogFactory, msg: string): string {
  return f.createLogger().log(f.createFormatter().format(msg));
}

console.log("\n=== Ex 4 ===");
console.log(processLog(new PlainLogFactory(), "hello"));
console.log(processLog(new JsonLogFactory(), "hello"));

// ============================================================================
// SOLUTION 5 — Output: "Alpha(shared)", false, true
// clone() creates new object with same label. Different refs, same name.
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

console.log("\n=== Ex 5 ===");
const pf = new ProtoFactory(new WidgetAlpha("shared"));
const a1 = pf.create(), a2 = pf.create();
console.log(a1.name());              // Alpha(shared)
console.log(a1 === a2);              // false
console.log(a1.name() === a2.name()); // true

// ============================================================================
// SOLUTION 6 — Fix: Return SuccessBody, not ErrorBody
// ============================================================================
interface NTitle { render(): string; }
interface NBody { render(): string; }
interface NFactory { createTitle(): NTitle; createBody(): NBody; }
class SuccessTitle implements NTitle { render() { return "[SUCCESS]"; } }
class SuccessBody implements NBody { render() { return "Operation completed."; } }
class ErrorTitle implements NTitle { render() { return "[ERROR]"; } }
class ErrorBody implements NBody { render() { return "An error occurred."; } }
class SuccessNFactory implements NFactory {
  createTitle() { return new SuccessTitle(); }
  createBody() { return new SuccessBody(); } // FIXED: was ErrorBody
}

console.log("\n=== Ex 6 ===");
const snf6 = new SuccessNFactory();
console.log(`${snf6.createTitle().render()} ${snf6.createBody().render()}`);

// ============================================================================
// SOLUTION 7 — Fix: Normalize key on register too
// ============================================================================
class FactoryRegistry<T> {
  private map: Map<string, T> = new Map();
  register(name: string, factory: T): void { this.map.set(name.toLowerCase(), factory); }
  get(name: string): T | undefined { return this.map.get(name.toLowerCase()); }
}

console.log("\n=== Ex 7 ===");
const reg = new FactoryRegistry<string>();
reg.register("Material", "mat-factory");
console.log(reg.get("Material")); // "mat-factory" (now works)

// ============================================================================
// SOLUTION 8 — Fix: Check cache before creating
// ============================================================================
interface CachedProduct { id(): string; }
class CachedButton implements CachedProduct {
  private static counter = 0;
  private readonly _id: string;
  constructor() { this._id = `btn-${++CachedButton.counter}`; }
  id() { return this._id; }
}
class CachingFactory {
  private cache: Map<string, CachedProduct> = new Map();
  createButton(): CachedProduct {
    if (!this.cache.has("button")) this.cache.set("button", new CachedButton());
    return this.cache.get("button")!;
  }
}

console.log("\n=== Ex 8 ===");
const cF = new CachingFactory();
const b1 = cF.createButton(), b2 = cF.createButton();
console.log(b1.id(), b2.id()); // same id
console.log(b1 === b2);        // true

// ============================================================================
// SOLUTION 9 — Cross-Platform Widgets
// ============================================================================
interface Window_ { render(): string; }
interface Scrollbar { render(): string; }
interface PlatformFactory {
  createWindow(title: string): Window_;
  createScrollbar(size: number): Scrollbar;
}

class WindowsWindow implements Window_ {
  constructor(private title: string) {}
  render() { return `WinWindow: ${this.title}`; }
}
class MacWindow implements Window_ {
  constructor(private title: string) {}
  render() { return `MacWindow: ${this.title}`; }
}
class WindowsScrollbar implements Scrollbar {
  constructor(private size: number) {}
  render() { return `WinScroll(${this.size}px)`; }
}
class MacScrollbar implements Scrollbar {
  constructor(private size: number) {}
  render() { return `MacScroll(${this.size}px)`; }
}
class WindowsPlatformFactory implements PlatformFactory {
  createWindow(t: string) { return new WindowsWindow(t); }
  createScrollbar(s: number) { return new WindowsScrollbar(s); }
}
class MacPlatformFactory implements PlatformFactory {
  createWindow(t: string) { return new MacWindow(t); }
  createScrollbar(s: number) { return new MacScrollbar(s); }
}

console.log("\n=== Ex 9 ===");
const wf = new WindowsPlatformFactory();
console.log(wf.createWindow("Hi").render());
console.log(wf.createScrollbar(10).render());
const mf = new MacPlatformFactory();
console.log(mf.createWindow("Hi").render());
console.log(mf.createScrollbar(10).render());

// ============================================================================
// SOLUTION 10 — Database Provider
// ============================================================================
interface Connection { connect(): string; }
interface Query { execute(sql: string): string; }
interface DatabaseFactory { createConnection(): Connection; createQuery(): Query; }

class PgConn implements Connection { connect() { return "Connected to PostgreSQL"; } }
class PgQuery implements Query { execute(sql: string) { return `PG: ${sql}`; } }
class MyConn implements Connection { connect() { return "Connected to MySQL"; } }
class MyQuery implements Query { execute(sql: string) { return `MySQL: ${sql}`; } }
class PostgresFactory implements DatabaseFactory {
  createConnection() { return new PgConn(); } createQuery() { return new PgQuery(); }
}
class MySQLFactory implements DatabaseFactory {
  createConnection() { return new MyConn(); } createQuery() { return new MyQuery(); }
}

console.log("\n=== Ex 10 ===");
const pg = new PostgresFactory();
console.log(pg.createConnection().connect());
console.log(pg.createQuery().execute("SELECT 1"));
const my = new MySQLFactory();
console.log(my.createConnection().connect());
console.log(my.createQuery().execute("SELECT 1"));

// ============================================================================
// SOLUTION 11 — Document Export
// ============================================================================
interface Header { render(text: string): string; }
interface Paragraph { render(text: string): string; }
interface DocFactory { createHeader(): Header; createParagraph(): Paragraph; }

class HTMLHeader implements Header { render(t: string) { return `<h1>${t}</h1>`; } }
class HTMLPara implements Paragraph { render(t: string) { return `<p>${t}</p>`; } }
class MdHeader implements Header { render(t: string) { return `# ${t}`; } }
class MdPara implements Paragraph { render(t: string) { return `${t}\n`; } }
class HTMLDocFactory implements DocFactory {
  createHeader() { return new HTMLHeader(); } createParagraph() { return new HTMLPara(); }
}
class MdDocFactory implements DocFactory {
  createHeader() { return new MdHeader(); } createParagraph() { return new MdPara(); }
}

console.log("\n=== Ex 11 ===");
const hf = new HTMLDocFactory();
console.log(hf.createHeader().render("Title"));
console.log(hf.createParagraph().render("Body"));
const mdf = new MdDocFactory();
console.log(mdf.createHeader().render("Title"));
console.log(mdf.createParagraph().render("Body"));

// ============================================================================
// SOLUTION 12 — Config-based Factory Selection
// ============================================================================
interface AppConfig { theme: "light" | "dark"; platform: "web" | "mobile"; }
interface AppButton { label(): string; }
interface AppIcon { symbol(): string; }
interface AppUIFactory { createButton(): AppButton; createIcon(): AppIcon; }

function makeAppFactory(prefix: string): AppUIFactory {
  return {
    createButton: () => ({ label: () => `${prefix}-Btn` }),
    createIcon: () => ({ symbol: () => `${prefix}-Icon` }),
  };
}
const appFactories: Record<string, AppUIFactory> = {
  "light-web": makeAppFactory("LightWeb"),
  "light-mobile": makeAppFactory("LightMobile"),
  "dark-web": makeAppFactory("DarkWeb"),
  "dark-mobile": makeAppFactory("DarkMobile"),
};
function getAppFactory(config: AppConfig): AppUIFactory {
  return appFactories[`${config.theme}-${config.platform}`];
}

console.log("\n=== Ex 12 ===");
const af1 = getAppFactory({ theme: "dark", platform: "web" });
console.log(af1.createButton().label());  // DarkWeb-Btn
console.log(af1.createIcon().symbol());   // DarkWeb-Icon
const af2 = getAppFactory({ theme: "light", platform: "mobile" });
console.log(af2.createButton().label());  // LightMobile-Btn

// ============================================================================
// SOLUTION 13 — Generic Abstract Factory
// ============================================================================
interface GenericFactory<P1, P2> { createFirst(): P1; createSecond(): P2; }

class StringNumberFactory implements GenericFactory<string, number> {
  createFirst() { return "hello"; }
  createSecond() { return 42; }
}
class ArrayBoolFactory implements GenericFactory<string[], boolean> {
  createFirst() { return ["a", "b"]; }
  createSecond() { return true; }
}

console.log("\n=== Ex 13 ===");
const snf = new StringNumberFactory();
console.log(snf.createFirst(), snf.createSecond());
const abf = new ArrayBoolFactory();
console.log(abf.createFirst(), abf.createSecond());

// ============================================================================
// SOLUTION 14 — Refactor to Abstract Factory
// ============================================================================
interface EmailService { send(to: string, body: string): string; }
interface SMSService { send(to: string, body: string): string; }
class ProdEmail implements EmailService {
  send(to: string, body: string) { return `Email to ${to}: ${body}`; }
}
class ProdSMS implements SMSService {
  send(to: string, body: string) { return `SMS to ${to}: ${body}`; }
}
class MockEmail implements EmailService {
  send(to: string, body: string) { return `[MOCK] Email to ${to}: ${body}`; }
}
class MockSMS implements SMSService {
  send(to: string, body: string) { return `[MOCK] SMS to ${to}: ${body}`; }
}

interface MessagingFactory { createEmail(): EmailService; createSMS(): SMSService; }
class ProdMsgFactory implements MessagingFactory {
  createEmail() { return new ProdEmail(); } createSMS() { return new ProdSMS(); }
}
class MockMsgFactory implements MessagingFactory {
  createEmail() { return new MockEmail(); } createSMS() { return new MockSMS(); }
}
function getMessagingFactory(env: "production" | "test"): MessagingFactory {
  return env === "production" ? new ProdMsgFactory() : new MockMsgFactory();
}

console.log("\n=== Ex 14 ===");
const pMsg = getMessagingFactory("production");
console.log(pMsg.createEmail().send("a@b.com", "hi"));
console.log(pMsg.createSMS().send("123", "hey"));
const tMsg = getMessagingFactory("test");
console.log(tMsg.createEmail().send("a@b.com", "hi"));

// ============================================================================
// SOLUTION 15 — Complete Report Application
// ============================================================================
interface RTitle { render(text: string): string; }
interface RTable { render(headers: string[], rows: string[][]): string; }
interface RFooter { render(text: string): string; }
interface ReportFactory { createTitle(): RTitle; createTable(): RTable; createFooter(): RFooter; }

class SimpleTitle implements RTitle { render(t: string) { return `Report: ${t}`; } }
class SimpleTable implements RTable {
  render(h: string[], rows: string[][]) {
    return [h.join(" | "), ...rows.map(r => r.join(" | "))].join("\n");
  }
}
class SimpleFooter implements RFooter { render(t: string) { return `--- ${t} ---`; } }

class FancyTitle implements RTitle { render(t: string) { return `=== ${t} ===`; } }
class FancyTable implements RTable {
  render(h: string[], rows: string[][]) {
    return [`[ ${h.join(" | ")} ]`, ...rows.map(r => `[ ${r.join(" | ")} ]`)].join("\n");
  }
}
class FancyFooter implements RFooter { render(t: string) { return `*** ${t} ***`; } }

class SimpleReportFactory implements ReportFactory {
  createTitle() { return new SimpleTitle(); }
  createTable() { return new SimpleTable(); }
  createFooter() { return new SimpleFooter(); }
}
class FancyReportFactory implements ReportFactory {
  createTitle() { return new FancyTitle(); }
  createTable() { return new FancyTable(); }
  createFooter() { return new FancyFooter(); }
}

function generateReport(
  factory: ReportFactory, title: string,
  headers: string[], rows: string[][], footer: string
): string {
  return [
    factory.createTitle().render(title),
    factory.createTable().render(headers, rows),
    factory.createFooter().render(footer),
  ].join("\n");
}

console.log("\n=== Ex 15 ===");
console.log(generateReport(new SimpleReportFactory(), "Sales", ["Q1","Q2"], [["100","200"]], "End"));
console.log();
console.log(generateReport(new FancyReportFactory(), "Sales", ["Q1","Q2"], [["100","200"]], "End"));

console.log("\n=== All 15 exercises completed ===");
export {};
