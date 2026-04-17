// ============================================================================
// Build Optimization — Solutions
// Run: npx tsx solutions.ts
// ============================================================================

import type {
  ModuleInfo,
  DependencyGraph,
  ImageConfig,
  OptimizationSuggestion,
  ChunkInfo,
  SplitResult,
  LazyRegistry,
  TreeShakeResult,
  BarrelFileAnalysis,
  RouteConfig,
  BundleBudget,
  DynamicLoader,
  ChunkPrediction,
  ImportStatement,
  BudgetReport,
} from "./exercises";

// ---------------------------------------------------------------------------
// Solution 1: Lazy Loader Registry with Caching
// ---------------------------------------------------------------------------

function createLazyRegistry<T>(): LazyRegistry<T> {
  const entries = new Map<
    string,
    { loader: () => Promise<T>; loaded: boolean; value: T | null; promise: Promise<T> | null }
  >();

  return {
    register(key: string, loader: () => Promise<T>): void {
      entries.set(key, { loader, loaded: false, value: null, promise: null });
    },

    async load(key: string): Promise<T> {
      const entry = entries.get(key);
      if (!entry) throw new Error(`Module "${key}" not registered`);
      if (entry.loaded) return entry.value as T;
      if (entry.promise) return entry.promise;

      entry.promise = entry.loader().then((val) => {
        entry.loaded = true;
        entry.value = val;
        return val;
      });
      return entry.promise;
    },

    get(key: string): T | null {
      return entries.get(key)?.value ?? null;
    },

    isLoaded(key: string): boolean {
      return entries.get(key)?.loaded ?? false;
    },

    async preload(keys: string[]): Promise<void> {
      await Promise.all(keys.map((k) => this.load(k)));
    },
  };
}

// ---------------------------------------------------------------------------
// Solution 2: Find Circular Dependencies
// ---------------------------------------------------------------------------

function findCircularDependencies(graph: DependencyGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        cycles.push([...path.slice(cycleStart), node]);
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const mod = graph.modules[node];
    if (mod) {
      for (const dep of mod.imports) {
        if (graph.modules[dep]) {
          dfs(dep, path);
        }
      }
    }

    path.pop();
    inStack.delete(node);
  }

  for (const modName of Object.keys(graph.modules)) {
    if (!visited.has(modName)) {
      dfs(modName, []);
    }
  }

  return cycles;
}

// ---------------------------------------------------------------------------
// Solution 3: Tree Shaking Simulator
// ---------------------------------------------------------------------------

function simulateTreeShaking(
  graph: DependencyGraph,
  usedImports: string[]
): TreeShakeResult {
  const usedMap = new Map<string, Set<string>>();
  for (const imp of usedImports) {
    const dotIdx = imp.indexOf(".");
    const modName = imp.substring(0, dotIdx);
    const exportName = imp.substring(dotIdx + 1);
    if (!usedMap.has(modName)) usedMap.set(modName, new Set());
    usedMap.get(modName)!.add(exportName);
  }

  const removedExports: string[] = [];
  const keptExports: string[] = [];
  let originalSize = 0;
  let savings = 0;

  for (const mod of Object.values(graph.modules)) {
    originalSize += mod.size;
    const perExportSize = mod.exports.length > 0 ? mod.size / mod.exports.length : 0;

    if (mod.sideEffects) {
      keptExports.push(...mod.exports);
      continue;
    }

    const used = usedMap.get(mod.name) ?? new Set();
    for (const exp of mod.exports) {
      if (used.has(exp)) {
        keptExports.push(exp);
      } else {
        removedExports.push(exp);
        savings += perExportSize;
      }
    }
  }

  return {
    removedExports,
    keptExports,
    originalSize,
    optimizedSize: originalSize - savings,
    savings,
  };
}

// ---------------------------------------------------------------------------
// Solution 4: Predict Code Splitting
// ---------------------------------------------------------------------------

function predictCodeSplitting(): SplitResult {
  const chunks: ChunkInfo[] = [
    {
      name: "shared",
      modules: ["react", "utils"],
      sizeBytes: 85000,
      shared: true,
    },
    {
      name: "page-home",
      modules: ["HomeHero"],
      sizeBytes: 3000,
      shared: false,
    },
    {
      name: "page-about",
      modules: ["AboutContent"],
      sizeBytes: 2000,
      shared: false,
    },
    {
      name: "page-dashboard",
      modules: ["Chart", "DataTable"],
      sizeBytes: 60000,
      shared: false,
    },
  ];

  return {
    chunks,
    totalSize: chunks.reduce((sum, c) => sum + c.sizeBytes, 0),
  };
}

// ---------------------------------------------------------------------------
// Solution 5: Image Config Optimizer
// ---------------------------------------------------------------------------

function optimizeImageConfig(config: ImageConfig): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  if (config.aboveFold && !config.priority) {
    suggestions.push({
      field: "priority",
      current: "false",
      suggested: "true",
      reason: "Above-fold images should use priority for LCP optimization",
    });
  }

  if (!config.aboveFold && config.loading === "eager") {
    suggestions.push({
      field: "loading",
      current: "eager",
      suggested: "lazy",
      reason: "Below-fold images should use lazy loading",
    });
  }

  if (config.format === "png" && config.sizeBytes > 100_000) {
    suggestions.push({
      field: "format",
      current: "png",
      suggested: "webp",
      reason: "Large PNGs should be converted to WebP for ~30% size reduction",
    });
  }

  if (config.format === "jpeg" && config.quality > 85) {
    suggestions.push({
      field: "quality",
      current: String(config.quality),
      suggested: "75",
      reason: "Quality above 85 has diminishing returns; 75 is the recommended default",
    });
  }

  if (config.format === "gif") {
    suggestions.push({
      field: "format",
      current: "gif",
      suggested: "mp4",
      reason: "Animated GIFs should be converted to video for major size savings",
    });
  }

  if (config.width > 2048) {
    suggestions.push({
      field: "width",
      current: String(config.width),
      suggested: "2048",
      reason: "Images wider than 2048px are unnecessarily large for most displays",
    });
  }

  return suggestions;
}

// ---------------------------------------------------------------------------
// Solution 6: Predict Barrel File Impact
// ---------------------------------------------------------------------------

function predictBarrelFileImpact(): BarrelFileAnalysis {
  const allExports = [
    { name: "Button", size: 5000 },
    { name: "Modal", size: 5000 },
    { name: "Chart", size: 50000 },
    { name: "Table", size: 10000 },
    { name: "Form", size: 8000 },
    { name: "Tabs", size: 4000 },
    { name: "Tooltip", size: 3000 },
    { name: "Dropdown", size: 6000 },
    { name: "Sidebar", size: 12000 },
    { name: "Footer", size: 7000 },
  ];

  const usedExports = ["Button"];
  const unusedExports = allExports
    .filter((e) => !usedExports.includes(e.name))
    .map((e) => e.name);
  const potentialSavings = allExports
    .filter((e) => !usedExports.includes(e.name))
    .reduce((sum, e) => sum + e.size, 0);

  return {
    file: "components/index.ts",
    totalExports: 10,
    usedExports,
    unusedExports,
    potentialSavingsBytes: potentialSavings,
  };
}

// ---------------------------------------------------------------------------
// Solution 7: Bundle Size Calculator
// ---------------------------------------------------------------------------

function calculateBundleSize(
  graph: DependencyGraph,
  entryModule: string
): number {
  const visited = new Set<string>();

  function walk(name: string): number {
    if (visited.has(name)) return 0;
    visited.add(name);
    const mod = graph.modules[name];
    if (!mod) return 0;
    let total = mod.size;
    for (const dep of mod.imports) {
      total += walk(dep);
    }
    return total;
  }

  return walk(entryModule);
}

// ---------------------------------------------------------------------------
// Solution 8: Fixed Dynamic Loader
// ---------------------------------------------------------------------------

function createFixedDynamicLoader<T>(factory: () => Promise<T>): DynamicLoader<T> {
  let loaded = false;
  let value: T | null = null;
  let error: Error | null = null;
  let pending: Promise<T> | null = null;

  return {
    async load(): Promise<T> {
      if (loaded) return value as T;
      if (pending) return pending;

      pending = factory()
        .then((result) => {
          loaded = true;
          value = result;
          return result;
        })
        .catch((err: unknown) => {
          error = err instanceof Error ? err : new Error(String(err));
          pending = null;
          throw error;
        });

      return pending;
    },
    getState() {
      return { loaded, value, error };
    },
  };
}

// ---------------------------------------------------------------------------
// Solution 9: Predict Dynamic Chunks
// ---------------------------------------------------------------------------

function predictDynamicChunks(): ChunkPrediction {
  return {
    mainPageChunk: ["utils"],
    dynamicChunks: [["Chart"], ["Table"]],
    totalChunks: 3,
  };
}

// ---------------------------------------------------------------------------
// Solution 10: Fix Inefficient Imports
// ---------------------------------------------------------------------------

function fixInefficientImports(): ImportStatement[] {
  return [
    {
      original: "import _ from 'lodash'",
      optimized: "import debounce from 'lodash-es/debounce'",
      estimatedSavingsKB: 68,
    },
    {
      original: "import moment from 'moment'",
      optimized: "import { format } from 'date-fns'",
      estimatedSavingsKB: 65,
    },
    {
      original: "import * as Icons from '@heroicons/react/solid'",
      optimized: "import { HeartIcon } from '@heroicons/react/solid/HeartIcon'",
      estimatedSavingsKB: 150,
    },
    {
      original: "import { everything } from './barrel'",
      optimized: "import { specificThing } from './barrel/specificThing'",
      estimatedSavingsKB: 50,
    },
  ];
}

// ---------------------------------------------------------------------------
// Solution 11: Code Splitting Simulator
// ---------------------------------------------------------------------------

function simulateCodeSplitting(
  routes: RouteConfig[],
  moduleRegistry: Record<string, number>,
  sharedThreshold: number
): SplitResult {
  // Count usage of each module across routes
  const usageCount = new Map<string, number>();
  for (const route of routes) {
    for (const mod of route.imports) {
      usageCount.set(mod, (usageCount.get(mod) ?? 0) + 1);
    }
  }

  // Determine shared modules
  const sharedModules: string[] = [];
  for (const [mod, count] of usageCount) {
    if (count >= sharedThreshold) {
      sharedModules.push(mod);
    }
  }

  const sharedSet = new Set(sharedModules);
  const chunks: ChunkInfo[] = [];

  // Shared chunk
  if (sharedModules.length > 0) {
    chunks.push({
      name: "shared",
      modules: sharedModules,
      sizeBytes: sharedModules.reduce((s, m) => s + (moduleRegistry[m] ?? 0), 0),
      shared: true,
    });
  }

  // Per-route chunks
  for (const route of routes) {
    const routeModules = route.imports.filter((m) => !sharedSet.has(m));
    chunks.push({
      name: `page-${route.path.replace(/\//g, "") || "home"}`,
      modules: routeModules,
      sizeBytes: routeModules.reduce((s, m) => s + (moduleRegistry[m] ?? 0), 0),
      shared: false,
    });
  }

  return {
    chunks,
    totalSize: chunks.reduce((s, c) => s + c.sizeBytes, 0),
  };
}

// ---------------------------------------------------------------------------
// Solution 12: Budget Compliance
// ---------------------------------------------------------------------------

function predictBudgetCompliance(
  splitResult: SplitResult,
  routes: RouteConfig[],
  budget: BundleBudget
): BudgetReport {
  const sharedChunk = splitResult.chunks.find((c) => c.shared);
  const sharedKB = sharedChunk ? sharedChunk.sizeBytes / 1000 : 0;

  const routeReports = routes.map((route) => {
    const routeChunkName = `page-${route.path.replace(/\//g, "") || "home"}`;
    const routeChunk = splitResult.chunks.find((c) => c.name === routeChunkName);
    const routeKB = routeChunk ? routeChunk.sizeBytes / 1000 : 0;
    const firstLoadKB = routeKB + sharedKB;

    return {
      path: route.path,
      routeKB,
      firstLoadKB,
      exceedsBudget: firstLoadKB > budget.maxFirstLoadKB || routeKB > budget.maxRouteKB,
    };
  });

  return {
    sharedChunkKB: sharedKB,
    sharedExceedsBudget: sharedKB > budget.maxSharedKB,
    routeReports,
  };
}

// ============================================================================
// Test Runner
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.log(`  FAIL: ${message}`);
  }
}

async function runTests(): Promise<void> {
  console.log("\n=== Build Optimization Solutions — Test Runner ===\n");

  // -- Test 1: Lazy Registry --
  console.log("Exercise 1: Lazy Loader Registry");
  {
    const registry = createLazyRegistry<string>();
    let loadCount = 0;
    registry.register("greeting", async () => {
      loadCount++;
      return "hello";
    });
    registry.register("farewell", async () => "goodbye");

    assert(registry.isLoaded("greeting") === false, "greeting not loaded initially");
    const val = await registry.load("greeting");
    assert(val === "hello", "load returns value");
    assert(registry.isLoaded("greeting") === true, "greeting loaded after load()");
    assert(registry.get("greeting") === "hello", "get returns cached value");

    await registry.load("greeting");
    assert(loadCount === 1, "loader called only once (cached)");

    await registry.preload(["farewell"]);
    assert(registry.get("farewell") === "goodbye", "preload loads modules");
  }

  // -- Test 2: Circular Dependencies --
  console.log("\nExercise 2: Find Circular Dependencies");
  {
    const graph: DependencyGraph = {
      modules: {
        A: { name: "A", size: 100, imports: ["B"], exports: ["a1"], sideEffects: false },
        B: { name: "B", size: 200, imports: ["C"], exports: ["b1"], sideEffects: false },
        C: { name: "C", size: 150, imports: ["A"], exports: ["c1"], sideEffects: false },
        D: { name: "D", size: 50, imports: ["B"], exports: ["d1"], sideEffects: false },
      },
    };
    const cycles = findCircularDependencies(graph);
    assert(cycles.length === 1, "finds 1 cycle");
    assert(cycles[0].length === 4, "cycle has 4 elements (A->B->C->A)");
    assert(
      cycles[0][0] === cycles[0][cycles[0].length - 1],
      "cycle starts and ends with same node"
    );

    const noCycleGraph: DependencyGraph = {
      modules: {
        X: { name: "X", size: 100, imports: ["Y"], exports: ["x1"], sideEffects: false },
        Y: { name: "Y", size: 100, imports: [], exports: ["y1"], sideEffects: false },
      },
    };
    assert(findCircularDependencies(noCycleGraph).length === 0, "no cycles in DAG");
  }

  // -- Test 3: Tree Shaking Simulator --
  console.log("\nExercise 3: Tree Shaking Simulator");
  {
    const graph: DependencyGraph = {
      modules: {
        utils: {
          name: "utils",
          size: 1000,
          imports: [],
          exports: ["debounce", "throttle", "cloneDeep", "merge"],
          sideEffects: false,
        },
        polyfills: {
          name: "polyfills",
          size: 500,
          imports: [],
          exports: ["arrayFrom", "objectAssign"],
          sideEffects: true,
        },
      },
    };
    const result = simulateTreeShaking(graph, ["utils.debounce", "polyfills.arrayFrom"]);
    assert(result.removedExports.length === 3, "removes 3 unused exports");
    assert(result.keptExports.includes("debounce"), "keeps used export");
    assert(
      result.keptExports.includes("arrayFrom") && result.keptExports.includes("objectAssign"),
      "keeps all exports from sideEffects module"
    );
    assert(result.savings === 750, "savings = 3/4 of 1000");
    assert(result.optimizedSize === 750, "optimized = 1500 - 750");
  }

  // -- Test 4: Code Splitting Prediction --
  console.log("\nExercise 4: Predict Code Splitting");
  {
    const prediction = predictCodeSplitting();
    const shared = prediction.chunks.find((c) => c.shared);
    assert(shared !== undefined, "shared chunk exists");
    assert(shared!.modules.includes("react"), "shared includes react");
    assert(shared!.modules.includes("utils"), "shared includes utils");
    assert(prediction.chunks.length === 4, "4 chunks total (shared + 3 routes)");
    assert(prediction.totalSize === 150000, "total size = 150000");
  }

  // -- Test 5: Image Config Optimizer --
  console.log("\nExercise 5: Image Config Optimizer");
  {
    const suggestions = optimizeImageConfig({
      src: "/hero.png",
      width: 3000,
      height: 1500,
      format: "png",
      quality: 90,
      priority: false,
      loading: "eager",
      aboveFold: true,
      sizeBytes: 500_000,
    });
    const fields = suggestions.map((s) => s.field);
    assert(fields.includes("priority"), "suggests priority for above-fold");
    assert(fields.includes("format"), "suggests format change for large PNG");
    assert(fields.includes("width"), "suggests reducing width > 2048");
    assert(suggestions.length >= 3, "at least 3 suggestions");

    const belowFold = optimizeImageConfig({
      src: "/footer.jpeg",
      width: 800,
      height: 400,
      format: "jpeg",
      quality: 95,
      priority: false,
      loading: "eager",
      aboveFold: false,
      sizeBytes: 50_000,
    });
    const bfFields = belowFold.map((s) => s.field);
    assert(bfFields.includes("loading"), "suggests lazy for below-fold eager");
    assert(bfFields.includes("quality"), "suggests lower quality for jpeg > 85");
  }

  // -- Test 6: Barrel File Impact --
  console.log("\nExercise 6: Barrel File Impact");
  {
    const analysis = predictBarrelFileImpact();
    assert(analysis.totalExports === 10, "10 total exports");
    assert(analysis.usedExports.length === 1, "1 used export");
    assert(analysis.unusedExports.length === 9, "9 unused exports");
    assert(analysis.potentialSavingsBytes === 105000, "savings = 105KB");
  }

  // -- Test 7: Bundle Size Calculator --
  console.log("\nExercise 7: Bundle Size Calculator");
  {
    const graph: DependencyGraph = {
      modules: {
        app: { name: "app", size: 500, imports: ["utils", "ui"], exports: ["main"], sideEffects: false },
        utils: { name: "utils", size: 1000, imports: ["lodash"], exports: ["helper"], sideEffects: false },
        ui: { name: "ui", size: 2000, imports: ["utils"], exports: ["Button"], sideEffects: false },
        lodash: { name: "lodash", size: 70000, imports: [], exports: ["debounce"], sideEffects: false },
      },
    };
    assert(calculateBundleSize(graph, "app") === 73500, "total = 500+1000+2000+70000");
    assert(calculateBundleSize(graph, "ui") === 73000, "ui = 2000+1000+70000");
    assert(calculateBundleSize(graph, "lodash") === 70000, "lodash alone = 70000");
  }

  // -- Test 8: Fixed Dynamic Loader --
  console.log("\nExercise 8: Fixed Dynamic Loader");
  {
    let callCount = 0;
    const loader = createFixedDynamicLoader(async () => {
      callCount++;
      return 42;
    });
    await loader.load();
    await loader.load();
    assert(callCount === 1, "factory called only once");
    assert(loader.getState().loaded === true, "state shows loaded");
    assert(loader.getState().value === 42, "state has correct value");

    const failLoader = createFixedDynamicLoader<number>(async () => {
      throw new Error("fail");
    });
    try {
      await failLoader.load();
    } catch {
      // expected
    }
    assert(failLoader.getState().error?.message === "fail", "error state is set");
  }

  // -- Test 9: Dynamic Chunks Prediction --
  console.log("\nExercise 9: Predict Dynamic Chunks");
  {
    const pred = predictDynamicChunks();
    assert(pred.totalChunks === 3, "3 chunks total");
    assert(pred.mainPageChunk.includes("utils"), "main chunk includes static import");
    assert(pred.dynamicChunks.length === 2, "2 dynamic chunks");
  }

  // -- Test 10: Fix Inefficient Imports --
  console.log("\nExercise 10: Fix Inefficient Imports");
  {
    const fixes = fixInefficientImports();
    assert(fixes.length === 4, "4 fixes");
    assert(
      fixes[0].optimized.includes("lodash-es") || fixes[0].optimized.includes("lodash/"),
      "lodash optimized to cherry-pick"
    );
    assert(
      fixes[1].optimized.includes("date-fns") || fixes[1].optimized.includes("dayjs"),
      "moment replaced with lighter alternative"
    );
    assert(fixes.every((f) => f.estimatedSavingsKB > 0), "all fixes have positive savings");
  }

  // -- Test 11: Code Splitting Simulator --
  console.log("\nExercise 11: Code Splitting Simulator");
  {
    const modules: Record<string, number> = {
      react: 80000,
      utils: 5000,
      Hero: 3000,
      About: 2000,
      Chart: 45000,
    };
    const routes: RouteConfig[] = [
      { path: "/", imports: ["react", "utils", "Hero"], isDynamic: false },
      { path: "/about", imports: ["react", "utils", "About"], isDynamic: false },
      { path: "/dash", imports: ["react", "Chart"], isDynamic: false },
    ];
    const splitResult = simulateCodeSplitting(routes, modules, 2);
    const shared = splitResult.chunks.find((c) => c.shared);
    assert(shared !== undefined, "shared chunk created");
    assert(shared!.modules.includes("react"), "react is shared");
    assert(shared!.modules.includes("utils"), "utils is shared (used by 2 routes)");
    assert(splitResult.chunks.filter((c) => !c.shared).length === 3, "3 route chunks");
    assert(splitResult.totalSize === 135000, "total = 80000+5000+3000+2000+45000");
  }

  // -- Test 12: Budget Compliance --
  console.log("\nExercise 12: Budget Compliance");
  {
    const modules: Record<string, number> = {
      react: 80000,
      utils: 5000,
      Hero: 3000,
      About: 2000,
      Chart: 45000,
    };
    const routes: RouteConfig[] = [
      { path: "/", imports: ["react", "utils", "Hero"], isDynamic: false },
      { path: "/about", imports: ["react", "utils", "About"], isDynamic: false },
      { path: "/dash", imports: ["react", "Chart"], isDynamic: false },
    ];
    const splitResult = simulateCodeSplitting(routes, modules, 2);
    const budget: BundleBudget = { maxFirstLoadKB: 100, maxRouteKB: 50, maxSharedKB: 90 };
    const report = predictBudgetCompliance(splitResult, routes, budget);

    assert(report.sharedChunkKB === 85, "shared chunk = 85KB");
    assert(report.sharedExceedsBudget === false, "shared under budget (85 < 90)");
    assert(report.routeReports.length === 3, "3 route reports");

    const homeReport = report.routeReports.find((r) => r.path === "/");
    assert(homeReport !== undefined, "home route report exists");
    assert(homeReport!.firstLoadKB === 88, "home first load = 85 + 3 = 88KB");
    assert(homeReport!.exceedsBudget === false, "home under budget");

    const dashReport = report.routeReports.find((r) => r.path === "/dash");
    assert(dashReport !== undefined, "dash route report exists");
    assert(dashReport!.firstLoadKB === 130, "dash first load = 85 + 45 = 130KB");
    assert(dashReport!.exceedsBudget === true, "dash exceeds first load budget");
  }

  // -- Summary --
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) {
    console.log("All tests passed!");
  }
}

runTests().catch(console.error);
