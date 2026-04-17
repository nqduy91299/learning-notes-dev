// ============================================================================
// forms-and-mutations: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/forms-and-mutations/exercises.ts
// ============================================================================

interface FormState { success: boolean; errors: Record<string, string>; data?: unknown; }
interface FormField { name: string; value: string; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  // What happens when JS is disabled and user submits a form with Server Action?
  // What about when JS is enabled?
  console.log("Exercise 1 - predict form behavior with/without JS");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2ParseFormData(fields: FormField[]): Record<string, string | string[]> {
  // TODO: Parse form fields, handling duplicate names as arrays
  return {};
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
function exercise3Validate(
  data: Record<string, unknown>,
  schema: Record<string, { type: string; required?: boolean; min?: number; max?: number; pattern?: string }>
): FormState {
  // TODO: Validate form data against schema, return errors
  return { success: true, errors: {} };
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
function exercise4ServerAction<T>(
  handler: (data: Record<string, string>) => Promise<{ success: boolean; data?: T; error?: string }>,
  validator: (data: Record<string, string>) => FormState
): (prevState: FormState, fields: FormField[]) => Promise<FormState> {
  // TODO: Create a server action wrapper with validation
  return async () => ({ success: false, errors: {} });
}

// ─── Exercise 5: Implement ──────────────────────────────────────────────────
class Exercise5FormStatus {
  private _pending = false;
  get pending(): boolean { return this._pending; }

  async submit<T>(action: () => Promise<T>): Promise<T> {
    // TODO: Track pending state during action execution
    return action();
  }
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6Optimistic<T>(
  currentState: T[],
  optimisticUpdate: (state: T[], action: T) => T[],
): {
  state: T[];
  addOptimistic: (item: T) => void;
  confirm: () => void;
  rollback: () => void;
} {
  // TODO: Implement optimistic state management
  let optimisticState = [...currentState];
  return {
    state: optimisticState,
    addOptimistic: () => {},
    confirm: () => {},
    rollback: () => {},
  };
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
function exercise7ValidationPipeline(
  validators: Array<(data: Record<string, unknown>) => Record<string, string>>
): (data: Record<string, unknown>) => FormState {
  // TODO: Chain multiple validators, collect all errors
  return () => ({ success: true, errors: {} });
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8Revalidation(): {
  revalidatePath: (path: string) => void;
  revalidateTag: (tag: string) => void;
  getInvalidated: () => { paths: string[]; tags: string[] };
} {
  // TODO: Track revalidation calls (simulate next/cache)
  return { revalidatePath: () => {}, revalidateTag: () => {}, getInvalidated: () => ({ paths: [], tags: [] }) };
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9ProgressiveForm(
  fields: FormField[],
  action: (data: Record<string, string>) => Promise<FormState>,
  jsEnabled: boolean
): Promise<{ state: FormState; method: 'ajax' | 'full-reload'; pendingShown: boolean }> {
  // TODO: Simulate progressive enhancement
  return Promise.resolve({ state: { success: false, errors: {} }, method: 'full-reload', pendingShown: false });
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
class Exercise10FormBuilder {
  private validators: Array<(data: Record<string, unknown>) => Record<string, string>> = [];
  private _action: ((data: Record<string, string>) => Promise<{ success: boolean; data?: unknown; error?: string }>) | null = null;

  validate(fn: (data: Record<string, unknown>) => Record<string, string>): this { return this; }
  action(fn: (data: Record<string, string>) => Promise<{ success: boolean; data?: unknown; error?: string }>): this { return this; }
  build(): (prevState: FormState, fields: FormField[]) => Promise<FormState> {
    return async () => ({ success: false, errors: {} });
  }
}

// ─── Exercise 11: Predict ───────────────────────────────────────────────────
function exercise11(): void {
  console.log("What happens if a Server Action throws an error?");
  console.log("What happens if you call redirect() inside a Server Action?");
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
function exercise12MultiStepForm(
  steps: Array<{
    fields: string[];
    validate: (data: Record<string, string>) => Record<string, string>;
  }>
): {
  currentStep: number;
  submitStep: (data: Record<string, string>) => FormState;
  nextStep: () => boolean;
  prevStep: () => boolean;
  getAllData: () => Record<string, string>;
  isComplete: () => boolean;
} {
  // TODO: Multi-step form state machine
  return { currentStep: 0, submitStep: () => ({ success: true, errors: {} }), nextStep: () => false, prevStep: () => false, getAllData: () => ({}), isComplete: () => false };
}

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
function exercise13DebouncedAction<T>(
  action: (value: string) => Promise<T>,
  delayMs: number
): { trigger: (value: string) => void; getResult: () => Promise<T | null> } {
  // TODO: Debounced server action trigger (e.g., search-as-you-type)
  let resultPromise: Promise<T | null> = Promise.resolve(null);
  return { trigger: () => {}, getResult: () => resultPromise };
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14FileUploadAction(
  files: Array<{ name: string; size: number; type: string }>,
  maxSizeMB: number,
  allowedTypes: string[]
): { valid: boolean; errors: string[]; validFiles: Array<{ name: string; size: number; type: string }> } {
  // TODO: Validate file uploads for a server action
  return { valid: true, errors: [], validFiles: [] };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15MutationManager {
  private mutations: Array<{ id: string; status: 'pending' | 'success' | 'error'; data?: unknown }> = [];

  async execute<T>(
    id: string,
    action: () => Promise<T>,
    onOptimistic?: () => void,
    onRevalidate?: () => void
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    // TODO: Full mutation lifecycle
    return { success: false };
  }

  getStatus(id: string): 'pending' | 'success' | 'error' | 'idle' { return 'idle'; }
  getPending(): string[] { return []; }
}

export {
  exercise1, exercise2ParseFormData, exercise3Validate, exercise4ServerAction,
  Exercise5FormStatus, exercise6Optimistic, exercise7ValidationPipeline,
  exercise8Revalidation, exercise9ProgressiveForm, Exercise10FormBuilder,
  exercise11, exercise12MultiStepForm, exercise13DebouncedAction,
  exercise14FileUploadAction, Exercise15MutationManager,
};
