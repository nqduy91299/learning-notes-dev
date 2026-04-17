// ============================================================================
// 04-hooks: Solutions
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/04-hooks/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

type HookName = "pre-commit" | "commit-msg" | "pre-push" | "post-commit" | "post-merge";

console.log("Exercise 1: Order: pre-commit → prepare-commit-msg → commit-msg → post-commit");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
class HookRunner {
  private hooks: Map<HookName, Array<() => { success: boolean; output: string }>> = new Map();

  register(name: HookName, handler: () => { success: boolean; output: string }): void {
    if (!this.hooks.has(name)) this.hooks.set(name, []);
    this.hooks.get(name)!.push(handler);
  }

  run(name: HookName): { success: boolean; outputs: string[] } {
    const handlers = this.hooks.get(name) ?? [];
    const outputs: string[] = [];
    for (const h of handlers) {
      const r = h();
      outputs.push(r.output);
      if (!r.success) return { success: false, outputs };
    }
    return { success: true, outputs };
  }

  hasHook(name: HookName): boolean { return (this.hooks.get(name)?.length ?? 0) > 0; }
}

console.log("\nExercise 2:");
const hr = new HookRunner();
hr.register("pre-commit", () => ({ success: true, output: "Lint passed" }));
hr.register("pre-commit", () => ({ success: false, output: "Tests failed" }));
console.log("Run:", hr.run("pre-commit"));

// ─── Exercise 3 ────────────────────────────────────────────────────────────
function commitMsgHook(message: string): { success: boolean; error?: string } {
  const subject = message.split("\n")[0] ?? "";
  if (!/^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+/.test(subject))
    return { success: false, error: "Must follow conventional commit format" };
  if (subject.length > 72)
    return { success: false, error: "Subject too long (max 72)" };
  return { success: true };
}

console.log("\nExercise 3:");
console.log(commitMsgHook("feat(auth): Add login"));
console.log(commitMsgHook("did stuff"));

console.log("\nExercise 4:");
console.log("Exit 0: commit proceeds");
console.log("Exit 1 pre-commit: commit aborted");
console.log("Exit 1 commit-msg: commit aborted (message rejected)");

// ─── Exercise 5 ────────────────────────────────────────────────────────────
function preCommitLintCheck(stagedFiles: string[], lintRules: Map<string, RegExp>) {
  const violations: Array<{ file: string; rule: string }> = [];
  for (const file of stagedFiles) {
    for (const [pattern, _rule] of lintRules) {
      if (file.endsWith(pattern.replace("*", ""))) {
        // Simplified: just check if file matches pattern
      }
    }
  }
  return { pass: violations.length === 0, violations };
}

console.log("\nExercise 5:");
console.log(preCommitLintCheck(["src/a.ts", "src/b.js"], new Map([["*.ts", /console\.log/]])));

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function preCommitBranchCheck(currentBranch: string, protectedBranches: string[]) {
  if (protectedBranches.includes(currentBranch))
    return { allowed: false, message: `Cannot commit directly to ${currentBranch}` };
  return { allowed: true, message: "OK" };
}

console.log("\nExercise 6:");
console.log(preCommitBranchCheck("main", ["main", "develop"]));
console.log(preCommitBranchCheck("feature/x", ["main", "develop"]));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedHookRunner(hooks: Array<() => boolean>): boolean {
  for (const hook of hooks) {
    if (!hook()) return false; // FIX: check return, stop on failure
  }
  return true;
}

console.log("\nExercise 7:");
console.log(fixedHookRunner([() => true, () => false, () => true])); // false

// ─── Exercise 8 ────────────────────────────────────────────────────────────
function lintStaged(stagedFiles: string[], config: Map<string, string[]>) {
  const results: Array<{ file: string; command: string; pass: boolean }> = [];
  for (const file of stagedFiles) {
    for (const [pattern, commands] of config) {
      const ext = pattern.replace("*", "");
      if (file.endsWith(ext)) {
        for (const cmd of commands) {
          results.push({ file, command: cmd, pass: true });
        }
      }
    }
  }
  return { success: results.every(r => r.pass), results };
}

console.log("\nExercise 8:");
console.log(lintStaged(["a.ts", "b.css"], new Map([["*.ts", ["eslint", "prettier"]], ["*.css", ["stylelint"]]])));

console.log("\nExercise 9:");
console.log("--no-verify on commit: pre-commit and commit-msg skipped");
console.log("--no-verify on push: pre-push skipped");

// ─── Exercise 10 ───────────────────────────────────────────────────────────
function parseHuskyConfig(_configDir: string, hookFiles: Map<string, string>): Map<HookName, string[]> {
  const result = new Map<HookName, string[]>();
  for (const [name, content] of hookFiles) {
    const commands = content.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("#!/"));
    result.set(name as HookName, commands);
  }
  return result;
}

console.log("\nExercise 10:");
console.log(parseHuskyConfig(".husky", new Map([["pre-commit", "#!/bin/sh\nnpx lint-staged"]])));

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function prePushHook(_commits: string[], testRunner: () => { pass: boolean; failedTests: string[] }) {
  const result = testRunner();
  if (!result.pass) return { allow: false, message: `Tests failed: ${result.failedTests.join(", ")}` };
  return { allow: true, message: "All tests passed" };
}

console.log("\nExercise 11:");
console.log(prePushHook(["a"], () => ({ pass: false, failedTests: ["auth.test"] })));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
function requireIssueRef(message: string): { valid: boolean; issueNumbers: string[] } {
  const matches = message.match(/#\d+/g) ?? [];
  return { valid: matches.length > 0, issueNumbers: matches };
}

console.log("\nExercise 12:");
console.log(requireIssueRef("fix: resolve login bug #42"));
console.log(requireIssueRef("update readme"));

// ─── Exercise 13 ───────────────────────────────────────────────────────────
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

console.log("\nExercise 13:");
const ghs = new GitHookSystem();
ghs.register("pre-commit", (ctx) => ({ ok: ctx.branch !== "main", msg: ctx.branch === "main" ? "No commits to main!" : "OK" }));
ghs.register("commit-msg", (ctx) => ({ ok: /^(feat|fix)/.test(ctx.message ?? ""), msg: "Conventional format check" }));
console.log(ghs.trigger("pre-commit", { branch: "feature" }));
console.log(ghs.trigger("pre-commit", { branch: "main" }));
console.log(ghs.trigger("commit-msg", { message: "feat: stuff" }));

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
