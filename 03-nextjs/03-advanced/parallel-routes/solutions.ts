// ============================================================================
// parallel-routes: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/parallel-routes/solutions.ts
// ============================================================================

interface SlotDef { name: string; pages: Record<string, string>; defaultPage?: string; loadingMs?: number; }
interface SlotResult { slot: string; content: string | null; source: 'page' | 'default' | 'none'; }
interface LayoutProps { children: string | null; [slot: string]: string | null; }

function solution1(): void {
  console.log("@team: renders /settings page (TeamSettings)");
  console.log("@analytics: no /settings page → renders default.tsx (AnalyticsDefault)");
  console.log("children: renders /settings page if exists");
}

function solution2ResolveSlots(url: string, slots: SlotDef[]): SlotResult[] {
  return slots.map(slot => {
    if (slot.pages[url]) return { slot: slot.name, content: slot.pages[url], source: 'page' as const };
    if (slot.defaultPage) return { slot: slot.name, content: slot.defaultPage, source: 'default' as const };
    return { slot: slot.name, content: null, source: 'none' as const };
  });
}

function solution3LayoutProps(url: string, childPages: Record<string, string>, slots: SlotDef[]): LayoutProps {
  const props: LayoutProps = { children: childPages[url] || null };
  for (const slot of slots) {
    props[slot.name] = slot.pages[url] || slot.defaultPage || null;
  }
  return props;
}

async function solution4IndependentLoading(
  slots: Array<{ name: string; loadMs: number; content: string; fallback: string }>
) {
  const start = Date.now();
  const timeline: Array<{ time: number; slot: string; event: string }> = [];
  slots.forEach(s => timeline.push({ time: 0, slot: s.name, event: `show-fallback: ${s.fallback}` }));
  await Promise.all(slots.map(async (s) => {
    await new Promise(r => setTimeout(r, s.loadMs));
    timeline.push({ time: Date.now() - start, slot: s.name, event: `show-content: ${s.content}` });
  }));
  return { timeline: timeline.sort((a, b) => a.time - b.time) };
}

function solution5(): void {
  console.log("Soft navigation / → /settings:");
  console.log("  @team: updates to /settings content");
  console.log("  @analytics: maintains its PREVIOUS state (stays on / content)");
  console.log("Hard navigation (refresh) at /settings:");
  console.log("  @team: renders /settings content");
  console.log("  @analytics: renders default.tsx (no /settings page)");
}

function solution6SoftNavigation(currentStates: Record<string, string>, targetUrl: string, slots: SlotDef[]) {
  const result: Record<string, { content: string; changed: boolean }> = {};
  for (const slot of slots) {
    if (slot.pages[targetUrl]) {
      result[slot.name] = { content: slot.pages[targetUrl], changed: slot.pages[targetUrl] !== currentStates[slot.name] };
    } else {
      result[slot.name] = { content: currentStates[slot.name] || slot.defaultPage || '', changed: false };
    }
  }
  return result;
}

function solution7HardNavigation(targetUrl: string, slots: SlotDef[]) {
  const result: Record<string, { content: string; source: string }> = {};
  for (const slot of slots) {
    if (slot.pages[targetUrl]) result[slot.name] = { content: slot.pages[targetUrl], source: 'page' };
    else if (slot.defaultPage) result[slot.name] = { content: slot.defaultPage, source: 'default' };
    else result[slot.name] = { content: '', source: 'none' };
  }
  return result;
}

function solution8ConditionalSlot(
  isAuthenticated: boolean, slots: { auth: string; app: string; children: string }
) {
  return { rendered: isAuthenticated ? { main: slots.app, children: slots.children } : { main: slots.auth, children: slots.children } };
}

function solution9ModalSlot(
  _currentUrl: string, navigateTo: string, navigationType: 'soft' | 'hard',
  interceptors: Array<{ sourceDir: string; targetPattern: string; modalContent: string }>,
  fullPages: Record<string, string>
) {
  if (navigationType === 'hard') return { modalVisible: false, pageContent: fullPages[navigateTo] || '' };
  for (const int of interceptors) {
    const patternParts = int.targetPattern.split('/').filter(Boolean);
    const urlParts = navigateTo.split('/').filter(Boolean);
    if (patternParts.length === urlParts.length) {
      let match = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (!patternParts[i].startsWith('[') && patternParts[i] !== urlParts[i]) { match = false; break; }
      }
      if (match) return { modalVisible: true, modalContent: int.modalContent, pageContent: '' };
    }
  }
  return { modalVisible: false, pageContent: fullPages[navigateTo] || '' };
}

function solution10ErrorIsolation(
  slots: Array<{ name: string; throws: boolean; hasError: boolean; errorContent: string; content: string }>
) {
  const result: Record<string, { content: string; isError: boolean }> = {};
  for (const slot of slots) {
    if (slot.throws && slot.hasError) result[slot.name] = { content: slot.errorContent, isError: true };
    else if (slot.throws) result[slot.name] = { content: 'Unhandled error', isError: true };
    else result[slot.name] = { content: slot.content, isError: false };
  }
  return result;
}

function solution11SlotFileTree(files: string[]) {
  const slotMap = new Map<string, { pages: Set<string>; hasDefault: boolean; hasLoading: boolean; hasError: boolean }>();
  for (const file of files) {
    const match = file.match(/app\/@(\w+)/);
    if (!match) continue;
    const name = match[1];
    if (!slotMap.has(name)) slotMap.set(name, { pages: new Set(), hasDefault: false, hasLoading: false, hasError: false });
    const slot = slotMap.get(name)!;
    if (file.includes('default.tsx')) slot.hasDefault = true;
    else if (file.includes('loading.tsx')) slot.hasLoading = true;
    else if (file.includes('error.tsx')) slot.hasError = true;
    else if (file.includes('page.tsx')) slot.pages.add(file);
  }
  return {
    slots: [...slotMap.entries()].map(([name, data]) => ({
      name, pages: [...data.pages], hasDefault: data.hasDefault, hasLoading: data.hasLoading, hasError: data.hasError,
    })),
  };
}

function solution12DashboardLayout(slots: SlotDef[], url: string, viewMode: 'full' | 'split' | 'focus') {
  const resolved = solution2ResolveSlots(url, slots).filter(s => s.content);
  const visibleSlots = viewMode === 'focus' ? [resolved[0]?.slot].filter(Boolean) : resolved.map(s => s.slot);
  const layout = viewMode === 'full' ? 'grid' : viewMode === 'split' ? 'columns' : 'single';
  return { visibleSlots, layout };
}

function solution13(): void {
  console.log("Slot throws without error.tsx → error bubbles to parent layout's error.tsx");
  console.log("Other slots are NOT affected — they render normally");
  console.log("Only the throwing slot shows the error boundary");
}

function solution14SlotSyncState(slots: SlotDef[], navigations: Array<{ url: string; type: 'soft' | 'hard' }>) {
  let currentStates: Record<string, string> = {};
  for (const slot of slots) currentStates[slot.name] = slot.pages['/'] || slot.defaultPage || '';
  return navigations.map(nav => {
    if (nav.type === 'hard') {
      currentStates = {};
      for (const slot of slots) currentStates[slot.name] = slot.pages[nav.url] || slot.defaultPage || '';
    } else {
      for (const slot of slots) {
        if (slot.pages[nav.url]) currentStates[slot.name] = slot.pages[nav.url];
      }
    }
    return { url: nav.url, slotStates: { ...currentStates } };
  });
}

class Solution15ParallelRouter {
  private slots: SlotDef[] = [];
  private currentStates: Record<string, string> = {};
  private currentUrl = '/';
  addSlot(slot: SlotDef): void { this.slots.push(slot); this.currentStates[slot.name] = slot.pages['/'] || slot.defaultPage || ''; }
  navigate(url: string, type: 'soft' | 'hard'): Record<string, SlotResult> {
    this.currentUrl = url;
    const result: Record<string, SlotResult> = {};
    for (const slot of this.slots) {
      if (slot.pages[url]) {
        this.currentStates[slot.name] = slot.pages[url];
        result[slot.name] = { slot: slot.name, content: slot.pages[url], source: 'page' };
      } else if (type === 'hard') {
        this.currentStates[slot.name] = slot.defaultPage || '';
        result[slot.name] = { slot: slot.name, content: slot.defaultPage || null, source: slot.defaultPage ? 'default' : 'none' };
      } else {
        result[slot.name] = { slot: slot.name, content: this.currentStates[slot.name], source: 'page' };
      }
    }
    return result;
  }
  getCurrentLayout(): LayoutProps { const props: LayoutProps = { children: null }; for (const [k, v] of Object.entries(this.currentStates)) props[k] = v; return props; }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2 ===");
  console.log(solution2ResolveSlots('/settings', [
    { name: 'team', pages: { '/': 'TeamHome', '/settings': 'TeamSettings' } },
    { name: 'analytics', pages: { '/': 'AnalyticsHome' }, defaultPage: 'AnalyticsDefault' },
  ]));
  console.log("\n=== Exercise 3 ===");
  console.log(solution3LayoutProps('/', { '/': 'MainPage' }, [{ name: 'team', pages: { '/': 'Team' } }]));
  console.log("\n=== Exercise 4 ===");
  console.log(await solution4IndependentLoading([
    { name: 'team', loadMs: 10, content: 'Team!', fallback: 'Loading team...' },
    { name: 'analytics', loadMs: 30, content: 'Analytics!', fallback: 'Loading analytics...' },
  ]));
  console.log("\n=== Exercise 5 ==="); solution5();
  console.log("\n=== Exercise 6 ===");
  console.log(solution6SoftNavigation({ team: 'TeamHome', analytics: 'AnalyticsHome' }, '/settings', [
    { name: 'team', pages: { '/': 'TeamHome', '/settings': 'TeamSettings' } },
    { name: 'analytics', pages: { '/': 'AnalyticsHome' }, defaultPage: 'AnalyticsDefault' },
  ]));
  console.log("\n=== Exercise 8 ===");
  console.log(solution8ConditionalSlot(true, { auth: 'Login', app: 'Dashboard', children: 'Main' }));
  console.log("\n=== Exercise 10 ===");
  console.log(solution10ErrorIsolation([
    { name: 'team', throws: false, hasError: true, errorContent: 'Team Error', content: 'Team OK' },
    { name: 'analytics', throws: true, hasError: true, errorContent: 'Analytics Error', content: 'Analytics OK' },
  ]));
  console.log("\n=== Exercise 13 ==="); solution13();
  console.log("\n=== Exercise 15 ===");
  const router = new Solution15ParallelRouter();
  router.addSlot({ name: 'team', pages: { '/': 'TeamHome', '/settings': 'TeamSettings' } });
  router.addSlot({ name: 'analytics', pages: { '/': 'AnalyticsHome' }, defaultPage: 'Default' });
  console.log("Soft to /settings:", router.navigate('/settings', 'soft'));
  console.log("Hard to /settings:", router.navigate('/settings', 'hard'));
}
main().catch(console.error);
