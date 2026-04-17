// ============================================================================
// Stack - Solutions
// Run: npx tsx solutions.ts
// ============================================================================

// ─── PREDICT SOLUTIONS ─────────────────────────────────────────────────────

// Solution 1: Basic Stack Operations
function solvePrediction1(): void {
  console.log("--- Predict 1 ---");
  const stack: number[] = [];
  stack.push(10);
  stack.push(20);
  stack.push(30);
  console.log(stack.pop());              // 30 (top element)
  console.log(stack.pop());              // 20
  stack.push(40);                        // stack is now [10, 40]
  console.log(stack[stack.length - 1]);  // 40 (peek)
  console.log(stack.length);             // 2
  // Answer: 30, 20, 40, 2
}

// Solution 2: Stack with Conditional Logic
function solvePrediction2(): void {
  console.log("\n--- Predict 2 ---");
  const stack: string[] = [];
  const input = "abcba";
  // 'a' -> push -> [a]
  // 'b' -> push -> [a,b]
  // 'c' -> push -> [a,b,c]
  // 'b' -> top is 'c', not 'b' -> push -> [a,b,c,b]
  // 'a' -> top is 'b', not 'a' -> push -> [a,b,c,b,a]
  for (const ch of input) {
    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }
  console.log(stack.join(""));  // "abcba"
  console.log(stack.length);    // 5
  // Answer: "abcba", 5
  // The string is a palindrome but no adjacent duplicates, so nothing gets popped.
}

// Solution 3: Nested Stack Operations
function solvePrediction3(): void {
  console.log("\n--- Predict 3 ---");
  const stack: number[] = [];
  for (let i = 0; i < 5; i++) {
    stack.push(i * 2); // [0, 2, 4, 6, 8]
  }
  let sum = 0;
  while (stack.length > 2) {
    sum += stack.pop()!; // pop 8, 6, 4 -> sum = 18
  }
  console.log(sum);            // 18
  console.log(stack.join(",")); // "0,2"
  // Answer: 18, "0,2"
}

// Solution 4: Parentheses Matching
function solvePrediction4(): void {
  console.log("\n--- Predict 4 ---");
  // s = "(()(()))"
  // depths: 1,2,2,2,3,3,2,1
  // maxDepth = 3, stack empty at end
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
  console.log(maxDepth);     // 3
  console.log(stack.length);  // 0
  // Answer: 3, 0
}

// Solution 5: Monotonic Stack Simulation
function solvePrediction5(): void {
  console.log("\n--- Predict 5 ---");
  const nums = [3, 1, 4, 1, 5];
  const stack: number[] = [];
  const result: number[] = new Array(nums.length).fill(-1);

  // i=0: nums[0]=3, stack empty, push 0. stack=[0]
  // i=1: nums[1]=1, nums[0]=3 >= 1, push 1. stack=[0,1]
  // i=2: nums[2]=4, nums[1]=1 < 4, pop 1 -> result[1]=4
  //       nums[0]=3 < 4, pop 0 -> result[0]=4
  //       push 2. stack=[2]
  // i=3: nums[3]=1, nums[2]=4 >= 1, push 3. stack=[2,3]
  // i=4: nums[4]=5, nums[3]=1 < 5, pop 3 -> result[3]=5
  //       nums[2]=4 < 5, pop 2 -> result[2]=5
  //       push 4. stack=[4]

  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  console.log(result.join(",")); // "4,4,5,5,-1"
  // Answer: "4,4,5,5,-1"
}

// ─── FIX SOLUTIONS ─────────────────────────────────────────────────────────

// Solution 6: Fix - Stack Reverse
// BUG: `result = stack.pop()! + result` prepends, which preserves original order.
// FIX: Append instead: `result += stack.pop()!`
function fix6Solution(input: string): string {
  const stack: string[] = [];
  for (const ch of input) {
    stack.push(ch);
  }
  let result = "";
  while (stack.length > 0) {
    result += stack.pop()!; // FIX: append (+=) instead of prepend
  }
  return result;
}

// Solution 7: Fix - Valid Parentheses
// BUG 1: Doesn't check if popped value matches the expected opening bracket.
// BUG 2: Returns true without checking if stack is empty.
function fix7Solution(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch in pairs) {
      if (stack.length === 0) return false;
      if (stack.pop() !== pairs[ch]) return false; // FIX 1: check match
    }
  }

  return stack.length === 0; // FIX 2: verify stack is empty
}

// Solution 8: Fix - Min Stack
// BUG: Tracking a single min value that doesn't revert when elements are popped.
// FIX: Use a parallel min stack.
class Fix8MinStackSolution {
  private stack: number[] = [];
  private mins: number[] = []; // FIX: track min at each level

  push(val: number): void {
    this.stack.push(val);
    const currentMin = this.mins.length === 0
      ? val
      : Math.min(val, this.mins[this.mins.length - 1]);
    this.mins.push(currentMin); // FIX: push min for this level
  }

  pop(): number | undefined {
    this.mins.pop(); // FIX: pop from mins too
    return this.stack.pop();
  }

  top(): number | undefined {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.mins[this.mins.length - 1];
  }
}

// ─── IMPLEMENT SOLUTIONS ───────────────────────────────────────────────────

// Solution 9: Stack Class
interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  readonly size: number;
}

class Stack<T> implements IStack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
}

// Solution 10: Balanced Parentheses (Single Type)
function balancedParens(s: string): boolean {
  let count = 0;
  for (const ch of s) {
    if (ch === "(") {
      count++;
    } else if (ch === ")") {
      count--;
      if (count < 0) return false;
    }
  }
  return count === 0;
}

// Solution 11: Reverse Polish Notation
function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  const ops = new Set(["+", "-", "*", "/"]);

  for (const token of tokens) {
    if (ops.has(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/": stack.push(Math.trunc(a / b)); break;
      }
    } else {
      stack.push(Number(token));
    }
  }

  return stack[0];
}

// Solution 12: Min Stack
interface IMinStack {
  push(val: number): void;
  pop(): void;
  top(): number;
  getMin(): number;
}

class MinStack implements IMinStack {
  private stack: number[] = [];
  private mins: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const min = this.mins.length === 0
      ? val
      : Math.min(val, this.mins[this.mins.length - 1]);
    this.mins.push(min);
  }

  pop(): void {
    this.stack.pop();
    this.mins.pop();
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.mins[this.mins.length - 1];
  }
}

// Solution 13: Daily Temperatures
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const result = new Array<number>(n).fill(0);
  const stack: number[] = []; // indices

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const idx = stack.pop()!;
      result[idx] = i - idx;
    }
    stack.push(i);
  }

  return result;
}

// Solution 14: Next Greater Element
function nextGreaterElement(nums: number[]): number[] {
  const n = nums.length;
  const result = new Array<number>(n).fill(-1);
  const stack: number[] = []; // indices

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  return result;
}

// Solution 15: Decode String
function decodeString(s: string): string {
  const countStack: number[] = [];
  const stringStack: string[] = [];
  let currentNum = 0;
  let currentStr = "";

  for (const ch of s) {
    if (ch >= "0" && ch <= "9") {
      currentNum = currentNum * 10 + Number(ch);
    } else if (ch === "[") {
      countStack.push(currentNum);
      stringStack.push(currentStr);
      currentNum = 0;
      currentStr = "";
    } else if (ch === "]") {
      const repeatCount = countStack.pop()!;
      const prevStr = stringStack.pop()!;
      currentStr = prevStr + currentStr.repeat(repeatCount);
    } else {
      currentStr += ch;
    }
  }

  return currentStr;
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
  console.log("=== Stack Solutions ===\n");

  // Predict exercises
  solvePrediction1();
  solvePrediction2();
  solvePrediction3();
  solvePrediction4();
  solvePrediction5();

  // Fix 6
  console.log("\n--- Fix 6 Solution ---");
  assert(fix6Solution("hello") === "olleh", "reverse 'hello'");
  assert(fix6Solution("ab") === "ba", "reverse 'ab'");
  assert(fix6Solution("") === "", "reverse empty");

  // Fix 7
  console.log("\n--- Fix 7 Solution ---");
  assert(fix7Solution("([)]") === false, "'([)]' is invalid");
  assert(fix7Solution("([])") === true, "'([])' is valid");
  assert(fix7Solution("(((") === false, "'(((' is invalid");
  assert(fix7Solution("") === true, "empty is valid");
  assert(fix7Solution("{[]}") === true, "'{[]}' is valid");

  // Fix 8
  console.log("\n--- Fix 8 Solution ---");
  const ms = new Fix8MinStackSolution();
  ms.push(3); ms.push(1); ms.push(2);
  assert(ms.getMin() === 1, "min is 1");
  ms.pop(); ms.pop();
  assert(ms.getMin() === 3, "min after pops is 3");

  // Implement 9: Stack
  console.log("\n--- Solution 9: Stack Class ---");
  const st = new Stack<number>();
  st.push(1); st.push(2); st.push(3);
  assert(st.peek() === 3, "peek is 3");
  assert(st.pop() === 3, "pop is 3");
  assert(st.size === 2, "size is 2");
  assert(!st.isEmpty(), "not empty");
  st.pop(); st.pop();
  assert(st.isEmpty(), "empty after popping all");

  // Implement 10: Balanced Parens
  console.log("\n--- Solution 10: Balanced Parentheses ---");
  assert(balancedParens("(())") === true, "'(())' balanced");
  assert(balancedParens("()()") === true, "'()()' balanced");
  assert(balancedParens("(()") === false, "'(()' unbalanced");
  assert(balancedParens(")(") === false, "')(' unbalanced");
  assert(balancedParens("") === true, "empty balanced");

  // Implement 11: RPN
  console.log("\n--- Solution 11: Reverse Polish Notation ---");
  assert(evalRPN(["2", "1", "+", "3", "*"]) === 9, "RPN example 1");
  assert(evalRPN(["4", "13", "5", "/", "+"]) === 6, "RPN example 2");
  assert(evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]) === 22, "RPN example 3");

  // Implement 12: MinStack
  console.log("\n--- Solution 12: Min Stack ---");
  const minStack = new MinStack();
  minStack.push(-2); minStack.push(0); minStack.push(-3);
  assert(minStack.getMin() === -3, "min is -3");
  minStack.pop();
  assert(minStack.top() === 0, "top is 0");
  assert(minStack.getMin() === -2, "min is -2");

  // Implement 13: Daily Temperatures
  console.log("\n--- Solution 13: Daily Temperatures ---");
  assert(
    JSON.stringify(dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])) ===
    JSON.stringify([1, 1, 4, 2, 1, 1, 0, 0]),
    "daily temps example 1"
  );
  assert(
    JSON.stringify(dailyTemperatures([30, 40, 50, 60])) ===
    JSON.stringify([1, 1, 1, 0]),
    "daily temps ascending"
  );
  assert(
    JSON.stringify(dailyTemperatures([60, 50, 40, 30])) ===
    JSON.stringify([0, 0, 0, 0]),
    "daily temps descending"
  );

  // Implement 14: Next Greater Element
  console.log("\n--- Solution 14: Next Greater Element ---");
  assert(
    JSON.stringify(nextGreaterElement([2, 1, 2, 4, 3])) ===
    JSON.stringify([4, 2, 4, -1, -1]),
    "NGE example 1"
  );
  assert(
    JSON.stringify(nextGreaterElement([1, 3, 2, 4])) ===
    JSON.stringify([3, 4, 4, -1]),
    "NGE example 2"
  );
  assert(
    JSON.stringify(nextGreaterElement([5, 4, 3, 2, 1])) ===
    JSON.stringify([-1, -1, -1, -1, -1]),
    "NGE descending"
  );

  // Implement 15: Decode String
  console.log("\n--- Solution 15: Decode String ---");
  assert(decodeString("3[a]2[bc]") === "aaabcbc", "decode example 1");
  assert(decodeString("3[a2[c]]") === "accaccacc", "decode nested");
  assert(decodeString("2[abc]3[cd]ef") === "abcabccdcdcdef", "decode example 3");

  console.log("\n=== All tests complete ===");
}

runAllTests();
