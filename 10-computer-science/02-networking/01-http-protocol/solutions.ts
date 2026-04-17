/**
 * HTTP Protocol — Solutions
 * 18 exercises: 6 predict, 4 fix, 8 implement
 *
 * Run: npx tsx solutions.ts
 * Config: ES2022, strict, ESNext modules
 */

// ============================================================================
// TYPES
// ============================================================================

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

interface HttpRequest {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  body?: string;
}

interface HttpResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string;
}

interface Route {
  method: HttpMethod;
  path: string;
  handler: (req: HttpRequest) => HttpResponse;
}

interface Cookie {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: string;
}

interface ParsedRequest {
  method: string;
  path: string;
  httpVersion: string;
  headers: Record<string, string>;
  body: string;
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
// SOLUTION 1: Predict Status Codes
// ============================================================================

function solution1_predictStatusCodes(): Record<string, number> {
  return {
    A: 200, // GET success — return the user
    B: 201, // POST success — resource created
    C: 204, // DELETE success — no body returned
    D: 404, // Resource not found
    E: 400, // Bad request — invalid JSON
    F: 403, // Forbidden — authenticated but not authorized
    G: 500, // Internal server error — unhandled exception
    H: 200, // PUT success — return updated resource
  };
}

// ============================================================================
// SOLUTION 2: Predict Methods
// ============================================================================

function solution2_predictMethods(): Record<string, HttpMethod> {
  return {
    A: "GET",    // Fetch list
    B: "POST",   // Submit new
    C: "PATCH",  // Partial update (title only)
    D: "PUT",    // Replace entire resource
    E: "DELETE", // Remove
    F: "HEAD",   // Check existence without downloading body
  };
}

// ============================================================================
// SOLUTION 3: Predict Headers
// ============================================================================

function solution3_predictHeaders(): Record<string, string[]> {
  return {
    A: ["Accept"],
    B: ["Content-Type", "Accept"],
    C: ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
  };
}

// ============================================================================
// SOLUTION 4: Predict Cookie Access
// ============================================================================

function solution4_predictCookieAccess(): Record<string, boolean> {
  return {
    session: false, // HttpOnly — JS cannot read
    theme: true,    // No HttpOnly — JS can read
    tracking: true, // No HttpOnly — JS can read
  };
}

// ============================================================================
// SOLUTION 5: Predict Performance
// ============================================================================

function solution5_predictPerformance(): Record<string, "HTTP/1.1" | "HTTP/2"> {
  return {
    A: "HTTP/2",   // Multiplexing handles many small files efficiently
    B: "HTTP/1.1", // Single large file — no multiplexing benefit, roughly equal
    C: "HTTP/2",   // Multiplexing handles concurrent API calls
    D: "HTTP/2",   // HPACK header compression reduces repeated header overhead
  };
}

// ============================================================================
// SOLUTION 6: Predict Redirects
// ============================================================================

function solution6_predictRedirects(): Record<string, { method: string; cached: boolean }> {
  return {
    A: { method: "GET", cached: true },    // 301: method may change to GET, permanently cached
    B: { method: "GET", cached: false },    // 302: method may change to GET, not cached
    C: { method: "POST", cached: false },   // 307: method preserved, temporary
    D: { method: "POST", cached: true },    // 308: method preserved, permanent
  };
}

// ============================================================================
// SOLUTION 7: Fix Fetch (Missing Content-Type)
// ============================================================================

function solution7_fixFetch(): { headers: Record<string, string>; body: string } {
  const data = { username: "alice", password: "secret123" };

  return {
    headers: {
      "Content-Type": "application/json", // FIX: Added Content-Type
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  };
}

// ============================================================================
// SOLUTION 8: Fix Cookie Parser
// ============================================================================

function solution8_fixCookieParser(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(";"); // FIX 1: Split on ";" not ","
  for (const pair of pairs) {
    const equalIndex = pair.indexOf("=");
    if (equalIndex === -1) continue;
    const name = pair.substring(0, equalIndex).trim(); // FIX 2: Trim whitespace
    const value = pair.substring(equalIndex + 1).trim();
    cookies[name] = value;
  }
  return cookies;
}

// ============================================================================
// SOLUTION 9: Fix Status Code Check
// ============================================================================

function solution9_fixStatusCheck(
  statusCode: number
): "success" | "redirect" | "clientError" | "serverError" | "unknown" {
  if (statusCode >= 200 && statusCode < 300) { // FIX: || to &&
    return "success";
  } else if (statusCode >= 300 && statusCode < 400) {
    return "redirect";
  } else if (statusCode >= 400 && statusCode < 500) {
    return "clientError"; // FIX: Swapped labels
  } else if (statusCode >= 500 && statusCode < 600) {
    return "serverError"; // FIX: Swapped labels
  }
  return "unknown";
}

// ============================================================================
// SOLUTION 10: Fix Request Builder
// ============================================================================

function solution10_fixRequestBuilder(
  method: HttpMethod,
  _url: string,
  data?: Record<string, unknown>
): { method: string; headers: Record<string, string>; body?: string } {
  const request: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: {},
  };

  // FIX: Only attach body for methods that support it
  const methodsWithBody: HttpMethod[] = ["POST", "PUT", "PATCH"];
  if (data && methodsWithBody.includes(method)) {
    request.headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(data);
  }

  return request;
}

// ============================================================================
// SOLUTION 11: HTTP Request Parser
// ============================================================================

function solution11_parseHttpRequest(raw: string): ParsedRequest {
  const [headerSection, ...bodyParts] = raw.split("\r\n\r\n");
  const body = bodyParts.join("\r\n\r\n");
  const lines = headerSection.split("\r\n");
  const [method, path, httpVersion] = lines[0].split(" ");

  const headers: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    const colonIndex = lines[i].indexOf(":");
    if (colonIndex === -1) continue;
    const key = lines[i].substring(0, colonIndex).trim();
    const value = lines[i].substring(colonIndex + 1).trim();
    headers[key] = value;
  }

  return { method, path, httpVersion, headers, body };
}

// ============================================================================
// SOLUTION 12: HTTP Response Builder
// ============================================================================

function solution12_buildHttpResponse(response: HttpResponse): string {
  let raw = `HTTP/1.1 ${response.statusCode} ${response.statusText}\r\n`;

  for (const [key, value] of Object.entries(response.headers)) {
    raw += `${key}: ${value}\r\n`;
  }

  raw += "\r\n";

  if (response.body !== undefined) {
    raw += response.body;
  }

  return raw;
}

// ============================================================================
// SOLUTION 13: Simple Router Dispatcher
// ============================================================================

function solution13_createRouter(): {
  addRoute: (method: HttpMethod, path: string, handler: Route["handler"]) => void;
  dispatch: (req: HttpRequest) => HttpResponse;
} {
  const routes: Route[] = [];

  return {
    addRoute(method, path, handler) {
      routes.push({ method, path, handler });
    },

    dispatch(req) {
      const pathMatches = routes.filter((r) => r.path === req.path);

      if (pathMatches.length === 0) {
        return {
          statusCode: 404,
          statusText: "Not Found",
          headers: {},
          body: "Not Found",
        };
      }

      const exactMatch = pathMatches.find((r) => r.method === req.method);

      if (!exactMatch) {
        return {
          statusCode: 405,
          statusText: "Method Not Allowed",
          headers: {
            Allow: pathMatches.map((r) => r.method).join(", "),
          },
          body: "Method Not Allowed",
        };
      }

      return exactMatch.handler(req);
    },
  };
}

// ============================================================================
// SOLUTION 14: Cookie Serializer
// ============================================================================

function solution14_serializeCookie(cookie: Cookie): string {
  let result = `${cookie.name}=${cookie.value}`;

  if (cookie.httpOnly) result += "; HttpOnly";
  if (cookie.secure) result += "; Secure";
  if (cookie.sameSite) result += `; SameSite=${cookie.sameSite}`;
  if (cookie.maxAge !== undefined) result += `; Max-Age=${cookie.maxAge}`;
  if (cookie.expires) result += `; Expires=${cookie.expires}`;
  if (cookie.path) result += `; Path=${cookie.path}`;
  if (cookie.domain) result += `; Domain=${cookie.domain}`;

  return result;
}

// ============================================================================
// SOLUTION 15: Parse Set-Cookie Header
// ============================================================================

function solution15_parseSetCookie(header: string): Cookie {
  const parts = header.split(";").map((p) => p.trim());
  const [firstPart, ...attributeParts] = parts;
  const equalIndex = firstPart.indexOf("=");
  const name = firstPart.substring(0, equalIndex);
  const value = firstPart.substring(equalIndex + 1);

  const cookie: Cookie = { name, value };

  for (const attr of attributeParts) {
    const lower = attr.toLowerCase();
    if (lower === "httponly") {
      cookie.httpOnly = true;
    } else if (lower === "secure") {
      cookie.secure = true;
    } else if (lower.startsWith("samesite=")) {
      cookie.sameSite = attr.split("=")[1] as "Strict" | "Lax" | "None";
    } else if (lower.startsWith("max-age=")) {
      cookie.maxAge = parseInt(attr.split("=")[1], 10);
    } else if (lower.startsWith("expires=")) {
      cookie.expires = attr.substring(attr.indexOf("=") + 1);
    } else if (lower.startsWith("path=")) {
      cookie.path = attr.split("=")[1];
    } else if (lower.startsWith("domain=")) {
      cookie.domain = attr.split("=")[1];
    }
  }

  return cookie;
}

// ============================================================================
// SOLUTION 16: Query String Parser & Builder
// ============================================================================

function solution16_parseQueryString(queryString: string): Record<string, string> {
  const cleaned = queryString.startsWith("?") ? queryString.slice(1) : queryString;
  if (!cleaned) return {};

  const result: Record<string, string> = {};
  const pairs = cleaned.split("&");

  for (const pair of pairs) {
    const [key, val] = pair.split("=");
    result[decodeURIComponent(key)] = decodeURIComponent(val ?? "");
  }

  return result;
}

function solution16_buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

// ============================================================================
// SOLUTION 17: Cache-Control Header Parser
// ============================================================================

function solution17_parseCacheControl(header: string): CacheControlDirectives {
  const directives: CacheControlDirectives = {};
  const parts = header.split(",").map((p) => p.trim());

  for (const part of parts) {
    const [key, val] = part.split("=");
    const normalizedKey = key.trim().toLowerCase();

    switch (normalizedKey) {
      case "max-age":
        directives.maxAge = parseInt(val, 10);
        break;
      case "s-maxage":
        directives.sMaxAge = parseInt(val, 10);
        break;
      case "no-cache":
        directives.noCache = true;
        break;
      case "no-store":
        directives.noStore = true;
        break;
      case "public":
        directives.public = true;
        break;
      case "private":
        directives.private = true;
        break;
      case "must-revalidate":
        directives.mustRevalidate = true;
        break;
      case "immutable":
        directives.immutable = true;
        break;
    }
  }

  return directives;
}

// ============================================================================
// SOLUTION 18: Content Negotiation
// ============================================================================

function solution18_negotiate(
  acceptHeader: string,
  available: string[]
): string | null {
  const entries = acceptHeader.split(",").map((entry) => {
    const parts = entry.trim().split(";");
    const type = parts[0].trim();
    let q = 1;

    for (let i = 1; i < parts.length; i++) {
      const param = parts[i].trim();
      if (param.startsWith("q=")) {
        q = parseFloat(param.substring(2));
      }
    }

    return { type, q };
  });

  // Sort by q value descending
  entries.sort((a, b) => b.q - a.q);

  for (const entry of entries) {
    if (entry.type === "*/*") {
      // Wildcard — return first available
      if (available.length > 0) return available[0];
    } else if (entry.type.endsWith("/*")) {
      // Partial wildcard (e.g., "text/*")
      const prefix = entry.type.split("/")[0];
      const match = available.find((a) => a.startsWith(prefix + "/"));
      if (match) return match;
    } else {
      // Exact match
      if (available.includes(entry.type)) return entry.type;
    }
  }

  return null;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

console.log("=== HTTP Protocol — Solutions & Tests ===");

// Exercise 1
section("Exercise 1: Predict Status Codes");
const s1 = solution1_predictStatusCodes();
assert(s1.A === 200, "GET existing user = 200");
assert(s1.B === 201, "POST new user = 201");
assert(s1.C === 204, "DELETE no body = 204");
assert(s1.D === 404, "User not found = 404");
assert(s1.E === 400, "Invalid JSON = 400");
assert(s1.F === 403, "Not admin = 403");
assert(s1.G === 500, "Unhandled exception = 500");
assert(s1.H === 200, "PUT success = 200");

// Exercise 2
section("Exercise 2: Predict Methods");
const s2 = solution2_predictMethods();
assert(s2.A === "GET", "Fetch list = GET");
assert(s2.B === "POST", "Submit new = POST");
assert(s2.C === "PATCH", "Update title = PATCH");
assert(s2.D === "PUT", "Replace entire = PUT");
assert(s2.E === "DELETE", "Remove = DELETE");
assert(s2.F === "HEAD", "Check existence = HEAD");

// Exercise 3
section("Exercise 3: Predict Headers");
const s3 = solution3_predictHeaders();
assert(s3.A.includes("Accept"), "Simple GET sends Accept");
assert(s3.B.includes("Content-Type"), "POST with JSON sends Content-Type");
assert(s3.C.includes("Origin"), "Cross-origin triggers preflight with Origin");

// Exercise 4
section("Exercise 4: Predict Cookie Access");
const s4 = solution4_predictCookieAccess();
assert(s4.session === false, "HttpOnly cookie not readable by JS");
assert(s4.theme === true, "Non-HttpOnly cookie readable by JS");
assert(s4.tracking === true, "Secure-only cookie (no HttpOnly) readable by JS");

// Exercise 5
section("Exercise 5: Predict Performance");
const s5 = solution5_predictPerformance();
assert(s5.A === "HTTP/2", "50 small files — HTTP/2 multiplexing wins");
assert(s5.B === "HTTP/1.1", "Single large file — roughly equal");
assert(s5.C === "HTTP/2", "20 concurrent API calls — multiplexing wins");
assert(s5.D === "HTTP/2", "Repeated headers — HPACK compression wins");

// Exercise 6
section("Exercise 6: Predict Redirects");
const s6 = solution6_predictRedirects();
assert(s6.A.method === "GET" && s6.A.cached === true, "301 = GET + cached");
assert(s6.B.method === "GET" && s6.B.cached === false, "302 = GET + not cached");
assert(s6.C.method === "POST" && s6.C.cached === false, "307 = POST preserved + not cached");
assert(s6.D.method === "POST" && s6.D.cached === true, "308 = POST preserved + cached");

// Exercise 7
section("Exercise 7: Fix Fetch");
const s7 = solution7_fixFetch();
assert(s7.headers["Content-Type"] === "application/json", "Content-Type added");
assert(s7.headers["Accept"] === "application/json", "Accept preserved");

// Exercise 8
section("Exercise 8: Fix Cookie Parser");
const s8 = solution8_fixCookieParser("session=abc123; theme=dark; lang=en");
assert(s8["session"] === "abc123", "session parsed");
assert(s8["theme"] === "dark", "theme parsed");
assert(s8["lang"] === "en", "lang parsed");

// Exercise 9
section("Exercise 9: Fix Status Check");
assert(solution9_fixStatusCheck(200) === "success", "200 = success");
assert(solution9_fixStatusCheck(301) === "redirect", "301 = redirect");
assert(solution9_fixStatusCheck(404) === "clientError", "404 = clientError");
assert(solution9_fixStatusCheck(500) === "serverError", "500 = serverError");
assert(solution9_fixStatusCheck(100) === "unknown", "100 = unknown");

// Exercise 10
section("Exercise 10: Fix Request Builder");
const getReq = solution10_fixRequestBuilder("GET", "/api/data", { filter: "active" });
assert(getReq.body === undefined, "GET should not have body");
const postReq = solution10_fixRequestBuilder("POST", "/api/data", { name: "test" });
assert(postReq.body === '{"name":"test"}', "POST should have body");
assert(postReq.headers["Content-Type"] === "application/json", "POST should have Content-Type");

// Exercise 11
section("Exercise 11: HTTP Request Parser");
const req1 = solution11_parseHttpRequest("GET /api/users HTTP/1.1\r\nHost: example.com\r\nAccept: application/json\r\n\r\n");
assert(req1.method === "GET", "method = GET");
assert(req1.path === "/api/users", "path = /api/users");
assert(req1.httpVersion === "HTTP/1.1", "version = HTTP/1.1");
assert(req1.headers["Host"] === "example.com", "Host header");
assert(req1.headers["Accept"] === "application/json", "Accept header");
assert(req1.body === "", "empty body");

const req2 = solution11_parseHttpRequest('POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"name":"Alice"}');
assert(req2.method === "POST", "method = POST");
assert(req2.body === '{"name":"Alice"}', "body parsed");

// Exercise 12
section("Exercise 12: HTTP Response Builder");
const raw1 = solution12_buildHttpResponse({
  statusCode: 200,
  statusText: "OK",
  headers: { "Content-Type": "application/json" },
  body: '{"data":"hello"}',
});
assert(raw1 === 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"data":"hello"}', "200 response built");

const raw2 = solution12_buildHttpResponse({
  statusCode: 204,
  statusText: "No Content",
  headers: {},
});
assert(raw2 === "HTTP/1.1 204 No Content\r\n\r\n", "204 response built");

// Exercise 13
section("Exercise 13: Simple Router");
const router = solution13_createRouter();
router.addRoute("GET", "/users", () => ({
  statusCode: 200,
  statusText: "OK",
  headers: { "Content-Type": "application/json" },
  body: '[{"id":1}]',
}));
router.addRoute("POST", "/users", (req) => ({
  statusCode: 201,
  statusText: "Created",
  headers: { "Content-Type": "application/json" },
  body: req.body ?? "",
}));

const r1 = router.dispatch({ method: "GET", path: "/users", headers: {} });
assert(r1.statusCode === 200, "GET /users = 200");

const r2 = router.dispatch({ method: "POST", path: "/users", headers: {}, body: '{"name":"Alice"}' });
assert(r2.statusCode === 201, "POST /users = 201");

const r3 = router.dispatch({ method: "GET", path: "/unknown", headers: {} });
assert(r3.statusCode === 404, "GET /unknown = 404");

const r4 = router.dispatch({ method: "DELETE", path: "/users", headers: {} });
assert(r4.statusCode === 405, "DELETE /users = 405");

// Exercise 14
section("Exercise 14: Cookie Serializer");
assert(solution14_serializeCookie({ name: "session", value: "abc" }) === "session=abc", "simple cookie");
assert(
  solution14_serializeCookie({
    name: "session",
    value: "abc",
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 3600,
  }) === "session=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600",
  "full cookie"
);
assert(
  solution14_serializeCookie({
    name: "theme",
    value: "dark",
    path: "/",
    domain: ".example.com",
  }) === "theme=dark; Path=/; Domain=.example.com",
  "cookie with path and domain"
);

// Exercise 15
section("Exercise 15: Parse Set-Cookie");
const c1 = solution15_parseSetCookie("session=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600");
assert(c1.name === "session", "name parsed");
assert(c1.value === "abc", "value parsed");
assert(c1.httpOnly === true, "httpOnly parsed");
assert(c1.secure === true, "secure parsed");
assert(c1.sameSite === "Strict", "sameSite parsed");
assert(c1.maxAge === 3600, "maxAge parsed");

const c2 = solution15_parseSetCookie("theme=dark");
assert(c2.name === "theme" && c2.value === "dark", "simple cookie parsed");
assert(c2.httpOnly === undefined, "no httpOnly");

// Exercise 16
section("Exercise 16: Query String");
const qs1 = solution16_parseQueryString("?name=Alice&age=30");
assert(qs1.name === "Alice", "name parsed");
assert(qs1.age === "30", "age parsed");

const qs2 = solution16_parseQueryString("city=New%20York");
assert(qs2.city === "New York", "URL-encoded value decoded");

const built = solution16_buildQueryString({ name: "Alice", age: "30" });
assert(built === "name=Alice&age=30", "query string built");

// Exercise 17
section("Exercise 17: Cache-Control Parser");
const cc1 = solution17_parseCacheControl("public, max-age=31536000, immutable");
assert(cc1.public === true, "public directive");
assert(cc1.maxAge === 31536000, "max-age directive");
assert(cc1.immutable === true, "immutable directive");

const cc2 = solution17_parseCacheControl("no-cache, no-store, must-revalidate");
assert(cc2.noCache === true, "no-cache");
assert(cc2.noStore === true, "no-store");
assert(cc2.mustRevalidate === true, "must-revalidate");

const cc3 = solution17_parseCacheControl("private, max-age=0, must-revalidate");
assert(cc3.private === true, "private");
assert(cc3.maxAge === 0, "max-age=0");

// Exercise 18
section("Exercise 18: Content Negotiation");
assert(solution18_negotiate("application/json", ["application/json", "text/html"]) === "application/json", "exact match");
assert(solution18_negotiate("text/html, application/json;q=0.9", ["application/json", "text/html"]) === "text/html", "q-value priority");
assert(solution18_negotiate("application/xml", ["application/json"]) === null, "no match");
assert(solution18_negotiate("*/*", ["application/json"]) === "application/json", "wildcard match");
assert(
  solution18_negotiate("text/html;q=0.5, application/json;q=0.9", ["text/html", "application/json"]) === "application/json",
  "higher q wins"
);

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests ===`);

if (failed > 0) {
  process.exit(1);
}
