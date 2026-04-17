// ============================================================================
// 02-fetch-pull-push: Solutions
// ============================================================================
// Run:  npx tsx 08-git/03-remote/02-fetch-pull-push/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

interface SyncCommit { sha: string; message: string; parentSha: string | null; }

// ─── Exercise 1 ────────────────────────────────────────────────────────────
console.log("Exercise 1:");
console.log("Fetch changes local main:", false);
console.log("Pull changes local main:", true);
console.log("Fetch updates: origin/main (remote-tracking ref)");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
class SyncSimulator {
  private local: Map<string, SyncCommit> = new Map();
  private remote: Map<string, SyncCommit> = new Map();
  private localBranches: Map<string, string> = new Map();
  private remoteBranches: Map<string, string> = new Map();
  private trackingRefs: Map<string, string> = new Map();

  setLocalBranch(b: string, sha: string): void { this.localBranches.set(b, sha); }
  setRemoteBranch(b: string, sha: string): void { this.remoteBranches.set(b, sha); }
  addLocalCommit(c: SyncCommit): void { this.local.set(c.sha, c); }
  addRemoteCommit(c: SyncCommit): void { this.remote.set(c.sha, c); }

  fetch(): { updated: string[]; newCommits: number } {
    let newCommits = 0;
    const updated: string[] = [];
    for (const [b, sha] of this.remoteBranches) {
      this.trackingRefs.set(`origin/${b}`, sha);
      updated.push(b);
    }
    for (const [sha, c] of this.remote) {
      if (!this.local.has(sha)) { this.local.set(sha, c); newCommits++; }
    }
    return { updated, newCommits };
  }

  pull(branch: string): { type: "fast-forward" | "merge" | "conflict" | "up-to-date" } {
    this.fetch();
    const localSha = this.localBranches.get(branch);
    const remoteSha = this.trackingRefs.get(`origin/${branch}`);
    if (!remoteSha || localSha === remoteSha) return { type: "up-to-date" };
    // Check if FF possible
    let cur: string | null = remoteSha;
    while (cur) {
      if (cur === localSha) { this.localBranches.set(branch, remoteSha); return { type: "fast-forward" }; }
      cur = this.local.get(cur)?.parentSha ?? null;
    }
    return { type: "merge" };
  }

  push(branch: string): { success: boolean; reason?: string } {
    const localSha = this.localBranches.get(branch);
    const remoteSha = this.remoteBranches.get(branch);
    if (!localSha) return { success: false, reason: "No local branch" };
    // Check FF
    if (remoteSha) {
      let cur: string | null = localSha;
      let canFF = false;
      while (cur) { if (cur === remoteSha) { canFF = true; break; } cur = this.local.get(cur)?.parentSha ?? null; }
      if (!canFF) return { success: false, reason: "Non-fast-forward" };
    }
    this.remoteBranches.set(branch, localSha);
    for (const [sha, c] of this.local) { if (!this.remote.has(sha)) this.remote.set(sha, c); }
    return { success: true };
  }
}

console.log("\nExercise 2:");
const ss = new SyncSimulator();
ss.addLocalCommit({ sha: "a", message: "A", parentSha: null });
ss.addLocalCommit({ sha: "b", message: "B", parentSha: "a" });
ss.addRemoteCommit({ sha: "a", message: "A", parentSha: null });
ss.addRemoteCommit({ sha: "b", message: "B", parentSha: "a" });
ss.addRemoteCommit({ sha: "c", message: "C", parentSha: "b" });
ss.setLocalBranch("main", "b");
ss.setRemoteBranch("main", "c");
console.log("Fetch:", ss.fetch());
console.log("Pull:", ss.pull("main"));

// ─── Exercise 3 ────────────────────────────────────────────────────────────
console.log("\nExercise 3:");
console.log("Upstream: origin/feature");
console.log("git push (no args): pushes feature to origin/feature");

// ─── Exercise 4 ────────────────────────────────────────────────────────────
function countAheadBehind(
  commits: Map<string, SyncCommit>, localSha: string, remoteSha: string
): { ahead: number; behind: number } {
  const ancestors = (sha: string) => { const s = new Set<string>(); let c: string | null = sha; while (c) { s.add(c); c = commits.get(c)?.parentSha ?? null; } return s; };
  const localAnc = ancestors(localSha);
  const remoteAnc = ancestors(remoteSha);
  let ahead = 0, behind = 0;
  for (const s of localAnc) if (!remoteAnc.has(s)) ahead++;
  for (const s of remoteAnc) if (!localAnc.has(s)) behind++;
  return { ahead, behind };
}

console.log("\nExercise 4:");
const cm = new Map<string, SyncCommit>([
  ["a", { sha: "a", message: "A", parentSha: null }],
  ["b", { sha: "b", message: "B", parentSha: "a" }],
  ["c", { sha: "c", message: "C", parentSha: "b" }],
  ["d", { sha: "d", message: "D", parentSha: "b" }],
]);
console.log("c vs d:", countAheadBehind(cm, "c", "d")); // ahead 1, behind 1

// ─── Exercise 5 ────────────────────────────────────────────────────────────
console.log("\nExercise 5:");
console.log("Push succeeds:", false);
console.log("Reason: Non-fast-forward — remote has commit E that local doesn't");
console.log("Fix: git pull --rebase, then push");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function forcePushWithLease(localBranchSha: string, expectedRemoteSha: string, actualRemoteSha: string): { success: boolean; reason?: string } {
  if (expectedRemoteSha !== actualRemoteSha) return { success: false, reason: "Remote changed since last fetch" };
  void localBranchSha;
  return { success: true };
}

console.log("\nExercise 6:");
console.log(forcePushWithLease("d", "c", "c")); // success
console.log(forcePushWithLease("d", "c", "e")); // fail

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedPull(localSha: string, remoteSha: string, commits: Map<string, SyncCommit>) {
  if (localSha === remoteSha) return { newHead: localSha, type: "up-to-date" as const };
  let cur: string | null = remoteSha;
  while (cur) { if (cur === localSha) return { newHead: remoteSha, type: "fast-forward" as const }; cur = commits.get(cur)?.parentSha ?? null; }
  return { newHead: `merge-${localSha}-${remoteSha}`, type: "merge" as const };
}

console.log("\nExercise 7:");
console.log(fixedPull("b", "c", cm));

// ─── Exercise 8 ────────────────────────────────────────────────────────────
console.log("\nExercise 8:");
console.log("pull: Creates merge commit M with parents D and E");
console.log("pull --rebase: Replays D on top of E → D' after E, linear history");

// ─── Exercise 9 ────────────────────────────────────────────────────────────
type PushDefault = "simple" | "current" | "matching" | "nothing";

function resolvePushTarget(mode: PushDefault, currentBranch: string, upstream: string | null, localBranches: string[], remoteBranches: string[]): string[] {
  switch (mode) {
    case "simple": return upstream ? [currentBranch] : [];
    case "current": return [currentBranch];
    case "matching": return localBranches.filter(b => remoteBranches.includes(b));
    case "nothing": return [];
  }
}

console.log("\nExercise 9:");
console.log("simple:", resolvePushTarget("simple", "main", "origin/main", ["main", "dev"], ["main"]));
console.log("matching:", resolvePushTarget("matching", "main", null, ["main", "dev"], ["main", "dev"]));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
console.log("\nExercise 10:");
console.log("fetch:", false, "(not removed without --prune)");
console.log("fetch --prune:", true, "(removed)");

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function pushTags(localTags: Map<string, string>, remoteTags: Map<string, string>): { pushed: string[]; alreadyExists: string[] } {
  const pushed: string[] = [], alreadyExists: string[] = [];
  for (const [tag, sha] of localTags) {
    if (remoteTags.has(tag)) alreadyExists.push(tag);
    else { remoteTags.set(tag, sha); pushed.push(tag); }
  }
  return { pushed, alreadyExists };
}

console.log("\nExercise 11:");
console.log(pushTags(new Map([["v1", "a"], ["v2", "b"]]), new Map([["v1", "a"]])));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
console.log("\nExercise 12: Tracking: [origin/feature]");

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class GitSync {
  private local = { commits: new Map<string, SyncCommit>(), branches: new Map<string, string>(), tracking: new Map<string, string>() };
  private remote = { commits: new Map<string, SyncCommit>(), branches: new Map<string, string>() };

  addLocalCommit(c: SyncCommit): void { this.local.commits.set(c.sha, c); }
  addRemoteCommit(c: SyncCommit): void { this.remote.commits.set(c.sha, c); }
  setLocal(b: string, sha: string): void { this.local.branches.set(b, sha); }
  setRemote(b: string, sha: string): void { this.remote.branches.set(b, sha); }

  fetch(): string[] { const u: string[] = []; for (const [b, sha] of this.remote.branches) { this.local.tracking.set(`origin/${b}`, sha); u.push(b); } for (const [s, c] of this.remote.commits) this.local.commits.set(s, c); return u; }
  push(b: string): boolean { const sha = this.local.branches.get(b); if (!sha) return false; this.remote.branches.set(b, sha); for (const [s, c] of this.local.commits) this.remote.commits.set(s, c); return true; }
  pull(b: string): string { this.fetch(); const sha = this.local.tracking.get(`origin/${b}`); if (sha) this.local.branches.set(b, sha); return sha ?? ""; }
}

console.log("\nExercise 13:");
const gs = new GitSync();
gs.addRemoteCommit({ sha: "a", message: "A", parentSha: null });
gs.setRemote("main", "a");
console.log("Fetch:", gs.fetch());
console.log("Pull:", gs.pull("main"));

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
