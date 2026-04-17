// =============================================================================
// FLYWEIGHT PATTERN - EXERCISES
// =============================================================================
// 12 exercises: 4 predict, 2 fix, 6 implement
// Config: ES2022, strict, ESNext modules
// Run: npx tsx exercises.ts
// =============================================================================

// =============================================================================
// EXERCISE 1 — PREDICT
// What does this print?
// =============================================================================

function exercise1(): void {
  class IconType {
    constructor(readonly name: string, readonly svgData: string) {}
    render(x: number, y: number): string {
      return `${this.name} at (${x},${y})`;
    }
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

  console.log("Exercise 1:", a === c, factory.getCount(), c.svgData);
  // YOUR PREDICTION:
  // true, 2, "<svg>star</svg>"
}

// =============================================================================
// EXERCISE 2 — PREDICT
// What does this print?
// =============================================================================

function exercise2(): void {
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

  console.log("Exercise 2:", red1 === red2, red1 === blue, red1.toString());
  // YOUR PREDICTION:
  // true, false, "rgb(255,0,0)"
}

// =============================================================================
// EXERCISE 3 — PREDICT
// What does this print?
// =============================================================================

function exercise3(): void {
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
  factory.getFont("Arial", 12);
  factory.getFont("Times", 12);
  factory.getFont("Times", 12);

  console.log("Exercise 3:", factory.getCacheSize());
  // YOUR PREDICTION:
  // 3
}

// =============================================================================
// EXERCISE 4 — PREDICT
// What does this print?
// =============================================================================

function exercise4(): void {
  class ParticleType {
    constructor(
      readonly name: string,
      readonly color: string
    ) {}

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

  console.log("Exercise 4:", results, bullet1 === bullet2);
  // YOUR PREDICTION:
  // ["bullet(yellow) at 10,20", "bullet(yellow) at 30,40", "missile(red) at 50,60"], true
}

// =============================================================================
// EXERCISE 5 — FIX
// The flyweight factory has bugs. Fix them.
// =============================================================================

function exercise5(): void {
  class TextStyle {
    constructor(
      readonly font: string,
      readonly size: number,
      readonly bold: boolean
    ) {}
  }

  class TextStyleFactory {
    private cache = new Map<string, TextStyle>();

    // BUG 1: The key does not include 'bold', so bold/non-bold styles collide
    // BUG 2: Always creates a new instance instead of returning cached one
    getStyle(font: string, size: number, bold: boolean): TextStyle {
      const key = `${font}-${size}`;
      const style = new TextStyle(font, size, bold);
      this.cache.set(key, style);
      return style;
    }

    getCacheSize(): number { return this.cache.size; }
  }

  const factory = new TextStyleFactory();
  const s1 = factory.getStyle("Arial", 12, false);
  const s2 = factory.getStyle("Arial", 12, false);
  const s3 = factory.getStyle("Arial", 12, true);

  console.log("Exercise 5:", s1 === s2, s1 === s3, factory.getCacheSize());

  // TEST (uncomment to verify):
  // console.assert(s1 === s2, "Same params should return same instance");
  // console.assert(s1 !== s3, "Different bold should return different instance");
  // console.assert(factory.getCacheSize() === 2, "Should have 2 cached styles");
}

// =============================================================================
// EXERCISE 6 — FIX
// The flyweight context is incorrectly sharing mutable state. Fix it.
// =============================================================================

function exercise6(): void {
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

  // BUG: The position is stored on the flyweight itself (shared), not in a context.
  // Multiple entities using the same sprite will overwrite each other's position.
  class Entity {
    sprite: Sprite;
    // Position is stored directly — but sprite is shared!
    constructor(
      private factory: SpriteFactory,
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

  console.log("Exercise 6:", e1.render(), e2.render());

  // TEST (uncomment to verify):
  // console.assert(e1.sprite === e2.sprite, "Should share sprite flyweight");
  // console.assert(e1.render() === "hero at (10,20)", "e1 position");
  // console.assert(e2.render() === "hero at (50,60)", "e2 position");
}

// =============================================================================
// EXERCISE 7 — IMPLEMENT
// Create a flyweight system for CSS class styles in a virtual DOM.
// =============================================================================

function exercise7(): void {
  // TODO: Implement:
  // 1. CSSStyle flyweight class with readonly properties: className, styles (string)
  // 2. CSSStyleFactory with getStyle(className, styles) that caches by className
  // 3. DOMElement context class with: tag (string), cssStyle (CSSStyle ref), content (string)
  //    - render(): string => "<tag class='className'>content</tag>"

  // const factory = new CSSStyleFactory();
  // const style1 = factory.getStyle("btn", "color:red;padding:4px");
  // const style2 = factory.getStyle("btn", "color:red;padding:4px");
  // const style3 = factory.getStyle("link", "color:blue");
  // const el1 = new DOMElement("button", style1, "Click");
  // const el2 = new DOMElement("button", style2, "Submit");
  // console.log("Exercise 7:", el1.render(), el2.render(), style1 === style2, factory.getCount());

  // TEST (uncomment to verify):
  // console.assert(style1 === style2, "Same className should share instance");
  // console.assert(style1 !== style3, "Different className should differ");
  // console.assert(factory.getCount() === 2, "2 unique styles");
  // console.assert(el1.render() === "<button class='btn'>Click</button>");
  // console.assert(el2.render() === "<button class='btn'>Submit</button>");

  console.log("Exercise 7: Not implemented yet");
}

// =============================================================================
// EXERCISE 8 — IMPLEMENT
// Create a flyweight system for map tiles in a game.
// =============================================================================

function exercise8(): void {
  // TODO: Implement:
  // 1. TileType flyweight: readonly terrain (string), readonly walkable (boolean),
  //    readonly texture (string)
  // 2. TileFactory: getTileType(terrain, walkable, texture) — caches by terrain
  // 3. MapTile context: row (number), col (number), tileType (TileType ref)
  //    - describe(): string => "terrain at (row,col) [walkable|blocked]"
  // 4. GameMap: tiles (MapTile[]), addTile(row, col, terrain, walkable, texture),
  //    describe(): string[] — returns describe() for all tiles

  // const factory = new TileFactory();
  // const map = new GameMap(factory);
  // map.addTile(0, 0, "grass", true, "grass.png");
  // map.addTile(0, 1, "grass", true, "grass.png");
  // map.addTile(1, 0, "water", false, "water.png");
  // map.addTile(1, 1, "grass", true, "grass.png");
  // console.log("Exercise 8:", map.describe(), factory.getCount());

  // TEST (uncomment to verify):
  // console.assert(factory.getCount() === 2, "2 tile types: grass and water");
  // const desc = map.describe();
  // console.assert(desc[0] === "grass at (0,0) [walkable]");
  // console.assert(desc[2] === "water at (1,0) [blocked]");

  console.log("Exercise 8: Not implemented yet");
}

// =============================================================================
// EXERCISE 9 — IMPLEMENT
// Create a flyweight system for emoji rendering.
// =============================================================================

function exercise9(): void {
  // TODO: Implement:
  // 1. EmojiGlyph flyweight: readonly code (string), readonly name (string),
  //    readonly category (string)
  // 2. EmojiFactory: getEmoji(code, name, category) — caches by code
  //    - getCount(): number
  // 3. EmojiUsage context: glyph (EmojiGlyph ref), position (number), userId (string)
  //    - toString(): string => "userId used name at position pos"
  // 4. A function that creates multiple usages sharing flyweights

  // const factory = new EmojiFactory();
  // const smile = factory.getEmoji("U+1F600", "grinning", "smileys");
  // const heart = factory.getEmoji("U+2764", "heart", "symbols");
  // const smile2 = factory.getEmoji("U+1F600", "grinning", "smileys");
  //
  // const usage1 = new EmojiUsage(smile, 0, "alice");
  // const usage2 = new EmojiUsage(heart, 5, "alice");
  // const usage3 = new EmojiUsage(smile2, 3, "bob");
  //
  // console.log("Exercise 9:", usage1.toString(), usage3.toString(), smile === smile2, factory.getCount());

  // TEST (uncomment to verify):
  // console.assert(smile === smile2, "Same code shares flyweight");
  // console.assert(factory.getCount() === 2, "2 unique emojis");
  // console.assert(usage1.toString() === "alice used grinning at position 0");
  // console.assert(usage3.toString() === "bob used grinning at position 3");

  console.log("Exercise 9: Not implemented yet");
}

// =============================================================================
// EXERCISE 10 — IMPLEMENT
// Create a flyweight system for database connection configs.
// =============================================================================

function exercise10(): void {
  // TODO: Implement:
  // 1. ConnectionConfig flyweight: readonly host, readonly port, readonly dbName
  // 2. ConnectionConfigFactory: getConfig(host, port, dbName) — cache by "host:port/dbName"
  // 3. DatabaseConnection context: config (ConnectionConfig ref), connectionId (string),
  //    createdAt (number — timestamp)
  //    - describe(): string => "Connection connectionId to host:port/dbName"
  // Make sure multiple connections to the same db share the config flyweight.

  // const factory = new ConnectionConfigFactory();
  // const conn1 = new DatabaseConnection(factory.getConfig("localhost", 5432, "mydb"), "conn-1", Date.now());
  // const conn2 = new DatabaseConnection(factory.getConfig("localhost", 5432, "mydb"), "conn-2", Date.now());
  // const conn3 = new DatabaseConnection(factory.getConfig("remote", 3306, "prod"), "conn-3", Date.now());
  // console.log("Exercise 10:", conn1.describe(), conn2.describe(), conn1.config === conn2.config, factory.getCount());

  // TEST (uncomment to verify):
  // console.assert(conn1.config === conn2.config, "Same config should share flyweight");
  // console.assert(conn1.config !== conn3.config, "Different config should differ");
  // console.assert(factory.getCount() === 2, "2 unique configs");
  // console.assert(conn1.describe() === "Connection conn-1 to localhost:5432/mydb");

  console.log("Exercise 10: Not implemented yet");
}

// =============================================================================
// EXERCISE 11 — IMPLEMENT
// Create a flyweight system for music notes in a digital sheet music renderer.
// =============================================================================

function exercise11(): void {
  // TODO: Implement:
  // 1. NoteType flyweight: readonly pitch (string, e.g. "C4"), readonly duration (string, e.g. "quarter"),
  //    readonly symbol (string, e.g. "♩")
  // 2. NoteTypeFactory: getNoteType(pitch, duration, symbol) — cache by "pitch-duration"
  // 3. MusicalNote context: noteType (NoteType ref), measure (number), beat (number)
  //    - toString(): string => "symbol pitch (duration) at measure:beat"
  // 4. Sheet: notes (MusicalNote[]), addNote(...), getAllNotes(): string[]

  // const factory = new NoteTypeFactory();
  // const sheet = new Sheet(factory);
  // sheet.addNote("C4", "quarter", "♩", 1, 1);
  // sheet.addNote("E4", "quarter", "♩", 1, 2);
  // sheet.addNote("C4", "quarter", "♩", 1, 3);
  // sheet.addNote("G4", "half", "𝅗𝅥", 1, 4);
  // console.log("Exercise 11:", sheet.getAllNotes(), factory.getCount());

  // TEST (uncomment to verify):
  // console.assert(factory.getCount() === 3, "3 unique note types: C4-quarter, E4-quarter, G4-half");
  // const notes = sheet.getAllNotes();
  // console.assert(notes[0] === "♩ C4 (quarter) at 1:1");
  // console.assert(notes[2] === "♩ C4 (quarter) at 1:3");
  // console.assert(notes[3] === "𝅗𝅥 G4 (half) at 1:4");

  console.log("Exercise 11: Not implemented yet");
}

// =============================================================================
// EXERCISE 12 — IMPLEMENT
// Create a flyweight system for log level formatting.
// =============================================================================

function exercise12(): void {
  // TODO: Implement:
  // 1. LogLevel flyweight: readonly name (string), readonly prefix (string),
  //    readonly severity (number)
  // 2. LogLevelFactory: getLevel(name, prefix, severity) — cache by name
  // 3. LogEntry context: level (LogLevel ref), message (string), timestamp (number)
  //    - format(): string => "[prefix] message"
  // 4. Logger class: factory (LogLevelFactory), entries (LogEntry[])
  //    - log(levelName, prefix, severity, message): void — creates LogEntry with Date.now()
  //    - getEntries(): string[] — returns format() for all entries
  //    - getUniqueLevelCount(): number — from factory

  // const logger = new Logger(new LogLevelFactory());
  // logger.log("INFO", "ℹ", 1, "Server started");
  // logger.log("ERROR", "✖", 3, "Connection failed");
  // logger.log("INFO", "ℹ", 1, "Request received");
  // logger.log("WARN", "⚠", 2, "Memory high");
  // logger.log("ERROR", "✖", 3, "Timeout");
  // console.log("Exercise 12:", logger.getEntries(), logger.getUniqueLevelCount());

  // TEST (uncomment to verify):
  // const entries = logger.getEntries();
  // console.assert(entries[0] === "[ℹ] Server started");
  // console.assert(entries[1] === "[✖] Connection failed");
  // console.assert(entries[3] === "[⚠] Memory high");
  // console.assert(logger.getUniqueLevelCount() === 3, "3 unique levels");

  console.log("Exercise 12: Not implemented yet");
}

// =============================================================================
// RUNNER
// =============================================================================

console.log("=== FLYWEIGHT PATTERN EXERCISES ===\n");
exercise1();
exercise2();
exercise3();
exercise4();
exercise5();
exercise6();
exercise7();
exercise8();
exercise9();
exercise10();
exercise11();
exercise12();
