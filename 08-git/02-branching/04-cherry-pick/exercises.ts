// ============================================================================
// 04-cherry-pick: Exercises
// ============================================================================
// Run:  npx tsx 08-git/02-branching/04-cherry-pick/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering cherry-pick on commit graphs
// ============================================================================

// Exercise 1: Predict the Output — basic cherry-pick
// ----------------------------------------------------------------------------
// main:    A → B → C (HEAD)
// feature: A → B → D → E → F
//
// git cherry-pick E (from main)
//
// a) What is E' parent?
// b) Does E' have the same SHA as E?
// c) Does feature branch change?

const ex1_a: string = "";      // TODO
const ex1_b: boolean = false;  // TODO
const ex1_c: boolean = false;  // TODO

// Exercise 2: Implement cherry-pick simulation
// ----------------------------------------------------------------------------
interface CPCommit {
  sha: string;
  message: string;
  parentSha: string | null;
  diff: Map<string, { from: string | null; to: string | null }>; // file changes
}

class CherryPickSim {
  private commits: Map<string, CPCommit> = new Map();
  private branches: Map<string, string> = new Map();
  private head: string = "main";
  private counter = 0;

  addCommit(sha: string, msg: string, parent: string | null, diff: Map<string, { from: string | null; to: string | null }>): void {
    this.commits.set(sha, { sha, message: msg, parentSha: parent, diff });
  }

  setBranch(name: string, sha: string): void { this.branches.set(name, sha); }
  setHead(branch: string): void { this.head = branch; }

  // TODO: Cherry-pick a commit onto current branch
  cherryPick(_sha: string): { newSha: string; conflicts: string[] } | null {
    return null;
  }

  // TODO: Cherry-pick with -x flag (add origin note)
  cherryPickWithRef(_sha: string): { newSha: string; message: string } | null {
    return null;
  }

  getCommit(sha: string): CPCommit | undefined { return this.commits.get(sha); }
}


// Exercise 3: Predict the Output — cherry-pick range
// ----------------------------------------------------------------------------
// feature: A → B → C → D → E
//
// git cherry-pick C..E (from main at commit X)
// a) Which commits are applied?
// b) In what order?
// c) How many new commits on main?

const ex3_a: string[] = [];  // TODO: commit messages
const ex3_b: string = "";    // TODO: "oldest first" or "newest first"
const ex3_c: number = 0;     // TODO


// Exercise 4: Implement cherry-pick range
// ----------------------------------------------------------------------------
function cherryPickRange(
  _commits: Map<string, CPCommit>,
  _startExclusive: string,
  _endInclusive: string
): string[] {
  // TODO: Return the SHAs that would be cherry-picked in A..B notation
  // Walk from endInclusive back to startExclusive (exclusive)
  return [];
}


// Exercise 5: Predict the Output — conflict scenario
// ----------------------------------------------------------------------------
// base (A): file.txt = "hello world"
// main (B): file.txt = "hello git"  (changed "world" to "git")
// feature (C): file.txt = "hello github" (changed "world" to "github")
//
// From main: git cherry-pick C
// a) Does this conflict?
// b) Why or why not?

const ex5_a: boolean = false; // TODO
const ex5_b: string = "";     // TODO


// Exercise 6: Simulate cherry-pick on a commit graph
// ----------------------------------------------------------------------------
interface GraphNode {
  sha: string;
  message: string;
  parents: string[];
  tree: Map<string, string>;
}

function simulateCherryPick(
  _graph: Map<string, GraphNode>,
  _targetBranch: string, // SHA of current HEAD
  _commitToCherry: string
): { newTree: Map<string, string>; conflicts: string[] } {
  // TODO: Compute the diff of commitToCherry vs its parent
  // Apply that diff to targetBranch's tree
  return { newTree: new Map(), conflicts: [] };
}


// Exercise 7: Fix the Bug — cherry-pick implementation
// ----------------------------------------------------------------------------
function buggyCherryPick(
  currentTree: Map<string, string>,
  commitDiff: Map<string, { from: string | null; to: string | null }>
): Map<string, string> {
  const newTree = new Map(currentTree);
  for (const [file, change] of commitDiff) {
    // BUG 1: Should handle deletions (to === null)
    // BUG 2: Should handle new files (from === null)
    // BUG 3: Should check for conflicts (current !== from)
    newTree.set(file, change.to!);
  }
  return newTree;
}


// Exercise 8: Predict the Output — cherry-pick merge commit
// ----------------------------------------------------------------------------
// Merge commit M has parents P1 (main line) and P2 (feature line)
// M brought in changes from feature: added file "feat.ts"
//
// a) git cherry-pick M — what error?
// b) git cherry-pick -m 1 M — what does it do?
// c) git cherry-pick -m 2 M — what does it do?

const ex8_a: string = ""; // TODO
const ex8_b: string = ""; // TODO
const ex8_c: string = ""; // TODO


// Exercise 9: Implement -x flag message formatter
// ----------------------------------------------------------------------------
function formatCherryPickMessage(_originalMessage: string, _originalSha: string): string {
  // TODO: Format like git cherry-pick -x
  // Original message + "\n\n(cherry picked from commit <sha>)"
  return "";
}


// Exercise 10: Predict the Output — duplicate commits after merge
// ----------------------------------------------------------------------------
// main:    A → B → C → E'(cherry-pick of E) → ... → M (merge)
// feature: A → B → D → E → F
//
// After merging feature into main:
// a) Will there be a conflict from the duplicate E/E'?
// b) How many times do E's changes appear?

const ex10_a: string = ""; // TODO
const ex10_b: string = ""; // TODO


// Exercise 11: Implement selective cherry-pick (--no-commit)
// ----------------------------------------------------------------------------
function cherryPickNoCommit(
  _currentTree: Map<string, string>,
  _staging: Map<string, string>,
  _commitDiff: Map<string, { from: string | null; to: string | null }>
): { newTree: Map<string, string>; newStaging: Map<string, string> } {
  // TODO: Apply changes to both working tree and staging, but don't "commit"
  return { newTree: new Map(), newStaging: new Map() };
}


// Exercise 12: Implement cherry-pick conflict detector
// ----------------------------------------------------------------------------
function detectCherryPickConflicts(
  _currentTree: Map<string, string>,
  _commitParentTree: Map<string, string>,
  _commitTree: Map<string, string>
): string[] {
  // TODO: Return list of files that would conflict
  // A conflict occurs when:
  // - commit changed a file (parent→commit different)
  // - AND current tree also differs from parent for that file
  return [];
}


// Exercise 13: Build a complete cherry-pick system
// ----------------------------------------------------------------------------
class GitCherryPick {
  private commits: Map<string, GraphNode> = new Map();
  private branches: Map<string, string> = new Map();
  private head = "main";
  private counter = 0;

  addNode(sha: string, msg: string, parents: string[], tree: Map<string, string>): void {
    this.commits.set(sha, { sha, message: msg, parents, tree });
  }
  setBranch(name: string, sha: string): void { this.branches.set(name, sha); }

  // TODO: Cherry-pick single commit
  pick(_sha: string): { success: boolean; newSha?: string; conflicts?: string[] } {
    return { success: false };
  }

  // TODO: Cherry-pick range
  pickRange(_from: string, _to: string): { success: boolean; newShas: string[] } {
    return { success: false, newShas: [] };
  }

  // TODO: Abort
  abort(): void {}
}

export {
  CherryPickSim,
  cherryPickRange,
  simulateCherryPick,
  buggyCherryPick,
  formatCherryPickMessage,
  cherryPickNoCommit,
  detectCherryPickConflicts,
  GitCherryPick,
  ex1_a, ex1_b, ex1_c,
  ex3_a, ex3_b, ex3_c,
  ex5_a, ex5_b,
  ex8_a, ex8_b, ex8_c,
  ex10_a, ex10_b,
};
export type { CPCommit, GraphNode };
