// ============================================================================
// Mediator Pattern - Exercises
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 12 exercises: 4 predict, 2 fix, 6 implement. No `any` types.
// Tests are commented out -- uncomment to verify solutions.
// ============================================================================

// ============================================================================
// EXERCISE 1 - PREDICT: Basic Mediator Notification
// ============================================================================
// What does this code output?

function exercise1_predict(): void {
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

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 2 - PREDICT: Component Communication via Mediator
// ============================================================================
// What does this code output?

function exercise2_predict(): void {
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

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 3 - PREDICT: Mediator with Event Filtering
// ============================================================================
// What does this code output?

function exercise3_predict(): void {
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

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 4 - PREDICT: Mediator Ordering
// ============================================================================
// What does this code output?

function exercise4_predict(): void {
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

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 5 - FIX: Broken Chat Mediator
// ============================================================================
// This chat room mediator has bugs. Users receive their own messages
// and the user list is never populated. Fix the bugs.

interface ChatMediatorBroken {
  register(user: ChatUserBroken): void;
  send(message: string, sender: ChatUserBroken): void;
}

class ChatUserBroken {
  public received: string[] = [];

  constructor(
    public name: string,
    private mediator: ChatMediatorBroken
  ) {
    // BUG: user never registers itself
  }

  send(message: string): void {
    this.mediator.send(message, this);
  }

  receive(message: string): void {
    this.received.push(message);
  }
}

class ChatRoomBroken implements ChatMediatorBroken {
  private users: ChatUserBroken[] = [];

  register(user: ChatUserBroken): void {
    this.users.push(user);
  }

  send(message: string, sender: ChatUserBroken): void {
    for (const user of this.users) {
      // BUG: sends to everyone including sender
      user.receive(`${sender.name}: ${message}`);
    }
  }
}

// TEST (uncomment to verify):
// function test_exercise5(): void {
//   const room = new ChatRoomBroken();
//   const alice = new ChatUserBroken("Alice", room);
//   const bob = new ChatUserBroken("Bob", room);
//   alice.send("Hello");
//   bob.send("Hi");
//   console.assert(
//     alice.received.length === 1 && alice.received[0] === "Bob: Hi",
//     `Alice should only receive Bob's message, got: ${JSON.stringify(alice.received)}`
//   );
//   console.assert(
//     bob.received.length === 1 && bob.received[0] === "Alice: Hello",
//     `Bob should only receive Alice's message, got: ${JSON.stringify(bob.received)}`
//   );
//   console.log("Exercise 5 passed!");
// }

// ============================================================================
// EXERCISE 6 - FIX: Broken Form Mediator
// ============================================================================
// The form mediator should enable the submit button only when both
// username and password fields are non-empty. It has bugs.

class FormField {
  value = "";
  private onChange: (() => void) | null = null;

  setOnChange(handler: () => void): void {
    this.onChange = handler;
  }

  setValue(v: string): void {
    this.value = v;
    // BUG: onChange is never called
  }
}

class SubmitButton {
  enabled = false;
}

class BrokenFormMediator {
  constructor(
    private username: FormField,
    private password: FormField,
    private submit: SubmitButton
  ) {
    // BUG: onChange handlers not wired up
  }

  validate(): void {
    // BUG: wrong condition -- should require BOTH non-empty
    this.submit.enabled = this.username.value.length > 0 || this.password.value.length > 0;
  }
}

// TEST (uncomment to verify):
// function test_exercise6(): void {
//   const username = new FormField();
//   const password = new FormField();
//   const submit = new SubmitButton();
//   const mediator = new BrokenFormMediator(username, password, submit);
//
//   username.setValue("alice");
//   console.assert(submit.enabled === false, "Should be false: password empty");
//
//   password.setValue("secret");
//   console.assert(submit.enabled === true, "Should be true: both filled");
//
//   username.setValue("");
//   console.assert(submit.enabled === false, "Should be false: username empty");
//
//   console.log("Exercise 6 passed!");
// }

// ============================================================================
// EXERCISE 7 - IMPLEMENT: Air Traffic Control Mediator
// ============================================================================
// Implement an ATC (Air Traffic Control) mediator that coordinates
// aircraft landing requests. Only one aircraft can use the runway at a time.

// TODO: Implement the following:
// interface ATCMediator {
//   requestLanding(aircraft: Aircraft): boolean;
//   notifyLanded(aircraft: Aircraft): void;
// }
//
// class Aircraft {
//   public landed = false;
//   constructor(public callsign: string, private atc: ATCMediator) {}
//   requestLanding(): boolean { ... notify ATC ... }
//   land(): void { ... mark landed, notify ATC ... }
// }
//
// class ControlTower implements ATCMediator {
//   private runwayFree = true;
//   requestLanding(aircraft: Aircraft): boolean { ... }
//   notifyLanded(aircraft: Aircraft): void { ... }
// }

// TEST (uncomment to verify):
// function test_exercise7(): void {
//   const tower = new ControlTower();
//   const flight1 = new Aircraft("FL100", tower);
//   const flight2 = new Aircraft("FL200", tower);
//
//   console.assert(flight1.requestLanding() === true, "FL100 should get permission");
//   console.assert(flight2.requestLanding() === false, "FL200 should be denied (runway busy)");
//   flight1.land();
//   console.assert(flight1.landed === true, "FL100 should be landed");
//   console.assert(flight2.requestLanding() === true, "FL200 should now get permission");
//   console.log("Exercise 7 passed!");
// }

// ============================================================================
// EXERCISE 8 - IMPLEMENT: Dialog Mediator
// ============================================================================
// Implement a dialog mediator that coordinates: a Checkbox, a TextInput,
// and a Label. When checkbox is checked, enable the text input and show
// the label. When unchecked, disable input and hide label.

// TODO: Implement DialogMediator, DialogCheckbox, DialogTextInput, DialogLabel
// interface DialogMediatorInterface {
//   notify(sender: string, event: string): void;
// }

// TEST (uncomment to verify):
// function test_exercise8(): void {
//   // After implementing, the test should verify:
//   // - checkbox.toggle() when unchecked -> checked: input.disabled=false, label.visible=true
//   // - checkbox.toggle() when checked -> unchecked: input.disabled=true, label.visible=false
//   const { checkbox, input, label, mediator } = createDialog();
//
//   console.assert(input.disabled === true, "Input should start disabled");
//   console.assert(label.visible === false, "Label should start hidden");
//
//   checkbox.toggle();
//   console.assert(checkbox.checked === true, "Checkbox should be checked");
//   console.assert(input.disabled === false, "Input should be enabled");
//   console.assert(label.visible === true, "Label should be visible");
//
//   checkbox.toggle();
//   console.assert(input.disabled === true, "Input should be disabled again");
//   console.assert(label.visible === false, "Label should be hidden again");
//
//   console.log("Exercise 8 passed!");
// }

// ============================================================================
// EXERCISE 9 - IMPLEMENT: Event Bus Mediator
// ============================================================================
// Implement a typed event bus that acts as a mediator.

// TODO: Implement TypedEventBus
// class TypedEventBus {
//   on<T>(event: string, handler: (data: T) => void): void { ... }
//   off<T>(event: string, handler: (data: T) => void): void { ... }
//   emit<T>(event: string, data: T): void { ... }
// }

// TEST (uncomment to verify):
// function test_exercise9(): void {
//   const bus = new TypedEventBus();
//   const received: string[] = [];
//
//   const handler1 = (data: string) => received.push(`h1:${data}`);
//   const handler2 = (data: string) => received.push(`h2:${data}`);
//
//   bus.on("msg", handler1);
//   bus.on("msg", handler2);
//   bus.emit("msg", "hello");
//
//   console.assert(received.length === 2, "Should have 2 entries");
//   console.assert(received[0] === "h1:hello");
//   console.assert(received[1] === "h2:hello");
//
//   bus.off("msg", handler1);
//   bus.emit("msg", "world");
//
//   console.assert(received.length === 3, "Should have 3 entries");
//   console.assert(received[2] === "h2:world");
//
//   console.log("Exercise 9 passed!");
// }

// ============================================================================
// EXERCISE 10 - IMPLEMENT: Middleware Mediator
// ============================================================================
// Implement a middleware pipeline mediator (like Express.js).

// TODO: Implement MiddlewarePipeline
// interface Context {
//   path: string;
//   body: string;
//   handled: boolean;
//   logs: string[];
// }
//
// type Middleware = (ctx: Context, next: () => void) => void;
//
// class MiddlewarePipeline {
//   use(middleware: Middleware): void { ... }
//   execute(ctx: Context): void { ... }
// }

// TEST (uncomment to verify):
// function test_exercise10(): void {
//   const pipeline = new MiddlewarePipeline();
//
//   pipeline.use((ctx, next) => {
//     ctx.logs.push("auth");
//     next();
//   });
//
//   pipeline.use((ctx, next) => {
//     ctx.logs.push("logging");
//     next();
//   });
//
//   pipeline.use((ctx, next) => {
//     ctx.logs.push("handler");
//     ctx.handled = true;
//     // intentionally not calling next()
//   });
//
//   pipeline.use((ctx, next) => {
//     ctx.logs.push("should-not-run");
//     next();
//   });
//
//   const ctx: Context = { path: "/test", body: "", handled: false, logs: [] };
//   pipeline.execute(ctx);
//
//   console.assert(
//     JSON.stringify(ctx.logs) === JSON.stringify(["auth", "logging", "handler"]),
//     `Expected [auth,logging,handler] but got ${JSON.stringify(ctx.logs)}`
//   );
//   console.assert(ctx.handled === true, "Should be handled");
//   console.log("Exercise 10 passed!");
// }

// ============================================================================
// EXERCISE 11 - IMPLEMENT: Smart Home Mediator
// ============================================================================
// Implement a smart home mediator that coordinates devices:
// - When motion sensor detects motion: turn on lights, send alert
// - When temperature sensor reads > 30: turn on AC
// - When temperature sensor reads <= 30: turn off AC

// TODO: Implement SmartHomeMediator and device classes
// interface SmartHomeHub {
//   notify(device: string, event: string, data: number): void;
// }
//
// class MotionSensor { ... }
// class TemperatureSensor { ... }
// class Light { on: boolean }
// class AirConditioner { on: boolean }
// class AlertSystem { alerts: string[] }

// TEST (uncomment to verify):
// function test_exercise11(): void {
//   const { motion, temp, light, ac, alert, hub } = createSmartHome();
//
//   motion.detect();
//   console.assert(light.on === true, "Light should be on");
//   console.assert(alert.alerts.length === 1, "Should have 1 alert");
//
//   temp.setTemperature(35);
//   console.assert(ac.on === true, "AC should be on");
//
//   temp.setTemperature(25);
//   console.assert(ac.on === false, "AC should be off");
//
//   console.log("Exercise 11 passed!");
// }

// ============================================================================
// EXERCISE 12 - IMPLEMENT: Wizard Form Mediator
// ============================================================================
// Implement a multi-step wizard form mediator. Steps can only proceed
// forward if validation passes, and can always go back.

// TODO: Implement WizardMediator
// interface WizardStep {
//   name: string;
//   validate(): boolean;
// }
//
// class WizardMediator {
//   private steps: WizardStep[] = [];
//   private currentIndex = 0;
//
//   addStep(step: WizardStep): void { ... }
//   getCurrentStep(): string { ... }
//   next(): boolean { ... validate current, advance if valid ... }
//   previous(): boolean { ... go back if possible ... }
//   canFinish(): boolean { ... all steps valid ... }
// }

// TEST (uncomment to verify):
// function test_exercise12(): void {
//   const wizard = new WizardMediator();
//   let step1Valid = false;
//   let step2Valid = false;
//
//   wizard.addStep({ name: "Personal Info", validate: () => step1Valid });
//   wizard.addStep({ name: "Address", validate: () => step2Valid });
//   wizard.addStep({ name: "Confirm", validate: () => true });
//
//   console.assert(wizard.getCurrentStep() === "Personal Info");
//   console.assert(wizard.next() === false, "Can't proceed: step1 invalid");
//   console.assert(wizard.getCurrentStep() === "Personal Info");
//
//   step1Valid = true;
//   console.assert(wizard.next() === true, "Should proceed to Address");
//   console.assert(wizard.getCurrentStep() === "Address");
//
//   console.assert(wizard.next() === false, "Can't proceed: step2 invalid");
//   console.assert(wizard.previous() === true, "Should go back");
//   console.assert(wizard.getCurrentStep() === "Personal Info");
//
//   console.assert(wizard.next() === true);
//   step2Valid = true;
//   console.assert(wizard.next() === true, "Should proceed to Confirm");
//   console.assert(wizard.getCurrentStep() === "Confirm");
//   console.assert(wizard.previous() === true);
//   console.assert(wizard.getCurrentStep() === "Address");
//
//   console.log("Exercise 12 passed!");
// }

// ============================================================================
// Run predict exercises to check output:
// exercise1_predict();
// exercise2_predict();
// exercise3_predict();
// exercise4_predict();
