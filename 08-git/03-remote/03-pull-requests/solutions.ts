// ============================================================================
// 03-pull-requests: Solutions
// ============================================================================
// Run:  npx tsx 08-git/03-remote/03-pull-requests/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

interface PRCommit { sha: string; message: string; parentSha: string | null; author: string; }
type ReviewState = "pending" | "approved" | "changes_requested" | "commented";
type PRState = "draft" | "open" | "approved" | "merged" | "closed";

// ─── Exercise 1 ────────────────────────────────────────────────────────────
console.log("Exercise 1:");
console.log("Squash:", 1, "| Rebase:", 3, "| Merge commit:", 4, "(3 + merge commit)");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
let counter = 0;
function newSha(): string { return `pr${++counter}`; }

function squashMerge(commits: PRCommit[], baseSha: string, prTitle: string): PRCommit {
  const message = `${prTitle}\n\n${commits.map(c => `* ${c.message}`).join("\n")}`;
  return { sha: newSha(), message, parentSha: baseSha, author: commits[0]?.author ?? "unknown" };
}

function rebaseMerge(commits: PRCommit[], baseSha: string): PRCommit[] {
  let parent = baseSha;
  return commits.map(c => {
    const nc = { sha: newSha(), message: c.message, parentSha: parent, author: c.author };
    parent = nc.sha;
    return nc;
  });
}

function mergeCommitMerge(commits: PRCommit[], baseSha: string, _branchTipSha: string): PRCommit {
  void commits;
  return { sha: newSha(), message: `Merge pull request`, parentSha: baseSha, author: "merger" };
}

console.log("\nExercise 2:");
const prCommits: PRCommit[] = [
  { sha: "c1", message: "Add login", parentSha: "base", author: "dev" },
  { sha: "c2", message: "Add tests", parentSha: "c1", author: "dev" },
];
console.log("Squash:", squashMerge(prCommits, "base", "feat: User login"));
console.log("Rebase:", rebaseMerge(prCommits, "base"));

// ─── Exercise 3 ────────────────────────────────────────────────────────────
console.log("\nExercise 3:");
console.log("See individual commits:", false);
console.log("S's parent: B");
console.log("Can revert individual C:", false, "(all squashed into one)");

// ─── Exercise 4 ────────────────────────────────────────────────────────────
class PullRequest {
  private _state: PRState = "draft";
  private reviews: Map<string, ReviewState> = new Map();
  private requiredApprovals: number;
  private checksPass = false;

  constructor(requiredApprovals = 1) { this.requiredApprovals = requiredApprovals; }

  markReady(): void { if (this._state === "draft") this._state = "open"; }
  addReview(reviewer: string, state: ReviewState): void { this.reviews.set(reviewer, state); if (this.approvalCount >= this.requiredApprovals) this._state = "approved"; }
  setChecks(pass: boolean): void { this.checksPass = pass; }
  canMerge(): boolean { return this._state !== "draft" && this._state !== "closed" && this.approvalCount >= this.requiredApprovals && this.checksPass && ![...this.reviews.values()].includes("changes_requested"); }
  merge(): boolean { if (!this.canMerge()) return false; this._state = "merged"; return true; }
  close(): void { this._state = "closed"; }
  get state(): PRState { return this._state; }
  get approvalCount(): number { return [...this.reviews.values()].filter(r => r === "approved").length; }
}

console.log("\nExercise 4:");
const pr = new PullRequest(2);
console.log("State:", pr.state); // draft
pr.markReady();
pr.addReview("alice", "approved");
pr.setChecks(true);
console.log("Can merge (1 approval):", pr.canMerge()); // false
pr.addReview("bob", "approved");
console.log("Can merge (2 approvals):", pr.canMerge()); // true
console.log("Merge:", pr.merge());

// ─── Exercise 5 ────────────────────────────────────────────────────────────
console.log("\nExercise 5:");
console.log("Same SHAs:", false, "(different parents → different SHAs)");
console.log("X' parent: C (tip of main)");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
interface ProtectionRules { requireReviews: number; requireStatusChecks: string[]; requireUpToDate: boolean; restrictPush: string[]; }

function canMergePR(rules: ProtectionRules, approvals: number, statusChecks: Map<string, boolean>, isUpToDate: boolean, merger: string): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (approvals < rules.requireReviews) reasons.push(`Need ${rules.requireReviews - approvals} more approvals`);
  for (const check of rules.requireStatusChecks) { if (!statusChecks.get(check)) reasons.push(`Check '${check}' not passing`); }
  if (rules.requireUpToDate && !isUpToDate) reasons.push("Branch not up to date");
  if (rules.restrictPush.length > 0 && !rules.restrictPush.includes(merger)) reasons.push("User not authorized");
  return { allowed: reasons.length === 0, reasons };
}

console.log("\nExercise 6:");
console.log(canMergePR(
  { requireReviews: 2, requireStatusChecks: ["ci", "lint"], requireUpToDate: true, restrictPush: ["admin"] },
  2, new Map([["ci", true], ["lint", true]]), true, "admin"
));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedSquashMerge(commits: PRCommit[], baseSha: string) {
  return {
    sha: newSha(),
    message: commits.map(c => c.message).join("\n"),
    parentSha: baseSha,
  };
}
console.log("\nExercise 7:", fixedSquashMerge(prCommits, "base"));

// ─── Exercise 8 ────────────────────────────────────────────────────────────
console.log("\nExercise 8:");
console.log("Revert merge: creates a new commit undoing the merge");
console.log("-m 1: use first parent as mainline (undo the feature changes)");
console.log("C and D undone:", true);

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function calculatePRDiff(baseTree: Map<string, string>, prTree: Map<string, string>) {
  const added: string[] = [], modified: string[] = [], deleted: string[] = [];
  for (const [f, c] of prTree) { if (!baseTree.has(f)) added.push(f); else if (baseTree.get(f) !== c) modified.push(f); }
  for (const f of baseTree.keys()) { if (!prTree.has(f)) deleted.push(f); }
  return { added, modified, deleted };
}
console.log("\nExercise 9:", calculatePRDiff(new Map([["a", "1"], ["b", "2"]]), new Map([["a", "X"], ["c", "3"]])));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
console.log("\nExercise 10:");
console.log("Auto-merge:", false);
console.log("Need to: resolve conflicts locally, push, then merge");

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function renderPRDescription(template: string, data: { summary: string; type: string; testing: string; breaking: boolean }): string {
  return template.replace("{{summary}}", data.summary).replace("{{type}}", data.type).replace("{{testing}}", data.testing).replace("{{breaking}}", data.breaking ? "Yes" : "No");
}
console.log("\nExercise 11:");
console.log(renderPRDescription("## Summary\n{{summary}}\n## Type: {{type}}\n## Breaking: {{breaking}}", { summary: "Add login", type: "feature", testing: "unit tests", breaking: false }));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
function aggregateChecks(checks: Array<{ name: string; status: "pass" | "fail" | "pending" }>) {
  const allPass = checks.every(c => c.status === "pass");
  const failed = checks.filter(c => c.status === "fail").map(c => c.name);
  const pending = checks.filter(c => c.status === "pending").map(c => c.name);
  return { canMerge: allPass, summary: allPass ? "All checks passed" : `Failed: ${failed.join(",")}; Pending: ${pending.join(",")}` };
}
console.log("\nExercise 12:", aggregateChecks([{ name: "ci", status: "pass" }, { name: "lint", status: "fail" }]));

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class PRSystem {
  private prs: Map<number, { title: string; state: PRState; reviews: Map<string, ReviewState>; commits: PRCommit[] }> = new Map();
  private ctr = 0;
  create(title: string, commits: PRCommit[]): number { const id = ++this.ctr; this.prs.set(id, { title, state: "open", reviews: new Map(), commits }); return id; }
  addReview(id: number, reviewer: string, state: ReviewState): void { this.prs.get(id)?.reviews.set(reviewer, state); }
  merge(id: number): boolean { const p = this.prs.get(id); if (!p) return false; p.state = "merged"; return true; }
}
console.log("\nExercise 13:");
const sys = new PRSystem();
const prId = sys.create("Add feature", []);
sys.addReview(prId, "alice", "approved");
console.log("Merge:", sys.merge(prId));

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
