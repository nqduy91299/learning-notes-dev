# Canonical URLs

## Table of Contents

1. [Introduction](#introduction)
2. [The Duplicate Content Problem](#the-duplicate-content-problem)
3. [How Canonical Tags Work](#how-canonical-tags-work)
4. [Common Duplicate URL Patterns](#common-duplicate-url-patterns)
5. [Self-Referencing Canonicals](#self-referencing-canonicals)
6. [URL Normalization](#url-normalization)
7. [Next.js Canonical Implementation](#nextjs-canonical-implementation)
8. [Cross-Domain Canonicals](#cross-domain-canonicals)
9. [Canonical vs Redirects](#canonical-vs-redirects)
10. [Common Mistakes](#common-mistakes)
11. [Best Practices](#best-practices)

---

## Introduction

A canonical URL is the preferred version of a web page when multiple URLs serve the same or very similar content. The `<link rel="canonical">` tag tells search engines which URL to index and rank, consolidating link equity (ranking power) to a single URL.

Without canonicals, search engines may:
- Index multiple versions of the same page
- Split ranking signals across duplicates
- Waste crawl budget on duplicate content
- Show the "wrong" URL in search results

## The Duplicate Content Problem

Duplicate content arises when the same (or substantially similar) content is accessible at multiple URLs. This is extremely common and often unintentional.

### Why Duplicates Hurt SEO

1. **Diluted ranking signals**: Backlinks, social shares, and engagement metrics get split across multiple URLs
2. **Crawl budget waste**: Search engines crawl duplicate pages instead of unique content
3. **Wrong URL in SERPs**: Google may choose a different URL than you prefer
4. **Potential penalty**: Excessive intentional duplication may trigger manual action

## How Canonical Tags Work

```html
<link rel="canonical" href="https://example.com/blog/my-post" />
```

This tag says: "The master version of this page lives at this URL. Please index and rank that URL, not this one."

### How Search Engines Process Canonicals

1. Crawler discovers page at URL A
2. Finds canonical pointing to URL B
3. Transfers ranking signals from A to B
4. Indexes URL B instead of A
5. URL A may still be crawled but won't appear in SERPs

### Important: Canonical Is a Hint

Google treats `rel="canonical"` as a **strong hint**, not a directive. Google may ignore your canonical if:
- The canonical URL returns an error
- The content on the canonical URL is very different
- There are conflicting signals (sitemap, internal links, etc.)

## Common Duplicate URL Patterns

### Protocol Variants
```
http://example.com/page    ← duplicate
https://example.com/page   ← canonical
```

### WWW vs Non-WWW
```
https://www.example.com/page   ← duplicate
https://example.com/page       ← canonical (pick one)
```

### Trailing Slash
```
https://example.com/page/   ← duplicate
https://example.com/page    ← canonical (pick one)
```

### URL Parameters
```
https://example.com/products?sort=price     ← duplicate
https://example.com/products?color=red      ← duplicate
https://example.com/products                ← canonical
```

### Case Sensitivity
```
https://example.com/Blog    ← duplicate
https://example.com/blog    ← canonical
```

### Pagination
```
https://example.com/blog?page=1    ← duplicate of base
https://example.com/blog           ← canonical
```

### Session IDs / Tracking Parameters
```
https://example.com/page?sessionid=abc123       ← duplicate
https://example.com/page?utm_source=newsletter  ← duplicate
https://example.com/page                        ← canonical
```

## Self-Referencing Canonicals

Every page should include a canonical tag pointing to itself:

```html
<!-- On https://example.com/blog/my-post -->
<link rel="canonical" href="https://example.com/blog/my-post" />
```

### Why Self-Referencing Canonicals Matter

1. **Prevents parameter-based duplicates**: If someone adds `?ref=social` to your URL, the canonical still points to the clean version
2. **Explicit signal**: Removes ambiguity for search engines
3. **Best practice**: Google recommends self-referencing canonicals on every page

## URL Normalization

URL normalization is the process of converting URLs to a consistent format.

### Normalization Steps

1. **Lowercase the scheme and host**: `HTTPS://EXAMPLE.COM` → `https://example.com`
2. **Remove default ports**: `:443` for HTTPS, `:80` for HTTP
3. **Consistent trailing slash**: Pick one convention and stick with it
4. **Remove tracking parameters**: `utm_*`, `fbclid`, `gclid`, `ref`
5. **Sort query parameters**: For consistent URLs
6. **Remove fragments**: `#section` is not sent to server
7. **Resolve relative paths**: `/../` and `/./` segments
8. **Percent-encoding normalization**: Decode unnecessary encoding

### Example

```
HTTPS://WWW.EXAMPLE.COM:443/Blog/../Page/?utm_source=twitter&sort=date#comments
↓ normalize
https://www.example.com/page/?sort=date
```

## Next.js Canonical Implementation

### Static Canonical

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/about',
  },
};
```

### Dynamic Canonical

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://example.com/blog/${params.slug}`,
    },
  };
}
```

### Canonical in Layout (Base URL)

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
};

// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `/blog/${params.slug}`,  // resolved against metadataBase
    },
  };
}
```

### Next.js Trailing Slash Config

```javascript
// next.config.js
module.exports = {
  trailingSlash: false,  // or true — pick one
};
```

## Cross-Domain Canonicals

You can point canonicals to different domains for syndicated content:

```html
<!-- On partner-site.com/article -->
<link rel="canonical" href="https://original-site.com/article" />
```

This tells Google: "The original version lives on original-site.com."

Use cases:
- Content syndication (Medium, LinkedIn articles)
- Multi-domain businesses
- Regional sites sharing content

## Canonical vs Redirects

| Scenario | Use Canonical | Use 301 Redirect |
|----------|:---:|:---:|
| Both URLs should be accessible | ✅ | ❌ |
| Only one URL should work | ❌ | ✅ |
| Different content, similar topic | ✅ | ❌ |
| URL permanently moved | ❌ | ✅ |
| Parameter variations | ✅ | ❌ |
| HTTP → HTTPS migration | ❌ | ✅ |
| Domain migration | ❌ | ✅ |

### Rule of Thumb

- **301 Redirect**: When users should never see the old URL
- **Canonical**: When both URLs serve a purpose but only one should be indexed

## Common Mistakes

1. **Canonicalizing to a 404**: The canonical URL must return 200
2. **Canonical chains**: A → B → C (should be A → C directly)
3. **Canonical to a different page**: Canonical should point to same/similar content
4. **Relative canonical URLs**: Always use absolute URLs
5. **Canonicalizing paginated content to page 1**: Each paginated page has unique content
6. **Conflicting signals**: Canonical says URL A, but sitemap and internal links say URL B
7. **Noindex + canonical**: These conflict — use one or the other
8. **HTTP canonical on HTTPS page**: Protocol must match the preferred version

## Best Practices

### Do

- Use self-referencing canonicals on every page
- Always use absolute URLs in canonical tags
- Match canonical with URLs in sitemap
- Use `metadataBase` in Next.js for consistent base URLs
- Standardize trailing slash behavior site-wide
- Handle URL parameters consistently

### Don't

- Don't canonical to a different page (unless syndication)
- Don't use relative URLs
- Don't mix canonical with noindex
- Don't create canonical chains
- Don't forget to update canonicals when URLs change
- Don't canonical paginated pages to page 1

---

## Exercises

See `exercises.ts` for hands-on practice implementing URL canonicalization, duplicate detection, and normalization logic.
