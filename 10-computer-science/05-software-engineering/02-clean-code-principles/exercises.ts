// ============================================================================
// TOPIC 2: Clean Code Principles — Exercises
// ============================================================================
// Run: npx tsx 02-clean-code-principles/exercises.ts
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
// EXERCISE 1 (IMPLEMENT): Apply Single Responsibility Principle
// Difficulty: ★★★
// Topics: SRP, separation of concerns
// ============================================================================
// This class violates SRP — it handles user data, validation, and formatting.
// Refactor into separate focused units.

// BEFORE (violates SRP):
// class UserManager {
//   validateEmail(email: string): boolean {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   }
//   formatUser(first: string, last: string): string {
//     return `${first} ${last}`.trim();
//   }
//   saveUser(user: { email: string; name: string }): string {
//     if (!this.validateEmail(user.email)) return "invalid";
//     return `saved: ${this.formatUser(user.name, "")}`;
//   }
// }

// Implement three separate units:
function validateEmail(email: string): boolean {
  // YOUR CODE HERE
  return false;
}

function formatFullName(first: string, last: string): string {
  // YOUR CODE HERE
  return "";
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
  // YOUR CODE HERE
  return undefined as unknown as UserStore;
}

// Tests:
// test("Exercise 1: SRP - validateEmail", () => {
//   assert(validateEmail("test@example.com"), "valid email should pass");
//   assert(!validateEmail("invalid"), "invalid email should fail");
//   assert(!validateEmail(""), "empty string should fail");
// });
// test("Exercise 1: SRP - formatFullName", () => {
//   assertEqual(formatFullName("John", "Doe"), "John Doe");
//   assertEqual(formatFullName("Jane", ""), "Jane");
// });
// test("Exercise 1: SRP - createUserStore", () => {
//   const store = createUserStore(validateEmail, formatFullName);
//   const result = store.save({ email: "a@b.com", firstName: "A", lastName: "B" });
//   assert(result.includes("saved"), "should save valid user");
// });

// ============================================================================
// EXERCISE 2 (IMPLEMENT): Apply Open/Closed Principle
// Difficulty: ★★★
// Topics: OCP, strategy pattern
// ============================================================================
// Implement a notification system where new channels can be added without
// modifying existing code.

interface NotificationChannel {
  send(to: string, message: string): string;
}

function createEmailChannel(): NotificationChannel {
  // YOUR CODE HERE
  return undefined as unknown as NotificationChannel;
}

function createSmsChannel(): NotificationChannel {
  // YOUR CODE HERE
  return undefined as unknown as NotificationChannel;
}

function createSlackChannel(): NotificationChannel {
  // YOUR CODE HERE
  return undefined as unknown as NotificationChannel;
}

class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();

  registerChannel(name: string, channel: NotificationChannel): void {
    // YOUR CODE HERE
  }

  notify(channelName: string, to: string, message: string): string {
    // YOUR CODE HERE
    return "";
  }
}

// Tests:
// test("Exercise 2: OCP - notification system", () => {
//   const service = new NotificationService();
//   service.registerChannel("email", createEmailChannel());
//   service.registerChannel("sms", createSmsChannel());
//   const result = service.notify("email", "user@test.com", "Hello");
//   assert(result.includes("email"), "should use email channel");
//   // Add new channel without modifying NotificationService:
//   service.registerChannel("slack", createSlackChannel());
//   const slackResult = service.notify("slack", "#general", "Hi team");
//   assert(slackResult.includes("slack"), "should use slack channel");
// });

// ============================================================================
// EXERCISE 3 (IMPLEMENT): Apply Dependency Inversion
// Difficulty: ★★★
// Topics: DIP, dependency injection
// ============================================================================
// Implement an OrderProcessor that depends on abstractions, not concretions.

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
  // Inject dependencies through constructor
  constructor(
    private payment: PaymentGateway,
    private logger: OrderLogger
  ) {}

  processOrder(items: OrderItem[]): { success: boolean; total: number; transactionId?: string } {
    // YOUR CODE HERE
    // 1. Calculate total
    // 2. Log the order
    // 3. Charge via payment gateway
    // 4. Return result
    return { success: false, total: 0 };
  }
}

// Tests:
// test("Exercise 3: DIP - OrderProcessor", () => {
//   const logs: string[] = [];
//   const fakePayment: PaymentGateway = {
//     charge: (amount) => ({ success: true, transactionId: `tx-${amount}` }),
//   };
//   const fakeLogger: OrderLogger = { log: (msg) => logs.push(msg) };
//   const processor = new OrderProcessor(fakePayment, fakeLogger);
//   const result = processor.processOrder([
//     { name: "Widget", price: 10, quantity: 2 },
//     { name: "Gadget", price: 25, quantity: 1 },
//   ]);
//   assert(result.success, "should succeed");
//   assertEqual(result.total, 45);
//   assert(result.transactionId === "tx-45", "should have transaction ID");
//   assert(logs.length > 0, "should have logged");
// });

// ============================================================================
// EXERCISE 4 (IMPLEMENT): Interface Segregation
// Difficulty: ★★★
// Topics: ISP, focused interfaces
// ============================================================================
// Split this fat interface into focused ones and implement them.

// FAT INTERFACE (don't use this):
// interface DataService {
//   read(id: string): Record<string, unknown> | undefined;
//   readAll(): Record<string, unknown>[];
//   create(data: Record<string, unknown>): string;
//   update(id: string, data: Record<string, unknown>): boolean;
//   delete(id: string): boolean;
//   export(): string;
//   import(data: string): void;
// }

interface Readable {
  read(id: string): Record<string, unknown> | undefined;
  readAll(): Record<string, unknown>[];
}

interface Writable {
  create(data: Record<string, unknown>): string;
  update(id: string, data: Record<string, unknown>): boolean;
  delete(id: string): boolean;
}

interface Exportable {
  exportData(): string;
  importData(data: string): void;
}

function createReadOnlyStore(initialData: Record<string, unknown>[]): Readable {
  // YOUR CODE HERE
  return undefined as unknown as Readable;
}

function createReadWriteStore(): Readable & Writable {
  // YOUR CODE HERE
  return undefined as unknown as Readable & Writable;
}

// Tests:
// test("Exercise 4: ISP - ReadOnlyStore", () => {
//   const store = createReadOnlyStore([{ id: "1", name: "Alice" }]);
//   assertEqual(store.readAll().length, 1);
//   const item = store.read("1");
//   assert(item !== undefined, "should find item");
//   assertEqual(item!.name, "Alice");
// });
// test("Exercise 4: ISP - ReadWriteStore", () => {
//   const store = createReadWriteStore();
//   const id = store.create({ name: "Bob" });
//   assert(typeof id === "string", "should return id");
//   const item = store.read(id);
//   assert(item !== undefined, "should find created item");
//   assert(store.update(id, { name: "Bobby" }), "update should succeed");
//   assert(store.delete(id), "delete should succeed");
//   assertEqual(store.read(id), undefined);
// });

// ============================================================================
// EXERCISE 5 (IMPLEMENT): Guard Clauses
// Difficulty: ★★
// Topics: Early return, readability
// ============================================================================
// Refactor this deeply nested function using guard clauses.

interface ShippingOrder {
  items: { weight: number; fragile: boolean }[];
  destination: string | null;
  express: boolean;
}

function calculateShipping(order: ShippingOrder | null): number {
  // Rewrite using guard clauses (early returns)
  // Rules:
  // - null order → 0
  // - no items → 0
  // - no destination → -1 (error)
  // - base cost = sum of (weight * 2) for each item
  // - fragile items add 5 each
  // - express doubles total
  // - destination "international" adds 15

  // YOUR CODE HERE
  return 0;
}

// Tests:
// test("Exercise 5: guard clauses", () => {
//   assertEqual(calculateShipping(null), 0);
//   assertEqual(calculateShipping({ items: [], destination: "US", express: false }), 0);
//   assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: null, express: false }), -1);
//   assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: "US", express: false }), 10);
//   assertEqual(calculateShipping({ items: [{ weight: 5, fragile: true }], destination: "US", express: false }), 15);
//   assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: "US", express: true }), 20);
//   assertEqual(calculateShipping({ items: [{ weight: 5, fragile: false }], destination: "international", express: false }), 25);
// });

// ============================================================================
// EXERCISE 6 (IMPLEMENT): Composition Over Inheritance
// Difficulty: ★★★
// Topics: Composition, mixins
// ============================================================================
// Instead of class hierarchy, compose behaviors.

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
  // YOUR CODE HERE
  return undefined as unknown as Loggable;
}

function createCacheable(): Cacheable {
  // YOUR CODE HERE
  return undefined as unknown as Cacheable;
}

function createRetryable(): Retryable {
  // YOUR CODE HERE
  return undefined as unknown as Retryable;
}

// Tests:
// test("Exercise 6: composition - loggable", () => {
//   const logger = createLoggable();
//   logger.log("hello");
//   logger.log("world");
//   assertEqual(logger.getLogs().length, 2);
// });
// test("Exercise 6: composition - cacheable", () => {
//   const cache = createCacheable();
//   cache.cache("key1", 42);
//   assertEqual(cache.getFromCache("key1"), 42);
//   assertEqual(cache.getFromCache("missing"), undefined);
// });
// test("Exercise 6: composition - retryable", () => {
//   const retrier = createRetryable();
//   let attempts = 0;
//   const result = retrier.withRetry(() => {
//     attempts++;
//     if (attempts < 3) throw new Error("not yet");
//     return "success";
//   }, 5);
//   assertEqual(result, "success");
//   assertEqual(attempts, 3);
// });

// ============================================================================
// EXERCISE 7 (IMPLEMENT): Replace Magic Numbers
// Difficulty: ★★
// Topics: Named constants, readability
// ============================================================================
// Refactor this function to eliminate magic numbers.

function calculatePasswordStrength(password: string): "weak" | "medium" | "strong" {
  // Replace all magic numbers with named constants
  // Rules:
  // - length < 8 → weak
  // - length >= 8, has uppercase + number → strong
  // - otherwise → medium
  // YOUR CODE HERE
  return "weak";
}

// Tests:
// test("Exercise 7: no magic numbers", () => {
//   assertEqual(calculatePasswordStrength("short"), "weak");
//   assertEqual(calculatePasswordStrength("longenoughbutno"), "medium");
//   assertEqual(calculatePasswordStrength("LongEnough1"), "strong");
//   assertEqual(calculatePasswordStrength("abcdefgh"), "medium");
// });

// ============================================================================
// EXERCISE 8 (IMPLEMENT): Meaningful Naming Refactor
// Difficulty: ★★
// Topics: Naming conventions
// ============================================================================
// Rewrite this function with meaningful names and clear intent.

// BEFORE (bad names):
// function proc(d: { n: string; a: number; s: number }[]): { r: string; t: number } {
//   let t = 0;
//   for (const i of d) {
//     t += i.a * i.s;
//   }
//   const r = t > 1000 ? "premium" : "standard";
//   return { r, t };
// }

interface LineItem {
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface OrderSummary {
  tier: string;
  totalAmount: number;
}

function calculateOrderSummary(lineItems: LineItem[]): OrderSummary {
  // YOUR CODE HERE
  return { tier: "", totalAmount: 0 };
}

// Tests:
// test("Exercise 8: meaningful naming", () => {
//   const result = calculateOrderSummary([
//     { productName: "Widget", unitPrice: 100, quantity: 5 },
//     { productName: "Gadget", unitPrice: 200, quantity: 3 },
//   ]);
//   assertEqual(result.totalAmount, 1100);
//   assertEqual(result.tier, "premium");
// });
// test("Exercise 8: standard tier", () => {
//   const result = calculateOrderSummary([
//     { productName: "Pen", unitPrice: 2, quantity: 10 },
//   ]);
//   assertEqual(result.totalAmount, 20);
//   assertEqual(result.tier, "standard");
// });

// ============================================================================
// EXERCISE 9 (PREDICT): Which SOLID principle is violated?
// Difficulty: ★★
// ============================================================================

function exercise9_predict(): string {
  // class ReportGenerator {
  //   generatePDF(data: unknown): string { return "pdf"; }
  //   generateCSV(data: unknown): string { return "csv"; }
  //   sendEmail(to: string, report: string): void { /* ... */ }
  //   logToDatabase(report: string): void { /* ... */ }
  // }
  //
  // Which SOLID principle(s) does this violate?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 9: identify SOLID violation", () => {
//   const answer = exercise9_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(answer.toLowerCase().includes("single responsibility") || answer.toLowerCase().includes("srp"),
//     "should identify SRP violation");
// });

// ============================================================================
// EXERCISE 10 (PREDICT): Is this DRY or premature abstraction?
// Difficulty: ★★
// ============================================================================

function exercise10_predict(): string {
  // Two validation functions in different domains:
  //
  // function validateUserAge(age: number): boolean { return age >= 18; }
  // function validateDriverAge(age: number): boolean { return age >= 18; }
  //
  // A developer says: "These are duplicates! Let's merge them."
  // Is the developer right?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 10: DRY vs premature abstraction", () => {
//   const answer = exercise10_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("premature") ||
//     answer.toLowerCase().includes("diverge") ||
//     answer.toLowerCase().includes("different"),
//     "should recognize these may diverge"
//   );
// });

// ============================================================================
// EXERCISE 11 (PREDICT): Spot the code smell
// Difficulty: ★★
// ============================================================================

function exercise11_predict(): string {
  // class Order {
  //   getCustomerName(): string { return this.customer.name; }
  //   getCustomerEmail(): string { return this.customer.email; }
  //   getCustomerAddress(): string { return this.customer.address.format(); }
  //   getCustomerPhone(): string { return this.customer.phone; }
  //   calculateTotal(): number { return this.items.reduce((s, i) => s + i.price, 0); }
  // }
  //
  // What code smell is this?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 11: spot code smell", () => {
//   const answer = exercise11_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("feature envy") || answer.toLowerCase().includes("demeter"),
//     "should identify feature envy or Law of Demeter violation"
//   );
// });

// ============================================================================
// EXERCISE 12 (PREDICT): What principle does guard clause improve?
// Difficulty: ★★
// ============================================================================

function exercise12_predict(): string {
  // What does applying guard clauses primarily improve?
  // a) Performance  b) Readability  c) Type safety  d) Memory usage
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 12: guard clause benefit", () => {
//   const answer = exercise12_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(answer.toLowerCase().includes("readability") || answer.toLowerCase().includes("b"),
//     "guard clauses primarily improve readability");
// });

// ============================================================================
// EXERCISE 13 (PREDICT): Composition vs inheritance
// Difficulty: ★★
// ============================================================================

function exercise13_predict(): string {
  // class Animal { eat() {} }
  // class Dog extends Animal { bark() {} }
  // class RobotDog extends Dog { /* battery methods */ }
  //
  // RobotDog inherits eat() from Animal.
  // What problem does this create?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 13: composition vs inheritance", () => {
//   const answer = exercise13_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("eat") ||
//     answer.toLowerCase().includes("liskov") ||
//     answer.toLowerCase().includes("doesn't make sense"),
//     "should identify that RobotDog shouldn't eat"
//   );
// });

// ============================================================================
// EXERCISE 14 (FIX/REFACTOR): Fix function with too many params
// Difficulty: ★★
// Topics: Parameter objects, function design
// ============================================================================
// Refactor this function to use an options object.

// BEFORE:
// function sendNotification(
//   to: string, subject: string, body: string,
//   urgent: boolean, html: boolean, retries: number
// ): string { ... }

interface NotificationOptions {
  to: string;
  subject: string;
  body: string;
  urgent?: boolean;
  html?: boolean;
  retries?: number;
}

function sendNotification(options: NotificationOptions): string {
  // YOUR CODE HERE
  return "";
}

// Tests:
// test("Exercise 14: parameter object", () => {
//   const result = sendNotification({
//     to: "user@test.com",
//     subject: "Hello",
//     body: "World",
//   });
//   assert(result.includes("user@test.com"), "should include recipient");
//   const urgentResult = sendNotification({
//     to: "user@test.com",
//     subject: "Alert",
//     body: "Urgent!",
//     urgent: true,
//     retries: 3,
//   });
//   assert(urgentResult.includes("urgent"), "should indicate urgency");
// });

// ============================================================================
// EXERCISE 15 (FIX/REFACTOR): Remove deeply nested conditionals
// Difficulty: ★★★
// Topics: Guard clauses, early return
// ============================================================================

interface Permission {
  role: "admin" | "editor" | "viewer";
  active: boolean;
  emailVerified: boolean;
}

// BEFORE (deeply nested):
// function canPerformAction(user: Permission | null, action: string): boolean {
//   if (user) {
//     if (user.active) {
//       if (user.emailVerified) {
//         if (action === "read") return true;
//         if (action === "write") return user.role === "admin" || user.role === "editor";
//         if (action === "delete") return user.role === "admin";
//       }
//     }
//   }
//   return false;
// }

function canPerformAction(user: Permission | null, action: string): boolean {
  // YOUR CODE HERE — use guard clauses
  return false;
}

// Tests:
// test("Exercise 15: refactored conditionals", () => {
//   assert(!canPerformAction(null, "read"), "null user can't read");
//   assert(!canPerformAction({ role: "admin", active: false, emailVerified: true }, "read"), "inactive can't read");
//   assert(!canPerformAction({ role: "admin", active: true, emailVerified: false }, "read"), "unverified can't read");
//   assert(canPerformAction({ role: "viewer", active: true, emailVerified: true }, "read"), "viewer can read");
//   assert(!canPerformAction({ role: "viewer", active: true, emailVerified: true }, "write"), "viewer can't write");
//   assert(canPerformAction({ role: "editor", active: true, emailVerified: true }, "write"), "editor can write");
//   assert(canPerformAction({ role: "admin", active: true, emailVerified: true }, "delete"), "admin can delete");
//   assert(!canPerformAction({ role: "editor", active: true, emailVerified: true }, "delete"), "editor can't delete");
// });

// ============================================================================
// EXERCISE 16 (FIX/REFACTOR): Replace conditionals with polymorphism
// Difficulty: ★★★
// Topics: OCP, polymorphism
// ============================================================================

// BEFORE:
// function calculateArea(shape: { type: string; width?: number; height?: number; radius?: number }): number {
//   if (shape.type === "rectangle") return shape.width! * shape.height!;
//   if (shape.type === "circle") return Math.PI * shape.radius! * shape.radius!;
//   if (shape.type === "triangle") return 0.5 * shape.width! * shape.height!;
//   return 0;
// }

interface Shape {
  area(): number;
}

function createRectangle(width: number, height: number): Shape {
  // YOUR CODE HERE
  return undefined as unknown as Shape;
}

function createCircle(radius: number): Shape {
  // YOUR CODE HERE
  return undefined as unknown as Shape;
}

function createTriangle(base: number, height: number): Shape {
  // YOUR CODE HERE
  return undefined as unknown as Shape;
}

function calculateArea(shape: Shape): number {
  return shape.area();
}

// Tests:
// test("Exercise 16: polymorphic shapes", () => {
//   assertEqual(calculateArea(createRectangle(5, 10)), 50);
//   const circleArea = calculateArea(createCircle(5));
//   assert(Math.abs(circleArea - Math.PI * 25) < 0.001, "circle area");
//   assertEqual(calculateArea(createTriangle(10, 6)), 30);
// });

// ============================================================================
// EXERCISE 17 (FIX/REFACTOR): Fix Law of Demeter violation
// Difficulty: ★★★
// Topics: Law of Demeter, encapsulation
// ============================================================================

// BEFORE (train wreck):
// function getOrderSummary(order: Order): string {
//   const name = order.customer.profile.name;
//   const city = order.customer.profile.address.city;
//   const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
//   return `${name} from ${city}: $${total}`;
// }

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
  // YOUR CODE HERE — encapsulate access
  return undefined as unknown as Order;
}

function getOrderSummary(order: Order): string {
  // Use order's methods, not reaching through its internals
  // YOUR CODE HERE
  return "";
}

// Tests:
// test("Exercise 17: Law of Demeter", () => {
//   const customer: Customer = {
//     profile: { name: "Alice", address: { city: "Portland", state: "OR" } },
//     getName() { return this.profile.name; },
//     getCity() { return this.profile.address.city; },
//   };
//   const order = createOrder(customer, [{ price: 25, qty: 2 }, { price: 10, qty: 1 }]);
//   assertEqual(getOrderSummary(order), "Alice from Portland: $60");
// });

// ============================================================================
// EXERCISE 18 (FIX/REFACTOR): Reduce function complexity
// Difficulty: ★★★
// Topics: Extract function, single responsibility
// ============================================================================

// BEFORE (too complex):
// function processData(records: { type: string; value: number; active: boolean }[]): {
//   sum: number; avg: number; activeCount: number; types: string[];
// } {
//   let sum = 0; let activeCount = 0; const types = new Set<string>();
//   for (const r of records) {
//     if (r.active) { sum += r.value; activeCount++; }
//     types.add(r.type);
//   }
//   return { sum, avg: activeCount ? sum / activeCount : 0, activeCount, types: [...types] };
// }

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
  // YOUR CODE HERE
  return 0;
}

function countActive(records: DataRecord[]): number {
  // YOUR CODE HERE
  return 0;
}

function getUniqueTypes(records: DataRecord[]): string[] {
  // YOUR CODE HERE
  return [];
}

function processData(records: DataRecord[]): DataSummary {
  // Compose the above functions
  // YOUR CODE HERE
  return { sum: 0, average: 0, activeCount: 0, uniqueTypes: [] };
}

// Tests:
// test("Exercise 18: reduced complexity", () => {
//   const records: DataRecord[] = [
//     { type: "A", value: 10, active: true },
//     { type: "B", value: 20, active: false },
//     { type: "A", value: 30, active: true },
//   ];
//   const result = processData(records);
//   assertEqual(result.sum, 40);
//   assertEqual(result.average, 20);
//   assertEqual(result.activeCount, 2);
//   assertEqual(result.uniqueTypes.sort(), ["A", "B"]);
// });

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n=== Clean Code Principles — Exercises ===\n");
console.log("All exercises are set up with test stubs.");
console.log("Uncomment the test blocks to verify your solutions.");
console.log("Implement each function replacing 'YOUR CODE HERE'.\n");

export {
  validateEmail,
  formatFullName,
  createUserStore,
  NotificationService,
  createEmailChannel,
  createSmsChannel,
  createSlackChannel,
  OrderProcessor,
  createReadOnlyStore,
  createReadWriteStore,
  calculateShipping,
  createLoggable,
  createCacheable,
  createRetryable,
  calculatePasswordStrength,
  calculateOrderSummary,
  sendNotification,
  canPerformAction,
  createRectangle,
  createCircle,
  createTriangle,
  calculateArea,
  createOrder,
  getOrderSummary,
  processData,
};
