# Open Graph & Social Sharing

## Table of Contents

1. [Introduction](#introduction)
2. [Open Graph Protocol](#open-graph-protocol)
3. [Core OG Tags](#core-og-tags)
4. [Twitter Cards](#twitter-cards)
5. [Next.js Metadata for Social](#nextjs-metadata-for-social)
6. [Image Requirements](#image-requirements)
7. [Social Sharing Preview](#social-sharing-preview)
8. [Debugging Tools](#debugging-tools)
9. [Best Practices](#best-practices)

---

## Introduction

Open Graph (OG) is a protocol created by Facebook that enables any web page to become a rich object in a social graph. When someone shares a URL on social media, the platform reads OG tags to generate a rich preview card with title, description, and image.

Without OG tags, social platforms guess what to display — often producing ugly, incomplete, or misleading previews.

## Open Graph Protocol

OG tags are `<meta>` elements in the `<head>` with a `property` attribute (not `name`):

```html
<meta property="og:title" content="Understanding TypeScript Generics" />
<meta property="og:description" content="A deep dive into TypeScript generics..." />
<meta property="og:image" content="https://example.com/images/ts-generics.png" />
<meta property="og:url" content="https://example.com/blog/typescript-generics" />
<meta property="og:type" content="article" />
```

### OG vs Standard Meta Tags

| Feature | Standard Meta | Open Graph |
|---------|--------------|------------|
| Attribute | `name` | `property` |
| Used by | Search engines | Social platforms |
| Title source | `<title>` | `og:title` |
| Description | `meta description` | `og:description` |
| Image | None | `og:image` |

## Core OG Tags

### og:title

The title of the page as it should appear in social shares.

```html
<meta property="og:title" content="Understanding TypeScript Generics" />
```

- Can differ from the `<title>` tag (no brand suffix needed)
- Keep under 60-70 characters
- Should be compelling and descriptive

### og:description

A brief description for the social preview.

```html
<meta property="og:description" content="Learn how to use TypeScript generics to write flexible, reusable, type-safe code." />
```

- 2-4 sentences, under 200 characters ideally
- More casual tone than meta description (audience is social, not search)

### og:image

The image displayed in the social preview card.

```html
<meta property="og:image" content="https://example.com/images/og-banner.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="TypeScript Generics illustration" />
```

- **Must be an absolute URL** (not relative)
- Recommended size: **1200×630px** (1.91:1 ratio)
- Minimum: 200×200px (Facebook), 144×144px (LinkedIn)
- Formats: JPG, PNG, GIF, WebP
- Max file size: ~5MB (Facebook), 8MB varies by platform

### og:url

The canonical URL for the page.

```html
<meta property="og:url" content="https://example.com/blog/typescript-generics" />
```

- Must be absolute URL
- Should match your canonical tag
- Consolidates share counts across URL variants

### og:type

The type of content being shared.

| Type | Use Case |
|------|----------|
| `website` | Default for most pages |
| `article` | Blog posts, news articles |
| `profile` | User profile pages |
| `product` | E-commerce product pages |
| `video.other` | Video content |
| `music.song` | Music content |

### og:site_name

The name of the overall website.

```html
<meta property="og:site_name" content="My Developer Blog" />
```

### og:locale

The locale of the content.

```html
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="es_ES" />
```

## Twitter Cards

Twitter (X) has its own card system that falls back to OG tags if Twitter-specific tags aren't present.

### Card Types

| Type | Description | Image |
|------|-------------|-------|
| `summary` | Small square image + title + description | 144×144 min |
| `summary_large_image` | Large banner image above title + description | 300×157 min |
| `player` | Video/audio player | Varies |
| `app` | App download card | App icon |

### Twitter-Specific Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@mysite" />
<meta name="twitter:creator" content="@author" />
<meta name="twitter:title" content="Understanding TypeScript Generics" />
<meta name="twitter:description" content="A deep dive into generics..." />
<meta name="twitter:image" content="https://example.com/images/og-banner.png" />
<meta name="twitter:image:alt" content="TypeScript Generics illustration" />
```

### Twitter Fallback Behavior

Twitter reads tags in this order:
1. `twitter:*` tags (highest priority)
2. `og:*` tags (fallback)
3. Page `<title>` and content (last resort)

So if you set OG tags properly, you only need `twitter:card` and optionally `twitter:site`.

## Next.js Metadata for Social

### Static OG Metadata

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  openGraph: {
    title: 'Understanding TypeScript Generics',
    description: 'A deep dive into TypeScript generics...',
    url: 'https://example.com/blog/typescript-generics',
    siteName: 'My Developer Blog',
    images: [
      {
        url: 'https://example.com/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'TypeScript Generics illustration',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mysite',
    creator: '@author',
  },
};
```

### Dynamic OG Metadata

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}
```

## Image Requirements

### Platform-Specific Image Sizes

| Platform | Recommended | Min Size | Aspect Ratio |
|----------|------------|----------|--------------|
| Facebook | 1200×630 | 200×200 | 1.91:1 |
| Twitter (large) | 1200×628 | 300×157 | 2:1 |
| Twitter (summary) | 240×240 | 144×144 | 1:1 |
| LinkedIn | 1200×627 | 200×200 | 1.91:1 |
| Pinterest | 1000×1500 | 200×200 | 2:3 |

### Image Best Practices

1. Use **1200×630** as a universal default
2. Always provide `og:image:alt` for accessibility
3. Specify width and height to prevent layout shifts in previews
4. Use absolute URLs only
5. Serve over HTTPS
6. Keep file size under 5MB
7. Avoid excessive text overlay (Facebook penalizes it)

## Social Sharing Preview

When a URL is shared, platforms:

1. Fetch the URL via their crawler/scraper
2. Parse `<head>` for OG/Twitter meta tags
3. Cache the result (Facebook caches for 24h+)
4. Render a card with image, title, description, domain

### Cache Invalidation

- **Facebook**: Use [Sharing Debugger](https://developers.facebook.com/tools/debug/) to scrape fresh data
- **Twitter**: Use [Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: Use [Post Inspector](https://www.linkedin.com/post-inspector/)

## Debugging Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Facebook Sharing Debugger | developers.facebook.com/tools/debug | Preview & refresh FB cache |
| Twitter Card Validator | cards-dev.twitter.com/validator | Preview Twitter cards |
| LinkedIn Post Inspector | linkedin.com/post-inspector | Preview LinkedIn shares |
| OpenGraph.xyz | opengraph.xyz | Universal OG preview |
| Metatags.io | metatags.io | Multi-platform preview |

## Best Practices

### Do

- Set OG tags on every public page
- Use high-quality, relevant images sized 1200×630
- Keep `og:title` and `og:description` concise
- Match `og:url` with your canonical URL
- Test with platform-specific debugging tools
- Add `twitter:card` even when using OG tags

### Don't

- Don't use relative URLs for `og:image`
- Don't reuse the same OG image for every page
- Don't exceed recommended text lengths
- Don't forget `og:image:alt`
- Don't ignore cache — changes won't appear until cache refreshes

---

## Exercises

See `exercises.ts` for hands-on practice implementing OG tag generators, Twitter card builders, and social metadata validators.
