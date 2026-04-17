// ============================================================================
// 01-stash: Exercises
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/01-stash/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering git stash operations
// ============================================================================

// Exercise 1: Predict the Output — basic stash
// echo "work" > file.txt && git add file.txt && git stash
// a) What does git status show after stash?
// b) What does git stash list show?
const ex1_a: string = ""; // TODO
const ex1_b: string = ""; // TODO

// Exercise 2: Implement a stash stack
// ----------------------------------------------------------------------------
interface StashEntry { id: number; message: string; branch: string; changes: Map<string, string>; timestamp: number; }

class StashStack {
  private stack: StashEntry[] = [];
  private counter = 0;

  // TODO: Push changes to stash
  push(_changes: Map<string, string>, _message: string, _branch: string): number { return 0; }
  // TODO: Pop (apply + remove) from top
  pop(): StashEntry | null { return null; }
  // TODO: Apply without removing
  apply(_index?: number): StashEntry | null { return null; }
  // TODO: Drop specific entry
  drop(_index: number): boolean { return false; }
  // TODO: List all entries
  list(): string[] { return []; }
  // TODO: Clear all
  clear(): void {}
  // TODO: Show diff of entry
  show(_index: number): Map<string, string> | null { return null; }

  get size(): number { return this.stack.length; }
}

// Exercise 3: Predict the Output — pop vs apply
// git stash (stash@{0} created)
// git stash apply
// a) Is stash@{0} still in the list?
// git stash pop
// b) Is it still in the list now?
const ex3_a: boolean = false; // TODO
const ex3_b: boolean = false; // TODO

// Exercise 4: Predict the Output — stash with untracked
// echo "new" > untracked.txt (not git added)
// a) git stash — is untracked.txt stashed?
// b) git stash -u — is untracked.txt stashed?
const ex4_a: boolean = false; // TODO
const ex4_b: boolean = false; // TODO

// Exercise 5: Implement stash conflict detector
// ----------------------------------------------------------------------------
function detectStashConflict(
  _currentFiles: Map<string, string>,
  _stashFiles: Map<string, string>,
  _baseFiles: Map<string, string>
): string[] {
  // TODO: Return files that would conflict when applying stash
  return [];
}

// Exercise 6: Fix the Bug — stash stack
// ----------------------------------------------------------------------------
function buggyStashPop(stack: StashEntry[]): StashEntry | null {
  // BUG 1: Should return from the top (index 0), not bottom
  // BUG 2: Should remove the entry from the stack
  if (stack.length === 0) return null;
  return stack[stack.length - 1]!;
}

// Exercise 7: Predict the Output — stash across branches
// On main: echo "change" > f.txt && git stash
// git switch feature
// git stash pop
// a) Does this work?  b) Which branch has the changes?
const ex7_a: boolean = false; // TODO
const ex7_b: string = "";     // TODO

// Exercise 8: Implement stash-specific-files
// ----------------------------------------------------------------------------
function stashSpecificFiles(
  _allChanges: Map<string, string>,
  _filesToStash: string[]
): { stashed: Map<string, string>; remaining: Map<string, string> } {
  // TODO: Only stash specified files, leave others in working dir
  return { stashed: new Map(), remaining: new Map() };
}

// Exercise 9: Implement stash branch creator
// ----------------------------------------------------------------------------
function stashBranch(
  _stashEntry: StashEntry,
  _branchName: string,
  _headAtStash: string
): { branch: string; headSha: string; applied: boolean } {
  // TODO: Create a branch at the commit where stash was made, apply stash
  return { branch: "", headSha: "", applied: false };
}

// Exercise 10: Predict the Output — stash show
// Stash has: modified a.txt (added 3 lines), new b.txt (5 lines)
// What does `git stash show` output?
const ex10_output: string = ""; // TODO

// Exercise 11: Implement stash message formatter
// ----------------------------------------------------------------------------
function formatStashList(
  _entries: Array<{ index: number; branch: string; message: string }>
): string[] {
  // TODO: Format like git stash list output
  // "stash@{0}: On branch: message"
  return [];
}

// Exercise 12: Implement stash apply with conflict handling
// ----------------------------------------------------------------------------
function applyStashWithConflicts(
  _working: Map<string, string>,
  _stash: Map<string, string>,
  _base: Map<string, string>
): { result: Map<string, string>; conflicts: string[]; applied: boolean } {
  // TODO: Apply stash, detect conflicts
  return { result: new Map(), conflicts: [], applied: false };
}

// Exercise 13: Build complete stash system
// ----------------------------------------------------------------------------
class GitStash {
  private stashes: StashEntry[] = [];
  private _counter = 0;
  push(changes: Map<string, string>, message: string, branch: string): void { this.stashes.unshift({ id: ++this._counter, message, branch, changes, timestamp: Date.now() }); }
  pop(): StashEntry | null { return this.stashes.shift() ?? null; }
  apply(n = 0): StashEntry | null { return this.stashes[n] ?? null; }
  drop(n: number): void { this.stashes.splice(n, 1); }
  list(): string[] { return this.stashes.map((s, i) => `stash@{${i}}: On ${s.branch}: ${s.message}`); }
  clear(): void { this.stashes = []; }
}

export {
  StashStack, detectStashConflict, buggyStashPop, stashSpecificFiles,
  stashBranch, formatStashList, applyStashWithConflicts, GitStash,
  ex1_a, ex1_b, ex3_a, ex3_b, ex4_a, ex4_b, ex7_a, ex7_b, ex10_output,
};
export type { StashEntry };
