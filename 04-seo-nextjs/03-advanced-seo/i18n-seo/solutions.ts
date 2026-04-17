// ============================================================
// i18n SEO — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/03-advanced-seo/i18n-seo/solutions.ts
// ============================================================

import type {
  LocaleConfig, HreflangTag, I18nPageConfig,
  AcceptLanguageEntry, AlternatesMetadata,
} from "./exercises.js";

function buildHreflangCode(locale: LocaleConfig): string {
  return locale.region ? `${locale.code}-${locale.region}` : locale.code;
}

function buildLocaleUrl(baseUrl: string, locale: LocaleConfig, slug: string, strategy: "subpath" | "subdomain" | "tld"): string {
  const s = slug.startsWith("/") ? slug : `/${slug}`;
  if (strategy === "subpath") {
    return `${baseUrl}/${locale.code}${s}`;
  }
  if (strategy === "subdomain") {
    const parsed = new URL(baseUrl);
    return `${parsed.protocol}//${locale.code}.${parsed.host}${s}`;
  }
  // tld
  const parsed = new URL(baseUrl);
  const regionTld = locale.region?.toLowerCase() ?? locale.code;
  const hostParts = parsed.hostname.split(".");
  hostParts[hostParts.length - 1] = regionTld;
  return `${parsed.protocol}//${hostParts.join(".")}${s}`;
}

// Exercise 1
function generateHreflangTags(config: I18nPageConfig): HreflangTag[] {
  const tags: HreflangTag[] = [];
  const defaultLocale = config.locales.find(l => l.isDefault);
  for (const locale of config.locales) {
    tags.push({
      hreflang: buildHreflangCode(locale),
      href: buildLocaleUrl(config.baseUrl, locale, config.slug, config.urlStrategy),
    });
  }
  if (defaultLocale) {
    tags.push({
      hreflang: "x-default",
      href: buildLocaleUrl(config.baseUrl, defaultLocale, config.slug, config.urlStrategy),
    });
  }
  return tags;
}

// Exercise 3
function parseAcceptLanguage(header: string): AcceptLanguageEntry[] {
  return header.split(",").map(part => {
    const [lang, ...rest] = part.trim().split(";");
    const qPart = rest.find(r => r.trim().startsWith("q="));
    const quality = qPart ? parseFloat(qPart.trim().split("=")[1]) : 1.0;
    const [language, region] = lang.trim().split("-");
    return { language, region, quality };
  }).sort((a, b) => b.quality - a.quality);
}

// Exercise 4
function matchBestLocale(acceptLanguage: AcceptLanguageEntry[], locales: LocaleConfig[]): string {
  for (const entry of acceptLanguage) {
    // Try exact match (language + region)
    if (entry.region) {
      const exact = locales.find(l => l.code === entry.language && l.region === entry.region);
      if (exact) return exact.code;
    }
    // Try language-only match
    const langMatch = locales.find(l => l.code === entry.language);
    if (langMatch) return langMatch.code;
  }
  return locales.find(l => l.isDefault)?.code ?? locales[0].code;
}

// Exercise 5
function buildAlternatesMetadata(config: I18nPageConfig, currentLocale: string): AlternatesMetadata {
  const currentLoc = config.locales.find(l => l.code === currentLocale)!;
  const canonical = buildLocaleUrl(config.baseUrl, currentLoc, config.slug, config.urlStrategy);
  const languages: Record<string, string> = {};
  for (const locale of config.locales) {
    languages[buildHreflangCode(locale)] = buildLocaleUrl(config.baseUrl, locale, config.slug, config.urlStrategy);
  }
  const defaultLocale = config.locales.find(l => l.isDefault);
  if (defaultLocale) {
    languages["x-default"] = buildLocaleUrl(config.baseUrl, defaultLocale, config.slug, config.urlStrategy);
  }
  return { canonical, languages };
}

// Exercise 6
function validateHreflangBidirectional(pages: Map<string, HreflangTag[]>): string[] {
  const errors: string[] = [];
  for (const [pageUrl, tags] of pages) {
    for (const tag of tags) {
      if (tag.hreflang === "x-default") continue;
      const targetTags = pages.get(tag.href);
      if (!targetTags) { errors.push(`${tag.href} referenced by ${pageUrl} has no hreflang tags`); continue; }
      const backlinkExists = targetTags.some(t => t.href === pageUrl);
      if (!backlinkExists) errors.push(`${tag.href} does not link back to ${pageUrl}`);
    }
  }
  return errors;
}

// Exercise 7
function generateI18nSitemapXML(pages: Array<{ slug: string; locales: string[] }>, config: I18nPageConfig): string {
  const urls = pages.map(page => {
    const xhtmlLinks = page.locales.map(locCode => {
      const loc = config.locales.find(l => l.code === locCode)!;
      const href = buildLocaleUrl(config.baseUrl, loc, page.slug, config.urlStrategy);
      return `    <xhtml:link rel="alternate" hreflang="${buildHreflangCode(loc)}" href="${href}" />`;
    });
    const defaultLoc = config.locales.find(l => l.isDefault)!;
    xhtmlLinks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${buildLocaleUrl(config.baseUrl, defaultLoc, page.slug, config.urlStrategy)}" />`);
    const firstLoc = config.locales.find(l => l.code === page.locales[0])!;
    return `  <url>\n    <loc>${buildLocaleUrl(config.baseUrl, firstLoc, page.slug, config.urlStrategy)}</loc>\n${xhtmlLinks.join("\n")}\n  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
}

// Exercise 9
function detectI18nIssues(pages: Map<string, HreflangTag[]>): string[] {
  const issues: string[] = [];
  let expectedCount: number | null = null;
  for (const [url, tags] of pages) {
    if (!tags.some(t => t.hreflang === "x-default")) issues.push(`Missing x-default on ${url}`);
    if (!tags.some(t => t.href === url)) issues.push(`Missing self-referencing hreflang on ${url}`);
    if (expectedCount === null) expectedCount = tags.length;
    else if (tags.length !== expectedCount) issues.push(`Inconsistent alternates count on ${url}: ${tags.length} vs expected ${expectedCount}`);
    for (const tag of tags) {
      if (tag.hreflang !== "x-default" && !/^[a-z]{2}(-[A-Z]{2})?$/.test(tag.hreflang)) {
        issues.push(`Invalid hreflang code "${tag.hreflang}" on ${url}`);
      }
    }
  }
  return issues;
}

// Exercise 10
function generateLanguageSwitcherUrls(currentUrl: string, currentLocale: string, config: I18nPageConfig) {
  return config.locales.map(locale => ({
    locale: locale.code,
    name: locale.name,
    url: buildLocaleUrl(config.baseUrl, locale, config.slug, config.urlStrategy),
    isCurrent: locale.code === currentLocale,
  }));
}

// Exercise 11
function renderHreflangHTML(tags: HreflangTag[]): string {
  return tags.map(t => `<link rel="alternate" hreflang="${t.hreflang}" href="${t.href}" />`).join("\n");
}

// Exercise 12
function buildCompleteI18nSEO(input: { baseUrl: string; slugs: string[]; locales: LocaleConfig[] }) {
  const hreflangByPage = new Map<string, HreflangTag[]>();
  const alternatesByPage = new Map<string, AlternatesMetadata>();
  for (const slug of input.slugs) {
    for (const locale of input.locales) {
      const config: I18nPageConfig = { baseUrl: input.baseUrl, slug, locales: input.locales, urlStrategy: "subpath" };
      const url = buildLocaleUrl(input.baseUrl, locale, slug, "subpath");
      hreflangByPage.set(url, generateHreflangTags(config));
      alternatesByPage.set(url, buildAlternatesMetadata(config, locale.code));
    }
  }
  return { hreflangByPage, alternatesByPage };
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  const locales: LocaleConfig[] = [
    { code: "en", name: "English", isDefault: true },
    { code: "es", name: "Spanish", isDefault: false },
    { code: "fr", name: "French", isDefault: false },
  ];
  const config: I18nPageConfig = { baseUrl: "https://example.com", slug: "about", locales, urlStrategy: "subpath" };

  console.log("Exercise 1: Generate Hreflang Tags");
  const tags = generateHreflangTags(config);
  assert(tags.length === 4, "3 locales + x-default");
  assert(tags.some(t => t.hreflang === "x-default"), "has x-default");

  console.log("Exercise 2: Build Locale URL");
  const url = buildLocaleUrl("https://example.com", locales[1], "about", "subpath");
  assert(url === "https://example.com/es/about", "subpath url");

  console.log("Exercise 3: Parse Accept-Language");
  const parsed = parseAcceptLanguage("en-US,en;q=0.9,es;q=0.8");
  assert(parsed.length === 3 && parsed[0].language === "en" && parsed[0].quality === 1.0, "parsed");

  console.log("Exercise 4: Match Best Locale");
  const best = matchBestLocale(parsed, locales);
  assert(best === "en", "matched en");

  console.log("Exercise 5: Build Alternates Metadata");
  const alt = buildAlternatesMetadata(config, "es");
  assert(alt.canonical.includes("/es/"), "canonical for es");
  assert(Object.keys(alt.languages).length === 4, "4 languages including x-default");

  console.log("Exercise 6: Validate Bidirectional");
  const pagesMap = new Map<string, HreflangTag[]>();
  pagesMap.set("https://example.com/en/about", [
    { hreflang: "en", href: "https://example.com/en/about" },
    { hreflang: "es", href: "https://example.com/es/about" },
  ]);
  pagesMap.set("https://example.com/es/about", [
    { hreflang: "es", href: "https://example.com/es/about" },
    // Missing backlink to en!
  ]);
  const biErrors = validateHreflangBidirectional(pagesMap);
  assert(biErrors.length >= 1, "found bidirectional error");

  console.log("Exercise 7: i18n Sitemap XML");
  const sitemapXml = generateI18nSitemapXML([{ slug: "about", locales: ["en", "es"] }], config);
  assert(sitemapXml.includes("xhtml:link") && sitemapXml.includes("x-default"), "sitemap has hreflang");

  console.log("Exercise 8: Build Hreflang Code");
  assert(buildHreflangCode({ code: "en", region: "US", name: "English US", isDefault: true }) === "en-US", "with region");
  assert(buildHreflangCode({ code: "es", name: "Spanish", isDefault: false }) === "es", "without region");

  console.log("Exercise 9: Detect i18n Issues");
  const issuePages = new Map<string, HreflangTag[]>();
  issuePages.set("https://a.com/en/p", [{ hreflang: "en", href: "https://a.com/en/p" }]); // no x-default
  const issues = detectI18nIssues(issuePages);
  assert(issues.some(i => i.includes("x-default")), "found missing x-default");

  console.log("Exercise 10: Language Switcher URLs");
  const switcher = generateLanguageSwitcherUrls("https://example.com/en/about", "en", config);
  assert(switcher.length === 3 && switcher[0].isCurrent, "switcher urls");

  console.log("Exercise 11: Render Hreflang HTML");
  const html = renderHreflangHTML([{ hreflang: "en", href: "https://a.com/en" }]);
  assert(html.includes('hreflang="en"') && html.includes('rel="alternate"'), "html rendered");

  console.log("Exercise 12: Complete i18n SEO");
  const complete = buildCompleteI18nSEO({ baseUrl: "https://example.com", slugs: ["about", "contact"], locales });
  assert(complete.hreflangByPage.size === 6, "6 pages (3 locales × 2 slugs)");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
