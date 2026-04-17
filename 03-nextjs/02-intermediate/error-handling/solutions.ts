// ============================================================================
// error-handling: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/error-handling/solutions.ts
// ============================================================================

interface ErrorBoundary { path: string; name: string; }
interface ComponentError { source: string; sourceType: 'page' | 'layout' | 'component'; message: string; }

function solution1(): void {
  console.log("DashPage throws → DashError (same segment error.tsx)");
  console.log("DashLayout throws → RootError (parent's error.tsx)");
  console.log("SettingsPage throws → DashError (nearest ancestor error.tsx)");
  console.log("RootLayout throws → global-error.tsx (if exists)");
}

function solution2FindBoundary(errorSource: string, sourceType: 'page' | 'layout', boundaries: ErrorBoundary[]): string | null {
  const boundaryMap = new Map(boundaries.map(b => [b.path, b.name]));
  const parts = errorSource.split('/').filter(Boolean);
  // Pages caught by same-level error.tsx; layouts by parent
  const startFrom = sourceType === 'page' ? parts.length : parts.length - 1;
  for (let i = startFrom; i >= 0; i--) {
    const path = '/' + parts.slice(0, i).join('/');
    const normalized = path === '/' ? '/' : path;
    if (boundaryMap.has(normalized)) return boundaryMap.get(normalized)!;
  }
  if (boundaryMap.has('/')) return boundaryMap.get('/')!;
  return null;
}

class Solution3ErrorBoundary {
  private caught: ComponentError | null = null;
  constructor(private childFn: () => unknown, private fallbackFn: (error: ComponentError, reset: () => void) => unknown) {}
  render(): unknown {
    if (this.caught) return this.fallbackFn(this.caught, () => this.reset());
    try { return this.childFn(); }
    catch (e) { this.caught = { source: 'child', sourceType: 'component', message: e instanceof Error ? e.message : String(e) }; return this.fallbackFn(this.caught, () => this.reset()); }
  }
  reset(): void { this.caught = null; }
}

function solution4ErrorPropagation(
  tree: Array<{ path: string; type: 'page' | 'layout'; hasError: boolean }>,
  boundaries: ErrorBoundary[]
) {
  return tree.filter(c => c.hasError).map(c => {
    const caughtBy = solution2FindBoundary(c.path, c.type, boundaries);
    const parts = c.path.split('/').filter(Boolean);
    const propagationPath: string[] = [];
    for (let i = parts.length; i >= 0; i--) {
      propagationPath.push('/' + parts.slice(0, i).join('/') || '/');
      if (boundaries.find(b => b.path === ('/' + parts.slice(0, i).join('/') || '/'))) break;
    }
    return { source: c.path, caughtBy, propagationPath };
  });
}

function solution5NotFound(url: string, pages: string[], notFounds: Array<{ path: string; name: string }>) {
  const hasPage = pages.includes(url);
  if (hasPage) return { status: 200, handler: null };
  const parts = url.split('/').filter(Boolean);
  for (let i = parts.length; i >= 0; i--) {
    const path = '/' + parts.slice(0, i).join('/') || '/';
    const nf = notFounds.find(n => n.path === (path === '/' ? '/' : path));
    if (nf) return { status: 404, handler: nf.name };
  }
  if (notFounds.find(n => n.path === '/')) return { status: 404, handler: notFounds.find(n => n.path === '/')!.name };
  return { status: 404, handler: null };
}

async function solution6TryCatch<T>(asyncFn: () => Promise<T>, fallback: T, onError?: (error: Error) => void) {
  try { return { data: await asyncFn(), error: false }; }
  catch (e) { const err = e instanceof Error ? e : new Error(String(e)); onError?.(err); return { data: fallback, error: true, errorMessage: err.message }; }
}

class Solution7ErrorLogger {
  private logs: Array<{ timestamp: number; error: string; context: string; severity: string }> = [];
  private severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  log(error: unknown, context: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    this.logs.push({ timestamp: Date.now(), error: error instanceof Error ? error.message : String(error), context, severity });
  }
  getLogs() { return [...this.logs]; }
  getByMinSeverity(min: 'low' | 'medium' | 'high' | 'critical') {
    return this.logs.filter(l => this.severityOrder[l.severity as keyof typeof this.severityOrder] >= this.severityOrder[min]);
  }
}

async function solution8ErrorRecovery(
  strategies: Array<{ name: string; attempt: () => Promise<boolean> }>, maxAttempts: number
) {
  let totalAttempts = 0;
  for (const strategy of strategies) {
    for (let i = 0; i < maxAttempts; i++) {
      totalAttempts++;
      try { if (await strategy.attempt()) return { recovered: true, strategy: strategy.name, attempts: totalAttempts }; }
      catch { /* continue */ }
    }
  }
  return { recovered: false, attempts: totalAttempts };
}

function solution9(): void {
  console.log("error.tsx throws → parent error.tsx catches it (or global-error.tsx)");
  console.log("global-error.tsx throws → unhandled error, browser shows default error page");
}

function solution10ClassifyError(error: unknown) {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('not found') || msg.includes('404')) return { type: 'not-found' as const, statusCode: 404, message: error.message, retryable: false };
    if (msg.includes('unauthorized') || msg.includes('401')) return { type: 'unauthorized' as const, statusCode: 401, message: error.message, retryable: false };
    if (msg.includes('validation') || msg.includes('invalid')) return { type: 'validation' as const, statusCode: 400, message: error.message, retryable: false };
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) return { type: 'network' as const, statusCode: 503, message: error.message, retryable: true };
    return { type: 'server' as const, statusCode: 500, message: error.message, retryable: true };
  }
  return { type: 'unknown' as const, statusCode: 500, message: String(error), retryable: false };
}

function solution11ErrorComposition(segments: Array<{ path: string; hasPage: boolean; hasLayout: boolean; hasError: boolean; hasNotFound: boolean }>) {
  const result: Record<string, { errorHandler: string | null; notFoundHandler: string | null }> = {};
  for (const seg of segments) {
    let errorHandler: string | null = null;
    let notFoundHandler: string | null = null;
    const parts = seg.path.split('/').filter(Boolean);
    for (let i = parts.length; i >= 0; i--) {
      const ancestorPath = i === 0 ? '/' : '/' + parts.slice(0, i).join('/');
      const ancestor = segments.find(s => s.path === ancestorPath);
      if (!errorHandler && ancestor?.hasError) errorHandler = ancestorPath;
      if (!notFoundHandler && ancestor?.hasNotFound) notFoundHandler = ancestorPath;
    }
    result[seg.path] = { errorHandler, notFoundHandler };
  }
  return result;
}

class Solution12CircuitBreaker {
  private failures = 0; private lastFailure = 0; private state: 'closed' | 'open' | 'half-open' = 'closed';
  constructor(private threshold: number, private resetTimeMs: number) {}
  async execute<T>(fn: () => Promise<T>) {
    const now = Date.now();
    if (this.state === 'open') {
      if (now - this.lastFailure > this.resetTimeMs) { this.state = 'half-open'; }
      else return { success: false, error: 'Circuit open', state: this.state };
    }
    try {
      const data = await fn();
      this.failures = 0; this.state = 'closed';
      return { success: true, data, state: this.state };
    } catch (e) {
      this.failures++; this.lastFailure = now;
      if (this.failures >= this.threshold) this.state = 'open';
      return { success: false, error: e instanceof Error ? e.message : String(e), state: this.state };
    }
  }
}

async function solution13GracefulDegradation<T>(primary: () => Promise<T>, fallbacks: Array<{ name: string; fn: () => Promise<T> }>) {
  try { return { data: await primary(), source: 'primary' }; } catch { /* fall through */ }
  for (const fb of fallbacks) { try { return { data: await fb.fn(), source: fb.name }; } catch { /* continue */ } }
  throw new Error('All sources failed');
}

function solution14UserFriendlyError(error: unknown) {
  const classified = solution10ClassifyError(error);
  const messages: Record<string, { title: string; message: string; showRetry: boolean; showContact: boolean }> = {
    'not-found': { title: 'Page Not Found', message: 'The page you\'re looking for doesn\'t exist.', showRetry: false, showContact: false },
    'unauthorized': { title: 'Sign In Required', message: 'Please sign in to access this page.', showRetry: false, showContact: false },
    'validation': { title: 'Invalid Input', message: 'Please check your input and try again.', showRetry: false, showContact: false },
    'network': { title: 'Connection Problem', message: 'Please check your internet connection.', showRetry: true, showContact: false },
    'server': { title: 'Something Went Wrong', message: 'We\'re working on fixing this.', showRetry: true, showContact: true },
    'unknown': { title: 'Unexpected Error', message: 'An unexpected error occurred.', showRetry: true, showContact: true },
  };
  const m = messages[classified.type] || messages['unknown'];
  return { ...m, showHome: true };
}

class Solution15ErrorHandlingSystem {
  private boundaries: ErrorBoundary[] = [];
  private logger = new Solution7ErrorLogger();
  addBoundary(path: string, name: string): void { this.boundaries.push({ path, name }); }
  handleError(source: string, sourceType: 'page' | 'layout', error: unknown) {
    this.logger.log(error, `${sourceType} at ${source}`, 'high');
    const caughtBy = solution2FindBoundary(source, sourceType, this.boundaries);
    const friendly = solution14UserFriendlyError(error);
    return { caughtBy, logged: true, userMessage: friendly.message };
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2 ===");
  console.log(solution2FindBoundary('/dashboard', 'page', [{ path: '/', name: 'RootError' }, { path: '/dashboard', name: 'DashError' }]));
  console.log(solution2FindBoundary('/dashboard', 'layout', [{ path: '/', name: 'RootError' }, { path: '/dashboard', name: 'DashError' }]));
  console.log("\n=== Exercise 3 ===");
  const eb = new Solution3ErrorBoundary(() => { throw new Error('boom'); }, (e, reset) => `Caught: ${e.message}`);
  console.log(eb.render());
  eb.reset();
  console.log("\n=== Exercise 5 ===");
  console.log(solution5NotFound('/blog/unknown', ['/blog'], [{ path: '/', name: 'RootNotFound' }, { path: '/blog', name: 'BlogNotFound' }]));
  console.log("\n=== Exercise 6 ===");
  console.log(await solution6TryCatch(async () => { throw new Error('fail'); }, 'fallback'));
  console.log(await solution6TryCatch(async () => 'success', 'fallback'));
  console.log("\n=== Exercise 7 ===");
  const logger = new Solution7ErrorLogger();
  logger.log(new Error('test'), 'page', 'high');
  logger.log('minor issue', 'api', 'low');
  console.log("High+:", logger.getByMinSeverity('high'));
  console.log("\n=== Exercise 8 ===");
  let attempt = 0;
  console.log(await solution8ErrorRecovery([{ name: 'retry', attempt: async () => { attempt++; return attempt >= 2; } }], 3));
  console.log("\n=== Exercise 9 ==="); solution9();
  console.log("\n=== Exercise 10 ===");
  console.log(solution10ClassifyError(new Error('404 not found')));
  console.log(solution10ClassifyError(new Error('network timeout')));
  console.log("\n=== Exercise 12 ===");
  const cb = new Solution12CircuitBreaker(2, 1000);
  console.log(await cb.execute(async () => { throw new Error('fail'); }));
  console.log(await cb.execute(async () => { throw new Error('fail'); }));
  console.log(await cb.execute(async () => 'ok'));
  console.log("\n=== Exercise 13 ===");
  console.log(await solution13GracefulDegradation(async () => { throw new Error('primary fail'); }, [{ name: 'cache', fn: async () => 'cached-data' }]));
  console.log("\n=== Exercise 14 ===");
  console.log(solution14UserFriendlyError(new Error('network timeout')));
  console.log("\n=== Exercise 15 ===");
  const sys = new Solution15ErrorHandlingSystem();
  sys.addBoundary('/', 'RootError');
  sys.addBoundary('/dashboard', 'DashError');
  console.log(sys.handleError('/dashboard', 'page', new Error('DB connection failed')));
}
main().catch(console.error);
