// ============================================================================
// app-router-basics: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Types ──────────────────────────────────────────────────────────────────

interface FileNode {
  name: string;
  type: 'directory' | 'file';
  children?: FileNode[];
}

interface RouteMatch {
  status: number;
  route?: string;
  params?: Record<string, string | string[]>;
  layouts?: string[];
}

interface SpecialFiles {
  page?: boolean;
  layout?: boolean;
  loading?: boolean;
  error?: boolean;
  notFound?: boolean;
  template?: boolean;
}

interface ComponentTree {
  component: string;
  type: 'layout' | 'template' | 'error' | 'loading' | 'page';
  children?: ComponentTree;
}

interface FullRouteMatch {
  status: number;
  url: string;
  route?: string;
  layouts: string[];
  hasLoading: boolean;
  hasError: boolean;
}

interface AppRoute {
  path: string;
  hasPage: boolean;
  hasLayout?: boolean;
  hasLoading?: boolean;
  hasError?: boolean;
  layoutName?: string;
}

interface NavigationEvent {
  from: string;
  to: string;
}

interface ComponentState {
  component: string;
  type: 'layout' | 'template';
  mountCount: number;
}

// ─── Exercise 1: Solution ───────────────────────────────────────────────────
// ANSWER:
// /              → 200 (app/page.tsx exists)
// /about         → 200 (app/about/page.tsx exists)
// /about/team    → 404 (only utils.ts, no page.tsx)
// /blog          → 200 (app/blog/page.tsx exists)
// /blog/components → 404 (only Card.tsx, no page.tsx)
// /contact       → 404 (only layout.tsx, no page.tsx!)
//
// Explanation: A route segment is only accessible when it has a page.tsx.
// layout.tsx alone doesn't make a route accessible. Colocated files like
// utils.ts and Card.tsx don't create routes.

function solution1(): void {
  const pages = new Set([
    'app/page.tsx',
    'app/about/page.tsx',
    'app/blog/page.tsx',
  ]);

  const urls: Record<string, number> = {
    '/': 200,
    '/about': 200,
    '/about/team': 404,
    '/blog': 200,
    '/blog/components': 404,
    '/contact': 404,
  };

  for (const [url, status] of Object.entries(urls)) {
    console.log(`${url} → ${status}`);
  }
}

// ─── Exercise 2: Solution ───────────────────────────────────────────────────
function solution2(
  pages: string[],
  url: string
): { status: number; route?: string } {
  const normalized = url === '/' ? '/' : url.replace(/\/$/, '');
  const pageSet = new Set(pages.map(p => p === '/' ? '/' : p.replace(/\/$/, '')));

  if (pageSet.has(normalized)) {
    return { status: 200, route: normalized };
  }
  return { status: 404 };
}

// Explanation: Simple set lookup. Normalize trailing slashes for consistency.

// ─── Exercise 3: Solution ───────────────────────────────────────────────────
// ANSWER:
// app/(marketing)/about/page.tsx    → /about
// app/(marketing)/pricing/page.tsx  → /pricing
// app/(shop)/cart/page.tsx          → /cart
// app/(shop)/products/page.tsx      → /products
// app/(auth)/login/page.tsx         → /login
//
// Explanation: Route groups (parenthesized folders) are stripped from the URL.
// They exist purely for organizational purposes and layout grouping.

function solution3(): void {
  const mappings: Record<string, string> = {
    'app/(marketing)/about/page.tsx': '/about',
    'app/(marketing)/pricing/page.tsx': '/pricing',
    'app/(shop)/cart/page.tsx': '/cart',
    'app/(shop)/products/page.tsx': '/products',
    'app/(auth)/login/page.tsx': '/login',
  };

  for (const [file, url] of Object.entries(mappings)) {
    console.log(`${file} → ${url}`);
  }
}

// ─── Exercise 4: Solution ───────────────────────────────────────────────────
function solution4(filePath: string): string {
  let result = filePath
    .replace(/^app/, '')           // Remove 'app' prefix
    .replace(/\/page\.tsx$/, '')   // Remove '/page.tsx' suffix
    .replace(/\/?\([^)]+\)/g, ''); // Remove route groups like /(marketing)

  return result || '/';
}

// Explanation: Route groups matching pattern /(...) are stripped.
// After removing app prefix and page.tsx suffix, empty string means root '/'.

// ─── Exercise 5: Solution ───────────────────────────────────────────────────
// ANSWER:
// Component tree (outermost to innermost):
// RootLayout → DashboardLayout → SettingsPage
//
// Explanation: Layouts nest based on the file hierarchy. Each layout wraps
// all pages in its segment and child segments. Since settings/ has no
// layout.tsx, it inherits the parent's layout.

function solution5(): void {
  console.log("RootLayout → DashboardLayout → SettingsPage");
  console.log("Layouts nest from root to the deepest segment with a layout.");
}

// ─── Exercise 6: Solution ───────────────────────────────────────────────────
function solution6(
  routePath: string,
  layouts: Record<string, string>
): string[] {
  const result: string[] = [];
  const segments = routePath.split('/').filter(Boolean);

  // Check root layout
  if (layouts['/']) {
    result.push(layouts['/']);
  }

  // Check each segment path
  let currentPath = '';
  for (const segment of segments) {
    currentPath += '/' + segment;
    if (layouts[currentPath]) {
      result.push(layouts[currentPath]);
    }
  }

  return result;
}

// Explanation: Walk from root to leaf, collecting layouts at each segment.
// Layouts apply to all child routes below them.

// ─── Exercise 7: Solution ───────────────────────────────────────────────────
// ANSWER (outermost to innermost):
// layout → template → error → loading → page
//
// Explanation: This is Next.js's fixed composition order. The layout is
// outermost and persists. Template re-mounts. Error boundary wraps the
// Suspense (loading) boundary. Page is innermost.

function solution7(): void {
  const order = ['layout', 'template', 'error', 'loading', 'page'];
  console.log("Composition order:", order.join(' → '));
}

// ─── Exercise 8: Solution ───────────────────────────────────────────────────
function solution8(files: SpecialFiles): ComponentTree | null {
  const order: Array<{ key: keyof SpecialFiles; type: ComponentTree['type'] }> = [
    { key: 'layout', type: 'layout' },
    { key: 'template', type: 'template' },
    { key: 'error', type: 'error' },
    { key: 'loading', type: 'loading' },
    { key: 'page', type: 'page' },
  ];

  const active = order.filter(item => files[item.key]);
  if (active.length === 0) return null;

  // Build from innermost to outermost
  let tree: ComponentTree | undefined;
  for (let i = active.length - 1; i >= 0; i--) {
    const node: ComponentTree = {
      component: active[i].type,
      type: active[i].type,
    };
    if (tree) {
      node.children = tree;
    }
    tree = node;
  }

  return tree!;
}

// Explanation: Build the component tree following Next.js composition order.
// Each present file wraps the next one in the hierarchy.

// ─── Exercise 9: Solution ───────────────────────────────────────────────────
// ANSWERS:
// DashboardPage throws    → caught by DashboardError
//   (error.tsx catches page.tsx errors in the SAME segment)
// DashboardLayout throws  → caught by RootError
//   (error.tsx CANNOT catch layout.tsx errors in the SAME segment,
//    so it bubbles up to the parent's error.tsx)
// SettingsPage throws     → caught by DashboardError
//   (settings/ has no error.tsx, so it bubbles up to dashboard/error.tsx)
// RootLayout throws       → caught by global-error.tsx (not shown)
//   (root error.tsx cannot catch root layout errors)

function solution9(): void {
  const answers = {
    'DashboardPage throws': 'DashboardError (same segment)',
    'DashboardLayout throws': 'RootError (parent segment)',
    'SettingsPage throws': 'DashboardError (nearest ancestor)',
    'RootLayout throws': 'global-error.tsx (special root handler)',
  };

  for (const [source, catcher] of Object.entries(answers)) {
    console.log(`${source} → ${catcher}`);
  }
}

// ─── Exercise 10: Solution ──────────────────────────────────────────────────
function solution10(
  errorSource: string,
  sourceType: 'page' | 'layout',
  errorBoundaries: Record<string, string>
): string | null {
  if (sourceType === 'page') {
    // Page errors are caught by error.tsx in the SAME segment
    if (errorBoundaries[errorSource]) {
      return errorBoundaries[errorSource];
    }
  }

  // Layout errors (or unhandled page errors) bubble up to parent
  const segments = errorSource.split('/').filter(Boolean);

  // For layout errors, start from parent; for page errors with no same-level boundary, also go up
  const startIdx = sourceType === 'layout' ? segments.length - 1 : segments.length - 1;

  // Walk up from parent segments
  for (let i = segments.length - 1; i >= 0; i--) {
    const parentPath = sourceType === 'layout' || !errorBoundaries[errorSource]
      ? '/' + segments.slice(0, i).join('/')
      : errorSource;

    const checkPath = '/' + segments.slice(0, i).join('/');
    const normalized = checkPath === '/' ? '/' : checkPath.replace(/\/$/, '');

    if (errorBoundaries[normalized]) {
      return errorBoundaries[normalized];
    }
  }

  // Check root
  if (errorBoundaries['/']) {
    return errorBoundaries['/'];
  }

  return null;
}

// Explanation: error.tsx catches errors from page.tsx in its own segment
// and from all child segments. But it cannot catch errors from its
// sibling layout.tsx — those bubble up to the parent error boundary.

// ─── Exercise 11: Solution ──────────────────────────────────────────────────
function solution11(filePath: string): {
  isRoute: boolean;
  type: 'page' | 'layout' | 'loading' | 'error' | 'not-found' | 'template' | 'route' | 'colocated';
} {
  const fileName = filePath.split('/').pop() || '';
  const specialFiles: Record<string, 'page' | 'layout' | 'loading' | 'error' | 'not-found' | 'template' | 'route'> = {
    'page.tsx': 'page',
    'page.ts': 'page',
    'layout.tsx': 'layout',
    'layout.ts': 'layout',
    'loading.tsx': 'loading',
    'loading.ts': 'loading',
    'error.tsx': 'error',
    'error.ts': 'error',
    'not-found.tsx': 'not-found',
    'not-found.ts': 'not-found',
    'template.tsx': 'template',
    'template.ts': 'template',
    'route.tsx': 'route',
    'route.ts': 'route',
  };

  const type = specialFiles[fileName];
  if (type) {
    return { isRoute: type === 'page' || type === 'route', type };
  }
  return { isRoute: false, type: 'colocated' };
}

// ─── Exercise 12: Solution ──────────────────────────────────────────────────
function solution12(
  routes: AppRoute[],
  url: string
): FullRouteMatch {
  const routeMap = new Map(routes.map(r => [r.path, r]));
  const normalized = url === '/' ? '/' : url.replace(/\/$/, '');

  const matched = routeMap.get(normalized);
  if (!matched || !matched.hasPage) {
    return { status: 404, url, layouts: [], hasLoading: false, hasError: false };
  }

  // Collect layouts from root to matched segment
  const layouts: string[] = [];
  const segments = normalized.split('/').filter(Boolean);

  // Check root layout
  const rootRoute = routeMap.get('/');
  if (rootRoute?.hasLayout && rootRoute.layoutName) {
    layouts.push(rootRoute.layoutName);
  }

  let currentPath = '';
  for (const segment of segments) {
    currentPath += '/' + segment;
    const segRoute = routeMap.get(currentPath);
    if (segRoute?.hasLayout && segRoute.layoutName) {
      layouts.push(segRoute.layoutName);
    }
  }

  return {
    status: 200,
    url,
    route: normalized,
    layouts,
    hasLoading: matched.hasLoading || false,
    hasError: matched.hasError || false,
  };
}

// ─── Exercise 13: Solution ──────────────────────────────────────────────────
// ANSWERS:
// /blog                → app/blog/page.tsx (exact static match)
// /blog/latest         → app/blog/latest/page.tsx (static wins over dynamic)
// /blog/hello-world    → app/blog/[slug]/page.tsx (dynamic match)
// /blog/latest/comments → 404 (no nested route under latest/ or [slug]/)
//
// Explanation: Static segments have higher priority than dynamic segments.
// /blog/latest matches the static route, not [slug]. There's no route
// for /blog/latest/comments since neither latest/ nor [slug]/ has children.

function solution13(): void {
  const answers = {
    '/blog': 'app/blog/page.tsx',
    '/blog/latest': 'app/blog/latest/page.tsx (static wins)',
    '/blog/hello-world': 'app/blog/[slug]/page.tsx (dynamic)',
    '/blog/latest/comments': '404 (no nested route)',
  };

  for (const [url, match] of Object.entries(answers)) {
    console.log(`${url} → ${match}`);
  }
}

// ─── Exercise 14: Solution ──────────────────────────────────────────────────
function solution14(files: string[]): string[] {
  return files
    .filter(f => {
      // Must be a page.tsx or route.tsx
      if (!f.endsWith('/page.tsx') && !f.endsWith('/route.tsx')) return false;
      // Must not be inside a private folder
      const parts = f.split('/');
      return !parts.some(part => part.startsWith('_'));
    })
    .map(f => {
      return f
        .replace(/^app/, '')
        .replace(/\/(page|route)\.tsx$/, '')
        .replace(/\/?\([^)]+\)/g, '')
        || '/';
    });
}

// Explanation: Private folders (prefixed with _) are filtered out.
// Route groups are stripped from URLs. Only page.tsx/route.tsx files are routes.

// ─── Exercise 15: Solution ──────────────────────────────────────────────────
function solution15(
  navigations: NavigationEvent[],
  componentMap: Record<string, { type: 'layout' | 'template'; path: string }>
): ComponentState[] {
  const states = new Map<string, ComponentState>();

  // Initialize all components
  for (const [name, config] of Object.entries(componentMap)) {
    states.set(name, {
      component: name,
      type: config.type,
      mountCount: 0,
    });
  }

  // Process navigations
  let currentRoute = '/';
  for (const nav of navigations) {
    currentRoute = nav.to;

    for (const [name, config] of Object.entries(componentMap)) {
      // Check if component is in the path of the target route
      const isInPath = nav.to === config.path || nav.to.startsWith(config.path + '/') || config.path === '/';

      if (isInPath) {
        const state = states.get(name)!;
        if (config.type === 'layout') {
          // Layout mounts once
          if (state.mountCount === 0) {
            state.mountCount = 1;
          }
        } else {
          // Template re-mounts on every navigation
          state.mountCount++;
        }
      }
    }
  }

  return Array.from(states.values());
}

// Explanation: Layouts mount once and persist across navigations within their
// segment. Templates create a new instance on every navigation, useful for
// animations or per-navigation effects.

// ─── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Exercise 1: File Conventions ===");
  solution1();

  console.log("\n=== Exercise 2: Basic Route Resolver ===");
  console.log(solution2(['/', '/about', '/blog'], '/about'));
  console.log(solution2(['/', '/about', '/blog'], '/contact'));

  console.log("\n=== Exercise 3: Route Groups ===");
  solution3();

  console.log("\n=== Exercise 4: Route Group URL Resolver ===");
  console.log(solution4('app/(marketing)/about/page.tsx'));
  console.log(solution4('app/page.tsx'));
  console.log(solution4('app/(shop)/products/[id]/page.tsx'));

  console.log("\n=== Exercise 5: Layout Nesting ===");
  solution5();

  console.log("\n=== Exercise 6: Layout Collection ===");
  console.log(solution6('/dashboard/settings', {
    '/': 'RootLayout',
    '/dashboard': 'DashboardLayout',
  }));

  console.log("\n=== Exercise 7: Composition Order ===");
  solution7();

  console.log("\n=== Exercise 8: Component Tree Builder ===");
  console.log(JSON.stringify(solution8({ layout: true, error: true, page: true }), null, 2));

  console.log("\n=== Exercise 9: Error Boundary Scope ===");
  solution9();

  console.log("\n=== Exercise 10: Error Boundary Resolver ===");
  console.log(solution10('/dashboard', 'page', { '/': 'RootError', '/dashboard': 'DashboardError' }));
  console.log(solution10('/dashboard', 'layout', { '/': 'RootError', '/dashboard': 'DashboardError' }));

  console.log("\n=== Exercise 11: Colocation Checker ===");
  console.log(solution11('app/dashboard/page.tsx'));
  console.log(solution11('app/dashboard/utils.ts'));
  console.log(solution11('app/api/users/route.tsx'));

  console.log("\n=== Exercise 12: Full Route Resolver ===");
  console.log(JSON.stringify(solution12([
    { path: '/', hasPage: true, hasLayout: true, layoutName: 'RootLayout' },
    { path: '/dashboard', hasPage: true, hasLayout: true, layoutName: 'DashLayout', hasLoading: true },
    { path: '/dashboard/settings', hasPage: true, hasError: true },
  ], '/dashboard/settings'), null, 2));

  console.log("\n=== Exercise 13: Route Priority ===");
  solution13();

  console.log("\n=== Exercise 14: Private Folder Detection ===");
  console.log(solution14([
    'app/page.tsx',
    'app/_components/Button.tsx',
    'app/dashboard/page.tsx',
    'app/dashboard/_utils/helpers.ts',
    'app/(auth)/login/page.tsx',
  ]));

  console.log("\n=== Exercise 15: Template vs Layout ===");
  console.log(JSON.stringify(solution15(
    [
      { from: '/', to: '/dashboard' },
      { from: '/dashboard', to: '/dashboard/settings' },
      { from: '/dashboard/settings', to: '/dashboard/profile' },
    ],
    {
      'RootLayout': { type: 'layout', path: '/' },
      'DashTemplate': { type: 'template', path: '/dashboard' },
    }
  ), null, 2));
}

main().catch(console.error);
