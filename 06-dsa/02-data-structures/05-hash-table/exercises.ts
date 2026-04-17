// ============================================================================
// Hash Table - Exercises (15 total: 5 predict, 3 fix, 7 implement)
// Run: npx tsx exercises.ts
// ============================================================================

// ─── PREDICT EXERCISES (5) ──────────────────────────────────────────────────

// Exercise 1: Predict - Map basics
// What does this print?
function predict1(): void {
  const map = new Map<string, number>();
  map.set("a", 1);
  map.set("b", 2);
  map.set("a", 3);
  console.log(map.get("a"));
  console.log(map.size);
  map.delete("b");
  console.log(map.has("b"));
  console.log(map.size);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
  // Line 3: ???
  // Line 4: ???
}

// Exercise 2: Predict - Set operations
// What does this print?
function predict2(): void {
  const set = new Set<number>();
  set.add(1);
  set.add(2);
  set.add(3);
  set.add(2);
  set.add(1);
  console.log(set.size);
  set.delete(2);
  console.log([...set].join(","));
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
}

// Exercise 3: Predict - Frequency counting
// What does this print?
function predict3(): void {
  const s = "abracadabra";
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  console.log(freq.get("a"));
  console.log(freq.get("b"));
  console.log(freq.get("z"));
  console.log(freq.size);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
  // Line 3: ???
  // Line 4: ???
}

// Exercise 4: Predict - Object as hash map
// What does this print?
function predict4(): void {
  const obj: Record<string, number> = {};
  obj["1"] = 10;
  obj[1] = 20;
  console.log(Object.keys(obj).length);
  console.log(obj["1"]);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
}

// Exercise 5: Predict - Map iteration order
// What does this print?
function predict5(): void {
  const map = new Map<string, number>();
  map.set("c", 3);
  map.set("a", 1);
  map.set("b", 2);
  map.set("a", 10);

  const keys: string[] = [];
  for (const [key] of map) {
    keys.push(key);
  }
  console.log(keys.join(","));
  console.log(map.get("a"));
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
}

// ─── FIX EXERCISES (3) ─────────────────────────────────────────────────────

// Exercise 6: Fix - Two Sum
// This two sum implementation has a bug — it can match an element with itself.
function fix6TwoSum(nums: number[], target: number): [number, number] | null {
  const map = new Map<number, number>();
  // BUG: populates entire map first, then searches
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i);
  }
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) { // BUG: may find itself
      return [i, map.get(complement)!];
    }
  }
  return null;
}

// Test:
// console.log(fix6TwoSum([3, 3], 6)); // Expected: [0, 1]
// console.log(fix6TwoSum([3, 2, 4], 6)); // Expected: [1, 2] (not [0, 0])

// Exercise 7: Fix - Group Anagrams
// This implementation produces incorrect grouping.
function fix7GroupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split("").join(""); // BUG: key is the string itself, not sorted
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.values());
}

// Test:
// console.log(fix7GroupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// Expected: [["eat","tea","ate"],["tan","nat"],["bat"]]

// Exercise 8: Fix - Frequency-based sort
// This function should sort characters by frequency (highest first) but has a bug.
function fix8FrequencySort(s: string): string {
  const freq = new Map<string, number>();
  for (const ch of s) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  // BUG: sorting in ascending instead of descending order
  const sorted = [...freq.entries()].sort((a, b) => a[1] - b[1]);
  let result = "";
  for (const [ch, count] of sorted) {
    result += ch.repeat(count);
  }
  return result;
}

// Test:
// console.log(fix8FrequencySort("tree")); // Expected: "eert" or "eetr" (e appears most)

// ─── IMPLEMENT EXERCISES (7) ───────────────────────────────────────────────

// Exercise 9: Implement - Simple Hash Table
// Implement a hash table with string keys using chaining for collision handling.
interface IHashTable<V> {
  set(key: string, value: V): void;
  get(key: string): V | undefined;
  delete(key: string): boolean;
  has(key: string): boolean;
  readonly size: number;
}

// TODO: Implement HashTable<V>
// class HashTable<V> implements IHashTable<V> { ... }

// Test:
// const ht = new HashTable<number>();
// ht.set("a", 1); ht.set("b", 2); ht.set("a", 3);
// console.log(ht.get("a")); // 3
// console.log(ht.size); // 2
// console.log(ht.has("b")); // true
// ht.delete("b");
// console.log(ht.has("b")); // false

// Exercise 10: Implement - Frequency Counter
// Return a Map of character frequencies in a string.
function frequencyCounter(_s: string): Map<string, number> {
  // TODO: Implement
  return new Map();
}

// Test:
// console.log(frequencyCounter("hello")); // Map { 'h'=>1, 'e'=>1, 'l'=>2, 'o'=>1 }

// Exercise 11: Implement - Two Sum
// Given an array of numbers and a target, return indices of the two numbers that add up
// to the target. Use a hash map for O(n) solution.
function twoSum(_nums: number[], _target: number): [number, number] | null {
  // TODO: Implement
  return null;
}

// Test:
// console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
// console.log(twoSum([3, 2, 4], 6)); // [1, 2]
// console.log(twoSum([1, 2, 3], 10)); // null

// Exercise 12: Implement - Group Anagrams
// Group an array of strings into anagram groups.
function groupAnagrams(_strs: string[]): string[][] {
  // TODO: Implement
  return [];
}

// Test:
// console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// Expected: [["eat","tea","ate"],["tan","nat"],["bat"]]

// Exercise 13: Implement - First Non-Repeating Character
// Return the index of the first non-repeating character in a string, or -1 if none.
function firstUniqChar(_s: string): number {
  // TODO: Implement
  return -1;
}

// Test:
// console.log(firstUniqChar("leetcode")); // 0 ('l')
// console.log(firstUniqChar("loveleetcode")); // 2 ('v')
// console.log(firstUniqChar("aabb")); // -1

// Exercise 14: Implement - Intersection of Two Arrays
// Return an array of unique elements common to both arrays.
function intersection(_nums1: number[], _nums2: number[]): number[] {
  // TODO: Implement
  return [];
}

// Test:
// console.log(intersection([1,2,2,1], [2,2])); // [2]
// console.log(intersection([4,9,5], [9,4,9,8,4])); // [4,9] or [9,4]

// Exercise 15: Implement - Longest Consecutive Sequence
// Given an unsorted array, find the length of the longest consecutive elements sequence.
// Must be O(n). Example: [100, 4, 200, 1, 3, 2] → 4 (sequence: 1,2,3,4)
function longestConsecutive(_nums: number[]): number {
  // TODO: Implement using a Set
  return 0;
}

// Test:
// console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4
// console.log(longestConsecutive([0,3,7,2,5,8,4,6,0,1])); // 9
// console.log(longestConsecutive([])); // 0

// ─── Runner ────────────────────────────────────────────────────────────────

console.log("=== Hash Table Exercises ===\n");

console.log("--- Predict 1 ---");
predict1();

console.log("\n--- Predict 2 ---");
predict2();

console.log("\n--- Predict 3 ---");
predict3();

console.log("\n--- Predict 4 ---");
predict4();

console.log("\n--- Predict 5 ---");
predict5();

console.log("\n--- Fix 6 (broken) ---");
console.log(fix6TwoSum([3, 3], 6));
console.log(fix6TwoSum([3, 2, 4], 6), "expected [1,2]");

console.log("\n--- Fix 7 (broken) ---");
console.log(fix7GroupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));

console.log("\n--- Fix 8 (broken) ---");
console.log(fix8FrequencySort("tree"), "expected 'eert' or 'eetr'");

console.log("\n--- Implement exercises: uncomment tests above when ready ---");
