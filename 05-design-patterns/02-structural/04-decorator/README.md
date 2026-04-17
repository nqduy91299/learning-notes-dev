# Decorator Pattern (Structural)

> **Also known as:** Wrapper

## Intent

The Decorator pattern lets you attach new behaviors to objects by placing them
inside special wrapper objects that contain those behaviors. It provides a
flexible alternative to subclassing for extending functionality.

```
Component interface
       │
       ├── ConcreteComponent (base behavior)
       │
       └── BaseDecorator (wraps a Component)
               │
               ├── ConcreteDecoratorA (adds behavior A)
               └── ConcreteDecoratorB (adds behavior B)
```

The key insight: both the component and decorators share the same interface,
so the client never knows whether it's working with the "real" object or a
decorated one.

---

## The Problem: Extending Behavior Without Subclassing

Imagine you have a `Notifier` class that sends email notifications. Now users
want SMS, Slack, and Facebook notifications too. The naive approach:

```
Notifier
├── SMSNotifier
├── SlackNotifier
├── FacebookNotifier
├── SMS_Slack_Notifier
├── SMS_Facebook_Notifier
├── Slack_Facebook_Notifier
└── SMS_Slack_Facebook_Notifier   // combinatorial explosion!
```

With **n** notification channels, you need **2^n** subclasses to cover every
combination. This is the **combinatorial explosion** problem.

### Why inheritance falls short

1. **Static** — you can't change behavior at runtime
2. **Single parent** — most languages don't support multiple inheritance
3. **Tight coupling** — subclasses depend on parent implementation details
4. **Explosion** — every combination of features needs its own subclass

---

## Structure

### Participants

| Role                  | Description                                                   |
|-----------------------|---------------------------------------------------------------|
| **Component**         | Interface declaring operations available to both real objects and decorators |
| **ConcreteComponent** | Class defining the base behavior that decorators can alter     |
| **BaseDecorator**     | Abstract class with a reference to a wrapped Component; delegates all work to it |
| **ConcreteDecorator** | Adds extra behavior before or after delegating to the wrapped object |

### Class Diagram

```
┌─────────────────────┐
│    <<interface>>     │
│      Component       │
│─────────────────────│
│ + operation(): string│
└─────────┬───────────┘
          │ implements
    ┌─────┴──────────────────────────┐
    │                                │
┌───┴──────────────┐   ┌────────────┴────────────┐
│ ConcreteComponent │   │     BaseDecorator        │
│──────────────────│   │─────────────────────────│
│ + operation()    │   │ - wrappee: Component     │
└──────────────────┘   │ + operation()            │
                       └────────────┬─────────────┘
                            extends │
                    ┌───────────────┼───────────────┐
                    │                               │
          ┌─────────┴──────┐            ┌───────────┴────────┐
          │ DecoratorA     │            │ DecoratorB         │
          │────────────────│            │────────────────────│
          │ + operation()  │            │ + operation()      │
          └────────────────┘            └────────────────────┘
```

---

## The Wrapper Concept

A decorator "wraps" a component. It holds a reference to the wrapped object,
implements the same interface, and delegates work to it — optionally adding
behavior before or after:

```typescript
class LoggingDecorator extends BaseDecorator {
  operation(): string {
    console.log("Before");          // added behavior
    const result = super.operation(); // delegate to wrapped
    console.log("After");           // added behavior
    return result;
  }
}
```

The client only sees the `Component` interface. It doesn't know (or care)
how many layers of wrapping exist.

---

## Stacking Decorators

The real power comes from stacking multiple decorators:

```typescript
let component: Component = new ConcreteComponent();
component = new DecoratorA(component);  // wrap with A
component = new DecoratorB(component);  // wrap with B
component = new DecoratorC(component);  // wrap with C

// Execution order: C → B → A → ConcreteComponent → A → B → C
component.operation();
```

Each decorator adds its layer. The order matters — decorators applied last
execute first (outermost to innermost), like layers of an onion.

```
┌─────────────────────────────┐
│ DecoratorC                  │
│  ┌───────────────────────┐  │
│  │ DecoratorB            │  │
│  │  ┌─────────────────┐  │  │
│  │  │ DecoratorA       │  │  │
│  │  │  ┌─────────────┐ │  │  │
│  │  │  │ Component   │ │  │  │
│  │  │  └─────────────┘ │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## Implementation in TypeScript

### Step 1: Component Interface

```typescript
interface DataSource {
  writeData(data: string): void;
  readData(): string;
}
```

### Step 2: Concrete Component

```typescript
class FileDataSource implements DataSource {
  private data: string = "";

  constructor(private filename: string) {}

  writeData(data: string): void {
    this.data = data;
    console.log(`[File] Writing to ${this.filename}: ${data}`);
  }

  readData(): string {
    console.log(`[File] Reading from ${this.filename}`);
    return this.data;
  }
}
```

### Step 3: Base Decorator

```typescript
class DataSourceDecorator implements DataSource {
  constructor(protected wrappee: DataSource) {}

  writeData(data: string): void {
    this.wrappee.writeData(data);
  }

  readData(): string {
    return this.wrappee.readData();
  }
}
```

### Step 4: Concrete Decorators

```typescript
class EncryptionDecorator extends DataSourceDecorator {
  writeData(data: string): void {
    const encrypted = btoa(data); // simple base64
    console.log(`[Encrypt] Encrypting data`);
    super.writeData(encrypted);
  }

  readData(): string {
    const data = super.readData();
    console.log(`[Encrypt] Decrypting data`);
    return atob(data);
  }
}

class CompressionDecorator extends DataSourceDecorator {
  writeData(data: string): void {
    const compressed = `compressed(${data})`;
    console.log(`[Compress] Compressing data`);
    super.writeData(compressed);
  }

  readData(): string {
    const data = super.readData();
    console.log(`[Compress] Decompressing data`);
    return data.replace(/^compressed\(/, "").replace(/\)$/, "");
  }
}
```

### Step 5: Client Code

```typescript
// Simple usage
let source: DataSource = new FileDataSource("salary.dat");
source.writeData("salary=42000");

// With encryption
source = new EncryptionDecorator(new FileDataSource("salary.dat"));
source.writeData("salary=42000");

// With encryption AND compression (stacked)
source = new CompressionDecorator(
  new EncryptionDecorator(
    new FileDataSource("salary.dat")
  )
);
source.writeData("salary=42000");
console.log(source.readData()); // "salary=42000"
```

---

## Decorator vs. Inheritance

| Aspect          | Decorator                           | Inheritance                      |
|-----------------|-------------------------------------|----------------------------------|
| Binding time    | Runtime                             | Compile time                     |
| Combination     | Stack freely                        | Combinatorial explosion          |
| Interface       | Must match component interface      | Can extend parent interface      |
| Transparency    | Client unaware of decoration        | Client must know concrete class  |
| Flexibility     | Add/remove behaviors dynamically    | Fixed hierarchy                  |
| Complexity      | Many small objects                  | Fewer, larger classes            |
| Debugging       | Harder (deep wrapper chains)        | Easier (single class)            |

**Rule of thumb:** Use inheritance when the relationship is truly "is-a" and
the behavior set is fixed. Use Decorator when you need to compose behaviors
dynamically.

---

## Decorator Pattern vs. TypeScript Language Decorators

TypeScript has a `@decorator` syntax (stage 3 proposal / experimental). These
are **related in spirit but different in mechanism**:

| Aspect          | Design Pattern Decorator            | TS `@decorator` Syntax           |
|-----------------|-------------------------------------|----------------------------------|
| What it wraps   | Object instances                    | Classes, methods, properties     |
| When applied    | Runtime (object creation)           | Class definition time            |
| Interface       | Must implement same interface       | Metadata/descriptor manipulation |
| Stacking        | Wrap objects in layers              | Apply decorators top-to-bottom   |
| Use case        | Add behavior to individual objects  | Cross-cutting concerns (logging, validation) |

The TS decorator syntax is closer to the **Aspect-Oriented Programming**
paradigm. The design pattern is about object composition.

```typescript
// TS language decorator (class decoration time)
function Log(target: Function) {
  console.log(`Class ${target.name} defined`);
}

@Log
class MyService { }

// Design pattern decorator (runtime object wrapping)
const service: Service = new LoggingDecorator(new MyService());
```

---

## When to Use

- **Runtime behavior extension** — add responsibilities dynamically
- **Avoid subclass explosion** — when combinations of features grow exponentially
- **Single Responsibility** — separate cross-cutting concerns into small decorators
- **Open/Closed Principle** — extend behavior without modifying existing code
- **Final/sealed classes** — wrap classes you can't subclass
- **Optional features** — layer features based on configuration

---

## Pros and Cons

### Pros

- Extend behavior without subclassing
- Add/remove responsibilities at runtime
- Combine behaviors by stacking multiple decorators
- Single Responsibility Principle — each decorator handles one concern
- Open/Closed Principle — new decorators don't change existing code

### Cons

- Hard to remove a specific decorator from the middle of a stack
- Behavior can depend on decorator ordering (fragile)
- Initial configuration code can be verbose
- Many small objects can be harder to debug
- Type identity is obscured (`instanceof` checks may not work as expected)

---

## Real-World Examples

### 1. Data Streams with Encryption/Compression

The classic example from the GoF book. A `DataSource` interface with
`FileDataSource` as the concrete component. `EncryptionDecorator` and
`CompressionDecorator` wrap it to add transparent encryption and compression:

```typescript
const source: DataSource = new CompressionDecorator(
  new EncryptionDecorator(
    new FileDataSource("secrets.dat")
  )
);
// Data is encrypted then compressed on write
// Decompressed then decrypted on read
```

### 2. Notification Decorators

Stack notification channels without subclass explosion:

```typescript
interface Notifier {
  send(message: string): void;
}

class EmailNotifier implements Notifier {
  send(message: string): void { /* send email */ }
}

class SMSDecorator extends NotifierDecorator {
  send(message: string): void {
    super.send(message);  // forward to wrapped notifier
    // also send SMS
  }
}

let notifier: Notifier = new EmailNotifier();
notifier = new SMSDecorator(notifier);
notifier = new SlackDecorator(notifier);
// Sends via email + SMS + Slack
```

### 3. Middleware Chains (Express/Koa Style)

HTTP middleware is essentially the Decorator pattern. Each middleware wraps
the handler, adding behavior (auth, logging, CORS) before/after:

```typescript
interface Handler {
  handle(request: Request): Response;
}

class AuthMiddleware extends HandlerDecorator {
  handle(request: Request): Response {
    if (!request.isAuthenticated) throw new Error("Unauthorized");
    return super.handle(request);
  }
}

class LoggingMiddleware extends HandlerDecorator {
  handle(request: Request): Response {
    console.log(`${request.method} ${request.url}`);
    const response = super.handle(request);
    console.log(`Response: ${response.status}`);
    return response;
  }
}
```

### 4. Logging Wrappers

Wrap any service to add transparent logging:

```typescript
interface Repository {
  find(id: string): Entity | null;
  save(entity: Entity): void;
}

class LoggingRepository extends RepositoryDecorator {
  find(id: string): Entity | null {
    console.log(`Finding entity ${id}`);
    const result = super.find(id);
    console.log(`Found: ${result !== null}`);
    return result;
  }

  save(entity: Entity): void {
    console.log(`Saving entity ${entity.id}`);
    super.save(entity);
    console.log(`Saved successfully`);
  }
}
```

---

## Related Patterns

| Pattern              | Relationship                                                    |
|----------------------|-----------------------------------------------------------------|
| **Adapter**          | Changes interface; Decorator preserves it                       |
| **Proxy**            | Same interface but controls access; Decorator adds behavior     |
| **Composite**        | Similar structure but Composite sums children, Decorator adds to one child |
| **Chain of Responsibility** | Similar recursive structure, but CoR can stop the chain |
| **Strategy**         | Changes the guts; Decorator changes the skin                    |

---

## Key Takeaways

1. Decorator wraps objects sharing the same interface
2. Decorators can be stacked in any combination
3. Order of stacking matters — outermost executes first
4. Prefer Decorator over inheritance when behaviors are combinatorial
5. Each decorator should handle exactly one responsibility
6. The client should depend only on the Component interface, never on concrete decorators

---

## References

- [Refactoring.Guru — Decorator](https://refactoring.guru/design-patterns/decorator)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 4
- *Head First Design Patterns*, Chapter 3
