// ============================================================================
// State Pattern - Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

// ============================================================================
// SOLUTION 1 - PREDICT: Basic State Transitions
// ============================================================================
// Output:
// GREEN
// Green -> Yellow
// YELLOW
// Yellow -> Red
// RED
// Red -> Green
// GREEN

function solution1(): void {
  console.log("=== Solution 1: Traffic Light States ===");

  interface State {
    name: string;
    handle(context: { setState(s: State): void }): void;
  }

  class GreenState implements State {
    name = "GREEN";
    handle(context: { setState(s: State): void }): void {
      console.log("Green -> Yellow");
      context.setState(new YellowState());
    }
  }

  class YellowState implements State {
    name = "YELLOW";
    handle(context: { setState(s: State): void }): void {
      console.log("Yellow -> Red");
      context.setState(new RedState());
    }
  }

  class RedState implements State {
    name = "RED";
    handle(context: { setState(s: State): void }): void {
      console.log("Red -> Green");
      context.setState(new GreenState());
    }
  }

  class TrafficLight {
    private state: State;
    constructor(initial: State) {
      this.state = initial;
    }
    setState(s: State): void {
      this.state = s;
    }
    change(): void {
      this.state.handle(this);
    }
    getState(): string {
      return this.state.name;
    }
  }

  const light = new TrafficLight(new GreenState());
  console.log(light.getState());
  light.change();
  console.log(light.getState());
  light.change();
  console.log(light.getState());
  light.change();
  console.log(light.getState());
}

// ============================================================================
// SOLUTION 2 - PREDICT: State with Rejected Transitions
// ============================================================================
// Output:
// Draft: moved to moderation
// Moderation: moved to published
// Published: already published

function solution2(): void {
  console.log("\n=== Solution 2: Document States ===");

  interface DocState {
    publish(): string;
    getName(): string;
  }

  class Draft implements DocState {
    publish(): string { return "moved to moderation"; }
    getName(): string { return "Draft"; }
  }

  class Moderation implements DocState {
    publish(): string { return "moved to published"; }
    getName(): string { return "Moderation"; }
  }

  class Published implements DocState {
    publish(): string { return "already published"; }
    getName(): string { return "Published"; }
  }

  const states: DocState[] = [new Draft(), new Moderation(), new Published()];
  for (const state of states) {
    console.log(`${state.getName()}: ${state.publish()}`);
  }
}

// ============================================================================
// SOLUTION 3 - PREDICT: Context Delegation
// ============================================================================
// Output:
// play -> playing
// play -> already playing
// pause -> paused
// stop -> stopped
// pause -> can't pause

function solution3(): void {
  console.log("\n=== Solution 3: Player States ===");

  interface PlayerState {
    play(): string;
    pause(): string;
    stop(): string;
  }

  const stopped: PlayerState = {
    play: () => "playing",
    pause: () => "can't pause",
    stop: () => "already stopped",
  };

  const playing: PlayerState = {
    play: () => "already playing",
    pause: () => "paused",
    stop: () => "stopped",
  };

  const paused: PlayerState = {
    play: () => "resuming",
    pause: () => "already paused",
    stop: () => "stopped",
  };

  let current: PlayerState = stopped;
  const actions = ["play", "play", "pause", "stop", "pause"] as const;
  const stateMap: Record<string, PlayerState> = {
    playing, paused, stopped,
    resuming: playing,
    "already playing": playing,
    "already paused": paused,
    "already stopped": stopped,
    "can't pause": stopped,
  };

  for (const action of actions) {
    const result = current[action]();
    console.log(`${action} -> ${result}`);
    current = stateMap[result] ?? current;
  }
}

// ============================================================================
// SOLUTION 4 - PREDICT: State History
// ============================================================================
// Output:
// D
// true
// C
// true
// B
// true
// A
// false

function solution4(): void {
  console.log("\n=== Solution 4: State History ===");

  class StateMachine {
    private current = "A";
    private history: string[] = [];

    transition(to: string): void {
      this.history.push(this.current);
      this.current = to;
    }

    undo(): boolean {
      const prev = this.history.pop();
      if (prev !== undefined) {
        this.current = prev;
        return true;
      }
      return false;
    }

    getCurrent(): string {
      return this.current;
    }
  }

  const sm = new StateMachine();
  sm.transition("B");
  sm.transition("C");
  sm.transition("D");
  console.log(sm.getCurrent()); // D
  console.log(sm.undo());       // true
  console.log(sm.getCurrent()); // C
  console.log(sm.undo());       // true
  console.log(sm.getCurrent()); // B
  console.log(sm.undo());       // true
  console.log(sm.getCurrent()); // A
  console.log(sm.undo());       // false
}

// ============================================================================
// SOLUTION 5 - FIX: Vending Machine
// ============================================================================

interface FixedVendingState {
  insertCoin(machine: FixedVendingMachine): void;
  selectProduct(machine: FixedVendingMachine): void;
  dispense(machine: FixedVendingMachine): void;
}

class FixedVendingMachine {
  state: FixedVendingState;
  public log: string[] = [];

  constructor() {
    this.state = new FixedIdleState();
  }

  setState(state: FixedVendingState): void {
    this.state = state;
  }

  insertCoin(): void { this.state.insertCoin(this); }
  selectProduct(): void { this.state.selectProduct(this); }
  dispense(): void { this.state.dispense(this); }
}

class FixedIdleState implements FixedVendingState {
  insertCoin(machine: FixedVendingMachine): void {
    machine.log.push("coin inserted");
    machine.setState(new FixedHasCoinState());
  }
  selectProduct(machine: FixedVendingMachine): void {
    machine.log.push("insert coin first");
  }
  dispense(machine: FixedVendingMachine): void {
    machine.log.push("insert coin first");
  }
}

class FixedHasCoinState implements FixedVendingState {
  insertCoin(machine: FixedVendingMachine): void {
    machine.log.push("coin already inserted");
  }
  selectProduct(machine: FixedVendingMachine): void {
    machine.log.push("product selected");
    machine.setState(new FixedDispensingState()); // FIX: transition to dispensing
  }
  dispense(machine: FixedVendingMachine): void {
    machine.log.push("select product first");
  }
}

class FixedDispensingState implements FixedVendingState {
  insertCoin(machine: FixedVendingMachine): void {
    machine.log.push("please wait");
  }
  selectProduct(machine: FixedVendingMachine): void {
    machine.log.push("please wait");
  }
  dispense(machine: FixedVendingMachine): void {
    machine.log.push("dispensing product");
    machine.setState(new FixedIdleState()); // FIX: transition back to idle
  }
}

function solution5(): void {
  console.log("\n=== Solution 5: Fixed Vending Machine ===");
  const machine = new FixedVendingMachine();
  machine.selectProduct();
  machine.insertCoin();
  machine.selectProduct();
  machine.dispense();
  machine.dispense();

  const expected = [
    "insert coin first",
    "coin inserted",
    "product selected",
    "dispensing product",
    "insert coin first",
  ];
  console.assert(
    JSON.stringify(machine.log) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(machine.log)}`
  );
  console.log("Exercise 5 passed!");
}

// ============================================================================
// SOLUTION 6 - FIX: Media Player
// ============================================================================

class FixedMediaPlayer {
  private state: "stopped" | "playing" | "paused" = "stopped";
  public log: string[] = [];

  play(): void {
    if (this.state === "stopped") {
      this.state = "playing";
      this.log.push("started playing");
    } else if (this.state === "paused") {
      this.state = "playing";
      this.log.push("resumed playing");
    } else {
      this.log.push("already playing");
    }
  }

  pause(): void {
    if (this.state === "playing") {
      this.state = "paused"; // FIX: update state
      this.log.push("paused");
    } else {
      this.log.push("can't pause");
    }
  }

  stop(): void {
    if (this.state === "playing" || this.state === "paused") {
      this.state = "stopped"; // FIX: correct state
      this.log.push("stopped");
    } else {
      this.log.push("already stopped");
    }
  }
}

function solution6(): void {
  console.log("\n=== Solution 6: Fixed Media Player ===");
  const player = new FixedMediaPlayer();
  player.play();
  player.pause();
  player.play();
  player.stop();
  player.play();

  const expected = [
    "started playing",
    "paused",
    "resumed playing",
    "stopped",
    "started playing",
  ];
  console.assert(
    JSON.stringify(player.log) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(player.log)}`
  );
  console.log("Exercise 6 passed!");
}

// ============================================================================
// SOLUTION 7 - IMPLEMENT: Traffic Light
// ============================================================================

interface TrafficLightState {
  next(light: TrafficLightContext): void;
  getColor(): string;
}

class TrafficLightContext {
  private state: TrafficLightState;
  constructor(initial: TrafficLightState) {
    this.state = initial;
  }
  setState(s: TrafficLightState): void {
    this.state = s;
  }
  next(): void {
    this.state.next(this);
  }
  getColor(): string {
    return this.state.getColor();
  }
}

class RedLightState implements TrafficLightState {
  next(light: TrafficLightContext): void {
    light.setState(new GreenLightState());
  }
  getColor(): string {
    return "RED";
  }
}

class GreenLightState implements TrafficLightState {
  next(light: TrafficLightContext): void {
    light.setState(new YellowLightState());
  }
  getColor(): string {
    return "GREEN";
  }
}

class YellowLightState implements TrafficLightState {
  next(light: TrafficLightContext): void {
    light.setState(new RedLightState());
  }
  getColor(): string {
    return "YELLOW";
  }
}

function solution7(): void {
  console.log("\n=== Solution 7: Traffic Light ===");
  const light = new TrafficLightContext(new RedLightState());
  console.assert(light.getColor() === "RED");
  light.next();
  console.assert(light.getColor() === "GREEN");
  light.next();
  console.assert(light.getColor() === "YELLOW");
  light.next();
  console.assert(light.getColor() === "RED");
  light.next();
  console.assert(light.getColor() === "GREEN");
  console.log("Exercise 7 passed!");
}

// ============================================================================
// SOLUTION 8 - IMPLEMENT: Order Status
// ============================================================================

interface OrderState {
  pay(order: OrderContext): void;
  ship(order: OrderContext): void;
  deliver(order: OrderContext): void;
  cancel(order: OrderContext): void;
  getName(): string;
}

class OrderContext {
  private state: OrderState;

  constructor() {
    this.state = new PendingState();
  }

  setState(s: OrderState): void {
    this.state = s;
  }

  getStatus(): string {
    return this.state.getName();
  }

  pay(): void { this.state.pay(this); }
  ship(): void { this.state.ship(this); }
  deliver(): void { this.state.deliver(this); }
  cancel(): void { this.state.cancel(this); }
}

class PendingState implements OrderState {
  pay(order: OrderContext): void { order.setState(new PaidState()); }
  ship(_order: OrderContext): void { /* can't ship unpaid */ }
  deliver(_order: OrderContext): void { /* invalid */ }
  cancel(order: OrderContext): void { order.setState(new CancelledState()); }
  getName(): string { return "Pending"; }
}

class PaidState implements OrderState {
  pay(_order: OrderContext): void { /* already paid */ }
  ship(order: OrderContext): void { order.setState(new ShippedState()); }
  deliver(_order: OrderContext): void { /* must ship first */ }
  cancel(order: OrderContext): void { order.setState(new CancelledState()); }
  getName(): string { return "Paid"; }
}

class ShippedState implements OrderState {
  pay(_order: OrderContext): void { /* already paid */ }
  ship(_order: OrderContext): void { /* already shipped */ }
  deliver(order: OrderContext): void { order.setState(new DeliveredState()); }
  cancel(_order: OrderContext): void { /* can't cancel shipped */ }
  getName(): string { return "Shipped"; }
}

class DeliveredState implements OrderState {
  pay(_order: OrderContext): void { /* done */ }
  ship(_order: OrderContext): void { /* done */ }
  deliver(_order: OrderContext): void { /* done */ }
  cancel(_order: OrderContext): void { /* done */ }
  getName(): string { return "Delivered"; }
}

class CancelledState implements OrderState {
  pay(_order: OrderContext): void { /* cancelled */ }
  ship(_order: OrderContext): void { /* cancelled */ }
  deliver(_order: OrderContext): void { /* cancelled */ }
  cancel(_order: OrderContext): void { /* cancelled */ }
  getName(): string { return "Cancelled"; }
}

function solution8(): void {
  console.log("\n=== Solution 8: Order Status ===");
  const order = new OrderContext();
  console.assert(order.getStatus() === "Pending");
  order.ship();
  console.assert(order.getStatus() === "Pending");
  order.pay();
  console.assert(order.getStatus() === "Paid");
  order.ship();
  console.assert(order.getStatus() === "Shipped");
  order.cancel();
  console.assert(order.getStatus() === "Shipped");
  order.deliver();
  console.assert(order.getStatus() === "Delivered");

  const order2 = new OrderContext();
  order2.pay();
  order2.cancel();
  console.assert(order2.getStatus() === "Cancelled");
  console.log("Exercise 8 passed!");
}

// ============================================================================
// SOLUTION 9 - IMPLEMENT: Document Workflow
// ============================================================================

interface DocWorkflowState {
  submit(doc: DocumentWorkflow): void;
  approve(doc: DocumentWorkflow, role: string): void;
  publish(doc: DocumentWorkflow, role: string): void;
  reject(doc: DocumentWorkflow): void;
  getName(): string;
}

class DocumentWorkflow {
  private state: DocWorkflowState;

  constructor() {
    this.state = new DraftDocState();
  }

  setState(s: DocWorkflowState): void {
    this.state = s;
  }

  getStatus(): string {
    return this.state.getName();
  }

  submit(): void { this.state.submit(this); }
  approve(role: string): void { this.state.approve(this, role); }
  publish(role: string): void { this.state.publish(this, role); }
  reject(): void { this.state.reject(this); }
}

class DraftDocState implements DocWorkflowState {
  submit(doc: DocumentWorkflow): void { doc.setState(new ReviewDocState()); }
  approve(_doc: DocumentWorkflow, _role: string): void { /* must submit first */ }
  publish(_doc: DocumentWorkflow, _role: string): void { /* must submit first */ }
  reject(_doc: DocumentWorkflow): void { /* already draft */ }
  getName(): string { return "Draft"; }
}

class ReviewDocState implements DocWorkflowState {
  submit(_doc: DocumentWorkflow): void { /* already in review */ }
  approve(doc: DocumentWorkflow, role: string): void {
    if (role === "reviewer") {
      doc.setState(new ApprovedDocState());
    }
  }
  publish(_doc: DocumentWorkflow, _role: string): void { /* must approve first */ }
  reject(doc: DocumentWorkflow): void { doc.setState(new DraftDocState()); }
  getName(): string { return "Review"; }
}

class ApprovedDocState implements DocWorkflowState {
  submit(_doc: DocumentWorkflow): void { /* already approved */ }
  approve(_doc: DocumentWorkflow, _role: string): void { /* already approved */ }
  publish(doc: DocumentWorkflow, role: string): void {
    if (role === "admin") {
      doc.setState(new PublishedDocState());
    }
  }
  reject(doc: DocumentWorkflow): void { doc.setState(new DraftDocState()); }
  getName(): string { return "Approved"; }
}

class PublishedDocState implements DocWorkflowState {
  submit(_doc: DocumentWorkflow): void { /* published */ }
  approve(_doc: DocumentWorkflow, _role: string): void { /* published */ }
  publish(_doc: DocumentWorkflow, _role: string): void { /* published */ }
  reject(_doc: DocumentWorkflow): void { /* published */ }
  getName(): string { return "Published"; }
}

function solution9(): void {
  console.log("\n=== Solution 9: Document Workflow ===");
  const doc = new DocumentWorkflow();
  console.assert(doc.getStatus() === "Draft");
  doc.submit();
  console.assert(doc.getStatus() === "Review");
  doc.approve("editor");
  console.assert(doc.getStatus() === "Review");
  doc.approve("reviewer");
  console.assert(doc.getStatus() === "Approved");
  doc.publish("editor");
  console.assert(doc.getStatus() === "Approved");
  doc.publish("admin");
  console.assert(doc.getStatus() === "Published");

  const doc2 = new DocumentWorkflow();
  doc2.submit();
  doc2.reject();
  console.assert(doc2.getStatus() === "Draft");
  console.log("Exercise 9 passed!");
}

// ============================================================================
// SOLUTION 10 - IMPLEMENT: Phone State Machine
// ============================================================================

interface PhoneState {
  pressHome(phone: PhoneContext): void;
  pressApp(phone: PhoneContext): void;
  lock(phone: PhoneContext): void;
  getScreen(): string;
}

class PhoneContext {
  private state: PhoneState;

  constructor() {
    this.state = new LockedPhoneState();
  }

  setState(s: PhoneState): void {
    this.state = s;
  }

  getScreen(): string {
    return this.state.getScreen();
  }

  pressHome(): void { this.state.pressHome(this); }
  pressApp(): void { this.state.pressApp(this); }
  lock(): void { this.state.lock(this); }
}

class LockedPhoneState implements PhoneState {
  pressHome(phone: PhoneContext): void { phone.setState(new HomePhoneState()); }
  pressApp(_phone: PhoneContext): void { /* locked, no effect */ }
  lock(_phone: PhoneContext): void { /* already locked */ }
  getScreen(): string { return "Locked"; }
}

class HomePhoneState implements PhoneState {
  pressHome(_phone: PhoneContext): void { /* already home */ }
  pressApp(phone: PhoneContext): void { phone.setState(new AppPhoneState()); }
  lock(phone: PhoneContext): void { phone.setState(new LockedPhoneState()); }
  getScreen(): string { return "Home"; }
}

class AppPhoneState implements PhoneState {
  pressHome(phone: PhoneContext): void { phone.setState(new HomePhoneState()); }
  pressApp(_phone: PhoneContext): void { /* already in app */ }
  lock(phone: PhoneContext): void { phone.setState(new LockedPhoneState()); }
  getScreen(): string { return "App"; }
}

function solution10(): void {
  console.log("\n=== Solution 10: Phone State ===");
  const phone = new PhoneContext();
  console.assert(phone.getScreen() === "Locked");
  phone.pressApp();
  console.assert(phone.getScreen() === "Locked");
  phone.pressHome();
  console.assert(phone.getScreen() === "Home");
  phone.pressApp();
  console.assert(phone.getScreen() === "App");
  phone.pressHome();
  console.assert(phone.getScreen() === "Home");
  phone.lock();
  console.assert(phone.getScreen() === "Locked");
  console.log("Exercise 10 passed!");
}

// ============================================================================
// SOLUTION 11 - IMPLEMENT: Connection with Retry
// ============================================================================

interface ConnectionState {
  connect(conn: Connection): void;
  retry(conn: Connection, success: boolean): void;
  disconnect(conn: Connection): void;
  getStatus(): string;
}

class Connection {
  private state: ConnectionState;

  constructor() {
    this.state = new DisconnectedConnState();
  }

  setState(s: ConnectionState): void {
    this.state = s;
  }

  getStatus(): string {
    return this.state.getStatus();
  }

  connect(): void { this.state.connect(this); }
  retry(success: boolean): void { this.state.retry(this, success); }
  disconnect(): void { this.state.disconnect(this); }
}

class DisconnectedConnState implements ConnectionState {
  connect(conn: Connection): void { conn.setState(new ConnectingConnState()); }
  retry(_conn: Connection, _success: boolean): void { /* not connecting */ }
  disconnect(_conn: Connection): void { /* already disconnected */ }
  getStatus(): string { return "Disconnected"; }
}

class ConnectingConnState implements ConnectionState {
  private retries = 0;

  connect(_conn: Connection): void { /* already connecting */ }

  retry(conn: Connection, success: boolean): void {
    if (success) {
      conn.setState(new ConnectedConnState());
    } else {
      this.retries++;
      if (this.retries >= 3) {
        conn.setState(new DisconnectedConnState());
      }
    }
  }

  disconnect(conn: Connection): void { conn.setState(new DisconnectedConnState()); }
  getStatus(): string { return "Connecting"; }
}

class ConnectedConnState implements ConnectionState {
  connect(_conn: Connection): void { /* already connected */ }
  retry(_conn: Connection, _success: boolean): void { /* already connected */ }
  disconnect(conn: Connection): void { conn.setState(new DisconnectedConnState()); }
  getStatus(): string { return "Connected"; }
}

function solution11(): void {
  console.log("\n=== Solution 11: Connection Retry ===");
  const conn = new Connection();
  console.assert(conn.getStatus() === "Disconnected");
  conn.connect();
  console.assert(conn.getStatus() === "Connecting");
  conn.retry(false);
  console.assert(conn.getStatus() === "Connecting");
  conn.retry(false);
  console.assert(conn.getStatus() === "Connecting");
  conn.retry(false);
  console.assert(conn.getStatus() === "Disconnected");
  conn.connect();
  conn.retry(true);
  console.assert(conn.getStatus() === "Connected");
  conn.disconnect();
  console.assert(conn.getStatus() === "Disconnected");
  console.log("Exercise 11 passed!");
}

// ============================================================================
// SOLUTION 12 - IMPLEMENT: Turnstile
// ============================================================================

interface TurnstileState {
  coin(turnstile: Turnstile): void;
  push(turnstile: Turnstile): void;
  getName(): string;
}

class Turnstile {
  private state: TurnstileState;
  public log: string[] = [];

  constructor() {
    this.state = new LockedTurnstileState();
  }

  setState(s: TurnstileState): void {
    this.state = s;
  }

  getState(): string {
    return this.state.getName();
  }

  coin(): void { this.state.coin(this); }
  push(): void { this.state.push(this); }
}

class LockedTurnstileState implements TurnstileState {
  coin(turnstile: Turnstile): void {
    turnstile.log.push("unlock");
    turnstile.setState(new UnlockedTurnstileState());
  }

  push(turnstile: Turnstile): void {
    turnstile.log.push("alarm");
  }

  getName(): string { return "Locked"; }
}

class UnlockedTurnstileState implements TurnstileState {
  coin(turnstile: Turnstile): void {
    turnstile.log.push("refund");
  }

  push(turnstile: Turnstile): void {
    turnstile.log.push("pass");
    turnstile.setState(new LockedTurnstileState());
  }

  getName(): string { return "Unlocked"; }
}

function solution12(): void {
  console.log("\n=== Solution 12: Turnstile ===");
  const turnstile = new Turnstile();
  console.assert(turnstile.getState() === "Locked");

  turnstile.push();
  console.assert(turnstile.getState() === "Locked");
  console.assert(turnstile.log[turnstile.log.length - 1] === "alarm");

  turnstile.coin();
  console.assert(turnstile.getState() === "Unlocked");

  turnstile.coin();
  console.assert(turnstile.getState() === "Unlocked");
  console.assert(turnstile.log[turnstile.log.length - 1] === "refund");

  turnstile.push();
  console.assert(turnstile.getState() === "Locked");
  console.assert(turnstile.log[turnstile.log.length - 1] === "pass");

  console.log("Exercise 12 passed!");
}

// ============================================================================
// Runner
// ============================================================================

function main(): void {
  console.log("State Pattern - Solutions Runner\n");
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
