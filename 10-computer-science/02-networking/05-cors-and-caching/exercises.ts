/**
 * CORS & Caching — Exercises
 * 18 exercises: 6 predict, 4 fix, 8 implement
 *
 * Run: npx tsx exercises.ts
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

// ============================================================================
// EXERCISE 1 (Predict): Is This a CORS Request?
// ============================================================================

function exercise1_predictCors(): Record<string, boolean> {
  // Your page is at https://myapp.com. Is each request cross-origin?
  //
  // A: fetch('https://myapp.com/api/data')
  // B: fetch('https://api.myapp.com/data')
  // C: fetch('http://myapp.com/api/data')
  // D: fetch('https://myapp.com:8080/api/data')
  // E: fetch('/api/data')
  // F: fetch('https://other-site.com/api/data')

  return {
    A: false, // TODO
    B: false, // TODO
    C: false, // TODO
    D: false, // TODO
    E: false, // TODO
    F: false, // TODO
  };
}

// Tests:
// A: false (same origin)
// B: true (different host — subdomain counts)
// C: true (different scheme — http vs https)
// D: true (different port)
// E: false (relative URL = same origin)
// F: true (different host entirely)

// ============================================================================
// EXERCISE 2 (Predict): Will a Preflight Be Sent?
// ============================================================================

function exercise2_predictPreflight(): Record<string, boolean> {
  // For each cross-origin request, will the browser send a preflight OPTIONS?
  //
  // A: fetch('https://api.com/data')  // Simple GET, no custom headers
  // B: fetch('https://api.com/data', { method: 'POST', headers: { 'Content-Type': 'text/plain' } })
  // C: fetch('https://api.com/data', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
  // D: fetch('https://api.com/data', { method: 'PUT', body: '{}' })
  // E: fetch('https://api.com/data', { headers: { 'Authorization': 'Bearer token' } })
  // F: fetch('https://api.com/data', { method: 'DELETE' })

  return {
    A: false, // TODO
    B: false, // TODO
    C: false, // TODO
    D: false, // TODO
    E: false, // TODO
    F: false, // TODO
  };
}

// Tests:
// A: false (simple GET)
// B: false (POST with text/plain is simple)
// C: true (application/json triggers preflight)
// D: true (PUT always triggers preflight)
// E: true (Authorization header triggers preflight)
// F: true (DELETE triggers preflight)

// ============================================================================
// EXERCISE 3 (Predict): CORS Response — Allowed?
// ============================================================================

function exercise3_predictAllowed(): Record<string, boolean> {
  // Server responds with: Access-Control-Allow-Origin: https://myapp.com
  //
  // A: Request from https://myapp.com
  // B: Request from https://other.com
  // C: Request from http://myapp.com
  // D: Request from https://myapp.com:3000

  return {
    A: false, // TODO
    B: false, // TODO
    C: false, // TODO
    D: false, // TODO
  };
}

// Tests:
// A: true (exact match)
// B: false (different origin)
// C: false (different scheme)
// D: false (different port)

// ============================================================================
// EXERCISE 4 (Predict): Cache Hit or Miss?
// ============================================================================

function exercise4_predictCacheHit(): Record<string, "hit" | "miss" | "revalidate"> {
  // Resource cached at t=0 with: Cache-Control: max-age=300
  // and ETag: "abc123"
  //
  // A: Request at t=100 (100 seconds later)
  // B: Request at t=400 (400 seconds later)
  // C: Request at t=400 with Cache-Control: no-cache on the response originally
  // D: Request at t=100 but original had Cache-Control: no-store

  return {
    A: "miss",  // TODO
    B: "miss",  // TODO
    C: "miss",  // TODO
    D: "miss",  // TODO
  };
}

// Tests:
// A: "hit" (within max-age)
// B: "revalidate" (expired, has ETag so will send If-None-Match)
// C: "revalidate" (no-cache = always revalidate)
// D: "miss" (no-store = never cached in the first place)

// ============================================================================
// EXERCISE 5 (Predict): Cache-Control for Resource Types
// ============================================================================

function exercise5_predictCacheControl(): Record<string, string> {
  // What Cache-Control header should be used for each resource?
  //
  // A: app.a1b2c3.js (hashed JavaScript bundle)
  // B: index.html (entry point)
  // C: /api/user/profile (authenticated user data)
  // D: /api/public/news (public data, changes hourly)
  // E: Session token response (sensitive)

  return {
    A: "",  // TODO
    B: "",  // TODO
    C: "",  // TODO
    D: "",  // TODO
    E: "",  // TODO
  };
}

// Tests:
// A: "public, max-age=31536000, immutable"
// B: "no-cache" (or "max-age=0, must-revalidate")
// C: "private, no-cache"
// D: "public, max-age=3600" (or with stale-while-revalidate)
// E: "no-store"

// ============================================================================
// EXERCISE 6 (Predict): Stale-While-Revalidate Timeline
// ============================================================================

function exercise6_predictSwr(): Record<string, { served: "fresh" | "stale" | "network"; instant: boolean }> {
  // Cache-Control: max-age=60, stale-while-revalidate=3600
  // Cached at t=0
  //
  // A: Request at t=30
  // B: Request at t=90
  // C: Request at t=4000

  return {
    A: { served: "fresh", instant: false }, // TODO
    B: { served: "fresh", instant: false }, // TODO
    C: { served: "fresh", instant: false }, // TODO
  };
}

// Tests:
// A: { served: "fresh", instant: true }  (within max-age)
// B: { served: "stale", instant: true }  (in SWR window, serve stale + revalidate)
// C: { served: "network", instant: false } (past SWR window, must wait for network)

// ============================================================================
// EXERCISE 7 (Fix): Broken CORS Config
// ============================================================================

function exercise7_fixCorsConfig(): CorsConfig {
  // This CORS config has issues that cause errors. Fix them.
  // Requirements: Allow requests from https://myapp.com with credentials (cookies).

  return {
    allowedOrigins: "*", // BUG: Can't use wildcard with credentials
    allowedMethods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"], // BUG: Missing Authorization
    allowCredentials: true,
    maxAge: 0, // BUG: Should cache preflight to reduce OPTIONS requests
  };
}

// Tests:
// const config = exercise7_fixCorsConfig();
// assert(config.allowedOrigins !== "*"); // Must be specific origin with credentials
// assert(Array.isArray(config.allowedOrigins));
// assert(config.allowedOrigins.includes("https://myapp.com"));
// assert(config.allowedHeaders.includes("Authorization"));
// assert(config.maxAge > 0);

// ============================================================================
// EXERCISE 8 (Fix): Broken Cache-Control Parser
// ============================================================================

function exercise8_fixCacheControlParser(header: string): CacheControlDirectives {
  // This parser has bugs. Fix them.

  const result: CacheControlDirectives = {};
  const parts = header.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    const [key, value] = trimmed.split("=");

    switch (key) {
      case "max-age":
        result.maxAge = parseInt(value); // BUG: Missing radix
        break;
      case "s-maxage":
        result.maxAge = parseInt(value); // BUG: Should be sMaxAge, not maxAge
        break;
      case "no-cache":
        result.noStore = true; // BUG: Should be noCache
        break;
      case "no-store":
        result.noCache = true; // BUG: Should be noStore
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
        result.staleWhileRevalidate = parseInt(value);
        break;
    }
  }

  return result;
}

// Tests:
// const cc = exercise8_fixCacheControlParser("public, max-age=3600, stale-while-revalidate=86400");
// assert(cc.public === true);
// assert(cc.maxAge === 3600);
// assert(cc.staleWhileRevalidate === 86400);
//
// const cc2 = exercise8_fixCacheControlParser("no-cache, no-store");
// assert(cc2.noCache === true);
// assert(cc2.noStore === true);

// ============================================================================
// EXERCISE 9 (Fix): Broken ETag Matching
// ============================================================================

function exercise9_fixEtagMatch(
  requestEtag: string,
  responseEtag: string
): boolean {
  // This ETag comparison is broken. Fix it.
  // ETags should match if:
  // 1. Both are identical (strong comparison)
  // 2. Both are weak and their opaque values match
  //    W/"abc" matches W/"abc"
  //    W/"abc" does NOT match "abc" (weak vs strong)

  // BUG: This just does string equality, doesn't handle weak ETags
  return requestEtag === responseEtag;
}

// Tests:
// assert(exercise9_fixEtagMatch('"abc"', '"abc"') === true);   // Strong match
// assert(exercise9_fixEtagMatch('"abc"', '"def"') === false);  // Different
// assert(exercise9_fixEtagMatch('W/"abc"', 'W/"abc"') === true); // Weak match
// assert(exercise9_fixEtagMatch('W/"abc"', '"abc"') === false);  // Weak vs strong

// ============================================================================
// EXERCISE 10 (Fix): Broken Origin Check
// ============================================================================

function exercise10_fixOriginCheck(
  requestOrigin: string,
  allowedOrigins: string[]
): boolean {
  // This origin check has a security vulnerability. Fix it.

  for (const allowed of allowedOrigins) {
    // BUG: Using includes() is vulnerable — "https://evil-myapp.com" includes "myapp.com"
    if (requestOrigin.includes(allowed)) {
      return true;
    }
  }
  return false;
}

// Tests:
// assert(exercise10_fixOriginCheck("https://myapp.com", ["https://myapp.com"]) === true);
// assert(exercise10_fixOriginCheck("https://evil-myapp.com", ["https://myapp.com"]) === false);
// assert(exercise10_fixOriginCheck("https://myapp.com.evil.com", ["https://myapp.com"]) === false);
// assert(exercise10_fixOriginCheck("https://other.com", ["https://myapp.com"]) === false);

// ============================================================================
// EXERCISE 11 (Implement): Cache-Control Header Parser
// ============================================================================

function exercise11_parseCacheControl(header: string): CacheControlDirectives {
  // Parse a Cache-Control header into structured directives.
  // Handle all directive types in CacheControlDirectives.
  // Handle whitespace, missing values, etc.

  // TODO: Implement
  void header;
  return {};
}

// Tests:
// const cc1 = exercise11_parseCacheControl("public, max-age=31536000, immutable");
// assert(cc1.public === true);
// assert(cc1.maxAge === 31536000);
// assert(cc1.immutable === true);
//
// const cc2 = exercise11_parseCacheControl("private, no-cache, must-revalidate");
// assert(cc2.private === true);
// assert(cc2.noCache === true);
// assert(cc2.mustRevalidate === true);
//
// const cc3 = exercise11_parseCacheControl("max-age=60, stale-while-revalidate=3600");
// assert(cc3.maxAge === 60);
// assert(cc3.staleWhileRevalidate === 3600);

// ============================================================================
// EXERCISE 12 (Implement): ETag Matcher
// ============================================================================

function exercise12_matchEtag(
  ifNoneMatch: string,
  currentEtag: string
): { match: boolean; statusCode: 200 | 304 } {
  // Implement ETag matching for conditional requests.
  //
  // If-None-Match can contain multiple ETags: '"abc", "def", W/"ghi"'
  // Match means: respond with 304 (use cached version)
  // No match means: respond with 200 (send full response)
  //
  // Matching rules:
  // - Strong ETags: exact string match
  // - Weak ETags: compare opaque values (W/"abc" matches W/"abc")
  // - If-None-Match: * matches any ETag

  // TODO: Implement
  void ifNoneMatch;
  void currentEtag;
  return { match: false, statusCode: 200 };
}

// Tests:
// assert(exercise12_matchEtag('"abc"', '"abc"').statusCode === 304);
// assert(exercise12_matchEtag('"abc"', '"def"').statusCode === 200);
// assert(exercise12_matchEtag('"abc", "def"', '"def"').statusCode === 304);
// assert(exercise12_matchEtag('*', '"anything"').statusCode === 304);
// assert(exercise12_matchEtag('W/"abc"', 'W/"abc"').statusCode === 304);

// ============================================================================
// EXERCISE 13 (Implement): CORS Validator
// ============================================================================

function exercise13_validateCors(
  request: CorsRequest,
  config: CorsConfig
): CorsResponse {
  // Implement a CORS validator that:
  // 1. Checks if the origin is allowed
  // 2. Determines if a preflight is needed
  // 3. Returns appropriate CORS headers
  // 4. Handles credentials (no wildcard with credentials)
  //
  // Return headers should include:
  // - Access-Control-Allow-Origin
  // - Access-Control-Allow-Methods (preflight only)
  // - Access-Control-Allow-Headers (preflight only)
  // - Access-Control-Allow-Credentials (if credentials enabled)
  // - Access-Control-Max-Age (preflight only)

  // TODO: Implement
  void request;
  void config;
  return { allowed: false, headers: {}, preflight: false };
}

// Tests:
// const config: CorsConfig = {
//   allowedOrigins: ["https://myapp.com"],
//   allowedMethods: ["GET", "POST", "PUT"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   allowCredentials: true,
//   maxAge: 86400,
// };
//
// const r1 = exercise13_validateCors({
//   origin: "https://myapp.com", method: "GET", headers: [], credentials: false
// }, config);
// assert(r1.allowed === true);
// assert(r1.headers["Access-Control-Allow-Origin"] === "https://myapp.com");
//
// const r2 = exercise13_validateCors({
//   origin: "https://evil.com", method: "GET", headers: [], credentials: false
// }, config);
// assert(r2.allowed === false);
//
// const r3 = exercise13_validateCors({
//   origin: "https://myapp.com", method: "PUT", headers: ["Authorization"], credentials: true
// }, config);
// assert(r3.preflight === true);
// assert(r3.headers["Access-Control-Allow-Credentials"] === "true");

// ============================================================================
// EXERCISE 14 (Implement): Caching Proxy
// ============================================================================

function exercise14_createCachingProxy(): {
  request: (url: string, currentTime: number, networkResponse: () => { data: string; etag: string }) => CacheResult;
  getCache: () => Map<string, CacheEntry>;
  configure: (url: string, strategy: CacheStrategy, maxAge: number) => void;
} {
  // Implement a caching proxy that supports different strategies per URL.
  //
  // Strategies:
  // - cache-first: Return cache if available and not expired, else network
  // - network-first: Try network, fall back to cache on failure
  // - stale-while-revalidate: Return cache (even stale), revalidate in background
  //   (simulate by always returning cache if exists, marking stale)
  // - network-only: Always use network
  // - cache-only: Only return cache, error if not cached
  //
  // Default strategy: network-only
  // Default maxAge: 0

  // TODO: Implement
  return {
    request: (_url, _time, networkFn) => ({
      source: "network",
      data: networkFn().data,
      stale: false,
    }),
    getCache: () => new Map(),
    configure: () => {},
  };
}

// Tests:
// const proxy = exercise14_createCachingProxy();
// proxy.configure("/api/data", "cache-first", 300);
// const network = () => ({ data: "fresh", etag: '"v1"' });
//
// const r1 = proxy.request("/api/data", 0, network);
// assert(r1.source === "network"); // First request — nothing cached
// assert(r1.data === "fresh");
//
// const r2 = proxy.request("/api/data", 100, () => ({ data: "newer", etag: '"v2"' }));
// assert(r2.source === "cache"); // Cache-first: within maxAge
// assert(r2.data === "fresh"); // Returns cached data

// ============================================================================
// EXERCISE 15 (Implement): Origin Parser & Comparator
// ============================================================================

interface Origin {
  scheme: string;
  host: string;
  port: number;
}

function exercise15_parseOrigin(url: string): Origin {
  // Parse a URL into its origin components.
  // Default ports: http=80, https=443

  // TODO: Implement
  void url;
  return { scheme: "", host: "", port: 0 };
}

function exercise15_isSameOrigin(url1: string, url2: string): boolean {
  // Compare two URLs and determine if they have the same origin.

  // TODO: Implement
  void url1;
  void url2;
  return false;
}

// Tests:
// const o1 = exercise15_parseOrigin("https://example.com/path");
// assert(o1.scheme === "https");
// assert(o1.host === "example.com");
// assert(o1.port === 443);
//
// const o2 = exercise15_parseOrigin("http://localhost:3000/api");
// assert(o2.port === 3000);
//
// assert(exercise15_isSameOrigin("https://example.com/a", "https://example.com/b") === true);
// assert(exercise15_isSameOrigin("https://example.com", "http://example.com") === false);
// assert(exercise15_isSameOrigin("https://example.com", "https://api.example.com") === false);

// ============================================================================
// EXERCISE 16 (Implement): Cache Busting URL Generator
// ============================================================================

function exercise16_cacheBustUrl(
  url: string,
  contentHash: string,
  strategy: "filename" | "query"
): string {
  // Generate a cache-busted URL using two strategies:
  //
  // Filename strategy: /assets/app.js → /assets/app.a1b2c3.js
  // Query strategy: /assets/app.js → /assets/app.js?v=a1b2c3
  //
  // For filename strategy, insert hash before the last extension.
  // If no extension, append hash: /assets/data → /assets/data.a1b2c3

  // TODO: Implement
  void url;
  void contentHash;
  void strategy;
  return "";
}

// Tests:
// assert(exercise16_cacheBustUrl("/assets/app.js", "a1b2c3", "filename") === "/assets/app.a1b2c3.js");
// assert(exercise16_cacheBustUrl("/assets/app.js", "a1b2c3", "query") === "/assets/app.js?v=a1b2c3");
// assert(exercise16_cacheBustUrl("/assets/style.min.css", "xyz", "filename") === "/assets/style.min.xyz.css");
// assert(exercise16_cacheBustUrl("/assets/data", "abc", "filename") === "/assets/data.abc");

// ============================================================================
// EXERCISE 17 (Implement): Preflight Request Detector
// ============================================================================

function exercise17_needsPreflight(
  method: string,
  headers: Record<string, string>,
  contentType?: string
): boolean {
  // Determine if a cross-origin request would trigger a preflight.
  //
  // Simple requests (no preflight) must meet ALL criteria:
  // - Method: GET, HEAD, or POST
  // - Only "safe" headers: Accept, Accept-Language, Content-Language, Content-Type
  // - Content-Type (if present): text/plain, multipart/form-data, application/x-www-form-urlencoded
  //
  // Custom headers (Authorization, X-*, etc.) always trigger preflight.

  // TODO: Implement
  void method;
  void headers;
  void contentType;
  return false;
}

// Tests:
// assert(exercise17_needsPreflight("GET", {}) === false);
// assert(exercise17_needsPreflight("POST", {}, "text/plain") === false);
// assert(exercise17_needsPreflight("POST", {}, "application/json") === true);
// assert(exercise17_needsPreflight("PUT", {}) === true);
// assert(exercise17_needsPreflight("DELETE", {}) === true);
// assert(exercise17_needsPreflight("GET", { "Authorization": "Bearer x" }) === true);
// assert(exercise17_needsPreflight("GET", { "X-Custom": "value" }) === true);
// assert(exercise17_needsPreflight("POST", { "Accept": "application/json" }, "text/plain") === false);

// ============================================================================
// EXERCISE 18 (Implement): Cache Decision Engine
// ============================================================================

interface CacheDecision {
  shouldCache: boolean;
  cacheControl: string;
  reason: string;
}

function exercise18_decideCacheStrategy(resource: {
  type: "static-hashed" | "html" | "api-public" | "api-private" | "sensitive";
  maxAgeSeconds?: number;
}): CacheDecision {
  // Implement a cache decision engine based on resource type.
  //
  // Rules:
  // - static-hashed: public, max-age=31536000, immutable
  // - html: no-cache (always revalidate)
  // - api-public: public, max-age=N (use maxAgeSeconds or default 60)
  // - api-private: private, no-cache
  // - sensitive: no-store

  // TODO: Implement
  void resource;
  return { shouldCache: false, cacheControl: "", reason: "" };
}

// Tests:
// const d1 = exercise18_decideCacheStrategy({ type: "static-hashed" });
// assert(d1.cacheControl === "public, max-age=31536000, immutable");
// assert(d1.shouldCache === true);
//
// const d2 = exercise18_decideCacheStrategy({ type: "html" });
// assert(d2.cacheControl === "no-cache");
//
// const d3 = exercise18_decideCacheStrategy({ type: "api-public", maxAgeSeconds: 300 });
// assert(d3.cacheControl === "public, max-age=300");
//
// const d4 = exercise18_decideCacheStrategy({ type: "sensitive" });
// assert(d4.cacheControl === "no-store");
// assert(d4.shouldCache === false);

// ============================================================================
// RUNNER
// ============================================================================

console.log("=== CORS & Caching Exercises ===\n");

console.log("Exercise 1 (Predict - CORS):", exercise1_predictCors());
console.log("Exercise 2 (Predict - Preflight):", exercise2_predictPreflight());
console.log("Exercise 3 (Predict - Allowed):", exercise3_predictAllowed());
console.log("Exercise 4 (Predict - Cache Hit):", exercise4_predictCacheHit());
console.log("Exercise 5 (Predict - Cache-Control):", exercise5_predictCacheControl());
console.log("Exercise 6 (Predict - SWR):", exercise6_predictSwr());
console.log("Exercise 7 (Fix - CORS Config):", exercise7_fixCorsConfig());
console.log("Exercise 8 (Fix - CC Parser):", exercise8_fixCacheControlParser("public, max-age=3600"));
console.log("Exercise 9 (Fix - ETag):", exercise9_fixEtagMatch('"abc"', '"abc"'));
console.log("Exercise 10 (Fix - Origin):", exercise10_fixOriginCheck("https://myapp.com", ["https://myapp.com"]));
console.log("Exercise 11 (Implement - CC Parser):", exercise11_parseCacheControl("max-age=3600"));
console.log("Exercise 12 (Implement - ETag):", exercise12_matchEtag('"abc"', '"abc"'));
console.log("Exercise 13 (Implement - CORS):", exercise13_validateCors(
  { origin: "https://test.com", method: "GET", headers: [], credentials: false },
  { allowedOrigins: "*", allowedMethods: ["GET"], allowedHeaders: [], allowCredentials: false, maxAge: 0 }
));
console.log("Exercise 14 (Implement - Proxy):", exercise14_createCachingProxy());
console.log("Exercise 15 (Implement - Origin):", exercise15_parseOrigin("https://example.com"));
console.log("Exercise 16 (Implement - Cache Bust):", exercise16_cacheBustUrl("/app.js", "abc", "filename"));
console.log("Exercise 17 (Implement - Preflight):", exercise17_needsPreflight("GET", {}));
console.log("Exercise 18 (Implement - Decision):", exercise18_decideCacheStrategy({ type: "html" }));

console.log("\nDone! Implement the TODOs and check against solutions.ts");
