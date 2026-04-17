# HTTP Protocol

## Table of Contents

1. [What is HTTP](#what-is-http)
2. [Request/Response Model](#requestresponse-model)
3. [HTTP Methods](#http-methods)
4. [Status Codes](#status-codes)
5. [HTTP Headers](#http-headers)
6. [Request & Response Body](#request--response-body)
7. [Cookies](#cookies)
8. [HTTP/1.1](#http11)
9. [HTTP/2](#http2)
10. [HTTP/3](#http3)
11. [REST Principles](#rest-principles)
12. [Content Negotiation](#content-negotiation)
13. [Frontend Relevance](#frontend-relevance)

---

## What is HTTP

HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web.
Every time you `fetch()` data, load a page, or submit a form, HTTP is the protocol carrying
your request to a server and delivering the response back.

### Key Properties

- **Stateless**: Each request is independent. The server does not remember previous requests.
  This is why cookies, tokens, and session IDs exist — to simulate state.
- **Text-based (HTTP/1.1)**: Requests and responses are human-readable text (until HTTP/2
  introduced binary framing).
- **Client-Server**: The browser (client) initiates requests; the server responds.
- **Connectionless (logically)**: Each request/response cycle is self-contained, even though
  the underlying TCP connection may be reused.

### Why Frontend Developers Must Know HTTP

You interact with HTTP every day:

- Calling APIs with `fetch()` or `axios`
- Debugging failed requests in DevTools Network tab
- Setting up authentication headers
- Understanding why CORS errors happen
- Optimizing performance with caching headers
- Handling file uploads with multipart/form-data

---

## Request/Response Model

Every HTTP interaction follows a simple pattern:

```
Client (Browser)                    Server
     |                                |
     |  ---- HTTP Request  ------>    |
     |                                |
     |  <---- HTTP Response ------    |
     |                                |
```

### HTTP Request Structure

```
METHOD /path HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer token123

{"key": "value"}
```

Components:
1. **Request line**: Method + Path + HTTP version
2. **Headers**: Key-value metadata pairs
3. **Empty line**: Separates headers from body
4. **Body** (optional): Data payload

### HTTP Response Structure

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600
Set-Cookie: session=abc123; HttpOnly

{"data": "result"}
```

Components:
1. **Status line**: HTTP version + Status code + Reason phrase
2. **Headers**: Response metadata
3. **Empty line**: Separator
4. **Body** (optional): Response data

---

## HTTP Methods

### GET — Retrieve Data

- **Purpose**: Fetch a resource without modifying it
- **Body**: Not allowed (technically possible but semantically wrong)
- **Idempotent**: Yes — calling it multiple times produces the same result
- **Cacheable**: Yes
- **Frontend usage**: Loading pages, fetching API data, loading images

```typescript
fetch('/api/users/42');
```

### POST — Create or Submit

- **Purpose**: Submit data to create a new resource or trigger an action
- **Body**: Required — contains the data being submitted
- **Idempotent**: No — calling twice may create two resources
- **Cacheable**: No (by default)
- **Frontend usage**: Form submissions, creating records, file uploads, login

```typescript
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' }),
});
```

### PUT — Replace Entirely

- **Purpose**: Replace the entire resource at the given URL
- **Body**: Required — the complete new representation
- **Idempotent**: Yes — putting the same resource twice gives the same result
- **Frontend usage**: Updating a full record (e.g., saving a complete form)

```typescript
fetch('/api/users/42', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', email: 'alice@test.com', role: 'admin' }),
});
```

### PATCH — Partial Update

- **Purpose**: Modify part of a resource
- **Body**: Required — only the fields being changed
- **Idempotent**: Not guaranteed (but usually is in practice)
- **Frontend usage**: Updating a single field (e.g., toggling a setting)

```typescript
fetch('/api/users/42', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ role: 'admin' }),
});
```

### DELETE — Remove Resource

- **Purpose**: Delete the resource at the given URL
- **Body**: Usually not sent
- **Idempotent**: Yes — deleting twice gives the same result (resource gone)
- **Frontend usage**: Deleting a record

```typescript
fetch('/api/users/42', { method: 'DELETE' });
```

### OPTIONS — Preflight & Discovery

- **Purpose**: Discover what methods/headers a server supports
- **Body**: None
- **Frontend relevance**: The browser sends OPTIONS automatically as a CORS preflight
  before certain cross-origin requests. You never call OPTIONS yourself.

### HEAD — Headers Only

- **Purpose**: Same as GET but returns only headers (no body)
- **Frontend usage**: Checking if a resource exists, getting file size before download

---

## Status Codes

### 1xx — Informational

| Code | Name | Meaning |
|------|------|---------|
| 100 | Continue | Server received headers, client should send body |
| 101 | Switching Protocols | Server agrees to switch (e.g., WebSocket upgrade) |
| 103 | Early Hints | Preload resources while server prepares response |

Rarely seen directly in frontend code, but 101 is critical for WebSocket connections.

### 2xx — Success

| Code | Name | When You See It |
|------|------|-----------------|
| 200 | OK | Standard success for GET, PUT, PATCH |
| 201 | Created | Resource created successfully (POST) |
| 204 | No Content | Success but no body (common for DELETE) |

### 3xx — Redirection

| Code | Name | Meaning |
|------|------|---------|
| 301 | Moved Permanently | Resource permanently at new URL — browser caches this |
| 302 | Found | Temporary redirect (but method may change to GET) |
| 304 | Not Modified | Cached version is still valid (ETag/Last-Modified) |
| 307 | Temporary Redirect | Like 302 but preserves the HTTP method |
| 308 | Permanent Redirect | Like 301 but preserves the HTTP method |

**Frontend note**: `fetch()` follows redirects automatically by default. A 304 saves
bandwidth — the browser uses its cached copy.

### 4xx — Client Error

| Code | Name | Common Cause |
|------|------|-------------|
| 400 | Bad Request | Malformed JSON, missing required fields |
| 401 | Unauthorized | Missing or expired authentication token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | Using POST on a GET-only endpoint |
| 409 | Conflict | Trying to create a duplicate resource |
| 413 | Payload Too Large | File upload exceeds server limit |
| 422 | Unprocessable Entity | Validation failed (common in REST APIs) |
| 429 | Too Many Requests | Rate limiting — you're making too many calls |

**401 vs 403**: 401 means "who are you?" (not logged in). 403 means "I know who you are
but you can't do this" (no permission).

### 5xx — Server Error

| Code | Name | Common Cause |
|------|------|-------------|
| 500 | Internal Server Error | Unhandled exception in server code |
| 502 | Bad Gateway | Proxy/load balancer can't reach the backend |
| 503 | Service Unavailable | Server overloaded or in maintenance |
| 504 | Gateway Timeout | Backend took too long to respond |

---

## HTTP Headers

### Request Headers (Sent by Browser)

**Content-Type** — Tells the server what format the body is in:
```
Content-Type: application/json
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Content-Type: application/x-www-form-urlencoded
```

**Authorization** — Sends credentials:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Authorization: Basic dXNlcjpwYXNz
```

**Accept** — Tells the server what format the client wants:
```
Accept: application/json
Accept: text/html, application/xhtml+xml
Accept: image/webp, image/png, */*
```

**Cookie** — Sends stored cookies back to the server:
```
Cookie: session=abc123; theme=dark
```

### Response Headers (Sent by Server)

**Cache-Control** — Controls browser and CDN caching:
```
Cache-Control: public, max-age=31536000          // Cache for 1 year
Cache-Control: no-cache                          // Always revalidate
Cache-Control: no-store                          // Never cache
Cache-Control: private, max-age=0, must-revalidate
```

**Set-Cookie** — Tells the browser to store a cookie:
```
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

**X-Headers** — Custom or non-standard headers:
```
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
X-RateLimit-Remaining: 42
X-Powered-By: Express    // Consider removing — leaks server info
```

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

---

## Request & Response Body

### JSON (Most Common)

The standard format for REST API communication:

```typescript
// Sending JSON
fetch('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', age: 30 }),
});

// Receiving JSON
const response = await fetch('/api/data');
const data = await response.json(); // Parses JSON body
```

### FormData (File Uploads)

Used for file uploads and traditional form submissions:

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'My photo');

// Note: Do NOT set Content-Type manually — browser sets it with boundary
fetch('/api/upload', { method: 'POST', body: formData });
```

### URL-Encoded (Traditional Forms)

```
name=Alice&email=alice%40example.com
```

The default for HTML `<form>` submissions without `enctype` attribute.

### Multipart

Used when a single request contains mixed content types (text fields + files).
The browser handles this automatically when using `FormData`.

---

## Cookies

Cookies are small pieces of data the server asks the browser to store and send back
with every subsequent request to that domain.

### Set-Cookie Header

```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.example.com; Max-Age=86400
```

### Cookie Attributes

| Attribute | Purpose | Default |
|-----------|---------|---------|
| **HttpOnly** | Cannot be read by JavaScript (`document.cookie`) — prevents XSS theft | Not set (JS can read) |
| **Secure** | Only sent over HTTPS | Not set |
| **SameSite=Strict** | Only sent on same-site requests — full CSRF protection | Lax (modern browsers) |
| **SameSite=Lax** | Sent on same-site + top-level navigations (clicking links) | Default in Chrome |
| **SameSite=None** | Sent on all requests (requires Secure) — needed for third-party cookies | — |
| **Path** | Cookie only sent for requests to this path and subpaths | `/` |
| **Domain** | Which domain(s) receive the cookie | Current host only |
| **Max-Age** | Seconds until cookie expires | Session (browser close) |
| **Expires** | Specific date/time the cookie expires | Session |

### Frontend Perspective

- You can read/write non-HttpOnly cookies via `document.cookie`
- HttpOnly cookies are invisible to JavaScript (this is the point — security)
- Cookies are sent automatically by the browser — no `fetch()` configuration needed
  for same-origin requests
- For cross-origin requests with cookies, you need `credentials: 'include'`

---

## HTTP/1.1

Released in 1997 and still widely used.

### Keep-Alive

HTTP/1.0 opened a new TCP connection for every request. HTTP/1.1 introduced persistent
connections — the same TCP connection is reused for multiple requests.

```
Connection: keep-alive    // Default in HTTP/1.1
```

### Pipelining

The ability to send multiple requests without waiting for responses. Sounds great but:

- Responses must come back in order (FIFO)
- Most browsers disabled it due to buggy server implementations
- Effectively unused in practice

### Head-of-Line (HOL) Blocking

The critical performance problem of HTTP/1.1:

```
Request A ──────────────────> (slow response)
Request B ──── (waiting...) ─────────────>
Request C ──── (waiting...) ──── (waiting...) ────>
```

If Request A is slow, all subsequent requests on that connection are blocked.

**Workaround**: Browsers open 6 parallel TCP connections per domain. Developers use
domain sharding (serving assets from multiple subdomains) to increase parallelism.

---

## HTTP/2

Introduced in 2015. Major performance improvements.

### Binary Framing

HTTP/2 is binary, not text. Messages are split into small frames that can be
interleaved on a single connection.

### Multiplexing

Multiple requests and responses can be in-flight simultaneously on a single TCP connection.
No more head-of-line blocking at the HTTP level.

```
Connection: ──Frame(A)──Frame(B)──Frame(A)──Frame(C)──Frame(B)──>
```

This eliminates the need for:
- Domain sharding
- CSS/JS concatenation (bundling still useful for other reasons)
- Image sprites (mostly)

### Header Compression (HPACK)

HTTP headers are often repetitive (same cookies, same user-agent on every request).
HPACK compresses headers using a shared dictionary, significantly reducing overhead.

### Server Push

The server can proactively send resources before the client requests them:

1. Client requests `index.html`
2. Server sends `index.html` AND pushes `style.css` and `app.js`

In practice, server push has been largely abandoned because:
- Hard to implement correctly
- Conflicts with browser cache (pushing already-cached resources)
- 103 Early Hints is a better alternative

### Frontend Impact

- Enable HTTP/2 on your server/CDN (most already do)
- Fewer micro-optimizations needed (no sprites, less bundling pressure)
- Still bundle JS for tree-shaking and scope-hoisting, not for HTTP reasons

---

## HTTP/3

The newest version, standardized in 2022.

### QUIC Protocol

HTTP/3 replaces TCP with QUIC, a UDP-based transport protocol developed by Google.

### Why QUIC?

TCP has head-of-line blocking at the transport layer — if one TCP packet is lost,
all subsequent data waits for retransmission. QUIC solves this:

- **Stream-level independence**: A lost packet in one stream doesn't block others
- **0-RTT connection establishment**: Can send data on the very first packet
  (TCP requires a 3-way handshake + TLS handshake before data flows)
- **Connection migration**: Switching from WiFi to cellular doesn't break the connection
  (QUIC uses connection IDs, not IP+port tuples)
- **Built-in encryption**: TLS 1.3 is integrated into QUIC — always encrypted

### Frontend Impact

- Faster page loads on poor networks (mobile, high-latency)
- Better experience when switching networks
- No action required from frontend devs — it's a server/CDN configuration
- Check browser DevTools Protocol column to see if your site uses h3

---

## REST Principles

REST (Representational State Transfer) is an architectural style, not a protocol.
Most "REST APIs" you work with follow some (but rarely all) REST principles.

### Core Principles

1. **Resources**: Everything is a resource identified by a URL
   ```
   /api/users          — collection of users
   /api/users/42       — specific user
   /api/users/42/posts — user's posts
   ```

2. **Stateless**: Each request contains all information needed. No server-side session
   state between requests.

3. **Uniform Interface**: Consistent patterns across all resources:
   - `GET /users` → list users
   - `GET /users/42` → get one user
   - `POST /users` → create user
   - `PUT /users/42` → replace user
   - `PATCH /users/42` → update user
   - `DELETE /users/42` → delete user

4. **Client-Server**: Frontend and backend are independent — they communicate
   only through the API contract.

5. **Cacheable**: Responses should indicate whether they can be cached.

6. **Layered System**: Client doesn't know if it's talking directly to the server
   or through a proxy/CDN/load balancer.

---

## Content Negotiation

The process by which client and server agree on the format of the response.

### How It Works

```
Client sends:
Accept: application/json, text/html;q=0.9, */*;q=0.8
Accept-Language: en-US, en;q=0.9, fr;q=0.8
Accept-Encoding: gzip, deflate, br

Server responds with the best match:
Content-Type: application/json
Content-Language: en-US
Content-Encoding: gzip
```

The `q` parameter (quality value) indicates preference from 0 to 1 (default 1).

### Frontend Relevance

- `fetch()` sets `Accept` automatically based on usage
- Setting `Accept: application/json` explicitly is good practice for API calls
- `Accept-Encoding` is handled by the browser — compression is free performance

---

## Frontend Relevance

### DevTools Network Tab

The most important debugging tool for HTTP:

- **Status column**: Quick check — green (2xx), redirect (3xx), red (4xx/5xx)
- **Headers tab**: See exactly what was sent and received
- **Preview/Response tab**: See the response body
- **Timing tab**: DNS lookup, TCP connection, TLS, TTFB, content download
- **Waterfall**: Visual timeline showing request ordering and blocking

### Common Debugging Scenarios

| Symptom | Likely Cause |
|---------|-------------|
| 401 after login | Token expired or not being sent |
| CORS error | Missing Access-Control headers on server |
| 413 error | File upload too large |
| Slow TTFB | Server processing is slow, not a frontend issue |
| Duplicate requests | React StrictMode (dev only) or missing abort controller |
| 304 but stale data | Cache-Control misconfiguration |

### Performance Quick Wins

1. Enable HTTP/2 (or HTTP/3) on your server/CDN
2. Set proper `Cache-Control` headers for static assets
3. Use `<link rel="preconnect">` for critical third-party domains
4. Compress responses (gzip/brotli — usually server config)
5. Use `AbortController` to cancel unnecessary requests

```typescript
const controller = new AbortController();
fetch('/api/search?q=hello', { signal: controller.signal });

// Cancel if user types again before response arrives
controller.abort();
```

---

## Key Takeaways

1. HTTP is stateless — every request is independent
2. Use the correct HTTP method for each operation (GET to read, POST to create, etc.)
3. Status codes tell you what happened — learn the common ones by heart
4. Headers control caching, authentication, content type, and security
5. HTTP/2 multiplexing eliminated most HTTP/1.1 performance hacks
6. HTTP/3 (QUIC) improves mobile and unreliable network performance
7. Cookies are sent automatically; tokens in `Authorization` headers are not
8. The DevTools Network tab is your best friend for debugging HTTP issues
