// ============================================================================
// Builder Pattern — Solutions
// ============================================================================
// Run: npx tsx solutions.ts
// ============================================================================

console.log("=== Builder Pattern Solutions ===\n");

// ============================================================================
// EXERCISE 1: Predict the Output
// ============================================================================
// Answer: "large" / 2 / "cheese, pepperoni"
//
// Explanation: The fluent builder chains setSize and addTopping calls via
// `this`. Each method mutates internal state and returns the same builder
// instance. build() returns a plain object with the accumulated state.
// The chain creates a pizza with size "large" and two toppings.
// ============================================================================
class PizzaBuilder1 {
  private toppings: string[] = [];
  private size = "medium";
  setSize(s: string): this { this.size = s; return this; }
  addTopping(t: string): this { this.toppings.push(t); return this; }
  build(): { size: string; toppings: string[] } { return { size: this.size, toppings: this.toppings }; }
}
const pizza1 = new PizzaBuilder1().setSize("large").addTopping("cheese").addTopping("pepperoni").build();
console.log("--- Ex 1 ---");
console.log(pizza1.size);            // large
console.log(pizza1.toppings.length); // 2
console.log(pizza1.toppings.join(", ")); // cheese, pepperoni

// ============================================================================
// EXERCISE 2: Predict the Output
// ============================================================================
// Answer: "hello world" / "foo" / ""
//
// Explanation: build() joins the parts array then reassigns this.parts to a
// new empty array (reset pattern). After the first build(), parts is [].
// The second add("foo").build() produces "foo" and resets again. The third
// build() operates on an empty array, so join(" ") returns "".
// ============================================================================
class StringBuilder2 {
  private parts: string[] = [];
  add(p: string): this { this.parts.push(p); return this; }
  build(): string { const r = this.parts.join(" "); this.parts = []; return r; }
}
const sb = new StringBuilder2();
console.log("\n--- Ex 2 ---");
console.log(sb.add("hello").add("world").build()); // hello world
console.log(sb.add("foo").build());                 // foo
console.log(sb.build());                            // ""

// ============================================================================
// EXERCISE 3: Predict the Output
// ============================================================================
// Answer: 2 / 2 / true
//
// Explanation: build() returns a wrapper object containing a REFERENCE to
// the same internal headers object. Both c3a and c3b point to the identical
// headers object. After adding "Auth", both see 2 keys. The === check is
// true because it's the same object reference. This is a common bug in
// builders — always copy mutable collections in build().
// ============================================================================
class ConfigBuilder3 {
  private headers: Record<string, string> = {};
  addHeader(k: string, v: string): this { this.headers[k] = v; return this; }
  build(): { headers: Record<string, string> } { return { headers: this.headers }; }
}
const b3 = new ConfigBuilder3();
const c3a = b3.addHeader("Accept", "json").build();
const c3b = b3.addHeader("Auth", "tok").build();
console.log("\n--- Ex 3 ---");
console.log(Object.keys(c3a.headers).length); // 2
console.log(Object.keys(c3b.headers).length); // 2
console.log(c3a.headers === c3b.headers);      // true

// ============================================================================
// EXERCISE 4: Predict the Output
// ============================================================================
// Answer: "Car[4w, V4]" / "Car[6w, V8]"
//
// Explanation: The Director orchestrates construction by calling builder
// methods in a specific sequence. Each Director method receives a fresh
// CarBuilder4 instance, so there's no state leak between the sedan and
// truck. This demonstrates the Director's role: encapsulating reusable
// construction recipes that work with any builder implementation.
// ============================================================================
interface VehicleBuilder4 { setWheels(n: number): this; setEngine(t: string): this; build(): string; }
class CarBuilder4 implements VehicleBuilder4 {
  private wheels = 0; private engine = "";
  setWheels(n: number): this { this.wheels = n; return this; }
  setEngine(t: string): this { this.engine = t; return this; }
  build(): string { return `Car[${this.wheels}w, ${this.engine}]`; }
}
class Director4 {
  makeSedan(b: VehicleBuilder4): string { return b.setWheels(4).setEngine("V4").build(); }
  makeTruck(b: VehicleBuilder4): string { return b.setWheels(6).setEngine("V8").build(); }
}
console.log("\n--- Ex 4 ---");
const d4 = new Director4();
console.log(d4.makeSedan(new CarBuilder4())); // Car[4w, V4]
console.log(d4.makeTruck(new CarBuilder4())); // Car[6w, V8]

// ============================================================================
// EXERCISE 5: Predict the Output
// ============================================================================
// Answer: "Alice" / 30 / "Bob"
//
// Explanation: The key insight is the `this` return type in BaseBuilder5.
// When setName() is called on an ExtendedBuilder5 instance, `this` resolves
// to ExtendedBuilder5 (not BaseBuilder5). This preserves the subtype so
// that setAge() is available after setName(). Both call orders work:
// setName→setAge and setAge→setName, because both methods return `this`
// which is always ExtendedBuilder5 at the call site.
// ============================================================================
class BaseBuilder5 {
  protected data: Record<string, unknown> = {};
  setName(n: string): this { this.data["name"] = n; return this; }
  build(): Record<string, unknown> { return { ...this.data }; }
}
class ExtendedBuilder5 extends BaseBuilder5 {
  setAge(a: number): this { this.data["age"] = a; return this; }
}
console.log("\n--- Ex 5 ---");
const r5 = new ExtendedBuilder5().setName("Alice").setAge(30).build();
console.log(r5["name"]); // Alice
console.log(r5["age"]);  // 30
console.log(new ExtendedBuilder5().setAge(25).setName("Bob").build()["name"]); // Bob

// ============================================================================
// EXERCISE 6: Fix — copy the tags array in build()
// ============================================================================
// The bug: build() returned `this.tags` directly (same reference). Any later
// addTag() calls on the builder would mutate the already-built product.
// Fix: use [...this.tags] (spread) to create a shallow copy. This decouples
// the product from the builder's internal state.
// ============================================================================
interface Product6 { readonly name: string; readonly tags: string[]; }
class ProductBuilder6 {
  private name = ""; private tags: string[] = [];
  setName(n: string): this { this.name = n; return this; }
  addTag(t: string): this { this.tags.push(t); return this; }
  build(): Product6 { return { name: this.name, tags: [...this.tags] }; } // FIX: spread
}
console.log("\n--- Ex 6 ---");
const b6 = new ProductBuilder6().setName("Widget").addTag("sale");
const p6 = b6.build(); b6.addTag("new");
console.log(p6.tags.length === 1 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 7: Fix — refactor to step builder with type-enforced required steps
// ============================================================================
// The bug: build() was accessible without calling setHost/setPort first.
// Fix: introduce separate interfaces (NeedsHost7 → NeedsPort7 → OptionalServer7).
// Each step method returns the next interface, restricting which methods are
// available at each stage. build() only exists on OptionalServer7, which is
// only reachable after setHost and setPort have been called.
// The private constructor + static create() prevents direct instantiation.
// ============================================================================
interface ServerConfig7 { host: string; port: number; secure: boolean; }
interface NeedsHost7 { setHost(h: string): NeedsPort7; }
interface NeedsPort7 { setPort(p: number): OptionalServer7; }
interface OptionalServer7 { setSecure(s: boolean): OptionalServer7; build(): ServerConfig7; }

class ServerBuilder7 implements NeedsHost7, NeedsPort7, OptionalServer7 {
  private host = ""; private port = 0; private secure = false;
  private constructor() {}
  static create(): NeedsHost7 { return new ServerBuilder7(); }
  setHost(h: string): NeedsPort7 { this.host = h; return this; }
  setPort(p: number): OptionalServer7 { this.port = p; return this; }
  setSecure(s: boolean): OptionalServer7 { this.secure = s; return this; }
  build(): ServerConfig7 { return { host: this.host, port: this.port, secure: this.secure }; }
}
console.log("\n--- Ex 7 ---");
const c7 = ServerBuilder7.create().setHost("localhost").setPort(8080).setSecure(true).build();
console.log(c7.host === "localhost" ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 8: Fix — reset state in build() so each product is independent
// ============================================================================
// The bug: messages accumulated across build() calls. The second build()
// included messages from both the first and second usage.
// Fix: reset this.title and this.messages after capturing the result.
// Alternative: create a new builder for each product instead of reusing.
// ============================================================================
class NotificationBuilder8 {
  private title = ""; private messages: string[] = [];
  setTitle(t: string): this { this.title = t; return this; }
  addMessage(m: string): this { this.messages.push(m); return this; }
  build(): { title: string; messages: string[] } {
    const r = { title: this.title, messages: [...this.messages] };
    this.title = ""; this.messages = []; // FIX: reset
    return r;
  }
}
console.log("\n--- Ex 8 ---");
const nb8 = new NotificationBuilder8();
const n81 = nb8.setTitle("Alert").addMessage("msg1").build();
const n82 = nb8.setTitle("Info").addMessage("msg2").build();
console.log(n81.messages.length === 1 ? "PASS" : "FAIL");
console.log(n82.messages.length === 1 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 9: Basic Fluent Builder
// ============================================================================
// Implementation: standard fluent builder with validation in build().
// - Each setter stores a value and returns `this` for chaining.
// - build() checks required fields (username, email) and throws if missing.
// - Object.freeze makes the result immutable.
// ============================================================================
interface UserProfile {
  readonly username: string; readonly email: string;
  readonly bio: string; readonly age: number;
}
class UserProfileBuilder {
  private username = ""; private email = ""; private bio = ""; private age = 0;
  setUsername(u: string): this { this.username = u; return this; }
  setEmail(e: string): this { this.email = e; return this; }
  setBio(b: string): this { this.bio = b; return this; }
  setAge(a: number): this { this.age = a; return this; }
  build(): UserProfile {
    if (!this.username) throw new Error("Username required");
    if (!this.email) throw new Error("Email required");
    return Object.freeze({ username: this.username, email: this.email, bio: this.bio, age: this.age });
  }
}
console.log("\n--- Ex 9 ---");
const p9 = new UserProfileBuilder().setUsername("alice").setEmail("a@t.com").setBio("Hi").build();
console.log(p9.username === "alice" ? "PASS" : "FAIL");
console.log(p9.bio === "Hi" ? "PASS" : "FAIL");
console.log(p9.age === 0 ? "PASS" : "FAIL");
try { new UserProfileBuilder().setUsername("bob").build(); console.log("FAIL"); } catch { console.log("PASS"); }

// ============================================================================
// EXERCISE 10: Builder with Director
// ============================================================================
// The FormDirector encapsulates two construction recipes. It works with the
// FormBuilderInterface abstraction, not the concrete FormBuilder. This means
// you could swap in a different builder (e.g., one that creates HTML forms)
// without changing the Director. The builder copies its fields array in
// build() to prevent shared-state bugs.
// ============================================================================
interface Form { title: string; fields: string[]; submitLabel: string; }
interface FormBuilderInterface {
  setTitle(t: string): this; addField(f: string): this;
  setSubmitLabel(l: string): this; build(): Form;
}
class FormBuilder implements FormBuilderInterface {
  private title = ""; private fields: string[] = []; private submitLabel = "";
  setTitle(t: string): this { this.title = t; return this; }
  addField(f: string): this { this.fields.push(f); return this; }
  setSubmitLabel(l: string): this { this.submitLabel = l; return this; }
  build(): Form { return { title: this.title, fields: [...this.fields], submitLabel: this.submitLabel }; }
}
class FormDirector {
  makeLoginForm(b: FormBuilderInterface): Form {
    return b.setTitle("Login").addField("username").addField("password").setSubmitLabel("Sign In").build();
  }
  makeContactForm(b: FormBuilderInterface): Form {
    return b.setTitle("Contact").addField("name").addField("email").addField("message").setSubmitLabel("Send").build();
  }
}
console.log("\n--- Ex 10 ---");
const fd = new FormDirector();
const lf = fd.makeLoginForm(new FormBuilder());
console.log(lf.title === "Login" ? "PASS" : "FAIL");
console.log(lf.fields.length === 2 ? "PASS" : "FAIL");
console.log(lf.submitLabel === "Sign In" ? "PASS" : "FAIL");
console.log(fd.makeContactForm(new FormBuilder()).fields.length === 3 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 11: SQL Query Builder
// ============================================================================
// A real-world-style builder. Key design decisions:
// - select() uses rest params for ergonomic API: select("name", "age")
// - where() can be called multiple times; conditions are ANDed together
// - orderBy defaults to "ASC" if direction omitted
// - build() throws if no table — the only truly required field
// - Default columns is "*" when select() is never called
// ============================================================================
class SqlQueryBuilder {
  private columns: string[] = []; private table = "";
  private conditions: string[] = []; private orderCol = "";
  private orderDir: "ASC" | "DESC" = "ASC"; private limitVal: number | null = null;

  select(...cols: string[]): this { this.columns = cols; return this; }
  from(t: string): this { this.table = t; return this; }
  where(c: string): this { this.conditions.push(c); return this; }
  orderBy(col: string, dir: "ASC" | "DESC" = "ASC"): this { this.orderCol = col; this.orderDir = dir; return this; }
  limit(n: number): this { this.limitVal = n; return this; }

  build(): string {
    if (!this.table) throw new Error("Table required");
    const cols = this.columns.length ? this.columns.join(", ") : "*";
    let q = `SELECT ${cols} FROM ${this.table}`;
    if (this.conditions.length) q += ` WHERE ${this.conditions.join(" AND ")}`;
    if (this.orderCol) q += ` ORDER BY ${this.orderCol} ${this.orderDir}`;
    if (this.limitVal !== null) q += ` LIMIT ${this.limitVal}`;
    return q;
  }
}
console.log("\n--- Ex 11 ---");
const q11 = new SqlQueryBuilder().select("name", "age").from("users")
  .where("active = true").orderBy("name").limit(10).build();
console.log(q11 === "SELECT name, age FROM users WHERE active = true ORDER BY name ASC LIMIT 10" ? "PASS" : "FAIL");
console.log(new SqlQueryBuilder().from("logs").build() === "SELECT * FROM logs" ? "PASS" : "FAIL");
try { new SqlQueryBuilder().select("id").build(); console.log("FAIL"); } catch { console.log("PASS"); }

// ============================================================================
// EXERCISE 12: Step Builder for EmailMessage
// ============================================================================
// The step builder pattern uses separate interfaces to enforce a construction
// sequence at compile time. NeedsFrom12 only exposes setFrom, which returns
// NeedsTo12 (only setTo), which returns OptionalEmailSteps12 (optional
// methods + build). The class implements all interfaces but static create()
// returns NeedsFrom12, hiding all other methods until their step is reached.
// ============================================================================
interface EmailMessage { from: string; to: string; subject: string; body: string; }
interface NeedsFrom12 { setFrom(f: string): NeedsTo12; }
interface NeedsTo12 { setTo(t: string): OptionalEmailSteps12; }
interface OptionalEmailSteps12 {
  setSubject(s: string): OptionalEmailSteps12;
  setBody(b: string): OptionalEmailSteps12;
  build(): EmailMessage;
}
class EmailMessageBuilder implements NeedsFrom12, NeedsTo12, OptionalEmailSteps12 {
  private from = ""; private to = ""; private subject = ""; private body = "";
  private constructor() {}
  static create(): NeedsFrom12 { return new EmailMessageBuilder(); }
  setFrom(f: string): NeedsTo12 { this.from = f; return this; }
  setTo(t: string): OptionalEmailSteps12 { this.to = t; return this; }
  setSubject(s: string): OptionalEmailSteps12 { this.subject = s; return this; }
  setBody(b: string): OptionalEmailSteps12 { this.body = b; return this; }
  build(): EmailMessage { return { from: this.from, to: this.to, subject: this.subject, body: this.body }; }
}
console.log("\n--- Ex 12 ---");
const e12 = EmailMessageBuilder.create().setFrom("a@b.com").setTo("c@d.com").setSubject("Hi").build();
console.log(e12.from === "a@b.com" ? "PASS" : "FAIL");
console.log(e12.to === "c@d.com" ? "PASS" : "FAIL");
console.log(e12.subject === "Hi" ? "PASS" : "FAIL");
console.log(e12.body === "" ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 13: HTML Element Builder
// ============================================================================
// A recursive builder — each HtmlElement can contain child HtmlElements.
// The build(indent) method recursively renders children with increasing
// indentation. Self-closing tags (no text, no children) use <tag /> syntax.
// Attributes are rendered inline. This pattern is used in real HTML template
// libraries and demonstrates how Builder can construct Composite trees.
// ============================================================================
class HtmlElement {
  private tag: string; private attrs: Record<string, string> = {};
  private text = ""; private children: HtmlElement[] = [];
  constructor(tag: string) { this.tag = tag; }
  setAttribute(k: string, v: string): this { this.attrs[k] = v; return this; }
  setText(t: string): this { this.text = t; return this; }
  addChild(c: HtmlElement): this { this.children.push(c); return this; }
  build(indent = 0): string {
    const pad = "  ".repeat(indent);
    const a = Object.entries(this.attrs).map(([k, v]) => ` ${k}="${v}"`).join("");
    if (!this.text && !this.children.length) return `${pad}<${this.tag}${a} />`;
    let r = `${pad}<${this.tag}${a}>`;
    if (this.text) r += this.text;
    if (this.children.length) {
      r += "\n" + this.children.map(c => c.build(indent + 1)).join("\n") + `\n${pad}`;
    }
    return r + `</${this.tag}>`;
  }
}
console.log("\n--- Ex 13 ---");
const div13 = new HtmlElement("div").setAttribute("class", "w")
  .addChild(new HtmlElement("h1").setText("Title"))
  .addChild(new HtmlElement("ul")
    .addChild(new HtmlElement("li").setText("A"))
    .addChild(new HtmlElement("li").setText("B"))).build();
console.log(div13);
console.log(new HtmlElement("br").build() === "<br />" ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 14: Immutable Builder (returns new instance per method call)
// ============================================================================
// Unlike a mutable builder, each setter creates a NEW ThemeBuilder with the
// updated value and all other values copied from the current instance. This
// means the original builder is never modified, enabling "branching":
//   base → light (with borderRadius)
//   base → dark  (with different colors)
// Both derive from the same base without interfering. The tradeoff is
// more object allocations, but for configuration objects this is negligible.
// ============================================================================
interface Theme {
  readonly background: string; readonly foreground: string;
  readonly fontSize: number; readonly borderRadius: number;
}
class ThemeBuilder {
  private readonly bg: string; private readonly fg: string;
  private readonly fs: number; private readonly br: number;
  constructor(bg = "#fff", fg = "#000", fs = 16, br = 0) {
    this.bg = bg; this.fg = fg; this.fs = fs; this.br = br;
  }
  setBackground(c: string): ThemeBuilder { return new ThemeBuilder(c, this.fg, this.fs, this.br); }
  setForeground(c: string): ThemeBuilder { return new ThemeBuilder(this.bg, c, this.fs, this.br); }
  setFontSize(s: number): ThemeBuilder { return new ThemeBuilder(this.bg, this.fg, s, this.br); }
  setBorderRadius(r: number): ThemeBuilder { return new ThemeBuilder(this.bg, this.fg, this.fs, r); }
  build(): Theme {
    return Object.freeze({ background: this.bg, foreground: this.fg, fontSize: this.fs, borderRadius: this.br });
  }
}
console.log("\n--- Ex 14 ---");
const base14 = new ThemeBuilder().setBackground("#fff").setForeground("#000").setFontSize(16);
const light14 = base14.setBorderRadius(4).build();
const dark14 = base14.setBackground("#333").setForeground("#eee").build();
console.log(light14.background === "#fff" ? "PASS" : "FAIL");
console.log(dark14.background === "#333" ? "PASS" : "FAIL");
console.log(light14.borderRadius === 4 ? "PASS" : "FAIL");
console.log(dark14.borderRadius === 0 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 15: Generic Builder<T>
// ============================================================================
// A reusable builder that works with any object type via generics.
// The set() method uses `K extends keyof T` to ensure only valid keys are
// used, and `T[K]` ensures the value type matches the key's type. This
// provides full type safety: set("theme", 42) would be a compile error
// if theme is typed as string. build() returns Readonly<T> via Object.freeze
// to prevent mutations after construction. The constructor spreads defaults
// to avoid mutating the original defaults object.
// ============================================================================
class GenericBuilder<T extends Record<string, unknown>> {
  private data: T;
  constructor(defaults: T) { this.data = { ...defaults }; }
  set<K extends keyof T>(key: K, value: T[K]): this { this.data[key] = value; return this; }
  build(): Readonly<T> { return Object.freeze({ ...this.data }); }
}
console.log("\n--- Ex 15 ---");
interface AppSettings { theme: string; language: string; notifications: boolean; volume: number; }
const s15 = new GenericBuilder<AppSettings>({ theme: "light", language: "en", notifications: true, volume: 50 })
  .set("theme", "dark").set("volume", 80).build();
console.log(s15.theme === "dark" ? "PASS" : "FAIL");
console.log(s15.language === "en" ? "PASS" : "FAIL");
console.log(s15.volume === 80 ? "PASS" : "FAIL");
console.log(Object.isFrozen(s15) ? "PASS" : "FAIL");

console.log("\n=== All solutions complete ===");

// ============================================================================
// Key Takeaways
// ============================================================================
// 1. Always copy mutable collections (arrays, objects) in build() — Ex 3, 6
// 2. Reset builder state after build() if the builder will be reused — Ex 2, 8
// 3. Use `this` return type (not class name) for inheritance support — Ex 5
// 4. Step builders enforce required fields at compile time — Ex 7, 12
// 5. Immutable builders enable branching without shared state — Ex 14
// 6. Generic builders provide type-safe reusable construction — Ex 15
// 7. Directors encapsulate reusable recipes over builder interfaces — Ex 4, 10
// ============================================================================
