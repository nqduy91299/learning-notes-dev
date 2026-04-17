// ============================================================================
// HTTPS & Encryption — Exercises
// ============================================================================
// Run: npx tsx exercises.ts
// Config: ES2022, strict, ESNext modules
// ============================================================================

// ============================================================================
// Exercise 1 (Implement): Caesar Cipher
// ============================================================================
// Implement a Caesar cipher that shifts each letter by a given amount.
// Only shift a-z and A-Z. Leave other characters unchanged.
// Demonstrate the concept of symmetric encryption (same key encrypts/decrypts).

function exercise1_caesarEncrypt(plaintext: string, shift: number): string {
  void plaintext;
  void shift;
  return "";
}

function exercise1_caesarDecrypt(ciphertext: string, shift: number): string {
  void ciphertext;
  void shift;
  return "";
}

// console.log(exercise1_caesarEncrypt("Hello, World!", 3)); // "Khoor, Zruog!"
// console.log(exercise1_caesarDecrypt("Khoor, Zruog!", 3)); // "Hello, World!"
// console.log(exercise1_caesarEncrypt("xyz", 3)); // "abc" (wraps around)

// ============================================================================
// Exercise 2 (Implement): XOR Cipher
// ============================================================================
// Implement XOR encryption/decryption.
// XOR is symmetric: encrypt and decrypt are the same operation.
// XOR each byte of plaintext with the corresponding byte of the key (repeating).

function exercise2_xorCipher(input: string, key: string): string {
  // Return hex-encoded result
  void input;
  void key;
  return "";
}

function exercise2_xorDecrypt(hexInput: string, key: string): string {
  // Decode hex, XOR with key, return string
  void hexInput;
  void key;
  return "";
}

// const encrypted = exercise2_xorCipher("Hello!", "key");
// console.log("Encrypted (hex):", encrypted);
// console.log("Decrypted:", exercise2_xorDecrypt(encrypted, "key")); // "Hello!"

// ============================================================================
// Exercise 3 (Implement): Simple Hash Function
// ============================================================================
// Implement a simple (non-cryptographic) hash function that demonstrates
// the concepts of hashing: deterministic, fixed output, avalanche effect.
// Return a 32-bit unsigned integer as an 8-char hex string.
// Use the djb2 algorithm: hash = hash * 33 + charCode, starting with 5381.

function exercise3_simpleHash(input: string): string {
  void input;
  return "";
}

// console.log(exercise3_simpleHash("hello"));      // Some hex string
// console.log(exercise3_simpleHash("hello"));      // Same hex string (deterministic)
// console.log(exercise3_simpleHash("hello!"));     // Different hex string (avalanche)
// console.log(exercise3_simpleHash(""));           // "00001505" (5381 in hex)

// ============================================================================
// Exercise 4 (Implement): HMAC Implementation
// ============================================================================
// Implement HMAC using Node.js crypto.
// HMAC(key, message) = Hash((key XOR opad) || Hash((key XOR ipad) || message))
// Use the built-in createHmac for verification, but implement the algorithm manually.

import { createHash, createHmac } from "node:crypto";

function exercise4_hmac(
  key: string,
  message: string,
  algorithm: string = "sha256"
): string {
  // Implement HMAC manually:
  // 1. If key > block size (64 bytes for SHA-256), hash it
  // 2. If key < block size, pad with zeros
  // 3. Create ipad (key XOR 0x36 repeated) and opad (key XOR 0x5c repeated)
  // 4. Return Hash(opad || Hash(ipad || message))
  void createHash;
  void key;
  void message;
  void algorithm;
  return "";
}

// const hmacResult = exercise4_hmac("secret-key", "Hello, World!");
// const expected = createHmac("sha256", "secret-key").update("Hello, World!").digest("hex");
// console.log("Manual HMAC:", hmacResult);
// console.log("Built-in:   ", expected);
// console.log("Match:", hmacResult === expected);

// ============================================================================
// Exercise 5 (Predict): TLS Handshake Steps
// ============================================================================
// Order the following TLS 1.3 handshake steps correctly and explain each.

function exercise5(): {
  order: string[];
  explanation: Record<string, string>;
} {
  // Steps (in random order):
  // A. Client sends Finished message
  // B. Server sends Certificate + CertificateVerify
  // C. Client sends ClientHello with supported ciphers and key share
  // D. Both sides derive session keys from shared secret
  // E. Server sends ServerHello with chosen cipher and key share
  // F. Server sends Finished message
  // G. Encrypted application data begins

  return {
    order: [], // Put letters in correct order
    explanation: {}, // Explain what each step does
  };
}

// console.log("Exercise 5:", exercise5());

// ============================================================================
// Exercise 6 (Predict): Encryption Scenarios
// ============================================================================
// For each scenario, predict the outcome.

function exercise6(): { a: string; b: string; c: string } {
  // Scenario A:
  // Alice encrypts a message with AES-GCM using key K and IV (nonce) N.
  // Alice sends another message encrypted with the same key K and same IV N.
  // What security issue arises?

  // Scenario B:
  // Bob hashes a password with SHA-256 (no salt).
  // The hash is: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
  // An attacker finds this hash in a rainbow table.
  // What is the password? (Hint: it's a very common password)

  // Scenario C:
  // Carol receives a message and its SHA-256 hash over an insecure channel.
  // She computes the hash of the message and it matches.
  // Can she be sure the message wasn't tampered with? Why or why not?

  return {
    a: "", // What happens?
    b: "", // What is the password?
    c: "", // Is the message authentic?
  };
}

// console.log("Exercise 6:", exercise6());

// ============================================================================
// Exercise 7 (Implement): Digital Signature Simulation
// ============================================================================
// Simulate digital signatures using HMAC (simplified — real signatures use
// asymmetric crypto). Demonstrate the concept of sign and verify.

interface SignedMessage {
  message: string;
  signature: string;
  algorithm: string;
}

function exercise7_sign(message: string, privateKey: string): SignedMessage {
  void message;
  void privateKey;
  return { message: "", signature: "", algorithm: "HMAC-SHA256" };
}

function exercise7_verify(
  signed: SignedMessage,
  publicKey: string // In this simulation, same as private key
): boolean {
  void signed;
  void publicKey;
  return false;
}

// const signed = exercise7_sign("Transfer $100 to Bob", "my-secret-key");
// console.log("Signed:", signed);
// console.log("Verify (correct key):", exercise7_verify(signed, "my-secret-key")); // true
// console.log("Verify (wrong key):", exercise7_verify(signed, "wrong-key")); // false
// signed.message = "Transfer $10000 to Bob"; // Tamper!
// console.log("Verify (tampered):", exercise7_verify(signed, "my-secret-key")); // false

// ============================================================================
// Exercise 8 (Implement): Node.js Crypto Hashing
// ============================================================================
// Use Node.js crypto module to:
// 1. Hash a string with SHA-256
// 2. Hash a string with SHA-512
// 3. Compute HMAC-SHA256 of a message with a key
// 4. Compare two hashes in constant time

interface HashResults {
  sha256: string;
  sha512: string;
  hmac: string;
  timingSafeEqual: boolean;
}

function exercise8_cryptoHash(
  message: string,
  hmacKey: string,
  compareHash: string
): HashResults {
  void message;
  void hmacKey;
  void compareHash;
  return { sha256: "", sha512: "", hmac: "", timingSafeEqual: false };
}

// const result = exercise8_cryptoHash("Hello, World!", "secret", "");
// console.log(result);

// ============================================================================
// Exercise 9 (Predict): Certificate Validation
// ============================================================================
// For each scenario, predict whether the browser accepts or rejects the certificate.

function exercise9(): { a: string; b: string; c: string } {
  // Scenario A:
  // You visit https://example.com
  // The server presents a certificate for example.com
  // The certificate is signed by an intermediate CA
  // The intermediate CA is signed by a root CA in the browser's trust store
  // The certificate expired yesterday.

  // Scenario B:
  // You visit https://app.example.com
  // The server presents a certificate for *.example.com
  // The certificate is valid and signed by a trusted CA.

  // Scenario C:
  // You visit https://example.com
  // The server presents a self-signed certificate for example.com
  // The certificate is not expired.

  return {
    a: "", // Accept or reject? Why?
    b: "", // Accept or reject? Why?
    c: "", // Accept or reject? Why?
  };
}

// console.log("Exercise 9:", exercise9());

// ============================================================================
// Exercise 10 (Fix): Insecure Encryption
// ============================================================================
// Fix this encryption implementation. It has critical security issues.

import { randomBytes } from "node:crypto";

interface EncryptionResult {
  ciphertext: string; // hex
  iv: string; // hex
  tag: string; // hex (for GCM)
}

function exercise10_encrypt(
  plaintext: string,
  _key: Buffer
): EncryptionResult {
  // VULNERABLE — fix these issues:
  // 1. Uses a fixed IV (should be random)
  // 2. Uses ECB mode (should use GCM)
  // 3. No authentication tag

  void randomBytes; // You'll need this

  const fixedIV = Buffer.alloc(12, 0); // BAD: all zeros!

  return {
    ciphertext: plaintext, // Not even encrypting!
    iv: fixedIV.toString("hex"),
    tag: "",
  };
}

function exercise10_decrypt(
  _encrypted: EncryptionResult,
  _key: Buffer
): string {
  // Fix this to properly decrypt
  return _encrypted.ciphertext; // Not decrypting!
}

// const key = randomBytes(32); // AES-256
// const encrypted = exercise10_encrypt("Secret message", key);
// console.log("Encrypted:", encrypted);
// const decrypted = exercise10_decrypt(encrypted, key);
// console.log("Decrypted:", decrypted); // "Secret message"

// ============================================================================
// Exercise 11 (Predict): Mixed Content and HSTS
// ============================================================================
// For each scenario, predict the browser behavior.

function exercise11(): { a: string; b: string } {
  // Scenario A:
  // Page is served over HTTPS.
  // It includes: <script src="http://cdn.example.com/analytics.js"></script>
  // What does the browser do?

  // Scenario B:
  // User visits https://example.com for the first time.
  // Server responds with: Strict-Transport-Security: max-age=31536000
  // User closes the browser.
  // Next day, user types "http://example.com" in the address bar.
  // What happens?

  return {
    a: "", // What happens?
    b: "", // What happens?
  };
}

// console.log("Exercise 11:", exercise11());

// ============================================================================
// Exercise 12 (Implement): Diffie-Hellman Key Exchange Simulation
// ============================================================================
// Simulate the Diffie-Hellman key exchange with small numbers.
// Use modular exponentiation: (base^exp) mod modulus

function exercise12_modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
  // Implement modular exponentiation efficiently (square-and-multiply)
  void base;
  void exp;
  void modulus;
  return 0n;
}

interface DHKeyPair {
  privateKey: bigint;
  publicKey: bigint;
}

interface DHParams {
  p: bigint; // prime
  g: bigint; // generator
}

function exercise12_generateDHKeyPair(params: DHParams): DHKeyPair {
  // Generate a random private key (1 < private < p-1)
  // Compute public key: g^private mod p
  void params;
  return { privateKey: 0n, publicKey: 0n };
}

function exercise12_computeSharedSecret(
  theirPublicKey: bigint,
  myPrivateKey: bigint,
  p: bigint
): bigint {
  // Compute: theirPublicKey^myPrivateKey mod p
  void theirPublicKey;
  void myPrivateKey;
  void p;
  return 0n;
}

// const params: DHParams = { p: 23n, g: 5n }; // Small primes for demo
// const alice = exercise12_generateDHKeyPair(params);
// const bob = exercise12_generateDHKeyPair(params);
// console.log("Alice public:", alice.publicKey);
// console.log("Bob public:", bob.publicKey);
// const aliceSecret = exercise12_computeSharedSecret(bob.publicKey, alice.privateKey, params.p);
// const bobSecret = exercise12_computeSharedSecret(alice.publicKey, bob.privateKey, params.p);
// console.log("Alice's shared secret:", aliceSecret);
// console.log("Bob's shared secret:", bobSecret);
// console.log("Secrets match:", aliceSecret === bobSecret); // true!

// ============================================================================
// Exercise 13 (Fix): Insecure Hash Comparison
// ============================================================================
// Fix this hash comparison function. It's vulnerable to timing attacks.

import { timingSafeEqual } from "node:crypto";

function exercise13_compareHashes(hash1: string, hash2: string): boolean {
  // VULNERABLE — fix this
  // Simple string comparison leaks timing information.
  // An attacker can determine how many bytes match by measuring response time.
  void timingSafeEqual; // Use this!
  return hash1 === hash2;
}

// const h1 = createHash("sha256").update("password").digest("hex");
// const h2 = createHash("sha256").update("password").digest("hex");
// const h3 = createHash("sha256").update("other").digest("hex");
// console.log(exercise13_compareHashes(h1, h2)); // true
// console.log(exercise13_compareHashes(h1, h3)); // false

// ============================================================================
// Exercise 14 (Fix): Missing HTTPS Enforcement
// ============================================================================
// Fix this Express-like middleware that should enforce HTTPS.
// It should redirect HTTP to HTTPS and set proper security headers.

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

function exercise14_enforceHTTPS(req: Request): Response {
  // VULNERABLE — doesn't enforce HTTPS, doesn't set HSTS
  void req;
  return {
    statusCode: 200,
    headers: {},
    body: "OK",
  };
}

// console.log(exercise14_enforceHTTPS({
//   protocol: "http",
//   hostname: "example.com",
//   url: "/dashboard?tab=settings",
//   headers: {},
// }));
// Expected: redirect to https://example.com/dashboard?tab=settings

// console.log(exercise14_enforceHTTPS({
//   protocol: "https",
//   hostname: "example.com",
//   url: "/dashboard",
//   headers: {},
// }));
// Expected: 200 OK with HSTS header

// ============================================================================
// Exercise 15 (Implement): Certificate Chain Validator (Simplified)
// ============================================================================
// Simulate certificate chain validation.
// Each certificate has: subject, issuer, publicKey, signature, validFrom, validTo.
// Validate that:
// 1. The chain is ordered: cert[0] is leaf, cert[n-1] is root
// 2. Each cert's issuer matches the next cert's subject
// 3. No certificate has expired
// 4. The root is in the trusted store

interface SimpleCert {
  subject: string;
  issuer: string;
  validFrom: number; // Unix timestamp
  validTo: number;
  isCA: boolean;
}

interface CertValidationResult {
  valid: boolean;
  reason: string;
  chain: string[]; // subjects in order
}

function exercise15_validateCertChain(
  chain: SimpleCert[],
  trustedRoots: string[], // trusted subject names
  currentTime: number
): CertValidationResult {
  void chain;
  void trustedRoots;
  void currentTime;
  return { valid: false, reason: "Not implemented", chain: [] };
}

// const chain: SimpleCert[] = [
//   { subject: "example.com", issuer: "Intermediate CA", validFrom: 1000, validTo: 2000, isCA: false },
//   { subject: "Intermediate CA", issuer: "Root CA", validFrom: 500, validTo: 3000, isCA: true },
//   { subject: "Root CA", issuer: "Root CA", validFrom: 0, validTo: 5000, isCA: true },
// ];
// console.log(exercise15_validateCertChain(chain, ["Root CA"], 1500));
// Expected: { valid: true, reason: "Certificate chain is valid", chain: ["example.com", "Intermediate CA", "Root CA"] }

export {
  exercise1_caesarEncrypt,
  exercise1_caesarDecrypt,
  exercise2_xorCipher,
  exercise2_xorDecrypt,
  exercise3_simpleHash,
  exercise4_hmac,
  exercise5,
  exercise6,
  exercise7_sign,
  exercise7_verify,
  exercise8_cryptoHash,
  exercise9,
  exercise10_encrypt,
  exercise10_decrypt,
  exercise11,
  exercise12_modPow,
  exercise12_generateDHKeyPair,
  exercise12_computeSharedSecret,
  exercise13_compareHashes,
  exercise14_enforceHTTPS,
  exercise15_validateCertChain,
};

console.log("HTTPS & Encryption — Exercises loaded.");
console.log("Uncomment the test calls to verify your solutions.");
