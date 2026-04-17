// ============================================================================
// Build Optimization — Exercises
// Run: npx tsx exercises.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Types & Helpers
// ---------------------------------------------------------------------------

interface ModuleInfo {
  name: string;
  size: number; // bytes
  imports: string[];
  exports: string[];
  sideEffects: boolean;
}

interface DependencyGraph {
  modules: Record<string, ModuleInfo>;
}

interface ImageConfig {
  src: string;
  width: number;
  height: number;
  format: "jpeg" | "png" | "webp" | "avif" | "gif" | "svg";
  quality: number;
  priority: boolean;
  loading: "lazy" | "eager";
  aboveFold: boolean;
  sizeBytes: number;
}

interface OptimizationSuggestion {
  field: string;
  current: string;
  suggested: string;
  reason: string;
}

interface ChunkInfo {
  name: string;
  modules: string[];
  sizeBytes: number;
  shared: boolean;
}

interface SplitResult {
  chunks: ChunkInfo[];
  totalSize: number;
}

interface DynamicImportEntry<T = unknown> {
  loader: () => Promise<T>;
  loaded: boolean;
  value: T | null;
  loading: boolean;
  error: Error | null;
}

interface LazyRegistry<T = unknown> {
  register(key: string, loader: () => Promise<T>): void;
  load(key: string): Promise<T>;
  get(key: string): T | null;
  isLoaded(key: string): boolean;
  preload(keys: string[]): Promise<void>;
}

interface TreeShakeResult {
  removedExports: string[];
  keptExports: string[];
  originalSize: number;
  optimizedSize: number;
  savings: number;
}

interface BarrelFileAnalysis {
  file: string;
  totalExports: number;
  usedExports: string[];
  unusedExports: string[];
  potentialSavingsBytes: number;
}

interface RouteConfig {
  path: string;
  imports: string[]; // module names
  isDynamic: boolean;
}

interface BundleBudget {
  maxFirstLoadKB: number;
  maxRouteKB: number;
  maxSharedKB: number;
}

// ---------------------------------------------------------------------------
// Exercise 1 (Implement): Lazy Loader Registry with Caching
// ---------------------------------------------------------------------------
// Create a LazyRegistry that:
// - register(key, loader): stores a dynamic import loader
// - load(key): executes the loader, caches the result, returns the value
// - get(key): returns cached value or null
// - isLoaded(key): returns whether the module has been loaded
// - preload(keys): loads multiple modules in parallel
// Calling load() twice must NOT call the loader twice (use cache).

function createLazyRegistry<T>(): LazyRegistry<T> {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Tests:
// const registry = createLazyRegistry<string>();
// registry.register("greeting", async () => "hello");
// registry.register("farewell", async () => "goodbye");
// console.assert(registry.isLoaded("greeting") === false);
// const val = await registry.load("greeting");
// console.assert(val === "hello");
// console.assert(registry.isLoaded("greeting") === true);
// console.assert(registry.get("greeting") === "hello");
// await registry.preload(["farewell"]);
// console.assert(registry.get("farewell") === "goodbye");

// ---------------------------------------------------------------------------
// Exercise 2 (Implement): Dependency Graph — Find Circular Dependencies
// ---------------------------------------------------------------------------
// Given a DependencyGraph, find all circular dependency chains.
// Return an array of cycles, where each cycle is an array of module names
// forming the loop (e.g. ["A", "B", "C", "A"]).

function findCircularDependencies(graph: DependencyGraph): string[][] {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Tests:
// const graph1: DependencyGraph = {
//   modules: {
//     A: { name: "A", size: 100, imports: ["B"], exports: ["a1"], sideEffects: false },
//     B: { name: "B", size: 200, imports: ["C"], exports: ["b1"], sideEffects: false },
//     C: { name: "C", size: 150, imports: ["A"], exports: ["c1"], sideEffects: false },
//     D: { name: "D", size: 50, imports: ["B"], exports: ["d1"], sideEffects: false },
//   },
// };
// const cycles = findCircularDependencies(graph1);
// console.assert(cycles.length === 1);
// console.assert(cycles[0].length === 4); // ["A","B","C","A"] or rotation

// ---------------------------------------------------------------------------
// Exercise 3 (Implement): Tree Shaking Simulator
// ---------------------------------------------------------------------------
// Given a DependencyGraph and an array of used imports (e.g. ["A.a1", "B.b2"]),
// determine which exports can be removed (tree-shaken).
// Rules:
// - If a module has sideEffects: true, ALL its exports are kept
// - Only listed used imports are kept from side-effect-free modules
// - Return TreeShakeResult with savings calculated from removed exports
//   (each export is estimated at moduleSize / numberOfExports bytes)

function simulateTreeShaking(
  graph: DependencyGraph,
  usedImports: string[]
): TreeShakeResult {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Tests:
// const graph2: DependencyGraph = {
//   modules: {
//     utils: { name: "utils", size: 1000, imports: [], exports: ["debounce", "throttle", "cloneDeep", "merge"], sideEffects: false },
//     polyfills: { name: "polyfills", size: 500, imports: [], exports: ["arrayFrom", "objectAssign"], sideEffects: true },
//   },
// };
// const result = simulateTreeShaking(graph2, ["utils.debounce", "polyfills.arrayFrom"]);
// console.assert(result.removedExports.length === 3); // throttle, cloneDeep, merge
// console.assert(result.keptExports.includes("debounce"));
// console.assert(result.keptExports.includes("arrayFrom"));
// console.assert(result.keptExports.includes("objectAssign")); // sideEffects: true
// console.assert(result.savings === 750); // 3/4 of 1000

// ---------------------------------------------------------------------------
// Exercise 4 (Predict): Code Splitting Output
// ---------------------------------------------------------------------------
// Given the following route configs and a shared threshold of 2
// (modules used by >= 2 routes go to shared chunk), predict the chunks.
//
// Routes:
//   "/" imports ["react", "utils", "HomeHero"]
//   "/about" imports ["react", "utils", "AboutContent"]
//   "/dashboard" imports ["react", "utils", "Chart", "DataTable"]
//
// Module sizes: react=80000, utils=5000, HomeHero=3000,
//   AboutContent=2000, Chart=45000, DataTable=15000
//
// What chunks are created? Which modules are shared?
// Write your prediction as a SplitResult.

function predictCodeSplitting(): SplitResult {
  // TODO: Return the predicted SplitResult
  throw new Error("Not implemented");
}

// Tests:
// const prediction = predictCodeSplitting();
// const sharedChunk = prediction.chunks.find(c => c.shared);
// console.assert(sharedChunk !== undefined);
// console.assert(sharedChunk!.modules.includes("react"));
// console.assert(sharedChunk!.modules.includes("utils"));
// console.assert(prediction.chunks.length === 4); // shared + 3 routes

// ---------------------------------------------------------------------------
// Exercise 5 (Implement): Image Config Optimizer
// ---------------------------------------------------------------------------
// Given an ImageConfig, return an array of OptimizationSuggestion.
// Rules:
// - If aboveFold && !priority → suggest priority: true
// - If !aboveFold && loading === "eager" → suggest loading: "lazy"
// - If format is "png" and sizeBytes > 100_000 → suggest webp
// - If format is "jpeg" and quality > 85 → suggest quality 75
// - If format is "gif" → suggest converting to video (mp4)
// - If width > 2048 → suggest reducing to 2048

function optimizeImageConfig(config: ImageConfig): OptimizationSuggestion[] {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Tests:
// const suggestions = optimizeImageConfig({
//   src: "/hero.png", width: 3000, height: 1500,
//   format: "png", quality: 90, priority: false,
//   loading: "eager", aboveFold: true, sizeBytes: 500_000,
// });
// console.assert(suggestions.length === 4);
// const fields = suggestions.map(s => s.field);
// console.assert(fields.includes("priority"));
// console.assert(fields.includes("format"));
// console.assert(fields.includes("width"));
// console.assert(fields.includes("quality")); // png quality > 85 doesn't match jpeg rule, but we have width

// ---------------------------------------------------------------------------
// Exercise 6 (Predict): Barrel File Impact
// ---------------------------------------------------------------------------
// Given a barrel file that re-exports 10 components (each ~5KB),
// and a consumer that imports only 1 component via the barrel,
// what is the worst-case bundle impact?
// Return a BarrelFileAnalysis object.
//
// Barrel: components/index.ts re-exports:
//   Button(5KB), Modal(5KB), Chart(50KB), Table(10KB), Form(8KB),
//   Tabs(4KB), Tooltip(3KB), Dropdown(6KB), Sidebar(12KB), Footer(7KB)
// Consumer: import { Button } from "@/components";

function predictBarrelFileImpact(): BarrelFileAnalysis {
  // TODO: Return the predicted analysis
  throw new Error("Not implemented");
}

// Tests:
// const analysis = predictBarrelFileImpact();
// console.assert(analysis.totalExports === 10);
// console.assert(analysis.usedExports.length === 1);
// console.assert(analysis.unusedExports.length === 9);
// console.assert(analysis.potentialSavingsBytes === 105_000); // total - Button

// ---------------------------------------------------------------------------
// Exercise 7 (Implement): Bundle Size Calculator from Dependency Graph
// ---------------------------------------------------------------------------
// Calculate the total bundle size for a given entry module, following imports
// recursively. Each module is only counted once (deduplication).

function calculateBundleSize(
  graph: DependencyGraph,
  entryModule: string
): number {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Tests:
// const graph3: DependencyGraph = {
//   modules: {
//     app: { name: "app", size: 500, imports: ["utils", "ui"], exports: ["main"], sideEffects: false },
//     utils: { name: "utils", size: 1000, imports: ["lodash"], exports: ["helper"], sideEffects: false },
//     ui: { name: "ui", size: 2000, imports: ["utils"], exports: ["Button"], sideEffects: false },
//     lodash: { name: "lodash", size: 70000, imports: [], exports: ["debounce"], sideEffects: false },
//   },
// };
// console.assert(calculateBundleSize(graph3, "app") === 73500); // 500+1000+2000+70000

// ---------------------------------------------------------------------------
// Exercise 8 (Fix): Broken Dynamic Import Simulation
// ---------------------------------------------------------------------------
// The following dynamic loader has two bugs:
// 1. It never caches — calling load() always re-runs the factory
// 2. The error state is never set when the factory rejects

interface DynamicLoader<T> {
  load(): Promise<T>;
  getState(): { loaded: boolean; value: T | null; error: Error | null };
}

function createBrokenDynamicLoader<T>(factory: () => Promise<T>): DynamicLoader<T> {
  let loaded = false;
  let value: T | null = null;
  let error: Error | null = null;

  return {
    async load(): Promise<T> {
      // BUG 1: Should check if already loaded before calling factory
      const result = await factory();
      value = result;
      return result;
      // BUG 2: No try/catch — errors are unhandled and error state not set
    },
    getState() {
      return { loaded, value, error };
    },
  };
}

// TODO: Create createFixedDynamicLoader that fixes both bugs.

function createFixedDynamicLoader<T>(_factory: () => Promise<T>): DynamicLoader<T> {
  throw new Error("Not implemented");
}

// Tests:
// let callCount = 0;
// const loader = createFixedDynamicLoader(async () => { callCount++; return 42; });
// await loader.load();
// await loader.load();
// console.assert(callCount === 1);
// console.assert(loader.getState().loaded === true);
// console.assert(loader.getState().value === 42);
// const failLoader = createFixedDynamicLoader<number>(async () => { throw new Error("fail"); });
// try { await failLoader.load(); } catch {}
// console.assert(failLoader.getState().error?.message === "fail");

// ---------------------------------------------------------------------------
// Exercise 9 (Predict): Dynamic Import Chunk Behavior
// ---------------------------------------------------------------------------
// Given a page that uses:
//   const Chart = dynamic(() => import("./Chart"), { ssr: false });
//   const Table = dynamic(() => import("./Table"), { loading: () => "..." });
//   import { formatDate } from "./utils";
//
// Predict: How many JS chunks does this page produce on the CLIENT?
// Return an object describing the chunks.

interface ChunkPrediction {
  mainPageChunk: string[];      // modules in the page's main chunk
  dynamicChunks: string[][];    // each dynamic chunk's modules
  totalChunks: number;
}

function predictDynamicChunks(): ChunkPrediction {
  // TODO: Return prediction
  throw new Error("Not implemented");
}

// Tests:
// const pred = predictDynamicChunks();
// console.assert(pred.totalChunks === 3); // page + Chart chunk + Table chunk
// console.assert(pred.mainPageChunk.includes("utils"));
// console.assert(pred.dynamicChunks.length === 2);

// ---------------------------------------------------------------------------
// Exercise 10 (Fix): Inefficient Module Imports
// ---------------------------------------------------------------------------
// The following import configuration causes massive bundle sizes.
// Return the optimized version.

interface ImportStatement {
  original: string;
  optimized: string;
  estimatedSavingsKB: number;
}

function fixInefficientImports(): ImportStatement[] {
  // The problematic imports:
  // 1. import _ from 'lodash';              // Uses _.debounce only
  // 2. import moment from 'moment';          // Uses format() only
  // 3. import * as Icons from '@heroicons/react/solid'; // Uses HeartIcon only
  // 4. import { everything } from './barrel'; // massive barrel file

  // TODO: Return array of ImportStatement with fixes
  throw new Error("Not implemented");
}

// Tests:
// const fixes = fixInefficientImports();
// console.assert(fixes.length === 4);
// console.assert(fixes[0].optimized.includes("lodash-es/debounce") || fixes[0].optimized.includes("lodash/debounce"));
// console.assert(fixes[1].optimized.includes("date-fns") || fixes[1].optimized.includes("dayjs"));

// ---------------------------------------------------------------------------
// Exercise 11 (Implement): Code Splitting Simulator
// ---------------------------------------------------------------------------
// Given routes and a shared threshold, produce a SplitResult.
// Modules used by >= threshold routes go into a shared chunk.
// Remaining modules go into per-route chunks.

function simulateCodeSplitting(
  routes: RouteConfig[],
  moduleRegistry: Record<string, number>, // name -> size in bytes
  sharedThreshold: number
): SplitResult {
  // TODO: Implement
  throw new Error("Not implemented");
}

// Tests:
// const modules = { react: 80000, utils: 5000, Hero: 3000, About: 2000, Chart: 45000 };
// const routes: RouteConfig[] = [
//   { path: "/", imports: ["react", "utils", "Hero"], isDynamic: false },
//   { path: "/about", imports: ["react", "utils", "About"], isDynamic: false },
//   { path: "/dash", imports: ["react", "Chart"], isDynamic: false },
// ];
// const splitResult = simulateCodeSplitting(routes, modules, 2);
// const shared = splitResult.chunks.find(c => c.shared);
// console.assert(shared !== undefined);
// console.assert(shared!.modules.includes("react"));
// console.assert(splitResult.chunks.filter(c => !c.shared).length === 3);

// ---------------------------------------------------------------------------
// Exercise 12 (Predict): Bundle Budget Compliance
// ---------------------------------------------------------------------------
// Given the split result from Exercise 11 and a budget, predict which
// routes violate the budget. Return route paths that exceed maxRouteKB
// and whether the shared chunk exceeds maxSharedKB.

interface BudgetReport {
  sharedChunkKB: number;
  sharedExceedsBudget: boolean;
  routeReports: Array<{
    path: string;
    routeKB: number;
    firstLoadKB: number; // route + shared
    exceedsBudget: boolean;
  }>;
}

function predictBudgetCompliance(
  _splitResult: SplitResult,
  _routes: RouteConfig[],
  _budget: BundleBudget
): BudgetReport {
  // TODO: Return prediction
  throw new Error("Not implemented");
}

// Tests:
// const budget: BundleBudget = { maxFirstLoadKB: 100, maxRouteKB: 50, maxSharedKB: 90 };
// Use splitResult from Exercise 11 test
// const report = predictBudgetCompliance(splitResult, routes, budget);
// console.assert(report.sharedExceedsBudget === false); // 85KB shared < 90KB
// console.assert(report.routeReports.find(r => r.path === "/dash")?.exceedsBudget === false);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Build Optimization Exercises ===");
  console.log("Implement each exercise by replacing 'throw new Error(\"Not implemented\")'");
  console.log("Uncomment the tests to verify your solutions.");
  console.log("Run: npx tsx exercises.ts");
}

main().catch(console.error);

export {
  createLazyRegistry,
  findCircularDependencies,
  simulateTreeShaking,
  predictCodeSplitting,
  optimizeImageConfig,
  predictBarrelFileImpact,
  calculateBundleSize,
  createBrokenDynamicLoader,
  createFixedDynamicLoader,
  predictDynamicChunks,
  fixInefficientImports,
  simulateCodeSplitting,
  predictBudgetCompliance,
};

export type {
  ModuleInfo,
  DependencyGraph,
  ImageConfig,
  OptimizationSuggestion,
  ChunkInfo,
  SplitResult,
  DynamicImportEntry,
  LazyRegistry,
  TreeShakeResult,
  BarrelFileAnalysis,
  RouteConfig,
  BundleBudget,
  DynamicLoader,
  ChunkPrediction,
  ImportStatement,
  BudgetReport,
};
