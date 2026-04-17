// ============================================================================
// middleware: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/middleware/exercises.ts
// ============================================================================

interface MWRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  geo?: { country?: string; city?: string };
  ip?: string;
}

interface MWResponse {
  type: 'next' | 'redirect' | 'rewrite' | 'json';
  status?: number;
  headers?: Record<string, string>;
  url?: string;
  body?: unknown;
}

type MiddlewareHandler = (req: MWRequest) => MWResponse | null;

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  const matchers = [
    '/dashboard/:path*',
    '/api/:path*',
    '/((?!_next/static|favicon.ico).*)',
  ];
  const urls = ['/dashboard', '/dashboard/settings', '/api/users', '/_next/static/chunk.js', '/about', '/'];
  console.log("Exercise 1 - which matcher matches which URL?");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2(pattern: string, url: string): boolean {
  // TODO: Implement Next.js matcher pattern matching
  // Support: exact paths, :path, :path*, named params
  return false;
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
function exercise3Auth(request: MWRequest, protectedPaths: string[]): MWResponse | null {
  // TODO: Auth middleware - redirect to /login if no session cookie on protected paths
  return null;
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
function exercise4Redirect(rules: Array<{ from: string; to: string; permanent: boolean }>): MiddlewareHandler {
  // TODO: Create redirect middleware from rules
  return () => null;
}

// ─── Exercise 5: Implement ──────────────────────────────────────────────────
function exercise5Rewrite(rules: Array<{ match: string; rewriteTo: string }>): MiddlewareHandler {
  // TODO: URL rewrite middleware (don't change browser URL)
  return () => null;
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6Chain(handlers: MiddlewareHandler[]): MiddlewareHandler {
  // TODO: Chain multiple middleware handlers
  // First handler to return non-null wins
  // If all return null, return { type: 'next' }
  return () => ({ type: 'next' });
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
class Exercise7RateLimit {
  private windows = new Map<string, { count: number; resetAt: number }>();
  constructor(private maxRequests: number, private windowMs: number) {}

  check(ip: string, nowMs?: number): MWResponse | null {
    // TODO: Rate limit by IP, return 429 response if exceeded
    return null;
  }
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8GeoRedirect(
  request: MWRequest,
  rules: Array<{ countries: string[]; redirectTo: string }>
): MWResponse | null {
  // TODO: Redirect based on geo country
  return null;
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9HeaderInjector(
  request: MWRequest,
  inject: Record<string, string | ((req: MWRequest) => string)>
): MWResponse {
  // TODO: Add headers to the request (pass data to route handlers)
  return { type: 'next', headers: {} };
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
function exercise10ABTest(
  request: MWRequest,
  experiments: Array<{ name: string; variants: string[]; weights: number[] }>
): { response: MWResponse; assignments: Record<string, string> } {
  // TODO: A/B test middleware - assign variants via cookies, rewrite to variant page
  return { response: { type: 'next' }, assignments: {} };
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
function exercise11CORS(allowedOrigins: string[]): MiddlewareHandler {
  // TODO: CORS middleware
  return () => null;
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
function exercise12Logger(): { handler: MiddlewareHandler; getLogs: () => string[] } {
  // TODO: Logging middleware that records all requests
  const logs: string[] = [];
  return {
    handler: () => null,
    getLogs: () => logs,
  };
}

// ─── Exercise 13: Predict ───────────────────────────────────────────────────
function exercise13(): void {
  // What's the execution order?
  const config = {
    nextConfig: { redirects: [{ source: '/old', destination: '/new', permanent: true }] },
    middleware: 'Checks auth, adds headers',
    page: 'app/dashboard/page.tsx',
  };
  console.log("Exercise 13 - predict execution order for request to /old and /dashboard");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14MultiTenant(
  request: MWRequest,
  tenants: Record<string, { host: string; rewritePrefix: string }>
): MWResponse {
  // TODO: Multi-tenant routing based on hostname
  return { type: 'next' };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15MiddlewareFramework {
  private handlers: Array<{ matcher: string; handler: MiddlewareHandler }> = [];

  use(matcher: string, handler: MiddlewareHandler): void {
    // TODO: Register handler with matcher
  }

  handle(request: MWRequest): MWResponse {
    // TODO: Run matching middleware in order
    return { type: 'next' };
  }
}

export {
  exercise1, exercise2, exercise3Auth, exercise4Redirect, exercise5Rewrite,
  exercise6Chain, Exercise7RateLimit, exercise8GeoRedirect, exercise9HeaderInjector,
  exercise10ABTest, exercise11CORS, exercise12Logger, exercise13,
  exercise14MultiTenant, Exercise15MiddlewareFramework,
};
