// ============================================================================
// 05-submodules: Solutions
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/05-submodules/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

interface Submodule { path: string; url: string; branch: string; pinnedCommit: string; }

console.log("Exercise 1:");
console.log("Created: .gitmodules (new), libs/mylib/ (submodule dir)");
console.log("Modified: .git/config, index (gitlink entry)");
console.log("Index entry: 160000 mode (gitlink) pointing to submodule commit SHA");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
class SubmoduleManager {
  private submodules: Map<string, Submodule> = new Map();
  private parentTree: Map<string, string> = new Map();

  add(path: string, url: string, branch: string, commit: string): void {
    this.submodules.set(path, { path, url, branch, pinnedCommit: commit });
    this.parentTree.set(path, commit);
  }
  update(path: string, newCommit: string): void {
    const sub = this.submodules.get(path);
    if (sub) { sub.pinnedCommit = newCommit; this.parentTree.set(path, newCommit); }
  }
  init(): string[] { return [...this.submodules.keys()]; }
  getGitmodulesContent(): string {
    return [...this.submodules.values()].map(s =>
      `[submodule "${s.path}"]\n    path = ${s.path}\n    url = ${s.url}\n    branch = ${s.branch}`
    ).join("\n");
  }
  list(): Submodule[] { return [...this.submodules.values()]; }
  remove(path: string): boolean { this.parentTree.delete(path); return this.submodules.delete(path); }
}

console.log("\nExercise 2:");
const sm = new SubmoduleManager();
sm.add("libs/auth", "github.com/lib/auth", "main", "abc123");
sm.add("libs/ui", "github.com/lib/ui", "main", "def456");
console.log("List:", sm.list().map(s => s.path));
console.log(".gitmodules:\n" + sm.getGitmodulesContent());
sm.update("libs/auth", "ghi789");
console.log("After update:", sm.list().find(s => s.path === "libs/auth")?.pinnedCommit);

console.log("\nExercise 3:");
console.log("Empty dirs:", true);
console.log("Command: git submodule update --init --recursive");

// ─── Exercise 4 ────────────────────────────────────────────────────────────
function parseGitmodules(content: string): Submodule[] {
  const result: Submodule[] = [];
  const sections = content.split("[submodule");
  for (const section of sections.slice(1)) {
    const pathMatch = section.match(/path\s*=\s*(.+)/);
    const urlMatch = section.match(/url\s*=\s*(.+)/);
    const branchMatch = section.match(/branch\s*=\s*(.+)/);
    if (pathMatch && urlMatch) {
      result.push({ path: pathMatch[1]!.trim(), url: urlMatch[1]!.trim(), branch: branchMatch?.[1]?.trim() ?? "main", pinnedCommit: "" });
    }
  }
  return result;
}

console.log("\nExercise 4:");
console.log(parseGitmodules(`[submodule "libs/a"]\n    path = libs/a\n    url = https://github.com/a\n    branch = main`));

console.log("\nExercise 5:");
console.log("submodule update: commit A (recorded in parent)");
console.log("submodule update --remote: commit B (latest on remote)");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function buildDependencyGraph(submodules: Array<{ name: string; deps: string[] }>): { order: string[]; hasCycle: boolean } {
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const s of submodules) { inDeg.set(s.name, 0); adj.set(s.name, []); }
  for (const s of submodules) for (const d of s.deps) { adj.get(d)?.push(s.name); inDeg.set(s.name, (inDeg.get(s.name) ?? 0) + 1); }
  const queue = [...inDeg.entries()].filter(([, v]) => v === 0).map(([k]) => k);
  const order: string[] = [];
  while (queue.length) {
    const n = queue.shift()!; order.push(n);
    for (const dep of adj.get(n) ?? []) { inDeg.set(dep, inDeg.get(dep)! - 1); if (inDeg.get(dep) === 0) queue.push(dep); }
  }
  return { order, hasCycle: order.length !== submodules.length };
}

console.log("\nExercise 6:");
console.log(buildDependencyGraph([{ name: "core", deps: [] }, { name: "auth", deps: ["core"] }, { name: "ui", deps: ["core"] }]));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedSubmoduleUpdate(submodules: Map<string, Submodule>, parentTree: Map<string, string>) {
  for (const [path, sub] of submodules) {
    const recorded = parentTree.get(path);
    if (recorded) sub.pinnedCommit = recorded; // FIX: use recorded commit
  }
}

console.log("\nExercise 7:");
const subs = new Map([["lib", { path: "lib", url: "u", branch: "main", pinnedCommit: "old" }]]);
fixedSubmoduleUpdate(subs, new Map([["lib", "new"]]));
console.log("Updated to:", subs.get("lib")?.pinnedCommit);

// ─── Exercise 8 ────────────────────────────────────────────────────────────
function checkSubmoduleStatus(submodules: Map<string, Submodule>, currentCommits: Map<string, string>) {
  const result: Array<{ path: string; status: "up-to-date" | "modified" | "uninitialized" }> = [];
  for (const [path, sub] of submodules) {
    const current = currentCommits.get(path);
    if (!current) result.push({ path, status: "uninitialized" });
    else if (current !== sub.pinnedCommit) result.push({ path, status: "modified" });
    else result.push({ path, status: "up-to-date" });
  }
  return result;
}

console.log("\nExercise 8:");
console.log(checkSubmoduleStatus(new Map([["a", { path: "a", url: "", branch: "", pinnedCommit: "v1" }]]), new Map([["a", "v2"]])));

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function submoduleForeach(submodules: Submodule[], command: (sub: Submodule) => string) {
  return submodules.map(sub => ({ path: sub.path, output: command(sub) }));
}

console.log("\nExercise 9:");
console.log(submoduleForeach(
  [{ path: "a", url: "u1", branch: "main", pinnedCommit: "x" }, { path: "b", url: "u2", branch: "main", pinnedCommit: "y" }],
  (s) => `git status in ${s.path}`
));

console.log("\nExercise 10:");
console.log("Full content: subtree");
console.log("Separate fetch: submodule");
console.log("Simpler: subtree");

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function recursiveInit(submodules: Map<string, { url: string; commit: string; nestedSubmodules: Map<string, unknown> }>): string[] {
  const paths: string[] = [];
  for (const [path, sub] of submodules) {
    paths.push(path);
    if (sub.nestedSubmodules.size > 0) {
      paths.push(...recursiveInit(sub.nestedSubmodules as Map<string, { url: string; commit: string; nestedSubmodules: Map<string, unknown> }>));
    }
  }
  return paths;
}

console.log("\nExercise 11:");
const nested = new Map<string, { url: string; commit: string; nestedSubmodules: Map<string, unknown> }>([
  ["lib", { url: "u", commit: "a", nestedSubmodules: new Map([["lib/sub", { url: "u2", commit: "b", nestedSubmodules: new Map() }]]) }],
]);
console.log("Recursive init:", recursiveInit(nested));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
class GitSubmodules {
  private modules: Map<string, Submodule> = new Map();
  add(path: string, url: string, commit: string): void { this.modules.set(path, { path, url, branch: "main", pinnedCommit: commit }); }
  update(path: string, commit: string): void { const m = this.modules.get(path); if (m) m.pinnedCommit = commit; }
  remove(path: string): void { this.modules.delete(path); }
  list(): Submodule[] { return [...this.modules.values()]; }
  getGitmodules(): string { return [...this.modules.values()].map(m => `[submodule "${m.path}"]\n    path = ${m.path}\n    url = ${m.url}`).join("\n"); }
}

console.log("\nExercise 12:");
const gsm = new GitSubmodules();
gsm.add("libs/core", "github.com/core", "v1");
gsm.add("libs/ui", "github.com/ui", "v2");
console.log("Modules:", gsm.list().map(m => m.path));
gsm.remove("libs/ui");
console.log("After remove:", gsm.list().map(m => m.path));

console.log("\n============================================");
console.log("All 12 exercises completed successfully! ✓");
console.log("============================================");
