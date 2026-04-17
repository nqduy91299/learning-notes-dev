# Build Optimization in Next.js

Optimizing your Next.js build is critical for delivering fast, efficient applications.
This guide covers bundle analysis, code splitting, tree shaking, image and font
optimization, and strategies for keeping your bundle lean.

---

## Table of Contents

1. [Bundle Analysis](#bundle-analysis)
2. [Code Splitting](#code-splitting)
3. [Dynamic Imports with next/dynamic](#dynamic-imports-with-nextdynamic)
4. [Tree Shaking](#tree-shaking)
5. [Image Optimization](#image-optimization)
6. [Font Optimization](#font-optimization)
7. [Barrel File Anti-Pattern](#barrel-file-anti-pattern)
8. [Package Import Optimization](#package-import-optimization)
9. [Lazy Loading Strategies](#lazy-loading-strategies)
10. [Monitoring Bundle Size](#monitoring-bundle-size)

---

## Bundle Analysis

### Why Analyze Your Bundle?

Without visibility into what's in your JavaScript bundles, you can't optimize them.
Large bundles increase load times, hurt Core Web Vitals, and degrade user experience.

### @next/bundle-analyzer

The official Next.js bundle analyzer wraps `webpack-bundle-analyzer` and provides
a visual treemap of your bundle contents.

**Installation:**

```bash
npm install @next/bundle-analyzer
```

**Configuration in `next.config.js`:**

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your Next.js config
});
```

**Running the analysis:**

```bash
ANALYZE=true npm run build
```

This opens two HTML reports — one for the server bundle, one for the client bundle.

### What to Look For

- **Large dependencies**: Libraries like `moment`, `lodash` (non-ES), or full icon sets
- **Duplicate modules**: Same library bundled multiple times at different versions
- **Unused code**: Modules imported but never used in production paths
- **Route-specific bloat**: Heavy libraries loaded on pages that don't need them

### Interpreting the Treemap

Each rectangle represents a module. Size corresponds to its byte contribution:

- **Stat size**: Original source size
- **Parsed size**: Size after webpack processing (minification, transforms)
- **Gzipped size**: Compressed transfer size — the most relevant metric

---

## Code Splitting

### Automatic Per-Route Splitting

Next.js automatically code-splits at the page/route level. Each route in `pages/`
or `app/` gets its own JavaScript bundle. Users only download code for the page
they visit.

```
pages/
  index.tsx    -> chunk for /
  about.tsx    -> chunk for /about
  dashboard/
    index.tsx  -> chunk for /dashboard
```

**Shared modules** are extracted into common chunks automatically. If both `/` and
`/about` import the same utility, webpack deduplicates it into a shared chunk.

### How It Works Under the Hood

Next.js uses webpack's `SplitChunksPlugin` with a tuned configuration:

- **Framework chunk**: React, React DOM, scheduler — shared across all pages
- **Commons chunk**: Modules used by >50% of pages
- **Page chunks**: Code unique to each route
- **Dynamic chunks**: Code loaded via `import()`

### Route Prefetching

In production, Next.js prefetches linked routes via `<Link>`. When a `<Link>`
enters the viewport, Next.js fetches the chunk for that route in the background.
This makes navigations feel instant without loading everything upfront.

---

## Dynamic Imports with next/dynamic

### Basic Usage

`next/dynamic` wraps React.lazy with SSR support and a loading state:

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('../components/HeavyChart'));
```

### Options

```tsx
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false,  // Only render on the client
});
```

**Key options:**

| Option    | Type        | Description                                     |
|-----------|-------------|-------------------------------------------------|
| `loading` | `() => JSX` | Component shown while the chunk loads           |
| `ssr`     | `boolean`   | Whether to server-render the component          |

### When to Use `ssr: false`

- Components that depend on `window`, `document`, or browser APIs
- Heavy visualization libraries (D3, Three.js, chart libraries)
- Components not needed for initial server-rendered HTML
- Editors, media players, maps — anything browser-only

### Named Exports

For modules with named exports:

```tsx
const SpecificComponent = dynamic(
  () => import('../components/MultiExport').then(mod => mod.SpecificComponent)
);
```

---

## Tree Shaking

### What Is Tree Shaking?

Tree shaking is dead code elimination for ES modules. The bundler analyzes static
`import`/`export` statements and removes exports that no consumer references.

### Requirements for Effective Tree Shaking

1. **Use ES module syntax** (`import`/`export`, not `require`/`module.exports`)
2. **Avoid side effects** in module top-level scope
3. **Mark packages as side-effect-free** via `sideEffects` in `package.json`

### The `sideEffects` Field

In your `package.json`:

```json
{
  "sideEffects": false
}
```

This tells the bundler: "If you don't import anything from a file, you can safely
skip the entire file." You can also specify files that DO have side effects:

```json
{
  "sideEffects": ["*.css", "./src/polyfills.ts"]
}
```

### ES Module Imports vs CommonJS

```ts
// Tree-shakeable — bundler sees exactly what's used
import { debounce } from 'lodash-es';

// NOT tree-shakeable — entire module is included
const _ = require('lodash');
```

### Common Tree Shaking Pitfalls

- **Re-exporting everything**: Barrel files that re-export entire modules
- **Class-based APIs**: Classes with methods can't be tree-shaken per-method
- **Dynamic property access**: `obj[key]` prevents static analysis
- **Module-level side effects**: Top-level function calls, assignments to globals

---

## Image Optimization

### next/image Component

The `next/image` component provides automatic image optimization:

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
/>
```

### Key Props

| Prop       | Description                                         |
|------------|-----------------------------------------------------|
| `src`      | Image source — local path, import, or external URL  |
| `width`    | Intrinsic width in pixels (for aspect ratio)        |
| `height`   | Intrinsic height in pixels (for aspect ratio)       |
| `alt`      | Required accessibility text                         |
| `priority` | Preload the image (use for LCP images)              |
| `quality`  | Optimization quality 1-100 (default: 75)            |
| `fill`     | Image fills parent container (use with object-fit)  |
| `sizes`    | Media query hints for responsive images             |
| `placeholder` | `"blur"` or `"empty"` — shown while loading      |

### Image Formats

Next.js automatically serves modern formats when the browser supports them:

- **WebP**: ~30% smaller than JPEG, broad support
- **AVIF**: ~50% smaller than JPEG, growing support

Configuration in `next.config.js`:

```js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### The `sizes` Prop

The `sizes` prop tells the browser which image width to request at each viewport:

```tsx
<Image
  src="/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

Without `sizes`, the browser may download an image larger than needed.

### The `priority` Prop

Use `priority` for images visible above the fold — the Largest Contentful Paint
(LCP) image. This adds `<link rel="preload">` to the document head.

**Rule of thumb**: Only 1-2 images per page should have `priority`.

---

## Font Optimization

### next/font

`next/font` eliminates external network requests for fonts by self-hosting them
and inlining font declarations at build time.

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

// Use inter.className on elements
```

### Variable Fonts

Variable fonts contain all weights/styles in a single file, reducing total font
download size compared to loading multiple static font files:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',  // CSS custom property
});

// Use inter.variable on <html> for CSS variable access
```

Using the `variable` option creates a CSS custom property you can reference in
your stylesheets, enabling flexible weight usage without extra downloads.

### Local Fonts

```tsx
import localFont from 'next/font/local';

const myFont = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
  variable: '--font-my',
});
```

### Font Display Options

| Value      | Behavior                                          |
|------------|---------------------------------------------------|
| `swap`     | Show fallback immediately, swap when font loads   |
| `block`    | Brief invisible text, then swap (up to 3s)        |
| `fallback` | Very brief block, swap if font loads quickly      |
| `optional` | Use font only if already cached                   |

**Recommendation**: Use `swap` for body text, `optional` for non-critical fonts.

---

## Barrel File Anti-Pattern

### The Problem

A barrel file re-exports from multiple modules:

```ts
// components/index.ts (barrel file)
export { Button } from './Button';
export { Modal } from './Modal';
export { Chart } from './Chart';  // Chart is 200KB
```

When you import from the barrel:

```ts
import { Button } from '@/components';
```

The bundler may pull in `Chart` and `Modal` too, even though you only need
`Button`. While modern bundlers handle this better, barrel files still cause:

- **Slower dev server startup**: All modules must be parsed
- **Larger initial bundles in edge cases**: Especially with CJS dependencies
- **Harder static analysis**: Deep re-export chains confuse tree shaking

### The Fix

Import directly from the source module:

```ts
import { Button } from '@/components/Button';
```

### Next.js `optimizePackageImports`

Next.js provides a config option to automatically optimize barrel imports for
known packages:

```js
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'date-fns'],
  },
};
```

This transforms barrel imports into direct imports at build time.

---

## Package Import Optimization

### Choosing Lighter Alternatives

| Heavy Package   | Lighter Alternative   | Savings       |
|-----------------|-----------------------|---------------|
| `moment`        | `date-fns` / `dayjs`  | ~95% / ~97%   |
| `lodash`        | `lodash-es` + cherry  | ~80%          |
| `axios`         | `fetch` (native)      | ~100%         |
| `numeral`       | `Intl.NumberFormat`   | ~100%         |

### Cherry-Picking Imports

```ts
// Bad — imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// Good — imports only debounce
import debounce from 'lodash-es/debounce';
debounce(fn, 300);
```

### Analyzing Import Cost

Use the Import Cost VS Code extension to see real-time size of imported packages.
In CI, use `bundlesize` or `size-limit` to enforce budgets.

### `modularizeImports` (Legacy)

Before `optimizePackageImports`, Next.js offered `modularizeImports`:

```js
module.exports = {
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
};
```

Prefer `optimizePackageImports` in newer Next.js versions.

---

## Lazy Loading Strategies

### Route-Level Lazy Loading

Handled automatically by Next.js — each route is a separate chunk.

### Component-Level Lazy Loading

Use `dynamic()` for heavy components not needed at initial render:

```tsx
const Editor = dynamic(() => import('./Editor'), { ssr: false });
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <Skeleton />,
});
```

### Data-Level Lazy Loading

Load data only when it's needed — on scroll, on click, on viewport entry:

```tsx
// Load data when section enters viewport
const { data } = useSWR(
  isVisible ? '/api/analytics' : null,
  fetcher
);
```

### Interaction-Based Loading

Preload a component on hover, load on click:

```tsx
const loadEditor = () => import('./Editor');

// Preload on hover
<button onMouseEnter={loadEditor} onClick={() => setShowEditor(true)}>
  Open Editor
</button>
```

### Below-the-Fold Content

Use Intersection Observer to lazy load content below the viewport:

```tsx
function useLazyLoad(ref) {
  const [isVisible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return isVisible;
}
```

### Module Preloading

For routes you expect the user to visit next:

```tsx
import { useRouter } from 'next/router';

function Nav() {
  const router = useRouter();
  return (
    <Link
      href="/dashboard"
      onMouseEnter={() => router.prefetch('/dashboard')}
    >
      Dashboard
    </Link>
  );
}
```

---

## Monitoring Bundle Size

### Build Output

`next build` prints a summary of each route's size:

```
Route (app)                    Size     First Load JS
/                              5.2 kB   87.3 kB
/about                         1.1 kB   83.2 kB
/dashboard                     12.4 kB  94.5 kB
```

- **Size**: JavaScript unique to that route
- **First Load JS**: Total JS for first visit (shared chunks + route chunk)

A colored indicator shows if you exceed recommended budgets:
- Green: Under 100 kB
- Yellow: 100-170 kB
- Red: Over 170 kB

### CI Integration with size-limit

```json
{
  "size-limit": [
    { "path": ".next/static/chunks/*.js", "limit": "200 kB" },
    { "path": ".next/static/css/*.css", "limit": "30 kB" }
  ]
}
```

### Custom Bundle Budget Script

Track bundle size over time by recording it in CI:

```bash
#!/bin/bash
npx next build
du -sh .next/static/chunks/ | awk '{print $1}'
```

### Key Metrics to Track

- **Total First Load JS** for each route
- **Largest shared chunk size**
- **Number of dynamic chunks**
- **Third-party JS percentage** of total bundle
- **CSS bundle size** (if using CSS-in-JS, this may be in JS)

### Performance Budgets

Set explicit budgets and fail CI when exceeded:

| Metric           | Budget    | Why                                      |
|------------------|-----------|------------------------------------------|
| First Load JS    | < 170 kB  | Keep initial load fast on mobile         |
| Per-route JS     | < 50 kB   | Keep navigations snappy                  |
| Total CSS        | < 50 kB   | Render-blocking resource                 |
| Largest image    | < 200 kB  | LCP performance                          |

---

## Quick Reference Checklist

- [ ] Run bundle analyzer regularly and after major dependency changes
- [ ] Use `dynamic()` with `ssr: false` for browser-only heavy components
- [ ] Import from ES module versions of libraries (`lodash-es`, not `lodash`)
- [ ] Set `sideEffects: false` in your package.json if applicable
- [ ] Use `next/image` for all images — set `priority` on LCP image
- [ ] Use `next/font` — prefer variable fonts, set `display: 'swap'`
- [ ] Avoid barrel files or configure `optimizePackageImports`
- [ ] Cherry-pick imports from large libraries
- [ ] Set bundle budgets in CI
- [ ] Monitor First Load JS in `next build` output

---

## Further Reading

- [Next.js Docs: Optimizing](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Next.js Docs: Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [size-limit](https://github.com/ai/size-limit)
