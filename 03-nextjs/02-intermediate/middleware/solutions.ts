// ============================================================================
// middleware: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/middleware/solutions.ts
// ============================================================================

interface MWRequest {
  url: string; method: string; headers: Record<string, string>;
  cookies: Record<string, string>; geo?: { country?: string; city?: string }; ip?: string;
}
interface MWResponse {
  type: 'next' | 'redirect' | 'rewrite' | 'json';
  status?: number; headers?: Record<string, string>; url?: string; body?: unknown;
}
type MiddlewareHandler = (req: MWRequest) => MWResponse | null;

function solution1(): void {
  console.log("'/dashboard/:path*' matches: /dashboard, /dashboard/settings");
  console.log("'/api/:path*' matches: /api/users");
  console.log("Negative lookahead matches: /about, / but NOT /_next/static/chunk.js");
}

function solution2(pattern: string, url: string): boolean {
  let regex = pattern
    .replace(/:path\*/g, '.*')
    .replace(/:(\w+)/g, '[^/]+');
  if (pattern.startsWith('/(') && pattern.includes('(?!')) {
    try { return new RegExp(`^${pattern}$`).test(url); } catch { return false; }
  }
  return new RegExp(`^${regex}$`).test(url);
}

function solution3Auth(request: MWRequest, protectedPaths: string[]): MWResponse | null {
  const isProtected = protectedPaths.some(p => request.url === p || request.url.startsWith(p + '/'));
  if (!isProtected) return null;
  if (!request.cookies['session-token']) {
    return { type: 'redirect', status: 307, url: `/login?from=${encodeURIComponent(request.url)}` };
  }
  return null;
}

function solution4Redirect(rules: Array<{ from: string; to: string; permanent: boolean }>): MiddlewareHandler {
  return (req) => {
    for (const rule of rules) {
      if (req.url === rule.from || req.url.startsWith(rule.from + '/')) {
        const newUrl = req.url.replace(rule.from, rule.to);
        return { type: 'redirect', status: rule.permanent ? 308 : 307, url: newUrl };
      }
    }
    return null;
  };
}

function solution5Rewrite(rules: Array<{ match: string; rewriteTo: string }>): MiddlewareHandler {
  return (req) => {
    for (const rule of rules) {
      if (solution2(rule.match, req.url)) {
        return { type: 'rewrite', url: rule.rewriteTo };
      }
    }
    return null;
  };
}

function solution6Chain(handlers: MiddlewareHandler[]): MiddlewareHandler {
  return (req) => {
    for (const handler of handlers) {
      const result = handler(req);
      if (result) return result;
    }
    return { type: 'next' };
  };
}

class Solution7RateLimit {
  private windows = new Map<string, { count: number; resetAt: number }>();
  constructor(private maxRequests: number, private windowMs: number) {}

  check(ip: string, nowMs: number = Date.now()): MWResponse | null {
    const window = this.windows.get(ip);
    if (!window || nowMs >= window.resetAt) {
      this.windows.set(ip, { count: 1, resetAt: nowMs + this.windowMs });
      return null;
    }
    window.count++;
    if (window.count > this.maxRequests) {
      return { type: 'json', status: 429, body: { error: 'Too Many Requests' },
        headers: { 'retry-after': String(Math.ceil((window.resetAt - nowMs) / 1000)) } };
    }
    return null;
  }
}

function solution8GeoRedirect(
  request: MWRequest, rules: Array<{ countries: string[]; redirectTo: string }>
): MWResponse | null {
  const country = request.geo?.country;
  if (!country) return null;
  for (const rule of rules) {
    if (rule.countries.includes(country)) {
      return { type: 'redirect', status: 307, url: rule.redirectTo };
    }
  }
  return null;
}

function solution9HeaderInjector(
  request: MWRequest, inject: Record<string, string | ((req: MWRequest) => string)>
): MWResponse {
  const headers: Record<string, string> = { ...request.headers };
  for (const [key, value] of Object.entries(inject)) {
    headers[key] = typeof value === 'function' ? value(request) : value;
  }
  return { type: 'next', headers };
}

function solution10ABTest(
  request: MWRequest, experiments: Array<{ name: string; variants: string[]; weights: number[] }>
): { response: MWResponse; assignments: Record<string, string> } {
  const assignments: Record<string, string> = {};
  for (const exp of experiments) {
    const existing = request.cookies[`exp-${exp.name}`];
    if (existing && exp.variants.includes(existing)) {
      assignments[exp.name] = existing;
    } else {
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < exp.variants.length; i++) {
        cumulative += exp.weights[i];
        if (rand <= cumulative) { assignments[exp.name] = exp.variants[i]; break; }
      }
      if (!assignments[exp.name]) assignments[exp.name] = exp.variants[0];
    }
  }
  return { response: { type: 'next', headers: {} }, assignments };
}

function solution11CORS(allowedOrigins: string[]): MiddlewareHandler {
  return (req) => {
    const origin = req.headers['origin'];
    if (!origin) return null;
    const allowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
    if (!allowed) return { type: 'json', status: 403, body: { error: 'CORS denied' } };
    if (req.method === 'OPTIONS') {
      return { type: 'json', status: 204, body: null, headers: {
        'access-control-allow-origin': allowedOrigins.includes('*') ? '*' : origin,
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization',
      }};
    }
    return null;
  };
}

function solution12Logger(): { handler: MiddlewareHandler; getLogs: () => string[] } {
  const logs: string[] = [];
  return {
    handler: (req) => { logs.push(`${req.method} ${req.url} [${new Date().toISOString()}]`); return null; },
    getLogs: () => [...logs],
  };
}

function solution13(): void {
  console.log("Request to /old:");
  console.log("1. next.config.js redirect fires → 308 to /new");
  console.log("2. Middleware never runs (redirect happened first)");
  console.log("\nRequest to /dashboard:");
  console.log("1. next.config.js headers applied");
  console.log("2. next.config.js redirects checked (no match)");
  console.log("3. Middleware runs: auth check + header injection");
  console.log("4. Route resolved: app/dashboard/page.tsx");
}

function solution14MultiTenant(
  request: MWRequest, tenants: Record<string, { host: string; rewritePrefix: string }>
): MWResponse {
  const host = request.headers['host'] || '';
  for (const [name, config] of Object.entries(tenants)) {
    if (host === config.host || host.startsWith(config.host)) {
      return { type: 'rewrite', url: `${config.rewritePrefix}${request.url}`, headers: { 'x-tenant': name } };
    }
  }
  return { type: 'next' };
}

class Solution15MiddlewareFramework {
  private handlers: Array<{ matcher: string; handler: MiddlewareHandler }> = [];
  use(matcher: string, handler: MiddlewareHandler): void { this.handlers.push({ matcher, handler }); }
  handle(request: MWRequest): MWResponse {
    for (const { matcher, handler } of this.handlers) {
      if (solution2(matcher, request.url)) {
        const result = handler(request);
        if (result) return result;
      }
    }
    return { type: 'next' };
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2: Matcher ===");
  console.log(solution2('/dashboard/:path*', '/dashboard/settings'));
  console.log(solution2('/api/:path*', '/about'));

  console.log("\n=== Exercise 3: Auth ===");
  console.log(solution3Auth({ url: '/dashboard', method: 'GET', headers: {}, cookies: {} }, ['/dashboard']));
  console.log(solution3Auth({ url: '/dashboard', method: 'GET', headers: {}, cookies: { 'session-token': 'abc' } }, ['/dashboard']));

  console.log("\n=== Exercise 4: Redirect ===");
  const redir = solution4Redirect([{ from: '/old', to: '/new', permanent: true }]);
  console.log(redir({ url: '/old', method: 'GET', headers: {}, cookies: {} }));

  console.log("\n=== Exercise 5: Rewrite ===");
  const rw = solution5Rewrite([{ match: '/blog/:path*', rewriteTo: '/posts' }]);
  console.log(rw({ url: '/blog/hello', method: 'GET', headers: {}, cookies: {} }));

  console.log("\n=== Exercise 6: Chain ===");
  const logger = solution12Logger();
  const chained = solution6Chain([logger.handler, redir]);
  console.log(chained({ url: '/old', method: 'GET', headers: {}, cookies: {} }));
  console.log("Logs:", logger.getLogs());

  console.log("\n=== Exercise 7: Rate Limit ===");
  const rl = new Solution7RateLimit(2, 1000);
  console.log(rl.check('1.2.3.4', 0)); console.log(rl.check('1.2.3.4', 100));
  console.log(rl.check('1.2.3.4', 200));

  console.log("\n=== Exercise 8: Geo Redirect ===");
  console.log(solution8GeoRedirect(
    { url: '/', method: 'GET', headers: {}, cookies: {}, geo: { country: 'DE' } },
    [{ countries: ['DE', 'AT'], redirectTo: '/de' }]
  ));

  console.log("\n=== Exercise 9: Header Injection ===");
  console.log(solution9HeaderInjector(
    { url: '/', method: 'GET', headers: {}, cookies: {}, ip: '1.2.3.4' },
    { 'x-request-id': 'abc-123', 'x-client-ip': (req) => req.ip || 'unknown' }
  ));

  console.log("\n=== Exercise 10: A/B Test ===");
  console.log(solution10ABTest(
    { url: '/', method: 'GET', headers: {}, cookies: {} },
    [{ name: 'hero', variants: ['control', 'variant-a'], weights: [0.5, 0.5] }]
  ));

  console.log("\n=== Exercise 11: CORS ===");
  console.log(solution11CORS(['https://example.com'])(
    { url: '/api', method: 'OPTIONS', headers: { origin: 'https://example.com' }, cookies: {} }
  ));

  console.log("\n=== Exercise 13 ==="); solution13();

  console.log("\n=== Exercise 14: Multi-Tenant ===");
  console.log(solution14MultiTenant(
    { url: '/dashboard', method: 'GET', headers: { host: 'acme.example.com' }, cookies: {} },
    { acme: { host: 'acme.example.com', rewritePrefix: '/tenants/acme' } }
  ));

  console.log("\n=== Exercise 15: Framework ===");
  const fw = new Solution15MiddlewareFramework();
  fw.use('/api/:path*', (req) => {
    if (!req.headers['authorization']) return { type: 'json', status: 401, body: { error: 'Unauthorized' } };
    return null;
  });
  console.log(fw.handle({ url: '/api/users', method: 'GET', headers: {}, cookies: {} }));
  console.log(fw.handle({ url: '/api/users', method: 'GET', headers: { authorization: 'Bearer x' }, cookies: {} }));
}

main().catch(console.error);
