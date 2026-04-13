// ============================================================================
// 06-scope-hoisting: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/01-fundamentals/06-scope-hoisting/exercises.ts
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
// What does each console.log print?

function exercise1() {
  console.log(a);
  var a = 10;
  console.log(a);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: let and the Temporal Dead Zone
//
// What happens when this function runs?

function exercise2() {
  console.log(b);
  let b = 20;
  console.log(b);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: Function declaration hoisting
//
// What does each console.log print?

function exercise3() {
  console.log(typeof greet);
  console.log(greet());

  function greet() {
    return "Hello!";
  }
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: Function expression hoisting with var
//
// What happens when this function runs?

function exercise4() {
  console.log(typeof sayHi);
  // sayHi(); // What would happen if this were uncommented?

  var sayHi = function () {
    return "Hi!";
  };

  console.log(typeof sayHi);
  console.log(sayHi());
}

// YOUR ANSWER:
// Log 1: ???
// If sayHi() were called: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: var is function-scoped, not block-scoped
//
// What does each console.log print?

function exercise5() {
  if (true) {
    var x = 10;
    let y = 20;
  }

  console.log(x);
  try {
    console.log(y);
  } catch (e) {
    console.log("y is not defined");
  }
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: Block scoping with let in for loops
//
// What does each console.log print?

function exercise6() {
  for (let i = 0; i < 3; i++) {
    // each iteration gets its own i
  }

  try {
    console.log(i);
  } catch {
    console.log("i is not defined");
  }

  for (var j = 0; j < 3; j++) {
    // j is function-scoped
  }

  console.log(j);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Predict the Output ─────────────────────────────────────────
// Topic: Scope chain lookup
//
// What does each console.log print?

const color = "red";

function exercise7() {
  const color = "blue";

  function inner() {
    console.log(color);
  }

  inner();
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise7();

// ─── Exercise 8: Predict the Output ─────────────────────────────────────────
// Topic: Lexical scope — where defined, not where called
//
// What does the console.log print?

function exercise8() {
  const name = "outer";

  function makeFn() {
    const name = "inner";
    return function () {
      return name;
    };
  }

  const fn = makeFn();
  console.log(fn());
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise8();

// ─── Exercise 9: Predict the Output ─────────────────────────────────────────
// Topic: Variable shadowing
//
// What does each console.log print?

function exercise9() {
  let x = 1;

  {
    let x = 2;
    console.log(x);
  }

  console.log(x);

  function inner() {
    let x = 3;
    console.log(x);
  }

  inner();
  console.log(x);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise9();

// ─── Exercise 10: Predict the Output ────────────────────────────────────────
// Topic: TDZ shadows outer variable
//
// What happens when this function runs?

function exercise10() {
  const value = "outer";

  function test() {
    console.log(value);
    const value = "inner";
  }

  try {
    test();
  } catch (e) {
    console.log((e as Error).message);
  }
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise10();

// ─── Exercise 11: Predict the Output ────────────────────────────────────────
// Topic: Hoisting order — multiple var declarations and function
//
// What does each console.log print?

function exercise11() {
  console.log(a);
  console.log(b());

  var a = 1;

  function b() {
    return 2;
  }

  var a = 3;

  console.log(a);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise11();

// ─── Exercise 12: Predict the Output ────────────────────────────────────────
// Topic: Nested function scope access
//
// What does the final console.log print?

function exercise12() {
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
  console.log(result);
}

// YOUR ANSWER:
// Log 1: ???

// Uncomment to test:
// exercise12();

// ─── Exercise 13: Predict the Output ────────────────────────────────────────
// Topic: var hoisting across blocks
//
// What does each console.log print?

function exercise13() {
  console.log(x);

  if (false) {
    var x = 5;
  }

  console.log(x);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???

// Uncomment to test:
// exercise13();

// ─── Exercise 14: Fix the Bug ───────────────────────────────────────────────
// Topic: var loop closure bug
//
// This function is supposed to return an array of functions
// where functions[0]() returns 0, functions[1]() returns 1, etc.
// But every function returns 3. Fix it!

function exercise14(): (() => number)[] {
  const functions: (() => number)[] = [];

  for (var i = 0; i < 3; i++) {
    functions.push(function () {
      return i;
    });
  }

  return functions;
}

// Uncomment to test:
// const fns14 = exercise14();
// console.log(fns14[0]()); // Expected: 0, Currently: 3
// console.log(fns14[1]()); // Expected: 1, Currently: 3
// console.log(fns14[2]()); // Expected: 2, Currently: 3

// ─── Exercise 15: Fix the Bug ───────────────────────────────────────────────
// Topic: Accidental global variable
//
// This function accidentally creates a global variable.
// Fix it so that `total` is properly scoped within the function.
// Do NOT change the function's return type or behavior.

function exercise15(numbers: number[]): number {
  total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}

declare let total: number;

// Uncomment to test:
// console.log(exercise15([1, 2, 3])); // Expected: 6
// console.log(typeof total);          // Expected: "undefined" after fix

// ─── Exercise 16: Fix the Bug ───────────────────────────────────────────────
// Topic: TDZ error
//
// This function throws a ReferenceError. Fix it so it works correctly.
// The intent is to log the value and then use it.

function exercise16() {
  const message = getGreeting();
  console.log(message);

  function getGreeting() {
    return `Hello, ${userName}`;
  }

  const userName = "Alice";

  return message;
}

// Uncomment to test:
// console.log(exercise16()); // Expected: "Hello, Alice"

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Scope-protected module pattern
//
// Create a function `createBankAccount` that returns an object with:
//   - deposit(amount: number): void    — adds to balance
//   - withdraw(amount: number): boolean — subtracts if sufficient funds, returns true/false
//   - getBalance(): number             — returns current balance
//
// The balance should NOT be directly accessible from outside.
// Initial balance is passed as a parameter.

function exercise17(
  initialBalance: number
): {
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  getBalance: () => number;
} {
  // YOUR CODE HERE

  return {
    deposit(_amount: number) {},
    withdraw(_amount: number) {
      return false;
    },
    getBalance() {
      return 0;
    },
  };
}

// Uncomment to test:
// const account = exercise17(100);
// console.log(account.getBalance());     // Expected: 100
// account.deposit(50);
// console.log(account.getBalance());     // Expected: 150
// console.log(account.withdraw(200));    // Expected: false
// console.log(account.getBalance());     // Expected: 150
// console.log(account.withdraw(30));     // Expected: true
// console.log(account.getBalance());     // Expected: 120

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Variable lookup simulator
//
// Implement a simplified scope chain simulator.
// `createScope` takes an optional parent scope and returns an object with:
//   - define(name: string, value: unknown): void — defines a variable in THIS scope
//   - lookup(name: string): unknown — looks up a variable, walking up the chain
//     Throws Error("Variable 'name' is not defined") if not found anywhere.
//
// This simulates how the JS engine resolves variables through the scope chain.

interface Scope {
  define: (name: string, value: unknown) => void;
  lookup: (name: string) => unknown;
}

function exercise18(parent?: Scope): Scope {
  // YOUR CODE HERE

  return {
    define(_name: string, _value: unknown) {},
    lookup(_name: string): unknown {
      return undefined;
    },
  };
}

// Uncomment to test:
// const globalScope = exercise18();
// globalScope.define("x", 10);
// globalScope.define("y", 20);
//
// const functionScope = exercise18(globalScope);
// functionScope.define("y", 99); // shadows global y
// functionScope.define("z", 30);
//
// const blockScope = exercise18(functionScope);
// blockScope.define("z", 999); // shadows function z
//
// console.log(blockScope.lookup("x"));  // Expected: 10  (found in global)
// console.log(blockScope.lookup("y"));  // Expected: 99  (found in function, shadows global)
// console.log(blockScope.lookup("z"));  // Expected: 999 (found in block, shadows function)
// console.log(functionScope.lookup("z")); // Expected: 30 (own scope)
// console.log(functionScope.lookup("x")); // Expected: 10 (found in global)
//
// try {
//   blockScope.lookup("notDefined");
// } catch (e) {
//   console.log((e as Error).message); // Expected: "Variable 'notDefined' is not defined"
// }
