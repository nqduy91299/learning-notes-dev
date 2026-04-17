// ============================================================
// Image Optimization — Solutions
// ============================================================
// Run: npx tsx 04-seo-nextjs/03-advanced-seo/image-optimization/solutions.ts
// ============================================================

import type {
  ImageConfig, ResponsiveBreakpoint, SrcSetEntry,
  ImageAuditResult, ArtDirectionSource,
} from "./exercises.js";

// Exercise 1
function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths.map(w => `${baseUrl}?w=${w} ${w}w`).join(", ");
}

// Exercise 2
function generateSizes(breakpoints: ResponsiveBreakpoint[]): string {
  const parts = breakpoints.slice(0, -1).map(bp => `(max-width: ${bp.maxWidth}px) ${bp.imageWidth}`);
  parts.push(breakpoints[breakpoints.length - 1].imageWidth);
  return parts.join(", ");
}

// Exercise 3
function calculateAspectRatio(width: number, height: number): string {
  function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
  const g = gcd(width, height);
  return `${width / g}:${height / g}`;
}

// Exercise 4
function recommendImageFormat(input: { hasTransparency: boolean; isPhoto: boolean; isIcon: boolean; avifSupported: boolean }): string {
  if (input.isIcon) return "svg";
  if (input.hasTransparency) return input.avifSupported ? "avif" : "webp";
  if (input.isPhoto) return input.avifSupported ? "avif" : "webp";
  return "webp";
}

// Exercise 5
function estimateFileSize(width: number, height: number, format: "jpeg" | "webp" | "avif" | "png", quality: number): number {
  const ratios: Record<string, number> = { jpeg: 0.1, webp: 0.07, avif: 0.05, png: 0.3 };
  const raw = (width * height * 3) / 1024;
  return Math.round(raw * ratios[format] * (quality / 100));
}

// Exercise 6
function buildImageProps(input: { src: string; alt: string; width: number; height: number; isAboveFold: boolean; isLCP: boolean; hasBlurData: boolean }): ImageConfig {
  const config: ImageConfig = {
    src: input.src,
    alt: input.alt,
    width: input.width,
    height: input.height,
  };
  if (input.isLCP || input.isAboveFold) {
    config.priority = true;
    config.loading = "eager";
  } else {
    config.loading = "lazy";
  }
  if (input.hasBlurData) {
    config.placeholder = "blur";
  }
  if (input.width > 1000) {
    config.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }
  return config;
}

// Exercise 7
function auditImage(config: ImageConfig & { isAboveFold?: boolean; fileSize?: number }): ImageAuditResult {
  const issues: string[] = [];
  if (!config.alt) issues.push("Missing alt text");
  else if (["image", "photo", "picture", "img"].includes(config.alt.toLowerCase())) issues.push("Generic alt text");
  if (!config.width || !config.height) issues.push("Missing dimensions (causes CLS)");
  if (config.isAboveFold && !config.priority) issues.push("Above-fold image without priority prop");
  if (config.width > 1200 && !config.sizes) issues.push("Large image without responsive sizes");
  if (config.fileSize && config.fileSize > 500) issues.push(`File size too large: ${config.fileSize}KB`);
  const score = Math.max(0, 100 - issues.length * 20);
  return { src: config.src, issues, score };
}

// Exercise 8
function generateResponsiveImageHTML(config: { src: string; alt: string; widths: number[]; sizes: string; loading: "lazy" | "eager"; width: number; height: number }): string {
  const srcset = generateSrcSet(config.src, config.widths);
  return `<img src="${config.src}" alt="${config.alt}" srcset="${srcset}" sizes="${config.sizes}" loading="${config.loading}" width="${config.width}" height="${config.height}" />`;
}

// Exercise 9
function buildArtDirectionSources(breakpoints: Array<{ maxWidth: number; src: string; format?: string }>): ArtDirectionSource[] {
  return breakpoints.map(bp => {
    const source: ArtDirectionSource = {
      media: `(max-width: ${bp.maxWidth}px)`,
      srcSet: bp.src,
    };
    if (bp.format) source.type = `image/${bp.format}`;
    return source;
  });
}

// Exercise 10
function calculateImageSavings(width: number, height: number, quality: number) {
  const formats = ["jpeg", "webp", "avif", "png"] as const;
  const jpegSize = estimateFileSize(width, height, "jpeg", quality);
  return formats.map(f => {
    const size = estimateFileSize(width, height, f, quality);
    return {
      format: f,
      estimatedSize: size,
      savingsVsJpeg: f === "jpeg" ? 0 : Math.round((1 - size / jpegSize) * 100),
    };
  });
}

// Exercise 11
function validateImageConfig(config: {
  deviceSizes?: number[]; imageSizes?: number[]; formats?: string[];
  remotePatterns?: Array<{ protocol: string; hostname: string }>; minimumCacheTTL?: number;
}): string[] {
  const issues: string[] = [];
  if (config.deviceSizes) {
    const sorted = [...config.deviceSizes].sort((a, b) => a - b);
    if (JSON.stringify(sorted) !== JSON.stringify(config.deviceSizes)) issues.push("deviceSizes should be sorted ascending");
    if (config.deviceSizes.some(s => s < 1)) issues.push("deviceSizes must be positive");
  }
  if (config.imageSizes) {
    if (config.imageSizes.some(s => s < 1)) issues.push("imageSizes must be positive");
  }
  if (config.formats) {
    const valid = ["image/avif", "image/webp"];
    for (const f of config.formats) {
      if (!valid.includes(f)) issues.push(`Invalid format: ${f}. Use ${valid.join(" or ")}`);
    }
  }
  if (config.remotePatterns) {
    for (const p of config.remotePatterns) {
      if (p.protocol !== "https") issues.push(`Remote pattern ${p.hostname} should use https`);
    }
  }
  if (config.minimumCacheTTL !== undefined && config.minimumCacheTTL < 60) {
    issues.push("minimumCacheTTL should be at least 60 seconds");
  }
  return issues;
}

// Exercise 12
function generateImageSitemapEntry(input: { pageUrl: string; images: Array<{ url: string; title?: string; caption?: string; alt?: string }> }): string {
  const images = input.images.map(img => {
    let xml = `    <image:image>\n      <image:loc>${img.url}</image:loc>`;
    if (img.title) xml += `\n      <image:title>${img.title}</image:title>`;
    if (img.caption) xml += `\n      <image:caption>${img.caption}</image:caption>`;
    xml += `\n    </image:image>`;
    return xml;
  }).join("\n");
  return `  <url>\n    <loc>${input.pageUrl}</loc>\n${images}\n  </url>`;
}

// ============================================================
// Runner
// ============================================================
function run() {
  let passed = 0, failed = 0;
  function assert(c: boolean, n: string) { if (c) { console.log(`  ✓ ${n}`); passed++; } else { console.log(`  ✗ ${n}`); failed++; } }

  console.log("Exercise 1: Generate srcSet");
  const ss = generateSrcSet("/img.jpg", [640, 1080, 1920]);
  assert(ss.includes("/img.jpg?w=640 640w") && ss.includes("1920w"), "srcset generated");

  console.log("Exercise 2: Generate sizes");
  const sizes = generateSizes([
    { maxWidth: 768, imageWidth: "100vw" },
    { maxWidth: 1200, imageWidth: "50vw" },
    { maxWidth: 9999, imageWidth: "33vw" },
  ]);
  assert(sizes.includes("(max-width: 768px) 100vw") && sizes.endsWith("33vw"), "sizes generated");

  console.log("Exercise 3: Aspect Ratio");
  assert(calculateAspectRatio(1920, 1080) === "16:9", "16:9");
  assert(calculateAspectRatio(1200, 630) === "40:21", "40:21");

  console.log("Exercise 4: Recommend Format");
  assert(recommendImageFormat({ hasTransparency: false, isPhoto: true, isIcon: false, avifSupported: true }) === "avif", "avif for photo");
  assert(recommendImageFormat({ hasTransparency: false, isPhoto: false, isIcon: true, avifSupported: true }) === "svg", "svg for icon");

  console.log("Exercise 5: Estimate File Size");
  const size = estimateFileSize(1200, 630, "webp", 80);
  assert(size > 0 && size < estimateFileSize(1200, 630, "jpeg", 80), "webp smaller than jpeg");

  console.log("Exercise 6: Build Image Props");
  const props = buildImageProps({ src: "/hero.jpg", alt: "Hero", width: 1200, height: 630, isAboveFold: true, isLCP: true, hasBlurData: true });
  assert(props.priority === true && props.placeholder === "blur", "LCP props");

  console.log("Exercise 7: Audit Image");
  const audit = auditImage({ src: "/img.jpg", alt: "", width: 0, height: 0, isAboveFold: true });
  assert(audit.issues.length >= 3 && audit.score < 50, "found issues");

  console.log("Exercise 8: Responsive Image HTML");
  const html = generateResponsiveImageHTML({ src: "/img.jpg", alt: "Test", widths: [640, 1200], sizes: "100vw", loading: "lazy", width: 1200, height: 630 });
  assert(html.includes("srcset=") && html.includes('loading="lazy"'), "html generated");

  console.log("Exercise 9: Art Direction Sources");
  const sources = buildArtDirectionSources([{ maxWidth: 768, src: "/mobile.jpg" }]);
  assert(sources.length === 1 && sources[0].media === "(max-width: 768px)", "art direction");

  console.log("Exercise 10: Image Savings");
  const savings = calculateImageSavings(1200, 630, 80);
  assert(savings.find(s => s.format === "avif")!.savingsVsJpeg > 0, "avif saves vs jpeg");

  console.log("Exercise 11: Validate Image Config");
  const configIssues = validateImageConfig({ deviceSizes: [1920, 640], formats: ["image/gif"] });
  assert(configIssues.length >= 2, "found config issues");

  console.log("Exercise 12: Image Sitemap Entry");
  const sitemap = generateImageSitemapEntry({ pageUrl: "https://a.com/p", images: [{ url: "https://a.com/img.jpg", title: "Photo" }] });
  assert(sitemap.includes("image:loc") && sitemap.includes("image:title"), "sitemap entry");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

run();
