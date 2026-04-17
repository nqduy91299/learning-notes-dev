# Meta Tags for SEO

## Table of Contents

1. [Introduction](#introduction)
2. [Title Tag](#title-tag)
3. [Meta Description](#meta-description)
4. [Viewport Meta Tag](#viewport-meta-tag)
5. [Robots Meta Tag](#robots-meta-tag)
6. [Canonical Tag](#canonical-tag)
7. [Meta Keywords (Deprecated)](#meta-keywords-deprecated)
8. [Next.js Metadata API](#nextjs-metadata-api)
9. [generateMetadata Function](#generatemetadata-function)
10. [Best Practices](#best-practices)

---

## Introduction

Meta tags are HTML elements placed in the `<head>` section of a web page. They provide metadata about the page to search engines and browsers. While invisible to users, they critically influence how search engines index, rank, and display your pages in search results.

The most important meta tags for SEO are the title tag, meta description, viewport, robots directives, and canonical URLs.

## Title Tag

The `<title>` tag is the single most important on-page SEO element. It appears in:
- Browser tabs
- Search engine results pages (SERPs) as the clickable headline
- Social media shares (as fallback)

```html
<title>Learn TypeScript | Complete Guide for Developers</title>
```

### Title Tag Best Practices

| Rule | Guideline |
|------|-----------|
| Length | 50-60 characters (Google truncates at ~600px) |
| Uniqueness | Every page must have a unique title |
| Keywords | Place primary keyword near the beginning |
| Branding | Append brand name with separator: `Page Title | Brand` |
| Readability | Write for humans first, search engines second |

### Common Mistakes

- **Duplicate titles**: Multiple pages sharing the same title confuse search engines.
- **Keyword stuffing**: "Buy Shoes | Cheap Shoes | Best Shoes | Shoe Store" is spam.
- **Too long**: Truncated titles look unprofessional in SERPs.
- **Missing titles**: Pages without titles are nearly invisible to search engines.

## Meta Description

The meta description provides a brief summary of the page content. It appears below the title in SERPs.

```html
<meta name="description" content="Learn TypeScript from scratch with practical exercises. Covers types, generics, utility types, and real-world patterns." />
```

### Meta Description Guidelines

- **Length**: 150-160 characters (Google truncates longer descriptions)
- **Action-oriented**: Use active voice and calls to action
- **Unique per page**: Never duplicate descriptions across pages
- **Include keywords**: Matched keywords appear **bold** in SERPs
- **Accurate**: Must reflect actual page content

> **Note**: Google often rewrites meta descriptions based on the search query. Despite this, providing a good default description is still recommended.

## Viewport Meta Tag

The viewport meta tag controls how the page is displayed on mobile devices. It's essential for mobile-first indexing.

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Viewport Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `width` | `device-width` | Match screen width |
| `initial-scale` | `1` | Set initial zoom level |
| `maximum-scale` | `1` | Prevent zoom (accessibility concern) |
| `user-scalable` | `no` | Disable zoom (avoid this) |

**Important**: Never disable user scaling (`user-scalable=no`). This is an accessibility violation. Google also penalizes pages that prevent zooming.

## Robots Meta Tag

The robots meta tag tells search engine crawlers how to handle the page.

```html
<meta name="robots" content="index, follow" />
```

### Robot Directives

| Directive | Meaning |
|-----------|---------|
| `index` | Allow the page to appear in search results |
| `noindex` | Prevent the page from appearing in search results |
| `follow` | Follow links on the page |
| `nofollow` | Don't follow links on the page |
| `noarchive` | Don't show cached version |
| `nosnippet` | Don't show description snippet |
| `max-snippet:N` | Limit snippet to N characters |
| `max-image-preview:large` | Allow large image preview |
| `max-video-preview:N` | Limit video preview to N seconds |

### Common Combinations

```
index, follow        → Default behavior (can be omitted)
noindex, follow      → Don't index page, but follow links
noindex, nofollow    → Don't index page, don't follow links
index, nofollow      → Index page, but don't follow links
```

### When to Use `noindex`

- Internal search results pages
- Thank you / confirmation pages
- Admin or staging pages
- Paginated pages (sometimes)
- Thin content pages with no search value

## Canonical Tag

The canonical tag tells search engines which URL is the "master" version of a page when duplicate or similar content exists at multiple URLs.

```html
<link rel="canonical" href="https://example.com/blog/my-post" />
```

### When Canonicals Are Needed

- Same content at `http://` and `https://`
- Same content with/without `www`
- Same content with/without trailing slash
- URL parameters creating duplicate pages (`?sort=price`, `?page=2`)
- Syndicated content across multiple domains

## Meta Keywords (Deprecated)

```html
<meta name="keywords" content="typescript, javascript, programming" />
```

**Google has officially stated that `meta keywords` are NOT a ranking factor.** They have been ignored since 2009. Do not waste time adding them.

Other search engines (Yandex, Baidu) may still use them minimally, but their impact is negligible.

## Next.js Metadata API

Next.js 13+ (App Router) provides a built-in Metadata API that generates meta tags automatically.

### Static Metadata (export const metadata)

```typescript
// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our company and mission.',
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  alternates: {
    canonical: 'https://example.com/about',
  },
};
```

### The Metadata Object Structure

```typescript
interface Metadata {
  title?: string | TemplateString;
  description?: string;
  robots?: Robots;
  alternates?: Alternates;
  openGraph?: OpenGraph;
  twitter?: Twitter;
  viewport?: Viewport;       // Deprecated in Next.js 14+
  verification?: Verification;
  icons?: Icons;
  manifest?: string;
  other?: Record<string, string>;
}
```

### Title Templates

Next.js supports title templates for consistent branding:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | My Site',
    default: 'My Site',        // Used when child doesn't set title
  },
};

// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog',              // Renders: "Blog | My Site"
};
```

## generateMetadata Function

For dynamic pages where metadata depends on route parameters, data fetching, or other runtime information, use `generateMetadata`:

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://example.com/blog/${params.slug}`,
    },
    robots: {
      index: post.isPublished,
      follow: true,
    },
  };
}
```

### Key Points About generateMetadata

1. **Runs on the server only** — never shipped to the client
2. **Can be async** — supports data fetching with `fetch` (deduplicated with page `fetch`)
3. **Receives same props as the page** — `params` and `searchParams`
4. **Inherits from parent layouts** — child metadata merges with/overrides parent
5. **Blocks rendering** — page waits for metadata to resolve

### Metadata Inheritance

Metadata flows from root layout down to the page:

```
app/layout.tsx          → { title: { template: '%s | Site' } }
  app/blog/layout.tsx   → { title: { template: '%s | Blog | Site' } }
    app/blog/[slug]/page.tsx → { title: 'My Post' }
                              → Renders: "My Post | Blog | Site"
```

## Best Practices

### Do

- Set unique `title` and `description` for every page
- Use `generateMetadata` for dynamic routes
- Always include a self-referencing canonical
- Set appropriate `robots` directives for non-content pages
- Use title templates for consistent branding
- Keep titles under 60 characters, descriptions under 160

### Don't

- Don't duplicate metadata across pages
- Don't stuff keywords into titles or descriptions
- Don't use `meta keywords` tag
- Don't block important pages with `noindex`
- Don't forget viewport meta on mobile-responsive pages
- Don't set `nofollow` on internal links unnecessarily

### Testing

- **Google Search Console**: Check for meta tag issues in Coverage reports
- **Chrome DevTools**: Inspect `<head>` to verify rendered meta tags
- **Lighthouse**: Run SEO audit for missing or problematic tags
- **next build**: Next.js validates metadata at build time

---

## Exercises

See `exercises.ts` for hands-on practice implementing meta tag generation, robots directive logic, and Next.js Metadata API patterns.
