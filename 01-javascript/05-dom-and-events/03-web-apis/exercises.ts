// ============================================================================
// 03-web-apis: Exercises
// ============================================================================
// Run:  npx tsx 01-javascript/05-dom-and-events/03-web-apis/exercises.ts
//
// NOTE: These exercises run in Node.js. Some Web APIs are available
// (fetch, URL, AbortController, structuredClone, Blob), others are simulated.
//
// Instructions:
//   - "Predict the output"  → fill in YOUR ANSWER below the question
//   - "Fix the bug"         → edit the code so it works correctly
//   - "Implement"           → write the function/class body
//
// When you're done, check your answers against solutions.ts
// ============================================================================

// ─── Exercise 1: Predict the Output ─────────────────────────────────────────
// Topic: URL parsing
//
// What does each console.log print?

function exercise1() {
  const url = new URL("https://example.com:3000/api/users?name=Alice&role=admin#section");

  console.log(url.protocol);
  console.log(url.hostname);
  console.log(url.port);
  console.log(url.pathname);
  console.log(url.search);
  console.log(url.hash);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise1();

// ─── Exercise 2: Predict the Output ─────────────────────────────────────────
// Topic: URLSearchParams behavior
//
// What does each console.log print?

function exercise2() {
  const params = new URLSearchParams("a=1&b=2&a=3");

  console.log(params.get("a"));
  console.log(params.getAll("a"));
  console.log(params.has("b"));
  console.log(params.has("c"));

  params.set("a", "99");
  console.log(params.getAll("a"));
  console.log(params.toString());
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???
// Log 6: ???

// Uncomment to test:
// exercise2();

// ─── Exercise 3: Predict the Output ─────────────────────────────────────────
// Topic: JSON.stringify edge cases
//
// What does each console.log print?

function exercise3() {
  console.log(JSON.stringify(undefined));
  console.log(JSON.stringify({ a: undefined, b: 2 }));
  console.log(JSON.stringify([1, undefined, 3]));
  console.log(JSON.stringify(NaN));
  console.log(JSON.stringify(Infinity));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???
// Log 5: ???

// Uncomment to test:
// exercise3();

// ─── Exercise 4: Predict the Output ─────────────────────────────────────────
// Topic: JSON.stringify with replacer and toJSON
//
// What does each console.log print?

function exercise4() {
  const data = {
    name: "Alice",
    age: 30,
    password: "secret",
    toJSON() {
      return { user: this.name, years: this.age };
    },
  };

  console.log(JSON.stringify(data));
  console.log(JSON.stringify(data, ["name", "age"]));

  const data2 = { x: 1, y: 2, z: 3 };
  console.log(JSON.stringify(data2, (key, value) => {
    if (key === "") return value;  // root object
    return typeof value === "number" ? value * 10 : value;
  }));
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???

// Uncomment to test:
// exercise4();

// ─── Exercise 5: Predict the Output ─────────────────────────────────────────
// Topic: structuredClone vs JSON round-trip
//
// What does each console.log print?

function exercise5() {
  const original = {
    date: new Date("2024-01-15T00:00:00.000Z"),
    regex: /hello/gi,
    undef: undefined,
    nan: NaN,
    map: new Map([["key", "value"]]),
  };

  // JSON round-trip
  const jsonClone = JSON.parse(JSON.stringify(original));
  console.log(jsonClone.date instanceof Date);
  console.log(typeof jsonClone.regex === "object" && !(jsonClone.regex instanceof RegExp));
  console.log("undef" in jsonClone);
  console.log(jsonClone.nan === null);

  // structuredClone
  const scClone = structuredClone(original);
  console.log(scClone.date instanceof Date);
  console.log(scClone.regex instanceof RegExp);
  console.log("undef" in scClone);
  console.log(Number.isNaN(scClone.nan));
}

// YOUR ANSWER:
// Log 1 (JSON — date instanceof Date): ???
// Log 2 (JSON — regex is plain object): ???
// Log 3 (JSON — "undef" in clone): ???
// Log 4 (JSON — nan is null): ???
// Log 5 (SC — date instanceof Date): ???
// Log 6 (SC — regex instanceof RegExp): ???
// Log 7 (SC — "undef" in clone): ???
// Log 8 (SC — nan is NaN): ???

// Uncomment to test:
// exercise5();

// ─── Exercise 6: Predict the Output ─────────────────────────────────────────
// Topic: structuredClone with circular references
//
// What does each console.log print?

function exercise6() {
  const obj: Record<string, unknown> = { name: "circular" };
  obj.self = obj;

  const clone = structuredClone(obj);

  console.log(clone !== obj);
  console.log(clone.self === clone);
  console.log(clone.self === obj);
  console.log((clone.self as Record<string, unknown>).name);
}

// YOUR ANSWER:
// Log 1: ???
// Log 2: ???
// Log 3: ???
// Log 4: ???

// Uncomment to test:
// exercise6();

// ─── Exercise 7: Fix the Bug ────────────────────────────────────────────────
// Topic: Fetch error handling
//
// This function should return the JSON data from a successful response,
// or throw an error with the HTTP status for non-ok responses.
// BUG: It doesn't properly handle HTTP errors (4xx, 5xx).
// FIX the function (use the provided mockFetch to test).

type MockResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
};

function exercise7_mockFetch(url: string): Promise<MockResponse> {
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

async function exercise7_fetchData(url: string): Promise<unknown> {
  // BUG: This doesn't check for HTTP errors
  const response = await exercise7_mockFetch(url);
  const data = await response.json();
  return data;
}

// Uncomment to test:
// (async () => {
//   console.log(await exercise7_fetchData("/success"));
//   try {
//     await exercise7_fetchData("/notfound");
//   } catch (err) {
//     console.log((err as Error).message); // should include "404"
//   }
// })();

// ─── Exercise 8: Fix the Bug ────────────────────────────────────────────────
// Topic: URL construction
//
// This function should build a URL with query parameters.
// BUG: The query string is not properly encoded for special characters.

function exercise8_buildUrl(
  base: string,
  path: string,
  params: Record<string, string>
): string {
  // BUG: manual string concatenation doesn't encode properly
  let queryString = "";
  for (const [key, value] of Object.entries(params)) {
    if (queryString) queryString += "&";
    queryString += `${key}=${value}`;
  }
  return `${base}${path}?${queryString}`;
}

// Uncomment to test:
// console.log(exercise8_buildUrl(
//   "https://api.example.com",
//   "/search",
//   { q: "hello world", category: "books&movies", page: "1" }
// ));
// Should encode spaces and ampersands properly

// ─── Exercise 9: Fix the Bug ────────────────────────────────────────────────
// Topic: JSON.parse with reviver for dates
//
// This function should parse JSON and convert ISO date strings back to Date objects.
// BUG: The reviver doesn't work correctly — dates remain as strings.

function exercise9_parseWithDates(json: string): unknown {
  return JSON.parse(json, (key, value) => {
    // BUG: this regex is wrong and the condition is incomplete
    if (key === "date") {
      return new Date(value as string);
    }
    return value;
  });
}

// Uncomment to test:
// const parsed = exercise9_parseWithDates(
//   '{"name":"Alice","createdAt":"2024-01-15T10:30:00.000Z","updatedAt":"2024-06-01T08:00:00.000Z"}'
// );
// console.log(parsed);
// Both createdAt and updatedAt should be Date objects

// ─── Exercise 10: Fix the Bug ───────────────────────────────────────────────
// Topic: AbortController usage
//
// This function should abort a fetch if it takes too long.
// BUG: The timeout is never cleared, and the error type isn't checked correctly.

async function exercise10_fetchWithTimeout(
  url: string,
  timeoutMs: number,
  mockFetch: (url: string, opts: { signal: AbortSignal }) => Promise<{ text: () => Promise<string> }>
): Promise<string> {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);  // BUG: timeout never cleared

  const response = await mockFetch(url, { signal: controller.signal });
  return response.text();
}

// Uncomment to test:
// (async () => {
//   const slowFetch = (url: string, opts: { signal: AbortSignal }) =>
//     new Promise<{ text: () => Promise<string> }>((resolve, reject) => {
//       const timer = setTimeout(() => resolve({
//         text: () => Promise.resolve("data from " + url),
//       }), 5000);
//       opts.signal.addEventListener("abort", () => {
//         clearTimeout(timer);
//         reject(new DOMException("The operation was aborted.", "AbortError"));
//       });
//     });
//
//   try {
//     await exercise10_fetchWithTimeout("/slow", 100, slowFetch);
//   } catch (err) {
//     console.log(err instanceof DOMException);
//     console.log((err as DOMException).name);
//   }
// })();

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
// Topic: localStorage simulation
//
// Implement a class that simulates the localStorage API.
// It should support: getItem, setItem, removeItem, clear, key, length.
// All values must be stored as strings (convert non-strings with String()).

class Exercise11_LocalStorageSim {
  // Implement here

  get length(): number {
    return 0; // TODO
  }

  getItem(_key: string): string | null {
    return null; // TODO
  }

  setItem(_key: string, _value: string): void {
    // TODO
  }

  removeItem(_key: string): void {
    // TODO
  }

  clear(): void {
    // TODO
  }

  key(_index: number): string | null {
    return null; // TODO
  }
}

// Uncomment to test:
// const storage = new Exercise11_LocalStorageSim();
// storage.setItem("name", "Alice");
// storage.setItem("age", "30");
// console.log(storage.getItem("name"));    // "Alice"
// console.log(storage.length);             // 2
// console.log(storage.key(0));             // "name" or "age" (insertion order)
// storage.removeItem("name");
// console.log(storage.length);             // 1
// console.log(storage.getItem("name"));    // null
// storage.clear();
// console.log(storage.length);             // 0

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
// Topic: Retry fetch with exponential backoff
//
// Implement a function that retries a failing async operation with
// exponential backoff. Parameters: the async function, max retries,
// and initial delay in ms. Each retry doubles the delay.
// Uses a mock fetch (no real network needed).

async function exercise12_retryWithBackoff<T>(
  _fn: () => Promise<T>,
  _maxRetries: number,
  _initialDelayMs: number
): Promise<T> {
  // TODO: Implement retry logic with exponential backoff
  // - Call _fn()
  // - If it succeeds, return the result
  // - If it fails and retries remain, wait (delay doubles each time), then retry
  // - If all retries exhausted, throw the last error
  throw new Error("Not implemented");
}

// Uncomment to test:
// (async () => {
//   let attempt = 0;
//   const result = await exercise12_retryWithBackoff(
//     async () => {
//       attempt++;
//       if (attempt < 3) throw new Error(`Attempt ${attempt} failed`);
//       return "success";
//     },
//     5,
//     10
//   );
//   console.log(result);    // "success"
//   console.log(attempt);   // 3
// })();

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
// Topic: AbortController timeout wrapper
//
// Implement a function that wraps an async operation with a timeout
// using AbortController. If the operation doesn't complete within
// timeoutMs, it should abort and throw an error.

async function exercise13_withTimeout<T>(
  _fn: (signal: AbortSignal) => Promise<T>,
  _timeoutMs: number
): Promise<T> {
  // TODO: Create an AbortController, set a timeout, call _fn with the signal
  // If timeout fires first, the AbortError from _fn should propagate
  // Always clear the timeout when done
  throw new Error("Not implemented");
}

// Uncomment to test:
// (async () => {
//   const fast = await exercise13_withTimeout(
//     async (_signal) => {
//       await new Promise(r => setTimeout(r, 10));
//       return "fast result";
//     },
//     1000
//   );
//   console.log(fast); // "fast result"
//
//   try {
//     await exercise13_withTimeout(
//       async (signal) => {
//         return new Promise((resolve, reject) => {
//           const t = setTimeout(() => resolve("slow result"), 5000);
//           signal.addEventListener("abort", () => {
//             clearTimeout(t);
//             reject(new DOMException("Aborted", "AbortError"));
//           });
//         });
//       },
//       50
//     );
//   } catch (err) {
//     console.log((err as DOMException).name); // "AbortError"
//   }
// })();

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
// Topic: URL query string builder
//
// Implement a function that builds a URL with query params,
// properly handling encoding, arrays, and undefined values.

function exercise14_buildUrl(
  _base: string,
  _params: Record<string, string | number | boolean | string[] | undefined>
): string {
  // TODO:
  // - Use URL and URLSearchParams
  // - Skip undefined values
  // - For arrays, append each value with the same key
  // - Convert numbers and booleans to strings
  return ""; // TODO
}

// Uncomment to test:
// console.log(exercise14_buildUrl("https://api.example.com/search", {
//   q: "hello world",
//   page: 1,
//   active: true,
//   tags: ["js", "ts"],
//   removed: undefined,
// }));
// "https://api.example.com/search?q=hello+world&page=1&active=true&tags=js&tags=ts"

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
// Topic: IntersectionObserver simulation
//
// Implement a simplified IntersectionObserver simulator.
// It works with numeric "positions" instead of DOM elements.
// The "viewport" is a range [viewportStart, viewportEnd].
// An element is "intersecting" if its position falls within the viewport.

interface SimEntry {
  target: string;          // element identifier
  position: number;        // element's position
  isIntersecting: boolean; // whether it's in the viewport
}

type SimCallback = (entries: SimEntry[]) => void;

class Exercise15_IntersectionSim {
  // TODO: Implement
  // Constructor takes: callback, viewportStart, viewportEnd
  // Methods: observe(id, position), unobserve(id), setViewport(start, end)
  // When setViewport is called, notify callback with entries for elements
  // whose intersection status CHANGED.

  constructor(
    _callback: SimCallback,
    _viewportStart: number,
    _viewportEnd: number
  ) {
    // TODO
  }

  observe(_id: string, _position: number): void {
    // TODO
  }

  unobserve(_id: string): void {
    // TODO
  }

  setViewport(_start: number, _end: number): void {
    // TODO
  }
}

// Uncomment to test:
// const entries: SimEntry[][] = [];
// const obs15 = new Exercise15_IntersectionSim(
//   (e) => entries.push(e),
//   0, 100
// );
// obs15.observe("a", 50);   // in viewport
// obs15.observe("b", 150);  // out of viewport
// obs15.observe("c", 200);  // out of viewport
//
// obs15.setViewport(100, 250); // a exits, b and c enter
// console.log(entries[0].length);  // 3 (a, b, c changed)
// console.log(entries[0].find(e => e.target === "a")?.isIntersecting);  // false
// console.log(entries[0].find(e => e.target === "b")?.isIntersecting);  // true

// ─── Exercise 16: Implement ─────────────────────────────────────────────────
// Topic: MutationObserver simulation
//
// Implement a simplified MutationObserver for a plain object tree.
// It watches for property changes (set/delete) on an object and its subtree.

interface SimMutation {
  type: "set" | "delete";
  target: Record<string, unknown>;
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

type MutationSimCallback = (mutations: SimMutation[]) => void;

class Exercise16_MutationSim {
  // TODO: Implement
  // Constructor takes: callback
  // Methods:
  //   observe(target) — start watching the target object
  //   disconnect() — stop watching
  //   set(target, property, value) — set a property and record mutation
  //   deleteProperty(target, property) — delete a property and record mutation
  //   flush() — deliver pending mutations to the callback

  constructor(_callback: MutationSimCallback) {
    // TODO
  }

  observe(_target: Record<string, unknown>): void {
    // TODO
  }

  disconnect(): void {
    // TODO
  }

  set(_target: Record<string, unknown>, _property: string, _value: unknown): void {
    // TODO
  }

  deleteProperty(_target: Record<string, unknown>, _property: string): void {
    // TODO
  }

  flush(): void {
    // TODO
  }
}

// Uncomment to test:
// const mutations: SimMutation[][] = [];
// const mutObs = new Exercise16_MutationSim((m) => mutations.push(m));
// const target = { name: "Alice", age: 30 };
// mutObs.observe(target);
// mutObs.set(target, "name", "Bob");
// mutObs.set(target, "email", "bob@test.com");
// mutObs.deleteProperty(target, "age");
// mutObs.flush();
// console.log(mutations[0].length); // 3
// console.log(mutations[0][0].oldValue); // "Alice"
// console.log(target.name); // "Bob"

// ─── Exercise 17: Implement ─────────────────────────────────────────────────
// Topic: Blob and TextEncoder/TextDecoder
//
// Implement a function that:
// 1. Takes a string and creates a Blob from it
// 2. Reads the blob back to an ArrayBuffer
// 3. Decodes the ArrayBuffer back to a string using TextDecoder
// 4. Returns { blob, byteLength, decoded, matches }

async function exercise17_blobRoundTrip(
  _input: string
): Promise<{ blob: Blob; byteLength: number; decoded: string; matches: boolean }> {
  // TODO: Implement using Blob, blob.arrayBuffer(), and TextDecoder
  throw new Error("Not implemented");
}

// Uncomment to test:
// (async () => {
//   const result = await exercise17_blobRoundTrip("Hello, 世界! 🌍");
//   console.log(result.byteLength);  // 19 (UTF-8 multi-byte)
//   console.log(result.decoded);     // "Hello, 世界! 🌍"
//   console.log(result.matches);     // true
// })();

// ─── Exercise 18: Implement ─────────────────────────────────────────────────
// Topic: Cache with TTL (Time To Live)
//
// Implement a simple cache that stores values with an expiration time.
// Similar to localStorage but with automatic expiration.

class Exercise18_TTLCache<V> {
  // TODO: Implement
  // Constructor takes: defaultTTLMs (default time to live in ms)
  // Methods:
  //   set(key, value, ttlMs?) — store with optional custom TTL
  //   get(key) — return value or undefined if expired/missing
  //   has(key) — true if key exists and not expired
  //   delete(key) — remove a key
  //   clear() — remove all keys
  //   size — number of non-expired entries
  //   cleanup() — remove all expired entries

  constructor(_defaultTTLMs: number) {
    // TODO
  }

  get size(): number {
    return 0; // TODO
  }

  set(_key: string, _value: V, _ttlMs?: number): void {
    // TODO
  }

  get(_key: string): V | undefined {
    return undefined; // TODO
  }

  has(_key: string): boolean {
    return false; // TODO
  }

  delete(_key: string): boolean {
    return false; // TODO
  }

  clear(): void {
    // TODO
  }

  cleanup(): void {
    // TODO
  }
}

// Uncomment to test:
// (async () => {
//   const cache = new Exercise18_TTLCache<string>(100); // 100ms default TTL
//   cache.set("a", "value-a");
//   cache.set("b", "value-b", 500); // custom 500ms TTL
//   console.log(cache.get("a"));  // "value-a"
//   console.log(cache.has("a"));  // true
//   console.log(cache.size);      // 2
//
//   await new Promise(r => setTimeout(r, 150)); // wait 150ms
//   console.log(cache.get("a"));  // undefined (expired)
//   console.log(cache.get("b"));  // "value-b" (still valid)
//   console.log(cache.size);      // 1
// })();
