// ============================================================================
// authentication: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/02-intermediate/authentication/solutions.ts
// ============================================================================

interface User { id: string; email: string; name: string; role: string; passwordHash: string; }
interface Session { userId: string; user: Omit<User, 'passwordHash'>; expiresAt: number; }
interface JWTPayload { sub: string; email: string; name: string; role: string; iat: number; exp: number; }

function genId(): string { return Math.random().toString(36).slice(2, 10); }

function solution1(): void {
  console.log("Server Component: auth() reads session cookie, decodes JWT or queries DB");
  console.log("Client Component: useSession() fetches /api/auth/session endpoint");
  console.log("Middleware: auth() reads cookie from request, fast JWT decode");
  console.log("Route Handler: auth() reads cookie from incoming request");
}

function solution2HashPassword(password: string): string {
  return Buffer.from(password.split('').reverse().join('') + ':salted').toString('base64');
}
function solution2VerifyPassword(password: string, hash: string): boolean {
  return solution2HashPassword(password) === hash;
}

class Solution3SessionManager {
  private sessions = new Map<string, Session>();
  private users: User[];
  constructor(users: User[]) { this.users = users; }

  createSession(userId: string, durationMs = 3600000): { sessionId: string; session: Session } | null {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    const sessionId = genId();
    const { passwordHash: _, ...safeUser } = user;
    const session: Session = { userId, user: safeUser, expiresAt: Date.now() + durationMs };
    this.sessions.set(sessionId, session);
    return { sessionId, session };
  }

  getSession(sessionId: string, nowMs = Date.now()): Session | null {
    const s = this.sessions.get(sessionId);
    if (!s || nowMs > s.expiresAt) { if (s) this.sessions.delete(sessionId); return null; }
    return s;
  }

  destroySession(sessionId: string): boolean { return this.sessions.delete(sessionId); }

  refreshSession(sessionId: string, extendMs = 3600000): boolean {
    const s = this.sessions.get(sessionId);
    if (!s) return false;
    s.expiresAt = Date.now() + extendMs;
    return true;
  }
}

function solution4CreateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds: number, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = Buffer.from(`${header}.${payloadB64}.${secret}`).toString('base64url');
  return `${header}.${payloadB64}.${sig}`;
}

function solution4VerifyJWT(token: string, secret: string, nowMs?: number): { valid: boolean; payload?: JWTPayload; error?: string } {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'Invalid token format' };
  const [header, payloadB64, sig] = parts;
  const expectedSig = Buffer.from(`${header}.${payloadB64}.${secret}`).toString('base64url');
  if (sig !== expectedSig) return { valid: false, error: 'Invalid signature' };
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as JWTPayload;
    const now = nowMs ? Math.floor(nowMs / 1000) : Math.floor(Date.now() / 1000);
    if (payload.exp < now) return { valid: false, error: 'Token expired' };
    return { valid: true, payload };
  } catch { return { valid: false, error: 'Invalid payload' }; }
}

function solution5(): void {
  console.log("Logout from one device:");
  console.log("  JWT: Other sessions unaffected (token still valid until expiry)");
  console.log("  DB:  Only that session destroyed, others still active");
  console.log("Admin revokes access:");
  console.log("  JWT: Takes effect only when token expires (or use blocklist)");
  console.log("  DB:  Immediate — delete session from database");
  console.log("Server restart:");
  console.log("  JWT: Sessions preserved (stateless, in cookie)");
  console.log("  DB:  Sessions preserved (in database)");
  console.log("User data changes:");
  console.log("  JWT: Stale until token refreshed");
  console.log("  DB:  Can be updated in session immediately");
}

function solution6ProtectedRoute(
  session: Session | null, requiredAuth: boolean, requiredRoles?: string[]
): { allowed: boolean; redirectTo?: string; reason?: string } {
  if (!requiredAuth) return { allowed: true };
  if (!session) return { allowed: false, redirectTo: '/login', reason: 'Not authenticated' };
  if (requiredRoles && !requiredRoles.includes(session.user.role)) {
    return { allowed: false, redirectTo: '/unauthorized', reason: `Role ${session.user.role} not in [${requiredRoles}]` };
  }
  return { allowed: true };
}

class Solution7RBAC {
  constructor(private rolePermissions: Record<string, string[]>) {}
  hasPermission(role: string, permission: string): boolean {
    return this.rolePermissions[role]?.includes(permission) ?? false;
  }
  hasAnyPermission(role: string, permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(role, p));
  }
  hasAllPermissions(role: string, permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(role, p));
  }
  authorize(session: Session | null, requiredPermission: string): { allowed: boolean; reason: string } {
    if (!session) return { allowed: false, reason: 'Not authenticated' };
    if (this.hasPermission(session.user.role, requiredPermission)) return { allowed: true, reason: 'Permission granted' };
    return { allowed: false, reason: `Role "${session.user.role}" lacks "${requiredPermission}"` };
  }
}

function solution8OAuthFlow(
  provider: string, authCode: string,
  mockTokenExchange: (code: string) => { accessToken: string; idToken: string } | null,
  mockProfile: (token: string) => { id: string; email: string; name: string } | null
): { success: boolean; user?: { id: string; email: string; name: string; provider: string }; error?: string } {
  const tokens = mockTokenExchange(authCode);
  if (!tokens) return { success: false, error: 'Token exchange failed' };
  const profile = mockProfile(tokens.accessToken);
  if (!profile) return { success: false, error: 'Profile fetch failed' };
  return { success: true, user: { ...profile, provider } };
}

class Solution9CSRFProtection {
  private tokens = new Set<string>();
  generateToken(): string { const t = genId() + genId(); this.tokens.add(t); return t; }
  validateToken(token: string): boolean {
    if (this.tokens.has(token)) { this.tokens.delete(token); return true; }
    return false;
  }
}

function solution10CredentialsAuth(
  users: User[], email: string, password: string, hashFn: (p: string) => string
): { authenticated: boolean; user?: Omit<User, 'passwordHash'>; error?: string } {
  const user = users.find(u => u.email === email);
  if (!user) return { authenticated: false, error: 'User not found' };
  if (user.passwordHash !== hashFn(password)) return { authenticated: false, error: 'Invalid password' };
  const { passwordHash: _, ...safeUser } = user;
  return { authenticated: true, user: safeUser };
}

class Solution11SessionStore {
  private store = new Map<string, { data: Session; maxAge: number; createdAt: number }>();
  set(id: string, data: Session, maxAge: number): void { this.store.set(id, { data, maxAge, createdAt: Date.now() }); }
  get(id: string, nowMs = Date.now()): Session | null {
    const e = this.store.get(id);
    if (!e || nowMs - e.createdAt > e.maxAge) { if (e) this.store.delete(id); return null; }
    return e.data;
  }
  destroy(id: string): void { this.store.delete(id); }
  touch(id: string, maxAge: number): void {
    const e = this.store.get(id);
    if (e) { e.maxAge = maxAge; e.createdAt = Date.now(); }
  }
  getActiveSessions(userId: string): Session[] {
    return [...this.store.values()].filter(e => e.data.userId === userId).map(e => e.data);
  }
  destroyAllForUser(userId: string): number {
    let c = 0;
    for (const [id, e] of this.store) { if (e.data.userId === userId) { this.store.delete(id); c++; } }
    return c;
  }
}

function solution12MiddlewareAuth(
  request: { url: string; cookies: Record<string, string>; headers: Record<string, string> },
  config: { protectedPaths: string[]; publicPaths: string[]; loginPath: string },
  verifySession: (token: string) => Session | null
): { action: 'allow' | 'redirect' | 'deny'; redirectUrl?: string; session?: Session } {
  if (config.publicPaths.some(p => request.url === p || request.url.startsWith(p + '/'))) return { action: 'allow' };
  const isProtected = config.protectedPaths.some(p => request.url === p || request.url.startsWith(p + '/'));
  if (!isProtected) return { action: 'allow' };
  const token = request.cookies['session-token'];
  if (!token) return { action: 'redirect', redirectUrl: `${config.loginPath}?from=${request.url}` };
  const session = verifySession(token);
  if (!session) return { action: 'redirect', redirectUrl: config.loginPath };
  return { action: 'allow', session };
}

function solution13(): void {
  console.log("JWT expiry during active session:");
  console.log("  Next request fails auth check → user redirected to login");
  console.log("  Solution: sliding window (refresh before expiry) or refresh tokens");
  console.log("Refresh tokens:");
  console.log("  Short-lived access token (~15min) + long-lived refresh token (~7d)");
  console.log("  When access token expires, use refresh token to get new pair");
}

function solution14RefreshToken(
  accessToken: string, refreshToken: string,
  verifyAccess: (t: string) => { valid: boolean; expired: boolean },
  verifyRefresh: (t: string) => { valid: boolean; userId: string } | null,
  generateTokens: (userId: string) => { accessToken: string; refreshToken: string }
): { accessToken: string; refreshToken: string; refreshed: boolean } | { error: string } {
  const accessResult = verifyAccess(accessToken);
  if (accessResult.valid) return { accessToken, refreshToken, refreshed: false };
  if (!accessResult.expired) return { error: 'Invalid access token' };
  const refreshResult = verifyRefresh(refreshToken);
  if (!refreshResult) return { error: 'Invalid refresh token' };
  const newTokens = generateTokens(refreshResult.userId);
  return { ...newTokens, refreshed: true };
}

class Solution15AuthSystem {
  private users: User[] = [];
  private sessions = new Map<string, Session>();
  private hashFn: (p: string) => string;
  constructor(hashFn: (p: string) => string) { this.hashFn = hashFn; }

  register(email: string, password: string, name: string) {
    if (this.users.find(u => u.email === email)) return { success: false as const, error: 'Email taken' };
    const user: User = { id: genId(), email, name, role: 'user', passwordHash: this.hashFn(password) };
    this.users.push(user);
    const { passwordHash: _, ...safe } = user;
    return { success: true as const, user: safe };
  }

  login(email: string, password: string) {
    const user = this.users.find(u => u.email === email);
    if (!user || user.passwordHash !== this.hashFn(password)) return { success: false as const, error: 'Invalid credentials' };
    const sid = genId();
    const { passwordHash: _, ...safe } = user;
    this.sessions.set(sid, { userId: user.id, user: safe, expiresAt: Date.now() + 3600000 });
    return { success: true as const, sessionId: sid };
  }

  logout(sessionId: string) { return this.sessions.delete(sessionId); }
  getSession(sessionId: string) { const s = this.sessions.get(sessionId); return s && s.expiresAt > Date.now() ? s : null; }
  authorize(sessionId: string, _permission: string) { return !!this.getSession(sessionId); }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();
  console.log("\n=== Exercise 2: Password Hashing ===");
  const h = solution2HashPassword('secret');
  console.log("Hash:", h, "Verify:", solution2VerifyPassword('secret', h));

  console.log("\n=== Exercise 3: Session Manager ===");
  const sm = new Solution3SessionManager([{ id: '1', email: 'a@b.com', name: 'Alice', role: 'admin', passwordHash: 'x' }]);
  const sess = sm.createSession('1');
  console.log("Created:", sess?.sessionId);
  console.log("Get:", sm.getSession(sess!.sessionId));

  console.log("\n=== Exercise 4: JWT ===");
  const jwt = solution4CreateJWT({ sub: '1', email: 'a@b.com', name: 'Alice', role: 'admin' }, 3600, 'secret');
  console.log("JWT:", jwt.substring(0, 50) + '...');
  console.log("Verify:", solution4VerifyJWT(jwt, 'secret'));
  console.log("Wrong secret:", solution4VerifyJWT(jwt, 'wrong'));

  console.log("\n=== Exercise 5 ==="); solution5();

  console.log("\n=== Exercise 6: Protected Route ===");
  console.log(solution6ProtectedRoute(null, true));
  console.log(solution6ProtectedRoute({ userId: '1', user: { id: '1', email: '', name: '', role: 'user' }, expiresAt: Infinity }, true, ['admin']));

  console.log("\n=== Exercise 7: RBAC ===");
  const rbac = new Solution7RBAC({ admin: ['read', 'write', 'delete'], user: ['read'] });
  console.log(rbac.hasPermission('admin', 'delete'));
  console.log(rbac.authorize({ userId: '1', user: { id: '1', email: '', name: '', role: 'user' }, expiresAt: Infinity }, 'delete'));

  console.log("\n=== Exercise 8: OAuth ===");
  console.log(solution8OAuthFlow('google', 'code123',
    (c) => c === 'code123' ? { accessToken: 'tok', idToken: 'id' } : null,
    (t) => t === 'tok' ? { id: '1', email: 'a@b.com', name: 'Alice' } : null
  ));

  console.log("\n=== Exercise 9: CSRF ===");
  const csrf = new Solution9CSRFProtection();
  const token = csrf.generateToken();
  console.log("Valid:", csrf.validateToken(token), "Replay:", csrf.validateToken(token));

  console.log("\n=== Exercise 10: Credentials ===");
  const hashFn = solution2HashPassword;
  console.log(solution10CredentialsAuth(
    [{ id: '1', email: 'a@b.com', name: 'Alice', role: 'user', passwordHash: hashFn('pass') }],
    'a@b.com', 'pass', hashFn
  ));

  console.log("\n=== Exercise 13 ==="); solution13();

  console.log("\n=== Exercise 14: Refresh Token ===");
  console.log(solution14RefreshToken('expired', 'refresh-ok',
    () => ({ valid: false, expired: true }),
    (t) => t === 'refresh-ok' ? { valid: true, userId: '1' } : null,
    (uid) => ({ accessToken: `new-access-${uid}`, refreshToken: `new-refresh-${uid}` })
  ));

  console.log("\n=== Exercise 15: Auth System ===");
  const auth = new Solution15AuthSystem(hashFn);
  console.log(auth.register('a@b.com', 'pass', 'Alice'));
  const login = auth.login('a@b.com', 'pass');
  console.log(login);
  if ('sessionId' in login && login.sessionId) console.log("Session:", auth.getSession(login.sessionId));
}

main().catch(console.error);
