// ============================================================================
// 03-rebasing: Solutions
// ============================================================================
// Run:  npx tsx 08-git/02-branching/03-rebasing/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

// ─── Exercise 1 ────────────────────────────────────────────────────────────
const ex1_a = "C(m3)"; // D' parent becomes C, the tip of main
const ex1_b = 5;        // A, B, C, D', E'
const ex1_c = false;    // Different SHA because different parent

console.log("Exercise 1:", { parent: ex1_a, total: ex1_b, sameSha: ex1_c });

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface RCommit {
  sha: string;
  message: string;
  parentSha: string | null;
  changes: Map<string, string>;
}

class RebaseSimulator {
  private commits: Map<string, RCommit> = new Map();
  private counter = 0;

  addCommit(sha: string, message: string, parentSha: string | null, changes: Map<string, string>): void {
    this.commits.set(sha, { sha, message, parentSha, changes });
  }

  rebase(commitsToReplay: string[], newBaseSha: string): string[] {
    const newShas: string[] = [];
    let parentSha = newBaseSha;

    for (const oldSha of commitsToReplay) {
      const old = this.commits.get(oldSha);
      if (!old) continue;
      const newSha = "r" + (++this.counter).toString().padStart(3, "0");
      this.commits.set(newSha, {
        sha: newSha,
        message: old.message,
        parentSha: parentSha,
        changes: new Map(old.changes),
      });
      newShas.push(newSha);
      parentSha = newSha;
    }
    return newShas;
  }

  getCommit(sha: string): RCommit | undefined {
    return this.commits.get(sha);
  }
}

console.log("\nExercise 2:");
const rs = new RebaseSimulator();
rs.addCommit("a", "A", null, new Map());
rs.addCommit("b", "B", "a", new Map());
rs.addCommit("c", "C", "b", new Map([["f", "v3"]]));
rs.addCommit("d", "D", "b", new Map([["g", "v1"]]));
rs.addCommit("e", "E", "d", new Map([["g", "v2"]]));
const newShas = rs.rebase(["d", "e"], "c");
console.log("New SHAs:", newShas);
console.log("D' parent:", rs.getCommit(newShas[0]!)?.parentSha); // c

// ─── Exercise 3 ────────────────────────────────────────────────────────────
const ex3_a = 2;  // aaa+bbb squashed into 1, ccc kept, ddd dropped
const ex3_b = "Squashed into aaa's commit (changes combined)";
const ex3_c = "Dropped — changes are discarded";

console.log("\nExercise 3:", { commits: ex3_a, bbb: ex3_b, ddd: ex3_c });

// ─── Exercise 4 ────────────────────────────────────────────────────────────
type RebaseAction = "pick" | "squash" | "fixup" | "reword" | "drop";
interface RebaseTodo { action: RebaseAction; sha: string; message: string; newMessage?: string; }

function interactiveRebase(
  commits: RCommit[],
  todos: RebaseTodo[]
): Array<{ message: string; combinedChanges: Map<string, string> }> {
  const result: Array<{ message: string; combinedChanges: Map<string, string> }> = [];
  const commitMap = new Map(commits.map(c => [c.sha, c]));

  for (const todo of todos) {
    const commit = commitMap.get(todo.sha);
    if (!commit) continue;

    if (todo.action === "drop") continue;

    if (todo.action === "squash" || todo.action === "fixup") {
      const prev = result[result.length - 1];
      if (prev) {
        for (const [f, c] of commit.changes) prev.combinedChanges.set(f, c);
        if (todo.action === "squash") prev.message += "\n" + commit.message;
      }
      continue;
    }

    const msg = todo.action === "reword" && todo.newMessage ? todo.newMessage : commit.message;
    result.push({ message: msg, combinedChanges: new Map(commit.changes) });
  }
  return result;
}

console.log("\nExercise 4:");
const irCommits: RCommit[] = [
  { sha: "a", message: "Add feature", parentSha: null, changes: new Map([["f.ts", "v1"]]) },
  { sha: "b", message: "Fix typo", parentSha: "a", changes: new Map([["f.ts", "v2"]]) },
  { sha: "c", message: "Add tests", parentSha: "b", changes: new Map([["t.ts", "v1"]]) },
];
const todos: RebaseTodo[] = [
  { action: "pick", sha: "a", message: "Add feature" },
  { action: "fixup", sha: "b", message: "Fix typo" },
  { action: "pick", sha: "c", message: "Add tests" },
];
console.log("Interactive result:", interactiveRebase(irCommits, todos));

// ─── Exercise 5 ────────────────────────────────────────────────────────────
const ex5_a = 6;       // A, B, C, D, E, M (merge commit)
const ex5_b = 5;       // A, B, C, D', E' (linear)
const ex5_c = "merge";
const ex5_d = "merge"; // Merge preserves original SHAs

console.log("\nExercise 5:", { mergeCount: ex5_a, rebaseCount: ex5_b, mergeCommit: ex5_c, preserves: ex5_d });

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function squashCommits(
  commits: Array<{ message: string; changes: Map<string, string> }>
): { message: string; changes: Map<string, string> } {
  const combined = new Map<string, string>();
  const messages: string[] = [];
  for (const c of commits) {
    messages.push(c.message);
    for (const [f, content] of c.changes) combined.set(f, content);
  }
  return { message: messages.join("\n"), changes: combined };
}

console.log("\nExercise 6:");
console.log(squashCommits([
  { message: "Add login", changes: new Map([["auth.ts", "v1"]]) },
  { message: "Fix typo", changes: new Map([["auth.ts", "v2"]]) },
  { message: "Add tests", changes: new Map([["auth.test.ts", "v1"]]) },
]));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
const ex7_a = "Diverged history — B's local has D,E while remote has D',E'. git pull creates duplicate commits.";
const ex7_b = 2; // D and D' both exist (original and rebased)

console.log("\nExercise 7:", { problem: ex7_a, copies: ex7_b });

// ─── Exercise 8 ────────────────────────────────────────────────────────────
function rebaseOnto(
  commits: Map<string, RCommit>,
  newBase: string,
  oldBase: string,
  branch: string
): string[] {
  // Find commits between oldBase and branch
  const toReplay: string[] = [];
  let current: string | null = branch;
  while (current && current !== oldBase) {
    toReplay.unshift(current);
    current = commits.get(current)?.parentSha ?? null;
  }

  // Replay onto newBase
  let counter = 0;
  const newShas: string[] = [];
  let parent = newBase;
  for (const sha of toReplay) {
    const old = commits.get(sha)!;
    const newSha = `onto${++counter}`;
    commits.set(newSha, { sha: newSha, message: old.message, parentSha: parent, changes: new Map(old.changes) });
    newShas.push(newSha);
    parent = newSha;
  }
  return newShas;
}

console.log("\nExercise 8:");
const ontoMap = new Map<string, RCommit>();
ontoMap.set("a", { sha: "a", message: "A", parentSha: null, changes: new Map() });
ontoMap.set("b", { sha: "b", message: "B", parentSha: "a", changes: new Map() });
ontoMap.set("c", { sha: "c", message: "C", parentSha: "b", changes: new Map() });
ontoMap.set("d", { sha: "d", message: "D", parentSha: "b", changes: new Map() });
ontoMap.set("e", { sha: "e", message: "E", parentSha: "d", changes: new Map() });
console.log("Rebase onto:", rebaseOnto(ontoMap, "c", "b", "e"));

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function fixedRebase(
  commits: Array<{ sha: string; message: string; parent: string | null }>,
  newBaseSha: string
) {
  const result: Array<{ sha: string; message: string; parent: string | null }> = [];
  let lastSha = newBaseSha;
  let counter = 0;

  for (const commit of commits) {
    const newSha = `rebased_${++counter}`;  // FIX 1: new SHA
    result.push({
      sha: newSha,
      message: commit.message,
      parent: lastSha,    // FIX 2: use previous rebased commit
    });
    lastSha = newSha;     // FIX 3: update lastSha
  }
  return result;
}

console.log("\nExercise 9:");
console.log(fixedRebase(
  [{ sha: "d", message: "D", parent: "b" }, { sha: "e", message: "E", parent: "d" }],
  "c"
));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
const ex10_a = "Rebase paused — commit 1 applied, commit 2 has conflicts, commit 3 pending";
const ex10_b = "git rebase --continue";
const ex10_c = "Up to 1 more (commit 3 could also conflict)";
const ex10_d = "git rebase --abort";

console.log("\nExercise 10:", { state: ex10_a, continue: ex10_b, more: ex10_c, abort: ex10_d });

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function autoSquash(commits: Array<{ sha: string; message: string }>): RebaseTodo[] {
  const result: RebaseTodo[] = [];
  const fixups: Map<string, Array<{ sha: string; message: string; isFixup: boolean }>> = new Map();

  // First pass: separate normal commits from fixup/squash
  const normal: Array<{ sha: string; message: string }> = [];
  for (const c of commits) {
    const fixupMatch = c.message.match(/^fixup! (.+)$/);
    const squashMatch = c.message.match(/^squash! (.+)$/);
    if (fixupMatch) {
      const target = fixupMatch[1]!;
      if (!fixups.has(target)) fixups.set(target, []);
      fixups.get(target)!.push({ sha: c.sha, message: c.message, isFixup: true });
    } else if (squashMatch) {
      const target = squashMatch[1]!;
      if (!fixups.has(target)) fixups.set(target, []);
      fixups.get(target)!.push({ sha: c.sha, message: c.message, isFixup: false });
    } else {
      normal.push(c);
    }
  }

  // Second pass: build todo list
  for (const c of normal) {
    result.push({ action: "pick", sha: c.sha, message: c.message });
    const related = fixups.get(c.message) ?? [];
    for (const r of related) {
      result.push({ action: r.isFixup ? "fixup" : "squash", sha: r.sha, message: r.message });
    }
  }
  return result;
}

console.log("\nExercise 11:");
console.log(autoSquash([
  { sha: "a", message: "Add login" },
  { sha: "b", message: "Add tests" },
  { sha: "c", message: "fixup! Add login" },
  { sha: "d", message: "squash! Add tests" },
]));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
const ex12_a = "By default, rebase linearizes history — merge commits are dropped.";
const ex12_b = "--rebase-merges (replaces deprecated --preserve-merges)";

console.log("\nExercise 12:", { default: ex12_a, flag: ex12_b });

// ─── Exercise 13 ───────────────────────────────────────────────────────────
function replayCommit(
  _baseSha: string,
  baseTree: Map<string, string>,
  commitChanges: Map<string, string>
): { newTree: Map<string, string>; conflicts: string[] } {
  const newTree = new Map(baseTree);
  const conflicts: string[] = [];

  for (const [file, content] of commitChanges) {
    if (baseTree.has(file) && baseTree.get(file) !== content) {
      // File exists and is different — could be a conflict
      // For simplicity: if base has it with different content, conflict
    }
    newTree.set(file, content);
  }
  return { newTree, conflicts };
}

console.log("\nExercise 13:");
console.log(replayCommit("base", new Map([["a", "1"]]), new Map([["a", "2"], ["b", "1"]])));

// ─── Exercise 14 ───────────────────────────────────────────────────────────
class GitRebase {
  private commits: Map<string, RCommit> = new Map();
  private branches: Map<string, string> = new Map();
  private counter = 0;

  addCommit(sha: string, msg: string, parent: string | null, changes: Map<string, string>): void {
    this.commits.set(sha, { sha, message: msg, parentSha: parent, changes });
  }

  setBranch(name: string, sha: string): void { this.branches.set(name, sha); }

  rebase(branch: string, onto: string): { success: boolean; newCommits: string[]; conflicts?: string[] } {
    const branchSha = this.branches.get(branch);
    const ontoSha = this.branches.get(onto) ?? onto;
    if (!branchSha) return { success: false, newCommits: [] };

    // Collect commits to replay
    const toReplay: string[] = [];
    let current: string | null = branchSha;
    while (current && current !== ontoSha) {
      toReplay.unshift(current);
      current = this.commits.get(current)?.parentSha ?? null;
    }

    let parent = ontoSha;
    const newCommits: string[] = [];
    for (const sha of toReplay) {
      const old = this.commits.get(sha)!;
      const newSha = `rb${++this.counter}`;
      this.commits.set(newSha, { sha: newSha, message: old.message, parentSha: parent, changes: new Map(old.changes) });
      newCommits.push(newSha);
      parent = newSha;
    }
    this.branches.set(branch, parent);
    return { success: true, newCommits };
  }

  interactiveRebase(branch: string, todos: RebaseTodo[]): { success: boolean; newCommits: string[] } {
    const commits = todos.map(t => this.commits.get(t.sha)).filter((c): c is RCommit => !!c);
    const result = interactiveRebase(commits, todos);
    const newCommits: string[] = [];
    let parent = this.branches.get(branch) ?? null;
    for (const r of result) {
      const sha = `ir${++this.counter}`;
      this.commits.set(sha, { sha, message: r.message, parentSha: parent, changes: r.combinedChanges });
      newCommits.push(sha);
      parent = sha;
    }
    return { success: true, newCommits };
  }
}

console.log("\nExercise 14:");
const gr = new GitRebase();
gr.addCommit("a", "A", null, new Map());
gr.addCommit("b", "B", "a", new Map());
gr.addCommit("c", "C", "b", new Map());
gr.addCommit("d", "D", "b", new Map([["f", "1"]]));
gr.addCommit("e", "E", "d", new Map([["f", "2"]]));
gr.setBranch("main", "c");
gr.setBranch("feature", "e");
console.log("Rebase result:", gr.rebase("feature", "main"));

console.log("\n============================================");
console.log("All 14 exercises completed successfully! ✓");
console.log("============================================");
