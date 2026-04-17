# Authentication in Next.js

## Table of Contents

1. [Introduction](#1-introduction)
2. [NextAuth.js / Auth.js Overview](#2-nextauthjs--authjs-overview)
3. [Session Management](#3-session-management)
4. [JWT vs Database Sessions](#4-jwt-vs-database-sessions)
5. [Protected Routes](#5-protected-routes)
6. [Middleware Authentication](#6-middleware-authentication)
7. [Role-Based Access Control](#7-role-based-access-control)
8. [OAuth Providers](#8-oauth-providers)
9. [Credentials Provider](#9-credentials-provider)
10. [Session in Server Components](#10-session-in-server-components)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

Authentication in Next.js typically involves NextAuth.js (now Auth.js), which provides a complete auth solution with session management, OAuth providers, and JWT support.

```typescript
const authConcepts = {
  authentication: 'Who are you? (identity verification)',
  authorization: 'What can you do? (permission checking)',
  session: 'Persistent auth state across requests',
  jwt: 'JSON Web Token — stateless auth token',
  oauth: 'Third-party auth delegation (Google, GitHub, etc.)',
};
```

---

## 2. NextAuth.js / Auth.js Overview

```typescript
const authJsArchitecture = {
  configFile: 'auth.ts or [...nextauth]/route.ts',
  providers: ['Google', 'GitHub', 'Credentials', 'Email', '...'],
  adapters: ['Prisma', 'Drizzle', 'MongoDB', 'TypeORM', '...'],
  sessionStrategies: ['jwt', 'database'],
  callbacks: ['signIn', 'redirect', 'session', 'jwt'],
};
```

---

## 3. Session Management

```typescript
const sessionFlow = {
  login: 'User authenticates → session created',
  storage: 'JWT in cookie OR session ID in cookie + data in DB',
  access: {
    server: 'auth() function in Server Components',
    client: 'useSession() hook in Client Components',
    middleware: 'auth() in middleware.ts',
    api: 'auth() in Route Handlers',
  },
  logout: 'Session destroyed, cookie cleared',
};
```

### Session Object Structure

```typescript
interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  expires: string;  // ISO date string
}
```

---

## 4. JWT vs Database Sessions

```typescript
const jwtStrategy = {
  storage: 'Encrypted JWT in HTTP-only cookie',
  pros: ['No database needed', 'Stateless', 'Scalable', 'Fast (no DB lookup)'],
  cons: ['Cannot revoke instantly', 'Token size grows with data', 'Must wait for expiry'],
  bestFor: 'Simple apps, serverless deployments',
};

const databaseStrategy = {
  storage: 'Session ID in cookie, data in database',
  pros: ['Instant revocation', 'Unlimited session data', 'Better security control'],
  cons: ['Database required', 'DB lookup on every request', 'More complex setup'],
  bestFor: 'Apps needing fine-grained session control',
};
```

---

## 5. Protected Routes

```typescript
// Pattern 1: Server Component protection
// async function ProtectedPage() {
//   const session = await auth();
//   if (!session) redirect('/login');
//   return <Dashboard user={session.user} />;
// }

// Pattern 2: Layout-level protection
// async function DashboardLayout({ children }) {
//   const session = await auth();
//   if (!session) redirect('/login');
//   return <div>{children}</div>;
// }

// Pattern 3: Middleware protection
// See Section 6
```

---

## 6. Middleware Authentication

```typescript
// export { auth as middleware } from '@/auth';
// export const config = { matcher: ['/dashboard/:path*', '/api/protected/:path*'] };

// Or custom middleware:
// export async function middleware(request: NextRequest) {
//   const session = await auth();
//   if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
//   return NextResponse.next();
// }
```

---

## 7. Role-Based Access Control

```typescript
const rbacPattern = {
  roles: ['user', 'admin', 'editor', 'viewer'],
  permissions: {
    admin: ['read', 'write', 'delete', 'manage-users'],
    editor: ['read', 'write'],
    viewer: ['read'],
    user: ['read', 'write-own'],
  },
  implementation: {
    database: 'User table has role column',
    jwt: 'Role included in JWT token payload',
    check: 'Verify role/permission before rendering or executing action',
  },
};
```

---

## 8. OAuth Providers

```typescript
const oauthFlow = {
  step1: 'User clicks "Sign in with Google"',
  step2: 'Redirect to Google consent screen',
  step3: 'User authorizes, Google redirects back with code',
  step4: 'Auth.js exchanges code for tokens',
  step5: 'User profile fetched, session created',
  step6: 'User redirected to app (authenticated)',
};
```

---

## 9. Credentials Provider

```typescript
// Custom username/password authentication:
// providers: [
//   Credentials({
//     credentials: {
//       email: { label: 'Email', type: 'email' },
//       password: { label: 'Password', type: 'password' },
//     },
//     async authorize(credentials) {
//       const user = await db.users.findByEmail(credentials.email);
//       if (!user || !await bcrypt.compare(credentials.password, user.hash)) return null;
//       return { id: user.id, email: user.email, name: user.name };
//     },
//   }),
// ]
```

---

## 10. Session in Server Components

```typescript
// import { auth } from '@/auth';
// const session = await auth();
// No useEffect, no loading state — data available immediately

const serverComponentAuth = {
  access: 'const session = await auth()',
  available: 'In any Server Component, Layout, or Route Handler',
  caching: 'Deduplicated within a single render (React cache)',
};
```

---

## 11. Best Practices

- Use HTTP-only cookies for session storage (XSS protection)
- Implement CSRF protection (Auth.js does this automatically)
- Use middleware for broad auth checks, component-level for fine-grained
- Store minimal data in JWT tokens
- Implement proper role-based access control
- Use HTTPS in production
- Set appropriate session expiry times
- Hash passwords with bcrypt/argon2 (never store plaintext)

---

## Further Reading

- [Auth.js Documentation](https://authjs.dev/)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
