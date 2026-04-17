# Sitemap & Robots.txt

## Table of Contents

1. [Introduction](#introduction)
2. [Sitemap XML Structure](#sitemap-xml-structure)
3. [Sitemap Properties](#sitemap-properties)
4. [Sitemap Index](#sitemap-index)
5. [Dynamic Sitemap in Next.js](#dynamic-sitemap-in-nextjs)
6. [Robots.txt Structure](#robotstxt-structure)
7. [Robots.txt Directives](#robotstxt-directives)
8. [Next.js robots.ts](#nextjs-robotsts)
9. [Crawl Budget](#crawl-budget)
10. [Best Practices](#best-practices)

---

## Introduction

Sitemaps and robots.txt are fundamental files that communicate directly with search engine crawlers. The sitemap tells crawlers what pages exist and which are important. Robots.txt tells crawlers what they're allowed to access.

Together, they form the foundation of technical SEO — controlling how search engines discover and crawl your site.

## Sitemap XML Structure

A sitemap is an XML file that lists URLs on your site, along with metadata about each URL.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15T08:00:00+00:00</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <lastmod>2024-01-14T10:30:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### XML Requirements

- Must be UTF-8 encoded
- Must begin with `<urlset>` with the sitemaps.org namespace
- Each URL wrapped in `<url>` element
- `<loc>` is the only required child element
- Maximum 50,000 URLs per sitemap file
- Maximum 50MB uncompressed file size

## Sitemap Properties

| Element | Required | Description |
|---------|----------|-------------|
| `<loc>` | ✅ | Absolute URL of the page |
| `<lastmod>` | Recommended | Last modification date (ISO 8601) |
| `<changefreq>` | Optional | How often content changes |
| `<priority>` | Optional | Relative importance (0.0 to 1.0) |

### changefreq Values

| Value | Meaning |
|-------|---------|
| `always` | Changes every access |
| `hourly` | Changes every hour |
| `daily` | Changes daily |
| `weekly` | Changes weekly |
| `monthly` | Changes monthly |
| `yearly` | Changes yearly |
| `never` | Archived content |

> **Note**: Google has stated they largely ignore `changefreq` and `priority`. Focus on accurate `lastmod` dates instead.

### priority Values

- `1.0` — Homepage, most important pages
- `0.8` — Major sections, categories
- `0.6` — Individual content pages (default)
- `0.4` — Less important pages
- `0.2` — Low priority pages

## Sitemap Index

For large sites with more than 50,000 URLs, use a sitemap index file that references multiple sitemap files:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2024-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-blog.xml</loc>
    <lastmod>2024-01-14</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2024-01-13</lastmod>
  </sitemap>
</sitemapindex>
```

A sitemap index can reference up to 50,000 sitemap files.

## Dynamic Sitemap in Next.js

### app/sitemap.ts (App Router)

Next.js can generate sitemaps dynamically:

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://example.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
```

### Dynamic Sitemap with Database

```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({ select: { slug: true, updatedAt: true } });

  const postEntries = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    { url: 'https://example.com', lastModified: new Date(), priority: 1 },
    ...postEntries,
  ];
}
```

### Multiple Sitemaps (generateSitemaps)

```typescript
export async function generateSitemaps() {
  const totalPosts = await db.post.count();
  const sitemaps = [];
  for (let i = 0; i < Math.ceil(totalPosts / 50000); i++) {
    sitemaps.push({ id: i });
  }
  return sitemaps;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({ skip: id * 50000, take: 50000 });
  return posts.map(post => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));
}
```

## Robots.txt Structure

Robots.txt is a plain text file at the root of your site (`/robots.txt`) that tells crawlers which areas they can access.

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

User-agent: Googlebot
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

### How Robots.txt Works

1. Crawler requests `/robots.txt` first
2. Checks for rules matching its User-agent
3. Follows Allow/Disallow directives
4. Rules are matched by path prefix
5. More specific rules override less specific ones

### Important: Robots.txt Is Advisory

Robots.txt is a **suggestion**, not enforcement. Well-behaved crawlers (Google, Bing) respect it. Malicious bots ignore it. **Never rely on robots.txt for security.**

## Robots.txt Directives

| Directive | Purpose | Example |
|-----------|---------|---------|
| `User-agent` | Target specific crawler | `User-agent: Googlebot` |
| `Allow` | Explicitly allow a path | `Allow: /public/` |
| `Disallow` | Block a path | `Disallow: /admin/` |
| `Sitemap` | Location of sitemap | `Sitemap: https://example.com/sitemap.xml` |
| `Crawl-delay` | Seconds between requests | `Crawl-delay: 10` |

### Common User-Agents

| Agent | Crawler |
|-------|---------|
| `*` | All crawlers |
| `Googlebot` | Google search |
| `Bingbot` | Bing search |
| `Slurp` | Yahoo |
| `DuckDuckBot` | DuckDuckGo |
| `Baiduspider` | Baidu |
| `YandexBot` | Yandex |
| `facebot` | Facebook crawler |
| `Twitterbot` | Twitter crawler |
| `GPTBot` | OpenAI GPT crawler |

### Pattern Matching

```
Disallow: /admin       # Blocks /admin, /admin/, /admin/page
Disallow: /admin/      # Blocks /admin/ and below, but NOT /admin
Disallow: /*.pdf$      # Blocks all PDFs
Disallow: /search?     # Blocks search results with parameters
Allow: /admin/public   # Allow within a disallowed directory
```

## Next.js robots.ts

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/private/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

## Crawl Budget

**Crawl budget** is the number of pages a search engine will crawl on your site within a given timeframe.

### Factors Affecting Crawl Budget

- **Site size**: Larger sites get proportionally less complete crawls
- **Page speed**: Faster sites get crawled more
- **Server errors**: 5xx errors reduce crawl rate
- **Redirect chains**: Waste crawl budget
- **Duplicate content**: Wastes budget on same content
- **robots.txt blocks**: Can preserve budget

### Optimizing Crawl Budget

1. Block low-value pages in robots.txt
2. Fix broken links and redirect chains
3. Remove duplicate content or use canonicals
4. Improve server response times
5. Use sitemap to prioritize important pages
6. Keep URL structures clean and flat

## Best Practices

### Sitemap

- Submit sitemap to Google Search Console
- Keep sitemap up-to-date with accurate `lastmod`
- Only include canonical, indexable URLs
- Don't include noindex pages in sitemap
- Use sitemap index for sites > 50,000 URLs
- Gzip large sitemaps

### Robots.txt

- Always include `Sitemap` directive
- Test with Google Search Console robots.txt tester
- Don't block CSS/JS files (Google needs them for rendering)
- Don't use robots.txt to hide sensitive content (use auth instead)
- Be specific with Disallow paths
- Review robots.txt regularly

---

## Exercises

See `exercises.ts` for hands-on practice implementing sitemap generators, robots.txt parsers, and crawl budget optimizers.
