// =============================================================================
// FACADE PATTERN - EXERCISES
// =============================================================================
// 12 exercises: 4 predict, 2 fix, 6 implement
// Config: ES2022, strict, ESNext modules
// Run: npx tsx exercises.ts
// =============================================================================

// ─── Subsystem helpers used across exercises ─────────────────────────────────

class Logger {
  private logs: string[] = [];
  log(msg: string): void { this.logs.push(msg); }
  getLogs(): string[] { return [...this.logs]; }
  clear(): void { this.logs = []; }
}

// =============================================================================
// EXERCISE 1 — PREDICT
// What does this print?
// =============================================================================

function exercise1(): void {
  class CPU {
    freeze(): string { return "CPU frozen"; }
    execute(): string { return "CPU executing"; }
  }
  class Memory {
    load(address: string): string { return `Memory loaded at ${address}`; }
  }
  class HardDrive {
    read(sector: number): string { return `HD read sector ${sector}`; }
  }

  class ComputerFacade {
    constructor(
      private cpu: CPU,
      private memory: Memory,
      private hd: HardDrive
    ) {}

    start(): string[] {
      return [
        this.cpu.freeze(),
        this.memory.load("0x00"),
        this.hd.read(0),
        this.cpu.execute(),
      ];
    }
  }

  const computer = new ComputerFacade(new CPU(), new Memory(), new HardDrive());
  const result = computer.start();
  console.log("Exercise 1:", result);
  // YOUR PREDICTION:
  // ["CPU frozen", "Memory loaded at 0x00", "HD read sector 0", "CPU executing"]
}

// =============================================================================
// EXERCISE 2 — PREDICT
// What does this print?
// =============================================================================

function exercise2(): void {
  class Light {
    constructor(private name: string) {}
    on(): string { return `${this.name}: ON`; }
    off(): string { return `${this.name}: OFF`; }
  }

  class SmartHomeFacade {
    private lights: Light[];
    constructor(names: string[]) {
      this.lights = names.map(n => new Light(n));
    }

    allOn(): string[] {
      return this.lights.map(l => l.on());
    }

    allOff(): string[] {
      return this.lights.map(l => l.off());
    }
  }

  const home = new SmartHomeFacade(["Kitchen", "Bedroom"]);
  const on = home.allOn();
  const off = home.allOff();
  console.log("Exercise 2:", on, off);
  // YOUR PREDICTION:
  // ["Kitchen: ON", "Bedroom: ON"] ["Kitchen: OFF", "Bedroom: OFF"]
}

// =============================================================================
// EXERCISE 3 — PREDICT
// What does this print?
// =============================================================================

function exercise3(): void {
  class Encoder {
    encode(data: string): string { return Buffer.from(data).toString("base64"); }
  }
  class Compressor {
    compress(data: string): string { return `compressed(${data})`; }
  }
  class Encryptor {
    encrypt(data: string): string { return `encrypted(${data})`; }
  }

  class DataProcessorFacade {
    constructor(
      private encoder: Encoder,
      private compressor: Compressor,
      private encryptor: Encryptor
    ) {}

    process(data: string): string {
      const encoded = this.encoder.encode(data);
      const compressed = this.compressor.compress(encoded);
      return this.encryptor.encrypt(compressed);
    }
  }

  const facade = new DataProcessorFacade(
    new Encoder(), new Compressor(), new Encryptor()
  );
  const result = facade.process("Hi");
  console.log("Exercise 3:", result);
  // YOUR PREDICTION:
  // "encrypted(compressed(SGk=))"
}

// =============================================================================
// EXERCISE 4 — PREDICT
// What does this print?
// =============================================================================

function exercise4(): void {
  class Validator {
    validate(value: string): boolean { return value.length > 0; }
  }
  class Sanitizer {
    sanitize(value: string): string { return value.trim().toLowerCase(); }
  }
  class Formatter {
    format(value: string): string { return `[${value}]`; }
  }

  class InputFacade {
    constructor(
      private validator: Validator,
      private sanitizer: Sanitizer,
      private formatter: Formatter
    ) {}

    process(input: string): string | null {
      const sanitized = this.sanitizer.sanitize(input);
      if (!this.validator.validate(sanitized)) return null;
      return this.formatter.format(sanitized);
    }
  }

  const facade = new InputFacade(new Validator(), new Sanitizer(), new Formatter());
  const r1 = facade.process("  Hello World  ");
  const r2 = facade.process("   ");
  console.log("Exercise 4:", r1, r2);
  // YOUR PREDICTION:
  // "[hello world]" null
}

// =============================================================================
// EXERCISE 5 — FIX
// The facade should coordinate subsystems but has bugs. Fix them.
// =============================================================================

function exercise5(): void {
  class Engine {
    private running = false;
    start(): string {
      this.running = true;
      return "Engine started";
    }
    stop(): string {
      this.running = false;
      return "Engine stopped";
    }
    isRunning(): boolean { return this.running; }
  }

  class FuelPump {
    activate(): string { return "Fuel pump active"; }
    deactivate(): string { return "Fuel pump inactive"; }
  }

  class Dashboard {
    show(status: string): string { return `Dashboard: ${status}`; }
  }

  class CarFacade {
    constructor(
      private engine: Engine,
      private fuelPump: FuelPump,
      private dashboard: Dashboard
    ) {}

    // BUG 1: Engine is started before fuel pump is activated
    // BUG 2: Dashboard should show "Running" after start, not "Idle"
    startCar(): string[] {
      const log: string[] = [];
      log.push(this.engine.start());
      log.push(this.fuelPump.activate());
      log.push(this.dashboard.show("Idle"));
      return log;
    }

    stopCar(): string[] {
      const log: string[] = [];
      log.push(this.engine.stop());
      log.push(this.fuelPump.deactivate());
      log.push(this.dashboard.show("Off"));
      return log;
    }
  }

  const car = new CarFacade(new Engine(), new FuelPump(), new Dashboard());
  const startLog = car.startCar();
  console.log("Exercise 5:", startLog);

  // TEST (uncomment to verify):
  // console.assert(startLog[0] === "Fuel pump active", "Fuel pump should activate first");
  // console.assert(startLog[1] === "Engine started", "Engine should start after fuel pump");
  // console.assert(startLog[2] === "Dashboard: Running", "Dashboard should show Running");
}

// =============================================================================
// EXERCISE 6 — FIX
// The email facade has bugs. Fix them.
// =============================================================================

function exercise6(): void {
  class TemplateEngine {
    render(template: string, vars: Record<string, string>): string {
      let result = template;
      for (const [key, value] of Object.entries(vars)) {
        result = result.replace(`{{${key}}}`, value);
      }
      return result;
    }
  }

  class EmailValidator {
    isValid(email: string): boolean {
      return email.includes("@") && email.includes(".");
    }
  }

  class EmailSender {
    send(to: string, body: string): string {
      return `Sent to ${to}: ${body}`;
    }
  }

  class EmailFacade {
    constructor(
      private template: TemplateEngine,
      private validator: EmailValidator,
      private sender: EmailSender
    ) {}

    // BUG 1: Does not validate email before sending
    // BUG 2: Sends raw template instead of rendered body
    sendTemplatedEmail(
      to: string,
      templateStr: string,
      vars: Record<string, string>
    ): string {
      const body = this.template.render(templateStr, vars);
      return this.sender.send(to, templateStr);
    }
  }

  const facade = new EmailFacade(
    new TemplateEngine(), new EmailValidator(), new EmailSender()
  );
  const result = facade.sendTemplatedEmail(
    "user@example.com",
    "Hello {{name}}!",
    { name: "Alice" }
  );
  console.log("Exercise 6:", result);

  // TEST (uncomment to verify):
  // console.assert(result === "Sent to user@example.com: Hello Alice!", "Should render template");
  // const invalid = facade.sendTemplatedEmail("bad-email", "Hi {{name}}", { name: "Bob" });
  // console.assert(invalid === "Invalid email: bad-email", "Should reject invalid email");
}

// =============================================================================
// EXERCISE 7 — IMPLEMENT
// Create a ShoppingFacade that coordinates Cart, PaymentProcessor, and ShippingService.
// =============================================================================

function exercise7(): void {
  class Cart {
    private items: Array<{ name: string; price: number }> = [];

    addItem(name: string, price: number): void {
      this.items.push({ name, price });
    }

    getTotal(): number {
      return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    getItems(): Array<{ name: string; price: number }> {
      return [...this.items];
    }

    clear(): void {
      this.items = [];
    }
  }

  class PaymentProcessor {
    charge(amount: number, method: string): string {
      return `Charged $${amount} via ${method}`;
    }
  }

  class ShippingService {
    ship(items: Array<{ name: string }>, address: string): string {
      const names = items.map(i => i.name).join(", ");
      return `Shipping [${names}] to ${address}`;
    }
  }

  // TODO: Implement ShoppingFacade with a `checkout` method that:
  // 1. Gets cart total
  // 2. Charges payment
  // 3. Ships items
  // 4. Clears cart
  // 5. Returns { payment: string, shipping: string, total: number }

  // const cart = new Cart();
  // cart.addItem("Book", 20);
  // cart.addItem("Pen", 5);
  // const facade = new ShoppingFacade(cart, new PaymentProcessor(), new ShippingService());
  // const result = facade.checkout("credit-card", "123 Main St");
  // console.log("Exercise 7:", result);

  // TEST (uncomment to verify):
  // console.assert(result.total === 25, "Total should be 25");
  // console.assert(result.payment === "Charged $25 via credit-card", "Payment msg");
  // console.assert(result.shipping === "Shipping [Book, Pen] to 123 Main St", "Shipping msg");
  // console.assert(cart.getItems().length === 0, "Cart should be cleared");

  console.log("Exercise 7: Not implemented yet");
}

// =============================================================================
// EXERCISE 8 — IMPLEMENT
// Create a FileConverterFacade that coordinates Reader, Transformer, Writer.
// =============================================================================

function exercise8(): void {
  class FileReader {
    read(path: string): string {
      return `content-of-${path}`;
    }
  }

  class Transformer {
    toUpperCase(content: string): string { return content.toUpperCase(); }
    addLineNumbers(content: string): string {
      return content.split("\n").map((line, i) => `${i + 1}: ${line}`).join("\n");
    }
  }

  class FileWriter {
    write(path: string, content: string): string {
      return `Written to ${path}: ${content}`;
    }
  }

  // TODO: Implement FileConverterFacade with:
  // - convertToUpper(inputPath, outputPath): reads, transforms to upper, writes
  // - convertWithLineNumbers(inputPath, outputPath): reads, adds line numbers, writes
  // Both return the writer's result string.

  // const facade = new FileConverterFacade(new FileReader(), new Transformer(), new FileWriter());
  // const r1 = facade.convertToUpper("input.txt", "output.txt");
  // const r2 = facade.convertWithLineNumbers("data.txt", "numbered.txt");
  // console.log("Exercise 8:", r1, r2);

  // TEST (uncomment to verify):
  // console.assert(r1 === "Written to output.txt: CONTENT-OF-INPUT.TXT", "Upper conversion");
  // console.assert(r2 === "Written to numbered.txt: 1: content-of-data.txt", "Line numbers");

  console.log("Exercise 8: Not implemented yet");
}

// =============================================================================
// EXERCISE 9 — IMPLEMENT
// Create a NotificationFacade that coordinates Email, SMS, and PushNotification.
// =============================================================================

function exercise9(): void {
  class EmailService {
    send(to: string, message: string): string {
      return `Email to ${to}: ${message}`;
    }
  }

  class SMSService {
    send(phone: string, message: string): string {
      return `SMS to ${phone}: ${message}`;
    }
  }

  class PushService {
    send(deviceId: string, message: string): string {
      return `Push to ${deviceId}: ${message}`;
    }
  }

  interface UserContact {
    email: string;
    phone: string;
    deviceId: string;
  }

  // TODO: Implement NotificationFacade with:
  // - notifyAll(user: UserContact, message: string): string[]
  //   Sends via all 3 channels, returns array of result strings
  // - notifyUrgent(user: UserContact, message: string): string[]
  //   Sends via SMS and Push only (skips email), returns array

  // const facade = new NotificationFacade(new EmailService(), new SMSService(), new PushService());
  // const user: UserContact = { email: "a@b.com", phone: "+1234", deviceId: "dev-1" };
  // const all = facade.notifyAll(user, "Hello");
  // const urgent = facade.notifyUrgent(user, "Alert!");
  // console.log("Exercise 9:", all, urgent);

  // TEST (uncomment to verify):
  // console.assert(all.length === 3, "notifyAll sends 3");
  // console.assert(all[0] === "Email to a@b.com: Hello");
  // console.assert(urgent.length === 2, "notifyUrgent sends 2");
  // console.assert(urgent[0] === "SMS to +1234: Alert!");

  console.log("Exercise 9: Not implemented yet");
}

// =============================================================================
// EXERCISE 10 — IMPLEMENT
// Create a DeploymentFacade that coordinates Build, Test, and Deploy subsystems.
// =============================================================================

function exercise10(): void {
  class BuildSystem {
    build(project: string): { success: boolean; artifact: string } {
      return { success: true, artifact: `${project}.build` };
    }
  }

  class TestRunner {
    runTests(artifact: string): { passed: boolean; count: number } {
      return { passed: true, count: 42 };
    }
  }

  class DeployService {
    deploy(artifact: string, env: string): string {
      return `Deployed ${artifact} to ${env}`;
    }
  }

  // TODO: Implement DeploymentFacade with:
  // - deployToProduction(project: string): { build: string, tests: number, deploy: string } | { error: string }
  //   1. Build the project. If build fails, return { error: "Build failed" }
  //   2. Run tests on the artifact. If tests fail, return { error: "Tests failed" }
  //   3. Deploy to "production"
  //   4. Return { build: artifact, tests: count, deploy: deploy result }

  // const facade = new DeploymentFacade(new BuildSystem(), new TestRunner(), new DeployService());
  // const result = facade.deployToProduction("my-app");
  // console.log("Exercise 10:", result);

  // TEST (uncomment to verify):
  // console.assert("build" in result && result.build === "my-app.build");
  // console.assert("tests" in result && result.tests === 42);
  // console.assert("deploy" in result && result.deploy === "Deployed my-app.build to production");

  console.log("Exercise 10: Not implemented yet");
}

// =============================================================================
// EXERCISE 11 — IMPLEMENT
// Create a ReportFacade that coordinates DataFetcher, Analyzer, and Renderer.
// =============================================================================

function exercise11(): void {
  class DataFetcher {
    fetch(source: string): number[] {
      // Simulated data
      const data: Record<string, number[]> = {
        sales: [100, 200, 150, 300],
        users: [10, 20, 30, 40],
      };
      return data[source] ?? [];
    }
  }

  class Analyzer {
    sum(data: number[]): number { return data.reduce((a, b) => a + b, 0); }
    average(data: number[]): number {
      return data.length === 0 ? 0 : this.sum(data) / data.length;
    }
    max(data: number[]): number { return Math.max(...data); }
  }

  class ReportRenderer {
    render(title: string, stats: Record<string, number>): string {
      const lines = Object.entries(stats).map(([k, v]) => `  ${k}: ${v}`);
      return `--- ${title} ---\n${lines.join("\n")}`;
    }
  }

  // TODO: Implement ReportFacade with:
  // - generateReport(source: string): string
  //   1. Fetch data from source
  //   2. Calculate sum, average, max using Analyzer
  //   3. Render report with title = source, stats = { sum, average, max }

  // const facade = new ReportFacade(new DataFetcher(), new Analyzer(), new ReportRenderer());
  // const report = facade.generateReport("sales");
  // console.log("Exercise 11:", report);

  // TEST (uncomment to verify):
  // console.assert(report.includes("--- sales ---"));
  // console.assert(report.includes("sum: 750"));
  // console.assert(report.includes("average: 187.5"));
  // console.assert(report.includes("max: 300"));

  console.log("Exercise 11: Not implemented yet");
}

// =============================================================================
// EXERCISE 12 — IMPLEMENT
// Create a GameEngineFacade that coordinates Physics, Graphics, and Audio subsystems.
// =============================================================================

function exercise12(): void {
  class PhysicsEngine {
    init(): string { return "Physics initialized"; }
    update(deltaMs: number): string { return `Physics updated: ${deltaMs}ms`; }
    shutdown(): string { return "Physics shutdown"; }
  }

  class GraphicsEngine {
    init(resolution: string): string { return `Graphics initialized: ${resolution}`; }
    render(): string { return "Frame rendered"; }
    shutdown(): string { return "Graphics shutdown"; }
  }

  class AudioEngine {
    init(): string { return "Audio initialized"; }
    playBGM(track: string): string { return `Playing: ${track}`; }
    shutdown(): string { return "Audio shutdown"; }
  }

  // TODO: Implement GameEngineFacade with:
  // - startGame(resolution: string, bgmTrack: string): string[]
  //   Init physics, graphics(resolution), audio. Play bgmTrack. Return all messages.
  // - gameLoop(deltaMs: number): string[]
  //   Update physics(deltaMs), render graphics. Return messages.
  // - stopGame(): string[]
  //   Shutdown audio, graphics, physics (reverse order). Return messages.

  // const facade = new GameEngineFacade(new PhysicsEngine(), new GraphicsEngine(), new AudioEngine());
  // const start = facade.startGame("1920x1080", "main-theme");
  // const loop = facade.gameLoop(16);
  // const stop = facade.stopGame();
  // console.log("Exercise 12:", start, loop, stop);

  // TEST (uncomment to verify):
  // console.assert(start.length === 4);
  // console.assert(start[0] === "Physics initialized");
  // console.assert(start[1] === "Graphics initialized: 1920x1080");
  // console.assert(start[2] === "Audio initialized");
  // console.assert(start[3] === "Playing: main-theme");
  // console.assert(loop.length === 2);
  // console.assert(stop[0] === "Audio shutdown");
  // console.assert(stop[2] === "Physics shutdown");

  console.log("Exercise 12: Not implemented yet");
}

// =============================================================================
// RUNNER
// =============================================================================

console.log("=== FACADE PATTERN EXERCISES ===\n");
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
