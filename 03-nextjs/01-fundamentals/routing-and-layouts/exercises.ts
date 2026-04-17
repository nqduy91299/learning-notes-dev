// ============================================================================
// routing-and-layouts: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/01-fundamentals/routing-and-layouts/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Types ──────────────────────────────────────────────────────────────────

interface RouteParams {
  [key: string]: string | string[] | undefined;
}

interface RouteMatch {
  matched: boolean;
  params: RouteParams;
  route?: string;
}

interface RouteDefinition {
  pattern: string;        // e.g., '/blog/[slug]'
  type: 'static' | 'dynamic' | 'catch-all' | 'optional-catch-all';
}

interface SlotResolution {
  slot: string;
  resolved: string | null;  // file path or null (unmatched)
  fallback?: string;         // default.tsx path
}

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Dynamic route matching
//
// Given these routes, what params does each URL produce?

function exercise1(): void {
  const routes = [
    'app/blog/[slug]/page.tsx',
    'app/users/[userId]/posts/[postId]/page.tsx',
  ];

  const urls = [
    '/blog/hello-world',
    '/blog/123',
    '/users/42/posts/99',
    '/users/abc/posts/def',
  ];

  console.log("Exercise 1 - predict params for each URL");
}

// YOUR ANSWER:
// /blog/hello-world         → params = ???
// /blog/123                 → params = ???
// /users/42/posts/99        → params = ???
// /users/abc/posts/def      → params = ???

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
// Topic: Dynamic route pattern matching
//
// Implement a function that takes a route pattern (e.g., '/blog/[slug]')
// and a URL, and returns whether it matches + extracted params.

function exercise2(pattern: string, url: string): RouteMatch {
  // TODO: Match URL against pattern
  // - Static segments must match exactly
  // - [param] matches any single segment
  // - Extract params into the result
  return { matched: false, params: {} };
}

// Test:
// exercise2('/blog/[slug]', '/blog/hello') → { matched: true, params: { slug: 'hello' } }
// exercise2('/blog/[slug]', '/blog/a/b')   → { matched: false, params: {} }
// exercise2('/users/[id]/posts', '/users/42/posts') → { matched: true, params: { id: '42' } }

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
// Topic: Catch-all route matching
//
// Implement matching for catch-all routes [...param].

function exercise3(pattern: string, url: string): RouteMatch {
  // TODO: Match URL against pattern with catch-all support
  // - [...param] matches one or more segments
  // - Return params as string array
  // Also support regular [param] for single segments
  return { matched: false, params: {} };
}

// Test:
// exercise3('/docs/[...slug]', '/docs/api/auth')
//   → { matched: true, params: { slug: ['api', 'auth'] } }
// exercise3('/docs/[...slug]', '/docs')
//   → { matched: false, params: {} }  (catch-all requires at least one segment)
// exercise3('/docs/[...slug]', '/docs/a/b/c/d')
//   → { matched: true, params: { slug: ['a', 'b', 'c', 'd'] } }

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
// Topic: Optional catch-all route matching
//
// Implement matching for optional catch-all routes [[...param]].

function exercise4(pattern: string, url: string): RouteMatch {
  // TODO: Match URL against pattern with optional catch-all support
  // - [[...param]] matches zero or more segments
  // - When zero segments, param is undefined
  return { matched: false, params: {} };
}

// Test:
// exercise4('/shop/[[...slug]]', '/shop')
//   → { matched: true, params: { slug: undefined } }
// exercise4('/shop/[[...slug]]', '/shop/clothes')
//   → { matched: true, params: { slug: ['clothes'] } }
// exercise4('/shop/[[...slug]]', '/shop/clothes/shirts/xl')
//   → { matched: true, params: { slug: ['clothes', 'shirts', 'xl'] } }

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Route priority
//
// Given these overlapping routes, which route handles each URL?

function exercise5(): void {
  const routes = [
    'app/blog/page.tsx',              // /blog (static)
    'app/blog/latest/page.tsx',       // /blog/latest (static)
    'app/blog/[slug]/page.tsx',       // /blog/:slug (dynamic)
    'app/blog/[...path]/page.tsx',    // /blog/* (catch-all)
  ];

  const urls = [
    '/blog',
    '/blog/latest',
    '/blog/my-post',
    '/blog/2024/01/my-post',
  ];

  console.log("Exercise 5 - predict which route handles each URL");
}

// YOUR ANSWER:
// /blog                  → handled by ???
// /blog/latest           → handled by ???
// /blog/my-post          → handled by ???
// /blog/2024/01/my-post  → handled by ???

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
// Topic: Route priority resolver
//
// Given multiple route definitions, find the best match for a URL
// following Next.js priority: static > dynamic > catch-all > optional catch-all.

function exercise6(routes: RouteDefinition[], url: string): RouteMatch & { route?: string } {
  // TODO: Try routes in priority order
  // 1. Static matches first
  // 2. Dynamic [param] matches
  // 3. Catch-all [...param] matches
  // 4. Optional catch-all [[...param]] matches
  // Return the first (highest priority) match
  return { matched: false, params: {} };
}

// Test:
// exercise6([
//   { pattern: '/blog', type: 'static' },
//   { pattern: '/blog/latest', type: 'static' },
//   { pattern: '/blog/[slug]', type: 'dynamic' },
//   { pattern: '/blog/[...path]', type: 'catch-all' },
// ], '/blog/latest')
// → { matched: true, params: {}, route: '/blog/latest' }

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
// Topic: Route group URL stripping
//
// Implement a comprehensive route-to-URL converter that handles
// all Next.js conventions: route groups, dynamic segments, etc.

function exercise7(filePath: string): {
  url: string;
  params: string[];
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
} {
  // TODO: Parse a Next.js file path into route metadata
  return { url: '', params: [], isDynamic: false, isCatchAll: false, isOptionalCatchAll: false };
}

// Test:
// exercise7('app/(marketing)/blog/[slug]/page.tsx')
// → { url: '/blog/[slug]', params: ['slug'], isDynamic: true,
//     isCatchAll: false, isOptionalCatchAll: false }
// exercise7('app/docs/[...slug]/page.tsx')
// → { url: '/docs/[...slug]', params: ['slug'], isDynamic: true,
//     isCatchAll: true, isOptionalCatchAll: false }

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Nested layout resolution
//
// What layouts apply to each URL?

function exercise8(): void {
  const layouts = {
    'app/layout.tsx': 'RootLayout',
    'app/(marketing)/layout.tsx': 'MarketingLayout',
    'app/(app)/layout.tsx': 'AppLayout',
    'app/(app)/dashboard/layout.tsx': 'DashboardLayout',
  };

  const urls = [
    '/(marketing)/about → /about',
    '/(app)/dashboard → /dashboard',
    '/(app)/dashboard/settings → /dashboard/settings',
  ];

  console.log("Exercise 8 - predict layout chain for each URL");
}

// YOUR ANSWER:
// /about               → layouts: ???
// /dashboard           → layouts: ???
// /dashboard/settings  → layouts: ???

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: Parallel route slot resolution
//
// Given a URL and parallel route slots, resolve which page renders
// in each slot.

interface ParallelSlot {
  name: string;  // e.g., 'team', 'analytics'
  pages: Record<string, string>;    // url → page file
  defaultPage?: string;              // default.tsx
}

function exercise9(
  url: string,
  slots: ParallelSlot[]
): SlotResolution[] {
  // TODO: For each slot, find the matching page or fall back to default.tsx
  return [];
}

// Test:
// exercise9('/settings', [
//   { name: 'team', pages: { '/': 'TeamHome', '/settings': 'TeamSettings' } },
//   { name: 'analytics', pages: { '/': 'AnalyticsHome' }, defaultPage: 'AnalyticsDefault' },
// ])
// → [
//   { slot: 'team', resolved: 'TeamSettings' },
//   { slot: 'analytics', resolved: null, fallback: 'AnalyticsDefault' },
// ]

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Intercepting route resolver
//
// Determine if a navigation should be intercepted based on
// the convention rules: (.), (..), (..)(..), (...)

function exercise10(
  fromUrl: string,
  toUrl: string,
  interceptors: Array<{ sourceDir: string; convention: string; targetPattern: string }>
): { intercepted: boolean; interceptor?: string; originalRoute?: string } {
  // TODO: Check if navigating from fromUrl to toUrl triggers an interceptor
  // (.) = same level, (..) = one level up, (...) = from root
  return { intercepted: false };
}

// Test:
// exercise10('/feed', '/photo/123', [
//   { sourceDir: '/feed', convention: '(.)', targetPattern: '/photo/[id]' }
// ])
// → { intercepted: true, interceptor: '/feed/(.)photo/[id]', originalRoute: '/photo/123' }

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Full route matcher with all segment types
//
// Build a comprehensive route matcher that handles static, dynamic,
// catch-all, and optional catch-all segments in a single function.

function exercise11(pattern: string, url: string): RouteMatch {
  // TODO: Universal route matcher
  // Supports: static segments, [param], [...param], [[...param]]
  // Returns: { matched, params }
  return { matched: false, params: {} };
}

// Test:
// exercise11('/blog/[slug]', '/blog/hello')
//   → { matched: true, params: { slug: 'hello' } }
// exercise11('/docs/[...slug]', '/docs/a/b')
//   → { matched: true, params: { slug: ['a', 'b'] } }
// exercise11('/shop/[[...cat]]', '/shop')
//   → { matched: true, params: { cat: undefined } }
// exercise11('/[lang]/blog/[slug]', '/en/blog/hi')
//   → { matched: true, params: { lang: 'en', slug: 'hi' } }

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Layout nesting with route groups
//
// Given a complete file tree with route groups, resolve the full
// layout chain for any URL.

interface FileTreeEntry {
  path: string;
  type: 'page' | 'layout';
  name?: string;
}

function exercise12(
  fileTree: FileTreeEntry[],
  url: string
): { matched: boolean; layouts: string[]; page?: string } {
  // TODO: Resolve layouts considering route groups
  // Route groups like (marketing) are stripped from URL matching
  // but their layouts still apply
  return { matched: false, layouts: [] };
}

// Test:
// exercise12([
//   { path: 'app/layout.tsx', type: 'layout', name: 'RootLayout' },
//   { path: 'app/(marketing)/layout.tsx', type: 'layout', name: 'MarketingLayout' },
//   { path: 'app/(marketing)/about/page.tsx', type: 'page', name: 'AboutPage' },
// ], '/about')
// → { matched: true, layouts: ['RootLayout', 'MarketingLayout'], page: 'AboutPage' }

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: Catch-all vs optional catch-all edge cases
//
// What happens with these URLs?

function exercise13(): void {
  // Route A: app/docs/[...slug]/page.tsx
  // Route B: app/shop/[[...slug]]/page.tsx

  const tests = [
    { route: 'A ([...slug])', url: '/docs', expected: '???' },
    { route: 'A ([...slug])', url: '/docs/', expected: '???' },
    { route: 'A ([...slug])', url: '/docs/intro', expected: '???' },
    { route: 'B ([[...slug]])', url: '/shop', expected: '???' },
    { route: 'B ([[...slug]])', url: '/shop/', expected: '???' },
    { route: 'B ([[...slug]])', url: '/shop/clothes', expected: '???' },
  ];

  console.log("Exercise 13 - predict match results");
}

// YOUR ANSWER for each test: matched? what params?

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Route conflict detector
//
// Detect if two route definitions conflict (map to the same URL).

function exercise14(
  routes: string[]  // file paths
): Array<{ route1: string; route2: string; conflictUrl: string }> {
  // TODO: Find all route conflicts
  // Route groups can cause conflicts:
  // app/(a)/about/page.tsx and app/(b)/about/page.tsx both map to /about
  return [];
}

// Test:
// exercise14([
//   'app/(marketing)/about/page.tsx',
//   'app/(info)/about/page.tsx',
//   'app/blog/page.tsx',
//   'app/(content)/blog/page.tsx',
// ])
// → [
//   { route1: 'app/(marketing)/about/page.tsx', route2: 'app/(info)/about/page.tsx', conflictUrl: '/about' },
//   { route1: 'app/blog/page.tsx', route2: 'app/(content)/blog/page.tsx', conflictUrl: '/blog' },
// ]

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Complete Next.js router simulation
//
// Build a mini router that resolves URLs against a set of routes,
// handling all segment types and returning full metadata.

interface MiniRoute {
  filePath: string;
  url: string;
  segments: Array<{
    name: string;
    type: 'static' | 'dynamic' | 'catch-all' | 'optional-catch-all';
    paramName?: string;
  }>;
}

interface MiniRouterResult {
  status: number;
  matchedRoute?: string;
  params: RouteParams;
  segments: string[];
}

function exercise15(routes: MiniRoute[], url: string): MiniRouterResult {
  // TODO: Full router resolution
  // Priority: static > dynamic > catch-all > optional catch-all
  // Return 404 for no match
  return { status: 404, params: {}, segments: [] };
}

export {
  exercise1, exercise2, exercise3, exercise4, exercise5,
  exercise6, exercise7, exercise8, exercise9, exercise10,
  exercise11, exercise12, exercise13, exercise14, exercise15,
};
