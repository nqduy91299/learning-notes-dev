// ============================================================================
// Web Security Fundamentals — Exercises
// ============================================================================
// Run: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// Exercise 1 (Predict): Identify XSS Type
// ============================================================================
// What type of XSS vulnerability does each code snippet represent?
// For each, state: "stored", "reflected", or "dom-based"

function exercise1(): { a: string; b: string; c: string } {
  // Snippet A:
  // Server code:
  //   app.get('/search', (req, res) => {
  //     res.send(`<p>Results for: ${req.query.q}</p>`);
  //   });

  // Snippet B:
  //   document.getElementById('name').innerHTML = window.location.hash.slice(1);

  // Snippet C:
  //   app.get('/profile/:id', (req, res) => {
  //     const user = db.getUser(req.params.id);
  //     res.send(`<h1>${user.bio}</h1>`); // bio was set by the user earlier
  //   });

  return {
    a: "", // What type of XSS?
    b: "", // What type of XSS?
    c: "", // What type of XSS?
  };
}

// console.log("Exercise 1:", exercise1());

// ============================================================================
// Exercise 2 (Implement): HTML Entity Encoder
// ============================================================================
// Implement a function that encodes the 5 critical HTML entities to prevent XSS
// when inserting text into HTML context.
// & → &amp;   < → &lt;   > → &gt;   " → &quot;   ' → &#x27;

function exercise2_encodeHTML(input: string): string {
  // Your implementation here
  return input;
}

// console.log(exercise2_encodeHTML('<script>alert("xss")</script>'));
// Expected: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
// console.log(exercise2_encodeHTML("it's a <b>test</b> & \"demo\""));
// Expected: it&#x27;s a &lt;b&gt;test&lt;/b&gt; &amp; &quot;demo&quot;

// ============================================================================
// Exercise 3 (Implement): HTML Tag Sanitizer
// ============================================================================
// Implement a function that removes all HTML tags except a whitelist of safe tags.
// Safe tags: b, i, em, strong, p, br, ul, ol, li
// Remove all attributes from allowed tags.
// Remove disallowed tags and their content for: script, style, iframe
// For other disallowed tags, remove the tag but keep the text content.

interface SanitizerConfig {
  allowedTags: string[];
  stripWithContent: string[];
}

const DEFAULT_CONFIG: SanitizerConfig = {
  allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  stripWithContent: ["script", "style", "iframe"],
};

function exercise3_sanitizeHTML(
  input: string,
  config: SanitizerConfig = DEFAULT_CONFIG
): string {
  // Your implementation here
  return input;
}

// console.log(exercise3_sanitizeHTML('<p class="x">Hello</p><script>alert(1)</script>'));
// Expected: <p>Hello</p>
// console.log(exercise3_sanitizeHTML('<b>Bold</b><div>Content</div><iframe src="x"></iframe>'));
// Expected: <b>Bold</b>Content
// console.log(exercise3_sanitizeHTML('<em>Hi</em><style>.x{color:red}</style><span>Text</span>'));
// Expected: <em>Hi</em>Text

// ============================================================================
// Exercise 4 (Predict): CSRF Attack Outcomes
// ============================================================================
// For each scenario, predict whether the CSRF attack succeeds or fails and why.

function exercise4(): { a: string; b: string; c: string } {
  // Scenario A:
  // - User is logged into bank.com
  // - bank.com sets: Set-Cookie: session=abc; SameSite=None; Secure
  // - User visits evil.com which has: <form action="https://bank.com/transfer" method="POST">
  //   <input name="to" value="attacker"><input name="amount" value="1000">
  //   </form><script>document.forms[0].submit()</script>
  // Does the CSRF attack succeed?

  // Scenario B:
  // - Same as A, but cookie is: Set-Cookie: session=abc; SameSite=Lax
  // Does the CSRF attack succeed?

  // Scenario C:
  // - Same as A (SameSite=None), but bank.com checks:
  //   if (req.headers.origin !== 'https://bank.com') return 403;
  // Does the CSRF attack succeed?

  return {
    a: "", // Succeeds or fails? Why?
    b: "", // Succeeds or fails? Why?
    c: "", // Succeeds or fails? Why?
  };
}

// console.log("Exercise 4:", exercise4());

// ============================================================================
// Exercise 5 (Implement): CSRF Token Generator & Validator
// ============================================================================
// Implement a CSRF token system with:
// - generateToken(sessionId: string): string — generates a token tied to a session
// - validateToken(sessionId: string, token: string): boolean — validates the token
// Use a Map to store tokens. Tokens should be random hex strings (32 chars).

interface CSRFTokenStore {
  generateToken(sessionId: string): string;
  validateToken(sessionId: string, token: string): boolean;
  revokeToken(sessionId: string): void;
}

function exercise5_createCSRFStore(): CSRFTokenStore {
  // Your implementation here
  return {
    generateToken(_sessionId: string): string {
      return "";
    },
    validateToken(_sessionId: string, _token: string): boolean {
      return false;
    },
    revokeToken(_sessionId: string): void {},
  };
}

// const store = exercise5_createCSRFStore();
// const token = store.generateToken("session123");
// console.log("Token:", token); // 32-char hex string
// console.log("Valid:", store.validateToken("session123", token)); // true
// console.log("Invalid:", store.validateToken("session123", "wrong")); // false
// console.log("Wrong session:", store.validateToken("session456", token)); // false
// store.revokeToken("session123");
// console.log("After revoke:", store.validateToken("session123", token)); // false

// ============================================================================
// Exercise 6 (Predict): CSP Violations
// ============================================================================
// Given this CSP header, predict which resources are blocked and which are allowed.
// Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123';
//   style-src 'self' 'unsafe-inline'; img-src 'self' https://images.example.com;

function exercise6(): {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
} {
  // A: <script src="/app.js"></script>
  // B: <script>alert(1)</script>
  // C: <script nonce="abc123">doStuff()</script>
  // D: <img src="https://evil.com/tracker.png">
  // E: <style>.red { color: red; }</style>

  return {
    a: "", // Allowed or blocked? Why?
    b: "", // Allowed or blocked? Why?
    c: "", // Allowed or blocked? Why?
    d: "", // Allowed or blocked? Why?
    e: "", // Allowed or blocked? Why?
  };
}

// console.log("Exercise 6:", exercise6());

// ============================================================================
// Exercise 7 (Implement): CSP Header Parser
// ============================================================================
// Implement a function that parses a CSP header string into a structured object.
// Each directive becomes a key, and its values become an array of strings.

type CSPDirectives = Map<string, string[]>;

function exercise7_parseCSP(header: string): CSPDirectives {
  // Your implementation here
  return new Map();
}

// const csp = exercise7_parseCSP(
//   "default-src 'self'; script-src 'self' https://cdn.example.com 'nonce-abc'; img-src *"
// );
// console.log(csp.get("default-src")); // ["'self'"]
// console.log(csp.get("script-src")); // ["'self'", "https://cdn.example.com", "'nonce-abc'"]
// console.log(csp.get("img-src")); // ["*"]

// ============================================================================
// Exercise 8 (Implement): CSP Violation Checker
// ============================================================================
// Given parsed CSP directives and a resource request, determine if it's allowed.
// Rules:
// - Check the specific directive for the resource type
// - If no specific directive, fall back to default-src
// - 'self' matches same-origin URLs (assume origin is "https://example.com")
// - 'none' blocks everything
// - 'unsafe-inline' allows inline scripts/styles
// - Specific URLs must match exactly (scheme + host)
// - '*' allows everything

interface ResourceRequest {
  type: "script" | "style" | "img" | "connect" | "font" | "frame";
  source: string; // URL or "inline" or "eval"
}

function exercise8_checkCSP(
  directives: CSPDirectives,
  request: ResourceRequest,
  origin: string
): { allowed: boolean; reason: string } {
  // Your implementation here
  return { allowed: false, reason: "Not implemented" };
}

// const directives = exercise7_parseCSP(
//   "default-src 'self'; script-src 'self' https://cdn.example.com; img-src *"
// );
// console.log(exercise8_checkCSP(directives, { type: "script", source: "https://example.com/app.js" }, "https://example.com"));
// Expected: { allowed: true, reason: "Matched 'self' in script-src" }
// console.log(exercise8_checkCSP(directives, { type: "script", source: "https://evil.com/bad.js" }, "https://example.com"));
// Expected: { allowed: false, reason: "No matching source in script-src" }
// console.log(exercise8_checkCSP(directives, { type: "img", source: "https://anything.com/pic.jpg" }, "https://example.com"));
// Expected: { allowed: true, reason: "Matched * in img-src" }
// console.log(exercise8_checkCSP(directives, { type: "font", source: "https://fonts.com/f.woff" }, "https://example.com"));
// Expected: { allowed: false, reason: "No matching source in default-src (fallback)" }

// ============================================================================
// Exercise 9 (Fix): XSS Vulnerable Search Page
// ============================================================================
// Fix this simulated server-side rendering function to prevent reflected XSS.

function exercise9_renderSearchPage(query: string): string {
  // VULNERABLE — fix this
  return `
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${query}</p>
        <input type="text" value="${query}" name="q">
      </body>
    </html>
  `;
}

// console.log(exercise9_renderSearchPage('<script>alert(1)</script>'));
// The output should NOT contain executable script tags
// console.log(exercise9_renderSearchPage('" onfocus="alert(1)" autofocus="'));
// The output should NOT contain executable event handlers

// ============================================================================
// Exercise 10 (Implement): SRI Hash Calculator
// ============================================================================
// Implement a function that computes the SRI integrity hash for a given content
// string. Use Node.js crypto module. Return format: "sha256-{base64hash}"

import { createHash } from "node:crypto";

function exercise10_computeSRI(
  content: string,
  algorithm: "sha256" | "sha384" | "sha512" = "sha384"
): string {
  // Your implementation here
  void createHash;
  return "";
}

// console.log(exercise10_computeSRI("alert('Hello, world!');", "sha256"));
// Should output: sha256-{base64 hash}
// console.log(exercise10_computeSRI("console.log('test');", "sha384"));
// Should output: sha384-{base64 hash}

// ============================================================================
// Exercise 11 (Predict): Security Header Effects
// ============================================================================
// For each scenario, predict what happens:

function exercise11(): { a: string; b: string; c: string } {
  // Scenario A:
  // Server responds with: X-Content-Type-Options: nosniff
  // Browser receives a file with Content-Type: text/plain
  // The file contains: <script>alert(1)</script>
  // A <script> tag references this file.
  // What happens?

  // Scenario B:
  // Server responds with: Strict-Transport-Security: max-age=31536000
  // User types http://example.com in the browser 6 months later.
  // What happens?

  // Scenario C:
  // Server responds with NO X-Frame-Options or frame-ancestors CSP.
  // Attacker creates a page with: <iframe src="https://example.com/settings">
  // What happens?

  return {
    a: "", // What happens?
    b: "", // What happens?
    c: "", // What happens?
  };
}

// console.log("Exercise 11:", exercise11());

// ============================================================================
// Exercise 12 (Fix): Insecure Cookie Settings
// ============================================================================
// Fix this function that generates Set-Cookie headers for a session cookie.
// Make it secure against XSS cookie theft, CSRF, and man-in-the-middle attacks.

interface CookieOptions {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
  domain: string;
}

function exercise12_createSessionCookie(
  sessionId: string,
  domain: string
): CookieOptions {
  // VULNERABLE — fix these options
  return {
    name: "session",
    value: sessionId,
    maxAge: 999999999, // Too long
    path: "/",
    httpOnly: false, // Accessible to JavaScript!
    secure: false, // Sent over HTTP!
    sameSite: "None", // No CSRF protection!
    domain: domain,
  };
}

// console.log(exercise12_createSessionCookie("abc123", "example.com"));

// ============================================================================
// Exercise 13 (Implement): URL Validator for Open Redirect Prevention
// ============================================================================
// Implement a function that validates redirect URLs to prevent open redirects.
// Rules:
// - Allow relative paths (starting with /)
// - Allow URLs on the same domain
// - Reject URLs to different domains
// - Reject javascript: and data: URLs
// - Return the safe URL or "/" as default

function exercise13_validateRedirectURL(
  url: string,
  allowedDomain: string
): string {
  // Your implementation here
  return "/";
}

// console.log(exercise13_validateRedirectURL("/dashboard", "example.com")); // "/dashboard"
// console.log(exercise13_validateRedirectURL("https://example.com/profile", "example.com")); // "https://example.com/profile"
// console.log(exercise13_validateRedirectURL("https://evil.com", "example.com")); // "/"
// console.log(exercise13_validateRedirectURL("javascript:alert(1)", "example.com")); // "/"
// console.log(exercise13_validateRedirectURL("//evil.com", "example.com")); // "/"
// console.log(exercise13_validateRedirectURL("data:text/html,<script>alert(1)</script>", "example.com")); // "/"

// ============================================================================
// Exercise 14 (Predict): SQL Injection
// ============================================================================
// Given this vulnerable code, what does the resulting SQL query look like
// for each input? What data does it return?

function exercise14(): { a: string; b: string; c: string } {
  // Code:
  //   const query = `SELECT * FROM users WHERE username = '${input}' AND password = '${password}'`;

  // Input A: username = "admin", password = "password123"
  // Input B: username = "admin'--", password = "anything"
  // Input C: username = "' OR '1'='1", password = "' OR '1'='1"

  return {
    a: "", // Resulting query and what it returns
    b: "", // Resulting query and what it returns
    c: "", // Resulting query and what it returns
  };
}

// console.log("Exercise 14:", exercise14());

// ============================================================================
// Exercise 15 (Fix): DOM-Based XSS
// ============================================================================
// Fix this function that renders a user profile. It's vulnerable to DOM-based XSS.

interface UserProfile {
  name: string;
  bio: string;
  website: string;
}

function exercise15_renderProfile(profile: UserProfile): string {
  // VULNERABLE — fix this
  return `
    <div class="profile">
      <h2>${profile.name}</h2>
      <p>${profile.bio}</p>
      <a href="${profile.website}">Website</a>
    </div>
  `;
}

// const malicious: UserProfile = {
//   name: '<img src=x onerror=alert("name")>',
//   bio: '<script>alert("bio")</script>',
//   website: 'javascript:alert("website")',
// };
// console.log(exercise15_renderProfile(malicious));
// Output should be safe — no executable scripts or event handlers

// ============================================================================
// Exercise 16 (Implement): Security Headers Validator
// ============================================================================
// Implement a function that checks HTTP response headers against a security
// checklist and returns a report of missing or misconfigured headers.

interface SecurityHeaderReport {
  score: number; // 0-100
  headers: {
    name: string;
    status: "present" | "missing" | "misconfigured";
    value?: string;
    recommendation: string;
  }[];
}

function exercise16_validateSecurityHeaders(
  headers: Record<string, string>
): SecurityHeaderReport {
  // Check for these headers:
  // 1. Content-Security-Policy (present)
  // 2. X-Content-Type-Options (must be "nosniff")
  // 3. X-Frame-Options (must be "DENY" or "SAMEORIGIN")
  // 4. Strict-Transport-Security (must have max-age >= 31536000)
  // 5. Referrer-Policy (present)
  // 6. Permissions-Policy (present)
  //
  // Score: each correct header = ~16.67 points (100 / 6)
  // Return rounded score.

  void headers;
  return { score: 0, headers: [] };
}

// console.log(exercise16_validateSecurityHeaders({
//   "content-security-policy": "default-src 'self'",
//   "x-content-type-options": "nosniff",
//   "x-frame-options": "DENY",
//   "strict-transport-security": "max-age=31536000; includeSubDomains",
//   "referrer-policy": "strict-origin-when-cross-origin",
//   "permissions-policy": "camera=(), microphone=()",
// }));
// Expected: score 100, all headers "present"

// console.log(exercise16_validateSecurityHeaders({
//   "x-content-type-options": "nosniff",
// }));
// Expected: score ~17, most headers "missing"

// ============================================================================
// Exercise 17 (Fix): Insecure Form Handling
// ============================================================================
// Fix this form handler to prevent CSRF and XSS.
// The function simulates processing a form submission.

interface FormSubmission {
  csrfToken: string;
  comment: string;
  email: string;
}

interface FormResult {
  success: boolean;
  message: string;
  sanitizedComment: string;
}

function exercise17_processForm(
  submission: FormSubmission,
  _validCsrfToken: string
): FormResult {
  // VULNERABLE — fix this function
  // Issues:
  // 1. Doesn't validate CSRF token
  // 2. Doesn't sanitize comment (could contain XSS)
  // 3. Doesn't validate email format

  return {
    success: true,
    message: `Comment posted by ${submission.email}`,
    sanitizedComment: submission.comment, // Not sanitized!
  };
}

// console.log(exercise17_processForm(
//   { csrfToken: "valid-token", comment: "<script>alert(1)</script>Nice post!", email: "user@example.com" },
//   "valid-token"
// ));
// Expected: success true, comment sanitized, email validated
// console.log(exercise17_processForm(
//   { csrfToken: "wrong-token", comment: "Hello", email: "user@example.com" },
//   "valid-token"
// ));
// Expected: success false, CSRF token mismatch

// ============================================================================
// Exercise 18 (Implement): SRI Tag Generator
// ============================================================================
// Implement a function that generates a complete <script> or <link> tag
// with SRI integrity attribute.

interface SRITag {
  tag: string;
  integrity: string;
}

function exercise18_generateSRITag(
  url: string,
  content: string,
  type: "script" | "stylesheet",
  algorithm: "sha256" | "sha384" | "sha512" = "sha384"
): SRITag {
  // Generate the integrity hash from content
  // Return the complete HTML tag and the integrity value
  // For script: <script src="..." integrity="..." crossorigin="anonymous"></script>
  // For stylesheet: <link rel="stylesheet" href="..." integrity="..." crossorigin="anonymous">

  void url;
  void content;
  void type;
  void algorithm;
  return { tag: "", integrity: "" };
}

// console.log(exercise18_generateSRITag(
//   "https://cdn.example.com/lib.js",
//   "console.log('hello');",
//   "script",
//   "sha256"
// ));
// Expected: {
//   tag: '<script src="https://cdn.example.com/lib.js" integrity="sha256-..." crossorigin="anonymous"></script>',
//   integrity: 'sha256-...'
// }

export {
  exercise1,
  exercise2_encodeHTML,
  exercise3_sanitizeHTML,
  exercise4,
  exercise5_createCSRFStore,
  exercise6,
  exercise7_parseCSP,
  exercise8_checkCSP,
  exercise9_renderSearchPage,
  exercise10_computeSRI,
  exercise11,
  exercise12_createSessionCookie,
  exercise13_validateRedirectURL,
  exercise14,
  exercise15_renderProfile,
  exercise16_validateSecurityHeaders,
  exercise17_processForm,
  exercise18_generateSRITag,
};

console.log("Web Security Fundamentals — Exercises loaded.");
console.log("Uncomment the test calls to verify your solutions.");
