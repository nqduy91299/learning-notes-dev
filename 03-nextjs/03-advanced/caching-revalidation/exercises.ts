// ============================================================================
// caching-revalidation: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/caching-revalidation/exercises.ts
// ============================================================================

interface CacheLayer { name: string; scope: string; location: 'server' | 'client'; }
interface CacheEntry { key: string; data: unknown; timestamp: number; revalidateMs: number; tags: string[]; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  // A page makes 3 fetch calls: same URL twice + one different URL
  // How many network requests happen? Which cache layer deduplicates?
  console.log("Exercise 1 - predict cache behavior");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
class Exercise2RequestMemoization {
  private memo = new Map<string, Promise<unknown>>();

  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<{ data: T; memoized: boolean }> {
    // TODO: Memoize within single render (request scope)
    return { data: await fetcher(), memoized: false };
  }

  clear(): void { this.memo.clear(); }
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
class Exercise3DataCache {
  private store = new Map<string, CacheEntry>();

  async get<T>(key: string, fetcher: () => Promise<T>, options: {
    revalidate?: number; tags?: string[]; cache?: 'force-cache' | 'no-store';
  }): Promise<{ data: T; source: 'cache' | 'network'; stale: boolean }> {
    // TODO: Implement Data Cache with revalidation
    return { data: await fetcher(), source: 'network', stale: false };
  }

  revalidateTag(tag: string): number {
    // TODO: Invalidate entries by tag
    return 0;
  }

  revalidatePath(path: string): boolean { return false; }
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
class Exercise4FullRouteCache {
  private cache = new Map<string, { html: string; rscPayload: string; generatedAt: number; revalidateMs: number }>();

  cacheRoute(path: string, html: string, rscPayload: string, revalidateMs: number): void {}
  getRoute(path: string, nowMs?: number): { html: string; rscPayload: string; hit: boolean } | null { return null; }
  invalidate(path: string): boolean { return false; }
}

// ─── Exercise 5: Implement ──────────────────────────────────────────────────
class Exercise5RouterCache {
  private cache = new Map<string, { payload: string; timestamp: number }>();
  private staticTTLMs = 5 * 60 * 1000; // 5 minutes for static
  private dynamicTTLMs = 30 * 1000;    // 30 seconds for dynamic

  prefetch(path: string, payload: string, isDynamic: boolean): void {}
  get(path: string, nowMs?: number): string | null { return null; }
  invalidate(path?: string): void {} // No path = invalidate all
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
class Exercise6MultiLayerCache {
  private requestMemo = new Exercise2RequestMemoization();
  private dataCache = new Exercise3DataCache();

  async fetch<T>(key: string, fetcher: () => Promise<T>, options: {
    revalidate?: number; tags?: string[]; cache?: 'force-cache' | 'no-store';
  }): Promise<{ data: T; layers: string[] }> {
    // TODO: Check request memoization first, then data cache, then network
    return { data: await fetcher(), layers: ['network'] };
  }
}

// ─── Exercise 7: Predict ────────────────────────────────────────────────────
function exercise7(): void {
  // fetch('/api', { next: { revalidate: 60 } }) called at t=0, t=30, t=61, t=62
  // What happens at each timestamp?
  console.log("Exercise 7 - predict revalidation timeline");
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8TagSystem(): {
  tagFetch: (key: string, data: unknown, tags: string[]) => void;
  revalidateTag: (tag: string) => string[];
  revalidatePath: (path: string) => boolean;
  getEntry: (key: string) => unknown | undefined;
} {
  // TODO: Full tag-based caching system
  return { tagFetch: () => {}, revalidateTag: () => [], revalidatePath: () => false, getEntry: () => undefined };
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9CacheStrategy(
  fetches: Array<{ url: string; cache?: 'force-cache' | 'no-store'; revalidate?: number; tags?: string[] }>
): { routeType: 'static' | 'dynamic' | 'isr'; lowestRevalidate?: number; allTags: string[] } {
  // TODO: Determine cache strategy for a route based on its fetches
  return { routeType: 'static', allTags: [] };
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
class Exercise10RevalidationScheduler {
  private scheduled = new Map<string, { nextRun: number; intervalMs: number }>();
  
  schedule(key: string, intervalMs: number): void {}
  tick(nowMs: number): string[] { return []; } // Returns keys that need revalidation
  cancel(key: string): void {}
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
function exercise11CacheInspector(
  cache: Map<string, CacheEntry>
): { totalEntries: number; staleEntries: number; tagDistribution: Record<string, number>; oldestEntry: string | null; estimatedSizeBytes: number } {
  // TODO: Analyze cache state
  return { totalEntries: 0, staleEntries: 0, tagDistribution: {}, oldestEntry: null, estimatedSizeBytes: 0 };
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
class Exercise12CacheWarmer {
  private warmed = new Set<string>();
  async warm(urls: string[], fetcher: (url: string) => Promise<unknown>, cache: Exercise3DataCache): Promise<{ warmed: number; failed: number }> {
    // TODO: Pre-populate cache for given URLs
    return { warmed: 0, failed: 0 };
  }
}

// ─── Exercise 13: Predict ───────────────────────────────────────────────────
function exercise13(): void {
  console.log("What happens when revalidatePath is called during a Server Action?");
  console.log("Which cache layers are affected?");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14CacheCoordinator(
  action: () => Promise<void>,
  revalidations: { paths?: string[]; tags?: string[] }
): Promise<{ actionCompleted: boolean; revalidatedPaths: string[]; revalidatedTags: string[] }> {
  // TODO: Execute action then perform revalidations
  return Promise.resolve({ actionCompleted: false, revalidatedPaths: [], revalidatedTags: [] });
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15CacheSystem {
  private requestMemo = new Map<string, Promise<unknown>>();
  private dataCache = new Map<string, CacheEntry>();
  private routeCache = new Map<string, { html: string; at: number }>();
  private clientCache = new Map<string, { payload: string; at: number }>();

  async serverFetch<T>(key: string, fetcher: () => Promise<T>, opts: { revalidate?: number; tags?: string[]; noStore?: boolean }): Promise<{ data: T; hitLayers: string[] }> {
    return { data: await fetcher(), hitLayers: [] };
  }
  revalidateTag(tag: string): { dataEntries: number; routes: number } { return { dataEntries: 0, routes: 0 }; }
  revalidatePath(path: string): boolean { return false; }
  getStats(): Record<string, number> { return {}; }
}

export {
  exercise1, Exercise2RequestMemoization, Exercise3DataCache,
  Exercise4FullRouteCache, Exercise5RouterCache, Exercise6MultiLayerCache,
  exercise7, exercise8TagSystem, exercise9CacheStrategy,
  Exercise10RevalidationScheduler, exercise11CacheInspector,
  Exercise12CacheWarmer, exercise13, exercise14CacheCoordinator,
  Exercise15CacheSystem,
};
