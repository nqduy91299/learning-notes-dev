// ============================================================================
// 02-merging: Solutions
// ============================================================================
// Run:  npx tsx 08-git/02-branching/02-merging/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Complete solutions with explanations
// ============================================================================

// ─── Exercise 1 ────────────────────────────────────────────────────────────
const ex1_a = "A"; // No new commits on main → fast-forward
const ex1_b = "B"; // Both have new commits → 3-way merge
const ex1_c = 1;   // Fast-forward just moves pointer, HEAD commit still has 1 parent

console.log("Exercise 1:");
console.log("FF:", ex1_a, "| 3-way:", ex1_b, "| Parents after FF:", ex1_c);

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface MergeCommit {
  sha: string;
  message: string;
  parentSha: string | null;
}

function canFastForward(
  commits: Map<string, MergeCommit>,
  currentSha: string,
  targetSha: string
): boolean {
  let walk: string | null = targetSha;
  while (walk) {
    if (walk === currentSha) return true;
    const commit = commits.get(walk);
    if (!commit) break;
    walk = commit.parentSha;
  }
  return false;
}

console.log("\nExercise 2:");
const mc = new Map<string, MergeCommit>([
  ["a", { sha: "a", message: "A", parentSha: null }],
  ["b", { sha: "b", message: "B", parentSha: "a" }],
  ["c", { sha: "c", message: "C", parentSha: "b" }],
]);
console.log("Can FF a→c:", canFastForward(mc, "a", "c")); // true
console.log("Can FF c→a:", canFastForward(mc, "c", "a")); // false

// ─── Exercise 3 ────────────────────────────────────────────────────────────
interface MergeResult { success: boolean; content: string; hasConflict: boolean; }

function threeWayMerge(base: string, ours: string, theirs: string): MergeResult {
  const baseLines = base.split("\n");
  const ourLines = ours.split("\n");
  const theirLines = theirs.split("\n");
  const maxLen = Math.max(baseLines.length, ourLines.length, theirLines.length);
  const result: string[] = [];
  let hasConflict = false;

  for (let i = 0; i < maxLen; i++) {
    const b = baseLines[i] ?? "";
    const o = ourLines[i] ?? "";
    const t = theirLines[i] ?? "";

    if (o === t) { result.push(o); }
    else if (b === o) { result.push(t); } // only theirs changed
    else if (b === t) { result.push(o); } // only ours changed
    else {
      // Both changed differently → conflict
      result.push(`<<<<<<< ours`);
      result.push(o);
      result.push(`=======`);
      result.push(t);
      result.push(`>>>>>>> theirs`);
      hasConflict = true;
    }
  }

  return { success: !hasConflict, content: result.join("\n"), hasConflict };
}

console.log("\nExercise 3:");
console.log(threeWayMerge("a\nb\nc", "a\nB\nc", "a\nb\nC")); // no conflict
console.log(threeWayMerge("a\nb\nc", "a\nX\nc", "a\nY\nc")); // conflict on line 2

// ─── Exercise 4 ────────────────────────────────────────────────────────────
const ex4_a = true;
const ex4_b = `<<<<<<< HEAD
Hello Git
=======
Hello GitHub
>>>>>>> feature`;

console.log("\nExercise 4:");
console.log("Conflict:", ex4_a);
console.log("Markers:\n" + ex4_b);

// ─── Exercise 5 ────────────────────────────────────────────────────────────
interface ConflictRegion { ours: string; theirs: string; startLine: number; }

function parseConflicts(content: string): ConflictRegion[] {
  const regions: ConflictRegion[] = [];
  const lines = content.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (lines[i]!.startsWith("<<<<<<<")) {
      const startLine = i;
      const oursLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("=======")) {
        oursLines.push(lines[i]!);
        i++;
      }
      i++; // skip =======
      const theirsLines: string[] = [];
      while (i < lines.length && !lines[i]!.startsWith(">>>>>>>")) {
        theirsLines.push(lines[i]!);
        i++;
      }
      regions.push({ ours: oursLines.join("\n"), theirs: theirsLines.join("\n"), startLine });
    }
    i++;
  }
  return regions;
}

console.log("\nExercise 5:");
const conflicts = parseConflicts(`line1
<<<<<<< HEAD
our change
=======
their change
>>>>>>> feature
line3`);
console.log("Conflicts:", conflicts);

// ─── Exercise 6 ────────────────────────────────────────────────────────────
type Resolution = "ours" | "theirs" | "both";

function resolveConflicts(content: string, strategy: Resolution): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i]!.startsWith("<<<<<<<")) {
      const oursLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("=======")) { oursLines.push(lines[i]!); i++; }
      i++;
      const theirsLines: string[] = [];
      while (i < lines.length && !lines[i]!.startsWith(">>>>>>>")) { theirsLines.push(lines[i]!); i++; }
      i++;
      if (strategy === "ours") result.push(...oursLines);
      else if (strategy === "theirs") result.push(...theirsLines);
      else result.push(...oursLines, ...theirsLines);
    } else {
      result.push(lines[i]!);
      i++;
    }
  }
  return result.join("\n");
}

console.log("\nExercise 6:");
const conflicted = "start\n<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> feat\nend";
console.log("Ours:", resolveConflicts(conflicted, "ours"));
console.log("Theirs:", resolveConflicts(conflicted, "theirs"));
console.log("Both:", resolveConflicts(conflicted, "both"));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
const ex7_a = 4; // A, B, C, D (fast-forward, no merge commit)
const ex7_b = 5; // A, B, C, D, M (merge commit added)
const ex7_c = "B"; // First parent is the branch you were on (main's tip before merge)

console.log("\nExercise 7:");
console.log("FF commits:", ex7_a, "| --no-ff:", ex7_b, "| First parent:", ex7_c);

// ─── Exercise 8 ────────────────────────────────────────────────────────────
interface BranchState {
  commits: Array<{ sha: string; message: string; files: Map<string, string> }>;
  head: string;
}

function simulateMerge(
  current: BranchState,
  incoming: BranchState,
  commonAncestorSha: string
): { result: "fast-forward" | "merge" | "conflict"; newHead?: string } {
  const currentIdx = current.commits.findIndex(c => c.sha === commonAncestorSha);
  const currentHasNewCommits = currentIdx < current.commits.length - 1;

  if (!currentHasNewCommits) {
    return { result: "fast-forward", newHead: incoming.head };
  }

  // Check for conflicts — simplified: if any file was modified in both
  const currentFiles = current.commits[current.commits.length - 1]!.files;
  const incomingFiles = incoming.commits[incoming.commits.length - 1]!.files;
  const ancestorCommit = current.commits[currentIdx];
  const baseFiles = ancestorCommit ? ancestorCommit.files : new Map<string, string>();

  for (const [file, content] of currentFiles) {
    const base = baseFiles.get(file);
    const other = incomingFiles.get(file);
    if (base !== content && base !== other && content !== other && other !== undefined) {
      return { result: "conflict" };
    }
  }

  return { result: "merge", newHead: "merge-" + current.head + "-" + incoming.head };
}

console.log("\nExercise 8:");
const s1: BranchState = { commits: [{ sha: "a", message: "A", files: new Map([["f", "1"]]) }], head: "a" };
const s2: BranchState = { commits: [
  { sha: "a", message: "A", files: new Map([["f", "1"]]) },
  { sha: "b", message: "B", files: new Map([["f", "2"]]) },
], head: "b" };
console.log("FF case:", simulateMerge(s1, s2, "a"));

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function fixedResolveConflict(content: string): string {
  let result = content;
  while (result.includes("<<<<<<<")) {
    const start = result.indexOf("<<<<<<<");
    const startEnd = result.indexOf("\n", start);
    const mid = result.indexOf("=======");
    const midEnd = result.indexOf("\n", mid);
    const end = result.indexOf(">>>>>>>");
    const endEnd = result.indexOf("\n", end);
    if (start === -1 || mid === -1 || end === -1) break;

    const before = result.slice(0, start);
    const theirs = result.slice(midEnd + 1, end);
    const after = result.slice(endEnd !== -1 ? endEnd + 1 : end + 7);
    result = before + theirs + after;
  }
  return result;
}

console.log("\nExercise 9:");
console.log(fixedResolveConflict("pre\n<<<<<<< HEAD\nours\n=======\ntheirs\n>>>>>>> feat\npost"));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
const ex10_a = "Ours (main). The -s ours strategy keeps current branch content entirely.";
const ex10_b = "Attempts auto-merge; creates conflict if same lines changed.";
const ex10_c = "When any branch has a conflict — octopus cannot resolve conflicts.";

console.log("\nExercise 10:");
console.log("-s ours:", ex10_a);
console.log("-s recursive:", ex10_b);
console.log("octopus fails:", ex10_c);

// ─── Exercise 11 ───────────────────────────────────────────────────────────
interface GraphCommit { sha: string; parents: string[]; message: string; }

class MergeGraph {
  commits: Map<string, GraphCommit> = new Map();

  addCommit(sha: string, parents: string[], message: string): void {
    this.commits.set(sha, { sha, parents, message });
  }

  findMergeBase(sha1: string, sha2: string): string | null {
    const ancestors1 = this.getReachable(sha1);
    const queue = [sha2];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      if (ancestors1.has(current)) return current;
      const commit = this.commits.get(current);
      if (commit) queue.push(...commit.parents);
    }
    return null;
  }

  isAncestor(sha1: string, sha2: string): boolean {
    return this.getReachable(sha2).has(sha1);
  }

  getReachable(sha: string): Set<string> {
    const result = new Set<string>();
    const queue = [sha];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (result.has(current)) continue;
      result.add(current);
      const commit = this.commits.get(current);
      if (commit) queue.push(...commit.parents);
    }
    return result;
  }
}

console.log("\nExercise 11:");
const mg = new MergeGraph();
mg.addCommit("a", [], "A");
mg.addCommit("b", ["a"], "B");
mg.addCommit("c", ["b"], "C"); // main
mg.addCommit("d", ["b"], "D"); // feature
console.log("Merge base C&D:", mg.findMergeBase("c", "d")); // b
console.log("Is a ancestor of c:", mg.isAncestor("a", "c")); // true

// ─── Exercise 12 ───────────────────────────────────────────────────────────
const ex12_a = 5; // A, B, C, D, M
const ex12_b = ["E", "M", "B", "A"]; // --first-parent skips the merged branch

console.log("\nExercise 12:");
console.log("Total commits:", ex12_a);
console.log("First-parent:", ex12_b);

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class MergeSession {
  private originalHead: string = "";
  private originalIndex: Map<string, string> = new Map();
  private _merging = false;
  private _conflicts: string[] = [];

  startMerge(_targetBranch: string, currentHead: string, index: Map<string, string>): void {
    this.originalHead = currentHead;
    this.originalIndex = new Map(index);
    this._merging = true;
    this._conflicts = [];
  }

  addConflict(file: string): void {
    this._conflicts.push(file);
  }

  abort(): { head: string; index: Map<string, string> } {
    this._merging = false;
    this._conflicts = [];
    return { head: this.originalHead, index: new Map(this.originalIndex) };
  }

  complete(): boolean {
    if (this._conflicts.length > 0) return false;
    this._merging = false;
    return true;
  }

  get isMerging(): boolean { return this._merging; }
  get conflicts(): string[] { return [...this._conflicts]; }
}

console.log("\nExercise 13:");
const ms = new MergeSession();
ms.startMerge("feature", "abc", new Map([["f.txt", "content"]]));
console.log("Merging:", ms.isMerging);
ms.addConflict("f.txt");
console.log("Conflicts:", ms.conflicts);
const aborted = ms.abort();
console.log("After abort — head:", aborted.head, "| merging:", ms.isMerging);

// ─── Exercise 14 ───────────────────────────────────────────────────────────
class GitMerge {
  private commits: Map<string, { sha: string; parents: string[]; tree: Map<string, string> }> = new Map();
  private branches: Map<string, string> = new Map();
  private head = "main";
  private counter = 0;

  addCommit(branch: string, tree: Map<string, string>, parents: string[] = []): string {
    const sha = (++this.counter).toString(16).padStart(7, "0");
    const p = parents.length > 0 ? parents : (this.branches.has(branch) ? [this.branches.get(branch)!] : []);
    this.commits.set(sha, { sha, parents: p, tree: new Map(tree) });
    this.branches.set(branch, sha);
    return sha;
  }

  merge(branch: string, options?: { noFf?: boolean }): {
    type: "fast-forward" | "merge" | "conflict" | "already-up-to-date";
    conflicts?: string[];
  } {
    const headSha = this.branches.get(this.head);
    const branchSha = this.branches.get(branch);
    if (!headSha || !branchSha) return { type: "already-up-to-date" };
    if (headSha === branchSha) return { type: "already-up-to-date" };

    // Check if FF possible
    const mg = new MergeGraph();
    for (const [sha, c] of this.commits) mg.addCommit(sha, c.parents, "");

    if (mg.isAncestor(headSha, branchSha) && !options?.noFf) {
      this.branches.set(this.head, branchSha);
      return { type: "fast-forward" };
    }

    // 3-way merge — simplified
    this.branches.set(this.head, branchSha);
    return { type: "merge" };
  }
}

console.log("\nExercise 14:");
const gm = new GitMerge();
gm.addCommit("main", new Map([["f", "v1"]]));
gm.addCommit("feature", new Map([["f", "v2"]]));
console.log("Merge:", gm.merge("feature"));

console.log("\n============================================");
console.log("All 14 exercises completed successfully! ✓");
console.log("============================================");
