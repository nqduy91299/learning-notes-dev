// ============================================================================
// 02-reset-revert: Exercises
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/02-reset-revert/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering reset modes, revert, recovery
// ============================================================================

// Exercise 1: Predict the Output — reset modes
// Given: A → B → C (HEAD), file.txt has "version 3" in working dir
// a) After --soft HEAD~1: what's in staging? working dir? HEAD points to?
// b) After --mixed HEAD~1: same questions
// c) After --hard HEAD~1: same questions
const ex1_soft_head: string = "";    // TODO
const ex1_soft_staged: string = "";  // TODO
const ex1_soft_working: string = ""; // TODO
const ex1_mixed_staged: string = ""; // TODO
const ex1_hard_working: string = ""; // TODO

// Exercise 2: Simulate reset modes
// ----------------------------------------------------------------------------
interface ResetState { head: string; staged: Map<string, string>; working: Map<string, string>; }

function simulateReset(
  _current: ResetState,
  _targetCommitTree: Map<string, string>,
  _targetSha: string,
  _mode: "soft" | "mixed" | "hard"
): ResetState {
  // TODO: Return new state after reset
  return { head: "", staged: new Map(), working: new Map() };
}

// Exercise 3: Predict the Output — revert
// A → B → C (HEAD). C added file.txt. git revert HEAD.
// a) How many commits now?
// b) Does file.txt exist?
// c) What does the history look like?
const ex3_a: number = 0;      // TODO
const ex3_b: boolean = false;  // TODO
const ex3_c: string = "";      // TODO

// Exercise 4: Implement revert simulation
// ----------------------------------------------------------------------------
interface RRCommit { sha: string; message: string; parentSha: string | null; tree: Map<string, string>; }

function simulateRevert(
  _commits: Map<string, RRCommit>,
  _headSha: string,
  _revertSha: string
): { newCommit: RRCommit; success: boolean } {
  // TODO: Create a new commit that undoes the changes introduced by revertSha
  return { newCommit: { sha: "", message: "", parentSha: null, tree: new Map() }, success: false };
}

// Exercise 5: Predict the Output — reset vs revert safety
// Scenario: You pushed C to shared branch. Need to undo C.
// a) Is `git reset --hard HEAD~1` safe?
// b) Is `git revert HEAD` safe?
// c) Why?
const ex5_a: boolean = false; // TODO
const ex5_b: boolean = false; // TODO
const ex5_c: string = "";     // TODO

// Exercise 6: Implement reflog-based recovery
// ----------------------------------------------------------------------------
interface ReflogEntry { sha: string; action: string; }

function recoverAfterReset(
  _reflog: ReflogEntry[],
  _targetAction: string
): string | null {
  // TODO: Find the SHA of the commit before a specific action
  return null;
}

// Exercise 7: Fix the Bug — reset implementation
// ----------------------------------------------------------------------------
function buggyReset(state: ResetState, targetTree: Map<string, string>, targetSha: string, mode: "soft" | "mixed" | "hard"): ResetState {
  // BUG 1: soft should not modify staging
  // BUG 2: mixed should reset staging but not working
  // BUG 3: hard should reset both
  return {
    head: targetSha,
    staged: mode === "hard" ? targetTree : state.staged,
    working: mode === "soft" ? state.working : targetTree,
  };
}

// Exercise 8: Predict the Output — multiple reverts
// A → B → C → D. Revert D, then revert C.
// a) What does the tree look like?
// b) Is it equivalent to resetting to B?
const ex8_a: string = "";      // TODO: history description
const ex8_b: boolean = false;  // TODO

// Exercise 9: Implement undo system with reset + revert
// ----------------------------------------------------------------------------
class UndoSystem {
  private commits: Map<string, RRCommit> = new Map();
  private head: string | null = null;
  private reflog: Array<{ sha: string; action: string }> = [];

  addCommit(sha: string, msg: string, parent: string | null, tree: Map<string, string>): void {
    this.commits.set(sha, { sha, message: msg, parentSha: parent, tree });
    this.head = sha;
    this.reflog.unshift({ sha, action: `commit: ${msg}` });
  }

  // TODO: Reset to a previous commit
  reset(_targetSha: string, _mode: "soft" | "mixed" | "hard"): void {}
  // TODO: Revert a specific commit
  revert(_sha: string): string | null { return null; }
  // TODO: Get current head
  getHead(): string | null { return this.head; }
  // TODO: Get reflog
  getReflog(): Array<{ sha: string; action: string }> { return []; }
}

// Exercise 10: Predict the Output — reset file
// git reset HEAD -- file.txt
// a) What does this do?  b) Is it --soft, --mixed, or --hard?
const ex10_a: string = ""; // TODO
const ex10_b: string = ""; // TODO

// Exercise 11: Implement selective revert
// ----------------------------------------------------------------------------
function selectiveRevert(
  _headTree: Map<string, string>,
  _commitTree: Map<string, string>,
  _commitParentTree: Map<string, string>,
  _filesToRevert: string[]
): Map<string, string> {
  // TODO: Revert only specific files from a commit
  return new Map();
}

// Exercise 12: Predict the Output — revert merge
// M is merge of feature into main. git revert -m 1 M.
// a) What gets undone?
// b) What does -m 1 mean?
// c) Can you re-merge feature later?
const ex12_a: string = ""; // TODO
const ex12_b: string = ""; // TODO
const ex12_c: string = ""; // TODO

// Exercise 13: Build complete reset/revert system
// ----------------------------------------------------------------------------
class GitResetRevert {
  commits: Map<string, RRCommit> = new Map();
  head: string | null = null;
  staging: Map<string, string> = new Map();
  working: Map<string, string> = new Map();
  private counter = 0;

  addCommit(sha: string, msg: string, parent: string | null, tree: Map<string, string>): void { this.commits.set(sha, { sha, message: msg, parentSha: parent, tree }); this.head = sha; this.staging = new Map(tree); this.working = new Map(tree); }
  resetSoft(target: string): void { this.head = target; }
  resetMixed(target: string): void { this.head = target; this.staging = new Map(this.commits.get(target)?.tree ?? []); }
  resetHard(target: string): void { this.head = target; const t = this.commits.get(target)?.tree ?? new Map(); this.staging = new Map(t); this.working = new Map(t); }
  revert(sha: string): string | null {
    const c = this.commits.get(sha); const p = c?.parentSha ? this.commits.get(c.parentSha) : null;
    if (!c) return null;
    const newTree = new Map(this.commits.get(this.head!)?.tree ?? []);
    const parentTree = p?.tree ?? new Map();
    for (const [f, v] of c.tree) { if (parentTree.get(f) !== v) newTree.set(f, parentTree.get(f) ?? ""); }
    const ns = `rv${++this.counter}`;
    this.addCommit(ns, `Revert "${c.message}"`, this.head, newTree);
    return ns;
  }
}

export {
  simulateReset, simulateRevert, recoverAfterReset, buggyReset,
  UndoSystem, selectiveRevert, GitResetRevert,
  ex1_soft_head, ex1_soft_staged, ex1_soft_working, ex1_mixed_staged, ex1_hard_working,
  ex3_a, ex3_b, ex3_c, ex5_a, ex5_b, ex5_c, ex8_a, ex8_b, ex10_a, ex10_b, ex12_a, ex12_b, ex12_c,
};
export type { ResetState, RRCommit };
