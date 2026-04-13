// ============================================================================
// 03-web-apis: Solutions
// ============================================================================
// Compare these with your answers in exercises.ts.
// Each solution includes an explanation referencing the README concepts.
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: URL parsing

function solution1() {
  const url = new URL("https://example.com:3000/api/users?name=Alice&role=admin#section");

  console.log(url.protocol);  // "https:"
  console.log(url.hostname);  // "example.com"
  console.log(url.port);      // "3000"
  console.log(url.pathname);  // "/api/users"
  console.log(url.search);    // "?name=Alice&role=admin"
  console.log(url.hash);      // "#section"
}

// ANSWER:
// Log 1: "https:"          — protocol includes the trailing colon
// Log 2: "example.com"     — hostname without port
// Log 3: "3000"            — port as string
// Log 4: "/api/users"      — path portion
// Log 5: "?name=Alice&role=admin" — includes the leading "?"
// Log 6: "#section"        — includes the leading "#"
//
// Explanation:
// The URL constructor parses a URL string into its component parts.
// Note that protocol includes ":", search includes "?", hash includes "#".
// See README → Section 7: URL and URLSearchParams

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: URLSearchParams behavior

function solution2() {
  const params = new URLSearchParams("a=1&b=2&a=3");

  console.log(params.get("a"));      // "1"
  console.log(params.getAll("a"));   // ["1", "3"]
  console.log(params.has("b"));      // true
  console.log(params.has("c"));      // false

  params.set("a", "99");
  console.log(params.getAll("a"));   // ["99"]
  console.log(params.toString());    // "a=99&b=2"
}

// ANSWER:
// Log 1: "1"        — get() returns the FIRST value for a key
// Log 2: ["1", "3"] — getAll() returns ALL values as an array
// Log 3: true
// Log 4: false
// Log 5: ["99"]     — set() REPLACES all existing values for that key
// Log 6: "a=99&b=2" — the duplicate "a=3" was removed by set()
//
// Explanation:
// URLSearchParams handles duplicate keys. get() returns the first,
// getAll() returns all. set() replaces ALL values for a key with one value.
// See README → Section 7: URL and URLSearchParams

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: JSON.stringify edge cases

function solution3() {
  console.log(JSON.stringify(undefined));                  // undefined
  console.log(JSON.stringify({ a: undefined, b: 2 }));    // '{"b":2}'
  console.log(JSON.stringify([1, undefined, 3]));          // '[1,null,3]'
  console.log(JSON.stringify(NaN));                        // 'null'
  console.log(JSON.stringify(Infinity));                   // 'null'
}

// ANSWER:
// Log 1: undefined  — bare undefined returns JS undefined (not a string)
// Log 2: '{"b":2}'  — undefined properties are OMITTED from objects
// Log 3: '[1,null,3]' — undefined in arrays becomes null
// Log 4: 'null'     — NaN becomes "null" in JSON
// Log 5: 'null'     — Infinity becomes "null" in JSON
//
// Explanation:
// JSON has no representation for undefined, NaN, or Infinity.
// - Top-level undefined → returns JS undefined (not a valid JSON value)
// - In objects: undefined/functions/symbols are omitted
// - In arrays: they become null (to preserve indices)
// - NaN and Infinity → "null"
// See README → Section 9: JSON serialization

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: JSON.stringify with replacer and toJSON

function solution4() {
  const data = {
    name: "Alice",
    age: 30,
    password: "secret",
    toJSON() {
      return { user: this.name, years: this.age };
    },
  };

  console.log(JSON.stringify(data));
  // '{"user":"Alice","years":30}'

  console.log(JSON.stringify(data, ["name", "age"]));
  // '{}'

  const data2 = { x: 1, y: 2, z: 3 };
  console.log(JSON.stringify(data2, (key, value) => {
    if (key === "") return value;  // root object
    return typeof value === "number" ? value * 10 : value;
  }));
  // '{"x":10,"y":20,"z":30}'
}

// ANSWER:
// Log 1: '{"user":"Alice","years":30}'
// Log 2: '{}'
// Log 3: '{"x":10,"y":20,"z":30}'
//
// Explanation:
// - toJSON() is called FIRST, before the replacer. It transforms the object
//   into { user: "Alice", years: 30 }.
// - For Log 2, the array replacer ["name", "age"] acts as a key whitelist.
//   Since toJSON() already transformed the keys to "user" and "years",
//   neither matches "name" or "age", so all properties are excluded → '{}'.
// - For Log 3, the function replacer receives key="" for the root object
//   (which we return as-is), then multiplies each number property by 10.
// See README → Section 9: JSON serialization (toJSON, replacer)

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: structuredClone vs JSON round-trip

function solution5() {
  const original = {
    date: new Date("2024-01-15T00:00:00.000Z"),
    regex: /hello/gi,
    undef: undefined,
    nan: NaN,
    map: new Map([["key", "value"]]),
  };

  // JSON round-trip
  const jsonClone = JSON.parse(JSON.stringify(original));
  console.log(jsonClone.date instanceof Date);                                    // false
  console.log(typeof jsonClone.regex === "object" && !(jsonClone.regex instanceof RegExp)); // true
  console.log("undef" in jsonClone);                                              // false
  console.log(jsonClone.nan === null);                                            // true

  // structuredClone
  const scClone = structuredClone(original);
  console.log(scClone.date instanceof Date);      // true
  console.log(scClone.regex instanceof RegExp);   // true
  console.log("undef" in scClone);                // true
  console.log(Number.isNaN(scClone.nan));         // true
}

// ANSWER:
// Log 1 (JSON — date instanceof Date): false — becomes a string
// Log 2 (JSON — regex is plain object): true — RegExp becomes {}
// Log 3 (JSON — "undef" in clone): false — undefined properties are omitted
// Log 4 (JSON — nan is null): true — NaN becomes null in JSON
// Log 5 (SC — date instanceof Date): true — structuredClone preserves Date
// Log 6 (SC — regex instanceof RegExp): true — structuredClone preserves RegExp
// Log 7 (SC — "undef" in clone): true — structuredClone preserves undefined
// Log 8 (SC — nan is NaN): true — structuredClone preserves NaN
//
// Explanation:
// JSON round-trip loses type information: Date→string, RegExp→{}, undefined→omitted,
// NaN→null. structuredClone uses the structured clone algorithm which preserves
// these types faithfully.
// See README → Section 10: structuredClone

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: structuredClone with circular references

function solution6() {
  const obj: Record<string, unknown> = { name: "circular" };
  obj.self = obj;

  const clone = structuredClone(obj);

  console.log(clone !== obj);                                // true
  console.log(clone.self === clone);                         // true
  console.log(clone.self === obj);                           // false
  console.log((clone.self as Record<string, unknown>).name); // "circular"
}

// ANSWER:
// Log 1: true  — clone is a different object
// Log 2: true  — circular reference is preserved (points to clone, not original)
// Log 3: false — clone.self points to clone, not to the original obj
// Log 4: "circular" — the name property was cloned
//
// Explanation:
// structuredClone correctly handles circular references. The cloned object's
// self-reference points to the clone itself, not the original.
// JSON.stringify would throw TypeError on circular references.
// See README → Section 10: structuredClone

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: Fetch error handling

type MockResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
};

function solution7_mockFetch(url: string): Promise<MockResponse> {
  if (url.includes("success")) {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({ data: "hello" }),
    });
  }
  return Promise.resolve({
    ok: false,
    status: 404,
    statusText: "Not Found",
    json: () => Promise.resolve({ error: "not found" }),
  });
}

async function solution7_fetchData(url: string): Promise<unknown> {
  // FIX: Check response.ok before reading the body
  const response = await solution7_mockFetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Explanation:
// fetch() does NOT reject on HTTP errors (4xx, 5xx). It only rejects on
// network failures. You must always check response.ok or response.status
// to detect HTTP errors.
// See README → Section 4: Error Handling with Fetch

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: URL construction

function solution8_buildUrl(
  base: string,
  path: string,
  params: Record<string, string>
): string {
  // FIX: Use URL and URLSearchParams for proper encoding
  const url = new URL(path, base);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, value);
  }

  url.search = searchParams.toString();
  return url.href;
}

// Explanation:
// Manual string concatenation doesn't encode special characters like spaces
// and ampersands. URL and URLSearchParams handle encoding automatically.
// "hello world" → "hello+world", "books&movies" → "books%26movies"
// See README → Section 7: URL and URLSearchParams

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: JSON.parse with reviver for dates

function solution9_parseWithDates(json: string): unknown {
  // FIX: Check ALL string values for ISO date format, not just key === "date"
  return JSON.parse(json, (_key, value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  });
}

// Explanation:
// The original reviver only checked for key === "date", missing keys like
// "createdAt" and "updatedAt". The fix checks ALL string values against
// an ISO date regex pattern, converting any matching string to a Date.
// See README → Section 9: JSON serialization (reviver)

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: AbortController usage

async function solution10_fetchWithTimeout(
  url: string,
  timeoutMs: number,
  mockFetch: (url: string, opts: { signal: AbortSignal }) => Promise<{ text: () => Promise<string> }>
): Promise<string> {
  const controller = new AbortController();
  // FIX: Save the timeout ID so we can clear it
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await mockFetch(url, { signal: controller.signal });
    return await response.text();
  } finally {
    // FIX: Always clear the timeout to prevent leaks
    clearTimeout(timeoutId);
  }
}

// Explanation:
// The original code never cleared the timeout, causing potential memory leaks
// and unexpected abort calls after the request completes. Using try/finally
// ensures the timeout is always cleared, whether the request succeeds or fails.
// See README → Section 5: AbortController

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: localStorage simulation

class Solution11_LocalStorageSim {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

// Explanation:
// localStorage stores string key-value pairs. We use a Map for the backing
// store, converting values to strings with String(). key() returns the key
// at a given index (insertion order for Map), or null if out of range.
// See README → Section 8: localStorage and sessionStorage

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Retry fetch with exponential backoff

async function solution12_retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelayMs: number
): Promise<T> {
  let delay = initialDelayMs;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }
  }

  throw lastError;
}

// Explanation:
// The function attempts to call fn(). On failure, it waits for an increasing
// delay (doubling each time) before retrying. After exhausting maxRetries,
// it throws the last error. The loop runs maxRetries + 1 times total
// (initial attempt + retries).
// See README → Section 4: Error Handling with Fetch, Section 5: AbortController

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: AbortController timeout wrapper

async function solution13_withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fn(controller.signal);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Explanation:
// Create an AbortController and a timeout that aborts after timeoutMs.
// Pass the signal to the async function so it can respond to abort.
// Always clear the timeout in the finally block to prevent leaks.
// If the timeout fires before fn() resolves, the AbortError propagates.
// See README → Section 5: AbortController

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: URL query string builder

function solution14_buildUrl(
  base: string,
  params: Record<string, string | number | boolean | string[] | undefined>
): string {
  const url = new URL(base);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue; // skip undefined

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, item);
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  return url.href;
}

// Explanation:
// Use URL and URLSearchParams for proper encoding and construction.
// - Skip undefined values entirely
// - For arrays, use append() to add multiple values with the same key
// - For primitives, convert to string and use set()
// See README → Section 7: URL and URLSearchParams

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: IntersectionObserver simulation

interface SimEntry {
  target: string;
  position: number;
  isIntersecting: boolean;
}

type SimCallback = (entries: SimEntry[]) => void;

class Solution15_IntersectionSim {
  private callback: SimCallback;
  private viewportStart: number;
  private viewportEnd: number;
  private elements: Map<string, { position: number; wasIntersecting: boolean }> = new Map();

  constructor(callback: SimCallback, viewportStart: number, viewportEnd: number) {
    this.callback = callback;
    this.viewportStart = viewportStart;
    this.viewportEnd = viewportEnd;
  }

  observe(id: string, position: number): void {
    const isIntersecting = position >= this.viewportStart && position <= this.viewportEnd;
    this.elements.set(id, { position, wasIntersecting: isIntersecting });
  }

  unobserve(id: string): void {
    this.elements.delete(id);
  }

  setViewport(start: number, end: number): void {
    this.viewportStart = start;
    this.viewportEnd = end;

    const changedEntries: SimEntry[] = [];

    for (const [id, data] of this.elements) {
      const isIntersecting = data.position >= start && data.position <= end;

      if (isIntersecting !== data.wasIntersecting) {
        changedEntries.push({
          target: id,
          position: data.position,
          isIntersecting,
        });
        data.wasIntersecting = isIntersecting;
      }
    }

    if (changedEntries.length > 0) {
      this.callback(changedEntries);
    }
  }
}

// Explanation:
// This simulates IntersectionObserver's core behavior:
// - observe() registers elements with their positions and initial intersection state
// - setViewport() recalculates intersection for all elements
// - Only elements whose intersection status CHANGED are reported to the callback
// - unobserve() removes an element from tracking
// See README → Section 12: IntersectionObserver

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: MutationObserver simulation

interface SimMutation {
  type: "set" | "delete";
  target: Record<string, unknown>;
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

type MutationSimCallback = (mutations: SimMutation[]) => void;

class Solution16_MutationSim {
  private callback: MutationSimCallback;
  private observedTargets: Set<Record<string, unknown>> = new Set();
  private pendingMutations: SimMutation[] = [];

  constructor(callback: MutationSimCallback) {
    this.callback = callback;
  }

  observe(target: Record<string, unknown>): void {
    this.observedTargets.add(target);
  }

  disconnect(): void {
    this.observedTargets.clear();
    this.pendingMutations = [];
  }

  set(target: Record<string, unknown>, property: string, value: unknown): void {
    if (!this.observedTargets.has(target)) return;

    const oldValue = target[property];
    this.pendingMutations.push({
      type: "set",
      target,
      property,
      oldValue,
      newValue: value,
    });
    target[property] = value;
  }

  deleteProperty(target: Record<string, unknown>, property: string): void {
    if (!this.observedTargets.has(target)) return;

    const oldValue = target[property];
    this.pendingMutations.push({
      type: "delete",
      target,
      property,
      oldValue,
      newValue: undefined,
    });
    delete target[property];
  }

  flush(): void {
    if (this.pendingMutations.length > 0) {
      const mutations = [...this.pendingMutations];
      this.pendingMutations = [];
      this.callback(mutations);
    }
  }
}

// Explanation:
// This simulates MutationObserver's batched notification pattern:
// - observe() registers a target object for tracking
// - set() and deleteProperty() record mutations and apply changes
// - flush() delivers all pending mutations to the callback at once
// - disconnect() stops observation and clears pending mutations
// Real MutationObserver batches mutations and delivers them asynchronously
// via microtask; our flush() simulates that delivery.
// See README → Section 13: MutationObserver

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Blob and TextEncoder/TextDecoder

async function solution17_blobRoundTrip(
  input: string
): Promise<{ blob: Blob; byteLength: number; decoded: string; matches: boolean }> {
  const blob = new Blob([input], { type: "text/plain" });
  const buffer = await blob.arrayBuffer();
  const decoder = new TextDecoder();
  const decoded = decoder.decode(buffer);

  return {
    blob,
    byteLength: buffer.byteLength,
    decoded,
    matches: decoded === input,
  };
}

// Explanation:
// 1. Create a Blob from the string (Blob stores raw bytes, UTF-8 by default)
// 2. Read the blob to an ArrayBuffer with blob.arrayBuffer()
// 3. Decode the ArrayBuffer back to a string with TextDecoder (UTF-8 default)
// 4. Multi-byte characters (e.g., Chinese chars = 3 bytes, emoji = 4 bytes)
//    mean byteLength > string.length
// See README → Section 11: Blob and File, Section 15: Encoding API

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Cache with TTL

class Solution18_TTLCache<V> {
  private store: Map<string, { value: V; expiresAt: number }> = new Map();
  private defaultTTLMs: number;

  constructor(defaultTTLMs: number) {
    this.defaultTTLMs = defaultTTLMs;
  }

  get size(): number {
    this.cleanup();
    return this.store.size;
  }

  set(key: string, value: V, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTLMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Explanation:
// Each entry stores the value and its expiration timestamp.
// - get() checks if the entry has expired before returning it (lazy cleanup)
// - size calls cleanup() first to remove expired entries
// - cleanup() iterates all entries and removes expired ones (active cleanup)
// - Custom TTL per entry overrides the default
// See README → Section 8: localStorage and sessionStorage (similar API pattern)

// ============================================================================
// Runner — execute all solutions
// ============================================================================

(async () => {
  console.log("=== Exercise 1: URL parsing ===");
  solution1();

  console.log("\n=== Exercise 2: URLSearchParams ===");
  solution2();

  console.log("\n=== Exercise 3: JSON.stringify edge cases ===");
  solution3();

  console.log("\n=== Exercise 4: JSON.stringify with replacer and toJSON ===");
  solution4();

  console.log("\n=== Exercise 5: structuredClone vs JSON round-trip ===");
  solution5();

  console.log("\n=== Exercise 6: structuredClone circular refs ===");
  solution6();

  console.log("\n=== Exercise 7: Fetch error handling (fix) ===");
  {
    console.log(await solution7_fetchData("/success")); // { data: "hello" }
    try {
      await solution7_fetchData("/notfound");
    } catch (err) {
      console.log((err as Error).message); // "HTTP 404: Not Found"
    }
  }

  console.log("\n=== Exercise 8: URL construction (fix) ===");
  console.log(solution8_buildUrl(
    "https://api.example.com",
    "/search",
    { q: "hello world", category: "books&movies", page: "1" }
  ));

  console.log("\n=== Exercise 9: JSON.parse reviver for dates (fix) ===");
  {
    const parsed = solution9_parseWithDates(
      '{"name":"Alice","createdAt":"2024-01-15T10:30:00.000Z","updatedAt":"2024-06-01T08:00:00.000Z"}'
    ) as Record<string, unknown>;
    console.log(parsed.createdAt instanceof Date); // true
    console.log(parsed.updatedAt instanceof Date); // true
    console.log(parsed.name);                      // "Alice"
  }

  console.log("\n=== Exercise 10: AbortController timeout (fix) ===");
  {
    const slowFetch = (url: string, opts: { signal: AbortSignal }) =>
      new Promise<{ text: () => Promise<string> }>((resolve, reject) => {
        const timer = setTimeout(() => resolve({
          text: () => Promise.resolve("data from " + url),
        }), 5000);
        opts.signal.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });

    try {
      await solution10_fetchWithTimeout("/slow", 100, slowFetch);
    } catch (err) {
      console.log(err instanceof DOMException); // true
      console.log((err as DOMException).name);  // "AbortError"
    }
  }

  console.log("\n=== Exercise 11: localStorage simulation ===");
  {
    const storage = new Solution11_LocalStorageSim();
    storage.setItem("name", "Alice");
    storage.setItem("age", "30");
    console.log(storage.getItem("name"));    // "Alice"
    console.log(storage.length);             // 2
    console.log(storage.key(0));             // "name"
    storage.removeItem("name");
    console.log(storage.length);             // 1
    console.log(storage.getItem("name"));    // null
    storage.clear();
    console.log(storage.length);             // 0
  }

  console.log("\n=== Exercise 12: Retry with backoff ===");
  {
    let attempt = 0;
    const result = await solution12_retryWithBackoff(
      async () => {
        attempt++;
        if (attempt < 3) throw new Error(`Attempt ${attempt} failed`);
        return "success";
      },
      5,
      10
    );
    console.log(result);   // "success"
    console.log(attempt);  // 3
  }

  console.log("\n=== Exercise 13: AbortController timeout wrapper ===");
  {
    const fast = await solution13_withTimeout(
      async (_signal) => {
        await new Promise((r) => setTimeout(r, 10));
        return "fast result";
      },
      1000
    );
    console.log(fast); // "fast result"

    try {
      await solution13_withTimeout(
        async (signal) => {
          return new Promise<string>((resolve, reject) => {
            const t = setTimeout(() => resolve("slow result"), 5000);
            signal.addEventListener("abort", () => {
              clearTimeout(t);
              reject(new DOMException("Aborted", "AbortError"));
            });
          });
        },
        50
      );
    } catch (err) {
      console.log((err as DOMException).name); // "AbortError"
    }
  }

  console.log("\n=== Exercise 14: URL query string builder ===");
  console.log(solution14_buildUrl("https://api.example.com/search", {
    q: "hello world",
    page: 1,
    active: true,
    tags: ["js", "ts"],
    removed: undefined,
  }));

  console.log("\n=== Exercise 15: IntersectionObserver simulation ===");
  {
    const entries: SimEntry[][] = [];
    const obs = new Solution15_IntersectionSim(
      (e) => entries.push(e),
      0, 100
    );
    obs.observe("a", 50);   // in viewport
    obs.observe("b", 150);  // out of viewport
    obs.observe("c", 200);  // out of viewport

    obs.setViewport(100, 250); // a exits, b and c enter
    console.log(entries[0].length);                                        // 3
    console.log(entries[0].find((e) => e.target === "a")?.isIntersecting); // false
    console.log(entries[0].find((e) => e.target === "b")?.isIntersecting); // true
    console.log(entries[0].find((e) => e.target === "c")?.isIntersecting); // true
  }

  console.log("\n=== Exercise 16: MutationObserver simulation ===");
  {
    const mutations: SimMutation[][] = [];
    const mutObs = new Solution16_MutationSim((m) => mutations.push(m));
    const target: Record<string, unknown> = { name: "Alice", age: 30 };
    mutObs.observe(target);
    mutObs.set(target, "name", "Bob");
    mutObs.set(target, "email", "bob@test.com");
    mutObs.deleteProperty(target, "age");
    mutObs.flush();
    console.log(mutations[0].length);     // 3
    console.log(mutations[0][0].oldValue); // "Alice"
    console.log(mutations[0][0].newValue); // "Bob"
    console.log(mutations[0][2].type);     // "delete"
    console.log(target.name);              // "Bob"
  }

  console.log("\n=== Exercise 17: Blob round-trip ===");
  {
    const result = await solution17_blobRoundTrip("Hello, 世界! 🌍");
    console.log(result.byteLength);  // 19
    console.log(result.decoded);     // "Hello, 世界! 🌍"
    console.log(result.matches);     // true
  }

  console.log("\n=== Exercise 18: TTL Cache ===");
  {
    const cache = new Solution18_TTLCache<string>(100);
    cache.set("a", "value-a");
    cache.set("b", "value-b", 500);
    console.log(cache.get("a"));  // "value-a"
    console.log(cache.has("a"));  // true
    console.log(cache.size);      // 2

    await new Promise((r) => setTimeout(r, 150));
    console.log(cache.get("a"));  // undefined (expired)
    console.log(cache.get("b"));  // "value-b" (still valid)
    console.log(cache.size);      // 1
  }

  console.log("\n=== All solutions verified! ===");
})();
