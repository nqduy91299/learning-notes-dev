# Command Pattern

## Intent

The **Command** pattern is a behavioral design pattern that encapsulates a request as a
stand-alone object containing all the information needed to perform that request. This
transformation decouples the object that **invokes** the operation from the object that
**knows how to perform** it, enabling parameterization of clients with different requests,
queuing or logging of requests, and support for undoable operations.

Also known as: **Action**, **Transaction**.

---

## The Problem: Coupling Senders to Receivers

Consider building a text-editor application with a toolbar. You need buttons for Copy,
Cut, Paste, Undo, Bold, Italic, Save, and dozens more operations. The naive approach is
to wire each button directly to the business logic:

```typescript
class CopyButton {
  private editor: Editor;
  onClick() {
    const selection = this.editor.getSelection();
    navigator.clipboard.writeText(selection);
  }
}
```

Problems with this approach:

1. **Tight coupling** - every UI element depends directly on the receiver's API.
2. **Code duplication** - Copy can be triggered from a button, a context menu, and a
   keyboard shortcut. Each trigger duplicates the same logic.
3. **Impossible to undo** - there is no record of what was executed or how to reverse it.
4. **Hard to extend** - adding a new operation means modifying UI classes and potentially
   breaking existing ones.

The Command pattern solves all of these by introducing an indirection layer: a command
object sits between the sender (button, menu, shortcut) and the receiver (editor, file
system, database).

---

## Structure

```
┌─────────────┐        ┌──────────────────┐
│   Client     │        │   «interface»     │
│              │───────>│    Command         │
└─────────────┘        │  + execute(): void │
                        │  + undo(): void   │
                        └────────┬─────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             │                   │                   │
  ┌──────────┴────────┐ ┌───────┴────────┐ ┌───────┴────────┐
  │ ConcreteCommandA   │ │ ConcreteCommandB│ │  MacroCommand   │
  │ - receiver         │ │ - receiver      │ │ - commands[]    │
  │ - params           │ │ - params        │ │                 │
  │ + execute()        │ │ + execute()     │ │ + execute()     │
  │ + undo()           │ │ + undo()        │ │ + undo()        │
  └────────┬───────────┘ └───────┬────────┘ └────────────────┘
           │                     │
           ▼                     ▼
  ┌─────────────────┐   ┌─────────────────┐
  │    Receiver A    │   │    Receiver B    │
  │ (business logic) │   │ (business logic) │
  └─────────────────┘   └─────────────────┘

  ┌─────────────────┐
  │    Invoker       │
  │ - history: []    │
  │ + executeCmd()   │
  │ + undo()         │
  │ + redo()         │
  └─────────────────┘
```

### Participants

| Role                | Responsibility                                                 |
| ------------------- | -------------------------------------------------------------- |
| **Command**         | Interface declaring `execute()` and optionally `undo()`        |
| **ConcreteCommand** | Binds a receiver to an action; stores parameters               |
| **Invoker**         | Asks the command to carry out the request; manages history      |
| **Receiver**        | Contains the actual business logic                             |
| **Client**          | Creates commands and associates them with receivers & invokers  |

---

## TypeScript Implementation

### Step 1: Command Interface

```typescript
interface Command {
  execute(): void;
  undo(): void;
}
```

### Step 2: Receiver

```typescript
class TextEditor {
  private content = "";
  private clipboard = "";

  type(text: string): void {
    this.content += text;
  }

  deleteLast(count: number): string {
    const removed = this.content.slice(-count);
    this.content = this.content.slice(0, -count);
    return removed;
  }

  copy(start: number, end: number): void {
    this.clipboard = this.content.slice(start, end);
  }

  paste(): string {
    return this.clipboard;
  }

  getContent(): string {
    return this.content;
  }
}
```

### Step 3: Concrete Commands

```typescript
class TypeCommand implements Command {
  constructor(
    private editor: TextEditor,
    private text: string,
  ) {}

  execute(): void {
    this.editor.type(this.text);
  }

  undo(): void {
    this.editor.deleteLast(this.text.length);
  }
}

class DeleteCommand implements Command {
  private deleted = "";

  constructor(
    private editor: TextEditor,
    private count: number,
  ) {}

  execute(): void {
    this.deleted = this.editor.deleteLast(this.count);
  }

  undo(): void {
    this.editor.type(this.deleted);
  }
}
```

### Step 4: Invoker with Undo/Redo

```typescript
class CommandManager {
  private history: Command[] = [];
  private redoStack: Command[] = [];

  executeCommand(cmd: Command): void {
    cmd.execute();
    this.history.push(cmd);
    this.redoStack.length = 0; // clear redo on new action
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
```

### Step 5: Client Code

```typescript
const editor = new TextEditor();
const manager = new CommandManager();

manager.executeCommand(new TypeCommand(editor, "Hello "));
manager.executeCommand(new TypeCommand(editor, "World"));
console.log(editor.getContent()); // "Hello World"

manager.undo();
console.log(editor.getContent()); // "Hello "

manager.redo();
console.log(editor.getContent()); // "Hello World"
```

---

## Undo/Redo with Command History

The Command pattern is the most popular way to implement undo/redo. Two strategies exist:

### Strategy A: Store Inverse Operations

Each command knows how to reverse itself. The invoker keeps a stack of executed commands.
Undo pops from the history stack and calls `undo()`, pushing onto a redo stack. This is
memory-efficient but requires every command to implement a correct inverse.

```typescript
// Already shown above - TypeCommand.undo() removes the typed characters.
```

### Strategy B: Store State Snapshots (Memento)

Before executing, the command saves the receiver's entire state. Undo restores from the
snapshot. This is simpler to implement but can be expensive for large states.

```typescript
class SnapshotCommand implements Command {
  private snapshot = "";

  constructor(
    private editor: TextEditor,
    private action: () => void,
  ) {}

  execute(): void {
    this.snapshot = this.editor.getContent();
    this.action();
  }

  undo(): void {
    // Restore the entire state from snapshot
    // (requires a setState method on the editor)
  }
}
```

### Choosing Between Strategies

| Criteria            | Inverse Operations       | State Snapshots        |
| ------------------- | ------------------------ | ---------------------- |
| Memory usage        | Low                      | High for large states  |
| Implementation      | Must write inverse logic | Simple, just save/load |
| Partial undo        | Possible                 | Harder                 |
| Complex state       | Harder to get right      | Straightforward        |

---

## Macro Commands

A **macro command** (also called a composite command) groups multiple commands into one
unit. Executing the macro executes all its children. Undoing reverses them in opposite
order.

```typescript
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
}
```

Use cases: "Replace All" (multiple individual replacements), database batch operations,
recording and replaying user macros.

---

## Command Queue

Commands can be serialized and placed into a queue for deferred or distributed execution:

```typescript
class CommandQueue {
  private queue: Command[] = [];

  enqueue(cmd: Command): void {
    this.queue.push(cmd);
  }

  processNext(): void {
    const cmd = this.queue.shift();
    if (cmd) {
      cmd.execute();
    }
  }

  processAll(): void {
    while (this.queue.length > 0) {
      this.processNext();
    }
  }
}
```

This pattern is the foundation for:

- **Task schedulers** - execute commands at specific times
- **Thread pools** - worker threads pull commands from a shared queue
- **Message brokers** - serialize commands and send them over the network
- **Transaction logs** - persist commands to replay after a crash

---

## When to Use the Command Pattern

1. **Parameterize objects with operations** - pass commands as arguments, store them in
   data structures, swap them at runtime.
2. **Queue, schedule, or execute remotely** - serialize the command and process it later
   or on another machine.
3. **Implement undo/redo** - maintain a history stack of executed commands.
4. **Support transactions** - if any command in a sequence fails, undo all previously
   executed commands in the batch.
5. **Log changes** - persist commands so the system can reconstruct state after a crash.
6. **Decouple UI from business logic** - buttons, menus, and shortcuts all use the same
   command objects.

---

## Pros and Cons

### Pros

- **Single Responsibility Principle** - decouples invocation from execution.
- **Open/Closed Principle** - add new commands without modifying existing invokers or
  receivers.
- **Undo/Redo** - naturally supported via command history.
- **Deferred execution** - queue commands for later processing.
- **Macro composition** - assemble simple commands into complex ones.
- **Logging and auditing** - every operation is a first-class object that can be
  serialized and stored.

### Cons

- **Increased complexity** - introduces a new layer of abstraction between senders and
  receivers.
- **Lots of small classes** - each operation becomes its own class.
- **Memory overhead** - storing command history can consume significant memory for
  long-running applications.

---

## Real-World Examples

### 1. Text Editor Undo/Redo

Every keystroke, deletion, and formatting change is encapsulated as a command. The editor
maintains a history stack. `Ctrl+Z` pops the last command and calls `undo()`.
`Ctrl+Shift+Z` pops from the redo stack and re-executes.

### 2. UI Button Actions

GUI frameworks use the command pattern to decouple button widgets from the actions they
trigger. A `Button` holds a reference to a `Command`. Clicking the button calls
`command.execute()`. The same command can be shared by a toolbar button, a menu item,
and a keyboard shortcut.

### 3. Transaction Systems

Database transactions can be modeled as a sequence of commands. If any command fails, all
previously executed commands in the transaction are undone (rolled back). This is the
command pattern combined with the concept of compensating transactions.

```typescript
class TransactionManager {
  private executed: Command[] = [];

  run(commands: Command[]): boolean {
    for (const cmd of commands) {
      try {
        cmd.execute();
        this.executed.push(cmd);
      } catch {
        this.rollback();
        return false;
      }
    }
    return true;
  }

  private rollback(): void {
    while (this.executed.length > 0) {
      this.executed.pop()!.undo();
    }
  }
}
```

### 4. Task Queues / Job Schedulers

Background job systems (like Bull, Celery, or Sidekiq) serialize command objects
(jobs) into a queue (Redis, RabbitMQ). Worker processes dequeue and execute them.
Failed jobs can be retried or sent to a dead-letter queue.

### 5. Game Input Replay

Games record player inputs as commands. The sequence can be replayed to reproduce
gameplay, enable demos, or facilitate debugging. Since each command is a discrete object,
the replay system does not need to know the specifics of each action.

### 6. Smart Home Automation

Remote controls and automation rules issue commands to devices (lights, thermostats,
locks). A "scene" is a macro command that executes multiple device commands. Undo
restores previous device states.

---

## Relations with Other Patterns

| Pattern                    | Relationship                                                     |
| -------------------------- | ---------------------------------------------------------------- |
| **Strategy**               | Both encapsulate behavior, but Command also supports undo/queue  |
| **Memento**                | Can store state snapshots for command undo                       |
| **Chain of Responsibility**| Commands can be handlers in a chain                              |
| **Observer**               | Both decouple senders/receivers; Observer is 1:N, Command is 1:1 |
| **Composite**              | MacroCommand is a composite of commands                          |
| **Prototype**              | Clone commands to save them into history                         |

---

## Key Takeaways

1. A command turns a method call into an object - giving it a lifetime, an identity, and
   the ability to be stored, queued, or undone.
2. The invoker does not know what the command does - it only knows the `execute()` and
   `undo()` interface.
3. Undo/redo is the killer feature - but the pattern is equally valuable for queuing,
   logging, and transaction management.
4. Macro commands compose simple commands into complex workflows.
5. In TypeScript, commands pair naturally with closures and first-class functions, but
   the class-based approach is more appropriate when you need undo, serialization, or
   complex state management.

---

## References

- [Refactoring Guru - Command Pattern](https://refactoring.guru/design-patterns/command)
- *Design Patterns: Elements of Reusable Object-Oriented Software* (GoF), Chapter 5
- *Head First Design Patterns*, Chapter 6
