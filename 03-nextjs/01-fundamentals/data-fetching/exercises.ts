// ============================================================================
// data-fetching: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/01-fundamentals/data-fetching/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Types ──────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags: string[];
  revalidateAfter: number; // ms
}

interface FetchOptions {
  cache?: 'force-cache' | 'no-store';
  next?: { revalidate?: number; tags?: string[] };
}

interface FetchResult<T> {
  data: T;
  source: 'cache' | 'network';
  cached: boolean;
}

type RenderingStrategy = 'SSG' | 'SSR' | 'ISR';

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: Rendering strategy determination
//
// What rendering strategy does each page use?

function exercise1(): void {
  const pages = [
    { name: 'BlogPost', fetches: [{ url: '/api/post/1', options: {} }] },
    { name: 'Dashboard', fetches: [{ url: '/api/stats', options: { cache: 'no-store' as const } }] },
    { name: 'ProductPage', fetches: [{ url: '/api/product/1', options: { next: { revalidate: 3600 } } }] },
    { name: 'UserProfile', fetches: [{ url: '/api/user', options: { cache: 'no-store' as const } }, { url: '/api/posts', options: {} }] },
  ];

  console.log("Exercise 1 - predict rendering strategy for each page");
}

// YOUR ANSWER:
// BlogPost    → ???
// Dashboard   → ???
// ProductPage → ???
// UserProfile → ???

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
// Topic: Rendering strategy resolver
//
// Determine the rendering strategy based on fetch options used in a page.

function exercise2(
  fetches: FetchOptions[]
): { strategy: RenderingStrategy; reason: string } {
  // TODO: Determine rendering strategy
  // - Any fetch with cache: 'no-store' → SSR
  // - Any fetch with next.revalidate → ISR
  // - All fetches default (force-cache) → SSG
  return { strategy: 'SSG', reason: '' };
}

// Test:
// exercise2([{ cache: 'no-store' }]) → { strategy: 'SSR', reason: 'no-store fetch found' }
// exercise2([{ next: { revalidate: 60 } }]) → { strategy: 'ISR', reason: 'revalidate found' }
// exercise2([{}]) → { strategy: 'SSG', reason: 'all fetches use default caching' }

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
// Topic: Cache with TTL (Time-To-Live)
//
// Implement a simple cache that supports time-based revalidation.

class Exercise3Cache<T> {
  private store = new Map<string, CacheEntry<T>>();

  async get(key: string): Promise<CacheEntry<T> | null> {
    // TODO: Return cached entry if it exists and hasn't expired
    // Return null if missing or expired
    return null;
  }

  async set(key: string, data: T, options: { revalidate?: number; tags?: string[] }): Promise<void> {
    // TODO: Store data with timestamp and TTL
  }

  async revalidateByTag(tag: string): Promise<number> {
    // TODO: Invalidate all entries with the given tag
    // Return number of entries invalidated
    return 0;
  }

  async revalidateByPath(path: string): Promise<boolean> {
    // TODO: Invalidate entry with the given key/path
    return false;
  }
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
// Topic: Request deduplication
//
// Implement fetch deduplication within a single render cycle.

class Exercise4Deduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async dedupedFetch<T>(url: string, fetcher: () => Promise<T>): Promise<{ data: T; deduplicated: boolean }> {
    // TODO: If the same URL is already being fetched, return the pending result
    // Otherwise, start the fetch and store the promise
    // Clean up after resolution
    return { data: await fetcher(), deduplicated: false };
  }

  clear(): void {
    this.pending.clear();
  }
}

// Test:
// const dedup = new Exercise4Deduplicator();
// const p1 = dedup.dedupedFetch('/api/user', () => fetchUser());
// const p2 = dedup.dedupedFetch('/api/user', () => fetchUser());
// p1 and p2 should return the same promise (only 1 fetch call)

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: Revalidation timing
//
// Given ISR with revalidate: 60, what happens at each timestamp?

function exercise5(): void {
  const timeline = {
    build: 'Page generated at t=0',
    't=30s': 'Request comes in',
    't=61s': 'Request comes in',
    't=62s': 'Another request comes in',
    't=120s': 'Request comes in',
  };

  console.log("Exercise 5 - predict what each request receives");
}

// YOUR ANSWER:
// t=30s  → serves: ??? (cached/fresh?) | triggers revalidation: ???
// t=61s  → serves: ??? | triggers revalidation: ???
// t=62s  → serves: ??? | triggers revalidation: ???
// t=120s → serves: ??? | triggers revalidation: ???

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
// Topic: ISR simulator
//
// Simulate Incremental Static Regeneration behavior.

class Exercise6ISR<T> {
  private cache: { data: T; generatedAt: number } | null = null;
  private revalidating = false;
  private revalidateMs: number;
  private fetcher: () => Promise<T>;

  constructor(fetcher: () => Promise<T>, revalidateSeconds: number) {
    this.fetcher = fetcher;
    this.revalidateMs = revalidateSeconds * 1000;
  }

  async get(nowMs: number): Promise<{
    data: T;
    source: 'cache' | 'fresh';
    stale: boolean;
    revalidationTriggered: boolean;
  }> {
    // TODO: Implement stale-while-revalidate pattern
    // 1. If no cache, fetch and cache (blocking)
    // 2. If cache is fresh (within revalidate window), return cached
    // 3. If cache is stale, return cached but trigger background revalidation
    const data = await this.fetcher();
    return { data, source: 'fresh', stale: false, revalidationTriggered: false };
  }
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
// Topic: Fetch with cache options parser
//
// Implement a simulated fetch that respects Next.js cache options.

async function exercise7<T>(
  url: string,
  options: FetchOptions,
  mockNetwork: (url: string) => Promise<T>,
  cache: Map<string, { data: T; timestamp: number; revalidate: number }>
): Promise<FetchResult<T>> {
  // TODO: Implement fetch behavior based on options:
  // - cache: 'force-cache' → use cache if available, otherwise fetch
  // - cache: 'no-store' → always fetch from network
  // - next.revalidate → use cache if not expired, otherwise fetch
  const data = await mockNetwork(url);
  return { data, source: 'network', cached: false };
}

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Request deduplication scenarios
//
// How many actual HTTP requests are made?

function exercise8(): void {
  const scenario = {
    description: 'Layout and page both fetch from same API',
    code: `
      // layout.tsx
      const user = await fetch('https://api.example.com/user/1');

      // page.tsx
      const user = await fetch('https://api.example.com/user/1');

      // component-a.tsx
      const user = await fetch('https://api.example.com/user/1', { cache: 'no-store' });

      // component-b.tsx
      const data = await fetch('https://api.example.com/user/1', { method: 'POST' });
    `,
  };

  console.log("Exercise 8 - how many actual HTTP requests?");
}

// YOUR ANSWER:
// Total HTTP requests: ???
// Explain which ones are deduped and which aren't

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
// Topic: generateStaticParams simulation
//
// Simulate the static params generation and page pre-rendering.

interface StaticRoute {
  route: string;  // e.g., '/blog/[slug]'
  params: Record<string, string>[];
  dynamicParams: boolean;
}

function exercise9(
  routes: StaticRoute[],
  requestUrl: string
): {
  status: number;
  renderType: 'pre-rendered' | 'on-demand' | 'not-found';
  params?: Record<string, string>;
} {
  // TODO: Determine how a request is handled
  // - If params were in generateStaticParams → 'pre-rendered'
  // - If dynamicParams=true and params not in list → 'on-demand'
  // - If dynamicParams=false and params not in list → 'not-found' (404)
  return { status: 404, renderType: 'not-found' };
}

// Test:
// exercise9([
//   { route: '/blog/[slug]', params: [{ slug: 'hello' }, { slug: 'world' }], dynamicParams: true }
// ], '/blog/hello')
// → { status: 200, renderType: 'pre-rendered', params: { slug: 'hello' } }

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Tag-based revalidation system
//
// Implement a cache with tag-based invalidation.

class Exercise10TagCache<T> {
  private entries = new Map<string, { data: T; tags: Set<string> }>();

  set(key: string, data: T, tags: string[]): void {
    // TODO: Store entry with associated tags
  }

  get(key: string): T | undefined {
    // TODO: Return cached data or undefined
    return undefined;
  }

  revalidateTag(tag: string): string[] {
    // TODO: Invalidate all entries with this tag
    // Return list of invalidated keys
    return [];
  }

  revalidatePath(path: string): boolean {
    // TODO: Invalidate a specific entry
    return false;
  }
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Parallel vs sequential fetching
//
// Compare parallel and sequential fetch patterns.

async function exercise11Sequential(
  urls: string[],
  fetcher: (url: string) => Promise<{ data: string; time: number }>
): Promise<{ results: string[]; totalTime: number }> {
  // TODO: Fetch URLs sequentially (one after another)
  // Track total time (sum of individual times)
  return { results: [], totalTime: 0 };
}

async function exercise11Parallel(
  urls: string[],
  fetcher: (url: string) => Promise<{ data: string; time: number }>
): Promise<{ results: string[]; totalTime: number }> {
  // TODO: Fetch URLs in parallel using Promise.all
  // Track total time (max of individual times)
  return { results: [], totalTime: 0 };
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: react cache() simulation
//
// Implement the React cache() memoization function.

function exercise12Cache<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>
): (...args: Args) => Promise<R> {
  // TODO: Memoize the function based on arguments
  // Same arguments → return cached result
  // Different arguments → call function
  return fn;
}

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: Revalidation strategy calculator
//
// Given multiple fetches in a route, determine the effective revalidation.

function exercise13(
  fetches: Array<{ url: string; options: FetchOptions }>
): {
  routeStrategy: RenderingStrategy;
  effectiveRevalidate: number | null;
  isDynamic: boolean;
  reason: string;
} {
  // TODO: Calculate the effective rendering strategy
  // Rules:
  // - Any no-store → entire route is dynamic (SSR)
  // - Multiple revalidate values → use the LOWEST (most frequent)
  // - All default → SSG
  return { routeStrategy: 'SSG', effectiveRevalidate: null, isDynamic: false, reason: '' };
}

// Test:
// exercise13([
//   { url: '/api/a', options: { next: { revalidate: 60 } } },
//   { url: '/api/b', options: { next: { revalidate: 3600 } } },
// ])
// → { routeStrategy: 'ISR', effectiveRevalidate: 60, isDynamic: false, reason: 'lowest revalidate wins' }

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: unstable_cache simulation
//
// Implement a persistent cache (across requests) with tag support.

function exercise14UnstableCache<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] }
): {
  cachedFn: (...args: Args) => Promise<R>;
  revalidateTag: (tag: string) => void;
  getStats: () => { hits: number; misses: number };
} {
  // TODO: Create a persistent cache wrapper
  // - Cache results across calls (not just per-render like react cache())
  // - Support time-based revalidation
  // - Support tag-based invalidation
  const stats = { hits: 0, misses: 0 };
  return {
    cachedFn: fn,
    revalidateTag: () => {},
    getStats: () => stats,
  };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Complete data fetching layer
//
// Build a comprehensive fetch layer that combines deduplication,
// caching, revalidation, and error handling.

class Exercise15DataLayer {
  private cache = new Map<string, { data: unknown; timestamp: number; revalidate: number; tags: string[] }>();
  private pending = new Map<string, Promise<unknown>>();
  private fetchCount = 0;

  async fetch<T>(
    url: string,
    options: FetchOptions,
    networkFetcher: (url: string) => Promise<T>
  ): Promise<{ data: T; source: 'cache' | 'network' | 'deduped'; fetchCount: number }> {
    // TODO: Full implementation combining:
    // 1. Request deduplication
    // 2. Cache lookup with TTL
    // 3. Network fetch when needed
    // 4. Cache storage
    const data = await networkFetcher(url);
    this.fetchCount++;
    return { data, source: 'network', fetchCount: this.fetchCount };
  }

  revalidateTag(tag: string): number {
    // TODO: Invalidate all entries with this tag
    return 0;
  }

  revalidatePath(path: string): boolean {
    // TODO: Invalidate specific cache entry
    return false;
  }

  getStats(): { cacheSize: number; totalFetches: number } {
    return { cacheSize: this.cache.size, totalFetches: this.fetchCount };
  }
}

export {
  exercise1, exercise2, Exercise3Cache, Exercise4Deduplicator,
  exercise5, Exercise6ISR, exercise7, exercise8, exercise9,
  Exercise10TagCache, exercise11Sequential, exercise11Parallel,
  exercise12Cache, exercise13, exercise14UnstableCache, Exercise15DataLayer,
};
