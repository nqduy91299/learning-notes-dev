// ============================================================================
// Mediator Pattern - Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ============================================================================
// SOLUTION 1 - PREDICT: Basic Mediator Notification
// ============================================================================
// Output:
// Mediator received: A -> click
// Mediator tells B to update
// Mediator received: B -> change
// Mediator tells A to refresh
// Mediator received: C -> hover

function solution1(): void {
  console.log("=== Solution 1: Basic Mediator ===");

  interface Mediator {
    notify(sender: string, event: string): void;
  }

  class ConcreteMediator implements Mediator {
    notify(sender: string, event: string): void {
      console.log(`Mediator received: ${sender} -> ${event}`);
      if (sender === "A" && event === "click") {
        console.log("Mediator tells B to update");
      }
      if (sender === "B" && event === "change") {
        console.log("Mediator tells A to refresh");
      }
    }
  }

  const mediator = new ConcreteMediator();
  mediator.notify("A", "click");
  mediator.notify("B", "change");
  mediator.notify("C", "hover");
}

// ============================================================================
// SOLUTION 2 - PREDICT: Chat Room
// ============================================================================
// Output:
// Alice sends: Hello!
// Bob receives from Alice: Hello!
// Charlie receives from Alice: Hello!
// Bob sends: Hi Alice!
// Alice receives from Bob: Hi Alice!
// Charlie receives from Bob: Hi Alice!

function solution2(): void {
  console.log("\n=== Solution 2: Chat Room ===");

  interface ChatMediator {
    sendMessage(message: string, sender: ChatUser): void;
    addUser(user: ChatUser): void;
  }

  class ChatUser {
    constructor(
      public name: string,
      private mediator: ChatMediator
    ) {}

    send(message: string): void {
      console.log(`${this.name} sends: ${message}`);
      this.mediator.sendMessage(message, this);
    }

    receive(message: string, from: string): void {
      console.log(`${this.name} receives from ${from}: ${message}`);
    }
  }

  class ChatRoom implements ChatMediator {
    private users: ChatUser[] = [];

    addUser(user: ChatUser): void {
      this.users.push(user);
    }

    sendMessage(message: string, sender: ChatUser): void {
      for (const user of this.users) {
        if (user !== sender) {
          user.receive(message, sender.name);
        }
      }
    }
  }

  const room = new ChatRoom();
  const alice = new ChatUser("Alice", room);
  const bob = new ChatUser("Bob", room);
  const charlie = new ChatUser("Charlie", room);
  room.addUser(alice);
  room.addUser(bob);
  room.addUser(charlie);

  alice.send("Hello!");
  bob.send("Hi Alice!");
}

// ============================================================================
// SOLUTION 3 - PREDICT: Event Filtering
// ============================================================================
// Output:
// Handler1: file.txt
// Handler2: file.txt
// Handler3: old.txt
// (nothing for "update" since no handlers registered)

function solution3(): void {
  console.log("\n=== Solution 3: Event Filtering ===");

  type EventHandler = (data: string) => void;

  class EventMediator {
    private handlers: Map<string, EventHandler[]> = new Map();

    on(event: string, handler: EventHandler): void {
      if (!this.handlers.has(event)) {
        this.handlers.set(event, []);
      }
      this.handlers.get(event)!.push(handler);
    }

    emit(event: string, data: string): void {
      const handlers = this.handlers.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(data);
        }
      }
    }
  }

  const mediator = new EventMediator();
  mediator.on("save", (d) => console.log(`Handler1: ${d}`));
  mediator.on("save", (d) => console.log(`Handler2: ${d}`));
  mediator.on("delete", (d) => console.log(`Handler3: ${d}`));

  mediator.emit("save", "file.txt");
  mediator.emit("delete", "old.txt");
  mediator.emit("update", "new.txt");
}

// ============================================================================
// SOLUTION 4 - PREDICT: Mediator Ordering
// ============================================================================
// Output:
// input triggers change
// input triggers focus
// form triggers submit
// ["input:change", "validate", "input:focus", "form:submit", "save"]

function solution4(): void {
  console.log("\n=== Solution 4: Mediator Ordering ===");

  class Component {
    constructor(
      public name: string,
      private onNotify: (name: string, event: string) => void
    ) {}

    trigger(event: string): void {
      console.log(`${this.name} triggers ${event}`);
      this.onNotify(this.name, event);
    }
  }

  const log: string[] = [];

  const mediator = (name: string, event: string): void => {
    log.push(`${name}:${event}`);
    if (name === "input" && event === "change") {
      log.push("validate");
    }
    if (name === "form" && event === "submit") {
      log.push("save");
    }
  };

  const input = new Component("input", mediator);
  const form = new Component("form", mediator);

  input.trigger("change");
  input.trigger("focus");
  form.trigger("submit");

  console.log(log);
}

// ============================================================================
// SOLUTION 5 - FIX: Chat Mediator
// ============================================================================

interface FixedChatMediator {
  register(user: FixedChatUser): void;
  send(message: string, sender: FixedChatUser): void;
}

class FixedChatUser {
  public received: string[] = [];

  constructor(
    public name: string,
    private mediator: FixedChatMediator
  ) {
    mediator.register(this); // FIX 1: register on construction
  }

  send(message: string): void {
    this.mediator.send(message, this);
  }

  receive(message: string): void {
    this.received.push(message);
  }
}

class FixedChatRoom implements FixedChatMediator {
  private users: FixedChatUser[] = [];

  register(user: FixedChatUser): void {
    this.users.push(user);
  }

  send(message: string, sender: FixedChatUser): void {
    for (const user of this.users) {
      if (user !== sender) {
        // FIX 2: exclude sender
        user.receive(`${sender.name}: ${message}`);
      }
    }
  }
}

function solution5(): void {
  console.log("\n=== Solution 5: Fixed Chat Mediator ===");
  const room = new FixedChatRoom();
  const alice = new FixedChatUser("Alice", room);
  const bob = new FixedChatUser("Bob", room);
  alice.send("Hello");
  bob.send("Hi");
  console.assert(
    alice.received.length === 1 && alice.received[0] === "Bob: Hi",
    `Alice got: ${JSON.stringify(alice.received)}`
  );
  console.assert(
    bob.received.length === 1 && bob.received[0] === "Alice: Hello",
    `Bob got: ${JSON.stringify(bob.received)}`
  );
  console.log("Exercise 5 passed!");
}

// ============================================================================
// SOLUTION 6 - FIX: Form Mediator
// ============================================================================

class FixedFormField {
  value = "";
  private onChange: (() => void) | null = null;

  setOnChange(handler: () => void): void {
    this.onChange = handler;
  }

  setValue(v: string): void {
    this.value = v;
    this.onChange?.(); // FIX 1: call onChange
  }
}

class FixedSubmitButton {
  enabled = false;
}

class FixedFormMediator {
  constructor(
    private username: FixedFormField,
    private password: FixedFormField,
    private submit: FixedSubmitButton
  ) {
    // FIX 2: wire up onChange handlers
    username.setOnChange(() => this.validate());
    password.setOnChange(() => this.validate());
  }

  validate(): void {
    // FIX 3: AND instead of OR
    this.submit.enabled =
      this.username.value.length > 0 && this.password.value.length > 0;
  }
}

function solution6(): void {
  console.log("\n=== Solution 6: Fixed Form Mediator ===");
  const username = new FixedFormField();
  const password = new FixedFormField();
  const submit = new FixedSubmitButton();
  const _mediator = new FixedFormMediator(username, password, submit);

  username.setValue("alice");
  console.assert(submit.enabled === false, "Should be false: password empty");

  password.setValue("secret");
  console.assert(submit.enabled === true, "Should be true: both filled");

  username.setValue("");
  console.assert(submit.enabled === false, "Should be false: username empty");

  console.log("Exercise 6 passed!");
}

// ============================================================================
// SOLUTION 7 - IMPLEMENT: Air Traffic Control
// ============================================================================

interface ATCMediator {
  requestLanding(aircraft: Aircraft): boolean;
  notifyLanded(aircraft: Aircraft): void;
}

class Aircraft {
  public landed = false;

  constructor(
    public callsign: string,
    private atc: ATCMediator
  ) {}

  requestLanding(): boolean {
    return this.atc.requestLanding(this);
  }

  land(): void {
    this.landed = true;
    this.atc.notifyLanded(this);
  }
}

class ControlTower implements ATCMediator {
  private runwayFree = true;

  requestLanding(aircraft: Aircraft): boolean {
    if (this.runwayFree) {
      this.runwayFree = false;
      console.log(`Tower: ${aircraft.callsign} cleared to land`);
      return true;
    }
    console.log(`Tower: ${aircraft.callsign} hold position`);
    return false;
  }

  notifyLanded(aircraft: Aircraft): void {
    console.log(`Tower: ${aircraft.callsign} has landed, runway free`);
    this.runwayFree = true;
  }
}

function solution7(): void {
  console.log("\n=== Solution 7: Air Traffic Control ===");
  const tower = new ControlTower();
  const flight1 = new Aircraft("FL100", tower);
  const flight2 = new Aircraft("FL200", tower);

  console.assert(flight1.requestLanding() === true, "FL100 should get permission");
  console.assert(flight2.requestLanding() === false, "FL200 denied");
  flight1.land();
  console.assert(flight1.landed === true);
  console.assert(flight2.requestLanding() === true, "FL200 now permitted");
  console.log("Exercise 7 passed!");
}

// ============================================================================
// SOLUTION 8 - IMPLEMENT: Dialog Mediator
// ============================================================================

interface DialogMediatorInterface {
  notify(sender: string, event: string): void;
}

class DialogCheckbox {
  checked = false;

  constructor(private mediator: DialogMediatorInterface) {}

  toggle(): void {
    this.checked = !this.checked;
    this.mediator.notify("checkbox", "toggle");
  }
}

class DialogTextInput {
  disabled = true;
  value = "";
}

class DialogLabel {
  visible = false;
  text = "";
}

class DialogMediator implements DialogMediatorInterface {
  public checkbox: DialogCheckbox;
  public input: DialogTextInput;
  public label: DialogLabel;

  constructor() {
    this.checkbox = new DialogCheckbox(this);
    this.input = new DialogTextInput();
    this.label = new DialogLabel();
  }

  notify(sender: string, event: string): void {
    if (sender === "checkbox" && event === "toggle") {
      this.input.disabled = !this.checkbox.checked;
      this.label.visible = this.checkbox.checked;
    }
  }
}

function createDialog() {
  const mediator = new DialogMediator();
  return {
    checkbox: mediator.checkbox,
    input: mediator.input,
    label: mediator.label,
    mediator,
  };
}

function solution8(): void {
  console.log("\n=== Solution 8: Dialog Mediator ===");
  const { checkbox, input, label } = createDialog();

  console.assert(input.disabled === true);
  console.assert(label.visible === false);

  checkbox.toggle();
  console.assert(checkbox.checked === true);
  console.assert(input.disabled === false);
  console.assert(label.visible === true);

  checkbox.toggle();
  console.assert(input.disabled === true);
  console.assert(label.visible === false);

  console.log("Exercise 8 passed!");
}

// ============================================================================
// SOLUTION 9 - IMPLEMENT: Typed Event Bus
// ============================================================================

class TypedEventBus {
  private handlers: Map<string, Array<(data: unknown) => void>> = new Map();

  on<T>(event: string, handler: (data: T) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler as (data: unknown) => void);
  }

  off<T>(event: string, handler: (data: T) => void): void {
    const list = this.handlers.get(event);
    if (list) {
      const idx = list.indexOf(handler as (data: unknown) => void);
      if (idx !== -1) list.splice(idx, 1);
    }
  }

  emit<T>(event: string, data: T): void {
    const list = this.handlers.get(event);
    if (list) {
      for (const handler of list) {
        handler(data);
      }
    }
  }
}

function solution9(): void {
  console.log("\n=== Solution 9: Typed Event Bus ===");
  const bus = new TypedEventBus();
  const received: string[] = [];

  const handler1 = (data: string) => received.push(`h1:${data}`);
  const handler2 = (data: string) => received.push(`h2:${data}`);

  bus.on("msg", handler1);
  bus.on("msg", handler2);
  bus.emit("msg", "hello");

  console.assert(received.length === 2);
  console.assert(received[0] === "h1:hello");
  console.assert(received[1] === "h2:hello");

  bus.off("msg", handler1);
  bus.emit("msg", "world");

  console.assert(received.length === 3);
  console.assert(received[2] === "h2:world");

  console.log("Exercise 9 passed!");
}

// ============================================================================
// SOLUTION 10 - IMPLEMENT: Middleware Pipeline
// ============================================================================

interface MiddlewareContext {
  path: string;
  body: string;
  handled: boolean;
  logs: string[];
}

type Middleware = (ctx: MiddlewareContext, next: () => void) => void;

class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  execute(ctx: MiddlewareContext): void {
    let index = 0;
    const next = (): void => {
      if (index < this.middlewares.length) {
        const mw = this.middlewares[index++];
        mw(ctx, next);
      }
    };
    next();
  }
}

function solution10(): void {
  console.log("\n=== Solution 10: Middleware Pipeline ===");
  const pipeline = new MiddlewarePipeline();

  pipeline.use((ctx, next) => {
    ctx.logs.push("auth");
    next();
  });
  pipeline.use((ctx, next) => {
    ctx.logs.push("logging");
    next();
  });
  pipeline.use((ctx, _next) => {
    ctx.logs.push("handler");
    ctx.handled = true;
  });
  pipeline.use((ctx, next) => {
    ctx.logs.push("should-not-run");
    next();
  });

  const ctx: MiddlewareContext = { path: "/test", body: "", handled: false, logs: [] };
  pipeline.execute(ctx);

  console.assert(
    JSON.stringify(ctx.logs) === JSON.stringify(["auth", "logging", "handler"]),
    `Got: ${JSON.stringify(ctx.logs)}`
  );
  console.assert(ctx.handled === true);
  console.log("Exercise 10 passed!");
}

// ============================================================================
// SOLUTION 11 - IMPLEMENT: Smart Home Mediator
// ============================================================================

interface SmartHomeHub {
  notify(device: string, event: string, data: number): void;
}

class MotionSensor {
  constructor(private hub: SmartHomeHub) {}

  detect(): void {
    this.hub.notify("motion", "detected", 1);
  }
}

class TemperatureSensor {
  constructor(private hub: SmartHomeHub) {}

  setTemperature(temp: number): void {
    this.hub.notify("temperature", "reading", temp);
  }
}

class Light {
  on = false;
}

class AirConditioner {
  on = false;
}

class AlertSystem {
  alerts: string[] = [];
}

class SmartHomeMediator implements SmartHomeHub {
  public motion: MotionSensor;
  public temp: TemperatureSensor;
  public light: Light;
  public ac: AirConditioner;
  public alert: AlertSystem;

  constructor() {
    this.motion = new MotionSensor(this);
    this.temp = new TemperatureSensor(this);
    this.light = new Light();
    this.ac = new AirConditioner();
    this.alert = new AlertSystem();
  }

  notify(device: string, event: string, data: number): void {
    if (device === "motion" && event === "detected") {
      this.light.on = true;
      this.alert.alerts.push(`Motion detected at ${new Date().toISOString()}`);
    }
    if (device === "temperature" && event === "reading") {
      this.ac.on = data > 30;
    }
  }
}

function createSmartHome() {
  const hub = new SmartHomeMediator();
  return {
    motion: hub.motion,
    temp: hub.temp,
    light: hub.light,
    ac: hub.ac,
    alert: hub.alert,
    hub,
  };
}

function solution11(): void {
  console.log("\n=== Solution 11: Smart Home ===");
  const { motion, temp, light, ac, alert } = createSmartHome();

  motion.detect();
  console.assert(light.on === true, "Light should be on");
  console.assert(alert.alerts.length === 1, "Should have 1 alert");

  temp.setTemperature(35);
  console.assert(ac.on === true, "AC should be on");

  temp.setTemperature(25);
  console.assert(ac.on === false, "AC should be off");

  console.log("Exercise 11 passed!");
}

// ============================================================================
// SOLUTION 12 - IMPLEMENT: Wizard Form Mediator
// ============================================================================

interface WizardStep {
  name: string;
  validate(): boolean;
}

class WizardMediator {
  private steps: WizardStep[] = [];
  private currentIndex = 0;

  addStep(step: WizardStep): void {
    this.steps.push(step);
  }

  getCurrentStep(): string {
    return this.steps[this.currentIndex].name;
  }

  next(): boolean {
    if (this.currentIndex >= this.steps.length - 1) return false;
    if (!this.steps[this.currentIndex].validate()) return false;
    this.currentIndex++;
    return true;
  }

  previous(): boolean {
    if (this.currentIndex <= 0) return false;
    this.currentIndex--;
    return true;
  }

  canFinish(): boolean {
    return this.steps.every((step) => step.validate());
  }
}

function solution12(): void {
  console.log("\n=== Solution 12: Wizard Form ===");
  const wizard = new WizardMediator();
  let step1Valid = false;
  let step2Valid = false;

  wizard.addStep({ name: "Personal Info", validate: () => step1Valid });
  wizard.addStep({ name: "Address", validate: () => step2Valid });
  wizard.addStep({ name: "Confirm", validate: () => true });

  console.assert(wizard.getCurrentStep() === "Personal Info");
  console.assert(wizard.next() === false);
  console.assert(wizard.getCurrentStep() === "Personal Info");

  step1Valid = true;
  console.assert(wizard.next() === true);
  console.assert(wizard.getCurrentStep() === "Address");

  console.assert(wizard.next() === false);
  console.assert(wizard.previous() === true);
  console.assert(wizard.getCurrentStep() === "Personal Info");

  console.assert(wizard.next() === true);
  step2Valid = true;
  console.assert(wizard.next() === true);
  console.assert(wizard.getCurrentStep() === "Confirm");
  console.assert(wizard.previous() === true);
  console.assert(wizard.getCurrentStep() === "Address");

  console.log("Exercise 12 passed!");
}

// ============================================================================
// Runner
// ============================================================================

function main(): void {
  console.log("Mediator Pattern - Solutions Runner\n");
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
  console.log("\n=== All solutions completed! ===");
}

main();
