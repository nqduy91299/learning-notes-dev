/**
 * DNS & Domains — Solutions
 * 12 exercises: 4 predict, 2 fix, 6 implement
 *
 * Run: npx tsx solutions.ts
 * Config: ES2022, strict, ESNext modules
 */

// ============================================================================
// TYPES
// ============================================================================

type RecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";

interface DnsRecord {
  domain: string;
  type: RecordType;
  value: string;
  ttl: number;
  priority?: number;
}

interface CacheEntry {
  record: DnsRecord;
  expiresAt: number;
}

interface ParsedDomain {
  subdomain: string;
  domain: string;
  tld: string;
  full: string;
}

interface CdnEdge {
  location: string;
  ip: string;
  lat: number;
  lng: number;
}

interface ResolutionStep {
  level: "browser-cache" | "os-cache" | "resolver-cache" | "root" | "tld" | "authoritative";
  result: string | null;
}

interface ResourceHint {
  url: string;
  critical: boolean;
  sameOrigin: boolean;
}

interface ResolverState {
  browserCache: Map<string, { ip: string; expiresAt: number }>;
  osCache: Map<string, { ip: string; expiresAt: number }>;
  records: DnsRecord[];
}

// ============================================================================
// Helpers
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ============================================================================
// SOLUTION 1: Predict Resolution Order
// ============================================================================

function solution1_predictResolution(): {
  scenarioA: string[];
  scenarioB: string[];
  scenarioC: string[];
} {
  return {
    scenarioA: ["browser-cache-miss", "os-cache-miss", "resolver", "root", "tld", "authoritative"],
    scenarioB: ["browser-cache-hit"],
    scenarioC: ["browser-cache-miss", "os-cache-hit"],
  };
}

// ============================================================================
// SOLUTION 2: Predict Record Type
// ============================================================================

function solution2_predictRecordType(): Record<string, RecordType> {
  return {
    A: "A",
    B: "CNAME",
    C: "TXT",
    D: "MX",
    E: "AAAA",
    F: "NS",
  };
}

// ============================================================================
// SOLUTION 3: Predict TTL Behavior
// ============================================================================

function solution3_predictTtlBehavior(): Record<string, string> {
  return {
    A: "1.1.1.1",
    B: "2.2.2.2",
    C: "2.2.2.2",
    D: "~60 seconds",
  };
}

// ============================================================================
// SOLUTION 4: Predict Optimization
// ============================================================================

function solution4_predictOptimization(): Record<string, "dns-prefetch" | "preconnect" | "none"> {
  return {
    A: "preconnect",
    B: "dns-prefetch",
    C: "none",
    D: "preconnect",
    E: "dns-prefetch",
  };
}

// ============================================================================
// SOLUTION 5: Fix Domain Parser
// ============================================================================

function solution5_fixDomainParser(hostname: string): ParsedDomain {
  const parts = hostname.split(".");
  const tld = parts[parts.length - 1]; // FIX: last element
  const domain = parts[parts.length - 2]; // FIX: second-to-last
  const subdomain = parts.slice(0, parts.length - 2).join("."); // FIX: everything before

  return { subdomain, domain, tld, full: hostname };
}

// ============================================================================
// SOLUTION 6: Fix DNS Cache
// ============================================================================

function solution6_fixDnsCache(): {
  lookup: (domain: string, currentTime: number) => string | null;
  store: (domain: string, ip: string, ttl: number, currentTime: number) => void;
} {
  const cache = new Map<string, CacheEntry>();

  return {
    lookup(domain: string, currentTime: number): string | null {
      const entry = cache.get(domain);
      if (!entry) return null;

      // FIX: Return value when NOT expired, null when expired
      if (entry.expiresAt > currentTime) {
        return entry.record.value;
      }
      return null;
    },

    store(domain: string, ip: string, ttl: number, currentTime: number): void {
      cache.set(domain, {
        record: { domain, type: "A", value: ip, ttl },
        expiresAt: currentTime + ttl,
      });
    },
  };
}

// ============================================================================
// SOLUTION 7: Domain Name Parser
// ============================================================================

function solution7_parseDomain(hostname: string): ParsedDomain {
  const parts = hostname.split(".");

  if (parts.length < 2) {
    return { subdomain: "", domain: hostname, tld: "", full: hostname };
  }

  const tld = parts[parts.length - 1];
  const domain = parts[parts.length - 2];
  const subdomain = parts.slice(0, parts.length - 2).join(".");

  return { subdomain, domain, tld, full: hostname };
}

// ============================================================================
// SOLUTION 8: DNS Cache
// ============================================================================

function solution8_createDnsCache(): {
  lookup: (domain: string, currentTime: number) => string | null;
  store: (record: DnsRecord, currentTime: number) => void;
  clear: () => void;
  size: () => number;
} {
  const cache = new Map<string, CacheEntry>();

  return {
    lookup(domain: string, currentTime: number): string | null {
      const entry = cache.get(domain);
      if (!entry) return null;
      if (entry.expiresAt <= currentTime) {
        cache.delete(domain);
        return null;
      }
      return entry.record.value;
    },

    store(record: DnsRecord, currentTime: number): void {
      cache.set(record.domain, {
        record,
        expiresAt: currentTime + record.ttl,
      });
    },

    clear(): void {
      cache.clear();
    },

    size(): number {
      return cache.size;
    },
  };
}

// ============================================================================
// SOLUTION 9: DNS Resolution Simulator
// ============================================================================

function solution9_createDnsResolver(
  records: DnsRecord[],
  cnameLimit?: number
): {
  resolve: (domain: string, type: RecordType) => DnsRecord | null;
} {
  const limit = cnameLimit ?? 5;

  return {
    resolve(domain: string, type: RecordType): DnsRecord | null {
      let currentDomain = domain;
      let depth = 0;

      while (depth < limit) {
        // Look for exact match
        const exact = records.find(
          (r) => r.domain === currentDomain && r.type === type
        );
        if (exact) return exact;

        // Look for CNAME
        const cname = records.find(
          (r) => r.domain === currentDomain && r.type === "CNAME"
        );
        if (!cname) return null;

        currentDomain = cname.value;
        depth++;
      }

      return null;
    },
  };
}

// ============================================================================
// SOLUTION 10: CDN Routing Simulator
// ============================================================================

function solution10_createCdnRouter(edges: CdnEdge[]): {
  route: (userLat: number, userLng: number) => CdnEdge;
} {
  return {
    route(userLat: number, userLng: number): CdnEdge {
      let nearest = edges[0];
      let minDist = Infinity;

      for (const edge of edges) {
        const dist = Math.sqrt(
          (edge.lat - userLat) ** 2 + (edge.lng - userLng) ** 2
        );
        if (dist < minDist) {
          minDist = dist;
          nearest = edge;
        }
      }

      return nearest;
    },
  };
}

// ============================================================================
// SOLUTION 11: Preconnect/Prefetch Advisor
// ============================================================================

function solution11_generateHints(resources: ResourceHint[]): string[] {
  const hints: string[] = [];

  for (const resource of resources) {
    if (resource.sameOrigin) continue;

    const url = new URL(resource.url);
    const origin = url.origin;

    if (resource.critical) {
      hints.push(`<link rel="preconnect" href="${origin}" crossorigin>`);
    } else {
      hints.push(`<link rel="dns-prefetch" href="${origin}">`);
    }
  }

  return hints;
}

// ============================================================================
// SOLUTION 12: Full Resolution Simulation
// ============================================================================

function solution12_simulateResolution(
  domain: string,
  currentTime: number,
  state: ResolverState
): { ip: string | null; steps: ResolutionStep[] } {
  const steps: ResolutionStep[] = [];

  // Step 1: Browser cache
  const browserEntry = state.browserCache.get(domain);
  if (browserEntry && browserEntry.expiresAt > currentTime) {
    steps.push({ level: "browser-cache", result: browserEntry.ip });
    return { ip: browserEntry.ip, steps };
  }
  steps.push({ level: "browser-cache", result: null });

  // Step 2: OS cache
  const osEntry = state.osCache.get(domain);
  if (osEntry && osEntry.expiresAt > currentTime) {
    steps.push({ level: "os-cache", result: osEntry.ip });
    return { ip: osEntry.ip, steps };
  }
  steps.push({ level: "os-cache", result: null });

  // Step 3: Resolver → root → TLD → authoritative
  steps.push({ level: "resolver-cache", result: null });
  steps.push({ level: "root", result: null });
  steps.push({ level: "tld", result: null });

  const record = state.records.find(
    (r) => r.domain === domain && r.type === "A"
  );
  if (record) {
    steps.push({ level: "authoritative", result: record.value });
    return { ip: record.value, steps };
  }

  steps.push({ level: "authoritative", result: null });
  return { ip: null, steps };
}

// ============================================================================
// TEST RUNNER
// ============================================================================

console.log("=== DNS & Domains — Solutions & Tests ===");

// Exercise 1
section("Exercise 1: Predict Resolution Order");
const s1 = solution1_predictResolution();
assert(s1.scenarioA.length === 6, "Full lookup has 6 steps");
assert(s1.scenarioA[0] === "browser-cache-miss", "Starts with browser cache miss");
assert(s1.scenarioB.length === 1, "Cached = 1 step");
assert(s1.scenarioB[0] === "browser-cache-hit", "Browser cache hit");
assert(s1.scenarioC[0] === "browser-cache-miss", "Browser miss");
assert(s1.scenarioC[1] === "os-cache-hit", "OS cache hit");

// Exercise 2
section("Exercise 2: Predict Record Type");
const s2 = solution2_predictRecordType();
assert(s2.A === "A", "IP → A record");
assert(s2.B === "CNAME", "Alias → CNAME");
assert(s2.C === "TXT", "Verification → TXT");
assert(s2.D === "MX", "Email → MX");
assert(s2.E === "AAAA", "IPv6 → AAAA");
assert(s2.F === "NS", "Nameserver → NS");

// Exercise 3
section("Exercise 3: Predict TTL");
const s3 = solution3_predictTtlBehavior();
assert(s3.A === "1.1.1.1", "Within TTL = old IP");
assert(s3.B === "2.2.2.2", "Past TTL = new IP");
assert(s3.C === "2.2.2.2", "New user = new IP");
assert(s3.D === "~60 seconds", "Low TTL = fast propagation");

// Exercise 4
section("Exercise 4: Predict Optimization");
const s4 = solution4_predictOptimization();
assert(s4.A === "preconnect", "Critical fonts = preconnect");
assert(s4.B === "dns-prefetch", "Analytics = dns-prefetch");
assert(s4.C === "none", "Same origin = none");
assert(s4.D === "preconnect", "Critical CDN = preconnect");
assert(s4.E === "dns-prefetch", "Low priority = dns-prefetch");

// Exercise 5
section("Exercise 5: Fix Domain Parser");
const p1 = solution5_fixDomainParser("www.example.com");
assert(p1.tld === "com", "tld = com");
assert(p1.domain === "example", "domain = example");
assert(p1.subdomain === "www", "subdomain = www");

const p2 = solution5_fixDomainParser("example.com");
assert(p2.subdomain === "", "no subdomain");
assert(p2.domain === "example", "domain = example");

const p3 = solution5_fixDomainParser("api.staging.example.com");
assert(p3.subdomain === "api.staging", "multi-level subdomain");

// Exercise 6
section("Exercise 6: Fix DNS Cache");
const dns6 = solution6_fixDnsCache();
dns6.store("example.com", "1.2.3.4", 3600, 1000);
assert(dns6.lookup("example.com", 1500) === "1.2.3.4", "Within TTL returns IP");
assert(dns6.lookup("example.com", 5000) === null, "Past TTL returns null");
assert(dns6.lookup("unknown.com", 1000) === null, "Unknown returns null");

// Exercise 7
section("Exercise 7: Domain Parser");
const d1 = solution7_parseDomain("www.example.com");
assert(d1.subdomain === "www", "subdomain = www");
assert(d1.domain === "example", "domain = example");
assert(d1.tld === "com", "tld = com");

const d2 = solution7_parseDomain("example.com");
assert(d2.subdomain === "", "no subdomain");
assert(d2.domain === "example", "domain = example");

const d3 = solution7_parseDomain("api.staging.example.com");
assert(d3.subdomain === "api.staging", "multi subdomain");
assert(d3.domain === "example", "domain = example");

// Exercise 8
section("Exercise 8: DNS Cache");
const cache8 = solution8_createDnsCache();
cache8.store({ domain: "example.com", type: "A", value: "1.2.3.4", ttl: 300 }, 1000);
assert(cache8.lookup("example.com", 1100) === "1.2.3.4", "Cache hit");
assert(cache8.lookup("example.com", 1400) === null, "Cache expired");
cache8.store({ domain: "test.com", type: "A", value: "5.6.7.8", ttl: 600 }, 1000);
assert(cache8.size() === 1, "Size after expired entry removed");
cache8.clear();
assert(cache8.lookup("test.com", 1000) === null, "Cleared");

// Exercise 9
section("Exercise 9: DNS Resolver");
const resolver9 = solution9_createDnsResolver([
  { domain: "example.com", type: "A", value: "1.2.3.4", ttl: 300 },
  { domain: "www.example.com", type: "CNAME", value: "example.com", ttl: 300 },
  { domain: "blog.example.com", type: "CNAME", value: "my-blog.netlify.app", ttl: 300 },
  { domain: "my-blog.netlify.app", type: "A", value: "5.6.7.8", ttl: 300 },
]);
assert(resolver9.resolve("example.com", "A")?.value === "1.2.3.4", "Direct A lookup");
assert(resolver9.resolve("www.example.com", "A")?.value === "1.2.3.4", "CNAME → A");
assert(resolver9.resolve("blog.example.com", "A")?.value === "5.6.7.8", "CNAME chain");
assert(resolver9.resolve("unknown.com", "A") === null, "Not found");

// Exercise 10
section("Exercise 10: CDN Router");
const cdn10 = solution10_createCdnRouter([
  { location: "Tokyo", ip: "1.1.1.1", lat: 35.68, lng: 139.69 },
  { location: "London", ip: "2.2.2.2", lat: 51.51, lng: -0.13 },
  { location: "New York", ip: "3.3.3.3", lat: 40.71, lng: -74.01 },
]);
assert(cdn10.route(34.05, 135.0).location === "Tokyo", "Osaka → Tokyo");
assert(cdn10.route(48.85, 2.35).location === "London", "Paris → London");
assert(cdn10.route(43.65, -79.38).location === "New York", "Toronto → NY");

// Exercise 11
section("Exercise 11: Resource Hints");
const hints11 = solution11_generateHints([
  { url: "https://fonts.googleapis.com/css2?family=Inter", critical: true, sameOrigin: false },
  { url: "https://cdn.analytics.com/tracker.js", critical: false, sameOrigin: false },
  { url: "/api/data", critical: true, sameOrigin: true },
]);
assert(hints11.length === 2, "2 hints generated");
assert(hints11[0].includes("preconnect"), "Critical = preconnect");
assert(hints11[0].includes("fonts.googleapis.com"), "Correct origin");
assert(hints11[1].includes("dns-prefetch"), "Non-critical = dns-prefetch");

// Exercise 12
section("Exercise 12: Full Resolution");
const state12: ResolverState = {
  browserCache: new Map([["cached.com", { ip: "1.1.1.1", expiresAt: 2000 }]]),
  osCache: new Map([["os-cached.com", { ip: "2.2.2.2", expiresAt: 2000 }]]),
  records: [{ domain: "example.com", type: "A", value: "3.3.3.3", ttl: 300 }],
};

const r1 = solution12_simulateResolution("cached.com", 1000, state12);
assert(r1.ip === "1.1.1.1", "Browser cache hit");
assert(r1.steps.length === 1, "1 step for browser cache");

const r2 = solution12_simulateResolution("os-cached.com", 1000, state12);
assert(r2.ip === "2.2.2.2", "OS cache hit");
assert(r2.steps.length === 2, "2 steps for OS cache");

const r3 = solution12_simulateResolution("example.com", 1000, state12);
assert(r3.ip === "3.3.3.3", "Full resolution");
assert(r3.steps.length === 6, "6 steps for full resolution");

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests ===`);
if (failed > 0) process.exit(1);
