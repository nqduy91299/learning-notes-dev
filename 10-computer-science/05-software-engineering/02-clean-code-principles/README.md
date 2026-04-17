# Clean Code Principles

## Table of Contents

- [SOLID Principles](#solid-principles)
  - [Single Responsibility Principle](#single-responsibility-principle-srp)
  - [Open/Closed Principle](#openclosed-principle-ocp)
  - [Liskov Substitution Principle](#liskov-substitution-principle-lsp)
  - [Interface Segregation Principle](#interface-segregation-principle-isp)
  - [Dependency Inversion Principle](#dependency-inversion-principle-dip)
- [DRY — Don't Repeat Yourself](#dry--dont-repeat-yourself)
- [KISS — Keep It Simple](#kiss--keep-it-simple)
- [YAGNI — You Ain't Gonna Need It](#yagni--you-aint-gonna-need-it)
- [Meaningful Naming](#meaningful-naming)
- [Function Design](#function-design)
- [Comments](#comments)
- [Code Smells](#code-smells)
- [Composition Over Inheritance](#composition-over-inheritance)
- [Law of Demeter](#law-of-demeter)
- [Guard Clauses](#guard-clauses)
- [Magic Numbers](#magic-numbers)

---

## SOLID Principles

SOLID is an acronym for five design principles that make software more maintainable,
flexible, and understandable. Originally coined by Robert C. Martin, these principles
apply to any object-oriented or module-based codebase — including TypeScript frontend
projects.

---

### Single Responsibility Principle (SRP)

> A module should have one, and only one, reason to change.

Every class, function, or module should do **one thing**. If a component fetches data,
formats it, validates it, and renders it — that's four responsibilities.

#### BAD: Multiple responsibilities

```typescript
class UserProfile {
  async fetchUser(id: string): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }

  formatName(user: User): string {
    return `${user.first} ${user.last}`;
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  render(user: User): string {
    return `<div>${this.formatName(user)}</div>`;
  }
}
```

#### GOOD: Single responsibility each

```typescript
// Data fetching
class UserApi {
  async fetchUser(id: string): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
}

// Formatting
function formatUserName(user: User): string {
  return `${user.first} ${user.last}`;
}

// Validation
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

#### Frontend Example

In React, SRP means separating **data fetching**, **business logic**, and **rendering**:

- Custom hooks for data fetching (`useUser`)
- Utility functions for transformations
- Components for rendering only

---

### Open/Closed Principle (OCP)

> Software entities should be open for extension, but closed for modification.

You should be able to add new behavior **without changing existing code**. This is
achieved through abstractions — interfaces, callbacks, or higher-order functions.

#### BAD: Adding a new type requires modifying existing code

```typescript
function calculateDiscount(type: string, price: number): number {
  if (type === "regular") return price * 0.1;
  if (type === "premium") return price * 0.2;
  if (type === "vip") return price * 0.3; // Have to modify every time!
  return 0;
}
```

#### GOOD: New discount types extend without modifying

```typescript
interface DiscountStrategy {
  calculate(price: number): number;
}

const discountStrategies: Record<string, DiscountStrategy> = {
  regular: { calculate: (price) => price * 0.1 },
  premium: { calculate: (price) => price * 0.2 },
};

function calculateDiscount(type: string, price: number): number {
  const strategy = discountStrategies[type];
  return strategy ? strategy.calculate(price) : 0;
}

// Adding a new type — no modification of existing code:
discountStrategies.vip = { calculate: (price) => price * 0.3 };
```

---

### Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types.

If your code expects a `Shape`, it should work correctly with any subclass of `Shape`
— `Circle`, `Rectangle`, `Triangle` — without knowing which one it is.

#### Classic Violation: Square extends Rectangle

```typescript
class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(w: number): void { this.width = w; }
  setHeight(h: number): void { this.height = h; }
  getArea(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number): void {
    this.width = w;
    this.height = w; // Breaks LSP — unexpected side effect
  }
  setHeight(h: number): void {
    this.width = h;
    this.height = h;
  }
}

// Caller expects Rectangle behavior:
function doubleWidth(rect: Rectangle): void {
  const originalHeight = rect.getArea() / 10; // assumes width=10
  rect.setWidth(20);
  // With Square, height also changed — BROKEN
}
```

#### Frontend Example

If you have a `BaseInput` component and an `AutocompleteInput` that extends it, the
autocomplete version should work anywhere `BaseInput` is used — same props interface,
same behavior contract.

---

### Interface Segregation Principle (ISP)

> No client should be forced to depend on methods it does not use.

Prefer small, focused interfaces over large, general-purpose ones.

#### BAD: Fat interface

```typescript
interface Repository {
  findById(id: string): Promise<Entity>;
  findAll(): Promise<Entity[]>;
  create(entity: Entity): Promise<void>;
  update(entity: Entity): Promise<void>;
  delete(id: string): Promise<void>;
  generateReport(): Promise<string>;
  sendNotification(message: string): Promise<void>;
}
```

#### GOOD: Segregated interfaces

```typescript
interface ReadRepository {
  findById(id: string): Promise<Entity>;
  findAll(): Promise<Entity[]>;
}

interface WriteRepository {
  create(entity: Entity): Promise<void>;
  update(entity: Entity): Promise<void>;
  delete(id: string): Promise<void>;
}

interface ReportGenerator {
  generateReport(): Promise<string>;
}
```

#### Frontend Example

Instead of one massive `AppContext` with 20 values, split into focused contexts:
`AuthContext`, `ThemeContext`, `CartContext`. Components only subscribe to what they use.

---

### Dependency Inversion Principle (DIP)

> High-level modules should not depend on low-level modules. Both should depend on
> abstractions.

Don't hardcode concrete implementations. Inject dependencies through constructors,
function parameters, or React context.

#### BAD: Direct dependency on implementation

```typescript
class OrderService {
  private db = new PostgresDatabase(); // Hardcoded!

  async createOrder(order: Order): Promise<void> {
    await this.db.insert("orders", order);
  }
}
```

#### GOOD: Depend on abstraction

```typescript
interface Database {
  insert(table: string, data: unknown): Promise<void>;
}

class OrderService {
  constructor(private db: Database) {} // Injected!

  async createOrder(order: Order): Promise<void> {
    await this.db.insert("orders", order);
  }
}

// In production:
const service = new OrderService(new PostgresDatabase());
// In tests:
const service = new OrderService(new InMemoryDatabase());
```

#### Frontend Example

Instead of importing `fetch` directly in components, inject an API client through
context or props. This makes testing trivial — swap the real client for a fake one.

---

## DRY — Don't Repeat Yourself

> Every piece of knowledge must have a single, unambiguous representation in the system.

DRY is about **knowledge duplication**, not code duplication. Two pieces of code that
look identical but represent different business concepts are NOT duplication.

### When Duplication Is OK

```typescript
// These look the same but represent different concepts:
function validateUserAge(age: number): boolean {
  return age >= 18;
}

function validateEmployeeAge(age: number): boolean {
  return age >= 18; // Same now, but these rules may diverge!
}
```

Premature abstraction is worse than duplication. The "Rule of Three" — wait until
you see the same pattern three times before abstracting.

### Real Duplication (Fix This)

```typescript
// BAD: Same formatting logic in three places
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
function formatAdminName(admin: Admin): string {
  return `${admin.firstName} ${admin.lastName}`.trim();
}

// GOOD: Extract shared logic
function formatFullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}
```

---

## KISS — Keep It Simple

> The simplest solution that works is usually the best.

Complexity is the enemy of maintainability. Avoid over-engineering — generic
frameworks for one use case, abstract factories when a simple function suffices.

```typescript
// OVER-ENGINEERED
class StringTransformerFactory {
  static create(type: "upper" | "lower"): StringTransformer {
    return new StringTransformer(type);
  }
}

// KISS
const toUpper = (s: string): string => s.toUpperCase();
```

---

## YAGNI — You Ain't Gonna Need It

> Don't add functionality until it's actually needed.

Building features "just in case" leads to unused code, increased complexity, and
maintenance burden. Ship what's needed now. Refactor when requirements change.

Common YAGNI violations in frontend:
- Building a plugin system when you have one plugin
- Adding internationalization before going international
- Creating a generic data table component for one table
- Abstracting API calls into a framework before the second endpoint

---

## Meaningful Naming

Names are the primary way code communicates intent. Good names eliminate the need
for comments.

### Rules

| Rule                           | Bad                | Good                        |
|--------------------------------|--------------------|-----------------------------|
| Use intention-revealing names  | `d`                | `elapsedTimeInDays`         |
| Avoid disinformation           | `accountList`      | `accounts` (if it's a Set)  |
| Make meaningful distinctions   | `data1`, `data2`   | `rawInput`, `parsedOutput`  |
| Use pronounceable names        | `genymdhms`        | `generationTimestamp`       |
| Use searchable names           | `7`                | `MAX_RETRIES = 7`           |
| Avoid mental mapping           | `r`                | `response`                  |

### Functions

Functions should be named with **verbs**: `getUser`, `validateEmail`, `formatDate`,
`calculateTotal`. Boolean functions: `isValid`, `hasPermission`, `canEdit`.

### Classes

Classes are named with **nouns**: `UserRepository`, `PaymentProcessor`,
`ShoppingCart`. Avoid generic names like `Manager`, `Handler`, `Data`, `Info`.

### Constants

Use UPPER_SNAKE_CASE for true constants: `MAX_RETRY_COUNT`, `API_BASE_URL`,
`DEFAULT_PAGE_SIZE`.

---

## Function Design

### Small Functions

Functions should be small — typically 5-20 lines. If it's longer, it probably has
multiple responsibilities.

### Single Purpose

A function should do one thing. If you need "and" to describe it ("validates AND
saves"), it's doing two things.

### Few Parameters

Ideal: 0-2 parameters. When you need more, use an options object:

```typescript
// BAD: Too many params
function createUser(name: string, email: string, age: number,
  role: string, department: string): User { ... }

// GOOD: Options object
interface CreateUserOptions {
  name: string;
  email: string;
  age: number;
  role: string;
  department: string;
}
function createUser(options: CreateUserOptions): User { ... }
```

### Side Effects

A function either **computes a value** (pure) or **performs an action** (side effect).
Mixing both creates confusion:

```typescript
// BAD: Computes AND has side effect
function getAndResetCounter(): number {
  const value = counter;
  counter = 0; // Side effect!
  return value;
}

// GOOD: Separate
function getCounter(): number { return counter; }
function resetCounter(): void { counter = 0; }
```

---

## Comments

### When to Write Comments

- **Why**, not what: Explain business decisions, workarounds, non-obvious choices
- Public API documentation (JSDoc for libraries)
- Legal/license headers
- TODO/FIXME with ticket numbers
- Regular expressions (always explain the pattern)

### When Code Should Speak for Itself

```typescript
// BAD: Comment restates the code
// Increment the counter by one
counter += 1;

// BAD: Comment compensates for bad naming
// Check if user is old enough
if (u.a >= 18) { ... }

// GOOD: Self-documenting code needs no comment
if (user.age >= MINIMUM_AGE) { ... }
```

### Dangerous Comments

- **Commented-out code**: Delete it. Version control remembers.
- **Misleading comments**: Worse than no comments.
- **Redundant comments**: `/** Gets the name */ getName()` — adds nothing.
- **Journal comments**: "// Changed on 2024-01-15 by Alice" — use git blame.

---

## Code Smells

Code smells are surface indicators of deeper design problems.

### Long Methods

Functions over 30 lines are suspect. Over 50 lines almost certainly do too much.
Extract sub-functions with descriptive names.

### Feature Envy

A method that uses more data from another class than its own class. Move the method
to where the data lives.

```typescript
// Feature envy — formatAddress is in OrderService but uses only Address fields
class OrderService {
  formatAddress(address: Address): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  }
}

// Better: Move to Address class/module
class Address {
  format(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}`;
  }
}
```

### Shotgun Surgery

One change requires modifying many different files/classes. Indicates scattered
responsibility — consolidate related logic.

### Primitive Obsession

Using primitives (`string`, `number`) instead of domain types:

```typescript
// Primitive obsession
function processOrder(userId: string, productId: string, quantity: number): void {}
// Easy to swap userId and productId — both are strings!

// Better: Branded types or value objects
type UserId = string & { readonly __brand: "UserId" };
type ProductId = string & { readonly __brand: "ProductId" };
```

### Large Class

A class with too many fields and methods. Split into focused classes with clear
responsibilities.

---

## Composition Over Inheritance

Prefer composing objects from smaller pieces rather than building deep inheritance
hierarchies. Inheritance creates tight coupling; composition creates flexibility.

```typescript
// INHERITANCE: Rigid hierarchy
class Animal { move() {} }
class Bird extends Animal { fly() {} }
class Penguin extends Bird { fly() { throw new Error("Can't fly!"); } } // Awkward!

// COMPOSITION: Flexible
interface Movable { move(): void; }
interface Flyable { fly(): void; }
interface Swimmable { swim(): void; }

function createPenguin(): Movable & Swimmable {
  return {
    move() { console.log("waddle"); },
    swim() { console.log("swim"); },
  };
}
```

In React, this is why **hooks and composition** replaced HOCs and render props:

```typescript
// Composition via hooks
function useAuth() { /* ... */ }
function useTheme() { /* ... */ }

function Dashboard() {
  const auth = useAuth();
  const theme = useTheme();
  // Compose behaviors without inheritance
}
```

---

## Law of Demeter

> Only talk to your immediate friends. Don't talk to strangers.

A method should only call methods on:
1. Its own object
2. Objects passed as parameters
3. Objects it creates
4. Its direct properties

```typescript
// BAD: Reaching through objects (train wreck)
const zip = order.getCustomer().getAddress().getZipCode();

// GOOD: Ask, don't reach
const zip = order.getShippingZip();
```

---

## Guard Clauses

Guard clauses (early returns) flatten nested conditionals and make the "happy path"
clear.

```typescript
// BAD: Deep nesting
function processPayment(order: Order): string {
  if (order) {
    if (order.items.length > 0) {
      if (order.paymentMethod) {
        if (order.total > 0) {
          return "processed";
        }
      }
    }
  }
  return "failed";
}

// GOOD: Guard clauses
function processPayment(order: Order): string {
  if (!order) return "failed";
  if (order.items.length === 0) return "failed";
  if (!order.paymentMethod) return "failed";
  if (order.total <= 0) return "failed";

  return "processed";
}
```

---

## Magic Numbers

Replace unexplained numeric literals with named constants.

```typescript
// BAD: What does 86400000 mean?
setTimeout(cleanup, 86400000);

// GOOD: Self-documenting
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
setTimeout(cleanup, ONE_DAY_MS);
```

```typescript
// BAD
if (password.length < 8) { ... }

// GOOD
const MIN_PASSWORD_LENGTH = 8;
if (password.length < MIN_PASSWORD_LENGTH) { ... }
```

---

## Summary

- **SRP**: Each module has one reason to change
- **OCP**: Extend behavior without modifying existing code
- **LSP**: Subtypes work wherever base types are expected
- **ISP**: Small, focused interfaces over fat ones
- **DIP**: Depend on abstractions, not concretions
- **DRY**: Eliminate knowledge duplication, not all code duplication
- **KISS**: Choose the simplest solution that works
- **YAGNI**: Build what you need now, not what you might need later
- Name things clearly — good names eliminate comments
- Keep functions small, focused, and with few parameters
- Watch for code smells and refactor when you see them
- Prefer composition over inheritance
- Use guard clauses to flatten nested conditionals
- Replace magic numbers with named constants
