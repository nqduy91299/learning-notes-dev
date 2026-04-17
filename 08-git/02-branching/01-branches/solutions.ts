// ============================================================================
// 01-branches: Solutions
// ============================================================================
// Run:  npx tsx 08-git/02-branching/01-branches/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Complete solutions with explanations
// ============================================================================

// ─── Exercise 1 ────────────────────────────────────────────────────────────
console.log("Exercise 1:");
const ex1_a = 2;       // main and feature
const ex1_b = "main";  // HEAD still on main (git branch doesn't switch)
const ex1_c = true;    // Both point to C2
console.log("Branches:", ex1_a, "| HEAD:", ex1_b, "| Same commit:", ex1_c);

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface Commit {
  sha: string;
  message: string;
  parentSha: string | null;
}

class BranchSystem {
  private commits: Map<string, Commit> = new Map();
  private branches: Map<string, string> = new Map();
  private head: { type: "branch"; name: string } | { type: "detached"; sha: string } =
    { type: "branch", name: "main" };
  private counter = 0;

  commit(message: string): string {
    const sha = (++this.counter).toString(16).padStart(7, "0");
    const parentSha = this.getHeadSha();
    this.commits.set(sha, { sha, message, parentSha });

    if (this.head.type === "branch") {
      this.branches.set(this.head.name, sha);
    }
    return sha;
  }

  createBranch(name: string): void {
    const sha = this.getHeadSha();
    if (sha) this.branches.set(name, sha);
  }

  switchBranch(name: string): boolean {
    if (!this.branches.has(name)) return false;
    this.head = { type: "branch", name };
    return true;
  }

  getCurrentBranch(): string | null {
    return this.head.type === "branch" ? this.head.name : null;
  }

  getHeadSha(): string | null {
    if (this.head.type === "branch") return this.branches.get(this.head.name) ?? null;
    return this.head.sha;
  }

  listBranches(): Array<{ name: string; sha: string; isCurrent: boolean }> {
    return [...this.branches.entries()].map(([name, sha]) => ({
      name, sha, isCurrent: this.head.type === "branch" && this.head.name === name,
    }));
  }

  deleteBranch(name: string): boolean {
    if (this.head.type === "branch" && this.head.name === name) return false;
    return this.branches.delete(name);
  }
}

console.log("\nExercise 2:");
const bs = new BranchSystem();
bs.commit("C1");
bs.commit("C2");
bs.createBranch("feature");
console.log("Branches:", bs.listBranches());
bs.switchBranch("feature");
bs.commit("C3");
console.log("Feature HEAD:", bs.getHeadSha());
console.log("Current branch:", bs.getCurrentBranch());

// ─── Exercise 3 ────────────────────────────────────────────────────────────
const ex3_content = "v1"; // main still has v1; v2 is only on feature
console.log("\nExercise 3:");
console.log("file.txt content on main:", ex3_content);

// ─── Exercise 4 ────────────────────────────────────────────────────────────
const ex4_a = "bbb"; // Raw SHA, not a ref
const ex4_b = "none (detached)";
const ex4_c = "The commit becomes orphaned/unreachable when you switch back. Find it via reflog.";
console.log("\nExercise 4:");
console.log("HEAD:", ex4_a, "| Branch:", ex4_b);
console.log("Consequence:", ex4_c);

// ─── Exercise 5 ────────────────────────────────────────────────────────────
class HeadResolver {
  private branches: Map<string, string>;
  private headRef: string;

  constructor(branches: Map<string, string>, headRef: string) {
    this.branches = branches;
    this.headRef = headRef;
  }

  isAttached(): boolean {
    return this.headRef.startsWith("ref: ");
  }

  getBranch(): string | null {
    if (!this.isAttached()) return null;
    return this.headRef.replace("ref: refs/heads/", "");
  }

  resolve(): string | null {
    if (this.isAttached()) {
      const branch = this.getBranch();
      return branch ? this.branches.get(branch) ?? null : null;
    }
    return this.headRef;
  }

  detach(sha: string): void {
    this.headRef = sha;
  }

  attach(branch: string): void {
    this.headRef = `ref: refs/heads/${branch}`;
  }
}

console.log("\nExercise 5:");
const hr = new HeadResolver(new Map([["main", "abc123"]]), "ref: refs/heads/main");
console.log("Attached:", hr.isAttached(), "| Branch:", hr.getBranch(), "| SHA:", hr.resolve());
hr.detach("def456");
console.log("After detach — Attached:", hr.isAttached(), "| SHA:", hr.resolve());
hr.attach("main");
console.log("After attach — Branch:", hr.getBranch());

// ─── Exercise 6 ────────────────────────────────────────────────────────────
const ex6_output = [
  "  bugfix/login",
  "* feature/auth",
  "  feature/dashboard",
  "  main",
]; // Alphabetically sorted, * marks current
console.log("\nExercise 6:");
ex6_output.forEach(l => console.log(l));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function isValidBranchName(name: string): { valid: boolean; reason?: string } {
  if (name.includes(" ")) return { valid: false, reason: "Contains spaces" };
  if (/[~^:\\?*\[]/.test(name)) return { valid: false, reason: "Contains invalid characters" };
  if (name.startsWith("-")) return { valid: false, reason: "Starts with -" };
  if (name.endsWith(".lock")) return { valid: false, reason: "Ends with .lock" };
  if (name.includes("..")) return { valid: false, reason: "Contains .." };
  if (name.includes("@{")) return { valid: false, reason: "Contains @{" };
  if (name.length === 0) return { valid: false, reason: "Empty name" };
  return { valid: true };
}

console.log("\nExercise 7:");
console.log("feature/auth:", isValidBranchName("feature/auth"));
console.log("my branch:", isValidBranchName("my branch"));
console.log("-bad:", isValidBranchName("-bad"));
console.log("test.lock:", isValidBranchName("test.lock"));
console.log("a..b:", isValidBranchName("a..b"));

// ─── Exercise 8 ────────────────────────────────────────────────────────────
function fixedBranchSwitch(
  branches: Map<string, string>,
  _currentBranch: string,
  targetBranch: string
): string | null {
  // FIX 1: Check if target exists
  if (!branches.has(targetBranch)) return null;
  // FIX 2: Just return the target's SHA (HEAD update is separate)
  // FIX 3: Return new HEAD sha
  return branches.get(targetBranch)!;
}

console.log("\nExercise 8:");
const br = new Map([["main", "aaa"], ["feature", "bbb"]]);
console.log("Switch to feature:", fixedBranchSwitch(br, "main", "feature"));
console.log("Switch to nonexistent:", fixedBranchSwitch(br, "main", "nope"));

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function simulateDivergence() {
  return {
    mainCommits: ["C1", "C2", "C4"],        // C1 → C2 → C4 (on main)
    featureCommits: ["C1", "C2", "C3", "C5"], // C1 → C2 → C3 → C5 (on feature)
    commonAncestor: "C2",
  };
}

console.log("\nExercise 9:");
const div = simulateDivergence();
console.log("Main:", div.mainCommits, "| Feature:", div.featureCommits);
console.log("Common ancestor:", div.commonAncestor);

// ─── Exercise 10 ───────────────────────────────────────────────────────────
const ex10_main = "* main abc1234 [origin/main: ahead 1] Latest commit";
const ex10_feature = "  feature def5678 [origin/feature: behind 2] Feature work";
const ex10_hotfix = "  hotfix ghi9012 Hotfix work";
console.log("\nExercise 10:");
console.log(ex10_main);
console.log(ex10_feature);
console.log(ex10_hotfix);

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function getCommitsOnBranch(
  commits: Map<string, Commit>,
  branchSha: string,
  stopAtSha?: string
): Commit[] {
  const result: Commit[] = [];
  let current: string | null = branchSha;
  while (current && current !== stopAtSha) {
    const commit = commits.get(current);
    if (!commit) break;
    result.push(commit);
    current = commit.parentSha;
  }
  return result;
}

console.log("\nExercise 11:");
const cMap = new Map<string, Commit>([
  ["c4", { sha: "c4", message: "C4", parentSha: "c3" }],
  ["c3", { sha: "c3", message: "C3", parentSha: "c2" }],
  ["c2", { sha: "c2", message: "C2", parentSha: "c1" }],
  ["c1", { sha: "c1", message: "C1", parentSha: null }],
]);
console.log("All:", getCommitsOnBranch(cMap, "c4").map(c => c.message));
console.log("Stop at c2:", getCommitsOnBranch(cMap, "c4", "c2").map(c => c.message));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
const ex12_a = "Error: branch 'feature' is not fully merged. Use -D to force.";
const ex12_b = "Branch deleted. The 3 commits become orphaned.";
const ex12_c = "Yes, via git reflog — commits exist until garbage collection.";
console.log("\nExercise 12:");
console.log("-d:", ex12_a);
console.log("-D:", ex12_b);
console.log("Recovery:", ex12_c);

// ─── Exercise 13 ───────────────────────────────────────────────────────────
function parsePackedRefs(content: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("^")) continue;
    const [sha, ref] = trimmed.split(" ");
    if (sha && ref) result.set(ref, sha);
  }
  return result;
}

console.log("\nExercise 13:");
const packed = parsePackedRefs(`# pack-refs with: peeled fully-peeled
abc123 refs/heads/main
def456 refs/heads/feature
ghi789 refs/tags/v1.0.0`);
console.log("Packed refs:", [...packed.entries()]);

// ─── Exercise 14 ───────────────────────────────────────────────────────────
class GitBranches {
  private commits: Map<string, Commit> = new Map();
  private branches: Map<string, string> = new Map();
  private head = "ref: refs/heads/main";
  private _reflog: Array<{ sha: string; action: string }> = [];
  private counter = 0;

  init(): void {
    const sha = this.makeCommit("Initial commit");
    this._reflog.push({ sha, action: "init" });
  }

  makeCommit(msg: string): string {
    const sha = (++this.counter).toString(16).padStart(7, "0");
    const parentSha = this.getCurrentSha();
    this.commits.set(sha, { sha, message: msg, parentSha });
    const branch = this.getCurrentBranch();
    if (branch) this.branches.set(branch, sha);
    this._reflog.push({ sha, action: `commit: ${msg}` });
    return sha;
  }

  private getCurrentBranch(): string | null {
    const match = this.head.match(/^ref: refs\/heads\/(.+)$/);
    return match ? match[1]! : null;
  }

  private getCurrentSha(): string | null {
    const branch = this.getCurrentBranch();
    return branch ? this.branches.get(branch) ?? null : this.head;
  }

  createBranch(name: string): void {
    const sha = this.getCurrentSha();
    if (sha) this.branches.set(name, sha);
  }

  switchTo(name: string): void {
    if (this.branches.has(name)) {
      this.head = `ref: refs/heads/${name}`;
      this._reflog.push({ sha: this.branches.get(name)!, action: `checkout: to ${name}` });
    }
  }

  deleteBranch(name: string): boolean {
    if (this.getCurrentBranch() === name) return false;
    return this.branches.delete(name);
  }

  getBranches(): string[] { return [...this.branches.keys()]; }
  isDetached(): boolean { return !this.head.startsWith("ref:"); }
}

console.log("\nExercise 14:");
const gb = new GitBranches();
gb.init();
gb.makeCommit("Add feature");
gb.createBranch("feature");
gb.switchTo("feature");
gb.makeCommit("Feature work");
console.log("Branches:", gb.getBranches());
console.log("Detached:", gb.isDetached());
gb.switchTo("main");
console.log("Delete feature:", gb.deleteBranch("feature"));
console.log("Branches after delete:", gb.getBranches());

console.log("\n============================================");
console.log("All 14 exercises completed successfully! ✓");
console.log("============================================");
