// ============================================================
// Structured Data (JSON-LD) — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/01-seo-fundamentals/structured-data/solutions.ts
// ============================================================

import type {
  JsonLdBase, ArticleSchema, ProductSchema, FAQSchema,
  BreadcrumbSchema, OrganizationSchema, SchemaValidationError,
} from "./exercises.js";

// Exercise 1
function buildArticleSchema(input: {
  title: string; description: string; imageUrl: string; authorName: string;
  authorUrl: string; publisherName: string; publisherLogo: string;
  publishedDate: string; modifiedDate: string; pageUrl: string;
}): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    author: { "@type": "Person", name: input.authorName, url: input.authorUrl },
    publisher: { "@type": "Organization", name: input.publisherName, logo: { "@type": "ImageObject", url: input.publisherLogo } },
    datePublished: input.publishedDate,
    dateModified: input.modifiedDate,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.pageUrl },
  };
}

// Exercise 2
function buildProductSchema(input: {
  name: string; description: string; imageUrl: string; brand: string;
  price: number; currency: string; inStock: boolean; url: string;
  rating?: number; reviewCount?: number;
}): ProductSchema {
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: input.imageUrl,
    brand: { "@type": "Brand", name: input.brand },
    offers: {
      "@type": "Offer",
      price: input.price.toFixed(2),
      priceCurrency: input.currency,
      availability: input.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: input.url,
    },
  };
  if (input.rating !== undefined && input.reviewCount !== undefined) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(input.rating),
      reviewCount: String(input.reviewCount),
    };
  }
  return schema;
}

// Exercise 3
function buildFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question" as const,
      name: f.question,
      acceptedAnswer: { "@type": "Answer" as const, text: f.answer },
    })),
  };
}

// Exercise 4
function buildBreadcrumbSchema(crumbs: Array<{ name: string; url: string }>): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => {
      const item: any = { "@type": "ListItem", position: i + 1, name: c.name };
      if (i < crumbs.length - 1) item.item = c.url;
      return item;
    }),
  };
}

// Exercise 5
function buildOrganizationSchema(input: {
  name: string; url: string; logoUrl: string; socialProfiles: string[];
}): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url,
    logo: input.logoUrl,
    sameAs: input.socialProfiles,
  };
}

// Exercise 6
function renderJsonLdScript(schema: JsonLdBase): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// Exercise 7
function validateArticleSchema(schema: ArticleSchema): SchemaValidationError[] {
  const errors: SchemaValidationError[] = [];
  if (!schema.headline) errors.push({ path: "headline", message: "headline is required" });
  else if (schema.headline.length > 110) errors.push({ path: "headline", message: "headline must be 110 characters or less" });
  if (!schema.author?.name) errors.push({ path: "author.name", message: "author name is required" });
  if (!schema.datePublished) errors.push({ path: "datePublished", message: "datePublished is required" });
  else if (!/^\d{4}-\d{2}-\d{2}/.test(schema.datePublished)) errors.push({ path: "datePublished", message: "datePublished must be ISO 8601 format" });
  return errors;
}

// Exercise 8
function mergeSchemas(schemas: JsonLdBase[]): {
  "@context": "https://schema.org";
  "@graph": Array<Omit<JsonLdBase, "@context">>;
} {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map(({ "@context": _, ...rest }) => rest),
  };
}

// Exercise 9
function extractSchemaTypes(jsonString: string): string[] {
  const parsed = JSON.parse(jsonString);
  if (parsed["@graph"]) {
    return parsed["@graph"].map((s: any) => s["@type"]);
  }
  if (Array.isArray(parsed)) {
    return parsed.map((s: any) => s["@type"]);
  }
  return [parsed["@type"]];
}

// Exercise 10
function buildWebSiteSchema(input: { name: string; url: string; searchUrlTemplate: string }): JsonLdBase {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: input.searchUrlTemplate },
      "query-input": "required name=search_term_string",
    },
  };
}

// Exercise 11
function generateBlogPostSchemas(input: {
  title: string; description: string; url: string; imageUrl: string;
  authorName: string; publishedDate: string; orgName: string;
  orgUrl: string; orgLogo: string; breadcrumbs: Array<{ name: string; url: string }>;
}): JsonLdBase[] {
  const article: ArticleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    author: { "@type": "Person", name: input.authorName },
    datePublished: input.publishedDate,
    publisher: { "@type": "Organization", name: input.orgName, logo: { "@type": "ImageObject", url: input.orgLogo } },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
  const breadcrumb = buildBreadcrumbSchema(input.breadcrumbs);
  const org = buildOrganizationSchema({ name: input.orgName, url: input.orgUrl, logoUrl: input.orgLogo, socialProfiles: [] });
  return [article, breadcrumb, org];
}

// Exercise 12
function isValidSchemaBase(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return o["@context"] === "https://schema.org" && typeof o["@type"] === "string" && o["@type"].length > 0;
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  console.log("Exercise 1: Article Schema");
  const a1 = buildArticleSchema({ title: "Test", description: "D", imageUrl: "https://a.com/i.png", authorName: "Jo", authorUrl: "https://a.com/jo", publisherName: "Pub", publisherLogo: "https://a.com/logo.png", publishedDate: "2024-01-01", modifiedDate: "2024-02-01", pageUrl: "https://a.com/test" });
  assert(a1["@type"] === "Article" && a1.headline === "Test", "article built");

  console.log("Exercise 2: Product Schema");
  const p1 = buildProductSchema({ name: "Widget", description: "D", imageUrl: "https://a.com/i.png", brand: "B", price: 29.99, currency: "USD", inStock: true, url: "https://a.com/widget", rating: 4.5, reviewCount: 100 });
  assert(p1.offers.price === "29.99" && p1.aggregateRating?.ratingValue === "4.5", "product built");

  console.log("Exercise 3: FAQ Schema");
  const f1 = buildFAQSchema([{ question: "Q1?", answer: "A1" }]);
  assert(f1["@type"] === "FAQPage" && f1.mainEntity.length === 1, "faq built");

  console.log("Exercise 4: Breadcrumb Schema");
  const b1 = buildBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }, { name: "Post", url: "/blog/post" }]);
  assert(b1.itemListElement.length === 3, "3 items");
  assert(b1.itemListElement[2].item === undefined, "last has no item");

  console.log("Exercise 5: Organization Schema");
  const o1 = buildOrganizationSchema({ name: "Org", url: "https://a.com", logoUrl: "https://a.com/logo.png", socialProfiles: ["https://twitter.com/org"] });
  assert(o1.sameAs?.length === 1, "org built");

  console.log("Exercise 6: Render JSON-LD Script");
  const s1 = renderJsonLdScript({ "@context": "https://schema.org", "@type": "Thing" });
  assert(s1.includes('type="application/ld+json"'), "script tag");

  console.log("Exercise 7: Validate Article Schema");
  const v1 = validateArticleSchema({ "@context": "https://schema.org", "@type": "Article", headline: "", author: { "@type": "Person", name: "" }, datePublished: "bad" } as any);
  assert(v1.length >= 2, "found errors");

  console.log("Exercise 8: Merge Schemas");
  const m1 = mergeSchemas([
    { "@context": "https://schema.org", "@type": "Article" },
    { "@context": "https://schema.org", "@type": "Organization" },
  ]);
  assert(m1["@graph"].length === 2, "merged");

  console.log("Exercise 9: Extract Schema Types");
  const types = extractSchemaTypes(JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Article" }, { "@type": "Organization" }] }));
  assert(types.length === 2 && types[0] === "Article", "types extracted");

  console.log("Exercise 10: WebSite Schema");
  const ws = buildWebSiteSchema({ name: "Site", url: "https://a.com", searchUrlTemplate: "https://a.com/search?q={search_term_string}" });
  assert(ws["@type"] === "WebSite", "website schema");

  console.log("Exercise 11: Blog Post Schemas");
  const bp = generateBlogPostSchemas({ title: "T", description: "D", url: "https://a.com/p", imageUrl: "https://a.com/i.png", authorName: "Jo", publishedDate: "2024-01-01", orgName: "Org", orgUrl: "https://a.com", orgLogo: "https://a.com/l.png", breadcrumbs: [{ name: "Home", url: "/" }, { name: "Post", url: "/p" }] });
  assert(bp.length === 3, "3 schemas");

  console.log("Exercise 12: Validate Schema Base");
  assert(isValidSchemaBase({ "@context": "https://schema.org", "@type": "Thing" }), "valid");
  assert(!isValidSchemaBase({ "@type": "Thing" }), "missing context");
  assert(!isValidSchemaBase(null), "null invalid");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
