// ============================================================================
// Command Pattern - Exercises
// ============================================================================
// 15 exercises: 5 predict output, 3 fix bugs, 7 implement
// Config: ES2022, strict, ESNext modules. Run with: npx tsx exercises.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Shared infrastructure
// ---------------------------------------------------------------------------

interface Command {
  execute(): void;
  undo(): void;
}

// ============================================================================
// EXERCISE 1 - Predict Output
// ============================================================================
// What does the following code print?

function exercise1(): void {
  class Light {
    private on = false;
    turnOn(): void {
      this.on = true;
      console.log("Light ON");
    }
    turnOff(): void {
      this.on = false;
      console.log("Light OFF");
    }
    isOn(): boolean {
      return this.on;
    }
  }

  class ToggleLightCommand implements Command {
    private wasOn = false;
    constructor(private light: Light) {}
    execute(): void {
      this.wasOn = this.light.isOn();
      if (this.wasOn) this.light.turnOff();
      else this.light.turnOn();
    }
    undo(): void {
      if (this.wasOn) this.light.turnOn();
      else this.light.turnOff();
    }
  }

  const light = new Light();
  const cmd = new ToggleLightCommand(light);
  cmd.execute();
  cmd.execute();
  cmd.undo();
  console.log(`Final: ${light.isOn()}`);
}

// Prediction:
// Light ON
// Light OFF
// Light ON
// Final: true
//
// Why: First execute toggles OFF->ON (wasOn=false). Second execute toggles
// ON->OFF (wasOn=true). Undo restores wasOn=true state, so turnOn().

// exercise1();

// ============================================================================
// EXERCISE 2 - Predict Output
// ============================================================================

function exercise2(): void {
  const log: string[] = [];

  class Receiver {
    action(name: string): void {
      log.push(name);
    }
  }

  class SimpleCommand implements Command {
    constructor(private receiver: Receiver, private name: string) {}
    execute(): void {
      this.receiver.action(this.name);
    }
    undo(): void {
      log.push(`undo-${this.name}`);
    }
  }

  class MacroCommand implements Command {
    constructor(private commands: Command[]) {}
    execute(): void {
      for (const cmd of this.commands) cmd.execute();
    }
    undo(): void {
      for (const cmd of [...this.commands].reverse()) cmd.undo();
    }
  }

  const r = new Receiver();
  const macro = new MacroCommand([
    new SimpleCommand(r, "A"),
    new SimpleCommand(r, "B"),
    new SimpleCommand(r, "C"),
  ]);

  macro.execute();
  macro.undo();
  console.log(log.join(","));
}

// Prediction:
// A,B,C,undo-C,undo-B,undo-A
//
// Why: execute runs A,B,C in order. undo reverses the array and calls undo
// on each: C, B, A.

// exercise2();

// ============================================================================
// EXERCISE 3 - Predict Output
// ============================================================================

function exercise3(): void {
  class Counter {
    value = 0;
  }

  class IncrementCommand implements Command {
    private prevValue = 0;
    constructor(private counter: Counter, private amount: number) {}
    execute(): void {
      this.prevValue = this.counter.value;
      this.counter.value += this.amount;
    }
    undo(): void {
      this.counter.value = this.prevValue;
    }
  }

  const counter = new Counter();
  const history: Command[] = [];

  const cmd1 = new IncrementCommand(counter, 5);
  cmd1.execute();
  history.push(cmd1);

  const cmd2 = new IncrementCommand(counter, 3);
  cmd2.execute();
  history.push(cmd2);

  // Undo last
  history.pop()!.undo();
  console.log(counter.value);

  // Undo again
  history.pop()!.undo();
  console.log(counter.value);
}

// Prediction:
// 5
// 0
//
// Why: After cmd1 value=5, after cmd2 value=8. Undo cmd2 restores to 5.
// Undo cmd1 restores to 0.

// exercise3();

// ============================================================================
// EXERCISE 4 - Predict Output
// ============================================================================

function exercise4(): void {
  class TextBuffer {
    content = "";
    append(text: string): void {
      this.content += text;
    }
    removeLast(n: number): void {
      this.content = this.content.slice(0, -n);
    }
  }

  class AppendCommand implements Command {
    constructor(private buffer: TextBuffer, private text: string) {}
    execute(): void {
      this.buffer.append(this.text);
    }
    undo(): void {
      this.buffer.removeLast(this.text.length);
    }
  }

  const buf = new TextBuffer();
  const cmds: Command[] = [];

  const c1 = new AppendCommand(buf, "Hello");
  c1.execute();
  cmds.push(c1);

  const c2 = new AppendCommand(buf, " World");
  c2.execute();
  cmds.push(c2);

  cmds.pop()!.undo();
  const c3 = new AppendCommand(buf, " TypeScript");
  c3.execute();
  cmds.push(c3);

  console.log(buf.content);
  console.log(cmds.length);
}

// Prediction:
// Hello TypeScript
// 2
//
// Why: After c1 "Hello", after c2 "Hello World". Undo c2 -> "Hello".
// c3 appends " TypeScript" -> "Hello TypeScript". cmds has [c1, c3] = length 2.

// exercise4();

// ============================================================================
// EXERCISE 5 - Predict Output
// ============================================================================

function exercise5(): void {
  class CommandQueue {
    private queue: Command[] = [];
    private log: string[] = [];

    enqueue(cmd: Command): void {
      this.queue.push(cmd);
    }

    processAll(): void {
      while (this.queue.length > 0) {
        this.queue.shift()!.execute();
      }
    }

    getLog(): string[] {
      return this.log;
    }

    addLog(entry: string): void {
      this.log.push(entry);
    }
  }

  class LogCommand implements Command {
    constructor(private queue: CommandQueue, private msg: string) {}
    execute(): void {
      this.queue.addLog(this.msg);
    }
    undo(): void {
      /* no-op */
    }
  }

  const q = new CommandQueue();
  q.enqueue(new LogCommand(q, "first"));
  q.enqueue(new LogCommand(q, "second"));
  q.enqueue(new LogCommand(q, "third"));

  q.processAll();
  q.enqueue(new LogCommand(q, "fourth"));
  q.processAll();

  console.log(q.getLog().join(","));
}

// Prediction:
// first,second,third,fourth
//
// Why: First processAll processes 3 items. Then "fourth" enqueued, second
// processAll processes 1 item.

// exercise5();

// ============================================================================
// EXERCISE 6 - Fix the Bug
// ============================================================================
// The undo/redo system doesn't work correctly. Redo should re-execute
// the last undone command, but it doesn't.

function exercise6(): void {
  class Calculator {
    value = 0;
  }

  class AddCommand implements Command {
    private prev = 0;
    constructor(private calc: Calculator, private amount: number) {}
    execute(): void {
      this.prev = this.calc.value;
      this.calc.value += this.amount;
    }
    undo(): void {
      this.calc.value = this.prev;
    }
  }

  class CommandHistory {
    private history: Command[] = [];
    private redoStack: Command[] = [];

    executeCommand(cmd: Command): void {
      cmd.execute();
      this.history.push(cmd);
      // BUG: redo stack is not cleared when a new command is executed
    }

    undo(): void {
      const cmd = this.history.pop();
      if (cmd) {
        cmd.undo();
        // BUG: undone command is not pushed to redo stack
      }
    }

    redo(): void {
      const cmd = this.redoStack.pop();
      if (cmd) {
        cmd.execute();
        this.history.push(cmd);
      }
    }

    getHistorySize(): number {
      return this.history.length;
    }

    getRedoSize(): number {
      return this.redoStack.length;
    }
  }

  const calc = new Calculator();
  const mgr = new CommandHistory();

  mgr.executeCommand(new AddCommand(calc, 10));
  mgr.executeCommand(new AddCommand(calc, 20));
  console.log(`Value: ${calc.value}`);

  mgr.undo();
  console.log(`After undo: ${calc.value}`);
  console.log(`Redo stack size: ${mgr.getRedoSize()}`);

  mgr.redo();
  console.log(`After redo: ${calc.value}`);
}

// Expected output:
// Value: 30
// After undo: 10
// Redo stack size: 1
// After redo: 30
//
// Fix: In executeCommand, add: this.redoStack.length = 0;
// Fix: In undo, add: this.redoStack.push(cmd);

// exercise6();

// ============================================================================
// EXERCISE 7 - Fix the Bug
// ============================================================================
// The MacroCommand undo executes in the wrong order - it should undo
// in reverse order of execution.

function exercise7(): void {
  const output: string[] = [];

  class PrintCommand implements Command {
    constructor(private msg: string) {}
    execute(): void {
      output.push(`do:${this.msg}`);
    }
    undo(): void {
      output.push(`undo:${this.msg}`);
    }
  }

  class BrokenMacroCommand implements Command {
    private commands: Command[] = [];

    add(cmd: Command): void {
      this.commands.push(cmd);
    }

    execute(): void {
      for (const cmd of this.commands) {
        cmd.execute();
      }
    }

    undo(): void {
      // BUG: undoing in the same order as execution
      for (const cmd of this.commands) {
        cmd.undo();
      }
    }
  }

  const macro = new BrokenMacroCommand();
  macro.add(new PrintCommand("A"));
  macro.add(new PrintCommand("B"));
  macro.add(new PrintCommand("C"));

  macro.execute();
  macro.undo();
  console.log(output.join(","));
}

// Expected: do:A,do:B,do:C,undo:C,undo:B,undo:A
// Actual:   do:A,do:B,do:C,undo:A,undo:B,undo:C
//
// Fix: In undo(), iterate [...this.commands].reverse()

// exercise7();

// ============================================================================
// EXERCISE 8 - Fix the Bug
// ============================================================================
// The command is supposed to store the previous state for undo, but the
// snapshot is taken at the wrong time.

function exercise8(): void {
  class Document {
    title = "Untitled";
  }

  class RenameCommand implements Command {
    private previousTitle = "";

    constructor(private doc: Document, private newTitle: string) {}

    execute(): void {
      this.doc.title = this.newTitle;
      // BUG: snapshot taken AFTER mutation - should be BEFORE
      this.previousTitle = this.doc.title;
    }

    undo(): void {
      this.doc.title = this.previousTitle;
    }
  }

  const doc = new Document();
  const cmd = new RenameCommand(doc, "My Document");
  cmd.execute();
  console.log(`Title: ${doc.title}`);

  cmd.undo();
  console.log(`After undo: ${doc.title}`);
}

// Expected:
// Title: My Document
// After undo: Untitled
//
// Actual (buggy):
// Title: My Document
// After undo: My Document
//
// Fix: Swap the two lines in execute() - save previousTitle BEFORE mutating.

// exercise8();

// ============================================================================
// EXERCISE 9 - Implement
// ============================================================================
// Implement a StringReverseCommand that reverses the content of a StringHolder.
// execute() reverses the string. undo() reverses it back (reverses again).

function exercise9(): void {
  class StringHolder {
    constructor(public value: string) {}
  }

  // TODO: Implement StringReverseCommand
  // class StringReverseCommand implements Command { ... }

  // Test:
  // const holder = new StringHolder("hello");
  // const cmd = new StringReverseCommand(holder);
  // cmd.execute();
  // console.log(holder.value); // "olleh"
  // cmd.undo();
  // console.log(holder.value); // "hello"
}

// exercise9();

// ============================================================================
// EXERCISE 10 - Implement
// ============================================================================
// Implement a CommandHistory class with executeCommand, undo, and redo.
// redo stack must be cleared when a new command is executed.

function exercise10(): void {
  class NumberStore {
    constructor(public value: number) {}
  }

  class MultiplyCommand implements Command {
    private prev = 0;
    constructor(private store: NumberStore, private factor: number) {}
    execute(): void {
      this.prev = this.store.value;
      this.store.value *= this.factor;
    }
    undo(): void {
      this.store.value = this.prev;
    }
  }

  // TODO: Implement CommandHistory
  // class CommandHistory {
  //   executeCommand(cmd: Command): void { ... }
  //   undo(): void { ... }
  //   redo(): void { ... }
  // }

  // Test:
  // const store = new NumberStore(2);
  // const history = new CommandHistory();
  // history.executeCommand(new MultiplyCommand(store, 3)); // 6
  // history.executeCommand(new MultiplyCommand(store, 4)); // 24
  // console.log(store.value); // 24
  // history.undo(); // 6
  // console.log(store.value); // 6
  // history.redo(); // 24
  // console.log(store.value); // 24
  // history.undo(); // 6
  // history.executeCommand(new MultiplyCommand(store, 5)); // 30
  // history.redo(); // should do nothing, redo stack was cleared
  // console.log(store.value); // 30
}

// exercise10();

// ============================================================================
// EXERCISE 11 - Implement
// ============================================================================
// Implement a DelayedCommandQueue that stores commands and executes them
// all at once when flush() is called. It should return the count of
// commands processed.

function exercise11(): void {
  class Logger {
    entries: string[] = [];
    log(msg: string): void {
      this.entries.push(msg);
    }
  }

  class LogCommand implements Command {
    constructor(private logger: Logger, private msg: string) {}
    execute(): void {
      this.logger.log(this.msg);
    }
    undo(): void {
      this.logger.entries.pop();
    }
  }

  // TODO: Implement DelayedCommandQueue
  // class DelayedCommandQueue {
  //   enqueue(cmd: Command): void { ... }
  //   flush(): number { ... }
  //   size(): number { ... }
  // }

  // Test:
  // const logger = new Logger();
  // const queue = new DelayedCommandQueue();
  // queue.enqueue(new LogCommand(logger, "a"));
  // queue.enqueue(new LogCommand(logger, "b"));
  // queue.enqueue(new LogCommand(logger, "c"));
  // console.log(queue.size()); // 3
  // const count = queue.flush();
  // console.log(count); // 3
  // console.log(queue.size()); // 0
  // console.log(logger.entries.join(",")); // a,b,c
}

// exercise11();

// ============================================================================
// EXERCISE 12 - Implement
// ============================================================================
// Implement a ConditionalCommand that only executes its inner command
// if a predicate function returns true. Undo only works if it was executed.

function exercise12(): void {
  class Account {
    constructor(public balance: number) {}
  }

  class WithdrawCommand implements Command {
    private prevBalance = 0;
    private executed = false;
    constructor(private account: Account, private amount: number) {}
    execute(): void {
      this.prevBalance = this.account.balance;
      this.account.balance -= this.amount;
      this.executed = true;
    }
    undo(): void {
      if (this.executed) {
        this.account.balance = this.prevBalance;
        this.executed = false;
      }
    }
  }

  // TODO: Implement ConditionalCommand
  // class ConditionalCommand implements Command {
  //   constructor(private inner: Command, private predicate: () => boolean) {}
  //   execute(): void { ... }
  //   undo(): void { ... }
  //   wasExecuted(): boolean { ... }
  // }

  // Test:
  // const account = new Account(100);
  // const withdraw = new WithdrawCommand(account, 50);
  // const guarded = new ConditionalCommand(withdraw, () => account.balance >= 50);
  // guarded.execute();
  // console.log(account.balance); // 50
  // console.log(guarded.wasExecuted()); // true
  //
  // const bigWithdraw = new WithdrawCommand(account, 200);
  // const guarded2 = new ConditionalCommand(bigWithdraw, () => account.balance >= 200);
  // guarded2.execute();
  // console.log(account.balance); // 50 (not executed, balance < 200)
  // console.log(guarded2.wasExecuted()); // false
}

// exercise12();

// ============================================================================
// EXERCISE 13 - Implement
// ============================================================================
// Implement a full MacroCommand that supports execute, undo, and a method
// to get the count of child commands.

function exercise13(): void {
  class Thermostat {
    constructor(public temperature: number) {}
  }

  class SetTemperatureCommand implements Command {
    private prev = 0;
    constructor(private thermostat: Thermostat, private target: number) {}
    execute(): void {
      this.prev = this.thermostat.temperature;
      this.thermostat.temperature = this.target;
    }
    undo(): void {
      this.thermostat.temperature = this.prev;
    }
  }

  // TODO: Implement MacroCommand
  // class MacroCommand implements Command {
  //   add(cmd: Command): void { ... }
  //   execute(): void { ... }
  //   undo(): void { ... }  // must undo in reverse order
  //   count(): number { ... }
  // }

  // Test:
  // const t = new Thermostat(20);
  // const macro = new MacroCommand();
  // macro.add(new SetTemperatureCommand(t, 22));
  // macro.add(new SetTemperatureCommand(t, 25));
  // macro.add(new SetTemperatureCommand(t, 18));
  // console.log(macro.count()); // 3
  // macro.execute();
  // console.log(t.temperature); // 18
  // macro.undo();
  // console.log(t.temperature); // 20 (each undo restores prev: 25 -> 22 -> 20)
}

// exercise13();

// ============================================================================
// EXERCISE 14 - Implement
// ============================================================================
// Implement a TransactionManager that executes a list of commands.
// If any command throws during execute(), it should roll back all
// previously executed commands and return false. Returns true on success.

function exercise14(): void {
  class Inventory {
    items: Map<string, number> = new Map();

    setStock(item: string, qty: number): void {
      this.items.set(item, qty);
    }

    getStock(item: string): number {
      return this.items.get(item) ?? 0;
    }
  }

  class ReduceStockCommand implements Command {
    private prevQty = 0;

    constructor(
      private inventory: Inventory,
      private item: string,
      private qty: number,
    ) {}

    execute(): void {
      this.prevQty = this.inventory.getStock(this.item);
      const newQty = this.prevQty - this.qty;
      if (newQty < 0) throw new Error(`Insufficient stock for ${this.item}`);
      this.inventory.setStock(this.item, newQty);
    }

    undo(): void {
      this.inventory.setStock(this.item, this.prevQty);
    }
  }

  // TODO: Implement TransactionManager
  // class TransactionManager {
  //   run(commands: Command[]): boolean { ... }
  // }

  // Test:
  // const inv = new Inventory();
  // inv.setStock("apple", 10);
  // inv.setStock("banana", 2);
  // const txn = new TransactionManager();
  //
  // const success = txn.run([
  //   new ReduceStockCommand(inv, "apple", 3),
  //   new ReduceStockCommand(inv, "banana", 1),
  // ]);
  // console.log(success); // true
  // console.log(inv.getStock("apple")); // 7
  // console.log(inv.getStock("banana")); // 1
  //
  // const fail = txn.run([
  //   new ReduceStockCommand(inv, "apple", 2),
  //   new ReduceStockCommand(inv, "banana", 5), // fails: only 1 left
  // ]);
  // console.log(fail); // false
  // console.log(inv.getStock("apple")); // 7 (rolled back)
  // console.log(inv.getStock("banana")); // 1 (unchanged, threw before mutating)
}

// exercise14();

// ============================================================================
// EXERCISE 15 - Implement
// ============================================================================
// Implement a RemoteControl with numbered slots. Each slot can hold a
// command for "on" and "off". The remote should also support a global
// undo that undoes the last button press.

function exercise15(): void {
  class Fan {
    speed = 0;
    setSpeed(s: number): void {
      this.speed = s;
    }
  }

  class FanOnCommand implements Command {
    private prevSpeed = 0;
    constructor(private fan: Fan, private targetSpeed: number) {}
    execute(): void {
      this.prevSpeed = this.fan.speed;
      this.fan.setSpeed(this.targetSpeed);
    }
    undo(): void {
      this.fan.setSpeed(this.prevSpeed);
    }
  }

  class FanOffCommand implements Command {
    private prevSpeed = 0;
    constructor(private fan: Fan) {}
    execute(): void {
      this.prevSpeed = this.fan.speed;
      this.fan.setSpeed(0);
    }
    undo(): void {
      this.fan.setSpeed(this.prevSpeed);
    }
  }

  class NoOpCommand implements Command {
    execute(): void {}
    undo(): void {}
  }

  // TODO: Implement RemoteControl
  // class RemoteControl {
  //   constructor(private slotCount: number) { ... }
  //   setCommand(slot: number, onCmd: Command, offCmd: Command): void { ... }
  //   pressOn(slot: number): void { ... }
  //   pressOff(slot: number): void { ... }
  //   pressUndo(): void { ... }
  // }

  // Test:
  // const fan = new Fan();
  // const remote = new RemoteControl(3);
  // remote.setCommand(0, new FanOnCommand(fan, 3), new FanOffCommand(fan));
  // remote.pressOn(0);
  // console.log(fan.speed); // 3
  // remote.pressOff(0);
  // console.log(fan.speed); // 0
  // remote.pressUndo();
  // console.log(fan.speed); // 3
}

// exercise15();
