// ============================================================================
// How Code Runs — Exercises
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 15 exercises: 5 predict, 3 fix, 7 implement
// ============================================================================

// ---------------------------------------------------------------------------
// EXERCISE 1 (Implement): Simple Tokenizer/Lexer
// ---------------------------------------------------------------------------
// Implement a tokenizer that breaks a simple expression into tokens.
// Supported tokens: NUMBER, IDENTIFIER, PLUS, MINUS, STAR, SLASH,
//   EQUALS, SEMICOLON, LPAREN, RPAREN, WHITESPACE, CONST, LET

interface Token {
  type: string;
  value: string;
  position: number;
}

const KEYWORDS = new Set(["const", "let", "var", "function", "return", "if", "else"]);

function tokenize(input: string): Token[] {
  // YOUR CODE HERE
  // Walk through the string character by character:
  // - Digits (0-9): accumulate into NUMBER token
  // - Letters/underscore: accumulate into IDENTIFIER (or KEYWORD if matches)
  // - +, -, *, /: single-character operator tokens
  // - =: EQUALS
  // - ;: SEMICOLON
  // - (, ): LPAREN, RPAREN
  // - Whitespace: skip (or optionally collect)
  // Return array of tokens (excluding whitespace)
  return [];
}

// Tests:
// const tokens1 = tokenize("const x = 42;");
// console.assert(tokens1[0].type === "KEYWORD" && tokens1[0].value === "const", "1a");
// console.assert(tokens1[1].type === "IDENTIFIER" && tokens1[1].value === "x", "1b");
// console.assert(tokens1[2].type === "EQUALS", "1c");
// console.assert(tokens1[3].type === "NUMBER" && tokens1[3].value === "42", "1d");
// console.assert(tokens1[4].type === "SEMICOLON", "1e");
//
// const tokens2 = tokenize("a + b * 2");
// console.assert(tokens2.length === 5, "1f: 5 tokens");
// console.assert(tokens2[1].type === "PLUS", "1g");
// console.assert(tokens2[3].type === "STAR", "1h");
// console.log("1: Tokenizer working");

// ---------------------------------------------------------------------------
// EXERCISE 2 (Implement): Simple AST Builder
// ---------------------------------------------------------------------------
// Given tokens from a simple assignment like "const x = 5 + 3;",
// build a basic AST node. This is a simplified parser — only handle:
// const/let IDENTIFIER = EXPRESSION;
// where EXPRESSION is NUMBER or NUMBER OP NUMBER

interface ASTNode {
  type: string;
  [key: string]: unknown;
}

function parseAssignment(tokens: Token[]): ASTNode {
  // YOUR CODE HERE
  // Expected input tokens: KEYWORD IDENTIFIER EQUALS (expression) SEMICOLON
  // Return structure:
  // {
  //   type: "VariableDeclaration",
  //   kind: "const" | "let",
  //   declaration: {
  //     type: "VariableDeclarator",
  //     name: string,
  //     init: ASTNode  // NumberLiteral or BinaryExpression
  //   }
  // }
  return { type: "Unknown" };
}

// Tests:
// const ast1 = parseAssignment(tokenize("const x = 42;"));
// console.assert(ast1.type === "VariableDeclaration", "2a");
// console.assert((ast1.declaration as ASTNode).name === "x", "2b");
// console.assert(((ast1.declaration as ASTNode).init as ASTNode).type === "NumberLiteral", "2c");
//
// const ast2 = parseAssignment(tokenize("let sum = 5 + 3;"));
// console.assert(ast2.type === "VariableDeclaration", "2d");
// console.assert(((ast2.declaration as ASTNode).init as ASTNode).type === "BinaryExpression", "2e");
// console.assert(((ast2.declaration as ASTNode).init as ASTNode).operator === "+", "2f");
// console.log("2: AST builder working");

// ---------------------------------------------------------------------------
// EXERCISE 3 (Predict): Tree Shaking Behavior
// ---------------------------------------------------------------------------
// Given these module exports and imports, predict which functions will be
// included in the final bundle after tree shaking.

// Module: utils.ts
// export function add(a, b) { return a + b; }
// export function subtract(a, b) { return a - b; }
// export function multiply(a, b) { return a * b; }
// export function divide(a, b) { return a / b; }
// console.log("utils loaded");  // side effect!

// Module: app.ts
// import { add } from './utils';
// console.log(add(1, 2));

// Prediction 1: Which functions are included? → ???
// Prediction 2: Is the console.log("utils loaded") included? → ???
// Prediction 3: If package.json has "sideEffects": false, does that change? → ???

// ---------------------------------------------------------------------------
// EXERCISE 4 (Predict): Module Loading Order
// ---------------------------------------------------------------------------
// Predict the order of console.log outputs.

// Module: a.ts
// console.log("A: top-level");
// import { bValue } from './b';
// console.log("A: bValue is", bValue);

// Module: b.ts
// console.log("B: top-level");
// export const bValue = 42;

// Module: c.ts
// console.log("C: top-level");
// import './a';
// import './b';
// console.log("C: done");

// Prediction: What's the output order when c.ts is the entry point? → ???
// Hint: ES modules are evaluated depth-first, dependencies first.

// ---------------------------------------------------------------------------
// EXERCISE 5 (Predict): CommonJS vs ESM Behavior
// ---------------------------------------------------------------------------

// Predict the difference in behavior:

// counter.mjs (ESM)
// export let count = 0;
// export function increment() { count++; }

// app.mjs (ESM)
// import { count, increment } from './counter.mjs';
// console.log(count);  // Prediction A: ???
// increment();
// console.log(count);  // Prediction B: ???

// counter.cjs (CJS)
// let count = 0;
// module.exports = { count, get getCount() { return count; }, increment() { count++; } };

// app.cjs (CJS)
// const { count, increment } = require('./counter.cjs');
// console.log(count);  // Prediction C: ???
// increment();
// console.log(count);  // Prediction D: ???

// ---------------------------------------------------------------------------
// EXERCISE 6 (Predict): Dynamic Import Timing
// ---------------------------------------------------------------------------

// Predict the output order:

function exercise6() {
  // console.log("1: before import");
  //
  // const promise = import("./some-module.js");
  //
  // console.log("2: after import call");
  //
  // promise.then((mod) => {
  //   console.log("4: module loaded");
  // });
  //
  // console.log("3: after .then");

  // Prediction: Output order? → ???
}
exercise6();

// ---------------------------------------------------------------------------
// EXERCISE 7 (Predict): Minification Effects
// ---------------------------------------------------------------------------
// Predict which of these patterns will break after minification.

// Pattern A: Relying on function.name
// function calculateTotal() { ... }
// console.log(calculateTotal.name); // Before minification: ???
// // After minification: ???

// Pattern B: Using string-based property access
// obj["calculateTotal"]();  // Will this still work after minification? → ???
// obj.calculateTotal();     // Will this still work after minification? → ???

// Pattern C: Angular-style dependency injection (old style)
// function MyController($scope, $http) { ... }
// // Minifier changes $scope to "a", $http to "b" — does injection still work? → ???

// ---------------------------------------------------------------------------
// EXERCISE 8 (Implement): Basic Minifier
// ---------------------------------------------------------------------------
// Implement a simple code minifier that:
// 1. Removes single-line comments (// ...)
// 2. Removes multi-line comments (/* ... */)
// 3. Removes unnecessary whitespace (collapse multiple spaces/newlines)
// 4. Removes leading/trailing whitespace per line

function minify(code: string): string {
  // YOUR CODE HERE
  // Be careful: don't remove spaces inside strings!
  // For simplicity, you can assume no strings contain // or /*
  return "";
}

// Tests:
// const input1 = `
// // This is a comment
// const x = 42; // inline comment
// const y = x + 1;
// `;
// const min1 = minify(input1);
// console.assert(!min1.includes("//"), "8a: no single-line comments");
// console.assert(min1.includes("const x = 42;"), "8b: code preserved");
// console.assert(min1.includes("const y = x + 1;"), "8c: code preserved");
//
// const input2 = `
// /* multi
//    line
//    comment */
// function add(a, b) {
//   return a + b;
// }
// `;
// const min2 = minify(input2);
// console.assert(!min2.includes("/*"), "8d: no multi-line comments");
// console.assert(min2.includes("function add"), "8e: function preserved");
// console.log("8: Minifier working");

// ---------------------------------------------------------------------------
// EXERCISE 9 (Fix): Broken Tree Shaking
// ---------------------------------------------------------------------------
// This module structure prevents tree shaking. Fix it.

// BUG: Using a class with static methods — the whole class is included
// even if only one method is used.

class StringUtils {
  static capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  static lowercase(s: string): string {
    return s.toLowerCase();
  }

  static reverse(s: string): string {
    return [...s].reverse().join("");
  }

  static truncate(s: string, maxLen: number): string {
    return s.length > maxLen ? s.slice(0, maxLen) + "..." : s;
  }
}

// FIX: Refactor to named exports so unused functions can be tree-shaken

// YOUR FIX HERE: Export individual functions instead of a class

// Tests:
// console.assert(StringUtils.capitalize("hello") === "Hello", "9a");
// After fix, test the standalone functions:
// console.assert(capitalize("hello") === "Hello", "9a-fixed");
// console.assert(reverse("abc") === "cba", "9b-fixed");
// console.log("9: Tree shaking fix applied");

// ---------------------------------------------------------------------------
// EXERCISE 10 (Fix): Broken Source Map Lookup
// ---------------------------------------------------------------------------
// This simple source map lookup function has bugs. Fix it.
// A simplified source map maps generated line:col to original file:line:col.

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

function lookupOriginalPosition(
  sourceMap: SimpleSourceMap,
  generatedLine: number,
  generatedCol: number
): { file: string; line: number; col: number } | null {
  // BUG 1: Doesn't handle the case where exact position isn't found
  //        (should find the closest mapping that is <= the requested position)
  // BUG 2: Doesn't sort by specificity (line first, then column)

  const entry = sourceMap.mappings.find(
    (m) => m.generatedLine === generatedLine && m.generatedCol === generatedCol
  );

  if (!entry) return null;

  return {
    file: entry.originalFile,
    line: entry.originalLine,
    col: entry.originalCol,
  };
}

// FIX: Find the closest mapping at or before the requested position

function lookupOriginalPositionFixed(
  sourceMap: SimpleSourceMap,
  generatedLine: number,
  generatedCol: number
): { file: string; line: number; col: number } | null {
  // YOUR FIX HERE
  return null;
}

// Tests:
// const smap: SimpleSourceMap = {
//   mappings: [
//     { generatedLine: 1, generatedCol: 0, originalFile: "app.ts", originalLine: 1, originalCol: 0 },
//     { generatedLine: 1, generatedCol: 10, originalFile: "app.ts", originalLine: 2, originalCol: 0 },
//     { generatedLine: 1, generatedCol: 25, originalFile: "utils.ts", originalLine: 5, originalCol: 4 },
//     { generatedLine: 2, generatedCol: 0, originalFile: "utils.ts", originalLine: 10, originalCol: 0 },
//   ],
// };
//
// // Exact match
// const r1 = lookupOriginalPositionFixed(smap, 1, 0);
// console.assert(r1?.file === "app.ts" && r1?.line === 1, "10a: exact match");
//
// // Between mappings — should find closest preceding
// const r2 = lookupOriginalPositionFixed(smap, 1, 15);
// console.assert(r2?.file === "app.ts" && r2?.line === 2, "10b: closest preceding on same line");
//
// // No mapping before this position on this line
// const r3 = lookupOriginalPositionFixed(smap, 3, 0);
// console.assert(r3 === null, "10c: no mapping found");
// console.log("10: Source map lookup fixed");

// ---------------------------------------------------------------------------
// EXERCISE 11 (Fix): Module Import Order Bug
// ---------------------------------------------------------------------------
// This code has a bug related to module initialization order / circular dependency.
// Fix it.

// Simulating a circular dependency scenario:
const registry: Map<string, () => unknown> = new Map();

function registerModule(name: string, factory: () => unknown): void {
  registry.set(name, factory);
}

function getModule(name: string): unknown {
  const factory = registry.get(name);
  if (!factory) throw new Error(`Module "${name}" not found`);
  return factory();
}

// BUG: Module B tries to use Module A during initialization,
// but Module A hasn't been registered yet.
// FIX: Use lazy evaluation so modules are resolved at call time, not registration time.

// registerModule("a", () => {
//   const b = getModule("b") as { greet: () => string };
//   return { name: "A", greeting: b.greet() };
// });
//
// registerModule("b", () => {
//   return {
//     greet: () => "Hello from B",
//     getA: () => {
//       const a = getModule("a") as { name: string };
//       return a.name;
//     },
//   };
// });
//
// const modB = getModule("b") as { greet: () => string; getA: () => string };
// console.assert(modB.greet() === "Hello from B", "11a");
// console.assert(modB.getA() === "A", "11b");
// console.log("11: Module order fix working");

// ---------------------------------------------------------------------------
// EXERCISE 12 (Implement): VLQ Encoder/Decoder
// ---------------------------------------------------------------------------
// Source maps use VLQ (Variable-Length Quantity) encoding.
// Implement a simple VLQ encoder and decoder.
//
// VLQ encodes a signed integer into one or more Base64 characters.
// The least significant bit of the first group is the sign bit.
// Each 6-bit group: 5 bits of data + 1 continuation bit (high bit).

const VLQ_BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function vlqEncode(value: number): string {
  // YOUR CODE HERE
  // 1. Convert to "VLQ signed" — move sign to LSB
  //    positive: value << 1
  //    negative: (-value << 1) | 1
  // 2. Split into 5-bit groups
  // 3. Set continuation bit (bit 5) on all groups except the last
  // 4. Map each 6-bit value to Base64 character
  return "";
}

function vlqDecode(encoded: string): number[] {
  // YOUR CODE HERE
  // Decode a VLQ string into an array of numbers
  // Multiple values can be concatenated in the string
  return [];
}

// Tests:
// console.assert(vlqEncode(0) === "A", "12a: 0 → A");
// console.assert(vlqEncode(1) === "C", "12b: 1 → C");
// console.assert(vlqEncode(-1) === "D", "12c: -1 → D");
// console.assert(vlqEncode(16) === "gB", "12d: 16 → gB");
// console.assert(vlqEncode(-16) === "hB", "12e: -16 → hB");
//
// const decoded = vlqDecode("ACDD");
// console.assert(decoded[0] === 0, "12f: A → 0");
// console.assert(decoded[1] === 1, "12g: C → 1");
// console.assert(decoded[2] === -1, "12h: D → -1");
// console.assert(decoded[3] === -1, "12i: D → -1");
// console.log("12: VLQ encoder/decoder working");

// ---------------------------------------------------------------------------
// EXERCISE 13 (Implement): Bundle Dependency Graph
// ---------------------------------------------------------------------------
// Build a dependency graph from module imports and determine the correct
// evaluation order (topological sort).

interface ModuleDefinition {
  name: string;
  imports: string[];
}

function getEvaluationOrder(modules: ModuleDefinition[]): string[] {
  // YOUR CODE HERE
  // Perform a topological sort of the module dependency graph.
  // Dependencies are evaluated before dependents.
  // Throw Error if circular dependency is detected.
  return [];
}

// Tests:
// const modules: ModuleDefinition[] = [
//   { name: "app", imports: ["router", "store"] },
//   { name: "router", imports: ["utils"] },
//   { name: "store", imports: ["utils", "api"] },
//   { name: "api", imports: ["utils"] },
//   { name: "utils", imports: [] },
// ];
// const order = getEvaluationOrder(modules);
// const utilsIdx = order.indexOf("utils");
// const apiIdx = order.indexOf("api");
// const routerIdx = order.indexOf("router");
// const storeIdx = order.indexOf("store");
// const appIdx = order.indexOf("app");
// console.assert(utilsIdx < apiIdx, "13a: utils before api");
// console.assert(utilsIdx < routerIdx, "13b: utils before router");
// console.assert(apiIdx < storeIdx, "13c: api before store");
// console.assert(storeIdx < appIdx, "13d: store before app");
// console.assert(routerIdx < appIdx, "13e: router before app");
//
// // Test circular dependency detection
// let threw = false;
// try {
//   getEvaluationOrder([
//     { name: "a", imports: ["b"] },
//     { name: "b", imports: ["a"] },
//   ]);
// } catch { threw = true; }
// console.assert(threw, "13f: detects circular dependency");
// console.log("13: Dependency graph working");

// ---------------------------------------------------------------------------
// EXERCISE 14 (Implement): Simple Code Generator
// ---------------------------------------------------------------------------
// Given a basic AST, generate JavaScript code.

interface CodeGenNode {
  type: "Program" | "VariableDeclaration" | "BinaryExpression" |
        "NumberLiteral" | "Identifier" | "ExpressionStatement" |
        "CallExpression";
  [key: string]: unknown;
}

function generateCode(node: CodeGenNode): string {
  // YOUR CODE HERE
  // Handle each node type:
  // Program: { type, body: CodeGenNode[] } → join body with newlines
  // VariableDeclaration: { type, kind, name, init } → "const x = ..."
  // BinaryExpression: { type, operator, left, right } → "left op right"
  // NumberLiteral: { type, value } → "42"
  // Identifier: { type, name } → "x"
  // ExpressionStatement: { type, expression } → expression + ";"
  // CallExpression: { type, callee, arguments } → "callee(args)"
  return "";
}

// Tests:
// const ast: CodeGenNode = {
//   type: "Program",
//   body: [
//     {
//       type: "VariableDeclaration",
//       kind: "const",
//       name: "x",
//       init: { type: "NumberLiteral", value: 42 },
//     },
//     {
//       type: "VariableDeclaration",
//       kind: "let",
//       name: "y",
//       init: {
//         type: "BinaryExpression",
//         operator: "+",
//         left: { type: "Identifier", name: "x" },
//         right: { type: "NumberLiteral", value: 1 },
//       },
//     },
//     {
//       type: "ExpressionStatement",
//       expression: {
//         type: "CallExpression",
//         callee: { type: "Identifier", name: "console.log" },
//         arguments: [{ type: "Identifier", name: "y" }],
//       },
//     },
//   ],
// };
// const code = generateCode(ast);
// console.assert(code.includes("const x = 42"), "14a");
// console.assert(code.includes("let y = x + 1"), "14b");
// console.assert(code.includes("console.log(y)"), "14c");
// console.log("14: Code generator working\n" + code);

// ---------------------------------------------------------------------------
// EXERCISE 15 (Implement): Import Resolver
// ---------------------------------------------------------------------------
// Implement a simple module import resolver that maps import specifiers
// to file paths, handling relative paths, node_modules, and file extensions.

interface ResolverConfig {
  extensions: string[];        // e.g., [".ts", ".tsx", ".js"]
  aliases: Record<string, string>; // e.g., { "@": "/src" }
  existingFiles: Set<string>;  // Set of files that exist on disk
}

function resolveImport(
  specifier: string,
  importerPath: string,
  config: ResolverConfig
): string | null {
  // YOUR CODE HERE
  // Rules:
  // 1. If specifier starts with "." or "/", it's a relative/absolute path
  //    - Try exact path first
  //    - Try with each extension
  //    - Try as directory with /index + each extension
  // 2. If specifier starts with an alias key, replace the alias
  // 3. Otherwise, it's a bare specifier (node_modules) — return "node_modules/" + specifier
  // Return null if no file found
  return null;
}

// Tests:
// const config: ResolverConfig = {
//   extensions: [".ts", ".tsx", ".js"],
//   aliases: { "@": "/src", "@utils": "/src/utils" },
//   existingFiles: new Set([
//     "/src/app.ts",
//     "/src/utils/index.ts",
//     "/src/utils/math.ts",
//     "/src/components/Button.tsx",
//   ]),
// };
//
// // Relative with extension
// console.assert(
//   resolveImport("./utils/math", "/src/app.ts", config) === "/src/utils/math.ts",
//   "15a: relative with extension resolution"
// );
//
// // Directory with index
// console.assert(
//   resolveImport("./utils", "/src/app.ts", config) === "/src/utils/index.ts",
//   "15b: directory index resolution"
// );
//
// // Alias
// console.assert(
//   resolveImport("@utils/math", "/src/app.ts", config) === "/src/utils/math.ts",
//   "15c: alias resolution"
// );
//
// // Bare specifier
// console.assert(
//   resolveImport("react", "/src/app.ts", config) === "node_modules/react",
//   "15d: bare specifier"
// );
//
// // Not found
// console.assert(
//   resolveImport("./nonexistent", "/src/app.ts", config) === null,
//   "15e: not found"
// );
// console.log("15: Import resolver working");

// ---------------------------------------------------------------------------
// Compile check
// ---------------------------------------------------------------------------
void StringUtils;
console.log("exercises.ts compiled successfully — uncomment tests to verify your solutions.");
