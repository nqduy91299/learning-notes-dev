// ============================================================================
// Web Security Fundamentals — Solutions
// ============================================================================
// Run: npx tsx solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

import { createHash } from "node:crypto";

// ============================================================================
// Exercise 1 (Predict): Identify XSS Type
// ============================================================================

function exercise1(): { a: string; b: string; c: string } {
  return {
    a: "reflected — user input (query param) is immediately reflected in the response",
    b: "dom-based — client JS reads window.location.hash and writes to innerHTML; server never sees the payload",
    c: "stored — user.bio was previously stored in the database and is rendered to other users",
  };
}

// ============================================================================
// Exercise 2 (Implement): HTML Entity Encoder
// ============================================================================

function encodeHTML(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ============================================================================
// Exercise 3 (Implement): HTML Tag Sanitizer
// ============================================================================

interface SanitizerConfig {
  allowedTags: string[];
  stripWithContent: string[];
}

const DEFAULT_CONFIG: SanitizerConfig = {
  allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  stripWithContent: ["script", "style", "iframe"],
};

function sanitizeHTML(
  input: string,
  config: SanitizerConfig = DEFAULT_CONFIG
): string {
  let result = input;

  // First, strip tags that should be removed with their content
  for (const tag of config.stripWithContent) {
    const regex = new RegExp(
      `<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`,
      "gi"
    );
    result = result.replace(regex, "");
    // Also remove self-closing versions
    const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, "gi");
    result = result.replace(selfClosing, "");
  }

  // Then process remaining tags
  result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tagName: string) => {
    const lower = tagName.toLowerCase();
    if (config.allowedTags.includes(lower)) {
      // Keep the tag but strip attributes
      const isClosing = match.startsWith("</");
      const isSelfClosing = lower === "br" || match.endsWith("/>");
      if (isClosing) return `</${lower}>`;
      if (isSelfClosing) return `<${lower}>`;
      return `<${lower}>`;
    }
    // Not allowed — remove tag, keep content (content is already outside the tag match)
    return "";
  });

  return result;
}

// ============================================================================
// Exercise 4 (Predict): CSRF Attack Outcomes
// ============================================================================

function exercise4(): { a: string; b: string; c: string } {
  return {
    a: "Succeeds — SameSite=None means cookies are sent on cross-site requests, so the session cookie is included",
    b: "Fails — SameSite=Lax only sends cookies on top-level navigations with safe methods (GET). A cross-site POST form submission does not include the cookie",
    c: "Fails — even though the cookie is sent (SameSite=None), the server checks the Origin header which will be 'https://evil.com' and rejects the request",
  };
}

// ============================================================================
// Exercise 5 (Implement): CSRF Token Generator & Validator
// ============================================================================

import { randomBytes } from "node:crypto";

interface CSRFTokenStore {
  generateToken(sessionId: string): string;
  validateToken(sessionId: string, token: string): boolean;
  revokeToken(sessionId: string): void;
}

function createCSRFStore(): CSRFTokenStore {
  const tokens = new Map<string, string>();

  return {
    generateToken(sessionId: string): string {
      const token = randomBytes(16).toString("hex"); // 32 hex chars
      tokens.set(sessionId, token);
      return token;
    },
    validateToken(sessionId: string, token: string): boolean {
      const stored = tokens.get(sessionId);
      if (!stored || stored !== token) return false;
      // Use timing-safe comparison in production
      return stored === token;
    },
    revokeToken(sessionId: string): void {
      tokens.delete(sessionId);
    },
  };
}

// ============================================================================
// Exercise 6 (Predict): CSP Violations
// ============================================================================

function exercise6(): {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
} {
  return {
    a: "Allowed — /app.js is from 'self' which is permitted by script-src 'self'",
    b: "Blocked — inline script without a nonce. script-src requires 'nonce-abc123' for inline scripts",
    c: "Allowed — inline script with the correct nonce 'abc123' matching script-src 'nonce-abc123'",
    d: "Blocked — https://evil.com is not in img-src which only allows 'self' and https://images.example.com",
    e: "Allowed — inline style is permitted by style-src 'unsafe-inline'",
  };
}

// ============================================================================
// Exercise 7 (Implement): CSP Header Parser
// ============================================================================

type CSPDirectives = Map<string, string[]>;

function parseCSP(header: string): CSPDirectives {
  const directives: CSPDirectives = new Map();
  const parts = header.split(";").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const tokens = part.split(/\s+/);
    const name = tokens[0];
    const values = tokens.slice(1);
    directives.set(name, values);
  }

  return directives;
}

// ============================================================================
// Exercise 8 (Implement): CSP Violation Checker
// ============================================================================

interface ResourceRequest {
  type: "script" | "style" | "img" | "connect" | "font" | "frame";
  source: string;
}

function checkCSP(
  directives: CSPDirectives,
  request: ResourceRequest,
  origin: string
): { allowed: boolean; reason: string } {
  const directiveMap: Record<string, string> = {
    script: "script-src",
    style: "style-src",
    img: "img-src",
    connect: "connect-src",
    font: "font-src",
    frame: "frame-src",
  };

  const specificDirective = directiveMap[request.type];
  let sources = directives.get(specificDirective);
  let usedDirective = specificDirective;
  let isFallback = false;

  if (!sources) {
    sources = directives.get("default-src");
    usedDirective = "default-src";
    isFallback = true;
  }

  if (!sources) {
    return { allowed: true, reason: "No applicable directive found — allowed by default" };
  }

  if (sources.includes("'none'")) {
    return {
      allowed: false,
      reason: `Blocked by 'none' in ${usedDirective}${isFallback ? " (fallback)" : ""}`,
    };
  }

  if (sources.includes("*")) {
    return {
      allowed: true,
      reason: `Matched * in ${usedDirective}${isFallback ? " (fallback)" : ""}`,
    };
  }

  // Check 'self'
  if (sources.includes("'self'")) {
    try {
      const sourceOrigin = new URL(request.source).origin;
      if (sourceOrigin === origin) {
        return {
          allowed: true,
          reason: `Matched 'self' in ${usedDirective}${isFallback ? " (fallback)" : ""}`,
        };
      }
    } catch {
      // not a valid URL
    }
  }

  // Check 'unsafe-inline'
  if (sources.includes("'unsafe-inline'") && request.source === "inline") {
    return {
      allowed: true,
      reason: `Matched 'unsafe-inline' in ${usedDirective}${isFallback ? " (fallback)" : ""}`,
    };
  }

  // Check specific URLs
  for (const source of sources) {
    if (source.startsWith("'")) continue; // Skip keywords
    try {
      const allowedOrigin = new URL(source).origin;
      const requestOrigin = new URL(request.source).origin;
      if (allowedOrigin === requestOrigin) {
        return {
          allowed: true,
          reason: `Matched ${source} in ${usedDirective}${isFallback ? " (fallback)" : ""}`,
        };
      }
    } catch {
      // not a valid URL
    }
  }

  return {
    allowed: false,
    reason: `No matching source in ${usedDirective}${isFallback ? " (fallback)" : ""}`,
  };
}

// ============================================================================
// Exercise 9 (Fix): XSS Vulnerable Search Page
// ============================================================================

function renderSearchPage(query: string): string {
  const safe = encodeHTML(query);
  return `
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${safe}</p>
        <input type="text" value="${safe}" name="q">
      </body>
    </html>
  `;
}

// ============================================================================
// Exercise 10 (Implement): SRI Hash Calculator
// ============================================================================

function computeSRI(
  content: string,
  algorithm: "sha256" | "sha384" | "sha512" = "sha384"
): string {
  const hash = createHash(algorithm).update(content, "utf8").digest("base64");
  return `${algorithm}-${hash}`;
}

// ============================================================================
// Exercise 11 (Predict): Security Header Effects
// ============================================================================

function exercise11(): { a: string; b: string; c: string } {
  return {
    a: "Browser refuses to execute the file as JavaScript because X-Content-Type-Options: nosniff prevents MIME sniffing — the Content-Type is text/plain, not application/javascript",
    b: "Browser automatically upgrades to HTTPS. HSTS max-age is 1 year (31536000s), so 6 months later the policy is still active. The browser never makes an HTTP request.",
    c: "The attacker can embed example.com in an iframe — clickjacking is possible. Without X-Frame-Options or frame-ancestors CSP, there's no framing protection.",
  };
}

// ============================================================================
// Exercise 12 (Fix): Insecure Cookie Settings
// ============================================================================

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

function createSessionCookie(
  sessionId: string,
  domain: string
): CookieOptions {
  return {
    name: "__Host-session",      // __Host- prefix for extra security
    value: sessionId,
    maxAge: 3600,                // 1 hour — reasonable session length
    path: "/",
    httpOnly: true,              // Not accessible to JavaScript (prevents XSS cookie theft)
    secure: true,                // Only sent over HTTPS (prevents MITM)
    sameSite: "Lax",             // Prevents CSRF on cross-site POST requests
    domain: domain,
  };
}

// ============================================================================
// Exercise 13 (Implement): URL Validator for Open Redirect Prevention
// ============================================================================

function validateRedirectURL(url: string, allowedDomain: string): string {
  // Reject dangerous schemes
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "/";
  }

  // Reject protocol-relative URLs (//evil.com)
  if (url.startsWith("//")) {
    return "/";
  }

  // Allow relative paths
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  // Check absolute URLs
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === allowedDomain &&
      (parsed.protocol === "https:" || parsed.protocol === "http:")
    ) {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return "/";
}

// ============================================================================
// Exercise 14 (Predict): SQL Injection
// ============================================================================

function exercise14(): { a: string; b: string; c: string } {
  return {
    a: "SELECT * FROM users WHERE username = 'admin' AND password = 'password123' — Normal query. Returns the admin user if password matches.",
    b: "SELECT * FROM users WHERE username = 'admin'--' AND password = 'anything' — The -- comments out the password check. Returns admin regardless of password.",
    c: "SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '' OR '1'='1' — '1'='1' is always true. Returns all users in the table.",
  };
}

// ============================================================================
// Exercise 15 (Fix): DOM-Based XSS
// ============================================================================

interface UserProfile {
  name: string;
  bio: string;
  website: string;
}

function renderProfile(profile: UserProfile): string {
  const safeName = encodeHTML(profile.name);
  const safeBio = encodeHTML(profile.bio);

  // Validate website URL — only allow http/https
  let safeWebsite = "#";
  try {
    const parsed = new URL(profile.website);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      safeWebsite = encodeHTML(profile.website);
    }
  } catch {
    // Invalid URL — use safe default
  }

  return `
    <div class="profile">
      <h2>${safeName}</h2>
      <p>${safeBio}</p>
      <a href="${safeWebsite}">Website</a>
    </div>
  `;
}

// ============================================================================
// Exercise 16 (Implement): Security Headers Validator
// ============================================================================

interface SecurityHeaderReport {
  score: number;
  headers: {
    name: string;
    status: "present" | "missing" | "misconfigured";
    value?: string;
    recommendation: string;
  }[];
}

function validateSecurityHeaders(
  headers: Record<string, string>
): SecurityHeaderReport {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    lower[k.toLowerCase()] = v;
  }

  const checks: SecurityHeaderReport["headers"] = [];
  let passed = 0;

  // 1. Content-Security-Policy
  const csp = lower["content-security-policy"];
  if (csp) {
    checks.push({
      name: "Content-Security-Policy",
      status: "present",
      value: csp,
      recommendation: "Present. Review directives regularly.",
    });
    passed++;
  } else {
    checks.push({
      name: "Content-Security-Policy",
      status: "missing",
      recommendation: "Add a Content-Security-Policy header. Start with: default-src 'self'",
    });
  }

  // 2. X-Content-Type-Options
  const xcto = lower["x-content-type-options"];
  if (xcto === "nosniff") {
    checks.push({
      name: "X-Content-Type-Options",
      status: "present",
      value: xcto,
      recommendation: "Correctly set to nosniff.",
    });
    passed++;
  } else if (xcto) {
    checks.push({
      name: "X-Content-Type-Options",
      status: "misconfigured",
      value: xcto,
      recommendation: "Must be 'nosniff'.",
    });
  } else {
    checks.push({
      name: "X-Content-Type-Options",
      status: "missing",
      recommendation: "Add: X-Content-Type-Options: nosniff",
    });
  }

  // 3. X-Frame-Options
  const xfo = lower["x-frame-options"];
  if (xfo && (xfo.toUpperCase() === "DENY" || xfo.toUpperCase() === "SAMEORIGIN")) {
    checks.push({
      name: "X-Frame-Options",
      status: "present",
      value: xfo,
      recommendation: "Correctly configured.",
    });
    passed++;
  } else if (xfo) {
    checks.push({
      name: "X-Frame-Options",
      status: "misconfigured",
      value: xfo,
      recommendation: "Must be 'DENY' or 'SAMEORIGIN'.",
    });
  } else {
    checks.push({
      name: "X-Frame-Options",
      status: "missing",
      recommendation: "Add: X-Frame-Options: DENY",
    });
  }

  // 4. Strict-Transport-Security
  const hsts = lower["strict-transport-security"];
  if (hsts) {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
    if (maxAge >= 31536000) {
      checks.push({
        name: "Strict-Transport-Security",
        status: "present",
        value: hsts,
        recommendation: "Correctly configured with sufficient max-age.",
      });
      passed++;
    } else {
      checks.push({
        name: "Strict-Transport-Security",
        status: "misconfigured",
        value: hsts,
        recommendation: "max-age should be at least 31536000 (1 year).",
      });
    }
  } else {
    checks.push({
      name: "Strict-Transport-Security",
      status: "missing",
      recommendation: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains",
    });
  }

  // 5. Referrer-Policy
  const rp = lower["referrer-policy"];
  if (rp) {
    checks.push({
      name: "Referrer-Policy",
      status: "present",
      value: rp,
      recommendation: "Present. Recommended: strict-origin-when-cross-origin",
    });
    passed++;
  } else {
    checks.push({
      name: "Referrer-Policy",
      status: "missing",
      recommendation: "Add: Referrer-Policy: strict-origin-when-cross-origin",
    });
  }

  // 6. Permissions-Policy
  const pp = lower["permissions-policy"];
  if (pp) {
    checks.push({
      name: "Permissions-Policy",
      status: "present",
      value: pp,
      recommendation: "Present. Disable unused APIs.",
    });
    passed++;
  } else {
    checks.push({
      name: "Permissions-Policy",
      status: "missing",
      recommendation: "Add: Permissions-Policy: camera=(), microphone=(), geolocation=()",
    });
  }

  const score = Math.round((passed / 6) * 100);

  return { score, headers: checks };
}

// ============================================================================
// Exercise 17 (Fix): Insecure Form Handling
// ============================================================================

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

function processForm(
  submission: FormSubmission,
  validCsrfToken: string
): FormResult {
  // 1. Validate CSRF token
  if (submission.csrfToken !== validCsrfToken) {
    return {
      success: false,
      message: "CSRF token mismatch",
      sanitizedComment: "",
    };
  }

  // 2. Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(submission.email)) {
    return {
      success: false,
      message: "Invalid email address",
      sanitizedComment: "",
    };
  }

  // 3. Sanitize comment — encode HTML entities
  const sanitized = encodeHTML(submission.comment);

  return {
    success: true,
    message: `Comment posted by ${encodeHTML(submission.email)}`,
    sanitizedComment: sanitized,
  };
}

// ============================================================================
// Exercise 18 (Implement): SRI Tag Generator
// ============================================================================

interface SRITag {
  tag: string;
  integrity: string;
}

function generateSRITag(
  url: string,
  content: string,
  type: "script" | "stylesheet",
  algorithm: "sha256" | "sha384" | "sha512" = "sha384"
): SRITag {
  const integrity = computeSRI(content, algorithm);

  let tag: string;
  if (type === "script") {
    tag = `<script src="${encodeHTML(url)}" integrity="${integrity}" crossorigin="anonymous"></script>`;
  } else {
    tag = `<link rel="stylesheet" href="${encodeHTML(url)}" integrity="${integrity}" crossorigin="anonymous">`;
  }

  return { tag, integrity };
}

// ============================================================================
// Runner
// ============================================================================

function runTests(): void {
  console.log("=".repeat(70));
  console.log("Web Security Fundamentals — Solutions");
  console.log("=".repeat(70));

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string): void {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}`);
      failed++;
    }
  }

  // Exercise 1
  console.log("\nExercise 1: Identify XSS Type");
  const ex1 = exercise1();
  assert(ex1.a.includes("reflected"), "Snippet A is reflected XSS");
  assert(ex1.b.includes("dom"), "Snippet B is DOM-based XSS");
  assert(ex1.c.includes("stored"), "Snippet C is stored XSS");

  // Exercise 2
  console.log("\nExercise 2: HTML Entity Encoder");
  assert(
    encodeHTML('<script>alert("xss")</script>') ===
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    "Encodes script tags and quotes"
  );
  assert(
    encodeHTML("it's a <b>test</b> & \"demo\"") ===
      "it&#x27;s a &lt;b&gt;test&lt;/b&gt; &amp; &quot;demo&quot;",
    "Encodes all 5 entities"
  );
  assert(encodeHTML("hello world") === "hello world", "Leaves safe text unchanged");

  // Exercise 3
  console.log("\nExercise 3: HTML Tag Sanitizer");
  assert(
    sanitizeHTML('<p class="x">Hello</p><script>alert(1)</script>') === "<p>Hello</p>",
    "Strips script with content, keeps p without attrs"
  );
  assert(
    sanitizeHTML("<b>Bold</b><div>Content</div><iframe src=\"x\"></iframe>") ===
      "<b>Bold</b>Content",
    "Strips iframe with content, removes div tags keeping text"
  );
  assert(
    sanitizeHTML("<em>Hi</em><style>.x{color:red}</style><span>Text</span>") ===
      "<em>Hi</em>Text",
    "Strips style with content, removes span keeping text"
  );

  // Exercise 4
  console.log("\nExercise 4: CSRF Attack Outcomes");
  const ex4 = exercise4();
  assert(ex4.a.includes("Succeeds"), "SameSite=None allows cross-site requests");
  assert(ex4.b.includes("Fails"), "SameSite=Lax blocks cross-site POST");
  assert(ex4.c.includes("Fails"), "Origin check blocks cross-site requests");

  // Exercise 5
  console.log("\nExercise 5: CSRF Token Store");
  const store = createCSRFStore();
  const token = store.generateToken("session123");
  assert(token.length === 32, "Token is 32 hex characters");
  assert(/^[0-9a-f]+$/.test(token), "Token is hex");
  assert(store.validateToken("session123", token), "Valid token validates");
  assert(!store.validateToken("session123", "wrong"), "Wrong token rejects");
  assert(!store.validateToken("session456", token), "Wrong session rejects");
  store.revokeToken("session123");
  assert(!store.validateToken("session123", token), "Revoked token rejects");

  // Exercise 6
  console.log("\nExercise 6: CSP Violations");
  const ex6 = exercise6();
  assert(ex6.a.includes("Allowed"), "Same-origin script is allowed");
  assert(ex6.b.includes("Blocked"), "Inline script without nonce is blocked");
  assert(ex6.c.includes("Allowed"), "Script with correct nonce is allowed");
  assert(ex6.d.includes("Blocked"), "Image from unauthorized domain is blocked");
  assert(ex6.e.includes("Allowed"), "Inline style with unsafe-inline is allowed");

  // Exercise 7
  console.log("\nExercise 7: CSP Header Parser");
  const csp = parseCSP(
    "default-src 'self'; script-src 'self' https://cdn.example.com 'nonce-abc'; img-src *"
  );
  assert(
    JSON.stringify(csp.get("default-src")) === JSON.stringify(["'self'"]),
    "Parses default-src"
  );
  assert(
    JSON.stringify(csp.get("script-src")) ===
      JSON.stringify(["'self'", "https://cdn.example.com", "'nonce-abc'"]),
    "Parses script-src with multiple values"
  );
  assert(
    JSON.stringify(csp.get("img-src")) === JSON.stringify(["*"]),
    "Parses img-src"
  );

  // Exercise 8
  console.log("\nExercise 8: CSP Violation Checker");
  const dirs = parseCSP(
    "default-src 'self'; script-src 'self' https://cdn.example.com; img-src *"
  );
  const r1 = checkCSP(dirs, { type: "script", source: "https://example.com/app.js" }, "https://example.com");
  assert(r1.allowed === true, "Self-origin script allowed");
  const r2 = checkCSP(dirs, { type: "script", source: "https://evil.com/bad.js" }, "https://example.com");
  assert(r2.allowed === false, "Evil-origin script blocked");
  const r3 = checkCSP(dirs, { type: "img", source: "https://anything.com/pic.jpg" }, "https://example.com");
  assert(r3.allowed === true, "Any image allowed with *");
  const r4 = checkCSP(dirs, { type: "font", source: "https://fonts.com/f.woff" }, "https://example.com");
  assert(r4.allowed === false, "Font falls back to default-src self, rejects external");

  // Exercise 9
  console.log("\nExercise 9: Fix XSS in Search Page");
  const page1 = renderSearchPage('<script>alert(1)</script>');
  assert(!page1.includes("<script>"), "No script tags in output");
  const page2 = renderSearchPage('" onfocus="alert(1)" autofocus="');
  assert(!page2.includes('" onfocus='), "No unescaped attribute breakout in output");

  // Exercise 10
  console.log("\nExercise 10: SRI Hash Calculator");
  const sri = computeSRI("alert('Hello, world!');", "sha256");
  assert(sri.startsWith("sha256-"), "Starts with algorithm prefix");
  assert(sri.length > 10, "Has a hash value");
  const sri2 = computeSRI("console.log('test');", "sha384");
  assert(sri2.startsWith("sha384-"), "sha384 prefix");
  // Same content should produce same hash
  const sri3 = computeSRI("alert('Hello, world!');", "sha256");
  assert(sri === sri3, "Same content produces same hash");

  // Exercise 11
  console.log("\nExercise 11: Security Header Effects");
  const ex11 = exercise11();
  assert(ex11.a.includes("refuses") || ex11.a.includes("nosniff"), "nosniff prevents script execution");
  assert(ex11.b.includes("HTTPS") || ex11.b.includes("upgrades"), "HSTS upgrades to HTTPS");
  assert(ex11.c.includes("iframe") || ex11.c.includes("clickjacking"), "No frame protection = clickjacking");

  // Exercise 12
  console.log("\nExercise 12: Fix Cookie Settings");
  const cookie = createSessionCookie("abc123", "example.com");
  assert(cookie.httpOnly === true, "HttpOnly is true");
  assert(cookie.secure === true, "Secure is true");
  assert(cookie.sameSite === "Lax" || cookie.sameSite === "Strict", "SameSite is Lax or Strict");
  assert(cookie.maxAge <= 86400, "maxAge is reasonable (≤ 24 hours)");

  // Exercise 13
  console.log("\nExercise 13: Open Redirect Prevention");
  assert(validateRedirectURL("/dashboard", "example.com") === "/dashboard", "Allows relative path");
  assert(
    validateRedirectURL("https://example.com/profile", "example.com") ===
      "https://example.com/profile",
    "Allows same domain"
  );
  assert(validateRedirectURL("https://evil.com", "example.com") === "/", "Blocks external domain");
  assert(validateRedirectURL("javascript:alert(1)", "example.com") === "/", "Blocks javascript:");
  assert(validateRedirectURL("//evil.com", "example.com") === "/", "Blocks protocol-relative");
  assert(validateRedirectURL("data:text/html,<script>alert(1)</script>", "example.com") === "/", "Blocks data:");

  // Exercise 14
  console.log("\nExercise 14: SQL Injection");
  const ex14 = exercise14();
  assert(ex14.a.includes("admin") && ex14.a.includes("password123"), "Normal query");
  assert(ex14.b.includes("--"), "Comment-based injection");
  assert(ex14.c.includes("OR") && ex14.c.includes("1"), "OR-based injection");

  // Exercise 15
  console.log("\nExercise 15: Fix Profile Rendering");
  const malicious: UserProfile = {
    name: '<img src=x onerror=alert("name")>',
    bio: '<script>alert("bio")</script>',
    website: 'javascript:alert("website")',
  };
  const rendered = renderProfile(malicious);
  assert(!rendered.includes('<img src=x'), "No unescaped img tags with event handlers");
  assert(!rendered.includes("<script>"), "No script tags");
  assert(!rendered.includes("javascript:"), "No javascript: URLs");

  // Exercise 16
  console.log("\nExercise 16: Security Headers Validator");
  const fullReport = validateSecurityHeaders({
    "content-security-policy": "default-src 'self'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=()",
  });
  assert(fullReport.score === 100, "Full headers = 100 score");
  assert(fullReport.headers.every((h) => h.status === "present"), "All present");

  const partialReport = validateSecurityHeaders({
    "x-content-type-options": "nosniff",
  });
  assert(partialReport.score === 17, "One header = ~17 score");
  assert(partialReport.headers.filter((h) => h.status === "missing").length === 5, "5 missing");

  // Exercise 17
  console.log("\nExercise 17: Secure Form Handling");
  const validResult = processForm(
    { csrfToken: "valid-token", comment: "<script>alert(1)</script>Nice post!", email: "user@example.com" },
    "valid-token"
  );
  assert(validResult.success === true, "Valid submission succeeds");
  assert(!validResult.sanitizedComment.includes("<script>"), "Comment is sanitized");
  const csrfResult = processForm(
    { csrfToken: "wrong-token", comment: "Hello", email: "user@example.com" },
    "valid-token"
  );
  assert(csrfResult.success === false, "Wrong CSRF token fails");
  const emailResult = processForm(
    { csrfToken: "valid-token", comment: "Hello", email: "not-an-email" },
    "valid-token"
  );
  assert(emailResult.success === false, "Invalid email fails");

  // Exercise 18
  console.log("\nExercise 18: SRI Tag Generator");
  const sriTag = generateSRITag(
    "https://cdn.example.com/lib.js",
    "console.log('hello');",
    "script",
    "sha256"
  );
  assert(sriTag.tag.includes("integrity="), "Tag contains integrity attribute");
  assert(sriTag.tag.includes("crossorigin=\"anonymous\""), "Tag contains crossorigin");
  assert(sriTag.tag.startsWith("<script"), "Script tag format");
  assert(sriTag.integrity.startsWith("sha256-"), "Integrity starts with algorithm");

  const cssTag = generateSRITag(
    "https://cdn.example.com/style.css",
    "body { color: red; }",
    "stylesheet",
    "sha384"
  );
  assert(cssTag.tag.includes("<link"), "Stylesheet uses link tag");
  assert(cssTag.tag.includes('rel="stylesheet"'), "Has rel attribute");
  assert(cssTag.integrity.startsWith("sha384-"), "SHA-384 algorithm");

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log("=".repeat(70));
}

runTests();
