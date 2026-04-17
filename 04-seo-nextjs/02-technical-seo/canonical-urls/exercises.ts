// ============================================================
// Canonical URLs — Exercises
// ============================================================
// Run: npx tsx 04-seo-nextjs/02-technical-seo/canonical-urls/exercises.ts
// ============================================================

// --- Types ---

export interface CanonicalConfig {
  preferHttps: boolean;
  preferWww: boolean;
  trailingSlash: boolean;
  lowercasePath: boolean;
  removeTrackingParams: boolean;
  trackingParams?: string[];
}

export interface URLPair {
  original: string;
  canonical: string;
}

export interface DuplicateGroup {
  canonical: string;
  duplicates: string[];
}

export interface CanonicalIssue {
  url: string;
  issue: string;
}

// ============================================================
// Exercise 1: Normalize URL
// ============================================================
// Apply normalization rules based on CanonicalConfig:
// - Force https/http based on preferHttps
// - Add/remove www based on preferWww
// - Add/remove trailing slash based on trailingSlash (except root "/")
// - Lowercase path if lowercasePath
// - Remove tracking params if removeTrackingParams
export function normalizeUrl(url: string, config: CanonicalConfig): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 2: Detect URL Duplicates
// ============================================================
// Given a list of URLs and a CanonicalConfig, group URLs that
// normalize to the same canonical. Return only groups with 2+ URLs.
export function detectDuplicates(
  urls: string[],
  config: CanonicalConfig
): DuplicateGroup[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 3: Generate Canonical Tag HTML
// ============================================================
// Given a URL and config, return the HTML link tag string.
// Always output absolute URL.
export function generateCanonicalHTML(url: string, config: CanonicalConfig): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 4: Check Self-Referencing Canonical
// ============================================================
// Given a page URL and its canonical URL, verify the canonical
// is self-referencing (same page after normalization).
export function isSelfReferencing(
  pageUrl: string,
  canonicalUrl: string,
  config: CanonicalConfig
): boolean {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 5: Remove Tracking Parameters
// ============================================================
// Strip common tracking params from a URL.
// Default params: utm_source, utm_medium, utm_campaign, utm_term,
// utm_content, fbclid, gclid, ref, mc_cid, mc_eid
export function removeTrackingParams(
  url: string,
  customParams?: string[]
): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 6: Detect Canonical Issues
// ============================================================
// Given pages with their canonical URLs, detect issues:
// - "Canonical is relative URL" if not absolute
// - "Canonical points to different domain" if cross-domain
// - "Canonical returns error status" (simulate: if canonical contains "404" or "error")
// - "Canonical chain detected" if canonical of canonical differs
// - "Canonical conflicts with noindex" if page has noindex flag
export function detectCanonicalIssues(
  pages: Array<{
    url: string;
    canonical: string;
    noindex?: boolean;
  }>
): CanonicalIssue[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 7: Build Canonical Map
// ============================================================
// Given URL patterns and their canonical targets, build a
// Map<string, string> that resolves any URL to its canonical.
// Patterns use simple prefix matching.
export function buildCanonicalMap(
  rules: Array<{ pattern: string; canonical: string }>,
  urls: string[]
): Map<string, string> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 8: Sort and Normalize Query Parameters
// ============================================================
// Sort query params alphabetically and remove empty values.
// This helps identify duplicate URLs with params in different order.
export function normalizeQueryParams(url: string): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 9: Build Next.js Alternates Object
// ============================================================
// Given a slug, base URL, and config, build the Next.js
// metadata.alternates object with canonical.
export function buildNextAlternates(
  slug: string,
  baseUrl: string,
  config: CanonicalConfig
): { canonical: string } {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 10: Validate Canonical Consistency
// ============================================================
// Check that all internal links, sitemap entries, and canonical
// tags are consistent. Returns warnings for mismatches.
export function validateCanonicalConsistency(input: {
  pages: Array<{ url: string; canonical: string }>;
  sitemapUrls: string[];
  internalLinks: Array<{ from: string; to: string }>;
}): string[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 11: Resolve Canonical Chain
// ============================================================
// Given a map of url → canonical, follow chains until stable.
// Detect infinite loops (return the loop URL with error).
// Max depth: 10.
export function resolveCanonicalChain(
  url: string,
  canonicalMap: Map<string, string>
): { resolved: string; chainLength: number; error?: string } {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 12: Generate Redirect Rules from Canonicals
// ============================================================
// Given duplicate groups, generate 301 redirect rules
// from each duplicate to the canonical URL.
// Return: Array<{ from: string; to: string; status: 301 }>
export function generateRedirectRules(
  groups: DuplicateGroup[]
): Array<{ from: string; to: string; status: 301 }> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
console.log("Canonical URLs exercises loaded. Implement the functions above.");
