// =============================================================
// Next.js Patterns - Exercises (Pure TypeScript Simulations)
// =============================================================
// Config: ES2022, strict, ESNext modules. Run: npx tsx exercises.ts
// No `any` types. No JSX. No browser APIs.
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

// ── EXERCISE 1: Predict Output (Middleware chain) ────────────
// What does this print?

function compose(...middlewares: Middleware[]): (req: Request, final: () => Response) => Response {
  return (req, final) => {
    let index = -1;
    function dispatch(i: number): Response {
      if (i >= middlewares.length) return final();
      index = i;
      return middlewares[i](req, () => dispatch(i + 1));
    }
    return dispatch(0);
  };
}

const logs: string[] = [];

const mw1: Middleware = (req, next) => {
  logs.push("mw1-before");
  const res = next();
  logs.push("mw1-after");
  return res;
};

const mw2: Middleware = (req, next) => {
  logs.push("mw2-before");
  const res = next();
  logs.push("mw2-after");
  return res;
};

// const chain = compose(mw1, mw2);
// chain(
//   { method: "GET", path: "/", headers: {} },
//   () => { logs.push("handler"); return { status: 200, headers: {}, body: "ok" }; }
// );
// console.log(logs.join(" → "));

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 2: Predict Output (Layout composition) ─────────
// What does this print?

type Layout = (content: string) => string;

function resolveLayouts(layouts: Layout[], page: string): string {
  return layouts.reduceRight((content, layout) => layout(content), page);
}

// const rootLayout: Layout = (c) => `<html><body>${c}</body></html>`;
// const dashLayout: Layout = (c) => `<div class="dash"><sidebar/>${c}</div>`;
//
// const result = resolveLayouts([rootLayout, dashLayout], "<h1>Settings</h1>");
// console.log(result);

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 3: Predict Output (Parallel fetch) ─────────────
// What does this print?

// const delays = [30, 10, 20];
// const start = Date.now();
//
// const fetchers = delays.map((ms, i) =>
//   new Promise<string>(resolve => setTimeout(() => resolve(`data-${i}`), ms))
// );
//
// const results = await Promise.all(fetchers);
// const elapsed = Date.now() - start;
// console.log(results);
// console.log(elapsed < 50 ? "parallel" : "sequential");

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 4: Predict Output (Cache TTL) ──────────────────
// What does this print?

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

// const cache = new SimpleCache();
// cache.set("a", 42, 100);  // expires in 100ms
// console.log(cache.get<number>("a"));  // ?
// console.log(cache.get<number>("b"));  // ?
// // After a delay:
// await new Promise(r => setTimeout(r, 150));
// console.log(cache.get<number>("a"));  // ?

// YOUR PREDICTION:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 5: Fix the Bug (Middleware - short circuit) ─────
// The auth middleware should short-circuit but it doesn't work properly.

const authMiddleware: Middleware = (req, next) => {
  if (!req.headers["authorization"]) {
    return { status: 401, headers: {}, body: "Unauthorized" };
  }
  next();  // BUG: result of next() is not returned
  return { status: 200, headers: {}, body: "OK" };  // BUG: always returns 200
};

// const testReq: Request = { method: "GET", path: "/api/data", headers: { authorization: "Bearer token" } };
// const res = authMiddleware(testReq, () => ({ status: 200, headers: {}, body: { users: [] } }));
// console.log(res.body); // Prints "OK" instead of { users: [] }

// FIX HERE:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 6: Fix the Bug (Route matcher) ─────────────────
// The route matcher doesn't handle path parameters correctly.

interface Route {
  pattern: string;  // e.g., "/users/:id"
  handler: Handler;
}

function matchRoute(routes: Route[], path: string): { handler: Handler; params: Record<string, string> } | null {
  for (const route of routes) {
    const patternParts = route.pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let match = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i]] = pathParts[i];  // BUG: includes the ":" in the param name
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { handler: route.handler, params };
  }
  return null;
}

// const routes: Route[] = [
//   { pattern: "/users/:id", handler: (req) => ({ status: 200, headers: {}, body: "user" }) },
// ];
// const matched = matchRoute(routes, "/users/42");
// console.log(matched?.params); // { ":id": "42" } instead of { id: "42" }

// FIX HERE:
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 7: Implement (Middleware chain) ─────────────────
// Build a middleware pipeline builder with a fluent API.

// interface PipelineBuilder {
//   use: (mw: Middleware) => PipelineBuilder;
//   handle: (handler: Handler) => Handler;
// }
//
// function createPipeline(): PipelineBuilder {
//   // YOUR CODE HERE
//   // use() adds middleware to the chain
//   // handle() wraps a final handler with all middleware
// }

// TEST:
// const logged: string[] = [];
// const pipeline = createPipeline()
//   .use((req, next) => { logged.push("auth"); return next(); })
//   .use((req, next) => { logged.push("log"); return next(); })
//   .handle((req) => ({ status: 200, headers: {}, body: "done" }));
//
// const res = pipeline({ method: "GET", path: "/", headers: {} });
// console.log(logged);    // ["auth", "log"]
// console.log(res.body);  // "done"
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 8: Implement (Layout resolver) ─────────────────
// Build a layout resolver that maps route paths to nested layouts.

// interface LayoutRegistry {
//   register: (path: string, layout: Layout) => void;
//   resolve: (pagePath: string, pageContent: string) => string;
// }
//
// function createLayoutRegistry(): LayoutRegistry {
//   // YOUR CODE HERE
//   // register("/", layout) → root layout
//   // register("/dashboard", layout) → dashboard layout
//   // resolve("/dashboard/settings", "<h1>Settings</h1>") →
//   //   rootLayout(dashboardLayout("<h1>Settings</h1>"))
//   // Layouts are applied from most specific to least specific (inner → outer)
// }

// TEST:
// const registry = createLayoutRegistry();
// registry.register("/", (c) => `[root]${c}[/root]`);
// registry.register("/dashboard", (c) => `[dash]${c}[/dash]`);
// const page = registry.resolve("/dashboard/settings", "CONTENT");
// console.log(page); // "[root][dash]CONTENT[/dash][/root]"
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 9: Implement (API route with error handling) ────
// Create handler wrappers for auth and error handling.

// type AsyncHandler = (req: Request) => Promise<Response>;
//
// function withErrorHandling(handler: AsyncHandler): AsyncHandler {
//   // YOUR CODE HERE
//   // Wraps handler in try/catch, returns 500 on error
// }
//
// function withAuth(handler: AsyncHandler): AsyncHandler {
//   // YOUR CODE HERE
//   // Checks for authorization header, returns 401 if missing
// }

// TEST:
// const apiHandler = withErrorHandling(withAuth(async (req) => {
//   if (req.path === "/error") throw new Error("boom");
//   return { status: 200, headers: {}, body: { ok: true } };
// }));
//
// const r1 = await apiHandler({ method: "GET", path: "/api", headers: {} });
// console.log(r1.status); // 401
//
// const r2 = await apiHandler({ method: "GET", path: "/api", headers: { authorization: "Bearer x" } });
// console.log(r2.status); // 200
//
// const r3 = await apiHandler({ method: "GET", path: "/error", headers: { authorization: "Bearer x" } });
// console.log(r3.status); // 500
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 10: Implement (Parallel data fetching) ──────────
// Create a function that fetches multiple data sources in parallel
// and returns a typed result with success/failure per source.

// interface FetchResult<T> {
//   status: "ok" | "error";
//   data?: T;
//   error?: string;
//   durationMs: number;
// }
//
// async function fetchParallel<T extends Record<string, () => Promise<unknown>>>(
//   sources: T
// ): Promise<{ [K in keyof T]: FetchResult<Awaited<ReturnType<T[K]>>> }> {
//   // YOUR CODE HERE
//   // Execute all sources in parallel using Promise.allSettled
//   // Track duration for each
// }

// TEST:
// const data = await fetchParallel({
//   users: () => Promise.resolve(["alice", "bob"]),
//   posts: () => Promise.resolve([{ id: 1, title: "Hello" }]),
//   failing: () => Promise.reject(new Error("db down")),
// });
// console.log(data.users.status);   // "ok"
// console.log(data.posts.data);     // [{ id: 1, title: "Hello" }]
// console.log(data.failing.status); // "error"
// console.log(data.failing.error);  // "db down"
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 11: Implement (SWR Cache) ──────────────────────
// Implement a stale-while-revalidate cache.

// interface SWRCache<T> {
//   get: (key: string, fetcher: () => Promise<T>) => Promise<{ data: T; stale: boolean }>;
//   invalidate: (key: string) => void;
// }
//
// function createSWRCache<T>(ttlMs: number): SWRCache<T> {
//   // YOUR CODE HERE
//   // - First call: fetches and caches
//   // - Within TTL: returns cached, stale: false
//   // - After TTL: returns cached (stale: true), fetches in background
//   // - invalidate: removes from cache, next get will fetch fresh
// }

// TEST:
// const swrCache = createSWRCache<string>(50);
// let fetchCount = 0;
// const fetcher = async () => { fetchCount++; return `data-${fetchCount}`; };
//
// const r1 = await swrCache.get("key", fetcher);
// console.log(r1.data, r1.stale);  // "data-1", false
//
// const r2 = await swrCache.get("key", fetcher);
// console.log(r2.data, r2.stale);  // "data-1", false
//
// await new Promise(r => setTimeout(r, 60));
// const r3 = await swrCache.get("key", fetcher);
// console.log(r3.data, r3.stale);  // "data-1", true (returns stale, refetches bg)
//
// await new Promise(r => setTimeout(r, 10));
// const r4 = await swrCache.get("key", fetcher);
// console.log(r4.data, r4.stale);  // "data-2", false (bg fetch completed)
// ─────────────────────────────────────────────────────────────

// ── EXERCISE 12: Implement (Route grouping) ─────────────────
// Create a route registry with group-based layout assignment.

// interface GroupedRoute {
//   path: string;
//   group?: string;
//   page: () => string;
// }
//
// interface RouteRegistry {
//   addGroup: (name: string, layout: Layout) => void;
//   addRoute: (route: GroupedRoute) => void;
//   resolve: (path: string) => string | null;
// }
//
// function createRouteRegistry(rootLayout: Layout): RouteRegistry {
//   // YOUR CODE HERE
//   // Groups have their own layout
//   // resolve(path): finds route, applies group layout (if any), then root layout
//   // Group name is NOT part of the URL path
// }

// TEST:
// const reg = createRouteRegistry((c) => `[root]${c}[/root]`);
// reg.addGroup("marketing", (c) => `[mkt]${c}[/mkt]`);
// reg.addGroup("shop", (c) => `[shop]${c}[/shop]`);
// reg.addRoute({ path: "/about", group: "marketing", page: () => "About" });
// reg.addRoute({ path: "/products", group: "shop", page: () => "Products" });
// reg.addRoute({ path: "/home", page: () => "Home" });
//
// console.log(reg.resolve("/about"));    // "[root][mkt]About[/mkt][/root]"
// console.log(reg.resolve("/products")); // "[root][shop]Products[/shop][/root]"
// console.log(reg.resolve("/home"));     // "[root]Home[/root]"
// console.log(reg.resolve("/missing"));  // null
// ─────────────────────────────────────────────────────────────

export {};
