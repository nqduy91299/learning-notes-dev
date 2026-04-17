# Performance & Core Web Vitals

## Table of Contents

1. [Introduction](#introduction)
2. [Core Web Vitals](#core-web-vitals)
3. [Largest Contentful Paint (LCP)](#largest-contentful-paint-lcp)
4. [First Input Delay (FID)](#first-input-delay-fid)
5. [Cumulative Layout Shift (CLS)](#cumulative-layout-shift-cls)
6. [Interaction to Next Paint (INP)](#interaction-to-next-paint-inp)
7. [Additional Metrics](#additional-metrics)
8. [Optimization Techniques](#optimization-techniques)
9. [Lighthouse](#lighthouse)
10. [Performance Budgets](#performance-budgets)
11. [Next.js Optimizations](#nextjs-optimizations)
12. [Best Practices](#best-practices)

---

## Introduction

Web performance directly impacts SEO. Google uses Core Web Vitals as ranking signals. Pages that load faster, respond quicker, and maintain visual stability rank higher and provide better user experiences.

Core Web Vitals are a set of specific factors that Google considers important for user experience on the web.

## Core Web Vitals

The three Core Web Vitals (as of 2024):

| Metric | Measures | Good | Needs Improvement | Poor |
|--------|----------|------|-------------------|------|
| **LCP** | Loading performance | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **FID** | Interactivity (deprecated) | ≤ 100ms | ≤ 300ms | > 300ms |
| **CLS** | Visual stability | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| **INP** | Responsiveness (replaces FID) | ≤ 200ms | ≤ 500ms | > 500ms |

### Why CWV Matter for SEO

- **Ranking signal**: Part of Google's page experience signals
- **User experience**: Better metrics = lower bounce rates
- **Search Console**: Reported in Google Search Console
- **Chrome UX Report**: Real-world data collection

## Largest Contentful Paint (LCP)

LCP measures when the largest visible content element finishes rendering. It represents perceived load speed.

### What Counts as LCP Element?

- `<img>` elements
- `<video>` poster images
- Background images via `url()`
- Block-level text elements (`<p>`, `<h1>`, etc.)
- `<svg>` elements

### Common LCP Issues

1. **Slow server response** (high TTFB)
2. **Render-blocking resources** (CSS, JS)
3. **Slow resource load** (large images)
4. **Client-side rendering** (content not in initial HTML)

### Optimizing LCP

- Preload the LCP image: `<link rel="preload" as="image">`
- Use CDN for static assets
- Optimize images (WebP/AVIF, responsive sizes)
- Remove render-blocking CSS/JS
- Use SSR or SSG instead of CSR
- Set `priority` on LCP images in Next.js

## First Input Delay (FID)

FID measures the time from first user interaction to when the browser can respond. **Deprecated in March 2024, replaced by INP.**

### Why FID Was Replaced

- Only measured the *first* interaction
- Didn't capture the full interaction lifecycle
- INP measures *all* interactions throughout the page lifecycle

## Cumulative Layout Shift (CLS)

CLS measures visual stability — how much content unexpectedly shifts during page load.

### What Causes Layout Shifts?

1. **Images without dimensions** (no width/height)
2. **Ads/embeds without reserved space**
3. **Dynamically injected content**
4. **Web fonts causing FOIT/FOUT**
5. **DOM changes above the viewport**

### CLS Calculation

```
CLS = sum of all layout shift scores

Layout Shift Score = Impact Fraction × Distance Fraction

Impact Fraction = % of viewport affected
Distance Fraction = distance moved / viewport height
```

### Fixing CLS

- Always set `width` and `height` on images and videos
- Reserve space for ads and embeds
- Use CSS `aspect-ratio` for responsive containers
- Use `font-display: swap` with size-adjusted fallback fonts
- Avoid inserting content above existing content

## Interaction to Next Paint (INP)

INP replaced FID in March 2024. It measures responsiveness across ALL interactions, not just the first.

### How INP Works

1. User clicks/taps/presses a key
2. Browser processes event handlers
3. Browser renders the visual update
4. INP = total time from input to next paint

### INP vs FID

| | FID | INP |
|---|-----|-----|
| Interactions measured | First only | All |
| What's measured | Input delay only | Full interaction lifecycle |
| Includes rendering | No | Yes |
| Status | Deprecated | Active CWV |

### Optimizing INP

- Break up long tasks (use `requestIdleCallback`, `scheduler.yield()`)
- Reduce JavaScript execution time
- Minimize DOM size
- Use `startTransition` in React for non-urgent updates
- Debounce rapid interactions
- Use web workers for heavy computation

## Additional Metrics

### TTFB (Time to First Byte)

Time from request to first byte of response.

| Rating | Time |
|--------|------|
| Good | ≤ 800ms |
| Poor | > 1800ms |

### FCP (First Contentful Paint)

Time until first text/image renders.

| Rating | Time |
|--------|------|
| Good | ≤ 1.8s |
| Poor | > 3.0s |

### TBT (Total Blocking Time)

Sum of time spent on long tasks (>50ms) between FCP and TTI.

### Speed Index

How quickly visible content is populated during load.

## Optimization Techniques

### Image Optimization

- Use modern formats: WebP (30% smaller than JPEG), AVIF (50% smaller)
- Responsive images with `srcset` and `sizes`
- Lazy load below-fold images
- Use blur placeholders
- Set explicit dimensions

### Font Loading

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;           /* Show fallback immediately */
  size-adjust: 100%;            /* Reduce CLS from font swap */
  unicode-range: U+0000-00FF;   /* Load only needed glyphs */
}
```

### Code Splitting

- Dynamic imports: `const Component = dynamic(() => import('./Heavy'))`
- Route-based splitting (Next.js does this automatically)
- Remove unused code (tree-shaking)

### Prefetching

- `<link rel="preload">` for critical resources
- `<link rel="prefetch">` for likely next navigations
- Next.js `<Link>` prefetches automatically on viewport entry

### Caching

- Set appropriate Cache-Control headers
- Use stale-while-revalidate pattern
- ISR (Incremental Static Regeneration) in Next.js

## Lighthouse

Lighthouse is Google's automated tool for auditing web page quality.

### Lighthouse Categories

| Category | Weight |
|----------|--------|
| Performance | Metrics-based scoring |
| Accessibility | a11y best practices |
| Best Practices | Security, modern APIs |
| SEO | Meta tags, crawlability |
| PWA | Progressive Web App criteria |

### Performance Score Weights (Lighthouse 10)

| Metric | Weight |
|--------|--------|
| TBT | 30% |
| LCP | 25% |
| CLS | 25% |
| Speed Index | 10% |
| FCP | 10% |

## Performance Budgets

Performance budgets set limits on metrics to prevent regressions.

### Example Budget

| Resource | Budget |
|----------|--------|
| JavaScript (total) | < 300KB |
| CSS (total) | < 50KB |
| Images (per page) | < 500KB |
| Web fonts | < 100KB |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| Total page weight | < 1.5MB |

## Next.js Optimizations

### Built-in Optimizations

- **Automatic code splitting** per route
- **Image optimization** via `next/image`
- **Font optimization** via `next/font`
- **Script optimization** via `next/script`
- **Static generation** (SSG) and ISR
- **Streaming SSR** with React Suspense
- **Edge Runtime** for lower latency
- **Automatic prefetching** on `<Link>`

### next/image

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={630}
  alt="Hero"
  priority        // Preload LCP image
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### next/font

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',    // Prevent layout shift
  preload: true,
});
```

## Best Practices

### Do

- Measure CWV with real user data (Chrome UX Report, Search Console)
- Set and enforce performance budgets
- Optimize LCP image (preload, proper sizing, modern format)
- Reserve space for dynamic content (prevent CLS)
- Use SSR/SSG over CSR for content pages
- Monitor performance continuously

### Don't

- Don't rely solely on Lighthouse (lab data ≠ real users)
- Don't lazy-load above-the-fold images
- Don't load unnecessary JavaScript on initial render
- Don't use layout-triggering CSS animations
- Don't ignore mobile performance (most users are on mobile)
- Don't block rendering with third-party scripts

---

## Exercises

See `exercises.ts` for hands-on practice implementing CWV score calculators, performance budget checkers, and optimization audit tools.
