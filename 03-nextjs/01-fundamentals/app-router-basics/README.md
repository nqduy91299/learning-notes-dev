# App Router Basics

## Table of Contents

1. [Introduction](#1-introduction)
2. [File Conventions](#2-file-conventions)
3. [Route Segments](#3-route-segments)
4. [File-Based Routing](#4-file-based-routing)
5. [Route Groups](#5-route-groups)
6. [Layout Nesting](#6-layout-nesting)
7. [Special Files Deep Dive](#7-special-files-deep-dive)
8. [Colocation](#8-colocation)
9. [Route Resolution Algorithm](#9-route-resolution-algorithm)
10. [Best Practices](#10-best-practices)

---

## 1. Introduction

Next.js 13+ introduced the **App Router**, a fundamentally new routing paradigm built on
React Server Components. Unlike the Pages Router (`pages/` directory), the App Router uses
the `app/` directory and leverages a **file-convention system** where specific filenames
have special meaning.

The App Router provides:
- **Nested layouts** that persist across navigations
- **Server Components** by default (zero client JS for static content)
- **Streaming** with Suspense integration
- **Parallel routes** and **intercepting routes** for complex UI patterns
- **Colocated files** — components, tests, styles live alongside routes

```
app/
├── layout.tsx        ← Root layout (required)
├── page.tsx          ← Home page (/)
├── loading.tsx       ← Loading UI for /
├── error.tsx         ← Error boundary for /
├── not-found.tsx     ← 404 UI for /
├── about/
│   └── page.tsx      ← /about
├── blog/
│   ├── layout.tsx    ← Blog layout (wraps all /blog/* pages)
│   ├── page.tsx      ← /blog
│   └── [slug]/
│       └── page.tsx  ← /blog/:slug
└── (marketing)/
    ├── layout.tsx    ← Shared layout for marketing pages
    ├── pricing/
    │   └── page.tsx  ← /pricing
    └── features/
        └── page.tsx  ← /features
```

---

## 2. File Conventions

The App Router assigns special behavior to files based on their names:

### 2.1 `page.tsx` — Route UI

A route segment is only publicly accessible when it contains a `page.tsx` file.
This is the leaf component rendered for a given URL.

```typescript
// app/dashboard/page.tsx
// Accessible at /dashboard

// Conceptual representation (no JSX needed):
const DashboardPage = {
  type: 'page',
  route: '/dashboard',
  render: () => ({ title: 'Dashboard', content: 'Welcome to dashboard' }),
};
```

**Key rules:**
- Without `page.tsx`, a folder is just an organizational container
- `page.tsx` must default-export a React component
- It receives `params` and `searchParams` as props

### 2.2 `layout.tsx` — Shared UI

Layouts wrap child routes and **persist across navigations** (no re-render).

```typescript
// Conceptual layout nesting:
const routeTree = {
  layout: 'RootLayout',         // app/layout.tsx
  children: {
    '/dashboard': {
      layout: 'DashboardLayout', // app/dashboard/layout.tsx
      page: 'DashboardPage',     // app/dashboard/page.tsx
      children: {
        '/settings': {
          page: 'SettingsPage',   // app/dashboard/settings/page.tsx
        }
      }
    }
  }
};
// Rendering /dashboard/settings:
// RootLayout → DashboardLayout → SettingsPage
```

**Key rules:**
- The root `app/layout.tsx` is **required** — it replaces `_app.tsx` and `_document.tsx`
- Layouts receive a `children` prop (the child route or nested layout)
- Layout state is preserved during navigation

### 2.3 `loading.tsx` — Loading UI

Wraps `page.tsx` in a React Suspense boundary automatically.

```typescript
// When page.tsx has async data fetching:
// Next.js automatically renders loading.tsx while page.tsx resolves

const loadingBehavior = {
  route: '/dashboard',
  sequence: [
    'Render layout.tsx immediately',
    'Show loading.tsx as fallback',
    'Stream page.tsx content when ready',
    'Replace loading.tsx with page.tsx',
  ],
};
```

### 2.4 `error.tsx` — Error Boundary

Wraps `page.tsx` (and `loading.tsx`) in a React Error Boundary.

```typescript
// Error boundary hierarchy:
// layout.tsx
//   └── error.tsx (catches errors from page and children)
//        └── loading.tsx
//             └── page.tsx

// IMPORTANT: error.tsx does NOT catch errors in its sibling layout.tsx
// For that, you need the parent segment's error.tsx
```

**Key rules:**
- Must be a Client Component (`"use client"`)
- Receives `error` and `reset` props
- `reset()` attempts to re-render the error boundary's children

### 2.5 `not-found.tsx` — 404 UI

Triggered by calling `notFound()` from a page or layout.

```typescript
// Triggered programmatically:
// import { notFound } from 'next/navigation';
// if (!data) notFound();

// The root app/not-found.tsx catches all unmatched URLs
```

### 2.6 `template.tsx` — Re-mounting Layout

Like `layout.tsx`, but creates a **new instance** on every navigation.

```typescript
// layout.tsx:   state persists across navigations
// template.tsx: state resets on every navigation
// Use template.tsx when you need:
//   - Enter/exit animations
//   - useEffect on every navigation
//   - Per-page state reset
```

### 2.7 `default.tsx` — Parallel Route Fallback

Used with parallel routes (`@slot`). Rendered when Next.js cannot determine
the active state of a slot during a hard navigation.

### 2.8 `route.tsx` — API Route Handler

Defines a server-side API endpoint (covered in api-routes topic).

---

## 3. Route Segments

Each folder in the `app/` directory represents a **route segment** that maps to a
URL segment.

```
app/blog/[slug]/comments/page.tsx
     │    │       │
     │    │       └── Segment: "comments"
     │    └── Dynamic Segment: "[slug]"
     └── Segment: "blog"

URL: /blog/hello-world/comments
```

### 3.1 Static Segments

Plain folder names create static route segments:

```
app/about/page.tsx          → /about
app/blog/categories/page.tsx → /blog/categories
```

### 3.2 Dynamic Segments

Wrapped in square brackets:

| Pattern | Example | Matches |
|---------|---------|---------|
| `[slug]` | `app/blog/[slug]/page.tsx` | `/blog/hello` → `{ slug: "hello" }` |
| `[...slug]` | `app/docs/[...slug]/page.tsx` | `/docs/a/b/c` → `{ slug: ["a","b","c"] }` |
| `[[...slug]]` | `app/shop/[[...slug]]/page.tsx` | `/shop` or `/shop/a/b` |

### 3.3 Route Groups

Folders wrapped in parentheses `(name)` are **ignored** in the URL path:

```
app/(marketing)/about/page.tsx  → /about  (not /marketing/about)
app/(shop)/cart/page.tsx        → /cart
```

Use cases:
- Organize routes by feature without affecting URLs
- Apply different layouts to different route groups
- Create multiple root layouts

---

## 4. File-Based Routing

### 4.1 How Next.js Resolves Routes

When a request comes in, Next.js walks the file tree:

```typescript
// Simplified route resolution algorithm:
function resolveRoute(url: string, fileTree: FileTree): ResolvedRoute {
  const segments = url.split('/').filter(Boolean);
  let current = fileTree.root;
  const params: Record<string, string | string[]> = {};

  for (const segment of segments) {
    // Priority order:
    // 1. Exact static match
    // 2. Dynamic segment [param]
    // 3. Catch-all [...param]
    // 4. Optional catch-all [[...param]]

    if (current.children[segment]) {
      current = current.children[segment];
    } else if (current.dynamicChild) {
      params[current.dynamicChild.paramName] = segment;
      current = current.dynamicChild;
    } else if (current.catchAllChild) {
      params[current.catchAllChild.paramName] = [segment, ...remaining];
      current = current.catchAllChild;
      break;
    } else {
      return { status: 404 };
    }
  }

  if (!current.hasPage) return { status: 404 };
  return { status: 200, params, layouts: collectLayouts(current) };
}
```

### 4.2 Route Priority

When multiple routes could match, Next.js uses this priority:

1. **Static segments** — exact match wins
2. **Dynamic segments** — `[param]`
3. **Catch-all segments** — `[...param]`
4. **Optional catch-all** — `[[...param]]`

```
Given routes:
  app/blog/latest/page.tsx    → /blog/latest (static)
  app/blog/[slug]/page.tsx    → /blog/:slug  (dynamic)

Request: /blog/latest → matches static route (priority 1)
Request: /blog/hello  → matches dynamic route (priority 2)
```

---

## 5. Route Groups

Route groups `(name)` provide organizational structure without URL impact.

### 5.1 Organizing by Feature

```
app/
├── (marketing)/
│   ├── layout.tsx      ← Marketing layout
│   ├── about/page.tsx  ← /about
│   └── blog/page.tsx   ← /blog
├── (shop)/
│   ├── layout.tsx      ← Shop layout
│   ├── cart/page.tsx   ← /cart
│   └── products/page.tsx ← /products
└── layout.tsx          ← Root layout
```

### 5.2 Multiple Root Layouts

```
app/
├── (marketing)/
│   ├── layout.tsx   ← Has <html> and <body> tags
│   └── page.tsx     ← /
├── (app)/
│   ├── layout.tsx   ← Different <html> and <body>
│   └── dashboard/
│       └── page.tsx ← /dashboard
```

**Rules for multiple root layouts:**
- Each group must have its own `layout.tsx` with `<html>` and `<body>`
- Navigating between groups causes a full page reload
- The top-level `app/layout.tsx` is not needed

---

## 6. Layout Nesting

Layouts nest automatically based on the file tree hierarchy.

### 6.1 Nesting Model

```typescript
// File structure:
// app/layout.tsx
// app/dashboard/layout.tsx
// app/dashboard/settings/page.tsx

// Rendered component tree for /dashboard/settings:
const tree = {
  component: 'RootLayout',
  props: {
    children: {
      component: 'DashboardLayout',
      props: {
        children: {
          component: 'SettingsPage',
        }
      }
    }
  }
};
```

### 6.2 Layout Data Flow

```typescript
// Layouts CANNOT pass data down to children via props.
// Instead, use:
// 1. Shared data fetching (request deduplication)
// 2. React Context (client components only)
// 3. URL search params
// 4. Cookies/headers (server components)
```

### 6.3 Opting Out of Layout Nesting

Use route groups to break out of the layout hierarchy:

```
// Without route groups:
// /settings inherits DashboardLayout
app/dashboard/settings/page.tsx

// With route groups:
// /settings gets its own layout
app/(dashboard)/dashboard/page.tsx    ← uses DashboardLayout
app/(settings)/settings/page.tsx      ← uses SettingsLayout
```

---

## 7. Special Files Deep Dive

### 7.1 Rendering Order

When all special files exist in a segment, they compose in this order:

```typescript
const compositionOrder = {
  outermost: 'layout.tsx',
  next: 'template.tsx',
  next2: 'error.tsx',        // Error boundary
  next3: 'loading.tsx',      // Suspense boundary
  innermost: 'page.tsx',
};

// Equivalent pseudo-component tree:
// <Layout>
//   <Template>
//     <ErrorBoundary fallback={<Error />}>
//       <Suspense fallback={<Loading />}>
//         <Page />
//       </Suspense>
//     </ErrorBoundary>
//   </Template>
// </Layout>
```

### 7.2 Error Boundary Scope

```typescript
// error.tsx in a segment catches errors from:
// ✅ page.tsx in the same segment
// ✅ All child segments
// ❌ layout.tsx in the SAME segment (caught by parent's error.tsx)

// To catch root layout errors: use app/global-error.tsx
```

---

## 8. Colocation

The App Router allows colocating non-route files alongside routes:

```
app/dashboard/
├── page.tsx          ← Route (publicly accessible)
├── layout.tsx        ← Layout
├── loading.tsx       ← Loading UI
├── _components/      ← Private folder (convention: underscore prefix)
│   ├── Chart.tsx
│   └── Stats.tsx
├── utils.ts          ← Not a route (no page.tsx convention)
└── dashboard.test.ts ← Test file
```

**Rules:**
- Only `page.tsx` and `route.tsx` make a segment publicly accessible
- Use `_` prefix for private folders (convention, not enforced)
- Use route groups `()` for organization

---

## 9. Route Resolution Algorithm

### 9.1 Full Algorithm

```typescript
type RouteMatch = {
  page: string;
  layouts: string[];
  params: Record<string, string | string[]>;
  loading?: string;
  error?: string;
};

// 1. Split URL into segments
// 2. Walk the file tree, matching each segment
// 3. Collect all layouts along the path
// 4. Collect loading.tsx and error.tsx for each segment
// 5. Return the full match with all metadata
```

### 9.2 Parallel Route Resolution

With parallel routes (`@slot`), multiple routes resolve simultaneously:

```
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   └── page.tsx
└── @team/
    └── page.tsx

// layout.tsx receives: { children, analytics, team }
// All three render in parallel
```

---

## 10. Best Practices

### 10.1 File Organization

```
app/
├── (routes)/            ← All routes in a group
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       └── page.tsx
├── _components/         ← Shared components
├── _lib/                ← Utilities
└── _types/              ← TypeScript types
```

### 10.2 When to Create Layouts

- **Do** create layouts for shared navigation, sidebars, headers
- **Don't** create layouts for one-time wrappers (use components instead)
- **Do** use route groups to apply layouts to specific route subsets

### 10.3 Loading and Error Granularity

- Place `loading.tsx` at the most granular level needed
- Place `error.tsx` at boundaries where recovery makes sense
- Use `global-error.tsx` as a last resort catch-all

### 10.4 Naming Conventions

| Convention | Purpose |
|-----------|---------|
| `_folder` | Private folder (not included in routing) |
| `(group)` | Route group (URL not affected) |
| `[param]` | Dynamic segment |
| `[...param]` | Catch-all segment |
| `[[...param]]` | Optional catch-all |
| `@slot` | Named slot for parallel routes |
| `(.)segment` | Intercepting route (same level) |

---

## Further Reading

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components RFC](https://github.com/reactjs/rfcs/pull/188)
- [Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
