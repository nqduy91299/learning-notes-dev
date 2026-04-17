// ============================================================================
// Composite Pattern — Solutions
// ============================================================================
// Run with: npx tsx solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// SOLUTION 1: Predict the Output
// ============================================================================
// Answer: 35
// Explanation:
// c1 contains Leaf1(10) + Leaf1(20) = 30
// c2 contains Leaf1(5) + c1(30) = 35
// The composite recursively sums all children's values.

interface Component1 {
  getValue(): number;
}

class Leaf1 implements Component1 {
  constructor(private value: number) {}
  getValue(): number { return this.value; }
}

class Composite1 implements Component1 {
  private children: Component1[] = [];
  add(child: Component1): void { this.children.push(child); }
  getValue(): number {
    return this.children.reduce((sum, c) => sum + c.getValue(), 0);
  }
}

// ============================================================================
// SOLUTION 2: Predict the Output
// ============================================================================
// Answer: 4
// Explanation:
// branch1 has 2 leaves (count=2). The add() returns `this` allowing chaining.
// branch2 has 1 leaf (count=1).
// root has branch1(2) + branch2(1) + Leaf2(1) = 4.

interface Component2 {
  count(): number;
}

class Leaf2 implements Component2 {
  count(): number { return 1; }
}

class Composite2 implements Component2 {
  private children: Component2[] = [];
  add(child: Component2): this {
    this.children.push(child);
    return this;
  }
  count(): number {
    return this.children.reduce((sum, c) => sum + c.count(), 0);
  }
}

// ============================================================================
// SOLUTION 3: Predict the Output
// ============================================================================
// Answer: 3
// Explanation:
// Structure: a -> [b -> [c -> [Leaf3]], Leaf3]
// Leaf3.depth() = 0
// c.depth() = 1 + max(0) = 1
// b.depth() = 1 + max(1) = 2
// a.depth() = 1 + max(2, 0) = 3

interface Component3 {
  depth(): number;
}

class Leaf3 implements Component3 {
  depth(): number { return 0; }
}

class Composite3 implements Component3 {
  private children: Component3[] = [];
  add(child: Component3): void { this.children.push(child); }
  depth(): number {
    if (this.children.length === 0) return 0;
    return 1 + Math.max(...this.children.map(c => c.depth()));
  }
}

// ============================================================================
// SOLUTION 4: Predict the Output
// ============================================================================
// Answer:
// A
// --B
// --C
// ----D
// Explanation:
// tree.render(0): "A" at indent 0, then children at indent 2.
// Leaf4("B").render(2) = "--B"
// sub.render(2) = "--C" then sub's children at indent 4: "----D"

interface Component4 {
  render(indent: number): string;
}

class Leaf4 implements Component4 {
  constructor(private label: string) {}
  render(indent: number): string {
    return "-".repeat(indent) + this.label;
  }
}

class Composite4 implements Component4 {
  private children: Component4[] = [];
  constructor(private label: string) {}
  add(child: Component4): void { this.children.push(child); }
  render(indent: number): string {
    const lines = ["-".repeat(indent) + this.label];
    for (const child of this.children) {
      lines.push(child.render(indent + 2));
    }
    return lines.join("\n");
  }
}

// ============================================================================
// SOLUTION 5: Predict the Output
// ============================================================================
// Answer: root,sub,x,y,z
// Explanation:
// r.toArray() starts with ["root"], then spreads sub.toArray() = ["sub","x","y"],
// then spreads Leaf5("z").toArray() = ["z"].
// Result: ["root","sub","x","y","z"].join(",") = "root,sub,x,y,z"

interface Component5 {
  toArray(): string[];
}

class Leaf5 implements Component5 {
  constructor(private name: string) {}
  toArray(): string[] { return [this.name]; }
}

class Composite5 implements Component5 {
  private children: Component5[] = [];
  constructor(private name: string) {}
  add(child: Component5): void { this.children.push(child); }
  toArray(): string[] {
    const result = [this.name];
    for (const child of this.children) {
      result.push(...child.toArray());
    }
    return result;
  }
}

// ============================================================================
// SOLUTION 6: Fix the Bug
// ============================================================================
// Bug: Array.filter returns a NEW array but the result was not assigned.
// Fix: Assign the filtered array back to this.children.

interface Component6 {
  getName(): string;
  getSize(): number;
}

class File6 implements Component6 {
  constructor(private name: string, private size: number) {}
  getName(): string { return this.name; }
  getSize(): number { return this.size; }
}

class Folder6 implements Component6 {
  private children: Component6[] = [];
  constructor(private name: string) {}
  getName(): string { return this.name; }

  add(child: Component6): void {
    this.children.push(child);
  }

  remove(name: string): void {
    // FIX: assign the result back
    this.children = this.children.filter(c => c.getName() !== name);
  }

  getSize(): number {
    return this.children.reduce((sum, c) => sum + c.getSize(), 0);
  }
}

// ============================================================================
// SOLUTION 7: Fix the Bug
// ============================================================================
// Bug: Math.max(...[]) gives -Infinity when children is empty.
// Fix: Handle the empty case before spreading.

interface Component7 {
  maxDepth(): number;
}

class Leaf7 implements Component7 {
  maxDepth(): number { return 1; }
}

class Composite7 implements Component7 {
  private children: Component7[] = [];
  add(child: Component7): void { this.children.push(child); }

  maxDepth(): number {
    // FIX: return 1 when no children instead of 1 + Math.max(...[])
    if (this.children.length === 0) return 1;
    return 1 + Math.max(...this.children.map(c => c.maxDepth()));
  }
}

// ============================================================================
// SOLUTION 8: Fix the Bug
// ============================================================================
// Bug: indent + 1 should be indent + 2 for proper indentation.
// Fix: Change indent + 1 to indent + 2.

interface Component8 {
  display(indent: number): string;
}

class Leaf8 implements Component8 {
  constructor(private name: string) {}
  display(indent: number): string {
    return " ".repeat(indent) + this.name;
  }
}

class Composite8 implements Component8 {
  private children: Component8[] = [];
  constructor(private name: string) {}
  add(child: Component8): void { this.children.push(child); }

  display(indent: number): string {
    const lines = [" ".repeat(indent) + this.name];
    for (const child of this.children) {
      // FIX: indent + 2 instead of indent + 1
      lines.push(child.display(indent + 2));
    }
    return lines.join("\n");
  }
}

// ============================================================================
// SOLUTION 9: File System with Search
// ============================================================================
// The key insight is that search() must be recursive: directories check
// themselves and delegate to children.

interface FSNode {
  getName(): string;
  getSize(): number;
  search(predicate: (node: FSNode) => boolean): FSNode[];
}

class FSFile implements FSNode {
  constructor(private name: string, private size: number) {}

  getName(): string { return this.name; }
  getSize(): number { return this.size; }

  search(predicate: (node: FSNode) => boolean): FSNode[] {
    return predicate(this) ? [this] : [];
  }
}

class FSDirectory implements FSNode {
  private children: FSNode[] = [];
  constructor(private name: string) {}

  getName(): string { return this.name; }

  add(node: FSNode): void {
    this.children.push(node);
  }

  getSize(): number {
    return this.children.reduce((sum, c) => sum + c.getSize(), 0);
  }

  search(predicate: (node: FSNode) => boolean): FSNode[] {
    const results: FSNode[] = predicate(this) ? [this] : [];
    for (const child of this.children) {
      results.push(...child.search(predicate));
    }
    return results;
  }
}

// ============================================================================
// SOLUTION 10: Arithmetic Expression Tree
// ============================================================================
// This demonstrates a fixed-arity composite (always 2 children).
// The evaluate() method applies the operator to left and right results.

interface Expression {
  evaluate(): number;
  toString(): string;
}

class NumberLiteral implements Expression {
  constructor(private value: number) {}

  evaluate(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }
}

class BinaryOperation implements Expression {
  constructor(
    private operator: "+" | "-" | "*" | "/",
    private left: Expression,
    private right: Expression
  ) {}

  evaluate(): number {
    const l = this.left.evaluate();
    const r = this.right.evaluate();
    switch (this.operator) {
      case "+": return l + r;
      case "-": return l - r;
      case "*": return l * r;
      case "/": return l / r;
    }
  }

  toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right.toString()})`;
  }
}

// ============================================================================
// SOLUTION 11: Organization Chart
// ============================================================================
// Employees are leaves with a fixed headcount of 1.
// Departments aggregate headcount and salary from all nested units.

interface OrgUnit {
  getName(): string;
  getSalaryBudget(): number;
  getHeadCount(): number;
  list(indent: number): string;
}

class Employee implements OrgUnit {
  constructor(private name: string, private salary: number) {}

  getName(): string { return this.name; }
  getSalaryBudget(): number { return this.salary; }
  getHeadCount(): number { return 1; }

  list(indent: number): string {
    return " ".repeat(indent) + `${this.name} ($${this.salary})`;
  }
}

class Department implements OrgUnit {
  private members: OrgUnit[] = [];
  constructor(private name: string) {}

  getName(): string { return this.name; }

  add(unit: OrgUnit): void {
    this.members.push(unit);
  }

  getSalaryBudget(): number {
    return this.members.reduce((sum, m) => sum + m.getSalaryBudget(), 0);
  }

  getHeadCount(): number {
    return this.members.reduce((sum, m) => sum + m.getHeadCount(), 0);
  }

  list(indent: number): string {
    const lines = [" ".repeat(indent) + `[${this.name}]`];
    for (const member of this.members) {
      lines.push(member.list(indent + 2));
    }
    return lines.join("\n");
  }
}

// ============================================================================
// SOLUTION 12: Menu System
// ============================================================================
// isVegetarian on a Menu returns true only if ALL children are vegetarian.
// An empty menu is considered vegetarian (vacuous truth).

interface MenuComponent {
  display(indent: number): string;
  getPrice(): number;
  isVegetarian(): boolean;
}

class MenuItem implements MenuComponent {
  constructor(
    private name: string,
    private price: number,
    private vegetarian: boolean
  ) {}

  display(indent: number): string {
    const pad = " ".repeat(indent);
    const veg = this.vegetarian ? " (V)" : "";
    return `${pad}${this.name} - $${this.price.toFixed(2)}${veg}`;
  }

  getPrice(): number { return this.price; }
  isVegetarian(): boolean { return this.vegetarian; }
}

class Menu implements MenuComponent {
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

  isVegetarian(): boolean {
    return this.items.every(item => item.isVegetarian());
  }
}

// ============================================================================
// SOLUTION 13: Permission System
// ============================================================================
// hasPermission does a recursive search through the tree.
// listAll flattens all leaf permission names.

interface Permission {
  getName(): string;
  hasPermission(name: string): boolean;
  listAll(): string[];
}

class SinglePermission implements Permission {
  constructor(private name: string) {}

  getName(): string { return this.name; }

  hasPermission(name: string): boolean {
    return this.name === name;
  }

  listAll(): string[] {
    return [this.name];
  }
}

class PermissionGroup implements Permission {
  private children: Permission[] = [];
  constructor(private name: string) {}

  getName(): string { return this.name; }

  add(permission: Permission): void {
    this.children.push(permission);
  }

  hasPermission(name: string): boolean {
    return this.children.some(c => c.hasPermission(name));
  }

  listAll(): string[] {
    const result: string[] = [];
    for (const child of this.children) {
      result.push(...child.listAll());
    }
    return result;
  }
}

// ============================================================================
// SOLUTION 14: Task/Subtask Tracker
// ============================================================================
// Completion percentage is calculated from the ratio of completed tasks
// to total tasks across the entire tree.

interface Task {
  getName(): string;
  getCompletionPercentage(): number;
  getTotalTasks(): number;
  getCompletedTasks(): number;
  display(indent: number): string;
}

class SimpleTask implements Task {
  constructor(private name: string, private completed: boolean) {}

  getName(): string { return this.name; }

  getCompletionPercentage(): number {
    return this.completed ? 100 : 0;
  }

  getTotalTasks(): number { return 1; }

  getCompletedTasks(): number {
    return this.completed ? 1 : 0;
  }

  display(indent: number): string {
    const marker = this.completed ? "[x]" : "[ ]";
    return " ".repeat(indent) + `${marker} ${this.name}`;
  }
}

class TaskGroup implements Task {
  private tasks: Task[] = [];
  constructor(private name: string) {}

  getName(): string { return this.name; }

  add(task: Task): void {
    this.tasks.push(task);
  }

  getTotalTasks(): number {
    return this.tasks.reduce((sum, t) => sum + t.getTotalTasks(), 0);
  }

  getCompletedTasks(): number {
    return this.tasks.reduce((sum, t) => sum + t.getCompletedTasks(), 0);
  }

  getCompletionPercentage(): number {
    const total = this.getTotalTasks();
    if (total === 0) return 0;
    return (this.getCompletedTasks() / total) * 100;
  }

  display(indent: number): string {
    const pct = this.getCompletionPercentage().toFixed(0);
    const lines = [" ".repeat(indent) + `${this.name} (${pct}%)`];
    for (const task of this.tasks) {
      lines.push(task.display(indent + 2));
    }
    return lines.join("\n");
  }
}

// ============================================================================
// SOLUTION 15: HTML Element Builder with Composite
// ============================================================================
// Three node types: TextNode (leaf), VoidElement (leaf), ContainerElement (composite).
// Attributes are rendered as key="value" pairs.

interface HtmlNode {
  render(indent: number): string;
}

class TextNode implements HtmlNode {
  constructor(private text: string) {}

  render(indent: number): string {
    return " ".repeat(indent) + this.text;
  }
}

class VoidElement implements HtmlNode {
  constructor(
    private tag: string,
    private attributes: Record<string, string> = {}
  ) {}

  render(indent: number): string {
    const pad = " ".repeat(indent);
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");
    return `${pad}<${this.tag}${attrs} />`;
  }
}

class ContainerElement implements HtmlNode {
  private children: HtmlNode[] = [];

  constructor(
    private tag: string,
    private attributes: Record<string, string> = {}
  ) {}

  add(child: HtmlNode): void {
    this.children.push(child);
  }

  render(indent: number): string {
    const pad = " ".repeat(indent);
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");
    const lines = [`${pad}<${this.tag}${attrs}>`];
    for (const child of this.children) {
      lines.push(child.render(indent + 2));
    }
    lines.push(`${pad}</${this.tag}>`);
    return lines.join("\n");
  }
}


// ============================================================================
// Runner — Verify all solutions
// ============================================================================

console.log("=== Exercise 1 ===");
const c1 = new Composite1();
c1.add(new Leaf1(10));
c1.add(new Leaf1(20));
const c2 = new Composite1();
c2.add(new Leaf1(5));
c2.add(c1);
console.log(c2.getValue()); // 35

console.log("\n=== Exercise 2 ===");
const root2 = new Composite2();
const branch1 = new Composite2();
const branch2 = new Composite2();
branch1.add(new Leaf2()).add(new Leaf2());
branch2.add(new Leaf2());
root2.add(branch1).add(branch2).add(new Leaf2());
console.log(root2.count()); // 4

console.log("\n=== Exercise 3 ===");
const a3 = new Composite3();
const b3 = new Composite3();
const c3 = new Composite3();
c3.add(new Leaf3());
b3.add(c3);
a3.add(b3);
a3.add(new Leaf3());
console.log(a3.depth()); // 3

console.log("\n=== Exercise 4 ===");
const tree4 = new Composite4("A");
tree4.add(new Leaf4("B"));
const sub4 = new Composite4("C");
sub4.add(new Leaf4("D"));
tree4.add(sub4);
console.log(tree4.render(0));
// A
// --B
// --C
// ----D

console.log("\n=== Exercise 5 ===");
const r5 = new Composite5("root");
const s5 = new Composite5("sub");
s5.add(new Leaf5("x"));
s5.add(new Leaf5("y"));
r5.add(s5);
r5.add(new Leaf5("z"));
console.log(r5.toArray().join(",")); // root,sub,x,y,z

console.log("\n=== Exercise 6 ===");
const folder6 = new Folder6("docs");
folder6.add(new File6("a.txt", 100));
folder6.add(new File6("b.txt", 200));
folder6.remove("a.txt");
console.log(folder6.getSize()); // 200

console.log("\n=== Exercise 7 ===");
const empty7 = new Composite7();
console.log(empty7.maxDepth()); // 1

console.log("\n=== Exercise 8 ===");
const d8 = new Composite8("root");
d8.add(new Leaf8("child1"));
const sub8 = new Composite8("child2");
sub8.add(new Leaf8("grandchild"));
d8.add(sub8);
console.log(d8.display(0));

console.log("\n=== Exercise 9 ===");
const root9 = new FSDirectory("root");
const src9 = new FSDirectory("src");
src9.add(new FSFile("index.ts", 500));
src9.add(new FSFile("utils.ts", 300));
root9.add(src9);
root9.add(new FSFile("package.json", 200));
const large = root9.search(n => n.getSize() >= 400);
console.log(large.map(n => n.getName())); // ["root", "src", "index.ts"]
console.log(root9.getSize()); // 1000

console.log("\n=== Exercise 10 ===");
const expr = new BinaryOperation(
  "+",
  new NumberLiteral(3),
  new BinaryOperation("*", new NumberLiteral(4), new NumberLiteral(5))
);
console.log(expr.toString());  // (3 + (4 * 5))
console.log(expr.evaluate());  // 23

console.log("\n=== Exercise 11 ===");
const engineering = new Department("Engineering");
engineering.add(new Employee("Alice", 120000));
engineering.add(new Employee("Bob", 110000));
const qa = new Department("QA");
qa.add(new Employee("Charlie", 90000));
engineering.add(qa);
console.log(engineering.getHeadCount());    // 3
console.log(engineering.getSalaryBudget()); // 320000
console.log(engineering.list(0));

console.log("\n=== Exercise 12 ===");
const dinner = new Menu("Dinner");
dinner.add(new MenuItem("Steak", 25, false));
dinner.add(new MenuItem("Salad", 12, true));
const desserts = new Menu("Desserts");
desserts.add(new MenuItem("Cake", 8, true));
desserts.add(new MenuItem("Ice Cream", 6, true));
dinner.add(desserts);
console.log(dinner.getPrice());        // 51
console.log(dinner.isVegetarian());    // false
console.log(desserts.isVegetarian());  // true
console.log(dinner.display(0));

console.log("\n=== Exercise 13 ===");
const readPerm = new SinglePermission("read");
const writePerm = new SinglePermission("write");
const deletePerm = new SinglePermission("delete");
const editorGroup = new PermissionGroup("editor");
editorGroup.add(readPerm);
editorGroup.add(writePerm);
const adminGroup = new PermissionGroup("admin");
adminGroup.add(editorGroup);
adminGroup.add(deletePerm);
console.log(adminGroup.hasPermission("write"));   // true
console.log(adminGroup.hasPermission("execute"));  // false
console.log(adminGroup.listAll()); // ["read", "write", "delete"]

console.log("\n=== Exercise 14 ===");
const sprint = new TaskGroup("Sprint 1");
sprint.add(new SimpleTask("Setup CI", true));
sprint.add(new SimpleTask("Write tests", true));
sprint.add(new SimpleTask("Deploy", false));
const bugFixes = new TaskGroup("Bug Fixes");
bugFixes.add(new SimpleTask("Fix login", true));
bugFixes.add(new SimpleTask("Fix crash", false));
sprint.add(bugFixes);
console.log(sprint.getCompletionPercentage()); // 60
console.log(sprint.getTotalTasks());            // 5
console.log(sprint.getCompletedTasks());        // 3
console.log(sprint.display(0));

console.log("\n=== Exercise 15 ===");
const div = new ContainerElement("div", { class: "container" });
const p = new ContainerElement("p");
p.add(new TextNode("Hello, World!"));
div.add(p);
div.add(new VoidElement("br"));
div.add(new VoidElement("img", { src: "photo.jpg" }));
console.log(div.render(0));
