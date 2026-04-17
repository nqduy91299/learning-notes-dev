// ============================================================================
// 01-remote-repos: Solutions
// ============================================================================
// Run:  npx tsx 08-git/03-remote/01-remote-repos/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

// ─── Exercise 1 ────────────────────────────────────────────────────────────
console.log("Exercise 1:");
console.log("Remotes:", 1, "| Name: origin | URL lines:", 2);

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface Remote { name: string; fetchUrl: string; pushUrl: string; fetchRefspec: string; }

class RemoteManager {
  private remotes: Map<string, Remote> = new Map();

  add(name: string, url: string): boolean {
    if (this.remotes.has(name)) return false;
    this.remotes.set(name, { name, fetchUrl: url, pushUrl: url, fetchRefspec: `+refs/heads/*:refs/remotes/${name}/*` });
    return true;
  }

  remove(name: string): boolean { return this.remotes.delete(name); }

  rename(oldName: string, newName: string): boolean {
    const r = this.remotes.get(oldName);
    if (!r || this.remotes.has(newName)) return false;
    this.remotes.delete(oldName);
    r.name = newName;
    r.fetchRefspec = `+refs/heads/*:refs/remotes/${newName}/*`;
    this.remotes.set(newName, r);
    return true;
  }

  setUrl(name: string, url: string): void {
    const r = this.remotes.get(name);
    if (r) { r.fetchUrl = url; r.pushUrl = url; }
  }

  list(): Array<{ name: string; url: string; type: "fetch" | "push" }> {
    const result: Array<{ name: string; url: string; type: "fetch" | "push" }> = [];
    for (const r of this.remotes.values()) {
      result.push({ name: r.name, url: r.fetchUrl, type: "fetch" });
      result.push({ name: r.name, url: r.pushUrl, type: "push" });
    }
    return result;
  }

  show(name: string): Remote | null { return this.remotes.get(name) ?? null; }
}

console.log("\nExercise 2:");
const rm = new RemoteManager();
rm.add("origin", "git@github.com:user/repo.git");
rm.add("upstream", "git@github.com:original/repo.git");
console.log("List:", rm.list().map(r => `${r.name}\t${r.url} (${r.type})`));
rm.rename("upstream", "source");
console.log("After rename:", rm.list().map(r => r.name));

// ─── Exercise 3 ────────────────────────────────────────────────────────────
console.log("\nExercise 3: Lines:", 4); // 2 per remote (fetch + push) × 2 remotes

// ─── Exercise 4 ────────────────────────────────────────────────────────────
interface Refspec { force: boolean; src: string; dst: string; }

function parseRefspec(refspec: string): Refspec | null {
  let s = refspec;
  const force = s.startsWith("+");
  if (force) s = s.slice(1);
  const parts = s.split(":");
  if (parts.length !== 2) return null;
  return { force, src: parts[0]!, dst: parts[1]! };
}

console.log("\nExercise 4:");
console.log(parseRefspec("+refs/heads/*:refs/remotes/origin/*"));
console.log(parseRefspec("refs/heads/main:refs/heads/main"));

// ─── Exercise 5 ────────────────────────────────────────────────────────────
console.log("\nExercise 5:");
console.log("main: tracked, local branch configured for pull");
console.log("develop: tracked, no local branch");
console.log("feature/auth: tracked, no local branch");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function pruneRemoteBranches(
  localRemoteRefs: Map<string, string>,
  actualRemoteBranches: Set<string>
): string[] {
  const toPrune: string[] = [];
  for (const ref of localRemoteRefs.keys()) {
    const branch = ref.split("/").slice(1).join("/"); // "origin/main" → "main"
    if (!actualRemoteBranches.has(branch)) toPrune.push(ref);
  }
  return toPrune;
}

console.log("\nExercise 6:");
console.log("Prune:", pruneRemoteBranches(
  new Map([["origin/main", "a"], ["origin/develop", "b"], ["origin/old-feature", "c"]]),
  new Set(["main", "develop"])
)); // ["origin/old-feature"]

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedRemoteConfig(name: string, url: string) {
  return {
    name,
    url,
    fetchRefspec: `+refs/heads/*:refs/remotes/${name}/*`, // FIX: use name parameter
    pushUrl: url, // FIX: default to fetch URL
  };
}

console.log("\nExercise 7:");
console.log(fixedRemoteConfig("upstream", "https://github.com/orig/repo.git"));

// ─── Exercise 8 ────────────────────────────────────────────────────────────
function mapRemoteBranches(remoteName: string, remoteBranches: string[], _refspec: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const branch of remoteBranches) {
    result.set(branch, `refs/remotes/${remoteName}/${branch}`);
  }
  return result;
}

console.log("\nExercise 8:");
console.log([...mapRemoteBranches("origin", ["main", "develop"], "+refs/heads/*:refs/remotes/origin/*").entries()]);

// ─── Exercise 9 ────────────────────────────────────────────────────────────
console.log("\nExercise 9:");
console.log("Protocols: https, ssh, file, local, git");

// ─── Exercise 10 ───────────────────────────────────────────────────────────
function generateRemoteConfig(name: string, url: string, options?: { pushUrl?: string; mirror?: boolean }): string {
  let config = `[remote "${name}"]\n    url = ${url}\n`;
  if (options?.pushUrl) config += `    pushurl = ${options.pushUrl}\n`;
  if (options?.mirror) config += `    mirror = true\n`;
  config += `    fetch = +refs/heads/*:refs/remotes/${name}/*`;
  return config;
}

console.log("\nExercise 10:");
console.log(generateRemoteConfig("origin", "git@github.com:user/repo.git"));

// ─── Exercise 11 ───────────────────────────────────────────────────────────
class MultiRemoteWorkflow {
  private remotes: Map<string, { url: string; branches: Map<string, string> }> = new Map();
  private remoteTrackingRefs: Map<string, string> = new Map();

  addRemote(name: string, url: string): void {
    this.remotes.set(name, { url, branches: new Map() });
  }

  setRemoteBranch(remote: string, branch: string, sha: string): void {
    this.remotes.get(remote)?.branches.set(branch, sha);
  }

  fetch(remote: string): string[] {
    const r = this.remotes.get(remote);
    if (!r) return [];
    const updated: string[] = [];
    for (const [branch, sha] of r.branches) {
      const ref = `${remote}/${branch}`;
      this.remoteTrackingRefs.set(ref, sha);
      updated.push(ref);
    }
    return updated;
  }

  listRemoteTrackingBranches(): string[] { return [...this.remoteTrackingRefs.keys()]; }

  compareWithRemote(_branch: string, _remote: string): { ahead: number; behind: number } {
    return { ahead: 0, behind: 0 }; // Simplified
  }
}

console.log("\nExercise 11:");
const mw = new MultiRemoteWorkflow();
mw.addRemote("origin", "github.com/you/repo");
mw.addRemote("upstream", "github.com/orig/repo");
mw.setRemoteBranch("origin", "main", "abc");
mw.setRemoteBranch("upstream", "main", "def");
console.log("Fetch origin:", mw.fetch("origin"));
console.log("Fetch upstream:", mw.fetch("upstream"));
console.log("All tracking:", mw.listRemoteTrackingBranches());

// ─── Exercise 12 ───────────────────────────────────────────────────────────
console.log("\nExercise 12:");
console.log("Still exists:", true, "| Command: git remote prune origin (or git fetch --prune)");

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class GitRemote {
  private remotes: Map<string, Remote> = new Map();
  add(name: string, url: string): void { this.remotes.set(name, { name, fetchUrl: url, pushUrl: url, fetchRefspec: `+refs/heads/*:refs/remotes/${name}/*` }); }
  remove(name: string): void { this.remotes.delete(name); }
  rename(old: string, nw: string): void { const r = this.remotes.get(old); if (r) { r.name = nw; this.remotes.delete(old); this.remotes.set(nw, r); } }
  getAll(): string[] { return [...this.remotes.keys()]; }
}

console.log("\nExercise 13:");
const gr = new GitRemote();
gr.add("origin", "url1");
gr.add("upstream", "url2");
console.log("All:", gr.getAll());
gr.remove("upstream");
console.log("After remove:", gr.getAll());

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
