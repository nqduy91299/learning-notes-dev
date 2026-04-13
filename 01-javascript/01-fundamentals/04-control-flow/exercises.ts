// ============================================================================
// 04-control-flow: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/01-fundamentals/04-control-flow/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: switch fall-through
//
// What does this code log?

function exercise1() {
  const fruit = "banana";
  switch (fruit) {
    case "apple":
      console.log("apple");
    case "banana":
      console.log("banana");
    case "cherry":
      console.log("cherry");
    default:
      console.log("default");
  }
}

// YOUR ANSWER:
// 1: ???
// 2: ???
// 3: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: switch with strict equality
//
// What does this code log?

function exercise2() {
  const value = "2";
  switch (value) {
    case 2:
      console.log("number two");
      break;
    case "2":
      console.log("string two");
      break;
    default:
      console.log("no match");
  }
}

// YOUR ANSWER:
// ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: for loop execution order
//
// What does this code log? Trace through each iteration.

function exercise3() {
  for (let i = 0; i < 3; i++) {
    console.log(i);
  }
  // console.log(i); // What would happen if this were uncommented?
}

// YOUR ANSWER (logged values):
// ???
// What happens with the commented-out line? ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: while loop with prefix vs postfix increment
//
// What does each loop log?

function exercise4() {
  console.log("--- prefix ---");
  let a = 0;
  while (++a < 3) {
    console.log(a);
  }

  console.log("--- postfix ---");
  let b = 0;
  while (b++ < 3) {
    console.log(b);
  }
}

// YOUR ANSWER:
// prefix:  ???
// postfix: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: for...in vs for...of on an array
//
// What does each loop log?

function exercise5() {
  const arr = [10, 20, 30];

  console.log("--- for...in ---");
  for (const key in arr) {
    console.log(typeof key, key);
  }

  console.log("--- for...of ---");
  for (const val of arr) {
    console.log(typeof val, val);
  }
}

// YOUR ANSWER:
// for...in logs: ???
// for...of logs: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: for...in with extra properties on array
//
// What does the loop log?

function exercise6() {
  const arr: number[] & { sum?: number } = [1, 2, 3];
  arr.sum = 6;

  const result: string[] = [];
  for (const key in arr) {
    result.push(key);
  }
  console.log(result);
}

// YOUR ANSWER:
// ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: labeled break
//
// What does this code log?

function exercise7() {
  const result: string[] = [];

  outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) break outer;
      result.push(`${i},${j}`);
    }
  }

  console.log(result);
}

// YOUR ANSWER:
// ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: labeled continue
//
// What does this code log?

function exercise8() {
  const result: string[] = [];

  outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j === 1) continue outer;
      result.push(`${i},${j}`);
    }
  }

  console.log(result);
}

// YOUR ANSWER:
// ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: do...while runs at least once
//
// What does this code log?

function exercise9() {
  let count = 10;

  do {
    console.log(count);
    count++;
  } while (count < 3);

  console.log("final:", count);
}

// YOUR ANSWER:
// ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: for...of on a string and a Map
//
// What does this code log?

function exercise10() {
  console.log("--- string ---");
  const chars: string[] = [];
  for (const ch of "Hi!") {
    chars.push(ch);
  }
  console.log(chars);

  console.log("--- Map ---");
  const map = new Map<string, number>([["x", 1], ["y", 2]]);
  for (const entry of map) {
    console.log(entry);
  }
}

// YOUR ANSWER:
// string: ???
// Map:    ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Fix the Bug ───────────────────────────────────────────────
// Topic: Missing break in switch
//
// This function should return the name of the day, but it always returns
// "Unknown day". Fix the switch statement.

function exercise11(dayNum: number): string {
  let result: string;

  switch (dayNum) {
    case 0:
      result = "Sunday";
    case 1:
      result = "Monday";
    case 2:
      result = "Tuesday";
    case 3:
      result = "Wednesday";
    case 4:
      result = "Thursday";
    case 5:
      result = "Friday";
    case 6:
      result = "Saturday";
    default:
      result = "Unknown day";
  }

  return result;
}

// Uncomment to test:
// console.log(exercise11(0));  // Expected: "Sunday"
// console.log(exercise11(3));  // Expected: "Wednesday"
// console.log(exercise11(6));  // Expected: "Saturday"
// console.log(exercise11(7));  // Expected: "Unknown day"

// ─── Exercise 12: Fix the Bug ───────────────────────────────────────────────
// Topic: Off-by-one error
//
// This function should return the sum of numbers from 1 to n (inclusive).
// For n=5, the answer is 1+2+3+4+5 = 15. But it returns 10. Fix it.

function exercise12(n: number): number {
  let sum = 0;
  for (let i = 1; i < n; i++) {
    sum += i;
  }
  return sum;
}

// Uncomment to test:
// console.log(exercise12(5));   // Expected: 15
// console.log(exercise12(1));   // Expected: 1
// console.log(exercise12(10));  // Expected: 55

// ─── Exercise 13: Fix the Bug ───────────────────────────────────────────────
// Topic: for...in on array gives wrong results
//
// This function should double every number in the array.
// But it produces wrong output. Fix it.

function exercise13(arr: number[]): number[] {
  const result: number[] = [];
  for (const i in arr) {
    result.push(i * 2); // Hmm, what's wrong here?
  }
  return result;
}

// Uncomment to test:
// console.log(exercise13([1, 2, 3]));     // Expected: [2, 4, 6]
// console.log(exercise13([10, 20, 30]));  // Expected: [20, 40, 60]

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: FizzBuzz
//
// Return an array of strings for numbers 1 through n:
//   - "FizzBuzz" if divisible by both 3 and 5
//   - "Fizz" if divisible by 3 only
//   - "Buzz" if divisible by 5 only
//   - The number as a string otherwise

function exercise14(n: number): string[] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(exercise14(15));
// Expected: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
// console.log(exercise14(5));
// Expected: ["1","2","Fizz","4","Buzz"]

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Finding an element in nested arrays (using labeled break)
//
// Given a 2D array (matrix), find the first occurrence of `target`.
// Return [row, col] if found, or [-1, -1] if not found.
// Use a labeled break to exit early when found.

function exercise15(matrix: number[][], target: number): [number, number] {
  // YOUR CODE HERE

  return [-1, -1];
}

// Uncomment to test:
// const matrix = [
//   [1, 2, 3],
//   [4, 5, 6],
//   [7, 8, 9],
// ];
// console.log(exercise15(matrix, 5));  // Expected: [1, 1]
// console.log(exercise15(matrix, 9));  // Expected: [2, 2]
// console.log(exercise15(matrix, 10)); // Expected: [-1, -1]

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: Matrix traversal — collect diagonal elements
//
// Given a square matrix (n×n), return the elements on the main diagonal
// (top-left to bottom-right).
// Example: [[1,2,3],[4,5,6],[7,8,9]] → [1, 5, 9]

function exercise16(matrix: number[][]): number[] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(exercise16([[1,2,3],[4,5,6],[7,8,9]])); // Expected: [1, 5, 9]
// console.log(exercise16([[1,2],[3,4]]));              // Expected: [1, 4]
// console.log(exercise16([[42]]));                     // Expected: [42]

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Convert switch to object lookup
//
// The following switch maps HTTP status codes to messages.
// Rewrite it using an object lookup (no switch, no if/else).
// Return "Unknown status" for codes not in the map.

// Original switch for reference:
// switch (code) {
//   case 200: return "OK";
//   case 201: return "Created";
//   case 301: return "Moved Permanently";
//   case 400: return "Bad Request";
//   case 401: return "Unauthorized";
//   case 403: return "Forbidden";
//   case 404: return "Not Found";
//   case 500: return "Internal Server Error";
//   default:  return "Unknown status";
// }

function exercise17(code: number): string {
  // YOUR CODE HERE

  return "";
}

// Uncomment to test:
// console.log(exercise17(200)); // Expected: "OK"
// console.log(exercise17(404)); // Expected: "Not Found"
// console.log(exercise17(500)); // Expected: "Internal Server Error"
// console.log(exercise17(999)); // Expected: "Unknown status"

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Collecting unique values with for...of and a Set
//
// Given an array of strings (may have duplicates), use for...of and a Set
// to return a new array with duplicates removed, preserving first-occurrence order.
// Do NOT use Array.from(new Set(arr)) directly — iterate manually.

function exercise18(arr: string[]): string[] {
  // YOUR CODE HERE

  return [];
}

// Uncomment to test:
// console.log(exercise18(["a", "b", "a", "c", "b", "d"]));
// Expected: ["a", "b", "c", "d"]
// console.log(exercise18(["x", "x", "x"]));
// Expected: ["x"]
// console.log(exercise18([]));
// Expected: []
