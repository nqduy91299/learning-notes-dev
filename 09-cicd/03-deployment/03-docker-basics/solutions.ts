// ============================================================
// Docker Basics — Solutions
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/03-docker-basics/solutions.ts
// ============================================================

type DockerInstruction = { type: string; args: string };

// Solution 2
function parseDockerfile(content: string): DockerInstruction[] {
  const lines = content.split('\n');
  const result: DockerInstruction[] = [];
  let buffer = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) { if (!buffer) continue; }
    buffer += (buffer ? ' ' : '') + trimmed.replace(/\\$/, '');
    if (!line.trimEnd().endsWith('\\')) {
      const match = buffer.match(/^(\w+)\s+(.*)/);
      if (match) result.push({ type: match[1], args: match[2] });
      buffer = '';
    }
  }
  return result;
}

// Solution 3
function simulateLayerCache(
  instructions: DockerInstruction[],
  cachedLayers: Array<{instruction: string; hash: string}>,
  fileHashes: Record<string, string>
): Array<{instruction: string; cached: boolean}> {
  const result: Array<{instruction: string; cached: boolean}> = [];
  let invalidated = false;
  for (const inst of instructions) {
    const key = `${inst.type} ${inst.args}`;
    if (invalidated) { result.push({ instruction: key, cached: false }); continue; }
    if (inst.type === 'COPY') {
      const cached = cachedLayers.find(c => c.instruction === key);
      const files = inst.args.split(/\s+/).slice(0, -1);
      const currentHash = files.map(f => fileHashes[f] || '').join(':');
      if (cached && cached.hash === currentHash) { result.push({ instruction: key, cached: true }); }
      else { invalidated = true; result.push({ instruction: key, cached: false }); }
    } else {
      const cached = cachedLayers.find(c => c.instruction === key);
      if (cached) { result.push({ instruction: key, cached: true }); }
      else { invalidated = true; result.push({ instruction: key, cached: false }); }
    }
  }
  return result;
}

// Solution 4
function analyzeMultiStage(instructions: DockerInstruction[]) {
  const stages: Array<{name: string | null; instructionCount: number; fromImage: string}> = [];
  let current: typeof stages[0] | null = null;
  for (const inst of instructions) {
    if (inst.type === 'FROM') {
      if (current) stages.push(current);
      const asMatch = inst.args.match(/^(\S+)\s+AS\s+(\S+)/i);
      current = { name: asMatch ? asMatch[2] : null, instructionCount: 1, fromImage: asMatch ? asMatch[1] : inst.args.split(/\s/)[0] };
    } else if (current) { current.instructionCount++; }
  }
  if (current) stages.push(current);
  return stages;
}

// Solution 5
function estimateImageSize(baseImageSizeMB: number, instructions: DockerInstruction[], fileSizes: Record<string, number>): number {
  let size = baseImageSizeMB;
  for (const inst of instructions) {
    if (inst.type === 'COPY' && !inst.args.startsWith('--from')) {
      const parts = inst.args.split(/\s+/);
      for (let i = 0; i < parts.length - 1; i++) {
        size += fileSizes[parts[i]] || 0;
      }
    } else if (inst.type === 'RUN') size += 5;
  }
  return size;
}

// Solution 6
function isIgnored(path: string, patterns: string[]): boolean {
  let ignored = false;
  for (const pattern of patterns) {
    if (pattern.startsWith('!')) {
      const p = pattern.slice(1);
      if (path === p || path.startsWith(p + '/')) ignored = false;
    } else if (pattern.startsWith('*.')) {
      if (path.endsWith(pattern.slice(1))) ignored = true;
    } else {
      if (path === pattern || path.startsWith(pattern + '/')) ignored = true;
    }
  }
  return ignored;
}

// Solution 7
function parseComposeServices(config: {
  services: Record<string, {image?: string; build?: string; ports?: string[]; depends_on?: string[]; environment?: string[]}>
}) {
  return Object.entries(config.services).map(([name, svc]) => ({
    name,
    type: (svc.build ? 'build' : 'image') as 'image' | 'build',
    ports: (svc.ports || []).map(p => { const [h, c] = p.split(':'); return { host: parseInt(h), container: parseInt(c) }; }),
    dependencies: svc.depends_on || [],
  }));
}

// Solution 8
function detectPortConflicts(services: Array<{name: string; ports: Array<{host: number}>}>) {
  const portMap = new Map<number, string[]>();
  for (const svc of services) for (const p of svc.ports) {
    if (!portMap.has(p.host)) portMap.set(p.host, []);
    portMap.get(p.host)!.push(svc.name);
  }
  return [...portMap.entries()].filter(([, svcs]) => svcs.length > 1).map(([port, svcs]) => ({ port, services: svcs }));
}

// Solution 9
function lintDockerfile(instructions: DockerInstruction[]): string[] {
  const warnings: string[] = [];
  if (instructions.length === 0 || instructions[0].type !== 'FROM') warnings.push('Dockerfile must start with FROM');
  const hasFrom = instructions.some(i => i.type === 'FROM');
  if (hasFrom) {
    const fromInst = instructions.find(i => i.type === 'FROM')!;
    if (fromInst.args.includes(':latest') || (!fromInst.args.includes(':') && !fromInst.args.includes(' AS')))
      warnings.push('Avoid using latest tag');
  }
  const firstCopyIdx = instructions.findIndex(i => i.type === 'COPY' || i.type === 'RUN');
  const workdirIdx = instructions.findIndex(i => i.type === 'WORKDIR');
  if (firstCopyIdx >= 0 && (workdirIdx < 0 || workdirIdx > firstCopyIdx)) warnings.push('Set WORKDIR before COPY/RUN');
  const hasCmd = instructions.some(i => i.type === 'CMD' || i.type === 'ENTRYPOINT');
  if (!hasCmd) warnings.push('Should have CMD or ENTRYPOINT');
  return warnings;
}

// Solution 10
function generateTags(registry: string, repo: string, sha: string, branch: string, version?: string): string[] {
  const base = `${registry}/${repo}`;
  const tags = [`${base}:${sha.slice(0, 7)}`, `${base}:${branch.replace(/\//g, '-')}`];
  if (version) tags.push(`${base}:${version}`);
  if (branch === 'main') tags.push(`${base}:latest`);
  return tags;
}

// Solution 11
function resolveArgs(instructions: DockerInstruction[], buildArgs: Record<string, string>): DockerInstruction[] {
  const argDefaults: Record<string, string> = {};
  for (const inst of instructions) {
    if (inst.type === 'ARG') {
      const [name, def] = inst.args.split('=');
      argDefaults[name] = def || '';
    }
  }
  const allArgs = { ...argDefaults, ...buildArgs };
  return instructions.map(inst => ({
    type: inst.type,
    args: inst.args.replace(/\$\{(\w+)\}/g, (_m, key) => allArgs[key] || ''),
  }));
}

// Solution 12
class HealthChecker {
  private checks = new Map<string, { check: () => Promise<boolean>; intervalMs: number }>();

  register(name: string, check: () => Promise<boolean>, _intervalMs: number): void {
    this.checks.set(name, { check, intervalMs: _intervalMs });
  }

  async checkAll(): Promise<Record<string, 'healthy' | 'unhealthy'>> {
    const result: Record<string, 'healthy' | 'unhealthy'> = {};
    for (const [name, { check }] of this.checks) {
      try { result[name] = await check() ? 'healthy' : 'unhealthy'; }
      catch { result[name] = 'unhealthy'; }
    }
    return result;
  }

  async waitForHealthy(name: string, timeoutMs: number): Promise<boolean> {
    const entry = this.checks.get(name);
    if (!entry) return false;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try { if (await entry.check()) return true; } catch {}
      await new Promise(r => setTimeout(r, Math.min(entry.intervalMs, 50)));
    }
    return false;
  }
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n03-docker-basics Solutions\n");

  await test("Ex2: Parse Dockerfile", () => {
    const r = parseDockerfile("FROM node:20\nWORKDIR /app\n# comment\nCOPY . .\nRUN npm ci\nCMD [\"node\",\"index.js\"]");
    assert(r.length === 5, `${r.length} instructions`);
    assert(r[0].type === "FROM", "FROM first");
  });
  await test("Ex3: Layer cache", () => {
    const r = simulateLayerCache(
      [{ type: "COPY", args: "package.json ./" }, { type: "RUN", args: "npm ci" }, { type: "COPY", args: "src/ ./src/" }],
      [{ instruction: "COPY package.json ./", hash: "abc" }, { instruction: "RUN npm ci", hash: "" }],
      { "package.json": "abc", "src/": "changed" }
    );
    assert(r[0].cached && r[1].cached && !r[2].cached, "cache pattern");
  });
  await test("Ex4: Multi-stage", () => {
    const r = analyzeMultiStage([
      { type: "FROM", args: "node:20 AS builder" }, { type: "RUN", args: "npm ci" },
      { type: "FROM", args: "node:20-alpine" }, { type: "COPY", args: "--from=builder /app /app" },
    ]);
    assert(r.length === 2, "2 stages");
    assert(r[0].name === "builder", "named stage");
  });
  await test("Ex5: Image size", () => {
    const s = estimateImageSize(50, [{ type: "COPY", args: "dist/ ./" }, { type: "RUN", args: "apk add curl" }], { "dist/": 10 });
    assert(s === 65, `size ${s}`);
  });
  await test("Ex6: Dockerignore", () => {
    assert(isIgnored("node_modules/express", ["node_modules"]), "ignored");
    assert(isIgnored("README.md", ["*.md"]), "glob");
    assert(!isIgnored("README.md", ["*.md", "!README.md"]), "negation");
  });
  await test("Ex7: Compose parser", () => {
    const r = parseComposeServices({ services: { app: { build: ".", ports: ["3000:3000"], depends_on: ["db"] }, db: { image: "postgres:15" } } });
    assert(r.length === 2, "2 services");
    assert(r[0].type === "build" && r[1].type === "image", "types");
  });
  await test("Ex8: Port conflicts", () => {
    const r = detectPortConflicts([{ name: "a", ports: [{ host: 3000 }] }, { name: "b", ports: [{ host: 3000 }] }]);
    assert(r.length === 1 && r[0].port === 3000, "conflict");
  });
  await test("Ex9: Linter", () => {
    const w = lintDockerfile([{ type: "FROM", args: "node:latest" }, { type: "COPY", args: ". ." }]);
    assert(w.some(w => w.includes("latest")), "latest warning");
    assert(w.some(w => w.includes("WORKDIR")), "workdir warning");
  });
  await test("Ex10: Tags", () => {
    const t = generateTags("ghcr.io", "myapp", "abc1234567890", "main", "1.0.0");
    assert(t.includes("ghcr.io/myapp:abc1234") && t.includes("ghcr.io/myapp:latest"), "tags");
  });
  await test("Ex11: Resolve args", () => {
    const r = resolveArgs([{ type: "ARG", args: "VER=20" }, { type: "FROM", args: "node:${VER}" }], {});
    assert(r[1].args === "node:20", "resolved");
  });
  await test("Ex12: Health checker", async () => {
    const hc = new HealthChecker();
    hc.register("db", async () => true, 100);
    const r = await hc.checkAll();
    assert(r.db === "healthy", "healthy");
    assert(await hc.waitForHealthy("db", 200), "wait healthy");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
