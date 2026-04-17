// ============================================================================
// intercepting-routes: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/intercepting-routes/solutions.ts
// ============================================================================

type Convention = '(.)' | '(..)' | '(..)(..)' | '(...)';
interface InterceptorDef { sourceSegment: string; convention: Convention; targetRoute: string; content: string; }
interface NavigationResult { url: string; rendered: string; isIntercepted: boolean; isModal: boolean; }

function matchDynamic(pattern: string, url: string): { matched: boolean; params: Record<string, string> } {
  const pp = pattern.split('/').filter(Boolean), up = url.split('/').filter(Boolean);
  if (pp.length !== up.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith('[') && pp[i].endsWith(']')) params[pp[i].slice(1, -1)] = up[i];
    else if (pp[i] !== up[i]) return { matched: false, params: {} };
  }
  return { matched: true, params };
}

function solution1(): void {
  console.log("Soft nav /feed → /photo/123: Intercepted! Modal renders with feed visible behind");
  console.log("Hard nav to /photo/123: Full page renders (no interception)");
  console.log("Refresh at /photo/123: Full page renders (hard navigation)");
}

function solution2MatchConvention(sourceSegment: string, convention: Convention, targetRoute: string): boolean {
  const sourceParts = sourceSegment.split('/').filter(Boolean);
  const targetParts = targetRoute.split('/').filter(Boolean);
  const level = convention === '(.)' ? 0 : convention === '(..)' ? 1 : convention === '(..)(..)' ? 2 : Infinity;
  if (level === Infinity) return true; // (...) matches from root
  if (level === 0) return sourceParts.length > 0 && targetParts.length > 0;
  return sourceParts.length >= level;
}

function solution3ResolveNavigation(
  fromUrl: string, toUrl: string, navigationType: 'soft' | 'hard',
  interceptors: InterceptorDef[], fullPages: Record<string, string>
): NavigationResult {
  if (navigationType === 'hard') return { url: toUrl, rendered: fullPages[toUrl] || 'Not Found', isIntercepted: false, isModal: false };
  for (const int of interceptors) {
    const fromMatch = fromUrl.startsWith('/' + int.sourceSegment) || fromUrl === '/' + int.sourceSegment;
    if (!fromMatch) continue;
    const targetMatch = matchDynamic(int.targetRoute, toUrl);
    if (targetMatch.matched) return { url: toUrl, rendered: int.content, isIntercepted: true, isModal: true };
  }
  return { url: toUrl, rendered: fullPages[toUrl] || 'Not Found', isIntercepted: false, isModal: false };
}

function solution4BuildInterceptorPath(sourceDir: string, convention: Convention, targetPath: string): string {
  const convStr = convention.replace(/[()]/g, match => match);
  return `${sourceDir}/${convStr}${targetPath}`;
}

function solution5(): void {
  console.log("(.) matches at ROUTE SEGMENT level, not filesystem level");
  console.log("Route groups like (group) are invisible to routing");
  console.log("So app/(group)/feed/(.)photo matches /photo at same level as /feed");
}

function solution6InterceptorRegistry(fileTree: string[]) {
  const conventions: Convention[] = ['(.)', '(..)', '(..)(..)', '(...)'];
  const results: Array<{ interceptor: string; convention: Convention; targets: string; sourceSegment: string }> = [];
  for (const file of fileTree) {
    if (!file.includes('page.tsx')) continue;
    for (const conv of conventions) {
      const escaped = conv.replace(/[()]/g, '\\$&').replace(/\./g, '\\.');
      const regex = new RegExp(`(.*?)/${escaped.replace(/\\\\/g, '\\')}(.*?)/page\\.tsx$`);
      if (file.includes(conv)) {
        const idx = file.indexOf(conv);
        const sourceDir = file.substring(0, idx).replace(/\/$/, '').replace(/^app\//, '');
        const target = file.substring(idx + conv.length).replace('/page.tsx', '');
        results.push({ interceptor: file, convention: conv, targets: target, sourceSegment: sourceDir });
      }
    }
  }
  return results;
}

function solution7ModalNavigation(
  history: Array<{ url: string; type: 'soft' | 'hard' }>,
  interceptors: InterceptorDef[], fullPages: Record<string, string>
) {
  let lastUrl = '/';
  return history.map((nav, i) => {
    const result = solution3ResolveNavigation(lastUrl, nav.url, nav.type, interceptors, fullPages);
    lastUrl = nav.url;
    return { ...result, historyIndex: i };
  });
}

function solution8ConventionLevel(convention: Convention): number {
  if (convention === '(.)') return 0;
  if (convention === '(..)') return 1;
  if (convention === '(..)(..)') return 2;
  return Infinity; // (...) = root
}

function solution9DynamicInterceptMatch(interceptPattern: string, targetUrl: string) {
  return matchDynamic(interceptPattern, targetUrl);
}

function solution10BackButtonBehavior(
  navigationStack: Array<{ url: string; type: 'soft' | 'hard'; intercepted: boolean }>
) {
  const result: Array<{ url: string; modalVisible: boolean }> = [];
  for (let i = navigationStack.length - 1; i >= 0; i--) {
    result.push({ url: navigationStack[i].url, modalVisible: i > 0 && navigationStack[i].intercepted });
  }
  return result;
}

function solution11ValidateInterceptor(
  sourceDir: string, convention: Convention, targetRoute: string, fileTree: string[]
) {
  const errors: string[] = [];
  const interceptorPath = `app/${sourceDir}/${convention}${targetRoute}/page.tsx`;
  if (!fileTree.includes(interceptorPath)) errors.push(`Missing interceptor file: ${interceptorPath}`);
  const fullPath = `app${targetRoute}/page.tsx`;
  if (!fileTree.includes(fullPath)) errors.push(`Missing full page: ${fullPath}`);
  return { valid: errors.length === 0, errors };
}

function solution12ParallelModalSetup(routes: string[]) {
  const modalFiles = routes.filter(r => r.includes('@modal'));
  const defaultTsx = modalFiles.some(r => r.includes('default.tsx'));
  const interceptors = modalFiles.filter(r => r.includes('(.)') || r.includes('(..)') || r.includes('(...)'));
  const fullPages = routes.filter(r => !r.includes('@modal') && r.includes('page.tsx'));
  const warnings: string[] = [];
  if (!defaultTsx) warnings.push('Missing @modal/default.tsx — modal may show unexpectedly');
  return { modalSlot: { defaultTsx, interceptors }, fullPages, isValid: defaultTsx && interceptors.length > 0, warnings };
}

function solution13(): void {
  console.log("Navigating from /photo/123 (intercepted modal) to /about:");
  console.log("  Modal closes, /about page renders normally");
  console.log("  The modal (intercepted route) is dismissed");
  console.log("  /feed is no longer visible (new page replaces everything)");
}

function solution14InterceptChain(fromUrl: string, toUrl: string, interceptors: InterceptorDef[]) {
  const chain: string[] = [];
  let finalRenderer = '';
  for (const int of interceptors) {
    const match = matchDynamic(int.targetRoute, toUrl);
    if (match.matched && fromUrl.startsWith('/' + int.sourceSegment)) {
      chain.push(`${int.sourceSegment}/${int.convention}${int.targetRoute}`);
      finalRenderer = int.content;
      break; // Only first matching interceptor applies
    }
  }
  return { chain, finalRenderer: finalRenderer || toUrl };
}

class Solution15InterceptingRouter {
  private interceptors: InterceptorDef[] = [];
  private fullPages: Record<string, string> = {};
  private currentUrl = '/';
  private history: string[] = ['/'];

  addInterceptor(def: InterceptorDef): void { this.interceptors.push(def); }
  addFullPage(url: string, content: string): void { this.fullPages[url] = content; }
  navigate(toUrl: string, type: 'soft' | 'hard'): NavigationResult {
    const result = solution3ResolveNavigation(this.currentUrl, toUrl, type, this.interceptors, this.fullPages);
    this.history.push(toUrl);
    this.currentUrl = toUrl;
    return result;
  }
  back(): NavigationResult {
    this.history.pop();
    const prevUrl = this.history[this.history.length - 1] || '/';
    this.currentUrl = prevUrl;
    return { url: prevUrl, rendered: this.fullPages[prevUrl] || '', isIntercepted: false, isModal: false };
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2 ===");
  console.log(solution2MatchConvention('feed', '(.)', '/photo/[id]'));
  console.log("\n=== Exercise 3 ===");
  const interceptors: InterceptorDef[] = [{ sourceSegment: 'feed', convention: '(.)', targetRoute: '/photo/[id]', content: 'Modal Photo' }];
  console.log(solution3ResolveNavigation('/feed', '/photo/123', 'soft', interceptors, { '/photo/123': 'Full Photo Page' }));
  console.log(solution3ResolveNavigation('/feed', '/photo/123', 'hard', interceptors, { '/photo/123': 'Full Photo Page' }));
  console.log("\n=== Exercise 4 ===");
  console.log(solution4BuildInterceptorPath('feed', '(.)', 'photo/[id]'));
  console.log("\n=== Exercise 5 ==="); solution5();
  console.log("\n=== Exercise 8 ===");
  console.log('(.)', solution8ConventionLevel('(.)'));
  console.log('(..)', solution8ConventionLevel('(..)'));
  console.log('(...)', solution8ConventionLevel('(...)'));
  console.log("\n=== Exercise 9 ===");
  console.log(solution9DynamicInterceptMatch('/photo/[id]', '/photo/123'));
  console.log("\n=== Exercise 12 ===");
  console.log(solution12ParallelModalSetup([
    'app/@modal/default.tsx', 'app/@modal/(.)photo/[id]/page.tsx', 'app/photo/[id]/page.tsx', 'app/feed/page.tsx',
  ]));
  console.log("\n=== Exercise 13 ==="); solution13();
  console.log("\n=== Exercise 15 ===");
  const router = new Solution15InterceptingRouter();
  router.addInterceptor({ sourceSegment: 'feed', convention: '(.)', targetRoute: '/photo/[id]', content: 'Modal' });
  router.addFullPage('/feed', 'Feed Page');
  router.addFullPage('/photo/123', 'Full Photo');
  console.log(router.navigate('/feed', 'hard'));
  console.log(router.navigate('/photo/123', 'soft'));
  console.log(router.back());
}
main().catch(console.error);
