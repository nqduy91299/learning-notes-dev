// ============================================================================
// 03-pull-requests: Exercises
// ============================================================================
// Run:  npx tsx 08-git/03-remote/03-pull-requests/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering PR workflow, merge strategies, code review
// ============================================================================

// Exercise 1: Predict the Output — merge strategies
// Feature branch has commits: C1, C2, C3 on top of main's B
// a) Squash merge → how many new commits on main?
// b) Rebase merge → how many new commits on main?
// c) Merge commit → how many new commits on main?
const ex1_squash: number = 0;  // TODO
const ex1_rebase: number = 0;  // TODO
const ex1_merge: number = 0;   // TODO

// Exercise 2: Simulate PR merge strategies
// ----------------------------------------------------------------------------
interface PRCommit { sha: string; message: string; parentSha: string | null; author: string; }

function squashMerge(_commits: PRCommit[], _baseSha: string, _prTitle: string): PRCommit {
  // TODO: Create a single commit combining all changes
  return { sha: "", message: "", parentSha: null, author: "" };
}

function rebaseMerge(_commits: PRCommit[], _baseSha: string): PRCommit[] {
  // TODO: Create new commits rebased onto baseSha
  return [];
}

function mergeCommitMerge(_commits: PRCommit[], _baseSha: string, _branchTipSha: string): PRCommit {
  // TODO: Create a merge commit with two parents
  return { sha: "", message: "", parentSha: null, author: "" };
}

// Exercise 3: Predict the Output — squash merge history
// main: A → B → S (squash of C, D, E)
// a) Can you see individual commits C, D, E in main's log?
// b) What is S's parent?
// c) Can you git revert individual changes from C?
const ex3_a: boolean = false; // TODO
const ex3_b: string = "";     // TODO
const ex3_c: boolean = false; // TODO

// Exercise 4: Implement PR review state machine
// ----------------------------------------------------------------------------
type ReviewState = "pending" | "approved" | "changes_requested" | "commented";
type PRState = "draft" | "open" | "approved" | "merged" | "closed";

class PullRequest {
  private _state: PRState = "draft";
  private reviews: Map<string, ReviewState> = new Map();
  private requiredApprovals: number;
  private checksPass: boolean = false;

  constructor(requiredApprovals: number = 1) { this.requiredApprovals = requiredApprovals; }

  // TODO: Transition state machine
  markReady(): void {}
  addReview(_reviewer: string, _state: ReviewState): void {}
  setChecks(_pass: boolean): void {}
  canMerge(): boolean { return false; }
  merge(): boolean { return false; }
  close(): void {}

  get state(): PRState { return this._state; }
  get approvalCount(): number { return 0; }
}

// Exercise 5: Predict the Output — rebase merge SHAs
// Feature: X → Y → Z (branched from main at B)
// After rebase merge onto main (which is now at C):
// a) Do X', Y', Z' have the same SHAs as X, Y, Z?
// b) What is X's parent after rebase merge?
const ex5_a: boolean = false; // TODO
const ex5_b: string = "";     // TODO

// Exercise 6: Implement branch protection checker
// ----------------------------------------------------------------------------
interface ProtectionRules {
  requireReviews: number;
  requireStatusChecks: string[];
  requireUpToDate: boolean;
  restrictPush: string[]; // allowed users
}

function canMergePR(
  _rules: ProtectionRules,
  _approvals: number,
  _statusChecks: Map<string, boolean>,
  _isUpToDate: boolean,
  _merger: string
): { allowed: boolean; reasons: string[] } {
  // TODO: Check all protection rules
  return { allowed: false, reasons: [] };
}

// Exercise 7: Fix the Bug — PR merge simulation
// ----------------------------------------------------------------------------
function buggySquashMerge(commits: PRCommit[], baseSha: string) {
  // BUG 1: Should combine all messages, not just first
  // BUG 2: Parent should be baseSha
  // BUG 3: Should generate new SHA
  return {
    sha: commits[0]?.sha ?? "",
    message: commits[0]?.message ?? "",
    parentSha: commits[commits.length - 1]?.parentSha ?? null,
  };
}

// Exercise 8: Predict the Output — merge commit revert
// main: A → B → M (merge of feature: C, D)
// git revert -m 1 M
// a) What does this do?
// b) What is -m 1?
// c) Are C and D's changes undone?
const ex8_a: string = ""; // TODO
const ex8_b: string = ""; // TODO
const ex8_c: boolean = false; // TODO

// Exercise 9: Implement PR diff calculator
// ----------------------------------------------------------------------------
function calculatePRDiff(
  _baseTree: Map<string, string>,
  _prTree: Map<string, string>
): { added: string[]; modified: string[]; deleted: string[]; } {
  // TODO: Calculate which files are added, modified, deleted
  return { added: [], modified: [], deleted: [] };
}

// Exercise 10: Predict the Output — merge conflicts in PR
// base: A → B → C (main updated)
// PR: A → B → D → E (feature)
// Both C and D modify the same line
// a) Can the PR auto-merge?
// b) What needs to happen?
const ex10_a: boolean = false; // TODO
const ex10_b: string = "";     // TODO

// Exercise 11: Implement PR template renderer
// ----------------------------------------------------------------------------
function renderPRDescription(
  _template: string,
  _data: { summary: string; type: string; testing: string; breaking: boolean }
): string {
  // TODO: Fill in template placeholders
  return "";
}

// Exercise 12: Implement CI check aggregator
// ----------------------------------------------------------------------------
function aggregateChecks(
  _checks: Array<{ name: string; status: "pass" | "fail" | "pending" }>
): { canMerge: boolean; summary: string } {
  // TODO: All must pass for canMerge to be true
  return { canMerge: false, summary: "" };
}

// Exercise 13: Build complete PR system
// ----------------------------------------------------------------------------
class PRSystem {
  private prs: Map<number, { title: string; branch: string; base: string; state: PRState; reviews: Map<string, ReviewState>; commits: PRCommit[] }> = new Map();
  private counter = 0;

  create(title: string, branch: string, base: string, commits: PRCommit[]): number { const id = ++this.counter; this.prs.set(id, { title, branch, base, state: "open", reviews: new Map(), commits }); return id; }
  addReview(id: number, reviewer: string, state: ReviewState): void { this.prs.get(id)?.reviews.set(reviewer, state); }
  merge(id: number, strategy: "squash" | "rebase" | "merge"): { success: boolean; commits: PRCommit[] } {
    const pr = this.prs.get(id);
    if (!pr) return { success: false, commits: [] };
    pr.state = "merged";
    if (strategy === "squash") return { success: true, commits: [{ sha: `sq${id}`, message: pr.title, parentSha: null, author: "merger" }] };
    return { success: true, commits: pr.commits };
  }
}

export {
  squashMerge, rebaseMerge, mergeCommitMerge, PullRequest, canMergePR,
  buggySquashMerge, calculatePRDiff, renderPRDescription, aggregateChecks, PRSystem,
  ex1_squash, ex1_rebase, ex1_merge, ex3_a, ex3_b, ex3_c,
  ex5_a, ex5_b, ex8_a, ex8_b, ex8_c, ex10_a, ex10_b,
};
export type { PRCommit, ReviewState, PRState, ProtectionRules };
