// ============================================================================
// Prototype Pattern - Solutions
// ============================================================================
// Config: ES2022, strict mode, ESNext modules
// Run with: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// Shared interfaces (duplicated from exercises for standalone execution)
// ============================================================================

interface Cloneable<T> {
  clone(): T;
}

// ============================================================================
// SOLUTION 1: Predict the Output (Shallow Copy Behavior)
// ============================================================================
// Answer:
//   Line 1: "Alice"
//   Line 2: 3
//   Line 3: "Bob"
//   Line 4: 3
//
// Explanation:
// The clone() creates a new UserProfile but passes the SAME preferences array
// reference. Changing copy.name = "Bob" only affects the copy (strings are
// immutable primitives). But copy.preferences.push("notifications") mutates
// the shared array, so original.preferences.length becomes 3.

class UserProfile implements Cloneable<UserProfile> {
  constructor(
    public name: string,
    public preferences: string[]
  ) {}

  clone(): UserProfile {
    // This is a SHALLOW clone - preferences array is shared
    return new UserProfile(this.name, this.preferences);
  }
}

function solution1(): void {
  console.log("=== Solution 1: Shallow Copy Behavior ===");
  const original = new UserProfile("Alice", ["dark-mode", "compact"]);
  const copy = original.clone();
  copy.name = "Bob";
  copy.preferences.push("notifications");

  console.log(original.name);              // "Alice"
  console.log(original.preferences.length); // 3 (shared array was mutated!)
  console.log(copy.name);                  // "Bob"
  console.log(copy.preferences.length);    // 3
}

// ============================================================================
// SOLUTION 2: Predict the Output (Prototype Chain with Object.create)
// ============================================================================
// Answer:
//   Line 1: 3000
//   Line 2: 8080
//   Line 3: "auth,debug"
//   Line 4: false
//
// Explanation:
// Object.create() sets up prototype delegation, NOT copying.
// - devConfig.port = 8080 creates an OWN property on devConfig; baseConfig.port
//   is unchanged (3000).
// - devConfig.features.push("debug") does NOT create a new array on devConfig.
//   It finds features via the prototype chain on baseConfig and mutates it.
//   So baseConfig.features now has ["auth", "debug"].
// - devConfig.hasOwnProperty("host") is false because "host" lives on
//   baseConfig (the prototype), not on devConfig itself.

function solution2(): void {
  console.log("\n=== Solution 2: Object.create Prototype Chain ===");
  const baseConfig = {
    host: "localhost",
    port: 3000,
    features: ["auth"],
  };

  const devConfig = Object.create(baseConfig) as typeof baseConfig;
  devConfig.port = 8080;
  devConfig.features.push("debug");

  console.log(baseConfig.port);                  // 3000
  console.log(devConfig.port);                   // 8080
  console.log(baseConfig.features.join(","));    // "auth,debug"
  console.log(devConfig.hasOwnProperty("host")); // false
}

// ============================================================================
// SOLUTION 3: Predict the Output (structuredClone Behavior)
// ============================================================================
// Answer:
//   Line 1: 42
//   Line 2: 3
//   Line 3: "settings"
//   Line 4: true
//
// Explanation:
// structuredClone() performs a DEEP copy. All nested objects are independent.
// - copy.nested.value = 99 does not affect data.nested.value (still 42).
// - copy.nested.items.push(4) does not affect data.nested.items (still length 3).
// - copy.name = "copy-settings" does not affect data.name (still "settings").
// - Date objects are properly cloned by structuredClone, so copy.created
//   is a new Date instance (instanceof Date is true).

function solution3(): void {
  console.log("\n=== Solution 3: structuredClone Behavior ===");
  const data = {
    name: "settings",
    nested: { value: 42, items: [1, 2, 3] },
    created: new Date("2024-01-01"),
  };

  const copy = structuredClone(data);
  copy.nested.value = 99;
  copy.nested.items.push(4);
  copy.name = "copy-settings";

  console.log(data.nested.value);          // 42
  console.log(data.nested.items.length);   // 3
  console.log(data.name);                  // "settings"
  console.log(copy.created instanceof Date); // true
}

// ============================================================================
// SOLUTION 4: Predict the Output (Clone Independence)
// ============================================================================
// Answer:
//   Line 1: "root"
//   Line 2: "A"
//   Line 3: 2
//   Line 4: 3
//
// Explanation:
// TreeNode.clone() does a DEEP recursive clone: each child is also cloned.
// - clonedRoot.value = "clone-root" only affects the clone (root.value = "root").
// - clonedRoot.children[0].value = "X" only affects the cloned child
//   (root.children[0].value = "A").
// - clonedRoot.addChild(...) only adds to the clone's children array.
//   root.children.length remains 2, clonedRoot has 3.

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

function solution4(): void {
  console.log("\n=== Solution 4: Deep Clone Independence ===");
  const root = new TreeNode("root");
  root.addChild(new TreeNode("A"));
  root.addChild(new TreeNode("B"));

  const clonedRoot = root.clone();
  clonedRoot.value = "clone-root";
  clonedRoot.children[0].value = "X";
  clonedRoot.addChild(new TreeNode("C"));

  console.log(root.value);             // "root"
  console.log(root.children[0].value); // "A"
  console.log(root.children.length);   // 2
  console.log(clonedRoot.children.length); // 3
}

// ============================================================================
// SOLUTION 5: Fix the Bug (Shared State After Clone)
// ============================================================================
// Bug: The clone shares the same items array AND the same item objects.
// Fix: Deep copy the array and each item object.

class Inventory implements Cloneable<Inventory> {
  constructor(
    public owner: string,
    public items: { name: string; quantity: number }[]
  ) {}

  clone(): Inventory {
    // FIX: Deep copy items array and each item object
    return new Inventory(
      this.owner,
      this.items.map(item => ({ ...item }))
    );
  }

  addItem(name: string, quantity: number): void {
    this.items.push({ name, quantity });
  }

  toString(): string {
    return `${this.owner}: ${this.items.map(i => `${i.name}(${i.quantity})`).join(", ")}`;
  }
}

function solution5(): void {
  console.log("\n=== Solution 5: Fix Shared State ===");
  const shop = new Inventory("Shop", [
    { name: "sword", quantity: 5 },
    { name: "shield", quantity: 3 },
  ]);

  const playerInv = shop.clone();
  playerInv.owner = "Player";
  playerInv.items[0].quantity = 1;
  playerInv.addItem("potion", 10);

  console.log(shop.toString());
  // "Shop: sword(5), shield(3)"
  console.log(playerInv.toString());
  // "Player: sword(1), shield(3), potion(10)"
}

// ============================================================================
// SOLUTION 6: Fix the Bug (Registry Returns Same Instance)
// ============================================================================
// Bug: create() returns proto directly instead of proto.clone().
// Fix: Call clone() on the stored prototype.

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
    // FIX: Return a clone, not the original prototype
    return proto.clone();
  }
}

function solution6(): void {
  console.log("\n=== Solution 6: Fix Registry ===");
  const registry = new PrototypeRegistry();
  registry.register("warrior", new Warrior("Warrior", 100, 25));

  const w1 = registry.create("warrior");
  w1.name = "Thorin";
  w1.health = 150;

  const w2 = registry.create("warrior");

  console.log(w1.describe()); // "Thorin [HP:150 ATK:25]"
  console.log(w2.describe()); // "Warrior [HP:100 ATK:25]"
  console.log(w1 === w2);     // false
}

// ============================================================================
// SOLUTION 7: Implement - Basic Shape Prototype
// ============================================================================
// Simple value-type fields only, so clone just passes constructor args.

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
    return new Circle(this.x, this.y, this.radius);
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
    return new RectangleShape(this.x, this.y, this.width, this.height);
  }
}

function solution7(): void {
  console.log("\n=== Solution 7: Shape Prototypes ===");
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

// ============================================================================
// SOLUTION 8: Implement - Deep Clone with Nested Objects
// ============================================================================
// Must deep-copy stats object, inventory array, and each item's enchantments.

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
    return new GameCharacter(
      this.name,
      this.level,
      { ...this.stats },
      this.inventory.map(item => ({
        name: item.name,
        weight: item.weight,
        enchantments: [...item.enchantments],
      }))
    );
  }

  toString(): string {
    const inv = this.inventory.map(i => i.name).join(", ");
    return `${this.name} Lv${this.level} STR:${this.stats.strength} [${inv}]`;
  }
}

function solution8(): void {
  console.log("\n=== Solution 8: Deep Clone Nested Objects ===");
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

  console.log(template.toString());
  // "Hero Lv1 STR:10 [Iron Sword, Leather Armor]"
  console.log(player.toString());
  // "Arthas Lv5 STR:20 [Iron Sword, Leather Armor, Shield]"
  console.log(template.inventory[0].enchantments.join(","));
  // "fire"
  console.log(player.inventory[0].enchantments.join(","));
  // "fire,frost"
}

// ============================================================================
// SOLUTION 9: Implement - Prototype Registry with Factory
// ============================================================================

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
    return new DocumentTemplate(
      this.name,
      this.sections.map(s => ({ ...s })),
      new Map(this.metadata)
    );
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
  private templates = new Map<string, DocumentTemplate>();

  register(key: string, template: DocumentTemplate): void {
    this.templates.set(key, template);
  }

  create(key: string): DocumentTemplate {
    const template = this.templates.get(key);
    if (!template) throw new Error(`Template not found: ${key}`);
    return template.clone();
  }

  list(): string[] {
    return [...this.templates.keys()];
  }
}

function solution9(): void {
  console.log("\n=== Solution 9: Document Registry ===");
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
  // "[Q4 2024 Report] sections: Summary, Financials, Outlook"
  console.log(anotherReport.name);
  // "Quarterly Report"
  console.log(anotherReport.sections[0].content);
  // ""
  console.log(registry.list().join(", "));
  // "report, memo"
}

// ============================================================================
// SOLUTION 10: Implement - Configurable Clone (Partial Override)
// ============================================================================

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

  cloneWith(overrides: {
    name?: string;
    config?: Partial<Omit<ServerConfig, "headers">> & {
      headers?: Record<string, string>;
    };
  }): ApiEndpoint {
    // Deep clone first
    const cloned = this.clone();

    // Apply name override
    if (overrides.name !== undefined) {
      cloned.name = overrides.name;
    }

    // Apply config overrides (excluding headers)
    if (overrides.config) {
      const { headers, ...configOverrides } = overrides.config;
      Object.assign(cloned.config, configOverrides);

      // Merge headers (don't replace)
      if (headers) {
        Object.assign(cloned.config.headers, headers);
      }
    }

    return cloned;
  }

  toString(): string {
    const h = Object.entries(this.config.headers)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    return `${this.name} -> ${this.config.host}:${this.config.port} ssl=${this.config.ssl} [${h}]`;
  }
}

function solution10(): void {
  console.log("\n=== Solution 10: Configurable Clone ===");
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
  // base -> api.example.com:443 ssl=true [Content-Type:application/json, X-Api-Key:abc123]
  // internal -> internal.local:8080 ssl=false [Content-Type:application/json, X-Api-Key:abc123]
  // debug -> api.example.com:443 ssl=true [Content-Type:application/json, X-Api-Key:abc123, X-Debug:true]
}

// ============================================================================
// SOLUTION 11: Implement - Prototype with Versioning
// ============================================================================

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
    return new VersionedConfig(
      this.name,
      new Map(this.settings),
      this._version + 1
    );
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

function solution11(): void {
  console.log("\n=== Solution 11: Versioned Config ===");
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

// ============================================================================
// SOLUTION 12: Implement - Composite Prototype (Clone a Tree)
// ============================================================================

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
    return new File(this.name, this.bytes);
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
    const copy = new Directory(this.name);
    for (const child of this.children) {
      copy.add(child.clone());
    }
    return copy;
  }

  getChildren(): readonly FSNode[] {
    return this.children;
  }
}

function solution12(): void {
  console.log("\n=== Solution 12: Composite Prototype (File System) ===");
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

  // Modify original after cloning
  src.add(new File("new-file.ts", 100));

  console.log(root.print());
  console.log("---");
  console.log(backup.print());
  console.log(`Original size: ${root.size()}`);  // 2020
  console.log(`Backup size: ${backup.size()}`);   // 1920
}

// ============================================================================
// Runner
// ============================================================================

function main(): void {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   Prototype Pattern - Solutions Runner   ║");
  console.log("╚══════════════════════════════════════════╝\n");

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

  console.log("\n✓ All 12 solutions executed successfully.");
}

main();
