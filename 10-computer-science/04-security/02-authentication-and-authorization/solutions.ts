// ============================================================================
// Authentication & Authorization — Solutions
// ============================================================================
// Run: npx tsx solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

import { createHash, randomBytes, createHmac, timingSafeEqual } from "node:crypto";

// ============================================================================
// Exercise 1 (Implement): Base64URL Encoder/Decoder
// ============================================================================

function base64urlEncode(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  return Buffer.from(base64, "base64").toString("utf8");
}

// ============================================================================
// Exercise 2 (Implement): JWT Builder (No Crypto)
// ============================================================================

interface JWTPayload {
  sub: string;
  name: string;
  iat: number;
  exp: number;
  [key: string]: string | number | boolean;
}

function buildJWT(payload: JWTPayload, algorithm: string = "HS256"): string {
  const header = JSON.stringify({ alg: algorithm, typ: "JWT" });
  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const encodedSignature = base64urlEncode("unsigned");
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// ============================================================================
// Exercise 3 (Implement): JWT Decoder
// ============================================================================

interface DecodedJWT {
  header: { alg: string; typ: string };
  payload: JWTPayload;
  signature: string;
}

function decodeJWT(token: string): DecodedJWT | { error: string } {
  const parts = token.split(".");
  if (parts.length !== 3) return { error: "JWT must have exactly 3 parts" };

  try {
    const header = JSON.parse(base64urlDecode(parts[0]));
    const payload = JSON.parse(base64urlDecode(parts[1]));
    return { header, payload, signature: parts[2] };
  } catch {
    return { error: "Failed to decode JWT" };
  }
}

// ============================================================================
// Exercise 4 (Implement): JWT Expiration Checker
// ============================================================================

interface TokenValidation {
  valid: boolean;
  reason: string;
  expiresIn?: number;
}

function validateJWTExpiry(
  token: string,
  currentTime?: number
): TokenValidation {
  const decoded = decodeJWT(token);
  if ("error" in decoded) return { valid: false, reason: decoded.error };

  const now = currentTime ?? Math.floor(Date.now() / 1000);
  const payload = decoded.payload;

  if (payload.exp && now >= payload.exp) {
    return { valid: false, reason: "Token has expired" };
  }

  if (typeof (payload as Record<string, unknown>).nbf === "number" && now < ((payload as Record<string, unknown>).nbf as number)) {
    return { valid: false, reason: "Token is not yet valid (nbf)" };
  }

  const expiresIn = payload.exp ? payload.exp - now : undefined;
  return { valid: true, reason: "Token is valid", expiresIn };
}

// ============================================================================
// Exercise 5 (Predict): OAuth 2.0 Flow
// ============================================================================

function exercise5(): { a: string; b: string; c: string } {
  return {
    a: "The attacker can exchange the code for tokens. Without PKCE or a client_secret (SPAs can't keep secrets), the authorization code alone is sufficient to get access tokens.",
    b: "The auth server rejects the request. Without the correct code_verifier that hashes to the original code_challenge, the server cannot verify the request and denies the token exchange.",
    c: "The auth server detects refresh token reuse, which indicates theft. It invalidates the entire token family (all tokens issued in this chain), forcing both the attacker and the legitimate user to re-authenticate.",
  };
}

// ============================================================================
// Exercise 6 (Implement): Session Manager
// ============================================================================

interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastAccessed: number;
  data: Record<string, string>;
}

interface SessionManager {
  createSession(userId: string): string;
  getSession(sessionId: string, currentTime?: number): Session | null;
  destroySession(sessionId: string): boolean;
  setData(sessionId: string, key: string, value: string): boolean;
  activeSessions(): number;
  cleanExpired(currentTime?: number): number;
}

function createSessionManager(maxAgeSeconds: number): SessionManager {
  const sessions = new Map<string, Session>();

  return {
    createSession(userId: string): string {
      const id = randomBytes(24).toString("hex");
      const now = Math.floor(Date.now() / 1000);
      sessions.set(id, {
        id,
        userId,
        createdAt: now,
        lastAccessed: now,
        data: {},
      });
      return id;
    },

    getSession(sessionId: string, currentTime?: number): Session | null {
      const session = sessions.get(sessionId);
      if (!session) return null;

      const now = currentTime ?? Math.floor(Date.now() / 1000);
      if (now - session.createdAt > maxAgeSeconds) {
        sessions.delete(sessionId);
        return null;
      }

      session.lastAccessed = now;
      return { ...session, data: { ...session.data } };
    },

    destroySession(sessionId: string): boolean {
      return sessions.delete(sessionId);
    },

    setData(sessionId: string, key: string, value: string): boolean {
      const session = sessions.get(sessionId);
      if (!session) return false;
      session.data[key] = value;
      return true;
    },

    activeSessions(): number {
      return sessions.size;
    },

    cleanExpired(currentTime?: number): number {
      const now = currentTime ?? Math.floor(Date.now() / 1000);
      let cleaned = 0;
      for (const [id, session] of sessions) {
        if (now - session.createdAt > maxAgeSeconds) {
          sessions.delete(id);
          cleaned++;
        }
      }
      return cleaned;
    },
  };
}

// ============================================================================
// Exercise 7 (Implement): RBAC System
// ============================================================================

interface RBACSystem {
  defineRole(name: string, permissions: string[]): void;
  assignRole(userId: string, roleName: string): boolean;
  removeRole(userId: string, roleName: string): boolean;
  hasPermission(userId: string, permission: string): boolean;
  getUserRoles(userId: string): string[];
  getUserPermissions(userId: string): string[];
}

function createRBAC(): RBACSystem {
  const roles = new Map<string, string[]>();
  const userRoles = new Map<string, Set<string>>();

  function matchPermission(pattern: string, permission: string): boolean {
    if (pattern === permission) return true;
    // Wildcard: "posts:*" matches "posts:read", "posts:write", etc.
    if (pattern.endsWith(":*")) {
      const prefix = pattern.slice(0, -1); // "posts:"
      return permission.startsWith(prefix);
    }
    return false;
  }

  return {
    defineRole(name: string, permissions: string[]): void {
      roles.set(name, permissions);
    },

    assignRole(userId: string, roleName: string): boolean {
      if (!roles.has(roleName)) return false;
      let userRoleSet = userRoles.get(userId);
      if (!userRoleSet) {
        userRoleSet = new Set();
        userRoles.set(userId, userRoleSet);
      }
      userRoleSet.add(roleName);
      return true;
    },

    removeRole(userId: string, roleName: string): boolean {
      const userRoleSet = userRoles.get(userId);
      if (!userRoleSet) return false;
      return userRoleSet.delete(roleName);
    },

    hasPermission(userId: string, permission: string): boolean {
      const userRoleSet = userRoles.get(userId);
      if (!userRoleSet) return false;

      for (const roleName of userRoleSet) {
        const perms = roles.get(roleName);
        if (!perms) continue;
        for (const p of perms) {
          if (matchPermission(p, permission)) return true;
        }
      }
      return false;
    },

    getUserRoles(userId: string): string[] {
      const userRoleSet = userRoles.get(userId);
      return userRoleSet ? [...userRoleSet] : [];
    },

    getUserPermissions(userId: string): string[] {
      const userRoleSet = userRoles.get(userId);
      if (!userRoleSet) return [];
      const perms = new Set<string>();
      for (const roleName of userRoleSet) {
        const rolePerms = roles.get(roleName);
        if (rolePerms) rolePerms.forEach((p) => perms.add(p));
      }
      return [...perms];
    },
  };
}

// ============================================================================
// Exercise 8 (Predict): Token Storage Attacks
// ============================================================================

function exercise8(): { a: string; b: string } {
  return {
    a: "The attacker's XSS script can read localStorage and steal the JWT (e.g., localStorage.getItem('token')). The attacker can then use the stolen token from their own machine by setting it in the Authorization header — the token is self-contained and works from anywhere.",
    b: "The attacker's XSS script CANNOT read the JWT because HttpOnly cookies are inaccessible to JavaScript. The attacker cannot use CSRF because SameSite=Strict prevents the cookie from being sent on cross-site requests. However, the XSS script can still make same-origin requests (the cookie is automatically included), so the attacker can perform actions in the context of the user's session but cannot exfiltrate the token itself.",
  };
}

// ============================================================================
// Exercise 9 (Fix): Insecure JWT Validation
// ============================================================================

interface JWTValidationResult {
  valid: boolean;
  reason: string;
  payload?: Record<string, unknown>;
}

function validateJWT(
  token: string,
  expectedIssuer: string,
  expectedAudience: string,
  currentTime?: number
): JWTValidationResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "Invalid format" };

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    return { valid: false, reason: "Failed to decode token" };
  }

  // Fix 1: Reject "none" algorithm
  const alg = header.alg as string;
  if (!alg || alg.toLowerCase() === "none") {
    return { valid: false, reason: "Algorithm 'none' is not allowed" };
  }

  // Fix 2: Validate issuer
  if (payload.iss !== expectedIssuer) {
    return { valid: false, reason: `Invalid issuer: expected '${expectedIssuer}', got '${payload.iss}'` };
  }

  // Fix 3: Validate audience
  if (payload.aud !== expectedAudience) {
    return { valid: false, reason: `Invalid audience: expected '${expectedAudience}', got '${payload.aud}'` };
  }

  // Fix 4: Check expiration
  const now = currentTime ?? Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && now >= payload.exp) {
    return { valid: false, reason: "Token has expired" };
  }

  return { valid: true, reason: "Valid", payload };
}

// ============================================================================
// Exercise 10 (Implement): Refresh Token Rotation
// ============================================================================

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TokenRotator {
  issueTokenPair(userId: string): TokenPair;
  refresh(refreshToken: string): TokenPair | { error: string };
  revoke(userId: string): void;
  isValid(accessToken: string): { valid: boolean; userId?: string };
}

function createTokenRotator(accessTokenTTL: number): TokenRotator {
  // Map<refreshToken, { userId, familyId, consumed }>
  const refreshTokens = new Map<string, { userId: string; familyId: string; consumed: boolean }>();
  // Map<accessToken, { userId, expiresAt }>
  const accessTokens = new Map<string, { userId: string; expiresAt: number }>();
  // Map<familyId, Set<refreshToken>> — for revoking entire families
  const families = new Map<string, Set<string>>();
  // Set of revoked family IDs
  const revokedFamilies = new Set<string>();

  function generateToken(): string {
    return randomBytes(24).toString("hex");
  }

  function issuePair(userId: string, familyId: string): TokenPair {
    const accessToken = generateToken();
    const refreshToken = generateToken();
    const now = Math.floor(Date.now() / 1000);

    accessTokens.set(accessToken, { userId, expiresAt: now + accessTokenTTL });
    refreshTokens.set(refreshToken, { userId, familyId, consumed: false });

    let family = families.get(familyId);
    if (!family) {
      family = new Set();
      families.set(familyId, family);
    }
    family.add(refreshToken);

    return { accessToken, refreshToken, expiresIn: accessTokenTTL };
  }

  return {
    issueTokenPair(userId: string): TokenPair {
      const familyId = generateToken();
      return issuePair(userId, familyId);
    },

    refresh(refreshToken: string): TokenPair | { error: string } {
      const tokenData = refreshTokens.get(refreshToken);
      if (!tokenData) return { error: "Invalid refresh token" };

      // Check if family is revoked
      if (revokedFamilies.has(tokenData.familyId)) {
        return { error: "Token family has been revoked" };
      }

      // Reuse detection
      if (tokenData.consumed) {
        // Token was already used — possible theft! Revoke entire family
        revokedFamilies.add(tokenData.familyId);
        const family = families.get(tokenData.familyId);
        if (family) {
          for (const rt of family) refreshTokens.delete(rt);
        }
        return { error: "Refresh token reuse detected — all tokens revoked" };
      }

      // Mark as consumed
      tokenData.consumed = true;

      // Issue new pair in same family
      return issuePair(tokenData.userId, tokenData.familyId);
    },

    revoke(userId: string): void {
      // Revoke all tokens for a user
      for (const [rt, data] of refreshTokens) {
        if (data.userId === userId) {
          revokedFamilies.add(data.familyId);
          refreshTokens.delete(rt);
        }
      }
      for (const [at, data] of accessTokens) {
        if (data.userId === userId) accessTokens.delete(at);
      }
    },

    isValid(accessToken: string): { valid: boolean; userId?: string } {
      const data = accessTokens.get(accessToken);
      if (!data) return { valid: false };
      const now = Math.floor(Date.now() / 1000);
      if (now >= data.expiresAt) {
        accessTokens.delete(accessToken);
        return { valid: false };
      }
      return { valid: true, userId: data.userId };
    },
  };
}

// ============================================================================
// Exercise 11 (Fix): Insecure Password Handling
// ============================================================================

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
}

interface AuthSystem {
  register(email: string, password: string): UserRecord | { error: string };
  login(email: string, password: string): { success: boolean; userId?: string; reason?: string };
}

function createAuthSystem(): AuthSystem {
  const users = new Map<string, UserRecord>();

  function hashPassword(password: string, salt: string): string {
    // Use SHA-256 with salt and multiple iterations (simplified bcrypt-like)
    // In production, use bcrypt or argon2
    let hash = password + salt;
    for (let i = 0; i < 10000; i++) {
      hash = createHash("sha256").update(hash).digest("hex");
    }
    return hash;
  }

  return {
    register(email: string, password: string): UserRecord | { error: string } {
      // Fix 1: Check for duplicate email
      if (users.has(email)) {
        return { error: "Email already registered" };
      }

      // Fix 2: Validate password strength
      if (password.length < 8) {
        return { error: "Password must be at least 8 characters" };
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return { error: "Password must contain uppercase, lowercase, and numbers" };
      }

      // Fix 3: Generate salt
      const salt = randomBytes(16).toString("hex");

      // Fix 4: Use proper hashing (not MD5)
      const hash = hashPassword(password, salt);

      const user: UserRecord = {
        id: randomBytes(8).toString("hex"),
        email,
        passwordHash: hash,
        salt,
      };
      users.set(email, user);
      return user;
    },

    login(email: string, password: string): { success: boolean; userId?: string; reason?: string } {
      const user = users.get(email);
      // Fix 5: Generic error message (don't reveal if user exists)
      if (!user) return { success: false, reason: "Invalid email or password" };

      const hash = hashPassword(password, user.salt);

      // Fix 6: Timing-safe comparison
      try {
        const hashBuffer = Buffer.from(hash, "hex");
        const storedBuffer = Buffer.from(user.passwordHash, "hex");
        if (hashBuffer.length !== storedBuffer.length || !timingSafeEqual(hashBuffer, storedBuffer)) {
          return { success: false, reason: "Invalid email or password" };
        }
      } catch {
        return { success: false, reason: "Invalid email or password" };
      }

      return { success: true, userId: user.id };
    },
  };
}

// ============================================================================
// Exercise 12 (Predict): Session Fixation
// ============================================================================

function exercise12(): { attack: string; prevention: string } {
  return {
    attack: "The attack works because the server accepts a session ID provided by the client and doesn't regenerate it after authentication. The attacker knows the session ID before the victim logs in, so after login, the attacker can use the same session ID to hijack the authenticated session.",
    prevention: "Always regenerate the session ID after successful authentication. Destroy the old session and create a new one with a fresh ID. Never accept session IDs from URL parameters — only from cookies. This way, even if an attacker sets up a session, it becomes useless after login because the ID changes.",
  };
}

// ============================================================================
// Exercise 13 (Implement): Cookie Parser and Builder
// ============================================================================

interface ParsedCookie {
  name: string;
  value: string;
  attributes: {
    httpOnly: boolean;
    secure: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: string;
  };
}

function parseSetCookie(header: string): ParsedCookie {
  const parts = header.split(";").map((s) => s.trim());
  const [nameValue, ...attrs] = parts;
  const eqIdx = nameValue.indexOf("=");
  const name = nameValue.slice(0, eqIdx);
  const value = nameValue.slice(eqIdx + 1);

  const result: ParsedCookie = {
    name,
    value,
    attributes: { httpOnly: false, secure: false },
  };

  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === "httponly") {
      result.attributes.httpOnly = true;
    } else if (lower === "secure") {
      result.attributes.secure = true;
    } else if (lower.startsWith("samesite=")) {
      const val = attr.split("=")[1];
      result.attributes.sameSite = val as "Strict" | "Lax" | "None";
    } else if (lower.startsWith("path=")) {
      result.attributes.path = attr.split("=")[1];
    } else if (lower.startsWith("domain=")) {
      result.attributes.domain = attr.split("=")[1];
    } else if (lower.startsWith("max-age=")) {
      result.attributes.maxAge = parseInt(attr.split("=")[1], 10);
    } else if (lower.startsWith("expires=")) {
      result.attributes.expires = attr.slice(attr.indexOf("=") + 1);
    }
  }

  return result;
}

function buildSetCookie(cookie: ParsedCookie): string {
  let header = `${cookie.name}=${cookie.value}`;
  const a = cookie.attributes;

  if (a.httpOnly) header += "; HttpOnly";
  if (a.secure) header += "; Secure";
  if (a.sameSite) header += `; SameSite=${a.sameSite}`;
  if (a.path) header += `; Path=${a.path}`;
  if (a.domain) header += `; Domain=${a.domain}`;
  if (a.maxAge !== undefined) header += `; Max-Age=${a.maxAge}`;
  if (a.expires) header += `; Expires=${a.expires}`;

  return header;
}

// ============================================================================
// Exercise 14 (Fix): Broken Access Control
// ============================================================================

interface User {
  id: string;
  role: "admin" | "editor" | "viewer";
}

interface Document {
  id: string;
  ownerId: string;
  content: string;
  isPublic: boolean;
}

interface APIResult {
  status: number;
  body: string | Document;
}

function getDocument(
  documentId: string,
  requestingUser: User,
  documents: Map<string, Document>
): APIResult {
  const doc = documents.get(documentId);

  // Fix 1: Check if document exists
  if (!doc) return { status: 404, body: "Document not found" };

  // Fix 2/3: Authorization check
  if (doc.isPublic) return { status: 200, body: doc };
  if (doc.ownerId === requestingUser.id) return { status: 200, body: doc };
  if (requestingUser.role === "admin") return { status: 200, body: doc };

  return { status: 403, body: "Access denied" };
}

function deleteDocument(
  documentId: string,
  requestingUser: User,
  documents: Map<string, Document>
): APIResult {
  const doc = documents.get(documentId);

  // Fix 1: Check if document exists
  if (!doc) return { status: 404, body: "Document not found" };

  // Fix 2: Only owner or admin can delete
  if (doc.ownerId !== requestingUser.id && requestingUser.role !== "admin") {
    return { status: 403, body: "Access denied — only owner or admin can delete" };
  }

  documents.delete(documentId);
  return { status: 200, body: "Deleted" };
}

// ============================================================================
// Exercise 15 (Implement): PKCE Challenge Generator
// ============================================================================

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  challengeMethod: "S256";
}

function generatePKCE(): PKCEPair {
  // Generate 32 random bytes → base64url → 43 chars
  const verifierBytes = randomBytes(32);
  const codeVerifier = verifierBytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const challengeHash = createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = challengeHash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { codeVerifier, codeChallenge, challengeMethod: "S256" };
}

function verifyPKCE(codeVerifier: string, codeChallenge: string): boolean {
  const hash = createHash("sha256").update(codeVerifier).digest();
  const computed = hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return computed === codeChallenge;
}

// ============================================================================
// Exercise 16 (Predict): Cookie Security
// ============================================================================

function exercise16(): { a: string; b: string; c: string } {
  return {
    a: "Multiple issues: no HttpOnly (JS can steal it via XSS), no Secure (sent over HTTP — MITM can intercept), no SameSite (vulnerable to CSRF), Domain=.example.com (shared with all subdomains — any compromised subdomain can access it).",
    b: "This is a well-secured cookie. __Host- prefix enforces Secure, Path=/, and no Domain. HttpOnly prevents XSS cookie theft. Secure prevents HTTP transmission. SameSite=Strict prevents CSRF. This is the most secure configuration possible.",
    c: "Issues: no HttpOnly (JS can steal it), SameSite=None means it's sent on all cross-site requests (CSRF vulnerable). While Secure is set, the combination of SameSite=None without HttpOnly makes this cookie vulnerable to both XSS and CSRF attacks.",
  };
}

// ============================================================================
// Exercise 17 (Implement): TOTP Generator
// ============================================================================

function generateTOTP(secret: string, time?: number): string {
  const now = time ?? Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(now / 30);

  // Convert time step to 8-byte big-endian buffer
  const timeBuffer = Buffer.alloc(8);
  // Write as big-endian 64-bit integer
  let t = timeStep;
  for (let i = 7; i >= 0; i--) {
    timeBuffer[i] = t & 0xff;
    t = Math.floor(t / 256);
  }

  const hmac = createHmac("sha1", secret).update(timeBuffer).digest();

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = code % 1000000;
  return otp.toString().padStart(6, "0");
}

function verifyTOTP(
  secret: string,
  code: string,
  time?: number,
  window: number = 1
): boolean {
  const now = time ?? Math.floor(Date.now() / 1000);
  for (let i = -window; i <= window; i++) {
    const checkTime = now + i * 30;
    if (generateTOTP(secret, checkTime) === code) return true;
  }
  return false;
}

// ============================================================================
// Exercise 18 (Fix): Insecure Session Management
// ============================================================================

interface SessionConfig {
  cookieName: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
  regenerateOnLogin: boolean;
}

function getSecureSessionConfig(): SessionConfig {
  return {
    cookieName: "__Host-session",
    maxAge: 3600,               // 1 hour
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    regenerateOnLogin: true,    // Prevent session fixation
  };
}

// ============================================================================
// Runner
// ============================================================================

function runTests(): void {
  console.log("=".repeat(70));
  console.log("Authentication & Authorization — Solutions");
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
  console.log("\nExercise 1: Base64URL Encode/Decode");
  const encoded = base64urlEncode('{"alg":"HS256","typ":"JWT"}');
  assert(encoded === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "Encodes JWT header");
  assert(base64urlDecode(encoded) === '{"alg":"HS256","typ":"JWT"}', "Decodes JWT header");
  assert(!encoded.includes("+") && !encoded.includes("/") && !encoded.includes("="), "No standard base64 chars");

  // Exercise 2
  console.log("\nExercise 2: JWT Builder");
  const jwt = buildJWT({ sub: "123", name: "Test", iat: 1000, exp: 2000 });
  const jwtParts = jwt.split(".");
  assert(jwtParts.length === 3, "JWT has 3 parts");
  assert(jwtParts[0] === base64urlEncode('{"alg":"HS256","typ":"JWT"}'), "Correct header");
  const payloadDecoded = JSON.parse(base64urlDecode(jwtParts[1]));
  assert(payloadDecoded.sub === "123", "Payload contains sub");

  // Exercise 3
  console.log("\nExercise 3: JWT Decoder");
  const decoded = decodeJWT(jwt);
  assert(!("error" in decoded), "Decodes without error");
  if (!("error" in decoded)) {
    assert(decoded.header.alg === "HS256", "Header has algorithm");
    assert(decoded.payload.sub === "123", "Payload has subject");
  }
  const badDecode = decodeJWT("not.a.jwt.token");
  assert("error" in badDecode, "Rejects invalid JWT format (4 parts)");

  // Exercise 4
  console.log("\nExercise 4: JWT Expiration Checker");
  const futureJWT = buildJWT({ sub: "1", name: "T", iat: 1000, exp: Math.floor(Date.now() / 1000) + 3600 });
  const futureResult = validateJWTExpiry(futureJWT);
  assert(futureResult.valid === true, "Future token is valid");
  assert(futureResult.expiresIn !== undefined && futureResult.expiresIn > 0, "Has positive expiresIn");

  const expiredJWT = buildJWT({ sub: "1", name: "T", iat: 1000, exp: 1001 });
  const expiredResult = validateJWTExpiry(expiredJWT);
  assert(expiredResult.valid === false, "Expired token is invalid");

  // Exercise 5
  console.log("\nExercise 5: OAuth 2.0 Flow Predictions");
  const ex5 = exercise5();
  assert(ex5.a.includes("exchange") || ex5.a.includes("tokens"), "Explains code interception");
  assert(ex5.b.includes("reject") || ex5.b.includes("deny") || ex5.b.includes("denies"), "PKCE prevents interception");
  assert(ex5.c.includes("revoke") || ex5.c.includes("invalidat"), "Reuse detection revokes family");

  // Exercise 6
  console.log("\nExercise 6: Session Manager");
  const sm = createSessionManager(3600);
  const sid = sm.createSession("user1");
  assert(sid.length > 0, "Creates session ID");
  const session = sm.getSession(sid);
  assert(session !== null, "Retrieves session");
  assert(session?.userId === "user1", "Correct user ID");
  sm.setData(sid, "theme", "dark");
  const updated = sm.getSession(sid);
  assert(updated?.data.theme === "dark", "Sets data");
  assert(sm.activeSessions() === 1, "Counts active sessions");
  sm.destroySession(sid);
  assert(sm.getSession(sid) === null, "Destroys session");
  // Expiration test
  const sid2 = sm.createSession("user2");
  assert(sm.getSession(sid2, Math.floor(Date.now() / 1000) + 7200) === null, "Expired session returns null");

  // Exercise 7
  console.log("\nExercise 7: RBAC System");
  const rbac = createRBAC();
  rbac.defineRole("admin", ["users:read", "users:write", "users:delete", "posts:*"]);
  rbac.defineRole("editor", ["posts:read", "posts:write"]);
  rbac.defineRole("viewer", ["posts:read"]);
  rbac.assignRole("alice", "admin");
  rbac.assignRole("bob", "editor");
  rbac.assignRole("bob", "viewer");
  assert(rbac.hasPermission("alice", "users:delete"), "Admin has users:delete");
  assert(rbac.hasPermission("alice", "posts:read"), "Admin has posts:read (wildcard)");
  assert(rbac.hasPermission("alice", "posts:write"), "Admin has posts:write (wildcard)");
  assert(rbac.hasPermission("bob", "posts:write"), "Editor has posts:write");
  assert(!rbac.hasPermission("bob", "users:read"), "Editor lacks users:read");
  assert(rbac.getUserRoles("bob").length === 2, "Bob has 2 roles");
  rbac.removeRole("bob", "editor");
  assert(!rbac.hasPermission("bob", "posts:write"), "After removing editor, no posts:write");
  assert(rbac.hasPermission("bob", "posts:read"), "Still has viewer's posts:read");

  // Exercise 8
  console.log("\nExercise 8: Token Storage Attack Predictions");
  const ex8 = exercise8();
  assert(ex8.a.includes("steal") || ex8.a.includes("read"), "localStorage token is stealable");
  assert(ex8.b.includes("CANNOT") || ex8.b.toLowerCase().includes("cannot"), "HttpOnly prevents reading");

  // Exercise 9
  console.log("\nExercise 9: Fix JWT Validation");
  const noneAlg = buildJWT({ sub: "1", name: "T", iat: 1000, exp: 9999999999 }, "none");
  const noneResult = validateJWT(noneAlg, "auth.example.com", "api.example.com");
  assert(noneResult.valid === false, "Rejects 'none' algorithm");

  const wrongIssuer = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url") + "." +
    Buffer.from(JSON.stringify({ sub: "1", iss: "evil.com", aud: "api.example.com", exp: 9999999999 })).toString("base64url") + ".sig";
  const issResult = validateJWT(wrongIssuer, "auth.example.com", "api.example.com");
  assert(issResult.valid === false, "Rejects wrong issuer");

  // Exercise 10
  console.log("\nExercise 10: Refresh Token Rotation");
  const rotator = createTokenRotator(300);
  const pair1 = rotator.issueTokenPair("user1");
  assert(pair1.accessToken.length > 0, "Issues access token");
  assert(pair1.refreshToken.length > 0, "Issues refresh token");
  assert(rotator.isValid(pair1.accessToken).valid, "Access token is valid");
  const pair2Result = rotator.refresh(pair1.refreshToken);
  assert(!("error" in pair2Result), "First refresh succeeds");
  const reuseResult = rotator.refresh(pair1.refreshToken);
  assert("error" in reuseResult, "Reuse is detected");
  if (!("error" in pair2Result)) {
    const pair3 = rotator.refresh(pair2Result.refreshToken);
    assert("error" in pair3, "Family is revoked after reuse");
  }

  // Exercise 11
  console.log("\nExercise 11: Secure Password Handling");
  const auth = createAuthSystem();
  const weakResult = auth.register("a@b.com", "short");
  assert("error" in weakResult, "Rejects weak password");
  const regResult = auth.register("user@test.com", "StrongPass1");
  assert(!("error" in regResult), "Accepts strong password");
  if (!("error" in regResult)) {
    assert(regResult.salt.length > 0, "Has salt");
    assert(regResult.passwordHash !== "StrongPass1", "Password is hashed");
  }
  const loginResult = auth.login("user@test.com", "StrongPass1");
  assert(loginResult.success, "Correct password logs in");
  const badLogin = auth.login("user@test.com", "WrongPass1");
  assert(!badLogin.success, "Wrong password fails");
  const dupResult = auth.register("user@test.com", "AnotherPass1");
  assert("error" in dupResult, "Rejects duplicate email");

  // Exercise 12
  console.log("\nExercise 12: Session Fixation");
  const ex12 = exercise12();
  assert(ex12.attack.includes("regenerate") || ex12.attack.toLowerCase().includes("session id"), "Explains the attack");
  assert(ex12.prevention.includes("regenerate") || ex12.prevention.includes("new"), "Recommends regeneration");

  // Exercise 13
  console.log("\nExercise 13: Cookie Parser and Builder");
  const parsed = parseSetCookie("__Host-session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600");
  assert(parsed.name === "__Host-session", "Parses cookie name");
  assert(parsed.value === "abc123", "Parses cookie value");
  assert(parsed.attributes.httpOnly === true, "Parses HttpOnly");
  assert(parsed.attributes.secure === true, "Parses Secure");
  assert(parsed.attributes.sameSite === "Lax", "Parses SameSite");
  assert(parsed.attributes.maxAge === 3600, "Parses Max-Age");

  const built = buildSetCookie({
    name: "session",
    value: "xyz",
    attributes: { httpOnly: true, secure: true, sameSite: "Strict", path: "/", maxAge: 7200 },
  });
  assert(built.includes("session=xyz"), "Builds name=value");
  assert(built.includes("HttpOnly"), "Builds HttpOnly");
  assert(built.includes("SameSite=Strict"), "Builds SameSite");

  // Exercise 14
  console.log("\nExercise 14: Access Control");
  const docs = new Map<string, Document>([
    ["doc1", { id: "doc1", ownerId: "user1", content: "Secret", isPublic: false }],
    ["doc2", { id: "doc2", ownerId: "user1", content: "Public", isPublic: true }],
  ]);
  const viewer: User = { id: "user2", role: "viewer" };
  const admin: User = { id: "user3", role: "admin" };
  const owner: User = { id: "user1", role: "viewer" };

  assert(getDocument("doc1", viewer, docs).status === 403, "Viewer can't access private doc");
  assert(getDocument("doc2", viewer, docs).status === 200, "Viewer can access public doc");
  assert(getDocument("doc1", owner, docs).status === 200, "Owner can access own doc");
  assert(getDocument("doc1", admin, docs).status === 200, "Admin can access any doc");
  assert(getDocument("nonexistent", viewer, docs).status === 404, "Nonexistent doc is 404");
  assert(deleteDocument("doc1", viewer, docs).status === 403, "Viewer can't delete");
  assert(deleteDocument("doc1", owner, docs).status === 200, "Owner can delete");

  // Exercise 15
  console.log("\nExercise 15: PKCE");
  const pkce = generatePKCE();
  assert(pkce.codeVerifier.length >= 43, "Verifier is >= 43 chars");
  assert(pkce.codeChallenge.length > 0, "Challenge is non-empty");
  assert(verifyPKCE(pkce.codeVerifier, pkce.codeChallenge), "Correct verifier passes");
  assert(!verifyPKCE("wrong-verifier", pkce.codeChallenge), "Wrong verifier fails");

  // Exercise 16
  console.log("\nExercise 16: Cookie Security Predictions");
  const ex16 = exercise16();
  assert(ex16.a.includes("HttpOnly") || ex16.a.includes("XSS"), "Identifies missing HttpOnly");
  assert(ex16.b.includes("secure") || ex16.b.includes("Secure"), "Confirms B is secure");

  // Exercise 17
  console.log("\nExercise 17: TOTP Generator");
  const totpSecret = "test-secret-key-12345";
  const totpTime = 1700000000;
  const code = generateTOTP(totpSecret, totpTime);
  assert(code.length === 6, "Code is 6 digits");
  assert(/^\d{6}$/.test(code), "Code is numeric");
  assert(generateTOTP(totpSecret, totpTime) === code, "Same time = same code");
  assert(verifyTOTP(totpSecret, code, totpTime), "Verifies correct code");
  assert(!verifyTOTP(totpSecret, "000000", totpTime) || code === "000000", "Rejects wrong code (unless coincidence)");
  // Window test
  assert(verifyTOTP(totpSecret, code, totpTime + 25, 1), "Within window still valid");

  // Exercise 18
  console.log("\nExercise 18: Secure Session Config");
  const config = getSecureSessionConfig();
  assert(config.cookieName.startsWith("__Host-"), "Uses __Host- prefix");
  assert(config.httpOnly === true, "HttpOnly is true");
  assert(config.secure === true, "Secure is true");
  assert(config.sameSite === "Lax" || config.sameSite === "Strict", "SameSite is Lax or Strict");
  assert(config.maxAge <= 86400, "Reasonable max age");
  assert(config.regenerateOnLogin === true, "Regenerates on login");

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log("=".repeat(70));
}

runTests();
