// ============================================================
// Adapter Pattern — Solutions
// ============================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx solutions.ts
// ============================================================

// ============================================================
// SOLUTION 1 — Predict the Output
// ============================================================
// Answer:
//   [OLD] Hello
//   true
//   true
//
// Explanation:
// - PrinterAdapter wraps OldPrinter and delegates print() to printDocument().
// - `adapted` IS an instance of PrinterAdapter.
// - The `in` operator checks the prototype chain — `print` exists on the adapter.

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
console.log("=== Solution 1 ===");
console.log(adapted.print("Hello"));
console.log(adapted instanceof PrinterAdapter);
console.log("print" in adapted);

// ============================================================
// SOLUTION 2 — Predict the Output
// ============================================================
// Answer:
//   true
//   78
//   25
//
// Explanation:
// - Circle area: π * 25 ≈ 78.54 → floor = 78
// - Square area: 5² = 25
// - 78.54 > 25 → true

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
console.log("\n=== Solution 2 ===");
console.log(circle.getArea() > square.getArea());
console.log(Math.floor(circle.getArea()));
console.log(square.getArea());

// ============================================================
// SOLUTION 3 — Predict the Output
// ============================================================
// Answer:
//   1
//   2
//   NOT_FOUND
//
// Explanation:
// - setValue returns `this`, enabling chaining.
// - After chaining, getValue("a") returns "1".
// - getValue("b") returns "2".
// - getValue("c") was never set → LegacyStore returns "NOT_FOUND".

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
console.log("\n=== Solution 3 ===");
console.log(store.setValue("a", "1").setValue("b", "2").getValue("a"));
console.log(store.getValue("b"));
console.log(store.getValue("c"));

// ============================================================
// SOLUTION 4 — Predict the Output
// ============================================================
// Answer:
//   100
//   212
//   true
//
// Explanation:
// - Class adapter extends TemperatureSensor, so readCelsius() returns 100.
// - readFahrenheit() = 100 * 9/5 + 32 = 212.
// - Since it extends TemperatureSensor, instanceof returns true.

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
console.log("\n=== Solution 4 ===");
console.log(sensor.readCelsius());
console.log(sensor.readFahrenheit());
console.log(sensor instanceof TemperatureSensor);

// ============================================================
// SOLUTION 5 — Predict the Output
// ============================================================
// Answer:
//   Value: 42
//   Value: 42
//   Value: 99
//
// Explanation:
// - Both adapters wrap the SAME DataSource instance (shared reference).
// - After write(42), both read "Value: 42".
// - After write(99), readerA reads "Value: 99" because the underlying source changed.

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
console.log("\n=== Solution 5 ===");
console.log(readerA.readString());
console.log(readerB.readString());
source.write(99);
console.log(readerA.readString());

// ============================================================
// SOLUTION 6 — Fix the Bug
// ============================================================
// Bug: nameMatch[0] returns the full match including tags: "<name>Alice</name>"
// Fix: Use nameMatch[1] to get the captured group.

interface JsonProcessor {
  process(json: string): string;
}

class XmlService {
  getData(): string {
    return "<data><name>Alice</name><age>30</age></data>";
  }
}

class XmlToJsonAdapterFixed implements JsonProcessor {
  constructor(private xmlService: XmlService) {}

  process(_json: string): string {
    const xml = this.xmlService.getData();
    const nameMatch = xml.match(/<name>(.*?)<\/name>/);
    const ageMatch = xml.match(/<age>(.*?)<\/age>/);
    const name = nameMatch ? nameMatch[1] : "unknown";  // FIX: [1] not [0]
    const age = ageMatch ? ageMatch[1] : "0";            // FIX: [1] not [0]
    return JSON.stringify({ name, age: Number(age) });
  }
}

console.log("\n=== Solution 6 ===");
const adapter6 = new XmlToJsonAdapterFixed(new XmlService());
console.log(adapter6.process(""));
// Output: {"name":"Alice","age":30}

// ============================================================
// SOLUTION 7 — Fix the Bug
// ============================================================
// Bug: off() passes the original handler to removeListener, but on() registers
// a wrapper function. The legacy system doesn't know about the original handler.
// Fix: Look up the stored wrapper in handlerMap and pass that to removeListener.

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

class EventBusAdapterFixed implements EventBus {
  private handlerMap = new Map<() => void, () => void>();

  constructor(private legacy: LegacyEventSystem) {}

  on(event: string, handler: () => void): void {
    const wrapper = () => handler();
    this.handlerMap.set(handler, wrapper);
    this.legacy.addListener(event, wrapper);
  }

  off(event: string, handler: () => void): void {
    const wrapper = this.handlerMap.get(handler);
    if (wrapper) {
      this.legacy.removeListener(event, wrapper);  // FIX: use the wrapper
      this.handlerMap.delete(handler);
    }
  }

  emit(event: string): void {
    this.legacy.fireEvent(event);
  }
}

console.log("\n=== Solution 7 ===");
const legacy7 = new LegacyEventSystem();
const bus = new EventBusAdapterFixed(legacy7);
let count7 = 0;
const handler7 = () => { count7++; };
bus.on("click", handler7);
bus.emit("click");
bus.off("click", handler7);
bus.emit("click");
console.log(count7); // 1

// ============================================================
// SOLUTION 8 — Fix the Bug
// ============================================================
// Bug: If someone directly sets a non-JSON string via the underlying StringCache,
// JSON.parse will throw. More practically, the get method should handle parse errors.
// Fix: Wrap JSON.parse in a try-catch.

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

class CacheAdapterFixed implements ObjectCache {
  constructor(private cache: StringCache) {}

  set<T>(key: string, value: T): void {
    this.cache.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const raw = this.cache.getItem(key);
    if (raw === undefined) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;  // FIX: return null on invalid JSON instead of throwing
    }
  }
}

console.log("\n=== Solution 8 ===");
const cache8 = new CacheAdapterFixed(new StringCache());
cache8.set("user", { name: "Bob" });
console.log(cache8.get<{ name: string }>("user")); // { name: "Bob" }
console.log(cache8.get("missing")); // null

// ============================================================
// SOLUTION 9 — Basic Adapter
// ============================================================
// Map the unified `log(level, message)` interface to the specific methods on
// ThirdPartyLogger. The "warn" level maps to `warning()`.

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

class LoggerAdapter implements AppLogger {
  constructor(private logger: ThirdPartyLogger) {}

  log(level: "info" | "warn" | "error", message: string): string {
    switch (level) {
      case "info":
        return this.logger.info(message);
      case "warn":
        return this.logger.warning(message);
      case "error":
        return this.logger.error(message);
    }
  }
}

console.log("\n=== Solution 9 ===");
const logger9 = new LoggerAdapter(new ThirdPartyLogger());
console.log(logger9.log("info", "started"));
console.log(logger9.log("warn", "low memory"));
console.log(logger9.log("error", "crashed"));

// ============================================================
// SOLUTION 10 — Collection Adapter
// ============================================================
// Implement Symbol.iterator to bridge the index-based LegacyList to the
// iterable protocol. The generator function yields items by index.

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

class IterableListAdapter<T> implements Iterable<T> {
  constructor(private list: LegacyList<T>) {}

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.list.size(); i++) {
      yield this.list.getAt(i);
    }
  }
}

console.log("\n=== Solution 10 ===");
const list10 = new LegacyList<number>();
list10.add(10);
list10.add(20);
list10.add(30);
const iterableList = new IterableListAdapter(list10);
for (const item of iterableList) {
  console.log(item);
}
console.log([...iterableList]);

// ============================================================
// SOLUTION 11 — Two-Way Adapter
// ============================================================
// The adapter detects which device type it wraps and converts accordingly.
// Celsius ↔ Fahrenheit: F = C * 9/5 + 32, C = (F - 32) * 5/9

interface CelsiusService {
  getTemperature(): number;
  setTemperature(c: number): void;
}

interface FahrenheitService {
  getTemp(): number;
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

class TwoWayTempAdapter implements CelsiusService, FahrenheitService {
  private celsiusDevice?: CelsiusDevice;
  private fahrenheitDevice?: FahrenheitDevice;

  constructor(device: CelsiusDevice | FahrenheitDevice) {
    if (device instanceof CelsiusDevice) {
      this.celsiusDevice = device;
    } else {
      this.fahrenheitDevice = device;
    }
  }

  // CelsiusService implementation
  getTemperature(): number {
    if (this.celsiusDevice) {
      return this.celsiusDevice.getTemperature();
    }
    return (this.fahrenheitDevice!.getTemp() - 32) * 5 / 9;
  }

  setTemperature(c: number): void {
    if (this.celsiusDevice) {
      this.celsiusDevice.setTemperature(c);
    } else {
      this.fahrenheitDevice!.setTemp(c * 9 / 5 + 32);
    }
  }

  // FahrenheitService implementation
  getTemp(): number {
    if (this.fahrenheitDevice) {
      return this.fahrenheitDevice.getTemp();
    }
    return this.celsiusDevice!.getTemperature() * 9 / 5 + 32;
  }

  setTemp(f: number): void {
    if (this.fahrenheitDevice) {
      this.fahrenheitDevice.setTemp(f);
    } else {
      this.celsiusDevice!.setTemperature((f - 32) * 5 / 9);
    }
  }
}

console.log("\n=== Solution 11 ===");
const fDevice = new FahrenheitDevice();
fDevice.setTemp(212);
const asC: CelsiusService = new TwoWayTempAdapter(fDevice);
console.log(asC.getTemperature()); // 100

const cDevice = new CelsiusDevice();
cDevice.setTemperature(0);
const asF: FahrenheitService = new TwoWayTempAdapter(cDevice);
console.log(asF.getTemp()); // 32

// ============================================================
// SOLUTION 12 — Async Adapter
// ============================================================
// Wrap the callback-based readFile in a Promise. Reject on error, resolve on
// success.

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

class AsyncFileReaderAdapter implements AsyncFileReader {
  constructor(private reader: CallbackFileReader) {}

  read(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.reader.readFile(path, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

console.log("\n=== Solution 12 ===");
const reader12 = new AsyncFileReaderAdapter(new CallbackFileReader());
reader12.read("/etc/config").then((data) => console.log(data));
reader12.read("bad").catch((e: Error) => console.log(e.message));

// ============================================================
// SOLUTION 13 — Generic Adapter Factory
// ============================================================
// The factory reads the mapping and produces a function that copies source
// fields to target fields according to the mapping.

interface FieldMapping {
  [targetField: string]: string;
}

function createAdapter<S extends Record<string, unknown>, T>(
  mapping: FieldMapping
): (source: S) => T {
  return (source: S): T => {
    const result: Record<string, unknown> = {};
    for (const [targetField, sourceField] of Object.entries(mapping)) {
      result[targetField] = source[sourceField];
    }
    return result as T;
  };
}

interface ExternalProduct {
  product_id: number;
  product_name: string;
  unit_price: number;
}

interface InternalProduct {
  id: number;
  name: string;
  price: number;
}

console.log("\n=== Solution 13 ===");
const adaptProduct = createAdapter<ExternalProduct, InternalProduct>({
  id: "product_id",
  name: "product_name",
  price: "unit_price",
});

const ext: ExternalProduct = { product_id: 1, product_name: "Widget", unit_price: 9.99 };
console.log(adaptProduct(ext));

// ============================================================
// SOLUTION 14 — Adapter with Caching
// ============================================================
// The adapter maintains a Map<string, string> cache. On lookup, it checks
// the cache first. Only queries the database on a cache miss.

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

class CachedDatabaseAdapter implements FastLookup {
  private cache = new Map<string, string>();

  constructor(private db: SlowDatabase) {}

  lookup(id: string): string {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const result = this.db.query(id);
    this.cache.set(id, result);
    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

console.log("\n=== Solution 14 ===");
const db14 = new SlowDatabase();
const fast14 = new CachedDatabaseAdapter(db14);
console.log(fast14.lookup("A")); // Result for A (query #1)
console.log(fast14.lookup("B")); // Result for B (query #2)
console.log(fast14.lookup("A")); // Result for A (query #1) — cached
console.log(db14.getCallCount()); // 2
fast14.clearCache();
console.log(fast14.lookup("A")); // Result for A (query #3) — re-queried

// ============================================================
// SOLUTION 15 — Composable Adapters
// ============================================================
// composeAdapters returns a new DataTransformer whose transform method
// pipes the input through first, then second.

interface DataTransformer<TIn, TOut> {
  transform(input: TIn): TOut;
}

function composeAdapters<A, B, C>(
  first: DataTransformer<A, B>,
  second: DataTransformer<B, C>
): DataTransformer<A, C> {
  return {
    transform(input: A): C {
      return second.transform(first.transform(input));
    },
  };
}

console.log("\n=== Solution 15 ===");
const stringToNumber: DataTransformer<string, number> = {
  transform: (input: string) => parseInt(input, 10),
};

const numberToBoolean: DataTransformer<number, boolean> = {
  transform: (input: number) => input > 0,
};

const stringToBoolean = composeAdapters(stringToNumber, numberToBoolean);
console.log(stringToBoolean.transform("42"));  // true
console.log(stringToBoolean.transform("-1"));   // false
console.log(stringToBoolean.transform("0"));    // false

// ============================================================
// Runner
// ============================================================
console.log("\n=== All solutions executed successfully ===");
