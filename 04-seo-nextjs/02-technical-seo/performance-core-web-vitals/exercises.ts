// ============================================================
// Performance & Core Web Vitals — Exercises
// ============================================================
// Run: npx tsx 04-seo-nextjs/02-technical-seo/performance-core-web-vitals/exercises.ts
// ============================================================

// --- Types ---

export interface CoreWebVitals {
  lcp: number;   // milliseconds
  fid: number;   // milliseconds (legacy)
  cls: number;   // unitless score
  inp: number;   // milliseconds
  ttfb: number;  // milliseconds
  fcp: number;   // milliseconds
}

export type Rating = "good" | "needs-improvement" | "poor";

export interface MetricRating {
  metric: string;
  value: number;
  rating: Rating;
  unit: string;
}

export interface PerformanceBudget {
  jsSize: number;       // KB
  cssSize: number;      // KB
  imageSize: number;    // KB
  fontSize: number;     // KB
  totalSize: number;    // KB
  lcpTarget: number;    // ms
  clsTarget: number;
  inpTarget: number;    // ms
}

export interface PageResources {
  js: number;
  css: number;
  images: number;
  fonts: number;
  other: number;
}

export interface AuditItem {
  rule: string;
  passed: boolean;
  message: string;
  impact: "high" | "medium" | "low";
}

export interface LayoutShift {
  impactFraction: number;   // 0-1
  distanceFraction: number; // 0-1
}

export interface LighthouseScores {
  tbt: number;   // ms
  lcp: number;   // ms
  cls: number;
  speedIndex: number; // ms
  fcp: number;   // ms
}

// ============================================================
// Exercise 1: Rate Core Web Vital
// ============================================================
// Given a metric name and value, return the rating.
// LCP: good ≤2500, needs-improvement ≤4000, poor >4000
// FID: good ≤100, needs-improvement ≤300, poor >300
// CLS: good ≤0.1, needs-improvement ≤0.25, poor >0.25
// INP: good ≤200, needs-improvement ≤500, poor >500
// TTFB: good ≤800, needs-improvement ≤1800, poor >1800
// FCP: good ≤1800, needs-improvement ≤3000, poor >3000
export function rateMetric(metric: keyof CoreWebVitals, value: number): Rating {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 2: Rate All Core Web Vitals
// ============================================================
// Given a CoreWebVitals object, return an array of MetricRating.
export function rateAllMetrics(cwv: CoreWebVitals): MetricRating[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 3: Calculate Overall CWV Score
// ============================================================
// Score: each "good" = 1, "needs-improvement" = 0.5, "poor" = 0.
// Only count LCP, CLS, INP (the three current CWVs).
// Return percentage 0-100.
export function calculateCWVScore(cwv: CoreWebVitals): number {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 4: Check Performance Budget
// ============================================================
// Compare PageResources against PerformanceBudget.
// Return: { passed: boolean, violations: string[] }
export function checkPerformanceBudget(
  resources: PageResources,
  budget: PerformanceBudget
): { passed: boolean; violations: string[] } {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 5: Calculate CLS from Layout Shifts
// ============================================================
// CLS = sum of (impactFraction × distanceFraction) for all shifts.
export function calculateCLS(shifts: LayoutShift[]): number {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 6: Estimate Lighthouse Performance Score
// ============================================================
// Weights: TBT 30%, LCP 25%, CLS 25%, Speed Index 10%, FCP 10%.
// For each metric, score 0-100 based on thresholds:
// TBT: 100 at 0ms, 50 at 300ms, 0 at 600ms+ (linear interpolation)
// LCP: 100 at 0ms, 50 at 2500ms, 0 at 4000ms+
// CLS: 100 at 0, 50 at 0.1, 0 at 0.25+
// Speed Index: 100 at 0ms, 50 at 3400ms, 0 at 5800ms+
// FCP: 100 at 0ms, 50 at 1800ms, 0 at 3000ms+
export function estimateLighthouseScore(scores: LighthouseScores): number {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 7: Performance Audit Checklist
// ============================================================
// Given page config, run audit checks and return AuditItem[].
export interface PageConfig {
  hasLazyImages: boolean;
  hasPriorityLCPImage: boolean;
  hasExplicitImageDimensions: boolean;
  usesFontDisplay: boolean;
  usesModernImageFormat: boolean;
  hasCodeSplitting: boolean;
  usesSSRorSSG: boolean;
  hasPreloadedCriticalAssets: boolean;
  totalJSSize: number;       // KB
  totalPageWeight: number;   // KB
  numberOfThirdPartyScripts: number;
}

export function runPerformanceAudit(config: PageConfig): AuditItem[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 8: Suggest Optimizations
// ============================================================
// Given CWV metrics, return specific optimization suggestions.
export function suggestOptimizations(cwv: CoreWebVitals): string[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 9: Calculate Total Page Weight
// ============================================================
// Sum all resources and add overhead (10% for headers/metadata).
// Return { total, breakdown, overBudget }
export function calculatePageWeight(
  resources: PageResources,
  budget: number // KB
): { total: number; breakdown: PageResources; overBudget: boolean; excessKB: number } {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 10: Simulate Performance Timeline
// ============================================================
// Given TTFB, FCP, LCP, and a list of resource load times,
// generate a timeline of events sorted by time.
export function generateTimeline(
  ttfb: number,
  fcp: number,
  lcp: number,
  resources: Array<{ name: string; startTime: number; duration: number }>
): Array<{ time: number; event: string }> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 11: Compare Performance Before/After
// ============================================================
// Compare two CoreWebVitals snapshots. Return improvements/regressions.
export function comparePerformance(
  before: CoreWebVitals,
  after: CoreWebVitals
): Array<{ metric: string; before: number; after: number; change: number; improved: boolean }> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 12: Generate Performance Report
// ============================================================
// Comprehensive report: ratings, score, budget check, suggestions.
export function generatePerformanceReport(
  cwv: CoreWebVitals,
  resources: PageResources,
  budget: PerformanceBudget
): {
  ratings: MetricRating[];
  score: number;
  budgetCheck: { passed: boolean; violations: string[] };
  suggestions: string[];
} {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
console.log("Performance & CWV exercises loaded. Implement the functions above.");
