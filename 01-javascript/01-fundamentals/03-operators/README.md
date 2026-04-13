# Operators in JavaScript

JavaScript operators transform and combine values. Understanding how each operator works — especially with type coercion — is essential for writing predictable code.

---

## 1. Arithmetic Operators

| Operator | Name           | Example        | Result |
|----------|----------------|----------------|--------|
| `+`      | Addition       | `5 + 3`        | `8`    |
| `-`      | Subtraction    | `5 - 3`        | `2`    |
| `*`      | Multiplication | `5 * 3`        | `15`   |
| `/`      | Division       | `10 / 3`       | `3.333…` |
| `%`      | Remainder      | `10 % 3`       | `1`    |
| `**`     | Exponentiation | `2 ** 10`      | `1024` |

### String concatenation with `+`

The `+` operator is overloaded: if **either** operand is a string, it concatenates.

```js
"5" + 3;          // "53"  — number coerced to string
3 + "5";          // "35"
2 + 2 + "1";      // "41"  — left-to-right: (2+2) then 4+"1"
"1" + 2 + 2;      // "122" — "1"+2 → "12", then "12"+2

// Other arithmetic operators ALWAYS convert to numbers:
"6" - 2;          // 4
"6" / "2";        // 3
"5" * "2";        // 10
```

### Increment / Decrement

```js
let a = 5;
++a;   // 6 — prefix: increments, then returns NEW value
a++;   // 6 — postfix: returns OLD value, then increments (a is now 7)
```

---

## 2. Assignment Operators

| Operator | Equivalent     | Example      |
|----------|----------------|--------------|
| `=`      | —              | `x = 5`      |
| `+=`     | `x = x + y`   | `x += 3`     |
| `-=`     | `x = x - y`   | `x -= 3`     |
| `*=`     | `x = x * y`   | `x *= 3`     |
| `/=`     | `x = x / y`   | `x /= 3`     |
| `%=`     | `x = x % y`   | `x %= 3`     |
| `**=`    | `x = x ** y`  | `x **= 3`    |
| `&&=`    | `x && (x = y)`| `x &&= 3`    |
| `\|\|=`  | `x \|\| (x = y)` | `x \|\|= 3` |
| `??=`    | `x ?? (x = y)`| `x ??= 3`    |

Assignment returns a value — `(a = 5)` evaluates to `5`. Chained assignments `a = b = c = 5` evaluate right-to-left.

### Logical assignment operators (ES2021)

```js
let x = 0;
x ||= 10;  // x is still falsy (0), so assigns 10
x &&= 20;  // x is truthy (10), so assigns 20
x ??= 30;  // x is not null/undefined, so keeps 20
```

---

## 3. Comparison Operators

| Operator | Name                 | Example          | Result  |
|----------|----------------------|------------------|---------|
| `==`     | Loose equality       | `"5" == 5`       | `true`  |
| `===`    | Strict equality      | `"5" === 5`      | `false` |
| `!=`     | Loose inequality     | `"5" != 5`       | `false` |
| `!==`    | Strict inequality    | `"5" !== 5`      | `true`  |
| `>`      | Greater than         | `5 > 3`          | `true`  |
| `<`      | Less than            | `5 < 3`          | `false` |
| `>=`     | Greater or equal     | `5 >= 5`         | `true`  |
| `<=`     | Less or equal        | `5 <= 3`         | `false` |

### `==` vs `===` (the most important distinction)

`==` (loose equality) converts operands to the **same type** before comparing. `===` (strict equality) compares **without** type conversion — if types differ, it's `false` immediately.

```js
0 == false;        // true  — false → 0, then 0 == 0
0 === false;       // false — number vs boolean, different types

"" == false;       // true  — both coerce to 0
"" === false;      // false — string vs boolean

null == undefined; // true  — special rule: they equal each other
null === undefined;// false — different types

null == 0;         // false — null only equals undefined in ==
null >= 0;         // true  — comparison operators convert null → 0
```

### String comparison

Strings are compared **lexicographically** (by Unicode code point), character by character:

```js
"apple" > "banana";  // false — "a" (97) < "b" (98)
"2" > "12";          // true! — "2" (50) > "1" (49) — first char decides
"Bee" > "Be";        // true  — longer string wins when prefix matches
```

### null and undefined comparisons

```js
null == undefined;   // true  — the only values they equal (besides themselves)
null == 0;           // false — null doesn't coerce in ==
null > 0;            // false — null → 0 in comparisons, but 0 > 0 is false
null >= 0;           // true  — null → 0, 0 >= 0 is true
undefined > 0;       // false — undefined → NaN, NaN comparisons are always false
undefined == 0;      // false — undefined only == null
```

---

## 4. Logical Operators

Logical operators work with **any type**, not just booleans. They return the **original value** (not necessarily `true`/`false`).

### `||` (OR) — returns the first truthy value

```js
result = value1 || value2 || value3;
```

Evaluates left-to-right. Returns the **first truthy** operand, or the **last** operand if all are falsy.

```js
1 || 0;                     // 1
null || 1;                  // 1
null || 0 || undefined;     // undefined (all falsy, returns last)
"" || "hello" || 0;         // "hello"
```

### `&&` (AND) — returns the first falsy value

```js
result = value1 && value2 && value3;
```

Evaluates left-to-right. Returns the **first falsy** operand, or the **last** operand if all are truthy.

```js
1 && 0;                     // 0
1 && 5;                     // 5
null && 5;                  // null
1 && 2 && 3;                // 3  (all truthy → last value)
1 && 2 && null && 3;        // null (first falsy)
```

### `!` (NOT) — converts to boolean and negates

```js
!true;      // false
!0;         // true
!"hello";   // false
!!"hello";  // true  — double NOT converts to boolean
!!null;     // false
```

### Short-circuit evaluation

Both `||` and `&&` **stop evaluating** as soon as the result is determined:

```js
true || alert("never runs");    // alert is never called
false && alert("never runs");   // alert is never called

// Common pattern: guard clause
user && user.logout();          // only calls logout if user is truthy
```

### Precedence: `!` > `&&` > `||`

```js
null || 2 && 3 || 4;
// → null || (2 && 3) || 4   — && binds tighter
// → null || 3 || 4
// → 3
```

---

## 5. Nullish Coalescing Operator (`??`)

Returns the right operand when the left is `null` or `undefined` (and **only** those two values).

```js
result = a ?? b;
// equivalent to: (a !== null && a !== undefined) ? a : b
```

### `??` vs `||` — the critical difference

`||` treats **all falsy values** (`0`, `""`, `false`, `NaN`) as "empty."
`??` treats **only** `null`/`undefined` as "empty."

```js
let height = 0;

height || 100;   // 100  — 0 is falsy, so || falls through
height ?? 100;   // 0    — 0 is NOT null/undefined, so ?? keeps it

let name = "";
name || "Anonymous";   // "Anonymous" — "" is falsy
name ?? "Anonymous";   // ""          — "" is NOT null/undefined
```

### Restriction: cannot mix `??` with `&&`/`||` without parentheses

```js
// a || b ?? c;        // SyntaxError!
(a || b) ?? c;         // OK
a || (b ?? c);         // OK
```

### Nullish assignment (`??=`)

```js
let user = null;
user ??= "Guest";  // user is now "Guest"

let count = 0;
count ??= 10;      // count stays 0 (not null/undefined)
```

---

## 6. Optional Chaining (`?.`)

Safely access nested properties. Stops and returns `undefined` if the value before `?.` is `null` or `undefined`.

### Three forms

| Form          | Purpose                    | Example                  |
|---------------|----------------------------|--------------------------|
| `obj?.prop`   | Property access            | `user?.address`          |
| `obj?.[expr]` | Bracket notation           | `user?.["name"]`         |
| `obj?.method()`| Method call               | `user?.logout()`         |

### Examples

```js
let user = {};

user?.address?.street;        // undefined (no error)
user?.address?.street?.name;  // undefined (no error)

// Without ?. this would throw: "Cannot read property 'street' of undefined"
// user.address.street;       // TypeError!
```

### Method calls

```js
let admin = { greet() { return "Hi"; } };
let guest = {};

admin.greet?.();   // "Hi"
guest.greet?.();   // undefined (no error, method doesn't exist)
```

### Bracket notation

```js
let key = "name";
let user1 = { name: "Alice" };
let user2 = null;

user1?.[key];   // "Alice"
user2?.[key];   // undefined (no error)
```

### Short-circuiting

If `?.` encounters `null`/`undefined`, it stops immediately — nothing to the right is evaluated:

```js
let user = null;
let x = 0;
user?.sayHi(x++);   // no call happens, x stays 0
```

### Restrictions

- `?.` is for **reading and deleting**, not writing: `user?.name = "John"` is a SyntaxError.
- The variable before `?.` must be **declared** (`let`/`const`/`var`).
- Don't overuse — only use where `null`/`undefined` is expected.

---

## 7. Unary Operators

| Operator    | Description                                | Example                 | Result       |
|-------------|--------------------------------------------|-------------------------|--------------|
| `+x`        | Numeric conversion (same as `Number(x)`)   | `+"42"`                 | `42`         |
| `-x`        | Negation                                   | `-5`                    | `-5`         |
| `typeof x`  | Returns type as string                     | `typeof "hi"`           | `"string"`   |
| `void x`    | Evaluates expression, returns `undefined`  | `void 0`                | `undefined`  |
| `delete x`  | Deletes an object property                 | `delete obj.key`        | `true`/`false` |

### Unary `+` (numeric conversion)

```js
+true;     // 1
+false;    // 0
+"";       // 0
+"42";     // 42
+"hello";  // NaN
+null;     // 0
+undefined;// NaN
```

### `typeof`

```js
typeof 42;            // "number"
typeof "hi";          // "string"
typeof true;          // "boolean"
typeof undefined;     // "undefined"
typeof null;          // "object"    ← historical bug
typeof function(){};  // "function"
typeof Symbol();      // "symbol"
typeof 42n;           // "bigint"
```

### `void`

Always returns `undefined`. Rarely used, but seen in `void 0` (a reliable way to get `undefined`) and `javascript:void(0)` in links.

### `delete`

Removes a property from an object. Returns `true` on success.

```js
const obj = { a: 1, b: 2 };
delete obj.a;  // true
console.log(obj); // { b: 2 }
```

---

## 8. Ternary / Conditional Operator (`? :`)

The only operator that takes three operands. A concise alternative to `if/else`:

```js
let result = condition ? valueIfTrue : valueIfFalse;

let age = 20;
let status = age >= 18 ? "adult" : "minor";  // "adult"

// Can be chained (but avoid nesting too deeply):
let category = age < 13 ? "child"
             : age < 18 ? "teen"
             : "adult";
```

---

## 9. Comma Operator

Evaluates each operand left-to-right and returns the **last** one. Has the **lowest precedence** of all operators.

```js
let a = (1 + 2, 3 + 4);  // a = 7 (first expression discarded)

// Practical use: multiple expressions in a for loop
for (let i = 0, j = 10; i < j; i++, j--) { /* ... */ }
```

> Parentheses are required in assignments because `,` has lower precedence than `=`:
> `a = 1 + 2, 3 + 4` assigns `3` to `a` (not `7`).

---

## 10. Operator Precedence (Key Operators)

Higher number = higher priority (evaluated first).

| Precedence | Operator(s)                | Associativity |
|------------|----------------------------|---------------|
| 17         | `()` (grouping)            | n/a           |
| 16         | `.` `?.` `[]`              | left-to-right |
| 15         | `()` (function call), `new`| left-to-right |
| 14         | `++` `--` (postfix)        | n/a           |
| 14         | `!` `~` `+` `-` `typeof` `void` `delete` (unary) | right-to-left |
| 13         | `**`                       | right-to-left |
| 12         | `*` `/` `%`               | left-to-right |
| 11         | `+` `-` (binary)          | left-to-right |
| 9          | `<` `<=` `>` `>=` `in` `instanceof` | left-to-right |
| 8          | `==` `!=` `===` `!==`     | left-to-right |
| 6          | `&&`                       | left-to-right |
| 5          | `\|\|`                     | left-to-right |
| 4          | `??`                       | left-to-right |
| 3          | `? :`  (ternary)           | right-to-left |
| 2          | `=` `+=` `-=` etc.        | right-to-left |
| 1          | `,`                        | left-to-right |

> **Key takeaway:** Unary > Arithmetic > Comparison > Logical > Assignment > Comma.

---

## 11. Common Gotchas

### 1. `==` vs `===` — loose equality is surprising

```js
0 == "";       // true — both become 0
0 == false;    // true
"" == false;   // true
null == 0;     // false — null only == undefined
[] == false;   // true — [] → "" → 0 → 0 == 0
```

### 2. `||` with `0` and `""` — use `??` for defaults

```js
let port = 0;
port || 3000;   // 3000 — BUG! 0 is a valid port
port ?? 3000;   // 0    — correct

let title = "";
title || "Untitled";  // "Untitled" — BUG if empty string is intentional
title ?? "Untitled";  // ""         — correct
```

### 3. String comparison: `"2" > "12"` is `true`

Strings are compared character-by-character using Unicode values, NOT numerically:

```js
"2" > "12";    // true! — "2" (U+0032) > "1" (U+0031)
"02" > "12";   // false — "0" (U+0030) < "1" (U+0031)

// Fix: convert to numbers first
Number("2") > Number("12");  // false
```

### 4. `+` with mixed types

```js
"" + 1 + 0;   // "10"  — string wins, everything concatenates
"" - 1 + 0;   // -1    — subtraction forces numeric conversion
4 + 5 + "px"; // "9px" — 4+5 first (both numbers), then concatenation
"$" + 4 + 5;  // "$45" — string first, everything concatenates
```

### 5. Unary `+` before objects

```js
+[];        // 0       — [] → "" → 0
+[1];       // 1       — [1] → "1" → 1
+[1, 2];    // NaN     — [1,2] → "1,2" → NaN
+{};        // NaN     — {} → "[object Object]" → NaN
```

### 6. `typeof` of undeclared variable doesn't throw

```js
typeof undeclaredVar;   // "undefined" — safe, no ReferenceError
// undeclaredVar;       // ReferenceError!
```

---

## 12. Best Practices

1. **Always use `===` and `!==`** — avoid `==` and `!=` to prevent implicit coercion bugs
2. **Use `??` instead of `||` for defaults** when `0`, `""`, or `false` are valid values
3. **Use `?.` for optional property access** — cleaner than manual null checks, but don't overuse
4. **Prefer explicit conversions** — `Number(x)`, `String(x)`, `Boolean(x)` over implicit coercion
5. **Don't rely on operator precedence for readability** — use parentheses to make intent clear: `(a && b) || c`
6. **Avoid chained assignments** — `a = b = c = 1` is clever but hard to read
7. **Use `??=` for default initialization** — `config.timeout ??= 5000`
8. **Never compare with `null`/`undefined` using `>`, `<`, `>=`, `<=`** — the behavior is inconsistent
9. **Convert strings to numbers explicitly before numeric comparison** — don't let `"2" > "12"` surprise you

---

## References

- [javascript.info — Basic operators, maths](https://javascript.info/operators)
- [javascript.info — Comparisons](https://javascript.info/comparison)
- [javascript.info — Logical operators](https://javascript.info/logical-operators)
- [javascript.info — Nullish coalescing operator](https://javascript.info/nullish-coalescing-operator)
- [javascript.info — Optional chaining](https://javascript.info/optional-chaining)
- [MDN — Expressions and operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators)
- [MDN — Operator precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
