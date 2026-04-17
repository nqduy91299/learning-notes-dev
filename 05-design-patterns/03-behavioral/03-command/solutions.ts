// ============================================================================
// Command Pattern - Solutions
// ============================================================================
// Config: ES2022, strict, ESNext modules. Run with: npx tsx solutions.ts
// ============================================================================

interface Command {
  execute(): void;
  undo(): void;
}

// ============================================================================
// SOLUTION 1 - Predict Output
// ============================================================================

function solution1(): void {
  console.log("=== Solution 1 ===");

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
  cmd.execute();   // wasOn=false -> Light ON
  cmd.execute();   // wasOn=true  -> Light OFF
  cmd.undo();      // wasOn was true -> turnOn -> Light ON
  console.log(`Final: ${light.isOn()}`); // Final: true
}

// ============================================================================
// SOLUTION 2 - Predict Output
// ============================================================================

function solution2(): void {
  console.log("\n=== Solution 2 ===");

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
  console.log(log.join(",")); // A,B,C,undo-C,undo-B,undo-A
}

// ============================================================================
// SOLUTION 3 - Predict Output
// ============================================================================

function solution3(): void {
  console.log("\n=== Solution 3 ===");

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

  history.pop()!.undo();
  console.log(counter.value); // 5

  history.pop()!.undo();
  console.log(counter.value); // 0
}

// ============================================================================
// SOLUTION 4 - Predict Output
// ============================================================================

function solution4(): void {
  console.log("\n=== Solution 4 ===");

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

  console.log(buf.content);  // Hello TypeScript
  console.log(cmds.length);  // 2
}

// ============================================================================
// SOLUTION 5 - Predict Output
// ============================================================================

function solution5(): void {
  console.log("\n=== Solution 5 ===");

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
    undo(): void {}
  }

  const q = new CommandQueue();
  q.enqueue(new LogCommand(q, "first"));
  q.enqueue(new LogCommand(q, "second"));
  q.enqueue(new LogCommand(q, "third"));

  q.processAll();
  q.enqueue(new LogCommand(q, "fourth"));
  q.processAll();

  console.log(q.getLog().join(",")); // first,second,third,fourth
}

// ============================================================================
// SOLUTION 6 - Fix the Bug
// ============================================================================

function solution6(): void {
  console.log("\n=== Solution 6 (Fixed) ===");

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
      this.redoStack.length = 0; // FIX: clear redo stack
    }

    undo(): void {
      const cmd = this.history.pop();
      if (cmd) {
        cmd.undo();
        this.redoStack.push(cmd); // FIX: push to redo stack
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
  console.log(`Value: ${calc.value}`); // 30

  mgr.undo();
  console.log(`After undo: ${calc.value}`); // 10
  console.log(`Redo stack size: ${mgr.getRedoSize()}`); // 1

  mgr.redo();
  console.log(`After redo: ${calc.value}`); // 30
}

// ============================================================================
// SOLUTION 7 - Fix the Bug
// ============================================================================

function solution7(): void {
  console.log("\n=== Solution 7 (Fixed) ===");

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

  class FixedMacroCommand implements Command {
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
      // FIX: reverse the array before iterating
      for (const cmd of [...this.commands].reverse()) {
        cmd.undo();
      }
    }
  }

  const macro = new FixedMacroCommand();
  macro.add(new PrintCommand("A"));
  macro.add(new PrintCommand("B"));
  macro.add(new PrintCommand("C"));

  macro.execute();
  macro.undo();
  console.log(output.join(",")); // do:A,do:B,do:C,undo:C,undo:B,undo:A
}

// ============================================================================
// SOLUTION 8 - Fix the Bug
// ============================================================================

function solution8(): void {
  console.log("\n=== Solution 8 (Fixed) ===");

  class Document {
    title = "Untitled";
  }

  class RenameCommand implements Command {
    private previousTitle = "";

    constructor(private doc: Document, private newTitle: string) {}

    execute(): void {
      // FIX: save snapshot BEFORE mutation
      this.previousTitle = this.doc.title;
      this.doc.title = this.newTitle;
    }

    undo(): void {
      this.doc.title = this.previousTitle;
    }
  }

  const doc = new Document();
  const cmd = new RenameCommand(doc, "My Document");
  cmd.execute();
  console.log(`Title: ${doc.title}`); // Title: My Document

  cmd.undo();
  console.log(`After undo: ${doc.title}`); // After undo: Untitled
}

// ============================================================================
// SOLUTION 9 - Implement StringReverseCommand
// ============================================================================

function solution9(): void {
  console.log("\n=== Solution 9 ===");

  class StringHolder {
    constructor(public value: string) {}
  }

  class StringReverseCommand implements Command {
    constructor(private holder: StringHolder) {}

    execute(): void {
      this.holder.value = this.holder.value.split("").reverse().join("");
    }

    undo(): void {
      // Reversing again restores the original
      this.holder.value = this.holder.value.split("").reverse().join("");
    }
  }

  const holder = new StringHolder("hello");
  const cmd = new StringReverseCommand(holder);
  cmd.execute();
  console.log(holder.value); // olleh
  cmd.undo();
  console.log(holder.value); // hello
}

// ============================================================================
// SOLUTION 10 - Implement CommandHistory
// ============================================================================

function solution10(): void {
  console.log("\n=== Solution 10 ===");

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

  class CommandHistory {
    private history: Command[] = [];
    private redoStack: Command[] = [];

    executeCommand(cmd: Command): void {
      cmd.execute();
      this.history.push(cmd);
      this.redoStack.length = 0;
    }

    undo(): void {
      const cmd = this.history.pop();
      if (cmd) {
        cmd.undo();
        this.redoStack.push(cmd);
      }
    }

    redo(): void {
      const cmd = this.redoStack.pop();
      if (cmd) {
        cmd.execute();
        this.history.push(cmd);
      }
    }
  }

  const store = new NumberStore(2);
  const history = new CommandHistory();
  history.executeCommand(new MultiplyCommand(store, 3));
  history.executeCommand(new MultiplyCommand(store, 4));
  console.log(store.value); // 24

  history.undo();
  console.log(store.value); // 6

  history.redo();
  console.log(store.value); // 24

  history.undo();
  history.executeCommand(new MultiplyCommand(store, 5));
  history.redo(); // no-op
  console.log(store.value); // 30
}

// ============================================================================
// SOLUTION 11 - Implement DelayedCommandQueue
// ============================================================================

function solution11(): void {
  console.log("\n=== Solution 11 ===");

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

  class DelayedCommandQueue {
    private queue: Command[] = [];

    enqueue(cmd: Command): void {
      this.queue.push(cmd);
    }

    flush(): number {
      const count = this.queue.length;
      while (this.queue.length > 0) {
        this.queue.shift()!.execute();
      }
      return count;
    }

    size(): number {
      return this.queue.length;
    }
  }

  const logger = new Logger();
  const queue = new DelayedCommandQueue();
  queue.enqueue(new LogCommand(logger, "a"));
  queue.enqueue(new LogCommand(logger, "b"));
  queue.enqueue(new LogCommand(logger, "c"));
  console.log(queue.size()); // 3
  const count = queue.flush();
  console.log(count); // 3
  console.log(queue.size()); // 0
  console.log(logger.entries.join(",")); // a,b,c
}

// ============================================================================
// SOLUTION 12 - Implement ConditionalCommand
// ============================================================================

function solution12(): void {
  console.log("\n=== Solution 12 ===");

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

  class ConditionalCommand implements Command {
    private didExecute = false;

    constructor(
      private inner: Command,
      private predicate: () => boolean,
    ) {}

    execute(): void {
      if (this.predicate()) {
        this.inner.execute();
        this.didExecute = true;
      }
    }

    undo(): void {
      if (this.didExecute) {
        this.inner.undo();
        this.didExecute = false;
      }
    }

    wasExecuted(): boolean {
      return this.didExecute;
    }
  }

  const account = new Account(100);
  const withdraw = new WithdrawCommand(account, 50);
  const guarded = new ConditionalCommand(withdraw, () => account.balance >= 50);
  guarded.execute();
  console.log(account.balance); // 50
  console.log(guarded.wasExecuted()); // true

  const bigWithdraw = new WithdrawCommand(account, 200);
  const guarded2 = new ConditionalCommand(bigWithdraw, () => account.balance >= 200);
  guarded2.execute();
  console.log(account.balance); // 50
  console.log(guarded2.wasExecuted()); // false
}

// ============================================================================
// SOLUTION 13 - Implement MacroCommand
// ============================================================================

function solution13(): void {
  console.log("\n=== Solution 13 ===");

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

  class MacroCommand implements Command {
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
      for (const cmd of [...this.commands].reverse()) {
        cmd.undo();
      }
    }

    count(): number {
      return this.commands.length;
    }
  }

  const t = new Thermostat(20);
  const macro = new MacroCommand();
  macro.add(new SetTemperatureCommand(t, 22));
  macro.add(new SetTemperatureCommand(t, 25));
  macro.add(new SetTemperatureCommand(t, 18));
  console.log(macro.count()); // 3
  macro.execute();
  console.log(t.temperature); // 18
  macro.undo();
  console.log(t.temperature); // 20
}

// ============================================================================
// SOLUTION 14 - Implement TransactionManager
// ============================================================================

function solution14(): void {
  console.log("\n=== Solution 14 ===");

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

  class TransactionManager {
    run(commands: Command[]): boolean {
      const executed: Command[] = [];
      for (const cmd of commands) {
        try {
          cmd.execute();
          executed.push(cmd);
        } catch {
          // Rollback in reverse order
          while (executed.length > 0) {
            executed.pop()!.undo();
          }
          return false;
        }
      }
      return true;
    }
  }

  const inv = new Inventory();
  inv.setStock("apple", 10);
  inv.setStock("banana", 2);
  const txn = new TransactionManager();

  const success = txn.run([
    new ReduceStockCommand(inv, "apple", 3),
    new ReduceStockCommand(inv, "banana", 1),
  ]);
  console.log(success); // true
  console.log(inv.getStock("apple")); // 7
  console.log(inv.getStock("banana")); // 1

  const fail = txn.run([
    new ReduceStockCommand(inv, "apple", 2),
    new ReduceStockCommand(inv, "banana", 5),
  ]);
  console.log(fail); // false
  console.log(inv.getStock("apple")); // 7
  console.log(inv.getStock("banana")); // 1
}

// ============================================================================
// SOLUTION 15 - Implement RemoteControl
// ============================================================================

function solution15(): void {
  console.log("\n=== Solution 15 ===");

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

  class RemoteControl {
    private onCommands: Command[];
    private offCommands: Command[];
    private lastCommand: Command;

    constructor(private slotCount: number) {
      const noop = new NoOpCommand();
      this.onCommands = Array.from({ length: slotCount }, () => noop);
      this.offCommands = Array.from({ length: slotCount }, () => noop);
      this.lastCommand = noop;
    }

    setCommand(slot: number, onCmd: Command, offCmd: Command): void {
      this.onCommands[slot] = onCmd;
      this.offCommands[slot] = offCmd;
    }

    pressOn(slot: number): void {
      this.onCommands[slot].execute();
      this.lastCommand = this.onCommands[slot];
    }

    pressOff(slot: number): void {
      this.offCommands[slot].execute();
      this.lastCommand = this.offCommands[slot];
    }

    pressUndo(): void {
      this.lastCommand.undo();
    }
  }

  const fan = new Fan();
  const remote = new RemoteControl(3);
  remote.setCommand(0, new FanOnCommand(fan, 3), new FanOffCommand(fan));
  remote.pressOn(0);
  console.log(fan.speed); // 3
  remote.pressOff(0);
  console.log(fan.speed); // 0
  remote.pressUndo();
  console.log(fan.speed); // 3
}

// ============================================================================
// Runner
// ============================================================================

function runAll(): void {
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
  solution13();
  solution14();
  solution15();
}

runAll();
