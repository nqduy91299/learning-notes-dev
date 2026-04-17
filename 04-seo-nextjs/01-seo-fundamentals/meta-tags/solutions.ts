// ============================================================
// Meta Tags — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/01-seo-fundamentals/meta-tags/solutions.ts
// ============================================================

import type {
  MetaTag,
  RobotsDirective,
  PageMetadata,
  TitleTemplate,
  MetadataWithTemplate,
  NextMetadataInput,
  NextMetadataOutput,
} from "./exercises.js";

// Exercise 1
function generateTitleTag(title: string): MetaTag {
  const truncated = title.length > 60 ? title.slice(0, 57) + "..." : title;
  return { tag: "title", content: truncated };
}

// Exercise 2
function generateDescriptionTag(description: string): MetaTag {
  const truncated =
    description.length > 160
      ? description.slice(0, 157) + "..."
      : description;
  return {
    tag: "meta",
    attributes: { name: "description", content: truncated },
  };
}

// Exercise 3
function generateRobotsTag(directive: RobotsDirective): MetaTag {
  const parts: string[] = [];
  parts.push(directive.index ? "index" : "noindex");
  parts.push(directive.follow ? "follow" : "nofollow");
  if (directive.noarchive) parts.push("noarchive");
  if (directive.nosnippet) parts.push("nosnippet");
  if (directive.maxSnippet !== undefined)
    parts.push(`max-snippet:${directive.maxSnippet}`);
  if (directive.maxImagePreview)
    parts.push(`max-image-preview:${directive.maxImagePreview}`);
  return {
    tag: "meta",
    attributes: { name: "robots", content: parts.join(", ") },
  };
}

// Exercise 4
function generateCanonicalTag(url: string): MetaTag {
  const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "fbclid"];
  const parsed = new URL(url);
  trackingParams.forEach((p) => parsed.searchParams.delete(p));
  let normalized = parsed.toString().toLowerCase();
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return {
    tag: "link",
    attributes: { rel: "canonical", href: normalized },
  };
}

// Exercise 5
function generateHeadTags(meta: PageMetadata): MetaTag[] {
  const tags: MetaTag[] = [];
  tags.push(generateTitleTag(meta.title));
  tags.push(generateDescriptionTag(meta.description));
  tags.push({
    tag: "meta",
    attributes: {
      name: "viewport",
      content: meta.viewport ?? "width=device-width, initial-scale=1",
    },
  });
  if (meta.canonical) {
    tags.push(generateCanonicalTag(meta.canonical));
  }
  if (meta.robots) {
    tags.push(generateRobotsTag(meta.robots));
  }
  return tags;
}

// Exercise 6
function resolveTitleTemplate(
  template: TitleTemplate,
  childTitle?: string
): string {
  const title = childTitle ?? template.default;
  return template.template.replace("%s", title);
}

// Exercise 7
function mergeMetadata(
  parent: MetadataWithTemplate,
  child: MetadataWithTemplate
): MetadataWithTemplate {
  const result: MetadataWithTemplate = { ...parent };

  if (child.description !== undefined) result.description = child.description;
  if (child.canonical !== undefined) result.canonical = child.canonical;

  // Title: resolve with template if parent has template
  if (typeof parent.title === "object" && parent.title !== null) {
    const template = parent.title as TitleTemplate;
    const childStr =
      typeof child.title === "string" ? child.title : undefined;
    result.title = resolveTitleTemplate(template, childStr);
  } else if (child.title !== undefined) {
    result.title = child.title;
  }

  // Robots: merge individually
  if (child.robots) {
    result.robots = { ...(parent.robots ?? { index: true, follow: true }), ...child.robots };
  }

  return result;
}

// Exercise 8
function parseRobotsDirectives(directives: string[]): RobotsDirective {
  const result: RobotsDirective = { index: true, follow: true };
  for (const d of directives) {
    const trimmed = d.trim().toLowerCase();
    if (trimmed === "noindex") result.index = false;
    if (trimmed === "index") result.index = true;
    if (trimmed === "nofollow") result.follow = false;
    if (trimmed === "follow") result.follow = true;
    if (trimmed === "noarchive") result.noarchive = true;
    if (trimmed === "nosnippet") result.nosnippet = true;
    if (trimmed.startsWith("max-snippet:")) {
      result.maxSnippet = parseInt(trimmed.split(":")[1], 10);
    }
    if (trimmed.startsWith("max-image-preview:")) {
      result.maxImagePreview = trimmed.split(":")[1] as any;
    }
  }
  return result;
}

// Exercise 9
function validateMetadata(meta: PageMetadata): string[] {
  const warnings: string[] = [];
  if (!meta.title) {
    warnings.push("Missing title");
  } else if (meta.title.length > 60) {
    warnings.push(`Title too long (${meta.title.length} chars, max 60)`);
  }
  if (!meta.description) {
    warnings.push("Missing description");
  } else if (meta.description.length > 160) {
    warnings.push(
      `Description too long (${meta.description.length} chars, max 160)`
    );
  }
  if (!meta.canonical) {
    warnings.push("Missing canonical URL");
  } else {
    try {
      new URL(meta.canonical);
    } catch {
      warnings.push("Canonical must be absolute URL");
    }
  }
  return warnings;
}

// Exercise 10
function renderMetaTagsToHTML(tags: MetaTag[]): string {
  return tags
    .map((tag) => {
      if (tag.tag === "title") {
        return `<title>${tag.content ?? ""}</title>`;
      }
      if (tag.tag === "meta") {
        const attrs = Object.entries(tag.attributes ?? {})
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
        return `<meta ${attrs} />`;
      }
      if (tag.tag === "link") {
        const attrs = Object.entries(tag.attributes ?? {})
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ");
        return `<link ${attrs} />`;
      }
      return "";
    })
    .join("\n");
}

// Exercise 11
function buildNextMetadata(input: NextMetadataInput): NextMetadataOutput {
  return {
    title: `${input.pageName} | ${input.siteTitle}`,
    description: input.description,
    alternates: {
      canonical: `${input.baseUrl}/${input.slug}`.replace(/\/+$/, ""),
    },
    robots: { index: true, follow: true },
  };
}

// Exercise 12
function findDuplicateTitles(
  pages: Array<{ url: string; title: string }>
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const page of pages) {
    const existing = groups.get(page.title) ?? [];
    existing.push(page.url);
    groups.set(page.title, existing);
  }
  // Remove groups with only 1 URL
  for (const [title, urls] of groups) {
    if (urls.length < 2) groups.delete(title);
  }
  return groups;
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}`);
      failed++;
    }
  }

  console.log("Exercise 1: Generate Title Tag");
  const t1 = generateTitleTag("Short Title");
  assert(t1.tag === "title" && t1.content === "Short Title", "short title unchanged");
  const t2 = generateTitleTag("A".repeat(65));
  assert(t2.content === "A".repeat(57) + "...", "long title truncated");

  console.log("Exercise 2: Generate Description Tag");
  const d1 = generateDescriptionTag("A short description");
  assert(d1.attributes?.content === "A short description", "short desc unchanged");
  const d2 = generateDescriptionTag("B".repeat(170));
  assert(d2.attributes?.content === "B".repeat(157) + "...", "long desc truncated");

  console.log("Exercise 3: Generate Robots Tag");
  const r1 = generateRobotsTag({ index: true, follow: true });
  assert(r1.attributes?.content === "index, follow", "basic robots");
  const r2 = generateRobotsTag({ index: false, follow: true, noarchive: true });
  assert(r2.attributes?.content === "noindex, follow, noarchive", "noindex + noarchive");

  console.log("Exercise 4: Generate Canonical Tag");
  const c1 = generateCanonicalTag("https://Example.com/Page/?utm_source=twitter");
  assert(c1.attributes?.href === "https://example.com/page", "tracking params removed, lowercased");
  const c2 = generateCanonicalTag("https://example.com/blog/post/");
  assert(c2.attributes?.href === "https://example.com/blog/post", "trailing slash removed");

  console.log("Exercise 5: Generate Head Tags");
  const h1 = generateHeadTags({
    title: "Test",
    description: "Test desc",
    canonical: "https://example.com/test",
    robots: { index: true, follow: false },
  });
  assert(h1.length === 5, "5 tags generated (title, desc, viewport, canonical, robots)");

  console.log("Exercise 6: Resolve Title Template");
  const tmpl: TitleTemplate = { template: "%s | My Site", default: "Home" };
  assert(resolveTitleTemplate(tmpl, "Blog") === "Blog | My Site", "with child");
  assert(resolveTitleTemplate(tmpl) === "Home | My Site", "uses default");

  console.log("Exercise 7: Merge Metadata");
  const merged = mergeMetadata(
    { title: { template: "%s | Site", default: "Home" }, description: "Parent desc" },
    { title: "Blog", description: "Child desc" }
  );
  assert(merged.title === "Blog | Site", "title resolved with template");
  assert(merged.description === "Child desc", "description overridden");

  console.log("Exercise 8: Parse Robots Directives");
  const p1 = parseRobotsDirectives(["noindex", "follow", "noarchive"]);
  assert(!p1.index && p1.follow && p1.noarchive === true, "parsed correctly");

  console.log("Exercise 9: Validate Metadata");
  const v1 = validateMetadata({ title: "", description: "", canonical: "not-a-url" } as any);
  assert(v1.includes("Missing title"), "detects missing title");
  assert(v1.includes("Missing description"), "detects missing description");
  assert(v1.includes("Canonical must be absolute URL"), "detects bad canonical");

  console.log("Exercise 10: Render Meta Tags to HTML");
  const html = renderMetaTagsToHTML([
    { tag: "title", content: "Test" },
    { tag: "meta", attributes: { name: "description", content: "Desc" } },
  ]);
  assert(html.includes("<title>Test</title>"), "title rendered");
  assert(html.includes('<meta name="description" content="Desc" />'), "meta rendered");

  console.log("Exercise 11: Build Next.js Metadata");
  const nm = buildNextMetadata({
    pageName: "About",
    siteTitle: "MySite",
    description: "About page",
    slug: "about",
    baseUrl: "https://mysite.com",
  });
  assert(nm.title === "About | MySite", "title formatted");
  assert(nm.alternates.canonical === "https://mysite.com/about", "canonical built");

  console.log("Exercise 12: Find Duplicate Titles");
  const dupes = findDuplicateTitles([
    { url: "/a", title: "Home" },
    { url: "/b", title: "Home" },
    { url: "/c", title: "About" },
  ]);
  assert(dupes.size === 1 && dupes.get("Home")?.length === 2, "found duplicates");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
