// ============================================================================
// EXERCISES: File Systems & I/O
// Config: ES2022, strict, ESNext modules. Run with `npx tsx`.
// ============================================================================

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface StreamChunk {
  data: string;
  index: number;
}

interface TransformResult {
  original: string;
  transformed: string;
}

interface FileInfo {
  name: string;
  content: string;
  size: number;
  mimeType: string;
}

interface BufferedWriterOptions {
  bufferSize: number;
  onFlush: (data: string) => void;
}

interface IOEvent {
  type: "read" | "write" | "flush" | "close";
  timestamp: number;
  data?: string;
}

interface SimulatedFile {
  name: string;
  content: Uint8Array;
  mimeType: string;
}

interface StreamProcessor {
  write(chunk: string): void;
  end(): string[];
}

interface MimeDetectionResult {
  extension: string;
  mimeType: string;
  category: "text" | "image" | "audio" | "video" | "application" | "font";
}

// ============================================================================
// EXERCISE 1 (Predict): Async I/O Execution Order
// ============================================================================
// Predict the output order of these I/O operations.

function exercise1_predictIOOrder(): string[] {
  // Consider this Node.js code:
  //
  // import { readFile } from 'fs';
  //
  // console.log("1: start");
  //
  // readFile('small.txt', 'utf-8', (err, data) => {
  //   console.log("2: file read");
  // });
  //
  // setTimeout(() => {
  //   console.log("3: timeout");
  // }, 0);
  //
  // Promise.resolve().then(() => {
  //   console.log("4: microtask");
  // });
  //
  // process.nextTick(() => {
  //   console.log("5: nextTick");
  // });
  //
  // console.log("6: end");

  // YOUR PREDICTION:
  return [];
}

// console.log("Exercise 1:", exercise1_predictIOOrder());
// Expected: ["1: start", "6: end", "5: nextTick", "4: microtask", "3: timeout", "2: file read"]
// nextTick > microtask > timeout > I/O callback

// ============================================================================
// EXERCISE 2 (Predict): Stream Backpressure
// ============================================================================
// A readable stream produces data at 100MB/s.
// A writable stream consumes data at 10MB/s.
// What happens without backpressure handling?

function exercise2_predictBackpressure(): {
  problem: string;
  solution: string;
} {
  // YOUR PREDICTION:
  return {
    problem: "",
    solution: "",
  };
}

// Expected:
// problem: "Memory grows unboundedly as unprocessed data accumulates in buffers"
// solution: "Use backpressure: pause the readable when writable buffer is full, resume on drain"

// ============================================================================
// EXERCISE 3 (Predict): Sync vs Async Performance
// ============================================================================
// A server handles requests. Each request reads a 10ms file.
// 100 requests arrive simultaneously.
// How long does it take to serve all requests with sync vs async I/O?

function exercise3_predictPerformance(): {
  syncTime: number;
  asyncTime: number;
  explanation: string;
} {
  // YOUR PREDICTION:
  return {
    syncTime: 0,
    asyncTime: 0,
    explanation: "",
  };
}

// Expected:
// syncTime: 1000 (100 * 10ms — sequential)
// asyncTime: ~10-40 (all 100 happen concurrently, limited by thread pool size of 4)
// explanation: "Async I/O overlaps waiting; sync blocks the single thread"

// ============================================================================
// EXERCISE 4 (Predict): Buffer Encoding
// ============================================================================

function exercise4_predictEncoding(): string[] {
  // What are the outputs?
  //
  // const buf = Buffer.from("Hello");
  // console.log(buf.length);           // A
  // console.log(buf.toString('hex'));   // B
  // console.log(buf.toString('base64'));// C
  //
  // const buf2 = Buffer.from("é");     // 2 bytes in UTF-8
  // console.log(buf2.length);          // D
  // console.log(buf2.toString().length); // E

  // Return [A, B, C, D, E] as strings
  return [];
}

// Expected: ["5", "48656c6c6f", "SGVsbG8=", "2", "1"]
// buf.length is byte length, string.length is character length

// ============================================================================
// EXERCISE 5 (Implement): Transform Stream Processor
// ============================================================================
// Implement a transform stream that processes text line by line.

function exercise5_createLineTransform(
  transform: (line: string) => string
): StreamProcessor {
  // YOUR IMPLEMENTATION:
  // 1. Accept chunks of text via write()
  // 2. Buffer incomplete lines (chunks may split mid-line)
  // 3. Apply the transform function to each complete line
  // 4. end() returns all transformed lines (including any remaining buffered text)

  return {
    write(_chunk: string): void {},
    end(): string[] {
      return [];
    },
  };
}

// const processor5 = exercise5_createLineTransform((line) => line.toUpperCase());
// processor5.write("hello\nwor");
// processor5.write("ld\nfoo");
// const result5 = processor5.end();
// console.log("Exercise 5:", result5);
// Expected: ["HELLO", "WORLD", "FOO"]

// ============================================================================
// EXERCISE 6 (Implement): File Reader Simulation
// ============================================================================
// Simulate the FileReader API behavior — reads happen asynchronously
// and fire events (onload, onerror, onprogress).

class SimulatedFileReader {
  public result: string | null = null;
  public error: Error | null = null;
  public readyState: 0 | 1 | 2 = 0; // EMPTY, LOADING, DONE

  public onload: (() => void) | null = null;
  public onerror: ((err: Error) => void) | null = null;
  public onprogress: ((loaded: number, total: number) => void) | null = null;

  readAsText(file: SimulatedFile): void {
    // YOUR IMPLEMENTATION:
    // 1. Set readyState to LOADING (1)
    // 2. Simulate async reading with setTimeout
    // 3. Fire onprogress events at 25%, 50%, 75%, 100%
    // 4. Decode content (assume UTF-8) and set result
    // 5. Set readyState to DONE (2)
    // 6. Fire onload
    // If content is empty, fire onerror
  }
}

// const reader6 = new SimulatedFileReader();
// reader6.onprogress = (loaded, total) => console.log(`Progress: ${loaded}/${total}`);
// reader6.onload = () => console.log("Exercise 6:", reader6.result);
// reader6.readAsText({
//   name: "test.txt",
//   content: new TextEncoder().encode("Hello, World!"),
//   mimeType: "text/plain",
// });
// Expected: Progress events, then "Hello, World!"

// ============================================================================
// EXERCISE 7 (Fix): Broken Stream Concatenation
// ============================================================================
// This function concatenates stream chunks but has bugs.

function exercise7_concatChunks(chunks: StreamChunk[]): string {
  let result = "";

  // Bug 1: Doesn't sort by index — chunks may arrive out of order
  for (const chunk of chunks) {
    result += chunk.data;
  }

  // Bug 2: No deduplication — same chunk index may appear twice
  // (network retransmission)

  return result;
}

// const chunks7: StreamChunk[] = [
//   { data: "world", index: 1 },
//   { data: "hello ", index: 0 },
//   { data: "world", index: 1 }, // duplicate
//   { data: "!", index: 2 },
// ];
// console.log("Exercise 7:", exercise7_concatChunks(chunks7));
// Bug output: "worldhello world!"
// Expected: "hello world!"

// ============================================================================
// EXERCISE 8 (Fix): Buffered Writer Memory Leak
// ============================================================================
// This buffered writer has a bug that causes a memory leak.

class BrokenBufferedWriter {
  private buffer: string;
  private bufferSize: number;
  private onFlush: (data: string) => void;
  private flushLog: string[];

  constructor(options: BufferedWriterOptions) {
    this.buffer = "";
    this.bufferSize = options.bufferSize;
    this.onFlush = options.onFlush;
    this.flushLog = [];
  }

  write(data: string): void {
    this.buffer += data;

    // Bug: Uses > instead of >= so buffer can exceed bufferSize
    // and the comparison with string length vs byte size is wrong
    // for multi-byte characters
    if (this.buffer.length > this.bufferSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.buffer.length > 0) {
      this.onFlush(this.buffer);
      this.flushLog.push(this.buffer);
      // Bug: Doesn't clear the buffer!
      // this.buffer = "";
    }
  }

  close(): void {
    this.flush();
  }

  getFlushLog(): string[] {
    return this.flushLog;
  }
}

// const writer8 = new BrokenBufferedWriter({
//   bufferSize: 10,
//   onFlush: (data) => console.log("Flushed:", data),
// });
// writer8.write("hello"); // 5 chars, no flush
// writer8.write("world"); // 10 chars, should flush
// writer8.write("!");     // 1 char, buffer should be "!"
// writer8.close();
// Expected flushLog: ["helloworld", "!"]
// Bug: buffer grows forever because it's never cleared

// ============================================================================
// EXERCISE 9 (Implement): Buffered Writer
// ============================================================================
// Implement a correct buffered writer.

class BufferedWriter {
  private buffer: string;
  private bufferSize: number;
  private onFlush: (data: string) => void;
  private flushLog: string[];
  private totalBytesWritten: number;

  constructor(options: BufferedWriterOptions) {
    this.buffer = "";
    this.bufferSize = options.bufferSize;
    this.onFlush = options.onFlush;
    this.flushLog = [];
    this.totalBytesWritten = 0;
  }

  write(data: string): void {
    // YOUR IMPLEMENTATION:
    // 1. Append data to buffer
    // 2. If buffer >= bufferSize, flush
    // 3. Track total bytes written
  }

  flush(): void {
    // YOUR IMPLEMENTATION:
    // 1. Call onFlush with buffer contents
    // 2. Log the flush
    // 3. Clear the buffer
  }

  close(): void {
    // YOUR IMPLEMENTATION:
    // Flush remaining data
  }

  getFlushLog(): string[] {
    return [...this.flushLog];
  }

  getTotalBytesWritten(): number {
    return this.totalBytesWritten;
  }
}

// const writer9 = new BufferedWriter({
//   bufferSize: 10,
//   onFlush: () => {},
// });
// writer9.write("hello");
// writer9.write("world");
// writer9.write("!");
// writer9.close();
// console.log("Exercise 9:", writer9.getFlushLog());
// Expected: ["helloworld", "!"]
// console.log("Total bytes:", writer9.getTotalBytesWritten()); // 11

// ============================================================================
// EXERCISE 10 (Implement): MIME Type Detector
// ============================================================================
// Implement a MIME type detector based on file extension.

function exercise10_detectMimeType(filename: string): MimeDetectionResult {
  // YOUR IMPLEMENTATION:
  // Map common extensions to MIME types and categories
  // Handle: .html, .css, .js, .ts, .json, .xml, .txt,
  //         .png, .jpg, .jpeg, .gif, .svg, .webp,
  //         .mp3, .wav, .ogg,
  //         .mp4, .webm,
  //         .woff, .woff2, .ttf,
  //         .pdf, .zip, .wasm
  // Default: application/octet-stream, "application"

  return {
    extension: "",
    mimeType: "application/octet-stream",
    category: "application",
  };
}

// console.log("Exercise 10:", exercise10_detectMimeType("styles.css"));
// Expected: { extension: ".css", mimeType: "text/css", category: "text" }
// console.log(exercise10_detectMimeType("photo.png"));
// Expected: { extension: ".png", mimeType: "image/png", category: "image" }
// console.log(exercise10_detectMimeType("data.unknown"));
// Expected: { extension: ".unknown", mimeType: "application/octet-stream", category: "application" }

// ============================================================================
// EXERCISE 11 (Implement): Async I/O Event Logger
// ============================================================================
// Implement a simulated async I/O system that logs events.

class AsyncIOSimulator {
  private log: IOEvent[];
  private files: Map<string, string>;
  private startTime: number;

  constructor() {
    this.log = [];
    this.files = new Map();
    this.startTime = Date.now();
  }

  // Simulate writing a file (async)
  async writeFile(name: string, content: string): Promise<void> {
    // YOUR IMPLEMENTATION:
    // 1. Log a "write" event
    // 2. Simulate I/O delay (use setTimeout)
    // 3. Store the file
    // 4. Log a "flush" event
  }

  // Simulate reading a file (async)
  async readFile(name: string): Promise<string> {
    // YOUR IMPLEMENTATION:
    // 1. Log a "read" event
    // 2. Simulate I/O delay
    // 3. Return content or throw if not found
    return "";
  }

  getLog(): IOEvent[] {
    return [...this.log];
  }
}

// const io11 = new AsyncIOSimulator();
// await io11.writeFile("test.txt", "hello");
// const content = await io11.readFile("test.txt");
// console.log("Exercise 11:", content, io11.getLog());
// Expected: content = "hello", log has write, flush, read events

// ============================================================================
// EXERCISE 12 (Implement): Readable Stream Simulation
// ============================================================================
// Implement a readable stream that produces data in chunks.

class SimulatedReadableStream {
  private data: string;
  private chunkSize: number;
  private position: number;
  private closed: boolean;

  constructor(data: string, chunkSize: number) {
    this.data = data;
    this.chunkSize = chunkSize;
    this.position = 0;
    this.closed = false;
  }

  // Read the next chunk. Returns null when done.
  read(): StreamChunk | null {
    // YOUR IMPLEMENTATION:
    // 1. Return null if closed or no more data
    // 2. Return the next chunk with its index
    // 3. Advance position
    return null;
  }

  // Read all remaining chunks
  readAll(): StreamChunk[] {
    // YOUR IMPLEMENTATION
    return [];
  }

  // How many bytes remaining
  remaining(): number {
    // YOUR IMPLEMENTATION
    return 0;
  }

  close(): void {
    this.closed = true;
  }

  isClosed(): boolean {
    return this.closed;
  }
}

// const stream12 = new SimulatedReadableStream("Hello, World!", 5);
// console.log("Exercise 12:", stream12.readAll());
// Expected: [
//   { data: "Hello", index: 0 },
//   { data: ", Wor", index: 1 },
//   { data: "ld!", index: 2 },
// ]

export {
  exercise1_predictIOOrder,
  exercise2_predictBackpressure,
  exercise3_predictPerformance,
  exercise4_predictEncoding,
  exercise5_createLineTransform,
  SimulatedFileReader,
  exercise7_concatChunks,
  BrokenBufferedWriter,
  BufferedWriter,
  exercise10_detectMimeType,
  AsyncIOSimulator,
  SimulatedReadableStream,
};

export type {
  StreamChunk,
  TransformResult,
  FileInfo,
  BufferedWriterOptions,
  IOEvent,
  SimulatedFile,
  StreamProcessor,
  MimeDetectionResult,
};
