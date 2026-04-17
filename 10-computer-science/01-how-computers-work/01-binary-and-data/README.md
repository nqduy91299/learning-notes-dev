# Binary & Data Representation

## Why This Matters for Frontend Developers

Every pixel you render, every API response you parse, every color you manipulate, and every
number you calculate ultimately comes down to binary data. Understanding how data is represented
at the lowest level explains **why** things behave the way they do in JavaScript — from the
infamous `0.1 + 0.2 !== 0.3` to why emoji can break string operations, to how you can use
bitwise tricks for blazing-fast feature flags and color manipulation.

---

## Table of Contents

1. [Binary Number System](#1-binary-number-system)
2. [Number Base Conversions](#2-number-base-conversions)
3. [Why Hexadecimal?](#3-why-hexadecimal)
4. [Bits, Bytes, and Data Sizes](#4-bits-bytes-and-data-sizes)
5. [Character Encoding](#5-character-encoding)
6. [Base64 Encoding](#6-base64-encoding)
7. [Floating Point Numbers](#7-floating-point-numbers)
8. [Bitwise Operators in JavaScript](#8-bitwise-operators-in-javascript)
9. [Practical Bitwise Applications](#9-practical-bitwise-applications)
10. [ArrayBuffer and TypedArrays](#10-arraybuffer-and-typedarrays)

---

## 1. Binary Number System

Computers are built from transistors — tiny switches that are either **on** (1) or **off** (0).
Everything a computer does is built on top of this single distinction. This is the **binary**
(base-2) number system.

### How Binary Works

In decimal (base 10), each position represents a power of 10:

```
  4    2    7
  ↓    ↓    ↓
10²  10¹  10⁰
400 + 20 +  7 = 427
```

In binary (base 2), each position represents a power of 2:

```
  1    1    0    1
  ↓    ↓    ↓    ↓
 2³   2²   2¹   2⁰
  8 +  4 +  0 +  1 = 13
```

### Common Binary Values to Know

| Binary     | Decimal | Why It Matters                        |
|------------|---------|---------------------------------------|
| `0000 0001`| 1       | Smallest positive integer             |
| `0000 1111`| 15      | Max value of a hex digit (F)          |
| `1111 1111`| 255     | Max value of a byte (color channel)   |
| `1111 1111 1111 1111` | 65535 | Max `Uint16` value           |

### Frontend Connection

Every CSS color channel (R, G, B, A) is a single byte: 0–255. When you write `rgb(255, 0, 0)`,
you're saying "red channel all bits on, green and blue all bits off."

---

## 2. Number Base Conversions

### Binary → Decimal

Multiply each bit by its positional power of 2, then sum:

```
1011 (binary)
= 1×2³ + 0×2² + 1×2¹ + 1×2⁰
= 8 + 0 + 2 + 1
= 11 (decimal)
```

### Decimal → Binary

Repeatedly divide by 2 and collect remainders (read bottom-to-top):

```
13 ÷ 2 = 6 remainder 1
 6 ÷ 2 = 3 remainder 0
 3 ÷ 2 = 1 remainder 1
 1 ÷ 2 = 0 remainder 1
→ 1101
```

### Hexadecimal (Base 16)

Hex uses digits 0–9 and letters A–F (10–15). Each hex digit represents exactly 4 bits:

```
Hex:    F     F
Binary: 1111  1111
Decimal: 255
```

### Conversion Table

| Decimal | Binary | Hex |
|---------|--------|-----|
| 0       | 0000   | 0   |
| 1       | 0001   | 1   |
| 9       | 1001   | 9   |
| 10      | 1010   | A   |
| 15      | 1111   | F   |
| 16      | 10000  | 10  |
| 255     | 11111111 | FF |

### In JavaScript

```typescript
// Decimal → other bases
(255).toString(2);   // "11111111" (binary)
(255).toString(16);  // "ff" (hex)

// Other bases → decimal
parseInt("11111111", 2);  // 255
parseInt("ff", 16);       // 255

// Hex literals
const color = 0xFF0000;  // 16711680 in decimal
```

---

## 3. Why Hexadecimal?

Hex is the bridge between human-readable and binary. Each hex digit maps to exactly 4 bits,
making conversion trivial. This is why hex appears everywhere in frontend:

### CSS Colors

```css
/* #RRGGBB — each pair is one byte (0–255) */
#FF0000  /* Red: 255, Green: 0, Blue: 0 */
#00FF00  /* Pure green */
#336699  /* R:51 G:102 B:153 */

/* #RRGGBBAA — with alpha */
#FF000080  /* Red at 50% opacity (128/255 ≈ 0.502) */
```

### Memory Addresses

DevTools shows memory addresses in hex: `0x7ffeeb3a`. This is compact and aligns with
byte boundaries.

### Unicode Code Points

```typescript
"\u0041"      // "A" — hex 41 = decimal 65
"\u{1F600}"   // "😀" — hex 1F600 = decimal 128512
```

---

## 4. Bits, Bytes, and Data Sizes

| Unit     | Size               | Frontend Context                           |
|----------|--------------------|--------------------------------------------|
| 1 bit    | 0 or 1             | A single boolean flag                      |
| 1 byte   | 8 bits             | One ASCII character, one color channel     |
| 1 KB     | 1,024 bytes        | A small JSON response                      |
| 1 MB     | 1,024 KB           | A high-res JPEG image                      |
| 1 GB     | 1,024 MB           | Browser memory limit (roughly)             |

### Why This Matters

- **Bundle size**: A 500 KB JavaScript bundle is ~512,000 bytes of code the browser must
  download, parse, and compile.
- **Image optimization**: A 5 MB hero image is 5,242,880 bytes traveling over the network.
- **localStorage**: Limited to ~5 MB (5,242,880 bytes) per origin.
- **WebSocket frames**: Binary frames send raw bytes — understanding sizes matters.

### Important Distinction: KB vs kB

- **1 KB (kibibyte)** = 1,024 bytes (binary, used by OS)
- **1 kB (kilobyte)** = 1,000 bytes (metric, used by network speeds)

When your ISP says "100 Mbps," that's mega**bits** per second (divide by 8 for megabytes).

---

## 5. Character Encoding

### ASCII (1963)

The original character encoding. 7 bits = 128 characters (0–127). Covers English letters,
digits, and basic symbols.

```
A = 65 (0x41)    a = 97 (0x61)    0 = 48 (0x30)
Space = 32        Newline = 10     Tab = 9
```

### Unicode

A universal standard that assigns a unique **code point** to every character in every language.
Currently defines 150,000+ characters.

```
U+0041  →  A          (Latin)
U+4E16  →  世         (Chinese)
U+1F600 →  😀         (Emoji)
```

### UTF-8

The dominant encoding on the web (~98% of websites). **Variable-length**: uses 1–4 bytes
per character.

| Code Point Range   | Bytes | Example              |
|--------------------|-------|----------------------|
| U+0000 – U+007F   | 1     | A, z, 5 (ASCII)     |
| U+0080 – U+07FF   | 2     | é, ñ, ü             |
| U+0800 – U+FFFF   | 3     | 世, 界, ₹           |
| U+10000 – U+10FFFF| 4     | 😀, 🎉, 🇺🇸        |

### UTF-16 (JavaScript's Internal Encoding)

JavaScript strings use **UTF-16** internally. Characters outside the Basic Multilingual Plane
(BMP, U+0000 to U+FFFF) are stored as **surrogate pairs** — two 16-bit code units.

```typescript
// This is why emoji breaks .length
"A".length;      // 1 — single code unit
"😀".length;     // 2 — surrogate pair!
"🇺🇸".length;    // 4 — two surrogate pairs (flag = two regional indicators)

// Safe iteration
[..."😀"].length;          // 1
Array.from("🇺🇸").length;  // 2 (still two code points, but correct)

// String methods that work with code points
"😀".codePointAt(0);   // 128512 (correct)
"😀".charCodeAt(0);    // 55357 (just the first surrogate — wrong!)
```

### Frontend Impact

- **Form validation**: `.length` is unreliable for user input with emoji
- **String truncation**: Cutting at `.length / 2` can split a surrogate pair, creating
  invalid characters
- **API communication**: Ensure your server and client agree on encoding (almost always UTF-8)
- **`TextEncoder`/`TextDecoder`**: Web APIs for converting between strings and bytes

```typescript
const encoder = new TextEncoder();
const bytes = encoder.encode("Hello 😀");
console.log(bytes.length);  // 10 (5 ASCII bytes + 4 emoji bytes + 1 space)
```

---

## 6. Base64 Encoding

Base64 represents binary data using 64 ASCII characters (A–Z, a–z, 0–9, +, /). It encodes
every 3 bytes as 4 characters, resulting in ~33% size increase.

### Why Base64 Exists

Binary data (images, files) can't safely travel through text-only channels (email, JSON, URLs).
Base64 converts binary to safe ASCII text.

### Frontend Uses

**Data URIs** — embed small images directly in CSS/HTML:

```css
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...);
```

**JWT Payloads** — JSON Web Tokens are three Base64URL-encoded segments:

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiJ9.signature
        header              payload
```

```typescript
// Decode JWT payload
const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiJ9.xxx";
const payload = JSON.parse(atob(jwt.split(".")[1]));
// { user: "john" }
```

**API File Uploads** — when `multipart/form-data` isn't available:

```typescript
const reader = new FileReader();
reader.onload = () => {
  const base64 = (reader.result as string).split(",")[1];
  fetch("/api/upload", {
    method: "POST",
    body: JSON.stringify({ file: base64 }),
  });
};
reader.readAsDataURL(file);
```

### Base64 in JavaScript

```typescript
// String → Base64
btoa("Hello");          // "SGVsbG8="

// Base64 → String
atob("SGVsbG8=");       // "Hello"

// For Unicode strings (btoa only handles Latin1)
btoa(unescape(encodeURIComponent("Hello 😀")));
// Or better, use TextEncoder:
const bytes = new TextEncoder().encode("Hello 😀");
const base64 = btoa(String.fromCharCode(...bytes));
```

### Base64URL

A URL-safe variant replacing `+` with `-` and `/` with `_`, and removing `=` padding.
Used in JWTs and data URIs with URL contexts.

---

## 7. Floating Point Numbers (IEEE 754)

### The Problem

JavaScript's `Number` type is a 64-bit double-precision floating-point number (IEEE 754).
It stores numbers in scientific notation in binary:

```
(-1)^sign × 1.mantissa × 2^exponent
```

64 bits = 1 sign bit + 11 exponent bits + 52 mantissa bits.

### Why 0.1 + 0.2 !== 0.3

The decimal `0.1` cannot be represented exactly in binary, just as `1/3` cannot be
represented exactly in decimal. The stored value is approximately:

```
0.1 → 0.1000000000000000055511151231257827021181583404541015625
0.2 → 0.200000000000000011102230246251565404236316680908203125

0.1 + 0.2 → 0.30000000000000004
```

```typescript
0.1 + 0.2 === 0.3;           // false
0.1 + 0.2;                    // 0.30000000000000004

// The fix: compare with epsilon
Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON;  // true
```

### Safe Integers

The mantissa is 52 bits, so integers up to 2^53 - 1 can be represented exactly:

```typescript
Number.MAX_SAFE_INTEGER;  // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER;  // -9007199254740991

// Beyond this, precision is lost
9007199254740992 === 9007199254740993;  // true! Both are the same float

// Use BigInt for large integers
const big = 9007199254740993n;  // exact
```

### Frontend Impact

- **Currency calculations**: Never use `Number` for money. Use integers (cents) or libraries.
- **API responses**: JSON numbers that exceed `MAX_SAFE_INTEGER` (like Twitter snowflake IDs)
  lose precision. APIs send them as strings for this reason.
- **Pixel calculations**: Subpixel rendering works with floats, but be aware of accumulation
  errors in animations.

```typescript
// Bad: price calculation with floats
0.1 + 0.2;  // 0.30000000000000004

// Good: use integer cents
10 + 20;  // 30 cents = $0.30
```

---

## 8. Bitwise Operators in JavaScript

JavaScript bitwise operators convert numbers to **32-bit signed integers**, perform the
operation, then convert back. This truncation is intentional and useful.

### Operators

| Operator | Name        | Example         | Result |
|----------|-------------|-----------------|--------|
| `&`      | AND         | `0b1100 & 0b1010`  | `0b1000` (8) |
| `\|`     | OR          | `0b1100 \| 0b1010` | `0b1110` (14) |
| `^`      | XOR         | `0b1100 ^ 0b1010`  | `0b0110` (6) |
| `~`      | NOT         | `~0b0000 0101`      | `-(5+1)` = -6 |
| `<<`     | Left shift  | `1 << 3`            | `8` |
| `>>`     | Right shift | `16 >> 2`           | `4` |
| `>>>`    | Unsigned right shift | `-1 >>> 0`  | `4294967295` |

### How They Work (Bit by Bit)

```
AND (&): Both bits must be 1
  1100
& 1010
------
  1000

OR (|): Either bit must be 1
  1100
| 1010
------
  1110

XOR (^): Bits must differ
  1100
^ 1010
------
  0110
```

### Important: 32-Bit Truncation

```typescript
// Bitwise ops convert to 32-bit int
2.9 | 0;           // 2 (truncates decimal — faster than Math.floor for positives)
-2.9 | 0;          // -2 (not the same as Math.floor(-2.9) which is -3!)
```

---

## 9. Practical Bitwise Applications

### Feature Flags / Permissions

Store multiple boolean flags in a single number. Extremely memory-efficient and fast.

```typescript
const READ    = 1 << 0;  // 0001 = 1
const WRITE   = 1 << 1;  // 0010 = 2
const EXECUTE = 1 << 2;  // 0100 = 4
const ADMIN   = 1 << 3;  // 1000 = 8

// Combine permissions
const userPerms = READ | WRITE;        // 0011 = 3

// Check permission
const canRead = (userPerms & READ) !== 0;    // true
const canExec = (userPerms & EXECUTE) !== 0; // false

// Add permission
const upgraded = userPerms | EXECUTE;  // 0111 = 7

// Remove permission
const downgraded = upgraded & ~WRITE;  // 0101 = 5

// Toggle permission
const toggled = userPerms ^ WRITE;     // 0001 = 1
```

### Color Manipulation

CSS hex colors are just numbers. Bitwise operations extract and manipulate channels:

```typescript
const color = 0xFF6633;

// Extract channels
const r = (color >> 16) & 0xFF;  // 255
const g = (color >> 8) & 0xFF;   // 102
const b = color & 0xFF;           // 51

// Combine channels
const newColor = (r << 16) | (g << 8) | b;

// Darken by 50% (shift each channel right by 1)
const dark = ((color >> 1) & 0x7F7F7F);

// Invert
const inverted = color ^ 0xFFFFFF;
```

### Performance Tricks

```typescript
// Fast integer check
function isInteger(n: number): boolean {
  return (n | 0) === n;
}

// Fast multiply/divide by powers of 2
const doubled = 5 << 1;   // 10
const halved = 10 >> 1;    // 5

// Swap without temp variable
let a = 5, b = 3;
a ^= b; b ^= a; a ^= b;  // a=3, b=5
```

---

## 10. ArrayBuffer and TypedArrays

### Why They Exist

JavaScript strings and arrays are high-level abstractions. When working with binary data
(files, network protocols, WebGL, audio), you need raw byte access. `ArrayBuffer` provides
a fixed-length block of raw memory.

### Core API

```typescript
// Allocate 16 bytes of raw memory
const buffer = new ArrayBuffer(16);

// Create views to read/write the data
const uint8 = new Uint8Array(buffer);       // 16 elements, 1 byte each
const uint16 = new Uint16Array(buffer);     // 8 elements, 2 bytes each
const float32 = new Float32Array(buffer);   // 4 elements, 4 bytes each

// All views share the same underlying buffer
uint8[0] = 0xFF;
uint8[1] = 0x00;
console.log(uint16[0]);  // 255 (little-endian: 0x00FF)
```

### TypedArray Types

| Type             | Bytes | Range                          | Use Case                |
|------------------|-------|--------------------------------|-------------------------|
| `Uint8Array`     | 1     | 0 to 255                      | Raw bytes, image pixels |
| `Uint8ClampedArray`| 1   | 0 to 255 (clamped)            | Canvas `ImageData`      |
| `Int16Array`     | 2     | -32768 to 32767               | Audio samples           |
| `Uint32Array`    | 4     | 0 to 4294967295               | Large indices           |
| `Float32Array`   | 4     | ±3.4 × 10^38                  | WebGL vertices          |
| `Float64Array`   | 8     | ±1.8 × 10^308                 | Scientific computing    |

### Frontend Uses

**Canvas pixel manipulation:**

```typescript
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const pixels = imageData.data;  // Uint8ClampedArray — [R,G,B,A, R,G,B,A, ...]

// Invert all colors
for (let i = 0; i < pixels.length; i += 4) {
  pixels[i]     = 255 - pixels[i];     // R
  pixels[i + 1] = 255 - pixels[i + 1]; // G
  pixels[i + 2] = 255 - pixels[i + 2]; // B
  // pixels[i + 3] is alpha — leave it
}
ctx.putImageData(imageData, 0, 0);
```

**Fetch binary data:**

```typescript
const response = await fetch("/image.png");
const buffer = await response.arrayBuffer();
const bytes = new Uint8Array(buffer);

// Check PNG magic bytes
const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50;
```

**WebSocket binary frames:**

```typescript
const ws = new WebSocket("wss://example.com");
ws.binaryType = "arraybuffer";
ws.onmessage = (event) => {
  const data = new DataView(event.data);
  const messageType = data.getUint8(0);
  const payload = data.getFloat64(1);
};
```

**DataView** provides fine-grained control over byte order (endianness):

```typescript
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

view.setUint16(0, 0xFF00, false);  // big-endian
view.setUint16(0, 0xFF00, true);   // little-endian

// DataView is essential when parsing binary protocols
// that specify a particular byte order
```

---

## Key Takeaways

1. **Binary is the foundation** — everything in computing reduces to 0s and 1s.
2. **Hex is just compact binary** — each hex digit = 4 bits. You see it in colors, memory,
   and Unicode.
3. **UTF-16 causes JavaScript string quirks** — emoji `.length` is 2, not 1. Use
   `Array.from()` or the spread operator for safe iteration.
4. **Base64 is for transport, not encryption** — it makes binary safe for text channels
   at a 33% size cost.
5. **IEEE 754 means floating-point imprecision** — use `Number.EPSILON` for comparisons,
   integer cents for money.
6. **Bitwise operators are powerful** — feature flags, color manipulation, and fast integer
   operations.
7. **TypedArrays give raw byte access** — essential for Canvas, WebGL, audio, and binary
   protocols.

---

## Further Reading

- [MDN: Bitwise Operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
- [MDN: TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
- [The Absolute Minimum Every Developer Must Know About Unicode](https://tonsky.me/blog/unicode/)
- [IEEE 754 Visualization](https://float.exposed)
- [Base64 RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648)
