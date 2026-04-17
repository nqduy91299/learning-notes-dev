# Vercel Deployment

## Table of Contents

1. [Introduction](#introduction)
2. [How Vercel Works](#how-vercel-works)
3. [Project Configuration](#project-configuration)
4. [Environment Variables](#environment-variables)
5. [Preview Deployments](#preview-deployments)
6. [Serverless Functions](#serverless-functions)
7. [Edge Functions](#edge-functions)
8. [Custom Domains](#custom-domains)
9. [Build Configuration](#build-configuration)
10. [Deployment Protection](#deployment-protection)
11. [Monorepo Support](#monorepo-support)
12. [Best Practices](#best-practices)

---

## Introduction

Vercel is a cloud platform optimized for frontend frameworks, especially Next.js. It provides automatic deployments from Git, preview URLs for every PR, serverless/edge functions, and a global CDN.

Key features:
- **Zero-config deployments** for Next.js, Nuxt, SvelteKit, etc.
- **Preview deployments** for every pull request
- **Serverless & Edge functions** for API routes
- **Global Edge Network** for fast content delivery
- **Automatic HTTPS** with custom domains

---

## How Vercel Works

### Deployment Flow

```
Git Push → Vercel detects → Build → Deploy → CDN
                │                       │
                ├── PR → Preview URL     │
                └── main → Production    │
                                   ┌─────┘
                                   ▼
                              Global Edge
                              Network (CDN)
```

### Deployment Types

| Type        | Trigger              | URL                          | Lifetime    |
|-------------|---------------------|------------------------------|-------------|
| Production  | Push to main branch | `myapp.vercel.app`           | Permanent   |
| Preview     | Push to any branch  | `myapp-abc123.vercel.app`    | Until deleted|
| Instant     | `vercel` CLI        | `myapp-xyz789.vercel.app`    | Until deleted|

---

## Project Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"],
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Framework Detection

Vercel auto-detects frameworks by looking at:
- `package.json` dependencies (next, nuxt, svelte, etc.)
- Configuration files (`next.config.js`, `nuxt.config.ts`)
- Directory structure (`pages/`, `app/`, `src/`)

---

## Environment Variables

### Scopes

| Scope         | Available In                    | Example Use               |
|---------------|--------------------------------|---------------------------|
| Production    | Production deployments only    | Real API keys             |
| Preview       | Preview deployments only       | Test API keys             |
| Development   | `vercel dev` locally           | Local API keys            |

### Setting Variables

```bash
# CLI
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview

# Or in Vercel Dashboard → Settings → Environment Variables
```

### System Variables

| Variable              | Value                           |
|----------------------|--------------------------------|
| `VERCEL`             | `1` (always set in Vercel)     |
| `VERCEL_URL`         | Deployment URL (no protocol)   |
| `VERCEL_ENV`         | `production`, `preview`, `development` |
| `VERCEL_GIT_COMMIT_SHA` | Git commit SHA              |
| `VERCEL_GIT_COMMIT_REF` | Git branch name             |

---

## Preview Deployments

Every push to a non-production branch creates a preview deployment.

### Features
- Unique URL per deployment
- Automatic comments on PRs with preview link
- Same build process as production
- Can have separate environment variables
- Protected by Vercel Authentication (optional)

### Preview URL Format
```
https://<project>-<hash>-<team>.vercel.app
```

---

## Serverless Functions

### API Routes in Next.js

```typescript
// app/api/hello/route.ts (App Router)
export async function GET() {
  return Response.json({ message: "Hello from serverless!" });
}
```

### Standalone Serverless Functions

```typescript
// api/hello.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: 'Hello!' });
}
```

### Configuration

```json
// vercel.json
{
  "functions": {
    "api/heavy-task.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## Edge Functions

Edge functions run on Vercel's Edge Network, closer to users.

```typescript
// middleware.ts
export const config = { runtime: 'edge' };

export default function middleware(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');
  // Route based on geography, modify headers, etc.
  return new Response(`Hello from the edge! Country: ${country}`);
}
```

### Edge vs Serverless

| Aspect       | Serverless         | Edge              |
|-------------|-------------------|-------------------|
| Location    | Single region      | Global edge       |
| Cold start  | ~250ms            | ~0ms              |
| Runtime     | Node.js            | V8 (limited APIs) |
| Max duration| 300s (Pro)         | 30s               |
| Memory      | Up to 3GB          | 128MB             |

---

## Custom Domains

```bash
# Add domain
vercel domains add myapp.com

# Configure DNS
# A record: 76.76.21.21
# CNAME: cname.vercel-dns.com
```

### Automatic HTTPS
- Free SSL certificates via Let's Encrypt
- Automatic renewal
- HTTP → HTTPS redirect

---

## Build Configuration

### Build Settings

| Setting           | Default        | Description                |
|-------------------|---------------|----------------------------|
| Build Command     | Framework default | `next build`, `npm run build` |
| Output Directory  | Framework default | `.next`, `dist`, `build`  |
| Install Command   | Auto-detected  | `npm ci`, `yarn install`   |
| Root Directory    | `/`           | For monorepos              |
| Node.js Version   | 20.x          | 18.x, 20.x supported      |

### Ignored Build Step

```bash
# vercel.json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- ."
}
```

Skip builds when no relevant files changed (useful for monorepos).

---

## Deployment Protection

### Options

1. **Vercel Authentication** — Only team members can view previews
2. **Password Protection** — Password-protect deployments (Pro)
3. **Trusted IPs** — Restrict by IP range (Enterprise)
4. **Deployment Protection Bypass** — Allow specific services

---

## Monorepo Support

### Root Directory Setting

```json
// vercel.json in root
{
  "projects": [
    { "name": "web", "rootDirectory": "apps/web" },
    { "name": "docs", "rootDirectory": "apps/docs" }
  ]
}
```

### Ignored Build Step for Monorepos

```bash
# Only build if files in this app changed
npx turbo-ignore
```

---

## Best Practices

1. **Use preview deployments** — Review changes visually before merging
2. **Separate env vars by scope** — Different keys for prod/preview/dev
3. **Use Edge Functions for latency-sensitive routes** — Middleware, redirects
4. **Set up deployment protection** — Don't expose preview URLs publicly
5. **Use `vercel.json` for custom routing** — Redirects, rewrites, headers
6. **Monitor serverless function duration** — Avoid timeout issues
7. **Use incremental static regeneration** — For dynamic content with caching
8. **Set up alerts** — Monitor deployment failures and function errors

---

## Key Takeaways

- Vercel auto-deploys from Git with zero configuration for supported frameworks
- Preview deployments give every PR a unique URL for testing
- Environment variables have scopes: production, preview, development
- Serverless functions run in a single region; edge functions run globally
- Custom domains get automatic HTTPS
- Monorepo support via root directory and ignored build steps
