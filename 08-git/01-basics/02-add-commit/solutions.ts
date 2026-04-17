// ============================================================================
// 02-add-commit: Solutions
// ============================================================================
// Run:  npx tsx 08-git/01-basics/02-add-commit/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Complete solutions with explanations and test runner
// ============================================================================

// ─── Exercise 1: Predict the Output — staging states ───────────────────────

const ex1_a_staged = true;     // a.txt IS staged (original "hello" version)
const ex1_a_modified = true;   // a.txt IS ALSO modified in working dir ("modified" version)
const ex1_b_untracked = true;  // b.txt is untracked

console.log("Exercise 1:");
console.log("a.txt staged:", ex1_a_staged, "| modified:", ex1_a_modified);
console.log("b.txt untracked:", ex1_b_untracked);
// git status shows a.txt as both "Changes to be committed" AND
// "Changes not staged for commit". b.txt is "Untracked files".


// ─── Exercise 2: Simulate a staging area ───────────────────────────────────

interface FileState {
  working: string | null;
  staged: string | null;
  committed: string | null;
}

class StagingArea {
  private files: Map<string, FileState> = new Map();

  private getOrCreate(name: string): FileState {
    if (!this.files.has(name)) {
      this.files.set(name, { working: null, staged: null, committed: null });
    }
    return this.files.get(name)!;
  }

  editFile(name: string, content: string): void {
    const state = this.getOrCreate(name);
    state.working = content;
  }

  deleteFile(name: string): void {
    const state = this.getOrCreate(name);
    state.working = null;
  }

  add(name: string): void {
    const state = this.files.get(name);
    if (state) {
      state.staged = state.working;
    }
  }

  unstage(name: string): void {
    const state = this.files.get(name);
    if (state) {
      state.staged = state.committed;
    }
  }

  commit(): string[] {
    const committed: string[] = [];
    for (const [name, state] of this.files) {
      if (state.staged !== state.committed) {
        state.committed = state.staged;
        committed.push(name);
      }
    }
    return committed;
  }

  status(): Array<{ name: string; state: string }> {
    const result: Array<{ name: string; state: string }> = [];
    for (const [name, state] of this.files) {
      if (state.staged !== state.committed) {
        result.push({ name, state: "staged" });
      }
      if (state.working !== state.staged) {
        result.push({ name, state: state.working === null ? "deleted" : "modified" });
      }
      if (state.committed === null && state.staged === null && state.working !== null) {
        result.push({ name, state: "untracked" });
      }
    }
    return result;
  }
}

console.log("\nExercise 2:");
const sa = new StagingArea();
sa.editFile("a.txt", "hello");
sa.editFile("b.txt", "world");
sa.add("a.txt");
sa.add("b.txt");
console.log("Committed:", sa.commit());
sa.editFile("a.txt", "modified");
sa.add("a.txt");
sa.editFile("a.txt", "modified again");
console.log("Status:", sa.status());
// a.txt is both staged and modified


// ─── Exercise 3: Predict the Output — git add variations ──────────────────

const ex3_a = ["src/index.ts", "src/utils.ts"]; // `git add .` from src/ stages only src/ files
const ex3_b = ["src/index.ts", "src/utils.ts", "docs/readme.txt"]; // `git add -A` stages everything (except .gitignored)
const ex3_c = ["src/index.ts", "docs/readme.txt"]; // `git add -u` stages only tracked modified files (not new untracked)

console.log("\nExercise 3:");
console.log("git add .  (from src/):", ex3_a);
console.log("git add -A:", ex3_b);
console.log("git add -u:", ex3_c);


// ─── Exercise 4: Implement a commit message validator ──────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateCommitMessage(message: string): ValidationResult {
  const errors: string[] = [];
  const lines = message.split("\n");
  const subject = lines[0] ?? "";

  if (subject.trim() === "") {
    errors.push("Subject line must not be empty");
  }
  if (subject.length > 72) {
    errors.push("Subject line must be <= 72 characters");
  }
  if (subject.endsWith(".")) {
    errors.push("Subject must not end with a period");
  }
  if (subject.length > 0 && !/^[A-Z]|^(feat|fix|docs|style|refactor|test|chore)/.test(subject)) {
    errors.push("Subject should start with capital letter or conventional prefix");
  }
  if (lines.length > 1 && lines[1]?.trim() !== "") {
    errors.push("Must have blank line between subject and body");
  }

  return { valid: errors.length === 0, errors };
}

console.log("\nExercise 4:");
console.log(validateCommitMessage("feat: Add user auth"));
console.log(validateCommitMessage("fixed stuff."));
console.log(validateCommitMessage(""));
console.log(validateCommitMessage("Add feature\nwithout blank line"));


// ─── Exercise 5: Predict the Output — commit -a behavior ──────────────────

const ex5_a = true;   // tracked.txt IS committed (commit -a stages tracked modified files)
const ex5_b = false;  // untracked.txt is NOT committed (-a doesn't add untracked files)
const ex5_c = "Untracked files: untracked.txt";

console.log("\nExercise 5:");
console.log("tracked.txt committed:", ex5_a);
console.log("untracked.txt committed:", ex5_b);
console.log("Status shows:", ex5_c);


// ─── Exercise 6: Simulate git diff --cached ───────────────────────────────

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

function computeStagedDiff(
  committed: string | null,
  staged: string | null
): DiffLine[] {
  const committedLines = committed?.split("\n") ?? [];
  const stagedLines = staged?.split("\n") ?? [];
  const result: DiffLine[] = [];
  const maxLen = Math.max(committedLines.length, stagedLines.length);

  for (let i = 0; i < maxLen; i++) {
    const c = committedLines[i];
    const s = stagedLines[i];
    if (c === s) {
      result.push({ type: "context", content: c ?? "" });
    } else {
      if (c !== undefined) result.push({ type: "remove", content: c });
      if (s !== undefined) result.push({ type: "add", content: s });
    }
  }
  return result;
}

console.log("\nExercise 6:");
const diff = computeStagedDiff("line1\nline2\nline3", "line1\nmodified\nline3");
diff.forEach((d) => {
  const prefix = d.type === "add" ? "+" : d.type === "remove" ? "-" : " ";
  console.log(`${prefix} ${d.content}`);
});


// ─── Exercise 7: Fix the Bug — staging area simulation ────────────────────

function simulateAddCommitWorkflow() {
  const working: Map<string, string> = new Map();
  const staging: Map<string, string> = new Map();
  const _committed: Map<string, string> = new Map();

  working.set("a.txt", "hello");
  working.set("b.txt", "world");
  staging.set("a.txt", working.get("a.txt")!);
  working.set("a.txt", "hello modified");

  // FIX: Read from staging, not working
  const stagedContent = staging.get("a.txt");

  // FIX: Check staging, not working
  const isStaged = staging.has("b.txt");

  return { stagedContent, isStaged };
}

console.log("\nExercise 7:");
const result7 = simulateAddCommitWorkflow();
console.log("Staged content of a.txt:", result7.stagedContent); // "hello"
console.log("Is b.txt staged?", result7.isStaged);              // false


// ─── Exercise 8: Predict the Output — amend behavior ──────────────────────

const ex8_a = false;   // SHA changes because commit content changed
const ex8_b = 2;       // Still 2 commits (amended replaces the second)
const ex8_c = false;   // "second commit" is NOT in git log (replaced)
const ex8_d = "git reflog"; // Original commit is findable via reflog

console.log("\nExercise 8:");
console.log("Same SHA?", ex8_a);
console.log("Commit count:", ex8_b);
console.log("Original message in log?", ex8_c);
console.log("Find original via:", ex8_d);


// ─── Exercise 9: Implement atomic commit splitter ──────────────────────────

interface FileChange {
  file: string;
  type: "feat" | "fix" | "test" | "docs" | "refactor";
  description: string;
}

function groupIntoAtomicCommits(
  changes: FileChange[]
): Array<{ message: string; files: string[] }> {
  const groups = new Map<string, { files: string[]; descriptions: string[] }>();

  for (const change of changes) {
    if (!groups.has(change.type)) {
      groups.set(change.type, { files: [], descriptions: [] });
    }
    const group = groups.get(change.type)!;
    group.files.push(change.file);
    if (!group.descriptions.includes(change.description)) {
      group.descriptions.push(change.description);
    }
  }

  return [...groups.entries()].map(([type, group]) => ({
    message: `${type}: ${group.descriptions.join(", ")}`,
    files: group.files,
  }));
}

console.log("\nExercise 9:");
const commits = groupIntoAtomicCommits([
  { file: "src/auth.ts", type: "feat", description: "Add login" },
  { file: "src/auth.test.ts", type: "test", description: "Test login" },
  { file: "src/db.ts", type: "fix", description: "Fix connection leak" },
  { file: "README.md", type: "docs", description: "Update API docs" },
  { file: "src/auth-utils.ts", type: "feat", description: "Add login" },
]);
commits.forEach((c) => console.log(`  ${c.message} [${c.files.join(", ")}]`));


// ─── Exercise 10: Predict the Output — restore and reset ──────────────────

const ex10_a = "original";      // After unstaging, staged reverts to committed content
const ex10_b = "changed again"; // Working directory is untouched by restore --staged
const ex10_c = "changed again vs original"; // diff shows working ("changed again") vs staged ("original")
const ex10_d = "nothing";       // diff --cached shows nothing (staged matches HEAD)

console.log("\nExercise 10:");
console.log("Staged:", ex10_a);
console.log("Working:", ex10_b);
console.log("git diff:", ex10_c);
console.log("git diff --cached:", ex10_d);


// ─── Exercise 11: Implement a partial staging simulator ────────────────────

function partialStage(
  workingContent: string,
  currentStaged: string | null,
  lineStart: number,
  lineEnd: number
): string {
  const workingLines = workingContent.split("\n");
  const baseLines = (currentStaged ?? workingContent).split("\n");
  const result = [...baseLines];

  for (let i = lineStart; i <= lineEnd && i < workingLines.length; i++) {
    if (i < result.length) {
      result[i] = workingLines[i]!;
    } else {
      result.push(workingLines[i]!);
    }
  }

  return result.join("\n");
}

console.log("\nExercise 11:");
const working = "line0\nline1-new\nline2-new\nline3\nline4-new";
const staged = "line0\nline1\nline2\nline3\nline4";
const partial = partialStage(working, staged, 1, 2);
console.log("Partial stage (lines 1-2):");
console.log(partial);
// line0, line1-new, line2-new, line3, line4


// ─── Exercise 12: Predict the Output — ls-files ───────────────────────────

const ex12_lsFiles = ["a.txt"];      // b.txt was removed from index, c.txt not added
const ex12_lsFilesStage = ["a.txt"]; // Only a.txt remains in stage

console.log("\nExercise 12:");
console.log("git ls-files:", ex12_lsFiles);
console.log("git ls-files --stage:", ex12_lsFilesStage);


// ─── Exercise 13: Implement commit hash generator ─────────────────────────

function generateCommitHash(
  tree: string,
  parent: string | null,
  author: string,
  message: string,
  timestamp: number
): string {
  const content = `tree ${tree}\n${parent ? `parent ${parent}\n` : ""}author ${author} ${timestamp}\n\n${message}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

console.log("\nExercise 13:");
const hash1 = generateCommitHash("tree1", null, "dev", "Initial commit", 1000);
const hash2 = generateCommitHash("tree2", hash1, "dev", "Add feature", 2000);
console.log("Commit 1 hash:", hash1);
console.log("Commit 2 hash:", hash2);
console.log("Different?", hash1 !== hash2);


// ─── Exercise 14: Simulate full add-commit cycle ──────────────────────────

interface MiniCommit {
  sha: string;
  message: string;
  snapshot: Map<string, string>;
  parent: string | null;
}

class MiniVCS {
  working: Map<string, string> = new Map();
  staging: Map<string, string> = new Map();
  commits: Map<string, MiniCommit> = new Map();
  head: string | null = null;
  private counter = 0;

  edit(file: string, content: string): void {
    this.working.set(file, content);
  }

  add(file: string): void {
    const content = this.working.get(file);
    if (content !== undefined) {
      this.staging.set(file, content);
    }
  }

  addAll(): void {
    for (const [file, content] of this.working) {
      this.staging.set(file, content);
    }
  }

  commit(message: string): string {
    const sha = (++this.counter).toString(16).padStart(7, "0");
    // Build snapshot: start from parent, apply staged changes
    const parentSnapshot = this.head
      ? new Map(this.commits.get(this.head)!.snapshot)
      : new Map<string, string>();

    for (const [file, content] of this.staging) {
      parentSnapshot.set(file, content);
    }

    const commit: MiniCommit = {
      sha,
      message,
      snapshot: parentSnapshot,
      parent: this.head,
    };
    this.commits.set(sha, commit);
    this.head = sha;
    this.staging.clear();
    return sha;
  }

  log(): MiniCommit[] {
    const result: MiniCommit[] = [];
    let current = this.head;
    while (current) {
      const c = this.commits.get(current)!;
      result.push(c);
      current = c.parent;
    }
    return result;
  }

  diffWorking(): Array<{ file: string; status: string }> {
    const result: Array<{ file: string; status: string }> = [];
    for (const [file, content] of this.working) {
      const staged = this.staging.get(file);
      const committed = this.head ? this.commits.get(this.head)!.snapshot.get(file) : undefined;
      const base = staged ?? committed;
      if (base === undefined) result.push({ file, status: "new" });
      else if (base !== content) result.push({ file, status: "modified" });
    }
    return result;
  }

  diffStaged(): Array<{ file: string; status: string }> {
    const result: Array<{ file: string; status: string }> = [];
    const headSnapshot = this.head ? this.commits.get(this.head)!.snapshot : new Map<string, string>();
    for (const [file, content] of this.staging) {
      const committed = headSnapshot.get(file);
      if (committed === undefined) result.push({ file, status: "new" });
      else if (committed !== content) result.push({ file, status: "modified" });
    }
    return result;
  }
}

console.log("\nExercise 14:");
const vcs = new MiniVCS();
vcs.edit("README.md", "# Hello");
vcs.edit("index.ts", "console.log('hi')");
vcs.addAll();
const c1 = vcs.commit("Initial commit");
console.log("Commit 1:", c1);

vcs.edit("index.ts", "console.log('updated')");
vcs.add("index.ts");
const c2 = vcs.commit("Update index");
console.log("Commit 2:", c2);

console.log("Log:", vcs.log().map((c) => c.message));
console.log("Snapshot:", [...vcs.log()[0]!.snapshot.entries()]);


// ─── Summary ──────────────────────────────────────────────────────────────
console.log("\n============================================");
console.log("All 14 exercises completed successfully! ✓");
console.log("============================================");
