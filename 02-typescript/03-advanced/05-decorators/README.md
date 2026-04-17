# Decorators in TypeScript

> **Prerequisites**: Classes, generics, type aliases, interfaces, closures.
> **References**:
> - [TypeScript Handbook — Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
> - [TC39 Decorators Proposal (Stage 3)](https://github.com/tc39/proposal-decorators)
> - Local `tsconfig.json` enables `experimentalDecorators` and `emitDecoratorMetadata`.

---

## Table of Contents

1. [What Are Decorators?](#1-what-are-decorators)
2. [Decorator Syntax and Enabling](#2-decorator-syntax-and-enabling)
3. [Class Decorators](#3-class-decorators)
4. [Method Decorators](#4-method-decorators)
5. [Accessor Decorators](#5-accessor-decorators)
6. [Property Decorators](#6-property-decorators)
7. [Parameter Decorators](#7-parameter-decorators)
8. [Decorator Factories](#8-decorator-factories)
9. [Decorator Composition](#9-decorator-composition)
10. [Decorator Metadata](#10-decorator-metadata)
11. [Practical Patterns](#11-practical-patterns)
12. [Legacy vs TC39 Decorators](#12-legacy-vs-tc39-decorators)
13. [Common Mistakes](#13-common-mistakes)

---

## 1. What Are Decorators?

A **decorator** is a special kind of declaration that can be attached to a class, method,
accessor, property, or parameter. Decorators use the form `@expression`, where `expression`
must evaluate to a function that will be called at runtime with information about the
decorated declaration.

Decorators provide a way to add **metadata** and **modify behavior** declaratively:

```typescript
@sealed
class Greeter {
  @log
  greet() {
    return "Hello!";
  }
}
```

Key ideas:
- Decorators are **functions** — nothing magical about them.
- They run **once at class definition time**, not on every instantiation.
- They can observe, modify, or replace the thing they decorate.

---

## 2. Decorator Syntax and Enabling

### Enabling in TypeScript

Legacy/experimental decorators (TypeScript 5.x and below) require `tsconfig.json` flags:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

- `experimentalDecorators` — enables the `@decorator` syntax.
- `emitDecoratorMetadata` — emits design-time type metadata (used by frameworks like
  Angular, NestJS, TypeORM).

### Decorator Signatures

Each decorator kind receives different arguments:

| Decorator Type | Parameters                                  |
|---------------|---------------------------------------------|
| Class         | `(constructor: Function)`                   |
| Method        | `(target, propertyKey, descriptor)`         |
| Accessor      | `(target, propertyKey, descriptor)`         |
| Property      | `(target, propertyKey)`                     |
| Parameter     | `(target, propertyKey, parameterIndex)`     |

---

## 3. Class Decorators

A class decorator is applied to the **constructor** of the class. It can observe, modify,
or replace the class definition.

### Basic Class Decorator

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class BugReport {
  type = "report";
  title: string;
  constructor(t: string) {
    this.title = t;
  }
}
```

After `@sealed`, you cannot add new properties to `BugReport` or its prototype.

### Replacing a Constructor

A class decorator can return a new constructor that **extends** the original:

```typescript
function withTimestamp<T extends { new (...args: unknown[]): object }>(Base: T) {
  return class extends Base {
    timestamp = new Date();
  };
}

@withTimestamp
class Order {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
}

const o = new Order(1);
console.log((o as Record<string, unknown>).timestamp); // Date object
```

When a class decorator returns a value, it **replaces** the class declaration with
the returned constructor.

---

## 4. Method Decorators

A method decorator is applied to the **property descriptor** of a method. It receives
three arguments:

1. **target** — the prototype of the class (for instance methods) or the constructor
   (for static methods).
2. **propertyKey** — the name of the method.
3. **descriptor** — the `PropertyDescriptor` for the method.

### Example: Logging Decorator

```typescript
function log(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = original.apply(this, args);
    console.log(`${propertyKey} returned`, result);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

new Calculator().add(2, 3);
// Calling add with [2, 3]
// add returned 5
```

### Returning a New Descriptor

You can also **return** a new descriptor instead of mutating the existing one:

```typescript
function enumerable(value: boolean) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
    return descriptor;
  };
}
```

---

## 5. Accessor Decorators

Accessor decorators are applied to the **getter/setter** of an accessor. The signature
is identical to method decorators.

```typescript
function configurable(value: boolean) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
    return descriptor;
  };
}

class Point {
  private _x: number;
  constructor(x: number) {
    this._x = x;
  }

  @configurable(false)
  get x() {
    return this._x;
  }
}
```

> **Note**: You cannot decorate both the getter and setter for a single member.
> Apply the decorator to whichever accessor is defined **first** in document order.

---

## 6. Property Decorators

A property decorator receives only **two** arguments (no descriptor):

1. **target** — the prototype (instance) or constructor (static).
2. **propertyKey** — the property name.

Property decorators cannot directly modify the property value. They're primarily used
to **record metadata** about the property.

```typescript
const requiredKeys: string[] = [];

function required(target: object, propertyKey: string): void {
  requiredKeys.push(propertyKey);
}

class User {
  @required
  username!: string;

  @required
  email!: string;

  bio?: string;
}

console.log(requiredKeys); // ["username", "email"]
```

To actually intercept get/set, you would use `Object.defineProperty` inside
the decorator — but this is tricky because property decorators fire on the
**prototype**, not instances.

---

## 7. Parameter Decorators

A parameter decorator receives three arguments:

1. **target** — the prototype or constructor.
2. **propertyKey** — the method name (or `undefined` for constructor params).
3. **parameterIndex** — the ordinal index of the parameter.

```typescript
const validatedParams = new Map<string, number[]>();

function validate(
  target: object,
  propertyKey: string,
  parameterIndex: number
): void {
  const existing = validatedParams.get(propertyKey) ?? [];
  existing.push(parameterIndex);
  validatedParams.set(propertyKey, existing);
}

class UserService {
  createUser(@validate name: string, @validate email: string) {
    return { name, email };
  }
}

console.log(validatedParams); // Map { 'createUser' => [1, 0] }
```

> **Note**: Parameter decorators **cannot** modify the parameter or method behavior
> on their own. They are used to store metadata, typically combined with a method
> decorator that reads the metadata and performs validation.

---

## 8. Decorator Factories

A **decorator factory** is a function that **returns** a decorator. This allows you
to pass configuration to decorators.

```typescript
function minLength(min: number) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]) {
      for (const arg of args) {
        if (typeof arg === "string" && arg.length < min) {
          throw new Error(
            `Argument to ${propertyKey} must be at least ${min} chars`
          );
        }
      }
      return original.apply(this, args);
    };
  };
}

class Validator {
  @minLength(3)
  setName(name: string) {
    console.log("Name set to:", name);
  }
}

new Validator().setName("Al"); // Error: must be at least 3 chars
```

Decorator factories are the most common pattern because they enable **parameterized
decorators**.

### Pattern: Factory with Defaults

```typescript
function throttle(ms = 300) {
  return function (
    _target: object,
    _key: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    let lastCall = 0;
    descriptor.value = function (...args: unknown[]) {
      const now = Date.now();
      if (now - lastCall >= ms) {
        lastCall = now;
        return original.apply(this, args);
      }
    };
    return descriptor;
  };
}
```

---

## 9. Decorator Composition

Multiple decorators can be applied to a single declaration. They are **evaluated**
top-to-bottom, but **executed** (called) bottom-to-top.

### Evaluation vs. Execution Order

```typescript
function first() {
  console.log("first(): evaluated");
  return function (
    _target: object,
    _key: string,
    _descriptor: PropertyDescriptor
  ) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): evaluated");
  return function (
    _target: object,
    _key: string,
    _descriptor: PropertyDescriptor
  ) {
    console.log("second(): called");
  };
}

class Example {
  @first()
  @second()
  method() {}
}

// Output:
// first(): evaluated
// second(): evaluated
// second(): called
// first(): called
```

This is like **function composition**: `first(second(x))`.

- **Evaluation** (factory calls): top → bottom.
- **Execution** (decorator calls): bottom → top.

### Order Across Decorator Types

When a class has multiple decorated members, the execution order is:

1. **Instance members** (properties, methods, accessors) — in declaration order
2. **Static members** — in declaration order
3. **Constructor parameters**
4. **Class decorator**

Within each member, parameter decorators run first (right to left), then the
method/accessor/property decorator.

---

## 10. Decorator Metadata

### Using `emitDecoratorMetadata`

When enabled, TypeScript emits design-time type information using `Reflect.metadata`.
Three metadata keys are automatically generated:

| Key                    | Value                          |
|-----------------------|-------------------------------|
| `design:type`         | Type of the property/method   |
| `design:paramtypes`   | Array of parameter types      |
| `design:returntype`   | Return type of a method       |

This requires the `reflect-metadata` polyfill:

```typescript
import "reflect-metadata";

function logType(target: object, key: string): void {
  const type = Reflect.getMetadata("design:type", target, key);
  console.log(`${key} type:`, type?.name);
}

class Demo {
  @logType
  name: string = "test";
}
// Logs: name type: String
```

### Manual Metadata with WeakMaps

Without `reflect-metadata`, you can store metadata using `WeakMap`s or `Map`s:

```typescript
const metadata = new WeakMap<object, Map<string, unknown>>();

function meta(key: string, value: unknown) {
  return function (target: object, propertyKey: string) {
    let map = metadata.get(target);
    if (!map) {
      map = new Map();
      metadata.set(target, map);
    }
    map.set(`${propertyKey}:${key}`, value);
  };
}

class Config {
  @meta("label", "User Name")
  @meta("maxLength", 50)
  name!: string;
}
```

---

## 11. Practical Patterns

### 11.1 Logging / Timing

```typescript
function timed(
  _target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]) {
    const start = performance.now();
    const result = original.apply(this, args);
    const elapsed = performance.now() - start;
    console.log(`${propertyKey} took ${elapsed.toFixed(2)}ms`);
    return result;
  };
}
```

### 11.2 Validation

```typescript
function validateArgs(
  ...validators: Array<(arg: unknown) => boolean>
) {
  return function (
    _target: object,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]) {
      for (let i = 0; i < validators.length; i++) {
        if (!validators[i](args[i])) {
          throw new Error(`Validation failed for arg ${i} of ${key}`);
        }
      }
      return original.apply(this, args);
    };
  };
}

const isPositive = (v: unknown) => typeof v === "number" && v > 0;
const isString = (v: unknown) => typeof v === "string" && v.length > 0;

class ProductService {
  @validateArgs(isString, isPositive)
  createProduct(name: string, price: number) {
    return { name, price };
  }
}
```

### 11.3 Memoization

```typescript
function memoize(
  _target: object,
  _key: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  const cache = new Map<string, unknown>();

  descriptor.value = function (...args: unknown[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

class MathService {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

### 11.4 Dependency Injection (Simplified)

```typescript
const registry = new Map<string, unknown>();

function injectable(token: string) {
  return function (constructor: Function) {
    registry.set(token, constructor);
  };
}

function inject(token: string) {
  return function (target: object, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get: () => {
        const Ctor = registry.get(token) as
          | (new () => unknown)
          | undefined;
        return Ctor ? new Ctor() : undefined;
      },
      enumerable: true,
    });
  };
}

@injectable("logger")
class Logger {
  log(msg: string) {
    console.log("[LOG]", msg);
  }
}

class App {
  @inject("logger")
  logger!: Logger;
}
```

### 11.5 Sealed Classes

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class FinalApi {
  version = "1.0";
  getVersion() {
    return this.version;
  }
}

// (FinalApi as any).newProp = "x"; // Throws in strict mode
```

---

## 12. Legacy vs TC39 Decorators

### The Two Decorator Systems

TypeScript currently has **two** decorator systems:

| Feature                    | Legacy (`experimentalDecorators`) | TC39 Stage 3 (TS 5.0+)        |
|---------------------------|----------------------------------|-------------------------------|
| tsconfig flag              | `experimentalDecorators: true`   | No flag needed (TS 5.0+)     |
| Class decorators           | Receive constructor              | Receive class + context       |
| Method decorators          | `(target, key, descriptor)`      | `(method, context)`           |
| Property decorators        | `(target, key)`                  | `(undefined, context)`        |
| Parameter decorators       | Supported                        | **Not supported**             |
| Return value               | Replaces target                  | Replaces or initializes       |
| `emitDecoratorMetadata`    | Supported                        | Not applicable                |
| Metadata                   | Via reflect-metadata             | Via `context.metadata`        |

### TC39 Stage 3 Syntax (TypeScript 5.0+)

Without `experimentalDecorators`, TypeScript 5.0+ uses the TC39 proposal:

```typescript
// TC39 class decorator
function logged(target: Function, context: ClassDecoratorContext) {
  console.log(`Defining class: ${String(context.name)}`);
}

// TC39 method decorator
function logMethod<This, Args extends unknown[], Return>(
  method: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext
) {
  return function (this: This, ...args: Args): Return {
    console.log(`Calling ${String(context.name)}`);
    return method.call(this, ...args);
  };
}

@logged
class MyService {
  @logMethod
  doWork() {
    return 42;
  }
}
```

### Key Differences in Practice

1. **TC39 decorators do NOT have parameter decorators** — frameworks relying on
   parameter DI (Angular, NestJS) still need `experimentalDecorators`.

2. **TC39 decorators use `context` objects** instead of positional parameters.
   The context provides `kind`, `name`, `static`, `private`, `access`, `metadata`.

3. **No `emitDecoratorMetadata`** with TC39 — use `context.metadata` instead.

4. **You cannot mix both systems** in the same file.

### Migration Path

Most production codebases still use `experimentalDecorators` because:
- Major frameworks (Angular, NestJS) depend on parameter decorators.
- `emitDecoratorMetadata` has no TC39 equivalent yet.
- The TC39 proposal is still stabilizing across toolchains.

When starting a **new** project without framework constraints, prefer TC39
decorators for future-proofing. For existing codebases, wait for framework
migration guides.

---

## 13. Common Mistakes

### Forgetting to Enable Decorators

```typescript
// tsconfig.json must have experimentalDecorators: true
// Otherwise: "Decorators are not valid here"
```

### Losing `this` Context

```typescript
// BAD: arrow function in decorator loses the instance `this`
function broken(
  _t: object,
  _k: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = (...args: unknown[]) => {
    // `this` is the outer scope, not the class instance!
    return original.apply(this, args);
  };
}

// GOOD: use a regular function expression
function working(
  _t: object,
  _k: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    return original.apply(this, args);
  };
}
```

### Applying Decorator to Both Getter and Setter

```typescript
class Bad {
  private _x = 0;

  @someDecorator
  get x() { return this._x; }

  @someDecorator // Error: cannot apply to both
  set x(v: number) { this._x = v; }
}
```

### Expecting Property Decorators to Have Descriptors

Property decorators receive only `(target, propertyKey)` — there is **no**
descriptor. Use `Object.defineProperty` inside the decorator if you need
getter/setter behavior.

### Forgetting Execution Order

Decorators run bottom-to-top for composition, but factories evaluate top-to-bottom.
Confusing these two phases is a frequent source of bugs.

---

> **Next**: `exercises.ts` — 15 exercises covering all decorator types and patterns.
