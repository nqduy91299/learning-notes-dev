// ============================================================================
// 03-bisect: Exercises
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/03-bisect/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering bisect algorithm, binary search
// ============================================================================

// Exercise 1: Predict the Output — bisect steps
// 16 commits between good and bad. How many steps max?
const ex1_steps: number = 0; // TODO: log2(16)

// Exercise 2: Implement binary search bisect
// ----------------------------------------------------------------------------
type TestResult = "good" | "bad" | "skip";

class BisectSimulator {
  private commits: string[] = []; // ordered oldest to newest
  private goodIdx: number = -1;
  private badIdx: number = -1;
  private current: number = -1;
  private _active = false;

  setCommits(commits: string[]): void { this.commits = commits; }

  // TODO: Start bisect session
  start(badSha: string, goodSha: string): string | null { return null; }

  // TODO: Mark current as good/bad, return next commit to test (or result)
  mark(result: TestResult): { nextCommit: string | null; found: string | null } {
    return { nextCommit: null, found: null };
  }

  // TODO: Reset session
  reset(): void {}

  get active(): boolean { return this._active; }
  get stepsCount(): number { return 0; }
}

// Exercise 3: Predict the Output — bisect scenario
// Commits: A(good) B C D E F G H(bad)
// Test D → good. Test F → bad. Test E → bad.
// a) Which commit introduced the bug?
// b) How many tests were needed?
const ex3_a: string = ""; // TODO
const ex3_b: number = 0;  // TODO

// Exercise 4: Implement automated bisect runner
// ----------------------------------------------------------------------------
function automatedBisect(
  _commits: string[],
  _goodSha: string,
  _badSha: string,
  _testFn: (sha: string) => TestResult
): { culprit: string; steps: number } {
  // TODO: Run bisect automatically using the test function
  return { culprit: "", steps: 0 };
}

// Exercise 5: Predict the Output — bisect with skip
// 8 commits: A(good) B C D E F G H(bad)
// Bisect starts at D → skip (can't build)
// a) What does bisect do?
// b) Can it still find the bug?
const ex5_a: string = ""; // TODO
const ex5_b: string = ""; // TODO

// Exercise 6: Implement binary search on commit array
// ----------------------------------------------------------------------------
function binarySearchCommit(
  _commits: string[],
  _isBad: (commit: string) => boolean
): { firstBad: string; steps: number } {
  // TODO: Find the first "bad" commit using binary search
  // Assumes: all commits after the first bad one are also bad
  return { firstBad: "", steps: 0 };
}

// Exercise 7: Fix the Bug — bisect midpoint
// ----------------------------------------------------------------------------
function buggyMidpoint(low: number, high: number): number {
  // BUG: Integer overflow for large values (in other languages)
  // Also: should handle low === high case
  return (low + high) / 2;
}

// Exercise 8: Predict the Output — bisect run
// git bisect run npm test
// Test returns 0 (pass) or 1 (fail)
// a) What exit code means "good"?
// b) What exit code means "bad"?
// c) What does 125 mean?
const ex8_good: number = 0;  // TODO
const ex8_bad: string = "";   // TODO
const ex8_skip: number = 0;   // TODO

// Exercise 9: Implement bisect log formatter
// ----------------------------------------------------------------------------
function formatBisectLog(
  _steps: Array<{ sha: string; result: TestResult }>
): string[] {
  // TODO: Format like git bisect log
  // "# good: [sha]" or "# bad: [sha]"
  return [];
}

// Exercise 10: Implement bisect with commit graph (not just linear)
// ----------------------------------------------------------------------------
interface BisectCommit { sha: string; parents: string[]; timestamp: number; }

function bisectOnGraph(
  _commits: Map<string, BisectCommit>,
  _goodSha: string,
  _badSha: string,
  _testFn: (sha: string) => TestResult
): string {
  // TODO: Bisect on a DAG (not just linear history)
  // Use topological ordering
  return "";
}

// Exercise 11: Predict the Output — efficiency
// 1024 commits between good and bad.
// a) Maximum bisect steps?
// b) If you test linearly, how many tests worst case?
const ex11_bisect: number = 0;  // TODO
const ex11_linear: number = 0;  // TODO

// Exercise 12: Implement bisect replay
// ----------------------------------------------------------------------------
function replayBisect(
  _commits: string[],
  _log: Array<{ sha: string; result: TestResult }>
): { currentState: { low: number; high: number }; nextCommit: string | null } {
  // TODO: Replay a bisect log and return the current state
  return { currentState: { low: 0, high: 0 }, nextCommit: null };
}

// Exercise 13: Build complete bisect system
// ----------------------------------------------------------------------------
class GitBisect {
  private commits: string[] = [];
  private low = 0;
  private high = 0;
  private _active = false;
  private steps = 0;
  private log: Array<{ sha: string; result: TestResult }> = [];

  setCommits(c: string[]): void { this.commits = c; }
  start(good: string, bad: string): string { this.low = this.commits.indexOf(good); this.high = this.commits.indexOf(bad); this._active = true; const mid = Math.floor((this.low + this.high) / 2); return this.commits[mid]!; }
  markGood(): string | null { this.log.push({ sha: this.commits[Math.floor((this.low + this.high) / 2)]!, result: "good" }); this.low = Math.floor((this.low + this.high) / 2) + 1; this.steps++; return this.next(); }
  markBad(): string | null { this.log.push({ sha: this.commits[Math.floor((this.low + this.high) / 2)]!, result: "bad" }); this.high = Math.floor((this.low + this.high) / 2); this.steps++; return this.next(); }
  private next(): string | null { if (this.low >= this.high) { this._active = false; return null; } return this.commits[Math.floor((this.low + this.high) / 2)]!; }
  getResult(): string | null { return this.low >= this.high ? this.commits[this.high] ?? null : null; }
  reset(): void { this._active = false; this.log = []; this.steps = 0; }
  get active(): boolean { return this._active; }
}

export {
  BisectSimulator, automatedBisect, binarySearchCommit, buggyMidpoint,
  formatBisectLog, bisectOnGraph, replayBisect, GitBisect,
  ex1_steps, ex3_a, ex3_b, ex5_a, ex5_b,
  ex8_good, ex8_bad, ex8_skip, ex11_bisect, ex11_linear,
};
export type { TestResult, BisectCommit };
