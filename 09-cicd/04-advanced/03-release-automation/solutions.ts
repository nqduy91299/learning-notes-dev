// ============================================================
// Release Automation — Solutions
// ============================================================
// Run: npx tsx 09-cicd/04-advanced/03-release-automation/solutions.ts
// ============================================================

// Solution 1
function parseSemver(version: string) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) return null;
  return { major: +match[1], minor: +match[2], patch: +match[3], prerelease: match[4] };
}

// Solution 2
function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const pa = parseSemver(a)!, pb = parseSemver(b)!;
  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && pb.prerelease) return 1;
  if (pa.prerelease && pb.prerelease) return pa.prerelease < pb.prerelease ? -1 : pa.prerelease > pb.prerelease ? 1 : 0;
  return 0;
}

// Solution 3
function bumpVersion(current: string, type: 'major' | 'minor' | 'patch' | 'prerelease'): string {
  const v = parseSemver(current)!;
  if (type === 'major') return `${v.major + 1}.0.0`;
  if (type === 'minor') return `${v.major}.${v.minor + 1}.0`;
  if (type === 'patch') return v.prerelease ? `${v.major}.${v.minor}.${v.patch}` : `${v.major}.${v.minor}.${v.patch + 1}`;
  // prerelease
  if (v.prerelease) {
    const parts = v.prerelease.split('.');
    const num = parseInt(parts[parts.length - 1]);
    if (!isNaN(num)) { parts[parts.length - 1] = String(num + 1); return `${v.major}.${v.minor}.${v.patch}-${parts.join('.')}`; }
  }
  return `${v.major}.${v.minor}.${v.patch + 1}-0`;
}

// Solution 4
function parseConventionalCommit(message: string) {
  const match = message.match(/^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)/);
  if (!match) return null;
  return { type: match[1], scope: match[3], description: match[5], breaking: match[4] === '!' || message.includes('BREAKING CHANGE') };
}

// Solution 5
function determineVersionBump(commits: string[]): 'major' | 'minor' | 'patch' | 'none' {
  let highest: 'major' | 'minor' | 'patch' | 'none' = 'none';
  for (const msg of commits) {
    const parsed = parseConventionalCommit(msg);
    if (!parsed) continue;
    if (parsed.breaking) return 'major';
    if (parsed.type === 'feat' && highest !== 'major') highest = 'minor';
    if ((parsed.type === 'fix' || parsed.type === 'perf') && highest === 'none') highest = 'patch';
  }
  return highest;
}

// Solution 6
function generateChangelog(version: string, date: string, commits: Array<{type: string; scope?: string; description: string; hash: string}>): string {
  const groups: Record<string, string[]> = {};
  const typeNames: Record<string, string> = { feat: 'Features', fix: 'Bug Fixes', perf: 'Performance', refactor: 'Refactoring', docs: 'Documentation' };
  for (const c of commits) {
    const group = typeNames[c.type] || 'Other';
    if (!groups[group]) groups[group] = [];
    const scope = c.scope ? `**${c.scope}:** ` : '';
    groups[group].push(`- ${scope}${c.description} (${c.hash.slice(0, 7)})`);
  }
  let md = `## [${version}] - ${date}\n`;
  for (const [group, items] of Object.entries(groups)) { md += `\n### ${group}\n${items.join('\n')}\n`; }
  return md;
}

// Solution 7
function buildReleaseNotes(version: string, changelog: string, contributors: string[], compareUrl: string): string {
  let notes = `# Release ${version}\n\n${changelog}\n`;
  if (contributors.length > 0) notes += `\n## Contributors\n${contributors.map(c => `- @${c}`).join('\n')}\n`;
  notes += `\n**Full Changelog**: ${compareUrl}`;
  return notes;
}

// Solution 8
class VersionManager {
  private version: string;
  private history: string[] = [];
  constructor(currentVersion: string) { this.version = currentVersion; this.history.push(currentVersion); }
  bump(type: 'major' | 'minor' | 'patch'): string { this.version = bumpVersion(this.version, type); this.history.push(this.version); return this.version; }
  prerelease(tag: string): string {
    const v = parseSemver(this.version)!;
    this.version = `${v.major}.${v.minor}.${v.patch + (v.prerelease ? 0 : 1)}-${tag}.0`;
    this.history.push(this.version); return this.version;
  }
  getHistory() { return [...this.history]; }
}

// Solution 9
class TagManager {
  private tags: Array<{version: string; sha: string}> = [];
  create(version: string, sha: string) { this.tags.push({ version, sha }); }
  getLatest() { return this.list()[0] || null; }
  list() { return [...this.tags].sort((a, b) => compareSemver(b.version, a.version)); }
  exists(version: string) { return this.tags.some(t => t.version === version); }
}

// Solution 10
function validateRelease(checks: { testsPass: boolean; buildSuccess: boolean; lintPass: boolean; changelogUpdated: boolean; versionBumped: boolean }) {
  const blockers: string[] = [];
  if (!checks.testsPass) blockers.push('Tests must pass');
  if (!checks.buildSuccess) blockers.push('Build must succeed');
  if (!checks.lintPass) blockers.push('Lint must pass');
  if (!checks.changelogUpdated) blockers.push('Changelog must be updated');
  if (!checks.versionBumped) blockers.push('Version must be bumped');
  return { canRelease: blockers.length === 0, blockers };
}

// Solution 11
function planMonorepoRelease(packages: Array<{name: string; currentVersion: string; commits: string[]}>) {
  return packages.map(pkg => {
    const bump = determineVersionBump(pkg.commits);
    if (bump === 'none') return null;
    return { name: pkg.name, currentVersion: pkg.currentVersion, newVersion: bumpVersion(pkg.currentVersion, bump), bump };
  }).filter((p): p is NonNullable<typeof p> => p !== null);
}

// Solution 12
function simulatePublish(packageName: string, version: string, registry: Map<string, string[]>) {
  if (!parseSemver(version)) return { success: false, error: `Invalid version: ${version}` };
  const versions = registry.get(packageName) || [];
  if (versions.includes(version)) return { success: false, error: `Version ${version} already published` };
  versions.push(version);
  registry.set(packageName, versions);
  return { success: true };
}

// ============================================================
function assert(c: boolean, m: string) { if (!c) throw new Error(`FAIL: ${m}`); }
async function runTests() {
  let passed = 0, failed = 0;
  const test = async (name: string, fn: () => void | Promise<void>) => {
    try { await fn(); passed++; console.log(`  ✓ ${name}`); }
    catch (e) { failed++; console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : e}`); }
  };
  console.log("\n03-release-automation Solutions\n");

  await test("Ex1: Parse semver", () => {
    const v = parseSemver("1.2.3-beta.1");
    assert(v?.major === 1 && v?.minor === 2 && v?.patch === 3 && v?.prerelease === "beta.1", "parsed");
    assert(parseSemver("invalid") === null, "null");
  });
  await test("Ex2: Compare semver", () => {
    assert(compareSemver("1.0.0", "2.0.0") === -1, "less");
    assert(compareSemver("1.2.0", "1.1.0") === 1, "greater");
    assert(compareSemver("1.0.0", "1.0.0") === 0, "equal");
    assert(compareSemver("1.0.0-alpha", "1.0.0") === -1, "pre < stable");
  });
  await test("Ex3: Bump version", () => {
    assert(bumpVersion("1.2.3", "major") === "2.0.0", "major");
    assert(bumpVersion("1.2.3", "minor") === "1.3.0", "minor");
    assert(bumpVersion("1.2.3", "patch") === "1.2.4", "patch");
    assert(bumpVersion("1.2.3", "prerelease") === "1.2.4-0", "prerelease");
    assert(bumpVersion("1.2.4-0", "prerelease") === "1.2.4-1", "prerelease bump");
  });
  await test("Ex4: Parse commit", () => {
    const c = parseConventionalCommit("feat(auth): add OAuth2 login");
    assert(c?.type === "feat" && c?.scope === "auth" && !c?.breaking, "parsed");
    assert(parseConventionalCommit("feat!: breaking")?.breaking, "breaking");
  });
  await test("Ex5: Determine bump", () => {
    assert(determineVersionBump(["feat: new thing", "fix: bug"]) === "minor", "minor wins");
    assert(determineVersionBump(["fix: bug", "chore: update"]) === "patch", "patch");
    assert(determineVersionBump(["feat!: breaking"]) === "major", "major");
    assert(determineVersionBump(["chore: stuff"]) === "none", "none");
  });
  await test("Ex6: Changelog", () => {
    const cl = generateChangelog("1.3.0", "2024-01-15", [
      { type: "feat", description: "dark mode", hash: "abc1234" },
      { type: "fix", scope: "auth", description: "token refresh", hash: "def5678" },
    ]);
    assert(cl.includes("## [1.3.0]") && cl.includes("dark mode") && cl.includes("**auth:**"), "formatted");
  });
  await test("Ex7: Release notes", () => {
    const notes = buildReleaseNotes("1.3.0", "changes...", ["alice", "bob"], "https://github.com/compare/v1.2.3...v1.3.0");
    assert(notes.includes("@alice") && notes.includes("Full Changelog"), "notes");
  });
  await test("Ex8: Version manager", () => {
    const vm = new VersionManager("1.0.0");
    assert(vm.bump("minor") === "1.1.0", "minor");
    assert(vm.bump("patch") === "1.1.1", "patch");
    assert(vm.getHistory().length === 3, "history");
  });
  await test("Ex9: Tag manager", () => {
    const tm = new TagManager();
    tm.create("1.0.0", "aaa"); tm.create("1.1.0", "bbb"); tm.create("2.0.0", "ccc");
    assert(tm.getLatest()?.version === "2.0.0", "latest");
    assert(tm.exists("1.0.0"), "exists");
  });
  await test("Ex10: Release validator", () => {
    assert(validateRelease({ testsPass: true, buildSuccess: true, lintPass: true, changelogUpdated: true, versionBumped: true }).canRelease, "can");
    assert(!validateRelease({ testsPass: false, buildSuccess: true, lintPass: true, changelogUpdated: true, versionBumped: true }).canRelease, "blocked");
  });
  await test("Ex11: Monorepo release", () => {
    const r = planMonorepoRelease([
      { name: "api", currentVersion: "1.0.0", commits: ["feat: new endpoint"] },
      { name: "web", currentVersion: "2.0.0", commits: ["chore: update deps"] },
    ]);
    assert(r.length === 1 && r[0].name === "api" && r[0].newVersion === "1.1.0", "only api bumped");
  });
  await test("Ex12: Publish simulator", () => {
    const reg = new Map<string, string[]>();
    assert(simulatePublish("pkg", "1.0.0", reg).success, "first publish");
    assert(!simulatePublish("pkg", "1.0.0", reg).success, "duplicate");
    assert(!simulatePublish("pkg", "bad", reg).success, "invalid");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}
runTests();
