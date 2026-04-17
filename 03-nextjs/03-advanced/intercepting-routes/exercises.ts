// ============================================================================
// intercepting-routes: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/intercepting-routes/exercises.ts
// ============================================================================

type Convention = '(.)' | '(..)' | '(..)(..)' | '(...)';
interface InterceptorDef { sourceSegment: string; convention: Convention; targetRoute: string; content: string; }
interface NavigationResult { url: string; rendered: string; isIntercepted: boolean; isModal: boolean; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  // app/feed/(.)photo/[id]/page.tsx intercepts /photo/:id
  // What renders for: soft nav from /feed to /photo/123? Hard nav to /photo/123? Refresh at /photo/123?
  console.log("Exercise 1 - predict navigation behavior");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2MatchConvention(sourceSegment: string, convention: Convention, targetRoute: string): boolean {
  // TODO: Check if the convention correctly matches source to target
  return false;
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
function exercise3ResolveNavigation(
  fromUrl: string, toUrl: string, navigationType: 'soft' | 'hard',
  interceptors: InterceptorDef[], fullPages: Record<string, string>
): NavigationResult {
  // TODO: Determine what renders based on navigation type and interceptors
  return { url: toUrl, rendered: '', isIntercepted: false, isModal: false };
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
function exercise4BuildInterceptorPath(sourceDir: string, convention: Convention, targetPath: string): string {
  // TODO: Build the filesystem path for an intercepting route
  // e.g., ('feed', '(.)', 'photo/[id]') → 'feed/(.)photo/[id]'
  return '';
}

// ─── Exercise 5: Predict ────────────────────────────────────────────────────
function exercise5(): void {
  // app/(group)/feed/(.)photo/[id]/page.tsx
  // Does (.) match /photo/[id] relative to route segments or filesystem?
  console.log("Exercise 5 - predict route group interaction with intercepting");
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6InterceptorRegistry(
  fileTree: string[]
): Array<{ interceptor: string; convention: Convention; targets: string; sourceSegment: string }> {
  // TODO: Parse file tree to find all intercepting routes
  return [];
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
function exercise7ModalNavigation(
  history: Array<{ url: string; type: 'soft' | 'hard' }>,
  interceptors: InterceptorDef[],
  fullPages: Record<string, string>
): Array<NavigationResult & { historyIndex: number }> {
  // TODO: Simulate navigation history with interception
  return [];
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8ConventionLevel(convention: Convention): number {
  // TODO: Return how many levels up the convention goes (0=same, 1=parent, etc.)
  return 0;
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9DynamicInterceptMatch(
  interceptPattern: string, // e.g., '/photo/[id]'
  targetUrl: string // e.g., '/photo/123'
): { matched: boolean; params: Record<string, string> } {
  // TODO: Match URL against interceptor target pattern with param extraction
  return { matched: false, params: {} };
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
function exercise10BackButtonBehavior(
  navigationStack: Array<{ url: string; type: 'soft' | 'hard'; intercepted: boolean }>,
): Array<{ url: string; modalVisible: boolean }> {
  // TODO: Simulate browser back button behavior with intercepted routes
  return [];
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
function exercise11ValidateInterceptor(
  sourceDir: string, convention: Convention, targetRoute: string,
  fileTree: string[]
): { valid: boolean; errors: string[] } {
  // TODO: Validate that an intercepting route setup is correct
  return { valid: true, errors: [] };
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
function exercise12ParallelModalSetup(
  routes: string[]
): {
  modalSlot: { defaultTsx: boolean; interceptors: string[] };
  fullPages: string[];
  isValid: boolean;
  warnings: string[];
} {
  // TODO: Analyze @modal setup with intercepting routes
  return { modalSlot: { defaultTsx: false, interceptors: [] }, fullPages: [], isValid: false, warnings: [] };
}

// ─── Exercise 13: Predict ───────────────────────────────────────────────────
function exercise13(): void {
  console.log("What happens when you navigate from /feed to /photo/123 (intercepted) then click a link to /about?");
  console.log("Does the modal stay? Does the underlying /feed stay?");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14InterceptChain(
  fromUrl: string, toUrl: string,
  interceptors: InterceptorDef[]
): { chain: string[]; finalRenderer: string } {
  // TODO: Can multiple interceptors chain? Resolve the chain.
  return { chain: [], finalRenderer: '' };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15InterceptingRouter {
  private interceptors: InterceptorDef[] = [];
  private fullPages: Record<string, string> = {};
  private currentUrl = '/';

  addInterceptor(def: InterceptorDef): void {}
  addFullPage(url: string, content: string): void {}
  navigate(toUrl: string, type: 'soft' | 'hard'): NavigationResult { return { url: toUrl, rendered: '', isIntercepted: false, isModal: false }; }
  back(): NavigationResult { return { url: '/', rendered: '', isIntercepted: false, isModal: false }; }
}

export {
  exercise1, exercise2MatchConvention, exercise3ResolveNavigation,
  exercise4BuildInterceptorPath, exercise5, exercise6InterceptorRegistry,
  exercise7ModalNavigation, exercise8ConventionLevel, exercise9DynamicInterceptMatch,
  exercise10BackButtonBehavior, exercise11ValidateInterceptor,
  exercise12ParallelModalSetup, exercise13, exercise14InterceptChain,
  Exercise15InterceptingRouter,
};
