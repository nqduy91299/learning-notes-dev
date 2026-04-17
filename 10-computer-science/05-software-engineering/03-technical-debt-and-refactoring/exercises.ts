// ============================================================================
// TOPIC 3: Technical Debt & Refactoring — Exercises
// ============================================================================
// Run: npx tsx 03-technical-debt-and-refactoring/exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// MINI TEST FRAMEWORK
// ============================================================================

const testResults: { passed: number; failed: number; errors: string[] } = {
  passed: 0,
  failed: 0,
  errors: [],
};

function test(name: string, fn: () => void): void {
  try {
    fn();
    testResults.passed++;
    console.log(`  ✓ ${name}`);
  } catch (e: unknown) {
    testResults.failed++;
    const msg = e instanceof Error ? e.message : String(e);
    testResults.errors.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}: ${msg}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, label = ""): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label ? label + ": " : ""}Expected ${e}, got ${a}`);
}

// ============================================================================
// EXERCISE 1 (IMPLEMENT): Cyclomatic Complexity Calculator
// Difficulty: ★★★★
// Topics: Code metrics, AST-like analysis
// ============================================================================
// Implement a function that calculates cyclomatic complexity of a function
// body string by counting decision points.
//
// Rules:
// - Base complexity = 1
// - +1 for each: if, else if, while, for, case, catch, &&, ||, ??
// - Does NOT need to be a full parser — string matching is fine

function calculateComplexity(code: string): number {
  // YOUR CODE HERE
  return 0;
}

// Tests:
// test("Exercise 1: simple function", () => {
//   assertEqual(calculateComplexity("return a + b;"), 1);
// });
// test("Exercise 1: if statement", () => {
//   assertEqual(calculateComplexity("if (a) { return 1; } return 0;"), 2);
// });
// test("Exercise 1: if-else-if", () => {
//   assertEqual(calculateComplexity("if (a) {} else if (b) {} else {}"), 3);
// });
// test("Exercise 1: logical operators", () => {
//   assertEqual(calculateComplexity("if (a && b || c) { return 1; }"), 4);
// });
// test("Exercise 1: loop and catch", () => {
//   assertEqual(calculateComplexity("for (const x of items) { try {} catch (e) {} }"), 3);
// });

// ============================================================================
// EXERCISE 2 (IMPLEMENT): Dependency Version Checker
// Difficulty: ★★★
// Topics: Semver comparison, dependency management
// ============================================================================
// Implement a dependency version checker that compares current vs latest versions.

interface DepInfo {
  name: string;
  current: string;  // e.g., "1.2.3"
  latest: string;   // e.g., "2.0.0"
}

interface DepReport {
  name: string;
  current: string;
  latest: string;
  status: "up-to-date" | "patch-behind" | "minor-behind" | "major-behind";
  majorsBehind: number;
}

function parseSemver(version: string): { major: number; minor: number; patch: number } {
  // YOUR CODE HERE
  return { major: 0, minor: 0, patch: 0 };
}

function checkDependency(dep: DepInfo): DepReport {
  // YOUR CODE HERE
  return undefined as unknown as DepReport;
}

function generateDepReport(deps: DepInfo[]): {
  reports: DepReport[];
  summary: { upToDate: number; patchBehind: number; minorBehind: number; majorBehind: number };
} {
  // YOUR CODE HERE
  return undefined as unknown as ReturnType<typeof generateDepReport>;
}

// Tests:
// test("Exercise 2: parseSemver", () => {
//   assertEqual(parseSemver("1.2.3"), { major: 1, minor: 2, patch: 3 });
//   assertEqual(parseSemver("10.0.0"), { major: 10, minor: 0, patch: 0 });
// });
// test("Exercise 2: up-to-date", () => {
//   const report = checkDependency({ name: "react", current: "18.2.0", latest: "18.2.0" });
//   assertEqual(report.status, "up-to-date");
// });
// test("Exercise 2: major behind", () => {
//   const report = checkDependency({ name: "webpack", current: "4.46.0", latest: "5.89.0" });
//   assertEqual(report.status, "major-behind");
//   assertEqual(report.majorsBehind, 1);
// });
// test("Exercise 2: full report", () => {
//   const result = generateDepReport([
//     { name: "react", current: "18.2.0", latest: "18.2.0" },
//     { name: "lodash", current: "4.17.20", latest: "4.17.21" },
//     { name: "webpack", current: "4.46.0", latest: "5.89.0" },
//   ]);
//   assertEqual(result.summary.upToDate, 1);
//   assertEqual(result.summary.patchBehind, 1);
//   assertEqual(result.summary.majorBehind, 1);
// });

// ============================================================================
// EXERCISE 3 (IMPLEMENT): Strangler Fig Migration Router
// Difficulty: ★★★★
// Topics: Strangler fig pattern, gradual migration
// ============================================================================
// Implement a router that gradually shifts traffic from legacy to new system.

interface MigrationRoute<T> {
  path: string;
  legacy: () => T;
  modern: () => T;
}

interface MigrationRouter<T> {
  register(route: MigrationRoute<T>): void;
  setMigrationPercent(path: string, percent: number): void;
  getMigrationPercent(path: string): number;
  handle(path: string): { result: T; source: "legacy" | "modern" };
  getStats(): { path: string; legacyCalls: number; modernCalls: number }[];
}

function createMigrationRouter<T>(
  randomFn?: () => number // injectable for testing (returns 0-1)
): MigrationRouter<T> {
  // YOUR CODE HERE
  return undefined as unknown as MigrationRouter<T>;
}

// Tests:
// test("Exercise 3: migration at 0%", () => {
//   const router = createMigrationRouter<string>(() => 0.5);
//   router.register({ path: "/checkout", legacy: () => "old", modern: () => "new" });
//   router.setMigrationPercent("/checkout", 0);
//   const result = router.handle("/checkout");
//   assertEqual(result.source, "legacy");
//   assertEqual(result.result, "old");
// });
// test("Exercise 3: migration at 100%", () => {
//   const router = createMigrationRouter<string>(() => 0.5);
//   router.register({ path: "/checkout", legacy: () => "old", modern: () => "new" });
//   router.setMigrationPercent("/checkout", 100);
//   const result = router.handle("/checkout");
//   assertEqual(result.source, "modern");
//   assertEqual(result.result, "new");
// });
// test("Exercise 3: migration at 50% with low random", () => {
//   const router = createMigrationRouter<string>(() => 0.3);
//   router.register({ path: "/api", legacy: () => "old", modern: () => "new" });
//   router.setMigrationPercent("/api", 50);
//   const result = router.handle("/api");
//   assertEqual(result.source, "modern");
// });
// test("Exercise 3: stats tracking", () => {
//   let callNum = 0;
//   const router = createMigrationRouter<string>(() => {
//     callNum++;
//     return callNum <= 2 ? 0.1 : 0.9;
//   });
//   router.register({ path: "/test", legacy: () => "old", modern: () => "new" });
//   router.setMigrationPercent("/test", 50);
//   router.handle("/test"); // 0.1 < 0.5 → modern
//   router.handle("/test"); // 0.1 < 0.5 → modern
//   router.handle("/test"); // 0.9 >= 0.5 → legacy
//   const stats = router.getStats();
//   assertEqual(stats[0].modernCalls, 2);
//   assertEqual(stats[0].legacyCalls, 1);
// });

// ============================================================================
// EXERCISE 4 (IMPLEMENT): Feature Flag System
// Difficulty: ★★★
// Topics: Feature flags, gradual rollout
// ============================================================================

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercent: number; // 0-100
  allowList: string[];    // user IDs that always get the feature
}

interface FeatureFlagService {
  addFlag(flag: FeatureFlag): void;
  isEnabled(flagName: string, userId?: string): boolean;
  getAllFlags(): FeatureFlag[];
  toggleFlag(flagName: string, enabled: boolean): void;
}

function createFeatureFlagService(
  randomFn?: () => number
): FeatureFlagService {
  // YOUR CODE HERE
  return undefined as unknown as FeatureFlagService;
}

// Tests:
// test("Exercise 4: disabled flag", () => {
//   const service = createFeatureFlagService(() => 0.5);
//   service.addFlag({ name: "new-ui", enabled: false, rolloutPercent: 100, allowList: [] });
//   assert(!service.isEnabled("new-ui"), "disabled flag should return false");
// });
// test("Exercise 4: allow list", () => {
//   const service = createFeatureFlagService(() => 0.99);
//   service.addFlag({ name: "beta", enabled: true, rolloutPercent: 0, allowList: ["user-1"] });
//   assert(service.isEnabled("beta", "user-1"), "allow-listed user should see feature");
//   assert(!service.isEnabled("beta", "user-2"), "non-listed user should not");
// });
// test("Exercise 4: rollout percent", () => {
//   const service = createFeatureFlagService(() => 0.3);
//   service.addFlag({ name: "exp", enabled: true, rolloutPercent: 50, allowList: [] });
//   assert(service.isEnabled("exp"), "0.3 < 0.5 should be enabled");
// });
// test("Exercise 4: toggle flag", () => {
//   const service = createFeatureFlagService();
//   service.addFlag({ name: "test", enabled: true, rolloutPercent: 100, allowList: [] });
//   assert(service.isEnabled("test"), "should be enabled");
//   service.toggleFlag("test", false);
//   assert(!service.isEnabled("test"), "should be disabled after toggle");
// });

// ============================================================================
// EXERCISE 5 (IMPLEMENT): Extract Function Refactoring
// Difficulty: ★★★
// Topics: Extract function technique
// ============================================================================
// This function does too much. Extract it into smaller functions.

interface RawTransaction {
  amount: number;
  currency: string;
  date: string;     // ISO date string
  category: string;
  description: string;
}

interface ProcessedTransaction {
  amountUSD: number;
  date: Date;
  category: string;
  description: string;
  isLarge: boolean;
  month: string;
}

// Conversion rates (simplified)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
};

const LARGE_TRANSACTION_THRESHOLD = 1000;

function convertToUSD(amount: number, currency: string): number {
  // YOUR CODE HERE
  return 0;
}

function isLargeTransaction(amountUSD: number): boolean {
  // YOUR CODE HERE
  return false;
}

function formatMonth(date: Date): string {
  // YOUR CODE HERE — return "YYYY-MM"
  return "";
}

function processTransaction(raw: RawTransaction): ProcessedTransaction {
  // YOUR CODE HERE — compose the above functions
  return undefined as unknown as ProcessedTransaction;
}

// Tests:
// test("Exercise 5: convertToUSD", () => {
//   assertEqual(convertToUSD(100, "USD"), 100);
//   assertEqual(convertToUSD(100, "EUR"), 108);
// });
// test("Exercise 5: isLargeTransaction", () => {
//   assert(isLargeTransaction(1500), "1500 is large");
//   assert(!isLargeTransaction(500), "500 is not large");
// });
// test("Exercise 5: formatMonth", () => {
//   assertEqual(formatMonth(new Date("2024-03-15")), "2024-03");
// });
// test("Exercise 5: processTransaction", () => {
//   const result = processTransaction({
//     amount: 1000,
//     currency: "EUR",
//     date: "2024-06-15",
//     category: "office",
//     description: "Supplies",
//   });
//   assertEqual(result.amountUSD, 1080);
//   assert(result.isLarge, "EUR 1000 = USD 1080 is large");
//   assertEqual(result.month, "2024-06");
// });

// ============================================================================
// EXERCISE 6 (IMPLEMENT): Tech Debt Tracker
// Difficulty: ★★★
// Topics: Tracking and prioritizing debt
// ============================================================================

type DebtType = "code" | "architecture" | "test" | "documentation" | "dependency";
type Priority = "low" | "medium" | "high" | "critical";

interface TechDebtItem {
  id: string;
  title: string;
  type: DebtType;
  priority: Priority;
  estimatedHours: number;
  interestPerSprint: number; // hours lost per sprint due to this debt
  createdAt: Date;
}

interface DebtTracker {
  add(item: Omit<TechDebtItem, "id" | "createdAt">): string;
  remove(id: string): boolean;
  getAll(): TechDebtItem[];
  getByType(type: DebtType): TechDebtItem[];
  getByPriority(priority: Priority): TechDebtItem[];
  getTotalInterest(): number;
  getROI(): { id: string; title: string; roi: number }[]; // sorted by ROI desc
}

function createDebtTracker(): DebtTracker {
  // ROI = interestPerSprint / estimatedHours (higher = better payoff)
  // YOUR CODE HERE
  return undefined as unknown as DebtTracker;
}

// Tests:
// test("Exercise 6: add and retrieve", () => {
//   const tracker = createDebtTracker();
//   const id = tracker.add({ title: "Fix auth module", type: "code", priority: "high", estimatedHours: 8, interestPerSprint: 4 });
//   assert(typeof id === "string", "should return id");
//   assertEqual(tracker.getAll().length, 1);
// });
// test("Exercise 6: filter by type", () => {
//   const tracker = createDebtTracker();
//   tracker.add({ title: "Fix auth", type: "code", priority: "high", estimatedHours: 8, interestPerSprint: 4 });
//   tracker.add({ title: "Add tests", type: "test", priority: "medium", estimatedHours: 12, interestPerSprint: 2 });
//   assertEqual(tracker.getByType("code").length, 1);
//   assertEqual(tracker.getByType("test").length, 1);
// });
// test("Exercise 6: ROI calculation", () => {
//   const tracker = createDebtTracker();
//   tracker.add({ title: "Quick fix", type: "code", priority: "high", estimatedHours: 2, interestPerSprint: 4 }); // ROI: 2.0
//   tracker.add({ title: "Big refactor", type: "architecture", priority: "medium", estimatedHours: 40, interestPerSprint: 4 }); // ROI: 0.1
//   const roi = tracker.getROI();
//   assertEqual(roi[0].title, "Quick fix");
//   assert(roi[0].roi > roi[1].roi, "Quick fix should have higher ROI");
// });

// ============================================================================
// EXERCISE 7 (IMPLEMENT): Code Smell Detector
// Difficulty: ★★★
// Topics: Static analysis, code quality
// ============================================================================
// Implement a simple code smell detector that analyzes function strings.

interface CodeSmell {
  type: string;
  message: string;
  severity: "info" | "warning" | "error";
}

function detectCodeSmells(code: string): CodeSmell[] {
  // Detect:
  // 1. Long function (>20 lines) → warning "Function is too long"
  // 2. Deep nesting (>3 levels of {) → warning "Deeply nested code"
  // 3. Magic numbers (numbers other than 0, 1, -1) → info "Magic number detected"
  // 4. console.log usage → info "Console statement found"
  // 5. any type annotation → error "Using 'any' type"
  // YOUR CODE HERE
  return [];
}

// Tests:
// test("Exercise 7: long function", () => {
//   const longCode = Array(25).fill("  const x = 1;").join("\n");
//   const smells = detectCodeSmells(longCode);
//   assert(smells.some(s => s.type === "long-function"), "should detect long function");
// });
// test("Exercise 7: magic numbers", () => {
//   const smells = detectCodeSmells("const timeout = 3000;");
//   assert(smells.some(s => s.type === "magic-number"), "should detect magic number");
// });
// test("Exercise 7: console.log", () => {
//   const smells = detectCodeSmells('console.log("debug");');
//   assert(smells.some(s => s.type === "console-statement"), "should detect console");
// });
// test("Exercise 7: any type", () => {
//   const smells = detectCodeSmells("function foo(x: any): any {}");
//   assert(smells.some(s => s.type === "any-type"), "should detect any");
// });
// test("Exercise 7: clean code", () => {
//   const smells = detectCodeSmells("const x = 1;");
//   assert(smells.length === 0, "clean code should have no smells");
// });

// ============================================================================
// EXERCISE 8 (PREDICT): Fowler's Quadrant
// Difficulty: ★★
// ============================================================================

function exercise8_predict(): string {
  // A team says: "We know we should write tests, but the deadline is tomorrow.
  // We'll add them next week."
  // Which quadrant of Fowler's tech debt matrix is this?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 8: Fowler's quadrant", () => {
//   const answer = exercise8_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("prudent") && answer.toLowerCase().includes("deliberate"),
//     "should identify as prudent + deliberate"
//   );
// });

// ============================================================================
// EXERCISE 9 (PREDICT): When to refactor?
// Difficulty: ★★
// ============================================================================

function exercise9_predict(): string {
  // Scenario: A module has messy code but works perfectly, hasn't been
  // touched in 2 years, and has no planned changes. A developer wants to
  // refactor it "because it bothers them."
  // Should they refactor it?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 9: when to refactor", () => {
//   const answer = exercise9_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("no") || answer.toLowerCase().includes("leave"),
//     "should recommend NOT refactoring stable untouched code"
//   );
// });

// ============================================================================
// EXERCISE 10 (PREDICT): Safe refactoring prerequisite
// Difficulty: ★★
// ============================================================================

function exercise10_predict(): string {
  // What is the MOST important prerequisite before starting a refactor?
  // a) Management approval  b) Tests  c) Documentation  d) Pair programming
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 10: refactoring prerequisite", () => {
//   const answer = exercise10_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("test") || answer.toLowerCase().includes("b"),
//     "tests are the most important prerequisite"
//   );
// });

// ============================================================================
// EXERCISE 11 (PREDICT): Strangler fig vs big bang
// Difficulty: ★★
// ============================================================================

function exercise11_predict(): string {
  // Why is the strangler fig pattern preferred over a "big bang" rewrite?
  return "YOUR ANSWER HERE";
}

// Tests:
// test("Exercise 11: strangler fig benefit", () => {
//   const answer = exercise11_predict();
//   assert(answer !== "YOUR ANSWER HERE", "must provide answer");
//   assert(
//     answer.toLowerCase().includes("gradual") ||
//     answer.toLowerCase().includes("risk") ||
//     answer.toLowerCase().includes("incremental"),
//     "should mention gradual/incremental migration or reduced risk"
//   );
// });

// ============================================================================
// EXERCISE 12 (FIX/REFACTOR): Extract class from god object
// Difficulty: ★★★
// Topics: Extract class, SRP
// ============================================================================
// This "god object" does everything. Split it into focused classes.

// BEFORE (god object):
// class AppManager {
//   users: Map<string, { name: string; email: string }> = new Map();
//   products: Map<string, { name: string; price: number }> = new Map();
//   addUser(id: string, name: string, email: string) { ... }
//   getUser(id: string) { ... }
//   addProduct(id: string, name: string, price: number) { ... }
//   getProduct(id: string) { ... }
//   getUserOrderTotal(userId: string, productIds: string[]) { ... }
// }

class UserManager {
  private users = new Map<string, { name: string; email: string }>();

  add(id: string, name: string, email: string): void {
    // YOUR CODE HERE
  }

  get(id: string): { name: string; email: string } | undefined {
    // YOUR CODE HERE
    return undefined;
  }
}

class ProductCatalog {
  private products = new Map<string, { name: string; price: number }>();

  add(id: string, name: string, price: number): void {
    // YOUR CODE HERE
  }

  get(id: string): { name: string; price: number } | undefined {
    // YOUR CODE HERE
    return undefined;
  }

  getTotal(ids: string[]): number {
    // YOUR CODE HERE
    return 0;
  }
}

// Tests:
// test("Exercise 12: UserManager", () => {
//   const users = new UserManager();
//   users.add("1", "Alice", "alice@test.com");
//   const user = users.get("1");
//   assert(user !== undefined, "should find user");
//   assertEqual(user!.name, "Alice");
// });
// test("Exercise 12: ProductCatalog", () => {
//   const catalog = new ProductCatalog();
//   catalog.add("p1", "Widget", 10);
//   catalog.add("p2", "Gadget", 25);
//   assertEqual(catalog.getTotal(["p1", "p2"]), 35);
//   assertEqual(catalog.get("p1")!.name, "Widget");
// });

// ============================================================================
// EXERCISE 13 (FIX/REFACTOR): Replace conditional with polymorphism
// Difficulty: ★★★
// Topics: Refactoring techniques
// ============================================================================

// BEFORE:
// function calculatePay(type: string, hoursWorked: number, rate: number): number {
//   if (type === "fulltime") return hoursWorked * rate;
//   if (type === "contractor") return hoursWorked * rate * 1.2; // 20% premium
//   if (type === "intern") return hoursWorked * rate * 0.5;
//   return 0;
// }

interface PayCalculator {
  calculate(hoursWorked: number, rate: number): number;
}

function createFullTimeCalculator(): PayCalculator {
  // YOUR CODE HERE
  return undefined as unknown as PayCalculator;
}

function createContractorCalculator(): PayCalculator {
  // YOUR CODE HERE
  return undefined as unknown as PayCalculator;
}

function createInternCalculator(): PayCalculator {
  // YOUR CODE HERE
  return undefined as unknown as PayCalculator;
}

// Tests:
// test("Exercise 13: full-time pay", () => {
//   assertEqual(createFullTimeCalculator().calculate(40, 50), 2000);
// });
// test("Exercise 13: contractor pay", () => {
//   assertEqual(createContractorCalculator().calculate(40, 50), 2400);
// });
// test("Exercise 13: intern pay", () => {
//   assertEqual(createInternCalculator().calculate(40, 50), 1000);
// });

// ============================================================================
// EXERCISE 14 (FIX/REFACTOR): Introduce parameter object
// Difficulty: ★★
// Topics: Refactoring techniques
// ============================================================================

// BEFORE:
// function searchProducts(
//   query: string, minPrice: number, maxPrice: number,
//   category: string, inStock: boolean, sortBy: string, limit: number
// ): string { ... }

interface SearchCriteria {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
  sortBy?: string;
  limit?: number;
}

function searchProducts(criteria: SearchCriteria): string {
  // YOUR CODE HERE
  // Return a description of the search for testing purposes
  return "";
}

// Tests:
// test("Exercise 14: basic search", () => {
//   const result = searchProducts({ query: "laptop" });
//   assert(result.includes("laptop"), "should include query");
// });
// test("Exercise 14: filtered search", () => {
//   const result = searchProducts({
//     query: "phone",
//     minPrice: 100,
//     maxPrice: 500,
//     category: "electronics",
//     inStock: true,
//     sortBy: "price",
//     limit: 10,
//   });
//   assert(result.includes("phone"), "should include query");
//   assert(result.includes("100"), "should include min price");
//   assert(result.includes("electronics"), "should include category");
// });

// ============================================================================
// EXERCISE 15 (FIX/REFACTOR): Inline unnecessary abstraction
// Difficulty: ★★
// Topics: When NOT to abstract
// ============================================================================
// This code is over-abstracted. Simplify it.

// BEFORE:
// class StringHelper { static trim(s: string): string { return s.trim(); } }
// class NumberHelper { static isPositive(n: number): boolean { return n > 0; } }
// class ArrayHelper { static first<T>(arr: T[]): T | undefined { return arr[0]; } }
// Usage: StringHelper.trim(name), NumberHelper.isPositive(amount), ArrayHelper.first(items)

// AFTER: Just use the language directly. No helpers needed.
// Demonstrate that these abstractions add no value by writing the clean version.

function processUserInput(name: string, amount: number, tags: string[]): {
  cleanName: string;
  isValid: boolean;
  primaryTag: string | undefined;
} {
  // YOUR CODE HERE — use built-in methods directly, no helper classes
  return { cleanName: "", isValid: false, primaryTag: undefined };
}

// Tests:
// test("Exercise 15: inlined abstractions", () => {
//   const result = processUserInput("  Alice  ", 42, ["vip", "new"]);
//   assertEqual(result.cleanName, "Alice");
//   assertEqual(result.isValid, true);
//   assertEqual(result.primaryTag, "vip");
// });
// test("Exercise 15: negative amount", () => {
//   const result = processUserInput("Bob", -5, []);
//   assertEqual(result.isValid, false);
//   assertEqual(result.primaryTag, undefined);
// });

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n=== Technical Debt & Refactoring — Exercises ===\n");
console.log("All exercises are set up with test stubs.");
console.log("Uncomment the test blocks to verify your solutions.");
console.log("Implement each function replacing 'YOUR CODE HERE'.\n");

export {
  calculateComplexity,
  parseSemver,
  checkDependency,
  generateDepReport,
  createMigrationRouter,
  createFeatureFlagService,
  convertToUSD,
  isLargeTransaction,
  formatMonth,
  processTransaction,
  createDebtTracker,
  detectCodeSmells,
  UserManager,
  ProductCatalog,
  createFullTimeCalculator,
  createContractorCalculator,
  createInternCalculator,
  searchProducts,
  processUserInput,
};
