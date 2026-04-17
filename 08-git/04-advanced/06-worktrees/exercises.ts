// ============================================================================
// Git Worktrees — Exercises
// ============================================================================
// Simulate git worktree management in TypeScript.
// Run: npx tsx exercises.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorktreeEntry {
  path: string;
  branch: string | null; // null = detached HEAD
  commitHash: string;
  isMain: boolean;
  locked: boolean;
  lockReason?: string;
}

interface WorktreeOperationResult {
  success: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Exercise 1 (Predict): Branch lock enforcement
// ---------------------------------------------------------------------------
// Given the following worktree state, predict what happens when we try to
// add a new worktree on the "main" branch.
//
// Current worktrees:
//   /repo          -> branch: main,    commit: abc1234, isMain: true
//   /repo-feature  -> branch: feature, commit: def5678, isMain: false
//
// Operation: addWorktree("/repo-hotfix", "main", "abc1234")
//
// What is the result?
// A) { success: true }
// B) { success: false, error: "branch 'main' is already checked out at '/repo'" }
// C) { success: false, error: "path '/repo-hotfix' already exists" }
//
// Your answer: ___

// ---------------------------------------------------------------------------
// Exercise 2 (Predict): Removing the main worktree
// ---------------------------------------------------------------------------
// Given a WorktreeManager with these worktrees:
//   /repo          -> branch: main, isMain: true
//   /repo-feature  -> branch: feature, isMain: false
//
// Operation: removeWorktree("/repo")
//
// What is the result?
// A) { success: true } — main worktree removed
// B) { success: false, error: "cannot remove the main worktree" }
// C) { success: false, error: "worktree has uncommitted changes" }
//
// Your answer: ___

// ---------------------------------------------------------------------------
// Exercise 3 (Predict): Removing a locked worktree
// ---------------------------------------------------------------------------
// Given:
//   /repo          -> main, isMain: true, locked: false
//   /repo-feature  -> feature, isMain: false, locked: true, reason: "on USB"
//
// Operation: removeWorktree("/repo-feature")  (without force)
//
// What is the result?
// A) { success: true }
// B) { success: false, error: "worktree is locked: on USB" }
// C) { success: false, error: "cannot remove the main worktree" }
//
// Your answer: ___

// ---------------------------------------------------------------------------
// Exercise 4 (Fix): Branch lookup is broken
// ---------------------------------------------------------------------------
// The findWorktreeByBranch method should return the worktree checked out on
// a given branch, but it always returns undefined. Fix the bug.

function findWorktreeByBranchBuggy(
  worktrees: WorktreeEntry[],
  branch: string
): WorktreeEntry | undefined {
  for (const wt of worktrees) {
    if (wt.branch === branch) {
      return undefined; // BUG
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Exercise 5 (Fix): Prune logic removes active worktrees
// ---------------------------------------------------------------------------
// The pruneWorktrees function should only remove entries whose path is in the
// `deletedPaths` set. But it currently removes everything that ISN'T deleted.
// Fix the filter condition.

function pruneWorktreesBuggy(
  worktrees: WorktreeEntry[],
  deletedPaths: Set<string>
): WorktreeEntry[] {
  return worktrees.filter((wt) => !deletedPaths.has(wt.path)); // BUG — inverted logic
}

// ---------------------------------------------------------------------------
// Exercise 6 (Implement): WorktreeManager class
// ---------------------------------------------------------------------------
// Implement the WorktreeManager class skeleton below. The constructor receives
// the main worktree's path, branch, and commit hash.

class WorktreeManager {
  private worktrees: WorktreeEntry[] = [];

  constructor(mainPath: string, mainBranch: string, mainCommit: string) {
    // TODO: initialise the worktrees array with the main worktree entry
    void mainPath;
    void mainBranch;
    void mainCommit;
  }

  getAll(): WorktreeEntry[] {
    return [...this.worktrees];
  }

  // Used by later exercises
  protected _addEntry(entry: WorktreeEntry): void {
    this.worktrees.push(entry);
  }

  protected _removeEntry(path: string): void {
    this.worktrees = this.worktrees.filter((wt) => wt.path !== path);
  }

  protected _findByPath(path: string): WorktreeEntry | undefined {
    return this.worktrees.find((wt) => wt.path === path);
  }

  protected _findByBranch(branch: string): WorktreeEntry | undefined {
    return this.worktrees.find((wt) => wt.branch === branch);
  }
}

// ---------------------------------------------------------------------------
// Exercise 7 (Implement): addWorktree
// ---------------------------------------------------------------------------
// Add a method `addWorktree` to WorktreeManager that:
// - Fails if the path already exists as a worktree
// - Fails if the branch (when not null) is already checked out
// - Otherwise creates a new linked worktree entry
//
// Signature:
//   addWorktree(path: string, branch: string | null, commit: string): WorktreeOperationResult

// ---------------------------------------------------------------------------
// Exercise 8 (Implement): removeWorktree
// ---------------------------------------------------------------------------
// Add a method `removeWorktree` that:
// - Fails if the path is the main worktree
// - Fails if the worktree is locked (include lock reason in error)
// - Fails if the path doesn't exist
// - Otherwise removes the worktree entry
//
// Signature:
//   removeWorktree(path: string): WorktreeOperationResult

// ---------------------------------------------------------------------------
// Exercise 9 (Implement): lockWorktree / unlockWorktree
// ---------------------------------------------------------------------------
// Add methods to lock and unlock a worktree by path.
// - lock: fails if already locked or path not found
// - unlock: fails if not locked or path not found
//
// Signatures:
//   lockWorktree(path: string, reason?: string): WorktreeOperationResult
//   unlockWorktree(path: string): WorktreeOperationResult

// ---------------------------------------------------------------------------
// Exercise 10 (Implement): pruneStale
// ---------------------------------------------------------------------------
// Add a method `pruneStale(existingPaths: Set<string>)` that removes any
// linked worktree entries whose paths are NOT in the provided set.
// The main worktree must never be pruned. Return the count of pruned entries.
//
// Signature:
//   pruneStale(existingPaths: Set<string>): number

// ============================================================================
// Tests (all commented out — uncomment after implementing)
// ============================================================================

/*
function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

// --- Exercise 1 test ---
// (Covered by Exercise 7 addWorktree tests)

// --- Exercise 4 test ---
const testWorktrees: WorktreeEntry[] = [
  { path: "/repo", branch: "main", commitHash: "abc", isMain: true, locked: false },
  { path: "/repo-ft", branch: "feature", commitHash: "def", isMain: false, locked: false },
];
const found = findWorktreeByBranchFixed(testWorktrees, "feature");
assert(found?.path === "/repo-ft", "Ex4: should find worktree by branch");
assert(findWorktreeByBranchFixed(testWorktrees, "nope") === undefined, "Ex4: missing branch");

// --- Exercise 5 test ---
const staleSet = new Set(["/repo-ft"]);
const afterPrune = pruneWorktreesFixed(testWorktrees, staleSet);
assert(afterPrune.length === 1, "Ex5: should keep only non-deleted");
assert(afterPrune[0].path === "/repo", "Ex5: should keep /repo");

// --- Exercise 6 test ---
const mgr = new WorktreeManager("/repo", "main", "aaa111");
assert(mgr.getAll().length === 1, "Ex6: should have main worktree");
assert(mgr.getAll()[0].isMain === true, "Ex6: main worktree isMain");

// --- Exercise 7 tests ---
const r1 = mgr.addWorktree("/repo-ft", "feature", "bbb222");
assert(r1.success === true, "Ex7: add should succeed");
assert(mgr.getAll().length === 2, "Ex7: should have 2 worktrees");

const r2 = mgr.addWorktree("/repo-ft", "other", "ccc333");
assert(r2.success === false, "Ex7: duplicate path should fail");

const r3 = mgr.addWorktree("/repo-ft2", "main", "aaa111");
assert(r3.success === false, "Ex7: duplicate branch should fail");

const r4 = mgr.addWorktree("/repo-detached", null, "ddd444");
assert(r4.success === true, "Ex7: detached HEAD should succeed");

// --- Exercise 8 tests ---
const r5 = mgr.removeWorktree("/repo");
assert(r5.success === false, "Ex8: cannot remove main");

const r6 = mgr.removeWorktree("/nonexistent");
assert(r6.success === false, "Ex8: nonexistent path");

const r7 = mgr.removeWorktree("/repo-ft");
assert(r7.success === true, "Ex8: remove linked worktree");
assert(mgr.getAll().length === 2, "Ex8: should have 2 remaining");

// --- Exercise 9 tests ---
mgr.addWorktree("/repo-lock-test", "lockbranch", "eee555");
const r8 = mgr.lockWorktree("/repo-lock-test", "on USB drive");
assert(r8.success === true, "Ex9: lock should succeed");

const r9 = mgr.lockWorktree("/repo-lock-test");
assert(r9.success === false, "Ex9: already locked");

const r10 = mgr.removeWorktree("/repo-lock-test");
assert(r10.success === false, "Ex9: remove locked should fail");

const r11 = mgr.unlockWorktree("/repo-lock-test");
assert(r11.success === true, "Ex9: unlock should succeed");

const r12 = mgr.unlockWorktree("/repo-lock-test");
assert(r12.success === false, "Ex9: already unlocked");

// --- Exercise 10 tests ---
mgr.addWorktree("/repo-stale1", "stale1", "fff666");
mgr.addWorktree("/repo-stale2", "stale2", "ggg777");
const existing = new Set(["/repo", "/repo-detached", "/repo-lock-test"]);
const pruned = mgr.pruneStale(existing);
assert(pruned === 2, "Ex10: should prune 2 stale worktrees");
assert(mgr.getAll().every((wt) => existing.has(wt.path) || wt.isMain), "Ex10: only existing remain");

console.log("All exercise tests passed!");
*/

console.log("Exercises loaded. Uncomment tests after implementing solutions.");
