# TCP/IP Model

## Table of Contents

1. [OSI vs TCP/IP Models](#osi-vs-tcpip-models)
2. [TCP/IP 4-Layer Model](#tcpip-4-layer-model)
3. [IP Addressing](#ip-addressing)
4. [Ports](#ports)
5. [TCP (Transmission Control Protocol)](#tcp-transmission-control-protocol)
6. [UDP (User Datagram Protocol)](#udp-user-datagram-protocol)
7. [How a Web Request Flows Through All Layers](#how-a-web-request-flows-through-all-layers)
8. [NAT and Firewalls](#nat-and-firewalls)
9. [What Happens When You Type a URL](#what-happens-when-you-type-a-url)
10. [Frontend Relevance](#frontend-relevance)

---

## OSI vs TCP/IP Models

### OSI 7-Layer Model (Reference)

The OSI (Open Systems Interconnection) model is a theoretical framework.
You'll see it in interviews but rarely use it directly.

| Layer | Name | Examples |
|-------|------|----------|
| 7 | Application | HTTP, FTP, SMTP, WebSocket |
| 6 | Presentation | SSL/TLS, encryption, compression |
| 5 | Session | Session management, RPC |
| 4 | Transport | TCP, UDP |
| 3 | Network | IP, ICMP, routing |
| 2 | Data Link | Ethernet, WiFi (MAC addresses) |
| 1 | Physical | Cables, radio signals, fiber optics |

### TCP/IP 4-Layer Model (Practical)

The TCP/IP model is what the internet actually uses. It combines some OSI layers:

| TCP/IP Layer | OSI Equivalent | Protocols | What It Does |
|-------------|----------------|-----------|-------------|
| Application | 7, 6, 5 | HTTP, DNS, FTP, SMTP | Your app's data |
| Transport | 4 | TCP, UDP | Reliable (or fast) delivery |
| Internet | 3 | IP, ICMP | Addressing and routing |
| Network Access | 2, 1 | Ethernet, WiFi | Physical transmission |

**For frontend developers**: You work at the Application layer (HTTP, WebSocket),
but understanding Transport (TCP/UDP) and Internet (IP) layers helps you debug
networking issues and understand performance.

---

## TCP/IP 4-Layer Model

### Application Layer

Where your code lives. Every `fetch()` call creates an HTTP message at this layer.

- **HTTP/HTTPS**: Web requests and responses
- **DNS**: Domain name resolution (before HTTP even starts)
- **WebSocket**: Full-duplex communication over TCP
- **SMTP/IMAP**: Email protocols

### Transport Layer

Manages end-to-end communication between applications on different machines.

- **TCP**: Reliable, ordered delivery. Used by HTTP/1.1, HTTP/2
- **UDP**: Fast, unordered, no guarantee. Used by HTTP/3 (QUIC), WebRTC, DNS

The transport layer adds **port numbers** to identify which application should
receive the data.

### Internet Layer

Handles addressing and routing across networks.

- **IP (Internet Protocol)**: Adds source and destination IP addresses
- **ICMP**: Error messages and diagnostics (ping, traceroute)
- **Routing**: Determines the path packets take through the network

### Network Access Layer

The physical and data link layers combined. Handles the actual transmission of
bits over the physical medium (Ethernet cables, WiFi signals, fiber optics).

- **MAC addresses**: Hardware addresses for local network communication
- **ARP**: Translates IP addresses to MAC addresses on the local network

---

## IP Addressing

### IPv4

- 32-bit address: `192.168.1.1`
- ~4.3 billion possible addresses (we've run out)
- Format: four octets (0-255) separated by dots

### IPv6

- 128-bit address: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- Practically unlimited addresses
- Shortened form: `2001:db8:85a3::8a2e:370:7334` (omit leading zeros, `::` for consecutive zero groups)

### Special Addresses

| Address | Meaning |
|---------|---------|
| `127.0.0.1` | Localhost (your own machine) — IPv4 |
| `::1` | Localhost — IPv6 |
| `0.0.0.0` | All interfaces (listen on everything) |
| `localhost` | Resolves to 127.0.0.1 (usually) |

### Private IP Ranges

These addresses are only valid within local networks (not routable on the internet):

| Range | Common Use |
|-------|-----------|
| `10.0.0.0 – 10.255.255.255` | Large corporate networks |
| `172.16.0.0 – 172.31.255.255` | Medium networks, Docker default |
| `192.168.0.0 – 192.168.255.255` | Home networks, WiFi routers |

**Frontend relevance**: When developing locally, you access your dev server at
`localhost:3000` (127.0.0.1:3000). When testing on mobile, you use your machine's
local IP like `192.168.1.100:3000`.

---

## Ports

A port is a 16-bit number (0-65535) that identifies a specific application on a machine.
Think of it as an apartment number — the IP is the building address, the port is the unit.

### Well-Known Ports (Frontend Relevant)

| Port | Protocol | Usage |
|------|----------|-------|
| 80 | HTTP | Default web (unencrypted) |
| 443 | HTTPS | Default web (encrypted) — you should always use this |
| 3000 | — | React dev server (Create React App, Next.js) |
| 4200 | — | Angular dev server |
| 5173 | — | Vite dev server |
| 8080 | — | Common alternative HTTP port, Java servers |
| 8000 | — | Python dev servers |
| 5432 | PostgreSQL | Database |
| 3306 | MySQL | Database |
| 6379 | Redis | Cache/message broker |
| 22 | SSH | Secure shell |

### Port in URLs

```
https://example.com:443/path
                    ↑
                   port (443 is default for HTTPS, usually omitted)

http://localhost:3000/
                ↑
               port (must be explicit for non-standard ports)
```

When you omit the port in a URL:
- `http://` defaults to port 80
- `https://` defaults to port 443

---

## TCP (Transmission Control Protocol)

TCP is the reliable transport protocol used by HTTP/1.1 and HTTP/2.

### 3-Way Handshake

Before any data is sent, TCP establishes a connection:

```
Client                    Server
  |                         |
  |  ── SYN ──────────>     |   1. "I want to connect"
  |                         |
  |  <────── SYN-ACK ──     |   2. "OK, I acknowledge"
  |                         |
  |  ── ACK ──────────>     |   3. "Great, let's go"
  |                         |
  |  ══ DATA ═══════════    |   4. Now data can flow
```

This takes 1 round trip (1 RTT) before any application data is sent.
With TLS on top, add another 1-2 RTT for the TLS handshake.

**Total for HTTPS**: ~2-3 RTT before first byte of HTTP data.
This is why HTTP/3 (QUIC) with 0-RTT is significant.

### Reliable Delivery

TCP guarantees that:
1. **All data arrives** — lost packets are retransmitted
2. **Data arrives in order** — packets are reassembled in sequence
3. **No duplicates** — duplicate packets are discarded
4. **Error detection** — corrupted packets are detected via checksums

### Flow Control

TCP prevents the sender from overwhelming the receiver:
- **Receive window**: The receiver tells the sender how much data it can accept
- Sender adjusts transmission rate based on this window

### Congestion Control

TCP prevents overwhelming the network:
- **Slow start**: Begin with a small congestion window, increase exponentially
- **Congestion avoidance**: After a threshold, increase linearly
- **When packet loss detected**: Dramatically reduce the window

**Frontend impact**: This is why the first page load feels slower than subsequent
requests — TCP is ramping up its congestion window. Also why large bundles should
be split — TCP can start rendering smaller chunks sooner.

---

## UDP (User Datagram Protocol)

UDP is the "just send it" protocol — fast but unreliable.

### Properties

- **No connection setup**: No handshake, just start sending
- **No guarantee of delivery**: Packets may be lost
- **No ordering**: Packets may arrive out of order
- **No congestion control**: Sender doesn't slow down for the network
- **Low overhead**: Smaller header (8 bytes vs TCP's 20+ bytes)

### When UDP is Used

| Protocol | Why UDP? |
|----------|----------|
| HTTP/3 (QUIC) | QUIC implements its own reliability on top of UDP |
| WebRTC | Real-time audio/video — dropped frames are better than delayed ones |
| DNS | Simple query/response, usually fits in one packet |
| Gaming | Low latency matters more than perfect delivery |

### Why HTTP/3 Uses UDP

HTTP/3 doesn't use raw UDP — it uses QUIC, which adds reliability features
on top of UDP. The advantage is that QUIC can implement stream-level reliability
without TCP's head-of-line blocking problem.

---

## How a Web Request Flows Through All Layers

When you call `fetch('https://api.example.com/data')`:

```
Application Layer (Your Code)
├─ HTTP GET /data
├─ Headers: Authorization, Accept, etc.
└─ Passes down to Transport ↓

Transport Layer (TCP)
├─ Source port: 52431 (random ephemeral)
├─ Destination port: 443 (HTTPS)
├─ Sequence numbers for ordering
├─ TCP header added
└─ Passes down to Internet ↓

Internet Layer (IP)
├─ Source IP: 192.168.1.100 (your machine)
├─ Destination IP: 93.184.216.34 (resolved by DNS)
├─ IP header added
└─ Passes down to Network Access ↓

Network Access Layer (Ethernet/WiFi)
├─ Source MAC: AA:BB:CC:DD:EE:FF (your NIC)
├─ Destination MAC: 11:22:33:44:55:66 (your router)
├─ Ethernet/WiFi frame
└─ Transmitted as electrical signals / radio waves
```

The response travels back up through the layers in reverse order.

---

## NAT and Firewalls

### NAT (Network Address Translation)

Your home router uses NAT to share a single public IP among all your devices:

```
Your devices (private IPs)          Router           Internet
┌─────────────────────┐      ┌──────────────┐
│ Phone:  192.168.1.10│─────>│              │
│ Laptop: 192.168.1.11│─────>│ Public IP:   │────> example.com
│ PC:     192.168.1.12│─────>│ 73.45.22.100 │
└─────────────────────┘      └──────────────┘
```

The router translates private IPs to the public IP and tracks which device
each response belongs to using port numbers.

### Firewalls

Firewalls filter traffic based on rules:
- Block incoming connections to certain ports
- Allow only specific protocols (HTTP, HTTPS)
- Block traffic from suspicious IP addresses

**Frontend relevance**: Firewalls can block WebSocket connections, non-standard
ports, or certain headers — useful to know when debugging "works locally but not
in production" issues.

---

## What Happens When You Type a URL

The complete sequence when you type `https://example.com` and press Enter:

### 1. URL Parsing
- Browser parses the URL: scheme (https), host (example.com), port (443), path (/)

### 2. DNS Resolution (~20-120ms)
- Browser cache → OS cache → Resolver → Root → TLD → Authoritative
- Result: `example.com → 93.184.216.34`

### 3. TCP Connection (~1 RTT, ~10-100ms)
- 3-way handshake: SYN → SYN-ACK → ACK
- Connection established on port 443

### 4. TLS Handshake (~1-2 RTT, ~10-200ms)
- Client Hello → Server Hello + Certificate
- Key exchange → Encrypted connection established
- (TLS 1.3 reduces this to 1 RTT; QUIC can do 0-RTT)

### 5. HTTP Request
- Browser sends: `GET / HTTP/1.1`
- Headers: Host, User-Agent, Accept, Accept-Encoding, Cookie, etc.

### 6. Server Processing
- Server receives request, runs application code
- Generates response (HTML, JSON, etc.)

### 7. HTTP Response
- Server sends: `HTTP/1.1 200 OK`
- Headers: Content-Type, Cache-Control, Set-Cookie, etc.
- Body: HTML content

### 8. Rendering (Frontend Territory)
- Parse HTML → Build DOM
- Parse CSS → Build CSSOM
- Execute JavaScript
- Build render tree → Layout → Paint → Composite

### 9. Subresource Loading
- CSS, JS, images, fonts trigger new requests (steps 2-7 for each domain)
- HTTP/2 multiplexing helps load these in parallel

---

## Frontend Relevance

### What You'll Actually Debug

| Symptom | Layer | Cause |
|---------|-------|-------|
| "Site not loading" | DNS/Internet | DNS misconfigured, server down |
| Slow initial load | Transport | TCP slow start, TLS handshake |
| WebSocket won't connect | Transport/Firewall | Firewall blocking, proxy issue |
| "Connection refused" | Transport | Server not listening on that port |
| "Connection timed out" | Internet | Server unreachable, firewall |
| Works on WiFi, not cellular | Internet | Different network path, NAT issues |

### Performance Implications

1. **TCP slow start** means first load is always slower — split large bundles
2. **DNS lookup per domain** — minimize third-party domains
3. **TLS handshake** — use HTTP/2+ to amortize over multiplexed streams
4. **Round trips matter** — use CDN to reduce physical distance
5. **Connection reuse** — keep-alive, connection pooling in HTTP clients

### Key Takeaways

1. TCP/IP has 4 layers: Application, Transport, Internet, Network Access
2. TCP provides reliable delivery with a 3-way handshake (adds latency)
3. UDP is fast but unreliable — used by HTTP/3 (QUIC) and WebRTC
4. Ports identify applications — 80 (HTTP), 443 (HTTPS), 3000 (dev server)
5. Private IPs (192.168.x.x) are translated by NAT routers to public IPs
6. A web request involves: DNS → TCP → TLS → HTTP → Render
7. Each step adds latency — understanding this helps you optimize
