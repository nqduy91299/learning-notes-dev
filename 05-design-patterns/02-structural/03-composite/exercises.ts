// ============================================================================
// Composite Pattern — Exercises
// ============================================================================
// Run with: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// EXERCISE 1: Predict the Output
// ============================================================================
// What does this code print?

interface Component1 {
  getValue(): number;
}

class Leaf1 implements Component1 {
  constructor(private value: number) {}
  getValue(): number {
    return this.value;
  }
}

class Composite1 implements Component1 {
  private children: Component1[] = [];
  add(child: Component1): void {
    this.children.push(child);
  }
  getValue(): number {
    return this.children.reduce((sum, c) => sum + c.getValue(), 0);
  }
}

// const c1 = new Composite1();
// c1.add(new Leaf1(10));
// c1.add(new Leaf1(20));
// const c2 = new Composite1();
// c2.add(new Leaf1(5));
// c2.add(c1);
// console.log(c2.getValue());
// Your answer: ???


// ============================================================================
// EXERCISE 2: Predict the Output
// ============================================================================
// What does this code print?

interface Component2 {
  count(): number;
}

class Leaf2 implements Component2 {
  count(): number {
    return 1;
  }
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

// const root = new Composite2();
// const branch1 = new Composite2();
// const branch2 = new Composite2();
// branch1.add(new Leaf2()).add(new Leaf2());
// branch2.add(new Leaf2());
// root.add(branch1).add(branch2).add(new Leaf2());
// console.log(root.count());
// Your answer: ???


// ============================================================================
// EXERCISE 3: Predict the Output
// ============================================================================
// What does this code print?

interface Component3 {
  depth(): number;
}

class Leaf3 implements Component3 {
  depth(): number {
    return 0;
  }
}

class Composite3 implements Component3 {
  private children: Component3[] = [];
  add(child: Component3): void {
    this.children.push(child);
  }
  depth(): number {
    if (this.children.length === 0) return 0;
    return 1 + Math.max(...this.children.map(c => c.depth()));
  }
}

// const a = new Composite3();
// const b = new Composite3();
// const c = new Composite3();
// c.add(new Leaf3());
// b.add(c);
// a.add(b);
// a.add(new Leaf3());
// console.log(a.depth());
// Your answer: ???


// ============================================================================
// EXERCISE 4: Predict the Output
// ============================================================================
// What does this code print?

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
  add(child: Component4): void {
    this.children.push(child);
  }
  render(indent: number): string {
    const lines = ["-".repeat(indent) + this.label];
    for (const child of this.children) {
      lines.push(child.render(indent + 2));
    }
    return lines.join("\n");
  }
}

// const tree = new Composite4("A");
// tree.add(new Leaf4("B"));
// const sub = new Composite4("C");
// sub.add(new Leaf4("D"));
// tree.add(sub);
// console.log(tree.render(0));
// Your answer: ???


// ============================================================================
// EXERCISE 5: Predict the Output
// ============================================================================
// What does this code print?

interface Component5 {
  toArray(): string[];
}

class Leaf5 implements Component5 {
  constructor(private name: string) {}
  toArray(): string[] {
    return [this.name];
  }
}

class Composite5 implements Component5 {
  private children: Component5[] = [];
  constructor(private name: string) {}
  add(child: Component5): void {
    this.children.push(child);
  }
  toArray(): string[] {
    const result = [this.name];
    for (const child of this.children) {
      result.push(...child.toArray());
    }
    return result;
  }
}

// const r = new Composite5("root");
// const s = new Composite5("sub");
// s.add(new Leaf5("x"));
// s.add(new Leaf5("y"));
// r.add(s);
// r.add(new Leaf5("z"));
// console.log(r.toArray().join(","));
// Your answer: ???


// ============================================================================
// EXERCISE 6: Fix the Bug
// ============================================================================
// The remove method doesn't work correctly. Fix it.

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
    // BUG: This doesn't actually remove the child
    this.children.filter(c => c.getName() !== name);
  }

  getSize(): number {
    return this.children.reduce((sum, c) => sum + c.getSize(), 0);
  }
}

// const folder = new Folder6("docs");
// folder.add(new File6("a.txt", 100));
// folder.add(new File6("b.txt", 200));
// folder.remove("a.txt");
// console.log(folder.getSize()); // Should print 200, but prints 300


// ============================================================================
// EXERCISE 7: Fix the Bug
// ============================================================================
// The depth calculation is wrong for empty composites. Fix it.

interface Component7 {
  maxDepth(): number;
}

class Leaf7 implements Component7 {
  maxDepth(): number {
    return 1;
  }
}

class Composite7 implements Component7 {
  private children: Component7[] = [];
  add(child: Component7): void {
    this.children.push(child);
  }

  maxDepth(): number {
    // BUG: Math.max with empty spread gives -Infinity
    return 1 + Math.max(...this.children.map(c => c.maxDepth()));
  }
}

// const empty = new Composite7();
// console.log(empty.maxDepth()); // Should print 1, but prints -Infinity


// ============================================================================
// EXERCISE 8: Fix the Bug
// ============================================================================
// The display method has an off-by-one error in indentation. Fix it so the
// root starts at indent 0 and each level adds 2 spaces.

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

  add(child: Component8): void {
    this.children.push(child);
  }

  display(indent: number): string {
    const lines = [" ".repeat(indent) + this.name];
    for (const child of this.children) {
      // BUG: Should add 2 to indent, but adds 1
      lines.push(child.display(indent + 1));
    }
    return lines.join("\n");
  }
}

// const d = new Composite8("root");
// d.add(new Leaf8("child1"));
// const sub8 = new Composite8("child2");
// sub8.add(new Leaf8("grandchild"));
// d.add(sub8);
// console.log(d.display(0));
// Expected:
// root
//   child1
//   child2
//     grandchild


// ============================================================================
// EXERCISE 9: Implement — File System with Search
// ============================================================================
// Implement a file system composite with a search method that finds all
// nodes matching a predicate.

interface FSNode {
  getName(): string;
  getSize(): number;
  search(predicate: (node: FSNode) => boolean): FSNode[];
}

// TODO: Implement FSFile class (leaf)
// - constructor(name: string, size: number)

// TODO: Implement FSDirectory class (composite)
// - constructor(name: string)
// - add(node: FSNode): void
// - search should check itself AND all descendants

// const root9 = new FSDirectory("root");
// const src = new FSDirectory("src");
// src.add(new FSFile("index.ts", 500));
// src.add(new FSFile("utils.ts", 300));
// root9.add(src);
// root9.add(new FSFile("package.json", 200));
// const large = root9.search(n => n.getSize() >= 400);
// console.log(large.map(n => n.getName())); // ["root", "src", "index.ts"]
// console.log(root9.getSize()); // 1000


// ============================================================================
// EXERCISE 10: Implement — Arithmetic Expression Tree
// ============================================================================
// Build a composite that represents arithmetic expressions.
// Leaves are numbers, composites are operations (+, -, *, /).

interface Expression {
  evaluate(): number;
  toString(): string;
}

// TODO: Implement NumberLiteral class (leaf)
// - constructor(value: number)
// - evaluate() returns the value
// - toString() returns the value as string

// TODO: Implement BinaryOperation class (composite with exactly 2 children)
// - constructor(operator: "+" | "-" | "*" | "/", left: Expression, right: Expression)
// - evaluate() applies the operator
// - toString() returns "(left op right)"

// const expr = new BinaryOperation(
//   "+",
//   new NumberLiteral(3),
//   new BinaryOperation("*", new NumberLiteral(4), new NumberLiteral(5))
// );
// console.log(expr.toString());  // "(3 + (4 * 5))"
// console.log(expr.evaluate());  // 23


// ============================================================================
// EXERCISE 11: Implement — Organization Chart
// ============================================================================
// Model an organization where employees are leaves and departments are composites.

interface OrgUnit {
  getName(): string;
  getSalaryBudget(): number;
  getHeadCount(): number;
  list(indent: number): string;
}

// TODO: Implement Employee class (leaf)
// - constructor(name: string, salary: number)

// TODO: Implement Department class (composite)
// - constructor(name: string)
// - add(unit: OrgUnit): void

// const engineering = new Department("Engineering");
// engineering.add(new Employee("Alice", 120000));
// engineering.add(new Employee("Bob", 110000));
// const qa = new Department("QA");
// qa.add(new Employee("Charlie", 90000));
// engineering.add(qa);
// console.log(engineering.getHeadCount());    // 3
// console.log(engineering.getSalaryBudget()); // 320000
// console.log(engineering.list(0));


// ============================================================================
// EXERCISE 12: Implement — Menu System
// ============================================================================
// Create a restaurant menu system where items are leaves and sub-menus
// are composites.

interface MenuComponent {
  display(indent: number): string;
  getPrice(): number;
  isVegetarian(): boolean;
}

// TODO: Implement MenuItem class (leaf)
// - constructor(name: string, price: number, vegetarian: boolean)

// TODO: Implement Menu class (composite)
// - constructor(name: string)
// - add(item: MenuComponent): void
// - getPrice() returns sum of all children
// - isVegetarian() returns true only if ALL children are vegetarian

// const dinner = new Menu("Dinner");
// dinner.add(new MenuItem("Steak", 25, false));
// dinner.add(new MenuItem("Salad", 12, true));
// const desserts = new Menu("Desserts");
// desserts.add(new MenuItem("Cake", 8, true));
// desserts.add(new MenuItem("Ice Cream", 6, true));
// dinner.add(desserts);
// console.log(dinner.getPrice());        // 51
// console.log(dinner.isVegetarian());    // false
// console.log(desserts.isVegetarian());  // true


// ============================================================================
// EXERCISE 13: Implement — Permission System
// ============================================================================
// Build a permission tree where individual permissions are leaves and
// permission groups are composites.

interface Permission {
  getName(): string;
  hasPermission(name: string): boolean;
  listAll(): string[];
}

// TODO: Implement SinglePermission class (leaf)
// - constructor(name: string)
// - hasPermission returns true if name matches
// - listAll returns array with just this permission's name

// TODO: Implement PermissionGroup class (composite)
// - constructor(name: string)
// - add(permission: Permission): void
// - hasPermission checks all children recursively
// - listAll returns all permission names flattened

// const readPerm = new SinglePermission("read");
// const writePerm = new SinglePermission("write");
// const deletePerm = new SinglePermission("delete");
// const editorGroup = new PermissionGroup("editor");
// editorGroup.add(readPerm);
// editorGroup.add(writePerm);
// const adminGroup = new PermissionGroup("admin");
// adminGroup.add(editorGroup);
// adminGroup.add(deletePerm);
// console.log(adminGroup.hasPermission("write"));  // true
// console.log(adminGroup.hasPermission("execute")); // false
// console.log(adminGroup.listAll()); // ["read", "write", "delete"]


// ============================================================================
// EXERCISE 14: Implement — Task/Subtask Tracker
// ============================================================================
// A simple task is a leaf. A task group (epic) is a composite.
// Completion percentage is calculated from children.

interface Task {
  getName(): string;
  getCompletionPercentage(): number;
  getTotalTasks(): number;
  getCompletedTasks(): number;
  display(indent: number): string;
}

// TODO: Implement SimpleTask class (leaf)
// - constructor(name: string, completed: boolean)
// - getCompletionPercentage: 100 if completed, 0 otherwise
// - getTotalTasks: always 1
// - getCompletedTasks: 1 if completed, 0 otherwise

// TODO: Implement TaskGroup class (composite)
// - constructor(name: string)
// - add(task: Task): void
// - getCompletionPercentage: (completedTasks / totalTasks) * 100, or 0 if empty
// - getTotalTasks: sum of children's total tasks
// - getCompletedTasks: sum of children's completed tasks

// const sprint = new TaskGroup("Sprint 1");
// sprint.add(new SimpleTask("Setup CI", true));
// sprint.add(new SimpleTask("Write tests", true));
// sprint.add(new SimpleTask("Deploy", false));
// const bugFixes = new TaskGroup("Bug Fixes");
// bugFixes.add(new SimpleTask("Fix login", true));
// bugFixes.add(new SimpleTask("Fix crash", false));
// sprint.add(bugFixes);
// console.log(sprint.getCompletionPercentage()); // 60
// console.log(sprint.getTotalTasks());            // 5
// console.log(sprint.getCompletedTasks());        // 3


// ============================================================================
// EXERCISE 15: Implement — HTML Element Builder with Composite
// ============================================================================
// Create a composite that models HTML elements and can render them to a string.
// Void elements (like <br>, <img>) are leaves. Container elements (like <div>,
// <p>) are composites that can hold children. Text nodes are also leaves.

interface HtmlNode {
  render(indent: number): string;
}

// TODO: Implement TextNode class (leaf)
// - constructor(text: string)
// - render returns the text with proper indentation

// TODO: Implement VoidElement class (leaf)
// - constructor(tag: string, attributes: Record<string, string> = {})
// - render returns self-closing tag, e.g., <br /> or <img src="x" />

// TODO: Implement ContainerElement class (composite)
// - constructor(tag: string, attributes: Record<string, string> = {})
// - add(child: HtmlNode): void
// - render returns opening tag, children indented, closing tag

// const div = new ContainerElement("div", { class: "container" });
// const p = new ContainerElement("p");
// p.add(new TextNode("Hello, World!"));
// div.add(p);
// div.add(new VoidElement("br"));
// div.add(new VoidElement("img", { src: "photo.jpg" }));
// console.log(div.render(0));
// Expected output:
// <div class="container">
//   <p>
//     Hello, World!
//   </p>
//   <br />
//   <img src="photo.jpg" />
// </div>
