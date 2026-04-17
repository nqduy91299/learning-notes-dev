// ============================================================================
// Prototype Pattern - Exercises
// ============================================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// EXERCISE 1: Predict the Output (Shallow Copy Behavior)
// ============================================================================
// What does the following code print? Think about shallow vs deep copy.

interface Cloneable<T> {
  clone(): T;
}

class UserProfile implements Cloneable<UserProfile> {
  constructor(
    public name: string,
    public preferences: string[]
  ) {}

  clone(): UserProfile {
    return new UserProfile(this.name, this.preferences);
  }
}

function exercise1(): void {
  const original = new UserProfile("Alice", ["dark-mode", "compact"]);
  const copy = original.clone();
  copy.name = "Bob";
  copy.preferences.push("notifications");

  console.log(original.name);
  console.log(original.preferences.length);
  console.log(copy.name);
  console.log(copy.preferences.length);
}

// Predict the output before running:
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// exercise1();


// ============================================================================
// EXERCISE 2: Predict the Output (Prototype Chain with Object.create)
// ============================================================================
// What does the following code print?

function exercise2(): void {
  const baseConfig = {
    host: "localhost",
    port: 3000,
    features: ["auth"],
  };

  const devConfig = Object.create(baseConfig) as typeof baseConfig;
  devConfig.port = 8080;
  devConfig.features.push("debug");

  console.log(baseConfig.port);
  console.log(devConfig.port);
  console.log(baseConfig.features.join(","));
  console.log(devConfig.hasOwnProperty("host"));
}

// Predict the output before running:
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// exercise2();


// ============================================================================
// EXERCISE 3: Predict the Output (structuredClone Behavior)
// ============================================================================
// What does the following code print?

function exercise3(): void {
  const data = {
    name: "settings",
    nested: { value: 42, items: [1, 2, 3] },
    created: new Date("2024-01-01"),
  };

  const copy = structuredClone(data);
  copy.nested.value = 99;
  copy.nested.items.push(4);
  copy.name = "copy-settings";

  console.log(data.nested.value);
  console.log(data.nested.items.length);
  console.log(data.name);
  console.log(copy.created instanceof Date);
}

// Predict the output before running:
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// exercise3();


// ============================================================================
// EXERCISE 4: Predict the Output (Clone Independence)
// ============================================================================
// What does the following code print?

class TreeNode implements Cloneable<TreeNode> {
  children: TreeNode[] = [];

  constructor(public value: string) {}

  addChild(child: TreeNode): void {
    this.children.push(child);
  }

  clone(): TreeNode {
    const copy = new TreeNode(this.value);
    copy.children = this.children.map(c => c.clone());
    return copy;
  }
}

function exercise4(): void {
  const root = new TreeNode("root");
  root.addChild(new TreeNode("A"));
  root.addChild(new TreeNode("B"));

  const clonedRoot = root.clone();
  clonedRoot.value = "clone-root";
  clonedRoot.children[0].value = "X";
  clonedRoot.addChild(new TreeNode("C"));

  console.log(root.value);
  console.log(root.children[0].value);
  console.log(root.children.length);
  console.log(clonedRoot.children.length);
}

// Predict the output before running:
// Line 1: ???
// Line 2: ???
// Line 3: ???
// Line 4: ???

// exercise4();


// ============================================================================
// EXERCISE 5: Fix the Bug (Shared State After Clone)
// ============================================================================
// The clone is supposed to be independent but modifications to the clone
// affect the original. Fix the clone() method.

class Inventory implements Cloneable<Inventory> {
  constructor(
    public owner: string,
    public items: { name: string; quantity: number }[]
  ) {}

  clone(): Inventory {
    // BUG: Fix this clone method
    return new Inventory(this.owner, this.items);
  }

  addItem(name: string, quantity: number): void {
    this.items.push({ name, quantity });
  }

  toString(): string {
    return `${this.owner}: ${this.items.map(i => `${i.name}(${i.quantity})`).join(", ")}`;
  }
}

function exercise5(): void {
  const shop = new Inventory("Shop", [
    { name: "sword", quantity: 5 },
    { name: "shield", quantity: 3 },
  ]);

  const playerInv = shop.clone();
  playerInv.owner = "Player";
  playerInv.items[0].quantity = 1;
  playerInv.addItem("potion", 10);

  // Expected: Shop should be unmodified
  console.log(shop.toString());
  // Expected: "Shop: sword(5), shield(3)"
  console.log(playerInv.toString());
  // Expected: "Player: sword(1), shield(3), potion(10)"
}

// exercise5();


// ============================================================================
// EXERCISE 6: Fix the Bug (Registry Returns Same Instance)
// ============================================================================
// The registry is supposed to return clones but it returns the same instance.
// Fix the PrototypeRegistry class.

interface GameUnit extends Cloneable<GameUnit> {
  name: string;
  health: number;
  describe(): string;
}

class Warrior implements GameUnit {
  constructor(
    public name: string,
    public health: number,
    public attack: number
  ) {}

  clone(): Warrior {
    return new Warrior(this.name, this.health, this.attack);
  }

  describe(): string {
    return `${this.name} [HP:${this.health} ATK:${this.attack}]`;
  }
}

class PrototypeRegistry {
  private prototypes = new Map<string, GameUnit>();

  register(key: string, prototype: GameUnit): void {
    this.prototypes.set(key, prototype);
  }

  create(key: string): GameUnit {
    const proto = this.prototypes.get(key);
    if (!proto) throw new Error(`Unknown: ${key}`);
    // BUG: Fix this line so it returns a clone, not the original
    return proto;
  }
}

function exercise6(): void {
  const registry = new PrototypeRegistry();
  registry.register("warrior", new Warrior("Warrior", 100, 25));

  const w1 = registry.create("warrior");
  w1.name = "Thorin";
  w1.health = 150;

  const w2 = registry.create("warrior");

  // Expected: w2 should be a fresh clone from the original prototype
  console.log(w1.describe()); // "Thorin [HP:150 ATK:25]"
  console.log(w2.describe()); // "Warrior [HP:100 ATK:25]"
  console.log(w1 === w2);     // false
}

// exercise6();


// ============================================================================
// EXERCISE 7: Implement - Basic Shape Prototype
// ============================================================================
// Implement clone() for Circle and Rectangle. Both must produce deep copies.

interface ShapePrototype extends Cloneable<ShapePrototype> {
  readonly type: string;
  x: number;
  y: number;
  area(): number;
  describe(): string;
}

class Circle implements ShapePrototype {
  readonly type = "circle" as const;

  constructor(
    public x: number,
    public y: number,
    public radius: number
  ) {}

  area(): number {
    return Math.PI * this.radius * this.radius;
  }

  describe(): string {
    return `Circle(${this.x},${this.y} r=${this.radius})`;
  }

  clone(): Circle {
    // TODO: Implement deep clone
    throw new Error("Not implemented");
  }
}

class RectangleShape implements ShapePrototype {
  readonly type = "rectangle" as const;

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  area(): number {
    return this.width * this.height;
  }

  describe(): string {
    return `Rect(${this.x},${this.y} ${this.width}x${this.height})`;
  }

  clone(): RectangleShape {
    // TODO: Implement deep clone
    throw new Error("Not implemented");
  }
}

function exercise7(): void {
  const circle = new Circle(10, 20, 5);
  const clonedCircle = circle.clone();
  clonedCircle.x = 50;

  console.log(circle.describe());       // Circle(10,20 r=5)
  console.log(clonedCircle.describe()); // Circle(50,20 r=5)

  const rect = new RectangleShape(0, 0, 100, 50);
  const clonedRect = rect.clone();
  clonedRect.width = 200;

  console.log(rect.describe());       // Rect(0,0 100x50)
  console.log(clonedRect.describe()); // Rect(0,0 200x50)
}

// exercise7();


// ============================================================================
// EXERCISE 8: Implement - Deep Clone with Nested Objects
// ============================================================================
// Implement clone() for GameCharacter. Must deep-clone stats and inventory.

interface Stats {
  strength: number;
  agility: number;
  intelligence: number;
}

interface InventoryItem {
  name: string;
  weight: number;
  enchantments: string[];
}

class GameCharacter implements Cloneable<GameCharacter> {
  constructor(
    public name: string,
    public level: number,
    public stats: Stats,
    public inventory: InventoryItem[]
  ) {}

  clone(): GameCharacter {
    // TODO: Implement deep clone
    // - stats must be a new object
    // - inventory must be a new array with new item objects
    // - enchantments within each item must be new arrays
    throw new Error("Not implemented");
  }

  toString(): string {
    const inv = this.inventory.map(i => i.name).join(", ");
    return `${this.name} Lv${this.level} STR:${this.stats.strength} [${inv}]`;
  }
}

function exercise8(): void {
  const template = new GameCharacter("Hero", 1, {
    strength: 10,
    agility: 10,
    intelligence: 10,
  }, [
    { name: "Iron Sword", weight: 5, enchantments: ["fire"] },
    { name: "Leather Armor", weight: 8, enchantments: [] },
  ]);

  const player = template.clone();
  player.name = "Arthas";
  player.level = 5;
  player.stats.strength = 20;
  player.inventory[0].enchantments.push("frost");
  player.inventory.push({ name: "Shield", weight: 10, enchantments: [] });

  // Verify independence
  console.log(template.toString());
  // Expected: "Hero Lv1 STR:10 [Iron Sword, Leather Armor]"
  console.log(player.toString());
  // Expected: "Arthas Lv5 STR:20 [Iron Sword, Leather Armor, Shield]"
  console.log(template.inventory[0].enchantments.join(","));
  // Expected: "fire"
  console.log(player.inventory[0].enchantments.join(","));
  // Expected: "fire,frost"
}

// exercise8();


// ============================================================================
// EXERCISE 9: Implement - Prototype Registry with Factory
// ============================================================================
// Implement a DocumentRegistry that stores document templates and creates
// new documents by cloning templates.

interface Section {
  title: string;
  content: string;
}

class DocumentTemplate implements Cloneable<DocumentTemplate> {
  constructor(
    public name: string,
    public sections: Section[],
    public metadata: Map<string, string>
  ) {}

  clone(): DocumentTemplate {
    // TODO: Implement deep clone
    // - sections must be new array with new objects
    // - metadata must be a new Map
    throw new Error("Not implemented");
  }

  addSection(title: string, content: string): void {
    this.sections.push({ title, content });
  }

  toString(): string {
    const secs = this.sections.map(s => s.title).join(", ");
    return `[${this.name}] sections: ${secs}`;
  }
}

class DocumentRegistry {
  // TODO: Implement the registry
  // - register(key: string, template: DocumentTemplate): void
  // - create(key: string): DocumentTemplate  (returns a clone)
  // - list(): string[]  (returns registered keys)

  register(_key: string, _template: DocumentTemplate): void {
    throw new Error("Not implemented");
  }

  create(_key: string): DocumentTemplate {
    throw new Error("Not implemented");
  }

  list(): string[] {
    throw new Error("Not implemented");
  }
}

function exercise9(): void {
  const registry = new DocumentRegistry();

  const report = new DocumentTemplate("Quarterly Report", [
    { title: "Summary", content: "" },
    { title: "Financials", content: "" },
    { title: "Outlook", content: "" },
  ], new Map([["author", ""], ["department", ""]]));

  const memo = new DocumentTemplate("Internal Memo", [
    { title: "Subject", content: "" },
    { title: "Body", content: "" },
  ], new Map([["priority", "normal"]]));

  registry.register("report", report);
  registry.register("memo", memo);

  const myReport = registry.create("report");
  myReport.name = "Q4 2024 Report";
  myReport.sections[0].content = "Excellent quarter...";
  myReport.metadata.set("author", "Jane");

  const anotherReport = registry.create("report");

  console.log(myReport.toString());
  // Expected: "[Q4 2024 Report] sections: Summary, Financials, Outlook"
  console.log(anotherReport.name);
  // Expected: "Quarterly Report" (original template name)
  console.log(anotherReport.sections[0].content);
  // Expected: "" (empty, not "Excellent quarter...")
  console.log(registry.list().join(", "));
  // Expected: "report, memo"
}

// exercise9();


// ============================================================================
// EXERCISE 10: Implement - Configurable Clone (Partial Override)
// ============================================================================
// Implement a cloneWith() method that clones and applies partial overrides.

interface ServerConfig {
  host: string;
  port: number;
  ssl: boolean;
  timeout: number;
  headers: Record<string, string>;
}

class ApiEndpoint implements Cloneable<ApiEndpoint> {
  constructor(
    public name: string,
    public config: ServerConfig
  ) {}

  clone(): ApiEndpoint {
    return new ApiEndpoint(this.name, {
      ...this.config,
      headers: { ...this.config.headers },
    });
  }

  // TODO: Implement cloneWith that accepts partial overrides
  // It should deep clone first, then apply the overrides.
  // Nested headers should be merged, not replaced.
  cloneWith(overrides: {
    name?: string;
    config?: Partial<Omit<ServerConfig, "headers">> & {
      headers?: Record<string, string>;
    };
  }): ApiEndpoint {
    throw new Error("Not implemented");
  }

  toString(): string {
    const h = Object.entries(this.config.headers)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    return `${this.name} -> ${this.config.host}:${this.config.port} ssl=${this.config.ssl} [${h}]`;
  }
}

function exercise10(): void {
  const baseApi = new ApiEndpoint("base", {
    host: "api.example.com",
    port: 443,
    ssl: true,
    timeout: 5000,
    headers: { "Content-Type": "application/json", "X-Api-Key": "abc123" },
  });

  const internalApi = baseApi.cloneWith({
    name: "internal",
    config: { host: "internal.local", port: 8080, ssl: false },
  });

  const debugApi = baseApi.cloneWith({
    name: "debug",
    config: { headers: { "X-Debug": "true" } },
  });

  console.log(baseApi.toString());
  console.log(internalApi.toString());
  console.log(debugApi.toString());
  // debugApi should have BOTH original headers AND X-Debug
}

// exercise10();


// ============================================================================
// EXERCISE 11: Implement - Prototype with Versioning
// ============================================================================
// Implement a VersionedConfig that tracks clone generations.
// Each clone increments the version number.

class VersionedConfig implements Cloneable<VersionedConfig> {
  private _version: number;

  constructor(
    public name: string,
    public settings: Map<string, string>,
    version: number = 0
  ) {
    this._version = version;
  }

  get version(): number {
    return this._version;
  }

  clone(): VersionedConfig {
    // TODO: Implement clone that:
    // 1. Deep copies settings Map
    // 2. Increments version by 1
    throw new Error("Not implemented");
  }

  set(key: string, value: string): void {
    this.settings.set(key, value);
  }

  toString(): string {
    const entries = [...this.settings.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    return `v${this._version} ${this.name}: {${entries}}`;
  }
}

function exercise11(): void {
  const v0 = new VersionedConfig("app", new Map([
    ["theme", "light"],
    ["lang", "en"],
  ]));

  const v1 = v0.clone();
  v1.set("theme", "dark");

  const v2 = v1.clone();
  v2.set("lang", "fr");
  v2.name = "app-fr";

  console.log(v0.toString()); // "v0 app: {theme=light, lang=en}"
  console.log(v1.toString()); // "v1 app: {theme=dark, lang=en}"
  console.log(v2.toString()); // "v2 app-fr: {theme=dark, lang=fr}"
  console.log(v0.version);   // 0
  console.log(v2.version);   // 2
}

// exercise11();


// ============================================================================
// EXERCISE 12: Implement - Composite Prototype (Clone a Tree)
// ============================================================================
// Implement clone() for a file system tree. Both File and Directory must
// support deep cloning. A Directory's clone must recursively clone children.

interface FSNode extends Cloneable<FSNode> {
  name: string;
  size(): number;
  print(indent?: string): string;
}

class File implements FSNode {
  constructor(
    public name: string,
    private bytes: number
  ) {}

  size(): number {
    return this.bytes;
  }

  print(indent: string = ""): string {
    return `${indent}${this.name} (${this.bytes}b)`;
  }

  clone(): File {
    // TODO: Implement
    throw new Error("Not implemented");
  }
}

class Directory implements FSNode {
  private children: FSNode[] = [];

  constructor(public name: string) {}

  add(child: FSNode): void {
    this.children.push(child);
  }

  size(): number {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }

  print(indent: string = ""): string {
    const lines = [`${indent}${this.name}/`];
    for (const child of this.children) {
      lines.push(child.print(indent + "  "));
    }
    return lines.join("\n");
  }

  clone(): Directory {
    // TODO: Implement deep clone
    // Must recursively clone all children
    throw new Error("Not implemented");
  }

  getChildren(): readonly FSNode[] {
    return this.children;
  }
}

function exercise12(): void {
  const root = new Directory("project");
  const src = new Directory("src");
  src.add(new File("index.ts", 1024));
  src.add(new File("utils.ts", 512));
  const lib = new Directory("lib");
  lib.add(new File("helper.ts", 256));
  src.add(lib);
  root.add(src);
  root.add(new File("package.json", 128));

  const backup = root.clone();
  backup.name = "project-backup";

  // Modify original - should not affect backup
  src.add(new File("new-file.ts", 100));

  console.log(root.print());
  console.log("---");
  console.log(backup.print());
  console.log(`Original size: ${root.size()}`);
  console.log(`Backup size: ${backup.size()}`);
  // Backup size should be less because it doesn't have new-file.ts
}

// exercise12();
