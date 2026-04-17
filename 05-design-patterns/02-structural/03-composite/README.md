# Composite Pattern

## Intent

The **Composite** is a structural design pattern that lets you compose objects into
tree structures and then work with these structures as if they were individual objects.
It treats both individual objects (leaves) and compositions of objects (composites)
uniformly through a shared interface.

The key idea: a single object and a group of objects should be treated the same way
by the code that uses them.

---

## The Problem: Working with Tree Structures

Consider building a file system explorer. You have two kinds of entities:

- **Files** — individual items with a name and size
- **Folders** — containers that hold files *and other folders*

You need to calculate the total size of a folder. A naive approach forces you to
distinguish between files and folders at every level, writing recursive logic that
checks types explicitly:

```typescript
// Without Composite — messy type-checking everywhere
function calculateSize(item: File | Folder): number {
  if (item instanceof File) {
    return item.size;
  }
  // It's a folder — manually recurse
  let total = 0;
  for (const child of item.children) {
    if (child instanceof File) {
      total += child.size;
    } else if (child instanceof Folder) {
      total += calculateSize(child); // recursive, brittle
    }
  }
  return total;
}
```

Problems with this approach:

1. **Violates Open/Closed Principle** — adding a new node type (e.g., `Symlink`)
   requires modifying every function that traverses the tree.
2. **Client code is coupled to concrete classes** — you must know about every
   type of node.
3. **Duplicated traversal logic** — every operation (size, search, display) must
   replicate the same type-checking structure.

---

## Structure

The Composite pattern defines three participants:

```
         ┌─────────────┐
         │  Component   │  ← interface / abstract class
         │─────────────│
         │ operation()  │
         └──────┬──────┘
                │
       ┌────────┴────────┐
       │                 │
  ┌────┴─────┐    ┌─────┴──────┐
  │   Leaf   │    │ Composite  │
  │──────────│    │────────────│
  │operation()│   │ children[] │
  └──────────┘    │ add()      │
                  │ remove()   │
                  │ operation()│
                  └────────────┘
```

### 1. Component (Interface)

Declares the common interface for all objects in the tree. This typically includes:

- The core business operation(s)
- Optionally, child-management methods (`add`, `remove`, `getChildren`)

```typescript
interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  display(indent: string): string;
}
```

### 2. Leaf

A basic element with no children. Implements the component interface directly.
Leaves do the actual work — they don't delegate.

```typescript
class File implements FileSystemComponent {
  constructor(
    private name: string,
    private size: number
  ) {}

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }

  display(indent: string): string {
    return `${indent}📄 ${this.name} (${this.size}B)`;
  }
}
```

### 3. Composite

A container element that stores children (both leaves and other composites).
It delegates operations to its children and aggregates results.

```typescript
class Folder implements FileSystemComponent {
  private children: FileSystemComponent[] = [];

  constructor(private name: string) {}

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  remove(component: FileSystemComponent): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce(
      (total, child) => total + child.getSize(),
      0
    );
  }

  display(indent: string): string {
    const lines = [`${indent}📁 ${this.name}`];
    for (const child of this.children) {
      lines.push(child.display(indent + "  "));
    }
    return lines.join("\n");
  }
}
```

### 4. Client

Works with all elements through the `Component` interface. The client does not
need to know whether it is working with a leaf or a composite.

```typescript
function printInfo(component: FileSystemComponent): void {
  console.log(component.display(""));
  console.log(`Total size: ${component.getSize()}B`);
}

// Works identically for a single file or an entire folder tree
const file = new File("readme.txt", 1024);
printInfo(file);

const root = new Folder("project");
root.add(new File("index.ts", 512));
root.add(file);
printInfo(root);
```

---

## Full Implementation in TypeScript

```typescript
// ─── Component Interface ───
interface UIComponent {
  render(depth: number): string;
  getWidth(): number;
  getHeight(): number;
}

// ─── Leaf: Button ───
class Button implements UIComponent {
  constructor(
    private label: string,
    private width: number,
    private height: number
  ) {}

  render(depth: number): string {
    const pad = "  ".repeat(depth);
    return `${pad}<Button label="${this.label}" />`;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

// ─── Leaf: TextInput ───
class TextInput implements UIComponent {
  constructor(
    private placeholder: string,
    private width: number,
    private height: number
  ) {}

  render(depth: number): string {
    const pad = "  ".repeat(depth);
    return `${pad}<TextInput placeholder="${this.placeholder}" />`;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

// ─── Composite: Panel ───
class Panel implements UIComponent {
  private children: UIComponent[] = [];

  constructor(
    private title: string,
    private padding: number = 10
  ) {}

  add(child: UIComponent): void {
    this.children.push(child);
  }

  remove(child: UIComponent): void {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
  }

  render(depth: number): string {
    const pad = "  ".repeat(depth);
    const lines = [`${pad}<Panel title="${this.title}">`];
    for (const child of this.children) {
      lines.push(child.render(depth + 1));
    }
    lines.push(`${pad}</Panel>`);
    return lines.join("\n");
  }

  getWidth(): number {
    const maxChildWidth = this.children.reduce(
      (max, c) => Math.max(max, c.getWidth()),
      0
    );
    return maxChildWidth + this.padding * 2;
  }

  getHeight(): number {
    const totalChildHeight = this.children.reduce(
      (sum, c) => sum + c.getHeight(),
      0
    );
    return totalChildHeight + this.padding * 2;
  }
}

// ─── Client code ───
const loginPanel = new Panel("Login Form");
loginPanel.add(new TextInput("Username", 200, 30));
loginPanel.add(new TextInput("Password", 200, 30));
loginPanel.add(new Button("Submit", 100, 40));

const sidebar = new Panel("Sidebar", 5);
sidebar.add(new Button("Home", 80, 30));
sidebar.add(new Button("Settings", 80, 30));

const app = new Panel("App", 0);
app.add(sidebar);
app.add(loginPanel);

console.log(app.render(0));
console.log(`App size: ${app.getWidth()} x ${app.getHeight()}`);
```

---

## Transparency vs. Safety Approaches

There are two schools of thought on where to declare child-management methods:

### Transparency Approach

Child-management methods (`add`, `remove`) are declared in the **Component**
interface. This gives maximum uniformity — the client can treat all nodes the same.

```typescript
interface Component {
  operation(): void;
  add(child: Component): void;    // in the interface
  remove(child: Component): void; // in the interface
}

class Leaf implements Component {
  operation(): void { /* ... */ }

  add(_child: Component): void {
    throw new Error("Cannot add to a leaf");
  }

  remove(_child: Component): void {
    throw new Error("Cannot remove from a leaf");
  }
}
```

**Pros:** Client code is simple; no type checking needed.
**Cons:** Violates Interface Segregation Principle. Leaf gets meaningless methods.
Runtime errors instead of compile-time errors.

### Safety Approach

Child-management methods exist **only on the Composite**. The Component interface
contains only the business operations.

```typescript
interface Component {
  operation(): void;
  // No add/remove here
}

class Composite implements Component {
  private children: Component[] = [];

  operation(): void { /* delegate to children */ }
  add(child: Component): void { this.children.push(child); }
  remove(child: Component): void { /* ... */ }
}

class Leaf implements Component {
  operation(): void { /* ... */ }
  // No add/remove — clean interface
}
```

**Pros:** Type-safe. Compile-time protection against calling `add` on a leaf.
**Cons:** Client must know whether it has a Composite to manage children.
Less uniform treatment.

### Recommendation for TypeScript

**Prefer the safety approach.** TypeScript's type system is strong enough to catch
these errors at compile time. Use type narrowing or a helper method when you need
to add children:

```typescript
function isComposite(c: Component): c is Composite {
  return "add" in c;
}
```

---

## When to Use

1. **Your object model forms a tree** — parts and wholes with arbitrary nesting
   (file systems, organization charts, UI component trees, XML/HTML DOMs).

2. **You want uniform treatment** — client code should not distinguish between
   a single element and a group of elements.

3. **Recursive operations** — you need to perform operations (render, calculate,
   search) that naturally recurse over a tree structure.

4. **Open/Closed compliance** — you want to add new leaf or composite types
   without modifying existing traversal code.

### When NOT to Use

- The structure is flat (no nesting) — a simple list suffices.
- Leaf and composite behaviors differ drastically — forcing a common interface
  becomes awkward and misleading.
- You need operations that only apply to specific node types and uniformity
  provides no benefit.

---

## Pros and Cons

### Pros

| Benefit | Description |
|---------|-------------|
| **Polymorphism** | Work with complex trees using a simple, uniform interface |
| **Open/Closed Principle** | Add new element types without breaking existing code |
| **Simplified client code** | No type-checking needed for tree traversal |
| **Recursive composition** | Naturally models part-whole hierarchies |
| **Single Responsibility** | Each node handles its own operation; composites handle delegation |

### Cons

| Drawback | Description |
|----------|-------------|
| **Over-generalized interface** | Hard to restrict operations to specific node types |
| **Type safety trade-offs** | Transparency approach sacrifices compile-time safety |
| **Complexity for simple cases** | Overkill when the structure is not deeply nested |
| **Difficult constraints** | Hard to enforce rules like "max 5 children" at the type level |

---

## Real-World Examples

### 1. File System

The classic example. Files are leaves, directories are composites.

```typescript
interface FSNode {
  getName(): string;
  getSize(): number;
  find(name: string): FSNode[];
}

class FSFile implements FSNode {
  constructor(private name: string, private size: number) {}
  getName() { return this.name; }
  getSize() { return this.size; }
  find(name: string) { return this.name.includes(name) ? [this as FSNode] : []; }
}

class Directory implements FSNode {
  private children: FSNode[] = [];
  constructor(private name: string) {}
  add(node: FSNode) { this.children.push(node); }
  getName() { return this.name; }
  getSize() { return this.children.reduce((s, c) => s + c.getSize(), 0); }
  find(name: string): FSNode[] {
    const results: FSNode[] = this.name.includes(name) ? [this] : [];
    for (const child of this.children) {
      results.push(...child.find(name));
    }
    return results;
  }
}
```

### 2. UI Component Trees

React, Angular, and Flutter all use composite-like structures. A `Container` widget
holds child widgets; each widget knows how to render itself.

```typescript
interface Widget {
  render(): string;
  getMinWidth(): number;
}

class Label implements Widget {
  constructor(private text: string) {}
  render() { return `<span>${this.text}</span>`; }
  getMinWidth() { return this.text.length * 8; }
}

class Container implements Widget {
  private children: Widget[] = [];
  add(w: Widget) { this.children.push(w); }
  render() {
    return `<div>${this.children.map(c => c.render()).join("")}</div>`;
  }
  getMinWidth() {
    return this.children.reduce((sum, c) => sum + c.getMinWidth(), 0);
  }
}
```

### 3. Organization Hierarchy

Employees are leaves; departments and divisions are composites.

```typescript
interface OrgUnit {
  getName(): string;
  getSalaryBudget(): number;
  getHeadCount(): number;
}

class Employee implements OrgUnit {
  constructor(private name: string, private salary: number) {}
  getName() { return this.name; }
  getSalaryBudget() { return this.salary; }
  getHeadCount() { return 1; }
}

class Department implements OrgUnit {
  private members: OrgUnit[] = [];
  constructor(private name: string) {}
  add(unit: OrgUnit) { this.members.push(unit); }
  getName() { return this.name; }
  getSalaryBudget() {
    return this.members.reduce((sum, m) => sum + m.getSalaryBudget(), 0);
  }
  getHeadCount() {
    return this.members.reduce((sum, m) => sum + m.getHeadCount(), 0);
  }
}
```

### 4. Menu Systems

Menu items are leaves; submenus are composites. Restaurant menus, application menus,
and navigation structures all follow this pattern.

```typescript
interface MenuComponent {
  display(indent: number): string;
  getPrice(): number;
}

class MenuItem implements MenuComponent {
  constructor(
    private name: string,
    private price: number,
    private description: string
  ) {}

  display(indent: number): string {
    const pad = " ".repeat(indent);
    return `${pad}${this.name} - $${this.price.toFixed(2)}\n${pad}  ${this.description}`;
  }

  getPrice(): number {
    return this.price;
  }
}

class SubMenu implements MenuComponent {
  private items: MenuComponent[] = [];

  constructor(private name: string) {}

  add(item: MenuComponent): void {
    this.items.push(item);
  }

  display(indent: number): string {
    const pad = " ".repeat(indent);
    const lines = [`${pad}=== ${this.name} ===`];
    for (const item of this.items) {
      lines.push(item.display(indent + 2));
    }
    return lines.join("\n");
  }

  getPrice(): number {
    return this.items.reduce((sum, item) => sum + item.getPrice(), 0);
  }
}
```

---

## Related Patterns

| Pattern | Relationship |
|---------|-------------|
| **Iterator** | Use to traverse Composite trees |
| **Visitor** | Execute operations over an entire Composite tree without modifying node classes |
| **Decorator** | Similar recursive structure, but Decorator wraps a single component; Composite aggregates many |
| **Builder** | Can construct complex Composite trees step by step |
| **Chain of Responsibility** | Leaf can pass requests up through parent composites |
| **Flyweight** | Share leaf nodes to save memory in large trees |

---

## Summary

The Composite pattern is one of the most intuitive structural patterns. Whenever you
have a **part-whole hierarchy** — where individual objects and groups of objects must
be treated uniformly — Composite is the right tool. TypeScript's interfaces and type
system make the safety approach particularly clean, giving you compile-time guarantees
while preserving the pattern's recursive elegance.

**Key takeaway:** If your data is a tree, your code should treat it like one —
and Composite gives you the interface to do exactly that.
