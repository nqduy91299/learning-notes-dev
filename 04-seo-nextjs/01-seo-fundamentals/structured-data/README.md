# Structured Data (JSON-LD)

## Table of Contents

1. [Introduction](#introduction)
2. [JSON-LD Format](#json-ld-format)
3. [Schema.org Types](#schemaorg-types)
4. [Article Schema](#article-schema)
5. [Product Schema](#product-schema)
6. [FAQ Schema](#faq-schema)
7. [BreadcrumbList Schema](#breadcrumblist-schema)
8. [Organization Schema](#organization-schema)
9. [Rich Snippets](#rich-snippets)
10. [Next.js Implementation](#nextjs-implementation)
11. [Testing & Validation](#testing--validation)
12. [Best Practices](#best-practices)

---

## Introduction

Structured data is a standardized format for providing information about a page and classifying the page content. Search engines use it to generate **rich snippets** — enhanced search results with ratings, images, prices, FAQs, and more.

The recommended format is **JSON-LD** (JavaScript Object Notation for Linked Data), embedded in a `<script>` tag in the page's HTML.

## JSON-LD Format

JSON-LD is embedded in the page as a script tag:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Understanding TypeScript Generics",
  "author": {
    "@type": "Person",
    "name": "Jane Doe"
  }
}
</script>
```

### Key Properties

| Property | Purpose |
|----------|---------|
| `@context` | Always `"https://schema.org"` |
| `@type` | The Schema.org type (Article, Product, etc.) |
| `@id` | Unique identifier for the entity |

### Why JSON-LD Over Microdata/RDFa?

- **Decoupled from HTML** — doesn't clutter markup
- **Easier to maintain** — lives in one `<script>` block
- **Google recommended** — explicitly preferred by Google
- **Easier to generate** — it's just JSON
- **Multiple schemas** — can include multiple schemas per page

## Schema.org Types

Schema.org defines hundreds of types. The most impactful for SEO:

| Type | Rich Result |
|------|-------------|
| `Article` | Article rich result with headline, image, date |
| `Product` | Product listing with price, availability, rating |
| `FAQPage` | Expandable FAQ accordion in SERPs |
| `BreadcrumbList` | Breadcrumb trail in SERPs |
| `Organization` | Knowledge panel, logo in results |
| `LocalBusiness` | Local pack listing with map |
| `HowTo` | Step-by-step instructions |
| `Recipe` | Recipe card with cooking time, rating |
| `Event` | Event listing with date, location |
| `VideoObject` | Video thumbnail in results |
| `Review` | Star rating display |
| `WebSite` | Sitelinks search box |

## Article Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Understanding TypeScript Generics",
  "description": "A comprehensive guide to TypeScript generics...",
  "image": "https://example.com/images/ts-generics.png",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/authors/jane-doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Dev Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2024-01-15T08:00:00+00:00",
  "dateModified": "2024-02-01T10:30:00+00:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blog/typescript-generics"
  }
}
```

### Required vs Recommended Properties

| Property | Required | Notes |
|----------|----------|-------|
| `headline` | ✅ | Max 110 characters |
| `author` | ✅ | Person or Organization |
| `datePublished` | ✅ | ISO 8601 format |
| `image` | Recommended | At least 1200px wide |
| `publisher` | Recommended | Organization with logo |
| `dateModified` | Recommended | ISO 8601 format |
| `description` | Recommended | Brief summary |

## Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "TypeScript Pro Course",
  "description": "Master TypeScript with 100+ exercises",
  "image": "https://example.com/product.png",
  "brand": {
    "@type": "Brand",
    "name": "DevCourses"
  },
  "offers": {
    "@type": "Offer",
    "price": "49.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/courses/typescript-pro"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "256"
  }
}
```

## FAQ Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is TypeScript?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TypeScript is a typed superset of JavaScript..."
      }
    },
    {
      "@type": "Question",
      "name": "Is TypeScript worth learning?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, TypeScript is widely adopted..."
      }
    }
  ]
}
```

FAQ schema generates expandable Q&A directly in search results — extremely valuable for visibility.

## BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "TypeScript Generics"
    }
  ]
}
```

The last item typically omits `item` (the URL) since it's the current page.

## Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dev Blog Inc.",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/devblog",
    "https://github.com/devblog",
    "https://linkedin.com/company/devblog"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-0100",
    "contactType": "customer service"
  }
}
```

## Rich Snippets

Rich snippets are enhanced search results powered by structured data:

| Schema Type | Rich Result Feature |
|-------------|-------------------|
| Article | Headline, image, date, author |
| Product | Price, availability, star rating |
| FAQPage | Expandable Q&A accordion |
| BreadcrumbList | Breadcrumb path navigation |
| Recipe | Cooking time, calories, rating |
| HowTo | Step-by-step with images |
| Event | Date, time, location, ticket price |
| Review | Star rating, reviewer |
| VideoObject | Video thumbnail, duration |

### Not All Schemas Guarantee Rich Results

Google decides whether to show rich results based on:
- Schema correctness and completeness
- Page quality and authority
- User search intent
- Spam policies

## Next.js Implementation

### Using Script Component

```typescript
import Script from 'next/script';

export default function ArticlePage({ post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.publishedAt,
  };

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* content */}</article>
    </>
  );
}
```

### Using metadata.other (Next.js 14+)

Next.js doesn't have a first-class JSON-LD API, but you can embed it directly in the page component as a `<script>` tag:

```typescript
export default function Page() {
  const jsonLd = { /* ... */ };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* page content */}
    </>
  );
}
```

## Testing & Validation

| Tool | Purpose |
|------|---------|
| [Google Rich Results Test](https://search.google.com/test/rich-results) | Test if schema qualifies for rich results |
| [Schema Markup Validator](https://validator.schema.org/) | Validate schema syntax |
| [Google Search Console](https://search.google.com/search-console) | Monitor rich result errors in production |

## Best Practices

### Do

- Use JSON-LD format (Google's recommendation)
- Include all required properties for each schema type
- Use ISO 8601 dates
- Match structured data to visible page content
- Test with Google Rich Results Test before deploying
- Use multiple schemas per page when appropriate

### Don't

- Don't add schema for content not visible on the page (spam)
- Don't use fake reviews or ratings
- Don't mark up content users can't see
- Don't use deprecated properties
- Don't forget to update structured data when page content changes

---

## Exercises

See `exercises.ts` for hands-on practice building JSON-LD generators for various Schema.org types.
