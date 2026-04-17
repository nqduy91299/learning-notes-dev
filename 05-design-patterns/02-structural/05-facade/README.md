# Facade Pattern

> **Reference**: [Refactoring.Guru - Facade](https://refactoring.guru/design-patterns/facade)

## Intent

**Facade** is a structural design pattern that provides a simplified interface to a library,
a framework, or any other complex set of classes. It wraps a complicated subsystem with a
simpler interface, reducing the learning curve and decoupling client code from subsystem internals.

## Problem

When working with a complex subsystem — a sophisticated library, framework, or set of
interrelated classes — you must typically:

- Initialize many objects in the correct order
- Track dependencies between components
- Execute methods with specific parameters and sequences
- Handle configuration and lifecycle management

This couples your business logic tightly to third-party implementation details, making code
hard to understand, test, and maintain.

## Solution

A **Facade** provides a simple, high-level interface that delegates work to the appropriate
subsystem objects. The facade knows which subsystem classes are responsible for a request
and orchestrates them behind a clean API.

```
Client  --->  Facade  --->  SubsystemA
                       --->  SubsystemB
                       --->  SubsystemC
```

The facade doesn't replace the subsystem — clients can still use subsystem classes directly
when they need fine-grained control. The facade simply offers a convenient shortcut for
common operations.

## Structure

```
┌─────────────────────────────────────────────────┐
│                    Client                        │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                    Facade                        │
│  - subsystemA: SubsystemA                       │
│  - subsystemB: SubsystemB                       │
│  - subsystemC: SubsystemC                       │
│                                                 │
│  + operation(): void                            │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
       ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ SubsystemA │ │ SubsystemB │ │ SubsystemC │
│ + methodA()│ │ + methodB()│ │ + methodC()│
└────────────┘ └────────────┘ └────────────┘
```

### Participants

1. **Facade** — provides convenient access to a particular part of the subsystem's
   functionality. Knows where to direct requests and how to operate subsystem components.

2. **Additional Facade** — optional; prevents a single facade from becoming bloated with
   unrelated features. Can be used by clients and other facades.

3. **Subsystem Classes** — implement detailed functionality. Unaware of the facade's
   existence. Operate within the subsystem and work with each other directly.

4. **Client** — uses the facade instead of calling subsystem objects directly.

## Implementation in TypeScript

### Basic Facade

```typescript
// Subsystem classes
class AudioPlayer {
  turnOn(): string { return "Audio: ON"; }
  setVolume(level: number): string { return `Audio: volume ${level}`; }
  turnOff(): string { return "Audio: OFF"; }
}

class VideoProjector {
  turnOn(): string { return "Projector: ON"; }
  setInput(source: string): string { return `Projector: input ${source}`; }
  turnOff(): string { return "Projector: OFF"; }
}

class StreamingService {
  connect(): string { return "Streaming: connected"; }
  play(title: string): string { return `Streaming: playing "${title}"`; }
  disconnect(): string { return "Streaming: disconnected"; }
}

// Facade
class HomeTheaterFacade {
  constructor(
    private audio: AudioPlayer,
    private projector: VideoProjector,
    private streaming: StreamingService
  ) {}

  watchMovie(title: string): string[] {
    const log: string[] = [];
    log.push(this.audio.turnOn());
    log.push(this.audio.setVolume(8));
    log.push(this.projector.turnOn());
    log.push(this.projector.setInput("HDMI-1"));
    log.push(this.streaming.connect());
    log.push(this.streaming.play(title));
    return log;
  }

  endMovie(): string[] {
    const log: string[] = [];
    log.push(this.streaming.disconnect());
    log.push(this.projector.turnOff());
    log.push(this.audio.turnOff());
    return log;
  }
}

// Usage
const facade = new HomeTheaterFacade(
  new AudioPlayer(),
  new VideoProjector(),
  new StreamingService()
);
facade.watchMovie("Inception");
facade.endMovie();
```

### Facade with Optional Direct Access

```typescript
class ApiFacade {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUser(id: number): Promise<unknown> {
    // Simplified interface — hides headers, error handling, parsing
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    if (!response.ok) throw new Error(`User ${id} not found`);
    return response.json();
  }

  // Clients can still access baseUrl for custom requests
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
```

## Facade vs Adapter

| Aspect          | Facade                              | Adapter                            |
|-----------------|-------------------------------------|------------------------------------|
| **Purpose**     | Simplify a complex subsystem        | Make incompatible interfaces work  |
| **Scope**       | Wraps an entire subsystem           | Wraps a single object typically    |
| **Interface**   | Defines a new, simpler interface    | Converts to an existing interface  |
| **Awareness**   | Subsystem unaware of facade         | Adaptee unaware of adapter         |
| **Direction**   | Simplification                      | Compatibility                      |

**Facade** creates a new simplified interface. **Adapter** makes an existing interface
compatible with what the client expects. They can be combined — a facade might use
adapters internally to normalize subsystem interfaces.

## When to Use

- You need a simple interface to a complex subsystem
- You want to layer a subsystem — facades define entry points to each level
- You want to decouple client code from subsystem implementation details
- You want to reduce the number of objects clients interact with
- You're wrapping a third-party library and want to isolate your code from API changes

## When NOT to Use

- The subsystem is already simple — adding a facade adds unnecessary indirection
- Clients need full access to all subsystem features — the facade would just be a pass-through
- You're trying to hide bad design instead of fixing it

## Pros and Cons

### Pros

- **Isolation** — isolates client code from subsystem complexity
- **Loose coupling** — changes in subsystem internals don't affect clients
- **Simplified API** — reduces the learning curve for using a complex subsystem
- **Layered architecture** — enables structuring subsystems into layers
- **Single entry point** — easier to audit, log, and control access

### Cons

- **God object risk** — a facade can become a god object coupled to everything
- **Limited flexibility** — clients may need features the facade doesn't expose
- **Maintenance burden** — facade must be updated when subsystem changes
- **False simplicity** — may hide important details that clients should understand

## Real-World Examples

### 1. Home Theater System

A home theater involves a receiver, projector, speakers, streaming device, and lighting.
A `HomeTheaterFacade` provides `watchMovie()` and `endMovie()` methods that coordinate
all devices — turning them on/off in the right order, setting inputs, adjusting volume.

### 2. API Facade

A frontend application interacts with multiple microservices (auth, users, products, orders).
An `ApiFacade` provides methods like `getUserDashboard()` that internally calls multiple
services, aggregates data, and returns a unified response. This is essentially the
**Backend for Frontend (BFF)** pattern.

### 3. Complex Library Wrapper

A video conversion library has dozens of classes: codecs, bitrate readers, audio mixers,
file handlers. A `VideoConverter` facade exposes a single `convert(filename, format)` method
that initializes the right codec, reads bitrates, mixes audio, and returns the result.

### 4. Database Facade

ORMs like TypeORM or Prisma act as facades over raw SQL. Instead of writing complex JOIN
queries, managing connections, and handling transactions manually, you call methods like
`user.findOne({ where: { id: 1 }, relations: ["posts"] })`.

### 5. jQuery as a Facade

jQuery was essentially a facade over the inconsistent browser DOM APIs. Instead of dealing
with `document.getElementById`, `attachEvent` vs `addEventListener`, and cross-browser
quirks, you used `$('#id').on('click', handler)`.

## Relations with Other Patterns

- **Facade vs Adapter**: Facade defines a new interface; Adapter reuses an existing one
- **Facade vs Mediator**: Both organize collaboration. Facade simplifies a subsystem's
  interface without adding new functionality. Mediator centralizes communication between
  components.
- **Abstract Factory**: Can serve as an alternative to Facade when you only want to hide
  how subsystem objects are created
- **Singleton**: A facade often needs only one instance, making it a natural Singleton
- **Proxy**: Similar to Facade in that both buffer a complex entity, but Proxy has the
  same interface as its service object

## Key Takeaways

1. Facade provides a simplified interface to a complex subsystem
2. It doesn't prevent direct subsystem access — it's a convenience layer
3. It reduces coupling between client code and subsystem internals
4. Watch out for god-object anti-pattern — split into multiple facades if needed
5. Common in real-world code: ORMs, API clients, SDK wrappers, framework abstractions

## Further Reading

- [Refactoring.Guru - Facade](https://refactoring.guru/design-patterns/facade)
- *Design Patterns: Elements of Reusable Object-Oriented Software* — GoF
- *Head First Design Patterns* — Freeman & Robson
