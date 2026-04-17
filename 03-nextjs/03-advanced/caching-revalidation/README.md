# Caching and Revalidation

## Table of Contents
1. [Introduction](#1-introduction)
2. [Four Caching Layers](#2-four-caching-layers)
3. [Request Memoization](#3-request-memoization)
4. [Data Cache](#4-data-cache)
5. [Full Route Cache](#5-full-route-cache)
6. [Router Cache](#6-router-cache)
7. [Cache Invalidation](#7-cache-invalidation)
8. [revalidatePath](#8-revalidatepath)
9. [revalidateTag](#9-revalidatetag)
10. [Time-Based Revalidation](#10-time-based-revalidation)
11. [On-Demand Revalidation](#11-on-demand-revalidation)
12. [Best Practices](#12-best-practices)

---

## 1. Introduction

Next.js has four layers of caching, each serving a different purpose. Understanding these layers is critical for building performant applications.

```typescript
const cachingLayers = {
  requestMemoization: { scope: 'Single request', where: 'Server', purpose: 'Deduplicate identical fetches within one render' },
  dataCache: { scope: 'Across requests', where: 'Server', purpose: 'Persist fetch results between requests' },
  fullRouteCache: { scope: 'Across requests', where: 'Server', purpose: 'Cache rendered HTML and RSC payload' },
  routerCache: { scope: 'Session', where: 'Client', purpose: 'Cache visited routes for instant back/forward navigation' },
};
```

---

## 2-11. [Detailed sections on each layer, invalidation, revalidation patterns]

```typescript
const revalidationMethods = {
  timeBased: "{ next: { revalidate: 60 } } — auto-revalidate after N seconds",
  pathBased: "revalidatePath('/posts') — invalidate specific route",
  tagBased: "revalidateTag('posts') — invalidate all fetches with tag",
  onDemand: 'Triggered by Server Actions, Route Handlers, or webhooks',
};
```

---

## 12. Best Practices

- Understand which cache layer is serving your data
- Use tags for fine-grained cache invalidation
- Use time-based revalidation for regularly updating content
- Use on-demand revalidation for user-triggered mutations
- Profile cache hit/miss rates
- Use no-store only when absolutely necessary

---

## Further Reading

- [Caching](https://nextjs.org/docs/app/building-your-application/caching)
