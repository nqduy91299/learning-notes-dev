// ============================================================================
// 06-scope-hoisting: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: var hoisting

function solution1() {
  console.log(a);  // undefined
  var a = 10;
  console.log(a);  // 10
}

// ANSWER:
// Log 1: undefined
// Log 2: 10
//
// Explanation:
// `var a` is hoisted to the top of the function, but the assignment `= 10`
// stays in place. So at the first log, `a` exists but is `undefined`.
// After the assignment, `a` is 10.
// See README → Section 8: Hoisting → var hoisting

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: let and the Temporal Dead Zone

function solution2() {
  // console.log(b); // ReferenceError: Cannot access 'b' before initialization
  let b = 20;
  console.log(b);   // 20
}

// ANSWER:
// Log 1: ReferenceError: Cannot access 'b' before initialization
// Log 2: never reached
//
// Explanation:
// `let b` is hoisted (registered in the Environment Record) but NOT initialized.
// Accessing it before the declaration line puts us in the Temporal Dead Zone.
// See README → Section 9: Temporal Dead Zone (TDZ)

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Function declaration hoisting

function solution3() {
  console.log(typeof greet); // "function"
  console.log(greet());      // "Hello!"

  function greet() {
    return "Hello!";
  }
}

// ANSWER:
// Log 1: "function"
// Log 2: "Hello!"
//
// Explanation:
// Function declarations are fully hoisted — both the name AND the body.
// So `greet` is available as a callable function even before its declaration line.
// See README → Section 8: Hoisting → Function declaration hoisting

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Function expression hoisting with var

function solution4() {
  console.log(typeof sayHi); // "undefined"
  // sayHi(); // Would throw TypeError: sayHi is not a function

  var sayHi = function () {
    return "Hi!";
  };

  console.log(typeof sayHi); // "function"
  console.log(sayHi());      // "Hi!"
}

// ANSWER:
// Log 1: "undefined"
// If sayHi() were called: TypeError: sayHi is not a function
// Log 2: "function"
// Log 3: "Hi!"
//
// Explanation:
// `var sayHi` is hoisted as `undefined`. It's not a function yet, just undefined.
// Trying to call undefined() gives TypeError (not ReferenceError — the name exists).
// After the assignment, sayHi becomes the function.
// See README → Section 8: Hoisting → Function expression — NOT hoisted as a function

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: var is function-scoped, not block-scoped

function solution5() {
  if (true) {
    var x = 10;
    let y = 20;
  }

  console.log(x); // 10
  try {
    console.log(y);
  } catch (e) {
    console.log("y is not defined"); // "y is not defined"
  }
}

// ANSWER:
// Log 1: 10
// Log 2: "y is not defined"
//
// Explanation:
// `var x` ignores block boundaries — it's scoped to the function.
// `let y` is block-scoped to the if-block, so it doesn't exist outside.
// See README → Section 3: Function Scope & Section 4: Block Scope

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Block scoping with let in for loops

function solution6() {
  for (let i = 0; i < 3; i++) {
    // each iteration gets its own i
  }

  try {
    console.log(i);
  } catch {
    console.log("i is not defined"); // "i is not defined"
  }

  for (var j = 0; j < 3; j++) {
    // j is function-scoped
  }

  console.log(j); // 3
}

// ANSWER:
// Log 1: "i is not defined"
// Log 2: 3
//
// Explanation:
// `let i` is block-scoped to the for loop — doesn't exist after it.
// `var j` is function-scoped — it persists after the loop with value 3.
// See README → Section 3: Function Scope & Section 4: Block Scope

declare let i: number;
declare let j: number;

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Scope chain lookup

const color = "red";

function solution7() {
  const color = "blue";

  function inner() {
    console.log(color); // "blue"
  }

  inner();
}

// ANSWER:
// Log 1: "blue"
//
// Explanation:
// `inner()` first searches its own scope (no `color` there), then the enclosing
// `solution7` scope where it finds `color = "blue"`. It never reaches the global.
// See README → Section 7: Scope Chain

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Lexical scope — where defined, not where called

function solution8() {
  const name = "outer";

  function makeFn() {
    const name = "inner";
    return function () {
      return name;
    };
  }

  const fn = makeFn();
  console.log(fn()); // "inner"
}

// ANSWER:
// Log 1: "inner"
//
// Explanation:
// The returned function was CREATED inside makeFn, where `name` is "inner".
// Lexical scope is determined by where the function is defined, not where
// it's called. The function carries a reference to makeFn's lexical environment.
// See README → Section 5: Lexical Scope (Static Scope)

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Variable shadowing

function solution9() {
  let x = 1;

  {
    let x = 2;
    console.log(x); // 2
  }

  console.log(x); // 1

  function inner() {
    let x = 3;
    console.log(x); // 3
  }

  inner();
  console.log(x); // 1
}

// ANSWER:
// Log 1: 2
// Log 2: 1
// Log 3: 3
// Log 4: 1
//
// Explanation:
// Each `let x` creates a new variable in its own scope that shadows the outer one.
// When a block or function ends, the outer `x` is visible again, unchanged.
// See README → Section 10: Variable Shadowing

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: TDZ shadows outer variable

function solution10() {
  const value = "outer";

  function test() {
    console.log(value); // ReferenceError: Cannot access 'value' before initialization
    const value = "inner";
  }

  try {
    test();
  } catch (e) {
    console.log("ReferenceError:", (e as Error).message);
  }
}

// ANSWER:
// Log 1: "Cannot access 'value' before initialization"
//
// Explanation:
// The inner `const value` is hoisted within `test()`, creating a TDZ from the
// start of the function until the declaration. The inner `value` shadows the outer
// one immediately, but it's uninitialized — so accessing it throws ReferenceError.
// See README → Section 9: TDZ → "Why does TDZ exist?"

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Hoisting order — multiple var declarations and function

function solution11() {
  console.log(a);    // undefined
  console.log(b());  // 2

  var a = 1;

  function b() {
    return 2;
  }

  var a = 3;

  console.log(a);    // 3
}

// ANSWER:
// Log 1: undefined
// Log 2: 2
// Log 3: 3
//
// Explanation:
// `var a` is hoisted (initialized as undefined). The function `b` is fully hoisted.
// So before any code runs: a = undefined, b = function.
// First log: a is undefined (hoisted but not yet assigned).
// Second log: b() returns 2 (function is fully hoisted and callable).
// Then a = 1, then a = 3 (var allows redeclaration). Third log: a is 3.
// See README → Section 8: Hoisting table

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Nested function scope access

function solution12() {
  let result = "";

  function a() {
    const x = "A";

    function b() {
      const y = "B";

      function c() {
        const z = "C";
        result = x + y + z;
      }

      c();
    }

    b();
  }

  a();
  console.log(result); // "ABC"
}

// ANSWER:
// Log 1: "ABC"
//
// Explanation:
// Function `c` can access `x` from `a`'s scope, `y` from `b`'s scope,
// and `z` from its own scope. The scope chain: c → b → a → solution12 → global.
// Each variable is found by walking up the chain.
// See README → Section 7: Scope Chain

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: var hoisting across blocks

function solution13() {
  console.log(x);  // undefined

  if (false) {
    var x = 5;
  }

  console.log(x);  // undefined
}

// ANSWER:
// Log 1: undefined
// Log 2: undefined
//
// Explanation:
// `var x` is hoisted to the function scope regardless of the `if (false)` block.
// The declaration is processed, but the assignment `= 5` inside the never-executed
// block is skipped. So `x` exists but remains `undefined`.
// See README → Section 8: Hoisting → var hoisting

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: var loop closure bug

function solution14(): (() => number)[] {
  const functions: (() => number)[] = [];

  for (let i = 0; i < 3; i++) {  // FIX: changed `var` to `let`
    functions.push(function () {
      return i;
    });
  }

  return functions;
}

// Explanation:
// With `var`, all closures share the same `i`, which ends at 3.
// With `let`, each iteration creates a new binding of `i`, so each
// closure captures its own copy with the correct value.
// See README → Section 12: Common Gotchas → Gotcha 1: var in loops

// ─── Exercise 15: Fix the Bug ───────────────────────────────────────────────
// Topic: Accidental global variable

function solution15(numbers: number[]): number {
  let total = 0;  // FIX: added `let` to properly scope the variable
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}

// Explanation:
// Without `let`/`const`/`var`, assigning to `total` creates an accidental
// global variable in sloppy mode. Adding `let` scopes it to the function.
// See README → Section 12: Common Gotchas → Gotcha 4: Accidental globals

// ─── Exercise 16: Fix the Bug ───────────────────────────────────────────────
// Topic: TDZ error

function solution16() {
  const userName = "Alice";  // FIX: moved declaration before use

  const message = getGreeting();
  console.log(message);

  function getGreeting() {
    return `Hello, ${userName}`;
  }

  return message;
}

// Explanation:
// `getGreeting` is a function declaration (fully hoisted), so it's callable
// anywhere in the function. But `userName` is declared with `const`, which
// has a TDZ. When `getGreeting()` runs, it accesses `userName` — if `userName`
// isn't declared yet, it throws ReferenceError. Moving the `const userName`
// declaration before the call to `getGreeting()` fixes the TDZ issue.
// See README → Section 9: Temporal Dead Zone (TDZ)

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Scope-protected module pattern

function solution17(
  initialBalance: number
): {
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  getBalance: () => number;
} {
  let balance = initialBalance; // private — only accessible via closures

  return {
    deposit(amount: number) {
      balance += amount;
    },
    withdraw(amount: number) {
      if (amount > balance) return false;
      balance -= amount;
      return true;
    },
    getBalance() {
      return balance;
    },
  };
}

// Explanation:
// `balance` is a local variable in `solution17`'s scope. The returned methods
// form closures over this variable, providing controlled access while keeping
// `balance` itself inaccessible from outside. This is the module pattern —
// closures emulating private state.
// See README → Section 11: Closures (Brief Intro)

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Variable lookup simulator

interface Scope {
  define: (name: string, value: unknown) => void;
  lookup: (name: string) => unknown;
}

function solution18(parent?: Scope): Scope {
  const variables = new Map<string, unknown>();

  return {
    define(name: string, value: unknown) {
      variables.set(name, value);
    },
    lookup(name: string): unknown {
      if (variables.has(name)) {
        return variables.get(name);
      }
      if (parent) {
        return parent.lookup(name);
      }
      throw new Error(`Variable '${name}' is not defined`);
    },
  };
}

// Explanation:
// This simulates the scope chain mechanism. Each Scope has:
// - An Environment Record (the `variables` Map) for its own bindings.
// - An [[OuterEnv]] reference (the `parent` parameter) to the enclosing scope.
// `lookup` searches the current scope first, then delegates to the parent,
// mirroring how the JS engine resolves variables through the scope chain.
// See README → Section 6: Lexical Environment & Section 7: Scope Chain

// ============================================================================
// Run all solutions to verify:
// ============================================================================

console.log("=== Exercise 1: var hoisting ===");
solution1();

console.log("\n=== Exercise 2: let TDZ ===");
solution2();

console.log("\n=== Exercise 3: Function declaration hoisting ===");
solution3();

console.log("\n=== Exercise 4: Function expression hoisting ===");
solution4();

console.log("\n=== Exercise 5: var vs let block scoping ===");
solution5();

console.log("\n=== Exercise 6: let/var in for loops ===");
solution6();

console.log("\n=== Exercise 7: Scope chain lookup ===");
solution7();

console.log("\n=== Exercise 8: Lexical scope ===");
solution8();

console.log("\n=== Exercise 9: Variable shadowing ===");
solution9();

console.log("\n=== Exercise 10: TDZ shadows outer ===");
solution10();

console.log("\n=== Exercise 11: Hoisting order ===");
solution11();

console.log("\n=== Exercise 12: Nested scope access ===");
solution12();

console.log("\n=== Exercise 13: var hoisting across blocks ===");
solution13();

console.log("\n=== Exercise 14: Fix var loop closure ===");
const fns14 = solution14();
console.log(fns14[0]()); // 0
console.log(fns14[1]()); // 1
console.log(fns14[2]()); // 2

console.log("\n=== Exercise 15: Fix accidental global ===");
console.log(solution15([1, 2, 3])); // 6
console.log(solution15([10, 20]));  // 30

console.log("\n=== Exercise 16: Fix TDZ error ===");
console.log(solution16()); // "Hello, Alice"

console.log("\n=== Exercise 17: Module pattern ===");
const account = solution17(100);
console.log(account.getBalance());     // 100
account.deposit(50);
console.log(account.getBalance());     // 150
console.log(account.withdraw(200));    // false
console.log(account.getBalance());     // 150
console.log(account.withdraw(30));     // true
console.log(account.getBalance());     // 120

console.log("\n=== Exercise 18: Scope chain simulator ===");
const globalScope = solution18();
globalScope.define("x", 10);
globalScope.define("y", 20);

const functionScope = solution18(globalScope);
functionScope.define("y", 99);
functionScope.define("z", 30);

const blockScope = solution18(functionScope);
blockScope.define("z", 999);

console.log(blockScope.lookup("x"));     // 10
console.log(blockScope.lookup("y"));     // 99
console.log(blockScope.lookup("z"));     // 999
console.log(functionScope.lookup("z"));  // 30
console.log(functionScope.lookup("x"));  // 10

try {
  blockScope.lookup("notDefined");
} catch (e) {
  console.log((e as Error).message);     // "Variable 'notDefined' is not defined"
}
