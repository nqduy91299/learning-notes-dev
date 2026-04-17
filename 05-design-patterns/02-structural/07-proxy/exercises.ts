// =============================================================================
// PROXY PATTERN - EXERCISES
// =============================================================================
// 12 exercises: 4 predict, 2 fix, 6 implement
// Config: ES2022, strict, ESNext modules
// Run: npx tsx exercises.ts
// =============================================================================

// =============================================================================
// EXERCISE 1 — PREDICT
// What does this print?
// =============================================================================

function exercise1(): void {
  interface Image {
    display(): string;
  }

  class RealImage implements Image {
    private loaded: boolean;

    constructor(private filename: string) {
      this.loaded = true;
      console.log(`  Loading ${filename} from disk...`);
    }

    display(): string {
      return `Displaying ${this.filename}`;
    }
  }

  class ProxyImage implements Image {
    private realImage: RealImage | null = null;

    constructor(private filename: string) {}

    display(): string {
      if (!this.realImage) {
        this.realImage = new RealImage(this.filename);
      }
      return this.realImage.display();
    }
  }

  const img = new ProxyImage("photo.jpg");
  console.log("Exercise 1a:", "Created proxy");
  const r1 = img.display();
  const r2 = img.display();
  console.log("Exercise 1b:", r1, r2);
  // YOUR PREDICTION:
  // "Created proxy" — no loading yet
  // Then "Loading photo.jpg from disk..." on first display()
  // r1 = "Displaying photo.jpg", r2 = "Displaying photo.jpg"
  // Second display() does NOT reload
}

// =============================================================================
// EXERCISE 2 — PREDICT
// What does this print?
// =============================================================================

function exercise2(): void {
  interface Service {
    request(data: string): string;
  }

  class RealService implements Service {
    request(data: string): string {
      return `Processed: ${data}`;
    }
  }

  class LoggingProxy implements Service {
    private log: string[] = [];

    constructor(private service: RealService) {}

    request(data: string): string {
      this.log.push(`Request: ${data}`);
      const result = this.service.request(data);
      this.log.push(`Response: ${result}`);
      return result;
    }

    getLog(): string[] { return [...this.log]; }
  }

  const proxy = new LoggingProxy(new RealService());
  proxy.request("hello");
  proxy.request("world");
  console.log("Exercise 2:", proxy.getLog());
  // YOUR PREDICTION:
  // ["Request: hello", "Response: Processed: hello", "Request: world", "Response: Processed: world"]
}

// =============================================================================
// EXERCISE 3 — PREDICT
// What does this print?
// =============================================================================

function exercise3(): void {
  interface DataStore {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  }

  class InMemoryStore implements DataStore {
    private data = new Map<string, string>();
    get(key: string): string | undefined { return this.data.get(key); }
    set(key: string, value: string): void { this.data.set(key, value); }
  }

  class CachingProxy implements DataStore {
    private cache = new Map<string, string>();
    private hitCount = 0;

    constructor(private store: InMemoryStore) {}

    get(key: string): string | undefined {
      if (this.cache.has(key)) {
        this.hitCount++;
        return this.cache.get(key);
      }
      const value = this.store.get(key);
      if (value !== undefined) {
        this.cache.set(key, value);
      }
      return value;
    }

    set(key: string, value: string): void {
      this.cache.delete(key);
      this.store.set(key, value);
    }

    getHitCount(): number { return this.hitCount; }
  }

  const store = new InMemoryStore();
  store.set("a", "1");
  const proxy = new CachingProxy(store);
  proxy.get("a"); // miss, caches
  proxy.get("a"); // hit
  proxy.get("a"); // hit
  proxy.set("a", "2"); // invalidates cache
  proxy.get("a"); // miss, re-caches
  proxy.get("a"); // hit

  console.log("Exercise 3:", proxy.getHitCount(), proxy.get("a"));
  // YOUR PREDICTION:
  // hitCount = 3, get("a") = "2" (and hitCount becomes 4 after this call)
}

// =============================================================================
// EXERCISE 4 — PREDICT
// What does this print?
// =============================================================================

function exercise4(): void {
  interface Calculator {
    compute(n: number): number;
  }

  class ExpensiveCalculator implements Calculator {
    compute(n: number): number {
      // Simulate expensive computation
      return n * n + 1;
    }
  }

  class MemoizingProxy implements Calculator {
    private cache = new Map<number, number>();

    constructor(private calculator: ExpensiveCalculator) {}

    compute(n: number): number {
      if (!this.cache.has(n)) {
        this.cache.set(n, this.calculator.compute(n));
      }
      return this.cache.get(n)!;
    }

    getCacheSize(): number { return this.cache.size; }
  }

  const proxy = new MemoizingProxy(new ExpensiveCalculator());
  const results = [
    proxy.compute(3),
    proxy.compute(5),
    proxy.compute(3),
    proxy.compute(5),
    proxy.compute(7),
  ];

  console.log("Exercise 4:", results, proxy.getCacheSize());
  // YOUR PREDICTION:
  // [10, 26, 10, 26, 50], cacheSize = 3
}

// =============================================================================
// EXERCISE 5 — FIX
// The protection proxy has bugs. Fix them.
// =============================================================================

function exercise5(): void {
  interface Document {
    read(): string;
    write(content: string): string;
    delete(): string;
  }

  class RealDocument implements Document {
    private content: string;

    constructor(private name: string, initialContent: string) {
      this.content = initialContent;
    }

    read(): string { return `[${this.name}]: ${this.content}`; }
    write(content: string): string {
      this.content = content;
      return `Written to ${this.name}`;
    }
    delete(): string { return `Deleted ${this.name}`; }
  }

  type Role = "viewer" | "editor" | "admin";

  class ProtectedDocument implements Document {
    constructor(
      private doc: RealDocument,
      private role: Role
    ) {}

    // BUG 1: Viewers should be able to read but this blocks them
    // BUG 2: Editors should be able to write but not delete; currently editors can delete
    // BUG 3: Only admin should delete, but there's no check
    read(): string {
      if (this.role !== "admin") {
        return "Access denied: read";
      }
      return this.doc.read();
    }

    write(content: string): string {
      if (this.role === "viewer") {
        return "Access denied: write";
      }
      return this.doc.write(content);
    }

    delete(): string {
      return this.doc.delete();
    }
  }

  const doc = new RealDocument("readme", "Hello");
  const viewer = new ProtectedDocument(doc, "viewer");
  const editor = new ProtectedDocument(doc, "editor");
  const admin = new ProtectedDocument(doc, "admin");

  console.log("Exercise 5:", viewer.read(), editor.write("Updated"), admin.delete());

  // TEST (uncomment to verify):
  // console.assert(viewer.read() === "[readme]: Hello", "Viewer can read");
  // console.assert(viewer.write("x") === "Access denied: write", "Viewer cannot write");
  // console.assert(viewer.delete() === "Access denied: delete", "Viewer cannot delete");
  // console.assert(editor.read().includes("readme"), "Editor can read");
  // console.assert(editor.write("Updated") === "Written to readme", "Editor can write");
  // console.assert(editor.delete() === "Access denied: delete", "Editor cannot delete");
  // console.assert(admin.delete() === "Deleted readme", "Admin can delete");
}

// =============================================================================
// EXERCISE 6 — FIX
// The caching proxy doesn't handle TTL correctly. Fix it.
// =============================================================================

function exercise6(): void {
  interface WeatherService {
    getTemperature(city: string): number;
  }

  class RealWeatherService implements WeatherService {
    private callCount = 0;

    getTemperature(city: string): number {
      this.callCount++;
      // Simulated temperatures
      const temps: Record<string, number> = { "NYC": 22, "LA": 28, "London": 15 };
      return temps[city] ?? 20;
    }

    getCallCount(): number { return this.callCount; }
  }

  class CachingWeatherProxy implements WeatherService {
    private cache = new Map<string, { value: number; timestamp: number }>();

    constructor(
      private service: RealWeatherService,
      private ttlMs: number
    ) {}

    // BUG 1: Never checks if cache entry has expired
    // BUG 2: Doesn't store timestamp when caching
    getTemperature(city: string): number {
      if (this.cache.has(city)) {
        return this.cache.get(city)!.value;
      }
      const temp = this.service.getTemperature(city);
      this.cache.set(city, { value: temp, timestamp: 0 });
      return temp;
    }
  }

  const service = new RealWeatherService();
  const proxy = new CachingWeatherProxy(service, 1000);

  const t1 = proxy.getTemperature("NYC");
  const t2 = proxy.getTemperature("NYC"); // should use cache if within TTL
  console.log("Exercise 6:", t1, t2, service.getCallCount());

  // TEST (uncomment to verify):
  // console.assert(t1 === 22, "NYC temperature");
  // console.assert(t2 === 22, "Cached NYC temperature");
  // console.assert(service.getCallCount() === 1, "Only 1 real call within TTL");
}

// =============================================================================
// EXERCISE 7 — IMPLEMENT
// Create a logging proxy for a UserService.
// =============================================================================

function exercise7(): void {
  interface UserService {
    getUser(id: number): string;
    createUser(name: string): string;
    deleteUser(id: number): string;
  }

  class RealUserService implements UserService {
    getUser(id: number): string { return `User #${id}`; }
    createUser(name: string): string { return `Created ${name}`; }
    deleteUser(id: number): string { return `Deleted #${id}`; }
  }

  // TODO: Implement LoggingUserProxy that:
  // - Implements UserService
  // - Wraps a RealUserService
  // - Logs every method call as: "CALL methodName(args)" before delegating
  // - Logs every result as: "RESULT methodName: result" after delegating
  // - Has getLogs(): string[] to retrieve all log entries

  // const service = new RealUserService();
  // const proxy = new LoggingUserProxy(service);
  // const r1 = proxy.getUser(1);
  // const r2 = proxy.createUser("Alice");
  // console.log("Exercise 7:", r1, r2, proxy.getLogs());

  // TEST (uncomment to verify):
  // console.assert(r1 === "User #1");
  // console.assert(r2 === "Created Alice");
  // const logs = proxy.getLogs();
  // console.assert(logs[0] === "CALL getUser(1)");
  // console.assert(logs[1] === "RESULT getUser: User #1");
  // console.assert(logs[2] === "CALL createUser(Alice)");
  // console.assert(logs[3] === "RESULT createUser: Created Alice");

  console.log("Exercise 7: Not implemented yet");
}

// =============================================================================
// EXERCISE 8 — IMPLEMENT
// Create a rate-limiting proxy.
// =============================================================================

function exercise8(): void {
  interface ApiClient {
    call(endpoint: string): string;
  }

  class RealApiClient implements ApiClient {
    call(endpoint: string): string {
      return `Response from ${endpoint}`;
    }
  }

  // TODO: Implement RateLimitingProxy that:
  // - Implements ApiClient
  // - Accepts maxCalls (number) and windowMs (number) in constructor
  // - Tracks calls within the time window
  // - If call count exceeds maxCalls within windowMs, returns "Rate limit exceeded"
  // - Otherwise delegates to the real client
  // - Has getCallCount(): number (calls made in current window)
  // For simplicity, use a simple counter that resets after windowMs from first call

  // const proxy = new RateLimitingProxy(new RealApiClient(), 3, 10000);
  // const r1 = proxy.call("/users");
  // const r2 = proxy.call("/posts");
  // const r3 = proxy.call("/comments");
  // const r4 = proxy.call("/tags"); // should be rate limited
  // console.log("Exercise 8:", r1, r2, r3, r4);

  // TEST (uncomment to verify):
  // console.assert(r1 === "Response from /users");
  // console.assert(r2 === "Response from /posts");
  // console.assert(r3 === "Response from /comments");
  // console.assert(r4 === "Rate limit exceeded");

  console.log("Exercise 8: Not implemented yet");
}

// =============================================================================
// EXERCISE 9 — IMPLEMENT
// Create a virtual proxy for lazy initialization of a heavy report generator.
// =============================================================================

function exercise9(): void {
  interface ReportGenerator {
    generate(data: number[]): string;
    getStatus(): string;
  }

  class HeavyReportGenerator implements ReportGenerator {
    private initialized = false;

    constructor() {
      // Simulate heavy initialization
      this.initialized = true;
    }

    generate(data: number[]): string {
      const sum = data.reduce((a, b) => a + b, 0);
      const avg = data.length > 0 ? sum / data.length : 0;
      return `Report: sum=${sum}, avg=${avg}, count=${data.length}`;
    }

    getStatus(): string {
      return this.initialized ? "ready" : "not initialized";
    }
  }

  // TODO: Implement LazyReportProxy that:
  // - Implements ReportGenerator
  // - Does NOT create HeavyReportGenerator until first method call
  // - Has isInitialized(): boolean — returns whether real generator exists
  // - Delegates all methods to the real generator once created

  // const proxy = new LazyReportProxy();
  // console.log("Before:", proxy.isInitialized()); // false
  // const report = proxy.generate([10, 20, 30]);
  // console.log("After:", proxy.isInitialized()); // true
  // console.log("Exercise 9:", report);

  // TEST (uncomment to verify):
  // console.assert(proxy.isInitialized() === false || proxy.isInitialized() === true);
  // After calling generate, it should be initialized
  // console.assert(report === "Report: sum=60, avg=20, count=3");
  // console.assert(proxy.getStatus() === "ready");

  console.log("Exercise 9: Not implemented yet");
}

// =============================================================================
// EXERCISE 10 — IMPLEMENT
// Create a retry proxy that retries failed operations.
// =============================================================================

function exercise10(): void {
  interface NetworkClient {
    fetch(url: string): string;
  }

  class UnreliableClient implements NetworkClient {
    private callCount = 0;
    private failUntil: number;

    constructor(failUntil: number) {
      this.failUntil = failUntil;
    }

    fetch(url: string): string {
      this.callCount++;
      if (this.callCount <= this.failUntil) {
        throw new Error(`Network error on attempt ${this.callCount}`);
      }
      return `Data from ${url}`;
    }

    getCallCount(): number { return this.callCount; }
  }

  // TODO: Implement RetryProxy that:
  // - Implements NetworkClient
  // - Takes a NetworkClient and maxRetries (number) in constructor
  // - Retries up to maxRetries times if the real client throws
  // - Returns the result if any attempt succeeds
  // - Throws the last error if all retries fail
  // - Has getAttempts(): number — total attempts made in last call

  // const client = new UnreliableClient(2); // fails first 2 calls
  // const proxy = new RetryProxy(client, 3);
  // const result = proxy.fetch("/api/data");
  // console.log("Exercise 10:", result, proxy.getAttempts());

  // TEST (uncomment to verify):
  // console.assert(result === "Data from /api/data", "Should succeed on 3rd try");
  // console.assert(proxy.getAttempts() === 3, "3 attempts total");
  // console.assert(client.getCallCount() === 3, "Client called 3 times");

  console.log("Exercise 10: Not implemented yet");
}

// =============================================================================
// EXERCISE 11 — IMPLEMENT
// Create a validation proxy that validates inputs before forwarding.
// =============================================================================

function exercise11(): void {
  interface UserRepository {
    save(user: { name: string; email: string; age: number }): string;
    findByEmail(email: string): string;
  }

  class RealUserRepository implements UserRepository {
    save(user: { name: string; email: string; age: number }): string {
      return `Saved ${user.name} (${user.email}, age ${user.age})`;
    }

    findByEmail(email: string): string {
      return `Found user with ${email}`;
    }
  }

  // TODO: Implement ValidatingProxy that:
  // - Implements UserRepository
  // - save(): validates:
  //   - name must be non-empty (after trim)
  //   - email must contain "@" and "."
  //   - age must be between 0 and 150
  //   Returns "Validation error: <field> invalid" for first failing field
  // - findByEmail(): validates email format, returns "Validation error: email invalid" if bad
  // - Delegates to real repository if all validations pass

  // const proxy = new ValidatingProxy(new RealUserRepository());
  // const r1 = proxy.save({ name: "Alice", email: "alice@test.com", age: 25 });
  // const r2 = proxy.save({ name: "", email: "alice@test.com", age: 25 });
  // const r3 = proxy.save({ name: "Bob", email: "bad-email", age: 25 });
  // const r4 = proxy.save({ name: "Carol", email: "c@d.com", age: -1 });
  // const r5 = proxy.findByEmail("alice@test.com");
  // const r6 = proxy.findByEmail("bad");
  // console.log("Exercise 11:", r1, r2, r3, r4, r5, r6);

  // TEST (uncomment to verify):
  // console.assert(r1 === "Saved Alice (alice@test.com, age 25)");
  // console.assert(r2 === "Validation error: name invalid");
  // console.assert(r3 === "Validation error: email invalid");
  // console.assert(r4 === "Validation error: age invalid");
  // console.assert(r5 === "Found user with alice@test.com");
  // console.assert(r6 === "Validation error: email invalid");

  console.log("Exercise 11: Not implemented yet");
}

// =============================================================================
// EXERCISE 12 — IMPLEMENT
// Create a metrics proxy that tracks method call counts and timings.
// =============================================================================

function exercise12(): void {
  interface SearchEngine {
    search(query: string): string[];
    index(doc: string): string;
  }

  class RealSearchEngine implements SearchEngine {
    search(query: string): string[] {
      // Simulate work
      return [`Result for "${query}"`];
    }

    index(doc: string): string {
      return `Indexed: ${doc}`;
    }
  }

  // TODO: Implement MetricsProxy that:
  // - Implements SearchEngine
  // - Tracks call count per method name
  // - Delegates to real search engine
  // - Has getMetrics(): Record<string, { calls: number }>
  // - Has getTotalCalls(): number

  // const proxy = new MetricsProxy(new RealSearchEngine());
  // proxy.search("hello");
  // proxy.search("world");
  // proxy.index("doc1");
  // proxy.search("hello");
  // proxy.index("doc2");
  // console.log("Exercise 12:", proxy.getMetrics(), proxy.getTotalCalls());

  // TEST (uncomment to verify):
  // const metrics = proxy.getMetrics();
  // console.assert(metrics["search"].calls === 3, "3 search calls");
  // console.assert(metrics["index"].calls === 2, "2 index calls");
  // console.assert(proxy.getTotalCalls() === 5, "5 total calls");

  console.log("Exercise 12: Not implemented yet");
}

// =============================================================================
// RUNNER
// =============================================================================

console.log("=== PROXY PATTERN EXERCISES ===\n");
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
