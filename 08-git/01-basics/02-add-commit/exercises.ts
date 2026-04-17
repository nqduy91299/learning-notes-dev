// ============================================================================
// 02-add-commit: Exercises
// ============================================================================
// Run:  npx tsx 08-git/01-basics/02-add-commit/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 14 exercises covering staging area, git add, git commit
// ============================================================================

// Exercise 1: Predict the Output — staging states
// ----------------------------------------------------------------------------
// Given this sequence, what is the status of each file?
//
//   echo "hello" > a.txt
//   echo "world" > b.txt
//   git add a.txt
//   echo "modified" > a.txt
//
// What does `git status` show for a.txt? For b.txt?
// Hint: a.txt has BOTH staged and unstaged changes.

const ex1_a_staged: boolean = false;    // TODO: is a.txt in staging?
const ex1_a_modified: boolean = false;  // TODO: is a.txt modified in working dir?
const ex1_b_untracked: boolean = false; // TODO: is b.txt untracked?


// Exercise 2: Simulate a staging area
// ----------------------------------------------------------------------------
// Implement a StagingArea class that tracks three states: working, staged, committed.

interface FileState {
  working: string | null;   // Content in working directory (null = deleted)
  staged: string | null;    // Content in staging area
  committed: string | null; // Content in last commit
}

class StagingArea {
  private files: Map<string, FileState> = new Map();

  // TODO: Create or modify a file in the working directory
  editFile(_name: string, _content: string): void {}

  // TODO: Delete a file from working directory
  deleteFile(_name: string): void {}

  // TODO: Stage a file (copy working content to staged)
  add(_name: string): void {}

  // TODO: Unstage a file (revert staged to committed)
  unstage(_name: string): void {}

  // TODO: Commit all staged changes (copy staged to committed, clear staged)
  commit(): string[] {
    return []; // Return list of committed filenames
  }

  // TODO: Return the status of all files
  status(): Array<{ name: string; state: string }> {
    return [];
  }
}


// Exercise 3: Predict the Output — git add variations
// ----------------------------------------------------------------------------
// Repository structure:
//   project/
//   ├── src/
//   │   ├── index.ts (modified)
//   │   └── utils.ts (new, untracked)
//   ├── docs/
//   │   └── readme.txt (modified)
//   └── test.log (new, untracked, in .gitignore)
//
// Current directory: project/src/
//
// What gets staged with each command?
// a) git add .
// b) git add -A
// c) git add -u

const ex3_a: string[] = []; // TODO: filenames staged by `git add .` from src/
const ex3_b: string[] = []; // TODO: filenames staged by `git add -A`
const ex3_c: string[] = []; // TODO: filenames staged by `git add -u`


// Exercise 4: Implement a commit message validator
// ----------------------------------------------------------------------------
// Validate commit messages against conventional commit rules.

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateCommitMessage(_message: string): ValidationResult {
  // TODO: Check these rules:
  // 1. Subject line must not be empty
  // 2. Subject line must be <= 72 characters
  // 3. Subject must not end with a period
  // 4. Subject should start with a capital letter or conventional prefix
  // 5. If body exists, there must be a blank line between subject and body
  return { valid: true, errors: [] };
}


// Exercise 5: Predict the Output — commit -a behavior
// ----------------------------------------------------------------------------
// Given:
//   echo "new" > tracked.txt && git add tracked.txt && git commit -m "init"
//   echo "changed" > tracked.txt
//   echo "brand new" > untracked.txt
//   git commit -am "update"
//
// After the last commit:
// a) Is tracked.txt committed with "changed"?
// b) Is untracked.txt committed?
// c) What does `git status` show?

const ex5_a: boolean = false; // TODO
const ex5_b: boolean = false; // TODO
const ex5_c: string = "";     // TODO: what status shows for untracked.txt


// Exercise 6: Simulate git diff --cached
// ----------------------------------------------------------------------------
// Implement a function that computes the diff between staged and committed content.

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
}

function computeStagedDiff(
  _committed: string | null,
  _staged: string | null
): DiffLine[] {
  // TODO: Return diff lines comparing committed vs staged content
  // Split by newlines, compare line by line
  return [];
}


// Exercise 7: Fix the Bug — staging area simulation
// ----------------------------------------------------------------------------
// This function has bugs. Fix them.

function simulateAddCommitWorkflow() {
  const working: Map<string, string> = new Map();
  const staging: Map<string, string> = new Map();
  const _committed: Map<string, string> = new Map();

  // Edit files
  working.set("a.txt", "hello");
  working.set("b.txt", "world");

  // Stage a.txt
  staging.set("a.txt", working.get("a.txt")!);

  // Modify a.txt after staging
  working.set("a.txt", "hello modified");

  // BUG: This should return the STAGED version, not the working version
  const stagedContent = working.get("a.txt");

  // BUG: This should check staging, not working
  const isStaged = working.has("b.txt");

  return { stagedContent, isStaged };
}


// Exercise 8: Predict the Output — amend behavior
// ----------------------------------------------------------------------------
// Given:
//   git commit -m "first commit" --allow-empty  # SHA: aaa111
//   git commit -m "second commit" --allow-empty  # SHA: bbb222
//   git commit --amend -m "amended second"        # SHA: ???
//
// a) Does the SHA of the amended commit equal bbb222?
// b) How many commits are in the log?
// c) Is "second commit" message still visible in `git log`?
// d) Can you find the original commit?

const ex8_a: boolean = false; // TODO
const ex8_b: number = 0;      // TODO
const ex8_c: boolean = false;  // TODO
const ex8_d: string = "";      // TODO: where can you find it?


// Exercise 9: Implement atomic commit splitter
// ----------------------------------------------------------------------------
// Given a set of file changes, group them into atomic commits.

interface FileChange {
  file: string;
  type: "feat" | "fix" | "test" | "docs" | "refactor";
  description: string;
}

function groupIntoAtomicCommits(
  _changes: FileChange[]
): Array<{ message: string; files: string[] }> {
  // TODO: Group changes by type, create one commit per type
  // Message format: "<type>: <combined description>"
  return [];
}


// Exercise 10: Predict the Output — restore and reset
// ----------------------------------------------------------------------------
// Given:
//   echo "original" > file.txt && git add file.txt && git commit -m "init"
//   echo "changed" > file.txt
//   git add file.txt
//   echo "changed again" > file.txt
//
// Now: git restore --staged file.txt
//
// a) What is in staging for file.txt?
// b) What is in the working directory for file.txt?
// c) What does git diff show?
// d) What does git diff --cached show?

const ex10_a: string = ""; // TODO: content in staging
const ex10_b: string = ""; // TODO: content in working dir
const ex10_c: string = ""; // TODO: what diff shows (working vs staged)
const ex10_d: string = ""; // TODO: what diff --cached shows (staged vs HEAD)


// Exercise 11: Implement a partial staging simulator
// ----------------------------------------------------------------------------
// Simulate `git add -p` by staging specific line ranges from a file.

function partialStage(
  _workingContent: string,
  _currentStaged: string | null,
  _lineStart: number,
  _lineEnd: number
): string {
  // TODO: Return new staged content that includes lines lineStart-lineEnd
  // from workingContent, keeping other lines from currentStaged (or committed)
  return "";
}


// Exercise 12: Predict the Output — ls-files
// ----------------------------------------------------------------------------
// Given these operations:
//   git init && echo "a" > a.txt && echo "b" > b.txt
//   git add a.txt b.txt && git commit -m "init"
//   echo "modified" > a.txt
//   echo "c" > c.txt
//   git add a.txt
//   git rm --cached b.txt
//
// What does `git ls-files` show?
// What does `git ls-files --stage` show (which files)?

const ex12_lsFiles: string[] = [];      // TODO: filenames shown
const ex12_lsFilesStage: string[] = []; // TODO: filenames in stage output


// Exercise 13: Implement commit hash generator
// ----------------------------------------------------------------------------
// Git hashes commits using SHA-1 of: "commit <size>\0<content>"
// Implement a simplified version.

function generateCommitHash(
  _tree: string,
  _parent: string | null,
  _author: string,
  _message: string,
  _timestamp: number
): string {
  // TODO: Concatenate all fields into a string, then compute a simple hash
  // Use the same hash approach as Exercise 4 in 01-init-clone
  return "";
}


// Exercise 14: Simulate full add-commit cycle
// ----------------------------------------------------------------------------
// Build a mini version control system with working dir, staging, and commits.

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

  // TODO: Implement edit, add, commit, log, diff
  edit(_file: string, _content: string): void {}
  add(_file: string): void {}
  addAll(): void {}
  commit(_message: string): string { return ""; }
  log(): MiniCommit[] { return []; }
  diffWorking(): Array<{ file: string; status: string }> { return []; }
  diffStaged(): Array<{ file: string; status: string }> { return []; }
}

export {
  StagingArea,
  validateCommitMessage,
  computeStagedDiff,
  simulateAddCommitWorkflow,
  groupIntoAtomicCommits,
  partialStage,
  generateCommitHash,
  MiniVCS,
  ex1_a_staged, ex1_a_modified, ex1_b_untracked,
  ex3_a, ex3_b, ex3_c,
  ex5_a, ex5_b, ex5_c,
  ex8_a, ex8_b, ex8_c, ex8_d,
  ex10_a, ex10_b, ex10_c, ex10_d,
  ex12_lsFiles, ex12_lsFilesStage,
};
export type { FileState, ValidationResult, DiffLine, FileChange, MiniCommit };
