# State Pattern

> **Reference**: [Refactoring.Guru - State](https://refactoring.guru/design-patterns/state)

## Intent

**State** is a behavioral design pattern that lets an object alter its behavior
when its internal state changes. It appears as if the object changed its class.

The pattern is closely related to the concept of a **Finite-State Machine** (FSM).

## The Problem: Conditional State Logic

Consider a `Document` class that can be in states: `Draft`, `Moderation`, and
`Published`. The `publish()` method behaves differently in each state:

- **Draft**: moves to Moderation.
- **Moderation**: moves to Published (admin only).
- **Published**: does nothing.

The naive approach uses conditionals:

```typescript
// Anti-pattern: conditional state logic
class Document {
  state: "draft" | "moderation" | "published" = "draft";

  publish(currentUser: { role: string }): void {
    switch (this.state) {
      case "draft":
        this.state = "moderation";
        break;
      case "moderation":
        if (currentUser.role === "admin") {
          this.state = "published";
        }
        break;
      case "published":
        // do nothing
        break;
    }
  }
}
```

Problems with this approach:

- **Every method** that depends on state gets a `switch`/`if` block.
- Adding a new state requires modifying **every** state-dependent method.
- The class grows into a **monolithic mess** as states and transitions multiply.
- Violates the **Open/Closed Principle**.

## The Solution

1. Create a **State interface** declaring all state-dependent methods.
2. Create **ConcreteState classes** for each state, implementing behavior.
3. The **Context** holds a reference to the current state and delegates work.
4. States can trigger **transitions** by replacing the context's state object.

## Structure

```
 ┌─────────────────────┐       ┌─────────────────────┐
 │      Context         │       │   <<interface>>      │
 ├─────────────────────┤       │   State              │
 │ - state: State       │──────>├─────────────────────┤
 │                      │       │ + handle(ctx): void  │
 │ + setState(s): void  │       │ + toString(): string │
 │ + request(): void    │       └──────────┬──────────┘
 └─────────────────────┘                  │
                                 ┌────────┴────────┐
                           ┌─────▼─────┐    ┌──────▼──────┐
                           │ConcreteA   │    │ ConcreteB   │
                           │            │    │             │
                           │ + handle() │    │ + handle()  │
                           └────────────┘    └─────────────┘
```

### Participants

| Role              | Description                                            |
| ----------------- | ------------------------------------------------------ |
| **Context**       | Maintains a reference to a ConcreteState; delegates     |
| **State**         | Interface declaring state-dependent methods             |
| **ConcreteState** | Implements behavior for a specific state of the Context |

## State Transitions

States can be changed by:

1. **The Context itself** -- based on some business logic.
2. **The ConcreteState** -- a state decides the next state (most common).
3. **External code** -- the client explicitly sets the state.

### Transition Table Example

| Current State | Action        | Next State   | Condition   |
| ------------- | ------------- | ------------ | ----------- |
| Draft         | publish()     | Moderation   | --          |
| Moderation    | publish()     | Published    | isAdmin     |
| Moderation    | reject()      | Draft        | --          |
| Published     | unpublish()   | Draft        | --          |

## Implementation in TypeScript

### Step 1 -- State Interface

```typescript
interface DocumentState {
  publish(doc: DocumentContext): void;
  reject(doc: DocumentContext): void;
  getName(): string;
}
```

### Step 2 -- Context

```typescript
class DocumentContext {
  private state: DocumentState;

  constructor(initialState: DocumentState) {
    this.state = initialState;
  }

  setState(state: DocumentState): void {
    console.log(`Transition: ${this.state.getName()} -> ${state.getName()}`);
    this.state = state;
  }

  getStateName(): string {
    return this.state.getName();
  }

  publish(): void {
    this.state.publish(this);
  }

  reject(): void {
    this.state.reject(this);
  }
}
```

### Step 3 -- Concrete States

```typescript
class DraftState implements DocumentState {
  publish(doc: DocumentContext): void {
    doc.setState(new ModerationState());
  }
  reject(doc: DocumentContext): void {
    console.log("Draft cannot be rejected.");
  }
  getName(): string {
    return "Draft";
  }
}

class ModerationState implements DocumentState {
  publish(doc: DocumentContext): void {
    // In real code, check user role
    doc.setState(new PublishedState());
  }
  reject(doc: DocumentContext): void {
    doc.setState(new DraftState());
  }
  getName(): string {
    return "Moderation";
  }
}

class PublishedState implements DocumentState {
  publish(doc: DocumentContext): void {
    console.log("Already published.");
  }
  reject(doc: DocumentContext): void {
    doc.setState(new DraftState());
  }
  getName(): string {
    return "Published";
  }
}
```

### Usage

```typescript
const doc = new DocumentContext(new DraftState());
doc.publish();  // Draft -> Moderation
doc.publish();  // Moderation -> Published
doc.publish();  // "Already published."
doc.reject();   // Published -> Draft
```

## State vs. Strategy

| Aspect              | State                                  | Strategy                              |
| ------------------- | -------------------------------------- | ------------------------------------- |
| **Awareness**       | States may know about each other       | Strategies are independent            |
| **Transitions**     | States trigger transitions themselves  | Client selects the strategy           |
| **Purpose**         | Model FSM behavior changes             | Select an algorithm at runtime        |
| **State changes**   | Implicit (driven by state logic)       | Explicit (driven by client)           |
| **Structure**       | Identical class diagram                | Identical class diagram               |

The key difference: in State, the **concrete states decide** the next state. In
Strategy, the **client decides** which algorithm to use.

## When to Use

- An object's behavior depends on its state and must change at runtime.
- Methods contain **large conditionals** that depend on the object's state.
- There are many states with distinct behavior (more than 3-4 states).
- State transition logic is complex and would clutter the main class.
- You want to apply the **Open/Closed Principle** to state-dependent behavior.

## When NOT to Use

- The object has only 2-3 simple states with trivial transitions.
- State-dependent behavior is limited to one or two methods.
- The overhead of multiple classes outweighs the complexity of conditionals.

## Pros and Cons

### Pros

| Benefit                   | Explanation                                          |
| ------------------------- | ---------------------------------------------------- |
| Single Responsibility     | Each state's logic is in its own class               |
| Open/Closed               | Add new states without modifying existing ones        |
| Eliminates conditionals   | No more giant switch/if blocks                       |
| Explicit transitions      | State machine logic is clear and traceable           |
| Encapsulation             | State-specific data stays in the state class         |

### Cons

| Drawback              | Explanation                                            |
| --------------------- | ------------------------------------------------------ |
| Class explosion       | Many states = many classes                             |
| Overkill for simple   | Few states don't justify the pattern overhead          |
| Transition complexity | Who owns transitions (context vs. state) can confuse   |

## Real-World Examples

### Media Player
States: `Stopped`, `Playing`, `Paused`. Each state handles `play()`, `pause()`,
`stop()` differently. Pressing play while paused resumes; pressing play while
playing does nothing.

### Order Status
States: `Pending`, `Paid`, `Shipped`, `Delivered`, `Cancelled`. Each state
defines which transitions are valid. A `Delivered` order cannot be `Shipped`
again.

### Traffic Light
States: `Red`, `Yellow`, `Green`. Each state knows which state comes next and
how long to wait. The controller (context) simply delegates to the current state.

### Document Workflow
States: `Draft`, `Review`, `Approved`, `Published`, `Archived`. Different user
roles trigger different transitions. A reviewer can approve or reject; only an
admin can archive.

### TCP Connection
States: `Listen`, `SynSent`, `SynReceived`, `Established`, `FinWait`, `Closed`.
The classic GoF example. Each state handles `open()`, `close()`, `acknowledge()`
differently.

### Game Character
States: `Idle`, `Walking`, `Running`, `Jumping`, `Attacking`. Each state defines
which animations play, which inputs are accepted, and which transitions are
valid.

### Vending Machine
States: `Idle`, `HasCoin`, `Dispensing`, `OutOfStock`. Inserting a coin in
`Idle` transitions to `HasCoin`. Selecting a product in `HasCoin` transitions to
`Dispensing`.

## Relations with Other Patterns

| Pattern        | Relationship                                                    |
| -------------- | --------------------------------------------------------------- |
| **Strategy**   | Same structure; State allows transitions between states         |
| **Bridge**     | Similar delegation; Bridge separates abstraction/implementation |
| **Flyweight**  | State objects can be shared if they have no intrinsic state     |
| **Singleton**  | Concrete states are often singletons                            |

## Key Takeaways

1. State pattern **replaces conditionals** with polymorphism.
2. Each state class encapsulates **behavior + transition logic** for that state.
3. The Context **delegates** all state-dependent work to the current state.
4. States can be **shared** (flyweight) if they carry no instance-specific data.
5. TypeScript interfaces enforce that all states implement the required methods.
6. The pattern maps directly to **Finite-State Machines** -- consider drawing a
   state diagram before implementing.
