# Adapter Pattern (Structural)

> **Also known as:** Wrapper

## Table of Contents

- [Intent](#intent)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Structure](#structure)
  - [Object Adapter](#object-adapter)
  - [Class Adapter](#class-adapter)
- [Implementation in TypeScript](#implementation-in-typescript)
  - [Basic Object Adapter](#basic-object-adapter)
  - [Class Adapter with Mixins](#class-adapter-with-mixins)
  - [Two-Way Adapter](#two-way-adapter)
- [When to Use](#when-to-use)
- [Pros and Cons](#pros-and-cons)
- [Real-World Examples](#real-world-examples)
  - [API Response Adapters](#api-response-adapters)
  - [Legacy Code Wrapping](#legacy-code-wrapping)
  - [Third-Party Library Integration](#third-party-library-integration)
  - [Payment Gateway Adapters](#payment-gateway-adapters)
- [Relations with Other Patterns](#relations-with-other-patterns)
- [References](#references)

---

## Intent

**Adapter** is a structural design pattern that allows objects with **incompatible
interfaces** to collaborate. It acts as a bridge between two interfaces that couldn't
otherwise work together.

The adapter converts the interface of one class into another interface that clients
expect. This lets classes work together that otherwise couldn't because of interface
incompatibility.

---

## The Problem

Imagine you have a client that expects data in a specific format, but the service
you need to use provides data in a completely different format.

```
Client ──expects──▶ InterfaceA
                        ✗
Service ──provides──▶ InterfaceB
```

Common scenarios where this arises:

1. **Format mismatch** — Your app works with XML but a third-party analytics library
   only accepts JSON.
2. **Legacy integration** — You need to use an old module whose API doesn't match
   your current architecture.
3. **Third-party libraries** — You want to swap between different libraries that
   solve the same problem but have different interfaces.
4. **API versioning** — An external API changes its response format but your
   internal code must remain stable.

You can't always modify the service (it might be third-party, or changing it would
break other dependents). You also don't want to litter your client code with
conversion logic.

---

## The Solution

Create an **adapter** — a wrapper object that:

1. Implements the interface the client expects (the **target interface**).
2. Holds a reference to the service object (the **adaptee**).
3. Translates calls from the target interface into calls the adaptee understands.

```
Client ──calls──▶ Adapter (implements Target) ──delegates──▶ Adaptee
```

The client never knows it's talking to an adapter. The adaptee never knows it's
being wrapped. The adapter handles all translation in between.

---

## Structure

### Object Adapter

Uses **composition**: the adapter holds a reference to the adaptee and delegates
calls to it.

```
┌──────────────────┐       ┌──────────────────────┐
│  <<interface>>   │       │       Adaptee         │
│     Target       │       │  (Service / Legacy)   │
├──────────────────┤       ├──────────────────────┤
│ + request()      │       │ + specificRequest()   │
└──────────────────┘       └──────────────────────┘
        ▲                            ▲
        │ implements                 │ wraps (composition)
        │                            │
┌───────┴──────────────────────────┴──┐
│             Adapter                  │
├──────────────────────────────────────┤
│ - adaptee: Adaptee                   │
│ + request()  ──▶ adaptee.specific()  │
└──────────────────────────────────────┘
```

**Advantages:**
- Works in all languages (no multiple inheritance needed).
- Can adapt multiple adaptees or swap adaptees at runtime.
- Follows composition over inheritance.

### Class Adapter

Uses **inheritance**: the adapter extends both the target and the adaptee. This
requires multiple inheritance, which TypeScript doesn't natively support (but can
be approximated with mixins).

```
┌──────────────────┐       ┌──────────────────────┐
│     Target       │       │       Adaptee         │
├──────────────────┤       ├──────────────────────┤
│ + request()      │       │ + specificRequest()   │
└──────────────────┘       └──────────────────────┘
        ▲                            ▲
        │ extends                    │ extends
        │                            │
        └────────┐    ┌──────────────┘
                 │    │
          ┌──────┴────┴──────┐
          │   ClassAdapter   │
          ├──────────────────┤
          │ + request()      │
          │   (calls this.   │
          │   specificReq()) │
          └──────────────────┘
```

**Advantages:**
- No wrapping object needed; slightly less indirection.
- Can override adaptee behavior directly.

**Disadvantages:**
- Requires multiple inheritance (not available in TS/Java).
- Tightly coupled to the concrete adaptee class.
- Can't adapt subclasses of the adaptee.

---

## Implementation in TypeScript

### Basic Object Adapter

```typescript
// Target interface — what the client expects
interface MediaPlayer {
  play(filename: string): string;
}

// Adaptee — incompatible interface
class VlcPlayer {
  playVlc(filename: string): string {
    return `Playing VLC file: ${filename}`;
  }
}

// Adapter — bridges the gap
class VlcAdapter implements MediaPlayer {
  constructor(private vlcPlayer: VlcPlayer) {}

  play(filename: string): string {
    return this.vlcPlayer.playVlc(filename);
  }
}

// Client code works with MediaPlayer only
function clientCode(player: MediaPlayer, file: string): string {
  return player.play(file);
}

const adapter = new VlcAdapter(new VlcPlayer());
console.log(clientCode(adapter, "song.vlc"));
// Output: Playing VLC file: song.vlc
```

### Class Adapter with Mixins

TypeScript doesn't support multiple inheritance, but we can approximate class
adapters using mixins:

```typescript
interface Target {
  request(): string;
}

class Adaptee {
  specificRequest(): string {
    return "Adaptee behavior";
  }
}

// Mixin approach — extend Adaptee and implement Target
class ClassAdapter extends Adaptee implements Target {
  request(): string {
    // Directly call inherited method (no composition needed)
    return `Adapted: ${this.specificRequest()}`;
  }
}

const adapter = new ClassAdapter();
console.log(adapter.request());          // "Adapted: Adaptee behavior"
console.log(adapter.specificRequest());  // "Adaptee behavior" — still accessible
```

This is the closest TypeScript gets to a class adapter. The adapter IS-A Adaptee
and also satisfies the Target interface.

### Two-Way Adapter

A two-way adapter implements both interfaces, allowing objects on either side to
use it:

```typescript
interface USPlug {
  provideUSPower(): string;
}

interface EUPlug {
  provideEUPower(): string;
}

class AmericanDevice implements USPlug {
  provideUSPower(): string {
    return "110V US Power";
  }
}

class EuropeanDevice implements EUPlug {
  provideEUPower(): string {
    return "220V EU Power";
  }
}

// Two-way adapter implements BOTH interfaces
class PowerAdapter implements USPlug, EUPlug {
  constructor(
    private usDevice?: AmericanDevice,
    private euDevice?: EuropeanDevice
  ) {}

  provideUSPower(): string {
    if (this.euDevice) {
      // Convert EU → US
      return `Converted from EU: ${this.euDevice.provideEUPower()} → 110V`;
    }
    return this.usDevice?.provideUSPower() ?? "No device";
  }

  provideEUPower(): string {
    if (this.usDevice) {
      // Convert US → EU
      return `Converted from US: ${this.usDevice.provideUSPower()} → 220V`;
    }
    return this.euDevice?.provideEUPower() ?? "No device";
  }
}
```

Two-way adapters are useful when two subsystems must communicate in both
directions, but they can become complex and should be used judiciously.

---

## When to Use

| Scenario | Why Adapter Helps |
|----------|-------------------|
| **Incompatible third-party library** | Wrap it so your code depends on your own interface, not theirs |
| **Legacy system integration** | Wrap old APIs behind modern interfaces without rewriting them |
| **Multiple implementations** | Define a common target interface; write an adapter per implementation |
| **API response normalization** | Adapt varying external API responses into a consistent internal shape |
| **Testing / mocking** | Adapt real services behind interfaces to swap in test doubles |
| **Gradual migration** | Wrap old code in adapters; replace adapters incrementally as you rewrite |

**Don't use when:**
- You own both interfaces and can simply refactor one to match the other.
- The translation logic is trivial enough to inline.
- The overhead of an extra class provides no meaningful decoupling benefit.

---

## Pros and Cons

### Pros

- **Single Responsibility Principle** — Separation of interface conversion from
  business logic. The adapter handles only the translation.
- **Open/Closed Principle** — Add new adapters without modifying existing client
  code or the adaptee.
- **Decoupling** — The client is insulated from changes in the adaptee's interface.
- **Reusability** — The same adapter can be reused wherever the incompatibility
  exists.
- **Testability** — Easy to mock/stub the target interface in tests.

### Cons

- **Added complexity** — Introduces additional classes and indirection. For simple
  cases, this overhead isn't justified.
- **Performance** — Extra layer of delegation. Usually negligible, but can matter
  in hot paths.
- **Proliferation** — If you need many adapters, the codebase can become cluttered
  with small wrapper classes.
- **Debugging** — Stack traces go through adapter layers, making debugging slightly
  harder.

---

## Real-World Examples

### API Response Adapters

External APIs return data in their own format. Adapters normalize responses into
your internal domain models.

```typescript
// External API response (what we receive)
interface ExternalUserResponse {
  user_id: number;
  full_name: string;
  email_address: string;
  is_active: boolean;
  created_at: string;  // ISO string
}

// Internal domain model (what our app uses)
interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
}

// Adapter function (functional style is common for data adapters)
function adaptUserResponse(response: ExternalUserResponse): User {
  return {
    id: String(response.user_id),
    name: response.full_name,
    email: response.email_address,
    active: response.is_active,
    createdAt: new Date(response.created_at),
  };
}
```

### Legacy Code Wrapping

Wrap legacy modules behind a clean interface so new code never touches the legacy
API directly.

```typescript
// Legacy module with callback-based API
class LegacyEmailService {
  sendMail(
    to: string,
    subject: string,
    body: string,
    callback: (err: Error | null, result: string) => void
  ): void {
    // ... legacy implementation
    callback(null, `Sent to ${to}`);
  }
}

// Modern interface using Promises
interface EmailService {
  send(to: string, subject: string, body: string): Promise<string>;
}

// Adapter: callback → Promise
class EmailServiceAdapter implements EmailService {
  constructor(private legacy: LegacyEmailService) {}

  send(to: string, subject: string, body: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.legacy.sendMail(to, subject, body, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}
```

### Third-Party Library Integration

When you might want to swap between different libraries (e.g., loggers, HTTP
clients), define your own interface and write adapters.

```typescript
interface Logger {
  info(message: string): void;
  error(message: string): void;
}

// Winston adapter
class WinstonLoggerAdapter implements Logger {
  constructor(private winston: { log: (level: string, msg: string) => void }) {}

  info(message: string): void {
    this.winston.log("info", message);
  }
  error(message: string): void {
    this.winston.log("error", message);
  }
}

// Pino adapter
class PinoLoggerAdapter implements Logger {
  constructor(private pino: { info: (msg: string) => void; error: (msg: string) => void }) {}

  info(message: string): void {
    this.pino.info(message);
  }
  error(message: string): void {
    this.pino.error(message);
  }
}
```

### Payment Gateway Adapters

Different payment providers (Stripe, PayPal, Square) have wildly different APIs.
Adapters let your checkout code stay clean.

```typescript
interface PaymentGateway {
  charge(amount: number, currency: string, token: string): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

interface PaymentResult {
  transactionId: string;
  status: "success" | "failed";
  amount: number;
}

interface RefundResult {
  refundId: string;
  status: "success" | "failed";
}

// Stripe adapter
class StripeAdapter implements PaymentGateway {
  constructor(private stripe: {
    charges: {
      create: (params: Record<string, unknown>) => Promise<{ id: string; status: string; amount: number }>;
    };
    refunds: {
      create: (params: Record<string, unknown>) => Promise<{ id: string; status: string }>;
    };
  }) {}

  async charge(amount: number, currency: string, token: string): Promise<PaymentResult> {
    const result = await this.stripe.charges.create({
      amount: amount * 100,  // Stripe uses cents
      currency,
      source: token,
    });
    return {
      transactionId: result.id,
      status: result.status === "succeeded" ? "success" : "failed",
      amount,
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const result = await this.stripe.refunds.create({
      charge: transactionId,
      amount: amount * 100,
    });
    return {
      refundId: result.id,
      status: result.status === "succeeded" ? "success" : "failed",
    };
  }
}
```

---

## Relations with Other Patterns

| Pattern | Relationship |
|---------|-------------|
| **Bridge** | Designed up-front to separate abstraction from implementation. Adapter is applied after the fact to make incompatible things work together. |
| **Decorator** | Keeps the same interface but adds behavior. Adapter changes the interface entirely. Decorator supports recursive composition; Adapter does not. |
| **Facade** | Defines a new simplified interface for an entire subsystem. Adapter wraps a single object to make its existing interface usable. |
| **Proxy** | Provides the same interface with controlled access. Adapter provides a different interface. |
| **Strategy** | Both use composition to delegate work. Strategy encapsulates interchangeable algorithms; Adapter translates interfaces. |

---

## Key Takeaways

1. Adapter is about **interface translation**, not adding behavior.
2. Prefer **object adapters** (composition) over class adapters (inheritance) in TS.
3. Adapters are ideal for **isolating your code from external dependencies**.
4. Keep adapters **thin** — they should only translate, not contain business logic.
5. Use adapters to enable the **Open/Closed Principle**: new integrations = new
   adapters, zero changes to existing code.

---

## References

- [Refactoring Guru — Adapter](https://refactoring.guru/design-patterns/adapter)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 4
- *Head First Design Patterns*, Chapter 7
