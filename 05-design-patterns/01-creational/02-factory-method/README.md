# Factory Method Pattern

> **Also known as:** Virtual Constructor

## Table of Contents

- [Intent](#intent)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Structure](#structure)
- [Participants](#participants)
- [Implementation in TypeScript](#implementation-in-typescript)
- [Parameterized Factory Methods](#parameterized-factory-methods)
- [Factory Method vs Simple Factory vs Abstract Factory](#factory-method-vs-simple-factory-vs-abstract-factory)
- [When to Use](#when-to-use)
- [Pros and Cons](#pros-and-cons)
- [Real-World Examples](#real-world-examples)
- [Relations with Other Patterns](#relations-with-other-patterns)
- [References](#references)

---

## Intent

**Factory Method** is a creational design pattern that provides an interface for creating
objects in a superclass, but allows subclasses to alter the type of objects that will be
created.

Instead of calling `new` directly, you delegate object creation to a method that subclasses
can override. This decouples the client code from the concrete classes it instantiates.

---

## The Problem

Imagine you are building a logistics management application. The first version only handles
truck transportation, so most of your code is tightly coupled to the `Truck` class:

```typescript
class RoadLogistics {
  planDelivery(): void {
    const truck = new Truck(); // Direct instantiation - tightly coupled
    truck.deliver();
  }
}
```

Now sea transportation companies want in. Adding `Ship` means:

1. You must change `RoadLogistics` (or create conditionals everywhere).
2. Every new transport type (rail, air, drone) forces more changes.
3. The code fills up with `if/else` or `switch` blocks that select the right class.

This violates the **Open/Closed Principle**: the system is not open for extension without
modification.

---

## The Solution

Replace direct construction calls with calls to a **factory method** - an overridable method
whose sole job is to return a product object:

```typescript
abstract class Logistics {
  // Factory method
  abstract createTransport(): Transport;

  // Business logic that uses the factory method
  planDelivery(): void {
    const transport = this.createTransport();
    transport.deliver();
  }
}

class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  createTransport(): Transport {
    return new Ship();
  }
}
```

The client code works with `Logistics` and `Transport` abstractions. It never knows (or
cares) whether it is dealing with trucks or ships.

---

## Structure

```
┌─────────────────────────────┐
│         Creator             │
│─────────────────────────────│
│ + someOperation(): void     │
│ + createProduct(): Product  │  ◄── factory method
└──────────────┬──────────────┘
               │ extends
    ┌──────────┴──────────┐
    │                     │
┌───┴──────────────┐  ┌──┴───────────────┐
│ ConcreteCreatorA │  │ ConcreteCreatorB  │
│──────────────────│  │──────────────────-│
│ +createProduct() │  │ +createProduct()  │
│  return new       │  │  return new       │
│  ConcreteProductA │  │  ConcreteProductB │
└──────────────────┘  └──────────────────-┘

┌─────────────────────────────┐
│     <<interface>> Product   │
│─────────────────────────────│
│ + operation(): string       │
└──────────────┬──────────────┘
               │ implements
    ┌──────────┴──────────┐
    │                     │
┌───┴──────────────┐  ┌──┴───────────────┐
│ ConcreteProductA │  │ ConcreteProductB  │
└──────────────────┘  └──────────────────-┘
```

---

## Participants

### 1. Product (Interface)

Declares the interface common to all objects the factory method creates.

```typescript
interface Transport {
  deliver(): string;
}
```

### 2. Concrete Product

Implements the `Product` interface. Each variant provides its own behavior.

```typescript
class Truck implements Transport {
  deliver(): string {
    return "Delivering by land in a truck";
  }
}

class Ship implements Transport {
  deliver(): string {
    return "Delivering by sea in a ship";
  }
}
```

### 3. Creator (Abstract Class)

Declares the factory method (often `abstract`). May also contain core business logic that
calls the factory method. The creator's primary responsibility is **not** creating products -
it contains domain logic that *relies on* products.

```typescript
abstract class Logistics {
  abstract createTransport(): Transport;

  planDelivery(): void {
    const t = this.createTransport();
    console.log(t.deliver());
  }
}
```

### 4. Concrete Creator

Overrides the factory method to return a specific concrete product.

```typescript
class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();
  }
}
```

---

## Implementation in TypeScript

### Full Example: Cross-Platform UI Dialogs

```typescript
// ── Product interface ──────────────────────────────────────
interface Button {
  render(): string;
  onClick(callback: () => void): void;
}

// ── Concrete products ──────────────────────────────────────
class WindowsButton implements Button {
  render(): string {
    return "<WindowsButton />";
  }
  onClick(callback: () => void): void {
    console.log("Windows click bound");
    callback();
  }
}

class HTMLButton implements Button {
  render(): string {
    return "<button class='html'>OK</button>";
  }
  onClick(callback: () => void): void {
    console.log("HTML click bound");
    callback();
  }
}

// ── Creator ────────────────────────────────────────────────
abstract class Dialog {
  abstract createButton(): Button;

  render(): void {
    const button = this.createButton();
    console.log(button.render());
    button.onClick(() => console.log("Dialog closed"));
  }
}

// ── Concrete creators ──────────────────────────────────────
class WindowsDialog extends Dialog {
  createButton(): Button {
    return new WindowsButton();
  }
}

class WebDialog extends Dialog {
  createButton(): Button {
    return new HTMLButton();
  }
}

// ── Client code ────────────────────────────────────────────
function clientCode(dialog: Dialog): void {
  dialog.render();
}

clientCode(new WindowsDialog());
clientCode(new WebDialog());
```

### Key Implementation Notes

1. **Return type**: The factory method's return type must be the **product interface**, not a
   concrete class. This ensures the creator's business logic stays decoupled.

2. **Abstract vs default**: You can make the factory method `abstract` (forcing subclasses to
   implement it) or provide a default implementation that returns a base product.

3. **Creator is not just a factory**: The creator usually contains business logic that *uses*
   products. The factory method is a hook that lets subclasses customize the product.

---

## Parameterized Factory Methods

Sometimes you need a single creator to produce different product types based on a parameter,
rather than creating a subclass for each product.

```typescript
interface Notification {
  send(message: string): string;
}

class EmailNotification implements Notification {
  send(message: string): string {
    return `Email: ${message}`;
  }
}

class SMSNotification implements Notification {
  send(message: string): string {
    return `SMS: ${message}`;
  }
}

class PushNotification implements Notification {
  send(message: string): string {
    return `Push: ${message}`;
  }
}

type NotificationType = "email" | "sms" | "push";

class NotificationFactory {
  createNotification(type: NotificationType): Notification {
    switch (type) {
      case "email": return new EmailNotification();
      case "sms":   return new SMSNotification();
      case "push":  return new PushNotification();
    }
  }
}
```

**Trade-off**: This is simpler (no subclass per type) but violates OCP - adding a new
notification type requires modifying the `switch`. This is sometimes called a
**Simple Factory** or **Parameterized Factory** and is technically not the GoF Factory Method
pattern, but it is extremely common in practice.

You can combine both approaches: use a parameterized factory method in the base creator and
let subclasses override it to extend or change the mapping.

---

## Factory Method vs Simple Factory vs Abstract Factory

| Aspect | Simple Factory | Factory Method | Abstract Factory |
|---|---|---|---|
| **What it is** | A plain function/class with a `switch`/`if` | An abstract method overridden by subclasses | An interface for creating *families* of products |
| **Uses inheritance?** | No | Yes (subclass overrides factory method) | Yes (concrete factory implements interface) |
| **Number of products** | One product hierarchy | One product hierarchy | Multiple related product hierarchies |
| **OCP compliance** | Violates OCP (must modify switch) | Follows OCP (add new subclass) | Follows OCP (add new factory) |
| **Complexity** | Low | Medium | High |
| **When to use** | Few product types, unlikely to change | Product type determined by subclass context | Need to create families of related objects |

### Simple Factory (not a GoF pattern)

```typescript
function createButton(os: string): Button {
  if (os === "windows") return new WindowsButton();
  if (os === "web") return new HTMLButton();
  throw new Error(`Unknown OS: ${os}`);
}
```

### Factory Method (GoF pattern)

```typescript
abstract class Dialog {
  abstract createButton(): Button; // subclass decides
  render(): void { /* uses createButton() */ }
}
```

### Abstract Factory (GoF pattern)

```typescript
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;  // multiple product types
}
```

---

## When to Use

1. **You don't know the exact types ahead of time.** The factory method separates
   construction from usage, so the product type can be decided at runtime by choosing the
   right creator subclass.

2. **You want to let users extend your library/framework.** Expose a creator with a factory
   method. Users subclass it and override the factory method to plug in their own products.

3. **You want to reuse existing objects** (object pool, cache). A factory method can return
   existing instances instead of always creating new ones - something a constructor cannot do.

4. **You have a class with multiple constructors** doing similar but slightly different
   initialization. Replace them with a single class that has several factory methods with
   descriptive names.

5. **You follow the Template Method pattern** and one of the steps is "create an object."
   The Factory Method is a natural fit for that step.

---

## Pros and Cons

### Pros

- **Loose coupling**: Creator code depends on the product interface, not concrete classes.
- **Single Responsibility Principle**: Product creation logic is isolated in one place.
- **Open/Closed Principle**: New product types can be introduced without modifying existing
  creator code - just add a new subclass.
- **Testability**: You can substitute mock products by providing a test creator subclass.
- **Encapsulation of construction logic**: Complex creation steps are hidden behind a clean
  interface.

### Cons

- **More classes**: Each new product type typically requires a new concrete creator subclass,
  which can increase the number of classes significantly.
- **Indirection**: Code is harder to follow because object creation is deferred to
  subclasses. You must look at the concrete creator to know which product is instantiated.
- **Overkill for simple cases**: If you only have one or two product types that will never
  change, a simple `new` call or a simple factory function is sufficient.

---

## Real-World Examples

### 1. UI Element Factories

Cross-platform frameworks (React Native, Flutter, Electron) use factory methods to create
platform-specific UI components:

```typescript
interface UIElement {
  render(): string;
}

class IOSButton implements UIElement {
  render(): string { return "[ iOS Button ]"; }
}
class AndroidButton implements UIElement {
  render(): string { return "[ Android Button ]"; }
}

abstract class UIFramework {
  abstract createButton(): UIElement;

  renderPage(): string {
    const btn = this.createButton();
    return `Page: ${btn.render()}`;
  }
}

class IOSFramework extends UIFramework {
  createButton(): UIElement { return new IOSButton(); }
}
class AndroidFramework extends UIFramework {
  createButton(): UIElement { return new AndroidButton(); }
}
```

### 2. Logger Factories

Applications that need different logging backends (console, file, remote service):

```typescript
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void { console.log(`[CONSOLE] ${message}`); }
}
class FileLogger implements Logger {
  log(message: string): void { console.log(`[FILE] ${message}`); }
}

abstract class Application {
  abstract createLogger(): Logger;

  run(): void {
    const logger = this.createLogger();
    logger.log("Application started");
  }
}

class DevelopmentApp extends Application {
  createLogger(): Logger { return new ConsoleLogger(); }
}
class ProductionApp extends Application {
  createLogger(): Logger { return new FileLogger(); }
}
```

### 3. Transport / Logistics

The classic example from refactoring.guru - different transport mechanisms share a common
interface:

```typescript
interface Transport {
  deliver(cargo: string): string;
  estimateCost(distance: number): number;
}

class Truck implements Transport {
  deliver(cargo: string): string {
    return `Truck delivering ${cargo} by road`;
  }
  estimateCost(distance: number): number {
    return distance * 1.5;
  }
}

class Ship implements Transport {
  deliver(cargo: string): string {
    return `Ship delivering ${cargo} by sea`;
  }
  estimateCost(distance: number): number {
    return distance * 0.8;
  }
}

abstract class LogisticsCompany {
  abstract createTransport(): Transport;

  planRoute(cargo: string, distance: number): string {
    const transport = this.createTransport();
    const delivery = transport.deliver(cargo);
    const cost = transport.estimateCost(distance);
    return `${delivery} | Estimated cost: $${cost}`;
  }
}

class RoadLogistics extends LogisticsCompany {
  createTransport(): Transport { return new Truck(); }
}

class SeaLogistics extends LogisticsCompany {
  createTransport(): Transport { return new Ship(); }
}
```

---

## Relations with Other Patterns

- **Abstract Factory** classes are often based on a set of Factory Methods.
- **Factory Method** is a specialization of **Template Method**. The factory method can serve
  as a step in a larger template method.
- Many designs start with **Factory Method** (simpler, subclass-based) and evolve toward
  **Abstract Factory**, **Prototype**, or **Builder** as complexity grows.
- **Prototype** does not rely on inheritance (unlike Factory Method), but requires a complex
  cloning mechanism.
- Factory Method can be combined with **Iterator** to let collection subclasses return
  different types of iterators.

---

## References

- [Refactoring Guru - Factory Method](https://refactoring.guru/design-patterns/factory-method)
- Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of Reusable Object-Oriented
  Software* (GoF). Addison-Wesley, 1994. pp. 107-116.
- [Refactoring Guru - Factory Comparison](https://refactoring.guru/design-patterns/factory-comparison)
