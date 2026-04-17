// ============================================================
// Meta Tags — Exercises
// ============================================================
// Run: npx tsx 04-seo-nextjs/01-seo-fundamentals/meta-tags/exercises.ts
// ============================================================

// --- Types ---

export interface MetaTag {
  tag: "title" | "meta" | "link";
  attributes?: Record<string, string>;
  content?: string; // inner text for <title>
}

export interface RobotsDirective {
  index: boolean;
  follow: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number;
  maxImagePreview?: "none" | "standard" | "large";
}

export interface PageMetadata {
  title: string;
  description: string;
  canonical?: string;
  robots?: RobotsDirective;
  viewport?: string;
}

export interface TitleTemplate {
  template: string;   // e.g. "%s | My Site"
  default: string;
}

export interface MetadataWithTemplate {
  title?: string | TitleTemplate;
  description?: string;
  robots?: RobotsDirective;
  canonical?: string;
}

// ============================================================
// Exercise 1: Generate Title Tag
// ============================================================
// Given a title string, return a MetaTag representing a <title> element.
// If title exceeds 60 characters, truncate to 57 chars + "...".
export function generateTitleTag(title: string): MetaTag {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 2: Generate Meta Description Tag
// ============================================================
// Return a MetaTag for <meta name="description" content="...">.
// Truncate to 157 chars + "..." if over 160.
export function generateDescriptionTag(description: string): MetaTag {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 3: Generate Robots Meta Tag
// ============================================================
// Convert a RobotsDirective object into a <meta name="robots" content="..."> MetaTag.
// Include all applicable directives as comma-separated values.
export function generateRobotsTag(directive: RobotsDirective): MetaTag {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 4: Generate Canonical Link Tag
// ============================================================
// Return a <link rel="canonical" href="..."> MetaTag.
// Normalize: lowercase the URL, remove trailing slash (except root "/"),
// remove common tracking parameters (utm_source, utm_medium, utm_campaign, fbclid).
export function generateCanonicalTag(url: string): MetaTag {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 5: Generate All Head Tags
// ============================================================
// Given PageMetadata, return an array of MetaTag for all provided fields.
// Always include viewport (default "width=device-width, initial-scale=1").
export function generateHeadTags(meta: PageMetadata): MetaTag[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 6: Resolve Title with Template
// ============================================================
// Given a parent TitleTemplate and a child title string (or undefined),
// return the resolved title string.
// If child is undefined, use template.default.
// Replace %s in template with the child (or default).
export function resolveTitleTemplate(
  template: TitleTemplate,
  childTitle?: string
): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 7: Merge Metadata (Child Overrides Parent)
// ============================================================
// Merge parent and child MetadataWithTemplate objects.
// Child values override parent. Title uses template resolution.
// robots fields merge individually (child overrides specific fields).
export function mergeMetadata(
  parent: MetadataWithTemplate,
  child: MetadataWithTemplate
): MetadataWithTemplate {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 8: Predict Robots Behavior
// ============================================================
// Given an array of robots directives as raw strings (e.g. ["noindex", "follow"]),
// return a RobotsDirective object. Default: index=true, follow=true.
export function parseRobotsDirectives(directives: string[]): RobotsDirective {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 9: Validate PageMetadata
// ============================================================
// Return an array of warning strings for common SEO issues:
// - Title missing or empty → "Missing title"
// - Title > 60 chars → "Title too long (N chars, max 60)"
// - Description missing → "Missing description"
// - Description > 160 chars → "Description too long (N chars, max 160)"
// - Canonical missing → "Missing canonical URL"
// - Canonical not absolute URL → "Canonical must be absolute URL"
export function validateMetadata(meta: PageMetadata): string[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 10: Render Meta Tags to HTML
// ============================================================
// Convert an array of MetaTag objects into an HTML string.
// <title>...</title> for title tags.
// <meta name="..." content="..." /> for meta tags.
// <link rel="..." href="..." /> for link tags.
export function renderMetaTagsToHTML(tags: MetaTag[]): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 11: Build Next.js Static Metadata Object
// ============================================================
// Given page info, build a Next.js-style Metadata object.
// Input: { pageName, siteTitle, description, slug, baseUrl }
// Output shape matching Next.js Metadata type (simplified).
export interface NextMetadataInput {
  pageName: string;
  siteTitle: string;
  description: string;
  slug: string;
  baseUrl: string;
}

export interface NextMetadataOutput {
  title: string;
  description: string;
  alternates: { canonical: string };
  robots: { index: boolean; follow: boolean };
}

export function buildNextMetadata(input: NextMetadataInput): NextMetadataOutput {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 12: Detect Duplicate Titles
// ============================================================
// Given an array of { url: string, title: string } objects,
// return groups of URLs that share duplicate titles.
// Only include groups with 2+ URLs.
export function findDuplicateTitles(
  pages: Array<{ url: string; title: string }>
): Map<string, string[]> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
console.log("Meta Tags exercises loaded. Implement the functions above.");
