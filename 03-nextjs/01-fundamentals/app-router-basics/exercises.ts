// ============================================================================
// app-router-basics: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/01-fundamentals/app-router-basics/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
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

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: File conventions — which paths are valid routes?
//
// Given this file tree, which URLs return 200 and which return 404?

function exercise1(): void {
  const fileTree = {
    'app/page.tsx': true,
    'app/about/page.tsx': true,
    'app/about/team/utils.ts': true,      // Not a page!
    'app/blog/page.tsx': true,
    'app/blog/components/Card.tsx': true,  // Not a page!
    'app/contact/layout.tsx': true,        // Layout but no page!
  };

  const urls = [
    '/',              // ?
    '/about',         // ?
    '/about/team',    // ?
    '/blog',          // ?
    '/blog/components', // ?
    '/contact',       // ?
  ];

  // For each URL, predict: 200 or 404
  console.log("Exercise 1 - predict status for each URL");
}

// YOUR ANSWER:
// /           → ???
// /about      → ???
// /about/team → ???
// /blog       → ???
// /blog/components → ???
// /contact    → ???

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
// Topic: Basic route resolver
//
// Implement a function that checks if a URL maps to a valid page
// in a simple file tree (static routes only, no dynamic segments).

function exercise2(
  pages: string[], // e.g. ['/', '/about', '/blog']
  url: string
): { status: number; route?: string } {
  // TODO: Return { status: 200, route } if url matches a page
  // Return { status: 404 } if no match
  return { status: 404 };
}

// Test:
// exercise2(['/', '/about', '/blog'], '/about')
//   → { status: 200, route: '/about' }
// exercise2(['/', '/about', '/blog'], '/contact')
//   → { status: 404 }

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Route groups — URL resolution
//
// What URL does each page.tsx map to?

function exercise3(): void {
  const files = [
    'app/(marketing)/about/page.tsx',
    'app/(marketing)/pricing/page.tsx',
    'app/(shop)/cart/page.tsx',
    'app/(shop)/products/page.tsx',
    'app/(auth)/login/page.tsx',
  ];

  // What URL does each file map to?
  console.log("Exercise 3 - predict URLs for route group files");
}

// YOUR ANSWER:
// app/(marketing)/about/page.tsx    → ???
// app/(marketing)/pricing/page.tsx  → ???
// app/(shop)/cart/page.tsx          → ???
// app/(shop)/products/page.tsx      → ???
// app/(auth)/login/page.tsx         → ???

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
// Topic: Route group URL resolver
//
// Implement a function that converts a file path in the app/ directory
// to its URL, stripping out route groups (parenthesized folder names).

function exercise4(filePath: string): string {
  // TODO: Convert file path to URL
  // - Remove 'app' prefix
  // - Remove route groups like (marketing)
  // - Remove '/page.tsx' suffix
  // - Return '/' for root
  return '';
}

// Test:
// exercise4('app/(marketing)/about/page.tsx') → '/about'
// exercise4('app/page.tsx') → '/'
// exercise4('app/(shop)/products/[id]/page.tsx') → '/products/[id]'

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Layout nesting
//
// For the URL /dashboard/settings, what is the component nesting order?

function exercise5(): void {
  const fileTree = {
    'app/layout.tsx': 'RootLayout',
    'app/dashboard/layout.tsx': 'DashboardLayout',
    'app/dashboard/settings/page.tsx': 'SettingsPage',
    // Note: no layout.tsx in settings/
  };

  // What is the component tree for /dashboard/settings?
  console.log("Exercise 5 - predict component nesting");
}

// YOUR ANSWER:
// Component tree (outermost to innermost): ???

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
// Topic: Layout collection
//
// Given a route path and a map of layout locations, return all layouts
// that apply to the route, from root to leaf.

function exercise6(
  routePath: string,
  layouts: Record<string, string> // path → layout name
): string[] {
  // TODO: Collect all layouts from root to the route's segment
  // Example: routePath = '/dashboard/settings'
  //   layouts = { '/': 'RootLayout', '/dashboard': 'DashboardLayout' }
  //   → ['RootLayout', 'DashboardLayout']
  return [];
}

// Test:
// exercise6('/dashboard/settings', {
//   '/': 'RootLayout',
//   '/dashboard': 'DashboardLayout'
// }) → ['RootLayout', 'DashboardLayout']

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Special file composition order
//
// Given these files in app/dashboard/, what is the component wrapping order?

function exercise7(): void {
  const dashboardFiles: SpecialFiles = {
    layout: true,
    template: true,
    error: true,
    loading: true,
    page: true,
  };

  // What is the nesting from outermost to innermost?
  console.log("Exercise 7 - predict composition order");
}

// YOUR ANSWER (outermost to innermost):
// ???

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
// Topic: Component composition tree builder
//
// Given the special files present in a route segment, build the
// composition tree (outermost to innermost).

function exercise8(files: SpecialFiles): ComponentTree | null {
  // TODO: Build the nested component tree following Next.js composition order:
  // layout → template → error → loading → page
  // Only include components for files that are present (true)
  // Return null if no files
  return null;
}

// Test:
// exercise8({ layout: true, error: true, page: true })
// → { component: 'layout', type: 'layout',
//     children: { component: 'error', type: 'error',
//       children: { component: 'page', type: 'page' } } }

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Error boundary scope
//
// Which error.tsx catches errors from which files?

function exercise9(): void {
  const structure = {
    'app/layout.tsx': 'RootLayout',
    'app/error.tsx': 'RootError',
    'app/dashboard/layout.tsx': 'DashboardLayout',
    'app/dashboard/error.tsx': 'DashboardError',
    'app/dashboard/page.tsx': 'DashboardPage',
    'app/dashboard/settings/page.tsx': 'SettingsPage',
  };

  // Question: If DashboardPage throws an error, which error.tsx catches it?
  // Question: If DashboardLayout throws an error, which error.tsx catches it?
  // Question: If SettingsPage throws an error, which error.tsx catches it?
  // Question: If RootLayout throws an error, what catches it?
  console.log("Exercise 9 - predict error boundary scope");
}

// YOUR ANSWERS:
// DashboardPage throws    → caught by ???
// DashboardLayout throws  → caught by ???
// SettingsPage throws     → caught by ???
// RootLayout throws       → caught by ???

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Error boundary resolver
//
// Given a route where an error occurs and a map of error.tsx locations,
// find which error boundary catches it.

function exercise10(
  errorSource: string,     // path where error occurs, e.g. '/dashboard'
  sourceType: 'page' | 'layout',
  errorBoundaries: Record<string, string> // path → error boundary name
): string | null {
  // TODO: Find the error boundary that catches the error
  // Rules:
  // - page errors are caught by error.tsx in the SAME segment
  // - layout errors are caught by error.tsx in the PARENT segment
  // - Return null if no error boundary catches it
  return null;
}

// Test:
// exercise10('/dashboard', 'page', {
//   '/': 'RootError', '/dashboard': 'DashboardError'
// }) → 'DashboardError'
// exercise10('/dashboard', 'layout', {
//   '/': 'RootError', '/dashboard': 'DashboardError'
// }) → 'RootError'

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Colocation checker
//
// Determine if a file in the app/ directory is a routable file or
// a colocated non-route file.

function exercise11(filePath: string): {
  isRoute: boolean;
  type: 'page' | 'layout' | 'loading' | 'error' | 'not-found' | 'template' | 'route' | 'colocated';
} {
  // TODO: Check if the file is a special Next.js file or a colocated file
  // Special files: page.tsx, layout.tsx, loading.tsx, error.tsx,
  //   not-found.tsx, template.tsx, route.tsx
  return { isRoute: false, type: 'colocated' };
}

// Test:
// exercise11('app/dashboard/page.tsx') → { isRoute: true, type: 'page' }
// exercise11('app/dashboard/utils.ts') → { isRoute: false, type: 'colocated' }
// exercise11('app/api/users/route.tsx') → { isRoute: true, type: 'route' }

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Full route resolver
//
// Combine static matching, layout collection, and special file detection
// into a complete route resolver.

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

function exercise12(
  routes: AppRoute[],
  url: string
): FullRouteMatch {
  // TODO: Resolve the URL against the routes
  // - Find the matching route (status 200 vs 404)
  // - Collect all layouts from root to the matched segment
  // - Check for loading and error boundaries
  return { status: 404, url, layouts: [], hasLoading: false, hasError: false };
}

// Test:
// exercise12([
//   { path: '/', hasPage: true, hasLayout: true, layoutName: 'RootLayout' },
//   { path: '/dashboard', hasPage: true, hasLayout: true, layoutName: 'DashLayout', hasLoading: true },
//   { path: '/dashboard/settings', hasPage: true, hasError: true },
// ], '/dashboard/settings')
// → { status: 200, url: '/dashboard/settings', route: '/dashboard/settings',
//     layouts: ['RootLayout', 'DashLayout'], hasLoading: false, hasError: true }

// ─── Exercise 13: Predict the Output ─────────────────────────────────────────
// Topic: Route segment priority
//
// Given these routes, which page handles each URL?

function exercise13(): void {
  const routes = [
    'app/blog/page.tsx',            // /blog
    'app/blog/latest/page.tsx',     // /blog/latest (static)
    'app/blog/[slug]/page.tsx',     // /blog/:slug  (dynamic)
  ];

  const urls = [
    '/blog',
    '/blog/latest',
    '/blog/hello-world',
    '/blog/latest/comments',  // No match? Or catch-all?
  ];

  console.log("Exercise 13 - predict route priority");
}

// YOUR ANSWER:
// /blog                → ???
// /blog/latest         → ???
// /blog/hello-world    → ???
// /blog/latest/comments → ???

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: Private folder detection
//
// Implement a function that filters a file tree, removing private folders
// (prefixed with _) and returning only publicly accessible routes.

function exercise14(files: string[]): string[] {
  // TODO: Filter out files in private folders (folders starting with _)
  // Return only files that are potential routes (page.tsx or route.tsx)
  // Convert to URL paths (strip 'app' prefix, route groups, page.tsx suffix)
  return [];
}

// Test:
// exercise14([
//   'app/page.tsx',
//   'app/_components/Button.tsx',
//   'app/dashboard/page.tsx',
//   'app/dashboard/_utils/helpers.ts',
//   'app/(auth)/login/page.tsx',
// ]) → ['/', '/dashboard', '/login']

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Template vs Layout behavior simulation
//
// Simulate navigation between routes, tracking which components
// re-mount (template) vs persist (layout).

interface NavigationEvent {
  from: string;
  to: string;
}

interface ComponentState {
  component: string;
  type: 'layout' | 'template';
  mountCount: number;
}

function exercise15(
  navigations: NavigationEvent[],
  componentMap: Record<string, { type: 'layout' | 'template'; path: string }>
): ComponentState[] {
  // TODO: Simulate navigations and track mount counts
  // - Layouts mount once and persist
  // - Templates re-mount on every navigation to a different route
  // Return final state of all components
  return [];
}

// Test:
// exercise15(
//   [
//     { from: '/', to: '/dashboard' },
//     { from: '/dashboard', to: '/dashboard/settings' },
//     { from: '/dashboard/settings', to: '/dashboard/profile' },
//   ],
//   {
//     'RootLayout': { type: 'layout', path: '/' },
//     'DashTemplate': { type: 'template', path: '/dashboard' },
//   }
// )
// → [
//   { component: 'RootLayout', type: 'layout', mountCount: 1 },
//   { component: 'DashTemplate', type: 'template', mountCount: 3 },
// ]

export {
  exercise1, exercise2, exercise3, exercise4, exercise5,
  exercise6, exercise7, exercise8, exercise9, exercise10,
  exercise11, exercise12, exercise13, exercise14, exercise15,
};
