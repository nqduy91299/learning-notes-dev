// ============================================================================
// 01-remote-repos: Exercises
// ============================================================================
// Run:  npx tsx 08-git/03-remote/01-remote-repos/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 13 exercises covering remote repository concepts
// ============================================================================

// Exercise 1: Predict the Output — after clone
// ----------------------------------------------------------------------------
// git clone https://github.com/user/repo.git
// cd repo && git remote -v
//
// a) How many remotes exist?
// b) What is the remote name?
// c) What URLs are shown?

const ex1_a: number = 0;  // TODO
const ex1_b: string = ""; // TODO
const ex1_c: number = 0;  // TODO: how many URL lines


// Exercise 2: Simulate remote tracking system
// ----------------------------------------------------------------------------
interface Remote {
  name: string;
  fetchUrl: string;
  pushUrl: string;
  fetchRefspec: string;
}

class RemoteManager {
  private remotes: Map<string, Remote> = new Map();

  // TODO: Add a remote
  add(_name: string, _url: string): boolean { return false; }

  // TODO: Remove a remote
  remove(_name: string): boolean { return false; }

  // TODO: Rename a remote
  rename(_oldName: string, _newName: string): boolean { return false; }

  // TODO: Set URL
  setUrl(_name: string, _url: string): void {}

  // TODO: List remotes (like git remote -v)
  list(): Array<{ name: string; url: string; type: "fetch" | "push" }> { return []; }

  // TODO: Get remote info
  show(_name: string): Remote | null { return null; }
}


// Exercise 3: Predict the Output — multiple remotes
// ----------------------------------------------------------------------------
// git remote add origin git@github.com:you/repo.git
// git remote add upstream git@github.com:original/repo.git
// git remote -v
//
// How many lines of output?
const ex3_lines: number = 0; // TODO


// Exercise 4: Implement refspec parser
// ----------------------------------------------------------------------------
interface Refspec {
  force: boolean;
  src: string;
  dst: string;
}

function parseRefspec(_refspec: string): Refspec | null {
  // TODO: Parse "+refs/heads/*:refs/remotes/origin/*"
  // force = starts with +
  // src = left of :
  // dst = right of :
  return null;
}


// Exercise 5: Predict the Output — remote show
// ----------------------------------------------------------------------------
// After clone, remote has branches: main, develop, feature/auth
// Local only tracks main
//
// What does `git remote show origin` say about each branch?
const ex5_main: string = "";    // TODO: tracking status
const ex5_develop: string = ""; // TODO
const ex5_feature: string = ""; // TODO


// Exercise 6: Implement remote branch pruning
// ----------------------------------------------------------------------------
function pruneRemoteBranches(
  _localRemoteRefs: Map<string, string>,   // e.g., "origin/main" → sha
  _actualRemoteBranches: Set<string>        // branches that exist on remote
): string[] {
  // TODO: Return list of refs to prune (exist locally but not on remote)
  return [];
}


// Exercise 7: Fix the Bug — remote URL handling
// ----------------------------------------------------------------------------
function buggyRemoteConfig(name: string, url: string) {
  return {
    name: name,
    url: url,
    // BUG 1: fetch refspec doesn't use the remote name
    fetchRefspec: "+refs/heads/*:refs/remotes/origin/*",
    // BUG 2: push URL should default to fetch URL
    pushUrl: "",
  };
}


// Exercise 8: Implement remote-tracking branch mapper
// ----------------------------------------------------------------------------
function mapRemoteBranches(
  _remoteName: string,
  _remoteBranches: string[],
  _refspec: string
): Map<string, string> {
  // TODO: Map remote branches to local remote-tracking ref names
  // e.g., "main" → "refs/remotes/origin/main"
  return new Map();
}


// Exercise 9: Predict the Output — protocol classification
// ----------------------------------------------------------------------------
const urls = [
  "https://github.com/user/repo.git",
  "git@github.com:user/repo.git",
  "file:///path/to/repo",
  "/local/path/repo.git",
  "git://github.com/user/repo.git",
];
// Classify each as: https, ssh, file, local, git
const ex9_protocols: string[] = []; // TODO


// Exercise 10: Implement remote config generator
// ----------------------------------------------------------------------------
function generateRemoteConfig(
  _name: string,
  _url: string,
  _options?: { pushUrl?: string; mirror?: boolean }
): string {
  // TODO: Generate git config section for a remote
  // [remote "name"]
  //     url = ...
  //     fetch = ...
  return "";
}


// Exercise 11: Implement multi-remote workflow simulator
// ----------------------------------------------------------------------------
class MultiRemoteWorkflow {
  private remotes: Map<string, { url: string; branches: Map<string, string> }> = new Map();
  private localBranches: Map<string, string> = new Map();
  private remoteTrackingRefs: Map<string, string> = new Map();

  addRemote(_name: string, _url: string): void {}
  setRemoteBranch(_remote: string, _branch: string, _sha: string): void {}

  // TODO: Simulate fetch from a specific remote
  fetch(_remote: string): string[] { return []; }

  // TODO: List all remote-tracking branches
  listRemoteTrackingBranches(): string[] { return []; }

  // TODO: Check if local branch is ahead/behind remote
  compareWithRemote(_branch: string, _remote: string): { ahead: number; behind: number } {
    return { ahead: 0, behind: 0 };
  }
}


// Exercise 12: Predict the Output — stale refs
// ----------------------------------------------------------------------------
// Remote had: main, develop, feature/old
// feature/old was deleted on remote
// You haven't fetched with --prune
//
// a) Does origin/feature/old still exist locally?
// b) What command removes it?

const ex12_a: boolean = false; // TODO
const ex12_b: string = "";     // TODO


// Exercise 13: Build complete remote management system
// ----------------------------------------------------------------------------
class GitRemote {
  private remotes: Map<string, Remote> = new Map();
  private remoteTrackingRefs: Map<string, Map<string, string>> = new Map();

  add(name: string, url: string): void { this.remotes.set(name, { name, fetchUrl: url, pushUrl: url, fetchRefspec: `+refs/heads/*:refs/remotes/${name}/*` }); this.remoteTrackingRefs.set(name, new Map()); }
  remove(name: string): void { this.remotes.delete(name); this.remoteTrackingRefs.delete(name); }
  rename(old: string, nw: string): void { const r = this.remotes.get(old); if (r) { r.name = nw; this.remotes.delete(old); this.remotes.set(nw, r); } }
  getAll(): string[] { return [...this.remotes.keys()]; }
  getInfo(name: string): Remote | undefined { return this.remotes.get(name); }
}

export {
  RemoteManager, parseRefspec, pruneRemoteBranches, buggyRemoteConfig,
  mapRemoteBranches, generateRemoteConfig, MultiRemoteWorkflow, GitRemote,
  ex1_a, ex1_b, ex1_c, ex3_lines, ex5_main, ex5_develop, ex5_feature,
  ex9_protocols, ex12_a, ex12_b,
};
export type { Remote, Refspec };
