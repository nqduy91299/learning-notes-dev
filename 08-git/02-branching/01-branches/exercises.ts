// ============================================================================
// 01-branches: Exercises
// ============================================================================
// Run:  npx tsx 08-git/02-branching/01-branches/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 14 exercises covering branches, HEAD, detached HEAD, branch pointers
// ============================================================================

// Exercise 1: Predict the Output — branch creation
// ----------------------------------------------------------------------------
// Given:
//   git init && git commit --allow-empty -m "C1"
//   git commit --allow-empty -m "C2"
//   git branch feature
//
// a) How many branches exist?
// b) Which branch is HEAD pointing to?
// c) Do main and feature point to the same commit?

const ex1_a: number = 0;      // TODO
const ex1_b: string = "";     // TODO
const ex1_c: boolean = false; // TODO


// Exercise 2: Simulate a branch pointer system
// ----------------------------------------------------------------------------
interface Commit {
  sha: string;
  message: string;
  parentSha: string | null;
}

class BranchSystem {
  private commits: Map<string, Commit> = new Map();
  private branches: Map<string, string> = new Map(); // branch -> sha
  private head: { type: "branch"; name: string } | { type: "detached"; sha: string } =
    { type: "branch", name: "main" };
  private counter = 0;

  // TODO: Create a new commit on the current branch
  commit(_message: string): string { return ""; }

  // TODO: Create a new branch at current HEAD
  createBranch(_name: string): void {}

  // TODO: Switch to a branch
  switchBranch(_name: string): boolean { return false; }

  // TODO: Get current branch name (or null if detached)
  getCurrentBranch(): string | null { return null; }

  // TODO: Get the SHA that HEAD points to
  getHeadSha(): string | null { return null; }

  // TODO: List all branches with their SHAs
  listBranches(): Array<{ name: string; sha: string; isCurrent: boolean }> { return []; }

  // TODO: Delete a branch (refuse if it's current)
  deleteBranch(_name: string): boolean { return false; }
}


// Exercise 3: Predict the Output — switching branches
// ----------------------------------------------------------------------------
// Given:
//   git init && echo "v1" > file.txt && git add . && git commit -m "C1"
//   git switch -c feature
//   echo "v2" > file.txt && git add . && git commit -m "C2"
//   git switch main
//
// What is the content of file.txt after switching back to main?
const ex3_content: string = ""; // TODO


// Exercise 4: Predict the Output — detached HEAD
// ----------------------------------------------------------------------------
// Given:
//   git init
//   git commit --allow-empty -m "C1"  # sha: aaa
//   git commit --allow-empty -m "C2"  # sha: bbb
//   git commit --allow-empty -m "C3"  # sha: ccc
//   git checkout bbb
//
// a) What does .git/HEAD contain?
// b) What branch are you on?
// c) If you make a commit here, what happens when you switch back to main?

const ex4_a: string = ""; // TODO
const ex4_b: string = ""; // TODO: "main", "feature", or "none (detached)"
const ex4_c: string = ""; // TODO: describe what happens


// Exercise 5: Implement HEAD resolver
// ----------------------------------------------------------------------------
class HeadResolver {
  private branches: Map<string, string>;
  private headRef: string; // "ref: refs/heads/main" or raw sha

  constructor(branches: Map<string, string>, headRef: string) {
    this.branches = branches;
    this.headRef = headRef;
  }

  // TODO: Is HEAD attached to a branch?
  isAttached(): boolean { return false; }

  // TODO: Get the branch name HEAD points to (or null)
  getBranch(): string | null { return null; }

  // TODO: Get the commit SHA HEAD resolves to
  resolve(): string | null { return null; }

  // TODO: Detach HEAD to a specific commit
  detach(_sha: string): void {}

  // TODO: Attach HEAD to a branch
  attach(_branch: string): void {}
}


// Exercise 6: Predict the Output — branch listing
// ----------------------------------------------------------------------------
// Given branches: main, feature/auth, feature/dashboard, bugfix/login
// Current: feature/auth
//
// What does `git branch` output look like?
const ex6_output: string[] = []; // TODO: lines of output (* marks current)


// Exercise 7: Implement branch name validator
// ----------------------------------------------------------------------------
function isValidBranchName(_name: string): { valid: boolean; reason?: string } {
  // TODO: Check git branch naming rules:
  // - No spaces
  // - No ~ ^ : \ ? * [
  // - Cannot start with -
  // - Cannot end with .lock
  // - Cannot contain ..
  // - Cannot contain @{
  return { valid: true };
}


// Exercise 8: Fix the Bug — branch operations
// ----------------------------------------------------------------------------
function buggyBranchSwitch(
  branches: Map<string, string>,
  currentBranch: string,
  targetBranch: string
) {
  // BUG 1: Should check if target branch exists
  // BUG 2: Should update HEAD, not create new branch
  // BUG 3: Should return the new HEAD sha
  branches.set(targetBranch, branches.get(currentBranch)!);
  return currentBranch;
}


// Exercise 9: Simulate branch commit history divergence
// ----------------------------------------------------------------------------
function simulateDivergence(): {
  mainCommits: string[];
  featureCommits: string[];
  commonAncestor: string;
} {
  // TODO: Create a scenario where main and feature have diverged
  // Return the commit messages on each branch and the common ancestor
  return { mainCommits: [], featureCommits: [], commonAncestor: "" };
}


// Exercise 10: Predict the Output — branch -vv
// ----------------------------------------------------------------------------
// Given:
//   Local main tracks origin/main, ahead 1
//   Local feature tracks origin/feature, behind 2
//   Local hotfix has no upstream
//
// What does `git branch -vv` show for each?
const ex10_main: string = "";    // TODO
const ex10_feature: string = ""; // TODO
const ex10_hotfix: string = "";  // TODO


// Exercise 11: Implement a commit graph walker
// ----------------------------------------------------------------------------
function getCommitsOnBranch(
  _commits: Map<string, Commit>,
  _branchSha: string,
  _stopAtSha?: string
): Commit[] {
  // TODO: Walk from branchSha back through parents
  // Stop at stopAtSha (exclusive) or when reaching root
  return [];
}


// Exercise 12: Predict the Output — branch -d vs -D
// ----------------------------------------------------------------------------
// Given: feature branch has 3 unmerged commits
//
// a) What happens with `git branch -d feature`?
// b) What happens with `git branch -D feature`?
// c) After -D, can you recover the commits?

const ex12_a: string = ""; // TODO
const ex12_b: string = ""; // TODO
const ex12_c: string = ""; // TODO


// Exercise 13: Implement packed-refs parser
// ----------------------------------------------------------------------------
function parsePackedRefs(_content: string): Map<string, string> {
  // TODO: Parse packed-refs file content into a map of ref -> sha
  // Lines starting with # are comments
  // Format: "sha ref"
  return new Map();
}


// Exercise 14: Build a complete branch management system
// ----------------------------------------------------------------------------
class GitBranches {
  private commits: Map<string, Commit> = new Map();
  private branches: Map<string, string> = new Map();
  private head: string = "ref: refs/heads/main";
  private _reflog: Array<{ sha: string; action: string }> = [];

  // TODO: Implement full branch lifecycle:
  // init, commit, createBranch, switchBranch, deleteBranch,
  // listBranches, getLog, isDetached, detachHead
  init(): void {}
  makeCommit(_msg: string): string { return ""; }
  createBranch(_name: string): void {}
  switchTo(_name: string): void {}
  deleteBranch(_name: string): boolean { return false; }
  getBranches(): string[] { return []; }
  isDetached(): boolean { return false; }
}

export {
  BranchSystem,
  HeadResolver,
  isValidBranchName,
  buggyBranchSwitch,
  simulateDivergence,
  getCommitsOnBranch,
  parsePackedRefs,
  GitBranches,
  ex1_a, ex1_b, ex1_c,
  ex3_content,
  ex4_a, ex4_b, ex4_c,
  ex6_output,
  ex10_main, ex10_feature, ex10_hotfix,
  ex12_a, ex12_b, ex12_c,
};
export type { Commit };
