# Observer Pattern

## Intent

The **Observer** pattern is a behavioral design pattern that defines a one-to-many dependency
between objects so that when one object (the **subject/publisher**) changes state, all its
dependents (the **observers/subscribers**) are notified and updated automatically.

It is also known as **Event-Subscriber** or **Listener**.

---

## The Problem: Why Do We Need Observer?

### The Polling Problem

Imagine an e-commerce app where a `Store` stocks products and `Customer` objects want to
know when a specific product becomes available.

**Naive approach 1 — Polling:**
Each customer repeatedly checks the store:

```typescript
// Customer polls the store every few seconds
while (!store.hasProduct("iPhone 16")) {
  await sleep(5000);
}
```

This wastes CPU cycles. Most checks return nothing useful.

**Naive approach 2 — Push to everyone:**
The store notifies ALL customers whenever ANY product arrives. Customers who don't care
about that product receive spam.

### The Subscription Mechanism

The Observer pattern solves this by letting objects **subscribe** to events they care about:

1. The publisher maintains a list of subscribers.
2. Subscribers register/unregister themselves dynamically.
3. When state changes, only registered subscribers are notified.

This is exactly how newspaper subscriptions work: you subscribe, you get issues delivered,
you unsubscribe when you're done.

---

## Structure

```
┌─────────────────────────────┐
│       <<interface>>         │
│          Subject            │
├─────────────────────────────┤
│ + subscribe(observer)       │
│ + unsubscribe(observer)     │
│ + notify()                  │
└──────────────┬──────────────┘
               │
    ┌──────────┴──────────┐
    │   ConcreteSubject   │
    ├─────────────────────┤
    │ - state             │
    │ - observers: []     │
    ├─────────────────────┤
    │ + getState()        │
    │ + setState()        │
    │ + notify()          │
    └─────────┬───────────┘
              │ notifies
              ▼
┌─────────────────────────────┐
│       <<interface>>         │
│         Observer            │
├─────────────────────────────┤
│ + update(subject)           │
└──────────────┬──────────────┘
               │
    ┌──────────┴──────────┐
    │  ConcreteObserver    │
    ├──────────────────────┤
    │ + update(subject)    │
    └──────────────────────┘
```

### Participants

| Role                | Responsibility                                               |
|---------------------|--------------------------------------------------------------|
| **Subject**         | Knows its observers. Provides attach/detach/notify methods.  |
| **ConcreteSubject** | Stores state. Sends notification when state changes.         |
| **Observer**        | Defines an update interface for objects that should be notified. |
| **ConcreteObserver**| Implements the update interface to keep its state consistent.|

---

## Push vs Pull Model

There are two fundamental approaches to passing data from subject to observer:

### Push Model

The subject sends detailed information about the change directly in the notification:

```typescript
interface Observer {
  update(event: string, data: EventData): void;
}

class Subject {
  notify(event: string, data: EventData): void {
    for (const obs of this.observers) {
      obs.update(event, data); // pushes data to observer
    }
  }
}
```

**Pros:**
- Observer gets exactly what it needs in one call.
- Simpler observer implementation.

**Cons:**
- Subject must know what data observers need.
- If different observers need different data, the push payload grows.

### Pull Model

The subject sends a minimal notification; observers pull the data they need:

```typescript
interface Observer {
  update(subject: Subject): void;
}

class ConcreteObserver implements Observer {
  update(subject: Subject): void {
    // Observer pulls only the data it cares about
    const value = subject.getState();
  }
}
```

**Pros:**
- Subject is decoupled from what observers need.
- Each observer fetches only relevant data.

**Cons:**
- Requires the subject to expose getters.
- Multiple observers may redundantly query the same data.

### Hybrid (Most Common in Practice)

Pass the event type and the subject reference, letting observers choose:

```typescript
interface Observer<T> {
  update(subject: T, event: string): void;
}
```

---

## Implementation in TypeScript

### Basic Generic Observer

```typescript
interface Observer<T> {
  update(subject: T, event: string, data?: unknown): void;
}

interface Subject<T> {
  subscribe(event: string, observer: Observer<T>): void;
  unsubscribe(event: string, observer: Observer<T>): void;
  notify(event: string, data?: unknown): void;
}

class EventManager<T> implements Subject<T> {
  private listeners = new Map<string, Set<Observer<T>>>();

  subscribe(event: string, observer: Observer<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(observer);
  }

  unsubscribe(event: string, observer: Observer<T>): void {
    this.listeners.get(event)?.delete(observer);
  }

  notify(event: string, data?: unknown): void {
    const subscribers = this.listeners.get(event);
    if (subscribers) {
      for (const observer of subscribers) {
        observer.update(this as unknown as T, event, data);
      }
    }
  }
}
```

### Typed Event Map Pattern

A more TypeScript-idiomatic approach uses a typed event map:

```typescript
type EventMap = {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  error: { code: number; message: string };
};

type Listener<T> = (data: T) => void;

class TypedEventEmitter<E extends Record<string, unknown>> {
  private listeners = new Map<keyof E, Set<Listener<E[keyof E]>>>();

  on<K extends keyof E>(event: K, listener: Listener<E[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    (this.listeners.get(event)! as Set<Listener<E[K]>>).add(listener);
  }

  off<K extends keyof E>(event: K, listener: Listener<E[K]>): void {
    (this.listeners.get(event) as Set<Listener<E[K]>> | undefined)?.delete(listener);
  }

  emit<K extends keyof E>(event: K, data: E[K]): void {
    const set = this.listeners.get(event) as Set<Listener<E[K]>> | undefined;
    if (set) {
      for (const listener of set) {
        listener(data);
      }
    }
  }
}
```

### Function-Based Observers

In modern TypeScript, you often don't need an `Observer` interface at all. Functions
work as observers directly:

```typescript
class SimpleSubject<T> {
  private listeners = new Set<(value: T) => void>();

  subscribe(fn: (value: T) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn); // returns unsubscribe function
  }

  notify(value: T): void {
    for (const fn of this.listeners) {
      fn(value);
    }
  }
}

// Usage
const subject = new SimpleSubject<number>();
const unsub = subject.subscribe((n) => console.log(`Got: ${n}`));
subject.notify(42); // Got: 42
unsub();            // unsubscribed
subject.notify(99); // nothing happens
```

---

## Connection to Node.js EventEmitter

Node.js `EventEmitter` is a built-in implementation of the Observer pattern:

```typescript
import { EventEmitter } from "node:events";

const emitter = new EventEmitter();

// subscribe
emitter.on("data", (payload: string) => {
  console.log(`Received: ${payload}`);
});

// one-time observer
emitter.once("init", () => {
  console.log("Initialized");
});

// notify
emitter.emit("data", "hello");
emitter.emit("init");
```

Key differences from a textbook Observer:
- Uses string event names (loosely typed without wrappers).
- Supports `once()` for one-shot listeners.
- Has `removeAllListeners()` for bulk cleanup.
- Returns `this` for chaining.
- Has a `maxListeners` warning to catch memory leaks.

The DOM `addEventListener` / `removeEventListener` API is the same pattern in browsers.

---

## When to Use

1. **When changes to one object require changing others**, and you don't know how many
   objects need to change or which ones.

2. **When an object should notify other objects without making assumptions** about who
   those objects are (loose coupling).

3. **When you need a dynamic subscription model** — objects can start/stop observing
   at runtime.

4. **When implementing event-driven architectures** — UI frameworks, message brokers,
   real-time systems.

5. **When you want to decouple a core module from peripheral features** — logging,
   analytics, caching can observe without the core knowing about them.

---

## Pros and Cons

### Pros

| Advantage                         | Explanation                                               |
|-----------------------------------|-----------------------------------------------------------|
| **Open/Closed Principle**         | Add new subscribers without modifying the publisher.      |
| **Loose coupling**                | Subject and observers interact through an interface only. |
| **Dynamic relationships**         | Observers can attach/detach at runtime.                   |
| **Broadcast communication**       | One notification reaches all interested parties.          |
| **Separation of concerns**        | Business logic stays in the subject; reaction logic in observers. |

### Cons

| Disadvantage                      | Explanation                                               |
|-----------------------------------|-----------------------------------------------------------|
| **Notification order undefined**  | Subscribers are notified in insertion order (usually), but you shouldn't rely on it. |
| **Memory leaks**                  | Forgetting to unsubscribe keeps references alive (lapsed listener problem). |
| **Cascade updates**               | An observer's reaction may trigger further notifications, causing hard-to-debug chains. |
| **Performance with many observers** | Synchronous notification blocks until all observers finish. |
| **Debugging complexity**          | Indirect control flow makes it harder to trace execution. |

---

## Real-World Examples

### 1. UI State Management

React's `useState` + re-render cycle is conceptually Observer:

```
Component subscribes to state → state changes → component re-renders
```

Libraries like MobX and Redux explicitly use Observer:
- **MobX**: `autorun`, `reaction`, `observer` HOC — fine-grained observable properties.
- **Redux**: `store.subscribe(listener)` — the store is the subject, connected components
  are observers.

### 2. DOM Event System

```typescript
const button = document.querySelector("button")!;
button.addEventListener("click", (e) => {
  console.log("Clicked!", e.target);
});
```

The DOM element is the subject. Event listeners are observers. `addEventListener` is
subscribe, `removeEventListener` is unsubscribe, and user interaction triggers notify.

### 3. Pub/Sub (Publish-Subscribe)

Pub/Sub is an extension of Observer with an intermediary **message broker**:

```
Publisher → Message Broker → Subscriber
```

| Aspect       | Observer                     | Pub/Sub                          |
|--------------|------------------------------|----------------------------------|
| Coupling     | Subject knows observers      | Publisher doesn't know subscribers |
| Intermediary | None                         | Message broker / event bus       |
| Filtering    | Subscribe to a subject       | Subscribe to a topic/channel     |

Examples: Redis Pub/Sub, AWS SNS, RabbitMQ, Kafka (conceptually).

### 4. Reactive Programming (RxJS)

RxJS Observables are a powerful generalization of the Observer pattern:

```typescript
import { fromEvent } from "rxjs";
import { debounceTime, map, filter } from "rxjs/operators";

const clicks$ = fromEvent(document, "click").pipe(
  debounceTime(300),
  map((e) => ({ x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY })),
  filter(({ x }) => x > 100)
);

const subscription = clicks$.subscribe({
  next: (pos) => console.log(pos),
  error: (err) => console.error(err),
  complete: () => console.log("Done"),
});

// Cleanup
subscription.unsubscribe();
```

Key additions over basic Observer:
- **Operators** for transforming, filtering, combining streams.
- **Lazy execution** — nothing happens until someone subscribes.
- **Completion semantics** — streams can complete or error.
- **Backpressure** handling in some reactive frameworks.

### 5. WebSocket / Server-Sent Events

Real-time communication naturally uses Observer:

```typescript
const ws = new WebSocket("wss://example.com/feed");
ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
});
```

The WebSocket connection is the subject. Message handlers are observers.

### 6. Database Change Streams

MongoDB Change Streams, PostgreSQL LISTEN/NOTIFY, and Firebase Realtime Database
all implement Observer at the data layer — application code subscribes to data changes
and reacts when documents/rows are inserted, updated, or deleted.

---

## Related Patterns

| Pattern      | Relationship                                                         |
|--------------|----------------------------------------------------------------------|
| **Mediator** | Can be implemented using Observer. Mediator centralizes communication; Observer decentralizes it. |
| **Command**  | Commands can be queued and observed. Command establishes unidirectional sender→receiver links. |
| **Chain of Responsibility** | Passes requests along a chain; Observer broadcasts to all subscribers. |
| **Strategy** | Strategies are swapped; Observers are accumulated.                   |

---

## Key Takeaways

1. Observer decouples the **source of change** from the **reaction to change**.
2. Prefer the **function-based** approach in TypeScript — simpler than class hierarchies.
3. Always provide an **unsubscribe** mechanism to prevent memory leaks.
4. Use **typed event maps** for compile-time safety in TypeScript.
5. Consider **async notification** (microtask/macrotask queue) when observers do heavy work.
6. The pattern is foundational — EventEmitter, DOM events, RxJS, Redux, and Pub/Sub
   are all variations of the same core idea.

---

## References

- [Refactoring Guru — Observer](https://refactoring.guru/design-patterns/observer)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 5
- [MDN — EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- [Node.js — EventEmitter](https://nodejs.org/api/events.html)
- [RxJS Documentation](https://rxjs.dev/)
