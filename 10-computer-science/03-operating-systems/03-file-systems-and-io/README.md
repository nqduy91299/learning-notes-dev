# File Systems & I/O

## Table of Contents

- [Synchronous vs Asynchronous I/O](#synchronous-vs-asynchronous-io)
- [Blocking vs Non-Blocking](#blocking-vs-non-blocking)
- [Node.js Event-Driven I/O](#nodejs-event-driven-io)
- [Streams](#streams)
- [Buffering](#buffering)
- [File API in the Browser](#file-api-in-the-browser)
- [File System Access API](#file-system-access-api)
- [Origin Private File System (OPFS)](#origin-private-file-system-opfs)
- [MIME Types](#mime-types)
- [Node.js fs Module](#nodejs-fs-module)
- [stdin, stdout, stderr](#stdin-stdout-stderr)
- [Key Takeaways](#key-takeaways)

---

## Synchronous vs Asynchronous I/O

**Synchronous I/O**: The program waits (blocks) until the I/O operation completes.
No other code runs during this time.

```typescript
import { readFileSync } from 'fs';

// Thread is BLOCKED until the file is fully read
const data = readFileSync('/path/to/file.txt', 'utf-8');
console.log(data); // Only runs after file is completely read
```

**Asynchronous I/O**: The program initiates the I/O operation and continues executing.
A callback, promise, or event fires when the operation completes.

```typescript
import { readFile } from 'fs/promises';

// Non-blocking — execution continues immediately
const dataPromise = readFile('/path/to/file.txt', 'utf-8');
console.log('This runs immediately');
const data = await dataPromise; // Resume when data is ready
```

### Why This Matters

A web server handling 1000 concurrent connections:
- **Sync**: Each file read blocks the thread. With one thread, you handle 1 request
  at a time. To handle 1000, you need 1000 threads (expensive).
- **Async**: One thread handles all 1000 connections. While waiting for disk I/O on
  request #1, it processes requests #2-#1000.

This is why Node.js chose async I/O — a single thread can handle thousands of
concurrent connections.

---

## Blocking vs Non-Blocking

These terms are related to but distinct from sync/async:

| Term             | Meaning                                                    |
| ---------------- | ---------------------------------------------------------- |
| **Blocking**     | The calling thread is suspended until the operation returns |
| **Non-blocking** | The call returns immediately, even if data isn't ready yet  |

Non-blocking doesn't mean async. A non-blocking `read()` might return "no data yet"
(EAGAIN in Unix), and you poll again later. Async means you get notified when data
is ready.

```
Blocking I/O:
Thread: [Request] → [Wait................] → [Got Data] → [Process]

Non-blocking polling:
Thread: [Request] → [Check?] → [No] → [Do other work] → [Check?] → [Yes!] → [Process]

Async I/O:
Thread: [Request] → [Do other work...] → [Callback: Got Data!] → [Process]
```

---

## Node.js Event-Driven I/O

Node.js uses **libuv** as its platform abstraction layer for async I/O.

### Architecture

```
┌──────────────────────────────────┐
│          Your JavaScript          │
│    (single-threaded event loop)   │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│            libuv                  │
│  ┌─────────────────────────────┐ │
│  │     Event Loop              │ │
│  │  (polls for I/O events)     │ │
│  └─────────────┬───────────────┘ │
│                │                  │
│  ┌─────────────▼───────────────┐ │
│  │     Thread Pool (4 threads) │ │
│  │  - DNS lookups              │ │
│  │  - File system operations   │ │
│  │  - Compression (zlib)       │ │
│  │  - crypto operations        │ │
│  └─────────────────────────────┘ │
│                                   │
│  ┌─────────────────────────────┐ │
│  │  OS async primitives        │ │
│  │  - epoll (Linux)            │ │
│  │  - kqueue (macOS/BSD)       │ │
│  │  - IOCP (Windows)           │ │
│  │  Used for: network I/O      │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

### Key Insight

Not all async operations in Node.js are truly non-blocking at the OS level:
- **Network I/O**: Uses OS-level async (epoll/kqueue) — truly non-blocking
- **File system I/O**: Uses the libuv thread pool — appears async to JS, but
  actually blocks a worker thread

This is why `fs.readFile` is async from JavaScript's perspective but still uses threads
under the hood. The thread pool defaults to 4 threads (`UV_THREADPOOL_SIZE`).

---

## Streams

Streams process data piece by piece instead of loading everything into memory at once.

### Why Streams Matter

```
Without streams (buffered):
┌──────────────────────────┐
│  Read entire 2GB file    │  → 2GB in memory
│  into memory             │
└──────────────────────────┘

With streams:
┌──────┐ → ┌──────┐ → ┌──────┐
│ 64KB │   │ 64KB │   │ 64KB │  → 64KB in memory at any time
└──────┘   └──────┘   └──────┘
```

### Four Types of Streams

| Type          | Description                  | Example                          |
| ------------- | ---------------------------- | -------------------------------- |
| **Readable**  | Source of data               | `fs.createReadStream`, HTTP req  |
| **Writable**  | Destination for data         | `fs.createWriteStream`, HTTP res |
| **Transform** | Modifies data passing through| `zlib.createGzip()`, crypto      |
| **Duplex**    | Both readable and writable   | TCP socket, WebSocket            |

### Node.js Stream Example

```typescript
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

// Compress a file using streams — handles backpressure automatically
await pipeline(
  createReadStream('input.txt'),
  createGzip(),
  createWriteStream('input.txt.gz')
);
```

### Web Streams API (Browser)

The browser has its own streams API:

```typescript
const response = await fetch('/large-file');
const reader = response.body!.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  processChunk(value); // Uint8Array
}
```

### Transform Streams in the Browser

```typescript
const uppercaseTransform = new TransformStream({
  transform(chunk: string, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});

const readable = someReadableStream.pipeThrough(uppercaseTransform);
```

---

## Buffering

A **buffer** is a temporary storage area for data being transferred between two places
that operate at different speeds.

### Why Buffering Exists

- **Disk I/O** is slow compared to memory. Buffers collect small writes and flush them
  in one efficient operation.
- **Network I/O** delivers data in packets. Buffers reassemble them.
- **Streams** use internal buffers to handle backpressure — when the consumer is slower
  than the producer.

### Node.js Buffer

```typescript
// Buffer — fixed-size chunk of binary data
const buf = Buffer.alloc(1024);        // 1KB of zeros
const buf2 = Buffer.from('hello');     // From string
const buf3 = Buffer.from([0x48, 0x69]); // From bytes: "Hi"

console.log(buf2.toString('utf-8'));   // "hello"
console.log(buf2.toString('base64')); // "aGVsbG8="
```

### Backpressure

When a writable stream can't keep up with a readable stream:

```typescript
const readable = createReadStream('huge-file.dat');
const writable = createWriteStream('output.dat');

readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    // Writable is full — pause reading
    readable.pause();
    writable.once('drain', () => readable.resume());
  }
});
```

Using `pipeline()` or `.pipe()` handles backpressure automatically.

---

## File API in the Browser

The browser provides several APIs for working with files:

### File, Blob, and FileReader

```typescript
// From <input type="file">
const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', () => {
  const file: File = input.files![0];
  console.log(file.name);     // "photo.jpg"
  console.log(file.size);     // 1234567
  console.log(file.type);     // "image/jpeg"

  // Read as text
  const reader = new FileReader();
  reader.onload = () => console.log(reader.result);
  reader.readAsText(file);
});

// Create a Blob programmatically
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
const url = URL.createObjectURL(blob); // blob:http://...
```

### Drag and Drop

```typescript
document.addEventListener('drop', (event) => {
  event.preventDefault();
  const files: FileList = event.dataTransfer!.files;
  for (const file of files) {
    console.log(file.name, file.size);
  }
});

document.addEventListener('dragover', (event) => {
  event.preventDefault(); // Required to allow drop
});
```

### Modern: File.text() and File.arrayBuffer()

```typescript
// No FileReader needed — returns a Promise
const text = await file.text();
const buffer = await file.arrayBuffer();
const stream = file.stream(); // ReadableStream
```

---

## File System Access API

The File System Access API gives web apps direct read/write access to files on the
user's device (with their permission).

```typescript
// Open a file picker
const [handle] = await window.showOpenFilePicker({
  types: [{
    description: 'Text files',
    accept: { 'text/plain': ['.txt'] },
  }],
});

// Read
const file = await handle.getFile();
const text = await file.text();

// Write
const writable = await handle.createWritable();
await writable.write('New content');
await writable.close();

// Save as
const saveHandle = await window.showSaveFilePicker();
const stream = await saveHandle.createWritable();
await stream.write(data);
await stream.close();

// Directory access
const dirHandle = await window.showDirectoryPicker();
for await (const entry of dirHandle.values()) {
  console.log(entry.kind, entry.name); // "file" "index.html"
}
```

**Security**: Requires user gesture (click), shows a permission prompt, and is
origin-scoped. Not available in all browsers (Safari has limited support).

---

## Origin Private File System (OPFS)

OPFS provides a high-performance, origin-scoped file system that doesn't correspond to
files visible to the user. Think of it as a private sandbox for your web app.

```typescript
// Get the OPFS root
const root = await navigator.storage.getDirectory();

// Create/open a file
const fileHandle = await root.getFileHandle('data.json', { create: true });

// Write
const writable = await fileHandle.createWritable();
await writable.write(JSON.stringify({ key: 'value' }));
await writable.close();

// Read
const file = await fileHandle.getFile();
const text = await file.text();
```

### Synchronous Access (in Workers only)

```typescript
// In a Web Worker — synchronous, high-performance access
const root = await navigator.storage.getDirectory();
const handle = await root.getFileHandle('data.bin', { create: true });
const accessHandle = await handle.createSyncAccessHandle();

// Synchronous read/write — fast!
const buffer = new ArrayBuffer(1024);
accessHandle.read(buffer, { at: 0 });
accessHandle.write(new Uint8Array([1, 2, 3]), { at: 0 });
accessHandle.flush();
accessHandle.close();
```

**Use cases**: SQLite in the browser (via sql.js/wa-sqlite), local-first apps,
large caches, game save data.

---

## MIME Types

A MIME type (Multipurpose Internet Mail Extensions) identifies the format of a file.

### Structure

```
type/subtype
text/html
application/json
image/png
audio/mpeg
video/mp4
```

### Common MIME Types for Web Development

| MIME Type                    | Extension | Description          |
| ---------------------------- | --------- | -------------------- |
| `text/html`                  | .html     | HTML document        |
| `text/css`                   | .css      | CSS stylesheet       |
| `text/javascript`            | .js       | JavaScript           |
| `application/json`           | .json     | JSON data            |
| `application/octet-stream`   | (any)     | Binary data (generic)|
| `image/png`                  | .png      | PNG image            |
| `image/svg+xml`              | .svg      | SVG image            |
| `font/woff2`                 | .woff2    | WOFF2 font           |
| `multipart/form-data`        | —         | Form with files      |

### Where MIME Types Appear

- `Content-Type` HTTP header: `Content-Type: application/json; charset=utf-8`
- `<script type="module">`: Tells the browser this is an ES module
- `<link rel="stylesheet">`: Browser expects `text/css`
- `Blob` constructor: `new Blob([data], { type: 'image/png' })`
- `fetch` response: `response.headers.get('content-type')`

### MIME Sniffing

Browsers may ignore the stated MIME type and sniff the content to determine the actual
type. The `X-Content-Type-Options: nosniff` header prevents this (security best practice).

---

## Node.js fs Module

### Promise-based API (preferred)

```typescript
import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises';

const content = await readFile('file.txt', 'utf-8');
await writeFile('output.txt', 'Hello World');
await mkdir('new-dir', { recursive: true });
const files = await readdir('.');
const info = await stat('file.txt');
console.log(info.size, info.isDirectory());
```

### Streams for Large Files

```typescript
import { createReadStream, createWriteStream } from 'fs';

const readable = createReadStream('large.csv', {
  encoding: 'utf-8',
  highWaterMark: 64 * 1024, // 64KB chunks
});

readable.on('data', (chunk: string) => {
  // Process 64KB at a time
});

readable.on('end', () => console.log('Done'));
```

### Watch for Changes

```typescript
import { watch } from 'fs/promises';

const watcher = watch('src/', { recursive: true });
for await (const event of watcher) {
  console.log(event.eventType, event.filename);
}
```

---

## stdin, stdout, stderr

Every process has three standard I/O streams:

| Stream     | File Descriptor | Purpose                    | Node.js               |
| ---------- | --------------- | -------------------------- | --------------------- |
| **stdin**  | 0               | Input (keyboard, pipe)     | `process.stdin`       |
| **stdout** | 1               | Normal output              | `process.stdout`      |
| **stderr** | 2               | Error output               | `process.stderr`      |

### Why Separate stdout and stderr?

```bash
# Redirect stdout to file, errors still show in terminal
node app.js > output.log

# Redirect stderr to file, output shows in terminal
node app.js 2> errors.log

# Pipe stdout to another program
node app.js | grep "pattern"
```

### In Node.js

```typescript
// stdout and stderr are writable streams
process.stdout.write('Hello\n');
process.stderr.write('Error!\n');

// console.log writes to stdout
// console.error writes to stderr
console.log('This goes to stdout');
console.error('This goes to stderr');

// stdin is a readable stream
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (input: string) => {
  console.log('You typed:', input.trim());
});
```

### In the Browser

There is no stdin/stdout/stderr. `console.log` writes to the browser's developer
console, which is a fundamentally different mechanism. Some tools (like `xterm.js`)
simulate terminal I/O in the browser.

---

## Key Takeaways

1. **Async I/O is why Node.js scales.** One thread handles thousands of connections
   because it never blocks waiting for disk or network.

2. **File I/O in Node.js uses a thread pool.** It's async from your perspective but
   uses real threads under the hood (libuv). Network I/O is truly non-blocking.

3. **Use streams for large data.** Reading a 2GB file into memory will crash your
   process. Streams process data in chunks — constant memory usage regardless of
   file size.

4. **The browser has three levels of file access**: File API (read-only, user-selected),
   File System Access API (read-write, user-granted), and OPFS (private sandbox,
   no user interaction needed).

5. **MIME types matter.** Wrong MIME type = browser refuses to execute your JavaScript
   (`application/octet-stream` instead of `text/javascript`). Always set `Content-Type`
   correctly.

6. **Backpressure prevents memory explosions.** When a producer is faster than a
   consumer, backpressure pauses the producer. Use `pipeline()` to get this for free.

7. **OPFS is a game-changer** for local-first web apps. It provides fast, synchronous
   (in workers) file access without user interaction.

8. **stderr exists for a reason.** Errors to stderr, data to stdout. This makes your
   CLI tools composable with pipes and redirects.
