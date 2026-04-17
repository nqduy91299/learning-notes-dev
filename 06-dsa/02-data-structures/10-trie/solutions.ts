// ============================================================================
// Trie — Solutions + Runner
// ============================================================================
// Run: npx tsx solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

function separator(title: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(` ${title}`);
  console.log("=".repeat(60));
}

// ---------------------------------------------------------------------------
// PREDICT SOLUTIONS
// ---------------------------------------------------------------------------

function predict1(): void {
  const root: Record<string, Record<string, unknown>> = {};

  function insert(word: string): void {
    let node: Record<string, unknown> = root;
    for (const ch of word) {
      if (!node[ch]) node[ch] = {};
      node = node[ch] as Record<string, unknown>;
    }
    node["$"] = true;
  }

  insert("cat");
  insert("car");
  insert("card");

  const cNode = root["c"] as Record<string, unknown>;
  const aNode = cNode["a"] as Record<string, unknown>;
  console.log("Predict 1:", Object.keys(aNode).join(", "));
  // Answer: t, r — 'a' has children 't' (from "cat") and 'r' (from "car"/"card")
}

function predict2(): void {
  const children = new Map<string, Map<string, unknown>>();

  const aMap = new Map<string, unknown>();
  aMap.set("end", true);
  children.set("a", aMap);

  const bMap = new Map<string, unknown>();
  bMap.set("end", false);
  children.set("b", bMap);

  let count = 0;
  for (const [, child] of children) {
    if (child.get("end") === true) count++;
  }
  console.log("Predict 2:", count);
  // Answer: 1 — only 'a' has end=true
}

function predict3(): void {
  const words = ["app", "apple", "application", "apt"];
  let commonPrefix = "";

  const sorted = [...words].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  for (let i = 0; i < first.length; i++) {
    if (first[i] === last[i]) {
      commonPrefix += first[i];
    } else {
      break;
    }
  }
  console.log("Predict 3:", commonPrefix);
  // Answer: ap — sorted: ["app","apple","application","apt"], first="app", last="apt", common="ap"
}

function predict4(): void {
  const trie = new Map<string, Map<string, boolean | Map<string, unknown>>>();

  const dMap = new Map<string, boolean | Map<string, unknown>>();
  const oMap = new Map<string, boolean | Map<string, unknown>>();
  oMap.set("$end", true);
  dMap.set("o", oMap);
  trie.set("d", dMap);

  const hasD = trie.has("d");
  const dIsWord = trie.get("d")?.get("$end") === true;
  const doNode = trie.get("d")?.get("o") as Map<string, unknown> | undefined;
  const doIsWord = doNode?.get("$end") === true;

  console.log("Predict 4:", hasD, dIsWord, doIsWord);
  // Answer: true false true — "d" exists as prefix but not word, "do" is a word
}

// ---------------------------------------------------------------------------
// FIX SOLUTIONS
// ---------------------------------------------------------------------------

// Fix 1: search must check isEnd
class Fix1Trie {
  private root: Map<string, Fix1Trie> = new Map();
  private isEnd: boolean = false;

  insert(word: string): void {
    let node: Fix1Trie = this;
    for (const ch of word) {
      if (!node.root.has(ch)) {
        node.root.set(ch, new Fix1Trie());
      }
      node = node.root.get(ch)!;
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    let node: Fix1Trie = this;
    for (const ch of word) {
      if (!node.root.has(ch)) return false;
      node = node.root.get(ch)!;
    }
    return node.isEnd; // FIX: check isEnd instead of returning true
  }
}

// Fix 2: startsWith must walk the trie
class Fix2Trie {
  private children: Map<string, Fix2Trie> = new Map();
  isEnd: boolean = false;

  insert(word: string): void {
    let node: Fix2Trie = this;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new Fix2Trie());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  startsWith(prefix: string): boolean {
    // FIX: actually walk the trie
    let node: Fix2Trie = this;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// IMPLEMENT SOLUTIONS
// ---------------------------------------------------------------------------

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

// --- Solution 1: Trie with insert, search, startsWith ---
class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    const node = this._walkTo(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    return this._walkTo(prefix) !== null;
  }

  _walkTo(str: string): TrieNode | null {
    let node = this.root;
    for (const ch of str) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }
}

// --- Solution 2: Autocomplete ---
function autocomplete(trie: Trie, prefix: string): string[] {
  const node = trie._walkTo(prefix);
  if (!node) return [];

  const results: string[] = [];

  function dfs(current: TrieNode, path: string): void {
    if (current.isEndOfWord) {
      results.push(path);
    }
    for (const [ch, child] of current.children) {
      dfs(child, path + ch);
    }
  }

  dfs(node, prefix);
  return results;
}

// --- Solution 3: Word Dictionary with wildcard ---
class WordDictionary {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  addWord(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    return this._searchFrom(this.root, word, 0);
  }

  private _searchFrom(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) return node.isEndOfWord;

    const ch = word[index];
    if (ch === ".") {
      // Try all children
      for (const [, child] of node.children) {
        if (this._searchFrom(child, word, index + 1)) return true;
      }
      return false;
    } else {
      const child = node.children.get(ch);
      if (!child) return false;
      return this._searchFrom(child, word, index + 1);
    }
  }
}

// --- Solution 4: Longest common prefix ---
function longestCommonPrefix(words: string[]): string {
  if (words.length === 0) return "";

  const trie = new Trie();
  for (const word of words) {
    trie.insert(word);
  }

  let prefix = "";
  let node = trie.root;

  while (node.children.size === 1 && !node.isEndOfWord) {
    const [ch, child] = node.children.entries().next().value as [string, TrieNode];
    prefix += ch;
    node = child;
  }

  return prefix;
}

// --- Solution 5: Count words with prefix ---
class CountTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  countWordsWithPrefix(prefix: string): number {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return 0;
      node = node.children.get(ch)!;
    }
    return this._countWords(node);
  }

  private _countWords(node: TrieNode): number {
    let count = node.isEndOfWord ? 1 : 0;
    for (const [, child] of node.children) {
      count += this._countWords(child);
    }
    return count;
  }
}

// --- Solution 6: Deletable Trie ---
class DeletableTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEndOfWord;
  }

  delete(word: string): boolean {
    return this._deleteHelper(this.root, word, 0);
  }

  private _deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      return node.children.size === 0; // signal parent to prune
    }

    const ch = word[index];
    const child = node.children.get(ch);
    if (!child) return false;

    const shouldDeleteChild = this._deleteHelper(child, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(ch);
      // Prune this node too if it's not end of word and has no children
      return !node.isEndOfWord && node.children.size === 0;
    }

    return false;
  }
}

// ============================================================================
// RUNNER
// ============================================================================

function main(): void {
  separator("PREDICT EXERCISES");

  predict1();
  predict2();
  predict3();
  predict4();

  separator("FIX 1: Search must check isEnd");

  const ft1 = new Fix1Trie();
  ft1.insert("hello");
  console.log("search 'hello':", ft1.search("hello")); // true
  console.log("search 'hell':", ft1.search("hell"));   // false
  console.log("search 'helloo':", ft1.search("helloo")); // false

  separator("FIX 2: startsWith must walk trie");

  const ft2 = new Fix2Trie();
  ft2.insert("apple");
  console.log("starts 'app':", ft2.startsWith("app"));   // true
  console.log("starts 'axx':", ft2.startsWith("axx"));   // false
  console.log("starts 'apple':", ft2.startsWith("apple")); // true

  separator("IMPLEMENT 1: Trie (insert, search, startsWith)");

  const trie = new Trie();
  trie.insert("apple");
  console.log("search 'apple':", trie.search("apple"));       // true
  console.log("search 'app':", trie.search("app"));           // false
  console.log("startsWith 'app':", trie.startsWith("app"));   // true
  trie.insert("app");
  console.log("search 'app' after insert:", trie.search("app")); // true

  separator("IMPLEMENT 2: Autocomplete");

  const t2 = new Trie();
  ["cat", "car", "card", "care", "cargo", "dog"].forEach((w) => t2.insert(w));
  console.log("Autocomplete 'car':", autocomplete(t2, "car"));
  console.log("Autocomplete 'ca':", autocomplete(t2, "ca"));
  console.log("Autocomplete 'do':", autocomplete(t2, "do"));
  console.log("Autocomplete 'z':", autocomplete(t2, "z"));

  separator("IMPLEMENT 3: Word Dictionary (wildcard)");

  const wd = new WordDictionary();
  wd.addWord("bad");
  wd.addWord("dad");
  wd.addWord("mad");
  console.log("search 'pad':", wd.search("pad")); // false
  console.log("search 'bad':", wd.search("bad")); // true
  console.log("search '.ad':", wd.search(".ad")); // true
  console.log("search 'b..':", wd.search("b..")); // true
  console.log("search '...':", wd.search("...")); // true
  console.log("search '..':", wd.search(".."));   // false

  separator("IMPLEMENT 4: Longest Common Prefix");

  console.log("LCP ['flower','flow','flight']:", longestCommonPrefix(["flower", "flow", "flight"])); // fl
  console.log("LCP ['dog','racecar','car']:", longestCommonPrefix(["dog", "racecar", "car"]));       // ""
  console.log(
    "LCP ['interspecies','interstellar','interstate']:",
    longestCommonPrefix(["interspecies", "interstellar", "interstate"])
  ); // inters

  separator("IMPLEMENT 5: Count Words with Prefix");

  const ct = new CountTrie();
  ["apple", "app", "application", "apt", "bat"].forEach((w) => ct.insert(w));
  console.log("Count 'app':", ct.countWordsWithPrefix("app")); // 3
  console.log("Count 'ap':", ct.countWordsWithPrefix("ap"));   // 4
  console.log("Count 'b':", ct.countWordsWithPrefix("b"));     // 1
  console.log("Count 'z':", ct.countWordsWithPrefix("z"));     // 0

  separator("IMPLEMENT 6: Deletable Trie");

  const dt = new DeletableTrie();
  dt.insert("apple");
  dt.insert("app");
  dt.insert("application");
  console.log("Before delete:");
  console.log("  search 'apple':", dt.search("apple"));             // true
  console.log("  search 'app':", dt.search("app"));                 // true
  console.log("  search 'application':", dt.search("application")); // true

  dt.delete("apple");
  console.log("After delete 'apple':");
  console.log("  search 'apple':", dt.search("apple"));             // false
  console.log("  search 'app':", dt.search("app"));                 // true
  console.log("  search 'application':", dt.search("application")); // true

  dt.delete("application");
  console.log("After delete 'application':");
  console.log("  search 'application':", dt.search("application")); // false
  console.log("  search 'app':", dt.search("app"));                 // true

  separator("ALL DONE");
}

main();
