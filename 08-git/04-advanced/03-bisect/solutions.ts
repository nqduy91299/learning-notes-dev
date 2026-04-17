// ============================================================================
// 03-bisect: Solutions
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/03-bisect/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// ============================================================================

type TestResult = "good" | "bad" | "skip";

console.log("Exercise 1: Steps for 16 commits:", 4, "(log2(16) = 4)");

// ─── Exercise 2 ────────────────────────────────────────────────────────────
class BisectSimulator {
  private commits: string[] = [];
  private low = 0; private high = 0; private _steps = 0; private _active = false;

  setCommits(commits: string[]): void { this.commits = commits; }

  start(badSha: string, goodSha: string): string | null {
    this.low = this.commits.indexOf(goodSha);
    this.high = this.commits.indexOf(badSha);
    if (this.low === -1 || this.high === -1) return null;
    this._active = true; this._steps = 0;
    const mid = Math.floor((this.low + this.high) / 2);
    return this.commits[mid]!;
  }

  mark(result: TestResult): { nextCommit: string | null; found: string | null } {
    const mid = Math.floor((this.low + this.high) / 2);
    this._steps++;
    if (result === "good") this.low = mid + 1;
    else if (result === "bad") this.high = mid;
    else { this.low++; } // skip: try next

    if (this.low >= this.high) {
      this._active = false;
      return { nextCommit: null, found: this.commits[this.high] ?? null };
    }
    const next = Math.floor((this.low + this.high) / 2);
    return { nextCommit: this.commits[next]!, found: null };
  }

  reset(): void { this._active = false; this._steps = 0; }
  get active(): boolean { return this._active; }
  get stepsCount(): number { return this._steps; }
}

console.log("\nExercise 2:");
const bs = new BisectSimulator();
bs.setCommits(["A", "B", "C", "D", "E", "F", "G", "H"]);
console.log("Start:", bs.start("H", "A")); // D
console.log("D=good:", bs.mark("good")); // test F
console.log("F=bad:", bs.mark("bad"));   // test E
console.log("E=bad:", bs.mark("bad"));   // found E

console.log("\nExercise 3: Culprit: E | Tests: 3");

// ─── Exercise 4 ────────────────────────────────────────────────────────────
function automatedBisect(commits: string[], goodSha: string, badSha: string, testFn: (sha: string) => TestResult): { culprit: string; steps: number } {
  let low = commits.indexOf(goodSha);
  let high = commits.indexOf(badSha);
  let steps = 0;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    steps++;
    const result = testFn(commits[mid]!);
    if (result === "good") low = mid + 1;
    else if (result === "bad") high = mid;
    else low++; // skip
  }
  return { culprit: commits[high]!, steps };
}

console.log("\nExercise 4:");
const commits = ["A", "B", "C", "D", "E", "F", "G", "H"];
const bugAt = "E";
console.log(automatedBisect(commits, "A", "H", (sha) => commits.indexOf(sha) >= commits.indexOf(bugAt) ? "bad" : "good"));

console.log("\nExercise 5:");
console.log("Bisect tries another nearby commit");
console.log("Can still find bug, but may need extra steps");

// ─── Exercise 6 ────────────────────────────────────────────────────────────
function binarySearchCommit(commits: string[], isBad: (commit: string) => boolean): { firstBad: string; steps: number } {
  let low = 0, high = commits.length - 1, steps = 0;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    steps++;
    if (isBad(commits[mid]!)) high = mid;
    else low = mid + 1;
  }
  return { firstBad: commits[high]!, steps };
}

console.log("\nExercise 6:");
console.log(binarySearchCommit(["A", "B", "C", "D", "E", "F"], (c) => ["D", "E", "F"].includes(c)));

// ─── Exercise 7 ────────────────────────────────────────────────────────────
function fixedMidpoint(low: number, high: number): number {
  if (low === high) return low;
  return low + Math.floor((high - low) / 2); // FIX: avoid overflow
}
console.log("\nExercise 7:", fixedMidpoint(0, 100), fixedMidpoint(5, 5));

console.log("\nExercise 8: Good=0, Bad=1-124 or 126-127, Skip=125");

// ─── Exercise 9 ────────────────────────────────────────────────────────────
function formatBisectLog(steps: Array<{ sha: string; result: TestResult }>): string[] {
  return steps.map(s => `# ${s.result}: [${s.sha}]`);
}
console.log("\nExercise 9:", formatBisectLog([{ sha: "abc", result: "good" }, { sha: "def", result: "bad" }]));

// ─── Exercise 10 ───────────────────────────────────────────────────────────
interface BisectCommit { sha: string; parents: string[]; timestamp: number; }

function bisectOnGraph(commits: Map<string, BisectCommit>, goodSha: string, badSha: string, testFn: (sha: string) => TestResult): string {
  // Topological sort: collect commits between good and bad
  const reachable = (from: string): Set<string> => {
    const s = new Set<string>(); const q = [from];
    while (q.length) { const c = q.shift()!; if (s.has(c)) continue; s.add(c); const n = commits.get(c); if (n) q.push(...n.parents); }
    return s;
  };
  const badAnc = reachable(badSha);
  const goodAnc = reachable(goodSha);
  const candidates = [...badAnc].filter(s => !goodAnc.has(s) || s === goodSha).sort((a, b) => (commits.get(a)?.timestamp ?? 0) - (commits.get(b)?.timestamp ?? 0));

  let low = 0, high = candidates.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const r = testFn(candidates[mid]!);
    if (r === "good") low = mid + 1; else high = mid;
  }
  return candidates[high]!;
}

console.log("\nExercise 10:");
const gc = new Map<string, BisectCommit>([
  ["A", { sha: "A", parents: [], timestamp: 1 }],
  ["B", { sha: "B", parents: ["A"], timestamp: 2 }],
  ["C", { sha: "C", parents: ["B"], timestamp: 3 }],
  ["D", { sha: "D", parents: ["C"], timestamp: 4 }],
]);
console.log("Graph bisect:", bisectOnGraph(gc, "A", "D", s => s >= "C" ? "bad" : "good"));

console.log("\nExercise 11: Bisect steps:", 10, "| Linear:", 1024);

// ─── Exercise 12 ───────────────────────────────────────────────────────────
function replayBisect(cmts: string[], log: Array<{ sha: string; result: TestResult }>) {
  let low = 0, high = cmts.length - 1;
  for (const entry of log) {
    const idx = cmts.indexOf(entry.sha);
    if (entry.result === "good") low = idx + 1;
    else if (entry.result === "bad") high = idx;
  }
  const next = low < high ? cmts[Math.floor((low + high) / 2)]! : null;
  return { currentState: { low, high }, nextCommit: next };
}
console.log("\nExercise 12:", replayBisect(["A", "B", "C", "D"], [{ sha: "B", result: "good" }]));

// ─── Exercise 13 ───────────────────────────────────────────────────────────
class GitBisect {
  private commits: string[] = []; private low = 0; private high = 0; private _active = false;
  setCommits(c: string[]): void { this.commits = c; }
  start(good: string, bad: string): string { this.low = this.commits.indexOf(good); this.high = this.commits.indexOf(bad); this._active = true; return this.commits[Math.floor((this.low + this.high) / 2)]!; }
  markGood(): string | null { this.low = Math.floor((this.low + this.high) / 2) + 1; return this.next(); }
  markBad(): string | null { this.high = Math.floor((this.low + this.high) / 2); return this.next(); }
  private next(): string | null { if (this.low >= this.high) { this._active = false; return null; } return this.commits[Math.floor((this.low + this.high) / 2)]!; }
  getResult(): string | null { return this.low >= this.high ? this.commits[this.high] ?? null : null; }
  reset(): void { this._active = false; }
  get active(): boolean { return this._active; }
}

console.log("\nExercise 13:");
const gb = new GitBisect();
gb.setCommits(["A", "B", "C", "D", "E", "F"]);
console.log("Start:", gb.start("A", "F"));
console.log("C=good:", gb.markGood());
console.log("E=bad:", gb.markBad());
console.log("D=bad:", gb.markBad());
console.log("Result:", gb.getResult());

console.log("\n============================================");
console.log("All 13 exercises completed successfully! ✓");
console.log("============================================");
