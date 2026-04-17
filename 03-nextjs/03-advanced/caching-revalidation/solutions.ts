// ============================================================================
// caching-revalidation: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/caching-revalidation/solutions.ts
// ============================================================================

interface CacheEntry { key: string; data: unknown; timestamp: number; revalidateMs: number; tags: string[]; }

function solution1(): void {
  console.log("3 fetch calls: URL-A, URL-A, URL-B");
  console.log("Network requests: 2 (URL-A deduped by Request Memoization)");
  console.log("Request Memoization deduplicates within single render");
}

class Solution2RequestMemoization {
  private memo = new Map<string, Promise<unknown>>();
  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<{ data: T; memoized: boolean }> {
    const existing = this.memo.get(key);
    if (existing) return { data: (await existing) as T, memoized: true };
    const promise = fetcher();
    this.memo.set(key, promise);
    return { data: await promise, memoized: false };
  }
  clear(): void { this.memo.clear(); }
}

class Solution3DataCache {
  private store = new Map<string, CacheEntry>();
  async get<T>(key: string, fetcher: () => Promise<T>, options: {
    revalidate?: number; tags?: string[]; cache?: 'force-cache' | 'no-store';
  }): Promise<{ data: T; source: 'cache' | 'network'; stale: boolean }> {
    if (options.cache === 'no-store') return { data: await fetcher(), source: 'network', stale: false };
    const now = Date.now();
    const cached = this.store.get(key);
    if (cached && (cached.revalidateMs === 0 || now - cached.timestamp < cached.revalidateMs)) {
      return { data: cached.data as T, source: 'cache', stale: false };
    }
    if (cached && cached.revalidateMs > 0) {
      const data = await fetcher();
      this.store.set(key, { key, data, timestamp: now, revalidateMs: (options.revalidate || 0) * 1000, tags: options.tags || [] });
      return { data, source: 'network', stale: true };
    }
    const data = await fetcher();
    this.store.set(key, { key, data, timestamp: now, revalidateMs: (options.revalidate || 0) * 1000, tags: options.tags || [] });
    return { data, source: 'network', stale: false };
  }
  revalidateTag(tag: string): number {
    let c = 0;
    for (const [k, v] of this.store) { if (v.tags.includes(tag)) { this.store.delete(k); c++; } }
    return c;
  }
  revalidatePath(path: string): boolean { return this.store.delete(path); }
}

class Solution4FullRouteCache {
  private cache = new Map<string, { html: string; rscPayload: string; generatedAt: number; revalidateMs: number }>();
  cacheRoute(path: string, html: string, rscPayload: string, revalidateMs: number): void {
    this.cache.set(path, { html, rscPayload, generatedAt: Date.now(), revalidateMs });
  }
  getRoute(path: string, nowMs = Date.now()) {
    const c = this.cache.get(path);
    if (!c) return null;
    if (c.revalidateMs > 0 && nowMs - c.generatedAt > c.revalidateMs) return null;
    return { html: c.html, rscPayload: c.rscPayload, hit: true };
  }
  invalidate(path: string): boolean { return this.cache.delete(path); }
}

class Solution5RouterCache {
  private cache = new Map<string, { payload: string; timestamp: number; ttlMs: number }>();
  prefetch(path: string, payload: string, isDynamic: boolean): void {
    this.cache.set(path, { payload, timestamp: Date.now(), ttlMs: isDynamic ? 30000 : 300000 });
  }
  get(path: string, nowMs = Date.now()): string | null {
    const c = this.cache.get(path);
    if (!c || nowMs - c.timestamp > c.ttlMs) return null;
    return c.payload;
  }
  invalidate(path?: string): void { path ? this.cache.delete(path) : this.cache.clear(); }
}

function solution7(): void {
  console.log("t=0:  Fetch from network, cache result (Data Cache)");
  console.log("t=30: Return cached (within 60s window)");
  console.log("t=61: Return stale cached, trigger background revalidation");
  console.log("t=62: Return fresh data (if revalidation completed) or stale");
}

function solution8TagSystem() {
  const store = new Map<string, { data: unknown; tags: Set<string> }>();
  return {
    tagFetch: (key: string, data: unknown, tags: string[]) => { store.set(key, { data, tags: new Set(tags) }); },
    revalidateTag: (tag: string): string[] => {
      const removed: string[] = [];
      for (const [k, v] of store) { if (v.tags.has(tag)) { store.delete(k); removed.push(k); } }
      return removed;
    },
    revalidatePath: (path: string): boolean => store.delete(path),
    getEntry: (key: string) => store.get(key)?.data,
  };
}

function solution9CacheStrategy(
  fetches: Array<{ url: string; cache?: 'force-cache' | 'no-store'; revalidate?: number; tags?: string[] }>
) {
  const hasNoStore = fetches.some(f => f.cache === 'no-store');
  if (hasNoStore) return { routeType: 'dynamic' as const, allTags: fetches.flatMap(f => f.tags || []) };
  const revalidates = fetches.map(f => f.revalidate).filter((v): v is number => v !== undefined);
  if (revalidates.length > 0) return { routeType: 'isr' as const, lowestRevalidate: Math.min(...revalidates), allTags: fetches.flatMap(f => f.tags || []) };
  return { routeType: 'static' as const, allTags: fetches.flatMap(f => f.tags || []) };
}

class Solution10RevalidationScheduler {
  private scheduled = new Map<string, { nextRun: number; intervalMs: number }>();
  schedule(key: string, intervalMs: number): void { this.scheduled.set(key, { nextRun: Date.now() + intervalMs, intervalMs }); }
  tick(nowMs: number): string[] {
    const due: string[] = [];
    for (const [key, s] of this.scheduled) {
      if (nowMs >= s.nextRun) { due.push(key); s.nextRun = nowMs + s.intervalMs; }
    }
    return due;
  }
  cancel(key: string): void { this.scheduled.delete(key); }
}

function solution11CacheInspector(cache: Map<string, CacheEntry>) {
  const now = Date.now();
  let stale = 0; let oldest = Infinity; let oldestKey: string | null = null;
  const tagDist: Record<string, number> = {};
  let size = 0;
  for (const [k, v] of cache) {
    if (v.revalidateMs > 0 && now - v.timestamp > v.revalidateMs) stale++;
    if (v.timestamp < oldest) { oldest = v.timestamp; oldestKey = k; }
    for (const t of v.tags) tagDist[t] = (tagDist[t] || 0) + 1;
    size += JSON.stringify(v.data).length;
  }
  return { totalEntries: cache.size, staleEntries: stale, tagDistribution: tagDist, oldestEntry: oldestKey, estimatedSizeBytes: size };
}

function solution13(): void {
  console.log("revalidatePath during Server Action:");
  console.log("  - Data Cache: entries for that path invalidated");
  console.log("  - Full Route Cache: cached HTML/RSC payload invalidated");
  console.log("  - Router Cache: client-side cache invalidated on next navigation");
  console.log("  - Request Memoization: not affected (per-request scope)");
}

async function solution14CacheCoordinator(
  action: () => Promise<void>,
  revalidations: { paths?: string[]; tags?: string[] }
) {
  try {
    await action();
    return { actionCompleted: true, revalidatedPaths: revalidations.paths || [], revalidatedTags: revalidations.tags || [] };
  } catch { return { actionCompleted: false, revalidatedPaths: [], revalidatedTags: [] }; }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2: Request Memoization ===");
  const rm = new Solution2RequestMemoization();
  let calls = 0;
  const [a, b] = await Promise.all([rm.fetch('k', async () => { calls++; return 'data'; }), rm.fetch('k', async () => { calls++; return 'data'; })]);
  console.log(a, b, "Network calls:", calls);
  console.log("\n=== Exercise 3: Data Cache ===");
  const dc = new Solution3DataCache();
  console.log(await dc.get('/api', async () => 'fresh', { revalidate: 60, tags: ['api'] }));
  console.log(await dc.get('/api', async () => 'should-not-see', { revalidate: 60, tags: ['api'] }));
  console.log("Revalidated:", dc.revalidateTag('api'));
  console.log(await dc.get('/api', async () => 'new-data', { revalidate: 60 }));
  console.log("\n=== Exercise 4: Full Route Cache ===");
  const frc = new Solution4FullRouteCache();
  frc.cacheRoute('/posts', '<html>posts</html>', 'rsc-payload', 60000);
  console.log(frc.getRoute('/posts'));
  console.log("\n=== Exercise 5: Router Cache ===");
  const rc = new Solution5RouterCache();
  rc.prefetch('/about', 'about-payload', false);
  console.log(rc.get('/about'));
  console.log("\n=== Exercise 7 ==="); solution7();
  console.log("\n=== Exercise 8: Tag System ===");
  const ts = solution8TagSystem();
  ts.tagFetch('/posts/1', { title: 'Hello' }, ['posts']);
  ts.tagFetch('/posts/2', { title: 'World' }, ['posts']);
  console.log("Before:", ts.getEntry('/posts/1'));
  console.log("Revalidated:", ts.revalidateTag('posts'));
  console.log("After:", ts.getEntry('/posts/1'));
  console.log("\n=== Exercise 9 ===");
  console.log(solution9CacheStrategy([{ url: '/a', revalidate: 60 }, { url: '/b', revalidate: 3600 }]));
  console.log(solution9CacheStrategy([{ url: '/a' }, { url: '/b', cache: 'no-store' }]));
  console.log("\n=== Exercise 13 ==="); solution13();
}
main().catch(console.error);
