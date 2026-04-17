# Authentication & Authorization

## Table of Contents

1. [Authentication vs Authorization](#authentication-vs-authorization)
2. [Session-Based Authentication](#session-based-authentication)
3. [Token-Based Authentication (JWT)](#token-based-authentication-jwt)
4. [JWT Pros and Cons](#jwt-pros-and-cons)
5. [OAuth 2.0](#oauth-20)
6. [OpenID Connect](#openid-connect)
7. [Password Storage](#password-storage)
8. [Multi-Factor Authentication](#multi-factor-authentication)
9. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
10. [Cookie Security](#cookie-security)
11. [Refresh Token Rotation](#refresh-token-rotation)
12. [Token Revocation Strategies](#token-revocation-strategies)

---

## Authentication vs Authorization

| Concept | Question It Answers | Example |
|---------|-------------------|---------|
| **Authentication (AuthN)** | "Who are you?" | Login with username/password |
| **Authorization (AuthZ)** | "What can you do?" | Admin can delete users, regular user cannot |

Authentication always comes first. You must know who someone is before deciding
what they're allowed to do.

```
User → Authenticates (proves identity) → Authorized (granted permissions)
       "I am Alice"                       "Alice can read and write docs"
```

---

## Session-Based Authentication

The traditional approach. The server maintains state about logged-in users.

### Flow

```
1. Client sends credentials (username + password)
2. Server validates credentials against database
3. Server creates a session object, stores it (memory, Redis, DB)
4. Server sends session ID back as a cookie
5. Client includes cookie in every subsequent request
6. Server looks up session by ID to identify the user
7. On logout, server destroys the session
```

```
Client                          Server                    Session Store
  │                               │                           │
  │── POST /login ───────────────►│                           │
  │   {user, pass}                │── create session ────────►│
  │                               │◄── session ID ────────────│
  │◄── Set-Cookie: sid=abc ───────│                           │
  │                               │                           │
  │── GET /dashboard ────────────►│                           │
  │   Cookie: sid=abc             │── lookup session(abc) ───►│
  │                               │◄── {userId, role, ...} ──│
  │◄── 200 OK (dashboard) ───────│                           │
```

### Session Store Options

| Store | Pros | Cons |
|-------|------|------|
| **In-memory** | Fast, simple | Lost on restart, can't scale horizontally |
| **Redis** | Fast, persistent, scalable | Extra infrastructure |
| **Database** | Durable, queryable | Slower, DB load |

### Key Characteristics

- **Stateful** — server must store session data
- **Cookie-based** — session ID travels via cookie
- **Easy to revoke** — delete the session from the store
- **Scaling challenge** — all servers need access to the session store

---

## Token-Based Authentication (JWT)

JSON Web Tokens are self-contained tokens that encode user information.

### JWT Structure

A JWT has three parts separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    ← Header (Base64URL)
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik    ← Payload (Base64URL)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (Claims):**
```json
{
  "sub": "1234567890",      // Subject (user ID)
  "name": "John Doe",       // Custom claim
  "iat": 1516239022,        // Issued At (Unix timestamp)
  "exp": 1516242622,        // Expiration (Unix timestamp)
  "iss": "https://auth.example.com",  // Issuer
  "aud": "https://api.example.com"    // Audience
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Standard Claims

| Claim | Name | Purpose |
|-------|------|---------|
| `sub` | Subject | Who the token is about (user ID) |
| `iss` | Issuer | Who issued the token |
| `aud` | Audience | Who the token is intended for |
| `exp` | Expiration | When the token expires |
| `iat` | Issued At | When the token was issued |
| `nbf` | Not Before | Token not valid before this time |
| `jti` | JWT ID | Unique identifier for the token |

### Flow

```
1. Client sends credentials
2. Server validates, creates JWT, signs it with secret
3. Server sends JWT to client
4. Client stores JWT (cookie or localStorage)
5. Client sends JWT with every request (Authorization header or cookie)
6. Server verifies signature and reads claims — no database lookup needed
```

---

## JWT Pros and Cons

| Pros | Cons |
|------|------|
| **Stateless** — no server-side storage | **Can't revoke easily** — valid until expiration |
| **Scalable** — any server can verify | **Size** — larger than session ID |
| **Cross-domain** — works with CORS | **Payload visible** — Base64 encoded, not encrypted |
| **Mobile-friendly** — not cookie-dependent | **Key management** — secret must be secured |

### Storage: Cookie vs localStorage

| Storage | XSS Risk | CSRF Risk | Recommendation |
|---------|----------|-----------|----------------|
| **localStorage** | HIGH — JS can read it | None | Avoid for auth tokens |
| **HttpOnly Cookie** | None — JS can't access | Possible | Preferred — use SameSite |
| **Memory (variable)** | LOW — lost on refresh | None | Good for short-lived SPAs |

**Best practice:** Store JWT in an HttpOnly, Secure, SameSite=Lax cookie.
Never store sensitive tokens in localStorage.

---

## OAuth 2.0

OAuth 2.0 is an authorization framework that allows third-party apps to access
user resources without sharing credentials.

### Authorization Code Flow (Recommended for Web Apps)

```
User        Client App       Auth Server       Resource Server
 │              │                  │                   │
 │─ Click ─────►│                  │                   │
 │  "Login      │── Redirect ─────►│                   │
 │   with       │  /authorize?     │                   │
 │   Google"    │  client_id=X&    │                   │
 │              │  redirect_uri=Y& │                   │
 │              │  response_type=  │                   │
 │              │  code&scope=Z    │                   │
 │              │                  │                   │
 │◄─────────── Login Page ────────│                   │
 │── Enter credentials ──────────►│                   │
 │◄── Redirect to Y?code=ABC ────│                   │
 │              │                  │                   │
 │──────────────►│                  │                   │
 │              │── POST /token ──►│                   │
 │              │  code=ABC&       │                   │
 │              │  client_secret=S │                   │
 │              │◄─ access_token ──│                   │
 │              │                  │                   │
 │              │── GET /api/user ─────────────────────►│
 │              │   Authorization: Bearer <token>       │
 │              │◄── User data ────────────────────────│
```

### PKCE (Proof Key for Code Exchange) — For SPAs

SPAs can't keep a client_secret. PKCE adds a challenge/verifier:

```
1. Client generates random code_verifier
2. Client computes code_challenge = SHA256(code_verifier)
3. Client sends code_challenge in /authorize request
4. After redirect, client sends code_verifier in /token request
5. Auth server verifies: SHA256(code_verifier) === stored code_challenge
```

This prevents interception of the authorization code from being useful.

### Access Token vs Refresh Token

| Token | Lifetime | Purpose | Storage |
|-------|----------|---------|---------|
| **Access Token** | Short (5-60 min) | Access resources | Memory or HttpOnly cookie |
| **Refresh Token** | Long (days-weeks) | Get new access tokens | HttpOnly cookie only |

---

## OpenID Connect

OpenID Connect (OIDC) is an identity layer on top of OAuth 2.0. While OAuth 2.0
handles authorization ("what can this app access?"), OIDC handles authentication
("who is this user?").

### What OIDC Adds

- **ID Token** — JWT containing user identity claims
- **UserInfo Endpoint** — API to get user profile information
- **Standard Scopes** — `openid`, `profile`, `email`

### ID Token

```json
{
  "iss": "https://accounts.google.com",
  "sub": "1234567890",
  "aud": "your-client-id",
  "exp": 1516242622,
  "iat": 1516239022,
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true,
  "picture": "https://..."
}
```

The ID token tells the client app who the user is. The access token is used
to call APIs on the user's behalf.

---

## Password Storage

**Never store passwords in plain text.** If the database is breached, all
passwords are exposed.

### Hashing

Passwords should be hashed with a slow, purpose-built algorithm:

| Algorithm | Status | Notes |
|-----------|--------|-------|
| **bcrypt** | Good | Widely supported, adjustable cost factor |
| **argon2** | Best | Memory-hard, resistant to GPU attacks |
| **scrypt** | Good | Memory-hard, used in some crypto systems |
| **SHA-256** | BAD | Too fast — billions of guesses per second |
| **MD5** | TERRIBLE | Broken, never use for passwords |

### Salt

A salt is a random value added to each password before hashing. It ensures
that identical passwords produce different hashes.

```
Without salt:
  hash("password123") → abc123  (same for all users with this password)

With salt:
  hash("password123" + "random1") → xyz789
  hash("password123" + "random2") → def456  (different hash!)
```

bcrypt and argon2 handle salting automatically.

### How bcrypt Works

```
1. Generate random salt (16 bytes)
2. Hash: bcrypt(password + salt, cost_factor)
3. Store: $2b$12$salt_hash_combined_string
   ──────── ── ─────────────────────────
   algorithm │  salt + hash
            cost factor (2^12 = 4096 iterations)
```

---

## Multi-Factor Authentication

MFA requires two or more independent verification factors:

| Factor | Type | Examples |
|--------|------|---------|
| **Knowledge** | Something you know | Password, PIN, security question |
| **Possession** | Something you have | Phone, hardware key, smart card |
| **Inherence** | Something you are | Fingerprint, face, voice |

### TOTP (Time-Based One-Time Password)

```
1. Server generates a shared secret (Base32 encoded)
2. User adds secret to authenticator app (via QR code)
3. App generates 6-digit code every 30 seconds:
   code = HMAC-SHA1(secret, floor(currentTime / 30)) → truncate to 6 digits
4. Server computes the same code and compares
```

### WebAuthn / Passkeys

The modern replacement for passwords. Uses public-key cryptography:

```
Registration:
1. Server sends challenge (random bytes)
2. Authenticator creates key pair (public + private)
3. Authenticator signs challenge with private key
4. Server stores public key

Login:
1. Server sends new challenge
2. Authenticator signs challenge with private key
3. Server verifies signature with stored public key
```

Benefits: Phishing-resistant, no shared secrets, biometric-protected.

---

## Role-Based Access Control (RBAC)

RBAC assigns permissions to roles, and roles to users.

```
Users          Roles           Permissions
┌──────┐      ┌───────┐      ┌──────────────┐
│ Alice │─────│ Admin  │─────│ users:read   │
│       │     │        │─────│ users:write  │
└──────┘      │        │─────│ users:delete │
               └───────┘      └──────────────┘
┌──────┐      ┌───────┐      ┌──────────────┐
│ Bob   │─────│ Editor │─────│ posts:read   │
│       │     │        │─────│ posts:write  │
└──────┘      └───────┘      └──────────────┘
┌──────┐      ┌───────┐      ┌──────────────┐
│ Carol │─────│ Viewer │─────│ posts:read   │
└──────┘      └───────┘      └──────────────┘
```

### Implementation Pattern

```typescript
// Define roles and their permissions
const roles = {
  admin: ['users:read', 'users:write', 'users:delete', 'posts:*'],
  editor: ['posts:read', 'posts:write'],
  viewer: ['posts:read'],
};

// Check permission
function hasPermission(userRole: string, permission: string): boolean {
  const perms = roles[userRole] || [];
  return perms.some(p => p === permission || p === `${permission.split(':')[0]}:*`);
}
```

**Frontend note:** RBAC on the frontend is for UX only (hiding buttons, etc.).
Always enforce permissions on the server.

---

## Cookie Security

### Security Attributes

| Attribute | Purpose | Setting |
|-----------|---------|---------|
| `HttpOnly` | Prevents JavaScript access (XSS protection) | Always set for auth cookies |
| `Secure` | Cookie only sent over HTTPS | Always set |
| `SameSite` | Controls cross-site sending | `Lax` or `Strict` |
| `Path` | Limits cookie to a path | Usually `/` |
| `Domain` | Which domains receive the cookie | Be restrictive |
| `Max-Age` | Cookie lifetime in seconds | Keep short for sessions |

### __Host- and __Secure- Prefixes

```
Set-Cookie: __Host-session=abc; Secure; Path=/; HttpOnly
```

`__Host-` prefix requirements (enforced by browser):
- Must have `Secure` flag
- Must have `Path=/`
- Must NOT have `Domain` attribute
- Must be set from a secure origin

This prevents subdomain attacks and ensures the cookie is locked to the exact origin.

### Best Practice Session Cookie

```
Set-Cookie: __Host-session=abc123;
  HttpOnly;
  Secure;
  SameSite=Lax;
  Path=/;
  Max-Age=3600
```

---

## Refresh Token Rotation

Refresh token rotation issues a new refresh token every time one is used.
The old refresh token is invalidated.

```
Initial login:
  Server → access_token_1 + refresh_token_1

When access_token_1 expires:
  Client → sends refresh_token_1
  Server → invalidates refresh_token_1
  Server → issues access_token_2 + refresh_token_2

When access_token_2 expires:
  Client → sends refresh_token_2
  Server → invalidates refresh_token_2
  Server → issues access_token_3 + refresh_token_3
```

### Detecting Token Theft

If an attacker steals refresh_token_2 and uses it:
```
Attacker → sends refresh_token_2 → gets access_token_X + refresh_token_X
Legitimate user → sends refresh_token_2 → FAILS (already used)
Server detects reuse → invalidates ALL tokens for this user (token family)
```

This is called **automatic reuse detection**. It limits the damage of a stolen
refresh token.

---

## Token Revocation Strategies

JWTs can't be revoked because they're self-contained. Here are strategies:

| Strategy | How It Works | Trade-off |
|----------|-------------|-----------|
| **Short expiration** | Tokens expire quickly (5-15 min) | Frequent refresh needed |
| **Token blocklist** | Store revoked token IDs in a fast store (Redis) | Adds statefulness |
| **Token versioning** | Store a version counter per user; reject old versions | DB lookup per request |
| **Refresh token revocation** | Revoke refresh token; access token expires naturally | Short window of access |

**Recommended approach for SPAs:**
- Access token: 5-15 minutes, stored in memory
- Refresh token: 7-30 days, HttpOnly cookie, rotation enabled
- On logout: revoke refresh token, clear access token from memory
- On password change: revoke all refresh tokens for the user

---

## Key Takeaways for Frontend Developers

1. **Never store tokens in localStorage** — use HttpOnly cookies
2. **Access tokens should be short-lived** — 5-15 minutes
3. **Frontend auth checks are for UX, not security** — enforce on the server
4. **Use PKCE for OAuth in SPAs** — no client secrets in browser code
5. **Implement refresh token rotation** — limits token theft damage
6. **Hash passwords with bcrypt or argon2** — never SHA-256 or MD5
7. **Use __Host- cookie prefix** — maximum cookie security
8. **RBAC on frontend hides UI, not access** — server must check permissions
9. **Prefer WebAuthn/passkeys** — phishing-resistant authentication

---

## Further Reading

- [JWT.io](https://jwt.io/) — JWT debugger and introduction
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [WebAuthn Guide](https://webauthn.guide/)
