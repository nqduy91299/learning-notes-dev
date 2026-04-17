// ============================================================================
// data-fetching: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/01-fundamentals/data-fetching/solutions.ts
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags: string[];
  revalidateAfter: number;
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

// ─── Exercise 1 ─────────────────────────────────────────────────────────────
// BlogPost    → SSG (default fetch caching)
// Dashboard   → SSR (cache: 'no-store')
// ProductPage → ISR (revalidate: 3600)
// UserProfile → SSR (one fetch uses no-store → whole route is SSR)

function solution1(): void {
  console.log("BlogPost    → SSG (default caching)");
  console.log("Dashboard   → SSR (no-store)");
  console.log("ProductPage → ISR (revalidate: 3600)");
  console.log("UserProfile → SSR (any no-store makes route dynamic)");
}

// ─── Exercise 2 ─────────────────────────────────────────────────────────────
function solution2(fetches: FetchOptions[]): { strategy: RenderingStrategy; reason: string } {
  const hasNoStore = fetches.some(f => f.cache === 'no-store');
  if (hasNoStore) return { strategy: 'SSR', reason: 'no-store fetch found' };

  const hasRevalidate = fetches.some(f => f.next?.revalidate !== undefined);
  if (hasRevalidate) return { strategy: 'ISR', reason: 'revalidate found' };

  return { strategy: 'SSG', reason: 'all fetches use default caching' };
}

// ─── Exercise 3 ─────────────────────────────────────────────────────────────
class Solution3Cache<T> {
  private store = new Map<string, CacheEntry<T>>();

  async get(key: string, nowMs = Date.now()): Promise<CacheEntry<T> | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.revalidateAfter > 0 && nowMs - entry.timestamp > entry.revalidateAfter) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  async set(key: string, data: T, options: { revalidate?: number; tags?: string[] }): Promise<void> {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      tags: options.tags || [],
      revalidateAfter: (options.revalidate || 0) * 1000,
    });
  }

  async revalidateByTag(tag: string): Promise<number> {
    let count = 0;
    for (const [key, entry] of this.store) {
      if (entry.tags.includes(tag)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  async revalidateByPath(path: string): Promise<boolean> {
    return this.store.delete(path);
  }
}

// ─── Exercise 4 ─────────────────────────────────────────────────────────────
class Solution4Deduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async dedupedFetch<T>(url: string, fetcher: () => Promise<T>): Promise<{ data: T; deduplicated: boolean }> {
    const existing = this.pending.get(url);
    if (existing) {
      return { data: (await existing) as T, deduplicated: true };
    }

    const promise = fetcher();
    this.pending.set(url, promise);

    try {
      const data = await promise;
      return { data, deduplicated: false };
    } finally {
      this.pending.delete(url);
    }
  }

  clear(): void {
    this.pending.clear();
  }
}

// ─── Exercise 5 ─────────────────────────────────────────────────────────────
// t=30s  → serves: cached page (within 60s window) | triggers revalidation: NO
// t=61s  → serves: cached (stale) page | triggers revalidation: YES (background)
// t=62s  → serves: new page (if revalidation completed) or stale | triggers: NO
// t=120s → serves: depends on when last revalidation happened

function solution5(): void {
  console.log("t=30s  → cached (fresh), no revalidation");
  console.log("t=61s  → cached (stale), background revalidation triggered");
  console.log("t=62s  → new page if revalidation completed, otherwise still stale");
  console.log("t=120s → depends on last successful revalidation timestamp");
}

// ─── Exercise 6 ─────────────────────────────────────────────────────────────
class Solution6ISR<T> {
  private cache: { data: T; generatedAt: number } | null = null;
  private revalidating = false;
  private revalidateMs: number;
  private fetcher: () => Promise<T>;

  constructor(fetcher: () => Promise<T>, revalidateSeconds: number) {
    this.fetcher = fetcher;
    this.revalidateMs = revalidateSeconds * 1000;
  }

  async get(nowMs: number): Promise<{
    data: T; source: 'cache' | 'fresh'; stale: boolean; revalidationTriggered: boolean;
  }> {
    if (!this.cache) {
      const data = await this.fetcher();
      this.cache = { data, generatedAt: nowMs };
      return { data, source: 'fresh', stale: false, revalidationTriggered: false };
    }

    const age = nowMs - this.cache.generatedAt;
    const isStale = age > this.revalidateMs;

    if (isStale && !this.revalidating) {
      this.revalidating = true;
      // Background revalidation
      this.fetcher().then(data => {
        this.cache = { data, generatedAt: nowMs };
        this.revalidating = false;
      });
      return { data: this.cache.data, source: 'cache', stale: true, revalidationTriggered: true };
    }

    return { data: this.cache.data, source: 'cache', stale: isStale, revalidationTriggered: false };
  }
}

// ─── Exercise 7 ─────────────────────────────────────────────────────────────
async function solution7<T>(
  url: string,
  options: FetchOptions,
  mockNetwork: (url: string) => Promise<T>,
  cache: Map<string, { data: T; timestamp: number; revalidate: number }>
): Promise<FetchResult<T>> {
  const now = Date.now();

  if (options.cache === 'no-store') {
    const data = await mockNetwork(url);
    return { data, source: 'network', cached: false };
  }

  const cached = cache.get(url);
  if (cached) {
    const revalidate = options.next?.revalidate ?? cached.revalidate;
    if (revalidate === 0 || (revalidate > 0 && now - cached.timestamp > revalidate * 1000)) {
      const data = await mockNetwork(url);
      cache.set(url, { data, timestamp: now, revalidate: revalidate });
      return { data, source: 'network', cached: false };
    }
    return { data: cached.data, source: 'cache', cached: true };
  }

  const data = await mockNetwork(url);
  const revalidate = options.next?.revalidate ?? Infinity;
  cache.set(url, { data, timestamp: now, revalidate });
  return { data, source: 'network', cached: false };
}

// ─── Exercise 8 ─────────────────────────────────────────────────────────────
// Total HTTP requests: 3
// - layout.tsx fetch → Request #1 (GET, default cache)
// - page.tsx fetch → DEDUPED with #1 (same URL + same options)
// - component-a.tsx → Request #2 (different options: no-store)
// - component-b.tsx → Request #3 (POST requests are never deduped)

function solution8(): void {
  console.log("Total HTTP requests: 3");
  console.log("layout.tsx  → Request #1");
  console.log("page.tsx    → Deduped with #1 (same URL + options)");
  console.log("component-a → Request #2 (different cache option)");
  console.log("component-b → Request #3 (POST is never deduped)");
}

// ─── Exercise 9 ─────────────────────────────────────────────────────────────
interface StaticRoute {
  route: string;
  params: Record<string, string>[];
  dynamicParams: boolean;
}

function solution9(routes: StaticRoute[], requestUrl: string): {
  status: number; renderType: 'pre-rendered' | 'on-demand' | 'not-found'; params?: Record<string, string>;
} {
  for (const route of routes) {
    const patternParts = route.route.split('/').filter(Boolean);
    const urlParts = requestUrl.split('/').filter(Boolean);

    if (patternParts.length !== urlParts.length) continue;

    const extractedParams: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith('[') && patternParts[i].endsWith(']')) {
        extractedParams[patternParts[i].slice(1, -1)] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        matched = false;
        break;
      }
    }

    if (!matched) continue;

    const isPreRendered = route.params.some(p =>
      Object.keys(extractedParams).every(k => p[k] === extractedParams[k])
    );

    if (isPreRendered) {
      return { status: 200, renderType: 'pre-rendered', params: extractedParams };
    }
    if (route.dynamicParams) {
      return { status: 200, renderType: 'on-demand', params: extractedParams };
    }
    return { status: 404, renderType: 'not-found' };
  }

  return { status: 404, renderType: 'not-found' };
}

// ─── Exercise 10 ────────────────────────────────────────────────────────────
class Solution10TagCache<T> {
  private entries = new Map<string, { data: T; tags: Set<string> }>();

  set(key: string, data: T, tags: string[]): void {
    this.entries.set(key, { data, tags: new Set(tags) });
  }

  get(key: string): T | undefined {
    return this.entries.get(key)?.data;
  }

  revalidateTag(tag: string): string[] {
    const invalidated: string[] = [];
    for (const [key, entry] of this.entries) {
      if (entry.tags.has(tag)) {
        this.entries.delete(key);
        invalidated.push(key);
      }
    }
    return invalidated;
  }

  revalidatePath(path: string): boolean {
    return this.entries.delete(path);
  }
}

// ─── Exercise 11 ────────────────────────────────────────────────────────────
async function solution11Sequential(
  urls: string[],
  fetcher: (url: string) => Promise<{ data: string; time: number }>
): Promise<{ results: string[]; totalTime: number }> {
  const results: string[] = [];
  let totalTime = 0;
  for (const url of urls) {
    const result = await fetcher(url);
    results.push(result.data);
    totalTime += result.time;
  }
  return { results, totalTime };
}

async function solution11Parallel(
  urls: string[],
  fetcher: (url: string) => Promise<{ data: string; time: number }>
): Promise<{ results: string[]; totalTime: number }> {
  const fetchResults = await Promise.all(urls.map(fetcher));
  const results = fetchResults.map(r => r.data);
  const totalTime = Math.max(...fetchResults.map(r => r.time));
  return { results, totalTime };
}

// ─── Exercise 12 ────────────────────────────────────────────────────────────
function solution12Cache<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>
): (...args: Args) => Promise<R> {
  const cache = new Map<string, Promise<R>>();

  return (...args: Args): Promise<R> => {
    const key = JSON.stringify(args);
    const existing = cache.get(key);
    if (existing) return existing;

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// ─── Exercise 13 ────────────────────────────────────────────────────────────
function solution13(
  fetches: Array<{ url: string; options: FetchOptions }>
): {
  routeStrategy: RenderingStrategy; effectiveRevalidate: number | null;
  isDynamic: boolean; reason: string;
} {
  const hasNoStore = fetches.some(f => f.options.cache === 'no-store');
  if (hasNoStore) {
    return { routeStrategy: 'SSR', effectiveRevalidate: null, isDynamic: true, reason: 'no-store makes route dynamic' };
  }

  const revalidateValues = fetches
    .map(f => f.options.next?.revalidate)
    .filter((v): v is number => v !== undefined);

  if (revalidateValues.length > 0) {
    const min = Math.min(...revalidateValues);
    return { routeStrategy: 'ISR', effectiveRevalidate: min, isDynamic: false, reason: 'lowest revalidate wins' };
  }

  return { routeStrategy: 'SSG', effectiveRevalidate: null, isDynamic: false, reason: 'all default caching' };
}

// ─── Exercise 14 ────────────────────────────────────────────────────────────
function solution14UnstableCache<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] }
): {
  cachedFn: (...args: Args) => Promise<R>;
  revalidateTag: (tag: string) => void;
  getStats: () => { hits: number; misses: number };
} {
  const cache = new Map<string, { data: R; timestamp: number }>();
  const tags = new Set(options.tags || []);
  const stats = { hits: 0, misses: 0 };
  const revalidateMs = (options.revalidate || Infinity) * 1000;

  const cachedFn = async (...args: Args): Promise<R> => {
    const key = [...keyParts, JSON.stringify(args)].join(':');
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now - cached.timestamp < revalidateMs) {
      stats.hits++;
      return cached.data;
    }

    stats.misses++;
    const data = await fn(...args);
    cache.set(key, { data, timestamp: now });
    return data;
  };

  const revalidateTag = (tag: string) => {
    if (tags.has(tag)) {
      cache.clear();
    }
  };

  return { cachedFn, revalidateTag, getStats: () => ({ ...stats }) };
}

// ─── Exercise 15 ────────────────────────────────────────────────────────────
class Solution15DataLayer {
  private cache = new Map<string, { data: unknown; timestamp: number; revalidate: number; tags: string[] }>();
  private pending = new Map<string, Promise<unknown>>();
  private fetchCount = 0;

  async fetch<T>(
    url: string, options: FetchOptions, networkFetcher: (url: string) => Promise<T>
  ): Promise<{ data: T; source: 'cache' | 'network' | 'deduped'; fetchCount: number }> {
    const now = Date.now();

    // No-store: always network
    if (options.cache === 'no-store') {
      const pending = this.pending.get(url);
      if (pending) {
        return { data: (await pending) as T, source: 'deduped', fetchCount: this.fetchCount };
      }
      const promise = networkFetcher(url);
      this.pending.set(url, promise);
      try {
        const data = await promise;
        this.fetchCount++;
        return { data, source: 'network', fetchCount: this.fetchCount };
      } finally {
        this.pending.delete(url);
      }
    }

    // Check cache
    const cached = this.cache.get(url);
    if (cached) {
      const revalidate = options.next?.revalidate ?? Infinity;
      if (revalidate === Infinity || now - cached.timestamp < revalidate * 1000) {
        return { data: cached.data as T, source: 'cache', fetchCount: this.fetchCount };
      }
    }

    // Dedupe pending requests
    const pending = this.pending.get(url);
    if (pending) {
      return { data: (await pending) as T, source: 'deduped', fetchCount: this.fetchCount };
    }

    // Network fetch
    const promise = networkFetcher(url);
    this.pending.set(url, promise);
    try {
      const data = await promise;
      this.fetchCount++;
      const revalidate = options.next?.revalidate ?? Infinity;
      this.cache.set(url, { data, timestamp: now, revalidate, tags: options.next?.tags || [] });
      return { data, source: 'network', fetchCount: this.fetchCount };
    } finally {
      this.pending.delete(url);
    }
  }

  revalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache) {
      if (entry.tags.includes(tag)) { this.cache.delete(key); count++; }
    }
    return count;
  }

  revalidatePath(path: string): boolean { return this.cache.delete(path); }
  getStats() { return { cacheSize: this.cache.size, totalFetches: this.fetchCount }; }
}

// ─── Runner ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Exercise 1: Rendering Strategies ===");
  solution1();

  console.log("\n=== Exercise 2: Strategy Resolver ===");
  console.log(solution2([{ cache: 'no-store' }]));
  console.log(solution2([{ next: { revalidate: 60 } }]));
  console.log(solution2([{}]));

  console.log("\n=== Exercise 3: Cache with TTL ===");
  const cache3 = new Solution3Cache<string>();
  await cache3.set('/api/data', 'hello', { revalidate: 1, tags: ['data'] });
  console.log("Immediate get:", await cache3.get('/api/data'));
  console.log("Revalidate by tag:", await cache3.revalidateByTag('data'));
  console.log("After revalidation:", await cache3.get('/api/data'));

  console.log("\n=== Exercise 4: Deduplication ===");
  const dedup = new Solution4Deduplicator();
  let callCount = 0;
  const fetcher = () => new Promise<string>(r => { callCount++; setTimeout(() => r('data'), 10); });
  const [r1, r2] = await Promise.all([
    dedup.dedupedFetch('/api', fetcher),
    dedup.dedupedFetch('/api', fetcher),
  ]);
  console.log("Result 1:", r1, "Result 2:", r2, "Actual calls:", callCount);

  console.log("\n=== Exercise 5: ISR Timeline ===");
  solution5();

  console.log("\n=== Exercise 6: ISR Simulator ===");
  let isrCalls = 0;
  const isr = new Solution6ISR(() => Promise.resolve(`data-${++isrCalls}`), 1);
  console.log("t=0:", await isr.get(0));
  console.log("t=500:", await isr.get(500));
  console.log("t=1500:", await isr.get(1500));

  console.log("\n=== Exercise 7: Fetch with Options ===");
  const cache7 = new Map<string, { data: string; timestamp: number; revalidate: number }>();
  console.log(await solution7('/api', { cache: 'no-store' }, async () => 'fresh', cache7));
  console.log(await solution7('/api2', {}, async () => 'cached', cache7));
  console.log(await solution7('/api2', {}, async () => 'should-not-see', cache7));

  console.log("\n=== Exercise 8: Dedup Scenarios ===");
  solution8();

  console.log("\n=== Exercise 9: generateStaticParams ===");
  console.log(solution9([
    { route: '/blog/[slug]', params: [{ slug: 'hello' }, { slug: 'world' }], dynamicParams: true }
  ], '/blog/hello'));
  console.log(solution9([
    { route: '/blog/[slug]', params: [{ slug: 'hello' }], dynamicParams: false }
  ], '/blog/unknown'));

  console.log("\n=== Exercise 10: Tag Cache ===");
  const tc = new Solution10TagCache<string>();
  tc.set('/products/1', 'Widget', ['products']);
  tc.set('/products/2', 'Gadget', ['products']);
  tc.set('/users/1', 'Alice', ['users']);
  console.log("Before:", tc.get('/products/1'), tc.get('/users/1'));
  console.log("Revalidated:", tc.revalidateTag('products'));
  console.log("After:", tc.get('/products/1'), tc.get('/users/1'));

  console.log("\n=== Exercise 11: Sequential vs Parallel ===");
  const mockFetch = async (url: string) => ({ data: url, time: 100 });
  console.log("Sequential:", await solution11Sequential(['/a', '/b', '/c'], mockFetch));
  console.log("Parallel:", await solution11Parallel(['/a', '/b', '/c'], mockFetch));

  console.log("\n=== Exercise 12: React cache() ===");
  let cacheCalls = 0;
  const cachedFn = solution12Cache(async (id: string) => { cacheCalls++; return `user-${id}`; });
  console.log(await cachedFn('1'), await cachedFn('1'), await cachedFn('2'));
  console.log("Actual calls:", cacheCalls);

  console.log("\n=== Exercise 13: Route Strategy ===");
  console.log(solution13([
    { url: '/api/a', options: { next: { revalidate: 60 } } },
    { url: '/api/b', options: { next: { revalidate: 3600 } } },
  ]));

  console.log("\n=== Exercise 14: unstable_cache ===");
  let ucCalls = 0;
  const uc = solution14UnstableCache(
    async (id: string) => { ucCalls++; return `user-${id}`; },
    ['users'], { revalidate: 60, tags: ['users'] }
  );
  console.log(await uc.cachedFn('1'), await uc.cachedFn('1'));
  console.log("Stats:", uc.getStats(), "Actual calls:", ucCalls);

  console.log("\n=== Exercise 15: Data Layer ===");
  const dl = new Solution15DataLayer();
  let dlCalls = 0;
  const dlFetcher = async (url: string) => { dlCalls++; return `response-${url}`; };
  console.log(await dl.fetch('/api', { next: { revalidate: 60, tags: ['api'] } }, dlFetcher));
  console.log(await dl.fetch('/api', {}, dlFetcher));  // cached
  console.log("Stats:", dl.getStats(), "Network calls:", dlCalls);
}

main().catch(console.error);
