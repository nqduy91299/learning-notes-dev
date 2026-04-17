# Strategy Pattern

## Table of Contents

- [Intent](#intent)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Structure](#structure)
- [Strategy with Functions (JS/TS Idiomatic)](#strategy-with-functions-jsts-idiomatic)
- [Implementation in TypeScript](#implementation-in-typescript)
- [Strategy vs State Pattern](#strategy-vs-state-pattern)
- [When to Use](#when-to-use)
- [Pros and Cons](#pros-and-cons)
- [Real-World Examples](#real-world-examples)
- [Relations with Other Patterns](#relations-with-other-patterns)
- [References](#references)

---

## Intent

**Strategy** is a behavioral design pattern that lets you define a family of algorithms,
put each of them into a separate class (or function), and make their objects interchangeable.

The key idea: extract algorithmic variants into separate, interchangeable units so the
context that uses them remains decoupled from their implementation details.

---

## The Problem

Imagine you are building a data processing pipeline. Initially, you only need one way to
transform data — say, CSV export. Over time, requirements grow:

- JSON export
- XML export
- Parquet export
- Custom binary format

Without the Strategy pattern, you end up with a massive conditional inside your exporter:

```typescript
class DataExporter {
  export(data: Record<string, unknown>[], format: string): string {
    if (format === "csv") {
      // 50 lines of CSV logic
    } else if (format === "json") {
      // 40 lines of JSON logic
    } else if (format === "xml") {
      // 60 lines of XML logic
    } else if (format === "parquet") {
      // 80 lines of binary logic
    }
    // ... keeps growing
    throw new Error(`Unknown format: ${format}`);
  }
}
```

Problems with this approach:

1. **Single Responsibility Violation** — one class knows every algorithm.
2. **Open/Closed Violation** — adding a new format requires modifying the existing class.
3. **Testing difficulty** — you cannot test one algorithm in isolation.
4. **Merge conflicts** — multiple developers editing the same giant file.
5. **Dead code risk** — unused formats are still compiled and shipped.

---

## The Solution

Extract each algorithm into its own class (or function) that conforms to a shared
interface. The context holds a reference to the current strategy and delegates work to it.

```
Client  -->  Context  -->  Strategy (interface)
                               |
                     +---------+---------+
                     |         |         |
                 StrategyA  StrategyB  StrategyC
```

The context does not know which concrete strategy it is using. The client selects the
appropriate strategy and injects it into the context — either at construction time or
via a setter at runtime.

---

## Structure

### Participants

| Participant           | Role                                                              |
| --------------------- | ----------------------------------------------------------------- |
| **Strategy**          | Interface declaring the algorithm method(s).                      |
| **ConcreteStrategy**  | Implements a specific variant of the algorithm.                   |
| **Context**           | Maintains a reference to a Strategy; delegates algorithmic work.  |
| **Client**            | Creates a ConcreteStrategy and configures the Context with it.    |

### Collaboration

1. The **Client** creates a concrete strategy and passes it to the **Context**.
2. The **Context** stores the strategy and calls its method when needed.
3. The **Context** is unaware of which concrete strategy is in use.
4. The strategy can be replaced at runtime via a setter on the Context.

---

## Strategy with Functions (JS/TS Idiomatic)

In JavaScript and TypeScript, functions are first-class citizens. You often don't need
a class hierarchy — a simple function type serves as the strategy interface:

```typescript
// The strategy "interface" is just a function signature
type SortStrategy<T> = (items: T[]) => T[];

// Concrete strategies are plain functions
const bubbleSort: SortStrategy<number> = (items) => {
  const arr = [...items];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
  return arr;
};

const nativeSort: SortStrategy<number> = (items) =>
  [...items].sort((a, b) => a - b);

// Context is a function (or class) that accepts a strategy
function sortData<T>(data: T[], strategy: SortStrategy<T>): T[] {
  return strategy(data);
}

// Usage
const data = [5, 3, 8, 1];
console.log(sortData(data, bubbleSort));  // [1, 3, 5, 8]
console.log(sortData(data, nativeSort));  // [1, 3, 5, 8]
```

This functional approach is idiomatic in JS/TS and avoids the boilerplate of class
hierarchies. Use class-based strategies when:

- Strategies carry internal state between calls.
- You need dependency injection / constructor parameters.
- The strategy interface has multiple methods.

---

## Implementation in TypeScript

### Class-Based Strategy

```typescript
// Step 1: Define the strategy interface
interface CompressionStrategy {
  compress(data: Uint8Array): Uint8Array;
  readonly name: string;
}

// Step 2: Implement concrete strategies
class GzipCompression implements CompressionStrategy {
  readonly name = "gzip";
  compress(data: Uint8Array): Uint8Array {
    // Simulate gzip compression
    console.log(`Compressing ${data.length} bytes with gzip`);
    return data; // placeholder
  }
}

class ZlibCompression implements CompressionStrategy {
  readonly name = "zlib";
  compress(data: Uint8Array): Uint8Array {
    console.log(`Compressing ${data.length} bytes with zlib`);
    return data;
  }
}

class NoCompression implements CompressionStrategy {
  readonly name = "none";
  compress(data: Uint8Array): Uint8Array {
    return data;
  }
}

// Step 3: Create the context
class FileArchiver {
  private strategy: CompressionStrategy;

  constructor(strategy: CompressionStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CompressionStrategy): void {
    this.strategy = strategy;
  }

  archive(files: Map<string, Uint8Array>): Map<string, Uint8Array> {
    const result = new Map<string, Uint8Array>();
    for (const [name, data] of files) {
      result.set(name, this.strategy.compress(data));
    }
    console.log(`Archived ${files.size} files using ${this.strategy.name}`);
    return result;
  }
}

// Step 4: Client code
const archiver = new FileArchiver(new GzipCompression());
archiver.archive(new Map([["a.txt", new Uint8Array([1, 2, 3])]]));

archiver.setStrategy(new ZlibCompression());
archiver.archive(new Map([["b.txt", new Uint8Array([4, 5, 6])]]));
```

### Generic Strategy with Type Parameters

```typescript
interface TransformStrategy<TInput, TOutput> {
  transform(input: TInput): TOutput;
}

class Pipeline<TInput, TOutput> {
  constructor(private strategy: TransformStrategy<TInput, TOutput>) {}

  setStrategy(strategy: TransformStrategy<TInput, TOutput>): void {
    this.strategy = strategy;
  }

  execute(input: TInput): TOutput {
    return this.strategy.transform(input);
  }
}
```

### Strategy Registry Pattern

```typescript
class StrategyRegistry<TStrategy> {
  private strategies = new Map<string, TStrategy>();

  register(name: string, strategy: TStrategy): void {
    this.strategies.set(name, strategy);
  }

  get(name: string): TStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) throw new Error(`Unknown strategy: ${name}`);
    return strategy;
  }

  list(): string[] {
    return [...this.strategies.keys()];
  }
}
```

---

## Strategy vs State Pattern

Strategy and State have nearly identical class diagrams, but they solve different problems:

| Aspect               | Strategy                                    | State                                         |
| -------------------- | ------------------------------------------- | --------------------------------------------- |
| **Intent**           | Select an algorithm variant                 | Change behavior based on internal state        |
| **Who decides**      | The *client* picks the strategy             | The *state objects* trigger transitions        |
| **Awareness**        | Strategies are independent of each other    | States know about and transition to each other |
| **Lifetime**         | Typically set once or infrequently swapped  | Transitions happen frequently at runtime       |
| **Analogy**          | Choosing a route on a map                   | Traffic light cycling through red/yellow/green |

Key distinction: in Strategy, the **client** explicitly chooses which algorithm to use.
In State, the **object itself** transitions between states, and the client may not even
be aware of the internal state changes.

```typescript
// Strategy: client decides
navigator.setStrategy(new WalkingRoute());

// State: object decides internally
trafficLight.next(); // red -> green -> yellow -> red (automatic)
```

---

## When to Use

Use the Strategy pattern when:

1. **Multiple algorithm variants** — You have several ways to perform the same operation
   and want to switch between them without modifying the context.

2. **Eliminating conditionals** — A class has a large `if/else` or `switch` block that
   selects among algorithm variants.

3. **Runtime algorithm selection** — The choice of algorithm depends on user input,
   configuration, or runtime data.

4. **Isolating algorithm code** — You want to test, develop, or deploy algorithms
   independently.

5. **Open/Closed Principle** — You want to add new algorithms without modifying existing
   code.

Do **not** use it when:

- You only have 2 algorithms that rarely change — the overhead is not justified.
- The "algorithms" are trivially small (one-liners) — just use inline logic or a map.

---

## Pros and Cons

### Pros

- **Open/Closed Principle** — new strategies can be added without changing the context.
- **Single Responsibility** — each strategy encapsulates one algorithm.
- **Runtime flexibility** — swap algorithms on the fly.
- **Composition over inheritance** — avoids deep class hierarchies.
- **Testability** — strategies can be unit-tested in isolation.
- **Eliminates conditionals** — replaces branching with polymorphism (or function dispatch).

### Cons

- **Client awareness** — the client must know enough about strategies to pick the right one.
- **Potential over-engineering** — for a small, stable set of algorithms, a simple
  conditional may be clearer.
- **Increased number of objects/functions** — each variant becomes a separate entity.
- **Communication overhead** — if the strategy needs data from the context, you must
  design an interface for that communication (pass data as parameters or give the
  strategy a reference to the context).

---

## Real-World Examples

### 1. Sorting Strategies

```typescript
type Comparator<T> = (a: T, b: T) => number;

interface SortingStrategy<T> {
  sort(items: T[], compare: Comparator<T>): T[];
}

class QuickSort<T> implements SortingStrategy<T> {
  sort(items: T[], compare: Comparator<T>): T[] {
    if (items.length <= 1) return items;
    const pivot = items[0];
    const left = items.slice(1).filter((x) => compare(x, pivot) <= 0);
    const right = items.slice(1).filter((x) => compare(x, pivot) > 0);
    return [...this.sort(left, compare), pivot, ...this.sort(right, compare)];
  }
}

class InsertionSort<T> implements SortingStrategy<T> {
  sort(items: T[], compare: Comparator<T>): T[] {
    const arr = [...items];
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0 && compare(arr[j], key) > 0) {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = key;
    }
    return arr;
  }
}

// Use InsertionSort for small arrays, QuickSort for large ones
function adaptiveSort<T>(items: T[], compare: Comparator<T>): T[] {
  const strategy: SortingStrategy<T> =
    items.length < 10 ? new InsertionSort() : new QuickSort();
  return strategy.sort(items, compare);
}
```

### 2. Validation Strategies

```typescript
interface ValidationStrategy {
  validate(value: string): { valid: boolean; message?: string };
}

class EmailValidation implements ValidationStrategy {
  validate(value: string) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return { valid, message: valid ? undefined : "Invalid email format" };
  }
}

class PasswordValidation implements ValidationStrategy {
  constructor(private minLength: number = 8) {}

  validate(value: string) {
    if (value.length < this.minLength)
      return { valid: false, message: `Minimum ${this.minLength} characters` };
    if (!/[A-Z]/.test(value))
      return { valid: false, message: "Must contain uppercase letter" };
    if (!/[0-9]/.test(value))
      return { valid: false, message: "Must contain a digit" };
    return { valid: true };
  }
}

class FormField {
  private strategy: ValidationStrategy;
  constructor(
    public readonly name: string,
    strategy: ValidationStrategy,
  ) {
    this.strategy = strategy;
  }
  validate(value: string) {
    return this.strategy.validate(value);
  }
}
```

### 3. Payment Processing

```typescript
interface PaymentStrategy {
  pay(amount: number): Promise<{ success: boolean; transactionId: string }>;
  readonly methodName: string;
}

class CreditCardPayment implements PaymentStrategy {
  readonly methodName = "Credit Card";
  constructor(
    private cardNumber: string,
    private cvv: string,
  ) {}
  async pay(amount: number) {
    console.log(`Charging $${amount} to card ending in ${this.cardNumber.slice(-4)}`);
    return { success: true, transactionId: crypto.randomUUID() };
  }
}

class PayPalPayment implements PaymentStrategy {
  readonly methodName = "PayPal";
  constructor(private email: string) {}
  async pay(amount: number) {
    console.log(`Charging $${amount} to PayPal account ${this.email}`);
    return { success: true, transactionId: crypto.randomUUID() };
  }
}

class Checkout {
  private paymentMethod: PaymentStrategy;
  constructor(payment: PaymentStrategy) {
    this.paymentMethod = payment;
  }
  setPayment(payment: PaymentStrategy): void {
    this.paymentMethod = payment;
  }
  async processOrder(total: number) {
    console.log(`Processing $${total} via ${this.paymentMethod.methodName}`);
    return this.paymentMethod.pay(total);
  }
}
```

### 4. Compression Strategies

```typescript
interface CompressionAlgorithm {
  compress(input: string): string;
  decompress(input: string): string;
  readonly algorithm: string;
}

class RunLengthEncoding implements CompressionAlgorithm {
  readonly algorithm = "RLE";
  compress(input: string): string {
    return input.replace(/(.)\1*/g, (match, char: string) =>
      match.length > 1 ? `${match.length}${char}` : char,
    );
  }
  decompress(input: string): string {
    return input.replace(/(\d+)(.)/g, (_, count: string, char: string) =>
      char.repeat(Number(count)),
    );
  }
}

class Base64Encoding implements CompressionAlgorithm {
  readonly algorithm = "Base64";
  compress(input: string): string {
    return btoa(input);
  }
  decompress(input: string): string {
    return atob(input);
  }
}

class DataStore {
  constructor(private compression: CompressionAlgorithm) {}
  setCompression(compression: CompressionAlgorithm): void {
    this.compression = compression;
  }
  save(data: string): string {
    return this.compression.compress(data);
  }
  load(compressed: string): string {
    return this.compression.decompress(compressed);
  }
}
```

---

## Relations with Other Patterns

- **Template Method** uses inheritance to vary parts of an algorithm; Strategy uses
  composition. Template Method is static (compile-time); Strategy is dynamic (runtime).
- **Command** parameterizes objects with operations (deferred execution, undo, queuing);
  Strategy parameterizes objects with algorithms (same operation, different implementations).
- **Decorator** changes the skin; Strategy changes the guts.
- **State** is structurally identical but semantically different — states know about each
  other and drive transitions; strategies are independent and chosen by the client.
- **Bridge** separates abstraction from implementation (structural concern); Strategy
  separates an algorithm from the code that uses it (behavioral concern).

---

## References

- [Refactoring.Guru — Strategy](https://refactoring.guru/design-patterns/strategy)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 5
- *Head First Design Patterns*, Chapter 1
