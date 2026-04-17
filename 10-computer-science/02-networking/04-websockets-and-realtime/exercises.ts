/**
 * WebSockets & Realtime — Exercises
 * 15 exercises: 5 predict, 3 fix, 7 implement
 *
 * Run: npx tsx exercises.ts
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
  fin: boolean; // Final frame of message
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

// ============================================================================
// EXERCISE 1 (Predict): Choose the Right Technology
// ============================================================================

function exercise1_predictTech(): Record<string, RealtimeTech> {
  // Choose the best realtime technology for each scenario:
  //
  // A: Live stock price ticker (server sends prices, client only displays)
  // B: Chat application (both sides send messages)
  // C: Checking for new emails every 60 seconds
  // D: Video call between two users
  // E: Live multiplayer game (low-latency bidirectional)
  // F: News feed that updates every few minutes
  // G: Collaborative document editing

  return {
    A: "polling",  // TODO
    B: "polling",  // TODO
    C: "polling",  // TODO
    D: "polling",  // TODO
    E: "polling",  // TODO
    F: "polling",  // TODO
    G: "polling",  // TODO
  };
}

// Tests:
// A: "sse" (one-way server→client, text data)
// B: "websocket" (bidirectional)
// C: "polling" (low frequency, simple)
// D: "webrtc" (peer-to-peer audio/video)
// E: "websocket" (bidirectional, low latency)
// F: "sse" or "polling" (low frequency, one-way)
// G: "websocket" (bidirectional, frequent updates)

// ============================================================================
// EXERCISE 2 (Predict): WebSocket Lifecycle
// ============================================================================

function exercise2_predictLifecycle(): string[] {
  // What events fire (in order) for this WebSocket interaction?
  //
  // const ws = new WebSocket('wss://example.com/chat');
  // // ... connection establishes
  // ws.send('hello');
  // // ... server sends 'world' back
  // ws.close(1000, 'Done');
  // // ... connection closes cleanly
  //
  // List the events in order (e.g., "open", "message", "close", etc.)

  return []; // TODO: list events in order
}

// Tests:
// Expected: ["open", "message", "close"]
// Note: ws.send doesn't trigger an event on the sender
// "open" fires when connection established
// "message" fires when server sends 'world'
// "close" fires when connection closes

// ============================================================================
// EXERCISE 3 (Predict): SSE Reconnection Behavior
// ============================================================================

function exercise3_predictSseReconnect(): Record<string, string> {
  // An EventSource is connected and receiving events:
  //
  // event: notification
  // id: 42
  // data: {"text": "Hello"}
  //
  // The connection drops. What happens?
  //
  // A: Does the browser automatically reconnect?
  // B: What header does the browser send on reconnection?
  // C: What value does that header contain?
  // D: If the server sent "retry: 5000", how long before reconnection?

  return {
    A: "",  // TODO
    B: "",  // TODO
    C: "",  // TODO
    D: "",  // TODO
  };
}

// Tests:
// A: "yes" (automatic reconnection is built into EventSource)
// B: "Last-Event-ID"
// C: "42" (the last id received)
// D: "5000ms" (5 seconds, as specified by retry field)

// ============================================================================
// EXERCISE 4 (Predict): WebSocket vs HTTP Overhead
// ============================================================================

function exercise4_predictOverhead(): Record<string, string> {
  // Compare overhead for sending 1000 small messages (each 20 bytes):
  //
  // A: Approximate total overhead with HTTP requests (headers ~200-500 bytes each)
  // B: Approximate total overhead with WebSocket frames (header ~2-6 bytes each)
  // C: Which is more efficient for frequent small messages?
  // D: Which is more efficient for a single large request?

  return {
    A: "",  // TODO: approximate total bytes of overhead
    B: "",  // TODO
    C: "",  // TODO
    D: "",  // TODO
  };
}

// Tests:
// A: "~200-500KB" (1000 × 200-500 bytes of HTTP headers)
// B: "~2-6KB" (1000 × 2-6 bytes of WebSocket frame headers)
// C: "websocket" (much less overhead per message)
// D: "http" (no need for persistent connection for single request)

// ============================================================================
// EXERCISE 5 (Predict): Connection Scaling
// ============================================================================

function exercise5_predictScaling(): Record<string, string> {
  // 10,000 users are connected to your chat application.
  // You have 3 server instances behind a load balancer.
  //
  // A: With round-robin load balancing, can User A (Server 1)
  //    send a message to User B (Server 2)?
  // B: What solution enables cross-server message delivery?
  // C: What happens to WebSocket connections if Server 1 crashes?
  // D: How do sticky sessions help (and what's their drawback)?

  return {
    A: "",  // TODO
    B: "",  // TODO
    C: "",  // TODO
    D: "",  // TODO
  };
}

// Tests:
// A: "no" (Server 1 doesn't know about Server 2's connections)
// B: "pub/sub with Redis" (or similar message broker)
// C: "all connections on Server 1 are lost, clients must reconnect"
// D: "routes same user to same server, but limits scaling and failover"

// ============================================================================
// EXERCISE 6 (Fix): Broken WebSocket Message Handler
// ============================================================================

function exercise6_fixMessageHandler(rawMessages: string[]): WsMessage[] {
  // This WebSocket message handler has bugs. Fix them.

  const parsed: WsMessage[] = [];

  for (const raw of rawMessages) {
    // BUG 1: Not handling JSON parse errors
    const message = JSON.parse(raw);

    // BUG 2: Not validating message structure
    parsed.push(message as WsMessage);
  }

  return parsed;
}

// Tests:
// const messages = exercise6_fixMessageHandler([
//   '{"type":"chat","payload":"hello","timestamp":1000}',
//   'invalid json',
//   '{"type":"ping","payload":null,"timestamp":2000}',
//   '{"incomplete": true}',
// ]);
// assert(messages.length === 2); // Only valid, complete messages
// assert(messages[0].type === "chat");
// assert(messages[1].type === "ping");

// ============================================================================
// EXERCISE 7 (Fix): Broken Reconnection Logic
// ============================================================================

function exercise7_fixReconnection(): number[] {
  // This reconnection with exponential backoff has bugs.
  // It should produce delays: 1000, 2000, 4000, 8000, 10000 (capped at max)
  // Fix the bugs.

  const delays: number[] = [];
  let delay = 1000;
  const maxDelay = 10000;
  const multiplier = 2;

  for (let attempt = 0; attempt < 5; attempt++) {
    delays.push(delay);
    delay = delay + multiplier; // BUG: Should multiply, not add
    delay = Math.max(delay, maxDelay); // BUG: Should be Math.min to cap
  }

  return delays;
}

// Tests:
// const delays = exercise7_fixReconnection();
// assert(delays[0] === 1000);
// assert(delays[1] === 2000);
// assert(delays[2] === 4000);
// assert(delays[3] === 8000);
// assert(delays[4] === 10000); // Capped at maxDelay

// ============================================================================
// EXERCISE 8 (Fix): Broken SSE Parser
// ============================================================================

function exercise8_fixSseParser(raw: string): SseEvent[] {
  // This SSE event parser has bugs. Fix them.
  // SSE format: events separated by double newlines, fields separated by single newlines.

  const events: SseEvent[] = [];
  const rawEvents = raw.split("\n"); // BUG: Should split on double newline "\n\n"

  for (const rawEvent of rawEvents) {
    if (!rawEvent.trim()) continue;

    const event: Partial<SseEvent> = {};
    const lines = rawEvent.split(","); // BUG: Should split on "\n"

    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;

      const field = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      switch (field) {
        case "data":
          event.data = value;
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

    if (event.data !== undefined) {
      events.push(event as SseEvent);
    }
  }

  return events;
}

// Tests:
// const sseData = "event: notification\nid: 1\ndata: hello\n\ndata: world\n\n";
// const events = exercise8_fixSseParser(sseData);
// assert(events.length === 2);
// assert(events[0].event === "notification");
// assert(events[0].id === "1");
// assert(events[0].data === "hello");
// assert(events[1].data === "world");

// ============================================================================
// EXERCISE 9 (Implement): WebSocket-like Message System
// ============================================================================

interface MessageConnection {
  send: (type: string, payload: unknown) => void;
  onMessage: (handler: (message: WsMessage) => void) => void;
  getHistory: () => WsMessage[];
  getState: () => ConnectionState;
  close: () => void;
}

function exercise9_createConnection(): {
  client: MessageConnection;
  server: MessageConnection;
} {
  // Create a simulated WebSocket-like connection between a client and server.
  //
  // Requirements:
  // 1. Both sides can send messages (bidirectional)
  // 2. Messages sent by one side are received by the other
  // 3. Each side maintains a message history (received messages)
  // 4. Connection starts "open" and can be closed
  // 5. Sending on a closed connection should throw an error
  // 6. Messages should include auto-generated timestamps (use Date.now())

  // TODO: Implement
  const stub: MessageConnection = {
    send: () => {},
    onMessage: () => {},
    getHistory: () => [],
    getState: () => "open",
    close: () => {},
  };

  return { client: { ...stub }, server: { ...stub } };
}

// Tests:
// const { client, server } = exercise9_createConnection();
// const serverReceived: WsMessage[] = [];
// server.onMessage((msg) => serverReceived.push(msg));
//
// client.send("chat", { text: "Hello!" });
// assert(serverReceived.length === 1);
// assert(serverReceived[0].type === "chat");
//
// const clientReceived: WsMessage[] = [];
// client.onMessage((msg) => clientReceived.push(msg));
// server.send("reply", { text: "Hi back!" });
// assert(clientReceived.length === 1);
//
// client.close();
// assert(client.getState() === "closed");
// assert(server.getState() === "closed");

// ============================================================================
// EXERCISE 10 (Implement): SSE Event Stream Parser
// ============================================================================

function exercise10_parseSseStream(stream: string): SseEvent[] {
  // Parse a raw SSE event stream string into structured events.
  //
  // SSE format rules:
  // - Events are separated by blank lines (\n\n)
  // - Each event has field:value lines
  // - Fields: data, event, id, retry
  // - Lines starting with ":" are comments (ignore)
  // - Multiple "data:" lines in one event are joined with "\n"
  //
  // Example:
  // "data: line1\ndata: line2\n\n" => [{ data: "line1\nline2" }]

  // TODO: Implement
  void stream;
  return [];
}

// Tests:
// const events1 = exercise10_parseSseStream("data: hello\n\ndata: world\n\n");
// assert(events1.length === 2);
// assert(events1[0].data === "hello");
//
// const events2 = exercise10_parseSseStream("event: update\nid: 5\ndata: {\"x\":1}\n\n");
// assert(events2[0].event === "update");
// assert(events2[0].id === "5");
//
// const events3 = exercise10_parseSseStream("data: line1\ndata: line2\n\n");
// assert(events3[0].data === "line1\nline2"); // Multi-line data
//
// const events4 = exercise10_parseSseStream(": comment\ndata: test\n\n");
// assert(events4[0].data === "test"); // Comment ignored

// ============================================================================
// EXERCISE 11 (Implement): Pub/Sub System
// ============================================================================

function exercise11_createPubSub(): PubSubSystem {
  // Implement a publish/subscribe system (used for scaling WebSockets).
  //
  // Requirements:
  // 1. subscribe(channel, handler) — returns an unsubscribe function
  // 2. publish(channel, message) — sends message to all subscribers of that channel
  // 3. channelCount() — number of active channels (with at least 1 subscriber)
  // 4. subscriberCount(channel) — number of subscribers on a channel
  // 5. Unsubscribing removes the handler; if last subscriber, remove the channel

  // TODO: Implement
  return {
    subscribe: (_channel, _handler) => () => {},
    publish: (_channel, _message) => {},
    channelCount: () => 0,
    subscriberCount: (_channel) => 0,
  };
}

// Tests:
// const pubsub = exercise11_createPubSub();
// const received: string[] = [];
// const unsub1 = pubsub.subscribe("chat", (msg) => received.push("A:" + msg));
// const unsub2 = pubsub.subscribe("chat", (msg) => received.push("B:" + msg));
// pubsub.subscribe("news", () => {});
//
// assert(pubsub.channelCount() === 2);
// assert(pubsub.subscriberCount("chat") === 2);
//
// pubsub.publish("chat", "hello");
// assert(received.length === 2);
// assert(received[0] === "A:hello");
// assert(received[1] === "B:hello");
//
// unsub1();
// assert(pubsub.subscriberCount("chat") === 1);
// pubsub.publish("chat", "world");
// assert(received.length === 3);
// assert(received[2] === "B:world");
//
// unsub2();
// assert(pubsub.channelCount() === 1); // Only "news" remains

// ============================================================================
// EXERCISE 12 (Implement): Exponential Backoff with Jitter
// ============================================================================

function exercise12_calculateBackoff(
  attempt: number,
  config: ReconnectionConfig
): number {
  // Calculate reconnection delay with exponential backoff and optional jitter.
  //
  // Formula: min(initialDelay * multiplier^attempt, maxDelay)
  // With jitter: add random value between 0 and delay * 0.3
  //
  // attempt is 0-indexed (first retry = attempt 0)
  //
  // For testing with jitter, return the base delay (before jitter) when jitter=false,
  // and a value in range [delay, delay * 1.3] when jitter=true.
  //
  // Note: For deterministic testing, when jitter=true just add delay * 0.15
  // (midpoint of jitter range) instead of random.

  // TODO: Implement
  void attempt;
  void config;
  return 0;
}

// Tests:
// const config: ReconnectionConfig = { initialDelay: 1000, maxDelay: 30000, multiplier: 2, jitter: false };
// assert(exercise12_calculateBackoff(0, config) === 1000);  // 1000 * 2^0
// assert(exercise12_calculateBackoff(1, config) === 2000);  // 1000 * 2^1
// assert(exercise12_calculateBackoff(2, config) === 4000);  // 1000 * 2^2
// assert(exercise12_calculateBackoff(5, config) === 30000); // Capped at maxDelay
//
// const jitterConfig = { ...config, jitter: true };
// assert(exercise12_calculateBackoff(0, jitterConfig) === 1150); // 1000 + 1000*0.15

// ============================================================================
// EXERCISE 13 (Implement): WebSocket Frame Encoder
// ============================================================================

function exercise13_encodeFrame(frame: WsFrame): string {
  // Encode a WebSocket frame into a simplified string representation.
  //
  // Format: "[OPCODE|FIN={0|1}] payload"
  //
  // Examples:
  // { opcode: "text", payload: "hello", fin: true }  => "[TEXT|FIN=1] hello"
  // { opcode: "ping", payload: "", fin: true }        => "[PING|FIN=1]"
  // { opcode: "close", payload: "1000", fin: true }   => "[CLOSE|FIN=1] 1000"
  // { opcode: "text", payload: "part1", fin: false }  => "[TEXT|FIN=0] part1"

  // TODO: Implement
  void frame;
  return "";
}

// Tests:
// assert(exercise13_encodeFrame({ opcode: "text", payload: "hello", fin: true }) === "[TEXT|FIN=1] hello");
// assert(exercise13_encodeFrame({ opcode: "ping", payload: "", fin: true }) === "[PING|FIN=1]");
// assert(exercise13_encodeFrame({ opcode: "close", payload: "1000", fin: true }) === "[CLOSE|FIN=1] 1000");
// assert(exercise13_encodeFrame({ opcode: "text", payload: "part", fin: false }) === "[TEXT|FIN=0] part");

// ============================================================================
// EXERCISE 14 (Implement): Room-Based Message Router
// ============================================================================

interface User {
  id: string;
  rooms: Set<string>;
}

interface RoomRouter {
  join: (userId: string, room: string) => void;
  leave: (userId: string, room: string) => void;
  broadcast: (room: string, message: string, excludeUserId?: string) => string[];
  getRoomMembers: (room: string) => string[];
  getUserRooms: (userId: string) => string[];
}

function exercise14_createRoomRouter(): RoomRouter {
  // Implement a room-based message router (like Socket.IO rooms).
  //
  // Requirements:
  // 1. Users can join/leave rooms
  // 2. broadcast(room, message) returns list of userIds that would receive it
  // 3. broadcast with excludeUserId skips that user (sender doesn't get their own message)
  // 4. getRoomMembers lists all users in a room
  // 5. getUserRooms lists all rooms a user is in

  // TODO: Implement
  return {
    join: () => {},
    leave: () => {},
    broadcast: () => [],
    getRoomMembers: () => [],
    getUserRooms: () => [],
  };
}

// Tests:
// const router = exercise14_createRoomRouter();
// router.join("alice", "general");
// router.join("bob", "general");
// router.join("alice", "dev");
// router.join("charlie", "dev");
//
// assert(router.getRoomMembers("general").length === 2);
// assert(router.getUserRooms("alice").length === 2);
//
// const recipients = router.broadcast("general", "hello");
// assert(recipients.length === 2);
//
// const filtered = router.broadcast("general", "hello", "alice");
// assert(filtered.length === 1);
// assert(filtered[0] === "bob");
//
// router.leave("bob", "general");
// assert(router.getRoomMembers("general").length === 1);

// ============================================================================
// EXERCISE 15 (Implement): Heartbeat Monitor
// ============================================================================

interface HeartbeatMonitor {
  receivePing: (userId: string, timestamp: number) => void;
  getOnlineUsers: (currentTime: number) => string[];
  getLastSeen: (userId: string) => number | null;
  isOnline: (userId: string, currentTime: number) => boolean;
}

function exercise15_createHeartbeatMonitor(timeoutMs: number): HeartbeatMonitor {
  // Implement a heartbeat monitor for tracking user presence.
  //
  // Requirements:
  // 1. receivePing(userId, timestamp) — record a heartbeat
  // 2. getOnlineUsers(currentTime) — return users whose last ping is within timeoutMs
  // 3. getLastSeen(userId) — return timestamp of last ping, null if never seen
  // 4. isOnline(userId, currentTime) — true if last ping within timeoutMs

  // TODO: Implement
  void timeoutMs;
  return {
    receivePing: () => {},
    getOnlineUsers: () => [],
    getLastSeen: () => null,
    isOnline: () => false,
  };
}

// Tests:
// const monitor = exercise15_createHeartbeatMonitor(5000); // 5 second timeout
// monitor.receivePing("alice", 1000);
// monitor.receivePing("bob", 2000);
// monitor.receivePing("charlie", 3000);
//
// assert(monitor.isOnline("alice", 4000) === true);  // 4000 - 1000 = 3000 < 5000
// assert(monitor.isOnline("alice", 7000) === false);  // 7000 - 1000 = 6000 > 5000
//
// const online = monitor.getOnlineUsers(4000);
// assert(online.length === 3); // All within timeout
//
// const online2 = monitor.getOnlineUsers(8000);
// assert(online2.length === 1); // Only charlie (8000 - 3000 = 5000, still within)
//
// assert(monitor.getLastSeen("alice") === 1000);
// assert(monitor.getLastSeen("unknown") === null);

// ============================================================================
// RUNNER
// ============================================================================

console.log("=== WebSockets & Realtime Exercises ===\n");

console.log("Exercise 1 (Predict - Tech):", exercise1_predictTech());
console.log("Exercise 2 (Predict - Lifecycle):", exercise2_predictLifecycle());
console.log("Exercise 3 (Predict - SSE Reconnect):", exercise3_predictSseReconnect());
console.log("Exercise 4 (Predict - Overhead):", exercise4_predictOverhead());
console.log("Exercise 5 (Predict - Scaling):", exercise5_predictScaling());
console.log("Exercise 6 (Fix - Message Handler):", exercise6_fixMessageHandler(['{"type":"test","payload":null,"timestamp":0}']));
console.log("Exercise 7 (Fix - Reconnection):", exercise7_fixReconnection());
console.log("Exercise 8 (Fix - SSE Parser):", exercise8_fixSseParser("data: test\n\n"));
console.log("Exercise 9 (Implement - Connection):", exercise9_createConnection());
console.log("Exercise 10 (Implement - SSE Parser):", exercise10_parseSseStream("data: test\n\n"));
console.log("Exercise 11 (Implement - PubSub):", exercise11_createPubSub());
console.log("Exercise 12 (Implement - Backoff):", exercise12_calculateBackoff(0, { initialDelay: 1000, maxDelay: 30000, multiplier: 2, jitter: false }));
console.log("Exercise 13 (Implement - Frame):", exercise13_encodeFrame({ opcode: "text", payload: "hi", fin: true }));
console.log("Exercise 14 (Implement - Rooms):", exercise14_createRoomRouter());
console.log("Exercise 15 (Implement - Heartbeat):", exercise15_createHeartbeatMonitor(5000));

console.log("\nDone! Implement the TODOs and check against solutions.ts");
