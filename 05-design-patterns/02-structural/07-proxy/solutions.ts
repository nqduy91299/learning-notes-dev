// =============================================================================
// PROXY PATTERN - SOLUTIONS
// =============================================================================
// Config: ES2022, strict, ESNext modules
// Run: npx tsx solutions.ts
// =============================================================================

// =============================================================================
// EXERCISE 1 — PREDICT (ANSWER)
// =============================================================================

function solution1(): void {
  interface Image {
    display(): string;
  }

  class RealImage implements Image {
    constructor(private filename: string) {
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
  console.log("Solution 1a:", "Created proxy");
  // No loading yet — lazy!
  const r1 = img.display();
  // "Loading photo.jpg from disk..." printed on first call
  const r2 = img.display();
  // No loading on second call — already cached
  console.log("Solution 1b:", r1, r2);
  console.assert(r1 === "Displaying photo.jpg");
  console.assert(r2 === "Displaying photo.jpg");
}

// =============================================================================
// EXERCISE 2 — PREDICT (ANSWER)
// =============================================================================

function solution2(): void {
  interface Service {
    request(data: string): string;
  }

  class RealService implements Service {
    request(data: string): string { return `Processed: ${data}`; }
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
  console.log("Solution 2:", proxy.getLog());
  // ANSWER: ["Request: hello", "Response: Processed: hello", "Request: world", "Response: Processed: world"]
  const log = proxy.getLog();
  console.assert(log.length === 4);
  console.assert(log[0] === "Request: hello");
  console.assert(log[3] === "Response: Processed: world");
}

// =============================================================================
// EXERCISE 3 — PREDICT (ANSWER)
// =============================================================================

function solution3(): void {
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
  proxy.get("a"); // miss -> caches "1"
  proxy.get("a"); // hit (1)
  proxy.get("a"); // hit (2)
  proxy.set("a", "2"); // invalidates cache, stores "2" in store
  proxy.get("a"); // miss -> caches "2"
  proxy.get("a"); // hit (3)

  // At this point hitCount = 3
  console.log("Solution 3:", proxy.getHitCount(), proxy.get("a"));
  // proxy.get("a") is another hit (4), returns "2"
  // ANSWER: 3, "2" — but the final get increments to 4
  console.assert(proxy.getHitCount() === 4); // 3 before + 1 from the final get
}

// =============================================================================
// EXERCISE 4 — PREDICT (ANSWER)
// =============================================================================

function solution4(): void {
  interface Calculator {
    compute(n: number): number;
  }

  class ExpensiveCalculator implements Calculator {
    compute(n: number): number { return n * n + 1; }
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
    proxy.compute(3),  // 10
    proxy.compute(5),  // 26
    proxy.compute(3),  // 10 (cached)
    proxy.compute(5),  // 26 (cached)
    proxy.compute(7),  // 50
  ];

  console.log("Solution 4:", results, proxy.getCacheSize());
  // ANSWER: [10, 26, 10, 26, 50], cacheSize = 3
  console.assert(JSON.stringify(results) === JSON.stringify([10, 26, 10, 26, 50]));
  console.assert(proxy.getCacheSize() === 3);
}

// =============================================================================
// EXERCISE 5 — FIX (SOLUTION)
// =============================================================================

function solution5(): void {
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
    constructor(private doc: RealDocument, private role: Role) {}

    // FIX 1: All roles can read
    read(): string {
      return this.doc.read();
    }

    // FIX: Only editor and admin can write
    write(content: string): string {
      if (this.role === "viewer") {
        return "Access denied: write";
      }
      return this.doc.write(content);
    }

    // FIX 2 & 3: Only admin can delete
    delete(): string {
      if (this.role !== "admin") {
        return "Access denied: delete";
      }
      return this.doc.delete();
    }
  }

  const doc = new RealDocument("readme", "Hello");
  const viewer = new ProtectedDocument(doc, "viewer");

  // Test viewer before any writes
  console.assert(viewer.read() === "[readme]: Hello", "Viewer can read");
  console.assert(viewer.write("x") === "Access denied: write", "Viewer cannot write");
  console.assert(viewer.delete() === "Access denied: delete", "Viewer cannot delete");

  const editor = new ProtectedDocument(doc, "editor");
  console.assert(editor.read() === "[readme]: Hello", "Editor can read");
  console.assert(editor.write("Updated") === "Written to readme", "Editor can write");
  console.assert(editor.delete() === "Access denied: delete", "Editor cannot delete");

  const admin = new ProtectedDocument(doc, "admin");
  console.assert(admin.delete() === "Deleted readme", "Admin can delete");

  console.log("Solution 5: All access control checks passed");
}

// =============================================================================
// EXERCISE 6 — FIX (SOLUTION)
// =============================================================================

function solution6(): void {
  interface WeatherService {
    getTemperature(city: string): number;
  }

  class RealWeatherService implements WeatherService {
    private callCount = 0;
    getTemperature(city: string): number {
      this.callCount++;
      const temps: Record<string, number> = { "NYC": 22, "LA": 28, "London": 15 };
      return temps[city] ?? 20;
    }
    getCallCount(): number { return this.callCount; }
  }

  class CachingWeatherProxy implements WeatherService {
    private cache = new Map<string, { value: number; timestamp: number }>();

    constructor(private service: RealWeatherService, private ttlMs: number) {}

    // FIX 1: Check if cache entry is expired
    // FIX 2: Store actual timestamp when caching
    getTemperature(city: string): number {
      const cached = this.cache.get(city);
      if (cached && (Date.now() - cached.timestamp) < this.ttlMs) {
        return cached.value;
      }
      const temp = this.service.getTemperature(city);
      this.cache.set(city, { value: temp, timestamp: Date.now() });
      return temp;
    }
  }

  const service = new RealWeatherService();
  const proxy = new CachingWeatherProxy(service, 1000);

  const t1 = proxy.getTemperature("NYC");
  const t2 = proxy.getTemperature("NYC"); // within TTL, uses cache
  console.log("Solution 6:", t1, t2, service.getCallCount());
  console.assert(t1 === 22);
  console.assert(t2 === 22);
  console.assert(service.getCallCount() === 1, "Only 1 real call within TTL");
}

// =============================================================================
// EXERCISE 7 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution7(): void {
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

  class LoggingUserProxy implements UserService {
    private logs: string[] = [];

    constructor(private service: RealUserService) {}

    getUser(id: number): string {
      this.logs.push(`CALL getUser(${id})`);
      const result = this.service.getUser(id);
      this.logs.push(`RESULT getUser: ${result}`);
      return result;
    }

    createUser(name: string): string {
      this.logs.push(`CALL createUser(${name})`);
      const result = this.service.createUser(name);
      this.logs.push(`RESULT createUser: ${result}`);
      return result;
    }

    deleteUser(id: number): string {
      this.logs.push(`CALL deleteUser(${id})`);
      const result = this.service.deleteUser(id);
      this.logs.push(`RESULT deleteUser: ${result}`);
      return result;
    }

    getLogs(): string[] { return [...this.logs]; }
  }

  const proxy = new LoggingUserProxy(new RealUserService());
  const r1 = proxy.getUser(1);
  const r2 = proxy.createUser("Alice");
  console.log("Solution 7:", r1, r2, proxy.getLogs());
  console.assert(r1 === "User #1");
  console.assert(r2 === "Created Alice");
  const logs = proxy.getLogs();
  console.assert(logs[0] === "CALL getUser(1)");
  console.assert(logs[1] === "RESULT getUser: User #1");
  console.assert(logs[2] === "CALL createUser(Alice)");
  console.assert(logs[3] === "RESULT createUser: Created Alice");
}

// =============================================================================
// EXERCISE 8 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution8(): void {
  interface ApiClient {
    call(endpoint: string): string;
  }

  class RealApiClient implements ApiClient {
    call(endpoint: string): string { return `Response from ${endpoint}`; }
  }

  class RateLimitingProxy implements ApiClient {
    private callCount = 0;
    private windowStart = 0;

    constructor(
      private client: RealApiClient,
      private maxCalls: number,
      private windowMs: number
    ) {}

    call(endpoint: string): string {
      const now = Date.now();
      if (this.windowStart === 0 || (now - this.windowStart) > this.windowMs) {
        this.windowStart = now;
        this.callCount = 0;
      }

      this.callCount++;
      if (this.callCount > this.maxCalls) {
        return "Rate limit exceeded";
      }

      return this.client.call(endpoint);
    }

    getCallCount(): number { return this.callCount; }
  }

  const proxy = new RateLimitingProxy(new RealApiClient(), 3, 10000);
  const r1 = proxy.call("/users");
  const r2 = proxy.call("/posts");
  const r3 = proxy.call("/comments");
  const r4 = proxy.call("/tags");

  console.log("Solution 8:", r1, r2, r3, r4);
  console.assert(r1 === "Response from /users");
  console.assert(r2 === "Response from /posts");
  console.assert(r3 === "Response from /comments");
  console.assert(r4 === "Rate limit exceeded");
}

// =============================================================================
// EXERCISE 9 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution9(): void {
  interface ReportGenerator {
    generate(data: number[]): string;
    getStatus(): string;
  }

  class HeavyReportGenerator implements ReportGenerator {
    private initialized = false;

    constructor() {
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

  class LazyReportProxy implements ReportGenerator {
    private generator: HeavyReportGenerator | null = null;

    private getGenerator(): HeavyReportGenerator {
      if (!this.generator) {
        this.generator = new HeavyReportGenerator();
      }
      return this.generator;
    }

    generate(data: number[]): string {
      return this.getGenerator().generate(data);
    }

    getStatus(): string {
      return this.getGenerator().getStatus();
    }

    isInitialized(): boolean {
      return this.generator !== null;
    }
  }

  const proxy = new LazyReportProxy();
  console.log("Before:", proxy.isInitialized()); // false
  const report = proxy.generate([10, 20, 30]);
  console.log("After:", proxy.isInitialized()); // true
  console.log("Solution 9:", report);
  console.assert(report === "Report: sum=60, avg=20, count=3");
  console.assert(proxy.getStatus() === "ready");
}

// =============================================================================
// EXERCISE 10 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution10(): void {
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

  class RetryProxy implements NetworkClient {
    private attempts = 0;

    constructor(
      private client: NetworkClient,
      private maxRetries: number
    ) {}

    fetch(url: string): string {
      this.attempts = 0;
      let lastError: Error | undefined;

      for (let i = 0; i < this.maxRetries; i++) {
        this.attempts++;
        try {
          return this.client.fetch(url);
        } catch (e) {
          lastError = e as Error;
        }
      }

      throw lastError!;
    }

    getAttempts(): number { return this.attempts; }
  }

  const client = new UnreliableClient(2); // fails first 2 calls
  const proxy = new RetryProxy(client, 3);
  const result = proxy.fetch("/api/data");
  console.log("Solution 10:", result, proxy.getAttempts());
  console.assert(result === "Data from /api/data");
  console.assert(proxy.getAttempts() === 3);
  console.assert(client.getCallCount() === 3);
}

// =============================================================================
// EXERCISE 11 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution11(): void {
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

  class ValidatingProxy implements UserRepository {
    constructor(private repo: RealUserRepository) {}

    private isValidEmail(email: string): boolean {
      return email.includes("@") && email.includes(".");
    }

    save(user: { name: string; email: string; age: number }): string {
      if (!user.name.trim()) return "Validation error: name invalid";
      if (!this.isValidEmail(user.email)) return "Validation error: email invalid";
      if (user.age < 0 || user.age > 150) return "Validation error: age invalid";
      return this.repo.save(user);
    }

    findByEmail(email: string): string {
      if (!this.isValidEmail(email)) return "Validation error: email invalid";
      return this.repo.findByEmail(email);
    }
  }

  const proxy = new ValidatingProxy(new RealUserRepository());
  const r1 = proxy.save({ name: "Alice", email: "alice@test.com", age: 25 });
  const r2 = proxy.save({ name: "", email: "alice@test.com", age: 25 });
  const r3 = proxy.save({ name: "Bob", email: "bad-email", age: 25 });
  const r4 = proxy.save({ name: "Carol", email: "c@d.com", age: -1 });
  const r5 = proxy.findByEmail("alice@test.com");
  const r6 = proxy.findByEmail("bad");

  console.log("Solution 11:", r1, r2, r3, r4, r5, r6);
  console.assert(r1 === "Saved Alice (alice@test.com, age 25)");
  console.assert(r2 === "Validation error: name invalid");
  console.assert(r3 === "Validation error: email invalid");
  console.assert(r4 === "Validation error: age invalid");
  console.assert(r5 === "Found user with alice@test.com");
  console.assert(r6 === "Validation error: email invalid");
}

// =============================================================================
// EXERCISE 12 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution12(): void {
  interface SearchEngine {
    search(query: string): string[];
    index(doc: string): string;
  }

  class RealSearchEngine implements SearchEngine {
    search(query: string): string[] { return [`Result for "${query}"`]; }
    index(doc: string): string { return `Indexed: ${doc}`; }
  }

  class MetricsProxy implements SearchEngine {
    private metrics = new Map<string, { calls: number }>();

    constructor(private engine: RealSearchEngine) {}

    private track(method: string): void {
      const current = this.metrics.get(method) ?? { calls: 0 };
      current.calls++;
      this.metrics.set(method, current);
    }

    search(query: string): string[] {
      this.track("search");
      return this.engine.search(query);
    }

    index(doc: string): string {
      this.track("index");
      return this.engine.index(doc);
    }

    getMetrics(): Record<string, { calls: number }> {
      return Object.fromEntries(this.metrics);
    }

    getTotalCalls(): number {
      let total = 0;
      for (const [, v] of this.metrics) {
        total += v.calls;
      }
      return total;
    }
  }

  const proxy = new MetricsProxy(new RealSearchEngine());
  proxy.search("hello");
  proxy.search("world");
  proxy.index("doc1");
  proxy.search("hello");
  proxy.index("doc2");

  console.log("Solution 12:", proxy.getMetrics(), proxy.getTotalCalls());
  const metrics = proxy.getMetrics();
  console.assert(metrics["search"].calls === 3);
  console.assert(metrics["index"].calls === 2);
  console.assert(proxy.getTotalCalls() === 5);
}

// =============================================================================
// RUNNER
// =============================================================================

console.log("=== PROXY PATTERN SOLUTIONS ===\n");
solution1();
solution2();
solution3();
solution4();
solution5();
solution6();
solution7();
solution8();
solution9();
solution10();
solution11();
solution12();
console.log("\nAll solutions passed!");
