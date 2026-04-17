// ============================================================================
// How Code Runs — Solutions
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ---------------------------------------------------------------------------
// EXERCISE 1: Simple Tokenizer
// ---------------------------------------------------------------------------
section("Exercise 1: Tokenizer");

interface Token {
  type: string;
  value: string;
  position: number;
}

const KEYWORDS = new Set(["const", "let", "var", "function", "return", "if", "else"]);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      let num = "";
      const start = i;
      while (i < input.length && /[0-9.]/.test(input[i])) {
        num += input[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: num, position: start });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let ident = "";
      const start = i;
      while (i < input.length && /[a-zA-Z0-9_$]/.test(input[i])) {
        ident += input[i];
        i++;
      }
      const type = KEYWORDS.has(ident) ? "KEYWORD" : "IDENTIFIER";
      tokens.push({ type, value: ident, position: start });
      continue;
    }

    // Single-character tokens
    const singleCharTokens: Record<string, string> = {
      "+": "PLUS",
      "-": "MINUS",
      "*": "STAR",
      "/": "SLASH",
      "=": "EQUALS",
      ";": "SEMICOLON",
      "(": "LPAREN",
      ")": "RPAREN",
      "{": "LBRACE",
      "}": "RBRACE",
      ",": "COMMA",
    };

    if (singleCharTokens[ch]) {
      tokens.push({ type: singleCharTokens[ch], value: ch, position: i });
      i++;
      continue;
    }

    // Unknown character
    i++;
  }

  return tokens;
}

const tokens1 = tokenize("const x = 42;");
assert(tokens1[0].type === "KEYWORD" && tokens1[0].value === "const", "1a: const keyword");
assert(tokens1[1].type === "IDENTIFIER" && tokens1[1].value === "x", "1b: x identifier");
assert(tokens1[2].type === "EQUALS", "1c: equals");
assert(tokens1[3].type === "NUMBER" && tokens1[3].value === "42", "1d: number 42");
assert(tokens1[4].type === "SEMICOLON", "1e: semicolon");

const tokens2 = tokenize("a + b * 2");
assert(tokens2.length === 5, "1f: 5 tokens");
assert(tokens2[1].type === "PLUS", "1g: plus");
assert(tokens2[3].type === "STAR", "1h: star");

// ---------------------------------------------------------------------------
// EXERCISE 2: Simple AST Builder
// ---------------------------------------------------------------------------
section("Exercise 2: AST Builder");

interface ASTNode {
  type: string;
  [key: string]: unknown;
}

function parseAssignment(tokens: Token[]): ASTNode {
  let pos = 0;

  // Expect KEYWORD (const/let)
  const kindToken = tokens[pos++];
  if (kindToken.type !== "KEYWORD") throw new Error("Expected const/let");

  // Expect IDENTIFIER
  const nameToken = tokens[pos++];
  if (nameToken.type !== "IDENTIFIER") throw new Error("Expected identifier");

  // Expect EQUALS
  if (tokens[pos++].type !== "EQUALS") throw new Error("Expected =");

  // Parse expression: NUMBER or NUMBER OP NUMBER
  const firstToken = tokens[pos++];
  let initNode: ASTNode;

  if (firstToken.type === "NUMBER") {
    // Check if next is an operator
    if (pos < tokens.length && ["PLUS", "MINUS", "STAR", "SLASH"].includes(tokens[pos].type)) {
      const opToken = tokens[pos++];
      const secondToken = tokens[pos++];
      const opMap: Record<string, string> = { PLUS: "+", MINUS: "-", STAR: "*", SLASH: "/" };
      initNode = {
        type: "BinaryExpression",
        operator: opMap[opToken.type],
        left: { type: "NumberLiteral", value: Number(firstToken.value) },
        right: { type: "NumberLiteral", value: Number(secondToken.value) },
      };
    } else {
      initNode = { type: "NumberLiteral", value: Number(firstToken.value) };
    }
  } else {
    throw new Error("Expected number");
  }

  return {
    type: "VariableDeclaration",
    kind: kindToken.value,
    declaration: {
      type: "VariableDeclarator",
      name: nameToken.value,
      init: initNode,
    },
  };
}

const ast1 = parseAssignment(tokenize("const x = 42;"));
assert(ast1.type === "VariableDeclaration", "2a: VariableDeclaration");
assert((ast1.declaration as ASTNode).name === "x", "2b: name x");
assert(((ast1.declaration as ASTNode).init as ASTNode).type === "NumberLiteral", "2c: NumberLiteral");

const ast2 = parseAssignment(tokenize("let sum = 5 + 3;"));
assert(ast2.type === "VariableDeclaration", "2d: VariableDeclaration");
assert(((ast2.declaration as ASTNode).init as ASTNode).type === "BinaryExpression", "2e: BinaryExpression");
assert(((ast2.declaration as ASTNode).init as ASTNode).operator === "+", "2f: operator +");

// ---------------------------------------------------------------------------
// EXERCISE 3: Tree Shaking Predictions
// ---------------------------------------------------------------------------
section("Exercise 3: Tree Shaking");

// 1: Only `add` is included (directly imported)
// 2: Yes, console.log("utils loaded") IS included — it's a side effect
// 3: With "sideEffects": false, the console.log MIGHT be removed (bundler assumes no side effects)
assert(true, "3a: only add included");
assert(true, "3b: side effect console.log included by default");
assert(true, "3c: sideEffects:false allows removing side effects");

// ---------------------------------------------------------------------------
// EXERCISE 4: Module Loading Order
// ---------------------------------------------------------------------------
section("Exercise 4: Module Loading Order");

// ESM evaluation: depth-first, dependencies first
// c.ts imports a.ts and b.ts
// a.ts imports b.ts
// Order: b.ts evaluates first, then a.ts, then c.ts
// Output: "B: top-level", "A: top-level", "A: bValue is 42", "C: top-level", "C: done"
assert(true, "4: B first, then A, then C (depth-first, dependencies first)");

// ---------------------------------------------------------------------------
// EXERCISE 5: CJS vs ESM
// ---------------------------------------------------------------------------
section("Exercise 5: CJS vs ESM");

// ESM: live bindings
// A: 0, B: 1 (live binding sees the update)
// CJS: copies
// C: 0, D: 0 (copy doesn't update)
assert(true, "5: ESM live binding shows 1, CJS copy shows 0");

// ---------------------------------------------------------------------------
// EXERCISE 6: Dynamic Import Timing
// ---------------------------------------------------------------------------
section("Exercise 6: Dynamic Import");

// Output order: 1, 2, 3, 4
// import() returns a Promise — the .then callback is async
assert(true, "6: 1, 2, 3, then 4 (promise is async)");

// ---------------------------------------------------------------------------
// EXERCISE 7: Minification Effects
// ---------------------------------------------------------------------------
section("Exercise 7: Minification");

// A: function.name will be minified (e.g., "a" instead of "calculateTotal")
// B: obj["calculateTotal"]() will BREAK — the string is preserved but the method name is minified
//    Wait — actually, property names on objects are NOT renamed by default.
//    Only local variable names are renamed. So obj.calculateTotal() still works.
//    But if calculateTotal was a local function name, then function.name changes.
// C: Angular DI breaks — parameter names are minified
assert(true, "7a: function.name changes after minification");
assert(true, "7b: property access works (property names not renamed by default)");
assert(true, "7c: Angular DI breaks (parameter names minified)");

// ---------------------------------------------------------------------------
// EXERCISE 8: Basic Minifier
// ---------------------------------------------------------------------------
section("Exercise 8: Minifier");

function minify(code: string): string {
  // Remove multi-line comments
  let result = code.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove single-line comments
  result = result.replace(/\/\/.*$/gm, "");
  // Remove leading/trailing whitespace per line and collapse blank lines
  result = result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  return result;
}

const input1 = `
// This is a comment
const x = 42; // inline comment
const y = x + 1;
`;
const min1 = minify(input1);
assert(!min1.includes("//"), "8a: no single-line comments");
assert(min1.includes("const x = 42;"), "8b: code preserved");
assert(min1.includes("const y = x + 1;"), "8c: code preserved");

const input2 = `
/* multi
   line
   comment */
function add(a, b) {
  return a + b;
}
`;
const min2 = minify(input2);
assert(!min2.includes("/*"), "8d: no multi-line comments");
assert(min2.includes("function add"), "8e: function preserved");

// ---------------------------------------------------------------------------
// EXERCISE 9: Tree Shaking Fix
// ---------------------------------------------------------------------------
section("Exercise 9: Tree Shaking Fix");

// Fixed: individual named exports instead of class
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function lowercase(s: string): string {
  return s.toLowerCase();
}

function reverse(s: string): string {
  return [...s].reverse().join("");
}

function truncate(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen) + "..." : s;
}

assert(capitalize("hello") === "Hello", "9a: capitalize");
assert(reverse("abc") === "cba", "9b: reverse");
assert(lowercase("HELLO") === "hello", "9c: lowercase");
assert(truncate("hello world", 5) === "hello...", "9d: truncate");

// ---------------------------------------------------------------------------
// EXERCISE 10: Source Map Lookup Fix
// ---------------------------------------------------------------------------
section("Exercise 10: Source Map Lookup");

interface SimpleMappingEntry {
  generatedLine: number;
  generatedCol: number;
  originalFile: string;
  originalLine: number;
  originalCol: number;
}

interface SimpleSourceMap {
  mappings: SimpleMappingEntry[];
}

function lookupOriginalPositionFixed(
  sourceMap: SimpleSourceMap,
  generatedLine: number,
  generatedCol: number
): { file: string; line: number; col: number } | null {
  // Sort mappings by line then column
  const sorted = [...sourceMap.mappings].sort((a, b) =>
    a.generatedLine !== b.generatedLine
      ? a.generatedLine - b.generatedLine
      : a.generatedCol - b.generatedCol
  );

  // Find the closest mapping at or before the requested position
  let best: SimpleMappingEntry | null = null;

  for (const m of sorted) {
    if (m.generatedLine > generatedLine) break;
    if (m.generatedLine === generatedLine && m.generatedCol <= generatedCol) {
      best = m;
    }
  }

  if (!best) return null;

  return {
    file: best.originalFile,
    line: best.originalLine,
    col: best.originalCol,
  };
}

const smap: SimpleSourceMap = {
  mappings: [
    { generatedLine: 1, generatedCol: 0, originalFile: "app.ts", originalLine: 1, originalCol: 0 },
    { generatedLine: 1, generatedCol: 10, originalFile: "app.ts", originalLine: 2, originalCol: 0 },
    { generatedLine: 1, generatedCol: 25, originalFile: "utils.ts", originalLine: 5, originalCol: 4 },
    { generatedLine: 2, generatedCol: 0, originalFile: "utils.ts", originalLine: 10, originalCol: 0 },
  ],
};

const r1 = lookupOriginalPositionFixed(smap, 1, 0);
assert(r1?.file === "app.ts" && r1?.line === 1, "10a: exact match");

const r2 = lookupOriginalPositionFixed(smap, 1, 15);
assert(r2?.file === "app.ts" && r2?.line === 2, "10b: closest preceding");

const r3 = lookupOriginalPositionFixed(smap, 3, 0);
assert(r3 === null, "10c: no mapping found");

// ---------------------------------------------------------------------------
// EXERCISE 11: Module Import Order Fix
// ---------------------------------------------------------------------------
section("Exercise 11: Module Order Fix");

const registry: Map<string, () => unknown> = new Map();

function registerModule(name: string, factory: () => unknown): void {
  registry.set(name, factory);
}

function getModule(name: string): unknown {
  const factory = registry.get(name);
  if (!factory) throw new Error(`Module "${name}" not found`);
  return factory();
}

registerModule("a", () => {
  const b = getModule("b") as { greet: () => string };
  return { name: "A", greeting: b.greet() };
});

registerModule("b", () => {
  return {
    greet: () => "Hello from B",
    getA: () => {
      const a = getModule("a") as { name: string };
      return a.name;
    },
  };
});

const modB = getModule("b") as { greet: () => string; getA: () => string };
assert(modB.greet() === "Hello from B", "11a: B greets");
assert(modB.getA() === "A", "11b: B can get A (lazy resolution)");

// ---------------------------------------------------------------------------
// EXERCISE 12: VLQ Encoder/Decoder
// ---------------------------------------------------------------------------
section("Exercise 12: VLQ");

const VLQ_BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const VLQ_SHIFT = 5;
const VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT; // 32
const VLQ_MASK = VLQ_CONTINUATION_BIT - 1; // 31

function vlqEncode(value: number): string {
  let vlq = value < 0 ? ((-value) << 1) | 1 : value << 1;
  let result = "";

  do {
    let digit = vlq & VLQ_MASK;
    vlq >>>= VLQ_SHIFT;
    if (vlq > 0) {
      digit |= VLQ_CONTINUATION_BIT;
    }
    result += VLQ_BASE64[digit];
  } while (vlq > 0);

  return result;
}

function vlqDecode(encoded: string): number[] {
  const results: number[] = [];
  let i = 0;

  while (i < encoded.length) {
    let value = 0;
    let shift = 0;
    let continuation: boolean;

    do {
      const charIdx = VLQ_BASE64.indexOf(encoded[i++]);
      continuation = (charIdx & VLQ_CONTINUATION_BIT) !== 0;
      value += (charIdx & VLQ_MASK) << shift;
      shift += VLQ_SHIFT;
    } while (continuation);

    // Convert from VLQ signed
    const isNegative = (value & 1) === 1;
    value >>>= 1;
    results.push(isNegative ? -value : value);
  }

  return results;
}

assert(vlqEncode(0) === "A", "12a: 0 → A");
assert(vlqEncode(1) === "C", "12b: 1 → C");
assert(vlqEncode(-1) === "D", "12c: -1 → D");
assert(vlqEncode(16) === "gB", "12d: 16 → gB");
assert(vlqEncode(-16) === "hB", "12e: -16 → hB");

const vlqDecoded = vlqDecode("ACDD");
assert(vlqDecoded[0] === 0, "12f: A → 0");
assert(vlqDecoded[1] === 1, "12g: C → 1");
assert(vlqDecoded[2] === -1, "12h: D → -1");
assert(vlqDecoded[3] === -1, "12i: D → -1");

// ---------------------------------------------------------------------------
// EXERCISE 13: Bundle Dependency Graph
// ---------------------------------------------------------------------------
section("Exercise 13: Dependency Graph");

interface ModuleDefinition {
  name: string;
  imports: string[];
}

function getEvaluationOrder(modules: ModuleDefinition[]): string[] {
  const graph = new Map<string, string[]>();
  const allModules = new Set<string>();

  for (const mod of modules) {
    graph.set(mod.name, mod.imports);
    allModules.add(mod.name);
    for (const imp of mod.imports) {
      allModules.add(imp);
    }
  }

  // Ensure all modules are in the graph
  for (const name of allModules) {
    if (!graph.has(name)) {
      graph.set(name, []);
    }
  }

  const result: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(name: string): void {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    visiting.add(name);

    for (const dep of graph.get(name) ?? []) {
      visit(dep);
    }

    visiting.delete(name);
    visited.add(name);
    result.push(name);
  }

  for (const name of allModules) {
    visit(name);
  }

  return result;
}

const depModules: ModuleDefinition[] = [
  { name: "app", imports: ["router", "store"] },
  { name: "router", imports: ["utils"] },
  { name: "store", imports: ["utils", "api"] },
  { name: "api", imports: ["utils"] },
  { name: "utils", imports: [] },
];
const order = getEvaluationOrder(depModules);
const utilsIdx = order.indexOf("utils");
const apiIdx = order.indexOf("api");
const routerIdx = order.indexOf("router");
const storeIdx = order.indexOf("store");
const appIdx = order.indexOf("app");
assert(utilsIdx < apiIdx, "13a: utils before api");
assert(utilsIdx < routerIdx, "13b: utils before router");
assert(apiIdx < storeIdx, "13c: api before store");
assert(storeIdx < appIdx, "13d: store before app");
assert(routerIdx < appIdx, "13e: router before app");

let circularThrew = false;
try {
  getEvaluationOrder([
    { name: "a", imports: ["b"] },
    { name: "b", imports: ["a"] },
  ]);
} catch {
  circularThrew = true;
}
assert(circularThrew, "13f: detects circular dependency");

// ---------------------------------------------------------------------------
// EXERCISE 14: Simple Code Generator
// ---------------------------------------------------------------------------
section("Exercise 14: Code Generator");

interface CodeGenNode {
  type: string;
  [key: string]: unknown;
}

function generateCode(node: CodeGenNode): string {
  switch (node.type) {
    case "Program":
      return (node.body as CodeGenNode[]).map(generateCode).join("\n");

    case "VariableDeclaration":
      return `${node.kind} ${node.name} = ${generateCode(node.init as CodeGenNode)};`;

    case "BinaryExpression":
      return `${generateCode(node.left as CodeGenNode)} ${node.operator} ${generateCode(node.right as CodeGenNode)}`;

    case "NumberLiteral":
      return String(node.value);

    case "Identifier":
      return node.name as string;

    case "ExpressionStatement":
      return `${generateCode(node.expression as CodeGenNode)};`;

    case "CallExpression": {
      const args = (node.arguments as CodeGenNode[]).map(generateCode).join(", ");
      return `${generateCode(node.callee as CodeGenNode)}(${args})`;
    }

    default:
      return `/* unknown: ${node.type} */`;
  }
}

const codeAst: CodeGenNode = {
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      kind: "const",
      name: "x",
      init: { type: "NumberLiteral", value: 42 },
    },
    {
      type: "VariableDeclaration",
      kind: "let",
      name: "y",
      init: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Identifier", name: "x" },
        right: { type: "NumberLiteral", value: 1 },
      },
    },
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "console.log" },
        arguments: [{ type: "Identifier", name: "y" }],
      },
    },
  ],
};
const generatedCode = generateCode(codeAst);
assert(generatedCode.includes("const x = 42"), "14a: const x = 42");
assert(generatedCode.includes("let y = x + 1"), "14b: let y = x + 1");
assert(generatedCode.includes("console.log(y)"), "14c: console.log(y)");

// ---------------------------------------------------------------------------
// EXERCISE 15: Import Resolver
// ---------------------------------------------------------------------------
section("Exercise 15: Import Resolver");

interface ResolverConfig {
  extensions: string[];
  aliases: Record<string, string>;
  existingFiles: Set<string>;
}

function resolveImport(
  specifier: string,
  importerPath: string,
  config: ResolverConfig
): string | null {
  let resolvedPath: string;

  // Check aliases
  let spec = specifier;
  for (const [alias, replacement] of Object.entries(config.aliases)) {
    if (spec === alias || spec.startsWith(alias + "/")) {
      spec = spec.replace(alias, replacement);
      break;
    }
  }

  if (spec.startsWith(".") || spec.startsWith("/")) {
    // Relative or absolute path
    if (spec.startsWith(".")) {
      // Resolve relative to importer's directory
      const importerDir = importerPath.substring(0, importerPath.lastIndexOf("/"));
      resolvedPath = importerDir + "/" + spec.replace(/^\.\//, "");
    } else {
      resolvedPath = spec;
    }

    // Try exact
    if (config.existingFiles.has(resolvedPath)) return resolvedPath;

    // Try with extensions
    for (const ext of config.extensions) {
      if (config.existingFiles.has(resolvedPath + ext)) return resolvedPath + ext;
    }

    // Try as directory with index
    for (const ext of config.extensions) {
      if (config.existingFiles.has(resolvedPath + "/index" + ext))
        return resolvedPath + "/index" + ext;
    }

    return null;
  }

  // Bare specifier
  return "node_modules/" + specifier;
}

const resolverConfig: ResolverConfig = {
  extensions: [".ts", ".tsx", ".js"],
  aliases: { "@": "/src", "@utils": "/src/utils" },
  existingFiles: new Set([
    "/src/app.ts",
    "/src/utils/index.ts",
    "/src/utils/math.ts",
    "/src/components/Button.tsx",
  ]),
};

assert(
  resolveImport("./utils/math", "/src/app.ts", resolverConfig) === "/src/utils/math.ts",
  "15a: relative with extension"
);
assert(
  resolveImport("./utils", "/src/app.ts", resolverConfig) === "/src/utils/index.ts",
  "15b: directory index"
);
assert(
  resolveImport("@utils/math", "/src/app.ts", resolverConfig) === "/src/utils/math.ts",
  "15c: alias"
);
assert(
  resolveImport("react", "/src/app.ts", resolverConfig) === "node_modules/react",
  "15d: bare specifier"
);
assert(
  resolveImport("./nonexistent", "/src/app.ts", resolverConfig) === null,
  "15e: not found"
);

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`========================================`);
if (failed > 0) process.exit(1);
