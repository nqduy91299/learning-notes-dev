# Trie (Prefix Tree)

## Overview

A **Trie** (pronounced "try") is a tree-like data structure used for efficient storage
and retrieval of strings. Each node represents a single character, and paths from the
root to marked nodes represent complete words.

Also known as a **prefix tree** because shared prefixes share the same path in the tree.

---

## Why Trie?

Consider storing and searching words in a list of 100,000 words:

| Operation       | Array/List  | Hash Map | Trie         |
| --------------- | ----------- | -------- | ------------ |
| Search word     | O(n * m)    | O(m)     | O(m)         |
| Prefix search   | O(n * m)    | O(n * m) | O(m)         |
| Autocomplete    | O(n * m)    | O(n * m) | O(m + results)|
| Insert          | O(1) / O(m) | O(m)     | O(m)         |

Where `n` = number of words, `m` = length of query string.

The trie excels at **prefix-based operations** — something hash maps cannot do efficiently.

---

## TrieNode Structure

Each node contains:
1. A map of children (character → child node).
2. A boolean flag indicating if this node marks the end of a word.

```typescript
interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
}
```

**Visual example** — storing "cat", "car", "card", "do", "dog":

```
        root
       /    \
      c      d
      |      |
      a      o
     / \     |  \
    t   r    g   (end: "do")
    |   |    |
  (end) d  (end: "dog")
        |
      (end: "card")

(end: "cat") at 't'
(end: "car") at 'r'
```

---

## Core Operations

### Insert

Walk down the trie character by character. Create nodes for missing characters.
Mark the final node as end-of-word.

```
Insert "cat":
root → c (create) → a (create) → t (create, mark end)

Insert "car":
root → c (exists) → a (exists) → r (create, mark end)
```

**Time**: O(m) where m = word length
**Space**: O(m) worst case (all new nodes)

### Search

Walk down the trie character by character. If any character is missing, word doesn't
exist. If you reach the end, check the `isEndOfWord` flag.

```
Search "car":
root → c (found) → a (found) → r (found, isEnd=true) → FOUND

Search "ca":
root → c (found) → a (found, isEnd=false) → NOT FOUND (prefix only)

Search "cup":
root → c (found) → u (not found) → NOT FOUND
```

**Time**: O(m)

### StartsWith (Prefix Search)

Same as search but don't check `isEndOfWord`. If you can walk the entire prefix
without missing characters, the prefix exists.

```
StartsWith "ca":
root → c (found) → a (found) → PREFIX EXISTS

StartsWith "cu":
root → c (found) → u (not found) → PREFIX DOES NOT EXIST
```

**Time**: O(m)

### Delete

Walk to the end of the word, unmark `isEndOfWord`. Optionally clean up nodes that
are no longer needed (no children and not end of another word).

**Time**: O(m)

---

## Space Complexity

**Worst case**: O(N * M * K) where:
- N = number of words
- M = average word length
- K = alphabet size (26 for lowercase English)

**In practice**: Much less due to shared prefixes. Words like "prefix", "preload",
"preview" share the "pre" path (3 nodes instead of 9).

### Trie vs Hash Map for Memory

| Aspect          | Trie                          | Hash Map              |
| --------------- | ----------------------------- | --------------------- |
| Shared prefixes | Yes — saves memory            | No — stores full keys |
| Per-node cost   | Higher (map + flag)           | Lower per entry       |
| Many similar keys| Trie wins                    | Hash map wastes space |
| Random keys     | Trie wastes space             | Hash map wins         |

---

## Trie vs Hash Map

| Operation            | Trie     | Hash Map |
| -------------------- | -------- | -------- |
| Exact search         | O(m)     | O(m) avg |
| Prefix search        | O(m)     | O(n * m) |
| Autocomplete         | O(m + k) | O(n * m) |
| Sorted iteration     | Natural  | Must sort|
| Longest common prefix| O(m)     | O(n * m) |
| Memory (similar keys)| Efficient| Redundant|
| Memory (random keys) | Wasteful | Efficient|
| Implementation       | Complex  | Simple   |

**Use Trie when**: Prefix operations, autocomplete, spell checking, IP routing,
word games, sorted string iteration.

**Use Hash Map when**: Only exact lookups needed, keys are very different, simpler
implementation is preferred.

---

## Autocomplete

Given a prefix, find all words that start with it:

1. Walk to the node at the end of the prefix.
2. From that node, run DFS to collect all words.

```
Trie contains: "cat", "car", "card", "care", "do", "dog"

Autocomplete "car":
Walk to: root → c → a → r
DFS from 'r': "car" (end), "card" (end), "care" (end)
Result: ["car", "card", "care"]
```

**Time**: O(m + k) where m = prefix length, k = total characters in results.

---

## Word Dictionary (Wildcard Search)

Search with wildcards (e.g., `.` matches any character):

```
Search "c.r":
At 'c' → go to c
At '.' → try ALL children of c's child → 'a'
At 'r' → check 'a' has child 'r' with isEnd → "car" matches
```

Uses DFS with branching at wildcard characters.

**Time**: O(m * K) per wildcard character, where K = alphabet size.

---

## Longest Common Prefix

Find the longest prefix shared by all words in the trie:

Walk from root while:
- Current node has exactly one child.
- Current node is not end-of-word (otherwise some word ends here).

```
Words: "flower", "flow", "flight"

root → f → l → (two children: 'o' and 'i')
Longest common prefix: "fl"
```

**Time**: O(m) where m = length of shortest word.

---

## Common Patterns

### Pattern 1: Build trie, then query

```
1. Insert all words into trie.
2. For each query, walk the trie.
```

Used in: autocomplete, spell checker, word search.

### Pattern 2: Character-by-character matching

Process input one character at a time, maintaining position in trie.

Used in: stream matching, real-time search suggestions.

### Pattern 3: Trie + DFS/Backtracking

Combine trie with grid/board traversal for word search problems.

Used in: Boggle, word search II.

### Pattern 4: Count with trie

Store counts at nodes to answer "how many words have this prefix?"

```typescript
interface CountTrieNode {
  children: Map<string, CountTrieNode>;
  wordCount: number;    // words ending here
  prefixCount: number;  // words passing through here
}
```

---

## Edge Cases

- Empty string insertion/search
- Single character words
- Words that are prefixes of other words ("car" and "card")
- Very long words
- Unicode characters (if applicable)
- Case sensitivity

---

## Complexity Summary

| Operation       | Time | Space  |
| --------------- | ---- | ------ |
| Insert          | O(m) | O(m)   |
| Search          | O(m) | O(1)   |
| StartsWith      | O(m) | O(1)   |
| Delete          | O(m) | O(1)   |
| Autocomplete    | O(m + k) | O(k) |
| Build trie (n words) | O(n * m) | O(n * m) |

Where m = word length, k = result characters, n = number of words.

---

## Summary

- A trie is a tree where each path represents a string prefix.
- Core operations (insert, search, startsWith) all run in O(m) time.
- Tries excel at prefix-based operations — autocomplete, prefix counting, longest
  common prefix.
- Trade-off: more memory per node than a hash map, but shared prefixes reduce waste.
- Common in interviews: implement basic trie, autocomplete, word dictionary with
  wildcards, word search on grid.
- When you see "prefix", "autocomplete", or "dictionary" in a problem — think trie.
