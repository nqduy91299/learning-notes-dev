// ============================================================================
// 04-fork-workflow: Solutions
// ============================================================================
// Run:  npx tsx 08-git/03-remote/04-fork-workflow/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

interface SignedCommit { sha: string; message: string; author: string; signature: string | null; keyId: string | null; }

console.log("Exercise 1: Remotes:", 2, "| Names: origin, upstream");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface ForkState { originBranches: Map<string, string>; upstreamBranches: Map<string, string>; localBranches: Map<string, string>; tracking: Map<string, string>; }

class ForkWorkflow {
  private state: ForkState = { originBranches: new Map(), upstreamBranches: new Map(), localBranches: new Map(), tracking: new Map() };
  setUpstream(b: string, sha: string): void { this.state.upstreamBranches.set(b, sha); }
  setOrigin(b: string, sha: string): void { this.state.originBranches.set(b, sha); }
  setLocal(b: string, sha: string): void { this.state.localBranches.set(b, sha); }
  fetchUpstream(): void { for (const [b, s] of this.state.upstreamBranches) this.state.tracking.set(`upstream/${b}`, s); }
  syncMain(): void { const s = this.state.tracking.get("upstream/main"); if (s) this.state.localBranches.set("main", s); }
  pushToFork(): void { const s = this.state.localBranches.get("main"); if (s) this.state.originBranches.set("main", s); }
  fullSync(): void { this.fetchUpstream(); this.syncMain(); this.pushToFork(); }
  getState(): ForkState { return this.state; }
}

console.log("\nExercise 2:");
const fw = new ForkWorkflow();
fw.setUpstream("main", "abc");
fw.setOrigin("main", "old");
fw.setLocal("main", "old");
fw.fullSync();
console.log("After sync:", fw.getState().localBranches.get("main")); // abc

console.log("\nExercise 3:");
console.log("Push to: origin (your fork)");
console.log("PR: from you/repo:feature to original/repo:main");

// ─── Exercise 4 ────────────────────────────────────────────────────────────
function verifySignature(commit: SignedCommit, trustedKeys: Set<string>): { verified: boolean; reason: string } {
  if (!commit.signature) return { verified: false, reason: "No signature" };
  if (!commit.keyId) return { verified: false, reason: "No key ID" };
  if (!trustedKeys.has(commit.keyId)) return { verified: false, reason: "Key not trusted" };
  return { verified: true, reason: "Valid signature with trusted key" };
}

console.log("\nExercise 4:");
console.log(verifySignature({ sha: "a", message: "m", author: "dev", signature: "sig", keyId: "key1" }, new Set(["key1"])));
console.log(verifySignature({ sha: "b", message: "m", author: "dev", signature: null, keyId: null }, new Set(["key1"])));

console.log("\nExercise 5:");
console.log("Can FF:", false, "(diverged)");
console.log("Fix: git reset --hard upstream/main (if not shared), or rebase");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function checkContribGuidelines(commit: { message: string; signed: boolean; hasTests: boolean; issueRef: string | null }): { passes: boolean; violations: string[] } {
  const violations: string[] = [];
  if (!commit.signed) violations.push("Commit must be signed");
  if (!commit.hasTests) violations.push("Must include tests");
  if (!commit.issueRef) violations.push("Must reference an issue");
  if (!/^(feat|fix|docs|refactor|test|chore)/.test(commit.message)) violations.push("Must use conventional commit format");
  return { passes: violations.length === 0, violations };
}

console.log("\nExercise 6:");
console.log(checkContribGuidelines({ message: "feat: Add login", signed: true, hasTests: true, issueRef: "#42" }));
console.log(checkContribGuidelines({ message: "did stuff", signed: false, hasTests: false, issueRef: null }));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedSyncFork(local: Map<string, string>, upstream: Map<string, string>, origin: Map<string, string>) {
  // FIX 1: fetch from upstream
  for (const [b, sha] of upstream) local.set(b, sha);
  // FIX 2: push to origin
  for (const [b, sha] of local) origin.set(b, sha);
  return { local, origin, upstream };
}

console.log("\nExercise 7:");
const r = fixedSyncFork(new Map([["main", "old"]]), new Map([["main", "new"]]), new Map([["main", "old"]]));
console.log("Origin main:", r.origin.get("main")); // "new"

console.log("\nExercise 8:");
console.log("Push to upstream: Permission denied (you don't have write access)");
console.log("Correct: git push origin feature");

// ─── Exercise 9 ────────────────────────────────────────────────────────────
class SigningSystem {
  private keys: Map<string, { owner: string; publicKey: string }> = new Map();
  addKey(id: string, owner: string): void { this.keys.set(id, { owner, publicKey: `pub_${id}` }); }
  sign(message: string, keyId: string): string | null {
    if (!this.keys.has(keyId)) return null;
    return `sig_${keyId}_${message.length}`; // Simplified signature
  }
  verify(message: string, signature: string, keyId: string): boolean {
    return signature === `sig_${keyId}_${message.length}` && this.keys.has(keyId);
  }
}

console.log("\nExercise 9:");
const signer = new SigningSystem();
signer.addKey("key1", "alice");
const sig = signer.sign("Hello", "key1");
console.log("Signature:", sig);
console.log("Verify:", signer.verify("Hello", sig!, "key1"));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
function detectForkDivergence(localSha: string, upstreamSha: string, commits: Map<string, { parentSha: string | null }>) {
  const ancestors = (sha: string) => { const s = new Set<string>(); let c: string | null = sha; while (c) { s.add(c); c = commits.get(c)?.parentSha ?? null; } return s; };
  const la = ancestors(localSha), ua = ancestors(upstreamSha);
  let localOnly = 0, upstreamOnly = 0;
  for (const s of la) if (!ua.has(s)) localOnly++;
  for (const s of ua) if (!la.has(s)) upstreamOnly++;
  return { diverged: localOnly > 0 && upstreamOnly > 0, localOnly, upstreamOnly };
}

console.log("\nExercise 10:");
const dc = new Map<string, { parentSha: string | null }>([["a", { parentSha: null }], ["b", { parentSha: "a" }], ["c", { parentSha: "b" }], ["d", { parentSha: "b" }]]);
console.log(detectForkDivergence("c", "d", dc)); // diverged, 1 each

console.log("\nExercise 11:");
console.log("Can merge without CLA:", false);
console.log("Bot comments asking to sign CLA, PR blocked until signed");

// ─── Exercise 12 ───────────────────────────────────────────────────────────
class OSSContribution {
  private upstream: Map<string, string> = new Map();
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
  syncWithUpstream(): void { const s = this.upstream.get("main"); if (s) { this.local.set("main", s); this.fork.set("main", s); } }
  getStatus() { return { fork: this.fork, local: this.local, prs: this.prs }; }
}

console.log("\nExercise 12:");
const oss = new OSSContribution();
oss.setUpstream("main", "v1");
oss.forkRepo();
oss.cloneLocally();
oss.createBranch("fix/typo");
oss.commitOnBranch("fix/typo", "v2");
oss.pushToFork("fix/typo");
const prNum = oss.openPR("fix/typo", "Fix typo in README");
console.log("PR #" + prNum);
console.log("Status:", oss.getStatus());

console.log("\n============================================");
console.log("All 12 exercises completed successfully! ✓");
console.log("============================================");
