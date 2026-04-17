// ============================================================================
// 02-fetch-pull-push: Exercises
// ============================================================================
// Run:  npx tsx 08-git/03-remote/02-fetch-pull-push/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering fetch, pull, push synchronization
// ============================================================================

// Exercise 1: Predict the Output — fetch vs pull
// a) After `git fetch origin`, does local main change?
// b) After `git pull origin main`, does local main change?
// c) After fetch, what ref is updated?
const ex1_a: boolean = false; // TODO
const ex1_b: boolean = false; // TODO
const ex1_c: string = "";     // TODO

// Exercise 2: Simulate fetch-pull-push workflow
// ----------------------------------------------------------------------------
interface SyncCommit { sha: string; message: string; parentSha: string | null; }

class SyncSimulator {
  private local: Map<string, SyncCommit> = new Map();
  private remote: Map<string, SyncCommit> = new Map();
  private localBranches: Map<string, string> = new Map();
  private remoteBranches: Map<string, string> = new Map();
  private trackingRefs: Map<string, string> = new Map(); // origin/main → sha

  setLocalBranch(b: string, sha: string): void { this.localBranches.set(b, sha); }
  setRemoteBranch(b: string, sha: string): void { this.remoteBranches.set(b, sha); }
  addLocalCommit(c: SyncCommit): void { this.local.set(c.sha, c); }
  addRemoteCommit(c: SyncCommit): void { this.remote.set(c.sha, c); }

  // TODO: Fetch — copy remote commits to local, update tracking refs
  fetch(): { updated: string[]; newCommits: number } { return { updated: [], newCommits: 0 }; }

  // TODO: Pull — fetch + merge (fast-forward if possible)
  pull(_branch: string): { type: "fast-forward" | "merge" | "conflict" | "up-to-date" } { return { type: "up-to-date" }; }

  // TODO: Push — copy local commits to remote, update remote branch
  push(_branch: string): { success: boolean; reason?: string } { return { success: false }; }
}

// Exercise 3: Predict the Output — tracking branches
// git push -u origin feature
// a) What upstream is set?
// b) After this, what does `git push` (no args) do?
const ex3_a: string = ""; // TODO
const ex3_b: string = ""; // TODO

// Exercise 4: Implement ahead/behind counter
// ----------------------------------------------------------------------------
function countAheadBehind(
  _commits: Map<string, SyncCommit>,
  _localSha: string,
  _remoteSha: string
): { ahead: number; behind: number } {
  // TODO: Count commits local has that remote doesn't (ahead)
  // and commits remote has that local doesn't (behind)
  return { ahead: 0, behind: 0 };
}

// Exercise 5: Predict the Output — push rejected
// Local: A → B → C → D (main)
// Remote: A → B → C → E (main)
// a) Does `git push` succeed?
// b) Why or why not?
// c) What should you do?
const ex5_a: boolean = false; // TODO
const ex5_b: string = "";     // TODO
const ex5_c: string = "";     // TODO

// Exercise 6: Simulate force push with lease
// ----------------------------------------------------------------------------
function forcePushWithLease(
  _localBranchSha: string,
  _expectedRemoteSha: string,
  _actualRemoteSha: string
): { success: boolean; reason?: string } {
  // TODO: Only succeed if expected matches actual
  return { success: false };
}

// Exercise 7: Fix the Bug — pull implementation
// ----------------------------------------------------------------------------
function buggyPull(
  localSha: string,
  remoteSha: string,
  _commits: Map<string, SyncCommit>
) {
  // BUG 1: Doesn't check if already up-to-date
  // BUG 2: Doesn't distinguish FF from merge
  // BUG 3: Returns wrong type
  return { newHead: remoteSha, merged: localSha !== remoteSha };
}

// Exercise 8: Predict the Output — pull --rebase vs pull
// Local: A → B → D, Remote: A → B → C → E
// a) `git pull` creates what?
// b) `git pull --rebase` creates what?
const ex8_a: string = ""; // TODO
const ex8_b: string = ""; // TODO

// Exercise 9: Implement push.default behaviors
// ----------------------------------------------------------------------------
type PushDefault = "simple" | "current" | "matching" | "nothing";

function resolvePushTarget(
  _mode: PushDefault,
  _currentBranch: string,
  _upstream: string | null,
  _localBranches: string[],
  _remoteBranches: string[]
): string[] {
  // TODO: Return list of branches to push based on mode
  return [];
}

// Exercise 10: Predict the Output — fetch --prune
// Remote deleted 'feature/old'. Local still has origin/feature/old.
// a) After `git fetch`, is origin/feature/old removed?
// b) After `git fetch --prune`?
const ex10_a: boolean = false; // TODO
const ex10_b: boolean = false; // TODO

// Exercise 11: Implement tag push simulator
// ----------------------------------------------------------------------------
function pushTags(
  _localTags: Map<string, string>,
  _remoteTags: Map<string, string>
): { pushed: string[]; alreadyExists: string[] } {
  // TODO: Push tags that don't exist on remote
  return { pushed: [], alreadyExists: [] };
}

// Exercise 12: Predict the Output — push -u
// git push -u origin feature
// Then: git branch -vv
// What tracking info is shown for feature?
const ex12_tracking: string = ""; // TODO

// Exercise 13: Build complete sync system
// ----------------------------------------------------------------------------
class GitSync {
  private local: { commits: Map<string, SyncCommit>; branches: Map<string, string>; tracking: Map<string, string> } =
    { commits: new Map(), branches: new Map(), tracking: new Map() };
  private remote: { commits: Map<string, SyncCommit>; branches: Map<string, string> } =
    { commits: new Map(), branches: new Map() };

  addLocalCommit(c: SyncCommit): void { this.local.commits.set(c.sha, c); }
  addRemoteCommit(c: SyncCommit): void { this.remote.commits.set(c.sha, c); }
  setLocal(b: string, sha: string): void { this.local.branches.set(b, sha); }
  setRemote(b: string, sha: string): void { this.remote.branches.set(b, sha); }

  fetch(): string[] { const u: string[] = []; for (const [b, sha] of this.remote.branches) { this.local.tracking.set(`origin/${b}`, sha); for (const [s, c] of this.remote.commits) { if (!this.local.commits.has(s)) this.local.commits.set(s, c); } u.push(b); } return u; }
  push(b: string): boolean { const sha = this.local.branches.get(b); if (!sha) return false; this.remote.branches.set(b, sha); for (const [s, c] of this.local.commits) { if (!this.remote.commits.has(s)) this.remote.commits.set(s, c); } return true; }
  pull(b: string): string { this.fetch(); const remoteSha = this.local.tracking.get(`origin/${b}`); if (remoteSha) this.local.branches.set(b, remoteSha); return remoteSha ?? ""; }
}

export {
  SyncSimulator, countAheadBehind, forcePushWithLease, buggyPull,
  resolvePushTarget, pushTags, GitSync,
  ex1_a, ex1_b, ex1_c, ex3_a, ex3_b, ex5_a, ex5_b, ex5_c,
  ex8_a, ex8_b, ex10_a, ex10_b, ex12_tracking,
};
export type { SyncCommit, PushDefault };
