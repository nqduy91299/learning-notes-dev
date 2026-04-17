// ============================================================================
// HTTPS & Encryption — Solutions
// ============================================================================
// Run: npx tsx solutions.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

import {
  createHash,
  createHmac,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from "node:crypto";

// ============================================================================
// Exercise 1 (Implement): Caesar Cipher
// ============================================================================

function caesarEncrypt(plaintext: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26; // Normalize shift
  return plaintext
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + s) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + s) % 26) + 97);
      }
      return ch;
    })
    .join("");
}

function caesarDecrypt(ciphertext: string, shift: number): string {
  return caesarEncrypt(ciphertext, -shift);
}

// ============================================================================
// Exercise 2 (Implement): XOR Cipher
// ============================================================================

function xorCipher(input: string, key: string): string {
  const result: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const xored = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result.push(xored.toString(16).padStart(2, "0"));
  }
  return result.join("");
}

function xorDecrypt(hexInput: string, key: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < hexInput.length; i += 2) {
    bytes.push(parseInt(hexInput.slice(i, i + 2), 16));
  }
  return bytes
    .map((b, i) => String.fromCharCode(b ^ key.charCodeAt(i % key.length)))
    .join("");
}

// ============================================================================
// Exercise 3 (Implement): Simple Hash Function
// ============================================================================

function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash = hash * 33 + charCode (using unsigned 32-bit)
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// ============================================================================
// Exercise 4 (Implement): HMAC Implementation
// ============================================================================

function hmacManual(
  key: string,
  message: string,
  algorithm: string = "sha256"
): string {
  const blockSize = 64; // 64 bytes for SHA-256
  let keyBuffer = Buffer.from(key, "utf8");

  // If key > block size, hash it
  if (keyBuffer.length > blockSize) {
    keyBuffer = createHash(algorithm).update(keyBuffer).digest();
  }

  // Pad key to block size
  if (keyBuffer.length < blockSize) {
    keyBuffer = Buffer.concat([keyBuffer, Buffer.alloc(blockSize - keyBuffer.length, 0)]);
  }

  // Create ipad and opad
  const ipad = Buffer.alloc(blockSize);
  const opad = Buffer.alloc(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = keyBuffer[i] ^ 0x36;
    opad[i] = keyBuffer[i] ^ 0x5c;
  }

  // Inner hash: Hash(ipad || message)
  const innerHash = createHash(algorithm)
    .update(Buffer.concat([ipad, Buffer.from(message, "utf8")]))
    .digest();

  // Outer hash: Hash(opad || innerHash)
  const outerHash = createHash(algorithm)
    .update(Buffer.concat([opad, innerHash]))
    .digest("hex");

  return outerHash;
}

// ============================================================================
// Exercise 5 (Predict): TLS Handshake Steps
// ============================================================================

function exercise5(): {
  order: string[];
  explanation: Record<string, string>;
} {
  return {
    order: ["C", "E", "B", "F", "D", "A", "G"],
    explanation: {
      C: "ClientHello — Client initiates connection with supported cipher suites, TLS version, random number, and its key share for Diffie-Hellman.",
      E: "ServerHello — Server responds with chosen cipher suite, its random number, and its key share.",
      B: "Certificate + CertificateVerify — Server sends its X.509 certificate for identity proof and a signature over the handshake transcript to prove it owns the private key.",
      F: "Finished — Server sends a MAC over the entire handshake to confirm its view of the negotiation.",
      D: "Both sides derive session keys — Using the DH key shares, both compute the same shared secret and derive symmetric encryption keys.",
      A: "Client sends Finished — Client sends its MAC over the handshake, confirming the key exchange succeeded.",
      G: "Encrypted application data — All subsequent communication is encrypted with AES using the derived session keys.",
    },
  };
}

// ============================================================================
// Exercise 6 (Predict): Encryption Scenarios
// ============================================================================

function exercise6(): { a: string; b: string; c: string } {
  return {
    a: "Reusing the same IV (nonce) with the same key in AES-GCM is catastrophic. An attacker can XOR the two ciphertexts together to cancel out the keystream, revealing the XOR of the two plaintexts. This also breaks the authentication tag. The key must be considered compromised.",
    b: "The password is 'password'. SHA-256 of 'password' produces that exact hash. Rainbow tables contain precomputed hashes of common passwords, making lookups instant. This is why salting is essential — it makes rainbow tables useless.",
    c: "No, she cannot be sure. A plain hash provides integrity but not authentication. An attacker performing a MITM could modify the message AND recompute the hash. Since SHA-256 is public and requires no secret key, anyone can compute valid hashes. She needs HMAC (which requires a shared key) or a digital signature to verify both integrity and authenticity.",
  };
}

// ============================================================================
// Exercise 7 (Implement): Digital Signature Simulation
// ============================================================================

interface SignedMessage {
  message: string;
  signature: string;
  algorithm: string;
}

function sign(message: string, privateKey: string): SignedMessage {
  const signature = createHmac("sha256", privateKey).update(message).digest("hex");
  return { message, signature, algorithm: "HMAC-SHA256" };
}

function verify(signed: SignedMessage, publicKey: string): boolean {
  const expected = createHmac("sha256", publicKey).update(signed.message).digest("hex");
  // Use timing-safe comparison
  try {
    return timingSafeEqual(Buffer.from(signed.signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ============================================================================
// Exercise 8 (Implement): Node.js Crypto Hashing
// ============================================================================

interface HashResults {
  sha256: string;
  sha512: string;
  hmac: string;
  timingSafeEqual: boolean;
}

function cryptoHash(
  message: string,
  hmacKey: string,
  compareHash: string
): HashResults {
  const sha256 = createHash("sha256").update(message).digest("hex");
  const sha512 = createHash("sha512").update(message).digest("hex");
  const hmac = createHmac("sha256", hmacKey).update(message).digest("hex");

  let safeEqual = false;
  try {
    if (compareHash.length === sha256.length) {
      safeEqual = timingSafeEqual(
        Buffer.from(sha256, "hex"),
        Buffer.from(compareHash, "hex")
      );
    }
  } catch {
    safeEqual = false;
  }

  return { sha256, sha512, hmac, timingSafeEqual: safeEqual };
}

// ============================================================================
// Exercise 9 (Predict): Certificate Validation
// ============================================================================

function exercise9(): { a: string; b: string; c: string } {
  return {
    a: "Rejected — even though the chain of trust is valid (root CA → intermediate CA → server cert), the certificate has expired. Browsers reject expired certificates regardless of trust chain validity.",
    b: "Accepted — wildcard certificate *.example.com matches app.example.com. The certificate is valid and signed by a trusted CA. Note: wildcards only match one level (*.example.com matches app.example.com but NOT sub.app.example.com).",
    c: "Rejected with a warning — self-signed certificates are not trusted by default because there's no chain of trust to a known CA. The browser shows a security warning that the user can choose to bypass (but shouldn't in production).",
  };
}

// ============================================================================
// Exercise 10 (Fix): Insecure Encryption
// ============================================================================

interface EncryptionResult {
  ciphertext: string;
  iv: string;
  tag: string;
}

function encrypt(plaintext: string, key: Buffer): EncryptionResult {
  // Fix 1: Random IV for each encryption
  const iv = randomBytes(12); // 96 bits for AES-GCM

  // Fix 2: Use AES-256-GCM (authenticated encryption)
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");

  // Fix 3: Get the authentication tag
  const tag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext,
    iv: iv.toString("hex"),
    tag,
  };
}

function decrypt(encrypted: EncryptionResult, key: Buffer): string {
  const iv = Buffer.from(encrypted.iv, "hex");
  const tag = Buffer.from(encrypted.tag, "hex");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(encrypted.ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}

// ============================================================================
// Exercise 11 (Predict): Mixed Content and HSTS
// ============================================================================

function exercise11(): { a: string; b: string } {
  return {
    a: "The browser blocks the script. Loading a script over HTTP on an HTTPS page is 'active mixed content' which modern browsers block by default. The analytics script will not execute, and a mixed content error appears in the console.",
    b: "The browser automatically upgrades the request to HTTPS. Since HSTS was set on the first visit with a 1-year max-age, the browser remembers this policy. When the user types http://example.com, the browser internally redirects to https://example.com before making any network request.",
  };
}

// ============================================================================
// Exercise 12 (Implement): Diffie-Hellman Key Exchange Simulation
// ============================================================================

function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exp = exp / 2n;
    base = (base * base) % modulus;
  }
  return result;
}

interface DHKeyPair {
  privateKey: bigint;
  publicKey: bigint;
}

interface DHParams {
  p: bigint;
  g: bigint;
}

function generateDHKeyPair(params: DHParams): DHKeyPair {
  // Generate random private key: 2 <= privateKey <= p-2
  const maxVal = params.p - 2n;
  // For small numbers, use simple random
  const range = Number(maxVal) - 2;
  const privateKey = BigInt(Math.floor(Math.random() * range) + 2);
  const publicKey = modPow(params.g, privateKey, params.p);
  return { privateKey, publicKey };
}

function computeSharedSecret(
  theirPublicKey: bigint,
  myPrivateKey: bigint,
  p: bigint
): bigint {
  return modPow(theirPublicKey, myPrivateKey, p);
}

// ============================================================================
// Exercise 13 (Fix): Insecure Hash Comparison
// ============================================================================

function compareHashes(hash1: string, hash2: string): boolean {
  // Fix: Use timing-safe comparison
  try {
    const buf1 = Buffer.from(hash1, "hex");
    const buf2 = Buffer.from(hash2, "hex");
    if (buf1.length !== buf2.length) return false;
    return timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}

// ============================================================================
// Exercise 14 (Fix): Missing HTTPS Enforcement
// ============================================================================

interface Request {
  protocol: string;
  hostname: string;
  url: string;
  headers: Record<string, string>;
}

interface Response {
  statusCode: number;
  headers: Record<string, string>;
  redirectUrl?: string;
  body?: string;
}

function enforceHTTPS(req: Request): Response {
  // Check for proxy headers (behind load balancer)
  const isHTTPS =
    req.protocol === "https" ||
    req.headers["x-forwarded-proto"] === "https";

  if (!isHTTPS) {
    // Redirect HTTP to HTTPS
    return {
      statusCode: 301,
      headers: {
        Location: `https://${req.hostname}${req.url}`,
      },
      redirectUrl: `https://${req.hostname}${req.url}`,
    };
  }

  // Already HTTPS — set security headers
  return {
    statusCode: 200,
    headers: {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
    body: "OK",
  };
}

// ============================================================================
// Exercise 15 (Implement): Certificate Chain Validator
// ============================================================================

interface SimpleCert {
  subject: string;
  issuer: string;
  validFrom: number;
  validTo: number;
  isCA: boolean;
}

interface CertValidationResult {
  valid: boolean;
  reason: string;
  chain: string[];
}

function validateCertChain(
  chain: SimpleCert[],
  trustedRoots: string[],
  currentTime: number
): CertValidationResult {
  if (chain.length === 0) {
    return { valid: false, reason: "Empty certificate chain", chain: [] };
  }

  const subjects = chain.map((c) => c.subject);

  // Check each certificate's validity period
  for (const cert of chain) {
    if (currentTime < cert.validFrom) {
      return {
        valid: false,
        reason: `Certificate '${cert.subject}' is not yet valid`,
        chain: subjects,
      };
    }
    if (currentTime > cert.validTo) {
      return {
        valid: false,
        reason: `Certificate '${cert.subject}' has expired`,
        chain: subjects,
      };
    }
  }

  // Check chain linkage: each cert's issuer must match the next cert's subject
  for (let i = 0; i < chain.length - 1; i++) {
    if (chain[i].issuer !== chain[i + 1].subject) {
      return {
        valid: false,
        reason: `Chain broken: '${chain[i].subject}' issued by '${chain[i].issuer}' but next cert is '${chain[i + 1].subject}'`,
        chain: subjects,
      };
    }
    // Intermediate certs must be CAs
    if (i + 1 < chain.length - 1 && !chain[i + 1].isCA) {
      return {
        valid: false,
        reason: `Intermediate '${chain[i + 1].subject}' is not a CA`,
        chain: subjects,
      };
    }
  }

  // Check that the root (last cert) is in the trusted store
  const root = chain[chain.length - 1];
  if (!trustedRoots.includes(root.subject)) {
    return {
      valid: false,
      reason: `Root '${root.subject}' is not in the trusted store`,
      chain: subjects,
    };
  }

  // Root should be self-signed
  if (root.issuer !== root.subject) {
    return {
      valid: false,
      reason: `Root '${root.subject}' is not self-signed (issuer: '${root.issuer}')`,
      chain: subjects,
    };
  }

  return {
    valid: true,
    reason: "Certificate chain is valid",
    chain: subjects,
  };
}

// ============================================================================
// Runner
// ============================================================================

function runTests(): void {
  console.log("=".repeat(70));
  console.log("HTTPS & Encryption — Solutions");
  console.log("=".repeat(70));

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string): void {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}`);
      failed++;
    }
  }

  // Exercise 1
  console.log("\nExercise 1: Caesar Cipher");
  assert(caesarEncrypt("Hello, World!", 3) === "Khoor, Zruog!", "Encrypt with shift 3");
  assert(caesarDecrypt("Khoor, Zruog!", 3) === "Hello, World!", "Decrypt with shift 3");
  assert(caesarEncrypt("xyz", 3) === "abc", "Wraps around z→a");
  assert(caesarEncrypt("ABC", 3) === "DEF", "Uppercase works");
  assert(caesarDecrypt(caesarEncrypt("Test 123!", 17), 17) === "Test 123!", "Roundtrip");

  // Exercise 2
  console.log("\nExercise 2: XOR Cipher");
  const xorEnc = xorCipher("Hello!", "key");
  assert(xorEnc.length === 12, "Hex output is 2 chars per byte");
  assert(xorDecrypt(xorEnc, "key") === "Hello!", "XOR roundtrip");
  assert(xorDecrypt(xorCipher("Secret", "password"), "password") === "Secret", "Different key roundtrip");

  // Exercise 3
  console.log("\nExercise 3: Simple Hash Function");
  assert(simpleHash("hello") === simpleHash("hello"), "Deterministic");
  assert(simpleHash("hello") !== simpleHash("hello!"), "Different inputs → different hashes");
  assert(simpleHash("").length === 8, "Fixed 8-char output");
  assert(simpleHash("") === "00001505", "Empty string = 5381 = 0x1505");

  // Exercise 4
  console.log("\nExercise 4: HMAC Implementation");
  const hmacResult = hmacManual("secret-key", "Hello, World!");
  const expected = createHmac("sha256", "secret-key").update("Hello, World!").digest("hex");
  assert(hmacResult === expected, "Manual HMAC matches built-in");
  const hmac2 = hmacManual("key", "message");
  const expected2 = createHmac("sha256", "key").update("message").digest("hex");
  assert(hmac2 === expected2, "Second test case matches");
  // Test with long key
  const longKey = "a".repeat(100);
  const hmac3 = hmacManual(longKey, "test");
  const expected3 = createHmac("sha256", longKey).update("test").digest("hex");
  assert(hmac3 === expected3, "Long key (>64 bytes) matches");

  // Exercise 5
  console.log("\nExercise 5: TLS Handshake Steps");
  const ex5 = exercise5();
  assert(ex5.order[0] === "C", "ClientHello is first");
  assert(ex5.order[1] === "E", "ServerHello is second");
  assert(ex5.order[ex5.order.length - 1] === "G", "Encrypted data is last");
  assert(Object.keys(ex5.explanation).length === 7, "All steps explained");

  // Exercise 6
  console.log("\nExercise 6: Encryption Scenario Predictions");
  const ex6 = exercise6();
  assert(ex6.a.includes("XOR") || ex6.a.includes("nonce") || ex6.a.includes("IV"), "Explains IV reuse danger");
  assert(ex6.b.includes("password"), "Identifies the password");
  assert(ex6.c.includes("HMAC") || ex6.c.includes("signature") || ex6.c.includes("authentication"), "Explains lack of authentication");

  // Exercise 7
  console.log("\nExercise 7: Digital Signature Simulation");
  const signed = sign("Transfer $100 to Bob", "my-secret-key");
  assert(signed.signature.length === 64, "Signature is SHA-256 hex (64 chars)");
  assert(verify(signed, "my-secret-key"), "Valid signature verifies");
  assert(!verify(signed, "wrong-key"), "Wrong key fails");
  const tampered = { ...signed, message: "Transfer $10000 to Bob" };
  assert(!verify(tampered, "my-secret-key"), "Tampered message fails");

  // Exercise 8
  console.log("\nExercise 8: Node.js Crypto Hashing");
  const hashResult = cryptoHash("Hello, World!", "secret", "");
  assert(hashResult.sha256.length === 64, "SHA-256 is 64 hex chars");
  assert(hashResult.sha512.length === 128, "SHA-512 is 128 hex chars");
  assert(hashResult.hmac.length === 64, "HMAC is 64 hex chars");
  assert(hashResult.sha256 !== hashResult.sha512, "SHA-256 ≠ SHA-512");
  const selfCompare = cryptoHash("test", "key", createHash("sha256").update("test").digest("hex"));
  assert(selfCompare.timingSafeEqual === true, "Timing-safe comparison works");

  // Exercise 9
  console.log("\nExercise 9: Certificate Validation Predictions");
  const ex9 = exercise9();
  assert(ex9.a.includes("Rejected") || ex9.a.includes("expired"), "Expired cert rejected");
  assert(ex9.b.includes("Accepted") || ex9.b.includes("match"), "Wildcard cert accepted");
  assert(ex9.c.includes("Rejected") || ex9.c.includes("warning") || ex9.c.includes("self-signed"), "Self-signed cert warning");

  // Exercise 10
  console.log("\nExercise 10: Fix Encryption");
  const key = randomBytes(32);
  const enc1 = encrypt("Secret message", key);
  const enc2 = encrypt("Secret message", key);
  assert(enc1.iv !== enc2.iv, "Different IVs for each encryption");
  assert(enc1.tag.length > 0, "Has authentication tag");
  assert(decrypt(enc1, key) === "Secret message", "Decrypts correctly");
  assert(decrypt(enc2, key) === "Secret message", "Second decryption works");
  // Test tampering detection
  let tamperDetected = false;
  try {
    const tampered2 = { ...enc1, ciphertext: "ff".repeat(enc1.ciphertext.length / 2) };
    decrypt(tampered2, key);
  } catch {
    tamperDetected = true;
  }
  assert(tamperDetected, "Tampered ciphertext detected by GCM");

  // Exercise 11
  console.log("\nExercise 11: Mixed Content and HSTS Predictions");
  const ex11 = exercise11();
  assert(ex11.a.includes("block") || ex11.a.includes("Block"), "Mixed content script blocked");
  assert(ex11.b.includes("HTTPS") || ex11.b.includes("upgrade"), "HSTS upgrades to HTTPS");

  // Exercise 12
  console.log("\nExercise 12: Diffie-Hellman Key Exchange");
  assert(modPow(5n, 3n, 13n) === 8n, "modPow(5, 3, 13) = 125 mod 13 = 8");
  assert(modPow(2n, 10n, 1000n) === 24n, "modPow(2, 10, 1000) = 1024 mod 1000 = 24");
  const dhParams: DHParams = { p: 23n, g: 5n };
  const alice = generateDHKeyPair(dhParams);
  const bob = generateDHKeyPair(dhParams);
  assert(alice.publicKey > 0n && alice.publicKey < dhParams.p, "Alice public key in range");
  assert(bob.publicKey > 0n && bob.publicKey < dhParams.p, "Bob public key in range");
  const aliceSecret = computeSharedSecret(bob.publicKey, alice.privateKey, dhParams.p);
  const bobSecret = computeSharedSecret(alice.publicKey, bob.privateKey, dhParams.p);
  assert(aliceSecret === bobSecret, "Shared secrets match");

  // Exercise 13
  console.log("\nExercise 13: Timing-Safe Hash Comparison");
  const h1 = createHash("sha256").update("password").digest("hex");
  const h2 = createHash("sha256").update("password").digest("hex");
  const h3 = createHash("sha256").update("other").digest("hex");
  assert(compareHashes(h1, h2), "Same hashes match");
  assert(!compareHashes(h1, h3), "Different hashes don't match");
  assert(!compareHashes(h1, "short"), "Different length returns false");

  // Exercise 14
  console.log("\nExercise 14: HTTPS Enforcement");
  const httpReq = enforceHTTPS({
    protocol: "http",
    hostname: "example.com",
    url: "/dashboard?tab=settings",
    headers: {},
  });
  assert(httpReq.statusCode === 301, "HTTP redirects with 301");
  assert(httpReq.redirectUrl === "https://example.com/dashboard?tab=settings", "Redirects to HTTPS");

  const httpsReq = enforceHTTPS({
    protocol: "https",
    hostname: "example.com",
    url: "/dashboard",
    headers: {},
  });
  assert(httpsReq.statusCode === 200, "HTTPS returns 200");
  assert(httpsReq.headers["Strict-Transport-Security"]?.includes("max-age="), "Sets HSTS header");

  // Exercise 15
  console.log("\nExercise 15: Certificate Chain Validation");
  const validChain: SimpleCert[] = [
    { subject: "example.com", issuer: "Intermediate CA", validFrom: 1000, validTo: 2000, isCA: false },
    { subject: "Intermediate CA", issuer: "Root CA", validFrom: 500, validTo: 3000, isCA: true },
    { subject: "Root CA", issuer: "Root CA", validFrom: 0, validTo: 5000, isCA: true },
  ];
  const validResult = validateCertChain(validChain, ["Root CA"], 1500);
  assert(validResult.valid, "Valid chain passes");
  assert(validResult.chain.length === 3, "Chain has 3 certs");

  const expiredChain: SimpleCert[] = [
    { subject: "example.com", issuer: "Intermediate CA", validFrom: 1000, validTo: 1400, isCA: false },
    { subject: "Intermediate CA", issuer: "Root CA", validFrom: 500, validTo: 3000, isCA: true },
    { subject: "Root CA", issuer: "Root CA", validFrom: 0, validTo: 5000, isCA: true },
  ];
  const expiredResult = validateCertChain(expiredChain, ["Root CA"], 1500);
  assert(!expiredResult.valid, "Expired cert fails");
  assert(expiredResult.reason.includes("expired"), "Reason mentions expiration");

  const untrustedChain: SimpleCert[] = [
    { subject: "example.com", issuer: "Unknown CA", validFrom: 1000, validTo: 2000, isCA: false },
    { subject: "Unknown CA", issuer: "Unknown CA", validFrom: 0, validTo: 5000, isCA: true },
  ];
  const untrustedResult = validateCertChain(untrustedChain, ["Root CA"], 1500);
  assert(!untrustedResult.valid, "Untrusted root fails");

  const brokenChain: SimpleCert[] = [
    { subject: "example.com", issuer: "CA-A", validFrom: 1000, validTo: 2000, isCA: false },
    { subject: "CA-B", issuer: "Root CA", validFrom: 500, validTo: 3000, isCA: true },
    { subject: "Root CA", issuer: "Root CA", validFrom: 0, validTo: 5000, isCA: true },
  ];
  const brokenResult = validateCertChain(brokenChain, ["Root CA"], 1500);
  assert(!brokenResult.valid, "Broken chain fails");

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log("=".repeat(70));
}

runTests();
