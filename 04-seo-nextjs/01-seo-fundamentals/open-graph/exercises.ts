// ============================================================
// Open Graph & Social Sharing — Exercises
// ============================================================
// Run: npx tsx 04-seo-nextjs/01-seo-fundamentals/open-graph/exercises.ts
// ============================================================

// --- Types ---

export interface OGImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string; // "image/png", "image/jpeg", etc.
}

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  siteName?: string;
  type?: "website" | "article" | "profile" | "product";
  locale?: string;
  images?: OGImage[];
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
  };
}

export interface TwitterCardData {
  card: "summary" | "summary_large_image" | "player" | "app";
  site?: string;     // @username
  creator?: string;  // @username
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

export interface SocialMetaTag {
  property?: string;  // for OG tags
  name?: string;      // for Twitter tags
  content: string;
}

export interface OGValidationError {
  field: string;
  message: string;
}

// ============================================================
// Exercise 1: Generate OG Meta Tags
// ============================================================
// Convert an OpenGraphData object into an array of SocialMetaTag.
// Map each field to the appropriate og: property.
// For images, generate og:image, og:image:width, og:image:height, og:image:alt.
export function generateOGTags(data: OpenGraphData): SocialMetaTag[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 2: Generate Twitter Card Tags
// ============================================================
// Convert TwitterCardData into an array of SocialMetaTag.
// Use name attribute (not property) for Twitter tags.
export function generateTwitterTags(data: TwitterCardData): SocialMetaTag[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 3: Validate OG Data
// ============================================================
// Return an array of OGValidationError for issues:
// - title missing or empty → "title is required"
// - title > 70 chars → "title should be under 70 characters"
// - description missing → "description is required"
// - description > 200 chars → "description should be under 200 characters"
// - url missing → "url is required"
// - url not absolute → "url must be absolute"
// - images with relative URLs → "image url must be absolute"
// - images < 200x200 → "image must be at least 200x200 pixels"
export function validateOGData(data: OpenGraphData): OGValidationError[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 4: Build Combined Social Tags
// ============================================================
// Given OpenGraphData and optional TwitterCardData, generate a complete
// set of social meta tags. If Twitter data is not provided, generate
// minimal Twitter tags using OG data as fallback (card + title + description + image).
export function buildSocialTags(
  og: OpenGraphData,
  twitter?: TwitterCardData
): SocialMetaTag[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 5: Render Social Tags to HTML
// ============================================================
// Convert SocialMetaTag[] to HTML string.
// OG tags: <meta property="og:title" content="..." />
// Twitter tags: <meta name="twitter:card" content="..." />
export function renderSocialTagsHTML(tags: SocialMetaTag[]): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 6: Build Article OG Data
// ============================================================
// Shortcut builder for article type OG data.
// Input: title, description, url, imageUrl, author, publishedDate, tags[]
// Returns complete OpenGraphData with type "article" and article metadata.
export function buildArticleOG(input: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  author: string;
  publishedDate: string;
  tags: string[];
}): OpenGraphData {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 7: Determine Twitter Card Type
// ============================================================
// Given an OGImage (or undefined), determine the appropriate Twitter card type.
// - No image → "summary"
// - Image width >= 600 and aspect ratio > 1.5:1 → "summary_large_image"
// - Otherwise → "summary"
export function determineTwitterCardType(
  image?: OGImage
): "summary" | "summary_large_image" {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 8: Build Next.js Social Metadata Object
// ============================================================
// Given page data, return an object matching Next.js Metadata shape
// for openGraph and twitter fields.
export interface NextSocialMetadata {
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: Array<{ url: string; width: number; height: number; alt: string }>;
    locale: string;
    type: string;
  };
  twitter: {
    card: string;
    site?: string;
    creator?: string;
  };
}

export function buildNextSocialMetadata(input: {
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageUrl: string;
  locale?: string;
  twitterSite?: string;
}): NextSocialMetadata {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 9: Extract OG Data from HTML
// ============================================================
// Parse a raw HTML string and extract OG data.
// Use regex to find <meta property="og:..." content="..." /> tags.
// Return a partial OpenGraphData with whatever fields are found.
export function extractOGFromHTML(html: string): Partial<OpenGraphData> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 10: Compare Social Previews
// ============================================================
// Given two OpenGraphData objects, return a list of differences.
// Compare title, description, url, type, and first image url.
// Return: Array<{ field: string; a: string; b: string }>
export function compareSocialPreviews(
  a: OpenGraphData,
  b: OpenGraphData
): Array<{ field: string; a: string; b: string }> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 11: Generate OG Image URL with Text Overlay
// ============================================================
// Build a dynamic OG image URL (like Vercel OG or Cloudinary).
// Pattern: `${baseUrl}/api/og?title=${encodeURIComponent(title)}&theme=${theme}`
// Input: baseUrl, title, optional theme ("light" | "dark", default "dark")
// Returns the URL string.
export function buildDynamicOGImageURL(
  baseUrl: string,
  title: string,
  theme?: "light" | "dark"
): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 12: Validate Twitter Handle
// ============================================================
// Validate and normalize a Twitter handle.
// - Must start with @ (add if missing)
// - Only alphanumeric and underscore after @
// - Max 15 chars after @
// Return { valid: boolean; normalized: string; error?: string }
export function validateTwitterHandle(
  handle: string
): { valid: boolean; normalized: string; error?: string } {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
console.log("Open Graph exercises loaded. Implement the functions above.");
