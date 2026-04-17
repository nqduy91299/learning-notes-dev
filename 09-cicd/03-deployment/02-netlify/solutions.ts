// ============================================================
// Netlify Deployment — Solutions
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/02-netlify/solutions.ts
// ============================================================

type RedirectRule = { from: string; to: string; status: number; force?: boolean; conditions?: Record<string, string[]> };

// Solution 2
function resolveRedirect(rules: RedirectRule[], path: string): { to: string; status: number } | null {
  for (const r of rules) {
    if (r.from === path) return { to: r.to, status: r.status };
    if (r.from.endsWith('/*')) {
      const prefix = r.from.slice(0, -2);
      if (path.startsWith(prefix + '/') || path === prefix) {
        const splat = path.slice(prefix.length + 1);
        return { to: r.to.replace(':splat', splat), status: r.status };
      }
    }
  }
  return null;
}

// Solution 3
function parseRedirectsFile(content: string): RedirectRule[] {
  return content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const parts = l.split(/\s+/);
      return { from: parts[0], to: parts[1], status: parseInt(parts[2] || '301', 10) };
    });
}

// Solution 4
function resolveHeaders(rules: Array<{for: string; values: Record<string, string>}>, path: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rule of rules) {
    let matches = false;
    if (rule.for === path) matches = true;
    else if (rule.for.endsWith('/*') && path.startsWith(rule.for.slice(0, -1))) matches = true;
    else if (rule.for === '/*') matches = true;
    if (matches) Object.assign(result, rule.values);
  }
  return result;
}

// Solution 5
function selectBuildContext(
  contexts: Record<string, {command: string; publish?: string; environment?: Record<string,string>}>,
  deployType: string,
  defaultBuild: {command: string; publish: string}
) {
  const ctx = contexts[deployType];
  return {
    command: ctx?.command || defaultBuild.command,
    publish: ctx?.publish || defaultBuild.publish,
    environment: ctx?.environment || {},
  };
}

// Solution 6
class BuildPluginRunner {
  private plugins: Array<{name: string; onPreBuild?: () => void; onBuild?: () => void; onPostBuild?: () => void; onSuccess?: () => void; onError?: (e: Error) => void}> = [];

  register(plugin: typeof this.plugins[0]): void { this.plugins.push(plugin); }

  async run(buildFn: () => Promise<void>): Promise<{success: boolean; pluginsRun: string[]}> {
    const pluginsRun: string[] = [];
    try {
      for (const p of this.plugins) { if (p.onPreBuild) { p.onPreBuild(); pluginsRun.push(`${p.name}:onPreBuild`); } }
      await buildFn();
      for (const p of this.plugins) { if (p.onPostBuild) { p.onPostBuild(); pluginsRun.push(`${p.name}:onPostBuild`); } }
      for (const p of this.plugins) { if (p.onSuccess) { p.onSuccess(); pluginsRun.push(`${p.name}:onSuccess`); } }
      return { success: true, pluginsRun };
    } catch (e) {
      for (const p of this.plugins) { if (p.onError) { p.onError(e as Error); pluginsRun.push(`${p.name}:onError`); } }
      return { success: false, pluginsRun };
    }
  }
}

// Solution 7
class FormHandler {
  private forms = new Map<string, { fields: string[]; submissions: Array<Record<string, string>> }>();

  registerForm(name: string, fields: string[]): void { this.forms.set(name, { fields, submissions: [] }); }

  submit(formName: string, data: Record<string, string>): { success: boolean; errors: string[] } {
    const form = this.forms.get(formName);
    if (!form) return { success: false, errors: [`Form '${formName}' not found`] };
    const errors: string[] = [];
    for (const f of form.fields) { if (!data[f]) errors.push(`Missing field: ${f}`); }
    if (data['bot-field']) errors.push('Spam detected');
    if (errors.length > 0) return { success: false, errors };
    form.submissions.push(data);
    return { success: true, errors: [] };
  }

  getSubmissions(formName: string): Array<Record<string, string>> {
    return this.forms.get(formName)?.submissions || [];
  }
}

// Solution 8
function generateSPARedirects(apiRoutes: string[], indexPath: string): RedirectRule[] {
  const rules: RedirectRule[] = apiRoutes.map(r => ({ from: r, to: r, status: 200 }));
  rules.push({ from: '/*', to: indexPath, status: 200 });
  return rules;
}

// Solution 9
function generateNetlifyPreviewUrl(siteName: string, deployId: string): string {
  return `https://deploy-preview-${deployId}--${siteName}.netlify.app`;
}

// Solution 10
function validateNetlifyConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config || typeof config !== 'object') return { valid: false, errors: ['Config must be an object'] };
  const c = config as Record<string, unknown>;
  if (!c.build || typeof c.build !== 'object') { errors.push('build is required'); }
  else {
    const b = c.build as Record<string, unknown>;
    if (typeof b.command !== 'string') errors.push('build.command must be a string');
    if (typeof b.publish !== 'string') errors.push('build.publish must be a string');
  }
  if (c.redirects && Array.isArray(c.redirects)) {
    for (let i = 0; i < c.redirects.length; i++) {
      const r = c.redirects[i] as Record<string, unknown>;
      if (!r.from || !r.to || typeof r.status !== 'number') errors.push(`redirects[${i}] must have from, to, status`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// Solution 11
function routeEdgeFunction(edgeFunctions: Array<{path: string; function: string}>, requestPath: string): string | null {
  const match = edgeFunctions.find(ef => ef.path === requestPath || (ef.path.endsWith('/*') && requestPath.startsWith(ef.path.slice(0, -1))));
  return match?.function || null;
}

// Solution 12
function mergeNetlifyEnv(global: Record<string, string>, contextEnv: Record<string, string>, ui: Record<string, string>): Record<string, string> {
  return { ...global, ...ui, ...contextEnv };
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n02-netlify Solutions\n");

  await test("Ex2: Redirect resolver", () => {
    const r = resolveRedirect([{ from: "/api/*", to: "/.netlify/functions/:splat", status: 200 }], "/api/hello");
    assert(r?.to === "/.netlify/functions/hello", `got ${r?.to}`);
  });
  await test("Ex3: Parse redirects", () => {
    const r = parseRedirectsFile("# comment\n/old /new 301\n/app/* /index.html 200");
    assert(r.length === 2, "2 rules");
  });
  await test("Ex4: Headers", () => {
    const h = resolveHeaders([{ for: "/api/*", values: { "X-Custom": "yes" } }], "/api/test");
    assert(h["X-Custom"] === "yes", "matched");
  });
  await test("Ex5: Build context", () => {
    const r = selectBuildContext({ production: { command: "build:prod" } }, "production", { command: "build", publish: "dist" });
    assert(r.command === "build:prod", "context override");
  });
  await test("Ex6: Plugin runner", async () => {
    const runner = new BuildPluginRunner();
    const events: string[] = [];
    runner.register({ name: "test", onPreBuild: () => events.push("pre"), onSuccess: () => events.push("success") });
    await runner.run(async () => {});
    assert(events.includes("pre") && events.includes("success"), "lifecycle");
  });
  await test("Ex7: Form handler", () => {
    const fh = new FormHandler();
    fh.registerForm("contact", ["name", "email"]);
    assert(fh.submit("contact", { name: "A", email: "a@b.c" }).success, "valid");
    assert(!fh.submit("contact", { name: "A" }).success, "missing field");
    assert(!fh.submit("contact", { name: "A", email: "a@b", "bot-field": "spam" }).success, "spam");
  });
  await test("Ex8: SPA redirects", () => {
    const r = generateSPARedirects(["/api/*"], "/index.html");
    assert(r.length === 2, "2 rules");
    assert(r[r.length - 1].from === "/*", "catch-all last");
  });
  await test("Ex9: Preview URL", () => {
    assert(generateNetlifyPreviewUrl("mysite", "42") === "https://deploy-preview-42--mysite.netlify.app", "url");
  });
  await test("Ex10: Config validator", () => {
    assert(validateNetlifyConfig({ build: { command: "build", publish: "dist" } }).valid, "valid");
    assert(!validateNetlifyConfig({}).valid, "invalid");
  });
  await test("Ex11: Edge router", () => {
    assert(routeEdgeFunction([{ path: "/api/geo", function: "geo-handler" }], "/api/geo") === "geo-handler", "matched");
    assert(routeEdgeFunction([{ path: "/api/geo", function: "geo-handler" }], "/other") === null, "no match");
  });
  await test("Ex12: Env merger", () => {
    const r = mergeNetlifyEnv({ A: "1" }, { A: "3" }, { A: "2" });
    assert(r.A === "3", "context wins");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
