// ============================================================
// Caching & Optimization — Solutions
// ============================================================
// Run: npx tsx 09-cicd/04-advanced/02-caching-optimization/solutions.ts
// ============================================================

// Solution 1
function generateCacheKey(parts: Array<{type: 'literal' | 'hash'; value: string}>): string {
  return parts.map(p => {
    if (p.type === 'literal') return p.value;
    let h = 0; for (const c of p.value) h = (h + c.charCodeAt(0)) & 0xffff;
    return h.toString(16);
  }).join('-');
}

// Solution 2
class CacheStore {
  private store = new Map<string, {value: string; expiresAt: number; savedAt: Date}>();
  private stats = { hits: 0, misses: 0, evictions: 0 };

  set(key: string, value: string, ttlMs: number) { this.store.set(key, { value, expiresAt: Date.now() + ttlMs, savedAt: new Date() }); }
  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) { this.stats.misses++; return null; }
    this.stats.hits++; return entry.value;
  }
  getWithPrefix(prefix: string): string | null {
    let best: {value: string; savedAt: Date} | null = null;
    for (const [k, v] of this.store) {
      if (k.startsWith(prefix) && Date.now() <= v.expiresAt) {
        if (!best || v.savedAt > best.savedAt) best = v;
      }
    }
    if (best) { this.stats.hits++; return best.value; }
    this.stats.misses++; return null;
  }
  evict(key: string) { if (this.store.delete(key)) { this.stats.evictions++; return true; } return false; }
  getStats() { return { size: this.store.size, ...this.stats }; }
}

// Solution 3
function predictCacheHit(currentKey: string, restoreKeys: string[], cache: Map<string, {key: string; savedAt: Date}>): { hit: boolean; matchedKey: string | null; matchType: 'exact' | 'prefix' | 'miss' } {
  if (cache.has(currentKey)) return { hit: true, matchedKey: currentKey, matchType: 'exact' };
  for (const rk of restoreKeys) {
    const matches = [...cache.keys()].filter(k => k.startsWith(rk)).sort((a, b) => cache.get(b)!.savedAt.getTime() - cache.get(a)!.savedAt.getTime());
    if (matches.length > 0) return { hit: true, matchedKey: matches[0], matchType: 'prefix' };
  }
  return { hit: false, matchedKey: null, matchType: 'miss' };
}

// Solution 4
function balanceShards(tests: Array<{name: string; durationMs: number}>, shardCount: number) {
  const shards: Array<{shard: number; tests: string[]; estimatedDuration: number}> = Array.from({ length: shardCount }, (_, i) => ({ shard: i + 1, tests: [], estimatedDuration: 0 }));
  const sorted = [...tests].sort((a, b) => b.durationMs - a.durationMs);
  for (const test of sorted) {
    const min = shards.reduce((a, b) => a.estimatedDuration <= b.estimatedDuration ? a : b);
    min.tests.push(test.name); min.estimatedDuration += test.durationMs;
  }
  return shards;
}

// Solution 5
async function executeParallel<T>(tasks: Array<{name: string; fn: () => Promise<T>}>, maxConcurrency: number) {
  const results: Array<{name: string; result: T; durationMs: number}> = [];
  let idx = 0;
  const worker = async () => {
    while (idx < tasks.length) {
      const i = idx++;
      const start = Date.now();
      const result = await tasks[i].fn();
      results.push({ name: tasks[i].name, result, durationMs: Date.now() - start });
    }
  };
  await Promise.all(Array.from({ length: Math.min(maxConcurrency, tasks.length) }, () => worker()));
  return results;
}

// Solution 6
function getIncrementalFiles(allFiles: Array<{path: string; hash: string}>, previousHashes: Record<string, string>) {
  const changed: string[] = [], unchanged: string[] = [], added: string[] = [];
  const currentPaths = new Set<string>();
  for (const f of allFiles) {
    currentPaths.add(f.path);
    if (!(f.path in previousHashes)) added.push(f.path);
    else if (previousHashes[f.path] !== f.hash) changed.push(f.path);
    else unchanged.push(f.path);
  }
  const removed = Object.keys(previousHashes).filter(p => !currentPaths.has(p));
  return { changed, unchanged, added, removed };
}

// Solution 7
function analyzePipelineMetrics(runs: Array<{duration: number; cacheHit: boolean; date: Date}>) {
  const durations = runs.map(r => r.duration);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const cacheHitRate = runs.filter(r => r.cacheHit).length / runs.length;
  const mid = Math.floor(runs.length / 2);
  const firstHalf = durations.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondHalf = durations.slice(mid).reduce((a, b) => a + b, 0) / (durations.length - mid);
  const diff = (secondHalf - firstHalf) / firstHalf;
  const trend = diff < -0.1 ? 'improving' : diff > 0.1 ? 'degrading' : 'stable';
  return { avgDuration: avg, p95Duration: p95, cacheHitRate, trend: trend as 'improving' | 'degrading' | 'stable' };
}

// Solution 8
function shouldInvalidateCache(cacheKey: string, lockfileHash: string, lastCacheHash: string, cacheAge: number, maxAge: number) {
  if (lockfileHash !== lastCacheHash) return { invalidate: true, reason: 'Lockfile changed' };
  if (cacheAge >= maxAge) return { invalidate: true, reason: `Cache age ${cacheAge}d exceeds max ${maxAge}d` };
  return { invalidate: false, reason: 'Cache is valid' };
}

// Solution 9
function calculateCICost(jobs: Array<{name: string; durationMinutes: number; runner: string}>, rates: Record<string, number>) {
  const breakdown = jobs.map(j => ({ name: j.name, cost: j.durationMinutes * (rates[j.runner] || 0) }));
  return { totalCost: breakdown.reduce((a, b) => a + b.cost, 0), breakdown };
}

// Solution 10
function optimizeInstall(strategy: string, cacheAvailable: boolean, lockfileChanged: boolean) {
  if (strategy === 'cache-restore' && cacheAvailable && !lockfileChanged) return { commands: ['# Restored from cache'], estimatedTime: 2 };
  if (strategy === 'frozen-lockfile') return { commands: ['npm ci --frozen-lockfile'], estimatedTime: 30 };
  return { commands: ['npm ci'], estimatedTime: lockfileChanged ? 45 : 30 };
}

// Solution 11
function compressCacheEntries(entries: Array<{key: string; size: number; lastAccessed: Date}>, maxSize: number) {
  const sorted = [...entries].sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  const kept: string[] = []; const evicted: string[] = []; let total = 0;
  for (const e of sorted) {
    if (total + e.size <= maxSize) { kept.push(e.key); total += e.size; }
    else evicted.push(e.key);
  }
  return { kept, evicted };
}

// Solution 12
function findBottlenecks(stages: Array<{name: string; durationMs: number; dependsOn: string[]}>) {
  const endTimes = new Map<string, number>();
  const getEnd = (name: string): number => {
    if (endTimes.has(name)) return endTimes.get(name)!;
    const stage = stages.find(s => s.name === name)!;
    const start = stage.dependsOn.length > 0 ? Math.max(...stage.dependsOn.map(d => getEnd(d))) : 0;
    const end = start + stage.durationMs;
    endTimes.set(name, end);
    return end;
  };
  stages.forEach(s => getEnd(s.name));
  return stages.map(s => ({ stage: s.name, impact: s.durationMs })).sort((a, b) => b.impact - a.impact);
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n02-caching-optimization Solutions\n");

  await test("Ex1: Cache key gen", () => {
    const k = generateCacheKey([{ type: 'literal', value: 'npm' }, { type: 'hash', value: 'lock-content' }]);
    assert(k.startsWith('npm-'), "literal prefix");
  });
  await test("Ex2: Cache store", () => {
    const c = new CacheStore(); c.set("k1", "v1", 10000);
    assert(c.get("k1") === "v1", "hit"); assert(c.get("k2") === null, "miss");
  });
  await test("Ex3: Cache predictor", () => {
    const cache = new Map([["npm-abc", { key: "npm-abc", savedAt: new Date() }]]);
    assert(predictCacheHit("npm-abc", [], cache).matchType === "exact", "exact");
    assert(predictCacheHit("npm-xyz", ["npm-"], cache).matchType === "prefix", "prefix");
  });
  await test("Ex4: Shard balancer", () => {
    const s = balanceShards([{ name: "a", durationMs: 100 }, { name: "b", durationMs: 200 }, { name: "c", durationMs: 150 }], 2);
    assert(s.length === 2, "2 shards"); assert(Math.abs(s[0].estimatedDuration - s[1].estimatedDuration) <= 200, "balanced");
  });
  await test("Ex5: Parallel executor", async () => {
    const r = await executeParallel([
      { name: "a", fn: async () => { await new Promise(r => setTimeout(r, 5)); return 1; } },
      { name: "b", fn: async () => 2 },
    ], 2);
    assert(r.length === 2, "both complete");
  });
  await test("Ex6: Incremental files", () => {
    const r = getIncrementalFiles([{ path: "a.ts", hash: "new" }, { path: "b.ts", hash: "same" }, { path: "c.ts", hash: "x" }], { "a.ts": "old", "b.ts": "same", "d.ts": "y" });
    assert(r.changed.includes("a.ts") && r.unchanged.includes("b.ts") && r.added.includes("c.ts") && r.removed.includes("d.ts"), "categorized");
  });
  await test("Ex7: Pipeline metrics", () => {
    const m = analyzePipelineMetrics([
      { duration: 100, cacheHit: true, date: new Date("2024-01-01") },
      { duration: 120, cacheHit: false, date: new Date("2024-01-02") },
      { duration: 80, cacheHit: true, date: new Date("2024-01-03") },
      { duration: 90, cacheHit: true, date: new Date("2024-01-04") },
    ]);
    assert(m.cacheHitRate === 0.75, `rate ${m.cacheHitRate}`);
  });
  await test("Ex8: Cache invalidation", () => {
    assert(shouldInvalidateCache("k", "new", "old", 1, 30).invalidate, "lockfile changed");
    assert(!shouldInvalidateCache("k", "same", "same", 1, 30).invalidate, "valid");
  });
  await test("Ex9: CI cost", () => {
    const r = calculateCICost([{ name: "test", durationMinutes: 10, runner: "ubuntu" }], { ubuntu: 0.008 });
    assert(Math.abs(r.totalCost - 0.08) < 0.001, `cost ${r.totalCost}`);
  });
  await test("Ex10: Install optimizer", () => {
    const r = optimizeInstall("cache-restore", true, false);
    assert(r.estimatedTime === 2, "fast restore");
  });
  await test("Ex11: Cache compressor", () => {
    const r = compressCacheEntries([
      { key: "old", size: 100, lastAccessed: new Date("2024-01-01") },
      { key: "new", size: 100, lastAccessed: new Date("2024-06-01") },
    ], 100);
    assert(r.kept.includes("new") && r.evicted.includes("old"), "evicted old");
  });
  await test("Ex12: Bottlenecks", () => {
    const r = findBottlenecks([
      { name: "install", durationMs: 1000, dependsOn: [] },
      { name: "test", durationMs: 5000, dependsOn: ["install"] },
      { name: "lint", durationMs: 500, dependsOn: ["install"] },
    ]);
    assert(r[0].stage === "test", "test is bottleneck");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
