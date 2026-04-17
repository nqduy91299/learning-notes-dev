# Netlify Deployment

## Table of Contents
1. [Introduction](#introduction)
2. [How Netlify Works](#how-netlify-works)
3. [netlify.toml Configuration](#netlifytoml-configuration)
4. [Build Settings](#build-settings)
5. [Build Plugins](#build-plugins)
6. [Redirects and Rewrites](#redirects-and-rewrites)
7. [Forms](#forms)
8. [Edge Functions](#edge-functions)
9. [Serverless Functions](#serverless-functions)
10. [Environment Variables](#environment-variables)
11. [Deploy Previews](#deploy-previews)
12. [Best Practices](#best-practices)

---

## Introduction

Netlify is a cloud platform for web projects that provides continuous deployment, serverless functions, edge computing, and form handling. It excels at static sites and JAMstack applications.

Key features:
- **Git-based continuous deployment**
- **Build plugins** ecosystem
- **Form handling** without a backend
- **Redirects/rewrites** via configuration
- **Edge Functions** (Deno runtime)
- **Split testing** (A/B)

---

## How Netlify Works

```
Git Push → Netlify Build → Deploy → CDN
              │                 │
              ├── PR → Deploy Preview
              └── main → Production
```

### Build Process
1. Clone repository
2. Install dependencies
3. Run build command
4. Deploy output directory to CDN
5. Execute deploy-succeeded plugins

---

## netlify.toml Configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"
  environment = { NODE_VERSION = "20" }

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

# Context-specific settings
[context.production]
  command = "npm run build:prod"

[context.deploy-preview]
  command = "npm run build:preview"

[context.branch-deploy]
  command = "npm run build:staging"

# Redirects
[[redirects]]
  from = "/old-path"
  to = "/new-path"
  status = 301

# Headers
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"

# Edge Functions
[[edge_functions]]
  path = "/api/geo"
  function = "geo-handler"
```

---

## Build Settings

| Setting          | Description                  | Default          |
|-----------------|------------------------------|------------------|
| Base directory  | Root for build commands       | Repository root  |
| Build command   | Command to build the site     | Auto-detected    |
| Publish directory| Output directory to deploy   | Auto-detected    |
| Functions directory | Serverless functions path | `netlify/functions` |
| Edge Functions  | Edge function path            | `netlify/edge-functions` |

---

## Build Plugins

Plugins hook into the Netlify build lifecycle.

### Lifecycle Events
```
onPreBuild → onBuild → onPostBuild → onSuccess → onEnd
                                         │
                                    onError (if build fails)
```

### Popular Plugins

| Plugin                        | Purpose                    |
|------------------------------|----------------------------|
| `@netlify/plugin-nextjs`     | Next.js support            |
| `netlify-plugin-lighthouse`  | Lighthouse audit on deploy |
| `netlify-plugin-cache`       | Cache build artifacts      |
| `netlify-plugin-sitemap`     | Generate sitemap           |

---

## Redirects and Rewrites

### _redirects File
```
/old-page    /new-page    301
/api/*       /.netlify/functions/:splat    200
/app/*       /index.html                   200
```

### Status Codes
| Code | Behavior                      |
|------|-------------------------------|
| 301  | Permanent redirect            |
| 302  | Temporary redirect            |
| 200  | Rewrite (URL doesn't change)  |
| 404  | Custom 404 page               |

### Redirect with Conditions
```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
  force = true
  conditions = { Language = ["en"], Country = ["US"] }
```

---

## Forms

Netlify handles form submissions without a backend.

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" />
  <input type="email" name="email" />
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```

### Spam Filtering
- Built-in spam detection
- Honeypot field: `data-netlify-honeypot="bot-field"`
- reCAPTCHA integration

---

## Edge Functions

Run at the CDN edge using Deno runtime.

```typescript
// netlify/edge-functions/hello.ts
export default async (request: Request) => {
  const geo = (request as any).geo;
  return new Response(`Hello from ${geo?.city || 'somewhere'}!`);
};

export const config = { path: "/hello" };
```

---

## Serverless Functions

```typescript
// netlify/functions/hello.ts
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello!" }),
  };
};
```

---

## Environment Variables

### Scopes
- **All deploys** — Available everywhere
- **Production** — Only production builds
- **Deploy previews** — Only preview builds
- **Branch deploys** — Only branch-specific builds

### netlify.toml Environment
```toml
[context.production.environment]
  API_URL = "https://api.example.com"

[context.deploy-preview.environment]
  API_URL = "https://staging-api.example.com"
```

---

## Deploy Previews

- Every PR gets a unique preview URL
- Comments on PR with preview link
- Same build process as production
- Branch-specific configuration via `[context.deploy-preview]`

---

## Best Practices

1. **Use `netlify.toml`** — Version-controlled configuration
2. **Leverage build plugins** — Lighthouse, caching, etc.
3. **Use `_redirects` for SPA** — `/app/* → /index.html 200`
4. **Set up form notifications** — Email, Slack, webhooks
5. **Use edge functions sparingly** — For geo-routing, auth, personalization
6. **Configure context-specific builds** — Different commands for prod/preview
7. **Enable branch deploys** — For staging environments
8. **Use environment variables by scope** — Separate prod/preview configs

---

## Key Takeaways

- Netlify provides Git-based CD with zero-config for many frameworks
- `netlify.toml` is the single source of truth for configuration
- Redirects support advanced routing with conditions
- Build plugins extend the build process at lifecycle hooks
- Edge functions use Deno runtime for global, low-latency compute
- Form handling is built-in, no backend needed
