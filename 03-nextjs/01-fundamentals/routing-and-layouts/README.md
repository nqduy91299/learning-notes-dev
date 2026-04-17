# Routing and Layouts

## Table of Contents

1. [Introduction](#1-introduction)
2. [Nested Layouts](#2-nested-layouts)
3. [Route Groups](#3-route-groups)
4. [Dynamic Routes](#4-dynamic-routes)
5. [Catch-All Segments](#5-catch-all-segments)
6. [Optional Catch-All Segments](#6-optional-catch-all-segments)
7. [Parallel Routes](#7-parallel-routes)
8. [Intercepting Routes](#8-intercepting-routes)
9. [Route Matching Algorithm](#9-route-matching-algorithm)
10. [Params Extraction](#10-params-extraction)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

Next.js App Router provides a powerful file-system based routing mechanism that goes
far beyond simple path-to-page mapping. It supports dynamic segments, catch-all routes,
parallel rendering, and route interception — all through naming conventions.

```
app/
├── layout.tsx                    ← Root layout
├── page.tsx                      ← /
├── blog/
│   ├── page.tsx                  ← /blog
│   └── [slug]/
│       ├── page.tsx              ← /blog/:slug
│       └── comments/
│           └── page.tsx          ← /blog/:slug/comments
├── docs/
│   └── [...slug]/
│       └── page.tsx              ← /docs/* (catch-all)
├── shop/
│   └── [[...slug]]/
│       └── page.tsx              ← /shop or /shop/*
├── @modal/
│   └── (.)photo/[id]/
│       └── page.tsx              ← Intercepts /photo/:id
└── (marketing)/
    ├── layout.tsx                ← Marketing-specific layout
    ├── about/page.tsx            ← /about
    └── pricing/page.tsx          ← /pricing
```

---

## 2. Nested Layouts

Layouts in the App Router nest automatically based on the directory hierarchy.

### 2.1 How Nesting Works

```typescript
// File tree:
// app/layout.tsx         → RootLayout
// app/dashboard/layout.tsx → DashboardLayout
// app/dashboard/analytics/layout.tsx → AnalyticsLayout
// app/dashboard/analytics/page.tsx → AnalyticsPage

// URL: /dashboard/analytics
// Renders: RootLayout > DashboardLayout > AnalyticsLayout > AnalyticsPage
```

Each layout wraps its segment's children. The key insight is that layouts **persist
across navigations** within their subtree — navigating from `/dashboard/analytics`
to `/dashboard/settings` keeps `DashboardLayout` mounted.

### 2.2 Layout Props

```typescript
// Layouts receive children and params
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;  // Next.js 15+
}

// Conceptual representation:
const DashboardLayout = {
  type: 'layout',
  path: '/dashboard',
  slots: ['children'],
  render: (children: unknown, params: Record<string, string>) => ({
    sidebar: 'DashboardSidebar',
    content: children,
  }),
};
```

### 2.3 Shared State Across Routes

Since layouts don't re-mount on navigation:
- Form input state persists
- Scroll position in sidebars persists
- Fetched data doesn't re-fetch
- Animations continue uninterrupted

---

## 3. Route Groups

Route groups organize routes without affecting the URL structure.

### 3.1 Syntax

Wrap a folder name in parentheses: `(groupName)`

```
app/
├── (marketing)/
│   ├── layout.tsx      ← Marketing layout
│   ├── about/page.tsx  ← /about
│   └── blog/page.tsx   ← /blog
├── (shop)/
│   ├── layout.tsx      ← Shop layout
│   └── cart/page.tsx   ← /cart
```

### 3.2 Multiple Root Layouts

Route groups enable different root layouts for different sections:

```
app/
├── (public)/
│   ├── layout.tsx      ← Public root layout (must have <html>/<body>)
│   ├── page.tsx        ← /
│   └── about/page.tsx  ← /about
├── (app)/
│   ├── layout.tsx      ← App root layout (different <html>/<body>)
│   └── dashboard/
│       └── page.tsx    ← /dashboard
```

**Important:** Navigating between route groups with different root layouts causes
a full page reload.

### 3.3 Route Group Collision

```
// CONFLICT — both resolve to /about:
app/(marketing)/about/page.tsx
app/(info)/about/page.tsx
// This causes a build error!
```

---

## 4. Dynamic Routes

### 4.1 Single Dynamic Segment `[param]`

```typescript
// app/blog/[slug]/page.tsx
// Matches: /blog/hello-world → params = { slug: "hello-world" }
// Matches: /blog/123         → params = { slug: "123" }
// Does NOT match: /blog      → (handled by app/blog/page.tsx)
// Does NOT match: /blog/a/b  → (needs catch-all)

// Pattern matching representation:
const dynamicRoute = {
  pattern: '/blog/:slug',
  regex: /^\/blog\/([^/]+)$/,
  paramNames: ['slug'],
  extract: (url: string) => {
    const match = url.match(/^\/blog\/([^/]+)$/);
    return match ? { slug: match[1] } : null;
  },
};
```

### 4.2 Multiple Dynamic Segments

```typescript
// app/blog/[slug]/comments/[commentId]/page.tsx
// Matches: /blog/hello/comments/42
// params = { slug: "hello", commentId: "42" }

const multiDynamic = {
  pattern: '/blog/:slug/comments/:commentId',
  regex: /^\/blog\/([^/]+)\/comments\/([^/]+)$/,
  paramNames: ['slug', 'commentId'],
};
```

### 4.3 generateStaticParams

```typescript
// Pre-render dynamic routes at build time:
// export async function generateStaticParams() {
//   const posts = await getPosts();
//   return posts.map(post => ({ slug: post.slug }));
// }

// Conceptual representation:
const staticParams = {
  route: '/blog/[slug]',
  params: [
    { slug: 'hello-world' },
    { slug: 'nextjs-guide' },
    { slug: 'react-patterns' },
  ],
  // These pages are pre-rendered at build time (SSG)
};
```

---

## 5. Catch-All Segments

### 5.1 `[...param]` — Required Catch-All

```typescript
// app/docs/[...slug]/page.tsx

// Matches:
// /docs/getting-started        → { slug: ["getting-started"] }
// /docs/api/reference          → { slug: ["api", "reference"] }
// /docs/api/auth/providers     → { slug: ["api", "auth", "providers"] }

// Does NOT match:
// /docs                        → 404 (at least one segment required)

const catchAllRoute = {
  pattern: '/docs/:slug+',
  regex: /^\/docs\/(.+)$/,
  paramName: 'slug',
  extract: (url: string) => {
    const match = url.match(/^\/docs\/(.+)$/);
    return match ? { slug: match[1].split('/') } : null;
  },
};
```

### 5.2 Common Use Case: Documentation Sites

```typescript
// Map URL segments to documentation hierarchy:
// /docs/getting-started → docs/getting-started.mdx
// /docs/api/auth        → docs/api/auth.mdx
// /docs/api/auth/jwt    → docs/api/auth/jwt.mdx

const docResolver = {
  resolve: (slugs: string[]) => {
    const filePath = `docs/${slugs.join('/')}.mdx`;
    return filePath;
  },
};
```

---

## 6. Optional Catch-All Segments

### 6.1 `[[...param]]` — Optional Catch-All

```typescript
// app/shop/[[...slug]]/page.tsx

// Matches:
// /shop                        → { slug: undefined } or {}
// /shop/clothes                → { slug: ["clothes"] }
// /shop/clothes/shirts         → { slug: ["clothes", "shirts"] }
// /shop/clothes/shirts/xl      → { slug: ["clothes", "shirts", "xl"] }

const optionalCatchAll = {
  pattern: '/shop/:slug*',
  regex: /^\/shop(?:\/(.+))?$/,
  paramName: 'slug',
  extract: (url: string) => {
    const match = url.match(/^\/shop(?:\/(.+))?$/);
    if (!match) return null;
    return { slug: match[1] ? match[1].split('/') : undefined };
  },
};
```

### 6.2 Difference from Catch-All

| URL | `[...slug]` | `[[...slug]]` |
|-----|-------------|---------------|
| `/shop` | 404 | `{ slug: undefined }` |
| `/shop/a` | `{ slug: ["a"] }` | `{ slug: ["a"] }` |
| `/shop/a/b` | `{ slug: ["a","b"] }` | `{ slug: ["a","b"] }` |

---

## 7. Parallel Routes

### 7.1 Named Slots with `@`

Parallel routes render multiple pages simultaneously in the same layout.

```
app/
├── layout.tsx          ← Receives { children, team, analytics }
├── page.tsx            ← Default children slot
├── @team/
│   ├── page.tsx        ← /  (team slot content)
│   └── settings/
│       └── page.tsx    ← /settings (team slot content)
├── @analytics/
│   ├── page.tsx        ← / (analytics slot content)
│   └── default.tsx     ← Fallback for unmatched routes
```

```typescript
// Layout receives named slots as props:
interface DashboardLayoutProps {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}

// Conceptual rendering:
const parallelRoute = {
  url: '/',
  slots: {
    children: 'app/page.tsx',
    team: 'app/@team/page.tsx',
    analytics: 'app/@analytics/page.tsx',
  },
  layout: 'app/layout.tsx',
};
```

### 7.2 `default.tsx`

When navigating to a URL where a slot doesn't have a matching page,
Next.js renders `default.tsx` as the fallback.

```typescript
// URL: /settings
// Slot resolution:
// children  → app/settings/page.tsx (if exists) or app/default.tsx
// @team     → app/@team/settings/page.tsx (if exists) or app/@team/default.tsx
// @analytics → app/@analytics/settings/page.tsx (if exists) or app/@analytics/default.tsx
```

### 7.3 Independent Loading/Error States

Each slot can have its own `loading.tsx` and `error.tsx`:

```
app/@analytics/
├── page.tsx
├── loading.tsx    ← Shows while analytics loads
└── error.tsx      ← Catches analytics errors only
```

---

## 8. Intercepting Routes

### 8.1 Convention

Intercepting routes use `(.)`, `(..)`, `(..)(..)`, and `(...)` prefixes:

| Convention | Matches |
|-----------|---------|
| `(.)` | Same level |
| `(..)` | One level up |
| `(..)(..)` | Two levels up |
| `(...)` | From root |

### 8.2 Modal Pattern

```
app/
├── feed/
│   ├── page.tsx              ← Feed page with photo thumbnails
│   └── (.)photo/[id]/
│       └── page.tsx          ← Intercepts: shows modal overlay
├── photo/[id]/
│   └── page.tsx              ← Direct access: shows full page
```

```typescript
// Soft navigation from /feed:
// Click photo → URL becomes /photo/123 but renders (.)photo/[id]/ as modal
// Hard navigation to /photo/123 → renders photo/[id]/ as full page

const interceptingRoute = {
  trigger: 'soft-navigation-from-/feed',
  originalRoute: '/photo/123',
  interceptedBy: '/feed/(.)photo/123',
  result: 'modal overlay',
};
```

### 8.3 How Interception Works

```typescript
// Interception only applies during soft navigation (Link, router.push)
// Direct URL access (hard navigation) bypasses interception

const interceptionRules = {
  softNavigation: 'intercepting route renders',
  hardNavigation: 'original route renders',
  refresh: 'original route renders (interception lost)',
};
```

---

## 9. Route Matching Algorithm

### 9.1 Priority Order

When multiple routes could match a URL:

```typescript
const matchPriority = [
  '1. Exact static segments',
  '2. Dynamic segments [param]',
  '3. Catch-all segments [...param]',
  '4. Optional catch-all [[...param]]',
];

// Example:
// app/blog/latest/page.tsx     → priority 1 (static)
// app/blog/[slug]/page.tsx     → priority 2 (dynamic)
// app/blog/[...slug]/page.tsx  → priority 3 (catch-all)

// /blog/latest → matches static (priority 1)
// /blog/hello  → matches dynamic (priority 2)
// /blog/a/b/c  → matches catch-all (priority 3)
```

### 9.2 Full Matching Algorithm

```typescript
function matchRoute(url: string, routes: RouteDefinition[]): RouteMatch | null {
  const segments = url.split('/').filter(Boolean);

  // Phase 1: Try static match
  // Phase 2: Try dynamic segments
  // Phase 3: Try catch-all
  // Phase 4: Try optional catch-all

  // Each phase walks the segment tree depth-first
  // First complete match wins within each priority level
  return null;
}
```

---

## 10. Params Extraction

### 10.1 Single Params

```typescript
// Route: /blog/[slug]
// URL:   /blog/hello-world
// Params: { slug: "hello-world" }

// All params are strings (URL segments are always strings)
// You must parse them yourself:
// const id = parseInt(params.id);
```

### 10.2 Multiple Params

```typescript
// Route: /[lang]/blog/[slug]
// URL:   /en/blog/hello
// Params: { lang: "en", slug: "hello" }
```

### 10.3 Catch-All Params

```typescript
// Route: /docs/[...slug]
// URL:   /docs/api/auth/jwt
// Params: { slug: ["api", "auth", "jwt"] }

// Optional catch-all:
// Route: /shop/[[...categories]]
// URL:   /shop
// Params: {} (or { categories: undefined })
// URL:   /shop/electronics/phones
// Params: { categories: ["electronics", "phones"] }
```

### 10.4 Next.js 15 Async Params

```typescript
// In Next.js 15, params is a Promise:
// export default async function Page({
//   params,
// }: {
//   params: Promise<{ slug: string }>
// }) {
//   const { slug } = await params;
//   return <div>{slug}</div>;
// }
```

---

## 11. Best Practices

### 11.1 Route Organization

- Use route groups to separate concerns (marketing, app, auth)
- Keep dynamic segments as specific as possible
- Prefer `[slug]` over `[...slug]` when depth is known

### 11.2 Layout Strategy

- Create layouts at natural UI boundaries (sidebar, header changes)
- Don't create a layout for every route — use shared components instead
- Use templates when you need per-navigation state reset

### 11.3 Dynamic Route Validation

```typescript
// Always validate dynamic params:
// const slug = params.slug;
// if (!isValidSlug(slug)) notFound();

// Use generateStaticParams for known routes:
// This enables static generation and provides a list of valid params
```

### 11.4 Parallel Route Conventions

- Always provide `default.tsx` for parallel route slots
- Each slot should handle its own loading and error states
- Use parallel routes for dashboards, split views, modals

### 11.5 Intercepting Route Guidelines

- Use for modal patterns (photo galleries, login modals)
- Always provide the non-intercepted route as fallback
- Remember: interception only works with soft navigation

---

## Further Reading

- [Defining Routes](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
- [Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
