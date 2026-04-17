// ============================================================================
// api-routes: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/api-routes/exercises.ts
// ============================================================================

// ─── Types ──────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface SimRequest {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  cookies?: Record<string, string>;
  searchParams?: Record<string, string>;
}

interface SimResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

type RouteHandler = (req: SimRequest, context: { params: Record<string, string> }) => Promise<SimResponse> | SimResponse;

interface RouteDefinition {
  path: string;     // e.g., '/api/users/[id]'
  handlers: Partial<Record<HttpMethod, RouteHandler>>;
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
function exercise1(): void {
  const routes = [
    { file: 'app/api/users/route.ts', exports: ['GET', 'POST'] },
    { file: 'app/api/users/[id]/route.ts', exports: ['GET', 'PUT', 'DELETE'] },
    { file: 'app/api/posts/route.ts', exports: ['GET'] },
  ];
  // Which HTTP methods are supported at each URL?
  // What happens with unsupported methods?
  console.log("Exercise 1 - predict supported methods per URL");
}

// YOUR ANSWER:
// GET /api/users     → ???
// POST /api/users    → ???
// DELETE /api/users  → ???
// GET /api/users/123 → ???
// PATCH /api/users/123 → ???

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
// Topic: Route handler dispatcher

function exercise2(
  routes: RouteDefinition[],
  request: SimRequest
): Promise<SimResponse> | SimResponse {
  // TODO: Match request URL to route, extract params, dispatch to handler
  // Return 404 if no route matches
  // Return 405 if method not supported
  return { status: 404, headers: {}, body: { error: 'Not Found' } };
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
// Topic: Request builder

function exercise3(config: {
  method: HttpMethod;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): SimRequest {
  // TODO: Build a complete SimRequest from partial config
  // Parse URL for searchParams
  // Set default headers (Content-Type, Accept)
  return { method: 'GET', url: '', headers: {}, searchParams: {} };
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
// Topic: Response builder

function exercise4Json(data: unknown, options?: { status?: number; headers?: Record<string, string> }): SimResponse {
  // TODO: Build a JSON response with proper content-type
  return { status: 200, headers: {}, body: null };
}

function exercise4Redirect(url: string, status: 301 | 302 | 307 | 308 = 307): SimResponse {
  // TODO: Build a redirect response
  return { status: 307, headers: {}, body: null };
}

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
function exercise5(): void {
  // Which route handlers are static (cached) vs dynamic?
  const handlers = [
    { name: 'A', code: 'export async function GET() { return Response.json({time: Date.now()}) }' },
    { name: 'B', code: 'export async function GET(request) { const q = request.nextUrl.searchParams; ... }' },
    { name: 'C', code: 'export async function GET() { const data = await fetch("..."); return Response.json(data) }' },
    { name: 'D', code: 'export async function POST(request) { const body = await request.json(); ... }' },
  ];
  console.log("Exercise 5 - predict static vs dynamic");
}
// YOUR ANSWER: A→??? B→??? C→??? D→???

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
// Topic: URL params extractor

function exercise6(pattern: string, url: string): {
  matched: boolean;
  params: Record<string, string>;
  searchParams: Record<string, string>;
} {
  // TODO: Extract dynamic params AND search params from URL
  // Pattern: '/api/users/[id]/posts/[postId]'
  // URL: '/api/users/42/posts/99?sort=date&page=1'
  return { matched: false, params: {}, searchParams: {} };
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
// Topic: CORS middleware for route handlers

function exercise7Cors(
  allowedOrigins: string[],
  request: SimRequest
): { headers: Record<string, string>; allowed: boolean } {
  // TODO: Generate CORS headers
  // Check Origin header against allowed origins
  // Handle wildcard '*'
  return { headers: {}, allowed: false };
}

function exercise7Options(allowedOrigins: string[], request: SimRequest): SimResponse {
  // TODO: Handle preflight OPTIONS request
  return { status: 200, headers: {}, body: null };
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
// Topic: Request validation

interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function exercise8(body: Record<string, unknown>, rules: ValidationRule[]): {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  // TODO: Validate request body against rules
  return { valid: true, errors: [] };
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: Streaming response builder

function exercise9(
  items: string[],
  delayMs: number
): { stream: AsyncGenerator<string>; contentType: string } {
  // TODO: Create an SSE-style async generator
  // Yield items as "data: {item}\n\n" with delay between each
  async function* generator(): AsyncGenerator<string> {
    // implement
  }
  return { stream: generator(), contentType: 'text/event-stream' };
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Rate limiting for route handlers

class Exercise10RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(clientId: string, nowMs?: number): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
  } {
    // TODO: Sliding window rate limiting
    return { allowed: true, remaining: this.maxRequests, resetMs: 0 };
  }
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Route handler with full CRUD

function exercise11CreateCRUD<T extends { id: string }>(
  initialData: T[]
): {
  GET: RouteHandler;
  POST: RouteHandler;
  PUT: RouteHandler;
  DELETE: RouteHandler;
} {
  // TODO: Create full CRUD handlers operating on in-memory array
  const data = [...initialData];
  return {
    GET: async (req) => ({ status: 200, headers: {}, body: data }),
    POST: async (req) => ({ status: 201, headers: {}, body: null }),
    PUT: async (req, ctx) => ({ status: 200, headers: {}, body: null }),
    DELETE: async (req, ctx) => ({ status: 204, headers: {}, body: null }),
  };
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Error response builder with standard format

function exercise12(
  error: unknown,
  context?: string
): SimResponse {
  // TODO: Convert any error into a standardized error response
  // { error: { message, code, context } }
  // Map known error types to status codes
  return { status: 500, headers: {}, body: { error: 'Internal Server Error' } };
}

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
function exercise13(): void {
  // What's wrong with these route handler setups?
  const issues = [
    { file: 'app/api/users/page.tsx AND app/api/users/route.ts', issue: '???' },
    { file: 'app/api/route.ts exporting default function', issue: '???' },
    { file: 'app/api/users/route.ts with GET using cookies()', issue: '???' },
  ];
  console.log("Exercise 13 - identify issues");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: API versioning router

function exercise14(
  request: SimRequest,
  handlers: Record<string, Record<string, RouteHandler>> // version → path → handler
): Promise<SimResponse> | SimResponse {
  // TODO: Route to correct handler based on API version
  // Version from header 'api-version' or URL prefix '/api/v2/...'
  return { status: 404, headers: {}, body: { error: 'Not Found' } };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Complete API framework simulation

class Exercise15ApiFramework {
  private routes: RouteDefinition[] = [];
  private middleware: Array<(req: SimRequest, next: () => Promise<SimResponse>) => Promise<SimResponse>> = [];

  route(path: string, handlers: Partial<Record<HttpMethod, RouteHandler>>): void {
    // TODO: Register route
  }

  use(mw: (req: SimRequest, next: () => Promise<SimResponse>) => Promise<SimResponse>): void {
    // TODO: Register middleware
  }

  async handle(request: SimRequest): Promise<SimResponse> {
    // TODO: Run middleware chain, then dispatch to route handler
    return { status: 404, headers: {}, body: { error: 'Not Found' } };
  }
}

export {
  exercise1, exercise2, exercise3, exercise4Json, exercise4Redirect,
  exercise5, exercise6, exercise7Cors, exercise7Options,
  exercise8, exercise9, Exercise10RateLimiter, exercise11CreateCRUD,
  exercise12, exercise13, exercise14, Exercise15ApiFramework,
};
