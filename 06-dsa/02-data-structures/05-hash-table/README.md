# Hash Table

## Overview

A **hash table** (hash map) is a data structure that maps keys to values using a **hash
function**. It provides **O(1) average-case** time complexity for insertion, deletion, and
lookup — making it one of the most practically useful data structures.

## Hash Function Concept

A hash function converts a key into an array index:

```
key → hash(key) → index in array
```

```
"alice" → hash("alice") → 3
"bob"   → hash("bob")   → 7
"carol" → hash("carol") → 1

Array:  [ _, carol, _, alice, _, _, _, bob, _, _ ]
Index:    0    1    2    3    4   5   6   7   8  9
```

### Properties of a Good Hash Function

1. **Deterministic:** Same input always produces same output
2. **Uniform distribution:** Spreads keys evenly across the array
3. **Fast to compute:** O(1) or O(k) where k is key length
4. **Minimizes collisions:** Different keys rarely map to the same index

### Simple Hash Function Example

```typescript
function hash(key: string, tableSize: number): number {
  let total = 0;
  for (let i = 0; i < key.length; i++) {
    total += key.charCodeAt(i);
  }
  return total % tableSize;
}
```

This is a poor hash function (anagrams collide), but illustrates the concept. Real
implementations use more sophisticated algorithms (DJB2, FNV-1a, MurmurHash, etc.).

## Collision Handling

When two different keys hash to the same index, we have a **collision**. There are two
primary strategies to handle collisions.

### 1. Chaining (Separate Chaining)

Each slot in the array holds a linked list (or array) of all entries that hash to that index.

```
Index 0: → null
Index 1: → ("carol", 30) → null
Index 2: → null
Index 3: → ("alice", 25) → ("dave", 28) → null   ← collision!
Index 4: → null
```

```typescript
class ChainingHashTable<V> {
  private buckets: Array<Array<[string, V]>>;
  private tableSize: number;

  constructor(size: number = 53) {
    this.tableSize = size;
    this.buckets = Array.from({ length: size }, () => []);
  }

  private hash(key: string): number {
    let total = 0;
    const prime = 31;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      total = (total * prime + key.charCodeAt(i)) % this.tableSize;
    }
    return total;
  }

  set(key: string, value: V): void {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.find(([k]) => k === key);
    if (existing) {
      existing[1] = value;
    } else {
      bucket.push([key, value]);
    }
  }

  get(key: string): V | undefined {
    const idx = this.hash(key);
    const entry = this.buckets[idx].find(([k]) => k === key);
    return entry?.[1];
  }

  delete(key: string): boolean {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    return true;
  }
}
```

**Pros:** Simple, never runs out of space, deletion is straightforward
**Cons:** Extra memory for pointers, poor cache locality

### 2. Open Addressing

All entries are stored in the array itself. When a collision occurs, we **probe** for the
next available slot.

**Linear Probing:** Check index+1, index+2, index+3, ...

```
hash("alice") = 3  → slot 3 (empty, place here)
hash("dave")  = 3  → slot 3 (occupied), try 4 (empty, place here)
hash("eve")   = 3  → slot 3 (occupied), try 4 (occupied), try 5 (empty, place here)
```

**Quadratic Probing:** Check index+1², index+2², index+3², ...
Reduces clustering compared to linear probing.

**Double Hashing:** Use a second hash function to determine the probe step size.

**Pros:** Better cache locality, no extra pointers
**Cons:** Clustering issues, complex deletion (requires tombstones), table can fill up

## Load Factor and Resizing

The **load factor** (α) is the ratio of stored entries to table capacity:

```
α = number of entries / table capacity
```

| Load Factor | Impact |
|-------------|--------|
| α < 0.5    | Good performance, wastes some memory |
| α ≈ 0.7    | Good balance (typical resize threshold) |
| α > 0.8    | Performance degrades, more collisions |
| α > 1.0    | Only possible with chaining |

When the load factor exceeds the threshold, the table **resizes** (typically doubles):

1. Create a new array with 2× capacity
2. Rehash all existing entries (since indices change with new capacity)
3. Replace old array with new one

Resizing is O(n) but happens infrequently — **amortized O(1)** per operation.

## JavaScript Map, Set, and Object

### `Object`

- Keys are strings or symbols only
- Has prototype chain (inherited properties)
- No guaranteed iteration order (though modern engines use insertion order for string keys)
- Use for simple key-value data or when you need JSON serialization

### `Map`

- Keys can be **any type** (objects, functions, primitives)
- Guaranteed insertion-order iteration
- Has `.size` property
- Better performance for frequent additions/deletions
- No prototype pollution issues

### `Set`

- Stores **unique values** only (no key-value pairs)
- Values can be any type
- Has `.size`, `.has()`, `.add()`, `.delete()`
- Useful for deduplication and membership testing

```typescript
// Object
const obj: Record<string, number> = {};
obj["key"] = 1;

// Map
const map = new Map<string, number>();
map.set("key", 1);
map.get("key"); // 1
map.has("key"); // true
map.size;       // 1

// Set
const set = new Set<number>();
set.add(1);
set.add(1); // no effect (duplicate)
set.has(1); // true
set.size;   // 1
```

### When to Use Which?

| Feature | Object | Map | Set |
|---------|--------|-----|-----|
| Key types | string/symbol | any | n/a (values) |
| Order guaranteed | mostly | yes | yes |
| Size property | no (.keys().length) | yes | yes |
| Iteration | verbose | easy | easy |
| JSON support | native | manual | manual |
| Performance | good | better for dynamic | best for membership |

## Hash Map vs Hash Set

| | Hash Map | Hash Set |
|---|---------|----------|
| Stores | Key-value pairs | Keys only |
| JS equivalent | `Map`, `Object` | `Set` |
| Use case | Lookup value by key | Check membership |
| Example | frequency counting | deduplication |

## Time Complexity

| Operation | Average | Worst Case |
|-----------|---------|------------|
| Insert    | O(1)    | O(n)       |
| Lookup    | O(1)    | O(n)       |
| Delete    | O(1)    | O(n)       |

**Worst case O(n)** occurs when all keys hash to the same index (all entries in one bucket).
With a good hash function and proper load factor management, this is extremely rare.

## Common Patterns

### 1. Frequency Counting

```typescript
function charFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}
```

### 2. Two Sum

```typescript
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return null;
}
```

### 3. Group Anagrams

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}
```

### 4. First Unique Character

```typescript
function firstUniqChar(s: string): number {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  for (let i = 0; i < s.length; i++) {
    if (freq.get(s[i]) === 1) return i;
  }
  return -1;
}
```

## When to Use a Hash Table

- **Fast lookup required:** O(1) access by key
- **Counting/frequency:** count occurrences of elements
- **Deduplication:** track seen elements
- **Grouping:** group elements by a computed key
- **Caching/memoization:** store computed results
- **Two-pointer complement problems:** two sum, pair finding

## Key Takeaways

1. Hash tables provide O(1) average-case lookup, insert, and delete.
2. Collisions are inevitable — chaining and open addressing are the two main strategies.
3. Load factor management (resizing) keeps performance at O(1) amortized.
4. In JavaScript, prefer `Map` over `Object` for dynamic key-value storage and `Set` for
   membership testing.
5. The worst case is O(n) but practically never occurs with good hash functions.
6. Frequency counting, two sum, and group-by are the three most common hash table patterns.
7. Hash tables trade space for time — they use more memory than arrays but give faster lookup
   than linear search.
