// ============================================================
// Performance & Core Web Vitals — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/02-technical-seo/performance-core-web-vitals/solutions.ts
// ============================================================

import type {
  CoreWebVitals, Rating, MetricRating, PerformanceBudget,
  PageResources, AuditItem, LayoutShift, LighthouseScores, PageConfig,
} from "./exercises.js";

const THRESHOLDS: Record<keyof CoreWebVitals, [number, number]> = {
  lcp: [2500, 4000],
  fid: [100, 300],
  cls: [0.1, 0.25],
  inp: [200, 500],
  ttfb: [800, 1800],
  fcp: [1800, 3000],
};

const UNITS: Record<keyof CoreWebVitals, string> = {
  lcp: "ms", fid: "ms", cls: "", inp: "ms", ttfb: "ms", fcp: "ms",
};

// Exercise 1
function rateMetric(metric: keyof CoreWebVitals, value: number): Rating {
  const [good, poor] = THRESHOLDS[metric];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

// Exercise 2
function rateAllMetrics(cwv: CoreWebVitals): MetricRating[] {
  return (Object.keys(cwv) as Array<keyof CoreWebVitals>).map(k => ({
    metric: k.toUpperCase(),
    value: cwv[k],
    rating: rateMetric(k, cwv[k]),
    unit: UNITS[k],
  }));
}

// Exercise 3
function calculateCWVScore(cwv: CoreWebVitals): number {
  const metrics: Array<keyof CoreWebVitals> = ["lcp", "cls", "inp"];
  let score = 0;
  for (const m of metrics) {
    const r = rateMetric(m, cwv[m]);
    score += r === "good" ? 1 : r === "needs-improvement" ? 0.5 : 0;
  }
  return Math.round((score / metrics.length) * 100);
}

// Exercise 4
function checkPerformanceBudget(resources: PageResources, budget: PerformanceBudget) {
  const violations: string[] = [];
  if (resources.js > budget.jsSize) violations.push(`JS: ${resources.js}KB exceeds ${budget.jsSize}KB budget`);
  if (resources.css > budget.cssSize) violations.push(`CSS: ${resources.css}KB exceeds ${budget.cssSize}KB budget`);
  if (resources.images > budget.imageSize) violations.push(`Images: ${resources.images}KB exceeds ${budget.imageSize}KB budget`);
  if (resources.fonts > budget.fontSize) violations.push(`Fonts: ${resources.fonts}KB exceeds ${budget.fontSize}KB budget`);
  const total = resources.js + resources.css + resources.images + resources.fonts + resources.other;
  if (total > budget.totalSize) violations.push(`Total: ${total}KB exceeds ${budget.totalSize}KB budget`);
  return { passed: violations.length === 0, violations };
}

// Exercise 5
function calculateCLS(shifts: LayoutShift[]): number {
  return shifts.reduce((sum, s) => sum + s.impactFraction * s.distanceFraction, 0);
}

// Exercise 6
function estimateLighthouseScore(scores: LighthouseScores): number {
  function linearScore(value: number, median: number, poor: number): number {
    if (value <= 0) return 100;
    if (value >= poor) return 0;
    if (value <= median) return 100 - (value / median) * 50;
    return 50 - ((value - median) / (poor - median)) * 50;
  }
  const tbtScore = linearScore(scores.tbt, 300, 600);
  const lcpScore = linearScore(scores.lcp, 2500, 4000);
  const clsScore = linearScore(scores.cls, 0.1, 0.25);
  const siScore = linearScore(scores.speedIndex, 3400, 5800);
  const fcpScore = linearScore(scores.fcp, 1800, 3000);
  return Math.round(tbtScore * 0.3 + lcpScore * 0.25 + clsScore * 0.25 + siScore * 0.1 + fcpScore * 0.1);
}

// Exercise 7
function runPerformanceAudit(config: PageConfig): AuditItem[] {
  const items: AuditItem[] = [];
  items.push({ rule: "Lazy load below-fold images", passed: config.hasLazyImages, message: config.hasLazyImages ? "Images are lazy loaded" : "Add lazy loading to below-fold images", impact: "medium" });
  items.push({ rule: "Priority LCP image", passed: config.hasPriorityLCPImage, message: config.hasPriorityLCPImage ? "LCP image has priority" : "Add priority to LCP image", impact: "high" });
  items.push({ rule: "Explicit image dimensions", passed: config.hasExplicitImageDimensions, message: config.hasExplicitImageDimensions ? "Images have dimensions" : "Add width/height to images to prevent CLS", impact: "high" });
  items.push({ rule: "Font display swap", passed: config.usesFontDisplay, message: config.usesFontDisplay ? "Using font-display: swap" : "Add font-display: swap to prevent FOIT", impact: "medium" });
  items.push({ rule: "Modern image formats", passed: config.usesModernImageFormat, message: config.usesModernImageFormat ? "Using WebP/AVIF" : "Convert images to WebP or AVIF", impact: "medium" });
  items.push({ rule: "Code splitting", passed: config.hasCodeSplitting, message: config.hasCodeSplitting ? "Code is split" : "Implement code splitting to reduce JS bundle", impact: "high" });
  items.push({ rule: "SSR or SSG", passed: config.usesSSRorSSG, message: config.usesSSRorSSG ? "Using SSR/SSG" : "Use SSR or SSG for better LCP", impact: "high" });
  items.push({ rule: "Preloaded critical assets", passed: config.hasPreloadedCriticalAssets, message: config.hasPreloadedCriticalAssets ? "Critical assets preloaded" : "Preload critical CSS/fonts/images", impact: "medium" });
  const jsOk = config.totalJSSize <= 300;
  items.push({ rule: "JS bundle < 300KB", passed: jsOk, message: jsOk ? `JS: ${config.totalJSSize}KB` : `JS too large: ${config.totalJSSize}KB (budget: 300KB)`, impact: "high" });
  const weightOk = config.totalPageWeight <= 1500;
  items.push({ rule: "Page weight < 1.5MB", passed: weightOk, message: weightOk ? `Weight: ${config.totalPageWeight}KB` : `Page too heavy: ${config.totalPageWeight}KB`, impact: "medium" });
  const scriptsOk = config.numberOfThirdPartyScripts <= 3;
  items.push({ rule: "Third-party scripts ≤ 3", passed: scriptsOk, message: scriptsOk ? `${config.numberOfThirdPartyScripts} third-party scripts` : `Too many third-party scripts: ${config.numberOfThirdPartyScripts}`, impact: "medium" });
  return items;
}

// Exercise 8
function suggestOptimizations(cwv: CoreWebVitals): string[] {
  const suggestions: string[] = [];
  if (rateMetric("lcp", cwv.lcp) !== "good") {
    suggestions.push("Optimize LCP: preload hero image, use CDN, optimize server response time");
    if (cwv.ttfb > 800) suggestions.push("Reduce TTFB: use caching, edge computing, or SSG");
  }
  if (rateMetric("cls", cwv.cls) !== "good") {
    suggestions.push("Fix CLS: add dimensions to images/videos, reserve space for ads, use font-display:swap");
  }
  if (rateMetric("inp", cwv.inp) !== "good") {
    suggestions.push("Improve INP: break up long tasks, reduce JS execution, minimize DOM size");
  }
  if (rateMetric("fcp", cwv.fcp) !== "good") {
    suggestions.push("Improve FCP: eliminate render-blocking resources, inline critical CSS");
  }
  if (suggestions.length === 0) suggestions.push("All Core Web Vitals are good! Monitor for regressions.");
  return suggestions;
}

// Exercise 9
function calculatePageWeight(resources: PageResources, budget: number) {
  const raw = resources.js + resources.css + resources.images + resources.fonts + resources.other;
  const total = Math.round(raw * 1.1);
  return {
    total,
    breakdown: resources,
    overBudget: total > budget,
    excessKB: Math.max(0, total - budget),
  };
}

// Exercise 10
function generateTimeline(ttfb: number, fcp: number, lcp: number, resources: Array<{ name: string; startTime: number; duration: number }>) {
  const events: Array<{ time: number; event: string }> = [
    { time: 0, event: "Navigation start" },
    { time: ttfb, event: "TTFB" },
    { time: fcp, event: "FCP" },
    { time: lcp, event: "LCP" },
  ];
  for (const r of resources) {
    events.push({ time: r.startTime, event: `${r.name} start` });
    events.push({ time: r.startTime + r.duration, event: `${r.name} loaded` });
  }
  return events.sort((a, b) => a.time - b.time);
}

// Exercise 11
function comparePerformance(before: CoreWebVitals, after: CoreWebVitals) {
  return (Object.keys(before) as Array<keyof CoreWebVitals>).map(m => {
    const change = after[m] - before[m];
    // For CLS, lower is better; for time metrics, lower is better
    return { metric: m.toUpperCase(), before: before[m], after: after[m], change, improved: change < 0 };
  });
}

// Exercise 12
function generatePerformanceReport(cwv: CoreWebVitals, resources: PageResources, budget: PerformanceBudget) {
  return {
    ratings: rateAllMetrics(cwv),
    score: calculateCWVScore(cwv),
    budgetCheck: checkPerformanceBudget(resources, budget),
    suggestions: suggestOptimizations(cwv),
  };
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  const cwv: CoreWebVitals = { lcp: 2000, fid: 50, cls: 0.05, inp: 150, ttfb: 600, fcp: 1500 };
  const poorCwv: CoreWebVitals = { lcp: 5000, fid: 400, cls: 0.3, inp: 600, ttfb: 2000, fcp: 3500 };

  console.log("Exercise 1: Rate Metric");
  assert(rateMetric("lcp", 2000) === "good", "LCP good");
  assert(rateMetric("lcp", 3000) === "needs-improvement", "LCP needs-improvement");
  assert(rateMetric("cls", 0.3) === "poor", "CLS poor");

  console.log("Exercise 2: Rate All Metrics");
  const ratings = rateAllMetrics(cwv);
  assert(ratings.length === 6 && ratings.every(r => r.rating === "good"), "all good");

  console.log("Exercise 3: CWV Score");
  assert(calculateCWVScore(cwv) === 100, "perfect score");
  assert(calculateCWVScore(poorCwv) === 0, "zero score");

  console.log("Exercise 4: Performance Budget");
  const budget: PerformanceBudget = { jsSize: 300, cssSize: 50, imageSize: 500, fontSize: 100, totalSize: 1500, lcpTarget: 2500, clsTarget: 0.1, inpTarget: 200 };
  const ok = checkPerformanceBudget({ js: 200, css: 30, images: 400, fonts: 80, other: 50 }, budget);
  assert(ok.passed, "under budget");
  const over = checkPerformanceBudget({ js: 500, css: 30, images: 400, fonts: 80, other: 50 }, budget);
  assert(!over.passed && over.violations.length >= 1, "over budget");

  console.log("Exercise 5: Calculate CLS");
  assert(calculateCLS([{ impactFraction: 0.5, distanceFraction: 0.2 }]) === 0.1, "CLS calculated");

  console.log("Exercise 6: Lighthouse Score");
  const lh = estimateLighthouseScore({ tbt: 0, lcp: 0, cls: 0, speedIndex: 0, fcp: 0 });
  assert(lh === 100, "perfect lighthouse");

  console.log("Exercise 7: Performance Audit");
  const audit = runPerformanceAudit({
    hasLazyImages: true, hasPriorityLCPImage: true, hasExplicitImageDimensions: true,
    usesFontDisplay: true, usesModernImageFormat: true, hasCodeSplitting: true,
    usesSSRorSSG: true, hasPreloadedCriticalAssets: true, totalJSSize: 200,
    totalPageWeight: 1000, numberOfThirdPartyScripts: 2,
  });
  assert(audit.every(a => a.passed), "all audit passed");

  console.log("Exercise 8: Suggest Optimizations");
  const sugg = suggestOptimizations(poorCwv);
  assert(sugg.length >= 3, "multiple suggestions");

  console.log("Exercise 9: Page Weight");
  const pw = calculatePageWeight({ js: 200, css: 30, images: 400, fonts: 80, other: 50 }, 1000);
  assert(pw.total === 836 && !pw.overBudget, "weight calculated");

  console.log("Exercise 10: Timeline");
  const tl = generateTimeline(200, 800, 2000, [{ name: "hero.jpg", startTime: 300, duration: 500 }]);
  assert(tl[0].event === "Navigation start" && tl.length === 6, "timeline generated");

  console.log("Exercise 11: Compare Performance");
  const comp = comparePerformance(poorCwv, cwv);
  assert(comp.every(c => c.improved), "all improved");

  console.log("Exercise 12: Performance Report");
  const report = generatePerformanceReport(cwv, { js: 200, css: 30, images: 400, fonts: 80, other: 50 }, budget);
  assert(report.score === 100 && report.budgetCheck.passed, "good report");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
