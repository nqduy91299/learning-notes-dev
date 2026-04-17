// ============================================================
// Sitemap & Robots.txt — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/02-technical-seo/sitemap-robots/solutions.ts
// ============================================================

import type { SitemapEntry, SitemapIndex, RobotsRule, RobotsConfig } from "./exercises.js";

// Exercise 1
function generateSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries.map(e => {
    let xml = `  <url>\n    <loc>${e.url}</loc>`;
    if (e.lastModified) xml += `\n    <lastmod>${e.lastModified}</lastmod>`;
    if (e.changeFrequency) xml += `\n    <changefreq>${e.changeFrequency}</changefreq>`;
    if (e.priority !== undefined) xml += `\n    <priority>${e.priority.toFixed(1)}</priority>`;
    xml += `\n  </url>`;
    return xml;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

// Exercise 2
function generateSitemapIndexXML(index: SitemapIndex): string {
  const sitemaps = index.sitemaps.map(s => {
    let xml = `  <sitemap>\n    <loc>${s.url}</loc>`;
    if (s.lastModified) xml += `\n    <lastmod>${s.lastModified}</lastmod>`;
    xml += `\n  </sitemap>`;
    return xml;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`;
}

// Exercise 3
function splitIntoSitemaps(entries: SitemapEntry[], baseUrl: string, maxPerSitemap = 50000) {
  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < entries.length; i += maxPerSitemap) {
    chunks.push(entries.slice(i, i + maxPerSitemap));
  }
  const sitemaps = new Map<string, SitemapEntry[]>();
  const indexEntries: SitemapIndex["sitemaps"] = [];
  chunks.forEach((chunk, i) => {
    const url = `${baseUrl}/sitemap-${i}.xml`;
    sitemaps.set(url, chunk);
    indexEntries.push({ url, lastModified: new Date().toISOString().split("T")[0] });
  });
  return { index: { sitemaps: indexEntries }, sitemaps };
}

// Exercise 4
function parseRobotsTxt(content: string): RobotsConfig {
  const lines = content.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];
  let current: RobotsRule | null = null;

  for (const line of lines) {
    const [directive, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = directive.trim().toLowerCase();

    if (key === "user-agent") {
      current = { userAgent: value, allow: [], disallow: [] };
      rules.push(current);
    } else if (key === "allow" && current) {
      current.allow.push(value);
    } else if (key === "disallow" && current) {
      current.disallow.push(value);
    } else if (key === "crawl-delay" && current) {
      current.crawlDelay = parseInt(value, 10);
    } else if (key === "sitemap") {
      sitemaps.push(value);
    }
  }
  return { rules, sitemaps };
}

// Exercise 5
function generateRobotsTxt(config: RobotsConfig): string {
  const parts: string[] = [];
  for (const rule of config.rules) {
    parts.push(`User-agent: ${rule.userAgent}`);
    for (const a of rule.allow) parts.push(`Allow: ${a}`);
    for (const d of rule.disallow) parts.push(`Disallow: ${d}`);
    if (rule.crawlDelay) parts.push(`Crawl-delay: ${rule.crawlDelay}`);
    parts.push("");
  }
  for (const s of config.sitemaps) parts.push(`Sitemap: ${s}`);
  return parts.join("\n").trim();
}

// Exercise 6
function isUrlAllowed(config: RobotsConfig, path: string, userAgent = "*"): boolean {
  const matchingRules = config.rules.filter(r => r.userAgent === userAgent || r.userAgent === "*");
  if (matchingRules.length === 0) return true;

  // Prefer specific user-agent over wildcard
  const rule = matchingRules.find(r => r.userAgent === userAgent) ?? matchingRules[0];

  let bestMatch = { path: "", allowed: true };
  for (const a of rule.allow) {
    if (path.startsWith(a) && a.length >= bestMatch.path.length) {
      bestMatch = { path: a, allowed: true };
    }
  }
  for (const d of rule.disallow) {
    if (path.startsWith(d) && d.length > bestMatch.path.length) {
      bestMatch = { path: d, allowed: false };
    }
  }
  return bestMatch.allowed;
}

// Exercise 7
function validateSitemapEntries(entries: SitemapEntry[]): Array<{ index: number; errors: string[] }> {
  const results: Array<{ index: number; errors: string[] }> = [];
  entries.forEach((e, i) => {
    const errors: string[] = [];
    try { new URL(e.url); } catch { errors.push("url must be absolute"); }
    if (e.priority !== undefined && (e.priority < 0 || e.priority > 1)) errors.push("priority must be 0.0-1.0");
    if (e.lastModified) {
      const d = new Date(e.lastModified);
      if (isNaN(d.getTime())) errors.push("lastModified must be valid ISO date");
    }
    if (errors.length > 0) results.push({ index: i, errors });
  });
  return results;
}

// Exercise 8
function buildNextJsSitemap(baseUrl: string, staticPages: string[], posts: Array<{ slug: string; updatedAt: string }>): SitemapEntry[] {
  const statics: SitemapEntry[] = staticPages.map(p => ({
    url: `${baseUrl}${p}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: p === "/" ? 1.0 : 0.8,
  }));
  const postEntries: SitemapEntry[] = posts.map(p => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...statics, ...postEntries];
}

// Exercise 9
function calculateCrawlBudget(input: { totalPages: number; blockedByRobots: number; noindexPages: number; duplicatePages: number }) {
  const crawlable = input.totalPages - input.blockedByRobots - input.noindexPages - input.duplicatePages;
  return {
    totalPages: input.totalPages,
    crawlable: Math.max(0, crawlable),
    blocked: input.blockedByRobots,
    noindex: input.noindexPages,
    duplicate: input.duplicatePages,
    efficiency: input.totalPages > 0 ? Math.max(0, crawlable) / input.totalPages : 0,
  };
}

// Exercise 10
function mergeRobotsConfigs(configs: RobotsConfig[]): RobotsConfig {
  const ruleMap = new Map<string, RobotsRule>();
  const sitemapSet = new Set<string>();
  for (const config of configs) {
    for (const rule of config.rules) {
      const existing = ruleMap.get(rule.userAgent);
      if (existing) {
        existing.allow.push(...rule.allow);
        existing.disallow.push(...rule.disallow);
        if (rule.crawlDelay) existing.crawlDelay = rule.crawlDelay;
      } else {
        ruleMap.set(rule.userAgent, { ...rule, allow: [...rule.allow], disallow: [...rule.disallow] });
      }
    }
    for (const s of config.sitemaps) sitemapSet.add(s);
  }
  return { rules: Array.from(ruleMap.values()), sitemaps: Array.from(sitemapSet) };
}

// Exercise 11
function filterSitemapByRobots(entries: SitemapEntry[], robots: RobotsConfig): SitemapEntry[] {
  return entries.filter(e => {
    try {
      const path = new URL(e.url).pathname;
      return isUrlAllowed(robots, path, "Googlebot");
    } catch { return true; }
  });
}

// Exercise 12
function detectSitemapIssues(entries: SitemapEntry[]): string[] {
  const issues: string[] = [];
  const urls = new Set<string>();
  let missingLastmod = 0;
  for (const e of entries) {
    if (urls.has(e.url)) issues.push(`Duplicate URL: ${e.url}`);
    urls.add(e.url);
    if (e.url.startsWith("http://")) issues.push(`Non-HTTPS URL: ${e.url}`);
    if (!e.lastModified) missingLastmod++;
    if (e.priority !== undefined && (e.priority < 0 || e.priority > 1)) issues.push(`Priority out of range: ${e.url}`);
  }
  if (missingLastmod > 0) issues.push(`Missing lastmod: ${missingLastmod} entries`);
  return issues;
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  console.log("Exercise 1: Generate Sitemap XML");
  const xml1 = generateSitemapXML([{ url: "https://a.com/", priority: 1.0 }]);
  assert(xml1.includes("<loc>https://a.com/</loc>") && xml1.includes("urlset"), "valid xml");

  console.log("Exercise 2: Generate Sitemap Index XML");
  const xi = generateSitemapIndexXML({ sitemaps: [{ url: "https://a.com/sitemap-0.xml" }] });
  assert(xi.includes("sitemapindex") && xi.includes("sitemap-0.xml"), "valid index");

  console.log("Exercise 3: Split into Sitemaps");
  const entries = Array.from({ length: 5 }, (_, i) => ({ url: `https://a.com/${i}` }));
  const split = splitIntoSitemaps(entries, "https://a.com", 2);
  assert(split.index.sitemaps.length === 3, "3 sitemaps");

  console.log("Exercise 4: Parse Robots.txt");
  const parsed = parseRobotsTxt("User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://a.com/sitemap.xml");
  assert(parsed.rules.length === 1 && parsed.sitemaps.length === 1, "parsed");

  console.log("Exercise 5: Generate Robots.txt");
  const txt = generateRobotsTxt({ rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin/"] }], sitemaps: ["https://a.com/sitemap.xml"] });
  assert(txt.includes("User-agent: *") && txt.includes("Disallow: /admin/"), "generated");

  console.log("Exercise 6: URL Allowed Check");
  const cfg: RobotsConfig = { rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin/", "/api/"] }], sitemaps: [] };
  assert(isUrlAllowed(cfg, "/blog"), "blog allowed");
  assert(!isUrlAllowed(cfg, "/admin/settings"), "admin blocked");

  console.log("Exercise 7: Validate Entries");
  const v = validateSitemapEntries([{ url: "not-url", priority: 2.0 }]);
  assert(v.length === 1 && v[0].errors.length === 2, "found errors");

  console.log("Exercise 8: Next.js Sitemap");
  const njs = buildNextJsSitemap("https://a.com", ["/", "/about"], [{ slug: "hello", updatedAt: "2024-01-01" }]);
  assert(njs.length === 3, "3 entries");

  console.log("Exercise 9: Crawl Budget");
  const cb = calculateCrawlBudget({ totalPages: 1000, blockedByRobots: 100, noindexPages: 50, duplicatePages: 150 });
  assert(cb.crawlable === 700 && cb.efficiency === 0.7, "budget calculated");

  console.log("Exercise 10: Merge Robots Configs");
  const merged = mergeRobotsConfigs([
    { rules: [{ userAgent: "*", allow: ["/a"], disallow: [] }], sitemaps: ["https://a.com/s.xml"] },
    { rules: [{ userAgent: "*", allow: ["/b"], disallow: ["/c"] }], sitemaps: ["https://a.com/s.xml"] },
  ]);
  assert(merged.rules[0].allow.length === 2 && merged.sitemaps.length === 1, "merged");

  console.log("Exercise 11: Filter Sitemap by Robots");
  const filtered = filterSitemapByRobots(
    [{ url: "https://a.com/blog" }, { url: "https://a.com/admin/page" }],
    { rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin/"] }], sitemaps: [] }
  );
  assert(filtered.length === 1, "admin filtered out");

  console.log("Exercise 12: Detect Sitemap Issues");
  const issues = detectSitemapIssues([
    { url: "https://a.com/" }, { url: "https://a.com/" }, { url: "http://a.com/page" },
  ]);
  assert(issues.some(i => i.includes("Duplicate")), "duplicate found");
  assert(issues.some(i => i.includes("Non-HTTPS")), "http found");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
