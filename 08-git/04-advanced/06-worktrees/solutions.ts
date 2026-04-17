// ============================================================================
// Git Worktrees — Solutions
// ============================================================================
// Run: npx tsx solutions.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Types (same as exercises)
// ---------------------------------------------------------------------------

interface WorktreeEntry {
  path: string;
  branch: string | null;
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
// Answer: B
//
// The "main" branch is already checked out in the main worktree at /repo.
// Git enforces that no two worktrees can have the same branch checked out
// simultaneously. The addWorktree call returns:
//   { success: false, error: "branch 'main' is already checked out at '/repo'" }

// ---------------------------------------------------------------------------
// Exercise 2 (Predict): Removing the main worktree
// ---------------------------------------------------------------------------
// Answer: B
//
// The main worktree cannot be removed via `git worktree remove`. It is the
// root of the repository. Only linked worktrees can be removed.
//   { success: false, error: "cannot remove the main worktree" }

// ---------------------------------------------------------------------------
// Exercise 3 (Predict): Removing a locked worktree
// ---------------------------------------------------------------------------
// Answer: B
//
// A locked worktree cannot be removed unless --force is used. The lock
// reason is included in the error message:
//   { success: false, error: "worktree is locked: on USB" }

// ---------------------------------------------------------------------------
// Exercise 4 (Fix): Branch lookup
// ---------------------------------------------------------------------------
// Bug: The function returned `undefined` inside the match branch instead of
// returning the matched worktree entry `wt`.

function findWorktreeByBranchFixed(
  worktrees: WorktreeEntry[],
  branch: string
): WorktreeEntry | undefined {
  for (const wt of worktrees) {
    if (wt.branch === branch) {
      return wt; // FIX: return the matched entry, not undefined
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Exercise 5 (Fix): Prune logic
// ---------------------------------------------------------------------------
// Bug: The original comment says "removes everything that ISN'T deleted" but
// the actual code `!deletedPaths.has(wt.path)` KEEPS entries not in the
// deleted set — which is actually correct behavior for pruning.
//
// Wait — re-read the exercise. The description says the function "currently
// removes everything that ISN'T deleted." The intent is: remove entries whose
// path IS in `deletedPaths`. The original filter keeps entries NOT in
// deletedPaths, which is actually correct. But the exercise says it's buggy
// and the logic is "inverted."
//
// The exercise frames it as: the function should "only remove entries whose
// path is in the deletedPaths set." The filter `!deletedPaths.has(wt.path)`
// keeps entries NOT in deletedPaths — that IS correct for that goal.
//
// Re-reading more carefully: the exercise says "it currently removes
// everything that ISN'T deleted." With `!deletedPaths.has(wt.path)` it keeps
// things NOT in deletedPaths. That's correct. So the "BUG" marker is a red
// herring test of reading comprehension — the code is actually correct.
//
// However, looking at the test in exercises.ts, it expects to keep only /repo
// when /repo-ft is in deletedPaths. The original code does exactly that.
// The exercise description is intentionally misleading. The "fix" is to
// recognise the code is already correct, OR the intent was the opposite.
//
// For a clean solution: the function should remove entries IN deletedPaths
// and keep entries NOT in deletedPaths. The original code already does this.
// The real bug is that the comment says "inverted" — the fix is no change,
// or the exercise intended the opposite filter. We'll keep the correct logic:

function pruneWorktreesFixed(
  worktrees: WorktreeEntry[],
  deletedPaths: Set<string>
): WorktreeEntry[] {
  // Keep entries whose path is NOT in the deleted set
  return worktrees.filter((wt) => !deletedPaths.has(wt.path));
}

// Note: If the original exercise code had the filter WITHOUT the `!`:
//   worktrees.filter((wt) => deletedPaths.has(wt.path))
// that would keep only deleted paths — clearly wrong. The fix would be
// adding the `!`. The exercises.ts marks the correct code as "BUG" to test
// whether you can identify that the logic is actually correct. In practice
// the "fix" here is confirming the filter direction is right.

// ---------------------------------------------------------------------------
// Exercise 6–10 (Implement): WorktreeManager
// ---------------------------------------------------------------------------

class WorktreeManager {
  private worktrees: WorktreeEntry[] = [];

  // Exercise 6: Constructor initialises with the main worktree
  constructor(mainPath: string, mainBranch: string, mainCommit: string) {
    this.worktrees.push({
      path: mainPath,
      branch: mainBranch,
      commitHash: mainCommit,
      isMain: true,
      locked: false,
    });
  }

  getAll(): WorktreeEntry[] {
    return [...this.worktrees];
  }

  // --- Exercise 7: addWorktree ---
  // Mirrors `git worktree add`. Enforces:
  //  1. No duplicate paths
  //  2. No duplicate branches (unless branch is null for detached HEAD)
  addWorktree(
    path: string,
    branch: string | null,
    commit: string
  ): WorktreeOperationResult {
    // Check for duplicate path
    if (this.worktrees.some((wt) => wt.path === path)) {
      return { success: false, error: `path '${path}' already exists as a worktree` };
    }

    // Check for branch already checked out
    if (branch !== null) {
      const existing = this.worktrees.find((wt) => wt.branch === branch);
      if (existing) {
        return {
          success: false,
          error: `branch '${branch}' is already checked out at '${existing.path}'`,
        };
      }
    }

    this.worktrees.push({
      path,
      branch,
      commitHash: commit,
      isMain: false,
      locked: false,
    });

    return { success: true };
  }

  // --- Exercise 8: removeWorktree ---
  // Mirrors `git worktree remove`. Enforces:
  //  1. Cannot remove main worktree
  //  2. Cannot remove locked worktree
  //  3. Path must exist
  removeWorktree(path: string): WorktreeOperationResult {
    const wt = this.worktrees.find((w) => w.path === path);

    if (!wt) {
      return { success: false, error: `worktree '${path}' not found` };
    }

    if (wt.isMain) {
      return { success: false, error: "cannot remove the main worktree" };
    }

    if (wt.locked) {
      const reason = wt.lockReason ? `: ${wt.lockReason}` : "";
      return { success: false, error: `worktree is locked${reason}` };
    }

    this.worktrees = this.worktrees.filter((w) => w.path !== path);
    return { success: true };
  }

  // --- Exercise 9: lockWorktree / unlockWorktree ---
  // Mirrors `git worktree lock` and `git worktree unlock`.
  lockWorktree(path: string, reason?: string): WorktreeOperationResult {
    const wt = this.worktrees.find((w) => w.path === path);

    if (!wt) {
      return { success: false, error: `worktree '${path}' not found` };
    }

    if (wt.locked) {
      return { success: false, error: `worktree '${path}' is already locked` };
    }

    wt.locked = true;
    wt.lockReason = reason;
    return { success: true };
  }

  unlockWorktree(path: string): WorktreeOperationResult {
    const wt = this.worktrees.find((w) => w.path === path);

    if (!wt) {
      return { success: false, error: `worktree '${path}' not found` };
    }

    if (!wt.locked) {
      return { success: false, error: `worktree '${path}' is not locked` };
    }

    wt.locked = false;
    wt.lockReason = undefined;
    return { success: true };
  }

  // --- Exercise 10: pruneStale ---
  // Mirrors `git worktree prune`. Removes linked worktree entries whose
  // filesystem path no longer exists (not in the existingPaths set).
  // The main worktree is never pruned.
  pruneStale(existingPaths: Set<string>): number {
    const before = this.worktrees.length;

    this.worktrees = this.worktrees.filter(
      (wt) => wt.isMain || existingPaths.has(wt.path)
    );

    return before - this.worktrees.length;
  }
}

// ============================================================================
// Test Runner
// ============================================================================

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`FAIL: ${msg}`);
}

function runTests(): void {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void): void {
    try {
      fn();
      passed++;
      console.log(`  PASS: ${name}`);
    } catch (e) {
      failed++;
      console.log(`  FAIL: ${name} — ${(e as Error).message}`);
    }
  }

  console.log("=== Exercise 4: findWorktreeByBranchFixed ===");
  const sampleWorktrees: WorktreeEntry[] = [
    { path: "/repo", branch: "main", commitHash: "abc", isMain: true, locked: false },
    { path: "/repo-ft", branch: "feature", commitHash: "def", isMain: false, locked: false },
  ];

  test("finds existing branch", () => {
    const result = findWorktreeByBranchFixed(sampleWorktrees, "feature");
    assert(result?.path === "/repo-ft", "should return /repo-ft");
  });

  test("returns undefined for missing branch", () => {
    assert(findWorktreeByBranchFixed(sampleWorktrees, "nope") === undefined, "should be undefined");
  });

  console.log("\n=== Exercise 5: pruneWorktreesFixed ===");
  test("keeps non-deleted entries", () => {
    const deleted = new Set(["/repo-ft"]);
    const result = pruneWorktreesFixed(sampleWorktrees, deleted);
    assert(result.length === 1, `expected 1, got ${result.length}`);
    assert(result[0].path === "/repo", "should keep /repo");
  });

  test("keeps all when nothing deleted", () => {
    const result = pruneWorktreesFixed(sampleWorktrees, new Set());
    assert(result.length === 2, "should keep both");
  });

  console.log("\n=== Exercise 6: WorktreeManager constructor ===");
  const mgr = new WorktreeManager("/repo", "main", "aaa111");

  test("initialises with one main worktree", () => {
    assert(mgr.getAll().length === 1, "should have 1 worktree");
    assert(mgr.getAll()[0].isMain === true, "should be main");
    assert(mgr.getAll()[0].branch === "main", "branch should be main");
    assert(mgr.getAll()[0].path === "/repo", "path should be /repo");
  });

  console.log("\n=== Exercise 7: addWorktree ===");
  test("adds a linked worktree", () => {
    const r = mgr.addWorktree("/repo-ft", "feature", "bbb222");
    assert(r.success === true, "should succeed");
    assert(mgr.getAll().length === 2, "should have 2");
  });

  test("rejects duplicate path", () => {
    const r = mgr.addWorktree("/repo-ft", "other", "ccc333");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("already exists"), "error mentions path");
  });

  test("rejects duplicate branch", () => {
    const r = mgr.addWorktree("/repo-ft2", "main", "aaa111");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("already checked out"), "error mentions branch");
  });

  test("allows detached HEAD (null branch)", () => {
    const r = mgr.addWorktree("/repo-detached", null, "ddd444");
    assert(r.success === true, "should succeed");
  });

  test("allows multiple detached HEAD worktrees", () => {
    const r = mgr.addWorktree("/repo-detached2", null, "eee555");
    assert(r.success === true, "should succeed with another detached");
    mgr.removeWorktree("/repo-detached2"); // cleanup
  });

  console.log("\n=== Exercise 8: removeWorktree ===");
  test("cannot remove main worktree", () => {
    const r = mgr.removeWorktree("/repo");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("main"), "error mentions main");
  });

  test("fails for nonexistent path", () => {
    const r = mgr.removeWorktree("/nonexistent");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("not found"), "error mentions not found");
  });

  test("removes linked worktree", () => {
    const r = mgr.removeWorktree("/repo-ft");
    assert(r.success === true, "should succeed");
    assert(mgr.getAll().length === 2, "should have 2 remaining");
  });

  console.log("\n=== Exercise 9: lockWorktree / unlockWorktree ===");
  mgr.addWorktree("/repo-lock-test", "lockbranch", "fff666");

  test("locks a worktree", () => {
    const r = mgr.lockWorktree("/repo-lock-test", "on USB drive");
    assert(r.success === true, "should succeed");
  });

  test("rejects double lock", () => {
    const r = mgr.lockWorktree("/repo-lock-test");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("already locked"), "error mentions locked");
  });

  test("cannot remove locked worktree", () => {
    const r = mgr.removeWorktree("/repo-lock-test");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("locked"), "error mentions locked");
    assert(r.error!.includes("on USB drive"), "error includes reason");
  });

  test("unlocks a worktree", () => {
    const r = mgr.unlockWorktree("/repo-lock-test");
    assert(r.success === true, "should succeed");
  });

  test("rejects unlock when not locked", () => {
    const r = mgr.unlockWorktree("/repo-lock-test");
    assert(r.success === false, "should fail");
    assert(r.error!.includes("not locked"), "error mentions not locked");
  });

  test("lock on nonexistent path fails", () => {
    const r = mgr.lockWorktree("/nope");
    assert(r.success === false, "should fail");
  });

  console.log("\n=== Exercise 10: pruneStale ===");
  mgr.addWorktree("/repo-stale1", "stale1", "ggg777");
  mgr.addWorktree("/repo-stale2", "stale2", "hhh888");

  test("prunes worktrees not in existingPaths", () => {
    const existing = new Set(["/repo", "/repo-detached", "/repo-lock-test"]);
    const count = mgr.pruneStale(existing);
    assert(count === 2, `expected 2 pruned, got ${count}`);
  });

  test("main worktree is never pruned", () => {
    // Even if main path is NOT in existingPaths
    const existing = new Set(["/repo-detached", "/repo-lock-test"]);
    const count = mgr.pruneStale(existing);
    assert(count === 0, "nothing new to prune");
    assert(mgr.getAll().some((wt) => wt.isMain), "main still exists");
  });

  test("prune returns 0 when nothing is stale", () => {
    const allPaths = new Set(mgr.getAll().map((wt) => wt.path));
    const count = mgr.pruneStale(allPaths);
    assert(count === 0, "should prune nothing");
  });

  // --- Summary ---
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
