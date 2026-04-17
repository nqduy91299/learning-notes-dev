# CORS & Caching

## Table of Contents

1. [Same-Origin Policy](#same-origin-policy)
2. [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
3. [Simple vs Preflight Requests](#simple-vs-preflight-requests)
4. [CORS Headers](#cors-headers)
5. [Common CORS Errors and Fixes](#common-cors-errors-and-fixes)
6. [Browser Caching: Cache-Control](#browser-caching-cache-control)
7. [ETag and Conditional Requests](#etag-and-conditional-requests)
8. [Cache Busting](#cache-busting)
9. [Stale-While-Revalidate](#stale-while-revalidate)
10. [CDN Caching](#cdn-caching)
11. [Service Worker Cache](#service-worker-cache)
12. [HTTP Caching Decision Flowchart](#http-caching-decision-flowchart)
13. [Frontend Relevance](#frontend-relevance)

---

## Same-Origin Policy

The same-origin policy is a critical browser security mechanism that restricts how
a document or script from one **origin** can interact with resources from another origin.

### What is an Origin?

An origin is defined by the combination of:
- **Scheme** (protocol): `http` or `https`
- **Host** (domain): `example.com`
- **Port**: `443`

```
https://example.com:443
  │        │         │
scheme    host      port
```

### Same Origin Examples

| URL A | URL B | Same Origin? | Why? |
|-------|-------|-------------|------|
| `https://example.com/a` | `https://example.com/b` | Yes | Same scheme, host, port |
| `https://example.com` | `http://example.com` | **No** | Different scheme |
| `https://example.com` | `https://api.example.com` | **No** | Different host (subdomain) |
| `https://example.com` | `https://example.com:8080` | **No** | Different port |
| `http://localhost:3000` | `http://localhost:5000` | **No** | Different port |

### Why It Exists

Without the same-origin policy:
- A malicious site could read your banking session from `bank.com`
- Any site could make authenticated API calls on your behalf
- JavaScript on evil.com could read cookies from good.com

### What It Restricts

- **JavaScript**: Cannot read responses from cross-origin `fetch()` / `XMLHttpRequest`
- **DOM**: Cannot access `iframe` content from a different origin
- **Cookies**: Restricted by origin (with SameSite policy)

### What It Does NOT Restrict

- **Loading resources**: `<img>`, `<script>`, `<link>`, `<video>` can load cross-origin
- **Sending requests**: The browser SENDS cross-origin requests — it just blocks
  JavaScript from reading the response
- **Form submissions**: `<form action="https://other.com">` works

---

## CORS (Cross-Origin Resource Sharing)

CORS is a mechanism that allows servers to explicitly grant permission for
cross-origin requests. It's a controlled relaxation of the same-origin policy.

### How It Works

1. Browser detects a cross-origin request from JavaScript
2. Browser adds an `Origin` header to the request
3. Server checks the origin and responds with CORS headers
4. Browser checks the CORS headers:
   - If allowed → JavaScript can read the response
   - If not allowed → Browser blocks access and throws a CORS error

```
Browser (example.com)                    API Server (api.other.com)
     |                                         |
     |  GET /data                              |
     |  Origin: https://example.com  ───────>  |
     |                                         |
     |  200 OK                                 |
     |  Access-Control-Allow-Origin: *  <───── |
     |                                         |
     ✓ Response accessible to JavaScript       |
```

### Important: CORS is a Browser Feature

- The server still receives and processes the request
- CORS headers tell the **browser** whether to allow JavaScript access
- `curl`, Postman, and server-to-server requests are unaffected by CORS
- CORS is NOT a security mechanism on the server — it's browser enforcement

---

## Simple vs Preflight Requests

### Simple Requests (No Preflight)

A request is "simple" if it meets ALL these criteria:

- **Method**: GET, HEAD, or POST
- **Headers**: Only these "safe" headers:
  - `Accept`, `Accept-Language`, `Content-Language`
  - `Content-Type` (only `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`)
- **No custom headers** (no `Authorization`, no `X-*` headers)

Simple requests go directly to the server with an `Origin` header added.

### Preflight Requests

Any request that doesn't qualify as "simple" triggers a **preflight**:

```
Browser                              Server
  |                                    |
  |  OPTIONS /api/data                 |  ← Preflight request
  |  Origin: https://example.com       |
  |  Access-Control-Request-Method: POST
  |  Access-Control-Request-Headers: Content-Type, Authorization
  |  ─────────────────────────────>    |
  |                                    |
  |  204 No Content                    |  ← Preflight response
  |  Access-Control-Allow-Origin: *    |
  |  Access-Control-Allow-Methods: POST|
  |  Access-Control-Allow-Headers: Content-Type, Authorization
  |  Access-Control-Max-Age: 86400     |
  |  <─────────────────────────────    |
  |                                    |
  |  POST /api/data                    |  ← Actual request
  |  Origin: https://example.com       |
  |  Content-Type: application/json    |
  |  Authorization: Bearer token       |
  |  ─────────────────────────────>    |
  |                                    |
  |  200 OK                            |  ← Actual response
  |  Access-Control-Allow-Origin: *    |
  |  <─────────────────────────────    |
```

### What Triggers a Preflight?

Any of these:
- Methods: PUT, PATCH, DELETE
- Custom headers: `Authorization`, `X-Request-ID`, etc.
- `Content-Type: application/json` (the most common trigger for frontend devs!)
- Reading custom response headers

### Performance Impact

Preflight adds a round trip. Mitigate with:
- `Access-Control-Max-Age` to cache preflight results
- Use simple requests where possible

---

## CORS Headers

### Request Headers (Sent by Browser)

| Header | Purpose |
|--------|---------|
| `Origin` | The origin making the request |
| `Access-Control-Request-Method` | (Preflight) The method the actual request will use |
| `Access-Control-Request-Headers` | (Preflight) Custom headers the actual request will send |

### Response Headers (Set by Server)

| Header | Purpose | Example |
|--------|---------|---------|
| `Access-Control-Allow-Origin` | Which origins are allowed | `*` or `https://example.com` |
| `Access-Control-Allow-Methods` | Which HTTP methods are allowed | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Which request headers are allowed | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | Whether cookies/auth can be sent | `true` |
| `Access-Control-Max-Age` | How long to cache preflight (seconds) | `86400` |
| `Access-Control-Expose-Headers` | Which response headers JS can read | `X-Request-Id` |

### Critical Rule: Credentials + Wildcard

When using `credentials: 'include'` in fetch:

```
Access-Control-Allow-Origin: *        ← NOT ALLOWED with credentials
Access-Control-Allow-Origin: https://example.com  ← MUST be specific origin
Access-Control-Allow-Credentials: true ← Must be set
```

You CANNOT use `*` with credentials. The server must echo the specific origin.

---

## Common CORS Errors and Fixes

### Error 1: "No 'Access-Control-Allow-Origin' header"

```
Access to fetch at 'https://api.other.com/data' from origin 'https://example.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Fix**: Server must add `Access-Control-Allow-Origin` header.

### Error 2: "Wildcard not allowed with credentials"

```
The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'
when the request's credentials mode is 'include'.
```

**Fix**: Replace `*` with the specific origin. Dynamically set it from the `Origin` header.

### Error 3: "Method not allowed in preflight"

```
Method PUT is not allowed by Access-Control-Allow-Methods.
```

**Fix**: Add the method to `Access-Control-Allow-Methods` on the server.

### Error 4: "Header not allowed in preflight"

```
Request header field Authorization is not allowed by Access-Control-Allow-Headers.
```

**Fix**: Add the header to `Access-Control-Allow-Headers` on the server.

### Frontend Developer's CORS Checklist

1. Is this a cross-origin request? (different scheme, host, or port)
2. Is the server configured to allow your origin?
3. Are you sending custom headers? (Authorization, Content-Type: json)
4. Are you sending credentials? (cookies, `credentials: 'include'`)
5. Is the server handling OPTIONS preflight requests?

### The "Proxy" Workaround

During development, configure your dev server to proxy API requests:

```javascript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.other.com',
        changeOrigin: true,
      }
    }
  }
}
```

Now `fetch('/api/data')` goes to your dev server (same origin), which proxies
to the actual API. No CORS issues because it's server-to-server.

---

## Browser Caching: Cache-Control

The `Cache-Control` header is the primary mechanism for controlling HTTP caching.

### Directives

| Directive | Meaning |
|-----------|---------|
| `max-age=N` | Cache is valid for N seconds |
| `no-cache` | Must revalidate with server before using cached version |
| `no-store` | Do not cache at all (sensitive data) |
| `public` | Can be cached by CDNs and shared caches |
| `private` | Only the browser can cache (not CDNs) — user-specific data |
| `must-revalidate` | Once expired, must revalidate (no stale serving) |
| `immutable` | Content will never change — don't even check |
| `stale-while-revalidate=N` | Serve stale while revalidating in background |

### Common Patterns

**Static assets with hash (JS, CSS, images)**:
```
Cache-Control: public, max-age=31536000, immutable
```
- Cache for 1 year
- `immutable` tells browser not to revalidate even on reload
- Safe because filename includes content hash (changes when content changes)

**HTML pages**:
```
Cache-Control: no-cache
```
- Always check with server (may get 304 Not Modified)
- Ensures users get the latest HTML pointing to latest hashed assets

**API responses (user-specific)**:
```
Cache-Control: private, max-age=0, must-revalidate
```
- Don't cache in CDN
- Always revalidate

**Sensitive data (banking, medical)**:
```
Cache-Control: no-store
```
- Never cache, never store to disk

---

## ETag and Conditional Requests

ETags enable **conditional requests** — the browser asks "has this changed?"
and the server can respond "no" (304) without sending the body.

### How It Works

```
First Request:
GET /api/data
→ 200 OK
→ ETag: "abc123"
→ Body: { ... large response ... }

Second Request:
GET /api/data
If-None-Match: "abc123"    ← "I have version abc123, still current?"
→ 304 Not Modified          ← "Yes, use your cached copy"
→ (no body sent — saves bandwidth)
```

### ETag Types

- **Strong ETag**: `"abc123"` — byte-for-byte identical
- **Weak ETag**: `W/"abc123"` — semantically equivalent (formatting may differ)

### Related Headers

| Header | Direction | Purpose |
|--------|-----------|---------|
| `ETag` | Response | The version identifier |
| `If-None-Match` | Request | "Give me the resource only if ETag changed" |
| `Last-Modified` | Response | Date the resource was last changed |
| `If-Modified-Since` | Request | "Give me the resource only if modified after this date" |

### Frontend Impact

- ETags are automatic — browsers handle `If-None-Match` without your code
- 304 responses save bandwidth but still require a round trip
- For APIs, ETags help reduce unnecessary data transfer
- `Cache-Control: no-cache` + ETag = always validate but avoid re-downloading

---

## Cache Busting

Cache busting ensures users get the latest version of assets when they change.

### Filename Hashing (Recommended)

Modern build tools (Vite, webpack) add content hashes to filenames:

```
app.a1b2c3d4.js    → Content changes → app.e5f6g7h8.js
style.x9y8z7.css   → Content changes → style.w6v5u4.css
```

- New content = new filename = browser fetches fresh copy
- Old content = same filename = served from cache
- Set `Cache-Control: public, max-age=31536000, immutable`

### Query String (Less Reliable)

```html
<script src="/app.js?v=1.2.3"></script>
<script src="/app.js?v=1.2.4"></script>
```

- Simpler but some CDNs/proxies ignore query strings for caching
- Filename hashing is strictly better

### Key Insight for Frontend

Your HTML file should use `no-cache` (always revalidate), and it references
hashed asset filenames. When you deploy:

1. New `app.xyz123.js` is uploaded
2. New `index.html` references `app.xyz123.js`
3. User's browser revalidates `index.html` (it's `no-cache`)
4. Gets new HTML → requests `app.xyz123.js` (new file, not cached)
5. Old `app.abc789.js` naturally expires from cache

---

## Stale-While-Revalidate

A caching strategy that serves stale content immediately while fetching fresh
content in the background.

```
Cache-Control: max-age=60, stale-while-revalidate=3600
```

This means:
- For 60 seconds: serve from cache (fresh)
- From 60s to 3660s: serve stale immediately, revalidate in background
- After 3660s: must wait for fresh response

### Timeline

```
0-60s:    Serve cached (fresh)           → Instant
60-3660s: Serve cached (stale) + revalidate in background → Instant, then update
3660s+:   Wait for server response       → Network latency
```

### Frontend Impact

- User always gets an instant response (during stale-while-revalidate window)
- The "next" request gets the fresh data (after background revalidation)
- Great for data that changes occasionally but doesn't need to be realtime

---

## CDN Caching

CDNs cache your content at edge locations worldwide.

### How CDN Caching Works

```
User → CDN Edge (cache) → Origin Server
         ↓
     Cache Hit? → Return cached response
     Cache Miss? → Fetch from origin, cache, return
```

### CDN Cache Headers

- `Cache-Control: public` — allows CDN to cache
- `Cache-Control: private` — CDN must NOT cache (user-specific data)
- `s-maxage=N` — CDN-specific max-age (overrides `max-age` for CDN only)
- `Surrogate-Control` — CDN-specific instructions (non-standard)

### CDN Cache Invalidation

When you deploy new content:
- **Purge by URL**: Invalidate specific URLs
- **Purge all**: Clear entire CDN cache (nuclear option)
- **Versioned URLs**: Use hashed filenames — no purging needed

### Frontend Relevance

- Static assets: long cache + hashed filenames
- API responses: `private` (usually shouldn't be CDN-cached)
- HTML: `no-cache` or short `max-age` + `s-maxage` for CDN

---

## Service Worker Cache

Service Workers give you **programmatic control** over caching in the browser.

### Cache API

```typescript
// Store a response in cache
const cache = await caches.open('v1');
await cache.put('/api/data', response);

// Retrieve from cache
const cached = await cache.match('/api/data');

// Delete a cache
await caches.delete('v1');
```

### Caching Strategies

**Cache First (Offline First)**
```
Request → Check Cache → Hit? → Return cached
                      → Miss? → Fetch from network → Cache → Return
```
Best for: Static assets, fonts, images

**Network First**
```
Request → Try Network → Success? → Cache → Return
                      → Fail? → Check Cache → Return cached (or error)
```
Best for: API data where freshness matters but offline support is needed

**Stale While Revalidate**
```
Request → Return from Cache (instant) → Fetch from network → Update cache
```
Best for: Content where speed matters more than freshness

**Network Only**
```
Request → Always fetch from network
```
Best for: Non-cacheable requests (POST, realtime data)

**Cache Only**
```
Request → Always return from cache
```
Best for: Precached assets during offline mode

### Example: Stale-While-Revalidate Strategy

```typescript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('v1').then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      const fetchPromise = fetch(event.request).then((networkResponse) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
```

---

## HTTP Caching Decision Flowchart

```
Is the response cacheable?
├── Contains sensitive/personal data?
│   └── Yes → Cache-Control: no-store
│
├── Should it be cached?
│   ├── No → Cache-Control: no-store
│   │
│   ├── Must revalidate every time?
│   │   └── Yes → Cache-Control: no-cache
│   │            (+ ETag for efficient revalidation)
│   │
│   ├── Can CDN cache it?
│   │   ├── Yes → Cache-Control: public, max-age=N
│   │   └── No  → Cache-Control: private, max-age=N
│   │
│   └── Will it never change? (hashed filename)
│       └── Yes → Cache-Control: public, max-age=31536000, immutable
```

### Quick Reference

| Resource Type | Cache-Control |
|--------------|---------------|
| Hashed static assets | `public, max-age=31536000, immutable` |
| HTML pages | `no-cache` (or `max-age=0, must-revalidate`) |
| API responses (public) | `public, max-age=60, stale-while-revalidate=300` |
| API responses (private) | `private, no-cache` |
| Sensitive data | `no-store` |
| Fonts (third-party) | `public, max-age=31536000` |

---

## Frontend Relevance

### Daily Encounters

1. **CORS errors**: The #1 confusing error for frontend developers
   - Remember: it's a browser restriction, not a server error
   - The request WAS sent — the browser just blocks the response
   - Fix it on the server side (CORS headers) or use a proxy in dev

2. **Caching surprises**: "I deployed but users see the old version"
   - Use hashed filenames for assets
   - Use `no-cache` for HTML
   - Clear CDN cache after deployment

3. **Performance optimization**: Proper caching is free performance
   - Cache static assets aggressively (1 year + immutable)
   - Use `stale-while-revalidate` for non-critical API data
   - Use Service Worker for offline support

### Key Takeaways

1. Same-origin policy blocks cross-origin JavaScript access — CORS relaxes it
2. Preflight (OPTIONS) fires for non-simple requests (JSON, custom headers)
3. `Access-Control-Allow-Origin: *` doesn't work with credentials
4. Use dev server proxy to avoid CORS during development
5. `no-cache` ≠ "don't cache" — it means "always revalidate"
6. `no-store` means "truly don't cache"
7. Hash filenames + `immutable` for static assets = perfect caching
8. ETags save bandwidth with 304 responses
9. Service Workers give programmatic cache control for offline support
10. CDN caching uses `public` / `s-maxage` — never cache private data on CDN
