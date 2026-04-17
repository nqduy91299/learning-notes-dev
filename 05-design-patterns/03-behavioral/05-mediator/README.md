# Mediator Pattern

> **Reference**: [Refactoring.Guru - Mediator](https://refactoring.guru/design-patterns/mediator)

## Intent

**Mediator** is a behavioral design pattern that reduces chaotic dependencies
between objects. The pattern restricts direct communications between objects and
forces them to collaborate only via a **mediator** object.

Also known as: **Intermediary**, **Controller**.

## The Problem: N-to-N Dependencies

Imagine a dialog with text fields, checkboxes, buttons, and dropdowns. Without
a mediator, each UI component must know about every other component it interacts
with. Selecting a checkbox might show/hide a text field, changing a dropdown
might enable/disable a button, and submitting might validate all fields.

This creates an **n-to-n dependency graph** where:

- Components are tightly coupled to each other.
- Reusing a single component in another context is impossible (it drags along
  all its dependencies).
- Adding a new component requires modifying many existing ones.
- Testing individual components becomes difficult.

```
Before Mediator:

  Button ←──→ Checkbox
    ↕              ↕
  TextBox ←──→ Dropdown
    ↕              ↕
  Label  ←──→ Validator

  Every component knows about every other = O(n^2) couplings
```

## The Solution

Extract all inter-component communication into a single **mediator** object.
Components only know about the mediator (via an interface), not each other.

```
After Mediator:

  Button ──→ Mediator ←── Checkbox
  TextBox ──→ Mediator ←── Dropdown
  Label   ──→ Mediator ←── Validator

  Every component knows only the Mediator = O(n) couplings
```

## Structure

```
 ┌────────────────────┐          ┌─────────────────────┐
 │  <<interface>>      │          │  <<interface>>       │
 │  Mediator           │          │  Component           │
 ├────────────────────┤          ├─────────────────────┤
 │ notify(sender,      │          │ - mediator: Mediator │
 │   event): void      │          │ + setMediator(): void│
 └────────┬───────────┘          └──────────┬──────────┘
          │ implements                      │ extends
 ┌────────▼───────────┐          ┌──────────▼──────────┐
 │ ConcreteMediator    │◄────────│ ConcreteComponentA   │
 │                     │         ├─────────────────────┤
 │ - componentA        │         │ + operationA()       │
 │ - componentB        │         └─────────────────────┘
 │ - componentC        │         ┌─────────────────────┐
 │                     │◄────────│ ConcreteComponentB   │
 │ + notify()          │         ├─────────────────────┤
 │ + registerComponent │         │ + operationB()       │
 └─────────────────────┘         └─────────────────────┘
```

### Participants

| Role                  | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| **Mediator**          | Interface declaring the `notify(sender, event)` method        |
| **ConcreteMediator**  | Coordinates components; contains the interaction logic        |
| **Component (Colleague)** | Base class with a mediator reference                     |
| **ConcreteComponent** | Performs its work, notifies the mediator of relevant events    |

## Implementation in TypeScript

### Step 1 -- Mediator Interface

```typescript
interface Mediator {
  notify(sender: Component, event: string): void;
}
```

### Step 2 -- Base Component

```typescript
abstract class Component {
  protected mediator: Mediator | null = null;

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }
}
```

### Step 3 -- Concrete Components

```typescript
class Button extends Component {
  click(): void {
    console.log("Button clicked");
    this.mediator?.notify(this, "click");
  }
}

class TextInput extends Component {
  value = "";

  change(newValue: string): void {
    this.value = newValue;
    console.log(`TextInput changed: ${newValue}`);
    this.mediator?.notify(this, "change");
  }
}

class Checkbox extends Component {
  checked = false;

  toggle(): void {
    this.checked = !this.checked;
    console.log(`Checkbox toggled: ${this.checked}`);
    this.mediator?.notify(this, "toggle");
  }
}
```

### Step 4 -- Concrete Mediator

```typescript
class FormMediator implements Mediator {
  constructor(
    private button: Button,
    private input: TextInput,
    private checkbox: Checkbox
  ) {
    button.setMediator(this);
    input.setMediator(this);
    checkbox.setMediator(this);
  }

  notify(sender: Component, event: string): void {
    if (sender instanceof Checkbox && event === "toggle") {
      // When checkbox is toggled, enable/disable input
      console.log("Mediator reacts to checkbox toggle");
    }
    if (sender instanceof Button && event === "click") {
      // When button clicked, validate input
      console.log("Mediator reacts to button click, validates form");
    }
    if (sender instanceof TextInput && event === "change") {
      // When input changes, update button state
      console.log("Mediator reacts to input change");
    }
  }
}
```

## Mediator vs. Observer

| Aspect            | Mediator                                   | Observer                                   |
| ----------------- | ------------------------------------------ | ------------------------------------------ |
| **Direction**     | Bidirectional coordination                 | One-way notification (pub/sub)             |
| **Awareness**     | Components unaware of each other           | Subscribers unaware of other subscribers   |
| **Central point** | Single mediator orchestrates all           | No central coordinator                     |
| **Coupling**      | Components coupled to mediator interface   | Subjects coupled to observer interface     |
| **Use case**      | Complex form dialogs, chat rooms           | Event systems, reactive data binding       |

A common **hybrid** approach: implement the Mediator using the Observer pattern
internally. The mediator subscribes to component events and orchestrates
responses.

## When to Use

- **Tightly coupled components**: Multiple objects communicate in complex ways,
  and the resulting dependencies are hard to understand or maintain.
- **Reusability**: You want to reuse a component in a different context, but it
  depends on too many other components.
- **God class risk**: You have a class that orchestrates many other classes --
  extracting a mediator makes the coordination explicit.
- **Form/dialog coordination**: UI elements that interact based on each other's
  state.

## When NOT to Use

- Only two objects communicate -- direct communication is simpler.
- The coordination logic is trivial (a simple callback suffices).
- You risk creating a **God Object** mediator that becomes overly complex.

## Pros and Cons

### Pros

| Benefit                   | Explanation                                          |
| ------------------------- | ---------------------------------------------------- |
| Single Responsibility     | Communication logic centralized in one place         |
| Open/Closed               | New mediators without changing components             |
| Reduced coupling          | Components depend only on the mediator interface     |
| Reusability               | Components can be reused with different mediators    |
| Easier testing            | Test components in isolation with mock mediators     |

### Cons

| Drawback          | Explanation                                                    |
| ----------------- | -------------------------------------------------------------- |
| God Object risk   | Mediator can grow into an overly complex orchestrator          |
| Indirection       | Harder to trace execution flow through the mediator            |
| Single point      | Mediator becomes a single point of failure/complexity          |

## Real-World Examples

### Chat Rooms
Users don't send messages directly to each other. The chat room (mediator)
receives messages and broadcasts them to participants. Adding a new user doesn't
require modifying existing user classes.

### Air Traffic Control
Aircraft communicate with the control tower (mediator), not with each other.
The tower coordinates landing sequences, runway assignments, and spacing.

### Form Validation
A dialog mediator coordinates text fields, dropdowns, checkboxes, and submit
buttons. When one field changes, the mediator decides which other fields to
validate, enable, or update.

### Dialog Boxes
GUI frameworks like Java Swing's `JDialog` or .NET's `Form` act as mediators
for their child controls, handling cross-control interactions.

### Express.js Middleware
The middleware pipeline in Express acts as a mediator between the request and
various handlers (authentication, logging, validation, routing).

### Event Bus / Message Broker
Systems like RabbitMQ, Kafka, or an in-app event bus mediate between producers
and consumers, decoupling them completely.

## Relations with Other Patterns

| Pattern             | Relationship                                               |
| ------------------- | ---------------------------------------------------------- |
| **Observer**        | Mediator often implemented using Observer internally       |
| **Facade**          | Both organize collaboration; Facade is one-directional     |
| **Command**         | Commands can be routed through a Mediator                  |
| **Chain of Resp.**  | Both decouple senders/receivers but in different ways      |

## Key Takeaways

1. Mediator **centralizes** complex communications between multiple objects.
2. Components become **independently reusable** since they only depend on the
   mediator interface.
3. Watch out for the **God Object** anti-pattern -- split large mediators into
   smaller, focused ones.
4. The pattern is especially valuable in **UI coordination** scenarios.
5. TypeScript's type system helps enforce that components only communicate
   through the mediator interface.
