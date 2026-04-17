# Parallel Routes

## Table of Contents
1. [Introduction](#1-introduction)
2. [Named Slots](#2-named-slots)
3. [Simultaneous Rendering](#3-simultaneous-rendering)
4. [Independent Loading/Error States](#4-independent-loadingerror-states)
5. [default.tsx](#5-defaulttsx)
6. [Conditional Routes](#6-conditional-routes)
7. [Modal Pattern with Parallel Routes](#7-modal-pattern)
8. [Navigation Behavior](#8-navigation-behavior)
9. [Best Practices](#9-best-practices)

---

## 1. Introduction

Parallel routes allow you to simultaneously render multiple pages in the same layout using named slots (`@slotName`). Each slot can have independent loading and error states.

```typescript
const parallelRoutes = {
  syntax: '@slotName folder convention',
  purpose: 'Render multiple pages simultaneously in one layout',
  useCases: ['Dashboards', 'Split views', 'Modals', 'Conditional content'],
  slots: 'Layout receives named slots as props alongside children',
};

// app/
// ├── layout.tsx        ← receives { children, team, analytics }
// ├── page.tsx          ← children slot
// ├── @team/
// │   ├── page.tsx      ← team slot
// │   └── default.tsx   ← fallback
// └── @analytics/
//     ├── page.tsx      ← analytics slot
//     └── default.tsx   ← fallback
```

---

## 2. Named Slots

```typescript
// Layout receives slots as props:
// export default function Layout({ children, team, analytics }) {
//   return (
//     <div>
//       <div>{children}</div>
//       <div>{team}</div>
//       <div>{analytics}</div>
//     </div>
//   );
// }

const slotRules = {
  naming: '@name creates a slot named "name" as a prop',
  children: 'Default children prop is an implicit slot (no @ needed)',
  nesting: 'Slots can have their own layouts, loading, error files',
  url: '@slots do NOT affect the URL — invisible in routing',
};
```

---

## 3. Simultaneous Rendering

Each slot renders independently and in parallel. If one slot is slow, others are not blocked.

---

## 4. Independent Loading/Error States

```
app/@analytics/
├── page.tsx      ← analytics content
├── loading.tsx   ← shows while analytics loads
└── error.tsx     ← catches analytics-only errors
```

---

## 5. default.tsx

```typescript
const defaultTsx = {
  purpose: 'Fallback when slot cannot determine active state',
  when: 'Hard navigation to a URL where the slot has no matching page',
  softNav: 'During soft navigation, slots maintain their previously active state',
  hardNav: 'During hard navigation (refresh), default.tsx renders if no match',
};
```

---

## 6. Conditional Routes

```typescript
// Render different content based on auth state:
// export default function Layout({ children, auth, app }) {
//   const isLoggedIn = checkAuth();
//   return isLoggedIn ? app : auth;
// }
```

---

## 7. Modal Pattern

```
app/
├── layout.tsx
├── page.tsx           ← main content
├── @modal/
│   ├── default.tsx    ← renders nothing (no modal)
│   └── (.)photo/[id]/
│       └── page.tsx   ← intercepting route renders modal
└── photo/[id]/
    └── page.tsx       ← full page for direct access
```

---

## 8. Navigation Behavior

- Soft navigation: slots maintain their state, only matching slot updates
- Hard navigation: all slots re-render, unmatched slots show default.tsx

---

## 9. Best Practices

- Always provide default.tsx for parallel route slots
- Use parallel routes for independent sections of a page
- Leverage independent loading/error states per slot
- Use for modals, dashboards, and conditional rendering

---

## Further Reading

- [Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
