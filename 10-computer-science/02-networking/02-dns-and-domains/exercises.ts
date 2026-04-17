/**
 * DNS & Domains — Exercises
 * 12 exercises: 4 predict, 2 fix, 6 implement
 *
 * Run: npx tsx exercises.ts
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
  priority?: number; // MX records
}

interface CacheEntry {
  record: DnsRecord;
  expiresAt: number; // timestamp
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
  result: string | null; // IP if found, null if not
}

// ============================================================================
// EXERCISE 1 (Predict): DNS Resolution Order
// Given a fresh browser, predict the resolution steps.
// ============================================================================

function exercise1_predictResolution(): {
  scenarioA: string[];
  scenarioB: string[];
  scenarioC: string[];
} {
  // Scenario A: First visit to example.com (nothing cached anywhere)
  // List the DNS resolution steps in order.
  //
  // Scenario B: Second visit to example.com within TTL (browser cached it)
  // List the steps.
  //
  // Scenario C: Browser cache expired but OS cache still has it
  // List the steps.

  return {
    scenarioA: [], // TODO: e.g., ["browser-cache-miss", "os-cache-miss", "resolver", "root", "tld", "authoritative"]
    scenarioB: [], // TODO
    scenarioC: [], // TODO
  };
}

// Tests:
// scenarioA should include all steps: browser-cache-miss, os-cache-miss, resolver, root, tld, authoritative
// scenarioB should be just: browser-cache-hit
// scenarioC should be: browser-cache-miss, os-cache-hit

// ============================================================================
// EXERCISE 2 (Predict): Which Record Type?
// For each scenario, predict the correct DNS record type.
// ============================================================================

function exercise2_predictRecordType(): Record<string, RecordType> {
  // A: Point example.com to IP address 93.184.216.34
  // B: Make www.example.com an alias for example.com
  // C: Verify domain ownership for Google Search Console
  // D: Set up email for the domain
  // E: Point example.com to an IPv6 address
  // F: Delegate DNS to a different nameserver

  return {
    A: "A",    // TODO: verify
    B: "A",    // TODO
    C: "A",    // TODO
    D: "A",    // TODO
    E: "A",    // TODO
    F: "A",    // TODO
  };
}

// Tests:
// A = "A", B = "CNAME", C = "TXT", D = "MX", E = "AAAA", F = "NS"

// ============================================================================
// EXERCISE 3 (Predict): TTL Impact
// Predict the behavior when TTL expires.
// ============================================================================

function exercise3_predictTtlBehavior(): Record<string, string> {
  // You change the A record for example.com from 1.1.1.1 to 2.2.2.2.
  // The old record had TTL=3600 (1 hour).
  //
  // A: A user who visited 30 minutes ago visits again. What IP do they get?
  // B: A user who visited 2 hours ago visits again. What IP do they get?
  // C: A brand new user visits. What IP do they get?
  // D: You set TTL=60 before the change. How long until most users see the new IP?

  return {
    A: "", // TODO
    B: "", // TODO
    C: "", // TODO
    D: "", // TODO
  };
}

// Tests:
// A: "1.1.1.1" (still within TTL, cached)
// B: "2.2.2.2" (TTL expired, fresh lookup gets new IP)
// C: "2.2.2.2" (no cache, fresh lookup)
// D: "~60 seconds" (low TTL means quick expiration)

// ============================================================================
// EXERCISE 4 (Predict): Preconnect vs dns-prefetch
// Predict which optimization technique to use.
// ============================================================================

function exercise4_predictOptimization(): Record<string, "dns-prefetch" | "preconnect" | "none"> {
  // A: Google Fonts (critical, used above the fold)
  // B: Analytics script that loads after page is interactive
  // C: Same-origin API endpoint (/api/data)
  // D: CDN serving hero image
  // E: Social media share widget loaded on scroll

  return {
    A: "none", // TODO
    B: "none", // TODO
    C: "none", // TODO
    D: "none", // TODO
    E: "none", // TODO
  };
}

// Tests:
// A: "preconnect" (critical resource, need full connection early)
// B: "dns-prefetch" (not critical, just resolve DNS ahead)
// C: "none" (same-origin, already connected)
// D: "preconnect" (critical asset)
// E: "dns-prefetch" (low priority, loaded later)

// ============================================================================
// EXERCISE 5 (Fix): Broken Domain Parser
// ============================================================================

function exercise5_fixDomainParser(hostname: string): ParsedDomain {
  // This parser is broken. Fix the bugs.

  const parts = hostname.split(".");

  // BUG 1: Wrong index calculations
  const tld = parts[0]; // Should be last element
  const domain = parts[1]; // Should be second-to-last
  const subdomain = parts.slice(2).join("."); // Should be everything before domain

  return {
    subdomain,
    domain,
    tld,
    full: hostname,
  };
}

// Tests:
// const p1 = exercise5_fixDomainParser("www.example.com");
// assert(p1.tld === "com");
// assert(p1.domain === "example");
// assert(p1.subdomain === "www");
//
// const p2 = exercise5_fixDomainParser("example.com");
// assert(p2.tld === "com");
// assert(p2.domain === "example");
// assert(p2.subdomain === "");
//
// const p3 = exercise5_fixDomainParser("api.staging.example.com");
// assert(p3.tld === "com");
// assert(p3.domain === "example");
// assert(p3.subdomain === "api.staging");

// ============================================================================
// EXERCISE 6 (Fix): Broken DNS Cache Lookup
// ============================================================================

function exercise6_fixDnsCache(): {
  lookup: (domain: string, currentTime: number) => string | null;
  store: (domain: string, ip: string, ttl: number, currentTime: number) => void;
} {
  const cache = new Map<string, CacheEntry>();

  return {
    lookup(domain: string, currentTime: number): string | null {
      const entry = cache.get(domain);
      if (!entry) return null;

      // BUG: Should check if entry is expired (expiresAt < currentTime means expired)
      if (entry.expiresAt > currentTime) {
        return null; // Wrong: returning null when NOT expired
      }
      return entry.record.value; // Wrong: returning value when expired
    },

    store(domain: string, ip: string, ttl: number, currentTime: number): void {
      cache.set(domain, {
        record: { domain, type: "A", value: ip, ttl },
        expiresAt: currentTime + ttl, // This is correct
      });
    },
  };
}

// Tests:
// const dns = exercise6_fixDnsCache();
// dns.store("example.com", "1.2.3.4", 3600, 1000);
// assert(dns.lookup("example.com", 1500) === "1.2.3.4"); // Within TTL
// assert(dns.lookup("example.com", 5000) === null); // Past TTL (1000 + 3600 = 4600)
// assert(dns.lookup("unknown.com", 1000) === null); // Not in cache

// ============================================================================
// EXERCISE 7 (Implement): Domain Name Parser
// ============================================================================

function exercise7_parseDomain(hostname: string): ParsedDomain {
  // Parse a hostname into its components.
  //
  // "www.example.com" => { subdomain: "www", domain: "example", tld: "com", full: "www.example.com" }
  // "example.com"     => { subdomain: "", domain: "example", tld: "com", full: "example.com" }
  // "a.b.example.co.uk" => treat "co.uk" as TLD (BONUS: handle two-part TLDs)
  //
  // For simplicity, assume single-part TLDs unless you want the bonus.

  // TODO: Implement
  return { subdomain: "", domain: "", tld: "", full: hostname };
}

// Tests:
// const d1 = exercise7_parseDomain("www.example.com");
// assert(d1.subdomain === "www");
// assert(d1.domain === "example");
// assert(d1.tld === "com");
//
// const d2 = exercise7_parseDomain("example.com");
// assert(d2.subdomain === "");
// assert(d2.domain === "example");
//
// const d3 = exercise7_parseDomain("api.staging.example.com");
// assert(d3.subdomain === "api.staging");
// assert(d3.domain === "example");

// ============================================================================
// EXERCISE 8 (Implement): DNS Cache
// ============================================================================

function exercise8_createDnsCache(): {
  lookup: (domain: string, currentTime: number) => string | null;
  store: (record: DnsRecord, currentTime: number) => void;
  clear: () => void;
  size: () => number;
} {
  // Implement a DNS cache that:
  // 1. Stores DNS records with TTL-based expiration
  // 2. Returns cached IP if TTL has not expired
  // 3. Returns null if expired or not found
  // 4. Can be cleared entirely
  // 5. Reports its current size (non-expired entries)

  // TODO: Implement
  return {
    lookup: (_domain, _currentTime) => null,
    store: (_record, _currentTime) => {},
    clear: () => {},
    size: () => 0,
  };
}

// Tests:
// const cache = exercise8_createDnsCache();
// cache.store({ domain: "example.com", type: "A", value: "1.2.3.4", ttl: 300 }, 1000);
// assert(cache.lookup("example.com", 1100) === "1.2.3.4");
// assert(cache.lookup("example.com", 1400) === null); // 1000 + 300 = 1300, expired
// assert(cache.size() === 0); // Expired entry doesn't count
// cache.store({ domain: "test.com", type: "A", value: "5.6.7.8", ttl: 600 }, 1000);
// assert(cache.size() === 1); // At time of store, not expired yet... but size needs a time param
// cache.clear();
// assert(cache.lookup("test.com", 1000) === null);

// ============================================================================
// EXERCISE 9 (Implement): DNS Resolution Simulator
// ============================================================================

function exercise9_createDnsResolver(
  records: DnsRecord[],
  cnameLimit?: number
): {
  resolve: (domain: string, type: RecordType) => DnsRecord | null;
} {
  // Implement a DNS resolver that:
  // 1. Looks up records by domain + type
  // 2. Follows CNAME chains (if looking up A record and find CNAME, follow it)
  // 3. Has a CNAME chain limit (default 5) to prevent infinite loops
  // 4. Returns null if not found

  // TODO: Implement
  const _limit = cnameLimit ?? 5;
  void _limit;
  void records;
  return {
    resolve: (_domain, _type) => null,
  };
}

// Tests:
// const resolver = exercise9_createDnsResolver([
//   { domain: "example.com", type: "A", value: "1.2.3.4", ttl: 300 },
//   { domain: "www.example.com", type: "CNAME", value: "example.com", ttl: 300 },
//   { domain: "blog.example.com", type: "CNAME", value: "my-blog.netlify.app", ttl: 300 },
//   { domain: "my-blog.netlify.app", type: "A", value: "5.6.7.8", ttl: 300 },
// ]);
// assert(resolver.resolve("example.com", "A")?.value === "1.2.3.4");
// assert(resolver.resolve("www.example.com", "A")?.value === "1.2.3.4"); // Follows CNAME
// assert(resolver.resolve("blog.example.com", "A")?.value === "5.6.7.8"); // Follows CNAME chain
// assert(resolver.resolve("unknown.com", "A") === null);

// ============================================================================
// EXERCISE 10 (Implement): CDN Routing Simulator
// ============================================================================

function exercise10_createCdnRouter(edges: CdnEdge[]): {
  route: (userLat: number, userLng: number) => CdnEdge;
} {
  // Implement a simple CDN geographic router that:
  // 1. Takes user coordinates (lat, lng)
  // 2. Finds the nearest edge server using straight-line distance
  // 3. Returns the nearest edge
  //
  // Use simple Euclidean distance (no need for Haversine formula).

  // TODO: Implement
  void edges;
  return {
    route: (_lat, _lng) => edges[0],
  };
}

// Tests:
// const cdn = exercise10_createCdnRouter([
//   { location: "Tokyo", ip: "1.1.1.1", lat: 35.68, lng: 139.69 },
//   { location: "London", ip: "2.2.2.2", lat: 51.51, lng: -0.13 },
//   { location: "New York", ip: "3.3.3.3", lat: 40.71, lng: -74.01 },
// ]);
// assert(cdn.route(34.05, 135.0).location === "Tokyo");  // Osaka → nearest is Tokyo
// assert(cdn.route(48.85, 2.35).location === "London");   // Paris → nearest is London
// assert(cdn.route(43.65, -79.38).location === "New York"); // Toronto → nearest is NY

// ============================================================================
// EXERCISE 11 (Implement): Preconnect/Prefetch Advisor
// ============================================================================

interface ResourceHint {
  url: string;
  critical: boolean;
  sameOrigin: boolean;
}

function exercise11_generateHints(resources: ResourceHint[]): string[] {
  // Generate HTML link tags for dns-prefetch and preconnect based on rules:
  // 1. Same-origin resources: no hint needed (skip)
  // 2. Critical cross-origin: generate <link rel="preconnect" href="..." crossorigin>
  // 3. Non-critical cross-origin: generate <link rel="dns-prefetch" href="...">
  //
  // Extract the origin (scheme + host) from the URL.

  // TODO: Implement
  void resources;
  return [];
}

// Tests:
// const hints = exercise11_generateHints([
//   { url: "https://fonts.googleapis.com/css2?family=Inter", critical: true, sameOrigin: false },
//   { url: "https://cdn.analytics.com/tracker.js", critical: false, sameOrigin: false },
//   { url: "/api/data", critical: true, sameOrigin: true },
// ]);
// assert(hints.length === 2);
// assert(hints[0] === '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>');
// assert(hints[1] === '<link rel="dns-prefetch" href="https://cdn.analytics.com">');

// ============================================================================
// EXERCISE 12 (Implement): Full Resolution Simulation
// ============================================================================

interface ResolverState {
  browserCache: Map<string, { ip: string; expiresAt: number }>;
  osCache: Map<string, { ip: string; expiresAt: number }>;
  records: DnsRecord[];
}

function exercise12_simulateResolution(
  domain: string,
  currentTime: number,
  state: ResolverState
): { ip: string | null; steps: ResolutionStep[] } {
  // Simulate the full DNS resolution process:
  // 1. Check browser cache → if hit, return
  // 2. Check OS cache → if hit, return
  // 3. Simulate resolver → root → TLD → authoritative lookup
  //    (For this simulation, just look up in records array)
  // 4. Return the IP and all steps taken
  //
  // Each step should be recorded with its level and result.

  // TODO: Implement
  void domain;
  void currentTime;
  void state;
  return { ip: null, steps: [] };
}

// Tests:
// const state: ResolverState = {
//   browserCache: new Map([["cached.com", { ip: "1.1.1.1", expiresAt: 2000 }]]),
//   osCache: new Map([["os-cached.com", { ip: "2.2.2.2", expiresAt: 2000 }]]),
//   records: [{ domain: "example.com", type: "A", value: "3.3.3.3", ttl: 300 }],
// };
//
// const r1 = exercise12_simulateResolution("cached.com", 1000, state);
// assert(r1.ip === "1.1.1.1");
// assert(r1.steps.length === 1);
// assert(r1.steps[0].level === "browser-cache");
//
// const r2 = exercise12_simulateResolution("os-cached.com", 1000, state);
// assert(r2.ip === "2.2.2.2");
// assert(r2.steps.length === 2); // browser-cache miss, os-cache hit
//
// const r3 = exercise12_simulateResolution("example.com", 1000, state);
// assert(r3.ip === "3.3.3.3");
// assert(r3.steps.length === 6); // browser, os, resolver, root, tld, authoritative

// ============================================================================
// RUNNER
// ============================================================================

console.log("=== DNS & Domains Exercises ===\n");

console.log("Exercise 1 (Predict - Resolution):", exercise1_predictResolution());
console.log("Exercise 2 (Predict - Record Types):", exercise2_predictRecordType());
console.log("Exercise 3 (Predict - TTL):", exercise3_predictTtlBehavior());
console.log("Exercise 4 (Predict - Optimization):", exercise4_predictOptimization());
console.log("Exercise 5 (Fix - Domain Parser):", exercise5_fixDomainParser("www.example.com"));
console.log("Exercise 6 (Fix - DNS Cache):", (() => {
  const dns = exercise6_fixDnsCache();
  dns.store("test.com", "1.2.3.4", 3600, 1000);
  return dns.lookup("test.com", 1500);
})());
console.log("Exercise 7 (Implement - Parse Domain):", exercise7_parseDomain("www.example.com"));
console.log("Exercise 8 (Implement - DNS Cache):", exercise8_createDnsCache());
console.log("Exercise 9 (Implement - Resolver):", exercise9_createDnsResolver([]));
console.log("Exercise 10 (Implement - CDN Router):", exercise10_createCdnRouter([
  { location: "Tokyo", ip: "1.1.1.1", lat: 35.68, lng: 139.69 },
]));
console.log("Exercise 11 (Implement - Hints):", exercise11_generateHints([]));
console.log("Exercise 12 (Implement - Full Resolution):", exercise12_simulateResolution("test.com", 0, {
  browserCache: new Map(),
  osCache: new Map(),
  records: [],
}));

console.log("\nDone! Implement the TODOs and check against solutions.ts");
