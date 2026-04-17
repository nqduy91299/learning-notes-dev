# Vercel Deployment

## Table of Contents

1. [Deployment Process](#deployment-process)
2. [vercel.json Configuration](#verceljson-configuration)
3. [Environment Variables](#environment-variables)
4. [Preview Deployments](#preview-deployments)
5. [Edge Runtime vs Serverless Runtime](#edge-runtime-vs-serverless-runtime)
6. [Edge Middleware](#edge-middleware)
7. [ISR on Vercel](#isr-on-vercel)
8. [Domain Configuration](#domain-configuration)
9. [Deployment Protection](#deployment-protection)
10. [Deployment Hooks and Webhooks](#deployment-hooks-and-webhooks)
11. [Vercel CLI](#vercel-cli)
12. [Monorepo Deployment](#monorepo-deployment)

---

## Deployment Process

Vercel follows a **git-push-to-deploy** workflow:

```
git push → Vercel detects push → Build triggered → Deploy to CDN
```

### Step-by-Step Flow

1. **Git Push**: You push code to a connected Git repository (GitHub, GitLab, Bitbucket)
2. **Build Detection**: Vercel detects the push via webhook and clones the repo
3. **Dependency Installation**: `npm install` / `yarn install` / `pnpm install` runs
4. **Build Phase**: `next build` executes, producing optimized output in `.next/`
5. **Output Analysis**: Vercel analyzes the build output to determine:
   - Static pages (served from CDN edge)
   - Serverless functions (deployed as lambdas)
   - Edge functions (deployed to edge network)
6. **Deployment**: Assets are distributed to Vercel's global CDN
7. **URL Assignment**: A unique deployment URL is generated (e.g., `my-app-abc123.vercel.app`)

### Production vs Preview

| Trigger | Deployment Type | URL |
|---------|----------------|-----|
| Push to production branch (main/master) | Production | `my-app.vercel.app` + custom domains |
| Push to any other branch | Preview | `my-app-<hash>-team.vercel.app` |
| Pull Request | Preview | `my-app-<hash>-team.vercel.app` |

### Build Cache

Vercel caches `node_modules` and `.next/cache` between builds. This dramatically
speeds up subsequent deployments. The cache is per-branch and shared across
team members.

---

## vercel.json Configuration

The `vercel.json` file in your project root configures deployment behavior.

### Redirects

```json
{
  "redirects": [
    {
      "source": "/old-blog/:slug",
      "destination": "/blog/:slug",
      "permanent": true
    },
    {
      "source": "/twitter",
      "destination": "https://twitter.com/myhandle",
      "statusCode": 302
    }
  ]
}
```

- `permanent: true` sends a 308 status code (cached by browsers)
- `permanent: false` or `statusCode: 302` sends a temporary redirect
- Supports path parameters (`:slug`), wildcards (`*`), and regex

### Headers

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "X-Custom-Header", "value": "my-value" }
      ]
    },
    {
      "source": "/(.*).svg",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Rewrites

Rewrites map a source path to a different destination **without changing the URL**.

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://backend.example.com/:path*"
    },
    {
      "source": "/blog",
      "destination": "/news"
    }
  ]
}
```

Key difference from redirects: the browser URL stays the same. Useful for:
- Proxying API calls to a backend
- A/B testing different pages
- Migrating routes incrementally

### Functions Configuration

```json
{
  "functions": {
    "api/heavy-compute.ts": {
      "memory": 1024,
      "maxDuration": 30
    },
    "api/edge-handler.ts": {
      "runtime": "edge"
    }
  }
}
```

- `memory`: 128-3008 MB (default 1024)
- `maxDuration`: Execution timeout in seconds (plan-dependent: Hobby 10s, Pro 60s, Enterprise 900s)
- `runtime`: `"edge"` for edge runtime

### Crons

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

- Uses standard cron syntax
- Vercel calls the specified API route on schedule
- Hobby plan: 1 cron job, Pro plan: up to 40
- Cron requests include a `CRON_SECRET` header you should validate

---

## Environment Variables

### Scopes

Vercel supports three environment scopes:

| Scope | When Used | Example |
|-------|-----------|---------|
| **Production** | Deployments from the production branch | Live database URL |
| **Preview** | Deployments from non-production branches/PRs | Staging database URL |
| **Development** | When running `vercel dev` locally | Local database URL |

### Setting Environment Variables

```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Pull to local .env file
vercel env pull .env.local
```

### NEXT_PUBLIC_ Prefix

Variables prefixed with `NEXT_PUBLIC_` are **inlined into the client-side bundle**
at build time:

```
NEXT_PUBLIC_API_URL=https://api.example.com    # Available in browser JS
DATABASE_URL=postgres://...                     # Server-only, never exposed
```

**Critical security rule**: Never put secrets in `NEXT_PUBLIC_` variables. They are
visible to anyone inspecting your JavaScript bundle.

### System Environment Variables

Vercel provides built-in variables:

- `VERCEL` - Always `"1"` on Vercel
- `VERCEL_ENV` - `"production"`, `"preview"`, or `"development"`
- `VERCEL_URL` - The deployment URL (without protocol)
- `VERCEL_GIT_COMMIT_SHA` - The git commit hash
- `VERCEL_GIT_COMMIT_REF` - The branch name

---

## Preview Deployments

### Per-Branch Previews

Every branch push creates a unique preview deployment:

```
main        → my-app.vercel.app (production)
feature/auth → my-app-git-feature-auth-team.vercel.app
fix/header   → my-app-git-fix-header-team.vercel.app
```

### Per-PR Previews

Pull requests get their own preview URL plus:
- A comment on the PR with the preview link
- Integration with GitHub Checks (build status)
- Lighthouse scores (if enabled)

### Preview URL Pattern

```
<project>-<unique-hash>-<team>.vercel.app
```

Or the git-branch-based alias:

```
<project>-git-<branch>-<team>.vercel.app
```

### Preview Environment

Preview deployments:
- Use **Preview** environment variables
- Are protected by Vercel Authentication (configurable)
- Share the same build cache per branch
- Are immutable -- each push creates a new deployment

---

## Edge Runtime vs Serverless Runtime

### Serverless Runtime (Node.js)

- Runs in AWS Lambda (specific regions)
- Full Node.js API access (fs, crypto, streams, etc.)
- Cold starts of 250ms-1s
- Memory: 128MB-3008MB configurable
- Max duration: 10s (Hobby), 60s (Pro), 900s (Enterprise)
- Best for: database queries, heavy computation, Node.js-specific APIs

### Edge Runtime

- Runs on Vercel's Edge Network (globally distributed)
- Based on V8 isolates (like Cloudflare Workers)
- Near-zero cold starts (~0ms)
- Limited API: no `fs`, no native Node modules
- Max duration: 30s
- Memory: 128MB
- Best for: authentication, redirects, A/B testing, geolocation, personalization

### Choosing a Runtime

```typescript
// Serverless (default) - api/data.ts
export default function handler(req, res) {
  // Full Node.js available
  const data = await db.query("SELECT * FROM users");
  res.json(data);
}

// Edge - api/geo.ts
export const config = { runtime: "edge" };
export default function handler(req: Request) {
  const country = req.headers.get("x-vercel-ip-country");
  return new Response(JSON.stringify({ country }));
}
```

### Comparison Table

| Feature | Serverless | Edge |
|---------|-----------|------|
| Cold start | 250ms-1s | ~0ms |
| Node.js APIs | Full | Limited (Web APIs) |
| Global distribution | Regional | Global |
| Max execution | Up to 900s | 30s |
| Streaming | Yes | Yes |
| WebSocket | No | No |

---

## Edge Middleware

Middleware runs **before** the request reaches your application. On Vercel, it
executes at the edge globally.

```typescript
// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";

  if (country === "DE") {
    return NextResponse.rewrite(new URL("/de" + request.nextUrl.pathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
```

Common middleware use cases:
- **Authentication**: Check JWT/session before page loads
- **Geolocation routing**: Serve localized content
- **A/B testing**: Route users to different variants
- **Bot protection**: Block suspicious requests
- **Rate limiting**: Throttle requests at the edge

---

## ISR on Vercel

Incremental Static Regeneration works natively on Vercel with zero configuration.

### How ISR Works on Vercel

1. First request: serves the cached static page
2. After `revalidate` seconds: the next request triggers background regeneration
3. Stale page is served while the new one builds
4. New page replaces the old one in the CDN cache globally

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### On-Demand Revalidation

```typescript
// api/revalidate.ts
import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.REVALIDATION_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  revalidatePath("/blog");
  // or: revalidateTag("blog-posts");

  return new Response("Revalidated");
}
```

On Vercel, ISR pages are stored in a **durable cache** that persists across
deployments. This means revalidated pages survive redeployments.

---

## Domain Configuration

### Custom Domains

```bash
# Add a domain
vercel domains add example.com

# Add a subdomain
vercel domains add blog.example.com
```

### DNS Configuration

For apex domains (e.g., `example.com`):
- Add an **A record** pointing to `76.76.21.21`

For subdomains (e.g., `www.example.com`):
- Add a **CNAME record** pointing to `cname.vercel-dns.com`

### Using Vercel DNS

You can transfer your domain's nameservers to Vercel for full DNS management:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Benefits:
- Automatic SSL certificate provisioning
- Automatic DNS configuration
- Faster propagation

### SSL/TLS

- Automatic HTTPS via Let's Encrypt
- Certificate auto-renewal
- HTTP/2 and HTTP/3 support
- TLS 1.3

---

## Deployment Protection

### Vercel Authentication

Preview deployments can be protected so only team members can access them:

- **Standard Protection**: Requires Vercel login
- **Trusted IPs**: Restrict access to specific IP ranges (Enterprise)
- **Password Protection**: Set a shared password for preview URLs (Pro)

### Skipping Protection for Automation

For CI/CD or automated testing, use the `Protection Bypass` secret:

```
x-vercel-protection-bypass: <your-secret>
```

### OPTIONS Method

Deployment protection automatically allows OPTIONS requests for CORS preflight.

---

## Deployment Hooks and Webhooks

### Deploy Hooks

A Deploy Hook is a URL that triggers a new deployment when called:

```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
```

Use cases:
- Trigger rebuild when CMS content changes
- Scheduled rebuilds via external cron
- Rebuild after external data updates

### Webhooks

Vercel can send HTTP POST requests to your endpoint on deployment events:

- `deployment.created` - A new deployment started
- `deployment.succeeded` - Build and deployment completed
- `deployment.failed` - Build or deployment failed
- `deployment.canceled` - Deployment was canceled

Webhook payload includes deployment metadata (URL, git info, timestamps).

---

## Vercel CLI

### Installation and Usage

```bash
npm i -g vercel

# Login
vercel login

# Deploy from local (creates preview deployment)
vercel

# Deploy to production
vercel --prod

# Pull environment variables
vercel env pull .env.local

# Run development server with Vercel features
vercel dev

# List deployments
vercel ls

# Inspect a deployment
vercel inspect <deployment-url>

# Promote a preview to production
vercel promote <deployment-url>
```

### Useful Commands

```bash
# Link local directory to Vercel project
vercel link

# View build logs
vercel logs <deployment-url>

# Rollback to previous deployment
vercel rollback

# Set environment variable
vercel env add MY_VAR production

# Remove environment variable
vercel env rm MY_VAR production
```

---

## Monorepo Deployment

Vercel supports monorepos with Turborepo, Nx, and others.

### Root Directory Setting

In project settings, specify the **Root Directory** for your app:

```
apps/web        → Web application
apps/docs       → Documentation site
packages/ui     → Shared UI library
```

### Ignored Build Step

Use the **Ignored Build Step** to skip unnecessary builds:

```bash
# Only build if files in apps/web or packages/ui changed
npx turbo-ignore
```

Or a custom script in `vercel.json`:

```json
{
  "ignoreCommand": "git diff HEAD^ HEAD --quiet -- . ../../packages/shared"
}
```

### Turborepo Integration

```json
{
  "buildCommand": "cd ../.. && npx turbo build --filter=web",
  "installCommand": "cd ../.. && npm install"
}
```

### Monorepo Environment Variables

Each project in the monorepo gets its own set of environment variables.
Shared variables must be duplicated or managed via Vercel's project linking.

---

## Key Takeaways

1. **Git push = deploy** -- Vercel's workflow is built around Git integration
2. **vercel.json** controls redirects, headers, rewrites, functions, and crons
3. **NEXT_PUBLIC_** prefix exposes variables to the client -- never put secrets there
4. **Preview deployments** give every branch/PR its own URL and environment
5. **Edge runtime** provides global, low-latency execution with limited APIs
6. **ISR** works natively on Vercel with persistent cache across deployments
7. **Middleware** runs at the edge before your application code
8. **Vercel CLI** enables local development with production-like features
9. **Monorepos** are first-class with build filtering and root directory support
