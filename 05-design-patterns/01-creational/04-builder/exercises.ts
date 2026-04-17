// ============================================================================
// Builder Pattern — Exercises (15 exercises)
// ============================================================================
// Run: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// EXERCISE 1: Predict the Output
// ============================================================================
// A basic fluent builder with method chaining.
// What values does the built object contain after the chain?

class PizzaBuilder1 {
  private toppings: string[] = [];
  private size = "medium";
  setSize(size: string): this { this.size = size; return this; }
  addTopping(t: string): this { this.toppings.push(t); return this; }
  build(): { size: string; toppings: string[] } {
    return { size: this.size, toppings: this.toppings };
  }
}
const pizza1 = new PizzaBuilder1().setSize("large").addTopping("cheese").addTopping("pepperoni").build();
// console.log(pizza1.size);
// console.log(pizza1.toppings.length);
// console.log(pizza1.toppings.join(", "));
// YOUR PREDICTION:
//   pizza1.size        → ?
//   pizza1.toppings.length → ?
//   pizza1.toppings.join(", ") → ?

// ============================================================================
// EXERCISE 2: Predict the Output
// ============================================================================
// The builder resets its parts array after each build().
// What does each build() call return? What about the third (empty) build?
class StringBuilder2 {
  private parts: string[] = [];
  add(part: string): this { this.parts.push(part); return this; }
  build(): string { const r = this.parts.join(" "); this.parts = []; return r; }
}
const sb = new StringBuilder2();
const first = sb.add("hello").add("world").build();
const second = sb.add("foo").build();
// console.log(first);
// console.log(second);
// console.log(sb.build());
// YOUR PREDICTION:
//   first     → ?
//   second    → ?
//   sb.build() → ?

// ============================================================================
// EXERCISE 3: Predict the Output
// ============================================================================
// The build() method returns the headers object directly (no copy).
// What happens when you add more headers after the first build()?
class ConfigBuilder3 {
  private headers: Record<string, string> = {};
  addHeader(k: string, v: string): this { this.headers[k] = v; return this; }
  build(): { headers: Record<string, string> } { return { headers: this.headers }; }
}
const builder3 = new ConfigBuilder3();
const c3a = builder3.addHeader("Accept", "json").build();
const c3b = builder3.addHeader("Auth", "token123").build();
// console.log(Object.keys(c3a.headers).length);
// console.log(Object.keys(c3b.headers).length);
// console.log(c3a.headers === c3b.headers);
// YOUR PREDICTION:
//   Object.keys(c3a.headers).length → ?
//   Object.keys(c3b.headers).length → ?
//   c3a.headers === c3b.headers     → ?

// ============================================================================
// EXERCISE 4: Predict the Output
// ============================================================================
// A Director class orchestrates construction on builder instances.
// Each Director method receives a fresh builder. What strings are produced?
interface VehicleBuilder4 {
  setWheels(n: number): this;
  setEngine(type: string): this;
  build(): string;
}
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
const d4 = new Director4();
const car4 = d4.makeSedan(new CarBuilder4());
const truck4 = d4.makeTruck(new CarBuilder4());
// console.log(car4);
// console.log(truck4);
// YOUR PREDICTION:
//   car4   → ?
//   truck4 → ?

// ============================================================================
// EXERCISE 5: Predict the Output
// ============================================================================
// An extended builder inherits from a base builder. The base setName returns
// `this`, which preserves the subclass type. Can you chain setName→setAge
// on the extended builder? What about setAge→setName (reverse order)?
class BaseBuilder5 {
  protected data: Record<string, unknown> = {};
  setName(name: string): this { this.data["name"] = name; return this; }
  build(): Record<string, unknown> { return { ...this.data }; }
}
class ExtendedBuilder5 extends BaseBuilder5 {
  setAge(age: number): this { this.data["age"] = age; return this; }
}
const r5 = new ExtendedBuilder5().setName("Alice").setAge(30).build();
// console.log(r5["name"]);
// console.log(r5["age"]);
// console.log(new ExtendedBuilder5().setAge(25).setName("Bob").build()["name"]);
// YOUR PREDICTION:
//   r5["name"] → ?
//   r5["age"]  → ?
//   new ExtendedBuilder5().setAge(25).setName("Bob").build()["name"] → ?

// ============================================================================
// EXERCISE 6: Fix the Bug — Shared mutable reference leaks
// ============================================================================
// The builder returns the internal tags array directly. When you continue
// adding tags to the builder after build(), the previously built product
// is mutated. Fix build() so the product is isolated from the builder.
interface Product6 { readonly name: string; readonly tags: string[]; }

class ProductBuilder6 {
  private name = "";
  private tags: string[] = [];
  setName(n: string): this { this.name = n; return this; }
  addTag(t: string): this { this.tags.push(t); return this; }
  build(): Product6 {
    // BUG: tags array is shared — mutations after build() affect the product
    return { name: this.name, tags: this.tags };
  }
}
// const b6 = new ProductBuilder6().setName("Widget").addTag("sale");
// const p6 = b6.build();
// b6.addTag("new");
// console.log(p6.tags.length === 1 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 7: Fix the Bug — Step builder (enforce required steps via types)
// ============================================================================
// The current builder allows calling build() without setHost or setPort.
// Refactor into a step builder pattern with separate interfaces for each
// required step, so the type system prevents invalid construction sequences.
// Requirements after fix:
//   ServerBuilder7.create().build()                          → compile error
//   ServerBuilder7.create().setHost("x").build()             → compile error
//   ServerBuilder7.create().setHost("x").setPort(80).build() → compiles
interface ServerConfig7 { host: string; port: number; secure: boolean; }

class ServerBuilder7 {
  private host = ""; private port = 0; private secure = false;
  setHost(h: string): this { this.host = h; return this; }
  setPort(p: number): this { this.port = p; return this; }
  setSecure(s: boolean): this { this.secure = s; return this; }
  // BUG: build() is callable without setHost/setPort.
  // Refactor so: create().build() won't compile
  //              create().setHost("x").build() won't compile
  //              create().setHost("x").setPort(80).build() compiles
  build(): ServerConfig7 { return { host: this.host, port: this.port, secure: this.secure }; }
}
// const c7 = ServerBuilder7.create().setHost("localhost").setPort(8080).setSecure(true).build();
// console.log(c7.host === "localhost" ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 8: Fix the Bug — State accumulates across builds
// ============================================================================
// When reusing the same builder for multiple build() calls, messages from
// the first build leak into the second. The builder should reset its internal
// state after each build() so each product is independent.
class NotificationBuilder8 {
  private title = ""; private messages: string[] = [];
  setTitle(t: string): this { this.title = t; return this; }
  addMessage(m: string): this { this.messages.push(m); return this; }
  build(): { title: string; messages: string[] } {
    // BUG: messages accumulate across builds
    return { title: this.title, messages: [...this.messages] };
  }
}
// const nb = new NotificationBuilder8();
// const n1 = nb.setTitle("Alert").addMessage("msg1").build();
// const n2 = nb.setTitle("Info").addMessage("msg2").build();
// console.log(n1.messages.length === 1 ? "PASS" : "FAIL");
// console.log(n2.messages.length === 1 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 9: Implement — Basic Fluent Builder
// ============================================================================
// Build UserProfile objects using a fluent builder.
// Requirements:
// - setUsername(username: string): this
// - setEmail(email: string): this
// - setBio(bio: string): this       — optional, default ""
// - setAge(age: number): this       — optional, default 0
// - build(): UserProfile            — throws Error if username or email is empty
// The built object should be frozen (immutable).
interface UserProfile {
  readonly username: string;
  readonly email: string;
  readonly bio: string;
  readonly age: number;
}
// Implement: class UserProfileBuilder { ... }

// const p9 = new UserProfileBuilder().setUsername("alice").setEmail("a@t.com").setBio("Hi").build();
// console.log(p9.username === "alice" ? "PASS" : "FAIL");
// console.log(p9.bio === "Hi" ? "PASS" : "FAIL");
// console.log(p9.age === 0 ? "PASS" : "FAIL");
// try { new UserProfileBuilder().setUsername("bob").build(); console.log("FAIL"); } catch { console.log("PASS"); }

// ============================================================================
// EXERCISE 10: Implement — Builder with Director
// ============================================================================
// Create a FormBuilder and FormDirector that work together.
// FormBuilder builds Form objects (title, fields[], submitLabel).
// FormDirector encapsulates two construction recipes:
//   - makeLoginForm(builder): title="Login", fields=["username","password"], submit="Sign In"
//   - makeContactForm(builder): title="Contact", fields=["name","email","message"], submit="Send"
// The Director should accept any FormBuilderInterface, not a concrete class.
interface Form { title: string; fields: string[]; submitLabel: string; }
interface FormBuilderInterface {
  setTitle(t: string): this; addField(f: string): this;
  setSubmitLabel(l: string): this; build(): Form;
}
// Implement: class FormBuilder implements FormBuilderInterface { ... }
// Implement: class FormDirector { makeLoginForm(b): Form; makeContactForm(b): Form; }
// Login: title "Login", fields ["username","password"], submit "Sign In"
// Contact: title "Contact", fields ["name","email","message"], submit "Send"

// const fd = new FormDirector();
// const lf = fd.makeLoginForm(new FormBuilder());
// console.log(lf.title === "Login" ? "PASS" : "FAIL");
// console.log(lf.fields.length === 2 ? "PASS" : "FAIL");
// const cf = fd.makeContactForm(new FormBuilder());
// console.log(cf.fields.length === 3 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 11: Implement — SQL Query Builder
// ============================================================================
// Build simple SQL SELECT queries with a fluent API.
// Methods:
//   select(...cols: string[]): this — columns to select (default "*" if none)
//   from(table: string): this      — required, throws in build() if missing
//   where(condition: string): this  — can be called multiple times (joined with AND)
//   orderBy(col: string, dir?: "ASC" | "DESC"): this — default direction "ASC"
//   limit(n: number): this
//   build(): string                 — produces the SQL string
//
// Example: "SELECT name, age FROM users WHERE active = true ORDER BY name ASC LIMIT 10"

// const q1 = new SqlQueryBuilder().select("name","age").from("users")
//   .where("active = true").orderBy("name").limit(10).build();
// console.log(q1 === "SELECT name, age FROM users WHERE active = true ORDER BY name ASC LIMIT 10" ? "PASS" : "FAIL");
// console.log(new SqlQueryBuilder().from("logs").build() === "SELECT * FROM logs" ? "PASS" : "FAIL");
// try { new SqlQueryBuilder().select("id").build(); console.log("FAIL"); } catch { console.log("PASS"); }

// ============================================================================
// EXERCISE 12: Implement — Step Builder for EmailMessage
// ============================================================================
// Create a type-safe step builder that enforces this order:
//   setFrom (required) → setTo (required) → optional steps → build
// The interfaces below define the step contracts. Implement EmailMessageBuilder
// with a private constructor and static create() method.
// Default subject and body should be empty strings.
interface EmailMessage { from: string; to: string; subject: string; body: string; }
interface NeedsFrom12 { setFrom(from: string): NeedsTo12; }
interface NeedsTo12 { setTo(to: string): OptionalEmailSteps12; }
interface OptionalEmailSteps12 {
  setSubject(s: string): OptionalEmailSteps12;
  setBody(b: string): OptionalEmailSteps12;
  build(): EmailMessage;
}
// Implement: class EmailMessageBuilder { static create(): NeedsFrom12; ... }

// const e12 = EmailMessageBuilder.create().setFrom("a@b.com").setTo("c@d.com").setSubject("Hi").build();
// console.log(e12.from === "a@b.com" ? "PASS" : "FAIL");
// console.log(e12.body === "" ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 13: Implement — HTML Element Builder
// ============================================================================
// Build a recursive HTML element builder that can nest children.
// API:
//   constructor(tag: string)
//   setAttribute(key: string, value: string): this
//   setText(text: string): this
//   addChild(child: HtmlElement): this
//   build(indent?: number): string
//
// Rules:
//   - Self-closing if no text and no children: <br />
//   - Attributes rendered as key="value": <div class="w">
//   - Children indented with 2 spaces per nesting level
//   - Text goes inline: <h1>Title</h1>

// const div = new HtmlElement("div").setAttribute("class","w")
//   .addChild(new HtmlElement("h1").setText("Title"))
//   .addChild(new HtmlElement("ul")
//     .addChild(new HtmlElement("li").setText("A"))
//     .addChild(new HtmlElement("li").setText("B"))).build();
// console.log(div);
// console.log(new HtmlElement("br").build() === "<br />" ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 14: Implement — Immutable Builder (each method returns new instance)
// ============================================================================
// Unlike a normal mutable builder, an immutable builder creates a new builder
// instance on every method call. This enables branching: create a base config,
// then derive multiple variations without them interfering.
//
// ThemeBuilder methods (each returns a NEW ThemeBuilder):
//   setBackground(color: string): ThemeBuilder
//   setForeground(color: string): ThemeBuilder
//   setFontSize(size: number): ThemeBuilder
//   setBorderRadius(radius: number): ThemeBuilder
//   build(): Theme — returns a frozen Theme object
//
// Defaults: background="#fff", foreground="#000", fontSize=16, borderRadius=0
interface Theme {
  readonly background: string; readonly foreground: string;
  readonly fontSize: number; readonly borderRadius: number;
}
// Implement: class ThemeBuilder { ... }

// const base = new ThemeBuilder().setBackground("#fff").setForeground("#000").setFontSize(16);
// const light = base.setBorderRadius(4).build();
// const dark = base.setBackground("#333").setForeground("#eee").build();
// console.log(light.background === "#fff" ? "PASS" : "FAIL");
// console.log(dark.background === "#333" ? "PASS" : "FAIL");
// console.log(dark.borderRadius === 0 ? "PASS" : "FAIL");

// ============================================================================
// EXERCISE 15: Implement — Generic Builder<T>
// ============================================================================
// Create a reusable generic builder that works with any object type.
// Constructor takes a defaults object of type T.
// Methods:
//   set<K extends keyof T>(key: K, value: T[K]): this — type-safe key/value
//   build(): Readonly<T> — returns a frozen copy
//
// The builder should not mutate the original defaults object.

// interface AppSettings { theme: string; language: string; notifications: boolean; volume: number; }
// const s = new GenericBuilder<AppSettings>({ theme:"light", language:"en", notifications:true, volume:50 })
//   .set("theme","dark").set("volume",80).build();
// console.log(s.theme === "dark" ? "PASS" : "FAIL");
// console.log(s.language === "en" ? "PASS" : "FAIL");
// console.log(Object.isFrozen(s) ? "PASS" : "FAIL");
