// ============================================================================
// api-routes: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/api-routes/solutions.ts
// ============================================================================

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
  path: string;
  handlers: Partial<Record<HttpMethod, RouteHandler>>;
}

interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function matchRoute(pattern: string, url: string): { matched: boolean; params: Record<string, string> } {
  const urlPath = url.split('?')[0];
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = urlPath.split('/').filter(Boolean);
  if (patternParts.length !== urlParts.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('[') && patternParts[i].endsWith(']')) {
      params[patternParts[i].slice(1, -1)] = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}

// ─── Exercise 1 ─────────────────────────────────────────────────────────────
function solution1(): void {
  console.log("GET /api/users     → 200 (GET exported)");
  console.log("POST /api/users    → 200 (POST exported)");
  console.log("DELETE /api/users  → 405 Method Not Allowed");
  console.log("GET /api/users/123 → 200 (GET exported)");
  console.log("PATCH /api/users/123 → 405 (only GET/PUT/DELETE)");
}

// ─── Exercise 2 ─────────────────────────────────────────────────────────────
function solution2(routes: RouteDefinition[], request: SimRequest): Promise<SimResponse> | SimResponse {
  for (const route of routes) {
    const { matched, params } = matchRoute(route.path, request.url);
    if (matched) {
      const handler = route.handlers[request.method];
      if (!handler) {
        return { status: 405, headers: { Allow: Object.keys(route.handlers).join(', ') }, body: { error: 'Method Not Allowed' } };
      }
      return handler(request, { params });
    }
  }
  return { status: 404, headers: {}, body: { error: 'Not Found' } };
}

// ─── Exercise 3 ─────────────────────────────────────────────────────────────
function solution3(config: {
  method: HttpMethod; url: string; body?: unknown;
  headers?: Record<string, string>; cookies?: Record<string, string>;
}): SimRequest {
  const [path, query] = config.url.split('?');
  const searchParams: Record<string, string> = {};
  if (query) {
    for (const pair of query.split('&')) {
      const [k, v] = pair.split('=');
      searchParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  }
  return {
    method: config.method,
    url: path,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      ...config.headers,
    },
    body: config.body,
    cookies: config.cookies || {},
    searchParams,
  };
}

// ─── Exercise 4 ─────────────────────────────────────────────────────────────
function solution4Json(data: unknown, options?: { status?: number; headers?: Record<string, string> }): SimResponse {
  return {
    status: options?.status || 200,
    headers: { 'content-type': 'application/json', ...options?.headers },
    body: data,
  };
}

function solution4Redirect(url: string, status: 301 | 302 | 307 | 308 = 307): SimResponse {
  return { status, headers: { location: url }, body: null };
}

// ─── Exercise 5 ─────────────────────────────────────────────────────────────
function solution5(): void {
  console.log("A → Static (no Request param, no dynamic functions)");
  console.log("B → Dynamic (uses request.nextUrl.searchParams)");
  console.log("C → Static (GET without Request param, fetch is cached)");
  console.log("D → Dynamic (POST is always dynamic)");
}

// ─── Exercise 6 ─────────────────────────────────────────────────────────────
function solution6(pattern: string, url: string): {
  matched: boolean; params: Record<string, string>; searchParams: Record<string, string>;
} {
  const [urlPath, query] = url.split('?');
  const { matched, params } = matchRoute(pattern, urlPath);
  const searchParams: Record<string, string> = {};
  if (query) {
    for (const pair of query.split('&')) {
      const [k, v] = pair.split('=');
      searchParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  }
  return { matched, params, searchParams };
}

// ─── Exercise 7 ─────────────────────────────────────────────────────────────
function solution7Cors(allowedOrigins: string[], request: SimRequest): { headers: Record<string, string>; allowed: boolean } {
  const origin = request.headers['origin'] || '';
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  return {
    headers: {
      'access-control-allow-origin': isAllowed ? (allowedOrigins.includes('*') ? '*' : origin) : '',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization',
    },
    allowed: isAllowed,
  };
}

function solution7Options(allowedOrigins: string[], request: SimRequest): SimResponse {
  const { headers } = solution7Cors(allowedOrigins, request);
  return { status: 204, headers, body: null };
}

// ─── Exercise 8 ─────────────────────────────────────────────────────────────
function solution8(body: Record<string, unknown>, rules: ValidationRule[]): {
  valid: boolean; errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];
  for (const rule of rules) {
    const value = body[rule.field];
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: rule.field, message: `${rule.field} is required` });
      continue;
    }
    if (value === undefined || value === null) continue;
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push({ field: rule.field, message: `${rule.field} must be a string` });
    } else if (rule.type === 'number' && typeof value !== 'number') {
      errors.push({ field: rule.field, message: `${rule.field} must be a number` });
    } else if (rule.type === 'email' && (typeof value !== 'string' || !value.includes('@'))) {
      errors.push({ field: rule.field, message: `${rule.field} must be a valid email` });
    }
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.minLength} chars` });
      if (rule.maxLength && value.length > rule.maxLength) errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.maxLength} chars` });
    }
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) errors.push({ field: rule.field, message: `${rule.field} must be >= ${rule.min}` });
      if (rule.max !== undefined && value > rule.max) errors.push({ field: rule.field, message: `${rule.field} must be <= ${rule.max}` });
    }
  }
  return { valid: errors.length === 0, errors };
}

// ─── Exercise 9 ─────────────────────────────────────────────────────────────
function solution9(items: string[], delayMs: number): { stream: AsyncGenerator<string>; contentType: string } {
  async function* generator(): AsyncGenerator<string> {
    for (const item of items) {
      yield `data: ${item}\n\n`;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return { stream: generator(), contentType: 'text/event-stream' };
}

// ─── Exercise 10 ────────────────────────────────────────────────────────────
class Solution10RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(clientId: string, nowMs: number = Date.now()): { allowed: boolean; remaining: number; resetMs: number } {
    const timestamps = this.requests.get(clientId) || [];
    const windowStart = nowMs - this.windowMs;
    const recent = timestamps.filter(t => t > windowStart);
    this.requests.set(clientId, recent);
    if (recent.length >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetMs: recent[0] + this.windowMs - nowMs };
    }
    recent.push(nowMs);
    this.requests.set(clientId, recent);
    return { allowed: true, remaining: this.maxRequests - recent.length, resetMs: 0 };
  }
}

// ─── Exercise 11 ────────────────────────────────────────────────────────────
function solution11CreateCRUD<T extends { id: string }>(initialData: T[]): {
  GET: RouteHandler; POST: RouteHandler; PUT: RouteHandler; DELETE: RouteHandler;
} {
  const data = [...initialData];
  return {
    GET: async (req, ctx) => {
      if (ctx.params.id) {
        const item = data.find(d => d.id === ctx.params.id);
        return item ? { status: 200, headers: {}, body: item } : { status: 404, headers: {}, body: { error: 'Not found' } };
      }
      return { status: 200, headers: {}, body: data };
    },
    POST: async (req) => {
      const item = req.body as T;
      data.push(item);
      return { status: 201, headers: {}, body: item };
    },
    PUT: async (req, ctx) => {
      const idx = data.findIndex(d => d.id === ctx.params.id);
      if (idx === -1) return { status: 404, headers: {}, body: { error: 'Not found' } };
      data[idx] = { ...data[idx], ...(req.body as Partial<T>) };
      return { status: 200, headers: {}, body: data[idx] };
    },
    DELETE: async (_req, ctx) => {
      const idx = data.findIndex(d => d.id === ctx.params.id);
      if (idx === -1) return { status: 404, headers: {}, body: { error: 'Not found' } };
      data.splice(idx, 1);
      return { status: 204, headers: {}, body: null };
    },
  };
}

// ─── Exercise 12 ────────────────────────────────────────────────────────────
function solution12(error: unknown, context?: string): SimResponse {
  if (error instanceof Error) {
    const statusMap: Record<string, number> = {
      NotFoundError: 404, ValidationError: 400, UnauthorizedError: 401, ForbiddenError: 403,
    };
    const status = statusMap[error.constructor.name] || 500;
    return { status, headers: { 'content-type': 'application/json' }, body: { error: { message: error.message, code: error.constructor.name, context } } };
  }
  return { status: 500, headers: { 'content-type': 'application/json' }, body: { error: { message: 'Internal Server Error', code: 'UNKNOWN', context } } };
}

// ─── Exercise 13 ────────────────────────────────────────────────────────────
function solution13(): void {
  console.log("Issue 1: page.tsx and route.ts conflict — cannot have both in same segment");
  console.log("Issue 2: Default export not supported — must use named exports (GET, POST, etc.)");
  console.log("Issue 3: Using cookies() makes GET handler dynamic (not cached)");
}

// ─── Exercise 14 ────────────────────────────────────────────────────────────
function solution14(
  request: SimRequest,
  handlers: Record<string, Record<string, RouteHandler>>
): Promise<SimResponse> | SimResponse {
  let version = request.headers['api-version'];
  if (!version) {
    const vMatch = request.url.match(/\/api\/v(\d+)\//);
    version = vMatch ? `v${vMatch[1]}` : 'v1';
  }
  const versionHandlers = handlers[version];
  if (!versionHandlers) return { status: 404, headers: {}, body: { error: `API version ${version} not found` } };
  const url = request.url.replace(/\/api\/v\d+/, '/api');
  for (const [path, handler] of Object.entries(versionHandlers)) {
    const { matched, params } = matchRoute(path, url);
    if (matched) return handler(request, { params });
  }
  return { status: 404, headers: {}, body: { error: 'Not Found' } };
}

// ─── Exercise 15 ────────────────────────────────────────────────────────────
class Solution15ApiFramework {
  private routes: RouteDefinition[] = [];
  private middlewares: Array<(req: SimRequest, next: () => Promise<SimResponse>) => Promise<SimResponse>> = [];

  route(path: string, handlers: Partial<Record<HttpMethod, RouteHandler>>): void {
    this.routes.push({ path, handlers });
  }

  use(mw: (req: SimRequest, next: () => Promise<SimResponse>) => Promise<SimResponse>): void {
    this.middlewares.push(mw);
  }

  async handle(request: SimRequest): Promise<SimResponse> {
    let idx = 0;
    const runMiddleware = async (): Promise<SimResponse> => {
      if (idx < this.middlewares.length) {
        return this.middlewares[idx++](request, runMiddleware);
      }
      return solution2(this.routes, request) as SimResponse;
    };
    return runMiddleware();
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Exercise 1 ===");
  solution1();

  console.log("\n=== Exercise 2: Route Dispatcher ===");
  const routes: RouteDefinition[] = [
    { path: '/api/users', handlers: { GET: async () => ({ status: 200, headers: {}, body: [{ id: '1', name: 'Alice' }] }) } },
    { path: '/api/users/[id]', handlers: { GET: async (_r, c) => ({ status: 200, headers: {}, body: { id: c.params.id } }) } },
  ];
  console.log(await solution2(routes, { method: 'GET', url: '/api/users', headers: {} }));
  console.log(await solution2(routes, { method: 'GET', url: '/api/users/42', headers: {} }));
  console.log(await solution2(routes, { method: 'DELETE', url: '/api/users', headers: {} }));

  console.log("\n=== Exercise 3: Request Builder ===");
  console.log(solution3({ method: 'GET', url: '/api/users?page=2&sort=name' }));

  console.log("\n=== Exercise 4: Response Builder ===");
  console.log(solution4Json({ users: [] }, { status: 200 }));
  console.log(solution4Redirect('/login'));

  console.log("\n=== Exercise 5 ===");
  solution5();

  console.log("\n=== Exercise 6: URL Params ===");
  console.log(solution6('/api/users/[id]/posts/[postId]', '/api/users/42/posts/99?sort=date'));

  console.log("\n=== Exercise 7: CORS ===");
  console.log(solution7Cors(['https://example.com'], { method: 'GET', url: '/', headers: { origin: 'https://example.com' } }));

  console.log("\n=== Exercise 8: Validation ===");
  console.log(solution8({ name: 'A', email: 'bad' }, [
    { field: 'name', type: 'string', required: true, minLength: 2 },
    { field: 'email', type: 'email', required: true },
  ]));

  console.log("\n=== Exercise 9: Streaming ===");
  const { stream } = solution9(['hello', 'world'], 10);
  for await (const chunk of stream) process.stdout.write(chunk);

  console.log("\n=== Exercise 10: Rate Limiter ===");
  const rl = new Solution10RateLimiter(1000, 3);
  console.log(rl.check('user1', 0));
  console.log(rl.check('user1', 100));
  console.log(rl.check('user1', 200));
  console.log(rl.check('user1', 300));

  console.log("\n=== Exercise 11: CRUD ===");
  const crud = solution11CreateCRUD([{ id: '1', name: 'Alice' }]);
  console.log(await crud.GET({ method: 'GET', url: '/api/users', headers: {} }, { params: {} }));

  console.log("\n=== Exercise 12: Error Response ===");
  console.log(solution12(new Error('Not found'), 'user lookup'));

  console.log("\n=== Exercise 13 ===");
  solution13();

  console.log("\n=== Exercise 15: Framework ===");
  const fw = new Solution15ApiFramework();
  fw.use(async (req, next) => { console.log(`[LOG] ${req.method} ${req.url}`); return next(); });
  fw.route('/api/hello', { GET: async () => ({ status: 200, headers: {}, body: { msg: 'Hello!' } }) });
  console.log(await fw.handle({ method: 'GET', url: '/api/hello', headers: {} }));
}

main().catch(console.error);
