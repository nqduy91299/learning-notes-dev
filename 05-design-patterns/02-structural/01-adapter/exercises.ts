// ============================================================
// Adapter Pattern — Exercises
// ============================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx exercises.ts
// ============================================================

// ============================================================
// EXERCISE 1 — Predict the Output
// ============================================================
// What will be logged to the console?

interface Printer {
  print(text: string): string;
}

class OldPrinter {
  printDocument(text: string): string {
    return `[OLD] ${text}`;
  }
}

class PrinterAdapter implements Printer {
  constructor(private oldPrinter: OldPrinter) {}
  print(text: string): string {
    return this.oldPrinter.printDocument(text);
  }
}

const adapted = new PrinterAdapter(new OldPrinter());
// console.log(adapted.print("Hello"));
// console.log(adapted instanceof PrinterAdapter);
// console.log("print" in adapted);
// Your prediction:
// ???

// ============================================================
// EXERCISE 2 — Predict the Output
// ============================================================
// What will be logged?

interface ShapeArea {
  getArea(): number;
}

class Circle implements ShapeArea {
  constructor(private radius: number) {}
  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class SquarePeg {
  constructor(private side: number) {}
  getSide(): number {
    return this.side;
  }
}

class SquarePegAdapter implements ShapeArea {
  constructor(private peg: SquarePeg) {}
  getArea(): number {
    return this.peg.getSide() ** 2;
  }
}

const circle = new Circle(5);
const square = new SquarePegAdapter(new SquarePeg(5));
// console.log(circle.getArea() > square.getArea());
// console.log(Math.floor(circle.getArea()));
// console.log(square.getArea());
// Your prediction:
// ???

// ============================================================
// EXERCISE 3 — Predict the Output
// ============================================================
// What happens with method chaining through the adapter?

interface Chainable {
  setValue(key: string, value: string): Chainable;
  getValue(key: string): string;
}

class LegacyStore {
  private data: Map<string, string> = new Map();

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  get(key: string): string {
    return this.data.get(key) ?? "NOT_FOUND";
  }
}

class StoreAdapter implements Chainable {
  constructor(private store: LegacyStore) {}

  setValue(key: string, value: string): Chainable {
    this.store.set(key, value);
    return this;
  }

  getValue(key: string): string {
    return this.store.get(key);
  }
}

const store = new StoreAdapter(new LegacyStore());
// console.log(
//   store.setValue("a", "1").setValue("b", "2").getValue("a")
// );
// console.log(store.getValue("b"));
// console.log(store.getValue("c"));
// Your prediction:
// ???

// ============================================================
// EXERCISE 4 — Predict the Output
// ============================================================
// What is logged when the adapter uses a class adapter approach?

class TemperatureSensor {
  readCelsius(): number {
    return 100;
  }
}

interface FahrenheitReader {
  readFahrenheit(): number;
}

class TemperatureAdapter extends TemperatureSensor implements FahrenheitReader {
  readFahrenheit(): number {
    return this.readCelsius() * 9 / 5 + 32;
  }
}

const sensor = new TemperatureAdapter();
// console.log(sensor.readCelsius());
// console.log(sensor.readFahrenheit());
// console.log(sensor instanceof TemperatureSensor);
// Your prediction:
// ???

// ============================================================
// EXERCISE 5 — Predict the Output
// ============================================================
// What happens with multiple adapters wrapping the same adaptee?

class DataSource {
  private value: number = 0;

  write(val: number): void {
    this.value = val;
  }

  read(): number {
    return this.value;
  }
}

interface StringReader {
  readString(): string;
}

class StringAdapter implements StringReader {
  constructor(private source: DataSource) {}
  readString(): string {
    return `Value: ${this.source.read()}`;
  }
}

const source = new DataSource();
const readerA = new StringAdapter(source);
const readerB = new StringAdapter(source);

source.write(42);
// console.log(readerA.readString());
// console.log(readerB.readString());
// source.write(99);
// console.log(readerA.readString());
// Your prediction:
// ???

// ============================================================
// EXERCISE 6 — Fix the Bug
// ============================================================
// The adapter should convert XML strings to JSON strings, but it has a bug.
// Find and fix it without changing the interfaces.

interface JsonProcessor {
  process(json: string): string;
}

class XmlService {
  getData(): string {
    return "<data><name>Alice</name><age>30</age></data>";
  }
}

class XmlToJsonAdapter implements JsonProcessor {
  constructor(private xmlService: XmlService) {}

  process(_json: string): string {
    const xml = this.xmlService.getData();
    // Bug: This regex extraction is wrong — it doesn't capture the values
    const nameMatch = xml.match(/<name>(.*?)<\/name>/);
    const ageMatch = xml.match(/<age>(.*?)<\/age>/);
    const name = nameMatch ? nameMatch[0] : "unknown";  // BUG HERE
    const age = ageMatch ? ageMatch[0] : "0";            // BUG HERE
    return JSON.stringify({ name, age: Number(age) });
  }
}

// Expected: {"name":"Alice","age":30}
// const adapter6 = new XmlToJsonAdapter(new XmlService());
// console.log(adapter6.process(""));

// ============================================================
// EXERCISE 7 — Fix the Bug
// ============================================================
// The EventEmitter adapter doesn't properly unsubscribe handlers.
// Find and fix the bug.

interface EventBus {
  on(event: string, handler: () => void): void;
  off(event: string, handler: () => void): void;
  emit(event: string): void;
}

class LegacyEventSystem {
  private listeners: Map<string, Set<() => void>> = new Map();

  addListener(event: string, fn: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
  }

  removeListener(event: string, fn: () => void): void {
    this.listeners.get(event)?.delete(fn);
  }

  fireEvent(event: string): void {
    this.listeners.get(event)?.forEach((fn) => fn());
  }
}

class EventBusAdapter implements EventBus {
  private handlerMap = new Map<() => void, () => void>();

  constructor(private legacy: LegacyEventSystem) {}

  on(event: string, handler: () => void): void {
    const wrapper = () => handler();
    this.handlerMap.set(handler, wrapper);
    this.legacy.addListener(event, wrapper);
  }

  off(event: string, handler: () => void): void {
    // BUG: not using the stored wrapper
    this.legacy.removeListener(event, handler);
  }

  emit(event: string): void {
    this.legacy.fireEvent(event);
  }
}

// const legacy7 = new LegacyEventSystem();
// const bus = new EventBusAdapter(legacy7);
// let count = 0;
// const handler = () => { count++; };
// bus.on("click", handler);
// bus.emit("click");
// bus.off("click", handler);
// bus.emit("click");
// console.log(count); // Expected: 1, but bug causes: 2

// ============================================================
// EXERCISE 8 — Fix the Bug
// ============================================================
// The adapter for a cache service has a type mismatch bug.
// The cache stores strings, but the adapter should handle objects.

interface ObjectCache {
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | null;
}

class StringCache {
  private store = new Map<string, string>();

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  getItem(key: string): string | undefined {
    return this.store.get(key);
  }
}

class CacheAdapter implements ObjectCache {
  constructor(private cache: StringCache) {}

  set<T>(key: string, value: T): void {
    this.cache.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const raw = this.cache.getItem(key);
    if (raw === undefined) return null;
    return JSON.parse(raw) as T;  // BUG: what if raw is not valid JSON?
  }
}

// const cache8 = new CacheAdapter(new StringCache());
// cache8.set("user", { name: "Bob" });
// console.log(cache8.get<{ name: string }>("user")); // Expected: { name: "Bob" }
// console.log(cache8.get("missing")); // Expected: null
// Fix the bug so invalid JSON returns null instead of throwing

// ============================================================
// EXERCISE 9 — Implement: Basic Adapter
// ============================================================
// Implement an adapter that makes `ThirdPartyLogger` conform to `AppLogger`.

interface AppLogger {
  log(level: "info" | "warn" | "error", message: string): string;
}

class ThirdPartyLogger {
  info(msg: string): string {
    return `[INFO] ${msg}`;
  }
  warning(msg: string): string {
    return `[WARNING] ${msg}`;
  }
  error(msg: string): string {
    return `[ERROR] ${msg}`;
  }
}

// TODO: Implement LoggerAdapter
// class LoggerAdapter implements AppLogger { ... }

// const logger9 = new LoggerAdapter(new ThirdPartyLogger());
// console.log(logger9.log("info", "started"));    // [INFO] started
// console.log(logger9.log("warn", "low memory"));  // [WARNING] low memory
// console.log(logger9.log("error", "crashed"));     // [ERROR] crashed

// ============================================================
// EXERCISE 10 — Implement: Collection Adapter
// ============================================================
// Adapt `LegacyList` to conform to the `Iterable` interface using Symbol.iterator.

class LegacyList<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAt(index: number): T {
    return this.items[index];
  }

  size(): number {
    return this.items.length;
  }
}

// TODO: Implement IterableListAdapter<T> that wraps LegacyList<T>
// and implements Iterable<T> (Symbol.iterator).
// class IterableListAdapter<T> { ... }

// const list = new LegacyList<number>();
// list.add(10);
// list.add(20);
// list.add(30);
// const iterableList = new IterableListAdapter(list);
// for (const item of iterableList) {
//   console.log(item); // 10, 20, 30
// }
// console.log([...iterableList]); // [10, 20, 30]

// ============================================================
// EXERCISE 11 — Implement: Two-Way Adapter
// ============================================================
// Create a two-way adapter between Celsius and Fahrenheit temperature services.

interface CelsiusService {
  getTemperature(): number;      // returns Celsius
  setTemperature(c: number): void;
}

interface FahrenheitService {
  getTemp(): number;             // returns Fahrenheit
  setTemp(f: number): void;
}

class CelsiusDevice implements CelsiusService {
  private temp = 0;
  getTemperature(): number { return this.temp; }
  setTemperature(c: number): void { this.temp = c; }
}

class FahrenheitDevice implements FahrenheitService {
  private temp = 32;
  getTemp(): number { return this.temp; }
  setTemp(f: number): void { this.temp = f; }
}

// TODO: Implement TwoWayTempAdapter that implements BOTH interfaces.
// - When used as CelsiusService, it wraps a FahrenheitDevice.
// - When used as FahrenheitService, it wraps a CelsiusDevice.
// - Constructor takes either a CelsiusDevice or FahrenheitDevice.
// class TwoWayTempAdapter implements CelsiusService, FahrenheitService { ... }

// const fDevice = new FahrenheitDevice();
// fDevice.setTemp(212);
// const asC: CelsiusService = new TwoWayTempAdapter(fDevice);
// console.log(asC.getTemperature()); // 100

// const cDevice = new CelsiusDevice();
// cDevice.setTemperature(0);
// const asF: FahrenheitService = new TwoWayTempAdapter(cDevice);
// console.log(asF.getTemp()); // 32

// ============================================================
// EXERCISE 12 — Implement: Async Adapter
// ============================================================
// Adapt a callback-based file reader to a Promise-based interface.

interface AsyncFileReader {
  read(path: string): Promise<string>;
}

type ReadCallback = (err: Error | null, data: string) => void;

class CallbackFileReader {
  readFile(path: string, cb: ReadCallback): void {
    if (path.startsWith("/")) {
      setTimeout(() => cb(null, `Contents of ${path}`), 0);
    } else {
      setTimeout(() => cb(new Error(`Invalid path: ${path}`), ""), 0);
    }
  }
}

// TODO: Implement AsyncFileReaderAdapter
// class AsyncFileReaderAdapter implements AsyncFileReader { ... }

// const reader12 = new AsyncFileReaderAdapter(new CallbackFileReader());
// reader12.read("/etc/config").then(console.log);  // Contents of /etc/config
// reader12.read("bad").catch((e: Error) => console.log(e.message)); // Invalid path: bad

// ============================================================
// EXERCISE 13 — Implement: Generic Adapter Factory
// ============================================================
// Create a function that generates adapters dynamically from a mapping config.

interface FieldMapping {
  [targetField: string]: string;  // targetField -> sourceField
}

// TODO: Implement createAdapter that returns a function mapping source objects
// to target objects based on the field mapping.
// function createAdapter<S extends Record<string, unknown>, T>(
//   mapping: FieldMapping
// ): (source: S) => T { ... }

// interface ExternalProduct {
//   product_id: number;
//   product_name: string;
//   unit_price: number;
// }

// interface InternalProduct {
//   id: number;
//   name: string;
//   price: number;
// }

// const adaptProduct = createAdapter<ExternalProduct, InternalProduct>({
//   id: "product_id",
//   name: "product_name",
//   price: "unit_price",
// });

// const ext: ExternalProduct = { product_id: 1, product_name: "Widget", unit_price: 9.99 };
// console.log(adaptProduct(ext)); // { id: 1, name: "Widget", price: 9.99 }

// ============================================================
// EXERCISE 14 — Implement: Adapter with Caching
// ============================================================
// Implement an adapter that wraps a slow service and caches results.

interface FastLookup {
  lookup(id: string): string;
}

class SlowDatabase {
  private callCount = 0;
  query(id: string): string {
    this.callCount++;
    return `Result for ${id} (query #${this.callCount})`;
  }
  getCallCount(): number {
    return this.callCount;
  }
}

// TODO: Implement CachedDatabaseAdapter that:
// - Implements FastLookup
// - Caches results so the same id is only queried once
// - Has a clearCache() method
// class CachedDatabaseAdapter implements FastLookup { ... }

// const db = new SlowDatabase();
// const fast = new CachedDatabaseAdapter(db);
// console.log(fast.lookup("A")); // Result for A (query #1)
// console.log(fast.lookup("B")); // Result for B (query #2)
// console.log(fast.lookup("A")); // Result for A (query #1)  — cached!
// console.log(db.getCallCount()); // 2
// fast.clearCache();
// console.log(fast.lookup("A")); // Result for A (query #3)  — re-queried

// ============================================================
// EXERCISE 15 — Implement: Composable Adapters
// ============================================================
// Implement a system where adapters can be composed/chained.

interface DataTransformer<TIn, TOut> {
  transform(input: TIn): TOut;
}

// TODO: Implement composeAdapters that chains two transformers:
// A->B and B->C into A->C
// function composeAdapters<A, B, C>(
//   first: DataTransformer<A, B>,
//   second: DataTransformer<B, C>
// ): DataTransformer<A, C> { ... }

// Example transformers:
// const stringToNumber: DataTransformer<string, number> = {
//   transform: (input: string) => parseInt(input, 10),
// };
//
// const numberToBoolean: DataTransformer<number, boolean> = {
//   transform: (input: number) => input > 0,
// };
//
// const stringToBoolean = composeAdapters(stringToNumber, numberToBoolean);
// console.log(stringToBoolean.transform("42"));  // true
// console.log(stringToBoolean.transform("-1"));   // false
// console.log(stringToBoolean.transform("0"));    // false

// ============================================================
// All test code is commented out. Uncomment to test individually.
// Run with: npx tsx exercises.ts
// ============================================================
