# Image Optimization for SEO

## Table of Contents

1. [Introduction](#introduction)
2. [next/image Component](#nextimage-component)
3. [Responsive Images](#responsive-images)
4. [Lazy Loading](#lazy-loading)
5. [Blur Placeholder](#blur-placeholder)
6. [Priority Prop](#priority-prop)
7. [Image Formats](#image-formats)
8. [Image CDN](#image-cdn)
9. [Art Direction](#art-direction)
10. [SEO Impact](#seo-impact)
11. [Best Practices](#best-practices)

---

## Introduction

Images are the largest contributors to page weight on most websites. Unoptimized images directly harm Core Web Vitals (LCP, CLS) and therefore SEO rankings. Modern image optimization involves serving the right format, size, and quality for each device and context.

Next.js provides the `next/image` component that handles optimization automatically.

## next/image Component

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Key Features

| Feature | Description |
|---------|-------------|
| Automatic format | Serves WebP/AVIF when browser supports |
| Responsive sizing | Generates multiple sizes via `srcSet` |
| Lazy loading | Default behavior for non-priority images |
| Blur placeholder | Shows blurred preview while loading |
| Prevents CLS | Requires width/height or fill |
| CDN optimization | On-demand image optimization |

### Required Props

```typescript
interface ImageProps {
  src: string;              // Image source
  alt: string;              // Alt text (required for a11y + SEO)
  width?: number;           // Intrinsic width (required unless fill)
  height?: number;          // Intrinsic height (required unless fill)
  fill?: boolean;           // Fill parent container
}
```

## Responsive Images

### How srcSet Works

The browser selects the appropriate image from `srcSet` based on viewport and device pixel ratio:

```html
<img
  srcset="
    /hero-640.jpg 640w,
    /hero-750.jpg 750w,
    /hero-1080.jpg 1080w,
    /hero-1200.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  src="/hero-1200.jpg"
  alt="Hero"
/>
```

### sizes Attribute

Tells the browser how wide the image will be at different viewport widths:

```
sizes="(max-width: 768px) 100vw,
       (max-width: 1200px) 50vw,
       33vw"
```

| Viewport | Image Width |
|----------|------------|
| ≤ 768px | 100% of viewport |
| ≤ 1200px | 50% of viewport |
| > 1200px | 33% of viewport |

### next/image sizes Prop

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Default srcSet (next/image)

Next.js generates these widths by default:
`640, 750, 828, 1080, 1200, 1920, 2048, 3840`

Customizable in `next.config.js`:

```javascript
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

## Lazy Loading

By default, `next/image` lazy loads images — they're only fetched when approaching the viewport.

```tsx
// Lazy loaded (default)
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />

// NOT lazy loaded — loads immediately
<Image src="/hero.jpg" alt="Hero" width={1200} height={630} priority />
```

### Native Lazy Loading

```html
<img src="/photo.jpg" alt="Photo" loading="lazy" />
```

### Intersection Observer

Next.js uses Intersection Observer under the hood for lazy loading, which is more performant than scroll event listeners.

## Blur Placeholder

Prevents layout shift and provides visual feedback while loading:

### Static Import (Automatic)

```tsx
import heroImage from './hero.jpg';

<Image src={heroImage} alt="Hero" placeholder="blur" />
// blur data URL is generated at build time
```

### Dynamic Images

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

### Generating Blur Data URLs

- Use `plaiceholder` library for build-time generation
- Use a tiny (10x10) base64 image
- CSS blur filter is applied on top

## Priority Prop

The `priority` prop is critical for LCP optimization:

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority    // Preloads this image
/>
```

### When to Use priority

- **Hero images** (above the fold)
- **LCP element** (the largest visible content)
- **Banner images** at top of page

### What priority Does

1. Adds `<link rel="preload">` to `<head>`
2. Disables lazy loading
3. Increases fetch priority
4. Image loads immediately with page

### Rules

- Only use on above-the-fold images
- Only 1-2 images per page should have `priority`
- Never use on below-fold images

## Image Formats

### Format Comparison

| Format | Compression | Transparency | Animation | Browser Support |
|--------|------------|-------------|-----------|----------------|
| JPEG | Lossy | ❌ | ❌ | Universal |
| PNG | Lossless | ✅ | ❌ | Universal |
| WebP | Both | ✅ | ✅ | 97%+ |
| AVIF | Both | ✅ | ✅ | 92%+ |
| SVG | Vector | ✅ | ✅ | Universal |

### Size Savings (vs JPEG)

| Format | Typical Savings |
|--------|----------------|
| WebP | 25-35% smaller |
| AVIF | 40-50% smaller |

### Next.js Format Configuration

```javascript
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],  // Serve AVIF first, WebP fallback
  },
};
```

### When to Use Each Format

| Use Case | Recommended Format |
|----------|-------------------|
| Photos | AVIF > WebP > JPEG |
| Screenshots/text | PNG or WebP (lossless) |
| Icons/logos | SVG |
| Animations | WebP or GIF |
| Transparency needed | WebP or PNG |

## Image CDN

Image CDNs optimize images on-the-fly:

### How They Work

1. Original image uploaded once
2. CDN generates optimized variants on first request
3. Variants cached at edge locations
4. URL parameters control size, format, quality

### Popular Image CDNs

| CDN | Example URL Pattern |
|-----|-------------------|
| Vercel (built-in) | `/_next/image?url=...&w=1200&q=75` |
| Cloudinary | `https://res.cloudinary.com/.../w_1200,q_75/image.jpg` |
| imgix | `https://example.imgix.net/image.jpg?w=1200&q=75` |
| Cloudflare Images | `https://imagedelivery.net/.../w=1200,q=75` |

### Next.js Remote Images

```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/my-account/**',
      },
    ],
  },
};
```

## Art Direction

Art direction serves different image crops for different screen sizes:

```html
<picture>
  <source media="(max-width: 768px)" srcset="/hero-mobile.jpg" />
  <source media="(max-width: 1200px)" srcset="/hero-tablet.jpg" />
  <img src="/hero-desktop.jpg" alt="Hero" />
</picture>
```

### Use Cases

- Different aspect ratios for mobile vs desktop
- Cropped images for smaller screens
- Different compositions per breakpoint

### Limitation in next/image

`next/image` doesn't support `<picture>` element directly. For art direction, use native `<picture>` or CSS-based approaches.

## SEO Impact

### Images and SEO

1. **Alt text**: Describes image for search engines and screen readers
2. **File names**: `typescript-generics-guide.jpg` > `IMG_1234.jpg`
3. **Captions**: Additional context near the image
4. **Structured data**: `ImageObject` schema
5. **Image sitemap**: Help search engines discover images

### Alt Text Best Practices

```tsx
// ✅ Good
<Image alt="TypeScript code showing generic type parameter T in a function" />

// ❌ Bad
<Image alt="image" />
<Image alt="" />  // OK only for decorative images
<Image alt="typescript javascript coding programming web development" /> // Keyword stuffing
```

## Best Practices

### Do

- Use `next/image` for all images
- Set `priority` on LCP image
- Provide accurate `alt` text
- Use `sizes` prop when using `fill`
- Serve WebP/AVIF formats
- Use blur placeholders for large images
- Compress images before upload
- Use descriptive file names

### Don't

- Don't lazy load above-the-fold images
- Don't skip `alt` text (except decorative images)
- Don't serve oversized images
- Don't use PNG for photographs
- Don't forget `width`/`height` (causes CLS)
- Don't set `priority` on more than 1-2 images per page

---

## Exercises

See `exercises.ts` for hands-on practice implementing responsive image configs, srcSet generators, and image optimization logic.
