// ============================================================================
// 03-status-log: Exercises
// ============================================================================
// Run:  npx tsx 08-git/01-basics/03-status-log/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 14 exercises covering git status, git log, reflog, HEAD
// ============================================================================

// Exercise 1: Predict the Output — git status states
// ----------------------------------------------------------------------------
// Given this sequence:
//   git init && echo "a" > a.txt && git add a.txt && git commit -m "init"
//   echo "b" > b.txt          # new untracked file
//   echo "mod" > a.txt        # modify tracked file
//   echo "c" > c.txt && git add c.txt  # new file, staged
//
// Categorize each file under the correct git status section:
const ex1_staged: string[] = [];     // TODO: files in "Changes to be committed"
const ex1_unstaged: string[] = [];   // TODO: files in "Changes not staged for commit"
const ex1_untracked: string[] = [];  // TODO: files in "Untracked files"


// Exercise 2: Implement a simple status tracker
// ----------------------------------------------------------------------------
type FileStatus = "untracked" | "staged" | "modified" | "deleted" | "clean";

class StatusTracker {
  private committed: Map<string, string> = new Map();
  private staged: Map<string, string> = new Map();
  private working: Map<string, string> = new Map();

  // TODO: Implement all methods
  commitFiles(files: Map<string, string>): void {
    for (const [k, v] of files) {
      this.committed.set(k, v);
      this.staged.set(k, v);
      this.working.set(k, v);
    }
  }

  editFile(_name: string, _content: string): void {}
  addFile(_name: string, _content: string): void {}
  stageFile(_name: string): void {}
  deleteFile(_name: string): void {}

  getStatus(_name: string): FileStatus {
    return "clean";
  }

  getAllStatuses(): Map<string, FileStatus> {
    return new Map();
  }
}


// Exercise 3: Predict the Output — git log formats
// ----------------------------------------------------------------------------
// Given 3 commits:
//   SHA: aaa1111 | Author: Alice | Date: 2024-01-01 | Message: "Initial commit"
//   SHA: bbb2222 | Author: Bob   | Date: 2024-01-02 | Message: "Add feature"
//   SHA: ccc3333 | Author: Alice | Date: 2024-01-03 | Message: "Fix bug"
//
// What does each command show?
// a) git log --oneline
// b) git log --author="Bob"
// c) git log --since="2024-01-02"

const ex3_a_count: number = 0;   // TODO: how many lines does --oneline show?
const ex3_b_count: number = 0;   // TODO: how many commits by Bob?
const ex3_c_count: number = 0;   // TODO: how many commits since Jan 2?


// Exercise 4: Implement a commit log
// ----------------------------------------------------------------------------
interface LogEntry {
  sha: string;
  author: string;
  date: Date;
  message: string;
  parentSha: string | null;
}

class CommitLog {
  private entries: Map<string, LogEntry> = new Map();
  private head: string | null = null;

  addEntry(entry: LogEntry): void {
    this.entries.set(entry.sha, entry);
    this.head = entry.sha;
  }

  // TODO: Return all entries from HEAD to root
  log(): LogEntry[] { return []; }

  // TODO: Return entries in --oneline format: "sha_short message"
  logOneline(): string[] { return []; }

  // TODO: Filter by author
  logByAuthor(_author: string): LogEntry[] { return []; }

  // TODO: Filter by date (since)
  logSince(_date: Date): LogEntry[] { return []; }

  // TODO: Return count of commits
  count(): number { return 0; }
}


// Exercise 5: Predict the Output — reflog
// ----------------------------------------------------------------------------
// Given these operations:
//   git init && git commit --allow-empty -m "C1"    # HEAD@{4}
//   git commit --allow-empty -m "C2"                 # HEAD@{3}
//   git checkout -b feature                          # HEAD@{2}
//   git commit --allow-empty -m "C3"                 # HEAD@{1}
//   git checkout main                                # HEAD@{0}
//
// a) What commit is HEAD pointing to now?
// b) What does HEAD@{1} reference?
// c) If you run `git reflog`, how many entries are there?

const ex5_a: string = ""; // TODO: which commit message
const ex5_b: string = ""; // TODO: what was HEAD before current position
const ex5_c: number = 0;  // TODO: reflog entry count


// Exercise 6: Implement a reflog
// ----------------------------------------------------------------------------
interface ReflogEntry {
  sha: string;
  action: string;  // e.g., "commit", "checkout", "reset"
  message: string;
  timestamp: number;
}

class Reflog {
  private entries: ReflogEntry[] = [];

  // TODO: Add an entry to the reflog
  record(_sha: string, _action: string, _message: string): void {}

  // TODO: Get entry by HEAD@{n} notation
  getEntry(_n: number): ReflogEntry | null { return null; }

  // TODO: Return all entries (most recent first)
  getAll(): ReflogEntry[] { return []; }

  // TODO: Return formatted output like git reflog
  format(): string[] { return []; }
}


// Exercise 7: Predict the Output — HEAD references
// ----------------------------------------------------------------------------
// What does each reference resolve to?
//   HEAD      — current commit
//   HEAD~1    — parent of HEAD
//   HEAD~2    — grandparent of HEAD
//   HEAD^1    — first parent of HEAD
//   HEAD^2    — second parent of HEAD (merge commits only)
//
// Given linear history: C1 <- C2 <- C3 (HEAD)
// a) HEAD~1 = ?
// b) HEAD~2 = ?
// c) HEAD^1 = ?
// d) HEAD^2 = ?

const ex7_a: string = ""; // TODO
const ex7_b: string = ""; // TODO
const ex7_c: string = ""; // TODO
const ex7_d: string = ""; // TODO


// Exercise 8: Implement HEAD reference resolver
// ----------------------------------------------------------------------------
interface SimpleCommit {
  sha: string;
  message: string;
  parents: string[]; // can have 0, 1, or 2 parents
}

function resolveRef(
  _commits: Map<string, SimpleCommit>,
  _headSha: string,
  _ref: string
): string | null {
  // TODO: Parse refs like "HEAD", "HEAD~1", "HEAD~3", "HEAD^2"
  // ~ means follow first parent N times
  // ^ means select Nth parent (1-indexed)
  return null;
}


// Exercise 9: Predict the Output — short status
// ----------------------------------------------------------------------------
// git status -s (short format) uses two-character codes:
//   XY where X=staging status, Y=working tree status
//   M=modified, A=added, D=deleted, ?=untracked, !=ignored
//
// Given:
//   File staged and modified: what code?
//   New file staged: what code?
//   Untracked file: what code?
//   Deleted from working tree (tracked): what code?

const ex9_stagedAndModified: string = ""; // TODO
const ex9_newStaged: string = "";          // TODO
const ex9_untracked: string = "";          // TODO
const ex9_deletedWorking: string = "";     // TODO


// Exercise 10: Implement short status formatter
// ----------------------------------------------------------------------------
function formatShortStatus(
  _files: Array<{
    name: string;
    inIndex: boolean;
    inWorking: boolean;
    indexStatus: "added" | "modified" | "deleted" | "unchanged";
    workingStatus: "modified" | "deleted" | "unchanged" | "untracked";
  }>
): string[] {
  // TODO: Return formatted status lines like "MM file.txt", "A  file.txt", "?? file.txt"
  return [];
}


// Exercise 11: Fix the Bug — log traversal
// ----------------------------------------------------------------------------
function buggyLogTraversal(commits: Map<string, { message: string; parent: string | null }>, head: string): string[] {
  const result: string[] = [];
  let current: string | null = head;
  while (current) {
    const commit = commits.get(current);
    if (!commit) break;
    result.push(commit.message);
    current = commit.parent;
    // BUG: missing break condition for circular references
    // BUG: result should be limited to prevent infinite loops
  }
  return result;
}


// Exercise 12: Implement graph log visualization
// ----------------------------------------------------------------------------
// Simulate `git log --graph --oneline` for a simple branch/merge history.
function formatGraphLog(
  _commits: Array<{
    sha: string;
    message: string;
    parents: string[];
    branch?: string;
  }>
): string[] {
  // TODO: Return formatted lines like:
  // "* abc1234 Fix bug"
  // "|\\"
  // "| * def5678 Feature work"
  // "|/"
  // "* ghi9012 Initial"
  return [];
}


// Exercise 13: Predict the Output — log with graph
// ----------------------------------------------------------------------------
// Given:
//   main:    C1 --- C2 --- C5 (merge)
//                \       /
//   feature:      C3 --- C4
//
// How many commits does `git log --oneline` show on main?
// How many with `git log --oneline --all`?

const ex13_mainLog: number = 0;  // TODO
const ex13_allLog: number = 0;   // TODO


// Exercise 14: Build a complete status/log system
// ----------------------------------------------------------------------------
class GitStatusLog {
  private commits: Map<string, LogEntry> = new Map();
  private reflog: ReflogEntry[] = [];
  private head: string | null = null;
  private files: Map<string, { committed: string; staged: string; working: string }> = new Map();

  // TODO: Implement commit, checkout, getStatus, getLog, getReflog
  addCommit(_entry: LogEntry): void {}
  getLog(): LogEntry[] { return []; }
  getReflog(): ReflogEntry[] { return []; }
  getCurrentHead(): string | null { return this.head; }
}

export {
  StatusTracker,
  CommitLog,
  Reflog,
  resolveRef,
  formatShortStatus,
  buggyLogTraversal,
  formatGraphLog,
  GitStatusLog,
  ex1_staged, ex1_unstaged, ex1_untracked,
  ex3_a_count, ex3_b_count, ex3_c_count,
  ex5_a, ex5_b, ex5_c,
  ex7_a, ex7_b, ex7_c, ex7_d,
  ex9_stagedAndModified, ex9_newStaged, ex9_untracked, ex9_deletedWorking,
  ex13_mainLog, ex13_allLog,
};
export type { FileStatus, LogEntry, ReflogEntry, SimpleCommit };
