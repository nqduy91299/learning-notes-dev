// ============================================================================
// Linked List - Exercises
// ============================================================================
// 18 exercises: 4 predict-output, 4 fix-the-bug, 10 implement
// All test code is commented out. No `any` types. Must compile with strict TS.
// Run with: npx tsx exercises.ts
// ============================================================================

// ============================================================================
// Shared Node Class
// ============================================================================
class ListNode<T> {
  val: T;
  next: ListNode<T> | null;

  constructor(val: T, next: ListNode<T> | null = null) {
    this.val = val;
    this.next = next;
  }
}

// Helper: create linked list from array
function createList<T>(arr: T[]): ListNode<T> | null {
  if (arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }
  return head;
}

// Helper: convert linked list to array
function toArray<T>(head: ListNode<T> | null): T[] {
  const result: T[] = [];
  let current = head;
  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

// ============================================================================
// PREDICT THE OUTPUT (Exercises 1-4)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Reference vs Value
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise1_predict(): void {
  const a = new ListNode(1, new ListNode(2, new ListNode(3)));
  const b = a;
  b.val = 99;

  console.log(a.val); // ???

  const c = a.next;
  a.next = new ListNode(42);

  console.log(c?.val);    // ???
  console.log(a.next.val); // ???
}

// Your answer:
// a.val = ???
// c?.val = ???
// a.next.val = ???

// ----------------------------------------------------------------------------
// Exercise 2: Traversal and Length
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise2_predict(): void {
  const head = createList([10, 20, 30, 40]);
  let count = 0;
  let current = head;

  while (current !== null) {
    count++;
    current = current.next;
  }

  console.log(count);     // ???
  console.log(head?.val); // ???  (is head still valid?)
}

// Your answer:
// count = ???
// head?.val = ???

// ----------------------------------------------------------------------------
// Exercise 3: Pointer Reassignment
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise3_predict(): void {
  const n1 = new ListNode(1);
  const n2 = new ListNode(2);
  const n3 = new ListNode(3);

  n1.next = n2;
  n2.next = n3;

  // Now: 1 -> 2 -> 3
  const saved = n1.next; // saved points to n2
  n1.next = n3;          // 1 -> 3

  console.log(toArray(n1));    // ???
  console.log(saved?.val);     // ???
  console.log(saved?.next?.val); // ???
}

// Your answer:
// toArray(n1) = ???
// saved?.val = ???
// saved?.next?.val = ???

// ----------------------------------------------------------------------------
// Exercise 4: Null Handling
// What does the console.log output?
// ----------------------------------------------------------------------------
function exercise4_predict(): void {
  const head = createList([5]);
  const second = head?.next;

  console.log(second);          // ???
  console.log(head?.next?.val); // ???

  if (head) {
    head.next = new ListNode(10);
  }
  console.log(head?.next?.val); // ???
  console.log(second);          // ???  (does second update?)
}

// Your answer:
// second = ???
// head?.next?.val (before) = ???
// head?.next?.val (after) = ???
// second (after) = ???

// ============================================================================
// FIX THE BUG (Exercises 5-8)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 5: Insert at Tail - Fix the bug
// Should append a new node at the end of the list.
// Bug: loses the rest of the list.
// ----------------------------------------------------------------------------
function exercise5_insertTailBuggy(
  head: ListNode<number> | null,
  val: number,
): ListNode<number> {
  const newNode = new ListNode(val);
  if (head === null) return newNode;

  let current = head;
  while (current !== null) {  // Bug: should check current.next
    current = current.next!;
  }
  current = newNode; // Bug: this doesn't attach to the list
  return head;
}

// Test (commented out):
// const list5 = createList([1, 2, 3]);
// const result5 = exercise5_insertTailBuggy(list5, 4);
// console.log(toArray(result5)); // should be [1, 2, 3, 4]

// ----------------------------------------------------------------------------
// Exercise 6: Delete Node by Value - Fix the bug
// Should delete first occurrence of val from the list.
// Bug: doesn't handle deleting the head node.
// ----------------------------------------------------------------------------
function exercise6_deleteBuggy(
  head: ListNode<number> | null,
  val: number,
): ListNode<number> | null {
  if (head === null) return null;
  // Bug: skips checking if head is the node to delete

  let current = head;
  while (current.next !== null) {
    if (current.next.val === val) {
      current.next = current.next.next;
      return head;
    }
    current = current.next;
  }
  return head;
}

// Test (commented out):
// const list6 = createList([1, 2, 3]);
// console.log(toArray(exercise6_deleteBuggy(list6, 1))); // should be [2, 3]

// ----------------------------------------------------------------------------
// Exercise 7: Reverse List - Fix the bug
// Should reverse the linked list in place.
// Bug: loses nodes during reversal.
// ----------------------------------------------------------------------------
function exercise7_reverseBuggy(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let prev: ListNode<number> | null = null;
  let current = head;

  while (current !== null) {
    current.next = prev;  // Bug: overwrites next before saving it
    prev = current;
    current = current.next; // Bug: current.next already changed
  }

  return prev;
}

// Test (commented out):
// const list7 = createList([1, 2, 3, 4, 5]);
// console.log(toArray(exercise7_reverseBuggy(list7))); // should be [5, 4, 3, 2, 1]

// ----------------------------------------------------------------------------
// Exercise 8: Find Middle - Fix the bug
// Should find the middle node using fast/slow pointers.
// Bug: crashes on even-length lists.
// ----------------------------------------------------------------------------
function exercise8_middleBuggy(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let slow = head;
  let fast = head;

  while (fast!.next !== null) { // Bug: fast could be null
    slow = slow!.next;
    fast = fast!.next.next;
  }

  return slow;
}

// Test (commented out):
// const list8 = createList([1, 2, 3, 4, 5, 6]);
// console.log(exercise8_middleBuggy(list8)?.val); // should be 4

// ============================================================================
// IMPLEMENT (Exercises 9-18)
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 9: Singly Linked List Class
// Implement a linked list with insert, delete, search, and toArray methods.
// ----------------------------------------------------------------------------
class exercise9_LinkedList {
  head: ListNode<number> | null = null;
  private size: number = 0;

  /** Insert value at the given index (0-based). */
  insertAt(index: number, val: number): void {
    // TODO
  }

  /** Delete the node at the given index (0-based). */
  deleteAt(index: number): void {
    // TODO
  }

  /** Return true if value exists in the list. */
  search(val: number): boolean {
    // TODO
    return false;
  }

  /** Return the list as an array. */
  toArray(): number[] {
    // TODO
    return [];
  }

  /** Return the number of nodes. */
  getSize(): number {
    return this.size;
  }
}

// Test (commented out):
// const ll = new exercise9_LinkedList();
// ll.insertAt(0, 10);
// ll.insertAt(1, 20);
// ll.insertAt(1, 15);
// console.log(ll.toArray()); // [10, 15, 20]
// ll.deleteAt(1);
// console.log(ll.toArray()); // [10, 20]
// console.log(ll.search(20)); // true
// console.log(ll.search(15)); // false

// ----------------------------------------------------------------------------
// Exercise 10: Reverse Linked List (Iterative)
// Reverse a singly linked list. Return new head.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function exercise10_reverse(
  head: ListNode<number> | null,
): ListNode<number> | null {
  // TODO
  return null;
}

// Test (commented out):
// console.log(toArray(exercise10_reverse(createList([1, 2, 3, 4, 5])))); // [5, 4, 3, 2, 1]

// ----------------------------------------------------------------------------
// Exercise 11: Detect Cycle
// Return true if the linked list has a cycle.
// Time: O(n), Space: O(1) - use Floyd's algorithm
// ----------------------------------------------------------------------------
function exercise11_hasCycle(head: ListNode<number> | null): boolean {
  // TODO
  return false;
}

// Test (commented out):
// const cycleNode = new ListNode(2);
// const cycleList = new ListNode(1, cycleNode);
// cycleNode.next = new ListNode(3, new ListNode(4, cycleNode)); // 4 -> 2 (cycle)
// console.log(exercise11_hasCycle(cycleList)); // true
// console.log(exercise11_hasCycle(createList([1, 2, 3]))); // false

// ----------------------------------------------------------------------------
// Exercise 12: Find Middle Node
// Return the middle node. For even length, return the second middle.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function exercise12_middleNode(
  head: ListNode<number> | null,
): ListNode<number> | null {
  // TODO
  return null;
}

// Test (commented out):
// console.log(exercise12_middleNode(createList([1, 2, 3, 4, 5]))?.val); // 3
// console.log(exercise12_middleNode(createList([1, 2, 3, 4, 5, 6]))?.val); // 4

// ----------------------------------------------------------------------------
// Exercise 13: Merge Two Sorted Lists
// Merge two sorted linked lists into one sorted list.
// Time: O(n + m), Space: O(1) (reuse existing nodes)
// ----------------------------------------------------------------------------
function exercise13_mergeSorted(
  l1: ListNode<number> | null,
  l2: ListNode<number> | null,
): ListNode<number> | null {
  // TODO: Use dummy head technique
  return null;
}

// Test (commented out):
// const m1 = createList([1, 2, 4]);
// const m2 = createList([1, 3, 4]);
// console.log(toArray(exercise13_mergeSorted(m1, m2))); // [1, 1, 2, 3, 4, 4]

// ----------------------------------------------------------------------------
// Exercise 14: Remove Nth Node From End
// Remove the nth node from the end of the list. Return head.
// Time: O(n), Space: O(1) - single pass with two pointers
// ----------------------------------------------------------------------------
function exercise14_removeNthFromEnd(
  head: ListNode<number> | null,
  n: number,
): ListNode<number> | null {
  // TODO: Use dummy head + two pointers with gap of n
  return null;
}

// Test (commented out):
// console.log(toArray(exercise14_removeNthFromEnd(createList([1, 2, 3, 4, 5]), 2))); // [1, 2, 3, 5]
// console.log(toArray(exercise14_removeNthFromEnd(createList([1]), 1))); // []

// ----------------------------------------------------------------------------
// Exercise 15: Palindrome Linked List
// Check if a linked list is a palindrome.
// Time: O(n), Space: O(1) - reverse second half, compare, restore
// ----------------------------------------------------------------------------
function exercise15_isPalindrome(head: ListNode<number> | null): boolean {
  // TODO
  return false;
}

// Test (commented out):
// console.log(exercise15_isPalindrome(createList([1, 2, 2, 1]))); // true
// console.log(exercise15_isPalindrome(createList([1, 2]))); // false
// console.log(exercise15_isPalindrome(createList([1, 2, 3, 2, 1]))); // true

// ----------------------------------------------------------------------------
// Exercise 16: Remove Duplicates from Sorted List
// Remove all duplicates so each element appears only once.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function exercise16_deleteDuplicates(
  head: ListNode<number> | null,
): ListNode<number> | null {
  // TODO
  return null;
}

// Test (commented out):
// console.log(toArray(exercise16_deleteDuplicates(createList([1, 1, 2, 3, 3])))); // [1, 2, 3]

// ----------------------------------------------------------------------------
// Exercise 17: Intersection of Two Linked Lists
// Find the node where two singly linked lists intersect. Return null if none.
// Time: O(n + m), Space: O(1)
// Hint: If you concatenate A+B and B+A, the tails align.
// ----------------------------------------------------------------------------
function exercise17_getIntersection(
  headA: ListNode<number> | null,
  headB: ListNode<number> | null,
): ListNode<number> | null {
  // TODO
  return null;
}

// Test (commented out):
// const shared = createList([8, 4, 5]);
// const la = new ListNode(4, new ListNode(1, shared));
// const lb = new ListNode(5, new ListNode(6, new ListNode(1, shared)));
// console.log(exercise17_getIntersection(la, lb)?.val); // 8

// ----------------------------------------------------------------------------
// Exercise 18: Add Two Numbers (Reverse Order)
// Two non-empty linked lists represent non-negative integers stored in reverse
// order. Each node contains a single digit. Add the two numbers and return
// the sum as a linked list.
// Example: (2->4->3) + (5->6->4) = 7->0->8  (342 + 465 = 807)
// Time: O(max(n, m)), Space: O(max(n, m))
// ----------------------------------------------------------------------------
function exercise18_addTwoNumbers(
  l1: ListNode<number> | null,
  l2: ListNode<number> | null,
): ListNode<number> | null {
  // TODO
  return null;
}

// Test (commented out):
// const add1 = createList([2, 4, 3]);
// const add2 = createList([5, 6, 4]);
// console.log(toArray(exercise18_addTwoNumbers(add1, add2))); // [7, 0, 8]

// ============================================================================
// Suppress unused warnings
// ============================================================================
void exercise1_predict;
void exercise2_predict;
void exercise3_predict;
void exercise4_predict;
void exercise5_insertTailBuggy;
void exercise6_deleteBuggy;
void exercise7_reverseBuggy;
void exercise8_middleBuggy;
void exercise9_LinkedList;
void exercise10_reverse;
void exercise11_hasCycle;
void exercise12_middleNode;
void exercise13_mergeSorted;
void exercise14_removeNthFromEnd;
void exercise15_isPalindrome;
void exercise16_deleteDuplicates;
void exercise17_getIntersection;
void exercise18_addTwoNumbers;

console.log("Linked List exercises loaded. Uncomment tests to run.");
