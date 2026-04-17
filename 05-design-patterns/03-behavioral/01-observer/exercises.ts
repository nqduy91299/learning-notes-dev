// =============================================================================
// Observer Pattern — Exercises
// Run: npx tsx exercises.ts
// =============================================================================

// ─── Shared Types ────────────────────────────────────────────────────────────

interface Observer<T> {
  update(subject: T, event: string, data?: unknown): void;
}

interface Subject<T> {
  subscribe(event: string, observer: Observer<T>): void;
  unsubscribe(event: string, observer: Observer<T>): void;
  notify(event: string, data?: unknown): void;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const log: string[] = [];
function clearLog(): void {
  log.length = 0;
}

// =============================================================================
// EXERCISE 1 — Predict the Output
// What does `log` contain after running this code?
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
      for (const fn of this.observers) {
        fn(product);
      }
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

  // Predict: what is log?
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["A: Phone", "B: Phone", "B: Tablet"]),
  //   `Exercise 1 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 2 — Predict the Output
// Does subscribing the same function twice cause duplicate notifications?
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
  emitter.on(handler); // same reference added again
  emitter.emit(10);

  // Predict: what is log?
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["val:10"]),
  //   `Exercise 2 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 3 — Predict the Output
// What happens when an observer unsubscribes during notification?
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
    unsub2?.(); // unsubscribes second during iteration
  });

  unsub2 = ch.subscribe(() => {
    log.push("second");
  });

  ch.broadcast();
  ch.broadcast();

  // Predict: what is log?
  // Hint: Set iteration skips elements deleted during iteration only if they
  // haven't been visited yet. Since "second" is after "first", deleting it
  // before it's visited means it won't run in the first broadcast.
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["first", "first"]),
  //   `Exercise 3 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 4 — Predict the Output
// Typed event map with multiple events.
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

  // Predict: what is log?
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["click:1,2", "hover:3,4", "click:5,6"]),
  //   `Exercise 4 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 5 — Predict the Output
// Once-listener that auto-unsubscribes after first call.
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
      // snapshot to avoid issues when modifying during iteration
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

  // Predict: what is log?
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["once:A", "on:A", "on:B"]),
  //   `Exercise 5 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 6 — Fix the Bug
// The unsubscribe function doesn't work. Fix it.
// =============================================================================

function exercise6(): void {
  class Observable {
    private subs: Array<(v: number) => void> = [];

    subscribe(fn: (v: number) => void): () => void {
      this.subs.push(fn);
      return () => {
        // BUG: This doesn't actually remove the listener.
        this.subs.filter((s) => s !== fn);
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

  // Expected: ["v:1"]
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["v:1"]),
  //   `Exercise 6 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 7 — Fix the Bug
// Observers receive stale data because notify is called before state update.
// =============================================================================

function exercise7(): void {
  class StateHolder {
    private value = 0;
    private observers = new Set<(val: number) => void>();

    subscribe(fn: (val: number) => void): void {
      this.observers.add(fn);
    }

    // BUG: notify fires before the value is actually updated.
    setValue(newVal: number): void {
      this.notifyAll();
      this.value = newVal;
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

  // Expected: ["state:10", "state:20"]
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["state:10", "state:20"]),
  //   `Exercise 7 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 8 — Fix the Bug
// Wildcard "*" listeners should fire for every event, but they don't.
// =============================================================================

function exercise8(): void {
  class EventBus {
    private listeners = new Map<string, Set<(data: string) => void>>();

    on(event: string, fn: (data: string) => void): void {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event)!.add(fn);
    }

    emit(event: string, data: string): void {
      // BUG: wildcard listeners are never notified.
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

  // Expected: ["all:btn", "click:btn", "all:div"]
  // Test:
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["all:btn", "click:btn", "all:div"]),
  //   `Exercise 8 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 9 — Implement: Basic Subject
// Implement a Subject class with subscribe, unsubscribe, and notify methods.
// Observers are functions (value: T) => void.
// subscribe() should return an unsubscribe function.
// =============================================================================

function exercise9(): void {
  // TODO: Implement BasicSubject<T>
  // class BasicSubject<T> {
  //   subscribe(fn: (value: T) => void): () => void { ... }
  //   notify(value: T): void { ... }
  // }

  // Test:
  // clearLog();
  // const subj = new BasicSubject<string>();
  // const unsub1 = subj.subscribe((v) => log.push(`A:${v}`));
  // const unsub2 = subj.subscribe((v) => log.push(`B:${v}`));
  // subj.notify("hello");
  // unsub1();
  // subj.notify("world");
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["A:hello", "B:hello", "B:world"]),
  //   `Exercise 9 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 10 — Implement: Typed EventEmitter
// Implement a typed event emitter using a generic event map.
// Methods: on, off, emit
// =============================================================================

function exercise10(): void {
  // TODO: Implement TypedEmitter<E extends Record<string, unknown>>
  // class TypedEmitter<E extends Record<string, unknown>> {
  //   on<K extends keyof E>(event: K, fn: (data: E[K]) => void): void { ... }
  //   off<K extends keyof E>(event: K, fn: (data: E[K]) => void): void { ... }
  //   emit<K extends keyof E>(event: K, data: E[K]): void { ... }
  // }

  // type TestEvents = {
  //   message: { text: string };
  //   count: { value: number };
  // };

  // Test:
  // clearLog();
  // const emitter = new TypedEmitter<TestEvents>();
  // const handler = (d: { text: string }): void => { log.push(`msg:${d.text}`); };
  // emitter.on("message", handler);
  // emitter.on("count", (d) => log.push(`cnt:${d.value}`));
  // emitter.emit("message", { text: "hi" });
  // emitter.emit("count", { value: 42 });
  // emitter.off("message", handler);
  // emitter.emit("message", { text: "bye" });
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["msg:hi", "cnt:42"]),
  //   `Exercise 10 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 11 — Implement: Once Listener
// Implement a Subject that supports both `on` (persistent) and `once` (one-shot).
// =============================================================================

function exercise11(): void {
  // TODO: Implement OnceSubject<T>
  // class OnceSubject<T> {
  //   on(fn: (value: T) => void): () => void { ... }
  //   once(fn: (value: T) => void): void { ... }
  //   emit(value: T): void { ... }
  // }

  // Test:
  // clearLog();
  // const subj = new OnceSubject<number>();
  // subj.on((v) => log.push(`on:${v}`));
  // subj.once((v) => log.push(`once:${v}`));
  // subj.emit(1);
  // subj.emit(2);
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["on:1", "once:1", "on:2"]),
  //   `Exercise 11 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 12 — Implement: Property Observer
// Implement a class where setting a property notifies observers of the change.
// Observers receive both old and new values.
// =============================================================================

function exercise12(): void {
  // TODO: Implement ObservableProperty<T>
  // class ObservableProperty<T> {
  //   constructor(private _value: T) {}
  //   get value(): T { ... }
  //   set value(newVal: T) { ... }  // should notify if value changed
  //   onChange(fn: (oldVal: T, newVal: T) => void): () => void { ... }
  // }

  // Test:
  // clearLog();
  // const prop = new ObservableProperty(0);
  // const unsub = prop.onChange((o, n) => log.push(`${o}->${n}`));
  // prop.value = 5;
  // prop.value = 5;  // same value, should NOT notify
  // prop.value = 10;
  // unsub();
  // prop.value = 20;
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["0->5", "5->10"]),
  //   `Exercise 12 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 13 — Implement: Event Filtering Observer
// Implement a subject where subscribers can provide a filter predicate.
// Only events matching the filter are delivered.
// =============================================================================

function exercise13(): void {
  // TODO: Implement FilteredSubject<T>
  // class FilteredSubject<T> {
  //   subscribe(fn: (value: T) => void, filter: (value: T) => boolean): () => void { ... }
  //   notify(value: T): void { ... }
  // }

  // Test:
  // clearLog();
  // const subj = new FilteredSubject<number>();
  // subj.subscribe((v) => log.push(`even:${v}`), (v) => v % 2 === 0);
  // subj.subscribe((v) => log.push(`big:${v}`), (v) => v > 5);
  // subj.notify(2);
  // subj.notify(7);
  // subj.notify(10);
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["even:2", "big:7", "even:10", "big:10"]),
  //   `Exercise 13 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// EXERCISE 14 — Implement: Async Observer
// Implement a subject that notifies observers asynchronously and waits for
// all handlers to complete before returning from emit().
// =============================================================================

function exercise14(): Promise<void> {
  // TODO: Implement AsyncSubject<T>
  // class AsyncSubject<T> {
  //   subscribe(fn: (value: T) => Promise<void>): () => void { ... }
  //   async emit(value: T): Promise<void> { ... }
  // }

  // Test:
  // clearLog();
  // const subj = new AsyncSubject<string>();
  // subj.subscribe(async (v) => {
  //   await new Promise((r) => setTimeout(r, 10));
  //   log.push(`slow:${v}`);
  // });
  // subj.subscribe(async (v) => {
  //   log.push(`fast:${v}`);
  // });
  // await subj.emit("ping");
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["fast:ping", "slow:ping"]),
  //   `Exercise 14 failed: ${JSON.stringify(log)}`
  // );

  return Promise.resolve();
}

// =============================================================================
// EXERCISE 15 — Implement: Store with Selectors (Redux-like)
// Implement a simple store where subscribers can observe a derived slice of state.
// Subscribers only fire when their selected slice actually changes.
// =============================================================================

function exercise15(): void {
  // TODO: Implement MiniStore<S>
  // class MiniStore<S extends Record<string, unknown>> {
  //   constructor(private state: S) {}
  //   getState(): S { ... }
  //   setState(partial: Partial<S>): void { ... }
  //   select<R>(selector: (state: S) => R, fn: (value: R) => void): () => void { ... }
  // }

  // type AppState = { count: number; name: string };

  // Test:
  // clearLog();
  // const store = new MiniStore<AppState>({ count: 0, name: "Alice" });
  // store.select((s) => s.count, (v) => log.push(`count:${v}`));
  // store.select((s) => s.name, (v) => log.push(`name:${v}`));
  // store.setState({ count: 1 });
  // store.setState({ count: 1 }); // same value, should NOT notify count observer
  // store.setState({ name: "Bob" });
  // store.setState({ count: 2, name: "Bob" }); // only count changed
  // console.assert(
  //   JSON.stringify(log) === JSON.stringify(["count:1", "name:Bob", "count:2"]),
  //   `Exercise 15 failed: ${JSON.stringify(log)}`
  // );
}

// =============================================================================
// Runner
// =============================================================================

function main(): void {
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
  exercise14();
  exercise15();
  console.log("All exercises loaded. Uncomment tests to verify your answers.");
}

main();
