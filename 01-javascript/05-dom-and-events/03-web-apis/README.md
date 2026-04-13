# Web APIs

Modern JavaScript provides built-in Web APIs for networking, data manipulation, storage, and DOM observation. Many originated in browsers but are now available in Node.js (v18+), including `fetch`, `URL`, `URLSearchParams`, `AbortController`, `structuredClone`, `Blob`, `TextEncoder`, and `TextDecoder`.

---

## 1. Fetch API — Basic Usage

The Fetch API provides a modern, promise-based way to make HTTP requests, replacing the older `XMLHttpRequest`.

```js
const response = await fetch("https://api.example.com/users");
const data = await response.json();
```

`fetch()` returns a `Promise<Response>`. The promise resolves when the server responds with **headers** — it does NOT wait for the body. The promise only rejects on **network failures**, NOT on HTTP error codes like 404 or 500.

### Request and Headers objects

```js
const request = new Request("https://api.example.com/users", {
  method: "GET",
  headers: new Headers({ "Accept": "application/json" }),
});
const response = await fetch(request);

// Headers API
const headers = new Headers();
headers.set("Content-Type", "application/json");
headers.has("Content-Type"); // true
headers.get("Content-Type"); // "application/json"
```

---

## 2. Fetch Options

```js
const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice" }),
  signal: controller.signal,  // AbortSignal for cancellation
  redirect: "follow",         // "follow" | "error" | "manual"
  mode: "cors",               // browser only
  credentials: "same-origin", // browser only
});
```

| Option        | Description                                    |
| ------------- | ---------------------------------------------- |
| `method`      | HTTP method (default: `"GET"`)                 |
| `headers`     | Request headers (object or `Headers`)          |
| `body`        | Request body (not allowed with GET/HEAD)       |
| `signal`      | `AbortSignal` to cancel the request            |
| `redirect`    | How to handle redirects                        |

---

## 3. Response Object

```js
const response = await fetch(url);

response.ok;         // true if status is 200-299
response.status;     // HTTP status code (200, 404, etc.)
response.statusText; // "OK", "Not Found", etc.

// Body methods — each returns a promise, body can only be consumed ONCE
const json = await response.json();
const text = await response.text();
const blob = await response.blob();
const buffer = await response.arrayBuffer();

// Use clone() to read body multiple times
const clone = response.clone();
```

---

## 4. Error Handling with Fetch

**`fetch` does NOT reject on HTTP errors** (404, 500). It only rejects on network-level failures.

```js
// WRONG — doesn't catch 404/500
try {
  const data = await (await fetch("/api/users")).json();
} catch (err) { /* only network errors */ }

// CORRECT — check response.ok
const response = await fetch("/api/users");
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
const data = await response.json();
```

Three error types to handle: **network errors** (promise rejects), **HTTP errors** (check `response.ok`), **parse errors** (`response.json()` on invalid JSON).

---

## 5. AbortController — Cancelling Requests

```js
const controller = new AbortController();
const promise = fetch(url, { signal: controller.signal });
controller.abort(); // cancel the request

try {
  await promise;
} catch (err) {
  if (err instanceof DOMException && err.name === "AbortError") {
    console.log("Request aborted");
  }
}
```

### Timeout pattern

```js
async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Or use the built-in (Node 18+):
const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

One signal can cancel **multiple** requests:

```js
const controller = new AbortController();
const [users, posts] = await Promise.all([
  fetch("/api/users", { signal: controller.signal }),
  fetch("/api/posts", { signal: controller.signal }),
]);
// controller.abort() cancels BOTH
```

---

## 6. Sending Data — POST with JSON, FormData, URL-encoded

```js
// JSON
await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", age: 30 }),
});

// URL-encoded
const params = new URLSearchParams({ name: "Alice", age: "30" });
await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString(), // "name=Alice&age=30"
});

// FormData (browser — Content-Type set automatically to multipart/form-data)
const form = new FormData();
form.append("name", "Alice");
form.append("avatar", fileInput.files[0]);
await fetch("/api/users", { method: "POST", body: form });
```

---

## 7. URL and URLSearchParams

### URL — Parsing and Constructing

```js
const url = new URL("https://example.com:8080/path?name=Alice&age=30#section");

url.protocol;   // "https:"
url.hostname;   // "example.com"
url.port;       // "8080"
url.pathname;   // "/path"
url.search;     // "?name=Alice&age=30"
url.hash;       // "#section"
url.origin;     // "https://example.com:8080"

// Relative URLs with base
const api = new URL("/api/users", "https://example.com");
// "https://example.com/api/users"
```

### URLSearchParams

```js
const params = new URLSearchParams("a=1&b=2&a=3");
params.get("a");      // "1" (first value)
params.getAll("a");   // ["1", "3"]
params.has("b");      // true

params.set("a", "99");     // replaces ALL "a" entries
params.append("c", "new"); // adds new entry
params.delete("b");        // removes ALL "b" entries
params.sort();              // sort by key
params.toString();          // "a=99&c=new"

// Use with URL
const url = new URL("https://api.example.com/search");
url.searchParams.set("q", "javascript");
url.searchParams.set("page", "1");
console.log(url.href); // "https://api.example.com/search?q=javascript&page=1"
```

Encoding is handled automatically: `"hello world & goodbye"` → `"hello+world+%26+goodbye"`.

---

## 8. localStorage and sessionStorage (Browser Only)

Synchronous key-value storage (strings only).

| Feature            | localStorage            | sessionStorage             |
| ------------------ | ----------------------- | -------------------------- |
| Persistence        | Until cleared           | Until tab closed           |
| Shared across tabs | Yes                     | No                         |
| Size limit         | ~5-10 MB                | ~5-10 MB                   |

```js
localStorage.setItem("name", "Alice");
localStorage.getItem("name");    // "Alice"
localStorage.getItem("unknown"); // null
localStorage.removeItem("name");
localStorage.clear();
localStorage.length;             // number of items
localStorage.key(0);             // key at index 0

// Objects must be serialized
localStorage.setItem("user", JSON.stringify({ name: "Alice" }));
const user = JSON.parse(localStorage.getItem("user")!);
```

The `storage` event fires in **other tabs** of the same origin when localStorage changes.

---

## 9. JSON Serialization

### JSON.stringify — Values that are skipped or converted

```js
JSON.stringify(undefined);        // undefined (JS undefined, not a string)
JSON.stringify({ a: undefined }); // '{}' — undefined properties OMITTED
JSON.stringify([1, undefined, 3]); // '[1,null,3]' — becomes null in arrays
JSON.stringify(NaN);              // 'null'
JSON.stringify(Infinity);         // 'null'
```

### Replacer parameter

```js
// Array — whitelist of keys
JSON.stringify({ a: 1, b: 2, c: 3 }, ["a", "c"]); // '{"a":1,"c":3}'

// Function — transform values
JSON.stringify({ name: "Alice", pw: "secret" }, (key, value) => {
  if (key === "pw") return undefined; // omit
  return value;
}); // '{"name":"Alice"}'
```

### toJSON method

```js
const obj = {
  name: "Alice",
  toJSON() { return { user: this.name }; },
};
JSON.stringify(obj); // '{"user":"Alice"}'
// toJSON() is called BEFORE the replacer
```

Note: `Date` has a built-in `toJSON()` returning an ISO string.

### JSON.parse with reviver

```js
JSON.parse('{"created":"2024-01-15T10:30:00.000Z"}', (key, value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
});
```

### Circular references

`JSON.stringify` throws `TypeError` on circular references.

---

## 10. structuredClone — Deep Cloning

`structuredClone()` creates a deep copy preserving types that JSON round-trip loses:

```js
const original = {
  date: new Date(), pattern: /hello/gi,
  data: new Map([["k", "v"]]), nested: { deep: 42 },
};
const clone = structuredClone(original);
clone.nested.deep = 99;
original.nested.deep; // 42 (unchanged)
clone.date instanceof Date;   // true (preserved)
clone.data instanceof Map;    // true (preserved)
```

Handles **circular references** (JSON.stringify would throw):

```js
const obj = { name: "circular" };
obj.self = obj;
const clone = structuredClone(obj);
clone.self === clone; // true (circular ref preserved in clone)
```

**Cannot clone**: functions, DOM nodes, symbols, property descriptors, prototype chains.

### structuredClone vs JSON round-trip

| Feature             | `structuredClone`   | `JSON.parse(JSON.stringify)` |
| ------------------- | ------------------- | ---------------------------- |
| Circular references | Yes                 | Throws TypeError             |
| Date                | Preserved as Date   | Becomes string               |
| RegExp              | Preserved           | Becomes `{}`                 |
| Map / Set           | Preserved           | Becomes `{}`                 |
| undefined           | Preserved           | Omitted (in objects)         |
| NaN / Infinity      | Preserved           | Becomes `null`               |
| Functions           | Throws error        | Omitted                      |

---

## 11. Blob and File

### Blob — Binary Large Object (Node.js 18+)

```js
const blob = new Blob(["Hello, ", "world!"], { type: "text/plain" });
blob.size; // 13
blob.type; // "text/plain"

const text = await blob.text();
const buffer = await blob.arrayBuffer();
const slice = blob.slice(0, 5); // returns new Blob
```

### File (browser only)

`File` extends `Blob` with `name` and `lastModified`.

### FileReader (browser only)

Reads file/blob contents asynchronously via callbacks: `readAsText()`, `readAsDataURL()`, `readAsArrayBuffer()`. The `onload` event provides the result.

---

## 12. IntersectionObserver (Browser Only)

Watches when elements enter or leave the viewport. Used for lazy loading, infinite scroll, analytics.

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target;           // the observed element
    entry.isIntersecting;   // true if visible
    entry.intersectionRatio; // 0.0 to 1.0
  });
}, {
  root: null,              // viewport (default)
  rootMargin: "0px",       // margin around root
  threshold: [0, 0.5, 1], // fire at 0%, 50%, 100% visibility
});

observer.observe(element);
observer.unobserve(element);
observer.disconnect();
```

---

## 13. MutationObserver (Browser Only)

Watches for DOM tree changes (child nodes, attributes, text content):

```js
const observer = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    m.type;          // "childList" | "attributes" | "characterData"
    m.target;        // the node that changed
    m.addedNodes;    // added children
    m.removedNodes;  // removed children
    m.attributeName; // changed attribute
    m.oldValue;      // previous value (if configured)
  });
});

observer.observe(document.body, {
  childList: true, attributes: true, subtree: true,
  attributeOldValue: true,
  attributeFilter: ["class", "style"],
});

observer.disconnect();
const pending = observer.takeRecords(); // get pending mutations
```

---

## 14. Performance API (Brief)

```js
const start = performance.now(); // high-resolution timestamp (ms)
// ... work ...
console.log(`Took ${performance.now() - start}ms`);

// User Timing API
performance.mark("start");
performance.mark("end");
performance.measure("duration", "start", "end");
performance.getEntriesByName("duration")[0].duration;
```

Available in Node.js via `perf_hooks` module or globally (Node 16+).

---

## 15. Encoding API — TextEncoder and TextDecoder

```js
const encoder = new TextEncoder();  // always UTF-8
const encoded = encoder.encode("Hello"); // Uint8Array [72, 101, 108, 108, 111]
encoder.encode("😀").byteLength;         // 4 (multi-byte)

const decoder = new TextDecoder();  // defaults to UTF-8
decoder.decode(new Uint8Array([72, 101, 108, 108, 111])); // "Hello"

// Round-trip
const original = "Hello, 世界! 🌍";
decoder.decode(encoder.encode(original)) === original; // true
```

---

## Summary

| API                    | Purpose                    | Node.js 18+ |
| ---------------------- | -------------------------- | ----------- |
| `fetch`                | HTTP requests              | Yes         |
| `Request` / `Response` | Request/response objects   | Yes         |
| `Headers`              | HTTP headers               | Yes         |
| `AbortController`      | Cancel async operations    | Yes         |
| `URL`                  | Parse/construct URLs       | Yes         |
| `URLSearchParams`      | Manipulate query strings   | Yes         |
| `structuredClone`      | Deep copy objects          | Yes         |
| `Blob`                 | Binary data                | Yes         |
| `TextEncoder/Decoder`  | String ↔ binary encoding   | Yes         |
| `localStorage`         | Persistent key-value store | No (browser)|
| `sessionStorage`       | Session key-value store    | No (browser)|
| `IntersectionObserver` | Element visibility         | No (browser)|
| `MutationObserver`     | DOM change detection       | No (browser)|
| `FileReader`           | Read file/blob contents    | No (browser)|
| `performance`          | High-resolution timing     | Yes         |

---

## References

- [javascript.info — Fetch](https://javascript.info/fetch)
- [javascript.info — URL objects](https://javascript.info/url)
- [javascript.info — FormData](https://javascript.info/formdata)
- [MDN — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN — URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [MDN — AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN — structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [MDN — IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
- [MDN — MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [MDN — Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [MDN — localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
