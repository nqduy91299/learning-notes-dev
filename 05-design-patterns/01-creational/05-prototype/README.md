# Prototype Pattern

## Table of Contents

- [Intent](#intent)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Structure](#structure)
- [Prototype Interface with clone()](#prototype-interface-with-clone)
- [Shallow vs Deep Copy](#shallow-vs-deep-copy)
- [Prototype Registry](#prototype-registry)
- [Connection to Object.create()](#connection-to-objectcreate)
- [structuredClone()](#structuredclone)
- [Implementation in TypeScript](#implementation-in-typescript)
- [When to Use](#when-to-use)
- [Pros and Cons](#pros-and-cons)
- [Real-World Examples](#real-world-examples)
- [Relations with Other Patterns](#relations-with-other-patterns)

---

## Intent

**Prototype** is a creational design pattern that lets you copy existing objects without
making your code dependent on their classes. Instead of creating new instances from
scratch via constructors, you clone an existing object (the "prototype") and modify the
copy as needed.

The key insight: **delegation of object creation to the objects themselves**. Each object
knows how to copy itself, so the client never needs to know the concrete class.

---

## The Problem

Imagine you need to create an exact copy of an object. The naive approach:

1. Create a new object of the same class.
2. Iterate over all fields of the original and copy their values.

This fails for several reasons:

- **Private fields**: Some fields may not be accessible from outside the object.
- **Class coupling**: You must know the concrete class to call `new`. If you only have
  a reference to an interface or base class, you cannot instantiate the correct subclass.
- **Hidden dependencies**: The object might have internal state set during construction
  that is not exposed through public properties.
- **Complex initialization**: Some objects require expensive setup (database connections,
  file handles, computed caches). Reconstructing from scratch is wasteful when you just
  need a slightly different variant.

```typescript
// Problem: coupled to concrete class, cannot access private state
function copyShape(shape: Shape): Shape {
  // What concrete type is shape? Circle? Rectangle? Triangle?
  // We don't know, so we can't call the right constructor.
  // Even if we did, private fields are inaccessible.
  throw new Error("Cannot copy without knowing the concrete class");
}
```

---

## The Solution

The Prototype pattern delegates cloning to the objects themselves:

1. Define a **Prototype interface** with a `clone()` method.
2. Each **Concrete Prototype** implements `clone()` to return a copy of itself.
3. The **Client** calls `clone()` on any prototype without knowing its concrete class.

The cloned object is a new, independent instance. The client works entirely through
the prototype interface, achieving full decoupling from concrete classes.

---

## Structure

```
┌─────────────────────┐
│   <<interface>>     │
│     Prototype       │
├─────────────────────┤
│  + clone(): Prototype│
└─────────┬───────────┘
          │ implements
    ┌─────┴──────┐
    │            │
┌───▼──────┐ ┌──▼───────┐
│ConcreteA  │ │ConcreteB  │
├──────────┤ ├──────────┤
│- field1  │ │- field1  │
│- field2  │ │- field2  │
├──────────┤ ├──────────┤
│+ clone() │ │+ clone() │
└──────────┘ └──────────┘

Client ──uses──▶ Prototype (interface)
```

### Prototype Registry (optional)

```
┌──────────────────────────┐
│   PrototypeRegistry      │
├──────────────────────────┤
│ - items: Map<string, P>  │
├──────────────────────────┤
│ + register(key, proto)   │
│ + get(key): Prototype    │  ◀── returns proto.clone()
└──────────────────────────┘
```

---

## Prototype Interface with clone()

The minimal interface declares a single method:

```typescript
interface Prototype<T> {
  clone(): T;
}
```

Key design decisions:

- **Return type**: Use the concrete type or a generic parameter so callers get a
  properly typed clone without casting.
- **Method name**: `clone()` is conventional. JavaScript's built-in prototypal
  inheritance does not provide a standard `clone()`, so we define our own.
- **No arguments**: `clone()` takes no parameters. The prototype knows everything
  needed to copy itself.

### Class-based implementation

```typescript
interface Prototype<T> {
  clone(): T;
}

abstract class Shape implements Prototype<Shape> {
  constructor(
    public x: number,
    public y: number,
    public color: string
  ) {}

  abstract clone(): Shape;
}

class Circle extends Shape {
  constructor(x: number, y: number, color: string, public radius: number) {
    super(x, y, color);
  }

  clone(): Circle {
    return new Circle(this.x, this.y, this.color, this.radius);
  }
}

class Rectangle extends Shape {
  constructor(
    x: number, y: number, color: string,
    public width: number,
    public height: number
  ) {
    super(x, y, color);
  }

  clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.color, this.width, this.height);
  }
}
```

---

## Shallow vs Deep Copy

This is the most critical implementation detail of the Prototype pattern.

### Shallow Copy

Copies the top-level fields. Reference-type fields still point to the **same objects**
as the original.

```typescript
class ShallowExample {
  constructor(public tags: string[], public name: string) {}

  clone(): ShallowExample {
    // tags array is shared between original and clone
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

const original = new ShallowExample(["a", "b"], "test");
const copy = original.clone();
copy.tags.push("c");
console.log(original.tags); // ["a", "b", "c"] -- mutation leaked!
```

### Deep Copy

Recursively copies all nested objects so the clone is fully independent.

```typescript
class DeepExample {
  constructor(public tags: string[], public name: string) {}

  clone(): DeepExample {
    return new DeepExample([...this.tags], this.name);
  }
}

const original = new DeepExample(["a", "b"], "test");
const copy = original.clone();
copy.tags.push("c");
console.log(original.tags); // ["a", "b"] -- original unaffected
```

### Comparison

| Aspect          | Shallow Copy               | Deep Copy                    |
|-----------------|---------------------------|------------------------------|
| Performance     | Fast                      | Slower (recursive)           |
| Independence    | Shared references          | Fully independent            |
| Use case        | Immutable nested data      | Mutable nested data          |
| Complexity      | Simple                    | Must handle cycles, classes  |

### Rule of thumb

- Use **shallow copy** when nested objects are immutable or value types.
- Use **deep copy** when the clone must be fully independent and nested data is mutable.

---

## Prototype Registry

A registry (also called a "prototype manager" or "prototype cache") stores pre-configured
prototypes indexed by a key. Clients request clones by key instead of constructing objects.

```typescript
class PrototypeRegistry<T extends Prototype<T>> {
  private prototypes = new Map<string, T>();

  register(key: string, prototype: T): void {
    this.prototypes.set(key, prototype);
  }

  get(key: string): T {
    const proto = this.prototypes.get(key);
    if (!proto) {
      throw new Error(`Prototype not found: ${key}`);
    }
    return proto.clone();
  }

  getKeys(): string[] {
    return [...this.prototypes.keys()];
  }
}
```

Benefits of a registry:
- Centralizes prototype management.
- Clients only need to know the string key, not the class.
- New prototypes can be registered at runtime without changing client code.

---

## Connection to Object.create()

JavaScript has **prototypal inheritance** built into the language via `Object.create()`.
This is conceptually related to the Prototype pattern but serves a different purpose:

```typescript
// Object.create() sets up prototype chain (inheritance)
const proto = { greet() { return "hello"; } };
const obj = Object.create(proto);
obj.greet(); // "hello" -- delegated to proto

// Prototype pattern creates independent copies (cloning)
const clone = original.clone(); // new independent object
```

**Key differences:**

| Aspect              | Object.create()               | Prototype Pattern clone()     |
|---------------------|-------------------------------|-------------------------------|
| Purpose             | Prototype chain (delegation)  | Independent copy              |
| Shared state        | Yes (delegated lookups)       | No (own copy of data)         |
| Modification impact | Affects all linked objects    | Only affects the clone        |
| Use case            | Inheritance mechanism         | Object creation pattern       |

`Object.create()` is useful *within* a clone implementation to preserve the prototype
chain while copying own properties:

```typescript
function shallowClone<T extends object>(obj: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}
```

---

## structuredClone()

Available since Node 17+ and all modern browsers, `structuredClone()` performs a deep
copy using the structured clone algorithm:

```typescript
const original = { name: "config", tags: ["a", "b"], nested: { value: 42 } };
const copy = structuredClone(original);
copy.nested.value = 99;
console.log(original.nested.value); // 42 -- fully independent
```

### Limitations

- **Cannot clone functions** or methods -- throws `DataCloneError`.
- **Cannot clone class instances** properly -- loses the prototype chain.
- Cannot handle `Symbol` properties, `WeakMap`, `WeakSet`, or DOM nodes.
- No support for `Error` objects (in some environments).

### When to use structuredClone() vs custom clone()

| Scenario                     | Recommendation                          |
|------------------------------|----------------------------------------|
| Plain data objects (POJOs)   | `structuredClone()` works great        |
| Class instances with methods | Custom `clone()` method required       |
| Objects with circular refs   | `structuredClone()` handles this       |
| Performance-critical paths   | Custom clone (avoid serialization)     |

### Combining both approaches

```typescript
class Config implements Prototype<Config> {
  constructor(
    public name: string,
    public settings: Record<string, unknown>
  ) {}

  clone(): Config {
    // Use structuredClone for the nested plain data,
    // but construct a proper class instance
    return new Config(this.name, structuredClone(this.settings));
  }
}
```

---

## Implementation in TypeScript

### Full example with generics

```typescript
// 1. Prototype interface
interface Prototype<T> {
  clone(): T;
}

// 2. Abstract base with shared clone logic
abstract class GameObject implements Prototype<GameObject> {
  constructor(
    public x: number,
    public y: number,
    public health: number,
    public tags: string[]
  ) {}

  abstract clone(): GameObject;

  protected copyBaseFields(): [number, number, number, string[]] {
    return [this.x, this.y, this.health, [...this.tags]];
  }
}

// 3. Concrete prototypes
class Soldier extends GameObject {
  constructor(
    x: number, y: number, health: number, tags: string[],
    public weapon: string,
    public armor: number
  ) {
    super(x, y, health, tags);
  }

  clone(): Soldier {
    const [x, y, health, tags] = this.copyBaseFields();
    return new Soldier(x, y, health, tags, this.weapon, this.armor);
  }
}

class Vehicle extends GameObject {
  constructor(
    x: number, y: number, health: number, tags: string[],
    public speed: number,
    public passengers: number
  ) {
    super(x, y, health, tags);
  }

  clone(): Vehicle {
    const [x, y, health, tags] = this.copyBaseFields();
    return new Vehicle(x, y, health, tags, this.speed, this.passengers);
  }
}

// 4. Registry
class GameObjectRegistry {
  private prototypes = new Map<string, GameObject>();

  register(key: string, prototype: GameObject): void {
    this.prototypes.set(key, prototype);
  }

  create(key: string): GameObject {
    const proto = this.prototypes.get(key);
    if (!proto) throw new Error(`Unknown prototype: ${key}`);
    return proto.clone();
  }
}

// 5. Usage
const registry = new GameObjectRegistry();
registry.register("infantry", new Soldier(0, 0, 100, ["ground"], "rifle", 50));
registry.register("tank", new Vehicle(0, 0, 500, ["ground", "heavy"], 30, 4));

const soldier1 = registry.create("infantry"); // cloned Soldier
const tank1 = registry.create("tank");        // cloned Vehicle
```

### TypeScript-specific tips

1. **Use generic constraints** to keep clone() type-safe.
2. **Leverage `readonly` properties** to avoid accidental mutation (shallow copy is safe
   when fields are readonly).
3. **Private fields**: TypeScript private fields (using `#` or `private`) are accessible
   within the same class, so `clone()` can read them.
4. **Abstract classes** work well as the base prototype since they can hold shared logic.

---

## When to Use

Use the Prototype pattern when:

- **Object creation is expensive** and a similar object already exists (database records,
  parsed configurations, computed caches).
- **You need to avoid coupling** to concrete classes -- your code should work with any
  object that implements the clone interface.
- **You want runtime configuration presets** -- register prototypes and clone them by key
  instead of hardcoding constructor calls.
- **Reducing subclass explosion** -- instead of creating a subclass for each configuration
  variant, clone a prototype and tweak it.
- **Undo/history systems** -- clone state snapshots to enable rollback.
- **Testing** -- clone a known-good object and modify specific fields for each test case.

Do NOT use when:

- Objects are cheap to create from scratch.
- Objects have complex circular references that make cloning difficult.
- The object graph is deeply nested with many different types (consider Serialization).

---

## Pros and Cons

### Pros

| Advantage                               | Explanation                                          |
|-----------------------------------------|------------------------------------------------------|
| Decoupled from concrete classes         | Client only depends on the Prototype interface       |
| Eliminates repeated initialization      | Clone pre-configured objects instead of re-setup     |
| Produces complex objects conveniently   | Deep hierarchies can be cloned in one call           |
| Alternative to inheritance              | Configuration presets via cloning, not subclassing    |
| Runtime flexibility                     | Register new prototypes without recompiling          |

### Cons

| Disadvantage                            | Explanation                                          |
|-----------------------------------------|------------------------------------------------------|
| Circular references are tricky          | Deep copy must detect and handle cycles              |
| Deep copy overhead                      | Recursive copying can be expensive for large graphs  |
| Every class needs clone()               | Adding the pattern to existing hierarchies is work   |
| Shallow vs deep ambiguity               | Easy to introduce bugs with shared references        |

---

## Real-World Examples

### 1. Game Objects

In game development, levels often contain hundreds of similar entities (enemies, items,
obstacles). Instead of configuring each from scratch:

```typescript
// Register archetypes once
registry.register("goblin", new Enemy(0, 0, 50, ["hostile"], "club", 10));
registry.register("dragon", new Enemy(0, 0, 1000, ["hostile", "flying"], "fire", 200));

// Spawn by cloning and adjusting position
function spawnWave(type: string, positions: [number, number][]): Enemy[] {
  return positions.map(([x, y]) => {
    const enemy = registry.create(type) as Enemy;
    enemy.x = x;
    enemy.y = y;
    return enemy;
  });
}
```

### 2. Document Templates

Document editors use prototypes for templates. A "business letter" template is a
pre-configured document object. Creating a new letter clones the template:

```typescript
class Document implements Prototype<Document> {
  constructor(
    public title: string,
    public sections: Section[],
    public styles: Map<string, string>
  ) {}

  clone(): Document {
    return new Document(
      this.title,
      this.sections.map(s => s.clone()),
      new Map(this.styles)
    );
  }
}

const businessLetter = new Document("Business Letter", [...], defaultStyles);
const myLetter = businessLetter.clone();
myLetter.title = "Q4 Report Cover Letter";
```

### 3. Configuration Presets

Applications often have default, development, staging, and production configurations.
Each is a clone of a base config with specific overrides:

```typescript
class AppConfig implements Prototype<AppConfig> {
  constructor(
    public dbHost: string,
    public dbPort: number,
    public features: Set<string>,
    public cache: { ttl: number; maxSize: number }
  ) {}

  clone(): AppConfig {
    return new AppConfig(
      this.dbHost,
      this.dbPort,
      new Set(this.features),
      { ...this.cache }
    );
  }
}

const baseConfig = new AppConfig("localhost", 5432, new Set(["auth"]), { ttl: 300, maxSize: 1000 });

const prodConfig = baseConfig.clone();
prodConfig.dbHost = "prod-db.internal";
prodConfig.features.add("analytics");
prodConfig.cache.ttl = 3600;
```

### 4. UI Component Libraries

Component libraries use prototype-like patterns where a base component configuration
is cloned and customized for each usage:

```typescript
class ButtonConfig implements Prototype<ButtonConfig> {
  constructor(
    public label: string,
    public color: string,
    public size: "sm" | "md" | "lg",
    public disabled: boolean,
    public handlers: Map<string, () => void>
  ) {}

  clone(): ButtonConfig {
    return new ButtonConfig(
      this.label,
      this.color,
      this.size,
      this.disabled,
      new Map(this.handlers)
    );
  }
}
```

---

## Relations with Other Patterns

- **Factory Method**: Uses inheritance; Prototype uses cloning. Prototype avoids the need
  for parallel class hierarchies of creators.
- **Abstract Factory**: Can use prototypes internally to create product families by
  cloning pre-configured objects.
- **Builder**: Constructs complex objects step-by-step; Prototype copies them in one shot.
  Can be combined: build once, clone many.
- **Singleton**: Prototype registries can be singletons. Prototypes themselves should NOT
  be singletons (the whole point is to create copies).
- **Memento**: Prototype can serve as a simpler alternative when you need to save/restore
  object state (clone = snapshot).
- **Composite/Decorator**: Complex composite trees benefit from Prototype -- clone the
  entire tree instead of rebuilding it.

---

## References

- [Refactoring.Guru: Prototype](https://refactoring.guru/design-patterns/prototype)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 3
- [MDN: structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [MDN: Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
