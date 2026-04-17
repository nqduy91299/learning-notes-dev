// ============================================================================
// Bridge Pattern — Solutions
// ============================================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// SOLUTION 1: Predict the Output
// ============================================================================
// The Circle1 delegates rendering to the Renderer implementation.
// resize() mutates the internal radius, which changes subsequent draw() output.

interface Renderer1 {
  render(shape: string): string;
}

class VectorRenderer1 implements Renderer1 {
  render(shape: string): string {
    return `Drawing ${shape} as lines`;
  }
}

class RasterRenderer1 implements Renderer1 {
  render(shape: string): string {
    return `Drawing ${shape} as pixels`;
  }
}

class Circle1 {
  constructor(private renderer: Renderer1, private radius: number) {}
  draw(): string {
    return this.renderer.render(`Circle(${this.radius})`);
  }
  resize(factor: number): void {
    this.radius *= factor;
  }
}

const vectorCircle = new Circle1(new VectorRenderer1(), 5);
console.log(vectorCircle.draw());
// Output: Drawing Circle(5) as lines
vectorCircle.resize(2);
console.log(vectorCircle.draw());
// Output: Drawing Circle(10) as lines
const rasterCircle = new Circle1(new RasterRenderer1(), 3);
console.log(rasterCircle.draw());
// Output: Drawing Circle(3) as pixels

// Explanation: The bridge delegates to different renderers. resize() changes
// the radius in place, so the second draw() uses radius=10.


// ============================================================================
// SOLUTION 2: Predict the Output
// ============================================================================
// Each notification type formats the message differently, then delegates to
// the sender (channel). Same abstraction + different implementations.

interface MessageSender2 {
  sendMessage(message: string): string;
}

class EmailSender2 implements MessageSender2 {
  sendMessage(message: string): string {
    return `Email: ${message}`;
  }
}

class SMSSender2 implements MessageSender2 {
  sendMessage(message: string): string {
    return `SMS: ${message}`;
  }
}

abstract class Notification2 {
  constructor(protected sender: MessageSender2) {}
  abstract notify(msg: string): string;
}

class AlertNotification2 extends Notification2 {
  notify(msg: string): string {
    return this.sender.sendMessage(`[ALERT] ${msg}`);
  }
}

class InfoNotification2 extends Notification2 {
  notify(msg: string): string {
    return this.sender.sendMessage(`[INFO] ${msg}`);
  }
}

const alert1 = new AlertNotification2(new EmailSender2());
const alert2 = new AlertNotification2(new SMSSender2());
const info1 = new InfoNotification2(new EmailSender2());

console.log(alert1.notify("Server down"));
// Output: Email: [ALERT] Server down
console.log(alert2.notify("Server down"));
// Output: SMS: [ALERT] Server down
console.log(info1.notify("Deploy complete"));
// Output: Email: [INFO] Deploy complete

// Explanation: Same abstraction (Alert/Info) paired with different implementations
// (Email/SMS) produces different outputs without subclass explosion.


// ============================================================================
// SOLUTION 3: Predict the Output
// ============================================================================
// Demonstrates runtime implementation swapping via setFormatter().

interface Formatter3 {
  format(data: string): string;
}

class JSONFormatter3 implements Formatter3 {
  format(data: string): string {
    return JSON.stringify({ data });
  }
}

class XMLFormatter3 implements Formatter3 {
  format(data: string): string {
    return `<data>${data}</data>`;
  }
}

class Report3 {
  constructor(private formatter: Formatter3) {}
  setFormatter(f: Formatter3): void {
    this.formatter = f;
  }
  generate(content: string): string {
    return this.formatter.format(content);
  }
}

const report = new Report3(new JSONFormatter3());
console.log(report.generate("sales"));
// Output: {"data":"sales"}
report.setFormatter(new XMLFormatter3());
console.log(report.generate("sales"));
// Output: <data>sales</data>
report.setFormatter(new JSONFormatter3());
console.log(report.generate("inventory"));
// Output: {"data":"inventory"}

// Explanation: The bridge reference can be swapped at runtime. The same
// abstraction (Report) produces different output formats by changing the
// implementation (Formatter) without creating new subclasses.


// ============================================================================
// SOLUTION 4: Predict the Output
// ============================================================================
// AdvancedRemote extends Remote (refined abstraction). The TV clamps volume
// to 0-100 range.

interface DeviceAPI4 {
  getName(): string;
  getVolume(): number;
  setVolume(v: number): void;
}

class TV4 implements DeviceAPI4 {
  private volume = 50;
  getName(): string { return "TV"; }
  getVolume(): number { return this.volume; }
  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(100, v));
  }
}

class Remote4 {
  constructor(protected device: DeviceAPI4) {}
  volumeUp(): string {
    this.device.setVolume(this.device.getVolume() + 10);
    return `${this.device.getName()} volume: ${this.device.getVolume()}`;
  }
  volumeDown(): string {
    this.device.setVolume(this.device.getVolume() - 10);
    return `${this.device.getName()} volume: ${this.device.getVolume()}`;
  }
}

class AdvancedRemote4 extends Remote4 {
  mute(): string {
    this.device.setVolume(0);
    return `${this.device.getName()} volume: ${this.device.getVolume()}`;
  }
}

const tv = new TV4();
const remote = new AdvancedRemote4(tv);
console.log(remote.volumeUp());
// Output: TV volume: 60
// (50 + 10 = 60)
console.log(remote.volumeUp());
// Output: TV volume: 70
// (60 + 10 = 70)
console.log(remote.mute());
// Output: TV volume: 0
// (setVolume(0))
console.log(remote.volumeDown());
// Output: TV volume: 0
// (0 - 10 = -10, clamped to 0)

// Explanation: The refined abstraction (AdvancedRemote) adds mute().
// After muting, volumeDown tries to go to -10 but the TV clamps to 0.


// ============================================================================
// SOLUTION 5: Fix the Bug
// ============================================================================
// Bug 1: processPayment doesn't apply the 2.9% fee
// Bug 2: processRefund doesn't check the $1000 limit

interface PaymentGateway5 {
  charge(amount: number): string;
  refund(amount: number): string;
}

class StripeGateway5 implements PaymentGateway5 {
  charge(amount: number): string {
    return `Stripe charged $${amount.toFixed(2)}`;
  }
  refund(amount: number): string {
    return `Stripe refunded $${amount.toFixed(2)}`;
  }
}

class PayPalGateway5 implements PaymentGateway5 {
  charge(amount: number): string {
    return `PayPal charged $${amount.toFixed(2)}`;
  }
  refund(amount: number): string {
    return `PayPal refunded $${amount.toFixed(2)}`;
  }
}

class PaymentProcessor5 {
  private gateway: PaymentGateway5;

  constructor(gateway: PaymentGateway5) {
    this.gateway = gateway;
  }

  processPayment(amount: number): string {
    // Fix 1: Apply 2.9% processing fee
    const totalWithFee = amount * 1.029;
    return this.gateway.charge(totalWithFee);
  }

  processRefund(amount: number): string {
    // Fix 2: Check the $1000 limit
    if (amount > 1000) {
      return "Refund denied: amount exceeds $1000 limit";
    }
    return this.gateway.refund(amount);
  }
}

const stripe5 = new PaymentProcessor5(new StripeGateway5());
console.log(stripe5.processPayment(100));
// Output: Stripe charged $102.90
console.log(stripe5.processRefund(1500));
// Output: Refund denied: amount exceeds $1000 limit
console.log(stripe5.processRefund(500));
// Output: Stripe refunded $500.00

// Explanation: The abstraction (PaymentProcessor) adds business logic (fee
// calculation, refund limits) on top of the implementation (gateway). The
// bridge pattern cleanly separates this high-level logic from the gateway
// specifics.


// ============================================================================
// SOLUTION 6: Fix the Bug
// ============================================================================
// Bug: The comparison operator is backwards. It uses `<` which logs messages
// with priority LOWER than minLevel. It should use `>=` to log messages at
// or above the minimum level.

interface LogOutput6 {
  write(message: string): string;
}

class ConsoleOutput6 implements LogOutput6 {
  write(message: string): string {
    return `[Console] ${message}`;
  }
}

class FileOutput6 implements LogOutput6 {
  write(message: string): string {
    return `[File] ${message}`;
  }
}

type LogLevel6 = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel6, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger6 {
  constructor(
    private output: LogOutput6,
    private minLevel: LogLevel6
  ) {}

  log(level: LogLevel6, message: string): string | null {
    // Fix: Changed < to >= so we log messages AT or ABOVE the min level
    if (LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]) {
      return this.output.write(`[${level.toUpperCase()}] ${message}`);
    }
    return null;
  }
}

const logger6 = new Logger6(new ConsoleOutput6(), "warn");
console.log(logger6.log("debug", "trace info"));   // Output: null
console.log(logger6.log("info", "started"));        // Output: null
console.log(logger6.log("warn", "low memory"));     // Output: [Console] [WARN] low memory
console.log(logger6.log("error", "crash!"));        // Output: [Console] [ERROR] crash!

// Explanation: The original code had the comparison inverted. It was logging
// messages with priority LESS THAN the minimum, which is the opposite of
// what a log level filter should do.


// ============================================================================
// SOLUTION 7: Theme Bridge
// ============================================================================

interface Theme {
  applyTo(component: string): string;
}

class LightTheme implements Theme {
  applyTo(component: string): string {
    return `${component} styled with light background, dark text`;
  }
}

class DarkTheme implements Theme {
  applyTo(component: string): string {
    return `${component} styled with dark background, light text`;
  }
}

abstract class Widget {
  constructor(protected theme: Theme) {}
  abstract render(): string;
}

class ButtonWidget extends Widget {
  constructor(theme: Theme, private label: string) {
    super(theme);
  }
  render(): string {
    return this.theme.applyTo(`Button[${this.label}]`);
  }
}

class InputWidget extends Widget {
  constructor(theme: Theme, private placeholder: string) {
    super(theme);
  }
  render(): string {
    return this.theme.applyTo(`Input[${this.placeholder}]`);
  }
}

const lightBtn = new ButtonWidget(new LightTheme(), "Submit");
console.log(lightBtn.render());
// Output: Button[Submit] styled with light background, dark text

const darkInput = new InputWidget(new DarkTheme(), "Search...");
console.log(darkInput.render());
// Output: Input[Search...] styled with dark background, light text

// Explanation: The Theme interface is the implementation. Widget is the
// abstraction. ButtonWidget and InputWidget are refined abstractions.
// 2 widgets × 2 themes = 4 combinations with only 4 classes (not 4 subclasses).


// ============================================================================
// SOLUTION 8: Database Bridge
// ============================================================================

interface DatabaseDriver {
  connect(): string;
  query(sql: string): string;
  close(): string;
}

class PostgresDriver implements DatabaseDriver {
  connect(): string { return "Postgres: connecting"; }
  query(sql: string): string { return `Postgres: ${sql}`; }
  close(): string { return "Postgres: closing"; }
}

class SQLiteDriver implements DatabaseDriver {
  connect(): string { return "SQLite: connecting"; }
  query(sql: string): string { return `SQLite: ${sql}`; }
  close(): string { return "SQLite: closing"; }
}

abstract class Repository {
  constructor(protected driver: DatabaseDriver) {}
  abstract findAll(): string[];
  abstract findById(id: number): string;
}

class UserRepository extends Repository {
  findAll(): string[] {
    return [
      this.driver.connect(),
      this.driver.query("SELECT * FROM users"),
      this.driver.close(),
    ];
  }
  findById(id: number): string {
    return this.driver.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

const pgRepo = new UserRepository(new PostgresDriver());
console.log(pgRepo.findAll());
// Output: ["Postgres: connecting", "Postgres: SELECT * FROM users", "Postgres: closing"]
console.log(pgRepo.findById(42));
// Output: Postgres: SELECT * FROM users WHERE id = 42

const sqliteRepo = new UserRepository(new SQLiteDriver());
console.log(sqliteRepo.findAll());
// Output: ["SQLite: connecting", "SQLite: SELECT * FROM users", "SQLite: closing"]

// Explanation: Repository (abstraction) defines high-level data access operations.
// DatabaseDriver (implementation) handles the low-level database communication.
// Adding a new database (MySQL) only requires a new driver class.


// ============================================================================
// SOLUTION 9: Serialization Bridge
// ============================================================================

interface Serializer {
  serialize(type: string, fields: Record<string, string>): string;
}

class JSONSerializer implements Serializer {
  serialize(type: string, fields: Record<string, string>): string {
    return JSON.stringify({ type, ...fields });
  }
}

class CSVSerializer implements Serializer {
  serialize(type: string, fields: Record<string, string>): string {
    return `${type},${Object.values(fields).join(",")}`;
  }
}

abstract class Document9 {
  constructor(protected serializer: Serializer) {}
  abstract export(): string;
}

class Invoice extends Document9 {
  constructor(serializer: Serializer, private id: string, private amount: string) {
    super(serializer);
  }
  export(): string {
    return this.serializer.serialize("Invoice", { id: this.id, amount: this.amount });
  }
}

class Receipt extends Document9 {
  constructor(serializer: Serializer, private id: string, private date: string) {
    super(serializer);
  }
  export(): string {
    return this.serializer.serialize("Receipt", { id: this.id, date: this.date });
  }
}

const jsonInvoice = new Invoice(new JSONSerializer(), "INV-001", "250.00");
console.log(jsonInvoice.export());
// Output: {"type":"Invoice","id":"INV-001","amount":"250.00"}

const csvReceipt = new Receipt(new CSVSerializer(), "REC-001", "2024-01-15");
console.log(csvReceipt.export());
// Output: Receipt,REC-001,2024-01-15

// Explanation: Document types (Invoice, Receipt) are the abstraction hierarchy.
// Serializers (JSON, CSV) are the implementation hierarchy. Adding XML export
// means one new class; adding a PurchaseOrder document means one new class.


// ============================================================================
// SOLUTION 10: Media Player Bridge
// ============================================================================

interface AudioBackend {
  initialize(): string;
  play(track: string): string;
  pause(): string;
  stop(): string;
  getStatus(): string;
}

class WebAudioBackend implements AudioBackend {
  initialize(): string { return "WebAudio: initializing"; }
  play(track: string): string { return `WebAudio: playing ${track}`; }
  pause(): string { return "WebAudio: pausing"; }
  stop(): string { return "WebAudio: stopping"; }
  getStatus(): string { return "WebAudio: ready"; }
}

class NativeBackend implements AudioBackend {
  initialize(): string { return "Native: initializing"; }
  play(track: string): string { return `Native: playing ${track}`; }
  pause(): string { return "Native: pausing"; }
  stop(): string { return "Native: stopping"; }
  getStatus(): string { return "Native: ready"; }
}

abstract class MediaPlayer {
  constructor(protected backend: AudioBackend) {}
  abstract playTrack(track: string): string[];
  abstract stopPlayback(): string[];
}

class BasicPlayer extends MediaPlayer {
  playTrack(track: string): string[] {
    return [this.backend.initialize(), this.backend.play(track)];
  }
  stopPlayback(): string[] {
    return [this.backend.stop()];
  }
}

class StreamingPlayer extends MediaPlayer {
  playTrack(track: string): string[] {
    return [
      this.backend.initialize(),
      this.backend.getStatus(),
      this.backend.play(track),
    ];
  }
  stopPlayback(): string[] {
    return [this.backend.pause(), this.backend.stop()];
  }
}

const basic = new BasicPlayer(new WebAudioBackend());
console.log(basic.playTrack("song.mp3"));
// Output: ["WebAudio: initializing", "WebAudio: playing song.mp3"]
console.log(basic.stopPlayback());
// Output: ["WebAudio: stopping"]

const streaming = new StreamingPlayer(new NativeBackend());
console.log(streaming.playTrack("stream.mp3"));
// Output: ["Native: initializing", "Native: ready", "Native: playing stream.mp3"]
console.log(streaming.stopPlayback());
// Output: ["Native: pausing", "Native: stopping"]

// Explanation: MediaPlayer (abstraction) orchestrates high-level playback workflows.
// AudioBackend (implementation) provides low-level audio operations. BasicPlayer
// and StreamingPlayer define different playback strategies while remaining agnostic
// to the audio backend.


// ============================================================================
// SOLUTION 11: Notification Bridge with Priority
// ============================================================================

interface DeliveryMethod {
  deliver(to: string, subject: string, body: string): string;
}

class EmailDelivery implements DeliveryMethod {
  deliver(to: string, subject: string, body: string): string {
    return `Email to ${to}: [${subject}] ${body}`;
  }
}

class SMSDelivery implements DeliveryMethod {
  deliver(to: string, subject: string, body: string): string {
    return `SMS to ${to}: ${subject} - ${body}`;
  }
}

class PushDelivery implements DeliveryMethod {
  deliver(to: string, subject: string, _body: string): string {
    return `Push to ${to}: ${subject}`;
  }
}

abstract class NotificationSender {
  constructor(protected delivery: DeliveryMethod) {}
  abstract send(to: string, message: string): string[];
}

class NormalNotification extends NotificationSender {
  send(to: string, message: string): string[] {
    return [this.delivery.deliver(to, "Notice", message)];
  }
}

class UrgentNotification extends NotificationSender {
  send(to: string, message: string): string[] {
    return [
      this.delivery.deliver(to, "URGENT", message),
      this.delivery.deliver(to, "URGENT-FOLLOWUP", `Reminder: ${message}`),
    ];
  }
}

class CriticalNotification extends NotificationSender {
  send(to: string, message: string): string[] {
    const upper = message.toUpperCase();
    return [
      this.delivery.deliver(to, "CRITICAL", upper),
      this.delivery.deliver(to, "CRITICAL", upper),
      this.delivery.deliver(to, "CRITICAL", upper),
    ];
  }
}

const urgentEmail = new UrgentNotification(new EmailDelivery());
console.log(urgentEmail.send("alice@test.com", "Server overload"));
// Output: [
//   "Email to alice@test.com: [URGENT] Server overload",
//   "Email to alice@test.com: [URGENT-FOLLOWUP] Reminder: Server overload"
// ]

const criticalSMS = new CriticalNotification(new SMSDelivery());
console.log(criticalSMS.send("+1234567890", "System down"));
// Output: [
//   "SMS to +1234567890: CRITICAL - SYSTEM DOWN",
//   "SMS to +1234567890: CRITICAL - SYSTEM DOWN",
//   "SMS to +1234567890: CRITICAL - SYSTEM DOWN"
// ]

const normalPush = new NormalNotification(new PushDelivery());
console.log(normalPush.send("user123", "Update available"));
// Output: ["Push to user123: Notice"]

// Explanation: 3 urgency levels × 3 delivery methods = 9 combinations using
// only 6 classes. Without Bridge, you'd need 9 separate classes (e.g.,
// UrgentEmail, UrgentSMS, CriticalPush, etc.).


// ============================================================================
// SOLUTION 12: Shape + Color Bridge (Full)
// ============================================================================

interface Color {
  fill(shape: string): string;
  getName(): string;
}

class RedColor implements Color {
  fill(shape: string): string {
    return `Filling ${shape} with red`;
  }
  getName(): string { return "Red"; }
}

class BlueColor implements Color {
  fill(shape: string): string {
    return `Filling ${shape} with blue`;
  }
  getName(): string { return "Blue"; }
}

class GreenColor implements Color {
  fill(shape: string): string {
    return `Filling ${shape} with green`;
  }
  getName(): string { return "Green"; }
}

abstract class Shape12 {
  constructor(protected color: Color) {}
  abstract draw(): string;
  abstract describe(): string;
}

class Circle12 extends Shape12 {
  constructor(color: Color, private radius: number) {
    super(color);
  }
  draw(): string {
    return this.color.fill(`Circle(r=${this.radius})`);
  }
  describe(): string {
    return `${this.color.getName()} circle with radius ${this.radius}`;
  }
}

class Square12 extends Shape12 {
  constructor(color: Color, private side: number) {
    super(color);
  }
  draw(): string {
    return this.color.fill(`Square(s=${this.side})`);
  }
  describe(): string {
    return `${this.color.getName()} square with side ${this.side}`;
  }
}

class Triangle12 extends Shape12 {
  constructor(color: Color, private base: number, private height: number) {
    super(color);
  }
  draw(): string {
    return this.color.fill(`Triangle(b=${this.base},h=${this.height})`);
  }
  describe(): string {
    return `${this.color.getName()} triangle with base ${this.base} and height ${this.height}`;
  }
}

const redCircle = new Circle12(new RedColor(), 10);
console.log(redCircle.draw());
// Output: Filling Circle(r=10) with red
console.log(redCircle.describe());
// Output: Red circle with radius 10

const blueSquare = new Square12(new BlueColor(), 5);
console.log(blueSquare.draw());
// Output: Filling Square(s=5) with blue
console.log(blueSquare.describe());
// Output: Blue square with side 5

const greenTriangle = new Triangle12(new GreenColor(), 8, 6);
console.log(greenTriangle.draw());
// Output: Filling Triangle(b=8,h=6) with green
console.log(greenTriangle.describe());
// Output: Green triangle with base 8 and height 6

// Demonstrate no Cartesian product: 3 shapes + 3 colors = 6 classes total
const shapes: Shape12[] = [
  new Circle12(new RedColor(), 3),
  new Circle12(new BlueColor(), 3),
  new Square12(new GreenColor(), 4),
  new Triangle12(new RedColor(), 5, 3),
];
shapes.forEach(s => console.log(s.describe()));
// Output:
// Red circle with radius 3
// Blue circle with radius 3
// Green square with side 4
// Red triangle with base 5 and height 3

// Explanation: Without Bridge, 3 shapes × 3 colors = 9 classes (RedCircle,
// BlueCircle, GreenCircle, RedSquare, ...). With Bridge, we have 3 shape
// classes + 3 color classes = 6 classes that can produce all 9 combinations.


// ============================================================================
// Runner
// ============================================================================
console.log("\n" + "=".repeat(60));
console.log("All solutions executed successfully!");
console.log("=".repeat(60));
