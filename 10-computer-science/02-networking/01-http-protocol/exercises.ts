/**
 * HTTP Protocol — Exercises
 * 18 exercises: 6 predict, 4 fix, 8 implement
 *
 * Run: npx tsx exercises.ts
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
// EXERCISE 1 (Predict): Status Code for Scenarios
// What status code should each API scenario return?
// ============================================================================

function exercise1_predictStatusCodes(): Record<string, number> {
  // Given these API scenarios, predict the correct status code:
  //
  // Scenario A: GET /api/users/42 — user exists and is returned
  // Scenario B: POST /api/users — new user created successfully
  // Scenario C: DELETE /api/users/42 — user deleted, no body returned
  // Scenario D: GET /api/users/999 — user does not exist
  // Scenario E: POST /api/users — request body has invalid JSON
  // Scenario F: GET /api/admin — user is logged in but not an admin
  // Scenario G: GET /api/data — server threw an unhandled exception
  // Scenario H: PUT /api/users/42 — successful update, returns updated user

  return {
    A: 0, // TODO: Replace with correct status code
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
  };
}

// Tests:
// assert(exercise1_predictStatusCodes().A === 200);
// assert(exercise1_predictStatusCodes().B === 201);
// assert(exercise1_predictStatusCodes().C === 204);
// assert(exercise1_predictStatusCodes().D === 404);
// assert(exercise1_predictStatusCodes().E === 400);
// assert(exercise1_predictStatusCodes().F === 403);
// assert(exercise1_predictStatusCodes().G === 500);
// assert(exercise1_predictStatusCodes().H === 200);

// ============================================================================
// EXERCISE 2 (Predict): HTTP Method Selection
// Which HTTP method is correct for each operation?
// ============================================================================

function exercise2_predictMethods(): Record<string, HttpMethod> {
  // Which HTTP method should be used for each operation?
  //
  // A: Fetch a list of blog posts
  // B: Submit a new blog post
  // C: Update only the title of a blog post
  // D: Replace the entire blog post with new content
  // E: Remove a blog post
  // F: Check if a large file exists before downloading

  return {
    A: "GET",    // TODO: verify or change
    B: "GET",    // TODO
    C: "GET",    // TODO
    D: "GET",    // TODO
    E: "GET",    // TODO
    F: "GET",    // TODO
  };
}

// Tests:
// assert(exercise2_predictMethods().A === "GET");
// assert(exercise2_predictMethods().B === "POST");
// assert(exercise2_predictMethods().C === "PATCH");
// assert(exercise2_predictMethods().D === "PUT");
// assert(exercise2_predictMethods().E === "DELETE");
// assert(exercise2_predictMethods().F === "HEAD");

// ============================================================================
// EXERCISE 3 (Predict): What Headers Are Sent?
// Given a fetch() call, predict what headers the browser sends.
// ============================================================================

function exercise3_predictHeaders(): Record<string, string[]> {
  // For each fetch() call, list the key request headers that will be sent:
  //
  // Call A:
  //   fetch('/api/data')
  //
  // Call B:
  //   fetch('/api/data', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ x: 1 })
  //   })
  //
  // Call C:
  //   fetch('https://other-domain.com/api/data', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
  //     body: JSON.stringify({ x: 1 })
  //   })
  //   (What extra request does the browser send first?)

  return {
    A: [],  // TODO: list key headers for call A
    B: [],  // TODO: list key headers for call B
    C: [],  // TODO: what extra request/headers? (hint: preflight)
  };
}

// Tests:
// Call A sends at minimum: Accept header
// Call B sends: Content-Type, Accept
// Call C triggers a preflight OPTIONS with: Access-Control-Request-Method, Access-Control-Request-Headers, Origin

// ============================================================================
// EXERCISE 4 (Predict): Cookie Behavior
// Given Set-Cookie headers, predict which cookies are accessible via JS.
// ============================================================================

function exercise4_predictCookieAccess(): Record<string, boolean> {
  // The server sends these Set-Cookie headers:
  //
  // Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
  // Set-Cookie: theme=dark; Path=/; SameSite=Lax
  // Set-Cookie: tracking=xyz; Secure; SameSite=None
  //
  // Can document.cookie read each cookie?

  return {
    session: true,   // TODO: can JS read this?
    theme: true,     // TODO: can JS read this?
    tracking: true,  // TODO: can JS read this?
  };
}

// Tests:
// assert(exercise4_predictCookieAccess().session === false);  // HttpOnly blocks JS access
// assert(exercise4_predictCookieAccess().theme === true);     // No HttpOnly, JS can read
// assert(exercise4_predictCookieAccess().tracking === true);  // No HttpOnly, JS can read

// ============================================================================
// EXERCISE 5 (Predict): HTTP/2 vs HTTP/1.1 Performance
// Predict which version loads faster in each scenario.
// ============================================================================

function exercise5_predictPerformance(): Record<string, "HTTP/1.1" | "HTTP/2"> {
  // Which protocol version performs better in each scenario?
  //
  // Scenario A: Loading a page that needs 50 small JavaScript files
  // Scenario B: Downloading a single 500MB file
  // Scenario C: A page making 20 API calls simultaneously
  // Scenario D: A page with repeated identical headers across many requests

  return {
    A: "HTTP/1.1", // TODO
    B: "HTTP/1.1", // TODO
    C: "HTTP/1.1", // TODO
    D: "HTTP/1.1", // TODO
  };
}

// Tests:
// assert(exercise5_predictPerformance().A === "HTTP/2");   // Multiplexing handles many small files
// assert(exercise5_predictPerformance().B === "HTTP/1.1"); // Single file — no multiplexing benefit
// assert(exercise5_predictPerformance().C === "HTTP/2");   // Multiplexing handles concurrent requests
// assert(exercise5_predictPerformance().D === "HTTP/2");   // HPACK header compression

// ============================================================================
// EXERCISE 6 (Predict): Redirect Behavior
// Predict what happens with different redirect status codes.
// ============================================================================

function exercise6_predictRedirects(): Record<string, { method: string; cached: boolean }> {
  // Original request: POST /api/old-endpoint with body
  // Server responds with a redirect to /api/new-endpoint
  //
  // What method does the redirected request use, and is the redirect cached?
  //
  // A: Server responds with 301
  // B: Server responds with 302
  // C: Server responds with 307
  // D: Server responds with 308

  return {
    A: { method: "", cached: false }, // TODO
    B: { method: "", cached: false }, // TODO
    C: { method: "", cached: false }, // TODO
    D: { method: "", cached: false }, // TODO
  };
}

// Tests:
// 301: method may change to GET, redirect is cached permanently
// 302: method may change to GET, not cached
// 307: method preserved (POST), not cached
// 308: method preserved (POST), cached permanently

// ============================================================================
// EXERCISE 7 (Fix): Broken Fetch Call — Missing Headers
// ============================================================================

function exercise7_fixFetch(): { headers: Record<string, string>; body: string } {
  // This fetch configuration is sending JSON but the server returns 400 Bad Request.
  // Fix the issue.

  const data = { username: "alice", password: "secret123" };

  return {
    headers: {
      // BUG: Missing Content-Type header — server doesn't know the body is JSON
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  };
}

// Tests:
// const result = exercise7_fixFetch();
// assert(result.headers["Content-Type"] === "application/json");
// assert(result.headers["Accept"] === "application/json");

// ============================================================================
// EXERCISE 8 (Fix): Broken Cookie Parser
// ============================================================================

function exercise8_fixCookieParser(cookieHeader: string): Record<string, string> {
  // This cookie parser is broken. It should parse "name1=value1; name2=value2"
  // into { name1: "value1", name2: "value2" }.
  // Find and fix the bugs.

  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(","); // BUG 1: Wrong delimiter
  for (const pair of pairs) {
    const [name, value] = pair.split("=");
    cookies[name] = value; // BUG 2: Not trimming whitespace
  }
  return cookies;
}

// Tests:
// const cookies = exercise8_fixCookieParser("session=abc123; theme=dark; lang=en");
// assert(cookies["session"] === "abc123");
// assert(cookies["theme"] === "dark");
// assert(cookies["lang"] === "en");

// ============================================================================
// EXERCISE 9 (Fix): Broken Status Code Check
// ============================================================================

function exercise9_fixStatusCheck(statusCode: number): "success" | "redirect" | "clientError" | "serverError" | "unknown" {
  // This function categorizes HTTP status codes but has bugs.
  // Fix it.

  if (statusCode >= 200 || statusCode < 300) { // BUG: || should be &&
    return "success";
  } else if (statusCode >= 300 && statusCode < 400) {
    return "redirect";
  } else if (statusCode >= 400 && statusCode < 500) {
    return "serverError"; // BUG: Wrong label — 4xx is clientError
  } else if (statusCode >= 500 && statusCode < 600) {
    return "clientError"; // BUG: Wrong label — 5xx is serverError
  }
  return "unknown";
}

// Tests:
// assert(exercise9_fixStatusCheck(200) === "success");
// assert(exercise9_fixStatusCheck(301) === "redirect");
// assert(exercise9_fixStatusCheck(404) === "clientError");
// assert(exercise9_fixStatusCheck(500) === "serverError");
// assert(exercise9_fixStatusCheck(100) === "unknown");

// ============================================================================
// EXERCISE 10 (Fix): Broken Request Builder
// ============================================================================

function exercise10_fixRequestBuilder(
  method: HttpMethod,
  url: string,
  data?: Record<string, unknown>
): { method: string; headers: Record<string, string>; body?: string } {
  // This request builder has issues. Fix them.

  const request: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: {},
  };

  // BUG: Should not send body with GET or HEAD requests
  if (data) {
    request.headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(data);
  }

  return request;
}

// Tests:
// const getReq = exercise10_fixRequestBuilder("GET", "/api/data", { filter: "active" });
// assert(getReq.body === undefined); // GET should not have a body
// const postReq = exercise10_fixRequestBuilder("POST", "/api/data", { name: "test" });
// assert(postReq.body === '{"name":"test"}');
// assert(postReq.headers["Content-Type"] === "application/json");

// ============================================================================
// EXERCISE 11 (Implement): HTTP Request Parser
// ============================================================================

function exercise11_parseHttpRequest(raw: string): ParsedRequest {
  // Parse a raw HTTP request string into its components.
  //
  // Input example:
  // "GET /api/users HTTP/1.1\r\nHost: example.com\r\nAccept: application/json\r\n\r\n"
  //
  // With body:
  // "POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{\"name\":\"Alice\"}"

  // TODO: Implement
  return {
    method: "",
    path: "",
    httpVersion: "",
    headers: {},
    body: "",
  };
}

// Tests:
// const req1 = exercise11_parseHttpRequest("GET /api/users HTTP/1.1\r\nHost: example.com\r\nAccept: application/json\r\n\r\n");
// assert(req1.method === "GET");
// assert(req1.path === "/api/users");
// assert(req1.httpVersion === "HTTP/1.1");
// assert(req1.headers["Host"] === "example.com");
// assert(req1.headers["Accept"] === "application/json");
// assert(req1.body === "");
//
// const req2 = exercise11_parseHttpRequest("POST /api/users HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{\"name\":\"Alice\"}");
// assert(req2.method === "POST");
// assert(req2.body === "{\"name\":\"Alice\"}");

// ============================================================================
// EXERCISE 12 (Implement): HTTP Response Builder
// ============================================================================

function exercise12_buildHttpResponse(response: HttpResponse): string {
  // Build a raw HTTP response string from an HttpResponse object.
  //
  // Output format:
  // "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"data\":\"hello\"}"

  // TODO: Implement
  return "";
}

// Tests:
// const raw = exercise12_buildHttpResponse({
//   statusCode: 200,
//   statusText: "OK",
//   headers: { "Content-Type": "application/json" },
//   body: '{"data":"hello"}'
// });
// assert(raw === "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"data\":\"hello\"}");
//
// const noBody = exercise12_buildHttpResponse({
//   statusCode: 204,
//   statusText: "No Content",
//   headers: {},
// });
// assert(noBody === "HTTP/1.1 204 No Content\r\n\r\n");

// ============================================================================
// EXERCISE 13 (Implement): Simple Router Dispatcher
// ============================================================================

function exercise13_createRouter(): {
  addRoute: (method: HttpMethod, path: string, handler: Route["handler"]) => void;
  dispatch: (req: HttpRequest) => HttpResponse;
} {
  // Implement a simple router that:
  // 1. Stores routes with addRoute()
  // 2. Matches incoming requests by method + path with dispatch()
  // 3. Returns 404 if no route matches
  // 4. Returns 405 if path matches but method doesn't

  // TODO: Implement
  return {
    addRoute: (_method, _path, _handler) => {},
    dispatch: (_req) => ({
      statusCode: 404,
      statusText: "Not Found",
      headers: {},
      body: "Not Found",
    }),
  };
}

// Tests:
// const router = exercise13_createRouter();
// router.addRoute("GET", "/users", () => ({
//   statusCode: 200, statusText: "OK",
//   headers: { "Content-Type": "application/json" },
//   body: '[{"id":1}]'
// }));
// router.addRoute("POST", "/users", (req) => ({
//   statusCode: 201, statusText: "Created",
//   headers: { "Content-Type": "application/json" },
//   body: req.body ?? ""
// }));
//
// const res1 = router.dispatch({ method: "GET", path: "/users", headers: {} });
// assert(res1.statusCode === 200);
//
// const res2 = router.dispatch({ method: "POST", path: "/users", headers: {}, body: '{"name":"Alice"}' });
// assert(res2.statusCode === 201);
//
// const res3 = router.dispatch({ method: "GET", path: "/unknown", headers: {} });
// assert(res3.statusCode === 404);
//
// const res4 = router.dispatch({ method: "DELETE", path: "/users", headers: {} });
// assert(res4.statusCode === 405);

// ============================================================================
// EXERCISE 14 (Implement): Cookie Serializer
// ============================================================================

function exercise14_serializeCookie(cookie: Cookie): string {
  // Serialize a Cookie object into a Set-Cookie header string.
  //
  // Example:
  // { name: "session", value: "abc", httpOnly: true, secure: true, sameSite: "Strict", maxAge: 3600 }
  // => "session=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600"

  // TODO: Implement
  return "";
}

// Tests:
// assert(exercise14_serializeCookie({ name: "session", value: "abc" }) === "session=abc");
// assert(exercise14_serializeCookie({
//   name: "session", value: "abc", httpOnly: true, secure: true, sameSite: "Strict", maxAge: 3600
// }) === "session=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600");
// assert(exercise14_serializeCookie({
//   name: "theme", value: "dark", path: "/", domain: ".example.com"
// }) === "theme=dark; Path=/; Domain=.example.com");

// ============================================================================
// EXERCISE 15 (Implement): Cookie Parser (Set-Cookie Header)
// ============================================================================

function exercise15_parseSetCookie(header: string): Cookie {
  // Parse a Set-Cookie header string into a Cookie object.
  //
  // Example:
  // "session=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/; Domain=.example.com"
  // => { name: "session", value: "abc", httpOnly: true, secure: true, sameSite: "Strict", maxAge: 3600, path: "/", domain: ".example.com" }

  // TODO: Implement
  return { name: "", value: "" };
}

// Tests:
// const c1 = exercise15_parseSetCookie("session=abc; HttpOnly; Secure; SameSite=Strict; Max-Age=3600");
// assert(c1.name === "session");
// assert(c1.value === "abc");
// assert(c1.httpOnly === true);
// assert(c1.secure === true);
// assert(c1.sameSite === "Strict");
// assert(c1.maxAge === 3600);
//
// const c2 = exercise15_parseSetCookie("theme=dark");
// assert(c2.name === "theme");
// assert(c2.value === "dark");
// assert(c2.httpOnly === undefined);

// ============================================================================
// EXERCISE 16 (Implement): Query String Parser & Builder
// ============================================================================

function exercise16_parseQueryString(queryString: string): Record<string, string> {
  // Parse a URL query string into key-value pairs.
  // Input: "?name=Alice&age=30&city=New%20York" or "name=Alice&age=30"
  // Output: { name: "Alice", age: "30", city: "New York" }

  // TODO: Implement
  return {};
}

function exercise16_buildQueryString(params: Record<string, string>): string {
  // Build a query string from key-value pairs.
  // Input: { name: "Alice", age: "30", city: "New York" }
  // Output: "name=Alice&age=30&city=New%20York"

  // TODO: Implement
  return "";
}

// Tests:
// assert(exercise16_parseQueryString("?name=Alice&age=30").name === "Alice");
// assert(exercise16_parseQueryString("name=Alice&age=30").age === "30");
// assert(exercise16_parseQueryString("city=New%20York").city === "New York");
// assert(exercise16_buildQueryString({ name: "Alice", age: "30" }) === "name=Alice&age=30");

// ============================================================================
// EXERCISE 17 (Implement): Cache-Control Header Parser
// ============================================================================

function exercise17_parseCacheControl(header: string): CacheControlDirectives {
  // Parse a Cache-Control header string into structured directives.
  //
  // "public, max-age=31536000, immutable"
  // => { public: true, maxAge: 31536000, immutable: true }
  //
  // "no-cache, no-store, must-revalidate"
  // => { noCache: true, noStore: true, mustRevalidate: true }

  // TODO: Implement
  return {};
}

// Tests:
// const cc1 = exercise17_parseCacheControl("public, max-age=31536000, immutable");
// assert(cc1.public === true);
// assert(cc1.maxAge === 31536000);
// assert(cc1.immutable === true);
//
// const cc2 = exercise17_parseCacheControl("no-cache, no-store, must-revalidate");
// assert(cc2.noCache === true);
// assert(cc2.noStore === true);
// assert(cc2.mustRevalidate === true);
//
// const cc3 = exercise17_parseCacheControl("private, max-age=0, must-revalidate");
// assert(cc3.private === true);
// assert(cc3.maxAge === 0);

// ============================================================================
// EXERCISE 18 (Implement): Content Negotiation
// ============================================================================

function exercise18_negotiate(
  acceptHeader: string,
  available: string[]
): string | null {
  // Implement content negotiation based on the Accept header.
  //
  // Parse the Accept header (e.g., "text/html, application/json;q=0.9, */*;q=0.1")
  // and return the best match from the available types.
  //
  // Rules:
  // 1. Higher q value = higher priority (default q=1)
  // 2. More specific types beat wildcards
  // 3. Return null if no match found (and no wildcard)
  //
  // "application/json, text/html;q=0.9", ["text/html", "application/json"]
  // => "application/json" (q=1 beats q=0.9)

  // TODO: Implement
  return null;
}

// Tests:
// assert(exercise18_negotiate("application/json", ["application/json", "text/html"]) === "application/json");
// assert(exercise18_negotiate("text/html, application/json;q=0.9", ["application/json", "text/html"]) === "text/html");
// assert(exercise18_negotiate("application/xml", ["application/json"]) === null);
// assert(exercise18_negotiate("*/*", ["application/json"]) === "application/json");
// assert(exercise18_negotiate("text/html;q=0.5, application/json;q=0.9", ["text/html", "application/json"]) === "application/json");

// ============================================================================
// RUNNER
// ============================================================================

console.log("=== HTTP Protocol Exercises ===\n");

console.log("Exercise 1 (Predict - Status Codes):", exercise1_predictStatusCodes());
console.log("Exercise 2 (Predict - Methods):", exercise2_predictMethods());
console.log("Exercise 3 (Predict - Headers):", exercise3_predictHeaders());
console.log("Exercise 4 (Predict - Cookies):", exercise4_predictCookieAccess());
console.log("Exercise 5 (Predict - HTTP/2 vs 1.1):", exercise5_predictPerformance());
console.log("Exercise 6 (Predict - Redirects):", exercise6_predictRedirects());
console.log("Exercise 7 (Fix - Fetch):", exercise7_fixFetch());
console.log("Exercise 8 (Fix - Cookie Parser):", exercise8_fixCookieParser("session=abc123; theme=dark; lang=en"));
console.log("Exercise 9 (Fix - Status Check):", exercise9_fixStatusCheck(200), exercise9_fixStatusCheck(404));
console.log("Exercise 10 (Fix - Request Builder):", exercise10_fixRequestBuilder("GET", "/api", { x: 1 }));
console.log("Exercise 11 (Implement - Parse Request):", exercise11_parseHttpRequest("GET /api HTTP/1.1\r\nHost: example.com\r\n\r\n"));
console.log("Exercise 12 (Implement - Build Response):", exercise12_buildHttpResponse({ statusCode: 200, statusText: "OK", headers: {}, body: "hi" }));
console.log("Exercise 13 (Implement - Router):", exercise13_createRouter());
console.log("Exercise 14 (Implement - Cookie Serializer):", exercise14_serializeCookie({ name: "test", value: "123" }));
console.log("Exercise 15 (Implement - Parse Set-Cookie):", exercise15_parseSetCookie("test=123; HttpOnly"));
console.log("Exercise 16 (Implement - Query String):", exercise16_parseQueryString("?a=1&b=2"), exercise16_buildQueryString({ a: "1" }));
console.log("Exercise 17 (Implement - Cache-Control):", exercise17_parseCacheControl("max-age=3600"));
console.log("Exercise 18 (Implement - Content Negotiation):", exercise18_negotiate("application/json", ["application/json"]));

console.log("\nDone! Implement the TODOs and check against solutions.ts");
