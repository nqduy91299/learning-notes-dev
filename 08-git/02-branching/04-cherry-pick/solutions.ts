// ============================================================================
// 04-cherry-pick: Solutions
// ============================================================================
// Run:  npx tsx 08-git/02-branching/04-cherry-pick/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

// ─── Exercise 1 ────────────────────────────────────────────────────────────
const ex1_a = "C"; // E' parent is current HEAD (C)
const ex1_b = false; // Different SHA (different parent)
const ex1_c = false; // Feature is unchanged
console.log("Exercise 1:", { parent: ex1_a, sameSha: ex1_b, featureChanged: ex1_c });

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface CPCommit {
  sha: string; message: string; parentSha: string | null;
  diff: Map<string, { from: string | null; to: string | null }>;
}

class CherryPickSim {
  private commits: Map<string, CPCommit> = new Map();
  private branches: Map<string, string> = new Map();
  private head = "main";
  private counter = 0;

  addCommit(sha: string, msg: string, parent: string | null, diff: Map<string, { from: string | null; to: string | null }>): void {
    this.commits.set(sha, { sha, message: msg, parentSha: parent, diff });
  }
  setBranch(name: string, sha: string): void { this.branches.set(name, sha); }
  setHead(branch: string): void { this.head = branch; }

  cherryPick(sha: string): { newSha: string; conflicts: string[] } | null {
    const commit = this.commits.get(sha);
    if (!commit) return null;
    const newSha = `cp${++this.counter}`;
    const headSha = this.branches.get(this.head)!;
    this.commits.set(newSha, {
      sha: newSha, message: commit.message, parentSha: headSha, diff: new Map(commit.diff),
    });
    this.branches.set(this.head, newSha);
    return { newSha, conflicts: [] };
  }

  cherryPickWithRef(sha: string): { newSha: string; message: string } | null {
    const commit = this.commits.get(sha);
    if (!commit) return null;
    const result = this.cherryPick(sha);
    if (!result) return null;
    const msg = `${commit.message}\n\n(cherry picked from commit ${sha})`;
    return { newSha: result.newSha, message: msg };
  }

  getCommit(sha: string): CPCommit | undefined { return this.commits.get(sha); }
}

console.log("\nExercise 2:");
const cps = new CherryPickSim();
cps.addCommit("a", "A", null, new Map());
cps.addCommit("b", "B", "a", new Map());
cps.addCommit("c", "C", "b", new Map());
cps.addCommit("d", "D", "b", new Map([["f.ts", { from: null, to: "code" }]]));
cps.setBranch("main", "c");
cps.setBranch("feature", "d");
const cpResult = cps.cherryPick("d");
console.log("Cherry-pick result:", cpResult);
console.log("With -x:", cps.cherryPickWithRef("d"));

// ─── Exercise 3 ────────────────────────────────────────────────────────────
const ex3_a = ["D", "E"]; // C..E means after C, up to E
const ex3_b = "oldest first"; // D then E
const ex3_c = 2;
console.log("\nExercise 3:", { commits: ex3_a, order: ex3_b, count: ex3_c });

// ─── Exercise 4 ────────────────────────────────────────────────────────────
function cherryPickRange(
  commits: Map<string, CPCommit>, startExclusive: string, endInclusive: string
): string[] {
  const chain: string[] = [];
  let current: string | null = endInclusive;
  while (current && current !== startExclusive) {
    chain.unshift(current);
    current = commits.get(current)?.parentSha ?? null;
  }
  return chain;
}

console.log("\nExercise 4:");
const cpMap = new Map<string, CPCommit>([
  ["a", { sha: "a", message: "A", parentSha: null, diff: new Map() }],
  ["b", { sha: "b", message: "B", parentSha: "a", diff: new Map() }],
  ["c", { sha: "c", message: "C", parentSha: "b", diff: new Map() }],
  ["d", { sha: "d", message: "D", parentSha: "c", diff: new Map() }],
  ["e", { sha: "e", message: "E", parentSha: "d", diff: new Map() }],
]);
console.log("Range c..e:", cherryPickRange(cpMap, "c", "e")); // ["d", "e"]

// ─── Exercise 5 ────────────────────────────────────────────────────────────
const ex5_a = true;
const ex5_b = "C's diff changes 'world' to 'github', but on main that line is already 'git' not 'world'. Context mismatch → conflict.";
console.log("\nExercise 5:", { conflict: ex5_a, reason: ex5_b });

// ─── Exercise 6 ────────────────────────────────────────────────────────────
interface GraphNode {
  sha: string; message: string; parents: string[]; tree: Map<string, string>;
}

function simulateCherryPick(
  graph: Map<string, GraphNode>, targetBranch: string, commitToCherry: string
): { newTree: Map<string, string>; conflicts: string[] } {
  const commit = graph.get(commitToCherry);
  const target = graph.get(targetBranch);
  if (!commit || !target) return { newTree: new Map(), conflicts: [] };

  const parent = commit.parents[0] ? graph.get(commit.parents[0]) : null;
  const parentTree = parent?.tree ?? new Map<string, string>();
  const newTree = new Map(target.tree);
  const conflicts: string[] = [];

  // Compute diff: what changed between parent and commit
  for (const [file, content] of commit.tree) {
    const parentContent = parentTree.get(file);
    if (parentContent !== content) {
      // This file was changed in the commit
      const currentContent = newTree.get(file);
      if (currentContent !== undefined && currentContent !== parentContent) {
        conflicts.push(file); // Also changed on target
      } else {
        newTree.set(file, content);
      }
    }
  }
  // Handle deletions
  for (const file of parentTree.keys()) {
    if (!commit.tree.has(file)) {
      const currentContent = newTree.get(file);
      if (currentContent !== parentTree.get(file)) conflicts.push(file);
      else newTree.delete(file);
    }
  }

  return { newTree, conflicts };
}

console.log("\nExercise 6:");
const g = new Map<string, GraphNode>([
  ["a", { sha: "a", message: "A", parents: [], tree: new Map([["f", "1"]]) }],
  ["b", { sha: "b", message: "B", parents: ["a"], tree: new Map([["f", "2"]]) }],
  ["c", { sha: "c", message: "C", parents: ["a"], tree: new Map([["f", "1"], ["g", "1"]]) }],
]);
console.log("Cherry-pick b onto c:", simulateCherryPick(g, "c", "b"));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedCherryPick(
  currentTree: Map<string, string>,
  commitDiff: Map<string, { from: string | null; to: string | null }>
): { newTree: Map<string, string>; conflicts: string[] } {
  const newTree = new Map(currentTree);
  const conflicts: string[] = [];
  for (const [file, change] of commitDiff) {
    if (change.to === null) {
      newTree.delete(file); // FIX 1: handle deletions
    } else if (change.from === null) {
      newTree.set(file, change.to); // FIX 2: handle new files
    } else {
      const current = currentTree.get(file);
      if (current !== undefined && current !== change.from) {
        conflicts.push(file); // FIX 3: detect conflicts
      } else {
        newTree.set(file, change.to);
      }
    }
  }
  return { newTree, conflicts };
}

console.log("\nExercise 7:");
console.log(fixedCherryPick(
  new Map([["a", "1"], ["b", "2"]]),
  new Map([["a", { from: "1", to: "X" }], ["c", { from: null, to: "new" }]])
));

// ─── Exercise 8 ────────────────────────────────────────────────────────────
const ex8_a = "error: commit is a merge but no -m option was given";
const ex8_b = "Applies the diff between P1 and M (changes feature brought in)";
const ex8_c = "Applies the diff between P2 and M (changes main brought in)";
console.log("\nExercise 8:", { error: ex8_a, m1: ex8_b, m2: ex8_c });

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function formatCherryPickMessage(originalMessage: string, originalSha: string): string {
  return `${originalMessage}\n\n(cherry picked from commit ${originalSha})`;
}

console.log("\nExercise 9:");
console.log(formatCherryPickMessage("Fix login bug", "abc123def456"));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
const ex10_a = "Usually no conflict — Git is smart enough to see the changes are already applied.";
const ex10_b = "Once in the final tree. Git's merge detects the duplicate and applies it once.";
console.log("\nExercise 10:", { conflict: ex10_a, appearances: ex10_b });

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function cherryPickNoCommit(
  currentTree: Map<string, string>,
  staging: Map<string, string>,
  commitDiff: Map<string, { from: string | null; to: string | null }>
): { newTree: Map<string, string>; newStaging: Map<string, string> } {
  const newTree = new Map(currentTree);
  const newStaging = new Map(staging);
  for (const [file, change] of commitDiff) {
    if (change.to === null) { newTree.delete(file); newStaging.delete(file); }
    else { newTree.set(file, change.to); newStaging.set(file, change.to); }
  }
  return { newTree, newStaging };
}

console.log("\nExercise 11:");
console.log(cherryPickNoCommit(
  new Map([["a", "1"]]), new Map([["a", "1"]]),
  new Map([["b", { from: null, to: "new" }]])
));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
function detectCherryPickConflicts(
  currentTree: Map<string, string>,
  commitParentTree: Map<string, string>,
  commitTree: Map<string, string>
): string[] {
  const conflicts: string[] = [];
  const allFiles = new Set([...commitParentTree.keys(), ...commitTree.keys()]);
  for (const file of allFiles) {
    const parent = commitParentTree.get(file);
    const commit = commitTree.get(file);
    if (parent !== commit) {
      // File changed in commit
      const current = currentTree.get(file);
      if (current !== parent && current !== commit) {
        conflicts.push(file);
      }
    }
  }
  return conflicts;
}

console.log("\nExercise 12:");
console.log("Conflicts:", detectCherryPickConflicts(
  new Map([["f", "X"]]),   // current: changed
  new Map([["f", "1"]]),   // commit parent: original
  new Map([["f", "2"]]),   // commit: also changed
));

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class GitCherryPick {
  private commits: Map<string, GraphNode> = new Map();
  private branches: Map<string, string> = new Map();
  private head = "main";
  private counter = 0;

  addNode(sha: string, msg: string, parents: string[], tree: Map<string, string>): void {
    this.commits.set(sha, { sha, message: msg, parents, tree });
  }
  setBranch(name: string, sha: string): void { this.branches.set(name, sha); }

  pick(sha: string): { success: boolean; newSha?: string; conflicts?: string[] } {
    const headSha = this.branches.get(this.head);
    if (!headSha) return { success: false };
    const result = simulateCherryPick(this.commits, headSha, sha);
    if (result.conflicts.length > 0) return { success: false, conflicts: result.conflicts };
    const newSha = `cp${++this.counter}`;
    this.commits.set(newSha, { sha: newSha, message: this.commits.get(sha)!.message, parents: [headSha], tree: result.newTree });
    this.branches.set(this.head, newSha);
    return { success: true, newSha };
  }

  pickRange(from: string, to: string): { success: boolean; newShas: string[] } {
    const chain: string[] = [];
    let c: string | null = to;
    while (c && c !== from) { chain.unshift(c); c = this.commits.get(c)?.parents[0] ?? null; }
    const newShas: string[] = [];
    for (const sha of chain) {
      const r = this.pick(sha);
      if (!r.success) return { success: false, newShas };
      newShas.push(r.newSha!);
    }
    return { success: true, newShas };
  }

  abort(): void { /* restore from saved state */ }
}

console.log("\nExercise 13:");
const gcp = new GitCherryPick();
gcp.addNode("a", "A", [], new Map([["f", "1"]]));
gcp.addNode("b", "B", ["a"], new Map([["f", "1"], ["g", "new"]]));
gcp.addNode("c", "C", ["a"], new Map([["f", "1"], ["h", "other"]]));
gcp.setBranch("main", "c");
console.log("Pick b:", gcp.pick("b"));

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
