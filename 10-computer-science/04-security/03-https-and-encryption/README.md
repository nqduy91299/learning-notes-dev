# HTTPS & Encryption

## Table of Contents

1. [Why HTTPS](#why-https)
2. [TLS Handshake](#tls-handshake)
3. [SSL vs TLS](#ssl-vs-tls)
4. [Certificates](#certificates)
5. [Symmetric Encryption](#symmetric-encryption)
6. [Asymmetric Encryption](#asymmetric-encryption)
7. [Key Exchange (Diffie-Hellman)](#key-exchange-diffie-hellman)
8. [Hashing](#hashing)
9. [HMAC](#hmac)
10. [Digital Signatures](#digital-signatures)
11. [Web Crypto API](#web-crypto-api)
12. [Mixed Content](#mixed-content)
13. [HSTS](#hsts)
14. [Certificate Pinning](#certificate-pinning)

---

## Why HTTPS

HTTPS = HTTP + TLS. It provides three guarantees:

| Guarantee | What It Means | Without It |
|-----------|--------------|------------|
| **Confidentiality** | Data is encrypted in transit | Anyone on the network can read traffic |
| **Integrity** | Data cannot be modified in transit | ISPs can inject ads, attackers can modify responses |
| **Authentication** | You're talking to the real server | Attacker can impersonate any website (MITM) |

HTTPS is required for:
- Service workers
- HTTP/2
- Geolocation API
- Web Crypto API
- Any modern browser feature requiring secure context

---

## TLS Handshake

The TLS handshake establishes an encrypted connection. Simplified TLS 1.3:

```
Client                                    Server
  │                                          │
  │── ClientHello ──────────────────────────►│
  │   (supported cipher suites,              │
  │    random number, TLS version,           │
  │    key share for Diffie-Hellman)         │
  │                                          │
  │◄─── ServerHello ────────────────────────│
  │     (chosen cipher suite,               │
  │      random number,                     │
  │      key share)                         │
  │◄─── Certificate ───────────────────────│
  │     (server's X.509 certificate)       │
  │◄─── CertificateVerify ────────────────│
  │     (signature proving ownership)      │
  │◄─── Finished ──────────────────────────│
  │                                          │
  │── Finished ─────────────────────────────►│
  │                                          │
  │◄═══════ Encrypted Communication ═══════►│
```

**Key points:**
- TLS 1.3 completes in 1 round trip (1-RTT), vs 2-RTT for TLS 1.2
- Both sides derive the same symmetric key using Diffie-Hellman
- All subsequent data is encrypted with AES using this shared key

---

## SSL vs TLS

| Protocol | Status | Notes |
|----------|--------|-------|
| SSL 2.0 | Deprecated | Severely broken, never use |
| SSL 3.0 | Deprecated | POODLE attack, never use |
| TLS 1.0 | Deprecated | BEAST attack, most browsers dropped support |
| TLS 1.1 | Deprecated | No known critical flaws, but outdated |
| TLS 1.2 | Current | Still widely used, secure with proper config |
| TLS 1.3 | Current (best) | Faster, simpler, more secure |

People still say "SSL" colloquially, but the actual protocol is always TLS.
SSL is dead. Use TLS 1.2+ only.

---

## Certificates

A certificate binds a public key to a domain name, verified by a trusted authority.

### Chain of Trust

```
Root CA (built into browsers/OS)
  │
  └── Intermediate CA (signed by Root CA)
        │
        └── Server Certificate (signed by Intermediate CA)
              │
              └── Your domain: example.com
```

The browser trusts the root CA → trusts the intermediate → trusts your certificate.

### Certificate Contents

```
Subject:     CN=example.com
Issuer:      CN=Let's Encrypt Authority X3
Valid From:  2024-01-01
Valid To:    2024-03-31
Public Key:  (RSA 2048-bit or ECDSA P-256)
Signature:   (signed by issuer's private key)
SANs:        example.com, www.example.com
```

### Let's Encrypt

Free, automated certificate authority. Certificates are valid for 90 days
and can be auto-renewed. Uses the ACME protocol for domain validation.

### Self-Signed Certificates

- Created without a CA — you sign your own certificate
- Browsers show a warning because there's no chain of trust
- Acceptable for development, never for production

---

## Symmetric Encryption

Same key for both encryption and decryption. Fast.

```
Plaintext ──► Encrypt(key) ──► Ciphertext ──► Decrypt(same key) ──► Plaintext
"Hello"                        "x8f#2kL..."                         "Hello"
```

### AES (Advanced Encryption Standard)

The standard symmetric cipher. Key sizes: 128, 192, or 256 bits.

**Modes of operation:**

| Mode | Use Case | Notes |
|------|----------|-------|
| **AES-GCM** | General purpose | Authenticated encryption (integrity + confidentiality) |
| **AES-CBC** | Legacy | Requires separate HMAC for integrity |
| **AES-CTR** | Streaming | Turns block cipher into stream cipher |

**AES-GCM is the recommended mode.** It provides both encryption and
authentication (detects tampering).

```
AES-GCM encrypts:
  Input:  plaintext + key + IV (initialization vector) + optional AAD
  Output: ciphertext + authentication tag (16 bytes)

AES-GCM decrypts:
  Input:  ciphertext + key + IV + tag + optional AAD
  Output: plaintext (or error if tampered)
```

The IV must be unique for every encryption with the same key. Never reuse IVs.

---

## Asymmetric Encryption

Different keys for encryption and decryption. Slow, but solves key distribution.

```
Public Key (share freely)     Private Key (keep secret)
       │                              │
       ▼                              ▼
    Encrypt ──► Ciphertext ──► Decrypt
                                      │
                                      ▼
                                  Plaintext
```

Anyone can encrypt with the public key, but only the private key holder can decrypt.

### RSA

- Key sizes: 2048, 3072, 4096 bits
- Used for: encryption, digital signatures
- Slow — not used for bulk data, only for key exchange and signatures

### ECDSA (Elliptic Curve Digital Signature Algorithm)

- Key sizes: P-256 (equivalent to RSA 3072), P-384, P-521
- Smaller keys, faster than RSA for signatures
- Used in TLS, JWT, SSH

### When to Use Each

| Operation | Use |
|-----------|-----|
| Encrypt large data | Symmetric (AES) |
| Encrypt small data / key exchange | Asymmetric (RSA, ECDH) |
| Digital signatures | Asymmetric (RSA, ECDSA) |
| TLS session encryption | Symmetric (AES) with asymmetric key exchange |

---

## Key Exchange (Diffie-Hellman)

How do two parties agree on a shared secret over an insecure channel?

### Simplified Concept

```
Alice and Bob agree on public values: p (prime) and g (generator)

Alice: picks secret a, computes A = g^a mod p, sends A to Bob
Bob:   picks secret b, computes B = g^b mod p, sends B to Alice

Alice computes: shared = B^a mod p = g^(ab) mod p
Bob computes:   shared = A^b mod p = g^(ab) mod p

Both have the same shared secret! An eavesdropper who sees A, B, g, p
cannot compute g^(ab) mod p (discrete logarithm problem).
```

### ECDH (Elliptic Curve Diffie-Hellman)

Same concept but using elliptic curves instead of modular exponentiation.
Smaller keys, faster, used in TLS 1.3.

---

## Hashing

A hash function maps input of any size to a fixed-size output. It is NOT encryption
— it's one-way and cannot be reversed.

```
Input (any size)  ──► Hash Function ──►  Fixed-size output
"Hello"           ──► SHA-256       ──►  "2cf24dba5f..."  (64 hex chars)
"Hello!"          ──► SHA-256       ──►  "334d016f75..." (completely different)
```

### Properties

1. **Deterministic** — same input always produces same output
2. **One-way** — cannot recover input from hash
3. **Avalanche effect** — tiny change in input → completely different hash
4. **Collision-resistant** — infeasible to find two inputs with same hash
5. **Fixed output size** — regardless of input size

### Common Hash Functions

| Algorithm | Output Size | Status |
|-----------|------------|--------|
| MD5 | 128 bits | Broken — collisions found |
| SHA-1 | 160 bits | Broken — don't use |
| SHA-256 | 256 bits | Secure — widely used |
| SHA-384 | 384 bits | Secure |
| SHA-512 | 512 bits | Secure |

### Use Cases

- **Password storage** (with bcrypt/argon2, not raw SHA)
- **Data integrity** (checksums, SRI)
- **Digital signatures** (hash then sign)
- **Deduplication** (compare file hashes)

---

## HMAC

HMAC (Hash-based Message Authentication Code) combines a hash function with a
secret key to provide both integrity and authentication.

```
HMAC(key, message) = Hash((key XOR opad) || Hash((key XOR ipad) || message))
```

```
Sender:   computes HMAC(key, message) → tag
          sends message + tag
Receiver: computes HMAC(key, message) → expected_tag
          compares tag === expected_tag
          If match → message is authentic and unmodified
```

**HMAC vs plain hash:**

| | Plain Hash | HMAC |
|--|-----------|------|
| Integrity | Yes | Yes |
| Authentication | No | Yes (proves sender has the key) |
| Vulnerable to | Length extension attacks | Not vulnerable |

---

## Digital Signatures

Digital signatures use asymmetric cryptography to prove authorship and integrity.

```
Signing (private key):
  1. Hash the message → digest
  2. Encrypt digest with private key → signature
  3. Send message + signature

Verification (public key):
  1. Hash the received message → digest
  2. Decrypt signature with public key → original digest
  3. Compare: if digests match → signature is valid
```

```
Alice signs:                     Bob verifies:
  message ──► hash ──► sign      message ──► hash ──►┐
                        │                              │ compare
              private   │        signature ──► verify ─┘
              key       │                      │
                        ▼                   public
                    signature               key
```

**Use cases:**
- JWT signing (RS256, ES256)
- Code signing
- TLS certificate verification
- Software update verification

---

## Web Crypto API

The browser's built-in cryptography API. Available as `crypto.subtle`.

### Key Operations

```typescript
// Generate a key
const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,        // extractable
  ["encrypt", "decrypt"]
);

// Encrypt
const iv = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  key,
  new TextEncoder().encode("Hello, world!")
);

// Decrypt
const plaintext = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv },
  key,
  ciphertext
);

// Hash (digest)
const hash = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode("Hello")
);

// Sign / Verify (with ECDSA or RSA)
const signature = await crypto.subtle.sign(algorithm, privateKey, data);
const valid = await crypto.subtle.verify(algorithm, publicKey, signature, data);
```

### Available Algorithms

| Category | Algorithms |
|----------|-----------|
| Encryption | AES-GCM, AES-CBC, AES-CTR, RSA-OAEP |
| Signing | RSASSA-PKCS1-v1_5, RSA-PSS, ECDSA, HMAC |
| Hashing | SHA-1, SHA-256, SHA-384, SHA-512 |
| Key Exchange | ECDH |
| Key Derivation | PBKDF2, HKDF |

---

## Mixed Content

When an HTTPS page loads resources over HTTP, it's called mixed content.

| Type | Examples | Browser Behavior |
|------|----------|-----------------|
| **Active** (dangerous) | Scripts, iframes, XHR | Blocked by default |
| **Passive** (display) | Images, audio, video | Warning, may be blocked |

```html
<!-- On https://example.com -->
<script src="http://cdn.example.com/lib.js"></script>  <!-- BLOCKED -->
<img src="http://images.example.com/pic.jpg">           <!-- WARNING -->
```

**Fix:** Use HTTPS for all resources, or use protocol-relative URLs (`//`)
which inherit the page's protocol. Better yet, always use `https://`.

---

## HSTS

HTTP Strict Transport Security tells browsers to always use HTTPS.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| Directive | Meaning |
|-----------|---------|
| `max-age` | How long (seconds) to remember this policy |
| `includeSubDomains` | Apply to all subdomains too |
| `preload` | Request inclusion in browser's built-in HSTS list |

### HSTS Preload List

Browsers ship with a list of domains that must always use HTTPS. Even the
first request to these domains uses HTTPS. Submit your domain at
[hstspreload.org](https://hstspreload.org).

**Without HSTS:** First request might be HTTP → attacker can intercept.
**With HSTS preload:** First request is HTTPS → no window for attack.

---

## Certificate Pinning

Certificate pinning restricts which certificates are accepted for a domain,
beyond the normal CA trust chain.

**How it works:** The app stores (pins) the expected certificate or public key.
During TLS, it checks that the server's certificate matches the pin.

**Problems:**
- If you lose the pinned key, your site is inaccessible
- Hard to rotate certificates
- Chrome removed support for HTTP Public Key Pinning (HPKP) in 2018

**Modern alternative:** Certificate Transparency (CT) logs allow monitoring
for unauthorized certificates issued for your domain.

---

## Key Takeaways for Frontend Developers

1. **Always use HTTPS** — no exceptions, even for development (use localhost)
2. **Set HSTS headers** — prevent downgrade attacks
3. **Never implement your own crypto** — use Web Crypto API or established libraries
4. **Understand the difference** — hashing is not encryption, signing is not encrypting
5. **AES-GCM for symmetric encryption** — provides both confidentiality and integrity
6. **Unique IVs/nonces are critical** — reusing them breaks the entire encryption
7. **SHA-256 for hashing** — MD5 and SHA-1 are broken
8. **TLS 1.2+ only** — disable older versions on your servers
9. **Certificate Transparency** — monitor for unauthorized certs
10. **Mixed content kills HTTPS** — ensure all resources use HTTPS

---

## Further Reading

- [How HTTPS Works](https://howhttps.works/) — Visual comic explanation
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Illustrated TLS 1.3](https://tls13.xargs.org/)
- [Let's Encrypt](https://letsencrypt.org/)
