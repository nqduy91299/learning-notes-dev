# Dynamic Metadata in Next.js

## Table of Contents

1. [Introduction](#introduction)
2. [generateMetadata Function](#generatemetadata-function)
3. [Dynamic OG Images](#dynamic-og-images)
4. [Per-Page Metadata](#per-page-metadata)
5. [Metadata Inheritance](#metadata-inheritance)
6. [Template Patterns](#template-patterns)
7. [Metadata for Dynamic Routes](#metadata-for-dynamic-routes)
8. [ImageResponse API](#imageresponse-api)
9. [Metadata Merging Rules](#metadata-merging-rules)
10. [Performance Considerations](#performance-considerations)
11. [Best Practices](#best-practices)

---

## Introduction

Static metadata works for pages with fixed content, but most real-world applications need metadata that changes based on route parameters, database content, or user context. Next.js provides `generateMetadata` — an async function that resolves metadata at request time.

Dynamic metadata is essential for:
- Blog posts with unique titles and descriptions
- Product pages with specific OG images
- User profiles with personalized metadata
- Category pages with dynamic content

## generateMetadata Function

```typescript
import type { Metadata, ResolvingMetadata } from 'next';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.ogImage, ...previousImages],
    },
  };
}
```

### Key Characteristics

1. **Server-only**: Never runs on the client
2. **Async**: Can fetch data from APIs, databases
3. **Receives route info**: Same `params` and `searchParams` as the page
4. **Parent access**: Can read and extend parent layout metadata
5. **Request deduplication**: `fetch` calls are deduped with the page component
6. **Blocks rendering**: Page waits for metadata to resolve before streaming

### Function Signature

```typescript
type GenerateMetadata = (
  props: {
    params: Record<string, string>;
    searchParams: Record<string, string | string[] | undefined>;
  },
  parent: ResolvingMetadata
) => Promise<Metadata> | Metadata;
```

## Dynamic OG Images

Next.js supports generating OG images on-the-fly using the `ImageResponse` API (from `next/og`).

### Route Handler Approach

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'Default Title';

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
      }}>
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

### opengraph-image Convention

```typescript
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Blog post image';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);
  return new ImageResponse(
    (<div style={{ /* ... */ }}>{post.title}</div>),
    { ...size }
  );
}
```

## Per-Page Metadata

Each page/layout can export its own metadata:

```typescript
// app/page.tsx — Homepage
export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our site',
};

// app/blog/page.tsx — Blog listing
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles',
};

// app/blog/[slug]/page.tsx — Individual post
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  return { title: post.title, description: post.excerpt };
}
```

### Static vs Dynamic Decision

| Scenario | Use Static | Use generateMetadata |
|----------|:---:|:---:|
| Fixed page (About, Contact) | ✅ | ❌ |
| Blog post from CMS | ❌ | ✅ |
| Product from database | ❌ | ✅ |
| Dynamic route `[slug]` | ❌ | ✅ |
| Content depends on searchParams | ❌ | ✅ |

## Metadata Inheritance

Metadata flows from root layout → nested layouts → page, with each level able to override or extend.

### Inheritance Chain

```
app/layout.tsx
├── title.template: "%s | My Site"
├── description: "Default description"
├── openGraph.siteName: "My Site"
│
├── app/blog/layout.tsx
│   ├── title.template: "%s | Blog | My Site"
│   │
│   └── app/blog/[slug]/page.tsx
│       ├── title: "My Post"          → "My Post | Blog | My Site"
│       └── description: "Post desc"  → overrides parent
```

### Parent Access in generateMetadata

```typescript
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentImages = parentMetadata.openGraph?.images ?? [];

  return {
    openGraph: {
      images: ['/new-image.png', ...parentImages],
    },
  };
}
```

## Template Patterns

### Title Template

```typescript
// Root layout
export const metadata: Metadata = {
  title: {
    template: '%s | My Site',
    default: 'My Site — Web Development Blog',
    absolute: 'Custom Absolute Title', // Ignores template
  },
};
```

| Child Title | Result |
|-------------|--------|
| `"Blog"` | `"Blog \| My Site"` |
| `{ absolute: "Custom" }` | `"Custom"` (ignores template) |
| Not set | `"My Site — Web Development Blog"` (default) |

### Nested Templates

```typescript
// app/layout.tsx
{ title: { template: '%s | Site' } }

// app/blog/layout.tsx  
{ title: { template: '%s | Blog | Site' } }

// app/blog/[slug]/page.tsx
{ title: 'My Post' }  // → "My Post | Blog | Site"
```

The closest parent template wins.

## Metadata for Dynamic Routes

### Catch-all Routes

```typescript
// app/docs/[...slug]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}): Promise<Metadata> {
  const path = params.slug.join('/');
  const doc = await fetchDoc(path);
  return {
    title: doc.title,
    description: doc.description,
  };
}
```

### Parallel Routes

Each parallel route can have its own metadata, but only the page's metadata is used (not slot metadata).

### Route Groups

Route groups `(group)` don't affect metadata — only layouts and pages contribute.

## ImageResponse API

The `ImageResponse` constructor from `next/og` uses Vercel's Satori engine to convert JSX to images.

### Supported Styles

- Flexbox layout (`display: flex`)
- Basic text styling (fontSize, fontWeight, color)
- Backgrounds (solid, gradient)
- Borders and border-radius
- Basic positioning

### Limitations

- No CSS Grid
- Limited CSS properties
- No external stylesheets
- Custom fonts must be loaded explicitly
- Edge runtime only for best performance

### Loading Custom Fonts

```typescript
const font = await fetch(new URL('./font.ttf', import.meta.url))
  .then(res => res.arrayBuffer());

return new ImageResponse(jsx, {
  width: 1200,
  height: 630,
  fonts: [{ name: 'Custom', data: font, style: 'normal' }],
});
```

## Metadata Merging Rules

When child metadata is defined, it merges with parent metadata:

| Field | Behavior |
|-------|----------|
| `title` | Child overrides (or uses template) |
| `description` | Child overrides |
| `openGraph` | Shallow merge (child fields override) |
| `twitter` | Shallow merge |
| `robots` | Child overrides completely |
| `alternates` | Child overrides |
| `icons` | Child overrides |
| `other` | Shallow merge |

### Deep vs Shallow Merge

```typescript
// Parent
openGraph: { title: 'Parent', images: ['/parent.png'], siteName: 'Site' }

// Child
openGraph: { title: 'Child', images: ['/child.png'] }

// Result (shallow merge on openGraph)
openGraph: { title: 'Child', images: ['/child.png'], siteName: 'Site' }
```

## Performance Considerations

1. **Request deduplication**: `fetch` in `generateMetadata` is deduped with the same `fetch` in the page component
2. **Streaming**: Metadata blocks streaming — keep data fetching fast
3. **Caching**: Use `fetch` with `{ cache: 'force-cache' }` for static data
4. **Edge runtime**: Use for dynamic OG images to reduce latency
5. **Preloading**: Use `preload` pattern to start fetching before `generateMetadata` runs

### Preload Pattern

```typescript
import { getPost } from './data';

// Start fetching immediately
export function preload(slug: string) {
  void getPost(slug);
}

export async function generateMetadata({ params }) {
  preload(params.slug);
  const post = await getPost(params.slug);
  return { title: post.title };
}
```

## Best Practices

### Do

- Use `generateMetadata` for all dynamic routes
- Leverage title templates for consistent branding
- Access parent metadata to extend rather than replace
- Use `ImageResponse` for dynamic OG images
- Keep metadata fetching fast (use caching)
- Set `metadataBase` in root layout

### Don't

- Don't fetch heavy data just for metadata
- Don't duplicate fetching logic — rely on request dedup
- Don't forget default metadata in root layout
- Don't use `absolute` title unless you specifically need to bypass templates
- Don't set metadata in client components (not supported)

---

## Exercises

See `exercises.ts` for hands-on practice implementing metadata resolvers, template systems, and dynamic OG image configurations.
