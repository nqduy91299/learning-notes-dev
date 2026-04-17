# Intercepting Routes

## Table of Contents
1. [Introduction](#1-introduction)
2. [Conventions](#2-conventions)
3. [Modal Pattern](#3-modal-pattern)
4. [Soft vs Hard Navigation](#4-soft-vs-hard-navigation)
5. [Route Matching Rules](#5-route-matching-rules)
6. [Use Cases](#6-use-cases)
7. [Implementation Details](#7-implementation-details)
8. [Combining with Parallel Routes](#8-combining-with-parallel-routes)
9. [Best Practices](#9-best-practices)

---

## 1. Introduction

Intercepting routes allow you to load a route from another part of your application within the current layout. When a user clicks a link, the intercepted route renders (e.g., as a modal), but on direct URL access or refresh, the full page renders.

```typescript
const interceptingRoutes = {
  purpose: 'Show content in a different context based on navigation type',
  softNav: 'Intercepted route renders (modal, overlay, inline)',
  hardNav: 'Original full page renders',
  convention: '(.) (..) (..)(..) (...) prefixes on folder names',
};
```

---

## 2. Conventions

| Convention | Matches | Description |
|-----------|---------|-------------|
| `(.)` | Same level | Intercept sibling route |
| `(..)` | One level up | Intercept parent-level route |
| `(..)(..)` | Two levels up | Intercept grandparent-level route |
| `(...)` | Root level | Intercept from app root |

```
app/
├── feed/
│   ├── page.tsx
│   └── (.)photo/[id]/          ← Intercepts /photo/:id from /feed
│       └── page.tsx
├── photo/[id]/
│   └── page.tsx                ← Full page (direct access)
```

---

## 3. Modal Pattern

The most common use case: clicking a photo in a feed shows a modal, but the URL changes to `/photo/123`. Refreshing shows the full page.

---

## 4. Soft vs Hard Navigation

```typescript
const navigationBehavior = {
  softNavigation: {
    trigger: 'Link click, router.push()',
    behavior: 'Intercepting route renders',
    url: 'Changes to target URL',
    context: 'Previous page still visible behind modal',
  },
  hardNavigation: {
    trigger: 'Direct URL, refresh, bookmark',
    behavior: 'Original route renders (full page)',
    url: 'Same target URL',
    context: 'No interception, clean page load',
  },
};
```

---

## 5. Route Matching Rules

```typescript
// (.) matches at the ROUTE SEGMENT level, not filesystem level
// This is important because route groups don't count as segments:
// app/(group)/feed/(.)photo/[id]/page.tsx
// (.) matches photo at the same route segment level as feed, not filesystem level
```

---

## 6. Use Cases

- Photo/image galleries with modal preview
- Login modals that can also be standalone pages
- Product quick-view in e-commerce
- Comment preview overlays
- Share dialogs

---

## 7. Implementation Details

```typescript
const implementation = {
  step1: 'Create the full page route (e.g., /photo/[id])',
  step2: 'Create the intercepting route with convention prefix',
  step3: 'The intercepting route typically renders a modal/overlay',
  step4: 'The full route renders the standalone page',
  step5: 'Both routes share the same URL',
};
```

---

## 8. Combining with Parallel Routes

```typescript
// Best pattern: use @modal parallel slot + intercepting route
// app/
// ├── layout.tsx      ← renders { children, modal }
// ├── @modal/
// │   ├── default.tsx ← renders null (no modal)
// │   └── (.)photo/[id]/
// │       └── page.tsx ← modal content
// └── photo/[id]/
//     └── page.tsx     ← full page
```

---

## 9. Best Practices

- Always provide the full page as fallback
- Use with parallel routes for proper modal management
- Keep intercepted content lightweight (it overlays existing content)
- Handle browser back button properly
- Remember: interception breaks on refresh

---

## Further Reading

- [Intercepting Routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
