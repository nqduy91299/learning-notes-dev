# Data Fetching in Next.js

## Table of Contents

1. [Introduction](#1-introduction)
2. [Fetch in Server Components](#2-fetch-in-server-components)
3. [Static Site Generation (SSG)](#3-static-site-generation-ssg)
4. [Server-Side Rendering (SSR)](#4-server-side-rendering-ssr)
5. [Incremental Static Regeneration (ISR)](#5-incremental-static-regeneration-isr)
6. [generateStaticParams](#6-generatestaticparams)
7. [Request Deduplication](#7-request-deduplication)
8. [The cache() Function](#8-the-cache-function)
9. [unstable_cache](#9-unstable_cache)
10. [Caching Strategies](#10-caching-strategies)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

Next.js App Router transforms data fetching by making it a first-class part of
the component model. Server Components can be `async`, allowing direct `await`
calls without `useEffect` or client-side fetching libraries.

```typescript
// The paradigm shift:
const oldWay = {
  approach: 'useEffect + useState in Client Component',
  steps: ['Mount component', 'Show loading', 'Fetch data', 'Update state', 'Re-render'],
  problems: ['Waterfall requests', 'Loading states', 'Client-side bundle size'],
};

const newWay = {
  approach: 'async Server Component with direct fetch',
  steps: ['Fetch data on server', 'Render HTML', 'Send to client'],
  benefits: ['No loading state needed', 'No client JS', 'Server-side caching'],
};
```

---

## 2. Fetch in Server Components

### 2.1 Direct Fetching

```typescript
// Server Components can fetch directly:
// async function ProductPage({ params }) {
//   const product = await fetch(`https://api.example.com/products/${params.id}`);
//   const data = await product.json();
//   return <div>{data.name}</div>;
// }

// Next.js extends the native fetch API with caching options:
const fetchOptions = {
  default: { cache: 'force-cache' },          // SSG behavior (cached)
  noStore: { cache: 'no-store' },              // SSR behavior (fresh every request)
  revalidate: { next: { revalidate: 60 } },   // ISR (revalidate after 60 seconds)
  tags: { next: { tags: ['products'] } },      // Tag-based revalidation
};
```

### 2.2 Extended fetch API

```typescript
// Next.js extends fetch with additional options:
const extendedFetch = {
  // Static (default) — cached at build time
  static: "fetch('https://...', { cache: 'force-cache' })",

  // Dynamic — fresh data every request
  dynamic: "fetch('https://...', { cache: 'no-store' })",

  // Time-based revalidation
  isr: "fetch('https://...', { next: { revalidate: 3600 } })",

  // Tag-based revalidation
  tagged: "fetch('https://...', { next: { tags: ['products'] } })",
};
```

---

## 3. Static Site Generation (SSG)

### 3.1 How SSG Works

```typescript
const ssgBehavior = {
  when: 'Build time (next build)',
  caching: 'HTML generated once, served from CDN',
  fetchOption: "{ cache: 'force-cache' }  // default",
  bestFor: 'Content that rarely changes (blog posts, docs, marketing pages)',
  regeneration: 'Only when you rebuild or use ISR',
};
```

### 3.2 Static Data Fetching Pattern

```typescript
// Conceptual representation:
const staticFetch = {
  buildTime: true,
  cached: true,
  fetchCall: "await fetch('https://api.example.com/posts')",
  result: 'HTML generated at build, served from edge/CDN',
  clientJS: 'none (Server Component)',
};
```

---

## 4. Server-Side Rendering (SSR)

### 4.1 How SSR Works

```typescript
const ssrBehavior = {
  when: 'Every request',
  caching: 'No caching — fresh data each time',
  fetchOption: "{ cache: 'no-store' }",
  bestFor: 'Personalized content, real-time data, authenticated pages',
  performance: 'Slower than SSG (server must render each request)',
};
```

### 4.2 Opting into SSR

```typescript
// Any of these opt a route into dynamic rendering:
const dynamicTriggers = [
  "fetch('...', { cache: 'no-store' })",
  'Using cookies() or headers()',
  'Using searchParams in a page',
  'Using dynamic = "force-dynamic" export',
  'Using revalidate = 0',
];
```

---

## 5. Incremental Static Regeneration (ISR)

### 5.1 How ISR Works

```typescript
const isrBehavior = {
  initial: 'Static page generated at build time',
  serving: 'Cached page served until revalidation time',
  revalidation: {
    step1: 'After revalidate period, next request still gets cached page',
    step2: 'Next.js regenerates page in background',
    step3: 'New page replaces old cached version',
    step4: 'Subsequent requests get the new page',
  },
  staleWhileRevalidate: 'Users always get instant response (cached or fresh)',
};
```

### 5.2 Time-Based Revalidation

```typescript
// Option 1: Per-fetch revalidation
// fetch('https://...', { next: { revalidate: 3600 } })  // 1 hour

// Option 2: Route segment config
// export const revalidate = 3600;  // All fetches in this route revalidate after 1 hour

// The LOWEST revalidate value in a route wins:
const revalidationRules = {
  fetchA: { revalidate: 60 },
  fetchB: { revalidate: 3600 },
  routeRevalidate: 'min(60, 3600) = 60 seconds',
};
```

### 5.3 On-Demand Revalidation

```typescript
// Programmatic revalidation (e.g., after a CMS update):
// import { revalidatePath, revalidateTag } from 'next/cache';
//
// revalidatePath('/blog');                // Revalidate a specific path
// revalidateTag('posts');                 // Revalidate all fetches with this tag

const onDemandRevalidation = {
  byPath: "revalidatePath('/blog')",
  byTag: "revalidateTag('posts')",
  trigger: 'Webhook, Server Action, or API Route',
};
```

---

## 6. generateStaticParams

### 6.1 Pre-rendering Dynamic Routes

```typescript
// export async function generateStaticParams() {
//   const posts = await getPosts();
//   return posts.map(post => ({ slug: post.slug }));
// }

const generateStaticParamsPattern = {
  purpose: 'Pre-render dynamic routes at build time',
  placement: 'In the same file as the dynamic page',
  returns: 'Array of param objects',
  example: {
    route: '/blog/[slug]',
    generated: [
      { slug: 'hello-world' },
      { slug: 'next-js-guide' },
    ],
    result: 'Static pages: /blog/hello-world, /blog/next-js-guide',
  },
};
```

### 6.2 Dynamic Params

```typescript
// Control behavior for params NOT returned by generateStaticParams:
// export const dynamicParams = true;   // Generate on-demand (default)
// export const dynamicParams = false;  // Return 404 for unknown params

const dynamicParamsBehavior = {
  true: 'Unknown params generate pages on-demand (SSR), then cache',
  false: 'Unknown params return 404',
};
```

---

## 7. Request Deduplication

### 7.1 Automatic Fetch Deduplication

```typescript
// Next.js automatically deduplicates identical fetch requests
// within a single server render:

const deduplication = {
  scenario: 'Layout and Page both fetch the same API',
  behavior: 'Only ONE actual HTTP request is made',
  scope: 'Single server render (same request)',
  mechanism: 'Extended fetch with automatic memoization',
  requirements: 'Same URL and same options',
};

// Example:
// layout.tsx:  const user = await fetch('/api/user');  // Request #1
// page.tsx:    const user = await fetch('/api/user');  // Deduped — uses #1's result
// Result: Only 1 HTTP request made
```

### 7.2 When Deduplication Doesn't Work

```typescript
const noDedupe = [
  'Different URLs (even slightly different)',
  'Different fetch options',
  'POST requests (only GET is deduped)',
  'Different server renders (different page visits)',
  'Route Handlers (not deduped by default)',
];
```

---

## 8. The cache() Function

### 8.1 React cache()

```typescript
// import { cache } from 'react';
// const getUser = cache(async (id: string) => {
//   const res = await fetch(`/api/users/${id}`);
//   return res.json();
// });

const reactCache = {
  purpose: 'Memoize function results within a single render',
  scope: 'Per-request (server render)',
  useCase: 'When using non-fetch data sources (database queries, etc.)',
  difference: 'fetch is auto-deduped; cache() is for non-fetch functions',
};
```

### 8.2 cache() vs fetch deduplication

```typescript
const comparison = {
  fetchDedupe: {
    automatic: true,
    scope: 'per-request',
    works_with: 'fetch() calls only',
  },
  reactCache: {
    automatic: false,
    scope: 'per-request',
    works_with: 'any async function',
    must_wrap: 'Wrap the function with cache()',
  },
};
```

---

## 9. unstable_cache

### 9.1 Cross-Request Caching

```typescript
// import { unstable_cache } from 'next/cache';
//
// const getCachedUser = unstable_cache(
//   async (id: string) => db.users.findOne(id),
//   ['user-cache'],                    // cache key
//   { revalidate: 3600, tags: ['users'] }  // options
// );

const unstableCachePattern = {
  purpose: 'Cache non-fetch data ACROSS requests (persistent)',
  scope: 'Across multiple requests (like Data Cache for fetch)',
  useCase: 'Database queries, expensive computations',
  options: {
    revalidate: 'Time in seconds before re-running the function',
    tags: 'Tags for on-demand revalidation',
  },
};
```

---

## 10. Caching Strategies

### 10.1 Decision Matrix

```typescript
const cachingDecision = {
  'Static content (blog, docs)': {
    strategy: 'SSG',
    fetch: "{ cache: 'force-cache' }",
    revalidate: 'On rebuild or ISR',
  },
  'Frequently updated (products, prices)': {
    strategy: 'ISR',
    fetch: "{ next: { revalidate: 60 } }",
    revalidate: 'Time-based + on-demand',
  },
  'Real-time (dashboard, feed)': {
    strategy: 'SSR',
    fetch: "{ cache: 'no-store' }",
    revalidate: 'Every request',
  },
  'User-specific (profile, settings)': {
    strategy: 'SSR',
    fetch: "{ cache: 'no-store' }",
    revalidate: 'Every request (personalized)',
  },
};
```

### 10.2 Mixing Strategies

```typescript
// A single page can use multiple strategies:
const mixedStrategies = {
  layout: 'SSG (static navigation)',
  productInfo: 'ISR with 1 hour revalidation',
  reviewCount: 'SSR (always fresh)',
  recommendations: 'ISR with 5 minute revalidation',
};
// The route becomes dynamic if ANY fetch uses no-store
```

---

## 11. Best Practices

### 11.1 Fetch at the Component Level

```typescript
// DO: Fetch data in the component that needs it
// DON'T: Fetch everything at the top and prop-drill down
// Why: Request deduplication makes repeated fetches efficient
```

### 11.2 Use Appropriate Cache Strategy

- Default to static (SSG) when possible
- Use ISR for content that updates periodically
- Use SSR only when data must be fresh every request
- Tag fetches for targeted revalidation

### 11.3 Error Handling

```typescript
const fetchErrorHandling = {
  pattern1: 'Check response.ok in fetch calls',
  pattern2: 'Use error.tsx boundaries for fetch failures',
  pattern3: 'Use notFound() for missing resources',
  pattern4: 'Try/catch in Server Components',
};
```

### 11.4 Performance Tips

- Use `Promise.all()` for parallel data fetching
- Avoid sequential waterfall fetches
- Use Suspense boundaries for streaming
- Pre-render known dynamic routes with `generateStaticParams`

---

## Further Reading

- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Revalidating](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)
