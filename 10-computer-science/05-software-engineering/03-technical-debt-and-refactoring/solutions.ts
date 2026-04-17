// ============================================================================
// TOPIC 3: Technical Debt & Refactoring — Solutions
// ============================================================================
// Run: npx tsx 03-technical-debt-and-refactoring/solutions.ts
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
// SOLUTION 1: Cyclomatic Complexity Calculator
// ============================================================================

function calculateComplexity(code: string): number {
  let complexity = 1;

  // Count decision points using regex
  // Use word boundaries to avoid matching inside identifiers
  const patterns: RegExp[] = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bwhile\s*\(/g,
    /\bfor\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?\?/g,
  ];

  for (const pattern of patterns) {
    const matches = code.match(pattern);
    if (matches) complexity += matches.length;
  }

  // "else if" was counted by both `if` and `else if` patterns — but we want
  // it counted only once. The `if` pattern already catches it via `if\s*\(`.
  // The `else if` pattern adds a second count. Remove the `else if` pattern
  // and just count `if` which includes `else if`.
  // Let's recalculate properly:
  complexity = 1;
  const ifMatches = code.match(/\bif\s*\(/g);
  const whileMatches = code.match(/\bwhile\s*\(/g);
  const forMatches = code.match(/\bfor\s*[\s(]/g);
  const caseMatches = code.match(/\bcase\s+/g);
  const catchMatches = code.match(/\bcatch\s*[\s(]/g);
  const andMatches = code.match(/&&/g);
  const orMatches = code.match(/\|\|/g);
  const nullishMatches = code.match(/\?\?/g);

  if (ifMatches) complexity += ifMatches.length;
  if (whileMatches) complexity += whileMatches.length;
  if (forMatches) complexity += forMatches.length;
  if (caseMatches) complexity += caseMatches.length;
  if (catchMatches) complexity += catchMatches.length;
  if (andMatches) complexity += andMatches.length;
  if (orMatches) complexity += orMatches.length;
  if (nullishMatches) complexity += nullishMatches.length;

  return complexity;
}

test("Exercise 1: simple function", () => {
  assertEqual(calculateComplexity("return a + b;"), 1);
});

test("Exercise 1: if statement", () => {
  assertEqual(calculateComplexity("if (a) { return 1; } return 0;"), 2);
});

test("Exercise 1: if-else-if", () => {
  assertEqual(calculateComplexity("if (a) {} else if (b) {} else {}"), 3);
});

test("Exercise 1: logical operators", () => {
  assertEqual(calculateComplexity("if (a && b || c) { return 1; }"), 4);
});

test("Exercise 1: loop and catch", () => {
  assertEqual(calculateComplexity("for (const x of items) { try {} catch (e) {} }"), 3);
});

// ============================================================================
// SOLUTION 2: Dependency Version Checker
// ============================================================================

interface DepInfo {
  name: string;
  current: string;
  latest: string;
}

interface DepReport {
  name: string;
  current: string;
  latest: string;
  status: "up-to-date" | "patch-behind" | "minor-behind" | "major-behind";
  majorsBehind: number;
}

function parseSemver(version: string): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = version.split(".").map(Number);
  return { major, minor, patch };
}

function checkDependency(dep: DepInfo): DepReport {
  const current = parseSemver(dep.current);
  const latest = parseSemver(dep.latest);

  let status: DepReport["status"] = "up-to-date";
  const majorsBehind = latest.major - current.major;

  if (majorsBehind > 0) {
    status = "major-behind";
  } else if (latest.minor > current.minor) {
    status = "minor-behind";
  } else if (latest.patch > current.patch) {
    status = "patch-behind";
  }

  return {
    name: dep.name,
    current: dep.current,
    latest: dep.latest,
    status,
    majorsBehind,
  };
}

function generateDepReport(deps: DepInfo[]): {
  reports: DepReport[];
  summary: { upToDate: number; patchBehind: number; minorBehind: number; majorBehind: number };
} {
  const reports = deps.map(checkDependency);
  const summary = {
    upToDate: reports.filter((r) => r.status === "up-to-date").length,
    patchBehind: reports.filter((r) => r.status === "patch-behind").length,
    minorBehind: reports.filter((r) => r.status === "minor-behind").length,
    majorBehind: reports.filter((r) => r.status === "major-behind").length,
  };
  return { reports, summary };
}

test("Exercise 2: parseSemver", () => {
  assertEqual(parseSemver("1.2.3"), { major: 1, minor: 2, patch: 3 });
  assertEqual(parseSemver("10.0.0"), { major: 10, minor: 0, patch: 0 });
});

test("Exercise 2: up-to-date", () => {
  const report = checkDependency({ name: "react", current: "18.2.0", latest: "18.2.0" });
  assertEqual(report.status, "up-to-date");
});

test("Exercise 2: major behind", () => {
  const report = checkDependency({ name: "webpack", current: "4.46.0", latest: "5.89.0" });
  assertEqual(report.status, "major-behind");
  assertEqual(report.majorsBehind, 1);
});

test("Exercise 2: full report", () => {
  const result = generateDepReport([
    { name: "react", current: "18.2.0", latest: "18.2.0" },
    { name: "lodash", current: "4.17.20", latest: "4.17.21" },
    { name: "webpack", current: "4.46.0", latest: "5.89.0" },
  ]);
  assertEqual(result.summary.upToDate, 1);
  assertEqual(result.summary.patchBehind, 1);
  assertEqual(result.summary.majorBehind, 1);
});

// ============================================================================
// SOLUTION 3: Strangler Fig Migration Router
// ============================================================================

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
  randomFn: () => number = Math.random
): MigrationRouter<T> {
  const routes = new Map<string, MigrationRoute<T>>();
  const percents = new Map<string, number>();
  const stats = new Map<string, { legacyCalls: number; modernCalls: number }>();

  return {
    register(route: MigrationRoute<T>): void {
      routes.set(route.path, route);
      percents.set(route.path, 0);
      stats.set(route.path, { legacyCalls: 0, modernCalls: 0 });
    },

    setMigrationPercent(path: string, percent: number): void {
      percents.set(path, Math.max(0, Math.min(100, percent)));
    },

    getMigrationPercent(path: string): number {
      return percents.get(path) ?? 0;
    },

    handle(path: string): { result: T; source: "legacy" | "modern" } {
      const route = routes.get(path);
      if (!route) throw new Error(`Unknown route: ${path}`);

      const percent = percents.get(path) ?? 0;
      const stat = stats.get(path)!;
      const useModern = randomFn() * 100 < percent;

      if (useModern) {
        stat.modernCalls++;
        return { result: route.modern(), source: "modern" };
      } else {
        stat.legacyCalls++;
        return { result: route.legacy(), source: "legacy" };
      }
    },

    getStats(): { path: string; legacyCalls: number; modernCalls: number }[] {
      return [...stats.entries()].map(([path, s]) => ({
        path,
        legacyCalls: s.legacyCalls,
        modernCalls: s.modernCalls,
      }));
    },
  };
}

test("Exercise 3: migration at 0%", () => {
  const router = createMigrationRouter<string>(() => 0.5);
  router.register({ path: "/checkout", legacy: () => "old", modern: () => "new" });
  router.setMigrationPercent("/checkout", 0);
  const result = router.handle("/checkout");
  assertEqual(result.source, "legacy");
  assertEqual(result.result, "old");
});

test("Exercise 3: migration at 100%", () => {
  const router = createMigrationRouter<string>(() => 0.5);
  router.register({ path: "/checkout", legacy: () => "old", modern: () => "new" });
  router.setMigrationPercent("/checkout", 100);
  const result = router.handle("/checkout");
  assertEqual(result.source, "modern");
  assertEqual(result.result, "new");
});

test("Exercise 3: migration at 50% with low random", () => {
  const router = createMigrationRouter<string>(() => 0.3);
  router.register({ path: "/api", legacy: () => "old", modern: () => "new" });
  router.setMigrationPercent("/api", 50);
  const result = router.handle("/api");
  assertEqual(result.source, "modern");
});

test("Exercise 3: stats tracking", () => {
  let callNum = 0;
  const router = createMigrationRouter<string>(() => {
    callNum++;
    return callNum <= 2 ? 0.1 : 0.9;
  });
  router.register({ path: "/test", legacy: () => "old", modern: () => "new" });
  router.setMigrationPercent("/test", 50);
  router.handle("/test");
  router.handle("/test");
  router.handle("/test");
  const routerStats = router.getStats();
  assertEqual(routerStats[0].modernCalls, 2);
  assertEqual(routerStats[0].legacyCalls, 1);
});

// ============================================================================
// SOLUTION 4: Feature Flag System
// ============================================================================

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercent: number;
  allowList: string[];
}

interface FeatureFlagService {
  addFlag(flag: FeatureFlag): void;
  isEnabled(flagName: string, userId?: string): boolean;
  getAllFlags(): FeatureFlag[];
  toggleFlag(flagName: string, enabled: boolean): void;
}

function createFeatureFlagService(
  randomFn: () => number = Math.random
): FeatureFlagService {
  const flags = new Map<string, FeatureFlag>();

  return {
    addFlag(flag: FeatureFlag): void {
      flags.set(flag.name, { ...flag });
    },

    isEnabled(flagName: string, userId?: string): boolean {
      const flag = flags.get(flagName);
      if (!flag) return false;
      if (!flag.enabled) return false;

      // Check allow list first
      if (userId && flag.allowList.includes(userId)) return true;

      // Check rollout percent
      return randomFn() * 100 < flag.rolloutPercent;
    },

    getAllFlags(): FeatureFlag[] {
      return [...flags.values()];
    },

    toggleFlag(flagName: string, enabled: boolean): void {
      const flag = flags.get(flagName);
      if (flag) flag.enabled = enabled;
    },
  };
}

test("Exercise 4: disabled flag", () => {
  const service = createFeatureFlagService(() => 0.5);
  service.addFlag({ name: "new-ui", enabled: false, rolloutPercent: 100, allowList: [] });
  assert(!service.isEnabled("new-ui"), "disabled flag should return false");
});

test("Exercise 4: allow list", () => {
  const service = createFeatureFlagService(() => 0.99);
  service.addFlag({ name: "beta", enabled: true, rolloutPercent: 0, allowList: ["user-1"] });
  assert(service.isEnabled("beta", "user-1"), "allow-listed user should see feature");
  assert(!service.isEnabled("beta", "user-2"), "non-listed user should not");
});

test("Exercise 4: rollout percent", () => {
  const service = createFeatureFlagService(() => 0.3);
  service.addFlag({ name: "exp", enabled: true, rolloutPercent: 50, allowList: [] });
  assert(service.isEnabled("exp"), "0.3 < 0.5 should be enabled");
});

test("Exercise 4: toggle flag", () => {
  const service = createFeatureFlagService();
  service.addFlag({ name: "test", enabled: true, rolloutPercent: 100, allowList: [] });
  assert(service.isEnabled("test"), "should be enabled");
  service.toggleFlag("test", false);
  assert(!service.isEnabled("test"), "should be disabled after toggle");
});

// ============================================================================
// SOLUTION 5: Extract Function Refactoring
// ============================================================================

const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
};

const LARGE_TRANSACTION_THRESHOLD = 1000;

interface RawTransaction {
  amount: number;
  currency: string;
  date: string;
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

function convertToUSD(amount: number, currency: string): number {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}

function isLargeTransaction(amountUSD: number): boolean {
  return amountUSD >= LARGE_TRANSACTION_THRESHOLD;
}

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function processTransaction(raw: RawTransaction): ProcessedTransaction {
  const amountUSD = convertToUSD(raw.amount, raw.currency);
  const date = new Date(raw.date);

  return {
    amountUSD,
    date,
    category: raw.category,
    description: raw.description,
    isLarge: isLargeTransaction(amountUSD),
    month: formatMonth(date),
  };
}

test("Exercise 5: convertToUSD", () => {
  assertEqual(convertToUSD(100, "USD"), 100);
  assertEqual(convertToUSD(100, "EUR"), 108);
});

test("Exercise 5: isLargeTransaction", () => {
  assert(isLargeTransaction(1500), "1500 is large");
  assert(!isLargeTransaction(500), "500 is not large");
});

test("Exercise 5: formatMonth", () => {
  assertEqual(formatMonth(new Date("2024-03-15")), "2024-03");
});

test("Exercise 5: processTransaction", () => {
  const result = processTransaction({
    amount: 1000,
    currency: "EUR",
    date: "2024-06-15",
    category: "office",
    description: "Supplies",
  });
  assertEqual(result.amountUSD, 1080);
  assert(result.isLarge, "EUR 1000 = USD 1080 is large");
  assertEqual(result.month, "2024-06");
});

// ============================================================================
// SOLUTION 6: Tech Debt Tracker
// ============================================================================

type DebtType = "code" | "architecture" | "test" | "documentation" | "dependency";
type Priority = "low" | "medium" | "high" | "critical";

interface TechDebtItem {
  id: string;
  title: string;
  type: DebtType;
  priority: Priority;
  estimatedHours: number;
  interestPerSprint: number;
  createdAt: Date;
}

interface DebtTracker {
  add(item: Omit<TechDebtItem, "id" | "createdAt">): string;
  remove(id: string): boolean;
  getAll(): TechDebtItem[];
  getByType(type: DebtType): TechDebtItem[];
  getByPriority(priority: Priority): TechDebtItem[];
  getTotalInterest(): number;
  getROI(): { id: string; title: string; roi: number }[];
}

function createDebtTracker(): DebtTracker {
  const items = new Map<string, TechDebtItem>();
  let nextId = 1;

  return {
    add(item: Omit<TechDebtItem, "id" | "createdAt">): string {
      const id = `debt-${nextId++}`;
      items.set(id, { ...item, id, createdAt: new Date() });
      return id;
    },

    remove(id: string): boolean {
      return items.delete(id);
    },

    getAll(): TechDebtItem[] {
      return [...items.values()];
    },

    getByType(type: DebtType): TechDebtItem[] {
      return [...items.values()].filter((i) => i.type === type);
    },

    getByPriority(priority: Priority): TechDebtItem[] {
      return [...items.values()].filter((i) => i.priority === priority);
    },

    getTotalInterest(): number {
      return [...items.values()].reduce((sum, i) => sum + i.interestPerSprint, 0);
    },

    getROI(): { id: string; title: string; roi: number }[] {
      return [...items.values()]
        .map((i) => ({
          id: i.id,
          title: i.title,
          roi: i.estimatedHours > 0 ? i.interestPerSprint / i.estimatedHours : 0,
        }))
        .sort((a, b) => b.roi - a.roi);
    },
  };
}

test("Exercise 6: add and retrieve", () => {
  const tracker = createDebtTracker();
  const id = tracker.add({ title: "Fix auth module", type: "code", priority: "high", estimatedHours: 8, interestPerSprint: 4 });
  assert(typeof id === "string", "should return id");
  assertEqual(tracker.getAll().length, 1);
});

test("Exercise 6: filter by type", () => {
  const tracker = createDebtTracker();
  tracker.add({ title: "Fix auth", type: "code", priority: "high", estimatedHours: 8, interestPerSprint: 4 });
  tracker.add({ title: "Add tests", type: "test", priority: "medium", estimatedHours: 12, interestPerSprint: 2 });
  assertEqual(tracker.getByType("code").length, 1);
  assertEqual(tracker.getByType("test").length, 1);
});

test("Exercise 6: ROI calculation", () => {
  const tracker = createDebtTracker();
  tracker.add({ title: "Quick fix", type: "code", priority: "high", estimatedHours: 2, interestPerSprint: 4 });
  tracker.add({ title: "Big refactor", type: "architecture", priority: "medium", estimatedHours: 40, interestPerSprint: 4 });
  const roi = tracker.getROI();
  assertEqual(roi[0].title, "Quick fix");
  assert(roi[0].roi > roi[1].roi, "Quick fix should have higher ROI");
});

// ============================================================================
// SOLUTION 7: Code Smell Detector
// ============================================================================

interface CodeSmell {
  type: string;
  message: string;
  severity: "info" | "warning" | "error";
}

function detectCodeSmells(code: string): CodeSmell[] {
  const smells: CodeSmell[] = [];

  // 1. Long function (>20 lines)
  const lines = code.split("\n").length;
  if (lines > 20) {
    smells.push({
      type: "long-function",
      message: `Function is too long (${lines} lines)`,
      severity: "warning",
    });
  }

  // 2. Deep nesting
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of code) {
    if (char === "{") {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === "}") {
      currentDepth--;
    }
  }
  if (maxDepth > 3) {
    smells.push({
      type: "deep-nesting",
      message: `Deeply nested code (depth: ${maxDepth})`,
      severity: "warning",
    });
  }

  // 3. Magic numbers (numbers other than 0, 1, -1)
  const numberMatches = code.match(/(?<!\w)(-?\d+\.?\d*)(?!\w)/g);
  if (numberMatches) {
    const magicNumbers = numberMatches.filter(
      (n) => !["0", "1", "-1"].includes(n)
    );
    if (magicNumbers.length > 0) {
      smells.push({
        type: "magic-number",
        message: `Magic number detected: ${magicNumbers.join(", ")}`,
        severity: "info",
      });
    }
  }

  // 4. console.log
  if (/console\.\w+\s*\(/.test(code)) {
    smells.push({
      type: "console-statement",
      message: "Console statement found",
      severity: "info",
    });
  }

  // 5. any type
  if (/:\s*any\b/.test(code)) {
    smells.push({
      type: "any-type",
      message: "Using 'any' type",
      severity: "error",
    });
  }

  return smells;
}

test("Exercise 7: long function", () => {
  const longCode = Array(25).fill("  const x = 1;").join("\n");
  const smells = detectCodeSmells(longCode);
  assert(smells.some((s) => s.type === "long-function"), "should detect long function");
});

test("Exercise 7: magic numbers", () => {
  const smells = detectCodeSmells("const timeout = 3000;");
  assert(smells.some((s) => s.type === "magic-number"), "should detect magic number");
});

test("Exercise 7: console.log", () => {
  const smells = detectCodeSmells('console.log("debug");');
  assert(smells.some((s) => s.type === "console-statement"), "should detect console");
});

test("Exercise 7: any type", () => {
  const smells = detectCodeSmells("function foo(x: any): any {}");
  assert(smells.some((s) => s.type === "any-type"), "should detect any");
});

test("Exercise 7: clean code", () => {
  const smells = detectCodeSmells("const x = 1;");
  assert(smells.length === 0, "clean code should have no smells");
});

// ============================================================================
// SOLUTION 8 (PREDICT): Fowler's Quadrant
// ============================================================================

function exercise8_predict(): string {
  return "Prudent + Deliberate — the team knows they're taking on debt (no tests) and consciously decides to defer it with a plan to repay (add tests next week).";
}

test("Exercise 8: Fowler's quadrant", () => {
  const answer = exercise8_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("prudent") && answer.toLowerCase().includes("deliberate"),
    "should identify as prudent + deliberate"
  );
});

// ============================================================================
// SOLUTION 9 (PREDICT): When to refactor
// ============================================================================

function exercise9_predict(): string {
  return "No — leave it alone. The module works, hasn't been touched in 2 years, and has no planned changes. Refactoring stable untouched code is a waste and risks introducing bugs.";
}

test("Exercise 9: when to refactor", () => {
  const answer = exercise9_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("no") || answer.toLowerCase().includes("leave"),
    "should recommend NOT refactoring stable untouched code"
  );
});

// ============================================================================
// SOLUTION 10 (PREDICT): Safe refactoring prerequisite
// ============================================================================

function exercise10_predict(): string {
  return "b) Tests — you need tests as a safety net before refactoring. Without them, you can't verify that behavior is preserved.";
}

test("Exercise 10: refactoring prerequisite", () => {
  const answer = exercise10_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("test") || answer.toLowerCase().includes("b"),
    "tests are the most important prerequisite"
  );
});

// ============================================================================
// SOLUTION 11 (PREDICT): Strangler fig vs big bang
// ============================================================================

function exercise11_predict(): string {
  return "The strangler fig pattern allows gradual, incremental migration with reduced risk. You can verify each piece works before moving on, roll back individual routes, and keep the system running throughout. A big bang rewrite is all-or-nothing with high risk of failure.";
}

test("Exercise 11: strangler fig benefit", () => {
  const answer = exercise11_predict();
  assert(answer !== "YOUR ANSWER HERE", "must provide answer");
  assert(
    answer.toLowerCase().includes("gradual") ||
    answer.toLowerCase().includes("risk") ||
    answer.toLowerCase().includes("incremental"),
    "should mention gradual/incremental migration or reduced risk"
  );
});

// ============================================================================
// SOLUTION 12: Extract Class from God Object
// ============================================================================

class UserManager {
  private users = new Map<string, { name: string; email: string }>();

  add(id: string, name: string, email: string): void {
    this.users.set(id, { name, email });
  }

  get(id: string): { name: string; email: string } | undefined {
    return this.users.get(id);
  }
}

class ProductCatalog {
  private products = new Map<string, { name: string; price: number }>();

  add(id: string, name: string, price: number): void {
    this.products.set(id, { name, price });
  }

  get(id: string): { name: string; price: number } | undefined {
    return this.products.get(id);
  }

  getTotal(ids: string[]): number {
    return ids.reduce((sum, id) => {
      const product = this.products.get(id);
      return sum + (product ? product.price : 0);
    }, 0);
  }
}

test("Exercise 12: UserManager", () => {
  const users = new UserManager();
  users.add("1", "Alice", "alice@test.com");
  const user = users.get("1");
  assert(user !== undefined, "should find user");
  assertEqual(user!.name, "Alice");
});

test("Exercise 12: ProductCatalog", () => {
  const catalog = new ProductCatalog();
  catalog.add("p1", "Widget", 10);
  catalog.add("p2", "Gadget", 25);
  assertEqual(catalog.getTotal(["p1", "p2"]), 35);
  assertEqual(catalog.get("p1")!.name, "Widget");
});

// ============================================================================
// SOLUTION 13: Replace Conditional with Polymorphism
// ============================================================================

interface PayCalculator {
  calculate(hoursWorked: number, rate: number): number;
}

function createFullTimeCalculator(): PayCalculator {
  return {
    calculate(hoursWorked: number, rate: number): number {
      return hoursWorked * rate;
    },
  };
}

function createContractorCalculator(): PayCalculator {
  const CONTRACTOR_PREMIUM = 1.2;
  return {
    calculate(hoursWorked: number, rate: number): number {
      return hoursWorked * rate * CONTRACTOR_PREMIUM;
    },
  };
}

function createInternCalculator(): PayCalculator {
  const INTERN_FACTOR = 0.5;
  return {
    calculate(hoursWorked: number, rate: number): number {
      return hoursWorked * rate * INTERN_FACTOR;
    },
  };
}

test("Exercise 13: full-time pay", () => {
  assertEqual(createFullTimeCalculator().calculate(40, 50), 2000);
});

test("Exercise 13: contractor pay", () => {
  assertEqual(createContractorCalculator().calculate(40, 50), 2400);
});

test("Exercise 13: intern pay", () => {
  assertEqual(createInternCalculator().calculate(40, 50), 1000);
});

// ============================================================================
// SOLUTION 14: Introduce Parameter Object
// ============================================================================

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
  const {
    query,
    minPrice,
    maxPrice,
    category,
    inStock,
    sortBy = "relevance",
    limit = 20,
  } = criteria;

  const filters: string[] = [`query="${query}"`];
  if (minPrice !== undefined) filters.push(`min=${minPrice}`);
  if (maxPrice !== undefined) filters.push(`max=${maxPrice}`);
  if (category) filters.push(`category=${category}`);
  if (inStock !== undefined) filters.push(`inStock=${inStock}`);
  filters.push(`sort=${sortBy}`);
  filters.push(`limit=${limit}`);

  return `Search: ${filters.join(", ")}`;
}

test("Exercise 14: basic search", () => {
  const result = searchProducts({ query: "laptop" });
  assert(result.includes("laptop"), "should include query");
});

test("Exercise 14: filtered search", () => {
  const result = searchProducts({
    query: "phone",
    minPrice: 100,
    maxPrice: 500,
    category: "electronics",
    inStock: true,
    sortBy: "price",
    limit: 10,
  });
  assert(result.includes("phone"), "should include query");
  assert(result.includes("100"), "should include min price");
  assert(result.includes("electronics"), "should include category");
});

// ============================================================================
// SOLUTION 15: Inline Unnecessary Abstraction
// ============================================================================

function processUserInput(name: string, amount: number, tags: string[]): {
  cleanName: string;
  isValid: boolean;
  primaryTag: string | undefined;
} {
  return {
    cleanName: name.trim(),
    isValid: amount > 0,
    primaryTag: tags[0],
  };
}

test("Exercise 15: inlined abstractions", () => {
  const result = processUserInput("  Alice  ", 42, ["vip", "new"]);
  assertEqual(result.cleanName, "Alice");
  assertEqual(result.isValid, true);
  assertEqual(result.primaryTag, "vip");
});

test("Exercise 15: negative amount", () => {
  const result = processUserInput("Bob", -5, []);
  assertEqual(result.isValid, false);
  assertEqual(result.primaryTag, undefined);
});

// ============================================================================
// RUNNER
// ============================================================================

console.log("\n=== Technical Debt & Refactoring — Solutions ===\n");

process.on("exit", () => {
  console.log(`\n--- Results: ${testResults.passed} passed, ${testResults.failed} failed ---`);
  if (testResults.errors.length > 0) {
    console.log("\nFailures:");
    testResults.errors.forEach((e) => console.log(`  • ${e}`));
  }
});
