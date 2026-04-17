// ============================================================================
// 04-fork-workflow: Exercises
// ============================================================================
// Run:  npx tsx 08-git/03-remote/04-fork-workflow/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 12 exercises covering fork workflow, sync, signed commits
// ============================================================================

// Exercise 1: Predict the Output — fork setup
// After: fork → clone → git remote add upstream <url>
// a) How many remotes?  b) What are their names?
const ex1_a: number = 0;      // TODO
const ex1_b: string[] = [];   // TODO

// Exercise 2: Simulate fork sync workflow
// ----------------------------------------------------------------------------
interface ForkState { originBranches: Map<string, string>; upstreamBranches: Map<string, string>; localBranches: Map<string, string>; tracking: Map<string, string>; }

class ForkWorkflow {
  private state: ForkState = { originBranches: new Map(), upstreamBranches: new Map(), localBranches: new Map(), tracking: new Map() };

  setUpstream(branch: string, sha: string): void { this.state.upstreamBranches.set(branch, sha); }
  setOrigin(branch: string, sha: string): void { this.state.originBranches.set(branch, sha); }
  setLocal(branch: string, sha: string): void { this.state.localBranches.set(branch, sha); }

  // TODO: Fetch from upstream
  fetchUpstream(): void {}
  // TODO: Sync local main with upstream main
  syncMain(): void {}
  // TODO: Push local main to origin (your fork)
  pushToFork(): void {}
  // TODO: Full sync workflow
  fullSync(): void {}

  getState(): ForkState { return this.state; }
}

// Exercise 3: Predict the Output — contribution flow
// You create feature branch, commit, push to origin, open PR
// a) Which remote receives the push?
// b) PR goes from where to where?
const ex3_a: string = ""; // TODO
const ex3_b: string = ""; // TODO

// Exercise 4: Implement signed commit verifier
// ----------------------------------------------------------------------------
interface SignedCommit { sha: string; message: string; author: string; signature: string | null; keyId: string | null; }

function verifySignature(_commit: SignedCommit, _trustedKeys: Set<string>): { verified: boolean; reason: string } {
  // TODO: Check if commit has signature with trusted key
  return { verified: false, reason: "" };
}

// Exercise 5: Predict the Output — sync issues
// Upstream: A → B → C → D
// Your fork main: A → B → E (you committed directly to main!)
// a) Can you fast-forward to upstream?
// b) What should you do?
const ex5_a: boolean = false; // TODO
const ex5_b: string = "";     // TODO

// Exercise 6: Implement contributing guidelines checker
// ----------------------------------------------------------------------------
function checkContribGuidelines(
  _commit: { message: string; signed: boolean; hasTests: boolean; issueRef: string | null }
): { passes: boolean; violations: string[] } {
  // TODO: Check: signed, has tests, references issue, conventional commit format
  return { passes: false, violations: [] };
}

// Exercise 7: Fix the Bug — sync workflow
// ----------------------------------------------------------------------------
function buggySyncFork(local: Map<string, string>, upstream: Map<string, string>, origin: Map<string, string>) {
  // BUG 1: Should fetch from upstream first, not origin
  for (const [b, sha] of origin) local.set(b, sha);
  // BUG 2: Should push to origin, not upstream
  for (const [b, sha] of local) upstream.set(b, sha);
  return { local, origin, upstream };
}

// Exercise 8: Predict the Output — push to wrong remote
// git push upstream feature
// a) What happens?  b) What's the correct command?
const ex8_a: string = ""; // TODO
const ex8_b: string = ""; // TODO

// Exercise 9: Implement GPG key-based signing simulator
// ----------------------------------------------------------------------------
class SigningSystem {
  private keys: Map<string, { owner: string; publicKey: string }> = new Map();

  addKey(id: string, owner: string): void { this.keys.set(id, { owner, publicKey: `pub_${id}` }); }

  // TODO: Sign a message (return signature string)
  sign(_message: string, _keyId: string): string | null { return null; }

  // TODO: Verify a signature
  verify(_message: string, _signature: string, _keyId: string): boolean { return false; }
}

// Exercise 10: Implement fork divergence detector
// ----------------------------------------------------------------------------
function detectForkDivergence(
  _localSha: string, _upstreamSha: string,
  _commits: Map<string, { parentSha: string | null }>
): { diverged: boolean; localOnly: number; upstreamOnly: number } {
  // TODO: Determine if fork has diverged from upstream
  return { diverged: false, localOnly: 0, upstreamOnly: 0 };
}

// Exercise 11: Predict the Output — CLA check
// Contributor hasn't signed CLA. They open a PR.
// a) Can the PR be merged?  b) What typically happens?
const ex11_a: boolean = false; // TODO
const ex11_b: string = "";     // TODO

// Exercise 12: Build complete fork contribution system
// ----------------------------------------------------------------------------
class OSSContribution {
  private upstream: Map<string, string> = new Map(); // branch → sha
  private fork: Map<string, string> = new Map();
  private local: Map<string, string> = new Map();
  private prs: Array<{ branch: string; title: string; merged: boolean }> = [];

  setUpstream(b: string, sha: string): void { this.upstream.set(b, sha); }
  forkRepo(): void { for (const [b, s] of this.upstream) this.fork.set(b, s); }
  cloneLocally(): void { for (const [b, s] of this.fork) this.local.set(b, s); }
  createBranch(name: string): void { this.local.set(name, this.local.get("main") ?? ""); }
  commitOnBranch(branch: string, sha: string): void { this.local.set(branch, sha); }
  pushToFork(branch: string): void { this.fork.set(branch, this.local.get(branch) ?? ""); }
  openPR(branch: string, title: string): number { this.prs.push({ branch, title, merged: false }); return this.prs.length; }
  syncWithUpstream(): void { const us = this.upstream.get("main"); if (us) { this.local.set("main", us); this.fork.set("main", us); } }
  getStatus(): { fork: Map<string, string>; local: Map<string, string>; prs: typeof this.prs } { return { fork: this.fork, local: this.local, prs: this.prs }; }
}

export {
  ForkWorkflow, verifySignature, checkContribGuidelines, buggySyncFork,
  SigningSystem, detectForkDivergence, OSSContribution,
  ex1_a, ex1_b, ex3_a, ex3_b, ex5_a, ex5_b, ex8_a, ex8_b, ex11_a, ex11_b,
};
export type { ForkState, SignedCommit };
