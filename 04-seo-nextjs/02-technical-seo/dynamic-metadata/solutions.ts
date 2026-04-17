// ============================================================
// Dynamic Metadata — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/02-technical-seo/dynamic-metadata/solutions.ts
// ============================================================

import type {
  TitleConfig, MetadataNode, MetadataTree, OGImageConfig,
  DynamicRouteParams, PageData,
} from "./exercises.js";

// Exercise 1
function resolveTitle(parent: TitleConfig | string | undefined, child: TitleConfig | string | undefined): string {
  if (typeof child === "object" && child?.absolute) return child.absolute;
  const template = typeof parent === "object" ? parent?.template : undefined;
  const defaultTitle = typeof parent === "object" ? parent?.default : (typeof parent === "string" ? parent : "Untitled");
  const childStr = typeof child === "string" ? child : (typeof child === "object" ? (child?.default ?? undefined) : undefined);
  const title = childStr ?? defaultTitle ?? "Untitled";
  if (template && childStr) return template.replace("%s", childStr);
  return title;
}

// Exercise 2
function mergeMetadataNodes(parent: MetadataNode, child: MetadataNode): MetadataNode {
  const result: MetadataNode = { ...parent };
  // If child has a template, preserve it for downstream resolution
  if (typeof child.title === "object" && child.title?.template) {
    result.title = child.title;
  } else {
    const resolvedTitle = resolveTitle(parent.title as any, child.title as any);
    result.title = resolvedTitle;
  }
  if (child.description !== undefined) result.description = child.description;
  if (child.openGraph) result.openGraph = { ...parent.openGraph, ...child.openGraph };
  if (child.twitter) result.twitter = { ...parent.twitter, ...child.twitter };
  if (child.robots) result.robots = child.robots;
  if (child.alternates) result.alternates = child.alternates;
  return result;
}

// Exercise 3
function resolveMetadataTree(tree: MetadataTree): MetadataNode {
  let current = { ...tree.root };
  for (const layout of tree.layouts ?? []) {
    current = mergeMetadataNodes(current, layout);
  }
  return mergeMetadataNodes(current, tree.page);
}

// Exercise 4
function buildOGImageUrl(baseUrl: string, config: OGImageConfig): string {
  const params = new URLSearchParams();
  params.set("title", config.title);
  if (config.subtitle) params.set("subtitle", config.subtitle);
  params.set("theme", config.theme);
  params.set("w", String(config.width));
  params.set("h", String(config.height));
  params.set("fontSize", String(config.fontSize));
  return `${baseUrl}/api/og?${params.toString()}`;
}

// Exercise 5
function generateMetadataForRoute(params: DynamicRouteParams, fetchData: (slug: string) => PageData | null, baseUrl: string): MetadataNode {
  const data = fetchData(params.slug);
  if (!data) return { title: "Not Found", description: "Page not found", robots: { index: false, follow: false } };
  return {
    title: data.title,
    description: data.excerpt,
    openGraph: { title: data.title, description: data.excerpt, images: [data.coverImage], type: "article" },
    alternates: { canonical: `${baseUrl}/blog/${params.slug}` },
    robots: { index: true, follow: true },
  };
}

// Exercise 6
function buildOGImageStyle(title: string, theme: "light" | "dark", subtitle?: string): OGImageConfig {
  const fontSize = title.length <= 30 ? 64 : title.length <= 60 ? 48 : 36;
  return {
    title, subtitle, theme,
    width: 1200, height: 630, fontSize,
    bgColor: theme === "dark" ? "#1a1a2e" : "#ffffff",
    textColor: theme === "dark" ? "#ffffff" : "#1a1a2e",
  };
}

// Exercise 7
function validateMetadataCompleteness(metadata: MetadataNode): string[] {
  const warnings: string[] = [];
  const title = typeof metadata.title === "string" ? metadata.title : (typeof metadata.title === "object" ? metadata.title?.default : undefined);
  if (!title) warnings.push("Missing title");
  else if (title.length > 60) warnings.push("Title exceeds 60 characters");
  if (!metadata.description) warnings.push("Missing description");
  else if (metadata.description.length > 160) warnings.push("Description exceeds 160 characters");
  if (!metadata.openGraph?.images?.length) warnings.push("Missing OG image");
  if (!metadata.alternates?.canonical) warnings.push("Missing canonical");
  if (!metadata.robots) warnings.push("Missing robots directive");
  return warnings;
}

// Exercise 8
function generateCollectionMetadata(input: { collectionName: string; page: number; totalPages: number; baseUrl: string; itemCount: number }): MetadataNode {
  const pageStr = input.page > 1 ? ` - Page ${input.page}` : "";
  return {
    title: `${input.collectionName}${pageStr}`,
    description: `Browse ${input.itemCount} items in ${input.collectionName}${pageStr}. Page ${input.page} of ${input.totalPages}.`,
    alternates: { canonical: `${input.baseUrl}/${input.collectionName.toLowerCase()}${input.page > 1 ? `?page=${input.page}` : ""}` },
    robots: { index: input.page <= 5, follow: true },
  };
}

// Exercise 9
function applyMetadataTemplate(template: MetadataNode, variables: Record<string, string>): MetadataNode {
  function replacePlaceholders(str: string): string {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }
  const result: MetadataNode = {};
  if (typeof template.title === "string") result.title = replacePlaceholders(template.title);
  else if (template.title) result.title = template.title;
  if (template.description) result.description = replacePlaceholders(template.description);
  if (template.openGraph) {
    result.openGraph = { ...template.openGraph };
    if (result.openGraph.title) result.openGraph.title = replacePlaceholders(result.openGraph.title);
    if (result.openGraph.description) result.openGraph.description = replacePlaceholders(result.openGraph.description);
  }
  if (template.robots) result.robots = template.robots;
  if (template.alternates) result.alternates = template.alternates;
  if (template.twitter) result.twitter = template.twitter;
  return result;
}

// Exercise 10
function detectMetadataConflicts(tree: MetadataTree): string[] {
  const conflicts: string[] = [];
  const resolved = resolveMetadataTree(tree);
  // Check noindex on content page
  if (resolved.robots?.index === false && tree.page.title) {
    conflicts.push("robots noindex set on indexable page");
  }
  const pageTitle = typeof resolved.title === "string" ? resolved.title : undefined;
  if (resolved.openGraph?.title && pageTitle && resolved.openGraph.title !== pageTitle) {
    conflicts.push("OG title differs from page title");
  }
  if (tree.page.description && !resolved.openGraph?.images?.length) {
    conflicts.push("Missing OG image on page with dynamic data");
  }
  return conflicts;
}

// Exercise 11
function generateBatchMetadata(slugs: string[], fetchData: (slug: string) => PageData | null, baseUrl: string): Map<string, MetadataNode> {
  const map = new Map<string, MetadataNode>();
  for (const slug of slugs) {
    map.set(slug, generateMetadataForRoute({ slug }, fetchData, baseUrl));
  }
  return map;
}

// Exercise 12
function serializeMetadataToHead(metadata: MetadataNode): string[] {
  const tags: string[] = [];
  const title = typeof metadata.title === "string" ? metadata.title : (typeof metadata.title === "object" ? metadata.title?.default : undefined);
  if (title) tags.push(`<title>${title}</title>`);
  if (metadata.description) tags.push(`<meta name="description" content="${metadata.description}" />`);
  if (metadata.robots) {
    const parts: string[] = [];
    parts.push(metadata.robots.index !== false ? "index" : "noindex");
    parts.push(metadata.robots.follow !== false ? "follow" : "nofollow");
    tags.push(`<meta name="robots" content="${parts.join(", ")}" />`);
  }
  if (metadata.alternates?.canonical) tags.push(`<link rel="canonical" href="${metadata.alternates.canonical}" />`);
  if (metadata.openGraph) {
    const og = metadata.openGraph;
    if (og.title) tags.push(`<meta property="og:title" content="${og.title}" />`);
    if (og.description) tags.push(`<meta property="og:description" content="${og.description}" />`);
    if (og.images) og.images.forEach(img => tags.push(`<meta property="og:image" content="${img}" />`));
  }
  return tags;
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  const fetcher = (slug: string): PageData | null => {
    if (slug === "hello") return { title: "Hello World", excerpt: "A hello post", coverImage: "https://a.com/img.png", author: "Jo", publishedAt: "2024-01-01", tags: ["ts"] };
    return null;
  };

  console.log("Exercise 1: Resolve Title");
  assert(resolveTitle({ template: "%s | Site", default: "Home" }, "Blog") === "Blog | Site", "template applied");
  assert(resolveTitle({ template: "%s | Site", default: "Home" }, undefined) === "Home", "default used");
  assert(resolveTitle(undefined, { absolute: "Custom" }) === "Custom", "absolute");

  console.log("Exercise 2: Merge Metadata Nodes");
  const merged = mergeMetadataNodes(
    { title: { template: "%s | Site", default: "Home" }, description: "Parent", openGraph: { siteName: "Site" } },
    { title: "Blog", openGraph: { title: "Blog OG" } }
  );
  assert(merged.title === "Blog | Site", "title merged");
  assert(merged.openGraph?.siteName === "Site", "og inherited");

  console.log("Exercise 3: Resolve Metadata Tree");
  const resolved = resolveMetadataTree({
    root: { title: { template: "%s | Site", default: "Home" }, openGraph: { siteName: "Site" } },
    layouts: [{ title: { template: "%s | Blog", default: "Blog" } }],
    page: { title: "Post", description: "A post" },
  });
  assert(resolved.title === "Post | Blog", "tree resolved");

  console.log("Exercise 4: Build OG Image URL");
  const ogUrl = buildOGImageUrl("https://a.com", { title: "Hello", theme: "dark", width: 1200, height: 630, fontSize: 48, bgColor: "#000", textColor: "#fff" });
  assert(ogUrl.includes("title=Hello") && ogUrl.includes("/api/og"), "og url built");

  console.log("Exercise 5: Generate Metadata for Route");
  const rm = generateMetadataForRoute({ slug: "hello" }, fetcher, "https://a.com");
  assert(rm.title === "Hello World", "route metadata");
  const rm404 = generateMetadataForRoute({ slug: "missing" }, fetcher, "https://a.com");
  assert(rm404.robots?.index === false, "404 noindex");

  console.log("Exercise 6: OG Image Style");
  const style = buildOGImageStyle("Short", "dark");
  assert(style.fontSize === 64, "large font for short title");
  const style2 = buildOGImageStyle("A".repeat(61), "light");
  assert(style2.fontSize === 36, "small font for long title");

  console.log("Exercise 7: Validate Completeness");
  const warns = validateMetadataCompleteness({ title: "T", description: "D" });
  assert(warns.includes("Missing OG image") && warns.includes("Missing canonical"), "found missing");

  console.log("Exercise 8: Collection Metadata");
  const coll = generateCollectionMetadata({ collectionName: "Blog", page: 2, totalPages: 5, baseUrl: "https://a.com", itemCount: 50 });
  assert((coll.title as string).includes("Page 2"), "page in title");

  console.log("Exercise 9: Apply Template");
  const tmpl = applyMetadataTemplate(
    { title: "{{title}} - {{siteName}}", description: "Read about {{title}}" },
    { title: "TypeScript", siteName: "DevBlog" }
  );
  assert(tmpl.title === "TypeScript - DevBlog", "template applied");

  console.log("Exercise 10: Detect Conflicts");
  const conflicts = detectMetadataConflicts({
    root: { robots: { index: false, follow: true } },
    page: { title: "Content Page", description: "Has content" },
  });
  assert(conflicts.some(c => c.includes("noindex")), "noindex conflict");

  console.log("Exercise 11: Batch Metadata");
  const batch = generateBatchMetadata(["hello", "missing"], fetcher, "https://a.com");
  assert(batch.size === 2 && batch.get("hello")?.title === "Hello World", "batch");

  console.log("Exercise 12: Serialize to Head");
  const tags = serializeMetadataToHead({ title: "T", description: "D", robots: { index: true, follow: true }, alternates: { canonical: "https://a.com" } });
  assert(tags.some(t => t.includes("<title>T</title>")), "title tag");
  assert(tags.some(t => t.includes('rel="canonical"')), "canonical tag");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
