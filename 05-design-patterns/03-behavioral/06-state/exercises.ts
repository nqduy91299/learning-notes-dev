// ============================================================================
// State Pattern - Exercises
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 12 exercises: 4 predict, 2 fix, 6 implement. No `any` types.
// Tests are commented out -- uncomment to verify solutions.
// ============================================================================

// ============================================================================
// EXERCISE 1 - PREDICT: Basic State Transitions
// ============================================================================
// What does this code output?

function exercise1_predict(): void {
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

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 2 - PREDICT: State with Rejected Transitions
// ============================================================================
// What does this code output?

function exercise2_predict(): void {
  interface DocState {
    publish(): string;
    getName(): string;
  }

  class Draft implements DocState {
    publish(): string {
      return "moved to moderation";
    }
    getName(): string {
      return "Draft";
    }
  }

  class Moderation implements DocState {
    publish(): string {
      return "moved to published";
    }
    getName(): string {
      return "Moderation";
    }
  }

  class Published implements DocState {
    publish(): string {
      return "already published";
    }
    getName(): string {
      return "Published";
    }
  }

  const states: DocState[] = [new Draft(), new Moderation(), new Published()];
  for (const state of states) {
    console.log(`${state.getName()}: ${state.publish()}`);
  }
}

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 3 - PREDICT: Context Delegation
// ============================================================================
// What does this code output?

function exercise3_predict(): void {
  interface PlayerState {
    play(): string;
    pause(): string;
    stop(): string;
  }

  const stopped: PlayerState = {
    play: () => "playing",
    pause: () => "can't pause, stopped",
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
    playing,
    paused,
    stopped,
    resuming: playing,
    "already playing": playing,
    "already paused": paused,
    "already stopped": stopped,
    "can't pause, stopped": stopped,
  };

  for (const action of actions) {
    const result = current[action]();
    console.log(`${action} -> ${result}`);
    current = stateMap[result] ?? current;
  }
}

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 4 - PREDICT: State History
// ============================================================================
// What does this code output?

function exercise4_predict(): void {
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
  console.log(sm.getCurrent());
  console.log(sm.undo());
  console.log(sm.getCurrent());
  console.log(sm.undo());
  console.log(sm.getCurrent());
  console.log(sm.undo());
  console.log(sm.getCurrent());
  console.log(sm.undo());
}

// YOUR PREDICTION:
// ???

// ============================================================================
// EXERCISE 5 - FIX: Broken Vending Machine State
// ============================================================================
// This vending machine has state bugs. Fix them.

interface VendingState {
  insertCoin(machine: VendingMachineBroken): void;
  selectProduct(machine: VendingMachineBroken): void;
  dispense(machine: VendingMachineBroken): void;
}

class VendingMachineBroken {
  state: VendingState;
  public log: string[] = [];

  constructor() {
    this.state = new IdleStateBroken(); // BUG: might be wrong initial state
  }

  setState(state: VendingState): void {
    this.state = state;
  }

  insertCoin(): void {
    this.state.insertCoin(this);
  }
  selectProduct(): void {
    this.state.selectProduct(this);
  }
  dispense(): void {
    this.state.dispense(this);
  }
}

class IdleStateBroken implements VendingState {
  insertCoin(machine: VendingMachineBroken): void {
    machine.log.push("coin inserted");
    machine.setState(new HasCoinStateBroken());
  }
  selectProduct(machine: VendingMachineBroken): void {
    machine.log.push("insert coin first");
  }
  dispense(machine: VendingMachineBroken): void {
    machine.log.push("insert coin first");
  }
}

class HasCoinStateBroken implements VendingState {
  insertCoin(machine: VendingMachineBroken): void {
    machine.log.push("coin already inserted");
  }
  selectProduct(machine: VendingMachineBroken): void {
    machine.log.push("product selected");
    // BUG: should transition to dispensing state
  }
  dispense(machine: VendingMachineBroken): void {
    machine.log.push("select product first");
  }
}

class DispensingStateBroken implements VendingState {
  insertCoin(machine: VendingMachineBroken): void {
    machine.log.push("please wait");
  }
  selectProduct(machine: VendingMachineBroken): void {
    machine.log.push("please wait");
  }
  dispense(machine: VendingMachineBroken): void {
    machine.log.push("dispensing product");
    // BUG: should transition back to idle state
  }
}

// TEST (uncomment to verify):
// function test_exercise5(): void {
//   const machine = new VendingMachineBroken();
//   machine.selectProduct(); // should say insert coin first
//   machine.insertCoin();    // coin inserted
//   machine.selectProduct(); // product selected -> dispensing
//   machine.dispense();      // dispensing product -> idle
//   machine.dispense();      // insert coin first (back to idle)
//
//   const expected = [
//     "insert coin first",
//     "coin inserted",
//     "product selected",
//     "dispensing product",
//     "insert coin first",
//   ];
//   console.assert(
//     JSON.stringify(machine.log) === JSON.stringify(expected),
//     `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(machine.log)}`
//   );
//   console.log("Exercise 5 passed!");
// }

// ============================================================================
// EXERCISE 6 - FIX: Broken Media Player State
// ============================================================================
// The media player state machine has transition bugs.

class MediaPlayer {
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
      // BUG: state not updated
      this.log.push("paused");
    } else {
      this.log.push("can't pause");
    }
  }

  stop(): void {
    if (this.state === "playing" || this.state === "paused") {
      // BUG: wrong state assignment
      this.state = "paused";
      this.log.push("stopped");
    } else {
      this.log.push("already stopped");
    }
  }
}

// TEST (uncomment to verify):
// function test_exercise6(): void {
//   const player = new MediaPlayer();
//   player.play();    // started playing
//   player.pause();   // paused
//   player.play();    // resumed playing
//   player.stop();    // stopped
//   player.play();    // started playing (from stopped)
//
//   const expected = [
//     "started playing",
//     "paused",
//     "resumed playing",
//     "stopped",
//     "started playing",
//   ];
//   console.assert(
//     JSON.stringify(player.log) === JSON.stringify(expected),
//     `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(player.log)}`
//   );
//   console.log("Exercise 6 passed!");
// }

// ============================================================================
// EXERCISE 7 - IMPLEMENT: Traffic Light State Pattern
// ============================================================================
// Implement a traffic light using the State pattern (not conditionals).

// TODO: Implement TrafficLightState interface and concrete states
// interface TrafficLightState {
//   next(light: TrafficLightContext): void;
//   getColor(): string;
// }
//
// class TrafficLightContext {
//   private state: TrafficLightState;
//   constructor(initial: TrafficLightState) { this.state = initial; }
//   setState(s: TrafficLightState): void { this.state = s; }
//   next(): void { this.state.next(this); }
//   getColor(): string { return this.state.getColor(); }
// }
//
// Cycle: Red -> Green -> Yellow -> Red -> ...

// TEST (uncomment to verify):
// function test_exercise7(): void {
//   const light = new TrafficLightContext(new RedLightState());
//   console.assert(light.getColor() === "RED");
//   light.next();
//   console.assert(light.getColor() === "GREEN");
//   light.next();
//   console.assert(light.getColor() === "YELLOW");
//   light.next();
//   console.assert(light.getColor() === "RED");
//   light.next();
//   console.assert(light.getColor() === "GREEN");
//   console.log("Exercise 7 passed!");
// }

// ============================================================================
// EXERCISE 8 - IMPLEMENT: Order Status State Machine
// ============================================================================
// Implement an order with states: Pending -> Paid -> Shipped -> Delivered.
// Also support cancellation from Pending or Paid states.

// TODO: Implement OrderState, OrderContext, and concrete states
// interface OrderState {
//   pay(order: OrderContext): void;
//   ship(order: OrderContext): void;
//   deliver(order: OrderContext): void;
//   cancel(order: OrderContext): void;
//   getName(): string;
// }

// TEST (uncomment to verify):
// function test_exercise8(): void {
//   const order = new OrderContext();
//   console.assert(order.getStatus() === "Pending");
//
//   order.ship(); // can't ship unpaid
//   console.assert(order.getStatus() === "Pending");
//
//   order.pay();
//   console.assert(order.getStatus() === "Paid");
//
//   order.ship();
//   console.assert(order.getStatus() === "Shipped");
//
//   order.cancel(); // can't cancel shipped
//   console.assert(order.getStatus() === "Shipped");
//
//   order.deliver();
//   console.assert(order.getStatus() === "Delivered");
//
//   // Test cancellation path
//   const order2 = new OrderContext();
//   order2.pay();
//   order2.cancel();
//   console.assert(order2.getStatus() === "Cancelled");
//
//   console.log("Exercise 8 passed!");
// }

// ============================================================================
// EXERCISE 9 - IMPLEMENT: Document Workflow with Role-based Transitions
// ============================================================================
// Implement a document workflow: Draft -> Review -> Approved -> Published.
// Only "reviewer" can approve, only "admin" can publish.

// TODO: Implement DocWorkflowState, DocumentWorkflow, and concrete states
// interface DocWorkflowState {
//   submit(doc: DocumentWorkflow): void;
//   approve(doc: DocumentWorkflow, role: string): void;
//   publish(doc: DocumentWorkflow, role: string): void;
//   reject(doc: DocumentWorkflow): void;
//   getName(): string;
// }

// TEST (uncomment to verify):
// function test_exercise9(): void {
//   const doc = new DocumentWorkflow();
//   console.assert(doc.getStatus() === "Draft");
//
//   doc.submit();
//   console.assert(doc.getStatus() === "Review");
//
//   doc.approve("editor"); // wrong role
//   console.assert(doc.getStatus() === "Review");
//
//   doc.approve("reviewer");
//   console.assert(doc.getStatus() === "Approved");
//
//   doc.publish("editor"); // wrong role
//   console.assert(doc.getStatus() === "Approved");
//
//   doc.publish("admin");
//   console.assert(doc.getStatus() === "Published");
//
//   // Test rejection
//   const doc2 = new DocumentWorkflow();
//   doc2.submit();
//   doc2.reject();
//   console.assert(doc2.getStatus() === "Draft");
//
//   console.log("Exercise 9 passed!");
// }

// ============================================================================
// EXERCISE 10 - IMPLEMENT: Phone State Machine
// ============================================================================
// Implement phone states: Locked, Home, App.
// - Locked: pressHome -> Home, pressApp -> Locked (no effect)
// - Home: pressHome -> Home (no effect), pressApp -> App, lock -> Locked
// - App: pressHome -> Home, pressApp -> App (no effect), lock -> Locked

// TODO: Implement PhoneState, PhoneContext, and concrete states

// TEST (uncomment to verify):
// function test_exercise10(): void {
//   const phone = new PhoneContext();
//   console.assert(phone.getScreen() === "Locked");
//
//   phone.pressApp();
//   console.assert(phone.getScreen() === "Locked"); // no effect when locked
//
//   phone.pressHome();
//   console.assert(phone.getScreen() === "Home");
//
//   phone.pressApp();
//   console.assert(phone.getScreen() === "App");
//
//   phone.pressHome();
//   console.assert(phone.getScreen() === "Home");
//
//   phone.lock();
//   console.assert(phone.getScreen() === "Locked");
//
//   console.log("Exercise 10 passed!");
// }

// ============================================================================
// EXERCISE 11 - IMPLEMENT: Connection State with Retry
// ============================================================================
// Implement a network connection with states: Disconnected, Connecting,
// Connected. Connecting can fail (retry up to 3 times) then go to Disconnected.

// TODO: Implement ConnectionState, Connection, and concrete states
// The connect() method on Connecting should simulate: pass a boolean
// `success` parameter. If false, increment retries. After 3 failures,
// go to Disconnected.

// TEST (uncomment to verify):
// function test_exercise11(): void {
//   const conn = new Connection();
//   console.assert(conn.getStatus() === "Disconnected");
//
//   conn.connect();
//   console.assert(conn.getStatus() === "Connecting");
//
//   conn.retry(false); // fail 1
//   console.assert(conn.getStatus() === "Connecting");
//
//   conn.retry(false); // fail 2
//   console.assert(conn.getStatus() === "Connecting");
//
//   conn.retry(false); // fail 3 -> disconnected
//   console.assert(conn.getStatus() === "Disconnected");
//
//   conn.connect();
//   conn.retry(true); // success
//   console.assert(conn.getStatus() === "Connected");
//
//   conn.disconnect();
//   console.assert(conn.getStatus() === "Disconnected");
//
//   console.log("Exercise 11 passed!");
// }

// ============================================================================
// EXERCISE 12 - IMPLEMENT: Turnstile State Machine
// ============================================================================
// Classic FSM example: Turnstile with states Locked and Unlocked.
// - Locked + coin -> Unlocked
// - Locked + push -> Locked (alarm)
// - Unlocked + coin -> Unlocked (refund)
// - Unlocked + push -> Locked (allow pass)

// TODO: Implement TurnstileState, Turnstile, LockedTurnstile, UnlockedTurnstile

// TEST (uncomment to verify):
// function test_exercise12(): void {
//   const turnstile = new Turnstile();
//   console.assert(turnstile.getState() === "Locked");
//
//   turnstile.push();
//   console.assert(turnstile.getState() === "Locked");
//   console.assert(turnstile.log[turnstile.log.length - 1] === "alarm");
//
//   turnstile.coin();
//   console.assert(turnstile.getState() === "Unlocked");
//
//   turnstile.coin();
//   console.assert(turnstile.getState() === "Unlocked");
//   console.assert(turnstile.log[turnstile.log.length - 1] === "refund");
//
//   turnstile.push();
//   console.assert(turnstile.getState() === "Locked");
//   console.assert(turnstile.log[turnstile.log.length - 1] === "pass");
//
//   console.log("Exercise 12 passed!");
// }

// ============================================================================
// Run predict exercises to check output:
// exercise1_predict();
// exercise2_predict();
// exercise3_predict();
// exercise4_predict();
