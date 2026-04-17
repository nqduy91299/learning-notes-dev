// =============================================================================
// Observer Pattern — Solutions
// Run: npx tsx solutions.ts
// =============================================================================

const log: string[] = [];
function clearLog(): void {
  log.length = 0;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

// =============================================================================
// EXERCISE 1 — Predict the Output
// Answer: ["A: Phone", "B: Phone", "B: Tablet"]
// After unsubscribing handler (A), only B remains for the second notification.
// =============================================================================

function exercise1(): void {
  class Store {
    private observers = new Set<(product: string) => void>();
    subscribe(fn: (product: string) => void): void {
      this.observers.add(fn);
    }
    unsubscribe(fn: (product: string) => void): void {
      this.observers.delete(fn);
    }
    addProduct(product: string): void {
      for (const fn of this.observers) fn(product);
    }
  }

  clearLog();
  const store = new Store();
  const handler = (p: string): void => {
    log.push(`A: ${p}`);
  };
  store.subscribe(handler);
  store.subscribe((p) => log.push(`B: ${p}`));
  store.addProduct("Phone");
  store.unsubscribe(handler);
  store.addProduct("Tablet");

  assert(
    JSON.stringify(log) === JSON.stringify(["A: Phone", "B: Phone", "B: Tablet"]),
    `Exercise 1: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 2 — Predict the Output
// Answer: ["val:10"]
// Set ignores duplicate adds of the same reference. Handler fires only once.
// =============================================================================

function exercise2(): void {
  class Emitter {
    private listeners = new Set<(v: number) => void>();
    on(fn: (v: number) => void): void {
      this.listeners.add(fn);
    }
    emit(v: number): void {
      for (const fn of this.listeners) fn(v);
    }
  }

  clearLog();
  const emitter = new Emitter();
  const handler = (v: number): void => {
    log.push(`val:${v}`);
  };
  emitter.on(handler);
  emitter.on(handler);
  emitter.emit(10);

  assert(
    JSON.stringify(log) === JSON.stringify(["val:10"]),
    `Exercise 2: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 3 — Predict the Output
// Answer: ["first", "first"]
// During first broadcast, "first" runs and deletes "second" from the Set before
// it's visited, so "second" never runs. Second broadcast only has "first".
// =============================================================================

function exercise3(): void {
  class Channel {
    private subs = new Set<() => void>();
    subscribe(fn: () => void): () => void {
      this.subs.add(fn);
      return () => this.subs.delete(fn);
    }
    broadcast(): void {
      for (const fn of this.subs) fn();
    }
  }

  clearLog();
  const ch = new Channel();
  let unsub2: (() => void) | undefined;

  ch.subscribe(() => {
    log.push("first");
    unsub2?.();
  });

  unsub2 = ch.subscribe(() => {
    log.push("second");
  });

  ch.broadcast();
  ch.broadcast();

  assert(
    JSON.stringify(log) === JSON.stringify(["first", "first"]),
    `Exercise 3: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 4 — Predict the Output
// Answer: ["click:1,2", "hover:3,4", "click:5,6"]
// Each event type has its own listener set. Events fire independently.
// =============================================================================

function exercise4(): void {
  type Events = {
    click: { x: number; y: number };
    hover: { x: number; y: number };
  };

  type Listener<T> = (data: T) => void;

  class Bus<E extends Record<string, unknown>> {
    private map = new Map<keyof E, Set<Listener<never>>>();

    on<K extends keyof E>(event: K, fn: Listener<E[K]>): void {
      if (!this.map.has(event)) this.map.set(event, new Set());
      this.map.get(event)!.add(fn as Listener<never>);
    }

    emit<K extends keyof E>(event: K, data: E[K]): void {
      const s = this.map.get(event);
      if (s) for (const fn of s) (fn as Listener<E[K]>)(data);
    }
  }

  clearLog();
  const bus = new Bus<Events>();
  bus.on("click", (d) => log.push(`click:${d.x},${d.y}`));
  bus.on("hover", (d) => log.push(`hover:${d.x},${d.y}`));
  bus.emit("click", { x: 1, y: 2 });
  bus.emit("hover", { x: 3, y: 4 });
  bus.emit("click", { x: 5, y: 6 });

  assert(
    JSON.stringify(log) === JSON.stringify(["click:1,2", "hover:3,4", "click:5,6"]),
    `Exercise 4: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 5 — Predict the Output
// Answer: ["once:A", "on:A", "on:B"]
// The once-listener fires for "A" then removes itself. Only "on" fires for "B".
// =============================================================================

function exercise5(): void {
  class Notifier {
    private listeners: Array<(msg: string) => void> = [];

    on(fn: (msg: string) => void): void {
      this.listeners.push(fn);
    }

    once(fn: (msg: string) => void): void {
      const wrapper = (msg: string): void => {
        fn(msg);
        this.off(wrapper);
      };
      this.on(wrapper);
    }

    off(fn: (msg: string) => void): void {
      this.listeners = this.listeners.filter((l) => l !== fn);
    }

    emit(msg: string): void {
      const snapshot = [...this.listeners];
      for (const fn of snapshot) fn(msg);
    }
  }

  clearLog();
  const n = new Notifier();
  n.once((m) => log.push(`once:${m}`));
  n.on((m) => log.push(`on:${m}`));
  n.emit("A");
  n.emit("B");

  assert(
    JSON.stringify(log) === JSON.stringify(["once:A", "on:A", "on:B"]),
    `Exercise 5: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 6 — Fix the Bug
// Bug: `this.subs.filter(...)` returns a new array but doesn't assign it.
// Fix: assign the result back to this.subs.
// =============================================================================

function exercise6(): void {
  class Observable {
    private subs: Array<(v: number) => void> = [];

    subscribe(fn: (v: number) => void): () => void {
      this.subs.push(fn);
      return () => {
        // FIX: assign the filtered result back
        this.subs = this.subs.filter((s) => s !== fn);
      };
    }

    notify(v: number): void {
      for (const fn of this.subs) fn(v);
    }
  }

  clearLog();
  const obs = new Observable();
  const unsub = obs.subscribe((v) => log.push(`v:${v}`));
  obs.notify(1);
  unsub();
  obs.notify(2);

  assert(
    JSON.stringify(log) === JSON.stringify(["v:1"]),
    `Exercise 6: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 7 — Fix the Bug
// Bug: notify is called before updating the value.
// Fix: update the value first, then notify.
// =============================================================================

function exercise7(): void {
  class StateHolder {
    private value = 0;
    private observers = new Set<(val: number) => void>();

    subscribe(fn: (val: number) => void): void {
      this.observers.add(fn);
    }

    // FIX: update value BEFORE notifying
    setValue(newVal: number): void {
      this.value = newVal;
      this.notifyAll();
    }

    getValue(): number {
      return this.value;
    }

    private notifyAll(): void {
      for (const fn of this.observers) fn(this.value);
    }
  }

  clearLog();
  const state = new StateHolder();
  state.subscribe((v) => log.push(`state:${v}`));
  state.setValue(10);
  state.setValue(20);

  assert(
    JSON.stringify(log) === JSON.stringify(["state:10", "state:20"]),
    `Exercise 7: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 8 — Fix the Bug
// Bug: wildcard "*" listeners are not checked during emit.
// Fix: also notify "*" listeners for every event.
// =============================================================================

function exercise8(): void {
  class EventBus {
    private listeners = new Map<string, Set<(data: string) => void>>();

    on(event: string, fn: (data: string) => void): void {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event)!.add(fn);
    }

    emit(event: string, data: string): void {
      // FIX: also fire wildcard listeners
      const wildcardSet = this.listeners.get("*");
      if (wildcardSet) {
        for (const fn of wildcardSet) fn(data);
      }
      const set = this.listeners.get(event);
      if (set) {
        for (const fn of set) fn(data);
      }
    }
  }

  clearLog();
  const bus = new EventBus();
  bus.on("*", (d) => log.push(`all:${d}`));
  bus.on("click", (d) => log.push(`click:${d}`));
  bus.emit("click", "btn");
  bus.emit("hover", "div");

  assert(
    JSON.stringify(log) === JSON.stringify(["all:btn", "click:btn", "all:div"]),
    `Exercise 8: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 9 — Implement: Basic Subject
// =============================================================================

function exercise9(): void {
  class BasicSubject<T> {
    private listeners = new Set<(value: T) => void>();

    subscribe(fn: (value: T) => void): () => void {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    }

    notify(value: T): void {
      for (const fn of this.listeners) {
        fn(value);
      }
    }
  }

  clearLog();
  const subj = new BasicSubject<string>();
  const unsub1 = subj.subscribe((v) => log.push(`A:${v}`));
  const _unsub2 = subj.subscribe((v) => log.push(`B:${v}`));
  subj.notify("hello");
  unsub1();
  subj.notify("world");

  assert(
    JSON.stringify(log) === JSON.stringify(["A:hello", "B:hello", "B:world"]),
    `Exercise 9: ${JSON.stringify(log)}`
  );
  void _unsub2;
}

// =============================================================================
// EXERCISE 10 — Implement: Typed EventEmitter
// =============================================================================

function exercise10(): void {
  class TypedEmitter<E extends Record<string, unknown>> {
    private map = new Map<keyof E, Set<(data: never) => void>>();

    on<K extends keyof E>(event: K, fn: (data: E[K]) => void): void {
      if (!this.map.has(event)) this.map.set(event, new Set());
      this.map.get(event)!.add(fn as (data: never) => void);
    }

    off<K extends keyof E>(event: K, fn: (data: E[K]) => void): void {
      this.map.get(event)?.delete(fn as (data: never) => void);
    }

    emit<K extends keyof E>(event: K, data: E[K]): void {
      const set = this.map.get(event);
      if (set) {
        for (const fn of set) {
          (fn as (data: E[K]) => void)(data);
        }
      }
    }
  }

  type TestEvents = {
    message: { text: string };
    count: { value: number };
  };

  clearLog();
  const emitter = new TypedEmitter<TestEvents>();
  const handler = (d: { text: string }): void => {
    log.push(`msg:${d.text}`);
  };
  emitter.on("message", handler);
  emitter.on("count", (d) => log.push(`cnt:${d.value}`));
  emitter.emit("message", { text: "hi" });
  emitter.emit("count", { value: 42 });
  emitter.off("message", handler);
  emitter.emit("message", { text: "bye" });

  assert(
    JSON.stringify(log) === JSON.stringify(["msg:hi", "cnt:42"]),
    `Exercise 10: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 11 — Implement: Once Listener
// =============================================================================

function exercise11(): void {
  class OnceSubject<T> {
    private listeners: Array<{ fn: (value: T) => void; once: boolean }> = [];

    on(fn: (value: T) => void): () => void {
      const entry = { fn, once: false };
      this.listeners.push(entry);
      return () => {
        this.listeners = this.listeners.filter((e) => e !== entry);
      };
    }

    once(fn: (value: T) => void): void {
      this.listeners.push({ fn, once: true });
    }

    emit(value: T): void {
      const snapshot = [...this.listeners];
      for (const entry of snapshot) {
        entry.fn(value);
        if (entry.once) {
          this.listeners = this.listeners.filter((e) => e !== entry);
        }
      }
    }
  }

  clearLog();
  const subj = new OnceSubject<number>();
  subj.on((v) => log.push(`on:${v}`));
  subj.once((v) => log.push(`once:${v}`));
  subj.emit(1);
  subj.emit(2);

  assert(
    JSON.stringify(log) === JSON.stringify(["on:1", "once:1", "on:2"]),
    `Exercise 11: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 12 — Implement: Property Observer
// =============================================================================

function exercise12(): void {
  class ObservableProperty<T> {
    private listeners = new Set<(oldVal: T, newVal: T) => void>();

    constructor(private _value: T) {}

    get value(): T {
      return this._value;
    }

    set value(newVal: T) {
      if (this._value === newVal) return;
      const oldVal = this._value;
      this._value = newVal;
      for (const fn of this.listeners) {
        fn(oldVal, newVal);
      }
    }

    onChange(fn: (oldVal: T, newVal: T) => void): () => void {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    }
  }

  clearLog();
  const prop = new ObservableProperty(0);
  const unsub = prop.onChange((o, n) => log.push(`${o}->${n}`));
  prop.value = 5;
  prop.value = 5;
  prop.value = 10;
  unsub();
  prop.value = 20;

  assert(
    JSON.stringify(log) === JSON.stringify(["0->5", "5->10"]),
    `Exercise 12: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 13 — Implement: Event Filtering Observer
// =============================================================================

function exercise13(): void {
  class FilteredSubject<T> {
    private entries: Array<{
      fn: (value: T) => void;
      filter: (value: T) => boolean;
    }> = [];

    subscribe(
      fn: (value: T) => void,
      filter: (value: T) => boolean
    ): () => void {
      const entry = { fn, filter };
      this.entries.push(entry);
      return () => {
        this.entries = this.entries.filter((e) => e !== entry);
      };
    }

    notify(value: T): void {
      for (const entry of this.entries) {
        if (entry.filter(value)) {
          entry.fn(value);
        }
      }
    }
  }

  clearLog();
  const subj = new FilteredSubject<number>();
  subj.subscribe((v) => log.push(`even:${v}`), (v) => v % 2 === 0);
  subj.subscribe((v) => log.push(`big:${v}`), (v) => v > 5);
  subj.notify(2);
  subj.notify(7);
  subj.notify(10);

  assert(
    JSON.stringify(log) === JSON.stringify(["even:2", "big:7", "even:10", "big:10"]),
    `Exercise 13: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 14 — Implement: Async Observer
// =============================================================================

async function exercise14(): Promise<void> {
  class AsyncSubject<T> {
    private listeners = new Set<(value: T) => Promise<void>>();

    subscribe(fn: (value: T) => Promise<void>): () => void {
      this.listeners.add(fn);
      return () => {
        this.listeners.delete(fn);
      };
    }

    async emit(value: T): Promise<void> {
      const promises: Array<Promise<void>> = [];
      for (const fn of this.listeners) {
        promises.push(fn(value));
      }
      await Promise.all(promises);
    }
  }

  clearLog();
  const subj = new AsyncSubject<string>();
  subj.subscribe(async (v) => {
    await new Promise((r) => setTimeout(r, 10));
    log.push(`slow:${v}`);
  });
  subj.subscribe(async (v) => {
    log.push(`fast:${v}`);
  });
  await subj.emit("ping");

  assert(
    JSON.stringify(log) === JSON.stringify(["fast:ping", "slow:ping"]),
    `Exercise 14: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// EXERCISE 15 — Implement: Store with Selectors (Redux-like)
// =============================================================================

function exercise15(): void {
  class MiniStore<S extends Record<string, unknown>> {
    private selectors: Array<{
      selector: (state: S) => unknown;
      fn: (value: unknown) => void;
      lastValue: unknown;
    }> = [];

    constructor(private state: S) {}

    getState(): S {
      return this.state;
    }

    setState(partial: Partial<S>): void {
      this.state = { ...this.state, ...partial };
      for (const entry of this.selectors) {
        const newValue = entry.selector(this.state);
        if (newValue !== entry.lastValue) {
          entry.lastValue = newValue;
          entry.fn(newValue);
        }
      }
    }

    select<R>(selector: (state: S) => R, fn: (value: R) => void): () => void {
      const entry = {
        selector: selector as (state: S) => unknown,
        fn: fn as (value: unknown) => void,
        lastValue: selector(this.state) as unknown,
      };
      this.selectors.push(entry);
      return () => {
        this.selectors = this.selectors.filter((e) => e !== entry);
      };
    }
  }

  type AppState = { count: number; name: string };

  clearLog();
  const store = new MiniStore<AppState>({ count: 0, name: "Alice" });
  store.select(
    (s) => s.count,
    (v) => log.push(`count:${v}`)
  );
  store.select(
    (s) => s.name,
    (v) => log.push(`name:${v}`)
  );
  store.setState({ count: 1 });
  store.setState({ count: 1 });
  store.setState({ name: "Bob" });
  store.setState({ count: 2, name: "Bob" });

  assert(
    JSON.stringify(log) === JSON.stringify(["count:1", "name:Bob", "count:2"]),
    `Exercise 15: ${JSON.stringify(log)}`
  );
}

// =============================================================================
// Runner
// =============================================================================

async function main(): Promise<void> {
  console.log("=== Observer Pattern — Solutions ===\n");

  exercise1();
  exercise2();
  exercise3();
  exercise4();
  exercise5();
  exercise6();
  exercise7();
  exercise8();
  exercise9();
  exercise10();
  exercise11();
  exercise12();
  exercise13();
  await exercise14();
  exercise15();

  console.log("\nDone.");
}

main();
