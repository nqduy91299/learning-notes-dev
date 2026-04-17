/**
 * Factory Method Pattern - Solutions
 *
 * Solutions for all 15 exercises with explanations.
 * Config: ES2022, strict mode, ESNext modules
 * Run with: npx tsx solutions.ts
 */

// ============================================================================
// SOLUTION 1 - Predict the Output
// ============================================================================
// Output:
//   This animal says: Woof!
//   This animal says: Meow!
//
// Explanation: DogShelter.createAnimal() returns Dog, CatShelter returns Cat.
// The introduce() method in the abstract creator calls createAnimal() which
// is resolved polymorphically to the concrete creator's implementation.

interface Animal {
  speak(): string;
}

class Dog implements Animal {
  speak(): string { return "Woof!"; }
}

class Cat implements Animal {
  speak(): string { return "Meow!"; }
}

abstract class AnimalShelter {
  abstract createAnimal(): Animal;
  introduce(): string {
    const animal = this.createAnimal();
    return `This animal says: ${animal.speak()}`;
  }
}

class DogShelter extends AnimalShelter {
  createAnimal(): Animal { return new Dog(); }
}

class CatShelter extends AnimalShelter {
  createAnimal(): Animal { return new Cat(); }
}

// ============================================================================
// SOLUTION 2 - Predict the Output
// ============================================================================
// Output:
//   [Text: Item 1] | [Text: Item 2]
//   [Text: Item 3] | [Text: Item 4]
//
// Explanation: render() calls createWidget() twice. Each call increments
// counter. The counter persists across render() calls because it's an
// instance property. First render: 1, 2. Second render: 3, 4.

interface Widget {
  draw(): string;
}

class TextWidget implements Widget {
  constructor(private text: string) {}
  draw(): string { return `[Text: ${this.text}]`; }
}

class ImageWidget implements Widget {
  constructor(private src: string) {}
  draw(): string { return `[Image: ${this.src}]`; }
}

abstract class WidgetCreator {
  abstract createWidget(): Widget;
  render(): string {
    const w1 = this.createWidget();
    const w2 = this.createWidget();
    return `${w1.draw()} | ${w2.draw()}`;
  }
}

class TextCreator extends WidgetCreator {
  private counter = 0;
  createWidget(): Widget {
    this.counter++;
    return new TextWidget(`Item ${this.counter}`);
  }
}

// ============================================================================
// SOLUTION 3 - Predict the Output
// ============================================================================
// Output:
//   [CONSOLE] started
//   [FILE] started
//
// Explanation: AppRunner has a non-abstract default factory method returning
// ConsoleLogger. ProductionRunner overrides it to return FileLogger.
// This shows that the creator doesn't have to be abstract.

interface Logger {
  log(msg: string): string;
}

class ConsoleLogger implements Logger {
  log(msg: string): string { return `[CONSOLE] ${msg}`; }
}

class FileLogger implements Logger {
  log(msg: string): string { return `[FILE] ${msg}`; }
}

class AppRunner {
  createLogger(): Logger { return new ConsoleLogger(); }
  start(): string {
    const logger = this.createLogger();
    return logger.log("started");
  }
}

class ProductionRunner extends AppRunner {
  override createLogger(): Logger { return new FileLogger(); }
}

// ============================================================================
// SOLUTION 4 - Predict the Output
// ============================================================================
// Output:
//   79
//   16
//   3
//
// Explanation: Circle(5) area = round(PI * 25) = 79. Square(4) area = 16.
// Circle(1) area = round(PI * 1) = 3. This is a parameterized factory.

interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number { return Math.round(Math.PI * this.radius * this.radius); }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
}

type ShapeType = "circle" | "square";

class ShapeFactory {
  create(type: ShapeType, size: number): Shape {
    switch (type) {
      case "circle": return new Circle(size);
      case "square": return new Square(size);
    }
  }
}

// ============================================================================
// SOLUTION 5 - Predict the Output
// ============================================================================
// Output:
//   true
//   false
//   2
//
// Explanation: getConnection("db1") creates one connection and caches it.
// Second call for "db1" returns the cached instance (same reference = true).
// "db2" creates a new connection (different reference = false).
// createConnection was called only twice (once for "db1", once for "db2").

interface Connection {
  id: string;
  connect(): string;
}

class DatabaseConnection implements Connection {
  constructor(public id: string) {}
  connect(): string { return `Connected: ${this.id}`; }
}

abstract class ConnectionManager {
  private pool: Map<string, Connection> = new Map();
  abstract createConnection(id: string): Connection;
  getConnection(id: string): Connection {
    if (!this.pool.has(id)) {
      this.pool.set(id, this.createConnection(id));
    }
    return this.pool.get(id)!;
  }
}

class DBConnectionManager extends ConnectionManager {
  private callCount = 0;
  createConnection(id: string): Connection {
    this.callCount++;
    return new DatabaseConnection(id);
  }
  getCallCount(): number { return this.callCount; }
}

// ============================================================================
// SOLUTION 6 - Fix the Bug
// ============================================================================
// Bug: PDFReportGenerator had a typo: `createExportr` instead of `createExporter`.
// Since the base class is abstract, this means PDFReportGenerator didn't implement
// the abstract method, making it also abstract (compile error).
// Fix: Rename to `createExporter`.

interface Exporter {
  export(data: string): string;
}

class PDFExporter implements Exporter {
  export(data: string): string { return `PDF: ${data}`; }
}

class CSVExporter implements Exporter {
  export(data: string): string { return `CSV: ${data}`; }
}

abstract class ReportGenerator {
  abstract createExporter(): Exporter;
  generate(data: string): string {
    const exporter = this.createExporter();
    return exporter.export(data);
  }
}

class PDFReportGenerator extends ReportGenerator {
  // FIX: Corrected method name from createExportr to createExporter
  createExporter(): Exporter {
    return new PDFExporter();
  }
}

class CSVReportGenerator extends ReportGenerator {
  createExporter(): Exporter { return new CSVExporter(); }
}

// ============================================================================
// SOLUTION 7 - Fix the Bug
// ============================================================================
// Bug: EmailService.createNotification() returned a string cast to Notification
// via `as unknown as Notification`. At runtime, calling .send() on a string fails.
// Fix: Return `new EmailNotification()`.

interface Notification {
  send(to: string, message: string): string;
}

class EmailNotification implements Notification {
  send(to: string, message: string): string {
    return `Email to ${to}: ${message}`;
  }
}

class SMSNotification implements Notification {
  send(to: string, message: string): string {
    return `SMS to ${to}: ${message}`;
  }
}

abstract class NotificationService {
  abstract createNotification(): Notification;
  notify(to: string, message: string): string {
    const n = this.createNotification();
    return n.send(to, message);
  }
}

class EmailService extends NotificationService {
  // FIX: Return an actual EmailNotification instance
  createNotification(): Notification {
    return new EmailNotification();
  }
}

class SMSService extends NotificationService {
  createNotification(): Notification { return new SMSNotification(); }
}

// ============================================================================
// SOLUTION 8 - Fix the Bug
// ============================================================================
// Bug: StripeGateway was missing the refund() method required by PaymentGateway.
// Fix: Add the refund method to StripeGateway.

interface PaymentGateway {
  charge(amount: number): string;
  refund(amount: number): string;
}

class StripeGateway implements PaymentGateway {
  charge(amount: number): string {
    return `Stripe charged $${amount}`;
  }
  // FIX: Added missing refund method
  refund(amount: number): string {
    return `Stripe refunded $${amount}`;
  }
}

class PayPalGateway implements PaymentGateway {
  charge(amount: number): string { return `PayPal charged $${amount}`; }
  refund(amount: number): string { return `PayPal refunded $${amount}`; }
}

abstract class PaymentProcessor {
  abstract createGateway(): PaymentGateway;
  processPayment(amount: number): string {
    return this.createGateway().charge(amount);
  }
  processRefund(amount: number): string {
    return this.createGateway().refund(amount);
  }
}

class StripeProcessor extends PaymentProcessor {
  createGateway(): PaymentGateway { return new StripeGateway(); }
}

// ============================================================================
// SOLUTION 9 - Implement Vehicle Rental
// ============================================================================
// Standard factory method: abstract creator with concrete subclasses.

interface Vehicle {
  drive(): string;
}

class Car implements Vehicle {
  drive(): string { return "Driving a car"; }
}

class Bike implements Vehicle {
  drive(): string { return "Riding a bike"; }
}

abstract class RentalAgency {
  abstract createVehicle(): Vehicle;
  rent(): string {
    const vehicle = this.createVehicle();
    return `Rented: ${vehicle.drive()}`;
  }
}

class CarRental extends RentalAgency {
  createVehicle(): Vehicle { return new Car(); }
}

class BikeRental extends RentalAgency {
  createVehicle(): Vehicle { return new Bike(); }
}

// ============================================================================
// SOLUTION 10 - Implement Query Builders
// ============================================================================
// Factory method where the product builds SQL with different quoting styles.

interface QueryBuilder {
  buildSelect(table: string, columns: string[]): string;
}

class MySQLQueryBuilder implements QueryBuilder {
  buildSelect(table: string, columns: string[]): string {
    return `SELECT ${columns.join(", ")} FROM \`${table}\``;
  }
}

class PostgresQueryBuilder implements QueryBuilder {
  buildSelect(table: string, columns: string[]): string {
    return `SELECT ${columns.join(", ")} FROM "${table}"`;
  }
}

abstract class DatabaseService {
  abstract createQueryBuilder(): QueryBuilder;
  query(table: string, columns: string[]): string {
    const qb = this.createQueryBuilder();
    return qb.buildSelect(table, columns);
  }
}

class MySQLService extends DatabaseService {
  createQueryBuilder(): QueryBuilder { return new MySQLQueryBuilder(); }
}

class PostgresService extends DatabaseService {
  createQueryBuilder(): QueryBuilder { return new PostgresQueryBuilder(); }
}

// ============================================================================
// SOLUTION 11 - Implement Game Enemies (Parameterized Factory)
// ============================================================================
// Parameterized/simple factory using a switch statement.

interface Enemy {
  attack(): string;
  readonly health: number;
}

class Goblin implements Enemy {
  readonly health = 50;
  attack(): string { return "Goblin scratches for 5 damage"; }
}

class Dragon implements Enemy {
  readonly health = 500;
  attack(): string { return "Dragon breathes fire for 50 damage"; }
}

class Skeleton implements Enemy {
  readonly health = 100;
  attack(): string { return "Skeleton slashes for 15 damage"; }
}

class EnemyFactory {
  create(type: "goblin" | "dragon" | "skeleton"): Enemy {
    switch (type) {
      case "goblin": return new Goblin();
      case "dragon": return new Dragon();
      case "skeleton": return new Skeleton();
    }
  }
}

// ============================================================================
// SOLUTION 12 - Implement Cache with Pooling
// ============================================================================
// Factory method combined with object pooling. The creator caches instances.

interface CacheStore {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  readonly name: string;
}

class MemoryCache implements CacheStore {
  private data: Map<string, string> = new Map();
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }

  set(key: string, value: string): void {
    this.data.set(key, value);
  }
}

abstract class CacheManager {
  private pool: Map<string, CacheStore> = new Map();

  abstract createCache(name: string): CacheStore;

  getCache(name: string): CacheStore {
    if (!this.pool.has(name)) {
      this.pool.set(name, this.createCache(name));
    }
    return this.pool.get(name)!;
  }
}

class MemoryCacheManager extends CacheManager {
  createCache(name: string): CacheStore {
    return new MemoryCache(name);
  }
}

// ============================================================================
// SOLUTION 13 - Implement Theme System
// ============================================================================
// Factory method for creating theme objects with different visual properties.

interface Theme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  describe(): string;
}

class LightTheme implements Theme {
  primaryColor = "#333";
  backgroundColor = "#FFF";
  fontFamily = "Helvetica";
  describe(): string {
    return `Theme(${this.primaryColor}, ${this.backgroundColor}, ${this.fontFamily})`;
  }
}

class DarkTheme implements Theme {
  primaryColor = "#EEE";
  backgroundColor = "#222";
  fontFamily = "Menlo";
  describe(): string {
    return `Theme(${this.primaryColor}, ${this.backgroundColor}, ${this.fontFamily})`;
  }
}

abstract class ThemeProvider {
  abstract createTheme(): Theme;
  applyTheme(): string {
    const theme = this.createTheme();
    return `Applied: ${theme.describe()}`;
  }
}

class LightThemeProvider extends ThemeProvider {
  createTheme(): Theme { return new LightTheme(); }
}

class DarkThemeProvider extends ThemeProvider {
  createTheme(): Theme { return new DarkTheme(); }
}

// ============================================================================
// SOLUTION 14 - Implement Serializer Registry
// ============================================================================
// Registry-based factory: factories are registered at runtime via callbacks.

interface Serializer {
  serialize(data: Record<string, unknown>): string;
  readonly format: string;
}

class JSONSerializer implements Serializer {
  readonly format = "json";
  serialize(data: Record<string, unknown>): string {
    return JSON.stringify(data);
  }
}

class XMLSerializer implements Serializer {
  readonly format = "xml";
  serialize(data: Record<string, unknown>): string {
    const entries = Object.entries(data)
      .map(([k, v]) => `<${k}>${v}</${k}>`)
      .join("");
    return `<data>${entries}</data>`;
  }
}

class SerializerRegistry {
  private registry: Map<string, () => Serializer> = new Map();

  register(format: string, factory: () => Serializer): void {
    this.registry.set(format, factory);
  }

  create(format: string): Serializer {
    const factory = this.registry.get(format);
    if (!factory) {
      throw new Error(`No serializer registered for format: ${format}`);
    }
    return factory();
  }
}

// ============================================================================
// SOLUTION 15 - Implement HTTP Client Abstraction
// ============================================================================
// Factory method for HTTP clients - demonstrates how libraries like Angular
// abstract HTTP implementations behind a factory.

interface HTTPClient {
  get(url: string): string;
  post(url: string, body: string): string;
}

class FetchClient implements HTTPClient {
  get(url: string): string { return `FETCH GET ${url}`; }
  post(url: string, body: string): string { return `FETCH POST ${url} body=${body}`; }
}

class AxiosClient implements HTTPClient {
  get(url: string): string { return `AXIOS GET ${url}`; }
  post(url: string, body: string): string { return `AXIOS POST ${url} body=${body}`; }
}

abstract class APIService {
  abstract createClient(): HTTPClient;

  fetchData(endpoint: string): string {
    const client = this.createClient();
    return `Data: ${client.get(endpoint)}`;
  }

  sendData(endpoint: string, payload: string): string {
    const client = this.createClient();
    return `Sent: ${client.post(endpoint, payload)}`;
  }
}

class FetchAPIService extends APIService {
  createClient(): HTTPClient { return new FetchClient(); }
}

class AxiosAPIService extends APIService {
  createClient(): HTTPClient { return new AxiosClient(); }
}

// ============================================================================
// RUNNER - Verify all solutions
// ============================================================================

function divider(title: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("=".repeat(60));
}

// Exercise 1
divider("Exercise 1 - Animal Shelter");
const shelters: AnimalShelter[] = [new DogShelter(), new CatShelter()];
shelters.forEach((s) => console.log(s.introduce()));

// Exercise 2
divider("Exercise 2 - Widget Counter");
const tc = new TextCreator();
console.log(tc.render());
console.log(tc.render());

// Exercise 3
divider("Exercise 3 - Default Factory Method");
const r1 = new AppRunner();
const r2 = new ProductionRunner();
console.log(r1.start());
console.log(r2.start());

// Exercise 4
divider("Exercise 4 - Parameterized Shape Factory");
const shapeFactory = new ShapeFactory();
const shapes: Shape[] = [
  shapeFactory.create("circle", 5),
  shapeFactory.create("square", 4),
  shapeFactory.create("circle", 1),
];
shapes.forEach((s) => console.log(s.area()));

// Exercise 5
divider("Exercise 5 - Connection Pool");
const mgr = new DBConnectionManager();
const c1 = mgr.getConnection("db1");
const c2 = mgr.getConnection("db1");
const c3 = mgr.getConnection("db2");
console.log(c1 === c2);
console.log(c1 === c3);
console.log(mgr.getCallCount());

// Exercise 6
divider("Exercise 6 - Fix: PDF Report Generator");
const pdf = new PDFReportGenerator();
console.log(pdf.generate("Sales Q1"));

// Exercise 7
divider("Exercise 7 - Fix: Email Service");
const emailSvc = new EmailService();
console.log(emailSvc.notify("alice@test.com", "Hello"));

// Exercise 8
divider("Exercise 8 - Fix: Stripe Gateway");
const stripe = new StripeProcessor();
console.log(stripe.processPayment(100));
console.log(stripe.processRefund(50));

// Exercise 9
divider("Exercise 9 - Vehicle Rental");
const carRental = new CarRental();
const bikeRental = new BikeRental();
console.log(carRental.rent());
console.log(bikeRental.rent());

// Exercise 10
divider("Exercise 10 - Query Builders");
const mysql = new MySQLService();
const pg = new PostgresService();
console.log(mysql.query("users", ["id", "name"]));
console.log(pg.query("users", ["id", "name"]));

// Exercise 11
divider("Exercise 11 - Game Enemies");
const ef = new EnemyFactory();
const goblin = ef.create("goblin");
const dragon = ef.create("dragon");
console.log(`${goblin.attack()} [HP: ${goblin.health}]`);
console.log(`${dragon.attack()} [HP: ${dragon.health}]`);

// Exercise 12
divider("Exercise 12 - Cache Pooling");
const cm = new MemoryCacheManager();
const cache1 = cm.getCache("session");
const cache2 = cm.getCache("session");
const cache3 = cm.getCache("data");
console.log(cache1 === cache2);
console.log(cache1 === cache3);
cache1.set("token", "abc");
console.log(cache2.get("token"));

// Exercise 13
divider("Exercise 13 - Theme System");
const light = new LightThemeProvider();
const dark = new DarkThemeProvider();
console.log(light.applyTheme());
console.log(dark.applyTheme());

// Exercise 14
divider("Exercise 14 - Serializer Registry");
const registry = new SerializerRegistry();
registry.register("json", () => new JSONSerializer());
registry.register("xml", () => new XMLSerializer());
const jsonS = registry.create("json");
const xmlS = registry.create("xml");
console.log(jsonS.serialize({ name: "Alice" }));
console.log(xmlS.serialize({ name: "Alice", age: 30 }));

// Exercise 15
divider("Exercise 15 - HTTP Client");
const fetchSvc = new FetchAPIService();
const axiosSvc = new AxiosAPIService();
console.log(fetchSvc.fetchData("/api/users"));
console.log(axiosSvc.sendData("/api/users", '{"name":"Bob"}'));

console.log("\n" + "=".repeat(60));
console.log("  All exercises verified successfully!");
console.log("=".repeat(60));
