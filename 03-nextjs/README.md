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
| app-router-basics | File-based routing, page.tsx, layout.tsx, loading.tsx, error.tsx | Not Started |
| routing-and-layouts | Nested layouts, route groups, dynamic routes, catch-all routes | Not Started |
| server-vs-client | Server Components, Client Components, "use client", when to use which | Not Started |
| data-fetching | fetch in Server Components, SSR, SSG, ISR, generateStaticParams | Not Started |

### 02 - Intermediate
| Topic | Description | Status |
|-------|-------------|--------|
| api-routes | Route Handlers (GET, POST, etc.), request/response, streaming | Not Started |
| middleware | next.config middleware, redirects, rewrites, authentication checks | Not Started |
| authentication | NextAuth.js / Auth.js, session management, protected routes | Not Started |
| forms-and-mutations | Server Actions, useFormState, useFormStatus, optimistic updates | Not Started |
| error-handling | error.tsx, not-found.tsx, global error handling, error boundaries | Not Started |

### 03 - Advanced
| Topic | Description | Status |
|-------|-------------|--------|
| streaming-suspense | React Suspense, streaming SSR, loading UI, progressive rendering | Not Started |
| parallel-routes | @named slots, simultaneous rendering, independent loading | Not Started |
| intercepting-routes | (.) (..) (...) conventions, modal patterns | Not Started |
| server-actions | Form handling, mutations, revalidation, error handling | Not Started |
| caching-revalidation | Request memoization, data cache, full route cache, revalidatePath/Tag | Not Started |

### 04 - Deployment
| Topic | Description | Status |
|-------|-------------|--------|
| build-optimization | Bundle analysis, code splitting, dynamic imports, image optimization | Not Started |
| vercel-deployment | Vercel config, environment variables, preview deployments, edge runtime | Not Started |
