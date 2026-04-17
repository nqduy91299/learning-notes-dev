// ============================================================
// Open Graph & Social Sharing — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/01-seo-fundamentals/open-graph/solutions.ts
// ============================================================

import type {
  OGImage,
  OpenGraphData,
  TwitterCardData,
  SocialMetaTag,
  OGValidationError,
  NextSocialMetadata,
} from "./exercises.js";

// Exercise 1
function generateOGTags(data: OpenGraphData): SocialMetaTag[] {
  const tags: SocialMetaTag[] = [
    { property: "og:title", content: data.title },
    { property: "og:description", content: data.description },
    { property: "og:url", content: data.url },
  ];
  if (data.siteName) tags.push({ property: "og:site_name", content: data.siteName });
  if (data.type) tags.push({ property: "og:type", content: data.type });
  if (data.locale) tags.push({ property: "og:locale", content: data.locale });
  if (data.images) {
    for (const img of data.images) {
      tags.push({ property: "og:image", content: img.url });
      tags.push({ property: "og:image:width", content: String(img.width) });
      tags.push({ property: "og:image:height", content: String(img.height) });
      tags.push({ property: "og:image:alt", content: img.alt });
    }
  }
  if (data.article) {
    if (data.article.publishedTime)
      tags.push({ property: "article:published_time", content: data.article.publishedTime });
    if (data.article.modifiedTime)
      tags.push({ property: "article:modified_time", content: data.article.modifiedTime });
    if (data.article.authors) {
      for (const a of data.article.authors)
        tags.push({ property: "article:author", content: a });
    }
    if (data.article.tags) {
      for (const t of data.article.tags)
        tags.push({ property: "article:tag", content: t });
    }
  }
  return tags;
}

// Exercise 2
function generateTwitterTags(data: TwitterCardData): SocialMetaTag[] {
  const tags: SocialMetaTag[] = [{ name: "twitter:card", content: data.card }];
  if (data.site) tags.push({ name: "twitter:site", content: data.site });
  if (data.creator) tags.push({ name: "twitter:creator", content: data.creator });
  if (data.title) tags.push({ name: "twitter:title", content: data.title });
  if (data.description) tags.push({ name: "twitter:description", content: data.description });
  if (data.image) tags.push({ name: "twitter:image", content: data.image });
  if (data.imageAlt) tags.push({ name: "twitter:image:alt", content: data.imageAlt });
  return tags;
}

// Exercise 3
function validateOGData(data: OpenGraphData): OGValidationError[] {
  const errors: OGValidationError[] = [];
  if (!data.title) errors.push({ field: "title", message: "title is required" });
  else if (data.title.length > 70) errors.push({ field: "title", message: "title should be under 70 characters" });
  if (!data.description) errors.push({ field: "description", message: "description is required" });
  else if (data.description.length > 200) errors.push({ field: "description", message: "description should be under 200 characters" });
  if (!data.url) errors.push({ field: "url", message: "url is required" });
  else {
    try { new URL(data.url); } catch { errors.push({ field: "url", message: "url must be absolute" }); }
  }
  if (data.images) {
    for (const img of data.images) {
      try { new URL(img.url); } catch { errors.push({ field: "image", message: "image url must be absolute" }); }
      if (img.width < 200 || img.height < 200) errors.push({ field: "image", message: "image must be at least 200x200 pixels" });
    }
  }
  return errors;
}

// Exercise 4
function buildSocialTags(og: OpenGraphData, twitter?: TwitterCardData): SocialMetaTag[] {
  const ogTags = generateOGTags(og);
  if (twitter) return [...ogTags, ...generateTwitterTags(twitter)];
  const fallbackTwitter: SocialMetaTag[] = [
    { name: "twitter:card", content: og.images?.[0] && og.images[0].width >= 600 ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: og.title },
    { name: "twitter:description", content: og.description },
  ];
  if (og.images?.[0]) fallbackTwitter.push({ name: "twitter:image", content: og.images[0].url });
  return [...ogTags, ...fallbackTwitter];
}

// Exercise 5
function renderSocialTagsHTML(tags: SocialMetaTag[]): string {
  return tags.map((t) => {
    if (t.property) return `<meta property="${t.property}" content="${t.content}" />`;
    return `<meta name="${t.name}" content="${t.content}" />`;
  }).join("\n");
}

// Exercise 6
function buildArticleOG(input: {
  title: string; description: string; url: string; imageUrl: string;
  author: string; publishedDate: string; tags: string[];
}): OpenGraphData {
  return {
    title: input.title,
    description: input.description,
    url: input.url,
    type: "article",
    images: [{ url: input.imageUrl, width: 1200, height: 630, alt: input.title }],
    article: {
      publishedTime: input.publishedDate,
      authors: [input.author],
      tags: input.tags,
    },
  };
}

// Exercise 7
function determineTwitterCardType(image?: OGImage): "summary" | "summary_large_image" {
  if (!image) return "summary";
  const ratio = image.width / image.height;
  return image.width >= 600 && ratio > 1.5 ? "summary_large_image" : "summary";
}

// Exercise 8
function buildNextSocialMetadata(input: {
  title: string; description: string; url: string; siteName: string;
  imageUrl: string; locale?: string; twitterSite?: string;
}): NextSocialMetadata {
  return {
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.url,
      siteName: input.siteName,
      images: [{ url: input.imageUrl, width: 1200, height: 630, alt: input.title }],
      locale: input.locale ?? "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      ...(input.twitterSite ? { site: input.twitterSite } : {}),
    },
  };
}

// Exercise 9
function extractOGFromHTML(html: string): Partial<OpenGraphData> {
  const result: Partial<OpenGraphData> = {};
  const regex = /<meta\s+property="og:(\w+)"\s+content="([^"]*)"[^>]*\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const [, prop, content] = match;
    if (prop === "title") result.title = content;
    else if (prop === "description") result.description = content;
    else if (prop === "url") result.url = content;
    else if (prop === "type") result.type = content as any;
    else if (prop === "locale") result.locale = content;
  }
  return result;
}

// Exercise 10
function compareSocialPreviews(
  a: OpenGraphData, b: OpenGraphData
): Array<{ field: string; a: string; b: string }> {
  const diffs: Array<{ field: string; a: string; b: string }> = [];
  const fields = ["title", "description", "url", "type"] as const;
  for (const f of fields) {
    const va = (a[f] ?? "") as string;
    const vb = (b[f] ?? "") as string;
    if (va !== vb) diffs.push({ field: f, a: va, b: vb });
  }
  const imgA = a.images?.[0]?.url ?? "";
  const imgB = b.images?.[0]?.url ?? "";
  if (imgA !== imgB) diffs.push({ field: "image", a: imgA, b: imgB });
  return diffs;
}

// Exercise 11
function buildDynamicOGImageURL(baseUrl: string, title: string, theme: "light" | "dark" = "dark"): string {
  return `${baseUrl}/api/og?title=${encodeURIComponent(title)}&theme=${theme}`;
}

// Exercise 12
function validateTwitterHandle(handle: string): { valid: boolean; normalized: string; error?: string } {
  let h = handle.startsWith("@") ? handle : `@${handle}`;
  const username = h.slice(1);
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, normalized: h, error: "Handle contains invalid characters" };
  if (username.length > 15) return { valid: false, normalized: h, error: "Handle exceeds 15 characters" };
  if (username.length === 0) return { valid: false, normalized: h, error: "Handle is empty" };
  return { valid: true, normalized: h };
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  console.log("Exercise 1: Generate OG Tags");
  const og1 = generateOGTags({ title: "Test", description: "Desc", url: "https://a.com", type: "article" });
  assert(og1.some(t => t.property === "og:title" && t.content === "Test"), "has og:title");
  assert(og1.some(t => t.property === "og:type" && t.content === "article"), "has og:type");

  console.log("Exercise 2: Generate Twitter Tags");
  const tw1 = generateTwitterTags({ card: "summary_large_image", site: "@test" });
  assert(tw1.some(t => t.name === "twitter:card"), "has twitter:card");
  assert(tw1.some(t => t.name === "twitter:site" && t.content === "@test"), "has twitter:site");

  console.log("Exercise 3: Validate OG Data");
  const v1 = validateOGData({ title: "", description: "", url: "not-url" } as any);
  assert(v1.some(e => e.message === "title is required"), "title required");
  assert(v1.some(e => e.message === "url must be absolute"), "url absolute");

  console.log("Exercise 4: Build Combined Social Tags");
  const combo = buildSocialTags({ title: "T", description: "D", url: "https://a.com" });
  assert(combo.some(t => t.property === "og:title"), "has OG");
  assert(combo.some(t => t.name === "twitter:card"), "has Twitter fallback");

  console.log("Exercise 5: Render Social Tags to HTML");
  const html = renderSocialTagsHTML([{ property: "og:title", content: "Hi" }]);
  assert(html.includes('property="og:title"'), "rendered property");

  console.log("Exercise 6: Build Article OG");
  const art = buildArticleOG({ title: "Post", description: "D", url: "https://a.com/p", imageUrl: "https://a.com/i.png", author: "Jo", publishedDate: "2024-01-01", tags: ["ts"] });
  assert(art.type === "article" && art.article?.authors?.[0] === "Jo", "article built");

  console.log("Exercise 7: Determine Twitter Card Type");
  assert(determineTwitterCardType({ url: "x", width: 1200, height: 630, alt: "a" }) === "summary_large_image", "large image");
  assert(determineTwitterCardType() === "summary", "no image = summary");

  console.log("Exercise 8: Build Next.js Social Metadata");
  const nm = buildNextSocialMetadata({ title: "T", description: "D", url: "https://a.com", siteName: "S", imageUrl: "https://a.com/i.png" });
  assert(nm.openGraph.locale === "en_US", "default locale");

  console.log("Exercise 9: Extract OG from HTML");
  const ext = extractOGFromHTML('<meta property="og:title" content="Hello" /><meta property="og:url" content="https://a.com" />');
  assert(ext.title === "Hello" && ext.url === "https://a.com", "extracted");

  console.log("Exercise 10: Compare Social Previews");
  const diff = compareSocialPreviews(
    { title: "A", description: "D", url: "https://a.com" },
    { title: "B", description: "D", url: "https://a.com" }
  );
  assert(diff.length === 1 && diff[0].field === "title", "found diff");

  console.log("Exercise 11: Dynamic OG Image URL");
  const ogUrl = buildDynamicOGImageURL("https://a.com", "Hello World", "light");
  assert(ogUrl === "https://a.com/api/og?title=Hello%20World&theme=light", "url built");

  console.log("Exercise 12: Validate Twitter Handle");
  assert(validateTwitterHandle("myhandle").normalized === "@myhandle", "added @");
  assert(!validateTwitterHandle("inv@lid!").valid, "invalid chars");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
