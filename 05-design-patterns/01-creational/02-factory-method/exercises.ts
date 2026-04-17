/**
 * Factory Method Pattern - Exercises
 *
 * 15 exercises: 5 predict-output, 3 fix-the-bug, 7 implement
 * Config: ES2022, strict mode, ESNext modules
 * Run with: npx tsx exercises.ts
 */

// ============================================================================
// EXERCISE 1 - Predict the Output
// ============================================================================
// What does the following code print?

interface Animal {
  speak(): string;
}

class Dog implements Animal {
  speak(): string {
    return "Woof!";
  }
}

class Cat implements Animal {
  speak(): string {
    return "Meow!";
  }
}

abstract class AnimalShelter {
  abstract createAnimal(): Animal;

  introduce(): string {
    const animal = this.createAnimal();
    return `This animal says: ${animal.speak()}`;
  }
}

class DogShelter extends AnimalShelter {
  createAnimal(): Animal {
    return new Dog();
  }
}

class CatShelter extends AnimalShelter {
  createAnimal(): Animal {
    return new Cat();
  }
}

// const shelters: AnimalShelter[] = [new DogShelter(), new CatShelter()];
// shelters.forEach((s) => console.log(s.introduce()));

// YOUR PREDICTION:
//
//
//

// ============================================================================
// EXERCISE 2 - Predict the Output
// ============================================================================
// What does this code print? Pay attention to the constructor.

interface Widget {
  draw(): string;
}

class TextWidget implements Widget {
  constructor(private text: string) {}
  draw(): string {
    return `[Text: ${this.text}]`;
  }
}

class ImageWidget implements Widget {
  constructor(private src: string) {}
  draw(): string {
    return `[Image: ${this.src}]`;
  }
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

// const tc = new TextCreator();
// console.log(tc.render());
// console.log(tc.render());

// YOUR PREDICTION:
//
//
//

// ============================================================================
// EXERCISE 3 - Predict the Output
// ============================================================================
// What does this code print? Focus on the default factory method.

interface Logger {
  log(msg: string): string;
}

class ConsoleLogger implements Logger {
  log(msg: string): string {
    return `[CONSOLE] ${msg}`;
  }
}

class FileLogger implements Logger {
  log(msg: string): string {
    return `[FILE] ${msg}`;
  }
}

class AppRunner {
  // Non-abstract creator with a default factory method
  createLogger(): Logger {
    return new ConsoleLogger();
  }

  start(): string {
    const logger = this.createLogger();
    return logger.log("started");
  }
}

class ProductionRunner extends AppRunner {
  override createLogger(): Logger {
    return new FileLogger();
  }
}

// const r1 = new AppRunner();
// const r2 = new ProductionRunner();
// console.log(r1.start());
// console.log(r2.start());

// YOUR PREDICTION:
//
//
//

// ============================================================================
// EXERCISE 4 - Predict the Output
// ============================================================================
// What does this code print? Note the parameterized factory.

interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area(): number {
    return Math.round(Math.PI * this.radius * this.radius);
  }
}

class Square implements Shape {
  constructor(private side: number) {}
  area(): number {
    return this.side * this.side;
  }
}

type ShapeType = "circle" | "square";

class ShapeFactory {
  create(type: ShapeType, size: number): Shape {
    switch (type) {
      case "circle":
        return new Circle(size);
      case "square":
        return new Square(size);
    }
  }
}

// const factory = new ShapeFactory();
// const shapes: Shape[] = [
//   factory.create("circle", 5),
//   factory.create("square", 4),
//   factory.create("circle", 1),
// ];
// shapes.forEach((s) => console.log(s.area()));

// YOUR PREDICTION:
//
//
//

// ============================================================================
// EXERCISE 5 - Predict the Output
// ============================================================================
// What does this code print? Focus on the caching factory method.

interface Connection {
  id: string;
  connect(): string;
}

class DatabaseConnection implements Connection {
  constructor(public id: string) {}
  connect(): string {
    return `Connected: ${this.id}`;
  }
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

  getCallCount(): number {
    return this.callCount;
  }
}

// const mgr = new DBConnectionManager();
// const c1 = mgr.getConnection("db1");
// const c2 = mgr.getConnection("db1");
// const c3 = mgr.getConnection("db2");
// console.log(c1 === c2);
// console.log(c1 === c3);
// console.log(mgr.getCallCount());

// YOUR PREDICTION:
//
//
//

// ============================================================================
// EXERCISE 6 - Fix the Bug
// ============================================================================
// This code should create different document exporters, but it has a bug.
// The concrete creator doesn't properly override the factory method.
// Fix it so it compiles and works correctly.

interface Exporter {
  export(data: string): string;
}

class PDFExporter implements Exporter {
  export(data: string): string {
    return `PDF: ${data}`;
  }
}

class CSVExporter implements Exporter {
  export(data: string): string {
    return `CSV: ${data}`;
  }
}

abstract class ReportGenerator {
  abstract createExporter(): Exporter;

  generate(data: string): string {
    const exporter = this.createExporter();
    return exporter.export(data);
  }
}

class PDFReportGenerator extends ReportGenerator {
  // BUG: Wrong method name - should override createExporter
  createExportr(): Exporter {
    return new PDFExporter();
  }
}

class CSVReportGenerator extends ReportGenerator {
  createExporter(): Exporter {
    return new CSVExporter();
  }
}

// FIX the PDFReportGenerator class above so that:
// const pdf = new PDFReportGenerator();
// console.log(pdf.generate("Sales Q1")); // Should print: PDF: Sales Q1

// ============================================================================
// EXERCISE 7 - Fix the Bug
// ============================================================================
// The NotificationService should send notifications using the factory method.
// But the factory method returns the wrong type. Fix the return type mismatch.

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
  // BUG: Returns a string instead of a Notification object
  createNotification(): Notification {
    return "EmailNotification" as unknown as Notification;
  }
}

class SMSService extends NotificationService {
  createNotification(): Notification {
    return new SMSNotification();
  }
}

// FIX EmailService so that:
// const emailSvc = new EmailService();
// console.log(emailSvc.notify("alice@test.com", "Hello"));
// Should print: Email to alice@test.com: Hello

// ============================================================================
// EXERCISE 8 - Fix the Bug
// ============================================================================
// The PaymentProcessor uses a factory method, but the concrete product
// is missing interface compliance. Fix the concrete product.

interface PaymentGateway {
  charge(amount: number): string;
  refund(amount: number): string;
}

class StripeGateway implements PaymentGateway {
  charge(amount: number): string {
    return `Stripe charged $${amount}`;
  }
  // BUG: Missing refund method - PaymentGateway requires it
}

class PayPalGateway implements PaymentGateway {
  charge(amount: number): string {
    return `PayPal charged $${amount}`;
  }
  refund(amount: number): string {
    return `PayPal refunded $${amount}`;
  }
}

abstract class PaymentProcessor {
  abstract createGateway(): PaymentGateway;

  processPayment(amount: number): string {
    const gw = this.createGateway();
    return gw.charge(amount);
  }

  processRefund(amount: number): string {
    const gw = this.createGateway();
    return gw.refund(amount);
  }
}

class StripeProcessor extends PaymentProcessor {
  createGateway(): PaymentGateway {
    return new StripeGateway();
  }
}

// FIX StripeGateway so that:
// const stripe = new StripeProcessor();
// console.log(stripe.processPayment(100));  // Stripe charged $100
// console.log(stripe.processRefund(50));    // Stripe refunded $50

// ============================================================================
// EXERCISE 9 - Implement
// ============================================================================
// Implement a factory method pattern for a Vehicle rental system.
//
// Products: Car and Bike, both implementing Vehicle interface
// - Car.drive() returns "Driving a car"
// - Bike.drive() returns "Riding a bike"
//
// Creators: CarRental and BikeRental, extending RentalAgency
// - RentalAgency has a rent() method that calls createVehicle()
//   and returns `Rented: ${vehicle.drive()}`

// interface Vehicle { ... }
// class Car implements Vehicle { ... }
// class Bike implements Vehicle { ... }
// abstract class RentalAgency { ... }
// class CarRental extends RentalAgency { ... }
// class BikeRental extends RentalAgency { ... }

// TEST (uncomment to verify):
// const carRental = new CarRental();
// const bikeRental = new BikeRental();
// console.log(carRental.rent());   // "Rented: Driving a car"
// console.log(bikeRental.rent());  // "Rented: Riding a bike"

// ============================================================================
// EXERCISE 10 - Implement
// ============================================================================
// Implement a factory method pattern for database query builders.
//
// Product interface: QueryBuilder
// - buildSelect(table: string, columns: string[]): string
//
// Concrete Products:
// - MySQLQueryBuilder: returns `SELECT ${columns.join(", ")} FROM \`${table}\``
// - PostgresQueryBuilder: returns `SELECT ${columns.join(", ")} FROM "${table}"`
//
// Creator: abstract class DatabaseService with:
// - abstract createQueryBuilder(): QueryBuilder
// - query(table: string, columns: string[]): string
//   that uses the factory method and returns the built query
//
// Concrete Creators: MySQLService, PostgresService

// TEST (uncomment to verify):
// const mysql = new MySQLService();
// const pg = new PostgresService();
// console.log(mysql.query("users", ["id", "name"]));
// // SELECT id, name FROM `users`
// console.log(pg.query("users", ["id", "name"]));
// // SELECT id, name FROM "users"

// ============================================================================
// EXERCISE 11 - Implement
// ============================================================================
// Implement a parameterized factory method for game enemies.
//
// Product interface: Enemy
// - attack(): string
// - health: number (readonly property)
//
// Concrete Products:
// - Goblin: health = 50, attack() returns "Goblin scratches for 5 damage"
// - Dragon: health = 500, attack() returns "Dragon breathes fire for 50 damage"
// - Skeleton: health = 100, attack() returns "Skeleton slashes for 15 damage"
//
// Factory class: EnemyFactory
// - create(type: "goblin" | "dragon" | "skeleton"): Enemy
//
// This is a parameterized/simple factory, not a pure GoF Factory Method.

// TEST (uncomment to verify):
// const ef = new EnemyFactory();
// const goblin = ef.create("goblin");
// const dragon = ef.create("dragon");
// console.log(`${goblin.attack()} [HP: ${goblin.health}]`);
// // Goblin scratches for 5 damage [HP: 50]
// console.log(`${dragon.attack()} [HP: ${dragon.health}]`);
// // Dragon breathes fire for 50 damage [HP: 500]

// ============================================================================
// EXERCISE 12 - Implement
// ============================================================================
// Implement a factory method with caching/pooling.
//
// Product interface: CacheStore
// - get(key: string): string | undefined
// - set(key: string, value: string): void
// - name: string (readonly property)
//
// Concrete Product: MemoryCache
// - Stores data in an internal Map<string, string>
// - name returns "MemoryCache"
//
// Creator: abstract class CacheManager
// - abstract createCache(name: string): CacheStore
// - getCache(name: string): CacheStore
//   Returns existing cache if one with that name exists (pool),
//   otherwise creates a new one via factory method.
// - Use a private Map to track created caches.
//
// Concrete Creator: MemoryCacheManager

// TEST (uncomment to verify):
// const cm = new MemoryCacheManager();
// const c1 = cm.getCache("session");
// const c2 = cm.getCache("session");
// const c3 = cm.getCache("data");
// console.log(c1 === c2); // true
// console.log(c1 === c3); // false
// c1.set("token", "abc");
// console.log(c2.get("token")); // "abc" (same instance)

// ============================================================================
// EXERCISE 13 - Implement
// ============================================================================
// Implement a factory method for a theming system.
//
// Product interface: Theme
// - primaryColor: string
// - backgroundColor: string
// - fontFamily: string
// - describe(): string  - returns `Theme(${primaryColor}, ${backgroundColor}, ${fontFamily})`
//
// Concrete Products:
// - LightTheme: primary="#333", bg="#FFF", font="Helvetica"
// - DarkTheme: primary="#EEE", bg="#222", font="Menlo"
//
// Creator: abstract class ThemeProvider
// - abstract createTheme(): Theme
// - applyTheme(): string - returns `Applied: ${theme.describe()}`
//
// Concrete Creators: LightThemeProvider, DarkThemeProvider

// TEST (uncomment to verify):
// const light = new LightThemeProvider();
// const dark = new DarkThemeProvider();
// console.log(light.applyTheme());
// // Applied: Theme(#333, #FFF, Helvetica)
// console.log(dark.applyTheme());
// // Applied: Theme(#EEE, #222, Menlo)

// ============================================================================
// EXERCISE 14 - Implement
// ============================================================================
// Implement a factory method for serializers with a registry pattern.
//
// Product interface: Serializer
// - serialize(data: Record<string, unknown>): string
// - format: string (readonly)
//
// Concrete Products:
// - JSONSerializer: format="json", serialize returns JSON.stringify(data)
// - XMLSerializer: format="xml", serialize returns a simple XML-like string:
//   For {name: "Alice", age: 30} => "<data><name>Alice</name><age>30</age></data>"
//
// Factory with registry: SerializerRegistry
// - private registry: Map<string, () => Serializer>
// - register(format: string, factory: () => Serializer): void
// - create(format: string): Serializer (throws if format not registered)
//
// This demonstrates a registry-based factory (variation of parameterized factory).

// TEST (uncomment to verify):
// const registry = new SerializerRegistry();
// registry.register("json", () => new JSONSerializer());
// registry.register("xml", () => new XMLSerializer());
// const jsonS = registry.create("json");
// const xmlS = registry.create("xml");
// console.log(jsonS.serialize({ name: "Alice" }));
// // {"name":"Alice"}
// console.log(xmlS.serialize({ name: "Alice", age: 30 }));
// // <data><name>Alice</name><age>30</age></data>

// ============================================================================
// EXERCISE 15 - Implement
// ============================================================================
// Implement a factory method pattern for an HTTP client abstraction.
//
// Product interface: HTTPClient
// - get(url: string): string
// - post(url: string, body: string): string
//
// Concrete Products:
// - FetchClient:
//   get returns `FETCH GET ${url}`
//   post returns `FETCH POST ${url} body=${body}`
// - AxiosClient:
//   get returns `AXIOS GET ${url}`
//   post returns `AXIOS POST ${url} body=${body}`
//
// Creator: abstract class APIService
// - abstract createClient(): HTTPClient
// - fetchData(endpoint: string): string
//   Calls client.get(endpoint) and returns `Data: ${result}`
// - sendData(endpoint: string, payload: string): string
//   Calls client.post(endpoint, payload) and returns `Sent: ${result}`
//
// Concrete Creators: FetchAPIService, AxiosAPIService

// TEST (uncomment to verify):
// const fetchSvc = new FetchAPIService();
// const axiosSvc = new AxiosAPIService();
// console.log(fetchSvc.fetchData("/api/users"));
// // Data: FETCH GET /api/users
// console.log(axiosSvc.sendData("/api/users", '{"name":"Bob"}'));
// // Sent: AXIOS POST /api/users body={"name":"Bob"}

export {};
