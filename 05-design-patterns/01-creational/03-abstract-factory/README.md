# Abstract Factory Pattern

## Table of Contents
- [Intent](#intent)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Structure](#structure)
- [Participants](#participants)
- [Implementation in TypeScript](#implementation-in-typescript)
- [Abstract Factory vs Factory Method](#abstract-factory-vs-factory-method)
- [When to Use](#when-to-use)
- [Pros and Cons](#pros-and-cons)
- [Real-World Examples](#real-world-examples)
- [References](#references)

---

## Intent

**Abstract Factory** is a creational design pattern that lets you produce
**families of related objects** without specifying their concrete classes.

The key word is *families*. When multiple objects must work together and
you need consistency across the family, Abstract Factory is the answer.

---

## The Problem

You're building a cross-platform UI toolkit with `Button`, `Checkbox`,
and `TextField`, each having platform variants: Windows, macOS, Linux.

The naive approach scatters `if/else` everywhere:

```typescript
function createButton(os: string) {
  if (os === "windows") return new WindowsButton();
  if (os === "macos") return new MacButton();
  throw new Error("Unknown OS");
}
```

Problems:
1. **Inconsistency** - Nothing prevents mixing a `WindowsButton` with a `MacCheckbox`
2. **Violates Open/Closed** - Adding Android means modifying every factory function
3. **Scattered logic** - Platform selection is duplicated everywhere
4. **Tight coupling** - Client code references concrete classes directly

---

## The Solution

1. **Declare interfaces** for each product (`Button`, `Checkbox`)
2. **Declare a factory interface** (`GUIFactory`) with methods for each product
3. **Implement concrete factories** per variant (`WindowsFactory`, `MacFactory`)
4. **Client code** works only through abstract interfaces

Swapping the entire family means swapping one factory instance.

---

## Structure

```
┌─────────────────────────┐
│    AbstractFactory       │
│ + createProductA()      │
│ + createProductB()      │
└────────┬────────────────┘
    ┌────┴─────────┐
┌───▼───────┐  ┌──▼────────┐
│ Concrete  │  │ Concrete  │
│ Factory1  │  │ Factory2  │
└───┬───┬───┘  └───┬───┬───┘
    │   │          │   │
    ▼   ▼          ▼   ▼
 ProductA1  ProductB1  ProductA2  ProductB2
```

---

## Participants

### AbstractFactory
Declares creation methods for each abstract product:
```typescript
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}
```

### ConcreteFactory
Implements creation methods for a specific variant:
```typescript
class WindowsFactory implements GUIFactory {
  createButton(): Button { return new WindowsButton(); }
  createCheckbox(): Checkbox { return new WindowsCheckbox(); }
}
```

### AbstractProduct
Interface for a product type:
```typescript
interface Button {
  render(): string;
  onClick(handler: () => void): void;
}
```

### ConcreteProduct
Variant-specific implementation:
```typescript
class WindowsButton implements Button {
  render(): string { return "<win-button />"; }
  onClick(handler: () => void): void { handler(); }
}
```

### Client
Uses only abstract interfaces. Never knows concrete types:
```typescript
function renderUI(factory: GUIFactory): void {
  const btn = factory.createButton();
  console.log(btn.render());
}
```

---

## Implementation in TypeScript

Complete example - UI theme system (Light/Dark):

```typescript
// ─── Abstract Products ─────────────────────────
interface Button {
  render(): string;
  getStyle(): Record<string, string>;
}

interface Card {
  render(): string;
  setContent(content: string): void;
}

// ─── Abstract Factory ──────────────────────────
interface ThemeFactory {
  createButton(): Button;
  createCard(): Card;
}

// ─── Light Concrete Products ───────────────────
class LightButton implements Button {
  render(): string { return '<button class="light-btn">Click</button>'; }
  getStyle() { return { background: "#fff", color: "#333" }; }
}

class LightCard implements Card {
  private content = "";
  render(): string { return `<div class="light-card">${this.content}</div>`; }
  setContent(c: string): void { this.content = c; }
}

// ─── Dark Concrete Products ────────────────────
class DarkButton implements Button {
  render(): string { return '<button class="dark-btn">Click</button>'; }
  getStyle() { return { background: "#1a1a1a", color: "#f0f0f0" }; }
}

class DarkCard implements Card {
  private content = "";
  render(): string { return `<div class="dark-card">${this.content}</div>`; }
  setContent(c: string): void { this.content = c; }
}

// ─── Concrete Factories ────────────────────────
class LightThemeFactory implements ThemeFactory {
  createButton(): Button { return new LightButton(); }
  createCard(): Card { return new LightCard(); }
}

class DarkThemeFactory implements ThemeFactory {
  createButton(): Button { return new DarkButton(); }
  createCard(): Card { return new DarkCard(); }
}

// ─── Client ────────────────────────────────────
function buildPage(factory: ThemeFactory): void {
  const button = factory.createButton();
  const card = factory.createCard();
  card.setContent("Welcome!");
  console.log(card.render());
  console.log(button.render());
}

// Switch theme by swapping factory:
const factory: ThemeFactory = new DarkThemeFactory();
buildPage(factory);
```

### Key Notes
1. **Use interfaces** - Zero runtime overhead in TypeScript
2. **Select factory once** at initialization, inject everywhere
3. **Return abstract types** from factory methods, never concrete
4. **Structural typing** ensures compile-time safety

---

## Abstract Factory vs Factory Method

| Aspect | Factory Method | Abstract Factory |
|---|---|---|
| **Scope** | Single product | Families of products |
| **Mechanism** | Inheritance (subclass overrides) | Composition (object with multiple methods) |
| **Consistency** | No cross-product guarantee | Guarantees same-family products |
| **Complexity** | Simpler | More interfaces/classes |
| **New variant** | New subclass | New factory class |
| **New product type** | Add one method | Must update ALL factories |

Many systems start with Factory Method and evolve to Abstract Factory
as more product types need cross-product consistency.

---

## When to Use

1. **Families of related products** must be used together
2. **Library of products** where you expose interfaces, not implementations
3. **Enforce consistency** across related objects
4. **Swap entire families** at runtime via configuration
5. **Multiple Factory Methods** are blurring a class's responsibility

---

## Pros and Cons

### Pros
- **Compatibility guarantee** - Products from one factory work together
- **Loose coupling** - Client depends on interfaces only
- **SRP** - Creation logic centralized in factory classes
- **OCP** - New families added without changing existing code

### Cons
- **Complexity** - Many interfaces and classes for simple cases
- **Hard to add product types** - New product requires updating ALL factories
- **Parallel hierarchies** - N products × M variants = many classes
- **Overkill** for single product or single variant

---

## Real-World Examples

### 1. UI Themes (Light/Dark/High-Contrast)
```typescript
interface ThemeFactory {
  createButton(): Button;
  createInput(): Input;
  createModal(): Modal;
}
// LightThemeFactory, DarkThemeFactory, HighContrastFactory
```
All components must share the same visual style.

### 2. Cross-Platform Widgets
```typescript
interface WidgetFactory {
  createWindow(): Window;
  createScrollbar(): Scrollbar;
  createMenu(): Menu;
}
// WindowsWidgetFactory, MacWidgetFactory, LinuxWidgetFactory
```
macOS scrollbar must pair with macOS window.

### 3. Database Providers
```typescript
interface DatabaseFactory {
  createConnection(): Connection;
  createCommand(): Command;
  createReader(): DataReader;
}
// PostgresFactory, MySQLFactory, SQLiteFactory
```
PostgreSQL connection cannot be used with MySQL commands.

### 4. Document Export
```typescript
interface DocumentFactory {
  createHeader(): HeaderElement;
  createParagraph(): ParagraphElement;
}
// PDFFactory, HTMLFactory, MarkdownFactory
```

### 5. Payment Processing
```typescript
interface PaymentFactory {
  createProcessor(): PaymentProcessor;
  createValidator(): PaymentValidator;
}
// StripeFactory, PayPalFactory, SquareFactory
```

### 6. Game Terrain
```typescript
interface TerrainFactory {
  createGround(): Ground;
  createWall(): Wall;
}
// DesertFactory, ForestFactory, ArcticFactory
```

---

## How to Implement (Step by Step)

1. **Map out a matrix** of product types (rows) vs variants (columns).
   For example: Button × {Windows, Mac, Linux}.

2. **Declare abstract product interfaces** for every product type.
   Each interface should define all operations the client needs.

3. **Declare the abstract factory interface** with a creation method for
   each abstract product. Return types must be the abstract interfaces.

4. **Implement concrete factory classes** - one per variant. Each factory
   implements all creation methods, returning variant-specific products.

5. **Create factory initialization code** in the application bootstrap.
   Select the concrete factory based on configuration, environment
   variable, or user preference.

6. **Replace all direct constructor calls** with calls to the factory.
   The client should never reference concrete product classes.

### Common Pitfalls

- **Forgetting to update all factories** when adding a new product type.
  This is the main trade-off of the pattern.
- **Over-abstracting** - If you only have one product type, use Factory
  Method instead.
- **Leaking concrete types** - If client code casts to concrete types,
  you lose the benefit of the abstraction.

---

## Relations with Other Patterns

- **Factory Method** - Abstract Factory methods are often implemented as
  Factory Methods internally. The two patterns complement each other.
- **Builder** - Builder constructs complex objects step by step; Abstract
  Factory creates families in one shot. Different problems.
- **Prototype** - Factory methods can use Prototype (cloning) instead of
  `new` to create products.
- **Singleton** - Concrete factories are often Singletons since you
  typically need only one instance per variant.
- **Bridge** - Abstract Factory can create the platform-specific
  implementations that Bridge abstractions depend on.

---

## References

- [Refactoring Guru - Abstract Factory](https://refactoring.guru/design-patterns/abstract-factory)
- *Design Patterns: Elements of Reusable OO Software* (GoF), pp. 87-95
- *Head First Design Patterns*, Chapter 4

---
**Config:** ES2022, strict, ESNext modules. Run with `npx tsx`.
