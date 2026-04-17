// ============================================================================
// parallel-routes: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/parallel-routes/exercises.ts
// ============================================================================

interface SlotDef { name: string; pages: Record<string, string>; defaultPage?: string; loadingMs?: number; }
interface SlotResult { slot: string; content: string | null; source: 'page' | 'default' | 'none'; }
interface LayoutProps { children: string | null; [slot: string]: string | null; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  // Slots: @team has page for / and /settings; @analytics has page for / only, has default.tsx
  // URL: /settings — what renders in each slot?
  console.log("Exercise 1 - predict slot rendering at /settings");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2ResolveSlots(url: string, slots: SlotDef[]): SlotResult[] {
  // TODO: Resolve each slot for given URL
  return [];
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
function exercise3LayoutProps(url: string, childPages: Record<string, string>, slots: SlotDef[]): LayoutProps {
  // TODO: Build complete layout props (children + named slots)
  return { children: null };
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
async function exercise4IndependentLoading(
  slots: Array<{ name: string; loadMs: number; content: string; fallback: string }>
): Promise<{ timeline: Array<{ time: number; slot: string; event: string }> }> {
  // TODO: Simulate independent loading of parallel slots
  return { timeline: [] };
}

// ─── Exercise 5: Predict ────────────────────────────────────────────────────
function exercise5(): void {
  // Soft navigation from / to /settings:
  // @team has /settings/page.tsx, @analytics does NOT have /settings/page.tsx
  // What happens to @analytics?
  console.log("Exercise 5 - predict soft vs hard navigation behavior");
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6SoftNavigation(
  currentSlotStates: Record<string, string>,
  targetUrl: string,
  slots: SlotDef[]
): Record<string, { content: string; changed: boolean }> {
  // TODO: Simulate soft navigation — maintain unmatched slot states
  return {};
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
function exercise7HardNavigation(targetUrl: string, slots: SlotDef[]): Record<string, { content: string; source: string }> {
  // TODO: Simulate hard navigation — unmatched slots use default.tsx
  return {};
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8ConditionalSlot(
  isAuthenticated: boolean,
  slots: { auth: string; app: string; children: string }
): { rendered: Record<string, string> } {
  // TODO: Conditionally render slots based on auth state
  return { rendered: {} };
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9ModalSlot(
  currentUrl: string,
  navigateTo: string,
  navigationType: 'soft' | 'hard',
  interceptors: Array<{ sourceDir: string; targetPattern: string; modalContent: string }>,
  fullPages: Record<string, string>
): { modalVisible: boolean; modalContent?: string; pageContent: string } {
  // TODO: Modal pattern with parallel routes + intercepting routes
  return { modalVisible: false, pageContent: '' };
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
function exercise10ErrorIsolation(
  slots: Array<{ name: string; throws: boolean; hasError: boolean; errorContent: string; content: string }>
): Record<string, { content: string; isError: boolean }> {
  // TODO: Each slot handles its own errors independently
  return {};
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
function exercise11SlotFileTree(
  files: string[]
): { slots: Array<{ name: string; pages: string[]; hasDefault: boolean; hasLoading: boolean; hasError: boolean }> } {
  // TODO: Parse file tree to extract parallel route slot definitions
  return { slots: [] };
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
function exercise12DashboardLayout(
  slots: SlotDef[],
  url: string,
  viewMode: 'full' | 'split' | 'focus'
): { visibleSlots: string[]; layout: string } {
  // TODO: Dashboard with configurable slot visibility
  return { visibleSlots: [], layout: '' };
}

// ─── Exercise 13: Predict ───────────────────────────────────────────────────
function exercise13(): void {
  console.log("What happens when a parallel route slot throws and has no error.tsx?");
  console.log("Does the entire page fail or just that slot?");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14SlotSyncState(
  slots: SlotDef[],
  navigations: Array<{ url: string; type: 'soft' | 'hard' }>
): Array<{ url: string; slotStates: Record<string, string> }> {
  // TODO: Track slot states across a sequence of navigations
  return [];
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15ParallelRouter {
  private slots: SlotDef[] = [];
  private currentStates: Record<string, string> = {};
  
  addSlot(slot: SlotDef): void {}
  navigate(url: string, type: 'soft' | 'hard'): Record<string, SlotResult> { return {}; }
  getCurrentLayout(): LayoutProps { return { children: null }; }
}

export {
  exercise1, exercise2ResolveSlots, exercise3LayoutProps,
  exercise4IndependentLoading, exercise5, exercise6SoftNavigation,
  exercise7HardNavigation, exercise8ConditionalSlot, exercise9ModalSlot,
  exercise10ErrorIsolation, exercise11SlotFileTree, exercise12DashboardLayout,
  exercise13, exercise14SlotSyncState, Exercise15ParallelRouter,
};
