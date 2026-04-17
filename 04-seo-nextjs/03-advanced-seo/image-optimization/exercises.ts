// ============================================================
// Image Optimization — Exercises
// ============================================================
// Run: npx tsx 04-seo-nextjs/03-advanced-seo/image-optimization/exercises.ts
// ============================================================

// --- Types ---

export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  loading?: "lazy" | "eager";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  format?: "jpeg" | "png" | "webp" | "avif";
}

export interface ResponsiveBreakpoint {
  maxWidth: number;    // viewport max-width in px
  imageWidth: string;  // e.g. "100vw", "50vw", "33vw"
}

export interface SrcSetEntry {
  url: string;
  width: number;
}

export interface ImageAuditResult {
  src: string;
  issues: string[];
  score: number; // 0-100
}

export interface ArtDirectionSource {
  media: string;
  srcSet: string;
  type?: string;
}

// ============================================================
// Exercise 1: Generate srcSet String
// ============================================================
// Given a base image URL and an array of widths, generate a srcSet string.
// Pattern: url?w=WIDTH for each width.
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 2: Generate sizes Attribute
// ============================================================
// Given ResponsiveBreakpoint[], generate a sizes attribute string.
// Last entry (no maxWidth constraint) is the default.
export function generateSizes(breakpoints: ResponsiveBreakpoint[]): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 3: Calculate Aspect Ratio
// ============================================================
// Given width and height, return aspect ratio as "W:H" in simplest form.
// E.g. 1200x630 → "40:21", 1920x1080 → "16:9"
export function calculateAspectRatio(width: number, height: number): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 4: Determine Optimal Image Format
// ============================================================
// Given image characteristics, recommend the best format.
// - Has transparency → webp (or avif if supported)
// - Is a photo → avif > webp > jpeg
// - Is a screenshot/text → png or webp lossless
// - Is an icon/logo → svg (return "svg")
export function recommendImageFormat(input: {
  hasTransparency: boolean;
  isPhoto: boolean;
  isIcon: boolean;
  avifSupported: boolean;
}): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 5: Calculate Image File Size Estimate
// ============================================================
// Estimate file size in KB based on dimensions, format, and quality.
// Base: width × height × 3 bytes (RGB) / 1024 (to KB)
// Compression ratios: jpeg 0.1, webp 0.07, avif 0.05, png 0.3
// Quality factor: multiply by (quality / 100)
export function estimateFileSize(
  width: number,
  height: number,
  format: "jpeg" | "webp" | "avif" | "png",
  quality: number
): number {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 6: Build Next.js Image Props
// ============================================================
// Given image data and page context, build the optimal ImageConfig.
export function buildImageProps(input: {
  src: string;
  alt: string;
  width: number;
  height: number;
  isAboveFold: boolean;
  isLCP: boolean;
  hasBlurData: boolean;
}): ImageConfig {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 7: Audit Image for SEO
// ============================================================
// Check image config for SEO issues. Return ImageAuditResult.
// Issues: missing alt, generic alt ("image", "photo"), no dimensions,
// above-fold without priority, large dimensions without responsive sizes,
// wrong format for content type.
export function auditImage(config: ImageConfig & {
  isAboveFold?: boolean;
  fileSize?: number; // KB
}): ImageAuditResult {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 8: Generate Responsive Image HTML
// ============================================================
// Generate a full <img> tag with srcset, sizes, loading, and alt.
export function generateResponsiveImageHTML(config: {
  src: string;
  alt: string;
  widths: number[];
  sizes: string;
  loading: "lazy" | "eager";
  width: number;
  height: number;
}): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 9: Build Art Direction Sources
// ============================================================
// Given breakpoint-specific images, build <picture> source elements.
export function buildArtDirectionSources(
  breakpoints: Array<{
    maxWidth: number;
    src: string;
    format?: string;
  }>
): ArtDirectionSource[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 10: Calculate Image Savings
// ============================================================
// Compare file sizes across formats for given dimensions.
export function calculateImageSavings(
  width: number,
  height: number,
  quality: number
): Array<{
  format: string;
  estimatedSize: number;
  savingsVsJpeg: number; // percentage
}> {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 11: Validate Next.js Image Config
// ============================================================
// Check next.config.js image settings for issues.
export function validateImageConfig(config: {
  deviceSizes?: number[];
  imageSizes?: number[];
  formats?: string[];
  remotePatterns?: Array<{ protocol: string; hostname: string }>;
  minimumCacheTTL?: number;
}): string[] {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
// Exercise 12: Generate Image Sitemap Entry
// ============================================================
// Build XML for an image sitemap entry.
export function generateImageSitemapEntry(input: {
  pageUrl: string;
  images: Array<{
    url: string;
    title?: string;
    caption?: string;
    alt?: string;
  }>;
}): string {
  // TODO: Implement
  return undefined as any;
}

// ============================================================
console.log("Image Optimization exercises loaded. Implement the functions above.");
