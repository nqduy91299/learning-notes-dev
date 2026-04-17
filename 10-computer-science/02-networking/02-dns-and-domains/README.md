# DNS & Domains

## Table of Contents

1. [What is DNS](#what-is-dns)
2. [DNS Resolution Process](#dns-resolution-process)
3. [DNS Record Types](#dns-record-types)
4. [TTL (Time To Live)](#ttl-time-to-live)
5. [Domain Structure](#domain-structure)
6. [Domain Registration](#domain-registration)
7. [CDN and DNS](#cdn-and-dns)
8. [Frontend Performance: dns-prefetch and preconnect](#frontend-performance-dns-prefetch-and-preconnect)
9. [Common DNS Issues](#common-dns-issues)
10. [Frontend Relevance](#frontend-relevance)

---

## What is DNS

DNS (Domain Name System) is the "phone book" of the internet. It translates
human-readable domain names (like `google.com`) into IP addresses (like `142.250.80.46`)
that computers use to identify each other.

Without DNS, you'd have to memorize IP addresses to visit websites.

### Why Frontend Developers Should Care

- **Performance**: DNS lookup adds latency to every new domain your page contacts
- **Third-party scripts**: Each analytics, font, or CDN domain requires a DNS lookup
- **Debugging**: Understanding DNS helps you diagnose "site not loading" issues
- **Deployment**: You'll configure DNS records when deploying to custom domains

---

## DNS Resolution Process

When you type `www.example.com` in the browser, here's what happens:

```
1. Browser Cache
   └─ Hit? → Use cached IP
   └─ Miss? ↓

2. OS Cache (system resolver)
   └─ Hit? → Use cached IP
   └─ Miss? ↓

3. Recursive Resolver (usually your ISP or 8.8.8.8)
   └─ Has it cached? → Return IP
   └─ No? → Start recursive lookup ↓

4. Root Name Servers (13 globally, e.g., a.root-servers.net)
   └─ "I don't know example.com, but .com TLD is handled by these servers"
   └─ Returns TLD server addresses ↓

5. TLD Name Servers (.com, .org, .io, etc.)
   └─ "I don't know example.com, but its authoritative NS is ns1.example.com"
   └─ Returns authoritative server addresses ↓

6. Authoritative Name Server (ns1.example.com)
   └─ "example.com points to 93.184.216.34"
   └─ Returns the IP address ↓

7. Recursive resolver caches the result (respecting TTL)
   └─ Returns IP to browser

8. Browser caches the result
   └─ Connects to 93.184.216.34
```

### Key Points

- The full lookup only happens on the first visit (or after cache expires)
- Subsequent requests use cached results at various levels
- Typical DNS lookup takes 20-120ms
- Each new third-party domain on your page adds a DNS lookup

---

## DNS Record Types

### A Record (Address)

Maps a domain to an IPv4 address.

```
example.com.    A    93.184.216.34
```

The most fundamental record type. When you "point a domain to a server," you're
usually creating an A record.

### AAAA Record (IPv6 Address)

Maps a domain to an IPv6 address.

```
example.com.    AAAA    2606:2800:220:1:248:1893:25c8:1946
```

### CNAME Record (Canonical Name)

Creates an alias from one domain to another.

```
www.example.com.    CNAME    example.com.
blog.example.com.   CNAME    my-blog.netlify.app.
```

**Important**: CNAME causes an additional DNS lookup (resolving the alias).
Cannot be used at the zone apex (bare domain like `example.com`).

**Frontend relevance**: When deploying to Netlify, Vercel, or similar platforms,
you typically create a CNAME pointing your subdomain to their servers.

### MX Record (Mail Exchange)

Specifies mail servers for the domain.

```
example.com.    MX    10 mail.example.com.
example.com.    MX    20 backup-mail.example.com.
```

The number is priority — lower = preferred.

### TXT Record (Text)

Stores arbitrary text. Used for verification and security.

```
example.com.    TXT    "v=spf1 include:_spf.google.com ~all"
example.com.    TXT    "google-site-verification=abc123..."
```

**Frontend relevance**: You'll add TXT records to verify domain ownership
for services like Google Search Console, email providers, or SSL certificates.

### NS Record (Name Server)

Specifies which name servers are authoritative for the domain.

```
example.com.    NS    ns1.example.com.
example.com.    NS    ns2.example.com.
```

### SOA Record (Start of Authority)

Contains administrative information about the zone (primary NS, admin email, serial
number, refresh intervals). You rarely interact with this directly.

---

## TTL (Time To Live)

TTL is the number of seconds a DNS record should be cached before re-querying.

```
example.com.    300    A    93.184.216.34
                 ↑
                TTL = 5 minutes
```

### Common TTL Values

| TTL | Duration | Use Case |
|-----|----------|----------|
| 60 | 1 minute | During migrations — quick failover |
| 300 | 5 minutes | Dynamic services, frequently changing IPs |
| 3600 | 1 hour | Standard for most records |
| 86400 | 1 day | Stable records that rarely change |

### Frontend Implications

- **Lower TTL** = more DNS lookups = slightly more latency
- **Higher TTL** = fewer lookups but slower propagation when you change records
- Before a migration, lower TTL in advance so the change propagates faster

---

## Domain Structure

```
    https://blog.example.com:443/path
            │     │       │
            │     │       └── TLD (Top-Level Domain)
            │     └────────── SLD (Second-Level Domain) / "domain"
            └──────────────── Subdomain
```

### TLD Types

- **Generic (gTLD)**: `.com`, `.org`, `.net`, `.io`, `.dev`, `.app`
- **Country Code (ccTLD)**: `.uk`, `.de`, `.jp`, `.vn`
- **Sponsored (sTLD)**: `.edu`, `.gov`, `.mil`
- **New gTLDs**: `.tech`, `.blog`, `.xyz`

### Subdomains

- `www.example.com` — `www` is a subdomain (not required)
- `api.example.com` — common for API endpoints
- `staging.example.com` — common for staging environments
- `cdn.example.com` — common for CDN assets

You can have multiple levels: `us-east.api.example.com`

---

## Domain Registration

- Domains are registered through **registrars** (Namecheap, Google Domains, Cloudflare)
- Registration is essentially leasing the right to use a domain name
- You pay annually (or for multiple years)
- ICANN (Internet Corporation for Assigned Names and Numbers) oversees the system
- **WHOIS** is the public database of domain registration info

### Frontend Developer Actions

When deploying a project to a custom domain:

1. Buy domain from a registrar
2. Point nameservers to your hosting provider (or use their DNS)
3. Create A record → your server IP, or CNAME → hosting platform
4. Configure SSL/TLS (often automatic with Let's Encrypt)
5. Wait for DNS propagation

---

## CDN and DNS

CDNs (Content Delivery Networks) like Cloudflare, Fastly, and AWS CloudFront use
DNS to route users to the nearest edge server.

### How It Works

1. Your domain's DNS is managed by the CDN (e.g., Cloudflare nameservers)
2. When a user makes a DNS request, the CDN's DNS server knows the user's
   approximate location (from the resolver's IP)
3. It returns the IP of the nearest edge server (geographic routing)
4. The user connects to a server physically close to them — reducing latency

### Anycast

Many CDNs use **Anycast** — the same IP address is advertised from multiple locations.
The network routes the user to the nearest one automatically.

```
User in Tokyo   → 104.16.132.229 → Tokyo edge server
User in London  → 104.16.132.229 → London edge server
User in New York → 104.16.132.229 → New York edge server
(Same IP, different physical servers)
```

---

## Frontend Performance: dns-prefetch and preconnect

### dns-prefetch

Tells the browser to resolve DNS for a domain before it's needed:

```html
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://cdn.analytics.com">
```

- Saves 20-120ms per domain
- No downside — it's a hint, browser can ignore it
- Use for domains that appear later in the page load

### preconnect

Goes further — resolves DNS AND establishes TCP + TLS connections:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

- Saves DNS + TCP + TLS time (~100-300ms)
- Use sparingly (2-4 domains max) — each connection costs resources
- Use for critical third-party origins (fonts, API servers)

### When to Use Each

| Technique | When to Use |
|-----------|-------------|
| `dns-prefetch` | Third-party domains used later in the page |
| `preconnect` | Critical third-party domains used early (fonts, main API) |

---

## Common DNS Issues

### Propagation Delay

When you change DNS records, the old values may be cached worldwide.

- **Not actual propagation** — it's cache expiration at different resolvers
- Can take minutes to 48 hours depending on TTL
- Use `dig` or `nslookup` to check current records
- Use [dnschecker.org](https://dnschecker.org) to check global propagation

### NXDOMAIN (Non-Existent Domain)

The DNS response when a domain doesn't exist:

- Typo in the domain name
- Domain registration expired
- DNS records not configured yet

### DNS Poisoning / Spoofing

An attacker inserts fake DNS records into a resolver's cache, redirecting users
to malicious servers. DNSSEC (DNS Security Extensions) helps prevent this.

### Too Many DNS Lookups

Each third-party domain on your page requires a DNS lookup:

- Google Analytics, Google Fonts, CDN, social widgets, ads...
- Each lookup adds 20-120ms
- Reduce by: self-hosting fonts, consolidating CDN origins, removing unnecessary scripts

---

## Frontend Relevance

### What You'll Actually Do

1. **Configure DNS** when deploying to custom domains (Vercel, Netlify, AWS)
2. **Add `dns-prefetch`/`preconnect`** to optimize third-party resource loading
3. **Debug DNS issues** when "the site is down" after a DNS change
4. **Add TXT records** for domain verification (Google, email providers)
5. **Understand CDN routing** when choosing a CDN or debugging latency

### Quick Reference: DNS Debugging Commands

```bash
# Look up A record
dig example.com A

# Look up any record type
dig example.com CNAME
dig example.com MX
dig example.com TXT

# Trace the full resolution path
dig +trace example.com

# Check with a specific DNS resolver
dig @8.8.8.8 example.com

# Simple lookup
nslookup example.com
```

### Key Takeaways

1. DNS translates domain names to IP addresses
2. DNS lookups are cached at multiple levels (browser, OS, resolver)
3. TTL controls how long records are cached — lower before migrations
4. Use `dns-prefetch` and `preconnect` to reduce third-party latency
5. CNAME for subdomains pointing to hosting platforms; A records for IPs
6. CDNs use DNS for geographic routing to reduce latency
7. DNS propagation is really cache expiration — it takes time
