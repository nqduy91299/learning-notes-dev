// ============================================================================
// routing-and-layouts: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
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
  pattern: string;
  type: 'static' | 'dynamic' | 'catch-all' | 'optional-catch-all';
}

interface SlotResolution {
  slot: string;
  resolved: string | null;
  fallback?: string;
}

interface ParallelSlot {
  name: string;
  pages: Record<string, string>;
  defaultPage?: string;
}

interface FileTreeEntry {
  path: string;
  type: 'page' | 'layout';
  name?: string;
}

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

// ─── Exercise 1: Solution ───────────────────────────────────────────────────
// ANSWER:
// /blog/hello-world      → params = { slug: "hello-world" }
// /blog/123              → params = { slug: "123" }
// /users/42/posts/99     → params = { userId: "42", postId: "99" }
// /users/abc/posts/def   → params = { userId: "abc", postId: "def" }
//
// All params are strings — URL segments are always strings.

function solution1(): void {
  const results = [
    { url: '/blog/hello-world', params: { slug: 'hello-world' } },
    { url: '/blog/123', params: { slug: '123' } },
    { url: '/users/42/posts/99', params: { userId: '42', postId: '99' } },
    { url: '/users/abc/posts/def', params: { userId: 'abc', postId: 'def' } },
  ];
  results.forEach(r => console.log(`${r.url} → params =`, r.params));
}

// ─── Exercise 2: Solution ───────────────────────────────────────────────────
function solution2(pattern: string, url: string): RouteMatch {
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = url.split('/').filter(Boolean);

  if (patternParts.length !== urlParts.length) {
    return { matched: false, params: {} };
  }

  const params: RouteParams = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const uPart = urlParts[i];

    if (pPart.startsWith('[') && pPart.endsWith(']')) {
      const paramName = pPart.slice(1, -1);
      params[paramName] = uPart;
    } else if (pPart !== uPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

// ─── Exercise 3: Solution ───────────────────────────────────────────────────
function solution3(pattern: string, url: string): RouteMatch {
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = url.split('/').filter(Boolean);
  const params: RouteParams = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];

    if (pPart.startsWith('[...') && pPart.endsWith(']')) {
      // Catch-all: consume remaining segments
      const paramName = pPart.slice(4, -1);
      const remaining = urlParts.slice(i);
      if (remaining.length === 0) {
        return { matched: false, params: {} };
      }
      params[paramName] = remaining;
      return { matched: true, params };
    } else if (pPart.startsWith('[') && pPart.endsWith(']')) {
      if (i >= urlParts.length) return { matched: false, params: {} };
      params[pPart.slice(1, -1)] = urlParts[i];
    } else {
      if (i >= urlParts.length || pPart !== urlParts[i]) {
        return { matched: false, params: {} };
      }
    }
  }

  if (patternParts.length < urlParts.length) {
    return { matched: false, params: {} };
  }

  return { matched: true, params };
}

// ─── Exercise 4: Solution ───────────────────────────────────────────────────
function solution4(pattern: string, url: string): RouteMatch {
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = url.split('/').filter(Boolean);
  const params: RouteParams = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];

    if (pPart.startsWith('[[...') && pPart.endsWith(']]')) {
      // Optional catch-all: consume remaining (can be zero)
      const paramName = pPart.slice(5, -2);
      const remaining = urlParts.slice(i);
      params[paramName] = remaining.length > 0 ? remaining : undefined;
      return { matched: true, params };
    } else if (pPart.startsWith('[...') && pPart.endsWith(']')) {
      const paramName = pPart.slice(4, -1);
      const remaining = urlParts.slice(i);
      if (remaining.length === 0) return { matched: false, params: {} };
      params[paramName] = remaining;
      return { matched: true, params };
    } else if (pPart.startsWith('[') && pPart.endsWith(']')) {
      if (i >= urlParts.length) return { matched: false, params: {} };
      params[pPart.slice(1, -1)] = urlParts[i];
    } else {
      if (i >= urlParts.length || pPart !== urlParts[i]) {
        return { matched: false, params: {} };
      }
    }
  }

  if (patternParts.length < urlParts.length) {
    return { matched: false, params: {} };
  }

  return { matched: true, params };
}

// ─── Exercise 5: Solution ───────────────────────────────────────────────────
// ANSWER:
// /blog                  → app/blog/page.tsx (static exact match)
// /blog/latest           → app/blog/latest/page.tsx (static wins over dynamic)
// /blog/my-post          → app/blog/[slug]/page.tsx (dynamic match)
// /blog/2024/01/my-post  → app/blog/[...path]/page.tsx (catch-all for multi-segment)

function solution5(): void {
  const answers = [
    { url: '/blog', route: 'app/blog/page.tsx', reason: 'static exact' },
    { url: '/blog/latest', route: 'app/blog/latest/page.tsx', reason: 'static > dynamic' },
    { url: '/blog/my-post', route: 'app/blog/[slug]/page.tsx', reason: 'dynamic match' },
    { url: '/blog/2024/01/my-post', route: 'app/blog/[...path]/page.tsx', reason: 'catch-all' },
  ];
  answers.forEach(a => console.log(`${a.url} → ${a.route} (${a.reason})`));
}

// ─── Exercise 6: Solution ───────────────────────────────────────────────────
function solution6(routes: RouteDefinition[], url: string): RouteMatch & { route?: string } {
  const priorityOrder: RouteDefinition['type'][] = ['static', 'dynamic', 'catch-all', 'optional-catch-all'];

  for (const priority of priorityOrder) {
    const candidates = routes.filter(r => r.type === priority);
    for (const route of candidates) {
      const result = solution4(route.pattern, url);
      if (result.matched) {
        return { ...result, route: route.pattern };
      }
    }
  }

  return { matched: false, params: {} };
}

// ─── Exercise 7: Solution ───────────────────────────────────────────────────
function solution7(filePath: string): {
  url: string;
  params: string[];
  isDynamic: boolean;
  isCatchAll: boolean;
  isOptionalCatchAll: boolean;
} {
  let url = filePath
    .replace(/^app/, '')
    .replace(/\/page\.tsx$/, '')
    .replace(/\/?\([^)]+\)/g, '')
    || '/';

  const params: string[] = [];
  let isCatchAll = false;
  let isOptionalCatchAll = false;

  // Extract params
  const optCatchAllMatch = url.match(/\[\[\.\.\.(\w+)\]\]/g);
  const catchAllMatch = url.match(/\[\.\.\.(\w+)\]/g);
  const dynamicMatch = url.match(/\[(\w+)\]/g);

  if (optCatchAllMatch) {
    isOptionalCatchAll = true;
    isCatchAll = true;
    optCatchAllMatch.forEach(m => {
      params.push(m.replace(/[\[\]\.]/g, ''));
    });
  } else if (catchAllMatch) {
    isCatchAll = true;
    catchAllMatch.forEach(m => {
      params.push(m.replace(/[\[\]\.]/g, ''));
    });
  }

  if (dynamicMatch) {
    dynamicMatch.forEach(m => {
      const name = m.replace(/[\[\]\.]/g, '');
      if (!params.includes(name)) {
        params.push(name);
      }
    });
  }

  return {
    url,
    params,
    isDynamic: params.length > 0,
    isCatchAll,
    isOptionalCatchAll,
  };
}

// ─── Exercise 8: Solution ───────────────────────────────────────────────────
// ANSWER:
// /about              → layouts: [RootLayout, MarketingLayout]
// /dashboard          → layouts: [RootLayout, AppLayout]
// /dashboard/settings → layouts: [RootLayout, AppLayout, DashboardLayout]
//
// Route groups are stripped from URLs but their layouts still apply.

function solution8(): void {
  const answers = [
    { url: '/about', layouts: ['RootLayout', 'MarketingLayout'] },
    { url: '/dashboard', layouts: ['RootLayout', 'AppLayout'] },
    { url: '/dashboard/settings', layouts: ['RootLayout', 'AppLayout', 'DashboardLayout'] },
  ];
  answers.forEach(a => console.log(`${a.url} → layouts: [${a.layouts.join(', ')}]`));
}

// ─── Exercise 9: Solution ───────────────────────────────────────────────────
function solution9(
  url: string,
  slots: ParallelSlot[]
): SlotResolution[] {
  return slots.map(slot => {
    const page = slot.pages[url];
    if (page) {
      return { slot: slot.name, resolved: page };
    }
    return {
      slot: slot.name,
      resolved: null,
      fallback: slot.defaultPage,
    };
  });
}

// ─── Exercise 10: Solution ──────────────────────────────────────────────────
function solution10(
  fromUrl: string,
  toUrl: string,
  interceptors: Array<{ sourceDir: string; convention: string; targetPattern: string }>
): { intercepted: boolean; interceptor?: string; originalRoute?: string } {
  for (const interceptor of interceptors) {
    // Check if we're navigating FROM the source directory
    if (!fromUrl.startsWith(interceptor.sourceDir)) continue;

    // Check if the target matches the interceptor's target pattern
    const targetMatch = solution2(interceptor.targetPattern, toUrl);
    if (!targetMatch.matched) continue;

    // Build interceptor path
    const targetSegment = interceptor.targetPattern.split('/').filter(Boolean).join('/');
    const interceptorPath = `${interceptor.sourceDir}/${interceptor.convention.replace(/[()]/g, '')}${targetSegment.startsWith('/') ? '' : '/'}${interceptor.targetPattern}`;

    return {
      intercepted: true,
      interceptor: `${interceptor.sourceDir}/(${interceptor.convention.replace(/[()]/g, '')})${interceptor.targetPattern}`,
      originalRoute: toUrl,
    };
  }

  return { intercepted: false };
}

// ─── Exercise 11: Solution ──────────────────────────────────────────────────
function solution11(pattern: string, url: string): RouteMatch {
  return solution4(pattern, url);
}

// ─── Exercise 12: Solution ──────────────────────────────────────────────────
function solution12(
  fileTree: FileTreeEntry[],
  url: string
): { matched: boolean; layouts: string[]; page?: string } {
  // Convert file paths to URL paths (strip app/, route groups, suffixes)
  const toUrl = (path: string) =>
    path.replace(/^app/, '').replace(/\/(page|layout)\.tsx$/, '').replace(/\/?\([^)]+\)/g, '') || '/';

  // Find matching page
  const pages = fileTree.filter(f => f.type === 'page');
  const matchedPage = pages.find(p => toUrl(p.path) === url);
  if (!matchedPage) return { matched: false, layouts: [] };

  // Collect layouts: walk from root to the matched page's directory
  const layouts: string[] = [];
  const allLayouts = fileTree.filter(f => f.type === 'layout');

  // Root layout
  const rootLayout = allLayouts.find(l => l.path === 'app/layout.tsx');
  if (rootLayout?.name) layouts.push(rootLayout.name);

  // Find the page's directory path in the file tree
  const pageDirParts = matchedPage.path.replace(/^app\//, '').replace(/\/page\.tsx$/, '').split('/');
  let currentDir = 'app';

  for (const part of pageDirParts) {
    currentDir += '/' + part;
    const layout = allLayouts.find(l => l.path === `${currentDir}/layout.tsx`);
    if (layout?.name) layouts.push(layout.name);
  }

  return { matched: true, layouts, page: matchedPage.name };
}

// ─── Exercise 13: Solution ──────────────────────────────────────────────────
// ANSWERS:
// Route A ([...slug]):
// /docs       → 404 (catch-all requires at least 1 segment)
// /docs/      → 404 (trailing slash normalizes to /docs)
// /docs/intro → { slug: ["intro"] }
//
// Route B ([[...slug]]):
// /shop         → { slug: undefined } (optional catch-all matches zero)
// /shop/        → { slug: undefined }
// /shop/clothes → { slug: ["clothes"] }

function solution13(): void {
  console.log("Catch-all [...slug]:");
  console.log("/docs       → 404");
  console.log("/docs/      → 404");
  console.log("/docs/intro → { slug: ['intro'] }");
  console.log("\nOptional catch-all [[...slug]]:");
  console.log("/shop         → { slug: undefined }");
  console.log("/shop/        → { slug: undefined }");
  console.log("/shop/clothes → { slug: ['clothes'] }");
}

// ─── Exercise 14: Solution ──────────────────────────────────────────────────
function solution14(
  routes: string[]
): Array<{ route1: string; route2: string; conflictUrl: string }> {
  const conflicts: Array<{ route1: string; route2: string; conflictUrl: string }> = [];
  const urlMap = new Map<string, string>();

  const toUrl = (path: string) =>
    path.replace(/^app/, '').replace(/\/page\.tsx$/, '').replace(/\/?\([^)]+\)/g, '') || '/';

  for (const route of routes) {
    const url = toUrl(route);
    const existing = urlMap.get(url);
    if (existing) {
      conflicts.push({ route1: existing, route2: route, conflictUrl: url });
    } else {
      urlMap.set(url, route);
    }
  }

  return conflicts;
}

// ─── Exercise 15: Solution ──────────────────────────────────────────────────
function solution15(routes: MiniRoute[], url: string): MiniRouterResult {
  const urlParts = url.split('/').filter(Boolean);

  // Sort by priority
  const priorityOrder = ['static', 'dynamic', 'catch-all', 'optional-catch-all'] as const;

  const getRoutePriority = (route: MiniRoute): number => {
    const types = route.segments.map(s => s.type);
    if (types.every(t => t === 'static')) return 0;
    if (types.includes('optional-catch-all')) return 3;
    if (types.includes('catch-all')) return 2;
    return 1;
  };

  const sorted = [...routes].sort((a, b) => getRoutePriority(a) - getRoutePriority(b));

  for (const route of sorted) {
    const result = solution4(route.url, url);
    if (result.matched) {
      return {
        status: 200,
        matchedRoute: route.filePath,
        params: result.params,
        segments: urlParts,
      };
    }
  }

  return { status: 404, params: {}, segments: urlParts };
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Exercise 1: Dynamic Route Params ===");
  solution1();

  console.log("\n=== Exercise 2: Dynamic Route Matching ===");
  console.log(solution2('/blog/[slug]', '/blog/hello'));
  console.log(solution2('/blog/[slug]', '/blog/a/b'));
  console.log(solution2('/users/[id]/posts', '/users/42/posts'));

  console.log("\n=== Exercise 3: Catch-All Matching ===");
  console.log(solution3('/docs/[...slug]', '/docs/api/auth'));
  console.log(solution3('/docs/[...slug]', '/docs'));
  console.log(solution3('/docs/[...slug]', '/docs/a/b/c/d'));

  console.log("\n=== Exercise 4: Optional Catch-All ===");
  console.log(solution4('/shop/[[...slug]]', '/shop'));
  console.log(solution4('/shop/[[...slug]]', '/shop/clothes'));
  console.log(solution4('/shop/[[...slug]]', '/shop/clothes/shirts/xl'));

  console.log("\n=== Exercise 5: Route Priority ===");
  solution5();

  console.log("\n=== Exercise 6: Priority Resolver ===");
  console.log(solution6([
    { pattern: '/blog', type: 'static' },
    { pattern: '/blog/latest', type: 'static' },
    { pattern: '/blog/[slug]', type: 'dynamic' },
    { pattern: '/blog/[...path]', type: 'catch-all' },
  ], '/blog/latest'));

  console.log("\n=== Exercise 7: Route Metadata ===");
  console.log(solution7('app/(marketing)/blog/[slug]/page.tsx'));
  console.log(solution7('app/docs/[...slug]/page.tsx'));

  console.log("\n=== Exercise 8: Layout Chains ===");
  solution8();

  console.log("\n=== Exercise 9: Parallel Slot Resolution ===");
  console.log(JSON.stringify(solution9('/settings', [
    { name: 'team', pages: { '/': 'TeamHome', '/settings': 'TeamSettings' } },
    { name: 'analytics', pages: { '/': 'AnalyticsHome' }, defaultPage: 'AnalyticsDefault' },
  ]), null, 2));

  console.log("\n=== Exercise 10: Intercepting Routes ===");
  console.log(solution10('/feed', '/photo/123', [
    { sourceDir: '/feed', convention: '(.)', targetPattern: '/photo/[id]' },
  ]));

  console.log("\n=== Exercise 11: Universal Matcher ===");
  console.log(solution11('/blog/[slug]', '/blog/hello'));
  console.log(solution11('/docs/[...slug]', '/docs/a/b'));
  console.log(solution11('/shop/[[...cat]]', '/shop'));
  console.log(solution11('/[lang]/blog/[slug]', '/en/blog/hi'));

  console.log("\n=== Exercise 12: Layout Resolution with Groups ===");
  console.log(JSON.stringify(solution12([
    { path: 'app/layout.tsx', type: 'layout', name: 'RootLayout' },
    { path: 'app/(marketing)/layout.tsx', type: 'layout', name: 'MarketingLayout' },
    { path: 'app/(marketing)/about/page.tsx', type: 'page', name: 'AboutPage' },
  ], '/about'), null, 2));

  console.log("\n=== Exercise 13: Catch-All Edge Cases ===");
  solution13();

  console.log("\n=== Exercise 14: Route Conflicts ===");
  console.log(JSON.stringify(solution14([
    'app/(marketing)/about/page.tsx',
    'app/(info)/about/page.tsx',
    'app/blog/page.tsx',
    'app/(content)/blog/page.tsx',
  ]), null, 2));

  console.log("\n=== Exercise 15: Full Router ===");
  console.log(solution15([
    { filePath: 'app/blog/page.tsx', url: '/blog', segments: [{ name: 'blog', type: 'static' }] },
    { filePath: 'app/blog/[slug]/page.tsx', url: '/blog/[slug]', segments: [{ name: 'blog', type: 'static' }, { name: '[slug]', type: 'dynamic', paramName: 'slug' }] },
  ], '/blog/hello'));
}

main().catch(console.error);
