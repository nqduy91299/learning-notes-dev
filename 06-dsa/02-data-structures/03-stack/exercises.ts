// ============================================================================
// Stack - Exercises (15 total: 5 predict, 3 fix, 7 implement)
// Run: npx tsx exercises.ts
// ============================================================================

// ─── PREDICT EXERCISES (5) ──────────────────────────────────────────────────

// Exercise 1: Predict - Basic Stack Operations
// What does this print?
function predict1(): void {
  const stack: number[] = [];
  stack.push(10);
  stack.push(20);
  stack.push(30);
  console.log(stack.pop());
  console.log(stack.pop());
  stack.push(40);
  console.log(stack[stack.length - 1]);
  console.log(stack.length);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
  // Line 3: ???
  // Line 4: ???
}

// Exercise 2: Predict - Stack with Conditional Logic
// What does this print?
function predict2(): void {
  const stack: string[] = [];
  const input = "abcba";

  for (const ch of input) {
    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }

  console.log(stack.join(""));
  console.log(stack.length);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
}

// Exercise 3: Predict - Nested Stack Operations
// What does this print?
function predict3(): void {
  const stack: number[] = [];
  for (let i = 0; i < 5; i++) {
    stack.push(i * 2);
  }
  let sum = 0;
  while (stack.length > 2) {
    sum += stack.pop()!;
  }
  console.log(sum);
  console.log(stack.join(","));
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
}

// Exercise 4: Predict - Parentheses Matching
// What does this print?
function predict4(): void {
  const s = "(()(()))";
  const stack: number[] = [];
  let maxDepth = 0;

  for (const ch of s) {
    if (ch === "(") {
      stack.push(1);
      maxDepth = Math.max(maxDepth, stack.length);
    } else {
      stack.pop();
    }
  }

  console.log(maxDepth);
  console.log(stack.length);
  // Your prediction:
  // Line 1: ???
  // Line 2: ???
}

// Exercise 5: Predict - Monotonic Stack Simulation
// What does this print?
function predict5(): void {
  const nums = [3, 1, 4, 1, 5];
  const stack: number[] = [];
  const result: number[] = new Array(nums.length).fill(-1);

  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  console.log(result.join(","));
  // Your prediction: ???
}

// ─── FIX EXERCISES (3) ─────────────────────────────────────────────────────

// Exercise 6: Fix - Stack Reverse
// This function should reverse a string using a stack but produces wrong output.
function fix6(input: string): string {
  const stack: string[] = [];
  for (const ch of input) {
    stack.push(ch);
  }
  let result = "";
  while (stack.length > 0) {
    result = stack.pop()! + result; // BUG: something wrong with concatenation order
  }
  return result;
}

// Test:
// console.log(fix6("hello")); // Expected: "olleh"

// Exercise 7: Fix - Valid Parentheses
// This function checks for balanced parentheses but has a bug.
function fix7(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch in pairs) {
      if (stack.length === 0) return false;
      stack.pop(); // BUG: doesn't check if the popped value matches
    }
  }

  return true; // BUG: doesn't check if stack is empty
}

// Test:
// console.log(fix7("([)]")); // Expected: false
// console.log(fix7("([])")); // Expected: true
// console.log(fix7("(((")); // Expected: false

// Exercise 8: Fix - Min Stack
// This MinStack implementation has a bug in getMin after popping.
class Fix8MinStack {
  private stack: number[] = [];
  private min: number = Infinity;

  push(val: number): void {
    this.stack.push(val);
    this.min = Math.min(this.min, val); // BUG: tracking min incorrectly
  }

  pop(): number | undefined {
    return this.stack.pop();
    // BUG: min is not updated after pop
  }

  top(): number | undefined {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.min;
  }
}

// Test:
// const ms = new Fix8MinStack();
// ms.push(3); ms.push(1); ms.push(2);
// console.log(ms.getMin()); // Expected: 1
// ms.pop();
// ms.pop();
// console.log(ms.getMin()); // Expected: 3 (but returns 1)

// ─── IMPLEMENT EXERCISES (7) ───────────────────────────────────────────────

// Exercise 9: Implement - Stack Class
// Implement a generic stack using an array with push, pop, peek, isEmpty, and size.
interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

// TODO: Implement Stack<T>
// class Stack<T> implements IStack<T> { ... }

// Test:
// const s = new Stack<number>();
// s.push(1); s.push(2); s.push(3);
// console.log(s.peek()); // 3
// console.log(s.pop()); // 3
// console.log(s.size); // 2
// console.log(s.isEmpty()); // false
// s.pop(); s.pop();
// console.log(s.isEmpty()); // true

// Exercise 10: Implement - Balanced Parentheses (Single Type)
// Return true if the string has balanced parentheses "(" and ")".
function balancedParens(_s: string): boolean {
  // TODO: Implement
  return false;
}

// Test:
// console.log(balancedParens("(())")); // true
// console.log(balancedParens("()()")); // true
// console.log(balancedParens("(()")); // false
// console.log(balancedParens(")(")); // false
// console.log(balancedParens("")); // true

// Exercise 11: Implement - Reverse Polish Notation
// Evaluate a reverse polish notation expression.
// Operators: +, -, *, /
// Division should truncate toward zero.
function evalRPN(_tokens: string[]): number {
  // TODO: Implement
  return 0;
}

// Test:
// console.log(evalRPN(["2", "1", "+", "3", "*"])); // 9
// console.log(evalRPN(["4", "13", "5", "/", "+"])); // 6
// console.log(evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"])); // 22

// Exercise 12: Implement - Min Stack (from scratch)
// Design a stack that supports push, pop, top, and getMin all in O(1).
interface IMinStack {
  push(val: number): void;
  pop(): void;
  top(): number;
  getMin(): number;
}

// TODO: Implement MinStack
// class MinStack implements IMinStack { ... }

// Test:
// const minStack = new MinStack();
// minStack.push(-2); minStack.push(0); minStack.push(-3);
// console.log(minStack.getMin()); // -3
// minStack.pop();
// console.log(minStack.top()); // 0
// console.log(minStack.getMin()); // -2

// Exercise 13: Implement - Daily Temperatures
// Given an array of daily temperatures, return an array where result[i] is the
// number of days until a warmer temperature. 0 if no warmer day exists.
function dailyTemperatures(_temperatures: number[]): number[] {
  // TODO: Implement using a monotonic stack
  return [];
}

// Test:
// console.log(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])); // [1,1,4,2,1,1,0,0]
// console.log(dailyTemperatures([30, 40, 50, 60])); // [1,1,1,0]
// console.log(dailyTemperatures([60, 50, 40, 30])); // [0,0,0,0]

// Exercise 14: Implement - Next Greater Element
// Given an array of integers, return an array where result[i] is the next
// element greater than nums[i] to its right. -1 if none exists.
function nextGreaterElement(_nums: number[]): number[] {
  // TODO: Implement using a monotonic stack
  return [];
}

// Test:
// console.log(nextGreaterElement([2, 1, 2, 4, 3])); // [4, 2, 4, -1, -1]
// console.log(nextGreaterElement([1, 3, 2, 4])); // [3, 4, 4, -1]
// console.log(nextGreaterElement([5, 4, 3, 2, 1])); // [-1, -1, -1, -1, -1]

// Exercise 15: Implement - Decode String
// Given an encoded string like "3[a2[c]]", return the decoded string "accaccacc".
// The pattern is k[encoded_string], where k is a positive integer.
function decodeString(_s: string): string {
  // TODO: Implement using a stack
  return "";
}

// Test:
// console.log(decodeString("3[a]2[bc]")); // "aaabcbc"
// console.log(decodeString("3[a2[c]]")); // "accaccacc"
// console.log(decodeString("2[abc]3[cd]ef")); // "abcabccdcdcdef"

// ─── Runner ────────────────────────────────────────────────────────────────

console.log("=== Stack Exercises ===\n");

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
console.log(fix6("hello"));

console.log("\n--- Fix 7 (broken) ---");
console.log(fix7("([)]"), "expected false");
console.log(fix7("([])"), "expected true");
console.log(fix7("((("), "expected false");

console.log("\n--- Fix 8 (broken) ---");
const ms8 = new Fix8MinStack();
ms8.push(3); ms8.push(1); ms8.push(2);
console.log("min:", ms8.getMin());
ms8.pop(); ms8.pop();
console.log("min after pops:", ms8.getMin(), "expected 3");

console.log("\n--- Implement exercises: uncomment tests above when ready ---");
