// ============================================================================
// authentication: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/authentication/exercises.ts
// ============================================================================

interface User { id: string; email: string; name: string; role: string; passwordHash: string; }
interface Session { userId: string; user: Omit<User, 'passwordHash'>; expiresAt: number; }
interface JWTPayload { sub: string; email: string; name: string; role: string; iat: number; exp: number; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  const scenarios = [
    'Server Component calls auth() — where does session data come from?',
    'Client Component calls useSession() — how is session loaded?',
    'Middleware calls auth() — what data is available?',
    'Route Handler calls auth() — how is request authenticated?',
  ];
  console.log("Exercise 1 - predict auth() behavior in each context");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
function exercise2HashPassword(password: string): string {
  // TODO: Simple hash simulation (NOT real crypto — just for learning)
  // Use a basic transform: reverse + base64-like encoding
  return '';
}

function exercise2VerifyPassword(password: string, hash: string): boolean {
  // TODO: Verify password against hash
  return false;
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
class Exercise3SessionManager {
  private sessions = new Map<string, Session>();
  private users: User[];
  constructor(users: User[]) { this.users = users; }

  createSession(userId: string, durationMs?: number): { sessionId: string; session: Session } | null {
    // TODO: Create session for user, return session ID
    return null;
  }

  getSession(sessionId: string, nowMs?: number): Session | null {
    // TODO: Get session if valid and not expired
    return null;
  }

  destroySession(sessionId: string): boolean {
    // TODO: Remove session
    return false;
  }

  refreshSession(sessionId: string, extendMs?: number): boolean {
    // TODO: Extend session expiry
    return false;
  }
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
function exercise4CreateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds: number, secret: string): string {
  // TODO: Create a simulated JWT (base64-encoded JSON, not real crypto)
  // Format: base64(header).base64(payload).base64(signature)
  return '';
}

function exercise4VerifyJWT(token: string, secret: string, nowMs?: number): { valid: boolean; payload?: JWTPayload; error?: string } {
  // TODO: Verify and decode JWT
  return { valid: false, error: 'not implemented' };
}

// ─── Exercise 5: Predict ────────────────────────────────────────────────────
function exercise5(): void {
  // JWT vs Database sessions — predict behavior in these scenarios:
  const scenarios = [
    'User logs out from one device — are other sessions affected?',
    'Admin revokes user access — when does it take effect?',
    'Server restarts — are sessions preserved?',
    'User data changes — when do other requests see the change?',
  ];
  console.log("Exercise 5 - compare JWT vs DB session behavior");
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
function exercise6ProtectedRoute(
  session: Session | null,
  requiredAuth: boolean,
  requiredRoles?: string[]
): { allowed: boolean; redirectTo?: string; reason?: string } {
  // TODO: Check if request should be allowed
  return { allowed: false };
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
class Exercise7RBAC {
  private rolePermissions: Record<string, string[]>;
  constructor(rolePermissions: Record<string, string[]>) { this.rolePermissions = rolePermissions; }

  hasPermission(role: string, permission: string): boolean {
    // TODO: Check if role has permission
    return false;
  }

  hasAnyPermission(role: string, permissions: string[]): boolean {
    return false;
  }

  hasAllPermissions(role: string, permissions: string[]): boolean {
    return false;
  }

  authorize(session: Session | null, requiredPermission: string): { allowed: boolean; reason: string } {
    // TODO: Full authorization check
    return { allowed: false, reason: '' };
  }
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
function exercise8OAuthFlow(
  provider: string,
  authCode: string,
  mockTokenExchange: (code: string) => { accessToken: string; idToken: string } | null,
  mockProfile: (token: string) => { id: string; email: string; name: string } | null
): { success: boolean; user?: { id: string; email: string; name: string; provider: string }; error?: string } {
  // TODO: Simulate OAuth flow: code → token → profile
  return { success: false, error: 'not implemented' };
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
class Exercise9CSRFProtection {
  private tokens = new Set<string>();

  generateToken(): string {
    // TODO: Generate CSRF token
    return '';
  }

  validateToken(token: string): boolean {
    // TODO: Validate and consume CSRF token (single use)
    return false;
  }
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
function exercise10CredentialsAuth(
  users: User[],
  email: string,
  password: string,
  hashFn: (p: string) => string
): { authenticated: boolean; user?: Omit<User, 'passwordHash'>; error?: string } {
  // TODO: Authenticate with email/password
  return { authenticated: false };
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
class Exercise11SessionStore {
  private store = new Map<string, { data: Session; maxAge: number; createdAt: number }>();

  set(id: string, data: Session, maxAge: number): void {}
  get(id: string, nowMs?: number): Session | null { return null; }
  destroy(id: string): void {}
  touch(id: string, maxAge: number): void {}  // Extend session
  getActiveSessions(userId: string): Session[] { return []; }
  destroyAllForUser(userId: string): number { return 0; }
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
function exercise12MiddlewareAuth(
  request: { url: string; cookies: Record<string, string>; headers: Record<string, string> },
  config: { protectedPaths: string[]; publicPaths: string[]; loginPath: string },
  verifySession: (token: string) => Session | null
): { action: 'allow' | 'redirect' | 'deny'; redirectUrl?: string; session?: Session } {
  // TODO: Middleware auth logic
  return { action: 'deny' };
}

// ─── Exercise 13: Predict ───────────────────────────────────────────────────
function exercise13(): void {
  console.log("What happens when JWT expires during an active user session?");
  console.log("What happens with refresh tokens?");
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
function exercise14RefreshToken(
  accessToken: string,
  refreshToken: string,
  verifyAccess: (t: string) => { valid: boolean; expired: boolean },
  verifyRefresh: (t: string) => { valid: boolean; userId: string } | null,
  generateTokens: (userId: string) => { accessToken: string; refreshToken: string }
): { accessToken: string; refreshToken: string; refreshed: boolean } | { error: string } {
  // TODO: Token refresh flow
  return { error: 'not implemented' };
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15AuthSystem {
  private users: User[] = [];
  private sessions = new Map<string, Session>();
  private hashFn: (p: string) => string;

  constructor(hashFn: (p: string) => string) { this.hashFn = hashFn; }

  register(email: string, password: string, name: string): { success: boolean; user?: Omit<User, 'passwordHash'>; error?: string } {
    return { success: false };
  }
  login(email: string, password: string): { success: boolean; sessionId?: string; error?: string } {
    return { success: false };
  }
  logout(sessionId: string): boolean { return false; }
  getSession(sessionId: string): Session | null { return null; }
  authorize(sessionId: string, permission: string): boolean { return false; }
}

export {
  exercise1, exercise2HashPassword, exercise2VerifyPassword,
  Exercise3SessionManager, exercise4CreateJWT, exercise4VerifyJWT,
  exercise5, exercise6ProtectedRoute, Exercise7RBAC, exercise8OAuthFlow,
  Exercise9CSRFProtection, exercise10CredentialsAuth, Exercise11SessionStore,
  exercise12MiddlewareAuth, exercise13, exercise14RefreshToken, Exercise15AuthSystem,
};
