// ============================================================================
// Hash Table - Solutions
// Run: npx tsx solutions.ts
// ============================================================================

// ─── PREDICT SOLUTIONS ─────────────────────────────────────────────────────

// Solution 1: Map basics
function solvePrediction1(): void {
  console.log("--- Predict 1 ---");
  const map = new Map<string, number>();
  map.set("a", 1);
  map.set("b", 2);
  map.set("a", 3);       // overwrites "a"
  console.log(map.get("a")); // 3
  console.log(map.size);     // 2
  map.delete("b");
  console.log(map.has("b")); // false
  console.log(map.size);     // 1
  // Answer: 3, 2, false, 1
}

// Solution 2: Set operations
function solvePrediction2(): void {
  console.log("\n--- Predict 2 ---");
  const set = new Set<number>();
  set.add(1); set.add(2); set.add(3); set.add(2); set.add(1);
  console.log(set.size);           // 3 (duplicates ignored)
  set.delete(2);
  console.log([...set].join(",")); // "1,3" (insertion order, 2 removed)
  // Answer: 3, "1,3"
}

// Solution 3: Frequency counting
function solvePrediction3(): void {
  console.log("\n--- Predict 3 ---");
  // "abracadabra" -> a:5, b:2, r:2, c:1, d:1
  const s = "abracadabra";
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  console.log(freq.get("a")); // 5
  console.log(freq.get("b")); // 2
  console.log(freq.get("z")); // undefined
  console.log(freq.size);     // 5 (a, b, r, c, d)
  // Answer: 5, 2, undefined, 5
}

// Solution 4: Object as hash map
function solvePrediction4(): void {
  console.log("\n--- Predict 4 ---");
  const obj: Record<string, number> = {};
  obj["1"] = 10;
  obj[1] = 20;  // numeric key 1 is coerced to string "1", overwrites
  console.log(Object.keys(obj).length); // 1
  console.log(obj["1"]);               // 20
  // Answer: 1, 20
}

// Solution 5: Map iteration order
function solvePrediction5(): void {
  console.log("\n--- Predict 5 ---");
  const map = new Map<string, number>();
  map.set("c", 3);
  map.set("a", 1);
  map.set("b", 2);
  map.set("a", 10); // updates "a" but doesn't change insertion order
  const keys: string[] = [];
  for (const [key] of map) {
    keys.push(key);
  }
  console.log(keys.join(",")); // "c,a,b" (insertion order preserved)
  console.log(map.get("a"));  // 10
  // Answer: "c,a,b", 10
}

// ─── FIX SOLUTIONS ─────────────────────────────────────────────────────────

// Solution 6: Fix - Two Sum
// BUG: Pre-populates the entire map, so when a number appears twice (e.g., [3,3]),
// the second index overwrites the first. Also, it can match element with itself
// if complement === nums[i] and only one such element exists.
// FIX: Use single-pass approach — check before inserting.
function fix6TwoSumSolution(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i]; // FIX: found complement from earlier index
    }
    map.set(nums[i], i); // FIX: insert after checking
  }
  return null;
}

// Solution 7: Fix - Group Anagrams
// BUG: Key is the string itself instead of sorted characters.
// FIX: Sort the characters to create the key.
function fix7GroupAnagramsSolution(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split("").sort().join(""); // FIX: sort characters
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}

// Solution 8: Fix - Frequency-based sort
// BUG: Sorting ascending (a[1] - b[1]) instead of descending.
// FIX: Sort descending (b[1] - a[1]).
function fix8FrequencySortSolution(s: string): string {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]); // FIX: descending
  let result = "";
  for (const [ch, count] of sorted) {
    result += ch.repeat(count);
  }
  return result;
}

// ─── IMPLEMENT SOLUTIONS ───────────────────────────────────────────────────

// Solution 9: Simple Hash Table
interface IHashTable<V> {
  set(key: string, value: V): void;
  get(key: string): V | undefined;
  delete(key: string): boolean;
  has(key: string): boolean;
  readonly size: number;
}

class HashTable<V> implements IHashTable<V> {
  private buckets: Array<Array<[string, V]>>;
  private tableSize: number;
  private count: number = 0;

  constructor(tableSize: number = 53) {
    this.tableSize = tableSize;
    this.buckets = Array.from({ length: tableSize }, () => []);
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
      this.count++;
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
    this.count--;
    return true;
  }

  has(key: string): boolean {
    const idx = this.hash(key);
    return this.buckets[idx].some(([k]) => k === key);
  }

  get size(): number { return this.count; }
}

// Solution 10: Frequency Counter
function frequencyCounter(s: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}

// Solution 11: Two Sum
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

// Solution 12: Group Anagrams
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}

// Solution 13: First Non-Repeating Character
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

// Solution 14: Intersection of Two Arrays
function intersection(nums1: number[], nums2: number[]): number[] {
  const set1 = new Set(nums1);
  const set2 = new Set(nums2);
  const result: number[] = [];
  for (const n of set1) {
    if (set2.has(n)) result.push(n);
  }
  return result;
}

// Solution 15: Longest Consecutive Sequence
function longestConsecutive(nums: number[]): number {
  const set = new Set(nums);
  let longest = 0;

  for (const num of set) {
    // Only start counting from the beginning of a sequence
    if (!set.has(num - 1)) {
      let current = num;
      let streak = 1;
      while (set.has(current + 1)) {
        current++;
        streak++;
      }
      longest = Math.max(longest, streak);
    }
  }

  return longest;
}

// ─── Test Runner ───────────────────────────────────────────────────────────

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`  FAIL: ${msg}`);
  } else {
    console.log(`  PASS: ${msg}`);
  }
}

function runAllTests(): void {
  console.log("=== Hash Table Solutions ===\n");

  // Predictions
  solvePrediction1();
  solvePrediction2();
  solvePrediction3();
  solvePrediction4();
  solvePrediction5();

  // Fix 6
  console.log("\n--- Fix 6 Solution ---");
  const r6a = fix6TwoSumSolution([3, 3], 6);
  assert(r6a !== null && r6a[0] === 0 && r6a[1] === 1, "[3,3] target 6 -> [0,1]");
  const r6b = fix6TwoSumSolution([3, 2, 4], 6);
  assert(r6b !== null && r6b[0] === 1 && r6b[1] === 2, "[3,2,4] target 6 -> [1,2]");

  // Fix 7
  console.log("\n--- Fix 7 Solution ---");
  const r7 = fix7GroupAnagramsSolution(["eat", "tea", "tan", "ate", "nat", "bat"]);
  assert(r7.length === 3, "3 anagram groups");
  const group1 = r7.find(g => g.includes("eat"));
  assert(group1 !== undefined && group1.length === 3, "eat group has 3 members");

  // Fix 8
  console.log("\n--- Fix 8 Solution ---");
  const r8 = fix8FrequencySortSolution("tree");
  assert(r8.startsWith("ee"), "frequency sort starts with 'ee'");

  // Solution 9: HashTable
  console.log("\n--- Solution 9: Hash Table ---");
  const ht = new HashTable<number>();
  ht.set("a", 1); ht.set("b", 2); ht.set("a", 3);
  assert(ht.get("a") === 3, "get 'a' = 3");
  assert(ht.size === 2, "size 2");
  assert(ht.has("b"), "has 'b'");
  ht.delete("b");
  assert(!ht.has("b"), "deleted 'b'");
  assert(ht.size === 1, "size 1 after delete");

  // Solution 10: Frequency Counter
  console.log("\n--- Solution 10: Frequency Counter ---");
  const freq = frequencyCounter("hello");
  assert(freq.get("l") === 2, "'l' appears 2 times");
  assert(freq.get("h") === 1, "'h' appears 1 time");
  assert(freq.size === 4, "4 unique chars");

  // Solution 11: Two Sum
  console.log("\n--- Solution 11: Two Sum ---");
  const ts1 = twoSum([2, 7, 11, 15], 9);
  assert(ts1 !== null && ts1[0] === 0 && ts1[1] === 1, "twoSum [2,7,11,15] target 9");
  const ts2 = twoSum([3, 2, 4], 6);
  assert(ts2 !== null && ts2[0] === 1 && ts2[1] === 2, "twoSum [3,2,4] target 6");
  assert(twoSum([1, 2, 3], 10) === null, "twoSum no solution");

  // Solution 12: Group Anagrams
  console.log("\n--- Solution 12: Group Anagrams ---");
  const ga = groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  assert(ga.length === 3, "3 groups");

  // Solution 13: First Unique Character
  console.log("\n--- Solution 13: First Unique Character ---");
  assert(firstUniqChar("leetcode") === 0, "leetcode -> 0");
  assert(firstUniqChar("loveleetcode") === 2, "loveleetcode -> 2");
  assert(firstUniqChar("aabb") === -1, "aabb -> -1");

  // Solution 14: Intersection
  console.log("\n--- Solution 14: Intersection ---");
  const int1 = intersection([1, 2, 2, 1], [2, 2]);
  assert(int1.length === 1 && int1.includes(2), "[1,2,2,1] ∩ [2,2] = [2]");
  const int2 = intersection([4, 9, 5], [9, 4, 9, 8, 4]);
  assert(int2.length === 2, "[4,9,5] ∩ [9,4,9,8,4] has 2 elements");

  // Solution 15: Longest Consecutive Sequence
  console.log("\n--- Solution 15: Longest Consecutive ---");
  assert(longestConsecutive([100, 4, 200, 1, 3, 2]) === 4, "longest = 4");
  assert(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) === 9, "longest = 9");
  assert(longestConsecutive([]) === 0, "empty = 0");

  console.log("\n=== All tests complete ===");
}

runAllTests();
