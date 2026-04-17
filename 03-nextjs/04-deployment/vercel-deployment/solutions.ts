// ============================================================================
// Vercel Deployment - Solutions
// ============================================================================
// Run with: npx tsx solutions.ts
// ============================================================================

// --------------------------------------------------------------------------
// Types (shared with exercises)
// --------------------------------------------------------------------------

interface VercelRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

interface VercelRewrite {
  source: string;
  destination: string;
}

interface VercelHeader {
  source: string;
  headers: Array<{ key: string; value: string }>;
}

interface VercelCron {
  path: string;
  schedule: string;
}

interface FunctionConfig {
  runtime?: "edge" | "nodejs";
  memory?: number;
  maxDuration?: number;
}

interface VercelConfig {
  redirects?: VercelRedirect[];
  rewrites?: VercelRewrite[];
  headers?: VercelHeader[];
  crons?: VercelCron[];
  functions?: Record<string, FunctionConfig>;
}

type EnvScope = "production" | "preview" | "development";

interface EnvVariable {
  key: string;
  value: string;
  scopes: EnvScope[];
}

interface DeploymentInfo {
  project: string;
  team: string;
  branch: string;
  commitSha: string;
  isProduction: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface RouteMatch {
  matched: boolean;
  params: Record<string, string>;
}

interface RuntimeRecommendation {
  runtime: "edge" | "serverless";
  reasons: string[];
}

interface FunctionCharacteristics {
  usesFileSystem: boolean;
  usesNativeModules: boolean;
  requiresLowLatency: boolean;
  isGloballyDistributed: boolean;
  maxExecutionMs: number;
  memoryRequirementMb: number;
}

interface SecurityIssue {
  variable: string;
  severity: "error" | "warning";
  message: string;
}

// --------------------------------------------------------------------------
// Solution 1 (Predict): Environment Variable Exposure
// --------------------------------------------------------------------------

function solution1_predict(): string[] {
  const envVars: EnvVariable[] = [
    { key: "DATABASE_URL", value: "postgres://...", scopes: ["production"] },
    { key: "NEXT_PUBLIC_API_URL", value: "https://api.example.com", scopes: ["production", "preview"] },
    { key: "SECRET_KEY", value: "sk_live_xxx", scopes: ["production"] },
    { key: "NEXT_PUBLIC_GA_ID", value: "G-XXXXX", scopes: ["production", "preview", "development"] },
  ];

  return envVars
    .filter((v) => v.key.startsWith("NEXT_PUBLIC_"))
    .map((v) => v.key);
}

// Answer: ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_GA_ID"]
// Only variables with the NEXT_PUBLIC_ prefix are exposed to the client bundle.

// --------------------------------------------------------------------------
// Solution 2 (Predict): Redirect vs Rewrite
// --------------------------------------------------------------------------

function solution2_predict(): { redirectUrl: string | null; rewriteTarget: string | null } {
  const redirects: VercelRedirect[] = [
    { source: "/old-page", destination: "/new-page", permanent: true },
  ];

  const rewrites: VercelRewrite[] = [
    { source: "/old-page", destination: "/legacy/old-page" },
  ];

  const matchedRedirect = redirects.find((r) => r.source === "/old-page");
  const matchedRewrite = matchedRedirect
    ? null
    : rewrites.find((r) => r.source === "/old-page");

  return {
    redirectUrl: matchedRedirect?.destination ?? null,
    rewriteTarget: matchedRewrite?.destination ?? null,
  };
}

// Answer: { redirectUrl: "/new-page", rewriteTarget: null }
// Redirects are processed before rewrites. Since the redirect matches,
// the rewrite is never evaluated. The browser URL changes to /new-page.

// --------------------------------------------------------------------------
// Solution 3 (Predict): Preview URL Generation
// --------------------------------------------------------------------------

function solution3_predict(): string {
  const deployment: DeploymentInfo = {
    project: "my-app",
    team: "acme",
    branch: "feature/auth",
    commitSha: "abc1234",
    isProduction: false,
  };

  const sanitizedBranch = deployment.branch.replace(/\//g, "-");
  return `${deployment.project}-git-${sanitizedBranch}-${deployment.team}.vercel.app`;
}

// Answer: "my-app-git-feature-auth-acme.vercel.app"
// The "/" in "feature/auth" is replaced with "-".

// --------------------------------------------------------------------------
// Solution 4 (Fix): Vercel Config Validator
// --------------------------------------------------------------------------

function solution4_validateConfig(config: VercelConfig): ValidationResult {
  const errors: ValidationError[] = [];

  if (config.redirects) {
    for (const redirect of config.redirects) {
      // Fix 1: The condition was correct (checking !startsWith), no change needed
      if (!redirect.source.startsWith("/")) {
        errors.push({
          field: "redirects.source",
          message: `Redirect source must start with "/": ${redirect.source}`,
        });
      }
    }
  }

  if (config.crons) {
    for (const cron of config.crons) {
      const parts = cron.schedule.split(" ");
      // Fix 2: Changed > 5 to !== 5 (must have exactly 5 parts)
      if (parts.length !== 5) {
        errors.push({
          field: "crons.schedule",
          message: `Invalid cron schedule: ${cron.schedule}`,
        });
      }
    }
  }

  if (config.functions) {
    for (const [path, fn] of Object.entries(config.functions)) {
      // Fix 3: Changed upper limit from 1024 to 3008
      if (fn.memory !== undefined && (fn.memory < 128 || fn.memory > 3008)) {
        errors.push({
          field: `functions.${path}.memory`,
          message: `Memory must be between 128 and 3008 MB`,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// --------------------------------------------------------------------------
// Solution 5 (Fix): Environment Variable Resolver
// --------------------------------------------------------------------------

function solution5_resolveEnv(
  variables: EnvVariable[],
  scope: EnvScope
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const variable of variables) {
    // Fix 1: was already correct (includes check)
    if (variable.scopes.includes(scope)) {
      resolved[variable.key] = variable.value;
    }
  }

  // Fix 2: Use the scope parameter instead of hardcoded "production"
  resolved["VERCEL_ENV"] = scope;
  resolved["VERCEL"] = "1";

  return resolved;
}

// --------------------------------------------------------------------------
// Solution 6 (Implement): Deployment Config Validator
// --------------------------------------------------------------------------

function solution6_validateVercelConfig(config: VercelConfig): ValidationResult {
  const errors: ValidationError[] = [];

  if (config.redirects) {
    for (const redirect of config.redirects) {
      if (!redirect.source.startsWith("/")) {
        errors.push({
          field: "redirects.source",
          message: `Redirect source must start with "/": ${redirect.source}`,
        });
      }
      if (!redirect.destination.startsWith("/") && !redirect.destination.startsWith("http")) {
        errors.push({
          field: "redirects.destination",
          message: `Redirect destination must start with "/" or "http": ${redirect.destination}`,
        });
      }
    }
  }

  if (config.rewrites) {
    for (const rewrite of config.rewrites) {
      if (!rewrite.source.startsWith("/")) {
        errors.push({
          field: "rewrites.source",
          message: `Rewrite source must start with "/": ${rewrite.source}`,
        });
      }
    }
  }

  if (config.crons) {
    for (const cron of config.crons) {
      if (!cron.path.startsWith("/api/")) {
        errors.push({
          field: "crons.path",
          message: `Cron path must start with "/api/": ${cron.path}`,
        });
      }
      const parts = cron.schedule.split(" ");
      if (parts.length !== 5) {
        errors.push({
          field: "crons.schedule",
          message: `Cron schedule must have exactly 5 parts: ${cron.schedule}`,
        });
      }
    }
  }

  if (config.functions) {
    for (const [path, fn] of Object.entries(config.functions)) {
      if (fn.memory !== undefined && (fn.memory < 128 || fn.memory > 3008)) {
        errors.push({
          field: `functions.${path}.memory`,
          message: `Memory must be between 128 and 3008 MB`,
        });
      }
      if (fn.maxDuration !== undefined && fn.maxDuration <= 0) {
        errors.push({
          field: `functions.${path}.maxDuration`,
          message: `maxDuration must be positive`,
        });
      }
      if (fn.runtime !== undefined && fn.runtime !== "edge" && fn.runtime !== "nodejs") {
        errors.push({
          field: `functions.${path}.runtime`,
          message: `Runtime must be "edge" or "nodejs"`,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// --------------------------------------------------------------------------
// Solution 7 (Implement): Redirect/Rewrite Path Matcher
// --------------------------------------------------------------------------

function solution7_matchPath(pattern: string, path: string): RouteMatch {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

// --------------------------------------------------------------------------
// Solution 8 (Implement): Preview URL Generator
// --------------------------------------------------------------------------

function solution8_generatePreviewUrl(deployment: DeploymentInfo): string {
  if (deployment.isProduction) {
    return `${deployment.project}.vercel.app`;
  }

  const sanitizedBranch = deployment.branch
    .replace(/\//g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return `${deployment.project}-git-${sanitizedBranch}-${deployment.team}.vercel.app`;
}

// --------------------------------------------------------------------------
// Solution 9 (Implement): Edge vs Serverless Runtime Selector
// --------------------------------------------------------------------------

function solution9_selectRuntime(chars: FunctionCharacteristics): RuntimeRecommendation {
  const reasons: string[] = [];

  if (chars.usesFileSystem) {
    reasons.push("Uses file system (not available in edge runtime)");
    return { runtime: "serverless", reasons };
  }

  if (chars.usesNativeModules) {
    reasons.push("Uses native Node.js modules (not available in edge runtime)");
    return { runtime: "serverless", reasons };
  }

  if (chars.memoryRequirementMb > 128) {
    reasons.push(`Requires ${chars.memoryRequirementMb}MB memory (edge limited to 128MB)`);
    return { runtime: "serverless", reasons };
  }

  if (chars.maxExecutionMs > 30000) {
    reasons.push(`Max execution ${chars.maxExecutionMs}ms exceeds edge limit of 30000ms`);
    return { runtime: "serverless", reasons };
  }

  if (chars.requiresLowLatency && chars.isGloballyDistributed) {
    reasons.push("Requires low latency with global distribution");
    reasons.push("No file system or native module dependencies");
    return { runtime: "edge", reasons };
  }

  if (chars.requiresLowLatency) {
    reasons.push("Requires low latency (edge has near-zero cold starts)");
    return { runtime: "edge", reasons };
  }

  reasons.push("No specific edge requirements; defaulting to serverless for full Node.js API access");
  return { runtime: "serverless", reasons };
}

// --------------------------------------------------------------------------
// Solution 10 (Implement): Environment Variable Security Checker
// --------------------------------------------------------------------------

function solution10_checkEnvSecurity(variables: EnvVariable[]): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const sensitivePatterns = ["secret", "password", "key", "token"];

  for (const v of variables) {
    // Check 1: NEXT_PUBLIC_ with sensitive values
    if (v.key.startsWith("NEXT_PUBLIC_")) {
      const lowerValue = v.value.toLowerCase();
      for (const pattern of sensitivePatterns) {
        if (lowerValue.includes(pattern)) {
          issues.push({
            variable: v.key,
            severity: "error",
            message: `NEXT_PUBLIC_ variable "${v.key}" contains "${pattern}" in its value. This will be exposed in the client bundle.`,
          });
          break;
        }
      }
    }

    // Check 2: Production without preview scope
    if (v.scopes.includes("production") && !v.scopes.includes("preview")) {
      issues.push({
        variable: v.key,
        severity: "warning",
        message: `"${v.key}" has production scope but not preview. Preview deployments may fail.`,
      });
    }

    // Check 3: Empty values
    if (v.value === "") {
      issues.push({
        variable: v.key,
        severity: "error",
        message: `"${v.key}" has an empty value.`,
      });
    }

    // Check 4: NEXT_PUBLIC_ in development but not production
    if (
      v.key.startsWith("NEXT_PUBLIC_") &&
      v.scopes.includes("development") &&
      !v.scopes.includes("production")
    ) {
      issues.push({
        variable: v.key,
        severity: "warning",
        message: `"${v.key}" is available in development but not production. May cause runtime errors.`,
      });
    }
  }

  return issues;
}

// ============================================================================
// Test Runner
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string): void {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  FAIL: ${testName}`);
    failed++;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

console.log("=== Exercise 1: Environment Variable Exposure ===");
const r1 = solution1_predict();
assert(deepEqual(r1, ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_GA_ID"]), "filters NEXT_PUBLIC_ vars");

console.log("\n=== Exercise 2: Redirect vs Rewrite ===");
const r2 = solution2_predict();
assert(r2.redirectUrl === "/new-page", "redirect takes priority");
assert(r2.rewriteTarget === null, "rewrite is skipped when redirect matches");

console.log("\n=== Exercise 3: Preview URL Generation ===");
const r3 = solution3_predict();
assert(r3 === "my-app-git-feature-auth-acme.vercel.app", "generates correct preview URL");

console.log("\n=== Exercise 4: Config Validator Fixes ===");
const r4 = solution4_validateConfig({
  redirects: [{ source: "no-slash", destination: "/dest", permanent: true }],
  crons: [{ path: "/api/cron", schedule: "0 8 * *" }],
  functions: { "api/test.ts": { memory: 2048 } },
});
assert(!r4.valid, "config is invalid");
assert(r4.errors.length === 2, "has 2 errors (redirect source + cron schedule)");

const r4b = solution4_validateConfig({
  redirects: [{ source: "/valid", destination: "/dest", permanent: true }],
  crons: [{ path: "/api/cron", schedule: "0 8 * * *" }],
  functions: { "api/test.ts": { memory: 2048 } },
});
assert(r4b.valid, "valid config passes");

console.log("\n=== Exercise 5: Environment Variable Resolver ===");
const r5 = solution5_resolveEnv(
  [
    { key: "DB_URL", value: "postgres://...", scopes: ["production"] },
    { key: "API_KEY", value: "xxx", scopes: ["production", "preview"] },
  ],
  "preview"
);
assert(r5["API_KEY"] === "xxx", "includes preview-scoped variable");
assert(r5["DB_URL"] === undefined, "excludes production-only variable");
assert(r5["VERCEL_ENV"] === "preview", "VERCEL_ENV matches scope");
assert(r5["VERCEL"] === "1", "VERCEL is always 1");

console.log("\n=== Exercise 6: Comprehensive Config Validator ===");
const r6 = solution6_validateVercelConfig({
  redirects: [
    { source: "/old", destination: "/new", permanent: true },
    { source: "bad", destination: "also-bad", permanent: false },
  ],
  crons: [{ path: "/not-api/cron", schedule: "0 8 * * *" }],
  functions: { "api/test.ts": { memory: 5000, maxDuration: -1 } },
});
assert(!r6.valid, "invalid config detected");
assert(r6.errors.some((e) => e.field === "redirects.source"), "catches bad redirect source");
assert(r6.errors.some((e) => e.field === "redirects.destination"), "catches bad redirect destination");
assert(r6.errors.some((e) => e.field === "crons.path"), "catches bad cron path");
assert(r6.errors.some((e) => e.field.includes("memory")), "catches bad memory");
assert(r6.errors.some((e) => e.field.includes("maxDuration")), "catches bad maxDuration");

const r6b = solution6_validateVercelConfig({
  redirects: [{ source: "/a", destination: "https://example.com", permanent: true }],
  crons: [{ path: "/api/cron", schedule: "0 8 * * *" }],
  functions: { "api/x.ts": { memory: 1024, maxDuration: 30, runtime: "edge" } },
});
assert(r6b.valid, "valid comprehensive config passes");

console.log("\n=== Exercise 7: Path Matcher ===");
const r7a = solution7_matchPath("/blog/:slug", "/blog/hello-world");
assert(r7a.matched, "matches parameterized path");
assert(r7a.params["slug"] === "hello-world", "captures slug param");

const r7b = solution7_matchPath("/blog/:slug", "/about");
assert(!r7b.matched, "rejects non-matching path");

const r7c = solution7_matchPath("/users/:id/posts/:postId", "/users/42/posts/99");
assert(r7c.matched, "matches multi-param path");
assert(r7c.params["id"] === "42", "captures first param");
assert(r7c.params["postId"] === "99", "captures second param");

const r7d = solution7_matchPath("/exact/match", "/exact/match");
assert(r7d.matched, "matches exact path");
assert(Object.keys(r7d.params).length === 0, "no params for exact match");

console.log("\n=== Exercise 8: Preview URL Generator ===");
const r8a = solution8_generatePreviewUrl({
  project: "my-app", team: "acme", branch: "feature/Auth-Flow",
  commitSha: "abc123", isProduction: false,
});
assert(r8a === "my-app-git-feature-auth-flow-acme.vercel.app", "generates sanitized preview URL");

const r8b = solution8_generatePreviewUrl({
  project: "my-app", team: "acme", branch: "main",
  commitSha: "abc123", isProduction: true,
});
assert(r8b === "my-app.vercel.app", "generates production URL");

console.log("\n=== Exercise 9: Runtime Selector ===");
const r9a = solution9_selectRuntime({
  usesFileSystem: true, usesNativeModules: false,
  requiresLowLatency: true, isGloballyDistributed: true,
  maxExecutionMs: 5000, memoryRequirementMb: 64,
});
assert(r9a.runtime === "serverless", "file system requires serverless");

const r9b = solution9_selectRuntime({
  usesFileSystem: false, usesNativeModules: false,
  requiresLowLatency: true, isGloballyDistributed: true,
  maxExecutionMs: 5000, memoryRequirementMb: 64,
});
assert(r9b.runtime === "edge", "low latency + global = edge");

const r9c = solution9_selectRuntime({
  usesFileSystem: false, usesNativeModules: false,
  requiresLowLatency: false, isGloballyDistributed: false,
  maxExecutionMs: 60000, memoryRequirementMb: 512,
});
assert(r9c.runtime === "serverless", "high memory + long execution = serverless");

console.log("\n=== Exercise 10: Environment Security Checker ===");
const r10 = solution10_checkEnvSecurity([
  { key: "NEXT_PUBLIC_AUTH", value: "sk_live_secret_key", scopes: ["production"] },
  { key: "DB_URL", value: "", scopes: ["production"] },
  { key: "NEXT_PUBLIC_GA", value: "G-XXX", scopes: ["development"] },
  { key: "SAFE_VAR", value: "hello", scopes: ["production", "preview"] },
]);
assert(r10.some((i) => i.variable === "NEXT_PUBLIC_AUTH" && i.severity === "error"), "catches secret in NEXT_PUBLIC_");
assert(r10.some((i) => i.variable === "DB_URL" && i.severity === "error"), "catches empty value");
assert(r10.some((i) => i.variable === "NEXT_PUBLIC_GA" && i.severity === "warning"), "catches dev-only NEXT_PUBLIC_");
assert(r10.some((i) => i.variable === "NEXT_PUBLIC_AUTH" && i.message.includes("preview")), "warns about missing preview scope");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
}
