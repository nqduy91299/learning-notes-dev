# Next.js Patterns in TypeScript

Next.js is a React framework that adds server-side rendering, file-based
routing, API routes, middleware, and more. The **patterns** it uses are
general software engineering concepts that can be understood and practiced
without a browser.

This module explains each pattern conceptually and shows how our exercises
simulate them in pure TypeScript running in Node.js with `npx tsx`.

---

## Table of Contents

1. [Layout Pattern](#1-layout-pattern)
2. [Middleware Pattern](#2-middleware-pattern)
3. [API Route Patterns](#3-api-route-patterns)
4. [Data Fetching Patterns](#4-data-fetching-patterns)
5. [Parallel Data Fetching](#5-parallel-data-fetching)
6. [Cache Patterns](#6-cache-patterns)
7. [Route Grouping](#7-route-grouping)
8. [Server Actions Concept](#8-server-actions-concept)
9. [How We Simulate These in Pure TS](#9-how-we-simulate-these-in-pure-ts)

---

## 1. Layout Pattern

### Concept

In Next.js App Router, **layouts** are UI that wraps child routes. Layouts
persist across navigations - they don't re-render when you navigate between
sibling routes. Layouts nest: a root layout wraps all pages, a section layout
wraps pages in that section.

### How It Works in Next.js

```
app/
  layout.tsx          ← Root layout (wraps everything)
  page.tsx            ← Home page
  dashboard/
    layout.tsx        ← Dashboard layout (nested inside root)
    page.tsx          ← Dashboard home
    settings/
      page.tsx        ← Settings (wrapped by both layouts)
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>Site Nav</nav>
        {children}
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <aside>Dashboard Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
```

### Core Idea

- Layouts are **composable wrappers** that nest automatically based on the
  file system hierarchy
- A page's final output = RootLayout(DashboardLayout(Page))
- This is function composition: `f(g(x))`

### Pure TS Simulation

Functions that wrap content strings, composed by a resolver that walks the
route path and applies each layout.

---

## 2. Middleware Pattern

### Concept

Next.js middleware runs **before** a request is completed. It can modify the
request, redirect, rewrite, set headers, or return a response directly. It
sits between the incoming request and the route handler.

### How It Works in Next.js

```ts
// middleware.ts (at project root)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  const response = NextResponse.next();
  response.headers.set('x-request-id', crypto.randomUUID());
  return response;
}

export const config = { matcher: ['/dashboard/:path*'] };
```

### Core Idea

- A **pipeline** of functions that process a request/response
- Each middleware can: pass through, modify, redirect, or short-circuit
- This is the **chain of responsibility** pattern
- Multiple concerns (auth, logging, rate limiting) compose as a pipeline

### Pure TS Simulation

A chain of functions that each receive a request object and either return a
response or call `next()` to pass to the next handler.

---

## 3. API Route Patterns

### Concept

Next.js API routes (App Router) export functions for each HTTP method. They
receive a `Request` and return a `Response`. Common patterns include handler
composition, error handling wrappers, and input validation.

### How It Works in Next.js

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Handler Composition Pattern

```ts
// Wrapping handlers with error handling + auth
function withAuth(handler: Handler): Handler {
  return async (req) => {
    const token = req.headers.get('authorization');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req);
  };
}

function withErrorHandling(handler: Handler): Handler {
  return async (req) => {
    try {
      return await handler(req);
    } catch (e) {
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  };
}

// Compose: withErrorHandling(withAuth(handler))
export const GET = withErrorHandling(withAuth(async (req) => {
  const data = await fetchData();
  return NextResponse.json(data);
}));
```

### Core Idea

- Route handlers are **functions** that map Request -> Response
- **Handler composition** (wrapping handlers) is essentially the HOC pattern
  applied to server functions
- Validation, auth, error handling are cross-cutting concerns added via wrappers

---

## 4. Data Fetching Patterns

### Concept

Next.js App Router uses **Server Components** by default. Components can be
`async` and fetch data directly. There are distinct patterns for handling
loading states and errors.

### How It Works in Next.js

```tsx
// Server Component - fetches data directly
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetchUser(userId);  // runs on server
  return <div>{user.name}</div>;
}

// loading.tsx - shown while the page component is loading
export default function Loading() {
  return <Skeleton />;
}

// error.tsx - shown when the page component throws
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div>Error: {error.message} <button onClick={reset}>Retry</button></div>;
}
```

### Core Idea

- Data fetching colocated with the component that needs it
- **Loading states** are separate UI shown during async operations
- **Error boundaries** catch and display errors with retry capability
- The framework handles the async orchestration

### Pure TS Simulation

Async functions with try/catch that return `{ status, data?, error? }` result
objects representing loading/success/error states.

---

## 5. Parallel Data Fetching

### Concept

When multiple independent data requests are needed, fetch them **in parallel**
rather than sequentially (waterfall). Next.js encourages this by letting you
start multiple fetches simultaneously.

### How It Works in Next.js

```tsx
// BAD - sequential (waterfall)
async function Dashboard() {
  const user = await fetchUser();      // waits...
  const posts = await fetchPosts();    // then waits...
  const analytics = await fetchAnalytics(); // then waits...
  return <div>...</div>;
}

// GOOD - parallel
async function Dashboard() {
  const [user, posts, analytics] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchAnalytics(),
  ]);
  return <div>...</div>;
}
```

### With Partial Results (Promise.allSettled)

```ts
const results = await Promise.allSettled([
  fetchUser(),
  fetchPosts(),
  fetchAnalytics(),
]);
// Each result is { status: 'fulfilled', value } or { status: 'rejected', reason }
// Render what succeeded, show errors for what failed
```

### Core Idea

- Sequential: total time = sum of all fetch times
- Parallel: total time = max of all fetch times
- `Promise.all` for all-or-nothing
- `Promise.allSettled` for partial success
- This is not Next.js-specific but Next.js docs emphasize it heavily

---

## 6. Cache Patterns

### Concept

Next.js extends `fetch` with caching options. Understanding cache strategies
is critical for performance.

### Cache Strategies

```ts
// 1. Cache-first (default in Next.js for static data)
fetch('https://api.example.com/data', { cache: 'force-cache' });

// 2. No cache (always fresh)
fetch('https://api.example.com/data', { cache: 'no-store' });

// 3. Time-based revalidation
fetch('https://api.example.com/data', { next: { revalidate: 60 } });
```

### Stale-While-Revalidate (SWR)

```
1. Return cached data immediately (stale)
2. Fetch fresh data in the background (revalidate)
3. Replace cached data when fresh data arrives
4. Next request gets fresh data
```

This is the core idea behind the `swr` library and Next.js ISR (Incremental
Static Regeneration).

### Core Idea

- **Cache-first**: fast, but may serve stale data
- **Network-first**: always fresh, but slower
- **SWR**: best of both - fast response + eventual freshness
- **Time-based**: revalidate after N seconds
- Cache keys are typically derived from the request URL/params

### Pure TS Simulation

A cache store with TTL (time-to-live), implementing get/set with expiry
checks and background revalidation.

---

## 7. Route Grouping

### Concept

Next.js uses the filesystem for routing. Route groups (folders wrapped in
parentheses) organize routes **without affecting the URL path**.

### How It Works in Next.js

```
app/
  (marketing)/
    about/page.tsx      → /about
    blog/page.tsx       → /blog
  (shop)/
    products/page.tsx   → /products
    cart/page.tsx       → /cart
  (auth)/
    login/page.tsx      → /login
    register/page.tsx   → /register
```

Each group can have its own layout:

```
(marketing)/layout.tsx   → marketing pages share a layout
(shop)/layout.tsx        → shop pages share a different layout
```

### Core Idea

- Groups are an **organizational** mechanism, not a routing one
- They allow different layouts for different sections
- The URL path ignores the group folder name
- This is essentially **namespace/tagging** for routes

### Pure TS Simulation

A route registry where routes have group metadata that affects which layout
is applied but doesn't change the path.

---

## 8. Server Actions Concept

### Concept

Server Actions are async functions that run **on the server** but can be
called from client components. They're used for form submissions, data
mutations, and other server-side operations.

### How It Works in Next.js

```tsx
// actions.ts
'use server';

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string;
  await db.todos.create({ data: { title } });
  revalidatePath('/todos');
}

// In a client component
<form action={createTodo}>
  <input name="title" />
  <button type="submit">Add</button>
</form>
```

### Core Idea

- Functions marked with `'use server'` become **RPC endpoints** automatically
- The framework handles serialization, network transport, error handling
- They're essentially **type-safe API endpoints** without manually defining
  routes
- Conceptually: `clientCall(args) → network → serverFunction(args) → result → network → client`

### Pure TS Simulation

Functions that simulate the server boundary: serialize inputs, process on
"server side", return serialized results. Validate inputs, handle errors.

---

## 9. How We Simulate These in Pure TS

| Next.js Concept       | Pure TS Equivalent                           |
|-----------------------|----------------------------------------------|
| Layout                | Function wrapper composing strings/objects   |
| Middleware            | Function pipeline (chain of responsibility)  |
| API Route             | Function: Request object → Response object   |
| Server Component      | Async function returning data                |
| Loading/Error states  | Result type: `{ status, data?, error? }`     |
| Parallel fetch        | `Promise.all` / `Promise.allSettled`         |
| Cache                 | Map with TTL logic                           |
| Route groups          | Route registry with group metadata           |
| Server Action         | Validated async function with serialization  |

---

## Key Takeaways

1. **Layouts** are composable wrappers - function composition
2. **Middleware** is a request/response pipeline - chain of responsibility
3. **API routes** are functions composed with wrappers for cross-cutting concerns
4. **Data fetching** should be parallel when possible; handle loading/error states
5. **Caching** strategies (cache-first, SWR, time-based) are critical for performance
6. **Route groups** organize code without affecting URLs
7. **Server Actions** are type-safe RPC - function calls that cross a network boundary

These patterns exist outside Next.js. Understanding them lets you apply the
same ideas in any server framework (Express, Fastify, Hono, etc.).
