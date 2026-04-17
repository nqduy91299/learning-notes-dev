# Error Handling in Next.js

## Table of Contents
1. [Introduction](#1-introduction)
2. [error.tsx Boundaries](#2-errortsx-boundaries)
3. [not-found.tsx](#3-not-foundtsx)
4. [global-error.tsx](#4-global-errortsx)
5. [Error Recovery](#5-error-recovery)
6. [Try/Catch in Server Components](#6-trycatch-in-server-components)
7. [Error Logging](#7-error-logging)
8. [Error Propagation](#8-error-propagation)
9. [Error Types and Status Codes](#9-error-types-and-status-codes)
10. [Best Practices](#10-best-practices)

---

## 1. Introduction

Next.js App Router uses React Error Boundaries with special file conventions to handle errors at different levels of the component tree.

```typescript
const errorArchitecture = {
  'error.tsx': 'Catches errors in page.tsx and children (NOT sibling layout)',
  'not-found.tsx': 'Renders when notFound() is called',
  'global-error.tsx': 'Catches errors in root layout (last resort)',
  'try/catch': 'Direct error handling in Server Components',
};
```

---

## 2. error.tsx Boundaries

```typescript
// error.tsx must be a Client Component:
// "use client";
// export default function Error({ error, reset }) {
//   return <div><h2>Something went wrong</h2><button onClick={reset}>Try again</button></div>;
// }

const errorBoundaryRules = {
  must: '"use client" directive required',
  receives: '{ error: Error, reset: () => void }',
  catches: 'Errors from page.tsx and child segments',
  doesNotCatch: 'Errors from sibling layout.tsx (caught by parent error.tsx)',
  nesting: 'Inner error.tsx catches before outer ones',
};
```

---

## 3. not-found.tsx

```typescript
// import { notFound } from 'next/navigation';
// if (!data) notFound(); // Triggers not-found.tsx

const notFoundBehavior = {
  trigger: 'Calling notFound() function',
  rootLevel: 'app/not-found.tsx catches all unmatched URLs',
  segmentLevel: 'app/blog/not-found.tsx catches notFound() in blog segment',
  statusCode: '404',
};
```

---

## 4. global-error.tsx

```typescript
// Must wrap <html> and <body> tags (replaces root layout):
// "use client";
// export default function GlobalError({ error, reset }) {
//   return <html><body><h2>Fatal error</h2><button onClick={reset}>Retry</button></body></html>;
// }
```

---

## 5. Error Recovery

```typescript
const recoveryStrategies = {
  reset: 'error.tsx reset() function — re-renders the error boundary children',
  retry: 'User clicks retry → component re-renders, may re-fetch data',
  redirect: 'Redirect to safe page after error',
  fallback: 'Show degraded UI without the failing component',
};
```

---

## 6. Try/Catch in Server Components

```typescript
// async function ProductPage({ params }) {
//   try {
//     const product = await getProduct(params.id);
//     if (!product) notFound();
//     return <Product data={product} />;
//   } catch (error) {
//     // Log error, return fallback UI
//     return <div>Could not load product</div>;
//   }
// }
```

---

## 7. Error Logging

```typescript
const loggingPatterns = {
  server: 'console.error in Server Components logs to server terminal',
  client: 'error.tsx can send errors to monitoring service',
  instrumentation: 'instrumentation.ts for global error tracking setup',
};
```

---

## 8. Error Propagation

```typescript
const propagation = {
  rule1: 'Errors bubble up through the component tree',
  rule2: 'First error.tsx ancestor catches the error',
  rule3: 'If no error.tsx found, global-error.tsx catches it',
  rule4: 'Layout errors are caught by PARENT error.tsx, not sibling',
};
```

---

## 9. Error Types and Status Codes

```typescript
const errorTypes = {
  notFound: '404 — Resource not found',
  unauthorized: '401 — Authentication required',
  forbidden: '403 — Insufficient permissions',
  serverError: '500 — Internal server error',
  badRequest: '400 — Invalid input',
};
```

---

## 10. Best Practices

- Place error.tsx at meaningful boundaries (not every segment)
- Use try/catch for expected errors (DB queries, API calls)
- Use error.tsx for unexpected errors
- Always include a root not-found.tsx
- Include global-error.tsx as a last resort
- Log errors to a monitoring service
- Show user-friendly error messages
- Provide recovery options (retry, go home)

---

## Further Reading

- [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [not-found.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
