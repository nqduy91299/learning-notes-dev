// ============================================================================
// streaming-suspense: Solutions
// ============================================================================
// Run:  npx tsx 03-nextjs/03-advanced/streaming-suspense/solutions.ts
// ============================================================================

interface StreamChunk { id: string; content: string; resolvedAt: number; }

function solution1(): void {
  console.log("t=0:    Layout renders immediately, Skeleton shown (Suspense fallback)");
  console.log("t=0.1s: Same — layout visible, skeleton still showing");
  console.log("t=2s:   Page content streams in, replaces skeleton");
}

async function* solution2StreamChunks<T>(items: Array<{ data: T; delayMs: number }>): AsyncGenerator<{ data: T; index: number }> {
  for (let i = 0; i < items.length; i++) {
    await new Promise(r => setTimeout(r, items[i].delayMs));
    yield { data: items[i].data, index: i };
  }
}

class Solution3SuspenseSimulator {
  private boundaries = new Map<string, { fallback: string; children: Set<string> }>();
  private resolved = new Map<string, string>();

  addBoundary(id: string, fallback: string, children: string[]): void {
    this.boundaries.set(id, { fallback, children: new Set(children) });
  }

  async resolve(childId: string, content: string, delayMs: number): Promise<void> {
    await new Promise(r => setTimeout(r, delayMs));
    this.resolved.set(childId, content);
  }

  getVisibleContent(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [id, boundary] of this.boundaries) {
      const allResolved = [...boundary.children].every(c => this.resolved.has(c));
      result[id] = allResolved
        ? [...boundary.children].map(c => this.resolved.get(c)!).join('')
        : boundary.fallback;
    }
    return result;
  }
}

async function solution4ProgressiveRender(
  sections: Array<{ id: string; fetchData: () => Promise<string>; priority: number }>
) {
  const sorted = [...sections].sort((a, b) => a.priority - b.priority);
  const results: Array<{ id: string; content: string; resolvedOrder: number }> = [];
  const promises = sorted.map(async (section, _i) => {
    const content = await section.fetchData();
    results.push({ id: section.id, content, resolvedOrder: results.length + 1 });
  });
  await Promise.all(promises);
  return results;
}

function solution5(): void {
  console.log("t=0:      Fallback 'A' shown (outer Suspense)");
  console.log("t=100ms:  FastComponent resolves → outer shows FastComponent + fallback 'B'");
  console.log("t=2000ms: SlowComponent resolves → 'B' replaced with SlowComponent content");
}

class Solution6StreamingRenderer {
  async renderWithStreaming(
    components: Array<{ id: string; render: () => Promise<string>; suspenseFallback: string }>
  ) {
    const startTime = Date.now();
    const timeline: Array<{ time: number; event: string }> = [];
    const finalContent: Record<string, string> = {};

    timeline.push({ time: 0, event: 'Shell sent with fallbacks' });
    const promises = components.map(async (comp) => {
      const content = await comp.render();
      const time = Date.now() - startTime;
      timeline.push({ time, event: `${comp.id} resolved` });
      finalContent[comp.id] = content;
    });
    await Promise.all(promises);
    return { timeline, finalContent };
  }
}

function solution7SkeletonMatcher(
  finalLayout: Array<{ id: string; width: number; height: number; type: 'text' | 'image' | 'card' }>
) {
  return finalLayout.map(item => ({
    id: item.id,
    skeleton: item.type === 'text' ? `[████████ ${item.width}x${item.height}]`
      : item.type === 'image' ? `[▓▓▓▓▓▓ ${item.width}x${item.height}]`
      : `[╔══════╗ ${item.width}x${item.height}]`,
  }));
}

async function solution8ParallelStreaming(
  streams: Array<{ id: string; generator: AsyncGenerator<string> }>,
  onChunk: (id: string, chunk: string) => void
): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  await Promise.all(streams.map(async ({ id, generator }) => {
    results[id] = [];
    for await (const chunk of generator) {
      results[id].push(chunk);
      onChunk(id, chunk);
    }
  }));
  return results;
}

function solution9LoadingTsxSimulator(
  segments: Array<{ path: string; hasLoading: boolean; pageLoadMs: number }>,
  url: string
) {
  const matching = segments.filter(s => url === s.path || url.startsWith(s.path + '/'));
  const immediateContent: string[] = [];
  const streamedContent: Array<{ segment: string; appearsAt: number }> = [];
  for (const seg of matching) {
    if (seg.hasLoading) {
      immediateContent.push(`loading:${seg.path}`);
      streamedContent.push({ segment: seg.path, appearsAt: seg.pageLoadMs });
    } else {
      streamedContent.push({ segment: seg.path, appearsAt: seg.pageLoadMs });
    }
  }
  return { immediateContent, streamedContent };
}

class Solution10SuspenseTree {
  private nodes: Array<{ id: string; parentId: string | null; resolveMs: number; fallback: string }> = [];
  addNode(id: string, parentId: string | null, resolveMs: number, fallback: string): void {
    this.nodes.push({ id, parentId, resolveMs, fallback });
  }
  async simulate() {
    const events: Array<{ time: number; event: 'show-fallback' | 'show-content'; nodeId: string }> = [];
    events.push(...this.nodes.map(n => ({ time: 0, event: 'show-fallback' as const, nodeId: n.id })));
    const promises = this.nodes.map(async (node) => {
      await new Promise(r => setTimeout(r, node.resolveMs));
      events.push({ time: node.resolveMs, event: 'show-content', nodeId: node.id });
    });
    await Promise.all(promises);
    return events.sort((a, b) => a.time - b.time);
  }
}

async function solution11WaterfallDetector(
  fetches: Array<{ id: string; dependsOn?: string; durationMs: number }>
) {
  const independent = fetches.filter(f => !f.dependsOn);
  const dependent = fetches.filter(f => f.dependsOn);
  const parallelTime = Math.max(...fetches.map(f => f.durationMs));
  let totalTime = 0;
  const resolved = new Set<string>();
  // Simple simulation
  for (const f of independent) { totalTime = Math.max(totalTime, f.durationMs); resolved.add(f.id); }
  for (const f of dependent) { totalTime += f.durationMs; resolved.add(f.id); }
  const isWaterfall = dependent.length > 0;
  return {
    totalTime, isWaterfall, parallelTime,
    suggestion: isWaterfall ? 'Consider fetching in parallel with Promise.all' : 'Already parallel',
  };
}

async function solution12ChunkedResponse(data: string[], chunkSize: number, delayMs: number) {
  async function* gen(): AsyncGenerator<string> {
    for (let i = 0; i < data.length; i += chunkSize) {
      yield data.slice(i, i + chunkSize).join('');
      if (i + chunkSize < data.length) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return gen();
}

function solution13OptimalBoundaries(
  components: Array<{ id: string; fetchTimeMs: number; importance: 'critical' | 'high' | 'low' }>
) {
  const critical = components.filter(c => c.importance === 'critical');
  const high = components.filter(c => c.importance === 'high');
  const low = components.filter(c => c.importance === 'low');
  const boundaries: Array<{ boundaryId: string; children: string[]; reason: string }> = [];
  if (critical.length > 0) boundaries.push({ boundaryId: 'critical-boundary', children: critical.map(c => c.id), reason: 'Critical content — loads first, no fallback delay' });
  if (high.length > 0) boundaries.push({ boundaryId: 'high-boundary', children: high.map(c => c.id), reason: 'Important content — individual loading states' });
  if (low.length > 0) boundaries.push({ boundaryId: 'low-boundary', children: low.map(c => c.id), reason: 'Low priority — grouped loading state' });
  return boundaries;
}

async function solution14StreamWithTimeout<T>(generator: AsyncGenerator<T>, timeoutMs: number, fallback: T) {
  const results: T[] = [];
  const iterator = generator[Symbol.asyncIterator]();
  while (true) {
    const result = await Promise.race([
      iterator.next(),
      new Promise<{ done: true; value: T }>(r => setTimeout(() => r({ done: false as unknown as true, value: fallback }), timeoutMs)),
    ]);
    if (result.done) break;
    results.push(result.value);
  }
  return results;
}

class Solution15StreamingPageRenderer {
  async renderPage(
    layout: { content: string },
    sections: Array<{ id: string; fetchMs: number; content: string; fallback: string }>
  ) {
    const start = Date.now();
    const timeline: Array<{ time: number; section: string; event: string }> = [];
    timeline.push({ time: 0, section: 'layout', event: 'shell-sent' });
    sections.forEach(s => timeline.push({ time: 0, section: s.id, event: 'fallback-shown' }));
    const promises = sections.map(async (s) => {
      await new Promise(r => setTimeout(r, s.fetchMs));
      timeline.push({ time: Date.now() - start, section: s.id, event: 'content-streamed' });
    });
    await Promise.all(promises);
    return { shellSentAt: 0, timeline: timeline.sort((a, b) => a.time - b.time), totalTime: Date.now() - start };
  }
}

// ─── Runner ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Exercise 1 ==="); solution1();

  console.log("\n=== Exercise 2: Stream Chunks ===");
  for await (const chunk of solution2StreamChunks([{ data: 'a', delayMs: 10 }, { data: 'b', delayMs: 10 }])) {
    console.log(chunk);
  }

  console.log("\n=== Exercise 3: Suspense Simulator ===");
  const sim = new Solution3SuspenseSimulator();
  sim.addBoundary('main', 'Loading...', ['content']);
  console.log("Before:", sim.getVisibleContent());
  await sim.resolve('content', 'Hello World', 10);
  console.log("After:", sim.getVisibleContent());

  console.log("\n=== Exercise 4: Progressive Render ===");
  console.log(await solution4ProgressiveRender([
    { id: 'slow', fetchData: () => new Promise(r => setTimeout(() => r('slow-data'), 50)), priority: 2 },
    { id: 'fast', fetchData: () => Promise.resolve('fast-data'), priority: 1 },
  ]));

  console.log("\n=== Exercise 5 ==="); solution5();

  console.log("\n=== Exercise 6: Streaming Renderer ===");
  const renderer = new Solution6StreamingRenderer();
  console.log(await renderer.renderWithStreaming([
    { id: 'header', render: () => Promise.resolve('Header Content'), suspenseFallback: 'Loading header...' },
    { id: 'main', render: () => new Promise(r => setTimeout(() => r('Main Content'), 50)), suspenseFallback: 'Loading...' },
  ]));

  console.log("\n=== Exercise 7: Skeleton Matcher ===");
  console.log(solution7SkeletonMatcher([
    { id: 'title', width: 200, height: 24, type: 'text' },
    { id: 'avatar', width: 48, height: 48, type: 'image' },
  ]));

  console.log("\n=== Exercise 11: Waterfall Detector ===");
  console.log(await solution11WaterfallDetector([
    { id: 'user', durationMs: 100 },
    { id: 'posts', dependsOn: 'user', durationMs: 200 },
  ]));

  console.log("\n=== Exercise 13: Optimal Boundaries ===");
  console.log(solution13OptimalBoundaries([
    { id: 'nav', fetchTimeMs: 0, importance: 'critical' },
    { id: 'content', fetchTimeMs: 500, importance: 'high' },
    { id: 'sidebar', fetchTimeMs: 1000, importance: 'low' },
  ]));

  console.log("\n=== Exercise 15: Full Page Render ===");
  const pageRenderer = new Solution15StreamingPageRenderer();
  console.log(await pageRenderer.renderPage(
    { content: '<html>' },
    [{ id: 'hero', fetchMs: 10, content: 'Hero!', fallback: 'Loading hero...' },
     { id: 'feed', fetchMs: 50, content: 'Feed!', fallback: 'Loading feed...' }]
  ));
}
main().catch(console.error);
