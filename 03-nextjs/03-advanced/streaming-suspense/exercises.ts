// ============================================================================
// streaming-suspense: Exercises
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/streaming-suspense/exercises.ts
// ============================================================================

interface StreamChunk { id: string; content: string; resolvedAt: number; }
interface SuspenseBoundary { id: string; fallback: string; children: string[]; resolvedAt?: number; }

// ─── Exercise 1: Predict ────────────────────────────────────────────────────
function exercise1(): void {
  // Given: Layout(instant) → Suspense(fallback=Skeleton) → Page(2s fetch)
  // What does the user see at t=0, t=0.1s, t=2s?
  console.log("Exercise 1 - predict what user sees at each timestamp");
}

// ─── Exercise 2: Implement ──────────────────────────────────────────────────
async function* exercise2StreamChunks<T>(
  items: Array<{ data: T; delayMs: number }>,
): AsyncGenerator<{ data: T; index: number }> {
  // TODO: Yield items with delays, simulating streaming
}

// ─── Exercise 3: Implement ──────────────────────────────────────────────────
class Exercise3SuspenseSimulator {
  private boundaries: SuspenseBoundary[] = [];
  private resolvedContent = new Map<string, string>();

  addBoundary(id: string, fallback: string, children: string[]): void {}

  async resolve(childId: string, content: string, delayMs: number): Promise<void> {
    // TODO: Resolve a child after delay
  }

  getVisibleContent(): Record<string, string> {
    // TODO: Return what's currently visible (fallback or resolved content)
    return {};
  }
}

// ─── Exercise 4: Implement ──────────────────────────────────────────────────
async function exercise4ProgressiveRender(
  sections: Array<{ id: string; fetchData: () => Promise<string>; priority: number }>,
): Promise<Array<{ id: string; content: string; resolvedOrder: number }>> {
  // TODO: Render sections progressively — each resolves independently
  // Lower priority number = higher priority (renders first if same speed)
  return [];
}

// ─── Exercise 5: Predict ────────────────────────────────────────────────────
function exercise5(): void {
  // Nested Suspense:
  // <Suspense fallback="A">         -- outer
  //   <FastComponent (100ms)>
  //   <Suspense fallback="B">       -- inner
  //     <SlowComponent (2000ms)>
  //   </Suspense>
  // </Suspense>
  // What does user see at t=0, t=100ms, t=2000ms?
  console.log("Exercise 5 - predict nested Suspense rendering");
}

// ─── Exercise 6: Implement ──────────────────────────────────────────────────
class Exercise6StreamingRenderer {
  private chunks: StreamChunk[] = [];
  private startTime: number;

  constructor() { this.startTime = Date.now(); }

  async renderWithStreaming(
    components: Array<{ id: string; render: () => Promise<string>; suspenseFallback: string }>
  ): Promise<{ timeline: Array<{ time: number; event: string }>; finalContent: Record<string, string> }> {
    // TODO: Simulate streaming render — track timeline of events
    return { timeline: [], finalContent: {} };
  }
}

// ─── Exercise 7: Implement ──────────────────────────────────────────────────
function exercise7SkeletonMatcher(
  finalLayout: Array<{ id: string; width: number; height: number; type: 'text' | 'image' | 'card' }>,
): Array<{ id: string; skeleton: string }> {
  // TODO: Generate skeleton placeholders matching the final layout
  return [];
}

// ─── Exercise 8: Implement ──────────────────────────────────────────────────
async function exercise8ParallelStreaming(
  streams: Array<{ id: string; generator: AsyncGenerator<string> }>,
  onChunk: (id: string, chunk: string) => void
): Promise<Record<string, string[]>> {
  // TODO: Consume multiple async generators in parallel
  return {};
}

// ─── Exercise 9: Implement ──────────────────────────────────────────────────
function exercise9LoadingTsxSimulator(
  segments: Array<{ path: string; hasLoading: boolean; pageLoadMs: number }>,
  url: string
): { immediateContent: string[]; streamedContent: Array<{ segment: string; appearsAt: number }> } {
  // TODO: Simulate loading.tsx behavior for a URL
  return { immediateContent: [], streamedContent: [] };
}

// ─── Exercise 10: Implement ─────────────────────────────────────────────────
class Exercise10SuspenseTree {
  private nodes: Array<{ id: string; parentId: string | null; resolveMs: number; fallback: string }> = [];

  addNode(id: string, parentId: string | null, resolveMs: number, fallback: string): void {}

  async simulate(): Promise<Array<{ time: number; event: 'show-fallback' | 'show-content'; nodeId: string }>> {
    // TODO: Simulate the full Suspense tree resolution
    return [];
  }
}

// ─── Exercise 11: Implement ─────────────────────────────────────────────────
async function exercise11WaterfallDetector(
  fetches: Array<{ id: string; dependsOn?: string; durationMs: number }>,
): Promise<{ totalTime: number; isWaterfall: boolean; parallelTime: number; suggestion: string }> {
  // TODO: Detect sequential waterfall vs parallel fetching
  return { totalTime: 0, isWaterfall: false, parallelTime: 0, suggestion: '' };
}

// ─── Exercise 12: Implement ─────────────────────────────────────────────────
async function exercise12ChunkedResponse(
  data: string[],
  chunkSize: number,
  delayMs: number
): Promise<AsyncGenerator<string>> {
  // TODO: Create a chunked response generator (simulate Transfer-Encoding: chunked)
  async function* gen(): AsyncGenerator<string> {
    for (let i = 0; i < data.length; i += chunkSize) {
      yield data.slice(i, i + chunkSize).join('');
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return gen();
}

// ─── Exercise 13: Implement ─────────────────────────────────────────────────
function exercise13OptimalBoundaries(
  components: Array<{ id: string; fetchTimeMs: number; importance: 'critical' | 'high' | 'low' }>,
): Array<{ boundaryId: string; children: string[]; reason: string }> {
  // TODO: Suggest optimal Suspense boundary placement
  return [];
}

// ─── Exercise 14: Implement ─────────────────────────────────────────────────
async function exercise14StreamWithTimeout<T>(
  generator: AsyncGenerator<T>,
  timeoutMs: number,
  fallback: T
): Promise<T[]> {
  // TODO: Consume generator with timeout — use fallback if chunk takes too long
  return [];
}

// ─── Exercise 15: Implement ─────────────────────────────────────────────────
class Exercise15StreamingPageRenderer {
  async renderPage(
    layout: { content: string },
    sections: Array<{ id: string; fetchMs: number; content: string; fallback: string }>
  ): Promise<{
    shellSentAt: number;
    timeline: Array<{ time: number; section: string; event: string }>;
    totalTime: number;
  }> {
    // TODO: Full page streaming simulation
    return { shellSentAt: 0, timeline: [], totalTime: 0 };
  }
}

export {
  exercise1, exercise2StreamChunks, Exercise3SuspenseSimulator,
  exercise4ProgressiveRender, exercise5, Exercise6StreamingRenderer,
  exercise7SkeletonMatcher, exercise8ParallelStreaming,
  exercise9LoadingTsxSimulator, Exercise10SuspenseTree,
  exercise11WaterfallDetector, exercise12ChunkedResponse,
  exercise13OptimalBoundaries, exercise14StreamWithTimeout,
  Exercise15StreamingPageRenderer,
};
