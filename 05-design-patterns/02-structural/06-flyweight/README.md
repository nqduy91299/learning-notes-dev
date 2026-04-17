# Flyweight Pattern

> **Reference**: [Refactoring.Guru - Flyweight](https://refactoring.guru/design-patterns/flyweight)

## Intent

**Flyweight** (also known as **Cache**) is a structural design pattern that lets you fit more
objects into the available amount of RAM by sharing common parts of state between multiple
objects instead of keeping all of the data in each object.

## Problem

Imagine you're building a game with a particle system — bullets, missiles, shrapnel.
Each particle is a separate object with fields like color, sprite, coordinates, speed,
and movement vector. When thousands of particles exist simultaneously, they consume
enormous amounts of memory, potentially crashing the application.

The key insight: many particles share identical color and sprite data. Storing duplicate
copies of this data across thousands of objects is wasteful.

## Solution

The Flyweight pattern separates object state into two categories:

### Intrinsic State (Shared)

- Data that remains constant across many objects
- Stored inside the flyweight object
- Immutable — initialized once via constructor
- Examples: color, sprite, texture, font family

### Extrinsic State (Unique)

- Data that varies between objects and changes over time
- Stored outside the flyweight, passed in as method parameters
- Examples: coordinates, speed, movement vector, position

```
Before Flyweight:
  Particle { color, sprite, x, y, speed, vector }  × 10,000 objects

After Flyweight:
  ParticleType { color, sprite }                    × 3 flyweight objects
  ParticleContext { x, y, speed, vector, type }     × 10,000 lightweight contexts
```

Instead of 10,000 objects each carrying heavy sprite data, you have 3 flyweight objects
shared across 10,000 tiny context objects.

## Flyweight Immutability

Since the same flyweight object is shared across many contexts, its state **must be
immutable**. A flyweight should:

- Initialize its state only via constructor parameters
- Never expose setters or mutable public fields
- Be safely shareable without side effects

## Flyweight Factory

A factory method manages the pool of existing flyweights:

1. Client requests a flyweight by passing intrinsic state
2. Factory checks if a matching flyweight already exists
3. If found, returns the existing one
4. If not, creates a new flyweight and adds it to the pool

This ensures flyweights are reused rather than duplicated.

## Structure

```
┌──────────────────────────────────────────────────────┐
│                     Client                            │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│               FlyweightFactory                        │
│  - cache: Map<string, Flyweight>                     │
│  + getFlyweight(sharedState): Flyweight              │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│                 Flyweight                             │
│  - intrinsicState (immutable, shared)                │
│  + operation(extrinsicState): void                   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  Context                              │
│  - extrinsicState (unique per instance)              │
│  - flyweight: Flyweight (reference)                  │
└──────────────────────────────────────────────────────┘
```

### Participants

1. **Flyweight** — contains the intrinsic (shared) state. Immutable. Can be used in
   many different contexts.

2. **Context** — contains the extrinsic (unique) state. Paired with a flyweight reference,
   it represents the full state of the original object.

3. **Flyweight Factory** — manages the pool of flyweights. Returns existing flyweights
   or creates new ones as needed.

4. **Client** — calculates or stores extrinsic state. Requests flyweights from the factory.

## Implementation in TypeScript

### Tree Rendering Example

```typescript
// Flyweight — shared intrinsic state
class TreeType {
  constructor(
    readonly name: string,
    readonly color: string,
    readonly texture: string
  ) {}

  draw(x: number, y: number): string {
    return `Draw ${this.name} (${this.color}) at (${x}, ${y})`;
  }
}

// Flyweight Factory
class TreeFactory {
  private static types = new Map<string, TreeType>();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}-${color}-${texture}`;
    if (!this.types.has(key)) {
      this.types.set(key, new TreeType(name, color, texture));
    }
    return this.types.get(key)!;
  }

  static getTypeCount(): number {
    return this.types.size;
  }
}

// Context — unique extrinsic state + flyweight reference
class Tree {
  private type: TreeType;

  constructor(
    readonly x: number,
    readonly y: number,
    name: string,
    color: string,
    texture: string
  ) {
    this.type = TreeFactory.getTreeType(name, color, texture);
  }

  draw(): string {
    return this.type.draw(this.x, this.y);
  }
}

// Client
class Forest {
  private trees: Tree[] = [];

  plantTree(x: number, y: number, name: string, color: string, texture: string): void {
    this.trees.push(new Tree(x, y, name, color, texture));
  }

  draw(): string[] {
    return this.trees.map(t => t.draw());
  }
}
```

### Character Rendering Example

```typescript
// Flyweight for text editor characters
class CharacterStyle {
  constructor(
    readonly font: string,
    readonly size: number,
    readonly color: string
  ) {}
}

class CharacterStyleFactory {
  private styles = new Map<string, CharacterStyle>();

  getStyle(font: string, size: number, color: string): CharacterStyle {
    const key = `${font}-${size}-${color}`;
    if (!this.styles.has(key)) {
      this.styles.set(key, new CharacterStyle(font, size, color));
    }
    return this.styles.get(key)!;
  }
}

// Context
interface CharacterContext {
  char: string;       // extrinsic: what character
  row: number;        // extrinsic: position
  col: number;        // extrinsic: position
  style: CharacterStyle; // flyweight reference
}
```

## Intrinsic vs Extrinsic State

| Aspect        | Intrinsic (Flyweight)            | Extrinsic (Context)              |
|---------------|----------------------------------|----------------------------------|
| **Sharing**   | Shared across many objects       | Unique to each object            |
| **Mutability**| Immutable                        | Can change                       |
| **Storage**   | Inside the flyweight             | Outside, passed as parameters    |
| **Examples**  | Color, texture, font, sprite     | Position, speed, ID, timestamp   |
| **Volume**    | Few variations                   | Many variations                  |
| **Size**      | Often large (images, textures)   | Often small (numbers, strings)   |

## When to Use

- Your application creates a huge number of similar objects
- The objects drain available RAM on the target device
- Objects contain duplicate state that can be extracted and shared
- Many groups of objects can be replaced by fewer shared objects once extrinsic state
  is extracted
- The application doesn't depend on object identity (flyweights are shared, so identity
  checks like `===` between conceptually different objects will return `true`)

## When NOT to Use

- You have a small number of objects — overhead of the pattern isn't worth it
- Objects don't share significant common state
- Object identity matters to your application
- The intrinsic/extrinsic split would make code unreasonably complex

## Pros and Cons

### Pros

- **Memory savings** — dramatically reduces RAM when many similar objects exist
- **Performance** — fewer objects means less GC pressure and faster iteration
- **Scalability** — enables handling orders of magnitude more objects

### Cons

- **CPU trade-off** — extrinsic state may need recalculation on each flyweight method call
- **Complexity** — splitting state into intrinsic/extrinsic is non-trivial
- **Readability** — new team members may find the separated state confusing
- **Thread safety** — shared flyweights need careful handling in concurrent environments

## Real-World Examples

### 1. Text Editor Characters

A document with 100,000 characters might use only 50 unique font/size/color combinations.
Instead of storing style data per character, a flyweight stores each unique style once.
Each character in the document holds its position (extrinsic) and a reference to its
style flyweight (intrinsic).

### 2. Game Particles

A game might render millions of particles (bullets, explosions, smoke). The particle
type (sprite, color, animation) is the flyweight. Position, velocity, and lifetime are
extrinsic state stored in lightweight context objects.

### 3. Tree/Forest Rendering

Rendering a forest with 1,000,000 trees. Each tree type (oak, pine, birch) has heavy
texture and model data. The flyweight stores this data once per type. Each tree instance
only stores its (x, y) coordinates and a reference to the type flyweight.

### 4. CSS Class Sharing in Browsers

Browsers internally use flyweight-like structures for CSS styles. When thousands of DOM
elements share the same computed style, the browser stores the style data once and shares
references. This is why changing a CSS class can instantly affect thousands of elements.

### 5. String Interning

Many languages (Java, Python, JavaScript for short strings) use string interning —
a flyweight technique where identical string literals share the same memory location
instead of creating duplicate copies.

## Relations with Other Patterns

- **Composite + Flyweight**: Shared leaf nodes of a Composite tree can be implemented
  as Flyweights to save memory
- **Flyweight vs Facade**: Flyweight makes many small shared objects; Facade makes one
  object representing an entire subsystem
- **Flyweight vs Singleton**: Both involve shared objects, but Singleton has exactly one
  instance while Flyweight can have multiple instances with different intrinsic states.
  Singleton is mutable; Flyweight is immutable.

## Key Takeaways

1. Flyweight separates state into intrinsic (shared, immutable) and extrinsic (unique, mutable)
2. A factory ensures flyweights are reused, not duplicated
3. The pattern trades code complexity for memory savings
4. Only use it when you have a genuine RAM consumption problem with many similar objects
5. Flyweights must be immutable to be safely shared

## Further Reading

- [Refactoring.Guru - Flyweight](https://refactoring.guru/design-patterns/flyweight)
- *Design Patterns: Elements of Reusable Object-Oriented Software* — GoF
- *Head First Design Patterns* — Freeman & Robson
