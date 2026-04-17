// ============================================================================
// 05-submodules: Exercises
// ============================================================================
// Run:  npx tsx 08-git/04-advanced/05-submodules/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 12 exercises covering submodule dependency tracking
// ============================================================================

// Exercise 1: Predict the Output — after adding submodule
// git submodule add <url> libs/mylib
// a) What files are created/modified?
// b) What does the submodule entry in the index look like?
const ex1_a: string[] = []; // TODO
const ex1_b: string = "";   // TODO

// Exercise 2: Simulate submodule dependency tracking
// ----------------------------------------------------------------------------
interface Submodule { path: string; url: string; branch: string; pinnedCommit: string; }

class SubmoduleManager {
  private submodules: Map<string, Submodule> = new Map();
  private parentTree: Map<string, string> = new Map(); // path → commit sha (gitlink)

  // TODO: Add a submodule
  add(_path: string, _url: string, _branch: string, _commit: string): void {}
  // TODO: Update submodule to a new commit
  update(_path: string, _newCommit: string): void {}
  // TODO: Init submodules (register in config)
  init(): string[] { return []; }
  // TODO: Get .gitmodules content
  getGitmodulesContent(): string { return ""; }
  // TODO: List all submodules
  list(): Submodule[] { return []; }
  // TODO: Remove a submodule
  remove(_path: string): boolean { return false; }
}

// Exercise 3: Predict the Output — clone without recurse
// git clone <url> (repo has 2 submodules)
// a) Are submodule directories empty?
// b) What command fills them?
const ex3_a: boolean = false; // TODO
const ex3_b: string = "";     // TODO

// Exercise 4: Implement .gitmodules parser
// ----------------------------------------------------------------------------
function parseGitmodules(_content: string): Submodule[] {
  // TODO: Parse .gitmodules INI format
  return [];
}

// Exercise 5: Predict the Output — submodule update
// Parent repo points submodule to commit A. Upstream has commit B.
// a) git submodule update → which commit?
// b) git submodule update --remote → which commit?
const ex5_a: string = ""; // TODO
const ex5_b: string = ""; // TODO

// Exercise 6: Implement dependency graph for submodules
// ----------------------------------------------------------------------------
function buildDependencyGraph(
  _submodules: Array<{ name: string; deps: string[] }>
): { order: string[]; hasCycle: boolean } {
  // TODO: Topological sort of submodule dependencies
  return { order: [], hasCycle: false };
}

// Exercise 7: Fix the Bug — submodule update
// ----------------------------------------------------------------------------
function buggySubmoduleUpdate(submodules: Map<string, Submodule>, parentTree: Map<string, string>) {
  for (const [path, _sub] of submodules) {
    // BUG 1: Should update submodule to parentTree's recorded commit
    // BUG 2: Should check if submodule is initialized first
    parentTree.set(path, "latest"); // Wrong: should use pinned commit
  }
}

// Exercise 8: Implement submodule status checker
// ----------------------------------------------------------------------------
function checkSubmoduleStatus(
  _submodules: Map<string, Submodule>,
  _currentCommits: Map<string, string>
): Array<{ path: string; status: "up-to-date" | "modified" | "uninitialized" }> {
  // TODO: Compare recorded commits vs current
  return [];
}

// Exercise 9: Implement foreach simulator
// ----------------------------------------------------------------------------
function submoduleForeach(
  _submodules: Submodule[],
  _command: (sub: Submodule) => string
): Array<{ path: string; output: string }> {
  // TODO: Run command in each submodule
  return [];
}

// Exercise 10: Predict the Output — submodule vs subtree
// a) Which stores full content in parent repo?
// b) Which requires separate fetch?
// c) Which is simpler for teammates?
const ex10_a: string = ""; // TODO
const ex10_b: string = ""; // TODO
const ex10_c: string = ""; // TODO

// Exercise 11: Implement recursive submodule initializer
// ----------------------------------------------------------------------------
function recursiveInit(
  _submodules: Map<string, { url: string; commit: string; nestedSubmodules: Map<string, { url: string; commit: string; nestedSubmodules: Map<string, unknown> }> }>
): string[] {
  // TODO: Return list of all submodule paths initialized (including nested)
  return [];
}

// Exercise 12: Build complete submodule system
// ----------------------------------------------------------------------------
class GitSubmodules {
  private modules: Map<string, Submodule> = new Map();
  add(path: string, url: string, commit: string): void { this.modules.set(path, { path, url, branch: "main", pinnedCommit: commit }); }
  update(path: string, commit: string): void { const m = this.modules.get(path); if (m) m.pinnedCommit = commit; }
  remove(path: string): void { this.modules.delete(path); }
  list(): Submodule[] { return [...this.modules.values()]; }
  getGitmodules(): string { return [...this.modules.values()].map(m => `[submodule "${m.path}"]\n    path = ${m.path}\n    url = ${m.url}`).join("\n"); }
}

export {
  SubmoduleManager, parseGitmodules, buildDependencyGraph, buggySubmoduleUpdate,
  checkSubmoduleStatus, submoduleForeach, recursiveInit, GitSubmodules,
  ex1_a, ex1_b, ex3_a, ex3_b, ex5_a, ex5_b, ex10_a, ex10_b, ex10_c,
};
export type { Submodule };
