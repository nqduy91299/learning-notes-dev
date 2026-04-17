// ============================================================================
// 04-diff-show: Exercises
// ============================================================================
// Run:  npx tsx 08-git/01-basics/04-diff-show/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 14 exercises covering git diff, git show, diff format, hunks
// ============================================================================

// Exercise 1: Predict the Output — which diff command to use
// ----------------------------------------------------------------------------
// Match each scenario to the correct diff command:
// A: See what you've changed but haven't staged
// B: See what's staged for the next commit
// C: See all uncommitted changes (staged + unstaged)
// D: See what the last commit changed

type DiffCmd = "git diff" | "git diff --cached" | "git diff HEAD" | "git diff HEAD~1";
const ex1_A: DiffCmd = "git diff" as DiffCmd;          // TODO
const ex1_B: DiffCmd = "git diff" as DiffCmd;          // TODO
const ex1_C: DiffCmd = "git diff" as DiffCmd;          // TODO
const ex1_D: DiffCmd = "git diff" as DiffCmd;          // TODO


// Exercise 2: Implement a simple line-by-line diff
// ----------------------------------------------------------------------------
interface DiffLine {
  type: "context" | "add" | "remove";
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function simpleDiff(_original: string, _modified: string): DiffLine[] {
  // TODO: Compare two strings line-by-line
  // Lines that are the same → context
  // Lines only in original → remove
  // Lines only in modified → add
  // Use a simple approach: compare each line by index
  return [];
}


// Exercise 3: Predict the Output — diff after staging
// ----------------------------------------------------------------------------
// Given:
//   echo "line1\nline2\nline3" > file.txt
//   git add file.txt && git commit -m "init"
//   echo "line1\nmodified\nline3" > file.txt
//   git add file.txt
//   echo "line1\nmodified\nline3\nline4" > file.txt
//
// a) What does `git diff` show? (working vs staged)
// b) What does `git diff --cached` show? (staged vs HEAD)
// c) What does `git diff HEAD` show? (working vs HEAD)

const ex3_a_changes: string = ""; // TODO: describe what diff shows
const ex3_b_changes: string = ""; // TODO
const ex3_c_changes: string = ""; // TODO


// Exercise 4: Implement a hunk parser
// ----------------------------------------------------------------------------
interface Hunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

function parseHunkHeader(_header: string): Omit<Hunk, "lines"> | null {
  // TODO: Parse "@@ -10,6 +10,8 @@" into { oldStart: 10, oldCount: 6, newStart: 10, newCount: 8 }
  return null;
}


// Exercise 5: Predict the Output — diff stat
// ----------------------------------------------------------------------------
// Given a commit that:
//   - Adds 10 lines to file1.ts
//   - Removes 3 lines from file2.ts
//   - Modifies 5 lines in file3.ts (5 removed, 5 added)
//
// What does `git diff --stat` show for each file?
const ex5_file1: string = ""; // TODO: format like "file1.ts | 10 ++++++++++"
const ex5_file2: string = ""; // TODO
const ex5_file3: string = ""; // TODO


// Exercise 6: Implement diff stat formatter
// ----------------------------------------------------------------------------
interface FileDiffStat {
  filename: string;
  insertions: number;
  deletions: number;
}

function formatDiffStat(_stats: FileDiffStat[]): string[] {
  // TODO: Format like git diff --stat output
  // "filename.ts | 10 ++++++----"
  // Total line at the end
  return [];
}


// Exercise 7: Implement a word-level diff
// ----------------------------------------------------------------------------
function wordDiff(_original: string, _modified: string): string {
  // TODO: Return a string with [-removed-] and {+added+} markers
  // Split by words, compare word by word
  return "";
}


// Exercise 8: Predict the Output — two-dot vs three-dot diff
// ----------------------------------------------------------------------------
// Given:
//   main:    A --- B --- C
//                 \
//   feature:       D --- E
//
// a) git diff main..feature — what is compared?
// b) git diff main...feature — what is compared?
// c) Which one shows only changes made on feature?

const ex8_a: string = ""; // TODO
const ex8_b: string = ""; // TODO
const ex8_c: string = ""; // TODO: "two-dot" or "three-dot"


// Exercise 9: Implement a three-way diff merge base finder
// ----------------------------------------------------------------------------
interface CommitGraph {
  commits: Map<string, { parents: string[]; content: Map<string, string> }>;
}

function findMergeBase(_graph: CommitGraph, _ref1: string, _ref2: string): string | null {
  // TODO: Find the common ancestor of two refs using BFS
  return null;
}


// Exercise 10: Fix the Bug — diff output
// ----------------------------------------------------------------------------
function buggyDiffFormat(oldLines: string[], newLines: string[]): string[] {
  const output: string[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    // BUG 1: Should check if lines are equal before marking as changed
    // BUG 2: Should handle when one array is shorter than the other
    // BUG 3: Context lines should have space prefix, not empty prefix
    if (i < oldLines.length) output.push(`-${oldLines[i]}`);
    if (i < newLines.length) output.push(`+${newLines[i]}`);
  }
  return output;
}


// Exercise 11: Implement git show simulation
// ----------------------------------------------------------------------------
interface ShowOutput {
  sha: string;
  author: string;
  date: string;
  message: string;
  diff: DiffLine[];
}

function simulateGitShow(
  _commits: Map<string, {
    sha: string;
    author: string;
    date: string;
    message: string;
    tree: Map<string, string>;
    parentSha: string | null;
  }>,
  _ref: string
): ShowOutput | null {
  // TODO: Get the commit, compute diff between it and its parent
  return null;
}


// Exercise 12: Predict the Output — diff with renames
// ----------------------------------------------------------------------------
// Given:
//   git mv old-name.ts new-name.ts
//   # Also modify 2 lines in the file
//   git diff --cached
//
// a) Does git detect the rename?
// b) What flags help git detect renames?
// c) What similarity threshold does git use by default?

const ex12_a: boolean = false; // TODO
const ex12_b: string = "";     // TODO
const ex12_c: number = 0;      // TODO: percentage


// Exercise 13: Implement context-aware diff
// ----------------------------------------------------------------------------
function diffWithContext(
  _original: string[],
  _modified: string[],
  _contextLines: number
): string[] {
  // TODO: Generate diff output with only the specified number of context lines
  // around each change (like git diff -U<n>)
  return [];
}


// Exercise 14: Build a complete diff system
// ----------------------------------------------------------------------------
class DiffEngine {
  // TODO: Implement a diff engine that supports:
  // - Line-by-line diff
  // - Stat output
  // - Hunk generation with configurable context
  // - Name-only and name-status modes

  lineDiff(_a: string, _b: string): DiffLine[] { return []; }
  stat(_a: string, _b: string, _filename: string): FileDiffStat { return { filename: "", insertions: 0, deletions: 0 }; }
  nameStatus(_files: Array<{ name: string; oldContent: string | null; newContent: string | null }>): string[] { return []; }
}

export {
  simpleDiff,
  parseHunkHeader,
  formatDiffStat,
  wordDiff,
  findMergeBase,
  buggyDiffFormat,
  simulateGitShow,
  diffWithContext,
  DiffEngine,
  ex1_A, ex1_B, ex1_C, ex1_D,
  ex3_a_changes, ex3_b_changes, ex3_c_changes,
  ex5_file1, ex5_file2, ex5_file3,
  ex8_a, ex8_b, ex8_c,
  ex12_a, ex12_b, ex12_c,
};
export type { DiffLine, Hunk, FileDiffStat, CommitGraph, ShowOutput };
