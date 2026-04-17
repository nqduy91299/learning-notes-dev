# Next.js

Hands-on learning with runnable mini-apps. Each chapter is a standalone Next.js project.

## How to Start a Chapter

```bash
cd 03-nextjs/01-fundamentals/app-router-basics
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npm run dev
```

## Chapters

### 01 - Fundamentals
| Topic | Description | Status |
|-------|-------------|--------|
| app-router-basics | File-based routing, page.tsx, layout.tsx, loading.tsx, error.tsx | Done |
| routing-and-layouts | Nested layouts, route groups, dynamic routes, catch-all routes | Done |
| server-vs-client | Server Components, Client Components, "use client", when to use which | Done |
| data-fetching | fetch in Server Components, SSR, SSG, ISR, generateStaticParams | Done |

### 02 - Intermediate
| Topic | Description | Status |
|-------|-------------|--------|
| api-routes | Route Handlers (GET, POST, etc.), request/response, streaming | Done |
| middleware | next.config middleware, redirects, rewrites, authentication checks | Done |
| authentication | NextAuth.js / Auth.js, session management, protected routes | Done |
| forms-and-mutations | Server Actions, useFormState, useFormStatus, optimistic updates | Done |
| error-handling | error.tsx, not-found.tsx, global error handling, error boundaries | Done |

### 03 - Advanced
| Topic | Description | Status |
|-------|-------------|--------|
| streaming-suspense | React Suspense, streaming SSR, loading UI, progressive rendering | Done |
| parallel-routes | @named slots, simultaneous rendering, independent loading | Done |
| intercepting-routes | (.) (..) (...) conventions, modal patterns | Done |
| server-actions | Form handling, mutations, revalidation, error handling | Done |
| caching-revalidation | Request memoization, data cache, full route cache, revalidatePath/Tag | Done |

### 04 - Deployment
| Topic | Description | Status |
|-------|-------------|--------|
| build-optimization | Bundle analysis, code splitting, dynamic imports, image optimization | Done |
| vercel-deployment | Vercel config, environment variables, preview deployments, edge runtime | Done |
