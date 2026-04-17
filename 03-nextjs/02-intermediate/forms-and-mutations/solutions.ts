// ============================================================================
// forms-and-mutations: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/forms-and-mutations/solutions.ts
// ============================================================================

interface FormState { success: boolean; errors: Record<string, string>; data?: unknown; }
interface FormField { name: string; value: string; }

function solution1(): void {
  console.log("JS disabled: Form submits via standard HTTP POST, full page reload, server processes action");
  console.log("JS enabled: Form submits via fetch (AJAX), no page reload, pending state shown, optimistic updates possible");
}

function solution2ParseFormData(fields: FormField[]): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const { name, value } of fields) {
    const existing = result[name];
    if (existing === undefined) { result[name] = value; }
    else if (Array.isArray(existing)) { existing.push(value); }
    else { result[name] = [existing, value]; }
  }
  return result;
}

function solution3Validate(
  data: Record<string, unknown>,
  schema: Record<string, { type: string; required?: boolean; min?: number; max?: number; pattern?: string }>
): FormState {
  const errors: Record<string, string> = {};
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`; continue;
    }
    if (value === undefined || value === null) continue;
    if (rules.type === 'string' && typeof value !== 'string') errors[field] = `${field} must be a string`;
    if (rules.type === 'number' && typeof value !== 'number') errors[field] = `${field} must be a number`;
    if (typeof value === 'string' && rules.min && value.length < rules.min) errors[field] = `${field} min length ${rules.min}`;
    if (typeof value === 'string' && rules.max && value.length > rules.max) errors[field] = `${field} max length ${rules.max}`;
    if (typeof value === 'string' && rules.pattern && !new RegExp(rules.pattern).test(value)) errors[field] = `${field} invalid format`;
  }
  return { success: Object.keys(errors).length === 0, errors };
}

function solution4ServerAction<T>(
  handler: (data: Record<string, string>) => Promise<{ success: boolean; data?: T; error?: string }>,
  validator: (data: Record<string, string>) => FormState
): (prevState: FormState, fields: FormField[]) => Promise<FormState> {
  return async (_prevState: FormState, fields: FormField[]): Promise<FormState> => {
    const data = solution2ParseFormData(fields) as Record<string, string>;
    const validation = validator(data);
    if (!validation.success) return validation;
    try {
      const result = await handler(data);
      return { success: result.success, errors: result.error ? { _form: result.error } : {}, data: result.data };
    } catch (e) {
      return { success: false, errors: { _form: e instanceof Error ? e.message : 'Unknown error' } };
    }
  };
}

class Solution5FormStatus {
  private _pending = false;
  get pending(): boolean { return this._pending; }
  async submit<T>(action: () => Promise<T>): Promise<T> {
    this._pending = true;
    try { return await action(); } finally { this._pending = false; }
  }
}

function solution6Optimistic<T>(
  currentState: T[], optimisticUpdate: (state: T[], action: T) => T[]
): { state: T[]; addOptimistic: (item: T) => void; confirm: () => void; rollback: () => void; } {
  let optimisticState = [...currentState];
  let baseState = [...currentState];
  return {
    get state() { return optimisticState; },
    addOptimistic: (item: T) => { optimisticState = optimisticUpdate([...optimisticState], item); },
    confirm: () => { baseState = [...optimisticState]; },
    rollback: () => { optimisticState = [...baseState]; },
  };
}

function solution7ValidationPipeline(
  validators: Array<(data: Record<string, unknown>) => Record<string, string>>
): (data: Record<string, unknown>) => FormState {
  return (data) => {
    const allErrors: Record<string, string> = {};
    for (const validator of validators) {
      const errors = validator(data);
      Object.assign(allErrors, errors);
    }
    return { success: Object.keys(allErrors).length === 0, errors: allErrors };
  };
}

function solution8Revalidation() {
  const paths: string[] = [];
  const tags: string[] = [];
  return {
    revalidatePath: (path: string) => { paths.push(path); },
    revalidateTag: (tag: string) => { tags.push(tag); },
    getInvalidated: () => ({ paths: [...paths], tags: [...tags] }),
  };
}

async function solution9ProgressiveForm(
  fields: FormField[], action: (data: Record<string, string>) => Promise<FormState>, jsEnabled: boolean
): Promise<{ state: FormState; method: 'ajax' | 'full-reload'; pendingShown: boolean }> {
  const data = solution2ParseFormData(fields) as Record<string, string>;
  const state = await action(data);
  return { state, method: jsEnabled ? 'ajax' : 'full-reload', pendingShown: jsEnabled };
}

class Solution10FormBuilder {
  private validators: Array<(data: Record<string, unknown>) => Record<string, string>> = [];
  private _action: ((data: Record<string, string>) => Promise<{ success: boolean; data?: unknown; error?: string }>) | null = null;
  validate(fn: (data: Record<string, unknown>) => Record<string, string>): this { this.validators.push(fn); return this; }
  action(fn: (data: Record<string, string>) => Promise<{ success: boolean; data?: unknown; error?: string }>): this { this._action = fn; return this; }
  build(): (prevState: FormState, fields: FormField[]) => Promise<FormState> {
    const pipeline = solution7ValidationPipeline(this.validators);
    const action = this._action!;
    return solution4ServerAction(action, (data) => pipeline(data));
  }
}

function solution11(): void {
  console.log("Server Action throws: error.tsx boundary catches it (or returns error state via useFormState)");
  console.log("redirect() in Server Action: works! Throws NEXT_REDIRECT internally, Next.js handles the redirect");
}

function solution12MultiStepForm(
  steps: Array<{ fields: string[]; validate: (data: Record<string, string>) => Record<string, string>; }>
) {
  let currentStep = 0;
  const stepData: Record<string, string>[] = steps.map(() => ({}));

  return {
    get currentStep() { return currentStep; },
    submitStep: (data: Record<string, string>): FormState => {
      const errors = steps[currentStep].validate(data);
      if (Object.keys(errors).length > 0) return { success: false, errors };
      stepData[currentStep] = data;
      return { success: true, errors: {} };
    },
    nextStep: (): boolean => { if (currentStep < steps.length - 1) { currentStep++; return true; } return false; },
    prevStep: (): boolean => { if (currentStep > 0) { currentStep--; return true; } return false; },
    getAllData: (): Record<string, string> => Object.assign({}, ...stepData),
    isComplete: (): boolean => currentStep === steps.length - 1 && Object.keys(stepData[currentStep]).length > 0,
  };
}

function solution13DebouncedAction<T>(action: (value: string) => Promise<T>, delayMs: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let latestResult: Promise<T | null> = Promise.resolve(null);
  return {
    trigger: (value: string) => {
      if (timeout) clearTimeout(timeout);
      latestResult = new Promise((resolve) => {
        timeout = setTimeout(async () => { resolve(await action(value)); }, delayMs);
      });
    },
    getResult: () => latestResult,
  };
}

function solution14FileUploadAction(
  files: Array<{ name: string; size: number; type: string }>, maxSizeMB: number, allowedTypes: string[]
) {
  const errors: string[] = [];
  const validFiles: Array<{ name: string; size: number; type: string }> = [];
  const maxBytes = maxSizeMB * 1024 * 1024;
  for (const file of files) {
    if (file.size > maxBytes) { errors.push(`${file.name}: exceeds ${maxSizeMB}MB`); continue; }
    if (!allowedTypes.includes(file.type)) { errors.push(`${file.name}: type ${file.type} not allowed`); continue; }
    validFiles.push(file);
  }
  return { valid: errors.length === 0, errors, validFiles };
}

class Solution15MutationManager {
  private mutations = new Map<string, { status: 'pending' | 'success' | 'error'; data?: unknown }>();
  async execute<T>(id: string, action: () => Promise<T>, onOptimistic?: () => void, onRevalidate?: () => void) {
    this.mutations.set(id, { status: 'pending' });
    onOptimistic?.();
    try {
      const data = await action();
      this.mutations.set(id, { status: 'success', data });
      onRevalidate?.();
      return { success: true as const, data };
    } catch (e) {
      this.mutations.set(id, { status: 'error' });
      return { success: false as const, error: e instanceof Error ? e.message : 'Unknown' };
    }
  }
  getStatus(id: string): 'pending' | 'success' | 'error' | 'idle' { return this.mutations.get(id)?.status ?? 'idle'; }
  getPending(): string[] { return [...this.mutations].filter(([, v]) => v.status === 'pending').map(([k]) => k); }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2 ===");
  console.log(solution2ParseFormData([{ name: 'tag', value: 'a' }, { name: 'tag', value: 'b' }, { name: 'title', value: 'hi' }]));
  console.log("\n=== Exercise 3 ===");
  console.log(solution3Validate({ name: '', email: 'bad' }, { name: { type: 'string', required: true }, email: { type: 'string', pattern: '.+@.+' } }));
  console.log("\n=== Exercise 4 ===");
  const action = solution4ServerAction(async (d) => ({ success: true, data: d }), (d) => solution3Validate(d, { name: { type: 'string', required: true } }));
  console.log(await action({ success: false, errors: {} }, [{ name: 'name', value: 'Alice' }]));
  console.log("\n=== Exercise 5 ===");
  const fs = new Solution5FormStatus();
  console.log("Before:", fs.pending);
  const p = fs.submit(() => new Promise(r => setTimeout(() => r('done'), 50)));
  console.log("During:", fs.pending);
  await p;
  console.log("After:", fs.pending);
  console.log("\n=== Exercise 6 ===");
  const opt = solution6Optimistic([1, 2], (s, a) => [...s, a]);
  opt.addOptimistic(3);
  console.log("Optimistic:", opt.state);
  opt.confirm();
  console.log("Confirmed:", opt.state);
  console.log("\n=== Exercise 7 ===");
  const validate = solution7ValidationPipeline([
    (d) => d.name === '' ? { name: 'required' } : {},
    (d) => typeof d.age === 'number' && d.age < 0 ? { age: 'must be positive' } : {},
  ]);
  console.log(validate({ name: '', age: -1 }));
  console.log("\n=== Exercise 8 ===");
  const rev = solution8Revalidation();
  rev.revalidatePath('/posts');
  rev.revalidateTag('posts');
  console.log(rev.getInvalidated());
  console.log("\n=== Exercise 11 ==="); solution11();
  console.log("\n=== Exercise 12 ===");
  const msf = solution12MultiStepForm([
    { fields: ['name'], validate: (d) => !d.name ? { name: 'required' } : {} },
    { fields: ['email'], validate: (d) => !d.email ? { email: 'required' } : {} },
  ]);
  console.log(msf.submitStep({ name: 'Alice' }));
  msf.nextStep();
  console.log("Step:", msf.currentStep);
  console.log("\n=== Exercise 14 ===");
  console.log(solution14FileUploadAction(
    [{ name: 'photo.jpg', size: 1000000, type: 'image/jpeg' }, { name: 'virus.exe', size: 5000000, type: 'application/exe' }],
    2, ['image/jpeg', 'image/png']
  ));
  console.log("\n=== Exercise 15 ===");
  const mm = new Solution15MutationManager();
  console.log(await mm.execute('m1', async () => 'created', () => console.log("  optimistic!"), () => console.log("  revalidated!")));
  console.log("Status:", mm.getStatus('m1'));
}

main().catch(console.error);
