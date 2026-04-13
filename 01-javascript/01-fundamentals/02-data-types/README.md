# Data Types in JavaScript

JavaScript is **dynamically typed** (variables aren't bound to a type) and **weakly typed** (implicit conversions happen automatically). There are 8 data types: 7 primitives and Object.

---

## The 8 Data Types

| # | Type        | Category  | Example                     | `typeof` returns |
|---|-------------|-----------|-----------------------------|------------------|
| 1 | `number`    | Primitive | `42`, `3.14`, `NaN`         | `"number"`       |
| 2 | `bigint`    | Primitive | `9007199254740991n`         | `"bigint"`       |
| 3 | `string`    | Primitive | `"hello"`, `'hi'`, `` `hey` `` | `"string"`   |
| 4 | `boolean`   | Primitive | `true`, `false`             | `"boolean"`      |
| 5 | `null`      | Primitive | `null`                      | `"object"` (bug) |
| 6 | `undefined` | Primitive | `undefined`                 | `"undefined"`    |
| 7 | `symbol`    | Primitive | `Symbol("id")`              | `"symbol"`       |
| 8 | `object`    | Non-primitive | `{}`, `[]`, `function(){}` | `"object"` or `"function"` |

> All primitives are **immutable** (their values cannot be changed, only replaced). Objects are **mutable**.

---

## Primitives

### Number

Represents both integers and floating-point values. Stored as 64-bit double-precision IEEE 754.

```js
let integer = 42;
let float = 3.14;
let negative = -10;
let exponential = 2.5e6; // 2,500,000
```

#### Special numeric values

```js
Infinity          // 1 / 0
-Infinity         // -1 / 0
NaN               // "not a number" — result of failed math operations
```

#### NaN is sticky and self-unequal

```js
NaN + 1;          // NaN — any operation with NaN returns NaN
NaN === NaN;      // false — NaN is the only value not equal to itself
isNaN(NaN);       // true
Number.isNaN(NaN); // true (stricter — doesn't coerce argument)
```

> **Exception:** `NaN ** 0` is `1`.

#### Safe integer range

```js
Number.MAX_SAFE_INTEGER; //  9007199254740991  (2^53 - 1)
Number.MIN_SAFE_INTEGER; // -9007199254740991

// Outside the safe range, precision is lost:
9007199254740991 + 1; // 9007199254740992
9007199254740991 + 2; // 9007199254740992 (same!)

Number.isSafeInteger(9007199254740991); // true
Number.isSafeInteger(9007199254740992); // false
```

#### +0 and -0

```js
+0 === -0;          // true
Object.is(+0, -0);  // false
1 / +0;             // Infinity
1 / -0;             // -Infinity
```

### BigInt

For integers beyond the safe range. Created by appending `n` to a literal or using `BigInt()`:

```js
const big = 1234567890123456789012345678901234567890n;
const fromNum = BigInt(42); // 42n

big + 1n;     // OK
big + 1;      // TypeError — can't mix BigInt and Number
```

> BigInt cannot represent decimals. Use Number for floating-point math.

### String

A sequence of UTF-16 code units. Strings are **immutable**.

```js
let double = "Hello";
let single = 'Hello';
let backtick = `Hello ${name}`; // template literal — allows interpolation
```

#### Template literals

```js
const name = "Alice";
`Hello, ${name}!`;           // "Hello, Alice!"
`1 + 2 = ${1 + 2}`;          // "1 + 2 = 3"
`Multi
line`;                        // works — backticks allow newlines
```

> Double and single quotes are identical in JavaScript. There is no `char` type — a single character is just a string of length 1.

#### String immutability

```js
let str = "Hello";
str[0] = "h";     // silently fails (or TypeError in strict mode)
console.log(str);  // "Hello" — unchanged
str = "hello";     // this works — reassigning the variable, not mutating the string
```

### Boolean

Two values: `true` and `false`. Often the result of comparisons:

```js
let isActive = true;
let isGreater = 4 > 1; // true
```

### null

A special value meaning "intentionally empty" or "unknown value". It forms its own type.

```js
let user = null; // user is known to be empty/absent
```

> `null` is NOT a reference to a "null pointer" or "nonexistent object" like in other languages. It's simply a special value representing "nothing."

### undefined

Means "value is not assigned." Variables declared but not initialized default to `undefined`.

```js
let x;
console.log(x); // undefined
```

#### `null` vs `undefined`

| Aspect          | `null`                              | `undefined`                          |
|-----------------|-------------------------------------|--------------------------------------|
| Meaning         | Intentionally empty                 | Not assigned / absent                |
| Assigned by     | Developer (explicitly)              | JavaScript engine (default)          |
| `typeof`        | `"object"` (historical bug)         | `"undefined"`                        |
| `Number()`      | `0`                                 | `NaN`                                |
| In JSON         | Valid value                         | Not valid (stripped from JSON)       |
| Default params  | Does NOT trigger default            | Triggers default                     |

```js
function greet(name = "World") {
  console.log(`Hello, ${name}!`);
}
greet(undefined); // "Hello, World!" — triggers default
greet(null);      // "Hello, null!"  — does NOT trigger default
```

> **Best practice:** Use `null` to explicitly mark "no value." Don't manually assign `undefined` — let JS use it as the default for unset things.

### Symbol

A unique and immutable identifier. Primarily used as object property keys that won't collide with other keys:

```js
const id = Symbol("id");
const anotherId = Symbol("id");

id === anotherId; // false — every Symbol is unique

const user = {};
user[id] = 123;
console.log(user[id]); // 123
```

> Symbols are not auto-converted to strings. `alert(Symbol("id"))` throws a TypeError. Use `.toString()` or `.description` explicitly.

---

## Objects (Non-primitive)

Objects store collections of data and more complex entities. Everything that is not a primitive is an object — including arrays, functions, dates, regex, etc.

```js
typeof {};           // "object"
typeof [];           // "object" (arrays are objects)
typeof function(){}; // "function" (special subtype of object)
typeof new Date();   // "object"
typeof /regex/;      // "object"
```

> Functions get special treatment from `typeof` — returning `"function"` instead of `"object"`. But technically, functions ARE objects (with the additional capability of being callable).

### Primitive wrapper objects

When you access a property on a primitive (like `"hello".length`), JavaScript temporarily wraps it in the corresponding object (`String`, `Number`, `Boolean`):

```js
"hello".toUpperCase();   // "HELLO" — JS wraps "hello" in a String object
(42).toFixed(2);         // "42.00" — JS wraps 42 in a Number object
true.toString();         // "true" — JS wraps true in a Boolean object
```

The wrapper is created and discarded immediately. You almost never need to create wrapper objects explicitly — avoid `new String()`, `new Number()`, `new Boolean()`.

---

## The `typeof` Operator

Returns a string indicating the type of the operand:

```js
typeof undefined;     // "undefined"
typeof 0;             // "number"
typeof 10n;           // "bigint"
typeof true;          // "boolean"
typeof "hello";       // "string"
typeof Symbol("id");  // "symbol"
typeof Math;          // "object"
typeof null;          // "object"   ← historical bug!
typeof alert;         // "function" ← special case for functions
```

### `typeof null === "object"` — the famous bug

This is a bug from the first version of JavaScript (1995) that was never fixed for backward compatibility. `null` is NOT an object — it's its own primitive type.

To properly check for `null`, use strict equality:

```js
let value = null;
typeof value;        // "object" — misleading!
value === null;      // true — the correct check
```

### `typeof` is an operator, not a function

```js
typeof x;    // works — operator syntax
typeof(x);   // also works — parentheses are just grouping, not a function call
```

---

## Type Coercion (Implicit Conversion)

JavaScript automatically converts types when operations involve mismatched types. This is called **coercion**.

### String conversion

Happens when a value is used where a string is expected, or explicitly with `String()`:

```js
String(123);       // "123"
String(true);      // "true"
String(null);      // "null"
String(undefined); // "undefined"
String(NaN);       // "NaN"

// The + operator with a string triggers string conversion:
"5" + 3;           // "53" (number → string, then concatenation)
3 + "5";           // "35"
```

### Numeric conversion

Happens in math operations (except `+` with strings) or explicitly with `Number()`:

```js
Number("123");     // 123
Number("  123  "); // 123 (whitespace trimmed)
Number("");        // 0   (empty string → 0)
Number("123z");    // NaN (invalid number)
Number(true);      // 1
Number(false);     // 0
Number(null);      // 0
Number(undefined); // NaN  ← note: NOT 0!

// Math operators trigger numeric conversion:
"6" / "2";         // 3
"6" - 2;           // 4
"6" * "2";         // 12
```

### Numeric conversion table

| Value         | Becomes   |
|---------------|-----------|
| `undefined`   | `NaN`     |
| `null`        | `0`       |
| `true`        | `1`       |
| `false`       | `0`       |
| `""`          | `0`       |
| `" "` (whitespace) | `0` |
| `"123"`       | `123`     |
| `"123z"`      | `NaN`     |

### Boolean conversion

Happens in logical contexts or explicitly with `Boolean()`:

**Falsy values** (convert to `false`):

```js
Boolean(0);         // false
Boolean(-0);        // false
Boolean(0n);        // false (BigInt zero)
Boolean("");        // false (empty string)
Boolean(null);      // false
Boolean(undefined); // false
Boolean(NaN);       // false
```

**Everything else is truthy** (converts to `true`):

```js
Boolean(1);         // true
Boolean(-1);        // true
Boolean("0");       // true  ← gotcha! Non-empty string!
Boolean(" ");       // true  ← gotcha! Non-empty string!
Boolean("false");   // true  ← gotcha! Non-empty string!
Boolean([]);        // true  ← gotcha! Empty array is truthy!
Boolean({});        // true  ← gotcha! Empty object is truthy!
```

> There are exactly **7 falsy values**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Memorize them — everything else is truthy.

---

## Type Checking Techniques

| Technique | Best for | Gotchas |
|-----------|----------|---------|
| `typeof x` | Primitives | `typeof null === "object"` |
| `x === null` | Checking null | Only works for null specifically |
| `Array.isArray(x)` | Arrays | `typeof []` is `"object"`, not `"array"` |
| `x instanceof Constructor` | Objects / classes | Doesn't work across frames/realms |
| `Object.prototype.toString.call(x)` | Everything (precise) | Verbose but reliable |

```js
// Object.prototype.toString — the most reliable type check:
Object.prototype.toString.call(42);        // "[object Number]"
Object.prototype.toString.call("hi");      // "[object String]"
Object.prototype.toString.call(null);      // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
Object.prototype.toString.call([]);        // "[object Array]"
Object.prototype.toString.call({});        // "[object Object]"
```

---

## Common Gotchas

### 1. `typeof null === "object"`

Already covered above. Always use `=== null` to check for null.

### 2. `NaN !== NaN`

```js
NaN === NaN;        // false
Number.isNaN(NaN);  // true — use this
Object.is(NaN, NaN); // true — or this
```

### 3. `"0"` is truthy

```js
Boolean("0");  // true — non-empty string!
Boolean(0);    // false — the number zero
"0" == false;  // true — loose equality coerces both to numbers (0 == 0)
```

### 4. `+` is overloaded

```js
"5" + 3;   // "53"  — string concatenation (string wins)
"5" - 3;   // 2     — numeric subtraction (no string version of -)
+ "5";     // 5     — unary plus converts to number
```

### 5. Empty array/object are truthy

```js
Boolean([]);  // true
Boolean({});  // true
// But:
[] == false;  // true — loose equality coerces [] → "" → 0, false → 0
```

### 6. `undefined` vs missing vs undeclared

```js
let x;             // declared, value is undefined
console.log(x);    // undefined
console.log(y);    // ReferenceError — y is not declared at all

typeof x;          // "undefined"
typeof y;          // "undefined" — typeof is safe for undeclared variables!
```

---

## Best Practices

1. **Use `===` over `==`** — strict equality avoids coercion surprises
2. **Use `Number.isNaN()` over `isNaN()`** — the global `isNaN()` coerces its argument first (`isNaN("hello")` returns `true`)
3. **Use `null` for intentional absence**, let `undefined` be the engine's default
4. **Don't use `new String()`, `new Number()`, `new Boolean()`** — they create objects, not primitives
5. **Know your falsy values** — `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` (7 total)
6. **Use template literals** for string interpolation instead of `+` concatenation
7. **Use `typeof` for primitives**, `Array.isArray()` for arrays, `=== null` for null
