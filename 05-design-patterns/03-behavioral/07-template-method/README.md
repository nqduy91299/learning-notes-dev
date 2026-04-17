# Template Method Pattern

> **Behavioral Design Pattern**
> Reference: [refactoring.guru/design-patterns/template-method](https://refactoring.guru/design-patterns/template-method)

---

## Intent

**Template Method** defines the skeleton of an algorithm in a superclass but lets subclasses
override specific steps of the algorithm without changing its overall structure.

The superclass controls *when* each step runs. Subclasses control *how* each step runs.

---

## The Problem

Imagine you're building a data mining application that processes corporate documents in
multiple formats: PDF, DOC, and CSV.

Each format requires its own parsing logic, but the high-level algorithm is identical:

1. Open the file
2. Extract raw data
3. Parse the data into a structured format
4. Analyze the structured data
5. Generate a report
6. Close the file

Without Template Method, you end up with three classes that duplicate steps 4-6 while
differing only in steps 1-3. When the shared algorithm changes, you must update every class.
Client code is littered with conditionals to pick the right class.

### What we want

- **Eliminate duplication** of the shared algorithm steps
- **Enforce a consistent algorithm structure** across all variants
- **Allow subclasses to customize** only the steps that vary
- **Prevent subclasses from changing** the overall algorithm order

---

## Structure

```
┌─────────────────────────────────┐
│       AbstractClass             │
├─────────────────────────────────┤
│ + templateMethod()              │  ◄── final: defines algorithm skeleton
│ # step1()          (abstract)   │
│ # step2()          (abstract)   │
│ # step3()          (default)    │
│ # hook()           (empty)      │  ◄── optional extension point
└──────────┬──────────────────────┘
           │ extends
┌──────────▼──────────────────────┐
│       ConcreteClass             │
├─────────────────────────────────┤
│ # step1()          (override)   │
│ # step2()          (override)   │
│ # hook()           (optional)   │
└─────────────────────────────────┘
```

### Participants

| Role              | Responsibility                                                       |
| ----------------- | -------------------------------------------------------------------- |
| **AbstractClass**  | Declares the template method and abstract/default steps              |
| **ConcreteClass**  | Implements abstract steps, optionally overrides defaults and hooks   |
| **Template Method**| The method that calls steps in order — should not be overridden      |
| **Hook**           | An optional step with an empty or trivial default body               |

---

## Hooks

A **hook** is a method with a do-nothing default that subclasses *may* override:

```typescript
abstract class AbstractClass {
  // Template method
  public run(): void {
    this.initialize();
    this.execute();
    this.beforeCleanup(); // hook
    this.cleanup();
  }

  protected abstract initialize(): void;
  protected abstract execute(): void;
  protected abstract cleanup(): void;

  // Hook — empty default, subclass can override
  protected beforeCleanup(): void {
    // intentionally empty
  }
}
```

Hooks provide extension points without forcing subclasses to implement methods they
don't care about. Common hook placements:

- **Before/after** critical algorithm steps
- **Conditional gates** (`shouldContinue()` returning boolean)
- **Notification points** for logging or metrics

---

## Implementation in TypeScript

```typescript
abstract class DataMiner {
  // Template method — controls the algorithm
  public mine(path: string): string {
    const file = this.openFile(path);
    const raw = this.extractData(file);
    const parsed = this.parseData(raw);

    if (this.shouldAnalyze()) {       // hook (conditional gate)
      this.analyze(parsed);
    }

    const report = this.generateReport(parsed);
    this.closeFile(file);
    return report;
  }

  protected abstract openFile(path: string): string;
  protected abstract extractData(file: string): string;
  protected abstract parseData(raw: string): string[];

  // Default implementation — shared across subclasses
  protected analyze(data: string[]): void {
    console.log(`Analyzing ${data.length} records...`);
  }

  protected generateReport(data: string[]): string {
    return `Report: ${data.length} records processed`;
  }

  protected abstract closeFile(file: string): void;

  // Hook
  protected shouldAnalyze(): boolean {
    return true;
  }
}

class CsvMiner extends DataMiner {
  protected openFile(path: string): string {
    return `csv-handle:${path}`;
  }
  protected extractData(file: string): string {
    return "name,age\nAlice,30\nBob,25";
  }
  protected parseData(raw: string): string[] {
    return raw.split("\n").slice(1);
  }
  protected closeFile(file: string): void {
    console.log(`Closed ${file}`);
  }
}

class PdfMiner extends DataMiner {
  protected openFile(path: string): string {
    return `pdf-handle:${path}`;
  }
  protected extractData(file: string): string {
    return "binary-pdf-content";
  }
  protected parseData(raw: string): string[] {
    return [raw]; // simplified
  }
  protected closeFile(file: string): void {
    console.log(`Closed ${file}`);
  }
  // Override hook to skip analysis for PDFs
  protected shouldAnalyze(): boolean {
    return false;
  }
}
```

---

## Template Method vs Strategy

| Aspect              | Template Method                          | Strategy                                |
| ------------------- | ---------------------------------------- | --------------------------------------- |
| **Mechanism**        | Inheritance                             | Composition                             |
| **Granularity**      | Overrides individual steps              | Replaces entire algorithm               |
| **Binding time**     | Compile-time (static)                   | Runtime (dynamic)                       |
| **Class level**      | Works at the class level                | Works at the object level               |
| **Algorithm control**| Superclass controls skeleton            | Client controls which strategy to use   |
| **Flexibility**      | Less flexible, more structured          | More flexible, less structured          |
| **Code reuse**       | Shared steps in base class              | No shared steps — each strategy is full |

**Rule of thumb:** Use Template Method when you have a fixed algorithm with variable steps.
Use Strategy when you want to swap entire algorithms at runtime.

---

## When to Use

1. **Multiple classes share an algorithm** but differ in specific steps
2. **You want to enforce an algorithm's structure** while allowing customization
3. **You want to eliminate duplicate code** by pulling shared logic into a base class
4. **Hook-based extension** is needed — optional customization without subclass obligation
5. **Framework design** — frameworks often use template methods to let user code plug in

---

## Pros and Cons

### Pros

- Clients override only specific steps, reducing impact of changes to other parts
- Duplicate code is pulled up into a superclass
- Algorithm structure is enforced — subclasses cannot reorder steps
- Hooks provide clean extension points

### Cons

- Subclasses may be limited by the fixed skeleton
- Violating Liskov Substitution Principle is easy (suppressing a step via empty override)
- More steps = harder to maintain the template method
- Inheritance-based — tighter coupling than composition-based alternatives
- Debugging can be harder since control flow bounces between base and subclass

---

## Real-World Examples

### 1. Data Mining / ETL Pipelines

Fixed pipeline: extract → transform → load. Each data source provides its own extract
and transform logic while sharing the load step.

### 2. Game AI

Turn-based games: `collectResources() → buildStructures() → buildUnits() → attack()`.
Each faction (Orcs, Humans, Monsters) overrides specific steps while the turn structure
remains fixed.

### 3. Document Generation

Report generators: `buildHeader() → buildBody() → buildFooter() → export()`.
HTML, PDF, and Markdown generators override the build steps while sharing the export logic.

### 4. Web Framework Request Handling

Frameworks like Express or Django process requests through a fixed pipeline:
`authenticate() → authorize() → validate() → handle() → respond()`.
Developers override `handle()` while the framework controls the rest.

### 5. Testing Frameworks

Test runners: `setUp() → runTest() → tearDown()`. The runner controls the lifecycle;
developers implement `runTest()` and optionally override setUp/tearDown hooks.

### 6. Compiler Phases

`lex() → parse() → analyze() → optimize() → emit()`. Different language frontends
override lex/parse while sharing analysis and optimization passes.

---

## Related Patterns

- **Factory Method** is a specialization of Template Method — the factory method is one
  "step" in the template
- **Strategy** is the composition-based alternative to Template Method
- **Hook methods** inside Template Method are conceptually similar to **Observer** callbacks

---

## Key Takeaways

1. Template Method uses **inheritance** to vary parts of an algorithm
2. The template method itself should be **final** (not overridden)
3. **Abstract steps** must be implemented; **hooks** are optional
4. Prefer Template Method when the algorithm structure is fixed and only details vary
5. Consider Strategy if you need runtime algorithm swapping or want to avoid deep hierarchies
