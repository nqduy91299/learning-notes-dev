// ============================================================================
// Trie — Exercises (12 exercises: 4 predict, 2 fix, 6 implement)
// ============================================================================
// Run: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ---------------------------------------------------------------------------
// PREDICT EXERCISES (4) — What does the code output?
// ---------------------------------------------------------------------------

// --- Predict 1 ---
// What does this print?
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
}
// Your prediction: __________
// predict1();

// --- Predict 2 ---
// What does this print?
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
}
// Your prediction: __________
// predict2();

// --- Predict 3 ---
// What does this print?
function predict3(): void {
  const words = ["app", "apple", "application", "apt"];
  let commonPrefix = "";

  // Simulating trie walk: find common prefix
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
}
// Your prediction: __________
// predict3();

// --- Predict 4 ---
// What does this print?
function predict4(): void {
  const trie = new Map<string, Map<string, boolean | Map<string, unknown>>>();

  // Insert "do"
  const dMap = new Map<string, boolean | Map<string, unknown>>();
  const oMap = new Map<string, boolean | Map<string, unknown>>();
  oMap.set("$end", true);
  dMap.set("o", oMap);
  trie.set("d", dMap);

  // Check: does prefix "d" exist?
  const hasD = trie.has("d");
  // Check: is "d" a complete word?
  const dIsWord = trie.get("d")?.get("$end") === true;
  // Check: is "do" a complete word?
  const doNode = trie.get("d")?.get("o") as Map<string, unknown> | undefined;
  const doIsWord = doNode?.get("$end") === true;

  console.log("Predict 4:", hasD, dIsWord, doIsWord);
}
// Your prediction: __________
// predict4();

// ---------------------------------------------------------------------------
// FIX EXERCISES (2) — Find and fix the bug(s)
// ---------------------------------------------------------------------------

// --- Fix 1 ---
// Search always returns false even for inserted words.
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
    return true; // BUG: doesn't check isEnd
  }
}
// Test:
// const ft1 = new Fix1Trie();
// ft1.insert("hello");
// console.log("Fix 1 search hello:", ft1.search("hello")); // should be true
// console.log("Fix 1 search hell:", ft1.search("hell"));   // should be false

// --- Fix 2 ---
// startsWith always returns true for any prefix.
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

  startsWith(_prefix: string): boolean {
    // BUG: never actually walks the trie
    return this.children.size > 0;
  }
}
// Test:
// const ft2 = new Fix2Trie();
// ft2.insert("apple");
// console.log("Fix 2 starts 'app':", ft2.startsWith("app"));   // true
// console.log("Fix 2 starts 'axx':", ft2.startsWith("axx"));   // should be false

// ---------------------------------------------------------------------------
// IMPLEMENT EXERCISES (6)
// ---------------------------------------------------------------------------

// --- Implement 1 ---
// Implement a Trie class with insert, search, and startsWith.
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(_word: string): void {
    // TODO
  }

  search(_word: string): boolean {
    // TODO
    return false;
  }

  startsWith(_prefix: string): boolean {
    // TODO
    return false;
  }
}
// Test:
// const trie = new Trie();
// trie.insert("apple");
// console.log(trie.search("apple"));      // true
// console.log(trie.search("app"));        // false
// console.log(trie.startsWith("app"));    // true
// trie.insert("app");
// console.log(trie.search("app"));        // true

// --- Implement 2 ---
// Autocomplete — given a trie and a prefix, return all words with that prefix.
function autocomplete(_trie: Trie, _prefix: string): string[] {
  // TODO: You may need to add helper methods to Trie or work with TrieNode directly.
  // Hint: walk to the prefix node, then DFS to collect all words.
  return [];
}
// Test:
// const t2 = new Trie();
// ["cat", "car", "card", "care", "cargo", "dog"].forEach(w => t2.insert(w));
// console.log("Autocomplete 'car':", autocomplete(t2, "car"));
// // ["car", "card", "care", "cargo"]

// --- Implement 3 ---
// Word Dictionary — implement a class that supports addWord and search.
// search(word) can contain '.' which matches any single character.
class WordDictionary {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  addWord(_word: string): void {
    // TODO
  }

  search(_word: string): boolean {
    // TODO: handle '.' wildcard with DFS
    return false;
  }
}
// Test:
// const wd = new WordDictionary();
// wd.addWord("bad");
// wd.addWord("dad");
// wd.addWord("mad");
// console.log(wd.search("pad")); // false
// console.log(wd.search("bad")); // true
// console.log(wd.search(".ad")); // true
// console.log(wd.search("b..")); // true

// --- Implement 4 ---
// Longest common prefix — given an array of strings, find the longest common prefix
// using a trie.
function longestCommonPrefix(_words: string[]): string {
  // TODO: insert all words into a trie, then walk while single child and not end
  return "";
}
// Test:
// console.log("LCP:", longestCommonPrefix(["flower", "flow", "flight"])); // "fl"
// console.log("LCP:", longestCommonPrefix(["dog", "racecar", "car"]));    // ""
// console.log("LCP:", longestCommonPrefix(["interspecies", "interstellar", "interstate"])); // "inters"

// --- Implement 5 ---
// Count words with a given prefix — return how many inserted words start with prefix.
class CountTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(_word: string): void {
    // TODO
  }

  countWordsWithPrefix(_prefix: string): number {
    // TODO: walk to prefix node, then count all words below (DFS)
    return 0;
  }
}
// Test:
// const ct = new CountTrie();
// ["apple", "app", "application", "apt", "bat"].forEach(w => ct.insert(w));
// console.log("Count 'app':", ct.countWordsWithPrefix("app")); // 3
// console.log("Count 'ap':", ct.countWordsWithPrefix("ap"));   // 4
// console.log("Count 'b':", ct.countWordsWithPrefix("b"));     // 1
// console.log("Count 'z':", ct.countWordsWithPrefix("z"));     // 0

// --- Implement 6 ---
// Delete a word from a trie. Only remove nodes that are not shared with other words.
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

  delete(_word: string): boolean {
    // TODO: return true if word was deleted, false if it didn't exist.
    // Remove nodes that are no longer needed (not prefix of another word).
    // Hint: use recursion — delete bottom-up, prune if node has no children and !isEnd.
    return false;
  }
}
// Test:
// const dt = new DeletableTrie();
// dt.insert("apple");
// dt.insert("app");
// console.log("Before delete:", dt.search("apple"), dt.search("app")); // true true
// dt.delete("apple");
// console.log("After delete:", dt.search("apple"), dt.search("app")); // false true

// ============================================================================
// Suppress unused warnings
// ============================================================================
void predict1;
void predict2;
void predict3;
void predict4;
void Fix1Trie;
void Fix2Trie;
void Trie;
void TrieNode;
void autocomplete;
void WordDictionary;
void longestCommonPrefix;
void CountTrie;
void DeletableTrie;
