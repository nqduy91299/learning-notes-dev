# Middleware in Next.js

## Table of Contents

1. [Introduction](#1-introduction)
2. [Middleware Basics](#2-middleware-basics)
3. [NextRequest and NextResponse](#3-nextrequest-and-nextresponse)
4. [Path Matching](#4-path-matching)
5. [Redirects and Rewrites](#5-redirects-and-rewrites)
6. [Authentication Checks](#6-authentication-checks)
7. [Rate Limiting](#7-rate-limiting)
8. [Geolocation and Headers](#8-geolocation-and-headers)
9. [Middleware Chaining Pattern](#9-middleware-chaining-pattern)
10. [Edge Runtime](#10-edge-runtime)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

Next.js middleware runs **before** a request is completed. It sits between the incoming
request and the route handler/page, allowing you to modify the request or response.

```typescript
// middleware.ts (at project root, same level as app/)
// export function middleware(request: NextRequest) {
//   // Runs for every matched request
//   return NextResponse.next();
// }

const middlewareConcepts = {
  file: 'middleware.ts at project root',
  runs: 'Before route matching, on the Edge Runtime',
  scope: 'Applies to all routes by default (configurable via matcher)',
  uses: ['Auth checks', 'Redirects', 'Rewrites', 'Headers', 'Rate limiting', 'Logging'],
};
```

---

## 2. Middleware Basics

### 2.1 Structure

```typescript
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
//
// export function middleware(request: NextRequest) {
//   // Do something with the request
//   return NextResponse.next(); // Continue to the route
// }
//
// export const config = {
//   matcher: '/dashboard/:path*',
// };
```

### 2.2 Execution Order

```typescript
const executionOrder = [
  '1. headers from next.config.js',
  '2. redirects from next.config.js',
  '3. Middleware (rewrites, redirects, etc.)',
  '4. beforeFiles rewrites from next.config.js',
  '5. Filesystem routes (public/, _next/, pages/, app/)',
  '6. afterFiles rewrites from next.config.js',
  '7. Fallback rewrites from next.config.js',
];
```

---

## 3. NextRequest and NextResponse

### 3.1 NextRequest Properties

```typescript
const requestProperties = {
  cookies: 'request.cookies — get, set, delete cookies',
  nextUrl: 'request.nextUrl — URL with pathname, searchParams, basePath',
  geo: 'request.geo — { city, country, region, latitude, longitude }',
  ip: 'request.ip — client IP address',
  headers: 'request.headers — standard Headers object',
  method: 'request.method — HTTP method',
};
```

### 3.2 NextResponse Methods

```typescript
const responseMethods = {
  next: 'NextResponse.next() — continue to route (optionally modify headers)',
  redirect: 'NextResponse.redirect(url) — redirect to different URL',
  rewrite: 'NextResponse.rewrite(url) — serve different URL without changing browser URL',
  json: 'NextResponse.json(data) — return JSON response',
};
```

---

## 4. Path Matching

### 4.1 Config Matcher

```typescript
// Static paths:
// export const config = { matcher: '/dashboard' };

// Wildcards:
// export const config = { matcher: '/dashboard/:path*' };

// Multiple matchers:
// export const config = { matcher: ['/dashboard/:path*', '/api/:path*'] };

// Regex (negative lookahead to exclude):
// export const config = {
//   matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
// };

const matcherExamples = {
  exact: "'/about'",
  wildcard: "'/dashboard/:path*'",
  multiple: "['/api/:path*', '/admin/:path*']",
  excludeStatic: "'/((?!_next/static|_next/image|favicon.ico).*)'",
};
```

### 4.2 Conditional Logic in Middleware

```typescript
// Alternative to matcher: check pathname inside middleware
// export function middleware(request: NextRequest) {
//   if (request.nextUrl.pathname.startsWith('/api')) {
//     // Handle API routes
//   }
//   if (request.nextUrl.pathname.startsWith('/admin')) {
//     // Handle admin routes
//   }
// }
```

---

## 5. Redirects and Rewrites

### 5.1 Redirects

```typescript
// Changes the URL in the browser:
// return NextResponse.redirect(new URL('/login', request.url));

const redirectTypes = {
  temporary: 'NextResponse.redirect(url) — 307 by default',
  permanent: 'NextResponse.redirect(url, 308)',
  external: 'NextResponse.redirect("https://other-site.com")',
};
```

### 5.2 Rewrites

```typescript
// Serves different content without changing URL:
// return NextResponse.rewrite(new URL('/proxy-page', request.url));

const rewriteUses = [
  'A/B testing (serve different page versions)',
  'Feature flags',
  'Legacy URL compatibility',
  'Multi-tenant routing',
];
```

---

## 6. Authentication Checks

```typescript
// Common pattern: check for auth token and redirect if missing
// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('session-token')?.value;
//   if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
//   return NextResponse.next();
// }
```

---

## 7. Rate Limiting

```typescript
// Rate limiting in middleware (Edge Runtime compatible):
const rateLimitPattern = {
  strategy: 'Token bucket or sliding window',
  storage: 'Edge-compatible KV store or in-memory (per-instance)',
  headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};
```

---

## 8. Geolocation and Headers

```typescript
// Access geo data:
// const country = request.geo?.country || 'US';
// const city = request.geo?.city;

// Modify request headers (pass data to routes):
// const requestHeaders = new Headers(request.headers);
// requestHeaders.set('x-country', country);
// return NextResponse.next({ request: { headers: requestHeaders } });
```

---

## 9. Middleware Chaining Pattern

```typescript
// Next.js supports ONE middleware file, but you can compose handlers:
// type MiddlewareHandler = (req: NextRequest) => NextResponse | null;
//
// function chain(handlers: MiddlewareHandler[]) {
//   return (request: NextRequest) => {
//     for (const handler of handlers) {
//       const result = handler(request);
//       if (result) return result;
//     }
//     return NextResponse.next();
//   };
// }
```

---

## 10. Edge Runtime

```typescript
const edgeRuntime = {
  environment: 'V8 isolates (not Node.js)',
  restrictions: [
    'No fs module',
    'No child_process',
    'Limited Node.js APIs',
    'Max execution time (usually 30s on Vercel)',
  ],
  benefits: [
    'Cold start in ~0ms',
    'Deployed globally at edge locations',
    'Very fast execution',
  ],
};
```

---

## 11. Best Practices

- Keep middleware fast — it runs on every matched request
- Use the `matcher` config to limit scope
- Don't do heavy computation in middleware
- Use rewrites for A/B testing patterns
- Chain middleware handlers for organization
- Pass data via headers (not middleware-to-component props)
- Remember Edge Runtime limitations

---

## Further Reading

- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
