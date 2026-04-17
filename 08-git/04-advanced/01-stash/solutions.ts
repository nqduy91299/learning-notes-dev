// ============================================================================
// 01-stash: Solutions
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/01-stash/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

interface StashEntry { id: number; message: string; branch: string; changes: Map<string, string>; timestamp: number; }

console.log("Exercise 1:");
console.log("Status: clean working tree");
console.log("Stash list: stash@{0}: WIP on main: <sha> <message>");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
class StashStack {
  private stack: StashEntry[] = [];
  private counter = 0;

  push(changes: Map<string, string>, message: string, branch: string): number {
    const id = ++this.counter;
    this.stack.unshift({ id, message: message || "WIP", branch, changes: new Map(changes), timestamp: Date.now() });
    return id;
  }
  pop(): StashEntry | null { return this.stack.shift() ?? null; }
  apply(index = 0): StashEntry | null { return this.stack[index] ?? null; }
  drop(index: number): boolean { if (index >= this.stack.length) return false; this.stack.splice(index, 1); return true; }
  list(): string[] { return this.stack.map((s, i) => `stash@{${i}}: On ${s.branch}: ${s.message}`); }
  clear(): void { this.stack = []; }
  show(index: number): Map<string, string> | null { return this.stack[index]?.changes ?? null; }
  get size(): number { return this.stack.length; }
}

console.log("\nExercise 2:");
const ss = new StashStack();
ss.push(new Map([["a.txt", "change1"]]), "First stash", "main");
ss.push(new Map([["b.txt", "change2"]]), "Second stash", "feature");
console.log("List:", ss.list());
console.log("Pop:", ss.pop()?.message); // Second stash (LIFO)
console.log("Size after pop:", ss.size);

// ─── Exercise 3 ────────────────────────────────────────────────────────────
console.log("\nExercise 3:");
console.log("After apply:", true, "(stash remains)");
console.log("After pop:", false, "(stash removed)");

console.log("\nExercise 4:");
console.log("git stash:", false, "(untracked not included by default)");
console.log("git stash -u:", true, "(untracked included)");

// ─── Exercise 5 ────────────────────────────────────────────────────────────
function detectStashConflict(current: Map<string, string>, stash: Map<string, string>, base: Map<string, string>): string[] {
  const conflicts: string[] = [];
  for (const [file, stashContent] of stash) {
    const baseContent = base.get(file);
    const currentContent = current.get(file);
    if (currentContent !== baseContent && stashContent !== baseContent && currentContent !== stashContent) {
      conflicts.push(file);
    }
  }
  return conflicts;
}

console.log("\nExercise 5:");
console.log("Conflicts:", detectStashConflict(
  new Map([["f", "current"]]), new Map([["f", "stashed"]]), new Map([["f", "base"]])
));

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function fixedStashPop(stack: StashEntry[]): StashEntry | null {
  if (stack.length === 0) return null;
  return stack.shift()!; // FIX: shift from top + remove
}

console.log("\nExercise 6:");
const testStack: StashEntry[] = [
  { id: 1, message: "top", branch: "main", changes: new Map(), timestamp: 0 },
  { id: 2, message: "bottom", branch: "main", changes: new Map(), timestamp: 0 },
];
console.log("Fixed pop:", fixedStashPop(testStack)?.message); // "top"
console.log("Remaining:", testStack.length); // 1

console.log("\nExercise 7:");
console.log("Works:", true, "(stashes are global, not branch-specific)");
console.log("Changes on: feature");

// ─── Exercise 8 ────────────────────────────────────────────────────────────
function stashSpecificFiles(allChanges: Map<string, string>, filesToStash: string[]) {
  const stashed = new Map<string, string>();
  const remaining = new Map<string, string>();
  for (const [f, c] of allChanges) {
    if (filesToStash.includes(f)) stashed.set(f, c);
    else remaining.set(f, c);
  }
  return { stashed, remaining };
}

console.log("\nExercise 8:");
console.log(stashSpecificFiles(new Map([["a", "1"], ["b", "2"], ["c", "3"]]), ["a", "c"]));

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function stashBranch(stashEntry: StashEntry, branchName: string, headAtStash: string) {
  return { branch: branchName, headSha: headAtStash, applied: true };
}

console.log("\nExercise 9:");
console.log(stashBranch({ id: 1, message: "wip", branch: "main", changes: new Map(), timestamp: 0 }, "recovery", "abc123"));

console.log("\nExercise 10:");
console.log("git stash show: a.txt | 3 +++, b.txt | 5 +++++");

// ─── Exercise 11 ───────────────────────────────────────────────────────────
function formatStashList(entries: Array<{ index: number; branch: string; message: string }>): string[] {
  return entries.map(e => `stash@{${e.index}}: On ${e.branch}: ${e.message}`);
}

console.log("\nExercise 11:");
console.log(formatStashList([
  { index: 0, branch: "main", message: "WIP" },
  { index: 1, branch: "feature", message: "Partial work" },
]));

// ─── Exercise 12 ───────────────────────────────────────────────────────────
function applyStashWithConflicts(working: Map<string, string>, stash: Map<string, string>, base: Map<string, string>) {
  const result = new Map(working);
  const conflicts: string[] = [];
  for (const [f, sc] of stash) {
    const bc = base.get(f);
    const wc = working.get(f);
    if (wc !== bc && sc !== bc && wc !== sc) { conflicts.push(f); }
    else { result.set(f, sc); }
  }
  return { result, conflicts, applied: conflicts.length === 0 };
}

console.log("\nExercise 12:");
console.log(applyStashWithConflicts(new Map([["f", "cur"]]), new Map([["f", "stash"]]), new Map([["f", "base"]])));

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class GitStash {
  private stashes: StashEntry[] = [];
  private _c = 0;
  push(changes: Map<string, string>, message: string, branch: string): void { this.stashes.unshift({ id: ++this._c, message, branch, changes, timestamp: Date.now() }); }
  pop(): StashEntry | null { return this.stashes.shift() ?? null; }
  apply(n = 0): StashEntry | null { return this.stashes[n] ?? null; }
  drop(n: number): void { this.stashes.splice(n, 1); }
  list(): string[] { return this.stashes.map((s, i) => `stash@{${i}}: On ${s.branch}: ${s.message}`); }
  clear(): void { this.stashes = []; }
}

console.log("\nExercise 13:");
const gs = new GitStash();
gs.push(new Map([["f", "v1"]]), "First", "main");
gs.push(new Map([["g", "v2"]]), "Second", "dev");
console.log("List:", gs.list());
console.log("Pop:", gs.pop()?.message);
console.log("After pop:", gs.list());

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
