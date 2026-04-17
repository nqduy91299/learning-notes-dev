// ============================================================================
// 04-diff-show: Solutions
// ============================================================================
// Run:  npx tsx 08-git/01-basics/04-diff-show/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Complete solutions with explanations
// ============================================================================

// ─── Exercise 1 ────────────────────────────────────────────────────────────
type DiffCmd = "git diff" | "git diff --cached" | "git diff HEAD" | "git diff HEAD~1";
const ex1_A: DiffCmd = "git diff";
const ex1_B: DiffCmd = "git diff --cached";
const ex1_C: DiffCmd = "git diff HEAD";
const ex1_D: DiffCmd = "git diff HEAD~1";

console.log("Exercise 1:");
console.log("A (unstaged):", ex1_A);
console.log("B (staged):", ex1_B);
console.log("C (all uncommitted):", ex1_C);
console.log("D (last commit changes):", ex1_D);

// ─── Exercise 2 ────────────────────────────────────────────────────────────
interface DiffLine {
  type: "context" | "add" | "remove";
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function simpleDiff(original: string, modified: string): DiffLine[] {
  const oldLines = original.split("\n");
  const newLines = modified.split("\n");
  const result: DiffLine[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const o = i < oldLines.length ? oldLines[i] : undefined;
    const n = i < newLines.length ? newLines[i] : undefined;
    if (o === n) {
      result.push({ type: "context", content: o!, oldLineNum: i + 1, newLineNum: i + 1 });
    } else {
      if (o !== undefined) result.push({ type: "remove", content: o, oldLineNum: i + 1 });
      if (n !== undefined) result.push({ type: "add", content: n, newLineNum: i + 1 });
    }
  }
  return result;
}

console.log("\nExercise 2:");
const diff2 = simpleDiff("line1\nline2\nline3", "line1\nchanged\nline3\nline4");
diff2.forEach(d => {
  const p = d.type === "add" ? "+" : d.type === "remove" ? "-" : " ";
  console.log(`${p} ${d.content}`);
});

// ─── Exercise 3 ────────────────────────────────────────────────────────────
const ex3_a_changes = "Only line4 added (working has line4, staged doesn't)";
const ex3_b_changes = "line2 changed to 'modified' (staged vs committed)";
const ex3_c_changes = "line2 changed to 'modified' AND line4 added (working vs committed)";

console.log("\nExercise 3:");
console.log("git diff:", ex3_a_changes);
console.log("git diff --cached:", ex3_b_changes);
console.log("git diff HEAD:", ex3_c_changes);

// ─── Exercise 4 ────────────────────────────────────────────────────────────
interface Hunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

function parseHunkHeader(header: string): Omit<Hunk, "lines"> | null {
  const match = header.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
  if (!match) return null;
  return {
    oldStart: parseInt(match[1]!, 10),
    oldCount: parseInt(match[2]!, 10),
    newStart: parseInt(match[3]!, 10),
    newCount: parseInt(match[4]!, 10),
  };
}

console.log("\nExercise 4:");
console.log(parseHunkHeader("@@ -10,6 +10,8 @@ function foo()"));
console.log(parseHunkHeader("@@ -1,3 +1,5 @@"));
console.log(parseHunkHeader("not a hunk header"));

// ─── Exercise 5 ────────────────────────────────────────────────────────────
const ex5_file1 = "file1.ts | 10 ++++++++++";
const ex5_file2 = "file2.ts |  3 ---";
const ex5_file3 = "file3.ts | 10 +++++-----";

console.log("\nExercise 5:");
console.log(ex5_file1);
console.log(ex5_file2);
console.log(ex5_file3);

// ─── Exercise 6 ────────────────────────────────────────────────────────────
interface FileDiffStat {
  filename: string;
  insertions: number;
  deletions: number;
}

function formatDiffStat(stats: FileDiffStat[]): string[] {
  const maxNameLen = Math.max(...stats.map(s => s.filename.length));
  const lines = stats.map(s => {
    const total = s.insertions + s.deletions;
    const plus = "+".repeat(s.insertions);
    const minus = "-".repeat(s.deletions);
    return ` ${s.filename.padEnd(maxNameLen)} | ${String(total).padStart(3)} ${plus}${minus}`;
  });

  const totalIns = stats.reduce((sum, s) => sum + s.insertions, 0);
  const totalDel = stats.reduce((sum, s) => sum + s.deletions, 0);
  lines.push(` ${stats.length} file(s) changed, ${totalIns} insertions(+), ${totalDel} deletions(-)`);
  return lines;
}

console.log("\nExercise 6:");
formatDiffStat([
  { filename: "src/auth.ts", insertions: 15, deletions: 3 },
  { filename: "README.md", insertions: 5, deletions: 0 },
  { filename: "test/auth.test.ts", insertions: 20, deletions: 2 },
]).forEach(l => console.log(l));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function wordDiff(original: string, modified: string): string {
  const oldWords = original.split(/(\s+)/);
  const newWords = modified.split(/(\s+)/);
  const result: string[] = [];
  const maxLen = Math.max(oldWords.length, newWords.length);

  for (let i = 0; i < maxLen; i++) {
    const o = oldWords[i];
    const n = newWords[i];
    if (o === n) {
      result.push(o ?? "");
    } else {
      if (o) result.push(`[-${o}-]`);
      if (n) result.push(`{+${n}+}`);
    }
  }
  return result.join("");
}

console.log("\nExercise 7:");
console.log(wordDiff("The quick brown fox", "The slow brown cat"));
// "The [-quick-]{+slow+} brown [-fox-]{+cat+}"

// ─── Exercise 8 ────────────────────────────────────────────────────────────
const ex8_a = "Diff between tip of main (C) and tip of feature (E)";
const ex8_b = "Diff between merge base (B) and tip of feature (E)";
const ex8_c = "three-dot";

console.log("\nExercise 8:");
console.log("main..feature:", ex8_a);
console.log("main...feature:", ex8_b);
console.log("Only feature changes:", ex8_c);

// ─── Exercise 9 ────────────────────────────────────────────────────────────
interface CommitGraph {
  commits: Map<string, { parents: string[]; content: Map<string, string> }>;
}

function findMergeBase(graph: CommitGraph, ref1: string, ref2: string): string | null {
  // BFS from ref1 to collect all ancestors
  const ancestors1 = new Set<string>();
  const queue1 = [ref1];
  while (queue1.length > 0) {
    const current = queue1.shift()!;
    if (ancestors1.has(current)) continue;
    ancestors1.add(current);
    const commit = graph.commits.get(current);
    if (commit) queue1.push(...commit.parents);
  }

  // BFS from ref2, first hit in ancestors1 is merge base
  const queue2 = [ref2];
  const visited = new Set<string>();
  while (queue2.length > 0) {
    const current = queue2.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (ancestors1.has(current)) return current;
    const commit = graph.commits.get(current);
    if (commit) queue2.push(...commit.parents);
  }
  return null;
}

console.log("\nExercise 9:");
const graph: CommitGraph = {
  commits: new Map([
    ["E", { parents: ["D"], content: new Map() }],
    ["D", { parents: ["B"], content: new Map() }],
    ["C", { parents: ["B"], content: new Map() }],
    ["B", { parents: ["A"], content: new Map() }],
    ["A", { parents: [], content: new Map() }],
  ]),
};
console.log("Merge base of C and E:", findMergeBase(graph, "C", "E")); // B

// ─── Exercise 10 ───────────────────────────────────────────────────────────
function fixedDiffFormat(oldLines: string[], newLines: string[]): string[] {
  const output: string[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const o = i < oldLines.length ? oldLines[i] : undefined;
    const n = i < newLines.length ? newLines[i] : undefined;

    if (o === n) {
      output.push(` ${o}`);  // FIX: context with space prefix
    } else {
      if (o !== undefined) output.push(`-${o}`);  // FIX: only if exists
      if (n !== undefined) output.push(`+${n}`);   // FIX: only if exists
    }
  }
  return output;
}

console.log("\nExercise 10:");
console.log(fixedDiffFormat(["a", "b", "c"], ["a", "x", "c", "d"]));

// ─── Exercise 11 ───────────────────────────────────────────────────────────
interface ShowOutput {
  sha: string;
  author: string;
  date: string;
  message: string;
  diff: DiffLine[];
}

function simulateGitShow(
  commits: Map<string, {
    sha: string;
    author: string;
    date: string;
    message: string;
    tree: Map<string, string>;
    parentSha: string | null;
  }>,
  ref: string
): ShowOutput | null {
  const commit = commits.get(ref);
  if (!commit) return null;

  const parentTree = commit.parentSha
    ? commits.get(commit.parentSha)?.tree ?? new Map<string, string>()
    : new Map<string, string>();

  const allFiles = new Set([...parentTree.keys(), ...commit.tree.keys()]);
  const diffLines: DiffLine[] = [];

  for (const file of allFiles) {
    const old = parentTree.get(file);
    const cur = commit.tree.get(file);
    if (old !== cur) {
      if (old) diffLines.push({ type: "remove", content: `${file}: ${old}` });
      if (cur) diffLines.push({ type: "add", content: `${file}: ${cur}` });
    }
  }

  return { sha: commit.sha, author: commit.author, date: commit.date, message: commit.message, diff: diffLines };
}

console.log("\nExercise 11:");
const showCommits = new Map([
  ["abc", { sha: "abc", author: "Alice", date: "2024-01-01", message: "Init", tree: new Map([["f.txt", "v1"]]), parentSha: null }],
  ["def", { sha: "def", author: "Bob", date: "2024-01-02", message: "Update", tree: new Map([["f.txt", "v2"]]), parentSha: "abc" }],
]);
const showResult = simulateGitShow(showCommits, "def");
console.log(showResult?.message, showResult?.diff);

// ─── Exercise 12 ───────────────────────────────────────────────────────────
const ex12_a = true;  // Git detects renames by default with -M
const ex12_b = "-M (or --find-renames)";
const ex12_c = 50;    // 50% similarity threshold

console.log("\nExercise 12:");
console.log("Detects rename:", ex12_a, "| Flag:", ex12_b, "| Threshold:", ex12_c + "%");

// ─── Exercise 13 ───────────────────────────────────────────────────────────
function diffWithContext(original: string[], modified: string[], contextLines: number): string[] {
  // Find changed line indices
  const maxLen = Math.max(original.length, modified.length);
  const changes = new Set<number>();

  for (let i = 0; i < maxLen; i++) {
    if (original[i] !== modified[i]) changes.add(i);
  }

  // Add context around changes
  const visible = new Set<number>();
  for (const idx of changes) {
    for (let c = idx - contextLines; c <= idx + contextLines; c++) {
      if (c >= 0 && c < maxLen) visible.add(c);
    }
  }

  const output: string[] = [];
  const sorted = [...visible].sort((a, b) => a - b);
  for (const i of sorted) {
    const o = original[i];
    const n = modified[i];
    if (o === n) output.push(` ${o}`);
    else {
      if (o !== undefined) output.push(`-${o}`);
      if (n !== undefined) output.push(`+${n}`);
    }
  }
  return output;
}

console.log("\nExercise 13:");
const ctx = diffWithContext(
  ["a", "b", "c", "d", "e", "f", "g"],
  ["a", "b", "X", "d", "e", "f", "g"],
  1
);
console.log("Context diff (U1):", ctx);

// ─── Exercise 14 ───────────────────────────────────────────────────────────
class DiffEngine {
  lineDiff(a: string, b: string): DiffLine[] {
    return simpleDiff(a, b);
  }

  stat(a: string, b: string, filename: string): FileDiffStat {
    const diff = this.lineDiff(a, b);
    return {
      filename,
      insertions: diff.filter(d => d.type === "add").length,
      deletions: diff.filter(d => d.type === "remove").length,
    };
  }

  nameStatus(files: Array<{ name: string; oldContent: string | null; newContent: string | null }>): string[] {
    return files.map(f => {
      if (!f.oldContent && f.newContent) return `A\t${f.name}`;
      if (f.oldContent && !f.newContent) return `D\t${f.name}`;
      if (f.oldContent !== f.newContent) return `M\t${f.name}`;
      return `\t${f.name}`;
    });
  }
}

console.log("\nExercise 14:");
const engine = new DiffEngine();
console.log("Stat:", engine.stat("a\nb\nc", "a\nx\nc\nd", "file.ts"));
console.log("Name-status:", engine.nameStatus([
  { name: "new.ts", oldContent: null, newContent: "code" },
  { name: "mod.ts", oldContent: "old", newContent: "new" },
  { name: "del.ts", oldContent: "bye", newContent: null },
]));

console.log("\n============================================");
console.log("All 14 exercises completed successfully! ✓");
console.log("============================================");
