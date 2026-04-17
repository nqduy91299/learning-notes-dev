# Computer Science for Frontend Developers

Essential CS concepts that directly impact frontend development, interviews, and day-to-day work.

## Chapters

### 01 - How Computers Work
| # | Topic | Description | Status |
|---|-------|-------------|--------|
| 01 | [Binary & Data](./01-how-computers-work/01-binary-and-data/README.md) | Binary, hex, encoding (UTF-8, Base64), floating point, bitwise ops | Done |
| 02 | [Memory & Storage](./01-how-computers-work/02-memory-and-storage/README.md) | Stack vs heap, garbage collection, memory leaks in JS, cache levels | Done |
| 03 | [CPU & Execution](./01-how-computers-work/03-cpu-and-execution/README.md) | How CPU executes code, clock speed, multi-core, JIT compilation | Done |
| 04 | [How Code Runs](./01-how-computers-work/04-how-code-runs/README.md) | Compilation vs interpretation, V8 engine, AST, bundling, tree shaking | Done |

### 02 - Networking
| # | Topic | Description | Status |
|---|-------|-------------|--------|
| 01 | [HTTP Protocol](./02-networking/01-http-protocol/README.md) | HTTP/1.1, HTTP/2, HTTP/3, methods, status codes, headers, cookies | Done |
| 02 | [DNS & Domains](./02-networking/02-dns-and-domains/README.md) | DNS resolution, records (A, CNAME, MX), CDN, domain registration | Done |
| 03 | [TCP/IP Model](./02-networking/03-tcp-ip-model/README.md) | OSI vs TCP/IP layers, TCP handshake, UDP, ports, IP addressing | Done |
| 04 | [WebSockets & Realtime](./02-networking/04-websockets-and-realtime/README.md) | WebSocket protocol, SSE, long polling, Socket.IO, realtime patterns | Done |
| 05 | [CORS & Caching](./02-networking/05-cors-and-caching/README.md) | Same-origin policy, CORS headers, browser caching, Cache-Control, ETags | Done |

### 03 - Operating Systems
| # | Topic | Description | Status |
|---|-------|-------------|--------|
| 01 | [Processes & Threads](./03-operating-systems/01-processes-and-threads/README.md) | Process vs thread, scheduling, context switching, Web Workers | Done |
| 02 | [Concurrency in JS](./03-operating-systems/02-concurrency-in-js/README.md) | Single-threaded model, event loop deep dive, Worker threads, SharedArrayBuffer | Done |
| 03 | [File Systems & I/O](./03-operating-systems/03-file-systems-and-io/README.md) | Sync vs async I/O, streams, buffering, File API in browser, Node.js fs | Done |

### 04 - Security
| # | Topic | Description | Status |
|---|-------|-------------|--------|
| 01 | [Web Security Fundamentals](./04-security/01-web-security-fundamentals/README.md) | XSS, CSRF, clickjacking, injection, OWASP Top 10, CSP, sanitization | Done |
| 02 | [Authentication & Authorization](./04-security/02-authentication-and-authorization/README.md) | JWT, OAuth 2.0, session-based, RBAC, cookies vs tokens, refresh tokens | Done |
| 03 | [HTTPS & Encryption](./04-security/03-https-and-encryption/README.md) | TLS handshake, certificates, symmetric vs asymmetric, hashing, Web Crypto API | Done |

### 05 - Software Engineering
| # | Topic | Description | Status |
|---|-------|-------------|--------|
| 01 | [Testing Strategies](./05-software-engineering/01-testing-strategies/README.md) | Testing pyramid, unit/integration/e2e, TDD, mocking, coverage, testing library choices | Done |
| 02 | [Clean Code Principles](./05-software-engineering/02-clean-code-principles/README.md) | SOLID, DRY, KISS, YAGNI, naming, functions, comments, code smells | Done |
| 03 | [Technical Debt & Refactoring](./05-software-engineering/03-technical-debt-and-refactoring/README.md) | Types of tech debt, refactoring techniques, when to refactor, migration strategies | Done |

## Suggested Order

```
01-how-computers-work --> 02-networking --> 03-operating-systems --> 04-security --> 05-software-engineering
```
