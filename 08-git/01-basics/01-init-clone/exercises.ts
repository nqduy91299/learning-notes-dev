// ============================================================================
// 01-init-clone: Exercises
// ============================================================================
// Run:  npx tsx 08-git/01-basics/01-init-clone/exercises.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// 15 exercises covering git init, clone, .git directory internals
// ============================================================================

// Exercise 1: Predict the Output — git init basics
// ----------------------------------------------------------------------------
// A developer runs these commands. What is the state of the repository?
//
//   mkdir project && cd project
//   git init
//   git status
//
// What branch are they on? Does the branch actually exist in .git/refs/heads/?
// Predict the output of `git status`.


// Exercise 2: Simulate a basic repo initialization
// ----------------------------------------------------------------------------
// Create a function that simulates `git init` by returning the initial
// directory structure of a .git folder.

interface GitDirectory {
  HEAD: string;
  config: Record<string, unknown>;
  objects: Map<string, string>;
  refs: {
    heads: Map<string, string>;
    tags: Map<string, string>;
    remotes: Map<string, Map<string, string>>;
  };
}

function initRepository(): GitDirectory {
  // TODO: Return a properly initialized GitDirectory
  // HEAD should point to refs/heads/main
  // config should have bare = false
  // All maps should be empty
  return {} as GitDirectory;
}


// Exercise 3: Predict the Output — .git/HEAD content
// ----------------------------------------------------------------------------
// After each command sequence, what does .git/HEAD contain?
//
// Scenario A:
//   git init && git commit --allow-empty -m "first"
//
// Scenario B:
//   git init && git commit --allow-empty -m "first"
//   git checkout -b feature
//
// Scenario C:
//   git init && git commit --allow-empty -m "first"
//   git checkout <commit-sha>
//
// Write your predictions as strings:
const ex3_scenarioA: string = ""; // TODO
const ex3_scenarioB: string = ""; // TODO
const ex3_scenarioC: string = ""; // TODO


// Exercise 4: Implement a version store (blob storage)
// ----------------------------------------------------------------------------
// Git stores objects by their SHA-1 hash. Implement a simple object store
// that stores content by a hash key.

class ObjectStore {
  private objects: Map<string, string> = new Map();

  // TODO: Implement hashContent — return a simple hash (sum of char codes as hex)
  hashContent(content: string): string {
    return "";
  }

  // TODO: Implement store — hash the content and store it, return the hash
  store(content: string): string {
    return "";
  }

  // TODO: Implement retrieve — return content by hash, or null if not found
  retrieve(hash: string): string | null {
    return null;
  }

  get size(): number {
    return this.objects.size;
  }
}


// Exercise 5: Predict the Output — clone behavior
// ----------------------------------------------------------------------------
// Given a remote repo with branches: main, develop, feature/login
//
//   git clone <url>
//
// After cloning:
// a) Which branch is checked out locally?
// b) How many local branches exist?
// c) How many remote-tracking branches exist?
// d) What does `git branch -a` show?

const ex5_a: string = ""; // TODO
const ex5_b: number = 0;  // TODO
const ex5_c: number = 0;  // TODO


// Exercise 6: Simulate git clone
// ----------------------------------------------------------------------------
// Implement a function that simulates cloning by copying objects and setting
// up remote tracking.

interface RemoteRepo {
  name: string;
  url: string;
  branches: Map<string, string>; // branch -> commit SHA
  objects: Map<string, string>;  // SHA -> content
  defaultBranch: string;
}

interface LocalRepo {
  gitDir: GitDirectory;
  workingTree: Map<string, string>; // filename -> content
  remotes: Map<string, { url: string; fetch: string }>;
}

function simulateClone(_remote: RemoteRepo): LocalRepo {
  // TODO: Implement clone simulation
  // 1. Init a new local repo
  // 2. Add remote as "origin"
  // 3. Copy all objects
  // 4. Set up remote-tracking branches
  // 5. Check out the default branch
  return {} as LocalRepo;
}


// Exercise 7: Predict the Output — bare repos
// ----------------------------------------------------------------------------
// What happens when you try these commands in a bare repository?
//
//   git clone --bare https://github.com/user/repo.git
//   cd repo.git
//   touch file.txt
//   git add file.txt
//
// What error message do you get? Why?

const ex7_error: string = ""; // TODO: predict the error message
const ex7_reason: string = ""; // TODO: explain why


// Exercise 8: Implement shallow clone simulation
// ----------------------------------------------------------------------------
// Implement a function that simulates a shallow clone by only taking
// the last N commits from a commit chain.

interface SimCommit {
  sha: string;
  message: string;
  parent: string | null;
  timestamp: number;
}

function shallowClone(commits: SimCommit[], depth: number): SimCommit[] {
  // TODO: Return only the most recent `depth` commits from the chain
  // Commits are linked by parent SHAs. Start from the most recent
  // (the one with no commit pointing to it as parent) and walk back.
  return [];
}


// Exercise 9: Fix the Bug — incorrect init
// ----------------------------------------------------------------------------
// This function has bugs. Fix them.

function createGitConfig(bare: boolean, defaultBranch: string) {
  const _config = {
    core: {
      repositoryformatversion: 0,
      filemode: true,
      bare: false, // BUG: should use the parameter
    },
    init: {
      defaultBranch: "master", // BUG: should use the parameter
    },
  };
  // BUG: config is not returned
}


// Exercise 10: Predict the Output — reinitializing
// ----------------------------------------------------------------------------
// What happens when you run `git init` in an existing repository?
//
//   cd existing-repo  # has commits, branches, etc.
//   git init
//
// a) Are existing commits destroyed?
// b) Are branches destroyed?
// c) Are hooks reset?
// d) What is the terminal output?

const ex10_a: boolean = false; // TODO
const ex10_b: boolean = false; // TODO
const ex10_c: boolean = false; // TODO
const ex10_d: string = "";     // TODO


// Exercise 11: Implement .gitignore pattern matching
// ----------------------------------------------------------------------------
// Implement a simple gitignore matcher that checks if a filepath should be
// ignored based on patterns.

function shouldIgnore(filepath: string, patterns: string[]): boolean {
  // TODO: Implement basic gitignore matching
  // Support: exact matches, directory patterns (ending with /),
  // and wildcard patterns (*.ext)
  // Negation patterns (starting with !) are NOT required
  return false;
}


// Exercise 12: Predict the Output — HTTPS vs SSH URLs
// ----------------------------------------------------------------------------
// Classify each URL and predict what `git remote -v` would show:
const urls = [
  "https://github.com/user/repo.git",
  "git@github.com:user/repo.git",
  "ssh://git@github.com/user/repo.git",
  "/path/to/local/repo.git",
  "file:///path/to/local/repo.git",
];

// TODO: For each URL, specify the protocol type
type Protocol = "https" | "ssh" | "local" | "file";
function classifyUrl(_url: string): Protocol {
  return "https"; // TODO: implement
}


// Exercise 13: Simulate object SHA storage
// ----------------------------------------------------------------------------
// Git stores objects in directories named by the first 2 chars of the SHA.
// Implement a function that returns the storage path for a given SHA.

function getObjectPath(sha: string): string {
  // TODO: Return the path like "objects/a1/b2c3d4..." for sha "a1b2c3d4..."
  return "";
}


// Exercise 14: Predict the Output — clone options
// ----------------------------------------------------------------------------
// Match each clone command with its result:
//
// A: git clone --depth 1 <url>
// B: git clone --bare <url>
// C: git clone --mirror <url>
// D: git clone --single-branch --branch dev <url>
//
// Results:
// 1: Only the dev branch, full history
// 2: All refs, bare repo, fetch spec matches all
// 3: Only latest commit, default branch checked out
// 4: Bare repo, only standard branches

// TODO: Map commands to results
const ex14_A: number = 0;
const ex14_B: number = 0;
const ex14_C: number = 0;
const ex14_D: number = 0;


// Exercise 15: Implement a simple commit chain builder
// ----------------------------------------------------------------------------
// Build a chain of commits similar to how git stores them.

interface CommitNode {
  sha: string;
  message: string;
  parentSha: string | null;
  tree: Map<string, string>; // filename -> blob sha
}

class CommitChain {
  private commits: Map<string, CommitNode> = new Map();
  private _head: string | null = null;

  // TODO: Implement createCommit — create a new commit with the given message
  // and tree, set it as HEAD, return its sha
  createCommit(_message: string, _tree: Map<string, string>): string {
    return "";
  }

  // TODO: Implement getHistory — return all commits from HEAD to root in order
  getHistory(): CommitNode[] {
    return [];
  }

  get head(): string | null {
    return this._head;
  }
}

export {
  initRepository,
  ObjectStore,
  simulateClone,
  shallowClone,
  createGitConfig,
  shouldIgnore,
  classifyUrl,
  getObjectPath,
  CommitChain,
  ex3_scenarioA, ex3_scenarioB, ex3_scenarioC,
  ex5_a, ex5_b, ex5_c,
  ex7_error, ex7_reason,
  ex10_a, ex10_b, ex10_c, ex10_d,
  ex14_A, ex14_B, ex14_C, ex14_D,
};
export type { GitDirectory, RemoteRepo, LocalRepo, SimCommit, CommitNode, Protocol };
