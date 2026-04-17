// ============================================================================
// TOPIC 2: Clean Code Principles — Solutions
// ============================================================================
// Run: npx tsx 02-clean-code-principles/solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// MINI TEST FRAMEWORK
// ============================================================================

const testResults: { passed: number; failed: number; errors: string[] } = {
  passed: 0,
  failed: 0,
  errors: [],
};

function test(name: string, fn: () => void): void {
  try {
    fn();
    testResults.passed++;
    console.log(`  ✓ ${name}`);
  } catch (e: unknown) {
    testResults.failed++;
    const msg = e instanceof Error ? e.message : String(e);
    testResults.errors.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}: ${msg}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, label = ""): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label ? label + ": " : ""}Expected ${e}, got ${a}`);
}

// ============================================================================
// SOLUTION 1: Single Responsibility Principle
// ============================================================================
// BEFORE: One class handled validation, formatting, and saving.
// AFTER: Three separate, focused units.

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatFullName(first: string, last: string): string {
  return `${first} ${last}`.trim();
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
}

interface UserStore {
  save(data: UserData): string;
}

function createUserStore(
  validate: (email: string) => boolean,
  format: (first: string, last: string) => string
): UserStore {
  return {
    save(data: UserData): string {
      if (!validate(data.email)) return "invalid email";
      const name = format(data.firstName, data.lastName);
      return `saved: ${name}`;
    },
  };
}

test("Exercise 1: SRP - validateEmail", () => {
  assert(validateEmail("test@example.com"), "valid email should pass");
  assert(!validateEmail("invalid"), "invalid email should fail");
  assert(!validateEmail(""), "empty string should fail");
});

test("Exercise 1: SRP - formatFullName", () => {
  assertEqual(formatFullName("John", "Doe"), "John Doe");
  assertEqual(formatFullName("Jane", ""), "Jane");
});

test("Exercise 1: SRP - createUserStore", () => {
  const store = createUserStore(validateEmail, formatFullName);
  const result = store.save({ email: "a@b.com", firstName: "A", lastName: "B" });
  assert(result.includes("saved"), "should save valid user");
});

// ============================================================================
// SOLUTION 2: Open/Closed Principle
// ============================================================================
// BEFORE: Adding a notification type meant modifying a switch/if chain.
// AFTER: Register new channels without touching existing code.

interface NotificationChannel {
  send(to: string, message: string): string;
}

function createEmailChannel(): NotificationChannel {
  return {
    send(to: string, message: string): string {
      return `[email] to=${to}: ${message}`;
    },
  };
}

function createSmsChannel(): NotificationChannel {
  return {
    send(to: string, message: string): string {
      return `[sms] to=${to}: ${message}`;
    },
  };
}

function createSlackChannel(): NotificationChannel {
  return {
    send(to: string, message: string): string {
      return `[slack] to=${to}: ${message}`;
    },
  };
}

class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();

  registerChannel(name: string, channel: NotificationChannel): void {
    this.channels.set(name, channel);
  }

  notify(channelName: string, to: string, message: string): string {
    const channel = this.channels.get(channelName);
    if (!channel) return `unknown channel: ${channelName}`;
    return channel.send(to, message);
  }
}

test("Exercise 2: OCP - notification system", () => {
  const service = new NotificationService();
  service.registerChannel("email", createEmailChannel());
  service.registerChannel("sms", createSmsChannel());
  const result = service.notify("email", "user@test.com", "Hello");
  assert(result.includes("email"), "should use email channel");
  service.registerChannel("slack", createSlackChannel());
  const slackResult = service.notify("slack", "#general", "Hi team");
  assert(slackResult.includes("slack"), "should use slack channel");
});

// ============================================================================
// SOLUTION 3: Dependency Inversion
// ============================================================================
// BEFORE: OrderProcessor created its own PaymentGateway internally.
// AFTER: Dependencies injected through constructor.

interface PaymentGateway {
  charge(amount: number): { success: boolean; transactionId: string };
}

interface OrderLogger {
  log(message: string): void;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

class OrderProcessor {
  constructor(
    private payment: PaymentGateway,
    private logger: OrderLogger
  ) {}

  processOrder(items: OrderItem[]): { success: boolean; total: number; transactionId?: string } {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.logger.log(`Processing order: $${total}`);

    const result = this.payment.charge(total);
    if (result.success) {
      this.logger.log(`Payment successful: ${result.transactionId}`);
      return { success: true, total, transactionId: result.transactionId };
    }

    this.logger.log("Payment failed");
    return { success: false, total };
  }
}

test("Exercise 3: DIP - OrderProcessor", () => {
  const logs: string[] = [];
  const fakePayment: PaymentGateway = {
    charge: (amount) => ({ success: true, transactionId: `tx-${amount}` }),
  };
  const fakeLogger: OrderLogger = { log: (msg) => logs.push(msg) };
  const processor = new OrderProcessor(fakePayment, fakeLogger);
  const result = processor.processOrder([
    { name: "Widget", price: 10, quantity: 2 },
    { name: "Gadget", price: 25, quantity: 1 },
  ]);
  assert(result.success, "should succeed");
  assertEqual(result.total, 45);
  assert(result.transactionId === "tx-45", "should have transaction ID");
  assert(logs.length > 0, "should have logged");
});

// ============================================================================
// SOLUTION 4: Interface Segregation
// ============================================================================
// BEFORE: One fat DataService interface.
// AFTER: Readable, Writable, Exportable — each client uses only what it needs.

interface Readable {
  read(id: string): Record<string, unknown> | undefined;
  readAll(): Record<string, unknown>[];
}

interface Writable {
  create(data: Record<string, unknown>): string;
  update(id: string, data: Record<string, unknown>): boolean;
  delete(id: string): boolean;
}

function createReadOnlyStore(initialData: Record<string, unknown>[]): Readable {
  const items = new Map<string, Record<string, unknown>>();
  for (const item of initialData) {
    const id = item.id as string;
    items.set(id, { ...item });
  }

  return {
    read(id: string): Record<string, unknown> | undefined {
      return items.get(id);
    },
    readAll(): Record<string, unknown>[] {
      return [...items.values()];
    },
  };
}

function createReadWriteStore(): Readable & Writable {
  const items = new Map<string, Record<string, unknown>>();
  let nextId = 1;

  return {
    read(id: string): Record<string, unknown> | undefined {
      return items.get(id);
    },
    readAll(): Record<string, unknown>[] {
      return [...items.values()];
    },
    create(data: Record<string, unknown>): string {
      const id = String(nextId++);
      items.set(id, { ...data, id });
      return id;
    },
    update(id: string, data: Record<string, unknown>): boolean {
      if (!items.has(id)) return false;
      items.set(id, { ...items.get(id), ...data, id });
      return true;
    },
    delete(id: string): boolean {
      return items.delete(id);
    },
  };
}

test("Exercise 4: ISP - ReadOnlyStore", () => {
  const store = createReadOnlyStore([{ id: "1", name: "Alice" }]);
  assertEqual(store.readAll().length, 1);
  const item = store.read("1");
  assert(item !== undefined, "should find item");
  assertEqual(item!.name, "Alice");
});

test("Exercise 4: ISP - ReadWriteStore", () => {
  const store = createReadWriteStore();
  const id = store.create({ name: "Bob" });
  assert(typeof id === "string", "should return id");
  const item = store.read(id);
  assert(item !== undefined, "should find created item");
  assert(store.update(id, { name: "Bobby" }), "update should succeed");
  assert(store.delete(id), "delete should succeed");
  assertEqual(store.read(id), undefined);
});

// ============================================================================
// SOLUTION 5: Guard Clauses
// ============================================================================
// BEFORE: Deeply nested if/else blocks.
// AFTER: Flat structure with early returns.

interface ShippingOrder {
  items: { weight: number; fragile: boolean }[];
  destination: string | null;
  express: boolean;
}

function calculateShipping(order: ShippingOrder | null): number {
  if (!order) return 0;
  if (order.items.length === 0) return 0;
  if (!order.destination) return -1;

  let total = 0;
  for (const item of order.items) {
    total += item.weight * 2;
    if (item.fragile) total += 5;
  }

  if (order.express) total *= 2;
  if (order.destination === "international") total += 15;

  return total;
}

test("Exercise 5: guard clauses", () => {
  assertEqual(calculateShipping(null), 0);
  assertEqual(calculateShipping({ items: [], destination: "US", express: false }), 0);
  assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: null, express: false }), -1);
  assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: "US", express: false }), 10);
  assertEqual(calculateShipping({ items: [{ weight: 5, fragile: true }], destination: "US", express: false }), 15);
  assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: "US", express: true }), 20);
  assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: "international", express: false }), 25);
});

// ============================================================================
// SOLUTION 6: Composition Over Inheritance
// ============================================================================
// BEFORE: Deep class hierarchy.
// AFTER: Independent composable behaviors.

interface Loggable {
  log(message: string): string[];
  getLogs(): string[];
}

interface Cacheable {
  cache(key: string, value: unknown): void;
  getFromCache(key: string): unknown | undefined;
}

interface Retryable {
  withRetry<T>(fn: () => T, maxRetries: number): T;
}

function createLoggable(): Loggable {
  const logs: string[] = [];
  return {
    log(message: string): string[] {
      logs.push(message);
      return logs;
    },
    getLogs(): string[] {
      return [...logs];
    },
  };
}

function createCacheable(): Cacheable {
  const store = new Map<string, unknown>();
  return {
    cache(key: string, value: unknown): void {
      store.set(key, value);
    },
    getFromCache(key: string): unknown | undefined {
      return store.get(key);
    },
  };
}

function createRetryable(): Retryable {
  return {
    withRetry<T>(fn: () => T, maxRetries: number): T {
      let lastError: Error | undefined;
      for (let i = 0; i <= maxRetries; i++) {
        try {
          return fn();
        } catch (e: unknown) {
          lastError = e instanceof Error ? e : new Error(String(e));
        }
      }
      throw lastError;
    },
  };
}

test("Exercise 6: composition - loggable", () => {
  const logger = createLoggable();
  logger.log("hello");
  logger.log("world");
  assertEqual(logger.getLogs().length, 2);
});

test("Exercise 6: composition - cacheable", () => {
  const cache = createCacheable();
  cache.cache("key1", 42);
  assertEqual(cache.getFromCache("key1"), 42);
  assertEqual(cache.getFromCache("missing"), undefined);
});

test("Exercise 6: composition - retryable", () => {
  const retrier = createRetryable();
  let attempts = 0;
  const result = retrier.withRetry(() => {
    attempts++;
    if (attempts < 3) throw new Error("not yet");
    return "success";
  }, 5);
  assertEqual(result, "success");
  assertEqual(attempts, 3);
});

// ============================================================================
// SOLUTION 7: Replace Magic Numbers
// ============================================================================

const MIN_PASSWORD_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /\d/;

function calculatePasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length < MIN_PASSWORD_LENGTH) return "weak";
  if (HAS_UPPERCASE.test(password) && HAS_NUMBER.test(password)) return "strong";
  return "medium";
}

test("Exercise 7: no magic numbers", () => {
  assertEqual(calculatePasswordStrength("short"), "weak");
  assertEqual(calculatePasswordStrength("longenoughbutno"), "medium");
  assertEqual(calculatePasswordStrength("LongEnough1"), "strong");
  assertEqual(calculatePasswordStrength("abcdefgh"), "medium");
});

// ============================================================================
// SOLUTION 8: Meaningful Naming
// ============================================================================
// BEFORE: proc, d, n, a, s, t, r — completely unreadable.
// AFTER: Clear domain terminology.

interface LineItem {
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface OrderSummary {
  tier: string;
  totalAmount: number;
}

const PREMIUM_THRESHOLD = 1000;

function calculateOrderSummary(lineItems: LineItem[]): OrderSummary {
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const tier = totalAmount > PREMIUM_THRESHOLD ? "premium" : "standard";
  return { tier, totalAmount };
}

test("Exercise 8: meaningful naming", () => {
  const result = calculateOrderSummary([
    { productName: "Widget", unitPrice: 100, quantity: 5 },
    { productName: "Gadget", unitPrice: 200, quantity: 3 },
  ]);
  assertEqual(result.totalAmount, 1100);
  assertEqual(result.tier, "premium");
});

test("Exercise 8: standard tier", () => {
  const result = calculateOrderSummary([
    { productName: "Pen", unitPrice: 2, quantity: 10 },
  ]);
  assertEqual(result.totalAmount, 20);
  assertEqual(result.tier, "standard");
});

// ============================================================================
// SOLUTION 9 (PREDICT): SOLID violation
// ============================================================================

function exercise9_predict(): string {
  return "Single Responsibility Principle (SRP) — the class generates reports, sends emails, and logs to a database. Those are three separate responsibilities that should be in separate classes.";
}

test("Exercise 9: identify SOLID violation", () => {
  const answer = exercise9_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("single responsibility") || answer.toLowerCase().includes("srp"),
    "should identify SRP violation"
  );
});

// ============================================================================
// SOLUTION 10 (PREDICT): DRY vs premature abstraction
// ============================================================================

function exercise10_predict(): string {
  return "The developer is wrong — this is premature abstraction. The two functions represent different business domains (user age vs driver age) that may diverge in the future. Merging them would create coupling between unrelated concepts.";
}

test("Exercise 10: DRY vs premature abstraction", () => {
  const answer = exercise10_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("premature") ||
    answer.toLowerCase().includes("diverge") ||
    answer.toLowerCase().includes("different"),
    "should recognize these may diverge"
  );
});

// ============================================================================
// SOLUTION 11 (PREDICT): Code smell
// ============================================================================

function exercise11_predict(): string {
  return "Feature Envy — the Order class has multiple methods that only access Customer data. These methods belong on the Customer class. Also violates Law of Demeter by reaching through customer.address.";
}

test("Exercise 11: spot code smell", () => {
  const answer = exercise11_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("feature envy") || answer.toLowerCase().includes("demeter"),
    "should identify feature envy or Law of Demeter violation"
  );
});

// ============================================================================
// SOLUTION 12 (PREDICT): Guard clause benefit
// ============================================================================

function exercise12_predict(): string {
  return "b) Readability — guard clauses reduce nesting and make the happy path clear.";
}

test("Exercise 12: guard clause benefit", () => {
  const answer = exercise12_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("readability") || answer.toLowerCase().includes("b"),
    "guard clauses primarily improve readability"
  );
});

// ============================================================================
// SOLUTION 13 (PREDICT): Composition vs inheritance
// ============================================================================

function exercise13_predict(): string {
  return "RobotDog inherits eat() from Animal, but a robot doesn't eat — this violates Liskov Substitution. The hierarchy doesn't make sense; composition would let RobotDog have movement and barking behaviors without inheriting biological traits.";
}

test("Exercise 13: composition vs inheritance", () => {
  const answer = exercise13_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("eat") ||
    answer.toLowerCase().includes("liskov") ||
    answer.toLowerCase().includes("doesn't make sense"),
    "should identify that RobotDog shouldn't eat"
  );
});

// ============================================================================
// SOLUTION 14: Parameter Object
// ============================================================================
// BEFORE: 6 positional parameters.
// AFTER: Options object with optional properties.

interface NotificationOptions {
  to: string;
  subject: string;
  body: string;
  urgent?: boolean;
  html?: boolean;
  retries?: number;
}

function sendNotification(options: NotificationOptions): string {
  const { to, subject, body, urgent = false, html = false, retries = 1 } = options;
  const prefix = urgent ? "[urgent] " : "";
  const format = html ? "(html)" : "(text)";
  return `${prefix}${format} to=${to} subject="${subject}" body="${body}" retries=${retries}`;
}

test("Exercise 14: parameter object", () => {
  const result = sendNotification({
    to: "user@test.com",
    subject: "Hello",
    body: "World",
  });
  assert(result.includes("user@test.com"), "should include recipient");
  const urgentResult = sendNotification({
    to: "user@test.com",
    subject: "Alert",
    body: "Urgent!",
    urgent: true,
    retries: 3,
  });
  assert(urgentResult.includes("urgent"), "should indicate urgency");
});

// ============================================================================
// SOLUTION 15: Guard Clauses for Permissions
// ============================================================================
// BEFORE: Deeply nested if blocks.
// AFTER: Flat guard clauses.

interface Permission {
  role: "admin" | "editor" | "viewer";
  active: boolean;
  emailVerified: boolean;
}

function canPerformAction(user: Permission | null, action: string): boolean {
  if (!user) return false;
  if (!user.active) return false;
  if (!user.emailVerified) return false;

  if (action === "read") return true;
  if (action === "write") return user.role === "admin" || user.role === "editor";
  if (action === "delete") return user.role === "admin";

  return false;
}

test("Exercise 15: refactored conditionals", () => {
  assert(!canPerformAction(null, "read"), "null user can't read");
  assert(!canPerformAction({ role: "admin", active: false, emailVerified: true }, "read"), "inactive can't read");
  assert(!canPerformAction({ role: "admin", active: true, emailVerified: false }, "read"), "unverified can't read");
  assert(canPerformAction({ role: "viewer", active: true, emailVerified: true }, "read"), "viewer can read");
  assert(!canPerformAction({ role: "viewer", active: true, emailVerified: true }, "write"), "viewer can't write");
  assert(canPerformAction({ role: "editor", active: true, emailVerified: true }, "write"), "editor can write");
  assert(canPerformAction({ role: "admin", active: true, emailVerified: true }, "delete"), "admin can delete");
  assert(!canPerformAction({ role: "editor", active: true, emailVerified: true }, "delete"), "editor can't delete");
});

// ============================================================================
// SOLUTION 16: Polymorphic Shapes
// ============================================================================
// BEFORE: if/else chain checking shape.type.
// AFTER: Each shape implements area() — new shapes need no modification.

interface Shape {
  area(): number;
}

function createRectangle(width: number, height: number): Shape {
  return { area: () => width * height };
}

function createCircle(radius: number): Shape {
  return { area: () => Math.PI * radius * radius };
}

function createTriangle(base: number, height: number): Shape {
  return { area: () => 0.5 * base * height };
}

function calculateArea(shape: Shape): number {
  return shape.area();
}

test("Exercise 16: polymorphic shapes", () => {
  assertEqual(calculateArea(createRectangle(5, 10)), 50);
  const circleArea = calculateArea(createCircle(5));
  assert(Math.abs(circleArea - Math.PI * 25) < 0.001, "circle area");
  assertEqual(calculateArea(createTriangle(10, 6)), 30);
});

// ============================================================================
// SOLUTION 17: Law of Demeter
// ============================================================================
// BEFORE: order.customer.profile.address.city (train wreck).
// AFTER: order.getCustomerCity() — one level of access.

interface Address {
  city: string;
  state: string;
}

interface Profile {
  name: string;
  address: Address;
}

interface Customer {
  profile: Profile;
  getName(): string;
  getCity(): string;
}

interface Item {
  price: number;
  qty: number;
}

interface Order {
  customer: Customer;
  items: Item[];
  getCustomerName(): string;
  getCustomerCity(): string;
  getTotal(): number;
}

function createOrder(customer: Customer, items: Item[]): Order {
  return {
    customer,
    items,
    getCustomerName(): string {
      return customer.getName();
    },
    getCustomerCity(): string {
      return customer.getCity();
    },
    getTotal(): number {
      return items.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
  };
}

function getOrderSummary(order: Order): string {
  return `${order.getCustomerName()} from ${order.getCustomerCity()}: $${order.getTotal()}`;
}

test("Exercise 17: Law of Demeter", () => {
  const customer: Customer = {
    profile: { name: "Alice", address: { city: "Portland", state: "OR" } },
    getName() { return this.profile.name; },
    getCity() { return this.profile.address.city; },
  };
  const order = createOrder(customer, [{ price: 25, qty: 2 }, { price: 10, qty: 1 }]);
  assertEqual(getOrderSummary(order), "Alice from Portland: $60");
});

// ============================================================================
// SOLUTION 18: Reduce Function Complexity
// ============================================================================
// BEFORE: One function doing four things.
// AFTER: Four focused functions composed together.

interface DataRecord {
  type: string;
  value: number;
  active: boolean;
}

interface DataSummary {
  sum: number;
  average: number;
  activeCount: number;
  uniqueTypes: string[];
}

function sumActiveValues(records: DataRecord[]): number {
  return records
    .filter((r) => r.active)
    .reduce((sum, r) => sum + r.value, 0);
}

function countActive(records: DataRecord[]): number {
  return records.filter((r) => r.active).length;
}

function getUniqueTypes(records: DataRecord[]): string[] {
  return [...new Set(records.map((r) => r.type))];
}

function processData(records: DataRecord[]): DataSummary {
  const sum = sumActiveValues(records);
  const activeCount = countActive(records);
  const average = activeCount > 0 ? sum / activeCount : 0;
  const uniqueTypes = getUniqueTypes(records);
  return { sum, average, activeCount, uniqueTypes };
}

test("Exercise 18: reduced complexity", () => {
  const records: DataRecord[] = [
    { type: "A", value: 10, active: true },
    { type: "B", value: 20, active: false },
    { type: "A", value: 30, active: true },
  ];
  const result = processData(records);
  assertEqual(result.sum, 40);
  assertEqual(result.average, 20);
  assertEqual(result.activeCount, 2);
  assertEqual(result.uniqueTypes.sort(), ["A", "B"]);
});

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n=== Clean Code Principles — Solutions ===\n");

process.on("exit", () => {
  console.log(`\n--- Results: ${testResults.passed} passed, ${testResults.failed} failed ---`);
  if (testResults.errors.length > 0) {
    console.log("\nFailures:");
    testResults.errors.forEach((e) => console.log(`  • ${e}`));
  }
});
