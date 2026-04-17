// ============================================================================
// server-actions: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/server-actions/solutions.ts
// ============================================================================

interface ActionResult<T = unknown> { success: boolean; data?: T; error?: string; errors?: Record<string, string>; }
interface ActionContext { userId?: string; role?: string; }

function solution1(): void {
  console.log("1) Throws → error.tsx boundary catches it (or returns 500)");
  console.log("2) Returns error state → useFormState receives it, UI shows errors");
  console.log("3) redirect() → throws NEXT_REDIRECT internally, Next.js redirects client");
}

function solution2CreateAction<T>(
  handler: (data: Record<string, string>) => Promise<T>,
  validator: (data: Record<string, string>) => Record<string, string>,
  authorizer: (ctx: ActionContext) => boolean
) {
  return async (ctx: ActionContext, formFields: Array<{ name: string; value: string }>): Promise<ActionResult<T>> => {
    if (!authorizer(ctx)) return { success: false, error: 'Unauthorized' };
    const data: Record<string, string> = {};
    for (const f of formFields) data[f.name] = f.value;
    const errors = validator(data);
    if (Object.keys(errors).length > 0) return { success: false, errors };
    try { return { success: true, data: await handler(data) }; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
  };
}

function solution3ZodLikeValidator(schema: Record<string, { type: 'string' | 'number' | 'email'; required?: boolean; min?: number; max?: number; }>) {
  return (data: Record<string, unknown>): ActionResult => {
    const errors: Record<string, string> = {};
    for (const [field, rules] of Object.entries(schema)) {
      const val = data[field];
      if (rules.required && (val === undefined || val === '')) { errors[field] = 'Required'; continue; }
      if (val === undefined) continue;
      if (rules.type === 'email' && (typeof val !== 'string' || !val.includes('@'))) errors[field] = 'Invalid email';
      if (rules.type === 'number' && isNaN(Number(val))) errors[field] = 'Must be a number';
      if (typeof val === 'string' && rules.min && val.length < rules.min) errors[field] = `Min ${rules.min} chars`;
      if (typeof val === 'string' && rules.max && val.length > rules.max) errors[field] = `Max ${rules.max} chars`;
    }
    return Object.keys(errors).length > 0 ? { success: false, errors } : { success: true };
  };
}

class Solution4ActionDispatcher {
  private actions = new Map<string, (data: Record<string, string>, ctx: ActionContext) => Promise<ActionResult>>();
  register(name: string, action: (data: Record<string, string>, ctx: ActionContext) => Promise<ActionResult>): void { this.actions.set(name, action); }
  async dispatch(actionName: string, data: Record<string, string>, ctx: ActionContext): Promise<ActionResult> {
    const action = this.actions.get(actionName);
    if (!action) return { success: false, error: `Action "${actionName}" not found` };
    return action(data, ctx);
  }
}

function solution5RevalidationTracker() {
  const history: Array<{ type: 'path' | 'tag'; value: string; timestamp: number }> = [];
  return {
    revalidatePath: (path: string) => { history.push({ type: 'path', value: path, timestamp: Date.now() }); },
    revalidateTag: (tag: string) => { history.push({ type: 'tag', value: tag, timestamp: Date.now() }); },
    wrapAction: async <T>(action: () => Promise<T>, revalidations: { paths?: string[]; tags?: string[] }): Promise<T> => {
      const result = await action();
      revalidations.paths?.forEach(p => history.push({ type: 'path', value: p, timestamp: Date.now() }));
      revalidations.tags?.forEach(t => history.push({ type: 'tag', value: t, timestamp: Date.now() }));
      return result;
    },
    getHistory: () => [...history],
  };
}

async function solution6ErrorHandler(action: () => Promise<ActionResult>, onError?: (error: unknown) => void) {
  try { return await action(); }
  catch (e) { onError?.(e); return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }; }
}

async function solution7Optimistic<T>(currentItems: T[], action: () => Promise<ActionResult<T>>, optimisticItem: T, rollbackOnFailure: boolean) {
  const optimistic = [...currentItems, optimisticItem];
  const result = await action();
  if (result.success) return { items: result.data ? [...currentItems, result.data] : optimistic, result };
  return { items: rollbackOnFailure ? currentItems : optimistic, result };
}

function solution8RateLimitAction(maxCalls: number, windowMs: number) {
  const calls: number[] = [];
  return {
    wrap: async <T>(action: () => Promise<T>): Promise<ActionResult<T>> => {
      const now = Date.now();
      const recent = calls.filter(t => now - t < windowMs);
      calls.length = 0; calls.push(...recent);
      if (recent.length >= maxCalls) return { success: false, error: 'Rate limit exceeded' };
      calls.push(now);
      try { return { success: true, data: await action() }; }
      catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Error' }; }
    },
    reset: () => { calls.length = 0; },
  };
}

function solution9InputSanitizer(data: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = value.trim().replace(/<[^>]*>/g, '').substring(0, 10000);
  }
  return result;
}

function solution10AuthorizeAction(
  ctx: ActionContext, requirements: { authenticated?: boolean; roles?: string[]; permissions?: string[] },
  rolePermissions?: Record<string, string[]>
): ActionResult {
  if (requirements.authenticated && !ctx.userId) return { success: false, error: 'Authentication required' };
  if (requirements.roles && ctx.role && !requirements.roles.includes(ctx.role)) return { success: false, error: `Role "${ctx.role}" not authorized` };
  if (requirements.permissions && ctx.role && rolePermissions) {
    const perms = rolePermissions[ctx.role] || [];
    const missing = requirements.permissions.filter(p => !perms.includes(p));
    if (missing.length > 0) return { success: false, error: `Missing permissions: ${missing.join(', ')}` };
  }
  return { success: true };
}

async function solution11ActionChain(actions: Array<{ name: string; action: (prevResult: unknown) => Promise<ActionResult> }>) {
  const completedSteps: string[] = [];
  let prevResult: unknown = null;
  for (const step of actions) {
    const result = await step.action(prevResult);
    if (!result.success) return { ...result, completedSteps };
    completedSteps.push(step.name);
    prevResult = result.data;
  }
  return { success: true, data: prevResult, completedSteps };
}

function solution12FormDataParser(fields: Array<{ name: string; value: string; type?: string }>) {
  const result: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'number') result[f.name] = Number(f.value);
    else if (f.type === 'boolean') result[f.name] = f.value === 'true' || f.value === 'on';
    else result[f.name] = f.value;
  }
  return result;
}

function solution13(): void {
  console.log("Server Actions ARE public HTTP endpoints with encrypted IDs");
  console.log("Attack vectors: CSRF (mitigated by origin check), injection, parameter tampering");
  console.log("ALWAYS: validate input, check auth, sanitize data, rate limit");
}

async function solution14RetryAction<T>(action: () => Promise<ActionResult<T>>, maxRetries: number, delayMs: number) {
  for (let i = 0; i <= maxRetries; i++) {
    const result = await action();
    if (result.success) return { ...result, attempts: i + 1 };
    if (i < maxRetries) await new Promise(r => setTimeout(r, delayMs));
  }
  return { success: false as const, error: 'Max retries exceeded', attempts: maxRetries + 1 };
}

class Solution15ServerActionFramework {
  private middleware: Array<(ctx: ActionContext, next: () => Promise<ActionResult>) => Promise<ActionResult>> = [];
  use(mw: (ctx: ActionContext, next: () => Promise<ActionResult>) => Promise<ActionResult>): void { this.middleware.push(mw); }
  createAction<T>(
    handler: (data: Record<string, string>, ctx: ActionContext) => Promise<T>,
    config?: { validate?: (data: Record<string, string>) => Record<string, string>; roles?: string[] }
  ) {
    return async (data: Record<string, string>, ctx: ActionContext): Promise<ActionResult<T>> => {
      let idx = 0;
      const runMiddleware = async (): Promise<ActionResult> => {
        if (idx < this.middleware.length) return this.middleware[idx++](ctx, runMiddleware);
        if (config?.roles && ctx.role && !config.roles.includes(ctx.role)) return { success: false, error: 'Unauthorized' };
        if (config?.validate) { const errors = config.validate(data); if (Object.keys(errors).length > 0) return { success: false, errors }; }
        try { return { success: true, data: await handler(data, ctx) }; }
        catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Error' }; }
      };
      return runMiddleware() as Promise<ActionResult<T>>;
    };
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2 ===");
  const action = solution2CreateAction(async (d) => ({ id: '1', ...d }), (d) => !d.title ? { title: 'required' } : {}, (ctx) => !!ctx.userId);
  console.log(await action({ userId: '1', role: 'admin' }, [{ name: 'title', value: 'Hello' }]));
  console.log(await action({}, [{ name: 'title', value: 'Hello' }]));
  console.log("\n=== Exercise 3 ===");
  const validate = solution3ZodLikeValidator({ email: { type: 'email', required: true }, name: { type: 'string', min: 2 } });
  console.log(validate({ email: 'bad', name: 'A' }));
  console.log(validate({ email: 'a@b.com', name: 'Alice' }));
  console.log("\n=== Exercise 5 ===");
  const tracker = solution5RevalidationTracker();
  await tracker.wrapAction(async () => 'done', { paths: ['/posts'], tags: ['posts'] });
  console.log(tracker.getHistory());
  console.log("\n=== Exercise 8 ===");
  const rl = solution8RateLimitAction(2, 1000);
  console.log(await rl.wrap(async () => 'a'));
  console.log(await rl.wrap(async () => 'b'));
  console.log(await rl.wrap(async () => 'c'));
  console.log("\n=== Exercise 9 ===");
  console.log(solution9InputSanitizer({ name: '  <script>alert("xss")</script>  ', bio: '  Normal text  ' }));
  console.log("\n=== Exercise 10 ===");
  console.log(solution10AuthorizeAction({ userId: '1', role: 'user' }, { authenticated: true, roles: ['admin'] }));
  console.log("\n=== Exercise 11 ===");
  console.log(await solution11ActionChain([
    { name: 'validate', action: async () => ({ success: true, data: { id: '1' } }) },
    { name: 'save', action: async (prev) => ({ success: true, data: { saved: true, prev } }) },
  ]));
  console.log("\n=== Exercise 13 ==="); solution13();
  console.log("\n=== Exercise 14 ===");
  let attempts = 0;
  console.log(await solution14RetryAction(async () => { attempts++; return attempts >= 3 ? { success: true, data: 'ok' } as const : { success: false } as const; }, 5, 10));
  console.log("\n=== Exercise 15 ===");
  const fw = new Solution15ServerActionFramework();
  fw.use(async (ctx, next) => { if (!ctx.userId) return { success: false, error: 'Auth required' }; return next(); });
  const createPost = fw.createAction(async (data) => ({ id: '1', title: data.title }), { validate: (d) => !d.title ? { title: 'required' } : {} });
  console.log(await createPost({ title: 'Hello' }, { userId: '1' }));
  console.log(await createPost({ title: 'Hello' }, {}));
}
main().catch(console.error);
