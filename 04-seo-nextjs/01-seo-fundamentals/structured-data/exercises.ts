// ============================================================
// Structured Data (JSON-LD) — Exercises
// ============================================================
// Run: npx tsx 04-seo-nextjs/01-seo-fundamentals/structured-data/exercises.ts
// ============================================================

// --- Types ---

export interface JsonLdBase {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

export interface ArticleSchema extends JsonLdBase {
  "@type": "Article";
  headline: string;
  description?: string;
  image?: string;
  author: { "@type": "Person"; name: string; url?: string };
  publisher?: { "@type": "Organization"; name: string; logo?: { "@type": "ImageObject"; url: string } };
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: { "@type": "WebPage"; "@id": string };
}

export interface ProductSchema extends JsonLdBase {
  "@type": "Product";
  name: string;
  description?: string;
  image?: string;
  brand?: { "@type": "Brand"; name: string };
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
  };
}

export interface FAQSchema extends JsonLdBase {
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface BreadcrumbSchema extends JsonLdBase {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface OrganizationSchema extends JsonLdBase {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

export interface SchemaValidationError {
  path: string;
  message: string;
}

// ============================================================
// Exercise 1: Build Article JSON-LD
// ============================================================
// Given article data, return a complete ArticleSchema object.
export function buildArticleSchema(input: {
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  authorUrl: string;
  publisherName: string;
  publisherLogo: string;
  publishedDate: string;
  modifiedDate: string;
  pageUrl: string;
}): ArticleSchema {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 2: Build Product JSON-LD
// ============================================================
export function buildProductSchema(input: {
  name: string;
  description: string;
  imageUrl: string;
  brand: string;
  price: number;
  currency: string;
  inStock: boolean;
  url: string;
  rating?: number;
  reviewCount?: number;
}): ProductSchema {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 3: Build FAQ JSON-LD
// ============================================================
// Given an array of { question, answer } pairs, build FAQSchema.
export function buildFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): FAQSchema {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 4: Build BreadcrumbList JSON-LD
// ============================================================
// Given an array of { name, url } crumbs, build BreadcrumbSchema.
// The last item should NOT have an item/url (it's the current page).
export function buildBreadcrumbSchema(
  crumbs: Array<{ name: string; url: string }>
): BreadcrumbSchema {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 5: Build Organization JSON-LD
// ============================================================
export function buildOrganizationSchema(input: {
  name: string;
  url: string;
  logoUrl: string;
  socialProfiles: string[];
}): OrganizationSchema {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 6: Render JSON-LD Script Tag
// ============================================================
// Convert any JsonLdBase object to an HTML <script> tag string.
// Must be: <script type="application/ld+json">...JSON...</script>
export function renderJsonLdScript(schema: JsonLdBase): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 7: Validate Article Schema
// ============================================================
// Check for required fields and return SchemaValidationError[].
// Required: headline (non-empty, max 110 chars), author.name, datePublished (ISO format).
// datePublished must match ISO 8601 pattern.
export function validateArticleSchema(schema: ArticleSchema): SchemaValidationError[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 8: Merge Multiple Schemas
// ============================================================
// Given multiple JsonLdBase objects, combine them into a JSON-LD
// array format: { "@context": "https://schema.org", "@graph": [...] }
export function mergeSchemas(schemas: JsonLdBase[]): {
  "@context": "https://schema.org";
  "@graph": Array<Omit<JsonLdBase, "@context">>;
} {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 9: Extract Schema Type from JSON-LD String
// ============================================================
// Given a JSON string (the contents of a script tag), parse it and
// return the @type value(s). Handle both single schema and @graph arrays.
export function extractSchemaTypes(jsonString: string): string[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 10: Build WebSite Schema with Search Action
// ============================================================
// Build a WebSite schema with a SearchAction for sitelinks search box.
export function buildWebSiteSchema(input: {
  name: string;
  url: string;
  searchUrlTemplate: string; // e.g. "https://example.com/search?q={search_term_string}"
}): JsonLdBase {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 11: Generate Multiple Schemas for a Blog Post Page
// ============================================================
// A blog post page typically needs: Article + BreadcrumbList + Organization.
// Return all three as an array of JsonLdBase.
export function generateBlogPostSchemas(input: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  authorName: string;
  publishedDate: string;
  orgName: string;
  orgUrl: string;
  orgLogo: string;
  breadcrumbs: Array<{ name: string; url: string }>;
}): JsonLdBase[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 12: Validate Any Schema Has Required @context and @type
// ============================================================
// Generic validator: check that any object has @context = "https://schema.org"
// and a non-empty @type string. Return boolean.
export function isValidSchemaBase(obj: unknown): boolean {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
console.log("Structured Data exercises loaded. Implement the functions above.");
