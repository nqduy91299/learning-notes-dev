# Builder Pattern

## Intent

**Builder** is a creational design pattern that lets you construct complex objects
step by step. The pattern allows you to produce different types and representations
of an object using the same construction code.

Unlike other creational patterns that produce objects in a single step (e.g., a
factory method call or a constructor invocation), the Builder pattern constructs
objects incrementally, giving fine-grained control over the construction process.

The key insight is separating the **construction** of a complex object from its
**representation**, so the same construction process can create different
representations.

---

## The Problem: Telescoping Constructors

Imagine creating a `House` object. A simple house needs walls, a floor, doors,
windows, and a roof. But what about a garage, pool, heating, plumbing?

### Subclass Explosion

```typescript
class House {}
class HouseWithGarage extends House {}
class HouseWithPool extends House {}
class HouseWithGarageAndPool extends House {}
// ... exponential growth!
```

### Telescoping Constructor

```typescript
class House {
  constructor(
    walls: number, doors: number, windows: number,
    hasGarage = false, hasPool = false, hasGarden = false,
    hasHeating = false, hasPlumbing = false
  ) {}
}
// Ugly and error-prone — what does each boolean mean?
const house = new House(4, 2, 8, true, false, true, false, true);
```

### Builder Pattern (The Solution)

```typescript
const house = new HouseBuilder()
  .setWalls(4).setDoors(2).setWindows(8)
  .addGarage().addGarden().addPlumbing()
  .build();
```

---

## Structure

```
┌──────────────────┐
│     Director     │
│──────────────────│        ┌──────────────────────┐
│ + construct()    │───────▶│   <<interface>>       │
└──────────────────┘        │      Builder          │
                            │──────────────────────│
                            │ + stepA(): this       │
                            │ + stepB(): this       │
                            └──────────┬───────────┘
                                       │
                            ┌──────────┴───────────┐
                            │   ConcreteBuilder     │
                            │──────────────────────│
                            │ - product: Product    │
                            │ + stepA(): this       │
                            │ + stepB(): this       │
                            │ + getResult(): Product│
                            └──────────────────────┘
```

### Participants

1. **Builder** (interface): Declares construction steps common to all builders.
2. **ConcreteBuilder**: Implements steps; provides `getResult()` to retrieve product.
3. **Director**: Defines the order to call construction steps (optional).
4. **Product**: The complex object being built.

---

## Fluent Interface / Method Chaining

Each setter returns `this`, enabling chained calls:

```typescript
class UserBuilder {
  private name = "";
  private email = "";

  setName(name: string): this { this.name = name; return this; }
  setEmail(email: string): this { this.email = email; return this; }

  build(): { name: string; email: string } {
    return { name: this.name, email: this.email };
  }
}

const user = new UserBuilder().setName("Alice").setEmail("a@b.com").build();
```

Key points:
- Return type is `this` (not the class name) to support subclassing correctly.
- The `build()` method is the terminal operation that produces the product.
- Validation can happen in `build()` to ensure the product is in a valid state.
- Each setter mutates internal state and returns the same builder instance.

### Why `this` Instead of the Class Name?

When you extend a builder, returning `this` ensures the subclass type is preserved:

```typescript
class BaseBuilder {
  protected data: Record<string, string> = {};
  setName(name: string): this {
    this.data["name"] = name;
    return this; // Returns the actual subtype at runtime
  }
  build(): Record<string, string> { return { ...this.data }; }
}

class ExtendedBuilder extends BaseBuilder {
  setRole(role: string): this {
    this.data["role"] = role;
    return this;
  }
}

// Works because setName returns ExtendedBuilder (not BaseBuilder)
const result = new ExtendedBuilder().setName("Alice").setRole("admin").build();
```

---

## The Director Role

Encapsulates reusable construction recipes:

```typescript
class MealDirector {
  makeKidsMeal(b: MealBuilder): Meal {
    return b.addMain().addSide().addDrink().addDessert().build();
  }
  makeValueMeal(b: MealBuilder): Meal {
    return b.addMain().addDrink().build();
  }
}
```

Use a Director when you have multiple recipes or the sequence matters.
In modern TS, the Director is often omitted — the client drives construction.

---

## Implementation in TypeScript

```typescript
interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

class HttpRequestBuilder {
  private method = "GET";
  private url = "";
  private headers: Record<string, string> = {};
  private body: string | null = null;

  setMethod(m: string): this { this.method = m; return this; }
  setUrl(u: string): this { this.url = u; return this; }
  addHeader(k: string, v: string): this { this.headers[k] = v; return this; }
  setBody(b: string): this { this.body = b; return this; }

  build(): HttpRequest {
    if (!this.url) throw new Error("URL is required");
    return {
      method: this.method, url: this.url,
      headers: { ...this.headers }, body: this.body,
    };
  }
}
```

### Builder with Validation

Validation can happen eagerly (in setters) or lazily (in `build()`):

```typescript
class EmailBuilder {
  private from = "";
  private to: string[] = [];
  private subject = "";

  setFrom(from: string): this {
    if (!from.includes("@")) throw new Error("Invalid email"); // eager
    this.from = from;
    return this;
  }

  addTo(to: string): this {
    this.to.push(to);
    return this;
  }

  setSubject(subject: string): this {
    this.subject = subject;
    return this;
  }

  build(): { from: string; to: string[]; subject: string } {
    if (!this.from) throw new Error("From is required");         // lazy
    if (this.to.length === 0) throw new Error("Need recipients"); // lazy
    return { from: this.from, to: [...this.to], subject: this.subject };
  }
}
```

---

## Step Builder Pattern (Type-Safe Required Steps)

Uses the type system to **enforce** required steps are called in order:

```typescript
interface NeedsHost { setHost(host: string): NeedsPort; }
interface NeedsPort { setPort(port: number): OptionalConfig; }
interface OptionalConfig {
  setDatabase(db: string): OptionalConfig;
  build(): DatabaseConfig;
}

interface DatabaseConfig { host: string; port: number; database: string; }

class DatabaseConfigBuilder implements NeedsHost, NeedsPort, OptionalConfig {
  private host = ""; private port = 0; private database = "default";
  private constructor() {}
  static create(): NeedsHost { return new DatabaseConfigBuilder(); }

  setHost(host: string): NeedsPort { this.host = host; return this; }
  setPort(port: number): OptionalConfig { this.port = port; return this; }
  setDatabase(db: string): OptionalConfig { this.database = db; return this; }
  build(): DatabaseConfig {
    return { host: this.host, port: this.port, database: this.database };
  }
}

// Compiles:
DatabaseConfigBuilder.create().setHost("localhost").setPort(5432).build();
// Won't compile:
// DatabaseConfigBuilder.create().setPort(5432);  // Error!
// DatabaseConfigBuilder.create().build();          // Error!
```

Benefits: compile-time safety, self-documenting via autocomplete, no runtime checks needed.

---

## When to Use

**Use Builder when:**
- Objects have many optional parameters (telescoping constructor smell)
- Construction involves multiple steps with varying order
- You need different representations of the same product
- You want immutable products built from mutable state
- Construction logic is complex enough to isolate (SRP)

**Don't use when:**
- Object is simple (few params) — just use a constructor
- Only one way to build — no need for the abstraction
- Builder mirrors product 1:1 with no extra logic — use an object literal

---

## Pros and Cons

| Pros | Cons |
|------|------|
| Step-by-step, deferred construction | More classes/interfaces |
| Reuse construction code across representations | Builder fields often mirror product |
| SRP — isolate construction from business logic | Mutable builder can be misused if shared |
| Readable fluent API | Overkill for simple objects |
| Centralized validation in `build()` | |

---

## Real-World Examples

### Query Builder

```typescript
class QueryBuilder {
  private table = ""; private conditions: string[] = [];
  private limitVal: number | null = null;

  from(t: string): this { this.table = t; return this; }
  where(c: string): this { this.conditions.push(c); return this; }
  limit(n: number): this { this.limitVal = n; return this; }

  build(): string {
    let q = `SELECT * FROM ${this.table}`;
    if (this.conditions.length) q += ` WHERE ${this.conditions.join(" AND ")}`;
    if (this.limitVal !== null) q += ` LIMIT ${this.limitVal}`;
    return q;
  }
}
```

### Config Object Builder

```typescript
class ServerConfigBuilder {
  private host = "localhost"; private port = 3000;
  private cors = false; private tls = false;

  setHost(h: string): this { this.host = h; return this; }
  setPort(p: number): this { this.port = p; return this; }
  enableCors(): this { this.cors = true; return this; }
  enableTls(): this { this.tls = true; return this; }

  build(): Readonly<{ host: string; port: number; cors: boolean; tls: boolean }> {
    return Object.freeze({ host: this.host, port: this.port,
      cors: this.cors, tls: this.tls });
  }
}
```

### HTML Builder

```typescript
class HtmlBuilder {
  private tag: string;
  private children: HtmlBuilder[] = [];
  private attrs: Record<string, string> = {};
  private text = "";

  constructor(tag: string) { this.tag = tag; }
  setAttribute(k: string, v: string): this { this.attrs[k] = v; return this; }
  setText(t: string): this { this.text = t; return this; }
  addChild(c: HtmlBuilder): this { this.children.push(c); return this; }

  build(indent = 0): string {
    const pad = "  ".repeat(indent);
    const a = Object.entries(this.attrs).map(([k,v]) => ` ${k}="${v}"`).join("");
    if (!this.text && !this.children.length) return `${pad}<${this.tag}${a} />`;
    let r = `${pad}<${this.tag}${a}>`;
    if (this.text) r += this.text;
    if (this.children.length) {
      r += "\n" + this.children.map(c => c.build(indent+1)).join("\n") + `\n${pad}`;
    }
    return r + `</${this.tag}>`;
  }
}
```

---

## Comparison with Related Patterns

| Pattern | Difference |
|---------|-----------|
| **Abstract Factory** | Creates families in one call; Builder constructs step by step |
| **Factory Method** | Single method; Builder uses multiple steps |
| **Prototype** | Clones existing; Builder constructs from scratch |

### Builder vs Object Literal

In TypeScript, you might wonder why not just use an object literal:

```typescript
// Object literal — fine for simple cases
const config = { host: "localhost", port: 3000, cors: true };

// Builder — better when:
// 1. Construction requires validation
// 2. Some fields are derived from others
// 3. The object should be immutable after creation
// 4. There are many optional fields with defaults
// 5. You need to reuse construction recipes (Director)
```

---

## Summary

The Builder pattern separates the **construction** of a complex object from its
**representation**. It provides a clear, readable API for constructing objects
with many optional parameters, eliminates telescoping constructors, and enables
building different representations using the same process. In TypeScript, the
fluent interface variant with method chaining is the most idiomatic approach,
and the Step Builder pattern adds compile-time safety for required fields.

---

## References

- [Refactoring Guru — Builder](https://refactoring.guru/design-patterns/builder)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF)
- *Effective Java* by Joshua Bloch (Item 2: Builder Pattern)
