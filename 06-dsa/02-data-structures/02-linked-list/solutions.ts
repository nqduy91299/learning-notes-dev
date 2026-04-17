// ============================================================================
// Linked List - Solutions
// ============================================================================
// Complete solutions with complexity analysis for all 18 exercises.
// Run with: npx tsx solutions.ts
// ============================================================================

// ============================================================================
// Shared Node Class & Helpers
// ============================================================================
class ListNode<T> {
  val: T;
  next: ListNode<T> | null;

  constructor(val: T, next: ListNode<T> | null = null) {
    this.val = val;
    this.next = next;
  }
}

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
// PREDICT THE OUTPUT - Answers
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 1: Reference vs Value
// ----------------------------------------------------------------------------
function solution1_predict(): void {
  const a = new ListNode(1, new ListNode(2, new ListNode(3)));
  const b = a;       // b is a reference to the SAME node object
  b.val = 99;        // mutates the shared node

  console.log(a.val); // 99

  const c = a.next;   // c points to the node with val 2
  a.next = new ListNode(42); // a.next now points to a NEW node; c still points to old node

  console.log(c?.val);    // 2  (c still references the old second node)
  console.log(a.next.val); // 42
}
// Answer: 99, 2, 42

// ----------------------------------------------------------------------------
// Exercise 2: Traversal and Length
// ----------------------------------------------------------------------------
function solution2_predict(): void {
  const head = createList([10, 20, 30, 40]);
  let count = 0;
  let current = head;

  while (current !== null) {
    count++;
    current = current.next; // current is a LOCAL variable; head is unchanged
  }

  console.log(count);     // 4
  console.log(head?.val); // 10 (head is unaffected by traversal)
}
// Answer: 4, 10

// ----------------------------------------------------------------------------
// Exercise 3: Pointer Reassignment
// ----------------------------------------------------------------------------
function solution3_predict(): void {
  const n1 = new ListNode(1);
  const n2 = new ListNode(2);
  const n3 = new ListNode(3);

  n1.next = n2;
  n2.next = n3;

  const saved = n1.next; // saved -> n2 (which still has n2.next -> n3)
  n1.next = n3;          // n1 -> n3; n2 is bypassed but still exists

  console.log(toArray(n1));      // [1, 3]  (n2 is skipped)
  console.log(saved?.val);       // 2       (saved still references n2)
  console.log(saved?.next?.val); // 3       (n2.next still -> n3)
}
// Answer: [1, 3], 2, 3

// ----------------------------------------------------------------------------
// Exercise 4: Null Handling
// ----------------------------------------------------------------------------
function solution4_predict(): void {
  const head = createList([5]);
  const second = head?.next; // null (only one node)

  console.log(second);          // null
  console.log(head?.next?.val); // undefined

  if (head) {
    head.next = new ListNode(10);
  }
  console.log(head?.next?.val); // 10
  console.log(second);          // null (second captured null, not a live reference)
}
// Answer: null, undefined, 10, null

// ============================================================================
// FIX THE BUG - Solutions
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 5: Insert at Tail - Fixed
// Bug: traversed until current === null, then assigned to local variable.
// Fix: traverse until current.next === null, then set current.next = newNode.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution5_insertTail(
  head: ListNode<number> | null,
  val: number,
): ListNode<number> {
  const newNode = new ListNode(val);
  if (head === null) return newNode;

  let current = head;
  while (current.next !== null) { // FIX: check .next, not current
    current = current.next;
  }
  current.next = newNode; // FIX: attach to list via .next
  return head;
}

// ----------------------------------------------------------------------------
// Exercise 6: Delete Node by Value - Fixed
// Bug: didn't check if head.val === val.
// Fix: add head check before traversal.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution6_delete(
  head: ListNode<number> | null,
  val: number,
): ListNode<number> | null {
  if (head === null) return null;
  if (head.val === val) return head.next; // FIX: handle head deletion

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

// ----------------------------------------------------------------------------
// Exercise 7: Reverse List - Fixed
// Bug: overwrote current.next before saving it.
// Fix: save next before overwriting.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution7_reverse(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let prev: ListNode<number> | null = null;
  let current = head;

  while (current !== null) {
    const next = current.next; // FIX: save next BEFORE overwriting
    current.next = prev;
    prev = current;
    current = next;            // FIX: use saved next
  }

  return prev;
}

// ----------------------------------------------------------------------------
// Exercise 8: Find Middle - Fixed
// Bug: accessed fast!.next without null check on fast.
// Fix: check both fast !== null && fast.next !== null.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution8_middle(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) { // FIX: check fast !== null
    slow = slow!.next;
    fast = fast.next.next;
  }

  return slow;
}

// ============================================================================
// IMPLEMENT - Solutions
// ============================================================================

// ----------------------------------------------------------------------------
// Exercise 9: Singly Linked List Class
// Time: insertAt O(n), deleteAt O(n), search O(n), toArray O(n)
// Space: O(n) total for n nodes
// ----------------------------------------------------------------------------
class Solution9_LinkedList {
  head: ListNode<number> | null = null;
  private size: number = 0;

  insertAt(index: number, val: number): void {
    if (index < 0 || index > this.size) throw new RangeError("Index out of bounds");

    if (index === 0) {
      this.head = new ListNode(val, this.head);
    } else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current!.next;
      }
      current!.next = new ListNode(val, current!.next);
    }
    this.size++;
  }

  deleteAt(index: number): void {
    if (index < 0 || index >= this.size) throw new RangeError("Index out of bounds");

    if (index === 0) {
      this.head = this.head!.next;
    } else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current!.next;
      }
      current!.next = current!.next!.next;
    }
    this.size--;
  }

  search(val: number): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.val === val) return true;
      current = current.next;
    }
    return false;
  }

  toArray(): number[] {
    const result: number[] = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.val);
      current = current.next;
    }
    return result;
  }

  getSize(): number {
    return this.size;
  }
}

// ----------------------------------------------------------------------------
// Exercise 10: Reverse Linked List (Iterative)
// Approach: Three pointers - prev, current, next. Reverse each link.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution10_reverse(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let prev: ListNode<number> | null = null;
  let current = head;

  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  return prev;
}

// ----------------------------------------------------------------------------
// Exercise 11: Detect Cycle (Floyd's Algorithm)
// Approach: fast moves 2 steps, slow moves 1. If they meet, there's a cycle.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution11_hasCycle(head: ListNode<number> | null): boolean {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }

  return false;
}

// ----------------------------------------------------------------------------
// Exercise 12: Find Middle Node
// Approach: fast/slow pointers. When fast reaches end, slow is at middle.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution12_middleNode(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
  }

  return slow;
}

// ----------------------------------------------------------------------------
// Exercise 13: Merge Two Sorted Lists
// Approach: Dummy head. Compare heads of both lists, append smaller.
// Time: O(n + m), Space: O(1) - reusing existing nodes
// ----------------------------------------------------------------------------
function solution13_mergeSorted(
  l1: ListNode<number> | null,
  l2: ListNode<number> | null,
): ListNode<number> | null {
  const dummy = new ListNode<number>(0);
  let tail: ListNode<number> = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }

  tail.next = l1 ?? l2;
  return dummy.next;
}

// ----------------------------------------------------------------------------
// Exercise 14: Remove Nth Node From End
// Approach: Dummy head + two pointers. Advance fast by n+1 steps, then move
// both until fast is null. Slow is now right before the node to remove.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution14_removeNthFromEnd(
  head: ListNode<number> | null,
  n: number,
): ListNode<number> | null {
  const dummy = new ListNode<number>(0, head);
  let fast: ListNode<number> | null = dummy;
  let slow: ListNode<number> = dummy;

  // Advance fast by n + 1 steps
  for (let i = 0; i <= n; i++) {
    fast = fast!.next;
  }

  // Move both until fast reaches end
  while (fast !== null) {
    slow = slow.next!;
    fast = fast.next;
  }

  // slow.next is the node to remove
  slow.next = slow.next!.next;

  return dummy.next;
}

// ----------------------------------------------------------------------------
// Exercise 15: Palindrome Linked List
// Approach:
// 1. Find middle using fast/slow
// 2. Reverse second half
// 3. Compare first half with reversed second half
// 4. (Optional) Restore the list
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution15_isPalindrome(head: ListNode<number> | null): boolean {
  if (head === null || head.next === null) return true;

  // Find middle
  let slow: ListNode<number> | null = head;
  let fast: ListNode<number> | null = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
  }

  // Reverse second half
  let prev: ListNode<number> | null = null;
  let current = slow;
  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  // Compare
  let left: ListNode<number> | null = head;
  let right: ListNode<number> | null = prev;
  while (right !== null) {
    if (left!.val !== right.val) return false;
    left = left!.next;
    right = right.next;
  }

  return true;
}

// ----------------------------------------------------------------------------
// Exercise 16: Remove Duplicates from Sorted List
// Approach: Single pointer. If current.val === current.next.val, skip next.
// Time: O(n), Space: O(1)
// ----------------------------------------------------------------------------
function solution16_deleteDuplicates(
  head: ListNode<number> | null,
): ListNode<number> | null {
  let current = head;

  while (current !== null && current.next !== null) {
    if (current.val === current.next.val) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }

  return head;
}

// ----------------------------------------------------------------------------
// Exercise 17: Intersection of Two Linked Lists
// Approach: Two pointers. Pointer A traverses A then B. Pointer B traverses
// B then A. They will meet at the intersection or both reach null.
// Why: Both travel the same total distance (lenA + lenB).
// Time: O(n + m), Space: O(1)
// ----------------------------------------------------------------------------
function solution17_getIntersection(
  headA: ListNode<number> | null,
  headB: ListNode<number> | null,
): ListNode<number> | null {
  let pA = headA;
  let pB = headB;

  while (pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }

  return pA;
}

// ----------------------------------------------------------------------------
// Exercise 18: Add Two Numbers (Reverse Order)
// Approach: Traverse both lists simultaneously, summing digits + carry.
// Create new nodes for each digit of the result.
// Time: O(max(n, m)), Space: O(max(n, m)) for result list
// ----------------------------------------------------------------------------
function solution18_addTwoNumbers(
  l1: ListNode<number> | null,
  l2: ListNode<number> | null,
): ListNode<number> | null {
  const dummy = new ListNode<number>(0);
  let current = dummy;
  let carry = 0;

  while (l1 !== null || l2 !== null || carry > 0) {
    const v1 = l1?.val ?? 0;
    const v2 = l2?.val ?? 0;
    const sum = v1 + v2 + carry;

    carry = Math.floor(sum / 10);
    current.next = new ListNode(sum % 10);
    current = current.next;

    l1 = l1?.next ?? null;
    l2 = l2?.next ?? null;
  }

  return dummy.next;
}

// ============================================================================
// Runner
// ============================================================================
function runAllSolutions(): void {
  console.log("=".repeat(60));
  console.log("Linked List - Solutions Runner");
  console.log("=".repeat(60));

  // Predict output
  console.log("\n--- Exercise 1: Reference vs Value ---");
  solution1_predict();

  console.log("\n--- Exercise 2: Traversal and Length ---");
  solution2_predict();

  console.log("\n--- Exercise 3: Pointer Reassignment ---");
  solution3_predict();

  console.log("\n--- Exercise 4: Null Handling ---");
  solution4_predict();

  // Fix the bug
  console.log("\n--- Exercise 5: Insert at Tail (Fixed) ---");
  const list5 = createList([1, 2, 3]);
  console.log(toArray(solution5_insertTail(list5, 4))); // [1, 2, 3, 4]

  console.log("\n--- Exercise 6: Delete by Value (Fixed) ---");
  console.log(toArray(solution6_delete(createList([1, 2, 3]), 1))); // [2, 3]
  console.log(toArray(solution6_delete(createList([1, 2, 3]), 2))); // [1, 3]
  console.log(toArray(solution6_delete(createList([1, 2, 3]), 3))); // [1, 2]

  console.log("\n--- Exercise 7: Reverse (Fixed) ---");
  console.log(toArray(solution7_reverse(createList([1, 2, 3, 4, 5])))); // [5,4,3,2,1]

  console.log("\n--- Exercise 8: Find Middle (Fixed) ---");
  console.log(solution8_middle(createList([1, 2, 3, 4, 5]))?.val);   // 3
  console.log(solution8_middle(createList([1, 2, 3, 4, 5, 6]))?.val); // 4

  // Implement
  console.log("\n--- Exercise 9: LinkedList Class ---");
  const ll = new Solution9_LinkedList();
  ll.insertAt(0, 10);
  ll.insertAt(1, 20);
  ll.insertAt(1, 15);
  console.log(ll.toArray()); // [10, 15, 20]
  ll.deleteAt(1);
  console.log(ll.toArray()); // [10, 20]
  console.log(ll.search(20)); // true
  console.log(ll.search(15)); // false

  console.log("\n--- Exercise 10: Reverse ---");
  console.log(toArray(solution10_reverse(createList([1, 2, 3, 4, 5])))); // [5,4,3,2,1]
  console.log(toArray(solution10_reverse(null))); // []

  console.log("\n--- Exercise 11: Detect Cycle ---");
  const cycleNode = new ListNode(2);
  const cycleList = new ListNode(1, cycleNode);
  cycleNode.next = new ListNode(3, new ListNode(4, cycleNode));
  console.log(solution11_hasCycle(cycleList));        // true
  console.log(solution11_hasCycle(createList([1, 2, 3]))); // false

  console.log("\n--- Exercise 12: Middle Node ---");
  console.log(solution12_middleNode(createList([1, 2, 3, 4, 5]))?.val);   // 3
  console.log(solution12_middleNode(createList([1, 2, 3, 4, 5, 6]))?.val); // 4

  console.log("\n--- Exercise 13: Merge Sorted ---");
  console.log(toArray(solution13_mergeSorted(createList([1, 2, 4]), createList([1, 3, 4])))); // [1,1,2,3,4,4]
  console.log(toArray(solution13_mergeSorted(null, createList([1, 2])))); // [1, 2]

  console.log("\n--- Exercise 14: Remove Nth From End ---");
  console.log(toArray(solution14_removeNthFromEnd(createList([1, 2, 3, 4, 5]), 2))); // [1,2,3,5]
  console.log(toArray(solution14_removeNthFromEnd(createList([1]), 1))); // []

  console.log("\n--- Exercise 15: Palindrome ---");
  console.log(solution15_isPalindrome(createList([1, 2, 2, 1])));     // true
  console.log(solution15_isPalindrome(createList([1, 2])));           // false
  console.log(solution15_isPalindrome(createList([1, 2, 3, 2, 1]))); // true

  console.log("\n--- Exercise 16: Remove Duplicates ---");
  console.log(toArray(solution16_deleteDuplicates(createList([1, 1, 2, 3, 3])))); // [1, 2, 3]

  console.log("\n--- Exercise 17: Intersection ---");
  const shared = createList([8, 4, 5]);
  const la = new ListNode(4, new ListNode(1, shared));
  const lb = new ListNode(5, new ListNode(6, new ListNode(1, shared)));
  console.log(solution17_getIntersection(la, lb)?.val); // 8
  console.log(solution17_getIntersection(createList([1, 2]), createList([3, 4]))); // null

  console.log("\n--- Exercise 18: Add Two Numbers ---");
  console.log(toArray(solution18_addTwoNumbers(createList([2, 4, 3]), createList([5, 6, 4])))); // [7,0,8]
  console.log(toArray(solution18_addTwoNumbers(createList([9, 9, 9]), createList([1])))); // [0,0,0,1]

  console.log("\n" + "=".repeat(60));
  console.log("All solutions executed successfully!");
  console.log("=".repeat(60));
}

runAllSolutions();
