/**
 * WebSockets & Realtime — Solutions
 * 15 exercises: 5 predict, 3 fix, 7 implement
 *
 * Run: npx tsx solutions.ts
 * Config: ES2022, strict, ESNext modules
 */

// ============================================================================
// TYPES
// ============================================================================

type ConnectionState = "connecting" | "open" | "closing" | "closed";
type RealtimeTech = "polling" | "long-polling" | "sse" | "websocket" | "webrtc";

interface WsMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

interface WsFrame {
  opcode: "text" | "binary" | "ping" | "pong" | "close";
  payload: string;
  fin: boolean;
}

interface SseEvent {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

interface PubSubSystem {
  subscribe: (channel: string, handler: (message: string) => void) => () => void;
  publish: (channel: string, message: string) => void;
  channelCount: () => number;
  subscriberCount: (channel: string) => number;
}

interface ReconnectionConfig {
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
  jitter: boolean;
}

interface MessageConnection {
  send: (type: string, payload: unknown) => void;
  onMessage: (handler: (message: WsMessage) => void) => void;
  getHistory: () => WsMessage[];
  getState: () => ConnectionState;
  close: () => void;
}

interface RoomRouter {
  join: (userId: string, room: string) => void;
  leave: (userId: string, room: string) => void;
  broadcast: (room: string, message: string, excludeUserId?: string) => string[];
  getRoomMembers: (room: string) => string[];
  getUserRooms: (userId: string) => string[];
}

interface HeartbeatMonitor {
  receivePing: (userId: string, timestamp: number) => void;
  getOnlineUsers: (currentTime: number) => string[];
  getLastSeen: (userId: string) => number | null;
  isOnline: (userId: string, currentTime: number) => boolean;
}

// ============================================================================
// Helpers
// ============================================================================

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n--- ${name} ---`);
}

// ============================================================================
// SOLUTION 1: Predict Tech
// ============================================================================

function solution1_predictTech(): Record<string, RealtimeTech> {
  return {
    A: "sse",
    B: "websocket",
    C: "polling",
    D: "webrtc",
    E: "websocket",
    F: "polling",
    G: "websocket",
  };
}

// ============================================================================
// SOLUTION 2: Predict Lifecycle
// ============================================================================

function solution2_predictLifecycle(): string[] {
  return ["open", "message", "close"];
}

// ============================================================================
// SOLUTION 3: Predict SSE Reconnect
// ============================================================================

function solution3_predictSseReconnect(): Record<string, string> {
  return {
    A: "yes",
    B: "Last-Event-ID",
    C: "42",
    D: "5000ms",
  };
}

// ============================================================================
// SOLUTION 4: Predict Overhead
// ============================================================================

function solution4_predictOverhead(): Record<string, string> {
  return {
    A: "~200-500KB",
    B: "~2-6KB",
    C: "websocket",
    D: "http",
  };
}

// ============================================================================
// SOLUTION 5: Predict Scaling
// ============================================================================

function solution5_predictScaling(): Record<string, string> {
  return {
    A: "no",
    B: "pub/sub with Redis",
    C: "all connections on Server 1 are lost, clients must reconnect",
    D: "routes same user to same server, but limits scaling and failover",
  };
}

// ============================================================================
// SOLUTION 6: Fix Message Handler
// ============================================================================

function solution6_fixMessageHandler(rawMessages: string[]): WsMessage[] {
  const parsed: WsMessage[] = [];

  for (const raw of rawMessages) {
    try {
      const message = JSON.parse(raw);
      // Validate structure
      if (
        typeof message.type === "string" &&
        "payload" in message &&
        typeof message.timestamp === "number"
      ) {
        parsed.push(message as WsMessage);
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return parsed;
}

// ============================================================================
// SOLUTION 7: Fix Reconnection
// ============================================================================

function solution7_fixReconnection(): number[] {
  const delays: number[] = [];
  let delay = 1000;
  const maxDelay = 10000;
  const multiplier = 2;

  for (let attempt = 0; attempt < 5; attempt++) {
    delays.push(delay);
    delay = delay * multiplier; // FIX: multiply
    delay = Math.min(delay, maxDelay); // FIX: Math.min to cap
  }

  return delays;
}

// ============================================================================
// SOLUTION 8: Fix SSE Parser
// ============================================================================

function solution8_fixSseParser(raw: string): SseEvent[] {
  const events: SseEvent[] = [];
  const rawEvents = raw.split("\n\n"); // FIX: split on double newline

  for (const rawEvent of rawEvents) {
    if (!rawEvent.trim()) continue;

    const event: Partial<SseEvent> & { dataLines?: string[] } = { dataLines: [] };
    const lines = rawEvent.split("\n"); // FIX: split on newline

    for (const line of lines) {
      if (line.startsWith(":")) continue; // Comments

      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const field = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      switch (field) {
        case "data":
          event.dataLines!.push(value);
          break;
        case "event":
          event.event = value;
          break;
        case "id":
          event.id = value;
          break;
        case "retry":
          event.retry = parseInt(value, 10);
          break;
      }
    }

    if (event.dataLines!.length > 0) {
      const finalEvent: SseEvent = { data: event.dataLines!.join("\n") };
      if (event.event) finalEvent.event = event.event;
      if (event.id) finalEvent.id = event.id;
      if (event.retry !== undefined) finalEvent.retry = event.retry;
      events.push(finalEvent);
    }
  }

  return events;
}

// ============================================================================
// SOLUTION 9: WebSocket-like Message System
// ============================================================================

function solution9_createConnection(): {
  client: MessageConnection;
  server: MessageConnection;
} {
  let state: ConnectionState = "open";
  const clientHistory: WsMessage[] = [];
  const serverHistory: WsMessage[] = [];
  let clientHandler: ((message: WsMessage) => void) | null = null;
  let serverHandler: ((message: WsMessage) => void) | null = null;

  const client: MessageConnection = {
    send(type, payload) {
      if (state !== "open") throw new Error("Connection is closed");
      const msg: WsMessage = { type, payload, timestamp: Date.now() };
      serverHistory.push(msg);
      serverHandler?.(msg);
    },
    onMessage(handler) {
      clientHandler = handler;
    },
    getHistory: () => clientHistory,
    getState: () => state,
    close() {
      state = "closed";
    },
  };

  const server: MessageConnection = {
    send(type, payload) {
      if (state !== "open") throw new Error("Connection is closed");
      const msg: WsMessage = { type, payload, timestamp: Date.now() };
      clientHistory.push(msg);
      clientHandler?.(msg);
    },
    onMessage(handler) {
      serverHandler = handler;
    },
    getHistory: () => serverHistory,
    getState: () => state,
    close() {
      state = "closed";
    },
  };

  return { client, server };
}

// ============================================================================
// SOLUTION 10: SSE Event Stream Parser
// ============================================================================

function solution10_parseSseStream(stream: string): SseEvent[] {
  const events: SseEvent[] = [];
  const rawEvents = stream.split("\n\n");

  for (const rawEvent of rawEvents) {
    if (!rawEvent.trim()) continue;

    const lines = rawEvent.split("\n");
    const dataLines: string[] = [];
    let event: string | undefined;
    let id: string | undefined;
    let retry: number | undefined;

    for (const line of lines) {
      if (line.startsWith(":")) continue;

      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const field = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1).trimStart();

      switch (field) {
        case "data":
          dataLines.push(value);
          break;
        case "event":
          event = value;
          break;
        case "id":
          id = value;
          break;
        case "retry":
          retry = parseInt(value, 10);
          break;
      }
    }

    if (dataLines.length > 0) {
      const sseEvent: SseEvent = { data: dataLines.join("\n") };
      if (event) sseEvent.event = event;
      if (id) sseEvent.id = id;
      if (retry !== undefined) sseEvent.retry = retry;
      events.push(sseEvent);
    }
  }

  return events;
}

// ============================================================================
// SOLUTION 11: Pub/Sub System
// ============================================================================

function solution11_createPubSub(): PubSubSystem {
  const channels = new Map<string, Set<(message: string) => void>>();

  return {
    subscribe(channel, handler) {
      if (!channels.has(channel)) {
        channels.set(channel, new Set());
      }
      channels.get(channel)!.add(handler);

      return () => {
        const subs = channels.get(channel);
        if (subs) {
          subs.delete(handler);
          if (subs.size === 0) channels.delete(channel);
        }
      };
    },

    publish(channel, message) {
      const subs = channels.get(channel);
      if (subs) {
        for (const handler of subs) {
          handler(message);
        }
      }
    },

    channelCount: () => channels.size,

    subscriberCount(channel) {
      return channels.get(channel)?.size ?? 0;
    },
  };
}

// ============================================================================
// SOLUTION 12: Exponential Backoff with Jitter
// ============================================================================

function solution12_calculateBackoff(
  attempt: number,
  config: ReconnectionConfig
): number {
  const baseDelay = config.initialDelay * Math.pow(config.multiplier, attempt);
  let delay = Math.min(baseDelay, config.maxDelay);

  if (config.jitter) {
    delay = delay + delay * 0.15;
  }

  return delay;
}

// ============================================================================
// SOLUTION 13: WebSocket Frame Encoder
// ============================================================================

function solution13_encodeFrame(frame: WsFrame): string {
  const opcode = frame.opcode.toUpperCase();
  const fin = frame.fin ? 1 : 0;
  const prefix = `[${opcode}|FIN=${fin}]`;

  return frame.payload ? `${prefix} ${frame.payload}` : prefix;
}

// ============================================================================
// SOLUTION 14: Room-Based Message Router
// ============================================================================

function solution14_createRoomRouter(): RoomRouter {
  const rooms = new Map<string, Set<string>>(); // room → userIds
  const users = new Map<string, Set<string>>(); // userId → rooms

  return {
    join(userId, room) {
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room)!.add(userId);

      if (!users.has(userId)) users.set(userId, new Set());
      users.get(userId)!.add(room);
    },

    leave(userId, room) {
      rooms.get(room)?.delete(userId);
      if (rooms.get(room)?.size === 0) rooms.delete(room);

      users.get(userId)?.delete(room);
      if (users.get(userId)?.size === 0) users.delete(userId);
    },

    broadcast(room, _message, excludeUserId?) {
      const members = rooms.get(room);
      if (!members) return [];

      return [...members].filter((id) => id !== excludeUserId);
    },

    getRoomMembers(room) {
      return [...(rooms.get(room) ?? [])];
    },

    getUserRooms(userId) {
      return [...(users.get(userId) ?? [])];
    },
  };
}

// ============================================================================
// SOLUTION 15: Heartbeat Monitor
// ============================================================================

function solution15_createHeartbeatMonitor(timeoutMs: number): HeartbeatMonitor {
  const lastPings = new Map<string, number>();

  return {
    receivePing(userId, timestamp) {
      lastPings.set(userId, timestamp);
    },

    getOnlineUsers(currentTime) {
      const online: string[] = [];
      for (const [userId, lastPing] of lastPings) {
        if (currentTime - lastPing <= timeoutMs) {
          online.push(userId);
        }
      }
      return online;
    },

    getLastSeen(userId) {
      return lastPings.get(userId) ?? null;
    },

    isOnline(userId, currentTime) {
      const lastPing = lastPings.get(userId);
      if (lastPing === undefined) return false;
      return currentTime - lastPing <= timeoutMs;
    },
  };
}

// ============================================================================
// TEST RUNNER
// ============================================================================

console.log("=== WebSockets & Realtime — Solutions & Tests ===");

// Exercise 1
section("Exercise 1: Predict Tech");
const s1 = solution1_predictTech();
assert(s1.A === "sse", "Stock ticker = SSE");
assert(s1.B === "websocket", "Chat = WebSocket");
assert(s1.C === "polling", "Email check = polling");
assert(s1.D === "webrtc", "Video call = WebRTC");
assert(s1.E === "websocket", "Game = WebSocket");
assert(s1.G === "websocket", "Collab editing = WebSocket");

// Exercise 2
section("Exercise 2: Predict Lifecycle");
const s2 = solution2_predictLifecycle();
assert(s2.length === 3, "3 events");
assert(s2[0] === "open", "First: open");
assert(s2[1] === "message", "Second: message");
assert(s2[2] === "close", "Third: close");

// Exercise 3
section("Exercise 3: Predict SSE Reconnect");
const s3 = solution3_predictSseReconnect();
assert(s3.A === "yes", "Auto reconnect");
assert(s3.B === "Last-Event-ID", "Header name");
assert(s3.C === "42", "Last ID value");
assert(s3.D === "5000ms", "Retry delay");

// Exercise 4
section("Exercise 4: Predict Overhead");
const s4 = solution4_predictOverhead();
assert(s4.C === "websocket", "WS better for frequent small messages");
assert(s4.D === "http", "HTTP better for single request");

// Exercise 5
section("Exercise 5: Predict Scaling");
const s5 = solution5_predictScaling();
assert(s5.A === "no", "Can't cross-server without pub/sub");
assert(s5.B === "pub/sub with Redis", "Redis for cross-server");

// Exercise 6
section("Exercise 6: Fix Message Handler");
const msgs6 = solution6_fixMessageHandler([
  '{"type":"chat","payload":"hello","timestamp":1000}',
  "invalid json",
  '{"type":"ping","payload":null,"timestamp":2000}',
  '{"incomplete": true}',
]);
assert(msgs6.length === 2, "Only 2 valid messages");
assert(msgs6[0].type === "chat", "First = chat");
assert(msgs6[1].type === "ping", "Second = ping");

// Exercise 7
section("Exercise 7: Fix Reconnection");
const delays7 = solution7_fixReconnection();
assert(delays7[0] === 1000, "Start at 1000");
assert(delays7[1] === 2000, "Double to 2000");
assert(delays7[2] === 4000, "Double to 4000");
assert(delays7[3] === 8000, "Double to 8000");
assert(delays7[4] === 10000, "Capped at 10000");

// Exercise 8
section("Exercise 8: Fix SSE Parser");
const events8 = solution8_fixSseParser("event: notification\nid: 1\ndata: hello\n\ndata: world\n\n");
assert(events8.length === 2, "2 events");
assert(events8[0].event === "notification", "First has event type");
assert(events8[0].id === "1", "First has id");
assert(events8[0].data === "hello", "First data");
assert(events8[1].data === "world", "Second data");

// Exercise 9
section("Exercise 9: Message Connection");
const { client: c9, server: s9 } = solution9_createConnection();
const serverReceived9: WsMessage[] = [];
s9.onMessage((msg) => serverReceived9.push(msg));
c9.send("chat", { text: "Hello!" });
assert(serverReceived9.length === 1, "Server received 1 message");
assert(serverReceived9[0].type === "chat", "Message type = chat");

const clientReceived9: WsMessage[] = [];
c9.onMessage((msg) => clientReceived9.push(msg));
s9.send("reply", { text: "Hi back!" });
assert(clientReceived9.length === 1, "Client received 1 message");

c9.close();
assert(c9.getState() === "closed", "Client closed");
assert(s9.getState() === "closed", "Server closed");

// Exercise 10
section("Exercise 10: SSE Parser");
const ev10a = solution10_parseSseStream("data: hello\n\ndata: world\n\n");
assert(ev10a.length === 2, "2 events");
assert(ev10a[0].data === "hello", "First data");

const ev10b = solution10_parseSseStream("event: update\nid: 5\ndata: {\"x\":1}\n\n");
assert(ev10b[0].event === "update", "Event type");
assert(ev10b[0].id === "5", "Event id");

const ev10c = solution10_parseSseStream("data: line1\ndata: line2\n\n");
assert(ev10c[0].data === "line1\nline2", "Multi-line data");

const ev10d = solution10_parseSseStream(": comment\ndata: test\n\n");
assert(ev10d[0].data === "test", "Comment ignored");

// Exercise 11
section("Exercise 11: Pub/Sub");
const ps11 = solution11_createPubSub();
const received11: string[] = [];
const unsub11a = ps11.subscribe("chat", (msg) => received11.push("A:" + msg));
const unsub11b = ps11.subscribe("chat", (msg) => received11.push("B:" + msg));
ps11.subscribe("news", () => {});

assert(ps11.channelCount() === 2, "2 channels");
assert(ps11.subscriberCount("chat") === 2, "2 chat subscribers");

ps11.publish("chat", "hello");
assert(received11.length === 2, "Both received");
assert(received11[0] === "A:hello", "A received");
assert(received11[1] === "B:hello", "B received");

unsub11a();
assert(ps11.subscriberCount("chat") === 1, "1 subscriber after unsub");
ps11.publish("chat", "world");
assert(received11.length === 3, "Only B received");
assert(received11[2] === "B:world", "B got world");

unsub11b();
assert(ps11.channelCount() === 1, "Only news channel");

// Exercise 12
section("Exercise 12: Exponential Backoff");
const cfg12: ReconnectionConfig = { initialDelay: 1000, maxDelay: 30000, multiplier: 2, jitter: false };
assert(solution12_calculateBackoff(0, cfg12) === 1000, "Attempt 0 = 1000");
assert(solution12_calculateBackoff(1, cfg12) === 2000, "Attempt 1 = 2000");
assert(solution12_calculateBackoff(2, cfg12) === 4000, "Attempt 2 = 4000");
assert(solution12_calculateBackoff(5, cfg12) === 30000, "Attempt 5 = capped 30000");

const jcfg12 = { ...cfg12, jitter: true };
assert(solution12_calculateBackoff(0, jcfg12) === 1150, "With jitter = 1150");

// Exercise 13
section("Exercise 13: Frame Encoder");
assert(solution13_encodeFrame({ opcode: "text", payload: "hello", fin: true }) === "[TEXT|FIN=1] hello", "Text frame");
assert(solution13_encodeFrame({ opcode: "ping", payload: "", fin: true }) === "[PING|FIN=1]", "Ping frame");
assert(solution13_encodeFrame({ opcode: "close", payload: "1000", fin: true }) === "[CLOSE|FIN=1] 1000", "Close frame");
assert(solution13_encodeFrame({ opcode: "text", payload: "part", fin: false }) === "[TEXT|FIN=0] part", "Fragmented frame");

// Exercise 14
section("Exercise 14: Room Router");
const rr14 = solution14_createRoomRouter();
rr14.join("alice", "general");
rr14.join("bob", "general");
rr14.join("alice", "dev");
rr14.join("charlie", "dev");

assert(rr14.getRoomMembers("general").length === 2, "2 in general");
assert(rr14.getUserRooms("alice").length === 2, "Alice in 2 rooms");

const rcpt14 = rr14.broadcast("general", "hello");
assert(rcpt14.length === 2, "Broadcast to 2");

const filt14 = rr14.broadcast("general", "hello", "alice");
assert(filt14.length === 1, "Broadcast excluding alice");
assert(filt14[0] === "bob", "Only bob receives");

rr14.leave("bob", "general");
assert(rr14.getRoomMembers("general").length === 1, "1 in general after leave");

// Exercise 15
section("Exercise 15: Heartbeat Monitor");
const hb15 = solution15_createHeartbeatMonitor(5000);
hb15.receivePing("alice", 1000);
hb15.receivePing("bob", 2000);
hb15.receivePing("charlie", 3000);

assert(hb15.isOnline("alice", 4000) === true, "Alice online at 4000");
assert(hb15.isOnline("alice", 7000) === false, "Alice offline at 7000");

const online15a = hb15.getOnlineUsers(4000);
assert(online15a.length === 3, "All online at 4000");

const online15b = hb15.getOnlineUsers(8000);
assert(online15b.length === 1, "Only charlie at 8000");

assert(hb15.getLastSeen("alice") === 1000, "Alice last seen");
assert(hb15.getLastSeen("unknown") === null, "Unknown = null");

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests ===`);
if (failed > 0) process.exit(1);
