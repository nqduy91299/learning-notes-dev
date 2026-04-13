// ============================================================================
// 01-variables: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/01-fundamentals/01-variables/exercises.ts
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: var hoisting
//
// What does this function log? (two console.log calls)

function exercise1() {
    console.log(a);
    var a = 5;
    console.log(a);
}

// YOUR ANSWER:
// First log:  ??? undefined
// Second log: ??? 5

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: let and the Temporal Dead Zone
//
// What happens when this function runs?

function exercise2() {
    console.log(b);
    let b = 10;
    console.log(b);
}

// YOUR ANSWER:
// What happens? ??? throw the ReferenceError at the first log. The second log is never reached.

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: var in a for loop with setTimeout
//
// What are the three values logged after ~100ms?

function exercise3() {
    for (var i = 0; i < 3; i++) {
        setTimeout(() => console.log(i), 100);
    }
}

// YOUR ANSWER:
// Output: ???, ???, ??? - 3, 3, 3.

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: let in a for loop with setTimeout
//
// What are the three values logged after ~100ms?

function exercise4() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => console.log(i), 100);
    }
}

// YOUR ANSWER:
// Output: ???, ???, ??? 0, 1, 2

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: const with objects and arrays
//
// Does this code throw? If not, what is logged?

function exercise5() {
    const nums = [1, 2, 3];
    nums.push(4);
    console.log(nums);

    const user = { name: "Alice" };
    user.name = "Bob";
    console.log(user);
}

// YOUR ANSWER:
// First log:  ??? [1, 2, 3, 4]
// Second log: ??? {name: 'Bob'}
// Does it throw? ??? no

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Fix the Bug ────────────────────────────────────────────────
// Topic: Accidental global variable
//
// This function accidentally creates a global variable.
// Fix it so `message` is properly scoped to the function.
// The function should return the message.

function exercise6(): string {
    const message = "Hello, world!";
    return message;
}

// Uncomment to test:
// console.log(exercise6());

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: var leaking out of block scope
//
// The function below is supposed to return "outside"
// but `result` leaks from the if-block because of `var`.
// Fix it so the function works correctly.

function exercise7(): string {
    let result = "outside";

    if (true) {
        let result = "inside";
    }

    return result; // Should return "outside", currently returns "inside"
}

// Uncomment to test:
// console.log(exercise7()); // Expected: "outside"

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: Reassigning a const binding
//
// This function should double the value and return it.
// It currently throws a TypeError. Fix it with minimal changes.

function exercise8(initial: number): number {
    let value = initial;
    value = value * 2;
    return value;
}

// Uncomment to test:
// console.log(exercise8(5)); // Expected: 10

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: TDZ error in a switch statement
//
// This code has a SyntaxError because `let` declarations in different
// case clauses share the same block scope.
// Fix it so each case can declare its own `msg` variable.

function exercise9(action: string): string {
    let output = "";

    switch (action) {
        case "greet":
            output = "Hello!";
            // output = msg;
            break;
        case "farewell":
            output = "Goodbye!"; // renamed to avoid immediate syntax error
            // output = msg2; // but ideally both should be named `msg`
            break;
        default:
            output = "Unknown";
    }

    return output;
}

// YOUR TASK:
// Refactor so that both cases can use `let msg = ...` (same variable name)
// without a SyntaxError. See the README "Common Gotchas" section.

// Uncomment to test:
// console.log(exercise9("greet"));    // Expected: "Hello!"
// console.log(exercise9("farewell")); // Expected: "Goodbye!"

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Swapping variables
//
// Swap the values of `a` and `b` without using a temporary variable.
// Hint: use destructuring assignment.
// Return them as a tuple [a, b] after swapping.

function exercise10(a: number, b: number): [number, number] {
    // YOUR CODE HERE
    [a, b] = [b, a];

    return [a, b];
}

// Uncomment to test:
// console.log(exercise10(1, 2)); // Expected: [2, 1]
// console.log(exercise10(5, 9)); // Expected: [9, 5]

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Closures with let
//
// Create a counter using closure. Return an object with:
//   - increment(): increases count by 1
//   - decrement(): decreases count by 1
//   - getCount(): returns current count
//
// The count should start at 0 and be private (not directly accessible).

function exercise11(): {
    increment: () => void;
    decrement: () => void;
    getCount: () => number;
} {
    // YOUR CODE HERE
    let num = 0;

    return {
        increment: () => {
            num += 1;
        },
        decrement: () => {
            num -= 1;
        },
        getCount: () => num,
    };
}

// Uncomment to test:
// const counter = exercise11();
// counter.increment();
// counter.increment();
// counter.increment();
// counter.decrement();
// console.log(counter.getCount()); // Expected: 2

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Making objects truly immutable
//
// Given a config object, return a frozen copy so that:
//   - No properties can be changed
//   - No properties can be added
//   - No properties can be deleted
//
// Do NOT mutate the original object.

function exercise12(config: Record<string, unknown>): Record<string, unknown> {
    // YOUR CODE HERE
    return Object.freeze({ ...config });
}

// Uncomment to test:
// const original = { debug: true, version: "1.0" };
// const frozen = exercise12(original);
// (frozen as any).debug = false;
// (frozen as any).newProp = "oops";
// console.log(frozen.debug); // Expected: true (unchanged)
// console.log((frozen as any).newProp); // Expected: undefined
// original.debug = false;
// console.log(original.debug); // Expected: false (original is still mutable)

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: var redeclaration vs let redeclaration
//
// What happens with each block?

function exercise13() {
    // Block A
    var x = 1;
    var x = 2;
    console.log(x);

    // Block B — uncomment to test (this may cause a compile error!)
    // let y = 1;
    // let y = 2;
    // console.log(y);
}

// YOUR ANSWER:
// Block A logs: ??? 2
// Block B:      ??? syntax error

// Uncomment to test:
// exercise13();

// ─── Exercise 14: Predict the Output ────────────────────────────────────────
// Topic: var hoisting inside a function vs global-like behavior
//
// What does each console.log output?

var globalVar = "global";

function exercise14() {
    console.log(globalVar); // Log 1
    var globalVar = "local";
    console.log(globalVar); // Log 2
}

// YOUR ANSWER:
// Log 1: ??? undefined
// Log 2: ??? local

// Uncomment to test:
// exercise14();

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Counting variable declarations
//
// Given a string of JavaScript code, count how many times
// `var`, `let`, and `const` are used as declaration keywords.
//
// Rules:
//   - Only count them when they appear as standalone keywords
//     (followed by a space or newline), not inside strings or
//     as parts of other words (e.g. "letters" should NOT count "let")
//   - You can assume the input is simple code without string literals
//     containing these keywords.
//
// Hint: Use a regex with word boundaries (\b)

function exercise15(code: string): { var: number; let: number; const: number } {
    // YOUR CODE HERE
    let codeArr = code.split(";");
    let varCount = 0,
        letCount = 0,
        constCount = 0;
    codeArr.forEach((codeString) => {
        varCount += codeString.includes("var ") ? 1 : 0;
        letCount += codeString.includes("let ") ? 1 : 0;
        constCount += codeString.includes("const ") ? 1 : 0;
    });

    return { var: varCount, let: letCount, const: constCount };
}

// Uncomment to test:
// console.log(exercise15(`
//   var a = 1;
//   let b = 2;
//   const c = 3;
//   var d = 4;
//   let e = 5;
// `));
// Expected: { var: 2, let: 2, const: 1 }

// console.log(exercise15(`
//   const x = 10;
//   const y = 20;
//   let z = x + y;
// `));
// Expected: { var: 0, let: 1, const: 2 }

// console.log(exercise15(`
//   var letters = "abc";
//   let constant = true;
// `));
// Expected: { var: 1, let: 1, const: 0 }
// ("letters" does NOT count as "let", "constant" does NOT count as "const")

// ─── Exercise 16: Predict the Output ────────────────────────────────────────
// Topic: const without an initializer
//
// What happens when this code runs?

function exercise16() {
    // Uncomment the line below and predict what happens:
    // const x;
    // console.log(x);
}

// YOUR ANSWER:
// What happens? ??? syntax error

// ─── Exercise 17: Predict the Output ────────────────────────────────────────
// Topic: var hoisting from unreachable code
//
// What does this function log?
// Hint: does it matter that the if-block never executes?

function exercise17() {
    value = "Hello";

    if (false) {
        var value;
    }

    console.log(value);
}

// YOUR ANSWER:
// Output: ??? hello

// Uncomment to test:
// exercise17();

// ─── Exercise 18: Predict the Output ────────────────────────────────────────
// Topic: IIFE scoping
//
// What does each console.log output?
// Does the IIFE's `var` leak to the outside?

function exercise18() {
    var x = "outer";

    (function () {
        var x = "inner";
        console.log(x); // Log 1
    })();

    console.log(x); // Log 2
}

// YOUR ANSWER:
// Log 1: ??? inner
// Log 2: ??? outer

// Uncomment to test:
// exercise18();

// ─── Exercise 19: Short Answer ──────────────────────────────────────────────
// Topic: Uppercase const convention
//
// Given the code below, which constants should use UPPER_SNAKE_CASE
// and which should stay camelCase? Rename them accordingly and return
// an object with the corrected values.
//
// Rule: UPPER_SNAKE_CASE is for values known BEFORE execution (hard-coded).
//       camelCase is for values computed at runtime.

function exercise19() {
    const BIRTHDAY = "1990-01-15"; // hard-coded, known at write-time
    const MAX_RETRIES = 3; // hard-coded, known at write-time
    const currentAge = new Date().getFullYear() - 1990; // computed at runtime
    const API_URL = "https://api.example.com"; // hard-coded, known at write-time
    const startTime = Date.now(); // computed at runtime

    // YOUR TASK: rename the constants above following the convention,
    // then return them. Example:
    //   const BIRTHDAY = "1990-01-15";
    //   const MAX_RETRIES = 3;
    //   etc.
    //
    // Which ones should be UPPER_SNAKE_CASE? Which should stay camelCase?

    // YOUR ANSWER (list them):
    // UPPER_SNAKE_CASE: ???
    // camelCase:        ???

    return { BIRTHDAY, MAX_RETRIES, currentAge, API_URL, startTime };
}

// Uncomment to test:
console.log(exercise19());
