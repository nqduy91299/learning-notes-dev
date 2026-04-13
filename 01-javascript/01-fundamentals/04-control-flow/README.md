# Control Flow in JavaScript

Control flow determines the order in which statements are executed. JavaScript provides **conditionals** (choose a path) and **loops** (repeat a path).

---

## 1. if / else if / else

The `if` statement evaluates a condition and executes a block when the condition is truthy.

```js
if (condition) {
  // runs when condition is truthy
} else if (anotherCondition) {
  // runs when the first is falsy and this is truthy
} else {
  // runs when all above are falsy
}
```

The condition is converted to a boolean. All falsy values (`false`, `0`, `""`, `null`, `undefined`, `NaN`) skip the block; everything else enters it.

```js
if ("0") {
  console.log("runs!"); // "0" is a non-empty string → truthy
}
```

> Always use braces `{}` even for single-line bodies — it prevents bugs when adding lines later.

---

## 2. switch Statement

A `switch` compares one expression against multiple values using **strict equality** (`===`).

```js
switch (expression) {
  case value1:
    // code
    break;
  case value2:
    // code
    break;
  default:
    // code if nothing matched
}
```

### Key behaviors

#### Strict comparison (`===`)

```js
const input = "1"; // string
switch (input) {
  case 1:          // number — does NOT match "1"
    console.log("number");
    break;
  case "1":        // string — matches
    console.log("string");
    break;
}
// Output: "string"
```

#### Fall-through

If you omit `break`, execution continues into the next case **without checking its condition**:

```js
const n = 2;
switch (n) {
  case 1:
    console.log("one");
  case 2:
    console.log("two");   // ← matched here
  case 3:
    console.log("three"); // ← falls through!
  default:
    console.log("default"); // ← falls through!
}
// Output: "two", "three", "default"
```

#### Grouping cases

Fall-through is intentionally used to group cases that share the same code:

```js
switch (day) {
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  default:
    console.log("Weekday");
}
```

#### Block scope gotcha with `let`/`const`

All `case` clauses share the same scope. Declaring `let`/`const` in one case is visible (and can conflict) in another:

```js
switch (action) {
  case "increment":
    let count = 1; // ← SyntaxError if another case also declares `count`
    break;
  case "decrement":
    let count = -1; // ← Error: `count` already declared
    break;
}
```

**Fix:** Wrap each case in its own block:

```js
switch (action) {
  case "increment": {
    let count = 1;
    break;
  }
  case "decrement": {
    let count = -1;
    break;
  }
}
```

---

## 3. Ternary (Conditional) Operator

The ternary operator `? :` is an **expression** (it returns a value), unlike `if` which is a statement.

```js
const result = condition ? valueIfTrue : valueIfFalse;
```

Use it for simple value selection. For side effects or complex branching, prefer `if/else`.

```js
const age = 20;
const label = age >= 18 ? "adult" : "minor"; // "adult"
```

Ternaries can be chained but readability drops fast:

```js
const message =
  age < 3   ? "baby" :
  age < 18  ? "teen" :
  age < 65  ? "adult" :
              "senior";
```

> Covered in more detail in the Operators chapter.

---

## 4. for Loop

The classic counting loop with three parts: **initialization**, **condition**, and **increment**.

```js
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
```

### Execution order

```
1. init (once)  →  2. check condition  →  3. run body  →  4. run step  →  back to 2
```

Any part can be omitted (but the semicolons must remain):

```js
let i = 0;
for (; i < 3; ) {   // equivalent to while (i < 3)
  console.log(i++);
}
```

An infinite loop: `for (;;) { ... }` — must include a `break` inside.

### Variable scope

```js
for (let i = 0; i < 3; i++) { /* i is scoped to loop */ }
// console.log(i); // ReferenceError
```

---

## 5. while Loop

Checks the condition **before** each iteration. If the condition is falsy from the start, the body never runs.

```js
let i = 0;
while (i < 3) {
  console.log(i); // 0, 1, 2
  i++;
}
```

### Prefix vs postfix in condition

```js
let i = 0;
while (++i < 5) console.log(i); // 1, 2, 3, 4  (prefix: increments, then compares)

let j = 0;
while (j++ < 5) console.log(j); // 1, 2, 3, 4, 5 (postfix: compares old value, then increments)
```

---

## 6. do...while Loop

Runs the body **at least once**, then checks the condition:

```js
let i = 0;
do {
  console.log(i); // 0, 1, 2
  i++;
} while (i < 3);
```

Use when you need at least one execution (e.g., prompting for valid input):

```js
let input: string;
do {
  input = getUserInput();
} while (!isValid(input));
```

---

## 7. for...of — Iterating Over Iterables

Iterates over **values** of any iterable: arrays, strings, Maps, Sets, `arguments`, NodeLists, generators.

```js
// Array
for (const item of [10, 20, 30]) {
  console.log(item); // 10, 20, 30
}

// String (iterates characters, handles Unicode correctly)
for (const char of "Hi!") {
  console.log(char); // "H", "i", "!"
}

// Map
const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
  console.log(key, value); // "a" 1, "b" 2
}

// Set
for (const value of new Set([1, 2, 3])) {
  console.log(value); // 1, 2, 3
}
```

> Plain objects are **not iterable** by default. Use `Object.entries(obj)`, `Object.keys(obj)`, or `Object.values(obj)` to iterate over objects with `for...of`.

---

## 8. for...in — Iterating Over Object Keys

Iterates over **enumerable string-keyed properties**, including inherited ones.

```js
const user = { name: "Alice", age: 30 };
for (const key in user) {
  console.log(key, user[key]); // "name" "Alice", "age" 30
}
```

### Why to avoid `for...in` on arrays

```js
const arr = [10, 20, 30];
arr.extra = "oops";

for (const key in arr) {
  console.log(key); // "0", "1", "2", "extra" ← includes non-index properties!
}
// Keys are STRINGS, not numbers.
// Order is not guaranteed by all engines for all cases.
// Inherited enumerable properties may appear.
```

**Rule:** Use `for...of` or `.forEach()` for arrays. Use `for...in` only for plain objects.

---

## 9. break and continue

### break

Exits the loop immediately:

```js
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i); // 0, 1, 2, 3, 4
}
```

### continue

Skips the rest of the current iteration and moves to the next:

```js
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) continue;
  console.log(i); // 1, 3, 5, 7, 9
}
```

### Labeled statements for nested loops

Labels allow `break`/`continue` to target an outer loop:

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer; // exits both loops
    console.log(i, j);
  }
}
// 0 0, 0 1, 0 2, 1 0  (stops at i=1, j=1)
```

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer; // skips to next i
    console.log(i, j);
  }
}
// 0 0, 1 0, 2 0  (j never reaches 2)
```

> Labels only work with loops (and blocks). You cannot "jump" to an arbitrary label — this is not `goto`.

---

## 10. Common Gotchas

### 1. Switch fall-through

Forgetting `break` in a `switch` causes execution to "fall through" to subsequent cases — the most common `switch` bug.

### 2. `for...in` on arrays

`for...in` gives you **string keys** (not values), includes non-index properties, and may have unexpected ordering. Always use `for...of` for arrays.

### 3. Off-by-one errors

```js
// Bug: runs 6 times instead of 5
for (let i = 0; i <= 5; i++) { /* ... */ }

// Fix: use < for 0-based counting
for (let i = 0; i < 5; i++) { /* ... */ }
```

### 4. `switch` uses strict equality

`switch ("1") { case 1: ... }` will **not** match — types must be identical.

### 5. Infinite loops

Missing the increment in `while` or `for` creates an infinite loop:

```js
let i = 0;
while (i < 5) {
  console.log(i);
  // forgot i++ → infinite loop!
}
```

---

## 11. Best Practices

1. **Prefer `for...of`** over `for...in` for arrays and iterables
2. **Always use `break`** in every `switch` case (unless intentionally grouping)
3. **Wrap `switch` cases in blocks** `{ }` when declaring variables with `let`/`const`
4. **Avoid `for...in` on arrays** — it iterates inherited and non-index properties
5. **Use labeled `break`/`continue`** sparingly — they complicate control flow. Consider extracting to a function instead.
6. **Prefer `for...of` + `Object.entries()`** over `for...in` even for objects, to avoid inherited property issues
7. **Use `do...while`** only when at least one iteration is required
8. **Convert switch to object lookup** for simple value mappings:

```js
// Instead of switch:
const statusMap: Record<string, string> = {
  200: "OK",
  404: "Not Found",
  500: "Server Error",
};
const message = statusMap[code] ?? "Unknown";
```

---

## References

- [javascript.info — Conditional branching: if, '?'](https://javascript.info/ifelse)
- [javascript.info — The "switch" statement](https://javascript.info/switch)
- [javascript.info — Loops: while and for](https://javascript.info/while-for)
- [javascript.info — Logical operators](https://javascript.info/logical-operators)
- [MDN — if...else](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else)
- [MDN — switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)
- [MDN — for](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for)
- [MDN — for...of](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- [MDN — for...in](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)
- [MDN — break](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break)
- [MDN — continue](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue)
- [MDN — label](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label)
