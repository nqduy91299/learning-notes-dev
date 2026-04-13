// ============================================================================
// 01-variables: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: var hoisting

function solution1() {
    console.log(a);
    var a = 5;
    console.log(a);
}

// ANSWER:
// First log:  undefined
// Second log: 5
//
// Explanation:
// `var a` is hoisted to the top of the function and initialized as `undefined`.
// The assignment `a = 5` stays in place. So when the first console.log runs,
// `a` exists but is `undefined`. After assignment, it's 5.
// See README → Hoisting → "var — hoisted and initialized as undefined"

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: let and the Temporal Dead Zone

function solution2() {
    // console.log(b); // would throw
    let b = 10;
    console.log(b);
}

// ANSWER:
// ReferenceError: Cannot access 'b' before initialization
//
// Explanation:
// `let` is hoisted but NOT initialized. Accessing it before the declaration
// line puts you in the Temporal Dead Zone (TDZ), which throws a ReferenceError.
// The second console.log never runs because the error stops execution.
// See README → Temporal Dead Zone (TDZ)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: var in a for loop with setTimeout

function solution3() {
    for (var i = 0; i < 3; i++) {
        setTimeout(() => console.log(i), 100);
    }
}

// ANSWER:
// Output: 3, 3, 3
//
// Explanation:
// `var i` is function-scoped — there's only ONE `i` shared across all iterations.
// By the time the setTimeout callbacks execute (~100ms later), the loop has
// finished and `i` is 3. All three callbacks reference that same `i`.
// See README → Scope Rules → "Classic var-in-loop gotcha"

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: let in a for loop with setTimeout

function solution4() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => console.log(i), 100);
    }
}

// ANSWER:
// Output: 0, 1, 2
//
// Explanation:
// `let` creates a NEW binding for each loop iteration. Each setTimeout callback
// captures its own `i` with the value at that iteration (0, 1, 2).
// See README → Scope Rules → "let creates a new binding per iteration"

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: const with objects and arrays

function solution5() {
    const nums = [1, 2, 3];
    nums.push(4);
    console.log(nums);

    const user = { name: "Alice" };
    user.name = "Bob";
    console.log(user);
}

// ANSWER:
// First log:  [1, 2, 3, 4]
// Second log: { name: "Bob" }
// Does it throw? No
//
// Explanation:
// `const` makes the BINDING immutable, not the VALUE. You can't reassign
// `nums = [...]` or `user = {...}`, but you CAN mutate the contents
// (push to an array, change a property on an object).
// See README → const Deep Dive → "const makes the binding immutable, not the value"

// ─── Exercise 6: Fix the Bug ────────────────────────────────────────────────
// Topic: Accidental global variable

function solution6(): string {
    const message = "Hello, world!"; // FIX: added `const` declaration keyword
    return message;
}

// Explanation:
// Without a declaration keyword (`var`, `let`, or `const`), JavaScript creates
// a global variable on `window`/`globalThis`. This is a common bug.
// In strict mode, it would throw a ReferenceError instead.
// See README → Common Gotchas → "Accidental globals"

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: var leaking out of block scope

function solution7(): string {
    let result = "outside"; // FIX: changed `var` to `let`

    if (true) {
        let result = "inside"; // FIX: changed `var` to `let` — now block-scoped
        // `result` here is a separate variable from the outer `result`
        void result; // suppress unused variable warning
    }

    return result; // Returns "outside"
}

// Explanation:
// With `var`, both declarations refer to the same variable (function-scoped),
// so the inner assignment overwrites the outer one. With `let`, the inner
// `result` is block-scoped to the if-block and doesn't affect the outer one.
// See README → Scope Rules → "var — function scope" vs "let/const — block scope"

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: Reassigning a const binding

function solution8(initial: number): number {
    let value = initial; // FIX: changed `const` to `let` so we can reassign
    value = value * 2;
    return value;
}

// Alternative fix (without reassignment — keep const):
function solution8alt(initial: number): number {
    const value = initial * 2; // Compute in one step, no reassignment needed
    return value;
}

// Explanation:
// `const` bindings cannot be reassigned. Either change to `let`, or restructure
// the code to avoid reassignment (which is the more idiomatic approach).
// See README → const Deep Dive

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: TDZ error in a switch statement

function solution9(action: string): string {
    let output = "";

    switch (action) {
        case "greet": {
            // FIX: wrapped in block
            let msg = "Hello!";
            output = msg;
            break;
        }
        case "farewell": {
            // FIX: wrapped in block
            let msg = "Goodbye!"; // Same name is fine — different block scope
            output = msg;
            break;
        }
        default:
            output = "Unknown";
    }

    return output;
}

// Explanation:
// In a switch statement, all case clauses share the same block scope.
// Declaring `let msg` in two cases creates a redeclaration error.
// Wrapping each case in `{ }` creates separate block scopes.
// See README → Common Gotchas → "TDZ in switch blocks"

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
// Topic: Swapping variables

function solution10(a: number, b: number): [number, number] {
    [a, b] = [b, a]; // Destructuring swap — no temp variable needed
    return [a, b];
}

// Explanation:
// Array destructuring assignment `[a, b] = [b, a]` evaluates the right side
// first (creating a temporary array [b, a]), then assigns back to a and b.
// This is a clean, idiomatic way to swap in modern JavaScript.

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: Closures with let

function solution11(): {
    increment: () => void;
    decrement: () => void;
    getCount: () => number;
} {
    let count = 0; // private variable — only accessible via the returned methods

    return {
        increment: () => {
            count++;
        },
        decrement: () => {
            count--;
        },
        getCount: () => count,
    };
}

// Explanation:
// `let count` is declared in the function scope. The returned object's methods
// form closures over `count`. Since `count` needs to be reassigned (++/--),
// we use `let` instead of `const`. The variable is "private" because nothing
// outside the function can access it directly — only through the methods.
// See README → Best Practices → "Use let for reassignment"

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Making objects truly immutable

function solution12(config: Record<string, unknown>): Record<string, unknown> {
    return Object.freeze({ ...config }); // Spread to copy, then freeze the copy
}

// Explanation:
// 1. `{ ...config }` creates a shallow copy so we don't mutate the original
// 2. `Object.freeze()` prevents adding, removing, or changing properties
// Note: Object.freeze is shallow — nested objects would still be mutable.
// See README → const Deep Dive → "Making values truly immutable"

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: var redeclaration vs let redeclaration

function solution13() {
    // Block A
    var x = 1;
    var x = 2;
    console.log(x);

    // Block B is commented out because it would cause a SyntaxError
    // let y = 1;
    // let y = 2; // SyntaxError: Identifier 'y' has already been declared
}

// ANSWER:
// Block A logs: 2
// Block B: SyntaxError: Identifier 'y' has already been declared
//
// Explanation:
// `var` allows redeclaration in the same scope — the second `var x` simply
// overwrites the first. `let` does NOT allow redeclaration in the same scope
// and throws a SyntaxError at parse time (before any code runs).
// See README → Common Gotchas → "Redeclaring var silently succeeds"

// ─── Exercise 14: Predict the Output ────────────────────────────────────────
// Topic: var hoisting inside a function vs global-like behavior

var globalVar = "global";

function solution14() {
    console.log(globalVar); // Log 1
    var globalVar = "local";
    console.log(globalVar); // Log 2
}

// ANSWER:
// Log 1: undefined
// Log 2: "local"
//
// Explanation:
// Even though there's a global `globalVar`, the `var globalVar` inside the
// function is hoisted to the top of the function. This creates a LOCAL variable
// that shadows the global one. At the time of Log 1, the local `globalVar`
// exists but is `undefined` (hoisted, not yet assigned). Log 2 sees "local"
// after the assignment.
// This is a combination of hoisting + function scoping.
// See README → Hoisting → "var — hoisted and initialized as undefined"

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: Counting variable declarations

function solution15(code: string): { var: number; let: number; const: number } {
    const countKeyword = (keyword: string): number => {
        const regex = new RegExp(`\\b${keyword}\\b\\s`, "g");
        return (code.match(regex) || []).length;
    };

    return {
        var: countKeyword("var"),
        let: countKeyword("let"),
        const: countKeyword("const"),
    };
}

// Explanation:
// `\b` is a word boundary anchor — it ensures we match `let` as a whole word,
// not as part of "letters". The `\s` after the keyword ensures it's followed
// by whitespace (as a declaration keyword would be), not by other characters.
// The `g` flag finds all matches globally.
//
// Test cases:
// solution15("var a = 1;\nlet b = 2;\nconst c = 3;\nvar d = 4;\nlet e = 5;")
//   → { var: 2, let: 2, const: 1 }
//
// solution15("var letters = 'abc';\nlet constant = true;")
//   → { var: 1, let: 1, const: 0 }
//   "letters" doesn't match because \b prevents partial word matches
//   "constant" doesn't match because \b ensures "const" must be a whole word

// ─── Exercise 16: Predict the Output ────────────────────────────────────────
// Topic: const without an initializer

// function solution16() {
//   const x;      // SyntaxError: Missing initializer in const declaration
//   console.log(x);
// }

// ANSWER:
// SyntaxError: Missing initializer in const declaration
//
// Explanation:
// `const` MUST have an initializer because it forbids reassignment after
// declaration. An uninitialized `const` would be permanently `undefined`,
// which is almost certainly a bug. The engine catches this at parse time.
// `let` and `var` can be declared without an initializer (they default to undefined).
// See README → Declaration vs Initialization

// ─── Exercise 17: Predict the Output ────────────────────────────────────────
// Topic: var hoisting from unreachable code

function solution17() {
    value = "Hello";

    if (false) {
        var value;
    }

    console.log(value);
}

// ANSWER:
// Output: "Hello"
//
// Explanation:
// `var` declarations are hoisted to the top of the function regardless of
// whether the code block they're in actually executes. Even though `if (false)`
// never runs, `var value` is still hoisted. So the assignment `value = "Hello"`
// assigns to the hoisted local variable, not a global.
// See README → Hoisting → "var hoisting from unreachable code"

// ─── Exercise 18: Predict the Output ────────────────────────────────────────
// Topic: IIFE scoping

function solution18() {
    var x = "outer";

    (function () {
        var x = "inner";
        console.log(x); // Log 1
    })();

    console.log(x); // Log 2
}

// ANSWER:
// Log 1: "inner"
// Log 2: "outer"
//
// Explanation:
// The IIFE creates a new function scope. The `var x = "inner"` inside the IIFE
// is a separate variable from the outer `var x = "outer"` — it does NOT leak
// out. This is exactly why IIFEs were invented: to contain `var` declarations
// that would otherwise pollute the enclosing scope.
// See README → IIFE (Historical)

// ─── Exercise 19: Short Answer ──────────────────────────────────────────────
// Topic: Uppercase const convention

function solution19() {
    // UPPER_SNAKE_CASE — hard-coded, known before execution:
    const BIRTHDAY = "1990-01-15";
    const MAX_RETRIES = 3;
    const API_URL = "https://api.example.com";

    // camelCase — computed at runtime:
    const currentAge = new Date().getFullYear() - 1990;
    const startTime = Date.now();

    return { BIRTHDAY, MAX_RETRIES, currentAge, API_URL, startTime };
}

// ANSWER:
// UPPER_SNAKE_CASE: birthday → BIRTHDAY, maxRetries → MAX_RETRIES, apiUrl → API_URL
// camelCase:        currentAge (stays), startTime (stays)
//
// Explanation:
// The convention is: UPPER_SNAKE_CASE for values that are literal/hard-coded
// and known at write-time (they serve as named aliases for magic values).
// camelCase for values computed at runtime, even if they're declared with `const`.
// `birthday`, `maxRetries`, and `apiUrl` are all string/number literals written
// directly in code. `currentAge` and `startTime` depend on when the code runs.
// See README → Naming Conventions → "When to use UPPER_CASE for constants"

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1 ===");
solution1();

console.log("\n=== Exercise 2 ===");
console.log("(Skipped — would throw ReferenceError)");

console.log("\n=== Exercise 3 ===");
solution3();

console.log("\n=== Exercise 4 ===");
solution4();

// Allow setTimeout outputs to flush before continuing
setTimeout(() => {
    console.log("\n=== Exercise 5 ===");
    solution5();

    console.log("\n=== Exercise 6 ===");
    console.log(solution6());

    console.log("\n=== Exercise 7 ===");
    console.log(solution7());

    console.log("\n=== Exercise 8 ===");
    console.log(solution8(5));
    console.log(solution8alt(5));

    console.log("\n=== Exercise 9 ===");
    console.log(solution9("greet"));
    console.log(solution9("farewell"));

    console.log("\n=== Exercise 10 ===");
    console.log(solution10(1, 2));
    console.log(solution10(5, 9));

    console.log("\n=== Exercise 11 ===");
    const counter = solution11();
    counter.increment();
    counter.increment();
    counter.increment();
    counter.decrement();
    console.log(counter.getCount());

    console.log("\n=== Exercise 12 ===");
    const original = { debug: true, version: "1.0" };
    const frozen = solution12(original);
    (frozen as any).debug = false;
    (frozen as any).newProp = "oops";
    console.log(frozen.debug);
    console.log((frozen as any).newProp);
    original.debug = false;
    console.log(original.debug);

    console.log("\n=== Exercise 13 ===");
    solution13();

    console.log("\n=== Exercise 14 ===");
    solution14();

    console.log("\n=== Exercise 15 ===");
    console.log(
        solution15(
            `var a = 1;\nlet b = 2;\nconst c = 3;\nvar d = 4;\nlet e = 5;`,
        ),
    );
    console.log(solution15(`const x = 10;\nconst y = 20;\nlet z = x + y;`));
    console.log(solution15(`var letters = "abc";\nlet constant = true;`));

    console.log("\n=== Exercise 16 ===");
    console.log(
        "(Skipped — would throw SyntaxError: Missing initializer in const declaration)",
    );

    console.log("\n=== Exercise 17 ===");
    solution17();

    console.log("\n=== Exercise 18 ===");
    solution18();

    console.log("\n=== Exercise 19 ===");
    console.log(solution19());
}, 200);
