# Internationalization (i18n) SEO

## Table of Contents

1. [Introduction](#introduction)
2. [Hreflang Tags](#hreflang-tags)
3. [URL Structures for i18n](#url-structures-for-i18n)
4. [Locale-Based Routing in Next.js](#locale-based-routing-in-nextjs)
5. [Language Detection](#language-detection)
6. [Alternates in Metadata](#alternates-in-metadata)
7. [Hreflang Implementation](#hreflang-implementation)
8. [Common Hreflang Patterns](#common-hreflang-patterns)
9. [SEO Considerations](#seo-considerations)
10. [Best Practices](#best-practices)

---

## Introduction

International SEO ensures that search engines serve the right language/regional version of your content to the right users. This is critical for multi-language websites where the same content exists in different languages or targets different regions.

The primary mechanism is **hreflang tags**, which tell search engines about language and regional targeting of alternate pages.

## Hreflang Tags

Hreflang tags use the `link` element with `rel="alternate"` and `hreflang` attribute:

```html
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### Hreflang Syntax

```
hreflang="[language]-[region]"
```

| Example | Meaning |
|---------|---------|
| `en` | English (any region) |
| `en-US` | English (United States) |
| `en-GB` | English (United Kingdom) |
| `es` | Spanish (any region) |
| `es-MX` | Spanish (Mexico) |
| `zh-Hans` | Simplified Chinese |
| `zh-Hant` | Traditional Chinese |
| `x-default` | Default/fallback version |

### Language Codes

- Use ISO 639-1 language codes (2-letter): `en`, `es`, `fr`, `de`, `ja`
- Optionally add ISO 3166-1 alpha-2 region codes: `en-US`, `pt-BR`
- `x-default` is special — indicates the default/fallback page

### Where to Place Hreflang

1. **HTML `<head>`**: `<link>` elements (most common)
2. **HTTP headers**: For non-HTML files (PDFs)
3. **Sitemap**: `<xhtml:link>` elements in sitemap XML

## URL Structures for i18n

### Option 1: Subpath (Recommended)

```
https://example.com/en/page
https://example.com/es/page
https://example.com/fr/page
```

**Pros**: Single domain, easy to set up, shared domain authority
**Cons**: Less geo-targeting ability

### Option 2: Subdomain

```
https://en.example.com/page
https://es.example.com/page
https://fr.example.com/page
```

**Pros**: Can target regions in Search Console, separate servers
**Cons**: Treated as separate sites, diluted authority

### Option 3: Country-Code TLD

```
https://example.com/page      (default)
https://example.es/page       (Spain)
https://example.fr/page       (France)
```

**Pros**: Strongest geo-targeting signal, clear to users
**Cons**: Most expensive, hardest to maintain, separate domains

### Option 4: URL Parameters (Not Recommended)

```
https://example.com/page?lang=en
https://example.com/page?lang=es
```

**Cons**: Hard for search engines to parse, no geo-targeting, messy URLs

### Recommendation

**Subpath** is the best choice for most projects. It's the approach Next.js supports natively and keeps all authority on one domain.

## Locale-Based Routing in Next.js

### App Router (Next.js 13+)

Next.js App Router uses middleware for i18n routing:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'es', 'fr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  // Parse and match accept-language header
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### File Structure

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── blog/
│       └── [slug]/
│           └── page.tsx
```

## Language Detection

### Accept-Language Header

```
Accept-Language: en-US,en;q=0.9,es;q=0.8
```

Parse priority:
1. `en-US` (quality 1.0, implicit)
2. `en` (quality 0.9)
3. `es` (quality 0.8)

### Detection Strategy

1. Check URL for locale prefix
2. Check cookie for saved preference
3. Parse `Accept-Language` header
4. Fall back to default locale

### Important: Never Auto-Redirect Based on IP

Google specifically warns against IP-based redirects. Use `x-default` and let users choose their language.

## Alternates in Metadata

### Next.js Metadata API

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/en/about',
    languages: {
      'en': 'https://example.com/en/about',
      'es': 'https://example.com/es/about',
      'fr': 'https://example.com/fr/about',
      'x-default': 'https://example.com/about',
    },
  },
};
```

### Dynamic Alternates

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const locales = ['en', 'es', 'fr'];
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[locale] = `https://example.com/${locale}/${params.slug}`;
  }
  languages['x-default'] = `https://example.com/${params.slug}`;

  return {
    alternates: {
      canonical: `https://example.com/${params.locale}/${params.slug}`,
      languages,
    },
  };
}
```

## Hreflang Implementation

### In HTML Head

```html
<!-- On https://example.com/en/page -->
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### In Sitemap

```xml
<url>
  <loc>https://example.com/en/page</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/page" />
  <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/page" />
  <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/page" />
</url>
```

## Common Hreflang Patterns

### Language Only (No Region)

For content in one language serving all regions:
```
en → English for everyone
es → Spanish for everyone
```

### Language + Region

When content differs by region:
```
en-US → American English
en-GB → British English
es-ES → Spanish (Spain)
es-MX → Spanish (Mexico)
```

### Bidirectional Requirement

**Every page must reference all alternates, including itself.** If page A references page B, page B must reference page A.

```
Page /en/about links to → /en/about, /es/about, /fr/about
Page /es/about links to → /en/about, /es/about, /fr/about
Page /fr/about links to → /en/about, /es/about, /fr/about
```

## SEO Considerations

1. **Don't duplicate content without hreflang** — identical content in multiple locales without proper tags = duplicate content
2. **Translate metadata** — title, description should be in the target language
3. **Translate URL slugs** when possible (`/en/about` → `/es/acerca-de`)
4. **Use x-default** — always include it for the fallback page
5. **Regional sitemap** — include hreflang links in sitemap XML

## Best Practices

### Do

- Include `x-default` on every page
- Make hreflang bidirectional (all pages reference all alternates)
- Use subpath routing for most projects
- Translate page content, metadata, and URLs
- Use the Next.js `alternates.languages` metadata field
- Include hreflang in both HTML and sitemap

### Don't

- Don't auto-redirect based on IP/geo-location
- Don't use URL parameters for language switching
- Don't mix language and regional targeting without reason
- Don't forget self-referencing hreflang
- Don't use hreflang for content that isn't translated

---

## Exercises

See `exercises.ts` for hands-on practice implementing hreflang generators, locale URL builders, and alternate link resolvers.
