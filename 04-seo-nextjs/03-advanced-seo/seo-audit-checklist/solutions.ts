// ============================================================
// SEO Audit Checklist — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/03-advanced-seo/seo-audit-checklist/solutions.ts
// ============================================================

import type {
  CheckStatus, AuditCheck, PageData, AuditReport, CategoryWeight,
} from "./exercises.js";

// Exercise 1
function runTechnicalChecks(page: PageData): AuditCheck[] {
  const checks: AuditCheck[] = [];
  checks.push({
    id: "tech-https", category: "technical", name: "HTTPS",
    status: page.isHttps ? "pass" : "fail",
    message: page.isHttps ? "Site uses HTTPS" : "Site is not using HTTPS",
    impact: "critical",
  });
  checks.push({
    id: "tech-canonical", category: "technical", name: "Canonical Tag",
    status: page.hasCanonical ? "pass" : "fail",
    message: page.hasCanonical ? "Canonical tag present" : "Missing canonical tag",
    impact: "high",
  });
  checks.push({
    id: "tech-robots", category: "technical", name: "Robots Meta",
    status: page.hasRobotsMeta ? "pass" : "warning",
    message: page.hasRobotsMeta ? "Robots meta present" : "No robots meta tag (defaults apply)",
    impact: "medium",
  });
  checks.push({
    id: "tech-title", category: "technical", name: "Title Exists",
    status: page.title ? "pass" : "fail",
    message: page.title ? "Title tag present" : "Missing title tag",
    impact: "critical",
  });
  const hasParams = page.url.includes("?");
  checks.push({
    id: "tech-url", category: "technical", name: "Clean URL",
    status: hasParams ? "warning" : "pass",
    message: hasParams ? "URL contains query parameters" : "Clean URL structure",
    impact: "low",
  });
  return checks;
}

// Exercise 2
function runOnPageChecks(page: PageData): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const titleLen = page.title?.length ?? 0;
  checks.push({
    id: "op-title-len", category: "on-page", name: "Title Length",
    status: !page.title ? "fail" : titleLen > 60 ? "warning" : "pass",
    message: !page.title ? "Missing title" : titleLen > 60 ? `Title too long (${titleLen} chars)` : "Title length OK",
    impact: "high",
  });
  const descLen = page.description?.length ?? 0;
  checks.push({
    id: "op-desc", category: "on-page", name: "Meta Description",
    status: !page.description ? "fail" : descLen > 160 ? "warning" : "pass",
    message: !page.description ? "Missing description" : descLen > 160 ? `Description too long (${descLen} chars)` : "Description OK",
    impact: "high",
  });
  const h1Count = page.h1?.length ?? 0;
  checks.push({
    id: "op-h1", category: "on-page", name: "H1 Tag",
    status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warning",
    message: h1Count === 1 ? "Single H1 tag" : h1Count === 0 ? "Missing H1 tag" : `Multiple H1 tags (${h1Count})`,
    impact: "high",
  });
  const missingAlt = page.images.filter(i => !i.alt).length;
  checks.push({
    id: "op-alt", category: "on-page", name: "Image Alt Text",
    status: missingAlt === 0 ? "pass" : missingAlt <= 2 ? "warning" : "fail",
    message: missingAlt === 0 ? "All images have alt text" : `${missingAlt} images missing alt text`,
    impact: "medium",
  });
  checks.push({
    id: "op-schema", category: "on-page", name: "Structured Data",
    status: page.hasStructuredData ? "pass" : "warning",
    message: page.hasStructuredData ? "Structured data present" : "No structured data found",
    impact: "medium",
  });
  checks.push({
    id: "op-og", category: "on-page", name: "Open Graph Tags",
    status: page.hasOpenGraph ? "pass" : "warning",
    message: page.hasOpenGraph ? "OG tags present" : "Missing Open Graph tags",
    impact: "low",
  });
  return checks;
}

// Exercise 3
function runPerformanceChecks(page: PageData): AuditCheck[] {
  const checks: AuditCheck[] = [];
  checks.push({
    id: "perf-lcp", category: "performance", name: "LCP",
    status: page.lcpMs <= 2500 ? "pass" : page.lcpMs <= 4000 ? "warning" : "fail",
    message: `LCP: ${page.lcpMs}ms`,
    impact: "critical",
  });
  checks.push({
    id: "perf-cls", category: "performance", name: "CLS",
    status: page.cls <= 0.1 ? "pass" : page.cls <= 0.25 ? "warning" : "fail",
    message: `CLS: ${page.cls}`,
    impact: "high",
  });
  checks.push({
    id: "perf-inp", category: "performance", name: "INP",
    status: page.inpMs <= 200 ? "pass" : page.inpMs <= 500 ? "warning" : "fail",
    message: `INP: ${page.inpMs}ms`,
    impact: "high",
  });
  checks.push({
    id: "perf-weight", category: "performance", name: "Page Weight",
    status: page.pageWeightKB <= 1500 ? "pass" : page.pageWeightKB <= 3000 ? "warning" : "fail",
    message: `Page weight: ${page.pageWeightKB}KB`,
    impact: "medium",
  });
  checks.push({
    id: "perf-load", category: "performance", name: "Load Time",
    status: page.loadTimeMs <= 3000 ? "pass" : page.loadTimeMs <= 5000 ? "warning" : "fail",
    message: `Load time: ${page.loadTimeMs}ms`,
    impact: "high",
  });
  return checks;
}

// Exercise 4
function runContentChecks(page: PageData): AuditCheck[] {
  const checks: AuditCheck[] = [];
  checks.push({
    id: "cnt-words", category: "content", name: "Word Count",
    status: page.wordCount >= 300 ? "pass" : page.wordCount >= 100 ? "warning" : "fail",
    message: `Word count: ${page.wordCount}`,
    impact: "medium",
  });
  checks.push({
    id: "cnt-internal", category: "content", name: "Internal Links",
    status: page.internalLinks >= 2 ? "pass" : page.internalLinks >= 1 ? "warning" : "fail",
    message: `${page.internalLinks} internal links`,
    impact: "medium",
  });
  checks.push({
    id: "cnt-external", category: "content", name: "External Links",
    status: page.externalLinks > 0 ? "pass" : "warning",
    message: page.externalLinks > 0 ? `${page.externalLinks} external links` : "No external links",
    impact: "low",
  });
  return checks;
}

// Exercise 5
function runMobileChecks(page: PageData): AuditCheck[] {
  const checks: AuditCheck[] = [];
  checks.push({
    id: "mob-friendly", category: "mobile", name: "Mobile Friendly",
    status: page.isMobileFriendly ? "pass" : "fail",
    message: page.isMobileFriendly ? "Mobile friendly" : "Not mobile friendly",
    impact: "critical",
  });
  checks.push({
    id: "mob-viewport", category: "mobile", name: "Viewport Meta",
    status: page.hasViewportMeta ? "pass" : "fail",
    message: page.hasViewportMeta ? "Viewport meta present" : "Missing viewport meta",
    impact: "high",
  });
  const missingDims = page.images.filter(i => !i.width || !i.height).length;
  checks.push({
    id: "mob-img-dims", category: "mobile", name: "Image Dimensions",
    status: missingDims === 0 ? "pass" : "warning",
    message: missingDims === 0 ? "All images have dimensions" : `${missingDims} images missing dimensions`,
    impact: "medium",
  });
  return checks;
}

// Exercise 6
function calculateCategoryScore(checks: AuditCheck[]): number {
  if (checks.length === 0) return 100;
  const score = checks.reduce((sum, c) => sum + (c.status === "pass" ? 1 : c.status === "warning" ? 0.5 : 0), 0);
  return Math.round((score / checks.length) * 100);
}

// Exercise 7
function calculateOverallScore(
  scores: { technical: number; onPage: number; performance: number; content: number; mobile: number },
  weights: CategoryWeight = { technical: 0.3, onPage: 0.25, performance: 0.25, content: 0.15, mobile: 0.05 }
): number {
  return Math.round(
    scores.technical * weights.technical +
    scores.onPage * weights.onPage +
    scores.performance * weights.performance +
    scores.content * weights.content +
    scores.mobile * weights.mobile
  );
}

// Exercise 8
function generateAuditReport(page: PageData): AuditReport {
  const technical = runTechnicalChecks(page);
  const onPage = runOnPageChecks(page);
  const performance = runPerformanceChecks(page);
  const content = runContentChecks(page);
  const mobile = runMobileChecks(page);
  const allChecks = [...technical, ...onPage, ...performance, ...content, ...mobile];

  const scores = {
    technical: calculateCategoryScore(technical),
    onPage: calculateCategoryScore(onPage),
    performance: calculateCategoryScore(performance),
    content: calculateCategoryScore(content),
    mobile: calculateCategoryScore(mobile),
    overall: 0,
  };
  scores.overall = calculateOverallScore(scores);

  const topIssues = prioritizeIssues(allChecks, 5);
  const rating = scores.overall >= 90 ? "Excellent" : scores.overall >= 70 ? "Good" : scores.overall >= 50 ? "Needs Work" : "Poor";

  return {
    url: page.url,
    timestamp: new Date().toISOString(),
    checks: allChecks,
    scores,
    summary: `SEO Score: ${scores.overall}/100 (${rating}). ${topIssues.length} issues found.`,
    topIssues,
  };
}

// Exercise 9
function prioritizeIssues(checks: AuditCheck[], topN = 5): string[] {
  const impactOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return checks
    .filter(c => c.status !== "pass")
    .sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])
    .slice(0, topN)
    .map(c => `[${c.impact.toUpperCase()}] ${c.name}: ${c.message}`);
}

// Exercise 10
function compareAudits(before: AuditReport, after: AuditReport) {
  const improved: string[] = [];
  const regressed: string[] = [];
  const unchanged: string[] = [];

  const beforeMap = new Map(before.checks.map(c => [c.id, c]));
  for (const afterCheck of after.checks) {
    const beforeCheck = beforeMap.get(afterCheck.id);
    if (!beforeCheck) continue;
    if (afterCheck.status === beforeCheck.status) unchanged.push(afterCheck.name);
    else if (
      (afterCheck.status === "pass" && beforeCheck.status !== "pass") ||
      (afterCheck.status === "warning" && beforeCheck.status === "fail")
    ) improved.push(afterCheck.name);
    else regressed.push(afterCheck.name);
  }

  return { improved, regressed, unchanged, scoreDelta: after.scores.overall - before.scores.overall };
}

// Exercise 11
function generateRemediationPlan(checks: AuditCheck[]) {
  const impactPriority: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
  const fixes: Record<string, string> = {
    "tech-https": "Migrate to HTTPS and set up 301 redirects",
    "tech-canonical": "Add self-referencing canonical tag",
    "tech-robots": "Add robots meta tag with appropriate directives",
    "tech-title": "Add a unique, descriptive title tag (50-60 chars)",
    "op-title-len": "Shorten title to under 60 characters",
    "op-desc": "Write a compelling meta description (150-160 chars)",
    "op-h1": "Ensure exactly one H1 tag per page",
    "op-alt": "Add descriptive alt text to all images",
    "op-schema": "Add JSON-LD structured data",
    "op-og": "Add Open Graph meta tags",
    "perf-lcp": "Optimize LCP: preload hero image, use CDN, reduce server time",
    "perf-cls": "Fix CLS: add image dimensions, reserve space for dynamic content",
    "perf-inp": "Improve INP: reduce JS execution, break up long tasks",
    "perf-weight": "Reduce page weight: compress images, minify CSS/JS",
    "perf-load": "Reduce load time: caching, CDN, code splitting",
    "cnt-words": "Add more substantive content (minimum 300 words)",
    "cnt-internal": "Add internal links to related pages",
    "mob-friendly": "Implement responsive design",
    "mob-viewport": "Add viewport meta tag",
  };

  return checks
    .filter(c => c.status !== "pass")
    .sort((a, b) => impactPriority[a.impact] - impactPriority[b.impact])
    .map(c => ({
      check: c.name,
      priority: impactPriority[c.impact],
      effort: (c.impact === "critical" || c.id.startsWith("perf")) ? "high" as const : c.impact === "low" ? "low" as const : "medium" as const,
      fix: fixes[c.id] ?? `Fix: ${c.message}`,
    }));
}

// Exercise 12
function batchAudit(pages: PageData[]) {
  const reports = pages.map(p => generateAuditReport(p));
  const averageScore = Math.round(reports.reduce((s, r) => s + r.scores.overall, 0) / reports.length);

  const issueCount = new Map<string, number>();
  for (const r of reports) {
    for (const c of r.checks) {
      if (c.status !== "pass") {
        const key = c.name;
        issueCount.set(key, (issueCount.get(key) ?? 0) + 1);
      }
    }
  }
  const commonIssues = Array.from(issueCount.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count);

  const worstPages = reports
    .map(r => ({ url: r.url, score: r.scores.overall }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return { reports, averageScore, commonIssues, worstPages };
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  const goodPage: PageData = {
    url: "https://example.com/blog/post",
    title: "Great Blog Post Title",
    description: "A compelling description of this blog post about SEO.",
    h1: ["Great Blog Post Title"],
    images: [{ src: "/img.jpg", alt: "Blog image", width: 800, height: 600 }],
    hasCanonical: true, canonicalUrl: "https://example.com/blog/post",
    hasRobotsMeta: true, robotsContent: "index, follow",
    hasStructuredData: true, hasOpenGraph: true,
    isHttps: true, wordCount: 500, internalLinks: 5, externalLinks: 2,
    loadTimeMs: 2000, pageWeightKB: 1000, lcpMs: 2000, cls: 0.05, inpMs: 100,
    isMobileFriendly: true, hasViewportMeta: true,
  };

  const badPage: PageData = {
    url: "http://example.com/page?id=123",
    title: "",
    description: "",
    h1: [],
    images: [{ src: "/img.jpg" }, { src: "/img2.jpg" }],
    hasCanonical: false, hasRobotsMeta: false,
    hasStructuredData: false, hasOpenGraph: false,
    isHttps: false, wordCount: 50, internalLinks: 0, externalLinks: 0,
    loadTimeMs: 6000, pageWeightKB: 4000, lcpMs: 5000, cls: 0.3, inpMs: 600,
    isMobileFriendly: false, hasViewportMeta: false,
  };

  console.log("Exercise 1: Technical Checks");
  const tech = runTechnicalChecks(goodPage);
  assert(tech.every(c => c.status === "pass"), "good page passes all technical");

  console.log("Exercise 2: On-Page Checks");
  const onp = runOnPageChecks(goodPage);
  assert(onp.every(c => c.status === "pass"), "good page passes all on-page");

  console.log("Exercise 3: Performance Checks");
  const perf = runPerformanceChecks(goodPage);
  assert(perf.every(c => c.status === "pass"), "good page passes performance");

  console.log("Exercise 4: Content Checks");
  const cnt = runContentChecks(goodPage);
  assert(cnt.every(c => c.status === "pass"), "good page passes content");

  console.log("Exercise 5: Mobile Checks");
  const mob = runMobileChecks(goodPage);
  assert(mob.every(c => c.status === "pass"), "good page passes mobile");

  console.log("Exercise 6: Category Score");
  assert(calculateCategoryScore(tech) === 100, "perfect score");
  const badTech = runTechnicalChecks(badPage);
  assert(calculateCategoryScore(badTech) < 50, "bad page low score");

  console.log("Exercise 7: Overall Score");
  const goodScores = { technical: 100, onPage: 100, performance: 100, content: 100, mobile: 100 };
  assert(calculateOverallScore(goodScores) === 100, "perfect overall");

  console.log("Exercise 8: Audit Report");
  const report = generateAuditReport(goodPage);
  assert(report.scores.overall >= 90, "good page high overall score");
  const badReport = generateAuditReport(badPage);
  assert(badReport.scores.overall < 50, "bad page low score");

  console.log("Exercise 9: Prioritize Issues");
  const issues = prioritizeIssues(runTechnicalChecks(badPage).concat(runPerformanceChecks(badPage)));
  assert(issues.length > 0 && issues[0].includes("CRITICAL"), "critical first");

  console.log("Exercise 10: Compare Audits");
  const comp = compareAudits(badReport, report);
  assert(comp.improved.length > 0 && comp.scoreDelta > 0, "improvements detected");

  console.log("Exercise 11: Remediation Plan");
  const plan = generateRemediationPlan(runTechnicalChecks(badPage));
  assert(plan.length > 0 && plan[0].priority === 1, "critical first in plan");

  console.log("Exercise 12: Batch Audit");
  const batch = batchAudit([goodPage, badPage]);
  assert(batch.reports.length === 2, "2 reports");
  assert(batch.commonIssues.length > 0, "common issues found");
  assert(batch.worstPages[0].url === badPage.url, "worst page identified");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
