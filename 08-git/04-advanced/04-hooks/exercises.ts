// ============================================================================
// 04-hooks: Exercises
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/04-hooks/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering git hooks, hook runner system
// ============================================================================

// Exercise 1: Predict the Output — hook execution order
// During a commit, which hooks run and in what order?
const ex1_order: string[] = []; // TODO: list hook names in execution order

// Exercise 2: Implement a hook runner system
// ----------------------------------------------------------------------------
type HookName = "pre-commit" | "commit-msg" | "pre-push" | "post-commit" | "post-merge";

class HookRunner {
  private hooks: Map<HookName, Array<() => { success: boolean; output: string }>> = new Map();

  // TODO: Register a hook handler
  register(_name: HookName, _handler: () => { success: boolean; output: string }): void {}

  // TODO: Run all handlers for a hook, return aggregated result
  run(_name: HookName, _context?: Record<string, string>): { success: boolean; outputs: string[] } {
    return { success: true, outputs: [] };
  }

  // TODO: Check if a hook has handlers
  hasHook(_name: HookName): boolean { return false; }
}

// Exercise 3: Implement commit message validator hook
// ----------------------------------------------------------------------------
function commitMsgHook(_message: string): { success: boolean; error?: string } {
  // TODO: Validate conventional commit format
  // type(scope): description (50 chars max for subject)
  // Must start with: feat|fix|docs|style|refactor|test|chore
  return { success: true };
}

// Exercise 4: Predict the Output — hook exit codes
// a) pre-commit exits with 0 → what happens?
// b) pre-commit exits with 1 → what happens?
// c) commit-msg exits with 1 → what happens?
const ex4_a: string = ""; // TODO
const ex4_b: string = ""; // TODO
const ex4_c: string = ""; // TODO

// Exercise 5: Implement pre-commit lint checker
// ----------------------------------------------------------------------------
function preCommitLintCheck(
  _stagedFiles: string[],
  _lintRules: Map<string, RegExp> // file pattern → rule regex
): { pass: boolean; violations: Array<{ file: string; rule: string }> } {
  // TODO: Check staged files against lint rules
  return { pass: true, violations: [] };
}

// Exercise 6: Implement branch protection hook
// ----------------------------------------------------------------------------
function preCommitBranchCheck(_currentBranch: string, _protectedBranches: string[]): { allowed: boolean; message: string } {
  // TODO: Prevent direct commits to protected branches
  return { allowed: true, message: "" };
}

// Exercise 7: Fix the Bug — hook runner
// ----------------------------------------------------------------------------
function buggyHookRunner(hooks: Array<() => boolean>): boolean {
  // BUG 1: Should stop on first failure
  // BUG 2: Should return false if any hook fails
  let _result = true;
  for (const hook of hooks) {
    hook(); // BUG: ignores return value
  }
  return true; // BUG: always returns true
}

// Exercise 8: Implement lint-staged simulator
// ----------------------------------------------------------------------------
function lintStaged(
  _stagedFiles: string[],
  _config: Map<string, string[]> // glob pattern → commands
): { success: boolean; results: Array<{ file: string; command: string; pass: boolean }> } {
  // TODO: Match staged files to config patterns, "run" commands
  return { success: true, results: [] };
}

// Exercise 9: Predict the Output — --no-verify
// a) git commit --no-verify — which hooks are skipped?
// b) git push --no-verify — which hooks are skipped?
const ex9_a: string = ""; // TODO
const ex9_b: string = ""; // TODO

// Exercise 10: Implement husky config parser
// ----------------------------------------------------------------------------
function parseHuskyConfig(_configDir: string, _hookFiles: Map<string, string>): Map<HookName, string[]> {
  // TODO: Parse .husky directory structure into hook → commands map
  return new Map();
}

// Exercise 11: Implement pre-push test runner
// ----------------------------------------------------------------------------
function prePushHook(
  _commitsToPush: string[],
  _testRunner: () => { pass: boolean; failedTests: string[] }
): { allow: boolean; message: string } {
  // TODO: Run tests and decide whether to allow push
  return { allow: true, message: "" };
}

// Exercise 12: Implement issue reference checker
// ----------------------------------------------------------------------------
function requireIssueRef(_message: string): { valid: boolean; issueNumbers: string[] } {
  // TODO: Check that commit message references at least one issue (#123)
  return { valid: false, issueNumbers: [] };
}

// Exercise 13: Build complete hook management system
// ----------------------------------------------------------------------------
class GitHookSystem {
  private hooks: Map<string, Array<(ctx: Record<string, string>) => { ok: boolean; msg: string }>> = new Map();

  register(hook: string, fn: (ctx: Record<string, string>) => { ok: boolean; msg: string }): void {
    if (!this.hooks.has(hook)) this.hooks.set(hook, []);
    this.hooks.get(hook)!.push(fn);
  }

  trigger(hook: string, ctx: Record<string, string> = {}): { success: boolean; messages: string[] } {
    const handlers = this.hooks.get(hook) ?? [];
    const messages: string[] = [];
    for (const fn of handlers) {
      const r = fn(ctx);
      messages.push(r.msg);
      if (!r.ok) return { success: false, messages };
    }
    return { success: true, messages };
  }
}

export {
  HookRunner, commitMsgHook, preCommitLintCheck, preCommitBranchCheck,
  buggyHookRunner, lintStaged, parseHuskyConfig, prePushHook,
  requireIssueRef, GitHookSystem,
  ex1_order, ex4_a, ex4_b, ex4_c, ex9_a, ex9_b,
};
export type { HookName };
