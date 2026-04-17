// =============================================================================
// FACADE PATTERN - SOLUTIONS
// =============================================================================
// Config: ES2022, strict, ESNext modules
// Run: npx tsx solutions.ts
// =============================================================================

// =============================================================================
// EXERCISE 1 — PREDICT (ANSWER)
// =============================================================================

function solution1(): void {
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
  console.log("Solution 1:", result);
  // ANSWER: ["CPU frozen", "Memory loaded at 0x00", "HD read sector 0", "CPU executing"]
  console.assert(result.length === 4);
  console.assert(result[0] === "CPU frozen");
  console.assert(result[3] === "CPU executing");
}

// =============================================================================
// EXERCISE 2 — PREDICT (ANSWER)
// =============================================================================

function solution2(): void {
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
    allOn(): string[] { return this.lights.map(l => l.on()); }
    allOff(): string[] { return this.lights.map(l => l.off()); }
  }

  const home = new SmartHomeFacade(["Kitchen", "Bedroom"]);
  const on = home.allOn();
  const off = home.allOff();
  console.log("Solution 2:", on, off);
  // ANSWER: ["Kitchen: ON", "Bedroom: ON"] ["Kitchen: OFF", "Bedroom: OFF"]
  console.assert(on[0] === "Kitchen: ON");
  console.assert(off[1] === "Bedroom: OFF");
}

// =============================================================================
// EXERCISE 3 — PREDICT (ANSWER)
// =============================================================================

function solution3(): void {
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

  const facade = new DataProcessorFacade(new Encoder(), new Compressor(), new Encryptor());
  const result = facade.process("Hi");
  console.log("Solution 3:", result);
  // ANSWER: "encrypted(compressed(SGk=))"
  console.assert(result === "encrypted(compressed(SGk=))");
}

// =============================================================================
// EXERCISE 4 — PREDICT (ANSWER)
// =============================================================================

function solution4(): void {
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
  console.log("Solution 4:", r1, r2);
  // ANSWER: "[hello world]" null
  console.assert(r1 === "[hello world]");
  console.assert(r2 === null);
}

// =============================================================================
// EXERCISE 5 — FIX (SOLUTION)
// =============================================================================

function solution5(): void {
  class Engine {
    private running = false;
    start(): string { this.running = true; return "Engine started"; }
    stop(): string { this.running = false; return "Engine stopped"; }
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

    // FIX 1: Fuel pump activated before engine start
    // FIX 2: Dashboard shows "Running"
    startCar(): string[] {
      const log: string[] = [];
      log.push(this.fuelPump.activate());
      log.push(this.engine.start());
      log.push(this.dashboard.show("Running"));
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
  console.log("Solution 5:", startLog);
  console.assert(startLog[0] === "Fuel pump active", "Fuel pump should activate first");
  console.assert(startLog[1] === "Engine started", "Engine should start after fuel pump");
  console.assert(startLog[2] === "Dashboard: Running", "Dashboard should show Running");
}

// =============================================================================
// EXERCISE 6 — FIX (SOLUTION)
// =============================================================================

function solution6(): void {
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

    // FIX 1: Validate email before sending
    // FIX 2: Use rendered body, not raw template
    sendTemplatedEmail(
      to: string,
      templateStr: string,
      vars: Record<string, string>
    ): string {
      if (!this.validator.isValid(to)) {
        return `Invalid email: ${to}`;
      }
      const body = this.template.render(templateStr, vars);
      return this.sender.send(to, body);
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
  console.log("Solution 6:", result);
  console.assert(result === "Sent to user@example.com: Hello Alice!", "Should render template");

  const invalid = facade.sendTemplatedEmail("bad-email", "Hi {{name}}", { name: "Bob" });
  console.assert(invalid === "Invalid email: bad-email", "Should reject invalid email");
}

// =============================================================================
// EXERCISE 7 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution7(): void {
  class Cart {
    private items: Array<{ name: string; price: number }> = [];
    addItem(name: string, price: number): void { this.items.push({ name, price }); }
    getTotal(): number { return this.items.reduce((sum, item) => sum + item.price, 0); }
    getItems(): Array<{ name: string; price: number }> { return [...this.items]; }
    clear(): void { this.items = []; }
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

  class ShoppingFacade {
    constructor(
      private cart: Cart,
      private payment: PaymentProcessor,
      private shipping: ShippingService
    ) {}

    checkout(paymentMethod: string, address: string): {
      payment: string;
      shipping: string;
      total: number;
    } {
      const total = this.cart.getTotal();
      const items = this.cart.getItems();
      const payment = this.payment.charge(total, paymentMethod);
      const shipping = this.shipping.ship(items, address);
      this.cart.clear();
      return { payment, shipping, total };
    }
  }

  const cart = new Cart();
  cart.addItem("Book", 20);
  cart.addItem("Pen", 5);
  const facade = new ShoppingFacade(cart, new PaymentProcessor(), new ShippingService());
  const result = facade.checkout("credit-card", "123 Main St");
  console.log("Solution 7:", result);
  console.assert(result.total === 25);
  console.assert(result.payment === "Charged $25 via credit-card");
  console.assert(result.shipping === "Shipping [Book, Pen] to 123 Main St");
  console.assert(cart.getItems().length === 0);
}

// =============================================================================
// EXERCISE 8 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution8(): void {
  class FileReader {
    read(path: string): string { return `content-of-${path}`; }
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

  class FileConverterFacade {
    constructor(
      private reader: FileReader,
      private transformer: Transformer,
      private writer: FileWriter
    ) {}

    convertToUpper(inputPath: string, outputPath: string): string {
      const content = this.reader.read(inputPath);
      const transformed = this.transformer.toUpperCase(content);
      return this.writer.write(outputPath, transformed);
    }

    convertWithLineNumbers(inputPath: string, outputPath: string): string {
      const content = this.reader.read(inputPath);
      const transformed = this.transformer.addLineNumbers(content);
      return this.writer.write(outputPath, transformed);
    }
  }

  const facade = new FileConverterFacade(new FileReader(), new Transformer(), new FileWriter());
  const r1 = facade.convertToUpper("input.txt", "output.txt");
  const r2 = facade.convertWithLineNumbers("data.txt", "numbered.txt");
  console.log("Solution 8:", r1, r2);
  console.assert(r1 === "Written to output.txt: CONTENT-OF-INPUT.TXT");
  console.assert(r2 === "Written to numbered.txt: 1: content-of-data.txt");
}

// =============================================================================
// EXERCISE 9 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution9(): void {
  class EmailService {
    send(to: string, message: string): string { return `Email to ${to}: ${message}`; }
  }

  class SMSService {
    send(phone: string, message: string): string { return `SMS to ${phone}: ${message}`; }
  }

  class PushService {
    send(deviceId: string, message: string): string { return `Push to ${deviceId}: ${message}`; }
  }

  interface UserContact {
    email: string;
    phone: string;
    deviceId: string;
  }

  class NotificationFacade {
    constructor(
      private emailService: EmailService,
      private smsService: SMSService,
      private pushService: PushService
    ) {}

    notifyAll(user: UserContact, message: string): string[] {
      return [
        this.emailService.send(user.email, message),
        this.smsService.send(user.phone, message),
        this.pushService.send(user.deviceId, message),
      ];
    }

    notifyUrgent(user: UserContact, message: string): string[] {
      return [
        this.smsService.send(user.phone, message),
        this.pushService.send(user.deviceId, message),
      ];
    }
  }

  const facade = new NotificationFacade(new EmailService(), new SMSService(), new PushService());
  const user: UserContact = { email: "a@b.com", phone: "+1234", deviceId: "dev-1" };
  const all = facade.notifyAll(user, "Hello");
  const urgent = facade.notifyUrgent(user, "Alert!");
  console.log("Solution 9:", all, urgent);
  console.assert(all.length === 3);
  console.assert(all[0] === "Email to a@b.com: Hello");
  console.assert(urgent.length === 2);
  console.assert(urgent[0] === "SMS to +1234: Alert!");
}

// =============================================================================
// EXERCISE 10 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution10(): void {
  class BuildSystem {
    build(project: string): { success: boolean; artifact: string } {
      return { success: true, artifact: `${project}.build` };
    }
  }

  class TestRunner {
    runTests(_artifact: string): { passed: boolean; count: number } {
      return { passed: true, count: 42 };
    }
  }

  class DeployService {
    deploy(artifact: string, env: string): string {
      return `Deployed ${artifact} to ${env}`;
    }
  }

  class DeploymentFacade {
    constructor(
      private buildSystem: BuildSystem,
      private testRunner: TestRunner,
      private deployService: DeployService
    ) {}

    deployToProduction(project: string):
      | { build: string; tests: number; deploy: string }
      | { error: string } {
      const buildResult = this.buildSystem.build(project);
      if (!buildResult.success) return { error: "Build failed" };

      const testResult = this.testRunner.runTests(buildResult.artifact);
      if (!testResult.passed) return { error: "Tests failed" };

      const deployResult = this.deployService.deploy(buildResult.artifact, "production");
      return {
        build: buildResult.artifact,
        tests: testResult.count,
        deploy: deployResult,
      };
    }
  }

  const facade = new DeploymentFacade(new BuildSystem(), new TestRunner(), new DeployService());
  const result = facade.deployToProduction("my-app");
  console.log("Solution 10:", result);
  console.assert("build" in result && result.build === "my-app.build");
  console.assert("tests" in result && result.tests === 42);
  console.assert("deploy" in result && result.deploy === "Deployed my-app.build to production");
}

// =============================================================================
// EXERCISE 11 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution11(): void {
  class DataFetcher {
    fetch(source: string): number[] {
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

  class ReportFacade {
    constructor(
      private fetcher: DataFetcher,
      private analyzer: Analyzer,
      private renderer: ReportRenderer
    ) {}

    generateReport(source: string): string {
      const data = this.fetcher.fetch(source);
      const stats: Record<string, number> = {
        sum: this.analyzer.sum(data),
        average: this.analyzer.average(data),
        max: this.analyzer.max(data),
      };
      return this.renderer.render(source, stats);
    }
  }

  const facade = new ReportFacade(new DataFetcher(), new Analyzer(), new ReportRenderer());
  const report = facade.generateReport("sales");
  console.log("Solution 11:", report);
  console.assert(report.includes("--- sales ---"));
  console.assert(report.includes("sum: 750"));
  console.assert(report.includes("average: 187.5"));
  console.assert(report.includes("max: 300"));
}

// =============================================================================
// EXERCISE 12 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution12(): void {
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

  class GameEngineFacade {
    constructor(
      private physics: PhysicsEngine,
      private graphics: GraphicsEngine,
      private audio: AudioEngine
    ) {}

    startGame(resolution: string, bgmTrack: string): string[] {
      return [
        this.physics.init(),
        this.graphics.init(resolution),
        this.audio.init(),
        this.audio.playBGM(bgmTrack),
      ];
    }

    gameLoop(deltaMs: number): string[] {
      return [
        this.physics.update(deltaMs),
        this.graphics.render(),
      ];
    }

    stopGame(): string[] {
      return [
        this.audio.shutdown(),
        this.graphics.shutdown(),
        this.physics.shutdown(),
      ];
    }
  }

  const facade = new GameEngineFacade(
    new PhysicsEngine(), new GraphicsEngine(), new AudioEngine()
  );
  const start = facade.startGame("1920x1080", "main-theme");
  const loop = facade.gameLoop(16);
  const stop = facade.stopGame();
  console.log("Solution 12:", start, loop, stop);
  console.assert(start.length === 4);
  console.assert(start[0] === "Physics initialized");
  console.assert(start[1] === "Graphics initialized: 1920x1080");
  console.assert(start[2] === "Audio initialized");
  console.assert(start[3] === "Playing: main-theme");
  console.assert(loop.length === 2);
  console.assert(stop[0] === "Audio shutdown");
  console.assert(stop[2] === "Physics shutdown");
}

// =============================================================================
// RUNNER
// =============================================================================

console.log("=== FACADE PATTERN SOLUTIONS ===\n");
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
