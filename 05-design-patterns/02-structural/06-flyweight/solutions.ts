// =============================================================================
// FLYWEIGHT PATTERN - SOLUTIONS
// =============================================================================
// Config: ES2022, strict, ESNext modules
// Run: npx tsx solutions.ts
// =============================================================================

// =============================================================================
// EXERCISE 1 — PREDICT (ANSWER)
// =============================================================================

function solution1(): void {
  class IconType {
    constructor(readonly name: string, readonly svgData: string) {}
    render(x: number, y: number): string { return `${this.name} at (${x},${y})`; }
  }

  class IconFactory {
    private icons = new Map<string, IconType>();
    getIcon(name: string, svgData: string): IconType {
      if (!this.icons.has(name)) {
        this.icons.set(name, new IconType(name, svgData));
      }
      return this.icons.get(name)!;
    }
    getCount(): number { return this.icons.size; }
  }

  const factory = new IconFactory();
  const a = factory.getIcon("star", "<svg>star</svg>");
  const b = factory.getIcon("heart", "<svg>heart</svg>");
  const c = factory.getIcon("star", "<svg>star-v2</svg>");

  console.log("Solution 1:", a === c, factory.getCount(), c.svgData);
  // ANSWER: true, 2, "<svg>star</svg>"
  // "star" already cached with original svgData; "star-v2" is ignored
  console.assert(a === c);
  console.assert(factory.getCount() === 2);
  console.assert(c.svgData === "<svg>star</svg>");
}

// =============================================================================
// EXERCISE 2 — PREDICT (ANSWER)
// =============================================================================

function solution2(): void {
  class Color {
    constructor(readonly r: number, readonly g: number, readonly b: number) {}
    toString(): string { return `rgb(${this.r},${this.g},${this.b})`; }
  }

  class ColorFactory {
    private cache = new Map<string, Color>();
    getColor(r: number, g: number, b: number): Color {
      const key = `${r}-${g}-${b}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, new Color(r, g, b));
      }
      return this.cache.get(key)!;
    }
  }

  const factory = new ColorFactory();
  const red1 = factory.getColor(255, 0, 0);
  const red2 = factory.getColor(255, 0, 0);
  const blue = factory.getColor(0, 0, 255);

  console.log("Solution 2:", red1 === red2, red1 === blue, red1.toString());
  // ANSWER: true, false, "rgb(255,0,0)"
  console.assert(red1 === red2);
  console.assert(red1 !== blue);
  console.assert(red1.toString() === "rgb(255,0,0)");
}

// =============================================================================
// EXERCISE 3 — PREDICT (ANSWER)
// =============================================================================

function solution3(): void {
  class Font {
    constructor(readonly family: string, readonly size: number) {}
  }

  class FontFactory {
    private fonts = new Map<string, Font>();
    getFont(family: string, size: number): Font {
      const key = `${family}-${size}`;
      if (!this.fonts.has(key)) {
        this.fonts.set(key, new Font(family, size));
      }
      return this.fonts.get(key)!;
    }
    getCacheSize(): number { return this.fonts.size; }
  }

  const factory = new FontFactory();
  factory.getFont("Arial", 12);
  factory.getFont("Arial", 14);
  factory.getFont("Arial", 12); // cached
  factory.getFont("Times", 12);
  factory.getFont("Times", 12); // cached

  console.log("Solution 3:", factory.getCacheSize());
  // ANSWER: 3 (Arial-12, Arial-14, Times-12)
  console.assert(factory.getCacheSize() === 3);
}

// =============================================================================
// EXERCISE 4 — PREDICT (ANSWER)
// =============================================================================

function solution4(): void {
  class ParticleType {
    constructor(readonly name: string, readonly color: string) {}
    draw(x: number, y: number): string {
      return `${this.name}(${this.color}) at ${x},${y}`;
    }
  }

  class ParticleFactory {
    private types = new Map<string, ParticleType>();
    getType(name: string, color: string): ParticleType {
      const key = `${name}-${color}`;
      if (!this.types.has(key)) {
        this.types.set(key, new ParticleType(name, color));
      }
      return this.types.get(key)!;
    }
  }

  const factory = new ParticleFactory();
  const bullet1 = factory.getType("bullet", "yellow");
  const bullet2 = factory.getType("bullet", "yellow");
  const missile = factory.getType("missile", "red");

  const results = [
    bullet1.draw(10, 20),
    bullet2.draw(30, 40),
    missile.draw(50, 60),
  ];

  console.log("Solution 4:", results, bullet1 === bullet2);
  // ANSWER: ["bullet(yellow) at 10,20", "bullet(yellow) at 30,40", "missile(red) at 50,60"], true
  console.assert(bullet1 === bullet2);
  console.assert(results[0] === "bullet(yellow) at 10,20");
  console.assert(results[2] === "missile(red) at 50,60");
}

// =============================================================================
// EXERCISE 5 — FIX (SOLUTION)
// =============================================================================

function solution5(): void {
  class TextStyle {
    constructor(
      readonly font: string,
      readonly size: number,
      readonly bold: boolean
    ) {}
  }

  class TextStyleFactory {
    private cache = new Map<string, TextStyle>();

    // FIX 1: Include bold in key
    // FIX 2: Check cache before creating
    getStyle(font: string, size: number, bold: boolean): TextStyle {
      const key = `${font}-${size}-${bold}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, new TextStyle(font, size, bold));
      }
      return this.cache.get(key)!;
    }

    getCacheSize(): number { return this.cache.size; }
  }

  const factory = new TextStyleFactory();
  const s1 = factory.getStyle("Arial", 12, false);
  const s2 = factory.getStyle("Arial", 12, false);
  const s3 = factory.getStyle("Arial", 12, true);

  console.log("Solution 5:", s1 === s2, s1 === s3, factory.getCacheSize());
  console.assert(s1 === s2, "Same params should return same instance");
  console.assert(s1 !== s3, "Different bold should return different instance");
  console.assert(factory.getCacheSize() === 2, "Should have 2 cached styles");
}

// =============================================================================
// EXERCISE 6 — FIX (SOLUTION)
// Already correct — position is on Entity (context), not on Sprite (flyweight).
// The original code was actually fine; the "bug" was a trick question about
// understanding the pattern. The entities already store x,y separately.
// =============================================================================

function solution6(): void {
  class Sprite {
    constructor(readonly name: string, readonly image: string) {}
  }

  class SpriteFactory {
    private sprites = new Map<string, Sprite>();
    getSprite(name: string, image: string): Sprite {
      if (!this.sprites.has(name)) {
        this.sprites.set(name, new Sprite(name, image));
      }
      return this.sprites.get(name)!;
    }
  }

  // The Entity correctly stores position (extrinsic) separately from sprite (flyweight).
  // The code works as-is. The exercise tests understanding of the pattern.
  class Entity {
    sprite: Sprite;
    constructor(
      factory: SpriteFactory,
      spriteName: string,
      spriteImage: string,
      public x: number,
      public y: number
    ) {
      this.sprite = factory.getSprite(spriteName, spriteImage);
    }

    render(): string {
      return `${this.sprite.name} at (${this.x},${this.y})`;
    }
  }

  const factory = new SpriteFactory();
  const e1 = new Entity(factory, "hero", "hero.png", 10, 20);
  const e2 = new Entity(factory, "hero", "hero.png", 50, 60);

  console.log("Solution 6:", e1.render(), e2.render());
  console.assert(e1.sprite === e2.sprite, "Should share sprite flyweight");
  console.assert(e1.render() === "hero at (10,20)");
  console.assert(e2.render() === "hero at (50,60)");
}

// =============================================================================
// EXERCISE 7 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution7(): void {
  class CSSStyle {
    constructor(readonly className: string, readonly styles: string) {}
  }

  class CSSStyleFactory {
    private cache = new Map<string, CSSStyle>();

    getStyle(className: string, styles: string): CSSStyle {
      if (!this.cache.has(className)) {
        this.cache.set(className, new CSSStyle(className, styles));
      }
      return this.cache.get(className)!;
    }

    getCount(): number { return this.cache.size; }
  }

  class DOMElement {
    constructor(
      readonly tag: string,
      readonly cssStyle: CSSStyle,
      readonly content: string
    ) {}

    render(): string {
      return `<${this.tag} class='${this.cssStyle.className}'>${this.content}</${this.tag}>`;
    }
  }

  const factory = new CSSStyleFactory();
  const style1 = factory.getStyle("btn", "color:red;padding:4px");
  const style2 = factory.getStyle("btn", "color:red;padding:4px");
  const style3 = factory.getStyle("link", "color:blue");
  const el1 = new DOMElement("button", style1, "Click");
  const el2 = new DOMElement("button", style2, "Submit");

  console.log("Solution 7:", el1.render(), el2.render(), style1 === style2, factory.getCount());
  console.assert(style1 === style2);
  console.assert(style1 !== style3);
  console.assert(factory.getCount() === 2);
  console.assert(el1.render() === "<button class='btn'>Click</button>");
  console.assert(el2.render() === "<button class='btn'>Submit</button>");
}

// =============================================================================
// EXERCISE 8 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution8(): void {
  class TileType {
    constructor(
      readonly terrain: string,
      readonly walkable: boolean,
      readonly texture: string
    ) {}
  }

  class TileFactory {
    private cache = new Map<string, TileType>();

    getTileType(terrain: string, walkable: boolean, texture: string): TileType {
      if (!this.cache.has(terrain)) {
        this.cache.set(terrain, new TileType(terrain, walkable, texture));
      }
      return this.cache.get(terrain)!;
    }

    getCount(): number { return this.cache.size; }
  }

  class MapTile {
    readonly tileType: TileType;

    constructor(
      readonly row: number,
      readonly col: number,
      tileType: TileType
    ) {
      this.tileType = tileType;
    }

    describe(): string {
      const access = this.tileType.walkable ? "walkable" : "blocked";
      return `${this.tileType.terrain} at (${this.row},${this.col}) [${access}]`;
    }
  }

  class GameMap {
    private tiles: MapTile[] = [];

    constructor(private factory: TileFactory) {}

    addTile(row: number, col: number, terrain: string, walkable: boolean, texture: string): void {
      const tileType = this.factory.getTileType(terrain, walkable, texture);
      this.tiles.push(new MapTile(row, col, tileType));
    }

    describe(): string[] {
      return this.tiles.map(t => t.describe());
    }
  }

  const factory = new TileFactory();
  const map = new GameMap(factory);
  map.addTile(0, 0, "grass", true, "grass.png");
  map.addTile(0, 1, "grass", true, "grass.png");
  map.addTile(1, 0, "water", false, "water.png");
  map.addTile(1, 1, "grass", true, "grass.png");

  console.log("Solution 8:", map.describe(), factory.getCount());
  console.assert(factory.getCount() === 2);
  const desc = map.describe();
  console.assert(desc[0] === "grass at (0,0) [walkable]");
  console.assert(desc[2] === "water at (1,0) [blocked]");
}

// =============================================================================
// EXERCISE 9 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution9(): void {
  class EmojiGlyph {
    constructor(
      readonly code: string,
      readonly name: string,
      readonly category: string
    ) {}
  }

  class EmojiFactory {
    private cache = new Map<string, EmojiGlyph>();

    getEmoji(code: string, name: string, category: string): EmojiGlyph {
      if (!this.cache.has(code)) {
        this.cache.set(code, new EmojiGlyph(code, name, category));
      }
      return this.cache.get(code)!;
    }

    getCount(): number { return this.cache.size; }
  }

  class EmojiUsage {
    constructor(
      readonly glyph: EmojiGlyph,
      readonly position: number,
      readonly userId: string
    ) {}

    toString(): string {
      return `${this.userId} used ${this.glyph.name} at position ${this.position}`;
    }
  }

  const factory = new EmojiFactory();
  const smile = factory.getEmoji("U+1F600", "grinning", "smileys");
  const heart = factory.getEmoji("U+2764", "heart", "symbols");
  const smile2 = factory.getEmoji("U+1F600", "grinning", "smileys");

  const usage1 = new EmojiUsage(smile, 0, "alice");
  const usage2 = new EmojiUsage(heart, 5, "alice");
  const usage3 = new EmojiUsage(smile2, 3, "bob");

  console.log("Solution 9:", usage1.toString(), usage3.toString(), smile === smile2, factory.getCount());
  console.assert(smile === smile2);
  console.assert(factory.getCount() === 2);
  console.assert(usage1.toString() === "alice used grinning at position 0");
  console.assert(usage3.toString() === "bob used grinning at position 3");
  void usage2;
}

// =============================================================================
// EXERCISE 10 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution10(): void {
  class ConnectionConfig {
    constructor(
      readonly host: string,
      readonly port: number,
      readonly dbName: string
    ) {}
  }

  class ConnectionConfigFactory {
    private cache = new Map<string, ConnectionConfig>();

    getConfig(host: string, port: number, dbName: string): ConnectionConfig {
      const key = `${host}:${port}/${dbName}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, new ConnectionConfig(host, port, dbName));
      }
      return this.cache.get(key)!;
    }

    getCount(): number { return this.cache.size; }
  }

  class DatabaseConnection {
    constructor(
      readonly config: ConnectionConfig,
      readonly connectionId: string,
      readonly createdAt: number
    ) {}

    describe(): string {
      return `Connection ${this.connectionId} to ${this.config.host}:${this.config.port}/${this.config.dbName}`;
    }
  }

  const factory = new ConnectionConfigFactory();
  const conn1 = new DatabaseConnection(factory.getConfig("localhost", 5432, "mydb"), "conn-1", Date.now());
  const conn2 = new DatabaseConnection(factory.getConfig("localhost", 5432, "mydb"), "conn-2", Date.now());
  const conn3 = new DatabaseConnection(factory.getConfig("remote", 3306, "prod"), "conn-3", Date.now());

  console.log("Solution 10:", conn1.describe(), conn2.describe(), conn1.config === conn2.config, factory.getCount());
  console.assert(conn1.config === conn2.config);
  console.assert(conn1.config !== conn3.config);
  console.assert(factory.getCount() === 2);
  console.assert(conn1.describe() === "Connection conn-1 to localhost:5432/mydb");
}

// =============================================================================
// EXERCISE 11 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution11(): void {
  class NoteType {
    constructor(
      readonly pitch: string,
      readonly duration: string,
      readonly symbol: string
    ) {}
  }

  class NoteTypeFactory {
    private cache = new Map<string, NoteType>();

    getNoteType(pitch: string, duration: string, symbol: string): NoteType {
      const key = `${pitch}-${duration}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, new NoteType(pitch, duration, symbol));
      }
      return this.cache.get(key)!;
    }

    getCount(): number { return this.cache.size; }
  }

  class MusicalNote {
    constructor(
      readonly noteType: NoteType,
      readonly measure: number,
      readonly beat: number
    ) {}

    toString(): string {
      return `${this.noteType.symbol} ${this.noteType.pitch} (${this.noteType.duration}) at ${this.measure}:${this.beat}`;
    }
  }

  class Sheet {
    private notes: MusicalNote[] = [];

    constructor(private factory: NoteTypeFactory) {}

    addNote(pitch: string, duration: string, symbol: string, measure: number, beat: number): void {
      const noteType = this.factory.getNoteType(pitch, duration, symbol);
      this.notes.push(new MusicalNote(noteType, measure, beat));
    }

    getAllNotes(): string[] {
      return this.notes.map(n => n.toString());
    }
  }

  const factory = new NoteTypeFactory();
  const sheet = new Sheet(factory);
  sheet.addNote("C4", "quarter", "\u2669", 1, 1);
  sheet.addNote("E4", "quarter", "\u2669", 1, 2);
  sheet.addNote("C4", "quarter", "\u2669", 1, 3);
  sheet.addNote("G4", "half", "\uD834\uDD5E", 1, 4);

  console.log("Solution 11:", sheet.getAllNotes(), factory.getCount());
  console.assert(factory.getCount() === 3);
  const notes = sheet.getAllNotes();
  console.assert(notes[0] === "\u2669 C4 (quarter) at 1:1");
  console.assert(notes[2] === "\u2669 C4 (quarter) at 1:3");
}

// =============================================================================
// EXERCISE 12 — IMPLEMENT (SOLUTION)
// =============================================================================

function solution12(): void {
  class LogLevel {
    constructor(
      readonly name: string,
      readonly prefix: string,
      readonly severity: number
    ) {}
  }

  class LogLevelFactory {
    private cache = new Map<string, LogLevel>();

    getLevel(name: string, prefix: string, severity: number): LogLevel {
      if (!this.cache.has(name)) {
        this.cache.set(name, new LogLevel(name, prefix, severity));
      }
      return this.cache.get(name)!;
    }

    getCount(): number { return this.cache.size; }
  }

  class LogEntry {
    constructor(
      readonly level: LogLevel,
      readonly message: string,
      readonly timestamp: number
    ) {}

    format(): string {
      return `[${this.level.prefix}] ${this.message}`;
    }
  }

  class Logger {
    private entries: LogEntry[] = [];

    constructor(private factory: LogLevelFactory) {}

    log(levelName: string, prefix: string, severity: number, message: string): void {
      const level = this.factory.getLevel(levelName, prefix, severity);
      this.entries.push(new LogEntry(level, message, Date.now()));
    }

    getEntries(): string[] {
      return this.entries.map(e => e.format());
    }

    getUniqueLevelCount(): number {
      return this.factory.getCount();
    }
  }

  const logger = new Logger(new LogLevelFactory());
  logger.log("INFO", "\u2139", 1, "Server started");
  logger.log("ERROR", "\u2716", 3, "Connection failed");
  logger.log("INFO", "\u2139", 1, "Request received");
  logger.log("WARN", "\u26A0", 2, "Memory high");
  logger.log("ERROR", "\u2716", 3, "Timeout");

  console.log("Solution 12:", logger.getEntries(), logger.getUniqueLevelCount());
  const entries = logger.getEntries();
  console.assert(entries[0] === "[\u2139] Server started");
  console.assert(entries[1] === "[\u2716] Connection failed");
  console.assert(entries[3] === "[\u26A0] Memory high");
  console.assert(logger.getUniqueLevelCount() === 3);
}

// =============================================================================
// RUNNER
// =============================================================================

console.log("=== FLYWEIGHT PATTERN SOLUTIONS ===\n");
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
console.log("\nAll solutions passed!");
