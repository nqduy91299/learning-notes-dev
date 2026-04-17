// ============================================================================
// Vercel Deployment - Exercises
// ============================================================================
// Run with: npx tsx exercises.ts
// ============================================================================

// --------------------------------------------------------------------------
// Types
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

// --------------------------------------------------------------------------
// Exercise 1 (Predict): Environment Variable Exposure
// --------------------------------------------------------------------------
// What does this function return for the given input?
// Think about which variables are safe to expose to the client.

function exercise1_predict(): string[] {
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

// What is the output?
// const expected1 = ???;

// --------------------------------------------------------------------------
// Exercise 2 (Predict): Redirect vs Rewrite
// --------------------------------------------------------------------------
// Given these configs, what happens for a request to "/old-page"?
// Does the browser URL change or stay the same?

function exercise2_predict(): { redirectUrl: string | null; rewriteTarget: string | null } {
  const redirects: VercelRedirect[] = [
    { source: "/old-page", destination: "/new-page", permanent: true },
  ];

  const rewrites: VercelRewrite[] = [
    { source: "/old-page", destination: "/legacy/old-page" },
  ];

  // Vercel processes redirects BEFORE rewrites.
  // What is the result for a request to "/old-page"?
  const matchedRedirect = redirects.find((r) => r.source === "/old-page");
  const matchedRewrite = matchedRedirect
    ? null
    : rewrites.find((r) => r.source === "/old-page");

  return {
    redirectUrl: matchedRedirect?.destination ?? null,
    rewriteTarget: matchedRewrite?.destination ?? null,
  };
}

// What is the output?
// const expected2 = ???;

// --------------------------------------------------------------------------
// Exercise 3 (Predict): Preview URL Generation
// --------------------------------------------------------------------------
// What URL pattern does Vercel generate for this deployment?

function exercise3_predict(): string {
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

// What is the output?
// const expected3 = ???;

// --------------------------------------------------------------------------
// Exercise 4 (Fix): Vercel Config Validator
// --------------------------------------------------------------------------
// This validator has bugs. Fix them.

function exercise4_validateConfig(config: VercelConfig): ValidationResult {
  const errors: ValidationError[] = [];

  // Bug 1: Should check if redirects source starts with "/"
  if (config.redirects) {
    for (const redirect of config.redirects) {
      if (!redirect.source.startsWith("/")) {  // FIX ME
        errors.push({
          field: "redirects.source",
          message: `Redirect source must start with "/": ${redirect.source}`,
        });
      }
    }
  }

  // Bug 2: Cron schedule validation - should reject schedules with less than 5 parts
  if (config.crons) {
    for (const cron of config.crons) {
      const parts = cron.schedule.split(" ");
      if (parts.length > 5) {  // FIX ME: wrong comparison operator
        errors.push({
          field: "crons.schedule",
          message: `Invalid cron schedule: ${cron.schedule}`,
        });
      }
    }
  }

  // Bug 3: Function memory validation - valid range is 128-3008
  if (config.functions) {
    for (const [path, fn] of Object.entries(config.functions)) {
      if (fn.memory !== undefined && (fn.memory < 128 || fn.memory > 1024)) {  // FIX ME: wrong upper limit
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
// Exercise 5 (Fix): Environment Variable Resolver
// --------------------------------------------------------------------------
// This resolver should return variables matching the given scope.
// It has bugs. Fix them.

function exercise5_resolveEnv(
  variables: EnvVariable[],
  scope: EnvScope
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const variable of variables) {
    // Bug 1: Should check if the scope is included in the variable's scopes
    if (variable.scopes.includes(scope)) {  // FIX ME
      resolved[variable.key] = variable.value;
    }
  }

  // Bug 2: VERCEL_ENV system variable should match the scope parameter
  resolved["VERCEL_ENV"] = "production";  // FIX ME: should use the scope parameter
  resolved["VERCEL"] = "1";

  return resolved;
}

// --------------------------------------------------------------------------
// Exercise 6 (Implement): Deployment Config Validator
// --------------------------------------------------------------------------
// Implement a comprehensive vercel.json validator.

function exercise6_validateVercelConfig(config: VercelConfig): ValidationResult {
  // TODO: Validate:
  // 1. All redirect sources must start with "/"
  // 2. All redirect destinations must start with "/" or "http"
  // 3. All rewrite sources must start with "/"
  // 4. Cron paths must start with "/api/"
  // 5. Cron schedules must have exactly 5 space-separated parts
  // 6. Function memory must be between 128 and 3008
  // 7. Function maxDuration must be positive
  // 8. Function runtime must be "edge" or "nodejs" if specified

  const errors: ValidationError[] = [];

  // YOUR CODE HERE

  return { valid: errors.length === 0, errors };
}

// --------------------------------------------------------------------------
// Exercise 7 (Implement): Redirect/Rewrite Path Matcher
// --------------------------------------------------------------------------
// Implement a path matcher that supports :param segments.
// e.g., "/blog/:slug" should match "/blog/hello-world" with params { slug: "hello-world" }

function exercise7_matchPath(pattern: string, path: string): RouteMatch {
  // TODO: Implement path matching with :param support
  // - Split both pattern and path by "/"
  // - Match literal segments exactly
  // - Capture :param segments into params object
  // - Return { matched: false, params: {} } if lengths differ or literal mismatch

  // YOUR CODE HERE

  return { matched: false, params: {} };
}

// --------------------------------------------------------------------------
// Exercise 8 (Implement): Preview URL Generator
// --------------------------------------------------------------------------
// Generate Vercel preview deployment URLs from deployment info.

function exercise8_generatePreviewUrl(deployment: DeploymentInfo): string {
  // TODO: Implement preview URL generation
  // - If isProduction: return "<project>.vercel.app"
  // - If preview: return "<project>-git-<sanitized-branch>-<team>.vercel.app"
  // - Sanitize branch: replace "/" with "-", lowercase, remove non-alphanumeric except "-"

  // YOUR CODE HERE

  return "";
}

// --------------------------------------------------------------------------
// Exercise 9 (Implement): Edge vs Serverless Runtime Selector
// --------------------------------------------------------------------------
// Recommend the appropriate runtime based on function characteristics.

interface FunctionCharacteristics {
  usesFileSystem: boolean;
  usesNativeModules: boolean;
  requiresLowLatency: boolean;
  isGloballyDistributed: boolean;
  maxExecutionMs: number;
  memoryRequirementMb: number;
}

function exercise9_selectRuntime(chars: FunctionCharacteristics): RuntimeRecommendation {
  // TODO: Recommend "edge" or "serverless" based on:
  // - If usesFileSystem or usesNativeModules → serverless (edge can't do these)
  // - If memoryRequirementMb > 128 → serverless (edge limited to 128MB)
  // - If maxExecutionMs > 30000 → serverless (edge max is 30s)
  // - If requiresLowLatency and isGloballyDistributed → edge
  // - Default to serverless
  // Include reasons for the recommendation

  // YOUR CODE HERE

  return { runtime: "serverless", reasons: [] };
}

// --------------------------------------------------------------------------
// Exercise 10 (Implement): Environment Variable Security Checker
// --------------------------------------------------------------------------
// Check environment variables for common security issues.

interface SecurityIssue {
  variable: string;
  severity: "error" | "warning";
  message: string;
}

function exercise10_checkEnvSecurity(variables: EnvVariable[]): SecurityIssue[] {
  // TODO: Check for these issues:
  // 1. (error) NEXT_PUBLIC_ variables containing "secret", "password", "key", or "token" in value
  //    (case-insensitive check on value)
  // 2. (warning) Variables with "production" scope that don't have "preview" scope
  //    (may cause preview deployments to fail)
  // 3. (error) Variables with empty values
  // 4. (warning) NEXT_PUBLIC_ variables available in "development" but not "production"
  //    (may cause runtime errors in production)

  // YOUR CODE HERE

  return [];
}

// ============================================================================
// Test runner (uncomment to test)
// ============================================================================

/*
console.log("Exercise 1:", exercise1_predict());
console.log("Exercise 2:", exercise2_predict());
console.log("Exercise 3:", exercise3_predict());

console.log("Exercise 4:", exercise4_validateConfig({
  redirects: [{ source: "no-slash", destination: "/dest", permanent: true }],
  crons: [{ path: "/api/cron", schedule: "0 8 * *" }],
  functions: { "api/test.ts": { memory: 2048 } },
}));

console.log("Exercise 5:", exercise5_resolveEnv(
  [
    { key: "DB_URL", value: "postgres://...", scopes: ["production"] },
    { key: "API_KEY", value: "xxx", scopes: ["production", "preview"] },
  ],
  "preview"
));

console.log("Exercise 6:", exercise6_validateVercelConfig({
  redirects: [
    { source: "/old", destination: "/new", permanent: true },
    { source: "bad", destination: "/new", permanent: false },
  ],
  crons: [{ path: "/not-api/cron", schedule: "0 8 * * *" }],
  functions: { "api/test.ts": { memory: 5000, maxDuration: -1 } },
}));

console.log("Exercise 7:", exercise7_matchPath("/blog/:slug", "/blog/hello-world"));
console.log("Exercise 7:", exercise7_matchPath("/blog/:slug", "/about"));

console.log("Exercise 8:", exercise8_generatePreviewUrl({
  project: "my-app", team: "acme", branch: "feature/Auth-Flow",
  commitSha: "abc123", isProduction: false,
}));

console.log("Exercise 9:", exercise9_selectRuntime({
  usesFileSystem: false, usesNativeModules: false,
  requiresLowLatency: true, isGloballyDistributed: true,
  maxExecutionMs: 5000, memoryRequirementMb: 64,
}));

console.log("Exercise 10:", exercise10_checkEnvSecurity([
  { key: "NEXT_PUBLIC_SECRET", value: "sk_live_secret_key", scopes: ["production"] },
  { key: "DB_URL", value: "", scopes: ["production"] },
  { key: "NEXT_PUBLIC_GA", value: "G-XXX", scopes: ["development"] },
]));
*/

console.log("Exercises file compiles successfully.");
