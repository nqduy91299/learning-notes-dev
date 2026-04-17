// ============================================================================
// 02-merging: Exercises
// ============================================================================
// Run:  npx tsx 08-git/02-branching/02-merging/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 14 exercises covering merge types, conflicts, resolution, strategies
// ============================================================================

// Exercise 1: Predict the Output — fast-forward vs 3-way
// ----------------------------------------------------------------------------
// Scenario A: main has no new commits since feature branched
// Scenario B: main has new commits since feature branched
//
// a) Which scenario results in a fast-forward merge?
// b) Which creates a merge commit?
// c) After a fast-forward, how many parents does the resulting HEAD commit have?

const ex1_a: string = ""; // TODO: "A" or "B"
const ex1_b: string = ""; // TODO
const ex1_c: number = 0;  // TODO


// Exercise 2: Implement a fast-forward merge detector
// ----------------------------------------------------------------------------
interface MergeCommit {
  sha: string;
  message: string;
  parentSha: string | null;
}

function canFastForward(
  _commits: Map<string, MergeCommit>,
  _currentSha: string,
  _targetSha: string
): boolean {
  // TODO: Return true if currentSha is an ancestor of targetSha
  // (i.e., you can reach currentSha by walking back from targetSha)
  return false;
}


// Exercise 3: Implement three-way merge for strings
// ----------------------------------------------------------------------------
interface MergeResult {
  success: boolean;
  content: string;
  hasConflict: boolean;
}

function threeWayMerge(
  _base: string,
  _ours: string,
  _theirs: string
): MergeResult {
  // TODO: Line-by-line three-way merge
  // If a line is same in base+ours but different in theirs → take theirs
  // If a line is same in base+theirs but different in ours → take ours
  // If both changed the same line differently → conflict
  // If both changed the same line the same way → take either
  return { success: false, content: "", hasConflict: false };
}


// Exercise 4: Predict the Output — merge conflicts
// ----------------------------------------------------------------------------
// Base version of file.txt:   "Hello World"
// main changes file.txt to:   "Hello Git"
// feature changes file.txt to: "Hello GitHub"
//
// a) Does merging feature into main cause a conflict?
// b) What do the conflict markers look like?

const ex4_a: boolean = false; // TODO
const ex4_b: string = "";     // TODO: write out the conflict markers


// Exercise 5: Implement conflict marker parser
// ----------------------------------------------------------------------------
interface ConflictRegion {
  ours: string;
  theirs: string;
  startLine: number;
}

function parseConflicts(_content: string): ConflictRegion[] {
  // TODO: Parse conflict markers and return structured data
  // Look for <<<<<<< ... ======= ... >>>>>>>
  return [];
}


// Exercise 6: Implement conflict resolver
// ----------------------------------------------------------------------------
type Resolution = "ours" | "theirs" | "both";

function resolveConflicts(_content: string, _strategy: Resolution): string {
  // TODO: Resolve all conflict markers using the specified strategy
  // "ours" → keep content between <<<<<<< and =======
  // "theirs" → keep content between ======= and >>>>>>>
  // "both" → keep both sections
  return "";
}


// Exercise 7: Predict the Output — merge --no-ff
// ----------------------------------------------------------------------------
// Given linear history: main → A → B, feature → C → D
// (feature branched from B)
//
// a) `git merge feature` — how many commits in log?
// b) `git merge --no-ff feature` — how many commits in log?
// c) After --no-ff, what is the merge commit's first parent?

const ex7_a: number = 0;  // TODO
const ex7_b: number = 0;  // TODO
const ex7_c: string = ""; // TODO


// Exercise 8: Simulate a complete merge workflow
// ----------------------------------------------------------------------------
interface BranchState {
  commits: Array<{ sha: string; message: string; files: Map<string, string> }>;
  head: string;
}

function simulateMerge(
  _current: BranchState,
  _incoming: BranchState,
  _commonAncestorSha: string
): { result: "fast-forward" | "merge" | "conflict"; newHead?: string } {
  // TODO: Determine merge type and simulate the merge
  return { result: "conflict" };
}


// Exercise 9: Fix the Bug — merge conflict resolution
// ----------------------------------------------------------------------------
function buggyResolveConflict(content: string): string {
  // BUG 1: Doesn't handle multiple conflicts
  // BUG 2: Leaves some markers behind
  // BUG 3: Doesn't handle the "theirs" section correctly
  const start = content.indexOf("<<<<<<<");
  const mid = content.indexOf("=======");
  const end = content.indexOf(">>>>>>>");
  if (start === -1) return content;

  const before = content.slice(0, start);
  const _ours = content.slice(start + 7, mid); // BUG: +7 skips marker but not the line
  const theirs = content.slice(mid + 7, end);
  const _after = content.slice(end + 7);

  return before + theirs; // BUG: missing 'after' part
}


// Exercise 10: Predict the Output — merge strategies
// ----------------------------------------------------------------------------
// Given that both main and feature modified the same file:
//
// a) `git merge -s ours feature` — whose content wins?
// b) `git merge -s recursive feature` — what happens?
// c) `git merge -s octopus feature1 feature2` — when does this fail?

const ex10_a: string = ""; // TODO
const ex10_b: string = ""; // TODO
const ex10_c: string = ""; // TODO


// Exercise 11: Implement merge commit graph
// ----------------------------------------------------------------------------
interface GraphCommit {
  sha: string;
  parents: string[];
  message: string;
}

class MergeGraph {
  commits: Map<string, GraphCommit> = new Map();

  addCommit(sha: string, parents: string[], message: string): void {
    this.commits.set(sha, { sha, parents, message });
  }

  // TODO: Find common ancestor of two commits (merge base)
  findMergeBase(_sha1: string, _sha2: string): string | null { return null; }

  // TODO: Check if sha1 is ancestor of sha2
  isAncestor(_sha1: string, _sha2: string): boolean { return false; }

  // TODO: Get all commits reachable from a sha
  getReachable(_sha: string): Set<string> { return new Set(); }
}


// Exercise 12: Predict the Output — first parent log
// ----------------------------------------------------------------------------
// History:
//   main: A → B → M (merge) → E
//              \   /
//   feat:       C → D
//
// a) `git log --oneline` shows how many commits?
// b) `git log --first-parent --oneline` shows which commits?

const ex12_a: number = 0;       // TODO
const ex12_b: string[] = [];    // TODO: commit messages in order


// Exercise 13: Implement merge --abort simulation
// ----------------------------------------------------------------------------
class MergeSession {
  private originalHead: string = "";
  private originalIndex: Map<string, string> = new Map();
  private _merging = false;
  private _conflicts: string[] = [];

  // TODO: Start a merge attempt
  startMerge(_targetBranch: string, _currentHead: string, _index: Map<string, string>): void {}

  // TODO: Record a conflict
  addConflict(_file: string): void {}

  // TODO: Abort the merge (restore original state)
  abort(): { head: string; index: Map<string, string> } {
    return { head: "", index: new Map() };
  }

  // TODO: Complete the merge
  complete(): boolean { return false; }

  get isMerging(): boolean { return this._merging; }
  get conflicts(): string[] { return [...this._conflicts]; }
}


// Exercise 14: Build a complete merge system
// ----------------------------------------------------------------------------
class GitMerge {
  private commits: Map<string, { sha: string; parents: string[]; tree: Map<string, string> }> = new Map();
  private branches: Map<string, string> = new Map();
  private head: string = "main";

  // TODO: Full merge implementation with:
  // - Fast-forward detection
  // - Three-way merge
  // - Conflict detection
  // - --no-ff support
  merge(_branch: string, _options?: { noFf?: boolean }): {
    type: "fast-forward" | "merge" | "conflict" | "already-up-to-date";
    conflicts?: string[];
  } {
    return { type: "already-up-to-date" };
  }
}

export {
  canFastForward,
  threeWayMerge,
  parseConflicts,
  resolveConflicts,
  simulateMerge,
  buggyResolveConflict,
  MergeGraph,
  MergeSession,
  GitMerge,
  ex1_a, ex1_b, ex1_c,
  ex4_a, ex4_b,
  ex7_a, ex7_b, ex7_c,
  ex10_a, ex10_b, ex10_c,
  ex12_a, ex12_b,
};
export type { MergeCommit, MergeResult, ConflictRegion, BranchState, GraphCommit };
