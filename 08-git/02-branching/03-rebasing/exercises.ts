// ============================================================================
// 03-rebasing: Exercises
// ============================================================================
// Run:  npx tsx 08-git/02-branching/03-rebasing/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 14 exercises covering rebase, interactive rebase, rebase vs merge
// ============================================================================

// Exercise 1: Predict the Output — basic rebase
// ----------------------------------------------------------------------------
// Before rebase:
//   main:    A(m1) → B(m2) → C(m3)
//   feature: A(m1) → B(m2) → D(f1) → E(f2)
//
// After `git switch feature && git rebase main`:
// a) What is the parent of D'?
// b) How many total commits exist on feature?
// c) Do D and D' have the same SHA?

const ex1_a: string = "";      // TODO: parent commit message
const ex1_b: number = 0;       // TODO
const ex1_c: boolean = false;  // TODO


// Exercise 2: Simulate a rebase operation
// ----------------------------------------------------------------------------
interface RCommit {
  sha: string;
  message: string;
  parentSha: string | null;
  changes: Map<string, string>; // file -> content
}

class RebaseSimulator {
  private commits: Map<string, RCommit> = new Map();
  private counter = 0;

  addCommit(sha: string, message: string, parentSha: string | null, changes: Map<string, string>): void {
    this.commits.set(sha, { sha, message, parentSha, changes });
  }

  // TODO: Rebase a branch onto a new base
  // Takes: commits to replay (in order), new base SHA
  // Returns: new commit SHAs
  rebase(_commitsToReplay: string[], _newBaseSha: string): string[] {
    return [];
  }

  getCommit(sha: string): RCommit | undefined {
    return this.commits.get(sha);
  }

  private newSha(): string {
    return "r" + (++this.counter).toString().padStart(3, "0");
  }
}


// Exercise 3: Predict the Output — interactive rebase
// ----------------------------------------------------------------------------
// Given commits (oldest to newest):
//   pick aaa "Add feature"
//   pick bbb "Fix typo"
//   pick ccc "Add tests"
//   pick ddd "Debug logging"
//
// Interactive rebase todo:
//   pick aaa "Add feature"
//   squash bbb "Fix typo"
//   pick ccc "Add tests"
//   drop ddd "Debug logging"
//
// a) How many commits result?
// b) What happened to bbb's changes?
// c) What happened to ddd's changes?

const ex3_a: number = 0;  // TODO
const ex3_b: string = ""; // TODO
const ex3_c: string = ""; // TODO


// Exercise 4: Implement interactive rebase simulator
// ----------------------------------------------------------------------------
type RebaseAction = "pick" | "squash" | "fixup" | "reword" | "drop";

interface RebaseTodo {
  action: RebaseAction;
  sha: string;
  message: string;
  newMessage?: string; // for reword
}

function interactiveRebase(
  _commits: RCommit[],
  _todos: RebaseTodo[]
): Array<{ message: string; combinedChanges: Map<string, string> }> {
  // TODO: Process the todo list and return resulting commits
  return [];
}


// Exercise 5: Predict the Output — rebase vs merge
// ----------------------------------------------------------------------------
// History: main A→B→C, feature D→E (branched from B)
//
// Scenario 1: git merge main (from feature)
// Scenario 2: git rebase main (from feature)
//
// a) How many commits on feature after merge?
// b) How many commits on feature after rebase?
// c) Which scenario creates a merge commit?
// d) Which preserves original commit SHAs?

const ex5_a: number = 0;      // TODO
const ex5_b: number = 0;      // TODO
const ex5_c: string = "";     // TODO: "merge" or "rebase"
const ex5_d: string = "";     // TODO


// Exercise 6: Implement squash logic
// ----------------------------------------------------------------------------
function squashCommits(
  _commits: Array<{ message: string; changes: Map<string, string> }>
): { message: string; changes: Map<string, string> } {
  // TODO: Combine all commits into one
  // Message: concatenate all messages with newlines
  // Changes: merge all changes (later ones override earlier for same file)
  return { message: "", changes: new Map() };
}


// Exercise 7: Predict the Output — golden rule violation
// ----------------------------------------------------------------------------
// Developer A: pushes feature branch with commits D, E
// Developer B: pulls feature branch
// Developer A: rebases feature onto main (creating D', E')
// Developer A: force pushes
// Developer B: git pull
//
// a) What problem does Developer B encounter?
// b) How many copies of D's changes might exist?

const ex7_a: string = ""; // TODO
const ex7_b: number = 0;  // TODO


// Exercise 8: Implement rebase --onto simulation
// ----------------------------------------------------------------------------
function rebaseOnto(
  _commits: Map<string, RCommit>,
  _newBase: string,
  _oldBase: string,
  _branch: string
): string[] {
  // TODO: Find commits between oldBase and branch tip
  // Replay them onto newBase
  // Return new commit SHAs
  return [];
}


// Exercise 9: Fix the Bug — rebase implementation
// ----------------------------------------------------------------------------
function buggyRebase(
  commits: Array<{ sha: string; message: string; parent: string | null }>,
  newBaseSha: string
) {
  const result: Array<{ sha: string; message: string; parent: string | null }> = [];
  let _lastSha = newBaseSha;

  for (const commit of commits) {
    // BUG 1: Should create NEW sha, not reuse old one
    // BUG 2: Parent should be the previous rebased commit, not original parent
    // BUG 3: Not updating lastSha
    result.push({
      sha: commit.sha,
      message: commit.message,
      parent: commit.parent,
    });
  }
  return result;
}


// Exercise 10: Predict the Output — conflict during rebase
// ----------------------------------------------------------------------------
// Rebasing 3 commits, conflict occurs on commit 2:
// a) What state is the repo in?
// b) After resolving, what command continues rebase?
// c) How many more conflict resolutions might be needed?
// d) What command aborts the entire rebase?

const ex10_a: string = ""; // TODO
const ex10_b: string = ""; // TODO
const ex10_c: string = ""; // TODO
const ex10_d: string = ""; // TODO


// Exercise 11: Implement autosquash detector
// ----------------------------------------------------------------------------
function autoSquash(
  _commits: Array<{ sha: string; message: string }>
): RebaseTodo[] {
  // TODO: Detect "fixup!" and "squash!" prefixed commits
  // Reorder them right after their target commits
  // "fixup! Add login" should be placed after "Add login" with action "fixup"
  return [];
}


// Exercise 12: Predict the Output — rebase preserving merges
// ----------------------------------------------------------------------------
// Can rebase preserve merge commits?
// a) Default behavior with merge commits during rebase?
// b) What flag preserves merge topology?

const ex12_a: string = ""; // TODO
const ex12_b: string = ""; // TODO


// Exercise 13: Implement commit replayer
// ----------------------------------------------------------------------------
function replayCommit(
  _baseSha: string,
  _baseTree: Map<string, string>,
  _commitChanges: Map<string, string>
): { newTree: Map<string, string>; conflicts: string[] } {
  // TODO: Apply changes to base tree
  // Return conflicts if a file was changed in both base and commit
  return { newTree: new Map(), conflicts: [] };
}


// Exercise 14: Build a complete rebase system
// ----------------------------------------------------------------------------
class GitRebase {
  private commits: Map<string, RCommit> = new Map();
  private branches: Map<string, string> = new Map();

  addCommit(sha: string, msg: string, parent: string | null, changes: Map<string, string>): void {
    this.commits.set(sha, { sha, message: msg, parentSha: parent, changes });
  }

  setBranch(name: string, sha: string): void {
    this.branches.set(name, sha);
  }

  // TODO: Implement full rebase with conflict detection
  rebase(_branch: string, _onto: string): {
    success: boolean;
    newCommits: string[];
    conflicts?: string[];
  } {
    return { success: false, newCommits: [] };
  }

  // TODO: Interactive rebase
  interactiveRebase(_branch: string, _todos: RebaseTodo[]): {
    success: boolean;
    newCommits: string[];
  } {
    return { success: false, newCommits: [] };
  }
}

export {
  RebaseSimulator,
  interactiveRebase,
  squashCommits,
  rebaseOnto,
  buggyRebase,
  autoSquash,
  replayCommit,
  GitRebase,
  ex1_a, ex1_b, ex1_c,
  ex3_a, ex3_b, ex3_c,
  ex5_a, ex5_b, ex5_c, ex5_d,
  ex7_a, ex7_b,
  ex10_a, ex10_b, ex10_c, ex10_d,
  ex12_a, ex12_b,
};
export type { RCommit, RebaseAction, RebaseTodo };
