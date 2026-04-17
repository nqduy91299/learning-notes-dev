// ============================================================================
// error-handling: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/error-handling/exercises.ts
// ============================================================================

interface ErrorBoundary { path: string; name: string; }
interface ComponentError { source: string; sourceType: 'page' | 'layout' | 'component'; message: string; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  const structure = {
    'app/error.tsx': 'RootError',
    'app/layout.tsx': 'RootLayout',
    'app/dashboard/error.tsx': 'DashError',
    'app/dashboard/layout.tsx': 'DashLayout',
    'app/dashboard/page.tsx': 'DashPage',
    'app/dashboard/settings/page.tsx': 'SettingsPage',
  };
  // Which error.tsx catches each error?
  console.log("Exercise 1 - predict error boundary for each source");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2FindBoundary(
  errorSource: string, sourceType: 'page' | 'layout',
  boundaries: ErrorBoundary[]
): string | null {
  // TODO: Find the error boundary that catches the error
  return null;
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
class Exercise3ErrorBoundary {
  private caught: ComponentError | null = null;
  private childFn: () => unknown;
  private fallbackFn: (error: ComponentError, reset: () => void) => unknown;

  constructor(child: () => unknown, fallback: (error: ComponentError, reset: () => void) => unknown) {
    this.childFn = child; this.fallbackFn = fallback;
  }

  render(): unknown {
    // TODO: Try to render child, catch errors, render fallback
    return null;
  }

  reset(): void {
    // TODO: Clear error and re-render child
  }
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
function exercise4ErrorPropagation(
  tree: Array<{ path: string; type: 'page' | 'layout'; hasError: boolean }>,
  boundaries: ErrorBoundary[]
): Array<{ source: string; caughtBy: string | null; propagationPath: string[] }> {
  // TODO: For each component that throws, trace error propagation
  return [];
}

// ─── Exercise 5: Implement ──────────────────────────────────────────────────
function exercise5NotFound(
  url: string, pages: string[], notFounds: Array<{ path: string; name: string }>
): { status: number; handler: string | null } {
  // TODO: Determine 404 handling — which not-found.tsx renders?
  return { status: 200, handler: null };
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6TryCatch<T>(
  asyncFn: () => Promise<T>,
  fallback: T,
  onError?: (error: Error) => void
): Promise<{ data: T; error: boolean; errorMessage?: string }> {
  // TODO: Wrap async operation with error handling
  return Promise.resolve({ data: fallback, error: false });
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
class Exercise7ErrorLogger {
  private logs: Array<{ timestamp: number; error: string; context: string; severity: string }> = [];

  log(error: unknown, context: string, severity?: 'low' | 'medium' | 'high' | 'critical'): void {}
  getLogs(): typeof this.logs { return []; }
  getByMinSeverity(min: 'low' | 'medium' | 'high' | 'critical'): typeof this.logs { return []; }
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8ErrorRecovery(
  strategies: Array<{ name: string; attempt: () => Promise<boolean> }>,
  maxAttempts: number
): Promise<{ recovered: boolean; strategy?: string; attempts: number }> {
  // TODO: Try recovery strategies in order with retries
  return Promise.resolve({ recovered: false, attempts: 0 });
}

// ─── Exercise 9: Predict ────────────────────────────────────────────────────
function exercise9(): void {
  console.log("What happens when error.tsx itself throws an error?");
  console.log("What about when global-error.tsx throws?");
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
function exercise10ClassifyError(error: unknown): {
  type: 'not-found' | 'unauthorized' | 'validation' | 'server' | 'network' | 'unknown';
  statusCode: number; message: string; retryable: boolean;
} {
  // TODO: Classify error and determine appropriate response
  return { type: 'unknown', statusCode: 500, message: 'Unknown error', retryable: false };
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
function exercise11ErrorComposition(
  segments: Array<{
    path: string; hasPage: boolean; hasLayout: boolean;
    hasError: boolean; hasNotFound: boolean;
  }>
): Record<string, { errorHandler: string | null; notFoundHandler: string | null }> {
  // TODO: For each segment, determine which error/notFound handler applies
  return {};
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
class Exercise12CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private threshold: number, private resetTimeMs: number) {}

  async execute<T>(fn: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string; state: string }> {
    // TODO: Circuit breaker pattern for error-prone operations
    return { success: false, state: this.state };
  }
}

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
function exercise13GracefulDegradation<T>(
  primary: () => Promise<T>,
  fallbacks: Array<{ name: string; fn: () => Promise<T> }>
): Promise<{ data: T; source: string }> {
  // TODO: Try primary, then fallbacks in order
  return Promise.reject(new Error('All sources failed'));
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14UserFriendlyError(error: unknown): {
  title: string; message: string; showRetry: boolean; showHome: boolean; showContact: boolean;
} {
  // TODO: Convert technical error to user-friendly message
  return { title: 'Error', message: '', showRetry: false, showHome: true, showContact: false };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15ErrorHandlingSystem {
  private boundaries: ErrorBoundary[] = [];
  private logger = new Exercise7ErrorLogger();

  addBoundary(path: string, name: string): void {}
  handleError(source: string, sourceType: 'page' | 'layout', error: unknown): {
    caughtBy: string | null; logged: boolean; userMessage: string;
  } {
    return { caughtBy: null, logged: false, userMessage: '' };
  }
}

export {
  exercise1, exercise2FindBoundary, Exercise3ErrorBoundary,
  exercise4ErrorPropagation, exercise5NotFound, exercise6TryCatch,
  Exercise7ErrorLogger, exercise8ErrorRecovery, exercise9,
  exercise10ClassifyError, exercise11ErrorComposition,
  Exercise12CircuitBreaker, exercise13GracefulDegradation,
  exercise14UserFriendlyError, Exercise15ErrorHandlingSystem,
};
