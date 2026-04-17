# Streaming and Suspense

## Table of Contents
1. [Introduction](#1-introduction)
2. [React Suspense](#2-react-suspense)
3. [Streaming SSR](#3-streaming-ssr)
4. [loading.tsx](#4-loadingtsx)
5. [Progressive Rendering](#5-progressive-rendering)
6. [Suspense Boundaries](#6-suspense-boundaries)
7. [Skeleton UI](#7-skeleton-ui)
8. [Nested Suspense](#8-nested-suspense)
9. [Streaming Patterns](#9-streaming-patterns)
10. [Best Practices](#10-best-practices)

---

## 1. Introduction

Streaming allows you to progressively render UI from the server. Instead of waiting for all data to load before sending any HTML, Next.js streams content to the client as it becomes available.

```typescript
const streamingConcepts = {
  traditional: 'Server fetches ALL data → renders ALL HTML → sends complete page',
  streaming: 'Server sends shell immediately → streams content as data resolves',
  benefit: 'Faster Time to First Byte (TTFB) and First Contentful Paint (FCP)',
  mechanism: 'React Suspense + HTTP streaming (Transfer-Encoding: chunked)',
};
```

---

## 2. React Suspense

```typescript
// <Suspense fallback={<Loading />}>
//   <SlowComponent />  {/* async Server Component */}
// </Suspense>

const suspenseModel = {
  purpose: 'Declarative loading states for async components',
  boundary: 'Wraps async components, shows fallback while loading',
  resolution: 'When all children resolve, replaces fallback with content',
  streaming: 'Fallback sent immediately, content streamed when ready',
};
```

---

## 3. Streaming SSR

```typescript
const streamingSSR = {
  step1: 'Server renders the shell (layout, Suspense fallbacks)',
  step2: 'Shell HTML sent to client immediately',
  step3: 'Client shows shell with loading states',
  step4: 'Server continues rendering async components',
  step5: 'Each resolved component streamed as HTML chunk',
  step6: 'Client replaces fallback with streamed content',
  step7: 'React hydrates streamed content',
};
```

---

## 4. loading.tsx

```typescript
// loading.tsx automatically wraps page.tsx in a Suspense boundary:
// Equivalent to:
// <Layout>
//   <Suspense fallback={<Loading />}>
//     <Page />
//   </Suspense>
// </Layout>

const loadingTsx = {
  automatic: 'Next.js wraps page.tsx in Suspense using loading.tsx as fallback',
  scope: 'Only wraps the page, not the layout',
  streaming: 'Layout renders immediately, page streams when ready',
};
```

---

## 5. Progressive Rendering

```typescript
const progressiveRendering = {
  concept: 'Render parts of the page as data becomes available',
  example: {
    immediate: 'Navigation, sidebar, page shell',
    fast: 'Product info (from fast API)',
    slow: 'Reviews, recommendations (from slow APIs)',
  },
  implementation: 'Wrap each section in its own Suspense boundary',
};
```

---

## 6. Suspense Boundaries

```typescript
// Multiple boundaries for granular loading:
// <Suspense fallback={<NavSkeleton />}>
//   <Navigation />
// </Suspense>
// <Suspense fallback={<ContentSkeleton />}>
//   <Content />
// </Suspense>
// <Suspense fallback={<SidebarSkeleton />}>
//   <Sidebar />
// </Suspense>

const boundaryStrategy = {
  granular: 'Each section loads independently',
  coarse: 'Entire page has one loading state',
  tradeoff: 'More boundaries = better UX but more complexity',
};
```

---

## 7. Skeleton UI

```typescript
const skeletonPatterns = {
  purpose: 'Show page structure while content loads',
  types: ['Pulse animation', 'Shimmer effect', 'Placeholder blocks'],
  principle: 'Match the layout of the final content',
};
```

---

## 8. Nested Suspense

```typescript
// Outer resolves first, inner streams later:
// <Suspense fallback={<PageSkeleton />}>
//   <PageShell>
//     <Suspense fallback={<DetailsSkeleton />}>
//       <SlowDetails />
//     </Suspense>
//   </PageShell>
// </Suspense>
```

---

## 9. Streaming Patterns

```typescript
const patterns = {
  parallelStreaming: 'Multiple Suspense boundaries resolve independently',
  sequentialStreaming: 'Nested Suspense — outer resolves before inner starts',
  asyncGenerators: 'Server streams data chunks progressively',
};
```

---

## 10. Best Practices

- Use loading.tsx for page-level loading states
- Add Suspense boundaries around slow data fetches
- Use skeleton UI that matches final layout
- Don't over-use Suspense (avoid layout shift)
- Place boundaries at meaningful UI sections
- Fetch data in parallel when possible

---

## Further Reading

- [Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
