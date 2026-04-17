# API Routes (Route Handlers)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Route Handler Basics](#2-route-handler-basics)
3. [HTTP Methods](#3-http-methods)
4. [NextRequest and NextResponse](#4-nextrequest-and-nextresponse)
5. [Request Parsing](#5-request-parsing)
6. [Response Types](#6-response-types)
7. [Streaming Responses](#7-streaming-responses)
8. [CORS](#8-cors)
9. [Dynamic vs Static Route Handlers](#9-dynamic-vs-static-route-handlers)
10. [Error Handling](#10-error-handling)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

In the App Router, API routes are called **Route Handlers**. They live in the `app/`
directory alongside pages, using the special `route.ts` (or `route.js`) filename.

```typescript
// File: app/api/users/route.ts
// Accessible at: GET /api/users, POST /api/users, etc.

// Key differences from Pages Router API routes:
const comparison = {
  pagesRouter: {
    file: 'pages/api/users.ts',
    export: 'default function handler(req, res)',
    request: 'req: NextApiRequest',
    response: 'res: NextApiResponse',
  },
  appRouter: {
    file: 'app/api/users/route.ts',
    export: 'export async function GET(request)',
    request: 'request: NextRequest (Web API)',
    response: 'return NextResponse or Response',
  },
};
```

---

## 2. Route Handler Basics

### 2.1 File Convention

```
app/
├── api/
│   ├── users/
│   │   └── route.ts          ← /api/users
│   ├── users/[id]/
│   │   └── route.ts          ← /api/users/:id
│   └── posts/
│       └── route.ts          ← /api/posts
```

**Important:** A route segment cannot have both `route.ts` and `page.tsx`. They conflict.

### 2.2 Named Exports for HTTP Methods

```typescript
// Each HTTP method is a named export:
// export async function GET(request: NextRequest) { ... }
// export async function POST(request: NextRequest) { ... }
// export async function PUT(request: NextRequest) { ... }
// export async function PATCH(request: NextRequest) { ... }
// export async function DELETE(request: NextRequest) { ... }
// export async function HEAD(request: NextRequest) { ... }
// export async function OPTIONS(request: NextRequest) { ... }

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
```

---

## 3. HTTP Methods

### 3.1 GET — Read Data

```typescript
// Conceptual representation:
const getHandler = {
  method: 'GET',
  caching: 'Cached by default (like fetch with force-cache)',
  dynamicTriggers: [
    'Using Request object',
    'Using dynamic functions (cookies, headers)',
    'Using dynamic route segment config',
  ],
};
```

### 3.2 POST/PUT/PATCH — Write Data

```typescript
const writeHandler = {
  method: 'POST',
  caching: 'Never cached (mutation)',
  bodyParsing: 'await request.json(), request.formData(), request.text()',
};
```

### 3.3 DELETE — Remove Data

```typescript
const deleteHandler = {
  method: 'DELETE',
  pattern: 'Often uses URL params for resource ID',
  example: 'DELETE /api/users/123',
};
```

---

## 4. NextRequest and NextResponse

### 4.1 NextRequest

```typescript
// NextRequest extends the Web API Request with Next.js additions:
const nextRequestFeatures = {
  cookies: 'request.cookies.get("token")',
  nextUrl: 'request.nextUrl — parsed URL with searchParams',
  geo: 'request.geo — geolocation data',
  ip: 'request.ip — client IP address',
  standard: ['request.json()', 'request.text()', 'request.formData()', 'request.headers'],
};
```

### 4.2 NextResponse

```typescript
// NextResponse extends Response with convenience methods:
const nextResponseFeatures = {
  json: 'NextResponse.json(data, { status: 200 })',
  redirect: 'NextResponse.redirect(new URL("/login", request.url))',
  rewrite: 'NextResponse.rewrite(new URL("/api/v2/users", request.url))',
  next: 'NextResponse.next() — continue middleware chain',
  cookies: 'response.cookies.set("token", "value")',
};
```

---

## 5. Request Parsing

### 5.1 URL Parameters

```typescript
// Dynamic segments in Route Handlers:
// app/api/users/[id]/route.ts
// export async function GET(request: NextRequest, { params }) {
//   const { id } = await params;
//   return NextResponse.json({ userId: id });
// }

// Query parameters:
// const searchParams = request.nextUrl.searchParams;
// const page = searchParams.get('page');
```

### 5.2 Body Parsing

```typescript
const bodyParsing = {
  json: 'const data = await request.json()',
  formData: 'const form = await request.formData()',
  text: 'const text = await request.text()',
  blob: 'const blob = await request.blob()',
  arrayBuffer: 'const buffer = await request.arrayBuffer()',
};
```

### 5.3 Headers and Cookies

```typescript
const headerAccess = {
  headers: 'request.headers.get("Authorization")',
  cookies: 'request.cookies.get("session")?.value',
  contentType: 'request.headers.get("content-type")',
};
```

---

## 6. Response Types

### 6.1 JSON Response

```typescript
// return NextResponse.json({ users: [...] }, { status: 200 });
// return NextResponse.json({ error: 'Not found' }, { status: 404 });
```

### 6.2 Text/HTML Response

```typescript
// return new Response('Hello World', {
//   headers: { 'content-type': 'text/plain' },
// });
```

### 6.3 Redirect

```typescript
// return NextResponse.redirect(new URL('/login', request.url));
// return Response.redirect('https://example.com', 301);
```

---

## 7. Streaming Responses

### 7.1 ReadableStream

```typescript
// Route Handlers support streaming with Web Streams API:
// export async function GET() {
//   const stream = new ReadableStream({
//     async start(controller) {
//       for (let i = 0; i < 10; i++) {
//         controller.enqueue(new TextEncoder().encode(`data: ${i}\n\n`));
//         await new Promise(r => setTimeout(r, 1000));
//       }
//       controller.close();
//     },
//   });
//   return new Response(stream, {
//     headers: { 'content-type': 'text/event-stream' },
//   });
// }
```

### 7.2 Server-Sent Events (SSE)

```typescript
const ssePattern = {
  contentType: 'text/event-stream',
  format: 'data: {json}\n\n',
  useCase: 'Real-time updates, live feeds, AI streaming',
};
```

---

## 8. CORS

### 8.1 CORS Headers

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight:
// export async function OPTIONS() {
//   return new Response(null, { headers: corsHeaders });
// }
```

---

## 9. Dynamic vs Static Route Handlers

### 9.1 Static Route Handlers (Cached)

```typescript
// GET handlers without Request object are cached at build time:
// export async function GET() {
//   const data = await fetch('https://api.example.com/data');
//   return Response.json(await data.json());
// }
// This behaves like SSG — response cached at build time
```

### 9.2 Dynamic Route Handlers

```typescript
const dynamicTriggers = [
  'Using the Request object (request parameter)',
  'Using cookies() or headers()',
  'Dynamic route segments [param]',
  'export const dynamic = "force-dynamic"',
];
```

---

## 10. Error Handling

```typescript
// Pattern: try/catch with appropriate status codes
// try {
//   const data = await db.users.findOne(id);
//   if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//   return NextResponse.json(data);
// } catch (error) {
//   return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// }
```

---

## 11. Best Practices

- Use Route Handlers for external API consumers
- Use Server Actions for internal form submissions
- Always validate input data
- Return appropriate HTTP status codes
- Handle errors with try/catch
- Use streaming for long-running operations
- Add CORS headers for cross-origin access

---

## Further Reading

- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextRequest API](https://nextjs.org/docs/app/api-reference/functions/next-request)
- [NextResponse API](https://nextjs.org/docs/app/api-reference/functions/next-response)
