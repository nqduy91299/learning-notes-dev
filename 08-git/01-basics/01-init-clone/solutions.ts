// ============================================================================
// 01-init-clone: Solutions
// ============================================================================
// Run:  npx tsx 08-git/01-basics/01-init-clone/solutions.ts
//
// Config: ES2022 target, strict mode, ESNext modules
// Complete solutions with explanations and test runner
// ============================================================================

// ─── Exercise 1: Predict the Output — git init basics ──────────────────────
// After `git init`, you are on branch "main" (or "master" depending on config).
// The branch does NOT exist in .git/refs/heads/ yet — it's "unborn".
// `git status` output:
//   On branch main
//   No commits yet
//   nothing to commit (create copy or use "git add" first)
console.log("Exercise 1: git init creates an unborn branch — no ref file until first commit");


// ─── Exercise 2: Simulate a basic repo initialization ──────────────────────

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
  return {
    HEAD: "ref: refs/heads/main",
    config: {
      core: {
        repositoryformatversion: 0,
        filemode: true,
        bare: false,
      },
    },
    objects: new Map(),
    refs: {
      heads: new Map(),
      tags: new Map(),
      remotes: new Map(),
    },
  };
}

console.log("\nExercise 2:");
const repo = initRepository();
console.log("HEAD:", repo.HEAD);
console.log("bare:", (repo.config.core as Record<string, unknown>).bare);
console.log("objects count:", repo.objects.size);
console.log("branches:", repo.refs.heads.size);
// HEAD: ref: refs/heads/main | bare: false | objects: 0 | branches: 0


// ─── Exercise 3: Predict the Output — .git/HEAD content ───────────────────

const ex3_scenarioA = "ref: refs/heads/main";
// After init + first commit, HEAD is a symbolic ref to main

const ex3_scenarioB = "ref: refs/heads/feature";
// After checkout -b feature, HEAD points to the new branch

const ex3_scenarioC = "<raw-commit-sha>";
// After checkout <sha>, HEAD is "detached" — contains raw SHA

console.log("\nExercise 3:");
console.log("A:", ex3_scenarioA);
console.log("B:", ex3_scenarioB);
console.log("C:", ex3_scenarioC, "(detached HEAD)");


// ─── Exercise 4: Implement a version store (blob storage) ──────────────────

class ObjectStore {
  private objects: Map<string, string> = new Map();

  hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  store(content: string): string {
    const hash = this.hashContent(content);
    this.objects.set(hash, content);
    return hash;
  }

  retrieve(hash: string): string | null {
    return this.objects.get(hash) ?? null;
  }

  get size(): number {
    return this.objects.size;
  }
}

console.log("\nExercise 4:");
const store = new ObjectStore();
const h1 = store.store("Hello, Git!");
const h2 = store.store("Another file");
console.log("Stored 2 objects, size:", store.size);
console.log("Retrieve h1:", store.retrieve(h1));
console.log("Retrieve h2:", store.retrieve(h2));
console.log("Retrieve missing:", store.retrieve("deadbeef"));


// ─── Exercise 5: Predict the Output — clone behavior ──────────────────────

const ex5_a = "main";  // Default branch is checked out
const ex5_b = 1;       // Only one local branch (main) after clone
const ex5_c = 3;       // Three remote-tracking branches: origin/main, origin/develop, origin/feature/login

console.log("\nExercise 5:");
console.log("Checked out:", ex5_a);
console.log("Local branches:", ex5_b);
console.log("Remote-tracking branches:", ex5_c);
// git branch -a would show:
// * main
//   remotes/origin/main
//   remotes/origin/develop
//   remotes/origin/feature/login


// ─── Exercise 6: Simulate git clone ───────────────────────────────────────

interface RemoteRepo {
  name: string;
  url: string;
  branches: Map<string, string>;
  objects: Map<string, string>;
  defaultBranch: string;
}

interface LocalRepo {
  gitDir: GitDirectory;
  workingTree: Map<string, string>;
  remotes: Map<string, { url: string; fetch: string }>;
}

function simulateClone(remote: RemoteRepo): LocalRepo {
  const gitDir = initRepository();

  // Copy all objects from remote
  for (const [sha, content] of remote.objects) {
    gitDir.objects.set(sha, content);
  }

  // Set up remote-tracking branches
  const remoteRefs = new Map<string, string>();
  for (const [branch, sha] of remote.branches) {
    remoteRefs.set(branch, sha);
  }
  gitDir.refs.remotes.set("origin", remoteRefs);

  // Check out default branch
  const defaultSha = remote.branches.get(remote.defaultBranch);
  if (defaultSha) {
    gitDir.refs.heads.set(remote.defaultBranch, defaultSha);
    gitDir.HEAD = `ref: refs/heads/${remote.defaultBranch}`;
  }

  return {
    gitDir,
    workingTree: new Map(), // Would populate from tree objects
    remotes: new Map([
      ["origin", {
        url: remote.url,
        fetch: "+refs/heads/*:refs/remotes/origin/*",
      }],
    ]),
  };
}

console.log("\nExercise 6:");
const remote: RemoteRepo = {
  name: "my-project",
  url: "https://github.com/user/my-project.git",
  branches: new Map([["main", "abc123"], ["develop", "def456"]]),
  objects: new Map([["abc123", "commit-data"], ["def456", "commit-data-2"]]),
  defaultBranch: "main",
};
const local = simulateClone(remote);
console.log("HEAD:", local.gitDir.HEAD);
console.log("Local branches:", [...local.gitDir.refs.heads.keys()]);
console.log("Remote branches:", [...(local.gitDir.refs.remotes.get("origin")?.keys() ?? [])]);
console.log("Objects copied:", local.gitDir.objects.size);


// ─── Exercise 7: Predict the Output — bare repos ──────────────────────────

const ex7_error = "fatal: this operation must be run in a work tree";
const ex7_reason = "Bare repositories have no working tree, so you cannot stage or commit files directly.";

console.log("\nExercise 7:");
console.log("Error:", ex7_error);
console.log("Reason:", ex7_reason);


// ─── Exercise 8: Implement shallow clone simulation ────────────────────────

interface SimCommit {
  sha: string;
  message: string;
  parent: string | null;
  timestamp: number;
}

function shallowClone(commits: SimCommit[], depth: number): SimCommit[] {
  // Find the tip (commit that no other commit points to as parent)
  const parentShas = new Set(commits.map((c) => c.parent).filter(Boolean));
  const commitMap = new Map(commits.map((c) => [c.sha, c]));
  let tip = commits.find((c) => !parentShas.has(c.sha));

  if (!tip) return [];

  const result: SimCommit[] = [];
  let current: SimCommit | undefined = tip;
  let count = 0;

  while (current && count < depth) {
    result.push(current);
    current = current.parent ? commitMap.get(current.parent) : undefined;
    count++;
  }

  return result;
}

console.log("\nExercise 8:");
const commitHistory: SimCommit[] = [
  { sha: "aaa", message: "initial", parent: null, timestamp: 1000 },
  { sha: "bbb", message: "add readme", parent: "aaa", timestamp: 2000 },
  { sha: "ccc", message: "add src", parent: "bbb", timestamp: 3000 },
  { sha: "ddd", message: "add tests", parent: "ccc", timestamp: 4000 },
  { sha: "eee", message: "fix bug", parent: "ddd", timestamp: 5000 },
];
const shallow = shallowClone(commitHistory, 2);
console.log("Shallow (depth=2):", shallow.map((c) => c.message));
// ["fix bug", "add tests"]


// ─── Exercise 9: Fix the Bug — incorrect init ─────────────────────────────

function createGitConfig(bare: boolean, defaultBranch: string) {
  const config = {
    core: {
      repositoryformatversion: 0,
      filemode: true,
      bare: bare,                  // FIX: use the parameter
    },
    init: {
      defaultBranch: defaultBranch, // FIX: use the parameter
    },
  };
  return config; // FIX: return the config
}

console.log("\nExercise 9:");
const config1 = createGitConfig(true, "main");
console.log("Bare config:", config1?.core.bare, "branch:", config1?.init.defaultBranch);
const config2 = createGitConfig(false, "develop");
console.log("Normal config:", config2?.core.bare, "branch:", config2?.init.defaultBranch);


// ─── Exercise 10: Predict the Output — reinitializing ─────────────────────

const ex10_a = false; // Commits are NOT destroyed
const ex10_b = false; // Branches are NOT destroyed
const ex10_c = false; // Hooks are NOT reset (existing hooks preserved)
const ex10_d = "Reinitialized existing Git repository in /path/to/.git/";

console.log("\nExercise 10:");
console.log("Commits destroyed?", ex10_a);
console.log("Branches destroyed?", ex10_b);
console.log("Hooks reset?", ex10_c);
console.log("Output:", ex10_d);


// ─── Exercise 11: Implement .gitignore pattern matching ────────────────────

function shouldIgnore(filepath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // Directory pattern: "dir/"
    if (pattern.endsWith("/")) {
      const dir = pattern.slice(0, -1);
      if (filepath.startsWith(dir + "/") || filepath === dir) {
        return true;
      }
    }
    // Wildcard pattern: "*.ext"
    else if (pattern.startsWith("*")) {
      const ext = pattern.slice(1); // e.g., ".js"
      if (filepath.endsWith(ext)) {
        return true;
      }
    }
    // Exact match
    else if (filepath === pattern || filepath.startsWith(pattern + "/")) {
      return true;
    }
  }
  return false;
}

console.log("\nExercise 11:");
const patterns = ["node_modules/", "*.log", ".env", "dist/"];
console.log("node_modules/foo.js:", shouldIgnore("node_modules/foo.js", patterns)); // true
console.log("src/index.ts:", shouldIgnore("src/index.ts", patterns));               // false
console.log("error.log:", shouldIgnore("error.log", patterns));                     // true
console.log(".env:", shouldIgnore(".env", patterns));                               // true
console.log("dist/bundle.js:", shouldIgnore("dist/bundle.js", patterns));           // true
console.log("README.md:", shouldIgnore("README.md", patterns));                     // false


// ─── Exercise 12: Predict the Output — HTTPS vs SSH URLs ──────────────────

type Protocol = "https" | "ssh" | "local" | "file";

function classifyUrl(url: string): Protocol {
  if (url.startsWith("https://")) return "https";
  if (url.startsWith("git@") || url.startsWith("ssh://")) return "ssh";
  if (url.startsWith("file://")) return "file";
  return "local";
}

console.log("\nExercise 12:");
const urls = [
  "https://github.com/user/repo.git",
  "git@github.com:user/repo.git",
  "ssh://git@github.com/user/repo.git",
  "/path/to/local/repo.git",
  "file:///path/to/local/repo.git",
];
urls.forEach((u) => console.log(`${u} → ${classifyUrl(u)}`));


// ─── Exercise 13: Simulate object SHA storage ─────────────────────────────

function getObjectPath(sha: string): string {
  const dir = sha.slice(0, 2);
  const file = sha.slice(2);
  return `objects/${dir}/${file}`;
}

console.log("\nExercise 13:");
console.log(getObjectPath("a1b2c3d4e5f6"));  // objects/a1/b2c3d4e5f6
console.log(getObjectPath("deadbeefcafe"));   // objects/de/adbeefcafe


// ─── Exercise 14: Predict the Output — clone options ──────────────────────

const ex14_A = 3; // --depth 1: latest commit, default branch
const ex14_B = 4; // --bare: bare repo, standard branches
const ex14_C = 2; // --mirror: all refs, bare, fetch matches all
const ex14_D = 1; // --single-branch --branch dev: only dev, full history

console.log("\nExercise 14:");
console.log("A (--depth 1):", ex14_A);
console.log("B (--bare):", ex14_B);
console.log("C (--mirror):", ex14_C);
console.log("D (--single-branch):", ex14_D);


// ─── Exercise 15: Implement a simple commit chain builder ──────────────────

interface CommitNode {
  sha: string;
  message: string;
  parentSha: string | null;
  tree: Map<string, string>;
}

class CommitChain {
  private commits: Map<string, CommitNode> = new Map();
  private _head: string | null = null;
  private counter = 0;

  createCommit(message: string, tree: Map<string, string>): string {
    const sha = (++this.counter).toString(16).padStart(7, "0");
    const node: CommitNode = {
      sha,
      message,
      parentSha: this._head,
      tree: new Map(tree),
    };
    this.commits.set(sha, node);
    this._head = sha;
    return sha;
  }

  getHistory(): CommitNode[] {
    const result: CommitNode[] = [];
    let current = this._head;
    while (current) {
      const node = this.commits.get(current);
      if (!node) break;
      result.push(node);
      current = node.parentSha;
    }
    return result;
  }

  get head(): string | null {
    return this._head;
  }
}

console.log("\nExercise 15:");
const chain = new CommitChain();
chain.createCommit("Initial commit", new Map([["README.md", "blob1"]]));
chain.createCommit("Add src", new Map([["README.md", "blob1"], ["src/index.ts", "blob2"]]));
chain.createCommit("Add tests", new Map([["README.md", "blob1"], ["src/index.ts", "blob2"], ["test/index.test.ts", "blob3"]]));
console.log("HEAD:", chain.head);
console.log("History:", chain.getHistory().map((c) => c.message));
// ["Add tests", "Add src", "Initial commit"]


// ─── Summary ──────────────────────────────────────────────────────────────
console.log("\n============================================");
console.log("All 15 exercises completed successfully! ✓");
console.log("============================================");
