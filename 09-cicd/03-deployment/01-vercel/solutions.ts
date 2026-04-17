// ============================================================
// Vercel Deployment — Solutions
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/01-vercel/solutions.ts
// ============================================================

type Rewrite = { source: string; destination: string };
type Redirect = { source: string; destination: string; permanent: boolean };
type VercelConfig = { buildCommand?: string; outputDirectory?: string; installCommand?: string; framework?: string; regions?: string[]; rewrites?: Rewrite[]; redirects?: Redirect[] };

// Solution 2
function detectFramework(pkg: { dependencies?: Record<string,string>; devDependencies?: Record<string,string> }): string | null {
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  if ('next' in all) return 'nextjs';
  if ('nuxt' in all) return 'nuxt';
  if ('svelte' in all) return 'sveltekit';
  if ('@angular/core' in all) return 'angular';
  return null;
}

// Solution 3
function resolveEnvVars(
  vars: Array<{key: string; value: string; target: Array<'production'|'preview'|'development'>}>,
  environment: 'production' | 'preview' | 'development'
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const v of vars) { if (v.target.includes(environment)) result[v.key] = v.value; }
  return result;
}

// Solution 4
function generatePreviewUrl(project: string, commitSha: string, team: string): string {
  return `https://${project}-${commitSha.slice(0, 7)}-${team}.vercel.app`;
}

// Solution 5
function matchRewrite(rewrites: Rewrite[], path: string): string | null {
  for (const r of rewrites) {
    const paramMatch = r.source.match(/^(.+)\/:(\w+)\*$/);
    if (paramMatch) {
      const prefix = paramMatch[1];
      if (path.startsWith(prefix + '/')) {
        const rest = path.slice(prefix.length + 1);
        return r.destination.replace(`:${paramMatch[2]}*`, rest);
      }
    }
    if (r.source === path) return r.destination;
  }
  return null;
}

// Solution 6
function resolveRedirect(redirects: Redirect[], path: string): { destination: string; statusCode: number } | null {
  for (const r of redirects) {
    if (r.source === path) return { destination: r.destination, statusCode: r.permanent ? 308 : 307 };
  }
  return null;
}

// Solution 7
function analyzeBuildOutput(files: Array<{path: string; size: number; type: 'static' | 'serverless' | 'edge'}>) {
  let largest = files[0]?.path || '';
  let largestSize = 0;
  let staticFiles = 0, serverlessFunctions = 0, edgeFunctions = 0, totalSize = 0;
  for (const f of files) {
    totalSize += f.size;
    if (f.size > largestSize) { largestSize = f.size; largest = f.path; }
    if (f.type === 'static') staticFiles++;
    else if (f.type === 'serverless') serverlessFunctions++;
    else edgeFunctions++;
  }
  return { totalSize, staticFiles, serverlessFunctions, edgeFunctions, largestFile: largest };
}

// Solution 8
class DeploymentTracker {
  private deployments: Array<{id: string; branch: string; sha: string; status: string; createdAt: Date}> = [];

  create(id: string, branch: string, sha: string): void {
    this.deployments.push({ id, branch, sha, status: 'building', createdAt: new Date() });
  }
  updateStatus(id: string, status: string): void {
    const d = this.deployments.find(d => d.id === id);
    if (d) d.status = status;
  }
  getByBranch(branch: string) { return this.deployments.filter(d => d.branch === branch).map(d => ({ id: d.id, status: d.status, sha: d.sha })); }
  getLatest(branch: string) {
    const d = this.deployments.filter(d => d.branch === branch).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return d ? { id: d.id, status: d.status } : undefined;
  }
}

// Solution 9
function validateFunctionConfig(config: { memory?: number; maxDuration?: number; regions?: string[] }) {
  const errors: string[] = [];
  if (config.memory !== undefined) {
    if (config.memory < 128 || config.memory > 3008 || config.memory % 64 !== 0)
      errors.push("Memory must be 128-3008 in 64MB increments");
  }
  if (config.maxDuration !== undefined && (config.maxDuration < 1 || config.maxDuration > 300))
    errors.push("maxDuration must be 1-300");
  if (config.regions !== undefined && config.regions.length === 0)
    errors.push("regions must be non-empty if specified");
  return { valid: errors.length === 0, errors };
}

// Solution 10
function shouldBuild(rootDirectory: string, changedFiles: string[], ignorePatterns?: string[]): boolean {
  return changedFiles.some(f => {
    if (!f.startsWith(rootDirectory)) return false;
    if (ignorePatterns) return !ignorePatterns.some(p => f.includes(p));
    return true;
  });
}

// Solution 11
function routeDeployment(branch: string, customDomains: Record<string, string>, projectName: string, team: string) {
  if (customDomains[branch]) return { url: `https://${customDomains[branch]}`, type: 'production' as const };
  return { url: `https://${projectName}-${branch}-${team}.vercel.app`, type: 'preview' as const };
}

// Solution 12
function mergeVercelConfigs(base: Partial<VercelConfig>, override: Partial<VercelConfig>): VercelConfig {
  return {
    buildCommand: override.buildCommand ?? base.buildCommand,
    outputDirectory: override.outputDirectory ?? base.outputDirectory,
    installCommand: override.installCommand ?? base.installCommand,
    framework: override.framework ?? base.framework,
    regions: [...(base.regions || []), ...(override.regions || [])],
    rewrites: [...(base.rewrites || []), ...(override.rewrites || [])],
    redirects: [...(base.redirects || []), ...(override.redirects || [])],
  };
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n01-vercel Solutions\n");

  await test("Ex2: Framework detect", () => {
    assert(detectFramework({ dependencies: { next: "14" } }) === "nextjs", "next");
    assert(detectFramework({ dependencies: {} }) === null, "unknown");
  });
  await test("Ex3: Env vars", () => {
    const r = resolveEnvVars([
      { key: "API", value: "prod-api", target: ["production"] },
      { key: "API", value: "preview-api", target: ["preview"] },
    ], "production");
    assert(r.API === "prod-api", "prod");
  });
  await test("Ex4: Preview URL", () => {
    assert(generatePreviewUrl("myapp", "abc1234567", "team1") === "https://myapp-abc1234-team1.vercel.app", "url");
  });
  await test("Ex5: Rewrite matcher", () => {
    const r = matchRewrite([{ source: "/api/:path*", destination: "/api/:path*" }], "/api/users/123");
    assert(r === "/api/users/123", `got ${r}`);
  });
  await test("Ex6: Redirect", () => {
    const r = resolveRedirect([{ source: "/old", destination: "/new", permanent: true }], "/old");
    assert(r?.statusCode === 308, "permanent");
  });
  await test("Ex7: Build output", () => {
    const r = analyzeBuildOutput([
      { path: "index.html", size: 100, type: "static" },
      { path: "api/hello.js", size: 500, type: "serverless" },
    ]);
    assert(r.totalSize === 600 && r.largestFile === "api/hello.js", "analysis");
  });
  await test("Ex8: Deployment tracker", () => {
    const t = new DeploymentTracker();
    t.create("d1", "main", "abc");
    t.updateStatus("d1", "ready");
    assert(t.getLatest("main")?.status === "ready", "ready");
  });
  await test("Ex9: Function config", () => {
    assert(validateFunctionConfig({ memory: 256, maxDuration: 30 }).valid, "valid");
    assert(!validateFunctionConfig({ memory: 100 }).valid, "invalid memory");
  });
  await test("Ex10: Build filter", () => {
    assert(shouldBuild("apps/web/", ["apps/web/src/index.ts"]), "match");
    assert(!shouldBuild("apps/web/", ["apps/api/src/index.ts"]), "no match");
  });
  await test("Ex11: URL router", () => {
    const r = routeDeployment("main", { main: "myapp.com" }, "myapp", "team");
    assert(r.type === "production", "prod");
  });
  await test("Ex12: Config merger", () => {
    const r = mergeVercelConfigs({ framework: "nextjs", regions: ["iad1"] }, { regions: ["sfo1"] });
    assert(r.regions?.length === 2, "merged regions");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
