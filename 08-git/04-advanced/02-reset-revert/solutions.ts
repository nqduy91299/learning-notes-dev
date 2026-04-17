// ============================================================================
// 02-reset-revert: Solutions
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/02-reset-revert/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

interface ResetState { head: string; staged: Map<string, string>; working: Map<string, string>; }
interface RRCommit { sha: string; message: string; parentSha: string | null; tree: Map<string, string>; }

// ─── Exercise 1 ────────────────────────────────────────────────────────────
console.log("Exercise 1:");
console.log("--soft: HEAD=B, staged=C's content, working=version 3");
console.log("--mixed: HEAD=B, staged=B's content, working=version 3");
console.log("--hard: HEAD=B, staged=B's content, working=B's content");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
function simulateReset(current: ResetState, targetTree: Map<string, string>, targetSha: string, mode: "soft" | "mixed" | "hard"): ResetState {
  return {
    head: targetSha,
    staged: mode === "soft" ? current.staged : new Map(targetTree),
    working: mode === "hard" ? new Map(targetTree) : current.working,
  };
}

console.log("\nExercise 2:");
const state: ResetState = { head: "c", staged: new Map([["f", "v3"]]), working: new Map([["f", "modified"]]) };
const target = new Map([["f", "v2"]]);
console.log("Soft:", simulateReset(state, target, "b", "soft"));
console.log("Mixed:", simulateReset(state, target, "b", "mixed"));
console.log("Hard:", simulateReset(state, target, "b", "hard"));

// ─── Exercise 3 ────────────────────────────────────────────────────────────
console.log("\nExercise 3:");
console.log("Commits:", 4, "(A→B→C→C')");
console.log("file.txt exists:", false, "(reverted = removed)");
console.log("History: A → B → C → Revert C");

// ─── Exercise 4 ────────────────────────────────────────────────────────────
function simulateRevert(commits: Map<string, RRCommit>, headSha: string, revertSha: string): { newCommit: RRCommit; success: boolean } {
  const toRevert = commits.get(revertSha);
  const parent = toRevert?.parentSha ? commits.get(toRevert.parentSha) : null;
  const headCommit = commits.get(headSha);
  if (!toRevert || !headCommit) return { newCommit: { sha: "", message: "", parentSha: null, tree: new Map() }, success: false };

  const parentTree = parent?.tree ?? new Map<string, string>();
  const newTree = new Map(headCommit.tree);

  // Undo changes: for each file changed in the reverted commit, restore parent's version
  for (const [f, v] of toRevert.tree) {
    if (parentTree.get(f) !== v) {
      const pv = parentTree.get(f);
      if (pv !== undefined) newTree.set(f, pv);
      else newTree.delete(f);
    }
  }
  for (const f of parentTree.keys()) {
    if (!toRevert.tree.has(f)) newTree.set(f, parentTree.get(f)!);
  }

  return { newCommit: { sha: `revert_${revertSha}`, message: `Revert "${toRevert.message}"`, parentSha: headSha, tree: newTree }, success: true };
}

console.log("\nExercise 4:");
const cm = new Map<string, RRCommit>([
  ["a", { sha: "a", message: "Init", parentSha: null, tree: new Map([["f", "v1"]]) }],
  ["b", { sha: "b", message: "Update", parentSha: "a", tree: new Map([["f", "v2"]]) }],
]);
console.log(simulateRevert(cm, "b", "b"));

// ─── Exercise 5 ────────────────────────────────────────────────────────────
console.log("\nExercise 5:");
console.log("Reset safe:", false);
console.log("Revert safe:", true);
console.log("Why: Reset rewrites history (needs force push), revert adds new commit (safe)");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function recoverAfterReset(reflog: Array<{ sha: string; action: string }>, targetAction: string): string | null {
  for (const entry of reflog) {
    if (entry.action.includes(targetAction)) return entry.sha;
  }
  return null;
}

console.log("\nExercise 6:");
console.log(recoverAfterReset([
  { sha: "b", action: "reset: moving to HEAD~1" },
  { sha: "c", action: "commit: Important work" },
  { sha: "b", action: "commit: Previous" },
], "Important work")); // "c"

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedReset(state: ResetState, targetTree: Map<string, string>, targetSha: string, mode: "soft" | "mixed" | "hard"): ResetState {
  return {
    head: targetSha,
    staged: mode === "soft" ? state.staged : new Map(targetTree),      // FIX: soft keeps staging
    working: mode === "hard" ? new Map(targetTree) : state.working,     // FIX: only hard resets working
  };
}

console.log("\nExercise 7:");
console.log("Fixed:", fixedReset(state, target, "b", "mixed"));

// ─── Exercise 8 ────────────────────────────────────────────────────────────
console.log("\nExercise 8:");
console.log("History: A → B → C → D → D' → C' (two revert commits)");
console.log("Equivalent to B:", true, "(in terms of tree content, not history)");

// ─── Exercise 9 ────────────────────────────────────────────────────────────
class UndoSystem {
  private commits: Map<string, RRCommit> = new Map();
  private head: string | null = null;
  private _reflog: Array<{ sha: string; action: string }> = [];
  private counter = 0;

  addCommit(sha: string, msg: string, parent: string | null, tree: Map<string, string>): void {
    this.commits.set(sha, { sha, message: msg, parentSha: parent, tree });
    this.head = sha;
    this._reflog.unshift({ sha, action: `commit: ${msg}` });
  }

  reset(targetSha: string, _mode: "soft" | "mixed" | "hard"): void {
    this._reflog.unshift({ sha: targetSha, action: `reset: moving to ${targetSha}` });
    this.head = targetSha;
  }

  revert(sha: string): string | null {
    if (!this.head) return null;
    const result = simulateRevert(this.commits, this.head, sha);
    if (!result.success) return null;
    const newSha = `rv${++this.counter}`;
    result.newCommit.sha = newSha;
    this.commits.set(newSha, result.newCommit);
    this.head = newSha;
    this._reflog.unshift({ sha: newSha, action: `revert: ${sha}` });
    return newSha;
  }

  getHead(): string | null { return this.head; }
  getReflog(): Array<{ sha: string; action: string }> { return [...this._reflog]; }
}

console.log("\nExercise 9:");
const us = new UndoSystem();
us.addCommit("a", "Init", null, new Map([["f", "v1"]]));
us.addCommit("b", "Update", "a", new Map([["f", "v2"]]));
us.revert("b");
console.log("Head after revert:", us.getHead());
console.log("Reflog:", us.getReflog());

console.log("\nExercise 10:");
console.log("Unstages file.txt (resets it in staging to HEAD version)");
console.log("It's effectively --mixed for a single file");

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function selectiveRevert(headTree: Map<string, string>, commitTree: Map<string, string>, commitParentTree: Map<string, string>, filesToRevert: string[]): Map<string, string> {
  const result = new Map(headTree);
  for (const file of filesToRevert) {
    const parentVersion = commitParentTree.get(file);
    const commitVersion = commitTree.get(file);
    if (parentVersion !== commitVersion) {
      if (parentVersion !== undefined) result.set(file, parentVersion);
      else result.delete(file);
    }
  }
  return result;
}

console.log("\nExercise 11:");
console.log(selectiveRevert(new Map([["a", "2"], ["b", "2"]]), new Map([["a", "2"], ["b", "2"]]), new Map([["a", "1"], ["b", "1"]]), ["a"]));

console.log("\nExercise 12:");
console.log("Undone: all changes from the feature branch");
console.log("-m 1: first parent is mainline, so undo everything feature brought in");
console.log("Re-merge: need to 'revert the revert' first, then merge again");

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class GitResetRevert {
  commits: Map<string, RRCommit> = new Map();
  head: string | null = null;
  staging: Map<string, string> = new Map();
  working: Map<string, string> = new Map();
  private counter = 0;

  addCommit(sha: string, msg: string, parent: string | null, tree: Map<string, string>): void { this.commits.set(sha, { sha, message: msg, parentSha: parent, tree }); this.head = sha; this.staging = new Map(tree); this.working = new Map(tree); }
  resetSoft(t: string): void { this.head = t; }
  resetMixed(t: string): void { this.head = t; this.staging = new Map(this.commits.get(t)?.tree ?? []); }
  resetHard(t: string): void { this.head = t; const tr = this.commits.get(t)?.tree ?? new Map(); this.staging = new Map(tr); this.working = new Map(tr); }
  revert(sha: string): string | null {
    const c = this.commits.get(sha); if (!c || !this.head) return null;
    const ns = `rv${++this.counter}`;
    const pt = c.parentSha ? this.commits.get(c.parentSha)?.tree ?? new Map() : new Map<string, string>();
    this.addCommit(ns, `Revert "${c.message}"`, this.head, pt);
    return ns;
  }
}

console.log("\nExercise 13:");
const grr = new GitResetRevert();
grr.addCommit("a", "Init", null, new Map([["f", "1"]]));
grr.addCommit("b", "Change", "a", new Map([["f", "2"]]));
grr.resetSoft("a");
console.log("After soft reset — head:", grr.head, "staged:", [...grr.staging]);

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
