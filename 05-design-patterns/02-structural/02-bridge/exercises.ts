// ============================================================================
// Bridge Pattern — Exercises
// ============================================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// EXERCISE 1: Predict the Output
// ============================================================================
// What does the following code print?

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
  constructor(
    private renderer: Renderer1,
    private radius: number
  ) {}

  draw(): string {
    return this.renderer.render(`Circle(${this.radius})`);
  }

  resize(factor: number): void {
    this.radius *= factor;
  }
}

const vectorCircle = new Circle1(new VectorRenderer1(), 5);
console.log(vectorCircle.draw());
vectorCircle.resize(2);
console.log(vectorCircle.draw());

const rasterCircle = new Circle1(new RasterRenderer1(), 3);
console.log(rasterCircle.draw());

// Your prediction:
//
//
//


// ============================================================================
// EXERCISE 2: Predict the Output
// ============================================================================
// What does the following code print?

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
console.log(alert2.notify("Server down"));
console.log(info1.notify("Deploy complete"));

// Your prediction:
//
//
//


// ============================================================================
// EXERCISE 3: Predict the Output
// ============================================================================
// What does this code print? Pay attention to runtime implementation swapping.

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
report.setFormatter(new XMLFormatter3());
console.log(report.generate("sales"));
report.setFormatter(new JSONFormatter3());
console.log(report.generate("inventory"));

// Your prediction:
//
//
//


// ============================================================================
// EXERCISE 4: Predict the Output
// ============================================================================
// What does the code print? Focus on the refined abstraction behavior.

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
console.log(remote.volumeUp());
console.log(remote.mute());
console.log(remote.volumeDown());

// Your prediction:
//
//
//
//


// ============================================================================
// EXERCISE 5: Fix the Bug
// ============================================================================
// The PaymentProcessor bridge should allow different payment gateways.
// There are TWO bugs. Find and describe them (don't uncomment the fix).

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
    // Bug 1: Should apply a processing fee of 2.9%
    return this.gateway.charge(amount);
  }

  processRefund(amount: number): string {
    // Bug 2: Should not allow refunds greater than $1000
    return this.gateway.refund(amount);
  }
}

// Test code (commented out):
// const stripe = new PaymentProcessor5(new StripeGateway5());
// console.log(stripe.processPayment(100));
// // Expected: "Stripe charged $102.90"
// console.log(stripe.processRefund(1500));
// // Expected: "Refund denied: amount exceeds $1000 limit"
// console.log(stripe.processRefund(500));
// // Expected: "Stripe refunded $500.00"


// ============================================================================
// EXERCISE 6: Fix the Bug
// ============================================================================
// The logging bridge has a bug where the log level filtering doesn't work.
// Find and fix the bug.

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
    // Bug: The comparison is wrong — it logs messages BELOW the minimum level
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return this.output.write(`[${level.toUpperCase()}] ${message}`);
    }
    return null;
  }
}

// Test code (commented out):
// const logger = new Logger6(new ConsoleOutput6(), "warn");
// console.log(logger.log("debug", "trace info"));   // Expected: null
// console.log(logger.log("info", "started"));        // Expected: null
// console.log(logger.log("warn", "low memory"));     // Expected: "[Console] [WARN] low memory"
// console.log(logger.log("error", "crash!"));        // Expected: "[Console] [ERROR] crash!"


// ============================================================================
// EXERCISE 7: Implement — Theme Bridge
// ============================================================================
// Create a bridge between UI components and themes.
//
// Implementation interface:
//   Theme { applyTo(component: string): string }
//
// Concrete implementations:
//   LightTheme — returns "{component} styled with light background, dark text"
//   DarkTheme  — returns "{component} styled with dark background, light text"
//
// Abstraction:
//   abstract class Widget { constructor(theme: Theme); abstract render(): string }
//
// Refined abstractions:
//   ButtonWidget(theme, label) — render() returns theme.applyTo(`Button[${label}]`)
//   InputWidget(theme, placeholder) — render() returns theme.applyTo(`Input[${placeholder}]`)

// YOUR CODE HERE

// Test code (commented out):
// const lightBtn = new ButtonWidget(new LightTheme(), "Submit");
// console.log(lightBtn.render());
// // Expected: "Button[Submit] styled with light background, dark text"
//
// const darkInput = new InputWidget(new DarkTheme(), "Search...");
// console.log(darkInput.render());
// // Expected: "Input[Search...] styled with dark background, light text"


// ============================================================================
// EXERCISE 8: Implement — Database Bridge
// ============================================================================
// Create a bridge between a repository abstraction and database drivers.
//
// Implementation interface:
//   DatabaseDriver {
//     connect(): string;
//     query(sql: string): string;
//     close(): string;
//   }
//
// Concrete implementations:
//   PostgresDriver — methods return "Postgres: connecting" / "Postgres: {sql}" / "Postgres: closing"
//   SQLiteDriver   — methods return "SQLite: connecting" / "SQLite: {sql}" / "SQLite: closing"
//
// Abstraction:
//   abstract class Repository {
//     constructor(protected driver: DatabaseDriver)
//     abstract findAll(): string[];
//     abstract findById(id: number): string;
//   }
//
// Refined abstraction:
//   UserRepository extends Repository
//     findAll() → returns [driver.connect(), driver.query("SELECT * FROM users"), driver.close()]
//     findById(id) → returns driver.query(`SELECT * FROM users WHERE id = ${id}`)

// YOUR CODE HERE

// Test code (commented out):
// const pgRepo = new UserRepository(new PostgresDriver());
// console.log(pgRepo.findAll());
// // Expected: ["Postgres: connecting", "Postgres: SELECT * FROM users", "Postgres: closing"]
// console.log(pgRepo.findById(42));
// // Expected: "Postgres: SELECT * FROM users WHERE id = 42"
//
// const sqliteRepo = new UserRepository(new SQLiteDriver());
// console.log(sqliteRepo.findAll());
// // Expected: ["SQLite: connecting", "SQLite: SELECT * FROM users", "SQLite: closing"]


// ============================================================================
// EXERCISE 9: Implement — Serialization Bridge
// ============================================================================
// Create a bridge between document types and serialization formats.
//
// Implementation interface:
//   Serializer {
//     serialize(type: string, fields: Record<string, string>): string;
//   }
//
// Concrete implementations:
//   JSONSerializer — returns JSON.stringify({ type, ...fields })
//   CSVSerializer  — returns `${type},${Object.values(fields).join(",")}`
//
// Abstraction:
//   abstract class Document9 {
//     constructor(protected serializer: Serializer)
//     abstract export(): string;
//   }
//
// Refined abstractions:
//   Invoice(serializer, id, amount)
//     export() → serializer.serialize("Invoice", { id, amount })
//   Receipt(serializer, id, date)
//     export() → serializer.serialize("Receipt", { id, date })

// YOUR CODE HERE

// Test code (commented out):
// const jsonInvoice = new Invoice(new JSONSerializer(), "INV-001", "250.00");
// console.log(jsonInvoice.export());
// // Expected: '{"type":"Invoice","id":"INV-001","amount":"250.00"}'
//
// const csvReceipt = new Receipt(new CSVSerializer(), "REC-001", "2024-01-15");
// console.log(csvReceipt.export());
// // Expected: "Receipt,REC-001,2024-01-15"


// ============================================================================
// EXERCISE 10: Implement — Media Player Bridge
// ============================================================================
// Create a bridge between media players and audio backends.
//
// Implementation interface:
//   AudioBackend {
//     initialize(): string;
//     play(track: string): string;
//     pause(): string;
//     stop(): string;
//     getStatus(): string;
//   }
//
// Concrete implementations:
//   WebAudioBackend — returns "WebAudio: {action}" for each method,
//                     getStatus() returns "WebAudio: ready"
//   NativeBackend   — returns "Native: {action}" for each method,
//                     getStatus() returns "Native: ready"
//
// Abstraction:
//   abstract class MediaPlayer {
//     constructor(protected backend: AudioBackend)
//     abstract playTrack(track: string): string[];
//     abstract stopPlayback(): string[];
//   }
//
// Refined abstractions:
//   BasicPlayer — playTrack returns [backend.initialize(), backend.play(track)]
//                 stopPlayback returns [backend.stop()]
//   StreamingPlayer — playTrack returns [backend.initialize(), backend.getStatus(), backend.play(track)]
//                     stopPlayback returns [backend.pause(), backend.stop()]

// YOUR CODE HERE

// Test code (commented out):
// const basic = new BasicPlayer(new WebAudioBackend());
// console.log(basic.playTrack("song.mp3"));
// // Expected: ["WebAudio: initializing", "WebAudio: playing song.mp3"]
// console.log(basic.stopPlayback());
// // Expected: ["WebAudio: stopping"]
//
// const streaming = new StreamingPlayer(new NativeBackend());
// console.log(streaming.playTrack("stream.mp3"));
// // Expected: ["Native: initializing", "Native: ready", "Native: playing stream.mp3"]
// console.log(streaming.stopPlayback());
// // Expected: ["Native: pausing", "Native: stopping"]


// ============================================================================
// EXERCISE 11: Implement — Notification Bridge with Priority
// ============================================================================
// Create a notification system where notification urgency (abstraction) is
// decoupled from delivery mechanism (implementation).
//
// Implementation interface:
//   DeliveryMethod {
//     deliver(to: string, subject: string, body: string): string;
//   }
//
// Concrete implementations:
//   EmailDelivery  — returns `Email to ${to}: [${subject}] ${body}`
//   SMSDelivery    — returns `SMS to ${to}: ${subject} - ${body}`
//   PushDelivery   — returns `Push to ${to}: ${subject}`
//
// Abstraction:
//   abstract class NotificationSender {
//     constructor(protected delivery: DeliveryMethod)
//     abstract send(to: string, message: string): string[];
//   }
//
// Refined abstractions:
//   NormalNotification — send returns [delivery.deliver(to, "Notice", message)]
//   UrgentNotification — send returns [
//     delivery.deliver(to, "URGENT", message),
//     delivery.deliver(to, "URGENT-FOLLOWUP", `Reminder: ${message}`)
//   ]
//   CriticalNotification — send returns [
//     delivery.deliver(to, "CRITICAL", message.toUpperCase()),
//     delivery.deliver(to, "CRITICAL", message.toUpperCase()),
//     delivery.deliver(to, "CRITICAL", message.toUpperCase())
//   ]

// YOUR CODE HERE

// Test code (commented out):
// const urgentEmail = new UrgentNotification(new EmailDelivery());
// console.log(urgentEmail.send("alice@test.com", "Server overload"));
// // Expected: [
// //   "Email to alice@test.com: [URGENT] Server overload",
// //   "Email to alice@test.com: [URGENT-FOLLOWUP] Reminder: Server overload"
// // ]
//
// const criticalSMS = new CriticalNotification(new SMSDelivery());
// console.log(criticalSMS.send("+1234567890", "System down"));
// // Expected: [
// //   "SMS to +1234567890: CRITICAL - SYSTEM DOWN",
// //   "SMS to +1234567890: CRITICAL - SYSTEM DOWN",
// //   "SMS to +1234567890: CRITICAL - SYSTEM DOWN"
// // ]


// ============================================================================
// EXERCISE 12: Implement — Shape + Color Bridge (Full)
// ============================================================================
// Implement the classic shape + color bridge to prevent Cartesian product explosion.
//
// Implementation interface:
//   Color {
//     fill(shape: string): string;
//     getName(): string;
//   }
//
// Concrete implementations:
//   RedColor    — fill returns `Filling ${shape} with red`,    getName returns "Red"
//   BlueColor   — fill returns `Filling ${shape} with blue`,   getName returns "Blue"
//   GreenColor  — fill returns `Filling ${shape} with green`,  getName returns "Green"
//
// Abstraction:
//   abstract class Shape12 {
//     constructor(protected color: Color)
//     abstract draw(): string;
//     abstract describe(): string;
//   }
//
// Refined abstractions:
//   Circle12(color, radius) —
//     draw() → color.fill(`Circle(r=${radius})`)
//     describe() → `${color.getName()} circle with radius ${radius}`
//   Square12(color, side) —
//     draw() → color.fill(`Square(s=${side})`)
//     describe() → `${color.getName()} square with side ${side}`
//   Triangle12(color, base, height) —
//     draw() → color.fill(`Triangle(b=${base},h=${height})`)
//     describe() → `${color.getName()} triangle with base ${base} and height ${height}`

// YOUR CODE HERE

// Test code (commented out):
// const redCircle = new Circle12(new RedColor(), 10);
// console.log(redCircle.draw());
// // Expected: "Filling Circle(r=10) with red"
// console.log(redCircle.describe());
// // Expected: "Red circle with radius 10"
//
// const blueSquare = new Square12(new BlueColor(), 5);
// console.log(blueSquare.draw());
// // Expected: "Filling Square(s=5) with blue"
// console.log(blueSquare.describe());
// // Expected: "Blue square with side 5"
//
// const greenTriangle = new Triangle12(new GreenColor(), 8, 6);
// console.log(greenTriangle.draw());
// // Expected: "Filling Triangle(b=8,h=6) with green"
// console.log(greenTriangle.describe());
// // Expected: "Green triangle with base 8 and height 6"
//
// // Demonstrate no Cartesian product: 3 shapes × 3 colors = 6 classes (not 9!)
// const shapes: Shape12[] = [
//   new Circle12(new RedColor(), 3),
//   new Circle12(new BlueColor(), 3),
//   new Square12(new GreenColor(), 4),
//   new Triangle12(new RedColor(), 5, 3),
// ];
// shapes.forEach(s => console.log(s.describe()));


console.log("\n=== Exercises file loaded successfully ===");
