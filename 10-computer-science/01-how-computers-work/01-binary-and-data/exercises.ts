// ============================================================================
// Binary & Data Representation — Exercises
// Config: ES2022, strict, ESNext modules. Run with `npx tsx exercises.ts`
// 18 exercises: 6 predict, 4 fix, 8 implement
// ============================================================================

// ---------------------------------------------------------------------------
// EXERCISE 1 (Implement): Binary to Decimal Converter
// ---------------------------------------------------------------------------
// Convert a binary string (e.g., "1101") to its decimal number equivalent.
// Do NOT use parseInt — implement the algorithm manually.
// Hint: iterate from right to left, multiplying each bit by its positional power of 2.

function binaryToDecimal(binary: string): number {
  // YOUR CODE HERE
  return 0;
}

// Tests:
// console.assert(binaryToDecimal("0") === 0);
// console.assert(binaryToDecimal("1") === 1);
// console.assert(binaryToDecimal("1101") === 13);
// console.assert(binaryToDecimal("11111111") === 255);
// console.assert(binaryToDecimal("10000000") === 128);

// ---------------------------------------------------------------------------
// EXERCISE 2 (Implement): Decimal to Binary Converter
// ---------------------------------------------------------------------------
// Convert a non-negative decimal integer to its binary string representation.
// Do NOT use Number.toString(2) — implement the algorithm manually.

function decimalToBinary(decimal: number): string {
  // YOUR CODE HERE
  return "";
}

// Tests:
// console.assert(decimalToBinary(0) === "0");
// console.assert(decimalToBinary(1) === "1");
// console.assert(decimalToBinary(13) === "1101");
// console.assert(decimalToBinary(255) === "11111111");
// console.assert(decimalToBinary(256) === "100000000");

// ---------------------------------------------------------------------------
// EXERCISE 3 (Implement): Hex to RGB Converter
// ---------------------------------------------------------------------------
// Convert a hex color string (e.g., "#FF6633" or "FF6633") to an RGB object.
// Must handle both with and without the "#" prefix.
// Must handle both uppercase and lowercase hex digits.

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  // YOUR CODE HERE
  return { r: 0, g: 0, b: 0 };
}

// Tests:
// const red = hexToRgb("#FF0000");
// console.assert(red.r === 255 && red.g === 0 && red.b === 0);
// const mixed = hexToRgb("336699");
// console.assert(mixed.r === 51 && mixed.g === 102 && mixed.b === 153);
// const lower = hexToRgb("#ff6633");
// console.assert(lower.r === 255 && lower.g === 102 && lower.b === 51);

// ---------------------------------------------------------------------------
// EXERCISE 4 (Implement): RGB to Hex Converter
// ---------------------------------------------------------------------------
// Convert an RGB object to a hex color string with "#" prefix.
// Each channel value is 0–255. Output must be uppercase, 6 digits.

function rgbToHex(r: number, g: number, b: number): string {
  // YOUR CODE HERE
  return "";
}

// Tests:
// console.assert(rgbToHex(255, 0, 0) === "#FF0000");
// console.assert(rgbToHex(51, 102, 153) === "#336699");
// console.assert(rgbToHex(0, 0, 0) === "#000000");
// console.assert(rgbToHex(255, 255, 255) === "#FFFFFF");

// ---------------------------------------------------------------------------
// EXERCISE 5 (Predict): Floating Point Quirks
// ---------------------------------------------------------------------------
// WITHOUT running the code, predict the output of each expression.
// Write your predictions as comments, then uncomment the console.logs to verify.

// Prediction 1: 0.1 + 0.2 === 0.3 → ???
// console.log("5a:", 0.1 + 0.2 === 0.3);

// Prediction 2: 0.1 + 0.2 → ???
// console.log("5b:", 0.1 + 0.2);

// Prediction 3: 9999999999999999 → ??? (sixteen 9s)
// console.log("5c:", 9999999999999999);

// Prediction 4: Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2 → ???
// console.log("5d:", Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);

// Prediction 5: 0.1 * 3 === 0.3 → ??? (hint: not the same as 0.1+0.1+0.1)
// console.log("5e:", 0.1 * 3);
// console.log("5f:", 0.1 * 3 === 0.3);

// ---------------------------------------------------------------------------
// EXERCISE 6 (Predict): Bitwise Operators
// ---------------------------------------------------------------------------
// Predict the result of each expression WITHOUT running the code.

// Prediction 1: 5 & 3 → ???
// console.log("6a:", 5 & 3);

// Prediction 2: 5 | 3 → ???
// console.log("6b:", 5 | 3);

// Prediction 3: 5 ^ 3 → ???
// console.log("6c:", 5 ^ 3);

// Prediction 4: ~5 → ???
// console.log("6d:", ~5);

// Prediction 5: 1 << 4 → ???
// console.log("6e:", 1 << 4);

// Prediction 6: 16 >> 2 → ???
// console.log("6f:", 16 >> 2);

// ---------------------------------------------------------------------------
// EXERCISE 7 (Predict): String Lengths with Unicode
// ---------------------------------------------------------------------------
// Predict the .length of each string WITHOUT running the code.

// Prediction 1: "Hello".length → ???
// console.log("7a:", "Hello".length);

// Prediction 2: "😀".length → ???
// console.log("7b:", "😀".length);

// Prediction 3: "🇺🇸".length → ???
// console.log("7c:", "🇺🇸".length);

// Prediction 4: "café".length → ???
// console.log("7d:", "café".length);

// Prediction 5: [...\"😀\"].length → ???
// console.log("7e:", [..."😀"].length);

// ---------------------------------------------------------------------------
// EXERCISE 8 (Implement): Base64 Encoder
// ---------------------------------------------------------------------------
// Implement a Base64 encoder for ASCII strings (no Unicode required).
// The Base64 alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
// Padding character: =
//
// Algorithm:
// 1. Convert each character to its ASCII code (8-bit byte)
// 2. Group bytes into chunks of 3 (24 bits)
// 3. Split each 24-bit chunk into four 6-bit values
// 4. Map each 6-bit value to the Base64 alphabet
// 5. Pad with = if the input length isn't divisible by 3

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64Encode(input: string): string {
  // YOUR CODE HERE
  return "";
}

// Tests:
// console.assert(base64Encode("") === "");
// console.assert(base64Encode("A") === "QQ==");
// console.assert(base64Encode("AB") === "QUI=");
// console.assert(base64Encode("ABC") === "QUJD");
// console.assert(base64Encode("Hello") === "SGVsbG8=");
// console.assert(base64Encode("Man") === "TWFu");

// ---------------------------------------------------------------------------
// EXERCISE 9 (Implement): Base64 Decoder
// ---------------------------------------------------------------------------
// Implement a Base64 decoder that returns the original ASCII string.
// Reverse the encoding process from Exercise 8.

function base64Decode(encoded: string): string {
  // YOUR CODE HERE
  return "";
}

// Tests:
// console.assert(base64Decode("") === "");
// console.assert(base64Decode("QQ==") === "A");
// console.assert(base64Decode("QUI=") === "AB");
// console.assert(base64Decode("QUJD") === "ABC");
// console.assert(base64Decode("SGVsbG8=") === "Hello");
// console.assert(base64Decode("TWFu") === "Man");

// ---------------------------------------------------------------------------
// EXERCISE 10 (Implement): Bitwise Feature Flags
// ---------------------------------------------------------------------------
// Implement a feature flag system using bitwise operators.
// Each feature is a power of 2. The system should support:
// - hasFeature: check if a flag is set
// - addFeature: set a flag
// - removeFeature: unset a flag
// - toggleFeature: flip a flag
// - listFeatures: return array of feature names that are enabled

const Features = {
  DARK_MODE:    1 << 0,  // 1
  NOTIFICATIONS: 1 << 1, // 2
  BETA_UI:      1 << 2,  // 4
  ANALYTICS:    1 << 3,  // 8
  PREMIUM:      1 << 4,  // 16
} as const;

type FeatureName = keyof typeof Features;

function hasFeature(flags: number, feature: number): boolean {
  // YOUR CODE HERE
  return false;
}

function addFeature(flags: number, feature: number): number {
  // YOUR CODE HERE
  return 0;
}

function removeFeature(flags: number, feature: number): number {
  // YOUR CODE HERE
  return 0;
}

function toggleFeature(flags: number, feature: number): number {
  // YOUR CODE HERE
  return 0;
}

function listFeatures(flags: number): FeatureName[] {
  // YOUR CODE HERE
  return [];
}

// Tests:
// let flags = 0;
// flags = addFeature(flags, Features.DARK_MODE);
// flags = addFeature(flags, Features.BETA_UI);
// console.assert(hasFeature(flags, Features.DARK_MODE) === true);
// console.assert(hasFeature(flags, Features.NOTIFICATIONS) === false);
// console.assert(hasFeature(flags, Features.BETA_UI) === true);
// flags = removeFeature(flags, Features.DARK_MODE);
// console.assert(hasFeature(flags, Features.DARK_MODE) === false);
// flags = toggleFeature(flags, Features.PREMIUM);
// console.assert(hasFeature(flags, Features.PREMIUM) === true);
// flags = toggleFeature(flags, Features.PREMIUM);
// console.assert(hasFeature(flags, Features.PREMIUM) === false);
// const active = listFeatures(addFeature(addFeature(0, Features.DARK_MODE), Features.ANALYTICS));
// console.assert(active.includes("DARK_MODE") && active.includes("ANALYTICS") && active.length === 2);

// ---------------------------------------------------------------------------
// EXERCISE 11 (Implement): Color Manipulation with Bitwise
// ---------------------------------------------------------------------------
// Implement functions that manipulate hex colors using bitwise operators.

// Extract red, green, blue channels from a 24-bit color number
function extractChannels(color: number): RGB {
  // YOUR CODE HERE (use >> and & 0xFF)
  return { r: 0, g: 0, b: 0 };
}

// Combine r, g, b channels (0–255 each) into a single 24-bit number
function combineChannels(r: number, g: number, b: number): number {
  // YOUR CODE HERE (use << and |)
  return 0;
}

// Invert a color (bitwise NOT, masked to 24 bits)
function invertColor(color: number): number {
  // YOUR CODE HERE
  return 0;
}

// Blend two colors by averaging each channel
function blendColors(color1: number, color2: number): number {
  // YOUR CODE HERE
  return 0;
}

// Tests:
// const c = extractChannels(0xFF6633);
// console.assert(c.r === 255 && c.g === 102 && c.b === 51);
// console.assert(combineChannels(255, 102, 51) === 0xFF6633);
// console.assert(invertColor(0xFF0000) === 0x00FFFF);
// console.assert(invertColor(0x000000) === 0xFFFFFF);
// console.assert(blendColors(0xFF0000, 0x0000FF) === combineChannels(127, 0, 127));

// ---------------------------------------------------------------------------
// EXERCISE 12 (Predict): typeof and Encoding
// ---------------------------------------------------------------------------
// Predict each output WITHOUT running the code.

// Prediction 1: typeof NaN → ???
// console.log("12a:", typeof NaN);

// Prediction 2: NaN === NaN → ???
// console.log("12b:", NaN === NaN);

// Prediction 3: Number.isNaN("hello") → ???
// console.log("12c:", Number.isNaN("hello"));

// Prediction 4: isNaN("hello") → ???
// console.log("12d:", isNaN("hello" as unknown as number));

// Prediction 5: 0.1 + 0.2 - 0.3 < Number.EPSILON → ???
// console.log("12e:", 0.1 + 0.2 - 0.3 < Number.EPSILON);

// ---------------------------------------------------------------------------
// EXERCISE 13 (Fix): Broken Unicode String Truncation
// ---------------------------------------------------------------------------
// This function is supposed to truncate a string to `maxLength` characters
// and add "..." if truncated. But it breaks emoji! Fix it.

function truncateString(str: string, maxLength: number): string {
  // BUG: This uses .length and .slice which count UTF-16 code units, not characters.
  // "😀hello" truncated to 3 chars should give "😀he..." not "😀..." or broken output.
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
}

// Tests (uncomment after fixing):
// console.assert(truncateString("hello", 10) === "hello");
// console.assert(truncateString("hello world", 5) === "hello...");
// console.assert(truncateString("😀hello", 3) === "😀he...");
// console.assert(truncateString("😀😀😀", 2) === "😀😀...");

// ---------------------------------------------------------------------------
// EXERCISE 14 (Fix): Broken Float Comparison
// ---------------------------------------------------------------------------
// This shopping cart total calculation gives wrong results due to float issues.
// Fix it so it works correctly. Do NOT use external libraries.

function calculateTotal(prices: number[]): number {
  // BUG: Floating point accumulation causes drift
  let total = 0;
  for (const price of prices) {
    total += price;
  }
  return total;
}

// Tests (uncomment after fixing):
// console.assert(calculateTotal([0.1, 0.2]) === 0.3);
// console.assert(calculateTotal([19.99, 5.99, 3.99]) === 29.97);
// console.assert(calculateTotal([]) === 0);
// console.assert(calculateTotal([1.01, 2.02, 3.03]) === 6.06);

// ---------------------------------------------------------------------------
// EXERCISE 15 (Fix): Broken Hex Color Parser
// ---------------------------------------------------------------------------
// This function should parse shorthand hex colors (#RGB → #RRGGBB) but has bugs.
// e.g., "#F00" → "#FF0000", "#ABC" → "#AABBCC"

function parseHexColor(hex: string): string {
  // BUG 1: Doesn't handle missing # prefix
  // BUG 2: Shorthand expansion is wrong
  const h = hex.replace("#", "");
  if (h.length === 3) {
    // This incorrectly doubles characters
    return "#" + h[0] + h[1] + h[2];
  }
  return "#" + h.toUpperCase();
}

// Tests (uncomment after fixing):
// console.assert(parseHexColor("#F00") === "#FF0000");
// console.assert(parseHexColor("F00") === "#FF0000");
// console.assert(parseHexColor("#ABC") === "#AABBCC");
// console.assert(parseHexColor("#FF0000") === "#FF0000");
// console.assert(parseHexColor("aabbcc") === "#AABBCC");

// ---------------------------------------------------------------------------
// EXERCISE 16 (Predict): Bitwise Truncation
// ---------------------------------------------------------------------------
// Predict the results of using bitwise OR for number truncation.

// Prediction 1: 3.7 | 0 → ???
// console.log("16a:", 3.7 | 0);

// Prediction 2: -3.7 | 0 → ???
// console.log("16b:", -3.7 | 0);

// Prediction 3: Math.floor(-3.7) → ???
// console.log("16c:", Math.floor(-3.7));

// Prediction 4: 2147483648 | 0 → ??? (this is 2^31, beyond 32-bit signed range)
// console.log("16d:", 2147483648 | 0);

// Prediction 5: -1 >>> 0 → ???
// console.log("16e:", -1 >>> 0);

// ---------------------------------------------------------------------------
// EXERCISE 17 (Fix): Broken Base64 JWT Decoder
// ---------------------------------------------------------------------------
// This function decodes a JWT payload but has bugs. Fix it.
// A JWT is: base64url(header).base64url(payload).signature
// Base64URL replaces + with -, / with _, and removes = padding.

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split(".");
  // BUG: Doesn't handle Base64URL encoding (- and _ characters)
  // BUG: Doesn't restore padding
  const payload = parts[1];
  const decoded = atob(payload);
  return JSON.parse(decoded);
}

// Test JWT (header: {"alg":"none"}, payload: {"sub":"1234567890","name":"John","iat":1516239022})
// const testJwt = "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.";
// const decoded = decodeJwtPayload(testJwt);
// console.assert(decoded.sub === "1234567890");
// console.assert(decoded.name === "John");

// ---------------------------------------------------------------------------
// EXERCISE 18 (Implement): TypedArray Operations
// ---------------------------------------------------------------------------
// Implement functions that work with TypedArrays to manipulate binary data.

// Create a Uint8Array from an array of numbers, clamping values to 0–255
function createClampedBytes(values: number[]): Uint8Array {
  // YOUR CODE HERE
  // Clamp: values < 0 become 0, values > 255 become 255
  return new Uint8Array(0);
}

// Compute the checksum of a Uint8Array (XOR all bytes together)
function xorChecksum(data: Uint8Array): number {
  // YOUR CODE HERE
  return 0;
}

// Check if a Uint8Array starts with the PNG magic bytes: [0x89, 0x50, 0x4E, 0x47]
function isPng(data: Uint8Array): boolean {
  // YOUR CODE HERE
  return false;
}

// Concatenate two Uint8Arrays into a new one
function concatBuffers(a: Uint8Array, b: Uint8Array): Uint8Array {
  // YOUR CODE HERE
  return new Uint8Array(0);
}

// Tests:
// const clamped = createClampedBytes([0, 128, 255, 300, -10]);
// console.assert(clamped[0] === 0 && clamped[1] === 128 && clamped[2] === 255);
// console.assert(clamped[3] === 255 && clamped[4] === 0);
//
// console.assert(xorChecksum(new Uint8Array([0xFF, 0xFF])) === 0);
// console.assert(xorChecksum(new Uint8Array([0x01, 0x02, 0x03])) === 0);
// Wait — 1 XOR 2 = 3, 3 XOR 3 = 0. Yes that's correct.
//
// const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]);
// console.assert(isPng(pngHeader) === true);
// console.assert(isPng(new Uint8Array([0x00, 0x50, 0x4E, 0x47])) === false);
//
// const a = new Uint8Array([1, 2]);
// const b = new Uint8Array([3, 4, 5]);
// const c = concatBuffers(a, b);
// console.assert(c.length === 5 && c[0] === 1 && c[4] === 5);

// ---------------------------------------------------------------------------
// Compile check — this file must compile with `npx tsx exercises.ts`
// ---------------------------------------------------------------------------
console.log("exercises.ts compiled successfully — uncomment tests to verify your solutions.");
