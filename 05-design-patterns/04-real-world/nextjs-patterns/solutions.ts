// =============================================================
// Next.js Patterns - Solutions
// =============================================================
// Run: npx tsx solutions.ts
// =============================================================

// ── Shared Types ─────────────────────────────────────────────

interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
}

interface Response {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

type Handler = (req: Request) => Response | Promise<Response>;
type Middleware = (req: Request, next: () => Response) => Response;
type Layout = (content: string) => string;

async function main() {

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

function section(name: string): void {
  console.log(`\n── ${name} ──`);
}

// =============================================================
// EXERCISE 1: Predict Output (Middleware chain)
// =============================================================
section("Exercise 1: Middleware chain order");

function compose(...middlewares: Middleware[]): (req: Request, final: () => Response) => Response {
  return (req, final) => {
    function dispatch(i: number): Response {
      if (i >= middlewares.length) return final();
      return middlewares[i](req, () => dispatch(i + 1));
    }
    return dispatch(0);
  };
}

const logs1: string[] = [];

const mw1: Middleware = (req, next) => {
  logs1.push("mw1-before");
  const res = next();
  logs1.push("mw1-after");
  return res;
};

const mw2: Middleware = (req, next) => {
  logs1.push("mw2-before");
  const res = next();
  logs1.push("mw2-after");
  return res;
};

const chain = compose(mw1, mw2);
chain(
  { method: "GET", path: "/", headers: {} },
  () => { logs1.push("handler"); return { status: 200, headers: {}, body: "ok" }; }
);
// Answer: "mw1-before → mw2-before → handler → mw2-after → mw1-after"
// Classic onion model: each middleware wraps the next
const ex1 = logs1.join(" → ");
assert(ex1 === "mw1-before → mw2-before → handler → mw2-after → mw1-after", `Chain order: ${ex1}`);

// =============================================================
// EXERCISE 2: Predict Output (Layout composition)
// =============================================================
section("Exercise 2: Layout composition");

function resolveLayouts(layouts: Layout[], page: string): string {
  return layouts.reduceRight((content, layout) => layout(content), page);
}

const rootLayout: Layout = (c) => `<html><body>${c}</body></html>`;
const dashLayout: Layout = (c) => `<div class="dash"><sidebar/>${c}</div>`;

const ex2 = resolveLayouts([rootLayout, dashLayout], "<h1>Settings</h1>");
// reduceRight: dashLayout first, then rootLayout wraps it
// dashLayout("<h1>Settings</h1>") → <div class="dash"><sidebar/><h1>Settings</h1></div>
// rootLayout(above) → <html><body><div class="dash"><sidebar/><h1>Settings</h1></div></body></html>
const expected2 = '<html><body><div class="dash"><sidebar/><h1>Settings</h1></div></body></html>';
assert(ex2 === expected2, `Layout composition correct`);

// =============================================================
// EXERCISE 3: Predict Output (Parallel fetch)
// =============================================================
section("Exercise 3: Parallel fetch");

const delays = [30, 10, 20];
const start3 = Date.now();

const fetchers3 = delays.map((ms, i) =>
  new Promise<string>(resolve => setTimeout(() => resolve(`data-${i}`), ms))
);

const results3 = await Promise.all(fetchers3);
const elapsed3 = Date.now() - start3;
// Answer: ["data-0", "data-1", "data-2"] and "parallel"
// Promise.all runs all in parallel, total time ≈ max(30,10,20) = ~30ms
assert(JSON.stringify(results3) === '["data-0","data-1","data-2"]', `Results: ${JSON.stringify(results3)}`);
assert(elapsed3 < 80, `Parallel: ${elapsed3}ms < 80ms`);

// =============================================================
// EXERCISE 4: Predict Output (Cache TTL)
// =============================================================
section("Exercise 4: Cache TTL");

class SimpleCache {
  private store = new Map<string, { value: unknown; expiry: number }>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiry: Date.now() + ttlMs });
  }
}

const cache4 = new SimpleCache();
cache4.set("a", 42, 100);
const v4a = cache4.get<number>("a");  // 42
const v4b = cache4.get<number>("b");  // undefined
assert(v4a === 42, `cache.get("a") === 42`);
assert(v4b === undefined, `cache.get("b") === undefined`);

await new Promise(r => setTimeout(r, 150));
const v4c = cache4.get<number>("a");  // undefined (expired)
assert(v4c === undefined, `cache.get("a") after TTL === undefined`);

// =============================================================
// EXERCISE 5: Fix the Bug (Middleware - short circuit)
// =============================================================
section("Exercise 5: Fix auth middleware");

// Fixed: return the result of next()
const fixedAuthMiddleware: Middleware = (req, next) => {
  if (!req.headers["authorization"]) {
    return { status: 401, headers: {}, body: "Unauthorized" };
  }
  return next();  // FIX: return the result of next()
};

const authedReq: Request = { method: "GET", path: "/api", headers: { authorization: "Bearer x" } };
const unauthedReq: Request = { method: "GET", path: "/api", headers: {} };

const res5a = fixedAuthMiddleware(authedReq, () => ({ status: 200, headers: {}, body: { users: [] } }));
assert(res5a.status === 200, `Authed request: status 200`);
assert(JSON.stringify(res5a.body) === '{"users":[]}', `Authed request: body is { users: [] }`);

const res5b = fixedAuthMiddleware(unauthedReq, () => ({ status: 200, headers: {}, body: "nope" }));
assert(res5b.status === 401, `Unauthed request: status 401`);

// =============================================================
// EXERCISE 6: Fix the Bug (Route matcher)
// =============================================================
section("Exercise 6: Fix route matcher");

interface Route {
  pattern: string;
  handler: Handler;
}

// Fixed: strip the ":" prefix from param names
function matchRoute(routes: Route[], path: string): { handler: Handler; params: Record<string, string> } | null {
  for (const route of routes) {
    const patternParts = route.pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = pathParts[i];  // FIX: slice(1) to remove ":"
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler: route.handler, params };
  }
  return null;
}

const routes6: Route[] = [
  { pattern: "/users/:id", handler: () => ({ status: 200, headers: {}, body: "user" }) },
  { pattern: "/posts/:postId/comments/:commentId", handler: () => ({ status: 200, headers: {}, body: "comment" }) },
];

const m6a = matchRoute(routes6, "/users/42");
assert(m6a !== null && m6a.params.id === "42", `Param "id" is "42" (no colon prefix)`);

const m6b = matchRoute(routes6, "/posts/5/comments/10");
assert(m6b !== null && m6b.params.postId === "5" && m6b.params.commentId === "10", `Multi params work`);

const m6c = matchRoute(routes6, "/unknown");
assert(m6c === null, `No match returns null`);

// =============================================================
// EXERCISE 7: Implement (Middleware pipeline builder)
// =============================================================
section("Exercise 7: Pipeline builder");

interface PipelineBuilder {
  use: (mw: Middleware) => PipelineBuilder;
  handle: (handler: Handler) => Handler;
}

function createPipeline(): PipelineBuilder {
  const middlewares: Middleware[] = [];

  const builder: PipelineBuilder = {
    use(mw: Middleware): PipelineBuilder {
      middlewares.push(mw);
      return builder;
    },
    handle(handler: Handler): Handler {
      return (req: Request) => {
        function dispatch(i: number): Response {
          if (i >= middlewares.length) {
            const result = handler(req);
            // Handle sync handler (for our tests)
            if (result instanceof Promise) {
              throw new Error("Sync pipeline does not support async handlers");
            }
            return result;
          }
          return middlewares[i](req, () => dispatch(i + 1));
        }
        return dispatch(0);
      };
    },
  };

  return builder;
}

const logged7: string[] = [];
const pipeline7 = createPipeline()
  .use((req, next) => { logged7.push("auth"); return next(); })
  .use((req, next) => { logged7.push("log"); return next(); })
  .handle((req) => ({ status: 200, headers: {}, body: "done" }));

const res7 = pipeline7({ method: "GET", path: "/", headers: {} }) as Response;
assert(logged7.join(",") === "auth,log", `Middlewares ran in order: ${logged7.join(",")}`);
assert(res7.body === "done", `Handler body is "done"`);

// =============================================================
// EXERCISE 8: Implement (Layout resolver)
// =============================================================
section("Exercise 8: Layout resolver");

interface LayoutRegistry {
  register: (path: string, layout: Layout) => void;
  resolve: (pagePath: string, pageContent: string) => string;
}

function createLayoutRegistry(): LayoutRegistry {
  const layouts = new Map<string, Layout>();

  return {
    register(path: string, layout: Layout) {
      layouts.set(path, layout);
    },
    resolve(pagePath: string, pageContent: string): string {
      // Find all matching layout paths from most specific to least
      const segments = pagePath.split("/").filter(Boolean);
      const layoutPaths: string[] = [];

      // Build paths: "/", "/dashboard", "/dashboard/settings", etc.
      layoutPaths.push("/");
      let current = "";
      for (const seg of segments) {
        current += `/${seg}`;
        layoutPaths.push(current);
      }

      // Apply layouts from most specific (inner) to least specific (outer)
      let content = pageContent;
      for (let i = layoutPaths.length - 1; i >= 0; i--) {
        const layout = layouts.get(layoutPaths[i]);
        if (layout) {
          content = layout(content);
        }
      }

      return content;
    },
  };
}

const reg8 = createLayoutRegistry();
reg8.register("/", (c) => `[root]${c}[/root]`);
reg8.register("/dashboard", (c) => `[dash]${c}[/dash]`);

const page8a = reg8.resolve("/dashboard/settings", "CONTENT");
assert(page8a === "[root][dash]CONTENT[/dash][/root]", `Nested layouts: ${page8a}`);

const page8b = reg8.resolve("/about", "ABOUT");
assert(page8b === "[root]ABOUT[/root]", `Root-only layout: ${page8b}`);

// =============================================================
// EXERCISE 9: Implement (API route with error handling)
// =============================================================
section("Exercise 9: API route wrappers");

type AsyncHandler = (req: Request) => Promise<Response>;

function withErrorHandling(handler: AsyncHandler): AsyncHandler {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { status: 500, headers: {}, body: { error: message } };
    }
  };
}

function withAuth(handler: AsyncHandler): AsyncHandler {
  return async (req: Request): Promise<Response> => {
    if (!req.headers["authorization"]) {
      return { status: 401, headers: {}, body: { error: "Unauthorized" } };
    }
    return handler(req);
  };
}

const apiHandler9 = withErrorHandling(withAuth(async (req) => {
  if (req.path === "/error") throw new Error("boom");
  return { status: 200, headers: {}, body: { ok: true } };
}));

const r9a = await apiHandler9({ method: "GET", path: "/api", headers: {} });
assert(r9a.status === 401, `No auth → 401`);

const r9b = await apiHandler9({ method: "GET", path: "/api", headers: { authorization: "Bearer x" } });
assert(r9b.status === 200, `With auth → 200`);

const r9c = await apiHandler9({ method: "GET", path: "/error", headers: { authorization: "Bearer x" } });
assert(r9c.status === 500, `Error path → 500`);
assert((r9c.body as { error: string }).error === "boom", `Error message is "boom"`);

// =============================================================
// EXERCISE 10: Implement (Parallel data fetching)
// =============================================================
section("Exercise 10: fetchParallel");

interface FetchResult<T> {
  status: "ok" | "error";
  data?: T;
  error?: string;
  durationMs: number;
}

async function fetchParallel<T extends Record<string, () => Promise<unknown>>>(
  sources: T
): Promise<{ [K in keyof T]: FetchResult<Awaited<ReturnType<T[K]>>> }> {
  const keys = Object.keys(sources) as (keyof T)[];
  const entries = keys.map(async (key) => {
    const start = Date.now();
    try {
      const data = await sources[key]();
      return [key, { status: "ok" as const, data, durationMs: Date.now() - start }] as const;
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      return [key, { status: "error" as const, error, durationMs: Date.now() - start }] as const;
    }
  });

  const settled = await Promise.all(entries);
  const result = {} as { [K in keyof T]: FetchResult<Awaited<ReturnType<T[K]>>> };
  for (const [key, value] of settled) {
    (result as Record<keyof T, unknown>)[key] = value;
  }
  return result;
}

const data10 = await fetchParallel({
  users: () => Promise.resolve(["alice", "bob"]),
  posts: () => Promise.resolve([{ id: 1, title: "Hello" }]),
  failing: () => Promise.reject(new Error("db down")),
});

assert(data10.users.status === "ok", `users: status ok`);
assert(JSON.stringify(data10.users.data) === '["alice","bob"]', `users: data correct`);
assert(data10.posts.status === "ok", `posts: status ok`);
assert(data10.failing.status === "error", `failing: status error`);
assert(data10.failing.error === "db down", `failing: error message correct`);

// =============================================================
// EXERCISE 11: Implement (SWR Cache)
// =============================================================
section("Exercise 11: SWR Cache");

interface SWRCache<T> {
  get: (key: string, fetcher: () => Promise<T>) => Promise<{ data: T; stale: boolean }>;
  invalidate: (key: string) => void;
}

function createSWRCache<T>(ttlMs: number): SWRCache<T> {
  const store = new Map<string, { value: T; cachedAt: number }>();

  return {
    async get(key: string, fetcher: () => Promise<T>): Promise<{ data: T; stale: boolean }> {
      const entry = store.get(key);

      if (!entry) {
        // No cache - fetch and store
        const value = await fetcher();
        store.set(key, { value, cachedAt: Date.now() });
        return { data: value, stale: false };
      }

      const age = Date.now() - entry.cachedAt;
      if (age <= ttlMs) {
        // Fresh cache
        return { data: entry.value, stale: false };
      }

      // Stale - return stale data, revalidate in background
      fetcher().then((value) => {
        store.set(key, { value, cachedAt: Date.now() });
      });
      return { data: entry.value, stale: true };
    },

    invalidate(key: string): void {
      store.delete(key);
    },
  };
}

const swrCache = createSWRCache<string>(50);
let fetchCount11 = 0;
const fetcher11 = async () => { fetchCount11++; return `data-${fetchCount11}`; };

const r11a = await swrCache.get("key", fetcher11);
assert(r11a.data === "data-1" && r11a.stale === false, `First fetch: fresh data-1`);

const r11b = await swrCache.get("key", fetcher11);
assert(r11b.data === "data-1" && r11b.stale === false, `Within TTL: fresh data-1`);

await new Promise(r => setTimeout(r, 60));
const r11c = await swrCache.get("key", fetcher11);
assert(r11c.data === "data-1" && r11c.stale === true, `After TTL: stale data-1`);

await new Promise(r => setTimeout(r, 20));
const r11d = await swrCache.get("key", fetcher11);
assert(r11d.data === "data-2" && r11d.stale === false, `After bg revalidation: fresh data-2`);

// =============================================================
// EXERCISE 12: Implement (Route grouping)
// =============================================================
section("Exercise 12: Route grouping");

interface GroupedRoute {
  path: string;
  group?: string;
  page: () => string;
}

interface RouteRegistry {
  addGroup: (name: string, layout: Layout) => void;
  addRoute: (route: GroupedRoute) => void;
  resolve: (path: string) => string | null;
}

function createRouteRegistry(rootLayout: Layout): RouteRegistry {
  const groups = new Map<string, Layout>();
  const routes = new Map<string, GroupedRoute>();

  return {
    addGroup(name: string, layout: Layout): void {
      groups.set(name, layout);
    },
    addRoute(route: GroupedRoute): void {
      routes.set(route.path, route);
    },
    resolve(path: string): string | null {
      const route = routes.get(path);
      if (!route) return null;

      let content = route.page();

      // Apply group layout if route belongs to a group
      if (route.group) {
        const groupLayout = groups.get(route.group);
        if (groupLayout) {
          content = groupLayout(content);
        }
      }

      // Apply root layout
      content = rootLayout(content);

      return content;
    },
  };
}

const reg12 = createRouteRegistry((c) => `[root]${c}[/root]`);
reg12.addGroup("marketing", (c) => `[mkt]${c}[/mkt]`);
reg12.addGroup("shop", (c) => `[shop]${c}[/shop]`);
reg12.addRoute({ path: "/about", group: "marketing", page: () => "About" });
reg12.addRoute({ path: "/products", group: "shop", page: () => "Products" });
reg12.addRoute({ path: "/home", page: () => "Home" });

assert(reg12.resolve("/about") === "[root][mkt]About[/mkt][/root]", `Marketing group layout`);
assert(reg12.resolve("/products") === "[root][shop]Products[/shop][/root]", `Shop group layout`);
assert(reg12.resolve("/home") === "[root]Home[/root]", `No group, root only`);
assert(reg12.resolve("/missing") === null, `Missing route returns null`);

// =============================================================
// Summary
// =============================================================
console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) process.exit(1);

}

main();
