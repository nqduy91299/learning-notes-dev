# Bridge Pattern

## Table of Contents

- [Intent](#intent)
- [The Problem: Cartesian Product Explosion](#the-problem-cartesian-product-explosion)
- [The Solution](#the-solution)
- [Structure](#structure)
- [Bridge vs Adapter](#bridge-vs-adapter)
- [Implementation in TypeScript](#implementation-in-typescript)
- [When to Use](#when-to-use)
- [Pros and Cons](#pros-and-cons)
- [Real-World Examples](#real-world-examples)
- [Related Patterns](#related-patterns)
- [References](#references)

---

## Intent

**Bridge** is a structural design pattern that lets you split a large class or a set of
closely related classes into two separate hierarchies — **abstraction** and
**implementation** — which can be developed independently of each other.

The key idea: instead of combining every possible variant through inheritance (leading
to a combinatorial explosion of subclasses), you **compose** one hierarchy with
another at runtime via a reference (the "bridge").

---

## The Problem: Cartesian Product Explosion

Imagine you have a `Shape` class with subclasses `Circle` and `Square`. Now you want
to add colors — `Red` and `Blue`. Using inheritance alone you need:

```
Shape
├── RedCircle
├── BlueCircle
├── RedSquare
└── BlueSquare
```

That's `2 shapes × 2 colors = 4` classes. Add a `Triangle` → 6 classes. Add `Green`
→ 9 classes. The class count grows as the **Cartesian product** of the two dimensions.

This problem appears whenever a class varies along **two or more orthogonal
dimensions**:

| Dimension A     | Dimension B    | Without Bridge        |
| --------------- | -------------- | --------------------- |
| 3 shape types   | 4 colors       | 12 subclasses         |
| 3 UI frameworks | 3 OS platforms | 9 subclasses          |
| 4 message types | 3 channels     | 12 subclasses         |

With the Bridge pattern the count becomes `A + B` instead of `A × B`.

---

## The Solution

Extract one of the dimensions into a separate class hierarchy. The original class
holds a **reference** to an object from the new hierarchy and delegates work to it.

```
Shape (abstraction)             Color (implementation)
├── Circle                      ├── Red
├── Square                      ├── Blue
└── Triangle                    └── Green
```

A `Circle` doesn't know or care which `Color` it uses — it just calls
`this.color.fill()`. You can mix and match shapes and colors freely without creating
new subclasses.

The reference from `Shape` → `Color` is the **bridge**.

---

## Structure

```
┌─────────────────────┐         ┌─────────────────────────┐
│    Abstraction       │         │    Implementation        │
│─────────────────────│         │─────────────────────────│
│ - impl: Implementation│ ────▶ │ + operationImpl(): void  │
│ + operation(): void  │         └─────────────────────────┘
└─────────────────────┘                   ▲
         ▲                                │
         │                     ┌──────────┴──────────┐
┌────────┴────────┐    ┌───────┴───────┐  ┌──────────┴─────────┐
│ RefinedAbstraction│   │ ConcreteImplA │  │  ConcreteImplB     │
│─────────────────│    │───────────────│  │────────────────────│
│ + operation()   │    │ + operationImpl│  │ + operationImpl()  │
└─────────────────┘    └───────────────┘  └────────────────────┘
```

### Participants

1. **Abstraction** — High-level control layer. Holds a reference to an
   `Implementation` object and delegates low-level work to it.

2. **Refined Abstraction** — Extends the abstraction with additional control logic.
   Still delegates to the implementation via the shared interface.

3. **Implementation** (interface) — Declares the interface for all concrete
   implementations. The abstraction communicates with implementations only through
   methods declared here.

4. **Concrete Implementation** — Platform-specific code that fulfills the
   implementation interface.

5. **Client** — Links an abstraction with a concrete implementation, typically via
   constructor injection.

---

## Bridge vs Adapter

These two patterns are often confused because both involve delegation to another
object. The key differences:

| Aspect            | Bridge                                    | Adapter                                  |
| ----------------- | ----------------------------------------- | ---------------------------------------- |
| **Intent**        | Separate abstraction from implementation  | Make incompatible interfaces work together|
| **Timing**        | Designed **up-front** during architecture | Applied **after** to fix compatibility   |
| **Hierarchies**   | Two parallel hierarchies that evolve independently | Wraps one existing interface to match another |
| **Relationship**  | Abstraction *owns* implementation         | Adapter *wraps* adaptee                  |
| **Growth**        | Both sides can grow independently         | Usually one adapter per adaptee          |

**Rule of thumb:** Bridge is about *preventing* class explosion; Adapter is about
*fixing* interface mismatches after the fact.

A Bridge can internally use an Adapter if one of the concrete implementations needs
to wrap a legacy API.

---

## Implementation in TypeScript

### Step 1: Define the Implementation Interface

```typescript
interface Renderer {
  renderCircle(x: number, y: number, radius: number): string;
  renderRectangle(x: number, y: number, w: number, h: number): string;
}
```

### Step 2: Concrete Implementations

```typescript
class SVGRenderer implements Renderer {
  renderCircle(x: number, y: number, radius: number): string {
    return `<circle cx="${x}" cy="${y}" r="${radius}" />`;
  }
  renderRectangle(x: number, y: number, w: number, h: number): string {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" />`;
  }
}

class CanvasRenderer implements Renderer {
  renderCircle(x: number, y: number, radius: number): string {
    return `ctx.arc(${x}, ${y}, ${radius}, 0, Math.PI * 2)`;
  }
  renderRectangle(x: number, y: number, w: number, h: number): string {
    return `ctx.fillRect(${x}, ${y}, ${w}, ${h})`;
  }
}
```

### Step 3: Abstraction

```typescript
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
  abstract resize(factor: number): void;
}
```

### Step 4: Refined Abstractions

```typescript
class Circle extends Shape {
  constructor(
    renderer: Renderer,
    private x: number,
    private y: number,
    private radius: number
  ) {
    super(renderer);
  }

  draw(): string {
    return this.renderer.renderCircle(this.x, this.y, this.radius);
  }

  resize(factor: number): void {
    this.radius *= factor;
  }
}
```

### Step 5: Client Code

```typescript
const svgCircle = new Circle(new SVGRenderer(), 10, 10, 5);
console.log(svgCircle.draw());
// <circle cx="10" cy="10" r="5" />

const canvasCircle = new Circle(new CanvasRenderer(), 10, 10, 5);
console.log(canvasCircle.draw());
// ctx.arc(10, 10, 5, 0, Math.PI * 2)
```

### Key Implementation Notes

- The abstraction (`Shape`) doesn't import or know about concrete renderers.
- New renderers (WebGL, ASCII art) are added without touching any `Shape` subclass.
- New shapes are added without touching any `Renderer` implementation.
- Use **constructor injection** to pass the implementation — this makes dependencies
  explicit and testable.

---

## When to Use

1. **Orthogonal dimensions of variation** — When a class varies along two or more
   independent axes (e.g., platform + feature set, format + transport).

2. **Avoiding class explosion** — When inheritance would produce a Cartesian product
   of subclasses.

3. **Runtime switching** — When you need to swap implementations at runtime (e.g.,
   switching from a REST client to a GraphQL client).

4. **Hiding implementation details** — When clients should work with high-level
   abstractions without knowing platform-specific details.

5. **Parallel development** — When separate teams need to work on abstraction and
   implementation hierarchies independently.

---

## Pros and Cons

### Pros

- **Open/Closed Principle** — Add new abstractions and implementations independently
  without modifying existing code.
- **Single Responsibility** — Abstraction handles high-level logic; implementation
  handles platform details.
- **Platform independence** — Client code works only with abstractions.
- **Runtime flexibility** — Swap implementations at runtime.
- **Testability** — Easy to mock implementations for unit testing.

### Cons

- **Added complexity** — Introduces extra classes and indirection; overkill for
  classes that don't vary along multiple dimensions.
- **Over-engineering risk** — If there's only one implementation, the pattern adds
  unnecessary abstraction.
- **Indirection cost** — Slight runtime overhead from delegation (negligible in
  practice).

---

## Real-World Examples

### 1. UI Renderers (Cross-Platform Graphics)

```
Abstraction: UIComponent (Button, TextField, Slider)
Implementation: RenderEngine (WebRenderer, NativeRenderer, TerminalRenderer)
```

A `Button` delegates its rendering to whatever `RenderEngine` it receives. Adding a
new platform (e.g., TerminalRenderer) requires zero changes to `Button`.

```typescript
interface RenderEngine {
  drawButton(label: string): string;
  drawTextField(placeholder: string): string;
}

abstract class UIComponent {
  constructor(protected engine: RenderEngine) {}
  abstract render(): string;
}

class Button extends UIComponent {
  constructor(engine: RenderEngine, private label: string) {
    super(engine);
  }
  render(): string {
    return this.engine.drawButton(this.label);
  }
}
```

### 2. Notification System with Channels

```
Abstraction: Notification (UrgentNotification, RegularNotification)
Implementation: Channel (EmailChannel, SMSChannel, SlackChannel, PushChannel)
```

Different urgency levels format and repeat messages differently, while channels
handle the actual delivery mechanics.

```typescript
interface NotificationChannel {
  send(recipient: string, message: string): void;
}

class EmailChannel implements NotificationChannel {
  send(recipient: string, message: string): void {
    console.log(`Email to ${recipient}: ${message}`);
  }
}

class SMSChannel implements NotificationChannel {
  send(recipient: string, message: string): void {
    console.log(`SMS to ${recipient}: ${message}`);
  }
}

abstract class Notification {
  constructor(protected channel: NotificationChannel) {}
  abstract notify(recipient: string, message: string): void;
}

class UrgentNotification extends Notification {
  notify(recipient: string, message: string): void {
    this.channel.send(recipient, `[URGENT] ${message}`);
    this.channel.send(recipient, `[URGENT] Reminder: ${message}`);
  }
}
```

### 3. Device Remote Controls

The classic example from the GoF book: remote controls (abstraction) and devices
(implementation).

```typescript
interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(volume: number): void;
  getChannel(): number;
  setChannel(channel: number): void;
}

class RemoteControl {
  constructor(protected device: Device) {}

  togglePower(): void {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }

  volumeUp(): void {
    this.device.setVolume(this.device.getVolume() + 10);
  }

  volumeDown(): void {
    this.device.setVolume(this.device.getVolume() - 10);
  }
}

class AdvancedRemote extends RemoteControl {
  mute(): void {
    this.device.setVolume(0);
  }
}
```

A `TV` and `Radio` both implement `Device`. A `RemoteControl` and `AdvancedRemote`
work with any device. Adding a `Projector` device requires no changes to remotes;
adding a `VoiceRemote` requires no changes to devices.

---

## Related Patterns

- **Strategy** — Similar structure (composition + delegation), but Strategy varies
  *one algorithm* while Bridge separates *two entire hierarchies*.
- **Abstract Factory** — Can create matched sets of Bridge implementations.
- **Adapter** — Wraps an existing interface; Bridge designs parallel hierarchies from
  the start.
- **State** — Same structural shape as Bridge, but manages state transitions.
- **Composite** — Can be used on the abstraction side of a Bridge.

---

## References

- [Refactoring Guru — Bridge](https://refactoring.guru/design-patterns/bridge)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 4
- *Head First Design Patterns*, Chapter 9
