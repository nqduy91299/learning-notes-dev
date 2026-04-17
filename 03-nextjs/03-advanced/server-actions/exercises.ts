// ============================================================================
// server-actions: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/server-actions/exercises.ts
// ============================================================================

interface ActionResult<T = unknown> { success: boolean; data?: T; error?: string; errors?: Record<string, string>; }
interface ActionContext { userId?: string; role?: string; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  // What happens when: 1) Server Action throws? 2) Returns error state? 3) Calls redirect()?
  console.log("Exercise 1 - predict server action behavior");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2CreateAction<T>(
  handler: (data: Record<string, string>) => Promise<T>,
  validator: (data: Record<string, string>) => Record<string, string>,
  authorizer: (ctx: ActionContext) => boolean
): (ctx: ActionContext, formFields: Array<{ name: string; value: string }>) => Promise<ActionResult<T>> {
  // TODO: Create a complete server action with validation + auth
  return async () => ({ success: false });
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
function exercise3ZodLikeValidator(schema: Record<string, {
  type: 'string' | 'number' | 'email'; required?: boolean; min?: number; max?: number;
}>): (data: Record<string, unknown>) => ActionResult {
  // TODO: Schema-based validator
  return () => ({ success: true });
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
class Exercise4ActionDispatcher {
  private actions = new Map<string, (data: Record<string, string>, ctx: ActionContext) => Promise<ActionResult>>();
  
  register(name: string, action: (data: Record<string, string>, ctx: ActionContext) => Promise<ActionResult>): void {}
  
  async dispatch(actionName: string, data: Record<string, string>, ctx: ActionContext): Promise<ActionResult> {
    return { success: false, error: 'not found' };
  }
}

// ─── Exercise 5: Implement ──────────────────────────────────────────────────
function exercise5RevalidationTracker(): {
  revalidatePath: (path: string) => void;
  revalidateTag: (tag: string) => void;
  wrapAction: <T>(action: () => Promise<T>, revalidations: { paths?: string[]; tags?: string[] }) => Promise<T>;
  getHistory: () => Array<{ type: 'path' | 'tag'; value: string; timestamp: number }>;
} {
  // TODO: Track revalidation calls made by server actions
  return { revalidatePath: () => {}, revalidateTag: () => {}, wrapAction: async (a) => a(), getHistory: () => [] };
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6ErrorHandler(
  action: () => Promise<ActionResult>,
  onError?: (error: unknown) => void
): Promise<ActionResult> {
  // TODO: Wrap action with error handling — never throw to client
  return Promise.resolve({ success: false });
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
function exercise7Optimistic<T>(
  currentItems: T[],
  action: () => Promise<ActionResult<T>>,
  optimisticItem: T,
  rollbackOnFailure: boolean
): Promise<{ items: T[]; result: ActionResult<T> }> {
  // TODO: Apply optimistic update, then confirm or rollback
  return Promise.resolve({ items: currentItems, result: { success: false } });
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8RateLimitAction(
  maxCalls: number,
  windowMs: number
): { wrap: <T>(action: () => Promise<T>) => Promise<ActionResult<T>>; reset: () => void } {
  // TODO: Rate limit server action calls
  return { wrap: async () => ({ success: false, error: 'not implemented' }), reset: () => {} };
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9InputSanitizer(data: Record<string, string>): Record<string, string> {
  // TODO: Sanitize input — trim, remove HTML tags, limit length
  return data;
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
function exercise10AuthorizeAction(
  ctx: ActionContext,
  requirements: { authenticated?: boolean; roles?: string[]; permissions?: string[] },
  rolePermissions?: Record<string, string[]>
): ActionResult {
  // TODO: Check if context meets requirements
  return { success: true };
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
function exercise11ActionChain(
  actions: Array<{ name: string; action: (prevResult: unknown) => Promise<ActionResult> }>
): Promise<ActionResult & { completedSteps: string[] }> {
  // TODO: Chain actions — each receives previous result, stop on failure
  return Promise.resolve({ success: false, completedSteps: [] });
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
function exercise12FormDataParser(
  fields: Array<{ name: string; value: string; type?: 'text' | 'number' | 'boolean' | 'file' }>
): Record<string, unknown> {
  // TODO: Parse and coerce form data types
  return {};
}

// ─── Exercise 13: Predict ───────────────────────────────────────────────────
function exercise13(): void {
  console.log("Are Server Actions secure? What attack vectors exist?");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14RetryAction<T>(
  action: () => Promise<ActionResult<T>>,
  maxRetries: number,
  delayMs: number
): Promise<ActionResult<T> & { attempts: number }> {
  // TODO: Retry failed actions with delay
  return Promise.resolve({ success: false, attempts: 0 });
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15ServerActionFramework {
  private middleware: Array<(ctx: ActionContext, next: () => Promise<ActionResult>) => Promise<ActionResult>> = [];

  use(mw: (ctx: ActionContext, next: () => Promise<ActionResult>) => Promise<ActionResult>): void {}
  
  createAction<T>(
    handler: (data: Record<string, string>, ctx: ActionContext) => Promise<T>,
    config?: { validate?: (data: Record<string, string>) => Record<string, string>; roles?: string[] }
  ): (data: Record<string, string>, ctx: ActionContext) => Promise<ActionResult<T>> {
    return async () => ({ success: false });
  }
}

export {
  exercise1, exercise2CreateAction, exercise3ZodLikeValidator,
  Exercise4ActionDispatcher, exercise5RevalidationTracker,
  exercise6ErrorHandler, exercise7Optimistic, exercise8RateLimitAction,
  exercise9InputSanitizer, exercise10AuthorizeAction,
  exercise11ActionChain, exercise12FormDataParser, exercise13,
  exercise14RetryAction, Exercise15ServerActionFramework,
};
