// ============================================================================
// Authentication & Authorization — Exercises
// ============================================================================
// Run: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// Exercise 1 (Implement): Base64URL Encoder/Decoder
// ============================================================================
// Implement Base64URL encoding and decoding (used in JWTs).
// Base64URL differs from standard Base64:
//   + → -    / → _    = padding is removed

function exercise1_base64urlEncode(input: string): string {
  // Your implementation here
  void input;
  return "";
}

function exercise1_base64urlDecode(input: string): string {
  // Your implementation here
  void input;
  return "";
}

// console.log(exercise1_base64urlEncode('{"alg":"HS256","typ":"JWT"}'));
// Expected: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
// console.log(exercise1_base64urlDecode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"));
// Expected: {"alg":"HS256","typ":"JWT"}

// ============================================================================
// Exercise 2 (Implement): JWT Builder (No Crypto)
// ============================================================================
// Build a JWT structure (header.payload.fakesignature).
// Use base64url encoding for header and payload.
// For the signature, just use a placeholder "unsigned" encoded in base64url.
// This exercise is about understanding JWT structure, not cryptography.

interface JWTPayload {
  sub: string;
  name: string;
  iat: number;
  exp: number;
  [key: string]: string | number | boolean;
}

function exercise2_buildJWT(payload: JWTPayload, algorithm: string = "HS256"): string {
  // Build: base64url(header) + "." + base64url(payload) + "." + base64url("unsigned")
  void payload;
  void algorithm;
  return "";
}

// const jwt = exercise2_buildJWT({
//   sub: "1234567890",
//   name: "John Doe",
//   iat: 1516239022,
//   exp: 1516242622,
// });
// console.log("JWT:", jwt);
// Should have 3 parts separated by dots

// ============================================================================
// Exercise 3 (Implement): JWT Decoder
// ============================================================================
// Decode a JWT and return the header and payload as objects.
// Do NOT verify the signature (we can't without the secret).
// Validate that the JWT has exactly 3 parts.

interface DecodedJWT {
  header: { alg: string; typ: string };
  payload: JWTPayload;
  signature: string;
}

function exercise3_decodeJWT(token: string): DecodedJWT | { error: string } {
  void token;
  return { error: "Not implemented" };
}

// const decoded = exercise3_decodeJWT(
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
// );
// console.log("Decoded:", decoded);

// ============================================================================
// Exercise 4 (Implement): JWT Expiration Checker
// ============================================================================
// Check if a JWT is expired based on its exp claim.
// Also check nbf (not before) if present.
// Return: { valid, reason }

interface TokenValidation {
  valid: boolean;
  reason: string;
  expiresIn?: number; // seconds until expiration (if valid)
}

function exercise4_validateJWTExpiry(
  token: string,
  currentTime?: number // Unix timestamp (seconds); defaults to now
): TokenValidation {
  void token;
  void currentTime;
  return { valid: false, reason: "Not implemented" };
}

// console.log(exercise4_validateJWTExpiry(
//   exercise2_buildJWT({ sub: "1", name: "Test", iat: 1000, exp: Math.floor(Date.now()/1000) + 3600 }),
//   Math.floor(Date.now()/1000)
// ));
// Expected: { valid: true, reason: "Token is valid", expiresIn: ~3600 }

// ============================================================================
// Exercise 5 (Predict): OAuth 2.0 Flow
// ============================================================================
// For each scenario, predict the outcome of the OAuth flow.

function exercise5(): { a: string; b: string; c: string } {
  // Scenario A:
  // A SPA uses the Authorization Code flow WITHOUT PKCE.
  // An attacker intercepts the authorization code from the redirect URL.
  // The attacker sends the code to the /token endpoint.
  // What happens?

  // Scenario B:
  // Same SPA uses Authorization Code flow WITH PKCE.
  // An attacker intercepts the authorization code.
  // The attacker sends the code to /token without the code_verifier.
  // What happens?

  // Scenario C:
  // A user's access token expires. The client sends the refresh token.
  // The auth server uses refresh token rotation and detects that the
  // refresh token was already used (by an attacker 5 minutes ago).
  // What happens?

  return {
    a: "", // What happens?
    b: "", // What happens?
    c: "", // What happens?
  };
}

// console.log("Exercise 5:", exercise5());

// ============================================================================
// Exercise 6 (Implement): Session Manager
// ============================================================================
// Implement an in-memory session manager with:
// - createSession(userId): returns sessionId
// - getSession(sessionId): returns session data or null
// - destroySession(sessionId): removes the session
// - Sessions expire after maxAge seconds
// - Store creation time and last accessed time

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

function exercise6_createSessionManager(maxAgeSeconds: number): SessionManager {
  void maxAgeSeconds;
  return {
    createSession(_userId: string): string { return ""; },
    getSession(_sessionId: string, _currentTime?: number): Session | null { return null; },
    destroySession(_sessionId: string): boolean { return false; },
    setData(_sessionId: string, _key: string, _value: string): boolean { return false; },
    activeSessions(): number { return 0; },
    cleanExpired(_currentTime?: number): number { return 0; },
  };
}

// const sm = exercise6_createSessionManager(3600);
// const sid = sm.createSession("user1");
// console.log("Session:", sm.getSession(sid));
// sm.setData(sid, "theme", "dark");
// console.log("With data:", sm.getSession(sid));
// console.log("Active:", sm.activeSessions());
// sm.destroySession(sid);
// console.log("After destroy:", sm.getSession(sid)); // null

// ============================================================================
// Exercise 7 (Implement): RBAC System
// ============================================================================
// Implement a Role-Based Access Control system:
// - Define roles with permissions
// - Assign roles to users
// - Check if a user has a permission
// - Support wildcard permissions (e.g., "posts:*" matches "posts:read")

interface RBACSystem {
  defineRole(name: string, permissions: string[]): void;
  assignRole(userId: string, roleName: string): boolean;
  removeRole(userId: string, roleName: string): boolean;
  hasPermission(userId: string, permission: string): boolean;
  getUserRoles(userId: string): string[];
  getUserPermissions(userId: string): string[];
}

function exercise7_createRBAC(): RBACSystem {
  return {
    defineRole(_name: string, _permissions: string[]): void {},
    assignRole(_userId: string, _roleName: string): boolean { return false; },
    removeRole(_userId: string, _roleName: string): boolean { return false; },
    hasPermission(_userId: string, _permission: string): boolean { return false; },
    getUserRoles(_userId: string): string[] { return []; },
    getUserPermissions(_userId: string): string[] { return []; },
  };
}

// const rbac = exercise7_createRBAC();
// rbac.defineRole("admin", ["users:read", "users:write", "users:delete", "posts:*"]);
// rbac.defineRole("editor", ["posts:read", "posts:write"]);
// rbac.defineRole("viewer", ["posts:read"]);
// rbac.assignRole("alice", "admin");
// rbac.assignRole("bob", "editor");
// rbac.assignRole("bob", "viewer"); // Bob has two roles
// console.log(rbac.hasPermission("alice", "users:delete")); // true
// console.log(rbac.hasPermission("alice", "posts:read")); // true (wildcard)
// console.log(rbac.hasPermission("bob", "posts:write")); // true
// console.log(rbac.hasPermission("bob", "users:read")); // false
// console.log(rbac.getUserPermissions("bob")); // ["posts:read", "posts:write"]

// ============================================================================
// Exercise 8 (Predict): Token Storage Attacks
// ============================================================================
// For each storage mechanism, predict the attack outcome.

function exercise8(): { a: string; b: string } {
  // Scenario A:
  // An app stores the JWT in localStorage.
  // The app has a reflected XSS vulnerability.
  // An attacker exploits the XSS. What can they steal?
  // Can the attacker use the stolen token from their own machine?

  // Scenario B:
  // An app stores the JWT in an HttpOnly, Secure, SameSite=Strict cookie.
  // The app has the same reflected XSS vulnerability.
  // What can the attacker steal? Can they use CSRF?

  return {
    a: "", // What happens?
    b: "", // What happens?
  };
}

// console.log("Exercise 8:", exercise8());

// ============================================================================
// Exercise 9 (Fix): Insecure JWT Validation
// ============================================================================
// Fix this JWT validation function. It has multiple security issues.

interface JWTValidationResult {
  valid: boolean;
  reason: string;
  payload?: Record<string, unknown>;
}

function exercise9_validateJWT(
  token: string,
  _expectedIssuer: string,
  _expectedAudience: string,
  currentTime?: number
): JWTValidationResult {
  // VULNERABLE — fix all issues
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "Invalid format" };

  // Issue 1: Doesn't check the algorithm (alg: "none" attack)
  // Issue 2: Doesn't validate issuer
  // Issue 3: Doesn't validate audience
  // Issue 4: Doesn't check expiration

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString()
  );

  void currentTime;
  return { valid: true, reason: "Valid", payload };
}

// console.log(exercise9_validateJWT(
//   "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwiaXNzIjoiZXZpbC5jb20ifQ.fake",
//   "auth.example.com",
//   "api.example.com"
// ));
// Should fail: algorithm is "none"

// ============================================================================
// Exercise 10 (Implement): Refresh Token Rotation
// ============================================================================
// Implement refresh token rotation with reuse detection.
// - issueTokenPair: creates access + refresh tokens
// - refresh: validates refresh token, issues new pair, invalidates old
// - If a refresh token is reused (already consumed), revoke the entire family

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

function exercise10_createTokenRotator(accessTokenTTL: number): TokenRotator {
  void accessTokenTTL;
  return {
    issueTokenPair(_userId: string): TokenPair {
      return { accessToken: "", refreshToken: "", expiresIn: 0 };
    },
    refresh(_refreshToken: string): TokenPair | { error: string } {
      return { error: "Not implemented" };
    },
    revoke(_userId: string): void {},
    isValid(_accessToken: string): { valid: boolean; userId?: string } {
      return { valid: false };
    },
  };
}

// const rotator = exercise10_createTokenRotator(300);
// const pair1 = rotator.issueTokenPair("user1");
// console.log("Pair 1:", pair1);
// console.log("Access valid:", rotator.isValid(pair1.accessToken));
// const pair2 = rotator.refresh(pair1.refreshToken);
// console.log("Pair 2:", pair2);
// const reuse = rotator.refresh(pair1.refreshToken); // Reuse!
// console.log("Reuse detected:", reuse); // Should error and revoke family

// ============================================================================
// Exercise 11 (Fix): Insecure Password Handling
// ============================================================================
// Fix this user registration/login system. It has critical security issues.

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
}

interface AuthSystem {
  register(email: string, password: string): UserRecord;
  login(email: string, password: string): { success: boolean; userId?: string; reason?: string };
}

import { createHash, randomBytes } from "node:crypto";

function exercise11_createAuthSystem(): AuthSystem {
  const users = new Map<string, UserRecord>();

  return {
    register(email: string, password: string): UserRecord {
      // VULNERABLE — fix these issues:
      // 1. No password strength validation
      // 2. Uses MD5 (too fast, broken)
      // 3. No salt
      // 4. Doesn't check for duplicate email
      const hash = createHash("md5").update(password).digest("hex");
      const user: UserRecord = {
        id: randomBytes(8).toString("hex"),
        email,
        passwordHash: hash,
        salt: "", // No salt!
      };
      users.set(email, user);
      return user;
    },

    login(email: string, password: string): { success: boolean; userId?: string; reason?: string } {
      const user = users.get(email);
      if (!user) return { success: false, reason: "User not found" };

      // VULNERABLE — timing attack possible with simple comparison
      const hash = createHash("md5").update(password).digest("hex");
      if (hash === user.passwordHash) {
        return { success: true, userId: user.id };
      }
      return { success: false, reason: "Invalid password" };
    },
  };
}

// const auth = exercise11_createAuthSystem();
// auth.register("user@example.com", "password123");
// console.log(auth.login("user@example.com", "password123"));
// console.log(auth.login("user@example.com", "wrong"));

// ============================================================================
// Exercise 12 (Predict): Session Fixation
// ============================================================================
// Predict the outcome of this attack:

function exercise12(): { attack: string; prevention: string } {
  // An attacker obtains a valid session ID from the server (e.g., by visiting
  // the login page). The session ID is: "session_abc123".
  //
  // The attacker crafts a link:
  //   https://example.com/login?sessionId=session_abc123
  //
  // The server accepts the session ID from the URL parameter and sets it as
  // the user's session cookie.
  //
  // The victim clicks the link, logs in with their credentials.
  // The server authenticates the user and associates them with session_abc123.
  //
  // Now the attacker uses session_abc123 to access the victim's account.
  //
  // 1. Why does this attack work?
  // 2. How do you prevent it?

  return {
    attack: "",     // Explain why the attack works
    prevention: "", // How to prevent it
  };
}

// console.log("Exercise 12:", exercise12());

// ============================================================================
// Exercise 13 (Implement): Cookie Parser and Builder
// ============================================================================
// Implement functions to parse and build Set-Cookie headers.

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

function exercise13_parseSetCookie(header: string): ParsedCookie {
  void header;
  return {
    name: "",
    value: "",
    attributes: { httpOnly: false, secure: false },
  };
}

function exercise13_buildSetCookie(cookie: ParsedCookie): string {
  void cookie;
  return "";
}

// console.log(exercise13_parseSetCookie(
//   "__Host-session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600"
// ));
// Expected: { name: "__Host-session", value: "abc123", attributes: { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: 3600 } }

// console.log(exercise13_buildSetCookie({
//   name: "session",
//   value: "xyz",
//   attributes: { httpOnly: true, secure: true, sameSite: "Strict", path: "/", maxAge: 7200 },
// }));
// Expected: "session=xyz; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200"

// ============================================================================
// Exercise 14 (Fix): Broken Access Control
// ============================================================================
// Fix this API handler that has broken access control.

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

function exercise14_getDocument(
  documentId: string,
  requestingUser: User,
  documents: Map<string, Document>
): APIResult {
  // VULNERABLE — fix these issues:
  // 1. No check if document exists
  // 2. No authorization check — any user can access any document
  // 3. Returns full document even for private docs to non-owners

  void requestingUser;
  const doc = documents.get(documentId);
  return { status: 200, body: doc as Document };
}

function exercise14_deleteDocument(
  documentId: string,
  requestingUser: User,
  documents: Map<string, Document>
): APIResult {
  // VULNERABLE — fix these issues:
  // 1. Any user can delete any document (should be owner or admin only)
  // 2. No check if document exists

  void requestingUser;
  documents.delete(documentId);
  return { status: 200, body: "Deleted" };
}

// const docs = new Map<string, Document>([
//   ["doc1", { id: "doc1", ownerId: "user1", content: "Secret", isPublic: false }],
//   ["doc2", { id: "doc2", ownerId: "user1", content: "Public", isPublic: true }],
// ]);
// const viewer: User = { id: "user2", role: "viewer" };
// console.log(exercise14_getDocument("doc1", viewer, docs)); // Should be 403
// console.log(exercise14_getDocument("doc2", viewer, docs)); // Should be 200
// console.log(exercise14_deleteDocument("doc1", viewer, docs)); // Should be 403

// ============================================================================
// Exercise 15 (Implement): PKCE Challenge Generator
// ============================================================================
// Implement PKCE (Proof Key for Code Exchange) challenge generation:
// 1. Generate a random code_verifier (43-128 chars, URL-safe)
// 2. Compute code_challenge = base64url(SHA256(code_verifier))
// 3. Verify that a code_verifier matches a code_challenge

import { createHash as ch } from "node:crypto";

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  challengeMethod: "S256";
}

function exercise15_generatePKCE(): PKCEPair {
  void ch;
  return {
    codeVerifier: "",
    codeChallenge: "",
    challengeMethod: "S256",
  };
}

function exercise15_verifyPKCE(codeVerifier: string, codeChallenge: string): boolean {
  void codeVerifier;
  void codeChallenge;
  return false;
}

// const pkce = exercise15_generatePKCE();
// console.log("PKCE:", pkce);
// console.log("Verify:", exercise15_verifyPKCE(pkce.codeVerifier, pkce.codeChallenge)); // true
// console.log("Wrong:", exercise15_verifyPKCE("wrong-verifier", pkce.codeChallenge)); // false

// ============================================================================
// Exercise 16 (Predict): Cookie Security
// ============================================================================
// For each cookie configuration, predict the security implications.

function exercise16(): { a: string; b: string; c: string } {
  // Cookie A:
  // Set-Cookie: session=abc; Path=/; Domain=.example.com

  // Cookie B:
  // Set-Cookie: __Host-session=abc; Secure; HttpOnly; Path=/; SameSite=Strict

  // Cookie C:
  // Set-Cookie: token=abc; Secure; SameSite=None

  return {
    a: "", // What are the security issues?
    b: "", // Is this cookie secure? Why?
    c: "", // What are the security issues?
  };
}

// console.log("Exercise 16:", exercise16());

// ============================================================================
// Exercise 17 (Implement): TOTP Generator
// ============================================================================
// Implement a simplified TOTP (Time-based One-Time Password) generator.
// Use HMAC-SHA1 to generate 6-digit codes that change every 30 seconds.
// Simplified: use the secret directly as HMAC key (real TOTP uses Base32).

import { createHmac } from "node:crypto";

function exercise17_generateTOTP(
  secret: string,
  time?: number // Unix timestamp in seconds; defaults to now
): string {
  // Steps:
  // 1. Compute time step: Math.floor(time / 30)
  // 2. Convert time step to 8-byte big-endian buffer
  // 3. Compute HMAC-SHA1(secret, timeStepBuffer)
  // 4. Dynamic truncation to get 31-bit integer
  // 5. Take modulo 10^6 for 6-digit code
  // 6. Pad with leading zeros if needed

  void createHmac;
  void secret;
  void time;
  return "000000";
}

function exercise17_verifyTOTP(
  secret: string,
  code: string,
  time?: number,
  window?: number // Number of time steps to check before/after (default: 1)
): boolean {
  void secret;
  void code;
  void time;
  void window;
  return false;
}

// const secret = "test-secret-key-12345";
// const now = Math.floor(Date.now() / 1000);
// const code = exercise17_generateTOTP(secret, now);
// console.log("TOTP Code:", code);
// console.log("Verify:", exercise17_verifyTOTP(secret, code, now)); // true
// console.log("Wrong:", exercise17_verifyTOTP(secret, "000000", now)); // likely false

// ============================================================================
// Exercise 18 (Fix): Insecure Session Management
// ============================================================================
// Fix this session management code. It has multiple vulnerabilities.

interface SessionConfig {
  cookieName: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
  regenerateOnLogin: boolean;
}

function exercise18_getSecureSessionConfig(): SessionConfig {
  // VULNERABLE — fix all issues
  return {
    cookieName: "session",    // Should use __Host- prefix
    maxAge: 86400 * 365,      // 1 year — way too long
    httpOnly: false,           // JS can access!
    secure: false,             // Sent over HTTP!
    sameSite: "None",          // No CSRF protection!
    regenerateOnLogin: false,  // Session fixation vulnerability!
  };
}

// console.log(exercise18_getSecureSessionConfig());

export {
  exercise1_base64urlEncode,
  exercise1_base64urlDecode,
  exercise2_buildJWT,
  exercise3_decodeJWT,
  exercise4_validateJWTExpiry,
  exercise5,
  exercise6_createSessionManager,
  exercise7_createRBAC,
  exercise8,
  exercise9_validateJWT,
  exercise10_createTokenRotator,
  exercise11_createAuthSystem,
  exercise12,
  exercise13_parseSetCookie,
  exercise13_buildSetCookie,
  exercise14_getDocument,
  exercise14_deleteDocument,
  exercise15_generatePKCE,
  exercise15_verifyPKCE,
  exercise16,
  exercise17_generateTOTP,
  exercise17_verifyTOTP,
  exercise18_getSecureSessionConfig,
};

console.log("Authentication & Authorization — Exercises loaded.");
console.log("Uncomment the test calls to verify your solutions.");
