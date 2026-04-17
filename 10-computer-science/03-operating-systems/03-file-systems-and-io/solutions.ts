// ============================================================================
// SOLUTIONS: File Systems & I/O
// Config: ES2022, strict, ESNext modules. Run with `npx tsx`.
// ============================================================================

import type {
  StreamChunk,
  BufferedWriterOptions,
  IOEvent,
  SimulatedFile,
  StreamProcessor,
  MimeDetectionResult,
} from "./exercises.js";

// ============================================================================
// Utility
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// SOLUTION 1: Async I/O Execution Order
// ============================================================================

function solution1_predictIOOrder(): string[] {
  // Sync: 1, 6
  // process.nextTick: 5 (highest priority microtask in Node)
  // Promise microtask: 4
  // setTimeout: 3
  // I/O callback: 2 (file read — goes through thread pool, takes longer)
  return [
    "1: start",
    "6: end",
    "5: nextTick",
    "4: microtask",
    "3: timeout",
    "2: file read",
  ];
}

// ============================================================================
// SOLUTION 2: Stream Backpressure
// ============================================================================

function solution2_predictBackpressure(): {
  problem: string;
  solution: string;
} {
  return {
    problem:
      "Memory grows unboundedly as unprocessed data accumulates in buffers",
    solution:
      "Use backpressure: pause the readable when writable buffer is full, resume on drain",
  };
}

// ============================================================================
// SOLUTION 3: Sync vs Async Performance
// ============================================================================

function solution3_predictPerformance(): {
  syncTime: number;
  asyncTime: number;
  explanation: string;
} {
  return {
    syncTime: 1000,
    asyncTime: 30,
    explanation:
      "Async I/O overlaps waiting. With 4 thread pool threads, ~25 batches of 4 = 250ms theoretical, but OS caching and I/O overlap bring it closer to 30ms. Sync blocks the single thread for each read sequentially.",
  };
}

// ============================================================================
// SOLUTION 4: Buffer Encoding
// ============================================================================

function solution4_predictEncoding(): string[] {
  return [
    "5",            // "Hello" = 5 bytes in UTF-8
    "48656c6c6f",   // hex encoding
    "SGVsbG8=",     // base64 encoding
    "2",            // "é" = 2 bytes in UTF-8
    "1",            // "é" = 1 character
  ];
}

// ============================================================================
// SOLUTION 5: Transform Stream Processor
// ============================================================================

function solution5_createLineTransform(
  transform: (line: string) => string
): StreamProcessor {
  let buffer = "";
  const results: string[] = [];

  return {
    write(chunk: string): void {
      buffer += chunk;
      const lines = buffer.split("\n");
      // Keep the last element as it may be incomplete
      buffer = lines.pop()!;
      for (const line of lines) {
        results.push(transform(line));
      }
    },
    end(): string[] {
      // Process remaining buffer
      if (buffer.length > 0) {
        results.push(transform(buffer));
        buffer = "";
      }
      return [...results];
    },
  };
}

// ============================================================================
// SOLUTION 6: File Reader Simulation
// ============================================================================

class SolutionSimulatedFileReader {
  public result: string | null = null;
  public error: Error | null = null;
  public readyState: 0 | 1 | 2 = 0;

  public onload: (() => void) | null = null;
  public onerror: ((err: Error) => void) | null = null;
  public onprogress: ((loaded: number, total: number) => void) | null = null;

  readAsText(file: SimulatedFile): void {
    this.readyState = 1;

    if (file.content.length === 0) {
      setTimeout(() => {
        this.readyState = 2;
        this.error = new Error("File is empty");
        if (this.onerror) this.onerror(this.error);
      }, 0);
      return;
    }

    const total = file.content.length;
    const milestones = [0.25, 0.5, 0.75, 1.0];
    let milestoneIndex = 0;

    const fireProgress = (): void => {
      if (milestoneIndex < milestones.length) {
        const progress = milestones[milestoneIndex];
        const loaded = Math.floor(total * progress);
        if (this.onprogress) this.onprogress(loaded, total);
        milestoneIndex++;
        setTimeout(fireProgress, 5);
      } else {
        // Reading complete
        this.result = new TextDecoder().decode(file.content);
        this.readyState = 2;
        if (this.onload) this.onload();
      }
    };

    setTimeout(fireProgress, 5);
  }
}

// ============================================================================
// SOLUTION 7: Fixed Stream Concatenation
// ============================================================================

function solution7_concatChunks(chunks: StreamChunk[]): string {
  // Fix 1: Deduplicate by index
  const uniqueChunks = new Map<number, StreamChunk>();
  for (const chunk of chunks) {
    if (!uniqueChunks.has(chunk.index)) {
      uniqueChunks.set(chunk.index, chunk);
    }
  }

  // Fix 2: Sort by index
  const sorted = [...uniqueChunks.values()].sort((a, b) => a.index - b.index);

  return sorted.map((c) => c.data).join("");
}

// ============================================================================
// SOLUTION 8/9: Buffered Writer
// ============================================================================

class SolutionBufferedWriter {
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
    this.buffer += data;
    this.totalBytesWritten += data.length;

    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.buffer.length > 0) {
      this.onFlush(this.buffer);
      this.flushLog.push(this.buffer);
      this.buffer = "";
    }
  }

  close(): void {
    this.flush();
  }

  getFlushLog(): string[] {
    return [...this.flushLog];
  }

  getTotalBytesWritten(): number {
    return this.totalBytesWritten;
  }
}

// ============================================================================
// SOLUTION 10: MIME Type Detector
// ============================================================================

function solution10_detectMimeType(filename: string): MimeDetectionResult {
  const lastDot = filename.lastIndexOf(".");
  const extension = lastDot >= 0 ? filename.slice(lastDot) : "";

  const mimeMap: Record<string, { mimeType: string; category: MimeDetectionResult["category"] }> = {
    ".html": { mimeType: "text/html", category: "text" },
    ".htm": { mimeType: "text/html", category: "text" },
    ".css": { mimeType: "text/css", category: "text" },
    ".js": { mimeType: "text/javascript", category: "text" },
    ".ts": { mimeType: "text/typescript", category: "text" },
    ".json": { mimeType: "application/json", category: "application" },
    ".xml": { mimeType: "application/xml", category: "application" },
    ".txt": { mimeType: "text/plain", category: "text" },
    ".csv": { mimeType: "text/csv", category: "text" },
    ".png": { mimeType: "image/png", category: "image" },
    ".jpg": { mimeType: "image/jpeg", category: "image" },
    ".jpeg": { mimeType: "image/jpeg", category: "image" },
    ".gif": { mimeType: "image/gif", category: "image" },
    ".svg": { mimeType: "image/svg+xml", category: "image" },
    ".webp": { mimeType: "image/webp", category: "image" },
    ".ico": { mimeType: "image/x-icon", category: "image" },
    ".mp3": { mimeType: "audio/mpeg", category: "audio" },
    ".wav": { mimeType: "audio/wav", category: "audio" },
    ".ogg": { mimeType: "audio/ogg", category: "audio" },
    ".mp4": { mimeType: "video/mp4", category: "video" },
    ".webm": { mimeType: "video/webm", category: "video" },
    ".woff": { mimeType: "font/woff", category: "font" },
    ".woff2": { mimeType: "font/woff2", category: "font" },
    ".ttf": { mimeType: "font/ttf", category: "font" },
    ".otf": { mimeType: "font/otf", category: "font" },
    ".pdf": { mimeType: "application/pdf", category: "application" },
    ".zip": { mimeType: "application/zip", category: "application" },
    ".wasm": { mimeType: "application/wasm", category: "application" },
  };

  const entry = mimeMap[extension.toLowerCase()];

  if (entry) {
    return {
      extension,
      mimeType: entry.mimeType,
      category: entry.category,
    };
  }

  return {
    extension: extension || "",
    mimeType: "application/octet-stream",
    category: "application",
  };
}

// ============================================================================
// SOLUTION 11: Async I/O Event Logger
// ============================================================================

class SolutionAsyncIOSimulator {
  private log: IOEvent[];
  private files: Map<string, string>;
  private startTime: number;

  constructor() {
    this.log = [];
    this.files = new Map();
    this.startTime = Date.now();
  }

  private logEvent(type: IOEvent["type"], data?: string): void {
    this.log.push({
      type,
      timestamp: Date.now() - this.startTime,
      data,
    });
  }

  async writeFile(name: string, content: string): Promise<void> {
    this.logEvent("write", `${name}: ${content.length} bytes`);
    await delay(5); // Simulate I/O
    this.files.set(name, content);
    this.logEvent("flush", name);
  }

  async readFile(name: string): Promise<string> {
    this.logEvent("read", name);
    await delay(3); // Simulate I/O
    const content = this.files.get(name);
    if (content === undefined) {
      throw new Error(`File not found: ${name}`);
    }
    return content;
  }

  getLog(): IOEvent[] {
    return [...this.log];
  }
}

// ============================================================================
// SOLUTION 12: Readable Stream Simulation
// ============================================================================

class SolutionSimulatedReadableStream {
  private data: string;
  private chunkSize: number;
  private position: number;
  private chunkIndex: number;
  private closed: boolean;

  constructor(data: string, chunkSize: number) {
    this.data = data;
    this.chunkSize = chunkSize;
    this.position = 0;
    this.chunkIndex = 0;
    this.closed = false;
  }

  read(): StreamChunk | null {
    if (this.closed || this.position >= this.data.length) {
      return null;
    }

    const chunk = this.data.slice(this.position, this.position + this.chunkSize);
    const result: StreamChunk = {
      data: chunk,
      index: this.chunkIndex,
    };

    this.position += this.chunkSize;
    this.chunkIndex++;
    return result;
  }

  readAll(): StreamChunk[] {
    const chunks: StreamChunk[] = [];
    let chunk = this.read();
    while (chunk !== null) {
      chunks.push(chunk);
      chunk = this.read();
    }
    return chunks;
  }

  remaining(): number {
    return Math.max(0, this.data.length - this.position);
  }

  close(): void {
    this.closed = true;
  }

  isClosed(): boolean {
    return this.closed;
  }
}

// ============================================================================
// RUNNER
// ============================================================================

async function runAllSolutions(): Promise<void> {
  console.log("=== SOLUTION 1: Async I/O Order ===");
  console.log(solution1_predictIOOrder());

  console.log("\n=== SOLUTION 2: Backpressure ===");
  console.log(solution2_predictBackpressure());

  console.log("\n=== SOLUTION 3: Sync vs Async ===");
  console.log(solution3_predictPerformance());

  console.log("\n=== SOLUTION 4: Buffer Encoding ===");
  console.log(solution4_predictEncoding());

  console.log("\n=== SOLUTION 5: Transform Stream ===");
  const processor5 = solution5_createLineTransform((line) => line.toUpperCase());
  processor5.write("hello\nwor");
  processor5.write("ld\nfoo");
  console.log(processor5.end());

  console.log("\n=== SOLUTION 6: File Reader ===");
  const reader6 = new SolutionSimulatedFileReader();
  await new Promise<void>((resolve) => {
    reader6.onprogress = (loaded, total) =>
      console.log(`  Progress: ${loaded}/${total}`);
    reader6.onload = () => {
      console.log("  Result:", reader6.result);
      resolve();
    };
    reader6.readAsText({
      name: "test.txt",
      content: new TextEncoder().encode("Hello, World!"),
      mimeType: "text/plain",
    });
  });

  console.log("\n=== SOLUTION 7: Fixed Concat ===");
  const chunks7: StreamChunk[] = [
    { data: "world", index: 1 },
    { data: "hello ", index: 0 },
    { data: "world", index: 1 },
    { data: "!", index: 2 },
  ];
  console.log(solution7_concatChunks(chunks7));

  console.log("\n=== SOLUTION 9: Buffered Writer ===");
  const writer9 = new SolutionBufferedWriter({
    bufferSize: 10,
    onFlush: (data) => console.log("  Flushed:", data),
  });
  writer9.write("hello");
  writer9.write("world");
  writer9.write("!");
  writer9.close();
  console.log("  FlushLog:", writer9.getFlushLog());
  console.log("  Total bytes:", writer9.getTotalBytesWritten());

  console.log("\n=== SOLUTION 10: MIME Types ===");
  console.log(solution10_detectMimeType("styles.css"));
  console.log(solution10_detectMimeType("photo.png"));
  console.log(solution10_detectMimeType("app.wasm"));
  console.log(solution10_detectMimeType("data.unknown"));

  console.log("\n=== SOLUTION 11: Async I/O Simulator ===");
  const io11 = new SolutionAsyncIOSimulator();
  await io11.writeFile("test.txt", "hello");
  const content11 = await io11.readFile("test.txt");
  console.log("  Content:", content11);
  console.log("  Log:", io11.getLog());

  console.log("\n=== SOLUTION 12: Readable Stream ===");
  const stream12 = new SolutionSimulatedReadableStream("Hello, World!", 5);
  console.log(stream12.readAll());
}

runAllSolutions().catch(console.error);
