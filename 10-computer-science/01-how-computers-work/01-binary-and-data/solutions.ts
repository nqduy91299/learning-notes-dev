// ============================================================================
// Binary & Data Representation — Solutions
// Config: ES2022, strict, ESNext modules. Run with `npx tsx solutions.ts`
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ---------------------------------------------------------------------------
// EXERCISE 1: Binary to Decimal Converter
// ---------------------------------------------------------------------------
section("Exercise 1: binaryToDecimal");

function binaryToDecimal(binary: string): number {
  let result = 0;
  for (let i = 0; i < binary.length; i++) {
    const bit = binary[binary.length - 1 - i];
    if (bit === "1") {
      result += 2 ** i;
    }
  }
  return result;
}

assert(binaryToDecimal("0") === 0, "0 → 0");
assert(binaryToDecimal("1") === 1, "1 → 1");
assert(binaryToDecimal("1101") === 13, "1101 → 13");
assert(binaryToDecimal("11111111") === 255, "11111111 → 255");
assert(binaryToDecimal("10000000") === 128, "10000000 → 128");

// ---------------------------------------------------------------------------
// EXERCISE 2: Decimal to Binary Converter
// ---------------------------------------------------------------------------
section("Exercise 2: decimalToBinary");

function decimalToBinary(decimal: number): string {
  if (decimal === 0) return "0";
  let result = "";
  let n = decimal;
  while (n > 0) {
    result = (n % 2).toString() + result;
    n = Math.floor(n / 2);
  }
  return result;
}

assert(decimalToBinary(0) === "0", "0 → '0'");
assert(decimalToBinary(1) === "1", "1 → '1'");
assert(decimalToBinary(13) === "1101", "13 → '1101'");
assert(decimalToBinary(255) === "11111111", "255 → '11111111'");
assert(decimalToBinary(256) === "100000000", "256 → '100000000'");

// ---------------------------------------------------------------------------
// EXERCISE 3: Hex to RGB Converter
// ---------------------------------------------------------------------------
section("Exercise 3: hexToRgb");

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace(/^#/, "");
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

const red = hexToRgb("#FF0000");
assert(red.r === 255 && red.g === 0 && red.b === 0, "#FF0000 → 255,0,0");
const mixed = hexToRgb("336699");
assert(mixed.r === 51 && mixed.g === 102 && mixed.b === 153, "336699 → 51,102,153");
const lower = hexToRgb("#ff6633");
assert(lower.r === 255 && lower.g === 102 && lower.b === 51, "#ff6633 → 255,102,51");

// ---------------------------------------------------------------------------
// EXERCISE 4: RGB to Hex Converter
// ---------------------------------------------------------------------------
section("Exercise 4: rgbToHex");

function rgbToHex(r: number, g: number, b: number): string {
  const hex = ((r << 16) | (g << 8) | b).toString(16).toUpperCase().padStart(6, "0");
  return "#" + hex;
}

assert(rgbToHex(255, 0, 0) === "#FF0000", "255,0,0 → #FF0000");
assert(rgbToHex(51, 102, 153) === "#336699", "51,102,153 → #336699");
assert(rgbToHex(0, 0, 0) === "#000000", "0,0,0 → #000000");
assert(rgbToHex(255, 255, 255) === "#FFFFFF", "255,255,255 → #FFFFFF");

// ---------------------------------------------------------------------------
// EXERCISE 5: Floating Point Quirks (Predictions)
// ---------------------------------------------------------------------------
section("Exercise 5: Float predictions");

// 5a: false — 0.1 + 0.2 is 0.30000000000000004
assert((0.1 + 0.2 === 0.3) === false, "0.1+0.2 === 0.3 is false");
// 5b: 0.30000000000000004
assert(0.1 + 0.2 === 0.30000000000000004, "0.1+0.2 value");
// 5c: 10000000000000000 (rounds up because 16 nines exceed safe integer)
assert(9999999999999999 === 10000000000000000, "sixteen 9s rounds up");
// 5d: true — both overflow the same way
assert((Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2) === true, "MAX_SAFE+1 === MAX_SAFE+2");
// 5e: 0.30000000000000004 — same issue
assert(0.1 * 3 === 0.30000000000000004, "0.1*3 value");
// 5f: false
assert((0.1 * 3 === 0.3) === false, "0.1*3 === 0.3 is false");

// ---------------------------------------------------------------------------
// EXERCISE 6: Bitwise Operators (Predictions)
// ---------------------------------------------------------------------------
section("Exercise 6: Bitwise predictions");

// 5 = 0101, 3 = 0011
assert((5 & 3) === 1, "5 & 3 = 1 (0001)");
assert((5 | 3) === 7, "5 | 3 = 7 (0111)");
assert((5 ^ 3) === 6, "5 ^ 3 = 6 (0110)");
assert((~5) === -6, "~5 = -6");
assert((1 << 4) === 16, "1 << 4 = 16");
assert((16 >> 2) === 4, "16 >> 2 = 4");

// ---------------------------------------------------------------------------
// EXERCISE 7: String Lengths (Predictions)
// ---------------------------------------------------------------------------
section("Exercise 7: String length predictions");

assert("Hello".length === 5, "'Hello'.length = 5");
assert("😀".length === 2, "'😀'.length = 2 (surrogate pair)");
assert("🇺🇸".length === 4, "'🇺🇸'.length = 4 (two surrogate pairs)");
assert("café".length === 4, "'café'.length = 4");
assert([..."😀"].length === 1, "[...'😀'].length = 1");

// ---------------------------------------------------------------------------
// EXERCISE 8: Base64 Encoder
// ---------------------------------------------------------------------------
section("Exercise 8: base64Encode");

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64Encode(input: string): string {
  if (input.length === 0) return "";

  let result = "";
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    bytes.push(input.charCodeAt(i));
  }

  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triplet = (b0 << 16) | (b1 << 8) | b2;

    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += i + 1 < bytes.length ? BASE64_CHARS[(triplet >> 6) & 0x3f] : "=";
    result += i + 2 < bytes.length ? BASE64_CHARS[triplet & 0x3f] : "=";
  }

  return result;
}

assert(base64Encode("") === "", "empty → empty");
assert(base64Encode("A") === "QQ==", "A → QQ==");
assert(base64Encode("AB") === "QUI=", "AB → QUI=");
assert(base64Encode("ABC") === "QUJD", "ABC → QUJD");
assert(base64Encode("Hello") === "SGVsbG8=", "Hello → SGVsbG8=");
assert(base64Encode("Man") === "TWFu", "Man → TWFu");

// ---------------------------------------------------------------------------
// EXERCISE 9: Base64 Decoder
// ---------------------------------------------------------------------------
section("Exercise 9: base64Decode");

function base64Decode(encoded: string): string {
  if (encoded.length === 0) return "";

  let result = "";
  const stripped = encoded.replace(/=+$/, "");

  const lookup: Record<string, number> = {};
  for (let i = 0; i < BASE64_CHARS.length; i++) {
    lookup[BASE64_CHARS[i]] = i;
  }

  for (let i = 0; i < stripped.length; i += 4) {
    const s0 = lookup[stripped[i]] ?? 0;
    const s1 = lookup[stripped[i + 1]] ?? 0;
    const s2 = i + 2 < stripped.length ? lookup[stripped[i + 2]] ?? 0 : 0;
    const s3 = i + 3 < stripped.length ? lookup[stripped[i + 3]] ?? 0 : 0;

    const triplet = (s0 << 18) | (s1 << 12) | (s2 << 6) | s3;

    result += String.fromCharCode((triplet >> 16) & 0xff);
    if (i + 2 < stripped.length) {
      result += String.fromCharCode((triplet >> 8) & 0xff);
    }
    if (i + 3 < stripped.length) {
      result += String.fromCharCode(triplet & 0xff);
    }
  }

  return result;
}

assert(base64Decode("") === "", "empty → empty");
assert(base64Decode("QQ==") === "A", "QQ== → A");
assert(base64Decode("QUI=") === "AB", "QUI= → AB");
assert(base64Decode("QUJD") === "ABC", "QUJD → ABC");
assert(base64Decode("SGVsbG8=") === "Hello", "SGVsbG8= → Hello");
assert(base64Decode("TWFu") === "Man", "TWFu → Man");

// ---------------------------------------------------------------------------
// EXERCISE 10: Bitwise Feature Flags
// ---------------------------------------------------------------------------
section("Exercise 10: Feature Flags");

const Features = {
  DARK_MODE: 1 << 0,
  NOTIFICATIONS: 1 << 1,
  BETA_UI: 1 << 2,
  ANALYTICS: 1 << 3,
  PREMIUM: 1 << 4,
} as const;

type FeatureName = keyof typeof Features;

function hasFeature(flags: number, feature: number): boolean {
  return (flags & feature) !== 0;
}

function addFeature(flags: number, feature: number): number {
  return flags | feature;
}

function removeFeature(flags: number, feature: number): number {
  return flags & ~feature;
}

function toggleFeature(flags: number, feature: number): number {
  return flags ^ feature;
}

function listFeatures(flags: number): FeatureName[] {
  const result: FeatureName[] = [];
  for (const [name, value] of Object.entries(Features)) {
    if ((flags & value) !== 0) {
      result.push(name as FeatureName);
    }
  }
  return result;
}

let flags = 0;
flags = addFeature(flags, Features.DARK_MODE);
flags = addFeature(flags, Features.BETA_UI);
assert(hasFeature(flags, Features.DARK_MODE) === true, "has DARK_MODE");
assert(hasFeature(flags, Features.NOTIFICATIONS) === false, "no NOTIFICATIONS");
assert(hasFeature(flags, Features.BETA_UI) === true, "has BETA_UI");
flags = removeFeature(flags, Features.DARK_MODE);
assert(hasFeature(flags, Features.DARK_MODE) === false, "removed DARK_MODE");
flags = toggleFeature(flags, Features.PREMIUM);
assert(hasFeature(flags, Features.PREMIUM) === true, "toggled PREMIUM on");
flags = toggleFeature(flags, Features.PREMIUM);
assert(hasFeature(flags, Features.PREMIUM) === false, "toggled PREMIUM off");
const active = listFeatures(addFeature(addFeature(0, Features.DARK_MODE), Features.ANALYTICS));
assert(active.includes("DARK_MODE") && active.includes("ANALYTICS") && active.length === 2, "listFeatures");

// ---------------------------------------------------------------------------
// EXERCISE 11: Color Manipulation with Bitwise
// ---------------------------------------------------------------------------
section("Exercise 11: Color Manipulation");

function extractChannels(color: number): RGB {
  return {
    r: (color >> 16) & 0xff,
    g: (color >> 8) & 0xff,
    b: color & 0xff,
  };
}

function combineChannels(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

function invertColor(color: number): number {
  return color ^ 0xffffff;
}

function blendColors(color1: number, color2: number): number {
  const r = (((color1 >> 16) & 0xff) + ((color2 >> 16) & 0xff)) >> 1;
  const g = (((color1 >> 8) & 0xff) + ((color2 >> 8) & 0xff)) >> 1;
  const b = ((color1 & 0xff) + (color2 & 0xff)) >> 1;
  return combineChannels(r, g, b);
}

const c = extractChannels(0xff6633);
assert(c.r === 255 && c.g === 102 && c.b === 51, "extract 0xFF6633");
assert(combineChannels(255, 102, 51) === 0xff6633, "combine 255,102,51");
assert(invertColor(0xff0000) === 0x00ffff, "invert red → cyan");
assert(invertColor(0x000000) === 0xffffff, "invert black → white");
assert(blendColors(0xff0000, 0x0000ff) === combineChannels(127, 0, 127), "blend red+blue");

// ---------------------------------------------------------------------------
// EXERCISE 12: typeof and Encoding (Predictions)
// ---------------------------------------------------------------------------
section("Exercise 12: typeof/NaN predictions");

assert(typeof NaN === "number", "typeof NaN is 'number'");
assert((NaN === NaN) === false, "NaN !== NaN");
assert(Number.isNaN("hello") === false, "Number.isNaN('hello') is false");
assert(isNaN("hello" as unknown as number) === true, "isNaN('hello') is true (coerces)");
assert((0.1 + 0.2 - 0.3 < Number.EPSILON) === true, "0.1+0.2-0.3 < EPSILON");

// ---------------------------------------------------------------------------
// EXERCISE 13: Fixed Unicode String Truncation
// ---------------------------------------------------------------------------
section("Exercise 13: Unicode truncation fix");

function truncateString(str: string, maxLength: number): string {
  const chars = Array.from(str);
  if (chars.length <= maxLength) {
    return str;
  }
  return chars.slice(0, maxLength).join("") + "...";
}

assert(truncateString("hello", 10) === "hello", "no truncation needed");
assert(truncateString("hello world", 5) === "hello...", "basic truncation");
assert(truncateString("😀hello", 3) === "😀he...", "emoji + ascii truncation");
assert(truncateString("😀😀😀", 2) === "😀😀...", "emoji-only truncation");

// ---------------------------------------------------------------------------
// EXERCISE 14: Fixed Float Comparison
// ---------------------------------------------------------------------------
section("Exercise 14: Float calculation fix");

function calculateTotal(prices: number[]): number {
  // Fix: work in integer cents, then convert back
  const totalCents = prices.reduce((sum, price) => sum + Math.round(price * 100), 0);
  return totalCents / 100;
}

assert(calculateTotal([0.1, 0.2]) === 0.3, "0.1 + 0.2 = 0.3");
assert(calculateTotal([19.99, 5.99, 3.99]) === 29.97, "19.99+5.99+3.99 = 29.97");
assert(calculateTotal([]) === 0, "empty = 0");
assert(calculateTotal([1.01, 2.02, 3.03]) === 6.06, "1.01+2.02+3.03 = 6.06");

// ---------------------------------------------------------------------------
// EXERCISE 15: Fixed Hex Color Parser
// ---------------------------------------------------------------------------
section("Exercise 15: Hex color parser fix");

function parseHexColor(hex: string): string {
  const h = hex.replace(/^#/, "");
  if (h.length === 3) {
    return "#" + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return "#" + h.toUpperCase();
}

assert(parseHexColor("#F00") === "#FF0000", "#F00 → #FF0000");
assert(parseHexColor("F00") === "#FF0000", "F00 → #FF0000");
assert(parseHexColor("#ABC") === "#AABBCC", "#ABC → #AABBCC");
assert(parseHexColor("#FF0000") === "#FF0000", "#FF0000 unchanged");
assert(parseHexColor("aabbcc") === "#AABBCC", "aabbcc → #AABBCC");

// ---------------------------------------------------------------------------
// EXERCISE 16: Bitwise Truncation (Predictions)
// ---------------------------------------------------------------------------
section("Exercise 16: Bitwise truncation predictions");

assert((3.7 | 0) === 3, "3.7 | 0 = 3");
assert((-3.7 | 0) === -3, "-3.7 | 0 = -3 (truncates toward zero)");
assert(Math.floor(-3.7) === -4, "Math.floor(-3.7) = -4");
assert((2147483648 | 0) === -2147483648, "2^31 | 0 overflows to -2^31");
assert((-1 >>> 0) === 4294967295, "-1 >>> 0 = 2^32 - 1");

// ---------------------------------------------------------------------------
// EXERCISE 17: Fixed JWT Decoder
// ---------------------------------------------------------------------------
section("Exercise 17: JWT decoder fix");

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split(".");
  let payload = parts[1];
  // Fix: convert Base64URL to standard Base64
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  // Fix: restore padding
  while (payload.length % 4 !== 0) {
    payload += "=";
  }
  const decoded = atob(payload);
  return JSON.parse(decoded);
}

const testJwt =
  "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.";
const decoded = decodeJwtPayload(testJwt);
assert(decoded.sub === "1234567890", "JWT sub field");
assert(decoded.name === "John", "JWT name field");

// ---------------------------------------------------------------------------
// EXERCISE 18: TypedArray Operations
// ---------------------------------------------------------------------------
section("Exercise 18: TypedArray operations");

function createClampedBytes(values: number[]): Uint8Array {
  const result = new Uint8Array(values.length);
  for (let i = 0; i < values.length; i++) {
    result[i] = Math.max(0, Math.min(255, Math.round(values[i])));
  }
  return result;
}

function xorChecksum(data: Uint8Array): number {
  let result = 0;
  for (const byte of data) {
    result ^= byte;
  }
  return result;
}

function isPng(data: Uint8Array): boolean {
  return (
    data.length >= 4 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  );
}

function concatBuffers(a: Uint8Array, b: Uint8Array): Uint8Array {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

const clamped = createClampedBytes([0, 128, 255, 300, -10]);
assert(clamped[0] === 0 && clamped[1] === 128 && clamped[2] === 255, "clamped 0,128,255");
assert(clamped[3] === 255 && clamped[4] === 0, "clamped 300→255, -10→0");

assert(xorChecksum(new Uint8Array([0xff, 0xff])) === 0, "XOR FF,FF = 0");
assert(xorChecksum(new Uint8Array([0x01, 0x02, 0x03])) === 0, "XOR 1,2,3 = 0");

const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
assert(isPng(pngHeader) === true, "valid PNG header");
assert(isPng(new Uint8Array([0x00, 0x50, 0x4e, 0x47])) === false, "invalid PNG header");

const arrA = new Uint8Array([1, 2]);
const arrB = new Uint8Array([3, 4, 5]);
const concatenated = concatBuffers(arrA, arrB);
assert(concatenated.length === 5 && concatenated[0] === 1 && concatenated[4] === 5, "concat buffers");

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`========================================`);
if (failed > 0) process.exit(1);
