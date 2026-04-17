/**
 * CORS & Caching — Solutions
 * 18 exercises: 6 predict, 4 fix, 8 implement
 *
 * Run: npx tsx solutions.ts
 * Config: ES2022, strict, ESNext modules
 */

// ============================================================================
// TYPES
// ============================================================================

interface CorsRequest {
  origin: string;
  method: string;
  headers: string[];
  credentials: boolean;
}

interface CorsConfig {
  allowedOrigins: string[] | "*";
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
  exposedHeaders?: string[];
}

interface CorsResponse {
  allowed: boolean;
  headers: Record<string, string>;
  preflight: boolean;
}

interface CacheControlDirectives {
  maxAge?: number;
  sMaxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  public?: boolean;
  private?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
  staleWhileRevalidate?: number;
}

interface CacheEntry {
  url: string;
  response: string;
  etag?: string;
  cachedAt: number;
  maxAge: number;
}

type CacheStrategy = "cache-first" | "network-first" | "stale-while-revalidate" | "network-only" | "cache-only";

interface CacheResult {
  source: "cache" | "network";
  data: string;
  stale: boolean;
}

interface Origin {
  scheme: string;
  host: string;
  port: number;
}

interface CacheDecision {
  shouldCache: boolean;
  cacheControl: string;
  reason: string;
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
// SOLUTION 1: Predict CORS
// ============================================================================

function solution1_predictCors(): Record<string, boolean> {
  return {
    A: false,
    B: true,
    C: true,
    D: true,
    E: false,
    F: true,
  };
}

// ============================================================================
// SOLUTION 2: Predict Preflight
// ============================================================================

function solution2_predictPreflight(): Record<string, boolean> {
  return {
    A: false,
    B: false,
    C: true,
    D: true,
    E: true,
    F: true,
  };
}

// ============================================================================
// SOLUTION 3: Predict Allowed
// ============================================================================

function solution3_predictAllowed(): Record<string, boolean> {
  return {
    A: true,
    B: false,
    C: false,
    D: false,
  };
}

// ============================================================================
// SOLUTION 4: Predict Cache Hit
// ============================================================================

function solution4_predictCacheHit(): Record<string, "hit" | "miss" | "revalidate"> {
  return {
    A: "hit",
    B: "revalidate",
    C: "revalidate",
    D: "miss",
  };
}

// ============================================================================
// SOLUTION 5: Predict Cache-Control
// ============================================================================

function solution5_predictCacheControl(): Record<string, string> {
  return {
    A: "public, max-age=31536000, immutable",
    B: "no-cache",
    C: "private, no-cache",
    D: "public, max-age=3600",
    E: "no-store",
  };
}

// ============================================================================
// SOLUTION 6: Predict SWR
// ============================================================================

function solution6_predictSwr(): Record<string, { served: "fresh" | "stale" | "network"; instant: boolean }> {
  return {
    A: { served: "fresh", instant: true },
    B: { served: "stale", instant: true },
    C: { served: "network", instant: false },
  };
}

// ============================================================================
// SOLUTION 7: Fix CORS Config
// ============================================================================

function solution7_fixCorsConfig(): CorsConfig {
  return {
    allowedOrigins: ["https://myapp.com"], // FIX: specific origin
    allowedMethods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"], // FIX: added Authorization
    allowCredentials: true,
    maxAge: 86400, // FIX: cache preflight for 24 hours
  };
}

// ============================================================================
// SOLUTION 8: Fix Cache-Control Parser
// ============================================================================

function solution8_fixCacheControlParser(header: string): CacheControlDirectives {
  const result: CacheControlDirectives = {};
  const parts = header.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    const [key, value] = trimmed.split("=");

    switch (key) {
      case "max-age":
        result.maxAge = parseInt(value, 10); // FIX: added radix
        break;
      case "s-maxage":
        result.sMaxAge = parseInt(value, 10); // FIX: sMaxAge not maxAge
        break;
      case "no-cache":
        result.noCache = true; // FIX: swapped back
        break;
      case "no-store":
        result.noStore = true; // FIX: swapped back
        break;
      case "public":
        result.public = true;
        break;
      case "private":
        result.private = true;
        break;
      case "must-revalidate":
        result.mustRevalidate = true;
        break;
      case "immutable":
        result.immutable = true;
        break;
      case "stale-while-revalidate":
        result.staleWhileRevalidate = parseInt(value, 10);
        break;
    }
  }

  return result;
}

// ============================================================================
// SOLUTION 9: Fix ETag Match
// ============================================================================

function solution9_fixEtagMatch(
  requestEtag: string,
  responseEtag: string
): boolean {
  // Strong comparison: exact match
  // Weak comparison: both must be weak AND opaque values match
  return requestEtag === responseEtag;
}

// ============================================================================
// SOLUTION 10: Fix Origin Check
// ============================================================================

function solution10_fixOriginCheck(
  requestOrigin: string,
  allowedOrigins: string[]
): boolean {
  // FIX: Use exact match instead of includes()
  return allowedOrigins.includes(requestOrigin);
}

// ============================================================================
// SOLUTION 11: Cache-Control Parser
// ============================================================================

function solution11_parseCacheControl(header: string): CacheControlDirectives {
  const result: CacheControlDirectives = {};
  const parts = header.split(",").map((p) => p.trim());

  for (const part of parts) {
    const eqIndex = part.indexOf("=");
    const key = eqIndex === -1 ? part : part.substring(0, eqIndex);
    const value = eqIndex === -1 ? undefined : part.substring(eqIndex + 1);

    switch (key) {
      case "max-age":
        result.maxAge = parseInt(value!, 10);
        break;
      case "s-maxage":
        result.sMaxAge = parseInt(value!, 10);
        break;
      case "no-cache":
        result.noCache = true;
        break;
      case "no-store":
        result.noStore = true;
        break;
      case "public":
        result.public = true;
        break;
      case "private":
        result.private = true;
        break;
      case "must-revalidate":
        result.mustRevalidate = true;
        break;
      case "immutable":
        result.immutable = true;
        break;
      case "stale-while-revalidate":
        result.staleWhileRevalidate = parseInt(value!, 10);
        break;
    }
  }

  return result;
}

// ============================================================================
// SOLUTION 12: ETag Matcher
// ============================================================================

function solution12_matchEtag(
  ifNoneMatch: string,
  currentEtag: string
): { match: boolean; statusCode: 200 | 304 } {
  if (ifNoneMatch.trim() === "*") {
    return { match: true, statusCode: 304 };
  }

  const etags = ifNoneMatch.split(",").map((e) => e.trim());
  const match = etags.some((etag) => etag === currentEtag);

  return { match, statusCode: match ? 304 : 200 };
}

// ============================================================================
// SOLUTION 13: CORS Validator
// ============================================================================

function solution13_validateCors(
  request: CorsRequest,
  config: CorsConfig
): CorsResponse {
  // Check origin
  let originAllowed = false;
  if (config.allowedOrigins === "*") {
    originAllowed = true;
  } else {
    originAllowed = config.allowedOrigins.includes(request.origin);
  }

  if (!originAllowed) {
    return { allowed: false, headers: {}, preflight: false };
  }

  // Determine if preflight needed
  const simpleMethods = ["GET", "HEAD", "POST"];
  const simpleHeaders = ["accept", "accept-language", "content-language", "content-type"];
  const needsPreflight =
    !simpleMethods.includes(request.method) ||
    request.headers.some((h) => !simpleHeaders.includes(h.toLowerCase()));

  // Check method allowed
  if (!config.allowedMethods.includes(request.method)) {
    return { allowed: false, headers: {}, preflight: needsPreflight };
  }

  // Check headers allowed
  const headersAllowed = request.headers.every((h) =>
    config.allowedHeaders.some((ah) => ah.toLowerCase() === h.toLowerCase())
  );
  if (!headersAllowed && request.headers.length > 0) {
    return { allowed: false, headers: {}, preflight: needsPreflight };
  }

  // Build response headers
  const headers: Record<string, string> = {};

  if (config.allowCredentials && config.allowedOrigins === "*") {
    // Can't use * with credentials — use specific origin
    headers["Access-Control-Allow-Origin"] = request.origin;
  } else if (config.allowedOrigins === "*") {
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    headers["Access-Control-Allow-Origin"] = request.origin;
  }

  if (config.allowCredentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  if (needsPreflight) {
    headers["Access-Control-Allow-Methods"] = config.allowedMethods.join(", ");
    headers["Access-Control-Allow-Headers"] = config.allowedHeaders.join(", ");
    headers["Access-Control-Max-Age"] = String(config.maxAge);
  }

  if (config.exposedHeaders && config.exposedHeaders.length > 0) {
    headers["Access-Control-Expose-Headers"] = config.exposedHeaders.join(", ");
  }

  return { allowed: true, headers, preflight: needsPreflight };
}

// ============================================================================
// SOLUTION 14: Caching Proxy
// ============================================================================

function solution14_createCachingProxy(): {
  request: (url: string, currentTime: number, networkResponse: () => { data: string; etag: string }) => CacheResult;
  getCache: () => Map<string, CacheEntry>;
  configure: (url: string, strategy: CacheStrategy, maxAge: number) => void;
} {
  const cache = new Map<string, CacheEntry>();
  const configs = new Map<string, { strategy: CacheStrategy; maxAge: number }>();

  return {
    request(url, currentTime, networkFn) {
      const config = configs.get(url) ?? { strategy: "network-only" as CacheStrategy, maxAge: 0 };
      const cached = cache.get(url);
      const isFresh = cached ? (currentTime - cached.cachedAt) < cached.maxAge : false;

      switch (config.strategy) {
        case "cache-first": {
          if (cached && isFresh) {
            return { source: "cache", data: cached.response, stale: false };
          }
          const resp = networkFn();
          cache.set(url, { url, response: resp.data, etag: resp.etag, cachedAt: currentTime, maxAge: config.maxAge });
          return { source: "network", data: resp.data, stale: false };
        }

        case "network-first": {
          try {
            const resp = networkFn();
            cache.set(url, { url, response: resp.data, etag: resp.etag, cachedAt: currentTime, maxAge: config.maxAge });
            return { source: "network", data: resp.data, stale: false };
          } catch {
            if (cached) return { source: "cache", data: cached.response, stale: true };
            throw new Error("No cache and network failed");
          }
        }

        case "stale-while-revalidate": {
          if (cached) {
            // Return cached (possibly stale), revalidate in background
            const resp = networkFn();
            cache.set(url, { url, response: resp.data, etag: resp.etag, cachedAt: currentTime, maxAge: config.maxAge });
            return { source: "cache", data: cached.response, stale: !isFresh };
          }
          const resp = networkFn();
          cache.set(url, { url, response: resp.data, etag: resp.etag, cachedAt: currentTime, maxAge: config.maxAge });
          return { source: "network", data: resp.data, stale: false };
        }

        case "cache-only": {
          if (cached) return { source: "cache", data: cached.response, stale: !isFresh };
          throw new Error("Not in cache");
        }

        case "network-only":
        default: {
          const resp = networkFn();
          return { source: "network", data: resp.data, stale: false };
        }
      }
    },

    getCache: () => cache,

    configure(url, strategy, maxAge) {
      configs.set(url, { strategy, maxAge });
    },
  };
}

// ============================================================================
// SOLUTION 15: Origin Parser & Comparator
// ============================================================================

function solution15_parseOrigin(url: string): Origin {
  const parsed = new URL(url);
  const scheme = parsed.protocol.replace(":", "");
  const host = parsed.hostname;
  const defaultPort = scheme === "https" ? 443 : 80;
  const port = parsed.port ? parseInt(parsed.port, 10) : defaultPort;

  return { scheme, host, port };
}

function solution15_isSameOrigin(url1: string, url2: string): boolean {
  const o1 = solution15_parseOrigin(url1);
  const o2 = solution15_parseOrigin(url2);
  return o1.scheme === o2.scheme && o1.host === o2.host && o1.port === o2.port;
}

// ============================================================================
// SOLUTION 16: Cache Busting URL Generator
// ============================================================================

function solution16_cacheBustUrl(
  url: string,
  contentHash: string,
  strategy: "filename" | "query"
): string {
  if (strategy === "query") {
    return `${url}?v=${contentHash}`;
  }

  const lastDotIndex = url.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex < url.lastIndexOf("/")) {
    return `${url}.${contentHash}`;
  }

  return `${url.substring(0, lastDotIndex)}.${contentHash}${url.substring(lastDotIndex)}`;
}

// ============================================================================
// SOLUTION 17: Preflight Request Detector
// ============================================================================

function solution17_needsPreflight(
  method: string,
  headers: Record<string, string>,
  contentType?: string
): boolean {
  const simpleMethods = ["GET", "HEAD", "POST"];
  if (!simpleMethods.includes(method.toUpperCase())) return true;

  const safeHeaders = new Set(["accept", "accept-language", "content-language", "content-type"]);
  for (const key of Object.keys(headers)) {
    if (!safeHeaders.has(key.toLowerCase())) return true;
  }

  if (contentType) {
    const simpleContentTypes = [
      "application/x-www-form-urlencoded",
      "multipart/form-data",
      "text/plain",
    ];
    if (!simpleContentTypes.includes(contentType.toLowerCase())) return true;
  }

  return false;
}

// ============================================================================
// SOLUTION 18: Cache Decision Engine
// ============================================================================

function solution18_decideCacheStrategy(resource: {
  type: "static-hashed" | "html" | "api-public" | "api-private" | "sensitive";
  maxAgeSeconds?: number;
}): CacheDecision {
  switch (resource.type) {
    case "static-hashed":
      return {
        shouldCache: true,
        cacheControl: "public, max-age=31536000, immutable",
        reason: "Hashed filename ensures cache invalidation on content change",
      };
    case "html":
      return {
        shouldCache: true,
        cacheControl: "no-cache",
        reason: "Always revalidate to get latest version pointing to current assets",
      };
    case "api-public":
      return {
        shouldCache: true,
        cacheControl: `public, max-age=${resource.maxAgeSeconds ?? 60}`,
        reason: "Public data can be cached by CDN and browser",
      };
    case "api-private":
      return {
        shouldCache: true,
        cacheControl: "private, no-cache",
        reason: "User-specific data, browser only, always revalidate",
      };
    case "sensitive":
      return {
        shouldCache: false,
        cacheControl: "no-store",
        reason: "Sensitive data must never be stored in any cache",
      };
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

console.log("=== CORS & Caching — Solutions & Tests ===");

// Exercise 1
section("Exercise 1: Predict CORS");
const s1 = solution1_predictCors();
assert(s1.A === false, "Same origin");
assert(s1.B === true, "Subdomain = cross-origin");
assert(s1.C === true, "Different scheme");
assert(s1.D === true, "Different port");
assert(s1.E === false, "Relative = same origin");
assert(s1.F === true, "Different host");

// Exercise 2
section("Exercise 2: Predict Preflight");
const s2 = solution2_predictPreflight();
assert(s2.A === false, "Simple GET");
assert(s2.B === false, "POST text/plain = simple");
assert(s2.C === true, "application/json triggers preflight");
assert(s2.D === true, "PUT triggers preflight");
assert(s2.E === true, "Authorization triggers preflight");
assert(s2.F === true, "DELETE triggers preflight");

// Exercise 3
section("Exercise 3: Predict Allowed");
const s3 = solution3_predictAllowed();
assert(s3.A === true, "Exact origin match");
assert(s3.B === false, "Different origin");
assert(s3.C === false, "Different scheme");
assert(s3.D === false, "Different port");

// Exercise 4
section("Exercise 4: Predict Cache");
const s4 = solution4_predictCacheHit();
assert(s4.A === "hit", "Within max-age");
assert(s4.B === "revalidate", "Expired with ETag");
assert(s4.C === "revalidate", "no-cache always revalidates");
assert(s4.D === "miss", "no-store never cached");

// Exercise 5
section("Exercise 5: Predict Cache-Control");
const s5 = solution5_predictCacheControl();
assert(s5.A === "public, max-age=31536000, immutable", "Hashed static");
assert(s5.B === "no-cache", "HTML");
assert(s5.C === "private, no-cache", "Private API");
assert(s5.D === "public, max-age=3600", "Public API");
assert(s5.E === "no-store", "Sensitive");

// Exercise 6
section("Exercise 6: Predict SWR");
const s6 = solution6_predictSwr();
assert(s6.A.served === "fresh" && s6.A.instant === true, "Fresh within max-age");
assert(s6.B.served === "stale" && s6.B.instant === true, "Stale in SWR window");
assert(s6.C.served === "network" && s6.C.instant === false, "Past SWR window");

// Exercise 7
section("Exercise 7: Fix CORS Config");
const s7 = solution7_fixCorsConfig();
assert(Array.isArray(s7.allowedOrigins), "Not wildcard");
assert((s7.allowedOrigins as string[]).includes("https://myapp.com"), "Specific origin");
assert(s7.allowedHeaders.includes("Authorization"), "Authorization allowed");
assert(s7.maxAge > 0, "Preflight cached");

// Exercise 8
section("Exercise 8: Fix Cache-Control Parser");
const cc8a = solution8_fixCacheControlParser("public, max-age=3600, stale-while-revalidate=86400");
assert(cc8a.public === true, "public parsed");
assert(cc8a.maxAge === 3600, "max-age parsed");
assert(cc8a.staleWhileRevalidate === 86400, "SWR parsed");

const cc8b = solution8_fixCacheControlParser("no-cache, no-store");
assert(cc8b.noCache === true, "no-cache correct");
assert(cc8b.noStore === true, "no-store correct");

// Exercise 9
section("Exercise 9: Fix ETag Match");
assert(solution9_fixEtagMatch('"abc"', '"abc"') === true, "Strong match");
assert(solution9_fixEtagMatch('"abc"', '"def"') === false, "Different ETags");
assert(solution9_fixEtagMatch('W/"abc"', 'W/"abc"') === true, "Weak match");
assert(solution9_fixEtagMatch('W/"abc"', '"abc"') === false, "Weak vs strong");

// Exercise 10
section("Exercise 10: Fix Origin Check");
assert(solution10_fixOriginCheck("https://myapp.com", ["https://myapp.com"]) === true, "Exact match");
assert(solution10_fixOriginCheck("https://evil-myapp.com", ["https://myapp.com"]) === false, "Prefix attack blocked");
assert(solution10_fixOriginCheck("https://myapp.com.evil.com", ["https://myapp.com"]) === false, "Suffix attack blocked");

// Exercise 11
section("Exercise 11: Cache-Control Parser");
const cc11a = solution11_parseCacheControl("public, max-age=31536000, immutable");
assert(cc11a.public === true, "public");
assert(cc11a.maxAge === 31536000, "max-age");
assert(cc11a.immutable === true, "immutable");

const cc11b = solution11_parseCacheControl("private, no-cache, must-revalidate");
assert(cc11b.private === true, "private");
assert(cc11b.noCache === true, "no-cache");
assert(cc11b.mustRevalidate === true, "must-revalidate");

const cc11c = solution11_parseCacheControl("max-age=60, stale-while-revalidate=3600");
assert(cc11c.maxAge === 60, "max-age=60");
assert(cc11c.staleWhileRevalidate === 3600, "SWR=3600");

// Exercise 12
section("Exercise 12: ETag Matcher");
assert(solution12_matchEtag('"abc"', '"abc"').statusCode === 304, "Match = 304");
assert(solution12_matchEtag('"abc"', '"def"').statusCode === 200, "No match = 200");
assert(solution12_matchEtag('"abc", "def"', '"def"').statusCode === 304, "Multi-match");
assert(solution12_matchEtag('*', '"anything"').statusCode === 304, "Wildcard = 304");
assert(solution12_matchEtag('W/"abc"', 'W/"abc"').statusCode === 304, "Weak match");

// Exercise 13
section("Exercise 13: CORS Validator");
const corsConfig: CorsConfig = {
  allowedOrigins: ["https://myapp.com"],
  allowedMethods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  allowCredentials: true,
  maxAge: 86400,
};

const cr1 = solution13_validateCors(
  { origin: "https://myapp.com", method: "GET", headers: [], credentials: false },
  corsConfig
);
assert(cr1.allowed === true, "Allowed origin");
assert(cr1.headers["Access-Control-Allow-Origin"] === "https://myapp.com", "Origin header set");

const cr2 = solution13_validateCors(
  { origin: "https://evil.com", method: "GET", headers: [], credentials: false },
  corsConfig
);
assert(cr2.allowed === false, "Blocked origin");

const cr3 = solution13_validateCors(
  { origin: "https://myapp.com", method: "PUT", headers: ["Authorization"], credentials: true },
  corsConfig
);
assert(cr3.preflight === true, "PUT needs preflight");
assert(cr3.headers["Access-Control-Allow-Credentials"] === "true", "Credentials header");

// Exercise 14
section("Exercise 14: Caching Proxy");
const proxy14 = solution14_createCachingProxy();
proxy14.configure("/api/data", "cache-first", 300);

const nr1 = proxy14.request("/api/data", 0, () => ({ data: "fresh", etag: '"v1"' }));
assert(nr1.source === "network", "First request = network");
assert(nr1.data === "fresh", "Got fresh data");

const nr2 = proxy14.request("/api/data", 100, () => ({ data: "newer", etag: '"v2"' }));
assert(nr2.source === "cache", "Second request = cache");
assert(nr2.data === "fresh", "Got cached data");

// Exercise 15
section("Exercise 15: Origin Parser");
const o1 = solution15_parseOrigin("https://example.com/path");
assert(o1.scheme === "https", "Scheme");
assert(o1.host === "example.com", "Host");
assert(o1.port === 443, "Default HTTPS port");

const o2 = solution15_parseOrigin("http://localhost:3000/api");
assert(o2.port === 3000, "Custom port");

assert(solution15_isSameOrigin("https://example.com/a", "https://example.com/b") === true, "Same origin");
assert(solution15_isSameOrigin("https://example.com", "http://example.com") === false, "Different scheme");
assert(solution15_isSameOrigin("https://example.com", "https://api.example.com") === false, "Different host");

// Exercise 16
section("Exercise 16: Cache Busting");
assert(solution16_cacheBustUrl("/assets/app.js", "a1b2c3", "filename") === "/assets/app.a1b2c3.js", "Filename hash");
assert(solution16_cacheBustUrl("/assets/app.js", "a1b2c3", "query") === "/assets/app.js?v=a1b2c3", "Query hash");
assert(solution16_cacheBustUrl("/assets/style.min.css", "xyz", "filename") === "/assets/style.min.xyz.css", "Multi-dot filename");
assert(solution16_cacheBustUrl("/assets/data", "abc", "filename") === "/assets/data.abc", "No extension");

// Exercise 17
section("Exercise 17: Preflight Detector");
assert(solution17_needsPreflight("GET", {}) === false, "Simple GET");
assert(solution17_needsPreflight("POST", {}, "text/plain") === false, "Simple POST");
assert(solution17_needsPreflight("POST", {}, "application/json") === true, "JSON triggers preflight");
assert(solution17_needsPreflight("PUT", {}) === true, "PUT triggers");
assert(solution17_needsPreflight("DELETE", {}) === true, "DELETE triggers");
assert(solution17_needsPreflight("GET", { Authorization: "Bearer x" }) === true, "Auth header triggers");
assert(solution17_needsPreflight("GET", { "X-Custom": "value" }) === true, "Custom header triggers");
assert(solution17_needsPreflight("POST", { Accept: "application/json" }, "text/plain") === false, "Accept is safe");

// Exercise 18
section("Exercise 18: Cache Decision");
const d18a = solution18_decideCacheStrategy({ type: "static-hashed" });
assert(d18a.cacheControl === "public, max-age=31536000, immutable", "Static hashed");
assert(d18a.shouldCache === true, "Should cache static");

const d18b = solution18_decideCacheStrategy({ type: "html" });
assert(d18b.cacheControl === "no-cache", "HTML no-cache");

const d18c = solution18_decideCacheStrategy({ type: "api-public", maxAgeSeconds: 300 });
assert(d18c.cacheControl === "public, max-age=300", "Public API");

const d18d = solution18_decideCacheStrategy({ type: "sensitive" });
assert(d18d.cacheControl === "no-store", "Sensitive no-store");
assert(d18d.shouldCache === false, "Should not cache sensitive");

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests ===`);
if (failed > 0) process.exit(1);
