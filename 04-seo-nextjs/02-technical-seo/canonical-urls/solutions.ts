// ============================================================
// Canonical URLs — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/02-technical-seo/canonical-urls/solutions.ts
// ============================================================

import type { CanonicalConfig, DuplicateGroup, CanonicalIssue } from "./exercises.js";

const DEFAULT_TRACKING = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "ref", "mc_cid", "mc_eid"];

// Exercise 1
function normalizeUrl(url: string, config: CanonicalConfig): string {
  const parsed = new URL(url);
  if (config.preferHttps) parsed.protocol = "https:";
  else parsed.protocol = "http:";
  if (config.preferWww && !parsed.hostname.startsWith("www.")) parsed.hostname = "www." + parsed.hostname;
  if (!config.preferWww && parsed.hostname.startsWith("www.")) parsed.hostname = parsed.hostname.slice(4);
  if (config.lowercasePath) parsed.pathname = parsed.pathname.toLowerCase();
  if (config.removeTrackingParams) {
    const params = config.trackingParams ?? DEFAULT_TRACKING;
    params.forEach(p => parsed.searchParams.delete(p));
  }
  let result = parsed.toString();
  // Handle trailing slash (not for root)
  const hasTrailing = parsed.pathname.endsWith("/") && parsed.pathname !== "/";
  if (config.trailingSlash && !hasTrailing && parsed.pathname !== "/") {
    const idx = result.indexOf("?");
    if (idx > -1) result = result.slice(0, idx) + "/" + result.slice(idx);
    else {
      const hIdx = result.indexOf("#");
      if (hIdx > -1) result = result.slice(0, hIdx) + "/" + result.slice(hIdx);
      else result += "/";
    }
  }
  if (!config.trailingSlash && hasTrailing) {
    result = result.replace(/(\/)+(\?|#|$)/, "$2");
  }
  return result;
}

// Exercise 2
function detectDuplicates(urls: string[], config: CanonicalConfig): DuplicateGroup[] {
  const map = new Map<string, string[]>();
  for (const url of urls) {
    const norm = normalizeUrl(url, config);
    const group = map.get(norm) ?? [];
    group.push(url);
    map.set(norm, group);
  }
  return Array.from(map.entries())
    .filter(([, urls]) => urls.length > 1)
    .map(([canonical, urls]) => ({ canonical, duplicates: urls }));
}

// Exercise 3
function generateCanonicalHTML(url: string, config: CanonicalConfig): string {
  return `<link rel="canonical" href="${normalizeUrl(url, config)}" />`;
}

// Exercise 4
function isSelfReferencing(pageUrl: string, canonicalUrl: string, config: CanonicalConfig): boolean {
  return normalizeUrl(pageUrl, config) === normalizeUrl(canonicalUrl, config);
}

// Exercise 5
function removeTrackingParams(url: string, customParams?: string[]): string {
  const parsed = new URL(url);
  const params = customParams ?? DEFAULT_TRACKING;
  params.forEach(p => parsed.searchParams.delete(p));
  return parsed.toString();
}

// Exercise 6
function detectCanonicalIssues(pages: Array<{ url: string; canonical: string; noindex?: boolean }>): CanonicalIssue[] {
  const issues: CanonicalIssue[] = [];
  for (const page of pages) {
    try { new URL(page.canonical); } catch { issues.push({ url: page.url, issue: "Canonical is relative URL" }); continue; }
    try {
      const pageHost = new URL(page.url).hostname;
      const canonHost = new URL(page.canonical).hostname;
      if (pageHost !== canonHost) issues.push({ url: page.url, issue: "Canonical points to different domain" });
    } catch { /* already caught */ }
    if (page.canonical.includes("404") || page.canonical.includes("error")) {
      issues.push({ url: page.url, issue: "Canonical returns error status" });
    }
    if (page.noindex) issues.push({ url: page.url, issue: "Canonical conflicts with noindex" });
  }
  return issues;
}

// Exercise 7
function buildCanonicalMap(rules: Array<{ pattern: string; canonical: string }>, urls: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const url of urls) {
    let matched = false;
    for (const rule of rules) {
      if (url.startsWith(rule.pattern)) { map.set(url, rule.canonical); matched = true; break; }
    }
    if (!matched) map.set(url, url);
  }
  return map;
}

// Exercise 8
function normalizeQueryParams(url: string): string {
  const parsed = new URL(url);
  const params = new URLSearchParams();
  const sorted = Array.from(parsed.searchParams.entries())
    .filter(([, v]) => v !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  for (const [k, v] of sorted) params.set(k, v);
  parsed.search = params.toString();
  return parsed.toString();
}

// Exercise 9
function buildNextAlternates(slug: string, baseUrl: string, config: CanonicalConfig): { canonical: string } {
  const raw = `${baseUrl}/${slug}`;
  return { canonical: normalizeUrl(raw, config) };
}

// Exercise 10
function validateCanonicalConsistency(input: {
  pages: Array<{ url: string; canonical: string }>;
  sitemapUrls: string[];
  internalLinks: Array<{ from: string; to: string }>;
}): string[] {
  const warnings: string[] = [];
  const sitemapSet = new Set(input.sitemapUrls);
  for (const page of input.pages) {
    if (page.canonical !== page.url && sitemapSet.has(page.url)) {
      warnings.push(`URL ${page.url} is in sitemap but has different canonical: ${page.canonical}`);
    }
    if (page.canonical === page.url && !sitemapSet.has(page.url)) {
      warnings.push(`Canonical URL ${page.url} is not in sitemap`);
    }
  }
  for (const link of input.internalLinks) {
    const targetPage = input.pages.find(p => p.url === link.to);
    if (targetPage && targetPage.canonical !== targetPage.url) {
      warnings.push(`Internal link from ${link.from} points to non-canonical ${link.to} (canonical: ${targetPage.canonical})`);
    }
  }
  return warnings;
}

// Exercise 11
function resolveCanonicalChain(url: string, canonicalMap: Map<string, string>): { resolved: string; chainLength: number; error?: string } {
  let current = url;
  const visited = new Set<string>();
  let depth = 0;
  while (canonicalMap.has(current) && canonicalMap.get(current) !== current) {
    if (visited.has(current)) return { resolved: current, chainLength: depth, error: `Infinite loop at ${current}` };
    if (depth >= 10) return { resolved: current, chainLength: depth, error: "Chain exceeds max depth of 10" };
    visited.add(current);
    current = canonicalMap.get(current)!;
    depth++;
  }
  return { resolved: current, chainLength: depth };
}

// Exercise 12
function generateRedirectRules(groups: DuplicateGroup[]): Array<{ from: string; to: string; status: 301 }> {
  const rules: Array<{ from: string; to: string; status: 301 }> = [];
  for (const group of groups) {
    for (const dup of group.duplicates) {
      if (dup !== group.canonical) rules.push({ from: dup, to: group.canonical, status: 301 });
    }
  }
  return rules;
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  const cfg: CanonicalConfig = { preferHttps: true, preferWww: false, trailingSlash: false, lowercasePath: true, removeTrackingParams: true };

  console.log("Exercise 1: Normalize URL");
  assert(normalizeUrl("HTTP://WWW.EXAMPLE.COM/Blog/?utm_source=tw", cfg) === "https://example.com/blog", "normalized");

  console.log("Exercise 2: Detect Duplicates");
  const dupes = detectDuplicates(["https://a.com/page", "https://a.com/Page", "https://a.com/other"], cfg);
  assert(dupes.length === 1 && dupes[0].duplicates.length === 2, "found dupes");

  console.log("Exercise 3: Generate Canonical HTML");
  const html = generateCanonicalHTML("http://www.a.com/Page", cfg);
  assert(html.includes('href="https://a.com/page"'), "canonical html");

  console.log("Exercise 4: Self-Referencing");
  assert(isSelfReferencing("https://a.com/page", "https://a.com/Page", cfg), "self ref");

  console.log("Exercise 5: Remove Tracking Params");
  const cleaned = removeTrackingParams("https://a.com/p?utm_source=tw&id=1");
  assert(cleaned.includes("id=1") && !cleaned.includes("utm_source"), "tracking removed");

  console.log("Exercise 6: Detect Canonical Issues");
  const issues = detectCanonicalIssues([
    { url: "https://a.com/p", canonical: "/p" },
    { url: "https://a.com/q", canonical: "https://b.com/q" },
    { url: "https://a.com/r", canonical: "https://a.com/r", noindex: true },
  ]);
  assert(issues.length === 3, "3 issues");

  console.log("Exercise 7: Build Canonical Map");
  const cmap = buildCanonicalMap([{ pattern: "/blog/", canonical: "/blog" }], ["/blog/post", "/about"]);
  assert(cmap.get("/blog/post") === "/blog", "mapped");
  assert(cmap.get("/about") === "/about", "self");

  console.log("Exercise 8: Normalize Query Params");
  const nq = normalizeQueryParams("https://a.com/p?z=1&a=2&empty=");
  assert(nq.includes("a=2") && nq.indexOf("a=2") < nq.indexOf("z=1"), "sorted");

  console.log("Exercise 9: Next.js Alternates");
  const alt = buildNextAlternates("blog/post", "https://a.com", cfg);
  assert(alt.canonical === "https://a.com/blog/post", "alternates built");

  console.log("Exercise 10: Validate Consistency");
  const warns = validateCanonicalConsistency({
    pages: [{ url: "https://a.com/p", canonical: "https://a.com/q" }],
    sitemapUrls: ["https://a.com/p"],
    internalLinks: [],
  });
  assert(warns.length >= 1, "found inconsistency");

  console.log("Exercise 11: Resolve Chain");
  const chain = resolveCanonicalChain("a", new Map([["a", "b"], ["b", "c"]]));
  assert(chain.resolved === "c" && chain.chainLength === 2, "chain resolved");

  console.log("Exercise 12: Generate Redirects");
  const redirects = generateRedirectRules([{ canonical: "https://a.com/p", duplicates: ["https://a.com/p", "https://a.com/P"] }]);
  assert(redirects.length === 1 && redirects[0].status === 301, "redirects generated");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
